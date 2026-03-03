// src/utils/adminAuth.js
import { adminApiFetch, setAdminToken, clearAdminToken, getAdminToken } from "../services/adminApi.js";

const ADMIN_USER_KEY = "kelom_admin_user";

export function getAdminCachedUser() {
  try {
    const raw = window.localStorage.getItem(ADMIN_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAdminSession({ token, user }) {
  setAdminToken(token);
  window.localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
}

export function clearAdminSession() {
  clearAdminToken();
  window.localStorage.removeItem(ADMIN_USER_KEY);
}

export function adminLogout() {
  clearAdminSession();
}

export function hasAdminToken() {
  return Boolean(getAdminToken());
}

export async function adminLogin(email, password) {
  const data = await adminApiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!data?.token || !data?.user) throw new Error("Respuesta inválida del servidor");
  if (data.user.role !== "admin") throw new Error("Este usuario no es administrador");

  setAdminSession({ token: data.token, user: data.user });
  return data.user;
}

export async function adminFetchMe() {
  const data = await adminApiFetch("/auth/me", { method: "GET" });
  if (!data?.user) throw new Error("Sesión inválida");
  if (data.user.role !== "admin") throw new Error("Acceso denegado");

  window.localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(data.user));
  return data.user;
}