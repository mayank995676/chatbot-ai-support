import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { chunkText } from "@/lib/vector";
import { parsePdf } from "@/lib/pdf";

export const maxDuration = 60; // 60 seconds max runtime

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API Key is not configured on the server. Please check your .env file." },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    // Limit size to 5MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File exceeds the maximum size limit of 5MB." },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();
    let text = "";
    let fileType: "pdf" | "txt" = "txt";

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (fileName.endsWith(".pdf")) {
      fileType = "pdf";
      try {
        text = await parsePdf(buffer);
      } catch (err) {
        console.error("PDF Parsing error:", err);
        return NextResponse.json(
          { error: "Could not parse PDF. Ensure it is not password protected or corrupted." },
          { status: 400 }
        );
      }
    } else if (fileName.endsWith(".txt")) {
      fileType = "txt";
      text = buffer.toString("utf-8");
    } else {
      return NextResponse.json(
        { error: "Unsupported file format. Please upload PDF or TXT only." },
        { status: 400 }
      );
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "The uploaded file contains no readable text content." },
        { status: 400 }
      );
    }

    // Chunk the text
    const chunks = chunkText(text);
    if (chunks.length === 0) {
      return NextResponse.json(
        { error: "Could not extract sufficient text chunks from the document." },
        { status: 400 }
      );
    }

    // Generate embeddings in batches of 100 via Gemini batchEmbedContents API
    const BATCH_SIZE = 100;
    const embeddings: number[][] = [];

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      const requests = batch.map((chunkText) => ({
        model: "models/gemini-embedding-2",
        content: {
          parts: [{ text: chunkText }]
        }
      }));

      const embedRes = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-embedding-2:batchEmbedContents?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requests }),
        }
      );

      if (!embedRes.ok) {
        const errText = await embedRes.text();
        console.error("Gemini Embedding API call failed:", errText);
        throw new Error(`Gemini Embedding API Error: ${errText}`);
      }

      const embedData = await embedRes.json();
      if (!embedData.embeddings || embedData.embeddings.length === 0) {
        throw new Error("Invalid or empty response returned from Gemini Embedding API.");
      }

      embeddings.push(...embedData.embeddings.map((emb: any) => emb.values));
    }

    // Save document to DB
    const dbDoc = await prisma.document.create({
      data: {
        name: file.name,
        type: fileType,
        size: file.size,
      },
    });

    // Save chunks to DB
    const chunkRecords = chunks.map((content, idx) => ({
      documentId: dbDoc.id,
      content,
      embedding: JSON.stringify(embeddings[idx]),
    }));

    await prisma.chunk.createMany({
      data: chunkRecords,
    });

    return NextResponse.json({
      success: true,
      document: {
        id: dbDoc.id,
        name: dbDoc.name,
        type: dbDoc.type,
        size: dbDoc.size,
        createdAt: dbDoc.createdAt,
        chunksCount: chunks.length,
      },
    });
  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during document upload." },
      { status: 500 }
    );
  }
}
