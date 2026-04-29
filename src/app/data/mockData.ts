// mockData.ts

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
  status: 'REGISTERED' | 'QUOTATION_SENT' | 'AGREEMENT_SENT' | 'AGREEMENT_SIGNED' | 'INVOICED' | 'ACTIVE' | 'INACTIVE';
  registeredDate?: string;
}

export interface QuotationItem {
  id: string;
  description: string;
  qty: number;
  unit: string;
  rate: number;
  amount: number;
}

export interface Quotation {
  id: string;
  quotationNo: string;
  companyId: string;
  companyName: string;
  date: string;
  validUntil: string;
  items: QuotationItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes: string;
  termsAndConditions: string;
  emailSubject : string;
  emailBody : string;
}

export interface AgreementTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  lastModified: string;
}

export interface Agreement {
  id: string;
  agreementNo: string;
  companyId: string;
  companyName: string;
  date: string;
  templateId: string;
  templateName: string;
  content: string;
  additionalClauses: string[];
  notes: string;
  signed?: boolean;
  emailSubject : string;
  emailBody : string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  rate: number;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  companyId: string;
  companyName: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  paymentTerms: string;
  notes: string;
  emailSubject : string;
  emailBody : string;
}

// ─── OUR COMPANY DETAILS ──────────────────────────────────────────────────────
export const OUR_COMPANY = {
  name: 'RA & RA Counsel',
  address: '123, Tech Park, Whitefield',
  city: 'Pune',
  state: 'Maharashtra',
  country: 'India',
  pincode: '411001',
  phone: '+91 80 1234 5678',
  email: 'info@rara.in',
  website: 'www.rara.in',
  gstin: '27ABKFR0344M1ZV',
  cin: 'U72200MH2010PTC054321',
  bankName: 'HDFC Bank',
  accountNo: '50100123456789',
  ifscCode: 'HDFC0001234',
  branch: 'Pune',
};

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export const agreementTemplates: AgreementTemplate[] = [
  {
    id: 'tmpl-001',
    name: 'Service Agreement',
    category: 'Services',
    lastModified: '2026-02-15',
    content: `SERVICE AGREEMENT... (Content Omitted for Brevity)`,
  },
  {
    id: 'tmpl-002',
    name: 'Non-Disclosure Agreement (NDA)',
    category: 'Confidentiality',
    lastModified: '2026-01-20',
    content: `NON-DISCLOSURE AGREEMENT... (Content Omitted for Brevity)`,
  },
];

// All initial arrays are empty — data comes from backend
export const initialCompanies: Company[] = [];
export const initialQuotations: Quotation[] = [];
export const initialAgreements: Agreement[] = [];
export const initialInvoices: Invoice[] = [];