// src/pages/UserProfilePage.jsx
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { getCurrentUser, logoutCurrentUser } from "../utils/userStorage.js";

// Ejemplos de proveedores seleccionados (modo demo)
const sampleProviders = [
  {
    id: 1,
    category: "Jardín / venue",
    name: "Jardín Las Bugambilias",
    logo:
      "https://images.pexels.com/photos/3951851/pexels-photo-3951851.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    id: 2,
    category: "Banquete",
    name: "Sabores del Lago Catering",
    logo:
      "https://images.pexels.com/photos/169192/pexels-photo-169192.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    id: 3,
    category: "Wedding planner",
    name: "Luna Eventos Boutique",
    logo:
      "https://images.pexels.com/photos/3843286/pexels-photo-3843286.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
];

// Ejemplos de ideas (modo demo)
const sampleIdeas = [
  {
    id: 1,
    title: "Ceremonia al atardecer",
    note: "Me encanta la luz cálida y las sillas de madera claras.",
    image:
      "https://images.pexels.com/photos/169211/pexels-photo-169211.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 2,
    title: "Mesa de novios",
    note: "Flores blancas y verdes, nada demasiado recargado.",
    image:
      "https://images.pexels.com/photos/3951850/pexels-photo-3951850.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
];

function UserProfilePage() {
  const navigate = useNavigate();
  const user = getCurrentUser(); // leemos directamente del storage

  // ======== HOOKS (siempre arriba, sin condicionales) ========
  const [providers, setProviders] = useState(sampleProviders);

  const [ideas, setIdeas] = useState(sampleIdeas);
  const [newIdeaTitle, setNewIdeaTitle] = useState("");
  const [newIdeaNote, setNewIdeaNote] = useState("");
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Si no hay usuario, redirigimos al login (después de declarar hooks)
  if (!user) {
    return <Navigate to="/acceso" replace />;
  }

  // Porcentaje de perfil completado
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

  // ======== Proveedores (demo) ========
  function handleRemoveProvider(id) {
    setProviders((prev) => prev.filter((p) => p.id !== id));
  }

  // ======== Ideas: helpers ========
  function resetIdeaForm() {
    setNewIdeaTitle("");
    setNewIdeaNote("");
    setPreviewImageUrl("");
    setEditingId(null);
  }

  function handleIdeaImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setPreviewImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleAddOrUpdateIdea() {
    const title = newIdeaTitle.trim();
    const note = newIdeaNote.trim();

    if (!title && !note && !previewImageUrl) {
      return;
    }

    if (editingId) {
      // Editar idea existente
      setIdeas((prev) =>
        prev.map((idea) =>
          idea.id === editingId
            ? {
                ...idea,
                title: title || idea.title,
                note: note || idea.note,
                image: previewImageUrl || idea.image,
              }
            : idea
        )
      );
    } else {
      // Nueva idea
      const newIdea = {
        id: Date.now(),
        title: title || "Idea sin título",
        note: note || "",
        image:
          previewImageUrl ||
          "https://images.pexels.com/photos/3951879/pexels-photo-3951879.jpeg?auto=compress&cs=tinysrgb&w=800",
      };
      setIdeas((prev) => [newIdea, ...prev]);
    }

    resetIdeaForm();
  }

  function handleEditIdea(idea) {
    setEditingId(idea.id);
    setNewIdeaTitle(idea.title || "");
    setNewIdeaNote(idea.note || "");
    setPreviewImageUrl(idea.image || "");
  }

  function handleDeleteIdea(id) {
    setIdeas((prev) => prev.filter((idea) => idea.id !== id));
    if (editingId === id) {
      resetIdeaForm();
    }
  }

  return (
    <div className="user-profile">
      <div className="user-profile__container">
        <div className="user-profile__grid">
          {/* Columna izquierda: resumen de perfil */}
          <section className="profile-card">
            <p className="profile-card__eyebrow">Tu resumen</p>
            <h1 className="profile-card__title">Hola, {user.fullName}</h1>
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

            <dl className="profile-card__summary-list">
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

            <div className="profile-card__actions form__actions">
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

          {/* Columna derecha: foto + proveedores + ideas */}
          <aside className="preview-card">
            {/* Foto de perfil (solo visual, se edita en el formulario) */}
            <section className="user-profile__section user-profile__section--profile">
              <h2 className="preview-card__title">Foto de perfil</h2>
              <p className="preview-card__subtitle preview-card__subtitle--small">
                Edita tu foto desde la sección “Completar / editar mi perfil”.
              </p>

              <div className="user-profile__avatar-wrapper">
                <div className="user-profile__avatar-circle">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.fullName}
                      className="user-profile__avatar-image"
                    />
                  ) : (
                    (user.fullName || "K")[0]
                  )}
                </div>
              </div>
            </section>

            {/* Proveedores elegidos */}
            <section className="user-profile__section user-profile__section--providers">
              <h2 className="preview-card__title">
                Tus proveedores elegidos hasta ahora
              </h2>
              <p className="preview-card__subtitle preview-card__subtitle--small">
                Cuando guardes un venue o proveedor como favorito aparecerá
                aquí. Por ahora te mostramos un ejemplo.
              </p>

              <div className="providers-list">
                {providers.map((p) => (
                  <div key={p.id} className="providers-list__item">
                    <div className="providers-list__logo-wrapper">
                      <img
                        src={p.logo}
                        alt={p.name}
                        className="providers-list__logo-image"
                      />
                    </div>
                    <div className="providers-list__info">
                      <div className="providers-list__category">
                        {p.category}
                      </div>
                      <div className="providers-list__name">{p.name}</div>
                    </div>

                    {/* Botón eliminar proveedor (solo icono) */}
                    <button
                      type="button"
                      onClick={() => handleRemoveProvider(p.id)}
                      aria-label="Eliminar proveedor"
                      className="providers-list__delete-btn"
                    >
                      🗑️
                    </button>
                  </div>
                ))}

                {providers.length === 0 && (
                  <p className="preview-card__subtitle preview-card__subtitle--tiny">
                    Aún no has elegido proveedores. Cuando guardes tus
                    favoritos, aparecerán aquí.
                  </p>
                )}
              </div>
            </section>

            {/* Galería de ideas para la boda */}
            <section className="user-profile__section">
              <h2 className="preview-card__title">Ideas para mi boda</h2>
              <p className="preview-card__subtitle preview-card__subtitle--small">
                Un pequeño tablero para recordar cosas que te gustan y tenerlas
                a la mano cuando hables con proveedores.
              </p>

              {/* Grid de ideas guardadas */}
              <div className="ideas-grid">
                {ideas.map((idea) => (
                  <div key={idea.id} className="idea-card">
                    <div className="idea-card__image-wrapper">
                      <img
                        src={idea.image}
                        alt={idea.title}
                        className="idea-card__image"
                      />
                    </div>
                    <div className="idea-card__body">
                      <div className="idea-card__title">{idea.title}</div>
                      <p className="idea-card__note">{idea.note}</p>

                      {/* Acciones editar / eliminar idea */}
                      <div className="idea-card__actions">
                        <button
                          type="button"
                          onClick={() => handleEditIdea(idea)}
                          aria-label="Editar idea"
                          className="idea-card__icon-btn idea-card__icon-btn--edit"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteIdea(idea.id)}
                          aria-label="Eliminar idea"
                          className="idea-card__icon-btn idea-card__icon-btn--delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bloque para agregar / editar idea */}
              <div className="ideas-editor">
                <h3 className="ideas-editor__title">
                  {editingId ? "Editar idea" : "Agregar nueva idea"}
                </h3>
                <p className="ideas-editor__subtitle">
                  Sube una imagen y escribe una nota corta para recordarte qué
                  te gustó.
                </p>

                <div className="ideas-editor__layout">
                  {/* Preview imagen */}
                  <div className="ideas-editor__preview">
                    {previewImageUrl ? (
                      <img
                        src={previewImageUrl}
                        alt="Previsualización"
                        className="ideas-editor__preview-image"
                      />
                    ) : (
                      "Sin imagen"
                    )}
                  </div>

                  <div className="ideas-editor__fields">
                    <input
                      type="text"
                      className="form__input ideas-editor__input"
                      placeholder="Título o nombre de la idea"
                      value={newIdeaTitle}
                      onChange={(e) => setNewIdeaTitle(e.target.value)}
                    />
                    <textarea
                      className="form__textarea ideas-editor__textarea"
                      rows={2}
                      placeholder="Describe brevemente qué te gusta de esta idea."
                      value={newIdeaNote}
                      onChange={(e) => setNewIdeaNote(e.target.value)}
                    />
                    <div className="ideas-editor__actions">
                      <label className="ideas-editor__upload-label">
                        Subir imagen
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={handleIdeaImageChange}
                        />
                      </label>
                      <button
                        type="button"
                        className="btn btn--primary ideas-editor__button"
                        onClick={handleAddOrUpdateIdea}
                      >
                        {editingId ? "Actualizar idea" : "Agregar idea"}
                      </button>
                      {editingId && (
                        <button
                          type="button"
                          className="btn btn--ghost ideas-editor__button"
                          onClick={resetIdeaForm}
                        >
                          Cancelar edición
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default UserProfilePage;
