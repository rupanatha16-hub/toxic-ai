"use strict";
/* TOXIC AI - asli SVG icons (emoji ki jagah).
   1) Home ke Quick Tools aur AI Tools screen ke emoji icons badalta hai (app.js ko nahi chheda).
   2) premium.js ke liye icons deta hai: window.ToxicIcons.svg(naam, size).
   Koi secret nahi. */
(function () {
  var P = {
    math: '<circle cx="12" cy="6" r="1.2"/><circle cx="12" cy="18" r="1.2"/><path d="M5 12h14"/>',
    notes: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 12h6"/><path d="M9 16h6"/>',
    quiz: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7"/><path d="M12 17h.01"/>',
    exam: '<path d="M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2z"/><path d="M4 20a2 2 0 0 1 2-2h13"/><path d="M9 7h6"/>',
    code: '<path d="M8 8l-4 4l4 4"/><path d="M16 8l4 4l-4 4"/><path d="M14 5l-4 14"/>',
    bug: '<path d="M9 8a3 3 0 0 1 6 0v8a3 3 0 0 1-6 0z"/><path d="M5 9l4 1"/><path d="M19 9l-4 1"/><path d="M5 16l4-1"/><path d="M19 16l-4-1"/><path d="M9.5 5L8 3"/><path d="M14.5 5L16 3"/>',
    explain: '<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z"/>',
    sql: '<path d="M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3s-3.6 3-8 3s-8-1.3-8-3z"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
    email: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6l9-6"/>',
    essay: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 11h6"/><path d="M9 14h6"/><path d="M9 17h3"/>',
    story: '<path d="M12 6v14"/><path d="M3 5h6a3 3 0 0 1 3 3"/><path d="M21 5h-6a3 3 0 0 0-3 3"/><path d="M3 5v13h6a3 3 0 0 1 3 2"/><path d="M21 5v13h-6a3 3 0 0 0-3 2"/>',
    poem: '<path d="M20 4c-8 0-14 6-14 14c8 0 14-6 14-14z"/><path d="M4 20l8-8"/>',
    social: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 10.8l7.6-3.6"/><path d="M8.2 13.2l7.6 3.6"/>',
    youtube: '<rect x="3" y="5" width="18" height="14" rx="4"/><path d="M10 9l5 3l-5 3z"/>',
    resume: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><circle cx="11" cy="11" r="1.6"/><path d="M8.5 17c.5-1.5 1.5-2 2.5-2s2 .5 2.5 2"/>',
    translate: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18"/>',
    /* Premium tools */
    logo: '<path d="M12 3l2.8 5.7l6.2.9l-4.5 4.4l1.1 6.2l-5.6-3l-5.6 3l1.1-6.2l-4.5-4.4l6.2-.9z"/>',
    poster: '<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="9" cy="8" r="1.5"/><path d="M4 17l5-5l4 4l3-3l4 4"/>',
    vcard: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6 16c.5-1.5 1.5-2 3-2s2.5.5 3 2"/><path d="M14 10h4"/><path d="M14 13h3"/>',
    collage: '<rect x="3" y="3" width="8" height="10" rx="1"/><rect x="13" y="3" width="8" height="6" rx="1"/><rect x="13" y="11" width="8" height="10" rx="1"/><rect x="3" y="15" width="8" height="6" rx="1"/>',
    watermark: '<path d="M12 3c3.5 4.5 6 7.5 6 10.5a6 6 0 0 1-12 0c0-3 2.5-6 6-10.5z"/>',
    invoice: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 11h6"/><path d="M9 14h6"/><path d="M9 17h3"/>',
    pdfmaster: '<rect x="4" y="6" width="11" height="15" rx="1.5"/><path d="M9 6V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-2"/>',
    scanner: '<path d="M4 8V6a2 2 0 0 1 2-2h2"/><path d="M16 4h2a2 2 0 0 1 2 2v2"/><path d="M20 16v2a2 2 0 0 1-2 2h-2"/><path d="M8 20H6a2 2 0 0 1-2-2v-2"/><path d="M4 12h16"/>',
    quote: '<path d="M6 3h12v18l-3-2l-3 2l-3-2l-3 2z"/><path d="M9 8h6"/><path d="M9 12h6"/>',
    compress: '<path d="M4 8h4V4"/><path d="M20 8h-4V4"/><path d="M4 16h4v4"/><path d="M20 16h-4v4"/>',
    qrpro: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h3v3h-3z"/><path d="M20 14v.01"/><path d="M14 20h.01"/><path d="M20 20h-3v-3"/>',
    planner: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M16 3v4"/><path d="M8 3v4"/><path d="M4 11h16"/><path d="M9 15h.01"/><path d="M13 15h2"/>',
    hinditype: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01"/><path d="M10 10h.01"/><path d="M14 10h.01"/><path d="M18 10h.01"/><path d="M7 14h10"/>',
    password: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9"/><path d="M17 6l3 3"/><path d="M15 8l2 2"/>',
    website: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18"/>',
    invite: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
    textfmt: '<path d="M5 6h14"/><path d="M12 6v12"/><path d="M9 18h6"/>',
    notespro: '<rect x="6" y="3" width="13" height="18" rx="2"/><path d="M6 7H4"/><path d="M6 12H4"/><path d="M6 17H4"/><path d="M10 8h5"/><path d="M10 12h5"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'
  };
  function svg(n, s) {
    return '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[n] || "") + "</svg>";
  }
  window.ToxicIcons = { svg: svg, has: function (n) { return !!P[n]; } };

  var css = document.createElement("style");
  css.textContent =
    ".tool .ico.svgico{display:grid;place-items:center;width:46px;height:46px;border-radius:14px;margin-bottom:10px;font-size:0;color:#fff;background:linear-gradient(135deg,#7055E8,#397BFF)}";
  document.head.appendChild(css);

  function idByName(name) {
    try { for (var i = 0; i < TOOLS.length; i++) if (TOOLS[i].name === name) return TOOLS[i].id; } catch (e) {}
    return null;
  }
  function fix(box) {
    if (!box) return;
    Array.prototype.forEach.call(box.querySelectorAll(".tool"), function (b) {
      var ico = b.querySelector(".ico");
      var nm = b.querySelector("b");
      if (!ico || !nm || ico.classList.contains("svgico")) return;
      var id = idByName(nm.textContent);
      if (!id || !P[id]) return;
      ico.innerHTML = svg(id, 24);
      ico.classList.add("svgico");
    });
  }
  ["#quickTools", "#toolsGrid"].forEach(function (sel) {
    var box = document.querySelector(sel);
    if (!box) return;
    fix(box);
    new MutationObserver(function () { fix(box); }).observe(box, { childList: true });
  });
})();
