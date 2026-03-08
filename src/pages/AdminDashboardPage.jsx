// src/pages/AdminDashboardPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminFetchMe, adminLogout } from "../utils/adminAuth.js";
import { adminApiFetch } from "../services/adminApi.js";

const REVIEW_STATUSES = [
  { value: "", label: "Todos" },
  { value: "pending_review", label: "Pendientes" },
  { value: "approved", label: "Aprobados" },
  { value: "needs_changes", label: "Piden cambios" },
  { value: "rejected", label: "Rechazados" },
  { value: "suspended", label: "Suspendidos" },
  { value: "archived", label: "Archivados" },
  { value: "draft", label: "Draft" },
];

const VISIBILITIES = [
  { value: "", label: "Todas" },
  { value: "listed", label: "Visible" },
  { value: "hidden", label: "Oculto" },
];

const USER_ROLES = [
  { value: "", label: "Todos" },
  { value: "admin", label: "Admin" },
  { value: "provider", label: "Proveedor" },
  { value: "user", label: "Usuario" },
];

const USER_STATUSES = [
  { value: "", label: "Todos" },
  { value: "active", label: "Activo" },
  { value: "blocked", label: "Bloqueado" },
];

const REQUEST_MOD_STATUSES = [
  { value: "", label: "Todas" },
  { value: "pending", label: "Pendientes" },
  { value: "approved", label: "Aprobadas" },
  { value: "declined", label: "Declinadas" },
];

function badgeClass(kind, value) {
  const v = String(value || "");

  if (kind === "review") {
    if (v === "approved") return "admin-badge admin-badge--ok";
    if (v === "pending_review") return "admin-badge admin-badge--warn";
    if (v === "needs_changes") return "admin-badge admin-badge--info";
    if (v === "rejected" || v === "suspended") return "admin-badge admin-badge--bad";
    return "admin-badge";
  }

  if (kind === "visibility") {
    if (v === "listed") return "admin-badge admin-badge--ok";
    if (v === "hidden") return "admin-badge admin-badge--muted";
    return "admin-badge";
  }

  if (kind === "user-status") {
    if (v === "active") return "admin-badge admin-badge--ok";
    if (v === "blocked") return "admin-badge admin-badge--bad";
    return "admin-badge";
  }

  if (kind === "role") {
    if (v === "admin") return "admin-badge admin-badge--warn";
    if (v === "provider") return "admin-badge admin-badge--info";
    if (v === "user") return "admin-badge admin-badge--muted";
    return "admin-badge";
  }

  if (kind === "request-mod") {
    if (v === "approved") return "admin-badge admin-badge--ok";
    if (v === "pending") return "admin-badge admin-badge--warn";
    if (v === "declined") return "admin-badge admin-badge--bad";
    return "admin-badge";
  }

  if (kind === "request-provider-status") {
    if (v === "atendida") return "admin-badge admin-badge--ok";
    if (v === "pendiente") return "admin-badge admin-badge--info";
    if (v === "sin_atender") return "admin-badge admin-badge--warn";
    if (v === "cerrada") return "admin-badge admin-badge--muted";
    return "admin-badge";
  }

  return "admin-badge";
}

function formatDateTime(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
}

