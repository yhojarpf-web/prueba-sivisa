(function () {
  "use strict";
  var S = window.SITIO;
  if (!S) { document.body.insertAdjacentHTML("afterbegin", "<p style='padding:20px'>Falta data/sitio.js</p>"); return; }
  var $ = function (id) { return document.getElementById(id); };
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function logo(archivo, alt, cls) { var i = el("img", cls); i.src = "assets/logos/" + archivo; i.alt = alt || ""; i.loading = "lazy"; return i; }
  function fecha(iso) { var p = String(iso || "").split("-"); return p.length === 3 ? p[2] + "/" + p[1] + "/" + p[0] : ""; }

  // Textos
  $("institucion").textContent = S.institucion;
  $("etiqueta").textContent = S.etiqueta;
  $("titulo").textContent = S.titulo;
  $("subtitulo").textContent = S.subtitulo;
  document.title = S.titulo + " · " + S.institucion;

  // Portada
  var P = S.portada || {};
  var hero = document.querySelector(".hero");
  if (P.imagen) hero.style.setProperty("--portada", 'url("' + new URL("assets/img/" + P.imagen, location.href).href + '")');
  if (P.modo === "completa") hero.classList.add("portada-completa");

  // Logos
  S.logosCabecera.forEach(function (f) { $("logos-cabecera").appendChild(logo(f, "", "top-logo")); });
  S.logosPie.forEach(function (f) { $("logos-pie").appendChild(logo(f, "", "pie-logo")); });
  $("pie-texto").textContent = "© " + new Date().getFullYear() + " " + S.institucion + " · " + S.titulo + " – " + S.subtitulo;

  // Enlaces de interés
  (S.enlaces || []).forEach(function (l) {
    var a = el("a", "pill", l.titulo); a.href = l.url; a.target = "_blank"; a.rel = "noopener";
    a.appendChild(el("span", "pill-ext", "↗"));
    $("enlaces").appendChild(a);
  });

  // Tarjetas de portales
  S.portales.forEach(function (p) {
    var c = el("a", "card"); c.href = p.enlace; c.style.setProperty("--c", p.color);
    c.appendChild(el("h3", "card-t", p.titulo));
    c.appendChild(el("span", "card-line"));
    var fig = el("div", "card-fig"); fig.appendChild(logo(p.logo, "Logo " + p.titulo, "card-logo")); c.appendChild(fig);
    c.appendChild(el("p", "card-d", p.descripcion));
    if (p.estado && p.estado !== "activo") c.appendChild(el("span", "card-estado", p.estado));
    c.appendChild(el("span", "card-btn", "Acceder"));
    $("cards").appendChild(c);
  });

  // Últimas publicaciones (de los catálogos de cada portal)
  var pubs = (window.CATALOGO || []).concat(window.CATALOGO_SEMANAL || []).map(function (d) { d._portal = "Epidemiología"; d._base = "epidemiologia/"; return d; });
  pubs.sort(function (a, b) { return a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0; });
  var lista = $("lista-recientes");
  if (window.Publicaciones) Publicaciones.tarjetas(lista, pubs.slice(0, 6), { base: "epidemiologia/", secciones: window.SECCIONES || [], portal: "Epidemiología" });


  // Datos vivos en la portada
  var activos = S.portales.filter(function (p) { return !p.estado || p.estado === "activo"; }).length;
  var ultima = pubs.length ? fecha(pubs[0].fecha) : "–";
  [[S.portales.length, S.portales.length === 1 ? "portal" : "portales"], [activos, activos === 1 ? "portal activo" : "portales activos"],
   [pubs.length, pubs.length === 1 ? "publicación" : "publicaciones"], [ultima, "última publicación"]].forEach(function (d) {
    var x = el("div", "dato"); x.appendChild(el("strong", null, d[0])); x.appendChild(el("span", null, d[1])); $("hero-datos").appendChild(x);
  });

  // Autoridades
  var aut = S.autoridades || [];
  if (!aut.length) $("autoridades").hidden = true;
  aut.forEach(function (a) {
    var f = el("div", "aut");
    f.appendChild(el("span", "aut-cargo", a.cargo));
    f.appendChild(el("strong", "aut-nombre", a.nombre));
    $("lista-autoridades").appendChild(f);
  });

  // Contacto
  var k = S.contacto || {};
  var foto = $("perfil-foto");
  if (k.foto) { foto.appendChild(logo("../" + k.foto, k.nombre)); }
  else {
    var w = (k.nombre || "").replace(/^(M\.?C\.?|Dr\.?|Dra\.?|Lic\.?|Ing\.?|Mg\.?)\s*/i, "").split(/\s+/).filter(function (x) { return x.length > 2; });
    foto.textContent = w.length ? (w[0][0] + (w.length > 1 ? w[w.length - 1][0] : "")).toUpperCase() : "";
  }
  $("perfil-nombre").textContent = k.nombre || "";
  $("perfil-cargo").textContent = k.cargo || "";
  $("perfil-area").textContent = k.area || "";
  var m = $("perfil-correo"); m.textContent = k.correo || ""; m.href = "mailto:" + (k.correo || "");
})();
