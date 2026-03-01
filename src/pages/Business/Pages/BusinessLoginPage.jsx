// src/pages/Business/Pages/BusinessLoginPage.jsx
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../../../../Blocks/Business/BusinessAuth.css";
import Kelom from "../../../assets/web/logo/logoKelom.png";

const API_BASE = import.meta.env.VITE_API_URL || "https://api.kelom.com.mx";

// ✅ Deben coincidir con BusinessRegisterCompletePage.jsx
const PROVIDER_TOKEN_KEY = "kelom_provider_token";
const PROVIDER_USER_KEY = "kelom_provider_user";

function BusinessLoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const validateForm = () => {
    const nextErrors = { email: "", password: "", general: "" };

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email) nextErrors.email = "Ingresa tu correo electrónico.";
    else if (!validateEmail(email))
      nextErrors.email = "El correo no tiene un formato válido.";

    if (!password.trim()) nextErrors.password = "Ingresa tu contraseña.";
    else if (password.length < 5)
      nextErrors.password = "La contraseña debe tener al menos 5 caracteres.";

    setErrors(nextErrors);
    return !nextErrors.email && !nextErrors.password;
  };

  const saveProviderSession = ({ token, provider }) => {
    try {
      if (token) localStorage.setItem(PROVIDER_TOKEN_KEY, token);
      if (provider)
        localStorage.setItem(PROVIDER_USER_KEY, JSON.stringify(provider));
    } catch {
      // ignore
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "", general: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (!validateForm()) return;

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    try {
      setIsSubmitting(true);

      const res = await fetch(`${API_BASE}/providers/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          data?.error ||
          (res.status === 401
            ? "Credenciales inválidas."
            : `Error HTTP ${res.status}`);
        setErrors((prev) => ({ ...prev, general: msg }));
        return;
      }

      // ✅ Guardar sesión real (token + provider)
      saveProviderSession({ token: data?.token, provider: data?.provider });

      // ✅ Mandar a edición; BusinessRegisterCompletePage cargará /providers/me con el token
      navigate("/empresas/registro/completar", {
        state: {
          authMode: "edit",
          loginEmail: email,
        },
      });
    } catch {
      // ✅ sin "err" para que ESLint no se queje (y tampoco lo necesitamos)
      setErrors((prev) => ({
        ...prev,
        general:
          "No se pudo conectar con el servidor. Revisa tu conexión o intenta más tarde.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    const email = formData.email.trim().toLowerCase();

    if (!email) {
      alert("Escribe primero tu correo y luego hacemos recuperación (modo demo).");
      return;
    }
    if (!validateEmail(email)) {
      alert("El correo no parece válido. Revísalo y vuelve a intentar.");
      return;
    }

    alert(`Recuperación de contraseña (modo demo) para: ${email}`);
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                />
                <span className="form__error">{errors.password}</span>

                <label className="form__toggle">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    disabled={isSubmitting}
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
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Accediendo..." : "Acceder"}
                </button>
              </div>

              <div className="auth-card__links">
                <button
                  type="button"
                  className="auth-card__link"
                  onClick={handleForgotPassword}
                  disabled={isSubmitting}
                >
                  Olvidé mi contraseña
                </button>

                <button
                  type="button"
                  className="auth-card__link auth-card__link--muted"
                  onClick={handleGoToRegister}
                  disabled={isSubmitting}
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