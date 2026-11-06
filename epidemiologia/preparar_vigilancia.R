# =====================================================================
#  SIVISA · Tableros de "Unidades de vigilancia" (toda la Red)
#  Lee las bases NotiSP de la Red y escribe data/vigilancia_red.js
#  Solo publica CONTEOS agregados: ningún nombre, DNI ni dirección.
#
#  Uso semanal:
#   1. Descargue de NotiSP las bases del año y cópielas en RUTA_BASES
#      (los nombres deben contener: edas, iras, febril, individual,
#       lesiones...transito .xlsx, diabetes .xlsx).
#   2. Los maestros (establecimientos, microredes, distritos, provincias,
#      departamentos, enfermedades) van en RUTA_MAESTROS; se actualizan rara vez.
#   3. Abra este archivo en RStudio y pulse "Source".
#  Paquetes: readxl, jsonlite  (install.packages(c("readxl","jsonlite")))
# =====================================================================

RUTA_BASES    <- "D:/Epidemiologia/NotiSP/Red/2026"          # <- cambie a su carpeta
RUTA_MAESTROS <- "D:/Epidemiologia/NotiSP/Maestros"           # <- cambie a su carpeta
SALIDA        <- "data/vigilancia_red.js"                     # relativo a la carpeta epidemiologia
SUBREG <- "36"; RED <- "01"
AMBITO <- "Red Integrada de Salud Chachapoyas"

suppressPackageStartupMessages({ library(readxl); library(jsonlite) })
if (requireNamespace("rstudioapi", quietly = TRUE) && rstudioapi::isAvailable())
  setwd(dirname(rstudioapi::getSourceEditorContext()$path))

busca <- function(carpeta, patron) {
  f <- sort(list.files(carpeta, pattern = patron, full.names = TRUE, ignore.case = TRUE))
  if (!length(f)) stop("No se encontró ", patron, " en ", carpeta)
  tail(f, 1)
}
lee_csv <- function(f) {
  d <- tryCatch(read.csv(f, colClasses = "character", fileEncoding = "UTF-8-BOM", check.names = FALSE),
                error = function(e) read.csv(f, colClasses = "character", fileEncoding = "latin1", check.names = FALSE))
  names(d) <- toupper(trimws(names(d))); d
}
lee_xls <- function(f) { d <- as.data.frame(read_excel(f, col_types = "text")); names(d) <- toupper(trimws(names(d))); d }
num <- function(d, cols) { cols <- intersect(cols, names(d)); if (!length(cols)) return(rep(0, nrow(d)))
  m <- sapply(d[cols], function(x) suppressWarnings(as.numeric(x))); m[is.na(m)] <- 0; if (is.null(dim(m))) sum(m) else rowSums(m) }
num1 <- function(x) suppressWarnings(as.numeric(x))
titulo <- function(s) {
  s <- tools::toTitleCase(tolower(trimws(s)))
  s <- gsub("\\b(\\w)", "\\U\\1", s, perl = TRUE)
  for (p in list(c(" De ", " de "), c(" Del ", " del "), c(" La ", " la "), c(" Y ", " y "), c("Maria", "María"),
                 c("Tomas", "Tomás"), c("Fatima", "Fátima"), c("Asuncion", "Asunción"))) s <- gsub(p[1], p[2], s, fixed = TRUE)
  s
}
empieza <- function(x, pref) Reduce(`|`, lapply(pref, function(p) startsWith(x, p)))

# ---------- Semana epidemiológica desde una fecha ----------
inicio_se1 <- function(a) { d <- as.Date(sprintf("%d-01-01", a)); dow <- as.integer(format(d, "%w"))
  ini <- d - dow; if (dow <= 3) ini else ini + 7 }
se_de <- function(f) {
  out <- matrix(NA_integer_, length(f), 2)
  for (i in seq_along(f)) { if (is.na(f[i])) next
    a <- as.integer(format(f[i], "%Y"))
    if (f[i] < inicio_se1(a)) a <- a - 1 else if (f[i] >= inicio_se1(a + 1)) a <- a + 1
    out[i, ] <- c(a, as.integer((f[i] - inicio_se1(a)) %/% 7) + 1L) }
  out
}

# ---------- Maestros ----------
E  <- lee_csv(busca(RUTA_MAESTROS, "establecimientos.*\\.csv$")); E <- E[E$SUBREGION == SUBREG & E$RED == RED, ]
M  <- lee_csv(busca(RUTA_MAESTROS, "microredes.*\\.csv$"));       M <- M[M$SUBREGION == SUBREG & M$RED == RED, ]
DI <- lee_csv(busca(RUTA_MAESTROS, "distritos.*\\.csv$"))
PR <- lee_csv(busca(RUTA_MAESTROS, "provincias.*\\.csv$"))
DP <- lee_csv(busca(RUTA_MAESTROS, "departamentos.*\\.csv$"))
EN <- lee_csv(busca(RUTA_MAESTROS, "enfermedades.*\\.csv$"))
nom_mr <- setNames(titulo(M$NOMBRE), M$CODIGO); nom_mr["99"] <- "Hospital Regional Virgen de Fátima"
nom_es <- setNames(titulo(ifelse(nzchar(trimws(E$NOMBRE)), E$NOMBRE, E$RAZ_SOC)), E$COD_EST)
mr_es  <- setNames(E$MICRORED, E$COD_EST)
cie_nom <- setNames(trimws(EN$DIAGNO), trimws(EN$CIE_10))
nom_dist <- function(u) {
  u <- trimws(u); i <- match(u, DI$UBIGEO)
  if (is.na(i)) return(ifelse(nzchar(u), u, "Sin dato"))
  pv <- titulo(PR$NOMBRE[match(substr(u, 1, 4), PR$UBIGEO)])
  if (startsWith(u, "01")) paste0(titulo(DI$NOMBRE[i]), " (", pv, ")")
  else paste0(titulo(DI$NOMBRE[i]), " (", pv, ", ", titulo(DP$NOMBRE[match(substr(u, 1, 2), DP$UBIGEO)]), ")")
}

