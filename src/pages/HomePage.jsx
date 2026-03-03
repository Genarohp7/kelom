// src/pages/HomePage.jsx
import "../../src/styles/HomePage.css";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import tipsImage from "../assets/web/pages/home/home-tips.jpg.png";

const SHOW_DEMO_SECTIONS = true; // hero/venues/featured siguen visibles
const API_BASE = import.meta.env.VITE_API_URL || "https://api.kelom.com.mx";

function toAbsoluteApiUrl(url) {
  if (!url) return "";
  if (String(url).startsWith("http")) return url;
  return `${API_BASE}${url}`;
}

function HomePage() {
  const [providers, setProviders] = useState([]);
  const [providersLoading, setProvidersLoading] = useState(true);
  const [providersError, setProvidersError] = useState("");

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
        if (!cancelled) setProvidersError(String(err?.message || "No se pudo cargar proveedores."));
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

  const handleFakeSubmit = (event) => {
    event.preventDefault();
  };

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
                Jardines, salones, haciendas, banquetes y más. Kelom te ayuda a descubrir
                opciones pensadas para ti, sin perderte entre miles de resultados.
              </p>

              <div className="search-panel">
                <form className="search-panel__form" onSubmit={handleFakeSubmit}>
                  <div className="search-panel__field">
                    <label className="search-panel__label" htmlFor="search-what">
                      ¿Qué buscas?
                    </label>
                    <input
                      id="search-what"
                      type="text"
                      className="search-panel__input"
                      placeholder="Jardín, salón, banquete, foto..."
                    />
                  </div>

                  <div className="search-panel__field">
                    <label className="search-panel__label" htmlFor="search-where">
                      ¿Qué localidad?
                    </label>
                    <input
                      id="search-where"
                      type="text"
                      className="search-panel__input"
                      placeholder="CDMX, Estado de México, Puebla..."
                    />
                  </div>

                  <button className="search-panel__button" type="submit">
                    Buscar lugares
                  </button>
                </form>

                <p className="search-panel__hint">
                  Esta búsqueda es una vista previa. Más adelante conectaremos estos datos con nuestra base de venues.
                </p>
              </div>
            </div>
          </section>

          {/* LUGARES / VENUES (REAL DESDE BACKEND) */}
          <section className="venues">
            <div className="container">
              <header className="venues__header">
                <div>
                  <h2 className="venues__title">Lugares para realizar tu sueño</h2>
                  <p className="venues__subtitle">
                    Aquí solo aparecen proveedores aprobados y publicados por Kelom.
                  </p>
                </div>
              </header>

              {providersError && (
                <p style={{ marginTop: "0.8rem" }}>
                  {providersError}
                </p>
              )}

              {providersLoading ? (
                <p style={{ marginTop: "0.8rem" }}>Cargando proveedores…</p>
              ) : providers.length === 0 ? (
                <p style={{ marginTop: "0.8rem" }}>
                  Aún no hay proveedores publicados. Vuelve pronto.
                </p>
              ) : (
                <div className="venues__grid">
                  {providers.map((p) => {
                    const id = p.user_id;
                    const name = p.venue_name || p.company_name || "Proveedor";
                    const location = p.venue_location || "Ubicación por definir";
                    const image = toAbsoluteApiUrl(p.main_photo_url) ||
                      "https://images.pexels.com/photos/3951852/pexels-photo-3951852.jpeg?auto=compress&cs=tinysrgb&w=800";

                    return (
                      <article key={id} className="venue-card">
                        <div className="venue-card__image-wrap">
                          <img className="venue-card__image" src={image} alt={name} />
                        </div>

                        <div className="venue-card__body">
                          <h3 className="venue-card__name">{name}</h3>

                          <div className="venue-card__rating">
                            <span className="venue-card__rating-stars">★</span> Publicado en Kelom
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

          {/* EMPRESAS DESTACADAS (lo dejas igual por ahora) */}
          <section className="featured">
            <div className="container">
              <header className="featured__header">
                <h2 className="featured__title">Empresas destacadas</h2>
                <p className="featured__subtitle">Proveedores clave para completar tu boda ideal.</p>
              </header>

              <div className="featured__grid">
                {featuredCompanies.map((company) => (
                  <article key={company.id} className="featured-card">
                    <img
                      src={company.image}
                      alt={company.name}
                      className="featured-card__image"
                    />
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
            <p className="tips__subtitle">
              Consejos cortos para que disfrutes el proceso, no solo el gran día.
            </p>
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
              <img
                src={tipsImage}
                alt="Pareja organizando su boda con calma"
                className="tips__image"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;