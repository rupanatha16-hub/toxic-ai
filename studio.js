/* TOXIC AI - Studio (naye tools). Ye file app.js ko chhedti nahi; apni alag screen jodti hai. */
(function () {
  "use strict";

  var API = (typeof API_URL !== "undefined" ? String(API_URL) : "").replace(/\/$/, "");
  var RULE_T = typeof RULE !== "undefined" ? RULE : "";

  /* ---------- chhote helper ---------- */
  function q(s, r) { return (r || document).querySelector(s); }
  function h(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  function say(m) { if (typeof toast === "function") toast(m); else alert(m); }
  function copyText(t) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(function () { say("Copy ho gaya"); }, function () { say("Copy nahi ho paya"); });
    } else say("Is browser mein copy nahi ho sakta");
  }
  function saveBlob(blob, name) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }
  function fmtSize(n) {
    if (n < 1024) return n + " B";
    if (n < 1048576) return (n / 1024).toFixed(1) + " KB";
    return (n / 1048576).toFixed(2) + " MB";
  }

  /* ---------- icons (line SVG, ek jaisa size/rang/stroke) ---------- */
  var IC = {
    menu: '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>',
    back: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    grid: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
    studio: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 3v4"/><path d="M21 5h-4"/>',
    settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
    book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    image: '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
    calc: '<rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><path d="M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01M16 14h.01M16 18h.01"/>',
    file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    video: '<path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2"/>',
    copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    speaker: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    tool: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    mic: '<rect width="6" height="12" x="9" y="2" rx="3"/><path d="M5 10v1a7 7 0 0 0 14 0v-1"/><line x1="12" x2="12" y1="19" y2="22"/>',
    cal: '<rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>',
    palette: '<circle cx="13.5" cy="6.5" r="1"/><circle cx="17.5" cy="10.5" r="1"/><circle cx="8.5" cy="7.5" r="1"/><circle cx="6.5" cy="12.5" r="1"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    list: '<line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/>',
    sw: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M9 2h6"/>'
  };

  /* ---------- tool ke hisaab ke alag icons ---------- */
  var IC2 = {
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    essay: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/>',
    story: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
    feather: '<path d="M12.67 19a2 2 0 0 0 1.416-.588l6.154-6.172a6 6 0 0 0-8.49-8.49L5.586 9.914A2 2 0 0 0 5 11.328V18a1 1 0 0 0 1 1z"/><path d="M16 8 2 22"/><path d="M17.5 15H9"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    rss: '<path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/>',
    news: '<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>',
    camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
    play: '<path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    brief: '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
    pack: '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
    spell: '<path d="m6 16 6-12 6 12"/><path d="M8 12h8"/><path d="m16 20 2 2 4-4"/>',
    align: '<line x1="21" x2="3" y1="6" y2="6"/><line x1="15" x2="3" y1="12" y2="12"/><line x1="17" x2="3" y1="18" y2="18"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    bulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
    chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    bug: '<path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/>',
    term: '<polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/>',
    db: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    braces: '<path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"/><path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"/>',
    cpu: '<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/>',
    hash: '<line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/>',
    swap: '<path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>',
    alert: '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
    sigma: '<path d="M18 7V5a1 1 0 0 0-1-1H6.5a.5.5 0 0 0-.4.8l4.5 6a2 2 0 0 1 0 2.4l-4.5 6a.5.5 0 0 0 .4.8H17a1 1 0 0 0 1-1v-2"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    checks: '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
    cap: '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
    note: '<path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/><path d="M15 3v6h6"/>',
    lang: '<path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>',
    layers: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
    clip: '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',
    film: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M3 7.5h4"/><path d="M3 12h18"/><path d="M3 16.5h4"/><path d="M17 3v18"/><path d="M17 7.5h4"/><path d="M17 16.5h4"/>',
    type: '<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/>',
    caption: '<rect width="18" height="14" x="3" y="5" rx="2" ry="2"/><path d="M7 15h4m4 0h2M7 11h2m4 0h4"/>',
    ruler: '<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/>',
    cake: '<path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20"/><path d="M7 8v3"/><path d="M12 8v3"/><path d="M17 8v3"/><path d="M7 4h.01"/><path d="M12 4h.01"/><path d="M17 4h.01"/>',
    wand: '<path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/>',
    sliders: '<line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/>',
    fileimg: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><circle cx="10" cy="12" r="2"/><path d="m20 17-1.296-1.296a2.41 2.41 0 0 0-3.408 0L9 22"/>'
  };
  for (var k2 in IC2) IC[k2] = IC2[k2];
  var TOOL_IC = {
    w_email: "mail", w_essay: "essay", w_story: "story", w_poem: "feather", w_shayari: "heart", w_blog: "rss", w_article: "news",
    w_social: "share", w_insta: "camera", w_yts: "play", w_resume: "user", w_cover: "brief", w_prod: "pack", w_grammar: "spell",
    w_sum: "align", w_rewrite: "refresh", w_ideas: "bulb", w_msg: "chat",
    c_gen: "term", c_bug: "bug", c_exp: "code", c_sql: "db", c_html: "globe", c_css: "palette", c_js: "braces", c_py: "cpu",
    c_kt: "cpu", c_rx: "hash", c_conv: "swap", c_err: "alert",
    s_math: "sigma", s_quiz: "help", s_mcq: "checks", s_exam: "cap", s_plan: "cal", s_notes: "note", s_qa: "chat", s_trans: "lang",
    s_vocab: "book", s_gram: "spell", s_flash: "layers", s_topic: "bulb", s_hw: "clip",
    v_script: "film", v_title: "type", v_desc: "align", v_cap: "caption",
    d_calc: "calc", d_unit: "ruler", d_age: "cake", d_date: "cal", d_pass: "lock", d_count: "hash", d_case: "type", d_clean: "wand",
    d_json: "braces", d_notes: "note", d_todo: "checks", d_stop: "sw", d_timer: "clock", d_cal: "cal", d_color: "palette",
    p_edit: "sliders", p_color: "palette", f_pdf: "fileimg", f_view: "file", f_pdfview: "file", vd_info: "video",
    vo_tts: "speaker", vo_stt: "mic"
  };
  function icon(name, size, fill) {
    var s = size || 22;
    var sp = h("span", "st-ico");
    sp.innerHTML = '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="' + (fill ? "currentColor" : "none") + '" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (IC[name] || IC.tool) + "</svg>";
    return sp;
  }

  /* ---------- AI tools (sab /chat Worker se chalte hain) ---------- */
  var AI = [];
  function A(id, cat, ic, name, desc, sys, ph) { AI.push({ id: id, cat: cat, ic: ic, name: name, desc: desc, ai: true, sys: sys, ph: ph || "Yahan likho..." }); }

  A("w_email", "writer", "pen", "Email Writer", "Professional email", "Zaroorat ke hisaab se subject ke saath ek achhi email likho.", "Kisko, kis baare mein email likhni hai?");
  A("w_essay", "writer", "pen", "Essay Writer", "Nibandh", "Topic par structured essay likho: introduction, body aur conclusion ke saath.", "Essay ka topic likho");
  A("w_story", "writer", "pen", "Story Writer", "Kahani", "Diye gaye idea par ek dilchasp kahani likho.", "Kahani ka idea likho");
  A("w_poem", "writer", "pen", "Poetry Writer", "Kavita", "Diye gaye topic par ek achhi kavita likho.", "Kavita ka topic likho");
  A("w_shayari", "writer", "pen", "Shayari Writer", "Shayari", "Diye gaye mood ya topic par dil ko chhoone wali shayari likho.", "Kis baare mein shayari chahiye?");
  A("w_blog", "writer", "pen", "Blog Writer", "Blog post", "Topic par SEO-friendly blog post likho: title, intro, headings aur conclusion ke saath.", "Blog ka topic likho");
  A("w_article", "writer", "pen", "Article Writer", "Article", "Topic par jaankari bhara article likho.", "Article ka topic likho");
  A("w_social", "writer", "pen", "Social Media Post", "Post likho", "Diye gaye topic par social media post likho, kuch hashtags ke saath.", "Post kis baare mein hai?");
  A("w_insta", "writer", "pen", "Instagram Caption", "Caption", "Diye gaye photo/topic ke liye 5 alag-alag Instagram captions likho.", "Photo ya topic ke baare mein likho");
  A("w_yts", "writer", "pen", "YouTube Script Writer", "Video script", "Diye gaye topic par YouTube video ki script likho: hook, main hissa aur outro ke saath.", "Video ka topic likho");
  A("w_resume", "writer", "pen", "Resume Builder", "Resume", "Diye gaye vivaran se ek saaf professional resume likho. Jo jaankari na ho use apne se mat banao, [yahan bharo] likho.", "Naam, padhai, kaam ka anubhav, skills likho");
  A("w_cover", "writer", "pen", "Cover Letter Writer", "Cover letter", "Diye gaye vivaran se cover letter likho. Jo jaankari na ho use apne se mat banao.", "Job ka naam aur apna anubhav likho");
  A("w_prod", "writer", "pen", "Product Description", "Product ka vivaran", "Product ka aakarshak description likho: khaasiyat aur fayde ke saath.", "Product ka naam aur khaasiyat likho");
  A("w_grammar", "writer", "pen", "Grammar Checker", "Galtiyan theek karo", "Diya gaya text padho, galtiyan theek karke saaf version do aur batao kya badla.", "Jo text check karna hai wo likho");
  A("w_sum", "writer", "pen", "Text Summarizer", "Chhota saar", "Diye gaye text ka chhota aur saaf saar do.", "Lamba text yahan chipkao");
  A("w_rewrite", "writer", "pen", "Text Rewriter", "Dobara likho", "Diye gaye text ko behtar shabdon mein dobara likho, matlab wahi rakho.", "Jo text dobara likhwana hai wo likho");
  A("w_ideas", "writer", "pen", "Content Ideas", "Naye idea", "Diye gaye topic par 10 naye content ideas do.", "Topic ya niche likho");
  A("w_msg", "writer", "pen", "Professional Message", "Message likho", "Zaroorat ke hisaab se ek vinamra aur professional message likho.", "Kisko, kya kehna hai?");

  A("c_gen", "code", "code", "Code Generator", "Code likhwao", "User ki zaroorat ke hisaab se poora kaam karne wala code likho aur chhota explanation do.", "Kya banana hai?");
  A("c_bug", "code", "code", "Bug Fixer", "Galti dhundo", "User ka code padho, bug dhundo, theek kiya hua code do aur batao kya badla.", "Apna code yahan chipkao");
  A("c_exp", "code", "code", "Code Explainer", "Code samjho", "Diye gaye code ko line-by-line asaan bhasha mein samjhao.", "Code yahan chipkao");
  A("c_sql", "code", "code", "SQL Assistant", "SQL queries", "SQL query likho ya samjhao aur batao kaise kaam karti hai.", "Table aur kaam ka vivaran likho");
  A("c_html", "code", "code", "HTML Generator", "HTML page", "Diye gaye vivaran ke hisaab se saaf, sahi HTML code likho.", "Kaisa page chahiye?");
  A("c_css", "code", "code", "CSS Generator", "CSS styling", "Diye gaye vivaran ke hisaab se saaf CSS code likho.", "Kaisi styling chahiye?");
  A("c_js", "code", "code", "JavaScript Assistant", "JavaScript madad", "JavaScript mein code likho ya samjhao.", "JavaScript mein kya karwana hai?");
  A("c_py", "code", "code", "Python Assistant", "Python madad", "Python mein code likho ya samjhao.", "Python mein kya karwana hai?");
  A("c_kt", "code", "code", "Kotlin Assistant", "Kotlin madad", "Kotlin mein code likho ya samjhao.", "Kotlin mein kya karwana hai?");
  A("c_rx", "code", "code", "Regex Helper", "Regex banao", "Zaroorat ke hisaab se regex likho aur example ke saath samjhao.", "Kya match karna hai?");
  A("c_conv", "code", "code", "Code Converter", "Ek bhasha se doosri", "Diya gaya code user ki bataayi bhasha mein badlo. Pehli line mein bhasha batao.", "Code chipkao aur likho kis bhasha mein chahiye");
  A("c_err", "code", "code", "Error Explainer", "Error samjho", "Diya gaya error message asaan bhasha mein samjhao aur theek karne ke tareeke batao.", "Error message yahan chipkao");

  A("s_math", "study", "book", "Math Solver", "Step-by-step hal", "Math sawal ko step-by-step hal karo aur aakhir mein final answer likho.", "Sawal likho");
  A("s_quiz", "study", "book", "Quiz Generator", "Quiz banao", "Topic par 5 sawalon ka quiz banao aur aakhir mein answers do.", "Quiz ka topic likho");
  A("s_mcq", "study", "book", "MCQ Generator", "MCQ sawal", "Topic par 10 MCQ sawal banao, 4 options ke saath, aakhir mein answers do.", "Topic likho");
  A("s_exam", "study", "book", "Exam Preparation", "Padhai ki taiyari", "Exam ke liye practical study tips aur important points batao.", "Kaunsa exam aur subject?");
  A("s_plan", "study", "book", "Study Planner", "Padhai ka plan", "Diye gaye samay aur subjects ke hisaab se din-wise study plan banao.", "Exam ki tareekh, subjects aur roz ke ghante likho");
  A("s_notes", "study", "book", "Notes Generator", "Chhote notes", "Diye gaye topic ke short, point-wise exam notes banao.", "Topic likho");
  A("s_qa", "study", "book", "Question-Answer Generator", "Sawal-jawab", "Diye gaye text se important sawal aur unke jawab banao.", "Text chipkao");
  A("s_trans", "study", "book", "Translator", "Anuvad", "Sirf translation do. Agar user ne bhasha na batayi ho to Hindi se English, English se Hindi karo.", "Text likho (aur kis bhasha mein chahiye)");
  A("s_vocab", "study", "book", "Vocabulary Helper", "Shabd-kosh", "Diye gaye shabd ka matlab, example aur milte-julte shabd batao.", "Shabd likho");
  A("s_gram", "study", "book", "Grammar Assistant", "Grammar samjho", "Grammar ka niyam asaan bhasha mein example ke saath samjhao.", "Grammar ka topic ya sawal likho");
  A("s_flash", "study", "book", "Flashcards", "Yaad karne ke card", "Topic par 10 flashcards banao: Sawal / Jawab format mein.", "Topic likho");
  A("s_topic", "study", "book", "Topic Explainer", "Topic samjho", "Topic ko bilkul asaan bhasha mein example ke saath samjhao.", "Kaunsa topic samjhna hai?");
  A("s_hw", "study", "book", "Homework Helper", "Homework madad", "Homework ka sawal step-by-step samjhao, sirf answer mat do.", "Homework ka sawal likho");

  A("v_script", "video", "video", "Video Script Writer", "Video ki script", "Diye gaye topic par short video ki script likho: scene-wise.", "Video ka topic likho");
  A("v_title", "video", "video", "YouTube Title Generator", "Title idea", "Diye gaye video ke liye 10 aakarshak YouTube titles do.", "Video kis baare mein hai?");
  A("v_desc", "video", "video", "YouTube Description", "Description", "Diye gaye video ke liye YouTube description aur kuch hashtags likho.", "Video kis baare mein hai?");
  A("v_cap", "video", "video", "Video Caption Writer", "Caption likho", "Diye gaye video ke liye chhote, achhe captions likho.", "Video kis baare mein hai?");

  /* ---------- AI tool ki screen ---------- */
  function aiUI(t, root) {
    var ta = h("textarea", "input");
    ta.rows = 6; ta.maxLength = 4000; ta.placeholder = t.ph;
    ta.style.resize = "vertical";
    var lang = h("select", "select");
    [["", "Bhasha: jo main likhun wahi"], ["Hindi (Devanagari)", "Hindi (देवनागरी)"], ["English", "English"], ["Hinglish", "Hinglish"]].forEach(function (o) {
      var op = h("option", "", o[1]); op.value = o[0]; lang.append(op);
    });
    var go = h("button", "btn btn-primary btn-block", "Generate");
    var res = h("div", "card st-res"); res.hidden = true;
    var prov = h("div", "st-prov");
    var bar = h("div", "msg-actions st-actions");
    function ib(name, label) {
      if (typeof iconBtn === "function") return iconBtn(name, label);
      var b = h("button", "btn", label); b.type = "button"; return b;
    }
    var bCopy = ib("copy", "Copy"), bSpeak = ib("speak", "Sunao"), bShare = ib("share", "Share"), bAgain = ib("redo", "Dobara");
    bar.append(bCopy);
    if ("speechSynthesis" in window) bar.append(bSpeak);
    if (navigator.share) bar.append(bShare);
    bar.append(bAgain);
    function plain(t) { return String(t).replace(/\*\*|__|`/g, "").replace(/^#{1,6}\s*/gm, ""); }
    var out = h("div", "st-out");
    res.append(out, prov, bar);
    var last = "";
    var ctrl = null;

    function run() {
      var text = ta.value.trim();
      if (!text) { say("Pehle kuch likho"); return; }
      if (!API) { say("AI abhi jura nahi hai"); return; }
      go.disabled = true; go.textContent = "Soch raha hoon...";
      res.hidden = false; out.textContent = ""; prov.textContent = "";
      var dots = h("div", "typing"); dots.append(h("span"), h("span"), h("span")); out.append(dots);
      ctrl = new AbortController();
      var timedOut = false;
      var timer = setTimeout(function () { timedOut = true; ctrl.abort(); }, 45000);
      var sys = RULE_T + " " + t.sys + (lang.value ? " Jawab " + lang.value + " mein do." : "");
      fetch(API + "/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: ctrl.signal,
        body: JSON.stringify({ system: sys, messages: [{ role: "user", content: text }] })
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (d) {
          if (!r.ok || !d.reply) throw new Error(d.error || "Server error " + r.status);
          return d;
        });
      }).then(function (d) {
        last = String(d.reply);
        out.textContent = "";
        if (typeof renderMd === "function") out.append(renderMd(last)); else { out.style.whiteSpace = "pre-wrap"; out.textContent = last; }
        prov.textContent = d.provider ? "Provider: " + d.provider : "";
      }).catch(function (e) {
        last = "";
        var m = timedOut ? "Time out ho gaya. Dobara koshish karo." : (e instanceof TypeError ? "Server se connect nahi ho paya. Internet check karo." : "Jawab nahi mila: " + (e.message || e));
        out.textContent = m;
      }).then(function () {
        clearTimeout(timer);
        go.disabled = false; go.textContent = "Generate";
      });
    }
    go.onclick = run;
    bAgain.onclick = run;
    bCopy.onclick = function () { if (last) copyText(plain(last)); else say("Abhi kuch copy karne ko nahi hai"); };
    bSpeak.onclick = function () {
      if (!last) { say("Pehle jawab banwao"); return; }
      if (typeof speakText === "function") speakText(last, bSpeak);
    };
    bShare.onclick = function () { if (last && navigator.share) navigator.share({ text: plain(last) }).catch(function () {}); };
    root.append(ta, lang, go, res);
  }

  /* ---------- browser ke tools (bina API ke) ---------- */
  var B = [];
  function D(id, cat, ic, name, desc, run) { B.push({ id: id, cat: cat, ic: ic, name: name, desc: desc, run: run }); }
  function field(label, node) { var w = h("label", "st-field"); w.append(h("span", "st-lab", label), node); return w; }
  function inp(type, val) { var i = h("input", "input"); i.type = type; if (val != null) i.value = val; return i; }
  function btn(text, cls, fn) { var b = h("button", "btn " + (cls || ""), text); b.type = "button"; b.onclick = fn; return b; }
  function row() { var r = h("div", "st-row"); for (var k = 0; k < arguments.length; k++) r.append(arguments[k]); return r; }

  /* Calculator (eval nahi, apna safe parser) */
  function evalExpr(src, deg) {
    var s = src.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/\s+/g, "").toLowerCase();
    var i = 0;
    function pk() { return s.charAt(i); }
    function add() { var v = mul(); while (pk() === "+" || pk() === "-") { var o = s.charAt(i++); var r = mul(); v = o === "+" ? v + r : v - r; } return v; }
    function mul() { var v = unary(); while (pk() === "*" || pk() === "/" || pk() === "%") { var o = s.charAt(i++); var r = unary(); v = o === "*" ? v * r : o === "/" ? v / r : v % r; } return v; }
    function unary() { if (pk() === "-") { i++; return -unary(); } if (pk() === "+") { i++; return unary(); } return pw(); }
    function pw() { var b = primary(); if (pk() === "^") { i++; return Math.pow(b, unary()); } return b; }
    function primary() {
      if (pk() === "(") { i++; var v = add(); if (pk() !== ")") throw new Error("bracket"); i++; return v; }
      var m = /^(\d+\.?\d*|\.\d+)/.exec(s.slice(i));
      if (m) { i += m[0].length; return parseFloat(m[0]); }
      m = /^[a-zπ]+/.exec(s.slice(i));
      if (!m) throw new Error("galat");
      var name = m[0]; i += name.length;
      if (name === "pi" || name === "π") return Math.PI;
      if (name === "e") return Math.E;
      if (pk() !== "(") throw new Error("galat");
      i++; var a = add(); if (pk() !== ")") throw new Error("bracket"); i++;
      var rad = deg ? a * Math.PI / 180 : a;
      switch (name) {
        case "sin": return Math.sin(rad);
        case "cos": return Math.cos(rad);
        case "tan": return Math.tan(rad);
        case "sqrt": return Math.sqrt(a);
        case "log": return Math.log10(a);
        case "ln": return Math.log(a);
        case "abs": return Math.abs(a);
        default: throw new Error("galat");
      }
    }
    var res = add();
    if (i !== s.length) throw new Error("galat");
    if (!isFinite(res)) throw new Error("galat");
    return res;
  }
  D("d_calc", "daily", "calc", "Calculator", "Normal + scientific", function (root) {
    var disp = inp("text", ""); disp.readOnly = true; disp.inputMode = "none";
    disp.style.fontSize = "26px"; disp.style.textAlign = "right";
    var hint = h("div", "st-prov", "");
    var deg = true;
    var degBtn = btn("Deg", "", function () { deg = !deg; degBtn.textContent = deg ? "Deg" : "Rad"; });
    var keys = ["C", "⌫", "(", ")", "sin", "cos", "tan", "√", "7", "8", "9", "÷", "log", "ln", "π", "^", "4", "5", "6", "×", "1", "2", "3", "−", "0", ".", "%", "+"];
    var grid = h("div", "st-keys");
    keys.forEach(function (k) {
      grid.append(btn(k, "", function () {
        hint.textContent = "";
        if (k === "C") disp.value = "";
        else if (k === "⌫") disp.value = disp.value.replace(/(sin\(|cos\(|tan\(|sqrt\(|log\(|ln\(|.)$/, "");
        else if (k === "√") disp.value += "sqrt(";
        else if (["sin", "cos", "tan", "log", "ln"].indexOf(k) > -1) disp.value += k + "(";
        else disp.value += k;
      }));
    });
    var eq = btn("=", "btn-primary btn-block", function () {
      try { var r = evalExpr(disp.value, deg); disp.value = String(Number(r.toPrecision(12))); hint.textContent = ""; }
      catch (e) { hint.textContent = "Expression sahi nahi hai"; }
    });
    root.append(disp, row(degBtn), grid, eq, hint);
  });

  /* Unit converter */
  var UNITS = {
    "Lambai": { m: 1, km: 1000, cm: 0.01, mm: 0.001, mile: 1609.344, yard: 0.9144, foot: 0.3048, inch: 0.0254 },
    "Wajan": { kg: 1, g: 0.001, mg: 0.000001, tonne: 1000, pound: 0.45359237, ounce: 0.028349523 },
    "Kshetrafal": { "m²": 1, "km²": 1000000, hectare: 10000, acre: 4046.8564, "ft²": 0.09290304 },
    "Aaytan": { litre: 1, ml: 0.001, "gallon (US)": 3.785411784, cup: 0.2365882, "m³": 1000 },
    "Gati": { "m/s": 1, "km/h": 0.2777778, mph: 0.44704, knot: 0.5144444 },
    "Data": { B: 1, KB: 1024, MB: 1048576, GB: 1073741824 },
    "Taapman": { "°C": 1, "°F": 1, K: 1 }
  };
  D("d_unit", "daily", "tool", "Unit Converter", "Lambai, wajan, taapman...", function (root) {
    var cat = h("select", "select"), from = h("select", "select"), to = h("select", "select");
    var v = inp("number", "1"); v.inputMode = "decimal";
    var out = h("div", "card st-big", "");
    Object.keys(UNITS).forEach(function (k) { var o = h("option", "", k); o.value = k; cat.append(o); });
    function fill() {
      from.textContent = ""; to.textContent = "";
      Object.keys(UNITS[cat.value]).forEach(function (u, ix) {
        var a = h("option", "", u); a.value = u; from.append(a);
        var b = h("option", "", u); b.value = u; to.append(b);
      });
      to.selectedIndex = 1;
      calc();
    }
    function calc() {
      var n = parseFloat(v.value);
      if (isNaN(n)) { out.textContent = "Number likho"; return; }
      var r;
      if (cat.value === "Taapman") {
        var c = from.value === "°C" ? n : from.value === "°F" ? (n - 32) * 5 / 9 : n - 273.15;
        r = to.value === "°C" ? c : to.value === "°F" ? c * 9 / 5 + 32 : c + 273.15;
      } else {
        var f = UNITS[cat.value];
        r = n * f[from.value] / f[to.value];
      }
      out.textContent = n + " " + from.value + " = " + Number(r.toPrecision(10)) + " " + to.value;
    }
    cat.onchange = fill; from.onchange = calc; to.onchange = calc; v.oninput = calc;
    root.append(field("Kya naapna hai", cat), field("Value", v), field("Se", from), field("Mein", to), out);
    fill();
  });

  /* Age + Date */
  D("d_age", "daily", "cal", "Age Calculator", "Umar nikalo", function (root) {
    var d = inp("date", "");
    var out = h("div", "card st-big", "Janm tareekh chuno");
    d.onchange = function () {
      var b = new Date(d.value), n = new Date();
      if (isNaN(b)) { out.textContent = "Tareekh sahi nahi hai"; return; }
      if (b > n) { out.textContent = "Janm tareekh aage ki hai"; return; }
      var y = n.getFullYear() - b.getFullYear(), m = n.getMonth() - b.getMonth(), dd = n.getDate() - b.getDate();
      if (dd < 0) { m--; dd += new Date(n.getFullYear(), n.getMonth(), 0).getDate(); }
      if (m < 0) { y--; m += 12; }
      var total = Math.floor((n - b) / 86400000);
      var nb = new Date(n.getFullYear(), b.getMonth(), b.getDate());
      if (nb < new Date(n.getFullYear(), n.getMonth(), n.getDate())) nb.setFullYear(n.getFullYear() + 1);
      var left = Math.ceil((nb - n) / 86400000);
      out.textContent = y + " saal, " + m + " mahine, " + dd + " din\nKul " + total + " din\nAgla janmdin " + left + " din baad";
      out.style.whiteSpace = "pre-line";
    };
    root.append(field("Janm tareekh", d), out);
  });
  D("d_date", "daily", "cal", "Date Calculator", "Do tareekhon ka antar", function (root) {
    var a = inp("date", ""), b = inp("date", "");
    var out = h("div", "card st-big", "Do tareekh chuno"); out.style.whiteSpace = "pre-line";
    var n = inp("number", "30"); n.inputMode = "numeric";
    var out2 = h("div", "card st-big", "");
    function diff() {
      var x = new Date(a.value), y = new Date(b.value);
      if (isNaN(x) || isNaN(y)) { out.textContent = "Do tareekh chuno"; return; }
      var days = Math.round((y - x) / 86400000);
      out.textContent = Math.abs(days) + " din (" + (Math.abs(days) / 7).toFixed(1) + " hafte)";
    }
    function plus() {
      var x = new Date(a.value), k = parseInt(n.value, 10);
      if (isNaN(x) || isNaN(k)) { out2.textContent = ""; return; }
      x.setDate(x.getDate() + k);
      out2.textContent = "Pehli tareekh + " + k + " din = " + x.toDateString();
    }
    a.onchange = function () { diff(); plus(); }; b.onchange = diff; n.oninput = plus;
    root.append(field("Pehli tareekh", a), field("Doosri tareekh", b), out, field("Pehli tareekh mein itne din jodo", n), out2);
  });

  /* Password */
  D("d_pass", "daily", "lock", "Password Generator", "Majboot password", function (root) {
    var len = inp("range", "16"); len.min = 8; len.max = 40;
    var lab = h("div", "st-prov", "Lambai: 16");
    var cb = function (t, on) { var l = h("label", "st-check"); var c = h("input"); c.type = "checkbox"; c.checked = on; l.append(c, document.createTextNode(" " + t)); return [l, c]; };
    var up = cb("ABC", true), lo = cb("abc", true), nu = cb("123", true), sy = cb("#$%", true);
    var out = h("div", "card st-big", ""); out.style.wordBreak = "break-all"; out.style.fontFamily = "monospace";
    function gen() {
      var set = (up[1].checked ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ" : "") + (lo[1].checked ? "abcdefghijklmnopqrstuvwxyz" : "") + (nu[1].checked ? "0123456789" : "") + (sy[1].checked ? "!@#$%^&*()-_=+[]{};:,.?" : "");
      if (!set) { out.textContent = "Kam se kam ek option chuno"; return; }
      var n = parseInt(len.value, 10), arr = new Uint32Array(n), s = "";
      crypto.getRandomValues(arr);
      for (var i = 0; i < n; i++) s += set.charAt(arr[i] % set.length);
      out.textContent = s;
    }
    len.oninput = function () { lab.textContent = "Lambai: " + len.value; gen(); };
    [up, lo, nu, sy].forEach(function (x) { x[1].onchange = gen; });
    root.append(lab, len, row(up[0], lo[0]), row(nu[0], sy[0]), out, row(btn("Naya banao", "btn-primary", gen), btn("Copy", "", function () { if (out.textContent && out.textContent.indexOf("option") < 0) copyText(out.textContent); })));
    gen();
  });

  /* Text tools */
  D("d_count", "daily", "file", "Word & Character Counter", "Shabd aur akshar gino", function (root) {
    var ta = h("textarea", "input"); ta.rows = 8; ta.placeholder = "Text yahan likho ya chipkao";
    var out = h("div", "card", "");
    out.style.whiteSpace = "pre-line";
    function upd() {
      var t = ta.value, w = (t.trim().match(/\S+/g) || []).length;
      out.textContent = "Shabd: " + w + "\nAkshar: " + t.length + "\nBina space ke akshar: " + t.replace(/\s/g, "").length + "\nVaakya: " + (t.match(/[^.!?।]+[.!?।]/g) || []).length + "\nLines: " + (t ? t.split("\n").length : 0) + "\nPadhne ka samay: ~" + Math.max(w ? 1 : 0, Math.ceil(w / 200)) + " min";
    }
    ta.oninput = upd; upd();
    root.append(ta, out);
  });
  D("d_case", "daily", "file", "Case Converter", "UPPER / lower / Title", function (root) {
    var ta = h("textarea", "input"); ta.rows = 6; ta.placeholder = "Text yahan likho";
    function w(fn) { return function () { ta.value = fn(ta.value); }; }
    var title = function (s) { return s.toLowerCase().replace(/(^|\s)\S/g, function (c) { return c.toUpperCase(); }); };
    var sent = function (s) { return s.toLowerCase().replace(/(^\s*|[.!?]\s+)([a-z])/g, function (m, a, b) { return a + b.toUpperCase(); }); };
    root.append(ta, row(btn("UPPER", "", w(function (s) { return s.toUpperCase(); })), btn("lower", "", w(function (s) { return s.toLowerCase(); }))), row(btn("Title Case", "", w(title)), btn("Sentence case", "", w(sent))), btn("Copy", "btn-primary btn-block", function () { copyText(ta.value); }));
  });
  D("d_clean", "daily", "file", "Text Cleaner", "Faltu space/lines hatao", function (root) {
    var ta = h("textarea", "input"); ta.rows = 8; ta.placeholder = "Text yahan chipkao";
    function w(fn) { return function () { ta.value = fn(ta.value); }; }
    root.append(ta,
      row(btn("Extra space hatao", "", w(function (s) { return s.replace(/[ \t]+/g, " ").replace(/^ +| +$/gm, ""); })), btn("Khali lines hatao", "", w(function (s) { return s.replace(/\n\s*\n+/g, "\n").trim(); }))),
      row(btn("Dohri lines hatao", "", w(function (s) { var seen = {}; return s.split("\n").filter(function (l) { if (seen[l]) return false; seen[l] = 1; return true; }).join("\n"); })), btn("Lines sort karo", "", w(function (s) { return s.split("\n").sort().join("\n"); }))),
      btn("Copy", "btn-primary btn-block", function () { copyText(ta.value); }));
  });
  D("d_json", "daily", "code", "JSON Formatter & Validator", "Sahi karo, check karo", function (root) {
    var ta = h("textarea", "input"); ta.rows = 10; ta.placeholder = "JSON yahan chipkao"; ta.style.fontFamily = "monospace";
    var msg = h("div", "st-prov", "");
    function w(fn) { return function () { try { var o = JSON.parse(ta.value); ta.value = fn(o); msg.textContent = "JSON sahi hai"; } catch (e) { msg.textContent = "JSON galat hai: " + e.message; } }; }
    root.append(ta, row(btn("Format", "", w(function (o) { return JSON.stringify(o, null, 2); })), btn("Minify", "", w(function (o) { return JSON.stringify(o); })), btn("Check", "", w(function (o) { return ta.value; }))), msg, btn("Copy", "btn-primary btn-block", function () { copyText(ta.value); }));
  });

  /* Notes + To-do */
  D("d_notes", "daily", "pen", "Notes", "Apne notes (sirf is phone mein)", function (root) {
    var ta = h("textarea", "input"); ta.rows = 5; ta.placeholder = "Naya note likho";
    var list = h("div", "");
    function draw() {
      var items = store.get("toxic.st.notes", []);
      list.textContent = "";
      if (!items.length) { list.append(h("div", "empty", "Abhi koi note nahi")); return; }
      items.forEach(function (n, ix) {
        var c = h("div", "card"); c.style.whiteSpace = "pre-wrap"; c.textContent = n.t;
        var del = btn("Delete", "", function () { if (confirm("Ye note delete karein?")) { items.splice(ix, 1); store.set("toxic.st.notes", items); draw(); } });
        var cp = btn("Copy", "", function () { copyText(n.t); });
        c.append(h("div", "st-prov", new Date(n.d).toLocaleString()), row(cp, del));
        list.append(c);
      });
    }
    root.append(ta, btn("Save karo", "btn-primary btn-block", function () {
      var t = ta.value.trim(); if (!t) { say("Pehle kuch likho"); return; }
      var items = store.get("toxic.st.notes", []); items.unshift({ t: t.slice(0, 4000), d: Date.now() });
      store.set("toxic.st.notes", items.slice(0, 200)); ta.value = ""; draw(); say("Save ho gaya");
    }), list);
    draw();
  });
  D("d_todo", "daily", "list", "To-Do List", "Kaam ki list", function (root) {
    var i = inp("text", ""); i.placeholder = "Naya kaam likho"; i.maxLength = 200;
    var list = h("div", "");
    function draw() {
      var items = store.get("toxic.st.todo", []);
      list.textContent = "";
      if (!items.length) { list.append(h("div", "empty", "Koi kaam nahi")); return; }
      items.forEach(function (it, ix) {
        var r = h("div", "list-item");
        var c = h("input"); c.type = "checkbox"; c.checked = !!it.done;
        c.onchange = function () { it.done = c.checked; store.set("toxic.st.todo", items); draw(); };
        var m = h("div", "meta"); var t = h("div", "title", it.t); t.style.whiteSpace = "normal"; if (it.done) t.style.textDecoration = "line-through";
        m.append(t);
        var d = btn("Delete", "", function () { items.splice(ix, 1); store.set("toxic.st.todo", items); draw(); });
        d.style.padding = "8px 12px"; d.style.minHeight = "0";
        r.append(c, m, d);
        r.onclick = null;
        list.append(r);
      });
    }
    function add() { var t = i.value.trim(); if (!t) return; var items = store.get("toxic.st.todo", []); items.unshift({ t: t, done: false }); store.set("toxic.st.todo", items.slice(0, 300)); i.value = ""; draw(); }
    root.append(i, btn("Jodo", "btn-primary btn-block", add), list);
    draw();
  });

  /* Stopwatch + Timer */
  D("d_stop", "daily", "sw", "Stopwatch", "Start, Lap, Reset", function (root) {
    var out = h("div", "card st-big", "00:00.00"); out.style.textAlign = "center"; out.style.fontSize = "38px";
    var laps = h("div", "");
    var t0 = 0, acc = 0, run = false, tid = null;
    function fmt(ms) { var c = Math.floor(ms / 10) % 100, s = Math.floor(ms / 1000) % 60, m = Math.floor(ms / 60000); return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0") + "." + String(c).padStart(2, "0"); }
    function tick() { out.textContent = fmt(acc + (run ? Date.now() - t0 : 0)); }
    var go = btn("Start", "btn-primary", function () {
      if (run) { acc += Date.now() - t0; run = false; clearInterval(tid); go.textContent = "Start"; }
      else { t0 = Date.now(); run = true; tid = setInterval(tick, 40); go.textContent = "Stop"; }
    });
    var lap = btn("Lap", "", function () { if (!run && !acc) return; var d = h("div", "list-item", ""); d.textContent = "Lap " + (laps.children.length + 1) + ": " + out.textContent; laps.prepend(d); });
    var rs = btn("Reset", "", function () { run = false; clearInterval(tid); acc = 0; out.textContent = "00:00.00"; go.textContent = "Start"; laps.textContent = ""; });
    root.append(out, row(go, lap, rs), laps);
    root._cleanup = function () { clearInterval(tid); };
  });
  D("d_timer", "daily", "clock", "Timer", "Ginti ulti", function (root) {
    var mi = inp("number", "1"), se = inp("number", "0");
    mi.min = 0; se.min = 0; mi.inputMode = se.inputMode = "numeric";
    var out = h("div", "card st-big", "01:00"); out.style.textAlign = "center"; out.style.fontSize = "38px";
    var left = 0, tid = null, endAt = 0;
    function show(ms) { var s = Math.ceil(ms / 1000); out.textContent = String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); }
    function beep() {
      try { var c = new (window.AudioContext || window.webkitAudioContext)(), o = c.createOscillator(); o.connect(c.destination); o.frequency.value = 880; o.start(); setTimeout(function () { o.stop(); c.close(); }, 900); } catch (e) {}
      if (navigator.vibrate) navigator.vibrate([300, 150, 300]);
    }
    function start() {
      if (tid) return;
      if (!left) left = ((parseInt(mi.value, 10) || 0) * 60 + (parseInt(se.value, 10) || 0)) * 1000;
      if (left <= 0) { say("Samay likho"); return; }
      endAt = Date.now() + left;
      tid = setInterval(function () {
        left = endAt - Date.now();
        if (left <= 0) { clearInterval(tid); tid = null; left = 0; out.textContent = "00:00"; beep(); say("Samay poora hua"); }
        else show(left);
      }, 200);
    }
    root.append(row(field("Minute", mi), field("Second", se)), out, row(btn("Start", "btn-primary", start), btn("Pause", "", function () { if (tid) { clearInterval(tid); tid = null; left = endAt - Date.now(); } }), btn("Reset", "", function () { clearInterval(tid); tid = null; left = 0; show(((parseInt(mi.value, 10) || 0) * 60 + (parseInt(se.value, 10) || 0)) * 1000); })));
    root._cleanup = function () { clearInterval(tid); };
  });

  /* Calendar */
  D("d_cal", "daily", "cal", "Calendar", "Mahina dekho", function (root) {
    var cur = new Date(); cur.setDate(1);
    var title = h("h3", ""); title.style.textAlign = "center"; title.style.margin = "4px 0";
    var grid = h("div", "st-cal");
    var M = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    function draw() {
      title.textContent = M[cur.getMonth()] + " " + cur.getFullYear();
      grid.textContent = "";
      ["Ravi", "Som", "Mangal", "Budh", "Guru", "Shukra", "Shani"].forEach(function (d) { grid.append(h("b", "st-cal-h", d.slice(0, 3))); });
      var first = cur.getDay(), days = new Date(cur.getFullYear(), cur.getMonth() + 1, 0).getDate(), now = new Date();
      for (var i = 0; i < first; i++) grid.append(h("span"));
      for (var d = 1; d <= days; d++) {
        var c = h("span", "st-cal-d", String(d));
        if (d === now.getDate() && cur.getMonth() === now.getMonth() && cur.getFullYear() === now.getFullYear()) c.classList.add("today");
        grid.append(c);
      }
    }
    root.append(row(btn("‹", "", function () { cur.setMonth(cur.getMonth() - 1); draw(); }), title, btn("›", "", function () { cur.setMonth(cur.getMonth() + 1); draw(); })), grid);
    draw();
  });

  /* Colors */
  function hexToRgb(x) { var n = parseInt(x.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function toHex(r, g, b) { return "#" + [r, g, b].map(function (v) { return v.toString(16).padStart(2, "0"); }).join("").toUpperCase(); }
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, hh = 0, s = 0;
    if (mx !== mn) {
      var d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      hh = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; hh *= 60;
    }
    return [Math.round(hh), Math.round(s * 100), Math.round(l * 100)];
  }
  D("d_color", "daily", "palette", "Color Picker", "HEX / RGB / HSL", function (root) {
    var c = inp("color", "#7055E8"); c.style.height = "64px"; c.style.padding = "4px";
    var out = h("div", "card", ""); out.style.whiteSpace = "pre-line";
    function upd() { var r = hexToRgb(c.value), hs = rgbToHsl(r[0], r[1], r[2]); out.textContent = "HEX: " + c.value.toUpperCase() + "\nRGB: " + r.join(", ") + "\nHSL: " + hs[0] + "°, " + hs[1] + "%, " + hs[2] + "%"; }
    c.oninput = upd; upd();
    root.append(c, out, btn("HEX copy karo", "btn-primary btn-block", function () { copyText(c.value.toUpperCase()); }));
  });

  /* ---------- Photo ---------- */
  function pickImage(cb, opts) {
    var f = h("input"); f.type = "file"; f.accept = "image/*"; if (opts && opts.camera) f.capture = "environment"; if (opts && opts.multiple) f.multiple = true;
    f.onchange = function () { if (f.files && f.files.length) cb(Array.prototype.slice.call(f.files)); };
    f.click();
  }
  function loadImg(file) {
    return new Promise(function (res, rej) {
      var u = URL.createObjectURL(file), im = new Image();
      im.onload = function () { URL.revokeObjectURL(u); res(im); };
      im.onerror = function () { URL.revokeObjectURL(u); rej(new Error("Photo khul nahi payi")); };
      im.src = u;
    });
  }
  D("p_edit", "photo", "image", "Photo Editor", "Crop, resize, rotate, filter, compress", function (root) {
    var img = null, name = "photo";
    var cv = h("canvas", "st-canvas"); cv.hidden = true;
    var info = h("div", "st-prov", "Pehle photo chuno");
    var P = { w: 0, h: 0, rot: 0, fh: false, fv: false, br: 100, ct: 100, filt: "none", cl: 0, ct2: 0, cr: 0, cb: 0, fmt: "image/jpeg", ql: 85 };
    var ctrls = h("div", ""); ctrls.hidden = true;
    var wI = inp("number", ""), hI = inp("number", ""); wI.inputMode = hI.inputMode = "numeric";
    var ratio = 1;
    function sl(min, max, val, key, lab) {
      var r = inp("range", val); r.min = min; r.max = max;
      var l = h("div", "st-prov", lab + ": " + val);
      r.oninput = function () { P[key] = parseInt(r.value, 10); l.textContent = lab + ": " + r.value; draw(); };
      var w = h("div", ""); w.append(l, r); return w;
    }
    function draw() {
      if (!img) return;
      var sx = Math.round(img.naturalWidth * P.cl / 100), sy = Math.round(img.naturalHeight * P.ct2 / 100);
      var sw = Math.max(1, Math.round(img.naturalWidth * (1 - (P.cl + P.cr) / 100))), sh = Math.max(1, Math.round(img.naturalHeight * (1 - (P.ct2 + P.cb) / 100)));
      var tw = P.w || sw, th = P.h || sh;
      var swap = P.rot % 180 !== 0;
      cv.width = swap ? th : tw; cv.height = swap ? tw : th;
      var ctx = cv.getContext("2d");
      var f = "brightness(" + P.br + "%) contrast(" + P.ct + "%)";
      if (P.filt === "gray") f += " grayscale(100%)"; else if (P.filt === "sepia") f += " sepia(100%)"; else if (P.filt === "invert") f += " invert(100%)"; else if (P.filt === "blur") f += " blur(2px)";
      ctx.save();
      ctx.filter = f;
      if (P.fmt === "image/jpeg") { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, cv.width, cv.height); }
      ctx.translate(cv.width / 2, cv.height / 2);
      ctx.rotate(P.rot * Math.PI / 180);
      ctx.scale(P.fh ? -1 : 1, P.fv ? -1 : 1);
      ctx.drawImage(img, sx, sy, sw, sh, -tw / 2, -th / 2, tw, th);
      ctx.restore();
      info.textContent = "Size: " + cv.width + " x " + cv.height + " px";
    }
    function setSize(w) { P.w = w; P.h = Math.round(w / ratio); wI.value = P.w; hI.value = P.h; }
    function load(file) {
      loadImg(file).then(function (im) {
        img = im; name = file.name.replace(/\.[^.]+$/, "") || "photo";
        ratio = im.naturalWidth / im.naturalHeight;
        P.rot = 0; P.fh = P.fv = false; P.br = P.ct = 100; P.filt = "none"; P.cl = P.ct2 = P.cr = P.cb = 0;
        var w0 = Math.min(im.naturalWidth, 4000);
        setSize(w0);
        cv.hidden = false; ctrls.hidden = false;
        build(); draw();
      }, function (e) { say(e.message); });
    }
    wI.oninput = function () { var w = parseInt(wI.value, 10); if (w > 0 && w <= 8000) { setSize(w); draw(); } };
    hI.oninput = function () { var hh = parseInt(hI.value, 10); if (hh > 0 && hh <= 8000) { P.h = hh; P.w = Math.round(hh * ratio); wI.value = P.w; draw(); } };
    function build() {
      ctrls.textContent = "";
      var filt = h("select", "select");
      [["none", "Filter: koi nahi"], ["gray", "Black & White"], ["sepia", "Sepia"], ["invert", "Invert"], ["blur", "Halka blur"]].forEach(function (o) { var op = h("option", "", o[1]); op.value = o[0]; filt.append(op); });
      filt.onchange = function () { P.filt = filt.value; draw(); };
      var fmt = h("select", "select");
      [["image/jpeg", "JPG"], ["image/png", "PNG"], ["image/webp", "WEBP"]].forEach(function (o) { var op = h("option", "", o[1]); op.value = o[0]; fmt.append(op); });
      fmt.onchange = function () { P.fmt = fmt.value; draw(); };
      var ql = sl(20, 100, 85, "ql", "Quality (JPG/WEBP)");
      ctrls.append(
        row(field("Chaudai (px)", wI), field("Unchai (px)", hI)),
        row(btn("Ghumao 90°", "", function () { P.rot = (P.rot + 90) % 360; draw(); }), btn("Ulta (left-right)", "", function () { P.fh = !P.fh; draw(); }), btn("Ulta (upar-neeche)", "", function () { P.fv = !P.fv; draw(); })),
        sl(0, 200, 100, "br", "Brightness"), sl(0, 200, 100, "ct", "Contrast"), filt,
        h("div", "st-prov", "Crop (kinare se kitna kaatna hai, %)"),
        sl(0, 45, 0, "cl", "Left"), sl(0, 45, 0, "cr", "Right"), sl(0, 45, 0, "ct2", "Top"), sl(0, 45, 0, "cb", "Bottom"),
        field("Format", fmt), ql,
        btn("Download karo", "btn-primary btn-block", function () {
          draw();
          cv.toBlob(function (b) {
            if (!b) { say("Photo nahi ban payi"); return; }
            var ext = P.fmt === "image/png" ? "png" : P.fmt === "image/webp" ? "webp" : "jpg";
            saveBlob(b, name + "-toxic." + ext); say("Size: " + fmtSize(b.size));
          }, P.fmt, P.ql / 100);
        })
      );
    }
    root.append(row(btn("Gallery se chuno", "btn-primary", function () { pickImage(function (f) { load(f[0]); }); }), btn("Camera", "", function () { pickImage(function (f) { load(f[0]); }, { camera: true }); })), info, cv, ctrls);
  });
  D("p_color", "photo", "palette", "Image Color Extractor", "Photo ke mukhya rang", function (root) {
    var cv = h("canvas"); var out = h("div", "st-sw");
    root.append(btn("Photo chuno", "btn-primary btn-block", function () {
      pickImage(function (f) {
        loadImg(f[0]).then(function (im) {
          cv.width = 64; cv.height = 64;
          var ctx = cv.getContext("2d"); ctx.drawImage(im, 0, 0, 64, 64);
          var d = ctx.getImageData(0, 0, 64, 64).data, cnt = {};
          for (var i = 0; i < d.length; i += 4) { var k = (d[i] >> 5) + "," + (d[i + 1] >> 5) + "," + (d[i + 2] >> 5); cnt[k] = (cnt[k] || 0) + 1; }
          var top = Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a]; }).slice(0, 6);
          out.textContent = "";
          top.forEach(function (k) {
            var p = k.split(",").map(function (x) { return Math.min(255, parseInt(x, 10) * 32 + 16); });
            var hx = toHex(p[0], p[1], p[2]);
            var s = h("button", "st-swatch", hx); s.style.background = hx; s.style.color = (p[0] * 0.3 + p[1] * 0.59 + p[2] * 0.11) > 140 ? "#000" : "#fff";
            s.onclick = function () { copyText(hx); };
            out.append(s);
          });
        }, function (e) { say(e.message); });
      });
    }), out);
  });

  /* ---------- Documents ---------- */
  function buildPdf(pages) {
    var enc = new TextEncoder(), chunks = [], len = 0, offs = [];
    function push(b) { var u = typeof b === "string" ? enc.encode(b) : b; chunks.push(u); len += u.length; }
    function obj(id, fn) { offs[id] = len; push(id + " 0 obj\n"); fn(); push("\nendobj\n"); }
    var n = pages.length;
    push("%PDF-1.4\n");
    obj(1, function () { push("<< /Type /Catalog /Pages 2 0 R >>"); });
    obj(2, function () { push("<< /Type /Pages /Count " + n + " /Kids [" + pages.map(function (_, i) { return (3 + 3 * i) + " 0 R"; }).join(" ") + "] >>"); });
    pages.forEach(function (p, i) {
      var pid = 3 + 3 * i, cid = 4 + 3 * i, iid = 5 + 3 * i;
      obj(pid, function () { push("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + p.w + " " + p.h + "] /Resources << /XObject << /Im0 " + iid + " 0 R >> >> /Contents " + cid + " 0 R >>"); });
      var content = "q " + p.w + " 0 0 " + p.h + " 0 0 cm /Im0 Do Q";
      obj(cid, function () { push("<< /Length " + content.length + " >>\nstream\n" + content + "\nendstream"); });
      obj(iid, function () { push("<< /Type /XObject /Subtype /Image /Width " + p.pw + " /Height " + p.ph + " /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " + p.jpeg.length + " >>\nstream\n"); push(p.jpeg); push("\nendstream"); });
    });
    var total = 3 + 3 * n, xref = len, x = "xref\n0 " + total + "\n0000000000 65535 f \n";
    for (var id = 1; id < total; id++) x += String(offs[id]).padStart(10, "0") + " 00000 n \n";
    push(x + "trailer\n<< /Size " + total + " /Root 1 0 R >>\nstartxref\n" + xref + "\n%%EOF");
    return new Blob(chunks, { type: "application/pdf" });
  }
  D("f_pdf", "pdf", "file", "Images to PDF", "Photos se PDF banao", function (root) {
    var list = h("div", "st-prov", "Photos chuno (max 20)");
    var files = [];
    root.append(
      btn("Photos chuno", "btn-primary btn-block", function () { pickImage(function (f) { files = f.slice(0, 20); list.textContent = files.length + " photo chuni gayi"; }, { multiple: true }); }),
      list,
      btn("PDF banao", "btn-block", function () {
        if (!files.length) { say("Pehle photos chuno"); return; }
        say("PDF ban rahi hai...");
        var pages = [];
        files.reduce(function (p, f) {
          return p.then(function () { return loadImg(f); }).then(function (im) {
            var s = Math.min(1, 1600 / Math.max(im.naturalWidth, im.naturalHeight));
            var cv = document.createElement("canvas"); cv.width = Math.round(im.naturalWidth * s); cv.height = Math.round(im.naturalHeight * s);
            var ctx = cv.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, cv.width, cv.height); ctx.drawImage(im, 0, 0, cv.width, cv.height);
            var b64 = cv.toDataURL("image/jpeg", 0.85).split(",")[1], bin = atob(b64), u = new Uint8Array(bin.length);
            for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
            pages.push({ w: Math.round(cv.width * 0.75), h: Math.round(cv.height * 0.75), pw: cv.width, ph: cv.height, jpeg: u });
          });
        }, Promise.resolve()).then(function () {
          saveBlob(buildPdf(pages), "toxic-images.pdf"); say("PDF ban gayi");
        }, function (e) { say(e.message || "PDF nahi ban payi"); });
      })
    );
  });
  D("f_view", "pdf", "file", "File Viewer (TXT / CSV / JSON)", "Padho aur text nikalo", function (root) {
    var out = h("div", "");
    var pick = btn("File chuno", "btn-primary btn-block", function () {
      var f = h("input"); f.type = "file"; f.accept = ".txt,.md,.csv,.json,.log,text/plain,text/csv,application/json";
      f.onchange = function () {
        var file = f.files[0]; if (!file) return;
        if (file.size > 2097152) { say("File 2 MB se badi hai"); return; }
        var r = new FileReader();
        r.onload = function () {
          var t = String(r.result), n = file.name.toLowerCase();
          out.textContent = "";
          out.append(h("div", "st-prov", file.name + " (" + fmtSize(file.size) + ")"));
          if (/\.csv$/.test(n)) {
            var rows = t.split(/\r?\n/).filter(Boolean).slice(0, 200).map(function (l) { var res = [], cur = "", q2 = false; for (var i = 0; i < l.length; i++) { var c = l[i]; if (c === '"') q2 = !q2; else if (c === "," && !q2) { res.push(cur); cur = ""; } else cur += c; } res.push(cur); return res; });
            var wrap = h("div", "st-scroll"), tb = h("table", "st-table");
            rows.forEach(function (rw, ri) { var tr = h("tr"); rw.forEach(function (c) { tr.append(h(ri === 0 ? "th" : "td", "", c)); }); tb.append(tr); });
            wrap.append(tb); out.append(wrap);
          } else {
            if (/\.json$/.test(n)) { try { t = JSON.stringify(JSON.parse(t), null, 2); } catch (e) {} }
            var pre = h("pre", "st-pre"); pre.textContent = t.slice(0, 200000); out.append(pre);
            out.append(btn("Text copy karo", "btn-block", function () { copyText(t); }));
          }
        };
        r.readAsText(file);
      };
      f.click();
    });
    root.append(pick, out);
  });
  D("f_pdfview", "pdf", "file", "PDF Viewer", "PDF browser mein kholo", function (root) {
    root.append(h("div", "st-prov", "PDF aapke phone ke browser/viewer mein khulegi. File kahin upload nahi hoti."),
      btn("PDF chuno", "btn-primary btn-block", function () {
        var f = h("input"); f.type = "file"; f.accept = "application/pdf,.pdf";
        f.onchange = function () { var file = f.files[0]; if (!file) return; var u = URL.createObjectURL(file); var w = window.open(u, "_blank"); if (!w) say("Naya tab khulne nahi diya. Popup allow karo."); };
        f.click();
      }));
  });

  /* ---------- Video ---------- */
  D("vd_info", "video", "video", "Video Info & Thumbnail", "Jaankari aur frame photo", function (root) {
    var vd = h("video"); vd.controls = true; vd.playsInline = true; vd.style.width = "100%"; vd.hidden = true;
    var info = h("div", "card", "Video chuno"); info.style.whiteSpace = "pre-line";
    var cv = h("canvas", "st-canvas"); cv.hidden = true;
    var save = btn("Is frame ko photo banao", "btn-primary btn-block", function () {
      if (!vd.videoWidth) return;
      cv.width = vd.videoWidth; cv.height = vd.videoHeight; cv.hidden = false;
      cv.getContext("2d").drawImage(vd, 0, 0);
      cv.toBlob(function (b) { if (b) saveBlob(b, "thumbnail.png"); else say("Photo nahi ban payi"); }, "image/png");
    });
    save.hidden = true;
    root.append(btn("Video chuno", "btn-primary btn-block", function () {
      var f = h("input"); f.type = "file"; f.accept = "video/*";
      f.onchange = function () {
        var file = f.files[0]; if (!file) return;
        vd.src = URL.createObjectURL(file); vd.hidden = false; save.hidden = false;
        vd.onloadedmetadata = function () {
          var d = vd.duration || 0;
          info.textContent = "Naam: " + file.name + "\nSize: " + fmtSize(file.size) + "\nLambai: " + Math.floor(d / 60) + " min " + Math.round(d % 60) + " sec\nResolution: " + vd.videoWidth + " x " + vd.videoHeight;
        };
        vd.onerror = function () { info.textContent = "Ye video is browser mein nahi khul payi"; };
      };
      f.click();
    }), info, vd, save, cv);
  });

  /* ---------- Voice ---------- */
  D("vo_tts", "voice", "speaker", "Text to Speech", "Text ko awaaz mein sunao", function (root) {
    if (!("speechSynthesis" in window)) { root.append(h("div", "empty", "Is browser mein awaaz ki suvidha nahi hai")); return; }
    var ta = h("textarea", "input"); ta.rows = 6; ta.placeholder = "Jo sunna hai wo likho";
    var lang = h("select", "select");
    [["hi-IN", "Hindi"], ["en-IN", "English (India)"], ["en-US", "English (US)"]].forEach(function (o) { var op = h("option", "", o[1]); op.value = o[0]; lang.append(op); });
    var rate = inp("range", "1"); rate.min = "0.5"; rate.max = "1.5"; rate.step = "0.1";
    var rl = h("div", "st-prov", "Raftaar: 1");
    rate.oninput = function () { rl.textContent = "Raftaar: " + rate.value; };
    function speak() {
      var t = ta.value.trim(); if (!t) { say("Pehle kuch likho"); return; }
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(t.slice(0, 3000)); u.lang = lang.value; u.rate = parseFloat(rate.value);
      var v = speechSynthesis.getVoices().filter(function (x) { return x.lang && x.lang.toLowerCase().indexOf(lang.value.slice(0, 2).toLowerCase()) === 0; })[0];
      if (v) u.voice = v;
      speechSynthesis.speak(u);
    }
    root.append(ta, field("Bhasha", lang), rl, rate, row(btn("Bolo", "btn-primary", speak), btn("Pause", "", function () { speechSynthesis.pause(); }), btn("Jaari", "", function () { speechSynthesis.resume(); }), btn("Roko", "", function () { speechSynthesis.cancel(); })),
      h("div", "st-prov", "Awaaz aapke phone ki hai. Phone ki Settings > Text-to-speech mein behtar awaaz chun sakte hain."));
    root._cleanup = function () { speechSynthesis.cancel(); };
  });
  D("vo_stt", "voice", "mic", "Voice to Text", "Bolkar likho", function (root) {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { root.append(h("div", "empty", "Is browser mein bolkar likhne ki suvidha nahi hai (Chrome mein try karo)")); return; }
    var ta = h("textarea", "input"); ta.rows = 8; ta.placeholder = "Yahan aapki baat likhi jayegi";
    var lang = h("select", "select");
    [["hi-IN", "Hindi"], ["en-IN", "English (India)"], ["en-US", "English (US)"]].forEach(function (o) { var op = h("option", "", o[1]); op.value = o[0]; lang.append(op); });
    var rec = null, on = false;
    var go = btn("Bolna shuru karo", "btn-primary btn-block", function () {
      if (on && rec) { rec.stop(); return; }
      rec = new SR(); rec.lang = lang.value; rec.interimResults = false; rec.continuous = true;
      rec.onresult = function (e) { for (var i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) ta.value += (ta.value ? " " : "") + e.results[i][0].transcript; };
      rec.onend = function () { on = false; go.textContent = "Bolna shuru karo"; };
      rec.onerror = function () { say("Mic nahi chal paya. Permission check karo."); };
      try { rec.start(); on = true; go.textContent = "Ruko (sun raha hoon...)"; } catch (e) { say("Mic shuru nahi hua"); }
    });
    root.append(field("Bhasha", lang), go, ta, btn("Copy karo", "btn-block", function () { copyText(ta.value); }),
      h("div", "st-prov", "Dhyan: Chrome mein bolne ki awaaz pehchan ke liye Google ko ja sakti hai."));
    root._cleanup = function () { if (rec && on) rec.stop(); };
  });

  /* ---------- Sab tools ek jagah ---------- */
  var ALL = AI.concat(B);
  var CATS = [["all", "All"], ["writer", "Writer"], ["code", "Code"], ["study", "Study"], ["daily", "Daily"], ["photo", "Photo"], ["pdf", "Docs"], ["video", "Video"], ["voice", "Voice"]];
  var CAT_ICON = { writer: "pen", code: "code", study: "book", daily: "calc", photo: "image", pdf: "file", video: "video", voice: "speaker" };
  function byId(id) { for (var i = 0; i < ALL.length; i++) if (ALL[i].id === id) return ALL[i]; return null; }

  var cat = "all", query = "", openTool = null, cleanup = null;
  var screen, bodyEl, titleEl, backBtn;

  function card(t) {
    var b = h("button", "tool st-card"); b.type = "button";
    var ic = icon(TOOL_IC[t.id] || t.ic, 24); ic.classList.add("st-ico-box");
    b.append(ic, h("b", "", t.name), h("small", "", t.desc));
    b.onclick = function () { open(t); };
    return b;
  }
  function section(title, list) {
    if (!list.length) return null;
    var w = h("div", ""); w.append(h("div", "section-title", title));
    var g = h("div", "grid"); list.forEach(function (t) { g.append(card(t)); }); w.append(g);
    return w;
  }

  function renderList() {
    if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; }
    openTool = null;
    backBtn.hidden = true; titleEl.textContent = "Studio";
    bodyEl.textContent = "";
    var s = h("input", "input"); s.type = "search"; s.placeholder = "Tools search karo"; s.value = query;
    s.oninput = function () { query = s.value; renderResults(); s.focus(); };
    var chips = h("div", "st-chips");
    CATS.forEach(function (c) {
      var ch = h("button", "st-chip" + (c[0] === cat ? " on" : ""), c[1]); ch.type = "button";
      ch.onclick = function () { cat = c[0]; renderList(); };
      chips.append(ch);
    });
    var res = h("div", ""); res.id = "stResults";
    bodyEl.append(s, chips, res);
    renderResults();
  }
  function renderResults() {
    var res = q("#stResults"); if (!res) return;
    res.textContent = "";
    var qq = query.trim().toLowerCase();
    var list = ALL.filter(function (t) { return (cat === "all" || t.cat === cat) && (!qq || (t.name + " " + t.desc).toLowerCase().indexOf(qq) > -1); });
    if (!qq && cat === "all") {
      var fav = store.get("toxic.st.fav", []).map(byId).filter(Boolean);
      var rec = store.get("toxic.st.recent", []).map(byId).filter(Boolean).slice(0, 6);
      var a = section("Favourite tools", fav); if (a) res.append(a);
      var b = section("Haal mein use kiye", rec); if (b) res.append(b);
      CATS.slice(1).forEach(function (c) { var s = section(c[1], ALL.filter(function (t) { return t.cat === c[0]; })); if (s) res.append(s); });
    } else if (!list.length) res.append(h("div", "empty", "Koi tool nahi mila"));
    else { var g = h("div", "grid"); list.forEach(function (t) { g.append(card(t)); }); res.append(g); }
  }

  function open(t) {
    if (!screen.classList.contains("active")) show("studio");
    openTool = t;
    var rec = store.get("toxic.st.recent", []).filter(function (x) { return x !== t.id; }); rec.unshift(t.id); store.set("toxic.st.recent", rec.slice(0, 10));
    bodyEl.textContent = "";
    titleEl.textContent = t.name; backBtn.hidden = false;
    var fav = store.get("toxic.st.fav", []);
    var star = btn("", "", function () {
      var f = store.get("toxic.st.fav", []), ix = f.indexOf(t.id);
      if (ix > -1) f.splice(ix, 1); else f.push(t.id);
      store.set("toxic.st.fav", f); paintStar();
    });
    function paintStar() { var on = store.get("toxic.st.fav", []).indexOf(t.id) > -1; star.textContent = ""; star.append(icon("star", 18, on)); star.append(document.createTextNode(on ? " Favourite hataao" : " Favourite banao")); }
    paintStar();
    var root = h("div", "st-tool");
    bodyEl.append(star, root);
    if (t.ai) aiUI(t, root); else t.run(root);
    if (root._cleanup) cleanup = root._cleanup;
    bodyEl.scrollTop = 0;
  }

  /* ---------- screen, nav, style jodna ---------- */
  var CSS = [
    ".st-ico{display:inline-grid;place-items:center;vertical-align:middle}",
    ".st-card .st-ico-box{display:grid;place-items:center;width:46px;height:46px;border-radius:14px;margin-bottom:10px;color:#fff;background:linear-gradient(135deg,#7055E8,#397BFF)}",
    ".st-card b{display:block;font-size:15px;line-height:1.25}",
    ".st-chips{display:flex;gap:8px;overflow-x:auto;padding:12px 0 4px;scrollbar-width:none}",
    ".st-chip{flex-shrink:0;border:1px solid var(--border);background:var(--card);color:var(--text);padding:8px 14px;border-radius:999px;font-size:14px;font-family:inherit;cursor:pointer}",
    ".st-chip.on{background:var(--grad);color:#fff;border:0}",
    ".st-tool{display:flex;flex-direction:column;gap:12px;margin-top:10px}",
    ".st-row{display:flex;gap:10px;flex-wrap:wrap}.st-row>*{flex:1;min-width:0}",
    ".st-field{display:flex;flex-direction:column;gap:6px}.st-lab{font-size:13px;color:var(--muted)}",
    ".st-prov{font-size:12px;color:var(--muted)}",
    ".st-big{font-size:18px;line-height:1.5}",
    ".st-actions{margin-top:10px}",
    "#screen-studio [hidden]{display:none!important}",
    ".st-keys{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.st-keys .btn{padding:12px 4px;font-size:18px}",
    ".st-check{display:flex;align-items:center;gap:6px;font-size:15px}",
    ".st-canvas{max-width:100%;height:auto;border-radius:12px;border:1px solid var(--border)}",
    ".st-sw{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}",
    ".st-swatch{height:64px;border-radius:12px;border:1px solid var(--border);font-weight:700;cursor:pointer}",
    ".st-scroll{overflow:auto;max-width:100%}.st-table{border-collapse:collapse;font-size:13px}",
    ".st-table th,.st-table td{border:1px solid var(--border);padding:6px 8px;white-space:nowrap}",
    ".st-pre{white-space:pre-wrap;word-break:break-word;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px;max-height:50vh;overflow:auto}",
    ".st-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;text-align:center}",
    ".st-cal-h{font-size:12px;color:var(--muted)}.st-cal-d{padding:10px 0;border-radius:10px;background:var(--card)}",
    ".st-cal-d.today{background:var(--grad);color:#fff}",
    "#bnav{display:flex;border-top:1px solid var(--border);background:var(--bg2);padding:6px 6px calc(env(safe-area-inset-bottom,0px) + 6px)}",
    "#bnav button{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;border:0;background:none;color:var(--muted);font-size:11px;font-family:inherit;padding:6px 0;cursor:pointer}",
    "#bnav button.on{color:var(--cyan)}",
    "#bnav.hide{display:none}"
  ].join("\n");

  function setup() {
    var app = q("#app");
    if (!app || q("#screen-studio")) return;
    var st = document.createElement("style"); st.textContent = CSS; document.head.append(st);

    screen = h("section", "screen"); screen.id = "screen-studio";
    var top = h("div", "topbar");
    var menu = h("button", "icon-btn menu-btn"); menu.type = "button"; menu.setAttribute("aria-label", "Menu kholo"); menu.append(icon("menu", 22));
    menu.onclick = function () { if (typeof openDrawer === "function") openDrawer(); };
    titleEl = h("h2", "", "Studio");
    backBtn = h("button", "icon-btn"); backBtn.type = "button"; backBtn.setAttribute("aria-label", "Peeche"); backBtn.append(icon("back", 22)); backBtn.hidden = true;
    backBtn.onclick = renderList;
    top.append(menu, titleEl, backBtn);
    bodyEl = h("div", "body");
    screen.append(top, bodyEl);
    var firstScreen = q("#screen-chat") || app.lastElementChild;
    app.insertBefore(screen, firstScreen);

    /* Drawer mein Studio button */
    var dnav = q(".d-nav");
    if (dnav) {
      var nb = h("button", "nav-btn"); nb.type = "button"; nb.dataset.go = "studio";
      var ic = h("span", "ico"); ic.append(icon("studio", 22));
      nb.append(ic, document.createTextNode("Studio"));
      nb.onclick = function () { show("studio"); };
      dnav.insertBefore(nb, dnav.children[2] || null);
    }

    /* Home par Studio shortcuts */
    var qt = q("#quickTools");
    if (qt && qt.parentNode) {
      var t = h("div", "section-title", "Studio");
      var g = h("div", "grid");
      [["writer", "Writer Studio", "pen"], ["code", "Code Studio", "code"], ["study", "Study Tools", "book"], ["daily", "Daily Tools", "calc"], ["photo", "Photo Studio", "image"], ["video", "Video & Voice", "video"]].forEach(function (c) {
        var b = h("button", "tool"); b.type = "button";
        var i = icon(c[2], 24); i.style.display = "grid"; i.style.marginBottom = "8px"; i.style.color = "var(--cyan)";
        b.append(i, h("b", "", c[1]));
        b.onclick = function () { cat = c[0] === "video" ? "video" : c[0]; query = ""; show("studio"); renderList(); };
        g.append(b);
      });
      qt.parentNode.insertBefore(t, qt.nextSibling);
      qt.parentNode.insertBefore(g, t.nextSibling);
    }

    /* Neeche ka navigation */
    var nav = h("nav", ""); nav.id = "bnav"; nav.setAttribute("aria-label", "Main navigation");
    var items = [["home", "Home", "home"], ["tools", "Tools", "grid"], ["studio", "Studio", "studio"], ["settings", "Settings", "settings"]];
    items.forEach(function (it) {
      var b = h("button", ""); b.type = "button"; b.dataset.go = it[0];
      b.append(icon(it[2], 22), document.createTextNode(it[1]));
      b.onclick = function () { show(it[0]); };
      nav.append(b);
    });
    app.append(nav);

    var orig = window.show;
    if (typeof orig === "function") {
      window.show = function (name) {
        if (name !== "studio" && cleanup) { try { cleanup(); } catch (e) {} cleanup = null; }
        orig(name);
        if (name === "studio" && !openTool) renderList();
        nav.classList.toggle("hide", name === "chat");
        Array.prototype.forEach.call(nav.children, function (b) { b.classList.toggle("on", b.dataset.go === name); });
      };
    }
    nav.children[0].classList.add("on");
    renderList();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", setup); else setup();
})();
