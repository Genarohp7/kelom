import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminFetchMe, adminLogout } from "../utils/adminAuth.js";
import { adminApiFetch } from "../services/adminApi.js";
import {
  sendProviderApprovedInfoRequestEmail,
  sendUserDeclinedInfoRequestEmail,
} from "../services/emailjsService.js";

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
  { value: "pending", label: "Pendientes" },
  { value: "approved", label: "Aprobadas" },
  { value: "declined", label: "Declinadas" },
  { value: "", label: "Todas" },
];

const INVITATION_STATUSES = [
  { value: "issued", label: "Emitidas" },
  { value: "used", label: "Usadas" },
  { value: "cancelled", label: "Canceladas" },
  { value: "expired", label: "Expiradas" },
  { value: "", label: "Todas" },
];

const SECTION_ITEMS = [
  {
    key: "providers",
    title: "Proveedores",
    description: "Moderación, visibilidad y modalidad premium.",
  },
  {
    key: "users",
    title: "Usuarios",
    description: "Roles, estado de cuenta y bloqueos.",
  },
  {
    key: "requests",
    title: "Solicitudes",
    description: "Moderación y seguimiento de leads.",
  },
  {
    key: "invitations",
    title: "Invitaciones",
    description: "Accesos controlados para proveedores.",
  },
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

  if (kind === "featured") {
    if (value === true || v === "true") return "admin-badge admin-badge--ok";
    return "admin-badge admin-badge--muted";
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

  if (kind === "moderation") {
    if (v === "approved") return "admin-badge admin-badge--ok";
    if (v === "pending") return "admin-badge admin-badge--warn";
    if (v === "declined") return "admin-badge admin-badge--bad";
    return "admin-badge";
  }

  if (kind === "provider-status") {
    if (v === "sin_atender") return "admin-badge admin-badge--warn";
    if (v === "pendiente") return "admin-badge admin-badge--info";
    if (v === "atendida") return "admin-badge admin-badge--ok";
    if (v === "cerrada") return "admin-badge admin-badge--muted";
    return "admin-badge";
  }

  if (kind === "invitation-status") {
    if (v === "issued") return "admin-badge admin-badge--warn";
    if (v === "used") return "admin-badge admin-badge--ok";
    if (v === "cancelled") return "admin-badge admin-badge--bad";
    if (v === "expired") return "admin-badge admin-badge--muted";
    return "admin-badge";
  }

  return "admin-badge";
}

function formatDateTime(v) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleString();
  } catch {
    return "—";
  }
}

function getProviderLabel(requestItem) {
  return (
    requestItem?.provider_venue_name ||
    requestItem?.provider_company_name ||
    (requestItem?.provider_id ? `ID: ${requestItem.provider_id}` : "Proveedor")
  );
}

