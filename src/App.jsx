import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import Header from "./Components/Header.jsx";
import Footer from "./Components/Footer.jsx";
import HomePage from "./pages/HomePage.jsx";
import BlogPage from "./pages/BlogPage.jsx";
import NosotrosPage from "./pages/AboutPage.jsx";
import WeddingPlanningPage from "./pages/WeddingPlanningPage.jsx";
import LegalDocumentPage from "./pages/LegalDocumentPage.jsx";
import BusinessAreaPage from "./pages/Business/Pages/BusinessAreaPage.jsx";
import BusinessBenefitsPage from "./pages/Business/Pages/BusinessBenefitsPage.jsx";

// Formularios de empresas
import BusinessLoginPage from "./pages/Business/Pages/BusinessLoginPage.jsx";
import BusinessRegisterPage from "./pages/Business/Pages/BusinessRegisterPage.jsx";
import BusinessRegisterCompletePage from "./pages/Business/Pages/BusinessRegisterCompletePage.jsx";
import ProviderInboxPage from "./pages/Business/Pages/ProviderInboxPage.jsx";

// Detalle de proveedor
import VenueDetailPage from "./pages/VenueDetailPage.jsx";

// Formularios y páginas de parejas
import UserLoginPage from "./pages/UserLoginPage.jsx";
import UserRegisterPage from "./pages/UserRegisterPage.jsx";
import UserRegisterCompletePage from "./pages/Business/Pages/UserRegisterCompletePage.jsx";
import UserProfilePage from "./pages/UserProfilePage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";

// ✅ Admin
import AdminLoginPage from "./pages/AdminLoginPage.jsx";
import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";

// Scroll al cambiar de ruta
import ScrollToTop from "./Components/ScrollToTop.jsx";

// ✅ Cargador global (singleton) para Google Maps JS + Places
function loadGoogleMaps(apiKey) {
  if (!apiKey) return Promise.reject(new Error("Missing Google Maps API key"));

  if (window.google?.maps?.places) {
    return Promise.resolve(window.google);
  }

  if (window.__kelomGoogleMapsPromise) {
    return window.__kelomGoogleMapsPromise;
  }

  window.__kelomGoogleMapsPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-kelom="google-maps"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(window.google));
      existing.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");
    script.setAttribute("data-kelom", "google-maps");
    script.async = true;
    script.defer = true;

    const params = new URLSearchParams({
      key: apiKey,
      libraries: "places",
      language: "es",
      region: "MX",
    });

    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;

    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error("Failed to load Google Maps script"));

    document.head.appendChild(script);
  });

  return window.__kelomGoogleMapsPromise;
}

function getCookieConsentApi() {
  if (typeof window === "undefined") return null;
  return window.KelomCookieConsent || null;
}

function readCookieConsentState() {
  const api = getCookieConsentApi();
  const stored = api?.get?.() || null;

  return {
    hasDecision: Boolean(api?.hasDecision?.()),
    analytics: Boolean(stored?.analytics),
  };
}

function CookieConsentManager() {
  const [hasDecision, setHasDecision] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    const syncFromStorage = () => {
      const next = readCookieConsentState();
      setHasDecision(next.hasDecision);
      setAnalyticsEnabled(next.analytics);
      setShowBanner(!next.hasDecision);
    };

    const handleOpenPreferences = () => {
      const next = readCookieConsentState();
      setHasDecision(next.hasDecision);
      setAnalyticsEnabled(next.analytics);
      setShowPreferences(true);
    };

    const handleConsentChanged = (event) => {
      const nextAnalytics = Boolean(event?.detail?.analytics);
      setHasDecision(true);
      setAnalyticsEnabled(nextAnalytics);
      setShowBanner(false);
      setShowPreferences(false);
    };

    syncFromStorage();

    window.addEventListener("kelom:open-cookie-preferences", handleOpenPreferences);
    window.addEventListener("kelom:cookie-consent-changed", handleConsentChanged);

    return () => {
      window.removeEventListener("kelom:open-cookie-preferences", handleOpenPreferences);
      window.removeEventListener("kelom:cookie-consent-changed", handleConsentChanged);
    };
  }, []);

  const handleAcceptAnalytics = () => {
    const api = getCookieConsentApi();
    api?.acceptAnalytics?.();

    setHasDecision(true);
    setAnalyticsEnabled(true);
    setShowBanner(false);
    setShowPreferences(false);
  };

  const handleRejectAnalytics = () => {
    const api = getCookieConsentApi();
    api?.rejectAnalytics?.();

    setHasDecision(true);
    setAnalyticsEnabled(false);
    setShowBanner(false);
    setShowPreferences(false);
  };

  const handleSavePreferences = () => {
    if (analyticsEnabled) {
      handleAcceptAnalytics();
      return;
    }
    handleRejectAnalytics();
  };

  return (
    <>
      {hasDecision && (
        <button
          type="button"
          onClick={() => setShowPreferences(true)}
          aria-label="Abrir preferencias de cookies"
          title="Preferencias de cookies"
          style={{
            position: "fixed",
            left: "1rem",
            bottom: "1rem",
            zIndex: 1000,
            border: "1px solid rgba(0,0,0,0.12)",
            background: "#fff",
            color: "#222",
            borderRadius: "999px",
            padding: "0.75rem 1rem",
            fontSize: "0.9rem",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 10px 28px rgba(0,0,0,0.12)",
          }}
        >
          Cookies
        </button>
      )}

      {showBanner && (
        <div
          role="dialog"
          aria-live="polite"
          aria-label="Aviso de cookies"
          style={{
            position: "fixed",
            right: "1rem",
            bottom: "1rem",
            zIndex: 1001,
            width: "min(520px, calc(100vw - 2rem))",
            background: "#fff",
            color: "#222",
            borderRadius: "1rem",
            padding: "1.1rem",
            boxShadow: "0 18px 50px rgba(0,0,0,0.18)",
            border: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <h3 style={{ margin: 0, marginBottom: "0.55rem", fontSize: "1.05rem" }}>
            Uso de cookies
          </h3>

          <p style={{ margin: 0, lineHeight: 1.5, fontSize: "0.95rem" }}>
            En Kelom usamos cookies necesarias para que el sitio funcione y, si tú lo
            autorizas, cookies analíticas para entender tráfico, rutas y mejoras del
            sitio. Las necesarias siempre están activas; las analíticas son opcionales.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.6rem",
              marginTop: "1rem",
            }}
          >
            <button
              type="button"
              onClick={handleAcceptAnalytics}
              style={{
                border: "none",
                background: "#111827",
                color: "#fff",
                borderRadius: "0.8rem",
                padding: "0.8rem 1rem",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Aceptar analítica
            </button>

            <button
              type="button"
              onClick={handleRejectAnalytics}
              style={{
                border: "1px solid rgba(0,0,0,0.15)",
                background: "#fff",
                color: "#222",
                borderRadius: "0.8rem",
                padding: "0.8rem 1rem",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Rechazar
            </button>

            <button
              type="button"
              onClick={() => setShowPreferences(true)}
              style={{
                border: "1px solid rgba(0,0,0,0.15)",
                background: "#fff",
                color: "#222",
                borderRadius: "0.8rem",
                padding: "0.8rem 1rem",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Configurar
            </button>
          </div>
        </div>
      )}

      {showPreferences && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Preferencias de cookies"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1002,
            background: "rgba(17, 24, 39, 0.5)",
            display: "grid",
            placeItems: "center",
            padding: "1rem",
          }}
        >
          <div
            style={{
              width: "min(680px, 100%)",
              background: "#fff",
              borderRadius: "1.1rem",
              padding: "1.25rem",
              boxShadow: "0 24px 60px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "start",
                justifyContent: "space-between",
                gap: "1rem",
              }}
            >
              <div>
                <h3 style={{ margin: 0, marginBottom: "0.45rem" }}>
                  Preferencias de cookies
                </h3>
                <p style={{ margin: 0, lineHeight: 1.5, color: "#444" }}>
                  Puedes decidir qué tipo de cookies opcionales permites en Kelom.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                aria-label="Cerrar preferencias de cookies"
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "1.4rem",
                  lineHeight: 1,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                marginTop: "1rem",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: "0.9rem",
                padding: "1rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                <div>
                  <strong>Cookies necesarias</strong>
                  <p style={{ margin: "0.35rem 0 0 0", color: "#555", lineHeight: 1.5 }}>
                    Permiten funciones esenciales como seguridad, sesión y recordar tu
                    preferencia de cookies.
                  </p>
                </div>

                <div
                  style={{
                    minWidth: "fit-content",
                    alignSelf: "center",
                    fontWeight: 700,
                    color: "#111827",
                  }}
                >
                  Siempre activas
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: "0.8rem",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: "0.9rem",
                padding: "1rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                <div>
                  <strong>Cookies analíticas</strong>
                  <p style={{ margin: "0.35rem 0 0 0", color: "#555", lineHeight: 1.5 }}>
                    Nos ayudan a medir tráfico, navegación y comportamiento general para
                    mejorar la experiencia del sitio.
                  </p>
                </div>

                <label
                  style={{
                    minWidth: "fit-content",
                    alignSelf: "center",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.55rem",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={analyticsEnabled}
                    onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                  />
                  Activar
                </label>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.65rem",
                marginTop: "1.2rem",
              }}
            >
              <button
                type="button"
                onClick={handleSavePreferences}
                style={{
                  border: "none",
                  background: "#111827",
                  color: "#fff",
                  borderRadius: "0.8rem",
                  padding: "0.82rem 1rem",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Guardar preferencias
              </button>

              <button
                type="button"
                onClick={handleAcceptAnalytics}
                style={{
                  border: "1px solid rgba(0,0,0,0.15)",
                  background: "#fff",
                  color: "#222",
                  borderRadius: "0.8rem",
                  padding: "0.82rem 1rem",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Aceptar analítica
              </button>

              <button
                type="button"
                onClick={handleRejectAnalytics}
                style={{
                  border: "1px solid rgba(0,0,0,0.15)",
                  background: "#fff",
                  color: "#222",
                  borderRadius: "0.8rem",
                  padding: "0.82rem 1rem",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Rechazar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function App() {
  const location = useLocation();
  const isBusinessArea = location.pathname.startsWith("/empresas");
  const isAdminArea = location.pathname.startsWith("/admin");
  const isProviderInvitationArea = location.pathname.startsWith("/proveedores/invitacion");

  const hideGlobalChrome = isBusinessArea || isAdminArea || isProviderInvitationArea;

  // Health check (opcional)
  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL || "https://api.kelom.com.mx";

    fetch(`${apiBase}/health`, { method: "GET" })
      .then((r) => r.json())
      .then((data) => console.log("API HEALTH:", data))
      .catch((err) => console.error("API HEALTH ERROR:", err));
  }, []);

  // ✅ Cargar Google Maps JS globalmente
  useEffect(() => {
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!key) {
      console.warn(
        "VITE_GOOGLE_MAPS_API_KEY no está definida. Autocomplete/Mapa no se cargarán."
      );
      return;
    }

    loadGoogleMaps(key)
      .then(() => console.log("Google Maps JS loaded ✅"))
      .catch((err) => console.error("Google Maps load error:", err));
  }, []);

  // ✅ Pageview virtual para SPA vía GA4 directo
  useEffect(() => {
    const api = getCookieConsentApi();
    const consent = api?.get?.();

    if (!consent?.analytics) return;
    if (typeof window.gtag !== "function") return;

    window.gtag("event", "page_view", {
      page_title: document.title,
      page_location: window.location.href,
      page_path: `${location.pathname}${location.search}${location.hash}`,
    });
  }, [location]);

  return (
    <div className="page">
      <ScrollToTop />

      {!hideGlobalChrome && <Header />}

      <main className="page__content">
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/nosotros" element={<NosotrosPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/planea-tu-boda" element={<WeddingPlanningPage />} />
          <Route path="/legal/:slug" element={<LegalDocumentPage />} />

          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />

          <Route path="/acceso" element={<UserLoginPage />} />
          <Route path="/registro" element={<UserRegisterPage />} />
          <Route path="/registro/completar" element={<UserRegisterCompletePage />} />
          <Route path="/perfil" element={<UserProfilePage />} />
          <Route path="/recuperar-contrasena" element={<ForgotPasswordPage />} />
          <Route path="/restablecer-contrasena" element={<ResetPasswordPage />} />

          <Route path="/empresas" element={<BusinessAreaPage />} />
          <Route path="/empresas/beneficios" element={<BusinessBenefitsPage />} />
          <Route path="/empresas/acceso" element={<BusinessLoginPage />} />
          <Route path="/empresas/registro" element={<BusinessRegisterPage />} />
          <Route
            path="/empresas/registro/completar"
            element={<BusinessRegisterCompletePage />}
          />
          <Route path="/empresas/solicitudes" element={<ProviderInboxPage />} />

          <Route
            path="/proveedores/invitacion/:token"
            element={<BusinessRegisterPage />}
          />

          <Route path="/proveedores/:id" element={<VenueDetailPage />} />

          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      {!hideGlobalChrome && <Footer />}

      <CookieConsentManager />
    </div>
  );
}

export default App;