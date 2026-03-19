import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../../../../Blocks/Business/BusinessAuth.css";
import "../../../../Blocks/Business/BusinessRegisterPage.css";
import Kelom from "../../../assets/web/logo/logoKelom.png";
import { sendBusinessRegisterEmails } from "../../../services/emailService";

const PROVIDER_BASIC_DRAFT_KEY = "kelom_provider_basic_draft";
const API_BASE = import.meta.env.VITE_API_URL || "https://api.kelom.com.mx";

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

const termsSections = [
  {
    number: "1",
    title: "Identidad del titular y aceptación",
    paragraphs: [
      "El sitio web www.kelom.com.mx (en adelante, el “Sitio” o la “Plataforma”) es operado por VISIÓN E IMAGEN CREATIVA APP S.A. DE C.V. (en adelante, “KELOM”), con domicilio en Av. Adolfo López Mateos número 506, Colonia Agua Azul, Municipio de Nezahualcóyotl, Estado de México.",
      "El acceso, navegación, registro y/o utilización del Sitio atribuye la condición de Usuario a quien lo utiliza, e implica la aceptación plena y sin reservas de las presentes Condiciones de Uso, así como del Aviso de Privacidad, la Política de No Discriminación y cualesquiera otras políticas o avisos publicados en el Sitio (en conjunto, las “Condiciones Legales”).",
      "Si el Usuario no está de acuerdo con estas Condiciones de Uso, deberá abstenerse de utilizar el Sitio.",
    ],
  },
  {
    number: "2",
    title: "Definiciones",
    subsections: [
      {
        label: "Usuario",
        paragraphs: [
          "Persona que visita o utiliza el Sitio para consultar, buscar o contactar Proveedores.",
        ],
      },
      {
        label: "Proveedor",
        paragraphs: [
          "Persona física o moral que crea un perfil en el Sitio para promocionar servicios o productos, y que puede contratar servicios de Promoción Premium.",
        ],
      },
      {
        label: "Contenido",
        paragraphs: [
          "Cualquier texto, imagen, video, audio, logotipo, reseña, comentario, mensaje, fotografía, anuncio, ficha comercial u otro material publicado o transmitido a través del Sitio.",
        ],
      },
      {
        label: "Promoción Premium",
        paragraphs: [
          "Servicio pagado mediante el cual un Proveedor obtiene beneficios de visibilidad, posicionamiento u otras funcionalidades, conforme a lo que se describa al momento de la compra.",
        ],
      },
    ],
  },
  {
    number: "3",
    title: "Objeto y naturaleza del servicio",
    paragraphs: [
      "KELOM es una plataforma digital cuyo objetivo es facilitar la promoción de Proveedores y permitir que los Usuarios los contacten directamente.",
      "KELOM actúa exclusivamente como plataforma de difusión y contacto. Por lo tanto:",
    ],
    bullets: [
      "KELOM no presta los servicios ofrecidos por los Proveedores.",
      "KELOM no interviene en la negociación, contratación, ejecución, calidad, seguridad, garantías, tiempos, precios, cobros o cumplimiento de los servicios.",
      "Cualquier relación, acuerdo o contrato celebrado entre Usuario y Proveedor es responsabilidad exclusiva de ellos.",
    ],
  },
  {
    number: "4",
    title: "Requisitos de uso y registro",
    paragraphs: [
      "El acceso al Sitio puede ser libre para consulta; sin embargo, algunas funciones podrán requerir registro.",
      "El Usuario/Proveedor se obliga a:",
    ],
    bullets: [
      "Proporcionar información veraz, completa y actualizada.",
      "Mantener la confidencialidad de sus credenciales de acceso.",
      "No permitir el uso de su cuenta por terceros.",
    ],
    footer:
      "KELOM podrá, cuando lo considere necesario para seguridad o cumplimiento, solicitar datos o documentación adicional para verificar identidad y/o actividad del Proveedor, sin que ello implique obligación de admisión o permanencia.",
  },
  {
    number: "5",
    title: "Obligaciones generales y uso permitido",
    paragraphs: [
      "El Usuario y/o Proveedor se comprometen a usar el Sitio de forma diligente, lícita y conforme a estas Condiciones, evitando cualquier conducta que:",
    ],
    bullets: [
      "Vulnere derechos de terceros (incluyendo propiedad intelectual, privacidad, imagen, honor).",
      "Sea engañosa, fraudulenta o suplantación de identidad.",
      "Implique acoso, hostigamiento, amenazas o lenguaje de odio.",
      "Introduzca malware, intente acceder sin autorización o afecte la seguridad del Sitio.",
      "Realice extracción masiva de información (scraping), uso de bots, crawlers no autorizados o ingeniería inversa.",
      "Genere spam, cadenas, mensajes masivos o publicidad fuera de los espacios habilitados.",
    ],
    footer:
      "KELOM podrá implementar medidas técnicas para detectar, limitar o bloquear estos comportamientos.",
  },
  {
    number: "6",
    title: "Reglas específicas para proveedores",
    paragraphs: [
      "Al crear un perfil o publicar un anuncio, el Proveedor declara y garantiza que:",
    ],
    bullets: [
      "Cuenta con capacidad legal y, en su caso, permisos, licencias, registros o autorizaciones para ofrecer los servicios.",
      "La información publicada (precios, ubicación, alcance, disponibilidad, imágenes) es cierta y no induce a error.",
      "Responderá por cualquier reclamación derivada de sus servicios, prácticas comerciales, publicidad o incumplimientos.",
    ],
    footer:
      "KELOM podrá solicitar documentación que acredite actividad o representación, y podrá suspender perfiles que presenten quejas graves o reiteradas, publiquen información falsa o engañosa, o infrinjan estas Condiciones o la ley aplicable.",
  },
  {
    number: "7",
    title: "Contenido de usuarios y licencia de uso",
    paragraphs: [
      "El Usuario/Proveedor es el único responsable del Contenido que publique o transmita.",
      "Al publicar Contenido en KELOM, el Usuario/Proveedor otorga a KELOM una licencia no exclusiva, gratuita, transferible, sublicenciable y mundial, para usar, alojar, reproducir, comunicar públicamente, distribuir, adaptar (por ejemplo, ajustes de formato o tamaño) y mostrar dicho Contenido con fines de operación, promoción, marketing y difusión del Sitio, durante el tiempo en que el Contenido permanezca publicado y por un periodo razonable posterior para respaldos, archivo o cumplimiento.",
      "El Usuario/Proveedor garantiza que cuenta con los derechos necesarios (incluyendo derechos de imagen) para publicar dicho Contenido y mantendrá a KELOM indemne ante reclamaciones de terceros.",
    ],
  },
  {
    number: "8",
    title: "Contenido prohibido y moderación",
    paragraphs: [
      "Queda prohibido publicar Contenido que, a criterio de KELOM:",
    ],
    bullets: [
      "Sea ilegal o presuntamente ilegal.",
      "Atente contra la dignidad humana o sea discriminatorio.",
      "Incluya pornografía o contenido sexual explícito, especialmente si involucra menores.",
      "Promueva violencia, autolesión, actividades delictivas o armas.",
      "Contenga datos personales de terceros sin autorización.",
      "Infrinja derechos de autor, marcas, secretos comerciales o privacidad.",
    ],
    footer:
      "KELOM podrá retirar, editar, ocultar o bloquear Contenido (total o parcialmente) sin previo aviso cuando lo estime necesario para proteger a Usuarios, Proveedores, terceros o la propia Plataforma.",
  },
  {
    number: "9",
    title: "Reseñas, comentarios y reputación",
    paragraphs: [
      "El sitio web permite reseñas y comentarios, los cuales reflejan la experiencia u opinión de quien los emite. KELOM no garantiza su veracidad.",
      "KELOM podrá moderar o retirar reseñas que sean:",
    ],
    bullets: [
      "Insultantes, discriminatorias o difamatorias.",
      "Falsas o manipuladas.",
      "Publicadas con conflicto de interés no declarado.",
      "Que incluyan datos personales sensibles o de terceros.",
    ],
  },
  {
    number: "10",
    title: "Promoción Premium, pagos y facturación",
    paragraphs: [
      "Los Proveedores podrán contratar Promoción Premium mediante pago. Las características del servicio, vigencia, alcance, precios, impuestos, métodos de pago y condiciones específicas se informarán al momento de la contratación y formarán parte de las presentes Condiciones como Condiciones Particulares.",
      "Salvo que se indique expresamente lo contrario en las Condiciones Particulares:",
    ],
    bullets: [
      "La Promoción Premium consiste en un servicio digital de visibilidad y posicionamiento, no en un resultado garantizado.",
      "KELOM no garantiza incremento de ventas, contratación, mensajes o conversiones.",
      "Facturación: en caso de requerir factura, el Proveedor deberá solicitarla conforme al procedimiento indicado en la Plataforma, proporcionando sus datos fiscales correctos dentro del plazo señalado en las Condiciones Particulares.",
    ],
  },
  {
    number: "11",
    title: "Cancelaciones, reembolsos y contracargos",
    paragraphs: [
      "Las políticas de cancelación y reembolso se regirán por lo informado en las Condiciones Particulares de Promoción Premium. En términos generales:",
    ],
    bullets: [
      "Al tratarse de un servicio digital que puede comenzar a prestarse de forma inmediata, el Proveedor reconoce que pueden existir limitaciones para cancelaciones o devoluciones una vez iniciado el servicio.",
      "En caso de contracargos, disputas o reclamaciones de pago, KELOM podrá solicitar información y, en su caso, suspender temporalmente la cuenta del Proveedor hasta que se resuelva la controversia.",
    ],
    footer:
      "Nada de lo anterior limita derechos que resulten irrenunciables conforme a la legislación aplicable, cuando proceda.",
  },
  {
    number: "12",
    title: "Relación usuario–proveedor y exención de responsabilidad",
    paragraphs: [
      "El Usuario reconoce que:",
    ],
    bullets: [
      "KELOM no supervisa ni controla la ejecución del servicio del Proveedor.",
      "La selección y contratación de un Proveedor es decisión exclusiva del Usuario.",
      "Cualquier reclamación por incumplimiento, daños, garantías, cancelaciones, devoluciones, seguridad o calidad deberá dirigirse al Proveedor.",
    ],
    footer:
      "KELOM no será responsable por la calidad, legalidad, idoneidad o disponibilidad de los servicios del Proveedor, ni por daños directos o indirectos derivados de acuerdos entre Usuario y Proveedor, ni por pérdidas económicas, lucro cesante, daños morales, reputacionales o consecuenciales.",
  },
  {
    number: "13",
    title: "Enlaces de terceros",
    paragraphs: [
      "El Sitio puede contener enlaces a páginas de terceros. KELOM no controla ni asume responsabilidad por contenidos, políticas o prácticas de dichos terceros.",
    ],
  },
  {
    number: "14",
    title: "Propiedad intelectual de KELOM",
    paragraphs: [
      "Todos los elementos del Sitio, incluyendo software, código, diseño, logotipos, marcas, textos, bases de datos y estructura, son propiedad de KELOM o de sus licenciantes y están protegidos por la legislación aplicable.",
      "Se prohíbe reproducir, copiar, distribuir, modificar o explotar comercialmente el Sitio o sus contenidos sin autorización expresa y por escrito de KELOM.",
    ],
  },
  {
    number: "15",
    title: "Seguridad, disponibilidad y mantenimiento",
    paragraphs: [
      "KELOM realizará esfuerzos razonables para mantener el Sitio disponible; sin embargo, pueden ocurrir interrupciones por mantenimiento, fallas de terceros, fuerza mayor o eventos fuera de control.",
      "KELOM podrá suspender temporalmente el Sitio por razones técnicas o de seguridad sin que ello genere responsabilidad.",
    ],
  },
  {
    number: "16",
    title: "Medidas por incumplimiento",
    paragraphs: [
      "KELOM podrá, a su discreción y según la gravedad:",
    ],
    bullets: [
      "Enviar advertencias.",
      "Retirar contenido.",
      "Limitar funciones.",
      "Suspender temporalmente cuentas.",
      "Cancelar definitivamente cuentas y bloquear accesos.",
    ],
    footer:
      "KELOM podrá conservar evidencia de actividad para fines de seguridad, auditoría o cumplimiento legal, conforme a su Aviso de Privacidad.",
  },
  {
    number: "17",
    title: "Indemnización",
    paragraphs: [
      "El Usuario/Proveedor se obliga a sacar en paz y a salvo e indemnizar a KELOM ante cualquier reclamación, demanda, multa, daño o gasto (incluyendo honorarios legales) derivado de:",
    ],
    bullets: [
      "Contenido publicado por el Usuario/Proveedor.",
      "Incumplimiento de estas Condiciones.",
      "Violación de derechos de terceros.",
      "Servicios prestados por el Proveedor o su publicidad.",
    ],
  },
  {
    number: "18",
    title: "Protección de datos personales",
    paragraphs: [
      "El tratamiento de datos personales se regirá por el Aviso de Privacidad publicado en el Sitio. El Usuario puede ejercer sus derechos ARCO conforme a los mecanismos ahí previstos.",
    ],
  },
  {
    number: "19",
    title: "Notificaciones y comunicaciones",
    paragraphs: [
      "Las notificaciones podrán realizarse mediante el Sitio, correo electrónico asociado a la cuenta o cualquier otro medio habilitado. El Usuario acepta comunicaciones relacionadas con operación, seguridad, cambios de condiciones y asuntos de cuenta.",
    ],
  },
  {
    number: "20",
    title: "Cesión y subcontratación",
    paragraphs: [
      "KELOM podrá apoyarse en proveedores tecnológicos (hosting, analítica, pasarelas de pago, etc.). KELOM podrá ceder o transferir su operación en caso de reestructura corporativa, fusión o adquisición, garantizando continuidad razonable del servicio.",
    ],
  },
  {
    number: "21",
    title: "Fuerza mayor",
    paragraphs: [
      "KELOM no será responsable por incumplimientos derivados de causas de fuerza mayor o caso fortuito, incluyendo fallas de infraestructura, cortes de energía, desastres, actos de autoridad o fallas generalizadas de Internet.",
    ],
  },
  {
    number: "22",
    title: "Legislación aplicable y jurisdicción",
    paragraphs: [
      "Estas Condiciones se rigen por las leyes de los Estados Unidos Mexicanos. Para la interpretación y cumplimiento, las partes se someten a los tribunales competentes del Estado de México, renunciando a cualquier otro fuero que pudiera corresponderles por razón de domicilio presente o futuro.",
    ],
  },
  {
    number: "24",
    title: "Aceptación final",
    paragraphs: [
      "El uso del Sitio implica que el Usuario/Proveedor ha leído, entendido y aceptado estas Condiciones de Uso.",
    ],
  },
];

