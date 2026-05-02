import api from './api';

export interface QuotationItemRequest {
  serviceDescription: string;
  price: number;
  rate?: number;
  amount?: number;
  discountPercent?: number;
  taxPercent?: number;
  discountAmount?: number;
  taxAmount?: number;
  totalAmount?: number;
}

export interface QuotationRequest {
  companyId: number | string;
  items: QuotationItemRequest[];
  discountPercent?: number;
  taxPercent?: number;
  subtotal?: number;
  discountAmount?: number;
  taxAmount?: number;
  totalAmount?: number;
}

export interface QuotationItemResponse {
  id: number;
  serviceDescription: string;
  price: number;
}

export interface QuotationResponse {
  id: number;
  quotationNumber: string;
  companyId: number;
  companyName: string;
  discountPercent: number;
  taxPercent: number;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  createdAt: string;
  items: QuotationItemResponse[];
}

export interface SendQuotationPayload {
  emailSubject: string;
  emailBody: string;
}

export interface CompanyOption {
  id: number;
  companyName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  gstNumber: string;
  contactPersonName: string;
  contactPersonPhone: string;
  status: 'REGISTERED' | 'PROPOSAL_ACCEPTED' | 'AGREEMENT_SENT' | 'AGREEMENT_SIGNED' | 'ACTIVE' | 'INACTIVE';
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const quotationService = {

  /**
   * 💡 THIS IMPLEMENTS YOUR FLOW:
   * It only grabs REGISTERED (brand new) and PROPOSAL_ACCEPTED.
   * If a proposal is Pending or Rejected, it will NOT show up here.
   */
  getEligibleCompanies: async (): Promise<CompanyOption[]> => {
    console.log('[quotationService] 🔍 Fetching companies eligible for quotation...');
    try {
      const [registeredRes, acceptedRes] = await Promise.allSettled([
        api.get<ApiResponse<CompanyOption[]>>('/api/companies/status/REGISTERED'),
        api.get<ApiResponse<CompanyOption[]>>('/api/companies/status/PROPOSAL_ACCEPTED'),
      ]);

      const registered: CompanyOption[] =
        registeredRes.status === 'fulfilled' && registeredRes.value.data.success
          ? Array.isArray(registeredRes.value.data.data) ? registeredRes.value.data.data : []
          : [];

      const accepted: CompanyOption[] =
        acceptedRes.status === 'fulfilled' && acceptedRes.value.data.success
          ? Array.isArray(acceptedRes.value.data.data) ? acceptedRes.value.data.data : []
          : [];

      // Merge and deduplicate
      const seen = new Set<number>();
      const merged: CompanyOption[] = [];
      for (const c of [...registered, ...accepted]) {
        if (!seen.has(c.id)) {
          seen.add(c.id);
          merged.push(c);
        }
      }

      console.log(`[quotationService] ✅ Eligible: ${registered.length} registered + ${accepted.length} accepted = ${merged.length} total`);
      return merged;
    } catch (err: any) {
      console.error('[quotationService] ❌ getEligibleCompanies failed:', err?.response?.data || err);
      throw err;
    }
  },

  create: async (payload: QuotationRequest): Promise<QuotationResponse> => {
    try {
      const res = await api.post<ApiResponse<QuotationResponse>>('/api/quotations', payload);
      if (!res.data.success) throw new Error(res.data.message || 'Failed to create quotation');
      return res.data.data;
    } catch (err: any) {
      throw err;
    }
  },

  sendQuotation: async (quotationId: number, payload: SendQuotationPayload): Promise<void> => {
    try {
      await api.post(`/api/quotations/${quotationId}/send`, payload);
    } catch (err: any) {
      throw err;
    }
  },

  getAll: async (): Promise<QuotationResponse[]> => {
    try {
      const res = await api.get<ApiResponse<QuotationResponse[]>>('/api/quotations');
      if (!res.data.success) throw new Error(res.data.message || 'Failed to fetch quotations');
      return res.data.data;
    } catch (err: any) {
      throw err;
    }
  },

  getById: async (id: string): Promise<QuotationResponse> => {
    try {
      const res = await api.get<ApiResponse<QuotationResponse>>(`/api/quotations/${id}`);
      if (!res.data.success) throw new Error(res.data.message || 'Quotation not found');
      return res.data.data;
    } catch (err: any) {
      throw err;
    }
  },

  getByCompany: async (companyId: number | string): Promise<QuotationResponse[]> => {
    try {
      const res = await api.get<ApiResponse<QuotationResponse[]>>(`/api/quotations/company/${companyId}`);
      if (!res.data.success) throw new Error(res.data.message || 'Failed to fetch company quotations');
      return res.data.data;
    } catch (err: any) {
      throw err;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/quotations/${id}`);
    } catch (err: any) {
      throw err;
    }
  },
};