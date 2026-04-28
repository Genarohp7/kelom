import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import blogHeroImage from "../assets/web/pages/blog/blog-1.png";
import blogFeaturedImage from "../assets/web/pages/blog/blog-2.png";
import blogPostImage1 from "../assets/web/pages/blog/blog-lugares.png";
import blogPostImage2 from "../assets/web/pages/blog/blog-presupuesto.png";
import blogPostImage3 from "../assets/web/pages/blog/blog-banquetes.png";
import blogPostImage4 from "../assets/web/pages/blog/blog-experiencias.png";
import blogPostImage5 from "../assets/web/pages/blog/planeacion.webp";
import blogPostImage6 from "../assets/web/pages/blog/inspiración.webp";
import blogPostImage7 from "../assets/web/pages/blog/atardecer.webp";
import blogPostImage8 from "../assets/web/pages/blog/outfit.webp";
import blogPostImage9 from "../assets/web/pages/blog/vestidos.webp";
import blogPostImage10 from "../assets/web/pages/blog/anillo.webp";
import blogPostImage11 from "../assets/web/pages/blog/puente.webp";
import blogPostImage12 from "../assets/web/pages/blog/pedida.webp";
import blogPostImage13 from "../assets/web/pages/blog/fotografo.webp";
import blogPostImage14 from "../assets/web/pages/blog/banqueteM.webp";
import blogPostImage15 from "../assets/web/pages/blog/ana__luis.webp";
import blogPostImage16 from "../assets/web/pages/blog/presupuesto.webp";

