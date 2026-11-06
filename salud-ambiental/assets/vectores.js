/* Control vectorial – vista "vectores" del portal de Salud Ambiental.
   Pestañas por vector: Aedes aegypti (escenarios + índices) y Lutzomyia (índice de riesgo).
   Datos: window.VECTORES (data/vectores.js), window.TERRITORIO (mapa), window.GeoDistritos (assets/agua.js). */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var ESC = { 1: "#f0b429", 2: "#e8590c", 3: "#b42318" }, TINTE = { 1: "#fdf1d2", 2: "#fbdcc8", 3: "#f5c6c6" };
  var ROM = { 1: "I", 2: "II", 3: "III" };
  var DEF = {
    1: ["Sin presencia del vector", "Localidades donde no se ha detectado Aedes aegypti; se mantiene la vigilancia para detectar su ingreso oportunamente."],
    2: ["Vector presente, sin casos autóctonos", "Localidades con presencia de Aedes aegypti, sin transmisión autóctona de dengue; se vigilan y controlan los índices aédicos."],
    3: ["Vector presente con casos autóctonos", "Localidades con Aedes aegypti y transmisión autóctona de dengue; requieren control vectorial intensivo."]
  };
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function sv(t, a, p) { var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function fmt(n) { return n == null ? "–" : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " "); }
  function sinTilde(s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }
  function fFecha(f) { var p = String(f || "").split("-"); return p.length === 3 ? p[2] + "/" + p[1] + "/" + p[0] : "–"; }
  function etiqueta(e) { var c = el("span", "vc-esc", "Escenario " + ROM[e]); c.style.background = ESC[e]; return c; }
  var tip = null;
  function verTip(ev, t, filas) {
    if (!tip) { tip = el("div", "viz-tip"); document.body.appendChild(tip); }
    tip.innerHTML = ""; tip.appendChild(el("div", "viz-tip-t", t)); filas.forEach(function (x) { if (x) tip.appendChild(el("div", "viz-tip-r", x)); });
    tip.hidden = false; var x = ev.clientX + 14, y = ev.clientY + 14;
    if (x + tip.offsetWidth > innerWidth - 8) x = ev.clientX - tip.offsetWidth - 14;
    if (y + tip.offsetHeight > innerHeight - 8) y = ev.clientY - tip.offsetHeight - 14;
    tip.style.left = x + "px"; tip.style.top = y + "px";
  }
  function ocultarTip() { if (tip) tip.hidden = true; }

  // Ilustraciones simples (trazo propio) de cada vector
  function zancudo(cls) {
    var s = sv("svg", { viewBox: "0 0 120 90", class: cls, "aria-hidden": "true" });
    var g = sv("g", { fill: "none", stroke: "currentColor", "stroke-width": "2.2", "stroke-linecap": "round", "stroke-linejoin": "round" }, s);
    sv("ellipse", { cx: 46, cy: 30, rx: 26, ry: 9, transform: "rotate(-18 46 30)", "stroke-width": "1.6", opacity: ".8" }, g);
    sv("ellipse", { cx: 50, cy: 38, rx: 24, ry: 8, transform: "rotate(-4 50 38)", "stroke-width": "1.6", opacity: ".8" }, g);
    sv("path", { d: "M58 46 C70 44 86 47 98 54" , "stroke-width": "6" }, g);
    sv("path", { d: "M64 45l2 6M72 45l2 6M80 47l2 6M88 50l1 6", "stroke-width": "1.4", opacity: ".9" }, g);
    sv("circle", { cx: 52, cy: 46, r: 6.5, fill: "currentColor" }, g);
    sv("circle", { cx: 42, cy: 47, r: 4.2, fill: "currentColor" }, g);
    sv("path", { d: "M38 48 L18 58" }, g);
    sv("path", { d: "M40 44 l-9 -7 M41 45 l-10 -3", "stroke-width": "1.3" }, g);
    sv("path", { d: "M50 51 C44 60 36 66 28 80 M54 52 C54 62 50 70 46 84 M58 51 C66 60 70 68 78 84 M49 50 C40 54 30 56 20 66 M57 50 C66 54 78 58 88 70 M53 52 C58 62 60 72 60 86" , "stroke-width": "1.5" }, g);
    return s;
  }
  function flebotomo(cls) {
    var s = sv("svg", { viewBox: "0 0 120 90", class: cls, "aria-hidden": "true" });
    var g = sv("g", { fill: "none", stroke: "currentColor", "stroke-width": "2.2", "stroke-linecap": "round", "stroke-linejoin": "round" }, s);
    sv("path", { d: "M54 42 C46 26 44 14 48 6 C54 14 58 28 58 42Z", "stroke-width": "1.6", opacity: ".85" }, g);
    sv("path", { d: "M58 42 C64 24 72 12 80 8 C80 20 70 34 62 44Z", "stroke-width": "1.6", opacity: ".85" }, g);
    sv("path", { d: "M50 6 l2 6 M76 10 l-3 5 M47 18 l3 3 M78 18 l-4 3", "stroke-width": "1.1", opacity: ".7" }, g);
    sv("path", { d: "M60 48 C70 50 80 56 90 66", "stroke-width": "5.5" }, g);
    sv("circle", { cx: 55, cy: 47, r: 6, fill: "currentColor" }, g);
    sv("circle", { cx: 45, cy: 50, r: 4, fill: "currentColor" }, g);
    sv("path", { d: "M42 52 L34 60 M43 47 l-12 -6 M43 48 l-12 -1", "stroke-width": "1.4" }, g);
    sv("path", { d: "M52 52 C46 62 40 70 32 84 M56 53 C56 64 54 72 50 86 M60 52 C66 62 70 70 76 84 M51 51 C42 56 32 60 22 70 M59 51 C70 56 80 60 92 74 M55 53 C60 64 62 74 62 86", "stroke-width": "1.4" }, g);
    return s;
  }

  function montar(cont) {
    var V = window.VECTORES || {};
    cont.innerHTML = "";
    var est = { vector: "aedes", sub: "escenarios" };
    try { var g0 = JSON.parse(sessionStorage.getItem("vectores") || "{}"); if (g0.vector) est.vector = g0.vector; if (g0.sub) est.sub = g0.sub; } catch (e) { }

    // ---------- Cabecera temática ----------
    var hero = el("section", "vc-hero"); cont.appendChild(hero);
    hero.appendChild(zancudo("vc-hero-ilu"));
    var ht = el("div", "vc-hero-t"); hero.appendChild(ht);
    ht.appendChild(el("span", "vc-kicker", "Vigilancia entomológica"));
    ht.appendChild(el("h3", null, "Vectores bajo vigilancia en la Red"));
    ht.appendChild(el("p", null, "Ubicación del vector, índices entomológicos y riesgo de transmisión de las enfermedades metaxénicas en la jurisdicción de la Red de Salud Chachapoyas."));
    var esp = el("div", "vc-especies"); hero.appendChild(esp);
    var cuerpo = el("div", "vc-cuerpo"); cont.appendChild(cuerpo);
    var resp = el("div", "ag-resp vc-resp"); cont.appendChild(resp);
    var VEC = [
      { id: "aedes", sci: "Aedes aegypti", com: "Zancudo del dengue", enf: "Dengue · zika · chikungunya", ilu: zancudo },
      { id: "lutzo", sci: "Lutzomyia spp.", com: "Manta blanca · titira", enf: "Leishmaniasis cutánea y mucocutánea", ilu: flebotomo }
    ];
    var botones = {};
    VEC.forEach(function (v) {
      var b = el("button", "vc-esp"); b.type = "button"; b.setAttribute("role", "tab");
      b.appendChild(v.ilu("vc-esp-ilu"));
      var t = el("span", "vc-esp-t"); t.appendChild(el("em", null, v.sci)); t.appendChild(el("span", null, v.com)); t.appendChild(el("small", null, v.enf)); b.appendChild(t);
      b.addEventListener("click", function () { est.vector = v.id; guardar(); pintar(); });
      botones[v.id] = b; esp.appendChild(b);
    });
    function guardar() { try { sessionStorage.setItem("vectores", JSON.stringify(est)); } catch (e) { } }

    function responsable() {
      resp.innerHTML = ""; var info = (window.AREAS_SA || {}).vectores; if (!info) return;
      resp.appendChild(el("span", "ag-resp-av", info.responsable.replace(/^\S+\.\s*/, "").split(" ").slice(0, 2).map(function (x) { return x.charAt(0); }).join("")));
      var t = el("div"); t.appendChild(el("span", "ag-resp-k", info.cargo)); t.appendChild(el("strong", null, info.responsable)); if (info.detalle) t.appendChild(el("span", "ag-resp-d", info.detalle)); resp.appendChild(t);
    }

    function pintar() {
      Object.keys(botones).forEach(function (k) { botones[k].classList.toggle("act", k === est.vector); botones[k].setAttribute("aria-selected", k === est.vector); });
      cuerpo.innerHTML = "";
      if (est.vector === "aedes") aedes(cuerpo); else lutzomyia(cuerpo);
      try { document.dispatchEvent(new CustomEvent("sa-vista", { detail: { vector: est.vector, sub: est.sub } })); } catch (e) { }
    }

    // ---------- Aedes aegypti ----------
    function aedes(c) {
      var tabs = el("div", "dash-tabs vc-tabs"); c.appendChild(tabs);
      var zona = el("div"); c.appendChild(zona);
      [["escenarios", "Escenarios de riesgo"], ["indices", "Índices aédicos"]].forEach(function (t) {
        var b = el("button", "dash-tab" + (est.sub === t[0] ? " active" : ""), t[1]); b.type = "button";
        b.addEventListener("click", function () { est.sub = t[0]; guardar(); pintar(); });
        tabs.appendChild(b);
      });
      if (est.sub === "indices") indices(zona); else escenarios(zona);
    }

    // ---------- Índices aédicos (datos mensuales) ----------
    function indices(c) {
      var X = (V.aedes || {}).indices, E = ((V.aedes || {}).escenarios) || [];
      if (!X || !X.meses || !X.meses.length) { c.appendChild(el("p", "vc-intro", "Aún no se han cargado los archivos mensuales (datos/vectores/aedes/AAAA/aedes_AAAA_MM.xlsx).")); formulas(c); return; }
      var M = X.meses, R = X.reg, ES = X.escala || [1, 2];
      var NIV = ["Bajo riesgo", "Mediano riesgo", "Alto riesgo"], CNIV = ["#2e9e5b", "#e3b11c", "#d33a3a"], TNIV = ["#d9f0e1", "#fbf0c6", "#f7cdcd"];
      var MN = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Setiembre", "Octubre", "Noviembre", "Diciembre"];
      function nm(m, c) { var p = m.split("-"), n = MN[+p[1] - 1]; return (c ? n.slice(0, 3) : n) + " " + p[0]; }
      var info = {}; E.forEach(function (x) { info[x.cod] = x; });
      var cods = Object.keys(R).sort(function (a, b) { var A = info[a] || {}, B = info[b] || {}; return (A.prov || "").localeCompare(B.prov || "") || (A.dist || "").localeCompare(B.dist || "") || (A.eess || "").localeCompare(B.eess || ""); });
      var IND = { ia: ["Índice aédico", "IA"], ir: ["Índice de recipientes", "IR"], ib: ["Índice de Breteau", "IB"], cob: ["Cobertura", "%"] };
      var st = { mes: M[M.length - 1].m, ind: "ia", cod: null };
      function calc(v) { // v = [prog, insp, pos, rinsp, rpos, tipos]
        if (!v) return null; var r = { prog: v[0], insp: v[1], pos: v[2], rinsp: v[3], rpos: v[4], tipos: v[5] || [] };
        r.ia = r.insp ? r.pos / r.insp * 100 : null; r.ir = r.rinsp ? r.rpos / r.rinsp * 100 : null; r.ib = r.insp ? r.rpos / r.insp * 100 : null; r.cob = r.prog ? r.insp / r.prog * 100 : null;
        if (!r.insp) { r.ia = r.ib = null; }
        var t = 0; r.tipos.forEach(function (x) { t += x || 0; });
        r.control = r.insp == null ? "" : r.pos > r.insp ? "Viviendas positivas mayores que inspeccionadas" : r.rpos > r.rinsp ? "Recipientes positivos mayores que inspeccionados" : r.rpos < r.pos ? "Menos recipientes positivos que viviendas positivas" : t !== (r.rpos || 0) ? "La suma por tipo (" + t + ") no coincide con los recipientes positivos (" + (r.rpos || 0) + ")" : "";
        return r;
      }
      function total(m, filtro) {
        var s = [0, 0, 0, 0, 0, []], n = 0;
        cods.forEach(function (k) { var v = (R[k] || {})[m]; if (!v || (filtro && !filtro(k))) return; n++; for (var i = 0; i < 5; i++) s[i] += v[i] || 0; (v[5] || []).forEach(function (x, j) { s[5][j] = (s[5][j] || 0) + (x || 0); }); });
        var r = calc(s); r.n = n; return r;
      }
      function nivel(ia) { return ia == null ? -1 : ia < ES[0] ? 0 : ia <= ES[1] ? 1 : 2; }
      function f2(x) { return x == null ? "–" : (Math.round(x * 100) / 100).toFixed(2).replace(".", ","); }
      function chipN(ia) { var n = nivel(ia), c = el("span", "vc-esc", n < 0 ? "Sin dato" : NIV[n]); c.style.background = n < 0 ? "#b9c2c9" : CNIV[n]; return c; }
      function actDe(m) { var x = M.filter(function (y) { return y.m === m; })[0]; return (x && x.act) || ""; }

      var ctl = el("div", "ag-ctl"); c.appendChild(ctl);
      function sel(etq, ops, val, fn) { var l = el("label", "dash-sel"); l.appendChild(el("span", null, etq)); var s = el("select"); ops.forEach(function (o) { s.appendChild(new Option(o[1], o[0])); }); s.value = val; s.addEventListener("change", function () { fn(s.value); }); l.appendChild(s); ctl.appendChild(l); return s; }
      var sMes = sel("Mes", M.slice().reverse().map(function (x) { return [x.m, nm(x.m) + (x.act ? " · " + x.act : "")]; }), st.mes, function (v) { st.mes = v; todo(); });
      sel("Indicador del mapa y la tabla", Object.keys(IND).map(function (k) { return [k, IND[k][0]]; }), st.ind, function (v) { st.ind = v; todo(); });
      var kp = el("div", "kpi-grid ag-kpis"); c.appendChild(kp);
      var cTend = el("section", "viz-card vc-tend"); c.appendChild(cTend);
      var grid = el("div", "ag-grid"); c.appendChild(grid);
      var cMapa = el("section", "viz-card ag-mapa vc-mapa"); grid.appendChild(cMapa);
      var panel = el("section", "viz-card ag-panel"); grid.appendChild(panel);
      var fila = el("div", "viz-grid ag-fila2"); c.appendChild(fila);
      var cTab = el("section", "viz-card viz-wide ag-tabla"); fila.appendChild(cTab);
      var cTip = el("section", "viz-card"); fila.appendChild(cTip);
      var cCtl = el("section", "viz-card"); fila.appendChild(cCtl);
      var cHeat = el("section", "viz-card ag-tabla"); c.appendChild(cHeat);
      var det = el("details", "vc-como"); c.appendChild(det); det.appendChild(el("summary", null, "¿Cómo se calculan los índices?")); formulas(det);
      c.appendChild(el("p", "dash-nota", "Fuente: indicadores entomológicos de vigilancia de Aedes aegypti, Área de Salud Ambiental – Red de Salud Chachapoyas. Los índices de la Red se calculan con la suma de viviendas y recipientes de todos los establecimientos. Escala de riesgo según el índice aédico: menos de " + ES[0] + " % bajo, de " + ES[0] + " % a " + ES[1] + " % mediano, más de " + ES[1] + " % alto. En los meses de vigilancia se inspecciona una muestra de viviendas; en los de control larvario, todas."));

      function kpis() {
        kp.innerHTML = ""; var t = total(st.mes);
        function k(l, v, sub, color, chip) { var d = el("div", "kpi vc-kpi"); if (color) d.style.borderTopColor = color; d.appendChild(el("span", "kpi-l", l)); d.appendChild(el("span", "kpi-v", v)); if (chip) d.appendChild(chip); if (sub) d.appendChild(el("span", "kpi-s", sub)); kp.appendChild(d); }
        k("Actividad", actDe(st.mes) || "–", t.n + " establecimientos con datos", "#2e4a25");
        k("Cobertura", f2(t.cob) + " %", (t.insp || 0).toLocaleString("es-PE") + " de " + (t.prog || 0).toLocaleString("es-PE") + " viviendas programadas");
        k("Índice aédico (Red)", f2(t.ia), t.pos + " viviendas positivas", CNIV[nivel(t.ia)], chipN(t.ia));
        k("Índice de recipientes", f2(t.ir), t.rpos + " de " + (t.rinsp || 0).toLocaleString("es-PE") + " recipientes");
        k("Índice de Breteau", f2(t.ib), "recipientes positivos por 100 viviendas");
        var alto = cods.filter(function (q) { var r = calc((R[q] || {})[st.mes]); return r && nivel(r.ia) === 2; }).length;
        k("Establecimientos en alto riesgo", String(alto), "índice aédico mayor a " + ES[1] + " %", alto ? CNIV[2] : "#2e9e5b");
      }

      // Tendencia mensual (SVG)
      function tendencia() {
        cTend.innerHTML = "";
        var filtro = st.cod ? function (k) { return k === st.cod; } : null;
        cTend.appendChild(el("h3", null, "Evolución mensual de los índices · " + (st.cod && info[st.cod] ? info[st.cod].eess : "Red de Salud Chachapoyas")));
        cTend.appendChild(el("p", "viz-note", "Bandas: riesgo según el índice aédico. Los meses de control larvario (todas las viviendas) se marcan con ◆; los de vigilancia por muestra, con ●. Pulse un mes para verlo."));
        var serie = M.map(function (x) { var t = total(x.m, filtro); return { m: x.m, act: x.act, ia: t.n ? t.ia : null, ir: t.n ? t.ir : null, ib: t.n ? t.ib : null }; });
        var W = 900, H = 230, ml = 40, mr = 16, mt = 12, mb = 34, mx = 3;
        serie.forEach(function (p) { ["ia", "ir", "ib"].forEach(function (k) { if (p[k] != null) mx = Math.max(mx, p[k]); }); });
        mx = Math.ceil(mx * 1.15);
        var svg = sv("svg", { viewBox: "0 0 " + W + " " + H, class: "vc-tend-svg", role: "img", "aria-label": "Evolución mensual de los índices aédicos" }, cTend);
        var X = function (i) { return ml + (serie.length === 1 ? (W - ml - mr) / 2 : i * (W - ml - mr) / (serie.length - 1)); }, Y = function (v) { return mt + (1 - v / mx) * (H - mt - mb); };
        [[0, ES[0], 0], [ES[0], ES[1], 1], [ES[1], mx, 2]].forEach(function (b) { if (b[0] >= mx) return; sv("rect", { x: ml, y: Y(Math.min(b[1], mx)), width: W - ml - mr, height: Y(b[0]) - Y(Math.min(b[1], mx)), fill: TNIV[b[2]], opacity: .55 }, svg); });
        for (var g = 0; g <= mx; g += Math.max(1, Math.round(mx / 5))) { sv("line", { x1: ml, x2: W - mr, y1: Y(g), y2: Y(g), stroke: "#dfe6e2", "stroke-width": 1 }, svg); var t = sv("text", { x: ml - 6, y: Y(g) + 4, "text-anchor": "end", class: "vc-ax" }, svg); t.textContent = g; }
        serie.forEach(function (p, i) { var t = sv("text", { x: X(i), y: H - 12, "text-anchor": "middle", class: "vc-ax" + (p.m === st.mes ? " act" : "") }, svg); t.textContent = nm(p.m, true).replace(" 20", " '");
          var hit = sv("rect", { x: X(i) - 18, y: mt, width: 36, height: H - mt - 4, fill: "transparent", style: "cursor:pointer" }, svg);
          hit.addEventListener("click", function () { st.mes = p.m; sMes.value = p.m; todo(); });
          hit.addEventListener("pointermove", function (ev) { verTip(ev, nm(p.m) + " · " + (p.act || ""), ["IA: " + f2(p.ia), "IR: " + f2(p.ir), "IB: " + f2(p.ib)]); }); hit.addEventListener("pointerleave", ocultarTip); });
        var iAct = serie.map(function (p) { return p.m; }).indexOf(st.mes); if (iAct >= 0) sv("line", { x1: X(iAct), x2: X(iAct), y1: mt, y2: H - mb, stroke: "#13241d", "stroke-dasharray": "3 3", "stroke-width": 1 }, svg);
        var LIN = [["ia", "#13241d", "Índice aédico"], ["ir", "#e8590c", "Índice de recipientes"], ["ib", "#0b7285", "Índice de Breteau"]];
        LIN.forEach(function (l) {
          var d = "", pen = false; serie.forEach(function (p, i) { if (p[l[0]] == null) { pen = false; return; } d += (pen ? "L" : "M") + X(i).toFixed(1) + "," + Y(p[l[0]]).toFixed(1); pen = true; });
          sv("path", { d: d, fill: "none", stroke: l[1], "stroke-width": l[0] === "ia" ? 2.6 : 1.8, "pointer-events": "none" }, svg);
          serie.forEach(function (p, i) { if (p[l[0]] == null) return; if (/control/i.test(p.act)) sv("rect", { x: X(i) - 4, y: Y(p[l[0]]) - 4, width: 8, height: 8, transform: "rotate(45 " + X(i) + " " + Y(p[l[0]]) + ")", fill: l[1], "pointer-events": "none" }, svg); else sv("circle", { cx: X(i), cy: Y(p[l[0]]), r: 3.8, fill: l[1], "pointer-events": "none" }, svg); });
        });
        var ley = el("div", "ag-ley"); LIN.forEach(function (l) { var s = el("span"); var i = el("i"); i.style.background = l[1]; s.appendChild(i); s.appendChild(document.createTextNode(l[2])); ley.appendChild(s); }); cTend.appendChild(ley);
        if (st.cod) { var b = el("button", "ag-limpiar", "Ver toda la Red"); b.type = "button"; b.addEventListener("click", function () { st.cod = null; todo(); }); cTend.appendChild(b); }
      }

      // Mapa por distrito
      cMapa.appendChild(el("h3", null, "Riesgo por establecimiento"));
      var notaMapa = el("p", "viz-note"); cMapa.appendChild(notaMapa);
      var ley2 = el("div", "ag-ley"); cMapa.appendChild(ley2);
      NIV.forEach(function (n, i) { var s = el("span"); var q = el("i"); q.style.background = CNIV[i]; s.appendChild(q); s.appendChild(document.createTextNode(n)); ley2.appendChild(s); });
      var s0 = el("span"); var q0 = el("i"); q0.style.background = "#b9c2c9"; s0.appendChild(q0); s0.appendChild(document.createTextNode("Sin datos en el mes")); ley2.appendChild(s0);
      var T = window.TERRITORIO, GD = window.GeoDistritos, svgM = null, formas = {}, geo = {}, capa2, porD = {};
      cods.forEach(function (k) { var u = (info[k] || {}).ubigeo; if (u) (porD[u] = porD[u] || []).push(k); });
      if (T && T.geo && GD) {
        var bb = [1e9, 1e9, -1e9, -1e9];
        T.geo.distritos.forEach(function (d) { if (!d.red) return; var rs = GD.anillos(d.d); geo[d.u] = { rs: rs, b: GD.caja(rs), n: d.n }; });
        Object.keys(porD).forEach(function (u) { if (!geo[u]) return; geo[u].c = GD.centro(geo[u].rs, geo[u].b); var b = geo[u].b; bb = [Math.min(bb[0], b[0]), Math.min(bb[1], b[1]), Math.max(bb[2], b[2]), Math.max(bb[3], b[3])]; });
        var w = (bb[2] - bb[0]) * 1.5, h = (bb[3] - bb[1]) * 1.3, cx = (bb[0] + bb[2]) / 2, cy = (bb[1] + bb[3]) / 2;
        svgM = sv("svg", { class: "ag-svg", viewBox: (cx - w / 2) + " " + (cy - h / 2) + " " + w + " " + h, role: "img", "aria-label": "Mapa de riesgo entomológico" }, cMapa);
        var cp = sv("g", {}, svgM);
        T.geo.distritos.forEach(function (d) { var p = sv("path", { d: d.d, class: "ag-d" + (d.red ? " red" : "") }, cp); if (d.red) formas[d.u] = p; });
        if (T.geo.departamento) sv("path", { d: T.geo.departamento, class: "ag-dep" }, svgM);
        capa2 = sv("g", {}, svgM); svgM._w = Math.min(w, h * 1.4);
      }
      function mapa() {
        notaMapa.textContent = "Cada punto es un establecimiento con índices aédicos, ubicado en su distrito; su color es el nivel de riesgo según el índice aédico de " + nm(st.mes) + ". Pulse un punto para ver su evolución.";
        if (!svgM) return;
        Object.keys(formas).forEach(function (u) { var n = -1; (porD[u] || []).forEach(function (k) { var r = calc((R[k] || {})[st.mes]); if (r) n = Math.max(n, nivel(r.ia)); }); formas[u].style.fill = porD[u] ? (n >= 0 ? TNIV[n] : "#e7ebee") : "#f3f5f6"; formas[u].classList.toggle("con", !!porD[u]); });
        capa2.innerHTML = ""; var r0 = svgM._w / 55;
        Object.keys(porD).forEach(function (u) {
          var g = geo[u]; if (!g || !g.c) return;
          porD[u].forEach(function (k, i) {
            var r = calc((R[k] || {})[st.mes]), n = r ? nivel(r.ia) : -1, ang = i * 2.39996, rad = i ? r0 * 2.5 * Math.sqrt(i) * .62 : 0;
            var p = sv("circle", { cx: g.c[0] + Math.cos(ang) * rad, cy: g.c[1] + Math.sin(ang) * rad, r: r0, fill: n < 0 ? "#b9c2c9" : CNIV[n], class: "ag-p vc-p" + (st.cod === k ? " sel" : "") }, capa2);
            p.addEventListener("pointermove", function (ev) { var x = info[k] || {}; verTip(ev, x.eess || k, [x.dist, r ? "IA " + f2(r.ia) + " · IR " + f2(r.ir) + " · IB " + f2(r.ib) : "Sin datos en " + nm(st.mes), r ? "Cobertura " + f2(r.cob) + " %" : ""]); });
            p.addEventListener("pointerleave", ocultarTip);
            p.addEventListener("click", function () { st.cod = st.cod === k ? null : k; todo(); });
          });
        });
      }
      function lado() {
        panel.innerHTML = "";
        var k = st.cod;
        if (k) {
          var x = info[k] || {}, r = calc((R[k] || {})[st.mes]);
          var v = el("button", "ag-volver", "← Toda la Red"); v.type = "button"; v.addEventListener("click", function () { st.cod = null; todo(); }); panel.appendChild(v);
          panel.appendChild(el("h3", null, x.eess || k)); panel.appendChild(el("p", "viz-note", (x.dist || "") + " · " + (x.prov || "") + " · RENAES " + k + " · " + nm(st.mes)));
          if (!r) { panel.appendChild(el("div", "empty", "Sin datos en este mes.")); return; }
          var dl = el("dl", "ag-ficha");
          [["Riesgo (IA)", null], ["Viviendas", r.insp + " inspeccionadas de " + r.prog + " (" + f2(r.cob) + " %)"], ["Viviendas positivas", String(r.pos)], ["Recipientes", r.rpos + " positivos de " + r.rinsp], ["Índice aédico", f2(r.ia)], ["Índice de recipientes", f2(r.ir)], ["Índice de Breteau", f2(r.ib)]].forEach(function (f) { dl.appendChild(el("dt", null, f[0])); var dd = el("dd"); if (f[1] == null) dd.appendChild(chipN(r.ia)); else dd.textContent = f[1]; dl.appendChild(dd); });
          panel.appendChild(dl);
          if (r.control) panel.appendChild(el("div", "box yellow vc-nota", "Revisar: " + r.control + "."));
          return;
        }
        panel.appendChild(el("h3", null, "Establecimientos con viviendas positivas")); panel.appendChild(el("p", "viz-note", nm(st.mes) + " · ordenados por índice aédico"));
        var l = cods.map(function (q) { return [q, calc((R[q] || {})[st.mes])]; }).filter(function (a) { return a[1] && a[1].pos > 0; }).sort(function (a, b) { return b[1].ia - a[1].ia; });
        if (!l.length) { panel.appendChild(el("div", "box green vc-ok", "Ningún establecimiento tuvo viviendas positivas en " + nm(st.mes) + ".")); return; }
        var ul = el("ul", "ag-lista");
        l.forEach(function (a) { var li = el("li"), b = el("button"); b.type = "button"; var t = el("span", "ag-lista-t"); t.appendChild(el("strong", null, (info[a[0]] || {}).eess || a[0])); t.appendChild(el("span", null, "IA " + f2(a[1].ia) + " · IR " + f2(a[1].ir) + " · IB " + f2(a[1].ib) + " · " + a[1].pos + " viv. positivas")); b.appendChild(t); b.appendChild(chipN(a[1].ia)); b.addEventListener("click", function () { st.cod = a[0]; todo(); }); li.appendChild(b); ul.appendChild(li); });
        panel.appendChild(ul);
      }
      function tabla() {
        cTab.innerHTML = "";
        var cab = el("div", "ag-tab-cab"); cab.appendChild(el("h3", null, "Indicadores por establecimiento · " + nm(st.mes))); cab.appendChild(el("span", "ag-tab-n", actDe(st.mes))); cTab.appendChild(cab);
        var w = el("div", "ag-tab-w"), t = el("table", "ag-tab vc-tab"); w.appendChild(t);
        var tr0 = el("tr"); ["Provincia", "Distrito", "Establecimiento", "Programadas", "Inspeccionadas", "Cobertura %", "Viv. +", "Rec. inspec.", "Rec. +", "IA", "IR", "IB", "Riesgo"].forEach(function (h, i) { tr0.appendChild(el("th", i >= 3 ? "c" : null, h)); });
        var th = el("thead"); th.appendChild(tr0); t.appendChild(th); var tb = el("tbody"); t.appendChild(tb);
        cods.forEach(function (k) {
          var r = calc((R[k] || {})[st.mes]); if (!r) return; var x = info[k] || {};
          var tr = el("tr", st.cod === k ? "sel" : null);
          [x.prov, x.dist, x.eess || k].forEach(function (v, i) { tr.appendChild(el("td", i === 2 ? "b" : null, v)); });
          [r.prog, r.insp, f2(r.cob), r.pos, r.rinsp, r.rpos, f2(r.ia), f2(r.ir), f2(r.ib)].forEach(function (v) { tr.appendChild(el("td", "c", v == null ? "–" : String(v))); });
          var td = el("td", "c"); td.appendChild(chipN(r.ia)); tr.appendChild(td);
          tr.addEventListener("click", function () { st.cod = k; todo(); cTend.scrollIntoView({ behavior: "smooth", block: "start" }); });
          tb.appendChild(tr);
        });
        var T0 = total(st.mes), tr = el("tr", "vc-total"); [["TOTAL RED", 3]].forEach(function (a) { var d = el("td", "b", a[0]); d.colSpan = a[1]; tr.appendChild(d); });
        [T0.prog, T0.insp, f2(T0.cob), T0.pos, T0.rinsp, T0.rpos, f2(T0.ia), f2(T0.ir), f2(T0.ib)].forEach(function (v) { tr.appendChild(el("td", "c", String(v))); }); var tdt = el("td", "c"); tdt.appendChild(chipN(T0.ia)); tr.appendChild(tdt); tb.appendChild(tr);
        cTab.appendChild(w);
      }
      function tiposRec() {
        cTip.innerHTML = ""; cTip.appendChild(el("h3", null, "Recipientes positivos por tipo"));
        var t = total(st.mes), ac = [0]; M.forEach(function (x) { if (x.m.slice(0, 4) === st.mes.slice(0, 4) && x.m <= st.mes) total(x.m).tipos.forEach(function (v, j) { ac[j] = (ac[j] || 0) + (v || 0); }); });
        cTip.appendChild(el("p", "viz-note", "Barra: " + nm(st.mes) + " · número gris: acumulado del año hasta ese mes. Ayuda a orientar el control de criaderos."));
        var mx = Math.max.apply(null, (t.tipos || []).concat([1]));
        X.tipos.map(function (n, j) { return [n, t.tipos[j] || 0, ac[j] || 0]; }).sort(function (a, b) { return b[1] - a[1] || b[2] - a[2]; }).forEach(function (a) {
          if (!a[1] && !a[2]) return;
          var f = el("div", "ag-par"); f.appendChild(el("span", "ag-par-t", a[0])); var b = el("span", "ag-par-b vc-bar"); var i = el("i"); i.style.width = (a[1] / mx * 100) + "%"; b.appendChild(i); f.appendChild(b); f.appendChild(el("span", "ag-par-n", a[1] + " · " + a[2])); cTip.appendChild(f);
        });
        if (!(t.rpos > 0) && !ac.some(Boolean)) cTip.appendChild(el("div", "box green vc-ok", "Sin recipientes positivos registrados."));
      }
      function controles() {
        cCtl.innerHTML = ""; cCtl.appendChild(el("h3", null, "Calidad del registro"));
        cCtl.appendChild(el("p", "viz-note", "Inconsistencias detectadas automáticamente en " + nm(st.mes) + ", para corregir en el archivo del mes."));
        var l = cods.map(function (k) { return [k, calc((R[k] || {})[st.mes])]; }).filter(function (a) { return a[1] && a[1].control; });
        if (!l.length) { cCtl.appendChild(el("div", "box green vc-ok", "Sin inconsistencias en este mes.")); return; }
        l.forEach(function (a) { var d = el("div", "vc-alerta"); d.appendChild(el("strong", null, (info[a[0]] || {}).eess || a[0])); d.appendChild(el("span", null, a[1].control)); cCtl.appendChild(d); });
      }
      function calor() {
        cHeat.innerHTML = "";
        var cab = el("div", "ag-tab-cab"); cab.appendChild(el("h3", null, IND[st.ind][0] + " por establecimiento y mes")); cab.appendChild(el("span", "ag-tab-n", st.ind === "cob" ? "% de viviendas programadas que se inspeccionaron" : "color según el riesgo del índice aédico")); cHeat.appendChild(cab);
        var w = el("div", "ag-tab-w"), t = el("table", "ag-tab vc-tab vc-calor"); w.appendChild(t);
        var tr0 = el("tr"); tr0.appendChild(el("th", null, "Establecimiento")); M.forEach(function (x) { var h = el("th", "c" + (x.m === st.mes ? " act" : ""), nm(x.m, true)); h.title = x.act; tr0.appendChild(h); });
        var th = el("thead"); th.appendChild(tr0); t.appendChild(th); var tb = el("tbody"); t.appendChild(tb);
        cods.forEach(function (k) {
          var tr = el("tr", st.cod === k ? "sel" : null); tr.appendChild(el("td", "b", (info[k] || {}).eess || k));
          M.forEach(function (x) {
            var r = calc((R[k] || {})[x.m]), v = r ? r[st.ind] : null, td = el("td", "c");
            if (r && v != null) { td.textContent = f2(v); if (st.ind === "cob") { td.style.background = v >= 90 ? "#d9f0e1" : v >= 70 ? "#fbf0c6" : "#f7cdcd"; } else { var n = nivel(r.ia); td.style.background = TNIV[n]; if (n === 2) td.style.fontWeight = "bold"; } }
            else td.textContent = "·";
            if (x.m === st.mes) td.classList.add("act");
            tr.appendChild(td);
          });
          tr.addEventListener("click", function () { st.cod = k; todo(); cTend.scrollIntoView({ behavior: "smooth", block: "start" }); });
          tb.appendChild(tr);
        });
        cHeat.appendChild(w);
        cHeat.appendChild(el("p", "viz-note", "· = sin datos. Pulse un establecimiento para ver su evolución." + (st.ind === "cob" ? " Verde: 90 % o más · amarillo: 70 a 89 % · rojo: menos de 70 %." : "")));
      }
      function todo() { kpis(); tendencia(); mapa(); lado(); tabla(); tiposRec(); controles(); calor(); }
      todo();
    }

    function formulas(c) {
            var g = el("div", "vc-formulas"); c.appendChild(g);
      [["IA", "Índice aédico", "Viviendas positivas", "Viviendas inspeccionadas", "Porcentaje de viviendas con al menos un recipiente con larvas o pupas de Aedes aegypti."],
       ["IR", "Índice de recipientes", "Recipientes positivos", "Recipientes con agua inspeccionados", "Porcentaje de recipientes con agua que tienen larvas o pupas."],
       ["IB", "Índice de Breteau", "Recipientes positivos", "Viviendas inspeccionadas", "Recipientes positivos por cada 100 viviendas inspeccionadas."],
       ["?", "Cuarto índice", "Por definir", "", "Pendiente de confirmar con el área (p. ej. índice de positividad de ovitrampas o índice pupal)."]].forEach(function (f) {
        var k = el("div", "vc-form" + (f[0] === "?" ? " pend" : "")); k.appendChild(el("span", "vc-form-s", f[0]));
        var t = el("div"); t.appendChild(el("strong", null, f[1]));
        if (f[3]) { var fr = el("div", "vc-frac"); fr.appendChild(el("span", null, f[2])); fr.appendChild(el("span", null, f[3])); var w = el("div", "vc-eq"); w.appendChild(fr); w.appendChild(el("b", null, "× 100")); t.appendChild(w); }
        t.appendChild(el("p", null, f[4])); k.appendChild(t); g.appendChild(k);
      });
    }

    function lutzomyia(c) {
      var Z = V.lutzomyia || {}, LOC = Z.localidades || [], M = Z.meses || [], R = Z.reg || {}, ES = Z.escala || [0.5, 1];
      var NIV = ["Bajo riesgo", "Mediano riesgo", "Alto riesgo"], CN = ["#2e9e5b", "#e3b11c", "#d33a3a"], TN = ["#d9f0e1", "#fbf0c6", "#f7cdcd"];
      var MN = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "setiembre", "octubre", "noviembre", "diciembre"];
      function nm(m) { var p = m.split("-"); var t = MN[+p[1] - 1]; return t.charAt(0).toUpperCase() + t.slice(1) + " " + p[0]; }
      function f2(x) { return x == null ? "–" : (Math.round(x * 100) / 100).toFixed(2).replace(".", ","); }
      var intro = el("div", "vc-lutzo"); c.appendChild(intro); intro.appendChild(flebotomo("vc-lutzo-ilu"));
      var it = el("div"); intro.appendChild(it);
      it.appendChild(el("h3", null, "Vigilancia de Lutzomyia · manta blanca"));
      it.appendChild(el("p", null, "Los flebótomos del género Lutzomyia transmiten la leishmaniasis. En la vigilancia se colocan trampas en las localidades de riesgo y se cuentan las hembras capturadas, separando las alimentadas (con sangre) de las sin alimento: la proporción entre ambas da el índice de nivel de riesgo relativo (INRR)."));
      if (!LOC.length) { c.appendChild(el("div", "empty", "Aún no se ha cargado el listado de localidades (datos/vectores/lutzomyia/).")); return; }
      var st = { mes: M.length ? M[M.length - 1] : null, id: null };
      function calc(id, m) {
        var v = m && (R[id] || {})[m]; if (!v) return null;
        var r = { ha: v[0], hs: v[1], ma: v[2], ictp: v[3], itn: v[4], obs: v[5] };
        if (!r.hs) r.inrr = r.ha ? null : 0; else r.inrr = (r.ha || 0) / r.hs;
        r.niv = r.inrr == null ? 2 : r.inrr < ES[0] ? 0 : r.inrr < ES[1] ? 1 : 2;
        return r;
      }
      function chipN(r) { var x = el("span", "vc-esc", r ? NIV[r.niv] : "Sin evaluar"); x.style.background = r ? CN[r.niv] : "#b9c2c9"; return x; }
      var porD = {}; LOC.forEach(function (x) { if (x.ubigeo) (porD[x.ubigeo] = porD[x.ubigeo] || []).push(x); });
      var ctl = el("div", "ag-ctl"); c.appendChild(ctl);
      if (M.length) { var l = el("label", "dash-sel"); l.appendChild(el("span", null, "Mes evaluado")); var sM = el("select"); M.slice().reverse().forEach(function (m) { sM.appendChild(new Option(nm(m), m)); }); sM.value = st.mes; sM.addEventListener("change", function () { st.mes = sM.value; todo(); }); l.appendChild(sM); ctl.appendChild(l); }
      var kp = el("div", "kpi-grid ag-kpis"); c.appendChild(kp);
      var grid = el("div", "ag-grid"); c.appendChild(grid);
      var cMapa = el("section", "viz-card ag-mapa vc-mapa"); grid.appendChild(cMapa);
      var panel = el("section", "viz-card ag-panel"); grid.appendChild(panel);
      var cTab = el("section", "viz-card ag-tabla"); c.appendChild(cTab);
      var esc = el("div", "vc-formulas vc-lz-esc"); c.appendChild(esc);
      var nota = el("p", "dash-nota"); c.appendChild(nota);

      // Escala e interpretación
      var k1 = el("div", "vc-form"); k1.appendChild(el("span", "vc-form-s chico", "INRR")); var t1 = el("div"); t1.appendChild(el("strong", null, "Índice de nivel de riesgo relativo"));
      var fr = el("div", "vc-frac"); fr.appendChild(el("span", null, "Hembras alimentadas")); fr.appendChild(el("span", null, "Hembras sin alimento")); var w = el("div", "vc-eq"); w.appendChild(fr); t1.appendChild(w);
      t1.appendChild(el("p", null, "Solo se consideran las hembras. Si hay hembras alimentadas y ninguna sin alimento, se califica como alto riesgo.")); k1.appendChild(t1); esc.appendChild(k1);
      var k2 = el("div", "vc-form"); k2.appendChild(el("span", "vc-form-s", "⚖")); var t2 = el("div"); t2.appendChild(el("strong", null, "Escala de riesgo"));
      var ul = el("ul", "vc-lz-niv"); [["Bajo riesgo", "menos de " + f2(ES[0])], ["Mediano riesgo", f2(ES[0]) + " a menos de " + f2(ES[1])], ["Alto riesgo", f2(ES[1]) + " o más"]].forEach(function (x, i) { var li = el("li"); var b = el("span", "vc-esc", x[0]); b.style.background = CN[i]; li.appendChild(b); li.appendChild(document.createTextNode(" " + x[1])); ul.appendChild(li); });
      t2.appendChild(ul); t2.appendChild(el("p", null, "El índice de colecta (ICTP) y el índice de trampa (ITN) se publican tal como los registra el área.")); k2.appendChild(t2); esc.appendChild(k2);

      // Mapa
      cMapa.appendChild(el("h3", null, "Localidades en vigilancia de Lutzomyia"));
      var nM = el("p", "viz-note"); cMapa.appendChild(nM);
      var ley = el("div", "ag-ley"); cMapa.appendChild(ley);
      NIV.forEach(function (n, i) { var s2 = el("span"); var q = el("i"); q.style.background = CN[i]; s2.appendChild(q); s2.appendChild(document.createTextNode(n)); ley.appendChild(s2); });
      var s0 = el("span"); var q0 = el("i"); q0.style.background = "#b9c2c9"; s0.appendChild(q0); s0.appendChild(document.createTextNode("En vigilancia, sin evaluar en el mes")); ley.appendChild(s0);
      var T = window.TERRITORIO, GD = window.GeoDistritos, svgM = null, formas = {}, geo = {}, capa;
      if (T && T.geo && GD) {
        var bb = [1e9, 1e9, -1e9, -1e9];
        T.geo.distritos.forEach(function (d) { if (!d.red) return; var rs = GD.anillos(d.d); geo[d.u] = { rs: rs, b: GD.caja(rs), n: d.n }; });
        Object.keys(porD).forEach(function (u) { if (!geo[u]) return; geo[u].c = GD.centro(geo[u].rs, geo[u].b); var b = geo[u].b; bb = [Math.min(bb[0], b[0]), Math.min(bb[1], b[1]), Math.max(bb[2], b[2]), Math.max(bb[3], b[3])]; });
        var W = (bb[2] - bb[0]) * 1.45, H = (bb[3] - bb[1]) * 1.3, cx = (bb[0] + bb[2]) / 2, cy = (bb[1] + bb[3]) / 2;
        svgM = sv("svg", { class: "ag-svg", viewBox: (cx - W / 2) + " " + (cy - H / 2) + " " + W + " " + H, role: "img", "aria-label": "Mapa de localidades en vigilancia de Lutzomyia" }, cMapa);
        var cp = sv("g", {}, svgM);
        T.geo.distritos.forEach(function (d) { var p = sv("path", { d: d.d, class: "ag-d" + (d.red ? " red" : "") }, cp); if (d.red) formas[d.u] = p; });
        if (T.geo.departamento) sv("path", { d: T.geo.departamento, class: "ag-dep" }, svgM);
        capa = sv("g", {}, svgM); svgM._w = Math.min(W, H * 1.4);
      }
      function mapa() {
        nM.textContent = "Cada punto es una localidad en vigilancia, agrupada en su distrito (ubicación aproximada). " + (st.mes ? "Color según el INRR de " + nm(st.mes).toLowerCase() + "." : "Aún no hay índices registrados.");
        if (!svgM) return;
        Object.keys(formas).forEach(function (u) { var n = -1; (porD[u] || []).forEach(function (x) { var r = calc(x.id, st.mes); if (r) n = Math.max(n, r.niv); }); formas[u].style.fill = porD[u] ? (n >= 0 ? TN[n] : "#e4ece6") : "#f3f5f6"; formas[u].classList.toggle("con", !!porD[u]); });
        capa.innerHTML = ""; var r0 = svgM._w / 70;
        Object.keys(porD).forEach(function (u) {
          var g = geo[u]; if (!g || !g.c) return;
          porD[u].slice().sort(function (a, b) { return (calc(b.id, st.mes) ? 1 : 0) - (calc(a.id, st.mes) ? 1 : 0); }).forEach(function (x, i) {
            var r = calc(x.id, st.mes), ang = i * 2.39996, rad = i ? r0 * 2.5 * Math.sqrt(i) * .62 : 0;
            var p = sv("circle", { cx: g.c[0] + Math.cos(ang) * rad, cy: g.c[1] + Math.sin(ang) * rad, r: r ? r0 * 1.25 : r0, fill: r ? CN[r.niv] : "#b9c2c9", class: "ag-p vc-p" + (st.id === x.id ? " sel" : "") }, capa);
            p.addEventListener("pointermove", function (ev) { verTip(ev, x.loc, [x.dist + " · " + x.eess, r ? "INRR " + f2(r.inrr) + " · " + NIV[r.niv] : "Sin evaluar en el mes"]); });
            p.addEventListener("pointerleave", ocultarTip);
            p.addEventListener("click", function () { st.id = st.id === x.id ? null : x.id; todo(); });
          });
        });
      }
      function kpis() {
        kp.innerHTML = "";
        var ev = LOC.filter(function (x) { return calc(x.id, st.mes); }), cn = [0, 0, 0], ha = 0, hs = 0;
        ev.forEach(function (x) { var r = calc(x.id, st.mes); cn[r.niv]++; ha += r.ha || 0; hs += r.hs || 0; });
        var dists = {}; LOC.forEach(function (x) { if (x.ubigeo) dists[x.ubigeo] = 1; });
        [["Localidades en vigilancia", String(LOC.length), Object.keys(dists).length + " distritos de la Red", "#2e4a25"],
         ["Evaluadas en " + (st.mes ? nm(st.mes).toLowerCase() : "el mes"), String(ev.length), st.mes ? "con captura registrada" : "sin índices registrados aún", "#2e4a25"],
         ["Hembras capturadas", String(ha + hs), ha + " alimentadas · " + hs + " sin alimento", "#9a5b00"],
         ["Alto riesgo", String(cn[2]), "localidades con INRR de " + f2(ES[1]) + " o más", cn[2] ? CN[2] : CN[0]],
         ["Mediano riesgo", String(cn[1]), "localidades", cn[1] ? CN[1] : CN[0]]].forEach(function (k) {
          var d = el("div", "kpi vc-kpi"); d.style.borderTopColor = k[3]; d.appendChild(el("span", "kpi-l", k[0])); d.appendChild(el("span", "kpi-v", k[1])); d.appendChild(el("span", "kpi-s", k[2])); kp.appendChild(d);
        });
      }
      function lado() {
        panel.innerHTML = "";
        var x = st.id && LOC.filter(function (y) { return y.id === st.id; })[0];
        if (x) {
          var r = calc(x.id, st.mes), v = el("button", "ag-volver", "← Todas las localidades"); v.type = "button"; v.addEventListener("click", function () { st.id = null; todo(); }); panel.appendChild(v);
          panel.appendChild(el("h3", null, x.loc)); panel.appendChild(el("p", "viz-note", [x.dist, x.prov, x.eess ? "EE.SS. " + x.eess : ""].filter(Boolean).join(" · ")));
          var dl = el("dl", "ag-ficha");
          [["Riesgo" + (st.mes ? " (" + nm(st.mes).toLowerCase() + ")" : ""), null], ["Hembras alimentadas", r && r.ha != null ? String(r.ha) : "–"], ["Hembras sin alimento", r && r.hs != null ? String(r.hs) : "–"], ["Machos", r && r.ma != null ? String(r.ma) : "–"], ["INRR", r ? f2(r.inrr) : "–"], ["Índice de colecta (ICTP)", r ? f2(r.ictp) : "–"], ["Índice de trampa (ITN)", r ? f2(r.itn) : "–"]].forEach(function (f) { dl.appendChild(el("dt", null, f[0])); var dd = el("dd"); if (f[1] == null) dd.appendChild(chipN(r)); else dd.textContent = f[1]; dl.appendChild(dd); });
          panel.appendChild(dl);
          if (r && r.obs) panel.appendChild(el("p", "vc-def-p", "Observación: " + r.obs));
          if (x.nota) panel.appendChild(el("div", "box yellow vc-nota", x.nota));
          var hist = M.filter(function (m) { return calc(x.id, m); }); if (hist.length > 1) { panel.appendChild(el("h4", "ag-h4", "Historial")); var h = el("div", "ag-hist"); hist.forEach(function (m) { var w2 = el("div", "ag-hist-m" + (m === st.mes ? " act" : "")); w2.appendChild(el("span", null, nm(m))); w2.appendChild(chipN(calc(x.id, m))); h.appendChild(w2); }); panel.appendChild(h); }
          return;
        }
        panel.appendChild(el("h3", null, st.mes ? "Localidades evaluadas · " + nm(st.mes) : "Localidades evaluadas"));
        var ev = LOC.filter(function (y) { return calc(y.id, st.mes); }).sort(function (a, b) { var A = calc(a.id, st.mes), B = calc(b.id, st.mes); return B.niv - A.niv || (B.inrr || 0) - (A.inrr || 0); });
        if (!ev.length) { panel.appendChild(el("div", "empty", "Aún no hay localidades evaluadas.")); return; }
        panel.appendChild(el("p", "viz-note", ev.length + " de " + LOC.length + " localidades en vigilancia tuvieron captura en el mes."));
        var u2 = el("ul", "ag-lista");
        ev.forEach(function (y) { var r = calc(y.id, st.mes), li = el("li"), b = el("button"); b.type = "button"; var t = el("span", "ag-lista-t"); t.appendChild(el("strong", null, y.loc)); t.appendChild(el("span", null, (y.dist || "Distrito por confirmar") + " · INRR " + f2(r.inrr) + " · ICTP " + f2(r.ictp) + " · ITN " + f2(r.itn))); b.appendChild(t); b.appendChild(chipN(r)); b.addEventListener("click", function () { st.id = y.id; todo(); }); li.appendChild(b); u2.appendChild(li); });
        panel.appendChild(u2);
      }
      function tabla() {
        cTab.innerHTML = "";
        var cab = el("div", "ag-tab-cab"); cab.appendChild(el("h3", null, "Localidades en vigilancia")); cab.appendChild(el("span", "ag-tab-n", LOC.length + " localidades")); cTab.appendChild(cab);
        var w3 = el("div", "ag-tab-w"), t = el("table", "ag-tab vc-tab"); w3.appendChild(t);
        var tr0 = el("tr"); ["Provincia", "Distrito", "Microred", "Establecimiento", "Localidad", "H. alimentadas", "H. sin alimento", "ICTP", "ITN", "INRR", "Riesgo"].forEach(function (h, i) { tr0.appendChild(el("th", i >= 5 ? "c" : null, h)); });
        var th = el("thead"); th.appendChild(tr0); t.appendChild(th); var tb = el("tbody"); t.appendChild(tb);
        LOC.slice().sort(function (a, b) { var A = calc(a.id, st.mes), B = calc(b.id, st.mes); return (B ? 1 : 0) - (A ? 1 : 0) || (a.prov || "zz").localeCompare(b.prov || "zz") || (a.dist || "").localeCompare(b.dist || "") || a.loc.localeCompare(b.loc); }).forEach(function (x) {
          var r = calc(x.id, st.mes), tr = el("tr", st.id === x.id ? "sel" : null);
          [x.prov || "–", x.dist || "Por confirmar", x.mr || "–", x.eess || "–", x.loc].forEach(function (v, i) { tr.appendChild(el("td", i === 4 ? "b" : null, v)); });
          [r ? r.ha : null, r ? r.hs : null].forEach(function (v) { tr.appendChild(el("td", "c", v == null ? "·" : String(v))); });
          [r && r.ictp, r && r.itn, r && r.inrr].forEach(function (v, i) { tr.appendChild(el("td", "c", r ? f2(i === 2 ? r.inrr : v) : "·")); });
          var td = el("td", "c"); td.appendChild(chipN(r)); tr.appendChild(td);
          tr.addEventListener("click", function () { st.id = x.id; todo(); cMapa.scrollIntoView({ behavior: "smooth", block: "start" }); });
          tb.appendChild(tr);
        });
        cTab.appendChild(w3);
        cTab.appendChild(el("p", "viz-note", "· = sin evaluación en el mes. Pulse una localidad para verla en el mapa."));
      }
      function todo() {
        kpis(); mapa(); lado(); tabla();
        nota.textContent = "Fuente: vigilancia entomológica de Lutzomyia, Área de Salud Ambiental – Red de Salud Chachapoyas. " + (M.length && M.length < 3 && Z.nota ? Z.nota + " " : "") + "Meses con índices: " + (M.length ? M.map(nm).join(", ") : "ninguno") + ".";
      }
      todo();
    }

    // ---------- Escenarios ----------
    function escenarios(c) {
      var L = ((V.aedes || {}).escenarios) || [];
      if (!L.length) { c.appendChild(el("div", "empty", "Aún no se ha cargado la clasificación de escenarios (datos/vectores/escenarios/).")); return; }
      var f = { esc: "", prov: "", q: "", dist: null, cod: null };
      var porDist = {}; L.forEach(function (x) { (porDist[x.ubigeo] = porDist[x.ubigeo] || []).push(x); });
      var cuenta = { 1: 0, 2: 0, 3: 0 }; L.forEach(function (x) { cuenta[x.esc]++; });

      var defs = el("div", "vc-defs"); c.appendChild(defs);
      [2, 1, 3].forEach(function (e) {
        var d = el("button", "vc-def"); d.type = "button"; d.style.setProperty("--c", ESC[e]);
        var n = el("span", "vc-def-n", String(cuenta[e])); d.appendChild(n);
        var t = el("span", "vc-def-t"); t.appendChild(el("strong", null, "Escenario " + ROM[e] + " · " + DEF[e][0])); t.appendChild(el("span", null, DEF[e][1])); d.appendChild(t);
        d.appendChild(el("span", "vc-def-u", cuenta[e] === 1 ? "establecimiento" : "establecimientos"));
        if (!cuenta[e]) d.classList.add("cero");
        d.addEventListener("click", function () { if (!cuenta[e]) return; f.esc = f.esc === String(e) ? "" : String(e); sEsc.value = f.esc; f.dist = null; f.cod = null; todo(); });
        defs.appendChild(d);
      });

      var ctl = el("div", "ag-ctl"); c.appendChild(ctl);
      function sel(etq, ops, fn) { var l = el("label", "dash-sel"); l.appendChild(el("span", null, etq)); var s = el("select"); ops.forEach(function (o) { s.appendChild(new Option(o[1], o[0])); }); s.addEventListener("change", function () { fn(s.value); }); l.appendChild(s); ctl.appendChild(l); return s; }
      var sEsc = sel("Escenario", [["", "Todos"], ["2", "Escenario II"], ["1", "Escenario I"]].concat(cuenta[3] ? [["3", "Escenario III"]] : []), function (v) { f.esc = v; f.cod = null; todo(); });
      var provs = []; L.forEach(function (x) { if (provs.indexOf(x.prov) < 0) provs.push(x.prov); }); provs.sort();
      var sProv = sel("Provincia", [["", "Toda la Red"]].concat(provs.map(function (p) { return [p, p]; })), function (v) { f.prov = v; f.dist = null; f.cod = null; enfocar(); todo(); });
      var lq = el("label", "dash-sel ag-buscar"); lq.appendChild(el("span", null, "Buscar")); var iq = el("input"); iq.type = "search"; iq.placeholder = "Establecimiento, distrito o código RENAES"; lq.appendChild(iq); ctl.appendChild(lq);
      iq.addEventListener("input", function () { f.q = iq.value.trim(); todo(); });

      var kp = el("div", "kpi-grid ag-kpis"); c.appendChild(kp);
      var grid = el("div", "ag-grid"); c.appendChild(grid);
      var cMapa = el("section", "viz-card ag-mapa vc-mapa"); grid.appendChild(cMapa);
      var panel = el("section", "viz-card ag-panel"); grid.appendChild(panel);
      var cTab = el("section", "viz-card ag-tabla"); c.appendChild(cTab);
      c.appendChild(el("p", "dash-nota", "Fuente: " + (V.fuente || "Área de Salud Ambiental") + ". Solo establecimientos de la Red de Salud Chachapoyas. La muestra es el número de viviendas a inspeccionar (método aleatorio sistemático), redondeado al entero superior. Ubicación de los establecimientos aproximada, dentro de su distrito. Actualizado: " + fFecha(V.actualizado) + "."));

      function pasa(x) {
        if (f.esc && String(x.esc) !== f.esc) return false;
        if (f.prov && x.prov !== f.prov) return false;
        if (f.dist && x.ubigeo !== f.dist) return false;
        if (f.q && sinTilde([x.eess, x.dist, x.prov, x.cod].join(" ")).indexOf(sinTilde(f.q)) < 0) return false;
        return true;
      }

      // Mapa
      cMapa.appendChild(el("h3", null, "Escenarios de Aedes aegypti en la Red"));
      cMapa.appendChild(el("p", "viz-note", "Cada punto es un establecimiento en vigilancia, agrupado en su distrito; su tamaño refleja las viviendas de su ámbito. El distrito toma el color del escenario más alto."));
      var ley = el("div", "ag-ley"); cMapa.appendChild(ley);
      [2, 1].concat(cuenta[3] ? [3] : []).forEach(function (e) { var s = el("span"); var i = el("i"); i.style.background = ESC[e]; s.appendChild(i); s.appendChild(document.createTextNode("Escenario " + ROM[e])); ley.appendChild(s); });
      var s0 = el("span"); var i0 = el("i"); i0.style.background = "#e3e8eb"; s0.appendChild(i0); s0.appendChild(document.createTextNode("Sin establecimientos en vigilancia")); ley.appendChild(s0);
      var zb = el("div", "ag-zoom"); cMapa.appendChild(zb); var bRed = el("button", null, "Ver toda la Red"); bRed.type = "button"; zb.appendChild(bRed);
      bRed.addEventListener("click", function () { f.dist = null; f.cod = null; f.prov = ""; sProv.value = ""; enfocar(); todo(); });
      var T = window.TERRITORIO, GD = window.GeoDistritos, svg = null, formas = {}, geo = {}, capaP, vista;
      if (T && T.geo && GD) {
        T.geo.distritos.forEach(function (d) { if (d.red) { var rs = GD.anillos(d.d); geo[d.u] = { rs: rs, b: GD.caja(rs), n: d.n }; } });
        var bR = [1e9, 1e9, -1e9, -1e9]; Object.keys(geo).forEach(function (u) { var b = geo[u].b; bR = [Math.min(bR[0], b[0]), Math.min(bR[1], b[1]), Math.max(bR[2], b[2]), Math.max(bR[3], b[3])]; });
        Object.keys(porDist).forEach(function (u) { if (geo[u]) geo[u].c = GD.centro(geo[u].rs, geo[u].b); });
        svg = sv("svg", { class: "ag-svg", role: "img", "aria-label": "Mapa de escenarios de Aedes aegypti" }, cMapa);
        var capa = sv("g", {}, svg);
        T.geo.distritos.forEach(function (d) {
          var p = sv("path", { d: d.d, class: "ag-d" + (d.red ? " red" : "") }, capa);
          if (!d.red) return; formas[d.u] = p;
          p.addEventListener("pointermove", function (ev) { var l = porDist[d.u] || []; verTip(ev, d.n, l.length ? l.map(function (x) { return x.eess + " · Esc. " + ROM[x.esc]; }) : ["Sin establecimientos en vigilancia de Aedes"]); });
          p.addEventListener("pointerleave", ocultarTip);
          p.addEventListener("click", function () { if (!porDist[d.u]) return; f.dist = f.dist === d.u ? null : d.u; f.cod = null; enfocar(); todo(); });
        });
        if (T.geo.departamento) sv("path", { d: T.geo.departamento, class: "ag-dep" }, svg);
        capaP = sv("g", {}, svg);
        geo.__red = { b: bR };
      }
      var maxV = Math.max.apply(null, L.map(function (x) { return x.viv || 0; }).concat([1]));
      function enfocar() {
        if (!svg) return;
        var b = geo.__red.b;
        if (f.dist && geo[f.dist]) b = geo[f.dist].b;
        else if (f.prov) { var bb = [1e9, 1e9, -1e9, -1e9]; L.forEach(function (x) { if (x.prov !== f.prov || !geo[x.ubigeo]) return; var q = geo[x.ubigeo].b; bb = [Math.min(bb[0], q[0]), Math.min(bb[1], q[1]), Math.max(bb[2], q[2]), Math.max(bb[3], q[3])]; }); if (bb[2] > bb[0]) b = bb; }
        var w = Math.max(b[2] - b[0], 40) * 1.14, h = Math.max(b[3] - b[1], 40) * 1.14, cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2;
        vista = [cx - w / 2, cy - h / 2, w, h]; svg.setAttribute("viewBox", vista.join(" "));
      }
      function mapa() {
        if (!svg) return;
        Object.keys(formas).forEach(function (u) {
          var l = (porDist[u] || []).filter(function (x) { return !f.esc || String(x.esc) === f.esc; }), m = 0;
          l.forEach(function (x) { m = Math.max(m, x.esc); });
          formas[u].style.fill = m ? TINTE[m] : "#eef1f3";
          formas[u].classList.toggle("con", !!(porDist[u] || []).length);
          formas[u].classList.toggle("sel", f.dist === u);
          formas[u].classList.toggle("off", !!(f.prov && porDist[u] && porDist[u][0].prov !== f.prov));
        });
        capaP.innerHTML = "";
        var W = Math.min(vista[2], vista[3] * 1.4), r0 = W / (f.dist ? 30 : 80);
        Object.keys(porDist).forEach(function (u) {
          var g = geo[u]; if (!g || !g.c) return;
          porDist[u].slice().sort(function (a, b) { return b.esc - a.esc || (b.viv || 0) - (a.viv || 0); }).forEach(function (x, i) {
            var r = r0 * (0.75 + 0.75 * Math.sqrt((x.viv || 0) / maxV)), ang = i * 2.39996, rad = i ? r0 * 2.6 * Math.sqrt(i) * .62 : 0;
            var cx = g.c[0] + Math.cos(ang) * rad, cy = g.c[1] + Math.sin(ang) * rad;
            var p = sv("circle", { cx: cx.toFixed(2), cy: cy.toFixed(2), r: r.toFixed(2), fill: ESC[x.esc], class: "ag-p vc-p" + (pasa(x) ? "" : " off") + (f.cod === x.cod ? " sel" : "") }, capaP);
            p.addEventListener("pointermove", function (ev) { verTip(ev, x.eess, ["Escenario " + ROM[x.esc] + " · " + x.dist, "Viviendas: " + fmt(x.viv) + " · Muestra: " + fmt(x.muestra)]); });
            p.addEventListener("pointerleave", ocultarTip);
            p.addEventListener("click", function (ev) { ev.stopPropagation(); f.cod = x.cod; f.dist = x.ubigeo; enfocar(); todo(); });
          });
        });
        bRed.hidden = !f.dist && !f.prov;
      }

      function kpis() {
        kp.innerHTML = "";
        var l = L.filter(function (x) { return (!f.prov || x.prov === f.prov) && (!f.esc || String(x.esc) === f.esc); });
        var viv = 0, mu = 0, ds = {}; l.forEach(function (x) { viv += x.viv || 0; mu += x.muestra || 0; ds[x.ubigeo] = 1; });
        [["Establecimientos en vigilancia", fmt(l.length), (f.esc ? "escenario " + ROM[f.esc] : "escenarios I y II") + (f.prov ? " · " + f.prov : " · toda la Red")],
         ["Distritos involucrados", fmt(Object.keys(ds).length), "de los 68 distritos de la Red"],
         ["Viviendas en el ámbito", fmt(viv), "total de viviendas de los establecimientos"],
         ["Viviendas a inspeccionar", fmt(mu), "muestra por método aleatorio sistemático"]].forEach(function (k) {
          var d = el("div", "kpi vc-kpi"); d.appendChild(el("span", "kpi-l", k[0])); d.appendChild(el("span", "kpi-v", k[1])); d.appendChild(el("span", "kpi-s", k[2])); kp.appendChild(d);
        });
      }

      function lado() {
        panel.innerHTML = "";
        var x = f.cod && L.filter(function (y) { return y.cod === f.cod; })[0];
        if (x) {
          var v = el("button", "ag-volver", "← Volver al distrito"); v.type = "button"; v.addEventListener("click", function () { f.cod = null; todo(); }); panel.appendChild(v);
          panel.appendChild(el("h3", null, x.eess)); panel.appendChild(el("p", "viz-note", x.dist + " · " + x.prov + " · RENAES " + x.cod));
          var dl = el("dl", "ag-ficha");
          [["Escenario", null], ["Situación", DEF[x.esc][0]], ["Total de viviendas", fmt(x.viv)], ["Viviendas a inspeccionar (muestra)", fmt(x.muestra)], ["Cobertura de la muestra", x.viv && x.muestra ? Math.round(x.muestra / x.viv * 100) + "% de las viviendas" : "–"]].forEach(function (r) {
            dl.appendChild(el("dt", null, r[0])); var dd = el("dd"); if (r[1] == null) dd.appendChild(etiqueta(x.esc)); else dd.textContent = r[1]; dl.appendChild(dd);
          });
          panel.appendChild(dl);
          panel.appendChild(el("p", "vc-def-p", DEF[x.esc][1]));
          if (x.nota) panel.appendChild(el("div", "box yellow vc-nota", x.nota));
          if (!x.viv) panel.appendChild(el("div", "box yellow vc-nota", "Sin dato de viviendas en la clasificación."));
          return;
        }
        var l, tit, sub;
        if (f.dist && geo[f.dist]) { l = porDist[f.dist] || []; tit = "Distrito " + geo[f.dist].n; sub = l.length + (l.length === 1 ? " establecimiento" : " establecimientos") + " en vigilancia"; }
        else { l = L.filter(function (y) { return y.esc >= 2 && (!f.prov || y.prov === f.prov); }); tit = "Establecimientos en escenario II"; sub = "Vector presente: prioridad para la vigilancia de índices aédicos. Pulse uno para ver su ficha."; }
        panel.appendChild(el("h3", null, tit)); panel.appendChild(el("p", "viz-note", sub));
        var ul = el("ul", "ag-lista");
        l.slice().sort(function (a, b) { return b.esc - a.esc || (b.viv || 0) - (a.viv || 0); }).forEach(function (y) {
          var li = el("li"), b = el("button"); b.type = "button";
          var t = el("span", "ag-lista-t"); t.appendChild(el("strong", null, y.eess)); t.appendChild(el("span", null, y.dist + " · " + fmt(y.viv) + " viviendas")); b.appendChild(t);
          b.appendChild(etiqueta(y.esc)); b.addEventListener("click", function () { f.cod = y.cod; f.dist = y.ubigeo; enfocar(); todo(); });
          li.appendChild(b); ul.appendChild(li);
        });
        panel.appendChild(ul);
      }

      function tabla() {
        cTab.innerHTML = "";
        var l = L.filter(pasa);
        var cab = el("div", "ag-tab-cab"); cab.appendChild(el("h3", null, "Establecimientos por escenario")); cab.appendChild(el("span", "ag-tab-n", l.length + (l.length === 1 ? " establecimiento" : " establecimientos"))); cTab.appendChild(cab);
        var w = el("div", "ag-tab-w"), t = el("table", "ag-tab vc-tab"); w.appendChild(t);
        var tr0 = el("tr"); ["Escenario", "Provincia", "Distrito", "Establecimiento de salud", "RENAES", "Viviendas", "Muestra"].forEach(function (h, i) { tr0.appendChild(el("th", i >= 5 ? "c" : null, h)); });
        var th = el("thead"); th.appendChild(tr0); t.appendChild(th); var tb = el("tbody"); t.appendChild(tb);
        l.forEach(function (x) {
          var tr = el("tr", f.cod === x.cod ? "sel" : null), td = el("td"); td.appendChild(etiqueta(x.esc)); tr.appendChild(td);
          [x.prov, x.dist, x.eess, x.cod].forEach(function (v, i) { tr.appendChild(el("td", i === 2 ? "b" : null, v)); });
          tr.appendChild(el("td", "c", fmt(x.viv))); tr.appendChild(el("td", "c", fmt(x.muestra)));
          tr.addEventListener("click", function () { f.cod = x.cod; f.dist = x.ubigeo; enfocar(); todo(); cMapa.scrollIntoView({ behavior: "smooth", block: "start" }); });
          tb.appendChild(tr);
        });
        if (!l.length) { var r = el("tr"), d = el("td", "vacio", "Ningún establecimiento cumple el filtro."); d.colSpan = 7; r.appendChild(d); tb.appendChild(r); }
        cTab.appendChild(w);
      }
      function todo() {
        defs.querySelectorAll(".vc-def").forEach(function (d, i) { d.classList.toggle("act", f.esc === String([2, 1, 3][i])); });
        kpis(); mapa(); lado(); tabla();
      }
      enfocar(); todo();
    }

    responsable(); pintar();
  }
  window.VISTAS = window.VISTAS || {};
  window.VISTAS.vectores = montar;
})();
