const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
require("dotenv").config();

// Simple in-script chunker matching our client-side logic
function chunkText(text, chunkSize = 1000, chunkOverlap = 200) {
  const cleanText = text.replace(/\r\n/g, "\n").replace(/\s+/g, " ");
  const chunks = [];
  
  if (cleanText.length <= chunkSize) {
    return [cleanText.trim()];
  }
  
  let startIndex = 0;
  while (startIndex < cleanText.length) {
    let endIndex = startIndex + chunkSize;
    
    if (endIndex < cleanText.length) {
      const lastSpace = cleanText.lastIndexOf(" ", endIndex);
      if (lastSpace > startIndex + (chunkSize * 0.75)) {
        endIndex = lastSpace;
      }
    }
    
    const chunk = cleanText.substring(startIndex, endIndex).trim();
    if (chunk) {
      chunks.push(chunk);
    }
    
    startIndex = endIndex - chunkOverlap;
    if (startIndex >= cleanText.length || endIndex >= cleanText.length) {
      break;
    }
  }
  return chunks.filter(c => c.length > 10);
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("ERROR: GEMINI_API_KEY is not defined in the .env file.");
    process.exit(1);
  }

  // 1. Read document
  const docPath = path.resolve(__dirname, "company-info.txt");
  if (!fs.existsSync(docPath)) {
    console.error(`ERROR: Document not found at ${docPath}`);
    process.exit(1);
  }
  const text = fs.readFileSync(docPath, "utf-8");
  console.log(`Successfully read company-info.txt (${text.length} chars).`);

  // 2. Chunk text
  const chunks = chunkText(text, 600, 150); // smaller chunk size for more granular context matching
  console.log(`Generated ${chunks.length} chunks.`);

  // 3. Skip external embedding API calls (local TF-IDF is used for search)
  console.log("Using local TF-IDF relevance indexing...");

  // 4. Initialize Database connection
  const { Pool } = require("pg");
  const { PrismaPg } = require("@prisma/adapter-pg");
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log("Writing knowledge base to Neon PostgreSQL database...");
  
  // Clean up any existing document of the same name to support re-runs
  const existingDocs = await prisma.document.findMany({
    where: { name: "company-info.txt" }
  });
  for (const doc of existingDocs) {
    await prisma.document.delete({ where: { id: doc.id } });
  }

  const dbDoc = await prisma.document.create({
    data: {
      name: "company-info.txt",
      type: "txt",
      size: fs.statSync(docPath).size,
    }
  });

  const chunkRecords = chunks.map((content) => ({
    documentId: dbDoc.id,
    content,
    embedding: "[]",
  }));

  await prisma.chunk.createMany({
    data: chunkRecords,
  });

  console.log("SUCCESS! Seeding complete. Document and vector chunks written to dev.db.");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
