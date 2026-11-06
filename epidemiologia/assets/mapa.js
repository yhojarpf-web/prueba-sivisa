/* Mapa de unidades de notificación – Mapa.montar(contenedor)
   Dibuja los puntos sobre los límites distritales de Amazonas (data/territorio.js); no depende de servicios externos. */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var COLORES = ["#2a78d6", "#eb6834", "#1baf7a", "#c98a00", "#7c4ddb", "#c0397a"];
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function sv(t, a, p) { var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function fmt(n) { return n == null ? "–" : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " "); }
  function radio(n) { return 6 + Math.sqrt(n || 1) * 2.2; }

  function ficha(p, colorProv) {
    var d = el("div", "mp-pop");
    d.appendChild(el("span", "mp-pop-k", p.tipo === "hospital" ? "Hospital" : "Microred " + p.microred));
    d.appendChild(el("strong", null, (p.tipo === "hospital" ? "Hospital " : "C.S. ") + p.nombre));
    var ul = el("ul");
    [["Categoría", p.categoria], ["Distrito", p.distrito + " (" + p.provincia + ")"], ["Dirección", p.direccion], ["Código IPRESS", p.cod],
     p.tipo === "cabecera" ? ["Establecimientos de la microred", fmt(p.n_ipress)] : null].filter(Boolean).forEach(function (r) {
      if (!r[1]) return; var li = el("li"); li.appendChild(el("span", null, r[0])); li.appendChild(el("b", null, r[1])); ul.appendChild(li);
    });
    d.appendChild(ul); if (colorProv) d.style.borderTopColor = colorProv; return d;
  }

  function montar(cont) {
    var U = window.UNIDADES; cont.innerHTML = "";
    if (!U || !U.puntos || !U.puntos.length) { cont.appendChild(el("div", "empty", "Aún no se ha cargado la capa de unidades.")); return; }
    var P = U.puntos, cab = P.filter(function (p) { return p.tipo === "cabecera"; });
    var provs = Array.from(new Set(P.map(function (p) { return p.provincia; }))).sort();
    var colorDe = {}; provs.forEach(function (pv, i) { colorDe[pv] = COLORES[i % COLORES.length]; });
    var totalEESS = cab.reduce(function (s, p) { return s + (p.n_ipress || 0); }, 0);
    var R = U.resumen || {};

    // Cifras
    var k = el("div", "kpi-grid");
    [[cab.length, "microredes", "con su establecimiento cabecera"], [fmt(totalEESS), "establecimientos de salud", "en las microredes de la Red"],
     R.notificantes ? [R.notificantes, "unidades notificantes (UN)", "notifican directamente a la Red"] : null, R.informantes ? [R.informantes, "unidades informantes (UI)", "informan a través de una unidad notificante"] : null,
     [provs.length, "provincias", provs.join(" · ")]].filter(Boolean).forEach(function (c) {
      var d = el("div", "kpi"); d.appendChild(el("strong", "kpi-v", c[0])); d.appendChild(el("span", "kpi-l", c[1])); if (c[2]) d.appendChild(el("span", "kpi-s", c[2])); k.appendChild(d);
    });
    cont.appendChild(k);

    // Filtros por provincia
    var filtro = el("div", "mp-filtros"), activa = "";
    var chips = [{ v: "", n: "Todas las provincias" }].concat(provs.map(function (p) { return { v: p, n: p }; }));
    chips.forEach(function (c) {
      var b = el("button", "mp-chip"); b.type = "button"; b.dataset.v = c.v;
      if (c.v) { var i = el("i"); i.style.background = colorDe[c.v]; b.appendChild(i); }
      b.appendChild(document.createTextNode(c.n)); b.addEventListener("click", function () { activa = c.v; aplicar(); }); filtro.appendChild(b);
    });
    cont.appendChild(filtro);

    var lay = el("div", "mp-lay"), caja = el("div", "mp-mapa"), lado = el("div", "mp-lado");
    lay.appendChild(caja); lay.appendChild(lado); cont.appendChild(lay);
    cont.appendChild(el("p", "dash-nota", "Ubicación de los establecimientos cabecera de cada microred sobre los límites distritales de Amazonas (INEI). El tamaño del círculo indica cuántos establecimientos tiene la microred; en celeste, los distritos de la Red. Pulse un punto o una fila para ver su ficha. Coordenadas referenciales, en proceso de validación." + (R.nota ? " Cifras de unidades: " + R.nota + "." : "")));

    // Lista
    var lista = el("div", "mp-lista"); lado.appendChild(lista);
    var resumenProv = el("div", "mp-prov"); lado.appendChild(resumenProv);

    var api = { enfocar: function () { }, filtrar: function () { } };
    function aplicar() {
      filtro.querySelectorAll(".mp-chip").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.v === activa); });
      var vis = P.filter(function (p) { return !activa || p.provincia === activa; })
        .sort(function (a, b) { return (a.tipo === "hospital") - (b.tipo === "hospital") || (b.n_ipress || 0) - (a.n_ipress || 0); });
      lista.innerHTML = "";
      var t = el("table", "mp-tabla"), h = el("tr");
      var conNI = P.some(function (p) { return p.notificantes != null || p.informantes != null; });
      ["Microred / cabecera"].concat(conNI ? ["UN", "UI", "Total"] : ["Provincia", "EE.SS."]).forEach(function (x, i) { var c = el("th", conNI && i ? "num" : null, x); if (x === "UN") c.title = "Unidades notificantes"; if (x === "UI") c.title = "Unidades informantes"; h.appendChild(c); });
      var th = el("thead"); th.appendChild(h); t.appendChild(th); var tb = el("tbody");
      vis.forEach(function (p) {
        var tr = el("tr"); tr.tabIndex = 0;
        var c1 = el("td"), cel = el("div", "mp-cel"); c1.appendChild(cel); var dot = el("i", "mp-dot" + (p.tipo === "hospital" ? " hosp" : "")); dot.style.background = colorDe[p.provincia]; cel.appendChild(dot);
        var tx = el("span"); tx.appendChild(el("b", null, p.tipo === "hospital" ? "Hospital " + p.nombre : p.microred));
        tx.appendChild(el("small", null, p.tipo === "hospital" ? p.distrito : "C.S. " + p.nombre + " · " + p.distrito)); cel.appendChild(tx); tr.appendChild(c1);
        if (!conNI) tr.appendChild(el("td", null, p.provincia)); if (conNI) { tr.appendChild(el("td", "num", p.notificantes == null ? "—" : fmt(p.notificantes))); tr.appendChild(el("td", "num", p.informantes == null ? "—" : fmt(p.informantes))); tr.appendChild(el("td", "num b", p.notificantes == null ? "—" : fmt((p.notificantes || 0) + (p.informantes || 0)))); }
        else tr.appendChild(el("td", "num", p.tipo === "hospital" ? "—" : fmt(p.n_ipress)));
        var ir = function () { api.enfocar(p); lista.querySelectorAll("tr").forEach(function (r) { r.classList.remove("sel"); }); tr.classList.add("sel"); };
        tr.addEventListener("click", ir); tr.addEventListener("keydown", function (e) { if (e.key === "Enter") ir(); });
        tb.appendChild(tr);
      });
      if (conNI && !activa) {
        (U.otras_unidades || []).forEach(function (o) {
          var tr = el("tr", "mp-otra"), c1 = el("td"), cel = el("div", "mp-cel"); c1.appendChild(cel);
          var tx = el("span"); tx.appendChild(el("b", null, o.nombre)); tx.appendChild(el("small", null, "Otra unidad · sin punto en el mapa")); cel.appendChild(el("i", "mp-dot otra")); cel.appendChild(tx); tr.appendChild(c1);
          tr.appendChild(el("td", "num", fmt(o.notificantes))); tr.appendChild(el("td", "num", fmt(o.informantes))); tr.appendChild(el("td", "num b", fmt(o.notificantes + o.informantes)));
          tb.appendChild(tr);
        });
        var tt = el("tr", "mp-total"), c0 = el("td", null, "Total de la Red"); tt.appendChild(c0);
        [R.notificantes, R.informantes, (R.notificantes || 0) + (R.informantes || 0)].forEach(function (v) { tt.appendChild(el("td", "num", fmt(v))); });
        tb.appendChild(tt);
      } else if (conNI && activa) {
        var sN = 0, sI = 0; vis.forEach(function (p) { sN += p.notificantes || 0; sI += p.informantes || 0; });
        var t2 = el("tr", "mp-total"), d0 = el("td", null, "Total " + activa); t2.appendChild(d0);
        [sN, sI, sN + sI].forEach(function (v) { t2.appendChild(el("td", "num", fmt(v))); }); tb.appendChild(t2);
      }
      t.appendChild(tb); lista.appendChild(t);
      api.filtrar(activa);
    }
    // Resumen por provincia
    var tp = el("table", "mp-tabla mp-tabla-prov"), hp = el("tr");
    var conNI2 = P.some(function (p) { return p.notificantes != null; });
    ["Provincia", "Microredes", "EE.SS."].concat(conNI2 ? ["UN", "UI"] : []).forEach(function (x) { hp.appendChild(el("th", null, x)); });
    var thp = el("thead"); thp.appendChild(hp); tp.appendChild(thp); var bp = el("tbody");
    provs.forEach(function (pv) {
      var c = cab.filter(function (p) { return p.provincia === pv; }), tr = el("tr");
      var td = el("td"); var dot = el("i", "mp-dot"); dot.style.background = colorDe[pv]; td.appendChild(dot); td.appendChild(document.createTextNode(pv)); tr.appendChild(td);
      tr.appendChild(el("td", "num", c.length)); tr.appendChild(el("td", "num", fmt(c.reduce(function (s, p) { return s + (p.n_ipress || 0); }, 0))));
      if (conNI2) { tr.appendChild(el("td", "num", fmt(c.reduce(function (s, p) { return s + (p.notificantes || 0); }, 0)))); tr.appendChild(el("td", "num", fmt(c.reduce(function (s, p) { return s + (p.informantes || 0); }, 0)))); }
      bp.appendChild(tr);
    });
    tp.appendChild(bp); resumenProv.appendChild(el("h4", null, "Por provincia")); resumenProv.appendChild(tp);

    api = mapaPropio(caja, P, colorDe);
    aplicar();
  }

  // ---------- Mapa propio: límites distritales de Amazonas (data/territorio.js) ----------
  function mapaPropio(caja, P, colorDe) {
    var T = window.TERRITORIO, G = T && T.geo;
    if (!G || !G.proj) { caja.appendChild(el("div", "empty", "No se encontró la capa de límites (data/territorio.js).")); return { enfocar: function () { }, filtrar: function () { } }; }
    var pr = G.proj, X = function (lo) { return (lo - pr.lon0) * pr.k * pr.esc; }, Y = function (la) { return (pr.lat1 - la) * pr.esc; };
    var red = {}; (T.distritos_red || []).forEach(function (d) { red[d.slice(1)] = 1; });
    var barra = el("div", "mp-barra"), zoom = el("div", "ter-zoom"); barra.appendChild(zoom); caja.appendChild(barra);
    var svg = sv("svg", { class: "mp-svg2", role: "img", "aria-label": "Mapa de las cabeceras de microred en la jurisdicción de la Red" }, caja);
    var base = sv("g", {}, svg);
    G.distritos.forEach(function (d) {
      var pth = sv("path", { d: d.d, class: "mp-dist" + (red[d.u] ? " red" : "") }, base);
      var t = sv("title", {}, pth); t.textContent = d.n + (red[d.u] ? "" : " (fuera de la Red)");
    });
    if (G.departamento) sv("path", { d: G.departamento, class: "ter-dep" }, svg);
    var capaP = sv("g", {}, svg), capaL = sv("g", { class: "mp-lbls" }, svg);
    var orden = P.slice().sort(function (a, b) { return (b.n_ipress || 0) - (a.n_ipress || 0); });
    var nodos = orden.map(function (p) {
      var x = X(p.lon), y = Y(p.lat), r = p.tipo === "hospital" ? 9 : radio(p.n_ipress);
      var g = sv("g", { class: "mp-n", tabindex: 0, transform: "translate(" + x + "," + y + ")" }, capaP), m = sv("g", {}, g);
      if (p.tipo === "hospital") { sv("rect", { x: -9, y: -9, width: 18, height: 18, rx: 4, fill: "#0b2f55", stroke: "#fff", "stroke-width": 2 }, m); var c = sv("text", { x: 0, y: 5, "text-anchor": "middle", class: "mp-cruz" }, m); c.textContent = "+"; }
      else sv("circle", { cx: 0, cy: 0, r: r, fill: colorDe[p.provincia], stroke: "#fff", "stroke-width": 2 }, m);
      var tt = sv("title", {}, g); tt.textContent = (p.tipo === "hospital" ? "Hospital " + p.nombre : "Microred " + p.microred + " – C.S. " + p.nombre) + " (" + p.distrito + ")";
      return { p: p, g: g, m: m, x: x, y: y, r: r, txt: p.tipo === "hospital" ? "H. " + p.nombre : p.microred, vis: true };
    });
    var pop = el("div", "mp-pop-fijo"); pop.hidden = true; caja.appendChild(pop);
    function mostrar(p) { pop.innerHTML = ""; pop.appendChild(ficha(p, colorDe[p.provincia])); var c = el("button", "mp-cerrar", "×"); c.type = "button"; c.setAttribute("aria-label", "Cerrar"); c.onclick = function () { pop.hidden = true; }; pop.appendChild(c); pop.hidden = false; }
    nodos.forEach(function (n) { n.g.addEventListener("click", function () { mostrar(n.p); }); n.g.addEventListener("keydown", function (e) { if (e.key === "Enter") mostrar(n.p); }); });

    var vista = null;
    function cajaDe(lista, pad, minLado) {
      var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      lista.forEach(function (n) { x0 = Math.min(x0, n.x); y0 = Math.min(y0, n.y); x1 = Math.max(x1, n.x); y1 = Math.max(y1, n.y); });
      var w = Math.max(x1 - x0, minLado), h = Math.max(y1 - y0, minLado), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      w *= 1 + pad; h *= 1 + pad; var hw = Math.max(h * .8, w); return [cx - hw / 2, cy - h / 2, hw, h];
    }
    var vRed = cajaDe(nodos, .5, 60), vDep = [-8, -8, G.ancho + 16, G.alto + 16];
    [["red", "Red"], ["dep", "Amazonas"]].forEach(function (z) { var b = el("button", null, z[1]); b.type = "button"; b.dataset.z = z[0]; b.addEventListener("click", function () { ver(z[0] === "red" ? vRed : vDep, z[0]); }); zoom.appendChild(b); });
    function ver(v, modo) {
      vista = v; svg.setAttribute("viewBox", v.join(" "));
      zoom.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.z === modo); });
      escalar();
    }
    function escalar() {   // marcadores y etiquetas con tamaño constante en pantalla
      if (!vista) return;
      var px = svg.clientWidth || caja.clientWidth || 600, s = vista[2] / px;
      capaL.innerHTML = ""; var ocup = [];
      nodos.forEach(function (n) { n.m.setAttribute("transform", "scale(" + s + ")"); if (n.vis) ocup.push({ x: n.x / s - n.r, y: n.y / s - n.r, w: 2 * n.r, h: 2 * n.r }); });
      nodos.forEach(function (n) {
        if (!n.vis) return;
        var cx = n.x / s, cy = n.y / s, r = n.r, w = n.txt.length * 6.6 + 6;
        var ops = [[cx + r + 4, cy + 4, "start", cx + r + 2, cy - 8], [cx - r - 4, cy + 4, "end", cx - r - 4 - w, cy - 8], [cx, cy - r - 5, "middle", cx - w / 2, cy - r - 18], [cx, cy + r + 14, "middle", cx - w / 2, cy + r + 2]];
        for (var o = 0; o < ops.length; o++) {
          var b = { x: ops[o][3], y: ops[o][4], w: w, h: 15 };
          if (b.x < vista[0] / s + 2 || b.x + b.w > (vista[0] + vista[2]) / s - 2 || b.y < vista[1] / s + 2 || b.y + b.h > (vista[1] + vista[3]) / s - 2) continue;
          if (ocup.some(function (q) { return b.x < q.x + q.w && q.x < b.x + b.w && b.y < q.y + q.h && q.y < b.y + b.h; })) continue;
          ocup.push(b);
          var t = sv("text", { x: ops[o][0] * s, y: ops[o][1] * s, "text-anchor": ops[o][2], class: "mp-lbl2", "font-size": 12 * s, "stroke-width": 3 * s }, capaL); t.textContent = n.txt; break;
        }
      });
    }
    var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(escalar, 150); });
    requestAnimationFrame(function () { ver(vRed, "red"); });
    ver(vRed, "red");
    return {
      enfocar: function (p) {
        var n = nodos.filter(function (k) { return k.p === p; })[0]; if (!n) return;
        nodos.forEach(function (k) { k.g.classList.toggle("sel", k === n); });
        ver(cajaDe([n], 0, 70), ""); mostrar(p);
      },
      filtrar: function (pv) {
        nodos.forEach(function (n) { n.vis = !pv || n.p.provincia === pv; n.g.style.opacity = n.vis ? 1 : .15; n.g.classList.remove("sel"); });
        pop.hidden = true;
        ver(pv ? cajaDe(nodos.filter(function (n) { return n.vis; }), .45, 50) : vRed, pv ? "" : "red");
      }
    };
  }

  window.Mapa = { montar: montar };
})();
