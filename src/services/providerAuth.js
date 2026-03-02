// src/services/providerAuth.js

const PROVIDER_TOKEN_KEY = "kelom_provider_token";
const PROVIDER_USER_KEY = "kelom_provider_user";

export function getProviderToken() {
  try {
    return localStorage.getItem(PROVIDER_TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export function getProviderUser() {
  try {
    const raw = localStorage.getItem(PROVIDER_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setProviderSession({ token, provider }) {
  try {
    if (token) localStorage.setItem(PROVIDER_TOKEN_KEY, token);
    if (provider) localStorage.setItem(PROVIDER_USER_KEY, JSON.stringify(provider));
  } catch {
    // ignore
  }
}

export function clearProviderSession() {
  try {
    localStorage.removeItem(PROVIDER_TOKEN_KEY);
    localStorage.removeItem(PROVIDER_USER_KEY);
  } catch {
    // ignore
  }
}

export function isProviderLoggedIn() {
  return !!getProviderToken();
}