prep <- function(d, ano, se, es) {
  d$ANO <- num1(d[[ano]]); d$SEMANA <- num1(d[[se]]); d$E_SALUD <- trimws(ifelse(is.na(d[[es]]), "", d[[es]]))
  base_mr <- if ("MICRORED" %in% names(d)) trimws(d$MICRORED) else rep("", nrow(d))
  d$MR <- ifelse(is.na(mr_es[d$E_SALUD]), base_mr, mr_es[d$E_SALUD])
  nuevos <- unique(d[is.na(mr_es[d$E_SALUD]), c("E_SALUD", "MR")])          # EE.SS. que no están en el maestro
  for (i in seq_len(nrow(nuevos))) mr_es[nuevos$E_SALUD[i]] <<- nuevos$MR[i]
  d[!is.na(d$ANO) & !is.na(d$SEMANA) & d$SEMANA >= 1 & d$SEMANA <= 53, ]
}

serie_de <- function(d, v, anios) {
  out <- list()
  for (a in anios) { x <- integer(53); s <- d[d$ANO == a, ]
    if (nrow(s)) { t <- tapply(s[[v]], s$SEMANA, sum); x[as.integer(names(t))] <- as.integer(round(t)) }
    out[[as.character(a)]] <- x }
  out
}
series <- function(d, v) {
  anios <- sort(unique(d$ANO)); res <- list(TOTAL = serie_de(d, v, anios))
  for (k in sort(unique(d$MR))) res[[paste0("MR", k)]] <- serie_de(d[d$MR == k, ], v, anios)
  for (k in sort(unique(d$E_SALUD))) { s <- d[d$E_SALUD == k, ]; if (sum(s[[v]]) > 0) res[[k]] <- serie_de(s, v, anios) }
  res
}
edad_tabla <- function(d, grupos, se) {
  out <- list()
  for (a in sort(unique(d$ANO))) { s <- d[d$ANO == a & d$SEMANA <= se, ]
    out[[as.character(a)]] <- sapply(grupos, function(cols) sum(num(s, cols))) }
  list(grupos = names(grupos), anios = out)
}
items <- function(x, orden = NULL) {
  t <- table(x); if (!is.null(orden)) { t <- t[orden]; t[is.na(t)] <- 0; names(t) <- orden } else t <- sort(t, decreasing = TRUE)
  unname(lapply(names(t), function(k) list(k, as.integer(t[[k]]))))
}

# ---------- EDA ----------
eda <- prep(lee_csv(busca(RUTA_BASES, "edas.*\\.csv$")), "ANO", "SEMANA", "E_SALUD")
ANIO <- max(eda$ANO)
eda$V <- num(eda, grep("^DAA_C", names(eda), value = TRUE)); eda$DIS <- num(eda, grep("^DIS_C", names(eda), value = TRUE))
se_eda <- max(eda$SEMANA[eda$ANO == ANIO]); cur <- eda[eda$ANO == ANIO, ]
mod_eda <- list(titulo = "EDA acuosa", corto = "EDA", unidad = "episodios", tasa_k = 0, se_corte = se_eda, series = series(eda, "V"),
  edad = edad_tabla(eda, list("< 1 a" = "DAA_C1", "1-4 a" = "DAA_C1_4", "5-11 a" = "DAA_C5_11", "12-17 a" = "DAA_C12_17",
                              "18-29 a" = "DAA_C18_29", "30-59 a" = "DAA_C30_59", "60+ a" = "DAA_C60"), se_eda),
  extra = list("Disentéricas" = sum(cur$DIS),
               "Hospitalizados" = sum(num(cur, grep("^(DAA|DIS)_H", names(cur), value = TRUE))),
               "Defunciones" = sum(num(cur, grep("^(DAA|DIS)_D", names(cur), value = TRUE)))),
  fuente = "NotiSP – notificación colectiva semanal de EDA")

# ---------- IRA ----------
ira <- prep(lee_csv(busca(RUTA_BASES, "iras.*\\.csv$")), "ANO", "SEMANA", "E_SALUD")
ira$V <- num(ira, c("IRA_M2", "IRA_2_11", "IRA_1_4A"))
se_ira <- max(ira$SEMANA[ira$ANO == ANIO]); cur <- ira[ira$ANO == ANIO, ]
mod_ira <- list(titulo = "IRA en menores de 5 años", corto = "IRA < 5 años", unidad = "episodios", tasa_k = 0, se_corte = se_ira,
  series = series(ira, "V"), edad = edad_tabla(ira, list("< 2 m" = "IRA_M2", "2-11 m" = "IRA_2_11", "1-4 a" = "IRA_1_4A"), se_ira),
  extra = list("Neumonías < 5 a" = sum(num(cur, c("NEU_2_11", "NEU_1_4A", "NGR_M2", "NGR_2_11", "NGR_1_4A"))),
               "Neumonías 5 a y más" = sum(num(cur, c("NEU_5_9A", "NEU_10_19", "NEU_20_59", "NEU_60A", "NGR_5_9A", "NGR_60A"))),
               "SOB/asma < 5 a" = sum(num(cur, c("SOB_2A", "SOB_2_4A"))),
               "Defunciones por neumonía" = sum(num(cur, grep("^(DIH|DEH)_", names(cur), value = TRUE)))),
  fuente = "NotiSP – notificación colectiva semanal de IRA")

# ---------- Febriles ----------
feb <- prep(lee_csv(busca(RUTA_BASES, "febril.*\\.csv$")), "ANO", "SEMANA", "E_SALUD")
feb$V <- num(feb, "FEB_TOT"); se_feb <- max(feb$SEMANA[feb$ANO == ANIO])
mod_feb <- list(titulo = "Síndrome febril", corto = "Febriles", unidad = "casos", tasa_k = 0, se_corte = se_feb, series = series(feb, "V"),
  edad = edad_tabla(feb, list("< 1 a" = "FEB_M1", "1-4 a" = "FEB_1_4", "5-9 a" = "FEB_5_9", "10-19 a" = "FEB_10_19",
                              "20-59 a" = "FEB_20_59", "60+ a" = "FEB_M60"), se_feb),
  fuente = "NotiSP – vigilancia de febriles")
