// src/services/api.js
const BASE_URL = import.meta.env.VITE_API_URL || "https://api.kelom.com.mx";

export async function apiFetch(path, options = {}) {
  const token = window.localStorage.getItem("kelom_token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
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

// Mantengo tus helpers existentes para compatibilidad
export const checkHealth = async () => {
  return apiFetch("/health", { method: "GET" });
};

export const createUser = async (data) => {
  return apiFetch("/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
};