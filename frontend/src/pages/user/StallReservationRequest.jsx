import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../../services/auth.service";
import StallService from "../../services/stall.service";
import UserService from "../../services/user.service";
import {
  BuildingStorefrontIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

// ── Predefined option lists ────────────────────────────────────────────
const EVENTS = [
  "Colombo International Book Fair 2026",
  "Sri Lanka Tech Expo 2026",
  "Colombo Trade Fair 2026",
  "National Craft & Culture Fest 2026",
  "Asia Pacific Food & Beverage Expo 2026",
];

const STALL_TYPES = ["Standard", "Premium", "Corner Stall"];
const STALL_SIZES = ["Small", "Medium", "Large"];
const BUSINESS_CATEGORIES = [
  "Food & Beverage",
  "Clothing",
  "Electronics",
  "Handicrafts",
  "Services",
];

// ── Helper: today's date in YYYY-MM-DD for min attribute ──────────────
const todayStr = () => new Date().toISOString().split("T")[0];

// ── Field wrapper ─────────────────────────────────────────────────────
const Field = ({ label, required, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder:text-slate-400";

const selectCls =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition appearance-none cursor-pointer";

// ── Page component ────────────────────────────────────────────────────
const StallReservationRequest = () => {
  const navigate = useNavigate();
  const authUser = AuthService.getCurrentUser();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { success, message }

  const [form, setForm] = useState({
    username: authUser?.email || "",
    eventName: "",
    reservationDate: "",
    stallType: "",
    stallSize: "",
    numberOfStalls: 1,
    businessCategory: "",
    specialRequirements: "",
  });

  // Fetch profile to pre-populate username display
  useEffect(() => {
    if (!authUser) { navigate("/login"); return; }
    UserService.getProfile()
      .then((res) => {
        setProfile(res.data);
        setForm((f) => ({ ...f, username: res.data.username || res.data.email || authUser.email }));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    try {
      await StallService.submitStallRequest({
        ...form,
        numberOfStalls: Number(form.numberOfStalls),
      });
      setResult({ success: true, message: "Your stall reservation request was submitted successfully! We will review it and get back to you." });
      // Reset non-identity fields
      setForm((f) => ({
        ...f,
        eventName: "",
        reservationDate: "",
        stallType: "",
        stallSize: "",
        numberOfStalls: 1,
        businessCategory: "",
        specialRequirements: "",
      }));
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Failed to submit request. Please try again.";
      setResult({ success: false, message: typeof msg === "string" ? msg : "Submission failed." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/40 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">

        {/* Back button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-700 transition"
        >
          <ArrowLeftIcon className="w-4 h-4" /> Back to Dashboard
        </button>

        {/* Card */}
        <div className="rounded-3xl border border-slate-100 bg-white shadow-xl overflow-hidden">

          {/* Header banner */}
          <div className="relative overflow-hidden bg-blue-900 px-8 py-10">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400 via-blue-900 to-black" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-800/60 ring-1 ring-blue-700">
                <BuildingStorefrontIcon className="h-7 w-7 text-blue-100" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Stall Reservation Request
                </h1>
                <p className="mt-1 text-sm text-blue-200">
                  Fill in the details below to request your exhibition stall.
                </p>
              </div>
            </div>
          </div>

          {/* Success / Error banner */}
          {result && (
            <div
              className={`flex items-start gap-3 px-8 py-4 text-sm font-medium ${
                result.success
                  ? "bg-green-50 text-green-700 border-b border-green-100"
                  : "bg-red-50 text-red-700 border-b border-red-100"
              }`}
            >
              {result.success ? (
                <CheckCircleIcon className="h-5 w-5 shrink-0 mt-0.5" />
              ) : (
                <XCircleIcon className="h-5 w-5 shrink-0 mt-0.5" />
              )}
              <span>{result.message}</span>
            </div>
          )}

          {/* Form body */}
          <form onSubmit={handleSubmit} className="px-8 py-10 space-y-8">

            {/* ── Section: Vendor Identity ─────────────────────── */}
            <section>
              <div className="flex items-center gap-2 mb-5 pb-2 border-b border-slate-100">
                <UserCircleIcon className="h-5 w-5 text-blue-600" />
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-600">
                  Vendor Identity
                </h2>
              </div>
              <Field label="Username (auto-filled from your account)" required>
                <input
                  id="req-username"
                  className={`${inputCls} bg-slate-50 text-slate-500 cursor-not-allowed`}
                  value={form.username}
                  readOnly
                  tabIndex={-1}
                />
                <p className="text-xs text-slate-400 mt-1">
                  Sourced from your authenticated account — used to track this request.
                </p>
              </Field>
            </section>

            {/* ── Section: Event Details ───────────────────────── */}
            <section>
              <div className="flex items-center gap-2 mb-5 pb-2 border-b border-slate-100">
                <CalendarDaysIcon className="h-5 w-5 text-blue-600" />
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-600">
                  Event Details
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* i. Event Name */}
                <div className="md:col-span-2">
                  <Field label="Exhibition / Event Name" required>
                    <select
                      id="req-eventName"
                      name="eventName"
                      required
                      value={form.eventName}
                      onChange={handleChange}
                      className={selectCls}
                    >
                      <option value="">Select an event…</option>
                      {EVENTS.map((e) => (
                        <option key={e} value={e}>{e}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                {/* ii. Reservation Date */}
                <Field label="Reservation Date" required>
                  <input
                    id="req-reservationDate"
                    type="date"
                    name="reservationDate"
                    required
                    min={todayStr()}
                    value={form.reservationDate}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </Field>

                {/* vi. Number of Stalls */}
                <Field label="Number of Stalls Required" required>
                  <input
                    id="req-numberOfStalls"
                    type="number"
                    name="numberOfStalls"
                    required
                    min={1}
                    max={50}
                    value={form.numberOfStalls}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </Field>
              </div>
            </section>

            {/* ── Section: Stall Preferences ──────────────────── */}
            <section>
              <div className="flex items-center gap-2 mb-5 pb-2 border-b border-slate-100">
                <BuildingStorefrontIcon className="h-5 w-5 text-blue-600" />
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-600">
                  Stall Preferences
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* iii. Stall Type */}
                <Field label="Stall Type" required>
                  <select
                    id="req-stallType"
                    name="stallType"
                    required
                    value={form.stallType}
                    onChange={handleChange}
                    className={selectCls}
                  >
                    <option value="">Select type…</option>
                    {STALL_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </Field>

                {/* iv. Stall Size */}
                <Field label="Preferred Stall Size" required>
                  <select
                    id="req-stallSize"
                    name="stallSize"
                    required
                    value={form.stallSize}
                    onChange={handleChange}
                    className={selectCls}
                  >
                    <option value="">Select size…</option>
                    {STALL_SIZES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </Field>

                {/* vii. Business Category */}
                <Field label="Business Category" required>
                  <select
                    id="req-businessCategory"
                    name="businessCategory"
                    required
                    value={form.businessCategory}
                    onChange={handleChange}
                    className={selectCls}
                  >
                    <option value="">Select category…</option>
                    {BUSINESS_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </section>

            {/* ── Section: Additional Info ─────────────────────── */}
            <section>
              <div className="flex items-center gap-2 mb-5 pb-2 border-b border-slate-100">
                <ClipboardDocumentListIcon className="h-5 w-5 text-blue-600" />
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-600">
                  Additional Information
                </h2>
              </div>
              <Field label="Special Requirements or Comments">
                <textarea
                  id="req-specialRequirements"
                  name="specialRequirements"
                  rows={4}
                  placeholder="Describe any special needs — power outlets, accessibility, specific location preferences, etc."
                  value={form.specialRequirements}
                  onChange={handleChange}
                  className={`${inputCls} resize-none`}
                />
              </Field>
            </section>

            {/* ── Actions ──────────────────────────────────────── */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="px-6 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-2.5 rounded-xl bg-blue-700 text-white font-bold text-sm hover:bg-blue-800 transition shadow-md shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Submitting…
                  </>
                ) : (
                  "Submit Request"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StallReservationRequest;
