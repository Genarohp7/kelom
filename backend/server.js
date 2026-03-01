/* eslint-env node */
/* global process */

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { pool } from "./db.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.set("trust proxy", 1);
app.disable("x-powered-by");

// ✅ Recomendado para que recursos (fotos, etc.) se puedan usar cross-origin sin bronca
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiadas solicitudes. Intenta más tarde." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados intentos. Intenta más tarde." },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados registros desde esta IP. Intenta más tarde." },
});

// Cambiar contraseña (logueado): más estricto que global, pero no tan agresivo
const changePasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados intentos. Intenta más tarde." },
});

// Providers
const providerLeadsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados intentos. Intenta más tarde." },
});

const providerRegisterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados registros. Intenta más tarde." },
});

const providerLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados intentos. Intenta más tarde." },
});

app.use(globalLimiter);

const allowedOrigins = [
  "http://localhost:5173",
  "https://kelom.com.mx",
  "https://www.kelom.com.mx",
  "https://genarohp7.github.io", // ✅ staging GH Pages
];

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Origen no permitido por CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "500kb" }));

// (Opcional pero útil) servir uploads si luego guardas fotos/avatars aquí
app.use("/uploads", express.static("uploads"));

function requireEnv(name) {
  if (!process.env[name]) {
    throw new Error(`Falta variable de entorno: ${name}`);
  }
}

function signToken(payload) {
  requireEnv("JWT_SECRET");
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ error: "No autorizado" });
    }

    requireEnv("JWT_SECRET");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }
    return next();
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

function providerAuthMiddleware(req, res, next) {
  return authMiddleware(req, res, () => {
    const role = req.user?.role;
    if (role !== "provider" && role !== "admin") {
      return res.status(403).json({ error: "Acceso solo para proveedores" });
    }
    return next();
  });
}

function toNullIfEmpty(v) {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s : null;
}

function toIntOrNull(v) {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  const i = Math.trunc(n);
  if (i < 0) return null;
  return i;
}

function toFloatOrNull(v) {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return n;
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

function normalizePhoneDigits(phone) {
  return String(phone || "").replace(/\D/g, "");
}

function isValidMXPhone(phone) {
  const digits = normalizePhoneDigits(phone);
  if (digits.length !== 10) return false;
  // no más de 5 iguales seguidos
  if (/(.)\1{4,}/.test(digits)) return false;

  // evitar secuencias largas tipo 012345 / 987654
  const ascSeq = "0123456789";
  const descSeq = "9876543210";
  for (let i = 0; i <= digits.length - 6; i++) {
    const slice = digits.slice(i, i + 6);
    if (ascSeq.includes(slice) || descSeq.includes(slice)) return false;
  }
  return true;
}

function toTextArray(value, { maxItems = 30, maxLen = 140 } = {}) {
  if (!value) return [];
  let arr = [];

  if (Array.isArray(value)) {
    arr = value;
  } else if (typeof value === "string") {
    const s = value.trim();
    arr = s.includes("\n") ? s.split("\n") : s.split(",");
  } else {
    return [];
  }

  return arr
    .map((x) => String(x).trim())
    .filter(Boolean)
    .map((x) => (x.length > maxLen ? x.slice(0, maxLen) : x))
    .slice(0, maxItems);
}

function isUuid(v) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(v || "")
  );
}

// Health + DB check
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", message: "Kelom API funcionando", db: "ok" });
  } catch {
    res.status(500).json({ status: "error", message: "DB no disponible" });
  }
});

// ===================== USERS (REGISTRO) =====================

