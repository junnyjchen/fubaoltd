"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ImportResult = {
  success: boolean;
  message: string;
  docIds?: string[];
};

type SearchResult = {
  success: boolean;
  results?: { content: string; score: number; docId: string }[];
  count?: number;
  error?: string;
};

export default function KnowledgeClientPage() {
  // Import state
  const [textContent, setTextContent] = useState("");
  const [importUrl, setImportUrl] = useState("");
  const [importUri, setImportUri] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  // Search test state
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);

  const handleImport = async (source: "text" | "url" | "uri") => {
    setImporting(true);
    setImportResult(null);
    try {
      const body: Record<string, string> = { source };
      if (source === "text") body.content = textContent;
      if (source === "url") body.url = importUrl;
      if (source === "uri") body.uri = importUri;

      const res = await fetch("/api/knowledge/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setImportResult({
          success: true,
          message: "Document added to knowledge base successfully.",
          docIds: data.data?.docIds,
        });
        if (source === "text") setTextContent("");
        if (source === "url") setImportUrl("");
        if (source === "uri") setImportUri("");
      } else {
        setImportResult({
          success: false,
          message: data.error || "Failed to add document.",
        });
      }
    } catch {
      setImportResult({
        success: false,
        message: "Network error. Please try again.",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setSearchResult(null);
    try {
      const res = await fetch("/api/knowledge/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, topK: 5, minScore: 0.35 }),
      });
      const data = await res.json();
      if (res.ok) {
        setSearchResult(data);
      } else {
        setSearchResult({ success: false, error: data.error || "Search failed." });
      }
    } catch {
      setSearchResult({ success: false, error: "Network error. Please try again." });
    } finally {
      setSearching(false);
      resultRef.current?.scrollIntoView({ behavior: "smooth" });
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
            Knowledge Base Management
          </h1>
          <p className="mt-3 text-sm text-smoke leading-relaxed max-w-2xl">
            Import Taoist culture documents into the vector knowledge base. These
            documents power the AI assistant&apos;s RAG retrieval — content added here
            is used to ground AI chat responses in FuBao&apos;s curated materials.
          </p>
        </div>

        <Tabs defaultValue="import" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="import">Import Documents</TabsTrigger>
            <TabsTrigger value="search">Semantic Search Test</TabsTrigger>
          </TabsList>

          {/* Import Tab */}
          <TabsContent value="import" className="space-y-8">
            {/* Text import */}
            <div className="border border-jade rounded-lg p-6 bg-jade/30">
              <h2 className="font-serif text-xl text-ink mb-2">Import from Text</h2>
              <p className="text-xs text-smoke mb-4">
                Paste article text, encyclopedia entries, or FAQ content.
              </p>
              <Textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Paste knowledge content here. E.g., the history of Taoist talismans, Five Elements theory, consecration ritual details..."
                className="min-h-[180px] mb-4 bg-background"
              />
              <Button
                onClick={() => handleImport("text")}
                disabled={importing || !textContent.trim()}
                className="bg-cinnabar text-paper hover:bg-cinnabar/90"
              >
                {importing ? "Importing..." : "Import Text"}
              </Button>
            </div>

            {/* URL import */}
            <div className="border border-jade rounded-lg p-6 bg-jade/30">
              <h2 className="font-serif text-xl text-ink mb-2">Import from URL</h2>
              <p className="text-xs text-smoke mb-4">
                Crawl a public webpage and import its content (articles, blog posts).
              </p>
              <Input
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                placeholder="https://example.com/taoist-culture-article"
                className="mb-4 bg-background"
                type="url"
              />
              <Button
                onClick={() => handleImport("url")}
                disabled={importing || !importUrl.trim()}
                className="bg-cinnabar text-paper hover:bg-cinnabar/90"
              >
                {importing ? "Importing..." : "Import URL"}
              </Button>
            </div>

            {/* Object storage URI import */}
            <div className="border border-jade rounded-lg p-6 bg-jade/30">
              <h2 className="font-serif text-xl text-ink mb-2">
                Import from Object Storage
              </h2>
              <p className="text-xs text-smoke mb-4">
                Import a file stored in object storage by its URI (PDF, docs, etc.).
              </p>
              <Input
                value={importUri}
                onChange={(e) => setImportUri(e.target.value)}
                placeholder="oss://bucket-name/documents/taoist-rituals.pdf"
                className="mb-4 bg-background"
              />
              <Button
                onClick={() => handleImport("uri")}
                disabled={importing || !importUri.trim()}
                className="bg-cinnabar text-paper hover:bg-cinnabar/90"
              >
                {importing ? "Importing..." : "Import URI"}
              </Button>
            </div>

            {/* Import result */}
            {importResult && (
              <div
                className={`border rounded-lg p-4 text-sm ${
                  importResult.success
                    ? "border-jade bg-jade/50 text-ink"
                    : "border-cinnabar/40 bg-cinnabar/10 text-cinnabar"
                }`}
              >
                <p>{importResult.message}</p>
                {importResult.docIds && importResult.docIds.length > 0 && (
                  <p className="mt-2 text-xs text-smoke">
                    Document IDs: {importResult.docIds.join(", ")}
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-6" ref={resultRef}>
            <div className="border border-jade rounded-lg p-6 bg-jade/30">
              <h2 className="font-serif text-xl text-ink mb-2">
                Semantic Search Test
              </h2>
              <p className="text-xs text-smoke mb-4">
                Test what the AI assistant retrieves. Enter a question the way a
                customer would ask it.
              </p>
              <div className="flex gap-3">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="E.g., What is the Five Elements theory?"
                  className="bg-background"
                />
                <Button
                  onClick={handleSearch}
                  disabled={searching || !query.trim()}
                  className="bg-cinnabar text-paper hover:bg-cinnabar/90 shrink-0"
                >
                  {searching ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>

            {/* Search results */}
            {searchResult && (
              <div className="space-y-4">
                {searchResult.success ? (
                  <>
                    <p className="text-xs text-smoke uppercase tracking-widest">
                      {searchResult.count} chunk(s) retrieved
                    </p>
                    {searchResult.results?.map((chunk, i) => (
                      <div
                        key={chunk.docId || i}
                        className="border border-jade rounded-lg p-5 bg-jade/20"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-smoke">
                            Doc: {chunk.docId || "unknown"}
                          </span>
                          <span className="text-xs text-gold">
                            Score: {chunk.score.toFixed(3)}
                          </span>
                        </div>
                        <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
                          {chunk.content}
                        </p>
                      </div>
                    ))}
                    {searchResult.count === 0 && (
                      <p className="text-sm text-smoke text-center py-8">
                        No matching content found. Try importing relevant documents
                        first.
                      </p>
                    )}
                  </>
                ) : (
                  <div className="border border-cinnabar/40 rounded-lg p-4 bg-cinnabar/10 text-sm text-cinnabar">
                    {searchResult.error}
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
