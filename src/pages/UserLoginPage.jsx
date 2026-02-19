// src/pages/UserLoginPage.jsx
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getCurrentUser, loginUser } from "../utils/userStorage.js";

function UserLoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const u = getCurrentUser();
    if (u) navigate("/perfil");
  }, [navigate]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
      setLoading(true);
      await loginUser(email, password);
      navigate("/perfil");
    } catch (err) {
      console.error(err);
      setError(err?.message || "Correo o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
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
                  disabled={loading}
                >
                  {loading ? "Entrando..." : "Acceder"}
                </button>

                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() =>
                    alert("En la versión actual aún no recuperamos contraseñas.")
                  }
                >
                  Olvidé mi contraseña
                </button>
              </div>

              <div className="auth-card__links">
                <span className="auth-card__link--muted">¿Aún no tienes cuenta?</span>
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
