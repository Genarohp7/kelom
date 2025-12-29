// src/utils/userStorage.js

const USERS_KEY = "kelom_users";
const CURRENT_USER_EMAIL_KEY = "kelom_current_user_email";

// -------- helpers internos --------
function loadUsers() {
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Error leyendo usuarios de localStorage", err);
    return [];
  }
}

function saveUsers(users) {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// -------- registro paso 1 (datos básicos) --------
export function registerUserInitial({ email, fullName, phone, password }) {
  const users = loadUsers();
  const normalizedEmail = email.trim().toLowerCase();

  let user = users.find(
    (u) =>
      typeof u.email === "string" &&
      u.email.trim().toLowerCase() === normalizedEmail
  );

  if (!user) {
    // nuevo usuario
    user = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : String(Date.now()),
      email: normalizedEmail,
      fullName: fullName.trim(),
      phone: phone.trim(),
      password, // simple por ahora, ya habrá tiempo de encriptar
      gender: "",
      partnerName: "",
      city: "",
      weddingDate: "",
      guests: "",
      budgetRange: "",
      ceremonyType: "",
      receptionType: "",
      supportFocus: "",
      biggestDoubt: "",
      contactPreference: "",
      createdAt: new Date().toISOString(),
    };
    users.push(user);
  } else {
    // si ya existe, actualizamos básicos
    user.fullName = fullName.trim() || user.fullName;
    user.phone = phone.trim() || user.phone;
    user.password = password || user.password;
  }

  saveUsers(users);
  window.localStorage.setItem(CURRENT_USER_EMAIL_KEY, user.email);
  return user;
}

// -------- registro paso 2 (perfil / ficha) --------
export function updateCurrentUserProfile(profileData) {
  const currentEmail = window.localStorage.getItem(CURRENT_USER_EMAIL_KEY);
  if (!currentEmail) return null;

  const users = loadUsers();
  const idx = users.findIndex(
    (u) =>
      typeof u.email === "string" &&
      u.email.trim().toLowerCase() === currentEmail.trim().toLowerCase()
  );

  if (idx === -1) return null;

  users[idx] = {
    ...users[idx],
    ...profileData,
  };

  saveUsers(users);
  return users[idx];
}

// -------- util: buscar por email --------
export function findUserByEmail(email) {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();
  const users = loadUsers();

  return (
    users.find(
      (u) =>
        typeof u.email === "string" &&
        u.email.trim().toLowerCase() === normalized
    ) || null
  );
}

// -------- login --------
export function loginUser(email, password) {
  const user = findUserByEmail(email);
  if (!user) return null;

  // login sencillito: comparar texto plano
  if (user.password !== password) return null;

  window.localStorage.setItem(CURRENT_USER_EMAIL_KEY, user.email);
  return user;
}

// -------- sesión actual --------
export function getCurrentUser() {
  const email = window.localStorage.getItem(CURRENT_USER_EMAIL_KEY);
  if (!email) return null;

  return findUserByEmail(email);
}

export function logoutCurrentUser() {
  window.localStorage.removeItem(CURRENT_USER_EMAIL_KEY);
}
