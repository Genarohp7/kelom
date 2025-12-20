// src/pages/UserLoginPage.jsx
import "../../src/styles/global.css";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { findUserByEmail, setCurrentUserEmail } from "../utils/userStorage.js";

function UserLoginPage() {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setGlobalError("");
  }

  function validate() {
    const newErrors = {};

    if (!formValues.email.trim()) {
      newErrors.email = "Ingresa tu correo electrónico.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email.trim())) {
      newErrors.email = "Escribe un correo válido.";
    }

    if (!formValues.password) {
      newErrors.password = "Ingresa tu contraseña.";
    } else if (formValues.password.length < 5) {
      newErrors.password = "La contraseña debe tener al menos 5 caracteres.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    const user = findUserByEmail(formValues.email);
    if (!user || user.password !== formValues.password) {
      setGlobalError("Correo o contraseña incorrectos.");
      return;
    }

    setCurrentUserEmail(user.email);
    navigate("/mi-perfil");
  }

  function handleForgotPassword() {
    alert(
      "Por ahora no tenemos recuperación automática de contraseña.\n" +
        "Como todo es local, puedes crear otra cuenta con un correo distinto."
    );
  }

  return (
    <div className="user-auth">
      <div className="user-auth__container">
        <div className="user-auth__grid">
          <section className="auth-card">
            <h1 className="auth-card__title">Accede a tu cuenta</h1>
            <p className="auth-card__subtitle">
              Revisa la información de tu boda y sigue llenando tu perfil cuando
              quieras.
            </p>

            <form className="form" onSubmit={handleSubmit} noValidate>
              <div className="form__field form__field--full">
                <label className="form__label" htmlFor="email">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form__input"
                  placeholder="tucorreo@ejemplo.com"
                  value={formValues.email}
                  onChange={handleChange}
                />
                <div className="form__error">{errors.email}</div>
              </div>

              <div className="form__field form__field--full">
                <label className="form__label" htmlFor="password">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="form__input"
                  placeholder="Tu contraseña"
                  value={formValues.password}
                  onChange={handleChange}
                />
                <div className="form__error">{errors.password}</div>
              </div>

              {globalError && (
                <div className="form__error" style={{ marginTop: "0.4rem" }}>
                  {globalError}
                </div>
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

                <Link to="/registro" className="auth-card__link">
                  Crear una cuenta nueva
                </Link>
              </div>
            </form>
          </section>

          <aside className="preview-card">
            <h2 className="preview-card__title">Tu espacio en Kelom</h2>
            <p className="preview-card__subtitle">
              Una cuenta para organizar tu boda con más calma:
            </p>
            <ul className="preview-card__text">
              <li>• Datos básicos de la boda.</li>
              <li>• Invitad@s, fecha, presupuesto aproximado.</li>
              <li>• Tus principales dudas para poder ayudarte mejor.</li>
            </ul>
            <p
              className="preview-card__text"
              style={{ marginTop: "0.8rem", fontSize: "0.9rem" }}
            >
              Todo se guarda en tu navegador usando localStorage. Más adelante,
              cuando conectemos la base de datos, esto se irá a un panel real.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default UserLoginPage;
