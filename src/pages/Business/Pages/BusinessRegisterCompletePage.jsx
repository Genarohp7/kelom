// src/pages/Business/Pages/BusinessRegisterCompletePage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import "../../../../Blocks/Business/BusinessAuth.css";
import Kelom from "../../../assets/web/logo/logoKelom.png";

const PROVIDER_BASIC_DRAFT_KEY = "kelom_provider_basic_draft";
const PROVIDER_PROFILE_DRAFT_KEY = "kelom_provider_profile_draft";
const PROVIDER_DEMO_PASS_PREFIX = "kelom_provider_demo_password:";

const EVENT_TYPE_OPTIONS = [
  "Boda civil",
  "Boda religiosa",
  "Recepción al aire libre",
  "Recepción en salón",
  "Coctel",
  "Comida formal",
  "Boda íntima",
  "Boda grande",
];

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function BusinessRegisterCompletePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const stateBasicData = location.state?.basicData || null;
  const prefillProfileData = location.state?.prefillProfileData || null;
  const authModeFromState = location.state?.authMode || null; // "register" | "edit"
  const loginEmailFromState = location.state?.loginEmail || "";

  const authMode = useMemo(() => {
    if (authModeFromState) return authModeFromState;
    if (prefillProfileData) return "edit";
    return "register";
  }, [authModeFromState, prefillProfileData]);

  const basicData = useMemo(() => {
    if (stateBasicData) return stateBasicData;

    const draft = sessionStorage.getItem(PROVIDER_BASIC_DRAFT_KEY);
    const parsed = draft ? safeParse(draft) : null;

    return parsed || null;
  }, [stateBasicData]);

  const providerEmail = useMemo(() => {
    const email =
      (loginEmailFromState || basicData?.email || "").trim().toLowerCase();
    return email;
  }, [loginEmailFromState, basicData]);

  const demoPasswordKey = useMemo(() => {
    return providerEmail
      ? `${PROVIDER_DEMO_PASS_PREFIX}${providerEmail}`
      : `${PROVIDER_DEMO_PASS_PREFIX}unknown`;
  }, [providerEmail]);

  const [profileData, setProfileData] = useState(() => {
    if (prefillProfileData) {
      return {
        venueName: prefillProfileData.venueName || "",
        venueLocation: prefillProfileData.venueLocation || "",
        capacityMin: prefillProfileData.capacityMin || "",
        capacityMax: prefillProfileData.capacityMax || "",
        priceFrom: prefillProfileData.priceFrom || "",
        priceTo: prefillProfileData.priceTo || "",
        shortDescription: prefillProfileData.shortDescription || "",
        eventTypes: Array.isArray(prefillProfileData.eventTypes)
          ? prefillProfileData.eventTypes
          : [],
        sellingPointsText: prefillProfileData.sellingPointsText || "",
        mapText: prefillProfileData.mapText || "",
        description: prefillProfileData.description || "",
        spaces: prefillProfileData.spaces || "",
        services: prefillProfileData.services || "",
        rules: prefillProfileData.rules || "",
        website: prefillProfileData.website || "",
        instagram: prefillProfileData.instagram || "",
        facebook: prefillProfileData.facebook || "",
        photos: Array.isArray(prefillProfileData.photos)
          ? prefillProfileData.photos
          : [],
      };
    }

    const draft = localStorage.getItem(PROVIDER_PROFILE_DRAFT_KEY);
    const parsed = draft ? safeParse(draft) : null;

    if (parsed) {
      return {
        venueName: parsed.venueName || "",
        venueLocation: parsed.venueLocation || "",
        capacityMin: parsed.capacityMin || "",
        capacityMax: parsed.capacityMax || "",
        priceFrom: parsed.priceFrom || "",
        priceTo: parsed.priceTo || "",
        shortDescription: parsed.shortDescription || "",
        eventTypes: Array.isArray(parsed.eventTypes) ? parsed.eventTypes : [],
        sellingPointsText: parsed.sellingPointsText || "",
        mapText: parsed.mapText || "",
        description: parsed.description || "",
        spaces: parsed.spaces || "",
        services: parsed.services || "",
        rules: parsed.rules || "",
        website: parsed.website || "",
        instagram: parsed.instagram || "",
        facebook: parsed.facebook || "",
        photos: [],
      };
    }

    return {
      venueName: "",
      venueLocation: "",
      capacityMin: "",
      capacityMax: "",
      priceFrom: "",
      priceTo: "",
      shortDescription: "",
      eventTypes: [],
      sellingPointsText: "",
      mapText: "",
      description: "",
      spaces: "",
      services: "",
      rules: "",
      website: "",
      instagram: "",
      facebook: "",
      photos: [],
    };
  });

  // ✅ Seguridad (demo)
  const [securityData, setSecurityData] = useState({
    password: "",
    confirmPassword: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [showSecurity, setShowSecurity] = useState({
    password: false,
    confirmPassword: false,
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });

  // ✅ Dropzone (nuevo)
  const fileInputRef = useRef(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const addPhotos = (files) => {
    const incoming = (files || []).filter((f) => f && f.type?.startsWith("image/"));
    if (incoming.length === 0) return;

    const keyOf = (f) => `${f.name}-${f.size}-${f.lastModified}`;

    setProfileData((prev) => {
      const existing = Array.isArray(prev.photos) ? prev.photos : [];
      const seen = new Set(existing.map(keyOf));
      const merged = [...existing];

      incoming.forEach((f) => {
        const k = keyOf(f);
        if (!seen.has(k)) {
          merged.push(f);
          seen.add(k);
        }
      });

      return { ...prev, photos: merged };
    });
  };

  const handlePhotoInputChange = (e) => {
    const files = Array.from(e.target.files || []);
    addPhotos(files);
    // reset input para permitir seleccionar el mismo archivo otra vez
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = Array.from(e.dataTransfer.files || []);
    addPhotos(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const removePhotoAt = (index) => {
    setProfileData((prev) => {
      const next = (prev.photos || []).filter((_, i) => i !== index);
      return { ...prev, photos: next };
    });
  };

  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecurityData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleShow = (key) => {
    setShowSecurity((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleEventType = (label) => {
    setProfileData((prev) => {
      const has = prev.eventTypes.includes(label);
      const next = has
        ? prev.eventTypes.filter((t) => t !== label)
        : [...prev.eventTypes, label];
      return { ...prev, eventTypes: next };
    });
  };

  // Previews (limpieza incluida)
  const photoPreviews = useMemo(() => {
    return (profileData.photos || []).map((file) => URL.createObjectURL(file));
  }, [profileData.photos]);

  useEffect(() => {
    return () => {
      photoPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [photoPreviews]);

  const mainPhoto = useMemo(() => {
    if (photoPreviews.length > 0) return photoPreviews[0];
    return "https://images.pexels.com/photos/3951852/pexels-photo-3951852.jpeg?auto=compress&cs=tinysrgb&w=800";
  }, [photoPreviews]);

  const sellingPointsList = useMemo(() => {
    return (profileData.sellingPointsText || "")
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
  }, [profileData.sellingPointsText]);

  const formatMXN = (value) => {
    if (!value) return "";
    const n = Number(value);
    if (Number.isNaN(n)) return String(value);
    return n.toLocaleString("es-MX");
  };

  const buildSafeDraft = () => {
    return {
      ...profileData,
      photos: [],
    };
  };

  const validateNumber = (value) => /^\d+$/.test(String(value));

  const completion = useMemo(() => {
    const items = [
      !!profileData.venueName.trim(),
      !!profileData.venueLocation.trim(),
      !!String(profileData.capacityMin).trim(),
      !!String(profileData.priceFrom).trim(),
      !!String(profileData.priceTo).trim(),
      !!profileData.shortDescription.trim(),
      !!profileData.description.trim(),
      !!profileData.services.trim(),

      (profileData.eventTypes || []).length > 0,
      !!profileData.sellingPointsText.trim(),
      !!profileData.mapText.trim(),
      (profileData.photos || []).length > 0,
      !!profileData.website.trim(),
      !!profileData.instagram.trim(),
      !!profileData.facebook.trim(),
    ];

    const total = items.length;
    const done = items.filter(Boolean).length;
    const percent = Math.round((done / total) * 100);
    return { done, total, percent };
  }, [profileData]);

  const validateCreatePassword = () => {
    const p = securityData.password.trim();
    const c = securityData.confirmPassword.trim();

    if (!p || !c) {
      alert("Por favor, crea tu contraseña y confírmala.");
      return false;
    }
    if (p.length < 5) {
      alert("La contraseña debe tener al menos 5 caracteres (modo demo).");
      return false;
    }
    if (p !== c) {
      alert("La confirmación no coincide con la contraseña.");
      return false;
    }
    return true;
  };

  const handleChangePassword = () => {
    const current = securityData.currentPassword.trim();
    const next = securityData.newPassword.trim();
    const confirm = securityData.confirmNewPassword.trim();

    if (!current || !next || !confirm) {
      alert("Completa: contraseña actual, nueva y confirmación.");
      return;
    }
    if (next.length < 5) {
      alert("La nueva contraseña debe tener al menos 5 caracteres (modo demo).");
      return;
    }
    if (next !== confirm) {
      alert("La confirmación no coincide con la nueva contraseña.");
      return;
    }
    if (current === next) {
      alert("La nueva contraseña no puede ser igual a la actual.");
      return;
    }

    const stored = sessionStorage.getItem(demoPasswordKey);
    if (stored && stored !== current) {
      alert("La contraseña actual no coincide (modo demo).");
      return;
    }

    sessionStorage.setItem(demoPasswordKey, next);
    alert("Contraseña actualizada (modo demo).");

    setSecurityData((prev) => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const {
      venueName,
      venueLocation,
      capacityMin,
      capacityMax,
      priceFrom,
      priceTo,
      shortDescription,
      description,
      services,
    } = profileData;

    if (
      !venueName.trim() ||
      !venueLocation.trim() ||
      !String(priceFrom).trim() ||
      !String(priceTo).trim() ||
      !String(capacityMin).trim() ||
      !shortDescription.trim() ||
      !description.trim() ||
      !services.trim()
    ) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }

    if (!validateNumber(priceFrom) || !validateNumber(priceTo)) {
      alert("Los rangos de precio deben ser valores numéricos.");
      return;
    }

    if (Number(priceFrom) > Number(priceTo)) {
      alert("El precio 'desde' no puede ser mayor que el 'hasta'.");
      return;
    }

    if (!validateNumber(capacityMin)) {
      alert("La capacidad mínima debe ser un número.");
      return;
    }

    if (capacityMax && !validateNumber(capacityMax)) {
      alert("La capacidad máxima debe ser un número.");
      return;
    }

    if (capacityMax && Number(capacityMin) > Number(capacityMax)) {
      alert("La capacidad mínima no puede ser mayor que la máxima.");
      return;
    }

    if (authMode === "register") {
      if (!providerEmail) {
        alert(
          "No encontramos un correo para asociar la contraseña (modo demo). Completa el registro inicial primero."
        );
        return;
      }
      if (!validateCreatePassword()) return;
      sessionStorage.setItem(demoPasswordKey, securityData.password.trim());
    }

    try {
      localStorage.setItem(
        PROVIDER_PROFILE_DRAFT_KEY,
        JSON.stringify(buildSafeDraft())
      );
    } catch (err) {
      console.warn("No se pudo guardar draft del perfil:", err);
    }

    console.log("Registro completo (demo):", {
      basicData,
      authMode,
      providerEmail,
      profileData: {
        ...profileData,
        sellingPoints: sellingPointsList,
        photos: (profileData.photos || []).map((f) => f.name),
      },
    });

    alert(
      authMode === "register"
        ? "Perfil + contraseña guardados (modo demo)."
        : "Perfil guardado (modo demo)."
    );
  };

  const handleGoPreview = () => {
    navigate("/proveedores/mi-perfil?mode=provider", {
      state: {
        basicData,
        profileData,
      },
    });
  };

  return (
    <div className="business-profile">
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
            <section className="profile-card">
              <p className="profile-card__eyebrow">Ficha visible para parejas</p>
              <h1 className="profile-card__title">Completa tu perfil</h1>
              <p className="profile-card__subtitle">
                Todo lo que captures aquí se verá en tu ficha pública, excepto
                calificación y reseñas (eso lo ponen las parejas).
              </p>

              {providerEmail && (
                <p
                  className="profile-card__subtitle"
                  style={{ marginTop: "-0.6rem" }}
                >
                  Cuenta: <strong>{providerEmail}</strong>
                </p>
              )}

              <div className="profile-progress">
                <div className="profile-progress__row">
                  <span className="profile-progress__label">
                    Progreso del perfil
                  </span>
                  <span className="profile-progress__value">
                    {completion.percent}%
                  </span>
                </div>

                <div className="profile-progress__bar" aria-hidden="true">
                  <div
                    className="profile-progress__fill"
                    style={{ width: `${completion.percent}%` }}
                  />
                </div>

                <p className="profile-progress__hint">
                  Mientras más completo tengas tu perfil, más claro será para l@s
                  novi@s quién eres, qué ofreces y por qué deberían contactarte.
                </p>
              </div>

              <form
                className="form form--grid"
                onSubmit={handleSubmit}
                noValidate
              >
                <div className="form__field form__field--full">
                  <label className="form__label" htmlFor="venueName">
                    Nombre que verán las parejas *
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
                    Ubicación *
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
                  <label className="form__label" htmlFor="capacityMin">
                    Capacidad mínima *
                  </label>
                  <input
                    id="capacityMin"
                    name="capacityMin"
                    type="number"
                    className="form__input"
                    placeholder="Ej. 120"
                    value={profileData.capacityMin}
                    onChange={handleProfileChange}
                    required
                  />
                  <span className="form__error" />
                </div>

                <div className="form__field">
                  <label className="form__label" htmlFor="capacityMax">
                    Capacidad máxima (opcional)
                  </label>
                  <input
                    id="capacityMax"
                    name="capacityMax"
                    type="number"
                    className="form__input"
                    placeholder="Ej. 250"
                    value={profileData.capacityMax}
                    onChange={handleProfileChange}
                  />
                  <span className="form__error" />
                </div>

                <div className="form__field">
                  <label className="form__label" htmlFor="priceFrom">
                    Precio desde (MXN) *
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
                    Precio hasta (MXN) *
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
                  <label className="form__label" htmlFor="shortDescription">
                    Descripción corta *
                  </label>
                  <textarea
                    id="shortDescription"
                    name="shortDescription"
                    className="form__textarea"
                    rows={3}
                    placeholder="Ej. Jardín rodeado de bugambilias..."
                    value={profileData.shortDescription}
                    onChange={handleProfileChange}
                    required
                  />
                  <span className="form__error" />
                </div>

                <div className="form__field form__field--full">
                  <label className="form__label">
                    Tipos de evento (chips)
                  </label>

                  <div className="chip-grid">
                    {EVENT_TYPE_OPTIONS.map((label) => (
                      <label
                        key={label}
                        className={
                          profileData.eventTypes.includes(label)
                            ? "chip-option chip-option--active"
                            : "chip-option"
                        }
                      >
                        <input
                          type="checkbox"
                          checked={profileData.eventTypes.includes(label)}
                          onChange={() => toggleEventType(label)}
                        />
                        {label}
                      </label>
                    ))}
                  </div>

                  <p className="form__hint" style={{ marginTop: "0.55rem" }}>
                    Puedes elegir varios.
                  </p>
                </div>

                <div className="form__field form__field--full">
                  <label className="form__label" htmlFor="sellingPointsText">
                    Puntos destacados (uno por línea)
                  </label>
                  <textarea
                    id="sellingPointsText"
                    name="sellingPointsText"
                    className="form__textarea"
                    rows={4}
                    placeholder={`Ej.\n- Ceremonia civil en el mismo lugar\n- Espacios techados y al aire libre`}
                    value={profileData.sellingPointsText}
                    onChange={handleProfileChange}
                  />
                  <span className="form__error" />
                </div>

                <div className="form__field form__field--full">
                  <label className="form__label" htmlFor="description">
                    Sobre este lugar (descripción completa) *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className="form__textarea"
                    rows={5}
                    placeholder="Describe tu espacio, estilo, qué incluye..."
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
                  />
                  <span className="form__error" />
                </div>

                <div className="form__field form__field--full">
                  <label className="form__label" htmlFor="services">
                    Servicios que ofrecen *
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
                    placeholder="Ej. horario límite, restricciones..."
                    value={profileData.rules}
                    onChange={handleProfileChange}
                  />
                  <span className="form__error" />
                </div>

                <div className="form__field form__field--full">
                  <label className="form__label" htmlFor="mapText">
                    Ubicación y accesos (texto)
                  </label>
                  <textarea
                    id="mapText"
                    name="mapText"
                    className="form__textarea"
                    rows={3}
                    placeholder="Ej. Zona sur de CDMX, a 10 minutos..."
                    value={profileData.mapText}
                    onChange={handleProfileChange}
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

                {/* ✅ NUEVO UI PRO: Dropzone */}
                <div className="form__field form__field--full">
                  <label className="form__label">Fotografías del lugar</label>

                  <div
                    className={
                      isDragActive ? "dropzone dropzone--active" : "dropzone"
                    }
                    onClick={openFilePicker}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    role="button"
                    tabIndex={0}
                    aria-label="Arrastra o selecciona fotos"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") openFilePicker();
                    }}
                  >
                    <div className="dropzone__inner">
                      <div className="dropzone__icon" aria-hidden="true">
                        ⬆️
                      </div>
                      <p className="dropzone__title">Arrastra tus fotos aquí</p>
                      <p className="dropzone__subtitle">o</p>

                      <button
                        type="button"
                        className="dropzone__button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openFilePicker();
                        }}
                      >
                        Seleccionar fotos
                      </button>

                      <p className="dropzone__hint">
                        JPG, PNG o WebP · Puedes subir varias · La primera será
                        la principal
                      </p>

                      {(profileData.photos || []).length > 0 && (
                        <p className="dropzone__count">
                          {(profileData.photos || []).length} foto(s)
                          seleccionada(s)
                        </p>
                      )}
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="dropzone__input"
                      onChange={handlePhotoInputChange}
                    />
                  </div>

                  {/* Thumbnails */}
                  {photoPreviews.length > 0 && (
                    <div className="dropzone__thumbs" aria-label="Fotos cargadas">
                      {photoPreviews.map((src, idx) => (
                        <div className="thumb" key={`${src}-${idx}`}>
                          <img
                            src={src}
                            alt={`Foto seleccionada ${idx + 1}`}
                            className="thumb__img"
                          />

                          {idx === 0 && (
                            <span className="thumb__badge">Principal</span>
                          )}

                          <button
                            type="button"
                            className="thumb__remove"
                            onClick={() => removePhotoAt(idx)}
                            aria-label={`Eliminar foto ${idx + 1}`}
                            title="Eliminar"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Seguridad */}
                <div className="form__field form__field--full">
                  <div className="security-card">
                    <h3 className="security-card__title">Seguridad</h3>
                    <p className="security-card__subtitle">
                      {authMode === "register"
                        ? "Crea tu contraseña para poder entrar a tu panel después."
                        : "Aquí puedes cambiar tu contraseña (modo demo)."}
                    </p>

                    {authMode === "register" ? (
                      <div className="security-card__grid">
                        <div className="form__field">
                          <label className="form__label" htmlFor="password">
                            Crear contraseña *
                          </label>
                          <input
                            id="password"
                            name="password"
                            type={showSecurity.password ? "text" : "password"}
                            className="form__input"
                            placeholder="Mínimo 5 caracteres"
                            value={securityData.password}
                            onChange={handleSecurityChange}
                            autoComplete="new-password"
                          />
                          <label className="form__toggle">
                            <input
                              type="checkbox"
                              checked={showSecurity.password}
                              onChange={() => toggleShow("password")}
                            />
                            Mostrar
                          </label>
                        </div>

                        <div className="form__field">
                          <label className="form__label" htmlFor="confirmPassword">
                            Confirmar contraseña *
                          </label>
                          <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showSecurity.confirmPassword ? "text" : "password"}
                            className="form__input"
                            placeholder="Repite la contraseña"
                            value={securityData.confirmPassword}
                            onChange={handleSecurityChange}
                            autoComplete="new-password"
                          />
                          <label className="form__toggle">
                            <input
                              type="checkbox"
                              checked={showSecurity.confirmPassword}
                              onChange={() => toggleShow("confirmPassword")}
                            />
                            Mostrar
                          </label>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="security-card__grid">
                          <div className="form__field">
                            <label className="form__label" htmlFor="currentPassword">
                              Contraseña actual
                            </label>
                            <input
                              id="currentPassword"
                              name="currentPassword"
                              type={showSecurity.currentPassword ? "text" : "password"}
                              className="form__input"
                              placeholder="Tu contraseña actual"
                              value={securityData.currentPassword}
                              onChange={handleSecurityChange}
                              autoComplete="current-password"
                            />
                            <label className="form__toggle">
                              <input
                                type="checkbox"
                                checked={showSecurity.currentPassword}
                                onChange={() => toggleShow("currentPassword")}
                              />
                              Mostrar
                            </label>
                          </div>

                          <div className="form__field">
                            <label className="form__label" htmlFor="newPassword">
                              Nueva contraseña
                            </label>
                            <input
                              id="newPassword"
                              name="newPassword"
                              type={showSecurity.newPassword ? "text" : "password"}
                              className="form__input"
                              placeholder="Nueva contraseña"
                              value={securityData.newPassword}
                              onChange={handleSecurityChange}
                              autoComplete="new-password"
                            />
                            <label className="form__toggle">
                              <input
                                type="checkbox"
                                checked={showSecurity.newPassword}
                                onChange={() => toggleShow("newPassword")}
                              />
                              Mostrar
                            </label>
                          </div>

                          <div className="form__field form__field--full">
                            <label className="form__label" htmlFor="confirmNewPassword">
                              Confirmar nueva contraseña
                            </label>
                            <input
                              id="confirmNewPassword"
                              name="confirmNewPassword"
                              type={showSecurity.confirmNewPassword ? "text" : "password"}
                              className="form__input"
                              placeholder="Repite la nueva contraseña"
                              value={securityData.confirmNewPassword}
                              onChange={handleSecurityChange}
                              autoComplete="new-password"
                            />
                            <label className="form__toggle">
                              <input
                                type="checkbox"
                                checked={showSecurity.confirmNewPassword}
                                onChange={() => toggleShow("confirmNewPassword")}
                              />
                              Mostrar
                            </label>
                          </div>
                        </div>

                        <div className="security-card__actions">
                          <button
                            type="button"
                            className="btn btn--ghost"
                            onClick={handleChangePassword}
                          >
                            Actualizar contraseña (modo demo)
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div
                  className="form__actions form__field--full"
                  style={{ gap: "0.7rem" }}
                >
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => navigate("/empresas/registro")}
                  >
                    Volver al registro inicial
                  </button>

                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={handleGoPreview}
                  >
                    Ver mi perfil (vista proveedor)
                  </button>

                  <button type="submit" className="btn btn--primary">
                    Guardar ficha (modo demo)
                  </button>
                </div>
              </form>
            </section>

            <aside className="profile-preview">
              <section className="preview-card">
                <span className="preview-card__pill">Vista previa</span>

                <h2 className="preview-card__title">
                  {profileData.venueName || "Nombre del lugar"}
                </h2>

                <p className="preview-card__subtitle">
                  {profileData.venueLocation || "Ubicación del venue"}
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    flexWrap: "wrap",
                    marginBottom: "0.8rem",
                  }}
                >
                  <span className="preview-card__chip">
                    Capacidad:{" "}
                    {profileData.capacityMin
                      ? `${profileData.capacityMin}${
                          profileData.capacityMax
                            ? `–${profileData.capacityMax}`
                            : ""
                        }`
                      : "N/D"}
                  </span>
                  <span className="preview-card__chip">
                    Desde ${profileData.priceFrom ? formatMXN(profileData.priceFrom) : "—"}{" "}
                    a ${profileData.priceTo ? formatMXN(profileData.priceTo) : "—"}
                  </span>
                </div>

                <div className="preview-card__photo-main">
                  <img src={mainPhoto} alt="Vista previa del venue" />
                </div>

                {photoPreviews.length > 1 && (
                  <div className="preview-card__gallery" aria-label="Galería">
                    {photoPreviews.slice(1, 4).map((src, idx) => (
                      <div
                        className="preview-card__gallery-item"
                        key={`${src}-${idx}`}
                      >
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