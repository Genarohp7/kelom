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
    else if (!emailRegex.test(form.email.trim())) {
      newErrors.email = "Escribe un correo válido.";
    }

    const phoneDigits = form.phone.replace(/\D/g, "");
    if (!phoneDigits) newErrors.phone = "El teléfono es obligatorio.";
    else if (phoneDigits.length !== 10) {
      newErrors.phone = "El teléfono debe tener exactamente 10 dígitos.";
    }

    if (!isPrivacyChecked) {
      newErrors.privacy =
        "Para continuar debes aceptar nuestro aviso de privacidad.";
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

      savePendingRegistration(payload);
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
                Recibimos tus datos. Ya puedes continuar con tu registro para
                comenzar a organizar tu boda con más claridad.
              </p>
              <p className="register-card__subtitle">
                También enviaremos un correo a <strong>{form.email}</strong> con
                información para dar los primeros pasos en Kelom.
              </p>

              <div className="register-card__actions">
                <Link to="/registro/completar" className="btn btn--primary">
                  Continuar y planear mi boda
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
            <p className="register-card__eyebrow">Registro sin costo</p>
            <h1 className="register-card__title">
              Comienza a planear tu boda con Kelom
            </h1>
            <p className="register-card__subtitle">
              Cuéntanos sobre tu evento y te ayudaremos a empezar con claridad,
              orientación y acceso progresivo a proveedores para boda.
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
                <div className="user-register__privacy-consent">
                  <input
                    id="privacyConsent"
                    type="checkbox"
                    checked={isPrivacyChecked}
                    onChange={(e) => {
                      setIsPrivacyChecked(e.target.checked);
                      setErrors((prev) => ({ ...prev, privacy: "" }));
                    }}
                    className="user-register__privacy-checkbox"
                  />

                  <label
                    htmlFor="privacyConsent"
                    className="form__label user-register__privacy-label"
                  >
                    Acepto el{" "}
                    <Link
                      to="/legal/aviso-de-privacidad"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="user-register__privacy-link"
                    >
                      aviso de privacidad
                    </Link>
                    .
                  </label>
                </div>

                <div className="form__error">{errors.privacy}</div>
              </div>

              {submitError && (
                <div className="form__error user-register__submit-error">
                  {submitError}
                </div>
              )}

              <div className="register-card__actions">
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={!isPrivacyChecked}
                >
                  Comenzar a planear mi boda
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

export default UserRegisterPage;