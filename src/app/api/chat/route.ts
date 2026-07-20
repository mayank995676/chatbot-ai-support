import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { searchChunksTfIdf, searchWebFallback } from "@/lib/vector";

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

    // Web fallback if no matching context is found in local documents
    let isWebFallback = false;
    if (!retrievedContext) {
      const webMatches = await searchWebFallback(message.trim());
      if (webMatches) {
        retrievedContext = webMatches;
        isWebFallback = true;
      }
    }

    // 3. Save User Message
    await prisma.message.create({
      data: {
        chatId: activeChatId,
        role: "user",
        content: message.trim(),
      },
    });

    // Fetch custom settings from database, fall back to defaults
    let dbSettings = await prisma.agentSetting.findUnique({
      where: { id: "default" },
    });

    const activeModel = dbSettings?.modelName || "llama-3.3-70b-versatile";
    const activeTemp = dbSettings?.temperature ?? 0.1;
    const configuredSystemPrompt = dbSettings?.systemPrompt || `You are a professional, helpful customer support AI assistant for White Rabbit AI Solutions. 
Your primary task is to answer the user's questions.

Strict constraints:
1. Prioritize answering the user's questions using the provided company document context below.
2. If the answer cannot be found in the provided context, answer the user's question using your general knowledge or general web results, keeping a helpful, professional customer support tone.
3. Do NOT refuse to answer. Do NOT show "I'm sorry, I couldn't find..." unless the question is completely nonsensical.
4. Keep the tone helpful, professional, and direct.`;

    // 4. Construct System Instruction Prompt
    const systemPrompt = isWebFallback
      ? `You are a professional, helpful customer support AI assistant for White Rabbit AI Solutions. 
Your primary task is to answer the user's questions.

Strict constraints:
1. Answer the user's question accurately using the provided web search context or your general knowledge.
2. Keep the tone helpful, professional, and direct.

Provided Web Search Context:
${retrievedContext}
`
      : `${configuredSystemPrompt}

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

    // 7. Call Groq Chat Completions API
    const chatRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: activeModel,
          messages: apiMessages,
          temperature: activeTemp,
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
