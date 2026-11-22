"use strict";
/* TOXIC AI - Profile tab + Profile page. Koi secret nahi.
   Neeche ki patti ka Settings tab ab Profile tab hai. Settings: Profile ke upar gear se, ya menu ke gear se.
   Dost ki ginti abhi asli nahi (database baad mein): localStorage "toxic.refCount", default 0. */
(function () {
  var app = document.getElementById("app");
  if (!app) return;

  var P = {
    gear: "<path d=\"M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37c1 .608 2.296.07 2.572-1.065z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>",
    chev: "<path d=\"M9 6l6 6l-6 6\"/>",
    lock: "<rect x=\"5\" y=\"11\" width=\"14\" height=\"10\" rx=\"2\"/><circle cx=\"12\" cy=\"16\" r=\"1\"/><path d=\"M8 11v-4a4 4 0 0 1 8 0v4\"/>",
    check: "<path d=\"M5 12l5 5l10-10\"/>",
    award: "<circle cx=\"12\" cy=\"9\" r=\"6\"/><path d=\"M8.5 14.5L7 22l5-3l5 3l-1.5-7.5\"/>",
    users: "<circle cx=\"9\" cy=\"7\" r=\"4\"/><path d=\"M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2\"/><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"/><path d=\"M21 21v-2a4 4 0 0 0-3-3.85\"/>",
    star: "<path d=\"M12 2l3.09 6.26L22 9.27l-5 4.87l1.18 6.88L12 17.77l-6.18 3.25L7 14.14L2 9.27l6.91-1.01z\"/>",
    crown: "<path d=\"M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z\"/><path d=\"M5.5 21h13\"/>",
    gift: "<rect x=\"3\" y=\"8\" width=\"18\" height=\"4\" rx=\"1\"/><path d=\"M12 8v13\"/><path d=\"M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7\"/><path d=\"M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5a2.5 2.5 0 0 1 0 5\"/>",
    userplus: "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/><path d=\"M19 8v6\"/><path d=\"M22 11h-6\"/>",
    photo: "<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><circle cx=\"8.5\" cy=\"8.5\" r=\"1.5\"/><path d=\"M21 15l-5-5L5 21\"/>"
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
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function say(m) { try { if (typeof toast === "function") toast(m); } catch (e) {} }
  function user() { try { return window.ToxicAuth ? window.ToxicAuth.user() : null; } catch (e) { return null; } }
  function cleanName(n) { return String(n || "").replace(/^[^\p{L}\p{N}]+/u, ""); }
  function isGuest(u) { return !u || u.guest; }
  function nameOf(u) { return !u ? "Login nahi kiya" : (u.guest ? "Guest" : (cleanName(u.name) || "TOXIC AI user")); }
  function initials(u) {
    if (isGuest(u)) return "G";
    var w = cleanName(u.name).split(/\s+/).filter(Boolean);
    if (!w.length) return "T";
    return (w[0].charAt(0) + (w[1] ? w[1].charAt(0) : "")).toUpperCase();
  }
  function count() { var n = parseInt(lsGet("toxic.refCount", "0"), 10); return isNaN(n) || n < 0 ? 0 : n; }
  function isPrem() { try { return !!(window.ToxicPremium && window.ToxicPremium.isPremium()); } catch (e) { return false; } }

  var BADGES = [
    { id: "b1", name: "Dost-Doot", ic: "award", need: 1, col: "#29D9E8" },
    { id: "b3", name: "Mitra", ic: "users", need: 3, col: "#C7B8FF" },
    { id: "b5", name: "Sitara", ic: "star", need: 5, col: "#F6C945" },
    { id: "b10", name: "Taaj-Dhari", ic: "crown", need: 10, col: "#F6C945" },
    { id: "bp", name: "Premium member", ic: "crown", need: 0, prem: true, col: "#F6C945" }
  ];
  var BANNERS = [
    { id: "d", name: "Saada", need: 0, bg: "linear-gradient(135deg,#2A2260,#10111B)" },
    { id: "n", name: "Jaamuni raat", need: 3, bg: "radial-gradient(circle at 85% 10%,#7055E8 0,transparent 55%),#2A2260" },
    { id: "s", name: "Neela sagar", need: 3, bg: "radial-gradient(circle at 10% 100%,#397BFF 0,transparent 55%),#0B2A4A" },
    { id: "g", name: "Sunehra taaj", need: 5, bg: "radial-gradient(circle at 70% 0%,#E8B923 0,transparent 50%),#2A200A" },
    { id: "c", name: "Cyan neon", need: 10, prem: true, bg: "radial-gradient(circle at 30% 0%,#29D9E8 0,transparent 50%),#07242A" }
  ];
  var FRAMES = [
    { id: "p", name: "Saada", need: 0, ring: "2px solid var(--border)", glow: "" },
    { id: "v", name: "Jaamuni", need: 1, ring: "3px solid #7055E8", glow: "" },
    { id: "k", name: "Sunehra taaj", need: 5, ring: "3px solid #E8B923", glow: "", crown: true },
    { id: "m", name: "Do-rang", need: 10, prem: true, ring: "3px solid #29D9E8", glow: "0 0 0 3px #7055E8" }
  ];
  var STEPS = [
    { need: 1, ic: "award", t: "Dost-Doot badge" },
    { need: 3, ic: "photo", t: "Khaas banner" },
    { need: 5, ic: "crown", t: "Taaj wala frame" },
    { need: 10, ic: "gift", t: "Premium ke kuch din (Premium asli hone par)" }
  ];

  function unlocked(it) { return it.prem ? (isPrem() && count() >= (it.need || 0)) : count() >= it.need; }
  function lockText(it) { return it.prem ? "Premium asli hone par khulega" : it.need + " dost jude to khulega"; }
  function pick(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return list[0];
  }
  function getSel() {
    var s = { banner: "d", frame: "p" };
    try { var o = JSON.parse(lsGet("toxic.profile.sel", "{}")); if (o && o.banner) s.banner = o.banner; if (o && o.frame) s.frame = o.frame; } catch (e) {}
    if (!unlocked(pick(BANNERS, s.banner))) s.banner = "d";
    if (!unlocked(pick(FRAMES, s.frame))) s.frame = "p";
    return s;
  }
  function setSel(k, id) { var s = getSel(); s[k] = id; lsSet("toxic.profile.sel", JSON.stringify(s)); }

  function avatar(u, size, fr) {
    var w = mk("div", "pf-av");
    w.style.width = size + "px"; w.style.height = size + "px";
    w.style.fontSize = Math.round(size * 0.36) + "px";
    w.style.border = fr ? fr.ring : "2px solid var(--border)";
    w.style.boxShadow = fr && fr.glow ? fr.glow : "none";
    w.append(document.createTextNode(initials(u)));
    if (u && u.picture) {
      var im = document.createElement("img");
      im.alt = ""; im.referrerPolicy = "no-referrer"; im.src = u.picture;
      im.onerror = function () { if (im.parentNode) im.parentNode.removeChild(im); };
      w.append(im);
    }
    if (fr && fr.crown) { var c = mk("span", "pf-crown"); c.innerHTML = icon("crown", Math.round(size * 0.34)); w.append(c); }
    return w;
  }

  function init(nav) {
    var css = document.createElement("style");
    css.textContent =
      "#screen-profile .topbar{display:flex;align-items:center;gap:12px}" +
      "#screen-profile .topbar h2{margin:0}" +
      "#pfBody{padding-bottom:32px}" +
      ".pf-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;margin-bottom:14px}" +
      ".pf-ban{height:84px}" +
      ".pf-hrow{display:flex;align-items:flex-end;gap:12px;padding:0 16px 14px;margin-top:-30px}" +
      ".pf-av{position:relative;border-radius:50%;box-sizing:border-box;background:var(--grad,#7055E8);color:#fff;display:grid;place-items:center;font-weight:700;flex-shrink:0}" +
      ".pf-av img{position:absolute;inset:0;width:100%;height:100%;border-radius:50%;object-fit:cover}" +
      ".pf-crown{position:absolute;top:-45%;left:50%;transform:translateX(-50%);color:#F6C945;display:grid}" +
      ".pf-who{min-width:0;padding-bottom:2px}" +
      ".pf-who b{display:block;font-size:17px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
      ".pf-who span{display:block;font-size:13px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
      ".pf-in{padding:0 16px 14px}" +
      ".pf-btn{border:1px solid var(--primary);background:transparent;color:var(--primary);border-radius:999px;padding:8px 16px;font-size:14px;font-family:inherit;cursor:pointer}" +
      ".pf-box{padding:16px}" +
      ".pf-t{display:flex;align-items:center;gap:8px;font-size:16px;font-weight:600;margin-bottom:6px}" +
      ".pf-t .pf-ti{display:grid;color:var(--cyan)}" +
      ".pf-soon{margin-left:auto;font-size:12px;font-weight:500;color:#F6C945;border:1px solid #E8B923;border-radius:999px;padding:2px 10px}" +
      ".pf-p{margin:0 0 12px;font-size:14px;color:var(--muted);line-height:1.5}" +
      ".pf-steps{display:flex;gap:6px}" +
      ".pf-step{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:4px;border:0;background:none;color:var(--text);font-family:inherit;font-size:12px;cursor:pointer;padding:0}" +
      ".pf-step .pf-sq{width:36px;height:36px;border-radius:10px;display:grid;place-items:center;border:1px solid var(--border);color:var(--muted);background:var(--bg2)}" +
      ".pf-step.on .pf-sq{color:#fff;background:var(--primary);border-color:var(--primary)}" +
      ".pf-step small{color:var(--muted);font-size:11px;display:grid}" +
      ".pf-h{font-size:12px;letter-spacing:.5px;color:var(--cyan);margin:4px 2px 8px;font-weight:600}" +
      ".pf-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px}" +
      ".pf-chip{display:flex;align-items:center;gap:6px;border-radius:999px;padding:6px 12px;font-size:13px;font-family:inherit;cursor:pointer;background:var(--card);color:var(--text);border:1px solid var(--border)}" +
      ".pf-chip.lock{border-style:dashed;color:var(--muted)}" +
      ".pf-chip .pf-ci{display:grid}" +
      ".pf-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-bottom:16px}" +
      ".pf-bn{border:1px solid var(--border);background:var(--card);border-radius:12px;padding:6px;font-family:inherit;color:var(--text);text-align:left;cursor:pointer}" +
      ".pf-bn.sel{border-color:var(--cyan)}" +
      ".pf-bn .pf-sw{height:48px;border-radius:8px}" +
      ".pf-bn b{display:block;font-size:13px;margin-top:6px;font-weight:600}" +
      ".pf-bn span{display:block;font-size:11px;color:var(--muted)}" +
      ".pf-bn.lock .pf-sw{opacity:.55}" +
      ".pf-frs{display:flex;gap:8px;margin-bottom:18px}" +
      ".pf-fr{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:6px;border:0;background:none;font-family:inherit;color:var(--text);font-size:12px;cursor:pointer;padding:12px 0 0}" +
      ".pf-fr span{font-size:11px;color:var(--muted)}" +
      ".pf-fr.sel b{color:var(--cyan)}" +
      ".pf-fr.lock .pf-av{opacity:.55}" +
      ".pf-row{display:flex;align-items:center;gap:14px;width:100%;padding:14px 16px;border:0;background:transparent;color:var(--text);font-size:16px;font-family:inherit;text-align:left;cursor:pointer;min-height:54px}" +
      ".pf-row .pf-ri{display:grid;color:var(--primary)}" +
      ".pf-row .pf-rt{flex:1}" +
      ".pf-row .pf-rc{display:grid;color:var(--muted)}" +
      ".pf-tabav{position:relative;width:22px;height:22px;border-radius:50%;background:var(--grad,#7055E8);color:#fff;font-size:10px;font-weight:700;display:grid;place-items:center}" +
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
      if (u && u.picture) {
        var im = document.createElement("img");
        im.alt = ""; im.referrerPolicy = "no-referrer"; im.src = u.picture;
        im.onerror = function () { if (im.parentNode) im.parentNode.removeChild(im); };
        tabAv.append(im);
      }
    }

    function render() {
      body.textContent = "";
      var u = user(), c = count(), sel = getSel();
      var banner = pick(BANNERS, sel.banner), frame = pick(FRAMES, sel.frame);

      /* Upar ka card */
      var head = mk("div", "pf-card");
      var ban = mk("div", "pf-ban"); ban.style.background = banner.bg;
      var hrow = mk("div", "pf-hrow");
      var who = mk("div", "pf-who");
      who.append(mk("b", "", nameOf(u)), mk("span", "", isGuest(u) ? "Google se sign in karo" : (u.email || "TOXIC AI member")));
      hrow.append(avatar(u, 64, frame), who);
      head.append(ban, hrow);
      if (isGuest(u)) {
        var inb = mk("div", "pf-in");
        var sb = mk("button", "pf-btn", "Google se sign in karo");
        sb.type = "button";
        sb.onclick = function () { if (window.ToxicAuth) window.ToxicAuth.signIn(); };
        inb.append(sb);
        head.append(inb);
      }
      body.append(head);

      /* Dost bulao */
      var ref = mk("div", "pf-card pf-box");
      var rt = mk("div", "pf-t");
      var rti = mk("span", "pf-ti"); rti.innerHTML = icon("userplus", 20);
      rt.append(rti, document.createTextNode("Dost bulao"), mk("span", "pf-soon", "Jald aayega"));
      ref.append(rt, mk("p", "pf-p", "Dost bulane ka system jald aayega. Dost jude to aapko inaam milega: badge, banner aur frame."));
      var steps = mk("div", "pf-steps");
      STEPS.forEach(function (s) {
        var b = mk("button", "pf-step" + (c >= s.need ? " on" : ""));
        b.type = "button";
        var sq = mk("span", "pf-sq"); sq.innerHTML = icon(c >= s.need ? "check" : "lock", 18);
        var ic = mk("small"); ic.innerHTML = icon(s.ic, 14);
        b.append(sq, document.createTextNode(s.need + " dost"), ic);
        b.onclick = function () { say(s.need + " dost: " + s.t); };
        steps.append(b);
      });
      ref.append(steps);
      body.append(ref);

      /* Collection */
      body.append(mk("div", "pf-h", "Badge"));
      var chips = mk("div", "pf-chips");
      BADGES.forEach(function (it) {
        var ok = unlocked(it);
        var b = mk("button", "pf-chip" + (ok ? "" : " lock"));
        b.type = "button";
        if (ok) { b.style.borderColor = it.col; b.style.color = it.col; }
        var ci = mk("span", "pf-ci"); ci.innerHTML = icon(ok ? it.ic : "lock", 16);
        b.append(ci, document.createTextNode(it.name));
        b.onclick = function () { say(ok ? "Aapka badge: " + it.name : lockText(it)); };
        chips.append(b);
      });
      body.append(chips);

      body.append(mk("div", "pf-h", "Banner ka style"));
      var grid = mk("div", "pf-grid");
      BANNERS.forEach(function (it) {
        var ok = unlocked(it);
        var b = mk("button", "pf-bn" + (ok ? "" : " lock") + (sel.banner === it.id ? " sel" : ""));
        b.type = "button";
        var swt = mk("div", "pf-sw"); swt.style.background = it.bg;
        b.append(swt, mk("b", "", it.name), mk("span", "", ok ? (sel.banner === it.id ? "Chuna hua" : "Chuno") : lockText(it)));
        b.onclick = function () { if (ok) { setSel("banner", it.id); render(); } else say(lockText(it)); };
        grid.append(b);
      });
      body.append(grid);

      body.append(mk("div", "pf-h", "Photo ka frame"));
      var frs = mk("div", "pf-frs");
      FRAMES.forEach(function (it) {
        var ok = unlocked(it);
        var b = mk("button", "pf-fr" + (ok ? "" : " lock") + (sel.frame === it.id ? " sel" : ""));
        b.type = "button";
        b.append(avatar(u, 48, it), mk("b", "", it.name), mk("span", "", ok ? (sel.frame === it.id ? "Chuna hua" : "Chuno") : (it.prem ? "Premium" : it.need + " dost")));
        b.onclick = function () { if (ok) { setSel("frame", it.id); render(); } else say(lockText(it)); };
        frs.append(b);
      });
      body.append(frs);

      /* Settings */
      var g = mk("div", "pf-card");
      var r = mk("button", "pf-row");
      r.type = "button";
      var ri = mk("span", "pf-ri"); ri.innerHTML = icon("gear", 22);
      var rc = mk("span", "pf-rc"); rc.innerHTML = icon("chev", 18);
      r.append(ri, mk("span", "pf-rt", "Settings"), rc);
      r.onclick = function () { if (typeof window.show === "function") window.show("settings"); };
      g.append(r);
      body.append(g);
    }

    window.addEventListener("toxic-auth", function () { updateTab(); render(); });
    var wasOn = sc.classList.contains("active");
    new MutationObserver(function () {
      var now = sc.classList.contains("active");
      if (now && !wasOn) { body.scrollTop = 0; render(); }
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
