import api from './api';

export type ProposalStatus = 'pending' | 'accepted' | 'rejected';

export interface ProposalClause {
  id: number;
  clauseContent: string;
}

export interface ProposalCompany {
  id: number;
  companyName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  gstNumber: string;
  contactPersonName: string;
  contactPersonPhone: string;
  status: string;
}

export interface ProposalResponse {
  id: number;
  proposalNumber: string;
  companyId: number;
  companyName: string;
  status: ProposalStatus;
  clauses: ProposalClause[];
  createdAt: string;
}

export interface SaveDraftPayload {
  companyId: number;
  additionalClauses: string[];
  emailSubject?: string;
  emailBody?: string;
}

export interface FinalizeProposalPayload {
  templateContent: string;
  fileName?: string;
  additionalClauses?: string[];
  selectedClauseIds: number[];
  emailSubject: string;
  emailBody: string;
}

export interface UpdateClausePayload {
  clauseContent: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const proposalService = {
  saveDraft: async (payload: SaveDraftPayload): Promise<ProposalResponse | null> => {
    console.log('[proposalService] 📝 Saving draft:', payload);
    try {
      const res = await api.post<ApiResponse<ProposalResponse>>('/api/proposals/draft', payload);
      console.log('[proposalService] ✅ Draft saved:', res.data);
      if (!res.data.success) throw new Error(res.data.message || 'Failed to save draft');
      // Return data, or null if backend doesn't return the object
      return res.data.data || null; 
    } catch (err: any) {
      console.error('[proposalService] ❌ saveDraft failed:', err?.response?.data || err);
      throw err;
    }
  },

  getClausesByProposal: async (proposalId: number): Promise<ProposalClause[]> => {
    console.log(`[proposalService] 🔍 Fetching clauses for proposalId/companyId=${proposalId}`);
    try {
      const res = await api.get<ApiResponse<ProposalClause[]>>(`/api/proposals/clauses/${proposalId}`);
      console.log('[proposalService] ✅ Clauses fetched:', res.data);
      if (!res.data.success) throw new Error(res.data.message || 'Failed to fetch clauses');
      return res.data.data || [];
    } catch (err: any) {
      console.error(`[proposalService] ❌ getClausesByProposal(${proposalId}) failed:`, err?.response?.data || err);
      throw err;
    }
  },

  updateClause: async (clauseId: number, payload: UpdateClausePayload): Promise<ProposalClause> => {
    console.log(`[proposalService] ✏️ Updating clause id=${clauseId}:`, payload);
    try {
      const res = await api.put<ApiResponse<ProposalClause>>(`/api/proposals/clauses/${clauseId}`, payload);
      console.log('[proposalService] ✅ Clause updated:', res.data);
      if (!res.data.success) throw new Error(res.data.message || 'Failed to update clause');
      return res.data.data;
    } catch (err: any) {
      console.error(`[proposalService] ❌ updateClause(${clauseId}) failed:`, err?.response?.data || err);
      throw err;
    }
  },

  deleteClause: async (clauseId: number): Promise<void> => {
    console.log(`[proposalService] 🗑️ Deleting clause id=${clauseId}`);
    try {
      await api.delete(`/api/proposals/clauses/${clauseId}`);
      console.log(`[proposalService] ✅ Clause ${clauseId} deleted`);
    } catch (err: any) {
      console.error(`[proposalService] ❌ deleteClause(${clauseId}) failed:`, err?.response?.data || err);
      throw err;
    }
  },

  // Changed proposalId to companyId to match backend logic
  finalizeAndSend: async (companyId: number, payload: FinalizeProposalPayload): Promise<ProposalResponse | null> => {
    console.log(`[proposalService] 📧 Finalizing proposal for companyId=${companyId}:`, payload);
    try {
      const res = await api.post<ApiResponse<ProposalResponse>>(`/api/proposals/finalize/${companyId}`, payload);
      console.log('[proposalService] ✅ Proposal finalized & sent:', res.data);
      if (!res.data.success) throw new Error(res.data.message || 'Failed to send proposal');
      return res.data.data || null;
    } catch (err: any) {
      console.error(`[proposalService] ❌ finalizeAndSend(${companyId}) failed:`, err?.response?.data || err);
      throw err;
    }
  },

  acceptProposal: async (proposalId: number): Promise<ProposalResponse> => {
    console.log(`[proposalService] ✅ Accepting proposal id=${proposalId}`);
    try {
      const res = await api.put<ApiResponse<ProposalResponse>>(`/api/proposals/${proposalId}/accept`);
      console.log('[proposalService] ✅ Proposal accepted:', res.data);
      if (!res.data.success) throw new Error(res.data.message || 'Failed to accept proposal');
      return res.data.data;
    } catch (err: any) {
      console.error(`[proposalService] ❌ acceptProposal(${proposalId}) failed:`, err?.response?.data || err);
      throw err;
    }
  },

  rejectProposal: async (proposalId: number): Promise<ProposalResponse> => {
    console.log(`[proposalService] ❌ Rejecting proposal id=${proposalId}`);
    try {
      const res = await api.put<ApiResponse<ProposalResponse>>(`/api/proposals/${proposalId}/reject`);
      console.log('[proposalService] ✅ Proposal rejected:', res.data);
      if (!res.data.success) throw new Error(res.data.message || 'Failed to reject proposal');
      return res.data.data;
    } catch (err: any) {
      console.error(`[proposalService] ❌ rejectProposal(${proposalId}) failed:`, err?.response?.data || err);
      throw err;
    }
  },

  getRegisteredCompanies: async (): Promise<ProposalCompany[]> => {
    console.log('[proposalService] 🏢 Fetching registered companies');
    try {
      const res = await api.get<ApiResponse<ProposalCompany[]>>('/api/companies/status/REGISTERED');
      console.log('[proposalService] ✅ Registered companies fetched:', res.data.data?.length);
      if (!res.data.success) throw new Error(res.data.message || 'Failed to fetch companies');
      return Array.isArray(res.data.data) ? res.data.data : [];
    } catch (err: any) {
      console.error('[proposalService] ❌ getRegisteredCompanies failed:', err?.response?.data || err);
      throw err;
    }
  },
};