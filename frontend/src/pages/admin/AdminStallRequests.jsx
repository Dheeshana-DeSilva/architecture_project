import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAdminStallRequests,
  updateStallRequestStatus,
} from "../../services/admin/admin.reservation.service";
import AdminHeader from "../../components/common/AdminHeader";
import {
  BuildingStorefrontIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  TagIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

// ── Status configuration ─────────────────────────────────────────────────────
const STATUS_CFG = {
  PENDING:  { badge: "bg-amber-50 text-amber-700 border-amber-200",  dot: "bg-amber-400",  label: "Pending"  },
  APPROVED: { badge: "bg-green-50 text-green-700 border-green-200",  dot: "bg-green-500",  label: "Approved" },
  REJECTED: { badge: "bg-red-50   text-red-700   border-red-200",    dot: "bg-red-500",    label: "Rejected" },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CFG[status?.toUpperCase()] ?? STATUS_CFG.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const Detail = ({ label, value }) =>
  value != null ? (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm text-slate-700 font-medium break-words">{value}</p>
    </div>
  ) : null;

// ── Action button for organizer ──────────────────────────────────────────────
const ActionBtn = ({ label, onClick, colorCls, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition disabled:opacity-40 disabled:cursor-not-allowed ${colorCls}`}
  >
    {label}
  </button>
);

// ── Main component ────────────────────────────────────────────────────────────
export default function AdminStallRequests() {
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [selected, setSelected]       = useState(null);
  const [updating, setUpdating]       = useState(false);
  const [updateMsg, setUpdateMsg]     = useState({ type: "", text: "" });
  const [search, setSearch]           = useState("");
  const [filter, setFilter]           = useState("ALL");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const data = await getAdminStallRequests();
      setAllRequests(data);
    } catch {
      setError("Failed to load stall requests. Check your connection or token.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Filtering + search
  const filtered = allRequests
    .filter((r) => filter === "ALL" || r.status?.toUpperCase() === filter)
    .filter((r) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        r.username?.toLowerCase().includes(q) ||
        r.eventName?.toLowerCase().includes(q) ||
        r.businessCategory?.toLowerCase().includes(q) ||
        String(r.id).includes(q)
      );
    });

  const counts = {
    ALL:      allRequests.length,
    PENDING:  allRequests.filter(r => r.status?.toUpperCase() === "PENDING").length,
    APPROVED: allRequests.filter(r => r.status?.toUpperCase() === "APPROVED").length,
    REJECTED: allRequests.filter(r => r.status?.toUpperCase() === "REJECTED").length,
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!selected) return;
    setUpdating(true);
    setUpdateMsg({ type: "", text: "" });
    try {
      const updated = await updateStallRequestStatus(selected.id, newStatus);
      setAllRequests((prev) => prev.map((r) => r.id === updated.id ? updated : r));
      setSelected(updated);
      setUpdateMsg({ type: "success", text: `Request #${updated.id} marked as ${newStatus}.` });
    } catch {
      setUpdateMsg({ type: "error", text: "Failed to update status. Please try again." });
    } finally {
      setUpdating(false);
      setTimeout(() => setUpdateMsg({ type: "", text: "" }), 3000);
    }
  };

  const formatDate     = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
  const formatDateTime = (d) => d ? new Date(d).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "—";

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader />

      {/* Page header bar */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-6 pb-2 flex flex-col sm:flex-row sm:items-center gap-3">
        <Link
          to="/admin/dashboard"
          className="self-start p-2 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 transition text-sm font-medium"
        >
          ← Back
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-black text-slate-900">Vendor Stall Reservation Requests</h1>
          <p className="text-sm text-slate-500 mt-0.5">Review and manage all stall requests submitted by vendors.</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition shadow-sm"
        >
          <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stat pills */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-4 flex flex-wrap gap-3">
        {["ALL", "PENDING", "APPROVED", "REJECTED"].map((s) => (
          <button
            key={s}
            onClick={() => { setFilter(s); setSelected(null); }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition ${
              filter === s
                ? "bg-blue-700 text-white border-blue-700 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-700"
            }`}
          >
            {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()} ({counts[s]})
          </button>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 mt-4">
          <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-medium text-red-700">
            <ExclamationCircleIcon className="w-5 h-5 shrink-0" /> {error}
          </div>
        </div>
      )}

      {/* Main grid */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 grid lg:grid-cols-5 gap-6">

        {/* ── Left: list ───────────────────────────────────────────── */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow overflow-hidden border border-slate-100">

          {/* Search */}
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by vendor, event, category or ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* List body */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-14 text-center">
              <FunnelIcon className="w-8 h-8 text-slate-200 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No requests match your current filter.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 max-h-[70vh] overflow-y-auto">
              {filtered.map((req) => (
                <button
                  key={req.id}
                  onClick={() => { setSelected(req); setUpdateMsg({ type: "", text: "" }); }}
                  className={`w-full text-left px-5 py-4 hover:bg-slate-50 transition ${
                    selected?.id === req.id ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">#{req.id}</span>
                        <StatusBadge status={req.status} />
                      </div>
                      <p className="font-bold text-slate-800 text-sm truncate">{req.eventName}</p>
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                        <UserCircleIcon className="w-3 h-3" />
                        <span className="truncate max-w-[200px]">{req.username}</span>
                        <span className="text-slate-300">·</span>
                        <CalendarDaysIcon className="w-3 h-3" />
                        <span>{formatDate(req.reservationDate)}</span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-bold text-slate-700">{req.numberOfStalls} stall{req.numberOfStalls !== 1 ? "s" : ""}</p>
                      <p className="text-[11px] text-slate-400">{req.stallType}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-600">{req.businessCategory}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-600">{req.stallSize}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: detail + action panel ─────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 bg-white rounded-2xl border border-slate-100 shadow overflow-hidden">
            {!selected ? (
              <div className="py-20 text-center px-6">
                <TagIcon className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-400 font-medium">Select a request to review it and take action.</p>
              </div>
            ) : (
              <>
                {/* Detail header */}
                <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-5">
                  <p className="text-blue-300 text-xs font-bold uppercase tracking-wider mb-1">Request #{selected.id}</p>
                  <h2 className="text-white font-black text-base leading-snug">{selected.eventName}</h2>
                  <div className="mt-2 flex items-center gap-2">
                    <StatusBadge status={selected.status} />
                    <span className="text-blue-300 text-xs">Submitted {formatDateTime(selected.submittedAt)}</span>
                  </div>
                </div>

                {/* Fields */}
                <div className="p-6 grid grid-cols-2 gap-4 border-b border-slate-100">
                  <Detail label="Vendor Username"   value={selected.username} />
                  <Detail label="Reservation Date"  value={formatDate(selected.reservationDate)} />
                  <Detail label="Stall Type"         value={selected.stallType} />
                  <Detail label="Stall Size"         value={selected.stallSize} />
                  <Detail label="Number of Stalls"   value={selected.numberOfStalls} />
                  <Detail label="Business Category"  value={selected.businessCategory} />
                  {selected.specialRequirements && (
                    <div className="col-span-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Special Requirements</p>
                      <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 border border-slate-100 leading-relaxed">
                        {selected.specialRequirements}
                      </p>
                    </div>
                  )}
                </div>

                {/* Organizer actions */}
                <div className="p-5">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">Organizer Actions</p>

                  {/* Feedback message */}
                  {updateMsg.text && (
                    <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium mb-3 ${
                      updateMsg.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                      {updateMsg.type === "success"
                        ? <CheckCircleIcon className="w-4 h-4 shrink-0" />
                        : <XCircleIcon    className="w-4 h-4 shrink-0" />}
                      {updateMsg.text}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <ActionBtn
                      label="✓ Approve"
                      disabled={updating || selected.status?.toUpperCase() === "APPROVED"}
                      colorCls="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                      onClick={() => handleStatusUpdate("APPROVED")}
                    />
                    <ActionBtn
                      label="✕ Reject"
                      disabled={updating || selected.status?.toUpperCase() === "REJECTED"}
                      colorCls="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                      onClick={() => handleStatusUpdate("REJECTED")}
                    />
                    <ActionBtn
                      label="↺ Set Pending"
                      disabled={updating || selected.status?.toUpperCase() === "PENDING"}
                      colorCls="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                      onClick={() => handleStatusUpdate("PENDING")}
                    />
                  </div>
                  {updating && (
                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                      <span className="h-3 w-3 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin inline-block" />
                      Updating…
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
