# Actualiza el portal a partir de data/catalogo.csv
# Uso: abrir esta carpeta en RStudio y ejecutar  source("generar_portal.R")
# Luego, en GitHub Desktop: Commit -> Push origin.

if (!requireNamespace("jsonlite", quietly = TRUE)) install.packages("jsonlite", repos = "https://cloud.r-project.org")

x <- read.csv("data/catalogo.csv", stringsAsFactors = FALSE, fileEncoding = "UTF-8",
              check.names = FALSE, na.strings = c("", "NA"), colClasses = "character")

columnas <- c("id", "titulo", "seccion", "vigilancia", "se", "descripcion", "fecha", "archivo")
faltan <- setdiff(columnas, names(x))
if (length(faltan)) stop("Faltan columnas en catalogo.csv: ", paste(faltan, collapse = ", "))
x <- x[, columnas]
x[is.na(x)] <- ""

# ---- Secciones del menú (data/secciones.csv) ----
sec <- read.csv("data/secciones.csv", stringsAsFactors = FALSE, fileEncoding = "UTF-8",
                check.names = FALSE, na.strings = c("", "NA"), colClasses = "character")
sec[is.na(sec)] <- ""
if (!"padre" %in% names(sec)) sec$padre <- ""
if (!"modulos" %in% names(sec)) sec$modulos <- ""
req <- c("orden", "id", "titulo", "tipo", "icono", "descripcion", "enlace", "padre", "modulos")
if (length(setdiff(req, names(sec)))) stop("Faltan columnas en secciones.csv: ", paste(setdiff(req, names(sec)), collapse = ", "))
sec <- sec[order(as.numeric(sec$orden)), req]
tipos <- c("inicio", "documentos", "dashboard", "enlace", "pagina", "calendario", "mapa", "semanas", "territorio", "brotes", "algoritmos", "mapaepi")
if (any(!sec$tipo %in% tipos)) stop("secciones.csv: tipo no válido en ", paste(sec$id[!sec$tipo %in% tipos], collapse = ", "), ". Use: ", paste(tipos, collapse = ", "))
if (anyDuplicated(sec$id)) stop("secciones.csv: hay ids repetidos")
if (any(!grepl("^[a-z0-9-]+$", sec$id))) stop("secciones.csv: el id solo puede tener minúsculas, números y guiones (sin tildes ni espacios)")
if (any(nzchar(sec$padre) & !sec$padre %in% sec$id)) stop("secciones.csv: la columna padre debe tener el id de otra sección: ", paste(sec$id[nzchar(sec$padre) & !sec$padre %in% sec$id], collapse = ", "))
if (any(sec$tipo == "enlace" & !nzchar(sec$enlace))) stop("secciones.csv: las secciones de tipo 'enlace' necesitan la columna enlace")
sec$orden <- as.integer(sec$orden)
writeLines(c("window.SECCIONES = ", jsonlite::toJSON(sec, auto_unbox = TRUE, pretty = TRUE), ";"), "data/secciones.js", useBytes = FALSE)

normalizar <- function(z) tolower(trimws(iconv(z, from = "UTF-8", to = "ASCII//TRANSLIT")))
secciones_doc <- sec[sec$tipo == "documentos", ]
secciones <- c(secciones_doc$id, secciones_doc$titulo)
problemas <- character()
fechas <- as.Date(x$fecha, format = "%Y-%m-%d")
for (i in seq_len(nrow(x))) {
  fila <- sprintf("Fila %d (\"%s\")", i + 1, x$titulo[i])
  if (!nzchar(x$titulo[i])) problemas <- c(problemas, paste(fila, "sin título"))
  if (is.na(fechas[i])) problemas <- c(problemas, paste(fila, "fecha inválida, use AAAA-MM-DD"))
  if (!normalizar(x$seccion[i]) %in% normalizar(secciones)) problemas <- c(problemas, paste0(fila, " sección no reconocida: \"", x$seccion[i], "\". Use el id o el título de una sección de secciones.csv"))
  if (nzchar(x$se[i]) && !grepl("^([1-9]|[1-4][0-9]|5[0-3])$", x$se[i])) problemas <- c(problemas, paste(fila, "SE debe ser 1 a 53"))
  if (nzchar(x$archivo[i])) {
    if (!grepl("^([a-z0-9_-]+/)?[A-Za-z0-9_-]+\\.pdf$", x$archivo[i], ignore.case = TRUE))
      problemas <- c(problemas, paste(fila, "nombre de archivo no válido (solo letras, números, - y _; terminado en .pdf; ej. salas/leish_se42.pdf)"))
    else if (!file.exists(file.path("documentos", x$archivo[i])))
      problemas <- c(problemas, paste(fila, "no existe documentos/", x$archivo[i]))
  }
}
if (anyDuplicated(x$id)) problemas <- c(problemas, "Hay IDs repetidos")
if (length(problemas)) stop("Corrija el catálogo antes de publicar:\n- ", paste(problemas, collapse = "\n- "), call. = FALSE)

x$id <- as.integer(x$id)
x$se <- suppressWarnings(as.integer(x$se))
json <- jsonlite::toJSON(x, na = "null", auto_unbox = TRUE, pretty = TRUE)
writeLines(c("window.CATALOGO = ", json, ";"), "data/catalogo.js", useBytes = FALSE)

# ---- Unidades de notificación: data/unidades/unidades.geojson -> unidades.js ----
# Exportar desde QGIS como GeoJSON en EPSG:4326 y guardar con ese nombre.
geo <- "data/unidades/unidades.geojson"
if (file.exists(geo)) {
  g <- jsonlite::fromJSON(geo, simplifyVector = FALSE)
  titulo <- function(z) { z <- tools::toTitleCase(tolower(trimws(as.character(z)))); z }
  pts <- lapply(g$features, function(f) {
    p <- f$properties; co <- unlist(f$geometry$coordinates)
    hosp <- grepl("HOSPITAL", toupper(if (is.null(p$TIPO_PUNTO_MAPA)) "" else p$TIPO_PUNTO_MAPA))
    v <- function(k) if (is.null(p[[k]])) "" else as.character(p[[k]])
    list(cod = v("COD_IPRESS"), nombre = titulo(v("IPRESS")), microred = if (hosp) "" else titulo(v("MICRORED")),
         provincia = titulo(v("PROVINCIA")), distrito = titulo(v("DISTRITO")), ubigeo = sprintf("%06d", as.integer(v("UBIGEO"))),
         categoria = v("CATEGORIA"), clasificacion = titulo(v("CLASIFICACION")), direccion = v("DIRECCION"),
         n_ipress = if (is.null(p$N_IPRESS_MICRORED)) NA else as.integer(p$N_IPRESS_MICRORED),
         tipo = if (hosp) "hospital" else "cabecera", lat = round(co[2], 6), lon = round(co[1], 6))
  })
  res <- list(notificantes = 198, informantes = 27, nota = "Cifras de la Oficina de Epidemiología 2026")
  writeLines(c("window.UNIDADES = ", jsonlite::toJSON(list(resumen = res, puntos = pts), auto_unbox = TRUE, na = "null", pretty = TRUE, digits = NA), ";"),
             "data/unidades/unidades.js", useBytes = FALSE)
  cat(sprintf("Mapa: %d puntos de unidades actualizados.\n", length(pts)))
}

cat(sprintf("Listo: %d publicaciones y %d secciones. Ahora en GitHub Desktop pulse Commit y luego Push origin.\n", nrow(x), nrow(sec)))
