import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles/global.css";

const COOKIE_CONSENT_KEY = "kelom_cookie_consent_v1";

function getStoredCookieConsent() {
  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return {
      necessary: true,
      analytics: Boolean(parsed?.analytics),
      marketing: false,
      updatedAt: parsed?.updatedAt || null,
      version: "1",
    };
  } catch {
    return null;
  }
}

function saveCookieConsent(nextConsent) {
  const safeConsent = {
    necessary: true,
    analytics: Boolean(nextConsent?.analytics),
    marketing: false,
    updatedAt: new Date().toISOString(),
    version: "1",
  };

  window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(safeConsent));
  return safeConsent;
}

function ensureDataLayer() {
  window.dataLayer = window.dataLayer || [];

  if (typeof window.gtag !== "function") {
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
  }
}

function setDefaultConsentDenied() {
  ensureDataLayer();

  window.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    functionality_storage: "granted",
    security_storage: "granted",
    wait_for_update: 500,
  });
}

function updateGoogleConsent({ analytics }) {
  ensureDataLayer();

  window.gtag("consent", "update", {
    analytics_storage: analytics ? "granted" : "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    functionality_storage: "granted",
    security_storage: "granted",
  });
}

function applyStoredConsentOnBoot() {
  const stored = getStoredCookieConsent();

  if (!stored) return;

  updateGoogleConsent({ analytics: stored.analytics });
}

function exposeCookieConsentApi() {
  window.KelomCookieConsent = {
    key: COOKIE_CONSENT_KEY,

    get() {
      return getStoredCookieConsent();
    },

    acceptAnalytics() {
      const next = saveCookieConsent({ analytics: true });
      updateGoogleConsent({ analytics: true });

      window.dispatchEvent(
        new CustomEvent("kelom:cookie-consent-changed", {
          detail: next,
        })
      );

      return next;
    },

    rejectAnalytics() {
      const next = saveCookieConsent({ analytics: false });
      updateGoogleConsent({ analytics: false });

      window.dispatchEvent(
        new CustomEvent("kelom:cookie-consent-changed", {
          detail: next,
        })
      );

      return next;
    },

    openPreferences() {
      window.dispatchEvent(new CustomEvent("kelom:open-cookie-preferences"));
    },

    hasDecision() {
      return Boolean(getStoredCookieConsent());
    },
  };
}

function bootstrapAnalyticsConsent() {
  ensureDataLayer();
  setDefaultConsentDenied();
  exposeCookieConsentApi();
  applyStoredConsentOnBoot();
}

bootstrapAnalyticsConsent();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* basename usa el mismo base que Vite (en dev será "/", en GitHub "/kelom/") */}
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);