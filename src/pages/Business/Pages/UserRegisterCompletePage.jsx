// src/pages/Business/Pages/UserRegisterCompletePage.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  clearPendingRegistration,
  getPendingRegistration,
  getCurrentUser,
  registerUserFinal,
} from "../../../utils/userStorage.js";

function UserRegisterCompletePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Si ya está logueado (por ejemplo, ya se registró), mándalo al perfil
  useEffect(() => {
    const u = getCurrentUser();
    if (u) navigate("/perfil");
  }, [navigate]);

  const pending = getPendingRegistration();

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

  // Si no hay pending, regresa a /registro
  useEffect(() => {
    if (!pending) navigate("/registro");
  }, [pending, navigate]);

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

  async function handleSubmit(evt) {
    evt.preventDefault();

    const { password, confirmPassword } = formData;

    // Aquí SÍ exigimos contraseña (es el “compromiso” del paso 2)
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

    try {
      // Creamos el usuario real en backend
      await registerUserFinal({
        email: formData.email,
        password,
        name: formData.fullName,
      });

      // Ya no necesitamos el pending
      clearPendingRegistration();

      // De momento mandamos a perfil
      navigate("/perfil");
    } catch (err) {
      console.error(err);
      // Mensajes típicos del backend
      if (err?.status === 409) {
        setSubmitError("Ese correo ya existe. Intenta iniciar sesión.");
        return;
      }
      setSubmitError(err?.message || "No se pudo completar el registro.");
    }
  }

  if (!pending) return null;

  return (
    <div className="user-register-complete">
      <header className="business-auth__header">
        <div className="business-auth__header-inner container">
          <span className="business-auth__logo-text">Kelom · Registro</span>
          <span className="business-auth__logo-pill">Paso 2 de 2</span>
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

              {submitError && (
                <div className="form__error" style={{ marginTop: "0.6rem" }}>
                  {submitError}
                </div>
              )}

              <div className="form__actions">
                <button type="submit" className="btn btn--primary">
                  Crear cuenta
                </button>
                <Link to="/" className="btn btn--ghost">
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
