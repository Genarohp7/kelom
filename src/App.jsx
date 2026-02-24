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

function App() {
  const location = useLocation();
  const isBusinessArea = location.pathname.startsWith("/empresas");

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL || "https://api.kelom.com.mx";

    fetch(`${apiBase}/health`, { method: "GET" })
      .then((r) => r.json())
      .then((data) => console.log("API HEALTH:", data))
      .catch((err) => console.error("API HEALTH ERROR:", err));
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

          {/* Área de empresas (usa header/footer propios) */}
          <Route path="/empresas" element={<BusinessAreaPage />} />
          <Route path="/empresas/beneficios" element={<BusinessBenefitsPage />} />
          <Route path="/empresas/acceso" element={<BusinessLoginPage />} />

          {/* Registro corto (lead) */}
          <Route path="/empresas/registro" element={<BusinessRegisterPage />} />

          <Route path="/empresas/registro/completar" element={<BusinessRegisterCompletePage />} />

          {/* Registro completo (ficha proveedor) */}
          <Route
            path="/empresas/registro/completar"
            element={<BusinessRegisterCompletePage />}
          />

          {/* Detalle de proveedor (venues) */}
          <Route path="/proveedores/:id" element={<VenueDetailPage />} />

          {/* Cualquier ruta rara manda al Home */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      {/* Footer global solo en el sitio "normal" */}
      {!isBusinessArea && <Footer />}
    </div>
  );
}

export default App;