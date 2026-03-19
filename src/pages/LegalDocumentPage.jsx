import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  LEGAL_DOCUMENTS,
  getLegalDocumentBySlug,
  getFooterLegalDocuments,
} from "../data/legalDocuments.js";

function LegalDocumentPage() {
  const { slug } = useParams();

  const documentData = useMemo(() => getLegalDocumentBySlug(slug), [slug]);
  const footerDocuments = useMemo(() => getFooterLegalDocuments(), []);

  useEffect(() => {
    if (!documentData) {
      document.title = "Documento legal | Kelom";
      return;
    }

    document.title = `${documentData.shortTitle} | Kelom`;
  }, [documentData]);

  if (!documentData) {
    return (
      <main className="page__content legal-page">
        <section className="legal-page__section">
          <div className="container legal-page__container">
            <div className="legal-page__hero">
              <span className="legal-page__pill">Documento no encontrado</span>
              <h1 className="legal-page__title">
                Este documento legal no existe o ya no está disponible
              </h1>
              <p className="legal-page__intro">
                Revisa el enlace o vuelve al sitio principal para navegar desde una
                ruta válida.
              </p>

              <div className="legal-page__actions">
                <Link to="/" className="header__btn header__btn--primary">
                  Volver al inicio
                </Link>
              </div>
            </div>

            <section className="legal-page__block">
              <div className="legal-page__block-head">
                <h2 className="legal-page__block-title">
                  Documentos legales disponibles
                </h2>
                <p className="legal-page__block-subtitle">
                  Estos son los documentos públicos principales disponibles en el
                  sitio.
                </p>
              </div>

              <div className="legal-page__links-grid">
                {footerDocuments.map((item) => (
                  <Link
                    key={item.slug}
                    to={`/legal/${item.slug}`}
                    className="legal-page__doc-link"
                  >
                    <span className="legal-page__doc-link-pill">Legal</span>
                    <span className="legal-page__doc-link-title">
                      {item.shortTitle}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </section>
      </main>
    );
  }

  const relatedDocuments = LEGAL_DOCUMENTS.filter(
    (item) => item.slug !== documentData.slug && item.showInFooter
  );

  return (
    <main className="page__content legal-page">
      <section className="legal-page__section">
        <div className="container legal-page__container">
          <header className="legal-page__hero">
            <span className="legal-page__pill">{documentData.pill}</span>

            <h1 className="legal-page__title">{documentData.title}</h1>

            <p className="legal-page__site-title">{documentData.siteTitle}</p>

            {documentData.intro && (
              <p className="legal-page__intro">{documentData.intro}</p>
            )}

            <div className="legal-page__actions">
              <Link to="/" className="header__btn header__btn--outline">
                Volver al inicio
              </Link>
            </div>
          </header>

          {documentData.summary?.length > 0 && (
            <section className="legal-page__summary">
              <div className="legal-page__summary-grid">
                {documentData.summary.map((item) => (
                  <article className="legal-page__summary-card" key={item.label}>
                    <span className="legal-page__summary-label">{item.label}</span>
                    <p className="legal-page__summary-value">{item.value}</p>
                  </article>
                ))}
              </div>
            </section>
          )}

          <section className="legal-page__content">
            <div className="legal-page__sections">
              {documentData.sections.map((section) => (
                <article className="legal-page__card" key={section.number}>
                  <div className="legal-page__card-head">
                    <span className="legal-page__card-number">
                      {section.number}
                    </span>
                    <h2 className="legal-page__card-title">{section.title}</h2>
                  </div>

                  {section.paragraphs?.map((paragraph, index) => (
                    <p
                      key={`${section.number}-paragraph-${index}`}
                      className="legal-page__paragraph"
                    >
                      {paragraph}
                    </p>
                  ))}

                  {section.subsections?.map((subsection, index) => (
                    <div
                      className="legal-page__subsection"
                      key={`${section.number}-subsection-${index}`}
                    >
                      <h3 className="legal-page__subsection-title">
                        {subsection.label}
                      </h3>

                      {subsection.paragraphs?.map((paragraph, paragraphIndex) => (
                        <p
                          key={`${section.number}-subsection-paragraph-${paragraphIndex}`}
                          className="legal-page__paragraph legal-page__paragraph--sub"
                        >
                          {paragraph}
                        </p>
                      ))}

                      {subsection.bullets && (
                        <ul className="legal-page__list legal-page__list--sub">
                          {subsection.bullets.map((bullet) => (
                            <li key={bullet}>{bullet}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}

                  {section.bullets && !section.subsections && (
                    <ul className="legal-page__list">
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  )}

                  {section.footer && (
                    <p className="legal-page__footer-note">{section.footer}</p>
                  )}
                </article>
              ))}
            </div>
          </section>

          {documentData.updatedAt && (
            <section className="legal-page__updated">
              <p>
                <strong>Fecha de última actualización:</strong>{" "}
                {documentData.updatedAt}
              </p>
            </section>
          )}

          {relatedDocuments.length > 0 && (
            <section className="legal-page__related">
              <div className="legal-page__block-head">
                <h2 className="legal-page__block-title">
                  Otros documentos legales
                </h2>
                <p className="legal-page__block-subtitle">
                  Puedes consultar también estos documentos publicados en el sitio.
                </p>
              </div>

              <div className="legal-page__links-grid">
                {relatedDocuments.map((item) => (
                  <Link
                    key={item.slug}
                    to={`/legal/${item.slug}`}
                    className="legal-page__doc-link"
                  >
                    <span className="legal-page__doc-link-pill">Legal</span>
                    <span className="legal-page__doc-link-title">
                      {item.shortTitle}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}

export default LegalDocumentPage;