SE <- max(se_eda, se_ira, se_feb)

# ---------- Utilidades individuales ----------
CURSOS <- c("Niño (0-11)", "Adolescente (12-17)", "Joven (18-29)", "Adulto (30-59)", "Adulto mayor (60+)")
curso <- function(e) as.character(cut(e, c(-1, 11, 17, 29, 59, 200), labels = CURSOS))
q <- function(x, p) if (length(x)) unname(quantile(x, p, type = 7)) else NA_real_   # NA -> null en JSON
caract <- function(d, formas = NULL, dias = NULL) {
  dd <- if (!is.null(dias)) d[[dias]][!is.na(d[[dias]])] else numeric(0)
  list(n = nrow(d), sexo = list(Masculino = sum(d$SEXO_N == "M", na.rm = TRUE), Femenino = sum(d$SEXO_N == "F", na.rm = TRUE)),
       curso = sapply(CURSOS, function(n) sum(d$CURSO == n, na.rm = TRUE), USE.NAMES = FALSE),
       forma = if (length(formas)) as.list(sapply(formas, function(v) sum(d$DIAGNOSTIC == v))) else setNames(list(), character(0)),
       dias_mediana = q(dd, .5), dias_q1 = q(dd, .25), dias_q3 = q(dd, .75))
}
VACIO <- list(n = 0, sexo = list(Masculino = 0, Femenino = 0), curso = rep(0, 5), forma = setNames(list(), character(0)),
              dias_mediana = NA_real_, dias_q1 = NA_real_, dias_q3 = NA_real_)
residencia <- function(d, col) {
  t <- sort(table(d[[col]][d$ANO == ANIO]), decreasing = TRUE)
  list(anios = list(as.character(ANIO)),
       filas = unname(lapply(names(t), function(u) list(ubigeo = u, nombre = nom_dist(u), casos = list(as.integer(t[[u]]))))))
}
modulo_ind <- function(nombre, X, fuente, formas = NULL, dias = NULL, res_col = "UBIGEO", distrib = list(), extra = list(), unidad = "casos") {
  X$V <- 1
  list(titulo = nombre, corto = nombre, unidad = unidad, tasa_k = 0, se_corte = SE, series = series(X, "V"), individual = TRUE,
       caract = list(actual = caract(X[X$ANO == ANIO, ], formas, dias), historico = VACIO),
       curso_grupos = CURSOS, residencia = residencia(X, res_col), distrib = distrib, extra = extra, fuente = fuente)
}

# ---------- Notificación individual ----------
ind <- prep(lee_csv(busca(RUTA_BASES, "individual.*\\.csv$")), "ANO", "SEMANA", "E_SALUD")
ind$DIAGNOSTIC <- toupper(trimws(ifelse(is.na(ind$DIAGNOSTIC), "", ind$DIAGNOSTIC)))
ind$TIPO_DX[is.na(ind$TIPO_DX)] <- ""
ind$CURSO  <- curso(ifelse(ind$TIPO_EDAD == "A", num1(ind$EDAD), 0))
ind$SEXO_N <- substr(toupper(ind$SEXO), 1, 1)
ind$DIAS   <- as.numeric(as.Date(substr(ind$FECHA_NOT, 1, 10)) - as.Date(substr(ind$FECHA_INI, 1, 10)))
CLASIF <- c(C = "Confirmado", P = "Probable", D = "Descartado")

# id, nombre, expresión CIE-10, unidad (id en secciones.csv), ¿tablero propio?, formas clínicas
EVENTOS <- list(
  list("leish", "Leishmaniasis", "^B55", "metaxenicas", TRUE, c("Cutánea (B55.1)" = "B55.1", "Mucocutánea (B55.2)" = "B55.2")),
  list("dengue", "Dengue", "^A97", "metaxenicas", TRUE, c("Sin signos de alarma (A97.0)" = "A97.0", "Con signos de alarma (A97.1)" = "A97.1", "Grave (A97.2)" = "A97.2")),
  list("carrion", "Enfermedad de Carrión", "^A44", "metaxenicas", FALSE, NULL),
  list("chagas", "Enfermedad de Chagas", "^B57", "metaxenicas", FALSE, NULL),
  list("malaria", "Malaria", "^B5[0-4]", "metaxenicas", FALSE, NULL),
  list("zika", "Zika", "^U06", "metaxenicas", FALSE, NULL),
  list("chikungunya", "Chikungunya", "^A92\\.0", "metaxenicas", FALSE, NULL),
  list("leptospirosis", "Leptospirosis", "^A27", "zoonosis", TRUE, NULL),
  list("ofidismo", "Ofidismo", "^X20", "zoonosis", FALSE, NULL),
  list("loxoscelismo", "Loxoscelismo", "^X21", "zoonosis", FALSE, NULL),
  list("rabia", "Rabia", "^A82", "zoonosis", FALSE, NULL),
  list("peste", "Peste", "^A20", "zoonosis", FALSE, NULL),
  list("varicela", "Varicela", "^B01", "inmunoprevenibles", TRUE, c("Con otras complicaciones (B01.8)" = "B01.8", "Sin complicaciones (B01.9)" = "B01.9")),
  list("sarampion", "Sarampión", "^B05", "inmunoprevenibles", FALSE, NULL),
  list("rubeola", "Rubéola", "^B06", "inmunoprevenibles", FALSE, NULL),
  list("parotiditis", "Parotiditis", "^B26", "inmunoprevenibles", FALSE, NULL),
  list("tosferina", "Tos ferina", "^A37", "inmunoprevenibles", FALSE, NULL),
  list("pfa", "Parálisis flácida aguda", "^G83", "inmunoprevenibles", FALSE, NULL),
  list("tb", "Tuberculosis", "^A1[5-9]", "tbc-vih", FALSE, NULL),
  list("vih", "VIH/Sida", "^B2[0-4]", "tbc-vih", FALSE, NULL),
  list("sifilis", "Sífilis", "^A5[0-3]", "tbc-vih", FALSE, NULL),
  list("hepb", "Hepatitis B", "^B16", "tbc-vih", FALSE, NULL),
  list("muerte_materna", "Muerte materna", "^O9[56]", "materno-perinatal", FALSE, NULL),
  list("sifilis_materna", "Sífilis materna", "^O98\\.1", "materno-perinatal", FALSE, NULL),
  list("plaguicidas", "Intoxicación por plaguicidas", "^T60", "no-transmisibles", FALSE, NULL))

