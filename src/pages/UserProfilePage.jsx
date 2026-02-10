// src/pages/UserProfilePage.jsx
import { Link, Navigate, useNavigate } from "react-router-dom";
import { getCurrentUser, logoutCurrentUser } from "../utils/userStorage.js";

function UserProfilePage() {
  const navigate = useNavigate();
  const user = getCurrentUser(); // leemos directamente del storage

  // Si no hay usuario, redirigimos al login
  if (!user) {
    return <Navigate to="/acceso" replace />;
  }

  // Cálculo del porcentaje de completitud del perfil (sin hooks)
  const completion = (() => {
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

    const filled = keys.filter((k) => !!user[k]?.toString().trim()).length;
    const total = keys.length;
    if (total === 0) return 0;
    return Math.round((filled / total) * 100);
  })();

  function handleLogout() {
    logoutCurrentUser();
    navigate("/");
  }

  return (
    <div className="user-profile">
      <div className="user-profile__container">
        <div className="user-profile__grid">
          <section className="profile-card">
            <p className="profile-card__eyebrow">Tu resumen</p>
            <h1 className="profile-card__title">Hola, {user.fullName}</h1>

            {/* Foto de perfil si existe */}
            {user.avatar && (
              <div
                className="profile-card__avatar"
                style={{ marginTop: "0.8rem", marginBottom: "0.8rem" }}
              >
                <img
                  src={user.avatar}
                  alt={`Foto de perfil de ${user.fullName}`}
                  style={{
                    width: "96px",
                    height: "96px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "3px solid rgba(232, 154, 169, 0.6)",
                  }}
                />
              </div>
            )}

            <p className="profile-card__subtitle">
              Esta es una vista rápida de la información de tu boda. Puedes
              actualizarla cuando quieras.
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

            <dl
              style={{
                marginTop: "1.1rem",
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1.4fr)",
                rowGap: "0.4rem",
                columnGap: "0.9rem",
                fontSize: "0.9rem",
              }}
            >
              <dt>Correo</dt>
              <dd>{user.email}</dd>

              <dt>Teléfono</dt>
              <dd>{user.phone || "Sin definir"}</dd>

              <dt>Ciudad</dt>
              <dd>{user.city || "Sin definir"}</dd>

              <dt>Fecha de boda</dt>
              <dd>{user.weddingDate || "Aún por definir"}</dd>

              <dt>Número de invitad@s</dt>
              <dd>{user.guests || "Aún no seguro"}</dd>

              <dt>Presupuesto aproximado</dt>
              <dd>
                {user.budgetRange === "low" && "Hasta $150,000"}
                {user.budgetRange === "medium" && "$150,000 - $300,000"}
                {user.budgetRange === "high" && "Más de $300,000"}
                {!user.budgetRange && "Sin definir"}
              </dd>

              <dt>Tipo de ceremonia</dt>
              <dd>{user.ceremonyType || "Sin definir"}</dd>

              <dt>Tipo de recepción</dt>
              <dd>{user.receptionType || "Sin definir"}</dd>

              <dt>Preferencia de contacto</dt>
              <dd>{user.contactPreference || "Sin definir"}</dd>
            </dl>

            <div className="form__actions" style={{ marginTop: "1.6rem" }}>
              <Link to="/registro/completar" className="btn btn--primary">
                Completar / editar mi perfil
              </Link>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            </div>
          </section>

          <aside className="preview-card">
            <h2 className="preview-card__title">¿Qué sigue?</h2>
            <p className="preview-card__subtitle">Próximos pasos de Kelom:</p>
            <ul className="preview-card__text">
              <li>• Guardar venues y proveedores como favoritos.</li>
              <li>• Compartir tu ficha con proveedores para cotizar más fácil.</li>
              <li>• Recordatorios y tips según la fecha de tu boda.</li>
            </ul>
            <p
              className="preview-card__text"
              style={{ marginTop: "0.8rem", fontSize: "0.9rem" }}
            >
              Tener tu perfil completo nos ayuda a mostrarte información
              realmente útil, no solo publicidad genérica.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default UserProfilePage;
