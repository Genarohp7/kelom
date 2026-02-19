/* eslint-env node */
/* global process */

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import pg from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carga SIEMPRE el .env del mismo folder donde vive db.js
dotenv.config({ path: join(__dirname, ".env") });

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});
