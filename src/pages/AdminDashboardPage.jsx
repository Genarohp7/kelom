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

  return "admin-badge";
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
    const reason = window.prompt(
      "Escribe el motivo del bloqueo:",
      "Bloqueado por administrador"
    );

    if (reason === null) return;

    patchUserStatus(userId, "block", reason.trim(), "Usuario bloqueado ✅");
  }

  function handleUnblockUser(userId) {
    patchUserStatus(userId, "unblock", "", "Usuario desbloqueado ✅");
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
            {activeSection === "providers" ? (
              <button
                className="btn btn--ghost"
                onClick={loadProviders}
                disabled={providersLoading}
              >
                {providersLoading ? "Cargando…" : "Refrescar"}
              </button>
            ) : (
              <button className="btn btn--ghost" onClick={loadUsers} disabled={usersLoading}>
                {usersLoading ? "Cargando…" : "Refrescar"}
              </button>
            )}

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
          ) : (
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
                          <span className={badgeClass("review", p.review_status)}>
                            {p.review_status}
                          </span>
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
                                patchProvider(
                                  p.user_id,
                                  { review_notes: next },
                                  "Notas guardadas ✅"
                                );
                              }
                            }}
                          />
                          <div className="admin-notes__hint">
                            Tip: se guarda al perder foco.
                          </div>
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
                              onClick={() =>
                                patchProvider(
                                  p.user_id,
                                  { public_visibility: "hidden" },
                                  "Ocultado ✅"
                                )
                              }
                            >
                              Ocultar
                            </button>

                            <button
                              className="btn btn--ghost"
                              disabled={isBusy}
                              onClick={() =>
                                patchProvider(
                                  p.user_id,
                                  {
                                    review_status: "needs_changes",
                                    public_visibility: "hidden",
                                  },
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
                                  {
                                    review_status: "suspended",
                                    public_visibility: "hidden",
                                  },
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
              Nota: el público solo ve proveedores <strong>approved + listed</strong>. Todo lo
              demás es invisible.
            </div>
          </div>
        ) : (
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
                          <span className={badgeClass("user-status", u.account_status)}>
                            {u.account_status}
                          </span>
                        </td>

                        <td style={{ minWidth: 240 }}>
                          {u.account_status === "blocked" ? (
                            <div>
                              <div>
                                <strong>Motivo:</strong> {u.blocked_reason || "—"}
                              </div>
                              <div className="admin-provider__review">
                                {u.blocked_at
                                  ? `Bloqueado: ${new Date(u.blocked_at).toLocaleString()}`
                                  : "Bloqueado"}
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
                              <button
                                className="btn btn--primary"
                                disabled={isBusy}
                                onClick={() => handleUnblockUser(u.id)}
                              >
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
              Nota: bloquear un usuario evita su acceso autenticado mientras su{" "}
              <strong>account_status</strong> sea <strong>blocked</strong>.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboardPage;