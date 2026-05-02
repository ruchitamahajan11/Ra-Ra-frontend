import api from './api';

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

export async function saveDraft(payload: SaveDraftPayload): Promise<void> {
  try {
    await api.post('/api/agreements/draft', payload);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to save draft');
  }
}

export async function finalizeAndSend(companyId: number, payload: FinalizePayload): Promise<void> {
  try {
    await api.post(`/api/agreements/finalize/${companyId}`, payload);
  } catch (error: any) {
    // Specifically trap 403 so it displays cleanly in your UI
    if (error.response?.status === 403) {
      throw new Error('HTTP 403 Forbidden: Spring Security is blocking this request.');
    }
    throw new Error(error.response?.data?.message || 'Failed to finalize agreement.');
  }
}

export async function getClausesByCompany(companyId: number): Promise<ClauseResponseDto[]> {
  try {
    const res = await api.get<ApiResponse<ClauseResponseDto[]>>(`/api/agreements/clauses/${companyId}`);
    return res.data.data ?? [];
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch clauses');
  }
}

export async function updateClause(clauseId: number, newContent: string): Promise<ClauseResponseDto> {
  try {
    const res = await api.put<ApiResponse<ClauseResponseDto>>(`/api/agreements/clauses/${clauseId}`, { clauseContent: newContent });
    return res.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update clause');
  }
}

export async function deleteClause(clauseId: number): Promise<void> {
  try {
    await api.delete(`/api/agreements/clauses/${clauseId}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete clause');
  }
}