function LegalModal({
  isOpen,
  onClose,
  pill,
  title,
  subtitle,
  summaryItems,
  sections,
  updatedAt,
}) {
  if (!isOpen) return null;

  return (
    <div className="legal-modal" onClick={onClose}>
      <div
        className="register-card legal-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="legal-modal__header">
          <div className="legal-modal__top">
            <div className="legal-modal__copy">
              <span className="legal-modal__pill">{pill}</span>

              <h2 className="register-card__title legal-modal__title">{title}</h2>

              <p className="register-card__subtitle legal-modal__subtitle">
                {subtitle}
              </p>
            </div>

            <button
              type="button"
              className="btn btn--ghost legal-modal__close"
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>

          <div className="legal-modal__summary-grid">
            {summaryItems.map((item) => (
              <div className="legal-modal__summary-card" key={item.label}>
                <div className="legal-modal__summary-label">{item.label}</div>
                <div className="legal-modal__summary-value">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="legal-modal__content">
          <div className="legal-modal__sections">
            {sections.map((section) => (
              <article className="legal-modal__section" key={section.number}>
                <div className="legal-modal__section-head">
                  <span className="legal-modal__section-number">
                    {section.number}
                  </span>

                  <h3 className="legal-modal__section-title">{section.title}</h3>
                </div>

                {section.paragraphs?.map((paragraph, index) => (
                  <p
                    key={`${section.number}-p-${index}`}
                    className="legal-modal__paragraph"
                  >
                    {paragraph}
                  </p>
                ))}

                {section.subsections?.map((subsection, index) => (
                  <div
                    key={`${section.number}-sub-${index}`}
                    className="legal-modal__subsection"
                  >
                    <div className="legal-modal__subsection-title">
                      {subsection.label}
                    </div>

                    {subsection.paragraphs?.map((paragraph, paragraphIndex) => (
                      <p
                        key={`${section.number}-sub-p-${paragraphIndex}`}
                        className="legal-modal__paragraph legal-modal__paragraph--sub"
                      >
                        {paragraph}
                      </p>
                    ))}

                    {subsection.bullets && (
                      <ul className="legal-modal__list legal-modal__list--sub">
                        {subsection.bullets.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}

                {section.bullets && !section.subsections && (
                  <ul className="legal-modal__list">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                )}

                {section.footer && (
                  <p className="legal-modal__section-footer">{section.footer}</p>
                )}
              </article>
            ))}
          </div>

          <div className="legal-modal__updated">
            <p>
              <strong>Fecha de última actualización:</strong> {updatedAt}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BusinessRegisterPage() {
  const navigate = useNavigate();

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
  const [showPrivacyPopup, setShowPrivacyPopup] = useState(false);
  const [showTermsPopup, setShowTermsPopup] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const privacySummaryItems = [
    {
      label: "Responsable",
      value: "VISIÓN E IMAGEN CREATIVA APP S.A. DE C.V.",
    },
    {
      label: "Contacto",
      value: "jcgerencialegal@kelom.com.mx",
    },
    {
      label: "Última actualización",
      value: "11/03/2026",
    },
  ];

  const termsSummaryItems = [
    {
      label: "Titular",
      value: "VISIÓN E IMAGEN CREATIVA APP S.A. DE C.V.",
    },
    {
      label: "Naturaleza",
      value: "Plataforma de difusión y contacto entre usuarios y proveedores.",
    },
    {
      label: "Jurisdicción",
      value: "Estado de México, conforme a leyes mexicanas.",
    },
    {
      label: "Última actualización",
      value: "22/02/2026",
    },
  ];

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
        "Para continuar debes aceptar el aviso de privacidad y los términos y condiciones."
      );
      return;
    }

    if (!isPrivacyChecked) {
      setFormError("Para continuar debes aceptar el aviso de privacidad.");
      return;
    }

    if (!isTermsChecked) {
      setFormError(
        "Para continuar debes aceptar los términos y condiciones."
      );
      return;
    }

    const cleanPayload = {
      companyName,
      ownerName,
      email: email.toLowerCase(),
      phone: phoneRaw.replace(/\D/g, ""),
    };

    saveBasicDraft(cleanPayload);
    setBasicData(cleanPayload);

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
            Kelom · Registro de empresa
          </span>

          <span className="business-register__logo-pill">PASO 1 DE 2</span>
        </div>
      </header>

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
                    <button
                      type="button"
                      className="business-register__legal-link"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowPrivacyPopup(true);
                      }}
                    >
                      aviso de privacidad
                    </button>
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
                    Acepto los{" "}
                    <button
                      type="button"
                      className="business-register__legal-link"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowTermsPopup(true);
                      }}
                    >
                      términos y condiciones
                    </button>
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
                  disabled={!isPrivacyChecked || !isTermsChecked || isSubmitting}
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
            </div>
          </div>
        </div>
      )}

      <LegalModal
        isOpen={showPrivacyPopup}
        onClose={() => setShowPrivacyPopup(false)}
        pill="Aviso de privacidad integral"
        title="KELOM.COM.MX"
        subtitle="Te compartimos este aviso de manera clara y ordenada para que sepas qué datos recabamos, para qué los usamos y qué derechos puedes ejercer respecto a ellos."
        summaryItems={privacySummaryItems}
        sections={privacySections}
        updatedAt="11/03/2026"
      />

      <LegalModal
        isOpen={showTermsPopup}
        onClose={() => setShowTermsPopup(false)}
        pill="Condiciones legales de uso"
        title="Términos y condiciones"
        subtitle="Estas condiciones explican cómo funciona Kelom, cuál es el alcance real de la plataforma y qué obligaciones asumen usuarios y proveedores al utilizarla."
        summaryItems={termsSummaryItems}
        sections={termsSections}
        updatedAt="22/02/2026"
      />

      <footer className="business-register__footer">
        © {new Date().getFullYear()} Kelom · Área para proveedores.
      </footer>
    </div>
  );
}

export default BusinessRegisterPage;