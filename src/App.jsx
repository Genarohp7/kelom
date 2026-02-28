// src/App.jsx
import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

import Header from "./Components/Header.jsx";
import Footer from "./Components/Footer.jsx";
import HomePage from "./pages/HomePage.jsx";
import BlogPage from "./pages/BlogPage.jsx";
import NosotrosPage from "./pages/AboutPage.jsx";
import BusinessAreaPage from "./pages/Business/Pages/BusinessAreaPage.jsx";
import BusinessBenefitsPage from "./pages/Business/Pages/BusinessBenefitsPage.jsx";

// Formularios de empresas
import BusinessLoginPage from "./pages/Business/Pages/BusinessLoginPage.jsx";
import BusinessRegisterPage from "./pages/Business/Pages/BusinessRegisterPage.jsx";
import BusinessRegisterCompletePage from "./pages/Business/Pages/BusinessRegisterCompletePage.jsx";

// Detalle de proveedor
import VenueDetailPage from "./pages/VenueDetailPage.jsx";

// Formularios y páginas de parejas
import UserLoginPage from "./pages/UserLoginPage.jsx";
import UserRegisterPage from "./pages/UserRegisterPage.jsx";
import UserRegisterCompletePage from "./pages/Business/Pages/UserRegisterCompletePage.jsx";
import UserProfilePage from "./pages/UserProfilePage.jsx";

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
    script.onerror = () =>
      reject(new Error("Failed to load Google Maps script"));

    document.head.appendChild(script);
  });

  return window.__kelomGoogleMapsPromise;
}

function App() {
  const location = useLocation();
  const isBusinessArea = location.pathname.startsWith("/empresas");

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

  return (
    <div className="page">
      <ScrollToTop />

      {/* Header global solo en el sitio "normal" */}
      {!isBusinessArea && <Header />}

      <main className="page__content">
        <Routes>
          {/* Home por defecto */}
          <Route path="/" element={<HomePage />} />

          {/* Otras páginas públicas */}
          <Route path="/nosotros" element={<NosotrosPage />} />
          <Route path="/blog" element={<BlogPage />} />

          {/* Flujo parejas (usuarios finales) */}
          <Route path="/acceso" element={<UserLoginPage />} />
          <Route path="/registro" element={<UserRegisterPage />} />
          <Route
            path="/registro/completar"
            element={<UserRegisterCompletePage />}
          />
          <Route path="/perfil" element={<UserProfilePage />} />

          {/* Área de empresas */}
          <Route path="/empresas" element={<BusinessAreaPage />} />
          <Route
            path="/empresas/beneficios"
            element={<BusinessBenefitsPage />}
          />
          <Route path="/empresas/acceso" element={<BusinessLoginPage />} />

          {/* Registro corto (lead) */}
          <Route path="/empresas/registro" element={<BusinessRegisterPage />} />

          {/* Registro completo (ficha proveedor) */}
          <Route
            path="/empresas/registro/completar"
            element={<BusinessRegisterCompletePage />}
          />

          {/* Detalle de proveedor */}
          <Route path="/proveedores/:id" element={<VenueDetailPage />} />

          {/* Catch-all */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      {/* Footer global solo en el sitio "normal" */}
      {!isBusinessArea && <Footer />}
    </div>
  );
}

export default App;