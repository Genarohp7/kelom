// src/Header/Header.jsx
import { useEffect, useMemo, useState } from "react";
import Kelom from "../assets/web/logo/logoKelom.png";
import { NavLink, useLocation } from "react-router-dom";
import { getToken, fetchMe, logout } from "../utils/auth.js";

function Header() {
  const location = useLocation();

  const [userName, setUserName] = useState("");

  // Normalizamos el path a minúsculas
  const path = location.pathname.toLowerCase();

  // Cualquier ruta que contenga "empresa" (empresa, empresas, area-empresas, etc.)
  const isBusinessArea = path.includes("empresa");

  useEffect(() => {
    let cancelled = false;

    async function loadUserSession() {
      const token = getToken();

      if (!token) {
        if (!cancelled) setUserName("");
        return;
      }

      try {
        const me = await fetchMe();
        if (cancelled) return;

        const rawName = String(me?.name || "").trim();
        const rawEmail = String(me?.email || "").trim();

        if (rawName) {
          setUserName(rawName);
          return;
        }

        if (rawEmail) {
          setUserName(rawEmail.split("@")[0]);
          return;
        }

        setUserName("Mi cuenta");
      } catch {
        logout();
        if (!cancelled) setUserName("");
      }
    }

    loadUserSession();

    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  const greetingLabel = useMemo(() => {
    const clean = String(userName || "").trim();
    if (!clean) return "";
    return `Hola, ${clean}`;
  }, [userName]);

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
            {greetingLabel ? (
              <NavLink to="/perfil" className="header__btn header__btn--primary">
                {greetingLabel}
              </NavLink>
            ) : (
              <>
                <NavLink to="/acceso" className="header__btn header__btn--primary">
                  Mi cuenta
                </NavLink>

                <NavLink to="/registro" className="header__btn header__btn--primary">
                  Regístrate
                </NavLink>
              </>
            )}

            <NavLink to="/empresas" className="header__btn header__btn--secondary">
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