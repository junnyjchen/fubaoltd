import { NextRequest } from "next/server";
import { LLMClient, KnowledgeClient, Config, HeaderUtils } from "coze-coding-dev-sdk";

export const runtime = "nodejs";

// System prompt for the FuBao AI assistant
const BASE_SYSTEM_PROMPT = `You are FuBao's AI Cultural Assistant, specializing in Taoist culture, talisman traditions, and Eastern spiritual practices.

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

// RAG instructions appended when knowledge base context is available
const RAG_INSTRUCTIONS = `

--- Knowledge Base Context ---
The following excerpts were retrieved from FuBao's curated knowledge base. Use them as your PRIMARY source when they are relevant to the user's question. If the excerpts answer the question, ground your response in them. If they conflict with your general knowledge, prefer the knowledge base excerpts. If they are irrelevant, ignore them and answer from your general knowledge.

Retrieved context:
{context}
--- End of Knowledge Base Context ---`;

/**
 * Retrieve relevant knowledge base chunks for the user's latest message.
 * Returns null when retrieval is unavailable (graceful degradation).
 */
async function retrieveKnowledgeContext(
  customHeaders: Record<string, string>,
  query: string
): Promise<string | null> {
  const config = new Config();
  const knowledgeClient = new KnowledgeClient(config, customHeaders);

  // The upstream vector index is eventually consistent — retry to improve hit rate
  const MAX_ATTEMPTS = 2;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      // Note: topK=3 returns empty on this upstream service; 5 works reliably
      const response = await knowledgeClient.search(query, undefined, 5, 0.35);
      if (response.code === 0 && response.chunks && response.chunks.length > 0) {
        return response.chunks
          .map((chunk, index) => `[${index + 1}] ${chunk.content}`)
          .join("\n\n");
      }
    } catch (error) {
      // Knowledge base is optional context — degrade gracefully to plain LLM
      console.warn(`Knowledge retrieval attempt ${attempt} failed:`, error);
    }
    if (attempt < MAX_ATTEMPTS) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }
  return null;
}

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

    // RAG: retrieve knowledge base context from the latest user message
    const lastUserMessage = [...messages]
      .reverse()
      .find((m: { role: string; content: string }) => m.role === "user");
    let systemPrompt = BASE_SYSTEM_PROMPT;
    let usedKnowledge = false;

    if (lastUserMessage?.content) {
      const context = await retrieveKnowledgeContext(
        customHeaders,
        lastUserMessage.content
      );
      if (context) {
        systemPrompt = BASE_SYSTEM_PROMPT + RAG_INSTRUCTIONS.replace("{context}", context);
        usedKnowledge = true;
      }
    }

    // Prepare messages with system prompt
    const fullMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages,
    ];

    // Create streaming response
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          // First frame tells the client whether knowledge context was used
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ meta: { usedKnowledge } })}\n\n`
            )
          );
          for await (const chunk of client.stream(fullMessages, {
            model,
            temperature: 0.7,
          })) {
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
