/* =====================================================================
   CAMPAÑAS Y NOTICIAS (carrusel)
   - Para AGREGAR una campaña: copie un bloque { ... } y cambie sus datos.
     El orden de la lista es el orden del carrusel.
   - Para OCULTARLA sin borrarla: ponga  activa: false
   - imagen (opcional): suba la foto a assets/campanas/ y escriba su nombre,
     por ejemplo "rabia.jpg". Sin imagen se usa el color y el ícono.
   - portales: en qué portales aparece ("sivisa" = página de inicio).
   - desde / hasta (opcional, AAAA-MM-DD): fechas en que se muestra.
   - iconos disponibles: corazon, escudo, gota, mosquito, pulmon, perro,
     vacuna, sol, frio, megafono
   ===================================================================== */
window.CAMPANAS = [
  {
    activa: true,
    etiqueta: "Prevención",
    titulo: "Prevención de la leishmaniasis",
    texto: "Usa mosquitero y repelente al anochecer. Si tienes una herida que no cicatriza en más de dos semanas, acude a tu establecimiento de salud.",
    icono: "mosquito",
    color: "#0f6b62",
    imagen: "",
    enlace: "",
    portales: ["sivisa", "epidemiologia"],
    desde: "", hasta: ""
  },
  {
    activa: true,
    etiqueta: "Agua segura",
    titulo: "Consume agua segura",
    texto: "Hierve o clora el agua antes de tomarla y lávate las manos con agua y jabón para prevenir las enfermedades diarreicas.",
    icono: "gota",
    color: "#0b4e96",
    imagen: "",
    enlace: "",
    portales: ["sivisa", "epidemiologia", "salud-ambiental"],
    desde: "", hasta: ""
  },
  {
    activa: true,
    etiqueta: "Temporada de frío",
    titulo: "Protege a niños y adultos mayores",
    texto: "Abrígalos bien. Si un niño respira rápido, tiene fiebre alta o no quiere lactar, llévalo de inmediato al establecimiento de salud.",
    icono: "frio",
    color: "#3b4aa8",
    imagen: "",
    enlace: "",
    portales: ["sivisa", "epidemiologia"],
    desde: "", hasta: ""
  },
  {
    activa: true,
    etiqueta: "Zoonosis",
    titulo: "Prevención de la rabia",
    texto: "Vacuna a tus perros y gatos. Ante una mordedura, lava la herida con abundante agua y jabón y acude al establecimiento de salud.",
    icono: "perro",
    color: "#8a3d8f",
    imagen: "",
    enlace: "",
    portales: ["sivisa", "epidemiologia", "promsa"],
    desde: "", hasta: ""
  }
];
