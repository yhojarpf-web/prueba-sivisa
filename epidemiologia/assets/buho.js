/* Búho guía del Portal Epidemiológico: saluda al entrar y cambia de gesto según la pestaña.
   Dibujo propio en SVG (por partes, para poder animar alas, ojos y accesorios). Se puede ocultar; se recuerda la elección. */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var POSES = {
    inicio: ["saludo", "¡Hola! Bienvenido al Portal Epidemiológico de la Red de Salud Chachapoyas."],
    nosotros: ["ok", "Somos la Oficina de Epidemiología. ¡Conoce a nuestro equipo!"],
    unidades: ["lupa", "Vigilo cada evento semana a semana. Elige un sistema de vigilancia."],
    "unidades-notificacion": ["mapa", "Estas son nuestras unidades notificantes e informantes."],
    "indicadores-notificacion": ["grafico", "Oportunidad, cobertura y calidad: así medimos la notificación."],
    "sala-situacion": ["grafico", "Revisemos juntos la situación de salud de la Red."],
    boletines: ["leer", "Aquí están los boletines epidemiológicos de cada semana."],
    brotes: ["alerta", "¡Atención! Revisa los brotes, epizootias y EVISAP activos."],
    definiciones: ["libro", "Antes de notificar, consulta la definición de caso."],
    algoritmos: ["pensar", "¿Dudas? Sigue el algoritmo paso a paso."],
    reportes: ["leer", "Reportes epidemiológicos para la toma de decisiones."],
    alertas: ["alerta", "Mantente al día con las alertas epidemiológicas."],
    comunicados: ["leer", "Comunicados de la Oficina de Epidemiología."],
    "mapa-epidemiologico": ["mapa", "Busca tu distrito, microred o establecimiento en el mapa."],
    fichas: ["leer", "Descarga la ficha que corresponde a cada evento."],
    normas: ["libro", "Directivas y normas vigentes de vigilancia."],
    calendario: ["calendario", "No olvides las fechas del calendario epidemiológico."]
  };
  var CLAVE = "buho-oculto";
  function sv(t, a, p) { var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }

  function dibujar() {
    var s = sv("svg", { viewBox: "0 10 250 240", class: "bh-svg", "aria-hidden": "true" });
    var G = sv("g", { class: "bh-cuerpo" }, s);
    // patas
    sv("ellipse", { cx: 84, cy: 226, rx: 12, ry: 6, fill: "#f2a516" }, G); sv("ellipse", { cx: 116, cy: 226, rx: 12, ry: 6, fill: "#f2a516" }, G);
    // cuerpo, pecho y chaleco
    sv("ellipse", { cx: 100, cy: 168, rx: 60, ry: 60, fill: "#8a5a2e" }, G);
    sv("ellipse", { cx: 100, cy: 176, rx: 36, ry: 44, fill: "#f4e4c6" }, G);
    // chaleco azul con cierre, bolsillos y "RIS Chachapoyas"
    sv("path", { d: "M48 140 Q66 126 92 132 L94 224 Q62 222 46 204 Q40 172 48 140Z", fill: "#14336b" }, G);
    sv("path", { d: "M152 140 Q134 126 108 132 L106 224 Q138 222 154 204 Q160 172 152 140Z", fill: "#14336b" }, G);
    sv("path", { d: "M100 140 L100 224", stroke: "#9fb3cc", "stroke-width": 2.2, "stroke-dasharray": "3 2" }, G);
    sv("rect", { x: 58, y: 182, width: 26, height: 20, rx: 3, fill: "#0f2a59", stroke: "#2b5aa8", "stroke-width": 1.4 }, G);
    sv("rect", { x: 116, y: 182, width: 26, height: 20, rx: 3, fill: "#0f2a59", stroke: "#2b5aa8", "stroke-width": 1.4 }, G);
    sv("path", { d: "M58 188h26 M116 188h26", stroke: "#2b5aa8", "stroke-width": 1.4 }, G);
    var ris = sv("text", { x: 127, y: 160, "text-anchor": "middle", class: "bh-ris" }, G); ris.textContent = "RIS";
    var chs = sv("text", { x: 127, y: 168, "text-anchor": "middle", class: "bh-ris2" }, G); chs.textContent = "Chachapoyas";
    // ala izquierda (fija)
    var aL = sv("g", { class: "bh-ala bh-ala-i" }, G);
    sv("path", { d: "M50 140 Q30 160 34 196 Q40 210 54 204 Q58 170 50 140Z", fill: "#734823" }, aL);
    // cabeza
    var C = sv("g", { class: "bh-cabeza" }, G);
    sv("ellipse", { cx: 100, cy: 92, rx: 64, ry: 56, fill: "#8a5a2e" }, C);
    // penachos suaves (plumas redondeadas, no puntiagudas)
    sv("path", { d: "M50 66 Q34 58 32 42 Q40 48 46 46 Q38 36 42 26 Q50 38 56 38 Q54 30 60 24 Q64 38 72 46Z", fill: "#a8743f", stroke: "#7a4d24", "stroke-width": 2, "stroke-linejoin": "round" }, C);
    sv("path", { d: "M150 66 Q166 58 168 42 Q160 48 154 46 Q162 36 158 26 Q150 38 144 38 Q146 30 140 24 Q136 38 128 46Z", fill: "#a8743f", stroke: "#7a4d24", "stroke-width": 2, "stroke-linejoin": "round" }, C);
    sv("path", { d: "M70 46 Q100 36 130 46 Q118 56 100 54 Q82 56 70 46Z", fill: "#a8743f" }, C);
    sv("path", { d: "M100 74 Q86 62 70 66 Q46 72 48 100 Q52 126 78 126 Q92 126 100 116 Q108 126 122 126 Q148 126 152 100 Q154 72 130 66 Q114 62 100 74Z", fill: "#f7ead2" }, C);
    var cejas = sv("g", { class: "bh-cejas" }, C);
    sv("path", { d: "M60 74 Q74 66 90 70 M140 74 Q126 66 110 70", fill: "none", stroke: "#5a3517", "stroke-width": 4.5, "stroke-linecap": "round" }, cejas);
    [77, 123].forEach(function (x) {
      sv("circle", { cx: x, cy: 96, r: 17, fill: "#fff" }, C);
      var pu = sv("g", { class: "bh-pupila" }, C);
      sv("circle", { cx: x, cy: 97, r: 12, fill: "#f0a23a" }, pu); sv("circle", { cx: x, cy: 97, r: 7.5, fill: "#1d1206" }, pu); sv("circle", { cx: x + 3.5, cy: 92.5, r: 3.2, fill: "#fff" }, pu);
      sv("circle", { cx: x, cy: 96, r: 17.5, fill: "#8a5a2e", class: "bh-parpado", style: "transform-origin:" + x + "px 78px" }, C);
      sv("circle", { cx: x, cy: 96, r: 21, fill: "none", stroke: "#15171a", "stroke-width": 4.5 }, C);
    });
    sv("path", { d: "M96 95 Q100 90 104 95", fill: "none", stroke: "#15171a", "stroke-width": 4 }, C);
    sv("path", { d: "M100 108 L91 117 Q100 134 109 117Z", fill: "#f5b301", stroke: "#c98a00", "stroke-width": 1.5 }, C);
    // ala derecha (la que hace los gestos) + accesorios
    var aR = sv("g", { class: "bh-ala bh-ala-d" }, G);
    sv("path", { d: "M150 140 Q170 160 166 196 Q160 210 146 204 Q142 170 150 140Z", fill: "#734823" }, aR);
    var P = sv("g", { class: "bh-props", transform: "translate(-72 -104) scale(1.35)" }, aR);
    // lupa
    var lu = sv("g", { class: "bh-p bh-p-lupa" }, P);
    sv("path", { d: "M160 196 L176 216", stroke: "#4a2c12", "stroke-width": 6, "stroke-linecap": "round" }, lu);
    sv("circle", { cx: 184, cy: 226, r: 15, fill: "rgba(170,215,255,.55)", stroke: "#14336b", "stroke-width": 5 }, lu);
    // gráfico
    var gr = sv("g", { class: "bh-p bh-p-grafico" }, P);
    sv("rect", { x: 152, y: 196, width: 46, height: 40, rx: 4, fill: "#fff", stroke: "#14336b", "stroke-width": 3 }, gr);
    sv("path", { d: "M160 228v-8 M170 228v-14 M180 228v-10 M190 228v-20", stroke: "#2b5aa8", "stroke-width": 5 }, gr);
    sv("path", { d: "M158 214 L172 206 L182 210 L194 200", fill: "none", stroke: "#d33a3a", "stroke-width": 2.5 }, gr);
    // alerta
    var al = sv("g", { class: "bh-p bh-p-alerta" }, P);
    sv("path", { d: "M164 200 L164 236", stroke: "#4a2c12", "stroke-width": 4 }, al);
    sv("path", { d: "M164 176 L188 216 L140 216Z", fill: "#fbbf24", stroke: "#b45309", "stroke-width": 3, "stroke-linejoin": "round" }, al);
    sv("path", { d: "M164 190v12 M164 208v.5", stroke: "#1d1206", "stroke-width": 4.5, "stroke-linecap": "round" }, al);
    // mapa
    var ma = sv("g", { class: "bh-p bh-p-mapa" }, P);
    sv("path", { d: "M150 200 L164 194 L178 200 L192 194 L192 230 L178 236 L164 230 L150 236Z", fill: "#cfe8d8", stroke: "#2e7d4f", "stroke-width": 2.5 }, ma);
    sv("path", { d: "M164 194v36 M178 200v36", stroke: "#2e7d4f", "stroke-width": 1.5 }, ma);
    sv("circle", { cx: 171, cy: 212, r: 4, fill: "#d33a3a" }, ma);
    // libro
    var li = sv("g", { class: "bh-p bh-p-libro" }, P);
    sv("rect", { x: 150, y: 198, width: 40, height: 34, rx: 3, fill: "#b42318" }, li);
    sv("rect", { x: 155, y: 202, width: 30, height: 26, fill: "#fff6e6" }, li);
    sv("path", { d: "M170 202v26", stroke: "#b42318", "stroke-width": 1.5 }, li);
    sv("path", { d: "M158 208h9 M158 213h9 M173 208h9 M173 213h9 M158 218h9 M173 218h9", stroke: "#9aa5b1", "stroke-width": 1.5 }, li);
    // hoja (leer)
    var le = sv("g", { class: "bh-p bh-p-leer" }, P);
    sv("path", { d: "M152 194 L184 194 L194 204 L194 238 L152 238Z", fill: "#fff", stroke: "#14336b", "stroke-width": 2.5 }, le);
    sv("path", { d: "M158 206h28 M158 213h28 M158 220h20 M158 227h26", stroke: "#2b5aa8", "stroke-width": 2 }, le);
    // calendario
    var ca = sv("g", { class: "bh-p bh-p-calendario" }, P);
    sv("rect", { x: 150, y: 196, width: 44, height: 40, rx: 4, fill: "#fff", stroke: "#14336b", "stroke-width": 2.5 }, ca);
    sv("rect", { x: 150, y: 196, width: 44, height: 11, rx: 3, fill: "#d33a3a" }, ca);
    for (var i = 0; i < 3; i++) for (var j = 0; j < 4; j++) sv("rect", { x: 155 + j * 9.5, y: 211 + i * 8, width: 6, height: 5, fill: i === 1 && j === 2 ? "#d33a3a" : "#b9c6d3" }, ca);
    // pulgar / ok
    var ok = sv("g", { class: "bh-p bh-p-ok" }, P);
    sv("circle", { cx: 172, cy: 214, r: 15, fill: "#2e9e5b" }, ok);
    sv("path", { d: "M164 214 L170 220 L181 207", fill: "none", stroke: "#fff", "stroke-width": 4, "stroke-linecap": "round", "stroke-linejoin": "round" }, ok);
    // signos de pregunta (pensar)
    var pq = sv("g", { class: "bh-pregunta" }, s);
    [[176, 52, 26], [192, 26, 18], [160, 22, 14]].forEach(function (q, k) { var t = sv("text", { x: q[0], y: q[1], "font-size": q[2], class: "bh-q bh-q" + k }, pq); t.textContent = "?"; });
    // ondas del saludo
    var on = sv("g", { class: "bh-ondas" }, s);
    sv("path", { d: "M184 96 Q192 104 186 114 M194 90 Q206 104 196 120", fill: "none", stroke: "#3d8bd9", "stroke-width": 3, "stroke-linecap": "round" }, on);
    return s;
  }

  function montar() {
    if (document.getElementById("buho")) return;
    var oculto = false; try { oculto = localStorage.getItem(CLAVE) === "1"; } catch (e) { }
    var raiz = el("div", "buho"); raiz.id = "buho";
    var globo = el("div", "bh-globo"); globo.setAttribute("role", "status"); globo.setAttribute("aria-live", "polite");
    var txt = el("p"); globo.appendChild(txt);
    var cerrar = el("button", "bh-cerrar", "×"); cerrar.type = "button"; cerrar.setAttribute("aria-label", "Ocultar al búho guía"); globo.appendChild(cerrar);
    var fig = el("button", "bh-fig"); fig.type = "button"; fig.setAttribute("aria-label", "Búho guía: mostrar mensaje"); fig.appendChild(dibujar());
    raiz.appendChild(globo); raiz.appendChild(fig);
    var volver = el("button", "bh-volver"); volver.type = "button"; volver.setAttribute("aria-label", "Mostrar al búho guía"); volver.title = "Mostrar al búho guía";
    var mini = dibujar(); mini.setAttribute("class", "bh-svg bh-mini"); volver.appendChild(mini);
    var heroIn = document.querySelector(".phero-in");
    // Portada (Inicio): arriba, dentro de la barra del portal. Demás pestañas: abajo a la derecha, fijo.
    function esInicio() { var h = (location.hash || "").slice(1); return !h || h === "inicio"; }
    function ubicar() {
      var arriba = esInicio() && !!heroIn;
      [raiz, volver].forEach(function (n) {
        var dest = arriba ? heroIn : document.body;
        if (n.parentNode !== dest) dest.appendChild(n);
        n.classList.toggle("en-hero", arriba);
      });
    }
    ubicar();
    window.addEventListener("hashchange", ubicar);
    var t = null;
    function decir(m, ms) { txt.textContent = m; raiz.classList.add("habla"); clearTimeout(t); t = setTimeout(function () { raiz.classList.remove("habla"); }, ms || 8000); }
    function pose() {
      var id = (location.hash || "#inicio").slice(1) || "inicio", S = window.SECCIONES || [];
      var sec = S.filter(function (x) { return x.id === id; })[0];
      var p = POSES[id] || (sec && sec.padre && POSES[sec.padre]) || (sec && sec.tipo === "documentos" ? ["leer", "Documentos de la Oficina de Epidemiología."] : null) || POSES.inicio;
      raiz.setAttribute("data-pose", p[0]);
      raiz.classList.remove("entra"); void raiz.offsetWidth; raiz.classList.add("entra");
      decir(p[1]);
    }
    function mostrar(v) {
      raiz.hidden = !v; volver.hidden = v;
      try { localStorage.setItem(CLAVE, v ? "0" : "1"); } catch (e) { }
      if (v) pose();
    }
    cerrar.addEventListener("click", function () { mostrar(false); });
    volver.addEventListener("click", function () { mostrar(true); });
    fig.addEventListener("click", function () { if (raiz.classList.contains("habla")) raiz.classList.remove("habla"); else decir(txt.textContent || POSES.inicio[1]); raiz.classList.remove("salta"); void raiz.offsetWidth; raiz.classList.add("salta"); });
    window.addEventListener("hashchange", function () { if (!raiz.hidden) pose(); });
    raiz.hidden = oculto; volver.hidden = !oculto;
    if (!oculto) setTimeout(pose, 500);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", montar); else montar();
  window.Buho = { montar: montar };
})();
