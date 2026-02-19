/* eslint-env node */
/* global process */

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "./db.js";

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  "http://localhost:5173",
  "https://kelom.com.mx",
  "https://www.kelom.com.mx",
];

app.use(
  cors({
    origin(origin, cb) {
      // permite server-to-server / curl sin Origin
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Origen no permitido por CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());

// ====================== helpers ======================
function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Esto te evita “funciona en local pero muere en prod”
    throw new Error("JWT_SECRET no está definido en el entorno");
  }

  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    secret,
    { expiresIn: "7d" }
  );
}

function authRequired(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ error: "Token requerido" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    console.error("AUTH ERROR:", err);
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

// ====================== health ======================
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", message: "Kelom API funcionando", db: "ok" });
  } catch (err) {
    console.error("HEALTH DB ERROR:", err);
    res.status(500).json({ status: "error", message: "DB no disponible" });
  }
});

// ====================== auth ======================

// LOGIN
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "email y password son obligatorios" });
    }

    const result = await pool.query(
      `SELECT id, email, password_hash, name, role, created_at
       FROM users
       WHERE email = $1
       LIMIT 1`,
      [email.toLowerCase()]
    );

    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

    const token = signToken(user);

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ error: "Error interno" });
  }
});

// QUIÉN SOY (requiere token)
app.get("/auth/me", authRequired, async (req, res) => {
  try {
    const userId = req.user.sub;

    const result = await pool.query(
      `SELECT id, email, name, role, created_at
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [userId]
    );

    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    return res.json({ user });
  } catch (err) {
    console.error("ME ERROR:", err);
    return res.status(500).json({ error: "Error interno" });
  }
});

// ====================== users (MVP) ======================
// Crear usuario (registro simple backend)
app.post("/users", async (req, res) => {
  try {
    const { email, password, name } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: "email y password son obligatorios" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name)
       VALUES ($1, $2, $3)
       RETURNING id, email, name, role, created_at`,
      [email.toLowerCase(), password_hash, name || null]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    if (err?.code === "23505") {
      return res.status(409).json({ error: "Ese email ya existe" });
    }
    console.error("CREATE USER ERROR:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

app.get("/", (req, res) => res.send("Kelom API"));

app.listen(PORT, () => {
  console.log(`Kelom API escuchando en el puerto ${PORT}`);
});
