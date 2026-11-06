/* Vigilancia de la calidad del agua para consumo humano – vista "agua" del portal de Salud Ambiental.
   Datos: window.AGUA (data/agua.js, generado por herramientas/preparar_agua.py) y window.TERRITORIO (límites distritales).
   No hay coordenadas de los centros poblados: cada localidad se dibuja como un punto agrupado dentro de su distrito. */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var COL = { "BAJO": "#2e9e5b", "MEDIO": "#e3b11c", "ALTO": "#ee7a1f", "MUY ALTO": "#d33a3a" }, SIN = "#b9c2c9";
  var TINTE = { "BAJO": "#d9f0e1", "MEDIO": "#fbf0c6", "ALTO": "#fcdcc0", "MUY ALTO": "#f7cdcd" };
  var NOMBRE = { "BAJO": "Bajo", "MEDIO": "Medio", "ALTO": "Alto", "MUY ALTO": "Muy alto" };
  var MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Setiembre", "Octubre", "Noviembre", "Diciembre"];
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function sv(t, a, p) { var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function nomMes(m, corto) { var p = m.split("-"), n = MESES[+p[1] - 1]; return (corto ? n.slice(0, 3) : n) + " " + p[0]; }
  function fFecha(f) { if (!f) return "–"; var p = f.split("-"); return p[2] + "/" + p[1] + "/" + p[0]; }
  function pct(a, b) { return b ? Math.round(a / b * 1000) / 10 : 0; }
  function sinTilde(s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }
  function chip(r, txt) { var c = el("span", "ag-chip" + (r ? "" : " sin"), txt || (r ? NOMBRE[r] : "Sin monitoreo")); if (r) c.style.background = COL[r]; return c; }
  var tip = null;
  function verTip(e, t, filas) {
    if (!tip) { tip = el("div", "viz-tip"); document.body.appendChild(tip); }
    tip.innerHTML = ""; tip.appendChild(el("div", "viz-tip-t", t)); filas.forEach(function (x) { if (x) tip.appendChild(el("div", "viz-tip-r", x)); });
    tip.hidden = false; var x = e.clientX + 14, y = e.clientY + 14;
    if (x + tip.offsetWidth > innerWidth - 8) x = e.clientX - tip.offsetWidth - 14;
    if (y + tip.offsetHeight > innerHeight - 8) y = e.clientY - tip.offsetHeight - 14;
    tip.style.left = x + "px"; tip.style.top = y + "px";
  }
  function ocultarTip() { if (tip) tip.hidden = true; }

  // Geometría simple a partir del path SVG del distrito ("M x,y L x,y ... Z")
  function anillos(d) {
    var out = [], cur = null, re = /([MLZ])([^MLZ]*)/gi, m;
    while ((m = re.exec(d))) {
      var c = m[1].toUpperCase(), n = m[2].trim().split(/[\s,]+/).filter(Boolean).map(Number);
      if (c === "M") { cur = []; out.push(cur); }
      for (var i = 0; i + 1 < n.length; i += 2) cur && cur.push([n[i], n[i + 1]]);
    }
    return out.filter(function (r) { return r.length > 2; });
  }
  function dentro(x, y, rs) {
    var a = false;
    rs.forEach(function (r) { for (var i = 0, j = r.length - 1; i < r.length; j = i++) { var p = r[i], q = r[j]; if ((p[1] > y) !== (q[1] > y) && x < (q[0] - p[0]) * (y - p[1]) / (q[1] - p[1]) + p[0]) a = !a; } });
    return a;
  }
  function caja(rs) { var b = [1e9, 1e9, -1e9, -1e9]; rs.forEach(function (r) { r.forEach(function (p) { b[0] = Math.min(b[0], p[0]); b[1] = Math.min(b[1], p[1]); b[2] = Math.max(b[2], p[0]); b[3] = Math.max(b[3], p[1]); }); }); return b; }
  // Punto interior más alejado del borde (aprox.): dónde se agrupan los puntos del distrito
  function centro(rs, b) {
    var mejor = [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2], dm = -1, N = 18;
    for (var i = 1; i < N; i++) for (var j = 1; j < N; j++) {
      var x = b[0] + (b[2] - b[0]) * i / N, y = b[1] + (b[3] - b[1]) * j / N;
      if (!dentro(x, y, rs)) continue;
      var d = 1e9; rs.forEach(function (r) { r.forEach(function (p) { d = Math.min(d, (p[0] - x) * (p[0] - x) + (p[1] - y) * (p[1] - y)); }); });
      if (d > dm) { dm = d; mejor = [x, y]; }
    }
    return mejor;
  }

  function montar(cont, sec) {
    var A = window.AGUA, T = window.TERRITORIO;
    cont.innerHTML = "";
    if (!A || !A.meses || !A.meses.length) { cont.appendChild(el("div", "empty", "Aún no se han cargado datos de vigilancia de la calidad del agua (datos/agua/AAAA/agua_AAAA_MM.xlsx).")); return; }
    var M = A.meses, NIV = A.niveles, R = A.reg;
    var SAP = A.sap.filter(function (s) { return s.activo || R[s.id]; });
    var porId = {}; SAP.forEach(function (s) { porId[s.id] = s; });
    var est = { mes: M[M.length - 1], prov: "", filtro: "", q: "", dist: null, sap: null };
    try { var g = JSON.parse(sessionStorage.getItem("agua-estado") || "{}"); if (M.indexOf(g.mes) >= 0) est.mes = g.mes; } catch (e) { }
    function rg(id, m) { var x = m && (R[id] || {})[m]; return x ? x[0] : null; }
    function ant(m) { var i = M.indexOf(m); return i > 0 ? M[i - 1] : null; }
    function cambio(id, m) { var a = rg(id, ant(m)), b = rg(id, m); if (!a || !b) return 0; return NIV.indexOf(b) - NIV.indexOf(a); }
    function racha(id, m) { var n = 0, i = M.indexOf(m); while (i >= 0 && rg(id, M[i]) === "MUY ALTO") { n++; i--; } return n; }
    function pasa(s) {
      if (est.prov && s.prov !== est.prov) return false;
      if (est.dist && s.ubigeo !== est.dist) return false;
      var r = rg(s.id, est.mes), f = est.filtro;
      if (f === "SIN" && r) return false;
      if (f && NIV.indexOf(f) >= 0 && r !== f) return false;
      if (f === "PEOR" && !(cambio(s.id, est.mes) > 0)) return false;
      if (f === "MEJOR" && !(cambio(s.id, est.mes) < 0)) return false;
      if (f === "PERSIST" && racha(s.id, est.mes) < 2) return false;
      if (est.q) { var q = sinTilde(est.q); if ([s.ccpp, s.sap, s.dist, s.proveedor, s.cod].map(sinTilde).join(" ").indexOf(q) < 0) return false; }
      return true;
    }
    function guardar() { try { sessionStorage.setItem("agua-estado", JSON.stringify({ mes: est.mes })); } catch (e) { } }

    // ---------- Controles ----------
    var top = el("div", "ag-ctl"); cont.appendChild(top);
    function selector(etq, ops, val, fn) {
      var l = el("label", "dash-sel"); l.appendChild(el("span", null, etq)); var s = el("select"); l.appendChild(s);
      ops.forEach(function (o) { s.appendChild(new Option(o[1], o[0])); }); s.value = val;
      s.addEventListener("change", function () { fn(s.value); }); top.appendChild(l); return s;
    }
    var sMes = selector("Mes", M.slice().reverse().map(function (m) { return [m, nomMes(m)]; }), est.mes, function (v) { est.mes = v; est.sap = null; guardar(); pintar(); });
    var provs = []; SAP.forEach(function (s) { if (provs.indexOf(s.prov) < 0) provs.push(s.prov); }); provs.sort();
    var sProv = selector("Provincia", [["", "Toda la Red"]].concat(provs.map(function (p) { return [p, p]; })), "", function (v) { est.prov = v; est.dist = null; est.sap = null; enfocar(); pintar(); });
    var sFil = selector("Mostrar", [["", "Todos los sistemas"], ["MUY ALTO", "Riesgo muy alto"], ["ALTO", "Riesgo alto"], ["MEDIO", "Riesgo medio"], ["BAJO", "Riesgo bajo"], ["SIN", "Sin monitoreo en el mes"], ["PEOR", "Empeoraron vs. mes anterior"], ["MEJOR", "Mejoraron vs. mes anterior"], ["PERSIST", "Muy alto 2 meses o más seguidos"]], "", function (v) { est.filtro = v; pintar(); });
    var lq = el("label", "dash-sel ag-buscar"); lq.appendChild(el("span", null, "Buscar")); var iq = el("input"); iq.type = "search"; iq.placeholder = "Localidad, SAP, proveedor o código"; lq.appendChild(iq); top.appendChild(lq);
    iq.addEventListener("input", function () { est.q = iq.value.trim(); pintar(); });

    var kpis = el("div", "kpi-grid ag-kpis"); cont.appendChild(kpis);
    var grid = el("div", "ag-grid"); cont.appendChild(grid);
    var cMapa = el("section", "viz-card ag-mapa"); grid.appendChild(cMapa);
    var panel = el("section", "viz-card ag-panel"); grid.appendChild(panel);
    var fila2 = el("div", "viz-grid ag-fila2"); cont.appendChild(fila2);
    var cProv = el("section", "viz-card"); fila2.appendChild(cProv);
    var cAt = el("section", "viz-card"); fila2.appendChild(cAt);
    var cTab = el("section", "viz-card viz-wide ag-tabla"); cont.appendChild(cTab);
    var resp = el("div", "ag-resp"); cont.appendChild(resp);
    var nota = el("p", "dash-nota"); cont.appendChild(nota);

    // ---------- Mapa ----------
    cMapa.appendChild(el("h3", null, "Riesgo de las localidades por distrito"));
    cMapa.appendChild(el("p", "viz-note", "Cada punto es un sistema de abastecimiento, agrupado dentro de su distrito (ubicación aproximada: no se cuenta con coordenadas). El distrito toma el color del mayor riesgo encontrado. Pulse un distrito o un punto."));
    var ley = el("div", "ag-ley"); cMapa.appendChild(ley);
    NIV.forEach(function (n) { var s = el("span"); var i = el("i"); i.style.background = COL[n]; s.appendChild(i); s.appendChild(document.createTextNode(NOMBRE[n])); ley.appendChild(s); });
    var s0 = el("span"); var i0 = el("i"); i0.style.background = SIN; s0.appendChild(i0); s0.appendChild(document.createTextNode("Sin monitoreo")); ley.appendChild(s0);
    var zbar = el("div", "ag-zoom"); cMapa.appendChild(zbar);
    var bRed = el("button", null, "Ver toda la Red"); bRed.type = "button"; zbar.appendChild(bRed);
    bRed.addEventListener("click", function () { est.dist = null; est.sap = null; est.prov = ""; sProv.value = ""; enfocar(); pintar(); });
    var svg = null, formas = {}, geo = {}, capaP = null, vista = null;
    var conSap = {}; SAP.forEach(function (s) { (conSap[s.ubigeo] = conSap[s.ubigeo] || []).push(s); });
    if (T && T.geo) {
      var G = T.geo, rojos = G.distritos.filter(function (d) { return d.red; });
      rojos.forEach(function (d) { var rs = anillos(d.d), b = caja(rs); geo[d.u] = { rs: rs, b: b, n: d.n, p: d.p }; });
      var bRedC = [1e9, 1e9, -1e9, -1e9]; Object.keys(geo).forEach(function (u) { var b = geo[u].b; bRedC = [Math.min(bRedC[0], b[0]), Math.min(bRedC[1], b[1]), Math.max(bRedC[2], b[2]), Math.max(bRedC[3], b[3])]; });
      geo.__red = { b: bRedC };
      svg = sv("svg", { class: "ag-svg", role: "img", "aria-label": "Mapa de riesgo del agua por distrito" }, cMapa);
      var capa = sv("g", {}, svg);
      G.distritos.forEach(function (d) {
        var p = sv("path", { d: d.d, class: "ag-d" + (d.red ? " red" : "") }, capa);
        if (!d.red) return;
        formas[d.u] = p;
        p.addEventListener("pointermove", function (e) {
          var l = conSap[d.u] || [], c = {}; l.forEach(function (s) { var r = rg(s.id, est.mes) || "SIN"; c[r] = (c[r] || 0) + 1; });
          verTip(e, d.n, l.length ? [l.length + (l.length === 1 ? " sistema vigilado" : " sistemas vigilados")].concat(NIV.concat(["SIN"]).filter(function (n) { return c[n]; }).map(function (n) { return (n === "SIN" ? "Sin monitoreo" : NOMBRE[n]) + ": " + c[n]; })) : ["Sin sistemas en vigilancia"]);
        });
        p.addEventListener("pointerleave", ocultarTip);
        p.addEventListener("click", function () { if (!conSap[d.u]) return; est.dist = est.dist === d.u ? null : d.u; est.sap = null; enfocar(); pintar(); });
      });
      if (G.departamento) sv("path", { d: G.departamento, class: "ag-dep" }, svg);
      capaP = sv("g", { class: "ag-puntos" }, svg);
      Object.keys(conSap).forEach(function (u) { if (geo[u]) geo[u].c = centro(geo[u].rs, geo[u].b); });
    } else cMapa.appendChild(el("div", "empty", "No se encontró el mapa de distritos (territorio.js)."));

    function enfocar() {
      if (!svg) return;
      var b;
      if (est.dist && geo[est.dist]) b = geo[est.dist].b;
      else if (est.prov) { b = [1e9, 1e9, -1e9, -1e9]; Object.keys(geo).forEach(function (u) { var s = conSap[u]; if (u === "__red" || !s || s[0].prov !== est.prov) return; var c = geo[u].b; b = [Math.min(b[0], c[0]), Math.min(b[1], c[1]), Math.max(b[2], c[2]), Math.max(b[3], c[3])]; }); if (b[2] < b[0]) b = geo.__red.b; }
      else b = geo.__red.b;
      var w = b[2] - b[0], h = b[3] - b[1];
      w = Math.max(w, 40) * 1.12; h = Math.max(h, 40) * 1.12;
      var cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2;
      vista = [cx - w / 2, cy - h / 2, w, h];
      svg.setAttribute("viewBox", vista.join(" "));
    }

    function puntos() {
      if (!svg) return;
      capaP.innerHTML = "";
      var W = Math.min(vista[2], vista[3] * 1.4), r = W / (est.dist ? 34 : 95), paso = r * 2.35;
      Object.keys(conSap).forEach(function (u) {
        var g = geo[u]; if (!g || !g.c) return;
        var l = conSap[u].slice().sort(function (a, b) { return NIV.indexOf(rg(b.id, est.mes)) - NIV.indexOf(rg(a.id, est.mes)) || a.ccpp.localeCompare(b.ccpp); });
        l.forEach(function (s, i) {
          var ang = i * 2.39996, rad = i ? paso * Math.sqrt(i) * .62 : 0;
          var x = g.c[0] + Math.cos(ang) * rad, y = g.c[1] + Math.sin(ang) * rad, rr = rg(s.id, est.mes);
          var c = sv("circle", { cx: x.toFixed(2), cy: y.toFixed(2), r: r.toFixed(2), fill: rr ? COL[rr] : SIN, class: "ag-p" + (pasa(s) ? "" : " off") + (est.sap === s.id ? " sel" : "") }, capaP);
          c.addEventListener("pointermove", function (e) {
            var a = ant(est.mes), ra = rg(s.id, a);
            verTip(e, s.ccpp + " · " + s.dist, [s.sap, nomMes(est.mes) + ": " + (rr ? NOMBRE[rr] : "sin monitoreo"), a ? nomMes(a) + ": " + (ra ? NOMBRE[ra] : "sin monitoreo") : ""]);
          });
          c.addEventListener("pointerleave", ocultarTip);
          c.addEventListener("click", function (e) { e.stopPropagation(); est.sap = s.id; est.dist = s.ubigeo; enfocar(); pintar(); });
        });
      });
    }

    function colorDistritos() {
      Object.keys(formas).forEach(function (u) {
        var l = conSap[u] || [], peor = -1, alguno = false;
        l.forEach(function (s) { if (est.prov && s.prov !== est.prov) return; var r = rg(s.id, est.mes); if (r) { alguno = true; peor = Math.max(peor, NIV.indexOf(r)); } });
        var f = !l.length ? "#f3f5f6" : peor >= 0 ? TINTE[NIV[peor]] : "#e7ebee";
        formas[u].style.fill = f;
        formas[u].classList.toggle("con", !!l.length);
        formas[u].classList.toggle("sel", est.dist === u);
        formas[u].classList.toggle("off", !!(est.prov && l.length && l[0].prov !== est.prov));
        void alguno;
      });
    }

    // ---------- KPIs ----------
    function kpi(etq, val, sub, color, filtro) {
      var k = el("div", "kpi" + (filtro != null ? " kpi-link" : "")); if (color) k.style.borderTop = "4px solid " + color;
      k.appendChild(el("span", "kpi-l", etq)); k.appendChild(el("span", "kpi-v", val)); if (sub) k.appendChild(el("span", "kpi-s", sub));
      if (filtro != null) { k.tabIndex = 0; k.setAttribute("role", "button"); var f = function () { est.filtro = est.filtro === filtro ? "" : filtro; sFil.value = est.filtro; pintar(); cTab.scrollIntoView({ behavior: "smooth", block: "start" }); }; k.addEventListener("click", f); k.addEventListener("keydown", function (e) { if (e.key === "Enter") f(); }); }
      kpis.appendChild(k);
    }
    function pintarKpis(base) {
      kpis.innerHTML = "";
      var a = ant(est.mes), mon = base.filter(function (s) { return rg(s.id, est.mes); }), c = {};
      mon.forEach(function (s) { var r = rg(s.id, est.mes); c[r] = (c[r] || 0) + 1; });
      var peor = base.filter(function (s) { return cambio(s.id, est.mes) > 0; }).length, mejor = base.filter(function (s) { return cambio(s.id, est.mes) < 0; }).length;
      kpi("Sistemas monitoreados", mon.length + " / " + base.length, pct(mon.length, base.length) + "% de los sistemas vigilados", "#0f6b62", "");
      NIV.slice().reverse().forEach(function (n) { kpi("Riesgo " + NOMBRE[n].toLowerCase(), String(c[n] || 0), pct(c[n] || 0, mon.length) + "% de los monitoreados", COL[n], n); });
      if (a) {
        kpi("Empeoraron", String(peor), "frente a " + nomMes(a), "#8f1d1d", "PEOR");
        kpi("Mejoraron", String(mejor), "frente a " + nomMes(a), "#0f5a0f", "MEJOR");
      }
    }

    // ---------- Panel lateral ----------
    function historial(s) {
      var h = el("div", "ag-hist");
      M.forEach(function (m) { var w = el("div", "ag-hist-m" + (m === est.mes ? " act" : "")); w.appendChild(el("span", null, nomMes(m, true))); w.appendChild(chip(rg(s.id, m))); h.appendChild(w); });
      return h;
    }
    function pintarPanel() {
      panel.innerHTML = "";
      if (est.sap && porId[est.sap]) {
        var s = porId[est.sap], x = (R[s.id] || {})[est.mes];
        var v = el("button", "ag-volver", "← " + (est.dist ? "Volver al distrito" : "Volver")); v.type = "button"; v.addEventListener("click", function () { est.sap = null; pintar(); }); panel.appendChild(v);
        panel.appendChild(el("h3", null, s.ccpp));
        panel.appendChild(el("p", "viz-note", s.dist + " · " + s.prov + " · Código de centro poblado " + (s.cod || "–")));
        var dl = el("dl", "ag-ficha");
        [["Sistema de abastecimiento", s.sap], ["Proveedor", s.proveedor], ["Riesgo en " + nomMes(est.mes), null], ["Fecha de monitoreo", x ? fFecha(x[1]) : "–"], ["N° de puntos", x && x[2] != null ? String(x[2]) : "–"], ["Parámetros fuera de LMP", x ? (x[3] || "Ninguno") : "–"]].forEach(function (f) {
          dl.appendChild(el("dt", null, f[0])); var dd = el("dd"); if (f[1] == null) dd.appendChild(chip(x ? x[0] : null)); else dd.textContent = f[1]; dl.appendChild(dd);
        });
        if (x && x[4] > 1) { dl.appendChild(el("dt", null, "Monitoreos en el mes")); dl.appendChild(el("dd", null, x[4] + " (se muestra el de mayor riesgo)")); }
        panel.appendChild(dl);
        panel.appendChild(el("h4", "ag-h4", "Historial mensual"));
        panel.appendChild(historial(s));
        var rc = racha(s.id, est.mes); if (rc >= 2) panel.appendChild(el("div", "box red ag-aviso", "Lleva " + rc + " meses seguidos en riesgo muy alto."));
        return;
      }
      if (est.dist && geo[est.dist]) {
        var l = (conSap[est.dist] || []).slice().sort(function (a, b) { return NIV.indexOf(rg(b.id, est.mes)) - NIV.indexOf(rg(a.id, est.mes)) || a.ccpp.localeCompare(b.ccpp); });
        panel.appendChild(el("h3", null, "Distrito " + geo[est.dist].n));
        panel.appendChild(el("p", "viz-note", l.length + (l.length === 1 ? " sistema vigilado" : " sistemas vigilados") + " · " + l[0].prov + " · " + nomMes(est.mes)));
        var ul = el("ul", "ag-lista");
        l.forEach(function (s) {
          var li = el("li"), b = el("button"); b.type = "button";
          var t = el("span", "ag-lista-t"); t.appendChild(el("strong", null, s.ccpp)); t.appendChild(el("span", null, s.sap)); b.appendChild(t);
          var d = cambio(s.id, est.mes); if (d) b.appendChild(el("span", "ag-flecha " + (d > 0 ? "peor" : "mejor"), d > 0 ? "▲" : "▼"));
          b.appendChild(chip(rg(s.id, est.mes)));
          b.addEventListener("click", function () { est.sap = s.id; pintar(); });
          li.appendChild(b); ul.appendChild(li);
        });
        panel.appendChild(ul);
        return;
      }
      panel.appendChild(el("h3", null, "Seleccione un distrito"));
      panel.appendChild(el("p", "viz-note", "Pulse un distrito del mapa para ver sus localidades y el riesgo de cada sistema de abastecimiento, o un punto para ver su ficha."));
      var a = ant(est.mes), base = SAP.filter(function (s) { return !est.prov || s.prov === est.prov; });
      var top = base.filter(function (s) { return rg(s.id, est.mes) === "MUY ALTO"; }).map(function (s) { return s.dist; });
      var cuenta = {}; top.forEach(function (d) { cuenta[d] = (cuenta[d] || 0) + 1; });
      var orden = Object.keys(cuenta).sort(function (x, y) { return cuenta[y] - cuenta[x] || x.localeCompare(y); }).slice(0, 8);
      if (orden.length) {
        panel.appendChild(el("h4", "ag-h4", "Distritos con más sistemas en riesgo muy alto"));
        var ul2 = el("ul", "ag-lista");
        orden.forEach(function (d) {
          var u = (base.filter(function (s) { return s.dist === d; })[0] || {}).ubigeo;
          var li = el("li"), b = el("button"); b.type = "button";
          var t = el("span", "ag-lista-t"); t.appendChild(el("strong", null, d)); t.appendChild(el("span", null, (conSap[u] || []).length + " sistemas vigilados")); b.appendChild(t);
          b.appendChild(chip("MUY ALTO", String(cuenta[d])));
          b.addEventListener("click", function () { est.dist = u; enfocar(); pintar(); });
          li.appendChild(b); ul2.appendChild(li);
        });
        panel.appendChild(ul2);
      }
      void a;
    }

    // ---------- Resumen por provincia y evolución ----------
    function barra(c, total) {
      var b = el("div", "ag-barra");
      NIV.concat(["SIN"]).forEach(function (n) { var v = c[n] || 0; if (!v) return; var s = el("span"); s.style.width = (v / total * 100) + "%"; s.style.background = n === "SIN" ? SIN : COL[n]; s.title = (n === "SIN" ? "Sin monitoreo" : NOMBRE[n]) + ": " + v; if (v / total > .06) s.textContent = v; b.appendChild(s); });
      return b;
    }
    function pintarProv() {
      cProv.innerHTML = "";
      cProv.appendChild(el("h3", null, "Resumen por provincia · " + nomMes(est.mes)));
      cProv.appendChild(el("p", "viz-note", "Número de sistemas por nivel de riesgo; en gris, los no monitoreados en el mes."));
      var filas = provs.concat(["TOTAL"]);
      filas.forEach(function (p) {
        var l = SAP.filter(function (s) { return p === "TOTAL" || s.prov === p; }), c = {}, mon = 0;
        l.forEach(function (s) { var r = rg(s.id, est.mes) || "SIN"; c[r] = (c[r] || 0) + 1; if (r !== "SIN") mon++; });
        var f = el("div", "ag-fila" + (p === "TOTAL" ? " total" : "") + (est.prov === p ? " act" : ""));
        var t = el("div", "ag-fila-t"); t.appendChild(el("strong", null, p === "TOTAL" ? "Red de Salud Chachapoyas" : p)); t.appendChild(el("span", null, mon + "/" + l.length + " monitoreados · " + pct(c["MUY ALTO"] || 0, mon) + "% muy alto")); f.appendChild(t);
        f.appendChild(barra(c, l.length));
        if (p !== "TOTAL") { f.tabIndex = 0; f.addEventListener("click", function () { est.prov = est.prov === p ? "" : p; sProv.value = est.prov; est.dist = null; est.sap = null; enfocar(); pintar(); }); }
        cProv.appendChild(f);
      });
      if (M.length > 1) {
        cProv.appendChild(el("h4", "ag-h4", "Evolución mensual" + (est.prov ? " · " + est.prov : " · Red")));
        M.slice(-12).forEach(function (m) {
          var l = SAP.filter(function (s) { return !est.prov || s.prov === est.prov; }), c = {};
          l.forEach(function (s) { var r = rg(s.id, m) || "SIN"; c[r] = (c[r] || 0) + 1; });
          var f = el("div", "ag-fila mes" + (m === est.mes ? " act" : ""));
          var t = el("div", "ag-fila-t"); t.appendChild(el("strong", null, nomMes(m))); f.appendChild(t); f.appendChild(barra(c, l.length));
          f.addEventListener("click", function () { est.mes = m; sMes.value = m; est.sap = null; guardar(); pintar(); });
          cProv.appendChild(f);
        });
      }
    }
    function pintarAtencion(base) {
      cAt.innerHTML = "";
      cAt.appendChild(el("h3", null, "Requieren atención"));
      var a = ant(est.mes);
      cAt.appendChild(el("p", "viz-note", a ? "Comparación automática de " + nomMes(est.mes) + " frente a " + nomMes(a) + "." : "Se mostrará la comparación cuando haya un mes anterior."));
      function grupo(tit, l, filtro, color) {
        var h = el("button", "ag-grupo"); h.type = "button"; h.style.borderLeftColor = color;
        h.appendChild(el("strong", null, String(l.length))); h.appendChild(el("span", null, tit));
        h.addEventListener("click", function () { est.filtro = filtro; sFil.value = filtro; pintar(); cTab.scrollIntoView({ behavior: "smooth", block: "start" }); });
        cAt.appendChild(h);
      }
      grupo("En riesgo muy alto 2 meses o más seguidos", base.filter(function (s) { return racha(s.id, est.mes) >= 2; }), "PERSIST", COL["MUY ALTO"]);
      if (a) {
        grupo("Pasaron de bajo a muy alto", base.filter(function (s) { return rg(s.id, a) === "BAJO" && rg(s.id, est.mes) === "MUY ALTO"; }), "PEOR", "#8f1d1d");
        grupo("Empeoraron (subieron de nivel)", base.filter(function (s) { return cambio(s.id, est.mes) > 0; }), "PEOR", COL["ALTO"]);
        grupo("Mejoraron (bajaron de nivel)", base.filter(function (s) { return cambio(s.id, est.mes) < 0; }), "MEJOR", COL["BAJO"]);
      }
      grupo("Sin monitoreo en el mes", base.filter(function (s) { return !rg(s.id, est.mes); }), "SIN", SIN);
      // Parámetros fuera de LMP
      var par = {}, n = 0;
      base.forEach(function (s) { var x = (R[s.id] || {})[est.mes]; if (!x || !x[3]) return; n++; x[3].split(/\s*[,;\/]\s*|\s+y\s+/).forEach(function (p) { p = p.trim(); if (!p) return; p = p.charAt(0).toUpperCase() + p.slice(1).toLowerCase(); par[p] = (par[p] || 0) + 1; }); });
      var ks = Object.keys(par).sort(function (x, y) { return par[y] - par[x]; });
      if (ks.length) {
        cAt.appendChild(el("h4", "ag-h4", "Parámetros fuera de LMP · " + nomMes(est.mes)));
        var mx = par[ks[0]];
        ks.slice(0, 6).forEach(function (k) {
          var f = el("div", "ag-par"); f.appendChild(el("span", "ag-par-t", k));
          var b = el("span", "ag-par-b"); var i = el("i"); i.style.width = (par[k] / mx * 100) + "%"; b.appendChild(i); f.appendChild(b);
          f.appendChild(el("span", "ag-par-n", par[k] + " sistemas")); cAt.appendChild(f);
        });
      }
    }

    // ---------- Tabla semáforo ----------
    function pintarTabla() {
      cTab.innerHTML = "";
      var l = SAP.filter(pasa).sort(function (a, b) { return NIV.indexOf(rg(b.id, est.mes)) - NIV.indexOf(rg(a.id, est.mes)) || a.prov.localeCompare(b.prov) || a.dist.localeCompare(b.dist) || a.ccpp.localeCompare(b.ccpp); });
      var cab = el("div", "ag-tab-cab");
      cab.appendChild(el("h3", null, "Semáforo por localidad"));
      var desc = [est.prov, est.dist && geo[est.dist] ? "distrito " + geo[est.dist].n : "", sFil.value ? sFil.options[sFil.selectedIndex].text.toLowerCase() : "", est.q ? "“" + est.q + "”" : ""].filter(Boolean).join(" · ");
      cab.appendChild(el("span", "ag-tab-n", l.length + (l.length === 1 ? " sistema" : " sistemas") + (desc ? " · " + desc : "")));
      if (desc) { var lim = el("button", "ag-limpiar", "Quitar filtros"); lim.type = "button"; lim.addEventListener("click", function () { est.prov = ""; est.dist = null; est.filtro = ""; est.q = ""; est.sap = null; sProv.value = ""; sFil.value = ""; iq.value = ""; enfocar(); pintar(); }); cab.appendChild(lim); }
      cTab.appendChild(cab);
      var ms = M.slice(Math.max(0, M.indexOf(est.mes) - 5), M.indexOf(est.mes) + 1);
      var w = el("div", "ag-tab-w"), t = el("table", "ag-tab"); w.appendChild(t);
      var th = el("tr"); ["Provincia", "Distrito", "Centro poblado", "Sistema de abastecimiento", "Proveedor"].concat(ms.map(function (m) { return nomMes(m, true); })).concat(["Cambio"]).forEach(function (h, i) { var c = el("th", i >= 5 ? "c" : null, h); th.appendChild(c); });
      var thead = el("thead"); thead.appendChild(th); t.appendChild(thead);
      var tb = el("tbody"); t.appendChild(tb);
      l.forEach(function (s) {
        var tr = el("tr", est.sap === s.id ? "sel" : null);
        [s.prov, s.dist, s.ccpp, s.sap, s.proveedor].forEach(function (v, i) { tr.appendChild(el("td", i === 2 ? "b" : null, v)); });
        ms.forEach(function (m) { var td = el("td", "c"); td.appendChild(chip(rg(s.id, m))); tr.appendChild(td); });
        var d = cambio(s.id, est.mes), tc = el("td", "c");
        tc.appendChild(el("span", "ag-flecha " + (d > 0 ? "peor" : d < 0 ? "mejor" : "igual"), d > 0 ? "▲ " + d : d < 0 ? "▼ " + (-d) : (rg(s.id, ant(est.mes)) && rg(s.id, est.mes) ? "=" : "–")));
        tr.appendChild(tc);
        tr.addEventListener("click", function () { est.sap = s.id; est.dist = s.ubigeo; enfocar(); pintar(); cMapa.scrollIntoView({ behavior: "smooth", block: "start" }); });
        tb.appendChild(tr);
      });
      if (!l.length) { var tr0 = el("tr"), td0 = el("td", "vacio", "Ningún sistema cumple el filtro."); td0.colSpan = 6 + ms.length; tr0.appendChild(td0); tb.appendChild(tr0); }
      cTab.appendChild(w);
      cTab.appendChild(el("p", "viz-note", "▲ subió de nivel de riesgo · ▼ bajó · = sin cambio · – sin dato para comparar. Pulse una fila para verla en el mapa."));
    }

    function pintarResp() {
      resp.innerHTML = "";
      var info = (window.AREAS_SA || {}).agua; if (!info) return;
      var av = el("span", "ag-resp-av", (info.responsable || "").replace(/^\S+\.\s*/, "").split(" ").slice(0, 2).map(function (x) { return x.charAt(0); }).join(""));
      resp.appendChild(av);
      var t = el("div"); t.appendChild(el("span", "ag-resp-k", info.cargo || "Responsable")); t.appendChild(el("strong", null, info.responsable)); if (info.detalle) t.appendChild(el("span", "ag-resp-d", info.detalle)); resp.appendChild(t);
    }

    function pintar() {
      var base = SAP.filter(function (s) { return !est.prov || s.prov === est.prov; });
      if (est.dist) base = base.filter(function (s) { return s.ubigeo === est.dist; });
      pintarKpis(base); colorDistritos(); puntos(); pintarPanel(); pintarProv(); pintarAtencion(base); pintarTabla();
      bRed.hidden = !est.dist && !est.prov;
      nota.textContent = "Fuente: vigilancia de la calidad del agua para consumo humano, Área de Salud Ambiental – Red de Salud Chachapoyas. Se publican " + SAP.length + " sistemas de abastecimiento de la Red; meses disponibles: " + M.map(function (m) { return nomMes(m); }).join(", ") + ". Escala de riesgo: bajo, medio, alto y muy alto. Mapa: límites distritales INEI; ubicación de las localidades aproximada. Actualizado: " + fFecha(A.actualizado) + ".";
    }
    pintarResp(); enfocar(); pintar();
  }
  window.GeoDistritos = { anillos: anillos, caja: caja, centro: centro };
  window.VISTAS = window.VISTAS || {};
  window.VISTAS.agua = montar;
  window.Agua = { montar: montar };
})();
