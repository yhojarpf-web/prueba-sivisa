"""Genera data/situacion.js: diapositivas automáticas de "Situación actual" para el carrusel de los portales.

Lee lo que ya publica el sitio (sin datos personales):
  epidemiologia/data/vigilancia_red.js  -> semana epidemiológica, eventos en aumento, brotes
  epidemiologia/data/semanales.js       -> alertas y comunicados recientes (PDF subidos a sus carpetas)
  salud-ambiental/data/agua.js          -> riesgo del agua del último mes
  salud-ambiental/data/vectores.js      -> índice aédico del último mes
Uso: python3 herramientas/situacion.py   (la publicación automática lo ejecuta después de los demás)
"""
import datetime, json, os

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "setiembre", "octubre", "noviembre", "diciembre"]
DIAS_ALERTA = 15

def leer(rel):
    ruta = os.path.join(RAIZ, rel)
    if not os.path.exists(ruta): return None
    s = open(ruta, encoding="utf-8").read()
    i = s.index("=") + 1
    j = s.rstrip().rstrip(";").rstrip()
    return json.loads(j[i:].strip())

def fmt(n): return "{:,}".format(int(n)).replace(",", " ")
def mes_txt(m): a, b = m.split("-"); return MESES[int(b) - 1] + " " + a

hoy = datetime.date.today()
dia = []

# ---------- Alertas y comunicados recientes ----------
docs = (leer("epidemiologia/data/semanales.js") or []) + (leer("epidemiologia/data/catalogo.js") or [])
for sec, etq, color in [("alertas", "Alerta epidemiológica", "#b42318"), ("comunicados", "Comunicado", "#9a3412")]:
    rec = []
    for d in docs:
        if d.get("seccion") != sec or not d.get("fecha"): continue
        try: f = datetime.date.fromisoformat(d["fecha"][:10])
        except ValueError: continue
        if (hoy - f).days <= DIAS_ALERTA: rec.append((f, d))
    for f, d in sorted(rec, key=lambda x: x[0], reverse=True)[:2]:
        dia.append({"tipo": sec, "prioridad": 1 if sec == "alertas" else 2, "etiqueta": etq + " · " + f.strftime("%d/%m/%Y"),
                    "titulo": d.get("titulo", etq), "texto": d.get("descripcion") or "Revise el documento y las acciones recomendadas.",
                    "icono": "alerta", "color": color, "enlace": "epidemiologia/documentos/" + d["archivo"] if d.get("archivo") else "epidemiologia/index.html#" + sec,
                    "portales": ["sivisa", "epidemiologia"], "hasta": (f + datetime.timedelta(days=DIAS_ALERTA)).isoformat()})

V = leer("epidemiologia/data/vigilancia_red.js")
if V:
    anio = str(V.get("anio"))
    # ---------- Brotes sin cierre ----------
    abiertos = [b for b in V.get("brotes", {}).get("lista", []) if b.get("estado") != "Cerrado"]
    if abiertos:
        abiertos.sort(key=lambda b: b.get("conocimiento") or b.get("inicio") or "", reverse=True)
        b0 = abiertos[0]
        lugar = b0.get("localidad") or b0.get("distrito") or "la Red"
        dist = b0.get("distrito") or ""
        donde = lugar + ("" if not dist or dist.lower() == lugar.lower() else ", distrito de " + dist)
        txt = "El más reciente: %s en %s (SE %s), con %s %s." % (b0["evento"], donde, b0.get("se"), fmt(b0.get("casos") or 0), "caso" if b0.get("casos") == 1 else "casos")
        n_br = sum(1 for b in abiertos if b.get("tipo") == "BROTE"); n_ep = len(abiertos) - n_br
        partes = ([("%d %s" % (n_br, "brote" if n_br == 1 else "brotes"))] if n_br else []) + ([("%d %s" % (n_ep, "epizootia" if n_ep == 1 else "epizootias"))] if n_ep else [])
        dia.append({"tipo": "brotes", "prioridad": 3, "etiqueta": "Brotes", "titulo": " y ".join(partes) + " sin cierre en la Red",
                    "texto": txt + " Revise el estado y los informes de cada uno.", "icono": "alerta", "color": "#c2410c",
                    "enlace": "epidemiologia/index.html#brotes", "portales": ["sivisa", "epidemiologia"]})
    # ---------- Semana epidemiológica y eventos en aumento ----------
    mods = {k: m for k, m in V.get("modulos", {}).items() if "__" not in k}
    se = max((m.get("se_corte") or 0) for m in mods.values()) if mods else 0
    if se:
        def serie(k): return (mods[k]["series"].get("TOTAL", {}).get(anio) or [])
        sindr = []
        for k, nom in [("eda", "EDA"), ("ira", "IRA en menores de 5 años"), ("feb", "febriles")]:
            if k in mods and len(serie(k)) >= se: sindr.append("%s %s" % (fmt(serie(k)[se - 1]), nom))
        aumento = []
        for k, m in mods.items():
            s = serie(k)
            if len(s) < se or se < 5: continue
            ult, prev = s[se - 1], s[se - 5:se - 1]
            media = sum(prev) / 4.0
            minimo = 10 if k in ("eda", "ira", "feb") else 5
            if ult >= minimo and ult >= media * 1.3 and ult - media >= 3:
                aumento.append((ult / media if media else 9, "%s (%s frente a un promedio de %s)" % (m.get("corto") or m.get("titulo"), fmt(ult), fmt(round(media)))))
        aumento.sort(reverse=True)
        if aumento:
            dia.append({"tipo": "aumento", "prioridad": 4, "etiqueta": "En aumento · SE %d-%s" % (se, anio),
                        "titulo": "Eventos en aumento esta semana", "texto": "Comparado con las 4 semanas anteriores: " + "; ".join(t for _, t in aumento[:3]) + ".",
                        "icono": "grafico", "color": "#a16207", "enlace": "epidemiologia/index.html#dashboard", "portales": ["sivisa", "epidemiologia"]})
        if sindr:
            dia.append({"tipo": "notificacion", "prioridad": 5, "etiqueta": "Notificación · SE %d-%s" % (se, anio),
                        "titulo": "Semana epidemiológica %d en la Red" % se, "texto": "Se notificaron " + ", ".join(sindr[:-1]) + (" y " if len(sindr) > 1 else "") + sindr[-1] + ". Revise la sala situacional dinámica.",
                        "icono": "grafico", "color": "#0b4e96", "enlace": "epidemiologia/index.html#dashboard", "portales": ["sivisa", "epidemiologia"]})

