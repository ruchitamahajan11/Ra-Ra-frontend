import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  X,
  Eye,
  FileCheck,
  Check,
  Trash2,
  ArrowLeft,
  CheckCircle,
  Mail,
  Save,
  Upload,
  FileText,
  AlertCircle,
  Loader2,
  Pencil,
  ChevronDown,
  ChevronUp,
  PenLine,
  Search,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Agreement, OUR_COMPANY } from '../data/mockData';
import {
  saveDraft,
  finalizeAndSend,
  extractTextFromDocx,
  getClausesByCompany,
  updateClause as updateClauseApi,
  ClauseResponseDto,
} from '../../services/agreementService';
import { API_CONFIG } from '../../config/api.config';
import api from '../../services/api';

// ─── Shared style ─────────────────────────────────────────────────────────────
const inputCls =
  'w-full px-3.5 py-3 text-sm border border-slate-200 rounded-xl ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateAgreementNo(count: number) {
  return `AGR/2026/${String(count + 1).padStart(3, '0')}`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  AgreementPreviewSheet
// ─────────────────────────────────────────────────────────────────────────────
function AgreementPreviewSheet({
  agreement,
  company,
  onClose,
}: {
  agreement: Agreement;
  company: any;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <h3 className="text-slate-800 font-semibold">{agreement.agreementNo}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
          >
            <X size={16} className="text-slate-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div style={{ background: '#0c1e3d' }} className="rounded-2xl p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-200 text-xs">Service Provider</p>
                <p className="text-white font-semibold text-sm">{OUR_COMPANY.name}</p>
              </div>
              <div className="text-right">
                <p className="text-yellow-300 font-bold text-sm">AGREEMENT</p>
                <p className="text-blue-300 text-xs">{agreement.agreementNo}</p>
              </div>
            </div>
            {company && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-white font-semibold text-sm">{company.name}</p>
                <p className="text-blue-300 text-xs">
                  {company.city}, {company.state}
                </p>
              </div>
            )}
            <div className="flex gap-4 mt-3 text-xs">
              <div>
                <p className="text-blue-300">Date</p>
                <p className="text-white">{agreement.date}</p>
              </div>
              <div>
                <p className="text-blue-300">Draft File</p>
                <p className="text-white">{agreement.templateName || '—'}</p>
              </div>
            </div>
          </div>

          {agreement.additionalClauses?.filter((c: string) => c.trim()).length > 0 && (
            <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-3">
                Additional Clauses
              </p>
              {agreement.additionalClauses
                .filter((c: string) => c.trim())
                .map((clause: string, i: number) => (
                  <p key={i} className="text-xs text-slate-700 mb-2">
                    <span className="font-semibold">{String.fromCharCode(65 + i)}. </span>
                    {clause}
                  </p>
                ))}
            </div>
          )}

          {(agreement.emailSubject || agreement.emailBody) && (
            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4 space-y-2">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                Email Details
              </p>
              {agreement.emailSubject && (
                <div>
                  <p className="text-xs text-slate-400">Subject</p>
                  <p className="text-xs text-slate-700 font-medium">{agreement.emailSubject}</p>
                </div>
              )}
              {agreement.emailBody && (
                <div>
                  <p className="text-xs text-slate-400">Body</p>
                  <p className="text-xs text-slate-700 whitespace-pre-line">{agreement.emailBody}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  CreateAgreementView  — pill-tab style matching Quotation/Invoice pages
// ─────────────────────────────────────────────────────────────────────────────
function CreateAgreementView({
  onBack,
  existingCount,
  onSaved,
}: {
  onBack: () => void;
  existingCount: number;
  onSaved: (a: Agreement) => void;
}) {
  const { companies } = useApp();

  // ── Tab state ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'details' | 'email'>('details');

  // ── Companies ──────────────────────────────────────────────────────────────
  const [quotationCompanies, setQuotationCompanies] = useState<any[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  useEffect(() => {
    (async () => {
      setLoadingCompanies(true);
      try {
        const res = await api.get('/api/companies/status/QUOTATION_SENT');
        const json = res.data;
        const list = Array.isArray(json) ? json : (json?.data ?? []);
        setQuotationCompanies(list);
      } catch {
        setQuotationCompanies([]);
      } finally {
        setLoadingCompanies(false);
      }
    })();
  }, []);

  // ── Details tab fields ─────────────────────────────────────────────────────
  const [companyId, setCompanyId] = useState('');
  const [clauses, setClauses] = useState<string[]>(['']);
  const [draftFile, setDraftFile] = useState<File | null>(null);
  const [draftError, setDraftError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [clausesOpen, setClausesOpen] = useState(true);
  const [draftOpen, setDraftOpen] = useState(true);

  // ── Email Details tab fields ───────────────────────────────────────────────
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // ── Action state ───────────────────────────────────────────────────────────
  const [actionState, setActionState] = useState<
    'idle' | 'saving' | 'saved' | 'sending' | 'sent' | 'error'
  >('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const selectedCompany =
    quotationCompanies.find((c) => String(c.id) === String(companyId)) ??
    companies.find((c) => String(c.id) === String(companyId));

  const agreementNo = generateAgreementNo(existingCount);
  const nonEmptyClauses = clauses.filter((c) => c.trim());

  const isDetailsValid = !!companyId && !!draftFile;
  const isEmailValid = !!emailSubject.trim() && !!emailBody.trim();
  const isFormValid = isDetailsValid;
  const isSendValid = isDetailsValid && isEmailValid;
  const isLoading = actionState === 'saving' || actionState === 'sending';

  const addClause = () => setClauses((prev) => [...prev, '']);
  const removeClause = (idx: number) =>
    setClauses((prev) => prev.filter((_, i) => i !== idx));
  const updateClauseLocal = (idx: number, val: string) =>
    setClauses((prev) => prev.map((c, i) => (i === idx ? val : c)));

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isDocx =
      file.name.toLowerCase().endsWith('.docx') ||
      file.type ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    if (!isDocx) {
      setDraftError('Only .docx (Word) files are accepted. Please re-select.');
      setDraftFile(null);
      e.target.value = '';
      return;
    }
    setDraftError('');
    setDraftFile(file);
  };

  const buildAgreement = (): Agreement => ({
    id: Date.now().toString(),
    agreementNo,
    companyId,
    companyName: selectedCompany?.companyName ?? selectedCompany?.name ?? '',
    date: new Date().toISOString().split('T')[0],
    templateId: '',
    templateName: draftFile?.name ?? '',
    content: '',
    additionalClauses: nonEmptyClauses,
    notes: '',
    signed: false,
    emailSubject: emailSubject.trim(),
    emailBody: emailBody.trim(),
  });

  const handleSaveDraft = async () => {
    if (!isFormValid || isLoading) return;
    setActionState('saving');
    setErrorMsg('');
    try {
      if (nonEmptyClauses.length > 0) {
        await saveDraft({ companyId: Number(companyId), additionalClauses: nonEmptyClauses });
      }
      const agreement = buildAgreement();
      onSaved(agreement);
      setActionState('saved');
      setTimeout(() => {
        setActionState('idle');
        onBack();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message ?? 'Failed to save draft. Please try again.');
      setActionState('error');
    }
  };

  const handleSendMail = async () => {
    if (!isSendValid || isLoading || !draftFile) return;
    setActionState('sending');
    setErrorMsg('');
    try {
      if (nonEmptyClauses.length > 0) {
        await saveDraft({ companyId: Number(companyId), additionalClauses: nonEmptyClauses });
      }
      const templateContent = await extractTextFromDocx(draftFile);
      await finalizeAndSend(Number(companyId), {
        templateContent,
        fileName: draftFile.name,
        additionalClauses: nonEmptyClauses,
        selectedClauseIds: [],
        emailSubject: emailSubject.trim(),
        emailBody: emailBody.trim(),
      });
      const agreement = buildAgreement();
      onSaved(agreement);
      setActionState('sent');
      setTimeout(() => {
        setActionState('idle');
        onBack();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message ?? 'Failed to finalize agreement. Please try again.');
      setActionState('error');
    }
  };

  // ── Tab completion indicators ──────────────────────────────────────────────
  const detailsComplete = isDetailsValid;
  const emailComplete = isEmailValid;

  return (
    /* ── Outer wrapper: full-height card matching Quotation modal style ── */
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full bg-white shadow-sm sm:rounded-2xl sm:border border-slate-200 overflow-hidden sm:my-4">

      {/* ── Top bar: back arrow | title+subtitle | (no preview button) ── */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 shrink-0">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
        >
          <ArrowLeft size={16} className="text-slate-600" />
        </button>
        <div className="flex-1">
          <h2 className="text-slate-800 font-semibold text-sm">New Agreement</h2>
          <p className="text-slate-400 text-xs">{agreementNo}</p>
        </div>
        {/* No preview button — removed as requested */}
      </div>

      {/* ── Blue banner ── */}
      <div className="bg-blue-600 px-4 py-2.5 flex items-center justify-between shrink-0">
        <span className="text-blue-200 text-xs">
          {draftFile ? 'Draft Ready' : 'Upload Draft to Continue'}
        </span>
        <span className="text-white font-semibold text-xs">
          {draftFile
            ? draftFile.name.length > 28
              ? draftFile.name.slice(0, 26) + '…'
              : draftFile.name
            : 'No file selected'}
        </span>
      </div>

      {/* ── Tab switcher — pill style matching Quotation page ── */}
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

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <div className="p-4 space-y-4">

          {/* Error banner */}
          {actionState === 'error' && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs text-red-600">
                {errorMsg || 'Something went wrong. Please try again.'}
              </p>
            </div>
          )}

          {/* ════ TAB 1 — DETAILS ════ */}
          {activeTab === 'details' && (
            <>
              {/* ── SECTION 1 — Company ── */}
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
                  <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-600">
                    Only companies with a sent quotation are listed here.
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5 font-medium">
                      Company <span className="text-red-500">*</span>
                    </label>
                    {loadingCompanies ? (
                      <div className="flex items-center gap-2 py-3 text-slate-400 text-sm">
                        <Loader2 size={15} className="animate-spin" />
                        Loading companies…
                      </div>
                    ) : (
                      <select
                        value={companyId}
                        onChange={(e) => setCompanyId(e.target.value)}
                        className={inputCls}
                      >
                        <option value="">Select Company</option>
                        {quotationCompanies.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.companyName ?? c.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  {selectedCompany && (
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
                      <p className="font-semibold">{selectedCompany.companyName ?? selectedCompany.name}</p>
                      {(selectedCompany.city || selectedCompany.state) && (
                        <p className="text-blue-500 mt-0.5">
                          {selectedCompany.city}, {selectedCompany.state}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* ── SECTION 2 — Clauses ── */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => setClausesOpen((v) => !v)}
                  className="w-full px-4 py-3 border-b border-slate-50 flex items-center gap-2"
                >
                  <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 flex-1 text-left">
                    Additional Clauses{' '}
                    <span className="text-xs font-normal text-slate-400">(optional)</span>
                  </p>
                  {nonEmptyClauses.length > 0 && (
                    <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full mr-1">
                      {nonEmptyClauses.length} added
                    </span>
                  )}
                  {clausesOpen ? (
                    <ChevronUp size={15} className="text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown size={15} className="text-slate-400 shrink-0" />
                  )}
                </button>

                {clausesOpen && (
                  <div className="p-4 space-y-3">
                    <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-600">
                      Clauses are optional. They will be appended to your draft and saved to the database.
                    </div>
                    {clauses.map((clause, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs text-slate-500 font-medium">
                            Clause {idx + 1}
                          </label>
                          {clauses.length > 1 && (
                            <button onClick={() => removeClause(idx)} className="text-red-400">
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                        <textarea
                          value={clause}
                          onChange={(e) => updateClauseLocal(idx, e.target.value)}
                          className={`${inputCls} resize-none`}
                          rows={3}
                          placeholder="Type additional clause here…"
                        />
                      </div>
                    ))}
                    <button
                      onClick={addClause}
                      className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 text-sm font-medium hover:bg-slate-50 transition-colors"
                    >
                      <Plus size={15} /> Add Clause
                    </button>
                  </div>
                )}
              </div>

              {/* ── SECTION 3 — Draft Upload ── */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => setDraftOpen((v) => !v)}
                  className="w-full px-4 py-3 border-b border-slate-50 flex items-center gap-2"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 flex-1 text-left">
                    Upload Draft <span className="text-red-500">*</span>
                  </p>
                  {draftFile && (
                    <CheckCircle size={14} className="text-green-500 mr-1 shrink-0" />
                  )}
                  {draftOpen ? (
                    <ChevronUp size={15} className="text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown size={15} className="text-slate-400 shrink-0" />
                  )}
                </button>

                {draftOpen && (
                  <div className="p-4 space-y-3">
                    <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-700 border border-amber-100">
                      Upload your agreement as a <strong>.docx</strong> (Word) file. The text will be
                      extracted and sent to the backend in a clean, structured format automatically.
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFilePick}
                      className="hidden"
                    />
                    {draftFile ? (
                      <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-2xl bg-green-100 flex items-center justify-center shrink-0">
                              <FileText size={18} className="text-green-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-slate-800 text-sm font-semibold truncate max-w-[190px]">
                                {draftFile.name}
                              </p>
                              <p className="text-slate-400 text-xs">
                                {(draftFile.size / 1024).toFixed(1)} KB · Word Document
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setDraftFile(null);
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="w-7 h-7 flex items-center justify-center bg-slate-100 rounded-lg shrink-0 hover:bg-slate-200 transition-colors"
                          >
                            <X size={13} className="text-slate-400" />
                          </button>
                        </div>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="mt-3 w-full py-2 border border-slate-200 text-slate-500 rounded-xl text-xs font-medium hover:bg-slate-50 transition-colors"
                        >
                          Change File
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex flex-col items-center justify-center gap-3 p-8 bg-blue-50 border-2 border-dashed border-blue-200 rounded-2xl hover:bg-blue-100 transition-colors"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                          <Upload size={20} className="text-blue-600" />
                        </div>
                        <div className="text-center">
                          <p className="text-blue-700 font-semibold text-sm">Upload Word Draft</p>
                          <p className="text-blue-400 text-xs mt-0.5">Tap to browse · .docx only</p>
                        </div>
                      </button>
                    )}
                    {draftError && (
                      <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3">
                        <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-red-600">{draftError}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── Summary card ── */}
              <div className="bg-white rounded-2xl p-4 space-y-2 border border-slate-200 shadow-sm">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Summary
                </p>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-400">Company</p>
                  <p className="text-xs font-medium text-slate-700">
                    {selectedCompany ? (
                      selectedCompany.companyName ?? selectedCompany.name
                    ) : (
                      <span className="text-red-400">Not selected</span>
                    )}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-400">Clauses</p>
                  <p className="text-xs font-medium text-slate-700">
                    {nonEmptyClauses.length > 0 ? `${nonEmptyClauses.length} added` : 'None'}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-400">Draft file</p>
                  <p className="text-xs font-medium">
                    {draftFile ? (
                      <span className="text-green-600 truncate max-w-[160px] block text-right">
                        {draftFile.name}
                      </span>
                    ) : (
                      <span className="text-red-400">Not uploaded</span>
                    )}
                  </p>
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

              {/* Nudge to email tab */}
              {isDetailsValid && !isEmailValid && (
                <button
                  onClick={() => setActiveTab('email')}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-100 transition-colors rounded-2xl text-blue-600 text-xs font-semibold shadow-sm"
                >
                  <Mail size={13} /> Fill in Email Details to enable Send →
                </button>
              )}
            </>
          )}

          {/* ════ TAB 2 — EMAIL DETAILS ════ */}
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
                  Both are required to use "Finalize &amp; Send Mail".
                </div>

                {/* Subject */}
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
                    placeholder="e.g. Partnership Proposal: RA & RA x JAPL"
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
                    onChange={(e) => setEmailBody(e.target.value)}
                    className={`${inputCls} resize-none ${
                      emailBody.trim() ? 'border-green-300 focus:ring-green-400 bg-green-50/20' : ''
                    }`}
                    rows={10}
                    placeholder={'Please find attached our formal agreement...\n\nBest Regards,\nYour Name'}
                  />
                  <p className="text-xs text-slate-400 mt-1">{emailBody.length} characters</p>
                </div>

                {/* Live preview card */}
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

                {/* Back nudge if details not done */}
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

      {/* ── Bottom action bar — matches Quotation layout exactly ── */}
      <div className="px-4 py-4 bg-white border-t border-slate-200 shrink-0 space-y-2 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] z-10 relative">
        {isDetailsValid && !isEmailValid && (
          <p className="text-center text-xs text-amber-500 pb-1 font-medium">
            ⚠ Fill in Email Details (subject &amp; body) to enable Send Mail
          </p>
        )}

        {/* Row 1: Save Draft (left) | file indicator (right) */}
        <div className="flex gap-3">
          <button
            onClick={handleSaveDraft}
            disabled={!isFormValid || isLoading}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors shadow-sm"
          >
            {actionState === 'saving' ? (
              <><Loader2 size={15} className="animate-spin" /> Saving…</>
            ) : actionState === 'saved' ? (
              <><Check size={15} /> Saved!</>
            ) : (
              <><Save size={15} /> Save Draft</>
            )}
          </button>

          <button
            disabled
            className="flex-1 flex items-center justify-center gap-2 py-3 border border-slate-100 text-slate-300 bg-slate-50 rounded-xl text-sm font-medium cursor-not-allowed"
          >
            <FileText size={15} />
            {draftFile ? draftFile.name.slice(0, 12) + '…' : 'No file yet'}
          </button>
        </div>

        {/* Row 2: Finalize & Send Mail — full width primary */}
        <button
          onClick={handleSendMail}
          disabled={!isSendValid || isLoading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold disabled:opacity-50 disabled:bg-slate-300 hover:bg-blue-700 transition-colors shadow-md"
        >
          {actionState === 'sending' ? (
            <><Loader2 size={15} className="animate-spin" /> Extracting &amp; Sending…</>
          ) : actionState === 'sent' ? (
            <><Check size={15} className="stroke-[3]" /> Mail Sent Successfully!</>
          ) : (
            <><Mail size={15} /> Finalize &amp; Send Mail</>
          )}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  UpdateClausesSheet
// ─────────────────────────────────────────────────────────────────────────────
function UpdateClausesSheet({
  agreement,
  onClose,
}: {
  agreement: Agreement;
  onClose: () => void;
}) {
  const [rows, setRows] = useState<
    { id: number; content: string; original: string; saving: boolean; saved: boolean }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [globalError, setGlobalError] = useState('');
  const [allSaving, setAllSaving] = useState(false);
  const [allSaved, setAllSaved] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setFetchError('');
      try {
        const data: ClauseResponseDto[] = await getClausesByCompany(
          Number(agreement.companyId),
        );
        setRows(
          data.map((c) => ({
            id: c.id,
            content: c.clauseContent,
            original: c.clauseContent,
            saving: false,
            saved: false,
          })),
        );
      } catch (err: any) {
        setFetchError(err.message ?? 'Failed to load clauses.');
      } finally {
        setLoading(false);
      }
    })();
  }, [agreement.companyId]);

  const updateRow = (idx: number, value: string) =>
    setRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, content: value, saved: false } : r)),
    );

  const isDirty = (idx: number) => rows[idx]?.content !== rows[idx]?.original;

  const saveOne = async (idx: number) => {
    const row = rows[idx];
    if (!isDirty(idx) || row.saving) return;
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, saving: true } : r)));
    setGlobalError('');
    try {
      const updated = await updateClauseApi(row.id, row.content);
      setRows((prev) =>
        prev.map((r, i) =>
          i === idx
            ? { ...r, saving: false, saved: true, original: updated.clauseContent }
            : r,
        ),
      );
    } catch (err: any) {
      setGlobalError(err.message ?? 'Failed to update clause.');
      setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, saving: false } : r)));
    }
  };

  const saveAll = async () => {
    const dirtyIndexes = rows.map((_, i) => i).filter((i) => isDirty(i) && !rows[i].saving);
    if (!dirtyIndexes.length) return;
    setAllSaving(true);
    setGlobalError('');
    try {
      await Promise.all(dirtyIndexes.map((i) => saveOne(i)));
      setAllSaved(true);
      setTimeout(() => setAllSaved(false), 2000);
    } catch {
      // individual errors handled in saveOne
    } finally {
      setAllSaving(false);
    }
  };

  const anyDirty = rows.some((_, i) => isDirty(i));

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-slate-800 font-semibold">Update Clauses</h3>
            <p className="text-slate-400 text-xs">{agreement.agreementNo}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 transition-colors rounded-full"
          >
            <X size={16} className="text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {globalError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3">
              <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs text-red-600">{globalError}</p>
            </div>
          )}
          {loading && (
            <div className="flex items-center justify-center py-10 gap-2 text-slate-400">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-sm">Loading clauses…</span>
            </div>
          )}
          {!loading && fetchError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3">
              <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs text-red-600">{fetchError}</p>
            </div>
          )}
          {!loading && !fetchError && rows.length === 0 && (
            <div className="text-center py-10">
              <FileCheck size={28} className="text-slate-200 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No clauses found for this agreement.</p>
            </div>
          )}
          {!loading &&
            rows.map((row, idx) => (
              <div key={row.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-slate-500 font-medium">
                    Clause {idx + 1}
                    <span className="ml-1.5 text-slate-300 text-xs">#{row.id}</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {row.saved && (
                      <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                        <Check size={11} /> Saved
                      </span>
                    )}
                    {isDirty(idx) && !row.saved && (
                      <button
                        onClick={() => saveOne(idx)}
                        disabled={row.saving}
                        className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg disabled:opacity-50 hover:bg-blue-100 transition-colors"
                      >
                        {row.saving ? (
                          <Loader2 size={11} className="animate-spin" />
                        ) : (
                          <Check size={11} />
                        )}
                        Save
                      </button>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <textarea
                    value={row.content}
                    onChange={(e) => updateRow(idx, e.target.value)}
                    className={`${inputCls} resize-none pr-8 ${
                      isDirty(idx)
                        ? 'border-amber-300 focus:ring-amber-400'
                        : row.saved
                        ? 'border-green-300 focus:ring-green-400'
                        : ''
                    }`}
                    rows={3}
                  />
                  {isDirty(idx) && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400" />
                  )}
                </div>
              </div>
            ))}
        </div>

        {!loading && rows.length > 0 && (
          <div className="px-4 py-4 bg-white border-t border-slate-100 shrink-0">
            <button
              onClick={saveAll}
              disabled={!anyDirty || allSaving}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-blue-700 transition-colors"
            >
              {allSaving ? (
                <><Loader2 size={15} className="animate-spin" /> Saving all…</>
              ) : allSaved ? (
                <><Check size={15} /> All Saved!</>
              ) : (
                <><Save size={15} /> Save All Changes</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  MarkAsSignedConfirmSheet
// ─────────────────────────────────────────────────────────────────────────────
function MarkAsSignedConfirmSheet({
  agreement,
  onClose,
  onSigned,
}: {
  agreement: Agreement;
  onClose: () => void;
  onSigned: (agreementId: string) => void;
}) {
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setSigning(true);
    setError('');
    try {
      await api.put(`/api/companies/${agreement.companyId}/sign-agreement`);
      onSigned(agreement.id);
      onClose();
    } catch (err: any) {
      setError(err.message ?? 'Failed to mark as signed. Please try again.');
    } finally {
      setSigning(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-slate-800 font-semibold">Mark Agreement as Signed</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 transition-colors rounded-full"
          >
            <X size={16} className="text-slate-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-slate-50 rounded-2xl p-4 space-y-1">
            <p className="text-xs text-slate-400">Agreement</p>
            <p className="text-slate-800 font-semibold text-sm">{agreement.agreementNo}</p>
            <p className="text-slate-500 text-xs">{agreement.companyName}</p>
          </div>

          <div className="flex items-start gap-2 bg-green-50 border border-green-100 rounded-xl px-3.5 py-3">
            <CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" />
            <p className="text-xs text-green-700">
              This will change the company status from{' '}
              <span className="font-semibold">AGREEMENT_SENT</span> →{' '}
              <span className="font-semibold">AGREEMENT_SIGNED</span>. The company will
              then appear in the Invoices page for billing.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3.5 py-3">
              <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              disabled={signing}
              className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={signing}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-green-700 transition-colors"
            >
              {signing ? (
                <><Loader2 size={15} className="animate-spin" /> Signing…</>
              ) : (
                <><PenLine size={15} /> Confirm Signed</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  AgreementsPage  (default export)
// ─────────────────────────────────────────────────────────────────────────────
export default function AgreementsPage() {
  const { companies } = useApp();

  const [agreements, setAgreements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgreementsFromCompanies = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/companies');
      const json = res.data;
      const allCompanies: any[] = Array.isArray(json) ? json : (json?.data || []);

      const agreementCompanies = allCompanies.filter(c =>
        c.status === 'AGREEMENT_SENT' ||
        c.status === 'AGREEMENT_SIGNED' ||
        c.status === 'INVOICED'
      );

      const mappedAgreements: Agreement[] = agreementCompanies.map(c => ({
        id: String(c.id),
        agreementNo: `AGR/2026/${String(c.id).padStart(3, '0')}`,
        companyId: String(c.id),
        companyName: c.companyName || c.name,
        date: c.updatedAt ? new Date(c.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        templateId: '',
        templateName: 'Standard_Agreement.docx',
        content: '',
        additionalClauses: [],
        notes: '',
        signed: c.status === 'AGREEMENT_SIGNED' || c.status === 'INVOICED',
        emailSubject: '',
        emailBody: ''
      }));

      setAgreements(mappedAgreements);
    } catch (error) {
      console.error('Error constructing agreements from companies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgreementsFromCompanies();
  }, []);

  const addAgreement = (a: any) => {
    setAgreements((prev) => [a, ...prev]);
  };

  const markAgreementSigned = (agreementId: string) => {
    setAgreements((prev) =>
      prev.map((a) => (a.id === agreementId ? { ...a, signed: true } : a))
    );
    setTimeout(fetchAgreementsFromCompanies, 1000);
  };

  const [view, setView] = useState<'list' | 'create'>('list');
  const [viewAgreement, setViewAgreement] = useState<any | null>(null);
  const [updateClausesFor, setUpdateClausesFor] = useState<any | null>(null);
  const [signConfirmFor, setSignConfirmFor] = useState<any | null>(null);

  // ─── Search State ──────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');

  // ─── Filter Logic ──────────────────────────────────────────────────────────
  const filteredAgreements = agreements.filter((a) =>
    a.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.agreementNo?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 space-y-4 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-800" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
            Agreements
          </h1>
          <p className="text-slate-400 text-xs">{filteredAgreements.length} total agreements</p>
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
          placeholder="Search by company name or agreement number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
        />
      </div>

      {/* Summary card */}
      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-blue-800 font-bold text-2xl">{agreements.length}</p>
          <p className="text-blue-400 text-xs mt-0.5">Total Agreements</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center shadow-inner">
          <FileCheck size={20} className="text-blue-600" />
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10 gap-2 text-slate-400 text-sm">
          <Loader2 size={18} className="animate-spin" /> Loading agreements…
        </div>
      )}

      {!loading && (
        <div className="space-y-2">
          {filteredAgreements.map((a) => (
            <div key={a.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-shadow hover:border-blue-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <FileCheck size={15} className="text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-slate-800 text-sm font-semibold">{a.agreementNo}</p>
                  <p className="text-slate-500 text-xs truncate">{a.companyName}</p>
                </div>
                {a.signed && (
                  <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full shrink-0">
                    <Check size={11} className="stroke-[3]" /> Signed
                  </span>
                )}
              </div>

              {a.templateName && (
                <div className="bg-slate-50 rounded-xl px-3 py-2 mb-3">
                  <p className="text-xs text-slate-400">Draft File</p>
                  <p className="text-slate-600 text-xs font-medium truncate">{a.templateName}</p>
                </div>
              )}

              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-xs text-slate-400">
                  {new Date(a.date).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: '2-digit',
                  })}
                </p>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {!a.signed && (
                    <button
                      onClick={() => setSignConfirmFor(a)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 transition-colors rounded-xl text-xs font-medium"
                    >
                      <PenLine size={12} /> Mark as Signed
                    </button>
                  )}
                  <button
                    onClick={() => setUpdateClausesFor(a)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors rounded-xl text-xs font-medium"
                  >
                    <Pencil size={12} /> Update Clauses
                  </button>
                  <button
                    onClick={() => setViewAgreement(a)}
                    className="w-9 h-9 flex items-center justify-center bg-blue-50 hover:bg-blue-100 transition-colors rounded-xl"
                  >
                    <Eye size={15} className="text-blue-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredAgreements.length === 0 && (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center shadow-sm">
              <FileCheck size={32} className="text-slate-200 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No agreements found</p>
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

      {/* ── Create Agreement Modal ── */}
      {view === 'create' && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm">
          <CreateAgreementView
            onBack={() => {
              setView('list');
              fetchAgreementsFromCompanies();
            }}
            existingCount={agreements.length}
            onSaved={(a) => addAgreement(a)}
          />
        </div>
      )}

      {viewAgreement && (
        <AgreementPreviewSheet
          agreement={viewAgreement}
          company={companies.find((c) => String(c.id) === String(viewAgreement.companyId))}
          onClose={() => setViewAgreement(null)}
        />
      )}

      {updateClausesFor && (
        <UpdateClausesSheet
          agreement={updateClausesFor}
          onClose={() => setUpdateClausesFor(null)}
        />
      )}

      {signConfirmFor && (
        <MarkAsSignedConfirmSheet
          agreement={signConfirmFor}
          onClose={() => setSignConfirmFor(null)}
          onSigned={(id) => {
            markAgreementSigned(id);
            setSignConfirmFor(null);
          }}
        />
      )}
    </div>
  );
}