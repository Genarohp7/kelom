import { useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import "../../../../Blocks/Business/BusinessAuth.css";
import "../../../../Blocks/Business/BusinessRegisterPage.css";
import Kelom from "../../../assets/web/logo/logoKelom.png";
import { sendBusinessRegisterEmails } from "../../../services/emailService";

const PROVIDER_BASIC_DRAFT_KEY = "kelom_provider_basic_draft";
const API_BASE = import.meta.env.VITE_API_URL || "https://api.kelom.com.mx";

function BusinessRegisterPage() {
  const navigate = useNavigate();
  const { token } = useParams();

  const isInvitationFlow = Boolean(token);

  console.log("INVITATION DEBUG", {
    token,
    isInvitationFlow,
    apiBase: API_BASE,
    validateUrl: `${API_BASE}/providers/invitations/${encodeURIComponent(
      token || ""
    )}/validate`,
  });

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
  const [isTermsChecked, setIsTermsChecked] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [isValidatingInvitation, setIsValidatingInvitation] = useState(isInvitationFlow);
  const [invitationError, setInvitationError] = useState("");
  const [invitationMeta, setInvitationMeta] = useState(null);

  useEffect(() => {
    if (!isInvitationFlow || !token) return;

    let ignore = false;

    async function validateInvitation() {
      setIsValidatingInvitation(true);
      setInvitationError("");

      console.log("VALIDATING INVITATION NOW...");

      try {
        const resp = await fetch(
          `${API_BASE}/providers/invitations/${encodeURIComponent(token)}/validate`,
          {
            method: "GET",
          }
        );

        let data = null;
        try {
          data = await resp.json();
        } catch {
          // ignore
        }

        console.log("INVITATION RESPONSE", {
          ok: resp.ok,
          status: resp.status,
          data,
        });

        if (!resp.ok) {
          if (ignore) return;
          setInvitationError(
            data?.error ||
              "Esta invitación no es válida, ya fue utilizada o ya expiró."
          );
          return;
        }

        const invitation = data?.invitation || null;

        if (!ignore) {
          setInvitationMeta(invitation);

          setBasicData((prev) => ({
            companyName: prev.companyName || invitation?.invited_company_name || "",
            ownerName: prev.ownerName || invitation?.invited_owner_name || "",
            phone: prev.phone || "",
            email: prev.email || invitation?.invited_email || "",
          }));
        }
      } catch (error) {
        console.error("Error al validar invitación:", error);
        if (!ignore) {
          setInvitationError(
            "No se pudo validar la invitación en este momento. Intenta de nuevo."
          );
        }
      } finally {
        if (!ignore) {
          setIsValidatingInvitation(false);
        }
      }
    }

    validateInvitation();

    return () => {
      ignore = true;
    };
  }, [isInvitationFlow, token]);

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

  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setFormError("");
    setBasicData((prev) => ({ ...prev, [name]: value }));
  };

  const saveBasicDraft = (payload) => {
    try {
      sessionStorage.setItem(PROVIDER_BASIC_DRAFT_KEY, JSON.stringify(payload));
    } catch (error) {
      console.warn("No se pudo guardar borrador de proveedor:", error);
    }
  };

  const mapLeadErrorMessage = (status, apiMessage) => {
    const msg = String(apiMessage || "").toLowerCase();

    if (status === 403 && msg.includes("cors")) {
      return "Bloqueado por CORS. Revisa allowedOrigins en el backend.";
    }

    if (msg.includes("teléfono")) {
      return "Ingresa un teléfono válido de 10 dígitos (sin secuencias ni repeticiones).";
    }

    if (msg.includes("email")) {
      return "Ingresa un correo electrónico válido.";
    }

    if (msg.includes("invitación")) {
      return apiMessage || "La invitación no es válida, ya fue utilizada o ya expiró.";
    }

    if (msg.includes("faltan") || msg.includes("obligatorios")) {
      return "Por favor, completa todos los campos obligatorios.";
    }

    if (status >= 500) {
      return "El servidor tuvo un problema. Intenta de nuevo en unos minutos.";
    }

    return apiMessage || "No se pudo guardar tu registro. Intenta de nuevo.";
  };

  const handleBasicSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (isInvitationFlow && (isValidatingInvitation || invitationError)) {
      setFormError(
        invitationError ||
          "No se puede continuar hasta validar correctamente la invitación."
      );
      return;
    }

    setFormError("");

    const companyName = basicData.companyName.trim();
    const ownerName = basicData.ownerName.trim();
    const phoneRaw = basicData.phone.trim();
    const email = basicData.email.trim();

    if (!companyName || !ownerName || !phoneRaw || !email) {
      setFormError("Por favor, completa todos los campos.");
      return;
    }

    if (!isValidPhone(phoneRaw)) {
      setFormError(
        "Ingresa un teléfono válido de 10 dígitos, sin secuencias ni repeticiones excesivas."
      );
      return;
    }

    if (!isValidEmail(email)) {
      setFormError("Ingresa un correo electrónico válido.");
      return;
    }

    if (!isPrivacyChecked && !isTermsChecked) {
      setFormError(
        "Para continuar debes aceptar el aviso de privacidad y la declaración de aceptación de términos y condiciones."
      );
      return;
    }

    if (!isPrivacyChecked) {
      setFormError("Para continuar debes aceptar el aviso de privacidad.");
      return;
    }

    if (!isTermsChecked) {
      setFormError(
        "Para continuar debes aceptar la declaración de aceptación de términos y condiciones."
      );
      return;
    }

    const nextBasicData = {
      companyName,
      ownerName,
      email: email.toLowerCase(),
      phone: phoneRaw.replace(/\D/g, ""),
    };

    const cleanPayload = {
      ...nextBasicData,
      acceptedPrivacy: isPrivacyChecked,
      acceptedTermsDeclaration: isTermsChecked,
      ...(isInvitationFlow && token ? { invitationToken: token } : {}),
    };

    saveBasicDraft(nextBasicData);
    setBasicData(nextBasicData);

    setIsSubmitting(true);

    try {
      const resp = await fetch(`${API_BASE}/providers/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanPayload),
      });

      let data = null;
      try {
        data = await resp.json();
      } catch {
        // ignore
      }

      if (!resp.ok) {
        const apiMsg = data?.error || data?.message || "";
        setFormError(mapLeadErrorMessage(resp.status, apiMsg));
        return;
      }

      try {
        await sendBusinessRegisterEmails(cleanPayload);
      } catch (err) {
        console.warn(
          "Lead guardado en backend, pero falló envío de correos (EmailJS):",
          err
        );
      }

      setShowThanks(true);
    } catch (error) {
      console.error("Error de red al guardar lead de proveedor:", error);
      setFormError(
        "No se pudo conectar con el servidor. Revisa tu internet o inténtalo de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isInvitationFlow && isValidatingInvitation) {
    return (
      <div className="business-register">
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
              Kelom · Registro por invitación
            </span>

            <span className="business-register__logo-pill">VALIDANDO</span>
          </div>
        </header>

        <main className="business-register__content">
          <div className="business-register__container">
            <section className="register-card">
              <p className="register-card__eyebrow">Invitación</p>
              <h1 className="register-card__title">Validando acceso</h1>
              <p className="register-card__subtitle">
                Estamos comprobando tu invitación para continuar con el registro.
              </p>
            </section>
          </div>
        </main>

        <footer className="business-register__footer">
          © {new Date().getFullYear()} Kelom · Área para proveedores.
        </footer>
      </div>
    );
  }

  if (isInvitationFlow && invitationError) {
    return (
      <div className="business-register">
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
              Kelom · Registro por invitación
            </span>

            <span className="business-register__logo-pill">NO DISPONIBLE</span>
          </div>
        </header>

        <main className="business-register__content">
          <div className="business-register__container">
            <section className="register-card">
              <p className="register-card__eyebrow">Invitación</p>
              <h1 className="register-card__title">Este enlace ya no está disponible</h1>
              <p className="register-card__subtitle">{invitationError}</p>

              <div className="register-card__actions">
                <NavLink to="/" className="btn btn--primary">
                  Volver al inicio
                </NavLink>
              </div>
            </section>
          </div>
        </main>

        <footer className="business-register__footer">
          © {new Date().getFullYear()} Kelom · Área para proveedores.
        </footer>
      </div>
    );
  }

  return (
    <div className="business-register">
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
            {isInvitationFlow
              ? "Kelom · Registro asistido por invitación"
              : "Kelom · Registro de empresa"}
          </span>

          <span className="business-register__logo-pill">
            {isInvitationFlow ? "INVITACIÓN" : "PASO 1 DE 2"}
          </span>
        </div>
      </header>

      <main className="business-register__content">
        <div className="business-register__container">
          <section className="register-card">
            <p className="register-card__eyebrow">
              {isInvitationFlow ? "Registro asistido" : "Alta inicial"}
            </p>

            <h1 className="register-card__title">Registra tu empresa</h1>

            <p className="register-card__subtitle">
              {isInvitationFlow
                ? "Completa este formulario inicial para que podamos continuar internamente con la creación de tu perfil en Kelom."
                : "Este primer paso es para avisarnos que te interesa formar parte de Kelom. Después podrás completar la ficha de tu negocio con más detalle."}
            </p>

            {isInvitationFlow && invitationMeta?.expires_at ? (
              <p className="register-card__subtitle">
                Esta invitación estará disponible hasta{" "}
                <strong>{new Date(invitationMeta.expires_at).toLocaleString()}</strong>.
              </p>
            ) : null}

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

              <div className="form__field form__field--full business-register__consent-stack">
                <div className="business-register__consent-row">
                  <input
                    id="businessPrivacyConsent"
                    type="checkbox"
                    checked={isPrivacyChecked}
                    onChange={(e) => {
                      setIsPrivacyChecked(e.target.checked);
                      setFormError("");
                    }}
                    className="business-register__consent-checkbox"
                  />

                  <label
                    htmlFor="businessPrivacyConsent"
                    className="form__label business-register__consent-label"
                  >
                    Acepto el{" "}
                    <NavLink
                      to="/legal/aviso-de-privacidad"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="business-register__legal-link"
                    >
                      aviso de privacidad
                    </NavLink>
                    .
                  </label>
                </div>

                <div className="business-register__consent-row">
                  <input
                    id="businessTermsConsent"
                    type="checkbox"
                    checked={isTermsChecked}
                    onChange={(e) => {
                      setIsTermsChecked(e.target.checked);
                      setFormError("");
                    }}
                    className="business-register__consent-checkbox"
                  />

                  <label
                    htmlFor="businessTermsConsent"
                    className="form__label business-register__consent-label"
                  >
                    Acepto la{" "}
                    <NavLink
                      to="/legal/aceptacion-de-terminos-y-condiciones"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="business-register__legal-link"
                    >
                      declaración de aceptación de términos y condiciones
                    </NavLink>
                    .
                  </label>
                </div>
              </div>

              {formError && (
                <div className="form__field form__field--full">
                  <span className="form__error">{formError}</span>
                </div>
              )}

              <div className="register-card__actions">
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={
                    !isPrivacyChecked ||
                    !isTermsChecked ||
                    isSubmitting ||
                    (isInvitationFlow && isValidatingInvitation)
                  }
                >
                  {isSubmitting ? "Guardando..." : "Registrar mi negocio"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>

      {showThanks && (
        <div
          className="business-register__modal-overlay"
          onClick={() => setShowThanks(false)}
        >
          <div
            className="register-card business-register__thanks-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="business-register__thanks-body">
              {isInvitationFlow ? (
                <>
                  <p className="register-card__eyebrow">
                    Gracias por confiar en Kelom
                  </p>

                  <h2 className="register-card__title">
                    Gracias, ya recibimos tu información
                  </h2>

                  <p className="register-card__subtitle">
                    Con esto podemos continuar con la creación de tu perfil en
                    Kelom. Nuestro equipo seguirá con el proceso y te contactará en
                    caso necesario.
                  </p>

                 

                  <div className="register-card__actions business-register__thanks-actions">
                    <NavLink to="/" className="btn btn--primary">
                      Volver al inicio
                    </NavLink>
                  </div>
                </>
              ) : (
                <>
                  <p className="register-card__eyebrow">
                    Gracias por confiar en Kelom
                  </p>

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
                    {basicData.phone ? ` o al teléfono ${basicData.phone}` : ""} para
                    acompañarte en el proceso.
                  </p>

                  <p className="register-card__subtitle">
                    Si quieres avanzar de una vez, puedes continuar con el llenado de
                    tu ficha de proveedor.
                  </p>

                  <div className="register-card__actions business-register__thanks-actions">
                    <NavLink to="/empresas" className="btn btn--ghost">
                      Volver al área de empresas
                    </NavLink>

                    <NavLink
                      to="/empresas/registro/completar"
                      className="btn btn--primary"
                      state={{
                        authMode: "register",
                        loginEmail: basicData.email,
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

                    <button
                      type="button"
                      className="btn btn--ghost"
                      onClick={() => {
                        setShowThanks(false);
                        navigate("/empresas/registro/completar", {
                          state: {
                            authMode: "register",
                            loginEmail: basicData.email,
                            basicData: {
                              companyName: basicData.companyName,
                              ownerName: basicData.ownerName,
                              email: basicData.email,
                              phone: basicData.phone,
                            },
                          },
                        });
                      }}
                    >
                      Continuar ahora
                    </button>
                  </div>
                </>
              )}
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