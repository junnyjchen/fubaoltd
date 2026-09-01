"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const CONTENT_TYPES = [
  { value: "encyclopedia", label: "Encyclopedia (百科)" },
  { value: "news", label: "News (资讯)" },
  { value: "tutorial", label: "Tutorial (教程)" },
  { value: "culture", label: "Culture (文化)" },
] as const;

const MODELS = [
  { value: "doubao-seed-2-0-mini-260215", label: "Doubao Seed 2.0 Mini (fast)" },
  { value: "doubao-seed-2-0-lite-260215", label: "Doubao Seed 2.0 Lite (balanced)" },
  { value: "doubao-seed-2-0-pro-260215", label: "Doubao Seed 2.0 Pro (flagship)" },
  { value: "glm-4-7-251222", label: "GLM-4.7" },
  { value: "qwen-3-5-plus-260215", label: "Qwen 3.5 Plus" },
] as const;

export default function AiTrainingClientPage() {
  const [topic, setTopic] = useState("");
  const [contentType, setContentType] = useState<string>("encyclopedia");
  const [model, setModel] = useState<string>(MODELS[0].value);
  const [instructions, setInstructions] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishMsg, setPublishMsg] = useState<string | null>(null);
  const [kbImporting, setKbImporting] = useState(false);
  const [kbMsg, setKbMsg] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setGenerating(true);
    setGenerated(null);
    setError(null);
    setPublishMsg(null);
    setKbMsg(null);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType,
          topic,
          instructions: instructions || undefined,
          model,
          language: "en",
          length: "medium",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setGenerated(data.data.content);
      } else {
        setError(data.error || "Generation failed.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!generated || !topic.trim()) return;
    setPublishing(true);
    setPublishMsg(null);
    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: topic,
          excerpt: generated.replace(/[#*]/g, "").substring(0, 147) + "...",
          content: generated,
          category: contentType,
          author: "FuBao Editorial (AI-assisted)",
          tags: [contentType, "ai-generated"],
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPublishMsg("Article published to /articles successfully.");
      } else {
        setPublishMsg(data.error || "Publish failed.");
      }
    } catch {
      setPublishMsg("Network error while publishing.");
    } finally {
      setPublishing(false);
    }
  };

  const handleImportToKnowledge = async () => {
    if (!generated) return;
    setKbImporting(true);
    setKbMsg(null);
    try {
      const res = await fetch("/api/knowledge/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "text", content: generated }),
      });
      const data = await res.json();
      if (res.ok) {
        setKbMsg("Content imported to knowledge base. AI chat will now use it.");
      } else {
        setKbMsg(data.error || "Import failed.");
      }
    } catch {
      setKbMsg("Network error while importing.");
    } finally {
      setKbImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="mx-auto max-w-4xl px-6">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-cinnabar mb-3">
            Admin Panel
          </p>
          <h1 className="font-serif text-4xl font-light tracking-wide text-ink">
            AI Training &amp; Content Generation
          </h1>
          <p className="mt-3 text-sm text-smoke leading-relaxed max-w-2xl">
            Generate culture articles with AI, publish them to the article hub, or
            import them into the vector knowledge base to train the AI assistant
            (RAG).
          </p>
        </div>

        {/* Generator form */}
        <div className="border border-jade rounded-lg p-6 bg-jade/30 space-y-5">
          <div>
            <Label htmlFor="topic" className="text-sm text-ink mb-2 block">
              Topic / Title
            </Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="E.g., The Meaning of the Five Elements in Daily Life"
              className="bg-background"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="type" className="text-sm text-ink mb-2 block">
                Content Type
              </Label>
              <select
                id="type"
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full h-10 rounded-md border border-jade bg-background px-3 text-sm text-ink"
              >
                {CONTENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="model" className="text-sm text-ink mb-2 block">
                Model
              </Label>
              <select
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full h-10 rounded-md border border-jade bg-background px-3 text-sm text-ink"
              >
                {MODELS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label
              htmlFor="instructions"
              className="text-sm text-ink mb-2 block"
            >
              Additional Instructions (optional)
            </Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="E.g., Focus on how Western audiences can apply Wu Xing theory; avoid supernatural claims; include a practical example."
              className="min-h-[90px] bg-background"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generating || !topic.trim()}
            className="bg-cinnabar text-paper hover:bg-cinnabar/90"
          >
            {generating ? "Generating..." : "Generate Content"}
          </Button>

          {error && (
            <div className="border border-cinnabar/40 rounded-md p-3 bg-cinnabar/10 text-sm text-cinnabar">
              {error}
            </div>
          )}
        </div>

        {/* Generated content */}
        {generated && (
          <div className="mt-8 border border-jade rounded-lg p-6 bg-jade/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl text-ink">Generated Content</h2>
              <div className="flex gap-3">
                <Button
                  onClick={handleImportToKnowledge}
                  disabled={kbImporting}
                  variant="outline"
                  className="border-cinnabar text-cinnabar hover:bg-cinnabar/10"
                >
                  {kbImporting ? "Importing..." : "Train AI (Add to KB)"}
                </Button>
                <Button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="bg-cinnabar text-paper hover:bg-cinnabar/90"
                >
                  {publishing ? "Publishing..." : "Publish Article"}
                </Button>
              </div>
            </div>
            <Textarea
              value={generated}
              onChange={(e) => setGenerated(e.target.value)}
              className="min-h-[320px] bg-background text-sm leading-relaxed"
            />
            {(publishMsg || kbMsg) && (
              <div className="mt-4 space-y-2 text-sm">
                {publishMsg && <p className="text-gold">{publishMsg}</p>}
                {kbMsg && <p className="text-gold">{kbMsg}</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