# ---------- Agua ----------
A = leer("salud-ambiental/data/agua.js")
if A and A.get("meses"):
    m = A["meses"][-1]; prev = A["meses"][-2] if len(A["meses"]) > 1 else None
    niv = A.get("niveles", ["BAJO", "MEDIO", "ALTO", "MUY ALTO"])
    c = {n: 0 for n in niv}; mon = peor = 0
    for k, r in A.get("reg", {}).items():
        x = r.get(m)
        if not x: continue
        mon += 1; c[x[0]] = c.get(x[0], 0) + 1
        if prev and r.get(prev) and niv.index(x[0]) > niv.index(r[prev][0]): peor += 1
    if mon:
        txt = "%s de %s sistemas monitoreados en riesgo muy alto%s." % (fmt(c.get("MUY ALTO", 0)), fmt(mon), (" y %s en riesgo alto" % fmt(c["ALTO"])) if c.get("ALTO") else "")
        if prev: txt += " %s empeoraron frente a %s." % (fmt(peor), mes_txt(prev))
        dia.append({"tipo": "agua", "prioridad": 6, "etiqueta": "Calidad del agua · " + mes_txt(m), "titulo": "Riesgo del agua en las localidades de la Red",
                    "texto": txt, "icono": "gota", "color": "#0f6b62", "enlace": "salud-ambiental/index.html#agua", "portales": ["sivisa", "salud-ambiental"]})

# ---------- Aedes aegypti ----------
VE = leer("salud-ambiental/data/vectores.js")
X = ((VE or {}).get("aedes") or {}).get("indices") or {}
if X.get("meses"):
    m = X["meses"][-1]["m"]; act = X["meses"][-1].get("act") or ""
    es = X.get("escala") or [1, 2]
    nom = {e["cod"]: e["eess"] for e in VE["aedes"].get("escenarios", [])}
    s = [0, 0]; altos = []
    for cod, r in X.get("reg", {}).items():
        v = r.get(m)
        if not v or not v[1]: continue
        s[0] += v[1] or 0; s[1] += v[2] or 0
        if (v[2] or 0) / v[1] * 100 > es[1]: altos.append(nom.get(cod, cod))
    if s[0]:
        ia = s[1] / s[0] * 100
        nivel = "bajo" if ia < es[0] else "mediano" if ia <= es[1] else "alto"
        txt = "Índice aédico de la Red: %s (riesgo %s)%s." % (("%.2f" % ia).replace(".", ","), nivel, (" · " + act.lower()) if act else "")
        txt += (" En alto riesgo: " + ", ".join(sorted(altos)) + ".") if altos else " Ningún establecimiento en alto riesgo."
        dia.append({"tipo": "aedes", "prioridad": 7, "etiqueta": "Aedes aegypti · " + mes_txt(m), "titulo": "Vigilancia del zancudo del dengue",
                    "texto": txt, "icono": "mosquito", "color": "#2e4a25" if not altos else "#b45309", "enlace": "salud-ambiental/index.html#control-vectorial", "portales": ["sivisa", "salud-ambiental"]})

dia.sort(key=lambda d: d["prioridad"])
for d in dia: d["auto"] = True
with open(os.path.join(RAIZ, "data", "situacion.js"), "w", encoding="utf-8") as f:
    f.write("/* Generado por herramientas/situacion.py en cada publicación. No editar a mano: las campañas fijas están en data/campanas.js. */\n")
    f.write("window.SITUACION = " + json.dumps({"generado": hoy.isoformat(), "diapositivas": dia}, ensure_ascii=False, indent=1) + ";\n")
for d in dia: print("-", d["etiqueta"], "|", d["titulo"], "|", d["texto"][:110])
