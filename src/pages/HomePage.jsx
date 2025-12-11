// src/pages/HomePage.jsx
import "../styles/HomePage.css";
import { Link } from "react-router-dom";

function HomePage() {
  const venues = [
    {
      id: 1,
      name: "Jardín Las Bugambilias",
      location: "Tlalpan, Ciudad de México",
      rating: 4.3,
      reviews: 80,
      image:
        "https://images.pexels.com/photos/3951852/pexels-photo-3951852.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      id: 2,
      name: "Casa Vintage",
      location: "Coyoacán, Ciudad de México",
      rating: 4.2,
      reviews: 45,
      image:
        "https://images.pexels.com/photos/3887985/pexels-photo-3887985.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      id: 3,
      name: "Terraza Aurora",
      location: "Álvaro Obregón, Ciudad de México",
      rating: 4.6,
      reviews: 63,
      image:
        "https://images.pexels.com/photos/169211/pexels-photo-169211.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      id: 4,
      name: "Hacienda La Noria",
      location: "Estado de México",
      rating: 4.8,
      reviews: 102,
      image:
        "https://images.pexels.com/photos/2306281/pexels-photo-2306281.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      id: 5,
      name: "Jardín Encanto",
      location: "Xochimilco, Ciudad de México",
      rating: 4.5,
      reviews: 54,
      image:
        "https://images.pexels.com/photos/2291582/pexels-photo-2291582.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      id: 6,
      name: "Salón Cielo Rosa",
      location: "Benito Juárez, Ciudad de México",
      rating: 4.1,
      reviews: 37,
      image:
        "https://images.pexels.com/photos/2306280/pexels-photo-2306280.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      id: 7,
      name: "Casa del Lago",
      location: "Cuauhtémoc, Ciudad de México",
      rating: 4.7,
      reviews: 88,
      image:
        "https://images.pexels.com/photos/60217/pexels-photo-60217.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      id: 8,
      name: "Terraza Lumen",
      location: "Naucalpan, Estado de México",
      rating: 4.4,
      reviews: 51,
      image:
        "https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
  ];

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
      {/* HERO + BUSCADOR */}
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__eyebrow">Planea tu boda con calma</div>
          <h1 className="hero__title">
            Encuentra el{" "}
            <span className="hero__title-highlight">lugar perfecto</span> para
            decir “sí”.
          </h1>
          <p className="hero__subtitle">
            Jardines, salones, haciendas, banquetes y más. Kelom te ayuda a
            descubrir opciones pensadas para ti, sin perderte entre miles de
            resultados.
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
              Esta búsqueda es una vista previa. Más adelante conectaremos estos
              datos con nuestra base de venues.
            </p>
          </div>
        </div>
      </section>

      {/* TIPS PARA TU BODA */}
      <section className="tips">
        <div className="container">
          <header className="tips__header">
            <h2 className="tips__title">Tips para tu boda</h2>
            <p className="tips__subtitle">
              Consejos cortos para que disfrutes el proceso, no solo el gran
              día.
            </p>
          </header>

          <div className="tips__list">
            <article className="tips-card">
              <h3 className="tips-card__title">Empieza por el presupuesto</h3>
              <p className="tips-card__text">
                Definir un rango claro desde el inicio te ayudará a elegir
                opciones realistas sin renunciar al estilo que quieres.
              </p>
            </article>

            <article className="tips-card">
              <h3 className="tips-card__title">
                Haz una lista de prioridades
              </h3>
              <p className="tips-card__text">
                ¿Es más importante el lugar, la comida o la música? Ponerlo en
                papel facilita las decisiones cuando tengas que elegir.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* LUGARES / VENUES */}
      <section className="venues">
        <div className="container">
          <header className="venues__header">
            <div>
              <h2 className="venues__title">
                Lugares para realizar tu sueño
              </h2>
              <p className="venues__subtitle">
                Explora algunos venues destacados en la ciudad y alrededores.
              </p>
            </div>
          </header>

          <div className="venues__grid">
            {venues.map((venue) => (
              <article key={venue.id} className="venue-card">
                <div className="venue-card__image-wrap">
                  <img
                    className="venue-card__image"
                    src={venue.image}
                    alt={venue.name}
                  />
                </div>

                <div className="venue-card__body">
                  <h3 className="venue-card__name">{venue.name}</h3>

                  <div className="venue-card__rating">
                    <span className="venue-card__rating-stars">★★★★★</span>
                    {venue.rating.toFixed(1)} · {venue.reviews} reseñas
                  </div>

                  <div className="venue-card__location">
                    {venue.location}
                  </div>

                  <Link
                    to={`/proveedores/${venue.id}`}
                    className="venue-card__link"
                  >
                    Ver más detalles
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* EMPRESAS DESTACADAS */}
      <section className="featured">
        <div className="container">
          <header className="featured__header">
            <h2 className="featured__title">Empresas destacadas</h2>
            <p className="featured__subtitle">
              Proveedores clave para completar tu boda ideal.
            </p>
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
                <div className="featured-card__category">
                  {company.category}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
