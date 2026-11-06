/* =====================================================================
   PÁGINA "NOSOTROS" – Oficina de Epidemiología
   Cada bloque es una parte de la página. Edite los textos entre comillas.
   Tipos de bloque: "tarjetas", "destacado", "cifras", "lista", "equipo"
   ===================================================================== */
window.PAGINAS = window.PAGINAS || {};
window.PAGINAS.nosotros = [
  {
    tipo: "tarjetas", columnas: 2,
    items: [
      { titulo: "Misión", icono: "mision",
        texto: "Somos la Oficina de Epidemiología de la Red Integrada de Salud Chachapoyas, responsable de conducir, fortalecer y desarrollar la vigilancia epidemiológica, mediante la recopilación, procesamiento, análisis e interpretación de información oportuna, confiable y de calidad, así como la investigación de brotes, la prevención y control de enfermedades y la identificación de riesgos y daños a la salud; proporcionando información estratégica para la toma de decisiones y contribuyendo a la protección de la salud y el bienestar de la población de nuestra jurisdicción." },
      { titulo: "Visión", icono: "vision",
        texto: "Ser una Oficina de Epidemiología líder y referente en la gestión de la información epidemiológica en la región Amazonas, reconocida por su capacidad técnica, eficiencia, oportunidad y calidad en la vigilancia, prevención y control de enfermedades, con un sistema de vigilancia fortalecido, articulado y descentralizado, que permita anticipar y responder eficazmente ante riesgos, emergencias y eventos de importancia en salud pública, contribuyendo a una población más saludable y protegida." }
    ]
  },
  {
    tipo: "tarjetas", titulo: "Valores institucionales", columnas: 3, compacto: true,
    intro: "La Oficina de Epidemiología orienta su trabajo bajo los siguientes valores:",
    items: [
      { titulo: "Responsabilidad", icono: "check", texto: "Cumplimiento oportuno de las funciones y actividades de vigilancia epidemiológica." },
      { titulo: "Compromiso", icono: "corazon", texto: "Vocación de servicio y dedicación a la protección de la salud pública." },
      { titulo: "Integridad", icono: "escudo", texto: "Transparencia, ética y veracidad en el manejo de la información." },
      { titulo: "Trabajo en equipo", icono: "equipo", texto: "Articulación con microrredes, establecimientos de salud y otras instituciones." },
      { titulo: "Oportunidad", icono: "reloj", texto: "Generación y difusión de información epidemiológica para la toma de decisiones." },
      { titulo: "Calidad", icono: "estrella", texto: "Búsqueda permanente de la mejora continua de los procesos de vigilancia." }
    ]
  },
  {
    tipo: "destacado", titulo: "Objetivo institucional", icono: "objetivo",
    texto: "Fortalecer la vigilancia epidemiológica en el ámbito de la Red Integrada de Salud Chachapoyas, garantizando la detección, notificación, investigación, análisis y respuesta oportuna frente a enfermedades, daños y eventos de importancia en salud pública, mediante el acompañamiento técnico, monitoreo y supervisión de los establecimientos de salud y microrredes."
  },
  {
    tipo: "cifras", titulo: "Alcance de la vigilancia epidemiológica – 2026",
    intro: "Cobertura de la Red Integrada de Salud Chachapoyas",
    items: [
      { valor: "212", etiqueta: "Establecimientos y servicios de salud", detalle: "207 EE.SS. + 3 CSM + 2 Hogares Protegidos" },
      { valor: "198", etiqueta: "Unidades notificantes" },
      { valor: "27", etiqueta: "Unidades informantes" }
    ]
  },
  {
    tipo: "tarjetas", titulo: "Ejes estratégicos de trabajo", columnas: 3, compacto: true,
    items: [
      { titulo: "Vigilancia epidemiológica", icono: "lupa", texto: "Notificación, monitoreo y seguimiento de casos." },
      { titulo: "Análisis de situación de salud", icono: "grafico", texto: "Boletines, salas situacionales e indicadores." },
      { titulo: "Investigación epidemiológica", icono: "brote", texto: "Investigación y seguimiento de brotes." },
      { titulo: "Prevención y control", icono: "escudo", texto: "Identificación de riesgos y respuesta sanitaria." },
      { titulo: "Asistencia técnica", icono: "equipo", texto: "Supervisión, capacitación y monitoreo de unidades notificantes." },
      { titulo: "Gestión de información", icono: "documento", texto: "Consolidación, validación y difusión de información epidemiológica." }
    ]
  },
  {
    tipo: "lista", titulo: "Funciones de la Oficina", mostrar: 6,
    intro: "La Oficina de Epidemiología de la Red Integrada de Salud Chachapoyas tiene las siguientes funciones:",
    items: [
      "Conducir y fortalecer el sistema de vigilancia epidemiológica en los establecimientos de salud, Centros de Salud Mental y Hogares Protegidos de la jurisdicción de la Red Integrada de Salud Chachapoyas, garantizando la generación de información oportuna, confiable y de calidad.",
      "Coordinar y supervisar el cumplimiento de la notificación epidemiológica de las 198 Unidades Notificantes y 27 Unidades Informantes, verificando la oportunidad, regularidad, integridad y calidad de la información reportada.",
      "Recopilar, consolidar, procesar y analizar la información epidemiológica procedente de los establecimientos de salud y demás unidades que conforman la Red, identificando tendencias, patrones de comportamiento y factores de riesgo de los eventos sujetos a vigilancia.",
      "Realizar el monitoreo permanente de las enfermedades y eventos sujetos a vigilancia epidemiológica, incluyendo enfermedades transmisibles, no transmisibles, inmunoprevenibles y otros daños de importancia en salud pública.",
      "Detectar, investigar y realizar el seguimiento de brotes, epidemias y otros eventos de importancia en salud pública, coordinando la implementación de medidas de prevención, control y respuesta oportuna.",
      "Elaborar y difundir boletines epidemiológicos, salas situacionales, reportes e informes técnicos, proporcionando información estratégica para la toma de decisiones de las autoridades y responsables de los establecimientos de salud.",
      "Monitorear y evaluar los indicadores epidemiológicos de la jurisdicción de la Red, identificando establecimientos de salud con silencio epidemiológico, retraso en la notificación o incumplimiento de las actividades de vigilancia.",
      "Brindar asistencia técnica y capacitación al personal de salud responsable de epidemiología y notificación de las Microrredes y establecimientos de salud, fortaleciendo sus competencias para el desarrollo adecuado de la vigilancia epidemiológica.",
      "Realizar supervisiones y monitoreos periódicos a las Microrredes y establecimientos de salud, verificando el cumplimiento de las normas, directivas y protocolos vigentes de vigilancia epidemiológica.",
      "Coordinar la búsqueda activa institucional y comunitaria de casos, así como la investigación epidemiológica de los eventos sujetos a vigilancia, a fin de identificar oportunamente casos no notificados y mejorar la sensibilidad del sistema.",
      "Fortalecer la vigilancia epidemiológica de enfermedades metaxénicas y zoonóticas, mediante el seguimiento de casos, identificación de áreas de riesgo y coordinación con las áreas de Salud Ambiental, Control Vectorial y otras instancias competentes.",
      "Vigilar los eventos supuestamente atribuidos a la vacunación o inmunización (ESAVI), mortalidad materna, mortalidad perinatal y neonatal, infecciones asociadas a la atención de salud y otros eventos priorizados, según las disposiciones sanitarias vigentes.",
      "Identificar y evaluar los riesgos epidemiológicos y sanitarios en la jurisdicción de la Red, contribuyendo a la preparación y respuesta frente a emergencias y desastres que puedan afectar la salud de la población.",
      "Coordinar acciones con las diferentes estrategias sanitarias, programas y unidades orgánicas de la Red Integrada de Salud Chachapoyas, promoviendo el intercambio de información y la intervención conjunta frente a los problemas de salud pública.",
      "Garantizar el flujo oportuno de información epidemiológica hacia la Dirección Regional de Salud Amazonas y las instancias correspondientes, de acuerdo con los procedimientos y plazos establecidos.",
      "Promover el uso de la información epidemiológica para la toma de decisiones, orientando las intervenciones sanitarias hacia las localidades, distritos y grupos poblacionales con mayor riesgo."
    ]
  },
  {
    tipo: "equipo", titulo: "Equipo técnico de la Oficina de Epidemiología",
    items: [
      { cargo: "Responsable de la Oficina de Epidemiología", nombre: "Lic. Enf. Lith Mariela Malqui Zuta", destacado: true },
      { cargo: "Equipo técnico de Epidemiología", nombre: "Tec. Lab. Silvio Camilo Pariachi Cadenas" },
      { cargo: "Equipo técnico de Epidemiología", nombre: "Tec. Enf. Milagros Montoya Rojas" },
      { cargo: "Equipo de apoyo", nombre: "M.C. Yhojar A. Pisfil‑Farroñay" }
    ]
  }
];

