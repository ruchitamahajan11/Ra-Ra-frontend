// store.ts
import { create } from 'zustand';
import { QuotationResponse } from '../../services/quotationService';

// ── Company (matches backend exactly) ───────────────────────────────────────
export interface Company {
  id?: number | string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  gstNumber: string;
  contactPersonName: string;
  contactPersonPhone: string;
  status: 'REGISTERED' | 'AGREEMENT_SENT' | 'AGREEMENT_SIGNED' | 'ACTIVE' | 'INACTIVE';
  registeredDate?: string;
}

export interface Agreement { companyId?: number | string; [key: string]: any }
export interface Invoice   { companyId?: number | string; [key: string]: any }

// ── Store ────────────────────────────────────────────────────────────────────
interface StoreState {
  companies:       Company[];
  quotations:      QuotationResponse[];
  agreements:      Agreement[];
  invoices:        Invoice[];
  loading:         boolean;

  addCompany:      (company: Company)          => void;
  setAllCompanies: (data: Company[])           => void;
  addQuotation:    (q: QuotationResponse)      => void;
  setQuotations:   (data: QuotationResponse[]) => void;
  setAgreements:   (data: Agreement[])         => void;
  setInvoices:     (data: Invoice[])           => void;
  setLoading:      (val: boolean)              => void;
}

export const useStore = create<StoreState>((set) => ({
  companies:  [],
  quotations: [],
  agreements: [],
  invoices:   [],
  loading:    false,

  addCompany:      (company) => set((s) => ({ companies: [...s.companies, company] })),
  setAllCompanies: (data)    => set({ companies: data }),
  addQuotation:    (q)       => set((s) => ({ quotations: [...s.quotations, q] })),
  setQuotations:   (data)    => set({ quotations: data }),
  setAgreements:   (data)    => set({ agreements: data }),
  setInvoices:     (data)    => set({ invoices: data }),
  setLoading:      (val)     => set({ loading: val }),
}));