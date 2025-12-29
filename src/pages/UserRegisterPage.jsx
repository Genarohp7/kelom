// src/pages/UserRegisterPage.jsx
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getCurrentUser, registerUserInitial } from "../utils/userStorage.js";

function UserRegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    fullName: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  // Si ya está logueado, lo mandamos al perfil
  useEffect(() => {
    const u = getCurrentUser();
    if (u) {
      navigate("/perfil");
    }
  }, [navigate]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmitError("");
  }

  function validate() {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.fullName.trim()) {
      newErrors.fullName = "Escribe tu nombre completo.";
    }

    if (!form.email.trim()) {
      newErrors.email = "El correo es obligatorio.";
    } else if (!emailRegex.test(form.email.trim())) {
      newErrors.email = "Escribe un correo válido.";
    }

    const phoneDigits = form.phone.replace(/\D/g, "");
    if (!phoneDigits) {
      newErrors.phone = "El teléfono es obligatorio.";
    } else if (phoneDigits.length !== 10) {
      newErrors.phone = "El teléfono debe tener exactamente 10 dígitos.";
    }

    if (!form.password) {
      newErrors.password = "La contraseña es obligatoria.";
    } else if (form.password.length < 5) {
      newErrors.password = "Mínimo 5 caracteres.";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Confirma tu contraseña.";
    } else if (form.confirmPassword !== form.password) {
      newErrors.confirmPassword = "Las contraseñas no coinciden.";
    }

    return newErrors;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const validation = validate();

    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    try {
      const phoneDigits = form.phone.replace(/\D/g, "");

      registerUserInitial({
        email: form.email,
        fullName: form.fullName,
        phone: phoneDigits,
        password: form.password,
      });

      // Usuario creado y logueado → vamos al paso 2
      navigate("/registro/completar");
    } catch (err) {
      setSubmitError(err.message || "No se pudo crear la cuenta.");
    }
  }

  return (
    <div className="user-auth">
      <header className="business-auth__header">
        <div className="business-auth__header-inner">
          <span className="business-auth__logo-text">Kelom</span>
          <span className="business-auth__logo-pill">Registro parejas</span>
          <span className="business-auth__logo-text">Paso 1 de 2</span>
        </div>
      </header>

      <main className="business-register__content">
        <div className="business-register__container">
          <section className="register-card">
            <p className="register-card__eyebrow">Alta inicial</p>
            <h1 className="register-card__title">Crea tu cuenta</h1>
            <p className="register-card__subtitle">
              Este primer paso crea tu acceso. Después podrás completar con
              calma los detalles de tu boda.
            </p>

            <form className="form" onSubmit={handleSubmit} noValidate>
              <div className="form__field">
                <label className="form__label" htmlFor="fullName">
                  Nombre completo *
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  className="form__input"
                  placeholder="Ej. Ana Martínez"
                  value={form.fullName}
                  onChange={handleChange}
                />
                <div className="form__error">{errors.fullName}</div>
              </div>

              <div className="form__field">
                <label className="form__label" htmlFor="email">
                  Correo electrónico *
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
                <div className="form__error">{errors.email}</div>
              </div>

              <div className="form__field">
                <label className="form__label" htmlFor="phone">
                  Teléfono de contacto *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="form__input"
                  placeholder="10 dígitos"
                  value={form.phone}
                  onChange={handleChange}
                />
                <div className="form__error">{errors.phone}</div>
              </div>

              <div className="form__field">
                <label className="form__label" htmlFor="password">
                  Contraseña *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="form__input"
                  placeholder="Mínimo 5 caracteres"
                  value={form.password}
                  onChange={handleChange}
                />
                <div className="form__error">{errors.password}</div>
              </div>

              <div className="form__field">
                <label className="form__label" htmlFor="confirmPassword">
                  Confirmar contraseña *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className="form__input"
                  value={form.confirmPassword}
                  onChange={handleChange}
                />
                <div className="form__error">{errors.confirmPassword}</div>
              </div>

              {submitError && (
                <div className="form__error" style={{ marginTop: "0.4rem" }}>
                  {submitError}
                </div>
              )}

              <div className="register-card__actions">
                <button type="submit" className="btn btn--primary">
                  Crear cuenta y continuar al paso 2
                </button>

                <p className="register-card__note">
                  ¿Ya tienes cuenta?{" "}
                  <Link to="/acceso" className="auth-card__link">
                    Inicia sesión aquí
                  </Link>
                  .
                </p>
              </div>
            </form>
          </section>
        </div>
      </main>

      <footer className="business-register__footer">
        Kelom · Ayudándote a organizar tu boda sin perder la cabeza.
      </footer>
    </div>
  );
}

export default UserRegisterPage;