app.post("/users", registerLimiter, async (req, res) => {
  try {
    const { email, password, name } = req.body || {};
    const emailNorm = normalizeEmail(email);

    if (!emailNorm || !password) {
      return res.status(400).json({ error: "email y password son obligatorios" });
    }

    if (!isValidEmail(emailNorm)) {
      return res.status(400).json({ error: "email inválido" });
    }

    if (String(password).length < 5) {
      return res.status(400).json({ error: "password mínimo 5 caracteres" });
    }

    const password_hash = await bcrypt.hash(String(password), 10);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name)
       VALUES ($1, $2, $3)
       RETURNING id, email, name, role, created_at`,
      [emailNorm, password_hash, name || null]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    if (err?.code === "23505") {
      return res.status(409).json({ error: "Ese email ya existe" });
    }
    console.error(err);
    res.status(500).json({ error: "Error interno" });
  }
});

// ===================== AUTH =====================

app.post("/auth/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const emailNorm = normalizeEmail(email);

    if (!emailNorm || !password) {
      return res.status(400).json({ error: "email y password son obligatorios" });
    }

    const found = await pool.query(
      `SELECT id, email, password_hash, name, role, created_at
       FROM users
       WHERE email = $1
       LIMIT 1`,
      [emailNorm]
    );

    const user = found.rows[0];
    if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

    const ok = await bcrypt.compare(String(password), user.password_hash);
    if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      created_at: user.created_at,
    };

    return res.json({ token, user: safeUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error interno" });
  }
});

app.get("/auth/me", authMiddleware, async (req, res) => {
  try {
    const { id } = req.user;

    const found = await pool.query(
      `SELECT id, email, name, role, created_at
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [id]
    );

    const user = found.rows[0];
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    return res.json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error interno" });
  }
});

/**
 * Cambiar contraseña (usuario logueado)
 * Body: { currentPassword, newPassword }
 */
app.put("/auth/password", changePasswordLimiter, authMiddleware, async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "currentPassword y newPassword son obligatorios" });
    }

    if (String(newPassword).length < 5) {
      return res.status(400).json({ error: "password mínimo 5 caracteres" });
    }

    const found = await pool.query(
      `SELECT password_hash FROM users WHERE id = $1 LIMIT 1`,
      [userId]
    );

    const row = found.rows[0];
    if (!row) return res.status(404).json({ error: "Usuario no encontrado" });

    const ok = await bcrypt.compare(String(currentPassword), row.password_hash);
    if (!ok) return res.status(401).json({ error: "Contraseña actual incorrecta" });

    const same = await bcrypt.compare(String(newPassword), row.password_hash);
    if (same) {
      return res
        .status(400)
        .json({ error: "La nueva contraseña no puede ser igual a la actual" });
    }

    const newHash = await bcrypt.hash(String(newPassword), 10);

    await pool.query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [
      newHash,
      userId,
    ]);

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error interno" });
  }
});

// ===================== PROFILE (WEDDING PROFILES) =====================

app.get("/profile/me", authMiddleware, async (req, res) => {
  try {
    const { id: userId } = req.user;

    const found = await pool.query(
      `SELECT user_id, phone, gender, partner_name, city, wedding_date, guests,
              budget_range, ceremony_type, reception_type, support_focus,
              biggest_doubt, contact_preference, created_at, updated_at
       FROM wedding_profiles
       WHERE user_id = $1
       LIMIT 1`,
      [userId]
    );

    const profile = found.rows[0] || null;
    return res.json({ profile });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error interno" });
  }
});

