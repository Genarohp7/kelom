// src/pages/VenueDetailPage.jsx
import "../../Blocks/venues/VenueDetailPage.css";
import { useParams, Link } from "react-router-dom";

// Datos estáticos por ahora (mismo concepto que usamos antes)
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
    gallery: [
      "https://images.pexels.com/photos/3951851/pexels-photo-3951851.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/169211/pexels-photo-169211.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/169190/pexels-photo-169190.jpeg?auto=compress&cs=tinysrgb&w=1200",
    ],
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
    opinions: [
      {
        id: 1,
        couple: "Ana & Luis",
        text:
          "Nos encantó que pudimos hacer la ceremonia ahí mismo y luego pasar directo a la recepción sin mover a los invitados.",
        rating: 4.5,
      },
      {
        id: 2,
        couple: "María & Jorge",
        text:
          "El jardín de noche con luces y bugambilias se ve increíble en las fotos.",
        rating: 4.3,
      },
    ],
  },
  {
    id: 2,
    name: "Casa Vintage",
    location: "Coyoacán, Ciudad de México",
    rating: 4.2,
    reviews: 45,
    ranking: "Lugar destacado en bodas íntimas",
    mainImage:
      "https://images.pexels.com/photos/3887985/pexels-photo-3887985.jpeg?auto=compress&cs=tinysrgb&w=1200",
    gallery: [
      "https://images.pexels.com/photos/3951678/pexels-photo-3951678.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/3894274/pexels-photo-3894274.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/3888041/pexels-photo-3888041.jpeg?auto=compress&cs=tinysrgb&w=1200",
    ],
    capacity: "60 – 120 invitados",
    priceRange: "$$ · Boda íntima",
    eventTypes: ["Boda civil", "Coctel", "Comida formal"],
    shortDescription:
      "Casa de estilo vintage en el corazón de Coyoacán, pensada para bodas íntimas con mucha personalidad.",
    sellingPoints: [
      "Ambientes interiores cálidos",
      "Decoración vintage incluida",
      "Zona muy fotogénica alrededor",
    ],
    mapText: "A unas cuadras del centro de Coyoacán.",
    opinions: [
      {
        id: 1,
        couple: "Sandra & Pablo",
        text:
          "La casa tiene tanto carácter que casi no tuvimos que decorar. Todo se sentía muy acogedor.",
        rating: 4.4,
      },
    ],
  },
  {
    id: 3,
    name: "Terraza Aurora",
    location: "Álvaro Obregón, Ciudad de México",
    rating: 4.6,
    reviews: 63,
    ranking: "Muy recomendada para atardeceres",
    mainImage:
      "https://images.pexels.com/photos/169211/pexels-photo-169211.jpeg?auto=compress&cs=tinysrgb&w=1200",
    gallery: [
      "https://images.pexels.com/photos/2306280/pexels-photo-2306280.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/2306281/pexels-photo-2306281.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/2306282/pexels-photo-2306282.jpeg?auto=compress&cs=tinysrgb&w=1200",
    ],
    capacity: "80 – 200 invitados",
    priceRange: "$$ – $$$",
    eventTypes: ["Boda civil", "Recepción con vista", "Coctel al atardecer"],
    shortDescription:
      "Terraza con vista urbana, ideal para parejas que quieren una boda moderna con atardeceres espectaculares.",
    sellingPoints: [
      "Vistas panorámicas de la ciudad",
      "Iluminación ambiental incluida",
      "Ideal para bodas de tarde-noche",
    ],
    mapText: "Zona poniente de CDMX, con fácil acceso por vías principales.",
    opinions: [
      {
        id: 1,
        couple: "Carla & Fernando",
        text:
          "El atardecer desde la terraza hizo que las fotos parecieran de revista.",
        rating: 4.7,
      },
    ],
  },
  {
    id: 4,
    name: "Hacienda La Noria",
    location: "Estado de México",
    rating: 4.8,
    reviews: 102,
    ranking: "De las favoritas en haciendas",
    mainImage:
      "https://images.pexels.com/photos/2306281/pexels-photo-2306281.jpeg?auto=compress&cs=tinysrgb&w=1200",
    gallery: [
      "https://images.pexels.com/photos/2306279/pexels-photo-2306279.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/2306280/pexels-photo-2306280.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/2306282/pexels-photo-2306282.jpeg?auto=compress&cs=tinysrgb&w=1200",
    ],
    capacity: "150 – 350 invitados",
    priceRange: "$$$",
    eventTypes: ["Boda religiosa", "Boda civil", "Recepción completa"],
    shortDescription:
      "Hacienda con arquitectura tradicional y amplios jardines, perfecta para bodas grandes con aire clásico.",
    sellingPoints: [
      "Capilla dentro de la hacienda",
      "Amplios jardines y patios",
      "Espacios para sesiones de fotos",
    ],
    mapText: "En las afueras del Estado de México, con estacionamiento amplio.",
    opinions: [
      {
        id: 1,
        couple: "Patricia & Miguel",
        text:
          "Tener la capilla en la misma hacienda nos simplificó toda la logística.",
        rating: 4.9,
      },
    ],
  },
  {
    id: 5,
    name: "Jardín Encanto",
    location: "Xochimilco, Ciudad de México",
    rating: 4.5,
    reviews: 54,
    ranking: "Excelente opción en Xochimilco",
    mainImage:
      "https://images.pexels.com/photos/2291582/pexels-photo-2291582.jpeg?auto=compress&cs=tinysrgb&w=1200",
    gallery: [
      "https://images.pexels.com/photos/2291593/pexels-photo-2291593.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/2291591/pexels-photo-2291591.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/2291590/pexels-photo-2291590.jpeg?auto=compress&cs=tinysrgb&w=1200",
    ],
    capacity: "100 – 220 invitados",
    priceRange: "$$",
    eventTypes: ["Boda civil", "Recepción en jardín"],
    shortDescription:
      "Jardín acogedor con áreas verdes y toques florales, ideal para bodas relajadas pero bien cuidadas.",
    sellingPoints: [
      "Decoración floral incluida",
      "Opciones de menú tradicional",
      "Zona tranquila y con ambiente natural",
    ],
    mapText: "Ubicado en Xochimilco, alejado del ruido principal.",
    opinions: [
      {
        id: 1,
        couple: "Laura & Diego",
        text:
          "Buscar un jardín en la ciudad no fue fácil, pero aquí encontramos justo el ambiente que queríamos.",
        rating: 4.6,
      },
    ],
  },
  {
    id: 6,
    name: "Salón Cielo Rosa",
    location: "Benito Juárez, Ciudad de México",
    rating: 4.1,
    reviews: 37,
    ranking: "Buena relación calidad-precio",
    mainImage:
      "https://images.pexels.com/photos/2306280/pexels-photo-2306280.jpeg?auto=compress&cs=tinysrgb&w=1200",
    gallery: [
      "https://images.pexels.com/photos/2306278/pexels-photo-2306278.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/2306277/pexels-photo-2306277.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/2306276/pexels-photo-2306276.jpeg?auto=compress&cs=tinysrgb&w=1200",
    ],
    capacity: "80 – 180 invitados",
    priceRange: "$$",
    eventTypes: ["Recepción en salón", "Bodas civiles"],
    shortDescription:
      "Salón versátil con iluminación adaptable y pista de baile amplia.",
    sellingPoints: [
      "Paquetes con música incluida",
      "Ubicación céntrica",
      "Opciones de decoración temática",
    ],
    mapText: "Zona central de CDMX con acceso en transporte público.",
    opinions: [
      {
        id: 1,
        couple: "Gaby & Tomás",
        text:
          "Nos gustó que los invitados no tuvieran que viajar tanto; la ubicación es muy cómoda.",
        rating: 4.1,
      },
    ],
  },
  {
    id: 7,
    name: "Casa del Lago",
    location: "Cuauhtémoc, Ciudad de México",
    rating: 4.7,
    reviews: 88,
    ranking: "Muy popular en bodas elegantes",
    mainImage:
      "https://images.pexels.com/photos/60217/pexels-photo-60217.jpeg?auto=compress&cs=tinysrgb&w=1200",
    gallery: [
      "https://images.pexels.com/photos/60218/pexels-photo-60218.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/60219/pexels-photo-60219.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/60220/pexels-photo-60220.jpeg?auto=compress&cs=tinysrgb&w=1200",
    ],
    capacity: "120 – 260 invitados",
    priceRange: "$$$",
    eventTypes: ["Bodas elegantes", "Cocteles formales"],
    shortDescription:
      "Espacio frente al lago con ambientes interiores refinados, pensado para bodas con aire muy clásico.",
    sellingPoints: [
      "Ambiente elegante y sobrio",
      "Opciones de menú gourmet",
      "Escenarios muy fotogénicos",
    ],
    mapText: "Zona céntrica, perfecta para invitados que vienen de distintos puntos.",
    opinions: [
      {
        id: 1,
        couple: "Mónica & Andrés",
        text:
          "El lugar se ve impresionante en persona, las fotos no le hacen justicia.",
        rating: 4.8,
      },
    ],
  },
  {
    id: 8,
    name: "Terraza Lumen",
    location: "Naucalpan, Estado de México",
    rating: 4.4,
    reviews: 51,
    ranking: "Muy buena opción en terraza",
    mainImage:
      "https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=1200",
    gallery: [
      "https://images.pexels.com/photos/169187/pexels-photo-169187.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/169186/pexels-photo-169186.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/169185/pexels-photo-169185.jpeg?auto=compress&cs=tinysrgb&w=1200",
    ],
    capacity: "90 – 200 invitados",
    priceRange: "$$ – $$$",
    eventTypes: ["Recepción en terraza", "Coctel nocturno"],
    shortDescription:
      "Terraza moderna con iluminación y vista urbana, perfecta para bodas relajadas pero con estilo.",
    sellingPoints: [
      "Instalaciones modernas",
      "Iluminación decorativa incluida",
      "Ideal para bodas de noche",
    ],
    mapText: "Ubicada en Naucalpan, con acceso por vías principales.",
    opinions: [
      {
        id: 1,
        couple: "Rocío & Daniel",
        text:
          "Queríamos algo moderno pero sin salirnos del presupuesto, y aquí lo encontramos.",
        rating: 4.4,
      },
    ],
  },
];

