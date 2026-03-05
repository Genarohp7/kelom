import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../../../../Blocks/Business/ProviderInboxPage.css";
import Kelom from "../../../assets/web/logo/logoKelom.png";
import { clearProviderSession, getProviderToken } from "../../../services/providerAuth";

const API_BASE = import.meta.env.VITE_API_URL || "https://api.kelom.com.mx";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pendiente" },
  { value: "attended", label: "Atendida" },
  { value: "unattended", label: "Sin atender" },
  { value: "closed", label: "Cerrada" },
];

const DEMO_REQUESTS = [
  {
    id: "req-001",
    fromName: "Ana Martínez",
    partnerName: "Luis Herrera",
    submittedAt: "2026-03-04T11:20:00",
    eventDate: "2026-11-14",
    guests: 150,
    location: "Naucalpan",
    preferredContact: "WhatsApp",
    email: "ana.luis@email.com",
    phone: "5512345678",
    status: "pending",
    source: "Botón solicitar información",
    message:
      "Hola, nos encantó su lugar. Queremos saber disponibilidad para noviembre, costos aproximados y si incluyen mobiliario básico.",
  },
  {
    id: "req-002",
    fromName: "Mariana López",
    partnerName: "Carlos Vega",
    submittedAt: "2026-03-03T16:45:00",
    eventDate: "2026-09-21",
    guests: 90,
    location: "Atizapán de Zaragoza",
    preferredContact: "Correo",
    email: "mariana@email.com",
    phone: "5587654321",
    status: "attended",
    source: "Botón solicitar información",
    message:
      "Queremos una boda íntima. Nos interesa conocer si manejan paquetes pequeños y si permiten proveedores externos.",
  },
  {
    id: "req-003",
    fromName: "Fernanda Ruiz",
    partnerName: "Jorge Silva",
    submittedAt: "2026-03-02T09:10:00",
    eventDate: "2027-01-17",
    guests: 220,
    location: "Tlalpan",
    preferredContact: "Llamada",
    email: "fernanda@email.com",
    phone: "5544433322",
    status: "unattended",
    source: "Botón solicitar información",
    message:
      "Nos interesa una cotización para evento grande. También queremos saber si cuentan con estacionamiento y área techada.",
  },
  {
    id: "req-004",
    fromName: "Sofía Navarro",
    partnerName: "Daniel Cruz",
    submittedAt: "2026-02-28T13:05:00",
    eventDate: "2026-12-05",
    guests: 130,
    location: "Cuajimalpa de Morelos",
    preferredContact: "WhatsApp",
    email: "sofia@email.com",
    phone: "5511122233",
    status: "closed",
    source: "Botón solicitar información",
    message:
      "Ya encontramos opción, pero muchas gracias. Solo queríamos cerrar la solicitud y agradecer la atención previa.",
  },
];

