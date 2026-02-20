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

// Importante: detrás de Nginx para que req.ip use X-Forwarded-For
app.set("trust proxy", 1);

// Evita revelar tecnología
app.disable("x-powered-by");

// Seguridad básica de headers
app.use(helmet());

// Rate limit global (suave) + limitadores específicos
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600, // tráfico normal sin castigar
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiadas solicitudes. Intenta más tarde." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // anti brute-force
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados intentos. Intenta más tarde." },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20, // anti abuso de registros
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados registros desde esta IP. Intenta más tarde." },
});

app.use(globalLimiter);

const allowedOrigins = [
  "http://localhost:5173",
  "https://kelom.com.mx",
  "https://www.kelom.com.mx",
];

app.use(
  cors({
    origin(origin, cb) {
      // Permite curl/health checks sin Origin
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Origen no permitido por CORS"));
    },
    credentials: true,
  })
);

// Límite de JSON para evitar payloads enormes (avatar base64 aún NO va al backend)
app.use(express.json({ limit: "500kb" }));

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

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
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

// Crear usuario (MVP)
app.post("/users", registerLimiter, async (req, res) => {
  try {
    const { email, password, name } = req.body || {};

    const emailNorm = normalizeEmail(email);

    if (!emailNorm || !password) {
      return res.status(400).json({ error: "email y password son obligatorios" });
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

// Login: devuelve JWT
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

// Me: devuelve usuario usando token
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

// ===================== PROFILE (FICHA DE BODA) =====================

// Obtener ficha de boda del usuario logueado
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

// Crear/actualizar ficha de boda (UPSERT) + opcional actualizar name en users
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
    const weddingDate = toNullIfEmpty(body.weddingDate); // YYYY-MM-DD
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
      await client.query("ROLLBACK");
    } catch {
      // ignore
    }
    console.error(err);
    return res.status(500).json({ error: "Error interno" });
  } finally {
    client.release();
  }
});

app.get("/", (req, res) => res.send("Kelom API"));

// 404 JSON
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Error handler (Express lo reconoce SOLO si hay 4 params)
app.use((err, req, res, next) => {
  void next; // evita warning: next unused, pero mantenemos firma de error-handler

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