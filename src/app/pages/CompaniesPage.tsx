import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2, Plus, Search, X, Phone, Mail, MapPin,
  User, Hash, FileText, FileCheck, Receipt, ChevronRight,
  Loader2, RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Company } from '../data/mockData';
import { useNavigate } from 'react-router';
import api from '../../services/api';

// ─── Status config ─────────────────────────────────────────────────────────────
const getStatusCfg = (status: string) => {
  const map: Record<string, { label: string; color: string }> = {
    REGISTERED:       { label: 'Registered',       color: 'bg-slate-100 text-slate-600'   },
    QUOTATION_SENT:   { label: 'Quotation Sent',   color: 'bg-yellow-100 text-yellow-700' },
    AGREEMENT_SENT:   { label: 'Agreement Sent',   color: 'bg-amber-100 text-amber-700'   },
    AGREEMENT_SIGNED: { label: 'Agreement Signed', color: 'bg-green-100 text-green-700'   },
    INVOICED:         { label: 'Invoiced',         color: 'bg-purple-100 text-purple-700' },
    ACTIVE:           { label: 'Active',           color: 'bg-blue-100 text-blue-700'     },
    INACTIVE:         { label: 'Inactive',         color: 'bg-red-100 text-red-600'       },
  };
  return map[status] ?? { label: status, color: 'bg-slate-100 text-slate-600' };
};

// Maps Tailwind color class combos → actual hex values for inline HTML
const statusInlineStyle = (status: string): { bg: string; color: string } => {
  const m: Record<string, { bg: string; color: string }> = {
    REGISTERED:       { bg: '#f1f5f9', color: '#475569' },
    QUOTATION_SENT:   { bg: '#fef9c3', color: '#a16207' },
    AGREEMENT_SENT:   { bg: '#fef3c7', color: '#b45309' },
    AGREEMENT_SIGNED: { bg: '#dcfce7', color: '#15803d' },
    INVOICED:         { bg: '#f3e8ff', color: '#7e22ce' },
    ACTIVE:           { bg: '#dbeafe', color: '#1d4ed8' },
    INACTIVE:         { bg: '#fee2e2', color: '#dc2626' },
  };
  return m[status] ?? { bg: '#f1f5f9', color: '#475569' };
};

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
];

const emptyForm = {
  companyName: '', email: '', phone: '', address: '',
  city: '', state: '', country: 'India', pincode: '',
  gstNumber: '', contactPersonName: '', contactPersonPhone: '',
};
type CompanyForm = typeof emptyForm;

const inputCls  = 'w-full px-3.5 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';
const selectCls = 'w-full px-3.5 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-slate-500 mb-1.5 font-medium">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function sanitizeEmail(email: string) { return email.replace(/^mailto:/i, '').trim(); }
function sanitizePhone(phone: string) { return phone.replace(/\s+/g, '').trim(); }

function validateStep(step: number, form: CompanyForm): string | null {
  if (step === 0) {
    if (!form.companyName.trim()) return 'Company name is required.';
    if (!form.email.trim())       return 'Email address is required.';
    if (!form.phone.trim())       return 'Phone number is required.';
    if (!form.gstNumber.trim())   return 'GST number is required.';
  }
  if (step === 1) {
    if (!form.address.trim()) return 'Street address is required.';
    if (!form.city.trim())    return 'City is required.';
    if (!form.state.trim())   return 'State is required.';
    if (!form.pincode.trim()) return 'Pincode is required.';
  }
  if (step === 2) {
    if (!form.contactPersonName.trim())  return 'Contact person name is required.';
    if (!form.contactPersonPhone.trim()) return 'Contact phone is required.';
  }
  return null;
}

