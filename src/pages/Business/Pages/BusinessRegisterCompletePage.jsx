// src/pages/Business/Pages/BusinessRegisterCompletePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import "../../../../Blocks/Business/BusinessAuth.css";
import Kelom from "../../../assets/web/logo/logoKelom.png";

function BusinessRegisterCompletePage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Si en el futuro mandamos basicData desde /empresas/registro (state),
  // aquí lo recibimos sin romper nada si no viene.
  const basicData = location.state?.basicData || null;

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

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotosChange = (e) => {
    const files = Array.from(e.target.files || []);
    setProfileData((prev) => ({ ...prev, photos: files }));
  };

  // Previews de fotos (sin setState dentro de effect)
  const photoPreviews = useMemo(() => {
    return (profileData.photos || []).map((file) => URL.createObjectURL(file));
  }, [profileData.photos]);

  // Limpieza de object URLs para evitar fugas de memoria
  useEffect(() => {
    return () => {
      photoPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [photoPreviews]);

  const mainPhoto = useMemo(() => {
    if (photoPreviews.length > 0) return photoPreviews[0];
    return "https://images.pexels.com/photos/3951852/pexels-photo-3951852.jpeg?auto=compress&cs=tinysrgb&w=800";
  }, [photoPreviews]);

  const handleSubmit = (e) => {
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
      !capacity.toString().trim() ||
      !priceFrom.toString().trim() ||
      !priceTo.toString().trim() ||
      !description.trim() ||
      !spaces.trim() ||
      !services.trim() ||
      !rules.trim()
    ) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }

    if (!/^\d+$/.test(String(capacity))) {
      alert("La capacidad debe ser un número.");
      return;
    }

    if (!/^\d+$/.test(String(priceFrom)) || !/^\d+$/.test(String(priceTo))) {
      alert("Los rangos de precio deben ser valores numéricos.");
      return;
    }

    if (Number(priceFrom) > Number(priceTo)) {
      alert("El precio 'desde' no puede ser mayor que el 'hasta'.");
      return;
    }

    console.log("Registro completo (demo):", { basicData, profileData });

    alert(
      "Ficha guardada en modo demo.\nDespués la conectamos al backend y se publicará en tu perfil."
    );

    // Si quieres, luego podemos redirigir al dashboard de proveedor:
    // navigate("/empresas/dashboard");
  };

  return (
    <div className="business-profile">
      {/* HEADER */}
      <header className="business-profile__header">
        <div className="container business-profile__header-inner">
          <NavLink
            to="/empresas"
            className="business-profile__logo-link"
            aria-label="Volver al área de empresas"
          >
            <img src={Kelom} alt="Logo Kelom" title="Kelom" />
          </NavLink>

          <span className="business-profile__logo-text">
            Kelom · Completar registro
          </span>

          <span className="business-profile__logo-pill">FICHA</span>
        </div>
      </header>

      <main className="business-profile__content">
        <div className="business-profile__container">
          <div className="profile-layout">
            {/* Formulario */}
            <section className="profile-card">
              <p className="profile-card__eyebrow">Ficha visible para parejas</p>
              <h1 className="profile-card__title">
                Completa la información de tu venue
              </h1>
              <p className="profile-card__subtitle">
                Lo que escribas aquí será la base de la página pública que verán
                las parejas cuando entren a tu perfil.
              </p>

              {basicData?.companyName && (
                <p
                  className="profile-card__subtitle"
                  style={{ marginTop: "-0.6rem" }}
                >
                  Registro iniciado por: <strong>{basicData.companyName}</strong>
                </p>
              )}

              <form className="form form--grid" onSubmit={handleSubmit} noValidate>
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
                    Capacidad aproximada
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
                    placeholder="Ej. jardín, salón, terraza..."
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
                    onClick={() => navigate("/empresas/registro")}
                  >
                    Volver al registro inicial
                  </button>

                  <button type="submit" className="btn btn--primary">
                    Guardar ficha (modo demo)
                  </button>
                </div>
              </form>
            </section>

            {/* Preview */}
            <aside className="profile-preview">
              <section className="preview-card">
                <span className="preview-card__pill">Así se verá tu ficha</span>

                <h2 className="preview-card__title">
                  {profileData.venueName || "Nombre del lugar"}
                </h2>

                <p className="preview-card__subtitle">
                  {profileData.venueLocation || "Ubicación del venue"}
                </p>

                <div className="preview-card__photo-main">
                  <img src={mainPhoto} alt="Vista previa del venue" />
                </div>

                {photoPreviews.length > 1 && (
                  <div className="preview-card__gallery" aria-label="Galería">
                    {photoPreviews.slice(1, 4).map((src, idx) => (
                      <div className="preview-card__gallery-item" key={`${src}-${idx}`}>
                        <img src={src} alt={`Foto ${idx + 2}`} />
                      </div>
                    ))}
                  </div>
                )}

                <p className="preview-card__text" style={{ marginTop: "0.8rem" }}>
                  Aquí aparecerá un resumen de tu lugar con fotos destacadas,
                  listo para que las parejas lo vean dentro de Kelom.
                </p>
              </section>
            </aside>
          </div>
        </div>
      </main>

      <footer className="business-profile__footer">
        © {new Date().getFullYear()} Kelom · Área para proveedores.
      </footer>
    </div>
  );
}

export default BusinessRegisterCompletePage;