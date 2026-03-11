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
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { pool } from "./db.js";

const app = express();
const PORT = process.env.PORT || 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("trust proxy", 1);
app.disable("x-powered-by");

// ✅ Recomendado para que recursos (fotos, etc.) se puedan usar cross-origin sin bronca
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// ===================== RATE LIMIT =====================

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

// ✅ Info Requests (usuarios -> proveedores)
const infoRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiadas solicitudes. Intenta más tarde." },
});

app.use(globalLimiter);

// ===================== CORS =====================

const allowedOrigins = [
  "http://localhost:5173",
  "https://kelom.com.mx",
  "https://www.kelom.com.mx",
  "https://genarohp7.github.io", // staging GH Pages
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

// Servir uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ===================== HELPERS =====================

function requireEnv(name) {
  if (!process.env[name]) {
    throw new Error(`Falta variable de entorno: ${name}`);
  }
}

function signToken(payload) {
  requireEnv("JWT_SECRET");
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
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
  if (/(.)\1{4,}/.test(digits)) return false;

  const ascSeq = "0123456789";
  const descSeq = "9876543210";
  for (let i = 0; i <= digits.length - 6; i++) {
    const slice = digits.slice(i, i + 6);
    if (ascSeq.includes(slice) || descSeq.includes(slice)) return false;
  }
  return true;
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

function toBooleanOrNull(v) {
  if (v === undefined || v === null || v === "") return null;
  if (typeof v === "boolean") return v;

  const s = String(v).trim().toLowerCase();

  if (["true", "1", "yes", "on"].includes(s)) return true;
  if (["false", "0", "no", "off"].includes(s)) return false;

  return null;
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

const PROVIDER_REQUEST_STATUS_VALUES = new Set([
  "sin_atender",
  "pendiente",
  "atendida",
  "cerrada",
]);

function normalizeProviderRequestStatus(value) {
  const v = String(value || "").trim().toLowerCase();

  if (v === "unattended") return "sin_atender";
  if (v === "pending") return "pendiente";
  if (v === "attended") return "atendida";
  if (v === "closed") return "cerrada";

  return v;
}

// ===================== RBAC (ADMIN TIERS + PERMISSIONS) =====================

const ADMIN_TIERS = new Set(["super", "moderator", "content", "support"]);

function normalizeAdminTier(tier) {
  const t = String(tier || "").trim().toLowerCase();
  return ADMIN_TIERS.has(t) ? t : null;
}

function hasPermission(user, perm) {
  // Superadmin = dios con checklist
  if (user?.role === "admin" && user?.admin_tier === "super") return true;

  const tier = user?.admin_tier;

  const tierPerms = {
    moderator: new Set(["admin:providers:read", "admin:providers:review"]),
    support: new Set(["admin:users:read", "admin:users:block", "admin:users:unblock"]),
    content: new Set(["admin:content:write", "admin:content:read"]),
  };

  const set = tierPerms[tier];
  return set ? set.has(perm) : false;
}

function requirePermission(perm) {
  return (req, res, next) => {
    const u = req.authUser;
    if (!u) return res.status(401).json({ error: "No autorizado" });
    if (u.role !== "admin") return res.status(403).json({ error: "Acceso solo para admin" });
    if (!hasPermission(u, perm)) {
      return res.status(403).json({ error: "No tienes permisos para esta acción" });
    }
    return next();
  };
}

// ===================== AUTH MIDDLEWARES =====================

async function loadUserFromDbById(id) {
  // Intentamos leer columnas nuevas; si aún no existen, hacemos fallback.
  try {
    const found = await pool.query(
      `SELECT id, email, name, role, created_at,
              account_status, admin_tier, blocked_at, blocked_reason
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [id]
    );
    return found.rows[0] || null;
  } catch (err) {
    // 42703 undefined_column
    if (err?.code === "42703") {
      const found = await pool.query(
        `SELECT id, email, name, role, created_at
         FROM users
         WHERE id = $1
         LIMIT 1`,
        [id]
      );
      const u = found.rows[0] || null;
      if (!u) return null;
      return {
        ...u,
        account_status: "active",
        admin_tier: null,
        blocked_at: null,
        blocked_reason: null,
      };
    }
    throw err;
  }
}

async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ error: "No autorizado" });
    }

    requireEnv("JWT_SECRET");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const dbUser = await loadUserFromDbById(decoded.id);
    if (!dbUser) return res.status(401).json({ error: "No autorizado" });

    // bloqueo (soft)
    if (dbUser.account_status && dbUser.account_status !== "active") {
      return res.status(403).json({ error: "Cuenta bloqueada" });
    }

    const tier = dbUser.role === "admin" ? normalizeAdminTier(dbUser.admin_tier) : null;

    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      admin_tier: tier,
    };
    req.authUser = { ...dbUser, admin_tier: tier };

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

function adminAuthMiddleware(req, res, next) {
  return authMiddleware(req, res, () => {
    const role = req.user?.role;
    if (role !== "admin") return res.status(403).json({ error: "Acceso solo para admin" });
    return next();
  });
}

// Optional auth helper (para endpoints públicos que pueden “abrirse” al admin)
async function tryGetAdminUserFromRequest(req) {
  try {
    const header = req.headers.authorization || "";
    const [type, token] = header.split(" ");
    if (type !== "Bearer" || !token) return null;

    requireEnv("JWT_SECRET");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const dbUser = await loadUserFromDbById(decoded.id);
    if (!dbUser) return null;
    if (dbUser.account_status && dbUser.account_status !== "active") return null;

    const tier = dbUser.role === "admin" ? normalizeAdminTier(dbUser.admin_tier) : null;
    if (dbUser.role !== "admin") return null;

    return { ...dbUser, admin_tier: tier };
  } catch {
    return null;
  }
}

// ===================== AUDIT LOG =====================

async function writeAdminAuditLog(req, { action, entityType, entityId, beforeState, afterState }) {
  try {
    const adminId = req.authUser?.id;
    if (!adminId) return;

    await pool.query(
      `INSERT INTO admin_audit_logs
        (admin_user_id, action, entity_type, entity_id, before_state, after_state, ip, user_agent)
       VALUES
        ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7, $8)`,
      [
        adminId,
        action,
        entityType,
        entityId || null,
        beforeState ? JSON.stringify(beforeState) : null,
        afterState ? JSON.stringify(afterState) : null,
        req.ip || null,
        req.headers["user-agent"] || null,
      ]
    );
  } catch (err) {
    // si la tabla aún no existe, no rompemos el flujo
    if (err?.code === "42P01") return;
    console.warn("Audit log error:", err?.message || err);
  }
}

// ===================== UPLOADS (PROVIDERS PHOTOS) =====================

const PROVIDER_UPLOAD_ROOT = path.join(__dirname, "uploads", "providers");
const ALLOWED_PROVIDER_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

try {
  fs.mkdirSync(PROVIDER_UPLOAD_ROOT, { recursive: true });
} catch {
  // ignore
}

function safeImageExt(originalName, mime) {
  const ext = (path.extname(originalName || "") || "").toLowerCase();
  if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) return ext;
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  return ".jpg";
}

const providerUpload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      try {
        const userId = req.user?.id;
        if (!userId) return cb(new Error("No autorizado"), null);

        const dir = path.join(PROVIDER_UPLOAD_ROOT, userId);
        fs.mkdirSync(dir, { recursive: true });
        return cb(null, dir);
      } catch (err) {
        return cb(err, null);
      }
    },
    filename(req, file, cb) {
      const ext = safeImageExt(file.originalname, file.mimetype);
      const name = `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`;
      cb(null, name);
    },
  }),
  fileFilter(req, file, cb) {
    if (!ALLOWED_PROVIDER_IMAGE_TYPES.has(file.mimetype)) {
      return cb(new Error("Tipo de archivo no permitido. Usa JPG/PNG/WebP."));
    }
    return cb(null, true);
  },
  limits: {
    fileSize: 6 * 1024 * 1024, // 6MB por imagen
    files: 12,
  },
});

// ===================== HEALTH =====================

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

    // Intentamos incluir account_status/admin_tier; fallback si no existen columnas aún
    let found;
    try {
      found = await pool.query(
        `SELECT id, email, password_hash, name, role, admin_tier, account_status, blocked_at, blocked_reason, created_at
         FROM users
         WHERE email = $1
         LIMIT 1`,
        [emailNorm]
      );
    } catch (err) {
      if (err?.code === "42703") {
        found = await pool.query(
          `SELECT id, email, password_hash, name, role, created_at
           FROM users
           WHERE email = $1
           LIMIT 1`,
          [emailNorm]
        );
      } else {
        throw err;
      }
    }

    const user = found.rows[0];
    if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

    if (user.account_status && user.account_status !== "active") {
      return res.status(403).json({ error: "Cuenta bloqueada" });
    }

    const ok = await bcrypt.compare(String(password), user.password_hash);
    if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      admin_tier: user.role === "admin" ? normalizeAdminTier(user.admin_tier) : null,
      account_status: user.account_status || "active",
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
    const user = req.authUser;
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      admin_tier: user.role === "admin" ? user.admin_tier : null,
      account_status: user.account_status || "active",
      created_at: user.created_at,
    };

    return res.json({ user: safeUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error interno" });
  }
});

app.put("/auth/password", changePasswordLimiter, authMiddleware, async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "currentPassword y newPassword son obligatorios" });
    }

    if (String(newPassword).length < 5) {
      return res.status(400).json({ error: "password mínimo 5 caracteres" });
    }

    const found = await pool.query(`SELECT password_hash FROM users WHERE id = $1 LIMIT 1`, [
      userId,
    ]);

    const row = found.rows[0];
    if (!row) return res.status(404).json({ error: "Usuario no encontrado" });

    const ok = await bcrypt.compare(String(currentPassword), row.password_hash);
    if (!ok) return res.status(401).json({ error: "Contraseña actual incorrecta" });

    const same = await bcrypt.compare(String(newPassword), row.password_hash);
    if (same) {
      return res.status(400).json({ error: "La nueva contraseña no puede ser igual a la actual" });
    }

    const newHash = await bcrypt.hash(String(newPassword), 10);

    await pool.query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [newHash, userId]);

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
      await client.query(`UPDATE users SET name = $1 WHERE id = $2`, [nameFromBody, userId]);
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
      await client.query("ROLLBACK");
    } catch {
      void 0;
    }
    console.error(err);
    return res.status(500).json({ error: "Error interno" });
  } finally {
    client.release();
  }
});

// ===================== INFO REQUESTS (USUARIO -> PROVEEDOR) =====================
// Crea solicitud y queda pendiente de moderación. Aún NO envía correos.
app.post("/info-requests", infoRequestLimiter, authMiddleware, async (req, res) => {
  try {
    // Solo usuarios finales (parejas)
    if (req.user?.role !== "user") {
      return res.status(403).json({ error: "Acceso solo para usuarios" });
    }

    const body = req.body || {};
    const providerId = String(body.providerId || body.provider_id || "").trim();

    const message = String(body.message || "").trim();
    const preferredContactSchedule = String(
      body.preferredContactSchedule || body.preferred_contact_schedule || ""
    ).trim();

    if (!providerId || !isUuid(providerId)) {
      return res.status(400).json({ error: "providerId inválido" });
    }

    if (!message) {
      return res.status(400).json({ error: "message es obligatorio" });
    }

    if (!preferredContactSchedule) {
      return res.status(400).json({ error: "preferredContactSchedule es obligatorio" });
    }

    // límites anti-pergamino
    const messageSafe = message.slice(0, 2000);
    const scheduleSafe = preferredContactSchedule.slice(0, 220);

    // Validar que el proveedor exista y esté publicado
    const prov = await pool.query(
      `
      SELECT p.user_id
      FROM provider_profiles p
      JOIN users u ON u.id = p.user_id
      WHERE p.user_id = $1
        AND p.review_status = 'approved'
        AND p.public_visibility = 'listed'
        AND u.role = 'provider'
        AND u.account_status = 'active'
      LIMIT 1
      `,
      [providerId]
    );

    if (!prov.rowCount) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }

    // Snapshot del usuario (nombre/email) + teléfono de wedding_profiles si existe
    const requester = await pool.query(
      `
      SELECT u.id, u.name, u.email, wp.phone
      FROM users u
      LEFT JOIN wedding_profiles wp ON wp.user_id = u.id
      WHERE u.id = $1
      LIMIT 1
      `,
      [req.user.id]
    );

    const r = requester.rows[0] || null;
    if (!r) return res.status(401).json({ error: "No autorizado" });

    const ins = await pool.query(
      `
      INSERT INTO provider_info_requests (
        provider_id,
        requester_user_id,
        requester_name,
        requester_email,
        requester_phone,
        message,
        preferred_contact_schedule
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING
        id,
        provider_id,
        requester_user_id,
        moderation_status,
        provider_status,
        created_at
      `,
      [
        providerId,
        r.id,
        r.name || null,
        r.email || null,
        r.phone || null,
        messageSafe,
        scheduleSafe,
      ]
    );

    return res.status(201).json({ request: ins.rows[0] });
  } catch (err) {
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
      return res.status(400).json({ error: "Teléfono inválido (10 dígitos, sin secuencias)" });
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
 * IMPORTANTE:
 * - Ahora nace en pending_review + hidden (no se publica hasta aprobación)
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

    await client.query("BEGIN");

    // Lead si existe
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
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "Falta companyName/ownerName. Completa el registro inicial (lead) primero.",
      });
    }
    if (phoneDigits && phoneDigits.length !== 10) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Teléfono inválido (10 dígitos)" });
    }

    // Evita duplicado en users
    const exists = await client.query(`SELECT id, role FROM users WHERE email = $1 LIMIT 1`, [
      emailNorm,
    ]);
    if (exists.rowCount > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Ese email ya existe" });
    }

    // Perfil requerido
    const venueName = String(body.venueName || "").trim();
    const venueLocation = String(body.venueLocation || "").trim();
    const businessCategory = String(body.businessCategory || "").trim();

    // ✅ alcaldía/municipio obligatorio
    const localityArea = String(body.localityArea || "").trim();

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
      !businessCategory ||
      !localityArea ||
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
      return res.status(400).json({ error: "capacityMax no puede ser menor que capacityMin" });
    }
    if (priceTo < priceFrom) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "priceTo no puede ser menor que priceFrom" });
    }

    const locationPlaceId = toNullIfEmpty(body.locationPlaceId);
    const locationLat = toFloatOrNull(body.locationLat);
    const locationLng = toFloatOrNull(body.locationLng);

    const spaces = toNullIfEmpty(body.spaces);
    const rules = toNullIfEmpty(body.rules);
    const website = toNullIfEmpty(body.website);
    const instagram = toNullIfEmpty(body.instagram);
    const facebook = toNullIfEmpty(body.facebook);
    const mapText = toNullIfEmpty(body.mapText);

    const eventTypes = Array.isArray(body.eventTypes) ? toTextArray(body.eventTypes) : [];
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
        : [];

    const password_hash = await bcrypt.hash(password, 10);

    const userIns = await client.query(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ($1, $2, $3, 'provider')
       RETURNING id, email, name, role, created_at`,
      [emailNorm, password_hash, ownerName || null]
    );

    const provider = userIns.rows[0];
    const userId = provider.id;

    // Marcar lead como convertido si existe
    if (lead && lead.status === "lead") {
      await client.query(
        `UPDATE provider_leads SET status = 'converted', updated_at = now() WHERE email = $1`,
        [emailNorm]
      );
    }

    // Moderación: nace como "pending_review" + "hidden"
    const reviewStatus = "pending_review";
    const publicVisibility = "hidden";

    const profileIns = await client.query(
      `INSERT INTO provider_profiles (
        user_id, company_name, owner_name, phone,
        venue_name, venue_location, business_category, locality_area,
        location_place_id, location_lat, location_lng,
        capacity_min, capacity_max, price_from, price_to,
        short_description, description, spaces, services, rules,
        website, instagram, facebook, map_text, event_types, selling_points,
        review_status, public_visibility
      )
      VALUES (
        $1,$2,$3,$4,
        $5,$6,$7,$8,
        $9,$10,$11,
        $12,$13,$14,$15,
        $16,$17,$18,$19,$20,
        $21,$22,$23,$24,$25,$26,
        $27,$28
      )
      RETURNING *`,
      [
        userId,
        companyName,
        ownerName,
        phoneDigits || null,

        venueName,
        venueLocation,
        businessCategory,
        localityArea,

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

        reviewStatus,
        publicVisibility,
      ]
    );

    await client.query("COMMIT");

    const token = signToken({ id: provider.id, email: provider.email, role: provider.role });

    return res.json({
      token,
      provider,
      profile: profileIns.rows[0],
    });
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch {
      void 0;
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

    let found;
    try {
      found = await pool.query(
        `SELECT id, email, password_hash, name, role, admin_tier, account_status, created_at
         FROM users
         WHERE email = $1
         LIMIT 1`,
        [emailNorm]
      );
    } catch (err) {
      if (err?.code === "42703") {
        found = await pool.query(
          `SELECT id, email, password_hash, name, role, created_at
           FROM users
           WHERE email = $1
           LIMIT 1`,
          [emailNorm]
        );
      } else {
        throw err;
      }
    }

    const user = found.rows[0];
    if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

    if (user.account_status && user.account_status !== "active") {
      return res.status(403).json({ error: "Cuenta bloqueada" });
    }

    if (user.role !== "provider" && user.role !== "admin") {
      return res.status(403).json({ error: "Acceso solo para proveedores" });
    }

    const ok = await bcrypt.compare(String(password), user.password_hash);
    if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    const provider = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      created_at: user.created_at,
    };

    return res.json({ token, provider });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error interno" });
  }
});

/**
 * Perfil proveedor actual (privado)
 * GET /providers/me
 */
app.get("/providers/me", providerAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const u = await pool.query(
      `SELECT id, email, name, role, created_at
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [userId]
    );

    const provider = u.rows[0] || null;
    if (!provider) return res.status(404).json({ error: "Proveedor no encontrado" });

    const p = await pool.query(`SELECT * FROM provider_profiles WHERE user_id = $1 LIMIT 1`, [
      userId,
    ]);

    const profile = p.rows[0] || null;

    const photos = await pool.query(
      `SELECT id, url, sort_order, created_at
       FROM provider_photos
       WHERE user_id = $1
       ORDER BY sort_order ASC, created_at ASC`,
      [userId]
    );

    return res.json({ provider, profile, photos: photos.rows || [] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error interno" });
  }
});

// ===================== PROVIDER INBOX (SOLICITUDES REALES) =====================

/**
 * GET /providers/info-requests
 * Devuelve SOLO solicitudes aprobadas para el proveedor autenticado.
 * Query: provider_status, q, limit, offset
 */
app.get("/providers/info-requests", providerAuthMiddleware, async (req, res) => {
  try {
    const providerId = req.user.id;
    const providerStatusRaw = toNullIfEmpty(req.query.provider_status);
    const q = toNullIfEmpty(req.query.q);

    const limit = Math.min(Math.max(Number(req.query.limit || 50), 1), 200);
    const offset = Math.max(Number(req.query.offset || 0), 0);

    const where = ["r.provider_id = $1", "r.moderation_status = 'approved'"];
    const params = [providerId];

    if (providerStatusRaw) {
      const providerStatus = normalizeProviderRequestStatus(providerStatusRaw);

      if (!PROVIDER_REQUEST_STATUS_VALUES.has(providerStatus)) {
        return res.status(400).json({ error: "provider_status inválido" });
      }

      params.push(providerStatus);
      where.push(`COALESCE(r.provider_status, 'sin_atender') = $${params.length}`);
    }

    if (q) {
      params.push(`%${q}%`);
      where.push(
        `(COALESCE(r.requester_name,'') ILIKE $${params.length}
          OR COALESCE(r.requester_email,'') ILIKE $${params.length}
          OR COALESCE(r.requester_phone,'') ILIKE $${params.length}
          OR COALESCE(r.message,'') ILIKE $${params.length}
          OR COALESCE(wp.partner_name,'') ILIKE $${params.length}
          OR COALESCE(wp.city,'') ILIKE $${params.length})`
      );
    }

    params.push(limit);
    params.push(offset);

    const sql = `
      SELECT
        r.id,
        r.provider_id,
        r.requester_user_id,
        r.requester_name,
        r.requester_email,
        r.requester_phone,
        r.message,
        r.preferred_contact_schedule,
        r.moderation_status,
        COALESCE(r.provider_status, 'sin_atender') AS provider_status,
        r.created_at,
        r.updated_at,
        wp.partner_name,
        wp.city,
        wp.wedding_date,
        wp.guests
      FROM provider_info_requests r
      LEFT JOIN wedding_profiles wp ON wp.user_id = r.requester_user_id
      WHERE ${where.join(" AND ")}
      ORDER BY r.created_at DESC
      LIMIT $${params.length - 1}
      OFFSET $${params.length}
    `;

    const rows = await pool.query(sql, params);

    return res.json({
      requests: rows.rows || [],
      pagination: { limit, offset, next_offset: offset + limit },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error interno" });
  }
});

/**
 * GET /providers/info-requests/stats
 * Devuelve conteos de solicitudes aprobadas para el proveedor autenticado.
 */
app.get("/providers/info-requests/stats", providerAuthMiddleware, async (req, res) => {
  try {
    const providerId = req.user.id;

    const rows = await pool.query(
      `
      SELECT
        COALESCE(provider_status, 'sin_atender') AS provider_status,
        COUNT(*)::int AS count
      FROM provider_info_requests
      WHERE provider_id = $1
        AND moderation_status = 'approved'
      GROUP BY COALESCE(provider_status, 'sin_atender')
      ORDER BY provider_status
      `,
      [providerId]
    );

    const map = {};
    for (const row of rows.rows || []) {
      map[row.provider_status] = row.count;
    }

    return res.json({
      total:
        (map.sin_atender || 0) +
        (map.pendiente || 0) +
        (map.atendida || 0) +
        (map.cerrada || 0),
      sin_atender: map.sin_atender || 0,
      pendiente: map.pendiente || 0,
      atendida: map.atendida || 0,
      cerrada: map.cerrada || 0,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error interno" });
  }
});

/**
 * PATCH /providers/info-requests/:id/status
 * Body: { provider_status }
 */
app.patch("/providers/info-requests/:id/status", providerAuthMiddleware, async (req, res) => {
  try {
    const providerId = req.user.id;
    const { id } = req.params;

    if (!isUuid(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const providerStatus = normalizeProviderRequestStatus(req.body?.provider_status);

    if (!PROVIDER_REQUEST_STATUS_VALUES.has(providerStatus)) {
      return res.status(400).json({ error: "provider_status inválido" });
    }

    const beforeRes = await pool.query(
      `SELECT
         id,
         provider_id,
         requester_user_id,
         requester_name,
         requester_email,
         requester_phone,
         message,
         preferred_contact_schedule,
         moderation_status,
         provider_status,
         created_at,
         updated_at
       FROM provider_info_requests
       WHERE id = $1
         AND provider_id = $2
         AND moderation_status = 'approved'
       LIMIT 1`,
      [id, providerId]
    );

    const before = beforeRes.rows[0] || null;
    if (!before) {
      return res.status(404).json({ error: "Solicitud no encontrada" });
    }

    const updatedRes = await pool.query(
      `UPDATE provider_info_requests
       SET provider_status = $3,
           updated_at = now()
       WHERE id = $1
         AND provider_id = $2
       RETURNING
         id,
         provider_id,
         requester_user_id,
         requester_name,
         requester_email,
         requester_phone,
         message,
         preferred_contact_schedule,
         moderation_status,
         provider_status,
         created_at,
         updated_at`,
      [id, providerId, providerStatus]
    );

    return res.json({ request: updatedRes.rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error interno" });
  }
});

/**
 * Actualizar perfil proveedor (privado)
 * PUT /providers/me
 */
app.put("/providers/me", providerAuthMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = req.user.id;
    const body = req.body || {};

    // Datos base opcionales
    const companyName = toNullIfEmpty(body.companyName);
    const ownerName = toNullIfEmpty(body.ownerName);
    const phoneDigits = body.phone ? normalizePhoneDigits(body.phone) : null;

    // Perfil requerido
    const venueName = String(body.venueName || "").trim();
    const venueLocation = String(body.venueLocation || "").trim();
    const businessCategory = String(body.businessCategory || "").trim();

    // ✅ alcaldía/municipio obligatorio
    const localityArea = String(body.localityArea || "").trim();

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
      !businessCategory ||
      !localityArea ||
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
      return res.status(400).json({ error: "capacityMax no puede ser menor que capacityMin" });
    }
    if (priceTo < priceFrom) {
      return res.status(400).json({ error: "priceTo no puede ser menor que priceFrom" });
    }

    const locationPlaceId = toNullIfEmpty(body.locationPlaceId);
    const locationLat = toFloatOrNull(body.locationLat);
    const locationLng = toFloatOrNull(body.locationLng);

    const spaces = toNullIfEmpty(body.spaces);
    const rules = toNullIfEmpty(body.rules);
    const website = toNullIfEmpty(body.website);
    const instagram = toNullIfEmpty(body.instagram);
    const facebook = toNullIfEmpty(body.facebook);
    const mapText = toNullIfEmpty(body.mapText);

    await client.query("BEGIN");

    const currentRes = await client.query(
      `SELECT event_types, selling_points, company_name, owner_name, phone
       FROM provider_profiles
       WHERE user_id = $1
       LIMIT 1`,
      [userId]
    );
    const current = currentRes.rows[0] || null;

    const eventTypes =
      Array.isArray(body.eventTypes) && body.eventTypes.length
        ? toTextArray(body.eventTypes)
        : current?.event_types || [];

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
        : current?.selling_points || [];

    // Actualizar name del usuario si viene ownerName (opcional)
    if (ownerName) {
      await client.query(`UPDATE users SET name = $1 WHERE id = $2`, [ownerName, userId]);
    }

    const upsert = await client.query(
      `INSERT INTO provider_profiles (
        user_id, company_name, owner_name, phone,
        venue_name, venue_location, business_category, locality_area,
        location_place_id, location_lat, location_lng,
        capacity_min, capacity_max, price_from, price_to,
        short_description, description, spaces, services, rules,
        website, instagram, facebook, map_text, event_types, selling_points
      )
      VALUES (
        $1,$2,$3,$4,
        $5,$6,$7,$8,
        $9,$10,$11,
        $12,$13,$14,$15,
        $16,$17,$18,$19,$20,
        $21,$22,$23,$24,$25,$26
      )
      ON CONFLICT (user_id) DO UPDATE SET
        company_name = EXCLUDED.company_name,
        owner_name = EXCLUDED.owner_name,
        phone = EXCLUDED.phone,
        venue_name = EXCLUDED.venue_name,
        venue_location = EXCLUDED.venue_location,
        business_category = EXCLUDED.business_category,
        locality_area = EXCLUDED.locality_area,
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
        (companyName ?? current?.company_name ?? "").trim(),
        (ownerName ?? current?.owner_name ?? "").trim(),
        phoneDigits || current?.phone || null,

        venueName,
        venueLocation,
        businessCategory,
        localityArea,

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
      await client.query("ROLLBACK");
    } catch {
      void 0;
    }
    console.error(err);
    return res.status(500).json({ error: "Error interno" });
  } finally {
    client.release();
  }
});

