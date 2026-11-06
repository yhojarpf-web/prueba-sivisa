/* Calendario epidemiológico – Calendario.montar(contenedor)
   Regla: semanas de domingo a sábado; la SE 1 es la primera semana con al menos 4 días de enero. */
(function () {
  "use strict";
  var DIA = 864e5;
  var MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "setiembre", "octubre", "noviembre", "diciembre"];
  var MES3 = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "set", "oct", "nov", "dic"];
  function utc(y, m, d) { return Date.UTC(y, m, d); }
  function inicioAnio(y) {                         // domingo en que empieza la SE 1 del año y
    var e1 = utc(y, 0, 1), dow = new Date(e1).getUTCDay();
    var dom = e1 - dow * DIA;
    return (7 - dow) >= 4 ? dom : dom + 7 * DIA;
  }
  function semanasDe(y) { return Math.round((inicioAnio(y + 1) - inicioAnio(y)) / (7 * DIA)); }
  function seDe(t) {                               // t en ms UTC (medianoche)
    var y = new Date(t).getUTCFullYear() + 1;
    while (inicioAnio(y) > t) y--;
    return { anio: y, se: Math.floor((t - inicioAnio(y)) / (7 * DIA)) + 1 };
  }
  function f(t, largo) { var d = new Date(t); return d.getUTCDate() + " " + (largo ? "de " + MESES[d.getUTCMonth()] : MES3[d.getUTCMonth()]); }
  function dmy(t) { var d = new Date(t); return String(d.getUTCDate()).padStart(2, "0") + "/" + String(d.getUTCMonth() + 1).padStart(2, "0") + "/" + d.getUTCFullYear(); }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function hoyUTC() { var n = new Date(); return utc(n.getFullYear(), n.getMonth(), n.getDate()); }

  function montar(cont) {
    cont.innerHTML = "";
    var hoy = hoyUTC(), act = seDe(hoy), ini = inicioAnio(act.anio) + (act.se - 1) * 7 * DIA;

    // Semana actual
    var top = el("div", "cal-top");
    var hoyc = el("div", "cal-hoy");
    hoyc.appendChild(el("span", "cal-hoy-k", "Hoy, " + f(hoy, true) + " de " + new Date(hoy).getUTCFullYear()));
    var g = el("div", "cal-hoy-se"); g.appendChild(el("span", null, "Semana epidemiológica")); g.appendChild(el("strong", null, act.se)); hoyc.appendChild(g);
    hoyc.appendChild(el("span", "cal-hoy-r", "Del domingo " + f(ini, true) + " al sábado " + f(ini + 6 * DIA, true) + " · año epidemiológico " + act.anio));
    top.appendChild(hoyc);

    // Conversor fecha → SE
    var conv = el("div", "cal-conv");
    conv.appendChild(el("h4", null, "¿En qué semana cae una fecha?"));
    var inp = el("input"); inp.type = "date"; inp.value = dmy(hoy).split("/").reverse().join("-"); inp.setAttribute("aria-label", "Fecha");
    var res = el("p", "cal-conv-r");
    function calc() {
      var p = inp.value.split("-"); if (p.length !== 3) { res.textContent = ""; return; }
      var t = utc(+p[0], +p[1] - 1, +p[2]), r = seDe(t), i0 = inicioAnio(r.anio) + (r.se - 1) * 7 * DIA;
      res.innerHTML = ""; res.appendChild(el("strong", null, "SE " + r.se + "-" + r.anio));
      res.appendChild(document.createTextNode(" · del " + dmy(i0) + " al " + dmy(i0 + 6 * DIA)));
    }
    inp.addEventListener("input", calc); conv.appendChild(inp); conv.appendChild(res); calc();
    top.appendChild(conv);
    cont.appendChild(top);

    // Selector de año
    var barra = el("div", "cal-barra");
    var sel = el("select"); sel.setAttribute("aria-label", "Año epidemiológico");
    for (var y = act.anio + 1; y >= act.anio - 3; y--) { var o = el("option", null, y); o.value = y; sel.appendChild(o); }
    sel.value = act.anio;
    var tit = el("h4", "cal-tit");
    var desc = el("button", "btn-sec", "Descargar (CSV)"); desc.type = "button";
    barra.appendChild(tit); var der = el("div", "cal-der"); der.appendChild(sel); der.appendChild(desc); barra.appendChild(der);
    cont.appendChild(barra);
    var grid = el("div", "cal-grid"); cont.appendChild(grid);
    var notas = window.CAL_NOTAS || [];
    if (notas.length) {
      var nb = el("section", "cal-notas"); nb.appendChild(el("h4", null, "Recordatorios de notificación"));
      var ul = el("ul"); notas.forEach(function (t) { ul.appendChild(el("li", null, t)); }); nb.appendChild(ul); cont.appendChild(nb);
    }
    cont.appendChild(el("p", "dash-nota", "Las semanas epidemiológicas van de domingo a sábado. La SE 1 es la primera semana del año que tiene al menos cuatro días de enero; por eso algunos años tienen 53 semanas y la SE 1 puede empezar a fines de diciembre."));

    function pintar() {
      var y = +sel.value, n = semanasDe(y), base = inicioAnio(y);
      tit.textContent = "Año " + y + " · " + n + " semanas epidemiológicas";
      grid.innerHTML = "";
      var porMes = {};
      for (var s = 1; s <= n; s++) {
        var a = base + (s - 1) * 7 * DIA, b = a + 6 * DIA, da = new Date(a);
        var clave = da.getUTCFullYear() < y ? 0 : da.getUTCMonth();   // se agrupa por el mes en que empieza la semana
        (porMes[clave] = porMes[clave] || []).push({ s: s, a: a, b: b });
      }
      Object.keys(porMes).map(Number).sort(function (p, q) { return p - q; }).forEach(function (k) {
        var col = el("section", "cal-mes");
        col.appendChild(el("h5", null, MESES[k].charAt(0).toUpperCase() + MESES[k].slice(1)));
        porMes[k].forEach(function (w) {
          var r = el("div", "cal-se" + (y === act.anio && w.s === act.se ? " hoy" : "") + (y === act.anio && w.s < act.se ? " pasada" : ""));
          r.appendChild(el("strong", null, "SE " + w.s));
          r.appendChild(el("span", null, f(w.a) + " – " + f(w.b)));
          col.appendChild(r);
        });
        grid.appendChild(col);
      });
    }
    sel.addEventListener("change", pintar);
    desc.addEventListener("click", function () {
      var y = +sel.value, n = semanasDe(y), base = inicioAnio(y), filas = ["anio,semana,inicio_domingo,fin_sabado"];
      for (var s = 1; s <= n; s++) { var a = base + (s - 1) * 7 * DIA; filas.push(y + "," + s + "," + dmy(a) + "," + dmy(a + 6 * DIA)); }
      var blob = new Blob(["﻿" + filas.join("\r\n")], { type: "text/csv;charset=utf-8" });
      var l = document.createElement("a"); l.href = URL.createObjectURL(blob); l.download = "calendario_epidemiologico_" + y + ".csv";
      document.body.appendChild(l); l.click(); setTimeout(function () { URL.revokeObjectURL(l.href); l.remove(); }, 500);
    });
    pintar();
  }
  window.Calendario = { montar: montar, seDe: seDe, inicioAnio: inicioAnio, semanasDe: semanasDe };
})();
