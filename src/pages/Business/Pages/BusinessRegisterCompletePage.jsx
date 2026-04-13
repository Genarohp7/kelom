import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import "../../../../Blocks/Business/BusinessAuth.css";
import Kelom from "../../../assets/web/logo/logoKelom.png";
import {
  getProviderToken,
  setProviderSession,
  clearProviderSession,
} from "../../../services/providerAuth";

import { adminApiFetch } from "../../../services/adminApi";

const API_BASE = import.meta.env.VITE_API_URL || "https://api.kelom.com.mx";

const PROVIDER_BASIC_DRAFT_KEY = "kelom_provider_basic_draft";
const PROVIDER_PROFILE_DRAFT_KEY = "kelom_provider_profile_draft";

const EDIT_ROUTE = "/empresas/registro/completar";
const LOGIN_ROUTE = "/empresas/acceso";

const ALLOWED_PROVIDER_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_PROVIDER_PHOTO_BYTES = 5 * 1024 * 1024;
const MAX_PROVIDER_PHOTO_WIDTH = 2500;
const MAX_PROVIDER_PHOTO_HEIGHT = 2500;

const BUSINESS_CATEGORY_OPTIONS = [
  "Jardín",
  "Hacienda",
  "Salón",
  "Banquetes",
  "Organizador para Bodas",
  "Vestidos",
  "Pasteles",
  "DJ",
  "Florería",
  "Fotógrafo",
];

const LOCALITY_AREA_OPTIONS = [
  "Álvaro Obregón",
  "Azcapotzalco",
  "Benito Juárez",
  "Coyoacán",
  "Cuajimalpa de Morelos",
  "Cuauhtémoc",
  "Gustavo A. Madero",
  "Iztacalco",
  "Iztapalapa",
  "La Magdalena Contreras",
  "Miguel Hidalgo",
  "Milpa Alta",
  "Tláhuac",
  "Tlalpan",
  "Venustiano Carranza",
  "Xochimilco",
  "Ecatepec",
  "Naucalpan",
  "Tlalnepantla",
  "Nezahualcóyotl",
  "Coacalco",
  "Cuautitlán",
  "Huixquilucan",
  "Chalco",
  "Texcoco",
  "Atizapán de Zaragoza",
  "San Pedro Tepotzotlán",
];

const EVENT_TYPE_OPTIONS = [
  "Boda civil",
  "Boda religiosa",
  "Recepción al aire libre",
  "Recepción en salón",
  "Coctel",
  "Comida formal",
  "Boda íntima",
  "Boda grande",
];

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function normalizePhoneDigits(phone) {
  return String(phone || "").replace(/\D/g, "");
}

function toAbsoluteApiUrl(url) {
  if (!url) return "";
  if (String(url).startsWith("http")) return url;
  return `${API_BASE}${url}`;
}

function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const dimensions = {
        width: img.naturalWidth,
        height: img.naturalHeight,
      };

      URL.revokeObjectURL(objectUrl);
      resolve(dimensions);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("No se pudo leer la imagen."));
    };

    img.src = objectUrl;
  });
}

function createEmptyProfileData() {
  return {
    venueName: "",
    venueLocation: "",
    businessCategory: "",
    localityArea: "",
    locationPlaceId: "",
    locationLat: "",
    locationLng: "",
    capacityMin: "",
    capacityMax: "",
    priceFrom: "",
    priceTo: "",
    shortDescription: "",
    description: "",
    spaces: "",
    services: "",
    rules: "",
    website: "",
    instagram: "",
    facebook: "",
    mapText: "",
    eventTypes: [],
    sellingPointsText: "",
    photos: [],
  };
}

function mapApiProfileToProfileData(profile) {
  if (!profile) return null;

  const sellingPointsArr = Array.isArray(profile.selling_points)
    ? profile.selling_points
    : Array.isArray(profile.sellingPoints)
      ? profile.sellingPoints
      : [];

  return {
    venueName: profile.venue_name || "",
    venueLocation: profile.venue_location || "",
    businessCategory:
      profile.business_category || profile.businessCategory || profile.category || "",
    localityArea: profile.locality_area || profile.localityArea || profile.area || "",
    locationPlaceId: profile.location_place_id || "",
    locationLat:
      profile.location_lat === null || profile.location_lat === undefined
        ? ""
        : String(profile.location_lat),
    locationLng:
      profile.location_lng === null || profile.location_lng === undefined
        ? ""
        : String(profile.location_lng),
    capacityMin:
      profile.capacity_min === null || profile.capacity_min === undefined
        ? ""
        : String(profile.capacity_min),
    capacityMax:
      profile.capacity_max === null || profile.capacity_max === undefined
        ? ""
        : String(profile.capacity_max),
    priceFrom:
      profile.price_from === null || profile.price_from === undefined
        ? ""
        : String(profile.price_from),
    priceTo:
      profile.price_to === null || profile.price_to === undefined
        ? ""
        : String(profile.price_to),
    shortDescription: profile.short_description || "",
    eventTypes: Array.isArray(profile.event_types) ? profile.event_types : [],
    sellingPointsText: sellingPointsArr.length ? sellingPointsArr.join("\n") : "",
    mapText: profile.map_text || "",
    description: profile.description || "",
    spaces: profile.spaces || "",
    services: profile.services || "",
    rules: profile.rules || "",
    website: profile.website || "",
    instagram: profile.instagram || "",
    facebook: profile.facebook || "",
    photos: [],
  };
}

function buildSellingPointsList(sellingPointsText) {
  return String(sellingPointsText || "")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
}

function getServiceStatusMeta(service) {
  const reviewStatus = String(service?.review_status || "");
  const visibility = String(service?.public_visibility || "");

  if (reviewStatus === "approved" && visibility === "listed") {
    return {
      label: "Publicado",
      background: "rgba(16, 185, 129, 0.14)",
      borderColor: "rgba(16, 185, 129, 0.25)",
      color: "#0f766e",
    };
  }

  if (reviewStatus === "pending_review") {
    return {
      label: "Pendiente de revisión",
      background: "rgba(245, 158, 11, 0.14)",
      borderColor: "rgba(245, 158, 11, 0.25)",
      color: "#b45309",
    };
  }

  if (reviewStatus === "needs_changes") {
    return {
      label: "Requiere ajustes",
      background: "rgba(249, 115, 22, 0.14)",
      borderColor: "rgba(249, 115, 22, 0.25)",
      color: "#c2410c",
    };
  }

  if (reviewStatus === "rejected") {
    return {
      label: "Rechazado",
      background: "rgba(239, 68, 68, 0.14)",
      borderColor: "rgba(239, 68, 68, 0.25)",
      color: "#b91c1c",
    };
  }

  if (reviewStatus === "suspended") {
    return {
      label: "Suspendido",
      background: "rgba(107, 114, 128, 0.14)",
      borderColor: "rgba(107, 114, 128, 0.25)",
      color: "#4b5563",
    };
  }

  return {
    label: "Oculto",
    background: "rgba(107, 114, 128, 0.12)",
    borderColor: "rgba(107, 114, 128, 0.22)",
    color: "#4b5563",
  };
}

function BusinessRegisterCompletePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminCompletingInvitation = Boolean(location.state?.adminCompletingInvitation);
  const adminInvitationId = location.state?.invitationId || null;

  const stateBasicData = location.state?.basicData || null;
  const prefillProfileData = location.state?.prefillProfileData || null;
  const preferredServiceIdFromState = location.state?.serviceId || null;

  const authModeFromState = location.state?.authMode || null;
  const loginEmailFromState = location.state?.loginEmail || "";

  const [basicData, setBasicData] = useState(() => {
    if (stateBasicData) return stateBasicData;

    try {
      const draft = sessionStorage.getItem(PROVIDER_BASIC_DRAFT_KEY);
      const parsed = draft ? safeParse(draft) : null;
      return parsed || null;
    } catch {
      return null;
    }
  });

  const providerEmail = useMemo(() => {
    const email = (loginEmailFromState || basicData?.email || "")
      .trim()
      .toLowerCase();
    return email;
  }, [loginEmailFromState, basicData]);

  const tokenAtStart = useMemo(
    () => (isAdminCompletingInvitation ? null : getProviderToken()),
    [isAdminCompletingInvitation]
  );

  const isLoggedIn = !!tokenAtStart;

  const authMode = useMemo(() => {
    if (isAdminCompletingInvitation) return "edit";
    if (isLoggedIn) return "edit";
    if (authModeFromState) return authModeFromState;
    if (prefillProfileData) return "edit";
    return "register";
  }, [isAdminCompletingInvitation, isLoggedIn, authModeFromState, prefillProfileData]);

  const [profileData, setProfileData] = useState(() => {
    if (prefillProfileData) {
      return {
        ...createEmptyProfileData(),
        ...mapApiProfileToProfileData(prefillProfileData),
      };
    }

    try {
      const draft = localStorage.getItem(PROVIDER_PROFILE_DRAFT_KEY);
      const parsed = draft ? safeParse(draft) : null;

      if (parsed) {
        return {
          ...createEmptyProfileData(),
          venueName: parsed.venueName || "",
          venueLocation: parsed.venueLocation || "",
          businessCategory: parsed.businessCategory || "",
          localityArea: parsed.localityArea || "",
          locationPlaceId: parsed.locationPlaceId || "",
          locationLat: parsed.locationLat ?? "",
          locationLng: parsed.locationLng ?? "",
          capacityMin: parsed.capacityMin || "",
          capacityMax: parsed.capacityMax || "",
          priceFrom: parsed.priceFrom || "",
          priceTo: parsed.priceTo || "",
          shortDescription: parsed.shortDescription || "",
          eventTypes: Array.isArray(parsed.eventTypes) ? parsed.eventTypes : [],
          sellingPointsText: parsed.sellingPointsText || "",
          mapText: parsed.mapText || "",
          description: parsed.description || "",
          spaces: parsed.spaces || "",
          services: parsed.services || "",
          rules: parsed.rules || "",
          website: parsed.website || "",
          instagram: parsed.instagram || "",
          facebook: parsed.facebook || "",
          photos: [],
        };
      }
    } catch {
      // ignore
    }

    return createEmptyProfileData();
  });

  const [serverPhotos, setServerPhotos] = useState([]);
  const [providerServices, setProviderServices] = useState([]);
  const [activeServiceId, setActiveServiceId] = useState(null);
  const [canAddService, setCanAddService] = useState(false);
  const [isCreatingNewService, setIsCreatingNewService] = useState(false);
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(
    authMode === "edit" && !isAdminCompletingInvitation
  );
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);

  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [securityData, setSecurityData] = useState({
    password: "",
    confirmPassword: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [showSecurity, setShowSecurity] = useState({
    password: false,
    confirmPassword: false,
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });

  const fileInputRef = useRef(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const locationInputRef = useRef(null);
  const autocompleteListenerRef = useRef(null);
  const autocompleteRef = useRef(null);

  const apiJson = async (path, { method = "GET", body, token } = {}) => {
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data?.error || `Error HTTP ${res.status}`;
      throw new Error(msg);
    }
    return data;
  };

  const apiMultipart = async (path, { method = "POST", formData, token } = {}) => {
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: formData,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data?.error || `Error HTTP ${res.status}`;
      throw new Error(msg);
    }
    return data;
  };

  const persistDraft = (nextProfileData) => {
    try {
      localStorage.setItem(
        PROVIDER_PROFILE_DRAFT_KEY,
        JSON.stringify({ ...nextProfileData, photos: [] })
      );
    } catch {
      // ignore
    }
  };

  const hydrateBasicDataFromWorkspace = (data) => {
    setBasicData((prev) => ({
      companyName: data?.profile?.company_name || prev?.companyName || "",
      ownerName: data?.profile?.owner_name || prev?.ownerName || data?.provider?.name || "",
      phone: data?.profile?.phone || prev?.phone || "",
      email: data?.provider?.email || prev?.email || "",
    }));
  };

  const applyProfileIntoForm = (profile, photos = []) => {
    const mapped = mapApiProfileToProfileData(profile) || createEmptyProfileData();

    setProfileData({
      ...createEmptyProfileData(),
      ...mapped,
      photos: [],
    });

    setServerPhotos(Array.isArray(photos) ? photos : []);
    persistDraft(mapped);
  };

  const loadProviderWorkspace = async (
    token,
    { preferredServiceId = null, preserveCurrentSelection = false } = {}
  ) => {
    const data = await apiJson("/providers/me", { token });

    hydrateBasicDataFromWorkspace(data);

    const services = Array.isArray(data?.profiles) ? data.profiles : [];
    const primaryProfile = data?.profile || null;
    const primaryProfileId = primaryProfile?.id || null;

    setProviderServices(services);
    setCanAddService(Boolean(data?.can_add_service));

    if (!services.length && !primaryProfile) {
      setActiveServiceId(null);
      setIsCreatingNewService(false);
      setProfileData(createEmptyProfileData());
      setServerPhotos([]);
      return;
    }

    const targetServiceId =
      preferredServiceId ||
      (preserveCurrentSelection ? activeServiceId : null) ||
      primaryProfileId ||
      services?.[0]?.id ||
      null;

    if (!targetServiceId) {
      setActiveServiceId(null);
      setIsCreatingNewService(false);
      setProfileData(createEmptyProfileData());
      setServerPhotos([]);
      return;
    }

    if (primaryProfileId && targetServiceId === primaryProfileId) {
      applyProfileIntoForm(primaryProfile, data?.photos || []);
      setActiveServiceId(primaryProfileId);
      setIsCreatingNewService(false);
      return;
    }

    try {
      const detail = await apiJson(`/providers/my-services/${targetServiceId}`, { token });
      applyProfileIntoForm(detail?.profile, detail?.photos || []);
      setActiveServiceId(targetServiceId);
      setIsCreatingNewService(false);
    } catch {
      applyProfileIntoForm(primaryProfile, data?.photos || []);
      setActiveServiceId(primaryProfileId);
      setIsCreatingNewService(false);
    }
  };

  useEffect(() => {
    if (authMode !== "edit") return;
    if (isAdminCompletingInvitation) return;

    const token = getProviderToken();
    if (!token) {
      navigate(LOGIN_ROUTE, {
        replace: true,
        state: { from: EDIT_ROUTE },
      });
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        setIsLoadingWorkspace(true);
        await loadProviderWorkspace(token, {
          preferredServiceId: preferredServiceIdFromState || null,
        });
      } catch (err) {
        if (cancelled) return;

        console.warn("No se pudo cargar /providers/me:", err);

        clearProviderSession();
        navigate(LOGIN_ROUTE, {
          replace: true,
          state: { from: EDIT_ROUTE },
        });
      } finally {
        if (!cancelled) setIsLoadingWorkspace(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [authMode, isAdminCompletingInvitation, navigate, preferredServiceIdFromState]);

  const activeService = useMemo(
    () => providerServices.find((service) => service.id === activeServiceId) || null,
    [providerServices, activeServiceId]
  );

  const activeServiceStatusMeta = useMemo(
    () => getServiceStatusMeta(activeService),
    [activeService]
  );

  const openFilePicker = () => fileInputRef.current?.click();

  const addPhotos = async (files) => {
    const incoming = Array.from(files || []).filter(Boolean);
    if (incoming.length === 0) return;

    setPhotoError("");
    setSubmitError("");
    setSubmitSuccess("");

    const validFiles = [];
    const errors = [];

    for (const file of incoming) {
      if (!ALLOWED_PROVIDER_PHOTO_TYPES.includes(file.type)) {
        errors.push(`${file.name}: formato no permitido. Usa JPG, PNG o WebP.`);
        continue;
      }

      if (file.size > MAX_PROVIDER_PHOTO_BYTES) {
        errors.push(`${file.name}: excede 5MB.`);
        continue;
      }

      try {
        const { width, height } = await getImageDimensions(file);

        if (
          width > MAX_PROVIDER_PHOTO_WIDTH ||
          height > MAX_PROVIDER_PHOTO_HEIGHT
        ) {
          errors.push(
            `${file.name}: excede ${MAX_PROVIDER_PHOTO_WIDTH}x${MAX_PROVIDER_PHOTO_HEIGHT}px.`
          );
          continue;
        }

        validFiles.push(file);
      } catch {
        errors.push(`${file.name}: no se pudo procesar.`);
      }
    }

    if (errors.length > 0) {
      setPhotoError(errors.join(" "));
    }

    if (validFiles.length === 0) return;

    const keyOf = (f) => `${f.name}-${f.size}-${f.lastModified}`;

    setProfileData((prev) => {
      const existing = Array.isArray(prev.photos) ? prev.photos : [];
      const seen = new Set(existing.map(keyOf));
      const merged = [...existing];

      validFiles.forEach((f) => {
        const k = keyOf(f);
        if (!seen.has(k)) {
          merged.push(f);
          seen.add(k);
        }
      });

      return { ...prev, photos: merged };
    });
  };

  const handlePhotoInputChange = async (e) => {
    const files = Array.from(e.target.files || []);
    await addPhotos(files);
    e.target.value = "";
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    await addPhotos(Array.from(e.dataTransfer.files || []));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const removeLocalPhotoAt = (index) => {
    setProfileData((prev) => {
      const next = (prev.photos || []).filter((_, i) => i !== index);
      return { ...prev, photos: next };
    });
  };

const uploadSelectedPhotosToBackend = async (token, targetProfileId) => {
  const files = Array.isArray(profileData.photos) ? profileData.photos : [];
  if (!files.length) return;

  const fd = new FormData();
  files.forEach((f) => fd.append("photos", f));

  setIsUploadingPhotos(true);
  setSubmitError("");

  try {
    let data;

    if (isAdminCompletingInvitation) {
      if (!adminInvitationId) {
        throw new Error("No se encontró la invitación admin para subir fotos.");
      }

      data = await adminApiFetch(
        `/admin/provider-invitations/${adminInvitationId}/photos`,
        {
          method: "POST",
          body: fd,
        }
      );
    } else {
      const path = targetProfileId
        ? `/providers/my-services/${targetProfileId}/photos`
        : "/providers/photos";

      data = await apiMultipart(path, {
        method: "POST",
        token,
        formData: fd,
      });
    }

    const newPhotos = Array.isArray(data?.photos) ? data.photos : [];
    if (newPhotos.length) setServerPhotos((prev) => [...prev, ...newPhotos]);

    setProfileData((prev) => ({ ...prev, photos: [] }));
    setPhotoError("");
  } catch (err) {
    setSubmitError(String(err?.message || "No se pudieron subir las fotos."));
    throw err;
  } finally {
    setIsUploadingPhotos(false);
  }
};

  const deleteServerPhoto = async (photoId) => {
    const token = getProviderToken();
    if (!token) {
      setSubmitError("No hay sesión activa. Inicia sesión como proveedor.");
      navigate(LOGIN_ROUTE, { state: { from: EDIT_ROUTE } });
      return;
    }

    setSubmitError("");
    setSubmitSuccess("");
    setIsUploadingPhotos(true);

    try {
      const path =
        activeServiceId && !isCreatingNewService
          ? `/providers/my-services/${activeServiceId}/photos/${photoId}`
          : `/providers/photos/${photoId}`;

      await apiJson(path, {
        method: "DELETE",
        token,
      });

      setServerPhotos((prev) => prev.filter((p) => p.id !== photoId));
      setSubmitSuccess("Foto eliminada.");
    } catch (err) {
      setSubmitError(String(err?.message || "No se pudo eliminar la foto."));
    } finally {
      setIsUploadingPhotos(false);
    }
  };

  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSubmitError("");
    setSubmitSuccess("");
    setSecurityData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleShow = (key) => {
    setShowSecurity((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setSubmitError("");
    setSubmitSuccess("");

    setProfileData((prev) => {
      if (name === "venueLocation") {
        return {
          ...prev,
          venueLocation: value,
          locationPlaceId: "",
          locationLat: "",
          locationLng: "",
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const toggleEventType = (label) => {
    setProfileData((prev) => {
      const has = prev.eventTypes.includes(label);
      const next = has
        ? prev.eventTypes.filter((t) => t !== label)
        : [...prev.eventTypes, label];
      return { ...prev, eventTypes: next };
    });
  };

  useEffect(() => {
    let cancelled = false;

    const ensureGooglePlaces = async () => {
      if (window.google?.maps?.places) return window.google;

      if (window.__kelomGoogleMapsPromise) {
        await window.__kelomGoogleMapsPromise;
        if (window.google?.maps?.places) return window.google;
      }

      const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!key) throw new Error("Missing VITE_GOOGLE_MAPS_API_KEY");

      await new Promise((resolve, reject) => {
        const existing = document.querySelector('script[data-kelom="google-maps"]');
        if (existing) {
          existing.addEventListener("load", resolve);
          existing.addEventListener("error", reject);
          return;
        }

        const script = document.createElement("script");
        script.setAttribute("data-kelom", "google-maps");
        script.async = true;
        script.defer = true;

        const params = new URLSearchParams({
          key,
          libraries: "places",
          language: "es",
          region: "MX",
        });

        script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

      if (!window.google?.maps?.places) {
        throw new Error("Google Places not available after script load");
      }
      return window.google;
    };

    const init = async () => {
      try {
        const g = await ensureGooglePlaces();
        if (cancelled) return;

        const input = locationInputRef.current;
        if (!input) return;

        if (autocompleteRef.current) return;

        const ac = new g.maps.places.Autocomplete(input, {
          fields: ["formatted_address", "geometry", "place_id", "name"],
          types: ["geocode"],
          componentRestrictions: { country: "mx" },
        });

        autocompleteRef.current = ac;

        const listener = ac.addListener("place_changed", () => {
          const place = ac.getPlace();

          const formatted = place?.formatted_address || input.value || "";

          const lat = place?.geometry?.location?.lat?.();
          const lng = place?.geometry?.location?.lng?.();

          setProfileData((prev) => ({
            ...prev,
            venueLocation: formatted,
            locationPlaceId: place?.place_id || "",
            locationLat:
              typeof lat === "number" && Number.isFinite(lat) ? String(lat) : "",
            locationLng:
              typeof lng === "number" && Number.isFinite(lng) ? String(lng) : "",
          }));
        });

        autocompleteListenerRef.current = listener;
      } catch (err) {
        console.warn("Google Places Autocomplete no disponible:", err);
      }
    };

    init();

    return () => {
      cancelled = true;
      if (autocompleteListenerRef.current?.remove) {
        autocompleteListenerRef.current.remove();
      }
      autocompleteListenerRef.current = null;
      autocompleteRef.current = null;
    };
  }, []);

  const photoPreviews = useMemo(
    () => (profileData.photos || []).map((file) => URL.createObjectURL(file)),
    [profileData.photos]
  );

  useEffect(() => {
    return () => {
      photoPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [photoPreviews]);

  const mainPhoto = useMemo(() => {
    if (photoPreviews.length > 0) return photoPreviews[0];
    const firstServer = serverPhotos?.[0]?.url
      ? toAbsoluteApiUrl(serverPhotos[0].url)
      : "";
    if (firstServer) return firstServer;
    return "https://images.pexels.com/photos/3951852/pexels-photo-3951852.jpeg?auto=compress&cs=tinysrgb&w=800";
  }, [photoPreviews, serverPhotos]);

  const sellingPointsList = useMemo(
    () => buildSellingPointsList(profileData.sellingPointsText),
    [profileData.sellingPointsText]
  );

  const completion = useMemo(() => {
    const hasAnyPhotos =
      (profileData.photos || []).length > 0 || (serverPhotos || []).length > 0;

    const items = [
      !!profileData.venueName.trim(),
      !!profileData.venueLocation.trim(),
      !!profileData.businessCategory.trim(),
      !!profileData.localityArea.trim(),
      !!String(profileData.capacityMin).trim(),
      !!String(profileData.priceFrom).trim(),
      !!String(profileData.priceTo).trim(),
      !!profileData.shortDescription.trim(),
      !!profileData.description.trim(),
      !!profileData.services.trim(),
      (profileData.eventTypes || []).length > 0,
      !!profileData.sellingPointsText.trim(),
      !!profileData.mapText.trim(),
      hasAnyPhotos,
      !!profileData.website.trim(),
      !!profileData.instagram.trim(),
      !!profileData.facebook.trim(),
    ];

    const total = items.length;
    const done = items.filter(Boolean).length;
    const percent = Math.round((done / total) * 100);
    return { done, total, percent };
  }, [profileData, serverPhotos]);

  const hasGeo =
    !!String(profileData.locationLat || "").trim() &&
    !!String(profileData.locationLng || "").trim();

  const validateNumber = (value) => /^\d+$/.test(String(value));

  const validateCreatePassword = () => {
    const p = securityData.password.trim();
    const c = securityData.confirmPassword.trim();

    if (!p || !c) {
      setSubmitError("Por favor, crea tu contraseña y confírmala.");
      return false;
    }
    if (p.length < 5) {
      setSubmitError("La contraseña debe tener al menos 5 caracteres.");
      return false;
    }
    if (p !== c) {
      setSubmitError("La confirmación no coincide con la contraseña.");
      return false;
    }
    return true;
  };

  const handleChangePassword = async () => {
    setSubmitError("");
    setSubmitSuccess("");

    const token = getProviderToken();
    if (!token) {
      setSubmitError("Tu sesión de proveedor no está activa. Inicia sesión primero.");
      navigate(LOGIN_ROUTE, { state: { from: EDIT_ROUTE } });
      return;
    }

    const current = securityData.currentPassword.trim();
    const next = securityData.newPassword.trim();
    const confirm = securityData.confirmNewPassword.trim();

    if (!current || !next || !confirm)
      return setSubmitError("Completa: contraseña actual, nueva y confirmación.");
    if (next.length < 5)
      return setSubmitError("La nueva contraseña debe tener al menos 5 caracteres.");
    if (next !== confirm)
      return setSubmitError("La confirmación no coincide con la nueva contraseña.");
    if (current === next)
      return setSubmitError("La nueva contraseña no puede ser igual a la actual.");

    try {
      setIsSubmitting(true);
      await apiJson("/auth/password", {
        method: "PUT",
        token,
        body: { currentPassword: current, newPassword: next },
      });

      setSubmitSuccess("Contraseña actualizada correctamente.");
      setSecurityData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      }));
    } catch (err) {
      setSubmitError(String(err?.message || "No se pudo cambiar la contraseña."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartNewService = () => {
    if (isAdminCompletingInvitation) {
      setSubmitError("Este flujo de admin solo sirve para completar la ficha inicial.");
      return;
    }

    if (!canAddService) {
      setSubmitError(
        "Este botón se activa cuando al menos una de tus fichas ya está aprobada y visible en el catálogo."
      );
      return;
    }

    setSubmitError("");
    setSubmitSuccess("");
    setPhotoError("");
    setIsCreatingNewService(true);
    setActiveServiceId(null);
    setServerPhotos([]);
    setProfileData(createEmptyProfileData());
    persistDraft(createEmptyProfileData());
  };

  const handleSelectService = async (serviceId) => {
    if (isAdminCompletingInvitation) return;

    const token = getProviderToken();
    if (!token) {
      navigate(LOGIN_ROUTE, { state: { from: EDIT_ROUTE } });
      return;
    }

    setSubmitError("");
    setSubmitSuccess("");
    setPhotoError("");
    setIsLoadingWorkspace(true);

    try {
      await loadProviderWorkspace(token, { preferredServiceId: serviceId });
    } catch (err) {
      setSubmitError(String(err?.message || "No se pudo cargar el servicio."));
    } finally {
      setIsLoadingWorkspace(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setSubmitError("");
    setSubmitSuccess("");

    const {
      venueName,
      venueLocation,
      businessCategory,
      localityArea,
      capacityMin,
      capacityMax,
      priceFrom,
      priceTo,
      shortDescription,
      description,
      services,
    } = profileData;

    if (
      !venueName.trim() ||
      !venueLocation.trim() ||
      !businessCategory.trim() ||
      !localityArea.trim() ||
      !String(priceFrom).trim() ||
      !String(priceTo).trim() ||
      !String(capacityMin).trim() ||
      !shortDescription.trim() ||
      !description.trim() ||
      !services.trim()
    ) {
      setSubmitError("Por favor, completa todos los campos obligatorios.");
      return;
    }

    if (!validateNumber(priceFrom) || !validateNumber(priceTo)) {
      return setSubmitError("Los rangos de precio deben ser valores numéricos.");
    }

    if (Number(priceFrom) > Number(priceTo)) {
      return setSubmitError("El precio 'desde' no puede ser mayor que el 'hasta'.");
    }

    if (!validateNumber(capacityMin)) {
      return setSubmitError("La capacidad mínima debe ser un número.");
    }

    if (capacityMax && !validateNumber(capacityMax)) {
      return setSubmitError("La capacidad máxima debe ser un número.");
    }

    if (capacityMax && Number(capacityMin) > Number(capacityMax)) {
      return setSubmitError("La capacidad mínima no puede ser mayor que la máxima.");
    }

    const sellingPoints = sellingPointsList;
    persistDraft(profileData);

    try {
      setIsSubmitting(true);

      if (authMode === "register") {
        if (!basicData?.companyName || !basicData?.ownerName || !basicData?.email) {
          setSubmitError("Primero completa el registro inicial (Paso 1).");
          return;
        }

        if (!validateCreatePassword()) return;

        const payload = {
          email: String(basicData.email || "").trim().toLowerCase(),
          password: securityData.password.trim(),

          companyName: String(basicData.companyName || "").trim(),
          ownerName: String(basicData.ownerName || "").trim(),
          phone: normalizePhoneDigits(basicData.phone || ""),

          venueName: profileData.venueName,
          venueLocation: profileData.venueLocation,
          businessCategory: profileData.businessCategory,
          localityArea: profileData.localityArea,

          locationPlaceId: profileData.locationPlaceId || null,
          locationLat: profileData.locationLat || null,
          locationLng: profileData.locationLng || null,

          capacityMin: Number(profileData.capacityMin),
          capacityMax: profileData.capacityMax ? Number(profileData.capacityMax) : null,

          priceFrom: Number(profileData.priceFrom),
          priceTo: Number(profileData.priceTo),

          shortDescription: profileData.shortDescription,
          description: profileData.description,
          services: profileData.services,

          spaces: profileData.spaces || null,
          rules: profileData.rules || null,

          website: profileData.website || null,
          instagram: profileData.instagram || null,
          facebook: profileData.facebook || null,

          mapText: profileData.mapText || null,

          eventTypes: Array.isArray(profileData.eventTypes) ? profileData.eventTypes : [],
          sellingPoints,
          sellingPointsText: profileData.sellingPointsText || "",
        };

        const data = await apiJson("/providers/register", { method: "POST", body: payload });

        setProviderSession({ token: data?.token, provider: data?.provider });

        const savedProfileId = data?.profile?.id || null;
        const mapped = mapApiProfileToProfileData(data?.profile);

        if (mapped) {
          persistDraft(mapped);
          setProfileData((prev) => ({ ...prev, ...mapped, photos: prev.photos || [] }));
        }

        if (data?.token && savedProfileId) {
          await uploadSelectedPhotosToBackend(data.token, savedProfileId);
        }

        setSubmitSuccess("Cuenta creada y ficha guardada correctamente.");
        navigate("/proveedores/mi-perfil?mode=provider", {
          state: { basicData: basicData || null },
        });
        return;
      }

      const basePayload = {
        companyName: basicData?.companyName ? String(basicData.companyName).trim() : undefined,
        ownerName: basicData?.ownerName ? String(basicData.ownerName).trim() : undefined,
        phone: basicData?.phone ? normalizePhoneDigits(basicData.phone) : undefined,

        venueName: profileData.venueName,
        venueLocation: profileData.venueLocation,
        businessCategory: profileData.businessCategory,
        localityArea: profileData.localityArea,

        locationPlaceId: profileData.locationPlaceId || null,
        locationLat: profileData.locationLat || null,
        locationLng: profileData.locationLng || null,

        capacityMin: Number(profileData.capacityMin),
        capacityMax: profileData.capacityMax ? Number(profileData.capacityMax) : null,

        priceFrom: Number(profileData.priceFrom),
        priceTo: Number(profileData.priceTo),

        shortDescription: profileData.shortDescription,
        description: profileData.description,
        services: profileData.services,

        spaces: profileData.spaces || null,
        rules: profileData.rules || null,

        website: profileData.website || null,
        instagram: profileData.instagram || null,
        facebook: profileData.facebook || null,

        mapText: profileData.mapText || null,

        eventTypes: Array.isArray(profileData.eventTypes) ? profileData.eventTypes : [],
        sellingPoints,
        sellingPointsText: profileData.sellingPointsText || "",
      };

if (isAdminCompletingInvitation) {
  if (!adminInvitationId) {
    setSubmitError("No se encontró la invitación admin para completar este perfil.");
    return;
  }

  const data = await adminApiFetch(
    `/admin/provider-invitations/${adminInvitationId}/complete-profile`,
    {
      method: "POST",
      body: JSON.stringify(basePayload),
    }
  );

  const savedProfileId = data?.profile?.id || null;

  const mapped = mapApiProfileToProfileData(data?.profile);
  if (mapped) {
    persistDraft(mapped);
    setProfileData((prev) => ({ ...prev, ...mapped, photos: prev.photos || [] }));
  }

  if (savedProfileId) {
    await uploadSelectedPhotosToBackend(null, savedProfileId);
  }

  setSubmitSuccess("Perfil completado correctamente. Ya quedó listo para revisión en admin.");

  setTimeout(() => {
    navigate("/admin", { replace: true });
  }, 800);

  return;
}

      const token = getProviderToken();
      if (!token) {
        setSubmitError("No hay sesión activa. Inicia sesión como proveedor primero.");
        navigate(LOGIN_ROUTE, { state: { from: EDIT_ROUTE } });
        return;
      }

      let data = null;
      let savedProfileId = activeServiceId || null;
      let successMessage = "Cambios guardados correctamente.";

      if (isCreatingNewService) {
        data = await apiJson("/providers/my-services", {
          method: "POST",
          token,
          body: basePayload,
        });
        savedProfileId = data?.profile?.id || null;
        successMessage = "Nuevo servicio guardado correctamente.";
      } else if (activeServiceId) {
        data = await apiJson(`/providers/my-services/${activeServiceId}`, {
          method: "PUT",
          token,
          body: basePayload,
        });
        savedProfileId = activeServiceId;
      } else {
        data = await apiJson("/providers/me", { method: "PUT", token, body: basePayload });
        savedProfileId = data?.profile?.id || null;
      }

      if (savedProfileId) {
        await uploadSelectedPhotosToBackend(token, savedProfileId);
        await loadProviderWorkspace(token, { preferredServiceId: savedProfileId });
      }

      setSubmitSuccess(successMessage);
    } catch (err) {
      setSubmitError(String(err?.message || "No se pudo guardar."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoPreview = () => {
    if (isAdminCompletingInvitation) {
      navigate("/admin", { replace: true });
      return;
    }

    navigate("/proveedores/mi-perfil?mode=provider", {
      state: { basicData: basicData || null },
    });
  };

  return (
    <div className="business-profile">
      <header className="business-profile__header">
        <div className="container business-profile__header-inner">
          <NavLink
            to="/empresas"
            className="business-profile__logo-link"
            aria-label="Volver al área de empresas"
          >
            <img src={Kelom} alt="Logo Kelom" title="Kelom" />
          </NavLink>

          <span className="business-profile__logo-text">Kelom · Perfil de proveedor</span>

          <span className="business-profile__logo-pill">
            {authMode === "register" ? "REGISTRO" : "EDICIÓN"}
          </span>
        </div>
      </header>

      <main className="business-profile__content">
        <div className="business-profile__container">
          <div className="profile-layout">
            <section className="profile-card">
              <p className="profile-card__eyebrow">Ficha visible para parejas</p>
              <h1 className="profile-card__title">Completa tu perfil</h1>

              {providerEmail && (
                <p className="profile-card__subtitle" style={{ marginTop: "-0.6rem" }}>
                  Cuenta: <strong>{providerEmail}</strong>
                </p>
              )}

              {authMode === "edit" && !isAdminCompletingInvitation && (
                <section
                  style={{
                    marginBottom: "1.2rem",
                    padding: "1rem",
                    borderRadius: "1rem",
                    border: "1px solid rgba(186, 102, 120, 0.16)",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,244,247,0.82))",
                    boxShadow: "0 12px 28px rgba(31, 23, 26, 0.06)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "1rem",
                      flexWrap: "wrap",
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <p
                        style={{
                          margin: "0 0 0.35rem",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "#8f4d5b",
                        }}
                      >
                        Administra tus servicios
                      </p>
                      <h2
                        style={{
                          margin: 0,
                          fontSize: "1.15rem",
                          color: "#1f171a",
                        }}
                      >
                        Una sola cuenta, varios escaparates
                      </h2>
                      <p
                        style={{
                          margin: "0.45rem 0 0",
                          color: "#6a5961",
                          lineHeight: 1.6,
                          maxWidth: "48rem",
                        }}
                      >
                        Aquí puedes moverte entre tus fichas, editar una existente o dar de alta
                        otra nueva dentro de la misma cuenta.
                      </p>
                    </div>

                    <div style={{ minWidth: "260px", flex: "0 0 auto" }}>
                      <button
                        type="button"
                        className="btn btn--primary"
                        onClick={handleStartNewService}
                        disabled={
                          !canAddService || isSubmitting || isUploadingPhotos || isLoadingWorkspace
                        }
                        style={{ width: "100%", justifyContent: "center" }}
                      >
                        Agregar otro servicio
                      </button>

                      {!canAddService && (
                        <p
                          style={{
                            margin: "0.55rem 0 0",
                            fontSize: "0.84rem",
                            color: "#6a5961",
                            lineHeight: 1.5,
                          }}
                        >
                          Este botón se activa cuando al menos una de tus fichas ya está aprobada y
                          visible en el catálogo.
                        </p>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gap: "0.75rem",
                      marginTop: "1rem",
                    }}
                  >
                    {providerServices.map((service) => {
                      const meta = getServiceStatusMeta(service);
                      const isSelected =
                        !isCreatingNewService && service.id === activeServiceId;

                      return (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => handleSelectService(service.id)}
                          disabled={isSubmitting || isUploadingPhotos || isLoadingWorkspace}
                          style={{
                            width: "100%",
                            textAlign: "left",
                            borderRadius: "1rem",
                            border: isSelected
                              ? "1px solid rgba(186, 102, 120, 0.44)"
                              : "1px solid rgba(186, 102, 120, 0.16)",
                            background: isSelected
                              ? "linear-gradient(180deg, rgba(255,255,255,1), rgba(255,240,244,0.92))"
                              : "#fff",
                            padding: "0.95rem 1rem",
                            cursor: "pointer",
                            boxShadow: isSelected
                              ? "0 10px 24px rgba(186, 102, 120, 0.10)"
                              : "0 6px 14px rgba(31, 23, 26, 0.04)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: "1rem",
                              alignItems: "flex-start",
                              flexWrap: "wrap",
                            }}
                          >
                            <div style={{ minWidth: 0 }}>
                              <strong
                                style={{
                                  display: "block",
                                  color: "#1f171a",
                                  fontSize: "0.98rem",
                                }}
                              >
                                {service.venue_name || "Servicio sin nombre"}
                              </strong>

                              <span
                                style={{
                                  display: "block",
                                  marginTop: "0.2rem",
                                  color: "#6a5961",
                                  fontSize: "0.88rem",
                                }}
                              >
                                {service.business_category || "Categoría pendiente"}
                                {service.locality_area ? ` · ${service.locality_area}` : ""}
                              </span>

                              <span
                                style={{
                                  display: "block",
                                  marginTop: "0.28rem",
                                  color: "#7b6b72",
                                  fontSize: "0.82rem",
                                }}
                              >
                                {service.venue_location || "Ubicación pendiente"}
                              </span>
                            </div>

                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-end",
                                gap: "0.4rem",
                              }}
                            >
                              <span
                                style={{
                                  padding: "0.35rem 0.7rem",
                                  borderRadius: "999px",
                                  background: meta.background,
                                  border: `1px solid ${meta.borderColor}`,
                                  color: meta.color,
                                  fontSize: "0.78rem",
                                  fontWeight: 700,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {meta.label}
                              </span>

                              <span
                                style={{
                                  fontSize: "0.78rem",
                                  color: "#8f4d5b",
                                  fontWeight: 700,
                                }}
                              >
                                {service.photo_count || 0} foto(s)
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}

                    {isCreatingNewService && (
                      <div
                        style={{
                          borderRadius: "1rem",
                          border: "1px dashed rgba(186, 102, 120, 0.32)",
                          background: "rgba(255, 250, 251, 0.92)",
                          padding: "0.95rem 1rem",
                        }}
                      >
                        <strong
                          style={{
                            display: "block",
                            color: "#1f171a",
                            fontSize: "0.98rem",
                          }}
                        >
                          Nuevo servicio
                        </strong>
                        <span
                          style={{
                            display: "block",
                            marginTop: "0.28rem",
                            color: "#6a5961",
                            fontSize: "0.88rem",
                            lineHeight: 1.55,
                          }}
                        >
                          Estás llenando una ficha nueva. Cuando la guardes, entrará a revisión del
                          admin antes de mostrarse en el catálogo.
                        </span>
                      </div>
                    )}
                  </div>
                </section>
              )}

              <div className="profile-progress">
                <div className="profile-progress__row">
                  <span className="profile-progress__label">Progreso del perfil</span>
                  <span className="profile-progress__value">{completion.percent}%</span>
                </div>
                <div className="profile-progress__bar" aria-hidden="true">
                  <div
                    className="profile-progress__fill"
                    style={{ width: `${completion.percent}%` }}
                  />
                </div>
              </div>

              {authMode === "edit" && !isCreatingNewService && activeService && !isAdminCompletingInvitation && (
                <div
                  style={{
                    marginBottom: "0.85rem",
                    padding: "0.85rem 1rem",
                    borderRadius: "0.95rem",
                    background: activeServiceStatusMeta.background,
                    border: `1px solid ${activeServiceStatusMeta.borderColor}`,
                    color: activeServiceStatusMeta.color,
                    fontWeight: 700,
                    display: "inline-flex",
                    gap: "0.5rem",
                    alignItems: "center",
                  }}
                >
                  <span>Estado de esta ficha:</span>
                  <span>{activeServiceStatusMeta.label}</span>
                </div>
              )}

              {submitError && (
                <div className="form__error" style={{ marginBottom: "0.8rem" }}>
                  {submitError}
                </div>
              )}

              {submitSuccess && (
                <div
                  className="form__error"
                  style={{ marginBottom: "0.8rem", color: "green" }}
                >
                  {submitSuccess}
                </div>
              )}

              <form className="form form--grid" onSubmit={handleSubmit} noValidate>
                <div className="form__field form__field--full">
                  <label className="form__label" htmlFor="venueName">
                    Nombre que verán las parejas *
                  </label>
                  <input
                    id="venueName"
                    name="venueName"
                    type="text"
                    className="form__input"
                    value={profileData.venueName}
                    onChange={handleProfileChange}
                    required
                  />
                </div>

                <div className="form__field form__field--full">
                  <label className="form__label" htmlFor="businessCategory">
                    Categoría del negocio *
                  </label>
                  <select
                    id="businessCategory"
                    name="businessCategory"
                    className="form__input"
                    value={profileData.businessCategory}
                    onChange={handleProfileChange}
                    required
                  >
                    <option value="" disabled>
                      Selecciona una categoría
                    </option>
                    {BUSINESS_CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <p className="form__hint" style={{ marginTop: "0.35rem" }}>
                    Esto se usa para que las parejas te encuentren en el buscador.
                  </p>
                </div>

                <div className="form__field form__field--full">
                  <label className="form__label" htmlFor="localityArea">
                    Alcaldía o municipio *
                  </label>
                  <select
                    id="localityArea"
                    name="localityArea"
                    className="form__input"
                    value={profileData.localityArea}
                    onChange={handleProfileChange}
                    required
                  >
                    <option value="" disabled>
                      Selecciona tu alcaldía o municipio
                    </option>
                    {LOCALITY_AREA_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <p className="form__hint" style={{ marginTop: "0.35rem" }}>
                    Esto hace que tu negocio aparezca por zona aunque la dirección no lo incluya.
                  </p>
                </div>

                <div className="form__field form__field--full">
                  <label className="form__label" htmlFor="venueLocation">
                    Ubicación *
                  </label>
                  <input
                    ref={locationInputRef}
                    id="venueLocation"
                    name="venueLocation"
                    type="text"
                    className="form__input"
                    placeholder="Empieza a escribir tu dirección…"
                    value={profileData.venueLocation}
                    onChange={handleProfileChange}
                    required
                    autoComplete="off"
                  />
                  <p className="form__hint" style={{ marginTop: "0.35rem" }}>
                    {hasGeo
                      ? "Ubicación verificada en Google Maps ✅"
                      : "Tip: elige una sugerencia del autocompletado para activar el mapa."}
                  </p>
                </div>

                <div className="form__field">
                  <label className="form__label" htmlFor="capacityMin">
                    Capacidad mínima *
                  </label>
                  <input
                    id="capacityMin"
                    name="capacityMin"
                    type="number"
                    className="form__input"
                    value={profileData.capacityMin}
                    onChange={handleProfileChange}
                    required
                  />
                </div>

                <div className="form__field">
                  <label className="form__label" htmlFor="capacityMax">
                    Capacidad máxima (opcional)
                  </label>
                  <input
                    id="capacityMax"
                    name="capacityMax"
                    type="number"
                    className="form__input"
                    value={profileData.capacityMax}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="form__field">
                  <label className="form__label" htmlFor="priceFrom">
                    Precio desde (MXN) *
                  </label>
                  <input
                    id="priceFrom"
                    name="priceFrom"
                    type="number"
                    className="form__input"
                    value={profileData.priceFrom}
                    onChange={handleProfileChange}
                    required
                  />
                </div>

                <div className="form__field">
                  <label className="form__label" htmlFor="priceTo">
                    Precio hasta (MXN) *
                  </label>
                  <input
                    id="priceTo"
                    name="priceTo"
                    type="number"
                    className="form__input"
                    value={profileData.priceTo}
                    onChange={handleProfileChange}
                    required
                  />
                </div>

                <div className="form__field form__field--full">
                  <label className="form__label" htmlFor="shortDescription">
                    Descripción corta *
                  </label>
                  <textarea
                    id="shortDescription"
                    name="shortDescription"
                    className="form__textarea"
                    rows={3}
                    value={profileData.shortDescription}
                    onChange={handleProfileChange}
                    required
                  />
                </div>

                <div className="form__field form__field--full">
                  <label className="form__label">Tipos de evento (chips)</label>
                  <div className="chip-grid">
                    {EVENT_TYPE_OPTIONS.map((label) => (
                      <label
                        key={label}
                        className={
                          profileData.eventTypes.includes(label)
                            ? "chip-option chip-option--active"
                            : "chip-option"
                        }
                      >
                        <input
                          type="checkbox"
                          checked={profileData.eventTypes.includes(label)}
                          onChange={() => toggleEventType(label)}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                  <p className="form__hint" style={{ marginTop: "0.55rem" }}>
                    Puedes elegir varios.
                  </p>
                </div>

                <div className="form__field form__field--full">
                  <label className="form__label" htmlFor="sellingPointsText">
                    Puntos destacados (uno por línea)
                  </label>
                  <textarea
                    id="sellingPointsText"
                    name="sellingPointsText"
                    className="form__textarea"
                    rows={4}
                    value={profileData.sellingPointsText}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="form__field form__field--full">
                  <label className="form__label" htmlFor="description">
                    Sobre este lugar (descripción completa) *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className="form__textarea"
                    rows={5}
                    value={profileData.description}
                    onChange={handleProfileChange}
                    required
                  />
                </div>

                <div className="form__field form__field--full">
                  <label className="form__label" htmlFor="services">
                    Servicios que ofrecen *
                  </label>
                  <textarea
                    id="services"
                    name="services"
                    className="form__textarea"
                    rows={3}
                    value={profileData.services}
                    onChange={handleProfileChange}
                    required
                  />
                </div>

                <div className="form__field form__field--full">
                  <label className="form__label" htmlFor="mapText">
                    Ubicación y accesos (texto)
                  </label>
                  <textarea
                    id="mapText"
                    name="mapText"
                    className="form__textarea"
                    rows={3}
                    value={profileData.mapText}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="form__field form__field--full">
                  <label className="form__label">Fotografías del lugar</label>
                  <p className="form__hint" style={{ marginTop: "0.35rem", marginBottom: "0.55rem" }}>
                    Formatos permitidos: JPG, PNG o WebP. Máximo 5MB por imagen y hasta 2500x2500 px.
                  </p>

                  {(serverPhotos || []).length > 0 && (
                    <div className="dropzone__thumbs" aria-label="Fotos guardadas">
                      {serverPhotos.map((p, idx) => (
                        <div className="thumb" key={p.id}>
                          <img
                            src={toAbsoluteApiUrl(p.url)}
                            alt={`Foto guardada ${idx + 1}`}
                            className="thumb__img"
                          />
                          {idx === 0 && <span className="thumb__badge">Principal</span>}
                          <button
                            type="button"
                            className="thumb__remove"
                            onClick={() => deleteServerPhoto(p.id)}
                            disabled={isUploadingPhotos || isSubmitting}
                            title="Eliminar"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div
                    className={isDragActive ? "dropzone dropzone--active" : "dropzone"}
                    onClick={openFilePicker}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    role="button"
                    tabIndex={0}
                    aria-label="Arrastra o selecciona fotos"
                    onKeyDown={(ev) => {
                      if (ev.key === "Enter" || ev.key === " ") openFilePicker();
                    }}
                  >
                    <div className="dropzone__inner">
                      <div className="dropzone__icon" aria-hidden="true">
                        ⬆️
                      </div>
                      <p className="dropzone__title">Arrastra tus fotos aquí</p>
                      <p className="dropzone__subtitle">o</p>

                      <button
                        type="button"
                        className="dropzone__button"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          openFilePicker();
                        }}
                        disabled={isUploadingPhotos || isSubmitting}
                      >
                        Seleccionar fotos
                      </button>

                      {(profileData.photos || []).length > 0 && (
                        <p className="dropzone__count">
                          {profileData.photos.length} foto(s) lista(s) para subir
                        </p>
                      )}
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      className="dropzone__input"
                      onChange={handlePhotoInputChange}
                      disabled={isUploadingPhotos || isSubmitting}
                    />
                  </div>

                  {photoError && (
                    <div className="form__error" style={{ marginTop: "0.6rem" }}>
                      {photoError}
                    </div>
                  )}

                  {photoPreviews.length > 0 && (
                    <div className="dropzone__thumbs" aria-label="Fotos nuevas">
                      {photoPreviews.map((src, idx) => (
                        <div className="thumb" key={`${src}-${idx}`}>
                          <img
                            src={src}
                            alt={`Foto seleccionada ${idx + 1}`}
                            className="thumb__img"
                          />
                          {idx === 0 && <span className="thumb__badge">Principal</span>}
                          <button
                            type="button"
                            className="thumb__remove"
                            onClick={() => removeLocalPhotoAt(idx)}
                            disabled={isUploadingPhotos || isSubmitting}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form__field form__field--full">
                  <div className="security-card">
                    <h3 className="security-card__title">Seguridad</h3>

              {authMode === "register" ? (
  <>
    <p className="security-card__subtitle">
      Crea tu contraseña para poder entrar a tu panel después.
    </p>

    <div className="security-card__grid">
      <div className="form__field">
        <label className="form__label" htmlFor="password">
          Crear contraseña *
        </label>
        <input
          id="password"
          name="password"
          type={showSecurity.password ? "text" : "password"}
          className="form__input"
          value={securityData.password}
          onChange={handleSecurityChange}
          autoComplete="new-password"
          disabled={isSubmitting}
        />
        <label className="form__toggle">
          <input
            type="checkbox"
            checked={showSecurity.password}
            onChange={() => toggleShow("password")}
          />
          Mostrar
        </label>
      </div>

      <div className="form__field">
        <label className="form__label" htmlFor="confirmPassword">
          Confirmar contraseña *
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type={showSecurity.confirmPassword ? "text" : "password"}
          className="form__input"
          value={securityData.confirmPassword}
          onChange={handleSecurityChange}
          autoComplete="new-password"
          disabled={isSubmitting}
        />
        <label className="form__toggle">
          <input
            type="checkbox"
            checked={showSecurity.confirmPassword}
            onChange={() => toggleShow("confirmPassword")}
          />
          Mostrar
        </label>
      </div>
    </div>
  </>
) : (
  <>
    <p className="security-card__subtitle">
      {isAdminCompletingInvitation
        ? "Este perfil se está completando desde administración."
        : "Puedes cambiar tu contraseña cuando quieras."}
    </p>

{isAdminCompletingInvitation ? (
  <div className="security-card__actions">
    <button
      type="button"
      className="btn btn--ghost"
      disabled={isSubmitting}
      onClick={async () => {
        if (!adminInvitationId) {
          setSubmitError("No se encontró la invitación admin para generar el acceso.");
          return;
        }

        try {
          setSubmitError("");
          setSubmitSuccess("");
          setIsSubmitting(true);

          const data = await adminApiFetch(
            `/admin/provider-invitations/${adminInvitationId}/generate-password`,
            { method: "POST" }
          );

          setSubmitSuccess(
            data?.message || "Correo de acceso enviado correctamente."
          );
        } catch (err) {
          setSubmitError(
            String(err?.message || "No se pudo generar y enviar el acceso.")
          );
        } finally {
          setIsSubmitting(false);
        }
      }}
    >
      Generar contraseña y enviar acceso
    </button>
  </div>
) : (
      <>
        <div className="security-card__grid">
          <div className="form__field">
            <label className="form__label" htmlFor="currentPassword">
              Contraseña actual
            </label>
            <input
              id="currentPassword"
              name="currentPassword"
              type={showSecurity.currentPassword ? "text" : "password"}
              className="form__input"
              value={securityData.currentPassword}
              onChange={handleSecurityChange}
              autoComplete="current-password"
              disabled={isSubmitting}
            />
            <label className="form__toggle">
              <input
                type="checkbox"
                checked={showSecurity.currentPassword}
                onChange={() => toggleShow("currentPassword")}
              />
              Mostrar
            </label>
          </div>

          <div className="form__field">
            <label className="form__label" htmlFor="newPassword">
              Nueva contraseña
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type={showSecurity.newPassword ? "text" : "password"}
              className="form__input"
              value={securityData.newPassword}
              onChange={handleSecurityChange}
              autoComplete="new-password"
              disabled={isSubmitting}
            />
            <label className="form__toggle">
              <input
                type="checkbox"
                checked={showSecurity.newPassword}
                onChange={() => toggleShow("newPassword")}
              />
              Mostrar
            </label>
          </div>

          <div className="form__field form__field--full">
            <label className="form__label" htmlFor="confirmNewPassword">
              Confirmar nueva contraseña
            </label>
            <input
              id="confirmNewPassword"
              name="confirmNewPassword"
              type={showSecurity.confirmNewPassword ? "text" : "password"}
              className="form__input"
              value={securityData.confirmNewPassword}
              onChange={handleSecurityChange}
              autoComplete="new-password"
              disabled={isSubmitting}
            />
            <label className="form__toggle">
              <input
                type="checkbox"
                checked={showSecurity.confirmNewPassword}
                onChange={() => toggleShow("confirmNewPassword")}
              />
              Mostrar
            </label>
          </div>
        </div>

        <div className="security-card__actions">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={handleChangePassword}
            disabled={isSubmitting}
          >
            Actualizar contraseña
          </button>
        </div>
      </>
    )}
  </>
)}
                  </div>
                </div>

                <div className="form__actions form__field--full" style={{ gap: "0.7rem" }}>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => navigate("/empresas/registro")}
                    disabled={isSubmitting || isLoadingWorkspace}
                  >
                    Volver al registro inicial
                  </button>

                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={handleGoPreview}
                    disabled={isSubmitting || isLoadingWorkspace}
                  >
                    {isAdminCompletingInvitation ? "Volver al admin" : "Ver mi perfil (vista proveedor)"}
                  </button>

                  <button
                    type="submit"
                    className="btn btn--primary"
                    disabled={isSubmitting || isLoadingWorkspace}
                  >
                    {isSubmitting
                      ? "Guardando..."
                      : authMode === "register"
                        ? "Crear cuenta y guardar ficha"
                        : isAdminCompletingInvitation
                          ? "Guardar perfil y enviar a revisión"
                          : isCreatingNewService
                            ? "Guardar nuevo servicio"
                            : "Guardar cambios"}
                  </button>
                </div>
              </form>
            </section>

            <aside className="profile-preview">
              <section className="preview-card">
                <span className="preview-card__pill">Vista previa</span>
                <h2 className="preview-card__title">
                  {profileData.venueName || "Nombre del lugar"}
                </h2>

                {(profileData.businessCategory || profileData.localityArea) && (
                  <p className="preview-card__subtitle" style={{ marginTop: "-0.25rem" }}>
                    <strong>
                      {profileData.businessCategory || "Categoría"}
                      {profileData.localityArea ? ` · ${profileData.localityArea}` : ""}
                    </strong>
                  </p>
                )}

                {authMode === "edit" && !isCreatingNewService && activeService && !isAdminCompletingInvitation && (
                  <p
                    className="preview-card__subtitle"
                    style={{
                      marginTop: "-0.1rem",
                      color: activeServiceStatusMeta.color,
                      fontWeight: 700,
                    }}
                  >
                    {activeServiceStatusMeta.label}
                  </p>
                )}

                {isCreatingNewService && authMode === "edit" && !isAdminCompletingInvitation && (
                  <p
                    className="preview-card__subtitle"
                    style={{
                      marginTop: "-0.1rem",
                      color: "#8f4d5b",
                      fontWeight: 700,
                    }}
                  >
                    Nueva ficha en preparación
                  </p>
                )}

                {isAdminCompletingInvitation && (
                  <p
                    className="preview-card__subtitle"
                    style={{
                      marginTop: "-0.1rem",
                      color: "#8f4d5b",
                      fontWeight: 700,
                    }}
                  >
                    Flujo de administración · quedará pendiente de revisión
                  </p>
                )}

                <p className="preview-card__subtitle">
                  {profileData.venueLocation || "Ubicación del venue"}
                </p>

                <div className="preview-card__photo-main">
                  <img src={mainPhoto} alt="Vista previa del venue" />
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>

      <footer className="business-profile__footer">
        © {new Date().getFullYear()} Kelom · Área para proveedores.
      </footer>
    </div>
  );
}

export default BusinessRegisterCompletePage;