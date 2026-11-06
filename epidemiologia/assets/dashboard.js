/* Dashboard epidemiológico — lee window.DASHBOARD (data/dashboard_datos.js) */
(function () {
  "use strict";
  var D = window.DASHBOARD || window.DASHBOARD_RED;
  if (!D) { window.Dashboard = { montar: function (c) { c.textContent = "No se encontraron datos del dashboard."; } }; return; }

  var NS = "http://www.w3.org/2000/svg";
  var C = {
    s1: "#2a78d6", s2: "#eb6834", s3: "#1baf7a", soft: "#9ec5f4", strong: "#184f95",
    ink: "#18394c", ink2: "#52514e", muted: "#898781", grid: "#e6e9ec", axis: "#c3c2b7",
    exito: "#dcefdc", seguridad: "#fdf1c9", alarma: "#fcdcc9", epidemia: "#f7d0d0", obs: "#0d366b"
  };
  var ZONAS = [
    { id: "exito", nombre: "Éxito", fill: C.exito, cls: "z-exito" },
    { id: "seguridad", nombre: "Seguridad", fill: C.seguridad, cls: "z-seguridad" },
    { id: "alarma", nombre: "Alarma", fill: C.alarma, cls: "z-alarma" },
    { id: "epidemia", nombre: "Epidemia", fill: C.epidemia, cls: "z-epidemia" }
  ];
  var MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Set", "Oct", "Nov", "Dic"];
  var ANIO = D.anio, REFN = D.ref_n || 5;
  function usar(datos) { D = datos; ANIO = D.anio; REFN = D.ref_n || 5; }

  // ---------- utilidades ----------
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function sv(tag, a, p) { var e = document.createElementNS(NS, tag); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function fmt(n, d) {
    if (n == null || isNaN(n)) return "–";
    var p = Number(n).toFixed(d || 0).split("."), e = p[0].replace("-", "");
    if (e.length > 3) e = e.replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
    return (Number(n) < 0 ? "-" : "") + e + (p[1] ? "," + p[1] : "");
  }
  function pct(a, b) { return b ? a / b * 100 : null; }
  function sum(a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i] || 0; return s; }
  function quantile(arr, p) { // tipo 7 (igual que R por defecto)
    var a = arr.slice().sort(function (x, y) { return x - y; }), n = a.length;
    if (!n) return 0; var h = (n - 1) * p, lo = Math.floor(h), hi = Math.ceil(h);
    return a[lo] + (h - lo) * (a[hi] - a[lo]);
  }
  function niceMax(v) { if (v <= 0) return 1; var p = Math.pow(10, Math.floor(Math.log10(v))), f = v / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p; }
  function ticks(max, n) { var step = niceMax(max / (n || 4)), out = []; for (var t = 0; t <= max + 1e-9; t += step) out.push(t); return out; }

  // ---------- tooltip ----------
  var tip = el("div", "viz-tip"); tip.hidden = true; document.body.appendChild(tip);
  function showTip(evt, titulo, filas) {
    tip.innerHTML = "";
    tip.appendChild(el("div", "viz-tip-t", titulo));
    filas.forEach(function (f) {
      var r = el("div", "viz-tip-r");
      if (f.color) { var k = el("span", "viz-key"); k.style.background = f.color; r.appendChild(k); }
      r.appendChild(el("strong", null, f.valor)); r.appendChild(el("span", null, " " + f.nombre));
      tip.appendChild(r);
    });
    tip.hidden = false;
    var x = evt.clientX + 14, y = evt.clientY + 14, w = tip.offsetWidth, h = tip.offsetHeight;
    if (x + w > window.innerWidth - 8) x = evt.clientX - w - 14;
    if (y + h > window.innerHeight - 8) y = evt.clientY - h - 14;
    tip.style.left = x + "px"; tip.style.top = y + "px";
  }
  function hideTip() { tip.hidden = true; }

  // ---------- tarjetas de gráfico ----------
  function tarjeta(padre, titulo, nota, ancho) {
    var c = el("section", "viz-card" + (ancho ? " viz-wide" : ""));
    c.appendChild(el("h3", null, titulo));
    if (nota) c.appendChild(el("p", "viz-note", nota));
    var area = el("div", "viz-area"); c.appendChild(area);
    padre.appendChild(c);
    return { card: c, area: area };
  }
  function tablaDatos(card, cab, filas) {
    var det = el("details", "viz-table"); det.appendChild(el("summary", null, "Ver datos"));
    var wrap = el("div", "viz-table-wrap"), t = el("table"), tr = el("tr");
    cab.forEach(function (h) { tr.appendChild(el("th", null, h)); });
    var th = el("thead"); th.appendChild(tr); t.appendChild(th);
    var tb = el("tbody");
    filas.forEach(function (f) { var r = el("tr"); f.forEach(function (v) { r.appendChild(el("td", null, v)); }); tb.appendChild(r); });
    t.appendChild(tb); wrap.appendChild(t); det.appendChild(wrap); card.appendChild(det);
  }
  function leyenda(card, items) {
    var l = el("div", "viz-legend");
    items.forEach(function (it) { var s = el("span"); var k = el("i", it.linea ? "viz-key line" : "viz-key"); k.style.background = it.color; s.appendChild(k); s.appendChild(document.createTextNode(it.nombre)); l.appendChild(s); });
    card.insertBefore(l, card.querySelector(".viz-area"));
  }

  // ---------- marco de ejes ----------
  function marco(area, alto, yMax, opts) {
    opts = opts || {};
    var W = Math.max(300, area.clientWidth), H = alto;
    var m = { t: 12, r: opts.r || 16, b: 30, l: opts.l || 40 };
    var svg = sv("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, role: "img" }, area);
    var iw = W - m.l - m.r, ih = H - m.t - m.b;
    var y = function (v) { return m.t + ih - (v / yMax) * ih; };
    ticks(yMax, 4).forEach(function (t) {
      sv("line", { x1: m.l, x2: W - m.r, y1: y(t), y2: y(t), stroke: t === 0 ? C.axis : C.grid, "stroke-width": 1 }, svg);
      var tx = sv("text", { x: m.l - 6, y: y(t) + 4, "text-anchor": "end", class: "viz-tick" }, svg); tx.textContent = fmt(t, t % 1 ? 1 : 0);
    });
    return { svg: svg, W: W, H: H, m: m, iw: iw, ih: ih, y: y };
  }

  // ---------- gráfico de líneas / canal endémico ----------
  function graficoLineas(area, cfg) {
    // cfg: {n, etiquetasX(i), bandas:[{nombre,fill,lo[],hi[]}], series:[{nombre,color,valores[],ancho,puntos}], yMax, etiquetaFinal}
    var maxv = cfg.yMax || 0;
    cfg.series.forEach(function (s) { s.valores.forEach(function (v) { if (v != null && v > maxv) maxv = v; }); });
    var ymax = cfg.yFijo || niceMax(maxv * 1.08 || 1);
    var f = marco(area, cfg.alto || 280, ymax, { r: cfg.etiquetaFinal ? 78 : 16 });
    var n = cfg.n, x = function (i) { return f.m.l + (n === 1 ? f.iw / 2 : i / (n - 1) * f.iw); };
    (cfg.bandas || []).forEach(function (b) {
      var d = "";
      for (var i = 0; i < n; i++) d += (i ? "L" : "M") + x(i) + " " + f.y(Math.min(b.hi[i], ymax));
      for (var j = n - 1; j >= 0; j--) d += "L" + x(j) + " " + f.y(Math.min(b.lo[j], ymax));
      sv("path", { d: d + "Z", fill: b.fill, stroke: "none" }, f.svg);
      if (cfg.etiquetaFinal) {
        var yy = (f.y(Math.min(b.hi[n - 1], ymax)) + f.y(Math.min(b.lo[n - 1], ymax))) / 2;
        if (Math.abs(f.y(Math.min(b.hi[n - 1], ymax)) - f.y(Math.min(b.lo[n - 1], ymax))) > 9) {
          var t = sv("text", { x: f.W - f.m.r + 6, y: yy + 4, class: "viz-lbl" }, f.svg); t.textContent = b.nombre;
        }
      }
    });
    var stepX = Math.max(1, Math.ceil(n / Math.max(4, Math.floor(f.iw / 34))));
    for (var i = 0; i < n; i += stepX) {
      var tx = sv("text", { x: x(i), y: f.H - 10, "text-anchor": "middle", class: "viz-tick" }, f.svg); tx.textContent = cfg.etiquetasX(i);
    }
    cfg.series.forEach(function (s) {
      var d = "", abierto = false;
      s.valores.forEach(function (v, i) { if (v == null) { abierto = false; return; } d += (abierto ? "L" : "M") + x(i) + " " + f.y(v); abierto = true; });
      sv("path", { d: d, fill: "none", stroke: s.color, "stroke-width": s.ancho || 2, "stroke-linejoin": "round", "stroke-linecap": "round" }, f.svg);
      if (s.puntos) s.valores.forEach(function (v, i) { if (v != null) sv("circle", { cx: x(i), cy: f.y(v), r: 2.6, fill: s.color }, f.svg); });
    });
    // crosshair
    var cross = sv("line", { y1: f.m.t, y2: f.m.t + f.ih, stroke: C.ink2, "stroke-width": 1, visibility: "hidden" }, f.svg);
    var hit = sv("rect", { x: f.m.l, y: f.m.t, width: f.iw, height: f.ih, fill: "transparent" }, f.svg);
    function mover(evt) {
      var r = f.svg.getBoundingClientRect(), px = (evt.clientX - r.left) * (f.W / r.width);
      var i = Math.round((px - f.m.l) / f.iw * (n - 1)); i = Math.max(0, Math.min(n - 1, i));
      cross.setAttribute("x1", x(i)); cross.setAttribute("x2", x(i)); cross.setAttribute("visibility", "visible");
      var filas = cfg.series.filter(function (s) { return s.valores[i] != null; }).map(function (s) { return { color: s.color, valor: fmt(s.valores[i], s.dec || 0), nombre: s.nombre }; });
      if (cfg.tooltipExtra) filas = filas.concat(cfg.tooltipExtra(i));
      showTip(evt, cfg.tituloX(i), filas);
    }
    hit.addEventListener("pointermove", mover);
    hit.addEventListener("pointerleave", function () { cross.setAttribute("visibility", "hidden"); hideTip(); });
  }

  // ---------- barras verticales ----------
  function graficoBarras(area, cfg) {
    // cfg: {etiquetas[], valores[], colores[] o color, nombre, dec}
    var n = cfg.valores.length, ymax = niceMax(Math.max.apply(null, cfg.valores.concat([1])) * 1.12);
    var f = marco(area, cfg.alto || 240, ymax);
    var bw = f.iw / n, gap = Math.max(2, bw * 0.28);
    var stepX = Math.max(1, Math.ceil(n / Math.max(4, Math.floor(f.iw / 38))));
    cfg.valores.forEach(function (v, i) {
      var x0 = f.m.l + i * bw + gap / 2, w = bw - gap, y0 = f.y(v), h = f.y(0) - y0;
      var col = cfg.colores ? cfg.colores[i] : cfg.color;
      var r = Math.min(4, w / 2, h);
      var path = h > 0 ? "M" + x0 + " " + f.y(0) + "V" + (y0 + r) + "Q" + x0 + " " + y0 + " " + (x0 + r) + " " + y0 + "H" + (x0 + w - r) + "Q" + (x0 + w) + " " + y0 + " " + (x0 + w) + " " + (y0 + r) + "V" + f.y(0) + "Z" : "";
      if (path) sv("path", { d: path, fill: col }, f.svg);
      if (cfg.rotuloEn && cfg.rotuloEn(i)) { var t = sv("text", { x: x0 + w / 2, y: y0 - 5, "text-anchor": "middle", class: "viz-val" }, f.svg); t.textContent = fmt(v, cfg.dec); }
      if ((n - 1 - i) % stepX === 0) { var tx = sv("text", { x: x0 + w / 2, y: f.H - 10, "text-anchor": "middle", class: "viz-tick" }, f.svg); tx.textContent = cfg.etiquetas[i]; }
      var hit = sv("rect", { x: f.m.l + i * bw, y: f.m.t, width: bw, height: f.ih, fill: "transparent" }, f.svg);
      hit.addEventListener("pointermove", function (e) { showTip(e, cfg.etiquetas[i], [{ color: col, valor: fmt(v, cfg.dec), nombre: cfg.nombre }].concat(cfg.extra ? cfg.extra(i) : [])); });
      hit.addEventListener("pointerleave", hideTip);
    });
  }

  // ---------- barras horizontales (agrupadas o simples) ----------
  function graficoBarrasH(area, cfg) {
    // cfg: {etiquetas[], series:[{nombre,color,valores[]}], dec, sufijo}
    var ns = cfg.series.length, n = cfg.etiquetas.length;
    var fila = ns > 1 ? 30 : 24, H = n * fila + 34;
    var W = Math.max(300, area.clientWidth), lw = Math.min(170, W * 0.36), m = { l: lw, r: 44, t: 6, b: 24 };
    var svg = sv("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H }, area);
    var maxv = 0; cfg.series.forEach(function (s) { s.valores.forEach(function (v) { if (v > maxv) maxv = v; }); });
    var xmax = cfg.xMax || niceMax(maxv || 1), iw = W - m.l - m.r;
    var x = function (v) { return m.l + v / xmax * iw; };
    ticks(xmax, 4).forEach(function (t) {
      sv("line", { x1: x(t), x2: x(t), y1: m.t, y2: H - m.b, stroke: t === 0 ? C.axis : C.grid }, svg);
      var tt = sv("text", { x: x(t), y: H - 8, "text-anchor": "middle", class: "viz-tick" }, svg); tt.textContent = fmt(t) + (cfg.sufijo || "");
    });
    var bh = (fila - 8) / ns;
    cfg.etiquetas.forEach(function (lab, i) {
      var y0 = m.t + i * fila + 4;
      var maxc = Math.floor((m.l - 10) / 6.1), corto = lab.length > maxc ? lab.slice(0, maxc - 1).trim() + "…" : lab;
      var tl = sv("text", { x: m.l - 8, y: y0 + (fila - 8) / 2 + 4, "text-anchor": "end", class: "viz-cat" }, svg); tl.textContent = corto;
      if (corto !== lab) sv("title", {}, tl).textContent = lab;
      cfg.series.forEach(function (s, k) {
        var v = s.valores[i] || 0, yy = y0 + k * bh, w = x(v) - x(0), r = Math.min(4, (bh - 2) / 2, w);
        if (w > 0) sv("path", { d: "M" + x(0) + " " + yy + "H" + (x(0) + w - r) + "Q" + (x(0) + w) + " " + yy + " " + (x(0) + w) + " " + (yy + r) + "V" + (yy + bh - 2 - r) + "Q" + (x(0) + w) + " " + (yy + bh - 2) + " " + (x(0) + w - r) + " " + (yy + bh - 2) + "H" + x(0) + "Z", fill: s.color }, svg);
        if (ns === 1 || cfg.rotularTodo) { var tv = sv("text", { x: x(0) + w + 5, y: yy + (bh - 2) / 2 + 4, class: "viz-val" }, svg); tv.textContent = fmt(v, cfg.dec) + (cfg.sufijo || ""); }
      });
      var hit = sv("rect", { x: 0, y: y0 - 4, width: W, height: fila, fill: "transparent" }, svg);
      hit.addEventListener("pointermove", function (e) { showTip(e, lab, cfg.series.map(function (s) { return { color: s.color, valor: fmt(s.valores[i], cfg.dec) + (cfg.sufijo || ""), nombre: s.nombre }; })); });
      hit.addEventListener("pointerleave", hideTip);
    });
  }

  // ---------- mapa de calor ----------
  var RAMPA = ["#f1f4f7", "#cde2fb", "#9ec5f4", "#6da7ec", "#3987e5", "#256abf", "#184f95", "#0d366b"];
  function graficoCalor(area, cfg) {
    // cfg: {filas[], cols(53), valores[f][c], nombre}
    var W = Math.max(300, area.clientWidth), m = { l: 40, r: 6, t: 4, b: 24 };
    var nf = cfg.filas.length, cw = (W - m.l - m.r) / 53, ch = Math.max(12, Math.min(18, cw * 1.4)), H = m.t + nf * ch + m.b;
    var svg = sv("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H }, area);
    var maxv = 1; cfg.valores.forEach(function (r) { r.forEach(function (v) { if (v > maxv) maxv = v; }); });
    var paso = function (v) { if (!v) return RAMPA[0]; return RAMPA[Math.min(RAMPA.length - 1, 1 + Math.floor((v - 1) / Math.max(1, (maxv) / (RAMPA.length - 1))))]; };
    cfg.filas.forEach(function (f, r) {
      var t = sv("text", { x: m.l - 6, y: m.t + r * ch + ch / 2 + 4, "text-anchor": "end", class: "viz-tick" }, svg); t.textContent = f;
      for (var c = 0; c < 53; c++) {
        var v = cfg.valores[r][c];
        var rc = sv("rect", { x: m.l + c * cw + 0.5, y: m.t + r * ch + 0.5, width: Math.max(1, cw - 1), height: ch - 1, rx: 1.5, fill: paso(v) }, svg);
        (function (v, c, f) { rc.addEventListener("pointermove", function (e) { showTip(e, f + " · SE " + (c + 1), [{ valor: fmt(v), nombre: cfg.nombre }]); }); rc.addEventListener("pointerleave", hideTip); })(v, c, f);
      }
    });
    for (var c = 0; c < 53; c += 4) { var tx = sv("text", { x: m.l + c * cw + cw / 2, y: H - 8, "text-anchor": "middle", class: "viz-tick" }, svg); tx.textContent = c + 1; }
    var l = el("div", "viz-legend viz-ramp"); l.appendChild(document.createTextNode("0"));
    RAMPA.forEach(function (col) { var k = el("i", "viz-key sq"); k.style.background = col; l.appendChild(k); });
    l.appendChild(document.createTextNode(fmt(maxv) + " " + cfg.nombre));
    area.parentNode.insertBefore(l, area);
  }

  // ---------- cálculos epidemiológicos ----------
  function serie(mod, cod, anio) { var s = mod.series[cod] || {}; return s[String(anio)] || new Array(53).fill(0); }
  function anios(mod) { return Object.keys(mod.series.TOTAL).map(Number).sort(); }
  function poblacion(mod, cod) {
    if (!mod.tasa_k || !D.eess.length) return null;
    var campo = mod.poblacion || "pob";
    var v = cod === "TOTAL" ? sum(D.eess.map(function (e) { return e[campo]; })) : ((D.eess.filter(function (x) { return x.cod === cod; })[0] || {})[campo]);
    return v > 0 ? v : null;
  }
  function canal(mod, cod) {
    var ref = anios(mod).filter(function (a) { return a < ANIO && a >= ANIO - REFN; });
    var q1 = [], q2 = [], q3 = [];
    for (var s = 0; s < 53; s++) {
      var v = ref.map(function (a) { return serie(mod, cod, a)[s]; });
      q1.push(quantile(v, .25)); q2.push(quantile(v, .5)); q3.push(quantile(v, .75));
    }
    return { ref: ref, q1: q1, q2: q2, q3: q3 };
  }
  function zonaDe(v, cn, s) { return v <= cn.q1[s] ? ZONAS[0] : v <= cn.q2[s] ? ZONAS[1] : v <= cn.q3[s] ? ZONAS[2] : ZONAS[3]; }
  function tieneAnio(mod, a) { return !!mod.series.TOTAL[String(a)]; }
  function esMR(cod) { return /^MR/.test(cod); }
  function nombreEESS(cod) { if (cod === "TOTAL") return D.ambito; if (esMR(cod)) { var m = (D.microredes || []).filter(function (x) { return x.cod === cod; })[0]; return m ? m.nombre : cod; } var e = D.eess.filter(function (x) { return x.cod === cod; })[0]; return e ? e.nombre : cod; }

  // ---------- Fábrica: un tablero por contenedor ----------
  // op: { modulos: ["eda","ira",...], agua: true|false, unidad: "metaxenicas", clave: "sala" }
  function crear(raiz, op) {
  op = op || {};
  var DATOS = op.datos || D; usar(DATOS);
  var MODS = (op.modulos || ["eda", "ira", "leish", "feb"]).filter(function (id) { return D.modulos[id]; });
  var CORTOS = { eda: "EDA", ira: "IRA < 5 años", leish: "Leishmaniasis", feb: "Febriles" };
  var TABS = [{ id: "resumen", nombre: "Resumen" }].concat((op.sala ? [] : MODS).map(function (id) { return { id: id, nombre: D.modulos[id].corto || CORTOS[id] || D.modulos[id].titulo }; }));
  if (op.agua) TABS.push({ id: "agua", nombre: "Calidad del agua" });
  // Sistema con un solo evento semanal y sin otros eventos ni registros (p. ej. Síndrome febril): sin pestaña "Resumen"
  var soloUno = !op.sala && !op.agua && MODS.length === 1 && op.unidad && op.unidad !== "todas" &&
    !(D.eventos || []).some(function (e) { return e.unidad === op.unidad; }) && !(D.registros || []).some(function (r) { return r.unidad === op.unidad; });
  if (soloUno) TABS.shift();
  var CLAVE = "dash-estado-" + (op.clave || "sala");
  var estado = { tab: soloUno ? MODS[0] : "resumen", eess: "TOTAL", aguaAnio: null, aguaProv: "Todas", origen: "todos" };
  try { var g = JSON.parse(localStorage.getItem(CLAVE) || "{}"); if (g.tab && TABS.some(function (t) { return t.id === g.tab; })) estado.tab = g.tab; if (g.eess) estado.eess = g.eess; } catch (e) { }
  raiz.innerHTML = "";

  var nav = el("div", "dash-tabs"); raiz.appendChild(nav);
  if (TABS.length < 2) nav.style.display = "none";
  var filtros = el("div", "dash-filtros"); raiz.appendChild(filtros);
  var cuerpo = el("div", "dash-body"); raiz.appendChild(cuerpo);

  TABS.forEach(function (t) {
    var b = el("button", "dash-tab", t.nombre); b.type = "button"; b.dataset.id = t.id;
    b.addEventListener("click", function () { estado.tab = t.id; render(); });
    nav.appendChild(b);
  });

  function selector(etiqueta, opciones, valor, alCambiar) {
    var w = el("label", "dash-sel"); w.appendChild(el("span", null, etiqueta));
    var s = el("select");
    var grupos = {};
    opciones.forEach(function (o) {
      var op = el("option", null, o.nombre); op.value = o.valor;
      if (o.grupo) { if (!grupos[o.grupo]) { grupos[o.grupo] = el("optgroup"); grupos[o.grupo].label = o.grupo; s.appendChild(grupos[o.grupo]); } grupos[o.grupo].appendChild(op); }
      else s.appendChild(op);
    });
    s.value = valor; s.addEventListener("change", function () { alCambiar(s.value); });
    w.appendChild(s); return w;
  }

  function irA(id) {
    var dest = op.sala && op.enlaces && op.enlaces[id];
    if (dest) { try { var k = "dash-estado-" + dest, g = JSON.parse(localStorage.getItem(k) || "{}"); g.tab = id; g.eess = "TOTAL"; localStorage.setItem(k, JSON.stringify(g)); } catch (e) { } location.hash = dest; return; }
    estado.tab = id; render();
  }
  function tendencia(mod, cod) {
    var se = mod.se_corte, v = serie(mod, cod, ANIO); if (se < 8) return null;
    var a = sum(v.slice(se - 4, se)), b = sum(v.slice(se - 8, se - 4));
    var txt = "SE " + (se - 3) + "–" + se + ": " + fmt(a) + " · " + (b >= 10 ? (a > b ? "▲ " : a < b ? "▼ " : "= ") + fmt(Math.abs((a - b) / b * 100)) + " % vs 4 semanas previas" : b ? (a > b ? "▲" : a < b ? "▼" : "=") + " " + fmt(b) + " en las 4 semanas previas" : (a ? "sin casos las 4 semanas previas" : "sin casos"));
    return { txt: txt, cls: !b ? (a ? "sube" : "") : (a > b * 1.2 && a - b >= 2) ? "sube" : (a < b * 0.8 && b - a >= 2) ? "baja" : "" };
  }
  function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify({ tab: estado.tab, eess: estado.eess })); } catch (e) { } }

  function render() {
    usar(DATOS); guardar(); hideTip();
    nav.querySelectorAll(".dash-tab").forEach(function (b) { b.classList.toggle("active", b.dataset.id === estado.tab); b.setAttribute("aria-pressed", b.dataset.id === estado.tab); });
    filtros.innerHTML = ""; cuerpo.innerHTML = "";
    if (estado.tab === "agua") return renderAgua();
    if (!MODS.length && estado.tab === "resumen") return renderResumen();
    var ops = [{ valor: "TOTAL", nombre: D.ambito + " (total)" }];
    if (D.microredes) D.microredes.forEach(function (m) { ops.push({ valor: m.cod, nombre: m.nombre + " (total)", grupo: m.nombre }); D.eess.filter(function (e) { return e.mr === m.cod; }).forEach(function (e) { ops.push({ valor: e.cod, nombre: e.nombre, grupo: m.nombre }); }); });
    else ops = ops.concat(D.eess.map(function (e) { return { valor: e.cod, nombre: e.nombre }; }));
    if (!ops.some(function (o) { return o.valor === estado.eess; })) estado.eess = "TOTAL";
    filtros.appendChild(selector(D.microredes ? "Microred / establecimiento" : "Establecimiento", ops, estado.eess, function (v) { estado.eess = v; render(); }));
    if (estado.tab === "resumen") return renderResumen();
    var base = D.modulos[estado.tab], mod = base;
    if (base.origen) {
      var w = el("div", "dash-sel dash-origen"); w.appendChild(el("span", null, "Origen del caso"));
      var g = el("div", "seg");
      [["todos", "Todos"], ["aut", "Autóctonos (" + base.origen.autoctonos + ")"], ["imp", "Importados (" + base.origen.importados + ")"]].forEach(function (o) {
        var b = el("button", null, o[1]); b.type = "button"; b.setAttribute("aria-pressed", estado.origen === o[0]);
        if (o[0] !== "todos" && !D.modulos[estado.tab + "__" + o[0]]) b.disabled = true;
        b.addEventListener("click", function () { estado.origen = o[0]; render(); }); g.appendChild(b);
      });
      w.appendChild(g); filtros.appendChild(w);
      if (estado.origen !== "todos" && D.modulos[estado.tab + "__" + estado.origen]) mod = D.modulos[estado.tab + "__" + estado.origen];
    }
    renderEvento(estado.tab, mod, base);
  }

  function kpi(padre, etiqueta, valor, sub, zona) {
    var k = el("div", "kpi");
    k.appendChild(el("span", "kpi-l", etiqueta));
    k.appendChild(el("strong", "kpi-v", valor));
    if (sub) k.appendChild(el("span", "kpi-s", sub));
    if (zona) { var z = el("span", "zona " + zona.cls, "● " + zona.nombre); k.appendChild(z); }
    padre.appendChild(k); return k;
  }
  function variacion(act, prev) {
    if (!prev) return act ? "Sin casos en el mismo periodo del año anterior" : "Igual que el año anterior";
    var v = (act - prev) / prev * 100;
    return (v > 0 ? "▲ " : v < 0 ? "▼ " : "") + fmt(Math.abs(v)) + " % respecto a " + (ANIO - 1) + " (" + fmt(prev) + ")";
  }

  function nota(texto) { cuerpo.appendChild(el("p", "dash-nota", texto)); }

  // ---------- Resumen ----------
  function renderResumen() {
    nota(nombreEESS(estado.eess) + " · Año " + ANIO + " · Cada evento se muestra hasta su última semana con datos.");
    var grid = el("div", "kpi-grid"); cuerpo.appendChild(grid);
    MODS.forEach(function (id) {
      var mod = D.modulos[id], se = mod.se_corte;
      var act = sum(serie(mod, estado.eess, ANIO).slice(0, se)), prev = sum(serie(mod, estado.eess, ANIO - 1).slice(0, se));
      var cn = canal(mod, estado.eess), ult = serie(mod, estado.eess, ANIO)[se - 1];
      var k = kpi(grid, mod.titulo + " · SE 1–" + se, fmt(act), tieneAnio(mod, ANIO - 1) ? variacion(act, prev) : mod.unidad + " notificados en " + ANIO, cn.ref.length >= 3 ? zonaDe(ult, cn, se - 1) : null);
      var td = tendencia(mod, estado.eess); if (td) k.insertBefore(el("span", "kpi-t " + td.cls, td.txt), k.querySelector(".zona"));
      k.classList.add("kpi-link"); k.tabIndex = 0; k.setAttribute("role", "button");
      var ir = function () { irA(id); };
      k.addEventListener("click", ir); k.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); ir(); } });
    });
    if (op.agua && D.agua) {
      var A = D.agua, ult = Math.max.apply(null, A.mensual.map(function (r) { return r.anio; }));
      var t = A.mensual.filter(function (r) { return r.anio === ult; }).reduce(function (s, r) { s.n += r.cl_n; s.ok += r.cl_ok; return s; }, { n: 0, ok: 0 });
      var ka = kpi(grid, "Agua · cloro residual adecuado " + ult, fmt(pct(t.ok, t.n), 1) + " %", fmt(t.ok) + " de " + fmt(t.n) + " muestras en red · " + A.ambito);
      ka.classList.add("kpi-link"); ka.tabIndex = 0; ka.setAttribute("role", "button");
      ka.addEventListener("click", function () { estado.tab = "agua"; render(); });
    }
    if (MODS.length) cuerpo.appendChild(el("p", "dash-nota", (MODS.some(function (id) { return canal(D.modulos[id], "TOTAL").ref.length >= 3; }) ? "La zona del canal endémico corresponde a la última semana con datos. " : "") + "Pulse una tarjeta para ver el detalle."));
    if (!grid.children.length) grid.remove();
    if (op.sala) alertas();
    registros();
    tablaEventos();
  }

  // ---------- Evento (EDA, IRA, leishmaniasis, febriles) ----------
  function renderEvento(id, mod, base) {
    var cod = estado.eess, se = mod.se_corte, an = anios(mod);
    var act = serie(mod, cod, ANIO), actAc = sum(act.slice(0, se)), prevAc = sum(serie(mod, cod, ANIO - 1).slice(0, se));
    var cn = canal(mod, cod), pob = poblacion(mod, cod);
    nota(nombreEESS(cod) + " · " + mod.titulo + " · Datos hasta la SE " + se + "-" + ANIO + " · Fuente: " + mod.fuente);

    var grid = el("div", "kpi-grid"); cuerpo.appendChild(grid);
    kpi(grid, "Acumulado SE 1–" + se + " de " + ANIO, fmt(actAc), mod.unidad);
    if (tieneAnio(mod, ANIO - 1)) kpi(grid, "Mismo periodo " + (ANIO - 1), fmt(prevAc), variacion(actAc, prevAc).replace(/ \(.*\)$/, ""));
    else { var semanas = act.slice(0, se).filter(function (v) { return v > 0; }).length; kpi(grid, "Promedio semanal " + ANIO, fmt(actAc / se, actAc / se < 10 ? 1 : 0), mod.unidad + " por semana · " + semanas + " de " + se + " semanas con casos"); }
    if (pob) kpi(grid, "Tasa acumulada", fmt(actAc / pob * mod.tasa_k, mod.tasa_k >= 1000 ? 1 : 2), "por " + fmt(mod.tasa_k) + " hab." + (mod.poblacion === "pob5" ? " menores de 5 años" : "") + " (pob. " + fmt(pob) + ")");
    kpi(grid, "SE " + se + " (última)", fmt(act[se - 1]), mod.unidad, cn.ref.length >= 3 ? zonaDe(act[se - 1], cn, se - 1) : null);
    if (mod.extra && cod === "TOTAL") Object.keys(mod.extra).forEach(function (k) { kpi(grid, k + " " + ANIO, fmt(mod.extra[k]), D.ambito_corto || "Microred"); });
    if (base && base.origen && estado.origen === "todos") kpi(grid, "Autóctonos / importados " + ANIO, fmt(base.origen.autoctonos) + " / " + fmt(base.origen.importados), "según distrito de residencia (dentro o fuera de la jurisdicción)");
    if (base && base.origen && estado.origen !== "todos") cuerpo.insertBefore(el("p", "dash-aviso", "Mostrando solo casos " + (estado.origen === "aut" ? "autóctonos" : "importados") + ". Clasificación aproximada por distrito de residencia: la base no registra el lugar probable de infección."), grid);

    var g = el("div", "viz-grid"); cuerpo.appendChild(g);

    // Canal endémico
    if (cn.ref.length < 3) {
      if (cn.ref.length) { var tx0 = tarjeta(g, "Canal endémico: " + mod.titulo, null, true);
      tx0.area.appendChild(el("p", "dash-nota", "No se muestra: la base solo tiene " + cn.ref.length + " de los " + REFN + " años previos (" + cn.ref.join(", ") + "). Se necesitan al menos 3; lo ideal son " + REFN + ". Cargue los años anteriores en la carpeta de esta vigilancia.")); }
    } else {
    var t1 = tarjeta(g, "Canal endémico: " + mod.titulo + ", " + ANIO, "Cuartiles semanales de " + cn.ref[0] + "–" + cn.ref[cn.ref.length - 1] + ". Línea: " + mod.unidad + " observados hasta la SE " + se + ".", true);
    var obs = act.map(function (v, i) { return i < se ? v : null; });
    var bandas = [
      { nombre: "Éxito", fill: C.exito, lo: new Array(53).fill(0), hi: cn.q1 },
      { nombre: "Seguridad", fill: C.seguridad, lo: cn.q1, hi: cn.q2 },
      { nombre: "Alarma", fill: C.alarma, lo: cn.q2, hi: cn.q3 },
      { nombre: "Epidemia", fill: C.epidemia, lo: cn.q3, hi: cn.q3.map(function () { return 1e9; }) }
    ];
    var ymaxCanal = Math.max(Math.max.apply(null, cn.q3), Math.max.apply(null, obs.filter(function (v) { return v != null; }).concat([1]))) * 1.1;
    leyenda(t1.card, [{ nombre: "Observado " + ANIO, color: C.obs, linea: true }].concat(ZONAS.map(function (z) { return { nombre: z.nombre, color: z.fill }; })));
    graficoLineas(t1.area, {
      n: 53, bandas: bandas, yMax: ymaxCanal, etiquetaFinal: true, alto: 300,
      series: [{ nombre: "Observado " + ANIO, color: C.obs, valores: obs, ancho: 2, puntos: true }],
      etiquetasX: function (i) { return i + 1; }, tituloX: function (i) { return "SE " + (i + 1); },
      tooltipExtra: function (i) { return [{ valor: fmt(cn.q1[i], 1) + " / " + fmt(cn.q2[i], 1) + " / " + fmt(cn.q3[i], 1), nombre: "Q1 / mediana / Q3" }].concat(i < se ? [{ valor: zonaDe(act[i], cn, i).nombre, nombre: "zona" }] : []); }
    });
    if (sum(cn.q3) / 53 < 1) t1.card.insertBefore(el("p", "dash-aviso", "Evento poco frecuente en este ámbito: en la mayoría de semanas el Q3 histórico es 0, así que un solo caso ya cae en la zona de epidemia. Para eventos raros conviene leer el canal junto con la tendencia anual."), t1.area);
    tablaDatos(t1.card, ["SE", "Observado", "Q1 (éxito)", "Mediana (seguridad)", "Q3 (alarma)", "Zona"], obs.map(function (v, i) {
      return [i + 1, v == null ? "" : v, fmt(cn.q1[i], 1), fmt(cn.q2[i], 1), fmt(cn.q3[i], 1), v == null ? "" : zonaDe(v, cn, i).nombre];
    }));
    }

    // Tendencia anual mismo periodo
    var tot = an.map(function (a) { return sum(serie(mod, cod, a).slice(0, se)); });
    if (an.length > 1) {
    var t2 = tarjeta(g, mod.titulo + " por año, SE 1–" + se, "Mismo periodo de cada año para que sean comparables.");
    graficoBarras(t2.area, {
      etiquetas: an.map(String), valores: tot, nombre: mod.unidad + " SE 1–" + se,
      colores: an.map(function (a) { return a === ANIO ? C.strong : C.soft; }),
      rotuloEn: function (i) { return i === tot.length - 1 || tot[i] === Math.max.apply(null, tot); }
    });
    tablaDatos(t2.card, ["Año", mod.unidad + " SE 1–" + se, mod.unidad + " año completo"], an.map(function (a, i) { return [a, tot[i], a === ANIO ? "(en curso)" : sum(serie(mod, cod, a))]; }));
    }

    // Comparativo semanal 3 años
    var tres = [ANIO - 2, ANIO - 1, ANIO].filter(function (a) { return a === ANIO || tieneAnio(mod, a); }), cols = [C.s3, C.s2, C.s1].slice(3 - tres.length);
    if (tres.length === 1) {
      var tb1 = tarjeta(g, mod.titulo + " por semana epidemiológica, " + ANIO, nombreEESS(cod) + " · SE 1–" + se + ".", true);
      graficoBarras(tb1.area, { etiquetas: act.slice(0, se).map(function (_, i) { return String(i + 1); }), valores: act.slice(0, se), color: C.s1, nombre: mod.unidad, alto: 260,
        rotuloEn: function (i) { var m = Math.max.apply(null, act.slice(0, se)); return act[i] === m && act.indexOf(m) === i; } });
      tablaDatos(tb1.card, ["SE", mod.unidad], act.slice(0, se).map(function (v, i) { return [i + 1, v]; }));
    } else {
    var t3 = tarjeta(g, mod.titulo + " por semana, " + tres[0] + "–" + ANIO, nombreEESS(cod));
    leyenda(t3.card, tres.map(function (a, k) { return { nombre: String(a), color: cols[k], linea: true }; }));
    graficoLineas(t3.area, {
      n: 53, series: tres.map(function (a, k) { var v = serie(mod, cod, a); return { nombre: String(a), color: cols[k], ancho: a === ANIO ? 2.5 : 1.5, valores: a === ANIO ? v.map(function (x, i) { return i < se ? x : null; }) : v }; }),
      etiquetasX: function (i) { return i + 1; }, tituloX: function (i) { return "SE " + (i + 1); }
    });
    tablaDatos(t3.card, ["SE"].concat(tres.map(String)), new Array(53).fill(0).map(function (_, i) { return [i + 1].concat(tres.map(function (a) { var v = serie(mod, cod, a)[i]; return a === ANIO && i >= se ? "" : v; })); }));
    }

    // Por establecimiento
    var hayPrev = tieneAnio(mod, ANIO - 1);
    if (D.microredes && (cod === "TOTAL" || esMR(cod))) {
      var uni = cod === "TOTAL" ? D.microredes : D.eess.filter(function (e) { return e.mr === cod; });
      var fl = uni.map(function (u) { return { n: u.nombre.replace(/^Microred /, ""), a: sum(serie(mod, u.cod, ANIO).slice(0, se)), p: hayPrev ? sum(serie(mod, u.cod, ANIO - 1).slice(0, se)) : 0 }; })
        .filter(function (f) { return f.a || f.p; }).sort(function (x, y) { return y.a - x.a || y.p - x.p; });
      var nivel = cod === "TOTAL" ? "microred" : "establecimiento";
      var tot0 = sum(fl.map(function (f) { return f.a; }));
      var t4m = tarjeta(g, mod.titulo + " por " + nivel + ", SE 1–" + se + " de " + ANIO, (cod === "TOTAL" ? "Según la microred del establecimiento notificante." : nombreEESS(cod) + ".") + (fl.length > 15 ? " Se muestran los 15 con más " + mod.unidad + "; la tabla tiene todos." : ""));
      var top = fl.slice(0, 15);
      if (hayPrev) { leyenda(t4m.card, [{ nombre: String(ANIO - 1), color: C.s2 }, { nombre: String(ANIO), color: C.s1 }]); graficoBarrasH(t4m.area, { etiquetas: top.map(function (f) { return f.n; }), series: [{ nombre: String(ANIO - 1), color: C.s2, valores: top.map(function (f) { return f.p; }) }, { nombre: String(ANIO), color: C.s1, valores: top.map(function (f) { return f.a; }) }] }); }
      else if (top.length) graficoBarrasH(t4m.area, { etiquetas: top.map(function (f) { return f.n; }), series: [{ nombre: mod.unidad + " " + ANIO, color: C.s1, valores: top.map(function (f) { return f.a; }) }] });
      else t4m.area.appendChild(el("p", "dash-nota", "Sin " + mod.unidad + " notificados en el periodo."));
      tablaDatos(t4m.card, [nivel.charAt(0).toUpperCase() + nivel.slice(1)].concat(hayPrev ? [String(ANIO - 1)] : [], [String(ANIO), "% del total"]), fl.map(function (f) { return [f.n].concat(hayPrev ? [f.p] : [], [f.a, fmt(pct(f.a, tot0), 1) + " %"]); }));
      if (cod === "TOTAL") {
        var es = D.eess.map(function (e) { return { n: e.nombre, mr: ((D.microredes.filter(function (m) { return m.cod === e.mr; })[0] || {}).nombre || "").replace(/^Microred /, ""), a: sum(serie(mod, e.cod, ANIO).slice(0, se)) }; }).filter(function (f) { return f.a; }).sort(function (x, y) { return y.a - x.a; });
        var t4e = tarjeta(g, "Establecimientos que más notifican, SE 1–" + se, es.length + " establecimientos con " + mod.unidad + " en " + ANIO + ". Se muestran los 10 primeros; la tabla tiene todos.");
        graficoBarrasH(t4e.area, { etiquetas: es.slice(0, 10).map(function (f) { return f.n; }), series: [{ nombre: mod.unidad, color: C.s1, valores: es.slice(0, 10).map(function (f) { return f.a; }) }] });
        tablaDatos(t4e.card, ["Establecimiento", "Microred", String(ANIO), "% del total"], es.map(function (f) { return [f.n, f.mr, f.a, fmt(pct(f.a, tot0), 1) + " %"]; }));
      }
    } else if (cod === "TOTAL" && D.eess.length) {
      var filas = D.eess.map(function (e) {
        var a = sum(serie(mod, e.cod, ANIO).slice(0, se)), p = sum(serie(mod, e.cod, ANIO - 1).slice(0, se));
        var pb = mod.poblacion === "pob5" ? e.pob5 : e.pob;
        return { n: e.nombre, a: a, p: p, t: pb && mod.tasa_k ? a / pb * mod.tasa_k : null };
      }).filter(function (f) { return f.a || f.p; }).sort(function (x, y) { return y.a - x.a || y.p - x.p; });
      var t4 = tarjeta(g, mod.titulo + " por establecimiento, SE 1–" + se, "Comparación con el mismo periodo de " + (ANIO - 1) + ".");
      leyenda(t4.card, [{ nombre: String(ANIO - 1), color: C.s2 }, { nombre: String(ANIO), color: C.s1 }]);
      graficoBarrasH(t4.area, { etiquetas: filas.map(function (f) { return f.n; }), series: [{ nombre: String(ANIO - 1), color: C.s2, valores: filas.map(function (f) { return f.p; }) }, { nombre: String(ANIO), color: C.s1, valores: filas.map(function (f) { return f.a; }) }] });
      tablaDatos(t4.card, ["Establecimiento", String(ANIO - 1), String(ANIO), "Tasa " + ANIO + " x " + fmt(mod.tasa_k)], filas.map(function (f) { return [f.n, f.p, f.a, f.t == null ? "–" : fmt(f.t, 2)]; }));
    }

    // Grupos de edad (EDA / IRA)
    if (mod.edad && cod === "TOTAL") {
      var e = mod.edad, a0 = String(ANIO - 1), a1 = String(ANIO);
      if (e.anios[a0]) {
      var t5 = tarjeta(g, mod.titulo + " por grupo de edad, SE 1–" + se, D.ambito + ", mismo periodo de " + a0 + " y " + a1 + ".");
      leyenda(t5.card, [{ nombre: a0, color: C.s2 }, { nombre: a1, color: C.s1 }]);
      graficoBarrasH(t5.area, { etiquetas: e.grupos, series: [{ nombre: a0, color: C.s2, valores: e.anios[a0] }, { nombre: a1, color: C.s1, valores: e.anios[a1] }] });
      tablaDatos(t5.card, ["Grupo", a0, a1, "% " + a1], e.grupos.map(function (gr, i) { return [gr, e.anios[a0][i], e.anios[a1][i], fmt(pct(e.anios[a1][i], sum(e.anios[a1])), 1)]; }));
      } else {
      var t5b = tarjeta(g, mod.titulo + " por grupo de edad, SE 1–" + se + " de " + a1, D.ambito + ".");
      graficoBarrasH(t5b.area, { etiquetas: e.grupos, series: [{ nombre: mod.unidad, color: C.s1, valores: e.anios[a1] }] });
      tablaDatos(t5b.card, ["Grupo", a1, "%"], e.grupos.map(function (gr, i) { return [gr, e.anios[a1][i], fmt(pct(e.anios[a1][i], sum(e.anios[a1])), 1) + " %"]; }));
      }
    }

    if (id === "ira" && mod.neumonia && Object.keys(mod.neumonia).length > 1 && cod === "TOTAL") {
      var na = Object.keys(mod.neumonia).map(Number).sort();
      var t6 = tarjeta(g, "Neumonías en menores de 5 años por año, SE 1–" + se, "Incluye neumonía grave.");
      graficoBarras(t6.area, { etiquetas: na.map(String), valores: na.map(function (a) { return mod.neumonia[a]; }), nombre: "neumonías", colores: na.map(function (a) { return a === ANIO ? C.strong : C.soft; }), rotuloEn: function (i) { return i === na.length - 1; } });
      tablaDatos(t6.card, ["Año", "Neumonías < 5 a"], na.map(function (a) { return [a, mod.neumonia[a]]; }));
    }

    if (mod.caract) renderLeish(g, mod, cod, an);
  }

  function renderLeish(g, mod, cod, an) {
    // Mapa de calor
    if (an.length > 1) {
    var t = tarjeta(g, mod.titulo + " por semana epidemiológica, " + an[0] + "–" + ANIO, nombreEESS(cod) + ". Cada celda es una semana; más oscuro = más casos.", true);
    graficoCalor(t.area, { filas: an.map(String), valores: an.map(function (a) { return serie(mod, cod, a); }), nombre: mod.unidad });
    }
    if (cod !== "TOTAL") return;
    var ca = mod.caract.actual, ch = mod.caract.historico;
    if (!ch.n) return renderCaract(g, mod, ca);
    var t2 = tarjeta(g, "Curso de vida, " + ANIO + " vs " + (ANIO - 5) + "–" + (ANIO - 1), "Porcentaje de casos de cada periodo.");
    var pa = ca.curso.map(function (v) { return pct(v, ca.n) || 0; }), ph = ch.curso.map(function (v) { return pct(v, ch.n) || 0; });
    leyenda(t2.card, [{ nombre: (ANIO - 5) + "–" + (ANIO - 1), color: C.s2 }, { nombre: String(ANIO), color: C.s1 }]);
    graficoBarrasH(t2.area, { etiquetas: mod.curso_grupos, series: [{ nombre: (ANIO - 5) + "–" + (ANIO - 1), color: C.s2, valores: ph }, { nombre: String(ANIO), color: C.s1, valores: pa }], dec: 1, sufijo: " %" });
    tablaDatos(t2.card, ["Curso de vida", "Casos " + ANIO, "% " + ANIO, "Casos " + (ANIO - 5) + "–" + (ANIO - 1), "%"], mod.curso_grupos.map(function (gr, i) { return [gr, ca.curso[i], fmt(pa[i], 1), ch.curso[i], fmt(ph[i], 1)]; }));

    var t3 = tarjeta(g, "Características y oportunidad, " + ANIO, "Días entre inicio de síntomas y notificación (mediana y rango intercuartílico).");
    var kg = el("div", "kpi-grid kpi-mini"); t3.area.appendChild(kg);
    kpi(kg, "Mediana inicio → notificación", ca.dias_mediana == null ? "–" : fmt(ca.dias_mediana) + " días", "RIC " + fmt(ca.dias_q1, 1) + "–" + fmt(ca.dias_q3, 1) + " · " + (ANIO - 5) + "–" + (ANIO - 1) + ": " + fmt(ch.dias_mediana) + " días");
    kpi(kg, "Sexo", fmt(pct(ca.sexo.Masculino, ca.n), 1) + " % masculino", fmt(ca.sexo.Masculino) + " M · " + fmt(ca.sexo.Femenino) + " F");
    Object.keys(ca.forma || {}).forEach(function (k) { kpi(kg, k, fmt(ca.forma[k]), "casos " + ANIO); });

    var r = mod.residencia, t4 = tarjeta(g, "Casos por distrito de residencia, " + r.anios[0] + "–" + r.anios[r.anios.length - 1], "Año completo; " + ANIO + " hasta la SE " + mod.se_corte + ".", true);
    var wrap = el("div", "viz-table-wrap"), tb = el("table", "dash-table"), hr = el("tr");
    ["Distrito"].concat(r.anios).forEach(function (h) { hr.appendChild(el("th", null, h)); });
    var th = el("thead"); th.appendChild(hr); tb.appendChild(th); var bd = el("tbody");
    r.filas.slice().sort(function (a, b) { return sum(b.casos) - sum(a.casos); }).forEach(function (f) { var tr = el("tr"); tr.appendChild(el("td", null, f.nombre)); f.casos.forEach(function (v) { tr.appendChild(el("td", "num", v)); }); bd.appendChild(tr); });
    tb.appendChild(bd); wrap.appendChild(tb); t4.area.appendChild(wrap);
  }

  // Características cuando solo hay datos del año en curso
  function renderCaract(g, mod, ca) {
    if (!mod.sin_curso) {
    var t2 = tarjeta(g, "Curso de vida, " + ANIO, fmt(ca.n) + " " + mod.unidad + ".");
    graficoBarrasH(t2.area, { etiquetas: mod.curso_grupos, series: [{ nombre: mod.unidad, color: C.s1, valores: ca.curso }] });
    tablaDatos(t2.card, ["Curso de vida", mod.unidad, "%"], mod.curso_grupos.map(function (gr, i) { return [gr, ca.curso[i], fmt(pct(ca.curso[i], ca.n), 1) + " %"]; }));
    }
    var t3 = tarjeta(g, "Características, " + ANIO, ca.dias_mediana != null ? "Oportunidad: días entre inicio de síntomas y notificación (mediana y rango intercuartílico)." : null);
    var kg = el("div", "kpi-grid kpi-mini"); t3.area.appendChild(kg);
    kpi(kg, "Sexo", fmt(pct(ca.sexo.Masculino, ca.sexo.Masculino + ca.sexo.Femenino), 1) + " % masculino", fmt(ca.sexo.Masculino) + " M · " + fmt(ca.sexo.Femenino) + " F");
    if (ca.dias_mediana != null) kpi(kg, "Mediana inicio → notificación", fmt(ca.dias_mediana) + " días", "RIC " + fmt(ca.dias_q1, 1) + "–" + fmt(ca.dias_q3, 1) + " días");
    Object.keys(ca.forma || {}).forEach(function (k) { if (ca.forma[k]) kpi(kg, k, fmt(ca.forma[k]), mod.unidad + " " + ANIO); });
    (mod.distrib || []).forEach(function (d) {
      var it = d.items.filter(function (x) { return x[1] > 0 || d.items.length <= 7; }), tt = sum(it.map(function (x) { return x[1]; }));
      var td = tarjeta(g, d.titulo + ", " + ANIO, d.nota || null);
      graficoBarrasH(td.area, { etiquetas: it.map(function (x) { return x[0]; }), series: [{ nombre: mod.unidad, color: C.s1, valores: it.map(function (x) { return x[1]; }) }] });
      tablaDatos(td.card, [d.titulo, mod.unidad, "%"], it.map(function (x) { return [x[0], x[1], fmt(pct(x[1], d.nota && /varias|más de un/.test(d.nota) ? ca.n : tt), 1) + " %"]; }));
    });
    var r = mod.residencia;
    if (r && r.filas.length) {
      var t4 = tarjeta(g, mod.titulo + " por distrito, " + ANIO, (mod.nota_residencia || "Distrito de residencia.") + " Hasta la SE " + mod.se_corte + ".");
      var top = r.filas.slice(0, 12);
      graficoBarrasH(t4.area, { etiquetas: top.map(function (f) { return f.nombre.replace(/ \(.*$/, ""); }), series: [{ nombre: mod.unidad, color: C.s3, valores: top.map(function (f) { return f.casos[f.casos.length - 1]; }) }] });
      tablaDatos(t4.card, ["Distrito (provincia)", mod.unidad], r.filas.map(function (f) { return [f.nombre, f.casos[f.casos.length - 1]]; }));
      if (r.filas.length > 12) t4.card.insertBefore(el("p", "viz-note", "Se muestran los 12 distritos con más " + mod.unidad + " de " + r.filas.length + "; la tabla tiene todos."), t4.area);
    }
  }

  // ---------- Agua ----------
  function renderAgua() {
    var A = D.agua, aniosA = Array.from(new Set(A.mensual.map(function (r) { return r.anio; }))).sort();
    if (!estado.aguaAnio) estado.aguaAnio = aniosA[aniosA.length - 1];
    var provs = ["Todas"].concat(Array.from(new Set(A.distritos.map(function (d) { return d.provincia; }))).sort());
    filtros.appendChild(selector("Año", aniosA.map(function (a) { return { valor: a, nombre: a }; }), estado.aguaAnio, function (v) { estado.aguaAnio = +v; render(); }));
    filtros.appendChild(selector("Provincia", provs.map(function (p) { return { valor: p, nombre: p }; }), estado.aguaProv, function (v) { estado.aguaProv = v; render(); }));
    var an = estado.aguaAnio, pv = estado.aguaProv;
    nota(A.ambito + " · Muestras hasta el " + A.actualizado.split("-").reverse().join("/") + " · " + A.fuente);

    var dist = A.distritos.filter(function (d) { return d.anio === an && (pv === "Todas" || d.provincia === pv); });
    var T = dist.reduce(function (s, d) { ["cl_n", "cl_ok", "tu_n", "tu_ok", "ph_n", "ph_ok", "bac_n", "bac_pos", "ctt_n", "ctt_pos", "muestras", "ccpp"].forEach(function (k) { s[k] = (s[k] || 0) + d[k]; }); return s; }, {});
    var grid = el("div", "kpi-grid"); cuerpo.appendChild(grid);
    kpi(grid, "Cloro residual ≥ 0,5 mg/L", fmt(pct(T.cl_ok, T.cl_n), 1) + " %", fmt(T.cl_ok) + " de " + fmt(T.cl_n) + " muestras en red de distribución");
    kpi(grid, "Turbiedad ≤ 5 UNT", fmt(pct(T.tu_ok, T.tu_n), 1) + " %", fmt(T.tu_n) + " muestras");
    kpi(grid, "pH 6,5 – 8,5", fmt(pct(T.ph_ok, T.ph_n), 1) + " %", fmt(T.ph_n) + " muestras");
    kpi(grid, "Coliformes presentes", fmt(pct(T.bac_pos, T.bac_n), 1) + " %", fmt(T.bac_pos) + " de " + fmt(T.bac_n) + " análisis bacteriológicos");
    kpi(grid, "Cobertura", fmt(dist.length) + " distritos", fmt(T.ccpp) + " centros poblados · " + fmt(T.muestras) + " muestras");

    var g = el("div", "viz-grid"); cuerpo.appendChild(g);
    // % cloro adecuado por mes, años
    var t1 = tarjeta(g, "Muestras con cloro residual adecuado por mes", (pv === "Todas" ? "Todas las provincias" : pv) + ". Porcentaje de muestras de la red de distribución con ≥ 0,5 mg/L.", true);
    var colsA = [C.s2, C.s1];
    var mensual = function (a) {
      var v = new Array(12).fill(null);
      if (pv === "Todas") A.mensual.filter(function (r) { return r.anio === a; }).forEach(function (r) { v[r.mes - 1] = r.cl_n ? r.cl_ok / r.cl_n * 100 : null; });
      return v;
    };
    if (pv === "Todas") {
      var ult2 = aniosA.slice(-2);
      leyenda(t1.card, ult2.map(function (a, k) { return { nombre: String(a), color: colsA[k + 2 - ult2.length], linea: true }; }));
      graficoLineas(t1.area, {
        n: 12, yFijo: 100, series: ult2.map(function (a, k) { return { nombre: String(a), color: colsA[k + 2 - ult2.length], valores: mensual(a), ancho: a === an ? 2.5 : 1.5, puntos: true, dec: 1 }; }),
        etiquetasX: function (i) { return MESES[i]; }, tituloX: function (i) { return MESES[i]; }
      });
      tablaDatos(t1.card, ["Mes"].concat(ult2.map(String)), MESES.map(function (m, i) { return [m].concat(ult2.map(function (a) { var x = mensual(a)[i]; return x == null ? "" : fmt(x, 1) + " %"; })); }));
    } else {
      t1.area.appendChild(el("p", "dash-nota", "La serie mensual está disponible para el total de la Red. Vea el detalle por distrito abajo."));
    }

    // Por provincia: % cloro adecuado, años
    var provsA = provs.slice(1), ultA = aniosA.slice(-2);
    var porProv = function (a, p) { var r = A.distritos.filter(function (d) { return d.anio === a && d.provincia === p; }).reduce(function (s, d) { s.n += d.cl_n; s.ok += d.cl_ok; return s; }, { n: 0, ok: 0 }); return pct(r.ok, r.n); };
    var t2 = tarjeta(g, "Cloro residual adecuado por provincia", "Porcentaje de muestras de la red de distribución con ≥ 0,5 mg/L.");
    leyenda(t2.card, ultA.map(function (a, k) { return { nombre: String(a), color: colsA[k + 2 - ultA.length] }; }));
    graficoBarrasH(t2.area, { etiquetas: provsA, series: ultA.map(function (a, k) { return { nombre: String(a), color: colsA[k + 2 - ultA.length], valores: provsA.map(function (p) { return porProv(a, p); }) }; }), dec: 1, sufijo: " %", xMax: 100, rotularTodo: true });
    tablaDatos(t2.card, ["Provincia"].concat(ultA.map(String)), provsA.map(function (p) { return [p].concat(ultA.map(function (a) { return fmt(porProv(a, p), 1) + " %"; })); }));

    var conMuestras = dist.filter(function (d) { return d.cl_n >= 5; });
    var cero = conMuestras.filter(function (d) { return d.cl_ok === 0; });
    var bajo = conMuestras.filter(function (d) { return d.cl_ok / d.cl_n < 0.5; });
    var t2b = tarjeta(g, "Distritos según cloración, " + an, "Distritos con al menos 5 muestras en red de distribución.");
    var kg = el("div", "kpi-grid kpi-mini"); t2b.area.appendChild(kg);
    kpi(kg, "Sin ninguna muestra con cloro adecuado", fmt(cero.length) + " de " + fmt(conMuestras.length), "distritos");
    kpi(kg, "Menos de 50 % de muestras adecuadas", fmt(bajo.length) + " de " + fmt(conMuestras.length), "distritos (incluye los anteriores)");
    kpi(kg, "Muestras con cloro 0 mg/L", fmt(pct(dist.reduce(function (s, d) { return s + (d.cl_cero || 0); }, 0), T.cl_n), 1) + " %", "de las muestras de red");

    var t3 = tarjeta(g, "Resultados por distrito, " + an, "Ordenado por porcentaje de cloro adecuado. Pulse un encabezado para ordenar.", true);
    var cab = [["Provincia", "provincia"], ["Distrito", "distrito"], ["CCPP", "ccpp"], ["Muestras", "muestras"], ["% cloro ≥ 0,5", "pcl"], ["% turbiedad ≤ 5", "ptu"], ["% pH adecuado", "pph"], ["Bacteriológicos", "bac_n"], ["% con coliformes", "pbac"]];
    var filas = dist.map(function (d) { return { provincia: d.provincia, distrito: d.distrito, ccpp: d.ccpp, muestras: d.muestras, pcl: pct(d.cl_ok, d.cl_n), ptu: pct(d.tu_ok, d.tu_n), pph: pct(d.ph_ok, d.ph_n), bac_n: d.bac_n, pbac: pct(d.bac_pos, d.bac_n) }; });
    var orden = { k: "pcl", asc: true };
    var wrap = el("div", "viz-table-wrap"); t3.area.appendChild(wrap);
    function pintar() {
      wrap.innerHTML = "";
      var tb = el("table", "dash-table"), hr = el("tr");
      cab.forEach(function (c) {
        var th = el("th", "sortable", c[0] + (orden.k === c[1] ? (orden.asc ? " ▲" : " ▼") : ""));
        th.tabIndex = 0;
        var go = function () { orden = { k: c[1], asc: orden.k === c[1] ? !orden.asc : true }; pintar(); };
        th.addEventListener("click", go); th.addEventListener("keydown", function (e) { if (e.key === "Enter") go(); });
        hr.appendChild(th);
      });
      var thd = el("thead"); thd.appendChild(hr); tb.appendChild(thd);
      var bd = el("tbody");
      filas.slice().sort(function (a, b) {
        var x = a[orden.k], y = b[orden.k]; if (x == null) return 1; if (y == null) return -1;
        return (typeof x === "string" ? x.localeCompare(y) : x - y) * (orden.asc ? 1 : -1);
      }).forEach(function (f) {
        var tr = el("tr");
        cab.forEach(function (c) { var v = f[c[1]]; var td = el("td", typeof v === "number" ? "num" : null, v == null ? "–" : (c[1].charAt(0) === "p" && c[1] !== "provincia" ? fmt(v, 1) + " %" : (typeof v === "number" ? fmt(v) : v))); if (c[1] === "pcl" && v != null && v < 50) td.classList.add("alerta"); tr.appendChild(td); });
        bd.appendChild(tr);
      });
      tb.appendChild(bd); wrap.appendChild(tb);
    }
    pintar();
    cuerpo.appendChild(el("p", "dash-nota", "Criterios: " + [A.limites.cloro, A.limites.turbiedad, A.limites.ph, A.limites.bacterias].join(" · ") + ". En rojo, distritos con menos de 50 % de muestras con cloro adecuado."));
  }

  // ---------- Registros sin detalle (listas exportadas, p. ej. salud mental) ----------
  function registrosDe() { return (D.registros || []).filter(function (r) { return op.unidad && (op.unidad === "todas" || r.unidad === op.unidad); }); }
  function registros() {
    var rs = registrosDe(); if (!rs.length) return;
    var c = tarjeta(cuerpo, op.unidad === "todas" ? "Salud mental: personas en el registro" : "Personas en el registro de vigilancia", D.registros_nota || null, true);
    var g = el("div", "reg-grid"); c.area.appendChild(g);
    rs.forEach(function (r) {
      var b = el("div", "reg");
      b.appendChild(el("span", "kpi-l", r.nombre)); b.appendChild(el("strong", "kpi-v", fmt(r.n))); b.appendChild(el("span", "kpi-s", r.medida));
      (r.detalle || []).forEach(function (d) { var f = el("div", "reg-d"); f.appendChild(el("b", null, typeof d[1] === "number" ? fmt(d[1]) : d[1])); f.appendChild(el("span", null, " " + d[0] + (d[2] ? " · " + d[2] : ""))); b.appendChild(f); });
      g.appendChild(b);
    });
  }

  // ---------- Alertas: eventos individuales notificados en las 2 últimas semanas ----------
  function alertas() {
    var sem = Math.max.apply(null, MODS.map(function (id) { return D.modulos[id].se_corte; }).concat([1]));
    var ev = (D.eventos || []).filter(function (e) { return e.ultimo && e.ultimo.anio === ANIO && e.ultimo.se >= sem - 1; });
    var c = tarjeta(cuerpo, "Eventos notificados en las últimas 2 semanas (SE " + (sem - 1) + "–" + sem + ")", "Notificación individual; incluye eventos poco frecuentes que no tienen tablero propio. Pulse para ver el sistema de vigilancia.", true);
    if (!ev.length) { c.area.appendChild(el("p", "dash-nota", "No se notificaron casos individuales en estas semanas.")); return; }
    var l = el("div", "alert-lista"); c.area.appendChild(l);
    ev.forEach(function (e) {
      var a = el("a", "alert-item"); var dest = op.enlaces && (op.enlaces[e.modulo] || op.enlaces["@" + e.unidad]);
      if (dest) { a.href = "#" + dest; if (e.modulo) a.addEventListener("click", function (x) { x.preventDefault(); irA(e.modulo); }); }
      a.appendChild(el("strong", null, e.nombre)); a.appendChild(el("span", null, "Último caso: SE " + e.ultimo.se + " · " + fmt(e.total) + " en " + ANIO));
      l.appendChild(a);
    });
  }

  // ---------- Tabla de eventos de la unidad ----------
  function tablaEventos() {
    var ev = (D.eventos || []).filter(function (e) { return op.unidad && (op.unidad === "todas" ? e.unidad !== "otros" : e.unidad === op.unidad); });
    if (op.unidad && !ev.length && !MODS.length && !registrosDe().length) {
      cuerpo.appendChild(el("div", "empty", "Aún no se han cargado bases de notificación para este sistema de vigilancia."));
      return;
    }
    if (!ev.length) return;
    var aniosT = []; for (var a = ANIO - 5; a <= ANIO; a++) aniosT.push(a);
    if (D.anios_datos) aniosT = aniosT.filter(function (a) { return D.anios_datos.indexOf(a) >= 0; });
    var c = tarjeta(cuerpo, op.unidad === "todas" ? "Eventos de notificación individual" : "Eventos notificados en este sistema de vigilancia", D.ambito + ". Casos confirmados y probables" + (aniosT.length > 1 ? " por año (" + ANIO + " hasta la última semana con datos)" : " de " + ANIO + " hasta la SE " + (MODS.length ? D.modulos[MODS[0]].se_corte : "") ) + ". Los descartados se cuentan aparte. Pulse un evento subrayado para ver su tablero.", true);
    var wrap = el("div", "viz-table-wrap sin-tope"), tb = el("table", "dash-table"), hr = el("tr");
    ["Evento", "CIE-10"].concat(aniosT.length > 1 ? aniosT.map(String).concat(["Total histórico"]) : ["Casos " + ANIO], ["Autóctonos", "Importados", "Descartados", "Último caso"]).forEach(function (h) { hr.appendChild(el("th", null, h)); });
    var th = el("thead"); th.appendChild(hr); tb.appendChild(th); var bd = el("tbody");
    ev.forEach(function (e) {
      var tr = el("tr"), td0 = el("td");
      if (e.modulo && MODS.indexOf(e.modulo) >= 0) { var a0 = el("a", null, e.nombre); a0.href = "javascript:void(0)"; a0.addEventListener("click", function () { irA(e.modulo); }); td0.appendChild(a0); }
      else if (op.sala && op.enlaces && op.enlaces["@" + e.unidad]) { var a1 = el("a", null, e.nombre); a1.href = "#" + op.enlaces["@" + e.unidad]; td0.appendChild(a1); }
      else td0.textContent = e.nombre;
      tr.appendChild(td0); tr.appendChild(el("td", null, e.cie));
      aniosT.forEach(function (a) { var v = (e.por_anio || {})[a] || 0; tr.appendChild(el("td", "num" + (v ? "" : " cero"), v)); });
      if (aniosT.length > 1) tr.appendChild(el("td", "num", fmt(e.total)));
      tr.appendChild(el("td", "num", e.autoctonos != null ? fmt(e.autoctonos) : "–")); tr.appendChild(el("td", "num" + (e.importados ? " imp" : ""), e.importados != null ? fmt(e.importados) : "–")); tr.appendChild(el("td", "num", e.descartados ? fmt(e.descartados) : "–"));
      tr.appendChild(el("td", null, e.ultimo ? "SE " + e.ultimo.se + "-" + e.ultimo.anio : "–")); bd.appendChild(tr);
    });
    tb.appendChild(bd); wrap.appendChild(tb); c.area.appendChild(wrap);
  }

  // Redibujar al cambiar el tamaño
  var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { if (!raiz.offsetParent) return; render(); }, 200); });
  render();
  return render;
  }

  window.Dashboard = { montar: crear };
  // Compatibilidad: tablero de la Sala dinámica en #dash
  var rDash = null;
  window.DashboardRender = function () { var d = document.getElementById("dash"); if (!d) return; if (!rDash) rDash = crear(d, { agua: true, clave: "sala" }); else rDash(); };
})();
