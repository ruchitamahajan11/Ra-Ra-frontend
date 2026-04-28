import { API_CONFIG } from '../config/api.config';

const BASE_URL = API_CONFIG.BASE_URL;

export interface SaveDraftPayload {
  companyId: number;
  additionalClauses: string[];
}

export interface FinalizePayload {
  templateContent: string; 
  fileName: string;
  additionalClauses: string[];
  selectedClauseIds: number[];
  emailSubject: string;   
  emailBody: string;     
}

export interface ClauseResponseDto {
  id: number;
  clauseContent: string;
  companyId: number | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export async function extractTextFromDocx(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return normalizeDocxText(result.value);
}

function normalizeDocxText(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function apiFetch<T>(
  url: string,
  options: RequestInit,
): Promise<ApiResponse<T>> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    let errorText = `HTTP ${res.status}`;
    try {
      const errBody = await res.json();
      errorText = errBody?.message ?? errBody?.error ?? errorText;
    } catch {
      errorText = (await res.text()) || errorText;
    }
    throw new Error(errorText);
  }

  return res.json() as Promise<ApiResponse<T>>;
}

export async function saveDraft(payload: SaveDraftPayload): Promise<void> {
  await apiFetch<void>(`${BASE_URL}/api/agreements/draft`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function finalizeAndSend(
  companyId: number,
  payload: FinalizePayload,
): Promise<void> {
  await apiFetch<void>(`${BASE_URL}/api/agreements/finalize/${companyId}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getClausesByCompany(
  companyId: number,
): Promise<ClauseResponseDto[]> {
  const res = await apiFetch<ClauseResponseDto[]>(
    `${BASE_URL}/api/agreements/clauses/${companyId}`,
    { method: 'GET' },
  );
  return res.data ?? [];
}

export async function updateClause(
  clauseId: number,
  newContent: string,
): Promise<ClauseResponseDto> {
  const res = await apiFetch<ClauseResponseDto>(
    `${BASE_URL}/api/agreements/clauses/${clauseId}`,
    {
      method: 'PUT',
      body: JSON.stringify({ clauseContent: newContent }),
    },
  );
  return res.data;
}

export async function deleteClause(clauseId: number): Promise<void> {
  await apiFetch<void>(`${BASE_URL}/api/agreements/clauses/${clauseId}`, {
    method: 'DELETE',
  });
}