/* Franja informativa (sobre + sede) – Info.montar(contenedor, { titulo, texto, puntos }) usa SITIO.sede */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var IC = {
    info: "M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18z M12 11v6 M12 7.5v.5",
    sede: "M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16 M16 9h2a2 2 0 0 1 2 2v10 M2 21h20 M8 7h4 M8 11h4 M8 15h4",
    pin: "M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z M12 7.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 0 0 0-5z",
    correo: "M3 5h18v14H3z M3 6l9 7 9-7",
    tel: "M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2",
    reloj: "M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18z M12 7v5l3 2",
    persona: "M12 4a4 4 0 1 0 0 8a4 4 0 0 0 0-8z M4 21a8 8 0 0 1 16 0"
  };
  function svg(n) { var s = document.createElementNS(NS, "svg"); s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("aria-hidden", "true");
    var p = document.createElementNS(NS, "path"); p.setAttribute("d", IC[n]); p.setAttribute("fill", "none"); p.setAttribute("stroke", "currentColor"); p.setAttribute("stroke-width", "2"); p.setAttribute("stroke-linecap", "round"); p.setAttribute("stroke-linejoin", "round"); s.appendChild(p); return s; }
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function cabeza(ico, fondo, color, titulo) { var h = el("div", "info-h"), i = el("span", "info-ico"); i.style.background = fondo; i.style.color = color; i.appendChild(svg(ico)); h.appendChild(i); h.appendChild(el("h3", null, titulo)); return h; }

  function montar(cont, sobre, resp) {
    var S = window.SITIO || {}, sede = S.sede || {}; sobre = sobre || S.sobre || {};
    cont.innerHTML = "";
    if (sobre.texto) {
      var a = el("section", "info-c"); a.appendChild(cabeza("info", "#e8f0fa", "#0b4e96", sobre.titulo || "Sobre el portal"));
      a.appendChild(el("p", null, sobre.texto));
      if (sobre.puntos && sobre.puntos.length) { var ul = el("ul", "info-puntos"); sobre.puntos.forEach(function (t) { ul.appendChild(el("li", null, t)); }); a.appendChild(ul); }
      cont.appendChild(a);
    }
    if (resp && resp.nombre) {
      var r = el("section", "info-c info-resp"); r.appendChild(cabeza("persona", "#f3ecfb", "#7c4ddb", resp.titulo || "Responsable"));
      var fichita = el("div", "info-persona");
      var ini = (resp.nombre.replace(/^((Lic|Dr|Dra|Mg|M\.?C|Ing|Enf)\.?\s*)+/i, "").split(/\s+/).filter(function (w) { return w.length > 2; }));
      fichita.appendChild(el("span", "info-avatar", ini.length ? (ini[0][0] + (ini.length > 2 ? ini[ini.length - 2][0] : ini.length > 1 ? ini[1][0] : "")).toUpperCase() : ""));
      var tx = el("div"); tx.appendChild(el("strong", null, resp.nombre)); if (resp.cargo) tx.appendChild(el("span", null, resp.cargo)); fichita.appendChild(tx); r.appendChild(fichita);
      if (resp.correo) { var lr = el("ul", "info-datos"), li = el("li"), a = el("a", null, resp.correo); a.href = "mailto:" + resp.correo; li.appendChild(svg("correo")); li.appendChild(a); lr.appendChild(li); r.appendChild(lr); }
      cont.appendChild(r);
    }
    if (sede.direccion) {
      var b = el("section", "info-c"); b.appendChild(cabeza("sede", "#e6f5ef", "#0f8a5f", sede.titulo || "Sede institucional"));
      var l = el("ul", "info-datos");
      function fila(ico, nodo) { var li = el("li"); li.appendChild(svg(ico)); li.appendChild(nodo); l.appendChild(li); }
      var dir = el("span"); dir.appendChild(document.createTextNode(sede.direccion + " "));
      var mapa = el("a", null, "Ver en mapa"); mapa.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(sede.direccion + ", Amazonas, Perú"); mapa.target = "_blank"; mapa.rel = "noopener";
      dir.appendChild(document.createTextNode("· ")); dir.appendChild(mapa); fila("pin", dir);
      if (sede.correo) { var c = el("a", null, sede.correo); c.href = "mailto:" + sede.correo; fila("correo", c); }
      if (sede.telefono) { var t = el("a", null, sede.telefono); t.href = "tel:" + sede.telefono.replace(/[^\d+]/g, ""); fila("tel", t); }
      if (sede.horario) fila("reloj", el("span", null, sede.horario));
      b.appendChild(l); cont.appendChild(b);
    }
    if (!cont.children.length) cont.hidden = true;
  }
  window.Info = { montar: montar };
})();
