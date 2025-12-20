// src/App.jsx
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./Components/Header.jsx";
import Footer from "./Components/Footer.jsx";
import HomePage from "./pages/HomePage.jsx";
import BlogPage from "./pages/BlogPage.jsx";
import NosotrosPage from "./pages/AboutPage.jsx";
import BusinessAreaPage from "./pages/Business/Pages/BusinessAreaPage.jsx";
import BusinessBenefitsPage from "./pages/Business/Pages/BusinessBenefitsPage.jsx";

// 🔹 Formularios de empresas
import BusinessLoginPage from "./pages/Business/Pages/BusinessLoginPage.jsx";
import BusinessRegisterPage from "./pages/Business/Pages/BusinessRegisterPage.jsx";

// 🔹 Detalle de proveedor
import VenueDetailPage from "./pages/VenueDetailPage.jsx";

// 🔹 Scroll al cambiar de ruta
import ScrollToTop from "./Components/ScrollToTop.jsx";

// 🔹 NUEVO: páginas para novi@s
import UserLoginPage from "./pages/UserLoginPage.jsx";
import UserRegisterPage from "./pages/UserRegisterPage.jsx";
import UserProfilePage from "./pages/UserProfilePage.jsx";

function App() {
  const location = useLocation();
  const isBusinessArea = location.pathname.startsWith("/empresas");

  return (
    <div className="page">
      {/* Forzar scroll al inicio en cada cambio de ruta */}
      <ScrollToTop />

      {/* Header global solo en el sitio "normal" */}
      {!isBusinessArea && <Header />}

      <main className="page__content">
        <Routes>
          {/* Home por defecto */}
          <Route path="/" element={<HomePage />} />

          {/* Otras páginas */}
          <Route path="/nosotros" element={<NosotrosPage />} />
          <Route path="/blog" element={<BlogPage />} />

          {/* 🔹 Cuenta de novi@s */}
          <Route path="/acceso" element={<UserLoginPage />} />
          <Route path="/registro" element={<UserRegisterPage />} />
          <Route path="/mi-perfil" element={<UserProfilePage />} />

          {/* Área de empresas (usa header/footer propios) */}
          <Route path="/empresas" element={<BusinessAreaPage />} />
          <Route
            path="/empresas/beneficios"
            element={<BusinessBenefitsPage />}
          />

          {/* Login / Registro proveedores */}
          <Route path="/empresas/acceso" element={<BusinessLoginPage />} />
          <Route path="/empresas/registro" element={<BusinessRegisterPage />} />

          {/* Detalle de proveedor */}
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
