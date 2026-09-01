import type { Metadata } from "next";
import KnowledgeClientPage from "./client";

export const metadata: Metadata = {
  title: "Knowledge Base Management | FuBao Admin",
  description: "Manage FuBao knowledge base documents, import content, and test semantic search.",
};

export default function AdminKnowledgePage() {
  return <KnowledgeClientPage />;
}
