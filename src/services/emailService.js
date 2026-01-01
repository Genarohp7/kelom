// src/services/emailService.js
import emailjs from "@emailjs/browser";

// 👉 Rellena estos con tus datos reales de EmailJS
const SERVICE_ID = "service_f98s07h"; // tu service ID

// 🔹 Templates de registro de PAREJAS
const TEMPLATE_USER_REGISTER_ADMIN = "template_0yncnd6"; // notificación admin parejas
const TEMPLATE_USER_REGISTER_WELCOME = "template_7dehu3p"; // bienvenida parejas

// 🔹 Templates de registro de PROVEEDORES (PÓN LOS TUYOS)
const TEMPLATE_BUSINESS_REGISTER_ADMIN = "template_lsll3ou";   // ← CAMBIA este ID
const TEMPLATE_BUSINESS_REGISTER_WELCOME = "template_r1e494m"; // ← CAMBIA este ID

const PUBLIC_KEY = "7j2rp-8eJJRoNlCUs"; // tu public key

// ================= PAREJAS =================

export function sendUserRegisterEmails({ fullName, email, phone }) {
  const templateParams = {
    full_name: fullName,
    user_email: email,
    user_phone: phone,
    form_origin: "Registro de pareja · Kelom",
  };

  const adminPromise = emailjs.send(
    SERVICE_ID,
    TEMPLATE_USER_REGISTER_ADMIN,
    templateParams,
    PUBLIC_KEY
  );

  const welcomePromise = emailjs.send(
    SERVICE_ID,
    TEMPLATE_USER_REGISTER_WELCOME,
    templateParams,
    PUBLIC_KEY
  );

  // Se resuelve cuando terminen ambas
  return Promise.all([adminPromise, welcomePromise]);
}

// ================= PROVEEDORES =================

export function sendBusinessRegisterEmails({
  companyName,
  ownerName,
  email,
  phone,
}) {
  const templateParams = {
    company_name: companyName,
    owner_name: ownerName,
    owner_email: email,
    owner_phone: phone,
    form_origin: "Registro de proveedor · Kelom",
  };

  // correo que te llega a ti (admin)
  const adminPromise = emailjs.send(
    SERVICE_ID,
    TEMPLATE_BUSINESS_REGISTER_ADMIN,
    templateParams,
    PUBLIC_KEY
  );

  // correo de bienvenida al proveedor
  const welcomePromise = emailjs.send(
    SERVICE_ID,
    TEMPLATE_BUSINESS_REGISTER_WELCOME,
    templateParams,
    PUBLIC_KEY
  );

  return Promise.all([adminPromise, welcomePromise]);
}
