/* eslint-env node */
/* global process */

import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcrypt";
import { pool } from "../db.js";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

async function main() {
  const email = normalizeEmail(process.env.ADMIN_EMAIL);
  const password = String(process.env.ADMIN_PASSWORD || "");
  const name = String(process.env.ADMIN_NAME || "Super Admin").trim();

  const promoteExisting = String(process.env.ADMIN_PROMOTE_EXISTING || "") === "1";
  const resetPassword = String(process.env.ADMIN_RESET_PASSWORD || "") === "1";

  if (!email || !password) {
    console.error("Faltan variables: ADMIN_EMAIL y ADMIN_PASSWORD");
    process.exit(1);
  }

  if (password.length < 10) {
    console.error("ADMIN_PASSWORD debe tener mínimo 10 caracteres (mejor 16+).");
    process.exit(1);
  }

  const existing = await pool.query(
    `SELECT id, email, role, admin_tier
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [email]
  );

  if (existing.rowCount > 0) {
    const u = existing.rows[0];

    if (!promoteExisting && u.role !== "admin") {
      console.error(
        `El usuario ya existe con role='${u.role}'. Si quieres promoverlo a admin: ADMIN_PROMOTE_EXISTING=1`
      );
      process.exit(1);
    }

    if (u.role === "admin") {
      await pool.query(
        `UPDATE users
         SET admin_tier = 'super'
         WHERE id = $1`,
        [u.id]
      );
    } else {
      await pool.query(
        `UPDATE users
         SET role = 'admin',
             admin_tier = 'super'
         WHERE id = $1`,
        [u.id]
      );
    }

    if (resetPassword) {
      const hash = await bcrypt.hash(password, 10);
      await pool.query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [hash, u.id]);
    }

    console.log("OK: Admin actualizado:", { id: u.id, email, role: "admin", admin_tier: "super" });
    process.exit(0);
  }

  const hash = await bcrypt.hash(password, 10);

  const created = await pool.query(
    `INSERT INTO users (email, password_hash, name, role, admin_tier)
     VALUES ($1, $2, $3, 'admin', 'super')
     RETURNING id, email, name, role, admin_tier, created_at`,
    [email, hash, name || null]
  );

  console.log("OK: Admin creado:", created.rows[0]);
  process.exit(0);
}

main().catch((err) => {
  console.error("Error creando admin:", err);
  process.exit(1);
});