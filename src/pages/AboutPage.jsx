import { NavLink } from "react-router-dom";
import aboutHeroImage from "../assets/web/pages/nosotros/nosotros-1.png";
import aboutBandImage from "../assets/web/pages/nosotros/nosotros-2.png";

function NosotrosPage() {
  return (
    <main className="page__content">
      <section className="about">
        {/* HERO: TEXTO + FOTO */}
        <div className="container about__hero">
          <div className="about__hero-text">
            <span className="about__badge">Nosotros</span>
            <h1 className="about__title">
              Ayudamos a parejas a organizar su boda con más claridad
            </h1>
            <p className="about__subtitle">
              Kelom nace para hacer más simple ese proceso que debería sentirse
              emocionante, pero muchas veces se vuelve abrumador: planear tu
              boda. Queremos que pases menos tiempo comparando opciones y más
              tiempo disfrutando tu compromiso.
            </p>
            <p className="about__paragraph">
              Somos una plataforma pensada para parejas que buscan orientación,
              proveedores para boda y opciones alineadas con su estilo,
              presupuesto y momento de vida. Nuestro objetivo es ayudarte a
              tomar mejores decisiones para tu evento.
            </p>
          </div>

          <div className="about__hero-media">
            <div className="about__hero-image-wrapper">
              <img
                className="about__hero-image"
                src={aboutHeroImage}
                alt="Pareja organizando su boda con apoyo y orientación"
                loading="lazy"
              />
            </div>
            <p className="about__hero-note">
              Nos enfocamos especialmente en parejas de CDMX, Estado de México
              y alrededores, con un enfoque cercano, práctico y sin presiones.
            </p>
          </div>
        </div>

        {/* STRIP DE DATOS RÁPIDOS */}
        {/* <section className="about__strip">
          <div className="container about__strip-inner">
            <div className="about__strip-item">
              <span className="about__strip-number">+5</span>
              <span className="about__strip-label">años soñando bodas</span>
            </div>
            <div className="about__strip-item">
              <span className="about__strip-number">+120</span>
              <span className="about__strip-label">parejas acompañadas</span>
            </div>
            <div className="about__strip-item">
              <span className="about__strip-number">+50</span>
              <span className="about__strip-label">proveedores aliados</span>
            </div>
          </div>
        </section> */}

        {/* MISION / VISION / COMO TRABAJAMOS */}
        <section className="about__sections">
          <div className="container about__sections-grid">
            <article className="about__card">
              <h2 className="about__card-title">Nuestra misión</h2>
              <p className="about__card-text">
                Acompañar a las parejas en su camino hacia el “sí”,
                ayudándoles a encontrar lugares, servicios y proveedores que
                encajen con su presupuesto, su estilo y su historia. Queremos
                que la planeación se sienta guiada, no caótica.
              </p>
            </article>

            <article className="about__card">
              <h2 className="about__card-title">Nuestra visión</h2>
              <p className="about__card-text">
                Ser una plataforma confiable para quienes empiezan a organizar
                su boda en México: cercana, clara y útil. Un espacio donde
                encuentres inspiración, información práctica y opciones
                aterrizadas a tu realidad.
              </p>
            </article>

            <article className="about__card">
              <h2 className="about__card-title">Cómo trabajamos</h2>
              <p className="about__card-text">
                Incorporamos progresivamente venues y empresas que pueden
                aportar valor a las parejas. Nuestro foco está en la claridad de
                la información, la experiencia real del usuario y el trato
                humano, no solo en una foto bonita.
              </p>
            </article>
          </div>
        </section>

        {/* FOTO ANCHA / AMBIENTE */}
        <section className="about__image-band">
          <div className="container">
            <div className="about__image-band-inner">
              <img
                className="about__image-band-photo"
                src={aboutBandImage}
                alt="Boda en un venue iluminado con ambiente cálido"
                loading="lazy"
              />
              <div className="about__image-band-overlay">
                <div className="about__image-band-text">
                  Queremos que tu boda se sienta como ustedes, no como un
                  evento genérico más.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VALORES */}
        <section className="about__values">
          <div className="container">
            <h2 className="about__section-title">Lo que nos mueve</h2>
            <p className="about__section-subtitle">
              No solo son bodas; son decisiones importantes, emociones reales y
              momentos que merecen vivirse con claridad.
            </p>
            <div className="about__values-list">
              <span className="about__value-pill">Empatía y escucha real</span>
              <span className="about__value-pill">Transparencia en la información</span>
              <span className="about__value-pill">Trato humano, cero juicio</span>
              <span className="about__value-pill">Amor por los detalles</span>
              <span className="about__value-pill">Respeto por tu presupuesto</span>
            </div>
          </div>
        </section>

        {/* BLOQUE DE CONTACTO / NEWSLETTER (MISMO CONCEPTO QUE EN BLOG) */}
        <section className="about__newsletter">
          <div className="container newsletter">
            <div className="newsletter__text">
              <div className="newsletter__title">
                ¿Quieres empezar a planear tu boda con más claridad?
              </div>
              <div className="newsletter__sub">
                Regístrate en Kelom y recibe orientación, contenido útil y
                acceso progresivo a proveedores para boda.
              </div>
            </div>
            <form className="newsletter__form">
              <input
                type="email"
                className="newsletter__input"
                placeholder="Tu correo electrónico"
              />
              <NavLink
                to="/registro"
                className="header__btn header__btn--outline"
              >
                Registrarme sin costo
              </NavLink>
            </form>
          </div>
        </section>
      </section>
    </main>
  );
}

export default NosotrosPage;