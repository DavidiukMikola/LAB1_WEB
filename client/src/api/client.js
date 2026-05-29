const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';
const TOKEN_KEY = 'qa-board-token';
const USER_KEY = 'qa-board-user';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function getStoredUser() {
  const value = localStorage.getItem(USER_KEY);
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}

export function saveSession({ token, user }) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getApiUrl(path) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  return `${API_BASE}${path}`;
}

export async function apiRequest(path, options = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    token = getStoredToken(),
  } = options;

  const requestHeaders = { ...headers };

  if (token) {
    requestHeaders.Authorization = `Token ${token}`;
  }

  let requestBody = body;
  if (body && !(body instanceof FormData)) {
    requestHeaders['Content-Type'] = 'application/json';
    requestBody = JSON.stringify(body);
  }

  const response = await fetch(getApiUrl(path), {
    method,
    headers: requestHeaders,
    body: requestBody,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = (() => {
      if (payload && typeof payload === 'object') {
        if (payload.detail) {
          return payload.detail;
        }
        if (Array.isArray(payload.non_field_errors) && payload.non_field_errors.length > 0) {
          return payload.non_field_errors[0];
        }
        const firstFieldError = Object.values(payload).find((value) => Array.isArray(value) && value.length > 0);
        if (firstFieldError) {
          return firstFieldError[0];
        }
      }
      if (typeof payload === 'string' && payload.trim()) {
        return payload;
      }
      return `Request failed (${response.status})`;
    })();
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}
