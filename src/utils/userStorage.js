// src/utils/userStorage.js

const USERS_KEY = "kelom_users";
const CURRENT_USER_KEY = "kelom_current_user_email";

function safeParse(json, fallback) {
  try {
    return json ? JSON.parse(json) : fallback;
  } catch {
    return fallback;
  }
}

export function loadUsers() {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(USERS_KEY);
  const users = safeParse(raw, []);
  if (!Array.isArray(users)) return [];
  return users;
}

export function saveUsers(users) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function findUserByEmail(email) {
  const normalized = email.trim().toLowerCase();
  const users = loadUsers();
  return users.find((u) => u.email.toLowerCase() === normalized) || null;
}

export function createUser(data) {
  const users = loadUsers();
  const user = {
    id: Date.now(),
    ...data,
  };
  users.push(user);
  saveUsers(users);
  return user;
}

export function updateUserByEmail(email, updates) {
  const users = loadUsers();
  const normalized = email.trim().toLowerCase();
  const index = users.findIndex((u) => u.email.toLowerCase() === normalized);
  if (index === -1) return null;
  const updated = { ...users[index], ...updates };
  users[index] = updated;
  saveUsers(users);
  return updated;
}

export function setCurrentUserEmail(email) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CURRENT_USER_KEY, email);
}

export function getCurrentUser() {
  if (typeof window === "undefined") return null;
  const email = window.localStorage.getItem(CURRENT_USER_KEY);
  if (!email) return null;
  return findUserByEmail(email);
}

export function logoutCurrentUser() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CURRENT_USER_KEY);
}
