// One shared base URL for the whole app (Practical 6).
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ---- Token storage (Practical 7) ----
// localStorage survives a page refresh, so the user stays logged in.
const TOKEN_KEY = 'token';
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const saveToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// App.jsx registers a function here. api.js calls it when a protected request
// comes back 401 (missing / expired / invalid token) so the app can log out
// and redirect to the login page.
let onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

// Every call goes through here so loading/error handling is identical
// for reads AND writes.
// { auth: false } is used for login/register, which have no token yet.
async function request(path, options = {}, { auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error('Cannot reach the server. Is the backend running on port 5000?');
  }

  const data = await res.json().catch(() => null);

  // A 401 on a protected request means the session is no longer valid.
  // (Wrong password on /auth/login is also 401, but that call uses auth:false.)
  if (res.status === 401 && auth && onUnauthorized) onUnauthorized();

  if (!res.ok) {
    const details = data?.details?.map((d) => d.message).join(', ');
    throw new Error(details || data?.error || `Request failed (${res.status})`);
  }
  return data;
}

// ---- Auth ----
export const registerUser = (email, password) =>
  request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }, { auth: false });

export const loginUser = (email, password) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }, { auth: false });

export const getMe = () => request('/auth/me');

// ---- Tasks ----
export const getTasks = () => request('/tasks');

export const createTask = (task) =>
  request('/tasks', { method: 'POST', body: JSON.stringify(task) });

export const updateTask = (id, changes) =>
  request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(changes) });

export const deleteTask = (id) => request(`/tasks/${id}`, { method: 'DELETE' });
