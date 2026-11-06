# Población (REUNIS/INEI) + límites distritales de Amazonas -> data/territorio.js
# Uso: python3 -I preparar_territorio.py <POBLACION.xlsx> <distrito_simplificado.geojson> <departamento_simplificado.geojson> <maestros> <salida.js>
import sys, json, math, re, unicodedata
import pandas as pd

XLS, GDIST, GDEP, MAES, OUT = sys.argv[1:6]
norm = lambda s: re.sub(r'\s+', ' ', unicodedata.normalize('NFD', str(s)).encode('ascii', 'ignore').decode().upper().strip())
def titulo(s):
    s = str(s).strip().title()
    for a, b in [(' De ', ' de '), (' Del ', ' del '), ('Maria', 'María'), ('Tomas', 'Tomás'), ('Fatima', 'Fátima'), ('Asuncion', 'Asunción'), (' La ', ' la '), (' Y ', ' y '), (' El ', ' el '), (' Los ', ' los '), (' Las ', ' las ')]: s = s.replace(a, b)
    return s

# ---------- Columnas del Excel ----------
H_SIMPLE, H_QUIN = list(range(47, 67)), list(range(67, 81))      # hombres: 0-19 simples, 20-24 ... 85+
M_SIMPLE, M_QUIN = list(range(86, 106)), list(range(106, 120))   # mujeres
GRUPOS = ['0-4', '5-9', '10-14', '15-19', '20-24', '25-29', '30-34', '35-39', '40-44', '45-49', '50-54', '55-59', '60-64', '65-69', '70-74', '75-79', '80-84', '85+']
def num(r, c):
    try: return int(float(r[c]))
    except Exception: return 0
def fila(r):
    hs = [num(r, c) for c in H_SIMPLE]; ms = [num(r, c) for c in M_SIMPLE]
    h = [sum(hs[i:i + 5]) for i in range(0, 20, 5)] + [num(r, c) for c in H_QUIN]
    m = [sum(ms[i:i + 5]) for i in range(0, 20, 5)] + [num(r, c) for c in M_QUIN]
    s = [a + b for a, b in zip(hs, ms)]
    return {'total': num(r, 2), 'h': h, 'm': m,
            'esp': {'menor1': s[0], 'de1a4': sum(s[1:5]), 'menor5': sum(s[0:5]), 'de5a11': sum(s[5:12]), 'de12a17': sum(s[12:18]),
                    'de18a29': sum(s[18:20]) + num(r, 23) + num(r, 24), 'de30a59': sum(num(r, c) for c in range(25, 31)),
                    'de60mas': sum(num(r, c) for c in range(31, 37)), 'mef': sum(ms[15:20]) + sum(num(r, c) for c in range(106, 112)),   # mujeres 15-49 (el bloque "POBLACIÓN FEMENINA" del Excel está desfasado)
                    'gestantes': num(r, 124), 'nacimientos': num(r, 40),
                    'hombres': num(r, 46), 'mujeres': num(r, 85)}}
def suma(lst):
    out = {'total': 0, 'h': [0] * 18, 'm': [0] * 18, 'esp': {}}
    for x in lst:
        out['total'] += x['total']; out['h'] = [a + b for a, b in zip(out['h'], x['h'])]; out['m'] = [a + b for a, b in zip(out['m'], x['m'])]
        for k, v in x['esp'].items(): out['esp'][k] = out['esp'].get(k, 0) + v
    return out

# ---------- Maestros ----------
PR = pd.read_csv(MAES + '/provincias.csv', dtype=str); PR = PR[PR.departamento == '01']
DI = pd.read_csv(MAES + '/distritos.csv', dtype=str); DI = DI[DI.departamento == '01']
E = pd.read_csv(MAES + '/establecimientos.csv', dtype=str); E = E[(E.subregion == '36')]
prov_ub = {norm(n): u for u, n in zip(PR.ubigeo, PR.nombre)}
dist_nom = dict(zip(DI.ubigeo, DI.nombre)); prov_nom = dict(zip(PR.ubigeo, PR.nombre))
renaes_cod = {str(r).zfill(8): c for r, c in zip(E.renaes, E.cod_est) if isinstance(r, str)}

