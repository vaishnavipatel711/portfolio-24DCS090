// One shared base URL for the whole app (Practical 6).
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Every call goes through here so loading/error handling is identical
// for reads AND writes.
async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new Error('Cannot reach the server. Is the backend running on port 5000?');
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const details = data?.details?.map((d) => d.message).join(', ');
    throw new Error(details || data?.error || `Request failed (${res.status})`);
  }
  return data;
}

export const getTasks = () => request('/tasks');

export const createTask = (task) =>
  request('/tasks', { method: 'POST', body: JSON.stringify(task) });

export const updateTask = (id, changes) =>
  request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(changes) });

export const deleteTask = (id) => request(`/tasks/${id}`, { method: 'DELETE' });
