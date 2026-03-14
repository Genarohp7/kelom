// src/pages/Business/Pages/BusinessLoginPage.jsx
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation, Link } from "react-router-dom";
import "../../../../Blocks/Business/BusinessAuth.css";
import Kelom from "../../../assets/web/logo/logoKelom.png";
import {
  getProviderToken,
  setProviderSession,
  clearProviderSession,
  getProviderUser,
} from "../../../services/providerAuth";

const API_BASE = import.meta.env.VITE_API_URL || "https://api.kelom.com.mx";

function BusinessLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: "", password: "" });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  // ✅ Si ya hay token, no tiene sentido pedir login: te mando directo a edición
  useEffect(() => {
    const token = getProviderToken();
    if (!token) return;

    navigate("/empresas/registro/completar", {
      replace: true,
      state: {
        authMode: "edit",
        loginEmail: getProviderUser()?.email || "",
      },
    });
  }, [navigate]);

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (!validateForm()) return;

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    setErrors((prev) => ({ ...prev, general: "" }));

    try {
      setIsSubmitting(true);

      const res = await fetch(`${API_BASE}/providers/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = data?.error || `Error HTTP ${res.status}`;
        setErrors((prev) => ({ ...prev, general: msg }));
        return;
      }

      setProviderSession({ token: data?.token, provider: data?.provider });

      // Si venías rebotado desde una ruta protegida, regresamos ahí.
      const from = location.state?.from;
      if (typeof from === "string" && from.startsWith("/")) {
        navigate(from, { replace: true });
        return;
      }

      navigate("/empresas/registro/completar", {
        replace: true,
        state: { authMode: "edit", loginEmail: email },
      });
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        general: String(err?.message || "No se pudo iniciar sesión."),
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToRegister = () => {
    navigate("/empresas/registro");
  };

  const handleLogout = () => {
    clearProviderSession();
    setFormData({ email: "", password: "" });
    setErrors({ email: "", password: "", general: "" });
    alert("Sesión cerrada.");
  };

  const hasToken = !!getProviderToken();

  const forgotPasswordHref = `/recuperar-contrasena${
    formData.email.trim() ? `?email=${encodeURIComponent(formData.email.trim())}` : ""
  }`;

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

          {hasToken && (
            <button
              type="button"
              className="btn btn--ghost"
              onClick={handleLogout}
              style={{ marginLeft: "auto" }}
            >
              Cerrar sesión
            </button>
          )}
        </div>
      </header>

      <main className="business-auth__content">
        <div className="business-auth__container">
          <section className="auth-card">
            <h1 className="auth-card__title">Acceso para proveedores</h1>
            <p className="auth-card__subtitle">
              Ingresa con tu correo y contraseña para administrar tu perfil en Kelom.
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
                <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
                  {isSubmitting ? "Accediendo..." : "Acceder"}
                </button>
              </div>

              <div className="auth-card__links">
                <Link
                  to={forgotPasswordHref}
                  className="auth-card__link"
                  aria-label="Ir a recuperación de contraseña"
                >
                  Olvidé mi contraseña
                </Link>

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