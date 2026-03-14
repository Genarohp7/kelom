// src/pages/ResetPasswordPage.jsx
import { useMemo, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "https://api.kelom.com.mx";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const tokenFromUrl = useMemo(
    () => String(searchParams.get("token") || "").trim(),
    [searchParams]
  );

  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;

    const safeToken = String(token || "").trim();
    const safePassword = String(newPassword || "");
    const safeConfirm = String(confirmPassword || "");

    setError("");
    setSuccessMessage("");

    if (!safeToken) {
      setError("El enlace no contiene un token válido.");
      return;
    }

    if (!safePassword || !safeConfirm) {
      setError("Escribe y confirma tu nueva contraseña.");
      return;
    }

    if (safePassword.length < 5) {
      setError("La nueva contraseña debe tener al menos 5 caracteres.");
      return;
    }

    if (safePassword !== safeConfirm) {
      setError("La confirmación no coincide con la nueva contraseña.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: safeToken,
          newPassword: safePassword,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data?.error || `Error HTTP ${response.status}`);
        return;
      }

      setSuccessMessage(
        data?.message || "Contraseña restablecida correctamente."
      );

      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/acceso", { replace: true });
      }, 1800);
    } catch (err) {
      setError(String(err?.message || "No se pudo restablecer la contraseña."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="user-auth">
      <main className="business-auth__content">
        <div className="business-auth__container">
          <section className="auth-card">
            <h1 className="auth-card__title">Restablecer contraseña</h1>

            <p className="auth-card__subtitle">
              Escribe tu nueva contraseña para recuperar el acceso a tu cuenta.
            </p>

            <form className="form" onSubmit={handleSubmit} noValidate>
              <div className="form__field">
                <label className="form__label" htmlFor="reset-token">
                  Token de recuperación
                </label>
                <input
                  id="reset-token"
                  name="token"
                  type="text"
                  className="form__input"
                  value={token}
                  onChange={(e) => {
                    setToken(e.target.value);
                    setError("");
                    setSuccessMessage("");
                  }}
                  disabled={isSubmitting || Boolean(tokenFromUrl)}
                  autoComplete="off"
                />
              </div>

              <div className="form__field">
                <label className="form__label" htmlFor="new-password">
                  Nueva contraseña
                </label>
                <input
                  id="new-password"
                  name="newPassword"
                  type="password"
                  className="form__input"
                  placeholder="Mínimo 5 caracteres"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setError("");
                    setSuccessMessage("");
                  }}
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
              </div>

              <div className="form__field">
                <label className="form__label" htmlFor="confirm-new-password">
                  Confirmar nueva contraseña
                </label>
                <input
                  id="confirm-new-password"
                  name="confirmNewPassword"
                  type="password"
                  className="form__input"
                  placeholder="Repite tu nueva contraseña"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError("");
                    setSuccessMessage("");
                  }}
                  disabled={isSubmitting}
                  autoComplete="new-password"
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
                  {isSubmitting ? "Guardando..." : "Guardar nueva contraseña"}
                </button>
              </div>

              <div className="auth-card__links" style={{ gap: "0.85rem" }}>
                <Link to="/acceso" className="auth-card__link">
                  Ir a acceso de usuarios
                </Link>

                <Link to="/empresas/acceso" className="auth-card__link">
                  Ir a acceso de proveedores
                </Link>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

export default ResetPasswordPage;