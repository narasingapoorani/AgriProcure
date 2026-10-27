const API_BASE = 'http://127.0.0.1:5000/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = localStorage.getItem('agri_ai_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.message || `Request failed with status ${res.status}`);
      err.status = res.status;
      err.errorCode = data.error_code;
      err.response = data;
      throw err;
    }
    return data;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err);
    throw err;
  }
}

// High-performance client-side cache for instantaneous officer page rendering
let _clientCentresCache = { data: null, time: 0 };
let _clientBookingsCache = { data: null, time: 0 };
let _clientForecastCache = {};

export const invalidateClientOfficerCache = () => {
  _clientCentresCache = { data: null, time: 0 };
  _clientBookingsCache = { data: null, time: 0 };
  _clientForecastCache = {};
};

export const api = {
  // --- Auth & Onboarding ---
  getLanguages: () => request('/auth/languages'),
  sendOtp: (mobile_number) => request('/auth/send-otp', { method: 'POST', body: JSON.stringify({ mobile_number }) }),
  verifyOtp: (mobile_number, otp) => request('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ mobile_number, otp }) }),
  verifyAadhaar: (aadhaar_number) => request('/auth/verify-aadhaar', { method: 'POST', body: JSON.stringify({ aadhaar_number }) }),
  verifyOfficerId: (officer_id) => request('/auth/verify-officer-id', { method: 'POST', body: JSON.stringify({ officer_id }) }),
  registerFarmer: (data) => request('/auth/farmer/register', { method: 'POST', body: JSON.stringify(data) }),
  registerOfficer: (data) => request('/auth/officer/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (username, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),

  // --- Farmer Operations ---
  getCrops: () => request('/farmer/crops'),
  getFarmerDashboard: (farmer_id) => request(`/farmer/dashboard${farmer_id ? `?farmer_id=${farmer_id}` : ''}`),
  getFarmerHistory: (farmer_id) => request(`/farmer/history${farmer_id ? `?farmer_id=${farmer_id}` : ''}`),
  getFarmerTransactions: (farmer_id) => request(`/farmer/transactions${farmer_id ? `?farmer_id=${farmer_id}` : ''}`),
  recommendCentres: (payload) => request('/farmer/recommend-centres', { method: 'POST', body: JSON.stringify(payload) }),
  bookSlot: async (payload) => {
    invalidateClientOfficerCache();
    return request('/farmer/book-slot', { method: 'POST', body: JSON.stringify(payload) });
  },
  getLiveStatus: (tokenOrId) => request(`/farmer/live-status/${tokenOrId}`),
  getTimeline: (tokenOrId) => request(`/farmer/timeline/${tokenOrId}`),

  // --- Centre Gate Scanner ---
  checkIn: async (token_number) => {
    invalidateClientOfficerCache();
    return request('/centre/check-in', { method: 'POST', body: JSON.stringify({ token_number }) });
  },

  // --- Officer Operations & Digital Twin ---
  getOfficerDashboard: (centre_id = 1) => request(`/officer/dashboard?centre_id=${centre_id}`),
  getCentres: async (force = false) => {
    const now = Date.now();
    if (!force && _clientCentresCache.data && (now - _clientCentresCache.time) < 30000) {
      return _clientCentresCache.data;
    }
    const res = await request('/officer/centres');
    if (res && res.status === 'success') {
      _clientCentresCache = { data: res, time: Date.now() };
    }
    return res;
  },
  getCachedCentres: () => _clientCentresCache.data?.centres || null,
  getDemandForecast: async (centre_id = 1, force = false) => {
    const now = Date.now();
    if (!force && _clientForecastCache[centre_id] && (now - _clientForecastCache[centre_id].time) < 30000) {
      return _clientForecastCache[centre_id].data;
    }
    const res = await request('/officer/demand-forecast', { method: 'POST', body: JSON.stringify({ centre_id }) });
    if (res && res.status === 'success') {
      _clientForecastCache[centre_id] = { data: res, time: Date.now() };
    }
    return res;
  },
  simulateDigitalTwin: (centre_id, what_if) => request('/officer/digital-twin/simulate', { method: 'POST', body: JSON.stringify({ centre_id, ...what_if }) }),
  shiftFarmers: async (source_centre_id, shift_count = 5) => {
    invalidateClientOfficerCache();
    return request('/officer/shift-farmers', { method: 'POST', body: JSON.stringify({ source_centre_id, shift_count }) });
  },
  updateStage: async (booking_id, new_stage) => {
    invalidateClientOfficerCache();
    return request('/officer/update-stage', { method: 'POST', body: JSON.stringify({ booking_id, new_stage }) });
  },

  // --- Payments (Razorpay & Government DBT) ---
  createPaymentOrder: (booking_id) => request('/payment/create-order', { method: 'POST', body: JSON.stringify({ booking_id }) }),
  verifyPayment: (payload) => request('/payment/verify', { method: 'POST', body: JSON.stringify(payload) }),
  initiatePayout: (booking_id) => request('/payment/initiate-payout', { method: 'POST', body: JSON.stringify({ booking_id }) }),

  // --- Live Database & Application Records ---
  getAllBookings: async (force = false) => {
    const now = Date.now();
    if (!force && _clientBookingsCache.data && (now - _clientBookingsCache.time) < 15000) {
      return _clientBookingsCache.data;
    }
    const res = await request('/officer/all-bookings');
    if (res && res.status === 'success') {
      _clientBookingsCache = { data: res, time: Date.now() };
    }
    return res;
  },
  getCachedBookings: () => _clientBookingsCache.data?.bookings || null,
  getFarmerNotifications: (farmer_id) => request(`/farmer/notifications${farmer_id ? `?farmer_id=${farmer_id}` : ''}`),
  clearFarmerNotifications: (farmer_id) => request('/farmer/notifications/clear', { method: 'POST', body: JSON.stringify({ farmer_id }) }),
  deleteFarmerNotification: (id) => request(`/farmer/notifications/${id}`, { method: 'DELETE' }),
  getOfficerNotifications: () => request('/officer/notifications'),
  clearOfficerNotifications: () => request('/officer/notifications/clear', { method: 'POST' }),
  deleteOfficerNotification: (id) => request(`/officer/notifications/${id}`, { method: 'DELETE' }),
  getFarmerHistory: (farmer_id) => request(`/farmer/history${farmer_id ? `?farmer_id=${farmer_id}` : ''}`),
  getFarmerTransactions: (farmer_id) => request(`/farmer/transactions${farmer_id ? `?farmer_id=${farmer_id}` : ''}`),

  // --- WhatsApp Alerts & Click-to-Chat ---
  getWhatsAppChatLink: (tokenOrId) => request(`/whatsapp/chat-link/${tokenOrId}`),
};

export default api;
