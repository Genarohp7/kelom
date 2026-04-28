import { Link } from "react-router-dom";
import { getFooterLegalDocuments } from "../data/legalDocuments.js";

function Footer() {
  const legalDocuments = getFooterLegalDocuments();

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <p className="footer__copy">
            Kelom.com.mx · Acompañándote en cada paso hacia el “sí, acepto”.
          </p>

          <p className="footer__copy">
            Kelom es una plataforma de conexión entre usuarios y proveedores.
            Los servicios contratados son responsabilidad directa entre el
            cliente y el proveedor.
          </p>
        </div>

        <div className="footer__legal" aria-label="Sección legal">
          <span className="footer__legal-title">Legal</span>

          <div className="footer__legal-links">
            {legalDocuments.map((document) => (
              <Link
                key={document.slug}
                to={`/legal/${document.slug}`}
                className="footer__legal-link"
              >
                {document.shortTitle}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;