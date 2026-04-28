/*import { useNavigate } from "react-router";
import {
  Building2, FileText, FileSignature, Receipt,
  TrendingUp, Clock, CheckCircle2, AlertCircle,
  ArrowRight, Plus, BarChart3, Activity
} from "lucide-react";
import { useStore } from "../data/store";

const statusColor: Record<string, string> = {
  // Company
  Active: "bg-green-100 text-green-700",
  Inactive: "bg-gray-100 text-gray-600",
  Pending: "bg-yellow-100 text-yellow-700",
  // Quotation
  Draft: "bg-gray-100 text-gray-600",
  Sent: "bg-blue-100 text-blue-700",
  Accepted: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-600",
  Expired: "bg-orange-100 text-orange-600",
  // Agreement
  "Under Review": "bg-purple-100 text-purple-700",
  Signed: "bg-green-100 text-green-700",
  Terminated: "bg-red-100 text-red-600",
  // Invoice
  Paid: "bg-green-100 text-green-700",
  Overdue: "bg-red-100 text-red-600",
  Cancelled: "bg-gray-100 text-gray-600",
};

function StatCard({ title, value, subtitle, icon: Icon, color, onClick }: {
  title: string; value: number | string; subtitle: string;
  icon: any; color: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left w-full"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={22} className="text-white" />
        </div>
        <ArrowRight size={16} className="text-gray-300 mt-1" />
      </div>
      <p className="text-gray-500 text-sm mb-1">{title}</p>
      <p className="text-gray-900 mb-1" style={{ fontSize: "28px", fontWeight: 700, lineHeight: "1" }}>{value}</p>
      <p className="text-gray-400" style={{ fontSize: "12px" }}>{subtitle}</p>
    </button>
  );
}

function PipelineCard({ stage, count, amount, items, color, bgColor, icon: Icon, onClick }: {
  stage: string; count: number; amount?: string; items: any[];
  color: string; bgColor: string; icon: any; onClick: () => void;
}) {
  return (
    <div className={`rounded-xl border-2 ${bgColor} p-4 flex flex-col gap-3 min-h-[280px]`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
            <Icon size={16} className="text-white" />
          </div>
          <div>
            <p className="text-gray-800 text-sm" style={{ fontWeight: 600 }}>{stage}</p>
            <p className="text-gray-500" style={{ fontSize: "12px" }}>{count} records</p>
          </div>
        </div>
        {amount && <p className="text-gray-700 text-sm" style={{ fontWeight: 600 }}>{amount}</p>}
      </div>
      <div className="flex flex-col gap-2 flex-1">
        {items.slice(0, 4).map((item, i) => (
          <button
            key={i}
            onClick={onClick}
            className="bg-white rounded-lg px-3 py-2 text-left hover:shadow-sm transition-all border border-gray-100"
          >
            <p className="text-gray-800 text-xs truncate" style={{ fontWeight: 500 }}>{item.name}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-gray-400" style={{ fontSize: "11px" }}>{item.date}</p>
              <span className={`px-2 py-0.5 rounded-full text-xs ${statusColor[item.status] || "bg-gray-100 text-gray-600"}`}>
                {item.status}
              </span>
            </div>
          </button>
        ))}
        {count === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-400 text-xs">No records yet</p>
          </div>
        )}
      </div>
      <button
        onClick={onClick}
        className="text-center text-xs text-blue-600 hover:text-blue-700 py-1"
        style={{ fontWeight: 500 }}
      >
        View all →
      </button>
    </div>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const { companies, quotations, agreements, invoices } = useStore();

  const totalRevenue = invoices
    .filter((i) => i.status === "Paid")
    .reduce((sum, i) => sum + i.total, 0);

  const pendingAmount = invoices
    .filter((i) => i.status === "Sent" || i.status === "Overdue")
    .reduce((sum, i) => sum + i.total, 0);

  const formatINR = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  const recentActivities = [
    ...quotations.map(q => ({ type: "Quotation", name: q.quotationNumber, company: q.companyName, status: q.status, date: q.createdAt })),
    ...agreements.map(a => ({ type: "Agreement", name: a.agreementNumber, company: a.companyName, status: a.status, date: a.createdAt })),
    ...invoices.map(i => ({ type: "Invoice", name: i.invoiceNumber, company: i.companyName, status: i.status, date: i.createdAt })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

  const activityTypeColors: Record<string, string> = {
    Quotation: "bg-blue-100 text-blue-700",
    Agreement: "bg-purple-100 text-purple-700",
    Invoice: "bg-green-100 text-green-700",
  };

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0f2147] to-[#1a4080] rounded-2xl p-6 text-white flex items-center justify-between">
        <div>
          <h2 className="text-white mb-1" style={{ fontSize: "20px", fontWeight: 700 }}>Welcome back, Admin! 👋</h2>
          <p className="text-blue-200 text-sm">Here's what's happening with your agreements today.</p>
          <div className="flex items-center gap-4 mt-4">
            <div>
              <p className="text-blue-300 text-xs">Total Revenue</p>
              <p className="text-white" style={{ fontSize: "20px", fontWeight: 700 }}>{formatINR(totalRevenue)}</p>
            </div>
            <div className="w-px h-10 bg-blue-700"></div>
            <div>
              <p className="text-blue-300 text-xs">Pending Amount</p>
              <p className="text-yellow-300" style={{ fontSize: "20px", fontWeight: 700 }}>{formatINR(pendingAmount)}</p>
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => navigate("/companies/new")}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm transition-colors border border-white/20"
            style={{ fontWeight: 500 }}
          >
            <Plus size={16} />
            New Company
          </button>
          <button
            onClick={() => navigate("/quotations/new")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-400 hover:bg-blue-300 text-white rounded-lg text-sm transition-colors"
            style={{ fontWeight: 500 }}
          >
            <Plus size={16} />
            New Quotation
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Registered Companies"
          value={companies.length}
          subtitle={`${companies.filter(c => c.status === "Active").length} active`}
          icon={Building2}
          color="bg-blue-600"
          onClick={() => navigate("/companies")}
        />
        <StatCard
          title="Quotations"
          value={quotations.length}
          subtitle={`${quotations.filter(q => q.status === "Accepted").length} accepted`}
          icon={FileText}
          color="bg-indigo-500"
          onClick={() => navigate("/quotations")}
        />
        <StatCard
          title="Agreements"
          value={agreements.length}
          subtitle={`${agreements.filter(a => a.status === "Signed").length} signed`}
          icon={FileSignature}
          color="bg-purple-600"
          onClick={() => navigate("/agreements")}
        />
        <StatCard
          title="Invoices"
          value={invoices.length}
          subtitle={`${invoices.filter(i => i.status === "Paid").length} paid`}
          icon={Receipt}
          color="bg-green-600"
          onClick={() => navigate("/invoices")}
        />
      </div>

      {/* Pipeline View */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-gray-600" />
            <h3 className="text-gray-800" style={{ fontWeight: 600 }}>Pipeline Overview</h3>
          </div>
          <p className="text-gray-400 text-sm">Company → Quotation → Agreement → Invoice</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <PipelineCard
            stage="Companies"
            count={companies.length}
            icon={Building2}
            color="bg-blue-600"
            bgColor="border-blue-200 bg-blue-50/50"
            items={companies.map(c => ({ name: c.name, date: c.createdAt, status: c.status }))}
            onClick={() => navigate("/companies")}
          />
          <PipelineCard
            stage="Quotations"
            count={quotations.length}
            amount={formatINR(quotations.reduce((s, q) => s + q.total, 0))}
            icon={FileText}
            color="bg-indigo-500"
            bgColor="border-indigo-200 bg-indigo-50/50"
            items={quotations.map(q => ({ name: q.quotationNumber, date: q.date, status: q.status }))}
            onClick={() => navigate("/quotations")}
          />
          <PipelineCard
            stage="Agreements"
            count={agreements.length}
            icon={FileSignature}
            color="bg-purple-600"
            bgColor="border-purple-200 bg-purple-50/50"
            items={agreements.map(a => ({ name: a.agreementNumber, date: a.date, status: a.status }))}
            onClick={() => navigate("/agreements")}
          />
          <PipelineCard
            stage="Invoices"
            count={invoices.length}
            amount={formatINR(invoices.reduce((s, i) => s + i.total, 0))}
            icon={Receipt}
            color="bg-green-600"
            bgColor="border-green-200 bg-green-50/50"
            items={invoices.map(i => ({ name: i.invoiceNumber, date: i.date, status: i.status }))}
            onClick={() => navigate("/invoices")}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock size={17} className="text-gray-500" />
              <h3 className="text-gray-800" style={{ fontWeight: 600 }}>Recent Activity</h3>
            </div>
          </div>
          <div className="space-y-3">
            {recentActivities.map((act, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${activityTypeColors[act.type]}`} style={{ fontWeight: 500 }}>
                    {act.type}
                  </span>
                  <div>
                    <p className="text-gray-800 text-sm" style={{ fontWeight: 500 }}>{act.name}</p>
                    <p className="text-gray-400" style={{ fontSize: "12px" }}>{act.company}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${statusColor[act.status] || "bg-gray-100 text-gray-600"}`}>
                    {act.status}
                  </span>
                  <p className="text-gray-400 mt-1" style={{ fontSize: "11px" }}>{act.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={17} className="text-gray-500" />
            <h3 className="text-gray-800" style={{ fontWeight: 600 }}>Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Register Company", icon: Building2, color: "text-blue-600 bg-blue-50 hover:bg-blue-100", path: "/companies/new" },
              { label: "Create Quotation", icon: FileText, color: "text-indigo-600 bg-indigo-50 hover:bg-indigo-100", path: "/quotations/new" },
              { label: "New Agreement", icon: FileSignature, color: "text-purple-600 bg-purple-50 hover:bg-purple-100", path: "/agreements/new" },
              { label: "Generate Invoice", icon: Receipt, color: "text-green-600 bg-green-50 hover:bg-green-100", path: "/invoices/new" },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors ${action.color}`}
                >
                  <Icon size={24} />
                  <span className="text-sm text-center" style={{ fontWeight: 500 }}>{action.label}</span>
                </button>
              );
            })}
          </div>

          {/* Status Summary */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-gray-600 text-sm mb-3" style={{ fontWeight: 500 }}>Status Summary</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-green-500" />
                  <span className="text-gray-600">Completed Agreements</span>
                </div>
                <span className="text-gray-800" style={{ fontWeight: 600 }}>{agreements.filter(a => a.status === "Signed").length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-yellow-500" />
                  <span className="text-gray-600">Pending Quotations</span>
                </div>
                <span className="text-gray-800" style={{ fontWeight: 600 }}>{quotations.filter(q => q.status === "Sent" || q.status === "Draft").length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <AlertCircle size={14} className="text-red-500" />
                  <span className="text-gray-600">Overdue Invoices</span>
                </div>
                <span className="text-gray-800" style={{ fontWeight: 600 }}>{invoices.filter(i => i.status === "Overdue").length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <BarChart3 size={14} className="text-blue-500" />
                  <span className="text-gray-600">Active Companies</span>
                </div>
                <span className="text-gray-800" style={{ fontWeight: 600 }}>{companies.filter(c => c.status === "Active").length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
*/