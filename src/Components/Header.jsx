// src/components/Header.jsx
import Kelom from "../assets/logo/logoKelom.png";
import { NavLink } from "react-router-dom";

function Header() {
  return (
    <header className="header">
      <div className="container header__inner">
        {/* Menú central: Nosotros – Logo – Blog */}
        <nav className="header__nav" aria-label="Navegación principal">
          <NavLink
            to="/nosotros"
            className={({ isActive }) =>
              "header__nav-link" +
              (isActive ? " header__nav-link--active" : "")
            }
          >
            Nosotros
          </NavLink>

          <NavLink to="/" className="header__logo" aria-label="Kelom">
            <img src={Kelom} alt="Logo Kelom" title="Kelom" />
          </NavLink>

          <NavLink
            to="/blog"
            className={({ isActive }) =>
              "header__nav-link" +
              (isActive ? " header__nav-link--active" : "")
            }
          >
            Blog
          </NavLink>
        </nav>

        {/* Acciones + redes sociales */}
        <div className="header__right">
          <div className="header__actions">
            <button className="header__btn header__btn--outline">
              Acceder
            </button>
            <button className="header__btn header__btn--primary">
              Regístrate
            </button>

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
