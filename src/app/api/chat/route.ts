import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { searchChunksTfIdf } from "@/lib/vector";

export const maxDuration = 30; // 30 seconds max execution timeout

export async function POST(request: NextRequest) {
  try {
    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    if (!geminiKey || !groqKey) {
      return NextResponse.json(
        { error: "API Keys (Gemini & Groq) are not fully configured on the server. Please check your .env file." },
        { status: 500 }
      );
    }

    const { message, chatId } = await request.json();
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message content is required." }, { status: 400 });
    }

    // 1. Resolve Chat Session
    let activeChatId = chatId;
    let chatTitle = "New Chat";
    
    if (activeChatId) {
      const existingChat = await prisma.chat.findUnique({
        where: { id: activeChatId },
      });
      if (!existingChat) {
        activeChatId = undefined;
      } else {
        chatTitle = existingChat.title;
      }
    }

    if (!activeChatId) {
      const sliceTitle = message.trim().slice(0, 30);
      chatTitle = sliceTitle.length < message.trim().length ? `${sliceTitle}...` : sliceTitle;
      
      const newChat = await prisma.chat.create({
        data: {
          title: chatTitle,
        },
      });
      activeChatId = newChat.id;
    }

    // 2. Fetch all Chunks for Relevance Search
    const allChunks = await prisma.chunk.findMany({
      select: {
        content: true,
      },
    });

    let retrievedContext = "";
    if (allChunks.length > 0) {
      retrievedContext = searchChunksTfIdf(message.trim(), allChunks);
    }

    // 3. Save User Message
    await prisma.message.create({
      data: {
        chatId: activeChatId,
        role: "user",
        content: message.trim(),
      },
    });

    // 4. Construct System Instruction Prompt
    const systemPrompt = `You are a professional, helpful customer support AI assistant for White Rabbit AI Solutions. 
Your primary task is to answer the user's questions.

Strict constraints:
1. You must answer the user's question ONLY using the provided company document context below.
2. If the answer to the user's question cannot be found or reasonably inferred from the provided context, you MUST respond EXACTLY with: "I'm sorry, I couldn't find that information in the provided company documents."
3. If the user greets you (e.g. "hi", "hello", "hey", "good morning"), respond with a warm, professional greeting, introduce yourself as the support assistant for White Rabbit AI Solutions, and ask how you can help. Do NOT return the "I'm sorry" message for simple greetings.
4. Do NOT make up facts. Do NOT hallucinate. Do NOT mention any outside knowledge.
5. Keep the tone helpful, professional, and direct.

Provided Company Document Context:
${retrievedContext ? retrievedContext : "NO COMPANY DOCUMENTS ARE UPLOADED YET."}
`;

    // 5. Fetch Chat History (Limit to last 15 messages)
    const chatHistory = await prisma.message.findMany({
      where: { chatId: activeChatId },
      orderBy: { createdAt: "asc" },
      take: 15,
    });

    // 6. Format Messages in standard OpenAI format for Groq
    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...chatHistory.map((msg: { role: string; content: string }) => ({
        role: (msg.role === "user" || msg.role === "assistant" || msg.role === "system" ? msg.role : "user") as "user" | "assistant" | "system",
        content: msg.content,
      })),
    ];

    // 7. Call Groq Chat Completions API (llama-3.3-70b-versatile)
    const chatRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: apiMessages,
          temperature: 0.1,
          max_tokens: 1000
        }),
      }
    );

    if (!chatRes.ok) {
      const errText = await chatRes.text();
      console.error("Groq Chat API call failed:", errText);
      throw new Error(`Groq Chat API Error: ${errText}`);
    }

    const chatData = await chatRes.json();
    const assistantReply = chatData.choices?.[0]?.message?.content || "I'm sorry, I couldn't process your request.";

    // 8. Save Assistant Message
    await prisma.message.create({
      data: {
        chatId: activeChatId,
        role: "assistant",
        content: assistantReply,
      },
    });

    return NextResponse.json({
      chatId: activeChatId,
      chatTitle,
      message: assistantReply,
    });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred while generating the chatbot response." },
      { status: 500 }
    );
  }
}
