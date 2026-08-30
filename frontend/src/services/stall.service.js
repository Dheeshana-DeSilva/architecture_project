import api from "./api";

const getAllStalls = () => {
  return api.get("/stalls");
};

const reserveStalls = (stallIds) => {
  return api.post("/vendor-publishers/reservations", { stallIds });
};

const getReservationCount = () => {
  return api.get("/vendor-publishers/reservations/count");
};

const getMyReservations = () => {
  return api.get("/vendor-publishers/reservations/my");
};

const cancelReservation = (stallId) => {
  return api.delete(`/vendor-publishers/reservations/${stallId}`);
};

// Stall Reservation Request (new vendor request form)
const submitStallRequest = (data) => {
  return api.post("/vendor-publishers/stall-requests", data);
};

const getMyStallRequests = () => {
  return api.get("/vendor-publishers/stall-requests/my");
};

const StallService = {
  getAllStalls,
  reserveStalls,
  getReservationCount,
  getMyReservations,
  cancelReservation,
  submitStallRequest,
  getMyStallRequests,
};

export default StallService;