/**
 * Subir fotos del proveedor (multipart)
 * POST /providers/photos
 * FormData: photos (multiple)
 */
app.post(
  "/providers/photos",
  providerAuthMiddleware,
  providerUpload.array("photos", 12),
  async (req, res) => {
    try {
      const userId = req.user.id;

      const files = Array.isArray(req.files) ? req.files : [];
      if (!files.length) {
        return res.status(400).json({ error: "No se enviaron fotos" });
      }

      const hasProfile = await pool.query(
        `SELECT 1 FROM provider_profiles WHERE user_id = $1 LIMIT 1`,
        [userId]
      );
      if (hasProfile.rowCount === 0) {
        return res.status(400).json({ error: "Primero guarda tu ficha antes de subir fotos." });
      }

      const maxRes = await pool.query(
        `SELECT COALESCE(MAX(sort_order), -1) AS max
         FROM provider_photos
         WHERE user_id = $1`,
        [userId]
      );

      let sort = Number(maxRes.rows?.[0]?.max ?? -1);
      if (!Number.isFinite(sort)) sort = -1;

      const inserted = [];

      for (const f of files) {
        sort += 1;
        const url = `/uploads/providers/${userId}/${f.filename}`;

        const ins = await pool.query(
          `INSERT INTO provider_photos (user_id, url, sort_order)
           VALUES ($1, $2, $3)
           RETURNING id, url, sort_order, created_at`,
          [userId, url, sort]
        );

        inserted.push(ins.rows[0]);
      }

      return res.status(201).json({ photos: inserted });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Error interno" });
    }
  }
);

