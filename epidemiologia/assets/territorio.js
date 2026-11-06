/* Caracterización de la Red: mapa de la jurisdicción + población y pirámide – Territorio.montar(contenedor) */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var RAMPA = ["#d9ecf0", "#b3dae2", "#86c3cf", "#58a9b9", "#2f8ea2", "#17718a", "#0b566f"];
  var CH = "#2a78d6", CM = "#eb6834";
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function sv(t, a, p) { var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function fmt(n, d) {
    if (n == null || isNaN(n)) return "–";
    var p = Number(n).toFixed(d || 0).split("."), e = p[0].replace("-", "");
    if (e.length > 3) e = e.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return (n < 0 ? "-" : "") + e + (p[1] ? "," + p[1] : "");
  }
  function pct(a, b) { return b ? a / b * 100 : 0; }
  var tip = null;
  function showTip(e, t, l) {
    if (!tip) { tip = el("div", "viz-tip"); document.body.appendChild(tip); }
    tip.innerHTML = ""; tip.appendChild(el("div", "viz-tip-t", t)); l.forEach(function (x) { tip.appendChild(el("div", "viz-tip-r", x)); });
    tip.hidden = false; var x = e.clientX + 14, y = e.clientY + 14;
    if (x + tip.offsetWidth > innerWidth - 8) x = e.clientX - tip.offsetWidth - 14;
    if (y + tip.offsetHeight > innerHeight - 8) y = e.clientY - tip.offsetHeight - 14;
    tip.style.left = x + "px"; tip.style.top = y + "px";
  }
  function hideTip() { if (tip) tip.hidden = true; }

  function montar(cont) {
    var T = window.TERRITORIO; cont.innerHTML = "";
    if (!T) { cont.appendChild(el("div", "empty", "No se encontraron los datos de población (data/territorio.js).")); return; }
    var U = T.unidades, G = T.geo, sel = "RED";
    try { var g0 = localStorage.getItem("territorio-sel"); if (g0 && U[g0]) sel = g0; } catch (e) { }
    var porDist = {}; T.distritos_red.forEach(function (d) { porDist[d.slice(1)] = U[d]; });

    // Controles
    var top = el("div", "ter-top"); cont.appendChild(top);
    var lab = el("label", "dash-sel"); lab.appendChild(el("span", null, "Ámbito"));
    var s = el("select"); lab.appendChild(s); top.appendChild(lab);
    s.appendChild(new Option(U.RED.nombre + " (total)", "RED"));
    var og1 = el("optgroup"); og1.label = "Microredes"; T.microredes.forEach(function (m) { og1.appendChild(new Option(U[m].nombre, m)); }); s.appendChild(og1);
    var porProv = {}; T.distritos_red.forEach(function (d) { (porProv[U[d].provincia] = porProv[U[d].provincia] || []).push(d); });
    Object.keys(porProv).sort().forEach(function (p) { var og = el("optgroup"); og.label = "Distritos · provincia " + p; porProv[p].sort(function (a, b) { return U[a].nombre.localeCompare(U[b].nombre); }).forEach(function (d) { og.appendChild(new Option(U[d].nombre, d)); }); s.appendChild(og); });
    s.addEventListener("change", function () { elegir(s.value); });
    var volver = el("button", "ter-volver", "Ver toda la Red"); volver.type = "button"; volver.addEventListener("click", function () { elegir("RED"); }); top.appendChild(volver);

    var kpis = el("div", "kpi-grid ter-kpis"); cont.appendChild(kpis);
    var grid = el("div", "ter-grid"); cont.appendChild(grid);
    var cMapa = el("section", "viz-card ter-mapa"); grid.appendChild(cMapa);
    var cPir = el("section", "viz-card ter-pir"); grid.appendChild(cPir);
    var cTab = el("section", "viz-card viz-wide"); cont.appendChild(cTab);
    cont.appendChild(el("p", "dash-nota", "Fuente: " + T.fuente + ". Mapa: " + T.fuente_mapa));

    // ---------- Mapa ----------
    cMapa.appendChild(el("h3", null, "Jurisdicción de la Red en el departamento de Amazonas"));
    var nm = el("p", "viz-note", "Distritos de la Red coloreados según población; en gris, el resto de Amazonas. Pulse un distrito para ver su población."); cMapa.appendChild(nm);
    var maxP = Math.max.apply(null, T.distritos_red.map(function (d) { return U[d].total; }));
    var paso = function (v) { var i = Math.min(RAMPA.length - 1, Math.floor(Math.sqrt(v / maxP) * RAMPA.length)); return RAMPA[i]; };
    var svg = sv("svg", { viewBox: "-8 -8 " + (G.ancho + 16) + " " + (G.alto + 16), class: "ter-svg", role: "img", "aria-label": "Mapa de Amazonas con los distritos de la Red" }, cMapa);
    var capa = sv("g", {}, svg), formas = {};
    G.distritos.forEach(function (d) {
      var u = porDist[d.u];
      var p = sv("path", { d: d.d, class: "ter-d" + (d.red ? " red" : ""), fill: d.red ? paso(u.total) : "#eceff2" }, capa);
      formas[d.u] = p;
      p.addEventListener("pointermove", function (e) { showTip(e, d.n + (d.red ? "" : " (otra red)"), d.red ? ["Población 2026: " + fmt(u.total), "Provincia: " + u.provincia, U[u.microredes[0]] ? u.microredes.map(function (m) { return U[m].nombre; }).join(", ") : ""] : ["Fuera de la jurisdicción de la Red"]); });
      p.addEventListener("pointerleave", hideTip);
      if (d.red) p.addEventListener("click", function () { elegir("D" + d.u); });
    });
    if (G.departamento) sv("path", { d: G.departamento, class: "ter-dep" }, svg);
    var etq = sv("g", { class: "ter-etq" }, svg);
    // Ubicación en el Perú
    // Acercamiento: la Red (por defecto) o todo Amazonas
    var vistaA = "0 0 " + G.ancho + " " + G.alto, vistaR = vistaA, vistaS = vistaA;
    function caja(us, pad, minLado) {
      var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      us.forEach(function (u) { try { var b = formas[u].getBBox(); x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.x + b.width); y1 = Math.max(y1, b.y + b.height); } catch (e) { } });
      if (!(x1 > x0)) return null;
      var w = Math.max(x1 - x0, minLado), h = Math.max(y1 - y0, minLado), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      w *= 1 + pad; h *= 1 + pad; return (cx - w / 2) + " " + (cy - h / 2) + " " + w + " " + h;
    }
    var zoom = el("div", "ter-zoom"), modo = "red";
    [["red", "Red"], ["dep", "Amazonas"]].forEach(function (z) { var b = el("button", null, z[1]); b.type = "button"; b.dataset.z = z[0]; b.addEventListener("click", function () { modo = z[0]; aplicarZoom(); }); zoom.appendChild(b); });
    cMapa.insertBefore(zoom, svg);
    function aplicarZoom() {
      svg.setAttribute("viewBox", modo === "red" ? vistaR : modo === "sel" ? vistaS : "-8 -8 " + (G.ancho + 16) + " " + (G.alto + 16));
      svg.classList.toggle("zoom-red", modo !== "dep");
      var vw = parseFloat(svg.getAttribute("viewBox").split(" ")[2]) || G.ancho, px = svg.clientWidth || 400;
      etq.setAttribute("font-size", (11 * vw / px).toFixed(2)); etq.setAttribute("stroke-width", (3 * vw / px).toFixed(2));
      zoom.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.z === modo); });
    }
    function prepararZoom() { vistaR = caja(Object.keys(porDist), .12, 0) || vistaA; aplicarZoom(); }
    var ins = el("div", "ter-inset"); cMapa.appendChild(ins);
    var s2 = sv("svg", { viewBox: "0 0 " + G.peru.ancho + " " + G.peru.alto, "aria-label": "Ubicación de Amazonas en el Perú" }, ins);
    G.peru.deps.forEach(function (d) { sv("path", { d: d.d, fill: d.u === "01" ? CM : "#dfe5ea", stroke: "#fff", "stroke-width": .6 }, s2); });
    ins.appendChild(el("span", null, "Amazonas en el Perú"));
    var ley = el("div", "viz-legend viz-ramp"); ley.appendChild(document.createTextNode("Menos población"));
    RAMPA.forEach(function (c) { var k = el("i", "viz-key sq"); k.style.background = c; ley.appendChild(k); });
    ley.appendChild(document.createTextNode("Más")); cMapa.appendChild(ley);

    function distritosDe(id) {
      var x = U[id]; if (id === "RED") return T.distritos_red.map(function (d) { return d.slice(1); });
      if (x.tipo === "microred") return x.distritos; if (x.tipo === "distrito") return [id.slice(1)]; return [];
    }

    // ---------- Pirámide ----------
    function piramide(x) {
      cPir.innerHTML = ""; cPir.appendChild(el("h3", null, "Pirámide poblacional, " + T.anio));
      cPir.appendChild(el("p", "viz-note", x.nombre + " · " + fmt(x.total) + " habitantes. Porcentaje de la población total por sexo y grupo de edad."));
      var l = el("div", "viz-legend"); [["Hombres", CH], ["Mujeres", CM]].forEach(function (a) { var sp = el("span"); var k = el("i", "viz-key"); k.style.background = a[1]; sp.appendChild(k); sp.appendChild(document.createTextNode(a[0] + " " + fmt(pct(a[0] === "Hombres" ? x.esp.hombres : x.esp.mujeres, x.total), 1) + " %")); l.appendChild(sp); }); cPir.appendChild(l);
      var n = T.grupos.length, W = Math.max(300, cPir.clientWidth - 36), fila = 17, H = n * fila + 30, mid = W / 2, lw = 46;
      var ph = x.h.map(function (v) { return pct(v, x.total); }), pm = x.m.map(function (v) { return pct(v, x.total); });
      var mx = Math.max.apply(null, ph.concat(pm, [1])); mx = Math.ceil(mx / 2) * 2;
      var sc = (mid - lw / 2 - 22) / mx;
      var s3 = sv("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, class: "ter-pir-svg" }, cPir);
      [0, mx / 2, mx].forEach(function (t) {
        [-1, 1].forEach(function (sg) { var xx = mid + sg * (lw / 2 + t * sc); sv("line", { x1: xx, x2: xx, y1: 0, y2: n * fila, stroke: t ? "#e6e9ec" : "#c3c2b7" }, s3); var tx = sv("text", { x: xx, y: H - 10, "text-anchor": "middle", class: "viz-tick" }, s3); tx.textContent = fmt(t, t % 1 ? 1 : 0) + " %"; });
      });
      for (var i = 0; i < n; i++) (function (i) {
        var y = (n - 1 - i) * fila + 2, h = fila - 4;
        var wh = ph[i] * sc, wm = pm[i] * sc;
        sv("rect", { x: mid - lw / 2 - wh, y: y, width: Math.max(0, wh), height: h, rx: 2, fill: CH }, s3);
        sv("rect", { x: mid + lw / 2, y: y, width: Math.max(0, wm), height: h, rx: 2, fill: CM }, s3);
        var t = sv("text", { x: mid, y: y + h - 3, "text-anchor": "middle", class: "viz-tick ter-g" }, s3); t.textContent = T.grupos[i];
        var hit = sv("rect", { x: 0, y: y - 2, width: W, height: fila, fill: "transparent" }, s3);
        hit.addEventListener("pointermove", function (e) { showTip(e, T.grupos[i] + " años", ["Hombres: " + fmt(x.h[i]) + " (" + fmt(ph[i], 1) + " %)", "Mujeres: " + fmt(x.m[i]) + " (" + fmt(pm[i], 1) + " %)"]); });
        hit.addEventListener("pointerleave", hideTip);
      })(i);
      var det = el("details", "viz-table"); det.appendChild(el("summary", null, "Ver datos"));
      var w = el("div", "viz-table-wrap"), tb = el("table"), hr = el("tr");
      ["Grupo de edad", "Hombres", "Mujeres", "Total", "%"].forEach(function (c) { hr.appendChild(el("th", null, c)); });
      var th = el("thead"); th.appendChild(hr); tb.appendChild(th); var bd = el("tbody");
      T.grupos.forEach(function (g, i) { var r = el("tr"); [g, fmt(x.h[i]), fmt(x.m[i]), fmt(x.h[i] + x.m[i]), fmt(pct(x.h[i] + x.m[i], x.total), 1)].forEach(function (v) { r.appendChild(el("td", null, v)); }); bd.appendChild(r); });
      tb.appendChild(bd); w.appendChild(tb); det.appendChild(w); cPir.appendChild(det);
    }

    // ---------- Indicadores ----------
    function kpi(et, v, sub) { var k = el("div", "kpi"); k.appendChild(el("span", "kpi-l", et)); k.appendChild(el("strong", "kpi-v", v)); if (sub) k.appendChild(el("span", "kpi-s", sub)); kpis.appendChild(k); }
    function indicadores(id, x) {
      kpis.innerHTML = ""; var e = x.esp;
      kpi("Población " + T.anio, fmt(x.total), x.tipo === "red" ? "habitantes asignados a la Red" : fmt(pct(x.total, U.RED.total), 1) + " % de la Red");
      kpi("Menores de 1 año", fmt(e.menor1), "menores de 5: " + fmt(e.menor5));
      kpi("Niños y adolescentes", fmt(e.de5a11 + e.de12a17), "5–11 a: " + fmt(e.de5a11) + " · 12–17 a: " + fmt(e.de12a17));
      kpi("Adultos mayores (60+)", fmt(e.de60mas), fmt(pct(e.de60mas, x.total), 1) + " % de la población");
      kpi("Mujeres en edad fértil", fmt(e.mef), "15–49 años");
      kpi("Gestantes esperadas", fmt(e.gestantes), "nacimientos esperados: " + fmt(e.nacimientos));
      var nd = distritosDe(id).length, ne = id === "RED" ? T.distritos_red.reduce(function (a, d) { return a + U[d].eess.length; }, 0) : (x.eess || []).length;
      kpi("Cobertura", fmt(ne) + " EE.SS.", x.tipo === "eess" ? "" : fmt(nd) + (nd === 1 ? " distrito" : " distritos"));
    }

    // ---------- Tabla de componentes ----------
    function tabla(id, x) {
      cTab.innerHTML = "";
      var filas, titulo, cab;
      if (id === "RED") { titulo = "Población por microred"; cab = "Microred"; filas = T.microredes.map(function (m) { return [m, U[m]]; }); }
      else { titulo = "Población por establecimiento de salud"; cab = "Establecimiento"; filas = (x.eess || []).map(function (k) { return ["E" + k, U["E" + k]]; }).filter(function (f) { return f[1]; }); }
      filas.sort(function (a, b) { return b[1].total - a[1].total; });
      cTab.appendChild(el("h3", null, titulo + " · " + x.nombre));
      if (x.tipo === "microred") cTab.appendChild(el("p", "viz-note", "Distritos: " + x.distritos.map(function (d) { return U["D" + d].nombre; }).join(", ") + "."));
      var w = el("div", "viz-table-wrap sin-tope"), tb = el("table", "dash-table"), hr = el("tr");
      [cab].concat(id === "RED" ? [] : ["Distrito"], ["Población", "% del ámbito", "< 1 año", "< 5 años", "60+ años", "MEF 15–49", "Gestantes esperadas"]).forEach(function (c) { hr.appendChild(el("th", null, c)); });
      var th = el("thead"); th.appendChild(hr); tb.appendChild(th); var bd = el("tbody");
      filas.forEach(function (f) {
        var u = f[1], r = el("tr"), t0 = el("td");
        if (f[0].charAt(0) !== "E") { var a = el("a", null, u.nombre); a.href = "javascript:void(0)"; a.addEventListener("click", function () { elegir(f[0]); }); t0.appendChild(a); } else t0.textContent = u.nombre;
        r.appendChild(t0);
        if (id !== "RED") { var dd = U["D" + u.distrito]; r.appendChild(el("td", null, dd ? dd.nombre : "")); }
        [fmt(u.total), fmt(pct(u.total, x.total), 1) + " %", fmt(u.esp.menor1), fmt(u.esp.menor5), fmt(u.esp.de60mas), fmt(u.esp.mef), fmt(u.esp.gestantes)].forEach(function (v) { r.appendChild(el("td", "num", v)); });
        bd.appendChild(r);
      });
      tb.appendChild(bd); w.appendChild(tb); cTab.appendChild(w);
    }

    function elegir(id) {
      sel = id; s.value = id; volver.hidden = id === "RED"; hideTip();
      try { localStorage.setItem("territorio-sel", id); } catch (e) { }
      var x = U[id], ds = distritosDe(id), on = {}; ds.forEach(function (d) { on[d] = 1; });
      Object.keys(formas).forEach(function (u) { formas[u].classList.toggle("off", id !== "RED" && !on[u] && formas[u].classList.contains("red")); formas[u].classList.toggle("sel", id !== "RED" && !!on[u]); });
      etq.innerHTML = "";
      if (id !== "RED") G.distritos.forEach(function (d) { if (on[d.u]) { var t = sv("text", { x: d.c[0], y: d.c[1], "text-anchor": "middle", class: "ter-lbl" }, etq); t.textContent = d.n; } });
      if (vistaR !== vistaA || svg.getBBox) {
        var vs = id === "RED" ? null : caja(ds, .6, 70);
        if (vs) { vistaS = vs; modo = "sel"; } else if (modo === "sel") modo = "red";
        if (vistaR !== vistaA) aplicarZoom();
      }
      indicadores(id, x); piramide(x); tabla(id, x);
    }
    requestAnimationFrame(function () { prepararZoom(); elegir(sel); });
    elegir(sel);
    var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { if (cont.offsetParent) piramide(U[sel]); }, 200); });
  }
  window.Territorio = { montar: montar };
})();