function formatDate(dateStr) {
  if (!dateStr) return "Sin fecha";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;

  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(dateStr) {
  if (!dateStr) return "Sin fecha";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;

  return date.toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusLabel(status) {
  return STATUS_OPTIONS.find((x) => x.value === status)?.label || "Pendiente";
}

function ProviderInboxPage() {
  const navigate = useNavigate();

  const [providerName, setProviderName] = useState("Tu bandeja de solicitudes");
  const [requests, setRequests] = useState(DEMO_REQUESTS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(DEMO_REQUESTS[0]?.id || null);

  useEffect(() => {
    const token = getProviderToken();

    if (!token) {
      navigate("/empresas/acceso", {
        replace: true,
        state: { from: "/empresas/solicitudes" },
      });
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        const res = await fetch(`${API_BASE}/providers/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data?.error || `HTTP ${res.status}`);
        }

        if (cancelled) return;

        const venueName =
          data?.profile?.venue_name ||
          data?.profile?.company_name ||
          data?.provider?.name ||
          "Tu bandeja de solicitudes";

        setProviderName(venueName);
      } catch (err) {
        if (cancelled) return;

        const msg = String(err?.message || "").toLowerCase();
        if (msg.includes("token") || msg.includes("401") || msg.includes("403")) {
          clearProviderSession();
          navigate("/empresas/acceso", {
            replace: true,
            state: { from: "/empresas/solicitudes" },
          });
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const filteredRequests = useMemo(() => {
    const needle = String(search || "").trim().toLowerCase();

    return requests.filter((item) => {
      const matchesStatus =
        statusFilter === "all" ? true : item.status === statusFilter;

      const matchesSearch =
        !needle ||
        item.fromName.toLowerCase().includes(needle) ||
        item.partnerName.toLowerCase().includes(needle) ||
        item.location.toLowerCase().includes(needle) ||
        item.message.toLowerCase().includes(needle);

      return matchesStatus && matchesSearch;
    });
  }, [requests, search, statusFilter]);

  useEffect(() => {
    if (!filteredRequests.length) {
      setSelectedId(null);
      return;
    }

    const stillExists = filteredRequests.some((item) => item.id === selectedId);
    if (!stillExists) {
      setSelectedId(filteredRequests[0].id);
    }
  }, [filteredRequests, selectedId]);

  const selectedRequest = useMemo(
    () => requests.find((item) => item.id === selectedId) || null,
    [requests, selectedId]
  );

  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter((x) => x.status === "pending").length,
      attended: requests.filter((x) => x.status === "attended").length,
      unattended: requests.filter((x) => x.status === "unattended").length,
      closed: requests.filter((x) => x.status === "closed").length,
    };
  }, [requests]);

  const handleLogout = () => {
    clearProviderSession();
    navigate("/empresas", { replace: true });
  };

  const handleStatusChange = (requestId, nextStatus) => {
    setRequests((prev) =>
      prev.map((item) =>
        item.id === requestId ? { ...item, status: nextStatus } : item
      )
    );
  };

  return (
    <div className="provider-inbox">
      <header className="provider-inbox__header">
        <div className="container provider-inbox__header-inner">
          <NavLink
            to="/empresas"
            className="provider-inbox__brand"
            aria-label="Volver al área de empresas"
          >
            <img src={Kelom} alt="Kelom" className="provider-inbox__brand-logo" />
            <div className="provider-inbox__brand-copy">
              <span className="provider-inbox__brand-title">Kelom</span>
              <span className="provider-inbox__brand-subtitle">
                Centro de solicitudes
              </span>
            </div>
          </NavLink>

          <nav className="provider-inbox__nav">
            <NavLink
              to="/proveedores/mi-perfil?mode=provider"
              className="provider-inbox__nav-link"
            >
              Mi perfil
            </NavLink>

            <NavLink
              to="/empresas/registro/completar"
              className="provider-inbox__nav-link"
            >
              Editar ficha
            </NavLink>

            <NavLink
              to="/empresas/solicitudes"
              className="provider-inbox__nav-link provider-inbox__nav-link--active"
            >
              Solicitudes
            </NavLink>
          </nav>

          <button
            type="button"
            className="provider-inbox__logout"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="provider-inbox__main">
        <div className="container">
          <section className="provider-inbox__hero">
            <div>
              <p className="provider-inbox__eyebrow">Gestión de leads</p>
              <h1 className="provider-inbox__title">Solicitudes recibidas</h1>
              <p className="provider-inbox__subtitle">
                Administra las solicitudes de <strong>{providerName}</strong> sin
                convertir esto en una jungla de mensajes. Aquí podrás organizarlas,
                revisarlas y darles seguimiento con orden.
              </p>
            </div>

            <div className="provider-inbox__stats">
              <article className="provider-inbox__stat-card">
                <span className="provider-inbox__stat-number">{stats.total}</span>
                <span className="provider-inbox__stat-label">Total</span>
              </article>

              <article className="provider-inbox__stat-card">
                <span className="provider-inbox__stat-number">{stats.pending}</span>
                <span className="provider-inbox__stat-label">Pendientes</span>
              </article>

              <article className="provider-inbox__stat-card">
                <span className="provider-inbox__stat-number">{stats.attended}</span>
                <span className="provider-inbox__stat-label">Atendidas</span>
              </article>

              <article className="provider-inbox__stat-card">
                <span className="provider-inbox__stat-number">
                  {stats.unattended}
                </span>
                <span className="provider-inbox__stat-label">Sin atender</span>
              </article>

              <article className="provider-inbox__stat-card">
                <span className="provider-inbox__stat-number">{stats.closed}</span>
                <span className="provider-inbox__stat-label">Cerradas</span>
              </article>
            </div>
          </section>

          <section className="provider-inbox__workspace">
            <aside className="provider-inbox__sidebar">
              <div className="provider-inbox__tools">
                <input
                  type="text"
                  className="provider-inbox__search"
                  placeholder="Buscar por nombre, zona o mensaje..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                <div className="provider-inbox__filters">
                  <button
                    type="button"
                    className={
                      statusFilter === "all"
                        ? "provider-inbox__filter provider-inbox__filter--active"
                        : "provider-inbox__filter"
                    }
                    onClick={() => setStatusFilter("all")}
                  >
                    Todas
                  </button>

                  {STATUS_OPTIONS.map((status) => (
                    <button
                      key={status.value}
                      type="button"
                      className={
                        statusFilter === status.value
                          ? "provider-inbox__filter provider-inbox__filter--active"
                          : "provider-inbox__filter"
                      }
                      onClick={() => setStatusFilter(status.value)}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="provider-inbox__list">
                {filteredRequests.length === 0 ? (
                  <div className="provider-inbox__empty">
                    <div className="provider-inbox__empty-icon">✉️</div>
                    <h3>No hay solicitudes en esta vista</h3>
                    <p>
                      Ajusta tus filtros o espera a que empiecen a llegar mensajes
                      reales.
                    </p>
                  </div>
                ) : (
                  filteredRequests.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={
                        selectedId === item.id
                          ? "request-card request-card--active"
                          : "request-card"
                      }
                      onClick={() => setSelectedId(item.id)}
                    >
                      <div className="request-card__top">
                        <div>
                          <h3 className="request-card__name">{item.fromName}</h3>
                          <p className="request-card__couple">
                            con {item.partnerName}
                          </p>
                        </div>

                        <span className={`status-pill status-pill--${item.status}`}>
                          {getStatusLabel(item.status)}
                        </span>
                      </div>

                      <p className="request-card__excerpt">{item.message}</p>

                      <div className="request-card__meta">
                        <span>{item.location}</span>
                        <span>{formatDate(item.eventDate)}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </aside>

            <section className="provider-inbox__detail">
              {!selectedRequest ? (
                <div className="provider-inbox__detail-empty">
                  <div className="provider-inbox__empty-icon">📭</div>
                  <h3>Selecciona una solicitud</h3>
                  <p>
                    Aquí verás el detalle completo y podrás cambiar su estado.
                  </p>
                </div>
              ) : (
                <article className="detail-card">
                  <header className="detail-card__header">
                    <div>
                      <p className="detail-card__eyebrow">Detalle de solicitud</p>
                      <h2 className="detail-card__title">
                        {selectedRequest.fromName} + {selectedRequest.partnerName}
                      </h2>
                    </div>

                    <span
                      className={`status-pill status-pill--${selectedRequest.status}`}
                    >
                      {getStatusLabel(selectedRequest.status)}
                    </span>
                  </header>

                  <div className="detail-card__grid">
                    <div className="detail-card__item">
                      <span className="detail-card__label">Fecha de solicitud</span>
                      <span className="detail-card__value">
                        {formatDateTime(selectedRequest.submittedAt)}
                      </span>
                    </div>

                    <div className="detail-card__item">
                      <span className="detail-card__label">Fecha del evento</span>
                      <span className="detail-card__value">
                        {formatDate(selectedRequest.eventDate)}
                      </span>
                    </div>

                    <div className="detail-card__item">
                      <span className="detail-card__label">Invitados</span>
                      <span className="detail-card__value">
                        {selectedRequest.guests}
                      </span>
                    </div>

                    <div className="detail-card__item">
                      <span className="detail-card__label">Zona</span>
                      <span className="detail-card__value">
                        {selectedRequest.location}
                      </span>
                    </div>

                    <div className="detail-card__item">
                      <span className="detail-card__label">
                        Medio de contacto preferido
                      </span>
                      <span className="detail-card__value">
                        {selectedRequest.preferredContact}
                      </span>
                    </div>

                    <div className="detail-card__item">
                      <span className="detail-card__label">Origen</span>
                      <span className="detail-card__value">
                        {selectedRequest.source}
                      </span>
                    </div>

                    <div className="detail-card__item">
                      <span className="detail-card__label">Correo</span>
                      <span className="detail-card__value">
                        {selectedRequest.email}
                      </span>
                    </div>

                    <div className="detail-card__item">
                      <span className="detail-card__label">Teléfono</span>
                      <span className="detail-card__value">
                        {selectedRequest.phone}
                      </span>
                    </div>
                  </div>

                  <div className="detail-card__message">
                    <h3 className="detail-card__section-title">Mensaje</h3>
                    <p>{selectedRequest.message}</p>
                  </div>

                  <div className="detail-card__actions">
                    <h3 className="detail-card__section-title">Cambiar estado</h3>

                    <div className="detail-card__status-actions">
                      {STATUS_OPTIONS.map((status) => (
                        <button
                          key={status.value}
                          type="button"
                          className={
                            selectedRequest.status === status.value
                              ? "detail-card__status-btn detail-card__status-btn--active"
                              : "detail-card__status-btn"
                          }
                          onClick={() =>
                            handleStatusChange(selectedRequest.id, status.value)
                          }
                        >
                          {status.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </article>
              )}
            </section>
          </section>
        </div>
      </main>
    </div>
  );
}

export default ProviderInboxPage;