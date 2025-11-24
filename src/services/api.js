// Prayers API client with fallback to localStorage
// Uses environment variable VITE_API_URL as the API base (no trailing slash).
// See project docs for integration details.

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const STORAGE_KEY = 'prayers_data';

// --- Local storage helpers (fallback) ---
function getStoredData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (err) {
    console.warn('Failed to parse localStorage data, resetting.', err);
    localStorage.removeItem(STORAGE_KEY);
    return {};
  }
}

function saveStoredData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to write to localStorage:', err);
  }
}

// --- Network helper ---
async function safeJsonFetch(url, opts = {}) {
  const res = await fetch(url, opts);
  let body = {};
  try {
    body = await res.json();
  } catch (e) {
    // no-op, body stays as {}
  }

  if (!res.ok) {
    const msg = body?.error || res.statusText || 'Request failed';
    const err = new Error(msg);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  return body;
}

// --- API client functions (try network first, fallback to localStorage) ---
export async function savePrayerStatus(dateKey, prayerName, status) {
  // Basic client-side validation
  if (!dateKey || typeof dateKey !== 'string') {
    return { success: false, error: 'Invalid date' };
  }
  if (!prayerName || typeof prayerName !== 'string') {
    return { success: false, error: 'Invalid prayer name' };
  }
  if (![1, 2, 3].includes(status)) {
    return { success: false, error: 'Invalid status' };
  }

  // Try API
  try {
    const payload = { date: dateKey, prayer: prayerName, status };
    const res = await safeJsonFetch(`${API_BASE}/prayers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // Expect { success: true, data: { ... } }
    return res;
  } catch (err) {
    // Fallback to localStorage when network/API unavailable
    console.warn('Remote save failed, falling back to localStorage:', err.message);
    try {
      const data = getStoredData();
      if (!data[dateKey]) data[dateKey] = {};
      data[dateKey][prayerName] = status;
      saveStoredData(data);
      return { success: true, data: data[dateKey] };
    } catch (e) {
      console.error('Fallback save failed:', e);
      return { success: false, error: e.message || String(e) };
    }
  }
}

export async function getPrayerData(dateKey) {
  if (!dateKey || typeof dateKey !== 'string') return {};

  try {
    const res = await safeJsonFetch(`${API_BASE}/prayers/${encodeURIComponent(dateKey)}`);
    // Expect an object (possibly empty)
    return res || {};
  } catch (err) {
    console.warn('Remote getPrayerData failed, using localStorage:', err.message);
    const data = getStoredData();
    return data[dateKey] || {};
  }
}

export async function getPrayerDataForDates(dateKeys) {
  if (!Array.isArray(dateKeys)) return {};

  try {
    const res = await safeJsonFetch(`${API_BASE}/prayers/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dates: dateKeys })
    });

    return res || {};
  } catch (err) {
    console.warn('Remote batch fetch failed, using localStorage:', err.message);
    const data = getStoredData();
    const result = {};
    dateKeys.forEach(k => {
      result[k] = data[k] || {};
    });
    return result;
  }
}

export async function getAllPrayerData() {
  try {
    const res = await safeJsonFetch(`${API_BASE}/prayers`);
    return res || {};
  } catch (err) {
    console.warn('Remote getAllPrayerData failed, using localStorage:', err.message);
    return getStoredData();
  }
}

// Optional: helpful test/delete endpoint wrapper that may be supported by the server
export async function deletePrayerDate(dateKey) {
  if (!dateKey || typeof dateKey !== 'string') return { success: false, error: 'Invalid date' };

  try {
    const res = await safeJsonFetch(`${API_BASE}/prayers/${encodeURIComponent(dateKey)}`, {
      method: 'DELETE'
    });
    return res;
  } catch (err) {
    // Also remove from localStorage if present
    console.warn('Remote delete failed, removing from localStorage if present:', err.message);
    try {
      const data = getStoredData();
      delete data[dateKey];
      saveStoredData(data);
      return { success: true };
    } catch (e) {
      console.error('Fallback delete failed:', e);
      return { success: false, error: e.message || String(e) };
    }
  }
}

