// src/services/apiClient.js
const API_BASE =
  import.meta.env.VITE_API_URL?.trim() || "https://api.kelom.com.mx";

async function parseJsonSafe(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export async function apiRequest(path, { method = "GET", body, headers } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    const message =
      data?.error ||
      data?.message ||
      `Error HTTP ${res.status} en ${method} ${path}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}
