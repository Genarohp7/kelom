// src/Header/Header.jsx
import Kelom from "../assets/logo/logoKelom.png";
import { NavLink, useLocation } from "react-router-dom";

function Header() {
  const location = useLocation();

  // Normalizamos el path a minúsculas
  const path = location.pathname.toLowerCase();

  // Cualquier ruta que contenga "empresa" (empresa, empresas, area-empresas, etc.)
  const isBusinessArea = path.includes("empresa");

  return (
    <header className={`header ${isBusinessArea ? "header--business" : ""}`}>
      <div className="container header__inner">
        {/* Logo */}
        <div className="header__logo">
          <NavLink to="/" aria-label="Kelom">
            <img src={Kelom} alt="Logo Kelom" title="Kelom" />
          </NavLink>
        </div>

        {/* Menú centrado */}
        <nav className="header__nav" aria-label="Navegación principal">
          <NavLink className="header__nav-link" to="/nosotros">
            Nosotros
          </NavLink>
          <NavLink className="header__nav-link" to="/blog">
            Blog
          </NavLink>
        </nav>

        {/* Acciones + redes */}
        <div className="header__right">
          <div className="header__actions">
            {/* 🔹 Ahora este botón manda a la página de registro de novi@s */}
            <NavLink
              to="/registro"
              className="header__btn header__btn--outline"
            >
              Registrarme
            </NavLink>

            {/* <NavLink
              to="/registro"
              className="header__btn header__btn--primary"
            >
              Regístrate
            </NavLink> */}

            <NavLink
              to="/empresas"
              className="header__btn header__btn--secondary"
            >
              Área de empresas
            </NavLink>
          </div>
          <div className="header__social">
            <a
              className="header__social-link"
              href="https://www.facebook.com/profile.php?id=61559819904329"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
            >
              <i className="fa-brands fa-facebook-f"></i>
            </a>
            <a
              className="header__social-link"
              href="https://www.instagram.com/kelomcommx/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              <i className="fa-brands fa-instagram"></i>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
