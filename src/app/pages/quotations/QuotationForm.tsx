import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  ArrowLeft, Plus, Trash2, FileText, Building2,
  ChevronDown, Calculator, Download, Send, Loader2, AlertCircle,
} from 'lucide-react';
import { useStore } from '../../data/store';
import { quotationService, QuotationItemRequest, CompanyOption } from '../../../services/quotationService';

const inputClass  = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white placeholder-gray-300";
const selectClass = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none cursor-pointer";

function FormSection({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
        <Icon size={17} className="text-blue-600" />
        <h3 className="text-gray-700" style={{ fontWeight: 600, fontSize: '14px' }}>{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

interface LineItem {
  id: string;
  serviceDescription: string;
  price: string; // string in state so user can type decimals freely; parsed on submit
}

export function QuotationForm() {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const { addQuotation } = useStore();

  const preselectedCompanyId = searchParams.get('company') || '';

  const [form, setForm] = useState({
    companyId:       preselectedCompanyId,
    discountPercent: '0',
    taxPercent:      '18',
  });

  const [items, setItems] = useState<LineItem[]>([
    { id: '1', serviceDescription: '', price: '' },
  ]);

  const [companies, setCompanies]               = useState<CompanyOption[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [saving, setSaving]                     = useState(false);
  const [error, setError]                       = useState<string | null>(null);
  const [companyError, setCompanyError]         = useState<string | null>(null);

  // ── Fetch REGISTERED companies ────────────────────────────────────────────
  useEffect(() => {
    const fetchRegisteredCompanies = async () => {
      setLoadingCompanies(true);
      setCompanyError(null);
      console.log('[QuotationForm] 🔍 Fetching registered companies...');
      try {
        const data = await quotationService.getRegisteredCompanies();
        console.log('[QuotationForm] ✅ Companies received:', data);
        setCompanies(data);
        if (data.length === 0) {
          setCompanyError('No registered companies found. Please register a company first.');
        }
      } catch (err: any) {
        console.error('[QuotationForm] ❌ Failed to load companies:', err);
        setCompanyError('Could not load companies. Please check if the server is running.');
      } finally {
        setLoadingCompanies(false);
      }
    };
    fetchRegisteredCompanies();
  }, []);

  useEffect(() => {
    if (preselectedCompanyId) setForm(f => ({ ...f, companyId: preselectedCompanyId }));
  }, [preselectedCompanyId]);

  const setField = (field: string, value: any) => {
    setError(null);
    setForm(f => ({ ...f, [field]: value }));
  };

  const updateItem = (index: number, field: keyof LineItem, value: string) => {
    setItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addItem = () =>
    setItems(prev => [...prev, { id: String(Date.now()), serviceDescription: '', price: '' }]);

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // ── Calculations ──────────────────────────────────────────────────────────
  const subtotal           = items.reduce((s, i) => s + (parseFloat(i.price) || 0), 0);
  const discountPct        = parseFloat(form.discountPercent) || 0;
  const taxPct             = parseFloat(form.taxPercent) || 0;
  const discountAmount     = (subtotal * discountPct) / 100;
  const priceAfterDiscount = subtotal - discountAmount;
  const taxAmount          = (priceAfterDiscount * taxPct) / 100;
  const total              = priceAfterDiscount + taxAmount;

  const formatINR = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);

  const selectedCompany = companies.find(c => String(c.id) === String(form.companyId));

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Frontend validations mirroring backend @NotNull / @NotBlank / @DecimalMin
    if (!form.companyId) {
      setError('Please select a company.');
      return;
    }
    if (items.some(i => !i.serviceDescription.trim())) {
      setError('All line items must have a service description.');
      return;
    }
    if (items.some(i => !i.price || parseFloat(i.price) <= 0)) {
      setError('All line item prices must be greater than 0.');  // mirrors @DecimalMin(inclusive=false)
      return;
    }

    // ── Build payload matching QuotationRequestDto exactly ───────────────
    // companyId MUST be a number (Long on backend) — never a string
    // price MUST be a number > 0 (BigDecimal on backend, Jackson accepts JS number fine)
    // discountPercent / taxPercent are optional BigDecimal — send as numbers
    const payload = {
      companyId:       parseInt(form.companyId, 10),           // Long — must be number not "3"
      discountPercent: parseFloat(form.discountPercent) || 0,  // BigDecimal optional
      taxPercent:      parseFloat(form.taxPercent) || 18,      // BigDecimal optional
      items: items.map(i => ({
        serviceDescription: i.serviceDescription.trim(),
        price:              parseFloat(i.price),               // BigDecimal — must be number > 0
      } as QuotationItemRequest)),
    };

    console.log('[QuotationForm] 📤 Submitting payload:', JSON.stringify(payload, null, 2));
    console.log('[QuotationForm] 📤 companyId type:', typeof payload.companyId, '| value:', payload.companyId);
    console.log('[QuotationForm] 📤 items:', payload.items);

    setSaving(true);
    try {
      const created = await quotationService.create(payload);
      console.log('[QuotationForm] ✅ Quotation saved successfully:', created);
      addQuotation(created);
      navigate('/quotations');
    } catch (err: any) {
      console.error('[QuotationForm] ❌ Save failed:', err);
      console.error('[QuotationForm] ❌ Response status:', err?.response?.status);
      console.error('[QuotationForm] ❌ Response body:', err?.response?.data);
      // Show the backend validation message if available
      const backendMsg = err?.response?.data?.message
        || err?.response?.data?.errors?.join(', ')
        || err?.message
        || 'Failed to create quotation.';
      setError(backendMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/quotations')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h2 className="text-gray-800" style={{ fontWeight: 700, fontSize: '20px' }}>Create New Quotation</h2>
          <p className="text-gray-500 text-sm">Fill in the details to generate a professional quotation</p>
        </div>
        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm border border-blue-200" style={{ fontWeight: 500 }}>
          RARA-QT-AUTO
        </span>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Quotation Details ─────────────────────────────────────────── */}
        <FormSection title="Quotation Details" icon={FileText}>

          <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 500 }}>
            Client Company <span className="text-red-500">*</span>
          </label>

          {loadingCompanies && (
            <div className="flex items-center gap-2 w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-400 bg-gray-50">
              <Loader2 size={14} className="animate-spin text-blue-500" />
              <span>Loading registered companies...</span>
            </div>
          )}

          {!loadingCompanies && (
            <div className="relative">
              <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
              <select
                value={form.companyId}
                onChange={e => setField('companyId', e.target.value)}
                className={`${selectClass} pl-9 pr-9`}
                required
                disabled={companies.length === 0}
              >
                <option value="">
                  {companies.length === 0
                    ? 'No registered companies available'
                    : `Select a company (${companies.length} available)`}
                </option>
                {companies.map(c => (
                  <option key={c.id} value={String(c.id)}>
                    {c.companyName}
                  </option>
                ))}
              </select>
              <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          )}

          {companyError && (
            <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-1.5">
              <AlertCircle size={13} className="shrink-0" />
              {companyError}
            </p>
          )}

          {selectedCompany && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs text-blue-500 mb-2" style={{ fontWeight: 600 }}>SELECTED COMPANY</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-blue-700">
                <span><span className="text-blue-400 text-xs">Contact: </span>{selectedCompany.contactPersonName}</span>
                <span><span className="text-blue-400 text-xs">Phone: </span>{selectedCompany.phone}</span>
                <span><span className="text-blue-400 text-xs">Email: </span>{selectedCompany.email}</span>
                <span><span className="text-blue-400 text-xs">GST: </span><span className="font-mono text-xs">{selectedCompany.gstNumber}</span></span>
                <span className="col-span-2"><span className="text-blue-400 text-xs">Location: </span>{selectedCompany.city}, {selectedCompany.state}</span>
              </div>
            </div>
          )}

        </FormSection>

        {/* ── Line Items ────────────────────────────────────────────────── */}
        <FormSection title="Line Items" icon={Calculator}>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: '480px' }}>
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs text-gray-500 pb-3 pr-3" style={{ fontWeight: 600, width: '72%' }}>
                    SERVICE DESCRIPTION
                  </th>
                  <th className="text-left text-xs text-gray-500 pb-3 pr-3" style={{ fontWeight: 600, width: '23%' }}>
                    PRICE (₹) <span className="text-red-400 font-normal">must be &gt; 0</span>
                  </th>
                  <th style={{ width: '5%' }} />
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={item.id} className="border-b border-gray-50">
                    <td className="py-2 pr-3">
                      <input
                        value={item.serviceDescription}
                        onChange={e => updateItem(i, 'serviceDescription', e.target.value)}
                        placeholder="e.g. Web Development Services"
                        className={inputClass}
                        required
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        min="0.01"          // HTML5 min matches @DecimalMin(inclusive=false, value="0.0")
                        step="0.01"
                        value={item.price}
                        onChange={e => updateItem(i, 'price', e.target.value)}
                        placeholder="e.g. 5000"
                        className={inputClass}
                        required
                      />
                    </td>
                    <td className="py-2">
                      <button
                        type="button"
                        onClick={() => removeItem(i)}
                        className="p-2 text-gray-300 hover:text-red-500 transition-colors disabled:opacity-30"
                        disabled={items.length === 1}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={addItem}
            className="mt-4 flex items-center gap-2 px-4 py-2 border border-dashed border-blue-300 text-blue-600 rounded-lg text-sm hover:bg-blue-50 transition-colors"
          >
            <Plus size={15} /> Add Line Item
          </button>

          {/* ── Totals ──────────────────────────────────────────────────── */}
          <div className="mt-6 border-t border-gray-100 pt-5 flex justify-end">
            <div className="w-full max-w-xs space-y-2">

              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span style={{ fontWeight: 500 }}>{formatINR(subtotal)}</span>
              </div>

              <div className="flex justify-between text-sm text-gray-600 items-center">
                <div className="flex items-center gap-2">
                  <span>Discount</span>
                  <input
                    type="number" min="0" max="100" step="0.01"
                    value={form.discountPercent}
                    onChange={e => setField('discountPercent', e.target.value)}
                    className="w-16 px-2 py-1 border border-gray-200 rounded text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                  <span>%</span>
                </div>
                <span className="text-red-500" style={{ fontWeight: 500 }}>− {formatINR(discountAmount)}</span>
              </div>

              {/* Price after discount */}
              <div className="flex justify-between text-sm items-center bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                <span className="text-green-700" style={{ fontWeight: 600 }}>Price after Discount</span>
                <span className="text-green-700" style={{ fontWeight: 700 }}>{formatINR(priceAfterDiscount)}</span>
              </div>

              <div className="flex justify-between text-sm text-gray-600 items-center">
                <div className="flex items-center gap-2">
                  <span>GST</span>
                  <input
                    type="number" min="0" max="28" step="0.01"
                    value={form.taxPercent}
                    onChange={e => setField('taxPercent', e.target.value)}
                    className="w-16 px-2 py-1 border border-gray-200 rounded text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                  <span>%</span>
                </div>
                <span className="text-blue-600" style={{ fontWeight: 500 }}>+ {formatINR(taxAmount)}</span>
              </div>

              <div className="flex justify-between py-3 border-t border-gray-200">
                <span className="text-gray-800" style={{ fontWeight: 700 }}>Total Amount</span>
                <span className="text-blue-600" style={{ fontWeight: 700, fontSize: '16px' }}>{formatINR(total)}</span>
              </div>

            </div>
          </div>
        </FormSection>

        {/* ── Actions ───────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => navigate('/quotations')}
            className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            style={{ fontWeight: 500 }}
          >
            Cancel
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-2 px-6 py-2.5 bg-gray-700 hover:bg-gray-800 text-white rounded-lg text-sm transition-colors"
              style={{ fontWeight: 600 }}
            >
              <Download size={16} /> Download
            </button>
            <button
              type="submit"
              disabled={saving || loadingCompanies || companies.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm transition-colors shadow-sm"
              style={{ fontWeight: 600 }}
            >
              {saving
                ? <><Loader2 size={16} className="animate-spin" /> Saving...</>
                : <><Send size={16} /> Save Quotation</>
              }
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}