// src/pages/HomePage.jsx
import "../../src/styles/HomePage.css";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import tipsImage from "../assets/web/pages/home/home-tips.jpg.png";

const SHOW_DEMO_SECTIONS = true;
const API_BASE = import.meta.env.VITE_API_URL || "https://api.kelom.com.mx";

const PAGE_SIZE = 10;
const FETCH_SIZE = 11;

const CATEGORY_OPTIONS = [
  "Lugares",
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

  if (needle === "lugares") return "Lugares";

  const found = CATEGORY_OPTIONS.find((opt) => stripDiacritics(opt) === needle);
  return found || raw;
}

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

  const safeActiveIndex = useMemo(() => {
    if (!open) return -1;
    if (filtered.length === 0) return -1;
    if (activeIndex < 0) return -1;
    if (activeIndex >= filtered.length) return filtered.length - 1;
    return activeIndex;
  }, [open, filtered.length, activeIndex]);

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
  const venuesRef = useRef(null);

  const [providers, setProviders] = useState([]);
  const [providersLoading, setProvidersLoading] = useState(true);
  const [providersError, setProvidersError] = useState("");

  const [searchWhat, setSearchWhat] = useState("");
  const [searchWhere, setSearchWhere] = useState("");
  const [activeSearch, setActiveSearch] = useState(null);

  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchOffset, setSearchOffset] = useState(0);
  const [searchHasNext, setSearchHasNext] = useState(false);

  const fetchProvidersPage = async ({ category, where, offset = 0, isHome = false }) => {
    const qs = new URLSearchParams();

    if (isHome) {
      qs.set("limit", "10");
    } else {
      qs.set("limit", String(FETCH_SIZE));
      qs.set("offset", String(offset || 0));
      if (category) qs.set("category", category);
      if (where) qs.set("where", where);
    }

    const res = await fetch(`${API_BASE}/providers?${qs.toString()}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);

    const list = Array.isArray(data?.providers) ? data.providers : [];

    if (isHome) {
      return { list, hasNext: false };
    }

    const hasNext = list.length > PAGE_SIZE;
    return { list: list.slice(0, PAGE_SIZE), hasNext };
  };

  useEffect(() => {
    let cancelled = false;

    async function loadHome() {
      setProvidersError("");
      setProvidersLoading(true);

      try {
        const { list } = await fetchProvidersPage({
          category: "",
          where: "",
          offset: 0,
          isHome: true,
        });

        if (!cancelled) {
          setProviders(list);
        }
      } catch (err) {
        if (!cancelled) {
          setProvidersError(String(err?.message || "No se pudo cargar proveedores."));
          setProviders([]);
        }
      } finally {
        if (!cancelled) setProvidersLoading(false);
      }
    }

    loadHome();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!activeSearch) return;

    let cancelled = false;

    async function run() {
      setSearchError("");
      setSearchLoading(true);

      try {
        const { list, hasNext } = await fetchProvidersPage({
          category: activeSearch.category,
          where: activeSearch.where,
          offset: searchOffset,
          isHome: false,
        });

        if (!cancelled) {
          setSearchResults(list);
          setSearchHasNext(hasNext);
        }
      } catch (err) {
        if (!cancelled) {
          setSearchError(String(err?.message || "No se pudo realizar la búsqueda."));
          setSearchResults([]);
          setSearchHasNext(false);
        }
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [activeSearch, searchOffset]);

  const featuredCompanies = [
    {
      id: 1,
      name: "Lugares",
      category: "Haciendas, jardines y salones para boda",
      filterCategory: "Lugares",
      image:
        "https://images.pexels.com/photos/169211/pexels-photo-169211.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      id: 2,
      name: "Banquetes",
      category: "Banquetes para boda y eventos",
      filterCategory: "Banquetes",
      image:
        "https://images.pexels.com/photos/1128678/pexels-photo-1128678.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      id: 3,
      name: "Vestidos",
      category: "Vestidos de novia y ateliers",
      filterCategory: "Vestidos",
      image:
        "https://images.pexels.com/photos/3137073/pexels-photo-3137073.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      id: 4,
      name: "Organizadoras",
      category: "Wedding planner en México",
      filterCategory: "Organizador para Bodas",
      image:
        "https://images.pexels.com/photos/3951851/pexels-photo-3951851.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      id: 5,
      name: "Pasteles",
      category: "Pasteles y repostería para boda",
      filterCategory: "Pasteles",
      image:
        "https://images.pexels.com/photos/140831/pexels-photo-140831.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
  ];

  const scrollToVenues = () => {
    requestAnimationFrame(() => {
      venuesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const clearSearch = () => {
    setSearchWhat("");
    setSearchWhere("");
    setSearchResults(null);
    setSearchError("");
    setSearchLoading(false);
    setActiveSearch(null);
    setSearchOffset(0);
    setSearchHasNext(false);
    scrollToVenues();
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const category = normalizeCategory(searchWhat);
    const where = String(searchWhere || "").trim();

    if (!category) {
      return;
    }

    setActiveSearch({ category, where });
    setSearchOffset(0);
    setSearchResults([]);
    scrollToVenues();
  };

  const handleFeaturedClick = (company) => {
    if (!company?.filterCategory) {
      return;
    }

    setSearchWhat(company.filterCategory);
    setSearchWhere("");
    setActiveSearch({ category: company.filterCategory, where: "" });
    setSearchOffset(0);
    setSearchResults([]);
    scrollToVenues();
  };

  const listToShow = useMemo(() => {
    if (activeSearch) return searchResults || [];
    return providers;
  }, [activeSearch, searchResults, providers]);

  const loadingToShow = activeSearch ? searchLoading : providersLoading;
  const errorToShow = activeSearch ? searchError : providersError;

  const activeFiltersText = useMemo(() => {
    if (!activeSearch) return "";

    const parts = [];
    if (String(activeSearch.category || "").trim()) {
      parts.push(`Categoría: ${activeSearch.category}`);
    }
    if (String(activeSearch.where || "").trim()) {
      parts.push(`Búsqueda: ${activeSearch.where.trim()}`);
    }

    return parts.join(" · ");
  }, [activeSearch]);

  const pageNumber = Math.floor(searchOffset / PAGE_SIZE) + 1;
  const canPrev = activeSearch ? searchOffset > 0 : false;
  const canNext = activeSearch ? searchHasNext : false;

  const goPrev = () => {
    if (!activeSearch || !canPrev || loadingToShow) return;
    setSearchOffset((o) => Math.max(o - PAGE_SIZE, 0));
    scrollToVenues();
  };

  const goNext = () => {
    if (!activeSearch || !canNext || loadingToShow) return;
    setSearchOffset((o) => o + PAGE_SIZE);
    scrollToVenues();
  };

  return (
    <div className="home">
      {SHOW_DEMO_SECTIONS && (
        <>
          <section className="hero">
            <div className="container hero__inner">
              <div className="hero__eyebrow">Organiza tu boda con más claridad</div>
              <h1 className="hero__title">
                Planea tu boda con{" "}
                <span className="hero__title-highlight">proveedores y orientación</span>{" "}
                para tomar mejores decisiones.
              </h1>
              <p className="hero__subtitle">
                Kelom te ayuda a organizar tu boda en México con más calma:
                encuentra proveedores para boda, compara opciones por categoría y comienza
                a dar forma a tu evento sin perderte entre miles de resultados.
              </p>

              <div className="search-panel">
                <form className="search-panel__form" onSubmit={handleSearchSubmit}>
                  <div className="search-panel__field">
                    <label className="search-panel__label" htmlFor="search-what">
                      ¿Qué proveedor para tu boda buscas?
                    </label>

                    <SmartCombo
                      id="search-what"
                      placeholder="Lugares, jardín, salón, banquetes, DJ..."
                      value={searchWhat}
                      onChange={setSearchWhat}
                      options={CATEGORY_OPTIONS}
                      emptyText="No tenemos esa categoría aún. Puedes escribirla igual."
                    />
                  </div>

                  <div className="search-panel__field">
                    <label className="search-panel__label" htmlFor="search-where">
                      Localidad o nombre del proveedor
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
                    <button
                      className="search-panel__button"
                      type="submit"
                      disabled={searchLoading}
                    >
                      {searchLoading ? "Buscando..." : "Buscar proveedores"}
                    </button>

                    {activeSearch && (
                      <button
                        type="button"
                        className="search-panel__button search-panel__button--clear"
                        onClick={clearSearch}
                        disabled={searchLoading}
                      >
                        Limpiar búsqueda
                      </button>
                    )}
                  </div>
                </form>

                <p className="search-panel__hint">
                  Elige una categoría para comenzar. La localidad o el nombre del proveedor
                  son opcionales.
                </p>
              </div>
            </div>
          </section>

          <section className="venues" ref={venuesRef}>
            <div className="container">
              <header className="venues__header">
                <div>
                  <h2 className="venues__title">
                    {activeSearch
                      ? "Proveedores para boda según tu búsqueda"
                      : "Proveedores seleccionados para comenzar a planear tu boda"}
                  </h2>
                  <p className="venues__subtitle">
                    {activeSearch
                      ? activeFiltersText || "Aplicando filtros…"
                      : "Explora opciones disponibles en Kelom y encuentra lugares, banquetes, vestidos, pasteles y servicios para organizar tu evento con más claridad."}
                  </p>
                </div>
              </header>

              {errorToShow && <p style={{ marginTop: "0.8rem" }}>{errorToShow}</p>}

              {loadingToShow ? (
                <p style={{ marginTop: "0.8rem" }}>
                  {activeSearch ? "Buscando proveedores…" : "Cargando proveedores…"}
                </p>
              ) : listToShow.length === 0 ? (
                <p style={{ marginTop: "0.8rem" }}>
                  {activeSearch
                    ? "No encontramos proveedores con esos filtros. Prueba otra categoría o deja la localidad vacía."
                    : "Aún no hay proveedores publicados. Vuelve pronto."}
                </p>
              ) : (
                <>
                  <div className="venues__grid">
                    {listToShow.map((p, index) => {
                      const profileId = p.profile_id || p.id || null;
                      const fallbackProviderId = p.user_id || p.provider_id || null;
                      const detailId = profileId || fallbackProviderId || `provider-${index}`;

                      const name = p.venue_name || p.company_name || "Proveedor";
                      const location = p.venue_location || "Ubicación por definir";
                      const category =
                        p.business_category || p.businessCategory || p.category || "";
                      const image =
                        toAbsoluteApiUrl(p.main_photo_url) ||
                        "https://images.pexels.com/photos/3951852/pexels-photo-3951852.jpeg?auto=compress&cs=tinysrgb&w=800";

                      return (
                        <article key={detailId} className="venue-card">
                          <div className="venue-card__image-wrap">
                            <img
                              className="venue-card__image"
                              src={image}
                              alt={`${name} - ${category || "proveedor para boda"} en ${location}`}
                              loading="lazy"
                            />
                          </div>

                          <div className="venue-card__body">
                            <h3 className="venue-card__name">{name}</h3>

                            <div className="venue-card__rating">
                              <span className="venue-card__rating-stars">★</span>{" "}
                              {category ? category : "Proveedor publicado en Kelom"}
                            </div>

                            <div className="venue-card__location">{location}</div>

                            <Link to={`/proveedores/${detailId}`} className="venue-card__link">
                              Ver detalles del proveedor
                            </Link>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  {activeSearch && (canPrev || canNext) && (
                    <div className="venues__pagination" aria-label="Paginación de proveedores">
                      <button
                        type="button"
                        className="pager-btn"
                        onClick={goPrev}
                        disabled={!canPrev || loadingToShow}
                      >
                        ← Anterior
                      </button>

                      <div className="pager-pill">Página {pageNumber}</div>

                      <button
                        type="button"
                        className="pager-btn pager-btn--primary"
                        onClick={goNext}
                        disabled={!canNext || loadingToShow}
                      >
                        Siguiente →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

          <section className="featured">
            <div className="container">
              <header className="featured__header">
                <h2 className="featured__title">Encuentra proveedores para tu boda</h2>
                <p className="featured__subtitle">
                  Filtra por categorías clave y comienza a organizar tu boda con opciones
                  de lugares, banquetes, vestidos, pasteles y wedding planners.
                </p>
              </header>

              <div className="featured__grid">
                {featuredCompanies.map((company) => (
                  <button
                    key={company.id}
                    type="button"
                    className="featured-card featured-card--button"
                    onClick={() => handleFeaturedClick(company)}
                    title={`Ver proveedores: ${company.name}`}
                    aria-label={`Filtrar proveedores para boda por ${company.name}`}
                  >
                    <img
                      src={company.image}
                      alt={`${company.category} en Kelom`}
                      className="featured-card__image"
                      loading="lazy"
                    />
                    <div className="featured-card__name">{company.name}</div>
                    <div className="featured-card__category">{company.category}</div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      <section className="tips">
        <div className="container">
          <header className="tips__header">
            <h2 className="tips__title">Tips para planear tu boda</h2>
            <p className="tips__subtitle">
              Consejos simples para organizar tu boda con claridad, cuidar tu presupuesto
              y avanzar paso a paso.
            </p>
          </header>

          <div className="tips__content">
            <div className="tips__list">
              <article className="tips-card">
                <h3 className="tips-card__title">Empieza por el presupuesto</h3>
                <p className="tips-card__text">
                  Definir un rango claro desde el inicio te ayuda a elegir proveedores para
                  boda realistas sin renunciar al estilo que quieres.
                </p>
              </article>

              <article className="tips-card">
                <h3 className="tips-card__title">Haz una lista de prioridades</h3>
                <p className="tips-card__text">
                  Decide qué pesa más para tu evento: el lugar, la comida, la música,
                  la fotografía o la organización. Así será más fácil comparar opciones.
                </p>
              </article>
            </div>

            <div className="tips__image-wrap">
              <img
                src={tipsImage}
                alt="Pareja organizando su boda con claridad y acompañamiento"
                className="tips__image"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;