ficha_evento <- function(id, nombre, T, X, unidad, modulo) {
  ult <- if (nrow(X)) X[order(X$ANO, X$SEMANA), ][nrow(X), ] else NULL
  pa <- table(X$ANO)
  list(id = id, nombre = nombre, cie = paste(sort(unique(T$DIAGNOSTIC)), collapse = ", "), unidad = unidad, modulo = modulo,
       por_anio = setNames(as.list(as.integer(pa)), names(pa)),
       confirmados = sum(T$TIPO_DX == "C"), probables = sum(T$TIPO_DX == "P"), total = nrow(X), descartados = sum(T$TIPO_DX == "D"),
       ultimo = if (is.null(ult)) NA else list(anio = ult$ANO, se = ult$SEMANA))
}
modulos_ind <- list(); eventos <- list(); usados <- rep(FALSE, nrow(ind))
RED_UB <- unique(E$UBIGEO_RN)
MAPA <- list()   # registros para el mapa: evento, ubigeo, código de localidad, semana, valor
al_mapa <- function(eid, d, col_ub, col_loc = NULL, valor = NULL) {
  if (!nrow(d)) return(invisible())
  MAPA[[length(MAPA) + 1]] <<- data.frame(ev = eid, ub = as.character(d[[col_ub]]), loc = if (is.null(col_loc)) "" else ifelse(is.na(d[[col_loc]]), "", d[[col_loc]]),
                                          se = d$SEMANA, v = if (is.null(valor)) 1 else d[[valor]], stringsAsFactors = FALSE)
}
for (ev in EVENTOS) {
  sel <- grepl(ev[[3]], ind$DIAGNOSTIC); if (!any(sel)) next
  usados <- usados | sel; T <- ind[sel, ]; X <- T[T$TIPO_DX != "D", ]
  XA <- X[X$ANO == ANIO, ]; al_mapa(ev[[1]], XA, "UBIGEO", "LOCALCOD")
  aut <- sum(XA$UBIGEO %in% RED_UB)
  fe <- ficha_evento(ev[[1]], ev[[2]], T, X, ev[[4]], if (ev[[5]]) ev[[1]] else NA); fe$autoctonos <- aut; fe$importados <- nrow(XA) - aut
  eventos[[length(eventos) + 1]] <- fe
  if (!ev[[5]]) next
  clas <- ifelse(T$TIPO_DX %in% names(CLASIF), CLASIF[T$TIPO_DX], "Sin dato")
  modulos_ind[[ev[[1]]]] <- modulo_ind(ev[[2]], X,
    paste0("NotiSP – notificación individual (", paste(sort(unique(T$DIAGNOSTIC)), collapse = ", "), "), por establecimiento notificante"),
    ev[[6]], "DIAS", "UBIGEO",
    distrib = list(list(titulo = "Clasificación del caso", nota = "Incluye descartados, que no se cuentan en los gráficos.",
                        items = items(clas, c("Confirmado", "Probable", "Descartado")))),
    extra = list(Defunciones = sum(nzchar(trimws(ifelse(is.na(X$FECHA_DEF), "", X$FECHA_DEF))) & X$ANO == ANIO)))
  modulos_ind[[ev[[1]]]]$origen <- list(autoctonos = aut, importados = nrow(XA) - aut)
  # Variantes por origen (aproximado por distrito de residencia dentro o fuera de la jurisdicción)
  for (suf in c("__aut", "__imp")) {
    sub <- if (suf == "__aut") X[X$UBIGEO %in% RED_UB, ] else X[!X$UBIGEO %in% RED_UB, ]
    if (nrow(sub)) modulos_ind[[paste0(ev[[1]], suf)]] <- modulo_ind(ev[[2]], sub, modulos_ind[[ev[[1]]]]$fuente, ev[[6]], "DIAS", "UBIGEO", list(),
      list(Defunciones = sum(nzchar(trimws(ifelse(is.na(sub$FECHA_DEF), "", sub$FECHA_DEF))) & sub$ANO == ANIO)))
  }
}
for (cie in sort(unique(ind$DIAGNOSTIC[!usados]))) {     # diagnósticos nuevos aún no listados en EVENTOS
  T <- ind[!usados & ind$DIAGNOSTIC == cie, ]; X <- T[T$TIPO_DX != "D", ]
  e <- ficha_evento(paste0("cie_", cie), titulo(ifelse(is.na(cie_nom[cie]), cie, cie_nom[cie])), T, X, "otros", NA); e$ultimo <- NA
  eventos[[length(eventos) + 1]] <- e
}