// ─── Company Detail Modal ──────────────────────────────────────────────────────
function CompanyDetailSheet({
  company,
  onClose,
}: {
  company: Company;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const statusStyle = statusInlineStyle(company.status);
  const cfg = getStatusCfg(company.status);

  useEffect(() => {
    // Save and lock body scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Create and inject modal container directly on body
    const container = document.createElement('div');
    document.body.appendChild(container);

    const address = [company.address, company.city, company.state, company.pincode, company.country]
      .filter(Boolean).join(', ');

    container.innerHTML = `
      <div id="cdm-backdrop" style="
        position:fixed;top:0;left:0;width:100vw;height:100vh;
        background:rgba(0,0,0,0.55);z-index:99999;
        display:flex;align-items:center;justify-content:center;
        padding:16px;box-sizing:border-box;
      ">
        <div id="cdm-card" style="
          width:100%;max-width:448px;background:#ffffff;
          border-radius:20px;max-height:90vh;
          display:flex;flex-direction:column;overflow:hidden;
          box-shadow:0 25px 60px rgba(0,0,0,0.25);
        ">

          <div style="display:flex;align-items:center;justify-content:space-between;
                      padding:16px 20px;border-bottom:1px solid #f1f5f9;flex-shrink:0;">
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="width:44px;height:44px;border-radius:16px;background:#eff6ff;
                          display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                     stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <div>
                <div style="font-weight:600;font-size:15px;color:#1e293b;line-height:1.3;">
                  ${company.companyName}
                </div>
                <span style="font-size:11px;padding:2px 8px;border-radius:999px;font-weight:500;
                             background:${statusStyle.bg};color:${statusStyle.color};">
                  ${cfg.label}
                </span>
              </div>
            </div>
            <button id="cdm-close" style="
              width:32px;height:32px;border-radius:50%;background:#f1f5f9;
              border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;
              flex-shrink:0;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="#64748b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div style="flex:1;overflow-y:auto;padding:16px 20px;display:flex;flex-direction:column;gap:10px;">

            ${company.email ? `
            <div style="display:flex;align-items:flex-start;gap:12px;background:#f8fafc;border-radius:12px;padding:12px;">
              <div style="width:28px;height:28px;border-radius:8px;background:#fff;border:1px solid #e2e8f0;
                          display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <div><div style="color:#94a3b8;font-size:11px;margin-bottom:2px;">Email</div>
                   <div style="color:#334155;font-size:13px;word-break:break-all;">${company.email}</div></div>
            </div>` : ''}

            ${company.phone ? `
            <div style="display:flex;align-items:flex-start;gap:12px;background:#f8fafc;border-radius:12px;padding:12px;">
              <div style="width:28px;height:28px;border-radius:8px;background:#fff;border:1px solid #e2e8f0;
                          display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <div><div style="color:#94a3b8;font-size:11px;margin-bottom:2px;">Phone</div>
                   <div style="color:#334155;font-size:13px;">${company.phone}</div></div>
            </div>` : ''}

            ${company.gstNumber ? `
            <div style="display:flex;align-items:flex-start;gap:12px;background:#f8fafc;border-radius:12px;padding:12px;">
              <div style="width:28px;height:28px;border-radius:8px;background:#fff;border:1px solid #e2e8f0;
                          display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/>
                  <line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>
                </svg>
              </div>
              <div><div style="color:#94a3b8;font-size:11px;margin-bottom:2px;">GST Number</div>
                   <div style="color:#334155;font-size:13px;">${company.gstNumber}</div></div>
            </div>` : ''}

            ${address ? `
            <div style="display:flex;align-items:flex-start;gap:12px;background:#f8fafc;border-radius:12px;padding:12px;">
              <div style="width:28px;height:28px;border-radius:8px;background:#fff;border:1px solid #e2e8f0;
                          display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div><div style="color:#94a3b8;font-size:11px;margin-bottom:2px;">Address</div>
                   <div style="color:#334155;font-size:13px;">${address}</div></div>
            </div>` : ''}

            <div style="background:#eff6ff;border-radius:16px;padding:16px;">
              <div style="font-size:11px;font-weight:600;color:#2563eb;text-transform:uppercase;
                          letter-spacing:0.05em;margin-bottom:12px;">Contact Person</div>
              <div style="display:flex;align-items:center;gap:12px;">
                <div style="width:40px;height:40px;border-radius:12px;background:#dbeafe;
                            display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                       stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div>
                  <div style="font-weight:500;font-size:14px;color:#1e293b;">${company.contactPersonName ?? ''}</div>
                  <div style="font-size:12px;color:#64748b;">${company.contactPersonPhone ?? ''}</div>
                </div>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding-top:4px;">
              <button id="cdm-proposal" style="display:flex;flex-direction:column;align-items:center;gap:6px;
                padding:12px 8px;background:#eff6ff;border:1px solid #bfdbfe;color:#1d4ed8;
                border-radius:12px;font-size:12px;font-weight:500;cursor:pointer;">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                  <rect x="9" y="3" width="6" height="4" rx="1"/>
                  <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
                </svg>
                Proposal
              </button>
              <button id="cdm-quotation" style="display:flex;flex-direction:column;align-items:center;gap:6px;
                padding:12px 8px;background:#fffbeb;border:1px solid #fde68a;color:#b45309;
                border-radius:12px;font-size:12px;font-weight:500;cursor:pointer;">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                Quotation
              </button>
              <button id="cdm-agreement" style="display:flex;flex-direction:column;align-items:center;gap:6px;
                padding:12px 8px;background:#f0fdf4;border:1px solid #bbf7d0;color:#15803d;
                border-radius:12px;font-size:12px;font-weight:500;cursor:pointer;">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <polyline points="9 15 11 17 15 13"/>
                </svg>
                Agreement
              </button>
              <button id="cdm-invoice" style="display:flex;flex-direction:column;align-items:center;gap:6px;
                padding:12px 8px;background:#faf5ff;border:1px solid #e9d5ff;color:#7e22ce;
                border-radius:12px;font-size:12px;font-weight:500;cursor:pointer;">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                Invoice
              </button>
            </div>

          </div>
        </div>
      </div>
    `;

    // Wire up click handlers
    container.querySelector('#cdm-close')    ?.addEventListener('click', onClose);
    container.querySelector('#cdm-proposal') ?.addEventListener('click', () => { navigate('/proposals');  onClose(); });
    container.querySelector('#cdm-quotation')?.addEventListener('click', () => { navigate('/quotations'); onClose(); });
    container.querySelector('#cdm-agreement')?.addEventListener('click', () => { navigate('/agreements'); onClose(); });
    container.querySelector('#cdm-invoice')  ?.addEventListener('click', () => { navigate('/invoices');   onClose(); });
    container.querySelector('#cdm-backdrop') ?.addEventListener('click', (e) => {
      if (e.target === container.querySelector('#cdm-backdrop')) onClose();
    });

    // Cleanup: remove container and restore scroll on unmount
    return () => {
      document.body.style.overflow = prevOverflow;
      container.remove();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Renders nothing into the React tree — modal lives directly on document.body
  return null;
}

// ─── Register Sheet ────────────────────────────────────────────────────────────
function RegisterSheet({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (company: Company) => void;
}) {
  const [form, setForm]     = useState<CompanyForm>(emptyForm);
  const [step, setStep]     = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const setField = (k: keyof CompanyForm, v: string) => {
    setError(null);
    setForm(f => ({ ...f, [k]: v }));
  };

  const handleNext = () => {
    const err = validateStep(step, form);
    if (err) { setError(err); return; }
    setError(null);
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    const err = validateStep(step, form);
    if (err) { setError(err); return; }
    setSaving(true);
    setError(null);
    const payload = {
      companyName:        form.companyName.trim(),
      email:              sanitizeEmail(form.email),
      phone:              sanitizePhone(form.phone),
      address:            form.address.trim(),
      city:               form.city.trim(),
      state:              form.state.trim(),
      country:            form.country.trim(),
      pincode:            form.pincode.trim(),
      gstNumber:          form.gstNumber.trim(),
      contactPersonName:  form.contactPersonName.trim(),
      contactPersonPhone: sanitizePhone(form.contactPersonPhone),
    };
    try {
      const response = await api.post('/api/companies/register', payload);
      const data = response.data;
      if (data.success) {
        onSave(data.data);
        onClose();
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        err?.message ||
        'Cannot reach backend. Is Spring Boot running?';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const steps = ['Company Info', 'Address', 'Contact'];

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-slate-800 font-semibold">Register Company</h2>
            <p className="text-slate-400 text-xs">Step {step + 1} of {steps.length}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 transition-colors rounded-full">
            <X size={16} className="text-slate-500" />
          </button>
        </div>

        <div className="px-5 pt-3 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            {steps.map((s, i) => (
              <React.Fragment key={s}>
                <div className="flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    i <= step ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>{i + 1}</div>
                  <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-blue-600' : 'text-slate-400'}`}>{s}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 rounded ${i < step ? 'bg-blue-400' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {error && (
          <div className="mx-5 mb-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2">
            <X size={13} className="shrink-0 mt-0.5 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-4">
          {step === 0 && (
            <>
              <Field label="Company Name" required>
                <input value={form.companyName} onChange={e => setField('companyName', e.target.value)} className={inputCls} placeholder="Acme Technologies Pvt. Ltd." />
              </Field>
              <Field label="Email Address" required>
                <input type="text" inputMode="email" autoComplete="email" value={form.email} onChange={e => setField('email', sanitizeEmail(e.target.value))} className={inputCls} placeholder="info@company.com" />
              </Field>
              <Field label="Phone Number" required>
                <input type="tel" value={form.phone} onChange={e => setField('phone', e.target.value)} className={inputCls} placeholder="022-12345678" />
              </Field>
              <Field label="GST Number" required>
                <input value={form.gstNumber} onChange={e => setField('gstNumber', e.target.value.toUpperCase())} className={inputCls} placeholder="27AAACT0000A1Z5" maxLength={15} />
              </Field>
            </>
          )}
          {step === 1 && (
            <>
              <Field label="Street Address" required>
                <textarea value={form.address} onChange={e => setField('address', e.target.value)} className={`${inputCls} resize-none`} rows={2} placeholder="123, MG Road" />
              </Field>
              <Field label="City" required>
                <input value={form.city} onChange={e => setField('city', e.target.value)} className={inputCls} placeholder="Pune" />
              </Field>
              <Field label="State" required>
                <select value={form.state} onChange={e => setField('state', e.target.value)} className={selectCls}>
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Country">
                  <input value={form.country} onChange={e => setField('country', e.target.value)} className={inputCls} />
                </Field>
                <Field label="Pincode" required>
                  <input value={form.pincode} onChange={e => setField('pincode', e.target.value)} className={inputCls} placeholder="411001" maxLength={6} inputMode="numeric" />
                </Field>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <Field label="Contact Person Name" required>
                <input value={form.contactPersonName} onChange={e => setField('contactPersonName', e.target.value)} className={inputCls} placeholder="Rahul Sharma" />
              </Field>
              <Field label="Contact Phone" required>
                <input type="tel" value={form.contactPersonPhone} onChange={e => setField('contactPersonPhone', e.target.value)} className={inputCls} placeholder="9123456780" />
              </Field>
            </>
          )}
        </div>

        <div className="px-5 py-4 border-t border-slate-100 flex gap-3 shrink-0">
          {step > 0 ? (
            <button onClick={() => { setError(null); setStep(s => s - 1); }} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">Back</button>
          ) : (
            <button onClick={onClose} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">Cancel</button>
          )}
          {step < steps.length - 1 ? (
            <button onClick={handleNext} className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">Next</button>
          ) : (
            <button onClick={handleSubmit} disabled={saving} className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
              {saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : 'Register'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Companies Page ────────────────────────────────────────────────────────────
export default function CompaniesPage() {
  const { addCompany } = useApp();

  const [companies, setCompanies]       = useState<Company[]>([]);
  const [loading, setLoading]           = useState(false);
  const [fetchError, setFetchError]     = useState<string | null>(null);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm]         = useState(false);
  const [viewCompany, setViewCompany]   = useState<Company | null>(null);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await api.get('/api/companies');
      const json = res.data;
      const list: Company[] = Array.isArray(json)
        ? json
        : Array.isArray(json?.data)
        ? json.data
        : [];
      setCompanies(list);
    } catch (err: any) {
      setFetchError(err.message ?? 'Failed to load companies.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  useEffect(() => {
    const onFocus = () => fetchCompanies();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchCompanies]);

  const displayTabs = [
    { key: 'all',      label: 'All'        },
    { key: 'reg',      label: 'Registered' },
    { key: 'quot',     label: 'Quot. Sent' },
    { key: 'sent',     label: 'Agr. Sent'  },
    { key: 'signed',   label: 'Signed'     },
    { key: 'invoiced', label: 'Invoiced'   },
  ];

  const matchesFilter = (c: Company, key: string) => {
    if (key === 'all')      return true;
    if (key === 'reg')      return c.status === 'REGISTERED';
    if (key === 'quot')     return c.status === 'QUOTATION_SENT';
    if (key === 'sent')     return c.status === 'AGREEMENT_SENT';
    if (key === 'signed')   return c.status === 'AGREEMENT_SIGNED';
    if (key === 'invoiced') return c.status === 'INVOICED';
    return false;
  };

  const getStatusCount = (key: string) =>
    key === 'all'
      ? companies.length
      : companies.filter(c => matchesFilter(c, key)).length;

  const finalFiltered = companies.filter(c => {
    const term = search.toLowerCase();
    const matchSearch =
      (c.companyName ?? '').toLowerCase().includes(term) ||
      (c.contactPersonName ?? '').toLowerCase().includes(term) ||
      (c.city ?? '').toLowerCase().includes(term);
    return matchSearch && matchesFilter(c, statusFilter);
  });

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-800" style={{ fontSize: '1.2rem', fontWeight: 700 }}>Companies</h1>
          <p className="text-slate-400 text-xs">{companies.length} registered partners</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchCompanies}
            disabled={loading}
            className="w-9 h-9 flex items-center justify-center bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            title="Refresh statuses"
          >
            <RefreshCw size={15} className={`text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium shadow-sm active:bg-blue-700 hover:bg-blue-700 transition-colors"
          >
            <Plus size={15} /> Register
          </button>
        </div>
      </div>

      {fetchError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
          ❌ {fetchError} — Is Spring Boot running on port 8080?
        </div>
      )}

      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search companies..."
          className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
        {displayTabs.map(t => (
          <button
            key={t.key}
            onClick={() => setStatusFilter(t.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
              statusFilter === t.key ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t.label}
            <span className={`ml-1.5 text-xs font-bold ${statusFilter === t.key ? 'opacity-70' : 'text-slate-400'}`}>
              {getStatusCount(t.key)}
            </span>
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10 gap-2 text-slate-400">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Loading companies...</span>
        </div>
      )}

      {!loading && (
        <div className="space-y-2">
          {finalFiltered.map(c => {
            const cfg = getStatusCfg(c.status);
            return (
              <button
                key={c.id}
                onClick={() => setViewCompany(c)}
                className="w-full bg-white rounded-2xl border border-slate-100 p-4 text-left shadow-sm active:scale-[0.99] transition-transform hover:border-blue-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                    <Building2 size={18} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-slate-800 text-sm font-semibold truncate">{c.companyName}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs truncate">{c.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-50">
                  <div className="flex items-center gap-1.5">
                    <User size={11} className="text-slate-400" />
                    <span className="text-slate-500 text-xs">{c.contactPersonName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={11} className="text-slate-400" />
                    <span className="text-slate-500 text-xs">{c.city}</span>
                  </div>
                  <div className="ml-auto">
                    <ChevronRight size={14} className="text-slate-300" />
                  </div>
                </div>
              </button>
            );
          })}

          {finalFiltered.length === 0 && !loading && (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
              <Building2 size={32} className="text-slate-200 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No companies found</p>
            </div>
          )}
        </div>
      )}

      {viewCompany && (
        <CompanyDetailSheet
          company={viewCompany}
          onClose={() => {
            setViewCompany(null);
            fetchCompanies();
          }}
        />
      )}

      {showForm && (
        <RegisterSheet
          onClose={() => setShowForm(false)}
          onSave={(company) => {
            addCompany(company);
            setShowForm(false);
            fetchCompanies();
          }}
        />
      )}
    </div>
  );
}