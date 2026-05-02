import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  X,
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
  RefreshCw,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../../services/api';
import {
  proposalService,
  ProposalResponse,
  ProposalClause,
  ProposalCompany,
  ProposalStatus,
} from '../../services/proposalService';

// ─── Shared style ─────────────────────────────────────────────────────────────
const inputCls =
  'w-full px-3.5 py-3 text-sm border border-slate-200 rounded-xl ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';

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
            <p className="text-slate-800 font-bold text-base">Proposal Sent!</p>
            <p className="text-slate-500 text-sm mt-1">
              Proposal has been sent to{' '}
              <span className="font-semibold text-slate-700">{company}</span> successfully.
            </p>
          </div>
          <div className="w-full bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-xs text-green-700 text-left">
            <p className="font-semibold mb-1">✓ Email delivered</p>
            <p className="text-green-600">The proposal email has been sent to the company.</p>
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
//  EditClauseModal
// ─────────────────────────────────────────────────────────────────────────────
function EditClauseModal({
  clause,
  onSave,
  onClose,
}: {
  clause: ProposalClause;
  onSave: (clauseId: number, content: string) => Promise<void>;
  onClose: () => void;
}) {
  const [content, setContent] = useState(clause.clauseContent);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    setError('');
    try {
      await onSave(clause.id, content.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update clause');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[70] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-slate-800 font-semibold text-sm">Edit Clause</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
          >
            <X size={16} className="text-slate-500" />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={`${inputCls} resize-none`}
            rows={5}
            placeholder="Enter clause content…"
            autoFocus
          />
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle size={13} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !content.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-blue-700 transition-colors"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  UpdateClausesSheet
// ─────────────────────────────────────────────────────────────────────────────
function UpdateClausesSheet({
  proposal,
  onClose,
}: {
  proposal: ProposalResponse;
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
        const data: ProposalClause[] = await proposalService.getClausesByProposal(
          Number(proposal.companyId || proposal.id)
        );
        setRows(
          data.map((c) => ({
            id: c.id,
            content: c.clauseContent,
            original: c.clauseContent,
            saving: false,
            saved: false,
          }))
        );
      } catch (err: any) {
        setFetchError(err.message || 'Failed to load clauses.');
      } finally {
        setLoading(false);
      }
    })();
  }, [proposal.companyId, proposal.id]);

  const updateRow = (idx: number, value: string) =>
    setRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, content: value, saved: false } : r))
    );

  const isDirty = (idx: number) => rows[idx]?.content !== rows[idx]?.original;

  const saveOne = async (idx: number) => {
    const row = rows[idx];
    if (!isDirty(idx) || row.saving) return;
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, saving: true } : r)));
    setGlobalError('');
    try {
      const updated = await proposalService.updateClause(row.id, { clauseContent: row.content });
      setRows((prev) =>
        prev.map((r, i) =>
          i === idx
            ? { ...r, saving: false, saved: true, original: updated.clauseContent }
            : r
        )
      );
    } catch (err: any) {
      setGlobalError(err.message || 'Failed to update clause.');
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
            <p className="text-slate-400 text-xs">{proposal.proposalNumber ?? `#${proposal.id}`}</p>
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
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
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
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs text-red-600">{fetchError}</p>
            </div>
          )}
          {!loading && !fetchError && rows.length === 0 && (
            <div className="text-center py-10">
              <FileCheck size={28} className="text-slate-200 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No clauses found for this proposal.</p>
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
//  ProposalDetailView
// ─────────────────────────────────────────────────────────────────────────────
function ProposalDetailView({
  proposal,
  company,
  onBack,
  onSent,
}: {
  proposal: ProposalResponse;
  company: ProposalCompany | undefined;
  onBack: () => void;
  onSent: () => void;
}) {
  const [clauses, setClauses] = useState<ProposalClause[]>(proposal.clauses ?? []);
  const [loadingClauses, setLoadingClauses] = useState(false);

  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [draftFile, setDraftFile] = useState<File | null>(null);
  const [draftError, setDraftError] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [selectedClauseIds, setSelectedClauseIds] = useState<number[]>([]);

  const [editingClause, setEditingClause] = useState<ProposalClause | null>(null);
  const [deletingClauseId, setDeletingClauseId] = useState<number | null>(null);
  const [sendState, setSendState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [sendError, setSendError] = useState('');
  const [showEmailSentToast, setShowEmailSentToast] = useState(false);
  const [clausesOpen, setClausesOpen] = useState(true);
  const [emailOpen, setEmailOpen] = useState(true);

  const refreshClauses = async () => {
    setLoadingClauses(true);
    try {
      const fresh = await proposalService.getClausesByProposal(proposal.companyId || proposal.id);
      setClauses(fresh);
    } catch (err) {
      console.error('Failed to refresh clauses', err);
    } finally {
      setLoadingClauses(false);
    }
  };

  const handleUpdateClause = async (clauseId: number, content: string) => {
    await proposalService.updateClause(clauseId, { clauseContent: content });
    await refreshClauses();
  };

  const handleDeleteClause = async (clauseId: number) => {
    setDeletingClauseId(clauseId);
    try {
      await proposalService.deleteClause(clauseId);
      setClauses((prev) => prev.filter((c) => c.id !== clauseId));
      setSelectedClauseIds((prev) => prev.filter((id) => id !== clauseId));
    } catch (err: any) {
      console.error('Delete clause failed:', err);
    } finally {
      setDeletingClauseId(null);
    }
  };

  const toggleClauseSelect = (clauseId: number) => {
    setSelectedClauseIds((prev) =>
      prev.includes(clauseId) ? prev.filter((id) => id !== clauseId) : [...prev, clauseId]
    );
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isDocx =
      file.name.toLowerCase().endsWith('.docx') ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    if (!isDocx) {
      setDraftError('Only .docx (Word) files are accepted.');
      setDraftFile(null);
      e.target.value = '';
      return;
    }
    setDraftError('');
    setDraftFile(file);
  };

  const isSendValid = !!emailSubject.trim() && !!emailBody.trim() && (!!draftFile || selectedClauseIds.length > 0);

  const handleSendProposal = async () => {
    if (!isSendValid || sendState === 'sending') return;
    setSendState('sending');
    setSendError('');

    let templateContent = '';
    let fileName = draftFile?.name || '';
    
    if (draftFile) {
      try {
        templateContent = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1] ?? '';
            resolve(base64);
          };
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(draftFile!);
        });
      } catch {
        templateContent = draftFile!.name;
      }
    } else {
      const selectedClauseTexts = clauses
        .filter(c => selectedClauseIds.includes(c.id))
        .map(c => c.clauseContent);
        
      if (selectedClauseTexts.length > 0) {
        templateContent = "PROPOSAL CLAUSES:\n\n" + selectedClauseTexts.map((c, i) => `${i + 1}. ${c}`).join('\n\n');
      }
    }

    try {
      const targetId = proposal.companyId || proposal.id;
      await proposalService.finalizeAndSend(targetId, {
        templateContent,
        fileName,
        selectedClauseIds,
        emailSubject: emailSubject.trim(),
        emailBody: emailBody.trim(),
      });
      setSendState('sent');
      setShowEmailSentToast(true);
    } catch (err: any) {
      setSendState('error');
      setSendError(err?.response?.data?.message || err.message || 'Failed to send proposal');
    }
  };

  return (
    <>
      {showEmailSentToast && (
        <EmailSentToast
          company={company?.companyName ?? proposal.companyName}
          onClose={() => {
            setShowEmailSentToast(false);
            onSent();
          }}
        />
      )}

      {editingClause && (
        <EditClauseModal
          clause={editingClause}
          onSave={handleUpdateClause}
          onClose={() => setEditingClause(null)}
        />
      )}

      <div className="flex flex-col h-full max-w-5xl mx-auto w-full bg-white shadow-sm sm:rounded-2xl sm:border border-slate-200 overflow-hidden sm:my-4">
        <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 shrink-0">
          <button
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft size={16} className="text-slate-600" />
          </button>
          <div className="flex-1">
            <h2 className="text-slate-800 font-semibold text-sm">
              {proposal.proposalNumber ?? `Proposal #${proposal.id}`}
            </h2>
            <p className="text-slate-400 text-xs">{company?.companyName ?? proposal.companyName}</p>
          </div>
          <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full font-semibold">
            Draft Saved
          </span>
        </div>

        <div className="bg-blue-600 px-4 py-2.5 flex items-center justify-between shrink-0">
          <span className="text-blue-200 text-xs">
            {draftFile ? 'Draft Ready to Send' : 'Upload .docx draft to finalize'}
          </span>
          <span className="text-white font-semibold text-xs">
            {draftFile
              ? draftFile.name.length > 28
                ? draftFile.name.slice(0, 26) + '…'
                : draftFile.name
              : 'No file selected'}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50">
          <div className="p-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div
                onClick={() => setClausesOpen((v) => !v)}
                className="w-full px-4 py-3 border-b border-slate-50 flex items-center gap-2 cursor-pointer select-none"
              >
                <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <p className="text-sm font-semibold text-slate-800 flex-1 text-left">
                  Clauses
                  <span className="text-xs font-normal text-slate-400 ml-1">
                    ({clauses.length} saved)
                  </span>
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); refreshClauses(); }}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors mr-1"
                  title="Refresh clauses"
                >
                  <RefreshCw size={12} className={`text-slate-500 ${loadingClauses ? 'animate-spin' : ''}`} />
                </button>
                {clausesOpen ? (
                  <ChevronUp size={15} className="text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown size={15} className="text-slate-400 shrink-0" />
                )}
              </div>

              {clausesOpen && (
                <div className="p-4 space-y-3">
                  {clauses.length === 0 ? (
                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                      <p className="text-xs text-slate-400">No clauses saved for this proposal.</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-blue-600 bg-blue-50 rounded-xl p-3">
                        Select clauses to include when sending. You can also edit or delete them.
                      </p>
                      {clauses.map((clause) => {
                        const isSelected = selectedClauseIds.includes(clause.id);
                        const isDeleting = deletingClauseId === clause.id;
                        return (
                          <div
                            key={clause.id}
                            className={`rounded-xl border p-3 transition-all ${
                              isSelected ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-white'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <button
                                onClick={() => toggleClauseSelect(clause.id)}
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                  isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'
                                }`}
                              >
                                {isSelected && <Check size={10} className="text-white stroke-[3]" />}
                              </button>
                              <p className="text-xs text-slate-700 flex-1 leading-relaxed">
                                {clause.clauseContent}
                              </p>
                              <div className="flex gap-1 shrink-0">
                                <button
                                  onClick={() => setEditingClause(clause)}
                                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                                  title="Edit"
                                >
                                  <Pencil size={12} className="text-slate-500" />
                                </button>
                                <button
                                  onClick={() => handleDeleteClause(clause.id)}
                                  disabled={isDeleting}
                                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-40"
                                  title="Delete"
                                >
                                  {isDeleting ? (
                                    <Loader2 size={12} className="text-red-500 animate-spin" />
                                  ) : (
                                    <Trash2 size={12} className="text-red-500" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-50 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <p className="text-sm font-semibold text-slate-800 flex-1">
                  Upload Draft <span className="text-red-500">*</span>
                </p>
                {draftFile && <CheckCircle size={14} className="text-green-500 shrink-0" />}
              </div>
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
                      <p className="text-xs font-semibold text-green-700 truncate">{draftFile.name}</p>
                      <p className="text-xs text-green-500">{(draftFile.size / 1024).toFixed(1)} KB</p>
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
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div
                onClick={() => setEmailOpen((v) => !v)}
                className="w-full px-4 py-3 border-b border-slate-50 flex items-center gap-2 cursor-pointer select-none"
              >
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                  <Mail size={12} className="text-white" />
                </div>
                <p className="text-sm font-semibold text-slate-800 flex-1 text-left">
                  Email Details <span className="text-red-500">*</span>
                </p>
                {emailSubject.trim() && emailBody.trim() && (
                  <CheckCircle size={14} className="text-green-500 mr-1 shrink-0" />
                )}
                {emailOpen ? (
                  <ChevronUp size={15} className="text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown size={15} className="text-slate-400 shrink-0" />
                )}
              </div>

              {emailOpen && (
                <div className="p-4 space-y-4">
                  <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-600">
                    Fill in the email details to finalize and send the proposal.
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5 font-medium">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className={inputCls}
                      placeholder="e.g. Project Proposal - RA & RA Counsels"
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
                      rows={6}
                      placeholder="Please find attached the detailed proposal for our upcoming engagement…"
                    />
                  </div>
                </div>
              )}
            </div>

            {sendError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                <AlertCircle size={13} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-xs text-red-600">{sendError}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border-t border-slate-100 px-4 py-4 shrink-0">
          <button
            onClick={handleSendProposal}
            disabled={!isSendValid || sendState === 'sending'}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-blue-700 transition-colors"
          >
            {sendState === 'sending' ? (
              <><Loader2 size={15} className="animate-spin" /> Sending…</>
            ) : sendState === 'sent' ? (
              <><Check size={15} /> Sent!</>
            ) : (
              <><Send size={15} /> Finalize & Send Proposal</>
            )}
          </button>
          {!isSendValid && (
            <p className="text-center text-xs text-slate-400 mt-2">
              {!draftFile && selectedClauseIds.length === 0
                ? 'Upload a draft or select clauses to continue'
                : 'Fill in email subject and body to send'}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

function CreateProposalView({
  onBack,
  onDraftSaved,
  onSentAndDone,
}: {
  onBack: () => void;
  onDraftSaved: (proposal: ProposalResponse, company: ProposalCompany | undefined) => void;
  onSentAndDone: (companyName: string) => void;
}) {
  const [companies, setCompanies] = useState<ProposalCompany[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [companiesError, setCompaniesError] = useState('');

  const [companyId, setCompanyId] = useState('');
  const [clauses, setClauses] = useState<string[]>(['']);
  const [clausesOpen, setClausesOpen] = useState(true);

  const [activeTab, setActiveTab] = useState<'details' | 'email'>('details');

  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  const [draftFile, setDraftFile] = useState<File | null>(null);
  const [draftError, setDraftError] = useState('');
  const [draftOpen, setDraftOpen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [actionState, setActionState] = useState<'idle' | 'saving' | 'saved' | 'sending' | 'sent' | 'error'>('idle');
  const [saveError, setSaveError] = useState('');

  const isLoading = actionState === 'saving' || actionState === 'sending';

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoadingCompanies(true);
      setCompaniesError('');
      try {
        const data = await proposalService.getRegisteredCompanies();
        setCompanies(data);
      } catch (err: any) {
        setCompaniesError(err.message || 'Failed to load companies');
      } finally {
        setLoadingCompanies(false);
      }
    };
    fetchCompanies();
  }, []);

  const selectedCompany = companies.find((c) => String(c.id) === String(companyId));
  const nonEmptyClauses = clauses.filter((c) => c.trim());
  const isFormValid = !!companyId;
  const isEmailValid = !!emailSubject.trim() && !!emailBody.trim();
  const detailsComplete = isFormValid;
  const emailComplete = isEmailValid;

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

  const buildFallbackProposal = (savedRaw: any): ProposalResponse => {
    if (savedRaw != null && typeof savedRaw === 'object' && 'id' in savedRaw) {
      return { status: 'pending' as ProposalStatus, clauses: [], ...savedRaw };
    }
    const fallbackId = Date.now();
    return {
      id: fallbackId,
      proposalNumber: `PRO/2026/${String(Number(companyId)).padStart(3, '0')}`,
      companyId: Number(companyId),
      companyName: selectedCompany?.companyName ?? '',
      status: 'pending' as ProposalStatus,
      clauses: [],
      createdAt: new Date().toISOString(),
    };
  };

  const handleSaveDraft = async () => {
    if (!isFormValid || isLoading) return;
    setActionState('saving');
    setSaveError('');
    try {
      const savedRaw = await proposalService.saveDraft({
        companyId: Number(companyId),
        additionalClauses: nonEmptyClauses,
      });
      const proposal = buildFallbackProposal(savedRaw);
      setActionState('saved');
      setTimeout(() => {
        onDraftSaved(proposal, selectedCompany);
      }, 600);
    } catch (err: any) {
      setActionState('error');
      setSaveError(err?.response?.data?.message || err.message || 'Failed to save draft');
    }
  };

  const handleSaveAndSend = async () => {
    if (!isFormValid || isLoading) return;
    if (!isEmailValid) {
      setActiveTab('email');
      return;
    }
    setActionState('sending');
    setSaveError('');
    
    try {
      if (nonEmptyClauses.length > 0) {
        await proposalService.saveDraft({
          companyId: Number(companyId),
          additionalClauses: nonEmptyClauses,
        });
      }

      let templateContent = '';
      let fileName = '';

      if (draftFile) {
        templateContent = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1] ?? '');
          };
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(draftFile);
        });
        fileName = draftFile.name;
      } else {
        if (nonEmptyClauses.length > 0) {
          templateContent = "PROPOSAL CLAUSES:\n\n" + nonEmptyClauses.map((c, i) => `${i + 1}. ${c}`).join('\n\n');
        }
      }

      await proposalService.finalizeAndSend(Number(companyId), {
        templateContent,
        fileName,
        additionalClauses: nonEmptyClauses,
        selectedClauseIds: [], 
        emailSubject: emailSubject.trim(),
        emailBody: emailBody.trim(),
      });

      setActionState('sent');
      
      setTimeout(() => {
        onSentAndDone(selectedCompany?.companyName ?? '');
      }, 800);
    } catch (err: any) {
      setActionState('error');
      setSaveError(err?.response?.data?.message || err.message || 'Failed to send proposal. Make sure the draft was saved correctly.');
    }
  };

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
          <h2 className="text-slate-800 font-semibold text-sm">New Proposal</h2>
          <p className="text-slate-400 text-xs">Select company and add clauses</p>
        </div>
      </div>

      <div className="bg-blue-600 px-4 py-2.5 flex items-center justify-between shrink-0">
        <span className="text-blue-200 text-xs">
          {draftFile ? 'Draft Ready' : 'No Draft Attached (Optional)'}
        </span>
        <span className="text-white font-semibold text-xs">
          {draftFile
            ? draftFile.name.length > 28
              ? draftFile.name.slice(0, 26) + '…'
              : draftFile.name
            : 'No file selected'}
        </span>
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
                {saveError || 'Something went wrong. Please try again.'}
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
                  <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-600">
                    Only registered companies are listed here.
                  </div>

                  {loadingCompanies ? (
                    <div className="flex items-center gap-2 text-slate-400 text-sm py-2">
                      <Loader2 size={15} className="animate-spin" />
                      Loading companies…
                    </div>
                  ) : companiesError ? (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                      <AlertCircle size={13} className="text-red-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-red-600">{companiesError}</p>
                    </div>
                  ) : (
                    <>
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
                          {selectedCompany.email && (
                            <p className="text-blue-400 mt-0.5">{selectedCompany.email}</p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

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
                      Clauses are optional. They will be saved and can be selected when sending.
                    </div>
                    {clauses.map((clause, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs text-slate-500 font-medium">Clause {idx + 1}</label>
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

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => setDraftOpen((v) => !v)}
                  className="w-full px-4 py-3 border-b border-slate-50 flex items-center gap-2"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 flex-1 text-left">
                    Upload Draft{' '}
                    <span className="text-xs font-normal text-slate-400">(optional)</span>
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
                      Upload your proposal as a <strong>.docx</strong> (Word) file. This is optional
                      at this stage — you can also upload it after saving the draft.
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
                      <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                        <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-red-600">{draftError}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl p-4 space-y-2 border border-slate-200 shadow-sm">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Summary
                </p>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-400">Company</p>
                  <p className="text-xs font-medium text-slate-700">
                    {selectedCompany ? (
                      selectedCompany.companyName
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
                      <span className="text-slate-400">Not uploaded</span>
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

              {isFormValid && !isEmailValid && (
                <button
                  onClick={() => setActiveTab('email')}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-100 transition-colors rounded-2xl text-blue-600 text-xs font-semibold shadow-sm"
                >
                  <Mail size={13} /> Fill in Email Details →
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
                <p className="text-sm font-semibold text-slate-800 flex-1 text-left">
                  Email Details <span className="text-red-500">*</span>
                </p>
                {emailComplete && (
                  <span className="w-5 h-5 rounded-full bg-green-500 shadow-sm flex items-center justify-center">
                    <Check size={11} className="text-white" />
                  </span>
                )}
              </div>

              <div className="p-4 space-y-4">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
                  These fields are used as the email subject and body when the proposal is sent to
                  the company after saving the draft.
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
                    placeholder="e.g. Project Proposal - RA & RA Counsels"
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
                    placeholder={'Please find attached the detailed proposal for our upcoming engagement…\n\nBest Regards,\nYour Name'}
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

                {!isFormValid && (
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
            className="flex-1 flex items-center justify-center gap-2 py-3 border border-slate-100 text-slate-400 bg-slate-50 rounded-xl text-sm font-medium cursor-not-allowed"
          >
            <FileText size={15} />
            {draftFile ? draftFile.name.slice(0, 12) + '…' : 'No draft attached'}
          </button>
        </div>

        <button
          onClick={handleSaveAndSend}
          disabled={!isFormValid || isLoading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold disabled:opacity-50 disabled:bg-slate-300 hover:bg-blue-700 transition-colors shadow-md"
        >
          {actionState === 'sending' ? (
            <><Loader2 size={15} className="animate-spin" /> Sending…</>
          ) : actionState === 'sent' ? (
            <><Check size={15} className="stroke-[3]" /> Mail Sent!</>
          ) : (
            <><Mail size={15} /> Finalize &amp; Send Mail</>
          )}
        </button>

        {isFormValid && !isEmailValid && actionState === 'idle' && (
          <p className="text-center text-xs text-amber-500">
            ⚠ Fill in <button onClick={() => setActiveTab('email')} className="underline font-medium">Email Details</button> tab to enable Send Mail
          </p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Status badge
// ─────────────────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: ProposalStatus | string }) {
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
//  ProposalPage (default export)
// ─────────────────────────────────────────────────────────────────────────────
type ViewMode = 'list' | 'create' | 'detail';

export default function ProposalPage() {
  const [proposals, setProposals] = useState<ProposalResponse[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(true);
  const [proposalsError, setProposalsError] = useState('');

  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [activeProposal, setActiveProposal] = useState<ProposalResponse | null>(null);
  const [activeCompany, setActiveCompany] = useState<ProposalCompany | undefined>(undefined);

  // Modal states
  const [updateClausesFor, setUpdateClausesFor] = useState<ProposalResponse | null>(null);
  const [sentToastCompany, setSentToastCompany] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProposals = async () => {
    setLoadingProposals(true);
    setProposalsError('');
    try {
      const res = await api.get('/api/companies');
      const json = res.data;
      const allCompanies: any[] = Array.isArray(json) ? json : (json?.data || []);

      const proposalCompanies = allCompanies.filter((c: any) =>
        [
          'PROPOSAL_SENT', 'PROPOSAL_ACCEPTED', 'PROPOSAL_REJECTED', 'PROPOSAL_PENDING',
          'QUOTATION_SENT', 'AGREEMENT_SENT', 'AGREEMENT_SIGNED', 'INVOICED', 'ACTIVE'
        ].includes(c.status)
      );

      const mapped: ProposalResponse[] = proposalCompanies.map((c: any) => ({
        id: c.proposalId || c.id, 
        proposalNumber: c.proposalNumber || `PRO/2026/${String(c.id).padStart(3, '0')}`,
        companyId: c.id, 
        companyName: c.companyName || c.name,
        status: ['PROPOSAL_ACCEPTED', 'QUOTATION_SENT', 'AGREEMENT_SENT', 'AGREEMENT_SIGNED', 'INVOICED', 'ACTIVE'].includes(c.status)
          ? 'accepted'
          : c.status === 'PROPOSAL_REJECTED'
          ? 'rejected'
          : 'pending',
        clauses: c.clauses || [],
        createdAt: c.proposalDate || c.updatedAt || c.createdAt || new Date().toISOString(),
      }));

      setProposals(mapped);
    } catch (err: any) {
      console.error('Error constructing proposals from companies:', err);
      setProposalsError(err.message || 'Failed to load proposals');
    } finally {
      setLoadingProposals(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const pendingCount  = proposals.filter((p) => p != null && p.status === 'pending').length;
  const acceptedCount = proposals.filter((p) => p != null && p.status === 'accepted').length;
  const rejectedCount = proposals.filter((p) => p != null && p.status === 'rejected').length;

  const filteredProposals = proposals.filter(
    (p) =>
      p != null && (
        p.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.proposalNumber?.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const handleAccept = async (proposal: ProposalResponse) => {
    const targetId = proposal.companyId || proposal.id;
    setActionLoadingId(targetId);
    try {
      await proposalService.acceptProposal(targetId);
      setProposals((prev) =>
        prev.map((p) => (p.companyId === targetId || p.id === targetId ? { ...p, status: 'accepted' } : p))
      );
      setTimeout(fetchProposals, 1000);
    } catch (err: any) {
      console.error('Accept failed:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (proposal: ProposalResponse) => {
    const targetId = proposal.companyId || proposal.id;
    setActionLoadingId(targetId);
    try {
      await proposalService.rejectProposal(targetId);
      setProposals((prev) =>
        prev.map((p) => (p.companyId === targetId || p.id === targetId ? { ...p, status: 'rejected' } : p))
      );
      setTimeout(fetchProposals, 1000);
    } catch (err: any) {
      console.error('Reject failed:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDraftSaved = (saved: ProposalResponse, company: ProposalCompany | undefined) => {
    const normalized: ProposalResponse = {
      ...saved,
      status: saved.status ?? 'pending',
      clauses: saved.clauses ?? [],
    };
    setProposals((prev) => [normalized, ...prev.filter((p) => p != null)]);
    setActiveProposal(normalized);
    setActiveCompany(company);
    setViewMode('detail');
  };

  const handleSentAndDone = (companyName: string) => {
    setViewMode('list');
    setActiveProposal(null);
    setActiveCompany(undefined);
    setSentToastCompany(companyName);
    setTimeout(fetchProposals, 1000);
  };

  const handleProposalSent = () => {
    setViewMode('list');
    setActiveProposal(null);
    setActiveCompany(undefined);
    setTimeout(fetchProposals, 1000);
  };

  if (viewMode === 'create') {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm">
        <CreateProposalView
          onBack={() => setViewMode('list')}
          onDraftSaved={handleDraftSaved}
          onSentAndDone={handleSentAndDone}
        />
      </div>
    );
  }

  if (viewMode === 'detail' && activeProposal) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm">
        <ProposalDetailView
          proposal={activeProposal}
          company={activeCompany}
          onBack={() => {
            setViewMode('list');
            setActiveProposal(null);
            setActiveCompany(undefined);
          }}
          onSent={handleProposalSent}
        />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 relative">
      {sentToastCompany !== null && (
        <EmailSentToast
          company={sentToastCompany}
          onClose={() => setSentToastCompany(null)}
        />
      )}

      {/* Render the Update Clauses modal dynamically on top of the list view */}
      {updateClausesFor && (
        <UpdateClausesSheet
          proposal={updateClausesFor}
          onClose={() => {
            setUpdateClausesFor(null);
            fetchProposals(); 
          }}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-800" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
            Proposals
          </h1>
          <p className="text-slate-400 text-xs">{proposals.length} total proposals</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchProposals}
            className="w-9 h-9 flex items-center justify-center bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={15} className={`text-slate-500 ${loadingProposals ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setViewMode('create')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Plus size={15} /> New
          </button>
        </div>
      </div>

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

      {loadingProposals && (
        <div className="flex items-center justify-center gap-2 py-8 text-slate-400">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Loading proposals…</span>
        </div>
      )}

      {!loadingProposals && proposalsError && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-2xl p-4">
          <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-700">Failed to load proposals</p>
            <p className="text-xs text-red-500 mt-0.5">{proposalsError}</p>
          </div>
        </div>
      )}

      {!loadingProposals && !proposalsError && (
        <div className="space-y-3">
          {filteredProposals.map((proposal) => {
            const status = proposal.status ?? 'pending';
            const isActioning = actionLoadingId === (proposal.companyId || proposal.id);
            return (
              <div
                key={proposal.id}
                className={`bg-white rounded-2xl border p-4 shadow-sm transition-all ${
                  status === 'accepted'
                    ? 'border-green-200 hover:border-green-300'
                    : status === 'rejected'
                    ? 'border-red-200 hover:border-red-300'
                    : 'border-slate-100 hover:border-blue-100 hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <Building2 size={16} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-slate-800 text-sm font-semibold leading-tight">
                        {proposal.companyName}
                      </p>
                      <StatusBadge status={status} />
                    </div>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {proposal.proposalNumber ?? `#${proposal.id}`}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl px-3 py-2.5 mb-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">Created</p>
                    <p className="text-xs text-slate-700 font-medium">
                      {proposal.createdAt
                        ? new Date(proposal.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: '2-digit',
                          })
                        : '—'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setUpdateClausesFor(proposal)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                  >
                    <Pencil size={13} /> Update Clauses
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(proposal)}
                    disabled={status !== 'pending' || isActioning}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      status === 'accepted'
                        ? 'bg-green-500 border-green-500 text-white cursor-default shadow-sm'
                        : status !== 'pending'
                        ? 'bg-slate-50 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed'
                        : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 active:scale-95'
                    }`}
                  >
                    {isActioning && status === 'pending' ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <ThumbsUp size={13} />
                    )}
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(proposal)}
                    disabled={status !== 'pending' || isActioning}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      status === 'rejected'
                        ? 'bg-red-500 border-red-500 text-white cursor-default shadow-sm'
                        : status !== 'pending'
                        ? 'bg-slate-50 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed'
                        : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100 active:scale-95'
                    }`}
                  >
                    {isActioning && status === 'pending' ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <ThumbsDown size={13} />
                    )}
                    Reject
                  </button>
                </div>
              </div>
            );
          })}

          {filteredProposals.length === 0 && searchQuery && (
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

          {filteredProposals.length === 0 && !searchQuery && (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center shadow-sm">
              <ClipboardList size={32} className="text-slate-200 mx-auto mb-2" />
              <p className="text-slate-400 text-sm font-medium">No proposals yet</p>
              <p className="text-slate-300 text-xs mt-1">
                Tap <span className="font-semibold">+ New</span> to create your first proposal
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}