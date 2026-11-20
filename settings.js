"use strict";
/* TOXIC AI - nayi Settings (list wali). app.js / studio.js ko nahi chheda.
   Purane Theme / Custom Instructions / Privacy ke dibbe yahin ke andar rakhe gaye hain,
   isliye unke purane button waise hi kaam karte hain. Koi secret nahi. */
(function () {
  var screen = document.getElementById("screen-settings");
  if (!screen) return;
  var oldTop = screen.querySelector(".topbar");
  var oldBody = screen.querySelector(".body");
  if (!oldBody) return;

  var P = {"user":"<circle cx=\"12\" cy=\"7\" r=\"4\"/><path d=\"M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2\"/>","switch":"<path d=\"M16 3l4 4l-4 4\"/><path d=\"M10 7h10\"/><path d=\"M8 13l-4 4l4 4\"/><path d=\"M4 17h9\"/>","gear":"<path d=\"M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37c1 .608 2.296.07 2.572-1.065z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>","pencil":"<path d=\"M4 20h4l10.5-10.5a2.828 2.828 0 1 0-4-4L4 16v4\"/><path d=\"M13.5 6.5l4 4\"/>","sparkles":"<path d=\"M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2-2a2 2 0 0 1-2-2a2 2 0 0 1-2 2z\"/><path d=\"M2 12a6 6 0 0 0 6-6a6 6 0 0 0 6 6a6 6 0 0 0-6 6a6 6 0 0 0-6-6z\"/><path d=\"M10 4a2 2 0 0 1 2 2a2 2 0 0 1 2-2a2 2 0 0 1-2-2a2 2 0 0 1-2 2z\"/>","shield":"<path d=\"M11.46 20.846a12 12 0 0 1-7.96-14.846a12 12 0 0 0 8.5-3a12 12 0 0 0 8.5 3a12 12 0 0 1-.09 7.06\"/><path d=\"M15 19l2 2l4-4\"/>","info":"<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 8h.01\"/><path d=\"M11 12h1v4h1\"/>","logout":"<path d=\"M14 8v-2a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-2\"/><path d=\"M9 12h12l-3-3\"/><path d=\"M18 15l3-3\"/>","mail":"<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"/><path d=\"M3 7l9 6l9-6\"/>","lock":"<rect x=\"5\" y=\"11\" width=\"14\" height=\"10\" rx=\"2\"/><circle cx=\"12\" cy=\"16\" r=\"1\"/><path d=\"M8 11v-4a4 4 0 0 1 8 0v4\"/>","trash":"<path d=\"M4 7h16\"/><path d=\"M10 11v6\"/><path d=\"M14 11v6\"/><path d=\"M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12\"/><path d=\"M9 7v-3h6v3\"/>","chev":"<path d=\"M9 6l6 6l-6 6\"/>","back":"<path d=\"M5 12h14\"/><path d=\"M5 12l6 6\"/><path d=\"M5 12l6-6\"/>","check":"<path d=\"M5 12l5 5l10-10\"/>"};
  function icon(n, sz) {
    return '<svg viewBox="0 0 24 24" width="' + sz + '" height="' + sz + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[n] || "") + "</svg>";
  }
  function mk(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }
  function lsGet(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function user() { try { return window.ToxicAuth ? window.ToxicAuth.user() : null; } catch (e) { return null; } }
  function cleanName(n) { return String(n || "").replace(/^[^\p{L}\p{N}]+/u, ""); }

  var cards = oldBody.querySelectorAll(".card");
  function cardOf(sel) { var x = oldBody.querySelector(sel); return x ? x.closest(".card") : null; }
  var cTheme = cardOf("#themeToggle");
  var cInstr = cardOf("#customInstr");
  var cPriv = cardOf("#clearAll");
  var cAbout = cards.length ? cards[cards.length - 1] : null;
  if (cAbout === cTheme || cAbout === cInstr || cAbout === cPriv) cAbout = null;

  var css = document.createElement("style");
  css.textContent =
    ".sgrp{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;margin-bottom:14px}" +
    ".srow{display:flex;align-items:center;gap:14px;width:100%;padding:14px 16px;border:0;border-bottom:1px solid var(--border);background:transparent;color:var(--text);font-size:16px;font-family:inherit;text-align:left;cursor:pointer;min-height:54px}" +
    ".srow:last-child{border-bottom:0}" +
    ".srow:active{background:var(--bg2)}" +
    ".srow .si{display:grid;place-items:center;color:var(--primary);flex-shrink:0}" +
    ".srow .st{flex:1;min-width:0}" +
    ".srow .sv{font-size:13px;color:var(--muted);max-width:40%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".srow .sc{display:grid;place-items:center;color:var(--muted);flex-shrink:0}" +
    ".srow.danger,.srow.danger .si{color:#E5484D}" +
    ".sprof{display:flex;align-items:center;gap:14px;padding:16px}" +
    ".sav{width:56px;height:56px;border-radius:50%;object-fit:cover;background:var(--grad);color:#fff;display:grid;place-items:center;font-size:22px;font-weight:700;flex-shrink:0}" +
    ".sprof .sw{flex:1;min-width:0}" +
    ".sprof .sw b{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".sprof .sw span{display:block;color:var(--muted);font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".sbig{display:flex;flex-direction:column;align-items:center;gap:8px;padding:8px 0 18px;text-align:center}" +
    ".sbig .sav{width:88px;height:88px;font-size:34px}" +
    ".sbig b{font-size:20px}.sbig span{color:var(--muted);font-size:14px}" +
    ".sabout{display:flex;flex-direction:column;align-items:center;gap:6px;padding:8px 0 18px;text-align:center}" +
    ".sabout img{width:96px;height:96px;border-radius:50%;box-shadow:0 0 30px rgba(112,85,232,.5)}" +
    ".sabout h3{margin:8px 0 0;font-size:22px;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}" +
    ".sabout p{margin:0;color:var(--muted);font-size:14px}" +
    "#setBody{padding-bottom:32px}";
  document.head.appendChild(css);

  if (oldTop) oldTop.style.display = "none";
  oldBody.style.display = "none";

  var top = mk("div", "topbar");
  var back = mk("button", "icon-btn");
  back.type = "button";
  back.setAttribute("aria-label", "Peeche jao");
  back.innerHTML = icon("back", 22);
  var title = mk("h2", "", "Settings");
  top.append(back, title);
  var body = mk("div", "body");
  body.id = "setBody";
  screen.append(top, body);

  var cur = "list";
  var TITLES = { list: "Settings", account: "Account", general: "General", instr: "Custom Instructions", mode: "AI Mode", privacy: "Privacy", about: "About TOXIC AI" };

  function row(ic, label, val, fn, danger) {
    var b = mk("button", "srow" + (danger ? " danger" : ""));
    b.type = "button";
    var i = mk("span", "si"); i.innerHTML = icon(ic, 22);
    var t = mk("span", "st", label);
    b.append(i, t);
    if (val) b.append(mk("span", "sv", val));
    if (!danger) { var c = mk("span", "sc"); c.innerHTML = icon("chev", 18); b.append(c); }
    b.onclick = fn;
    return b;
  }
  function avatar(u, cls) {
    if (u && u.picture) {
      var im = mk("img", cls || "sav");
      im.src = u.picture; im.alt = ""; im.referrerPolicy = "no-referrer";
      return im;
    }
    return mk("div", cls || "sav", ((u && u.name) || "G").charAt(0).toUpperCase());
  }
  function modeName() {
    var id = lsGet("toxic.mode", "general");
    try { for (var i = 0; i < MODES.length; i++) if (MODES[i].id === id) return cleanName(MODES[i].name); } catch (e) {}
    return "";
  }
  function themeName() { return document.documentElement.getAttribute("data-theme") === "light" ? "Light" : "Dark"; }
  function doLogout() { if (window.ToxicAuth) window.ToxicAuth.signOut(); }

  function renderList() {
    var u = user();
    var g1 = mk("div", "sgrp");
    var prof = mk("button", "srow sprof");
    prof.type = "button";
    prof.style.minHeight = "0";
    var w = mk("div", "sw");
    w.append(mk("b", "", !u ? "Login nahi kiya" : (u.guest ? "Guest" : (u.name || "TOXIC AI user"))));
    w.append(mk("span", "", !u || u.guest ? "Google se sign in karo" : (u.email || "")));
    var pc = mk("span", "sc"); pc.innerHTML = icon("chev", 18);
    prof.append(avatar(u), w, pc);
    prof.onclick = function () { go("account"); };
    g1.append(prof);
    g1.append(row("switch", "Switch account", "", function () { if (window.ToxicAuth) window.ToxicAuth.switchAccount(); }));
    var g2 = mk("div", "sgrp");
    g2.append(row("gear", "General", themeName(), function () { go("general"); }));
    g2.append(row("pencil", "Custom Instructions", "", function () { go("instr"); }));
    g2.append(row("sparkles", "AI Mode", modeName(), function () { go("mode"); }));
    g2.append(row("shield", "Privacy", "", function () { go("privacy"); }));
    g2.append(row("info", "About TOXIC AI", "", function () { go("about"); }));
    var g3 = mk("div", "sgrp");
    g3.append(row("logout", "Log out", "", doLogout, true));
    body.append(g1, g2, g3);
  }

  function renderAccount() {
    var u = user();
    var big = mk("div", "sbig");
    big.append(avatar(u), mk("b", "", !u ? "Login nahi kiya" : (u.guest ? "Guest" : (u.name || "TOXIC AI user"))));
    body.append(big);
    var g = mk("div", "sgrp");
    var items = [];
    if (u && !u.guest) {
      items.push(["user", "Name", u.name || "-"]);
      items.push(["mail", "Email", u.email || "-"]);
      items.push(["lock", "Login method", "Google"]);
    } else {
      items.push(["lock", "Login method", "Guest"]);
    }
    items.forEach(function (it) {
      var r = mk("div", "srow");
      r.style.cursor = "default";
      var i = mk("span", "si"); i.innerHTML = icon(it[0], 22);
      r.append(i, mk("span", "st", it[1]), mk("span", "sv", it[2]));
      r.querySelector(".sv").style.maxWidth = "60%";
      g.append(r);
    });
    body.append(g);
    var g2 = mk("div", "sgrp");
    if (u && !u.guest) g2.append(row("logout", "Log out", "", doLogout, true));
    else g2.append(row("user", "Google se sign in karo", "", function () { if (window.ToxicAuth) window.ToxicAuth.signIn(); }));
    body.append(g2);
  }

  function renderMode() {
    var curMode = lsGet("toxic.mode", "general");
    var g = mk("div", "sgrp");
    var list = [];
    try { list = MODES; } catch (e) {}
    list.forEach(function (m) {
      var b = mk("button", "srow");
      b.type = "button";
      b.append(mk("span", "st", cleanName(m.name)));
      if (m.id === curMode) { var c = mk("span", "si"); c.innerHTML = icon("check", 22); b.append(c); }
      b.onclick = function () {
        lsSet("toxic.mode", m.id);
        var sel = document.getElementById("modeSelect");
        if (sel) sel.value = m.id;
        go("mode");
      };
      g.append(b);
    });
    if (!list.length) g.append(mk("div", "empty", "AI Mode abhi load nahi hue."));
    body.append(g);
    var note = mk("p", "", "Naya chat isi mode mein shuru hoga.");
    note.style.cssText = "color:var(--muted);font-size:13px;margin:0 4px";
    body.append(note);
  }

  function renderAbout() {
    var a = mk("div", "sabout");
    var logo = mk("img"); logo.src = "icon.png"; logo.alt = "TOXIC AI logo";
    a.append(logo, mk("h3", "", "TOXIC AI"), mk("p", "", "YOUR AI. YOUR WORLD."), mk("p", "", "One App. Multiple AI Brains. Everything AI in One Place."));
    body.append(a);
    var g = mk("div", "sgrp");
    var r = mk("div", "srow"); r.style.cursor = "default";
    r.append(mk("span", "st", "Banane wala"), mk("span", "sv", "\u0930\u0942\u092a\u0928\u093e\u0925"));
    g.append(r);
    body.append(g);
  }

  function go(v) {
    cur = v;
    body.textContent = "";
    title.textContent = TITLES[v] || "Settings";
    if (v === "list") renderList();
    else if (v === "account") renderAccount();
    else if (v === "mode") renderMode();
    else if (v === "about") renderAbout();
    else if (v === "general" && cTheme) { body.append(cTheme); }
    else if (v === "instr" && cInstr) { body.append(cInstr); }
    else if (v === "privacy" && cPriv) { body.append(cPriv); }
    else body.append(mk("div", "empty", "Ye hissa abhi load nahi hua."));
    body.scrollTop = 0;
  }

  back.onclick = function () {
    if (cur === "list") { if (typeof show === "function") show("home"); }
    else go("list");
  };

  window.addEventListener("toxic-auth", function () { if (cur === "list" || cur === "account") go(cur); });

  var wasActive = screen.classList.contains("active");
  new MutationObserver(function () {
    var now = screen.classList.contains("active");
    if (now && !wasActive) go("list");
    wasActive = now;
  }).observe(screen, { attributes: true, attributeFilter: ["class"] });

  go("list");
})();
                                                               
