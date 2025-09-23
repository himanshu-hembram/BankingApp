import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

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
  if (user) localStorage.setItem('user_info', JSON.stringify(user));
  else localStorage.removeItem('user_info');
}

export function getUserInfo() {
  const v = localStorage.getItem('user_info');
  return v ? JSON.parse(v) : null;
}

export default api;
