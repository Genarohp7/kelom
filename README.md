# Kelom

Plataforma web para conectar parejas que planean su boda con proveedores (venues, banquetes, planners, etc.).  
MVP actual: registro/login con JWT + ficha de boda persistente en PostgreSQL.

---

## Stack

### Frontend
- React + Vite
- React Router
- Auth: JWT en `localStorage`
- Hosting: HostGator (cPanel)
- Producción: https://kelom.com.mx

### Backend
- Node.js + Express
- Auth: JWT + bcrypt
- DB: PostgreSQL (pg Pool)
- Deploy: Google Cloud VM (Ubuntu) + PM2 + Nginx reverse proxy
- Producción API: https://api.kelom.com.mx

### Base de datos
- PostgreSQL (en la misma VM)
- Tablas clave:
  - `users` (uuid, email citext unique, password_hash, name, role, created_at)
  - `wedding_profiles` (1:1 con users, ficha extendida, updated_at automático)

---

## Arquitectura (alto nivel)

- Front (HostGator): sirve el build `dist/`
- API (VM): Nginx -> proxy a Node (PM2) en `127.0.0.1:3001`
- DB (VM): PostgreSQL local

---

## Variables de entorno

### Frontend (Vite)
En `.env.production` (o configuración del hosting):
- `VITE_API_URL=https://api.kelom.com.mx`

### Backend (VM)
En `/var/www/kelom-api/.env` (NO subir a git):
- `DB_HOST`
- `DB_PORT=5432`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `JWT_SECRET`
- `PORT=3001`

---

## Scripts

### Frontend
- `npm run dev` -> desarrollo
- `npm run build` -> genera `dist/`

### Backend
- `npm run dev` -> nodemon
- `npm start` -> node server.js

Si agregaste scripts de DB:
- `npm run db:migrate` -> corre migraciones
- `npm run db:test` -> prueba trigger updated_at en wedding_profiles

---

## Endpoints principales (API)

- `GET /health` -> status API + DB
- `POST /users` -> registro (email, password, name)
- `POST /auth/login` -> login (token + user)
- `GET /auth/me` -> usuario (Bearer token)
- `GET /profile/me` -> ficha de boda (Bearer token)
- `PUT /profile/me` -> upsert ficha de boda (Bearer token)

---

## Migraciones (DB)

Migración inicial:
- `migrations/001_wedding_profiles.sql`
  - crea `wedding_profiles`
  - crea función `set_updated_at()`
  - crea trigger `trg_wedding_profiles_updated_at`

Ejecutar en VM (manual):
```bash
cd /var/www/kelom-api
set -a; source .env; set +a
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f ./migrations/001_wedding_profiles.sql