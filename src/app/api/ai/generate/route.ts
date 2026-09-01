import { NextRequest, NextResponse } from "next/server";
import { LLMClient, Config, HeaderUtils } from "coze-coding-dev-sdk";

export async function POST(request: NextRequest) {
  try {
    const { topic, contentType = "article", language = "en", length = "medium" } =
      await request.json();

    if (!topic) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const lengthMap = {
      short: "200-300 words",
      medium: "500-800 words",
      long: "1000-1500 words",
    };

    const contentTypes = {
      article: "an informative article",
      news: "a news report",
      encyclopedia: "an encyclopedia-style entry",
      tutorial: "a step-by-step tutorial",
    };

    const systemPrompt = `You are a professional content writer specializing in Taoist culture, Eastern spirituality, and talisman traditions. Write ${contentTypes[contentType as keyof typeof contentTypes] || "an article"} about "${topic}" in ${language}.

Guidelines:
- Length: approximately ${lengthMap[length as keyof typeof lengthMap] || "500-800 words"}
- Be culturally accurate and respectful
- Include historical context where relevant
- Use appropriate terminology with explanations
- Never make supernatural claims
- Frame content as cultural heritage and tradition
- Write in an engaging, educational tone
- Structure with clear headings and paragraphs

Return the content in well-formatted text with proper structure.`;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: `Please write about: ${topic}` },
    ];

    const response = await client.invoke(messages, {
      model: "doubao-seed-2-0-lite-260215",
      temperature: 0.7,
    });

    return NextResponse.json({
      success: true,
      data: {
        topic,
        contentType,
        language,
        content: response.content,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Content generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
