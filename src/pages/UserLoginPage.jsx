// src/pages/UserLoginPage.jsx
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getToken, login, fetchMe, logout } from "../utils/auth.js";

function UserLoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      const token = getToken();
      if (!token) {
        if (!cancelled) setIsCheckingSession(false);
        return;
      }

      try {
        await fetchMe(); // valida token real contra backend
        if (!cancelled) navigate("/perfil", { replace: true });
      } catch {
        // token inválido/expirado o backend no responde
        logout(); // 👈 mata token zombie
      } finally {
        if (!cancelled) setIsCheckingSession(false);
      }
    }

    checkSession();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const email = form.email.trim();
    const password = form.password;

    if (!email || !password) {
      setError("Escribe tu correo y contraseña.");
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email, password); // POST /auth/login + guarda token
      navigate("/perfil", { replace: true });
    } catch (err) {
      setError(err?.message || "No se pudo iniciar sesión.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const forgotPasswordHref = `/recuperar-contrasena${
    form.email.trim() ? `?email=${encodeURIComponent(form.email.trim())}` : ""
  }`;

  if (isCheckingSession) {
    return (
      <div className="user-auth">
        <main className="business-auth__content">
          <div className="business-auth__container">
            <section className="auth-card">
              <p style={{ padding: "1.5rem" }}>Verificando sesión…</p>
            </section>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="user-auth">
      <main className="business-auth__content">
        <div className="business-auth__container">
          <section className="auth-card">
            <h1 className="auth-card__title">Inicia sesión</h1>
            <p className="auth-card__subtitle">
              Entra para ver y completar la información de tu boda.
            </p>

            <form className="form" onSubmit={handleSubmit} noValidate>
              <div className="form__field">
                <label className="form__label" htmlFor="email">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form__input"
                  placeholder="tucorreo@ejemplo.com"
                  value={form.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  autoComplete="email"
                />
              </div>

              <div className="form__field">
                <label className="form__label" htmlFor="password">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="form__input"
                  placeholder="Tu contraseña"
                  value={form.password}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="form__error" style={{ marginTop: "0.4rem" }}>
                  {error}
                </div>
              )}

              <div className="auth-card__actions">
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Accediendo…" : "Acceder"}
                </button>

                <Link
                  to={forgotPasswordHref}
                  className="btn btn--ghost"
                  aria-label="Ir a recuperación de contraseña"
                >
                  Olvidé mi contraseña
                </Link>
              </div>

              <div className="auth-card__links">
                <span className="auth-card__link--muted">
                  ¿Aún no tienes cuenta?
                </span>
                <Link to="/registro" className="auth-card__link">
                  Crear cuenta
                </Link>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

export default UserLoginPage;