// src/pages/ForgotPasswordPage.jsx
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "https://api.kelom.com.mx";

function ForgotPasswordPage() {
  const [searchParams] = useSearchParams();

  const initialEmail = useMemo(
    () => String(searchParams.get("email") || "").trim(),
    [searchParams]
  );

  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;

    const normalizedEmail = String(email || "").trim().toLowerCase();

    setError("");
    setSuccessMessage("");

    if (!normalizedEmail) {
      setError("Escribe tu correo electrónico.");
      return;
    }

    if (!validateEmail(normalizedEmail)) {
      setError("El correo no tiene un formato válido.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data?.error || `Error HTTP ${response.status}`);
        return;
      }

      setSuccessMessage(
        data?.message ||
          "Si el correo existe, te enviaremos instrucciones para restablecer tu contraseña."
      );
    } catch (err) {
      setError(String(err?.message || "No se pudo procesar la solicitud."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="user-auth">
      <main className="business-auth__content">
        <div className="business-auth__container">
          <section className="auth-card">
            <h1 className="auth-card__title">Recuperar contraseña</h1>

            <p className="auth-card__subtitle">
              Escribe el correo de tu cuenta y, si existe en Kelom, te enviaremos
              instrucciones para crear una nueva contraseña.
            </p>

            <form className="form" onSubmit={handleSubmit} noValidate>
              <div className="form__field">
                <label className="form__label" htmlFor="forgot-email">
                  Correo electrónico
                </label>

                <input
                  id="forgot-email"
                  name="email"
                  type="email"
                  className="form__input"
                  placeholder="tucorreo@ejemplo.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                    setSuccessMessage("");
                  }}
                  disabled={isSubmitting}
                  autoComplete="email"
                />
              </div>

              {error && (
                <div className="form__error" style={{ marginTop: "0.4rem" }}>
                  {error}
                </div>
              )}

              {successMessage && (
                <div
                  className="form__error"
                  style={{ marginTop: "0.4rem", color: "green" }}
                >
                  {successMessage}
                </div>
              )}

              <div className="auth-card__actions">
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Enviando..." : "Enviar instrucciones"}
                </button>
              </div>

              <div className="auth-card__links" style={{ gap: "0.85rem" }}>
                <Link to="/acceso" className="auth-card__link">
                  Volver a acceso de usuarios
                </Link>

                <Link to="/empresas/acceso" className="auth-card__link">
                  Volver a acceso de proveedores
                </Link>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

export default ForgotPasswordPage;