import { NextRequest, NextResponse } from "next/server";
import { KnowledgeClient, Config, HeaderUtils } from "coze-coding-dev-sdk";

export async function POST(request: NextRequest) {
  try {
    const { query, topK = 5, minScore = 0.35 } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new KnowledgeClient(config, customHeaders);

    const response = await client.search(query, undefined, topK, minScore);

    if (response.code === 0) {
      return NextResponse.json({
        success: true,
        data: {
          query,
          results: response.chunks.map((chunk) => ({
            content: chunk.content,
            score: chunk.score,
            docId: chunk.doc_id,
          })),
          count: response.chunks.length,
        },
      });
    } else {
      return NextResponse.json(
        { error: response.msg || "Search failed" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Knowledge search error:", error);
    return NextResponse.json(
      { error: "Failed to search knowledge base" },
      { status: 500 }
    );
  }
}