# ---------- Hoja por distritos: EE.SS. -> distrito ----------
X = pd.read_excel(XLS, sheet_name='POR DISTRITOS', header=None, dtype=str).iloc[6:]
eess_dist, eess_pob, eess_nom, prov = {}, {}, {}, None
for _, r in X.iterrows():
    c = str(r[0]).strip() if isinstance(r[0], str) else ''
    if c == '00':
        if norm(r[1]) != 'AMAZONAS': prov = prov_ub[norm(r[1])]
        continue
    if re.fullmatch(r'\d{2}', c): dist = prov + c; continue
    if re.fullmatch(r'\d{3,8}', c):
        k = c.zfill(8); eess_dist[k] = dist; eess_pob[k] = fila(r); eess_nom[k] = titulo(r[1])

# Correcciones de distrito confirmadas por la Oficina (el Excel de población las ubica en otro distrito)
CORRIGE_DIST = {'00025129': '010521'}   # P.S. El Puente (MR Yerbabuena) pertenece al distrito de Santo Tomás
for k, d in CORRIGE_DIST.items():
    if k in eess_dist and eess_dist[k] != d: print('Corrección de distrito:', k, eess_dist[k], '->', d); eess_dist[k] = d

# ---------- Hoja por DIRESA: EE.SS. -> microred ----------
Y = pd.read_excel(XLS, sheet_name='POR DIRESA', header=None, dtype=str).iloc[6:]
mr_de, mr_nom, red_total, mr = {}, {}, None, None
for _, r in Y.iterrows():
    c = str(r[0]).strip() if isinstance(r[0], str) else ''
    if not c:
        n = norm(r[1])
        if n.startswith('RED '): red_total = fila(r); continue
        mr = 'MR-' + re.sub(r'[^A-Z0-9]+', '-', n).strip('-').lower()
        mr_nom[mr] = 'Sin microred (hospitales)' if 'NO PERTENECE' in n else 'Microred ' + titulo(r[1])
        continue
    mr_de[c.zfill(8)] = mr

red_eess = sorted(mr_de)
faltan = [k for k in red_eess if k not in eess_dist]
if faltan: print('AVISO: EE.SS. de la Red sin distrito en la hoja POR DISTRITOS:', faltan)
unidades = {}
unidades['RED'] = dict(suma([eess_pob[k] for k in red_eess if k in eess_pob]), nombre='Red Integrada de Salud Chachapoyas', tipo='red')
for m, n in mr_nom.items():
    ks = [k for k in red_eess if mr_de[k] == m and k in eess_pob]
    unidades[m] = dict(suma([eess_pob[k] for k in ks]), nombre=n, tipo='microred',
                       distritos=sorted({eess_dist[k] for k in ks}), eess=ks)
red_dist = sorted({eess_dist[k] for k in red_eess if k in eess_dist})
for d in red_dist:
    ks = [k for k in red_eess if eess_dist.get(k) == d]
    tot_dist = suma([eess_pob[k] for k, v in eess_dist.items() if v == d])['total']
    u = suma([eess_pob[k] for k in ks])
    unidades['D' + d] = dict(u, nombre=titulo(dist_nom.get(d, d)), tipo='distrito', provincia=titulo(prov_nom.get(d[:4], '')),
                             eess=ks, microredes=sorted({mr_de[k] for k in ks}), parcial=u['total'] < tot_dist, total_distrito=tot_dist)
for k in red_eess:
    if k not in eess_pob: continue
    unidades['E' + k] = dict(eess_pob[k], nombre=eess_nom[k], tipo='eess', distrito=eess_dist[k], microred=mr_de[k], cod=renaes_cod.get(k))
chk = sum(unidades[m]['total'] for m in mr_nom)
print('Red total Excel', red_total['total'], '· suma microredes', chk, '· distritos', len(red_dist), '· EE.SS.', len(red_eess))

# ---------- Geometría: proyección y simplificación ----------
def dp(pts, tol):
    if len(pts) < 3: return pts
    (x1, y1), (x2, y2) = pts[0], pts[-1]; dx, dy = x2 - x1, y2 - y1; L = math.hypot(dx, dy)
    dmax, idx = 0, 0
    for i in range(1, len(pts) - 1):
        d = abs(dy * pts[i][0] - dx * pts[i][1] + x2 * y1 - y2 * x1) / L if L > 1e-9 else math.hypot(pts[i][0] - x1, pts[i][1] - y1)   # anillo cerrado
        if d > dmax: dmax, idx = d, i
    if dmax > tol: return dp(pts[:idx + 1], tol)[:-1] + dp(pts[idx:], tol)
    return [pts[0], pts[-1]]
def anillos(g):
    return [g['coordinates']] if g['type'] == 'Polygon' else g['coordinates']
