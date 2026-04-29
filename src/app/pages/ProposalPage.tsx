import React, { useState } from 'react';
import {
  Plus,
  X,
  Eye,
  FileText,
  Check,
  Trash2,
  ArrowLeft,
  CheckCircle,
  Mail,
  Save,
  Upload,
  AlertCircle,
  Loader2,
  Pencil,
  ChevronDown,
  ChevronUp,
  Search,
  Send,
  ClipboardList,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Building2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OUR_COMPANY } from '../data/mockData';
import {
  dummyProposalCompanies,
  DummyProposalCompany,
  ProposalStatus,
} from '../data/dummyProposals';

// ─── Shared style ─────────────────────────────────────────────────────────────
const inputCls =
  'w-full px-3.5 py-3 text-sm border border-slate-200 rounded-xl ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Proposal {
  id: string;
  proposalNo: string;
  companyId: string;
  companyName: string;
  date: string;
  templateName: string;
  additionalClauses: string[];
  emailSubject: string;
  emailBody: string;
  sent: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateProposalNo(count: number) {
  return `PRO/2026/${String(count + 1).padStart(3, '0')}`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  ProposalPreviewSheet
// ─────────────────────────────────────────────────────────────────────────────
function ProposalPreviewSheet({
  proposal,
  company,
  onClose,
}: {
  proposal: Proposal;
  company: any;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <h3 className="text-slate-800 font-semibold">{proposal.proposalNo}</h3>
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
                <p className="text-yellow-300 font-bold text-sm">PROPOSAL</p>
                <p className="text-blue-300 text-xs">{proposal.proposalNo}</p>
              </div>
            </div>
            {company && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-white font-semibold text-sm">{company.companyName ?? company.name}</p>
                <p className="text-blue-300 text-xs">
                  {company.city}, {company.state}
                </p>
              </div>
            )}
            <div className="flex gap-4 mt-3 text-xs">
              <div>
                <p className="text-blue-300">Date</p>
                <p className="text-white">{proposal.date}</p>
              </div>
              <div>
                <p className="text-blue-300">Draft File</p>
                <p className="text-white">{proposal.templateName || '—'}</p>
              </div>
            </div>
          </div>

          {proposal.additionalClauses?.filter((c: string) => c.trim()).length > 0 && (
            <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-3">
                Additional Clauses
              </p>
              {proposal.additionalClauses
                .filter((c: string) => c.trim())
                .map((clause: string, i: number) => (
                  <p key={i} className="text-xs text-slate-700 mb-2">
                    <span className="font-semibold">{String.fromCharCode(65 + i)}. </span>
                    {clause}
                  </p>
                ))}
            </div>
          )}

          {(proposal.emailSubject || proposal.emailBody) && (
            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4 space-y-2">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                Email Details
              </p>
              {proposal.emailSubject && (
                <div>
                  <p className="text-xs text-slate-400">Subject</p>
                  <p className="text-xs text-slate-700 font-medium">{proposal.emailSubject}</p>
                </div>
              )}
              {proposal.emailBody && (
                <div>
                  <p className="text-xs text-slate-400">Body</p>
                  <p className="text-xs text-slate-700 whitespace-pre-line">{proposal.emailBody}</p>
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
//  EmailSentToast
// ─────────────────────────────────────────────────────────────────────────────
function EmailSentToast({ company, onClose }: { company: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <Mail size={28} className="text-green-600" />
          </div>
          <div>
            <p className="text-slate-800 font-bold text-base">Email Sent!</p>
            <p className="text-slate-500 text-sm mt-1">
              Proposal has been sent to <span className="font-semibold text-slate-700">{company}</span> successfully.
            </p>
          </div>
          <div className="w-full bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-xs text-green-700 text-left">
            <p className="font-semibold mb-1">✓ Email delivered</p>
            <p className="text-green-600">This is a demo notification. No real email was sent.</p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  CreateProposalView
// ─────────────────────────────────────────────────────────────────────────────
function CreateProposalView({
  onBack,
  existingCount,
  onSaved,
}: {
  onBack: () => void;
  existingCount: number;
  onSaved: (p: Proposal) => void;
}) {
  const { companies } = useApp();

  // ── Tab state ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'details' | 'email'>('details');

  // ── Details tab fields ─────────────────────────────────────────────────────
  const [companyId, setCompanyId] = useState('');
  const [clauses, setClauses] = useState<string[]>(['']);
  const [draftFile, setDraftFile] = useState<File | null>(null);
  const [draftError, setDraftError] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [clausesOpen, setClausesOpen] = useState(true);
  const [draftOpen, setDraftOpen] = useState(true);

  // ── Email Details tab fields ───────────────────────────────────────────────
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // ── Action state ───────────────────────────────────────────────────────────
  const [actionState, setActionState] = useState<
    'idle' | 'saving' | 'saved' | 'sending' | 'sent' | 'error'
  >('idle');
  const [showEmailSentToast, setShowEmailSentToast] = useState(false);

  const selectedCompany = companies.find((c) => String(c.id) === String(companyId));

  const proposalNo = generateProposalNo(existingCount);
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
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    if (!isDocx) {
      setDraftError('Only .docx (Word) files are accepted. Please re-select.');
      setDraftFile(null);
      e.target.value = '';
      return;
    }
    setDraftError('');
    setDraftFile(file);
  };

  const buildProposal = (): Proposal => ({
    id: Date.now().toString(),
    proposalNo,
    companyId,
    companyName: selectedCompany?.companyName ?? '',
    date: new Date().toISOString().split('T')[0],
    templateName: draftFile?.name ?? '',
    additionalClauses: nonEmptyClauses,
    emailSubject: emailSubject.trim(),
    emailBody: emailBody.trim(),
    sent: false,
  });

  const handleSaveDraft = async () => {
    if (!isFormValid || isLoading) return;
    setActionState('saving');
    // Simulate save
    await new Promise((r) => setTimeout(r, 800));
    const proposal = buildProposal();
    onSaved(proposal);
    setActionState('saved');
    setTimeout(() => {
      setActionState('idle');
      onBack();
    }, 1200);
  };

  const handleSendMail = async () => {
    if (!isSendValid || isLoading) return;
    setActionState('sending');
    // Simulate sending
    await new Promise((r) => setTimeout(r, 1000));
    const proposal = { ...buildProposal(), sent: true };
    onSaved(proposal);
    setActionState('sent');
    setShowEmailSentToast(true);
  };

  const detailsComplete = isDetailsValid;
  const emailComplete = isEmailValid;

  return (
    <>
      {showEmailSentToast && (
        <EmailSentToast
          company={selectedCompany?.companyName ?? 'the company'}
          onClose={() => {
            setShowEmailSentToast(false);
            setActionState('idle');
            onBack();
          }}
        />
      )}

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
            <h2 className="text-slate-800 font-semibold text-sm">New Proposal</h2>
            <p className="text-slate-400 text-xs">{proposalNo}</p>
          </div>
        </div>

        {/* ── Violet banner ── */}
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

        {/* ── Tab switcher ── */}
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
                      Select a registered company to send a proposal.
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1.5 font-medium">
                        Company <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={companyId}
                        onChange={(e) => setCompanyId(e.target.value)}
                        className={inputCls}
                      >
                        <option value="">Select Company</option>
                        {companies.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.companyName}
                          </option>
                        ))}
                      </select>
                    </div>
                    {selectedCompany && (
                      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
                        <p className="font-semibold">{selectedCompany.companyName}</p>
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
                        Clauses are optional. They will be appended to your draft.
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
                        className="flex items-center gap-1.5 text-xs text-blue-600 font-medium bg-blue-50 px-3 py-2 rounded-xl hover:bg-blue-100 transition-colors"
                      >
                        <Plus size={13} /> Add Clause
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
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        className="hidden"
                        onChange={handleFilePick}
                      />
                      {!draftFile ? (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full border-2 border-dashed border-blue-200 rounded-xl py-6 flex flex-col items-center gap-2 text-blue-400 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                        >
                          <Upload size={22} />
                          <span className="text-xs font-medium">Upload .docx draft</span>
                          <span className="text-xs text-slate-400">Word documents only</span>
                        </button>
                      ) : (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                            <FileText size={15} className="text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-green-700 truncate">
                              {draftFile.name}
                            </p>
                            <p className="text-xs text-green-500">
                              {(draftFile.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setDraftFile(null);
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-green-100 hover:bg-green-200 transition-colors"
                          >
                            <X size={13} className="text-green-700" />
                          </button>
                        </div>
                      )}
                      {draftError && (
                        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                          <AlertCircle size={13} className="text-red-500 mt-0.5 shrink-0" />
                          <p className="text-xs text-red-600">{draftError}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ════ TAB 2 — EMAIL DETAILS ════ */}
            {activeTab === 'email' && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-50 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                    <Mail size={12} className="text-white" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800">Email Details</p>
                  {emailComplete && (
                    <CheckCircle size={14} className="text-green-500 ml-auto shrink-0" />
                  )}
                </div>
                <div className="p-4 space-y-4">
                  <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-600">
                    Fill in the email details to send the proposal directly to the company.
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5 font-medium">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className={inputCls}
                      placeholder="e.g. Proposal for Services – RA & RA Counsel"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5 font-medium">
                      Email Body <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className={`${inputCls} resize-none`}
                      rows={8}
                      placeholder="Dear [Company Name],&#10;&#10;Please find attached our proposal for the requested services…"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer actions ── */}
        <div className="bg-white border-t border-slate-100 px-4 py-4 flex gap-3 shrink-0">
          <button
            onClick={handleSaveDraft}
            disabled={!isFormValid || isLoading}
            className="flex-1 flex items-center justify-center gap-2 py-3 border border-blue-300 text-blue-700 bg-blue-50 rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-blue-100 transition-colors"
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
            onClick={handleSendMail}
            disabled={!isSendValid || isLoading}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-blue-700 transition-colors"
          >
            {actionState === 'sending' ? (
              <><Loader2 size={15} className="animate-spin" /> Sending…</>
            ) : actionState === 'sent' ? (
              <><Check size={15} /> Sent!</>
            ) : (
              <><Send size={15} /> Send Email</>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Status badge helper
// ─────────────────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: ProposalStatus }) {
  if (status === 'accepted') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
        <Check size={11} className="stroke-[3]" /> Accepted
      </span>
    );
  }
  if (status === 'rejected') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
        <X size={11} className="stroke-[3]" /> Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
      <Clock size={11} /> Pending
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  ProposalPage  (default export)
// ─────────────────────────────────────────────────────────────────────────────
export default function ProposalPage() {
  const { companies } = useApp();

  // ─── Created proposals (from New button) ──────────────────────────────────
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [view, setView] = useState<'list' | 'create'>('list');
  const [viewProposal, setViewProposal] = useState<Proposal | null>(null);

  // ─── Dummy company statuses (UI-only, starts all as pending) ──────────────
  const [dummyStatuses, setDummyStatuses] = useState<Record<string, ProposalStatus>>(
    () => Object.fromEntries(dummyProposalCompanies.map((c) => [c.id, c.status]))
  );

  const setStatus = (id: string, status: ProposalStatus) =>
    setDummyStatuses((prev) => ({ ...prev, [id]: status }));

  // ─── Search ───────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');

  const addProposal = (p: Proposal) => setProposals((prev) => [p, ...prev]);

  // Filter dummy list by search
  const filteredDummy = dummyProposalCompanies.filter(
    (c) =>
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.proposalNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Summary counts
  const totalAll = dummyProposalCompanies.length + proposals.length;
  const acceptedCount = Object.values(dummyStatuses).filter((s) => s === 'accepted').length;
  const rejectedCount = Object.values(dummyStatuses).filter((s) => s === 'rejected').length;
  const pendingCount  = Object.values(dummyStatuses).filter((s) => s === 'pending').length;

  return (
    <div className="p-4 space-y-4 relative">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-800" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
            Proposals
          </h1>
          <p className="text-slate-400 text-xs">{totalAll} total proposals</p>
        </div>
        <button
          onClick={() => setView('create')}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Plus size={15} /> New
        </button>
      </div>

      {/* ── Search Bar ── */}
      <div className="relative shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={16} className="text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Search by company name or proposal number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
        />
      </div>

      {/* ── Summary strip ── */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 text-center shadow-sm">
          <p className="text-amber-700 font-bold text-xl">{pendingCount}</p>
          <p className="text-amber-500 text-[10px] mt-0.5 font-medium">Pending</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-2xl p-3 text-center shadow-sm">
          <p className="text-green-700 font-bold text-xl">{acceptedCount}</p>
          <p className="text-green-500 text-[10px] mt-0.5 font-medium">Accepted</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-2xl p-3 text-center shadow-sm">
          <p className="text-red-600 font-bold text-xl">{rejectedCount}</p>
          <p className="text-red-400 text-[10px] mt-0.5 font-medium">Rejected</p>
        </div>
      </div>

      {/* ── Dummy company proposal cards ── */}
      <div className="space-y-3">
        {filteredDummy.map((c) => {
          const status = dummyStatuses[c.id] ?? 'pending';
          return (
            <div
              key={c.id}
              className={`bg-white rounded-2xl border p-4 shadow-sm transition-all ${
                status === 'accepted'
                  ? 'border-green-200 hover:border-green-300'
                  : status === 'rejected'
                  ? 'border-red-200 hover:border-red-300'
                  : 'border-slate-100 hover:border-blue-100 hover:shadow-md'
              }`}
            >
              {/* ── Top row: icon + name + status badge ── */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Building2 size={16} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-slate-800 text-sm font-semibold leading-tight">{c.companyName}</p>
                    <StatusBadge status={status} />
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5">{c.proposalNo}</p>
                </div>
              </div>

              {/* ── Info row ── */}
              <div className="bg-slate-50 rounded-xl px-3 py-2.5 mb-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">Contact</p>
                  <p className="text-xs text-slate-700 font-medium">{c.contactPerson}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">Location</p>
                  <p className="text-xs text-slate-700 font-medium">{c.city}, {c.state}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">Service</p>
                  <p className="text-xs text-slate-700 font-medium">{c.service}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">Sent On</p>
                  <p className="text-xs text-slate-700 font-medium">
                    {new Date(c.sentDate).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {/* ── Action buttons ── */}
              <div className="flex gap-2">
                <button
                  onClick={() => setStatus(c.id, 'accepted')}
                  disabled={status === 'accepted'}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    status === 'accepted'
                      ? 'bg-green-500 border-green-500 text-white cursor-default'
                      : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 active:scale-95'
                  }`}
                >
                  <ThumbsUp size={13} />
                  Accept
                </button>
                <button
                  onClick={() => setStatus(c.id, 'rejected')}
                  disabled={status === 'rejected'}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    status === 'rejected'
                      ? 'bg-red-500 border-red-500 text-white cursor-default'
                      : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100 active:scale-95'
                  }`}
                >
                  <ThumbsDown size={13} />
                  Reject
                </button>
                {status !== 'pending' && (
                  <button
                    onClick={() => setStatus(c.id, 'pending')}
                    className="w-10 flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 transition-all active:scale-95"
                    title="Reset to Pending"
                  >
                    <Clock size={13} />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredDummy.length === 0 && searchQuery && (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center shadow-sm">
            <ClipboardList size={32} className="text-slate-200 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No proposals match your search</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-3 text-blue-600 text-sm font-medium hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg transition-colors"
            >
              Clear search
            </button>
          </div>
        )}
      </div>

      {/* ── Create Proposal Modal ── */}
      {view === 'create' && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm">
          <CreateProposalView
            onBack={() => setView('list')}
            existingCount={proposals.length + dummyProposalCompanies.length}
            onSaved={(p) => {
              addProposal(p);
              setView('list');
            }}
          />
        </div>
      )}

      {viewProposal && (
        <ProposalPreviewSheet
          proposal={viewProposal}
          company={companies.find((c) => String(c.id) === String(viewProposal.companyId))}
          onClose={() => setViewProposal(null)}
        />
      )}
    </div>
  );
}