# ---------- Lesiones por accidente de tránsito ----------
L <- lee_xls(busca(RUTA_BASES, "lesiones.*transito.*\\.xlsx$"))
s <- se_de(as.Date(L$FEC_ACCD, format = "%d/%m/%Y")); L$ANO_SE <- s[, 1]; L$SE_ <- s[, 2]
L <- prep(L, "ANO_SE", "SE_", "COD_EESS"); L <- L[L$ANO == ANIO, ]     # 1–3 de enero pueden caer en la SE 53 del año anterior
al_mapa("lesiones", L, "UBIGEO_AC"); L$SEXO_N <- substr(toupper(L$SEXO), 1, 1); L$CURSO <- curso(ifelse(L$TIPO_EDAD == "A", num1(L$EDAD), 0))
rep_na <- function(x, de = NULL, a = NULL) { x[is.na(x) | x == ""] <- "Sin dato"; if (!is.null(de)) x[x %in% de] <- a[match(x[x %in% de], de)]; x }
mod_les <- modulo_ind("Lesiones por accidente de tránsito", L,
  "Vigilancia de lesiones por accidentes de tránsito – fecha del accidente; por establecimiento que atendió",
  res_col = "UBIGEO_AC", unidad = "lesionados",
  distrib = list(
    list(titulo = "Gravedad (diagnóstico principal)", items = items(rep_na(L$DX1_CATEG, "Pot.Grave", "Potencialmente grave"), c("Leve", "Potencialmente grave", "Grave", "Sin dato"))),
    list(titulo = "Momento del accidente", items = items(rep_na(L$MOME_ACCID, "Manana", "Mañana"), c("Madrugada", "Mañana", "Tarde", "Noche", "Sin dato"))),
    list(titulo = "Día de la semana", items = items(rep_na(L$DIA_ACCD, c("Miercoles", "Sabado"), c("Miércoles", "Sábado")),
                                                    c("Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo")))),
  extra = list("Accidentes (eventos)" = length(unique(L$EVENTO))))
mod_les$nota_residencia <- "Distrito donde ocurrió el accidente."

# ---------- Diabetes ----------
B <- lee_xls(busca(RUTA_BASES, "diabetes.*\\.xlsx$"))
B <- prep(B, "ANO", "SEMANA", "EESS"); B <- B[B$ANO == ANIO, ]
al_mapa("diabetes", B, "UBIGEO_RES"); B$SEXO_N <- c("1" = "M", "2" = "F")[B$SEXO]; B$CURSO <- curso(num1(B$EDAD))
hb <- num1(B$HEMOGLIC); hb <- hb[!is.na(hb) & hb > 0]
comor <- list("HTA" = "HTA", "Obesidad" = "OBESIDAD", "Dislipidemia" = "DISPLIDEMIA", "Nefropatía" = "NEFROPATIA", "Neuropatía" = "NEUROPATIA",
              "Pie diabético sin amputación" = "SINAMPUTACION", "Pie diabético con amputación" = "CONAMPUTACION",
              "Retinopatía" = c("NOPROLIFERATIVA", "PROLIFERATIVA"), "Enf. isquémica cardiaca" = "ENFISQUEMICA", "Enf. cerebrovascular" = "ENFCEREBROVASCULAR")
cm <- sapply(comor, function(c) sum(num(B, c) > 0)); cm <- sort(cm, decreasing = TRUE)
mod_dm <- modulo_ind("Diabetes", B, "Vigilancia centinela de diabetes – semana de captación; por establecimiento",
  res_col = "UBIGEO_RES", unidad = "casos",
  distrib = list(
    list(titulo = "Comorbilidades y complicaciones", nota = paste0("Casos de ", ANIO, " con cada condición registrada (un caso puede tener varias)."),
         items = unname(lapply(names(cm), function(k) list(k, as.integer(cm[[k]]))))),
    list(titulo = "Tipo de caso", items = items(rep_na(c("1" = "Incidente (nuevo)", "2" = "Prevalente")[B$TCASO])))),
  extra = list("Con HbA1c registrada" = length(hb), "HbA1c < 7 % (controlados)" = sum(hb < 7)))
mod_dm$nota_residencia <- "Distrito de residencia."

# ---------- Bases opcionales: se usan solo si están en la carpeta ----------
opcional <- function(patron) { f <- sort(list.files(RUTA_BASES, pattern = patron, full.names = TRUE, ignore.case = TRUE)); if (length(f)) tail(f, 1) else NULL }
extra_mod <- list(); extra_ev <- list()
ficha_simple <- function(id, nombre, cie, unidad, d) list(id = id, nombre = nombre, cie = cie, unidad = unidad, modulo = id,
  por_anio = setNames(list(nrow(d)), ANIO), total = nrow(d), descartados = 0, ultimo = if (nrow(d)) list(anio = ANIO, se = max(d$SEMANA)) else NA)
si <- function(d, col) if (col %in% names(d)) sum(toupper(ifelse(is.na(d[[col]]), "", d[[col]])) == "S") else 0L
lista_cnt <- function(v) { v <- v[order(-sapply(v, `[[`, 2))]; unname(v) }

# Muerte fetal y neonatal
fm <- opcional("mnp.*\\.xlsx$")
if (!is.null(fm)) {
  N <- prep(lee_xls(fm), "ANIO", "SEMANA", "E_SALUD"); N <- N[N$ANO == ANIO, ]
  N$SEXO_N <- substr(toupper(N$SEXO), 1, 1); N$CURSO <- "Sin dato"; N$DIAGNOSTIC <- N$TIPO_MTE
  eg <- num1(N$EDADGES); me <- num1(N$MADRE_EDAD)
  EG <- rep_na(as.character(cut(eg, c(0, 27, 31, 36, 60), labels = c("< 28 semanas", "28–31 semanas", "32–36 semanas", "37 semanas o más"))))
  ME <- rep_na(as.character(cut(me, c(0, 17, 34, 60), labels = c("Adolescente (< 18)", "18–34 años", "35 años o más"))))
  cap <- function(x) { x <- tolower(x); paste0(toupper(substr(x, 1, 1)), substring(x, 2)) }
  m <- modulo_ind("Muerte fetal y neonatal", N, "Vigilancia de muerte fetal y neonatal – semana de notificación; por establecimiento notificante",
    res_col = "UBIGEO_RES", unidad = "defunciones",
    distrib = list(
      list(titulo = "Grupo de causa básica", items = items(rep_na(cap(N$CATEGORIA)))),
      list(titulo = "Momento de la muerte", items = items(rep_na(c("1" = "Anteparto", "2" = "Intraparto", "3" = "Posparto (neonatal)")[N$MOMENTO]), c("Anteparto", "Intraparto", "Posparto (neonatal)"))),
      list(titulo = "Peso al nacer", items = items(rep_na(cap(N$CATPESO2)), c("Extremo bajo peso", "Muy bajo peso", "Bajo peso", "Normal", "Sin dato"))),
      list(titulo = "Edad gestacional", items = items(EG, c("< 28 semanas", "28–31 semanas", "32–36 semanas", "37 semanas o más", "Sin dato"))),
      list(titulo = "Edad de la madre", items = items(ME, c("Adolescente (< 18)", "18–34 años", "35 años o más", "Sin dato"))),
      list(titulo = "Lugar del parto", items = items(rep_na(c(PI = "Institucional", PD = "Domiciliario")[N$LUGAR_PAR])))),
    extra = list("Muertes neonatales" = sum(N$TIPO_MTE == "N", na.rm = TRUE), "Muertes fetales" = sum(N$TIPO_MTE == "F", na.rm = TRUE),
                 "Evitables (según registro)" = sum(N$EVITABLE == "SI", na.rm = TRUE)))
  m$sin_curso <- TRUE; m$nota_residencia <- "Distrito de residencia de la madre."
  extra_mod$mnp <- m; al_mapa("mnp", N, "UBIGEO_RES")
  extra_ev[[length(extra_ev) + 1]] <- ficha_simple("mnp", "Muerte fetal y neonatal", "P00–P96 y otras", "materno-perinatal", N)
}

