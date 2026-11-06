#!/usr/bin/env python3
"""Recorre documentos/<carpeta>/<AÑO>/SEnn/*.pdf (boletines, salas) y documentos/<carpeta>/<AÑO>/*.pdf (alertas, reportes, comunicados) y escribe data/semanales.js.
Lo ejecuta GitHub automáticamente al publicar (.github/workflows/publicar.yml).
Para agregar otra carpeta semanal, añádala a CARPETAS: "carpeta": ("id de sección", "título por defecto")."""
import os, re, json, subprocess, datetime

CARPETAS = {
    "boletines": ("boletines", "Boletín epidemiológico"),
    "salas": ("sala-estatica", "Sala situacional de salud"),
}
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))      # .../epidemiologia
DOCS = os.path.join(RAIZ, "documentos")
SALIDA = os.path.join(RAIZ, "data", "semanales.js")

def inicio_se1(a):
    d = datetime.date(a, 1, 1); dow = (d.weekday() + 1) % 7
    ini = d - datetime.timedelta(days=dow)
    return ini if dow <= 3 else ini + datetime.timedelta(days=7)

def fecha_git(ruta):
    try:
        out = subprocess.run(["git", "log", "-1", "--format=%cs", "--", ruta], cwd=RAIZ, capture_output=True, text=True, timeout=20).stdout.strip()
        return out or None
    except Exception:
        return None

def titulo_de(nombre, defecto):
    t = os.path.splitext(nombre)[0].replace("_", " ").strip()
    resto = re.sub(r"(?i)\b(se\s*-?\s*\d{1,2}|20\d\d|boletin|boletín|sala|situacional|epidemiologico|epidemiológico|de|del)\b", " ", t)
    if not re.sub(r"[\s\-–·.,]+", "", resto): return defecto
    t = re.sub(r"\s+", " ", t)
    return t[0].upper() + t[1:]

docs = []
for carpeta, (seccion, defecto) in CARPETAS.items():
    base = os.path.join(DOCS, carpeta)
    if not os.path.isdir(base): continue
    for anio in sorted(os.listdir(base)):
        if not re.fullmatch(r"20\d\d", anio): continue
        for sem in sorted(os.listdir(os.path.join(base, anio))):
            m = re.fullmatch(r"(?i)SE\s*0?(\d{1,2})", sem)
            if not m: continue
            se = int(m.group(1)); dir_se = os.path.join(base, anio, sem)
            if not (1 <= se <= 53) or not os.path.isdir(dir_se): continue
            for f in sorted(os.listdir(dir_se)):
                if not f.lower().endswith(".pdf"): continue
                ruta = os.path.join(dir_se, f)
                ini = inicio_se1(int(anio)) + datetime.timedelta(days=7 * (se - 1)); fin = ini + datetime.timedelta(days=6)
                fecha = fecha_git(ruta) or datetime.date.fromtimestamp(os.path.getmtime(ruta)).isoformat()
                docs.append({"titulo": titulo_de(f, defecto), "seccion": seccion, "vigilancia": "General", "se": se, "anio": int(anio),
                             "descripcion": "Semana epidemiológica %d-%s: del %s al %s" % (se, anio, ini.strftime("%d/%m"), fin.strftime("%d/%m/%Y")),
                             "fecha": fecha, "archivo": "/".join([carpeta, anio, sem, f]), "semanal": True})
# Carpetas sin semanas: documentos/<carpeta>/<AÑO>/*.pdf (alertas, reportes, comunicados)
# Fecha: si el nombre empieza con AAAA-MM-DD se usa esa; si no, la fecha en que se subió.
LIBRES = {
    "alertas": ("alertas", "Alerta epidemiológica"),
    "reportes": ("reportes", "Reporte epidemiológico"),
    "comunicados": ("comunicados", "Comunicado"),
}
for carpeta, (seccion, defecto) in LIBRES.items():
    base = os.path.join(DOCS, carpeta)
    if not os.path.isdir(base): continue
    for anio in sorted(os.listdir(base)):
        dir_a = os.path.join(base, anio)
        if not re.fullmatch(r"20\d\d", anio) or not os.path.isdir(dir_a): continue
        for f in sorted(os.listdir(dir_a)):
            if not f.lower().endswith(".pdf"): continue
            ruta = os.path.join(dir_a, f); nombre = os.path.splitext(f)[0]
            m = re.match(r"^(20\d\d)[-_.](\d\d)[-_.](\d\d)[\s_\-–]*(.*)$", nombre)
            fecha = "%s-%s-%s" % m.groups()[:3] if m else (fecha_git(ruta) or datetime.date.fromtimestamp(os.path.getmtime(ruta)).isoformat())
            resto = (m.group(4) if m else nombre).replace("_", " ").strip()
            titulo = (resto[0].upper() + resto[1:]) if resto else defecto
            docs.append({"titulo": titulo, "seccion": seccion, "vigilancia": "General", "se": None, "anio": int(anio),
                         "descripcion": "", "fecha": fecha, "archivo": "/".join([carpeta, anio, f]), "carpeta": True, "destacar": True})
# Carpetas sin años: documentos/<carpeta>/*.pdf (fichas por tipo de notificación, directivas y normas)
SIMPLES = {
    "fichas/inmediata": ("fichas-inmediata", "Ficha epidemiológica", False),
    "fichas/semanal": ("fichas-semanal", "Ficha epidemiológica", False),
    "fichas/mensual": ("fichas-mensual", "Ficha epidemiológica", False),
    "normas": ("normas", "Documento normativo", True),
}
for carpeta, (seccion, defecto, destacar) in SIMPLES.items():
    dir_c = os.path.join(DOCS, *carpeta.split("/"))
    if not os.path.isdir(dir_c): continue
    for f in sorted(os.listdir(dir_c)):
        if not f.lower().endswith(".pdf"): continue
        ruta = os.path.join(dir_c, f); nombre = os.path.splitext(f)[0]
        m = re.match(r"^(20\d\d)[-_.](\d\d)[-_.](\d\d)[\s_\-–]*(.*)$", nombre)
        fecha = "%s-%s-%s" % m.groups()[:3] if m else (fecha_git(ruta) or datetime.date.fromtimestamp(os.path.getmtime(ruta)).isoformat())
        resto = (m.group(4) if m else nombre).replace("_", " ").strip()
        docs.append({"titulo": (resto[0].upper() + resto[1:]) if resto else defecto, "seccion": seccion, "vigilancia": "General", "se": None,
                     "anio": int(fecha[:4]), "descripcion": "", "fecha": fecha, "archivo": carpeta + "/" + f, "carpeta": True, "destacar": destacar})
docs.sort(key=lambda d: (d["anio"], d["se"] or 0, d["fecha"]), reverse=True)
for i, d in enumerate(docs): d["id"] = "s%d" % (i + 1)
with open(SALIDA, "w", encoding="utf-8") as fh:
    fh.write("/* Generado automáticamente desde las carpetas documentos/<boletines|salas>/<año>/SEnn. No editar a mano. */\n")
    fh.write("window.CATALOGO_SEMANAL = " + json.dumps(docs, ensure_ascii=False, indent=1) + ";\n")
print("Documentos semanales:", len(docs), "->", SALIDA)
