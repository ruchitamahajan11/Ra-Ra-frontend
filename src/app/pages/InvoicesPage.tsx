import React, { useState, useEffect } from 'react';
import { Plus, X, Trash2, Eye, Receipt, Send, Check, ArrowLeft, Download, AlertCircle, Loader2, Info, Mail, FileText, Search, CheckCircle } from 'lucide-react';
import { OUR_COMPANY, formatCurrency } from '../data/mockData';
import {
  invoiceService,
  InvoiceResponse,
  CompanyOption,
  InvoiceRequestDto,
} from '../../services/invoiceService';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateId() { return `item-${Date.now()}-${Math.random().toString(36).slice(2)}`; }
function todayISO() { return new Date().toISOString().split('T')[0]; }
function oneMonthLaterISO() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().split('T')[0];
}
function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

const inputCls =
  'w-full px-3.5 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';

// ─── Item type ────────────────────────────────────────────────────────────────
interface InvoiceLineItem {
  id: string;
  description: string;
  rate: number | '';
  discountPercent: number | '';
  discountAmount: number | '';
  taxPercent: number | '';
  taxAmount: number | '';
  totalAmount: number;
}

function calcTotal(item: InvoiceLineItem): number {
  const rate = Number(item.rate) || 0;
  const discountAmount = Number(item.discountAmount) || 0;
  const taxAmount = Number(item.taxAmount) || 0;
  return (rate - discountAmount) + taxAmount;
}

function makeItem(): InvoiceLineItem {
  return {
    id: generateId(),
    description: '',
    rate: '',
    discountPercent: '',
    discountAmount: '',
    taxPercent: '',
    taxAmount: '',
    totalAmount: 0,
  };
}

function quotationToLineItems(q: { items: { id: number; serviceDescription: string; price: number }[]; discountPercent: number; taxPercent: number }): InvoiceLineItem[] {
  return q.items.map(i => {
    const rate      = Number(i.price) || 0;
    const discPct   = Number(q.discountPercent) || 0;
    const taxPct    = Number(q.taxPercent) || 0;
    const discAmt   = parseFloat(((rate * discPct) / 100).toFixed(2));
    const afterDisc = rate - discAmt;
    const taxAmt    = parseFloat(((afterDisc * taxPct) / 100).toFixed(2));
    const total     = parseFloat((afterDisc + taxAmt).toFixed(2));
    return {
      id:              `quot-${i.id}`,
      description:     i.serviceDescription,
      rate,
      discountPercent: discPct || '',
      discountAmount:  discAmt || '',
      taxPercent:      taxPct || '',
      taxAmount:       taxAmt || '',
      totalAmount:     total,
    };
  });
}

