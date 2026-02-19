// src/utils/userStorage.js
import { apiRequest } from "../services/apiClient.js";

const SESSION_KEY = "kelom_session_user";
const PENDING_KEY = "kelom_pending_registration";

// =======================
// Registro paso 1 (sin password)
// =======================
export function savePendingRegistration({ email, fullName, phone }) {
  const payload = {
    email: (email || "").trim().toLowerCase(),
    fullName: (fullName || "").trim(),
    phone: (phone || "").trim(),
    createdAt: new Date().toISOString(),
  };
  window.localStorage.setItem(PENDING_KEY, JSON.stringify(payload));
  return payload;
}

export function getPendingRegistration() {
  try {
    const raw = window.localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearPendingRegistration() {
  window.localStorage.removeItem(PENDING_KEY);
}

// =======================
// Sesión (usuario logueado)
// =======================
export function setSessionUser(user) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function getCurrentUser() {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function logoutCurrentUser() {
  window.localStorage.removeItem(SESSION_KEY);
}

// =======================
// API: registro final (con password)
// =======================
export async function registerUserFinal({ email, password, name }) {
  const data = await apiRequest("/users", {
    method: "POST",
    body: {
      email: (email || "").trim().toLowerCase(),
      password,
      name: (name || "").trim() || null,
    },
  });

  // Guardamos sesión con lo que regresa el backend
  setSessionUser(data.data);
  return data.data;
}

// =======================
// API: login real
// =======================
export async function loginUser(email, password) {
  const data = await apiRequest("/login", {
    method: "POST",
    body: {
      email: (email || "").trim().toLowerCase(),
      password,
    },
  });

  setSessionUser(data.data);
  return data.data;
}
