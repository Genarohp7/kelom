// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // 👇 MUY IMPORTANTE para GitHub Pages (proyecto, NO user.github.io)
  base: "/KELOM/", // cambia KELOM por el NOMBRE REAL DE TU REPO
});
