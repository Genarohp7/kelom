import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../../../../Blocks/Business/ProviderInboxPage.css";
import Kelom from "../../../assets/web/logo/logoKelom.png";
import {
  clearProviderSession,
  getProviderToken,
} from "../../../services/providerAuth";

const API_BASE = import.meta.env.VITE_API_URL || "https://api.kelom.com.mx";

const STATUS_OPTIONS = [
  { value: "pendiente", label: "Pendiente", className: "pending" },
  { value: "atendida", label: "Atendida", className: "attended" },
  { value: "sin_atender", label: "Sin atender", className: "unattended" },
  { value: "cerrada", label: "Cerrada", className: "closed" },
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

function normalizeProviderStatus(rawStatus) {
  const value = String(rawStatus || "").trim().toLowerCase();

  if (value === "pendiente" || value === "pending") return "pendiente";
  if (value === "atendida" || value === "attended") return "atendida";
  if (value === "sin_atender" || value === "unattended") return "sin_atender";
  if (value === "cerrada" || value === "closed") return "cerrada";

  return "sin_atender";
}

function getStatusMeta(status) {
  return (
    STATUS_OPTIONS.find((item) => item.value === normalizeProviderStatus(status)) ||
    STATUS_OPTIONS[2]
  );
}

function getStatusLabel(status) {
  return getStatusMeta(status).label;
}

function getStatusClassName(status) {
  return getStatusMeta(status).className;
}

function normalizeRequestItem(item, index) {
  if (!item || typeof item !== "object") return null;

  return {
    id: item.id ?? `request-${index}`,
    fromName: item.requester_name || item.fromName || "Sin nombre",
    partnerName: item.partner_name || item.partnerName || "",
    submittedAt: item.created_at || item.submittedAt || "",
    eventDate: item.wedding_date || item.eventDate || "",
    guests: item.guests ?? null,
    location: item.city || item.location || "Sin zona",
    preferredContact:
      item.preferred_contact_schedule ||
      item.preferredContact ||
      "Sin especificar",
    email: item.requester_email || item.email || "Sin correo",
    phone: item.requester_phone || item.phone || "Sin teléfono",
    status: normalizeProviderStatus(item.provider_status || item.status),
    source: item.source || "Solicitud de información",
    message: item.message || "Sin mensaje",
  };
}

function ProviderInboxPage() {
  const navigate = useNavigate();

  const [providerName, setProviderName] = useState("Tu bandeja de solicitudes");
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingStatusId, setSavingStatusId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

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

    const handleAuthError = () => {
      clearProviderSession();
      navigate("/empresas/acceso", {
        replace: true,
        state: { from: "/empresas/solicitudes" },
      });
    };

    const run = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const [providerRes, requestsRes] = await Promise.all([
          fetch(`${API_BASE}/providers/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_BASE}/providers/info-requests`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const providerData = await providerRes.json().catch(() => ({}));
        const requestsData = await requestsRes.json().catch(() => ({}));

        if (providerRes.status === 401 || providerRes.status === 403) {
          if (!cancelled) handleAuthError();
          return;
        }

        if (requestsRes.status === 401 || requestsRes.status === 403) {
          if (!cancelled) handleAuthError();
          return;
        }

        if (!providerRes.ok) {
          throw new Error(providerData?.error || `HTTP ${providerRes.status}`);
        }

        if (!requestsRes.ok) {
          throw new Error(requestsData?.error || `HTTP ${requestsRes.status}`);
        }

        if (cancelled) return;

        const venueName =
          providerData?.profile?.venue_name ||
          providerData?.profile?.company_name ||
          providerData?.provider?.name ||
          "Tu bandeja de solicitudes";

        setProviderName(venueName);
        setRequests(Array.isArray(requestsData?.requests) ? requestsData.requests : []);
      } catch (err) {
        if (cancelled) return;

        const msg = String(err?.message || "").toLowerCase();

        if (
          msg.includes("token") ||
          msg.includes("401") ||
          msg.includes("403") ||
          msg.includes("no autorizado")
        ) {
          handleAuthError();
          return;
        }

        setErrorMessage(err?.message || "No se pudieron cargar las solicitudes.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const normalizedRequests = useMemo(() => {
    return requests
      .map((item, index) => normalizeRequestItem(item, index))
      .filter(Boolean);
  }, [requests]);

  const filteredRequests = useMemo(() => {
    const needle = String(search || "").trim().toLowerCase();

    return normalizedRequests.filter((item) => {
      const matchesStatus =
        statusFilter === "all" ? true : item.status === statusFilter;

      const matchesSearch =
        !needle ||
        String(item.fromName || "").toLowerCase().includes(needle) ||
        String(item.partnerName || "").toLowerCase().includes(needle) ||
        String(item.location || "").toLowerCase().includes(needle) ||
        String(item.message || "").toLowerCase().includes(needle) ||
        String(item.email || "").toLowerCase().includes(needle) ||
        String(item.phone || "").toLowerCase().includes(needle);

      return matchesStatus && matchesSearch;
    });
  }, [normalizedRequests, search, statusFilter]);

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
    () => normalizedRequests.find((item) => item.id === selectedId) || null,
    [normalizedRequests, selectedId]
  );

  const stats = useMemo(() => {
    return {
      total: normalizedRequests.length,
      pendiente: normalizedRequests.filter((x) => x.status === "pendiente").length,
      atendida: normalizedRequests.filter((x) => x.status === "atendida").length,
      sin_atender: normalizedRequests.filter((x) => x.status === "sin_atender").length,
      cerrada: normalizedRequests.filter((x) => x.status === "cerrada").length,
    };
  }, [normalizedRequests]);

  const handleLogout = () => {
    clearProviderSession();
    navigate("/empresas", { replace: true });
  };

  const handleStatusChange = async (requestId, nextStatus) => {
    const token = getProviderToken();
    if (!token) {
      clearProviderSession();
      navigate("/empresas/acceso", {
        replace: true,
        state: { from: "/empresas/solicitudes" },
      });
      return;
    }

    setSavingStatusId(requestId);
    setErrorMessage("");

    try {
      const res = await fetch(`${API_BASE}/providers/info-requests/${requestId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          provider_status: nextStatus,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        clearProviderSession();
        navigate("/empresas/acceso", {
          replace: true,
          state: { from: "/empresas/solicitudes" },
        });
        return;
      }

      if (!res.ok) {
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      const updatedRequest = data?.request || null;
      if (!updatedRequest) {
        throw new Error("No se recibió la solicitud actualizada.");
      }

      setRequests((prev) =>
        prev.map((item) =>
          item.id === requestId
            ? {
                ...item,
                ...updatedRequest,
              }
            : item
        )
      );
    } catch (err) {
      setErrorMessage(err?.message || "No se pudo actualizar el estado.");
    } finally {
      setSavingStatusId(null);
    }
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
          </NavLink>

          <div className="provider-inbox__header-center">
            <div className="provider-inbox__brand-copy">
              <span className="provider-inbox__brand-title">Kelom</span>
              <span className="provider-inbox__brand-subtitle">
                Centro de solicitudes
              </span>
            </div>

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
          </div>

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
                <span className="provider-inbox__stat-number">
                  {stats.pendiente}
                </span>
                <span className="provider-inbox__stat-label">Pendientes</span>
              </article>

              <article className="provider-inbox__stat-card">
                <span className="provider-inbox__stat-number">
                  {stats.atendida}
                </span>
                <span className="provider-inbox__stat-label">Atendidas</span>
              </article>

              <article className="provider-inbox__stat-card">
                <span className="provider-inbox__stat-number">
                  {stats.sin_atender}
                </span>
                <span className="provider-inbox__stat-label">Sin atender</span>
              </article>

              <article className="provider-inbox__stat-card">
                <span className="provider-inbox__stat-number">
                  {stats.cerrada}
                </span>
                <span className="provider-inbox__stat-label">Cerradas</span>
              </article>
            </div>
          </section>

          {errorMessage ? (
            <div className="provider-inbox__error-banner">
              {errorMessage}
            </div>
          ) : null}

          <section className="provider-inbox__workspace">
            <aside className="provider-inbox__sidebar">
              <div className="provider-inbox__tools">
                <input
                  type="text"
                  className="provider-inbox__search"
                  placeholder="Buscar por nombre, zona, correo, teléfono o mensaje..."
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
                {loading ? (
                  <div className="provider-inbox__empty">
                    <div className="provider-inbox__empty-icon">⏳</div>
                    <h3>Cargando solicitudes</h3>
                    <p>Espera un momento mientras traemos la información real.</p>
                  </div>
                ) : filteredRequests.length === 0 ? (
                  <div className="provider-inbox__empty">
                    <div className="provider-inbox__empty-icon">✉️</div>
                    <h3>No hay solicitudes en esta vista</h3>
                    <p>
                      Ajusta tus filtros o espera a que el admin apruebe nuevas
                      solicitudes para este proveedor.
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
                          {item.partnerName ? (
                            <p className="request-card__couple">
                              con {item.partnerName}
                            </p>
                          ) : null}
                        </div>

                        <span
                          className={`status-pill status-pill--${getStatusClassName(
                            item.status
                          )}`}
                        >
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
                        {selectedRequest.partnerName
                          ? `${selectedRequest.fromName} + ${selectedRequest.partnerName}`
                          : selectedRequest.fromName}
                      </h2>
                    </div>

                    <span
                      className={`status-pill status-pill--${getStatusClassName(
                        selectedRequest.status
                      )}`}
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
                        {selectedRequest.guests ?? "No especificado"}
                      </span>
                    </div>

                    <div className="detail-card__item">
                      <span className="detail-card__label">Zona</span>
                      <span className="detail-card__value">
                        {selectedRequest.location || "No especificada"}
                      </span>
                    </div>

                    <div className="detail-card__item">
                      <span className="detail-card__label">
                        Horario para contactar
                      </span>
                      <span className="detail-card__value">
                        {selectedRequest.preferredContact || "No especificado"}
                      </span>
                    </div>

                    <div className="detail-card__item">
                      <span className="detail-card__label">Origen</span>
                      <span className="detail-card__value">
                        {selectedRequest.source || "Solicitud de información"}
                      </span>
                    </div>

                    <div className="detail-card__item">
                      <span className="detail-card__label">Correo</span>
                      <span className="detail-card__value">
                        {selectedRequest.email || "Sin correo"}
                      </span>
                    </div>

                    <div className="detail-card__item">
                      <span className="detail-card__label">Teléfono</span>
                      <span className="detail-card__value">
                        {selectedRequest.phone || "Sin teléfono"}
                      </span>
                    </div>
                  </div>

                  <div className="detail-card__message">
                    <h3 className="detail-card__section-title">Mensaje</h3>
                    <p>{selectedRequest.message || "Sin mensaje"}</p>
                  </div>

                  <div className="detail-card__actions">
                    <h3 className="detail-card__section-title">Cambiar estado</h3>

                    <div className="detail-card__status-actions">
                      {STATUS_OPTIONS.map((status) => (
                        <button
                          key={status.value}
                          type="button"
                          disabled={savingStatusId === selectedRequest.id}
                          className={
                            selectedRequest.status === status.value
                              ? "detail-card__status-btn detail-card__status-btn--active"
                              : "detail-card__status-btn"
                          }
                          onClick={() =>
                            handleStatusChange(selectedRequest.id, status.value)
                          }
                        >
                          {savingStatusId === selectedRequest.id
                            ? "Guardando..."
                            : status.label}
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