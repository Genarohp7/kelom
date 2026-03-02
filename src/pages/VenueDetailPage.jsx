// src/pages/VenueDetailPage.jsx
import "../../Blocks/venues/VenueDetailPage.css";
import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "https://api.kelom.com.mx";
const PROVIDER_TOKEN_KEY = "kelom_provider_token";
const PROVIDER_USER_KEY = "kelom_provider_user";
const PROVIDER_PROFILE_DRAFT_KEY = "kelom_provider_profile_draft";

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isUuid(v) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(v || "")
  );
}

function toAbsoluteApiUrl(url) {
  if (!url) return "";
  if (String(url).startsWith("http")) return url;
  return `${API_BASE}${url}`;
}

function clearProviderSession() {
  try {
    localStorage.removeItem(PROVIDER_TOKEN_KEY);
    localStorage.removeItem(PROVIDER_USER_KEY);
  } catch {
    // ignore
  }
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

// ===== Datos estáticos (demo) =====
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
  },
];

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

  return {
    id: profile?.user_id || "mi-perfil",
    name: profile?.venue_name || profile?.venueName || "Mi proveedor",
    location:
      profile?.venue_location || profile?.venueLocation || "Ubicación por definir",
    rating: 0,
    reviews: 0,
    ranking: "",
    mainImage,
    gallery,
    capacity,
    priceRange,
    eventTypes,
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

  const providerToken = useMemo(() => {
    try {
      return localStorage.getItem(PROVIDER_TOKEN_KEY) || "";
    } catch {
      return "";
    }
  }, []);

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

      // Caso 1: mi-perfil (privado) → /providers/me con token
      if (isProviderView) {
        const tokenNow = (() => {
          try {
            return localStorage.getItem(PROVIDER_TOKEN_KEY) || "";
          } catch {
            return "";
          }
        })();

        if (!tokenNow) {
          // fallback draft local
          const raw = localStorage.getItem(PROVIDER_PROFILE_DRAFT_KEY);
          const draft = raw ? safeParse(raw) : null;
          if (draft && !cancelled) {
            const venue = mapApiProviderToVenue(
              {
                venueName: draft.venueName,
                venueLocation: draft.venueLocation,
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
              },
              []
            );
            setApiVenue(venue);
          }
          return;
        }

        setLoading(true);
        try {
          const data = await fetchJson(`${API_BASE}/providers/me`, { token: tokenNow });
          if (cancelled) return;

          const venue = mapApiProviderToVenue(data?.profile, data?.photos || []);
          setApiVenue(venue);
        } catch (err) {
          if (!cancelled) setApiError(String(err?.message || "No se pudo cargar el perfil."));
        } finally {
          if (!cancelled) setLoading(false);
        }

        return;
      }

      // Caso 2: UUID → perfil público real
      if (isUuid(id)) {
        setLoading(true);
        try {
          const data = await fetchJson(`${API_BASE}/providers/${id}`);
          if (cancelled) return;

          const venue = mapApiProviderToVenue(data?.profile, data?.photos || []);
          setApiVenue(venue);
        } catch (err) {
          if (!cancelled) setApiError(String(err?.message || "No se pudo cargar el proveedor."));
        } finally {
          if (!cancelled) setLoading(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [id, isProviderView]);

  const venue = useMemo(() => {
    if (apiVenue) return apiVenue;
    const foundDemo = venuesDetail.find((item) => String(item.id) === String(id));
    return foundDemo || null;
  }, [apiVenue, id]);

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
            <p>Es posible que el enlace sea incorrecto o que el proveedor no exista.</p>
            <Link to="/" className="venue-not-found__back-link">
              ← Volver a la lista de lugares
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="venue-page">
      <section className="venue-hero">
        <div className="container venue-hero__grid">
          <div className="venue-hero__info">
            <Link
              to={isProviderView ? "/empresas" : "/"}
              className="venue-hero__back-link"
            >
              ← {isProviderView ? "Volver al área de empresas" : "Volver a la lista de lugares"}
            </Link>

            <span className="venue-hero__pill">
              {isProviderView || isUuid(id) ? "Proveedor" : "Lugar para boda"}
            </span>

            <h1 className="venue-hero__name">{venue.name}</h1>
            <p className="venue-hero__location">{venue.location}</p>

            {!isProviderView && !isUuid(id) && (
              <div className="venue-hero__rating">
                <span className="venue-hero__stars">★★★★★</span>
                <span className="venue-hero__rating-score">{venue.rating.toFixed(1)}</span>
                <span className="venue-hero__rating-count">({venue.reviews} opiniones)</span>
                {venue.ranking && <span className="venue-hero__ranking">{venue.ranking}</span>}
              </div>
            )}

            <p className="venue-hero__lead">{venue.shortDescription}</p>

            <ul className="venue-hero__highlights">
              <li>{venue.capacity}</li>
              <li>{venue.priceRange}</li>
              {(venue.eventTypes || []).slice(0, 2).map((type) => (
                <li key={type}>{type}</li>
              ))}
            </ul>

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

              {isProviderView && providerToken && (
                <>
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => navigate("/empresas/registro/completar")}
                  >
                    Editar mi ficha
                  </button>

                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => {
                      clearProviderSession();
                      navigate("/empresas");
                    }}
                  >
                    Cerrar sesión
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="venue-hero__media">
            <img src={venue.mainImage} alt={venue.name} className="venue-hero__image" />
          </div>
        </div>
      </section>

      <section className="venue-gallery">
        <div className="container">
          <h2 className="section-title">Fotos del lugar</h2>
          <p className="section-subtitle">Galería real (ya conectada a tu backend).</p>

          <div className="venue-gallery__grid">
            {(venue.gallery || []).map((photo, index) => (
              <figure key={index} className="venue-gallery__item">
                <img src={photo} alt={`${venue.name} foto ${index + 1}`} loading="lazy" />
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
                  <h3 style={{ marginTop: "1.2rem" }}>Lo mejor de este lugar</h3>
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
            <iframe
              className="venue-map__iframe"
              title={`Mapa de ${venue.name}`}
              loading="lazy"
              src="about:blank"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default VenueDetailPage;