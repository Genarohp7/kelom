// src/pages/UserProfilePage.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  fetchMe,
  fetchMyWeddingProfile,
  logout,
  getToken,
} from "../utils/auth.js";

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

// Evita desfases de zona horaria cuando viene "YYYY-MM-DD" o "YYYY-MM-DDT..."
function parseDateOnly(raw) {
  if (!raw) return null;
  if (raw instanceof Date) return Number.isNaN(raw.getTime()) ? null : raw;

  if (typeof raw === "string") {
    const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
      const y = Number(m[1]);
      const mo = Number(m[2]);
      const d = Number(m[3]);
      const local = new Date(y, mo - 1, d);
      return Number.isNaN(local.getTime()) ? null : local;
    }
  }

  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function UserProfilePage() {
  const navigate = useNavigate();

  // ======== Estado de sesión real (backend) ========
  const [user, setUser] = useState(null);
  const [weddingProfile, setWeddingProfile] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/acceso", { replace: true });
      return;
    }

    let cancelled = false;

    Promise.all([fetchMe(), fetchMyWeddingProfile()])
      .then(([me, profile]) => {
        if (cancelled) return;
        setUser(me);
        setWeddingProfile(profile); // puede ser null si aún no hay ficha
      })
      .catch(() => {
        // token inválido/expirado o backend no responde
        logout();
        if (cancelled) return;
        navigate("/acceso", { replace: true });
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoadingUser(false);
      });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // ======== HOOKS DEMO (siempre arriba, sin condicionales) ========
  const [providers, setProviders] = useState(sampleProviders);

  const [ideas, setIdeas] = useState(sampleIdeas);
  const [newIdeaTitle, setNewIdeaTitle] = useState("");
  const [newIdeaNote, setNewIdeaNote] = useState("");
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [editingId, setEditingId] = useState(null);

  const weddingDateLabel = useMemo(() => {
    const d = parseDateOnly(weddingProfile?.wedding_date);
    if (!d) return "—";
    return d.toLocaleDateString();
  }, [weddingProfile]);

  // Porcentaje de perfil completado (user + ficha)
  const completion = useMemo(() => {
    if (!user) return 0;

    const filledUser = [
      user?.email?.toString().trim(),
      user?.name?.toString().trim(),
    ].filter(Boolean).length;

    const p = weddingProfile || {};
    const filledProfile = [
      p.phone?.toString().trim(),
      p.city?.toString().trim(),
      p.wedding_date ? "x" : "",
      p.guests === 0 || p.guests ? "x" : "",
      p.budget_range?.toString().trim(),
      p.ceremony_type?.toString().trim(),
      p.reception_type?.toString().trim(),
      p.contact_preference?.toString().trim(),
    ].filter(Boolean).length;

    const total = 2 + 8; // 2 user + 8 profile
    const filled = filledUser + filledProfile;

    return Math.round((filled / total) * 100);
  }, [user, weddingProfile]);

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
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

  // ======== UI: loading / no-user ========
  if (isLoadingUser) {
    return (
      <div className="user-profile">
        <div className="user-profile__container">
          <p style={{ padding: "2rem" }}>Cargando tu perfil…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="user-profile">
      <div className="user-profile__container">
        <div className="user-profile__grid">
          {/* Columna izquierda: resumen de perfil */}
          <section className="profile-card">
            <p className="profile-card__eyebrow">Tu resumen</p>
            <h1 className="profile-card__title">Hola, {user.name || "pareja"}</h1>
            <p className="profile-card__subtitle">
              Esta es una vista rápida de tu cuenta. Ahora ya estamos trayendo tu
              ficha desde backend (cuando exista).
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

              <dt>Rol</dt>
              <dd>{user.role || "user"}</dd>

              <dt>Ciudad</dt>
              <dd>{weddingProfile?.city || "—"}</dd>

              <dt>Fecha boda</dt>
              <dd>{weddingDateLabel}</dd>

              <dt>Invitad@s</dt>
              <dd>
                {weddingProfile?.guests === 0 || weddingProfile?.guests
                  ? weddingProfile.guests
                  : "—"}
              </dd>

              <dt>Creado</dt>
              <dd>
                {user.created_at ? new Date(user.created_at).toLocaleString() : "—"}
              </dd>
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
                En esta etapa la foto sigue siendo demo (local). Luego la subimos a backend.
              </p>

              <div className="user-profile__avatar-wrapper">
                <div className="user-profile__avatar-circle">
                  {(user.name || "K")[0]}
                </div>
              </div>
            </section>

            {/* Proveedores elegidos */}
            <section className="user-profile__section user-profile__section--providers">
              <h2 className="preview-card__title">
                Tus proveedores elegidos hasta ahora
              </h2>
              <p className="preview-card__subtitle preview-card__subtitle--small">
                Esto sigue en modo demo. Más adelante lo conectamos a favoritos en backend.
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
                      <div className="providers-list__category">{p.category}</div>
                      <div className="providers-list__name">{p.name}</div>
                    </div>

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
                    Aún no has elegido proveedores.
                  </p>
                )}
              </div>
            </section>

            {/* Galería de ideas para la boda */}
            <section className="user-profile__section">
              <h2 className="preview-card__title">Ideas para mi boda</h2>
              <p className="preview-card__subtitle preview-card__subtitle--small">
                Tablero demo (local). Luego lo guardamos en backend.
              </p>

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

              <div className="ideas-editor">
                <h3 className="ideas-editor__title">
                  {editingId ? "Editar idea" : "Agregar nueva idea"}
                </h3>

                <div className="ideas-editor__layout">
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