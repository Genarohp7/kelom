// src/pages/HomePage.jsx
import "../../src/styles/HomePage.css";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import tipsImage from "../assets/web/pages/home/home-tips.jpg.png";

const SHOW_DEMO_SECTIONS = true; // hero/venues/featured siguen visibles
const API_BASE = import.meta.env.VITE_API_URL || "https://api.kelom.com.mx";

const CATEGORY_OPTIONS = [
  "Jardín",
  "Hacienda",
  "Salón",
  "Banquetes",
  "Organizador para Bodas",
  "Vestidos",
  "Pasteles",
  "DJ",
  "Florería",
  "Fotógrafo",
];

const LOCALITY_OPTIONS = [
  // CDMX (alcaldías)
  "Álvaro Obregón",
  "Azcapotzalco",
  "Benito Juárez",
  "Coyoacán",
  "Cuajimalpa de Morelos",
  "Cuauhtémoc",
  "Gustavo A. Madero",
  "Iztacalco",
  "Iztapalapa",
  "La Magdalena Contreras",
  "Miguel Hidalgo",
  "Milpa Alta",
  "Tláhuac",
  "Tlalpan",
  "Venustiano Carranza",
  "Xochimilco",

  // EdoMex (municipios)
  "Ecatepec",
  "Naucalpan",
  "Tlalnepantla",
  "Nezahualcóyotl",
  "Coacalco",
  "Cuautitlán",
  "Huixquilucan",
  "Chalco",
  "Texcoco",
  "Atizapán de Zaragoza",
  "San Pedro Tepotzotlán",
];

function toAbsoluteApiUrl(url) {
  if (!url) return "";
  if (String(url).startsWith("http")) return url;
  return `${API_BASE}${url}`;
}

