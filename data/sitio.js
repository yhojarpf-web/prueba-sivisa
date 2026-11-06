/* =====================================================================
   CONFIGURACIÓN DEL SITIO SIVISA
   Edite este archivo para cambiar textos, portales, enlaces y contacto.
   - Para AGREGAR un portal: copie un bloque { ... } dentro de "portales"
     y cambie sus datos. Aparecerá automáticamente como una tarjeta más.
   - Para CAMBIAR un logo: reemplace el archivo en assets/logos/ con el
     mismo nombre, o cambie aquí el nombre del archivo.
   ===================================================================== */
window.SITIO = {
  institucion: "Red Integrada de Salud Chachapoyas",
  titulo: "SIVISA",
  subtitulo: "Sistema de Información de Vigilancia Sanitaria",
  etiqueta: "Portal informativo",

  /* Imagen de portada: reemplace el archivo en assets/img/ con el mismo nombre.
     modo "derecha": la foto ocupa el lado derecho y se funde con el fondo azul.
     modo "completa": la imagen cubre toda la franja (para fondos ya diseñados). */
  portada: { imagen: "portada.jpg", modo: "completa" },

  logosCabecera: ["gore.png", "diresa.png", "red_salud.png"],
  logosPie: [],   /* opcional: logos repetidos en el pie de página */

  portales: [
    {
      id: "epidemiologia",
      titulo: "Portal Epidemiológico",
      corto: "Epidemiología",        /* nombre corto para los menús */
      descripcion: "Salas situacionales, boletines, vigilancias y dashboard semanal.",
      logo: "epidemiologia.png",
      enlace: "epidemiologia/index.html",
      color: "#0b4e96",
      estado: "activo",
      sobre: {
        titulo: "Vigilancia en salud pública",
        texto: "El Portal Epidemiológico difunde la información de vigilancia de la Oficina de Epidemiología de la Red Integrada de Salud Chachapoyas: salas situacionales, boletines, vigilancias por daño e indicadores semanales.",
        puntos: ["Basado en la notificación de los establecimientos de salud (NotiSP).", "Indicadores del dashboard actualizados cada semana."]
      },
      responsable: {
        titulo: "Responsable de la oficina",
        nombre: "Lic. Enf. Lith Mariela Malqui Zuta",
        cargo: "Oficina de Epidemiología",
        correo: "epiredchachapoyas@gmail.com"
      }
    },
    {
      id: "salud-ambiental",
      titulo: "Portal de Salud Ambiental",
      corto: "Salud Ambiental",        /* nombre corto para los menús */
      descripcion: "Calidad del agua para consumo humano, saneamiento y riesgos ambientales.",
      logo: "salud_ambiental.png",   /* alternativa: "salud_ambiental_banner.png" */
      enlace: "salud-ambiental/index.html",
      color: "#0f6b62",
      estado: "activo",
      sobre: {
        titulo: "Salud ambiental",
        texto: "El Portal de Salud Ambiental difunde la información de vigilancia y control de los riesgos ambientales de la Red Integrada de Salud Chachapoyas: calidad del agua para consumo humano, residuos sólidos de los establecimientos de salud, higiene alimentaria, vectores y zoonosis.",
        puntos: ["Trabajo articulado con DIRESA Amazonas, microrredes, gobiernos locales y comunidad.", "Información para la toma de decisiones y la reducción de riesgos sanitarios ambientales."]
      },
      responsable: {
        titulo: "Responsable del área",
        nombre: "Blgo. John Herbert Zúñiga Díaz",
        cargo: "Salud Ambiental",
        correo: ""
      }
    },
    {
      id: "promsa",
      titulo: "Promoción de la Salud (PROMSA)",
      corto: "PROMSA",        /* nombre corto para los menús */
      descripcion: "Comunicación, educación para la salud y municipios y comunidades saludables.",
      logo: "promsa.png",
      enlace: "promsa/index.html",
      color: "#a17f1a",
      estado: "en construcción"
    }
  ],

  enlaces: [
    { titulo: "CDC MINSA", url: "https://www.dge.gob.pe/" },
    { titulo: "MINSA", url: "https://www.gob.pe/minsa" },
    { titulo: "SENAMHI", url: "https://www.senamhi.gob.pe/" }
  ],

  /* Bloque informativo al pie de la página de inicio */
  sobre: {
    titulo: "Vigilancia en salud pública",
    texto: "SIVISA reúne en un solo lugar la información de vigilancia sanitaria de la Red Integrada de Salud Chachapoyas: epidemiología, salud ambiental y promoción de la salud, para apoyar la toma de decisiones de los equipos de salud y la comunidad.",
    puntos: ["Información elaborada por las oficinas de la Red.", "Actualización periódica de publicaciones e indicadores."]
  },

  /* Sede institucional (deje vacío lo que no quiera mostrar) */
  sede: {
    titulo: "Sede institucional",
    direccion: "Jr. Triunfo 242 - Chachapoyas",
    correo: "",
    telefono: "",
    horario: ""
  },

  /* Autoridades (recuadro sobre el contacto en la página de inicio) */
  autoridades: [
    { cargo: "Directora de la Red de Salud Chachapoyas", nombre: "Lic. Enf. Marly Asunta Zumaeta Villavicencio" },
    { cargo: "Responsable de Salud Pública", nombre: "Psic. Ingrid Carmela Peralta Vega" }
  ],

  contacto: {
    nombre: "M.C. Yhojar A. Pisfil-Farroñay",
    cargo: "",          /* opcional: déjelo vacío para no mostrarlo */
    area: "",           /* opcional */
    correo: "yhojar.minsa@gmail.com",
    foto: ""            /* opcional: nombre de archivo en assets/ (ej. "foto.jpg") */
  }
};
