/* Tabla de enfermedades sujetas a vigilancia (CIE-10) – Enfermedades.montar(contenedor, secciones) */
(function () {
  "use strict";
  var TIPOS = [
    { id: "inmediata", nombre: "Inmediata (24 h)", cls: "n-inm" },
    { id: "semanal", nombre: "Semanal", cls: "n-sem" },
    { id: "mensual", nombre: "Mensual", cls: "n-men" },
    { id: "consolidada", nombre: "Semanal consolidada", cls: "n-con" }
  ];
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function norm(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }

  function montar(cont, secs) {
    var E = window.ENFERMEDADES; if (!E) return;
    secs = secs || [];
    var nombreGrupo = function (g) { var s = secs.filter(function (x) { return x.id === g; })[0]; return s ? s.titulo : "Otros eventos"; };
    cont.innerHTML = "";
    var box = el("section", "enf");
    var cab = el("div", "enf-cab");
    var tt = el("div"); tt.appendChild(el("h3", null, "Enfermedades y eventos sujetos a vigilancia")); tt.appendChild(el("p", null, "Código CIE-10, tipo de notificación y enlace a su definición de caso. Fuente: " + E.fuente + (E.compendio ? " y Compendio de definiciones de caso, CDC Perú 2026." : ".")));
    cab.appendChild(tt);
    if (E.compendio) { var bc = el("a", "enf-comp", "Compendio de definiciones de caso (PDF)"); bc.href = E.compendio; bc.target = "_blank"; bc.rel = "noopener"; cab.appendChild(bc); }
    box.appendChild(cab);

    var filtros = el("div", "enf-filtros");
    var q = el("input"); q.type = "search"; q.placeholder = "Buscar enfermedad o código CIE-10 (ej. dengue, B55)…"; q.setAttribute("aria-label", "Buscar enfermedad");
    filtros.appendChild(q);
    var chips = el("div", "enf-chips"), activo = "todas";
    [{ id: "todas", nombre: "Todas" }].concat(TIPOS).forEach(function (t) {
      var b = el("button", "enf-chip " + (t.cls || ""), t.nombre); b.type = "button"; b.dataset.id = t.id;
      b.addEventListener("click", function () { activo = t.id; pintar(); }); chips.appendChild(b);
    });
    filtros.appendChild(chips);
    var grupos = el("select"); grupos.setAttribute("aria-label", "Sistema de vigilancia");
    grupos.appendChild(new Option("Todos los sistemas", ""));
    Array.from(new Set(E.lista.map(function (x) { return x.g; }))).sort(function (a, b) { return nombreGrupo(a).localeCompare(nombreGrupo(b)); })
      .forEach(function (g) { grupos.appendChild(new Option(nombreGrupo(g), g)); });
    filtros.appendChild(grupos);
    box.appendChild(filtros);

    var cuenta = el("p", "enf-n"); box.appendChild(cuenta);
    var wrap = el("div", "enf-wrap"); box.appendChild(wrap);
    cont.appendChild(box);

    function pintar() {
      chips.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.id === activo); });
      var t = norm(q.value.trim()), g = grupos.value;
      var x = E.lista.filter(function (d) {
        if (activo !== "todas" && d.n !== activo) return false;
        if (g && d.g !== g) return false;
        if (t && norm([d.c, d.e, d.a, nombreGrupo(d.g)].join(" ")).indexOf(t) < 0) return false;
        return true;
      });
      cuenta.textContent = x.length + (x.length === 1 ? " enfermedad o evento" : " enfermedades y eventos");
      wrap.innerHTML = "";
      if (!x.length) { wrap.appendChild(el("div", "empty", "No hay coincidencias.")); return; }
      var tb = el("table", "enf-tabla"), h = el("tr");
      ["CIE-10", "Enfermedad o evento", "Notificación", "Sistema de vigilancia"].concat(E.compendio ? ["Definición de caso"] : []).forEach(function (c) { h.appendChild(el("th", null, c)); });
      var th = el("thead"); th.appendChild(h); tb.appendChild(th);
      var body = el("tbody");
      x.forEach(function (d) {
        var tr = el("tr");
        tr.appendChild(el("td", "enf-c", d.c || "—"));
        tr.appendChild(el("td", "enf-e", d.e));
        var tp = TIPOS.filter(function (k) { return k.id === d.n; })[0];
        var td = el("td"); td.appendChild(el("span", "enf-badge " + tp.cls, tp.nombre)); tr.appendChild(td);
        var tg = el("td", "enf-g");
        if (d.g !== "otros" && secs.some(function (s) { return s.id === d.g; })) { var a = el("a", null, nombreGrupo(d.g)); a.href = "#" + d.g; tg.appendChild(a); }
        else tg.textContent = nombreGrupo(d.g);
        tr.appendChild(tg);
        if (E.compendio) {
          var tdd = el("td", "enf-def");
          if (d.p) { var ad = el("a", null, "Ver pág. " + d.p); ad.href = E.compendio + "#page=" + d.p; ad.target = "_blank"; ad.rel = "noopener"; ad.title = "Abrir la definición de caso de " + d.e + " en el compendio"; tdd.appendChild(ad); }
          else tdd.appendChild(el("span", "enf-sin", "No incluida"));
          tr.appendChild(tdd);
        }
        body.appendChild(tr);
      });
      tb.appendChild(body); wrap.appendChild(tb);
    }
    q.addEventListener("input", pintar); grupos.addEventListener("change", pintar);
    pintar();
  }
  window.Enfermedades = { montar: montar };
})();
