###############################################################
# PREPARAR DATOS DEL DASHBOARD
# Lee las bases de NotiSP y de calidad del agua, las RESUME
# (solo conteos, sin datos personales) y escribe
# data/dashboard_datos.js para el portal.
#
# Uso semanal:
#   1. Actualice los CSV en la carpeta NOTI y los Excel de agua.
#   2. Abra esta carpeta del portal en RStudio y ejecute:
#        source("preparar_dashboard.R")
#   3. GitHub Desktop: Commit -> Push origin.
###############################################################

# ---------------- CONFIGURACIÓN (edite solo esta parte) ----------------
RUTA_NOTI <- "D:/M.R. Yerbabuena/Epidemiología/REPORTE/NOTI/Sala situacional_"
RUTA_POBLACION <- file.path(RUTA_NOTI, "Poblacion 2026", "poblacion_2026_normalizada.csv")
ARCHIVOS_AGUA <- c("D:/PORTAL RIS/agua/INFO_2025.xlsx",
                   "D:/PORTAL RIS/agua/INFO_2026.xlsx")
ANIO_ACTUAL <- NA            # NA = el año más reciente presente en la base de EDA
ANIOS_REFERENCIA <- 5L       # años previos para el canal endémico
AMBITO <- "Microred de Salud Yerbabuena"
AMBITO_AGUA <- "Red Integrada de Salud Chachapoyas"
SALIDA <- "data/dashboard_datos.js"
# -----------------------------------------------------------------------

for (p in c("jsonlite", "readxl")) if (!requireNamespace(p, quietly = TRUE)) install.packages(p, repos = "https://cloud.r-project.org")
if (!file.exists("index.html")) stop("Ejecute este script con la carpeta del portal como directorio de trabajo.")

# ---------- lectura ----------
leer_carpeta <- function(patron_carpeta) {
  archivos <- Sys.glob(file.path(RUTA_NOTI, patron_carpeta))
  archivos <- archivos[grepl("[0-9]{4}[.]csv$", basename(archivos), ignore.case = TRUE)]
  if (!length(archivos)) stop("No hay CSV en: ", file.path(RUTA_NOTI, patron_carpeta))
  lista <- lapply(archivos, function(f) {
    # colClasses = "character" conserva los ceros a la izquierda (UBIGEO, RED, MICRORED)
    x <- read.csv(f, colClasses = "character", check.names = FALSE,
                  fileEncoding = "UTF-8-BOM", na.strings = c("", "NA"))
    names(x) <- toupper(trimws(names(x)))
    x
  })
  todas <- unique(unlist(lapply(lista, names)))
  lista <- lapply(lista, function(x) { for (n in setdiff(todas, names(x))) x[[n]] <- NA_character_; x[todas] })
  d <- do.call(rbind, lista)
  d$ANO <- suppressWarnings(as.integer(d$ANO))
  d$SEMANA <- suppressWarnings(as.integer(d$SEMANA))
  d[!is.na(d$ANO) & !is.na(d$SEMANA) & d$SEMANA >= 1 & d$SEMANA <= 53, , drop = FALSE]
}

sumar_cols <- function(d, cols) {
  cols <- intersect(cols, names(d))
  if (!length(cols)) return(rep(0, nrow(d)))
  m <- sapply(cols, function(c) suppressWarnings(as.numeric(d[[c]])))
  if (is.null(dim(m))) m <- matrix(m, ncol = length(cols))
  m[is.na(m)] <- 0
  rowSums(m)
}
cols_inicio <- function(d, prefijos) names(d)[Reduce(`|`, lapply(prefijos, function(p) startsWith(names(d), p)))]

# Series semanales: list(TOTAL = list("2011" = 53 valores, ...), "010109A201" = ...)
series_semanales <- function(d, valor) {
  anios <- sort(unique(d$ANO))
  vector_anios <- function(sub) {
    out <- list()
    for (a in anios) {
      v <- numeric(53)
      s <- sub[sub$ANO == a, , drop = FALSE]
      if (nrow(s)) { ag <- tapply(s[[valor]], s$SEMANA, sum); v[as.integer(names(ag))] <- ag }
      out[[as.character(a)]] <- as.integer(round(v))
    }
    out
  }
  res <- list(TOTAL = vector_anios(d))
  for (e in sort(unique(na.omit(d$E_SALUD)))) res[[e]] <- vector_anios(d[d$E_SALUD %in% e, , drop = FALSE])
  res
}

