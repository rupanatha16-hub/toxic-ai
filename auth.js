"use strict";
/* TOXIC AI - Google Sign-In (Google Identity Services).
   Is file mein koi secret nahi hai. Client ID gupt nahi hota. */
(function () {
  var CLIENT_ID = "833509551688-hu5hd6rc8e967mn81bjuh3vcfq8vt4s9.apps.googleusercontent.com";
  var KEY = "toxic.user";
  var gate = null;
  var gsiState = "none"; // none | loading | ready | failed

  function load() { try { var v = localStorage.getItem(KEY); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  function save(u) { try { localStorage.setItem(KEY, JSON.stringify(u)); } catch (e) {} }
  function clear() { try { localStorage.removeItem(KEY); } catch (e) {} }

  function parseJwt(t) {
    var p = t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    while (p.length % 4) p += "=";
    var bin = atob(p);
    var bytes = Uint8Array.from(bin, function (c) { return c.charCodeAt(0); });
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  function mk(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function injectCss() {
    var s = document.createElement("style");
    s.textContent =
      "#authGate{position:fixed;inset:0;z-index:70;background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:24px;text-align:center}" +
      "#authGate[hidden]{display:none}" +
      "#authGate img{width:120px;height:120px;border-radius:50%;box-shadow:0 0 40px rgba(112,85,232,.55)}" +
      "#authGate h1{margin:6px 0 0;font-size:30px;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}" +
      "#authGate .tag{margin:0;color:var(--muted)}" +
      "#authGate .btnbox{min-height:44px;margin-top:18px;display:flex;justify-content:center}" +
      "#authGate .msg{min-height:20px;margin:0;font-size:13px;color:var(--muted);max-width:300px}" +
      "#authGate .guest{border:0;background:none;color:var(--lav);font-size:14px;cursor:pointer;padding:10px;font-family:inherit;text-decoration:underline}" +
      ".acct{display:flex;align-items:center;gap:14px}" +
      ".acct .av{width:56px;height:56px;border-radius:50%;object-fit:cover;background:var(--grad);flex-shrink:0;display:grid;place-items:center;color:#fff;font-size:22px;font-weight:700}" +
      ".acct .who{flex:1;min-width:0}" +
      ".acct .who b{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
      ".acct .who span{display:block;color:var(--muted);font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}";
    document.head.appendChild(s);
  }

  function buildGate() {
    gate = mk("div");
    gate.id = "authGate";
    gate.hidden = true;
    var logo = mk("img");
    logo.src = "icon.png";
    logo.alt = "TOXIC AI logo";
    gate.append(logo, mk("h1", "", "TOXIC AI"), mk("p", "tag", "YOUR AI. YOUR WORLD."));
    var box = mk("div", "btnbox");
    box.id = "authBtnBox";
    var msg = mk("p", "msg", "");
    msg.id = "authMsg";
    var guest = mk("button", "guest", "Abhi nahi, guest ki tarah chalao");
    guest.type = "button";
    guest.onclick = function () {
      save({ guest: true, name: "Guest" });
      gate.hidden = true;
      renderAccount();
    };
    gate.append(box, msg, guest);
    document.body.appendChild(gate);
  }

  function setMsg(t) { var m = document.getElementById("authMsg"); if (m) m.textContent = t || ""; }

  function onCredential(resp) {
    try {
      var p = parseJwt(resp.credential);
      save({ guest: false, sub: p.sub, name: p.name || "", email: p.email || "", picture: p.picture || "" });
      gate.hidden = true;
      renderAccount();
    } catch (e) {
      setMsg("Login nahi ho paya. Dobara koshish karo.");
    }
  }

  function drawButton() {
    var box = document.getElementById("authBtnBox");
    if (!box || !window.google || !google.accounts || !google.accounts.id) return;
    box.textContent = "";
    google.accounts.id.initialize({ client_id: CLIENT_ID, callback: onCredential, auto_select: false });
    google.accounts.id.renderButton(box, { theme: "filled_blue", size: "large", shape: "pill", text: "signin_with", width: 280 });
  }

  function ensureGsi() {
    if (gsiState === "ready") { drawButton(); return; }
    if (gsiState === "loading") return;
    gsiState = "loading";
    setMsg("Google login taiyaar ho raha hai...");
    var s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = function () { gsiState = "ready"; setMsg(""); drawButton(); };
    s.onerror = function () { gsiState = "failed"; setMsg("Google login load nahi hua. Internet check karo, ya guest chalao."); };
    document.head.appendChild(s);
  }

  function showGate() {
    gate.hidden = false;
    if (gsiState === "failed") gsiState = "none";
    ensureGsi();
  }

  function signOut() {
    if (!confirm("Sign out karna hai?")) return;
    clear();
    try { if (window.google && google.accounts && google.accounts.id) google.accounts.id.disableAutoSelect(); } catch (e) {}
    renderAccount();
    showGate();
  }

  function renderAccount() {
    var body = document.querySelector("#screen-settings .body");
    if (!body) return;
    var old = document.getElementById("acctCard");
    if (old) old.remove();
    var u = load();
    if (!u) return;
    var card = mk("div", "card");
    card.id = "acctCard";
    var row = mk("div", "acct");
    var av;
    if (u.picture) {
      av = mk("img", "av");
      av.src = u.picture;
      av.alt = "";
      av.referrerPolicy = "no-referrer";
    } else {
      av = mk("div", "av", (u.name || "G").charAt(0).toUpperCase());
    }
    var who = mk("div", "who");
    who.append(mk("b", "", u.guest ? "Guest" : (u.name || "TOXIC AI user")));
    who.append(mk("span", "", u.guest ? "Login nahi kiya" : (u.email || "")));
    row.append(av, who);
    card.append(row);
    var btn = mk("button", "btn btn-block", u.guest ? "Google se sign in karo" : "Sign out");
    btn.type = "button";
    btn.style.marginTop = "12px";
    btn.onclick = function () {
      if (u.guest) { clear(); renderAccount(); showGate(); } else { signOut(); }
    };
    card.append(btn);
    body.insertBefore(card, body.firstChild);
  }

  function start() {
    injectCss();
    buildGate();
    renderAccount();
    if (!load()) showGate();
  }

  window.ToxicAuth = { user: load, signOut: signOut };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
      
