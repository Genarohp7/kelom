// src/pages/Business/Pages/BusinessRegisterPage.jsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "../../../../Blocks/Business/BusinessAuth.css";
import Kelom from "../../../assets/web/logo/logoKelom.png";
import { sendBusinessRegisterEmails } from "../../../services/emailService";

const PROVIDER_BASIC_DRAFT_KEY = "kelom_provider_basic_draft";

function BusinessRegisterPage() {
  const [basicData, setBasicData] = useState(() => {
    try {
      const draft = sessionStorage.getItem(PROVIDER_BASIC_DRAFT_KEY);

      if (!draft) {
        return {
          companyName: "",
          ownerName: "",
          phone: "",
          email: "",
        };
      }

      const parsed = JSON.parse(draft);

      return {
        companyName: parsed.companyName || "",
        ownerName: parsed.ownerName || "",
        phone: parsed.phone || "",
        email: parsed.email || "",
      };
    } catch (error) {
      console.warn("No se pudo recuperar borrador de proveedor:", error);
      return {
        companyName: "",
        ownerName: "",
        phone: "",
        email: "",
      };
    }
  });

  const [showThanks, setShowThanks] = useState(false);
  const [isPrivacyChecked, setIsPrivacyChecked] = useState(false);
  const [showPrivacyPopup, setShowPrivacyPopup] = useState(false);

  // ========== VALIDACIONES ==========
  const isValidPhone = (phone) => {
    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length !== 10) return false;

    if (/(.)\1{4,}/.test(digitsOnly)) return false;

    const ascSeq = "0123456789";
    const descSeq = "9876543210";
    for (let i = 0; i <= digitsOnly.length - 6; i++) {
      const slice = digitsOnly.slice(i, i + 6);
      if (ascSeq.includes(slice) || descSeq.includes(slice)) return false;
    }

    return true;
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // ========== HANDLERS ==========
  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setBasicData((prev) => ({ ...prev, [name]: value }));
  };

  const saveBasicDraft = (payload) => {
    try {
      sessionStorage.setItem(PROVIDER_BASIC_DRAFT_KEY, JSON.stringify(payload));
    } catch (error) {
      console.warn("No se pudo guardar borrador de proveedor:", error);
    }
  };

  // ========== SUBMIT PASO 1 ==========
  const handleBasicSubmit = async (e) => {
    e.preventDefault();

    const companyName = basicData.companyName.trim();
    const ownerName = basicData.ownerName.trim();
    const phone = basicData.phone.trim();
    const email = basicData.email.trim();

    if (!companyName || !ownerName || !phone || !email) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    if (!isValidPhone(phone)) {
      alert(
        "Ingresa un teléfono válido de 10 dígitos, sin secuencias ni repeticiones excesivas."
      );
      return;
    }

    if (!isValidEmail(email)) {
      alert("Ingresa un correo electrónico válido.");
      return;
    }

    if (!isPrivacyChecked) {
      alert("Para continuar debes aceptar nuestro aviso de privacidad.");
      return;
    }

    const cleanPayload = {
      companyName,
      ownerName,
      email,
      phone: phone.replace(/\D/g, ""),
    };

    // guardamos borrador para el paso 2
    saveBasicDraft(cleanPayload);
    setBasicData(cleanPayload);

    try {
      await sendBusinessRegisterEmails(cleanPayload);
      setShowThanks(true);
    } catch (error) {
      console.error("Error al enviar correos de registro de proveedor:", error);
      alert(
        "Tu registro se guardó en modo demo, pero hubo un problema al enviar los correos. Lo revisaremos más tarde."
      );
      setShowThanks(true);
    }
  };

  return (
    <div className="business-register">
      {/* HEADER */}
      <header className="business-register__header">
        <div className="container business-register__header-inner">
          <NavLink
            to="/"
            className="business-register__logo-link"
            aria-label="Volver al inicio de Kelom"
          >
            <img src={Kelom} alt="Logo Kelom" title="Kelom" />
          </NavLink>

          <span className="business-register__logo-text">
            Kelom · Registro de empresa
          </span>

          <span className="business-register__logo-pill">PASO 1 DE 2</span>
        </div>
      </header>

      {/* PASO 1 */}
      <main className="business-register__content">
        <div className="business-register__container">
          <section className="register-card">
            <p className="register-card__eyebrow">Alta inicial</p>
            <h1 className="register-card__title">Registra tu empresa</h1>
            <p className="register-card__subtitle">
              Este primer paso es para avisarnos que te interesa formar parte de
              Kelom. Después podrás completar la ficha de tu negocio con más
              detalle.
            </p>

            <form
              className="form form--grid"
              onSubmit={handleBasicSubmit}
              noValidate
            >
              <div className="form__field form__field--full">
                <label className="form__label" htmlFor="companyName">
                  Nombre de la empresa
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  className="form__input"
                  placeholder="Ej. Jardín Las Bugambilias"
                  value={basicData.companyName}
                  onChange={handleBasicChange}
                  required
                />
                <span className="form__error" />
              </div>

              <div className="form__field form__field--full">
                <label className="form__label" htmlFor="ownerName">
                  Nombre de la persona responsable
                </label>
                <input
                  id="ownerName"
                  name="ownerName"
                  type="text"
                  className="form__input"
                  placeholder="Nombre y apellido"
                  value={basicData.ownerName}
                  onChange={handleBasicChange}
                  required
                />
                <span className="form__error" />
              </div>

              <div className="form__field">
                <label className="form__label" htmlFor="phone">
                  Teléfono de contacto
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="form__input"
                  placeholder="10 dígitos"
                  value={basicData.phone}
                  onChange={handleBasicChange}
                  required
                />
                <span className="form__error" />
              </div>

              <div className="form__field">
                <label className="form__label" htmlFor="email">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form__input"
                  placeholder="tucorreo@empresa.com"
                  value={basicData.email}
                  onChange={handleBasicChange}
                  required
                />
                <span className="form__error" />
              </div>

              {/* Checkbox aviso */}
              <div className="form__field form__field--full">
                <label className="form__label">
                  <input
                    type="checkbox"
                    checked={isPrivacyChecked}
                    onChange={(e) => setIsPrivacyChecked(e.target.checked)}
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
              </div>

              <div className="register-card__actions">
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={!isPrivacyChecked}
                >
                  Registrar mi negocio
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>

      {/* POPUP DE AGRADECIMIENTO */}
      {showThanks && (
        <div
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
              maxWidth: "560px",
              width: "100%",
              background: "#ffffff",
              borderRadius: "16px",
              boxShadow: "0 20px 45px rgba(15, 23, 42, 0.35)",
            }}
          >
            <div style={{ padding: "1.8rem 2rem" }}>
              <p className="register-card__eyebrow">Gracias por confiar en Kelom</p>
              <h2 className="register-card__title">
                {basicData.companyName
                  ? `¡${basicData.companyName} ya está en nuestro radar!`
                  : "¡Tu negocio ya está en nuestro radar!"}
              </h2>

              <p className="register-card__subtitle">
                Recibimos tu registro inicial y lo revisaremos con calma para
                entender mejor tu negocio y cómo presentarte dentro del catálogo
                de Kelom.
              </p>

              <p className="register-card__subtitle">
                Te contactaremos al correo <strong>{basicData.email}</strong>
                {basicData.phone ? ` o al teléfono ${basicData.phone}` : ""}{" "}
                para acompañarte en el proceso.
              </p>

              <p className="register-card__subtitle">
                Si quieres avanzar de una vez, puedes continuar con el llenado de
                tu ficha de proveedor.
              </p>

              <div
                className="register-card__actions"
                style={{ marginTop: "1.2rem", gap: "0.7rem" }}
              >
                <NavLink to="/empresas" className="btn btn--ghost">
                  Volver al área de empresas
                </NavLink>

                <NavLink
                  to="/empresas/registro/completar"
                  className="btn btn--primary"
                  state={{
                    basicData: {
                      companyName: basicData.companyName,
                      ownerName: basicData.ownerName,
                      email: basicData.email,
                      phone: basicData.phone,
                    },
                  }}
                >
                  Continuar con registro
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP DE AVISO DE PRIVACIDAD */}
      {showPrivacyPopup && (
        <div
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
              {/* 👇 PEGA AQUÍ EL TEXTO LEGAL COMPLETO QUE YA TIENES EN TU ARCHIVO ACTUAL */}
              <p className="register-card__subtitle">
                (Pega aquí el contenido completo de tu aviso de privacidad actual.)
              </p>
            </div>
          </div>
        </div>
      )}

      <footer className="business-register__footer">
        © {new Date().getFullYear()} Kelom · Área para proveedores.
      </footer>
    </div>
  );
}

export default BusinessRegisterPage;