tabla_edad <- function(d, grupos, se) {
  out <- list()
  for (a in c(ANIO_ACTUAL - 1L, ANIO_ACTUAL)) {
    s <- d[d$ANO == a & d$SEMANA <= se, , drop = FALSE]
    out[[as.character(a)]] <- vapply(grupos, function(cols) as.integer(sum(sumar_cols(s, cols))), integer(1), USE.NAMES = FALSE)
  }
  list(grupos = names(grupos), anios = out)
}

# ---------- población ----------
pob <- read.csv(RUTA_POBLACION, colClasses = "character", fileEncoding = "UTF-8-BOM")
eess <- lapply(seq_len(nrow(pob)), function(i) list(
  cod = pob$E_SALUD[i], nombre = tools::toTitleCase(tolower(pob$ESTABLECIMIENTO[i])),
  pob = as.integer(pob$POB_TOTAL[i]), pob5 = as.integer(pob$POB_MENOR_5[i])))

# ---------- EDA ----------
eda <- leer_carpeta("Edas/*.csv")
if (is.na(ANIO_ACTUAL)) ANIO_ACTUAL <- max(eda$ANO)
ultima_se <- function(d) { s <- d$SEMANA[d$ANO == ANIO_ACTUAL]; if (length(s)) max(s) else 0L }
eda$V <- sumar_cols(eda, cols_inicio(eda, "DAA_C"))
se_eda <- ultima_se(eda)
act_eda <- eda[eda$ANO == ANIO_ACTUAL & eda$SEMANA <= se_eda, , drop = FALSE]
mod_eda <- list(
  titulo = "EDA acuosa", unidad = "episodios", poblacion = "pob", tasa_k = 100, se_corte = se_eda,
  series = series_semanales(eda, "V"),
  edad = tabla_edad(eda, list("< 1 a" = "DAA_C1", "1-4 a" = "DAA_C1_4", "5-11 a" = "DAA_C5_11", "12-17 a" = "DAA_C12_17",
                              "18-29 a" = "DAA_C18_29", "30-59 a" = "DAA_C30_59", "60+ a" = "DAA_C60"), se_eda),
  extra = list("Disentéricas" = as.integer(sum(sumar_cols(act_eda, cols_inicio(eda, "DIS_C")))),
               "Defunciones" = as.integer(sum(sumar_cols(eda[eda$ANO == ANIO_ACTUAL, ], cols_inicio(eda, c("DAA_D", "DIS_D"))))),
               "Hospitalizados" = as.integer(sum(sumar_cols(eda[eda$ANO == ANIO_ACTUAL, ], cols_inicio(eda, c("DAA_H", "DIS_H")))))),
  fuente = "NotiSP – notificación colectiva semanal de EDA")

# ---------- IRA en menores de 5 años ----------
ira <- leer_carpeta("Iras/*.csv")
ira$V <- sumar_cols(ira, c("IRA_M2", "IRA_2_11", "IRA_1_4A"))
ira$NEU <- sumar_cols(ira, c("NEU_2_11", "NEU_1_4A", "NGR_M2", "NGR_2_11", "NGR_1_4A"))
se_ira <- ultima_se(ira)
act_ira <- ira[ira$ANO == ANIO_ACTUAL & ira$SEMANA <= se_ira, , drop = FALSE]
neu <- tapply(ira$NEU[ira$SEMANA <= se_ira], ira$ANO[ira$SEMANA <= se_ira], sum)
mod_ira <- list(
  titulo = "IRA en menores de 5 años", unidad = "episodios", poblacion = "pob5", tasa_k = 100, se_corte = se_ira,
  series = series_semanales(ira, "V"),
  edad = tabla_edad(ira, list("< 2 m" = "IRA_M2", "2-11 m" = "IRA_2_11", "1-4 a" = "IRA_1_4A"), se_ira),
  extra = list("Neumonías < 5 a" = as.integer(sum(act_ira$NEU)),
               "SOB/asma < 5 a" = as.integer(sum(sumar_cols(act_ira, c("SOB_2A", "SOB_2_4A")))),
               "Defunciones < 5 a" = as.integer(sum(sumar_cols(ira[ira$ANO == ANIO_ACTUAL, ], c("DIH_M2", "DIH_2_11", "DIH_1_4A", "DEH_M2", "DEH_2_11", "DEH_1_4A"))))),
  neumonia = as.list(setNames(as.integer(neu), names(neu))),
  fuente = "NotiSP – notificación colectiva semanal de IRA")

