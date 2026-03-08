// src/pages/VenueDetailPage.jsx
import "../../Blocks/venues/VenueDetailPage.css";
import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import {
  clearProviderSession,
  getProviderToken,
} from "../services/providerAuth";
import { getToken } from "../utils/auth.js";

const API_BASE = import.meta.env.VITE_API_URL || "https://api.kelom.com.mx";
const PROVIDER_PROFILE_DRAFT_KEY = "kelom_provider_profile_draft";
const DEFAULT_REQUEST_MESSAGE =
  "Me interesan tus servicios, contáctame para obtener más información.";

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isUuid(v) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(v || ""),
  );
}

function toAbsoluteApiUrl(url) {
  if (!url) return "";
  if (String(url).startsWith("http")) return url;
  return `${API_BASE}${url}`;
}

const formatMXN = (value) => {
  if (value === null || value === undefined || value === "") return "";
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return n.toLocaleString("es-MX");
};

const DEFAULT_GALLERY = [
  "https://images.pexels.com/photos/3951851/pexels-photo-3951851.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/169211/pexels-photo-169211.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/169190/pexels-photo-169190.jpeg?auto=compress&cs=tinysrgb&w=1200",
];

// ===== Demo =====
const venuesDetail = [
  {
    id: 1,
    name: "Jardín Las Bugambilias",
    location: "Tlalpan, Ciudad de México",
    rating: 4.3,
    reviews: 80,
    ranking: "Top 10 jardines en CDMX",
    mainImage:
      "https://images.pexels.com/photos/3951852/pexels-photo-3951852.jpeg?auto=compress&cs=tinysrgb&w=1200",
    gallery: DEFAULT_GALLERY,
    capacity: "120 – 250 invitados",
    priceRange: "$$ · Presupuesto medio",
    eventTypes: ["Boda civil", "Boda religiosa", "Recepción al aire libre"],
    shortDescription:
      "Jardín rodeado de bugambilias y áreas verdes, ideal para ceremonias al aire libre y recepciones íntimas.",
    sellingPoints: [
      "Ceremonia civil en el mismo jardín",
      "Espacios techados y al aire libre",
      "Área especial para fotos de pareja",
    ],
    mapText: "Zona sur de CDMX, a 10 minutos del centro de Tlalpan.",
    opinions: [],
    category: "Jardín",
    mapEmbedUrl: "https://www.google.com/maps?output=embed&q=Tlalpan%2C%20CDMX",
  },
];

