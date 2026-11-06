/* Algoritmos de decisión interactivos – Algoritmos.montar(contenedor, secciones)
   Datos: window.ALGORITMOS (data/algoritmos.js). Una sola versión: flujo vertical que funciona en computadora y celular. */
(function () {
  "use strict";
  var TIPOS = [
    ["inicio", "Inicio"], ["decision", "Decisión"], ["accion", "Acción"], ["epi", "Epidemiología"], ["lab", "Laboratorio"],
    ["criterio", "Criterio clínico"], ["final", "Confirmado"], ["descartado", "Descartado"], ["fuente", "Clasificación"], ["alerta", "Alerta"]
  ];
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function boton(txt, cls, fn) { var b = el("button", "alg-btn" + (cls ? " " + cls : ""), txt); b.type = "button"; b.addEventListener("click", fn); return b; }

  function montar(cont, secs) {
    var A = window.ALGORITMOS || []; cont.innerHTML = "";
    if (!A.length) { cont.appendChild(el("div", "empty", "Aún no se han cargado algoritmos.")); return; }
    var nombreSis = function (id) { var s = (secs || []).filter(function (x) { return x.id === id; })[0]; return s ? s.titulo : "Otros"; };
    var abrir = null;
    try { var g = sessionStorage.getItem("algoritmo"); if (g && A.some(function (a) { return a.id === g; })) abrir = g; } catch (e) { }
    if (abrir) ver(A.filter(function (a) { return a.id === abrir; })[0]); else lista();

    function lista() {
      try { sessionStorage.removeItem("algoritmo"); } catch (e) { }
      cont.innerHTML = "";
      cont.appendChild(el("p", "alg-intro", "Algoritmos operativos para la vigilancia de cada enfermedad sujeta a notificación. Pulse uno para recorrerlo paso a paso: cada paso se despliega y muestra la definición, los plazos, las muestras y las acciones."));
      var grupos = {}; A.forEach(function (a) { (grupos[a.sistema] = grupos[a.sistema] || []).push(a); });
      Object.keys(grupos).sort(function (x, y) { return nombreSis(x).localeCompare(nombreSis(y)); }).forEach(function (s) {
        cont.appendChild(el("h3", "pl-sub", nombreSis(s)));
        var gr = el("div", "alg-cards"); cont.appendChild(gr);
        grupos[s].forEach(function (a) {
          var c = el("button", "alg-card"); c.type = "button";
          c.appendChild(el("span", "alg-card-k", "CIE-10 " + a.cie));
          c.appendChild(el("strong", null, a.corto));
          c.appendChild(el("span", "alg-card-d", a.resumen ? "Inicia en: " + a.resumen : a.titulo));
          c.appendChild(el("span", "alg-card-n", a.norma));
          c.addEventListener("click", function () { ver(a); cont.scrollIntoView({ behavior: "smooth", block: "start" }); });
          gr.appendChild(c);
        });
      });
    }

    function ver(a) {
      try { sessionStorage.setItem("algoritmo", a.id); } catch (e) { }
      cont.innerHTML = "";
      var N = a.nodos, padre = {};
      Object.keys(N).forEach(function (id) { N[id].hijos.forEach(function (h) { padre[h] = id; }); });
      var conHijos = Object.keys(N).filter(function (id) { return N[id].hijos.length; });
      var abiertos = {}, sel = null;

      var top = el("div", "alg-top");
      top.appendChild(boton("← Todos los algoritmos", "sec", lista));
      cont.appendChild(top);
      var cab = el("header", "alg-cab");
      cab.appendChild(el("h3", null, a.titulo));
      cab.appendChild(el("p", "alg-norma", "Basado en la " + a.norma + (a.autor ? " · Elaborado por " + a.autor : "")));
      cont.appendChild(cab);
      var zona = cont, H = a.herramienta && window.Herramientas && window.Herramientas[a.herramienta];
      if (H) {
        var pest = el("div", "dash-tabs alg-pest"), zh = el("div"); zona = el("div");
        [["alg", "Algoritmo de vigilancia"], ["her", H.nombre]].forEach(function (t, i) {
          var b = el("button", "dash-tab" + (i ? "" : " active"), t[1]); b.type = "button"; b.dataset.id = t[0];
          b.addEventListener("click", function () {
            pest.querySelectorAll(".dash-tab").forEach(function (x) { x.classList.toggle("active", x === b); });
            zona.hidden = t[0] !== "alg"; zh.hidden = t[0] !== "her"; if (t[0] === "her" && !zh.childNodes.length) H.montar(zh);
          });
          pest.appendChild(b);
        });
        cont.appendChild(pest); cont.appendChild(zona); cont.appendChild(zh); zh.hidden = true;
      }
      var bar = el("div", "alg-bar");
      bar.appendChild(boton("Desplegar todo", "pri", function () { conHijos.forEach(function (id) { abiertos[id] = 1; }); pintar(); }));
      bar.appendChild(boton("Contraer", "", function () { abiertos = {}; sel = null; pintar(); }));
      bar.appendChild(boton("Guardar como PDF", "ver", function () { conHijos.forEach(function (id) { abiertos[id] = 1; }); pintar(); cont.classList.add("alg-imprimir"); setTimeout(function () { window.print(); cont.classList.remove("alg-imprimir"); }, 250); }));
      if (a.url) { var n = el("a", "alg-btn mor", "Ver normativa"); n.href = a.url; n.target = "_blank"; n.rel = "noopener"; bar.appendChild(n); }
      zona.appendChild(bar);
      var ley = el("div", "alg-ley"), usados = {};
      Object.keys(N).forEach(function (id) { usados[N[id].tipo] = 1; });
      TIPOS.forEach(function (t) { if (!usados[t[0]]) return; var s = el("span"); s.appendChild(el("i", "alg-sw t-" + t[0])); s.appendChild(document.createTextNode(t[1])); ley.appendChild(s); });
      zona.appendChild(ley);

      var lay = el("div", "alg-lay"), flujo = el("div", "alg-flujo"), panel = el("aside", "alg-panel");
      lay.appendChild(flujo); lay.appendChild(panel); zona.appendChild(lay);
      zona.appendChild(el("p", "dash-nota", "Pulse cada paso para ver su detalle; los pasos con + despliegan sus ramas. Este algoritmo es una guía operativa y no reemplaza la norma vigente ni el manejo clínico."));

      function detalle(id) {
        var d = el("div", "alg-det");
        d.appendChild(el("h4", null, N[id].titulo || N[id].t));
        var cuerpo = el("div", "alg-det-c"); cuerpo.innerHTML = N[id].info || ""; d.appendChild(cuerpo);
        if (a.url) { var r = el("div", "box green"); r.appendChild(el("h3", null, "Referencia normativa")); r.appendChild(document.createTextNode(a.norma + ". ")); var l = el("a", null, "Ver documento"); l.href = a.url; l.target = "_blank"; l.rel = "noopener"; r.appendChild(l); d.appendChild(r); }
        return d;
      }
      function tarjeta(id, etiqueta) {
        var n = N[id], c = el("div", "alg-n t-" + n.tipo + (sel === id ? " sel" : "")); c.tabIndex = 0; c.setAttribute("role", "button");
        if (etiqueta) { var e = el("span", "alg-et " + etiqueta[1], etiqueta[0]); c.appendChild(e); }
        var tx = el("div", "alg-n-tx"); tx.appendChild(el("strong", null, n.t)); if (n.s) tx.appendChild(el("span", null, n.s)); c.appendChild(tx);
        if (n.hijos.length) c.appendChild(el("span", "alg-tg", abiertos[id] ? "−" : "+"));
        var ir = function () {
          if (n.hijos.length) { if (abiertos[id]) cerrar(id); else abiertos[id] = 1; }
          sel = id; pintar();
          var x = flujo.querySelector(".alg-n.sel"); if (x && window.innerWidth < 1000) x.scrollIntoView({ behavior: "smooth", block: "nearest" });
        };
        c.addEventListener("click", ir); c.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); ir(); } });
        return c;
      }
      function cerrar(id) { delete abiertos[id]; N[id].hijos.forEach(cerrar); }
      function rama(id, caja, etiqueta) {
        caja.appendChild(tarjeta(id, etiqueta));
        if (sel === id) { var dm = detalle(id); dm.classList.add("alg-det-movil"); caja.appendChild(dm); }
        if (!abiertos[id]) return;
        var n = N[id], et = n.etiquetas || {};
        var hojas = n.hijos.filter(function (h) { return !N[h].hijos.length; }), ramas = n.hijos.filter(function (h) { return N[h].hijos.length; });
        if (hojas.length) {
          var g = el("div", "alg-hojas");
          hojas.forEach(function (h) { var w = el("div", "alg-hoja"); rama(h, w, et[h]); g.appendChild(w); });
          caja.appendChild(g);
        }
        ramas.forEach(function (h) { pendientes.push({ id: h, et: et[h], k: numero(h, id), o: orden++ }); });
      }
      // Los pasos principales siguen su número ("6. …" antes que "7. …"), aunque cuelguen de ramas distintas
      var pendientes = [], orden = 0;
      function numero(id, desde) { var m = /^(\d+(?:\.\d+)?)\./.exec(N[id].t); return m ? parseFloat(m[1]) : (!desde || desde === id ? 0 : numero(desde, padre[desde]) + .5); }
      function pintar() {
        flujo.innerHTML = ""; pendientes = []; orden = 0; rama(a.raiz, flujo);
        while (pendientes.length) {
          pendientes.sort(function (x, y) { return x.k - y.k || x.o - y.o; });
          var p = pendientes.shift(); flujo.appendChild(el("div", "alg-flecha", "↓")); rama(p.id, flujo, p.et);
        }
        panel.innerHTML = "";
        if (sel) panel.appendChild(detalle(sel));
        else { var v = el("div", "alg-det"); v.appendChild(el("h4", null, "Seleccione un paso")); var b = el("div", "box blue", "Pulse cualquier paso del algoritmo para ver su definición, plazos, muestras y acciones."); v.appendChild(b); panel.appendChild(v); }
      }
      abiertos[a.raiz] = 1; pintar();
    }
  }
  window.Algoritmos = { montar: montar };
})();
