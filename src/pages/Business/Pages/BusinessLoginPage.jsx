// src/pages/Business/Pages/BusinessLoginPage.jsx
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../../../../Blocks/Business/BusinessAuth.css";
import Kelom from "../../../assets/web/logo/logoKelom.png";

const API_BASE = import.meta.env.VITE_API_URL || "https://api.kelom.com.mx";
const PROVIDER_TOKEN_KEY = "kelom_provider_token";
const PROVIDER_USER_KEY = "kelom_provider_user";

function getProviderToken() {
  try {
    return localStorage.getItem(PROVIDER_TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

function setProviderSession({ token, provider }) {
  try {
    if (token) localStorage.setItem(PROVIDER_TOKEN_KEY, token);
    if (provider) localStorage.setItem(PROVIDER_USER_KEY, JSON.stringify(provider));
  } catch {
    // ignore
  }
}

function clearProviderSession() {
  try {
    localStorage.removeItem(PROVIDER_TOKEN_KEY);
    localStorage.removeItem(PROVIDER_USER_KEY);
  } catch {
    // ignore
  }
}

function BusinessLoginPage() {
  const navigate = useNavigate();

  const [isCheckingSession, setIsCheckingSession] = useState(true);

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

  // ✅ Si ya hay token, no me hagas “volver a logearme”
  useEffect(() => {
    let cancelled = false;

    const token = getProviderToken();
    if (!token) {
      setIsCheckingSession(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/providers/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          // Solo borramos si el token realmente ya no sirve
          if (res.status === 401 || res.status === 403) {
            clearProviderSession();
          }
          return;
        }

        if (cancelled) return;

        // Refrescamos provider en localStorage (opcional, pero útil)
        if (data?.provider) {
          setProviderSession({ token, provider: data.provider });
        }

        // Redirige directo a edición
        navigate("/empresas/registro/completar");
      } finally {
        if (!cancelled) setIsCheckingSession(false);
      }
    })();

    return () => {
      cancelled = true;
    };
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
    if (!validateForm()) return;

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    try {
      const res = await fetch(`${API_BASE}/providers/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrors((prev) => ({
          ...prev,
          general: data?.error || "No se pudo iniciar sesión.",
        }));
        return;
      }

      setProviderSession({ token: data?.token, provider: data?.provider });

      navigate("/empresas/registro/completar");
    } catch {
      setErrors((prev) => ({
        ...prev,
        general: "Error de red. Intenta otra vez.",
      }));
    }
  };

  const handleForgotPassword = () => {
    alert("Aún no implementamos recuperación de contraseña (siguiente fase).");
  };

  const handleGoToRegister = () => {
    navigate("/empresas/registro");
  };

  if (isCheckingSession) {
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
              <h1 className="auth-card__title">Verificando sesión…</h1>
              <p className="auth-card__subtitle">
                Si ya estabas dentro, te regresamos a tu panel sin pedirte la contraseña.
              </p>
            </section>
          </div>
        </main>

        <footer className="business-auth__footer">
          © {new Date().getFullYear()} Kelom · Área para proveedores.
        </footer>
      </div>
    );
  }

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