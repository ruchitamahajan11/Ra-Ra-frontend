import React, { useState, useEffect } from 'react';
import {
  Plus, X, Trash2, Eye, FileText, Send, Check,
  ArrowLeft, Download, AlertCircle, Loader2, Mail,
  ChevronDown, ChevronUp, Search, CheckCircle,
} from 'lucide-react';
import { OUR_COMPANY, formatCurrency } from '../data/mockData';
import {
  quotationService,
  QuotationResponse,
  CompanyOption,
  QuotationRequest 
} from '../../services/quotationService';

function generateId() { return `item-${Date.now()}-${Math.random().toString(36).slice(2)}`; }
function todayISO() { return new Date().toISOString().split('T')[0]; }
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

const inputCls =
  'w-full px-3.5 py-3 text-sm border border-slate-200 rounded-xl ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';

interface ExtendedItem {
  id: string;
  description: string;
  rate: number | '';
  discountPercent: number | '';
  discountAmount: number | '';
  taxPercent: number | '';
  taxAmount: number | '';
  totalAmount: number;
}

function calcTotal(item: ExtendedItem): number {
  const rate = Number(item.rate) || 0;
  const discountAmount = Number(item.discountAmount) || 0;
  const taxAmount = Number(item.taxAmount) || 0;
  return (rate - discountAmount) + taxAmount;
}

