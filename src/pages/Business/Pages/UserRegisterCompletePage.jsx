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
  changePassword,
  uploadMyAvatar,
} from "../../../utils/auth.js";

const API_BASE = import.meta.env.VITE_API_URL || "https://api.kelom.com.mx";
const MAX_AVATAR_BYTES = 1024 * 1024; // 1MB
const MAX_AVATAR_WIDTH = 1600;
const MAX_AVATAR_HEIGHT = 1600;
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const dimensions = {
        width: img.naturalWidth,
        height: img.naturalHeight,
      };

      URL.revokeObjectURL(objectUrl);
      resolve(dimensions);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("No se pudo leer la imagen."));
    };

    img.src = objectUrl;
  });
}

function toDateInputValue(raw) {
  if (!raw) return "";

  if (typeof raw === "string") {
    const m = raw.match(/^(\d{4}-\d{2}-\d{2})/);
    if (m) return m[1];
  }

  if (raw instanceof Date) {
    if (Number.isNaN(raw.getTime())) return "";
    const y = raw.getFullYear();
    const mo = String(raw.getMonth() + 1).padStart(2, "0");
    const d = String(raw.getDate()).padStart(2, "0");
    return `${y}-${mo}-${d}`;
  }

  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}

/**
 * ✅ IMPORTANTE:
 * Este componente DEBE estar fuera de UserRegisterCompletePage
 * para que React no lo "remonte" en cada render y no se pierda el foco.
 */
