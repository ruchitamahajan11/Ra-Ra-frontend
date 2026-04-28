// CompanyList.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Plus, Search, Building2, Phone, Mail, MapPin,
  User, Eye, FileText, MoreHorizontal, Loader2
} from "lucide-react";
import { useStore } from "../../data/store";
import { getAllCompanies } from "../../../services/companyService";
import api from '../../../services/api';

const statusColors: Record<string, string> = {
  REGISTERED:       "bg-green-100 text-green-700 border-green-200",
  AGREEMENT_SENT:   "bg-blue-100 text-blue-700 border-blue-200",
  AGREEMENT_SIGNED: "bg-purple-100 text-purple-700 border-purple-200",
};

export function CompanyList() {
  const navigate = useNavigate();

  // ✅ Zustand selectors — each component gets the SAME global state
  const companies     = useStore((state) => state.companies);
  const setAllCompanies = useStore((state) => state.setAllCompanies);
  const quotations    = useStore((state) => state.quotations);
  const agreements    = useStore((state) => state.agreements);
  const invoices      = useStore((state) => state.invoices);

  const [search,     setSearch]     = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | number | null>(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  // ✅ Fetch from backend on mount — this is the single source of truth
  useEffect(() => {
  const checkAndFetch = async () => {
    // ── Connection Test ──────────────────────────────
    console.log("🔌 Testing backend connection...");
    try {
      const ping = await api.get("/api/companies");
      console.log("✅ CONNECTED to backend! Response:", ping.data);
    } catch (err: any) {
      console.error("❌ NOT CONNECTED to backend!", err.message);
      setError("❌ Cannot reach backend at http://localhost:8080. Is Spring Boot running?");
      setLoading(false);
      return; // stop here, no point fetching
    }

    // ── Fetch Companies ──────────────────────────────
    setLoading(true);
    try {
      console.log("📋 Fetching companies from backend...");
      const response = await getAllCompanies();
      console.log("✅ Companies fetched:", response.data);
      if (response.success) {
        setAllCompanies(response.data);
      }
    } catch (err: any) {
      console.error("❌ Failed to fetch companies:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  checkAndFetch();
}, [setAllCompanies]);

  const filtered = companies.filter((c) => {
    const term = search.toLowerCase();
    return (
      c.companyName?.toLowerCase().includes(term) ||
      c.contactPersonName?.toLowerCase().includes(term) ||
      c.city?.toLowerCase().includes(term)
    );
  });

  const getStats = (id?: string | number) => ({
    quotations: quotations.filter((q) => q.companyId === id).length,
    agreements: agreements.filter((a) => a.companyId === id).length,
    invoices:   invoices.filter((i)   => i.companyId === id).length,
  });

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-gray-800 font-bold text-xl">Registered Companies</h2>
          <p className="text-gray-500 text-sm">{companies.length} active records</p>
        </div>
        <button
          onClick={() => navigate("/companies/new")}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg shadow-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} /> Register New Company
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          ❌ {error}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by company, contact, or city..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Loading companies...</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Building2 size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No companies found. Register your first company!</p>
        </div>
      )}

      {/* Company Cards */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((company) => {
            const stats = getStats(company.id);
            return (
              <div key={company.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-sm">{company.companyName}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[company.status] || "bg-gray-100 text-gray-600"}`}>
                          {company.status}
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === company.id ? null : (company.id ?? null))}
                        className="text-gray-400 hover:text-gray-600 p-1"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                      {openMenuId === company.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-lg z-10 py-1">
                          <button
                            onClick={() => navigate(`/companies/${company.id}`)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
                          >
                            <Eye size={14} /> View Details
                          </button>
                          <button
                            onClick={() => navigate(`/quotations/new?company=${company.id}`)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
                          >
                            <FileText size={14} /> Quotations
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-gray-500">
                    <div className="flex items-center gap-2"><User size={12} /> {company.contactPersonName}</div>
                    <div className="flex items-center gap-2"><Phone size={12} /> {company.phone}</div>
                    <div className="flex items-center gap-2"><Mail size={12} /> {company.email}</div>
                    <div className="flex items-center gap-2"><MapPin size={12} /> {company.city}, {company.state}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 border-t border-gray-50 bg-gray-50/30 text-center py-2">
                  <div><p className="font-bold text-sm">{stats.quotations}</p><p className="text-[10px] text-gray-400">Quotes</p></div>
                  <div><p className="font-bold text-sm">{stats.agreements}</p><p className="text-[10px] text-gray-400">Agreements</p></div>
                  <div><p className="font-bold text-sm">{stats.invoices}</p><p className="text-[10px] text-gray-400">Invoices</p></div>
                </div>

                <div className="p-3 bg-white flex gap-2">
                  <button
                    onClick={() => navigate(`/companies/${company.id}`)}
                    className="flex-1 py-1.5 text-xs border border-blue-200 text-blue-600 rounded-md hover:bg-blue-50 font-medium transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => navigate(`/quotations/new?company=${company.id}`)}
                    className="flex-1 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors"
                  >
                    Send Quotation
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}