// ─── Preview Sheet ────────────────────────────────────────────────────────────
// FIX: z-[60] so it layers above the parent modal (z-50), p-4 sm:p-6 for proper centering
function InvoicePreviewSheet({
  invoiceNo, date, dueDate, items, company, onClose,
}: {
  invoiceNo: string;
  date: string;
  dueDate: string;
  items: InvoiceLineItem[];
  company: CompanyOption | undefined;
  onClose: () => void;
}) {
  const subtotal      = items.reduce((s, i) => s + (Number(i.rate) || 0), 0);
  const totalDiscount = items.reduce((s, i) => s + (Number(i.discountAmount) || 0), 0);
  const totalTax      = items.reduce((s, i) => s + (Number(i.taxAmount) || 0), 0);
  const grandTotal    = items.reduce((s, i) => s + i.totalAmount, 0);

  return (
    <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0 border-b border-slate-100">
          <h3 className="text-slate-800 font-semibold">Invoice Preview</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
          >
            <X size={16} className="text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden text-xs"
            style={{ fontFamily: 'Arial, sans-serif' }}
          >
            {/* Document Header */}
            <div style={{ background: '#0c1e3d' }} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-blue-200 font-bold text-sm">{OUR_COMPANY.name}</p>
                  <p className="text-blue-300 text-xs mt-0.5">{OUR_COMPANY.city}, {OUR_COMPANY.state}</p>
                  <p className="text-blue-300 text-xs">GSTIN: {OUR_COMPANY.gstin}</p>
                </div>
                <div className="text-right">
                  <p className="text-yellow-300 font-bold">TAX INVOICE</p>
                  <p className="text-blue-200 text-xs mt-0.5">{invoiceNo}</p>
                  <p className="text-blue-300 text-xs">{formatDate(date)}</p>
                  {dueDate && (
                    <p className="text-red-300 text-xs font-medium">Due: {formatDate(dueDate)}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Bill To */}
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
              <p
                className="text-slate-400 font-semibold uppercase tracking-wider mb-1"
                style={{ fontSize: 10 }}
              >
                Bill To
              </p>
              {company ? (
                <>
                  <p className="font-semibold text-slate-800 text-sm">{company.companyName}</p>
                  <p className="text-slate-500 text-xs">{company.city}, {company.state}</p>
                  <p className="text-slate-500 text-xs">GSTIN: {company.gstNumber}</p>
                </>
              ) : (
                <p className="text-slate-300 text-xs italic">Select a company</p>
              )}
            </div>

            {/* Line Items */}
            <div className="p-4">
              <p
                className="text-slate-500 font-semibold uppercase tracking-wider mb-2"
                style={{ fontSize: 10 }}
              >
                Line Items
              </p>
              <div
                className="grid grid-cols-12 gap-1 pb-1 border-b border-slate-200 text-slate-400 font-semibold"
                style={{ fontSize: 9 }}
              >
                <span className="col-span-4">Description</span>
                <span className="col-span-2 text-right">Rate</span>
                <span className="col-span-2 text-right">Disc.</span>
                <span className="col-span-2 text-right">Tax</span>
                <span className="col-span-2 text-right">Total</span>
              </div>

              {items.length === 0 && (
                <p className="text-slate-300 text-xs italic py-3 text-center">No items added</p>
              )}

              {items.map(item => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-1 py-2 border-b border-slate-50 items-start"
                >
                  <span className="col-span-4 text-slate-700 font-medium" style={{ fontSize: 10 }}>
                    {item.description || '—'}
                  </span>
                  <span className="col-span-2 text-right text-slate-600" style={{ fontSize: 10 }}>
                    {formatCurrency(Number(item.rate) || 0)}
                  </span>
                  <span className="col-span-2 text-right text-red-400" style={{ fontSize: 10 }}>
                    -{formatCurrency(Number(item.discountAmount) || 0)}
                    {Number(item.discountPercent) > 0 && (
                      <span className="block text-slate-400" style={{ fontSize: 8 }}>
                        ({item.discountPercent}%)
                      </span>
                    )}
                  </span>
                  <span className="col-span-2 text-right text-slate-600" style={{ fontSize: 10 }}>
                    {formatCurrency(Number(item.taxAmount) || 0)}
                  </span>
                  <span
                    className="col-span-2 text-right text-slate-800 font-semibold"
                    style={{ fontSize: 10 }}
                  >
                    {formatCurrency(item.totalAmount)}
                  </span>
                </div>
              ))}

              {/* Totals */}
              <div className="mt-4 flex justify-end">
                <div className="w-1/2 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-red-400">
                    <span>Total Discount</span>
                    <span>-{formatCurrency(totalDiscount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Total Tax</span>
                    <span>{formatCurrency(totalTax)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-800 pt-2 border-t border-slate-200">
                    <span>Total Due</span>
                    <span className="text-blue-600">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Create Invoice View ───────────────────────────────────────────────────────
function CreateInvoiceView({ onBack, onCreated }: { onBack: () => void; onCreated: (inv: InvoiceResponse) => void }) {
  const date    = todayISO();
  const dueDate = oneMonthLaterISO();

  // ── Tab state ──
  const [activeTab, setActiveTab] = useState<'details' | 'email'>('details');

  // ── Details tab state ──
  const [companies, setCompanies]               = useState<CompanyOption[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [companyId, setCompanyId]               = useState('');
  const [loadingQuotation, setLoadingQuotation] = useState(false);
  const [quotationBadge, setQuotationBadge]     = useState('');
  const [quotationError, setQuotationError]     = useState('');
  const [items, setItems]                       = useState<InvoiceLineItem[]>([makeItem()]);

  // ── Email tab state ──
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody]       = useState('');

  // ── Shared state ──
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);
  const [error, setError]             = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // ── Derived ──
  const safeCompanies   = Array.isArray(companies) ? companies : [];
  const selectedCompany = safeCompanies.find(c => String(c.id) === companyId);
  const grandTotal      = items.reduce((s, i) => s + i.totalAmount, 0);
  const detailsComplete = !!companyId;
  const emailComplete   = emailSubject.trim().length > 0 && emailBody.trim().length > 0;

  useEffect(() => {
    invoiceService.getRegisteredCompanies()
      .then(data => setCompanies(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load companies. Please try again.'))
      .finally(() => setLoadingCompanies(false));
  }, []);

  useEffect(() => {
    if (!companyId) {
      setItems([makeItem()]);
      setQuotationBadge('');
      setQuotationError('');
      return;
    }
    setLoadingQuotation(true);
    setQuotationBadge('');
    setQuotationError('');
    invoiceService.getLatestQuotationForCompany(Number(companyId))
      .then(q => {
        if (!q || !q.items?.length) {
          setQuotationError('No quotation found for this company. You can add items manually.');
          setItems([makeItem()]);
        } else {
          setItems(quotationToLineItems(q));
          setQuotationBadge(`${q.quotationNumber} · ${q.items.length} item(s) loaded`);
        }
      })
      .catch(() => {
        setQuotationError('Could not load quotation. Add items manually.');
        setItems([makeItem()]);
      })
      .finally(() => setLoadingQuotation(false));
  }, [companyId]);

  const updateItem = (id: string, field: keyof InvoiceLineItem, value: string | number) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      if (field === 'discountPercent' || field === 'rate') {
        const rate = Number(updated.rate) || 0;
        const pct  = Number(updated.discountPercent) || 0;
        if (pct > 0) updated.discountAmount = parseFloat(((rate * pct) / 100).toFixed(2));
      }
      if (field === 'taxPercent' || field === 'rate' || field === 'discountAmount' || field === 'discountPercent') {
        const rate           = Number(updated.rate) || 0;
        const discountAmount = Number(updated.discountAmount) || 0;
        const taxPct         = Number(updated.taxPercent) || 0;
        if (taxPct > 0) updated.taxAmount = parseFloat((((rate - discountAmount) * taxPct) / 100).toFixed(2));
      }
      updated.totalAmount = calcTotal(updated);
      return updated;
    }));
  };

  const addItem    = () => setItems(prev => [...prev, makeItem()]);
  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  // ── Step 1: generate invoice → Step 2: send mail ──
  const handleSaveAndSendMail = async () => {
    if (!companyId) {
      setError('Please select a company.');
      setActiveTab('details');
      return;
    }
    if (!emailSubject.trim() || !emailBody.trim()) {
      setError('Please fill in email subject and body.');
      setActiveTab('email');
      return;
    }

    setError('');
    setSaving(true);
    try {
      const dto: InvoiceRequestDto = {
        companyId:       Number(companyId),
        dueDate,
        discountPercent: Number(items[0]?.discountPercent) || 0,
        taxPercent:      Number(items[0]?.taxPercent)      || 0,
      };
      const created = await invoiceService.generateFromQuotation(dto);

      await invoiceService.sendInvoiceMail(created.id, {
        emailSubject: emailSubject.trim(),
        emailBody:    emailBody.trim(),
      });

      onCreated(created);
      setSaved(true);
      setTimeout(() => { setSaved(false); onBack(); }, 1200);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save or send invoice. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full bg-white shadow-sm sm:rounded-2xl sm:border border-slate-200 overflow-hidden sm:my-4">

      {/* ── Top bar ── */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 shrink-0">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
        >
          <ArrowLeft size={16} className="text-slate-600" />
        </button>
        <div className="flex-1">
          <h2 className="text-slate-800 font-semibold text-sm">New Invoice</h2>
          <p className="text-slate-400 text-xs">ID assigned after save</p>
        </div>
        <button
          onClick={() => setShowPreview(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors"
        >
          <Eye size={13} /> Preview
        </button>
      </div>

      {/* ── Grand Total Banner ── */}
      <div className="bg-blue-600 px-4 py-2.5 flex items-center justify-between shrink-0">
        <span className="text-blue-200 text-xs">Invoice Total</span>
        <span className="text-white font-bold text-base">{formatCurrency(grandTotal)}</span>
      </div>

      {/* ── Tab switcher — pill style matching quotation page ── */}
      <div className="bg-white border-b border-slate-100 px-4 pt-3 pb-0 shrink-0">
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'details' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            <FileText size={13} />
            Details
            {detailsComplete && (
              <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center ml-0.5">
                <Check size={9} className="text-white" />
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'email' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            <Mail size={13} />
            Email Details
            {emailComplete && (
              <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center ml-0.5">
                <Check size={9} className="text-white" />
              </span>
            )}
          </button>
        </div>
        <div className="h-3" />
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <div className="p-4 space-y-4">

          {/* ════ DETAILS TAB ════ */}
          {activeTab === 'details' && (
            <>
              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                  <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              )}

              <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3.5 py-3 text-xs text-amber-700">
                <Info size={14} className="shrink-0 mt-0.5" />
                <span>Only companies with a sent agreement are available for invoicing.</span>
              </div>

              {/* ── Company ── */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-50 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">Select Company</p>
                  {companyId && (
                    <CheckCircle size={14} className="text-green-500 ml-auto shrink-0" />
                  )}
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5 font-medium">
                      Company <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={companyId}
                      onChange={e => setCompanyId(e.target.value)}
                      className={inputCls}
                      disabled={loadingCompanies}
                    >
                      <option value="">
                        {loadingCompanies
                          ? 'Loading companies…'
                          : `Select Company (${safeCompanies.length} available)`}
                      </option>
                      {safeCompanies.map(c => (
                        <option key={c.id} value={String(c.id)}>{c.companyName}</option>
                      ))}
                    </select>
                  </div>

                  {selectedCompany && (
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
                      <p className="font-semibold">{selectedCompany.companyName}</p>
                      <p className="text-blue-500 mt-0.5">
                        {selectedCompany.city}, {selectedCompany.state} · {selectedCompany.contactPersonName}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {loadingQuotation && (
                <div className="flex items-center gap-2 text-slate-400 text-xs py-1">
                  <Loader2 size={13} className="animate-spin" /> Loading quotation items…
                </div>
              )}

              {quotationBadge && !loadingQuotation && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-3.5 py-2.5 text-xs text-green-700">
                  <Check size={13} className="shrink-0" />
                  <span>Quotation pre-filled: <span className="font-medium">{quotationBadge}</span></span>
                </div>
              )}

              {quotationError && !loadingQuotation && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3.5 py-2.5 text-xs text-amber-700">
                  <AlertCircle size={13} className="shrink-0" /><span>{quotationError}</span>
                </div>
              )}

              {/* ── Dates ── */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between bg-white rounded-xl px-3.5 py-3 border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-medium">Invoice Date</span>
                  <span className="text-sm text-slate-700 font-semibold">{formatDate(date)}</span>
                </div>
                <div className="flex items-center justify-between bg-white rounded-xl px-3.5 py-3 border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-medium">Due Date</span>
                  <span className="text-sm text-slate-700 font-semibold">{formatDate(dueDate)}</span>
                </div>
              </div>

              {/* ── Divider ── */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400 font-medium">Line Items</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* ── Items ── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-slate-500">{items.length} item(s)</p>
                  <button
                    onClick={addItem}
                    className="flex items-center gap-1 text-xs text-blue-600 font-medium bg-blue-100 hover:bg-blue-200 transition-colors px-3 py-1.5 rounded-lg"
                  >
                    <Plus size={13} /> Add Item
                  </button>
                </div>

                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-400">Item {idx + 1}</span>
                      {items.length > 1 && (
                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-7 h-7 flex items-center justify-center bg-red-50 hover:bg-red-100 transition-colors rounded-lg"
                        >
                          <Trash2 size={13} className="text-red-400" />
                        </button>
                      )}
                    </div>
                    <input
                      value={item.description}
                      onChange={e => updateItem(item.id, 'description', e.target.value)}
                      className={inputCls}
                      placeholder="Description of goods/services"
                    />
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Rate (₹)</label>
                      <input
                        type="number" min={0}
                        value={item.rate}
                        onChange={e => updateItem(item.id, 'rate', e.target.value === '' ? '' : Number(e.target.value))}
                        className={inputCls} placeholder="0"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Discount %</label>
                        <input type="number" min={0} max={100} value={item.discountPercent}
                          onChange={e => updateItem(item.id, 'discountPercent', e.target.value === '' ? '' : Number(e.target.value))}
                          className={inputCls} placeholder="0" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">
                          Discount Amt (₹){Number(item.discountPercent) > 0 && <span className="ml-1 text-blue-400">auto</span>}
                        </label>
                        <input type="number" min={0} value={item.discountAmount}
                          onChange={e => updateItem(item.id, 'discountAmount', e.target.value === '' ? '' : Number(e.target.value))}
                          className={`${inputCls} ${Number(item.discountPercent) > 0 ? 'bg-slate-50 text-slate-400' : ''}`}
                          placeholder="0" readOnly={Number(item.discountPercent) > 0} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Tax %</label>
                        <input type="number" min={0} max={100} value={item.taxPercent}
                          onChange={e => updateItem(item.id, 'taxPercent', e.target.value === '' ? '' : Number(e.target.value))}
                          className={inputCls} placeholder="0" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">
                          Tax Amount (₹){Number(item.taxPercent) > 0 && <span className="ml-1 text-blue-400">auto</span>}
                        </label>
                        <input type="number" min={0} value={item.taxAmount}
                          onChange={e => updateItem(item.id, 'taxAmount', e.target.value === '' ? '' : Number(e.target.value))}
                          className={`${inputCls} ${Number(item.taxPercent) > 0 ? 'bg-slate-50 text-slate-400' : ''}`}
                          placeholder="0" readOnly={Number(item.taxPercent) > 0} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-blue-50/50 border border-blue-100 rounded-xl px-3.5 py-2.5">
                      <span className="text-xs text-blue-600 font-medium">Item Total</span>
                      <span className="text-sm font-bold text-blue-700">{formatCurrency(item.totalAmount)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Grand Total Summary ── */}
              {items.length > 0 && (
                <div className="bg-slate-800 rounded-2xl p-4 shadow-md">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Subtotal (Rate)</span>
                      <span>{formatCurrency(items.reduce((s, i) => s + (Number(i.rate) || 0), 0))}</span>
                    </div>
                    <div className="flex justify-between text-red-400">
                      <span>Total Discount</span>
                      <span>-{formatCurrency(items.reduce((s, i) => s + (Number(i.discountAmount) || 0), 0))}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Total Tax</span>
                      <span>{formatCurrency(items.reduce((s, i) => s + (Number(i.taxAmount) || 0), 0))}</span>
                    </div>
                    <div className="flex justify-between text-white font-bold pt-2 border-t border-slate-600">
                      <span>Total Due</span>
                      <span className="text-blue-300">{formatCurrency(grandTotal)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Nudge to email tab ── */}
              {detailsComplete && !emailComplete && (
                <button
                  onClick={() => setActiveTab('email')}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-100 transition-colors rounded-2xl text-blue-600 text-xs font-semibold shadow-sm"
                >
                  <Mail size={13} /> Fill in Email Details to enable Save &amp; Send →
                </button>
              )}
            </>
          )}

          {/* ════ EMAIL DETAILS TAB ════ */}
          {activeTab === 'email' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                  <Mail size={12} className="text-white" />
                </div>
                <p className="text-sm font-semibold text-slate-800 flex-1">Email Details</p>
                {emailComplete && (
                  <span className="w-5 h-5 rounded-full bg-green-500 shadow-sm flex items-center justify-center">
                    <Check size={11} className="text-white" />
                  </span>
                )}
              </div>

              <div className="p-4 space-y-4">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
                  These fields will be used as the subject and body of the email sent to the company.
                  Both are required to use "Save &amp; Send Mail".
                </div>

                {error && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                    <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-600">{error}</p>
                  </div>
                )}

                {/* Subject */}
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-medium">
                    Email Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={e => setEmailSubject(e.target.value)}
                    className={`${inputCls} ${
                      emailSubject.trim() ? 'border-green-300 focus:ring-green-400 bg-green-50/20' : ''
                    }`}
                    placeholder="e.g. Invoice from RA & RA — Services"
                  />
                  <p className="text-xs text-slate-400 mt-1">{emailSubject.length} characters</p>
                </div>

                {/* Body */}
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-medium">
                    Email Body <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={emailBody}
                    onChange={e => setEmailBody(e.target.value)}
                    className={`${inputCls} resize-none ${
                      emailBody.trim() ? 'border-green-300 focus:ring-green-400 bg-green-50/20' : ''
                    }`}
                    rows={10}
                    placeholder={'Dear Sir/Madam,\n\nPlease find attached our invoice for your review...\n\nBest Regards,\nYour Name'}
                  />
                  <p className="text-xs text-slate-400 mt-1">{emailBody.length} characters</p>
                </div>

                {/* Live preview card */}
                {(emailSubject.trim() || emailBody.trim()) && (
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Preview</p>
                    </div>
                    <div className="p-4 space-y-2">
                      {emailSubject.trim() && (
                        <div>
                          <p className="text-xs text-slate-400 font-medium">Subject</p>
                          <p className="text-sm text-slate-800 font-semibold mt-0.5">{emailSubject}</p>
                        </div>
                      )}
                      {emailBody.trim() && (
                        <div className="pt-2 border-t border-slate-200">
                          <p className="text-xs text-slate-400 font-medium mb-1">Body</p>
                          <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">{emailBody}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Back nudge if details not done */}
                {!detailsComplete && (
                  <button
                    onClick={() => setActiveTab('details')}
                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-300 bg-white hover:bg-slate-50 transition-colors rounded-2xl text-slate-500 text-xs font-medium shadow-sm"
                  >
                    <ArrowLeft size={13} /> Complete Details tab first
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="h-4" />
        </div>
      </div>

      {/* ── Bottom action bar ── */}
      <div className="px-4 py-4 bg-white border-t border-slate-200 shrink-0 space-y-2 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] z-10 relative">
        {detailsComplete && !emailComplete && (
          <p className="text-center text-xs text-amber-500 pb-1 font-medium">
            ⚠ Fill in Email Details (subject &amp; body) to enable Save &amp; Send
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <Download size={15} /> Download
          </button>
          <button
            disabled
            className="flex-1 flex items-center justify-center gap-2 py-3 border border-slate-100 text-slate-300 bg-slate-50 rounded-xl text-sm font-medium cursor-not-allowed"
          >
            <FileText size={15} />
            {items.length} item(s)
          </button>
        </div>

        <button
          onClick={handleSaveAndSendMail}
          disabled={!companyId || !emailComplete || saving || saved}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold disabled:opacity-50 disabled:bg-slate-300 hover:bg-blue-700 transition-colors shadow-md"
        >
          {saved
            ? <><Check size={15} className="stroke-[3]" /> Mail Sent Successfully!</>
            : saving
              ? <><Loader2 size={15} className="animate-spin" /> Saving &amp; Sending…</>
              : <><Send size={15} /> Save &amp; Send Mail</>}
        </button>
      </div>

      {/* Preview overlay — z-[60] to sit above this modal's z-50 */}
      {showPreview && (
        <InvoicePreviewSheet
          invoiceNo="Preview"
          date={date}
          dueDate={dueDate}
          items={items}
          company={selectedCompany}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}

// ─── Main List Page ────────────────────────────────────────────────────────────
export default function InvoicesPage() {
  const [view, setView]               = useState<'list' | 'create'>('list');
  const [invoices, setInvoices]       = useState<InvoiceResponse[]>([]);
  const [loading, setLoading]         = useState(true);
  const [viewInvoice, setViewInvoice] = useState<InvoiceResponse | null>(null);

  // ─── Search State ──────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');

  const loadInvoices = () => {
    setLoading(true);
    invoiceService.getAll()
      .then(data => setInvoices(Array.isArray(data) ? data : []))
      .catch(err => console.error('Failed to load invoices', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadInvoices(); }, []);

  const safeInvoices = Array.isArray(invoices) ? invoices : [];

  // ─── Filter Logic ──────────────────────────────────────────────────────────
  const filteredInvoices = safeInvoices.filter((inv) =>
    inv.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const grandRevenue = safeInvoices.reduce((s, i) => s + Number(i.totalAmount ?? 0), 0);

  return (
    <div className="p-4 space-y-4 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-800" style={{ fontSize: '1.2rem', fontWeight: 700 }}>Invoices</h1>
          <p className="text-slate-400 text-xs">{filteredInvoices.length} total invoices</p>
        </div>
        <button
          onClick={() => setView('create')}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Plus size={15} /> New
        </button>
      </div>

      {/* ─── Search Bar ── */}
      <div className="relative shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={16} className="text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Search by company name or invoice number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
        />
      </div>

      {/* Summary card */}
      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-blue-800 font-bold text-2xl">{formatCurrency(grandRevenue)}</p>
          <p className="text-blue-400 text-xs mt-0.5">Total Invoiced · {safeInvoices.length} invoice(s)</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center shadow-inner">
          <Receipt size={20} className="text-blue-600" />
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10 gap-2 text-slate-400 text-sm">
          <Loader2 size={18} className="animate-spin" /> Loading invoices…
        </div>
      )}

      {!loading && (
        <div className="space-y-2">
          {filteredInvoices.map(inv => (
            <div key={inv.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-all hover:border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                  <Receipt size={14} className="text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-800 text-sm font-semibold truncate">{inv.invoiceNumber}</p>
                  <p className="text-slate-400 text-xs truncate">{inv.companyName}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <p className="text-slate-800 font-bold text-sm">{formatCurrency(Number(inv.totalAmount))}</p>
                  <button
                    onClick={() => setViewInvoice(inv)}
                    className="w-9 h-9 flex items-center justify-center bg-blue-50 hover:bg-blue-100 transition-colors rounded-xl"
                  >
                    <Eye size={15} className="text-blue-600" />
                  </button>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-50 flex items-center justify-between">
                <p className="text-slate-400 text-xs">
                  Due {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'}
                </p>
                <p className="text-slate-500 text-xs font-medium bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                  {(Array.isArray(inv.items) ? inv.items : []).length} item(s)
                </p>
              </div>
            </div>
          ))}

          {filteredInvoices.length === 0 && (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center shadow-sm">
              <Receipt size={32} className="text-slate-200 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No invoices found</p>
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-3 text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors bg-blue-50 px-4 py-2 rounded-lg"
                >
                  Clear search
                </button>
              ) : (
                <button
                  onClick={() => setView('create')}
                  className="mt-3 text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors bg-blue-50 px-4 py-2 rounded-lg"
                >
                  Create one
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Create Invoice Modal ── */}
      {view === 'create' && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm">
          <CreateInvoiceView
            onBack={() => { setView('list'); loadInvoices(); }}
            onCreated={inv => { setInvoices(prev => [inv, ...prev]); }}
          />
        </div>
      )}

      {/* View existing invoice preview — z-50 is fine here since no parent modal */}
      {viewInvoice && (
        <InvoicePreviewSheet
          invoiceNo={viewInvoice.invoiceNumber}
          date={viewInvoice.createdAt}
          dueDate={viewInvoice.dueDate}
          items={(Array.isArray(viewInvoice.items) ? viewInvoice.items : []).map(i => ({
            id:              String(i.id),
            description:     i.serviceDescription,
            rate:            Number(i.price) || 0,
            discountPercent: Number(viewInvoice.discountPercent) || 0,
            discountAmount:  parseFloat(((Number(i.price) * Number(viewInvoice.discountPercent)) / 100).toFixed(2)),
            taxPercent:      Number(viewInvoice.taxPercent) || 0,
            taxAmount:       parseFloat((((Number(i.price) - (Number(i.price) * Number(viewInvoice.discountPercent)) / 100) * Number(viewInvoice.taxPercent)) / 100).toFixed(2)),
            totalAmount:     Number(i.price),
          }))}
          company={undefined}
          onClose={() => setViewInvoice(null)}
        />
      )}
    </div>
  );
}