# Violencia familiar
fv <- opcional("vfamiliar.*\\.xlsx$")
if (!is.null(fv)) {
  V <- lee_xls(fv)
  s <- se_de(as.Date(substr(V$FREG, 1, 10))); V$ANO_SE <- s[, 1]; V$SE_ <- s[, 2]
  V <- prep(V, "ANO_SE", "SE_", "ESTABLEC"); V <- V[V$ANO == ANIO, ]
  V$SEXO_N <- substr(toupper(V$SEXO), 1, 1); V$CURSO <- curso(ifelse(V$T_EDAD == "A", num1(V$EDAD), 0))
  vinc <- rep_na(V$VINCULO); vinc <- gsub("(a)", "", vinc, fixed = TRUE); vinc <- gsub("CONYUGUE", "CÓNYUGE", vinc)
  vinc <- paste0(substr(vinc, 1, 1), tolower(substring(vinc, 2)))
  m <- modulo_ind("Violencia familiar", V, "Vigilancia de violencia familiar – fecha de registro; por establecimiento",
    res_col = "UBIGEO2", unidad = "casos",
    distrib = list(
      list(titulo = "Tipo de violencia", nota = "Un caso puede tener más de un tipo.",
           items = lista_cnt(list(list("Psicológica", si(V, "PSICOL")), list("Física", si(V, "FISICA")), list("Sexual", si(V, "RELSEX")), list("Abandono", si(V, "ABAND"))))),
      list(titulo = "Vínculo con la persona agresora", items = items(vinc)),
      list(titulo = "Circunstancias", nota = "Casos con cada condición registrada (puede haber varias).",
           items = lista_cnt(list(list("Agresor con alcohol", si(V, "ALCOHOL")), list("Agresor con drogas", si(V, "DROGA")), list("Ocurrió en la casa", si(V, "CASA")),
                                  list("Ocurrió en la calle", si(V, "CALLE")), list("Víctima gestante", si(V, "GESTA")), list("Primera vez", si(V, "PRIMVEZ")))))),
    extra = list("Mujeres" = sum(V$SEXO_N == "F", na.rm = TRUE), "Derivados" = si(V, "DERIVADO"), "Con denuncia policial" = si(V, "DENUNPOLIC")))
  m$nota_residencia <- "Distrito de residencia de la víctima."
  extra_mod$violencia <- m; al_mapa("violencia", V, "UBIGEO2", "LOCAL")
  extra_ev[[length(extra_ev) + 1]] <- ficha_simple("violencia", "Violencia familiar", "T74, Y05–Y07", "violencia", V)
}

modulos <- c(list(eda = mod_eda, ira = mod_ira, feb = mod_feb), modulos_ind, list(lesiones = mod_les, diabetes = mod_dm), extra_mod)

# Salud mental: listas exportadas del aplicativo (se publican solo conteos de personas)
lista_tsv <- function(f) {
  x <- tryCatch(read.delim(f, fileEncoding = "UTF-16LE", colClasses = "character", check.names = FALSE),
                error = function(e) read.delim(f, fileEncoding = "latin1", colClasses = "character", check.names = FALSE))
  x <- x[, !grepl("^(X|V)\\d*$|^$", names(x)), drop = FALSE]; names(x) <- toupper(trimws(gsub("^\ufeff", "", names(x)))); x
}
personas <- function(x) toupper(paste(trimws(x$APEPAT), trimws(x$APEMAT), trimws(x$NOMBRES), if ("DNI" %in% names(x)) x$DNI else "", sep = "|"))
fmt_es <- function(v, d = 1) format(round(v, d), nsmall = d, decimal.mark = ",", big.mark = "\u00a0")
registros <- list()
f <- opcional("Depresion.*\\.xls")
if (!is.null(f)) { x <- lista_tsv(f); x <- x[!duplicated(personas(x)), ]; n <- nrow(x)
  seg <- if ("1ER SEGUIMIENTO" %in% names(x)) sum(nzchar(trimws(ifelse(is.na(x[["1ER SEGUIMIENTO"]]), "", x[["1ER SEGUIMIENTO"]])))) else NA
  det <- if (is.na(seg)) list() else list(list("Con primer seguimiento registrado", seg, paste0(fmt_es(seg / n * 100), " % del registro")),
                                          list("Sin primer seguimiento", n - seg, "pendientes de seguimiento"))
  registros[[length(registros) + 1]] <- list(unidad = "salud-mental", nombre = "Episodio depresivo moderado y grave", n = n, medida = "personas en el registro", detalle = det) }
