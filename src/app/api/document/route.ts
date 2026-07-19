import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/document
// Returns the list of all uploaded knowledge base documents
export async function GET() {
  try {
    const documents = await prisma.document.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { chunks: true },
        },
      },
    });

    return NextResponse.json(documents);
  } catch (error: any) {
    console.error("Document GET Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve documents." },
      { status: 500 }
    );
  }
}

// DELETE /api/document
// Deletes a specific document by ID (cascades to chunks)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Document ID is required." }, { status: 400 });
    }

    // Delete the document. Chunks are cascade-deleted due to the schema relation.
    await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Document deleted successfully." });
  } catch (error: any) {
    console.error("Document DELETE Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete document." },
      { status: 500 }
    );
  }
}
