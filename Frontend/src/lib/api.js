import axios from 'axios';

const API_BASE = 'https://bankingapp-backend-140475459295.us-central1.run.app';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Simple token helpers
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('auth_token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('auth_token');
  }
}

export function getAuthToken() {
  return localStorage.getItem('auth_token');
}

// user info helper
export function setUserInfo(user) {
  if (user === null || user === undefined) {
    localStorage.removeItem('user_info');
  } else if (typeof user === 'object') {
    localStorage.setItem('user_info', JSON.stringify(user));
  } else {
    localStorage.setItem('user_info', String(user));
  }
}

export function getUserInfo() {
  const v = localStorage.getItem('user_info');
  if (!v) return null;
  try {
    return JSON.parse(v);
  } catch {
    return v; // fallback: return as string if not JSON
  }
}

export default api;