function PasswordWithToggle({
  id,
  label,
  value,
  onChange,
  show,
  onToggle,
  placeholder,
}) {
  return (
    <div className="form__field form__field--full">
      <label className="form__label" htmlFor={id}>
        {label}
      </label>

      <div className="password-field">
        <input
          id={id}
          type={show ? "text" : "password"}
          className="form__input password-field__input"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="off"
        />

        <button
          type="button"
          className="password-field__toggle"
          onClick={onToggle}
          aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
          title={show ? "Ocultar" : "Mostrar"}
        >
          {show ? "🙈" : "👁️"}
        </button>
      </div>
    </div>
  );
}

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
    avatar: "", // preview (url / dataUrl)
  }));

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarObjectUrl, setAvatarObjectUrl] = useState("");
  const [avatarError, setAvatarError] = useState("");

  const [passwordError, setPasswordError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(hasToken);

  // ======== Cambiar contraseña (modo edición) ========
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Toggles 👁️
  const [showPwCurrent, setShowPwCurrent] = useState(false);
  const [showPwNew, setShowPwNew] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);

  // Limpieza de objectURL
  useEffect(() => {
    return () => {
      if (avatarObjectUrl) URL.revokeObjectURL(avatarObjectUrl);
    };
  }, [avatarObjectUrl]);

  // Si no hay pending y no hay sesión, regresa a /registro
  useEffect(() => {
    const token = getToken();
    if (!pending && !token) navigate("/registro");
  }, [pending, navigate]);

  // Si hay sesión, cargamos datos reales (me + ficha) + avatar_url
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    let cancelled = false;

    setIsLoadingInitial(true);
    Promise.all([fetchMe(), fetchMyWeddingProfile()])
      .then(([me, profile]) => {
        if (cancelled) return;

        const weddingDate = toDateInputValue(profile?.wedding_date);

        // Si el usuario ya tiene avatar_url, lo mostramos como preview
        const remoteAvatar =
          me?.avatar_url ? `${API_BASE}${me.avatar_url}` : "";

        // Reset de file local si venimos cargando desde backend
        setAvatarFile(null);
        setAvatarError("");

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
          avatar: remoteAvatar || prev.avatar,
        }));
      })
      .catch(() => {
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
    setSubmitSuccess("");

    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleAvatarChange(evt) {
    const input = evt.target;
    const file = input.files?.[0];
    if (!file) return;

    setAvatarError("");
    setSubmitError("");
    setSubmitSuccess("");

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setAvatarError("Formato no permitido. Usa JPG, PNG o WebP.");
      input.value = "";
      return;
    }

    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("Imagen demasiado grande. Máximo 1MB.");
      input.value = "";
      return;
    }

    try {
      const { width, height } = await getImageDimensions(file);

      if (width > MAX_AVATAR_WIDTH || height > MAX_AVATAR_HEIGHT) {
        setAvatarError(
          `La imagen es demasiado grande en dimensiones. Máximo ${MAX_AVATAR_WIDTH}x${MAX_AVATAR_HEIGHT}px.`
        );
        input.value = "";
        return;
      }

      if (avatarObjectUrl) URL.revokeObjectURL(avatarObjectUrl);

      const url = URL.createObjectURL(file);
      setAvatarObjectUrl(url);
      setAvatarFile(file);

      setFormData((prev) => ({ ...prev, avatar: url }));
    } catch {
      setAvatarError("No se pudo procesar la imagen. Intenta con otra.");
      input.value = "";
    }
  }

  function buildProfilePayload() {
    const phoneDigits = (formData.phone || "").replace(/\D/g, "");
    const guests =
      formData.guests === "" ||
      formData.guests === null ||
      formData.guests === undefined
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

    setSubmitError("");
    setSubmitSuccess("");

    const token = getToken();
    const isEditMode = !!token;

    const email = formData.email?.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    // Registro nuevo: exige contraseña
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

    // Si hay error de avatar, no seguimos
    if (avatarError) return;

    try {
      setIsSubmitting(true);

      const profilePayload = buildProfilePayload();

      if (isEditMode) {
        // 1) Guardar ficha
        await saveMyWeddingProfile(profilePayload);

        // 2) Subir avatar si hay archivo nuevo
        if (avatarFile) {
          await uploadMyAvatar(avatarFile);
          setAvatarFile(null);
        }

        // 3) refrescar cache de user (name/avatar_url)
        await fetchMe().catch(() => {});

        setSubmitSuccess("Cambios guardados correctamente.");
        navigate("/perfil");
        return;
      }

      // ===== Registro nuevo (2/2) =====
      await registerUser({
        email,
        password,
        name: formData.fullName,
      });

      await login(email, password);

      await saveMyWeddingProfile(profilePayload);

      // Subir avatar ya con JWT
      if (avatarFile) {
        await uploadMyAvatar(avatarFile);
        setAvatarFile(null);
      }

      clearPendingRegistration();
      navigate("/perfil");
    } catch (err) {
      console.error(err);
      const msg = String(err?.message || "");

      if (msg.toLowerCase().includes("ya existe") || msg.includes("409")) {
        setSubmitError("Ese correo ya existe. Intenta iniciar sesión.");
      } else if (msg.toLowerCase().includes("cors")) {
        setSubmitError("Bloqueado por CORS. Revisa allowedOrigins en el backend.");
      } else if (msg.toLowerCase().includes("imagen demasiado grande")) {
        setSubmitError("Imagen demasiado grande. Máximo 1MB.");
      } else if (msg.toLowerCase().includes("tipo de archivo")) {
        setSubmitError("Formato no permitido. Usa JPG, PNG o WebP.");
      } else {
        setSubmitError(msg || "No se pudo guardar.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleChangePasswordSubmit(e) {
    e.preventDefault();
    if (isChangingPassword) return;

    setPwError("");
    setPwSuccess("");

    const current = pwCurrent.trim();
    const next = pwNew;

    if (!current || !next || !pwConfirm) {
      setPwError("Completa los 3 campos para cambiar la contraseña.");
      return;
    }

    if (next.length < 5) {
      setPwError("La nueva contraseña debe tener al menos 5 caracteres.");
      return;
    }

    if (next !== pwConfirm) {
      setPwError("La confirmación no coincide.");
      return;
    }

    if (current === next) {
      setPwError("La nueva contraseña no puede ser igual a la actual.");
      return;
    }

    try {
      setIsChangingPassword(true);
      await changePassword(current, next);

      setPwSuccess("Contraseña actualizada correctamente.");
      setPwCurrent("");
      setPwNew("");
      setPwConfirm("");

      setShowPwCurrent(false);
      setShowPwNew(false);
      setShowPwConfirm(false);
    } catch (err) {
      const msg = String(err?.message || "");

      if (msg.toLowerCase().includes("incorrecta")) {
        setPwError("La contraseña actual es incorrecta.");
      } else if (msg.toLowerCase().includes("igual")) {
        setPwError("La nueva contraseña no puede ser igual a la actual.");
      } else if (msg.toLowerCase().includes("mínimo")) {
        setPwError("La nueva contraseña debe tener al menos 5 caracteres.");
      } else {
        setPwError(msg || "No se pudo cambiar la contraseña.");
      }
    } finally {
      setIsChangingPassword(false);
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

              {submitSuccess && (
                <div
                  className="form__error"
                  style={{ marginTop: "0.6rem", color: "green" }}
                >
                  {submitSuccess}
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

            {isEditMode && (
              <div style={{ marginTop: "1.6rem" }}>
                <h2 className="preview-card__title" style={{ marginBottom: "0.4rem" }}>
                  Cambiar contraseña
                </h2>
                <p className="profile-card__subtitle" style={{ marginBottom: "0.9rem" }}>
                  Puedes actualizar tu contraseña cuando quieras.
                </p>

                <form className="form form--grid" onSubmit={handleChangePasswordSubmit}>
                  <PasswordWithToggle
                    id="currentPassword"
                    label="Contraseña actual"
                    value={pwCurrent}
                    onChange={(e) => {
                      setPwCurrent(e.target.value);
                      setPwError("");
                      setPwSuccess("");
                    }}
                    show={showPwCurrent}
                    onToggle={() => setShowPwCurrent((v) => !v)}
                    placeholder="Tu contraseña actual"
                  />

                  <PasswordWithToggle
                    id="newPassword"
                    label="Nueva contraseña"
                    value={pwNew}
                    onChange={(e) => {
                      setPwNew(e.target.value);
                      setPwError("");
                      setPwSuccess("");
                    }}
                    show={showPwNew}
                    onToggle={() => setShowPwNew((v) => !v)}
                    placeholder="Mínimo 5 caracteres"
                  />

                  <PasswordWithToggle
                    id="confirmNewPassword"
                    label="Confirmar nueva contraseña"
                    value={pwConfirm}
                    onChange={(e) => {
                      setPwConfirm(e.target.value);
                      setPwError("");
                      setPwSuccess("");
                    }}
                    show={showPwConfirm}
                    onToggle={() => setShowPwConfirm((v) => !v)}
                    placeholder="Repite la nueva contraseña"
                  />

                  {pwError && (
                    <div className="form__error form__error--password">{pwError}</div>
                  )}

                  {pwSuccess && (
                    <div
                      className="form__error"
                      style={{ marginTop: "0.6rem", color: "green" }}
                    >
                      {pwSuccess}
                    </div>
                  )}

                  <div className="form__actions">
                    <button
                      type="submit"
                      className="btn btn--primary"
                      disabled={isChangingPassword}
                    >
                      {isChangingPassword ? "Actualizando..." : "Actualizar contraseña"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </section>

          <aside className="preview-card">
            <h2 className="preview-card__title">Foto de perfil</h2>
            <p className="preview-card__subtitle">
              JPG/PNG/WebP (máx 1MB y hasta 1600x1600 px). Se guarda en tu cuenta.
            </p>

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
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                className="profile-avatar__file-input"
              />

              {avatarError && (
                <div className="form__error" style={{ marginTop: "0.4rem" }}>
                  {avatarError}
                </div>
              )}

              <p className="form__hint profile-avatar-upload__hint">
                Tip: si eliges foto y guardas, se sube al backend automáticamente.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default UserRegisterCompletePage;