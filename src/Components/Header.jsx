import Kelom from "../assets/logo/logoKelom.svg";
import { NavLink } from "react-router-dom";

function Header() {
  return (
    <header className="header">
      <div className="container header__inner">
        {/* Logo */}
        <div className="header__logo">
          <NavLink to="/" aria-label="Kelom">
            <img
              src={Kelom}
              alt="Logo Kelom"
              title="Kelom"
              className="header__logo-image"
            />
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
            <button className="header__btn header__btn--outline">
              Acceder
            </button>
            <button className="header__btn header__btn--primary">
              Regístrate
            </button>
            <button className="header__btn header__btn--secondary">
              Área de empresas
            </button>
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
