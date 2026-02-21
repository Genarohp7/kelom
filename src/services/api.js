// src/services/api.js
const API_BASE = import.meta.env.VITE_API_URL || "https://api.kelom.com.mx";

export async function apiFetch(path, options = {}) {
  const token = window.localStorage.getItem("kelom_token");

  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers = {
    ...(options.headers || {}),
  };

  // IMPORTANTE: si es FormData, NO seteamos Content-Type (el browser lo pone con boundary)
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg = data?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data;
}