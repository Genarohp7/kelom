// src/services/emailjsService.js
import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || "";
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "";

const TEMPLATE_ADMIN_NEW_REQUEST =
  import.meta.env.VITE_EMAILJS_TEMPLATE_ADMIN_NEW_REQUEST || "";
const TEMPLATE_PROVIDER_FEATURED_APPROVED =
  import.meta.env.VITE_EMAILJS_TEMPLATE_PROVIDER_FEATURED_APPROVED || "";
const TEMPLATE_PROVIDER_FREE_APPROVED =
  import.meta.env.VITE_EMAILJS_TEMPLATE_PROVIDER_FREE_APPROVED || "";
const TEMPLATE_USER_DECLINED =
  import.meta.env.VITE_EMAILJS_TEMPLATE_USER_DECLINED || "";

const KELOM_REQUESTS_EMAIL =
  import.meta.env.VITE_KELOM_REQUESTS_EMAIL || "solicitudes@kelom.com.mx";
const KELOM_SUPPORT_EMAIL =
  import.meta.env.VITE_KELOM_SUPPORT_EMAIL || "clientes@mail.com";

function clean(value) {
  return String(value ?? "").trim();
}

function requireEmailJsBaseConfig() {
  if (!EMAILJS_SERVICE_ID) {
    throw new Error("Falta VITE_EMAILJS_SERVICE_ID");
  }

  if (!EMAILJS_PUBLIC_KEY) {
    throw new Error("Falta VITE_EMAILJS_PUBLIC_KEY");
  }
}

async function sendEmail(templateId, templateParams) {
  requireEmailJsBaseConfig();

  if (!templateId) {
    throw new Error("Falta templateId de EmailJS");
  }

  return emailjs.send(
    EMAILJS_SERVICE_ID,
    templateId,
    templateParams,
    EMAILJS_PUBLIC_KEY,
  );
}

async function sendAdminNewInfoRequestEmail({
  providerName,
  providerId,
  requesterName,
  requesterEmail,
  requesterPhone,
  preferredContactSchedule,
  message,
}) {
  const templateParams = {
    to_email: KELOM_REQUESTS_EMAIL,
    kelom_requests_email: KELOM_REQUESTS_EMAIL,
    provider_name: clean(providerName),
    provider_id: clean(providerId),
    requester_name: clean(requesterName),
    requester_email: clean(requesterEmail),
    requester_phone: clean(requesterPhone),
    preferred_contact_schedule: clean(preferredContactSchedule),
    message: clean(message),
    flow_stage: "pending_admin_review",
  };

  return sendEmail(TEMPLATE_ADMIN_NEW_REQUEST, templateParams);
}

async function sendProviderApprovedInfoRequestEmail({
  providerName,
  providerEmail,
  isFeatured,
  requesterName,
  requesterEmail,
  requesterPhone,
  preferredContactSchedule,
  message,
}) {
  const featured = Boolean(isFeatured);

  const templateParams = {
    to_email: clean(providerEmail),
    provider_name: clean(providerName),
    provider_modality: featured
      ? "Proveedor Destacado Kelom"
      : "Proveedor gratuito",
    requester_name: featured ? clean(requesterName) : "",
    requester_email: clean(requesterEmail),
    requester_phone: featured ? clean(requesterPhone) : "",
    preferred_contact_schedule: featured ? clean(preferredContactSchedule) : "",
    message: featured ? clean(message) : "",
    upgrade_message: featured
      ? ""
      : "Hazte Proveedor Destacado Kelom para obtener más información de quien quiere saber de tu negocio.",
  };

  return sendEmail(
    featured
      ? TEMPLATE_PROVIDER_FEATURED_APPROVED
      : TEMPLATE_PROVIDER_FREE_APPROVED,
    templateParams,
  );
}

async function sendUserDeclinedInfoRequestEmail({
  requesterName,
  requesterEmail,
  providerName,
}) {
  const templateParams = {
    to_email: clean(requesterEmail),
    requester_name: clean(requesterName),
    provider_name: clean(providerName),
    kelom_support_email: KELOM_SUPPORT_EMAIL,
  };

  return sendEmail(TEMPLATE_USER_DECLINED, templateParams);
}

function getEmailJsConfigSummary() {
  return {
    hasServiceId: Boolean(EMAILJS_SERVICE_ID),
    hasPublicKey: Boolean(EMAILJS_PUBLIC_KEY),
    hasAdminTemplate: Boolean(TEMPLATE_ADMIN_NEW_REQUEST),
    hasProviderFeaturedTemplate: Boolean(TEMPLATE_PROVIDER_FEATURED_APPROVED),
    hasProviderFreeTemplate: Boolean(TEMPLATE_PROVIDER_FREE_APPROVED),
    hasUserDeclinedTemplate: Boolean(TEMPLATE_USER_DECLINED),
    requestsEmail: KELOM_REQUESTS_EMAIL,
    supportEmail: KELOM_SUPPORT_EMAIL,
  };
}

export {
  sendAdminNewInfoRequestEmail,
  sendProviderApprovedInfoRequestEmail,
  sendUserDeclinedInfoRequestEmail,
  getEmailJsConfigSummary,
};