function stripDiacritics(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function normalizeCategory(input) {
  const raw = String(input || "").trim();
  if (!raw) return "";
  const needle = stripDiacritics(raw);
  const found = CATEGORY_OPTIONS.find((opt) => stripDiacritics(opt) === needle);
  return found || raw;
}

/**
 * ✅ Combobox moderno (reemplazo de <datalist>)
 * - Autocompleta con dropdown estilizable
 * - Permite escribir libre
 * - Soporta teclado: ↑ ↓ Enter Esc
 * - Cierra al click fuera
 */
function SmartCombo({
  id,
  placeholder,
  value,
  onChange,
  options = [],
  emptyText = "Sin coincidencias",
}) {
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const filtered = useMemo(() => {
    const needle = stripDiacritics(value);
    if (!needle) return options;
    return options.filter((opt) => stripDiacritics(opt).includes(needle));
  }, [value, options]);

  // ✅ Derivado (NO setState en effects)
  const safeActiveIndex = useMemo(() => {
    if (!open) return -1;
    if (filtered.length === 0) return -1;
    if (activeIndex < 0) return -1; // no hay selección "activa" hasta que uses teclado
    if (activeIndex >= filtered.length) return filtered.length - 1; // clamp
    return activeIndex;
  }, [open, filtered.length, activeIndex]);

  // Cerrar al click fuera
  useEffect(() => {
    if (!open) return;

    const onDocDown = (e) => {
      const root = rootRef.current;
      if (!root) return;
      if (!root.contains(e.target)) setOpen(false);
    };

    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [open]);

  const pick = (opt) => {
    onChange(opt);
    setOpen(false);
    setActiveIndex(-1);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) setOpen(true);
      if (filtered.length === 0) return;

      setActiveIndex((prev) => {
        const normalized = prev < 0 || prev >= filtered.length ? -1 : prev;
        const next = normalized < 0 ? 0 : (normalized + 1) % filtered.length;
        return next;
      });
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) setOpen(true);
      if (filtered.length === 0) return;

      setActiveIndex((prev) => {
        const normalized = prev < 0 || prev >= filtered.length ? -1 : prev;
        if (normalized < 0) return filtered.length - 1;
        const next = normalized - 1;
        return next < 0 ? filtered.length - 1 : next;
      });
      return;
    }

    if (e.key === "Enter") {
      if (open && safeActiveIndex >= 0 && filtered[safeActiveIndex]) {
        e.preventDefault();
        pick(filtered[safeActiveIndex]);
      }
    }
  };

  const listboxId = `${id}-listbox`;

  return (
    <div className="combo" ref={rootRef}>
      <div className="combo__control">
        <input
          ref={inputRef}
          id={id}
          type="text"
          className="search-panel__input combo__input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={
            open && safeActiveIndex >= 0 ? `${id}-opt-${safeActiveIndex}` : undefined
          }
        />

        <button
          type="button"
          className="combo__toggle"
          aria-label={open ? "Cerrar opciones" : "Mostrar opciones"}
          onClick={() => {
            setOpen((v) => !v);
            if (!open) inputRef.current?.focus();
          }}
        >
          ▾
        </button>
      </div>

      {open && (
        <div className="combo__popover" role="listbox" id={listboxId}>
          {filtered.length === 0 ? (
            <div className="combo__empty">{emptyText}</div>
          ) : (
            filtered.map((opt, idx) => (
              <button
                key={`${opt}-${idx}`}
                id={`${id}-opt-${idx}`}
                type="button"
                role="option"
                aria-selected={idx === safeActiveIndex}
                className={
                  idx === safeActiveIndex
                    ? "combo__option combo__option--active"
                    : "combo__option"
                }
                onMouseDown={(ev) => ev.preventDefault()}
                onClick={() => pick(opt)}
              >
                {opt}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function HomePage() {
  const [providers, setProviders] = useState([]);
  const [providersLoading, setProvidersLoading] = useState(true);
  const [providersError, setProvidersError] = useState("");

  // búsqueda
  const [searchWhat, setSearchWhat] = useState("");
  const [searchWhere, setSearchWhere] = useState("");
  const [searchResults, setSearchResults] = useState(null); // null = no buscó, [] = resultados
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Solo trae publicados (approved + listed) porque el backend ya filtra
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setProvidersError("");
      setProvidersLoading(true);

      try {
        const res = await fetch(`${API_BASE}/providers?limit=8`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);

        const list = Array.isArray(data?.providers) ? data.providers : [];
        if (!cancelled) setProviders(list);
      } catch (err) {
        if (!cancelled)
          setProvidersError(String(err?.message || "No se pudo cargar proveedores."));
      } finally {
        if (!cancelled) setProvidersLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const featuredCompanies = [
    {
      id: 1,
      name: "Lugares",
      category: "Haciendas, jardines, salones",
      image:
        "https://images.pexels.com/photos/169211/pexels-photo-169211.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      id: 2,
      name: "Banquetes",
      category: "Cocina tradicional y de autor",
      image:
        "https://images.pexels.com/photos/1128678/pexels-photo-1128678.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      id: 3,
      name: "Vestidos",
      category: "Atelier y tiendas especializadas",
      image:
        "https://images.pexels.com/photos/3137073/pexels-photo-3137073.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      id: 4,
      name: "Organizadoras",
      category: "Wedding planners",
      image:
        "https://images.pexels.com/photos/3951851/pexels-photo-3951851.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      id: 5,
      name: "Pasteles",
      category: "Repostería para bodas",
      image:
        "https://images.pexels.com/photos/140831/pexels-photo-140831.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
  ];

  const clearSearch = () => {
    setSearchWhat("");
    setSearchWhere("");
    setSearchResults(null);
    setSearchError("");
    setSearchLoading(false);
  };

  const handleSearchSubmit = async (event) => {
    event.preventDefault();

    const category = normalizeCategory(searchWhat);
    const where = String(searchWhere || "").trim();

    // si no hay filtros, regresamos al modo “home normal”
    if (!category && !where) {
      clearSearch();
      return;
    }

    setSearchError("");
    setSearchLoading(true);

    try {
      const qs = new URLSearchParams();
      qs.set("limit", "48");
      if (category) qs.set("category", category);
      if (where) qs.set("where", where);

      const res = await fetch(`${API_BASE}/providers?${qs.toString()}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);

      const list = Array.isArray(data?.providers) ? data.providers : [];
      setSearchResults(list);
    } catch (err) {
      setSearchError(String(err?.message || "No se pudo realizar la búsqueda."));
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const listToShow = useMemo(() => {
    if (searchResults !== null) return searchResults;
    return providers;
  }, [searchResults, providers]);

  const loadingToShow = searchResults !== null ? searchLoading : providersLoading;
  const errorToShow = searchResults !== null ? searchError : providersError;

  const activeFiltersText = useMemo(() => {
    if (searchResults === null) return "";
    const parts = [];
    if (String(searchWhat || "").trim())
      parts.push(`Categoría: ${normalizeCategory(searchWhat)}`);
    if (String(searchWhere || "").trim())
      parts.push(`Búsqueda: ${searchWhere.trim()}`);
    return parts.join(" · ");
  }, [searchResults, searchWhat, searchWhere]);

  return (
    <div className="home">
      {SHOW_DEMO_SECTIONS && (
        <>
          {/* HERO + BUSCADOR */}
          <section className="hero">
            <div className="container hero__inner">
              <div className="hero__eyebrow">Planea tu boda con calma</div>
              <h1 className="hero__title">
                Encuentra el <span className="hero__title-highlight">lugar perfecto</span>{" "}
                para decir “sí”.
              </h1>
              <p className="hero__subtitle">
                Jardines, salones, haciendas, banquetes y más. Kelom te ayuda a descubrir opciones
                pensadas para ti, sin perderte entre miles de resultados.
              </p>

              <div className="search-panel">
                <form className="search-panel__form" onSubmit={handleSearchSubmit}>
                  <div className="search-panel__field">
                    <label className="search-panel__label" htmlFor="search-what">
                      ¿Qué buscas?
                    </label>

                    <SmartCombo
                      id="search-what"
                      placeholder="Jardín, salón, banquetes, DJ..."
                      value={searchWhat}
                      onChange={setSearchWhat}
                      options={CATEGORY_OPTIONS}
                      emptyText="No tenemos esa categoría (aún). Puedes escribirla igual."
                    />
                  </div>

                  <div className="search-panel__field">
                    <label className="search-panel__label" htmlFor="search-where">
                      ¿Qué localidad o proveedor?
                    </label>

                    <SmartCombo
                      id="search-where"
                      placeholder="Tlalpan, Naucalpan… o escribe el nombre"
                      value={searchWhere}
                      onChange={setSearchWhere}
                      options={LOCALITY_OPTIONS}
                      emptyText="Sin coincidencias. Puedes escribir el nombre del proveedor."
                    />
                  </div>

                  <div className="search-panel__actions">
                    <button className="search-panel__button" type="submit" disabled={searchLoading}>
                      {searchLoading ? "Buscando..." : "Buscar"}
                    </button>

                    {searchResults !== null && (
                      <button
                        type="button"
                        className="search-panel__button search-panel__button--clear"
                        onClick={clearSearch}
                        disabled={searchLoading}
                      >
                        Limpiar
                      </button>
                    )}
                  </div>
                </form>

                <p className="search-panel__hint">
                  Tip: puedes elegir de la lista o escribir libre. Nosotros intentamos entenderte
                  antes de juzgarte. (Casi siempre.)
                </p>
              </div>
            </div>
          </section>

          {/* LUGARES / VENUES (REAL DESDE BACKEND) */}
          <section className="venues">
            <div className="container">
              <header className="venues__header">
                <div>
                  <h2 className="venues__title">
                    {searchResults !== null ? "Resultados de tu búsqueda" : "Lugares para realizar tu sueño"}
                  </h2>
                  <p className="venues__subtitle">
                    {searchResults !== null
                      ? activeFiltersText || "Aplicando filtros…"
                      : "Aquí solo aparecen proveedores aprobados y publicados por Kelom."}
                  </p>
                </div>
              </header>

              {errorToShow && <p style={{ marginTop: "0.8rem" }}>{errorToShow}</p>}

              {loadingToShow ? (
                <p style={{ marginTop: "0.8rem" }}>
                  {searchResults !== null ? "Buscando proveedores…" : "Cargando proveedores…"}
                </p>
              ) : listToShow.length === 0 ? (
                <p style={{ marginTop: "0.8rem" }}>
                  {searchResults !== null
                    ? "No encontramos proveedores con esos filtros. Prueba otra combinación."
                    : "Aún no hay proveedores publicados. Vuelve pronto."}
                </p>
              ) : (
                <div className="venues__grid">
                  {listToShow.map((p) => {
                    const id = p.user_id;
                    const name = p.venue_name || p.company_name || "Proveedor";
                    const location = p.venue_location || "Ubicación por definir";
                    const category = p.business_category || p.businessCategory || p.category || "";
                    const image =
                      toAbsoluteApiUrl(p.main_photo_url) ||
                      "https://images.pexels.com/photos/3951852/pexels-photo-3951852.jpeg?auto=compress&cs=tinysrgb&w=800";

                    return (
                      <article key={id} className="venue-card">
                        <div className="venue-card__image-wrap">
                          <img className="venue-card__image" src={image} alt={name} />
                        </div>

                        <div className="venue-card__body">
                          <h3 className="venue-card__name">{name}</h3>

                          <div className="venue-card__rating">
                            <span className="venue-card__rating-stars">★</span>{" "}
                            {category ? category : "Publicado en Kelom"}
                          </div>

                          <div className="venue-card__location">{location}</div>

                          <Link to={`/proveedores/${id}`} className="venue-card__link">
                            Ver más detalles
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* EMPRESAS DESTACADAS */}
          <section className="featured">
            <div className="container">
              <header className="featured__header">
                <h2 className="featured__title">Empresas destacadas</h2>
                <p className="featured__subtitle">Proveedores clave para completar tu boda ideal.</p>
              </header>

              <div className="featured__grid">
                {featuredCompanies.map((company) => (
                  <article key={company.id} className="featured-card">
                    <img src={company.image} alt={company.name} className="featured-card__image" />
                    <div className="featured-card__name">{company.name}</div>
                    <div className="featured-card__category">{company.category}</div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* TIPS PARA TU BODA */}
      <section className="tips">
        <div className="container">
          <header className="tips__header">
            <h2 className="tips__title">Tips para tu boda</h2>
            <p className="tips__subtitle">Consejos cortos para que disfrutes el proceso, no solo el gran día.</p>
          </header>

          <div className="tips__content">
            <div className="tips__list">
              <article className="tips-card">
                <h3 className="tips-card__title">Empieza por el presupuesto</h3>
                <p className="tips-card__text">
                  Definir un rango claro desde el inicio te ayudará a elegir opciones realistas sin renunciar al estilo que quieres.
                </p>
              </article>

              <article className="tips-card">
                <h3 className="tips-card__title">Haz una lista de prioridades</h3>
                <p className="tips-card__text">
                  ¿Es más importante el lugar, la comida o la música? Ponerlo en papel facilita las decisiones cuando tengas que elegir.
                </p>
              </article>
            </div>

            <div className="tips__image-wrap">
              <img src={tipsImage} alt="Pareja organizando su boda con calma" className="tips__image" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;