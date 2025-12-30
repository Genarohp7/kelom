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

  // ✅ Nuevo: control del checkbox y del popup de aviso de privacidad
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

              <p className="register-card__subtitle">
                Los datos personales que recabamos de usted, los utilizaremos
                para las siguientes finalidades:
              </p>

              <ul style={{ marginLeft: "1.2rem", marginBottom: "0.8rem" }}>
                <li>Suministrar servicios y productos de terceros proveedores.</li>
                <li>Mercadotecnia o publicitaria.</li>
                <li>Prospección comercial.</li>
              </ul>

              <p className="register-card__subtitle">
                Mediante el presente aviso de privacidad Kelom solo es un
                intermediario de consulta tanto para los proveedores de bienes y
                servicios, como para los consumidores de éstos, por lo que no
                lleva a cabo ningún evento, servicio o bien, de tal forma que
                solo se hace responsable de la publicidad de los proveedores
                registrados en páginas oficiales. Kelom no hace publicidad
                directa a ningún proveedor, por lo que cualquier información de
                los proveedores de bienes o servicios será a través de nuestra
                plataforma o marca oficial usando solo las redes sociales
                oficiales.
              </p>

              <p className="register-card__subtitle">
                En caso de que no desee que sus datos personales se utilicen
                para estos fines o desee ejercer el derecho de rectificación,
                cancelación u oposición de datos personales, sus datos
                personales podrán ser modificados conforme al propio
                procedimiento previsto dentro de este aviso de privacidad, pues
                de lo contrario al dar clic en la casilla de Aviso de
                Privacidad se entiende que acepta los fines para los que serán
                utilizados los datos personales.
              </p>

              <p className="register-card__subtitle">
                De conformidad con lo anterior, el destinatario titular de los
                datos personales del presente aviso de privacidad acepta y
                consiente expresamente el tratamiento que se le dará a sus datos
                personales, una vez que seleccione la casilla de Aviso de
                Privacidad y sea enviada por el sistema de la página o
                plataforma de Kelom.com.mx.
              </p>

              <p className="register-card__subtitle">
                Para efectos de lograr las finalidades antes señaladas se
                requieren los siguientes datos personales:
              </p>

              <ul style={{ marginLeft: "1.2rem", marginBottom: "0.8rem" }}>
                <li>Nombre completo</li>
                <li>Email</li>
                <li>Teléfono</li>
                <li>Mensaje (fecha de evento y número de invitados)</li>
              </ul>

              <p className="register-card__subtitle">
                Los cuales son llenados previamente y de manera manual por el
                usuario antes de enviar y aceptar el Aviso de Privacidad.
                Conforme a lo anterior, se señala que el presente aviso de
                privacidad NO solicita datos personales sensibles, por lo que el
                consentimiento expreso para la aceptación del presente aviso de
                privacidad se manifestará por medios electrónicos o por
                cualquier otra tecnología una vez que seleccione y se dé clic en
                la casilla de Aviso de Privacidad, cuyo llenado y aceptación
                hace las veces de manifestación y consentimiento del tratamiento
                de los datos personales consignados en el presente aviso de
                privacidad.
              </p>

              <p className="register-card__subtitle">
                Le informamos que sus datos personales serán compartidos con las
                personas, empresas y organizaciones distintas al responsable,
                por lo que la aceptación de la transferencia de datos personales
                se manifiesta de igual manera con la selección y el clic que se
                dé en la casilla de Aviso de Privacidad, por lo que su
                consentimiento se encuentra manifestado de manera expresa a
                través del llenado de la casilla mencionada y enviada por los
                medios electrónicos o por cualquier otra tecnología del dominio
                de Kelom.com.mx.
              </p>

              <p className="register-card__subtitle">
                Se ha de señalar que la transferencia de datos personales se
                limitará para el uso o divulgación de los fines señalados en el
                presente aviso, así como para fines promocionales relacionados
                con bienes o servicios relacionados con las actividades propias
                de Kelom.com.mx y derivadas de nuestro objeto social, en el
                entendido que podrá revocar esta autorización en cualquier
                tiempo mediante solicitud por escrito enviada a la dirección de
                correo electrónico info@kelom.com.mx.
              </p>

              <p className="register-card__subtitle">
                Se informa que el usuario que firme el presente aviso de
                privacidad tiene derecho a conocer para qué se utilizan, así
                como las condiciones del uso que les damos a los datos
                personales recabados. Asimismo, es su derecho solicitar la
                corrección de su información personal en caso de que esté
                desactualizada, sea inexacta, errónea o incompleta; a que la
                eliminemos de nuestros registros o bases de datos cuando
                considere que la misma no está siendo utilizada conforme a los
                principios, deberes y obligaciones previstas en la ley; así como
                oponerse al uso de sus datos personales para fines específicos,
                de conformidad con lo dispuesto en la Ley Federal de Protección
                de Datos Personales en Posesión de los Particulares.
              </p>

              <p className="register-card__subtitle">
                A efectos de lo anterior, el procedimiento a seguir para el
                ejercicio del acceso, rectificación, cancelación u oposición de
                datos personales será conforme a lo siguiente:
              </p>

              <p className="register-card__subtitle">
                Podrá presentar solicitud por escrito mediante correo
                electrónico enviado a la dirección info@kelom.com.mx, en
                cualquier momento, cuya solicitud deberá contener como elementos
                mínimos los siguientes:
              </p>

              <ul style={{ marginLeft: "1.2rem", marginBottom: "0.8rem" }}>
                <li>
                  El nombre del titular y su domicilio o cualquier otro medio
                  para recibir notificaciones;
                </li>
                <li>
                  Los documentos que acrediten la identidad del titular y, en su
                  caso, la personalidad e identidad de su representante;
                </li>
                <li>
                  La descripción clara y precisa de los datos personales
                  respecto de los que se busca la rectificación, cancelación u
                  oposición, salvo que se trate del derecho de acceso, para lo
                  cual será necesario señalar las modificaciones a realizarse,
                  las causas que motivan la eliminación o cancelación de los
                  datos y los motivos que justifican se finalice el tratamiento
                  de los datos personales y el daño o perjuicio que le causaría
                  respectivamente.
                </li>
              </ul>

              <p className="register-card__subtitle">
                El ejercicio del acceso, rectificación, cancelación u oposición
                no es requisito previo ni impide el ejercicio de otro.
              </p>

              <p className="register-card__subtitle">
                Kelom.com.mx responderá en el domicilio o en el medio que el
                titular de los datos personales designe en su solicitud, en un
                plazo de 20 días hábiles si la respuesta respecto a la
                solicitud de acceso, rectificación, cancelación u oposición es
                procedente o no y, en su caso, hará efectiva la solicitud
                planteada dentro de los 20 días hábiles siguientes a la fecha en
                que comunique la respuesta.
              </p>

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
