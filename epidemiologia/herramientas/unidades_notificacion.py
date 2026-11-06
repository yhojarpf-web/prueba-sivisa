"""Agrega las unidades notificantes (UN) e informantes (UI) por microred a data/unidades/unidades.js.

Fuente: epidemiologia/data/unidades/UNIDADES_NOTIF.xlsx (columnas MICRORRED, UN, UI, TOTAL; última fila TOTAL RIS CHACHAPOYAS).
Las filas que coinciden con una microred del mapa se asignan a su establecimiento cabecera; las demás
(hospitales, CAP de EsSalud, etc.) se listan como "otras unidades".
Uso: python3 epidemiologia/herramientas/unidades_notificacion.py
"""
import json, os, re, unicodedata
from openpyxl import load_workbook

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
XLSX = os.path.join(RAIZ, "data", "unidades", "UNIDADES_NOTIF.xlsx")
JS = os.path.join(RAIZ, "data", "unidades", "unidades.js")
nz = lambda s: re.sub(r"\s+", " ", unicodedata.normalize("NFD", str(s or "")).encode("ascii", "ignore").decode().upper()).strip()
MIN = {"de", "del", "la", "las", "los", "y"}
def titulo(s):
    p = str(s).strip().lower().split()
    t = " ".join(w if (i and w in MIN) else (w.upper() if re.fullmatch(r"cap\d", w) else w[:1].upper() + w[1:]) for i, w in enumerate(p))
    return t.replace("Essalud", "EsSalud")

if not os.path.exists(XLSX): print("No existe", XLSX); raise SystemExit
s = open(JS, encoding="utf-8").read()
cab_js = s[:s.index("window.UNIDADES")]
U = json.loads(s[s.index("{"):s.rindex("}") + 1])

ws = load_workbook(XLSX, data_only=True, read_only=True).worksheets[0]
filas = [r for r in ws.iter_rows(values_only=True) if any(v is not None for v in r)]
h = next(i for i, r in enumerate(filas) if any(nz(v).startswith("MICRO") for v in r))
cab = [nz(v) for v in filas[h]]
iM = next(i for i, v in enumerate(cab) if v.startswith("MICRO")); iN = cab.index("UN"); iI = cab.index("UI")
datos, total = [], None
for r in filas[h + 1:]:
    if not r[iM]: continue
    n, i_ = int(r[iN] or 0), int(r[iI] or 0)
    if nz(r[iM]).startswith("TOTAL"): total = (n, i_); continue
    datos.append((r[iM], n, i_))

for p in U["puntos"]: p.pop("notificantes", None); p.pop("informantes", None)
otras = []
for nombre, n, i_ in datos:
    k = nz(nombre)
    p = next((p for p in U["puntos"] if p.get("tipo") == "cabecera" and (nz(p.get("microred")) == k or k.startswith(nz(p.get("microred"))) and len(nz(p.get("microred"))) >= 4)), None)
    if p: p["notificantes"], p["informantes"] = n, i_
    else: otras.append({"nombre": titulo(nombre), "notificantes": n, "informantes": i_})
sn, si = sum(d[1] for d in datos), sum(d[2] for d in datos)
U["resumen"] = {"notificantes": sn, "informantes": si, "nota": "Unidades notificantes e informantes por microred, Oficina de Epidemiología " + str(2026)}
if total and total != (sn, si): print("AVISO: la fila TOTAL del Excel (%s/%s) no coincide con la suma (%s/%s)" % (total[0], total[1], sn, si))
U["otras_unidades"] = otras
with open(JS, "w", encoding="utf-8") as f:
    f.write(cab_js + "window.UNIDADES = " + json.dumps(U, ensure_ascii=False, indent=1) + ";\n")
print("ok", sn, "notificantes,", si, "informantes ·", sum(1 for p in U["puntos"] if "notificantes" in p), "microredes ·", len(otras), "otras:", [o["nombre"] for o in otras])
