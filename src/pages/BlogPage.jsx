

// 👉 Coloca estas imágenes en:
// src/assets/web/pages/blog/blog-hero.jpg
// src/assets/web/pages/blog/blog-featured.jpg
// src/assets/web/pages/blog/blog-post-1.jpg
// src/assets/web/pages/blog/blog-post-2.jpg
// src/assets/web/pages/blog/blog-post-3.jpg
// src/assets/web/pages/blog/blog-post-4.jpg
import blogHeroImage from "../assets/web/pages/blog/blog-1.png";
import blogFeaturedImage from "../assets/web/pages/blog/blog-2.png";
import blogPostImage1 from "../assets/web/pages/blog/blog-lugares.png";
import blogPostImage2 from "../assets/web/pages/blog/blog-presupuesto.png";
import blogPostImage3 from "../assets/web/pages/blog/blog-banquetes.png";
import blogPostImage4 from "../assets/web/pages/blog/blog-experiencias.png";

function BlogPage() {
  const featuredPost = {
    id: 1,
    tag: "Organización",
    title: "Cómo planear tu boda sin volverte loca en el intento",
    excerpt:
      "Entre presupuesto, invitados, lugares y mil pendientes, es fácil abrumarse. Aquí te damos una ruta clara para que planees con calma y disfrutes el proceso.",
    readTime: "7 min de lectura",
    image: blogFeaturedImage,
  };

  const posts = [
    {
      id: 2,
      tag: "Lugares",
      title: "5 tipos de venues para distintos estilos de boda",
      excerpt:
        "Jardines, haciendas, terrazas, hoteles y salones. Qué ofrece cada uno y para qué tipo de pareja encaja mejor.",
      readTime: "5 min",
      image: blogPostImage1,
    },
    {
      id: 3,
      tag: "Presupuesto",
      title: "Errores típicos que disparan el costo de tu boda",
      excerpt:
        "Te contamos en qué se va el dinero sin que te des cuenta y cómo evitar esos descuidos.",
      readTime: "6 min",
      image: blogPostImage2,
    },
    {
      id: 4,
      tag: "Banquete",
      title: "Menú de boda: cómo decidir sin pelearse con la familia",
      excerpt:
        "Tips para elegir un menú que haga felices a tus invitados… y también a tu bolsillo.",
      readTime: "4 min",
      image: blogPostImage3,
    },
    {
      id: 5,
      tag: "Experiencia",
      title: "Detalles pequeños que tus invitados sí recuerdan",
      excerpt:
        "Desde la música hasta los mensajes en las mesas. Lo que realmente se queda en la memoria de quienes te acompañan.",
      readTime: "5 min",
      image: blogPostImage4,
    },
  ];

  const categories = [
    "Todo",
    "Organización",
    "Lugares",
    "Banquete",
    "Vestido",
    "Invitados",
  ];

  return (
    <main className="page__content">
      <section className="blog">
        {/* HERO */}
        <div className="container blog__hero">
          <div className="blog__hero-content">
            <span className="blog__badge">Blog Kelom</span>
            <h1 className="blog__title">
              Ideas, historias y tips para planear tu boda con calma
            </h1>
            <p className="blog__subtitle">
              Nada de consejos imposibles ni bodas sacadas de película con
              presupuestos irreales. Aquí hablamos de decisiones aterrizadas,
              proveedores reales y formas sanas de organizar tu día.
            </p>

            <div className="blog__categories">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`blog__category-pill${
                    cat === "Todo" ? " blog__category-pill--active" : ""
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="blog__hero-image-wrapper">
            <img
              className="blog__hero-image"
              src={blogHeroImage}
              alt="Pareja revisando detalles de su boda en una mesa"
              loading="lazy"
            />
          </div>
        </div>

        {/* POST DESTACADO */}
        <section className="blog__featured">
          <div className="container blog__featured-grid">
            <div className="blog__featured-image-wrapper">
              <img
                className="blog__featured-image"
                src={featuredPost.image}
                alt={featuredPost.title}
                loading="lazy"
              />
            </div>
            <article className="blog__featured-content">
              <span className="blog__tag">{featuredPost.tag}</span>
              <h2 className="blog__featured-title">{featuredPost.title}</h2>
              <p className="blog__featured-text">{featuredPost.excerpt}</p>
              <div className="blog__meta">
                <span>{featuredPost.readTime}</span>
                <button type="button" className="blog__link">
                  Leer artículo completo
                </button>
              </div>
            </article>
          </div>
        </section>

        {/* LISTA DE POSTS */}
        <section className="blog__list">
          <div className="container">
            <div className="blog__list-header">
              <h2 className="blog__section-title">Últimos artículos</h2>
              <p className="blog__section-subtitle">
                Una mezcla de experiencia real, observaciones sinceras y cosas
                que desearíamos que nos hubieran contado antes de organizar una
                boda.
              </p>
            </div>

            <div className="blog__grid">
              {posts.map((post) => (
                <article className="blog-card" key={post.id}>
                  <div className="blog-card__image-wrapper">
                    <img
                      className="blog-card__image"
                      src={post.image}
                      alt={post.title}
                      loading="lazy"
                    />
                  </div>
                  <div className="blog-card__body">
                    <span className="blog-card__tag">{post.tag}</span>
                    <h3 className="blog-card__title">{post.title}</h3>
                    <p className="blog-card__excerpt">{post.excerpt}</p>
                    {/* <div className="blog-card__meta">
                      <span>{post.readTime}</span>
                      <button type="button" className="blog-card__link">
                        Leer más
                      </button>
                    </div> */}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* NEWSLETTER / CONTACTO SUAVE */}
        <section className="blog__newsletter">
          <div className="container newsletter">
            <div className="newsletter__text">
              <div className="newsletter__title">
                ¿Quieres más tips sin hacer doomscroll?
              </div>
              <div className="newsletter__sub">
                Déjanos tu correo y te mandaremos solo contenido útil para
                organizar tu boda. Sin spam raro, lo prometemos.
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

export default BlogPage;