function VenueDetailPage() {
  const { id } = useParams();
  const venue = venuesDetail.find((item) => String(item.id) === id);

  if (!venue) {
    return (
      <div className="venue-page">
        <section className="venue-not-found">
          <div className="container">
            <h1>Proveedor no encontrado</h1>
            <p>
              Es posible que este venue ya no esté disponible o que el enlace
              sea incorrecto.
            </p>
            <Link to="/" className="venue-not-found__back-link">
              ← Volver a la lista de lugares
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const opinionsAverage =
    venue.opinions && venue.opinions.length
      ? venue.opinions.reduce((sum, op) => sum + op.rating, 0) /
        venue.opinions.length
      : venue.rating;

  return (
    <div className="venue-page">
      {/* HERO DEL LUGAR */}
      <section className="venue-hero">
        <div className="container venue-hero__grid">
          <div className="venue-hero__info">
            <Link to="/" className="venue-hero__back-link">
              ← Volver a la lista de lugares
            </Link>

            <span className="venue-hero__pill">Lugar para boda</span>

            <h1 className="venue-hero__name">{venue.name}</h1>

            <p className="venue-hero__location">{venue.location}</p>

            <div className="venue-hero__rating">
              <span className="venue-hero__stars">★★★★★</span>
              <span className="venue-hero__rating-score">
                {venue.rating.toFixed(1)}
              </span>
              <span className="venue-hero__rating-count">
                ({venue.reviews} opiniones)
              </span>
              {venue.ranking && (
                <span className="venue-hero__ranking">{venue.ranking}</span>
              )}
            </div>

            <p className="venue-hero__lead">{venue.shortDescription}</p>

            <ul className="venue-hero__highlights">
              <li>{venue.capacity}</li>
              <li>{venue.priceRange}</li>
              {venue.eventTypes.slice(0, 2).map((type) => (
                <li key={type}>{type}</li>
              ))}
            </ul>

            <div className="venue-hero__ctas">
              <button type="button" className="btn btn--primary" disabled>
                Pedir cotización (próximamente)
              </button>
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
            </div>
          </div>

          <div className="venue-hero__media">
            <img
              src={venue.mainImage}
              alt={venue.name}
              className="venue-hero__image"
            />
            {venue.ranking && (
              <div className="venue-hero__badge">{venue.ranking}</div>
            )}
          </div>
        </div>
      </section>

      {/* GALERÍA */}
      <section className="venue-gallery">
        <div className="container">
          <h2 className="section-title">Fotos del lugar</h2>
          <p className="section-subtitle">
            Una vista rápida de cómo se vive una boda en {venue.name}.
          </p>

          <div className="venue-gallery__grid">
            {venue.gallery.map((photo, index) => (
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

      {/* INFO + DETALLES RÁPIDOS */}
      <section className="venue-info">
        <div className="container">
          <div className="venue-info__grid">
            <div className="venue-info__description">
              <h2 className="section-title">Sobre este lugar</h2>
              <p>{venue.shortDescription}</p>
              <p>
                Este texto será rellenado por el proveedor desde su panel:
                estilo de boda, tipo de montajes, servicios incluidos y lo que
                hace especial a {venue.name}.
              </p>

              <div className="venue-info__tags">
                <span className="chip">{venue.capacity}</span>
                <span className="chip">{venue.priceRange}</span>
                {venue.eventTypes.map((type) => (
                  <span key={type} className="chip">
                    {type}
                  </span>
                ))}
              </div>
            </div>

            <aside className="venue-info__sidebar">
              <h3 className="venue-info__sidebar-title">
                Información rápida
              </h3>
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
                  {venue.eventTypes.join(", ")}
                </li>
                <li>
                  <span className="venue-info__label">Rango de precio: </span>
                  {venue.priceRange}
                </li>
                {venue.ranking && (
                  <li>
                    <span className="venue-info__label">Ranking: </span>
                    {venue.ranking}
                  </li>
                )}
              </ul>
            </aside>
          </div>
        </div>
      </section>

      {/* OPINIONES */}
      <section className="venue-reviews">
        <div className="container">
          <div className="venue-reviews__header">
            <div>
              <h2 className="section-title">Opiniones de parejas</h2>
              <p className="section-subtitle">
                Lo que otras parejas han dicho después de casarse en{" "}
                {venue.name}.
              </p>
            </div>
            <div className="venue-reviews__overall">
              <span className="venue-reviews__score">
                {opinionsAverage.toFixed(1)}
              </span>
              <div>
                <div className="venue-reviews__stars">★★★★★</div>
                <div className="venue-reviews__count">
                  Basado en {venue.reviews} opiniones totales.
                </div>
              </div>
            </div>
          </div>

          <div className="venue-reviews__grid">
            {venue.opinions.map((opinion) => (
              <article key={opinion.id} className="venue-review">
                <div className="venue-review__rating">
                  ★★★★★ ({opinion.rating.toFixed(1)})
                </div>
                <p className="venue-review__text">“{opinion.text}”</p>
                <div className="venue-review__meta">
                  <span>{opinion.couple}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* MAPA */}
      <section className="venue-map" id="venue-map">
        <div className="container venue-map__inner">
          <div className="venue-map__info">
            <h2 className="section-title">Ubicación y accesos</h2>
            <p>{venue.mapText}</p>
            <p>
              Más adelante aquí conectaremos el mapa real con Google Maps y las
              indicaciones que el proveedor quiera destacar.
            </p>
            <ul className="venue-map__list">
              <li>Zona: {venue.location}</li>
              <li>Ideal para invitados que vienen de distintos puntos.</li>
            </ul>
          </div>

          <div className="venue-map__frame">
            {/* Placeholder de mapa por ahora */}
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
