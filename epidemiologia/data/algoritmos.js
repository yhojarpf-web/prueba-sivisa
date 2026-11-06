/* =====================================================================
   ALGORITMOS DE DECISIÓN (uno por enfermedad)
   Cada algoritmo: id, titulo, corto, sistema (id en secciones.csv), cie, norma, url, autor,
   raiz (paso inicial) y nodos: { id: { t: título, s: subtítulo, tipo, hijos: [ids], etiquetas: {hijo: ["SÍ","si"]}, titulo, info: HTML } }
   tipo: inicio | decision | accion | epi | lab | criterio | final | descartado | fuente | alerta
   ===================================================================== */
window.ALGORITMOS = [
 {
  "id": "sarampion",
  "titulo": "Algoritmo operativo para caso sospechoso de Sarampión/Rubéola",
  "corto": "Sarampión / Rubéola",
  "sistema": "inmunoprevenibles",
  "cie": "B05, B06",
  "norma": "Directiva Sanitaria N.° 049-MINSA/DGE-V.01",
  "url": "https://www.dge.gob.pe/portalnuevo/wp-content/uploads/2024/05/directiva-sanitaria-de-sr.pdf",
  "autor": "Yhojar A. Pisfil-Farroñay, MD Ms(c)",
  "resumen": "Caso sospechoso de SR",
  "raiz": "root",
  "nodos": {
   "root": {
    "t": "1. Caso sospechoso SR",
    "s": "Fiebre + erupción máculo-papular generalizada NO vesicular o sospecha clínica.",
    "tipo": "inicio",
    "hijos": [
     "definicion"
    ],
    "titulo": "1. Caso sospechoso de Sarampión/Rubéola",
    "info": "<div class=\"box green\">\n<h3>Definición operativa</h3>\nToda persona de cualquier edad en quien un trabajador de salud sospecha sarampión o rubéola, o todo caso que presente fiebre y erupción máculo-papular generalizada NO vesicular.\n</div>\n<div class=\"box yellow\">\n<h3>Qué hacer al primer contacto</h3>\n<ul>\n<li>Comunicar al responsable de vigilancia epidemiológica.</li>\n<li>Evitar exposición innecesaria a otros pacientes.</li>\n<li>Registrar fecha de inicio de fiebre y fecha de inicio de erupción.</li>\n<li>Verificar antecedente vacunal SR/SPR.</li>\n</ul>\n</div>"
   },
   "definicion": {
    "t": "2. ¿Cumple definición sospechosa?",
    "s": "Fiebre + exantema máculo-papular NO vesicular o sospecha del personal.",
    "tipo": "decision",
    "hijos": [
     "notificar",
     "noCaso"
    ],
    "titulo": "2. Verificación de definición sospechosa",
    "info": "<div class=\"box blue\">\n<h3>Verificar</h3>\n<ul>\n<li>Fiebre.</li>\n<li>Erupción máculo-papular generalizada.</li>\n<li>Erupción NO vesicular.</li>\n<li>Sospecha clínica de sarampión o rubéola.</li>\n</ul>\n</div>\n<div class=\"box red\">\nNo esperar laboratorio para notificar si cumple definición sospechosa.\n</div>",
    "etiquetas": {
     "notificar": [
      "SÍ",
      "si"
     ],
     "noCaso": [
      "NO",
      "no"
     ]
    }
   },
   "noCaso": {
    "t": "NO cumple definición",
    "s": "Evaluar otro diagnóstico diferencial.",
    "tipo": "descartado",
    "hijos": [],
    "titulo": "No cumple definición de caso sospechoso",
    "info": "<div class=\"box red\">\n<h3>Conducta</h3>\n<ul>\n<li>No clasifica como caso sospechoso SR.</li>\n<li>Evaluar otras enfermedades febriles eruptivas.</li>\n<li>Registrar atención y reevaluar si aparecen criterios compatibles.</li>\n</ul>\n</div>"
   },
   "notificar": {
    "t": "3. Notificar inmediatamente",
    "s": "Notificación inmediata al nivel superior.",
    "tipo": "accion",
    "hijos": [
     "investigar"
    ],
    "titulo": "3. Notificación inmediata",
    "info": "<div class=\"box yellow\">\n<h3>Qué hacer</h3>\n<ul>\n<li>Notificar de forma inmediata luego de conocido el caso.</li>\n<li>Comunicar al nivel inmediato superior según flujo RENACE/DIRESA.</li>\n<li>No esperar resultado de laboratorio.</li>\n<li>Iniciar ficha clínico-epidemiológica.</li>\n</ul>\n</div>"
   },
   "investigar": {
    "t": "4. Investigar dentro de 48 h",
    "s": "Ficha, antecedente vacunal, fuente probable y contactos.",
    "tipo": "epi",
    "hijos": [
     "muestras",
     "epiAcciones"
    ],
    "titulo": "4. Investigación epidemiológica dentro de 48 horas",
    "info": "<div class=\"box green\">\n<h3>Qué investigar</h3>\n<ul>\n<li>Fecha de inicio de fiebre.</li>\n<li>Fecha de inicio de erupción.</li>\n<li>Antecedente vacunal verificado con carné o registro.</li>\n<li>Viajes, visitas, eventos masivos o contacto con casos.</li>\n<li>Lugar probable de infección.</li>\n<li>Contactos familiares, escolares, laborales y comunitarios.</li>\n</ul>\n</div>\n<div class=\"box yellow\">\nCoordinar epidemiología, inmunizaciones y laboratorio.\n</div>"
   },
   "muestras": {
    "t": "5. Tomar muestras al primer contacto",
    "s": "Suero IgM + hisopado nasal + hisopado faríngeo.",
    "tipo": "lab",
    "hijos": [
     "diasExantema",
     "repetir",
     "confirmacion"
    ],
    "titulo": "5. Toma de muestras al primer contacto",
    "info": "<div class=\"box green\">\n<h3>Muestras obligatorias</h3>\n<ul>\n<li>Sangre/suero para IgM específica de sarampión o rubéola.</li>\n<li>Hisopado nasal.</li>\n<li>Hisopado faríngeo.</li>\n</ul>\n</div>\n<div class=\"box blue\">\n<h3>Finalidad</h3>\n<ul>\n<li>IgM: evidencia serológica.</li>\n<li>Hisopados: aislamiento viral, identificación molecular y genotipo.</li>\n</ul>\n</div>\n<div class=\"box red\">\nNo perder la oportunidad: tomar muestras al primer contacto con el caso sospechoso.\n</div>"
   },
   "diasExantema": {
    "t": "Según días desde inicio de erupción",
    "s": "Día 0–7: suero + hisopados. Día 8–30: suero IgM.",
    "tipo": "lab",
    "hijos": [],
    "titulo": "Laboratorio según días desde inicio de erupción",
    "info": "<div class=\"box blue\">\n<h3>Día 0 a día 7 desde inicio de erupción</h3>\n<ul>\n<li>Tomar suero para IgM.</li>\n<li>Tomar hisopado nasal y faríngeo.</li>\n<li>Solicitar prueba molecular/aislamiento viral según flujo.</li>\n</ul>\n</div>\n<div class=\"box green\">\n<h3>Día 8 a día 30</h3>\n<ul>\n<li>Priorizar suero para IgM.</li>\n<li>Completar investigación epidemiológica.</li>\n</ul>\n</div>\n<div class=\"box yellow\">\nLa toma no debe retrasarse por esperar un día ideal. La directiva prioriza muestra al primer contacto.\n</div>"
   },
   "repetir": {
    "t": "¿Cuándo repetir muestra?",
    "s": "IgM negativa, indeterminada, valor límite o alta sospecha.",
    "tipo": "lab",
    "hijos": [],
    "titulo": "Repetición de muestra",
    "info": "<div class=\"box yellow\">\n<h3>Repetir muestra si:</h3>\n<ul>\n<li>Primera muestra IgM negativa pero caso altamente sospechoso por clínica o epidemiología.</li>\n<li>Resultado indeterminado o con valor límite.</li>\n<li>Muestra contaminada, insuficiente o inadecuada.</li>\n</ul>\n</div>\n<div class=\"box blue\">\n<h3>Cuándo repetir</h3>\n<ul>\n<li>Si el caso es altamente sospechoso con primera muestra negativa: obtener nueva muestra a los 5 días de iniciada la erupción.</li>\n<li>Si se requiere documentar seroconversión: segunda muestra entre 10 y 21 días desde inicio del exantema.</li>\n</ul>\n</div>\n<div class=\"box green\">\n<h3>Por qué se repite</h3>\nLa IgM puede ser negativa si la muestra fue tomada muy precozmente. Una segunda muestra permite detectar anticuerpos o demostrar seroconversión.\n</div>"
   },
   "epiAcciones": {
    "t": "6. Acciones epidemiológicas",
    "s": "Fuente, contactos, búsqueda activa, MRC y bloqueo.",
    "tipo": "epi",
    "hijos": [
     "fuente",
     "busquedaInst",
     "busquedaCom",
     "contactos",
     "mrc",
     "bloqueo"
    ],
    "titulo": "6. Acciones epidemiológicas inmediatas",
    "info": "<div class=\"box green\">\n<h3>Acciones que no esperan laboratorio</h3>\n<ul>\n<li>Identificar fuente probable de infección.</li>\n<li>Construir cadena de transmisión.</li>\n<li>Buscar casos en servicios de salud y comunidad.</li>\n<li>Identificar y seguir contactos.</li>\n<li>Evaluar coberturas y susceptibles.</li>\n<li>Realizar vacunación de bloqueo cuando corresponda.</li>\n</ul>\n</div>"
   },
   "fuente": {
    "t": "Identificar fuente de infección",
    "s": "Investigar 7 a 30 días antes de la erupción.",
    "tipo": "epi",
    "hijos": [],
    "titulo": "Identificación de fuente probable de infección",
    "info": "<div class=\"box blue\">\n<h3>Periodo a investigar</h3>\n7 a 30 días previos al inicio de la erupción.\n</div>\n<div class=\"box yellow\">\n<h3>Buscar exposición en:</h3>\n<ul>\n<li>Áreas geográficas visitadas.</li>\n<li>Lugares públicos.</li>\n<li>Reuniones familiares o eventos.</li>\n<li>Rutas y medios de transporte.</li>\n<li>Visitas recibidas o realizadas.</li>\n</ul>\n</div>"
   },
   "busquedaInst": {
    "t": "Búsqueda activa institucional",
    "s": "Consulta externa, emergencia y hospitalización.",
    "tipo": "epi",
    "hijos": [],
    "titulo": "Búsqueda activa institucional",
    "info": "<div class=\"box green\">\n<h3>¿En qué consiste?</h3>\nRevisión de registros de atención para identificar casos febriles eruptivos compatibles que no fueron notificados.\n</div>\n<div class=\"box blue\">\n<h3>Dónde buscar</h3>\n<ul>\n<li>Consulta externa.</li>\n<li>Emergencia.</li>\n<li>Hospitalización.</li>\n<li>Base de datos o registros manuales.</li>\n<li>Diagnósticos diferenciales de enfermedad febril eruptiva.</li>\n</ul>\n</div>\n<div class=\"box red\">\nSi cumple definición sospechosa y no fue notificado, iniciar investigación epidemiológica completa.\n</div>"
   },
   "busquedaCom": {
    "t": "Búsqueda activa comunitaria",
    "s": "Radio 5 manzanas urbano; total viviendas rural.",
    "tipo": "epi",
    "hijos": [],
    "titulo": "Búsqueda activa comunitaria",
    "info": "<div class=\"box green\">\n<h3>¿En qué consiste?</h3>\nIndagar la presencia de casos febriles eruptivos en la comunidad durante los últimos 30 días.\n</div>\n<div class=\"box blue\">\n<h3>Ámbito</h3>\n<ul>\n<li>Zonas urbanas o urbano-marginales: radio de 5 manzanas alrededor del domicilio del caso sospechoso.</li>\n<li>Zonas rurales: visita total de las viviendas.</li>\n</ul>\n</div>\n<div class=\"box yellow\">\nLos casos identificados deben ser evaluados. Si cumplen definición sospechosa, registrar, notificar, tomar muestras e investigar.\n</div>"
   },
   "contactos": {
    "t": "Contactos y seguimiento",
    "s": "Censo en 48 h y seguimiento hasta 23 días.",
    "tipo": "epi",
    "hijos": [],
    "titulo": "Identificación y seguimiento de contactos",
    "info": "<div class=\"box blue\">\n<h3>Identificación de contactos</h3>\nConsiderar el periodo desde 7 días antes hasta 4 días después del inicio de erupción del caso.\n</div>\n<div class=\"box yellow\">\n<h3>Seguimiento</h3>\n<ul>\n<li>Realizar censo de contactos dentro de las 48 horas.</li>\n<li>Seguir contactos hasta 23 días desde inicio de erupción del caso índice.</li>\n<li>Registrar aparición de fiebre, erupción u otros síntomas compatibles.</li>\n<li>Verificar estado vacunal.</li>\n</ul>\n</div>"
   },
   "mrc": {
    "t": "Monitoreo rápido de coberturas",
    "s": "Menores de 5 años; estándar ≥95%.",
    "tipo": "epi",
    "hijos": [],
    "titulo": "Monitoreo rápido de coberturas",
    "info": "<div class=\"box green\">\n<h3>Objetivo</h3>\nEstimar si los niños menores de 5 años del ámbito están vacunados con SR/SPR.\n</div>\n<div class=\"box blue\">\n<h3>Qué hacer</h3>\n<ul>\n<li>Visitar viviendas del ámbito definido.</li>\n<li>Solicitar carné de vacunación.</li>\n<li>Verificar dosis SR/SPR.</li>\n<li>Registrar niños vacunados y no vacunados.</li>\n<li>Calcular cobertura: vacunados / encuestados.</li>\n</ul>\n</div>\n<div class=\"box yellow\">\nEl estándar de cobertura por MRC debe ser igual o mayor a 95%.\n</div>"
   },
   "bloqueo": {
    "t": "Vacunación de bloqueo",
    "s": "Administrar dosis SR/SPR faltante.",
    "tipo": "epi",
    "hijos": [],
    "titulo": "Actividades de bloqueo",
    "info": "<div class=\"box yellow\">\n<h3>Qué hacer</h3>\n<ul>\n<li>Aplicar dosis SR/SPR faltante según antecedente vacunal.</li>\n<li>No vacunar si existe contraindicación, como inmunodeficiencia.</li>\n<li>Registrar resultados de vacunación de bloqueo en la ficha clínico-epidemiológica.</li>\n</ul>\n</div>\n<div class=\"box blue\">\nEsta actividad se realiza en el mismo ámbito de búsqueda activa comunitaria y MRC.\n</div>"
   },
   "confirmacion": {
    "t": "7. ¿Se confirma SR?",
    "s": "Laboratorio, aislamiento viral, nexo o clínica por falla de investigación.",
    "tipo": "decision",
    "hijos": [
     "confLab",
     "confNexo",
     "confClinica",
     "descartado",
     "clasificarFinal"
    ],
    "titulo": "7. Confirmación del caso",
    "info": "<div class=\"box green\">\n<h3>Se confirma por:</h3>\n<ul>\n<li>Criterio clínico, epidemiológico y laboratorial.</li>\n<li>Aislamiento viral en hisopado nasal/faríngeo.</li>\n<li>Nexo epidemiológico con caso confirmado.</li>\n<li>Clínica, si no fue investigado adecuadamente por muerte, no localización o pérdida de seguimiento.</li>\n</ul>\n</div>\n<div class=\"box red\">\nLa confirmación por clínica representa falla del sistema de vigilancia.\n</div>"
   },
   "confLab": {
    "t": "Confirmado por laboratorio",
    "s": "Triple criterio o aislamiento viral.",
    "tipo": "final",
    "hijos": [],
    "titulo": "Confirmación por laboratorio",
    "info": "<div class=\"box green\">\n<h3>Puede confirmarse por:</h3>\n<ul>\n<li>Criterio clínico + epidemiológico + laboratorial.</li>\n<li>IgM positiva según laboratorio de referencia.</li>\n<li>Aislamiento viral o identificación molecular del virus sarampión/rubéola.</li>\n</ul>\n</div>"
   },
   "confNexo": {
    "t": "Confirmado por nexo",
    "s": "Relación demostrada con caso confirmado.",
    "tipo": "final",
    "hijos": [],
    "titulo": "Confirmación por nexo epidemiológico",
    "info": "<div class=\"box yellow\">\n<h3>Nexo epidemiológico</h3>\nRelación demostrada de una persona con un caso confirmado por laboratorio mediante investigación epidemiológica.\n</div>\n<div class=\"box blue\">\n<h3>Requiere</h3>\n<ul>\n<li>Identificar caso confirmado fuente.</li>\n<li>Sustentar exposición compatible.</li>\n<li>Registrar cadena de transmisión.</li>\n<li>Documentar contactos y seguimiento.</li>\n</ul>\n</div>"
   },
   "confClinica": {
    "t": "Confirmado por clínica",
    "s": "Falleció, no localizado o perdido.",
    "tipo": "alerta",
    "hijos": [],
    "titulo": "Confirmación por clínica",
    "info": "<div class=\"box red\">\n<h3>Aplica si:</h3>\n<ul>\n<li>El paciente murió antes de concluir la investigación.</li>\n<li>No pudo ser localizado.</li>\n<li>Se perdió durante el seguimiento.</li>\n</ul>\n</div>\n<div class=\"box yellow\">\nEsta situación no debe presentarse; se considera falla del sistema de vigilancia.\n</div>"
   },
   "descartado": {
    "t": "Caso descartado",
    "s": "Investigación completa sin criterios de confirmación.",
    "tipo": "descartado",
    "hijos": [],
    "titulo": "Caso descartado",
    "info": "<div class=\"box red\">\n<h3>Se descarta si:</h3>\n<ul>\n<li>Investigación completa.</li>\n<li>No cumple criterios clínico, epidemiológico y laboratorial.</li>\n<li>Aislamiento viral negativo.</li>\n<li>Sin nexo epidemiológico.</li>\n</ul>\n</div>"
   },
   "clasificarFinal": {
    "t": "8. Clasificación final del caso confirmado",
    "s": "Importado · Relacionado con importación · Asociado a vacuna · Fuente desconocida.",
    "tipo": "fuente",
    "hijos": [
     "importado",
     "relImport",
     "vacuna",
     "desconocida",
     "accionesFinales"
    ],
    "titulo": "8. Clasificación final",
    "info": "<div class=\"box blue\">\nDespués de confirmar el caso, clasificar según fuente o lugar probable de infección.\n</div>\n<div class=\"box yellow\">\nEsta clasificación orienta las acciones de control, búsqueda activa, seguimiento de contactos y cierre epidemiológico.\n</div>"
   },
   "importado": {
    "t": "Caso importado",
    "s": "Exposición fuera del país o continente americano.",
    "tipo": "fuente",
    "hijos": [],
    "titulo": "Caso importado",
    "info": "<div class=\"box yellow\">\nInfección confirmada con exposición fuera del país o continente americano.\n<ul>\n<li>Sarampión: 7 a 21 días antes del exantema.</li>\n<li>Rubéola: 12 a 23 días antes del exantema.</li>\n</ul>\n</div>"
   },
   "relImport": {
    "t": "Relacionado con importación",
    "s": "Cadena iniciada por caso importado.",
    "tipo": "fuente",
    "hijos": [],
    "titulo": "Relacionado con importación",
    "info": "<div class=\"box yellow\">\nCaso confirmado con exposición local al virus, formando parte de la cadena de transmisión iniciada por un caso importado.\n</div>"
   },
   "vacuna": {
    "t": "Asociado a vacuna",
    "s": "Cumple criterios posteriores a SR/SPR.",
    "tipo": "fuente",
    "hijos": [],
    "titulo": "Caso asociado a vacuna",
    "info": "<div class=\"box yellow\">\n<h3>Criterios</h3>\n<ul>\n<li>Exantema 7 a 14 días después de vacunación SR/SPR.</li>\n<li>Sin tos u otros síntomas respiratorios acompañantes.</li>\n<li>Sin caso primario ni secundarios tras investigación.</li>\n<li>IgM entre 8 y 56 días después de vacunación.</li>\n<li>Aislamiento viral confirma virus vacunal no salvaje.</li>\n</ul>\n</div>"
   },
   "desconocida": {
    "t": "Fuente desconocida",
    "s": "No se identifica fuente probable.",
    "tipo": "fuente",
    "hijos": [],
    "titulo": "Fuente de infección desconocida",
    "info": "<div class=\"box yellow\">\nCaso confirmado en el que no se pudo determinar la fuente probable de infección, no se relaciona con importación ni con vacunación.\n</div>"
   },
   "accionesFinales": {
    "t": "Acciones posteriores",
    "s": "Cierre epidemiológico e informe final.",
    "tipo": "accion",
    "hijos": [],
    "titulo": "Acciones posteriores al cierre",
    "info": "<div class=\"box green\">\n<h3>Completar</h3>\n<ul>\n<li>Investigación epidemiológica completa.</li>\n<li>Búsqueda activa institucional y comunitaria.</li>\n<li>Seguimiento de contactos.</li>\n<li>MRC y bloqueo vacunal según corresponda.</li>\n<li>Clasificación final y cierre del caso.</li>\n<li>Informe final al nivel correspondiente.</li>\n</ul>\n</div>"
   }
  }
 },
 {
  "id": "dengue",
  "titulo": "Algoritmo operativo para sospecha de dengue",
  "corto": "Dengue",
  "sistema": "metaxenicas",
  "cie": "A97.0, A97.1, A97.2",
  "norma": "NTS N.° 230-MINSA/CDC-2025",
  "url": "https://cdn.www.gob.pe/uploads/document/file/8371925/6965655-nts-n-230-minsa-cdc-2025.pdf?v=1752681309",
  "autor": "Yhojar A. Pisfil-Farroñay, MD Ms(c)",
  "resumen": "Sospecha de dengue",
  "raiz": "root",
  "nodos": {
   "root": {
    "t": "1. Sospecha de dengue",
    "s": "Paciente febril o cuadro compatible en contexto epidemiológico.",
    "tipo": "inicio",
    "hijos": [
     "probable"
    ],
    "titulo": "1. Sospecha de dengue",
    "info": "<div class=\"box green\">\n<h3>Punto de inicio</h3>\nIniciar ante todo paciente con fiebre o cuadro compatible, sobre todo si reside o visitó área con transmisión de dengue o infestación por Aedes aegypti.\n</div>\n<div class=\"box yellow\">\n<h3>Qué preguntar</h3>\n<ul>\n<li>Día exacto de inicio de síntomas.</li>\n<li>Residencia o viaje en los 14 días previos.</li>\n<li>Contacto con otros febriles en familia, barrio, trabajo o escuela.</li>\n<li>Procedencia de zona con vector o transmisión activa.</li>\n</ul>\n</div>"
   },
   "probable": {
    "t": "2. ¿Cumple caso probable?",
    "s": "Fiebre hasta 7 días + antecedente epidemiológico + clínica compatible.",
    "tipo": "decision",
    "hijos": [
     "clasificar",
     "noProbable"
    ],
    "titulo": "2. Caso probable de dengue",
    "info": "<div class=\"box blue\">\n<h3>Definición operacional</h3>\nToda persona con fiebre de hasta 7 días de evolución, que reside o visitó áreas de transmisión de dengue o con infestación de Aedes aegypti dentro de los 14 días previos al inicio de síntomas, y presenta al menos 2 manifestaciones compatibles.\n</div>\n<div class=\"box green\">\n<h3>Manifestaciones compatibles</h3>\n<ul>\n<li>Cefalea.</li>\n<li>Mialgias.</li>\n<li>Artralgia.</li>\n<li>Dolor ocular o retroocular.</li>\n<li>Náuseas o vómitos.</li>\n<li>Rash/exantema.</li>\n</ul>\n</div>\n<div class=\"box yellow\">\n<h3>Niños</h3>\nEn niños, considerar caso probable si presenta fiebre sin foco aparente de hasta 7 días y antecedente epidemiológico compatible.\n</div>\n<div class=\"box red\">\nSi cumple definición probable, manejar clínicamente como dengue. No esperar laboratorio para iniciar manejo, registro y notificación.\n</div>",
    "etiquetas": {
     "clasificar": [
      "SÍ",
      "si"
     ],
     "noProbable": [
      "NO",
      "no"
     ]
    }
   },
   "noProbable": {
    "t": "NO cumple caso probable",
    "s": "Evaluar otro diagnóstico diferencial.",
    "tipo": "descartado",
    "hijos": [],
    "titulo": "No cumple caso probable",
    "info": "<div class=\"box red\">\n<h3>Conducta</h3>\n<ul>\n<li>No clasifica como caso probable de dengue.</li>\n<li>Evaluar otros diagnósticos según clínica y perfil epidemiológico.</li>\n<li>Reevaluar si aparecen nuevos signos o se confirma antecedente epidemiológico.</li>\n</ul>\n</div>"
   },
   "clasificar": {
    "t": "3. Clasificar severidad",
    "s": "Sin alarma · Con alarma · Dengue grave.",
    "tipo": "accion",
    "hijos": [
     "sinAlarma",
     "conAlarma",
     "grave",
     "notificacion"
    ],
    "titulo": "3. Clasificación clínica inicial",
    "info": "<div class=\"box yellow\">\n<h3>Objetivo</h3>\nDeterminar si el caso probable corresponde a dengue sin signos de alarma, dengue con signos de alarma o dengue grave.\n</div>\n<div class=\"box red\">\nLos signos de alarma o gravedad cambian la urgencia de manejo y referencia. El algoritmo epidemiológico no reemplaza el manejo clínico.\n</div>"
   },
   "sinAlarma": {
    "t": "Dengue sin signos de alarma",
    "s": "Probable dengue sin alarma ni gravedad.",
    "tipo": "criterio",
    "hijos": [],
    "titulo": "Dengue sin signos de alarma",
    "info": "<div class=\"box green\">Caso probable de dengue que no presenta signos de alarma ni criterios de dengue grave.</div>\n<div class=\"box yellow\">\n<h3>Qué hacer</h3>\n<ul>\n<li>Registrar y notificar según flujo.</li>\n<li>Tomar muestra según día de enfermedad.</li>\n<li>Dar indicaciones de alarma y seguimiento clínico.</li>\n<li>Activar investigación epidemiológica si corresponde.</li>\n</ul>\n</div>"
   },
   "conAlarma": {
    "t": "Dengue con signos de alarma",
    "s": "Probable dengue + uno o más signos de alarma.",
    "tipo": "alerta",
    "hijos": [],
    "titulo": "Dengue con signos de alarma",
    "info": "<div class=\"box red\">\n<h3>Signos de alarma</h3>\n<ul>\n<li>Dolor abdominal intenso y continuo o dolor a la palpación.</li>\n<li>Vómitos persistentes.</li>\n<li>Sangrado de mucosas y/o piel.</li>\n<li>Letargia, inquietud o irritabilidad.</li>\n<li>Derrame seroso clínico o por imágenes.</li>\n<li>Lipotimia.</li>\n<li>Hepatomegalia mayor de 2 cm.</li>\n<li>Aumento progresivo del hematocrito.</li>\n</ul>\n</div>\n<div class=\"box yellow\">Registrar, notificar, tomar muestra de suero y asegurar manejo clínico oportuno.</div>"
   },
   "grave": {
    "t": "Dengue grave",
    "s": "Choque, dificultad respiratoria, sangrado grave o daño severo de órganos.",
    "tipo": "descartado",
    "hijos": [],
    "titulo": "Dengue grave",
    "info": "<div class=\"box red\">\n<h3>Criterios de gravedad</h3>\n<ul>\n<li>Signos de choque hipovolémico.</li>\n<li>Dificultad respiratoria por extravasación importante de plasma.</li>\n<li>Sangrado grave según criterio clínico.</li>\n<li>Compromiso grave de órganos: miocarditis, encefalitis, trastorno de conciencia, convulsiones o hepatitis con TGO/TGP ≥ 1000 UI.</li>\n</ul>\n</div>\n<div class=\"box yellow\">Hipotensión: signo tardío de choque. Requiere manejo clínico inmediato.</div>"
   },
   "notificacion": {
    "t": "4. Registrar y notificar",
    "s": "Ficha clínico-epidemiológica + NOTI.",
    "tipo": "accion",
    "hijos": [
     "epiAcciones"
    ],
    "titulo": "4. Registro y notificación",
    "info": "<div class=\"box yellow\">\n<h3>Qué hacer</h3>\n<ul>\n<li>Llenar ficha clínico-epidemiológica.</li>\n<li>Registrar y notificar en el aplicativo NOTI.</li>\n<li>Actualizar clasificación conforme se obtengan resultados.</li>\n<li>No esperar laboratorio para notificar si cumple definición probable.</li>\n</ul>\n</div>"
   },
   "epiAcciones": {
    "t": "5. Acciones epidemiológicas",
    "s": "Investigación, búsqueda activa, febriles y control vectorial.",
    "tipo": "epi",
    "hijos": [
     "busquedaInst",
     "busquedaCom",
     "febriles",
     "tiempo"
    ],
    "titulo": "5. Acciones epidemiológicas inmediatas",
    "info": "<div class=\"box green\">\n<h3>Investigación epidemiológica</h3>\nBusca obtener evidencias epidemiológicas, clínicas, laboratoriales, vectoriales, sociales y ambientales para confirmar o descartar el caso y establecer si es importado o autóctono.\n</div>\n<div class=\"box blue\">\n<h3>Qué debe precisar</h3>\n<ul>\n<li>Lugar probable de infección.</li>\n<li>Residencia o viaje en los últimos 14 días.</li>\n<li>Presencia de otros febriles cercanos.</li>\n<li>Presencia del vector o zona con transmisión.</li>\n<li>Conglomerados familiares, vecinales, laborales o escolares.</li>\n</ul>\n</div>"
   },
   "busquedaInst": {
    "t": "Búsqueda activa institucional",
    "s": "Revisar registros intramurales y febriles.",
    "tipo": "epi",
    "hijos": [],
    "titulo": "Búsqueda activa institucional",
    "info": "<div class=\"box green\"><h3>¿En qué consiste?</h3>Es la búsqueda intencional de casos en registros del establecimiento de salud.</div>\n<div class=\"box blue\">\n<h3>Dónde buscar</h3>\n<ul>\n<li>Consulta externa.</li>\n<li>Emergencia.</li>\n<li>Hospitalización.</li>\n<li>Registros HIS u otros registros de atención.</li>\n<li>Registro de febriles.</li>\n</ul>\n</div>\n<div class=\"box yellow\">\n<h3>Qué identificar</h3>\n<ul>\n<li>Febriles sin diagnóstico claro.</li>\n<li>Casos compatibles con dengue.</li>\n<li>Casos no notificados.</li>\n<li>Conglomerados por localidad o fecha.</li>\n</ul>\n</div>"
   },
   "busquedaCom": {
    "t": "Búsqueda activa comunitaria",
    "s": "Buscar febriles en comunidad y zonas de riesgo.",
    "tipo": "epi",
    "hijos": [],
    "titulo": "Búsqueda activa comunitaria",
    "info": "<div class=\"box green\"><h3>¿En qué consiste?</h3>Es la búsqueda intencional de personas con fiebre o síntomas compatibles en la comunidad.</div>\n<div class=\"box blue\">\n<h3>Priorizar</h3>\n<ul>\n<li>Domicilio del caso.</li>\n<li>Lugar probable de infección.</li>\n<li>Vecinos o viviendas cercanas.</li>\n<li>Centro laboral o educativo si corresponde.</li>\n<li>Zonas con presencia del vector o transmisión.</li>\n</ul>\n</div>\n<div class=\"box yellow\">\n<h3>Buscar personas con</h3>\n<ul>\n<li>Fiebre.</li>\n<li>Fiebre con cefalea.</li>\n<li>Fiebre con mialgias o artralgias.</li>\n<li>Fiebre con exantema.</li>\n<li>Síndrome febril sin diagnóstico definido.</li>\n</ul>\n</div>\n<div class=\"box red\">El radio de 200 metros corresponde a confirmación por nexo epidemiológico en brote o epidemia, no a la búsqueda activa general.</div>"
   },
   "febriles": {
    "t": "Vigilancia de febriles",
    "s": "Analizar incremento semanal y conglomerados.",
    "tipo": "epi",
    "hijos": [],
    "titulo": "Vigilancia de febriles",
    "info": "<div class=\"box blue\"><h3>Objetivo</h3>Identificar y analizar incremento de pacientes con fiebre reportados por semana epidemiológica.</div>\n<div class=\"box yellow\">\n<h3>Uso operativo</h3>\n<ul>\n<li>Detectar incremento inusual de febriles.</li>\n<li>Identificar conglomerados en tiempo y espacio.</li>\n<li>Orientar búsqueda intencional.</li>\n<li>Definir toma de muestra e investigación epidemiológica.</li>\n<li>Coordinar intervención vectorial.</li>\n</ul>\n</div>"
   },
   "tiempo": {
    "t": "6. Día de enfermedad",
    "s": "Día 1–5: NS1/RT-PCR · Desde día 6: IgM.",
    "tipo": "decision",
    "hijos": [
     "dia15",
     "dia6mas",
     "muestraSuero",
     "fallecido",
     "confirmacion"
    ],
    "titulo": "6. Seleccionar prueba según día de enfermedad",
    "info": "<div class=\"box blue\"><h3>Cómo contar</h3>Día de enfermedad = tiempo desde la primera manifestación clínica relacionada a dengue hasta la toma de muestra.</div>\n<div class=\"box green\">\n<h3>Según normativa</h3>\n<ul>\n<li>Día 1, 2, 3, 4 o 5: fase aguda. Solicitar NS1 y/o RT-PCR según disponibilidad.</li>\n<li>Desde el día 6: solicitar ELISA IgM para dengue.</li>\n<li>En zona sin transmisión: puede requerirse seroconversión en muestras pareadas.</li>\n</ul>\n</div>"
   },
   "dia15": {
    "t": "Día 1 a día 5",
    "s": "Solicitar NS1 y/o RT-PCR en suero.",
    "tipo": "lab",
    "hijos": [],
    "titulo": "Día 1 a día 5 de enfermedad",
    "info": "<div class=\"box green\">\n<h3>Solicitar</h3>\n<ul>\n<li>ELISA antígeno NS1 para dengue.</li>\n<li>RT-PCR en tiempo real según disponibilidad y flujo.</li>\n<li>Aislamiento viral si corresponde.</li>\n</ul>\n</div>\n<div class=\"box blue\"><h3>Muestra</h3>Suero. Enviar conservado entre 2 y 8 °C.</div>"
   },
   "dia6mas": {
    "t": "Desde el día 6",
    "s": "Solicitar ELISA IgM para dengue.",
    "tipo": "lab",
    "hijos": [],
    "titulo": "Desde el día 6 de enfermedad",
    "info": "<div class=\"box green\"><h3>Solicitar</h3>ELISA IgM para dengue.</div>\n<div class=\"box blue\"><h3>Muestra</h3>Suero. Enviar conservado entre 2 y 8 °C.</div>\n<div class=\"box yellow\">En zona sin transmisión, si se requiere seroconversión, tomar segunda muestra a los 14 días desde inicio de síntomas y no exceder los 30 días.</div>"
   },
   "muestraSuero": {
    "t": "Obtención de suero",
    "s": "7 mL sangre sin anticoagulante; 2 mL en menores de 2 años.",
    "tipo": "lab",
    "hijos": [],
    "titulo": "Obtención y envío de suero",
    "info": "<div class=\"box blue\">\n<h3>Obtención</h3>\n<ul>\n<li>Tomar 7 mL de sangre en tubo al vacío sin anticoagulante.</li>\n<li>En infantes menores de 2 años: 2 mL de sangre.</li>\n<li>Centrifugar a 3500 RPM por 5 minutos.</li>\n<li>Separar suero en crioviales estériles de tapa rosca de 2 mL.</li>\n</ul>\n</div>\n<div class=\"box yellow\">\n<h3>Envío</h3>\n<ul>\n<li>Rotular con nombres, edad y fecha de obtención.</li>\n<li>Enviar dentro de las 48 horas.</li>\n<li>Conservar entre 2 y 8 °C.</li>\n<li>Adjuntar ficha clínico-epidemiológica legible.</li>\n</ul>\n</div>"
   },
   "fallecido": {
    "t": "Fallecido o tejido disponible",
    "s": "Tejido para RT-PCR, aislamiento, histopatología e IHQ.",
    "tipo": "lab",
    "hijos": [],
    "titulo": "Caso fallecido o muestra de tejido",
    "info": "<div class=\"box red\">\n<h3>Solicitar / enviar</h3>\n<ul>\n<li>Tejido: hígado, cerebro, riñón o bazo dentro de las 24 horas del deceso.</li>\n<li>RT-PCR o aislamiento viral según flujo.</li>\n<li>Histopatología e inmunohistoquímica.</li>\n</ul>\n</div>\n<div class=\"box blue\">Para histopatología e inmunohistoquímica: enviar en formol neutro al 10%.</div>"
   },
   "confirmacion": {
    "t": "7. ¿Se confirma dengue?",
    "s": "Laboratorio, seroconversión o nexo epidemiológico.",
    "tipo": "decision",
    "hijos": [
     "confirmadoLab",
     "nexo",
     "descartado",
     "clasifEpi"
    ],
    "titulo": "7. Confirmación de dengue",
    "info": "<div class=\"box green\">\n<h3>Confirma laboratorio positivo</h3>\n<ul>\n<li>RT-PCR en tiempo real.</li>\n<li>ELISA antígeno NS1.</li>\n<li>ELISA IgM en zona endémica o contexto de brote/epidemia.</li>\n<li>Seroconversión de IgM en muestras pareadas en zona sin transmisión.</li>\n<li>Aislamiento viral.</li>\n<li>Histopatología e inmunohistoquímica de tejido.</li>\n</ul>\n</div>\n<div class=\"box red\">Pruebas inmunocromatográficas en situación no epidémica no confirman ni descartan el caso probable. Si se usan por difícil acceso, deben corroborarse.</div>"
   },
   "confirmadoLab": {
    "t": "Confirmado por laboratorio",
    "s": "Resultado positivo en prueba confirmatoria.",
    "tipo": "final",
    "hijos": [],
    "titulo": "Caso confirmado por laboratorio",
    "info": "<div class=\"box green\">Caso probable de dengue con resultado positivo a una prueba confirmatoria.</div>\n<div class=\"box blue\">Registrar resultado, actualizar clasificación en NOTI, completar investigación epidemiológica y coordinar intervención según escenario.</div>"
   },
   "nexo": {
    "t": "Confirmación por nexo epidemiológico",
    "s": "Solo en brote/epidemia con circulación comprobada.",
    "tipo": "final",
    "hijos": [],
    "titulo": "Confirmación por nexo epidemiológico",
    "info": "<div class=\"box yellow\">\n<h3>Solo aplica si:</h3>\n<ul>\n<li>Existe brote o epidemia.</li>\n<li>Se comprobó circulación del virus dengue.</li>\n<li>No hay circulación simultánea de otros arbovirus en la misma temporalidad y espacio.</li>\n<li>El caso cumple definición probable de dengue.</li>\n<li>Existe caso confirmado por laboratorio dentro de 200 metros a la redonda del lugar probable de infección o residencia.</li>\n<li>El caso confirmado tuvo inicio de síntomas dentro de las 2 semanas previas al inicio de síntomas del caso probable.</li>\n</ul>\n</div>\n<div class=\"box red\">No usar nexo epidemiológico para dengue con signos de alarma ni dengue grave. Estos deben contar con ficha de investigación y muestra de suero.</div>"
   },
   "descartado": {
    "t": "No confirma / descartado",
    "s": "Reevaluar y hacer diagnóstico diferencial.",
    "tipo": "descartado",
    "hijos": [],
    "titulo": "Caso no confirmado o descartado",
    "info": "<div class=\"box red\">\n<h3>Conducta</h3>\n<ul>\n<li>Verificar si la muestra corresponde al día de enfermedad.</li>\n<li>Revisar calidad y oportunidad de muestra.</li>\n<li>Realizar diagnóstico diferencial según clínica y perfil epidemiológico.</li>\n<li>Considerar leptospirosis, chikungunya, Zika, Oropouche, Mayaro u otras patologías.</li>\n</ul>\n</div>"
   },
   "clasifEpi": {
    "t": "8. Clasificar epidemiológicamente",
    "s": "Autóctono · Importado · Circulación viral.",
    "tipo": "fuente",
    "hijos": [
     "autoctono",
     "importado",
     "circulacion"
    ],
    "titulo": "8. Clasificación epidemiológica",
    "info": "<div class=\"box blue\">\nDespués de confirmar, clasificar según lugar probable de infección y relación epidemiológica.\n</div>\n<div class=\"box yellow\">\nLa clasificación epidemiológica orienta la búsqueda, investigación de foco y control vectorial.\n</div>"
   },
   "autoctono": {
    "t": "Caso autóctono",
    "s": "Lugar probable de infección en la misma jurisdicción.",
    "tipo": "fuente",
    "hijos": [],
    "titulo": "Caso autóctono",
    "info": "<div class=\"box yellow\">Persona cuyo lugar probable de infección corresponde a la misma jurisdicción donde se notifica y donde existe transmisión y presencia del vector.</div>"
   },
   "importado": {
    "t": "Caso importado",
    "s": "Lugar probable diferente a la jurisdicción notificante.",
    "tipo": "fuente",
    "hijos": [],
    "titulo": "Caso importado",
    "info": "<div class=\"box yellow\">Persona cuyo lugar probable de infección es diferente a la jurisdicción que notifica.</div>"
   },
   "circulacion": {
    "t": "Circulación viral",
    "s": "Dos o más autóctonos confirmados agrupados en tiempo y espacio.",
    "tipo": "fuente",
    "hijos": [],
    "titulo": "Circulación de enfermedad viral",
    "info": "<div class=\"box yellow\">Conglomerado de dos o más casos autóctonos confirmados por laboratorio, agrupados en tiempo y espacio.</div>\n<div class=\"box blue\">Orienta intensificación de búsqueda, investigación y control vectorial.</div>"
   }
  }
 }
];
