import api from './api'; 

const BASE_URL = '/api/invoices';

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface InvoiceRequestDto {
  companyId: number;
  taxPercent: number;
  discountPercent: number;
  dueDate?: string;
}

export interface SendInvoiceMailDto {
  emailSubject: string;
  emailBody: string;
}

// ─── Response DTOs ────────────────────────────────────────────────────────────

export interface InvoiceItemResponse {
  id: number;
  serviceDescription: string;
  price: number;
}

export interface InvoiceResponse {
  id: number;
  invoiceNumber: string;
  companyId: number;
  companyName: string;
  discountPercent: number;
  taxPercent: number;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  dueDate: string;
  createdAt: string;
  items: InvoiceItemResponse[];
}

export interface CompanyOption {
  id: number;
  companyName: string;
  city: string;
  state: string;
  gstNumber: string;
  contactPersonName: string;
}

export interface QuotationItemOption {
  id: number;
  serviceDescription: string;
  price: number;
}

export interface QuotationForCompany {
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
  items: QuotationItemOption[];
}

// ─── API Wrapper ──────────────────────────────────────────────────────────────
function unwrap<T>(response: any): T {
  const body = response?.data;
  if (body === null || body === undefined) return [] as unknown as T;
  if (typeof body === 'object' && !Array.isArray(body) && 'data' in body) {
    return (body.data ?? []) as T;
  }
  if (Array.isArray(body)) return body as unknown as T;
  return body as T;
}

export const invoiceService = {

  /** POST /api/invoices/generate */
  generateFromQuotation: async (dto: InvoiceRequestDto): Promise<InvoiceResponse> => {
    const res = await api.post(`${BASE_URL}/generate`, dto);
    return unwrap<InvoiceResponse>(res);
  },

  /** POST /api/invoices/:id/send */
  sendInvoiceMail: async (invoiceId: number, dto: SendInvoiceMailDto): Promise<void> => {
    await api.post(`${BASE_URL}/${invoiceId}/send`, dto);
  },

  /** GET /api/invoices */
  getAll: async (): Promise<InvoiceResponse[]> => {
    const res = await api.get(BASE_URL);
    const data = unwrap<InvoiceResponse[]>(res);
    return Array.isArray(data) ? data : [];
  },

  /** GET /api/invoices/:id */
  getById: async (id: number): Promise<InvoiceResponse> => {
    const res = await api.get(`${BASE_URL}/${id}`);
    return unwrap<InvoiceResponse>(res);
  },

  /** DELETE /api/invoices/:invoiceId/items/:itemId */
  removeItem: async (invoiceId: number, itemId: number): Promise<InvoiceResponse> => {
    const res = await api.delete(`${BASE_URL}/${invoiceId}/items/${itemId}`);
    return unwrap<InvoiceResponse>(res);
  },

  // ── Company helpers ───────────────────────────────────────────────────────

  /** GET /api/companies/status/AGREEMENT_SIGNED */
  getRegisteredCompanies: async (): Promise<CompanyOption[]> => {
    const res = await api.get(`/api/companies/status/AGREEMENT_SIGNED`);
    const data = unwrap<CompanyOption[]>(res);
    return Array.isArray(data) ? data : [];
  },

  /** GET /api/quotations/company/:companyId */
  getLatestQuotationForCompany: async (companyId: number): Promise<QuotationForCompany | null> => {
    const res = await api.get(`/api/quotations/company/${companyId}`);
    const list = unwrap<QuotationForCompany[]>(res);
    if (!list || list.length === 0) return null;
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  },
};