/**
 * Borrar una foto del proveedor
 * DELETE /providers/photos/:photoId
 */
app.delete("/providers/photos/:photoId", providerAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { photoId } = req.params;

    if (!isUuid(photoId)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const del = await pool.query(
      `DELETE FROM provider_photos
       WHERE id = $1 AND user_id = $2
       RETURNING id, url`,
      [photoId, userId]
    );

    if (!del.rowCount) {
      return res.status(404).json({ error: "Foto no encontrada" });
    }

    const url = del.rows[0].url;

    // borrar archivo físico (best-effort)
    if (url && typeof url === "string" && url.startsWith("/uploads/")) {
      const abs = path.join(__dirname, url.replace(/^\//, ""));
      fs.promises.unlink(abs).catch(() => {});
    }

    return res.json({ ok: true, id: del.rows[0].id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error interno" });
  }
});

// ===================== PUBLIC PROVIDERS LIST (Home + Search) =====================
// GET /providers?q=&category=&where=&limit=&offset=
// Devuelve SOLO approved + listed (visible públicamente)
app.get("/providers", async (req, res) => {
  try {
    const q = toNullIfEmpty(req.query.q); // compat
    const category = toNullIfEmpty(req.query.category);
    const whereText = toNullIfEmpty(req.query.where);

    const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
    const offset = Math.max(Number(req.query.offset || 0), 0);

    const where = [
      "p.review_status = 'approved'",
      "p.public_visibility = 'listed'",
      "u.role = 'provider'",
      "u.account_status = 'active'",
    ];

    const params = [];

    if (q) {
      params.push(`%${q}%`);
      where.push(
        `(p.venue_name ILIKE $${params.length}
          OR p.company_name ILIKE $${params.length}
          OR p.venue_location ILIKE $${params.length}
          OR COALESCE(p.locality_area,'') ILIKE $${params.length})`
      );
    }

    if (category) {
      params.push(category);
      where.push(`p.business_category = $${params.length}`);
    }

    if (whereText) {
      params.push(`%${whereText}%`);
      where.push(
        `(p.venue_name ILIKE $${params.length}
          OR p.company_name ILIKE $${params.length}
          OR p.venue_location ILIKE $${params.length}
          OR COALESCE(p.locality_area,'') ILIKE $${params.length})`
      );
    }

    params.push(limit);
    params.push(offset);

    const sql = `
      SELECT
        p.user_id,
        p.company_name,
        p.owner_name,
        p.venue_name,
        p.venue_location,
        p.business_category,
        p.locality_area,
        p.short_description,
        p.capacity_min,
        p.capacity_max,
        p.price_from,
        p.price_to,
        p.event_types,
        p.selling_points,
        p.updated_at,
        (
          SELECT url
          FROM provider_photos ph
          WHERE ph.user_id = p.user_id
          ORDER BY ph.sort_order ASC, ph.created_at ASC
          LIMIT 1
        ) AS main_photo_url
      FROM provider_profiles p
      JOIN users u ON u.id = p.user_id
      WHERE ${where.join(" AND ")}
      ORDER BY COALESCE(p.updated_at, p.created_at) DESC
      LIMIT $${params.length - 1}
      OFFSET $${params.length}
    `;

    const rows = await pool.query(sql, params);

    return res.json({
      providers: rows.rows || [],
      pagination: { limit, offset, next_offset: offset + limit },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error interno" });
  }
});

/**
 * Vista pública por id (uuid)
 * GET /providers/:id
 * Regla: solo mostrar si está approved + listed (a menos que sea admin)
 */
app.get("/providers/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isUuid(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const admin = await tryGetAdminUserFromRequest(req);
    const isAdmin = Boolean(admin);

    const found = await pool.query(
      `SELECT
        p.user_id,
        p.company_name, p.owner_name,
        p.venue_name, p.venue_location, p.business_category, p.locality_area, p.location_place_id, p.location_lat, p.location_lng,
        p.capacity_min, p.capacity_max, p.price_from, p.price_to,
        p.short_description, p.description, p.spaces, p.services, p.rules,
        p.website, p.instagram, p.facebook, p.map_text, p.event_types, p.selling_points,
        p.review_status, p.public_visibility,
        p.created_at, p.updated_at
       FROM provider_profiles p
       WHERE p.user_id = $1
       LIMIT 1`,
      [id]
    );

    const profile = found.rows[0] || null;
    if (!profile) return res.status(404).json({ error: "Proveedor no encontrado" });

    // Si no es admin, solo approved + listed
    if (!isAdmin) {
      const rs = String(profile.review_status || "");
      const pv = String(profile.public_visibility || "");
      if (!(rs === "approved" && pv === "listed")) {
        return res.status(404).json({ error: "Proveedor no encontrado" });
      }
    }

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

// ===================== ADMIN INFO REQUESTS (MODERACIÓN) =====================

/**
 * GET /admin/info-requests
 * Query: moderation_status (pending|approved|declined), q, limit, offset
 */
app.get(
  "/admin/info-requests",
  adminAuthMiddleware,
  requirePermission("admin:providers:read"),
  async (req, res) => {
    try {
      const moderationStatus = toNullIfEmpty(req.query.moderation_status);
      const q = toNullIfEmpty(req.query.q);

      const limit = Math.min(Math.max(Number(req.query.limit || 50), 1), 200);
      const offset = Math.max(Number(req.query.offset || 0), 0);

      const where = [];
      const params = [];

      if (moderationStatus) {
        params.push(moderationStatus);
        where.push(`r.moderation_status = $${params.length}`);
      }

      if (q) {
        params.push(`%${q}%`);
        where.push(
          `(COALESCE(r.requester_email,'') ILIKE $${params.length}
            OR COALESCE(r.requester_name,'') ILIKE $${params.length}
            OR COALESCE(p.venue_name,'') ILIKE $${params.length}
            OR COALESCE(p.company_name,'') ILIKE $${params.length}
            OR COALESCE(pu.email,'') ILIKE $${params.length}
            OR COALESCE(r.message,'') ILIKE $${params.length})`
        );
      }

      params.push(limit);
      params.push(offset);

      const sql = `
        SELECT
          r.id,
          r.provider_id,
          r.requester_user_id,
          r.requester_name,
          r.requester_email,
          r.requester_phone,
          r.message,
          r.preferred_contact_schedule,
          r.moderation_status,
          r.moderated_by,
          r.moderated_at,
          r.moderation_notes,
          r.provider_status,
          r.created_at,
          r.updated_at,
          p.venue_name AS provider_venue_name,
          p.company_name AS provider_company_name,
          p.is_featured AS provider_is_featured,
          pu.email AS provider_email
        FROM provider_info_requests r
        LEFT JOIN provider_profiles p ON p.user_id = r.provider_id
        LEFT JOIN users pu ON pu.id = r.provider_id
        ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
        ORDER BY r.created_at DESC
        LIMIT $${params.length - 1}
        OFFSET $${params.length}
      `;

      const rows = await pool.query(sql, params);

      return res.json({
        requests: rows.rows || [],
        pagination: { limit, offset, next_offset: offset + limit },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Error interno" });
    }
  }
);

/**
 * GET /admin/info-requests/stats
 * Devuelve conteos por moderation_status
 */
app.get(
  "/admin/info-requests/stats",
  adminAuthMiddleware,
  requirePermission("admin:providers:read"),
  async (req, res) => {
    try {
      const rows = await pool.query(
        `
        SELECT moderation_status, COUNT(*)::int AS count
        FROM provider_info_requests
        GROUP BY moderation_status
        ORDER BY moderation_status
        `
      );

      const map = {};
      for (const r of rows.rows || []) map[r.moderation_status] = r.count;

      return res.json({
        total: (map.pending || 0) + (map.approved || 0) + (map.declined || 0),
        pending: map.pending || 0,
        approved: map.approved || 0,
        declined: map.declined || 0,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Error interno" });
    }
  }
);

async function moderateInfoRequest(req, res) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) return res.status(400).json({ error: "ID inválido" });

    const moderation_status = toNullIfEmpty(req.body?.moderation_status);
    const moderation_notes = toNullIfEmpty(req.body?.moderation_notes);

    const allowed = new Set(["approved", "declined"]);
    if (!moderation_status || !allowed.has(moderation_status)) {
      return res.status(400).json({ error: "moderation_status inválido" });
    }

    const beforeRes = await pool.query(
      `SELECT *
       FROM provider_info_requests
       WHERE id = $1
       LIMIT 1`,
      [id]
    );
    const before = beforeRes.rows[0];
    if (!before) return res.status(404).json({ error: "Solicitud no encontrada" });

    const updatedRes = await pool.query(
      `
      UPDATE provider_info_requests
      SET
        moderation_status = $2,
        moderated_by = $3,
        moderated_at = now(),
        moderation_notes = COALESCE($4, moderation_notes)
      WHERE id = $1
      RETURNING *
      `,
      [id, moderation_status, req.authUser.id, moderation_notes]
    );

    const after = updatedRes.rows[0];

    await writeAdminAuditLog(req, {
      action: "info_requests:moderate",
      entityType: "provider_info_request",
      entityId: id,
      beforeState: before,
      afterState: after,
    });

    return res.json({ request: after });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error interno" });
  }
}

/**
 * ✅ NUEVA: la que tu AdminDashboard usa
 * PATCH /admin/info-requests/:id
 */
app.patch(
  "/admin/info-requests/:id",
  adminAuthMiddleware,
  requirePermission("admin:providers:review"),
  moderateInfoRequest
);

/**
 * ✅ Backward compatibility:
 * PATCH /admin/info-requests/:id/moderate
 */
app.patch(
  "/admin/info-requests/:id/moderate",
  adminAuthMiddleware,
  requirePermission("admin:providers:review"),
  moderateInfoRequest
);

// ===================== ADMIN API =====================

/**
 * GET /admin/users
 * Query: role, status, q, limit, offset
 */
app.get(
  "/admin/users",
  adminAuthMiddleware,
  requirePermission("admin:users:read"),
  async (req, res) => {
    try {
      const role = toNullIfEmpty(req.query.role);
      const status = toNullIfEmpty(req.query.status);
      const q = toNullIfEmpty(req.query.q);

      const limit = Math.min(Math.max(Number(req.query.limit || 50), 1), 200);
      const offset = Math.max(Number(req.query.offset || 0), 0);

      const where = [];
      const params = [];

      if (role) {
        params.push(role);
        where.push(`role = $${params.length}`);
      }
      if (status) {
        params.push(status);
        where.push(`account_status = $${params.length}`);
      }
      if (q) {
        params.push(`%${q}%`);
        where.push(`(email ILIKE $${params.length} OR COALESCE(name,'') ILIKE $${params.length})`);
      }

      params.push(limit);
      params.push(offset);

      const sql = `
        SELECT id, email, name, role, admin_tier, account_status, blocked_at, blocked_reason, created_at
        FROM users
        ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
        ORDER BY created_at DESC
        LIMIT $${params.length - 1}
        OFFSET $${params.length}
      `;

      const rows = await pool.query(sql, params);
      return res.json({ users: rows.rows || [] });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Error interno" });
    }
  }
);

/**
 * PATCH /admin/users/:id/block
 * Body: { reason }
 */
app.patch(
  "/admin/users/:id/block",
  adminAuthMiddleware,
  requirePermission("admin:users:block"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const reason = toNullIfEmpty(req.body?.reason) || "Bloqueado por administrador";

      if (!isUuid(id)) return res.status(400).json({ error: "ID inválido" });
      if (id === req.authUser.id) {
        return res.status(400).json({ error: "No puedes bloquearte a ti mismo" });
      }

      const beforeRes = await pool.query(
        `SELECT id, email, role, admin_tier, account_status, blocked_at, blocked_reason
         FROM users WHERE id = $1 LIMIT 1`,
        [id]
      );
      const before = beforeRes.rows[0];
      if (!before) return res.status(404).json({ error: "Usuario no encontrado" });

      const updated = await pool.query(
        `UPDATE users
         SET account_status = 'blocked',
             blocked_at = now(),
             blocked_reason = $2
         WHERE id = $1
         RETURNING id, email, role, admin_tier, account_status, blocked_at, blocked_reason`,
        [id, reason]
      );

      await writeAdminAuditLog(req, {
        action: "users:block",
        entityType: "user",
        entityId: id,
        beforeState: before,
        afterState: updated.rows[0],
      });

      return res.json({ user: updated.rows[0] });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Error interno" });
    }
  }
);

/**
 * PATCH /admin/users/:id/unblock
 */
app.patch(
  "/admin/users/:id/unblock",
  adminAuthMiddleware,
  requirePermission("admin:users:unblock"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!isUuid(id)) return res.status(400).json({ error: "ID inválido" });

      const beforeRes = await pool.query(
        `SELECT id, email, role, admin_tier, account_status, blocked_at, blocked_reason
         FROM users WHERE id = $1 LIMIT 1`,
        [id]
      );
      const before = beforeRes.rows[0];
      if (!before) return res.status(404).json({ error: "Usuario no encontrado" });

      const updated = await pool.query(
        `UPDATE users
         SET account_status = 'active',
             blocked_at = NULL,
             blocked_reason = NULL
         WHERE id = $1
         RETURNING id, email, role, admin_tier, account_status, blocked_at, blocked_reason`,
        [id]
      );

      await writeAdminAuditLog(req, {
        action: "users:unblock",
        entityType: "user",
        entityId: id,
        beforeState: before,
        afterState: updated.rows[0],
      });

      return res.json({ user: updated.rows[0] });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Error interno" });
    }
  }
);

/**
 * GET /admin/providers
 * Query: review_status, visibility, q, limit, offset
 */
app.get(
  "/admin/providers",
  adminAuthMiddleware,
  requirePermission("admin:providers:read"),
  async (req, res) => {
    try {
      const reviewStatus = toNullIfEmpty(req.query.review_status);
      const visibility = toNullIfEmpty(req.query.visibility);
      const q = toNullIfEmpty(req.query.q);

      const limit = Math.min(Math.max(Number(req.query.limit || 50), 1), 200);
      const offset = Math.max(Number(req.query.offset || 0), 0);

      const where = ["u.role = 'provider'"];
      const params = [];

      if (reviewStatus) {
        params.push(reviewStatus);
        where.push(`p.review_status = $${params.length}`);
      }
      if (visibility) {
        params.push(visibility);
        where.push(`p.public_visibility = $${params.length}`);
      }
      if (q) {
        params.push(`%${q}%`);
        where.push(
          `(u.email ILIKE $${params.length} OR COALESCE(p.company_name,'') ILIKE $${params.length} OR COALESCE(p.venue_name,'') ILIKE $${params.length})`
        );
      }

      params.push(limit);
      params.push(offset);

      const sql = `
        SELECT
          u.id AS user_id,
          u.email, u.name, u.created_at,
          p.company_name, p.owner_name, p.phone,
          p.venue_name, p.venue_location,
          p.review_status, p.public_visibility,
          p.is_featured,
          p.reviewed_by, p.reviewed_at, p.review_notes,
          p.updated_at
        FROM users u
        LEFT JOIN provider_profiles p ON p.user_id = u.id
        WHERE ${where.join(" AND ")}
        ORDER BY COALESCE(p.updated_at, u.created_at) DESC
        LIMIT $${params.length - 1}
        OFFSET $${params.length}
      `;

      const rows = await pool.query(sql, params);
      return res.json({ providers: rows.rows || [] });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Error interno" });
    }
  }
);

/**
 * PATCH /admin/providers/:id/status
 * Body: { review_status, public_visibility, review_notes, is_featured }
 */
app.patch(
  "/admin/providers/:id/status",
  adminAuthMiddleware,
  requirePermission("admin:providers:review"),
  async (req, res) => {
    try {
      const { id } = req.params;
      if (!isUuid(id)) return res.status(400).json({ error: "ID inválido" });

      const review_status = toNullIfEmpty(req.body?.review_status);
      const public_visibility = toNullIfEmpty(req.body?.public_visibility);
      const review_notes = toNullIfEmpty(req.body?.review_notes);

      const rawIsFeatured = req.body?.is_featured;
      const is_featured =
        rawIsFeatured === undefined ? null : toBooleanOrNull(rawIsFeatured);

      const allowedReview = new Set([
        "draft",
        "pending_review",
        "needs_changes",
        "approved",
        "rejected",
        "suspended",
        "archived",
      ]);
      const allowedVisibility = new Set(["hidden", "listed"]);

      if (review_status && !allowedReview.has(review_status)) {
        return res.status(400).json({ error: "review_status inválido" });
      }
      if (public_visibility && !allowedVisibility.has(public_visibility)) {
        return res.status(400).json({ error: "public_visibility inválido" });
      }
      if (rawIsFeatured !== undefined && is_featured === null) {
        return res.status(400).json({ error: "is_featured inválido" });
      }

      const beforeRes = await pool.query(
        `SELECT user_id, review_status, public_visibility, is_featured, reviewed_by, reviewed_at, review_notes
         FROM provider_profiles
         WHERE user_id = $1
         LIMIT 1`,
        [id]
      );
      const before = beforeRes.rows[0];
      if (!before) return res.status(404).json({ error: "Proveedor no encontrado" });

      const updatedRes = await pool.query(
        `UPDATE provider_profiles
         SET review_status = COALESCE($2, review_status),
             public_visibility = COALESCE($3, public_visibility),
             review_notes = COALESCE($4, review_notes),
             is_featured = COALESCE($5, is_featured),
             reviewed_by = $1,
             reviewed_at = now()
         WHERE user_id = $6
         RETURNING user_id, review_status, public_visibility, is_featured, reviewed_by, reviewed_at, review_notes`,
        [req.authUser.id, review_status, public_visibility, review_notes, is_featured, id]
      );

      const after = updatedRes.rows[0];

      await writeAdminAuditLog(req, {
        action: "providers:status",
        entityType: "provider",
        entityId: id,
        beforeState: before,
        afterState: after,
      });

      return res.json({ moderation: after });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Error interno" });
    }
  }
);

/**
 * GET /admin/audit (mínimo)
 * Query: entity_type, entity_id, limit
 */
app.get(
  "/admin/audit",
  adminAuthMiddleware,
  (req, res, next) => {
    // solo super por ahora
    if (req.authUser?.admin_tier !== "super") {
      return res.status(403).json({ error: "No tienes permisos para ver auditoría" });
    }
    return next();
  },
  async (req, res) => {
    try {
      const entityType = toNullIfEmpty(req.query.entity_type);
      const entityId = toNullIfEmpty(req.query.entity_id);
      const limit = Math.min(Math.max(Number(req.query.limit || 50), 1), 200);

      const where = [];
      const params = [];

      if (entityType) {
        params.push(entityType);
        where.push(`entity_type = $${params.length}`);
      }
      if (entityId) {
        if (!isUuid(entityId)) return res.status(400).json({ error: "entity_id inválido" });
        params.push(entityId);
        where.push(`entity_id = $${params.length}`);
      }

      params.push(limit);

      const rows = await pool.query(
        `
        SELECT id, admin_user_id, action, entity_type, entity_id, before_state, after_state, ip, user_agent, created_at
        FROM admin_audit_logs
        ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
        ORDER BY created_at DESC
        LIMIT $${params.length}
        `,
        params
      );

      return res.json({ logs: rows.rows || [] });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Error interno" });
    }
  }
);

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

  // Multer
  if (err?.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "Imagen demasiado grande (máx 6MB)." });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({ error: "Demasiadas fotos (máx 12)." });
    }
    return res.status(400).json({ error: "Error al subir archivos." });
  }

  if (String(err?.message || "").includes("Tipo de archivo no permitido")) {
    return res.status(400).json({ error: "Tipo de archivo no permitido. Usa JPG/PNG/WebP." });
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