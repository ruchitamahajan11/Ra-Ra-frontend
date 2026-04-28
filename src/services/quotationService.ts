import api from './api';
import { API_CONFIG } from '../config/api.config';

export interface QuotationItemRequest {
  serviceDescription: string;
  price: number;
}

export interface QuotationRequest {
  companyId: number | string;
  items: QuotationItemRequest[];
  discountPercent?: number;
  taxPercent?: number;
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
  status: 'REGISTERED' | 'AGREEMENT_SENT' | 'AGREEMENT_SIGNED' | 'ACTIVE' | 'INACTIVE';
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const quotationService = {

  getRegisteredCompanies: async (): Promise<CompanyOption[]> => {
    console.log('[quotationService] 🔍 Fetching REGISTERED companies → /api/companies/status/REGISTERED');
    try {
      const res = await api.get<ApiResponse<CompanyOption[]>>('/api/companies/status/REGISTERED');
      console.log('[quotationService] ✅ Full API response:', res.data);
      if (!res.data.success) {
        throw new Error(res.data.message || 'Failed to fetch companies');
      }
      const companies = Array.isArray(res.data.data) ? res.data.data : [];
      console.log('[quotationService] ✅ Returning', companies.length, 'registered companies');
      return companies;
    } catch (err: any) {
      console.error('[quotationService] ❌ getRegisteredCompanies failed:', err?.response?.data || err);
      throw err;
    }
  },

  create: async (payload: QuotationRequest): Promise<QuotationResponse> => {
    console.log('[quotationService] 📤 Creating quotation:', payload);
    try {
      const res = await api.post<ApiResponse<QuotationResponse>>('/api/quotations', payload);
      console.log('[quotationService] ✅ Created quotation:', res.data);
      if (!res.data.success) throw new Error(res.data.message || 'Failed to create quotation');
      return res.data.data;
    } catch (err: any) {
      console.error('[quotationService] ❌ create failed:', err?.response?.data || err);
      throw err;
    }
  },

  sendQuotation: async (quotationId: number, payload: SendQuotationPayload): Promise<void> => {
    console.log(`[quotationService] 📧 Sending quotation id=${quotationId}:`, payload);
    try {
      await api.post(`/api/quotations/${quotationId}/send`, payload);
      console.log(`[quotationService] ✅ Quotation ${quotationId} sent successfully`);
    } catch (err: any) {
      console.error(`[quotationService] ❌ sendQuotation(${quotationId}) failed:`, err?.response?.data || err);
      throw err;
    }
  },

  getAll: async (): Promise<QuotationResponse[]> => {
    console.log('[quotationService] 🔍 Fetching all quotations');
    try {
      const res = await api.get<ApiResponse<QuotationResponse[]>>('/api/quotations');
      console.log('[quotationService] ✅ All quotations count:', res.data.data?.length);
      if (!res.data.success) throw new Error(res.data.message || 'Failed to fetch quotations');
      return res.data.data;
    } catch (err: any) {
      console.error('[quotationService] ❌ getAll failed:', err?.response?.data || err);
      throw err;
    }
  },

  getById: async (id: string): Promise<QuotationResponse> => {
    console.log(`[quotationService] 🔍 Fetching quotation id=${id}`);
    try {
      const res = await api.get<ApiResponse<QuotationResponse>>(`/api/quotations/${id}`);
      console.log('[quotationService] ✅ Quotation:', res.data.data);
      if (!res.data.success) throw new Error(res.data.message || 'Quotation not found');
      return res.data.data;
    } catch (err: any) {
      console.error(`[quotationService] ❌ getById(${id}) failed:`, err?.response?.data || err);
      throw err;
    }
  },

  getByCompany: async (companyId: number | string): Promise<QuotationResponse[]> => {
    console.log(`[quotationService] 🔍 Fetching quotations for companyId=${companyId}`);
    try {
      const res = await api.get<ApiResponse<QuotationResponse[]>>(`/api/quotations/company/${companyId}`);
      console.log('[quotationService] ✅ Company quotations count:', res.data.data?.length);
      if (!res.data.success) throw new Error(res.data.message || 'Failed to fetch company quotations');
      return res.data.data;
    } catch (err: any) {
      console.error(`[quotationService] ❌ getByCompany(${companyId}) failed:`, err?.response?.data || err);
      throw err;
    }
  },

  delete: async (id: number): Promise<void> => {
    console.log(`[quotationService] 🗑️ Deleting quotation id=${id}`);
    try {
      await api.delete(`/api/quotations/${id}`);
      console.log(`[quotationService] ✅ Deleted quotation ${id}`);
    } catch (err: any) {
      console.error(`[quotationService] ❌ delete(${id}) failed:`, err?.response?.data || err);
      throw err;
    }
  },
};