// src/pages/UserRegisterPage.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { savePendingRegistration } from "../utils/userStorage.js";
import { sendUserRegisterEmails } from "../services/emailService.js";

function UserRegisterPage() {
  

  const [form, setForm] = useState({
    email: "",
    fullName: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [isPrivacyChecked, setIsPrivacyChecked] = useState(false);
  const [showPrivacyPopup, setShowPrivacyPopup] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmitError("");
  }

  function validate() {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.fullName.trim()) newErrors.fullName = "Escribe tu nombre completo.";

    if (!form.email.trim()) newErrors.email = "El correo es obligatorio.";
    else if (!emailRegex.test(form.email.trim()))
      newErrors.email = "Escribe un correo válido.";

    const phoneDigits = form.phone.replace(/\D/g, "");
    if (!phoneDigits) newErrors.phone = "El teléfono es obligatorio.";
    else if (phoneDigits.length !== 10)
      newErrors.phone = "El teléfono debe tener exactamente 10 dígitos.";

    if (!isPrivacyChecked) {
      newErrors.privacy = "Para continuar debes aceptar nuestro aviso de privacidad.";
    }

    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validation = validate();

    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    try {
      const phoneDigits = form.phone.replace(/\D/g, "");
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: phoneDigits,
      };

      // Guardamos el “pendiente” para que el paso 2 ya tenga datos
      savePendingRegistration(payload);

      // Emails (admin + welcome)
      await sendUserRegisterEmails(payload);

      setIsSubmitted(true);
    } catch (err) {
      console.error("Error al enviar correos de registro:", err);
      setSubmitError(
        "Ocurrió un problema al enviar tu información. Intenta de nuevo en unos minutos."
      );
    }
  }

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
                Hemos recibido tus datos. Muchas gracias por confiar en nosotros.
              </p>
              <p className="register-card__subtitle">
                Te enviaremos un correo a <strong>{form.email}</strong> con un mensaje
                de bienvenida y algunas ideas para empezar.
              </p>

              <div className="register-card__actions">
                <Link to="/registro/completar" className="btn btn--primary">
                  Continuar con registro
                </Link>
                <Link to="/" className="btn btn--ghost">
                  Volver al inicio
                </Link>
              </div>
            </section>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="user-auth">
      <main className="business-register__content">
        <div className="business-register__container">
          <section className="register-card">
            <p className="register-card__eyebrow">Alta inicial</p>
            <h1 className="register-card__title">Regístrate con nosotros</h1>
            <p className="register-card__subtitle">
              Recibirás información útil para que tu gran día sea como lo sueñas.
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
                <label className="form__label">
                  <input
                    type="checkbox"
                    checked={isPrivacyChecked}
                    onChange={(e) => {
                      setIsPrivacyChecked(e.target.checked);
                      setErrors((prev) => ({ ...prev, privacy: "" }));
                    }}
                    style={{ marginRight: "0.6rem" }}
                  />
                  <span>
                    Acepto el{" "}
                    <button
                      type="button"
                      onClick={() => setShowPrivacyPopup(true)}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        margin: 0,
                        cursor: "pointer",
                        textDecoration: "underline",
                        font: "inherit",
                      }}
                    >
                      aviso de privacidad
                    </button>
                    .
                  </span>
                </label>
                <div className="form__error">{errors.privacy}</div>
              </div>

              {submitError && (
                <div className="form__error" style={{ marginTop: "0.4rem" }}>
                  {submitError}
                </div>
              )}

              <div className="register-card__actions">
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={!isPrivacyChecked}
                >
                  Crear mi registro
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>

      {showPrivacyPopup && (
        <div
          className="privacy-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1.5rem",
          }}
        >
          <div
            className="register-card"
            style={{
              maxWidth: "900px",
              width: "100%",
              maxHeight: "80vh",
              background: "#ffffff",
              borderRadius: "16px",
              boxShadow: "0 20px 45px rgba(15, 23, 42, 0.35)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "1.8rem 2rem 1.2rem",
                borderBottom: "1px solid rgba(148, 163, 184, 0.35)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <h2
                className="register-card__title"
                style={{ marginBottom: 0, fontSize: "1.4rem" }}
              >
                Aviso de Privacidad
              </h2>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setShowPrivacyPopup(false)}
              >
                Cerrar
              </button>
            </div>

            <div
              style={{
                padding: "1.2rem 2rem 1.8rem",
                overflowY: "auto",
                fontSize: "0.9rem",
                lineHeight: 1.5,
              }}
            >
              <p className="register-card__subtitle">
                (Aquí va tu texto completo del aviso tal cual lo tengas.)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserRegisterPage;
