// src/pages/ProvidersListPage.jsx
import "../../Blocks/venues/ProvidersListPage.css";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "https://api.kelom.com.mx";

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

function ProvidersListPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState({ loading: true, error: "" });
  const [items, setItems] = useState([]);

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    p.set("limit", "30");
    p.set("offset", "0");
    return p.toString();
  }, [q]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus({ loading: true, error: "" });

      try {
        const res = await fetch(`${API_BASE}/providers?${qs}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);

        if (!cancelled) setItems(Array.isArray(data?.providers) ? data.providers : []);
      } catch (err) {
        if (!cancelled) setStatus({ loading: false, error: String(err?.message || "Error") });
        return;
      }

      if (!cancelled) setStatus({ loading: false, error: "" });
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [qs]);

  return (
    <div className="providers">
      <div className="container">
        <div className="providers__header">
          <h1 className="providers__title">Proveedores</h1>
          <p className="providers__subtitle">
            Aquí solo aparecen proveedores aprobados y visibles.
          </p>

          <div className="providers__search">
            <input
              className="providers__input"
              placeholder="Buscar por nombre / venue / ubicación…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <Link to="/" className="providers__back">
              ← Volver
            </Link>
          </div>
        </div>

        {status.error && <div className="providers__error">{status.error}</div>}

        {status.loading ? (
          <div className="providers__loading">Cargando proveedores…</div>
        ) : (
          <div className="providers__grid">
            {items.map((p) => {
              const img = toAbsoluteApiUrl(p.main_photo_url) || "";
              const capMin = p.capacity_min;
              const capMax = p.capacity_max;
              const capacity =
                capMin !== null && capMin !== undefined
                  ? capMax !== null && capMax !== undefined
                    ? `${capMin} – ${capMax} invitados`
                    : `${capMin} invitados`
                  : "Capacidad por definir";

              const priceFrom = p.price_from;
              const priceTo = p.price_to;
              const price =
                priceFrom !== null && priceFrom !== undefined
                  ? priceTo !== null && priceTo !== undefined
                    ? `$${formatMXN(priceFrom)} – $${formatMXN(priceTo)}`
                    : `Desde $${formatMXN(priceFrom)}`
                  : "Precio por definir";

              return (
                <article key={p.user_id} className="provider-card">
                  <Link to={`/proveedores/${p.user_id}`} className="provider-card__link">
                    <div className="provider-card__media">
                      {img ? (
                        <img
                          className="provider-card__img"
                          src={img}
                          alt={p.venue_name || p.company_name || "Proveedor"}
                          loading="lazy"
                        />
                      ) : (
                        <div className="provider-card__img provider-card__img--empty">
                          Sin foto
                        </div>
                      )}
                    </div>

                    <div className="provider-card__body">
                      <h2 className="provider-card__title">
                        {p.venue_name || p.company_name || "Proveedor"}
                      </h2>
                      <p className="provider-card__location">{p.venue_location || "Ubicación por definir"}</p>
                      <p className="provider-card__desc">
                        {p.short_description || "Descripción por definir."}
                      </p>

                      <div className="provider-card__chips">
                        <span className="provider-chip">{capacity}</span>
                        <span className="provider-chip">{price}</span>
                      </div>

                      <div className="provider-card__cta">Ver detalle →</div>
                    </div>
                  </Link>
                </article>
              );
            })}

            {!items.length && (
              <div className="providers__empty">
                No hay resultados. Intenta con otra búsqueda.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProvidersListPage;