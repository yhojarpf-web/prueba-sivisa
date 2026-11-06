"""Clasificación de escenarios de Aedes aegypti de la Red de Salud Chachapoyas -> data/vectores.js

Lee el Excel de salud-ambiental/datos/vectores/escenarios/ (una hoja por escenario: "ESCENARIO I", "ESCENARIO II", "ESCENARIO III"),
se queda solo con los establecimientos de las provincias de la Red y ubica cada uno en su distrito.
Uso: python3 salud-ambiental/herramientas/preparar_vectores.py
"""
import glob, json, math, os, re, unicodedata, datetime
from openpyxl import load_workbook

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SALIDA = os.path.join(RAIZ, "data", "vectores.js")
TERR = os.path.join(os.path.dirname(RAIZ), "epidemiologia", "data", "territorio.js")
PROV_RED = {"CHACHAPOYAS": "Chachapoyas", "LUYA": "Luya", "BONGARA": "Bongará", "RODRIGUEZ DE MENDOZA": "Rodríguez de Mendoza"}
ROM = {"I": 1, "II": 2, "III": 3}
nz = lambda s: re.sub(r"\s+", " ", unicodedata.normalize("NFD", str(s or "")).encode("ascii", "ignore").decode().upper()).strip()
ALIAS_DIST = {"LEIMEBAMBA": "LEIMEBAMBA", "BALZAS": "BALSAS"}
MIN = {"de", "del", "la", "las", "los", "y", "e"}
def titulo(s):
    p = str(s or "").strip().lower().split()
    return " ".join(w if (i and w in MIN) else w[:1].upper() + w[1:] for i, w in enumerate(p))

t = open(TERR, encoding="utf-8").read()
T = json.loads(t[t.index("{"):t.rindex("}") + 1])
dist = {}
for d in T["geo"]["distritos"]:
    if d.get("red"): dist[nz(d["n"])] = d["u"]

archivos = sorted(glob.glob(os.path.join(RAIZ, "datos", "vectores", "escenarios", "*.xlsx")))
eess, avisos = {}, []
for ruta in archivos:
    wb = load_workbook(ruta, data_only=True, read_only=True)
    for ws in wb.worksheets:
        m = re.search(r"ESCENARIO\s+(III|II|I)\b", nz(ws.title))
        if not m: continue
        esc = ROM[m.group(1)]
        filas = list(ws.iter_rows(values_only=True))
        h = next(i for i, r in enumerate(filas) if r and any(nz(x) == "PROVINCIA" for x in r))
        cab = [nz(x) for x in filas[h]]
        c = lambda nombre: next(i for i, x in enumerate(cab) if x.startswith(nombre))
        iP, iD, iC, iE, iV = c("PROVINCIA"), c("DISTRITO"), c("CODIGO UNICO"), c("ESTABLECIMIENTO"), c("TOTAL DE VIVIENDAS")
        iM = next((i for i, x in enumerate(cab) if "ALEATORIO" in x or "MUESTRA" in x), None)
        for r in filas[h + 1:]:
            if not r or nz(r[iP]) not in PROV_RED: continue
            cod = str(r[iC] or "").strip().zfill(8)
            dn = ALIAS_DIST.get(nz(r[iD]), nz(r[iD]))
            ub = dist.get(dn)
            if not ub: avisos.append("Distrito no encontrado en el mapa: %s (%s)" % (r[iD], r[iE]))
            viv = int(float(r[iV])) if r[iV] not in (None, "") else None
            mu = float(r[iM]) if iM is not None and r[iM] not in (None, "") else 0
            reg = {"cod": cod, "eess": titulo(r[iE]), "prov": PROV_RED[nz(r[iP])], "dist": titulo(r[iD]), "ubigeo": ub or "",
                   "viv": viv, "muestra": math.ceil(mu - 1e-9) if mu > 0 else None, "esc": esc, "listas": [esc]}
            if cod in eess:  # figura en más de un escenario: se conserva el mayor y se deja constancia
                prev = eess[cod]; prev["listas"] = sorted(set(prev["listas"] + [esc]))
                if esc > prev["esc"]: reg["listas"] = prev["listas"]; eess[cod] = reg
            else: eess[cod] = reg
    wb.close()

# ---------- Índices aédicos mensuales: datos/vectores/aedes/AAAA/aedes_AAAA_MM.xlsx ----------
TIPOS = ["Galón / balde / bate / tina", "Barril / cilindro", "Tanque bajo", "Bidón", "Tinas / ollas", "Florero", "Llantas usadas", "Inservibles", "Árboles / huecos", "Otros"]
def num(v):
    try: return None if v in (None, "") else int(round(float(v)))
    except (TypeError, ValueError): return None
