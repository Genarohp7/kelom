// src/pages/AdminLoginPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin, adminFetchMe, adminLogout, hasAdminToken } from "../utils/adminAuth.js";

function AdminLoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      if (!hasAdminToken()) {
        if (!cancelled) setIsCheckingSession(false);
        return;
      }

      try {
        await adminFetchMe();
        if (!cancelled) navigate("/admin", { replace: true });
      } catch {
        adminLogout();
      } finally {
        if (!cancelled) setIsCheckingSession(false);
      }
    }

    check();
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
      await adminLogin(email, password);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err?.message || "No se pudo iniciar sesión.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isCheckingSession) {
    return (
      <div className="admin-auth">
        <main className="business-auth__content">
          <div className="business-auth__container">
            <section className="auth-card">
              <p style={{ padding: "1.5rem" }}>Verificando sesión admin…</p>
            </section>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-auth">
      <main className="business-auth__content">
        <div className="business-auth__container">
          <section className="auth-card">
            <h1 className="auth-card__title">Panel Admin</h1>
            <p className="auth-card__subtitle">Acceso restringido. Si no eres admin, ni lo intentes.</p>

            <form className="form" onSubmit={handleSubmit} noValidate>
              <div className="form__field">
                <label className="form__label" htmlFor="email">
                  Correo
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form__input"
                  placeholder="admin@kelom.com.mx"
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
                  placeholder="••••••••••••••••"
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
                <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
                  {isSubmitting ? "Entrando…" : "Entrar"}
                </button>

                <button
                  type="button"
                  className="btn btn--ghost"
                  disabled={isSubmitting}
                  onClick={() => navigate("/", { replace: true })}
                >
                  Volver al sitio
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

export default AdminLoginPage;