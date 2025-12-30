// src/pages/Business/Pages/BusinessRegisterPage.jsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "../../../../Blocks/Business/BusinessAuth.css";
import Kelom from "../../../assets/logo/logoKelom.png";

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

                <div className="register-card__actions">
                  <button type="submit" className="btn btn--primary">
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
                {/* <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => setShowThanks(false)}
                >
                  Entendido, continuar
                </button> */}
                <NavLink to="/empresas" className="btn btn--ghost">
                  Volver al área de empresas
                </NavLink>
              </div>
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
