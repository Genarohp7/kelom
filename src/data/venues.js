// src/data/venues.js

const venues = [
  {
    id: "terraza-luna",
    name: "Terraza Luna Roma",
    image:
      "https://images.pexels.com/photos/169211/pexels-photo-169211.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.9,
    reviews: 27,
    location: "Roma · Ciudad de México",

    // 👇 NUEVOS CAMPOS PARA LA VISTA DE DETALLE
    heroImage:
      "https://images.pexels.com/photos/169211/pexels-photo-169211.jpeg?auto=compress&cs=tinysrgb&w=1200",
    gallery: [
      "https://images.pexels.com/photos/169211/pexels-photo-169211.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/2306281/pexels-photo-2306281.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/169210/pexels-photo-169210.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/167404/pexels-photo-167404.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    capacity: "80 – 180 invitados",
    priceRange: "Desde $900 por persona",
    style: "Terraza urbana · Jardín · Salón",
    shortDescription:
      "Terraza con vista urbana en plena Roma, perfecta para bodas íntimas con atmósfera cálida y detalles cuidados.",
    highlightPoints: [
      "Ceremonia civil y simbólica en el mismo lugar.",
      "Cocina propia con menús personalizables.",
      "Espacios techados y al aire libre.",
    ],
    opinions: [
      {
        score: 5,
        text:
          "Nos encantó la terraza, la vista de noche y el servicio el día del evento. Todo fluyó sin estrés.",
        couple: "Ana & Diego",
        date: "marzo 2024",
      },
      {
        score: 4.8,
        text:
          "Muy flexibles con nuestros proveedores externos y con los horarios de montaje.",
        couple: "Mariana & Luis",
        date: "enero 2024",
      },
    ],
    rankingPosition: 3,
    rankingCategory: "Terrazas para bodas en CDMX",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=TU_EMBED_AQUI",
  },
  {
    id: "jardin-hacienda-san-mateo",
    name: "Jardín Hacienda San Mateo",
    image:
      "https://images.pexels.com/photos/1692115/pexels-photo-1692115.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.7,
    reviews: 41,
    location: "San Mateo · Estado de México",
    heroImage:
      "https://images.pexels.com/photos/1692115/pexels-photo-1692115.jpeg?auto=compress&cs=tinysrgb&w=1200",
    gallery: [
      "https://images.pexels.com/photos/1692115/pexels-photo-1692115.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/2306279/pexels-photo-2306279.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/169190/pexels-photo-169190.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/169195/pexels-photo-169195.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    capacity: "120 – 300 invitados",
    priceRange: "Paquetes integrales desde $1,050 por persona",
    style: "Jardín · Hacienda · Vintage",
    shortDescription:
      "Hacienda con jardines amplios, ideal para ceremonias al aire libre y recepciones de gran formato.",
    highlightPoints: [
      "Capilla a unos minutos del lugar.",
      "Estacionamiento amplio y valet parking.",
      "Plan B en salón cerrado para temporada de lluvia.",
    ],
    opinions: [
      {
        score: 4.9,
        text:
          "El jardín se veía espectacular y el equipo estuvo súper pendiente de cada detalle.",
        couple: "Karen & José",
        date: "noviembre 2023",
      },
    ],
    rankingPosition: 5,
    rankingCategory: "Jardines para bodas en EDOMEX",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=TU_EMBED_AQUI",
  },
  {
    id: "salon-aurora-centro",
    name: "Salón Aurora Centro",
    image:
      "https://images.pexels.com/photos/265920/pexels-photo-265920.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.6,
    reviews: 33,
    location: "Centro · Ciudad de México",
    heroImage:
      "https://images.pexels.com/photos/265920/pexels-photo-265920.jpeg?auto=compress&cs=tinysrgb&w=1200",
    gallery: [
      "https://images.pexels.com/photos/265920/pexels-photo-265920.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/750370/pexels-photo-750370.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/169190/pexels-photo-169190.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1114425/pexels-photo-1114425.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    capacity: "60 – 150 invitados",
    priceRange: "Desde $750 por persona",
    style: "Salón clásico · Urbano",
    shortDescription:
      "Salón en el centro de la ciudad, práctico para invitados que se mueven en transporte público.",
    highlightPoints: [
      "Ubicación muy accesible para todos los invitados.",
      "Opciones de menú tradicional y contemporáneo.",
      "Pantallas y equipo de audio incluido.",
    ],
    opinions: [
      {
        score: 4.6,
        text:
          "La relación costo-beneficio es muy buena y nos ayudaron mucho con la logística.",
        couple: "Fabiola & Héctor",
        date: "agosto 2023",
      },
    ],
    rankingPosition: 8,
    rankingCategory: "Salones para bodas en CDMX",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=TU_EMBED_AQUI",
  },
];

export default venues;
