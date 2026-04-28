import { NavLink } from "react-router-dom";
import planningHeroImage from "../assets/web/pages/weddingplaningpage/mainone.webp";
import planningIntroImage from "../assets/web/pages/weddingplaningpage/secundaria.webp";
import planningStageImage1 from "../assets/web/pages/weddingplaningpage/compromiso.webp";
import planningStageImage2 from "../assets/web/pages/weddingplaningpage/pasos.webp";
import planningStageImage3 from "../assets/web/pages/weddingplaningpage/presupuesto.webp";
import planningStageImage4 from "../assets/web/pages/weddingplaningpage/calendario.webp";
import planningStageImage5 from "../assets/web/pages/weddingplaningpage/expertos.webp";
import planningStageImage6 from "../assets/web/pages/weddingplaningpage/pareja2.webp";
import planningStageImage7 from "../assets/web/pages/weddingplaningpage/consejos.webp";

function WeddingPlanningPage() {
  const stages = [
    {
      id: "compromiso",
      eyebrow: "Etapa 01",
      title: "El compromiso",
      description:
        "Todo empieza antes de buscar proveedores. Aquí entran la propuesta, el anillo, la emoción del momento y las primeras conversaciones que ayudan a ordenar lo que viene.",
      bullets: [
        "Cómo elegir un anillo con más seguridad",
        "Ideas reales para pedir matrimonio",
        "Qué hablar después del “sí” antes de empezar a buscar salones",
      ],
      image: planningStageImage1,
    },
    {
      id: "primeros-pasos",
      eyebrow: "Etapa 02",
      title: "Primeros pasos",
      description:
        "Antes de apartar servicios por impulso, conviene aterrizar la visión general de la boda. Tener orden desde el inicio hace que las siguientes decisiones sean más claras.",
      bullets: [
        "Definir tipo de boda y prioridades",
        "Tener una primera lista de invitados",
        "Evitar decisiones bonitas pero poco útiles",
      ],
      image: planningStageImage2,
    },
    {
      id: "presupuesto",
      eyebrow: "Etapa 03",
      title: "Definir presupuesto",
      description:
        "El presupuesto ayuda a convertir ideas en decisiones posibles. No se trata de bajar expectativas, sino de construir una boda coherente con su realidad.",
      bullets: [
        "Saber en qué vale la pena invertir más",
        "Detectar gastos que suelen crecer sin notarlo",
        "Tomar decisiones sin perder el control del dinero",
      ],
      image: planningStageImage3,
    },
    {
      id: "fecha-y-estilo",
      eyebrow: "Etapa 04",
      title: "Elegir fecha y estilo",
      description:
        "La fecha, la temporada, el clima, el tipo de sede y el estilo visual ayudan a filtrar opciones desde el principio y a ordenar mejor el resto del proceso.",
      bullets: [
        "Cómo elegir una fecha con lógica y emoción",
        "Qué cambia entre una boda de día, de tarde o de noche",
        "Cómo encontrar un estilo que sí se sienta suyo",
      ],
      image: planningStageImage4,
    },
    {
      id: "proveedores",
      eyebrow: "Etapa 05",
      title: "Elegir proveedores",
      description:
        "Comparar proveedores para boda no se trata solo de encontrar algo bonito. También importa revisar claridad, confianza, servicios incluidos y compatibilidad con su evento.",
      bullets: [
        "Qué revisar antes de contratar",
        "Cómo comparar sin perderte entre demasiadas opciones",
        "Qué proveedores conviene buscar primero",
      ],
      image: planningStageImage5,
    },
    {
      id: "organizacion-previa",
      eyebrow: "Etapa 06",
      title: "Organización previa",
      description:
        "Cuando ya hay decisiones tomadas, toca coordinar detalles para que las semanas previas se vivan con más calma y menos pendientes acumulados.",
      bullets: [
        "Checklist de pendientes finales",
        "Cómo repartir tareas sin cargar todo en una sola persona",
        "Qué confirmar días antes del evento",
      ],
      image: planningStageImage6,
    },
    {
      id: "gran-dia",
      eyebrow: "Etapa 07",
      title: "Consejos para el gran día",
      description:
        "El objetivo no es controlar cada segundo, sino llegar con claridad, disfrutar el momento y tener resueltos los detalles que realmente hacen diferencia.",
      bullets: [
        "Qué conviene dejar resuelto desde antes",
        "Cómo vivir el día con menos tensión",
        "Pequeños detalles que mejoran la experiencia",
      ],
      image: planningStageImage7,
    },
  ];

  const quickGuides = [
    {
      title: "Antes del “sí”",
      text: "Una mirada útil a la propuesta de matrimonio, el anillo y las primeras decisiones que vienen justo después.",
    },
    {
      title: "Decisiones base",
      text: "Presupuesto, invitados, estilo y fecha: lo que conviene ordenar antes de buscar proveedores para boda.",
    },
    {
      title: "Ruta clara",
      text: "Un recorrido pensado para acompañar a la pareja paso a paso, sin hacerla sentir perdida entre artículos sueltos.",
    },
  ];

  return (
    <main className="page__content">
      <section className="planning-guide">
        <section className="planning-guide__hero-section">
          <div className="container planning-guide__hero">
            <div className="planning-guide__hero-content">
              <span className="planning-guide__badge">Planea tu boda</span>

              <h1 className="planning-guide__title">
                Guía para planear tu boda paso a paso con más claridad
              </h1>

              <p className="planning-guide__subtitle">
                Organiza tu boda desde el compromiso hasta el gran día con una
                ruta clara, consejos prácticos y orientación para tomar mejores
                decisiones antes de contratar proveedores.
              </p>

              <div className="planning-guide__hero-actions">
                <a
                  href="#ruta-de-planeacion"
                  className="header__btn header__btn--primary"
                >
                  Ver ruta de planeación
                </a>

                <NavLink
                  to="/proveedores"
                  className="header__btn header__btn--outline"
                >
                  Buscar proveedores para mi boda
                </NavLink>
              </div>
            </div>

            <div className="planning-guide__hero-visual">
              <div className="planning-guide__hero-image-wrap">
                <img
                  src={planningHeroImage}
                  alt="Pareja planeando su boda paso a paso"
                  className="planning-guide__hero-image"
                />
              </div>

              <div className="planning-guide__hero-card">
                <div className="planning-guide__hero-card-inner">
                  <span className="planning-guide__hero-card-kicker">
                    Qué encontrarás aquí
                  </span>

                  <div className="planning-guide__hero-list">
                    {quickGuides.map((item) => (
                      <article
                        className="planning-guide__mini-card"
                        key={item.title}
                      >
                        <h2 className="planning-guide__mini-title">{item.title}</h2>
                        <p className="planning-guide__mini-text">{item.text}</p>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="planning-guide__intro">
          <div className="container">
            <div className="planning-guide__intro-shell">
              <div className="planning-guide__intro-copy">
                <span className="planning-guide__section-badge">
                  El enfoque de esta sección
                </span>
                <h2 className="planning-guide__section-title">
                  Una ruta clara para organizar tu boda
                </h2>
                <p className="planning-guide__section-text">
                  “Planea tu boda” existe para acompañar a la pareja en un orden
                  lógico. Complementa el Blog de Kelom con una estructura más
                  estable, útil y fácil de seguir para quienes necesitan un mapa
                  del proceso, no solo inspiración.
                </p>

                <div className="planning-guide__intro-points">
                  <div className="planning-guide__intro-point">
                    <strong>Más secuencia</strong>
                    <span>Menos artículos sueltos, más claridad sobre qué viene primero.</span>
                  </div>
                  <div className="planning-guide__intro-point">
                    <strong>Más contexto</strong>
                    <span>Para entender decisiones, no solo copiar ideas bonitas.</span>
                  </div>
                  <div className="planning-guide__intro-point">
                    <strong>Más orden real</strong>
                    <span>Porque una boda se organiza mejor con prioridades claras.</span>
                  </div>
                </div>
              </div>

              <div className="planning-guide__intro-media">
                <div className="planning-guide__intro-image-wrap">
                  <img
                    src={planningIntroImage}
                    alt="Pareja revisando detalles para organizar su boda"
                    className="planning-guide__intro-image"
                  />
                </div>

                <article className="planning-guide__intro-floating-card">
                  <span className="planning-guide__section-badge">
                    Por qué empieza antes
                  </span>
                  <h3 className="planning-guide__floating-title">
                    La historia no empieza cuando buscas el espacio ideal
                  </h3>
                  <p className="planning-guide__section-text">
                    Muchas decisiones importantes empiezan desde la propuesta de
                    matrimonio. Por eso también incluimos la etapa previa al
                    “sí”: el anillo, el momento, la conversación y el inicio real
                    de una nueva etapa.
                  </p>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section
          className="planning-guide__timeline"
          id="ruta-de-planeacion"
        >
          <div className="container">
            <div className="planning-guide__heading">
              <span className="planning-guide__section-badge">
                Ruta de planeación
              </span>
              <h2 className="planning-guide__section-title">
                Cómo organizar tu boda por etapas
              </h2>
              <p className="planning-guide__section-text planning-guide__section-text--center">
                No todas las parejas viven este camino igual, pero tener una
                guía clara ayuda a saber qué toca primero, qué puede esperar y
                en qué conviene poner atención desde el inicio.
              </p>
            </div>

            <div className="planning-guide__timeline-line" aria-hidden="true"></div>

            <div className="planning-guide__stages">
              {stages.map((stage, index) => (
                <article
                  className={`planning-guide__stage-card ${
                    index % 2 === 0
                      ? "planning-guide__stage-card--left"
                      : "planning-guide__stage-card--right"
                  }`}
                  id={stage.id}
                  key={stage.id}
                >
                  <div className="planning-guide__stage-media">
                    <img
                      src={stage.image}
                      alt={`${stage.title}: etapa para planear una boda`}
                      className="planning-guide__stage-image"
                      loading="lazy"
                    />
                  </div>

                  <div className="planning-guide__stage-body">
                    <div className="planning-guide__stage-top">
                      <span className="planning-guide__stage-eyebrow">
                        {stage.eyebrow}
                      </span>
                      <h3 className="planning-guide__stage-title">
                        {stage.title}
                      </h3>
                    </div>

                    <p className="planning-guide__stage-description">
                      {stage.description}
                    </p>

                    <ul className="planning-guide__stage-list">
                      {stage.bullets.map((bullet) => (
                        <li className="planning-guide__stage-item" key={bullet}>
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="planning-guide__cta">
          <div className="container">
            <div className="planning-guide__cta-card">
              <div className="planning-guide__cta-copy">
                <span className="planning-guide__section-badge">
                  Sigue explorando
                </span>
                <h2 className="planning-guide__section-title">
                  Cuando tienes claro el camino, elegir proveedores es más fácil
                </h2>
                <p className="planning-guide__section-text">
                  Puedes complementar esta guía con el Blog de Kelom o empezar a
                  buscar proveedores para boda según la etapa en la que van. La
                  idea no es saturarte, sino ayudarte a decidir mejor.
                </p>
              </div>

              <div className="planning-guide__cta-actions">
                <NavLink
                  to="/blog"
                  className="header__btn header__btn--outline"
                >
                  Leer guías del Blog
                </NavLink>

                <NavLink
                  to="/proveedores"
                  className="header__btn header__btn--primary"
                >
                  Encontrar proveedores para boda
                </NavLink>
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

export default WeddingPlanningPage;