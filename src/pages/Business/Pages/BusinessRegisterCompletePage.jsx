// src/pages/Business/Pages/BusinessRegisterCompletePage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import "../../../../Blocks/Business/BusinessAuth.css";
import Kelom from "../../../assets/web/logo/logoKelom.png";
import {
  getProviderToken,
  setProviderSession,
  clearProviderSession,
} from "../../../services/providerAuth";

const API_BASE = import.meta.env.VITE_API_URL || "https://api.kelom.com.mx";

const PROVIDER_BASIC_DRAFT_KEY = "kelom_provider_basic_draft";
const PROVIDER_PROFILE_DRAFT_KEY = "kelom_provider_profile_draft";

const EDIT_ROUTE = "/empresas/registro/completar";

const BUSINESS_CATEGORY_OPTIONS = [
  "Jardín",
  "Hacienda",
  "Salón",
  "Banquetes", // antes "Catering"
  "Organizador para Bodas",
  "Vestidos",  // ✅ nuevo
  "Pasteles",
  "DJ",
  "Florería",
  "Fotógrafo",
];
// ✅ NUEVO: Alcaldías CDMX + Municipios EdoMex (campo obligatorio)
const LOCALITY_AREA_OPTIONS = [
  // CDMX
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
  // EdoMex
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

    // ✅ NUEVO
    localityArea: profile.locality_area || profile.localityArea || "",

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
    description: profile.description || "",
    spaces: profile.spaces || "",
    services: profile.services || "",
    rules: profile.rules || "",

    website: profile.website || "",
    instagram: profile.instagram || "",
    facebook: profile.facebook || "",

    mapText: profile.map_text || "",

    eventTypes: Array.isArray(profile.event_types) ? profile.event_types : [],
    sellingPointsText: sellingPointsArr.length ? sellingPointsArr.join("\n") : "",

    photos: [], // File objects locales (aquí no llegan)
  };
}

function buildSellingPointsList(sellingPointsText) {
  return String(sellingPointsText || "")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
}

function BusinessRegisterCompletePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const stateBasicData = location.state?.basicData || null;
  const prefillProfileData = location.state?.prefillProfileData || null;

  const authModeFromState = location.state?.authMode || null; // "register" | "edit"
  const loginEmailFromState = location.state?.loginEmail || "";

  // ============ BASIC DATA (lead) ============
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

  const tokenAtStart = useMemo(() => getProviderToken(), []);
  const isLoggedIn = !!tokenAtStart;

  const authMode = useMemo(() => {
    if (isLoggedIn) return "edit";
    if (authModeFromState) return authModeFromState;
    if (prefillProfileData) return "edit";
    return "register";
  }, [isLoggedIn, authModeFromState, prefillProfileData]);

  // ✅ GUARD: si estás en EDICIÓN pero NO hay token → login
  useEffect(() => {
    if (authMode !== "edit") return;

    const token = getProviderToken();
    if (!token) {
      navigate("/empresas/login", {
        replace: true,
        state: { from: EDIT_ROUTE },
      });
    }
  }, [authMode, navigate]);

  // ============ PROFILE DATA ============
  const [profileData, setProfileData] = useState(() => {
    if (prefillProfileData) {
      return {
        venueName: prefillProfileData.venueName || "",
        venueLocation: prefillProfileData.venueLocation || "",

        businessCategory:
          prefillProfileData.businessCategory ||
          prefillProfileData.business_category ||
          prefillProfileData.category ||
          "",

        // ✅ NUEVO
        localityArea:
          prefillProfileData.localityArea ||
          prefillProfileData.locality_area ||
          prefillProfileData.area ||
          "",

        locationPlaceId: prefillProfileData.locationPlaceId || "",
        locationLat:
          prefillProfileData.locationLat ??
          prefillProfileData.lat ??
          prefillProfileData.location?.lat ??
          "",
        locationLng:
          prefillProfileData.locationLng ??
          prefillProfileData.lng ??
          prefillProfileData.location?.lng ??
          "",

        capacityMin: prefillProfileData.capacityMin || "",
        capacityMax: prefillProfileData.capacityMax || "",
        priceFrom: prefillProfileData.priceFrom || "",
        priceTo: prefillProfileData.priceTo || "",
        shortDescription: prefillProfileData.shortDescription || "",
        eventTypes: Array.isArray(prefillProfileData.eventTypes)
          ? prefillProfileData.eventTypes
          : [],
        sellingPointsText: prefillProfileData.sellingPointsText || "",
        mapText: prefillProfileData.mapText || "",
        description: prefillProfileData.description || "",
        spaces: prefillProfileData.spaces || "",
        services: prefillProfileData.services || "",
        rules: prefillProfileData.rules || "",
        website: prefillProfileData.website || "",
        instagram: prefillProfileData.instagram || "",
        facebook: prefillProfileData.facebook || "",
        photos: Array.isArray(prefillProfileData.photos)
          ? prefillProfileData.photos
          : [],
      };
    }

    try {
      const draft = localStorage.getItem(PROVIDER_PROFILE_DRAFT_KEY);
      const parsed = draft ? safeParse(draft) : null;

      if (parsed) {
        return {
          venueName: parsed.venueName || "",
          venueLocation: parsed.venueLocation || "",

          businessCategory: parsed.businessCategory || "",

          // ✅ NUEVO
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

    return {
      venueName: "",
      venueLocation: "",

      businessCategory: "",
      // ✅ NUEVO
      localityArea: "",

      locationPlaceId: "",
      locationLat: "",
      locationLng: "",

      capacityMin: "",
      capacityMax: "",
      priceFrom: "",
      priceTo: "",
      shortDescription: "",
      eventTypes: [],
      sellingPointsText: "",
      mapText: "",
      description: "",
      spaces: "",
      services: "",
      rules: "",
      website: "",
      instagram: "",
      facebook: "",
      photos: [],
    };
  });

  // ============ SERVER PHOTOS (backend) ============
  const [serverPhotos, setServerPhotos] = useState([]);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);

  // ============ UX / API ============
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============ Security ============
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

  // ============ Dropzone (local photos) ============
  const fileInputRef = useRef(null);
  const [isDragActive, setIsDragActive] = useState(false);

  // ============ Google Places Autocomplete ============
  const locationInputRef = useRef(null);
  const autocompleteListenerRef = useRef(null);
  const autocompleteRef = useRef(null);

  // ========= API helpers =========
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

  // ========= Load provider profile if token exists =========
  useEffect(() => {
    const token = getProviderToken();
    if (!token) return;
    if (prefillProfileData) return;

    let cancelled = false;

    apiJson("/providers/me", { token })
      .then((data) => {
        if (cancelled) return;

        if (data?.provider?.email || data?.profile?.company_name) {
          setBasicData((prev) => ({
            companyName: data?.profile?.company_name || prev?.companyName || "",
            ownerName: data?.profile?.owner_name || prev?.ownerName || "",
            phone: data?.profile?.phone || prev?.phone || "",
            email: data?.provider?.email || prev?.email || "",
          }));
        }

        const mapped = mapApiProfileToProfileData(data?.profile);
        if (mapped) {
          setProfileData((prev) => ({
            ...prev,
            ...mapped,
            photos: prev.photos || [],
          }));
        }

        setServerPhotos(Array.isArray(data?.photos) ? data.photos : []);
      })
      .catch((err) => {
        if (cancelled) return;

        console.warn("No se pudo cargar /providers/me:", err);

        // ✅ Token murió / inválido → limpiamos y mandamos al login (modo pro)
        clearProviderSession();
        navigate("/empresas/login", {
          replace: true,
          state: { from: EDIT_ROUTE },
        });
      });

    return () => {
      cancelled = true;
    };
  }, [prefillProfileData, navigate]);

  // ========= Dropzone handlers =========
  const openFilePicker = () => fileInputRef.current?.click();

  const addPhotos = (files) => {
    const incoming = (files || []).filter((f) => f && f.type?.startsWith("image/"));
    if (incoming.length === 0) return;

    const keyOf = (f) => `${f.name}-${f.size}-${f.lastModified}`;

    setProfileData((prev) => {
      const existing = Array.isArray(prev.photos) ? prev.photos : [];
      const seen = new Set(existing.map(keyOf));
      const merged = [...existing];

      incoming.forEach((f) => {
        const k = keyOf(f);
        if (!seen.has(k)) {
          merged.push(f);
          seen.add(k);
        }
      });

      return { ...prev, photos: merged };
    });
  };

  const handlePhotoInputChange = (e) => {
    const files = Array.from(e.target.files || []);
    addPhotos(files);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    addPhotos(Array.from(e.dataTransfer.files || []));
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

  // ========= Server photos handlers =========
  const uploadSelectedPhotosToBackend = async (token) => {
    const files = Array.isArray(profileData.photos) ? profileData.photos : [];
    if (!files.length) return;

    const fd = new FormData();
    files.forEach((f) => fd.append("photos", f));

    setIsUploadingPhotos(true);
    setSubmitError("");
    try {
      const data = await apiMultipart("/providers/photos", {
        method: "POST",
        token,
        formData: fd,
      });

      const newPhotos = Array.isArray(data?.photos) ? data.photos : [];
      if (newPhotos.length) setServerPhotos((prev) => [...prev, ...newPhotos]);

      setProfileData((prev) => ({ ...prev, photos: [] }));
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
      navigate("/empresas/login", { state: { from: EDIT_ROUTE } });
      return;
    }

    setSubmitError("");
    setSubmitSuccess("");
    setIsUploadingPhotos(true);

    try {
      await apiJson(`/providers/photos/${photoId}`, {
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

  // ========= Security handlers =========
  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSubmitError("");
    setSubmitSuccess("");
    setSecurityData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleShow = (key) => {
    setShowSecurity((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ========= Profile handlers =========
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

  // ========= Google Places Autocomplete =========
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

  // ========= Local previews =========
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
      !!profileData.localityArea.trim(), // ✅ NUEVO
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
      navigate("/empresas/login", { state: { from: EDIT_ROUTE } });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setSubmitError("");
    setSubmitSuccess("");

    const {
      venueName,
      venueLocation,
      businessCategory,
      localityArea, // ✅ NUEVO
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
      !localityArea.trim() || // ✅ NUEVO
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

    if (!validateNumber(priceFrom) || !validateNumber(priceTo))
      return setSubmitError("Los rangos de precio deben ser valores numéricos.");
    if (Number(priceFrom) > Number(priceTo))
      return setSubmitError("El precio 'desde' no puede ser mayor que el 'hasta'.");
    if (!validateNumber(capacityMin))
      return setSubmitError("La capacidad mínima debe ser un número.");
    if (capacityMax && !validateNumber(capacityMax))
      return setSubmitError("La capacidad máxima debe ser un número.");
    if (capacityMax && Number(capacityMin) > Number(capacityMax))
      return setSubmitError("La capacidad mínima no puede ser mayor que la máxima.");

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

          // ✅ NUEVO
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

        const mapped = mapApiProfileToProfileData(data?.profile);
        if (mapped) {
          persistDraft(mapped);
          setProfileData((prev) => ({ ...prev, ...mapped, photos: prev.photos || [] }));
        }

        if (data?.token) await uploadSelectedPhotosToBackend(data.token);

        setSubmitSuccess("Cuenta creada y ficha guardada correctamente.");
        navigate("/proveedores/mi-perfil?mode=provider", {
          state: { basicData: basicData || null },
        });
        return;
      }

      const token = getProviderToken();
      if (!token) {
        setSubmitError("No hay sesión activa. Inicia sesión como proveedor primero.");
        navigate("/empresas/login", { state: { from: EDIT_ROUTE } });
        return;
      }

      const payload = {
        companyName: basicData?.companyName ? String(basicData.companyName).trim() : undefined,
        ownerName: basicData?.ownerName ? String(basicData.ownerName).trim() : undefined,
        phone: basicData?.phone ? normalizePhoneDigits(basicData.phone) : undefined,

        venueName: profileData.venueName,
        venueLocation: profileData.venueLocation,
        businessCategory: profileData.businessCategory,

        // ✅ NUEVO
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

      const data = await apiJson("/providers/me", { method: "PUT", token, body: payload });

      const mapped = mapApiProfileToProfileData(data?.profile);
      if (mapped) {
        persistDraft(mapped);
        setProfileData((prev) => ({ ...prev, ...mapped, photos: prev.photos || [] }));
      }

      await uploadSelectedPhotosToBackend(token);

      const me = await apiJson("/providers/me", { token });
      setServerPhotos(Array.isArray(me?.photos) ? me.photos : []);

      setSubmitSuccess("Cambios guardados correctamente.");
    } catch (err) {
      setSubmitError(String(err?.message || "No se pudo guardar."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoPreview = () => {
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

                {/* ✅ CATEGORÍA OBLIGATORIA */}
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

                {/* ✅ NUEVO: ALCALDÍA/MUNICIPIO OBLIGATORIO */}
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
                      accept="image/*"
                      multiple
                      className="dropzone__input"
                      onChange={handlePhotoInputChange}
                      disabled={isUploadingPhotos || isSubmitting}
                    />
                  </div>

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
                          Puedes cambiar tu contraseña cuando quieras.
                        </p>

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
                  </div>
                </div>

                <div className="form__actions form__field--full" style={{ gap: "0.7rem" }}>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => navigate("/empresas/registro")}
                    disabled={isSubmitting}
                  >
                    Volver al registro inicial
                  </button>

                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={handleGoPreview}
                    disabled={isSubmitting}
                  >
                    Ver mi perfil (vista proveedor)
                  </button>

                  <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
                    {isSubmitting
                      ? "Guardando..."
                      : authMode === "register"
                      ? "Crear cuenta y guardar ficha"
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