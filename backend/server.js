/* eslint-env node */
/* global process */  // 👉 le decimos a ESLint que "process" existe en este archivo

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();


const PORT = process.env.PORT || 3001;

// Lista de orígenes permitidos (luego la afinamos)
const allowedOrigins = [
  "http://localhost:5173", // frontend en dev
  "https://kelom.com.mx", // dominio real
  "https://www.kelom.com.mx",
];

// CORS
app.use(
  cors({
    origin(origin, callback) {
      // Permitir herramientas tipo Postman (sin origin)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origen no permitido por CORS"));
    },
    credentials: true,
  }),
);

app.use(express.json());

// Ruta simple para probar que el backend responde
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Kelom API funcionando" });
});

// Ruta raíz opcional
app.get("/", (req, res) => {
  res.send("Kelom API");
});

app.listen(PORT, () => {
  console.log(`Kelom API escuchando en el puerto ${PORT}`);
});