app.put("/profile/me", authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const { id: userId } = req.user;
    const body = req.body || {};

    const nameFromBody = toNullIfEmpty(body.name ?? body.fullName);

    const phone = toNullIfEmpty(body.phone);
    const gender = toNullIfEmpty(body.gender);
    const partnerName = toNullIfEmpty(body.partnerName);
    const city = toNullIfEmpty(body.city);
    const weddingDate = toNullIfEmpty(body.weddingDate);
    const guests = toIntOrNull(body.guests);

    const budgetRange = toNullIfEmpty(body.budgetRange);
    const ceremonyType = toNullIfEmpty(body.ceremonyType);
    const receptionType = toNullIfEmpty(body.receptionType);

    const supportFocus = toNullIfEmpty(body.supportFocus);
    const biggestDoubt = toNullIfEmpty(body.biggestDoubt);
    const contactPreference = toNullIfEmpty(body.contactPreference);

    await client.query("BEGIN");

    if (nameFromBody) {
      await client.query(`UPDATE users SET name = $1 WHERE id = $2`, [
        nameFromBody,
        userId,
      ]);
    }

    const upsert = await client.query(
      `INSERT INTO wedding_profiles (
        user_id, phone, gender, partner_name, city, wedding_date, guests,
        budget_range, ceremony_type, reception_type, support_focus,
        biggest_doubt, contact_preference
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11,
        $12, $13
      )
      ON CONFLICT (user_id) DO UPDATE SET
        phone = EXCLUDED.phone,
        gender = EXCLUDED.gender,
        partner_name = EXCLUDED.partner_name,
        city = EXCLUDED.city,
        wedding_date = EXCLUDED.wedding_date,
        guests = EXCLUDED.guests,
        budget_range = EXCLUDED.budget_range,
        ceremony_type = EXCLUDED.ceremony_type,
        reception_type = EXCLUDED.reception_type,
        support_focus = EXCLUDED.support_focus,
        biggest_doubt = EXCLUDED.biggest_doubt,
        contact_preference = EXCLUDED.contact_preference
      RETURNING user_id, phone, gender, partner_name, city, wedding_date, guests,
                budget_range, ceremony_type, reception_type, support_focus,
                biggest_doubt, contact_preference, created_at, updated_at`,
      [
        userId,
        phone,
        gender,
        partnerName,
        city,
        weddingDate,
        guests,
        budgetRange,
        ceremonyType,
        receptionType,
        supportFocus,
        biggestDoubt,
        contactPreference,
      ]
    );

    await client.query("COMMIT");
    return res.json({ profile: upsert.rows[0] });
  } catch (err) {
    try {
      await pool.query("ROLLBACK");
    } catch {
      // ignore
    }
    console.error(err);
    return res.status(500).json({ error: "Error interno" });
  }
});

// ===================== PROVIDERS =====================

/**
 * Paso 1 (lead): registro corto
 * Body: { companyName, ownerName, phone, email }
 */
