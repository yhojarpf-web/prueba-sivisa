/* Carrusel de campañas – uso: Campanas.montar(elemento, { portal: "sivisa", base: "" }) */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var ICONOS = {
    corazon: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z",
    escudo: "M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z M9 12l2 2 4-4",
    gota: "M12 3s-6 7-6 11a6 6 0 0 0 12 0c0-4-6-11-6-11z",
    mosquito: "M12 8v12 M12 8a2 2 0 1 0 0-4a2 2 0 0 0 0 4 M12 11l-6-5 M12 11l6-5 M12 14l-6 2 M12 14l6 2 M12 17l-4 4 M12 17l4 4 M11 4L9 2",
    pulmon: "M12 4v8 M12 12c-2 0-3-2-5-2-2 0-3 3-3 6 0 3 1 4 3 4s4-1 5-4z M12 12c2 0 3-2 5-2 2 0 3 3 3 6 0 3-1 4-3 4s-4-1-5-4z",
    perro: "M6 8l-2-4 4 1 M18 8l2-4-4 1 M6 8c0 6 2 10 6 10s6-4 6-10c0-2-3-3-6-3S6 6 6 8z M10 11v.5 M14 11v.5 M11 14h2l-1 1.5z",
    vacuna: "M18 2l4 4 M20 4l-9 9 M16 6l2 2 M11 13l-3 3-4-4 3-3 M8 16l-3 3 M2 22l3-3",
    sol: "M12 7a5 5 0 1 0 0 10a5 5 0 0 0 0-10z M12 1v2 M12 21v2 M4.2 4.2l1.4 1.4 M18.4 18.4l1.4 1.4 M1 12h2 M21 12h2 M4.2 19.8l1.4-1.4 M18.4 5.6l1.4-1.4",
    frio: "M12 2v20 M4.9 6.5l14.2 11 M19.1 6.5l-14.2 11 M9 4l3 3 3-3 M9 20l3-3 3 3",
    megafono: "M3 10v4h4l7 4V6l-7 4z M17 9a4 4 0 0 1 0 6 M19.5 6.5a8 8 0 0 1 0 11",
    alerta: "M12 3L2 20h20z M12 10v4 M12 17h.01",
    grafico: "M3 20h18 M5 16l4-5 4 3 6-8 M15 6h4v4",
    reloj: "M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18z M12 7v5l3 2"
  };
  function svg(nombre, cls) {
    var s = document.createElementNS(NS, "svg"); s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("aria-hidden", "true"); if (cls) s.setAttribute("class", cls);
    var p = document.createElementNS(NS, "path"); p.setAttribute("d", ICONOS[nombre] || ICONOS.corazon);
    ["fill:none", "stroke:currentColor", "stroke-width:2", "stroke-linecap:round", "stroke-linejoin:round"].forEach(function (kv) { var a = kv.split(":"); p.setAttribute(a[0], a[1]); });
    s.appendChild(p); return s;
  }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  var reducido = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function montar(cont, op) {
    op = op || {};
    var hoy = new Date().toISOString().slice(0, 10);
    var lista = (window.CAMPANAS || []).filter(function (c) {
      if (c.activa === false) return false;
      if (op.portal && c.portales && c.portales.length && c.portales.indexOf(op.portal) < 0) return false;
      if (c.desde && hoy < c.desde) return false;
      if (c.hasta && hoy > c.hasta) return false;
      return true;
    });
    // Diapositivas automáticas de "Situación actual" (data/situacion.js), antes de las campañas fijas
    var S = window.SITUACION || {}, auto = (S.diapositivas || []).filter(function (c) {
      if (op.portal && c.portales && c.portales.indexOf(op.portal) < 0) return false;
      if (c.hasta && hoy > c.hasta) return false;
      return true;
    });
    if (op.situacion !== false) lista = auto.concat(lista);
    // Alertas nacionales, regionales y de la Red (data/alertas.js): siempre primero
    var AMB = { Nacional: ["Alerta nacional", "#7f1d1d"], Regional: ["Alerta regional · Amazonas", "#b42318"], Red: ["Alerta en la Red", "#c2410c"] };
    var alertas = (window.ALERTAS || []).filter(function (c) {
      if (c.activa === false) return false;
      if (op.portal && c.portales && c.portales.length && c.portales.indexOf(op.portal) < 0) return false;
      if (c.desde && hoy < c.desde) return false;
      if (c.hasta && hoy > c.hasta) return false;
      return true;
    }).sort(function (a, b) { return ["Nacional", "Regional", "Red"].indexOf(a.ambito) - ["Nacional", "Regional", "Red"].indexOf(b.ambito); })
      .map(function (c) { var m = AMB[c.ambito] || AMB.Red; return { alerta: true, auto: true, etiqueta: m[0], titulo: c.titulo, texto: c.texto, icono: "alerta", color: c.color || m[1], enlace: c.enlace }; });
    lista = alertas.concat(lista);
    if (!lista.length) { cont.hidden = true; return; }
    function fecha(f) { var p = String(f || "").split("-"); return p.length === 3 ? p[2] + "/" + p[1] + "/" + p[0] : ""; }

    var raiz = el("section", "camp"); raiz.setAttribute("aria-roledescription", "carrusel"); raiz.setAttribute("aria-label", "Campañas de prevención");
    var pista = el("div", "camp-pista"); raiz.appendChild(pista);
    var slides = lista.map(function (c, i) {
      var s = el("article", "camp-slide"); s.style.setProperty("--cc", c.color || "#0b4e96");
      s.setAttribute("role", "group"); s.setAttribute("aria-roledescription", "diapositiva"); s.setAttribute("aria-label", (i + 1) + " de " + lista.length);
      if (c.imagen) { s.classList.add("con-foto"); s.style.backgroundImage = 'url("' + (op.base || "") + "assets/campanas/" + c.imagen + '")'; }
      else s.appendChild(svg(c.icono, "camp-fondo-ico"));
      if (c.auto) s.classList.add("camp-auto");
      if (c.alerta) s.classList.add("camp-alerta");
      var cab = el("div", "camp-cab"); var k = el("span", "camp-kicker"); k.appendChild(svg(c.alerta ? "alerta" : c.auto ? "reloj" : "corazon")); k.appendChild(document.createTextNode(c.alerta ? "Alerta epidemiológica" : c.auto ? "Situación actual" + (S.generado ? " · actualizado " + fecha(S.generado) : "") : "Campañas de prevención")); cab.appendChild(k);
      s.appendChild(cab);
      var cuerpo = el("div", "camp-cuerpo");
      if (c.etiqueta) { var et = el("span", "camp-etiqueta"); et.appendChild(svg(c.auto ? c.icono : "escudo")); et.appendChild(document.createTextNode(c.etiqueta)); cuerpo.appendChild(et); }
      cuerpo.appendChild(el("h3", "camp-t", c.titulo));
      cuerpo.appendChild(el("p", "camp-x", c.texto));
      if (c.enlace) {
        var a = el("a", "camp-mas", c.auto ? (/\.pdf$/i.test(c.enlace) ? "Ver documento →" : "Ver detalle →") : "Ver más →");
        a.href = /^https?:/.test(c.enlace) ? c.enlace : (op.base || "") + c.enlace.split("/").map(function (x, i, arr) { return i === arr.length - 1 && /\.pdf$/i.test(x) ? encodeURIComponent(x) : x; }).join("/");
        if (!c.auto || /\.pdf$/i.test(c.enlace)) { a.target = "_blank"; a.rel = "noopener"; }
        cuerpo.appendChild(a);
      }
      s.appendChild(cuerpo);
      pista.appendChild(s); return s;
    });

    var pie = el("div", "camp-pie"), puntos = el("div", "camp-puntos");
    var dots = lista.map(function (c, i) { var b = el("button", "camp-punto"); b.type = "button"; b.setAttribute("aria-label", "Ir a: " + c.titulo); b.addEventListener("click", function () { ir(i, true); }); puntos.appendChild(b); return b; });
    var nav = el("div", "camp-nav");
    var prev = el("button", "camp-btn", "‹"); prev.type = "button"; prev.setAttribute("aria-label", "Anterior");
    var next = el("button", "camp-btn", "›"); next.type = "button"; next.setAttribute("aria-label", "Siguiente");
    nav.appendChild(prev); nav.appendChild(next); pie.appendChild(puntos); pie.appendChild(nav); raiz.appendChild(pie);
    cont.appendChild(raiz);

    var i = 0, timer = null, pausa = false;
    function ir(n, manual) {
      i = (n + slides.length) % slides.length;
      pista.style.transform = "translateX(" + (-100 * i) + "%)";
      slides.forEach(function (s, k) { s.setAttribute("aria-hidden", k !== i); s.querySelectorAll("a").forEach(function (a) { a.tabIndex = k === i ? 0 : -1; }); });
      dots.forEach(function (d, k) { d.classList.toggle("on", k === i); d.setAttribute("aria-current", k === i); });
      if (manual) reiniciar();
    }
    function reiniciar() { clearInterval(timer); if (!reducido && slides.length > 1) timer = setInterval(function () { if (!pausa && !document.hidden) ir(i + 1); }, 7000); }
    prev.addEventListener("click", function () { ir(i - 1, true); });
    next.addEventListener("click", function () { ir(i + 1, true); });
    raiz.addEventListener("mouseenter", function () { pausa = true; });
    raiz.addEventListener("mouseleave", function () { pausa = false; });
    raiz.addEventListener("focusin", function () { pausa = true; });
    raiz.addEventListener("focusout", function () { pausa = false; });
    raiz.tabIndex = 0;
    raiz.addEventListener("keydown", function (e) { if (e.key === "ArrowRight") ir(i + 1, true); if (e.key === "ArrowLeft") ir(i - 1, true); });
    var x0 = null;
    raiz.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    raiz.addEventListener("touchend", function (e) { if (x0 == null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) ir(i + (dx < 0 ? 1 : -1), true); x0 = null; });
    if (slides.length < 2) { pie.hidden = true; }
    ir(0); reiniciar();
  }
  window.Campanas = { montar: montar };
})();
