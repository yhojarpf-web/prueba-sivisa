# SIVISA – Red Integrada de Salud Chachapoyas

Portal informativo del Sistema de Información de Vigilancia Sanitaria.

| Carpeta | Qué contiene |
|---|---|
| `index.html` | Página de entrada SIVISA |
| `data/sitio.js` | **Configuración**: textos, portales (tarjetas), enlaces y contacto |
| `data/campanas.js` | **Campañas y noticias** del carrusel (ver abajo) |
| `assets/campanas/` | Fotos de las campañas (opcional) |
| `assets/logos/` | Logos. Para cambiar uno, reemplace el archivo con el mismo nombre |
| `epidemiologia/` | Portal Epidemiológico (documentos y dashboard) |
| `salud-ambiental/` | Portal de Salud Ambiental: Nosotros, Calidad del agua y Control vectorial |
| `promsa/` | Promoción de la Salud (en construcción) |

**Agregar un portal:** copie un bloque `{ ... }` dentro de `portales` en `data/sitio.js`, cambie sus datos y cree su carpeta.

**Epidemiología:** los scripts `generar_portal.R` y `preparar_dashboard.R` se ejecutan con la carpeta `epidemiologia/` como directorio de trabajo.

## Publicar una campaña o noticia (carrusel)
1. (Opcional) Suba la foto a `assets/campanas/`, idealmente de 1200 × 600 px.
2. Abra `data/campanas.js`, copie un bloque `{ ... }` y cambie etiqueta, título, texto, color, ícono e imagen.
3. En `portales` indique dónde se muestra: `"sivisa"` (inicio), `"epidemiologia"`, `"salud-ambiental"`, `"promsa"`.
4. Para ocultarla sin borrarla: `activa: false`. Para que aparezca solo unos días: `desde` y `hasta` (AAAA-MM-DD).

Puede hacerlo desde cualquier computadora en github.com: abra el archivo, pulse el lápiz (Edit), guarde con *Commit changes*. Para subir la foto: carpeta `assets/campanas` → *Add file* → *Upload files*.

## Sede y texto informativo
En `data/sitio.js`: `sede` (dirección, correo, teléfono, horario) y `sobre` (texto del bloque "Vigilancia en salud pública").

## Salud Ambiental: actualización mensual

| Qué | Archivo | Carpeta |
|---|---|---|
| Calidad del agua | `agua_AAAA_MM.xlsx` (copia de `PLANTILLA_AGUA_MENSUAL.xlsx`) | `salud-ambiental/datos/agua/AAAA/` |
| Índices aédicos | `aedes_AAAA_MM.xlsx` (copia de `PLANTILLA_AEDES_MENSUAL.xlsx`) | `salud-ambiental/datos/vectores/aedes/AAAA/` |
| Escenarios de Aedes | Excel con una hoja por escenario | `salud-ambiental/datos/vectores/escenarios/` |
| Lutzomyia | `lutzomyia_AAAA_MM.xlsx` (copia de `PLANTILLA_LUTZOMYIA_MENSUAL.xlsx`) | `salud-ambiental/datos/vectores/lutzomyia/AAAA/` |
| Unidades notificantes e informantes (Epidemiología) | `UNIDADES_NOTIF.xlsx` (reemplazar con el mismo nombre) | `epidemiologia/data/unidades/` |

Al subir el archivo a GitHub, la publicación automática regenera `salud-ambiental/data/agua.js`, `data/vectores.js`,
las unidades de notificación y la barra "Situación actual" (`data/situacion.js`, con brotes, eventos en aumento,
notificación semanal, agua, Aedes y las alertas o comunicados subidos en los últimos 15 días).
Estos Excel solo contienen datos agregados por sistema o establecimiento (sin datos personales).

## Alertas nacionales y regionales (barra de inicio)

Edite `data/alertas.js`: cada bloque es una alerta (`ambito`: Nacional, Regional o Red; `desde` / `hasta`; `enlace` al PDF o a la página oficial).
Aparecen primero en la barra de los portales y se ocultan solas al pasar la fecha `hasta`. No incluya datos que identifiquen a un paciente.

## Guías animados

- Portal Epidemiológico: búho (`epidemiologia/assets/buho.js`), con un gesto y mensaje por pestaña.
- Portal de Salud Ambiental: mundo, gota, Aedes hembra y Lutzomyia (`salud-ambiental/assets/guia.js`).
Los mensajes de cada pestaña se cambian en la lista del inicio de cada archivo. El visitante puede ocultarlos con la ×.
