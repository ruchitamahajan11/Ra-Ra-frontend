import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Plus, Search, FileText, Eye, Download, Send, ChevronDown, Loader2, Trash2, AlertCircle } from 'lucide-react';
import { useStore } from '../../data/store';
import { quotationService, QuotationResponse, CompanyOption } from '../../../services/quotationService';

const formatINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

function QuotationRow({ q, onView, onDelete }: { q: QuotationResponse; onView: () => void; onDelete: () => void }) {
  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
      <td className="px-4 py-3">
        <p className="text-gray-800 text-sm" style={{ fontWeight: 600 }}>{q.quotationNumber}</p>
        <p className="text-gray-400 text-xs mt-0.5">{new Date(q.createdAt).toLocaleDateString('en-IN')}</p>
      </td>
      <td className="px-4 py-3">
        <p className="text-gray-700 text-sm" style={{ fontWeight: 500 }}>{q.companyName}</p>
        <p className="text-gray-400 text-xs mt-0.5">{q.items.length} item{q.items.length !== 1 ? 's' : ''}</p>
      </td>
      <td className="px-4 py-3">
        <p className="text-gray-700 text-sm" style={{ fontWeight: 600 }}>{formatINR(q.totalAmount)}</p>
        <p className="text-gray-400 text-xs">
          Sub: {formatINR(q.subtotal)}
          {q.discountPercent > 0 && ` · Disc: ${q.discountPercent}%`}
          {` · GST: ${q.taxPercent}%`}
        </p>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button onClick={onView} className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors" title="View">
            <Eye size={15} />
          </button>
          <button onClick={() => window.print()} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors" title="Download">
            <Download size={15} />
          </button>
          <button className="p-1.5 rounded hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors" title="Send Mail">
            <Send size={15} />
          </button>
          <button onClick={onDelete} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}

export function QuotationList() {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const { quotations, setQuotations } = useStore();

  const [companies, setCompanies]             = useState<CompanyOption[]>([]);
  const [search, setSearch]                   = useState('');
  const [selectedCompany, setSelectedCompany] = useState(searchParams.get('company') || '');
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      console.log('[QuotationList] 🔍 Fetching quotations and registered companies...');
      try {
        const [quotationsData, companiesData] = await Promise.all([
          quotationService.getAll(),
          quotationService.getRegisteredCompanies(),
        ]);
        console.log('[QuotationList] ✅ Quotations:', quotationsData);
        console.log('[QuotationList] ✅ Registered companies for filter:', companiesData);
        setQuotations(quotationsData);
        setCompanies(companiesData);
      } catch (err: any) {
        console.error('[QuotationList] ❌ Fetch error:', err);
        console.error('[QuotationList] ❌ HTTP status:', err?.response?.status);
        console.error('[QuotationList] ❌ Response body:', err?.response?.data);
        setError(err?.message || 'Failed to load data.');
      } finally {
        setLoading(false);
        console.log('[QuotationList] 🏁 Fetch complete');
      }
    };
    fetchAll();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this quotation?')) return;
    console.log(`[QuotationList] 🗑️ Deleting quotation id=${id}`);
    try {
      await quotationService.delete(id);
      console.log(`[QuotationList] ✅ Deleted quotation ${id}`);
      setQuotations(quotations.filter(q => q.id !== id));
    } catch (err: any) {
      console.error(`[QuotationList] ❌ Delete failed:`, err);
      alert(err?.message || 'Failed to delete.');
    }
  };

  const filtered = quotations.filter(q => {
    const matchSearch =
      q.quotationNumber.toLowerCase().includes(search.toLowerCase()) ||
      q.companyName.toLowerCase().includes(search.toLowerCase());
    const matchCompany = !selectedCompany || String(q.companyId) === String(selectedCompany);
    return matchSearch && matchCompany;
  });

  const totalValue = quotations.reduce((s, q) => s + q.totalAmount, 0);

  return (
    <div className="p-6 space-y-5">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-gray-800" style={{ fontWeight: 700, fontSize: '20px' }}>Quotations</h2>
          <p className="text-gray-500 text-sm">{quotations.length} total quotations</p>
        </div>
        <button
          onClick={() => navigate('/quotations/new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors shadow-sm"
          style={{ fontWeight: 600 }}
        >
          <Plus size={16} /> New Quotation
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0" /> {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Total Quotations', value: String(quotations.length), color: 'text-gray-800' },
          { label: 'Total Value',      value: formatINR(totalValue),     color: 'text-blue-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-gray-500 text-xs mb-1">{s.label}</p>
            <p className={s.color} style={{ fontWeight: 700, fontSize: '18px' }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by quotation no. or company..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <select
              value={selectedCompany}
              onChange={e => setSelectedCompany(e.target.value)}
              className="pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
            >
              <option value="">All Companies</option>
              {companies.map(c => (
                <option key={c.id} value={String(c.id)}>{c.companyName}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/80 border-b border-gray-100">
              <tr>
                {['Quotation No.', 'Company', 'Amount', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-gray-500" style={{ fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center">
                    <Loader2 size={24} className="animate-spin text-blue-400 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Loading quotations...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center">
                    <FileText size={36} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">No quotations found</p>
                    <button
                      onClick={() => navigate('/quotations/new')}
                      className="mt-3 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                    >
                      Create First Quotation
                    </button>
                  </td>
                </tr>
              ) : (
                filtered.map(q => (
                  <QuotationRow
                    key={q.id}
                    q={q}
                    onView={() => navigate(`/quotations/${q.id}`)}
                    onDelete={() => handleDelete(q.id)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-50 bg-gray-50/30">
            <p className="text-xs text-gray-400">Showing {filtered.length} of {quotations.length} quotations</p>
          </div>
        )}
      </div>
    </div>
  );
}