f <- opcional("Psicotico.*\\.xls")
if (!is.null(f)) { x <- lista_tsv(f); x <- x[!duplicated(personas(x)), ]
  dias <- if ("FECHA" %in% names(x)) num1(sub("^\\D*(\\d+).*$", "\\1", x$FECHA)) else numeric(0); dias <- dias[!is.na(dias)]
  det <- if (length(dias)) list(list("Más de 1 año sin atención", sum(dias > 365), "según días desde la última atención"),
                                list("Mediana desde la última atención", paste(fmt_es(median(dias), 0), "días"), "")) else list()
  registros[[length(registros) + 1]] <- list(unidad = "salud-mental", nombre = "Primer episodio psicótico", n = nrow(x), medida = "personas en el registro", detalle = det) }
f <- opcional("suicidio.*\\.xls")
if (!is.null(f)) { x <- lista_tsv(f)
  registros[[length(registros) + 1]] <- list(unidad = "salud-mental", nombre = "Intento de suicidio", n = sum(!duplicated(personas(x))), medida = "personas en el registro", detalle = list()) }
eventos[[length(eventos) + 1]] <- list(id = "lesiones", nombre = "Lesiones por accidente de tránsito", cie = "V01–V89", unidad = "no-transmisibles",
  modulo = "lesiones", por_anio = setNames(list(nrow(L)), ANIO), total = nrow(L), descartados = 0, ultimo = list(anio = ANIO, se = max(L$SEMANA)))
eventos[[length(eventos) + 1]] <- list(id = "diabetes", nombre = "Diabetes", cie = "E10–E14", unidad = "no-transmisibles",
  modulo = "diabetes", por_anio = setNames(list(nrow(B)), ANIO), total = nrow(B), descartados = 0, ultimo = list(anio = ANIO, se = max(B$SEMANA)))

eventos <- c(eventos, extra_ev)

# ---------- Brotes, epizootias y EVISAP (solo jurisdicción de la Red; no se publican datos de quien notifica) ----------
norm_txt <- function(x) toupper(trimws(iconv(ifelse(is.na(x), "", x), to = "ASCII//TRANSLIT")))
evento_brote <- function(diag, tipo) {
  d <- norm_txt(diag)
  reglas <- list(c("MAN", "PIE", "Enfermedad mano, pie y boca"), c("ALIMENTO", "", "Enfermedad transmitida por alimentos (ETA)"), c("RABIA HUMANA", "", "Rabia humana"),
                 c("RABIA", "", "Rabia animal"), c("SARAMPION", "", "Sarampión"), c("VARICELA", "", "Varicela"), c("TOS FERINA", "", "Tos ferina"),
                 c("FIEBRE AMARILLA", "", "Fiebre amarilla"), c("DENGUE", "", "Dengue"), c("ERUPCION", "", "Síndrome febril con erupción dérmica"),
                 c("HEMORR", "", "Síndrome febril con manifestaciones hemorrágicas"), c("DIFTERIA", "", "Difteria"), c("TETANOS", "", "Tétanos"), c("PARALISIS FLACIDA", "", "Parálisis flácida aguda"))
  for (r in reglas) if (grepl(r[1], d, fixed = TRUE) && grepl(r[2], d, fixed = TRUE)) return(r[3])
  if (!nzchar(d)) return(if (tipo == "EPIZOOTIA") "Epizootia (sin especificar)" else "Sin especificar")
  paste0(substr(d, 1, 1), tolower(substring(d, 2)))
}
f10 <- function(x) { x <- ifelse(is.na(x), "", trimws(x)); ifelse(!nzchar(x), NA, ifelse(substr(x, 3, 3) == "/", paste0(substr(x, 7, 10), "-", substr(x, 4, 5), "-", substr(x, 1, 2)), substr(x, 1, 10))) }
brotes <- NULL
fb <- list.files(RUTA_BASES, pattern = "brotes.*\\.csv$", full.names = TRUE, ignore.case = TRUE)
fi <- fb[grepl("indicador", fb, ignore.case = TRUE)]; fb <- setdiff(fb, fi)
if (length(fb)) {
  Bt <- read.csv(tail(sort(fb), 1), colClasses = "character", fileEncoding = "UTF-8"); names(Bt) <- tolower(trimws(names(Bt)))
  Bt <- Bt[Bt$cod_dist %in% unique(E$UBIGEO_RN), ]
  I <- if (length(fi)) read.csv(tail(sort(fi), 1), colClasses = "character") else data.frame(id = character(0))
  names(I) <- tolower(trimws(names(I)))
  g <- function(id, col) { v <- I[[col]][match(id, I$id)]; if (length(v) == 0 || is.na(v) || v == "") NA else v }
  n0 <- function(v) { v <- suppressWarnings(as.numeric(v)); if (is.na(v)) 0L else as.integer(v) }
  lista <- lapply(seq_len(nrow(Bt)), function(i) { r <- Bt[i, ]; id <- r$id; tipo <- toupper(trimws(r$clasificacion_evento))
    ini <- identical(g(id, "informe_inicial"), "1"); seg <- identical(g(id, "informe_seguimiento"), "1"); fin <- identical(g(id, "informe_final"), "1")
    hn <- g(id, "diferencia_horas_notif_conoc"); hi <- g(id, "horas_carga_informe"); on <- g(id, "ind_oportunidad_notificacion"); oi <- g(id, "ind_oportunidad_informe_inicial")
    list(id = id, tipo = tipo, evento = evento_brote(r$diagnostico, tipo), grupo = trimws(r$grupo_danio),
         inicio = f10(r$fecha_inicio_evento), se_inicio = n0(r$semana_inicio_evento), conocimiento = f10(r$fecha_conocimiento_evento), se = n0(r$semana_conocimiento_evento),
         ubigeo = r$cod_dist, distrito = titulo(r$distrito), provincia = titulo(r$provincia), localidad = ifelse(is.na(r$localidad) | r$localidad == "", "", titulo(r$localidad)),
         eess = ifelse(is.na(r$eess), "", titulo(r$eess)), casos = n0(r$numero_casos), hosp = n0(r$numero_hospitalizados), fall = n0(r$numero_fallecidos),
         muestra = identical(r$toma_muestra, "S"), estado = if (fin) "Cerrado" else if (seg) "En curso" else if (ini) "Inicial" else "Sin informe",
         inf = list(inicial = if (ini) f10(g(id, "fecha_informe_inicial")) else NA, seguimiento = if (seg) f10(g(id, "fecha_informe_seguimiento")) else NA, final = if (fin) f10(g(id, "fecha_informe_final")) else NA),
         horas_notif = if (is.na(hn)) NA else n0(hn), horas_inicial = if (is.na(hi)) NA else n0(hi),
         oport_notif = if (is.na(on)) NA else on == "1", oport_inicial = if (is.na(oi)) NA else oi == "1",
         lat = if ("latitud" %in% names(r)) num1(r$latitud) else NA, lon = if ("longitud" %in% names(r)) num1(r$longitud) else NA) })
  lista <- lista[order(sapply(lista, function(b) ifelse(is.na(b$conocimiento), "", b$conocimiento)), decreasing = TRUE)]
  brotes <- list(lista = lista, fuente = "Notificación de brotes, epizootias y EVISAP – Red Integrada de Salud Chachapoyas")
}

