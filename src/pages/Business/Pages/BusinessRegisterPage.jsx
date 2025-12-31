// src/pages/Business/Pages/BusinessRegisterPage.jsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "../../../../Blocks/Business/BusinessAuth.css";
import Kelom from "../../../assets/web/logo/logoKelom.png";

function BusinessRegisterPage() {
  const [step, setStep] = useState(1);

  const [basicData, setBasicData] = useState({
    companyName: "",
    ownerName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [profileData, setProfileData] = useState({
    venueName: "",
    venueLocation: "",
    capacity: "",
    priceFrom: "",
    priceTo: "",
    description: "",
    spaces: "",
    services: "",
    rules: "",
    website: "",
    instagram: "",
    facebook: "",
    photos: [],
  });

  // Nuevo: control del popup de agradecimiento
  const [showThanks, setShowThanks] = useState(false);

  // Nuevo: control de aviso de privacidad (checkbox + popup)
  const [isPrivacyChecked, setIsPrivacyChecked] = useState(false);
  const [showPrivacyPopup, setShowPrivacyPopup] = useState(false);

  // ========== VALIDACIONES ==========
  const isValidPhone = (phone) => {
    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length !== 10) return false;

    // No más de 5 dígitos iguales seguidos
    if (/(.)\1{4,}/.test(digitsOnly)) return false;

    // Evitar secuencias largas tipo 012345 / 987654
    const ascSeq = "0123456789";
    const descSeq = "9876543210";
    for (let i = 0; i <= digitsOnly.length - 6; i++) {
      const slice = digitsOnly.slice(i, i + 6);
      if (ascSeq.includes(slice) || descSeq.includes(slice)) return false;
    }

    return true;
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // ========== HANDLERS CAMPOS ==========
  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setBasicData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotosChange = (e) => {
    const files = Array.from(e.target.files || []);
    setProfileData((prev) => ({ ...prev, photos: files }));
  };

  // ========== SUBMIT PASO 1 ==========
  const handleBasicSubmit = (e) => {
    e.preventDefault();

    // Solo validamos los campos visibles en pantalla
    const { companyName, ownerName, phone, email } = basicData;

    if (
      !companyName.trim() ||
      !ownerName.trim() ||
      !phone.trim() ||
      !email.trim()
    ) {
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

    // ✅ Validación del aviso de privacidad
    if (!isPrivacyChecked) {
      alert("Para continuar debes aceptar nuestro aviso de privacidad.");
      return;
    }

    // No se valida password ni confirmPassword porque los campos están ocultos

    console.log("Datos básicos válidos (demo):", basicData);
    setStep(2);
    // Mostramos popup de agradecimiento
    setShowThanks(true);
  };

  // ========== SUBMIT PASO 2 ==========
  const handleProfileSubmit = (e) => {
    e.preventDefault();

    const {
      venueName,
      venueLocation,
      capacity,
      priceFrom,
      priceTo,
      description,
      spaces,
      services,
      rules,
    } = profileData;

    if (
      !venueName.trim() ||
      !venueLocation.trim() ||
      !capacity.trim() ||
      !priceFrom.trim() ||
      !priceTo.trim() ||
      !description.trim() ||
      !spaces.trim() ||
      !services.trim() ||
      !rules.trim()
    ) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }

    if (!/^\d+$/.test(capacity)) {
      alert("La capacidad debe ser un número.");
      return;
    }

    if (!/^\d+$/.test(priceFrom) || !/^\d+$/.test(priceTo)) {
      alert("Los rangos de precio deben ser valores numéricos.");
      return;
    }

    console.log("Datos de ficha (demo):", { basicData, profileData });

    alert(
      "Registro completado en modo demo.\nMás adelante esto se guardará en la base de datos y generará la ficha del proveedor."
    );
  };

  return (
    <div className="business-register">
      {/* HEADER CON LOGO + PASO ACTUAL */}
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

          <span className="business-register__logo-pill">PASO {step} DE 2</span>
        </div>
      </header>

      {/* PASO 1: ALTA INICIAL */}
      {step === 1 && (
        <main className="business-register__content">
          <div className="business-register__container">
            <section className="register-card">
              <p className="register-card__eyebrow">Alta inicial</p>
              <h1 className="register-card__title">Registra tu empresa</h1>
              <p className="register-card__subtitle">
                Con este primer paso nos pondremos en contacto contigo para
                poder dar de alta tu negocio y formar parte del catalogo de
                kelom
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

                {/* 
                <div className="form__field">
                  <label className="form__label" htmlFor="password">
                    Crear contraseña
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    className="form__input"
                    placeholder="Mínimo 5 caracteres"
                    value={basicData.password}
                    onChange={handleBasicChange}
                    required
                  />
                  <span className="form__error" />
                </div>

                <div className="form__field">
                  <label
                    className="form__label"
                    htmlFor="confirmPassword"
                  >
                    Confirmar contraseña
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    className="form__input"
                    placeholder="Repite la contraseña"
                    value={basicData.confirmPassword}
                    onChange={handleBasicChange}
                    required
                  />
                  <span className="form__error" />
                </div>
                */}

                {/* ✅ Checkbox + link al aviso de privacidad */}
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
                    Registrar mi Negocio
                  </button>
                </div>
              </form>
            </section>
          </div>
        </main>
      )}

      {/* PASO 2: FICHA DEL PROVEEDOR */}
      {step === 2 && (
        <main className="business-profile__content">
          <div className="business-profile__container">
            <div className="profile-layout">
              {/* Formulario principal */}
              <section className="profile-card">
                <p className="profile-card__eyebrow">
                  Ficha visible para parejas
                </p>
                <h1 className="profile-card__title">
                  Completa la información de tu venue
                </h1>
                <p className="profile-card__subtitle">
                  Lo que escribas aquí será la base de la página que verán las
                  parejas cuando visiten tu perfil.
                </p>

                <form
                  className="form form--grid"
                  onSubmit={handleProfileSubmit}
                  noValidate
                >
                  <div className="form__field form__field--full">
                    <label className="form__label" htmlFor="venueName">
                      Nombre que verán las parejas
                    </label>
                    <input
                      id="venueName"
                      name="venueName"
                      type="text"
                      className="form__input"
                      placeholder="Ej. Jardín Las Bugambilias"
                      value={profileData.venueName}
                      onChange={handleProfileChange}
                      required
                    />
                    <span className="form__error" />
                  </div>

                  <div className="form__field form__field--full">
                    <label className="form__label" htmlFor="venueLocation">
                      Ubicación
                    </label>
                    <input
                      id="venueLocation"
                      name="venueLocation"
                      type="text"
                      className="form__input"
                      placeholder="Ej. Tlalpan, Ciudad de México"
                      value={profileData.venueLocation}
                      onChange={handleProfileChange}
                      required
                    />
                    <span className="form__error" />
                  </div>

                  <div className="form__field">
                    <label className="form__label" htmlFor="capacity">
                      Capacidad aproximada de invitados
                    </label>
                    <input
                      id="capacity"
                      name="capacity"
                      type="number"
                      className="form__input"
                      placeholder="Ej. 150"
                      value={profileData.capacity}
                      onChange={handleProfileChange}
                      required
                    />
                    <span className="form__error" />
                  </div>

                  <div className="form__field">
                    <label className="form__label" htmlFor="priceFrom">
                      Precio desde
                    </label>
                    <input
                      id="priceFrom"
                      name="priceFrom"
                      type="number"
                      className="form__input"
                      placeholder="Ej. 25000"
                      value={profileData.priceFrom}
                      onChange={handleProfileChange}
                      required
                    />
                    <span className="form__error" />
                  </div>

                  <div className="form__field">
                    <label className="form__label" htmlFor="priceTo">
                      Precio hasta
                    </label>
                    <input
                      id="priceTo"
                      name="priceTo"
                      type="number"
                      className="form__input"
                      placeholder="Ej. 60000"
                      value={profileData.priceTo}
                      onChange={handleProfileChange}
                      required
                    />
                    <span className="form__error" />
                  </div>

                  <div className="form__field form__field--full">
                    <label className="form__label" htmlFor="description">
                      Descripción del lugar
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      className="form__textarea"
                      rows={4}
                      placeholder="Cuenta qué hace especial a tu venue..."
                      value={profileData.description}
                      onChange={handleProfileChange}
                      required
                    />
                    <span className="form__error" />
                  </div>

                  <div className="form__field form__field--full">
                    <label className="form__label" htmlFor="spaces">
                      Espacios con los que cuentan
                    </label>
                    <textarea
                      id="spaces"
                      name="spaces"
                      className="form__textarea"
                      rows={3}
                      placeholder="Ej. Jardín, salón, terraza..."
                      value={profileData.spaces}
                      onChange={handleProfileChange}
                      required
                    />
                    <span className="form__error" />
                  </div>

                  <div className="form__field form__field--full">
                    <label className="form__label" htmlFor="services">
                      Servicios que ofrecen
                    </label>
                    <textarea
                      id="services"
                      name="services"
                      className="form__textarea"
                      rows={3}
                      placeholder="Ej. banquete, mobiliario, decoración..."
                      value={profileData.services}
                      onChange={handleProfileChange}
                      required
                    />
                    <span className="form__error" />
                  </div>

                  <div className="form__field form__field--full">
                    <label className="form__label" htmlFor="rules">
                      Reglas importantes
                    </label>
                    <textarea
                      id="rules"
                      name="rules"
                      className="form__textarea"
                      rows={3}
                      placeholder="Ej. horario límite, restricciones de ruido..."
                      value={profileData.rules}
                      onChange={handleProfileChange}
                      required
                    />
                    <span className="form__error" />
                  </div>

                  <div className="form__field">
                    <label className="form__label" htmlFor="website">
                      Sitio web (opcional)
                    </label>
                    <input
                      id="website"
                      name="website"
                      type="url"
                      className="form__input"
                      placeholder="https://tusitio.com"
                      value={profileData.website}
                      onChange={handleProfileChange}
                    />
                    <span className="form__error" />
                  </div>

                  <div className="form__field">
                    <label className="form__label" htmlFor="instagram">
                      Instagram (opcional)
                    </label>
                    <input
                      id="instagram"
                      name="instagram"
                      type="text"
                      className="form__input"
                      placeholder="@tucuenta"
                      value={profileData.instagram}
                      onChange={handleProfileChange}
                    />
                    <span className="form__error" />
                  </div>

                  <div className="form__field">
                    <label className="form__label" htmlFor="facebook">
                      Facebook (opcional)
                    </label>
                    <input
                      id="facebook"
                      name="facebook"
                      type="text"
                      className="form__input"
                      placeholder="Nombre de tu página"
                      value={profileData.facebook}
                      onChange={handleProfileChange}
                    />
                    <span className="form__error" />
                  </div>

                  <div className="form__field form__field--full">
                    <label className="form__label" htmlFor="photos">
                      Fotografías del lugar
                    </label>
                    <input
                      id="photos"
                      name="photos"
                      type="file"
                      multiple
                      accept="image/*"
                      className="form__input form__input--file"
                      onChange={handlePhotosChange}
                    />
                    <p className="form__hint">
                      Puedes seleccionar varias imágenes de tu computadora.
                    </p>
                  </div>

                  <div className="form__actions">
                    <button
                      type="button"
                      className="btn btn--ghost"
                      onClick={() => setStep(1)}
                    >
                      Volver a datos de acceso
                    </button>
                    <button type="submit" className="btn btn--primary">
                      Guardar ficha (modo demo)
                    </button>
                  </div>
                </form>
              </section>

              {/* Vista previa simple */}
              <aside className="profile-preview">
                <section className="preview-card">
                  <span className="preview-card__pill">
                    Así se verá tu ficha
                  </span>
                  <h2 className="preview-card__title">
                    {profileData.venueName || "Nombre del lugar"}
                  </h2>
                  <p className="preview-card__subtitle">
                    {profileData.venueLocation || "Ubicación del venue"}
                  </p>
                  <div className="preview-card__photo-main">
                    <img
                      src="https://images.pexels.com/photos/3951852/pexels-photo-3951852.jpeg?auto=compress&cs=tinysrgb&w=800"
                      alt="Ejemplo de venue"
                    />
                  </div>
                  <p
                    className="preview-card__text"
                    style={{ marginTop: "0.8rem" }}
                  >
                    Aquí aparecerá un resumen de tu lugar con fotos destacadas,
                    listo para que las parejas lo vean dentro de Kelom.
                  </p>
                </section>
              </aside>
            </div>
          </div>
        </main>
      )}

      {/* POPUP DE AGRADECIMIENTO */}
      {showThanks && (
        <div
          className="business-register__thanks-overlay"
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
              maxWidth: "520px",
              width: "100%",
              background: "#ffffff",
              borderRadius: "16px",
              boxShadow: "0 20px 45px rgba(15, 23, 42, 0.35)",
            }}
          >
            <div style={{ padding: "1.8rem 2rem" }}>
              <p className="register-card__eyebrow">
                Gracias por confiar en Kelom
              </p>
              <h2 className="register-card__title">
                {basicData.companyName
                  ? `¡${basicData.companyName} ya está en nuestro radar!`
                  : "¡Tu negocio ya está en nuestro radar!"}
              </h2>
              <p className="register-card__subtitle">
                Hemos recibido la información de tu empresa y la revisaremos con
                calma para entender mejor lo que ofreces y cómo podemos
                presentarte de la mejor manera dentro del catálogo de Kelom.
              </p>
              <p className="register-card__subtitle">
                En los próximos días nos pondremos en contacto contigo al correo{" "}
                <strong>{basicData.email}</strong>
                {basicData.phone ? ` o al teléfono ${basicData.phone}` : ""}{" "}
                para continuar el proceso y acompañarte en los siguientes pasos.
              </p>
              <p className="register-card__subtitle">
                Nuestro objetivo es que estar en Kelom se sienta como sumar a un
                aliado, no solo llenar un formulario.
              </p>

              <div
                className="register-card__actions"
                style={{ marginTop: "1.6rem" }}
              >
                <NavLink to="/empresas" className="btn btn--ghost">
                  Volver al área de empresas
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP DE AVISO DE PRIVACIDAD */}
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

      <footer className="business-register__footer">
        © {new Date().getFullYear()} Kelom · Área para proveedores.
      </footer>
    </div>
  );
}

export default BusinessRegisterPage;