meses, reg, escala = [], {}, [1.0, 2.0]
for ruta in sorted(glob.glob(os.path.join(RAIZ, "datos", "vectores", "aedes", "*", "aedes_*.xlsx"))):
    m = re.fullmatch(r"aedes_(\d{4})_(\d{2})\.xlsx", os.path.basename(ruta))
    if not m: continue
    mes = m.group(1) + "-" + m.group(2)
    wb = load_workbook(ruta, data_only=True, read_only=True)
    ws = wb["Indicadores"]
    act = str(ws["C4"].value or "").strip()
    if "Escala_riesgo" in wb.sheetnames:
        e = wb["Escala_riesgo"]
        try: escala = [float(e["C2"].value), float(e["C3"].value)]
        except (TypeError, ValueError): pass
    n = 0
    for r in ws.iter_rows(min_row=8, values_only=True):
        cod = str(r[1] or "").strip()
        if not cod or not re.fullmatch(r"\d{5,8}", cod): continue
        cod = cod.zfill(8)
        vals = [num(x) for x in r[7:22]]
        if vals[1] is None and vals[0] is None: continue
        if cod not in eess: avisos.append("%s: RENAES %s no está en la clasificación de escenarios" % (os.path.basename(ruta), cod))
        reg.setdefault(cod, {})[mes] = vals[:5] + [vals[5:15]]
        n += 1
    wb.close()
    meses.append({"m": mes, "act": act})
    print("%s: %d establecimientos (%s)" % (mes, n, act or "sin actividad"))

# ---------- Lutzomyia: datos/vectores/lutzomyia/(PLANTILLA y AAAA/lutzomyia_AAAA_MM.xlsx) ----------
def txt(v): return re.sub(r"\s+", " ", str(v)).strip() if v is not None else ""
def dec(v):
    try: return None if v in (None, "") else round(float(v), 4)
    except (TypeError, ValueError): return None
L_loc, L_meses, L_reg, L_escala = {}, [], {}, [0.5, 1.0]
base = os.path.join(RAIZ, "datos", "vectores", "lutzomyia")
arch = sorted(glob.glob(os.path.join(base, "PLANTILLA*.xlsx"))) + sorted(glob.glob(os.path.join(base, "*", "lutzomyia_*.xlsx")))
for ruta in arch:
    wb = load_workbook(ruta, data_only=True, read_only=True)
    if "Maestro_localidades" in wb.sheetnames:
        for r in wb["Maestro_localidades"].iter_rows(min_row=2, values_only=True):
            if not r or not txt(r[0]): continue
            L_loc[txt(r[0])] = {"id": txt(r[0]), "prov": txt(r[1]), "dist": txt(r[2]), "ubigeo": txt(r[3]).zfill(6) if txt(r[3]) else "", "mr": txt(r[4]),
                                "eess": txt(r[5]), "loc": txt(r[6]), "activo": txt(r[7]).lower() not in ("no", "n"), "nota": txt(r[8]) if len(r) > 8 else ""}
    if "Escala_riesgo" in wb.sheetnames:
        e = wb["Escala_riesgo"]
        try: L_escala = [float(e["C2"].value), float(e["C3"].value)]
        except (TypeError, ValueError): pass
    m = re.fullmatch(r"lutzomyia_(\d{4})_(\d{2})\.xlsx", os.path.basename(ruta))
    if m and "Indices" in wb.sheetnames:
        mes = m.group(1) + "-" + m.group(2); n = 0
        for r in wb["Indices"].iter_rows(min_row=7, values_only=True):
            idl = txt(r[1]) if r and len(r) > 13 else ""
            if not idl.startswith("LOC"): continue
            v = [num(r[6]), num(r[7]), num(r[8]), dec(r[9]), dec(r[10])]
            if v[0] is None and v[1] is None and v[3] is None: continue
            L_reg.setdefault(idl, {})[mes] = v + [txt(r[13])]; n += 1
        L_meses.append(mes); print("Lutzomyia %s: %d localidades evaluadas" % (mes, n))
    wb.close()

lista = sorted(eess.values(), key=lambda x: (-x["esc"], x["prov"], x["dist"], x["eess"]))
for x in lista:
    if len(x["listas"]) > 1: x["nota"] = "Figura en los listados de escenario " + " y ".join(["I", "II", "III"][e - 1] for e in x["listas"]) + "; se muestra el mayor."
    del x["listas"]
out = {"actualizado": datetime.date.today().isoformat(), "fuente": "Clasificación de escenarios para la vigilancia de Aedes aegypti – Área de Salud Ambiental, Red de Salud Chachapoyas",
       "aedes": {"escenarios": lista, "indices": {"meses": meses, "tipos": TIPOS, "escala": escala, "reg": reg,
                 "campos": ["programadas", "inspeccionadas", "positivas", "recipientes inspeccionados", "recipientes positivos", "positivos por tipo"]}},
       "lutzomyia": {"localidades": [x for x in L_loc.values() if x["activo"] or x["id"] in L_reg], "meses": sorted(set(L_meses)), "escala": L_escala, "reg": L_reg,
                     "campos": ["hembras alimentadas", "hembras sin alimento", "machos", "ICTP", "ITN", "observaciones"],
                     "nota": "Los índices de mayo de 2026 provienen de una única vigilancia; para resultados concluyentes la vigilancia debe ser mensual, lo que no se ha realizado por falta de insumos y personal para actividades de campo en los establecimientos."}}
with open(SALIDA, "w", encoding="utf-8") as f:
    f.write("/* Generado por herramientas/preparar_vectores.py. No editar a mano. */\nwindow.VECTORES = " + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";\n")
for a in avisos: print("AVISO:", a)
from collections import Counter
print("ok", SALIDA, len(lista), "establecimientos", dict(Counter(x["esc"] for x in lista)))