function csvEscape(value) {
  const s = value === null || value === undefined ? "" : String(value);
  const needsQuotes = /[",\n\r]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

function downloadTextFile({ filename, content, mime = "text/csv;charset=utf-8;" }) {
  const bom = "\ufeff";
  const blob = new Blob([bom + content], { type: mime });
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

  const [requestFilters, setRequestFilters] = useState({
    moderation_status: "pending",
    q: "",
  });

  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestBusyId, setRequestBusyId] = useState(null);
  const [requestsError, setRequestsError] = useState("");
  const [requestsFlash, setRequestsFlash] = useState("");

  const [requestStats, setRequestStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    declined: 0,
  });

  const [isExporting, setIsExporting] = useState(false);

  const requestsQueryString = useMemo(() => {
    const p = new URLSearchParams();
    if (requestFilters.moderation_status) p.set("moderation_status", requestFilters.moderation_status);
    if (requestFilters.q.trim()) p.set("q", requestFilters.q.trim());
    p.set("limit", "100");
    return p.toString();
  }, [requestFilters]);

  const [invitationFilters, setInvitationFilters] = useState({
    status: "issued",
    q: "",
  });

  const [invitations, setInvitations] = useState([]);
  const [invitationsLoading, setInvitationsLoading] = useState(false);
  const [invitationBusyId, setInvitationBusyId] = useState(null);
  const [invitationsError, setInvitationsError] = useState("");
  const [invitationsFlash, setInvitationsFlash] = useState("");
  const [isCreatingInvitation, setIsCreatingInvitation] = useState(false);
  const [lastGeneratedInvitationLink, setLastGeneratedInvitationLink] = useState("");
  const [invitationContextBusyId, setInvitationContextBusyId] = useState(null);

  const [invitationForm, setInvitationForm] = useState({
    notes: "",
    expires_in_days: "",
  });

  const invitationsQueryString = useMemo(() => {
    const p = new URLSearchParams();
    if (invitationFilters.status) p.set("status", invitationFilters.status);
    if (invitationFilters.q.trim()) p.set("q", invitationFilters.q.trim());
    p.set("limit", "100");
    return p.toString();
  }, [invitationFilters]);

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
                is_featured:
                  moderation?.is_featured !== undefined
                    ? moderation.is_featured
                    : p.is_featured,
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

  function updateRequestFilter(name, value) {
    setRequestFilters((prev) => ({ ...prev, [name]: value }));
  }

  async function loadRequestStats() {
    try {
      const data = await adminApiFetch("/admin/info-requests/stats", { method: "GET" });
      setRequestStats({
        total: Number(data?.total || 0),
        pending: Number(data?.pending || 0),
        approved: Number(data?.approved || 0),
        declined: Number(data?.declined || 0),
      });
    } catch {
      setRequestStats((prev) => ({ ...prev }));
    }
  }

  async function loadRequests() {
    setRequestsError("");
    setRequestsFlash("");
    setRequestsLoading(true);

    try {
      const data = await adminApiFetch(`/admin/info-requests?${requestsQueryString}`, {
        method: "GET",
      });
      setRequests(Array.isArray(data?.requests) ? data.requests : []);
      await loadRequestStats();
    } catch (err) {
      setRequestsError(err?.message || "No se pudo cargar la lista de solicitudes.");
    } finally {
      setRequestsLoading(false);
    }
  }

  async function moderateRequest(requestId, moderation_status) {
    const notes = window.prompt(
      moderation_status === "approved"
        ? "Notas opcionales (por qué se aprueba):"
        : "Motivo/nota (recomendado) para declinar:",
      ""
    );

    if (notes === null) return;

    setRequestBusyId(requestId);
    setRequestsError("");
    setRequestsFlash("");

    try {
      const currentRequest = requests.find((r) => r.id === requestId) || null;

      const data = await adminApiFetch(`/admin/info-requests/${requestId}/moderate`, {
        method: "PATCH",
        body: JSON.stringify({
          moderation_status,
          moderation_notes: String(notes || "").trim() || null,
        }),
      });

      const updated = data?.request;

      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
                ...r,
                moderation_status: updated?.moderation_status ?? r.moderation_status,
                moderated_by: updated?.moderated_by ?? r.moderated_by,
                moderated_at: updated?.moderated_at ?? r.moderated_at,
                moderation_notes: updated?.moderation_notes ?? r.moderation_notes,
                updated_at: updated?.updated_at ?? r.updated_at,
              }
            : r
        )
      );

      let emailWarning = "";

      if (currentRequest) {
        try {
          if (moderation_status === "approved") {
            if (!currentRequest.provider_email) {
              emailWarning =
                " La moderación sí se guardó, pero no se envió correo porque el proveedor no tiene email disponible.";
            } else {
              await sendProviderApprovedInfoRequestEmail({
                providerName: getProviderLabel(currentRequest),
                providerEmail: currentRequest.provider_email,
                isFeatured: Boolean(currentRequest.provider_is_featured),
                requesterName: currentRequest.requester_name || "",
                requesterEmail: currentRequest.requester_email || "",
                requesterPhone: currentRequest.requester_phone || "",
                preferredContactSchedule: currentRequest.preferred_contact_schedule || "",
                message: currentRequest.message || "",
              });
            }
          }

          if (moderation_status === "declined") {
            if (!currentRequest.requester_email) {
              emailWarning =
                " La moderación sí se guardó, pero no se envió correo porque el usuario no tiene email disponible.";
            } else {
              await sendUserDeclinedInfoRequestEmail({
                requesterName: currentRequest.requester_name || "",
                requesterEmail: currentRequest.requester_email,
                providerName: getProviderLabel(currentRequest),
              });
            }
          }
        } catch (emailErr) {
          emailWarning = ` La moderación sí se guardó, pero falló el correo: ${
            emailErr?.message || "Error desconocido"
          }`;
        }
      }

      setRequestsFlash(
        moderation_status === "approved"
          ? `Solicitud aprobada ✅${emailWarning}`
          : `Solicitud declinada ✅${emailWarning}`
      );

      setTimeout(() => loadRequests(), 150);
    } catch (err) {
      setRequestsError(err?.message || "No se pudo moderar la solicitud.");
    } finally {
      setRequestBusyId(null);
    }
  }

  async function fetchAllRequestsForExport() {
    const limit = 200;
    let offset = 0;
    const all = [];

    const baseParams = new URLSearchParams();
    if (requestFilters.moderation_status) baseParams.set("moderation_status", requestFilters.moderation_status);
    if (requestFilters.q.trim()) baseParams.set("q", requestFilters.q.trim());

    const MAX_ROWS = 20000;

    while (true) {
      const p = new URLSearchParams(baseParams);
      p.set("limit", String(limit));
      p.set("offset", String(offset));

      const data = await adminApiFetch(`/admin/info-requests?${p.toString()}`, { method: "GET" });
      const rows = Array.isArray(data?.requests) ? data.requests : [];

      all.push(...rows);

      if (rows.length < limit) break;
      offset += limit;

      if (all.length >= MAX_ROWS) break;
    }

    return all.slice(0, MAX_ROWS);
  }

  async function handleExportExcel() {
    if (activeSection !== "requests") return;

    setRequestsError("");
    setRequestsFlash("");

    setIsExporting(true);
    try {
      const rows = await fetchAllRequestsForExport();

      const headers = [
        "request_id",
        "created_at",
        "provider_label",
        "provider_id",
        "provider_is_featured",
        "requester_name",
        "requester_email",
        "requester_phone",
        "preferred_contact_schedule",
        "message",
        "moderation_status",
        "moderated_at",
        "moderation_notes",
        "provider_status",
      ];

      const lines = [];
      lines.push(headers.map(csvEscape).join(","));

      for (const r of rows) {
        const providerLabel =
          r.provider_venue_name ||
          r.provider_company_name ||
          (r.provider_id ? `ID: ${r.provider_id}` : "—");

        const row = [
          r.id,
          r.created_at,
          providerLabel,
          r.provider_id,
          r.provider_is_featured ? "true" : "false",
          r.requester_name || "",
          r.requester_email || "",
          r.requester_phone || "",
          r.preferred_contact_schedule || "",
          r.message || "",
          r.moderation_status || "",
          r.moderated_at || "",
          r.moderation_notes || "",
          r.provider_status || "",
        ];

        lines.push(row.map(csvEscape).join(","));
      }

      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, "0");
      const d = String(today.getDate()).padStart(2, "0");

      const fileName = `kelom_solicitudes_${y}-${m}-${d}.csv`;

      downloadTextFile({
        filename: fileName,
        content: lines.join("\n"),
        mime: "text/csv;charset=utf-8;",
      });

      setRequestsFlash(`Exportado ✅ (${rows.length} solicitudes)`);
    } catch (err) {
      setRequestsError(err?.message || "No se pudo exportar.");
    } finally {
      setIsExporting(false);
    }
  }

  function updateInvitationFilter(name, value) {
    setInvitationFilters((prev) => ({ ...prev, [name]: value }));
  }

  function updateInvitationForm(name, value) {
    setInvitationForm((prev) => ({ ...prev, [name]: value }));
  }

  async function loadInvitations() {
    setInvitationsError("");
    setInvitationsFlash("");
    setInvitationsLoading(true);

    try {
      const data = await adminApiFetch(`/admin/provider-invitations?${invitationsQueryString}`, {
        method: "GET",
      });
      setInvitations(Array.isArray(data?.invitations) ? data.invitations : []);
    } catch (err) {
      setInvitationsError(err?.message || "No se pudo cargar la lista de invitaciones.");
    } finally {
      setInvitationsLoading(false);
    }
  }

  async function handleCreateInvitation(e) {
    e.preventDefault();
    if (isCreatingInvitation) return;

    setInvitationsError("");
    setInvitationsFlash("");
    setLastGeneratedInvitationLink("");

    const notes = String(invitationForm.notes || "").trim();
    const expiresRaw = String(invitationForm.expires_in_days || "").trim();

    let expires_in_days = null;
    if (expiresRaw) {
      const parsed = Number(expiresRaw);
      if (!Number.isFinite(parsed) || parsed < 1 || parsed > 365) {
        setInvitationsError("La expiración debe ser un número entre 1 y 365 días.");
        return;
      }
      expires_in_days = parsed;
    }

    setIsCreatingInvitation(true);

    try {
      const data = await adminApiFetch("/admin/provider-invitations", {
        method: "POST",
        body: JSON.stringify({
          notes: notes || null,
          expires_in_days,
        }),
      });

      const invitation = data?.invitation || null;
      const rawToken =
        data?.raw_token || data?.token || data?.plain_token || data?.invitation_token || "";

      const nextLink = rawToken
        ? `${window.location.origin}/proveedores/invitacion/${rawToken}`
        : "";

      if (invitation) {
        setInvitations((prev) => [invitation, ...prev]);
      }

      setInvitationForm({
        notes: "",
        expires_in_days: "",
      });

      setLastGeneratedInvitationLink(nextLink);
      setInvitationsFlash(
        nextLink
          ? "Invitación creada ✅ Copia el enlace ahora, porque el token no volverá a mostrarse."
          : "Invitación creada ✅"
      );

      setTimeout(() => loadInvitations(), 150);
    } catch (err) {
      setInvitationsError(err?.message || "No se pudo crear la invitación.");
    } finally {
      setIsCreatingInvitation(false);
    }
  }

  async function handleCancelInvitation(invitationId) {
    const ok = window.confirm("¿Cancelar esta invitación? El enlace dejará de servir.");
    if (!ok) return;

    setInvitationBusyId(invitationId);
    setInvitationsError("");
    setInvitationsFlash("");

    try {
      const data = await adminApiFetch(`/admin/provider-invitations/${invitationId}/cancel`, {
        method: "PATCH",
        body: JSON.stringify({}),
      });

      const updatedInvitation = data?.invitation || null;

      setInvitations((prev) =>
        prev.map((inv) =>
          inv.id === invitationId
            ? {
                ...inv,
                status: updatedInvitation?.status ?? "cancelled",
                updated_at: updatedInvitation?.updated_at ?? inv.updated_at,
              }
            : inv
        )
      );

      setInvitationsFlash("Invitación cancelada ✅");
      setTimeout(() => loadInvitations(), 150);
    } catch (err) {
      setInvitationsError(err?.message || "No se pudo cancelar la invitación.");
    } finally {
      setInvitationBusyId(null);
    }
  }

  async function handleCopyInvitationLink() {
    if (!lastGeneratedInvitationLink) return;

    try {
      await navigator.clipboard.writeText(lastGeneratedInvitationLink);
      setInvitationsFlash("Enlace copiado ✅");
    } catch {
      setInvitationsFlash("No se pudo copiar automáticamente. Copia el enlace manualmente.");
    }
  }

  async function handleContinueProviderProfile(invitationId) {
    setInvitationContextBusyId(invitationId);
    setInvitationsError("");
    setInvitationsFlash("");

    try {
      const data = await adminApiFetch(`/admin/provider-invitations/${invitationId}/context`, {
        method: "GET",
      });

      const lead = data?.lead || null;
      const invitation = data?.invitation || null;

      if (!lead) {
        setInvitationsError(
          "La invitación ya aparece como usada, pero no se encontró el lead relacionado."
        );
        return;
      }

      navigate("/empresas/registro/completar", {
        state: {
          adminCompletingInvitation: true,
          invitationId,
          invitation,
          loginEmail: lead.email || invitation?.invited_email || "",
          basicData: {
            companyName: lead.company_name || "",
            ownerName: lead.owner_name || "",
            email: lead.email || invitation?.invited_email || "",
            phone: lead.phone || "",
          },
        },
      });
    } catch (err) {
      setInvitationsError(
        err?.message || "No se pudo cargar el contexto para completar el perfil."
      );
    } finally {
      setInvitationContextBusyId(null);
    }
  }

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

  useEffect(() => {
    if (isChecking) return;
    if (activeSection !== "invitations") return;
    loadInvitations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChecking, activeSection, invitationsQueryString]);

  function handleLogout() {
    adminLogout();
    navigate("/", { replace: true });
  }

  function handleRefresh() {
    if (activeSection === "providers") return loadProviders();
    if (activeSection === "users") return loadUsers();
    if (activeSection === "requests") return loadRequests();
    return loadInvitations();
  }

  const moderatedTotal = (requestStats.approved || 0) + (requestStats.declined || 0);
  const activeSectionMeta =
    SECTION_ITEMS.find((item) => item.key === activeSection) || SECTION_ITEMS[0];

  const overviewCards =
    activeSection === "providers"
      ? [
          { label: "Mostrando", value: providers.length, tone: "default" },
          {
            label: "Pendientes",
            value: providers.filter((p) => p.review_status === "pending_review").length,
            tone: "warn",
          },
          {
            label: "Visibles",
            value: providers.filter((p) => p.public_visibility === "listed").length,
            tone: "ok",
          },
          {
            label: "Destacados",
            value: providers.filter((p) => Boolean(p.is_featured)).length,
            tone: "info",
          },
        ]
      : activeSection === "users"
      ? [
          { label: "Mostrando", value: users.length, tone: "default" },
          {
            label: "Admins",
            value: users.filter((u) => u.role === "admin").length,
            tone: "warn",
          },
          {
            label: "Proveedores",
            value: users.filter((u) => u.role === "provider").length,
            tone: "info",
          },
          {
            label: "Bloqueados",
            value: users.filter((u) => u.account_status === "blocked").length,
            tone: "bad",
          },
        ]
      : activeSection === "requests"
      ? [
          { label: "Total", value: requestStats.total, tone: "default" },
          { label: "Pendientes", value: requestStats.pending, tone: "warn" },
          { label: "Aprobadas", value: requestStats.approved, tone: "ok" },
          { label: "Declinadas", value: requestStats.declined, tone: "bad" },
        ]
      : [
          { label: "Mostrando", value: invitations.length, tone: "default" },
          {
            label: "Emitidas",
            value: invitations.filter((i) => i.status === "issued").length,
            tone: "warn",
          },
          {
            label: "Usadas",
            value: invitations.filter((i) => i.status === "used").length,
            tone: "ok",
          },
          {
            label: "Canceladas / expiradas",
            value: invitations.filter((i) => i.status === "cancelled" || i.status === "expired").length,
            tone: "muted",
          },
        ];

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
      <header className="admin__topbar">
        <div className="admin__topbar-inner">
          <div className="admin__brand">
            <div className="admin__eyebrow">Centro de control</div>
            <div className="admin__title">Kelom Admin</div>
            <div className="admin__subtitle">
              Sesión: <strong>{adminUser?.email}</strong>
              <span className="admin__subtitle-dot">•</span>
              tier <strong>{adminUser?.admin_tier}</strong>
            </div>
          </div>

          <div className="admin__topbar-actions">
            <button className="btn btn--ghost" onClick={handleRefresh}>
              Refrescar
            </button>

            <button className="btn btn--ghost" onClick={handleExportExcel} disabled={activeSection !== "requests" || isExporting || requestsLoading}>
              {isExporting ? "Exportando…" : "Exportar Excel"}
            </button>

            <button className="btn btn--primary" onClick={handleLogout}>
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="admin__container">
        <div className="admin__shell">
          <aside className="admin__sidebar">
            <div className="admin-card admin-card--sidebar">
              <div className="admin-sidebar__heading">
                <div className="admin-sidebar__title">Módulos</div>
                <div className="admin-sidebar__text">
                  Navega por áreas sin revolver todo en una sola mesa.
                </div>
              </div>

              <nav className="admin-sidebar__nav">
                {SECTION_ITEMS.map((item) => (
                  <button
                    key={item.key}
                    className={
                      activeSection === item.key
                        ? "admin-sidebar__link admin-sidebar__link--active"
                        : "admin-sidebar__link"
                    }
                    onClick={() => setActiveSection(item.key)}
                  >
                    <span className="admin-sidebar__link-title">{item.title}</span>
                    <span className="admin-sidebar__link-text">{item.description}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          <main className="admin__main">
            <section className="admin-card admin-card--hero">
              <div className="admin-hero">
                <div className="admin-hero__copy">
                  <span className="admin-hero__badge">{activeSectionMeta.title}</span>
                  <h1 className="admin-hero__title">{activeSectionMeta.title}</h1>
                  <p className="admin-hero__text">{activeSectionMeta.description}</p>
                </div>

                <div className="admin-hero__stats">
                  {overviewCards.map((card) => (
                    <article
                      key={card.label}
                      className={`admin-kpi admin-kpi--${card.tone}`}
                    >
                      <div className="admin-kpi__value">{card.value}</div>
                      <div className="admin-kpi__label">{card.label}</div>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section className="admin-card admin-card--filters">
              {activeSection === "providers" ? (
                <>
                  <div className="admin-toolbar">
                    <div className="admin-toolbar__main">
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
                    </div>
                  </div>

                  {providersError && <div className="admin-alert admin-alert--error">{providersError}</div>}
                  {providersFlash && <div className="admin-alert admin-alert--ok">{providersFlash}</div>}
                </>
              ) : activeSection === "users" ? (
                <>
                  <div className="admin-toolbar">
                    <div className="admin-toolbar__main">
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
                    </div>
                  </div>

                  {usersError && <div className="admin-alert admin-alert--error">{usersError}</div>}
                  {usersFlash && <div className="admin-alert admin-alert--ok">{usersFlash}</div>}
                </>
              ) : activeSection === "requests" ? (
                <>
                  <div className="admin-toolbar">
                    <div className="admin-toolbar__main">
                      <div className="admin-filters admin-filters--requests">
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
                      </div>
                    </div>

                    <div className="admin-toolbar__aside">
                      <div className="admin-chip-group">
                        <span className="admin-badge admin-badge--muted">Total: {requestStats.total}</span>
                        <span className="admin-badge admin-badge--muted">Moderadas: {moderatedTotal}</span>
                        <span className="admin-badge admin-badge--warn">Pend: {requestStats.pending}</span>
                        <span className="admin-badge admin-badge--ok">Apr: {requestStats.approved}</span>
                        <span className="admin-badge admin-badge--bad">Dec: {requestStats.declined}</span>
                      </div>
                    </div>
                  </div>

                  {requestsError && <div className="admin-alert admin-alert--error">{requestsError}</div>}
                  {requestsFlash && <div className="admin-alert admin-alert--ok">{requestsFlash}</div>}
                </>
              ) : (
                <>
                  <div className="admin-toolbar">
                    <div className="admin-toolbar__main">
                      <div className="admin-filters">
                        <div className="admin-filters__group">
                          <label className="admin-filters__label">Estatus</label>
                          <select
                            className="admin-filters__select"
                            value={invitationFilters.status}
                            onChange={(e) => updateInvitationFilter("status", e.target.value)}
                          >
                            {INVITATION_STATUSES.map((s) => (
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
                            value={invitationFilters.q}
                            onChange={(e) => updateInvitationFilter("q", e.target.value)}
                            placeholder="id / notas / lead"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="admin-stack">
                    <form className="admin-card admin-card--subform" onSubmit={handleCreateInvitation}>
                      <div className="admin-subform__header">
                        <h2 className="admin-subform__title">Generar invitación</h2>
                        <p className="admin-subform__text">
                          Crea accesos controlados para nuevos proveedores sin mezclar esto con el resto del panel.
                        </p>
                      </div>

                      <div className="admin-subform__grid">
                        <div className="admin-filters__group">
                          <label className="admin-filters__label">Expira en días</label>
                          <input
                            className="admin-filters__input"
                            type="number"
                            min="1"
                            max="365"
                            value={invitationForm.expires_in_days}
                            onChange={(e) => updateInvitationForm("expires_in_days", e.target.value)}
                            placeholder="Opcional"
                          />
                        </div>

                        <div className="admin-filters__group admin-subform__full">
                          <label className="admin-filters__label">Notas internas</label>
                          <input
                            className="admin-filters__input"
                            value={invitationForm.notes}
                            onChange={(e) => updateInvitationForm("notes", e.target.value)}
                            placeholder="Ej. invitación para proveedor capturado por seguimiento manual"
                          />
                        </div>
                      </div>

                      <div className="admin-info-box">
                        Esta invitación solo genera un <strong>link con token</strong>. El proveedor
                        capturará por sí mismo su correo, empresa, responsable, teléfono y aceptación
                        legal dentro del formulario real.
                      </div>

                      <div className="admin-subform__actions">
                        <button className="btn btn--primary" type="submit" disabled={isCreatingInvitation}>
                          {isCreatingInvitation ? "Generando…" : "Generar invitación"}
                        </button>
                      </div>
                    </form>

                    {lastGeneratedInvitationLink ? (
                      <div className="admin-card admin-card--subform">
                        <div className="admin-subform__header">
                          <h2 className="admin-subform__title">Enlace generado</h2>
                          <p className="admin-subform__text">
                            Cópialo ahora. Luego ya no vas a poder recuperarlo por arte de magia.
                          </p>
                        </div>

                        <div className="admin-generated-link">{lastGeneratedInvitationLink}</div>

                        <div className="admin-subform__actions">
                          <button className="btn btn--ghost" type="button" onClick={handleCopyInvitationLink}>
                            Copiar enlace
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {invitationsError && <div className="admin-alert admin-alert--error">{invitationsError}</div>}
                    {invitationsFlash && <div className="admin-alert admin-alert--ok">{invitationsFlash}</div>}
                  </div>
                </>
              )}
            </section>

            {activeSection === "providers" ? (
              <section className="admin-card admin-card--table">
                <div className="admin-table__header">
                  <h2 className="admin-table__title">Proveedores</h2>
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
                        <th>Modalidad</th>
                        <th>Notas</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>

                    <tbody>
                      {providers.map((p) => {
                        const isBusy = providerBusyId === p.user_id;
                        const isFeatured = Boolean(p.is_featured);

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

                            <td>
                              <div className="admin-inline-stack">
                                <span className={badgeClass("featured", isFeatured)}>
                                  {isFeatured ? "Proveedor Destacado Kelom" : "Proveedor gratuito"}
                                </span>
                                <span className="admin-inline-help">
                                  {isFeatured
                                    ? "Beneficios premium activos"
                                    : "Sin beneficios premium"}
                                </span>
                              </div>
                            </td>

                            <td className="admin-table__notes-cell">
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

                            <td className="admin-table__actions-cell">
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
                                    patchProvider(p.user_id, { public_visibility: "hidden" }, "Ocultado ✅")
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
                                      { is_featured: !isFeatured },
                                      isFeatured
                                        ? "Proveedor marcado como gratuito ✅"
                                        : "Proveedor marcado como destacado ✅"
                                    )
                                  }
                                >
                                  {isFeatured ? "Quitar destacado" : "Hacer destacado"}
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
                          <td colSpan={6} className="admin-table__empty">
                            {providersLoading ? "Cargando…" : "No hay resultados con estos filtros."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="admin-footer-note">
                  Nota: el público solo ve proveedores <strong>approved + listed</strong>. La modalidad
                  <strong> Proveedor Destacado Kelom</strong> se controla por separado con <strong>is_featured</strong>.
                </div>
              </section>
            ) : activeSection === "users" ? (
              <section className="admin-card admin-card--table">
                <div className="admin-table__header">
                  <h2 className="admin-table__title">Usuarios</h2>
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

                            <td>
                              {u.account_status === "blocked" ? (
                                <div className="admin-inline-stack">
                                  <div>
                                    <strong>Motivo:</strong> {u.blocked_reason || "—"}
                                  </div>
                                  <div className="admin-inline-help">
                                    {u.blocked_at ? `Bloqueado: ${new Date(u.blocked_at).toLocaleString()}` : "Bloqueado"}
                                  </div>
                                </div>
                              ) : (
                                <span className="admin-inline-help">Sin bloqueo</span>
                              )}
                            </td>

                            <td className="admin-table__actions-cell">
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
                          <td colSpan={5} className="admin-table__empty">
                            {usersLoading ? "Cargando…" : "No hay resultados con estos filtros."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="admin-footer-note">
                  Nota: bloquear un usuario evita su acceso autenticado mientras su <strong>account_status</strong> sea <strong>blocked</strong>.
                </div>
              </section>
            ) : activeSection === "requests" ? (
              <section className="admin-card admin-card--table">
                <div className="admin-table__header">
                  <h2 className="admin-table__title">Solicitudes de información</h2>
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
                          (r.provider_id ? `ID: ${r.provider_id}` : "—");

                        const requesterLabel = r.requester_name || "Sin nombre";
                        const requesterEmail = r.requester_email || "—";

                        return (
                          <tr key={r.id}>
                            <td className="admin-nowrap">{formatDateTime(r.created_at)}</td>

                            <td>
                              <div className="admin-inline-stack">
                                <strong>{providerLabel}</strong>
                                <span className="admin-inline-help">
                                  {r.provider_is_featured ? "⭐ Destacado" : "Gratis"}
                                </span>
                                <span className="admin-inline-help">ID: {r.provider_id}</span>
                              </div>
                            </td>

                            <td>
                              <div className="admin-inline-stack">
                                <strong>{requesterLabel}</strong>
                                <span className="admin-inline-help">{requesterEmail}</span>
                                {r.requester_phone ? (
                                  <span className="admin-inline-help">{r.requester_phone}</span>
                                ) : null}
                                <span className="admin-inline-help">
                                  Horario: {r.preferred_contact_schedule || "—"}
                                </span>
                              </div>
                            </td>

                            <td>
                              <span className={badgeClass("moderation", r.moderation_status)}>
                                {r.moderation_status}
                              </span>
                              {r.moderation_notes ? (
                                <div className="admin-inline-help admin-inline-help--spaced">
                                  Nota: {r.moderation_notes}
                                </div>
                              ) : null}
                            </td>

                            <td>
                              <span className={badgeClass("provider-status", r.provider_status)}>
                                {r.provider_status}
                              </span>
                            </td>

                            <td className="admin-table__message-cell">
                              <div className="admin-message-preview">
                                {String(r.message || "").slice(0, 320)}
                                {String(r.message || "").length > 320 ? "…" : ""}
                              </div>
                            </td>

                            <td className="admin-table__actions-cell">
                              <div className="admin-actions">
                                <button
                                  className="btn btn--primary"
                                  disabled={isBusy || r.moderation_status === "approved"}
                                  onClick={() => moderateRequest(r.id, "approved")}
                                >
                                  {isBusy ? "…" : "Aprobar"}
                                </button>

                                <button
                                  className="btn btn--ghost"
                                  disabled={isBusy || r.moderation_status === "declined"}
                                  onClick={() => moderateRequest(r.id, "declined")}
                                >
                                  Declinar
                                </button>
                              </div>

                              {r.moderated_at ? (
                                <div className="admin-inline-help admin-inline-help--spaced">
                                  Moderado: {formatDateTime(r.moderated_at)}
                                </div>
                              ) : null}
                            </td>
                          </tr>
                        );
                      })}

                      {!requests.length && (
                        <tr>
                          <td colSpan={7} className="admin-table__empty">
                            {requestsLoading ? "Cargando…" : "No hay solicitudes con estos filtros."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="admin-footer-note">
                  Nota: “Total moderadas” = aprobadas + declinadas. Exportar descarga un CSV compatible con Excel.
                </div>
              </section>
            ) : (
              <section className="admin-card admin-card--table">
                <div className="admin-table__header">
                  <h2 className="admin-table__title">Invitaciones a proveedores</h2>
                  <div className="admin-table__meta">
                    Mostrando: <strong>{invitations.length}</strong>
                  </div>
                </div>

                <div className="admin-table__wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Invitación</th>
                        <th>Estatus</th>
                        <th>Creación</th>
                        <th>Vencimiento</th>
                        <th>Uso</th>
                        <th>Notas</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>

                    <tbody>
                      {invitations.map((inv) => {
                        const isBusy = invitationBusyId === inv.id;
                        const isLoadingContext = invitationContextBusyId === inv.id;
                        const canCancel = inv.status === "issued";
                        const canCompleteProfile = Boolean(inv.used_at && inv.used_by_lead_id);

                        return (
                          <tr key={inv.id}>
                            <td>
                              <div className="admin-provider">
                                <div className="admin-provider__main">
                                  <div className="admin-provider__name">
                                    {inv.invited_company_name || "Invitación abierta"}
                                  </div>
                                  <div className="admin-provider__sub">
                                    <span>{inv.invited_email || "El proveedor capturará sus datos en el formulario"}</span>
                                    {inv.invited_owner_name ? (
                                      <>
                                        <span className="admin-provider__dot">•</span>
                                        <span>{inv.invited_owner_name}</span>
                                      </>
                                    ) : null}
                                  </div>
                                </div>

                                <div className="admin-provider__meta">
                                  <div className="admin-provider__id">ID: {inv.id}</div>
                                  {inv.created_by_admin_id ? (
                                    <div className="admin-provider__review">
                                      Admin: {inv.created_by_admin_id}
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            </td>

                            <td>
                              <span className={badgeClass("invitation-status", inv.status)}>
                                {inv.status}
                              </span>
                            </td>

                            <td className="admin-nowrap">{formatDateTime(inv.created_at)}</td>

                            <td className="admin-nowrap">{formatDateTime(inv.expires_at)}</td>

                            <td>
                              {inv.used_at ? (
                                <div className="admin-inline-stack">
                                  <span>Usada: {formatDateTime(inv.used_at)}</span>
                                  <span className="admin-inline-help">
                                    Lead: {inv.used_by_lead_id || "—"}
                                  </span>
                                </div>
                              ) : (
                                <span className="admin-inline-help">Aún no utilizada</span>
                              )}
                            </td>

                            <td className="admin-table__message-cell">
                              <div className="admin-message-preview">{inv.notes || "—"}</div>
                            </td>

                            <td className="admin-table__actions-cell">
                              <div className="admin-actions">
                                <button
                                  className="btn btn--ghost"
                                  disabled={isBusy || !canCancel}
                                  onClick={() => handleCancelInvitation(inv.id)}
                                >
                                  {isBusy ? "…" : "Cancelar"}
                                </button>

                                <button
                                  className="btn btn--primary"
                                  disabled={!canCompleteProfile || isLoadingContext}
                                  onClick={() => handleContinueProviderProfile(inv.id)}
                                  title={
                                    canCompleteProfile
                                      ? "Continuar con el llenado del perfil"
                                      : "Se habilita cuando el proveedor ya envió el formulario inicial"
                                  }
                                >
                                  {isLoadingContext ? "Cargando…" : "Completar perfil"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                      {!invitations.length && (
                        <tr>
                          <td colSpan={7} className="admin-table__empty">
                            {invitationsLoading ? "Cargando…" : "No hay invitaciones con estos filtros."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="admin-footer-note">
                  Nota: esta invitación solo habilita el acceso al formulario inicial. Cuando el proveedor ya lo envía, se activa <strong>Completar perfil</strong> para que continúes el proceso desde admin.
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;