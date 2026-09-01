import { NextRequest } from "next/server";
import { LLMClient, Config, HeaderUtils } from "coze-coding-dev-sdk";

export const runtime = "nodejs";

// System prompt for the FuBao AI assistant
const SYSTEM_PROMPT = `You are FuBao's AI Cultural Assistant, specializing in Taoist culture, talisman traditions, and Eastern spiritual practices. 

Your role:
- Answer questions about Taoist talismans, their history, and cultural significance
- Explain the Five Elements (Wu Xing) theory and its applications
- Provide guidance on talisman selection based on user needs
- Share knowledge about consecration rituals and Taoist practices
- Be respectful, knowledgeable, and culturally sensitive

Important guidelines:
- Never make supernatural claims or guarantee outcomes
- Frame responses in terms of cultural heritage and tradition
- Be educational and informative
- Recommend consulting with a master for serious spiritual matters
- Keep responses concise but informative

You can speak both English and Chinese. Respond in the same language the user uses.`;

export async function POST(request: NextRequest) {
  try {
    const { messages, model = "doubao-seed-2-0-mini-260215" } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Extract forward headers for SDK
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // Prepare messages with system prompt
    const fullMessages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      ...messages,
    ];

    // Create streaming response
    const stream = client.stream(fullMessages, {
      model,
      temperature: 0.7,
    });

    // Create a ReadableStream for SSE
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.content) {
              const data = `data: ${JSON.stringify({ content: chunk.content })}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("AI chat error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process chat request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