function makeItem(): ExtendedItem {
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

function PreviewSheet({
  quotation,
  company,
  items,
  onClose,
}: {
  quotation: { quotationNo: string; date: string };
  company: CompanyOption | undefined;
  items: ExtendedItem[];
  onClose: () => void;
}) {
  const subtotal = items.reduce((s, i) => s + (Number(i.rate) || 0), 0);
  const totalDiscount = items.reduce((s, i) => s + (Number(i.discountAmount) || 0), 0);
  const totalTax = items.reduce((s, i) => s + (Number(i.taxAmount) || 0), 0);
  const grandTotal = items.reduce((s, i) => s + i.totalAmount, 0);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 shrink-0 border-b border-slate-100">
          <h3 className="text-slate-800 font-semibold">Quotation Preview</h3>
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
            <div style={{ background: '#0c1e3d' }} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-blue-200 font-bold text-sm">{OUR_COMPANY.name}</p>
                  <p className="text-blue-300 text-xs mt-0.5">{OUR_COMPANY.city}, {OUR_COMPANY.state}</p>
                  <p className="text-blue-300 text-xs">GSTIN: {OUR_COMPANY.gstin}</p>
                </div>
                <div className="text-right">
                  <p className="text-yellow-300 font-bold">QUOTATION</p>
                  <p className="text-blue-200 text-xs mt-0.5">{quotation.quotationNo}</p>
                  <p className="text-blue-300 text-xs">{formatDate(quotation.date)}</p>
                </div>
              </div>
            </div>

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

              {items.map((item) => (
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

              <div className="mt-4 flex justify-end">
                <div className="w-1/2 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal (Rate)</span>
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
                    <span>Grand Total</span>
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

function CreateQuotationView({
  onBack,
  onCreated,
}: {
  onBack: () => void;
  onCreated: (q: QuotationResponse) => void;
}) {
  const [activeTab, setActiveTab] = useState<'details' | 'email'>('details');

  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  const [companyId, setCompanyId] = useState('');
  const date = todayISO();
  const [items, setItems] = useState<ExtendedItem[]>([makeItem()]);
  const [showPreview, setShowPreview] = useState(false);

  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  const [actionState, setActionState] = useState<
    'idle' | 'saving' | 'saved' | 'sending' | 'sent' | 'error'
  >('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const isLoading = actionState === 'saving' || actionState === 'sending';

  useEffect(() => {
    // 💡 Fetching using the renamed logical method: getEligibleCompanies
    quotationService
      .getEligibleCompanies()
      .then((data) => setCompanies(data))
      .catch(() => setErrorMsg('Failed to load companies'))
      .finally(() => setLoadingCompanies(false));
  }, []);

  const selectedCompany = companies.find((c) => String(c.id) === companyId);
  const grandTotal = items.reduce((s, i) => s + i.totalAmount, 0);

  const updateItem = (id: string, field: keyof ExtendedItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === 'discountPercent' || field === 'rate') {
          const rate = Number(updated.rate) || 0;
          const pct = Number(updated.discountPercent) || 0;
          updated.discountAmount =
            pct > 0 ? parseFloat(((rate * pct) / 100).toFixed(2)) : updated.discountAmount;
        }
        if (field === 'taxPercent' || field === 'rate') {
          const rate = Number(updated.rate) || 0;
          const discountAmount = Number(updated.discountAmount) || 0;
          const taxPct = Number(updated.taxPercent) || 0;
          updated.taxAmount =
            taxPct > 0
              ? parseFloat((((rate - discountAmount) * taxPct) / 100).toFixed(2))
              : updated.taxAmount;
        }
        updated.totalAmount = calcTotal(updated);
        return updated;
      }),
    );
  };

  const addItem = () => setItems((prev) => [...prev, makeItem()]);
  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const isDetailsValid = !!companyId;
  const isEmailValid = !!emailSubject.trim() && !!emailBody.trim();
  const isSendValid = isDetailsValid && isEmailValid;

  const buildPayload = (): QuotationRequest => {
    const firstItem = items[0] || makeItem();
    const subtotal = items.reduce((s, i) => s + (Number(i.rate) || 0), 0);
    const totalDiscount = items.reduce((s, i) => s + (Number(i.discountAmount) || 0), 0);
    const totalTax = items.reduce((s, i) => s + (Number(i.taxAmount) || 0), 0);
    const finalGrandTotal = items.reduce((s, i) => s + i.totalAmount, 0);

    return {
      companyId: Number(companyId),
      discountPercent: Number(firstItem.discountPercent) || 0,
      taxPercent: Number(firstItem.taxPercent) || 0,
      subtotal: subtotal,
      discountAmount: totalDiscount,
      taxAmount: totalTax,
      totalAmount: finalGrandTotal,
      items: items.map((i) => ({
        serviceDescription: i.description,
        price: Number(i.rate) || 0,
        rate: Number(i.rate) || 0,
        amount: Number(i.rate) || 0,
        discountPercent: Number(i.discountPercent) || 0,
        taxPercent: Number(i.taxPercent) || 0,
        discountAmount: Number(i.discountAmount) || 0,
        taxAmount: Number(i.taxAmount) || 0,
        totalAmount: i.totalAmount || 0,
      })),
    };
  };

  const handleSaveOnly = async () => {
    if (!isDetailsValid || isLoading) return;
    setActionState('saving');
    setErrorMsg('');
    try {
      const payload = buildPayload();
      const created = await quotationService.create(payload);
      onCreated(created);
      setActionState('saved');
      setTimeout(() => {
        setActionState('idle');
        onBack();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message || err?.message || 'Failed to save quotation. Please try again.',
      );
      setActionState('error');
    }
  };

  const handleSaveAndSend = async () => {
    if (!isSendValid || isLoading) return;
    setActionState('sending');
    setErrorMsg('');
    try {
      const payload = buildPayload();

      const created = await quotationService.create(payload);

      await quotationService.sendQuotation(created.id, {
        emailSubject: emailSubject.trim(),
        emailBody: emailBody.trim(),
      });

      onCreated(created);
      setActionState('sent');
      setTimeout(() => {
        setActionState('idle');
        onBack();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message || err?.message || 'Failed to send quotation. Please try again.',
      );
      setActionState('error');
    }
  };

  const detailsComplete = isDetailsValid;
  const emailComplete = isEmailValid;

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full bg-white shadow-sm sm:rounded-2xl sm:border border-slate-200 overflow-hidden sm:my-4">
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 shrink-0">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
        >
          <ArrowLeft size={16} className="text-slate-600" />
        </button>
        <div className="flex-1">
          <h2 className="text-slate-800 font-semibold text-sm">New Quotation</h2>
          <p className="text-slate-400 text-xs">ID assigned after save</p>
        </div>
        <button
          onClick={() => setShowPreview(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors"
        >
          <Eye size={13} /> Preview
        </button>
      </div>

      <div className="bg-blue-600 px-4 py-2.5 flex items-center justify-between shrink-0">
        <span className="text-blue-200 text-xs">Estimated Total</span>
        <span className="text-white font-bold text-base">{formatCurrency(grandTotal)}</span>
      </div>

      <div className="bg-white border-b border-slate-100 px-4 pt-3 pb-0 shrink-0">
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'details'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500'
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
              activeTab === 'email'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500'
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

      <div className="flex-1 overflow-y-auto bg-slate-50">
        <div className="p-4 space-y-4">

          {actionState === 'error' && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs text-red-600">
                {errorMsg || 'Something went wrong. Please try again.'}
              </p>
            </div>
          )}

          {activeTab === 'details' && (
            <>
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
                      onChange={(e) => setCompanyId(e.target.value)}
                      className={inputCls}
                      disabled={loadingCompanies}
                    >
                      <option value="">
                        {loadingCompanies ? 'Loading companies…' : 'Select Company'}
                      </option>
                      {companies.map((c) => (
                        <option key={c.id} value={String(c.id)}>
                          {c.companyName}
                        </option>
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

              <div className="flex items-center justify-between bg-white rounded-xl px-3.5 py-3 border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-500 font-medium">Date</span>
                <span className="text-sm text-slate-700 font-semibold">{formatDate(date)}</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400 font-medium">Line Items</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

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
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      className={inputCls}
                      placeholder="Description of goods/services"
                    />

                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Rate (₹)</label>
                      <input
                        type="number"
                        min={0}
                        value={item.rate}
                        onChange={(e) =>
                          updateItem(item.id, 'rate', e.target.value === '' ? '' : Number(e.target.value))
                        }
                        className={inputCls}
                        placeholder="0"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Discount %</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={item.discountPercent}
                          onChange={(e) =>
                            updateItem(
                              item.id,
                              'discountPercent',
                              e.target.value === '' ? '' : Number(e.target.value),
                            )
                          }
                          className={inputCls}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Discount Amt (₹)</label>
                        <input
                          type="number"
                          min={0}
                          value={item.discountAmount}
                          onChange={(e) =>
                            updateItem(
                              item.id,
                              'discountAmount',
                              e.target.value === '' ? '' : Number(e.target.value),
                            )
                          }
                          className={inputCls}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Tax %</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={item.taxPercent}
                          onChange={(e) =>
                            updateItem(
                              item.id,
                              'taxPercent',
                              e.target.value === '' ? '' : Number(e.target.value),
                            )
                          }
                          className={inputCls}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Tax Amount (₹)</label>
                        <input
                          type="number"
                          min={0}
                          value={item.taxAmount}
                          onChange={(e) =>
                            updateItem(
                              item.id,
                              'taxAmount',
                              e.target.value === '' ? '' : Number(e.target.value),
                            )
                          }
                          className={`${inputCls} ${
                            Number(item.taxPercent) > 0 ? 'bg-slate-50 text-slate-400' : ''
                          }`}
                          placeholder="0"
                          readOnly={Number(item.taxPercent) > 0}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-blue-50/50 border border-blue-100 rounded-xl px-3.5 py-2.5">
                      <span className="text-xs text-blue-600 font-medium">Item Total</span>
                      <span className="text-sm font-bold text-blue-700">
                        {formatCurrency(item.totalAmount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {items.length > 0 && (
                <div className="bg-slate-800 rounded-2xl p-4 shadow-md">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Subtotal (Rate)</span>
                      <span>
                        {formatCurrency(items.reduce((s, i) => s + (Number(i.rate) || 0), 0))}
                      </span>
                    </div>
                    <div className="flex justify-between text-red-400">
                      <span>Total Discount</span>
                      <span>
                        -{formatCurrency(items.reduce((s, i) => s + (Number(i.discountAmount) || 0), 0))}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Total Tax</span>
                      <span>
                        {formatCurrency(items.reduce((s, i) => s + (Number(i.taxAmount) || 0), 0))}
                      </span>
                    </div>
                    <div className="flex justify-between text-white font-bold pt-2 border-t border-slate-600">
                      <span>Grand Total</span>
                      <span className="text-blue-300">{formatCurrency(grandTotal)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl p-4 space-y-2 border border-slate-200 shadow-sm">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Summary
                </p>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-400">Company</p>
                  <p className="text-xs font-medium text-slate-700">
                    {selectedCompany ? (
                      selectedCompany.companyName ?? selectedCompany.companyName
                    ) : (
                      <span className="text-red-400">Not selected</span>
                    )}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-400">Items</p>
                  <p className="text-xs font-medium text-slate-700">{items.length} item(s)</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-400">Email subject</p>
                  <p className="text-xs font-medium">
                    {emailSubject.trim() ? (
                      <span className="text-green-600">Set</span>
                    ) : (
                      <span className="text-amber-500">Not set</span>
                    )}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-400">Email body</p>
                  <p className="text-xs font-medium">
                    {emailBody.trim() ? (
                      <span className="text-green-600">Set</span>
                    ) : (
                      <span className="text-amber-500">Not set</span>
                    )}
                  </p>
                </div>
              </div>

              {isDetailsValid && !isEmailValid && (
                <button
                  onClick={() => setActiveTab('email')}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-100 transition-colors rounded-2xl text-blue-600 text-xs font-semibold shadow-sm"
                >
                  <Mail size={13} /> Fill in Email Details to enable Save &amp; Send →
                </button>
              )}
            </>
          )}

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
                  Both are required to use "Save &amp; Send".
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-medium">
                    Email Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className={`${inputCls} ${
                      emailSubject.trim() ? 'border-green-300 focus:ring-green-400 bg-green-50/20' : ''
                    }`}
                    placeholder="e.g. Quotation from RA & RA — Services Proposal"
                  />
                  <p className="text-xs text-slate-400 mt-1">{emailSubject.length} characters</p>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-medium">
                    Email Body <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className={`${inputCls} resize-none ${
                      emailBody.trim() ? 'border-green-300 focus:ring-green-400 bg-green-50/20' : ''
                    }`}
                    rows={10}
                    placeholder={
                      'Dear Sir/Madam,\n\nPlease find attached our quotation for your review...\n\nBest Regards,\nYour Name'
                    }
                  />
                  <p className="text-xs text-slate-400 mt-1">{emailBody.length} characters</p>
                </div>

                {(emailSubject.trim() || emailBody.trim()) && (
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Preview
                      </p>
                    </div>
                    <div className="p-4 space-y-2">
                      {emailSubject.trim() && (
                        <div>
                          <p className="text-xs text-slate-400 font-medium">Subject</p>
                          <p className="text-sm text-slate-800 font-semibold mt-0.5">
                            {emailSubject}
                          </p>
                        </div>
                      )}
                      {emailBody.trim() && (
                        <div className="pt-2 border-t border-slate-200">
                          <p className="text-xs text-slate-400 font-medium mb-1">Body</p>
                          <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                            {emailBody}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {!isDetailsValid && (
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

      <div className="px-4 py-4 bg-white border-t border-slate-200 shrink-0 space-y-2 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] z-10 relative">
        {isDetailsValid && !isEmailValid && (
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
            onClick={handleSaveOnly}
            disabled={!isDetailsValid || isLoading}
            className="flex-1 flex items-center justify-center gap-2 py-3 border border-blue-200 text-blue-700 bg-blue-50 rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-blue-100 transition-colors shadow-sm"
          >
            {actionState === 'saving' ? (
              <><Loader2 size={15} className="animate-spin" /> Saving…</>
            ) : actionState === 'saved' ? (
              <><Check size={15} /> Saved!</>
            ) : (
              <>Save Draft</>
            )}
          </button>
        </div>

        <button
          onClick={handleSaveAndSend}
          disabled={!isSendValid || isLoading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold disabled:opacity-50 disabled:bg-slate-300 hover:bg-blue-700 transition-colors shadow-md"
        >
          {actionState === 'sending' ? (
            <><Loader2 size={15} className="animate-spin" /> Saving &amp; Sending…</>
          ) : actionState === 'sent' ? (
            <><Check size={15} className="stroke-[3]" /> Mail Sent Successfully!</>
          ) : (
            <><Send size={15} /> Save &amp; Send Mail</>
          )}
        </button>
      </div>

      {showPreview && (
        <PreviewSheet
          quotation={{ quotationNo: 'Preview', date }}
          company={selectedCompany}
          items={items}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}

export default function QuotationsPage() {
  const [view, setView] = useState<'list' | 'create'>('list');
  const [quotations, setQuotations] = useState<QuotationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewQuotation, setViewQuotation] = useState<QuotationResponse | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');

  const loadQuotations = () => {
    setLoading(true);
    quotationService
      .getAll()
      .then((data) => setQuotations(data))
      .catch((err) => console.error('Failed to load quotations', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadQuotations(); }, []);

  const handleCreated = (q: QuotationResponse) => {
    setQuotations((prev) => [q, ...prev]);
    setView('list'); 
  };

  const filteredQuotations = quotations.filter((q) =>
    q.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.quotationNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 space-y-4 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-800" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
            Quotations
          </h1>
          <p className="text-slate-400 text-xs">{filteredQuotations.length} total records</p>
        </div>
        <button
          onClick={() => setView('create')}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Plus size={15} /> New
        </button>
      </div>

      <div className="relative shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={16} className="text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Search by company name or quotation number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
        />
      </div>

      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-slate-800 font-bold text-2xl">{quotations.length}</p>
          <p className="text-slate-400 text-xs mt-0.5">Total Quotations</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shadow-inner">
          <FileText size={20} className="text-amber-600" />
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10 gap-2 text-slate-400 text-sm">
          <Loader2 size={18} className="animate-spin" /> Loading quotations…
        </div>
      )}

      {!loading && (
        <div className="space-y-2">
          {filteredQuotations.map((q) => (
            <div key={q.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-all hover:border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <FileText size={14} className="text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-800 text-sm font-semibold truncate">{q.quotationNumber}</p>
                  <p className="text-slate-400 text-xs truncate">{q.companyName}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <p className="text-slate-800 font-bold text-sm">
                    {formatCurrency(Number(q.totalAmount))}
                  </p>
                  <button
                    onClick={() => setViewQuotation(q)}
                    className="w-9 h-9 flex items-center justify-center bg-blue-50 hover:bg-blue-100 transition-colors rounded-xl"
                  >
                    <Eye size={15} className="text-blue-600" />
                  </button>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-50 flex items-center justify-between">
                <p className="text-slate-400 text-xs">
                  {new Date(q.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: '2-digit',
                  })}
                </p>
                <p className="text-slate-500 text-xs font-medium bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">{q.items.length} item(s)</p>
              </div>
            </div>
          ))}

          {filteredQuotations.length === 0 && (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center shadow-sm">
              <FileText size={32} className="text-slate-200 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No quotations found</p>
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

      {view === 'create' && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm">
          <CreateQuotationView onBack={() => setView('list')} onCreated={handleCreated} />
        </div>
      )}

      {viewQuotation && (
        <PreviewSheet
          quotation={{
            quotationNo: viewQuotation.quotationNumber,
            date: viewQuotation.createdAt,
          }}
          company={undefined}
          items={viewQuotation.items.map((i) => ({
            id: String(i.id),
            description: i.serviceDescription,
            rate: Number(i.price),
            discountPercent: Number(viewQuotation.discountPercent),
            discountAmount: Number(viewQuotation.discountAmount),
            taxPercent: Number(viewQuotation.taxPercent),
            taxAmount: Number(viewQuotation.taxAmount),
            totalAmount: Number(viewQuotation.totalAmount),
          }))}
          onClose={() => setViewQuotation(null)}
        />
      )}
    </div>
  );
}