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

          {/* Columna derecha: foto + proveedores + ideas */}
          <aside className="preview-card">
            {/* Foto de perfil (solo visual, se edita en el formulario) */}
            <section style={{ marginBottom: "1.3rem" }}>
              <h2 className="preview-card__title">Foto de perfil</h2>
              <p
                className="preview-card__subtitle"
                style={{ fontSize: "0.85rem" }}
              >
                Edita tu foto desde la sección “Completar / editar mi perfil”.
              </p>

              <div
                style={{
                  marginTop: "0.8rem",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    border: "3px solid rgba(232, 154, 169, 0.6)",
                    overflow: "hidden",
                    background:
                      "radial-gradient(circle at 30% 20%, #ffe4ef, #fecdd3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2.2rem",
                    fontWeight: 600,
                    color: "#7f1d1d",
                    textTransform: "uppercase",
                  }}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.fullName}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    (user.fullName || "K")[0]
                  )}
                </div>
              </div>
            </section>

            {/* Proveedores elegidos */}
            <section style={{ marginBottom: "1.6rem" }}>
              <h2 className="preview-card__title">
                Tus proveedores elegidos hasta ahora
              </h2>
              <p
                className="preview-card__subtitle"
                style={{ fontSize: "0.85rem" }}
              >
                Cuando guardes un venue o proveedor como favorito aparecerá
                aquí. Por ahora te mostramos un ejemplo.
              </p>

              <div
                style={{
                  marginTop: "0.7rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.7rem",
                }}
              >
                {providers.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.55rem 0.85rem",
                      borderRadius: "999px",
                      backgroundColor: "#fff7f9",
                      border: "1px solid rgba(232, 154, 169, 0.35)",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        flexShrink: 0,
                        background: "#ffffff",
                      }}
                    >
                      <img
                        src={p.logo}
                        alt={p.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          color: "#c87486",
                          marginBottom: "0.1rem",
                        }}
                      >
                        {p.category}
                      </div>
                      <div
                        style={{
                          fontSize: "0.9rem",
                          fontWeight: 500,
                          color: "#111827",
                        }}
                      >
                        {p.name}
                      </div>
                    </div>

                    {/* Botón eliminar proveedor (solo icono) */}
                    <button
                      type="button"
                      onClick={() => handleRemoveProvider(p.id)}
                      aria-label="Eliminar proveedor"
                      style={{
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        padding: "0.15rem 0.25rem",
                        borderRadius: "999px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.9rem",
                        color: "#9ca3af",
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                ))}

                {providers.length === 0 && (
                  <p
                    className="preview-card__subtitle"
                    style={{ fontSize: "0.8rem", marginTop: "0.3rem" }}
                  >
                    Aún no has elegido proveedores. Cuando guardes tus
                    favoritos, aparecerán aquí.
                  </p>
                )}
              </div>
            </section>

            {/* Galería de ideas para la boda */}
            <section>
              <h2 className="preview-card__title">Ideas para mi boda</h2>
              <p
                className="preview-card__subtitle"
                style={{ fontSize: "0.85rem" }}
              >
                Un pequeño tablero para recordar cosas que te gustan y tenerlas
                a la mano cuando hables con proveedores.
              </p>

              {/* Grid de ideas guardadas */}
              <div
                style={{
                  marginTop: "0.8rem",
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: "0.8rem",
                }}
              >
                {ideas.map((idea) => (
                  <div
                    key={idea.id}
                    style={{
                      borderRadius: "12px",
                      overflow: "hidden",
                      backgroundColor: "#ffffff",
                      boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        paddingTop: "65%",
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={idea.image}
                        alt={idea.title}
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    <div style={{ padding: "0.5rem 0.6rem 0.55rem" }}>
                      <div
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: 500,
                          marginBottom: "0.1rem",
                        }}
                      >
                        {idea.title}
                      </div>
                      <p
                        style={{
                          fontSize: "0.78rem",
                          color: "#6b7280",
                          margin: 0,
                        }}
                      >
                        {idea.note}
                      </p>

                      {/* Acciones editar / eliminar idea (discretas y abajo) */}
                      <div
                        style={{
                          marginTop: "0.4rem",
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: "0.3rem",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleEditIdea(idea)}
                          aria-label="Editar idea"
                          style={{
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            padding: "0.1rem 0.25rem",
                            borderRadius: "999px",
                            fontSize: "0.85rem",
                            color: "#6b7280",
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteIdea(idea.id)}
                          aria-label="Eliminar idea"
                          style={{
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            padding: "0.1rem 0.25rem",
                            borderRadius: "999px",
                            fontSize: "0.85rem",
                            color: "#9ca3af",
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bloque para agregar / editar idea */}
              <div
                style={{
                  marginTop: "1rem",
                  padding: "0.75rem 0.85rem",
                  borderRadius: "12px",
                  backgroundColor: "#fff7f9",
                  border: "1px dashed rgba(232, 154, 169, 0.55)",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    marginBottom: "0.4rem",
                  }}
                >
                  {editingId ? "Editar idea" : "Agregar nueva idea"}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.78rem",
                    color: "#6b7280",
                    marginBottom: "0.55rem",
                  }}
                >
                  Sube una imagen y escribe una nota corta para recordarte qué
                  te gustó.
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "80px minmax(0, 1fr)",
                    gap: "0.7rem",
                    alignItems: "center",
                  }}
                >
                  {/* Preview imagen */}
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "12px",
                      overflow: "hidden",
                      backgroundColor: "#fee2e2",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      color: "#7f1d1d",
                    }}
                  >
                    {previewImageUrl ? (
                      <img
                        src={previewImageUrl}
                        alt="Previsualización"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      "Sin imagen"
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.4rem",
                    }}
                  >
                    <input
                      type="text"
                      className="form__input"
                      placeholder="Título o nombre de la idea"
                      value={newIdeaTitle}
                      onChange={(e) => setNewIdeaTitle(e.target.value)}
                      style={{ fontSize: "0.8rem" }}
                    />
                    <textarea
                      className="form__textarea"
                      rows={2}
                      placeholder="Describe brevemente qué te gusta de esta idea."
                      value={newIdeaNote}
                      onChange={(e) => setNewIdeaNote(e.target.value)}
                      style={{ fontSize: "0.8rem" }}
                    />
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.4rem",
                        marginTop: "0.2rem",
                      }}
                    >
                      <label
                        style={{
                          borderRadius: "999px",
                          padding: "0.25rem 0.75rem",
                          border: "1px solid rgba(148, 163, 184, 0.9)",
                          fontSize: "0.78rem",
                          cursor: "pointer",
                          background: "#ffffff",
                        }}
                      >
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
                        className="btn btn--primary"
                        style={{
                          fontSize: "0.78rem",
                          padding: "0.25rem 0.9rem",
                        }}
                        onClick={handleAddOrUpdateIdea}
                      >
                        {editingId ? "Actualizar idea" : "Agregar idea"}
                      </button>
                      {editingId && (
                        <button
                          type="button"
                          className="btn btn--ghost"
                          style={{
                            fontSize: "0.78rem",
                            padding: "0.25rem 0.9rem",
                          }}
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
