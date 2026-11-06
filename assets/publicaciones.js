/* Tarjetas de publicaciones – Publicaciones.tarjetas(contenedor, documentos, opciones)
   opciones: { base: "epidemiologia/", secciones: [...], portal: "Epidemiología", vacio: "texto" } */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var PALETA = ["#1d6fd8", "#0f9f6e", "#7c4ddb", "#e5670f", "#0e8a9a", "#c0397a", "#5b6b7a"];
  var IC = {
    carpeta: "M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
    lupa: "M11 4a7 7 0 1 0 0 14a7 7 0 0 0 0-14z M21 21l-5-5",
    semana: "M4 5h16v16H4z M4 10h16 M8 3v4 M16 3v4",
    reloj: "M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18z M12 7v5l3 2",
    bajar: "M12 4v11 M7 10l5 5 5-5 M5 20h14",
    ver: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M12 9a3 3 0 1 0 0 6a3 3 0 0 0 0-6z"
  };
  function svg(n) {
    var s = document.createElementNS(NS, "svg"); s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("aria-hidden", "true");
    var p = document.createElementNS(NS, "path"); p.setAttribute("d", IC[n]); p.setAttribute("fill", "none"); p.setAttribute("stroke", "currentColor");
    p.setAttribute("stroke-width", "2"); p.setAttribute("stroke-linecap", "round"); p.setAttribute("stroke-linejoin", "round"); s.appendChild(p); return s;
  }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function norm(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim(); }
  function fecha(iso) { var p = String(iso || "").split("-"); return p.length === 3 ? p[2] + "/" + p[1] + "/" + p[0] : ""; }
  function pdf() {
    var s = document.createElementNS(NS, "svg"); s.setAttribute("viewBox", "0 0 64 72"); s.setAttribute("class", "pub-pdf"); s.setAttribute("aria-hidden", "true");
    s.innerHTML = '<rect x="14" y="10" width="44" height="56" rx="6" fill="#fff" opacity=".25"/>' +
      '<path d="M6 6a6 6 0 0 1 6-6h24l16 16v44a6 6 0 0 1-6 6H12a6 6 0 0 1-6-6z" fill="#fff"/>' +
      '<path d="M36 0v10a6 6 0 0 0 6 6h10z" fill="#dfe6ee"/>' +
      '<rect x="0" y="30" width="40" height="18" rx="4" fill="#e5383b"/>' +
      '<text x="20" y="43.5" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="12" fill="#fff">PDF</text>';
    return s;
  }
  function seccionDe(d, secs) { var x = norm(d.seccion); for (var i = 0; i < secs.length; i++) if (norm(secs[i].id) === x || norm(secs[i].titulo) === x) return { s: secs[i], i: i }; return null; }
  function colorDe(d, secs) {
    var r = seccionDe(d, secs); if (!r) return PALETA[6];
    var raiz = r.s; while (raiz.padre) { var p = secs.filter(function (x) { return x.id === raiz.padre; })[0]; if (!p) break; raiz = p; }
    if (raiz.color) return raiz.color;
    var tops = secs.filter(function (x) { return !x.padre; }), i = tops.indexOf(raiz);
    return PALETA[(i < 0 ? 0 : i) % (PALETA.length - 1)];
  }

  function tarjetas(cont, docs, op) {
    op = op || {}; var secs = (op.secciones || []).filter(function (s) { return s.tipo !== "inicio" && s.tipo !== "enlace"; });
    cont.innerHTML = "";
    if (!docs.length) { cont.appendChild(el("div", "empty", op.vacio || "Aún no hay publicaciones.")); return; }
    var grid = el("div", "pubs");
    var hoy = new Date();
    docs.forEach(function (d) {
      var col = colorDe(d, secs), sec = seccionDe(d, secs);
      var c = el("article", "pubc"); c.style.setProperty("--pc", col);
      var cab = el("div", "pubc-cab");
      var dias = (hoy - new Date(d.fecha + "T00:00:00")) / 864e5;
      if (dias >= 0 && dias <= 30) cab.appendChild(el("span", "pubc-nuevo", "Reciente"));
      if (op.portal) cab.appendChild(el("span", "pubc-portal", op.portal));
      cab.appendChild(pdf()); c.appendChild(cab);
      var cu = el("div", "pubc-cu");
      cu.appendChild(el("h4", "pubc-t", d.titulo));
      var meta = el("ul", "pubc-meta");
      [[sec ? sec.s.titulo : d.seccion, "carpeta"], [d.vigilancia && d.vigilancia !== "General" ? d.vigilancia : "", "lupa"], [d.se ? "Semana epidemiológica " + d.se : "", "semana"]]
        .forEach(function (m) { if (!m[0]) return; var li = el("li"); li.appendChild(svg(m[1])); li.appendChild(el("span", null, m[0])); meta.appendChild(li); });
      cu.appendChild(meta);
      if (d.descripcion) cu.appendChild(el("p", "pubc-d", d.descripcion));
      var f = el("p", "pubc-f"); f.appendChild(svg("reloj")); f.appendChild(document.createTextNode("Publicado el " + fecha(d.fecha))); cu.appendChild(f);
      var acc = el("div", "pubc-acc");
      if (d.archivo && /\.pdf$/i.test(d.archivo) && !/(^|\/)\.\.(\/|$)|^\/|:/.test(d.archivo)) {
        var url = (op.base || "") + "documentos/" + d.archivo.split("/").map(encodeURIComponent).join("/");
        var ver = el("a", "pubc-ver"); ver.href = url; ver.target = "_blank"; ver.rel = "noopener"; ver.appendChild(svg("ver")); ver.appendChild(document.createTextNode("Ver PDF")); acc.appendChild(ver);
        var baj = el("a", "pubc-baj"); baj.href = url; baj.setAttribute("download", ""); baj.title = "Descargar"; baj.setAttribute("aria-label", "Descargar " + d.titulo); baj.appendChild(svg("bajar")); acc.appendChild(baj);
      } else acc.appendChild(el("span", "unavailable", "Sin archivo"));
      cu.appendChild(acc); c.appendChild(cu); grid.appendChild(c);
    });
    cont.appendChild(grid);
  }
  window.Publicaciones = { tarjetas: tarjetas, colorDe: colorDe };
})();
