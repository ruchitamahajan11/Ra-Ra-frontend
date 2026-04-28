import mammoth from "mammoth";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StructuredDraftPayload {
  templateContent: string;
  selectedClauseIds: string[];
}

// ─── Core Parser ─────────────────────────────────────────────────────────────

/**
 * Reads a .docx File from a browser file input and returns a structured
 * payload ready to POST to your backend.
 *
 * Usage:
 *   const file = event.target.files[0];
 *   const payload = await parseDraftFile(file);
 *   await fetch("/api/drafts", { method: "POST", body: JSON.stringify(payload) });
 */
export async function parseDraftFile(
  file: File
): Promise<StructuredDraftPayload> {
  if (!file.name.endsWith(".docx")) {
    throw new Error("Only .docx files are supported.");
  }

  const arrayBuffer = await file.arrayBuffer();

  // Extract raw text with mammoth — preserves line structure, headings,
  // bullets, and paragraph breaks without HTML noise.
  const result = await mammoth.extractRawText({ arrayBuffer });

  const templateContent = normalizeDocxText(result.value);

  return {
    templateContent,
    selectedClauseIds: [],
  };
}

// ─── Text Normalizer ──────────────────────────────────────────────────────────

/**
 * Cleans and normalizes raw text extracted from a .docx file.
 *
 * What it does:
 *  1. Converts Windows-style line endings (\r\n) to Unix (\n)
 *  2. Collapses 3+ blank lines to at most 2 (prevents excessive spacing)
 *  3. Trims leading/trailing whitespace per line while preserving indentation
 *     for items like bullet points and addresses
 *  4. Removes the trailing newline at the end of the document
 */
function normalizeDocxText(raw: string): string {
  return (
    raw
      // 1. Normalize Windows line endings
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")

      // 2. Trim trailing spaces on each line (not leading — preserve indent)
      .split("\n")
      .map((line) => line.trimEnd())
      .join("\n")

      // 3. Collapse 3+ consecutive blank lines → max 2 blank lines
      .replace(/\n{3,}/g, "\n\n")

      // 4. Strip leading/trailing whitespace from the full document
      .trim()
  );
}

// ─── Optional: Detect Clause Markers ─────────────────────────────────────────

/**
 * (Optional) If your documents contain clause markers like [CLAUSE:id] or
 * {{clause_id}}, this extracts their IDs to populate selectedClauseIds.
 *
 * Extend the regex to match whatever marker format you use.
 */
export function extractClauseIds(templateContent: string): string[] {
  const clausePattern = /\[CLAUSE:([\w-]+)\]|\{\{([\w-]+)\}\}/g;
  const ids: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = clausePattern.exec(templateContent)) !== null) {
    const id = match[1] ?? match[2];
    if (id && !ids.includes(id)) ids.push(id);
  }

  return ids;
}

/**
 * Full pipeline: parses file AND auto-detects clause IDs in the content.
 * Use this instead of parseDraftFile if you use clause markers.
 */
export async function parseDraftFileWithClauses(
  file: File
): Promise<StructuredDraftPayload> {
  const payload = await parseDraftFile(file);
  payload.selectedClauseIds = extractClauseIds(payload.templateContent);
  return payload;
}

