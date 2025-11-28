function NosotrosPage() {
  return (
    <main className="page__content">
      <section className="about">
        {/* HERO: TEXTO + FOTO */}
        <div className="container about__hero">
          <div className="about__hero-text">
            <span className="about__badge">Nosotros</span>
            <h1 className="about__title">Detrás de Kelom hay amor por las historias reales</h1>
            <p className="about__subtitle">
              Kelom nace para hacer más fácil ese proceso que debería ser bonito,
              pero muchas veces se vuelve abrumador: organizar tu boda. Queremos
              que pases menos tiempo comparando cientos de opciones y más tiempo
              disfrutando tu compromiso.
            </p>
            <p className="about__paragraph">
              Somos una plataforma pensada para parejas que buscan proveedores
              confiables, transparentes y alineados con su estilo. No vendemos
              humo: conectamos personas reales con lugares y servicios que
              realmente pueden hacer realidad su idea de “día perfecto”.
            </p>
          </div>

          <div className="about__hero-media">
            <div className="about__hero-image-wrapper">
              <img
                className="about__hero-image"
                src="https://images.pexels.com/photos/3951628/pexels-photo-3951628.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Equipo organizando detalles de una boda"
                loading="lazy"
              />
            </div>
            <p className="about__hero-note">
              Nos enfocamos especialmente en parejas de CDMX y alrededores,
              con un enfoque cercano, empático y sin presiones.
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
                ayudándoles a encontrar lugares y proveedores que encajen
                con su presupuesto, su estilo y su historia. Queremos que la
                planeación se sienta guiada, no caótica.
              </p>
            </article>

            <article className="about__card">
              <h2 className="about__card-title">Nuestra visión</h2>
              <p className="about__card-text">
                Ser la primera plataforma en la que pienses cuando empieces a
                organizar tu boda: cercana, confiable y honesta. Un espacio
                donde encuentres inspiración, información clara y opciones
                aterrizadas a tu realidad.
              </p>
            </article>

            <article className="about__card">
              <h2 className="about__card-title">Cómo trabajamos</h2>
              <p className="about__card-text">
                Seleccionamos cuidadosamente los venues y empresas que
                aparecen en Kelom. Nuestro foco está en la experiencia real de las
                parejas, la calidad del servicio y el trato humano, no solo en las fotos bonitas.
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
                src="https://images.pexels.com/photos/3951627/pexels-photo-3951627.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Pareja celebrando en un venue iluminado"
                loading="lazy"
              />
              <div className="about__image-band-overlay">
                <div className="about__image-band-text">
                  Queremos que tu boda se sienta como tú,
                  no como un evento genérico más.
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
              No solo son bodas; son capítulos importantes en la vida de las personas.
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
                ¿Quieres recibir tips y recomendaciones de proveedores?
              </div>
              <div className="newsletter__sub">
                Déjanos tu correo y te enviaremos solo contenido útil para
                planear tu boda con calma, sin spam.
              </div>
            </div>
            <form className="newsletter__form">
              <input
                type="email"
                className="newsletter__input"
                placeholder="Tu correo electrónico"
              />
              <button type="button" className="newsletter__button">
                Mantenerme al día
              </button>
            </form>
          </div>
        </section>
      </section>
    </main>
  );
}

export default NosotrosPage;