/* Recordatorios que se muestran en la sección Calendario epidemiológico */
window.CAL_NOTAS = [
    "La notificación semanal de las DIRESA al CDC Perú se realiza los martes antes de las 14:00 horas.",
  "Todo brote o epizootia debe notificarse de manera inmediata a Siepibrote.",
  "22 de septiembre: Día de la Epidemiología Peruana."
];

/* Indicadores de notificación (pestaña propia). Se llenará con data/unidades/indicadores_notificacion.xlsx */
window.PAGINAS["indicadores-notificacion"] = [
  {
    tipo: "destacado", titulo: "En preparación", icono: "grafico",
    texto: "Aquí se publicarán los indicadores de monitoreo de la notificación por microred y establecimiento (unidades notificantes e informantes), por semana epidemiológica de corte, a partir de la plantilla indicadores_notificacion.xlsx."
  },
  {
    tipo: "tarjetas", titulo: "Indicadores que se medirán", columnas: 2, compacto: true,
    intro: "Para cada establecimiento se calcula el porcentaje de cumplimiento de cada indicador y un puntaje total. Nivel óptimo según los estratos nacionales:",
    items: [
      { titulo: "Oportunidad", icono: "reloj", texto: "Óptimo: 100 %." },
      { titulo: "Cobertura", icono: "check", texto: "Óptimo: 100 %." },
      { titulo: "Calidad del dato", icono: "estrella", texto: "Óptimo: 95 a 100 %." },
      { titulo: "Retroalimentación", icono: "equipo", texto: "Óptimo: 90 a 100 %." }
    ]
  },
  {
    tipo: "tarjetas", titulo: "Calificación del puntaje total", columnas: 4, compacto: true,
    intro: "Estratos nacionales del Centro Nacional de Epidemiología, Prevención y Control de Enfermedades (CDC-MINSA).",
    items: [
      { titulo: "Óptimo", icono: "estrella", texto: "90 % o más." },
      { titulo: "Bueno", icono: "check", texto: "80 a 89,9 %." },
      { titulo: "Regular", icono: "reloj", texto: "70 a 79,9 %." },
      { titulo: "Débil", icono: "alerta", texto: "Menos de 70 %." }
    ]
  }
];
