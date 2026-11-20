"use strict";
/* TOXIC AI - Premium (abhi DEMO). Koi payment nahi, koi nakli activation nahi.
   Pehli baar Google se sign in ke baad plan wala page ek baar dikhta hai.
   Tools screen mein "TOXIC AI Premium" card hai jisse ye page kabhi bhi khulta hai.
   Koi secret nahi. */
(function () {
  var SEEN = "toxic.prem.seen";
  var PLANS = [
    { id: "w7", name: "7 din", price: "\u20B929", per: "7 din ke liye" },
    { id: "m1", name: "1 mahina", price: "\u20B999", per: "30 din ke liye", tag: "Zyada bachat" }
  ];
  var FEATURES = [
    "Saare Premium tools (Invoice, Quotation, Visiting Card, Resume...)",
    "Premium PDF, Design aur Document tools",
    "Zyada AI use",
    "Saare free tools bhi saath mein"
  ];
  var PTOOLS = [
    ["logo", "Logo Maker"], ["poster", "Poster Maker"], ["vcard", "Visiting Card Maker"], ["collage", "Photo Collage Maker"],
    ["watermark", "Watermark Studio"], ["invoice", "Invoice Maker"], ["resume", "Resume Pro"], ["pdfmaster", "PDF Master"],
    ["scanner", "Document Scanner"], ["quote", "Quotation Maker"], ["compress", "Image Compressor"], ["qrpro", "QR Designer Pro"],
    ["planner", "Social Media Planner"], ["hinditype", "Hindi Typing Pro"], ["password", "Password Manager Tools"],
    ["website", "Mini Website Maker"], ["invite", "Invitation Maker"], ["textfmt", "Text Formatter Pro"], ["notespro", "Smart Notes Pro"]
  ];
  var ICONS = {
    crown: '<path d="M12 6l4 6l5-4l-2 10h-14l-2-10l5 4z"/>',
    check: '<path d="M5 12l5 5l10-10"/>',
    x: '<path d="M18 6l-12 12"/><path d="M6 6l12 12"/>',
    chev: '<path d="M9 6l6 6l-6 6"/>'
  };
  function icon(n, s) {
    return '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[n] + "</svg>";
  }
  function mk(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function user() { try { return window.ToxicAuth ? window.ToxicAuth.user() : null; } catch (e) { return null; } }

  var css = document.createElement("style");
  css.textContent =
    "#premPage{position:fixed;inset:0;z-index:66;background:var(--bg);overflow-y:auto;-webkit-overflow-scrolling:touch}" +
    "#premPage[hidden]{display:none}" +
    "#premPage .pin{max-width:560px;margin:0 auto;padding:calc(env(safe-area-inset-top,0px) + 12px) 16px calc(env(safe-area-inset-bottom,0px) + 24px)}" +
    "#premPage .ptop{display:flex;justify-content:flex-end}" +
    "#premPage .pclose{width:44px;height:44px;border-radius:50%;border:1px solid var(--border);background:var(--card);color:var(--text);display:grid;place-items:center;cursor:pointer;padding:0}" +
    "#premPage .phero{display:flex;flex-direction:column;align-items:center;text-align:center;gap:6px;padding:4px 0 16px}" +
    "#premPage .pcrown{width:72px;height:72px;border-radius:50%;background:var(--grad);color:#fff;display:grid;place-items:center;box-shadow:0 0 36px rgba(112,85,232,.5)}" +
    "#premPage h1{margin:8px 0 0;font-size:24px;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}" +
    "#premPage .psub{margin:0;color:var(--muted);font-size:14px}" +
    "#premPage .plans{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px}" +
    "#premPage .plan{position:relative;text-align:center;padding:18px 8px 14px;border-radius:var(--radius);border:2px solid var(--border);background:var(--card);color:var(--text);cursor:pointer;font-family:inherit}" +
    "#premPage .plan.on{border-color:var(--primary);box-shadow:0 0 0 3px rgba(112,85,232,.2)}" +
    "#premPage .plan .pn{display:block;font-size:14px;color:var(--muted)}" +
    "#premPage .plan .pp{display:block;font-size:26px;font-weight:700;margin:4px 0}" +
    "#premPage .plan .pf{display:block;font-size:12px;color:var(--muted)}" +
    "#premPage .plan .ptag{position:absolute;top:-10px;left:50%;transform:translateX(-50%);background:var(--grad);color:#fff;font-size:11px;font-weight:600;padding:3px 10px;border-radius:10px;white-space:nowrap}" +
    "#premPage .pfeat{display:flex;gap:12px;align-items:flex-start;padding:9px 0;font-size:15px}" +
    "#premPage .pfeat .pc{color:var(--primary);flex-shrink:0;display:grid;place-items:center;margin-top:1px}" +
    "#premPage .pnote{margin:4px 0 12px;font-size:12px;color:var(--muted)}" +
    "#premPage .pmsg{min-height:20px;margin:8px 0 0;text-align:center;font-size:13px;color:var(--cyan)}" +
    "#premPage .plater{display:block;width:100%;margin-top:6px;border:0;background:none;color:var(--muted);font-size:14px;padding:12px;cursor:pointer;font-family:inherit}" +
    ".premsec{margin:2px 2px 10px;font-size:18px;font-weight:700;color:var(--text)}" +
    ".premsub{margin:6px 2px 4px;font-size:15px;font-weight:600;color:var(--text)}" +
    ".premhint{margin:0 2px 10px;font-size:12px;color:var(--muted)}" +
    ".ptool{position:relative}" +
    ".ptool .plk{position:absolute;top:12px;right:12px;color:var(--muted);display:grid;place-items:center}" +
    ".ptool .pico{display:grid;place-items:center;width:46px;height:46px;border-radius:14px;margin-bottom:10px;color:#fff;background:linear-gradient(135deg,#7055E8,#397BFF)}" +
    ".premcard{display:flex;align-items:center;gap:14px;width:100%;text-align:left;padding:14px;border-radius:var(--radius);border:1px solid var(--border);background:var(--card);color:var(--text);cursor:pointer;font-family:inherit;margin-bottom:14px}" +
    ".premcard .pci{width:46px;height:46px;border-radius:14px;background:var(--grad);color:#fff;display:grid;place-items:center;flex-shrink:0}" +
    ".premcard .pct{flex:1;min-width:0}" +
    ".premcard .pct b{display:block;font-size:16px}" +
    ".premcard .pct span{display:block;font-size:12px;color:var(--muted)}" +
    ".premcard .pcc{color:var(--muted);display:grid;place-items:center}";
  document.head.appendChild(css);

  var page = mk("div");
  page.id = "premPage";
  page.hidden = true;
  var selected = "m1";
  var msg = null;

  function build() {
    page.textContent = "";
    var pin = mk("div", "pin");
    var top = mk("div", "ptop");
    var close = mk("button", "pclose");
    close.type = "button";
    close.setAttribute("aria-label", "Band karo");
    close.innerHTML = icon("x", 22);
    close.onclick = closePage;
    top.append(close);
    var hero = mk("div", "phero");
    var cr = mk("div", "pcrown"); cr.innerHTML = icon("crown", 36);
    hero.append(cr, mk("h1", "", "TOXIC AI PREMIUM"), mk("p", "psub", "Professional tools unlock karo"));
    var plans = mk("div", "plans");
    PLANS.forEach(function (p) {
      var b = mk("button", "plan" + (p.id === selected ? " on" : ""));
      b.type = "button";
      if (p.tag) b.append(mk("span", "ptag", p.tag));
      b.append(mk("span", "pn", p.name), mk("span", "pp", p.price), mk("span", "pf", p.per));
      b.onclick = function () { selected = p.id; build(); };
      plans.append(b);
    });
    var card = mk("div", "card");
    FEATURES.forEach(function (f) {
      var r = mk("div", "pfeat");
      var c = mk("span", "pc"); c.innerHTML = icon("check", 20);
      r.append(c, mk("span", "", f));
      card.append(r);
    });
    card.append(mk("p", "pnote", "Premium tools abhi bante ja rahe hain. Kuch jald aayenge."));
    var up = mk("button", "btn btn-primary btn-block", "Upgrade");
    up.type = "button";
    msg = mk("p", "pmsg", "");
    up.onclick = function () {
      msg.textContent = "Abhi Demo mode hai: payment shuru nahi hui hai. Koi paisa nahi kata.";
    };
    var later = mk("button", "plater", "Abhi nahi");
    later.type = "button";
    later.onclick = closePage;
    pin.append(top, hero, plans, card, up, msg, later);
    page.append(pin);
  }

  function openPage() {
    build();
    page.hidden = false;
    page.scrollTop = 0;
  }
  function closePage() {
    page.hidden = true;
    lsSet(SEEN, "1");
  }
  function maybeFirstTime() {
    var u = user();
    if (u && !u.guest && !lsGet(SEEN)) openPage();
  }

  function addToolsCard() {
    var body = document.querySelector("#screen-tools .body");
    if (!body || document.getElementById("premCardBtn")) return;
    var b = mk("button", "premcard");
    b.id = "premCardBtn";
    b.type = "button";
    var i = mk("span", "pci"); i.innerHTML = icon("crown", 24);
    var t = mk("span", "pct");
    t.append(mk("b", "", "TOXIC AI Premium"), mk("span", "", "Plan aur Premium tools dekho"));
    var c = mk("span", "pcc"); c.innerHTML = icon("chev", 18);
    b.append(i, t, c);
    b.onclick = openPage;
    var head = mk("div", "premsec", "Premium Section");
    head.id = "premSecHead";
    var sub = mk("div", "premsub", "Premium tools");
    var hint = mk("p", "premhint", "Ye tools abhi bante ja rahe hain. Jaise-jaise taiyaar honge, yahin khulenge.");
    var grid = mk("div", "grid");
    var IC = window.ToxicIcons;
    PTOOLS.forEach(function (pt) {
      var c = mk("button", "tool ptool");
      c.type = "button";
      var ib = mk("span", "pico");
      ib.innerHTML = IC ? IC.svg(pt[0], 24) : "";
      var lk = mk("span", "plk");
      lk.innerHTML = IC ? IC.svg("lock", 16) : "";
      c.append(ib, lk, mk("b", "", pt[1]), mk("small", "", "Jald aayega"));
      c.onclick = openPage;
      grid.append(c);
    });
    var aiHead = mk("div", "premsub", "AI Tools");
    aiHead.style.marginTop = "18px";
    var frag = document.createDocumentFragment();
    frag.append(head, b, sub, hint, grid, aiHead);
    body.insertBefore(frag, body.firstChild);
  }

  document.body.appendChild(page);
  addToolsCard();
  window.addEventListener("toxic-auth", maybeFirstTime);
  window.ToxicPremium = { isPremium: function () { return false; }, open: openPage };
  maybeFirstTime();
})();
