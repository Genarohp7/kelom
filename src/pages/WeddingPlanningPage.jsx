import { NavLink } from "react-router-dom";
import planningHeroImage from "../assets/web/pages/blog/blog-1.png";
import planningIntroImage from "../assets/web/pages/blog/blog-2.png";
import planningStageImage1 from "../assets/web/pages/blog/blog-lugares.png";
import planningStageImage2 from "../assets/web/pages/blog/blog-presupuesto.png";
import planningStageImage3 from "../assets/web/pages/blog/blog-banquetes.png";
import planningStageImage4 from "../assets/web/pages/blog/blog-experiencias.png";

function WeddingPlanningPage() {
  const stages = [
    {
      id: "compromiso",
      eyebrow: "Etapa 01",
      title: "El compromiso",
      description:
        "Todo empieza antes del tablero de proveedores. Aquí entra la propuesta, el anillo, la emoción del momento y esas primeras conversaciones que muchas parejas dejan en el aire.",
      bullets: [
        "Cómo elegir un anillo sin comprar a ciegas",
        "Ideas reales para pedir matrimonio",
        "Qué hablar después del “sí” antes de salir corriendo a ver salones",
      ],
      image: planningStageImage1,
    },
    {
      id: "primeros-pasos",
      eyebrow: "Etapa 02",
      title: "Primeros pasos",
      description:
        "Antes de apartar cosas por impulso, conviene aterrizar la visión general de la boda. Menos prisa, más orden. Tu yo del futuro lo agradecerá bastante.",
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
        "Aquí se separan los sueños posibles de las decisiones que luego causan estrés. No se trata de bajar expectativas por deporte, sino de construir algo coherente con su realidad.",
      bullets: [
        "Saber en qué vale la pena invertir más",
        "Detectar gastos que suelen inflarse sin avisar",
        "Tomar decisiones sin perder el control del dinero",
      ],
      image: planningStageImage3,
    },
    {
      id: "fecha-y-estilo",
      eyebrow: "Etapa 04",
      title: "Elegir fecha y estilo",
      description:
        "Fecha, temporada, clima, tipo de sede y estilo visual empiezan a acomodar el resto del rompecabezas. Esto ayuda muchísimo a filtrar opciones desde el principio.",
      bullets: [
        "Cómo elegir una fecha con lógica y no solo con emoción",
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
        "Aquí entra la parte sabrosa y peligrosa: comparar opciones. La idea no es solo encontrar algo bonito, sino proveedores confiables, claros y adecuados para su boda real.",
      bullets: [
        "Qué revisar antes de contratar",
        "Cómo comparar sin perderte entre mil opciones",
        "Qué proveedores conviene buscar primero",
      ],
      image: planningStageImage1,
    },
    {
      id: "organizacion-previa",
      eyebrow: "Etapa 06",
      title: "Organización previa",
      description:
        "Cuando ya hay decisiones tomadas, toca coordinar para que las semanas previas no se conviertan en una licuadora emocional. Sí, la logística también merece amor.",
      bullets: [
        "Checklist de pendientes finales",
        "Cómo repartir tareas sin pelear por todo",
        "Qué confirmar días antes del evento",
      ],
      image: planningStageImage2,
    },
    {
      id: "gran-dia",
      eyebrow: "Etapa 07",
      title: "Consejos para el gran día",
      description:
        "El objetivo no es controlar cada segundo como si fuera un lanzamiento espacial. Es llegar con claridad, disfrutar y saber qué detalles sí hacen diferencia.",
      bullets: [
        "Qué conviene dejar resuelto desde antes",
        "Cómo vivir el día con menos tensión",
        "Pequeños detalles que sí mejoran la experiencia",
      ],
      image: planningStageImage3,
    },
  ];

  const quickGuides = [
    {
      title: "Antes del “sí”",
      text: "Una mirada útil a la propuesta de matrimonio, el anillo y las primeras decisiones que vienen justo después.",
    },
    {
      title: "Decisiones base",
      text: "Presupuesto, invitados, estilo y fecha: lo que conviene ordenar antes de buscar proveedores por impulso.",
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
                Una guía clara para organizar tu boda paso a paso, sin sentir que
                todo te cayó encima al mismo tiempo
              </h1>

              <p className="planning-guide__subtitle">
                Esta sección no está pensada como blog ni como lista infinita de
                artículos. Es una ruta más estable y ordenada para acompañarlos
                desde el compromiso hasta el gran día, con contenido útil,
                aterrizado y hecho para bodas reales.
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
                  Explorar proveedores
                </NavLink>
              </div>
            </div>

            <div className="planning-guide__hero-visual">
              <div className="planning-guide__hero-image-wrap">
                <img
                  src={planningHeroImage}
                  alt="Pareja planeando su boda"
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
                  Esto no es un blog disfrazado
                </h2>
                <p className="planning-guide__section-text">
                  “Planea tu boda” existe para acompañar a la pareja en un orden
                  lógico. No quiere competir con el Blog, sino complementar la
                  experiencia con una estructura más evergreen, más estable y
                  más útil para quienes necesitan mapa, no solo inspiración.
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
                    <span>Porque una boda no se organiza bien a punta de impulso.</span>
                  </div>
                </div>
              </div>

              <div className="planning-guide__intro-media">
                <div className="planning-guide__intro-image-wrap">
                  <img
                    src={planningIntroImage}
                    alt="Pareja revisando detalles de su boda"
                    className="planning-guide__intro-image"
                  />
                </div>

                <article className="planning-guide__intro-floating-card">
                  <span className="planning-guide__section-badge">
                    Por qué empieza antes
                  </span>
                  <h3 className="planning-guide__floating-title">
                    La historia no arranca cuando buscas el espacio ideal
                  </h3>
                  <p className="planning-guide__section-text">
                    Muchas decisiones importantes empiezan desde la propuesta de
                    matrimonio. Por eso aquí también vive la etapa de antes del
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
                El proceso, ordenado por etapas
              </h2>
              <p className="planning-guide__section-text planning-guide__section-text--center">
                No todas las parejas viven este camino igual, pero sí ayuda
                muchísimo tener una guía clara para saber qué toca primero, qué
                puede esperar y en qué vale la pena poner atención desde el
                inicio.
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
                      alt={stage.title}
                      className="planning-guide__stage-image"
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
                  Cuando tienes más claro el panorama, lo demás empieza a acomodarse
                </h2>
                <p className="planning-guide__section-text">
                  Puedes complementar esta guía con el Blog de Kelom o empezar a
                  explorar proveedores reales según la etapa en la que van. La
                  idea no es saturarte, sino ayudarte a decidir mejor.
                </p>
              </div>

              <div className="planning-guide__cta-actions">
                <NavLink
                  to="/blog"
                  className="header__btn header__btn--outline"
                >
                  Ir al Blog
                </NavLink>

                <NavLink
                  to="/proveedores"
                  className="header__btn header__btn--primary"
                >
                  Ver proveedores
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