/* eslint-env node */
/* global process */

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
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
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Origen no permitido por CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());

// Health + DB check
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", message: "Kelom API funcionando", db: "ok" });
  } catch (e) {
    res.status(500).json({ status: "error", message: "DB no disponible" });
  }
});

// Crear usuario (MVP)
app.post("/users", async (req, res) => {
  try {
    const { email, password, name } = req.body || {};

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "email y password son obligatorios" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name)
       VALUES ($1, $2, $3)
       RETURNING id, email, name, created_at, role`,
      [email.toLowerCase(), password_hash, name || null]
    );

    // Nunca regreses password_hash al front
    const { password_hash: _PASSWORD_HASH, ...safeUser } = result.rows[0];

    return res.status(201).json({ data: safeUser });
  } catch (e) {
    if (e?.code === "23505") {
      return res.status(409).json({ error: "Ese email ya existe" });
    }
    console.error(e);
    return res.status(500).json({ error: "Error interno" });
  }
});

app.get("/", (req, res) => res.send("Kelom API"));

app.listen(PORT, () => {
  console.log(`Kelom API escuchando en el puerto ${PORT}`);
});
