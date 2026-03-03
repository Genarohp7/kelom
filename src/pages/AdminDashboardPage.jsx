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
  return "admin-badge";
}

function AdminDashboardPage() {
  const navigate = useNavigate();

  const [adminUser, setAdminUser] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  const [filters, setFilters] = useState({
    review_status: "pending_review",
    visibility: "",
    q: "",
  });

  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (filters.review_status) p.set("review_status", filters.review_status);
    if (filters.visibility) p.set("visibility", filters.visibility);
    if (filters.q.trim()) p.set("q", filters.q.trim());
    p.set("limit", "100");
    return p.toString();
  }, [filters]);

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

  async function loadProviders() {
    setError("");
    setFlash("");
    setLoading(true);
    try {
      const data = await adminApiFetch(`/admin/providers?${queryString}`, { method: "GET" });
      setProviders(Array.isArray(data?.providers) ? data.providers : []);
    } catch (err) {
      setError(err?.message || "No se pudo cargar la lista.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isChecking) return;
    loadProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChecking, queryString]);

  function updateFilter(name, value) {
    setFilters((p) => ({ ...p, [name]: value }));
  }

  async function patchProvider(userId, patch, successMsg) {
    setBusyId(userId);
    setError("");
    setFlash("");
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

      setFlash(successMsg || "Actualizado ✅");
      // si el filtro actual ya no aplica, recarga para limpiar la tabla
      setTimeout(() => loadProviders(), 150);
    } catch (err) {
      setError(err?.message || "No se pudo actualizar.");
    } finally {
      setBusyId(null);
    }
  }

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
            <button className="btn btn--ghost" onClick={loadProviders} disabled={loading}>
              {loading ? "Cargando…" : "Refrescar"}
            </button>
            <button className="btn btn--primary" onClick={handleLogout}>
              Salir
            </button>
          </div>
        </div>
      </div>

      <div className="admin__container">
        <div className="admin-card admin-card--filters">
          <div className="admin-filters">
            <div className="admin-filters__group">
              <label className="admin-filters__label">Estatus</label>
              <select
                className="admin-filters__select"
                value={filters.review_status}
                onChange={(e) => updateFilter("review_status", e.target.value)}
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
                value={filters.visibility}
                onChange={(e) => updateFilter("visibility", e.target.value)}
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
                value={filters.q}
                onChange={(e) => updateFilter("q", e.target.value)}
                placeholder="email / venue / company"
              />
            </div>
          </div>

          {error && <div className="admin-alert admin-alert--error">{error}</div>}
          {flash && <div className="admin-alert admin-alert--ok">{flash}</div>}
        </div>

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
                  const isBusy = busyId === p.user_id;

                  return (
                    <tr key={p.user_id}>
                      <td>
                        <div className="admin-provider">
                          <div className="admin-provider__main">
                            <div className="admin-provider__name">{p.venue_name || p.company_name || "—"}</div>
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
                              patchProvider(
                                p.user_id,
                                { review_notes: next },
                                "Notas guardadas ✅"
                              );
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
                      {loading ? "Cargando…" : "No hay resultados con estos filtros."}
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
      </div>
    </div>
  );
}

export default AdminDashboardPage;