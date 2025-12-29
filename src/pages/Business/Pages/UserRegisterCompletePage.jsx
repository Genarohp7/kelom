// src/pages/UserRegisterCompletePage.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getCurrentUser,
  updateCurrentUserProfile,
} from "../../../utils/userStorage";

function UserRegisterCompletePage() {
  const navigate = useNavigate();

  // 1) Leemos al usuario UNA sola vez, fuera del efecto
  const [user] = useState(() => getCurrentUser());

  // 2) Inicializamos el formulario con los datos del usuario (si existen)
  const [formData, setFormData] = useState(() => ({
    email: user?.email || "",
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    gender: user?.gender || "",
    partnerName: user?.partnerName || "",
    city: user?.city || "",
    weddingDate: user?.weddingDate || "",
    guests: user?.guests || "",
    budgetRange: user?.budgetRange || "",
    ceremonyType: user?.ceremonyType || "",
    receptionType: user?.receptionType || "",
    supportFocus: user?.supportFocus || "",
    biggestDoubt: user?.biggestDoubt || "",
    contactPreference: user?.contactPreference || "",
  }));

  // 3) El efecto SOLO redirige, no hace setState
  useEffect(() => {
    if (!user) {
      navigate("/registro");
    }
  }, [user, navigate]);

  // 4) Cálculo del porcentaje de completitud del perfil
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

  if (!user) return null;

  function handleChange(evt) {
    const { name, value } = evt.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(evt) {
    evt.preventDefault();
    try {
      updateCurrentUserProfile(formData);
      navigate("/perfil");
    } catch (err) {
      alert(err.message || "No se pudo guardar tu información.");
    }
  }

  return (
    <div className="user-register-complete">
      {/* Header del flujo de registro de usuari@s */}
      <header className="business-auth__header">
        <div className="business-auth__header-inner container">
          <span className="business-auth__logo-text">Kelom · Registro</span>
          <span className="business-auth__logo-pill">Paso 2 de 2</span>
        </div>
      </header>

      <main className="business-profile__content">
        <div className="business-profile__container profile-layout">
          {/* Columna izquierda: formulario */}
          <section className="profile-card">
            <p className="profile-card__eyebrow">Detalles de tu boda</p>
            <h1 className="profile-card__title">Completa tu ficha de novi@s</h1>
            <p className="profile-card__subtitle">
              Mientras más información tengamos, mejor podremos ayudarte a
              encontrar lugares y proveedores que encajen con lo que buscas.
            </p>

            <form className="form form--grid" onSubmit={handleSubmit}>
              {/* Información básica */}
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
                  placeholder="Tu nombre y apellido"
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
                  placeholder="Nombre de tu pareja"
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

              {/* Detalles de la boda */}
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
                  placeholder="Ej. CDMX, Querétaro, Puebla..."
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
                  Número aproximado de invitad@s
                </label>
                <input
                  id="guests"
                  name="guests"
                  type="number"
                  min="0"
                  className="form__input"
                  value={formData.guests}
                  onChange={handleChange}
                  placeholder="Ej. 150"
                />
              </div>

              <div className="form__field">
                <label className="form__label" htmlFor="budgetRange">
                  Presupuesto aproximado
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

              {/* Ceremonia y recepción */}
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
                  Tipo de recepción que imaginan
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
                  <option value="otro">Otro formato</option>
                </select>
              </div>

              {/* Cómo podemos ayudar */}
              <div className="form__field form__field--full">
                <label className="form__label" htmlFor="supportFocus">
                  ¿En qué te gustaría que te apoyáramos más?
                </label>
                <textarea
                  id="supportFocus"
                  name="supportFocus"
                  className="form__textarea"
                  value={formData.supportFocus}
                  onChange={handleChange}
                  placeholder="Ej. ayuda para elegir lugar, organizar el presupuesto, coordinar proveedores..."
                />
              </div>

              <div className="form__field form__field--full">
                <label className="form__label" htmlFor="biggestDoubt">
                  ¿Cuál es tu duda más grande sobre el gran día?
                </label>
                <textarea
                  id="biggestDoubt"
                  name="biggestDoubt"
                  className="form__textarea"
                  value={formData.biggestDoubt}
                  onChange={handleChange}
                  placeholder="Cuéntanos qué te preocupa o qué te tiene más en duda."
                />
              </div>

              <div className="form__field form__field--full">
                <label className="form__label" htmlFor="contactPreference">
                  ¿Cómo prefieres que te contactemos?
                </label>
                <select
                  id="contactPreference"
                  name="contactPreference"
                  className="form__input"
                  value={formData.contactPreference}
                  onChange={handleChange}
                >
                  <option value="">Sin preferencia</option>
                  <option value="email">Correo electrónico</option>
                  <option value="phone">Llamada telefónica</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>

              {/* Botones */}
              <div className="form__actions">
                <button type="submit" className="btn btn--primary">
                  Guardar información
                </button>
                <Link to="/perfil" className="btn btn--ghost">
                  Guardar y ver mi perfil
                </Link>
              </div>
            </form>
          </section>

          {/* Columna derecha: explicación + porcentaje */}
          <aside className="preview-card">
            <span className="preview-card__pill">
              Perfil completado: {completion}%
            </span>
            <h2 className="preview-card__title">
              ¿Para qué usamos estos datos?
            </h2>
            <p className="preview-card__subtitle">
              Con tu ficha completa podremos:
            </p>
            <p className="preview-card__text">
              • Recomendarte venues con el aforo y presupuesto adecuados. <br />
              • Conectar contigo con proveedores que tengan sentido para tu
              estilo de boda. <br />• Enviarte tips y recordatorios según lo
              cerca que esté tu fecha.
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default UserRegisterCompletePage;
