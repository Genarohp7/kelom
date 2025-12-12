// src/App.jsx
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./Components/Header.jsx";
import Footer from "./Components/Footer.jsx";
import HomePage from "./pages/HomePage.jsx";
import BlogPage from "./pages/BlogPage.jsx";
import NosotrosPage from "./pages/AboutPage.jsx";
import BusinessAreaPage from "./pages/Business/Pages/BusinessAreaPage.jsx";
import BusinessBenefitsPage from "./pages/Business/Pages/BusinessBenefitsPage.jsx";

// 🔹 NUEVOS IMPORTS PARA LOS FORMULARIOS
import BusinessLoginPage from "./pages/Business/Pages/BusinessLoginPage.jsx";
import BusinessRegisterPage from "./pages/Business/Pages/BusinessRegisterPage.jsx";

function App() {
  const location = useLocation();
  const isBusinessArea = location.pathname.startsWith("/empresas");

  return (
    <div className="page">
      {/* Header global solo en el sitio "normal" */}
      {!isBusinessArea && <Header />}

      <main className="page__content">
        <Routes>
          {/* Home por defecto */}
          <Route path="/" element={<HomePage />} />

          {/* Otras páginas */}
          <Route path="/nosotros" element={<NosotrosPage />} />
          <Route path="/blog" element={<BlogPage />} />

          {/* Área de empresas (usa header/footer propios) */}
          <Route path="/empresas" element={<BusinessAreaPage />} />
          <Route path="/empresas/beneficios" element={<BusinessBenefitsPage />} />

          {/* 🔹 LOGIN PROVEEDORES */}
          <Route path="/empresas/acceso" element={<BusinessLoginPage />} />

          {/* 🔹 REGISTRO PROVEEDORES */}
          <Route path="/empresas/registro" element={<BusinessRegisterPage />} />

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