function toNumberOrNull(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function buildGoogleMapsEmbedUrl({ lat, lng, address }) {
  const base = "https://www.google.com/maps";

  const latN = toNumberOrNull(lat);
  const lngN = toNumberOrNull(lng);

  if (latN !== null && lngN !== null) {
    return `${base}?output=embed&q=${encodeURIComponent(`${latN},${lngN}`)}&z=15`;
  }

  const addr = String(address || "").trim();
  if (addr) {
    return `${base}?output=embed&q=${encodeURIComponent(addr)}`;
  }

  return "";
}

function mapApiProviderToVenue(profile, photos = []) {
  const photoUrls = Array.isArray(photos)
    ? photos.map((p) => toAbsoluteApiUrl(p.url)).filter(Boolean)
    : [];

  const gallery = photoUrls.length ? photoUrls.slice(0, 3) : DEFAULT_GALLERY;
  const mainImage = photoUrls.length ? photoUrls[0] : DEFAULT_GALLERY[0];

  const capMin = profile?.capacity_min ?? profile?.capacityMin;
  const capMax = profile?.capacity_max ?? profile?.capacityMax;

  const capacity =
    capMin !== null && capMin !== undefined
      ? capMax !== null && capMax !== undefined && capMax !== ""
        ? `${capMin} – ${capMax} invitados`
        : `${capMin} invitados`
      : "Capacidad por definir";

  const priceFrom = profile?.price_from ?? profile?.priceFrom;
  const priceTo = profile?.price_to ?? profile?.priceTo;

  const priceRange =
    priceFrom !== null && priceFrom !== undefined
      ? priceTo !== null && priceTo !== undefined
        ? `$${formatMXN(priceFrom)} – $${formatMXN(priceTo)}`
        : `Desde $${formatMXN(priceFrom)}`
      : "Precio por definir";

  const eventTypes = Array.isArray(profile?.event_types)
    ? profile.event_types
    : Array.isArray(profile?.eventTypes)
      ? profile.eventTypes
      : [];

  const sellingPoints = Array.isArray(profile?.selling_points)
    ? profile.selling_points
    : Array.isArray(profile?.sellingPoints)
      ? profile.sellingPoints
      : [];

  const category =
    profile?.business_category ||
    profile?.businessCategory ||
    profile?.category ||
    "";

  const venueLocation =
    profile?.venue_location ||
    profile?.venueLocation ||
    "Ubicación por definir";

  const locationLat = profile?.location_lat ?? profile?.locationLat ?? null;
  const locationLng = profile?.location_lng ?? profile?.locationLng ?? null;

  const mapEmbedUrl = buildGoogleMapsEmbedUrl({
    lat: locationLat,
    lng: locationLng,
    address: venueLocation,
  });

  return {
    id: profile?.user_id || "mi-perfil",
    name: profile?.venue_name || profile?.venueName || "Mi proveedor",
    location: venueLocation,
    rating: 0,
    reviews: 0,
    ranking: "",
    mainImage,
    gallery,
    capacity,
    priceRange,
    eventTypes,
    category,
    shortDescription:
      profile?.short_description ||
      profile?.shortDescription ||
      "Descripción por definir.",
    sellingPoints: sellingPoints.length
      ? sellingPoints
      : ["Punto destacado 1", "Punto destacado 2", "Punto destacado 3"],
    mapText:
      profile?.map_text ||
      profile?.mapText ||
      "Ubicación por definir. (Google Maps ya está listo para usarse aquí).",
    opinions: [],
    mapEmbedUrl,
  };
}

function VenueDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const forceProviderView = params.get("mode") === "provider";

  const isMyProfile = id === "mi-perfil";
  const isProviderView = forceProviderView || isMyProfile;

  const [loading, setLoading] = useState(false);
  const [apiVenue, setApiVenue] = useState(null);
  const [apiError, setApiError] = useState("");

  // Modal modes: null | "request" | "register"
  const [modalMode, setModalMode] = useState(null);

  const [requestMessage, setRequestMessage] = useState(DEFAULT_REQUEST_MESSAGE);
  const [preferredSchedule, setPreferredSchedule] = useState("");
  const [requestUiMessage, setRequestUiMessage] = useState("");

  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [requestSendError, setRequestSendError] = useState("");

  const isModalOpen = modalMode !== null;

  useEffect(() => {
    let cancelled = false;

    const fetchJson = async (url, { token } = {}) => {
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(url, { headers });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Error HTTP ${res.status}`);
      return data;
    };

    const run = async () => {
      setApiError("");

      if (isProviderView) {
        const token = getProviderToken();

        if (!token) {
          const raw = localStorage.getItem(PROVIDER_PROFILE_DRAFT_KEY);
          const draft = raw ? safeParse(raw) : null;

          if (draft && !cancelled) {
            const venue = mapApiProviderToVenue(
              {
                venueName: draft.venueName,
                venueLocation: draft.venueLocation,
                businessCategory: draft.businessCategory,
                shortDescription: draft.shortDescription,
                description: draft.description,
                services: draft.services,
                eventTypes: draft.eventTypes,
                sellingPoints: String(draft.sellingPointsText || "")
                  .split("\n")
                  .map((x) => x.trim())
                  .filter(Boolean),
                mapText: draft.mapText,
                capacityMin: draft.capacityMin,
                capacityMax: draft.capacityMax,
                priceFrom: draft.priceFrom,
                priceTo: draft.priceTo,
                locationLat: draft.locationLat,
                locationLng: draft.locationLng,
              },
              [],
            );
            setApiVenue(venue);
          }

          return;
        }

        setLoading(true);
        try {
          const data = await fetchJson(`${API_BASE}/providers/me`, { token });
          if (cancelled) return;

          const venue = mapApiProviderToVenue(
            data?.profile,
            data?.photos || [],
          );
          setApiVenue(venue);
        } catch (err) {
          const msg = String(err?.message || "No se pudo cargar el perfil.");
          if (msg.toLowerCase().includes("token")) {
            clearProviderSession();
            navigate("/empresas/acceso", {
              replace: true,
              state: { from: location.pathname + location.search },
            });
            return;
          }
          if (!cancelled) setApiError(msg);
        } finally {
          if (!cancelled) setLoading(false);
        }

        return;
      }

      if (isUuid(id)) {
        setLoading(true);
        try {
          const data = await fetchJson(`${API_BASE}/providers/${id}`);
          if (cancelled) return;

          const venue = mapApiProviderToVenue(
            data?.profile,
            data?.photos || [],
          );
          setApiVenue(venue);
        } catch (err) {
          if (!cancelled)
            setApiError(
              String(err?.message || "No se pudo cargar el proveedor."),
            );
        } finally {
          if (!cancelled) setLoading(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [id, isProviderView, navigate, location.pathname, location.search]);

  // lock scroll + ESC when modal open
  useEffect(() => {
    if (!isModalOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setModalMode(null);
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isModalOpen]);

  const venue = useMemo(() => {
    if (apiVenue) return apiVenue;
    const foundDemo = venuesDetail.find(
      (item) => String(item.id) === String(id),
    );
    return foundDemo || null;
  }, [apiVenue, id]);

  const isRequestSubmitDisabled =
    isSendingRequest ||
    !String(preferredSchedule || "").trim() ||
    !String(requestMessage || "").trim();

  const handleGoEdit = () => {
    const token = getProviderToken();
    if (!token) {
      navigate("/empresas/acceso", {
        state: { from: "/empresas/registro/completar" },
      });
      return;
    }
    navigate("/empresas/registro/completar", { state: { authMode: "edit" } });
  };

  const handleLogout = () => {
    clearProviderSession();
    navigate("/empresas", { replace: true });
  };

  const closeAnyModal = () => {
    if (isSendingRequest) return;
    setModalMode(null);
  };

  const openRegisterModal = () => {
    setRequestSendError("");
    setRequestUiMessage("");
    setModalMode("register");
  };

  const openRequestModal = () => {
    setRequestSendError("");
    setRequestUiMessage("");
    setRequestMessage(DEFAULT_REQUEST_MESSAGE);
    setPreferredSchedule("");
    setModalMode("request");
  };

  const handleMessageFocus = () => {
    if (requestMessage === DEFAULT_REQUEST_MESSAGE) {
      setRequestMessage("");
    }
  };

  const handleClickRequestInfo = () => {
    // Solo aplica a vista de usuario
    if (isProviderView) return;

    const userToken = getToken();
    if (!userToken) {
      // Regla 1: si NO está logeado → NO abre formulario
      openRegisterModal();
      return;
    }

    // Regla 2: si SÍ está logeado → abre formulario
    openRequestModal();
  };

  const postInfoRequest = async ({ providerId, message, preferredContactSchedule, token }) => {
    const res = await fetch(`${API_BASE}/info-requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ providerId, message, preferredContactSchedule }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data?.error || `Error HTTP ${res.status}`;
      const err = new Error(msg);
      err.status = res.status;
      throw err;
    }
    return data;
  };

  const handleRequestSubmit = async (event) => {
    event.preventDefault();
    if (isRequestSubmitDisabled) return;

    setRequestSendError("");

    // seguridad extra: este modal solo debe abrir con login, pero por si acaso…
    const token = getToken();
    if (!token) {
      setModalMode(null);
      openRegisterModal();
      return;
    }

    // providerId debe ser UUID sí o sí (en prod lo es)
    if (!isUuid(id)) {
      setRequestSendError("Este proveedor está en modo demo. No se puede enviar solicitud aquí.");
      return;
    }

    try {
      setIsSendingRequest(true);

      await postInfoRequest({
        providerId: id,
        message: String(requestMessage || "").trim(),
        preferredContactSchedule: String(preferredSchedule || "").trim(),
        token,
      });

      setModalMode(null);
      setRequestUiMessage(
        "Listo ✅ Tu solicitud fue enviada y quedó en revisión por el administrador.",
      );
    } catch (err) {
      const status = err?.status;

      // si token inválido/expirado
      if (status === 401 || status === 403) {
        setModalMode(null);
        setRequestUiMessage("");
        openRegisterModal();
        return;
      }

      setRequestSendError(String(err?.message || "No se pudo enviar la solicitud."));
    } finally {
      setIsSendingRequest(false);
    }
  };

  if (loading) {
    return (
      <div className="venue-page">
        <section className="venue-not-found">
          <div className="container">
            <h1>Cargando perfil…</h1>
            <p>Estamos trayendo tu información desde el backend.</p>
          </div>
        </section>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="venue-page">
        <section className="venue-not-found">
          <div className="container">
            <h1>No se pudo cargar el proveedor</h1>
            <p>{apiError}</p>
            <Link to="/" className="venue-not-found__back-link">
              ← Volver al inicio
            </Link>
          </div>
        </section>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="venue-page">
        <section className="venue-not-found">
          <div className="container">
            <h1>Proveedor no encontrado</h1>
            <p>
              Es posible que el enlace sea incorrecto o que el proveedor no
              exista.
            </p>
            <Link to="/" className="venue-not-found__back-link">
              ← Volver a la lista de lugares
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <>
      <div className="venue-page">
        <section className="venue-hero">
          <div className="container venue-hero__grid">
            <div className="venue-hero__info">
              <Link
                to={isProviderView ? "/empresas" : "/"}
                className="venue-hero__back-link"
              >
                ←{" "}
                {isProviderView
                  ? "Volver al área de empresas"
                  : "Volver a la lista de lugares"}
              </Link>

              <span className="venue-hero__pill">
                {isProviderView || isUuid(id) ? "Proveedor" : "Lugar para boda"}
              </span>

              <h1 className="venue-hero__name">{venue.name}</h1>
              <p className="venue-hero__location">{venue.location}</p>

              <p className="venue-hero__lead">{venue.shortDescription}</p>

              <ul className="venue-hero__highlights">
                {venue.category ? <li>{venue.category}</li> : null}
                <li>{venue.capacity}</li>
                <li>{venue.priceRange}</li>
                {(venue.eventTypes || []).slice(0, 2).map((type) => (
                  <li key={type}>{type}</li>
                ))}
              </ul>

              {requestUiMessage && !isProviderView && (
                <div className="venue-request-banner">{requestUiMessage}</div>
              )}

              <div className="venue-hero__ctas">
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => {
                    const el = document.getElementById("venue-map");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Ver ubicación
                </button>

                {!isProviderView && (
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={handleClickRequestInfo}
                  >
                    Solicitar información
                  </button>
                )}

                {isProviderView && (
                  <>
                    <button
                      type="button"
                      className="btn btn--ghost"
                      title="Solicitudes de información"
                      aria-label="Solicitudes de información"
                      onClick={() => navigate("/empresas/solicitudes")}
                      style={{
                        width: "46px",
                        minWidth: "46px",
                        padding: "0.75rem",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <svg
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 6h16v12H4z" />
                        <path d="m22 6-10 7L2 6" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      className="btn btn--primary"
                      onClick={handleGoEdit}
                    >
                      Editar mi perfil
                    </button>
                    <button
                      type="button"
                      className="btn btn--ghost"
                      onClick={handleLogout}
                    >
                      Cerrar sesión
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="venue-hero__media">
              <img
                src={venue.mainImage}
                alt={venue.name}
                className="venue-hero__image"
              />
            </div>
          </div>
        </section>

        <section className="venue-gallery">
          <div className="container">
            <h2 className="section-title">Fotos del lugar</h2>
            <p className="section-subtitle">Galería real (backend).</p>

            <div className="venue-gallery__grid">
              {(venue.gallery || []).map((photo, index) => (
                <figure key={index} className="venue-gallery__item">
                  <img
                    src={photo}
                    alt={`${venue.name} foto ${index + 1}`}
                    loading="lazy"
                  />
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="venue-info">
          <div className="container">
            <div className="venue-info__grid">
              <div className="venue-info__description">
                <h2 className="section-title">Sobre este lugar</h2>
                <p>{venue.shortDescription}</p>

                <div className="venue-info__tags">
                  {venue.category ? (
                    <span className="chip">{venue.category}</span>
                  ) : null}
                  <span className="chip">{venue.capacity}</span>
                  <span className="chip">{venue.priceRange}</span>
                  {(venue.eventTypes || []).map((type) => (
                    <span key={type} className="chip">
                      {type}
                    </span>
                  ))}
                </div>

                {venue.sellingPoints && venue.sellingPoints.length > 0 && (
                  <>
                    <h3 style={{ marginTop: "1.2rem" }}>
                      Lo mejor de este lugar
                    </h3>
                    <ul style={{ marginTop: "0.6rem" }}>
                      {venue.sellingPoints.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              <aside className="venue-info__sidebar">
                <h3 className="venue-info__sidebar-title">Información rápida</h3>
                <ul className="venue-info__list">
                  {venue.category ? (
                    <li>
                      <span className="venue-info__label">Categoría: </span>
                      {venue.category}
                    </li>
                  ) : null}
                  <li>
                    <span className="venue-info__label">Ubicación: </span>
                    {venue.location}
                  </li>
                  <li>
                    <span className="venue-info__label">Capacidad: </span>
                    {venue.capacity}
                  </li>
                  <li>
                    <span className="venue-info__label">Tipo de eventos: </span>
                    {(venue.eventTypes || []).join(", ") || "Por definir"}
                  </li>
                  <li>
                    <span className="venue-info__label">Rango de precio: </span>
                    {venue.priceRange}
                  </li>
                </ul>
              </aside>
            </div>
          </div>
        </section>

        <section className="venue-map" id="venue-map">
          <div className="container venue-map__inner">
            <div className="venue-map__info">
              <h2 className="section-title">Ubicación y accesos</h2>
              <p>{venue.mapText}</p>
              <ul className="venue-map__list">
                <li>Zona: {venue.location}</li>
                <li>Ideal para invitados que vienen de distintos puntos.</li>
              </ul>
            </div>

            <div className="venue-map__frame">
              {venue.mapEmbedUrl ? (
                <iframe
                  className="venue-map__iframe"
                  title={`Mapa de ${venue.name}`}
                  loading="lazy"
                  src={venue.mapEmbedUrl}
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="venue-map__placeholder">
                  No hay coordenadas/dirección suficiente para mostrar el mapa.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* ===== Modal (register or request) ===== */}
      {!isProviderView && isModalOpen && (
        <div
          className="venue-request-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="venue-request-modal-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeAnyModal();
            }
          }}
        >
          <div className="venue-request-modal__card">
            <button
              type="button"
              className="venue-request-modal__close"
              onClick={closeAnyModal}
              aria-label="Cerrar ventana"
              disabled={isSendingRequest}
              style={{ opacity: isSendingRequest ? 0.6 : 1 }}
            >
              ×
            </button>

            {modalMode === "register" ? (
              <>
                <div className="venue-request-modal__header">
                  <p className="venue-request-modal__eyebrow">Antes de continuar</p>
                  <h2
                    id="venue-request-modal-title"
                    className="venue-request-modal__title"
                  >
                    Primero debes registrarte
                  </h2>
                  <p className="venue-request-modal__subtitle">
                    Para solicitar información a un proveedor necesitas una cuenta.
                  </p>
                </div>

                <div className="venue-request-form">
                  <div className="venue-request-form__actions">
                    <button
                      type="button"
                      className="btn btn--ghost"
                      onClick={closeAnyModal}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="btn btn--primary"
                      onClick={() => {
                        closeAnyModal();
                        navigate("/registro", {
                          state: { from: location.pathname + location.search },
                        });
                      }}
                    >
                      Ir a registrarme
                    </button>
                  </div>

                  <p className="venue-request-form__disclaimer">
                    Tip nerd: esto evita spam y nos permite moderar solicitudes antes de enviarlas.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="venue-request-modal__header">
                  <p className="venue-request-modal__eyebrow">Solicitud rápida</p>
                  <h2
                    id="venue-request-modal-title"
                    className="venue-request-modal__title"
                  >
                    Solicitar información a {venue.name}
                  </h2>
                  <p className="venue-request-modal__subtitle">
                    Déjale al proveedor un mensaje breve y el horario en el que
                    prefieres ser contactado.
                  </p>
                </div>

                <form
                  className="venue-request-form"
                  onSubmit={handleRequestSubmit}
                  noValidate
                >
                  {requestSendError && (
                    <div className="venue-request-banner" style={{ marginBottom: "0.9rem" }}>
                      {requestSendError}
                    </div>
                  )}

                  <div className="venue-request-form__field">
                    <label
                      className="venue-request-form__label"
                      htmlFor="venue-request-message"
                    >
                      Mensaje
                    </label>
                    <textarea
                      id="venue-request-message"
                      className="venue-request-form__textarea"
                      rows={5}
                      value={requestMessage}
                      onFocus={handleMessageFocus}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      disabled={isSendingRequest}
                    />
                    <p className="venue-request-form__hint">
                      Puedes dejar el mensaje sugerido o escribir uno más específico.
                    </p>
                  </div>

                  <div className="venue-request-form__field">
                    <label
                      className="venue-request-form__label"
                      htmlFor="venue-request-schedule"
                    >
                      Horario preferido para ser contactado *
                    </label>
                    <input
                      id="venue-request-schedule"
                      type="text"
                      className="venue-request-form__input"
                      placeholder="Ej. Lunes a viernes de 5:00 pm a 8:00 pm"
                      value={preferredSchedule}
                      onChange={(e) => setPreferredSchedule(e.target.value)}
                      required
                      disabled={isSendingRequest}
                    />
                    <p className="venue-request-form__hint">
                      Este campo es obligatorio para activar el envío.
                    </p>
                  </div>

                  <div className="venue-request-form__actions">
                    <button
                      type="button"
                      className="btn btn--ghost"
                      onClick={closeAnyModal}
                      disabled={isSendingRequest}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn--primary"
                      disabled={isRequestSubmitDisabled}
                    >
                      {isSendingRequest ? "Enviando…" : "Enviar solicitud"}
                    </button>
                  </div>

                  <p className="venue-request-form__disclaimer">
                    Esta solicitud se envía al backend y queda en estado <strong>pendiente</strong> para revisión del administrador.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default VenueDetailPage;