function csvEscape(value) {
  const s = String(value ?? "");
  const needsQuotes = /[",\n\r]/.test(s);
  const escaped = s.replaceAll('"', '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

function downloadCsv(filename, rows) {
  // BOM para Excel (UTF-8)
  const bom = "\ufeff";
  const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8" });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function AdminDashboardPage() {
  const navigate = useNavigate();

  const [adminUser, setAdminUser] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  const [activeSection, setActiveSection] = useState("providers");

  // =========================
  // Providers state
  // =========================
  const [providerFilters, setProviderFilters] = useState({
    review_status: "pending_review",
    visibility: "",
    q: "",
  });

  const [providers, setProviders] = useState([]);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [providerBusyId, setProviderBusyId] = useState(null);
  const [providersError, setProvidersError] = useState("");
  const [providersFlash, setProvidersFlash] = useState("");

  const providersQueryString = useMemo(() => {
    const p = new URLSearchParams();
    if (providerFilters.review_status) p.set("review_status", providerFilters.review_status);
    if (providerFilters.visibility) p.set("visibility", providerFilters.visibility);
    if (providerFilters.q.trim()) p.set("q", providerFilters.q.trim());
    p.set("limit", "100");
    return p.toString();
  }, [providerFilters]);

  // =========================
  // Users state
  // =========================
  const [userFilters, setUserFilters] = useState({
    role: "",
    status: "",
    q: "",
  });

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userBusyId, setUserBusyId] = useState(null);
  const [usersError, setUsersError] = useState("");
  const [usersFlash, setUsersFlash] = useState("");

  const usersQueryString = useMemo(() => {
    const p = new URLSearchParams();
    if (userFilters.role) p.set("role", userFilters.role);
    if (userFilters.status) p.set("status", userFilters.status);
    if (userFilters.q.trim()) p.set("q", userFilters.q.trim());
    p.set("limit", "100");
    return p.toString();
  }, [userFilters]);

  // =========================
  // Requests (Solicitudes) state
  // =========================
  const [requestFilters, setRequestFilters] = useState({
    moderation_status: "pending",
    q: "",
  });

  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestBusyId, setRequestBusyId] = useState(null);
  const [requestsError, setRequestsError] = useState("");
  const [requestsFlash, setRequestsFlash] = useState("");

  const requestsQueryString = useMemo(() => {
    const p = new URLSearchParams();
    if (requestFilters.moderation_status) p.set("moderation_status", requestFilters.moderation_status);
    if (requestFilters.q.trim()) p.set("q", requestFilters.q.trim());
    p.set("limit", "200");
    return p.toString();
  }, [requestFilters]);

  const requestStats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => r.moderation_status === "pending").length;
    const approved = requests.filter((r) => r.moderation_status === "approved").length;
    const declined = requests.filter((r) => r.moderation_status === "declined").length;
    return { total, pending, approved, declined };
  }, [requests]);

  // =========================
  // Boot
  // =========================
  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        const me = await adminFetchMe();
        if (cancelled) return;
        setAdminUser(me);
      } catch {
        adminLogout();
        if (!cancelled) navigate("/admin/login", { replace: true });
        return;
      } finally {
        if (!cancelled) setIsChecking(false);
      }
    }

    boot();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // =========================
  // Providers helpers
  // =========================
  async function loadProviders() {
    setProvidersError("");
    setProvidersFlash("");
    setProvidersLoading(true);

    try {
      const data = await adminApiFetch(`/admin/providers?${providersQueryString}`, {
        method: "GET",
      });
      setProviders(Array.isArray(data?.providers) ? data.providers : []);
    } catch (err) {
      setProvidersError(err?.message || "No se pudo cargar la lista de proveedores.");
    } finally {
      setProvidersLoading(false);
    }
  }

  function updateProviderFilter(name, value) {
    setProviderFilters((prev) => ({ ...prev, [name]: value }));
  }

  async function patchProvider(userId, patch, successMsg) {
    setProviderBusyId(userId);
    setProvidersError("");
    setProvidersFlash("");

    try {
      const data = await adminApiFetch(`/admin/providers/${userId}/status`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });

      const moderation = data?.moderation;

      setProviders((prev) =>
        prev.map((p) =>
          p.user_id === userId
            ? {
                ...p,
                review_status: moderation?.review_status ?? p.review_status,
                public_visibility: moderation?.public_visibility ?? p.public_visibility,
                review_notes: moderation?.review_notes ?? p.review_notes,
                reviewed_by: moderation?.reviewed_by ?? p.reviewed_by,
                reviewed_at: moderation?.reviewed_at ?? p.reviewed_at,
                updated_at: moderation?.reviewed_at ?? p.updated_at,
              }
            : p
        )
      );

      setProvidersFlash(successMsg || "Actualizado ✅");
      setTimeout(() => loadProviders(), 150);
    } catch (err) {
      setProvidersError(err?.message || "No se pudo actualizar el proveedor.");
    } finally {
      setProviderBusyId(null);
    }
  }

  // =========================
  // Users helpers
  // =========================
  async function loadUsers() {
    setUsersError("");
    setUsersFlash("");
    setUsersLoading(true);

    try {
      const data = await adminApiFetch(`/admin/users?${usersQueryString}`, {
        method: "GET",
      });
      setUsers(Array.isArray(data?.users) ? data.users : []);
    } catch (err) {
      setUsersError(err?.message || "No se pudo cargar la lista de usuarios.");
    } finally {
      setUsersLoading(false);
    }
  }

  function updateUserFilter(name, value) {
    setUserFilters((prev) => ({ ...prev, [name]: value }));
  }

  async function patchUserStatus(userId, action, reason = "", successMsg = "") {
    setUserBusyId(userId);
    setUsersError("");
    setUsersFlash("");

    try {
      const data = await adminApiFetch(`/admin/users/${userId}/${action}`, {
        method: "PATCH",
        body: JSON.stringify(reason ? { reason } : {}),
      });

      const nextUser = data?.user;

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                account_status: nextUser?.account_status ?? u.account_status,
                blocked_at: nextUser?.blocked_at ?? u.blocked_at,
                blocked_reason:
                  nextUser?.blocked_reason !== undefined
                    ? nextUser.blocked_reason
                    : u.blocked_reason,
              }
            : u
        )
      );

      setUsersFlash(successMsg || "Usuario actualizado ✅");
      setTimeout(() => loadUsers(), 150);
    } catch (err) {
      setUsersError(err?.message || "No se pudo actualizar el usuario.");
    } finally {
      setUserBusyId(null);
    }
  }

  function handleBlockUser(userId) {
    const reason = window.prompt("Escribe el motivo del bloqueo:", "Bloqueado por administrador");
    if (reason === null) return;
    patchUserStatus(userId, "block", reason.trim(), "Usuario bloqueado ✅");
  }

  function handleUnblockUser(userId) {
    patchUserStatus(userId, "unblock", "", "Usuario desbloqueado ✅");
  }

  // =========================
  // Requests helpers
  // =========================
  function updateRequestFilter(name, value) {
    setRequestFilters((prev) => ({ ...prev, [name]: value }));
  }

  async function loadRequests() {
    setRequestsError("");
    setRequestsFlash("");
    setRequestsLoading(true);

    try {
      // Nota: este endpoint lo conectamos en el siguiente paso en server.js
      const data = await adminApiFetch(`/admin/info-requests?${requestsQueryString}`, {
        method: "GET",
      });
      setRequests(Array.isArray(data?.requests) ? data.requests : []);
    } catch (err) {
      setRequestsError(err?.message || "No se pudieron cargar las solicitudes.");
      setRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  }

  async function patchRequestModeration(requestId, patch, successMsg) {
    setRequestBusyId(requestId);
    setRequestsError("");
    setRequestsFlash("");

    try {
      // Nota: este endpoint lo conectamos en el siguiente paso en server.js
      const data = await adminApiFetch(`/admin/info-requests/${requestId}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });

      const updated = data?.request;

      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
                ...r,
                moderation_status: updated?.moderation_status ?? r.moderation_status,
                moderation_notes: updated?.moderation_notes ?? r.moderation_notes,
                moderated_by: updated?.moderated_by ?? r.moderated_by,
                moderated_at: updated?.moderated_at ?? r.moderated_at,
                updated_at: updated?.updated_at ?? r.updated_at,
              }
            : r
        )
      );

      setRequestsFlash(successMsg || "Actualizado ✅");
      setTimeout(() => loadRequests(), 150);
    } catch (err) {
      setRequestsError(err?.message || "No se pudo actualizar la solicitud.");
    } finally {
      setRequestBusyId(null);
    }
  }

  function exportRequestsCsv() {
    const today = new Date().toISOString().slice(0, 10);
    const filename = `kelom_solicitudes_${today}.csv`;

    const header = [
      "id",
      "created_at",
      "provider_id",
      "provider_label",
      "requester_user_id",
      "requester_name",
      "requester_email",
      "requester_phone",
      "preferred_contact_schedule",
      "message",
      "moderation_status",
      "moderation_notes",
      "moderated_by",
      "moderated_at",
      "provider_status",
    ];

    const rows = [
      header,
      ...requests.map((r) => {
        const providerLabel =
          r.provider_venue_name ||
          r.provider_company_name ||
          r.provider_email ||
          r.provider_id ||
          "";
        return [
          r.id || "",
          r.created_at || "",
          r.provider_id || "",
          providerLabel,
          r.requester_user_id || "",
          r.requester_name || "",
          r.requester_email || "",
          r.requester_phone || "",
          r.preferred_contact_schedule || "",
          r.message || "",
          r.moderation_status || "",
          r.moderation_notes || "",
          r.moderated_by || "",
          r.moderated_at || "",
          r.provider_status || "",
        ];
      }),
    ];

    downloadCsv(filename, rows);
    setRequestsFlash("Archivo CSV generado ✅ (Excel lo abre directo)");
  }

  function handleApproveRequest(id) {
    const note = window.prompt("Nota (opcional) para auditoría:", "Aprobada por admin");
    if (note === null) return;

    patchRequestModeration(
      id,
      { moderation_status: "approved", moderation_notes: note.trim() },
      "Solicitud aprobada ✅"
    );
  }

  function handleDeclineRequest(id) {
    const note = window.prompt(
      "Motivo de declinación (recomendado):",
      "Declinada por políticas de la empresa"
    );
    if (note === null) return;

    patchRequestModeration(
      id,
      { moderation_status: "declined", moderation_notes: note.trim() },
      "Solicitud declinada ✅"
    );
  }

  // =========================
  // Effects by section
  // =========================
  useEffect(() => {
    if (isChecking) return;
    if (activeSection !== "providers") return;
    loadProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChecking, activeSection, providersQueryString]);

  useEffect(() => {
    if (isChecking) return;
    if (activeSection !== "users") return;
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChecking, activeSection, usersQueryString]);

  useEffect(() => {
    if (isChecking) return;
    if (activeSection !== "requests") return;
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChecking, activeSection, requestsQueryString]);

  function handleLogout() {
    adminLogout();
    navigate("/", { replace: true });
  }

  if (isChecking) {
    return (
      <div className="admin">
        <div className="admin__container">
          <div className="admin-card">
            <p>Verificando sesión admin…</p>
          </div>
        </div>
      </div>
    );
  }

  const refreshHandler =
    activeSection === "providers"
      ? loadProviders
      : activeSection === "users"
      ? loadUsers
      : loadRequests;

  const refreshDisabled =
    activeSection === "providers"
      ? providersLoading
      : activeSection === "users"
      ? usersLoading
      : requestsLoading;

  return (
    <div className="admin">
      <div className="admin__topbar">
        <div className="admin__topbar-inner">
          <div className="admin__brand">
            <div className="admin__title">Kelom Admin</div>
            <div className="admin__subtitle">
              Sesión: <strong>{adminUser?.email}</strong> ({adminUser?.admin_tier})
            </div>
          </div>

          <div className="admin__topbar-actions">
            <button className="btn btn--ghost" onClick={refreshHandler} disabled={refreshDisabled}>
              {refreshDisabled ? "Cargando…" : "Refrescar"}
            </button>

            <button className="btn btn--primary" onClick={handleLogout}>
              Salir
            </button>
          </div>
        </div>
      </div>

      <div className="admin__container">
        <div className="admin-card admin-card--filters">
          <div
            className="admin-actions"
            style={{ marginBottom: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}
          >
            <button
              className={activeSection === "providers" ? "btn btn--primary" : "btn btn--ghost"}
              onClick={() => setActiveSection("providers")}
            >
              Proveedores
            </button>

            <button
              className={activeSection === "users" ? "btn btn--primary" : "btn btn--ghost"}
              onClick={() => setActiveSection("users")}
            >
              Usuarios
            </button>

            <button
              className={activeSection === "requests" ? "btn btn--primary" : "btn btn--ghost"}
              onClick={() => setActiveSection("requests")}
            >
              Solicitudes
            </button>

            {activeSection === "requests" && (
              <button className="btn btn--ghost" onClick={exportRequestsCsv} disabled={requestsLoading}>
                Exportar Excel
              </button>
            )}
          </div>

          {activeSection === "providers" ? (
            <>
              <div className="admin-filters">
                <div className="admin-filters__group">
                  <label className="admin-filters__label">Estatus</label>
                  <select
                    className="admin-filters__select"
                    value={providerFilters.review_status}
                    onChange={(e) => updateProviderFilter("review_status", e.target.value)}
                  >
                    {REVIEW_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-filters__group">
                  <label className="admin-filters__label">Visibilidad</label>
                  <select
                    className="admin-filters__select"
                    value={providerFilters.visibility}
                    onChange={(e) => updateProviderFilter("visibility", e.target.value)}
                  >
                    {VISIBILITIES.map((v) => (
                      <option key={v.value} value={v.value}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-filters__group admin-filters__group--search">
                  <label className="admin-filters__label">Buscar</label>
                  <input
                    className="admin-filters__input"
                    value={providerFilters.q}
                    onChange={(e) => updateProviderFilter("q", e.target.value)}
                    placeholder="email / venue / company"
                  />
                </div>
              </div>

              {providersError && <div className="admin-alert admin-alert--error">{providersError}</div>}
              {providersFlash && <div className="admin-alert admin-alert--ok">{providersFlash}</div>}
            </>
          ) : activeSection === "users" ? (
            <>
              <div className="admin-filters">
                <div className="admin-filters__group">
                  <label className="admin-filters__label">Rol</label>
                  <select
                    className="admin-filters__select"
                    value={userFilters.role}
                    onChange={(e) => updateUserFilter("role", e.target.value)}
                  >
                    {USER_ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-filters__group">
                  <label className="admin-filters__label">Estado</label>
                  <select
                    className="admin-filters__select"
                    value={userFilters.status}
                    onChange={(e) => updateUserFilter("status", e.target.value)}
                  >
                    {USER_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-filters__group admin-filters__group--search">
                  <label className="admin-filters__label">Buscar</label>
                  <input
                    className="admin-filters__input"
                    value={userFilters.q}
                    onChange={(e) => updateUserFilter("q", e.target.value)}
                    placeholder="email / nombre"
                  />
                </div>
              </div>

              {usersError && <div className="admin-alert admin-alert--error">{usersError}</div>}
              {usersFlash && <div className="admin-alert admin-alert--ok">{usersFlash}</div>}
            </>
          ) : (
            <>
              <div className="admin-filters">
                <div className="admin-filters__group">
                  <label className="admin-filters__label">Estatus</label>
                  <select
                    className="admin-filters__select"
                    value={requestFilters.moderation_status}
                    onChange={(e) => updateRequestFilter("moderation_status", e.target.value)}
                  >
                    {REQUEST_MOD_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-filters__group admin-filters__group--search">
                  <label className="admin-filters__label">Buscar</label>
                  <input
                    className="admin-filters__input"
                    value={requestFilters.q}
                    onChange={(e) => updateRequestFilter("q", e.target.value)}
                    placeholder="correo / nombre / mensaje / proveedor"
                  />
                </div>

                <div className="admin-filters__group" style={{ minWidth: 260 }}>
                  <label className="admin-filters__label">Métricas</label>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    <span className="admin-badge admin-badge--muted">Total: {requestStats.total}</span>
                    <span className="admin-badge admin-badge--warn">Pend: {requestStats.pending}</span>
                    <span className="admin-badge admin-badge--ok">Apr: {requestStats.approved}</span>
                    <span className="admin-badge admin-badge--bad">Dec: {requestStats.declined}</span>
                  </div>
                </div>
              </div>

              {requestsError && <div className="admin-alert admin-alert--error">{requestsError}</div>}
              {requestsFlash && <div className="admin-alert admin-alert--ok">{requestsFlash}</div>}
            </>
          )}
        </div>

        {activeSection === "providers" ? (
          <div className="admin-card">
            <div className="admin-table__header">
              <h1 className="admin-table__title">Proveedores</h1>
              <div className="admin-table__meta">
                Mostrando: <strong>{providers.length}</strong>
              </div>
            </div>

            <div className="admin-table__wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Proveedor</th>
                    <th>Estatus</th>
                    <th>Visibilidad</th>
                    <th>Notas</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {providers.map((p) => {
                    const isBusy = providerBusyId === p.user_id;

                    return (
                      <tr key={p.user_id}>
                        <td>
                          <div className="admin-provider">
                            <div className="admin-provider__main">
                              <div className="admin-provider__name">
                                {p.venue_name || p.company_name || "—"}
                              </div>

                              <div className="admin-provider__sub">
                                <span>{p.email}</span>
                                {p.phone ? <span className="admin-provider__dot">•</span> : null}
                                {p.phone ? <span>{p.phone}</span> : null}
                              </div>
                            </div>

                            <div className="admin-provider__meta">
                              <div className="admin-provider__id">ID: {p.user_id}</div>
                              {p.reviewed_at ? (
                                <div className="admin-provider__review">
                                  Revisado: {new Date(p.reviewed_at).toLocaleString()}
                                </div>
                              ) : (
                                <div className="admin-provider__review">Aún no revisado</div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className={badgeClass("review", p.review_status)}>{p.review_status}</span>
                        </td>

                        <td>
                          <span className={badgeClass("visibility", p.public_visibility)}>
                            {p.public_visibility}
                          </span>
                        </td>

                        <td style={{ minWidth: 260 }}>
                          <textarea
                            className="admin-notes"
                            defaultValue={p.review_notes || ""}
                            placeholder="Notas internas…"
                            disabled={isBusy}
                            onBlur={(e) => {
                              const next = e.target.value.trim();
                              if ((p.review_notes || "") !== next) {
                                patchProvider(p.user_id, { review_notes: next }, "Notas guardadas ✅");
                              }
                            }}
                          />
                          <div className="admin-notes__hint">Tip: se guarda al perder foco.</div>
                        </td>

                        <td style={{ minWidth: 260 }}>
                          <div className="admin-actions">
                            <button
                              className="btn btn--primary"
                              disabled={isBusy}
                              onClick={() =>
                                patchProvider(
                                  p.user_id,
                                  { review_status: "approved", public_visibility: "listed" },
                                  "Aprobado y publicado ✅"
                                )
                              }
                            >
                              {isBusy ? "…" : "Aprobar + publicar"}
                            </button>

                            <button
                              className="btn btn--ghost"
                              disabled={isBusy}
                              onClick={() => patchProvider(p.user_id, { public_visibility: "hidden" }, "Ocultado ✅")}
                            >
                              Ocultar
                            </button>

                            <button
                              className="btn btn--ghost"
                              disabled={isBusy}
                              onClick={() =>
                                patchProvider(
                                  p.user_id,
                                  { review_status: "needs_changes", public_visibility: "hidden" },
                                  "Marcado: necesita cambios ✅"
                                )
                              }
                            >
                              Pedir cambios
                            </button>

                            <button
                              className="btn btn--ghost"
                              disabled={isBusy}
                              onClick={() =>
                                patchProvider(
                                  p.user_id,
                                  { review_status: "suspended", public_visibility: "hidden" },
                                  "Suspendido ✅"
                                )
                              }
                            >
                              Suspender
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {!providers.length && (
                    <tr>
                      <td colSpan={5} style={{ padding: "1rem" }}>
                        {providersLoading ? "Cargando…" : "No hay resultados con estos filtros."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="admin-footer-note">
              Nota: el público solo ve proveedores <strong>approved + listed</strong>. Todo lo demás es invisible.
            </div>
          </div>
        ) : activeSection === "users" ? (
          <div className="admin-card">
            <div className="admin-table__header">
              <h1 className="admin-table__title">Usuarios</h1>
              <div className="admin-table__meta">
                Mostrando: <strong>{users.length}</strong>
              </div>
            </div>

            <div className="admin-table__wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Bloqueo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((u) => {
                    const isBusy = userBusyId === u.id;
                    const isSelf = u.id === adminUser?.id;
                    const isBlocked = u.account_status === "blocked";

                    return (
                      <tr key={u.id}>
                        <td>
                          <div className="admin-provider">
                            <div className="admin-provider__main">
                              <div className="admin-provider__name">{u.name || "Sin nombre"}</div>
                              <div className="admin-provider__sub">
                                <span>{u.email}</span>
                                {u.admin_tier ? (
                                  <>
                                    <span className="admin-provider__dot">•</span>
                                    <span>tier: {u.admin_tier}</span>
                                  </>
                                ) : null}
                              </div>
                            </div>

                            <div className="admin-provider__meta">
                              <div className="admin-provider__id">ID: {u.id}</div>
                              <div className="admin-provider__review">
                                Creado: {new Date(u.created_at).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className={badgeClass("role", u.role)}>{u.role}</span>
                        </td>

                        <td>
                          <span className={badgeClass("user-status", u.account_status)}>{u.account_status}</span>
                        </td>

                        <td style={{ minWidth: 240 }}>
                          {u.account_status === "blocked" ? (
                            <div>
                              <div>
                                <strong>Motivo:</strong> {u.blocked_reason || "—"}
                              </div>
                              <div className="admin-provider__review">
                                {u.blocked_at ? `Bloqueado: ${new Date(u.blocked_at).toLocaleString()}` : "Bloqueado"}
                              </div>
                            </div>
                          ) : (
                            <span style={{ opacity: 0.7 }}>Sin bloqueo</span>
                          )}
                        </td>

                        <td style={{ minWidth: 220 }}>
                          <div className="admin-actions">
                            {!isBlocked ? (
                              <button
                                className="btn btn--ghost"
                                disabled={isBusy || isSelf}
                                onClick={() => handleBlockUser(u.id)}
                                title={isSelf ? "No puedes bloquearte a ti mismo" : ""}
                              >
                                {isBusy ? "…" : "Bloquear"}
                              </button>
                            ) : (
                              <button className="btn btn--primary" disabled={isBusy} onClick={() => handleUnblockUser(u.id)}>
                                {isBusy ? "…" : "Desbloquear"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {!users.length && (
                    <tr>
                      <td colSpan={5} style={{ padding: "1rem" }}>
                        {usersLoading ? "Cargando…" : "No hay resultados con estos filtros."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="admin-footer-note">
              Nota: bloquear un usuario evita su acceso autenticado mientras su <strong>account_status</strong> sea{" "}
              <strong>blocked</strong>.
            </div>
          </div>
        ) : (
          <div className="admin-card">
            <div className="admin-table__header">
              <h1 className="admin-table__title">Solicitudes de información</h1>
              <div className="admin-table__meta">
                Mostrando: <strong>{requests.length}</strong>
              </div>
            </div>

            <div className="admin-table__wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Proveedor</th>
                    <th>Solicitante</th>
                    <th>Moderación</th>
                    <th>Estado proveedor</th>
                    <th>Mensaje</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {requests.map((r) => {
                    const isBusy = requestBusyId === r.id;

                    const providerLabel =
                      r.provider_venue_name ||
                      r.provider_company_name ||
                      r.provider_email ||
                      r.provider_id ||
                      "—";

                    const requesterLabel =
                      r.requester_name ||
                      r.requester_email ||
                      r.requester_user_id ||
                      "—";

                    return (
                      <tr key={r.id}>
                        <td style={{ whiteSpace: "nowrap" }}>{formatDateTime(r.created_at)}</td>

                        <td style={{ minWidth: 220 }}>
                          <div style={{ display: "grid", gap: 4 }}>
                            <div style={{ fontWeight: 600 }}>{providerLabel}</div>
                            <div style={{ opacity: 0.75, fontSize: 12 }}>ID: {r.provider_id}</div>
                          </div>
                        </td>

                        <td style={{ minWidth: 220 }}>
                          <div style={{ display: "grid", gap: 4 }}>
                            <div style={{ fontWeight: 600 }}>{requesterLabel}</div>
                            <div style={{ opacity: 0.85, fontSize: 12 }}>
                              {r.requester_email ? r.requester_email : "—"}
                              {r.requester_phone ? ` • ${r.requester_phone}` : ""}
                            </div>
                            <div style={{ opacity: 0.75, fontSize: 12 }}>
                              Horario: {r.preferred_contact_schedule || "—"}
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className={badgeClass("request-mod", r.moderation_status)}>
                            {r.moderation_status}
                          </span>
                          {r.moderated_at ? (
                            <div style={{ opacity: 0.7, fontSize: 12, marginTop: 4 }}>
                              {formatDateTime(r.moderated_at)}
                            </div>
                          ) : null}
                        </td>

                        <td>
                          <span className={badgeClass("request-provider-status", r.provider_status)}>
                            {r.provider_status}
                          </span>
                        </td>

                        <td style={{ minWidth: 320 }}>
                          <div style={{ display: "grid", gap: 6 }}>
                            <div style={{ color: "rgba(0,0,0,0.75)" }}>{r.message}</div>
                            {r.moderation_notes ? (
                              <div style={{ opacity: 0.75, fontSize: 12 }}>
                                Nota: {r.moderation_notes}
                              </div>
                            ) : null}
                          </div>
                        </td>

                        <td style={{ minWidth: 220 }}>
                          <div className="admin-actions">
                            <button
                              className="btn btn--primary"
                              disabled={isBusy || r.moderation_status === "approved"}
                              onClick={() => handleApproveRequest(r.id)}
                            >
                              {isBusy ? "…" : "Aprobar"}
                            </button>

                            <button
                              className="btn btn--ghost"
                              disabled={isBusy || r.moderation_status === "declined"}
                              onClick={() => handleDeclineRequest(r.id)}
                            >
                              Declinar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {!requests.length && (
                    <tr>
                      <td colSpan={7} style={{ padding: "1rem" }}>
                        {requestsLoading ? "Cargando…" : "No hay solicitudes con estos filtros."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="admin-footer-note">
              Nota: aquí solo estamos preparando el panel. En el siguiente paso conectamos los endpoints del backend para
              que la lista cargue y puedas aprobar/declinar de verdad.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboardPage;