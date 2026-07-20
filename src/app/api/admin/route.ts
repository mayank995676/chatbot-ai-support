import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Fetch stats
    const chunkCount = await prisma.chunk.count();
    const docCount = await prisma.document.count();
    const chatCount = await prisma.chat.count();
    const messageCount = await prisma.message.count();

    // Fetch or create default settings
    let settings = await prisma.agentSetting.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await prisma.agentSetting.create({
        data: {
          id: "default",
          systemPrompt: `You are a professional, helpful customer support AI assistant for White Rabbit AI Solutions. 
Your primary task is to answer the user's questions.

Strict constraints:
1. Prioritize answering the user's questions using the provided company document context below.
2. If the answer cannot be found in the provided context, answer the user's question using your general knowledge or general web results, keeping a helpful, professional customer support tone.
3. Do NOT refuse to answer. Do NOT show "I'm sorry, I couldn't find..." unless the question is completely nonsensical.
4. Keep the tone helpful, professional, and direct.`,
          temperature: 0.1,
          modelName: "llama-3.3-70b-versatile",
          messageLimit: 5,
        },
      });
    }

    return NextResponse.json({
      settings,
      stats: {
        chunkCount,
        docCount,
        chatCount,
        messageCount,
      },
    });
  } catch (err: any) {
    console.error("Admin GET Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { systemPrompt, temperature, modelName, messageLimit } = await request.json();

    const settings = await prisma.agentSetting.upsert({
      where: { id: "default" },
      update: {
        systemPrompt,
        temperature: parseFloat(temperature),
        modelName,
        messageLimit: parseInt(messageLimit, 10),
      },
      create: {
        id: "default",
        systemPrompt,
        temperature: parseFloat(temperature),
        modelName,
        messageLimit: parseInt(messageLimit, 10),
      },
    });

    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    console.error("Admin POST Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
