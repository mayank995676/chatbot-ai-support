import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/history
// Returns all chats, or the message history for a specific chatId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get("chatId");

    if (chatId) {
      const chat = await prisma.chat.findUnique({
        where: { id: chatId },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!chat) {
        return NextResponse.json({ error: "Chat session not found." }, { status: 404 });
      }

      return NextResponse.json(chat);
    }

    // List all chats, sorted by last update
    const chats = await prisma.chat.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: { messages: true },
        },
      },
    });

    return NextResponse.json(chats);
  } catch (error: any) {
    console.error("History GET Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve chat history." },
      { status: 500 }
    );
  }
}

// POST /api/history
// Creates a new empty chat session
export async function POST() {
  try {
    const newChat = await prisma.chat.create({
      data: {
        title: "New Chat",
      },
    });
    return NextResponse.json(newChat);
  } catch (error: any) {
    console.error("History POST Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create new chat session." },
      { status: 500 }
    );
  }
}

// DELETE /api/history
// Deletes a specific chat session
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get("chatId");

    if (!chatId) {
      return NextResponse.json({ error: "Chat ID is required." }, { status: 400 });
    }

    await prisma.chat.delete({
      where: { id: chatId },
    });

    return NextResponse.json({ success: true, message: "Chat deleted successfully." });
  } catch (error: any) {
    console.error("History DELETE Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete chat session." },
      { status: 500 }
    );
  }
}
