// src/pages/Business/Pages/BusinessAreaPage.jsx
import { useEffect, useMemo, useState } from "react";
import "../../../../Blocks/Business/BusinessAreaPage.css";
import Kelom from "../../../assets/web/logo/logoKelom.png";
import { NavLink } from "react-router-dom";
import BusinessArea from "../../../assets/web/pages/empresas/Business/business-1.png";
import {
  getProviderToken,
  getProviderUser,
  clearProviderSession,
} from "../../../services/providerAuth";

const API_BASE = import.meta.env.VITE_API_URL || "https://api.kelom.com.mx";

function BusinessAreaPage() {
  const [providerBusinessName, setProviderBusinessName] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProviderSession() {
      const token = getProviderToken();

      if (!token) {
        if (!cancelled) setProviderBusinessName("");
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/providers/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data?.error || `Error HTTP ${res.status}`);
        }

        if (cancelled) return;

        const companyName = String(data?.profile?.company_name || "").trim();
        const venueName = String(data?.profile?.venue_name || "").trim();
        const ownerName = String(data?.provider?.name || "").trim();
        const email = String(data?.provider?.email || getProviderUser()?.email || "").trim();

        if (companyName) {
          setProviderBusinessName(companyName);
          return;
        }

        if (venueName) {
          setProviderBusinessName(venueName);
          return;
        }

        if (ownerName) {
          setProviderBusinessName(ownerName);
          return;
        }

        if (email) {
          setProviderBusinessName(email.split("@")[0]);
          return;
        }

        setProviderBusinessName("Mi negocio");
      } catch {
        clearProviderSession();
        if (!cancelled) setProviderBusinessName("");
      }
    }

    loadProviderSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const providerLabel = useMemo(() => {
    const clean = String(providerBusinessName || "").trim();
    return clean || "";
  }, [providerBusinessName]);

  const isProviderLoggedIn = Boolean(providerLabel);

  return (
    <div className="business">
      {/* HEADER ESPECIAL PARA EMPRESAS */}
      <header className="business__header">
        <div className="business__header-inner container">
          <NavLink to="/" className="header__logo" aria-label="Kelom">
            <img src={Kelom} alt="Logo Kelom" title="Kelom" />
          </NavLink>

          <nav className="business__nav">
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

            <NavLink
              to="/empresas/beneficios"
              className={({ isActive }) =>
                "business__nav-link" +
                (isActive ? " business__nav-link_active" : "")
              }
            >
              Beneficios
            </NavLink>

            {isProviderLoggedIn ? (
              <NavLink
                to="/empresas/registro/completar"
                className="business__nav-link business__nav-link_button"
                title={providerLabel}
              >
                {providerLabel}
              </NavLink>
            ) : (
              <NavLink
                to="/empresas/acceso"
                className="business__nav-link business__nav-link_button"
              >
                Acceder
              </NavLink>
            )}
          </nav>
        </div>
      </header>

      <div className="business__body">
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
                anónimas. Te ayudamos a estar presente justo en el momento en que
                se toman decisiones importantes.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "0.8rem",
                  flexWrap: "wrap",
                  marginBottom: "1.2rem",
                }}
              >
                {isProviderLoggedIn ? (
                  <>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0.8rem 1.2rem",
                        borderRadius: "999px",
                        border: "1px solid rgba(232,154,169,0.35)",
                        color: "#7c3f4c",
                        background: "#fff7fb",
                        fontWeight: 700,
                      }}
                    >
                      {providerLabel}
                    </div>

                    <NavLink
                      to="/empresas/registro/completar"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0.8rem 1.2rem",
                        borderRadius: "999px",
                        border: "1px solid rgba(232,154,169,0.65)",
                        color: "#a94f63",
                        textDecoration: "none",
                        fontWeight: 600,
                        background: "#fff",
                      }}
                    >
                      Ir a mi perfil
                    </NavLink>
                  </>
                ) : (
                  <>
                    <NavLink to="/empresas/registro" className="business__cta-button">
                      Registrar mi negocio
                    </NavLink>

                    <NavLink
                      to="/empresas/acceso"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0.8rem 1.2rem",
                        borderRadius: "999px",
                        border: "1px solid rgba(232,154,169,0.65)",
                        color: "#a94f63",
                        textDecoration: "none",
                        fontWeight: 600,
                        background: "#fff",
                      }}
                    >
                      Ya tengo cuenta
                    </NavLink>
                  </>
                )}
              </div>

              <div className="business__benefits-grid">
                <article className="business-card">
                  <span className="business-card__icon" aria-hidden="true">
                    🌐
                  </span>
                  <h3 className="business-card__title">Visibilidad en la web</h3>
                  <p className="business-card__text">
                    Tu negocio aparece en una plataforma especializada en eventos,
                    justo cuando las parejas están planeando su boda.
                  </p>
                </article>

                <article className="business-card">
                  <span className="business-card__icon" aria-hidden="true">
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
                  <span className="business-card__icon" aria-hidden="true">
                    📈
                  </span>
                  <h3 className="business-card__title">Generas más</h3>
                  <p className="business-card__text">
                    Estar en Kelom te coloca frente a parejas que ya están listas
                    para contratar, no solo frente a curiosos.
                  </p>
                </article>

                <article className="business-card">
                  <span className="business-card__icon" aria-hidden="true">
                    🤝
                  </span>
                  <h3 className="business-card__title">Acompañamiento personal</h3>
                  <p className="business-card__text">
                    Te ayudamos a presentar mejor tu negocio y a entender qué
                    buscan las parejas para que tu oferta sea clara y atractiva.
                  </p>
                </article>
              </div>
            </div>

            <div className="business__hero-side">
              <figure className="business__hero-figure">
                <div className="business__hero-photo-wrap">
                  <img
                    src={BusinessArea}
                    alt="Proveedor de eventos gestionando su negocio en línea"
                    className="business__hero-photo"
                  />
                  <img
                    src="/favicon.svg"
                    alt="Ícono Kelom"
                    className="business__hero-favicon"
                  />
                </div>
                <figcaption className="business__hero-caption">
                  <p className="business__hero-caption-title">Tu vitrina digital</p>
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
                  corta.
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
                <div className="stat-card__icon" aria-hidden="true">📊</div>
                <p className="stat-card__number">+X</p>
                <p className="stat-card__label">veces más oportunidades</p>
                <p className="stat-card__text">
                  Estar en una plataforma especializada multiplica tus
                  posibilidades de recibir mensajes, cotizaciones y visitas a tus
                  redes.
                </p>
              </article>

              <article className="stat-card">
                <div className="stat-card__icon" aria-hidden="true">⏰</div>
                <p className="stat-card__number">24/7</p>
                <p className="stat-card__label">vitrina digital</p>
                <p className="stat-card__text">
                  Tu negocio está visible todos los días, a cualquier hora.
                </p>
              </article>

              <article className="stat-card">
                <div className="stat-card__icon" aria-hidden="true">🚫</div>
                <p className="stat-card__number">0</p>
                <p className="stat-card__label">visibilidad sin presencia web</p>
                <p className="stat-card__text">
                  No estar en línea significa que muchas parejas jamás sabrán que
                  existes.
                </p>
              </article>
            </div>

            <div className="business__responsibility">
              <h3 className="business__responsibility-title">
                Nuestra responsabilidad con tu negocio
              </h3>
              <p className="business__responsibility-text">
                En Kelom no solo abrimos un directorio. Nuestro compromiso es
                atraer a las personas correctas: parejas que realmente están
                planeando su boda.
              </p>
            </div>
          </div>
        </section>

        <section id="acceder" className="business__cta">
          <div className="container business__cta-inner">
            <div className="business__cta-text">
              <h2 className="business__cta-title">
                ¿Listo para que más parejas conozcan tu negocio?
              </h2>
              <p className="business__cta-subtitle">
                Registra tu empresa en Kelom y forma parte de una comunidad de
                proveedores seleccionados.
              </p>

              {isProviderLoggedIn ? (
                <p className="business__cta-subtitle" style={{ marginTop: "0.4rem" }}>
                  Ya tienes sesión activa como <strong>{providerLabel}</strong>.
                </p>
              ) : (
                <p className="business__cta-subtitle" style={{ marginTop: "0.4rem" }}>
                  ¿Ya te registraste?{" "}
                  <NavLink to="/empresas/acceso">Entra aquí a tu cuenta</NavLink>.
                </p>
              )}
            </div>

            {isProviderLoggedIn ? (
              <NavLink to="/empresas/registro/completar" className="business__cta-button">
                Ir a mi perfil
              </NavLink>
            ) : (
              <NavLink to="/empresas/registro" className="business__cta-button">
                Registrar mi negocio
              </NavLink>
            )}
          </div>
        </section>
      </div>

      <footer className="business__footer">
        <div className="container business__footer-inner">
          <p className="business__footer-text">Síguenos</p>
          <div className="business__social">
            <a href="#" className="business__social-link">Facebook</a>
            <a href="#" className="business__social-link">Instagram</a>
            <a href="#" className="business__social-link">WhatsApp</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default BusinessAreaPage;