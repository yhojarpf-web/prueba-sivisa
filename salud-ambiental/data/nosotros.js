/* =====================================================================
   PÁGINA "NOSOTROS" – Salud Ambiental, RIS Chachapoyas
   Cada bloque es una parte de la página. Edite los textos entre comillas.
   Tipos de bloque: "tarjetas", "destacado", "cifras", "lista", "equipo"
   ===================================================================== */
window.PAGINAS = window.PAGINAS || {};
window.PAGINAS.nosotros = [
  {
    tipo: "tarjetas", columnas: 2,
    items: [
      { titulo: "Misión", icono: "mision",
        texto: "Proteger y promover la salud de la población del ámbito de la RIS Chachapoyas. Para ello vigila y controla los riesgos ambientales: calidad del agua para consumo humano, residuos sólidos generados en los establecimientos de salud, higiene alimentaria, vectores y zoonosis. Lo hace de forma articulada con DIRESA Amazonas, las microrredes, los gobiernos locales y la comunidad, y cumpliendo la normativa sanitaria vigente." },
      { titulo: "Visión", icono: "vision",
        texto: "Al 2030, ser una Red Integrada de Salud que garantice entornos y familias saludables en su ámbito. Para ello cuenta con vigilancia sanitaria oportuna, información confiable y personal competente, y es reconocida por la reducción de riesgos sanitarios ambientales." }
    ]
  },
  {
    tipo: "tarjetas", titulo: "Líneas de trabajo", columnas: 3, compacto: true,
    items: [
      { titulo: "Agua para consumo humano", icono: "gota", texto: "Vigilancia y control de la calidad sanitaria del agua en los sistemas de abastecimiento." },
      { titulo: "Residuos sólidos de EE.SS.", icono: "residuos", texto: "Gestión y vigilancia de residuos sólidos y biocontaminados en los establecimientos de salud." },
      { titulo: "Higiene alimentaria", icono: "alimento", texto: "Control sanitario de establecimientos que producen o expenden alimentos y bebidas." },
      { titulo: "Vectores y zoonosis", icono: "vector", texto: "Vigilancia entomológica, control vectorial y vigilancia de zoonosis." },
      { titulo: "Saneamiento básico", icono: "casa", texto: "Vigilancia del saneamiento básico en el ámbito de la Red." },
      { titulo: "Entornos saludables", icono: "equipo", texto: "Trabajo con municipalidades, JASS, instituciones educativas y comunidad." }
    ]
  },
  {
    tipo: "lista", titulo: "Funciones", mostrar: 6,
    intro: "Salud Ambiental de la Red Integrada de Salud Chachapoyas tiene las siguientes funciones:",
    items: [
      "Implementar en la RIS las normas, guías y procedimientos de salud ambiental emitidos por DIRESA y MINSA.",
      "Formular, ejecutar y evaluar el plan operativo de salud ambiental de la RIS, alineado a los indicadores regionales.",
      "Conducir la vigilancia de riesgos ambientales en el ámbito de la RIS, incluidos el saneamiento básico y los residuos sólidos y biocontaminados.",
      "Vigilar y controlar la calidad sanitaria del agua en sistemas de abastecimiento y reportar los resultados.",
      "Vigilar y controlar vectores y zoonosis, incluida la vigilancia entomológica.",
      "Ejecutar el control sanitario de establecimientos que producen o expenden alimentos y bebidas, según la competencia delegada.",
      "Realizar inspecciones sanitarias y emitir informes técnicos a DIRESA, según corresponda.",
      "Dar asistencia técnica, supervisar y monitorear a las microrredes y establecimientos en salud ambiental, incluida la gestión de residuos de los EE.SS.",
      "Promover entornos saludables con municipalidades, JASS, instituciones educativas y comunidad.",
      "Consolidar y reportar indicadores y la información de salud ambiental a DIRESA.",
      "Fortalecer capacidades del personal y de actores locales.",
      "Coordinar con DIRESA y otros sectores ante riesgos o emergencias ambientales.",
      "Las demás que asigne la Dirección de la RIS o DIRESA."
    ]
  },
  {
    tipo: "equipo", titulo: "Equipo técnico de Salud Ambiental",
    items: [
      { cargo: "Responsable del área de Salud Ambiental", nombre: "Blgo. John Herbert Zúñiga Díaz", destacado: true },
      { cargo: "Equipo técnico de Salud Ambiental", nombre: "Blga. Sharon Diaz Velasquez" },
      { cargo: "Equipo técnico de Salud Ambiental", nombre: "Ing. Amb. Eraclides Jalca Cabañas" },
      { cargo: "Equipo técnico de Salud Ambiental", nombre: "Tec. Enf. Darwin Alvarez Orosco" },
      { cargo: "Equipo técnico de Salud Ambiental", nombre: "Tec. Enf. María O. Sandoval Monteza" },
      { cargo: "Equipo técnico de Salud Ambiental", nombre: "Tec. Enf. Jhilma Cruz Llaja" }
    ]
  }
];
