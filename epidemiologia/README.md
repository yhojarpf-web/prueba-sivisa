# Portal Epidemiológico — RIS Chachapoyas

## Secciones del menú (`data/secciones.csv`)
Cada fila es una sección. Ábralo en Excel y guárdelo como **CSV UTF-8**.

| Columna | Qué poner |
|---|---|
| `orden` | Posición en el menú (1, 2, 3…) |
| `id` | Nombre corto sin tildes ni espacios (ej. `alertas`) |
| `titulo` | Lo que se ve en el menú |
| `tipo` | `documentos` (lista de PDF), `dashboard`, `inicio`, `pagina` (contenido como Nosotros) o `enlace` (abre otra página) |
| `icono` | `inicio`, `ficha`, `sala`, `boletin`, `lupa`, `grafico`, `alerta`, `norma`, `algoritmo`, `libro`, `reporte`, `mapa`, `calendario`, `brote`, `enlace`, `documento` |
| `descripcion` | Una línea que explica la sección |
| `enlace` | Solo para tipo `enlace`: la dirección web |
| `padre` | Vacío para una sección del menú principal. Para una **subsección**, el `id` de su sección madre (ej. `metaxenicas` tiene padre `unidades`) |

Después de editar, ejecute `source("generar_portal.R")`.
En `catalogo.csv`, la columna `seccion` de cada documento lleva el `id` o el `titulo` de su sección.


Sitio web estático de la Oficina de Epidemiología, publicado con GitHub Pages.

## Página "Nosotros" (`data/nosotros.js`)
Misión, visión, valores, objetivo, cifras de cobertura, ejes, funciones y equipo técnico.
Edite los textos entre comillas. Para agregar una persona al equipo, copie una línea `{ cargo: ..., nombre: ... }` del bloque `equipo`.
Para actualizar las cifras (establecimientos, unidades notificantes e informantes), cambie los `valor` del bloque `cifras`.

## Boletines y salas semanales (sin editar nada)
- Copie el PDF en la carpeta de su semana: `documentos/boletines/2026/SE27/` o `documentos/salas/2026/SE27/`.
- Se puede hacer desde **github.com** (entrar a la carpeta → *Add file → Upload files* → *Commit changes*) o con GitHub Desktop.
- En 1–2 minutos aparece en la página, en su semana. El nombre del archivo es el título (ej. `Boletín epidemiológico - Red Chachapoyas.pdf`).
- Año nuevo: cree la carpeta `2027/SE01/` (en github.com, *Add file → Create new file* y escriba `2027/SE01/.gitkeep`).
- Configuración única: en GitHub, *Settings → Pages → Source: GitHub Actions*.

## Caracterización de la Red (población, una vez al año)
- `data/territorio.js` combina la población 2026 por establecimiento (Excel REUNIS, hojas "POR DISTRITOS" y "POR DIRESA") con los límites distritales de Amazonas (INEI, vía github.com/Rodasluis/Peru-maps, licencia MIT).
- Al cambiar de año, se regenera con `herramientas/preparar_territorio.py` y el nuevo Excel.
- Nota: en el Excel 2026 el bloque "POBLACIÓN FEMENINA 10-14 / 15-19 / 20-49" y la primera columna de "GESTANTES ESPERADAS" están desfasados (repiten mujeres de 0–3 años); las MEF se calculan desde las edades de las mujeres.

## Alertas, reportes y comunicados (sin editar nada)
- Copie el PDF en `documentos/alertas/2026/`, `documentos/reportes/2026/` o `documentos/comunicados/2026/` (github.com o GitHub Desktop).
- El más reciente aparece destacado arriba. El nombre del archivo es el título.
- Para fijar la fecha, empiece el nombre con ella: `2026-10-15 Alerta epidemiológica - Sarampión.pdf`; si no, se usa la fecha en que se subió.
- Año nuevo: cree la carpeta `2027/` dentro de cada una.

## Publicar un documento nuevo
1. Copiar el PDF en `documentos/salas/`, `documentos/boletines/` o `documentos/vigilancias/`, con un nombre sin espacios ni tildes, por ejemplo `sala_leishmaniasis_2026_se42.pdf`. Si la sala está en PowerPoint, primero: Archivo > Guardar como > PDF.
2. Agregar una fila en `data/catalogo.csv`:
   - `id`: número siguiente al último
   - `seccion`: el id o título de una sección de `secciones.csv` (ej. `salas`, `boletines`, `alertas`)
   - `se`: semana epidemiológica (opcional)
   - `fecha`: AAAA-MM-DD
   - `archivo`: carpeta y nombre del PDF, por ejemplo `salas/sala_leishmaniasis_2026_se42.pdf`
3. En RStudio: `source("generar_portal.R")`.
4. En GitHub Desktop: escribir un resumen (ej. "Sala leishmaniasis SE 42"), pulsar **Commit to main** y luego **Push origin**.

Si edita el CSV en Excel, guárdelo como **CSV UTF-8 (delimitado por comas)**.

## Importante
Todo lo que se sube aquí es público. Publicar solo información agregada: nunca nombres, DNI, direcciones ni datos que identifiquen a pacientes.

## Actualizar los tableros de "Unidades de vigilancia" (cada semana)
Estos tableros usan las bases de **toda la Red** del año en curso.
1. Descargue de NotiSP: `edas`, `iras`, `febriles`, `individual` (CSV), `lesiones_transito` y `diabetes` (Excel). Opcionales (si están, aparecen sus tableros): `mnp` (muerte fetal y neonatal), `vfamiliar` (violencia familiar) y las listas de salud mental exportadas (`...Depresion...xls`, `...Psicotico...xls`, `...suicidio...xls`). Guárdelas en una carpeta de su PC **fuera** de esta carpeta del sitio (son nominales).
2. Los maestros (`establecimientos`, `microredes`, `distritos`, `provincias`, `departamentos`, `enfermedades`) van en otra carpeta; solo se renuevan cuando cambian.
3. En `preparar_vigilancia.R` ajuste `RUTA_BASES` y `RUTA_MAESTROS` (solo la primera vez) y pulse **Source**. Se reescribe `data/vigilancia_red.js` (solo conteos).
4. Publique con GitHub Desktop (Commit + Push).
- Qué tablero aparece en cada unidad se decide en la columna `modulos` de `data/secciones.csv` (ej. `leish,dengue,feb`).
- Para agregar un evento nuevo de la notificación individual, añada una línea en `EVENTOS` dentro de `preparar_vigilancia.R` (con `TRUE` si quiere tablero propio). Los diagnósticos que aún no estén en la lista aparecen igual, como "otros".
- Si agrega bases de años anteriores (2021–2025) en la misma carpeta, se activan automáticamente el canal endémico y las comparaciones con años previos.

## Actualizar la Sala dinámica (cada semana)
1. Reemplace los CSV de NotiSP en su carpeta NOTI (Edas, Iras, Individual, Febril) y los Excel de agua.
2. Revise las rutas al inicio de `preparar_dashboard.R` (solo la primera vez).
3. En RStudio, con esta carpeta como directorio de trabajo: `source("preparar_dashboard.R")`.
4. En GitHub Desktop: **Commit to main** y **Push origin**.

El script solo escribe conteos agregados en `data/dashboard_datos.js`. Las bases originales (con nombres, DNI y direcciones) **nunca** deben copiarse dentro de esta carpeta.
