import React, { useState } from "react";
import { parseDraftFile, StructuredDraftPayload } from "../../services/docxToStructuredDraft";

// ─── Example: File Upload Component ──────────────────────────────────────────
//
// Drop this into any React/Next.js page. It:
//  1. Accepts a .docx file from the user
//  2. Parses it into { templateContent, selectedClauseIds }
//  3. POSTs the structured JSON to your backend
//

export default function DraftUploader() {
  const [status, setStatus] = useState<"idle" | "parsing" | "sending" | "done" | "error">("idle");
  const [preview, setPreview] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setStatus("parsing");
      setError("");

      // ── Step 1: Parse the .docx → structured JSON ──────────────────────
      const payload: StructuredDraftPayload = await parseDraftFile(file);

      // Optional: show a preview so the user can confirm before submitting
      setPreview(payload.templateContent);

      // ── Step 2: POST to your backend ────────────────────────────────────
      setStatus("sending");

      const response = await fetch("/api/drafts", {          // ← your endpoint
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      setStatus("done");
    } catch (err: unknown) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h2>Upload Draft (.docx)</h2>

      <input
        type="file"
        accept=".docx"
        onChange={handleFileChange}
        disabled={status === "parsing" || status === "sending"}
      />

      {status === "parsing" && <p>⏳ Parsing document…</p>}
      {status === "sending" && <p>📤 Sending to backend…</p>}
      {status === "done"    && <p style={{ color: "green" }}>✅ Draft uploaded successfully.</p>}
      {status === "error"   && <p style={{ color: "red" }}>❌ {error}</p>}

      {preview && (
        <details style={{ marginTop: 16 }}>
          <summary>Preview extracted text</summary>
          <pre style={{ background: "#f5f5f5", padding: 12, whiteSpace: "pre-wrap" }}>
            {preview}
          </pre>
        </details>
      )}
    </div>
  );
}