gd = json.load(open(GDIST)); dists = [f for f in gd['features'] if str(f['properties']['ubigeo']).startswith('01')]
lons = [p[0] for f in dists for poly in anillos(f['geometry']) for ring in poly for p in ring]
lats = [p[1] for f in dists for poly in anillos(f['geometry']) for ring in poly for p in ring]
lat0 = (min(lats) + max(lats)) / 2; k = math.cos(math.radians(lat0))
W = 600; esc = W / ((max(lons) - min(lons)) * k); Hh = (max(lats) - min(lats)) * esc
proj = lambda p: ((p[0] - min(lons)) * k * esc, (max(lats) - p[1]) * esc)
def path(g, tol=0.6):
    out = []
    for poly in anillos(g):
        for ring in poly:
            pts = dp([proj(p) for p in ring], tol)
            if len(pts) >= 4: out.append('M' + 'L'.join('%.1f,%.1f' % p for p in pts) + 'Z')
    return ''.join(out)
def centro(g):   # centroide del anillo exterior más grande
    ring = max((poly[0] for poly in anillos(g)), key=len); pts = [proj(p) for p in ring]
    a = cx = cy = 0
    for (x1, y1), (x2, y2) in zip(pts, pts[1:] + pts[:1]):
        c = x1 * y2 - x2 * y1; a += c; cx += (x1 + x2) * c; cy += (y1 + y2) * c
    return [round(cx / (3 * a), 1), round(cy / (3 * a), 1)] if a else [round(pts[0][0], 1), round(pts[0][1], 1)]
geo = {'ancho': W, 'alto': round(Hh), 'distritos': [], 'proj': {'lon0': min(lons), 'lat1': max(lats), 'k': k, 'esc': esc}}
for f in sorted(dists, key=lambda f: f['properties']['ubigeo']):
    u = f['properties']['ubigeo']
    geo['distritos'].append({'u': u, 'n': titulo(f['properties']['nombre']), 'p': u[:4], 'd': path(f['geometry']), 'c': centro(f['geometry']), 'red': u in red_dist})
# provincias: contorno a partir de los distritos (se dibujan los bordes compartidos con trazo grueso desde el dpto.)
gp = json.load(open(GDEP)); dep = [f for f in gp['features'] if str(f['properties'].get('ubigeo', f['properties'].get('ccdd', ''))).startswith('01')]
geo['departamento'] = path(dep[0]['geometry'], 0.8) if dep else ''
geo['provincias'] = [{'u': u, 'n': titulo(n)} for u, n in sorted(prov_nom.items())]
# Mapa de ubicación: Perú por departamentos, muy simplificado
lons2 = [p[0] for f in gp['features'] for poly in anillos(f['geometry']) for ring in poly for p in ring]
lats2 = [p[1] for f in gp['features'] for poly in anillos(f['geometry']) for ring in poly for p in ring]
k2 = math.cos(math.radians(-9.5)); e2 = 160 / ((max(lons2) - min(lons2)) * k2)
pr2 = lambda p: ((p[0] - min(lons2)) * k2 * e2, (max(lats2) - p[1]) * e2)
def path2(g):
    out = []
    for poly in anillos(g):
        pts = dp([pr2(p) for p in poly[0]], 0.7)
        if len(pts) >= 4: out.append('M' + 'L'.join('%.1f,%.1f' % p for p in pts) + 'Z')
    return ''.join(out)
geo['peru'] = {'ancho': 160, 'alto': round((max(lats2) - min(lats2)) * e2),
               'deps': [{'u': str(f['properties'].get('ubigeo', '')), 'd': path2(f['geometry'])} for f in gp['features']]}

T = {'fuente': 'Población estimada 2026 por establecimiento de salud (REUNIS – MINSA), Red Integrada de Salud Chachapoyas',
     'fuente_mapa': 'Límites distritales INEI (WFS), vía github.com/Rodasluis/Peru-maps (MIT). Uso referencial.',
     'anio': 2026, 'grupos': GRUPOS, 'red_excel': red_total['total'], 'unidades': unidades,
     'microredes': sorted([m for m in mr_nom], key=lambda m: (mr_nom[m].startswith('Sin'), mr_nom[m])), 'distritos_red': ['D' + d for d in red_dist], 'geo': geo}
with open(OUT, 'w', encoding='utf-8') as fh:
    fh.write('/* Generado por preparar_territorio: población 2026 y límites de Amazonas. */\nwindow.TERRITORIO = ')
    json.dump(T, fh, ensure_ascii=False, separators=(',', ':')); fh.write(';\n')
import os; print('ok', OUT, os.path.getsize(OUT), 'bytes')