# ---------- Leishmaniasis (notificación individual) ----------
ind <- leer_carpeta("Individual/individual*.csv")
L <- ind[startsWith(toupper(trimws(ind$DIAGNOSTIC)), "B55") %in% TRUE, , drop = FALSE]
L$V <- 1
edad_a <- ifelse(L$TIPO_EDAD %in% "A", suppressWarnings(as.numeric(L$EDAD)), 0)
cortes <- c("Niño (0-11)", "Adolescente (12-17)", "Joven (18-29)", "Adulto (30-59)", "Adulto mayor (60+)")
L$CURSO <- as.character(cut(edad_a, c(-1, 11, 17, 29, 59, 200), labels = cortes))
L$DIAS <- as.numeric(as.Date(substr(L$FECHA_NOT, 1, 10)) - as.Date(substr(L$FECHA_INI, 1, 10)))
caract <- function(d) {
  dias <- d$DIAS[!is.na(d$DIAS)]
  q <- if (length(dias)) as.numeric(quantile(dias, c(.25, .5, .75))) else c(NA, NA, NA)
  list(n = nrow(d),
       sexo = list(Masculino = sum(d$SEXO %in% "M"), Femenino = sum(d$SEXO %in% "F")),
       curso = vapply(cortes, function(k) sum(d$CURSO %in% k), integer(1), USE.NAMES = FALSE),
       forma = list("Cutánea (B55.1)" = sum(d$DIAGNOSTIC %in% "B55.1"), "Mucocutánea (B55.2)" = sum(d$DIAGNOSTIC %in% "B55.2")),
       dias_mediana = q[2], dias_q1 = q[1], dias_q3 = q[3])
}
distritos <- c("010109" = "La Jalca", "010112" = "Leimebamba", "010113" = "Mariscal Castilla", "010115" = "Montevideo",
               "010519" = "San Juan de Lopecancha", "010521" = "Santo Tomás", "010522" = "Santo Tomás (anexo)", "010601" = "San Nicolás")
Lr <- L[L$ANO >= ANIO_ACTUAL - 5, , drop = FALSE]
tab_res <- table(Lr$UBIGEO, Lr$ANO)
mod_leish <- list(
  titulo = "Leishmaniasis", unidad = "casos", poblacion = "pob", tasa_k = 100000,
  se_corte = max(se_eda, se_ira),   # misma fecha de corte que la notificación colectiva
  series = series_semanales(L, "V"),
  caract = list(actual = caract(L[L$ANO == ANIO_ACTUAL, ]), historico = caract(L[L$ANO >= ANIO_ACTUAL - 5 & L$ANO < ANIO_ACTUAL, ])),
  curso_grupos = cortes,
  residencia = list(anios = colnames(tab_res),
                    filas = lapply(rownames(tab_res), function(u) list(
                      ubigeo = u, nombre = if (u %in% names(distritos)) unname(distritos[u]) else u,
                      casos = as.integer(tab_res[u, ])))),
  extra = list(Defunciones = sum(!is.na(L$FECHA_DEF[L$ANO == ANIO_ACTUAL]))),
  fuente = "NotiSP – notificación individual (B55.x), por establecimiento notificante")

# ---------- Febriles ----------
feb <- leer_carpeta("Febril/*.csv")
feb$V <- sumar_cols(feb, "FEB_TOT")
mod_feb <- list(titulo = "Síndrome febril", unidad = "casos", poblacion = "pob", tasa_k = 1000,
                se_corte = ultima_se(feb), series = series_semanales(feb, "V"),
                fuente = "NotiSP – vigilancia de febriles")

