"""Lee los archivos mensuales de vigilancia de la calidad del agua y genera data/agua.js.

Carpeta: salud-ambiental/datos/agua/AAAA/agua_AAAA_MM.xlsx  (uno por mes, formato de la PLANTILLA_AGUA_MENSUAL.xlsx)
Uso:     python3 salud-ambiental/herramientas/preparar_agua.py
Solo se publican datos agregados por sistema de abastecimiento (sin datos personales).
"""
import json, os, re, sys, datetime
from openpyxl import load_workbook

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CARPETA = os.path.join(RAIZ, "datos", "agua")
SALIDA = os.path.join(RAIZ, "data", "agua.js")
NIVELES = ["BAJO", "MEDIO", "ALTO", "MUY ALTO"]
ALIAS = {"MODERADO": "MEDIO", "MUY_ALTO": "MUY ALTO", "MUYALTO": "MUY ALTO"}
FILA0 = 6  # primera fila de datos en la hoja Monitoreo

def txt(v):
    return re.sub(r"\s+", " ", str(v)).strip() if v is not None else ""

def fecha(v):
    if isinstance(v, datetime.datetime): return v.date().isoformat()
    if isinstance(v, datetime.date): return v.isoformat()
    m = re.match(r"(\d{1,2})[/-](\d{1,2})[/-](\d{4})", txt(v))
    return "%s-%02d-%02d" % (m.group(3), int(m.group(2)), int(m.group(1))) if m else ""

archivos = []
for raiz, _, fs in os.walk(CARPETA):
    for f in fs:
        m = re.fullmatch(r"agua_(\d{4})_(\d{2})\.xlsx", f)
        if m and 1 <= int(m.group(2)) <= 12: archivos.append((m.group(1) + "-" + m.group(2), os.path.join(raiz, f)))
archivos.sort()
if not archivos:
    print("No hay archivos agua_AAAA_MM.xlsx en", CARPETA); sys.exit(0)

sap, reg, avisos = {}, {}, []
for mes, ruta in archivos:
    wb = load_workbook(ruta, data_only=True, read_only=True)
    if "Maestro_SAP" in wb.sheetnames:  # el maestro del archivo más reciente manda
        for r in wb["Maestro_SAP"].iter_rows(min_row=2, values_only=True):
            if not r or not txt(r[0]): continue
            sap[txt(r[0])] = {"prov": txt(r[2]), "dist": txt(r[3]), "ubigeo": txt(r[4]).zfill(6), "ccpp": txt(r[5]), "cod": txt(r[6]).zfill(10) if txt(r[6]) else "",
                              "sap": txt(r[9]), "proveedor": txt(r[10]), "activo": txt(r[14]).lower() not in ("no", "n")}
    ws = wb["Monitoreo"]
    n = 0
    for i, r in enumerate(ws.iter_rows(min_row=FILA0, values_only=True), FILA0):
        if not r or len(r) < 12: continue
        idv, riesgo = txt(r[1]), txt(r[11]).upper()
        riesgo = ALIAS.get(riesgo, riesgo)
        if not idv or not riesgo: continue
        if riesgo not in NIVELES: avisos.append("%s fila %d: riesgo '%s' no reconocido" % (os.path.basename(ruta), i, riesgo)); continue
        if idv not in sap: avisos.append("%s fila %d: %s no está en el Maestro_SAP" % (os.path.basename(ruta), i, idv)); continue
        try: pts = int(float(r[9])) if r[9] not in (None, "") else None
        except ValueError: pts = None
        par = txt(r[10]); par = "" if par.lower() in ("ninguno", "-", "no") else par
        d = reg.setdefault(idv, {})
        prev = d.get(mes)
        nuevo = {"r": riesgo, "f": fecha(r[8]), "p": pts, "x": par, "n": 1}
        if prev:  # segundo monitoreo del mes: se conserva el de mayor riesgo
            nuevo["n"] = prev["n"] + 1
            if NIVELES.index(prev["r"]) > NIVELES.index(riesgo): nuevo.update({k: prev[k] for k in ("r", "f", "p", "x")})
        d[mes] = nuevo; n += 1
    wb.close()
    print("%s: %d registros (%s)" % (mes, n, os.path.relpath(ruta, RAIZ)))

lista = [dict(id=k, **v) for k, v in sorted(sap.items())]
out = {"actualizado": datetime.date.today().isoformat(), "niveles": NIVELES, "meses": [m for m, _ in archivos], "sap": lista,
       "reg": {k: {m: [x["r"], x["f"], x["p"], x["x"], x["n"]] for m, x in v.items()} for k, v in reg.items()}}
os.makedirs(os.path.dirname(SALIDA), exist_ok=True)
with open(SALIDA, "w", encoding="utf-8") as f:
    f.write("/* Generado por herramientas/preparar_agua.py a partir de datos/agua/AAAA/agua_AAAA_MM.xlsx. No editar a mano. */\n")
    f.write("window.AGUA = " + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";\n")
for a in avisos: print("AVISO:", a)
print("ok", SALIDA, len(lista), "sistemas,", len(archivos), "meses")
