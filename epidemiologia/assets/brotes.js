/* Brotes, epizootias y EVISAP en la jurisdicción de la Red – Brotes.montar(contenedor)
   Datos: window.DASHBOARD_RED.brotes (preparar_vigilancia). Mapa: window.TERRITORIO.geo */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var ESTADOS = [
    { id: "En curso", color: "#1d4ed8", nota: "con informe de seguimiento, sin informe final" },
    { id: "Inicial", color: "#b45309", nota: "solo informe inicial" },
    { id: "Sin informe", color: "#6b7280", nota: "sin informes registrados" },
    { id: "Cerrado", color: "#94a3b8", nota: "con informe final (alta)" }
  ];
  var TIPOS = { BROTE: "Brote", EPIZOOTIA: "Epizootia", EVISAP: "EVISAP" };
  // Convención de la Oficina: brote = círculo rojo · epizootia = triángulo marrón · EVISAP = cuadrado verde
  var SIMB = { BROTE: { color: "#d32f2f", forma: "circulo" }, EPIZOOTIA: { color: "#8d5524", forma: "triangulo" }, EVISAP: { color: "#2e9e5b", forma: "cuadrado" } };
  function simb(t) { return SIMB[t] || SIMB.BROTE; }
  // Dibuja el símbolo del tipo; activo = relleno, cerrado = solo contorno
  function forma(tipo, r, activo, p) {
    var S = simb(tipo), a = { fill: activo ? S.color : "#fff", stroke: activo ? "#fff" : S.color, "stroke-width": activo ? 2 : 2.4 };
    if (S.forma === "triangulo") { var h = r * 1.25; a.points = [0, -h, h * 1.05, h * .78, -h * 1.05, h * .78].join(" "); a["stroke-linejoin"] = "round"; return sv("polygon", a, p); }
    if (S.forma === "cuadrado") { a.x = -r * .88; a.y = -r * .88; a.width = r * 1.76; a.height = r * 1.76; a.rx = 2; return sv("rect", a, p); }
    a.r = r; return sv("circle", a, p);
  }
  function icono(tipo, activo, tam) { var s = sv("svg", { viewBox: "-11 -11 22 22", width: tam || 14, height: tam || 14, class: "br-ico", "aria-hidden": "true" }); forma(tipo, 7, activo !== false, s); return s; }
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function sv(t, a, p) { var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function fmt(n, d) { if (n == null || isNaN(n)) return "–"; var p = Number(n).toFixed(d || 0).split("."), e = p[0]; if (e.length > 3) e = e.replace(/\B(?=(\d{3})+(?!\d))/g, " "); return e + (p[1] ? "," + p[1] : ""); }
  function fecha(f) { if (!f) return "–"; var p = f.split("-"); return p[2] + "/" + p[1] + "/" + p[0]; }
  function colorDe(e) { return (ESTADOS.filter(function (x) { return x.id === e; })[0] || ESTADOS[3]).color; }

  function montar(cont) {
    var D = window.DASHBOARD_RED, B = D && D.brotes, T = window.TERRITORIO, G = T && T.geo;
    cont.innerHTML = "";
    if (!B || !B.lista) { cont.appendChild(el("div", "empty", "Aún no se ha cargado la base de brotes.")); return; }
    var L = B.lista, filtro = { estado: "", tipo: "" };

    // Cifras
    var kp = el("div", "kpi-grid"); cont.appendChild(kp);
    function kpi(et, v, sub, color) { var k = el("div", "kpi"); k.appendChild(el("span", "kpi-l", et)); var s = el("strong", "kpi-v", v); if (color) s.style.color = color; k.appendChild(s); if (sub) k.appendChild(el("span", "kpi-s", sub)); kp.appendChild(k); }
    var activos = L.filter(function (b) { return b.estado !== "Cerrado"; });
    var sum = function (l, c) { return l.reduce(function (s, b) { return s + (b[c] || 0); }, 0); };
    var porTipo = function (t) { return L.filter(function (b) { return b.tipo === t; }).length; };
    kpi("Eventos notificados " + (D.anio || ""), fmt(L.length), porTipo("BROTE") + " brotes · " + porTipo("EPIZOOTIA") + " epizootias · " + porTipo("EVISAP") + " EVISAP");
    kpi("Activos (no cerrados)", fmt(activos.length), L.filter(function (b) { return b.estado === "En curso"; }).length + " en curso · " + L.filter(function (b) { return b.estado === "Inicial"; }).length + " con solo informe inicial", activos.length ? "#c62f2f" : null);
    kpi("Casos en brotes", fmt(sum(L.filter(function (b) { return b.tipo !== "EPIZOOTIA"; }), "casos")), fmt(sum(L.filter(function (b) { return b.tipo !== "EPIZOOTIA"; }), "hosp")) + " hospitalizados · " + fmt(sum(L.filter(function (b) { return b.tipo !== "EPIZOOTIA"; }), "fall")) + " fallecidos");
    var on = L.filter(function (b) { return b.oport_notif != null; }), oi = L.filter(function (b) { return b.oport_inicial != null; });
    var pc = function (l, c) { return l.length ? l.filter(function (b) { return b[c]; }).length / l.length * 100 : null; };
    kpi("Notificación oportuna", fmt(pc(on, "oport_notif"), 1) + " %", "notificados dentro de las 24 h de conocido el evento");
    kpi("Informe inicial oportuno", fmt(pc(oi, "oport_inicial"), 1) + " %", "cargado dentro de las 48 h de la notificación");
    kpi("Con informe final", fmt(L.length ? L.filter(function (b) { return b.inf && b.inf.final; }).length / L.length * 100 : null, 1) + " %", L.filter(function (b) { return b.inf && b.inf.final; }).length + " de " + L.length + " eventos");

    // Filtros
    var fl = el("div", "mp-filtros"); cont.appendChild(fl);
    function chips(clave, opciones) {
      opciones.forEach(function (o) {
        var b = el("button", "mp-chip"); b.type = "button"; b.dataset.k = clave; b.dataset.v = o.v;
        if (o.color) { var i = el("i"); i.style.background = o.color; b.appendChild(i); }
        b.appendChild(document.createTextNode(o.n)); b.addEventListener("click", function () { filtro[clave] = o.v; pintar(); }); fl.appendChild(b);
      });
    }
    chips("estado", [{ v: "", n: "Todos los estados" }].concat(ESTADOS.filter(function (e) { return L.some(function (b) { return b.estado === e.id; }); }).map(function (e) { return { v: e.id, n: e.id, color: e.color }; })));
    var sep = el("span", "br-sep"); fl.appendChild(sep);
    chips("tipo", [{ v: "", n: "Todos los tipos" }].concat(Object.keys(TIPOS).filter(function (t) { return porTipo(t); }).map(function (t) { return { v: t, n: TIPOS[t], color: simb(t).color }; })));

    var lay = el("div", "mp-lay"), caja = el("div", "mp-mapa"), lado = el("div", "mp-lado br-lado");
    lay.appendChild(caja); lay.appendChild(lado); cont.appendChild(lay);
    var ley = el("div", "viz-legend br-ley");
    Object.keys(TIPOS).forEach(function (t) { var s = el("span", "br-forma"); s.appendChild(icono(t, true, 16)); s.appendChild(document.createTextNode(TIPOS[t])); ley.appendChild(s); });
    var sA = el("span", "br-forma br-estado-ley"); sA.appendChild(icono("BROTE", true, 14)); sA.appendChild(document.createTextNode("Relleno: activo")); ley.appendChild(sA);
    var sC = el("span", "br-forma"); sC.appendChild(icono("BROTE", false, 14)); sC.appendChild(document.createTextNode("Contorno: cerrado (alta)")); ley.appendChild(sC);
    cont.insertBefore(ley, lay);

    // Mapa
    var mapa = G ? dibujarMapa(caja, G, T, L) : null;
    if (!G) caja.appendChild(el("div", "empty", "No se encontró la capa de límites (data/territorio.js)."));

    // Tabla
    var tablaCaja = el("div", "mp-lista"); lado.appendChild(tablaCaja);
    var ficha = el("div", "br-ficha"); ficha.hidden = true; lado.insertBefore(ficha, tablaCaja);
    function mostrar(b) {
      ficha.innerHTML = ""; ficha.hidden = false; ficha.style.borderTopColor = simb(b.tipo).color;
      var c = el("button", "mp-cerrar", "×"); c.type = "button"; c.setAttribute("aria-label", "Cerrar"); c.onclick = function () { ficha.hidden = true; if (mapa) mapa.marcar(null); }; ficha.appendChild(c);
      ficha.appendChild(el("span", "mp-pop-k", TIPOS[b.tipo] || b.tipo));
      ficha.appendChild(el("strong", null, b.evento));
      var est = el("span", "br-est", b.estado); est.style.background = colorDe(b.estado); ficha.appendChild(est);
      var ul = el("ul");
      [["Lugar", (b.localidad && b.localidad !== b.distrito ? b.localidad + " · " : "") + "distrito " + b.distrito + " (" + b.provincia + ")"], ["Establecimiento", b.eess], ["Inicio", fecha(b.inicio) + " · SE " + b.se_inicio], ["Conocimiento", fecha(b.conocimiento) + " · SE " + b.se],
       ["Casos", fmt(b.casos) + (b.hosp ? " · " + fmt(b.hosp) + " hospitalizados" : "") + (b.fall ? " · " + fmt(b.fall) + " fallecidos" : "")], ["Muestra", b.muestra ? "Sí" : "No"],
       ["Informes", ["inicial", "seguimiento", "final"].map(function (k) { return k.charAt(0).toUpperCase() + k.slice(1) + ": " + (b.inf && b.inf[k] ? fecha(b.inf[k]) : "–"); }).join(" · ")],
       ["Oportunidad", (b.horas_notif != null ? "notificado a las " + b.horas_notif + " h" : "") + (b.horas_inicial != null ? " · informe inicial a las " + b.horas_inicial + " h" : "")]].forEach(function (r) {
        if (!r[1]) return; var li = el("li"); li.appendChild(el("span", null, r[0])); li.appendChild(el("b", null, r[1])); ul.appendChild(li);
      });
      ficha.appendChild(ul);
      if (mapa) mapa.marcar(b);
    }
    function pintar() {
      fl.querySelectorAll(".mp-chip").forEach(function (b) { b.setAttribute("aria-pressed", filtro[b.dataset.k] === b.dataset.v); });
      var vis = L.filter(function (b) { return (!filtro.estado || b.estado === filtro.estado) && (!filtro.tipo || b.tipo === filtro.tipo); });
      vis.sort(function (a, b) { return (a.estado === "Cerrado") - (b.estado === "Cerrado") || (a.conocimiento < b.conocimiento ? 1 : -1); });
      tablaCaja.innerHTML = "";
      var t = el("table", "mp-tabla"), h = el("tr");
      ["Evento", "Lugar", "SE", "Casos"].forEach(function (x) { h.appendChild(el("th", null, x)); });
      var th = el("thead"); th.appendChild(h); t.appendChild(th); var tb = el("tbody");
      if (!vis.length) { var tr0 = el("tr"), td0 = el("td", null, "Sin eventos con este filtro."); td0.colSpan = 4; tr0.appendChild(td0); tb.appendChild(tr0); }
      vis.forEach(function (b) {
        var tr = el("tr"); tr.tabIndex = 0;
        var c1 = el("td"), cel = el("div", "mp-cel"); c1.appendChild(cel);
        cel.appendChild(icono(b.tipo, b.estado !== "Cerrado", 15));
        var tx = el("span"); tx.appendChild(el("b", null, b.evento)); tx.appendChild(el("small", null, (TIPOS[b.tipo] || b.tipo) + " · " + b.estado)); cel.appendChild(tx); tr.appendChild(c1);
        tr.appendChild(el("td", null, (b.localidad && b.localidad !== b.distrito ? b.localidad + ", " : "") + b.distrito));
        tr.appendChild(el("td", "num", b.se)); tr.appendChild(el("td", "num", fmt(b.casos)));
        var ir = function () { mostrar(b); tablaCaja.querySelectorAll("tr").forEach(function (r) { r.classList.remove("sel"); }); tr.classList.add("sel"); };
        tr.addEventListener("click", ir); tr.addEventListener("keydown", function (e) { if (e.key === "Enter") ir(); });
        tb.appendChild(tr);
      });
      t.appendChild(tb); tablaCaja.appendChild(t);
      if (mapa) mapa.filtrar(vis, mostrar);
    }
    pintar();
    cont.appendChild(el("p", "dash-nota", "Jurisdicción de la Red Integrada de Salud Chachapoyas. Estado según los informes registrados: " + ESTADOS.map(function (e) { return e.id.toLowerCase() + " = " + e.nota; }).join("; ") + ". Los eventos sin coordenadas se ubican en su distrito. Fuente: " + B.fuente + "."));
  }

  function dibujarMapa(caja, G, T, L) {
    var pr = G.proj, X = function (lo) { return (lo - pr.lon0) * pr.k * pr.esc; }, Y = function (la) { return (pr.lat1 - la) * pr.esc; };
    var red = {}; (T.distritos_red || []).forEach(function (d) { red[d.slice(1)] = 1; });
    var centro = {}; G.distritos.forEach(function (d) { centro[d.u] = d.c; });
    var barra = el("div", "mp-barra"), zoom = el("div", "ter-zoom"); barra.appendChild(zoom); caja.appendChild(barra);
    var svg = sv("svg", { class: "mp-svg2", role: "img", "aria-label": "Mapa de brotes en la jurisdicción de la Red" }, caja);
    var base = sv("g", {}, svg);
    G.distritos.forEach(function (d) { var p = sv("path", { d: d.d, class: "mp-dist" + (red[d.u] ? " red" : "") }, base); sv("title", {}, p).textContent = d.n; });
    if (G.departamento) sv("path", { d: G.departamento, class: "ter-dep" }, svg);
    var capa = sv("g", {}, svg);
    // posición: coordenadas si existen; si no, el centro del distrito con separación en espiral
    var cuenta = {};
    var nodos = L.map(function (b) {
      var x, y;
      if (b.lat != null && b.lon != null) { x = X(b.lon); y = Y(b.lat); }
      else { var c = centro[b.ubigeo] || [0, 0], i = cuenta[b.ubigeo] = (cuenta[b.ubigeo] || 0) + 1; var a = i * 2.4, r = i === 1 ? 0 : 2.2 * Math.sqrt(i); x = c[0] + r * Math.cos(a); y = c[1] + r * Math.sin(a); }
      var g = sv("g", { class: "mp-n", tabindex: 0, transform: "translate(" + x + "," + y + ")" }, capa), m = sv("g", {}, g);
      var r0 = 6 + Math.min(8, Math.sqrt(b.casos || 1) * 1.6), activo = b.estado !== "Cerrado", col = simb(b.tipo).color;
      if (activo) sv("circle", { r: r0 + 4, fill: "none", stroke: col, "stroke-width": 1.5, opacity: .55, class: "br-halo" }, m);
      forma(b.tipo, r0, activo, m);
      sv("title", {}, g).textContent = b.evento + " – " + (b.localidad || b.distrito) + " (" + b.estado + ")";
      return { b: b, g: g, m: m, x: x, y: y };
    });
    var pts = Object.keys(red).map(function (u) { return centro[u]; }).filter(Boolean);
    function cajaDe(lista, pad, minLado) {
      var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      lista.forEach(function (p) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); });
      var w = Math.max(x1 - x0, minLado), h = Math.max(y1 - y0, minLado), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      w *= 1 + pad; h *= 1 + pad; var hw = Math.max(h * .8, w); return [cx - hw / 2, cy - h / 2, hw, h];
    }
    var vRed = cajaDe(pts, .25, 60), vDep = [-8, -8, G.ancho + 16, G.alto + 16], vista = vRed;
    [["red", "Red"], ["dep", "Amazonas"]].forEach(function (z) { var b = el("button", null, z[1]); b.type = "button"; b.dataset.z = z[0]; b.addEventListener("click", function () { ver(z[0] === "red" ? vRed : vDep, z[0]); }); zoom.appendChild(b); });
    function ver(v, modo) { vista = v; svg.setAttribute("viewBox", v.join(" ")); zoom.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.z === modo); }); escalar(); }
    function escalar() { var s = vista[2] / (svg.clientWidth || caja.clientWidth || 600); nodos.forEach(function (n) { n.m.setAttribute("transform", "scale(" + s + ")"); }); }
    var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(escalar, 150); });
    requestAnimationFrame(function () { ver(vista, vista === vRed ? "red" : vista === vDep ? "dep" : ""); });
    ver(vRed, "red");
    return {
      filtrar: function (vis, alPulsar) {
        nodos.forEach(function (n) {
          var on = vis.indexOf(n.b) >= 0; n.g.style.display = on ? "" : "none";
          n.g.onclick = function () { alPulsar(n.b); };
          n.g.onkeydown = function (e) { if (e.key === "Enter") alPulsar(n.b); };
        });
        // los activos encima
        nodos.filter(function (n) { return n.b.estado !== "Cerrado"; }).forEach(function (n) { capa.appendChild(n.g); });
      },
      marcar: function (b) { nodos.forEach(function (n) { n.g.classList.toggle("sel", n.b === b); }); if (b) { var n = nodos.filter(function (k) { return k.b === b; })[0]; if (n) capa.appendChild(n.g); } }
    };
  }
  window.Brotes = { montar: montar };
})();