# ---------- Calidad del agua ----------
leer_agua <- function(f) {
  d <- as.data.frame(readxl::read_excel(f, skip = 1, col_types = "text"))
  names(d) <- trimws(names(d))
  names(d)[6] <- "FECHA"
  d$FECHA <- as.Date(d$FECHA, format = "%d-%m-%Y")
  d$ANIO <- as.integer(format(d$FECHA, "%Y")); d$MES <- as.integer(format(d$FECHA, "%m"))
  n <- function(col) if (col %in% names(d)) suppressWarnings(as.numeric(d[[col]])) else rep(NA_real_, nrow(d))
  data.frame(ANIO = d$ANIO, MES = d$MES, FECHA = d$FECHA, Provincia = d$Provincia, Distrito = d$Distrito, Ubigeo = d$Ubigeo,
             Ubicacion = d[[8]], Cloro = n("Cloro"), Turbiedad = n("Turbiedad"), pH = n("pH"),
             Fec = n("Bacterias Coliformes Fecales (UFC)"), Tot = n("Bacterias Coliformes Totales (UFC)"), stringsAsFactors = FALSE)
}
A <- do.call(rbind, lapply(ARCHIVOS_AGUA, leer_agua))
A <- A[!is.na(A$ANIO), ]
red <- startsWith(tolower(A$Ubicacion), "red") %in% TRUE
A$cl_n <- as.integer(red & !is.na(A$Cloro))
A$cl_ok <- as.integer(red & (A$Cloro >= 0.5) %in% TRUE); A$cl_cero <- as.integer(red & (A$Cloro == 0) %in% TRUE)
A$tu_n <- as.integer(!is.na(A$Turbiedad)); A$tu_ok <- as.integer((A$Turbiedad <= 5) %in% TRUE)
A$ph_n <- as.integer(!is.na(A$pH)); A$ph_ok <- as.integer((A$pH >= 6.5 & A$pH <= 8.5) %in% TRUE)
A$bac_n <- as.integer(!is.na(A$Fec) | !is.na(A$Tot)); A$bac_pos <- as.integer((A$Fec > 0) %in% TRUE | (A$Tot > 0) %in% TRUE)
A$ctt_n <- as.integer(!is.na(A$Fec)); A$ctt_pos <- as.integer((A$Fec > 0) %in% TRUE)
K <- c("cl_n", "cl_ok", "cl_cero", "tu_n", "tu_ok", "ph_n", "ph_ok", "bac_n", "bac_pos", "ctt_n", "ctt_pos")
mens <- aggregate(A[K], A[c("ANIO", "MES")], sum)
A$uno <- 1L
dist <- aggregate(A[c(K, "uno")], A[c("ANIO", "Provincia", "Distrito")], sum)
ccpp <- aggregate(Ubigeo ~ ANIO + Provincia + Distrito, A, function(x) length(unique(x)))
dist <- merge(dist, ccpp, by = c("ANIO", "Provincia", "Distrito"))
titulo <- function(x) tools::toTitleCase(tolower(x))
fila <- function(r, extra) c(extra, lapply(r[K], as.integer))
agua <- list(
  ambito = AMBITO_AGUA, actualizado = format(max(A$FECHA), "%Y-%m-%d"),
  mensual = lapply(seq_len(nrow(mens)), function(i) fila(mens[i, ], list(anio = mens$ANIO[i], mes = mens$MES[i]))),
  distritos = lapply(seq_len(nrow(dist)), function(i) fila(dist[i, ], list(
    anio = dist$ANIO[i], provincia = titulo(dist$Provincia[i]), distrito = titulo(dist$Distrito[i]),
    muestras = as.integer(dist$uno[i]), ccpp = as.integer(dist$Ubigeo[i])))),
  limites = list(cloro = "Cloro residual libre ≥ 0,5 mg/L (red de distribución)", turbiedad = "Turbiedad ≤ 5 UNT",
                 ph = "pH 6,5 – 8,5", bacterias = "Coliformes totales y termotolerantes: 0 UFC/100 mL"),
  fuente = "Vigilancia de la calidad del agua para consumo humano – DS N.° 031-2010-SA")

# ---------- escribir ----------
DASH <- list(generado = format(Sys.Date()), anio = ANIO_ACTUAL, ref_n = ANIOS_REFERENCIA, ambito = AMBITO, eess = eess,
             modulos = list(eda = mod_eda, ira = mod_ira, leish = mod_leish, feb = mod_feb), agua = agua)
json <- jsonlite::toJSON(DASH, auto_unbox = TRUE, na = "null", null = "null", digits = NA)
writeLines(paste0("window.DASHBOARD = ", json, ";"), SALIDA, useBytes = TRUE)
cat(sprintf("Listo: %s (%.0f KB). Cortes: EDA SE %d, IRA SE %d, febriles SE %d.\nAhora en GitHub Desktop: Commit y Push origin.\n",
            SALIDA, file.size(SALIDA) / 1024, se_eda, se_ira, mod_feb$se_corte))
