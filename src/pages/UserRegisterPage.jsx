// src/pages/UserRegisterPage.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { registerUserInitial } from "../utils/userStorage.js";
import { sendUserRegisterEmails } from "../services/emailService.js"; // 👈 NUEVO

function UserRegisterPage() {
  const [form, setForm] = useState({
    email: "",
    fullName: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // ✅ Control del checkbox y del popup de aviso de privacidad
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

    // ✅ Validación de aviso de privacidad
    if (!isPrivacyChecked) {
      newErrors.privacy =
        "Para continuar debes aceptar nuestro aviso de privacidad.";
    }

    // En este paso aún no manejamos contraseña.
    return newErrors;
  }

  // 👇 async para poder usar await con EmailJS
  async function handleSubmit(e) {
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
        email: form.email.trim(),
        fullName: form.fullName.trim(),
        phone: phoneDigits,
        password: "", // de momento no usamos contraseña real
      });

      // 👇 Enviar correos (admin + bienvenida)
      await sendUserRegisterEmails({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: phoneDigits,
      });

      // Mostrar mensaje de agradecimiento
      setIsSubmitted(true);
    } catch (err) {
      console.error("Error al enviar correos de registro:", err);
      setSubmitError(
        "Ocurrió un problema al enviar tu información. Intenta de nuevo en unos minutos."
      );
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
                Hemos recibido tus datos. Muchas gracias por confiar en
                nosotros, nos pondremos en contacto a la brevedad para poder
                conocernos mejor.
              </p>
              <p className="register-card__subtitle">
                Te enviaremos un correo a <strong>{form.email}</strong> con un
                mensaje de bienvenida y algunas ideas para empezar a organizar
                tu boda.
              </p>
              <p className="register-card__subtitle">
                Si tu fecha está cerca o tienes una duda muy puntual, puedes
                escribirnos directamente y buscaremos la mejor forma de
                apoyarte.
              </p>

              <div className="register-card__actions">
                <Link to="/perfil" className="btn btn--primary">
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

              {/* ✅ Checkbox + link al aviso de privacidad */}
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
                  Crear mi Registro
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>

      {/* ✅ Popup de Aviso de Privacidad */}
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
            {/* Header del popup */}
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

            {/* Contenido scrollable */}
            <div
              style={{
                padding: "1.2rem 2rem 1.8rem",
                overflowY: "auto",
                fontSize: "0.9rem",
                lineHeight: 1.5,
              }}
            >
              {/* ... mismo texto largo que ya tenías ... */}
              <p className="register-card__subtitle">
                Al firmar el presente aviso de privacidad Usted otorga su
                consentimiento expreso en relación con lo siguiente:
              </p>

              <p className="register-card__subtitle">
                Kelom.com.mx, señalando como domicilio convencional para los
                efectos relacionados con el presente aviso, el ubicado en Calle
                21, N° 2020, Colonia Las Águilas, Ciudad México, Municipio
                Nezahualcóyotl, C.P. 57900, en el Estado de México, México, hace
                de su conocimiento que sus datos personales serán protegidos de
                acuerdo a lo establecido por la Ley Federal de Protección de
                Datos Personales en Posesión de los Particulares, así como por
                nuestra política de privacidad y que el tratamiento que se haga
                de sus datos será con la finalidad, enunciando sin limitar, de
                dar cumplimiento a la realización de actividades propias de
                Kelom.com.mx, relacionadas y derivadas de nuestro objeto social,
                así como para fines comerciales y promocionales.
              </p>

              {/* ... resto del texto exactamente igual ... */}

              <p className="register-card__subtitle">
                La aceptación del presente Aviso de Privacidad está sujeta al
                llenado de la casilla denominada Aviso de Privacidad, la cual,
                una vez llenada y enviada por los medios electrónicos o por
                cualquier otra tecnología del dominio de Kelom.com.mx, hace las
                veces de consentimiento expreso tanto de la aceptación del uso
                de datos personales del presente aviso de privacidad como de la
                transferencia de datos personales a personas, empresas y
                organizaciones distintas al responsable de conformidad con los
                fines señalados en el presente aviso de privacidad.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserRegisterPage;
