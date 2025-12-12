// src/pages/Business/Pages/BusinessLoginPage.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../../../../Blocks/Business/BusinessAuth.css";
import Kelom from "../../../assets/logo/logoKelom.png";

function BusinessLoginPage() {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    // Demo: aquí luego irá la llamada al backend
    console.log("Login demo enviado");
  };

  const handleForgotPassword = () => {
    alert("Recuperación de contraseña (modo demo).");
  };

  const handleGoToRegister = () => {
    navigate("/empresas/registro");
  };

  return (
    <div className="business-auth">
      {/* HEADER CON LOGO (usa BusinessAuth.css) */}
      <header className="business-auth__header">
        <div className="container business-auth__header-inner">
          <NavLink
            to="/"
            className="business-auth__logo-link"
            aria-label="Volver al inicio de Kelom"
          >
            <img src={Kelom} alt="Logo Kelom" title="Kelom" />
          </NavLink>

          <span className="business-auth__logo-text">
            Acceso de proveedores
          </span>
        </div>
      </header>

      {/* CONTENIDO LOGIN */}
      <main className="business-auth__content">
        <div className="business-auth__container">
          <section className="auth-card">
            <h1 className="auth-card__title">Acceso para proveedores</h1>
            <p className="auth-card__subtitle">
              Ingresa con tu correo y contraseña para administrar tu perfil en
              Kelom.
            </p>

            <form className="form" onSubmit={handleSubmit} noValidate>
              <div className="form__field">
                <label className="form__label" htmlFor="login-email">
                  Correo electrónico
                </label>
                <input
                  id="login-email"
                  type="email"
                  className="form__input"
                  placeholder="tucorreo@empresa.com"
                  required
                />
                <span className="form__error" />
              </div>

              <div className="form__field">
                <label className="form__label" htmlFor="login-password">
                  Contraseña
                </label>
                <input
                  id="login-password"
                  type="password"
                  className="form__input"
                  placeholder="Tu contraseña"
                  minLength={5}
                  required
                />
                <span className="form__error" />
              </div>

              <div className="auth-card__actions">
                <button type="submit" className="btn btn--primary">
                  Acceder
                </button>
              </div>

              <div className="auth-card__links">
                <button
                  type="button"
                  className="auth-card__link"
                  onClick={handleForgotPassword}
                >
                  Olvidé mi contraseña
                </button>

                <button
                  type="button"
                  className="auth-card__link auth-card__link--muted"
                  onClick={handleGoToRegister}
                >
                  Registrar mi empresa
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>

      <footer className="business-auth__footer">
        © {new Date().getFullYear()} Kelom · Área para proveedores.
      </footer>
    </div>
  );
}

export default BusinessLoginPage;