function BlogPage() {
  useEffect(() => {
    const page = document.querySelector(".blog");
    const animatedItems = document.querySelectorAll(
      ".blog__hero, .blog__featured-grid, .blog__explore-grid, .blog__topic-shell, .newsletter--blog"
    );

    if (page) {
      page.classList.add("blog--loaded");
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    animatedItems.forEach((item) => observer.observe(item));

    return () => {
      animatedItems.forEach((item) => observer.unobserve(item));
    };
  }, []);

  const featuredPost = {
    id: "featured-1",
    tag: "Guías de boda",
    title: "Qué definir primero para planear tu boda sin sentirte rebasada",
    excerpt:
      "Antes de hablar de flores, vestidos o playlist, hay tres decisiones que te ayudan a organizar mejor tu boda: presupuesto real, número aproximado de invitados y tipo de evento que sí encaja con ustedes.",
    readTime: "7 min de lectura",
    image: blogFeaturedImage,
    href: "#guias-de-boda",
  };

  const categories = [
    { id: "guias-de-boda", label: "Guías de boda" },
    { id: "ideas-e-inspiracion", label: "Ideas e inspiración" },
    { id: "antes-del-si", label: "Antes del sí" },
    { id: "consejos-de-expertos", label: "Consejos de expertos" },
    { id: "historias-reales", label: "Historias reales" },
  ];

  const categoryHighlights = [
    {
      id: "guias-de-boda",
      tag: "Guías de boda",
      title: "Contenido para organizar tu boda con más claridad",
      excerpt:
        "Artículos pensados para ordenar prioridades, aterrizar ideas y tomar mejores decisiones desde el inicio de la planeación.",
      readTime: "Base editorial",
      image: blogPostImage5,
    },
    {
      id: "ideas-e-inspiracion",
      tag: "Ideas e inspiración",
      title: "Inspiración bonita, realista y fácil de aterrizar",
      excerpt:
        "Ideas visuales y conceptos que puedes adaptar a bodas reales, presupuestos reales y decisiones que sí tengan sentido para ustedes.",
      readTime: "Inspiración aterrizada",
      image: blogPostImage6,
    },
    {
      id: "antes-del-si",
      tag: "Antes del sí",
      title: "La etapa del compromiso también merece guía",
      excerpt:
        "Desde el anillo hasta la propuesta, esta categoría acompaña a quienes empiezan incluso antes de organizar la boda.",
      readTime: "Etapa previa",
      image: blogPostImage2,
    },
    {
      id: "consejos-de-expertos",
      tag: "Consejos de expertos",
      title: "Qué revisar antes de contratar proveedores para boda",
      excerpt:
        "Experiencia útil para evaluar servicios, comparar opciones y tomar decisiones con mejor criterio antes de contratar.",
      readTime: "Experiencia útil",
      image: blogPostImage3,
    },
    {
      id: "historias-reales",
      tag: "Historias reales",
      title: "Parejas reales, aprendizajes reales y decisiones reales",
      excerpt:
        "Historias que ayudan porque cuentan lo que funcionó, lo que ajustarían y cómo vivieron el proceso de organizar su boda.",
      readTime: "Aprendizajes reales",
      image: blogPostImage4,
    },
  ];

  const sections = [
    {
      id: "guias-de-boda",
      title: "Guías de boda",
      subtitle:
        "Para empezar a organizar tu boda con orden, criterio y decisiones más claras desde el primer paso.",
      variant: "split",
      posts: [
        {
          id: 1,
          tag: "Guías de boda",
          title:
            "Cómo elegir el lugar ideal para tu boda sin equivocarte desde el inicio",
          excerpt:
            "Un espacio puede verse espectacular en fotos, pero antes de decidir conviene revisar capacidad, horario, logística, ubicación y presupuesto.",
          readTime: "6 min",
          image: blogPostImage1,
        },
        {
          id: 2,
          tag: "Guías de boda",
          title:
            "Qué definir al inicio para planear tu boda sin parchar todo después",
          excerpt:
            "Presupuesto real, tipo de boda, cantidad estimada de invitados y margen de flexibilidad son decisiones clave para avanzar con más tranquilidad.",
          readTime: "7 min",
          image: blogPostImage7,
        },
      ],
    },
    {
      id: "ideas-e-inspiracion",
      title: "Ideas e inspiración",
      subtitle:
        "Para imaginar una boda bonita, realista y alineada con su presupuesto, estilo de vida y prioridades.",
      variant: "mosaic",
      posts: [
        {
          id: 3,
          tag: "Ideas e inspiración",
          title:
            "Bodas pequeñas pero bien pensadas: ideas que se sienten elegantes",
          excerpt:
            "Una boda íntima no significa una boda simple. Bien planeada, puede sentirse cálida, cuidada y memorable.",
          readTime: "5 min",
          image: blogPostImage8,
        },
        {
          id: 4,
          tag: "Ideas e inspiración",
          title:
            "Tendencias de boda que puedes aterrizar sin romper tu presupuesto",
          excerpt:
            "No todas las tendencias están peleadas con la realidad. Hay ideas actuales y bonitas que pueden adaptarse a distintos estilos de boda.",
          readTime: "5 min",
          image: blogPostImage9,
        },
      ],
    },
    {
      id: "antes-del-si",
      title: "Antes del sí",
      subtitle:
        "Porque muchas historias empiezan antes del tablero de proveedores. Esta etapa también merece guía, ideas y espacio dentro de Kelom.",
      variant: "stagger",
      posts: [
        {
          id: 5,
          tag: "Antes del sí",
          title:
            "Cómo elegir un anillo de compromiso sin comprar a ciegas",
          excerpt:
            "Metal, piedra, estilo, talla, presupuesto y gustos reales de la otra persona. No se trata de comprar el más caro, sino uno que tenga sentido.",
          readTime: "6 min",
          image: blogPostImage10,
        },
        {
          id: 6,
          tag: "Antes del sí",
          title:
            "Ideas reales para pedir matrimonio de forma auténtica",
          excerpt:
            "No todo tiene que ser enorme para ser especial. A veces lo mejor nace de una idea simple, cuidada y muy suya.",
          readTime: "5 min",
          image: blogPostImage11,
        },
        {
          id: 7,
          tag: "Antes del sí",
          title:
            "Qué decir al proponer matrimonio sin sonar como frase de internet",
          excerpt:
            "Hay formas honestas de decir lo importante sin recitar algo que no se siente tuyo. Menos discurso armado, más verdad.",
          readTime: "4 min",
          image: blogPostImage12,
        },
      ],
    },
    {
      id: "consejos-de-expertos",
      title: "Consejos de expertos",
      subtitle:
        "Experiencia práctica para revisar mejor contratos, servicios y detalles que suelen pasarse por alto al contratar proveedores.",
      variant: "editorial",
      posts: [
        {
          id: 8,
          tag: "Consejos de expertos",
          title:
            "Qué revisar antes de contratar fotógrafo para tu boda",
          excerpt:
            "No basta con que el portafolio se vea bonito. Revisa estilo, tiempos de entrega, cobertura, respaldo de archivos y forma de trabajo el día del evento.",
          readTime: "6 min",
          image: blogPostImage13,
        },
        {
          id: 9,
          tag: "Consejos de expertos",
          title:
            "Cómo elegir banquete para boda sin complicarte de más",
          excerpt:
            "Entre gustos, opiniones y dietas especiales, el menú puede volverse complejo. Una guía práctica ayuda a decidir con cabeza fría.",
          readTime: "5 min",
          image: blogPostImage14,
        },
      ],
    },
    {
      id: "historias-reales",
      title: "Historias reales",
      subtitle:
        "Aprendizajes contados desde la experiencia de parejas que ya vivieron la emoción, el estrés, la organización y el día final.",
      variant: "columns",
      posts: [
        {
          id: 10,
          tag: "Historias reales",
          title:
            "La boda de Ana y Luis: lo que harían distinto si empezaran de nuevo",
          excerpt:
            "Ellos lograron una boda muy suya, pero también aprendieron varias cosas a contrarreloj. Su historia deja lecciones útiles para otras parejas.",
          readTime: "6 min",
          image: blogPostImage15,
        },
        {
          id: 11,
          tag: "Historias reales",
          title:
            "Cómo una pareja ordenó su boda cuando el presupuesto se volvió realidad",
          excerpt:
            "Pasar del “queremos algo bonito” al “esto sí lo podemos pagar” cambió su forma de decidir proveedores, invitados y prioridades.",
          readTime: "5 min",
          image: blogPostImage16,
        },
      ],
    },
  ];

  return (
    <main className="page__content">
      <section className="blog">
        <section className="blog__hero-section">
          <div className="container blog__hero blog__reveal">
            <div className="blog__hero-content">
              <span className="blog__badge">Blog Kelom</span>
              <h1 className="blog__title">
                Guías e ideas para planear tu boda con más claridad
              </h1>
              <p className="blog__subtitle">
                Encuentra consejos para organizar tu boda, comparar proveedores,
                cuidar tu presupuesto y tomar decisiones más tranquilas antes de
                contratar servicios para tu evento.
              </p>

              <div className="blog__categories">
                {categories.map((category, index) => (
                  <a
                    key={category.id}
                    href={`#${category.id}`}
                    className={`blog__category-pill${
                      index === 0 ? " blog__category-pill--active" : ""
                    }`}
                  >
                    {category.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="blog__hero-image-wrapper">
              <img
                className="blog__hero-image"
                src={blogHeroImage}
                alt="Pareja organizando su boda con ideas y guía de planeación"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        <section className="blog__featured">
          <div className="container">
            <div className="blog__featured-grid blog__reveal">
              <div className="blog__featured-image-wrapper">
                <img
                  className="blog__featured-image"
                  src={featuredPost.image}
                  alt="Guía para planear boda sin estrés desde las primeras decisiones"
                  loading="lazy"
                />
              </div>

              <article className="blog__featured-content">
                <span className="blog__tag">{featuredPost.tag}</span>
                <h2 className="blog__featured-title">{featuredPost.title}</h2>
                <p className="blog__featured-text">{featuredPost.excerpt}</p>
                <div className="blog__meta">
                  <span>{featuredPost.readTime}</span>
                  <a href={featuredPost.href} className="blog__link">
                    Ver guías de boda
                  </a>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="blog__explore">
          <div className="container">
            <div className="blog__list-header blog__list-header--centered">
              <h2 className="blog__section-title">Explora consejos para organizar tu boda</h2>
              <p className="blog__section-subtitle">
                Organizamos el contenido por temas para que encuentres más rápido
                ideas, guías y recomendaciones según la etapa en la que estás.
              </p>
            </div>

            <div className="blog__explore-grid blog__reveal">
              {categoryHighlights.map((item) => (
                <article className="blog-card blog-card--highlight" key={item.id}>
                  <div className="blog-card__image-wrapper">
                    <img
                      className="blog-card__image"
                      src={item.image}
                      alt={`${item.title} - ${item.tag}`}
                      loading="lazy"
                    />
                  </div>

                  <div className="blog-card__body">
                    <span className="blog-card__tag">{item.tag}</span>
                    <h3 className="blog-card__title">{item.title}</h3>
                    <p className="blog-card__excerpt">{item.excerpt}</p>
                    <div className="blog-card__meta">
                      <span>{item.readTime}</span>
                      <a href={`#${item.id}`} className="blog-card__link">
                        Ver artículos
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {sections.map((section, index) => (
          <section
            className={`blog__topic blog__topic--${index % 2 === 0 ? "soft" : "plain"}`}
            id={section.id}
            key={section.id}
          >
            <div className="container">
              <div className={`blog__topic-shell blog__topic-shell--${section.variant} blog__reveal`}>
                <div className="blog__list-header">
                  <span className="blog__topic-kicker">{section.title}</span>
                  <h2 className="blog__section-title">{section.title}</h2>
                  <p className="blog__section-subtitle">{section.subtitle}</p>
                </div>

                <div className={`blog__topic-layout blog__topic-layout--${section.variant}`}>
                  {section.posts.map((post, postIndex) => (
                    <article
                      className={`blog-card blog-card--topic blog-card--${section.variant} ${
                        postIndex === 0 ? "blog-card--lead" : ""
                      }`}
                      key={post.id}
                    >
                      <div className="blog-card__image-wrapper">
                        <img
                          className="blog-card__image"
                          src={post.image}
                          alt={`${post.title} - artículo de ${post.tag}`}
                          loading="lazy"
                        />
                      </div>

                      <div className="blog-card__body">
                        <span className="blog-card__tag">{post.tag}</span>
                        <h3 className="blog-card__title">{post.title}</h3>
                        <p className="blog-card__excerpt">{post.excerpt}</p>
                        <div className="blog-card__meta"></div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ))}

        <section className="blog__newsletter">
          <div className="container">
            <div className="newsletter newsletter--blog blog__reveal">
              <div className="newsletter__text">
                <div className="newsletter__title">
                  ¿Quieres empezar a planear tu boda con más claridad?
                </div>
                <div className="newsletter__sub">
                  Regístrate sin costo en Kelom y acompaña tu proceso con
                  contenido útil, orientación y acceso progresivo a proveedores
                  para boda.
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
          </div>
        </section>
      </section>
    </main>
  );
}

export default BlogPage;