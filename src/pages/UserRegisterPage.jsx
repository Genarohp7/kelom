// src/pages/UserRegisterPage.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { registerUserInitial } from "../utils/userStorage.js";

function UserRegisterPage() {
  const [form, setForm] = useState({
    email: "",
    fullName: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

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

    // No validamos contraseña porque los campos están desactivados.
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

      // Pre-registro local por si luego quieres usarlo
      registerUserInitial({
        email: form.email,
        fullName: form.fullName,
        phone: phoneDigits,
        password: "", // de momento no usamos contraseña real
      });

      // Mostrar mensaje de agradecimiento
      setIsSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || "No se pudo crear la cuenta.");
    }
  }

  // 🔹 Vista de agradecimiento después de enviar
  if (isSubmitted) {
    return (
      <div className="user-auth">
        <main className="business-register__content">
          <div className="business-register__container">
            <section className="register-card">
              <h1 className="register-card__title">
                Gracias, {form.fullName || "pareja"} 🤍
              </h1>
              <p className="register-card__subtitle">
                Hemos recibido tus datos Muchas gracias por confiar en nosotros,
                nos pondremos en contacto a la brevedad para poder conocernos
                mejor.
              </p>
              <p className="register-card__subtitle">
                Te enviaremos un correo a <strong>{form.email}</strong> con un
                mensaje de bienvenida y algunas ideas para empezar a organizar
                tu boda
              </p>
              <p className="register-card__subtitle">
                Si tu fecha está cerca o tienes una duda muy puntual, puedes
                escribirnos directamente y buscaremos la mejor forma de
                apoyarte.
              </p>

              <div className="register-card__actions">
                <Link to="/" className="btn btn--primary">
                  Volver al inicio
                </Link>
              </div>
            </section>
          </div>
        </main>
      </div>
    );
  }

  // 🔹 Vista normal del formulario
  return (
    <div className="user-auth">
      <main className="business-register__content">
        <div className="business-register__container">
          <section className="register-card">
            <p className="register-card__eyebrow">Alta inicial</p>
            <h1 className="register-card__title">Registrate con nosotros </h1>
            <p className="register-card__subtitle">
              Rcibiras informacion Util para que tu gran dia sea como lo dueñas
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

              {/* Contraseña y confirmación se quedan listas pero desactivadas por ahora
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
              */}

              {submitError && (
                <div className="form__error" style={{ marginTop: "0.4rem" }}>
                  {submitError}
                </div>
              )}

              <div className="register-card__actions">
                <button type="submit" className="btn btn--primary">
                  Crear mi Registro
                </button>

                {/* 
                <p className="register-card__note">
                  ¿Ya tienes cuenta?{" "}
                  <Link to="/acceso" className="auth-card__link">
                    Inicia sesión aquí
                  </Link>
                  .
                </p> 
                */}
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

export default UserRegisterPage;