# ---------- Establecimientos y microredes con datos ----------
cods <- unique(unlist(lapply(modulos, function(m) setdiff(names(m$series), c("TOTAL", grep("^MR", names(m$series), value = TRUE))))))
eess <- lapply(cods, function(c) list(cod = c, nombre = ifelse(is.na(nom_es[c]), paste("EE.SS.", c), nom_es[[c]]),
                                       mr = paste0("MR", ifelse(is.na(mr_es[c]), "??", mr_es[[c]])), pob = NA))
eess <- eess[order(sapply(eess, `[[`, "nombre"))]
mrs <- sort(unique(sapply(eess, `[[`, "mr")))
microredes <- lapply(mrs, function(k) { c <- substring(k, 3)
  list(cod = k, nombre = if (c == "99") nom_mr[["99"]] else paste("Microred", ifelse(is.na(nom_mr[c]), c, nom_mr[c]))) })
microredes <- microredes[order(sapply(microredes, `[[`, "cod") == "MR99", sapply(microredes, `[[`, "nombre"))]

# ---------- Datos para el Mapa epidemiológico ----------
ub_es <- setNames(E$UBIGEO_RN, E$COD_EST)
for (k in c("eda", "ira", "feb")) { d <- get(k); d <- d[d$ANO == ANIO, ]; d$UB <- ub_es[d$E_SALUD]; al_mapa(k, d[!is.na(d$UB), ], "UB", NULL, "V") }
LOC <- lee_csv(busca(RUTA_MAESTROS, "localidades.*\\.csv$")); nom_loc <- setNames(titulo(LOC$NOMBRE), trimws(LOC$CODLOC))
MP <- do.call(rbind, MAPA)
nombres <- setNames(lapply(eventos, `[[`, "nombre"), sapply(eventos, `[[`, "id")); nombres$eda <- "EDA"; nombres$ira <- "IRA < 5 años"; nombres$feb <- "Febriles"
dist_mapa <- list()
for (u in intersect(unique(MP$ub), RED_UB)) {
  g <- MP[MP$ub == u, ]; ev <- list(); loc <- list()
  for (e in unique(g$ev)) { h <- g[g$ev == e, ]; ev[[e]] <- as.integer(round(c(sum(h$v), sum(h$v[h$se > SE - 4]), sum(h$v[h$se > SE - 8 & h$se <= SE - 4])))) }
  gl <- g[nzchar(g$loc), ]
  for (lc in unique(gl$loc)) { n <- ifelse(is.na(nom_loc[lc]), lc, nom_loc[lc]); hl <- gl[gl$loc == lc, ]
    for (e in unique(hl$ev)) { if (is.null(loc[[n]])) loc[[n]] <- list(); loc[[n]][[e]] <- as.integer(round(sum(hl$v[hl$ev == e]))) } }
  dist_mapa[[u]] <- list(ev = ev, loc = if (length(loc)) loc else setNames(list(), character(0)))
}
fu <- MP[!MP$ub %in% RED_UB & nchar(MP$ub) == 6, ]
fuera <- if (nrow(fu)) unname(lapply(split(fu, paste(fu$ev, fu$ub)), function(h) list(ev = h$ev[1], ub = h$ub[1], lugar = nom_dist(h$ub[1]), n = as.integer(round(sum(h$v)))))) else list()
mapa <- list(se = SE, nombres = nombres, colectivos = c("eda", "ira", "feb"), distritos = dist_mapa, fuera = fuera)

anios_datos <- sort(unique(as.integer(unlist(lapply(modulos, function(m) names(m$series$TOTAL))))))
DASH <- list(generado = format(Sys.Date()), anio = ANIO, ref_n = 5, ambito = AMBITO, ambito_corto = "Red",
             anios_datos = anios_datos, microredes = microredes, eess = eess, modulos = modulos, eventos = eventos,
             registros = registros, brotes = brotes, mapa = mapa, registros_nota = paste0("Listas exportadas del aplicativo de vigilancia de salud mental al ", format(Sys.Date(), "%d/%m/%Y"),
               ". Se cuentan personas distintas; son registros acumulados, no casos nuevos del año. La exportación no incluye fecha, establecimiento ni lugar de residencia."))
js <- toJSON(DASH, auto_unbox = TRUE, null = "null", na = "null", digits = NA)
js <- gsub('"anios_datos":(\\d+)', '"anios_datos":[\\1]', js)      # un solo año -> lista
writeLines(paste0("window.DASHBOARD_RED = ", js, ";"), SALIDA, useBytes = TRUE)
cat("Listo:", SALIDA, "· SE", se_eda, se_ira, se_feb, "·", length(eess), "EE.SS. ·", length(microredes), "microredes\n")