app.post("/providers/leads", providerLeadsLimiter, async (req, res) => {
  try {
    const { companyName, ownerName, phone, email } = req.body || {};
    const emailNorm = normalizeEmail(email);

    if (!companyName?.trim() || !ownerName?.trim() || !phone?.trim() || !emailNorm) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    if (!isValidEmail(emailNorm)) {
      return res.status(400).json({ error: "Email inválido" });
    }

    if (!isValidMXPhone(phone)) {
      return res
        .status(400)
        .json({ error: "Teléfono inválido (10 dígitos, sin secuencias)" });
    }

    const phoneDigits = normalizePhoneDigits(phone);

    const result = await pool.query(
      `INSERT INTO provider_leads (company_name, owner_name, phone, email)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET
         company_name = EXCLUDED.company_name,
         owner_name = EXCLUDED.owner_name,
         phone = EXCLUDED.phone,
         updated_at = now()
       RETURNING id, company_name, owner_name, phone, email, status, created_at, updated_at`,
      [companyName.trim(), ownerName.trim(), phoneDigits, emailNorm]
    );

    return res.status(201).json({ lead: result.rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error interno" });
  }
});

/**
 * Paso 2: crear cuenta proveedor + perfil
 * Body: {
 *  email, password,
 *  companyName?, ownerName?, phone?,
 *  venueName, venueLocation, locationPlaceId?, locationLat?, locationLng?,
 *  capacityMin, capacityMax?, priceFrom, priceTo,
 *  shortDescription, description, services,
 *  spaces?, rules?, website?, instagram?, facebook?, mapText?,
 *  eventTypes?, sellingPoints?, sellingPointsText?
 * }
 */
app.post("/providers/register", providerRegisterLimiter, async (req, res) => {
  const client = await pool.connect();
  try {
    const body = req.body || {};

    const emailNorm = normalizeEmail(body.email);
    const password = String(body.password || "");

    if (!emailNorm || !password) {
      return res.status(400).json({ error: "email y password son obligatorios" });
    }
    if (!isValidEmail(emailNorm)) {
      return res.status(400).json({ error: "Email inválido" });
    }
    if (password.length < 5) {
      return res.status(400).json({ error: "password mínimo 5 caracteres" });
    }

    // Traer lead si existe (para completar company/owner/phone si no vienen)
    const leadFound = await client.query(
      `SELECT company_name, owner_name, phone, status
       FROM provider_leads
       WHERE email = $1
       LIMIT 1`,
      [emailNorm]
    );
    const lead = leadFound.rows[0] || null;

    const companyName = (body.companyName || lead?.company_name || "").trim();
    const ownerName = (body.ownerName || lead?.owner_name || "").trim();
    const phoneDigits = normalizePhoneDigits(body.phone || lead?.phone || "");

    if (!companyName || !ownerName) {
      return res.status(400).json({
        error: "Falta companyName/ownerName. Completa el registro inicial (lead) primero.",
      });
    }
    if (phoneDigits && phoneDigits.length !== 10) {
      return res.status(400).json({ error: "Teléfono inválido (10 dígitos)" });
    }

    // Perfil requerido
    const venueName = String(body.venueName || "").trim();
    const venueLocation = String(body.venueLocation || "").trim();
    const capacityMin = toIntOrNull(body.capacityMin);
    const capacityMax = toIntOrNull(body.capacityMax);
    const priceFrom = toIntOrNull(body.priceFrom);
    const priceTo = toIntOrNull(body.priceTo);

    const shortDescription = String(body.shortDescription || "").trim();
    const description = String(body.description || "").trim();
    const services = String(body.services || "").trim();

    if (
      !venueName ||
      !venueLocation ||
      capacityMin === null ||
      priceFrom === null ||
      priceTo === null ||
      !shortDescription ||
      !description ||
      !services
    ) {
      return res.status(400).json({ error: "Faltan campos obligatorios del perfil" });
    }

    if (capacityMax !== null && capacityMax < capacityMin) {
      return res.status(400).json({ error: "capacityMax no puede ser menor a capacityMin" });
    }
    if (priceTo < priceFrom) {
      return res.status(400).json({ error: "priceTo no puede ser menor a priceFrom" });
    }

    const locationPlaceId = toNullIfEmpty(body.locationPlaceId);
    const locationLat = toFloatOrNull(body.locationLat);
    const locationLng = toFloatOrNull(body.locationLng);

    const eventTypes = toTextArray(body.eventTypes);
    const sellingPoints =
      toTextArray(body.sellingPoints).length > 0
        ? toTextArray(body.sellingPoints)
        : toTextArray(body.sellingPointsText, { maxItems: 20, maxLen: 160 });

    const profilePayload = {
      company_name: companyName,
      owner_name: ownerName,
      phone: phoneDigits || null,

      venue_name: venueName,
      venue_location: venueLocation,
      location_place_id: locationPlaceId,
      location_lat: locationLat,
      location_lng: locationLng,

      capacity_min: capacityMin,
      capacity_max: capacityMax,

      price_from: priceFrom,
      price_to: priceTo,

      short_description: shortDescription,
      description,
      spaces: toNullIfEmpty(body.spaces),
      services,
      rules: toNullIfEmpty(body.rules),

      website: toNullIfEmpty(body.website),
      instagram: toNullIfEmpty(body.instagram),
      facebook: toNullIfEmpty(body.facebook),

      map_text: toNullIfEmpty(body.mapText),
      event_types: eventTypes,
      selling_points: sellingPoints,
    };

    await client.query("BEGIN");

    // Crear user proveedor
    const password_hash = await bcrypt.hash(password, 10);

    const createdUser = await client.query(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ($1, $2, $3, 'provider')
       RETURNING id, email, name, role, created_at`,
      [emailNorm, password_hash, ownerName || null]
    );

    const providerUser = createdUser.rows[0];

    // Insert perfil proveedor
    const insertedProfile = await client.query(
      `INSERT INTO provider_profiles (
        user_id, company_name, owner_name, phone,
        venue_name, venue_location, location_place_id, location_lat, location_lng,
        capacity_min, capacity_max, price_from, price_to,
        short_description, description, spaces, services, rules,
        website, instagram, facebook, map_text, event_types, selling_points
      )
      VALUES (
        $1,$2,$3,$4,
        $5,$6,$7,$8,$9,
        $10,$11,$12,$13,
        $14,$15,$16,$17,$18,
        $19,$20,$21,$22,$23,$24
      )
      RETURNING *`,
      [
        providerUser.id,
        profilePayload.company_name,
        profilePayload.owner_name,
        profilePayload.phone,

        profilePayload.venue_name,
        profilePayload.venue_location,
        profilePayload.location_place_id,
        profilePayload.location_lat,
        profilePayload.location_lng,

        profilePayload.capacity_min,
        profilePayload.capacity_max,
        profilePayload.price_from,
        profilePayload.price_to,

        profilePayload.short_description,
        profilePayload.description,
        profilePayload.spaces,
        profilePayload.services,
        profilePayload.rules,

        profilePayload.website,
        profilePayload.instagram,
        profilePayload.facebook,
        profilePayload.map_text,
        profilePayload.event_types,
        profilePayload.selling_points,
      ]
    );

    // Marcar lead como convertido si existe
    await client.query(
      `UPDATE provider_leads
       SET status = 'converted'
       WHERE email = $1`,
      [emailNorm]
    );

    await client.query("COMMIT");

    const token = signToken({
      id: providerUser.id,
      email: providerUser.email,
      role: providerUser.role,
    });

    return res.status(201).json({
      token,
      provider: providerUser,
      profile: insertedProfile.rows[0],
    });
  } catch (err) {
    try {
      await pool.query("ROLLBACK");
    } catch {
      // ignore
    }

    if (err?.code === "23505") {
      return res.status(409).json({ error: "Ese email ya existe" });
    }

    console.error(err);
    return res.status(500).json({ error: "Error interno" });
  } finally {
    client.release();
  }
});

/**
 * Login proveedor
 * Body: { email, password }
 */
app.post("/providers/login", providerLoginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const emailNorm = normalizeEmail(email);

    if (!emailNorm || !password) {
      return res.status(400).json({ error: "email y password son obligatorios" });
    }

    const found = await pool.query(
      `SELECT id, email, password_hash, name, role, created_at
       FROM users
       WHERE email = $1
       LIMIT 1`,
      [emailNorm]
    );

    const user = found.rows[0];
    if (!user) return res.status(401).json({ error: "Credenciales inválidas" });
    if (user.role !== "provider" && user.role !== "admin") {
      return res.status(403).json({ error: "Este acceso es solo para proveedores" });
    }

    const ok = await bcrypt.compare(String(password), user.password_hash);
    if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      created_at: user.created_at,
    };

    return res.json({ token, provider: safeUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error interno" });
  }
});

/**
 * Obtener mi perfil proveedor
 */
app.get("/providers/me", providerAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const found = await pool.query(
      `SELECT
        u.id, u.email, u.name, u.role, u.created_at,
        p.company_name, p.owner_name, p.phone,
        p.venue_name, p.venue_location, p.location_place_id, p.location_lat, p.location_lng,
        p.capacity_min, p.capacity_max, p.price_from, p.price_to,
        p.short_description, p.description, p.spaces, p.services, p.rules,
        p.website, p.instagram, p.facebook, p.map_text, p.event_types, p.selling_points,
        p.created_at AS profile_created_at, p.updated_at AS profile_updated_at
       FROM users u
       LEFT JOIN provider_profiles p ON p.user_id = u.id
       WHERE u.id = $1
       LIMIT 1`,
      [userId]
    );

    const row = found.rows[0];
    if (!row) return res.status(404).json({ error: "Proveedor no encontrado" });

    const provider = {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      created_at: row.created_at,
    };

    const profile = row.company_name
      ? {
          user_id: row.id,
          company_name: row.company_name,
          owner_name: row.owner_name,
          phone: row.phone,
          venue_name: row.venue_name,
          venue_location: row.venue_location,
          location_place_id: row.location_place_id,
          location_lat: row.location_lat,
          location_lng: row.location_lng,
          capacity_min: row.capacity_min,
          capacity_max: row.capacity_max,
          price_from: row.price_from,
          price_to: row.price_to,
          short_description: row.short_description,
          description: row.description,
          spaces: row.spaces,
          services: row.services,
          rules: row.rules,
          website: row.website,
          instagram: row.instagram,
          facebook: row.facebook,
          map_text: row.map_text,
          event_types: row.event_types || [],
          selling_points: row.selling_points || [],
          created_at: row.profile_created_at,
          updated_at: row.profile_updated_at,
        }
      : null;

    return res.json({ provider, profile });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error interno" });
  }
});

/**
 * Actualizar mi perfil proveedor (upsert)
 * Body: puede traer campos; se mezcla con lo existente.
 */
app.put("/providers/me", providerAuthMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = req.user.id;
    const body = req.body || {};

    await client.query("BEGIN");

    const existing = await client.query(
      `SELECT * FROM provider_profiles WHERE user_id = $1 LIMIT 1`,
      [userId]
    );
    const current = existing.rows[0] || null;

    // Si no existe, requerimos básicos (o que vengan por body)
    const companyName = String(body.companyName ?? current?.company_name ?? "").trim();
    const ownerName = String(body.ownerName ?? current?.owner_name ?? "").trim();
    const phoneDigits = normalizePhoneDigits(body.phone ?? current?.phone ?? "");

    const venueName = String(body.venueName ?? current?.venue_name ?? "").trim();
    const venueLocation = String(body.venueLocation ?? current?.venue_location ?? "").trim();

    const capacityMin =
      toIntOrNull(body.capacityMin) ?? (current ? current.capacity_min : null);
    const capacityMax =
      toIntOrNull(body.capacityMax) ?? (current ? current.capacity_max : null);

    const priceFrom =
      toIntOrNull(body.priceFrom) ?? (current ? current.price_from : null);
    const priceTo =
      toIntOrNull(body.priceTo) ?? (current ? current.price_to : null);

    const shortDescription = String(
      body.shortDescription ?? current?.short_description ?? ""
    ).trim();

    const description = String(body.description ?? current?.description ?? "").trim();
    const services = String(body.services ?? current?.services ?? "").trim();

    if (
      !companyName ||
      !ownerName ||
      !venueName ||
      !venueLocation ||
      capacityMin === null ||
      priceFrom === null ||
      priceTo === null ||
      !shortDescription ||
      !description ||
      !services
    ) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Faltan campos obligatorios del perfil" });
    }

    if (capacityMax !== null && capacityMax < capacityMin) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "capacityMax no puede ser menor a capacityMin" });
    }
    if (priceTo < priceFrom) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "priceTo no puede ser menor a priceFrom" });
    }

    const locationPlaceId = toNullIfEmpty(body.locationPlaceId ?? current?.location_place_id);
    const locationLat =
      toFloatOrNull(body.locationLat) ?? (current ? current.location_lat : null);
    const locationLng =
      toFloatOrNull(body.locationLng) ?? (current ? current.location_lng : null);

    const mapText = toNullIfEmpty(body.mapText ?? current?.map_text);
    const spaces = toNullIfEmpty(body.spaces ?? current?.spaces);
    const rules = toNullIfEmpty(body.rules ?? current?.rules);

    const website = toNullIfEmpty(body.website ?? current?.website);
    const instagram = toNullIfEmpty(body.instagram ?? current?.instagram);
    const facebook = toNullIfEmpty(body.facebook ?? current?.facebook);

    const eventTypes =
      toTextArray(body.eventTypes).length > 0
        ? toTextArray(body.eventTypes)
        : (current?.event_types || []);

    const sellingPointsFromBody = toTextArray(body.sellingPoints);
    const sellingPointsTextFromBody = toTextArray(body.sellingPointsText, {
      maxItems: 20,
      maxLen: 160,
    });

    const sellingPoints =
      sellingPointsFromBody.length > 0
        ? sellingPointsFromBody
        : sellingPointsTextFromBody.length > 0
        ? sellingPointsTextFromBody
        : (current?.selling_points || []);

    // Actualizar name del usuario para mantener coherencia (opcional pero útil)
    await client.query(`UPDATE users SET name = $1 WHERE id = $2`, [ownerName, userId]);

    const upsert = await client.query(
      `INSERT INTO provider_profiles (
        user_id, company_name, owner_name, phone,
        venue_name, venue_location, location_place_id, location_lat, location_lng,
        capacity_min, capacity_max, price_from, price_to,
        short_description, description, spaces, services, rules,
        website, instagram, facebook, map_text, event_types, selling_points
      )
      VALUES (
        $1,$2,$3,$4,
        $5,$6,$7,$8,$9,
        $10,$11,$12,$13,
        $14,$15,$16,$17,$18,
        $19,$20,$21,$22,$23,$24
      )
      ON CONFLICT (user_id) DO UPDATE SET
        company_name = EXCLUDED.company_name,
        owner_name = EXCLUDED.owner_name,
        phone = EXCLUDED.phone,
        venue_name = EXCLUDED.venue_name,
        venue_location = EXCLUDED.venue_location,
        location_place_id = EXCLUDED.location_place_id,
        location_lat = EXCLUDED.location_lat,
        location_lng = EXCLUDED.location_lng,
        capacity_min = EXCLUDED.capacity_min,
        capacity_max = EXCLUDED.capacity_max,
        price_from = EXCLUDED.price_from,
        price_to = EXCLUDED.price_to,
        short_description = EXCLUDED.short_description,
        description = EXCLUDED.description,
        spaces = EXCLUDED.spaces,
        services = EXCLUDED.services,
        rules = EXCLUDED.rules,
        website = EXCLUDED.website,
        instagram = EXCLUDED.instagram,
        facebook = EXCLUDED.facebook,
        map_text = EXCLUDED.map_text,
        event_types = EXCLUDED.event_types,
        selling_points = EXCLUDED.selling_points
      RETURNING *`,
      [
        userId,
        companyName,
        ownerName,
        phoneDigits || null,

        venueName,
        venueLocation,
        locationPlaceId,
        locationLat,
        locationLng,

        capacityMin,
        capacityMax,
        priceFrom,
        priceTo,

        shortDescription,
        description,
        spaces,
        services,
        rules,

        website,
        instagram,
        facebook,
        mapText,
        eventTypes,
        sellingPoints,
      ]
    );

    await client.query("COMMIT");
    return res.json({ profile: upsert.rows[0] });
  } catch (err) {
    try {
      await pool.query("ROLLBACK");
    } catch {
      // ignore
    }
    console.error(err);
    return res.status(500).json({ error: "Error interno" });
  } finally {
    client.release();
  }
});

/**
 * Vista pública por id (uuid)
 * GET /providers/:id
 */
app.get("/providers/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isUuid(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const found = await pool.query(
      `SELECT
        p.user_id,
        p.company_name, p.owner_name,
        p.venue_name, p.venue_location, p.location_place_id, p.location_lat, p.location_lng,
        p.capacity_min, p.capacity_max, p.price_from, p.price_to,
        p.short_description, p.description, p.spaces, p.services, p.rules,
        p.website, p.instagram, p.facebook, p.map_text, p.event_types, p.selling_points,
        p.created_at, p.updated_at
       FROM provider_profiles p
       WHERE p.user_id = $1
       LIMIT 1`,
      [id]
    );

    const profile = found.rows[0] || null;
    if (!profile) return res.status(404).json({ error: "Proveedor no encontrado" });

    const photos = await pool.query(
      `SELECT id, url, sort_order, created_at
       FROM provider_photos
       WHERE user_id = $1
       ORDER BY sort_order ASC, created_at ASC`,
      [id]
    );

    return res.json({ profile, photos: photos.rows || [] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error interno" });
  }
});

// ===================== FINAL =====================

app.get("/", (req, res) => res.send("Kelom API"));

app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.use((err, req, res, next) => {
  void next;

  if (err?.message === "Origen no permitido por CORS") {
    return res.status(403).json({ error: "Origen no permitido por CORS" });
  }

  if (err?.type === "entity.too.large") {
    return res.status(413).json({ error: "Payload demasiado grande" });
  }

  console.error(err);
  return res.status(500).json({ error: "Error interno" });
});

app.listen(PORT, () => {
  console.log(`Kelom API escuchando en el puerto ${PORT}`);
});