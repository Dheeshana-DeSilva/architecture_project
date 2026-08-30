import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StallService from "../../services/stall.service";
import AuthService from "../../services/auth.service";
import {
  BuildingStorefrontIcon,
  CalendarDaysIcon,
  ClockIcon,
  PlusIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  TagIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

// ── Status badge config ───────────────────────────────────────────────────────
const STATUS = {
  PENDING:  { color: "bg-amber-50 text-amber-700 border-amber-200",  icon: ClockIcon,          label: "Pending"  },
  APPROVED: { color: "bg-green-50 text-green-700 border-green-200",  icon: CheckCircleIcon,    label: "Approved" },
  REJECTED: { color: "bg-red-50 text-red-700 border-red-200",        icon: XCircleIcon,        label: "Rejected" },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS[status?.toUpperCase()] || STATUS.PENDING;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
};

const Detail = ({ label, value }) =>
  value ? (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm text-slate-700 font-medium">{value}</p>
    </div>
  ) : null;

// ── Main component ────────────────────────────────────────────────────────────
export default function MyStallRequests() {
  const navigate = useNavigate();
  const authUser = AuthService.getCurrentUser();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [filter, setFilter]     = useState("ALL");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!authUser) { navigate("/login"); return; }
    StallService.getMyStallRequests()
      .then((res) => { setRequests(res.data); setLoading(false); })
      .catch(() => { setError("Could not load your requests. Please try again."); setLoading(false); });
  }, []);

  const statuses = ["ALL", "PENDING", "APPROVED", "REJECTED"];
  const filtered = filter === "ALL"
    ? requests
    : requests.filter((r) => r.status?.toUpperCase() === filter);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
  const formatDateTime = (d) => d ? new Date(d).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "—";

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Back + heading */}
        <button onClick={() => navigate("/dashboard")} className="mb-6 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-700 transition">
          <ArrowLeftIcon className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">My Stall Requests</h1>
            <p className="text-slate-500 mt-1">Track all your stall reservation requests and their status.</p>
          </div>
          <button
            onClick={() => navigate("/stall-request")}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-700 text-white rounded-xl font-bold text-sm hover:bg-blue-800 transition shadow-md shadow-blue-200"
          >
            <PlusIcon className="w-4 h-4" /> New Request
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-medium text-red-700">
            <ExclamationCircleIcon className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <FunnelIcon className="w-4 h-4 text-slate-400" />
          {statuses.map((s) => {
            const count = s === "ALL" ? requests.length : requests.filter(r => r.status?.toUpperCase() === s).length;
            return (
              <button
                key={s}
                onClick={() => { setFilter(s); setSelected(null); }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition ${
                  filter === s
                    ? "bg-blue-700 text-white border-blue-700 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-700"
                }`}
              >
                {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()} ({count})
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-16 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <BuildingStorefrontIcon className="w-8 h-8 text-slate-300" />
            </div>
            <h2 className="text-lg font-bold text-slate-700 mb-2">
              {filter === "ALL" ? "No requests yet" : `No ${filter.toLowerCase()} requests`}
            </h2>
            <p className="text-slate-500 mb-6 text-sm max-w-xs mx-auto">
              {filter === "ALL"
                ? "Submit a stall reservation request to get started."
                : `You have no ${filter.toLowerCase()} requests at this time.`}
            </p>
            {filter === "ALL" && (
              <button onClick={() => navigate("/stall-request")} className="px-6 py-2.5 bg-blue-700 text-white rounded-xl font-bold text-sm hover:bg-blue-800 transition">
                Submit a Request
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* List */}
            <div className="lg:col-span-3 space-y-3">
              {filtered.map((req) => (
                <button
                  key={req.id}
                  onClick={() => setSelected(req)}
                  className={`w-full text-left rounded-2xl border p-5 transition shadow-sm hover:shadow-md ${
                    selected?.id === req.id
                      ? "border-blue-400 bg-blue-50/60 ring-1 ring-blue-300"
                      : "border-slate-100 bg-white hover:border-blue-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-50 flex items-center justify-center">
                        <BuildingStorefrontIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate text-sm">{req.eventName}</p>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <CalendarDaysIcon className="w-3 h-3" />
                          {formatDate(req.reservationDate)} · {req.stallType} · {req.stallSize}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-semibold text-slate-600">{req.businessCategory}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-semibold text-slate-600">{req.numberOfStalls} stall{req.numberOfStalls !== 1 ? "s" : ""}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Detail panel */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {!selected ? (
                  <div className="p-10 text-center">
                    <TagIcon className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm text-slate-400 font-medium">Select a request to view its details</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-blue-900 px-6 py-5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">Request #{selected.id}</p>
                          <h3 className="text-white font-black text-base leading-tight">{selected.eventName}</h3>
                        </div>
                        <StatusBadge status={selected.status} />
                      </div>
                    </div>
                    <div className="p-6 grid grid-cols-2 gap-4">
                      <Detail label="Username"         value={selected.username} />
                      <Detail label="Reservation Date" value={formatDate(selected.reservationDate)} />
                      <Detail label="Stall Type"       value={selected.stallType} />
                      <Detail label="Stall Size"       value={selected.stallSize} />
                      <Detail label="No. of Stalls"    value={selected.numberOfStalls} />
                      <Detail label="Business Cat."    value={selected.businessCategory} />
                      {selected.specialRequirements && (
                        <div className="col-span-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Special Requirements</p>
                          <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 border border-slate-100">{selected.specialRequirements}</p>
                        </div>
                      )}
                      <div className="col-span-2 border-t border-slate-100 pt-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Submitted</p>
                        <p className="text-xs text-slate-500">{formatDateTime(selected.submittedAt)}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
