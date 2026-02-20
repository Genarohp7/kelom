// src/pages/Business/Pages/UserRegisterCompletePage.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  clearPendingRegistration,
  getPendingRegistration,
} from "../../../utils/userStorage.js";

import {
  getToken,
  fetchMe,
  registerUser,
  login,
  saveMyWeddingProfile,
  fetchMyWeddingProfile,
  logout,
} from "../../../utils/auth.js";

function UserRegisterCompletePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const pending = getPendingRegistration();
  const hasToken = !!getToken();

  const [formData, setFormData] = useState(() => ({
    email: pending?.email || "",
    fullName: pending?.fullName || "",
    phone: pending?.phone || "",
    gender: "",
    partnerName: "",
    city: "",
    weddingDate: "",
    guests: "",
    budgetRange: "",
    ceremonyType: "",
    receptionType: "",
    supportFocus: "",
    biggestDoubt: "",
    contactPreference: "",
    password: "",
    confirmPassword: "",
    avatar: "",
  }));

  const [passwordError, setPasswordError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(hasToken);

  // Si no hay pending y no hay sesión, regresa a /registro
  useEffect(() => {
    const token = getToken();
    if (!pending && !token) navigate("/registro");
  }, [pending, navigate]);

  // Si hay sesión, cargamos datos reales (me + ficha)
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    let cancelled = false;

    setIsLoadingInitial(true);
    Promise.all([fetchMe(), fetchMyWeddingProfile()])
      .then(([me, profile]) => {
        if (cancelled) return;

        const weddingDate =
          profile?.wedding_date instanceof Date
            ? profile.wedding_date.toISOString().slice(0, 10)
            : profile?.wedding_date || "";

        setFormData((prev) => ({
          ...prev,
          email: me?.email || prev.email,
          fullName: me?.name || prev.fullName,
          phone: profile?.phone || prev.phone || "",
          gender: profile?.gender || "",
          partnerName: profile?.partner_name || "",
          city: profile?.city || "",
          weddingDate,
          guests:
            profile?.guests === 0 || profile?.guests
              ? String(profile.guests)
              : "",
          budgetRange: profile?.budget_range || "",
          ceremonyType: profile?.ceremony_type || "",
          receptionType: profile?.reception_type || "",
          supportFocus: profile?.support_focus || "",
          biggestDoubt: profile?.biggest_doubt || "",
          contactPreference: profile?.contact_preference || "",
          password: "",
          confirmPassword: "",
        }));
      })
      .catch(() => {
        // token inválido/expirado o backend no responde
        logout();
        if (cancelled) return;
        navigate("/acceso", { replace: true });
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoadingInitial(false);
      });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const completion = useMemo(() => {
    const keys = [
      "email",
      "fullName",
      "phone",
      "gender",
      "partnerName",
      "city",
      "weddingDate",
      "guests",
      "budgetRange",
      "ceremonyType",
      "receptionType",
      "supportFocus",
      "biggestDoubt",
      "contactPreference",
    ];
    const filled = keys.filter((k) => !!formData[k]?.toString().trim()).length;
    return Math.round((filled / keys.length) * 100);
  }, [formData]);

  function handleChange(evt) {
    const { name, value } = evt.target;

    if (name === "password" || name === "confirmPassword") {
      setPasswordError("");
    }
    setSubmitError("");

    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleAvatarChange(evt) {
    const file = evt.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setFormData((prev) => ({ ...prev, avatar: dataUrl }));
    };
    reader.readAsDataURL(file);
  }

  function buildProfilePayload() {
    const phoneDigits = (formData.phone || "").replace(/\D/g, "");
    const guests =
      formData.guests === "" || formData.guests === null || formData.guests === undefined
        ? null
        : Number(formData.guests);

    return {
      name: formData.fullName?.trim() || null,
      phone: phoneDigits || null,
      gender: formData.gender?.trim() || null,
      partnerName: formData.partnerName?.trim() || null,
      city: formData.city?.trim() || null,
      weddingDate: formData.weddingDate || null,
      guests: Number.isFinite(guests) ? guests : null,
      budgetRange: formData.budgetRange || null,
      ceremonyType: formData.ceremonyType || null,
      receptionType: formData.receptionType || null,
      supportFocus: formData.supportFocus?.trim() || null,
      biggestDoubt: formData.biggestDoubt?.trim() || null,
      contactPreference: formData.contactPreference || null,
    };
  }

  async function handleSubmit(evt) {
    evt.preventDefault();
    if (isSubmitting) return;

    const token = getToken();
    const isEditMode = !!token;

    const email = formData.email?.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    // Si es registro nuevo (sin token), aquí SÍ exigimos contraseña
    if (!isEditMode) {
      if (!password || !confirmPassword) {
        setPasswordError("Escribe y confirma tu contraseña.");
        return;
      }
      if (password.length < 5) {
        setPasswordError("La contraseña debe tener al menos 5 caracteres.");
        return;
      }
      if (password !== confirmPassword) {
        setPasswordError("Las contraseñas no coinciden.");
        return;
      }
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");

      const profilePayload = buildProfilePayload();

      if (isEditMode) {
        // Guardar cambios (usuario ya logueado)
        await saveMyWeddingProfile(profilePayload);

        // refresca cache del user (por si cambió el nombre)
        await fetchMe().catch(() => {});

        navigate("/perfil");
        return;
      }

      // Registro nuevo (2/2)
      await registerUser({
        email,
        password,
        name: formData.fullName,
      });

      await login(email, password);

      // Guardar ficha ya con JWT
      await saveMyWeddingProfile(profilePayload);

      clearPendingRegistration();
      navigate("/perfil");
    } catch (err) {
      console.error(err);

      const msg = String(err?.message || "");

      if (msg.toLowerCase().includes("ya existe") || msg.includes("409")) {
        setSubmitError("Ese correo ya existe. Intenta iniciar sesión.");
      } else if (msg.toLowerCase().includes("cors")) {
        setSubmitError("Bloqueado por CORS. Revisa allowedOrigins en el backend.");
      } else {
        setSubmitError(msg || "No se pudo completar el registro.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!pending && !hasToken) return null;

  if (isLoadingInitial) {
    return (
      <div className="user-register-complete">
        <header className="business-auth__header">
          <div className="business-auth__header-inner container">
            <span className="business-auth__logo-text">Kelom · Registro</span>
            <span className="business-auth__logo-pill">Cargando…</span>
          </div>
        </header>

        <main className="business-profile__content">
          <div className="business-profile__container profile-layout">
            <section className="profile-card">
              <p style={{ padding: "1.8rem" }}>Cargando tu ficha…</p>
            </section>
          </div>
        </main>
      </div>
    );
  }

  const isEditMode = !!getToken();

  return (
    <div className="user-register-complete">
      <header className="business-auth__header">
        <div className="business-auth__header-inner container">
          <span className="business-auth__logo-text">Kelom · Registro</span>
          <span className="business-auth__logo-pill">
            {isEditMode ? "Editar perfil" : "Paso 2 de 2"}
          </span>
        </div>
      </header>

      <main className="business-profile__content">
        <div className="business-profile__container profile-layout">
          <section className="profile-card">
            <p className="profile-card__eyebrow">Detalles de tu boda</p>

            <div className="profile-card__title-row">
              <h1 className="profile-card__title">Completa tu ficha de novi@s</h1>
              <span className="profile-card__completion">
                Perfil completado: {completion}%
              </span>
            </div>

            <p className="profile-card__subtitle">
              Mientras más información tengamos, mejor podremos ayudarte.
            </p>

            <form className="form form--grid" onSubmit={handleSubmit}>
              <div className="form__field form__field--full">
                <label className="form__label" htmlFor="fullName">
                  Nombre completo
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  className="form__input"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>

              <div className="form__field">
                <label className="form__label" htmlFor="partnerName">
                  Nombre de tu pareja
                </label>
                <input
                  id="partnerName"
                  name="partnerName"
                  type="text"
                  className="form__input"
                  value={formData.partnerName}
                  onChange={handleChange}
                />
              </div>

              <div className="form__field">
                <label className="form__label" htmlFor="gender">
                  Cómo te identificas
                </label>
                <select
                  id="gender"
                  name="gender"
                  className="form__input"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Prefiero no decir / Otro</option>
                  <option value="mujer">Mujer</option>
                  <option value="hombre">Hombre</option>
                  <option value="no-binario">No binario</option>
                </select>
              </div>

              <div className="form__field">
                <label className="form__label" htmlFor="city">
                  Ciudad donde planean casarse
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  className="form__input"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>

              <div className="form__field">
                <label className="form__label" htmlFor="weddingDate">
                  Fecha de la boda
                </label>
                <input
                  id="weddingDate"
                  name="weddingDate"
                  type="date"
                  className="form__input"
                  value={formData.weddingDate}
                  onChange={handleChange}
                />
              </div>

              <div className="form__field">
                <label className="form__label" htmlFor="guests">
                  Invitad@s aprox.
                </label>
                <input
                  id="guests"
                  name="guests"
                  type="number"
                  min="0"
                  className="form__input"
                  value={formData.guests}
                  onChange={handleChange}
                />
              </div>

              <div className="form__field">
                <label className="form__label" htmlFor="budgetRange">
                  Presupuesto aprox.
                </label>
                <select
                  id="budgetRange"
                  name="budgetRange"
                  className="form__input"
                  value={formData.budgetRange}
                  onChange={handleChange}
                >
                  <option value="">Aún no lo sé</option>
                  <option value="low">Hasta $150,000</option>
                  <option value="medium">$150,000 - $300,000</option>
                  <option value="high">Más de $300,000</option>
                </select>
              </div>

              <div className="form__field">
                <label className="form__label" htmlFor="ceremonyType">
                  Tipo de ceremonia
                </label>
                <select
                  id="ceremonyType"
                  name="ceremonyType"
                  className="form__input"
                  value={formData.ceremonyType}
                  onChange={handleChange}
                >
                  <option value="">Aún no estoy segur@</option>
                  <option value="civil">Civil</option>
                  <option value="religiosa">Religiosa</option>
                  <option value="simbolica">Simbólica</option>
                  <option value="otra">Otra</option>
                </select>
              </div>

              <div className="form__field">
                <label className="form__label" htmlFor="receptionType">
                  Tipo de recepción
                </label>
                <select
                  id="receptionType"
                  name="receptionType"
                  className="form__input"
                  value={formData.receptionType}
                  onChange={handleChange}
                >
                  <option value="">Aún no estoy segur@</option>
                  <option value="jardin">Jardín</option>
                  <option value="salon">Salón</option>
                  <option value="hacienda">Hacienda</option>
                  <option value="playa">Playa</option>
                  <option value="restaurante">Restaurante</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div className="form__field form__field--full">
                <label className="form__label" htmlFor="supportFocus">
                  ¿En qué te gustaría apoyo?
                </label>
                <textarea
                  id="supportFocus"
                  name="supportFocus"
                  className="form__textarea"
                  value={formData.supportFocus}
                  onChange={handleChange}
                />
              </div>

              <div className="form__field form__field--full">
                <label className="form__label" htmlFor="biggestDoubt">
                  Tu duda más grande
                </label>
                <textarea
                  id="biggestDoubt"
                  name="biggestDoubt"
                  className="form__textarea"
                  value={formData.biggestDoubt}
                  onChange={handleChange}
                />
              </div>

              <div className="form__field form__field--full">
                <label className="form__label" htmlFor="contactPreference">
                  Preferencia de contacto
                </label>
                <select
                  id="contactPreference"
                  name="contactPreference"
                  className="form__input"
                  value={formData.contactPreference}
                  onChange={handleChange}
                >
                  <option value="">Sin preferencia</option>
                  <option value="email">Correo</option>
                  <option value="phone">Llamada</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>

              {!isEditMode && (
                <>
                  <div className="form__field">
                    <label className="form__label" htmlFor="password">
                      Contraseña
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      className="form__input"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Mínimo 5 caracteres"
                    />
                  </div>

                  <div className="form__field">
                    <label className="form__label" htmlFor="confirmPassword">
                      Confirmar contraseña
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      className="form__input"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>

                  {passwordError && (
                    <div className="form__error form__error--password">
                      {passwordError}
                    </div>
                  )}
                </>
              )}

              {submitError && (
                <div className="form__error" style={{ marginTop: "0.6rem" }}>
                  {submitError}
                </div>
              )}

              <div className="form__actions">
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Guardando..."
                    : isEditMode
                    ? "Guardar cambios"
                    : "Crear cuenta"}
                </button>

                <Link to={isEditMode ? "/perfil" : "/"} className="btn btn--ghost">
                  Cancelar
                </Link>
              </div>
            </form>
          </section>

          <aside className="preview-card">
            <h2 className="preview-card__title">Foto de perfil</h2>
            <p className="preview-card__subtitle">Agrega una foto si quieres.</p>

            <div className="profile-avatar-upload">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="profile-avatar__button"
              >
                {formData.avatar ? (
                  <img
                    src={formData.avatar}
                    alt={`Foto de perfil de ${formData.fullName || "usuario"}`}
                    className="profile-avatar__image"
                  />
                ) : (
                  <span className="profile-avatar__placeholder">Foto de perfil</span>
                )}

                <span className="profile-avatar__edit-icon">
                  <i className="fa-solid fa-pen"></i>
                </span>
              </button>

              <input
                ref={fileInputRef}
                id="avatar"
                name="avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="profile-avatar__file-input"
              />

              <p className="form__hint profile-avatar-upload__hint">
                JPG o PNG. (Luego validamos tamaño.)
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default UserRegisterCompletePage;