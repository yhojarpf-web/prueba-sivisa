/* Vista por semanas epidemiológicas (Boletines, Salas) – Semanas.montar(contenedor, docs, seccion, secciones)
   Los documentos vienen de data/semanales.js, generado desde documentos/<carpeta>/<año>/SEnn/ */
(function () {
  "use strict";
  var DIA = 864e5;
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function dm(t) { var d = new Date(t); return ("0" + d.getUTCDate()).slice(-2) + "/" + ("0" + (d.getUTCMonth() + 1)).slice(-2); }
  function fechaLarga(iso) { var p = String(iso || "").split("-"); return p.length === 3 ? p[2] + "/" + p[1] + "/" + p[0] : iso; }
  function hoy() { var d = new Date(); return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()); }
  function url(d) { return "documentos/" + d.archivo.split("/").map(encodeURIComponent).join("/"); }

  function montar(cont, docs, sec, secs) {
    var C = window.Calendario; cont.innerHTML = "";
    var actual = C ? C.seDe(hoy()) : { anio: new Date().getFullYear(), se: 0 };
    var anios = Array.from(new Set(docs.map(function (d) { return d.anio; }).concat([actual.anio]))).sort(function (a, b) { return b - a; });
    var estado = { anio: anios[0], se: null };
    var orden = docs.slice().sort(function (a, b) { return b.anio - a.anio || b.se - a.se || (a.fecha < b.fecha ? 1 : -1); });

    // Último publicado
    if (orden.length) {
      var u = orden[0], dest = el("section", "sem-dest");
      var tx = el("div", "sem-dest-tx");
      tx.appendChild(el("span", "sem-dest-k", "Último publicado · SE " + u.se + "-" + u.anio));
      tx.appendChild(el("h3", null, u.titulo));
      tx.appendChild(el("p", null, u.descripcion + (orden.filter(function (d) { return d.anio === u.anio && d.se === u.se; }).length > 1 ? " · Hay más documentos en esta semana." : "")));
      dest.appendChild(tx);
      var ac = el("div", "sem-dest-ac");
      var v = el("a", "sem-btn", "Ver PDF"); v.href = url(u); v.target = "_blank"; v.rel = "noopener"; ac.appendChild(v);
      var b = el("a", "sem-btn sec", "Descargar"); b.href = url(u); b.setAttribute("download", ""); ac.appendChild(b);
      dest.appendChild(ac); cont.appendChild(dest);
    }

    var caja = el("section", "sem-caja"); cont.appendChild(caja);
    var cab = el("div", "sem-cab");
    cab.appendChild(el("h3", null, "Semanas epidemiológicas"));
    var selA = el("div", "sem-anios"); cab.appendChild(selA); caja.appendChild(cab);
    var ley = el("div", "sem-ley");
    [["con", "Publicado"], ["falta", "Sin publicar"], ["actual", "Semana en curso"], ["futura", "Próximas"]].forEach(function (x) { var s = el("span"); s.appendChild(el("i", "sem-k " + x[0])); s.appendChild(document.createTextNode(x[1])); ley.appendChild(s); });
    caja.appendChild(ley);
    var grid = el("div", "sem-grid"); caja.appendChild(grid);
    var det = el("div", "sem-det"); cont.appendChild(det);

    function pintar() {
      selA.innerHTML = "";
      anios.forEach(function (a) { var x = el("button", "sem-anio", String(a)); x.type = "button"; x.setAttribute("aria-pressed", a === estado.anio); x.addEventListener("click", function () { estado.anio = a; estado.se = null; pintar(); }); selA.appendChild(x); });
      var del = docs.filter(function (d) { return d.anio === estado.anio; });
      var n = C ? C.semanasDe(estado.anio) : 52, ini = C ? C.inicioAnio(estado.anio) : 0;
      if (estado.se == null) estado.se = del.length ? Math.max.apply(null, del.map(function (d) { return d.se; })) : (estado.anio === actual.anio ? actual.se : 1);
      grid.innerHTML = "";
      for (var s = 1; s <= n; s++) (function (s) {
        var t0 = ini + (s - 1) * 7 * DIA, lista = del.filter(function (d) { return d.se === s; });
        var cls = lista.length ? "con" : (estado.anio === actual.anio && s === actual.se) ? "actual" : (estado.anio > actual.anio || (estado.anio === actual.anio && s > actual.se)) ? "futura" : "falta";
        if (lista.length && estado.anio === actual.anio && s === actual.se) cls += " actual";
        var c = el("button", "sem-c " + cls); c.type = "button";
        c.appendChild(el("strong", null, "SE " + s));
        c.appendChild(el("span", null, C ? dm(t0) : ""));
        if (lista.length > 1) c.appendChild(el("em", null, lista.length));
        c.title = "SE " + s + "-" + estado.anio + (C ? ": del " + dm(t0) + " al " + dm(t0 + 6 * DIA) : "") + " · " + (lista.length ? lista.length + (lista.length === 1 ? " documento" : " documentos") : "sin documento");
        c.setAttribute("aria-pressed", s === estado.se);
        c.addEventListener("click", function () { estado.se = s; pintar(); det.scrollIntoView({ behavior: "smooth", block: "nearest" }); });
        grid.appendChild(c);
      })(s);
      det.innerHTML = "";
      var t0 = ini + (estado.se - 1) * 7 * DIA, lst = del.filter(function (d) { return d.se === estado.se; });
      det.appendChild(el("h3", "pl-sub", "SE " + estado.se + "-" + estado.anio + (C ? " · del " + dm(t0) + " al " + dm(t0 + 6 * DIA) + "/" + new Date(t0 + 6 * DIA).getUTCFullYear() : "")));
      var cc = el("div"); det.appendChild(cc);
      if (lst.length) Publicaciones.tarjetas(cc, lst, { base: "", secciones: secs });
      else cc.appendChild(el("div", "empty", (estado.anio === actual.anio && estado.se >= actual.se) ? "Esta semana aún no termina o todavía no se ha publicado." : "No se publicó documento para esta semana."));
      var resumen = el("p", "sem-res", del.length ? (new Set(del.map(function (d) { return d.se; }))).size + " semanas con publicación en " + estado.anio + "." : "Aún no hay publicaciones en " + estado.anio + ".");
      det.appendChild(resumen);
    }
    pintar();
  }
  window.Semanas = { montar: montar };
})();
