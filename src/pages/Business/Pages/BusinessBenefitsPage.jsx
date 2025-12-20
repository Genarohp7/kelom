// src/pages/BusinessBenefitsPage.jsx
import Kelom from "../../../assets/logo/logoKelom.png";
import { NavLink } from "react-router-dom";

function BusinessBenefitsPage() {
  return (
    <div className="business">
      {/* HEADER IGUAL AL DE BusinessAreaPage */}
      <header className="business__header">
        <div className="business__header-inner container">
          {/* Logo Kelom (vuelve al home principal) */}
          <NavLink to="/" className="header__logo" aria-label="Kelom">
            <img src={Kelom} alt="Logo Kelom" title="Kelom" />
          </NavLink>

        <nav className="business__nav">
            {/* Acceso de empresas -> /empresas */}
            <NavLink
              to="/empresas"
              end
              className={({ isActive }) =>
                "business__nav-link" +
                (isActive ? " business__nav-link_active" : "")
              }
            >
              Acceso de empresas
            </NavLink>

            {/* Beneficios -> /empresas/beneficios */}
            <NavLink
              to="/empresas/beneficios"
              className={({ isActive }) =>
                "business__nav-link" +
                (isActive ? " business__nav-link_active" : "")
              }
            >
              Beneficios
            </NavLink>

            {/* Acceder -> ahora navega al login de proveedores */}
            <NavLink
              to="/empresas/acceso"
              className="business__nav-link business__nav-link_button"
            >
              Acceder
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="page__content">
        <section className="business-benefits">
          {/* HERO */}
          <div className="container business-benefits__hero">
            <div className="business-benefits__hero-main">
              <span className="business-benefits__pill">Beneficios</span>
              <h1 className="business-benefits__title">
                Qué gana tu negocio al estar en una plataforma especializada
              </h1>
              <p className="business-benefits__subtitle">
                Hoy, la mayoría de las personas busca primero en internet antes
                de contratar un proveedor. Tener presencia en una plataforma
                especializada en bodas no es “un extra bonito”: es donde tu
                marca compite de verdad por atención, confianza y reservas.
              </p>

              <ul className="business-benefits__bullets">
                <li>
                  Visibilidad constante frente a parejas que ya están buscando.
                </li>
                <li>Confianza al estar junto a otros proveedores curados.</li>
                <li>
                  Más oportunidades de contacto sin depender solo de redes
                  sociales.
                </li>
                <li>
                  Mejor lectura de tu marca: fotos, reseñas, información clara.
                </li>
              </ul>
            </div>

            <div className="business-benefits__hero-media">
              <div className="business-benefits__hero-image-wrapper">
                <img
                  className="business-benefits__hero-image"
                  src="https://images.pexels.com/photos/3951675/pexels-photo-3951675.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="Equipo revisando métricas de un negocio en computadora"
                  loading="lazy"
                />
              </div>
              <p className="business-benefits__hero-note">
                Las parejas comparan propuestas, leen reseñas y guardan
                favoritos antes de escribirte. Tu presencia en la plataforma es
                tu carta de presentación 24/7.
              </p>
            </div>
          </div>

          {/* STATS / DATOS DUROS */}
          <section className="business-benefits__stats">
            <div className="container business-benefits__stats-grid">
              <article className="business-benefits__stat-card">
                <div className="business-benefits__stat-number">81%</div>
                <div className="business-benefits__stat-label">
                  de las personas investiga negocios en línea antes de comprar
                </div>
                <p className="business-benefits__stat-text">
                  Tu ficha en una plataforma especializada es, muchas veces, el
                  primer contacto real que alguien tiene con tu empresa.
                </p>
              </article>

              <article className="business-benefits__stat-card">
                <div className="business-benefits__stat-number">+Visibilidad</div>
                <div className="business-benefits__stat-label">
                  Apariciones frente a parejas que ya están planeando su boda
                </div>
                <p className="business-benefits__stat-text">
                  No es “salir en internet en general”, es estar justo en el
                  pasillo donde la gente ya está comparando venues y
                  proveedores.
                </p>
              </article>

              <article className="business-benefits__stat-card">
                <div className="business-benefits__stat-number">+Confianza</div>
                <div className="business-benefits__stat-label">
                  Reputación construida con reseñas y contenido consistente
                </div>
                <p className="business-benefits__stat-text">
                  Las parejas confían más en negocios que pueden investigar, ver
                  en acción y leer opiniones de otras personas.
                </p>
              </article>
            </div>
          </section>

          {/* COMPARACIÓN: CON / SIN PLATAFORMA */}
          <section className="business-benefits__comparison">
            <div className="container business-benefits__comparison-grid">
              <article className="business-benefits__comparison-card">
                <h2 className="business-benefits__comparison-title">
                  Sin una plataforma especializada
                </h2>
                <ul className="business-benefits__comparison-list">
                  <li>
                    Dependes casi por completo de recomendaciones boca a boca.
                  </li>
                  <li>
                    Tu Instagram compite con memes, reels y contenido random.
                  </li>
                  <li>
                    Es difícil medir cuántas parejas te están viendo realmente.
                  </li>
                  <li>
                    Si no publicas seguido, pareciera que tu negocio está
                    inactivo.
                  </li>
                </ul>
              </article>

              <article className="business-benefits__comparison-card business-benefits__comparison-card--highlight">
                <h2 className="business-benefits__comparison-title">
                  Con una plataforma enfocada en bodas
                </h2>
                <ul className="business-benefits__comparison-list">
                  <li>
                    Apareces donde la gente entra específicamente a buscar
                    bodas.
                  </li>
                  <li>
                    Tu ficha concentra fotos, descripción, servicios y formas de
                    contacto.
                  </li>
                  <li>
                    Puedes complementar tu web y tus redes, no sustituirlas:
                    todo suma al mismo objetivo.
                  </li>
                  <li>
                    Tus esfuerzos de marketing tienen un lugar claro hacia donde
                    dirigir a las parejas.
                  </li>
                </ul>
              </article>
            </div>
          </section>

          {/* TESTIMONIOS / CASOS TIPO */}
          <section className="business-benefits__testimonials">
            <div className="container">
              <h2 className="business-benefits__section-title">
                Cómo se ve esto en la vida real
              </h2>
              <p className="business-benefits__section-subtitle">
                Historias típicas de negocios que se apoyan en una plataforma
                especializada en lugar de depender solo de redes.
              </p>

              <div className="business-benefits__testimonials-grid">
                <article className="business-benefits__testimonial">
                  <p className="business-benefits__testimonial-text">
                    “La mayoría de las parejas ya llega diciendo que nos vio en
                    una plataforma de bodas. Ahí revisaron fotos, reseñas y
                    luego brincaron a nuestro Instagram solo para confirmar.”
                  </p>
                  <div className="business-benefits__testimonial-meta">
                    <span className="business-benefits__testimonial-name">
                      Dueña de salón para eventos
                    </span>
                    <span className="business-benefits__testimonial-tag">
                      Eventos de 150 a 300 invitados
                    </span>
                  </div>
                </article>

                <article className="business-benefits__testimonial">
                  <p className="business-benefits__testimonial-text">
                    “Antes nos escribían muy desorganizados. Ahora, como llegan
                    desde una ficha con información clara, preguntan cosas mucho
                    más específicas y ya traen una idea del presupuesto.”
                  </p>
                  <div className="business-benefits__testimonial-meta">
                    <span className="business-benefits__testimonial-name">
                      Coordinadora de bodas
                    </span>
                    <span className="business-benefits__testimonial-tag">
                      Servicio integral de planeación
                    </span>
                  </div>
                </article>

                <article className="business-benefits__testimonial">
                  <p className="business-benefits__testimonial-text">
                    “Nuestra temporada baja se movió gracias a tener más
                    visibilidad. No llenamos todo, pero sí evitamos tener meses
                    completamente vacíos.”
                  </p>
                  <div className="business-benefits__testimonial-meta">
                    <span className="business-benefits__testimonial-name">
                      Empresa de banquetes
                    </span>
                    <span className="business-benefits__testimonial-tag">
                      Especializados en bodas civiles y religiosas
                    </span>
                  </div>
                </article>
              </div>
            </div>
          </section>

          {/* CTA FINAL: INTERÉS / LISTA DE ESPERA */}
          <section
            id="acceder"
            className="business-benefits__cta"
          >
            <div className="container business-benefits__cta-inner">
              <div className="business-benefits__cta-text">
                <h2 className="business-benefits__cta-title">
                  ¿Te gustaría tener a tu negocio en un lugar donde ya hay
                  parejas buscando?
                </h2>
                <p className="business-benefits__cta-subtitle">
                  Estamos construyendo una plataforma pensada para venues y
                  empresas que se toman en serio el servicio. Puedes dejar tu
                  correo y te avisamos cuando abramos el registro.
                </p>
              </div>
              <form className="business-benefits__cta-form">
                <input
                  type="email"
                  className="business-benefits__cta-input"
                  placeholder="Correo de tu negocio"
                />
                <button
                  type="button"
                  className="business-benefits__cta-button"
                >
                  Quiero estar cuando abran
                </button>
              </form>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

export default BusinessBenefitsPage;
