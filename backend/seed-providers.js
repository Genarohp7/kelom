/* eslint-env node */
/* global process */

import dotenv from "dotenv";
dotenv.config();

import crypto from "crypto";
import bcrypt from "bcrypt";
import { pool } from "./db.js";

function rndPassword(len = 16) {
  // base64 puede traer + / =, lo limpiamos
  return crypto.randomBytes(Math.ceil(len)).toString("base64").replace(/[+/=]/g, "").slice(0, len);
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

async function upsertLead(client, { companyName, ownerName, phone, email }) {
  await client.query(
    `INSERT INTO provider_leads (company_name, owner_name, phone, email, status)
     VALUES ($1,$2,$3,$4,'converted')
     ON CONFLICT (email) DO UPDATE SET
       company_name = EXCLUDED.company_name,
       owner_name = EXCLUDED.owner_name,
       phone = EXCLUDED.phone,
       status = 'converted',
       updated_at = now()`,
    [companyName, ownerName, phone, email]
  );
}

async function createProvider({ email, password, name, lead, profile }) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const emailNorm = normalizeEmail(email);

    // ¿Ya existe user?
    const found = await client.query(
      `SELECT id, role FROM users WHERE email = $1 LIMIT 1`,
      [emailNorm]
    );

    let userId;

    if (found.rowCount > 0) {
      const u = found.rows[0];
      userId = u.id;

      // Asegurar role provider
      if (u.role !== "provider") {
        await client.query(`UPDATE users SET role = 'provider' WHERE id = $1`, [userId]);
      }

      // Reset password siempre (para pruebas)
      const hash = await bcrypt.hash(password, 10);
      await client.query(`UPDATE users SET password_hash = $1, name = $2 WHERE id = $3`, [
        hash,
        name || null,
        userId,
      ]);
    } else {
      const hash = await bcrypt.hash(password, 10);
      const ins = await client.query(
        `INSERT INTO users (email, password_hash, name, role)
         VALUES ($1,$2,$3,'provider')
         RETURNING id`,
        [emailNorm, hash, name || null]
      );
      userId = ins.rows[0].id;
    }

    // Lead (opcional pero “realista”)
    await upsertLead(client, {
      companyName: lead.companyName,
      ownerName: lead.ownerName,
      phone: lead.phone,
      email: emailNorm,
    });

    // Perfil proveedor (completo)
    // IMPORTANTE: no tocamos review_status/public_visibility en UPDATE para no pisar decisiones del admin.
    await client.query(
      `INSERT INTO provider_profiles (
        user_id, company_name, owner_name, phone,
        venue_name, venue_location, location_place_id, location_lat, location_lng,
        capacity_min, capacity_max, price_from, price_to,
        short_description, description, spaces, services, rules,
        website, instagram, facebook, map_text, event_types, selling_points,
        review_status, public_visibility
      ) VALUES (
        $1,$2,$3,$4,
        $5,$6,$7,$8,$9,
        $10,$11,$12,$13,
        $14,$15,$16,$17,$18,
        $19,$20,$21,$22,$23,$24,
        'pending_review','hidden'
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
        selling_points = EXCLUDED.selling_points`,
      [
        userId,
        profile.companyName,
        profile.ownerName,
        profile.phone,

        profile.venueName,
        profile.venueLocation,
        profile.locationPlaceId || null,
        profile.locationLat ?? null,
        profile.locationLng ?? null,

        profile.capacityMin,
        profile.capacityMax ?? null,
        profile.priceFrom,
        profile.priceTo,

        profile.shortDescription,
        profile.description,
        profile.spaces || null,
        profile.services,
        profile.rules || null,

        profile.website || null,
        profile.instagram || null,
        profile.facebook || null,
        profile.mapText || null,
        profile.eventTypes || [],
        profile.sellingPoints || [],
      ]
    );

    await client.query("COMMIT");

    return { userId, email: emailNorm, password };
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch {
      void 0;
    }
    throw err;
  } finally {
    client.release();
  }
}

