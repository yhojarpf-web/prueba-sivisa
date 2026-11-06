/* Mapa epidemiológico de la jurisdicción – MapaEpi.montar(contenedor, secciones)
   Junta: eventos individuales (por distrito y localidad de residencia), EDA/IRA/febriles (por establecimiento notificante),
   lesiones (lugar del accidente), brotes activos y población. Datos: DASHBOARD_RED.mapa / .brotes, TERRITORIO. */
(function () {
  "use strict";
  // Convención: brote = círculo rojo · epizootia = triángulo marrón · EVISAP = cuadrado verde
  var SIMB = { BROTE: ["#d32f2f", "c"], EPIZOOTIA: ["#8d5524", "t"], EVISAP: ["#2e9e5b", "s"] };
  function simbolo(tipo, r, p) {
    var S = SIMB[tipo] || SIMB.BROTE, a = { fill: S[0], stroke: "#fff", "stroke-width": 1.2, "vector-effect": "non-scaling-stroke" }, NS2 = "http://www.w3.org/2000/svg", e;
    if (S[1] === "t") { var h = r * 1.35; e = document.createElementNS(NS2, "polygon"); a.points = [0, -h, h * 1.1, h * .8, -h * 1.1, h * .8].join(" "); }
    else if (S[1] === "s") { e = document.createElementNS(NS2, "rect"); a.x = -r * .9; a.y = -r * .9; a.width = r * 1.8; a.height = r * 1.8; a.rx = .8; }
    else { e = document.createElementNS(NS2, "circle"); a.r = r; }
    for (var k in a) e.setAttribute(k, a[k]); p.appendChild(e); return e;
  }
  var NS = "http://www.w3.org/2000/svg";
  var RAMPA = ["#fde9df", "#f9c9b1", "#f3a27f", "#e8794f", "#d4532c", "#ad3a1c", "#7f2812"];
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function sv(t, a, p) { var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function fmt(n, d) { if (n == null || isNaN(n)) return "–"; var p = Number(n).toFixed(d || 0).split("."), e = p[0]; if (e.length > 3) e = e.replace(/\B(?=(\d{3})+(?!\d))/g, " "); return e + (p[1] ? "," + p[1] : ""); }

  function montar(cont, secs) {
    var D = window.DASHBOARD_RED, M = D && D.mapa, T = window.TERRITORIO, G = T && T.geo;
    cont.innerHTML = "";
    if (!M || !G) { cont.appendChild(el("div", "empty", "Faltan datos para el mapa (vigilancia_red.js o territorio.js).")); return; }
    var U = T.unidades, NOM = M.nombres, COL = M.colectivos, SE = M.se;
    var red = {}; T.distritos_red.forEach(function (d) { red[d.slice(1)] = 1; });
    // microred principal de cada distrito (la de mayor población asignada en ese distrito)
    var mrDe = {}; Object.keys(U).forEach(function (k) { if (k.charAt(0) !== "E") return; var e = U[k]; var d = e.distrito; mrDe[d] = mrDe[d] || {}; mrDe[d][e.microred] = (mrDe[d][e.microred] || 0) + e.total; });
    Object.keys(mrDe).forEach(function (d) { var o = mrDe[d]; mrDe[d] = Object.keys(o).sort(function (a, b) { return o[b] - o[a]; })[0]; });
    var distDeMr = {}; Object.keys(mrDe).forEach(function (d) { (distDeMr[mrDe[d]] = distDeMr[mrDe[d]] || []).push(d); });
    var activos = ((D.brotes || {}).lista || []).filter(function (b) { return b.estado !== "Cerrado"; });
    var enlace = {}; (secs || []).filter(function (s) { return s.padre === "unidades"; }).forEach(function (s) { String(s.modulos || "").split(",").forEach(function (m) { m = m.trim(); if (m && !enlace[m]) enlace[m] = s.id; }); (D.eventos || []).forEach(function (e) { if (e.unidad === s.id && !enlace[e.id]) enlace[e.id] = s.id; }); });
    ["eda", "ira"].forEach(function (k) { enlace[k] = "ira-eda"; }); enlace.feb = "febriles";

    var est = { nivel: "distrito", capa: "general", medida: "casos", sel: null };

    // ---------- valores ----------
    function sumaEv(ds, ev, i) { return ds.reduce(function (s, d) { var x = M.distritos[d]; return s + (x && x.ev[ev] ? x.ev[ev][i] : 0); }, 0); }
    function pob(ds) { return ds.reduce(function (s, d) { return s + ((U["D" + d] || {}).total || 0); }, 0); }
    var NT = ["diabetes", "lesiones", "violencia", "mnp", "plaguicidas"];   // no transmisibles y otros: van aparte
    function individuales() { return Object.keys(NOM).filter(function (e) { return COL.indexOf(e) < 0; }); }
    function valor(ds) {
      if (est.capa === "general") return individuales().filter(function (e) { return NT.indexOf(e) < 0; }).reduce(function (s, e) { return s + sumaEv(ds, e, 1); }, 0);
      var v = sumaEv(ds, est.capa, 0);
      if (est.medida === "tasa") { var p = pob(ds); return p ? v / p * (COL.indexOf(est.capa) >= 0 ? 1000 : 100000) : null; }
      return v;
    }
    function grupos() {
      if (est.nivel === "distrito") return Object.keys(red).map(function (d) { return { id: "D" + d, nombre: (U["D" + d] || {}).nombre || d, ds: [d] }; });
      return Object.keys(distDeMr).map(function (m) { return { id: m, nombre: (U[m] || {}).nombre || m, ds: distDeMr[m] }; });
    }
    function grupoDe(d) { return est.nivel === "distrito" ? "D" + d : mrDe[d]; }
    // Selección por búsqueda: distrito ("D010101"), microred ("MR-…") o establecimiento ("E00004838")
    function grupoSel(id) {
      if (!id) return null;
      if (id.charAt(0) === "D") { var d = id.slice(1); return red[d] ? { id: id, tipo: "Distrito · provincia " + ((U[id] || {}).provincia || ""), nombre: (U[id] || {}).nombre || d, ds: [d] } : null; }
      if (id.indexOf("MR-") === 0 && U[id]) { var ds = (U[id].distritos || []).filter(function (x) { return red[x]; }); return { id: id, tipo: "Microred · " + ds.length + (ds.length === 1 ? " distrito" : " distritos"), nombre: U[id].nombre, ds: ds, mr: true }; }
      if (id.charAt(0) === "E" && U[id]) { var e = U[id], dd = e.distrito; return { id: id, tipo: "Establecimiento · " + ((U[e.microred] || {}).nombre || "sin microred"), nombre: e.nombre, ds: [dd], eess: true, distrito: (U["D" + dd] || {}).nombre || dd }; }
      return null;
    }
    function selDs() { var g = grupoSel(est.sel); return g ? g.ds : null; }

    // ---------- controles ----------
    var ctl = el("div", "me-ctl"); cont.appendChild(ctl);
    function seg(etq, clave, ops) {
      var w = el("div", "dash-sel dash-origen"); w.appendChild(el("span", null, etq)); var g = el("div", "seg");
      ops.forEach(function (o) { var b = el("button", null, o[1]); b.type = "button"; b.dataset.v = o[0]; b.addEventListener("click", function () { est[clave] = o[0]; if (clave === "nivel") est.sel = null; pintar(); }); g.appendChild(b); });
      w.appendChild(g); ctl.appendChild(w); return g;
    }
    var gNivel = el("div");   // solo por distrito: varios distritos comparten microredes
    var lab = el("label", "dash-sel"); lab.appendChild(el("span", null, "Mostrar")); var sCapa = el("select"); lab.appendChild(sCapa); ctl.appendChild(lab);
    sCapa.appendChild(new Option("Situación general (transmisibles, últimas 4 semanas)", "general"));
    var og1 = el("optgroup"); og1.label = "Notificación individual (residencia)";
    individuales().filter(function (e) { return Object.keys(M.distritos).some(function (d) { return M.distritos[d].ev[e]; }); })
      .sort(function (a, b) { return NOM[a].localeCompare(NOM[b]); }).forEach(function (e) { og1.appendChild(new Option(NOM[e], e)); });
    var og2 = el("optgroup"); og2.label = "Notificación colectiva (establecimiento)"; COL.forEach(function (e) { og2.appendChild(new Option(NOM[e], e)); });
    sCapa.appendChild(og1); sCapa.appendChild(og2);
    sCapa.addEventListener("change", function () { est.capa = sCapa.value; pintar(); });
    var gMed = seg("Medida", "medida", [["casos", "Casos"], ["tasa", "Tasa"]]);
    // Buscador: distrito, microred o establecimiento
    var OPS = [];
    Object.keys(red).forEach(function (d) { var u = U["D" + d]; if (u) OPS.push({ id: "D" + d, n: u.nombre, k: "Distrito", s: "Provincia " + (u.provincia || "") }); });
    (T.microredes || []).forEach(function (m) { if (U[m] && (U[m].distritos || []).length) OPS.push({ id: m, n: U[m].nombre, k: "Microred", s: (U[m].distritos || []).filter(function (x) { return red[x]; }).map(function (x) { return (U["D" + x] || {}).nombre; }).join(", ") }); });
    Object.keys(U).forEach(function (k) { if (k.charAt(0) !== "E") return; var e = U[k]; if (!red[e.distrito]) return; OPS.push({ id: k, n: e.nombre, k: "Establecimiento", s: ((U["D" + e.distrito] || {}).nombre || "") + " · " + ((U[e.microred] || {}).nombre || "") }); });
    function sinT(x) { return String(x || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
    var wb = el("div", "dash-sel me-busca"); wb.appendChild(el("span", null, "Buscar distrito, microred o establecimiento"));
    var iq = el("input"); iq.type = "search"; iq.placeholder = "Ej.: La Jalca, Yerbabuena, Pedro Ruiz…"; iq.setAttribute("autocomplete", "off"); iq.setAttribute("aria-autocomplete", "list"); wb.appendChild(iq);
    var res = el("ul", "me-res"); res.hidden = true; wb.appendChild(res); ctl.appendChild(wb);
    var idx = -1;
    function buscar() {
      var q = sinT(iq.value.trim()); res.innerHTML = ""; idx = -1;
      if (!q) { res.hidden = true; return; }
      var r = OPS.filter(function (o) { return sinT(o.n).indexOf(q) >= 0; }).sort(function (a, b) { var pre = function (o) { return sinT(o.n).replace(/^microred /, "").indexOf(q) === 0 ? 0 : 1; }, A = pre(a), B = pre(b); return A - B || ["Distrito", "Microred", "Establecimiento"].indexOf(a.k) - ["Distrito", "Microred", "Establecimiento"].indexOf(b.k) || a.n.localeCompare(b.n); }).slice(0, 10);
      if (!r.length) { res.appendChild(el("li", "me-res-vacio", "Sin resultados")); res.hidden = false; return; }
      r.forEach(function (o) { var li = el("li"); var b = el("button"); b.type = "button"; var k = el("span", "me-res-k me-res-" + o.k.toLowerCase(), o.k); b.appendChild(k); var t = el("span", "me-res-t"); t.appendChild(el("strong", null, o.n)); t.appendChild(el("small", null, o.s)); b.appendChild(t); b.addEventListener("mousedown", function (ev) { ev.preventDefault(); elegir(o); }); li.appendChild(b); res.appendChild(li); });
      res.hidden = false;
    }
    function elegir(o) { est.sel = o.id; iq.value = o.n; res.hidden = true; pintar(); if (window.innerWidth < 900) ficha.scrollIntoView({ behavior: "smooth", block: "start" }); }
    iq.addEventListener("input", buscar); iq.addEventListener("focus", buscar); iq.addEventListener("blur", function () { setTimeout(function () { res.hidden = true; }, 120); });
    iq.addEventListener("keydown", function (ev) {
      var bs = res.querySelectorAll("button"); if (!bs.length) return;
      if (ev.key === "ArrowDown" || ev.key === "ArrowUp") { ev.preventDefault(); idx = (idx + (ev.key === "ArrowDown" ? 1 : -1) + bs.length) % bs.length; bs.forEach(function (b, i) { b.classList.toggle("act", i === idx); }); }
      if (ev.key === "Enter") { ev.preventDefault(); (bs[idx >= 0 ? idx : 0]).dispatchEvent(new MouseEvent("mousedown")); }
      if (ev.key === "Escape") { res.hidden = true; }
    });

    var lay = el("div", "me-lay"), caja = el("div", "me-mapa viz-card"), ficha = el("aside", "me-ficha viz-card");
    lay.appendChild(caja); lay.appendChild(ficha); cont.appendChild(lay);
    var titulo = el("h3"), nota = el("p", "viz-note"); caja.appendChild(titulo); caja.appendChild(nota);
    var svg = sv("svg", { class: "me-svg", role: "img", "aria-label": "Mapa epidemiológico de la jurisdicción" }, caja);
    var ley = el("div", "viz-legend viz-ramp"); caja.appendChild(ley);
    cont.appendChild(el("p", "dash-nota", "Ubicación: los eventos de notificación individual, violencia familiar, diabetes y muerte fetal/neonatal por distrito de residencia; lesiones de tránsito por lugar del accidente; EDA, IRA y febriles por el distrito del establecimiento que notifica. Tasas con población 2026 (EDA, IRA y febriles por 1 000 hab.; los demás por 100 000). Año " + D.anio + " hasta la SE " + SE + "."));

    // geometría
    var formas = {}, base = sv("g", {}, svg);
    G.distritos.forEach(function (d) {
      var p = sv("path", { d: d.d, class: "me-d" + (red[d.u] ? " red" : "") }, base); formas[d.u] = p;
      if (!red[d.u]) return;
      p.addEventListener("click", function () { est.sel = grupoDe(d.u); iq.value = ""; pintar(); });
      p.addEventListener("pointermove", function (ev) { tip(ev, d.u); }); p.addEventListener("pointerleave", function () { tt.hidden = true; });
    });
    if (G.departamento) sv("path", { d: G.departamento, class: "ter-dep" }, svg);
    var capaB = sv("g", {}, svg);
    var centro = {}; G.distritos.forEach(function (d) { centro[d.u] = d.c; });
    var porDistB = {}; activos.forEach(function (b) { (porDistB[b.ubigeo] = porDistB[b.ubigeo] || []).push(b); });
    var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; Object.keys(red).forEach(function (u) { var c = centro[u]; if (!c) return; x0 = Math.min(x0, c[0]); y0 = Math.min(y0, c[1]); x1 = Math.max(x1, c[0]); y1 = Math.max(y1, c[1]); });
    var w = (x1 - x0) * 1.25 + 30, h = (y1 - y0) * 1.2 + 30; svg.setAttribute("viewBox", ((x0 + x1) / 2 - w / 2) + " " + ((y0 + y1) / 2 - h / 2) + " " + w + " " + h);
    var tt = el("div", "viz-tip"); tt.hidden = true; document.body.appendChild(tt);
    function tip(ev, u) {
      var gid = grupoDe(u), g = grupos().filter(function (x) { return x.id === gid; })[0]; if (!g) return;
      tt.innerHTML = ""; tt.appendChild(el("div", "viz-tip-t", g.nombre + (est.nivel === "microred" ? "" : " · " + ((U["D" + u] || {}).provincia || ""))));
      var v = valor(g.ds); tt.appendChild(el("div", "viz-tip-r", est.capa === "general" ? fmt(v) + " casos transmisibles en las últimas 4 semanas" : (est.medida === "tasa" ? fmt(v, 1) + " por " + (COL.indexOf(est.capa) >= 0 ? "1 000" : "100 000") + " hab." : fmt(v) + " " + NOM[est.capa])));
      var nb = g.ds.reduce(function (s, d) { return s + (porDistB[d] || []).length; }, 0); if (nb) tt.appendChild(el("div", "viz-tip-r", "Brotes, epizootias y EVISAP activos: " + nb));
      tt.hidden = false; var x = ev.clientX + 14, y = ev.clientY + 14; if (x + tt.offsetWidth > innerWidth - 8) x = ev.clientX - tt.offsetWidth - 14; tt.style.left = x + "px"; tt.style.top = y + "px";
    }

    // ---------- ficha ----------
    function linkEv(e, txt) { var a = el("a", null, txt); if (enlace[e]) { a.href = "#" + enlace[e]; } return a; }
    function pintarFicha() {
      ficha.innerHTML = "";
      var g = grupoSel(est.sel);
      var ds = g ? g.ds : Object.keys(red), nombre = g ? g.nombre : "Red Integrada de Salud Chachapoyas";
      var cab = el("div", "me-f-cab"); cab.appendChild(el("span", "mp-pop-k", g ? g.tipo : "Toda la jurisdicción"));
      cab.appendChild(el("strong", null, nombre));
      var p = g && g.mr ? U[g.id].total : g && g.eess ? U[g.id].total : pob(ds);
      cab.appendChild(el("span", "me-f-sub", (p ? fmt(p) + " hab. 2026" + (g && g.eess ? " asignados al establecimiento" : g && g.mr ? " asignados a la microred" : "") : "") + (g && g.mr ? " · distritos: " + ds.map(function (d) { return (U["D" + d] || {}).nombre || d; }).join(", ") : "")));
      if (g && g.eess) cab.appendChild(el("span", "me-f-sub me-f-nota", "La información epidemiológica se muestra para su distrito: " + g.distrito + "."));
      if (g && g.mr) cab.appendChild(el("span", "me-f-sub me-f-nota", "Suma de los distritos donde tiene establecimientos (un distrito puede compartirse con otras microredes)."));
      if (g) { var x = el("button", "mp-cerrar", "×"); x.type = "button"; x.setAttribute("aria-label", "Ver toda la Red"); x.onclick = function () { est.sel = null; iq.value = ""; pintar(); }; cab.appendChild(x); }
      ficha.appendChild(cab);
      // brotes activos
      var br = []; ds.forEach(function (d) { br = br.concat(porDistB[d] || []); });
      if (br.length) {
        var bx = el("div", "me-blk me-alerta"); bx.appendChild(el("h4", null, "Brotes, epizootias y EVISAP activos (" + br.length + ")"));
        var ul = el("ul"); br.forEach(function (b) { var li = el("li"); var ic = document.createElementNS("http://www.w3.org/2000/svg", "svg"); ic.setAttribute("viewBox", "-7 -7 14 14"); ic.setAttribute("width", "12"); ic.setAttribute("height", "12"); ic.setAttribute("class", "me-li-ico"); simbolo(b.tipo || "BROTE", 5, ic); li.appendChild(ic); var a = el("a", null, b.evento); a.href = "#brotes"; li.appendChild(a); li.appendChild(document.createTextNode(" · " + (b.localidad || b.distrito) + " · " + b.estado.toLowerCase() + " · SE " + b.se)); ul.appendChild(li); }); bx.appendChild(ul); ficha.appendChild(bx);
      }
      // eventos individuales
      var evs = individuales().map(function (e) { return { e: e, t: sumaEv(ds, e, 0), u: sumaEv(ds, e, 1), a: sumaEv(ds, e, 2) }; }).filter(function (x) { return x.t > 0; });
      evs.sort(function (a, b) { return (b.u > 0) - (a.u > 0) || (b.u - b.a) - (a.u - a.a) || b.t - a.t; });
      var sube = [], bi = null;
      [["Enfermedades transmisibles " + D.anio, evs.filter(function (x) { return NT.indexOf(x.e) < 0; }), true], ["No transmisibles y otros " + D.anio, evs.filter(function (x) { return NT.indexOf(x.e) >= 0; }), false]].forEach(function (gr) {
        if (!gr[1].length) return;
        var bk = el("div", "me-blk"); bk.appendChild(el("h4", null, gr[0])); ficha.appendChild(bk); if (!bi) bi = bk;
        var ul2 = el("ul", "me-ev"); gr[1].forEach(function (x) {
          var li = el("li"), tend = x.u > x.a ? "sube" : x.u < x.a ? "baja" : "";
          if (gr[2] && x.u > x.a && x.u >= 2) sube.push(NOM[x.e]);
          li.appendChild(linkEv(x.e, NOM[x.e])); li.appendChild(el("b", null, fmt(x.t)));
          li.appendChild(el("span", "me-ult " + tend, x.u ? fmt(x.u) + " en SE " + (SE - 3) + "–" + SE + (tend === "sube" ? " ▲" : tend === "baja" ? " ▼" : "") : "sin casos recientes"));
          ul2.appendChild(li);
        }); bk.appendChild(ul2);
      });
      if (!evs.length) { bi = el("div", "me-blk"); bi.appendChild(el("p", "me-vacio", "Sin casos de notificación individual en " + D.anio + ".")); ficha.appendChild(bi); }
      // colectivos
      var bc = el("div", "me-blk"); bc.appendChild(el("h4", null, "Notificación colectiva " + D.anio));
      var ul3 = el("ul", "me-ev"); COL.forEach(function (e) { var t = sumaEv(ds, e, 0), u = sumaEv(ds, e, 1), a = sumaEv(ds, e, 2); if (!t) return; var li = el("li"); li.appendChild(linkEv(e, NOM[e])); li.appendChild(el("b", null, fmt(t))); var tend = a ? (u > a * 1.2 ? "sube" : u < a * .8 ? "baja" : "") : ""; if (tend === "sube" && u - a >= 5) sube.push(NOM[e]); li.appendChild(el("span", "me-ult " + tend, fmt(u) + " en SE " + (SE - 3) + "–" + SE + (a ? " (" + (u >= a ? "+" : "") + fmt((u - a) / a * 100) + " %)" : ""))); ul3.appendChild(li); });
      bc.appendChild(ul3); if (ul3.children.length) ficha.appendChild(bc);
      if (sube.length) { var al = el("div", "me-blk me-alerta"); al.appendChild(el("h4", null, "En aumento")); al.appendChild(el("p", null, sube.join(" · ") + " (últimas 4 semanas frente a las 4 previas).")); ficha.insertBefore(al, bi); }
      // localidades
      if (g) {
        var loc = {}; ds.forEach(function (d) { var x = M.distritos[d]; if (!x) return; Object.keys(x.loc).forEach(function (l) { loc[l] = loc[l] || {}; Object.keys(x.loc[l]).forEach(function (e) { loc[l][e] = (loc[l][e] || 0) + x.loc[l][e]; }); }); });
        var ls = Object.keys(loc).map(function (l) { return [l, Object.keys(loc[l]).reduce(function (s, e) { return s + loc[l][e]; }, 0)]; }).sort(function (a, b) { return b[1] - a[1]; });
        if (ls.length) {
          var bl = el("div", "me-blk"); bl.appendChild(el("h4", null, "Localidades con casos (" + ls.length + ")"));
          var ul4 = el("ul", "me-loc"); ls.slice(0, 15).forEach(function (l) { var li = el("li"); li.appendChild(el("b", null, l[0])); li.appendChild(el("span", null, Object.keys(loc[l[0]]).sort(function (a, b) { return loc[l[0]][b] - loc[l[0]][a]; }).map(function (e) { return NOM[e] + " " + loc[l[0]][e]; }).join(" · "))); ul4.appendChild(li); });
          bl.appendChild(ul4); if (ls.length > 15) bl.appendChild(el("p", "me-vacio", "y " + (ls.length - 15) + " localidades más.")); ficha.appendChild(bl);
        }
      } else if (M.fuera.length) {
        var bf = el("div", "me-blk"); bf.appendChild(el("h4", null, "Atendidos en la Red con residencia fuera de la jurisdicción"));
        var por = {}; M.fuera.forEach(function (f) { (por[f.ev] = por[f.ev] || []).push(f); });
        var ul5 = el("ul", "me-loc"); Object.keys(por).sort(function (a, b) { return por[b].reduce(function (s, f) { return s + f.n; }, 0) - por[a].reduce(function (s, f) { return s + f.n; }, 0); }).forEach(function (e) {
          var li = el("li"), tot = por[e].reduce(function (s, f) { return s + f.n; }, 0); li.appendChild(el("b", null, NOM[e] + " · " + tot));
          li.appendChild(el("span", null, por[e].sort(function (a, b) { return b.n - a.n; }).map(function (f) { return f.lugar + " " + f.n; }).join(" · "))); ul5.appendChild(li);
        });
        bf.appendChild(ul5); ficha.appendChild(bf);
        ficha.appendChild(el("p", "me-vacio", "Pulse un distrito en el mapa para ver su detalle y sus localidades."));
      }
    }

    // ---------- pintar mapa ----------
    function pintar() {
      gNivel.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.v === est.nivel); });
      gMed.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.v === est.medida); b.disabled = est.capa === "general" && b.dataset.v === "tasa"; });
      if (est.capa === "general") est.medida = "casos";
      var gs = grupos(), vals = {}; gs.forEach(function (g) { vals[g.id] = valor(g.ds); });
      var mx = Math.max.apply(null, Object.keys(vals).map(function (k) { return vals[k] || 0; }).concat([1e-9]));
      var color = function (v) { if (!v) return "#eef3f6"; return RAMPA[Math.min(RAMPA.length - 1, Math.floor(Math.sqrt(v / mx) * RAMPA.length))]; };
      var SD = selDs(); Object.keys(red).forEach(function (u) { var gid = grupoDe(u), f = formas[u]; if (!f) return; f.style.fill = color(vals[gid]); var on = !!SD && SD.indexOf(u) >= 0; f.classList.toggle("sel", on); f.classList.toggle("off", !!SD && !on); });
      // bordes de microred más marcados
      capaB.innerHTML = "";
      Object.keys(porDistB).forEach(function (d) { if (!red[d] || !centro[d]) return; var c = centro[d], g = sv("g", { class: "me-b", transform: "translate(" + c[0] + "," + c[1] + ")" }, capaB); g.addEventListener("click", function () { est.sel = grupoDe(d); pintar(); }); g.addEventListener("pointermove", function (ev) { tip(ev, d); }); g.addEventListener("pointerleave", function () { tt.hidden = true; }); var tipos = ["BROTE", "EPIZOOTIA", "EVISAP"].filter(function (t) { return porDistB[d].some(function (b) { return (b.tipo || "BROTE") === t; }); });
        tipos.forEach(function (t, i) { var n = porDistB[d].filter(function (b) { return (b.tipo || "BROTE") === t; }).length, gx = sv("g", { transform: "translate(" + ((i - (tipos.length - 1) / 2) * 9.5) + ",0)" }, g); simbolo(t, 4.4, gx); var tx = sv("text", { y: t === "EPIZOOTIA" ? 3.4 : 2.2, "text-anchor": "middle", class: "me-b-t" }, gx); tx.textContent = n; });
        sv("title", {}, g).textContent = "Activos: " + porDistB[d].map(function (b) { return (b.tipo === "EPIZOOTIA" ? "epizootia" : b.tipo === "EVISAP" ? "EVISAP" : "brote") + " de " + b.evento; }).join(", "); });
      titulo.textContent = est.capa === "general" ? "Situación general por distrito" : NOM[est.capa] + " por distrito" + (est.medida === "tasa" ? " (tasa)" : "");
      nota.textContent = est.capa === "general" ? "Casos de enfermedades transmisibles de notificación individual en las últimas 4 semanas (SE " + (SE - 3) + "–" + SE + "). Símbolos: brotes (círculo rojo), epizootias (triángulo marrón) y EVISAP (cuadrado verde) activos, con su número. Pulse una zona para ver su detalle." : (COL.indexOf(est.capa) >= 0 ? "Por distrito del establecimiento que notifica. " : "Por distrito de residencia. ") + "Año " + D.anio + " hasta la SE " + SE + ".";
      ley.innerHTML = ""; ley.appendChild(document.createTextNode("0"));
      RAMPA.forEach(function (c) { var k = el("i", "viz-key sq"); k.style.background = c; ley.appendChild(k); });
      ley.appendChild(document.createTextNode(est.medida === "tasa" ? fmt(mx, 1) + " por " + (COL.indexOf(est.capa) >= 0 ? "1 000" : "100 000") : fmt(mx) + " casos"));
      [["BROTE", "Brote"], ["EPIZOOTIA", "Epizootia"], ["EVISAP", "EVISAP"]].forEach(function (x) { var lb = el("span", "me-ley-b"), k = document.createElementNS("http://www.w3.org/2000/svg", "svg"); k.setAttribute("viewBox", "-7 -7 14 14"); k.setAttribute("width", "13"); k.setAttribute("height", "13"); simbolo(x[0], 5, k); lb.appendChild(k); lb.appendChild(document.createTextNode(x[1] + (x[0] === "EPIZOOTIA" ? " activa" : " activo"))); ley.appendChild(lb); });
      pintarFicha();
    }
    pintar();
  }
  window.MapaEpi = { montar: montar };
})();
