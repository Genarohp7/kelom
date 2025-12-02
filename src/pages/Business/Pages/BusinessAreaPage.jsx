// src/pages/BusinessAreaPage.jsx
import "../../../../Blocks/Business/BusinessAreaPage.css";
import Kelom from "../../../assets/logo/logoKelom.png";
import { NavLink } from "react-router-dom";


function BusinessAreaPage() {
  return (
    <div className="business">
      {/* HEADER ESPECIAL PARA EMPRESAS */}
      <header className="business__header">
        <div className="business__header-inner container">
          {/* Aquí puedes reutilizar tu logo real (luego si quieres cambias por <img> */}
         <NavLink to="/" className="header__logo" aria-label="Kelom">
            <img src={Kelom} alt="Logo Kelom" title="Kelom" />
          </NavLink>

          <nav className="business__nav">
            <a
              href="#acceso"
              className="business__nav-link business__nav-link_active"
            >
              Acceso de empresas
            </a>
            <a href="#beneficios" className="business__nav-link">
              Beneficios
            </a>
            <a
              href="#acceder"
              className="business__nav-link business__nav-link_button"
            >
              Acceder
            </a>
          </nav>
        </div>
      </header>

      {/* CUERPO DE LA PÁGINA DE EMPRESAS */}
      <div className="business__body">
        {/* SECCIÓN ACCESO DE EMPRESAS */}
        <section id="acceso" className="business__hero">
          <div className="container business__hero-grid">
            <div className="business__hero-text">
              <p className="business__pill">Área para proveedores</p>

              <h1 className="business__title">
                Tu negocio de bodas, en el lugar donde las parejas ya están
                buscando.
              </h1>

              <p className="business__subtitle">
                Con Kelom conectas con novi@s reales, no solo con visitas
                anónimas. Te ayudamos a estar presente justo en el momento en
                que se toman decisiones importantes.
              </p>

              <div className="business__benefits-grid">
                <article className="business-card">
                  <span
                    className="business-card__icon"
                    aria-hidden="true"
                  >
                    🌐
                  </span>
                  <h3 className="business-card__title">Visibilidad en la web</h3>
                  <p className="business-card__text">
                    Tu negocio aparece en una plataforma especializada en
                    eventos, justo cuando las parejas están planeando su boda.
                    No es “una página más”, es una vitrina pensada para ti.
                  </p>
                </article>

                <article className="business-card">
                  <span
                    className="business-card__icon"
                    aria-hidden="true"
                  >
                    💌
                  </span>
                  <h3 className="business-card__title">Contacto con novi@s</h3>
                  <p className="business-card__text">
                    Recibe teléfonos, correos e información clave del evento de
                    personas interesadas en tus servicios para dar seguimiento
                    directo y cerrar más contratos.
                  </p>
                </article>

                <article className="business-card">
                  <span
                    className="business-card__icon"
                    aria-hidden="true"
                  >
                    📈
                  </span>
                  <h3 className="business-card__title">Generas más</h3>
                  <p className="business-card__text">
                    Igual que un anuncio en televisión o radio pone tu negocio
                    frente a más personas, estar en Kelom te coloca frente a
                    parejas que ya están listas para contratar, no solo a
                    curiosos.
                  </p>
                </article>

                <article className="business-card">
                  <span
                    className="business-card__icon"
                    aria-hidden="true"
                  >
                    🤝
                  </span>
                  <h3 className="business-card__title">
                    Acompañamiento personal
                  </h3>
                  <p className="business-card__text">
                    No solo llenas un formulario. Te ayudamos a presentar mejor
                    tu negocio y a entender qué buscan las parejas, para que tu
                    oferta sea clara, atractiva y más precisa.
                  </p>
                </article>
              </div>
            </div>

            <div className="business__hero-side">
              {/* Imagen principal + favicon */}
              <figure className="business__hero-figure">
                <div className="business__hero-photo-wrap">
                  {/* Puedes cambiar esta URL por una imagen local cuando quieras */}
                  <img
                    src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Proveedor de eventos gestionando su negocio en línea"
                    className="business__hero-photo"
                  />
                  {/* Favicon de Kelom superpuesto */}
                  <img
                    src="/favicon.svg"
                    alt="Ícono Kelom"
                    className="business__hero-favicon"
                  />
                </div>
                <figcaption className="business__hero-caption">
                  <p className="business__hero-caption-title">
                    Tu vitrina digital
                  </p>
                  <p className="business__hero-caption-text">
                    Muestra tu marca, tus fotos y tus mejores eventos en un
                    espacio diseñado para conquistar a las parejas desde el
                    primer clic.
                  </p>
                </figcaption>
              </figure>

              <div className="business-highlight">
                <p className="business-highlight__eyebrow">
                  Pensado para proveedores
                </p>
                <p className="business-highlight__text">
                  Mientras tú organizas eventos increíbles, nosotros trabajamos
                  para que más parejas te encuentren y te tengan en su lista
                  corta de opciones.
                </p>
                <ul className="business-highlight__list">
                  <li>Presencia constante en la web.</li>
                  <li>Consultas filtradas por tipo de evento.</li>
                  <li>Acompañamiento cercano de nuestro equipo.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN BENEFICIOS / ESTADÍSTICAS */}
        <section id="beneficios" className="business__stats">
          <div className="container">
            <h2 className="business__section-title">
              Por qué tu negocio necesita estar en línea
            </h2>
            <p className="business__section-subtitle">
              Hoy las parejas comparan, piden cotizaciones y eligen proveedores
              desde su celular. Si tu negocio no aparece ahí, para ellas casi no
              existe.
            </p>

            <div className="business__stats-grid">
              <article className="stat-card">
                <div className="stat-card__icon" aria-hidden="true">
                  📊
                </div>
                <p className="stat-card__number">+X</p>
                <p className="stat-card__label">veces más oportunidades</p>
                <p className="stat-card__text">
                  Estar en una plataforma especializada multiplica tus
                  posibilidades de recibir mensajes, cotizaciones y visitas a
                  tus redes.
                </p>
              </article>

              <article className="stat-card">
                <div className="stat-card__icon" aria-hidden="true">
                  ⏰
                </div>
                <p className="stat-card__number">24/7</p>
                <p className="stat-card__label">vitrina digital</p>
                <p className="stat-card__text">
                  Tu negocio está visible todos los días, a cualquier hora, aun
                  cuando tú no estés contestando el teléfono o WhatsApp.
                </p>
              </article>

              <article className="stat-card">
                <div className="stat-card__icon" aria-hidden="true">
                  🚫
                </div>
                <p className="stat-card__number">0</p>
                <p className="stat-card__label">visibilidad sin presencia web</p>
                <p className="stat-card__text">
                  No estar dado de alta en la web significa que muchas parejas
                  jamás sabrán que existes, aunque estés a unas cuadras del
                  lugar de su evento.
                </p>
              </article>
            </div>

            <div className="business__responsibility">
              <h3 className="business__responsibility-title">
                Nuestra responsabilidad con tu negocio
              </h3>
              <p className="business__responsibility-text">
                En Kelom no solo abrimos un directorio. Nuestro compromiso es
                hacer publicidad efectiva para atraer a las personas correctas:
                parejas que realmente están planeando su boda. Cuidamos la
                calidad de la información, revisamos los registros y optimizamos
                la forma en la que mostramos cada negocio para que tu presencia
                digital tenga sentido y resultados.
              </p>
            </div>
          </div>
        </section>

        {/* CTA / ACCEDER */}
        <section id="acceder" className="business__cta">
          <div className="container business__cta-inner">
            <div className="business__cta-text">
              <h2 className="business__cta-title">
                ¿Listo para que más parejas conozcan tu negocio?
              </h2>
              <p className="business__cta-subtitle">
                Registra tu empresa en Kelom y forma parte de una comunidad de
                proveedores seleccionados, con un acompañamiento cercano y un
                enfoque real en resultados.
              </p>
            </div>

            <button className="business__cta-button">
              Registrar mi negocio
            </button>
          </div>
        </section>
      </div>

      {/* FOOTER SOLO CON REDES */}
      <footer className="business__footer">
        <div className="container business__footer-inner">
          <p className="business__footer-text">Síguenos</p>
          <div className="business__social">
            <a href="#" className="business__social-link">
              Facebook
            </a>
            <a href="#" className="business__social-link">
              Instagram
            </a>
            <a href="#" className="business__social-link">
              WhatsApp
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default BusinessAreaPage;