/* Guía animado del Portal de Salud Ambiental: un personaje tipo ícono por sección.
   Mundo (Inicio y Nosotros) · Gota (Calidad del agua) · Aedes aegypti hembra y Lutzomyia (Control vectorial).
   Se puede ocultar; se recuerda la elección. Escucha el evento "sa-vista" que emite assets/vectores.js al cambiar de vector. */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var CLAVE = "guia-sa-oculto";
  function sv(t, a, p) { var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function cara(g, x, y, sep, r, colorOjo, boca) {
    [x - sep, x + sep].forEach(function (cx) {
      sv("circle", { cx: cx, cy: y, r: r, fill: "#fff" }, g);
      var pu = sv("g", { class: "gu-pupila" }, g); sv("circle", { cx: cx, cy: y + 1, r: r * .55, fill: colorOjo || "#10202a" }, pu); sv("circle", { cx: cx + r * .25, cy: y - r * .25, r: r * .2, fill: "#fff" }, pu);
      sv("circle", { cx: cx, cy: y, r: r + .5, class: "gu-parpado", style: "transform-origin:" + cx + "px " + (y - r) + "px" }, g);
    });
    if (boca !== false) sv("path", { d: boca || ("M" + (x - 9) + " " + (y + 15) + " Q" + x + " " + (y + 24) + " " + (x + 9) + " " + (y + 15)), fill: "none", stroke: "#10202a", "stroke-width": 3.5, "stroke-linecap": "round" }, g);
    sv("ellipse", { cx: x - sep - 4, cy: y + 13, rx: 6, ry: 3.5, fill: "#ff8a8a", opacity: ".5" }, g); sv("ellipse", { cx: x + sep + 4, cy: y + 13, rx: 6, ry: 3.5, fill: "#ff8a8a", opacity: ".5" }, g);
  }

  // ---------- Personajes ----------
  function mundo() {
    var s = sv("svg", { viewBox: "0 0 200 200", class: "gu-svg gu-mundo", "aria-hidden": "true" }), G = sv("g", { class: "gu-cuerpo" }, s);
    sv("path", { d: "M100 34 Q98 18 108 10 M101 26 Q90 16 80 22 Q90 32 101 26Z M104 18 Q114 6 126 12 Q116 24 104 18Z", fill: "#2e9e5b", stroke: "#1f7a43", "stroke-width": 2, "stroke-linejoin": "round" }, G);
    sv("circle", { cx: 100, cy: 100, r: 66, fill: "#3d8bd9", stroke: "#1d5fa8", "stroke-width": 4 }, G);
    sv("path", { d: "M52 70 Q66 52 88 58 Q96 72 84 82 Q70 80 66 96 Q54 92 52 70Z M118 46 Q142 50 156 72 Q146 80 134 74 Q122 64 118 46Z M120 112 Q140 104 158 118 Q150 146 128 152 Q118 132 120 112Z M60 124 Q74 120 84 134 Q78 150 64 146Q56 138 60 124Z", fill: "#4cbf72" }, G);
    sv("path", { d: "M48 86 A54 54 0 0 1 86 48", fill: "none", stroke: "#fff", "stroke-width": 5, "stroke-linecap": "round", opacity: ".35" }, G);
    cara(G, 100, 98, 22, 11);
    var bi = sv("g", { class: "gu-brazo gu-brazo-i" }, G); sv("path", { d: "M38 112 Q22 122 22 138", fill: "none", stroke: "#1d5fa8", "stroke-width": 7, "stroke-linecap": "round" }, bi); sv("circle", { cx: 22, cy: 140, r: 7, fill: "#fff", stroke: "#1d5fa8", "stroke-width": 3 }, bi);
    var bd = sv("g", { class: "gu-brazo gu-brazo-d" }, G); sv("path", { d: "M162 112 Q178 122 178 138", fill: "none", stroke: "#1d5fa8", "stroke-width": 7, "stroke-linecap": "round" }, bd); sv("circle", { cx: 178, cy: 140, r: 7, fill: "#fff", stroke: "#1d5fa8", "stroke-width": 3 }, bd);
    var co = sv("g", { class: "gu-corazon" }, s); sv("path", { d: "M170 70 C170 62 182 60 184 68 C186 60 198 62 198 70 C198 80 184 86 184 92 C184 86 170 80 170 70Z", fill: "#e5484d" }, co);
    var on = sv("g", { class: "gu-ondas" }, s); sv("path", { d: "M186 112 Q194 120 188 132 M194 104 Q206 120 196 138", fill: "none", stroke: "#2e9e5b", "stroke-width": 3, "stroke-linecap": "round" }, on);
    return s;
  }
  function gota() {
    var s = sv("svg", { viewBox: "0 0 200 200", class: "gu-svg gu-gota", "aria-hidden": "true" });
    var df = sv("defs", {}, s), lg = sv("linearGradient", { id: "gu-g-agua", x1: "0", y1: "0", x2: "0", y2: "1" }, df);
    sv("stop", { offset: "0", "stop-color": "#7dd3fc" }, lg); sv("stop", { offset: "1", "stop-color": "#0f6b9f" }, lg);
    var G = sv("g", { class: "gu-cuerpo" }, s);
    sv("ellipse", { cx: 100, cy: 186, rx: 40, ry: 7, fill: "#0f6b62", opacity: ".15", class: "gu-sombra" }, s);
    sv("path", { d: "M100 14 C100 14 40 88 40 124 A60 60 0 0 0 160 124 C160 88 100 14 100 14Z", fill: "url(#gu-g-agua)", stroke: "#0b5a86", "stroke-width": 4, "stroke-linejoin": "round" }, G);
    sv("path", { d: "M66 112 Q68 82 90 56", fill: "none", stroke: "#fff", "stroke-width": 7, "stroke-linecap": "round", opacity: ".55" }, G);
    cara(G, 100, 124, 20, 11);
    var bi = sv("g", { class: "gu-brazo gu-brazo-i" }, G); sv("path", { d: "M44 136 Q28 140 24 154", fill: "none", stroke: "#0b5a86", "stroke-width": 6, "stroke-linecap": "round" }, bi);
    var bd = sv("g", { class: "gu-brazo gu-brazo-d" }, G); sv("path", { d: "M156 136 Q170 128 174 112", fill: "none", stroke: "#0b5a86", "stroke-width": 6, "stroke-linecap": "round" }, bd);
    var tb = sv("g", { class: "gu-tubo" }, bd);
    sv("rect", { x: 166, y: 70, width: 16, height: 42, rx: 7, fill: "#fff", stroke: "#0b5a86", "stroke-width": 3 }, tb);
    sv("rect", { x: 169, y: 88, width: 10, height: 20, rx: 4, class: "gu-cloro" }, tb);
    var br = sv("g", { class: "gu-brillos" }, s);
    sv("path", { d: "M34 44l4 10 10 4-10 4-4 10-4-10-10-4 10-4z M156 30l3 7 7 3-7 3-3 7-3-7-7-3 7-3z", fill: "#fbbf24" }, br);
    return s;
  }
  function aedes() {
    var s = sv("svg", { viewBox: "0 0 220 200", class: "gu-svg gu-aedes", "aria-hidden": "true" }), G = sv("g", { class: "gu-cuerpo gu-vuela" }, s);
    // alas (zumban)
    var al = sv("g", { class: "gu-alas" }, G);
    sv("ellipse", { cx: 120, cy: 62, rx: 46, ry: 18, transform: "rotate(-28 120 62)", fill: "rgba(200,225,255,.55)", stroke: "#7a9cc6", "stroke-width": 2 }, al);
    sv("ellipse", { cx: 132, cy: 76, rx: 40, ry: 15, transform: "rotate(-8 132 76)", fill: "rgba(200,225,255,.45)", stroke: "#7a9cc6", "stroke-width": 2 }, al);
    // patas con anillos blancos
    var pa = sv("g", { class: "gu-patas" }, G);
    ["M96 112 Q80 140 62 168", "M106 116 Q104 148 96 182", "M118 114 Q130 144 146 176", "M98 108 Q70 116 48 140", "M120 110 Q150 118 172 146", "M110 116 Q118 150 120 186"].forEach(function (d) {
      sv("path", { d: d, fill: "none", stroke: "#1b1d22", "stroke-width": 4, "stroke-linecap": "round" }, pa);
      sv("path", { d: d, fill: "none", stroke: "#fff", "stroke-width": 4, "stroke-dasharray": "5 9", "stroke-dashoffset": "-12", "stroke-linecap": "round" }, pa);
    });
    // abdomen con bandas blancas
    sv("path", { d: "M120 104 Q160 112 196 140 Q198 152 186 150 Q150 130 116 116Z", fill: "#1b1d22" }, G);
    sv("path", { d: "M138 112 L134 124 M154 120 L149 132 M170 130 L164 141 M184 140 L178 149", stroke: "#fff", "stroke-width": 3.5, "stroke-linecap": "round" }, G);
    // tórax con la "lira" blanca
    sv("ellipse", { cx: 106, cy: 100, rx: 24, ry: 20, fill: "#24272e" }, G);
    sv("path", { d: "M96 86 Q90 100 98 112 M116 86 Q122 100 114 112 M104 92v14 M108 92v14", fill: "none", stroke: "#fff", "stroke-width": 2.6, "stroke-linecap": "round" }, G);
    // cabeza
    sv("circle", { cx: 70, cy: 92, r: 30, fill: "#24272e" }, G);
    cara(G, 66, 88, 12, 9, "#10202a", "M58 106 Q66 101 74 106");
    sv("path", { d: "M52 100 L14 122", stroke: "#1b1d22", "stroke-width": 4, "stroke-linecap": "round" }, G);
    sv("path", { d: "M58 64 Q48 44 36 40 M70 62 Q74 42 86 34", fill: "none", stroke: "#1b1d22", "stroke-width": 3, "stroke-linecap": "round" }, G);
    sv("path", { d: "M48 70 Q56 66 62 72 M72 72 Q78 66 86 70", fill: "none", stroke: "#fff", "stroke-width": 2.5, "stroke-linecap": "round" }, G);
    // recipiente con agua (criadero)
    var cr = sv("g", { class: "gu-criadero" }, s);
    sv("path", { d: "M150 170 L156 196 L196 196 L202 170Z", fill: "#e8590c" }, cr); sv("ellipse", { cx: 176, cy: 170, rx: 26, ry: 6, fill: "#7dd3fc", stroke: "#b45309", "stroke-width": 2 }, cr);
    return s;
  }
  function lutzo() {
    var s = sv("svg", { viewBox: "0 0 210 200", class: "gu-svg gu-lutzo", "aria-hidden": "true" });
    var lu = sv("g", { class: "gu-luna" }, s); sv("path", { d: "M176 18 A22 22 0 1 0 198 46 A17 17 0 1 1 176 18Z", fill: "#fde68a" }, lu);
    sv("path", { d: "M150 16l2 5 5 2-5 2-2 5-2-5-5-2 5-2z M196 70l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z", fill: "#fde68a" }, lu);
    var G = sv("g", { class: "gu-cuerpo gu-salta" }, s);
    var al = sv("g", { class: "gu-alas" }, G);
    sv("path", { d: "M104 86 Q84 46 92 18 Q110 40 112 84Z", fill: "rgba(250,240,215,.85)", stroke: "#b08a4a", "stroke-width": 2 }, al);
    sv("path", { d: "M114 84 Q128 40 154 26 Q150 60 122 90Z", fill: "rgba(250,240,215,.85)", stroke: "#b08a4a", "stroke-width": 2 }, al);
    sv("path", { d: "M92 22l-4-3 M96 34l-5-1 M100 48l-5 0 M150 30l4-2 M144 44l5 0 M136 58l5 1", stroke: "#b08a4a", "stroke-width": 1.5, "stroke-linecap": "round" }, al);
    var pa = sv("g", { class: "gu-patas" }, G);
    ["M100 112 Q78 140 66 178", "M108 116 Q104 150 98 186", "M118 114 Q134 146 148 180", "M98 108 Q70 112 50 132", "M122 108 Q150 112 168 136", "M112 116 Q118 150 122 188"].forEach(function (d) { sv("path", { d: d, fill: "none", stroke: "#a07a3c", "stroke-width": 3, "stroke-linecap": "round" }, pa); });
    sv("path", { d: "M122 100 Q156 108 178 130 Q178 140 168 138 Q144 122 118 112Z", fill: "#d9b77a", stroke: "#a07a3c", "stroke-width": 2 }, G);
    sv("path", { d: "M136 108l-2 -6 M150 116l-1 -6 M164 126l1 -6 M140 120l-3 5 M156 128l-2 6", stroke: "#a07a3c", "stroke-width": 1.5, "stroke-linecap": "round" }, G);
    sv("ellipse", { cx: 110, cy: 100, rx: 20, ry: 18, fill: "#e3c48c", stroke: "#a07a3c", "stroke-width": 2 }, G);
    sv("circle", { cx: 78, cy: 98, r: 26, fill: "#e8cc96", stroke: "#a07a3c", "stroke-width": 2 }, G);
    sv("path", { d: "M58 78l-4 -4 M66 72l-2 -6 M78 70v-6 M90 72l2 -6 M98 80l5 -4", stroke: "#a07a3c", "stroke-width": 1.8, "stroke-linecap": "round" }, G);
    cara(G, 76, 96, 11, 9, "#3a1f0b", "M68 112 Q76 117 84 112");
    sv("path", { d: "M58 106 L30 118", stroke: "#a07a3c", "stroke-width": 3.5, "stroke-linecap": "round" }, G);
    sv("path", { d: "M62 80 Q48 60 40 58 M72 74 Q72 54 80 48", fill: "none", stroke: "#a07a3c", "stroke-width": 2.5, "stroke-linecap": "round" }, G);
    return s;
  }
  var PJ = { mundo: mundo, gota: gota, aedes: aedes, lutzo: lutzo };
  var MSJ = {
    inicio: ["mundo", "saludo", "¡Hola! Bienvenido al Portal de Salud Ambiental de la Red de Salud Chachapoyas."],
    nosotros: ["mundo", "abraza", "Cuidamos el agua, el ambiente y prevenimos las enfermedades transmitidas por vectores."],
    agua: ["gota", "agua", "¿Tu agua es segura? Revisa el riesgo de tu localidad mes a mes."],
    "aedes-escenarios": ["aedes", "vuela", "Soy la hembra de Aedes aegypti: transmito dengue, zika y chikungunya. ¡No dejes agua acumulada!"],
    "aedes-indices": ["aedes", "vuela", "Tapa, voltea y elimina los recipientes con agua: así bajan mis índices."],
    lutzo: ["lutzo", "salta", "Soy la manta blanca (Lutzomyia). Salgo al anochecer: usa mosquitero y repelente."]
  };

  function montar() {
    if (document.getElementById("guia-sa")) return;
    var oculto = false; try { oculto = localStorage.getItem(CLAVE) === "1"; } catch (e) { }
    var raiz = el("div", "guia"); raiz.id = "guia-sa";
    var globo = el("div", "gu-globo"); globo.setAttribute("role", "status"); globo.setAttribute("aria-live", "polite");
    var txt = el("p"); globo.appendChild(txt);
    var cerrar = el("button", "gu-cerrar", "×"); cerrar.type = "button"; cerrar.setAttribute("aria-label", "Ocultar al guía"); globo.appendChild(cerrar);
    var fig = el("button", "gu-fig"); fig.type = "button"; fig.setAttribute("aria-label", "Guía de Salud Ambiental: mostrar mensaje");
    var cache = {}; Object.keys(PJ).forEach(function (k) { cache[k] = PJ[k](); cache[k].style.display = "none"; fig.appendChild(cache[k]); });
    raiz.appendChild(globo); raiz.appendChild(fig);
    var volver = el("button", "gu-volver"); volver.type = "button"; volver.setAttribute("aria-label", "Mostrar al guía"); volver.title = "Mostrar al guía";
    volver.appendChild(mundo());
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
    var t = null, actual = null, vista = { vector: "aedes", sub: "escenarios" };
    try { var g0 = JSON.parse(sessionStorage.getItem("vectores") || "{}"); if (g0.vector) vista.vector = g0.vector; if (g0.sub) vista.sub = g0.sub; } catch (e) { }
    function decir(m) { txt.textContent = m; raiz.classList.add("habla"); clearTimeout(t); t = setTimeout(function () { raiz.classList.remove("habla"); }, 8500); }
    function clave() {
      var id = (location.hash || "#inicio").slice(1) || "inicio";
      if (id === "control-vectorial") return vista.vector === "lutzo" ? "lutzo" : "aedes-" + (vista.sub === "indices" ? "indices" : "escenarios");
      return MSJ[id] ? id : "inicio";
    }
    function pose() {
      var k = clave(); if (k === actual) return; actual = k;
      var m = MSJ[k];
      Object.keys(cache).forEach(function (n) { cache[n].style.display = n === m[0] ? "" : "none"; });
      raiz.setAttribute("data-pj", m[0]); raiz.setAttribute("data-pose", m[1]);
      raiz.classList.remove("entra"); void raiz.offsetWidth; raiz.classList.add("entra");
      decir(m[2]);
    }
    function mostrar(v) { raiz.hidden = !v; volver.hidden = v; try { localStorage.setItem(CLAVE, v ? "0" : "1"); } catch (e) { } if (v) { actual = null; pose(); } }
    cerrar.addEventListener("click", function () { mostrar(false); });
    volver.addEventListener("click", function () { mostrar(true); });
    fig.addEventListener("click", function () { if (raiz.classList.contains("habla")) raiz.classList.remove("habla"); else decir(MSJ[actual || "inicio"][2]); raiz.classList.remove("salta"); void raiz.offsetWidth; raiz.classList.add("salta"); });
    window.addEventListener("hashchange", function () { if (!raiz.hidden) pose(); });
    document.addEventListener("sa-vista", function (e) { var d = e.detail || {}; if (d.vector) vista.vector = d.vector; if (d.sub) vista.sub = d.sub; if (!raiz.hidden) pose(); });
    raiz.hidden = oculto; volver.hidden = !oculto;
    if (!oculto) setTimeout(pose, 500);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", montar); else montar();
})();
