import type { Metadata } from "next";
import AiTrainingClientPage from "./client";

export const metadata: Metadata = {
  title: "AI Training & Generation | FuBao Admin",
  description: "Generate articles and training content with AI for the FuBao knowledge base.",
};

export default function AdminAiTrainingPage() {
  return <AiTrainingClientPage />;
}
