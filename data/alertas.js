/* =====================================================================
   ALERTAS NACIONALES, REGIONALES Y DE LA RED (primeras diapositivas de la barra)
   - Se editan a mano: copie un bloque { ... }, cambie sus datos y suba el archivo.
   - ambito: "Nacional", "Regional" o "Red"  (cambia la etiqueta y el color).
   - desde / hasta (AAAA-MM-DD): fechas en que se muestra. Pasada la fecha "hasta" se oculta sola.
   - enlace (opcional): PDF de la alerta (súbalo a epidemiologia/documentos/alertas/AÑO/ y escriba
     "epidemiologia/documentos/alertas/2026/nombre.pdf") o la dirección web oficial (https://...).
   - Para OCULTAR una alerta sin borrarla: ponga  activa: false
   - No incluya datos que permitan identificar a un paciente (nombre, edad exacta, dirección, comunidad pequeña).
   ===================================================================== */
window.ALERTAS = [
  {
    activa: true,
    ambito: "Nacional",
    titulo: "Alerta nacional por sarampión",
    texto: "El CDC-MINSA mantiene la alerta epidemiológica por el riesgo de diseminación del sarampión en el país. Verifique que niños y adultos tengan la vacuna SPR y notifique de inmediato todo caso de fiebre con erupción.",
    enlace: "epidemiologia/index.html#alertas",
    portales: ["sivisa", "epidemiologia"],
    desde: "2026-11-05", hasta: "2026-12-31"
  },
  {
    activa: true,
    ambito: "Regional",
    titulo: "Sarampión en Amazonas",
    texto: "Se ha notificado un caso de sarampión en el departamento de Amazonas. Ante todo caso de fiebre con erupción: notificación inmediata, toma de muestra, búsqueda activa y vacunación de contactos.",
    enlace: "epidemiologia/index.html#algoritmos",
    portales: ["sivisa", "epidemiologia"],
    desde: "2026-11-05", hasta: "2026-12-31"
  }
];
