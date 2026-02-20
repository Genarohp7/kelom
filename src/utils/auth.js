import { apiFetch } from "../services/api.js";

const TOKEN_KEY = "kelom_token";
const USER_KEY = "kelom_user";

export function getToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setSession({ token, user }) {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export function getCachedUser() {
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function login(email, password) {
  const data = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setSession({ token: data.token, user: data.user });
  return data.user;
}

export async function fetchMe() {
  const data = await apiFetch("/auth/me", { method: "GET" });
  window.localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user;
}

export async function registerUser({ email, password, name }) {
  const data = await apiFetch("/users", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
  return data.data;
}

// ======== NUEVO: Ficha de boda (perfil extendido) ========

export async function fetchMyWeddingProfile() {
  const data = await apiFetch("/profile/me", { method: "GET" });
  return data.profile;
}

export async function saveMyWeddingProfile(payload) {
  const data = await apiFetch("/profile/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return data.profile;
}

// Alias para mantener compatibilidad con tu naming actual
export function logout() {
  clearSession();
}