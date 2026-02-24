// src/pages/Business/Pages/BusinessLoginPage.jsx
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../../../../Blocks/Business/BusinessAuth.css";
import Kelom from "../../../assets/web/logo/logoKelom.png";

function BusinessLoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const validateForm = () => {
    const nextErrors = { email: "", password: "", general: "" };

    if (!formData.email.trim()) {
      nextErrors.email = "Ingresa tu correo electrónico.";
    } else if (!validateEmail(formData.email.trim())) {
      nextErrors.email = "El correo no tiene un formato válido.";
    }

    if (!formData.password.trim()) {
      nextErrors.password = "Ingresa tu contraseña.";
    } else if (formData.password.length < 5) {
      nextErrors.password = "La contraseña debe tener al menos 5 caracteres.";
    }

    setErrors(nextErrors);
    return !nextErrors.email && !nextErrors.password;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      general: "",
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    const email = formData.email.trim().toLowerCase();

    // Demo: “login ok” -> vamos a completar/editar perfil
    console.log("Login demo OK:", {
      email,
      passwordLength: formData.password.length,
    });

    navigate("/empresas/registro/completar", {
      state: {
        authMode: "edit", // 👈 al entrar desde login, mostramos "cambiar contraseña"
        loginEmail: email,
      },
    });
  };

  const handleForgotPassword = () => {
    if (!formData.email.trim()) {
      alert(
        "Modo demo: escribe primero tu correo y luego usamos ese dato para recuperación."
      );
      return;
    }

    if (!validateEmail(formData.email.trim())) {
      alert("El correo no parece válido. Revísalo y vuelve a intentar.");
      return;
    }

    alert(
      `Recuperación de contraseña (modo demo) para: ${formData.email.trim()}`
    );
  };

  const handleGoToRegister = () => {
    navigate("/empresas/registro");
  };

  return (
    <div className="business-auth">
      <header className="business-auth__header">
        <div className="container business-auth__header-inner">
          <NavLink
            to="/"
            className="business-auth__logo-link"
            aria-label="Volver al inicio de Kelom"
          >
            <img src={Kelom} alt="Logo Kelom" title="Kelom" />
          </NavLink>

          <span className="business-auth__logo-text">Acceso de proveedores</span>
        </div>
      </header>

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
                  name="email"
                  type="email"
                  className="form__input"
                  placeholder="tucorreo@empresa.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
                <span className="form__error">{errors.email}</span>
              </div>

              <div className="form__field">
                <label className="form__label" htmlFor="login-password">
                  Contraseña
                </label>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="form__input"
                  placeholder="Tu contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={5}
                  autoComplete="current-password"
                  required
                />
                <span className="form__error">{errors.password}</span>

                <label className="form__toggle">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                  />
                  Mostrar contraseña
                </label>
              </div>

              {errors.general && (
                <p className="auth-card__subtitle" style={{ marginBottom: 0 }}>
                  {errors.general}
                </p>
              )}

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