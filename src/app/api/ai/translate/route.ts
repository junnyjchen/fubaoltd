import { NextRequest, NextResponse } from "next/server";
import { LLMClient, Config, HeaderUtils } from "coze-coding-dev-sdk";

export async function POST(request: NextRequest) {
  try {
    let text: string | undefined;
    let targetLang = "en";
    let sourceLang: string | undefined;
    try {
      const body = await request.json();
      text = body?.text;
      targetLang = body?.targetLang ?? "en";
      sourceLang = body?.sourceLang;
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const sourceHint = sourceLang ? `from ${sourceLang} ` : "";
    const systemPrompt = `You are a professional translator specializing in Taoist culture and Eastern spiritual terminology. Translate the following text ${sourceHint}to ${targetLang}. 

Guidelines:
- Maintain cultural context and meaning
- Use appropriate terminology for Taoist/spiritual concepts
- Keep the tone respectful and accurate
- For technical terms like "符箓" (talisman), "开光" (consecration), provide both translation and original term in parentheses on first use
- Return only the translated text, no explanations`;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: text },
    ];

    const response = await client.invoke(messages, {
      model: "doubao-seed-2-0-mini-260215",
      temperature: 0.3,
    });

    return NextResponse.json({
      success: true,
      data: {
        original: text,
        translated: response.content,
        targetLang,
      },
    });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: "Failed to translate text" },
      { status: 500 }
    );
  }
}
