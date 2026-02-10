// src/pages/UserProfilePage.jsx
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  getCurrentUser,
  logoutCurrentUser,
  updateCurrentUserProfile,
} from "../utils/userStorage.js";

function UserProfilePage() {
  const navigate = useNavigate();
  const user = getCurrentUser(); // leemos directamente del storage

  // Ideas por defecto (ejemplos)
  const defaultIdeas = [
    {
      id: 1,
      title: "Ceremonia en jardín al atardecer",
      note: "Luces cálidas, sillas de madera y flores blancas.",
      image:
        "https://images.pexels.com/photos/169211/pexels-photo-169211.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      id: 2,
      title: "Mesa larga estilo familiar",
      note: "Mantelería neutra, centros con flores pastel y velas.",
      image:
        "https://images.pexels.com/photos/3951628/pexels-photo-3951628.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      id: 3,
      title: "Pista con luces",
      note: "Pista iluminada para fotos memorables del baile.",
      image:
        "https://images.pexels.com/photos/169190/pexels-photo-169190.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      id: 4,
      title: "Pastel minimalista",
      note: "Blanco, con detalles sutiles en dorado y flores naturales.",
      image:
        "https://images.pexels.com/photos/1128782/pexels-photo-1128782.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
  ];

  // Estado para ideas (si el usuario ya tiene ideas guardadas, las usamos)
  const [ideas, setIdeas] = useState(() => {
    if (Array.isArray(user?.ideas) && user.ideas.length > 0) {
      return user.ideas;
    }
    return defaultIdeas;
  });

  // Estado para el formulario de nueva idea
  const [isAddingIdea, setIsAddingIdea] = useState(false);
  const [newIdea, setNewIdea] = useState({
    title: "",
    note: "",
    imageDataUrl: "",
  });

  // Estado para edición de idea existente
  const [isEditingIdea, setIsEditingIdea] = useState(false);
  const [editingIdeaId, setEditingIdeaId] = useState(null);
  const [editingIdea, setEditingIdea] = useState({
    title: "",
    note: "",
    imageDataUrl: "",
  });

  // Si no hay usuario, redirigimos al login
  if (!user) {
    return <Navigate to="/acceso" replace />;
  }

  // Cálculo del porcentaje de completitud del perfil
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

  // Foto de perfil
  const profilePhoto =
    user.avatar || user.profilePhoto || user.profileImage || "";

  // Ejemplos estáticos de proveedores elegidos
  const sampleProviders = [
    {
      id: 1,
      category: "Venue / Jardín",
      name: "Jardín Las Bugambilias",
      logo:
        "https://images.pexels.com/photos/169211/pexels-photo-169211.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      id: 2,
      category: "Banquete",
      name: "Sabores del Valle Catering",
      logo:
        "https://images.pexels.com/photos/3171770/pexels-photo-3171770.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      id: 3,
      category: "Wedding planner",
      name: "Momentos Kelom",
      logo:
        "https://images.pexels.com/photos/2567370/pexels-photo-2567370.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
  ];

  function handleLogout() {
    logoutCurrentUser();
    navigate("/");
  }

  // Handlers "Agregar idea"
  function handleNewIdeaFieldChange(e) {
    const { name, value } = e.target;
    setNewIdea((prev) => ({ ...prev, [name]: value }));
  }

  function handleNewIdeaImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = evt.target?.result;
      if (typeof result === "string") {
        setNewIdea((prev) => ({ ...prev, imageDataUrl: result }));
      }
    };
    reader.readAsDataURL(file);
  }

  function handleAddIdeaCancel() {
    setNewIdea({ title: "", note: "", imageDataUrl: "" });
    setIsAddingIdea(false);
  }

  function handleAddIdeaSave() {
    if (!newIdea.imageDataUrl) {
      alert("Agrega una foto para tu idea antes de guardar.");
      return;
    }

    const ideaToAdd = {
      id: Date.now(),
      title: newIdea.title.trim() || "Idea sin título",
      note:
        newIdea.note.trim() ||
        "Descripción pendiente. Puedes editarla más adelante.",
      image: newIdea.imageDataUrl,
    };

    const updatedIdeas = [ideaToAdd, ...ideas];
    setIdeas(updatedIdeas);

    try {
      updateCurrentUserProfile({ ideas: updatedIdeas });
    } catch (err) {
      console.error("No se pudo guardar las ideas en el perfil (demo):", err);
    }

    setNewIdea({ title: "", note: "", imageDataUrl: "" });
    setIsAddingIdea(false);
  }

  // Handlers edición
  function handleStartEditIdea(idea) {
    setIsAddingIdea(false);
    setIsEditingIdea(true);
    setEditingIdeaId(idea.id);
    setEditingIdea({
      title: idea.title,
      note: idea.note,
      imageDataUrl: idea.image,
    });
  }

  function handleEditIdeaFieldChange(e) {
    const { name, value } = e.target;
    setEditingIdea((prev) => ({ ...prev, [name]: value }));
  }

  function handleEditIdeaImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = evt.target?.result;
      if (typeof result === "string") {
        setEditingIdea((prev) => ({ ...prev, imageDataUrl: result }));
      }
    };
    reader.readAsDataURL(file);
  }

  function handleEditIdeaCancel() {
    setIsEditingIdea(false);
    setEditingIdeaId(null);
    setEditingIdea({ title: "", note: "", imageDataUrl: "" });
  }

  function handleEditIdeaSave() {
    if (!editingIdeaId) return;

    const updatedIdeas = ideas.map((idea) =>
      idea.id === editingIdeaId
        ? {
            ...idea,
            title: editingIdea.title.trim() || idea.title,
            note: editingIdea.note.trim() || idea.note,
            image: editingIdea.imageDataUrl || idea.image,
          }
        : idea
    );

    setIdeas(updatedIdeas);

    try {
      updateCurrentUserProfile({ ideas: updatedIdeas });
    } catch (err) {
      console.error("No se pudo actualizar las ideas en el perfil (demo):", err);
    }

    handleEditIdeaCancel();
  }

  // Eliminar idea
  function handleDeleteIdea(id) {
    const confirmed = window.confirm(
      "¿Quieres eliminar esta idea? Esta acción no se puede deshacer."
    );
    if (!confirmed) return;

    const updatedIdeas = ideas.filter((idea) => idea.id !== id);
    setIdeas(updatedIdeas);

    try {
      updateCurrentUserProfile({ ideas: updatedIdeas });
    } catch (err) {
      console.error("No se pudo eliminar la idea en el perfil (demo):", err);
    }
  }

  return (
    <div className="user-profile">
      <div className="user-profile__container">
        <div className="user-profile__grid">
          {/* Columna izquierda: resumen */}
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

          {/* Columna derecha */}
          <aside className="preview-card">
            {/* Foto perfil */}
            <section
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginBottom: "1.6rem",
              }}
            >
              <div
                style={{
                  width: "150px",
                  height: "150px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "3px solid rgba(232, 154, 169, 0.9)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "radial-gradient(circle at top, #ffeef5 0, #fff7f9 45%, #fff 100%)",
                  marginBottom: "0.75rem",
                }}
              >
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt={user.fullName || "Foto de perfil"}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: "2.4rem",
                      fontWeight: 600,
                      color: "#c87486",
                    }}
                  >
                    {user.fullName
                      ? user.fullName.charAt(0).toUpperCase()
                      : "?"}
                  </span>
                )}
              </div>

              <h2
                className="preview-card__title"
                style={{ marginBottom: "0.25rem", textAlign: "center" }}
              >
                Tu foto de perfil
              </h2>
              <p
                className="preview-card__subtitle"
                style={{
                  textAlign: "center",
                  fontSize: "0.85rem",
                  marginBottom: 0,
                }}
              >
                Esta es la imagen que usarán las parejas y proveedores para
                reconocerte en tu ficha.
              </p>
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
                {sampleProviders.map((p) => (
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
                  </div>
                ))}
              </div>
            </section>

            {/* Ideas para la boda */}
            <section>
              <h2 className="preview-card__title">Ideas para mi boda</h2>
              <p
                className="preview-card__subtitle"
                style={{ fontSize: "0.85rem" }}
              >
                Un pequeño tablero para recordar cosas que te gustan y tenerlas
                a la mano cuando hables con proveedores.
              </p>

              {/* Botón agregar idea */}
              <div
                style={{
                  marginTop: "0.6rem",
                  marginBottom:
                    isAddingIdea || isEditingIdea ? "0.4rem" : "0.8rem",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                {!isAddingIdea && !isEditingIdea && (
                  <button
                    type="button"
                    className="btn btn--secondary"
                    style={{
                      fontSize: "0.8rem",
                      padding: "0.35rem 0.9rem",
                    }}
                    onClick={() => {
                      setIsEditingIdea(false);
                      setEditingIdeaId(null);
                      setNewIdea({ title: "", note: "", imageDataUrl: "" });
                      setIsAddingIdea(true);
                    }}
                  >
                    + Agregar idea
                  </button>
                )}
              </div>

              {/* Panel nueva idea */}
              {isAddingIdea && (
                <div
                  style={{
                    marginBottom: "0.9rem",
                    padding: "0.75rem 0.85rem",
                    borderRadius: "12px",
                    backgroundColor: "#fff7f9",
                    border: "1px dashed rgba(232, 154, 169, 0.7)",
                  }}
                >
                  <p
                    className="profile-card__subtitle"
                    style={{ fontSize: "0.8rem", marginBottom: "0.65rem" }}
                  >
                    Sube una foto y escribe una nota rápida para recordar qué te
                    gustó.
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "120px minmax(0, 1fr)",
                      gap: "0.75rem",
                      alignItems: "stretch",
                    }}
                  >
                    {/* preview imagen */}
                    <div
                      style={{
                        borderRadius: "10px",
                        overflow: "hidden",
                        backgroundColor: "#ffffff",
                        border: "1px solid rgba(248, 202, 214, 0.9)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {newIdea.imageDataUrl ? (
                        <img
                          src={newIdea.imageDataUrl}
                          alt={newIdea.title || "Nueva idea"}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "#9ca3af",
                            textAlign: "center",
                            padding: "0.6rem",
                          }}
                        >
                          Aquí verás una vista previa de tu foto.
                        </span>
                      )}
                    </div>

                    {/* campos */}
                    <div>
                      <div className="form__field form__field--full">
                        <label className="form__label" htmlFor="ideaTitle">
                          Título breve
                        </label>
                        <input
                          id="ideaTitle"
                          name="title"
                          type="text"
                          className="form__input"
                          placeholder="Ej. Mesa de novios con flores blancas"
                          value={newIdea.title}
                          onChange={handleNewIdeaFieldChange}
                        />
                      </div>

                      <div className="form__field form__field--full">
                        <label className="form__label" htmlFor="ideaNote">
                          Nota rápida
                        </label>
                        <textarea
                          id="ideaNote"
                          name="note"
                          className="form__textarea"
                          rows={2}
                          placeholder="Qué te inspira de esta foto, qué quieres recordar..."
                          value={newIdea.note}
                          onChange={handleNewIdeaFieldChange}
                        />
                      </div>

                      <div className="form__field form__field--full">
                        <label
                          className="form__label"
                          htmlFor="ideaImageInput"
                        >
                          Foto de la idea
                        </label>
                        <div
                          style={{
                            display: "flex",
                            gap: "0.6rem",
                            alignItems: "center",
                          }}
                        >
                          <label
                            htmlFor="ideaImageInput"
                            className="btn btn--secondary"
                            style={{
                              fontSize: "0.8rem",
                              padding: "0.35rem 0.9rem",
                              cursor: "pointer",
                            }}
                          >
                            Elegir imagen
                          </label>
                          <span
                            style={{
                              fontSize: "0.8rem",
                              color: "#6b7280",
                              maxWidth: "220px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {newIdea.imageDataUrl
                              ? "Imagen lista para guardar."
                              : "JPG o PNG, máximo 5 MB (modo demo)."}
                          </span>
                        </div>
                        <input
                          id="ideaImageInput"
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={handleNewIdeaImageChange}
                        />
                      </div>

                      <div
                        className="form__actions"
                        style={{
                          marginTop: "0.4rem",
                          display: "flex",
                          gap: "0.5rem",
                          justifyContent: "flex-end",
                        }}
                      >
                        <button
                          type="button"
                          className="btn btn--ghost"
                          onClick={handleAddIdeaCancel}
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          className="btn btn--primary"
                          onClick={handleAddIdeaSave}
                        >
                          Guardar idea
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Panel edición idea */}
              {isEditingIdea && (
                <div
                  style={{
                    marginBottom: "0.9rem",
                    padding: "0.75rem 0.85rem",
                    borderRadius: "12px",
                    backgroundColor: "#fff7f9",
                    border: "1px dashed rgba(232, 154, 169, 0.7)",
                  }}
                >
                  <p
                    className="profile-card__subtitle"
                    style={{ fontSize: "0.8rem", marginBottom: "0.65rem" }}
                  >
                    Edita los detalles de esta idea. Puedes cambiar el texto y
                    la foto si lo necesitas.
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "120px minmax(0, 1fr)",
                      gap: "0.75rem",
                      alignItems: "stretch",
                    }}
                  >
                    <div
                      style={{
                        borderRadius: "10px",
                        overflow: "hidden",
                        backgroundColor: "#ffffff",
                        border: "1px solid rgba(248, 202, 214, 0.9)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {editingIdea.imageDataUrl ? (
                        <img
                          src={editingIdea.imageDataUrl}
                          alt={editingIdea.title || "Editar idea"}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "#9ca3af",
                            textAlign: "center",
                            padding: "0.6rem",
                          }}
                        >
                          Aquí verás una vista previa de tu foto.
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="form__field form__field--full">
                        <label
                          className="form__label"
                          htmlFor="editIdeaTitle"
                        >
                          Título breve
                        </label>
                        <input
                          id="editIdeaTitle"
                          name="title"
                          type="text"
                          className="form__input"
                          value={editingIdea.title}
                          onChange={handleEditIdeaFieldChange}
                        />
                      </div>

                      <div className="form__field form__field--full">
                        <label className="form__label" htmlFor="editIdeaNote">
                          Nota rápida
                        </label>
                        <textarea
                          id="editIdeaNote"
                          name="note"
                          className="form__textarea"
                          rows={2}
                          value={editingIdea.note}
                          onChange={handleEditIdeaFieldChange}
                        />
                      </div>

                      <div className="form__field form__field--full">
                        <label
                          className="form__label"
                          htmlFor="editIdeaImageInput"
                        >
                          Foto de la idea
                        </label>
                        <div
                          style={{
                            display: "flex",
                            gap: "0.6rem",
                            alignItems: "center",
                          }}
                        >
                          <label
                            htmlFor="editIdeaImageInput"
                            className="btn btn--secondary"
                            style={{
                              fontSize: "0.8rem",
                              padding: "0.35rem 0.9rem",
                              cursor: "pointer",
                            }}
                          >
                            Cambiar imagen
                          </label>
                          <span
                            style={{
                              fontSize: "0.8rem",
                              color: "#6b7280",
                              maxWidth: "220px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            Puedes dejar la imagen actual si ya te gusta.
                          </span>
                        </div>
                        <input
                          id="editIdeaImageInput"
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={handleEditIdeaImageChange}
                        />
                      </div>

                      <div
                        className="form__actions"
                        style={{
                          marginTop: "0.4rem",
                          display: "flex",
                          gap: "0.5rem",
                          justifyContent: "flex-end",
                        }}
                      >
                        <button
                          type="button"
                          className="btn btn--ghost"
                          onClick={handleEditIdeaCancel}
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          className="btn btn--primary"
                          onClick={handleEditIdeaSave}
                        >
                          Guardar cambios
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid de ideas */}
              {ideas.length > 0 && (
                <div
                  style={{
                    marginTop:
                      isAddingIdea || isEditingIdea ? "0.2rem" : "0.8rem",
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
                        border:
                          idea.id === editingIdeaId && isEditingIdea
                            ? "1px solid rgba(232, 154, 169, 0.9)"
                            : "none",
                        display: "flex",
                        flexDirection: "column",
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

                      <div
                        style={{
                          padding: "0.5rem 0.6rem 0.35rem",
                          flexGrow: 1,
                        }}
                      >
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
                      </div>

                      {/* Botones sutiles abajo */}
                      <div
                        style={{
                          padding: "0.25rem 0.55rem 0.45rem",
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: "0.35rem",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleStartEditIdea(idea)}
                          style={{
                            border: "none",
                            background: "transparent",
                            fontSize: "0.72rem",
                            color: "#6b7280",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.15rem",
                          }}
                          title="Editar idea"
                        >
                          <span>✏️</span>
                          <span>Editar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteIdea(idea.id)}
                          style={{
                            border: "none",
                            background: "transparent",
                            fontSize: "0.72rem",
                            color: "#9b1c1c",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.15rem",
                          }}
                          title="Eliminar idea"
                        >
                          <span>🗑️</span>
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default UserProfilePage;
