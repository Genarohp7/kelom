import { useState } from "react";
import { Link } from "react-router-dom";
import { savePendingRegistration } from "../utils/userStorage.js";
import { sendUserRegisterEmails } from "../services/emailService.js";

const privacySections = [
  {
    number: "1",
    title: "Responsable del tratamiento de datos personales",
    paragraphs: [
      'VISIÓN E IMAGEN CREATIVA APP S.A. DE C.V. (en adelante, “KELOM”), con domicilio en Av. Adolfo López Mateos número 506, Colonia Agua Azul, Municipio de Nezahualcóyotl, Estado de México, es responsable del tratamiento de los datos personales que recabe a través del sitio web www.kelom.com.mx.',
      "Para cualquier asunto relacionado con protección de datos personales, puedes contactarnos en el correo electrónico jcgerencialegal@kelom.com.mx.",
    ],
  },
  {
    number: "2",
    title: "Introducción",
    paragraphs: [
      "El presente Aviso de Privacidad tiene como finalidad informarte sobre la forma en que KELOM recopila, utiliza, protege y, en su caso, comparte tus datos personales, así como los derechos que puedes ejercer sobre ellos.",
      "Te recomendamos leer cuidadosamente este Aviso antes de utilizar el sitio web o proporcionar cualquier dato personal.",
      "KELOM podrá modificar el presente Aviso de Privacidad en cualquier momento para cumplir con actualizaciones legales, cambios en la operación del sitio o políticas internas. Las modificaciones estarán disponibles en el sitio web.",
    ],
  },
  {
    number: "3",
    title: "Datos personales que recopilamos",
    bullets: [
      "Datos de identificación: Nombre, apellidos, nombre comercial, fotografía, dirección IP, usuario en redes sociales.",
      "Datos de contacto: Correo electrónico, número telefónico, domicilio, ciudad o ubicación.",
      "Datos comerciales o profesionales (proveedores): Nombre del negocio, giro, servicios ofrecidos, ubicación, descripción, fotografías, portafolio, datos de contacto y perfil profesional.",
      "Datos financieros y de facturación (cuando aplique): Datos de pago, información bancaria, datos fiscales y comprobantes necesarios para procesar pagos de promoción premium.",
      "Contenido generado por el usuario: Fotografías, comentarios, reseñas, mensajes, formularios, solicitudes de contacto u otra información proporcionada voluntariamente.",
      "Datos técnicos y de navegación: Tipo de dispositivo, navegador, sistema operativo, cookies, páginas visitadas, actividad dentro del sitio y horarios de acceso.",
      "Datos de terceros: Si proporcionas datos personales de terceros, declaras contar con su autorización.",
    ],
    footer:
      "El usuario garantiza que los datos proporcionados son veraces y actualizados, siendo responsable por cualquier inexactitud.",
  },
  {
    number: "4",
    title: "Finalidades del tratamiento de datos personales",
    subsections: [
      {
        label: "Finalidades primarias (necesarias)",
        bullets: [
          "Permitir el registro de usuarios y proveedores en la plataforma.",
          "Publicar perfiles de proveedores y mostrar su información en el sitio.",
          "Facilitar el contacto directo entre usuarios y proveedores.",
          "Gestionar solicitudes de información o mensajes enviados mediante el sitio.",
          "Procesar pagos de promociones premium para proveedores.",
          "Emitir facturación cuando corresponda.",
          "Brindar soporte técnico y atención al cliente.",
          "Garantizar la seguridad del sitio y prevenir fraudes.",
        ],
      },
      {
        label: "Finalidades secundarias (opcionales)",
        bullets: [
          "Envío de promociones, novedades o comunicaciones comerciales.",
          "Mejorar la experiencia del usuario mediante análisis estadísticos.",
          "Personalizar contenido o publicidad dentro del sitio.",
          "Si no deseas que tus datos se utilicen para finalidades secundarias, puedes solicitarlo enviando un correo a jcgerencialegal@kelom.com.mx.",
        ],
      },
    ],
  },
  {
    number: "5",
    title: "Fuentes de obtención de datos personales",
    bullets: [
      "Directamente del usuario al registrarse, completar formularios o comunicarse con nosotros.",
      "Automáticamente mediante cookies u otras tecnologías de seguimiento.",
      "A través de redes sociales o plataformas de pago cuando el usuario interactúe mediante ellas.",
    ],
  },
  {
    number: "6",
    title: "Transferencia de datos personales",
    bullets: [
      "Con proveedores tecnológicos, hosting, pasarelas de pago y servicios necesarios para la operación del sitio.",
      "Con autoridades competentes cuando exista obligación legal.",
      "Entre usuarios y proveedores únicamente cuando se solicite contacto a través de la plataforma.",
    ],
    footer: "KELOM no vende datos personales a terceros.",
  },
  {
    number: "7",
    title: "Uso de cookies y tecnologías de seguimiento",
    bullets: [
      "Analizar el comportamiento de navegación.",
      "Mejorar el funcionamiento del sitio.",
      "Recordar preferencias del usuario.",
      "Mostrar contenido relevante.",
    ],
    footer:
      "Puedes desactivar las cookies desde la configuración de tu navegador, aunque esto podría afectar algunas funciones del sitio.",
  },
  {
    number: "8",
    title: "Derechos ARCO",
    paragraphs: [
      "Tienes derecho a acceder a tus datos personales, rectificarlos si son incorrectos, cancelarlos cuando no sean necesarios y oponerte a su tratamiento.",
      "Para ejercer tus derechos ARCO, envía una solicitud al correo _________________________________ incluyendo:",
    ],
    bullets: [
      "Nombre completo",
      "Medio para recibir respuesta",
      "Descripción clara del derecho a ejercer",
      "Documentos que acrediten tu identidad",
    ],
    footer:
      "KELOM responderá conforme a los plazos establecidos por la legislación mexicana.",
  },
  {
    number: "9",
    title: "Conservación de datos",
    paragraphs: [
      "Los datos personales se conservarán durante el tiempo necesario para cumplir las finalidades descritas y posteriormente por los plazos legales aplicables para atender responsabilidades legales, fiscales o contractuales.",
    ],
  },
  {
    number: "10",
    title: "Seguridad de la información",
    paragraphs: [
      "KELOM implementa medidas técnicas, administrativas y organizativas razonables para proteger los datos personales contra daño, pérdida, alteración, destrucción o acceso no autorizado.",
    ],
  },
  {
    number: "11",
    title: "Datos de menores",
    paragraphs: [
      "El sitio no está dirigido a menores de edad. Si detectamos datos de menores sin autorización de padres o tutores, serán eliminados.",
    ],
  },
  {
    number: "12",
    title: "Consentimiento",
    paragraphs: [
      "El uso del sitio web www.kelom.com.mx implica la aceptación del presente Aviso de Privacidad.",
    ],
  },
];

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
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowPrivacyPopup(true);
                      }}
                      className="user-register__privacy-link"
                    >
                      aviso de privacidad
                    </button>
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
                  Crear mi registro
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>

      {showPrivacyPopup && (
        <div
          className="privacy-modal"
          onClick={() => setShowPrivacyPopup(false)}
        >
          <div
            className="register-card privacy-modal__dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Aviso de Privacidad"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="privacy-modal__header">
              <div className="privacy-modal__top">
                <div className="privacy-modal__copy">
                  <span className="privacy-modal__pill">
                    Aviso de privacidad integral
                  </span>

                  <h2 className="register-card__title privacy-modal__title">
                    KELOM.COM.MX
                  </h2>

                  <p className="register-card__subtitle privacy-modal__subtitle">
                    Te compartimos este aviso de manera clara y ordenada para que
                    sepas qué datos recabamos, para qué los usamos y qué derechos
                    puedes ejercer respecto a ellos.
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn--ghost privacy-modal__close"
                  onClick={() => setShowPrivacyPopup(false)}
                >
                  Cerrar
                </button>
              </div>

              <div className="privacy-modal__summary-grid">
                <div className="privacy-modal__summary-card">
                  <div className="privacy-modal__summary-label">Responsable</div>
                  <div className="privacy-modal__summary-value">
                    VISIÓN E IMAGEN CREATIVA APP S.A. DE C.V.
                  </div>
                </div>

                <div className="privacy-modal__summary-card">
                  <div className="privacy-modal__summary-label">Contacto</div>
                  <div className="privacy-modal__summary-value">
                    jcgerencialegal@kelom.com.mx
                  </div>
                </div>

                <div className="privacy-modal__summary-card">
                  <div className="privacy-modal__summary-label">
                    Última actualización
                  </div>
                  <div className="privacy-modal__summary-value">11/03/2026</div>
                </div>
              </div>
            </div>

            <div className="privacy-modal__content">
              <div className="privacy-modal__sections">
                {privacySections.map((section) => (
                  <article className="privacy-modal__section" key={section.number}>
                    <div className="privacy-modal__section-head">
                      <span className="privacy-modal__section-number">
                        {section.number}
                      </span>

                      <h3 className="privacy-modal__section-title">
                        {section.title}
                      </h3>
                    </div>

                    {section.paragraphs?.map((paragraph, index) => (
                      <p
                        key={`${section.number}-p-${index}`}
                        className="privacy-modal__paragraph"
                      >
                        {paragraph}
                      </p>
                    ))}

                    {section.subsections?.map((subsection, index) => (
                      <div
                        key={`${section.number}-sub-${index}`}
                        className="privacy-modal__subsection"
                      >
                        <div className="privacy-modal__subsection-title">
                          {subsection.label}
                        </div>

                        <ul className="privacy-modal__list">
                          {subsection.bullets.map((bullet) => (
                            <li key={bullet}>{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}

                    {section.bullets && !section.subsections && (
                      <ul className="privacy-modal__list">
                        {section.bullets.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    )}

                    {section.footer && (
                      <p className="privacy-modal__section-footer">
                        {section.footer}
                      </p>
                    )}
                  </article>
                ))}
              </div>

              <div className="privacy-modal__updated">
                <p>
                  <strong>Fecha de última actualización:</strong> 11/03/2026
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserRegisterPage;