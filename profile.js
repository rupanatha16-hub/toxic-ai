"use strict";
/* TOXIC AI - Profile tab + Profile page. Koi secret nahi.
   Neeche ki patti ka Settings tab ab Profile tab hai. Settings: Profile ke upar gear se, ya menu ke gear se.
   Naam aur photo sirf is phone mein (localStorage): toxic.profile.name, toxic.profile.photo.
   Share / Link copy: ab sirf app ka link. Koi database, koi inaam nahi. */
(function () {
  var app = document.getElementById("app");
  if (!app) return;

  var LINK = "https://rupanatha16-hub.github.io/toxic-ai/";
  var SHARE_TITLE = "TOXIC AI";
  var SHARE_TEXT = "TOXIC AI: ek app, kai AI dimaag. Chat, photo, PDF, bill aur resume, sab ek jagah.";

  var P = {
    gear: "<path d=\"M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37c1 .608 2.296.07 2.572-1.065z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>",
    check: "<path d=\"M5 12l5 5l10-10\"/>",
    camera: "<path d=\"M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z\"/><circle cx=\"12\" cy=\"13\" r=\"3\"/>",
    pencil: "<path d=\"M12 20h9\"/><path d=\"M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z\"/>",
    share: "<circle cx=\"18\" cy=\"5\" r=\"3\"/><circle cx=\"6\" cy=\"12\" r=\"3\"/><circle cx=\"18\" cy=\"19\" r=\"3\"/><line x1=\"8.59\" y1=\"13.51\" x2=\"15.42\" y2=\"17.49\"/><line x1=\"15.41\" y1=\"6.51\" x2=\"8.59\" y2=\"10.49\"/>",
    copy: "<rect width=\"14\" height=\"14\" x=\"8\" y=\"8\" rx=\"2\"/><path d=\"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2\"/>"
  };
  function icon(n, sz) {
    return "<svg viewBox=\"0 0 24 24\" width=\"" + sz + "\" height=\"" + sz + "\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\">" + (P[n] || "") + "</svg>";
  }
  function mk(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }
  function lsGet(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function say(m) { try { if (typeof toast === "function") toast(m); } catch (e) {} }
  function user() { try { return window.ToxicAuth ? window.ToxicAuth.user() : null; } catch (e) { return null; } }
  function cleanName(n) { return String(n || "").replace(/^[^\p{L}\p{N}]+/u, ""); }
  function isGuest(u) { return !u || u.guest; }
  function customName() { return String(lsGet("toxic.profile.name", "") || "").trim(); }
  function customPhoto() { return String(lsGet("toxic.profile.photo", "") || ""); }
  function nameOf(u) {
    var c = customName();
    if (c) return c;
    return !u ? "Login nahi kiya" : (u.guest ? "Guest" : (cleanName(u.name) || "TOXIC AI user"));
  }
  function initials(u) {
    var c = customName();
    if (!c && isGuest(u)) return "G";
    var w = (c || cleanName(u.name)).split(/\s+/).filter(Boolean);
    if (!w.length) return "T";
    return (w[0].charAt(0) + (w[1] ? w[1].charAt(0) : "")).toUpperCase();
  }
  function photoOf(u) { return customPhoto() || (u && u.picture) || ""; }

  function addPhoto(box, u) {
    var src = photoOf(u);
    if (!src) return;
    var im = document.createElement("img");
    im.alt = "";
    if (!customPhoto()) im.referrerPolicy = "no-referrer";
    im.src = src;
    im.onerror = function () { if (im.parentNode) im.parentNode.removeChild(im); };
    box.append(im);
  }
  function avatar(u, size) {
    var w = mk("div", "pf-av");
    w.style.width = size + "px"; w.style.height = size + "px";
    w.style.fontSize = Math.round(size * 0.36) + "px";
    w.append(document.createTextNode(initials(u)));
    addPhoto(w, u);
    return w;
  }

  function copyLink() {
    function ok() { say("Link copy ho gaya"); }
    function fallback() {
      try {
        var t = document.createElement("textarea");
        t.value = LINK; t.setAttribute("readonly", "");
        t.style.position = "fixed"; t.style.opacity = "0";
        document.body.appendChild(t); t.select();
        var done = document.execCommand("copy");
        document.body.removeChild(t);
        if (done) ok(); else say("Copy nahi ho paya");
      } catch (e) { say("Copy nahi ho paya"); }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(LINK).then(ok, fallback);
    } else fallback();
  }
  function shareLink() {
    if (navigator.share) {
      navigator.share({ title: SHARE_TITLE, text: SHARE_TEXT, url: LINK }).catch(function () {});
    } else {
      copyLink();
    }
  }

  /* photo chuno -> 256x256 chhoti karke phone mein rakho */
  function pickPhoto(done) {
    var inp = document.createElement("input");
    inp.type = "file"; inp.accept = "image/*";
    inp.onchange = function () {
      var f = inp.files && inp.files[0];
      if (!f) return;
      var url = URL.createObjectURL(f);
      var im = new Image();
      im.onload = function () {
        try {
          var S = 256, cv = document.createElement("canvas");
          cv.width = S; cv.height = S;
          var cx = cv.getContext("2d");
          var s = Math.min(im.naturalWidth, im.naturalHeight);
          var sx = (im.naturalWidth - s) / 2, sy = (im.naturalHeight - s) / 2;
          cx.drawImage(im, sx, sy, s, s, 0, 0, S, S);
          var data = cv.toDataURL("image/jpeg", 0.85);
          URL.revokeObjectURL(url);
          if (lsSet("toxic.profile.photo", data)) { say("Photo badal gayi"); done(); }
          else say("Photo save nahi ho payi");
        } catch (e) { say("Photo nahi chuni ja saki"); }
      };
      im.onerror = function () { URL.revokeObjectURL(url); say("Photo nahi chuni ja saki"); };
      im.src = url;
    };
    inp.click();
  }

  function init(nav) {
    var css = document.createElement("style");
    css.textContent =
      "#screen-profile .topbar{display:flex;align-items:center;gap:12px}" +
      "#screen-profile .topbar h2{margin:0}" +
      "#pfBody{padding-bottom:32px}" +
      ".pf-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;margin-bottom:14px}" +
      ".pf-hrow{display:flex;align-items:center;gap:14px;padding:16px}" +
      ".pf-avw{position:relative;flex-shrink:0}" +
      ".pf-av{position:relative;border-radius:50%;box-sizing:border-box;border:3px solid #7055E8;background:var(--grad,#7055E8);color:#fff;display:grid;place-items:center;font-weight:700;overflow:hidden}" +
      ".pf-av img{position:absolute;inset:0;width:100%;height:100%;border-radius:50%;object-fit:cover}" +
      ".pf-cam{position:absolute;right:-2px;bottom:-2px;width:28px;height:28px;border-radius:50%;border:1px solid var(--border);background:var(--card);color:var(--text);display:grid;place-items:center;padding:0;cursor:pointer}" +
      ".pf-who{min-width:0;flex:1}" +
      ".pf-nrow{display:flex;align-items:center;gap:6px}" +
      ".pf-nrow b{font-size:17px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
      ".pf-ed{border:0;background:none;color:var(--muted);padding:4px;display:grid;cursor:pointer}" +
      ".pf-mail{display:block;font-size:13px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px}" +
      ".pf-inp{width:100%;box-sizing:border-box;font-size:16px;font-family:inherit;color:var(--text);background:transparent;border:1px solid var(--border);border-radius:10px;padding:8px 10px}" +
      ".pf-err{font-size:13px;color:#E5484D;margin-top:4px}" +
      ".pf-acts{display:flex;gap:8px;margin-top:8px}" +
      ".pf-btn{border:1px solid var(--primary);background:transparent;color:var(--primary);border-radius:999px;padding:8px 16px;font-size:14px;font-family:inherit;cursor:pointer}" +
      ".pf-btn.fill{background:var(--primary);color:#fff}" +
      ".pf-link{border:0;background:none;color:var(--muted);font-family:inherit;font-size:12px;padding:6px 0 0;cursor:pointer;text-decoration:underline}" +
      ".pf-in{padding:0 16px 16px}" +
      ".pf-box{padding:16px}" +
      ".pf-t{display:flex;align-items:center;gap:8px;font-size:16px;font-weight:600;margin-bottom:6px}" +
      ".pf-t .pf-ti{display:grid;color:var(--cyan)}" +
      ".pf-p{margin:0 0 12px;font-size:14px;color:var(--muted);line-height:1.5}" +
      ".pf-two{display:flex;gap:10px}" +
      ".pf-two button{flex:1;min-width:0;display:flex;align-items:center;justify-content:center;gap:6px;border-radius:999px;padding:11px 8px;font-size:14px;font-weight:600;font-family:inherit;cursor:pointer}" +
      ".pf-two .pf-sh{background:#7055E8;color:#fff;border:1px solid #7055E8}" +
      ".pf-two .pf-cp{background:transparent;color:var(--cyan);border:1px solid var(--cyan)}" +
      ".pf-tabav{position:relative;width:22px;height:22px;border-radius:50%;background:var(--grad,#7055E8);color:#fff;font-size:10px;font-weight:700;display:grid;place-items:center;overflow:hidden}" +
      ".pf-tabav img{position:absolute;inset:0;width:100%;height:100%;border-radius:50%;object-fit:cover}" +
      "#bnav button.on .pf-tabav{box-shadow:0 0 0 2px var(--cyan)}";
    document.head.appendChild(css);

    var sc = mk("section", "screen");
    sc.id = "screen-profile";
    var top = mk("div", "topbar");
    var gear = mk("button", "icon-btn");
    gear.type = "button"; gear.setAttribute("aria-label", "Settings"); gear.style.marginLeft = "auto";
    gear.innerHTML = icon("gear", 22);
    gear.onclick = function () { if (typeof window.show === "function") window.show("settings"); };
    top.append(mk("h2", "", "Profile"), gear);
    var body = mk("div", "body");
    body.id = "pfBody";
    sc.append(top, body);
    app.insertBefore(sc, nav);

    /* Neeche ki patti: Settings tab -> Profile tab */
    var tab = nav.querySelector("button[data-go=\"settings\"]");
    var tabAv = mk("span", "pf-tabav");
    if (tab) {
      tab.dataset.go = "profile";
      tab.textContent = "";
      tab.append(tabAv, document.createTextNode("Profile"));
      tab.onclick = function () { if (typeof window.show === "function") window.show("profile"); };
    }
    function updateTab() {
      var u = user();
      tabAv.textContent = initials(u);
      addPhoto(tabAv, u);
    }

    var editing = false;

    function render() {
      body.textContent = "";
      var u = user();

      /* Upar ka card: photo, naam, email */
      var head = mk("div", "pf-card");
      var hrow = mk("div", "pf-hrow");
      var avw = mk("div", "pf-avw");
      avw.append(avatar(u, 72));
      var cam = mk("button", "pf-cam");
      cam.type = "button"; cam.setAttribute("aria-label", "Photo badlo");
      cam.innerHTML = icon("camera", 15);
      cam.onclick = function () { pickPhoto(function () { updateTab(); render(); }); };
      avw.append(cam);

      var who = mk("div", "pf-who");
      if (editing) {
        var inp = mk("input", "pf-inp");
        inp.type = "text"; inp.maxLength = 30;
        inp.value = customName() || (isGuest(u) ? "" : cleanName(u.name));
        inp.setAttribute("aria-label", "Naya naam");
        var err = mk("div", "pf-err");
        inp.oninput = function () { err.textContent = ""; };
        var acts = mk("div", "pf-acts");
        var sv = mk("button", "pf-btn fill", "Save"); sv.type = "button";
        sv.onclick = function () {
          var v = inp.value.trim();
          if (!v) { err.textContent = "Naam khali nahi ho sakta"; return; }
          if (lsSet("toxic.profile.name", v)) { editing = false; say("Naam badal gaya"); updateTab(); render(); }
          else err.textContent = "Naam save nahi ho paya";
        };
        var cn = mk("button", "pf-btn", "Cancel"); cn.type = "button";
        cn.onclick = function () { editing = false; render(); };
        acts.append(sv, cn);
        who.append(inp, err, acts);
        setTimeout(function () { try { inp.focus(); } catch (e) {} }, 0);
      } else {
        var nrow = mk("div", "pf-nrow");
        nrow.append(mk("b", "", nameOf(u)));
        var ed = mk("button", "pf-ed");
        ed.type = "button"; ed.setAttribute("aria-label", "Naam badlo");
        ed.innerHTML = icon("pencil", 17);
        ed.onclick = function () { editing = true; render(); };
        nrow.append(ed);
        who.append(nrow, mk("span", "pf-mail", isGuest(u) ? "Google se sign in karo" : (u.email || "TOXIC AI member")));
        if (customName() || customPhoto()) {
          var rs = mk("button", "pf-link", "Pehle jaisa karo");
          rs.type = "button";
          rs.onclick = function () { lsDel("toxic.profile.name"); lsDel("toxic.profile.photo"); say("Pehle jaisa ho gaya"); updateTab(); render(); };
          who.append(rs);
        }
      }
      hrow.append(avw, who);
      head.append(hrow);
      if (isGuest(u)) {
        var inb = mk("div", "pf-in");
        var sb = mk("button", "pf-btn", "Google se sign in karo");
        sb.type = "button";
        sb.onclick = function () { if (window.ToxicAuth) window.ToxicAuth.signIn(); };
        inb.append(sb);
        head.append(inb);
      }
      body.append(head);

      /* Share card */
      var box = mk("div", "pf-card pf-box");
      var t = mk("div", "pf-t");
      var ti = mk("span", "pf-ti"); ti.innerHTML = icon("share", 20);
      t.append(ti, document.createTextNode("TOXIC AI share karo"));
      box.append(t, mk("p", "pf-p", "Apne dost ya family ko app ka link bhejo."));
      var two = mk("div", "pf-two");
      var sh = mk("button", "pf-sh"); sh.type = "button";
      sh.innerHTML = icon("share", 18);
      sh.append(document.createTextNode("Share karo"));
      sh.onclick = shareLink;
      var cp = mk("button", "pf-cp"); cp.type = "button";
      cp.innerHTML = icon("copy", 18);
      cp.append(document.createTextNode("Link copy karo"));
      cp.onclick = copyLink;
      two.append(sh, cp);
      box.append(two);
      body.append(box);
    }

    window.addEventListener("toxic-auth", function () { updateTab(); render(); });
    var wasOn = sc.classList.contains("active");
    new MutationObserver(function () {
      var now = sc.classList.contains("active");
      if (now && !wasOn) { body.scrollTop = 0; editing = false; render(); }
      wasOn = now;
    }).observe(sc, { attributes: true, attributeFilter: ["class"] });

    /* Settings khula ho to bhi Profile tab "on" dikhe */
    var setScr = document.getElementById("screen-settings");
    if (setScr && tab) {
      new MutationObserver(function () {
        if (setScr.classList.contains("active")) tab.classList.add("on");
      }).observe(setScr, { attributes: true, attributeFilter: ["class"] });
    }

    updateTab();
    render();
  }

  var tries = 0;
  function boot() {
    var nav = document.getElementById("bnav");
    if (!nav) { if (tries++ < 60) setTimeout(boot, 50); return; }
    try { init(nav); } catch (e) { try { console.error(e); } catch (x) {} }
  }
  boot();
})();
