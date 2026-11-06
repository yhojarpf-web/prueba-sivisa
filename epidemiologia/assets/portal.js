/* Motor de portales SIVISA (Epidemiología, Salud Ambiental…): menú de secciones (data/secciones.js) + catálogo (data/catalogo.js) */
(function () {
  "use strict";
  var S = window.SITIO || {}, SECS = (window.SECCIONES || []).slice(), DOCS = (window.CATALOGO || []).concat(window.CATALOGO_SEMANAL || []);
  var TITULO0 = document.title.split(" · ").slice(0, 2).join(" · ");
  var ID_PORTAL = window.PORTAL_ID || "epidemiologia";
  var $ = function (id) { return document.getElementById(id); };
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function norm(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim(); }
  function fecha(iso) { var p = String(iso || "").split("-"); return p.length === 3 ? p[2] + "/" + p[1] + "/" + p[0] : ""; }

  var ICONOS = {
    inicio: "M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
    gota: "M12 3c-3 4.5-6 7.6-6 11a6 6 0 0 0 12 0c0-3.4-3-6.5-6-11z",
    residuos: "M4 7h16 M9 7V4h6v3 M6 7l1 13h10l1-13 M10 11v6 M14 11v6",
    alimento: "M7 3v8 M5 3v5a2 2 0 0 0 4 0V3 M7 11v10 M17 3c-2 0-3 3-3 7h3v11",
    vector: "M12 8a3 3 0 0 1 3 3v4a3 3 0 0 1-6 0v-4a3 3 0 0 1 3-3z M12 8V5 M9 11H5 M15 11h4 M9 15l-4 2 M15 15l4 2 M10 5L8 3 M14 5l2-2",
    casa: "M3 11l9-8 9 8 M5 10v10h14V10 M10 20v-6h4v6",
    sala: "M3 4h18v12H3z M8 21h8 M12 16v5 M7 12l3-3 3 2 4-4",
    boletin: "M6 2h9l5 5v15H6z M14 2v6h6 M9 13h8 M9 17h8",
    lupa: "M11 4a7 7 0 1 0 0 14a7 7 0 0 0 0-14z M21 21l-5-5",
    grafico: "M4 20V11 M10 20V5 M16 20v-7 M21 20H3",
    alerta: "M12 3l10 18H2z M12 10v5 M12 18v.5",
    norma: "M5 3h11l3 3v15H5z M9 8h6 M9 12h6 M9 16h4",
    calendario: "M4 5h16v16H4z M4 10h16 M8 3v4 M16 3v4",
    enlace: "M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1 M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1",
    documento: "M6 2h9l5 5v15H6z M14 2v6h6",
    ficha: "M9 3h6v3H9z M7 5H5v16h14V5h-2 M9 11h6 M9 15h6",
    mapa: "M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z M9 3v15 M15 6v15",
    brote: "M12 7a5 5 0 1 0 0 10a5 5 0 0 0 0-10z M12 2v3 M12 19v3 M2 12h3 M19 12h3 M5 5l2 2 M17 17l2 2 M5 19l2-2 M17 7l2-2",
    algoritmo: "M9 3h6v4H9z M4 17h6v4H4z M14 17h6v4h-6z M12 7v4 M7 17v-3h10v3",
    libro: "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z M4 19V5 M8 7h7",
    reporte: "M6 2h9l5 5v15H6z M9 17v-3 M12 17v-6 M15 17v-4",
    chevron: "M6 9l6 6 6-6",
    equipo: "M9 11a4 4 0 1 0 0-8a4 4 0 0 0 0 8z M2 21a7 7 0 0 1 14 0 M17 4a3.5 3.5 0 0 1 0 7 M22 21a6 6 0 0 0-4-5.7",
    mision: "M5 21V4 M5 4h11l-2 4 2 4H5",
    vision: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M12 9a3 3 0 1 0 0 6a3 3 0 0 0 0-6z",
    check: "M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18z M8 12l3 3 5-6",
    corazon: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z",
    escudo: "M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z",
    reloj: "M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18z M12 7v5l3 2",
    estrella: "M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z",
    objetivo: "M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18z M12 7a5 5 0 1 0 0 10a5 5 0 0 0 0-10z M12 11a1 1 0 1 0 0 2a1 1 0 0 0 0-2z"
  };
  function icono(nombre) {
    var NS = "http://www.w3.org/2000/svg", s = document.createElementNS(NS, "svg");
    s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("aria-hidden", "true");
    var p = document.createElementNS(NS, "path"); p.setAttribute("d", ICONOS[nombre] || ICONOS.documento);
    p.setAttribute("fill", "none"); p.setAttribute("stroke", "currentColor"); p.setAttribute("stroke-width", "2");
    p.setAttribute("stroke-linecap", "round"); p.setAttribute("stroke-linejoin", "round");
    s.appendChild(p); return s;
  }

  // Jerarquía: una sección puede tener subsecciones (columna "padre" de secciones.csv)
  function hijos(sec) { return SECS.filter(function (s) { return s.padre === sec.id; }); }
  function padreDe(sec) { return sec.padre ? SECS.filter(function (s) { return s.id === sec.padre; })[0] : null; }
  // Un documento pertenece a una sección si su columna "seccion" coincide con el id o el título; la sección madre incluye los de sus subsecciones
  function docsPropios(sec) { var a = norm(sec.id), b = norm(sec.titulo); return DOCS.filter(function (d) { var x = norm(d.seccion); return x === a || x === b; }); }
  function docsDe(sec) { return hijos(sec).reduce(function (acc, h) { return acc.concat(docsDe(h)); }, docsPropios(sec)); }
  function seccionDeDoc(d) { var x = norm(d.seccion); return SECS.filter(function (s) { return norm(s.id) === x || norm(s.titulo) === x; })[0]; }

  // ---------- Cabecera compartida con SIVISA ----------
  (S.logosCabecera || ["red_salud.png"]).forEach(function (f) { var i = el("img", "top-logo"); i.src = "../assets/logos/" + f; i.alt = ""; $("logos-cabecera").appendChild(i); });
  var nav = $("nav-portales");
  var inicio = el("a", null, "SIVISA"); inicio.href = "../index.html"; nav.appendChild(inicio);
  (S.portales || []).forEach(function (p) {
    var a = el("a", p.id === ID_PORTAL ? "actual" : null, p.corto || p.titulo);
    a.href = "../" + p.enlace; if (p.id === ID_PORTAL) a.setAttribute("aria-current", "page"); nav.appendChild(a);
  });
  $("anio-pie").textContent = new Date().getFullYear();

  // ---------- Datos en la portada ----------
  var ult = DOCS.map(function (d) { return d.fecha; }).sort().pop();
  var D = window.DASHBOARD, se = D ? Math.max(D.modulos.eda.se_corte, D.modulos.ira.se_corte) : null;
  var DR = window.DASHBOARD_RED, seRed = DR ? Math.max.apply(null, Object.keys(DR.modulos).map(function (k) { return DR.modulos[k].se_corte; })) : null;
  var seSala = se;
  function seDe() { return seRed || seSala; }
  if (seRed) { se = seRed; D = DR; }
  [[DOCS.length, DOCS.length === 1 ? "publicación" : "publicaciones"],
   (function () { var n = SECS.filter(function (s) { return s.tipo !== "inicio" && !s.padre; }).length; return [n, n === 1 ? "módulo" : "módulos"]; })(),
   se ? ["SE " + se + "-" + D.anio, "datos de vigilancia"] : null,
   ult ? [fecha(ult), "última publicación"] : null].filter(Boolean).forEach(function (d) {
    var x = el("div", "dato"); x.appendChild(el("strong", null, d[0])); x.appendChild(el("span", null, d[1])); $("phero-datos").appendChild(x);
  });

  // ---------- Menú (con submenús) ----------
  var menu = $("menu"), abiertos = {};
  function item(s, sub) {
    var a = el("a", "pl-item" + (sub ? " pl-sub-item" : "")); a.dataset.id = s.id;
    if (s.tipo === "enlace") { a.href = s.enlace; a.target = "_blank"; a.rel = "noopener"; } else a.href = "#" + s.id;
    if (!sub) { var ic = el("span", "pl-item-ico"); ic.appendChild(icono(s.icono)); a.appendChild(ic); }
    a.appendChild(el("span", "pl-item-t", s.titulo));
    if (s.tipo === "documentos") { var n = docsDe(s).length; a.appendChild(el("span", "pl-item-n" + (n ? "" : " cero"), n)); }
    return a;
  }
  SECS.filter(function (s) { return !s.padre; }).forEach(function (s) {
    var hs = hijos(s), grupo = el("div", "pl-grupo"); grupo.dataset.id = s.id;
    var fila = el("div", "pl-fila"); fila.appendChild(item(s, false));
    if (hs.length) {
      var t = el("button", "pl-toggle"); t.type = "button"; t.setAttribute("aria-label", "Mostrar subsecciones de " + s.titulo); t.setAttribute("aria-expanded", "false");
      t.appendChild(icono("chevron"));
      t.addEventListener("click", function () { abiertos[s.id] = !abiertos[s.id]; pintarMenu(); });
      fila.appendChild(t);
    }
    grupo.appendChild(fila);
    if (hs.length) { var ul = el("div", "pl-subs"); hs.forEach(function (h) { ul.appendChild(item(h, true)); }); grupo.appendChild(ul); }
    menu.appendChild(grupo);
  });
  function pintarMenu() {
    menu.querySelectorAll(".pl-grupo").forEach(function (g) {
      var abierto = !!abiertos[g.dataset.id]; g.classList.toggle("abierto", abierto);
      var t = g.querySelector(".pl-toggle"); if (t) t.setAttribute("aria-expanded", abierto);
    });
  }

  // ---------- Tabla de documentos ----------
  function tabla(cont, lista, conSeccion) {
    cont.innerHTML = "";
    if (!lista.length) { cont.appendChild(el("div", "empty", "Aún no hay publicaciones en esta sección.")); return; }
    var wrap = el("div", "publication-table-wrap"), t = el("table", "publication-table"), th = el("thead"), tr0 = el("tr");
    ["NOMBRE", "FECHA", "ACCIÓN"].forEach(function (h) { tr0.appendChild(el("th", null, h)); });
    th.appendChild(tr0); t.appendChild(th);
    var tb = el("tbody");
    lista.forEach(function (d) {
      var tr = el("tr"), td1 = el("td"), nm = el("div", "publication-name"), info = el("div");
      nm.appendChild(el("span", "file-icon", "▣"));
      info.appendChild(el("strong", null, d.titulo));
      var sec = conSeccion ? seccionDeDoc(d) : null;
      var meta = [sec ? sec.titulo : "", d.se ? "SE " + String(d.se).padStart(2, "0") : "", d.vigilancia, d.descripcion].filter(Boolean);
      info.appendChild(el("small", null, meta.join(" · ")));
      nm.appendChild(info); td1.appendChild(nm); tr.appendChild(td1);
      tr.appendChild(el("td", "publication-date", fecha(d.fecha)));
      var td3 = el("td");
      if (d.archivo && /\.pdf$/i.test(d.archivo) && !/(^|\/)\.\.(\/|$)|^\/|:/.test(d.archivo)) {
        var a = el("a", "btn-download", "Descargar"); a.href = "documentos/" + d.archivo.split("/").map(encodeURIComponent).join("/"); a.target = "_blank"; a.rel = "noopener"; td3.appendChild(a);
      } else td3.appendChild(el("span", "unavailable", "Sin archivo"));
      tr.appendChild(td3); tb.appendChild(tr);
    });
    t.appendChild(tb); wrap.appendChild(t); cont.appendChild(wrap);
  }
  function ordenar(l) { return l.slice().sort(function (a, b) { return a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : (b.id || 0) - (a.id || 0); }); }

  function llenar(sel, primera, valores) {
    var actual = sel.value; sel.innerHTML = "";
    [primera].concat(valores).forEach(function (v) { sel.appendChild(el("option", null, v)); });
    sel.value = valores.indexOf(actual) >= 0 ? actual : primera;
  }
  function unicos(a) { return a.filter(function (v, i) { return v && a.indexOf(v) === i; }); }

  // ---------- Páginas de contenido (ej. Nosotros: data/nosotros.js) ----------
  function pagina(cont, bloques) {
    cont.innerHTML = "";
    if (!bloques.length) { cont.appendChild(el("div", "empty", "Contenido en preparación.")); return; }
    bloques.forEach(function (b) {
      var sec = el("section", "pg-b pg-b-" + b.tipo);
      if (b.titulo && b.tipo !== "destacado") sec.appendChild(el("h3", "pg-t", b.titulo));
      if (b.intro) sec.appendChild(el("p", "pg-intro", b.intro));
      if (b.tipo === "tarjetas") {
        var g = el("div", "pg-grid" + (b.compacto ? " compacto" : "")); g.style.setProperty("--cols", b.columnas || 3);
        b.items.forEach(function (it) {
          var c = el("article", "pg-card");
          var h = el("div", "pg-card-h"); var ic = el("span", "pg-ico"); ic.appendChild(icono(it.icono)); h.appendChild(ic); h.appendChild(el("h4", null, it.titulo)); c.appendChild(h);
          c.appendChild(el("p", null, it.texto)); g.appendChild(c);
        });
        sec.appendChild(g);
      }
      if (b.tipo === "destacado") {
        var d = el("div", "pg-dest"); var ic2 = el("span", "pg-ico grande"); ic2.appendChild(icono(b.icono || "objetivo")); d.appendChild(ic2);
        var tx = el("div"); tx.appendChild(el("h3", "pg-t", b.titulo)); tx.appendChild(el("p", null, b.texto)); d.appendChild(tx); sec.appendChild(d);
      }
      if (b.tipo === "cifras") {
        var cg = el("div", "pg-cifras");
        b.items.forEach(function (it) { var c = el("div", "pg-cifra"); c.appendChild(el("strong", null, it.valor)); c.appendChild(el("span", null, it.etiqueta)); if (it.detalle) c.appendChild(el("small", null, it.detalle)); cg.appendChild(c); });
        sec.appendChild(cg);
      }
      if (b.tipo === "lista") {
        var ol = el("ol", "pg-lista"); var n = b.mostrar || b.items.length;
        b.items.forEach(function (t, i) { var li = el("li", i >= n ? "oculto" : null); li.appendChild(el("span", "pg-num", i + 1)); li.appendChild(el("p", null, t)); ol.appendChild(li); });
        sec.appendChild(ol);
        if (b.items.length > n) {
          var bt = el("button", "btn-sec pg-mas", "Ver las " + b.items.length + " funciones"); bt.type = "button";
          bt.addEventListener("click", function () { var abierto = ol.classList.toggle("todo"); bt.textContent = abierto ? "Ver menos" : "Ver las " + b.items.length + " funciones"; });
          sec.appendChild(bt);
        }
      }
      if (b.tipo === "equipo") {
        var eg = el("div", "pg-equipo");
        b.items.forEach(function (p) {
          var c = el("div", "pg-persona" + (p.destacado ? " destacado" : ""));
          var w = p.nombre.replace(/^(((Lic|Tec|Téc|Dr|Dra|Mg|M\.?C|Ing|Enf|Lab|Psic)\.?)\s*)+/i, "").split(/\s+/).filter(function (x) { return x.length > 2; });
          c.appendChild(el("span", "pg-avatar", w.length ? (w[0][0] + (w.length > 2 ? w[w.length - 2][0] : w.length > 1 ? w[1][0] : "")).toUpperCase() : ""));
          var t = el("div"); t.appendChild(el("span", "pg-cargo", p.cargo)); t.appendChild(el("strong", null, p.nombre)); c.appendChild(t); eg.appendChild(c);
        });
        sec.appendChild(eg);
      }
      cont.appendChild(sec);
    });
  }

  // ---------- Vistas ----------
  var secActual = null, vista = "tarjetas";
  try { vista = localStorage.getItem("vista-docs") || "tarjetas"; } catch (e) { }
  function render() {
    var id = location.hash.replace("#", "");
    var sec = SECS.filter(function (s) { return s.id === id && s.tipo !== "enlace"; })[0] || SECS[0];
    var cambio = sec !== secActual; secActual = sec;
    var madre = padreDe(sec);
    if (cambio) { if (madre) abiertos[madre.id] = true; if (hijos(sec).length) abiertos[sec.id] = true; pintarMenu(); }
    menu.querySelectorAll(".pl-item").forEach(function (a) { var on = a.dataset.id === sec.id; a.classList.toggle("activo", on); a.classList.toggle("madre-activa", !!madre && a.dataset.id === madre.id); if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    $("sec-ico").innerHTML = ""; $("sec-ico").appendChild(icono(sec.icono || (madre && madre.icono)));
    $("sec-titulo").textContent = sec.titulo; $("sec-desc").textContent = sec.descripcion || "";
    var miga = $("sec-miga"); miga.innerHTML = "";
    if (madre) { var m = el("a", null, madre.titulo); m.href = "#" + madre.id; miga.appendChild(m); miga.appendChild(document.createTextNode(" › ")); }
    miga.hidden = !madre;
    // Subsecciones como accesos rápidos dentro de una sección madre
    var subs = $("subsecciones"); subs.innerHTML = ""; var hs = hijos(sec);
    subs.hidden = !hs.length;
    hs.forEach(function (h) {
      var a = el("a", "subchip"); a.href = h.tipo === "enlace" ? h.enlace : "#" + h.id;
      a.appendChild(el("strong", null, h.titulo));
      if (h.tipo === "documentos") { var n = docsDe(h).length; a.appendChild(el("span", null, n + (n === 1 ? " publicación" : " publicaciones"))); }
      if (h.tipo === "dashboard") a.appendChild(el("span", null, seDe(h) ? "Actualizado a la SE " + seDe(h) : "Indicadores"));
      subs.appendChild(a);
    });
    document.title = sec.titulo + " · " + TITULO0;
    ["inicio", "documentos", "dashboard", "pagina", "calendario", "mapa", "semanas", "territorio", "brotes", "algoritmos", "mapaepi"].concat(Object.keys(window.VISTAS || {})).forEach(function (v) { var z = $("vista-" + v); if (z) z.hidden = sec.tipo !== v; });
    // Vistas propias de cada portal (p. ej. Salud Ambiental: agua): window.VISTAS[tipo](contenedor, seccion, secciones)
    if (cambio && window.VISTAS && VISTAS[sec.tipo] && $("vista-" + sec.tipo)) VISTAS[sec.tipo]($("vista-" + sec.tipo), sec, SECS);
    if (sec.tipo === "mapaepi" && cambio && window.MapaEpi) MapaEpi.montar($("vista-mapaepi"), SECS);
    if (sec.tipo === "algoritmos" && cambio && window.Algoritmos) { var va = $("vista-algoritmos"); Algoritmos.montar(va, SECS); }
    if (sec.tipo === "brotes" && cambio && window.Brotes) { var vb = $("vista-brotes"); Brotes.montar(vb); var rb = ordenar(docsDe(sec)); if (rb.length) { var db = el("section", "docs-rel"); db.appendChild(el("h3", "pl-sub", "Informes publicados")); var cb = el("div"); db.appendChild(cb); vb.appendChild(db); Publicaciones.tarjetas(cb, rb, { base: "", secciones: SECS }); } }
    if (sec.tipo === "territorio" && cambio && window.Territorio) Territorio.montar($("vista-territorio"));
    if (sec.tipo === "semanas" && cambio && window.Semanas) Semanas.montar($("vista-semanas"), docsPropios(sec), sec, SECS);
    if (sec.tipo === "mapa" && cambio && window.Mapa) Mapa.montar($("vista-mapa"));
    if (sec.tipo === "calendario" && cambio && window.Calendario) {
      var vc = $("vista-calendario"), oficiales = ordenar(docsDe(sec));
      if (oficiales.length) {
        var ofi = el("section", "cal-oficial"); ofi.appendChild(el("h4", "cal-tit", "Calendario oficial"));
        var cont = el("div"); ofi.appendChild(cont); vc.innerHTML = ""; vc.appendChild(ofi);
        Publicaciones.tarjetas(cont, oficiales, { base: "", secciones: SECS });
        var inter = el("div"); vc.appendChild(inter); Calendario.montar(inter);
      } else Calendario.montar(vc);
    }
    if (sec.tipo === "pagina" && cambio) pagina($("vista-pagina"), (window.PAGINAS || {})[sec.id] || []);

    if (sec.tipo === "inicio") {
      var tiles = $("tiles"); tiles.innerHTML = "";
      SECS.filter(function (s) { return s.tipo !== "inicio" && !s.padre; }).forEach(function (s) {
        var a = el("a", "tile"); a.href = s.tipo === "enlace" ? s.enlace : "#" + s.id;
        if (s.tipo === "enlace") { a.target = "_blank"; a.rel = "noopener"; }
        var ic = el("span", "tile-ico"); ic.appendChild(icono(s.icono)); a.appendChild(ic);
        a.appendChild(el("strong", null, s.titulo));
        a.appendChild(el("span", "tile-d", s.descripcion || ""));
        if (s.tipo === "documentos") { var n = docsDe(s).length; a.appendChild(el("span", "tile-n", n + (n === 1 ? " publicación" : " publicaciones"))); }
        if (s.tipo === "dashboard" && seDe(s)) a.appendChild(el("span", "tile-n", "Actualizado a la SE " + seDe(s)));
        if (hijos(s).length) a.appendChild(el("span", "tile-sub", hijos(s).map(function (h) { return h.titulo; }).join(" · ")));
        tiles.appendChild(a);
      });
      Publicaciones.tarjetas($("tabla-inicio"), ordenar(DOCS).slice(0, 8), { base: "", secciones: SECS });
    }

    // Tabla CIE-10 de enfermedades sujetas a vigilancia (en Definiciones de caso)
    var enf = $("enfermedades"), conEnf = sec.id === "definiciones" && window.Enfermedades;
    enf.hidden = !conEnf;
    if (conEnf && cambio) Enfermedades.montar(enf, SECS);

    if (sec.tipo === "documentos") {
      var lista = docsDe(sec), dd = $("doc-destacado");
      if (cambio) {
        dd.innerHTML = "";
        var u = lista.some(function (d) { return d.destacar; }) ? ordenar(lista.filter(function (d) { return d.destacar; }))[0] : null;
        if (u) {
          var url = "documentos/" + u.archivo.split("/").map(encodeURIComponent).join("/");
          var bx = el("section", "sem-dest"), tx = el("div", "sem-dest-tx");
          tx.appendChild(el("span", "sem-dest-k", "Más reciente · " + fecha(u.fecha))); tx.appendChild(el("h3", null, u.titulo));
          bx.appendChild(tx); var ac = el("div", "sem-dest-ac");
          var v = el("a", "sem-btn", "Ver PDF"); v.href = url; v.target = "_blank"; v.rel = "noopener"; ac.appendChild(v);
          var b = el("a", "sem-btn sec", "Descargar"); b.href = url; b.setAttribute("download", ""); ac.appendChild(b);
          bx.appendChild(ac); dd.appendChild(bx);
        }
      }
      if (cambio) { $("buscar").value = ""; $("vigilancia").value = "Todas"; $("anio").value = "Todos"; }
      llenar($("vigilancia"), "Todas", unicos(lista.map(function (d) { return d.vigilancia; })).sort());
      llenar($("anio"), "Todos", unicos(lista.map(function (d) { return String(d.fecha).slice(0, 4); })).sort().reverse());
      var q = norm($("buscar").value), vg = $("vigilancia").value, an = $("anio").value;
      var x = ordenar(lista.filter(function (d) {
        if (vg !== "Todas" && d.vigilancia !== vg) return false;
        if (an !== "Todos" && String(d.fecha).slice(0, 4) !== an) return false;
        if (q && norm([d.titulo, d.vigilancia, d.descripcion].join(" ")).indexOf(q) < 0) return false;
        return true;
      }));
      $("conteo").textContent = x.length + (x.length === 1 ? " publicación" : " publicaciones");
      document.querySelectorAll(".vista-sel button").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.vista === vista); });
      if (vista === "tarjetas") Publicaciones.tarjetas($("tabla"), x, { base: "", secciones: SECS, vacio: "Aún no hay publicaciones en esta sección." });
      else tabla($("tabla"), x, false);
    }

    if (sec.tipo === "dashboard" && window.Dashboard && cambio) {
      var vd = $("vista-dashboard"); vd.innerHTML = "";
      var caja = el("div", "dash"); vd.appendChild(caja);
      var mods = String(sec.modulos || "").split(",").map(function (x) { return x.trim(); }).filter(Boolean);
      var esUnidad = sec.id === "unidades" || (padreDe(sec) && padreDe(sec).id === "unidades");
      var RED = window.DASHBOARD_RED, esSala = !esUnidad && !!RED;
      var enlaces = {};
      SECS.filter(function (x) { return x.padre === "unidades"; }).forEach(function (x) {
        enlaces["@" + x.id] = x.id;
        String(x.modulos || "").split(",").forEach(function (m) { m = m.trim(); if (m && !enlaces[m]) enlaces[m] = x.id; });
      });
      Dashboard.montar(caja, { datos: RED || window.DASHBOARD, modulos: mods.filter(function (m) { return m !== "agua"; }), agua: mods.indexOf("agua") >= 0,
        unidad: (sec.id === "unidades" || esSala) ? "todas" : esUnidad ? sec.id : null, clave: sec.id, sala: esSala, enlaces: enlaces });
      var rel = ordenar(docsDe(sec));
      if (rel.length) { var dr = el("section", "docs-rel"); dr.appendChild(el("h3", "pl-sub", "Documentos relacionados")); var cr = el("div"); dr.appendChild(cr); vd.appendChild(dr); Publicaciones.tarjetas(cr, rel, { base: "", secciones: SECS }); }
    }
    if (cambio && window.scrollY > 300) document.querySelector(".pl").scrollIntoView({ behavior: "smooth" });
  }

  ["buscar", "vigilancia", "anio"].forEach(function (id) { $(id).addEventListener("input", render); });
  document.querySelectorAll(".vista-sel button").forEach(function (b) {
    b.addEventListener("click", function () { vista = b.dataset.vista; try { localStorage.setItem("vista-docs", vista); } catch (e) { } render(); });
  });
  window.addEventListener("hashchange", render);
  render();
})();