async function main() {
  const prov1Pass = process.env.PROV1_PASSWORD || rndPassword(18);
  const prov2Pass = process.env.PROV2_PASSWORD || rndPassword(18);

  const providers = [
    {
      email: process.env.PROV1_EMAIL || "demo1-proveedor@kelom.com.mx",
      password: prov1Pass,
      name: "Mariana Soto",
      lead: {
        companyName: "Jardín Prisma",
        ownerName: "Mariana Soto",
        phone: "5582719364",
      },
      profile: {
        companyName: "Jardín Prisma",
        ownerName: "Mariana Soto",
        phone: "5582719364",
        venueName: "Jardín Prisma",
        venueLocation: "San Ángel, CDMX",
        capacityMin: 120,
        capacityMax: 320,
        priceFrom: 35000,
        priceTo: 85000,
        shortDescription: "Jardín elegante con área techada y jardín principal para ceremonia.",
        description:
          "Espacio rodeado de áreas verdes con opción de ceremonia civil, recepción y zona para fotos. Ideal para bodas medianas y grandes.",
        services: "Banquete, mobiliario, coordinación, estacionamiento",
        spaces: "Jardín principal, terraza techada, zona lounge",
        rules: "Horario máximo 2am. Sin pirotecnia.",
        website: "https://ejemplo-prisma.com",
        instagram: "@jardinprisma",
        facebook: "Jardín Prisma",
        mapText: "Zona sur de CDMX. Acceso rápido desde periférico.",
        eventTypes: ["Boda civil", "Boda religiosa", "Recepción al aire libre"],
        sellingPoints: [
          "Ceremonia y recepción en el mismo lugar",
          "Área techada por lluvia",
          "Espacio para fotos al atardecer",
        ],
      },
    },
    {
      email: process.env.PROV2_EMAIL || "demo2-proveedor@kelom.com.mx",
      password: prov2Pass,
      name: "Luis Hernández",
      lead: {
        companyName: "Hacienda Nube",
        ownerName: "Luis Hernández",
        phone: "5591847263",
      },
      profile: {
        companyName: "Hacienda Nube",
        ownerName: "Luis Hernández",
        phone: "5591847263",
        venueName: "Hacienda Nube",
        venueLocation: "Metepec, Estado de México",
        capacityMin: 80,
        capacityMax: 220,
        priceFrom: 28000,
        priceTo: 65000,
        shortDescription: "Hacienda clásica con salón interior y patio central para eventos.",
        description:
          "Hacienda con arquitectura tradicional, salón interior, patio central y zona de barra. Perfecta para bodas íntimas y medianas.",
        services: "Banquete, barra, mobiliario, valet parking",
        spaces: "Patio central, salón interior, área de barra",
        rules: "No confeti. Música hasta 1am.",
        website: "https://ejemplo-nube.com",
        instagram: "@haciendanube",
        facebook: "Hacienda Nube",
        mapText: "A 10 min del centro de Metepec. Acceso sencillo para invitados.",
        eventTypes: ["Boda civil", "Recepción en salón", "Coctel"],
        sellingPoints: [
          "Patio central espectacular",
          "Salón interior incluido",
          "Paquetes flexibles",
        ],
      },
    },
  ];

  const results = [];
  for (const p of providers) {
    const r = await createProvider(p);
    results.push(r);
  }

  console.log("\n✅ Proveedores de prueba creados/actualizados:");
  results.forEach((r, i) => {
    console.log(`\nPROV${i + 1}`);
    console.log("  id:", r.userId);
    console.log("  email:", r.email);
    console.log("  password:", r.password);
    console.log("  estado:", "pending_review + hidden (hasta que el admin apruebe)");
  });

  console.log("\nTip: entra al panel /admin y apruébalos para que se publiquen.\n");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
