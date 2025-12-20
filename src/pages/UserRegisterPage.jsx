// src/pages/UserRegisterPage.jsx
import "../../src/styles/global.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUser,
  findUserByEmail,
  getCurrentUser,
  setCurrentUserEmail,
  updateUserByEmail,
} from "../utils/userStorage.js";

function UserRegisterPage() {
  const navigate = useNavigate();
  const existingUser = getCurrentUser();

  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
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
  });

  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");

  // Prellenar si ya hay usuario logueado
  useEffect(() => {
    if (existingUser) {
      setFormValues((prev) => ({
        ...prev,
        email: existingUser.email || "",
        password: existingUser.password || "",
        confirmPassword: existingUser.password || "",
        fullName: existingUser.fullName || "",
        phone: existingUser.phone || "",
        gender: existingUser.gender || "",
        partnerName: existingUser.partnerName || "",
        city: existingUser.city || "",
        weddingDate: existingUser.weddingDate || "",
        guests: existingUser.guests || "",
        budgetRange: existingUser.budgetRange || "",
        ceremonyType: existingUser.ceremonyType || "",
        receptionType: existingUser.receptionType || "",
        supportFocus: existingUser.supportFocus || "",
        biggestDoubt: existingUser.biggestDoubt || "",
        contactPreference: existingUser.contactPreference || "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setGlobalError("");
  }

  function validate() {
    const newErrors = {};

    if (!formValues.email.trim()) {
      newErrors.email = "El correo es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email.trim())) {
      newErrors.email = "Escribe un correo válido.";
    } else {
      const existing = findUserByEmail(formValues.email);
      if (existing && (!existingUser || existing.email !== existingUser.email)) {
        newErrors.email = "Ya existe una cuenta con este correo.";
      }
    }

    if (!formValues.fullName.trim()) {
      newErrors.fullName = "Cuéntanos tu nombre.";
    }

    if (!formValues.phone.trim()) {
      newErrors.phone = "El teléfono es obligatorio.";
    } else if (!/^\d{10}$/.test(formValues.phone.trim())) {
      newErrors.phone = "Debe tener exactamente 10 dígitos.";
    } else if (/(\d)\1{4,}/.test(formValues.phone.trim())) {
      newErrors.phone = "Evita más de 5 dígitos idénticos seguidos.";
    }

    if (!formValues.password) {
      newErrors.password = "Define una contraseña.";
    } else if (formValues.password.length < 5) {
      newErrors.password = "Mínimo 5 caracteres.";
    }

    if (!formValues.confirmPassword) {
      newErrors.confirmPassword = "Confirma tu contraseña.";
    } else if (formValues.confirmPassword !== formValues.password) {
      newErrors.confirmPassword = "Las contraseñas no coinciden.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // % de perfil completado
  const completion = useMemo(() => {
    const allKeys = [
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

    const filled = allKeys.filter(
      (key) => !!formValues[key]?.toString().trim()
    ).length;
    const total = allKeys.length;

    if (total === 0) return 0;
    return Math.round((filled / total) * 100);
  }, [formValues]);

  function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    const payload = {
      email: formValues.email.trim(),
      password: formValues.password,
      fullName: formValues.fullName.trim(),
      phone: formValues.phone.trim(),
      gender: formValues.gender,
      partnerName: formValues.partnerName,
      city: formValues.city,
      weddingDate: formValues.weddingDate,
      guests: formValues.guests,
      budgetRange: formValues.budgetRange,
      ceremonyType: formValues.ceremonyType,
      receptionType: formValues.receptionType,
      supportFocus: formValues.supportFocus,
      biggestDoubt: formValues.biggestDoubt,
      contactPreference: formValues.contactPreference,
    };

    try {
      let user;
      if (existingUser) {
        user = updateUserByEmail(existingUser.email, payload);
      } else {
        user = createUser(payload);
      }

      setCurrentUserEmail(user.email);
      navigate("/mi-perfil");
    } catch (e) {
      console.error(e);
      setGlobalError("Hubo un problema guardando tus datos. Intenta de nuevo.");
    }
  }

  const isEditMode = !!existingUser;

  return (
    <div className="user-register">
      <div className="user-register__container">
        <div className="user-register__grid">
          <section className="register-card">
            <p className="register-card__eyebrow">
              {isEditMode ? "Actualiza tu perfil" : "Alta inicial"}
            </p>
            <h1 className="register-card__title">
              {isEditMode
                ? "Sigue completando tu perfil de boda"
                : "Crea tu cuenta de novia o novio"}
            </h1>
            <p className="register-card__subtitle">
              Los datos básicos (correo, teléfono, nombre y contraseña) son
              obligatorios. Lo demás puedes completarlo poco a poco.
            </p>

            <div className="profile-progress">
              <div className="profile-progress__label">
                Perfil completado: {completion}%
              </div>
              <div className="profile-progress__bar">
                <div
                  className="profile-progress__fill"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>

            <form className="form form--grid" onSubmit={handleSubmit} noValidate>
              {/* Obligatorios */}
              <div className="form__field form__field--full">
                <label className="form__label" htmlFor="email">
                  Correo electrónico (será tu usuario)
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form__input"
                  placeholder="tucorreo@ejemplo.com"
                  value={formValues.email}
                  onChange={handleChange}
                />
                <div className="form__error">{errors.email}</div>
              </div>

              <div className="form__field">
                <label className="form__label" htmlFor="fullName">
                  Nombre completo
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  className="form__input"
                  placeholder="Nombre y apellido"
                  value={formValues.fullName}
                  onChange={handleChange}
                />
                <div className="form__error">{errors.fullName}</div>
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
                  value={formValues.phone}
                  onChange={handleChange}
                />
                <div className="form__error">{errors.phone}</div>
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
                  value={formValues.password}
                  onChange={handleChange}
                />
                <div className="form__error">{errors.password}</div>
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
                  value={formValues.confirmPassword}
                  onChange={handleChange}
                />
                <div className="form__error">{errors.confirmPassword}</div>
              </div>

              {/* Opcionales útiles */}
              <div className="form__field">
                <label className="form__label" htmlFor="gender">
                  ¿Cómo te identificas?
                </label>
                <select
                  id="gender"
                  name="gender"
                  className="form__select"
                  value={formValues.gender}
                  onChange={handleChange}
                >
                  <option value="">Selecciona una opción</option>
                  <option value="novia">Novia</option>
                  <option value="novio">Novio</option>
                  <option value="pareja">Cuenta compartida</option>
                  <option value="no-binario">No binarie / otra</option>
                  <option value="prefiero-no-decirlo">
                    Prefiero no decirlo
                  </option>
                </select>
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
                  placeholder="Nombre de tu pareja"
                  value={formValues.partnerName}
                  onChange={handleChange}
                />
              </div>

              <div className="form__field">
                <label className="form__label" htmlFor="city">
                  Ciudad / zona del evento
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  className="form__input"
                  placeholder="CDMX, Puebla, Querétaro..."
                  value={formValues.city}
                  onChange={handleChange}
                />
              </div>

              <div className="form__field">
                <label className="form__label" htmlFor="weddingDate">
                  Fecha de boda (real o tentativa)
                </label>
                <input
                  id="weddingDate"
                  name="weddingDate"
                  type="date"
                  className="form__input"
                  value={formValues.weddingDate}
                  onChange={handleChange}
                />
              </div>

              <div className="form__field">
                <label className="form__label" htmlFor="guests">
                  Número aproximado de invitad@s
                </label>
                <input
                  id="guests"
                  name="guests"
                  type="number"
                  min="0"
                  className="form__input"
                  placeholder="Ej. 150"
                  value={formValues.guests}
                  onChange={handleChange}
                />
              </div>

              <div className="form__field">
                <label className="form__label" htmlFor="budgetRange">
                  Presupuesto aproximado
                </label>
                <select
                  id="budgetRange"
                  name="budgetRange"
                  className="form__select"
                  value={formValues.budgetRange}
                  onChange={handleChange}
                >
                  <option value="">Aún no lo tenemos claro</option>
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
                  className="form__select"
                  value={formValues.ceremonyType}
                  onChange={handleChange}
                >
                  <option value="">Aún no decidimos</option>
                  <option value="civil">Civil</option>
                  <option value="religiosa">Religiosa</option>
                  <option value="simbólica">Simbólica</option>
                  <option value="mixta">Mixta</option>
                </select>
              </div>

              <div className="form__field">
                <label className="form__label" htmlFor="receptionType">
                  Tipo de recepción que imaginas
                </label>
                <select
                  id="receptionType"
                  name="receptionType"
                  className="form__select"
                  value={formValues.receptionType}
                  onChange={handleChange}
                >
                  <option value="">Aún no estamos seguros</option>
                  <option value="jardin">Jardín / hacienda</option>
                  <option value="salon">Salón</option>
                  <option value="playa">Playa</option>
                  <option value="terraza">Terraza</option>
                  <option value="otro">Otro tipo de lugar</option>
                </select>
              </div>

              <div className="form__field form__field--full">
                <label className="form__label" htmlFor="supportFocus">
                  ¿En qué te gustaría que te ayudáramos más?
                </label>
                <textarea
                  id="supportFocus"
                  name="supportFocus"
                  className="form__textarea"
                  placeholder="Ej: elegir lugar, organizar tiempos, presupuesto, ideas de decoración..."
                  value={formValues.supportFocus}
                  onChange={handleChange}
                />
              </div>

              <div className="form__field form__field--full">
                <label className="form__label" htmlFor="biggestDoubt">
                  ¿Cuál es tu duda más presente sobre tu gran día?
                </label>
                <textarea
                  id="biggestDoubt"
                  name="biggestDoubt"
                  className="form__textarea"
                  placeholder="Lo que más te inquieta ahora mismo..."
                  value={formValues.biggestDoubt}
                  onChange={handleChange}
                />
              </div>

              <div className="form__field form__field--full">
                <label className="form__label" htmlFor="contactPreference">
                  ¿Cómo prefieres que te contactemos?
                </label>
                <select
                  id="contactPreference"
                  name="contactPreference"
                  className="form__select"
                  value={formValues.contactPreference}
                  onChange={handleChange}
                >
                  <option value="">No estoy segura todavía</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="llamada">Llamada</option>
                  <option value="correo">Correo electrónico</option>
                </select>
              </div>

              <div className="form__field form__field--full">
                <label className="form__label" htmlFor="avatar">
                  Foto opcional
                </label>
                <input
                  id="avatar"
                  name="avatar"
                  type="file"
                  accept="image/*"
                  className="form__input form__input--file"
                  onChange={() => {
                    // De momento no se guarda en ningún lado (no hay backend).
                  }}
                />
                <p className="form__hint">
                  En esta versión todo se guarda en tu navegador, así que la
                  foto no se almacena todavía en un servidor real.
                </p>
              </div>

              {globalError && (
                <div className="form__error form__field--full">
                  {globalError}
                </div>
              )}

              <div className="form__actions form__field--full">
                <button type="submit" className="btn btn--primary">
                  {isEditMode ? "Guardar cambios" : "Crear mi cuenta"}
                </button>
              </div>
            </form>
          </section>

          <aside className="preview-card">
            <h2 className="preview-card__title">
              ¿Por qué te pedimos estos datos?
            </h2>
            <p className="preview-card__subtitle">
              No es chisme, es para afinar las recomendaciones:
            </p>
            <ul className="preview-card__text">
              <li>• Ciudad = mejores venues y proveedores cercanos.</li>
              <li>• Invitad@s = lugares con capacidad realista.</li>
              <li>
                • Tus dudas = contenido y acompañamiento más útil para ti.
              </li>
            </ul>
            <p
              className="preview-card__text"
              style={{ marginTop: "0.8rem", fontSize: "0.9rem" }}
            >
              Más adelante podrás conectar este perfil con tus proveedores y
              tener todo en un mismo espacio.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default UserRegisterPage;
