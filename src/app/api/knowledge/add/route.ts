import { NextRequest, NextResponse } from "next/server";
import {
  KnowledgeClient,
  Config,
  HeaderUtils,
  DataSourceType,
  type KnowledgeDocument,
} from "coze-coding-dev-sdk";

export async function POST(request: NextRequest) {
  try {
    const { content, url, uri, source = "text", tableName = "fubao_knowledge" } =
      await request.json();

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new KnowledgeClient(config, customHeaders);

    let document: KnowledgeDocument;

    switch (source) {
      case "url":
        if (!url) {
          return NextResponse.json(
            { error: "URL is required for URL source" },
            { status: 400 }
          );
        }
        document = {
          source: DataSourceType.URL,
          url,
        };
        break;
      case "uri":
        if (!uri) {
          return NextResponse.json(
            { error: "URI is required for URI source" },
            { status: 400 }
          );
        }
        document = {
          source: DataSourceType.URI,
          uri,
        };
        break;
      default:
        if (!content) {
          return NextResponse.json(
            { error: "Content is required for text source" },
            { status: 400 }
          );
        }
        document = {
          source: DataSourceType.TEXT,
          raw_data: content,
        };
    }

    const response = await client.addDocuments([document], tableName);

    if (response.code === 0) {
      return NextResponse.json({
        success: true,
        data: {
          docIds: response.doc_ids,
          message: "Document added to knowledge base successfully",
        },
      });
    } else {
      return NextResponse.json(
        { error: response.msg || "Failed to add document" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Knowledge add error:", error);
    return NextResponse.json(
      { error: "Failed to add document to knowledge base" },
      { status: 500 }
    );
  }
}
