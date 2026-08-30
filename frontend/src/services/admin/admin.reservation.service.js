import api from "../api";

export async function getAdminReservations() {
    const res = await api.get("/admin/reservations");
    return res.data;
}

export async function getAdminReservationById(id) {
    const res = await api.get(`/admin/reservations/${id}`);
    return res.data;
}

// ── Stall reservation REQUESTS ────────────────────────────────────────────

export async function getAdminStallRequests() {
    const res = await api.get("/admin/reservations/stall-requests");
    return res.data;
}

export async function updateStallRequestStatus(id, status) {
    const res = await api.put(`/admin/reservations/stall-requests/${id}/status?status=${status}`);
    return res.data;
}
