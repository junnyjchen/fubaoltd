import { NextResponse } from "next/server";

// Available AI models for the FuBao platform
export const AVAILABLE_MODELS = [
  {
    id: "doubao-seed-2-0-mini-260215",
    name: "Doubao Seed 2.0 Mini",
    description: "Fast and cost-effective model for general conversations",
    provider: "ByteDance",
    default: true,
    capabilities: ["text"],
  },
  {
    id: "doubao-seed-2-0-lite-260215",
    name: "Doubao Seed 2.0 Lite",
    description: "Balanced model for enterprise scenarios",
    provider: "ByteDance",
    default: false,
    capabilities: ["text", "image", "video"],
  },
  {
    id: "doubao-seed-2-0-pro-260215",
    name: "Doubao Seed 2.0 Pro",
    description: "Flagship model for complex reasoning tasks",
    provider: "ByteDance",
    default: false,
    capabilities: ["text", "image", "video"],
  },
  {
    id: "glm-4-7-251222",
    name: "GLM-4.7",
    description: "Strong coding and reasoning capabilities",
    provider: "Zhipu AI",
    default: false,
    capabilities: ["text"],
  },
  {
    id: "qwen-3-5-plus-260215",
    name: "Qwen 3.5 Plus",
    description: "High-efficiency vision-language model",
    provider: "Alibaba",
    default: false,
    capabilities: ["text", "image", "video"],
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    data: AVAILABLE_MODELS,
  });
}
