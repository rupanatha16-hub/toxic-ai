"use strict";
/* TOXIC AI - Premium (abhi DEMO). Koi payment nahi, koi nakli activation nahi.
   Pehli baar Google se sign in ke baad plan wala page ek baar dikhta hai.
   Tools screen (Premium Section) mein: TOXIC AI Premium card, search, category chips aur 20 tool.
   Koi secret nahi. */
(function () {
  var SEEN = "toxic.prem.seen";
  /* TEST_OPEN = true: abhi payment nahi hai, isliye taiyaar tools sabke liye khule hain (jaanch ke liye). Payment aane par false karenge. */
  var TEST_OPEN = true;
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
    ["website", "Mini Website Maker"], ["invite", "Invitation Maker"], ["textfmt", "Text Formatter Pro"], ["notespro", "Smart Notes Pro"],
    ["passport", "Passport Photo Maker"]
  ];
  var NAMES = {};
  PTOOLS.forEach(function (pt) { NAMES[pt[0]] = pt[1]; });
  var CATS = [
    ["Business", ["invoice", "quote", "vcard", "resume", "planner"]],
    ["Design", ["logo", "poster", "invite", "collage"]],
    ["Photo", ["watermark", "compress", "scanner", "passport"]],
    ["Docs", ["pdfmaster", "notespro", "textfmt", "hinditype"]],
    ["Aur", ["qrpro", "password", "website"]]
  ];
  var ICONS = {
    crown: '<path d="M12 6l4 6l5-4l-2 10h-14l-2-10l5 4z"/>',
    check: '<path d="M5 12l5 5l10-10"/>',
    x: '<path d="M18 6l-12 12"/><path d="M6 6l12 12"/>',
    chev: '<path d="M9 6l6 6l-6 6"/>',
    passport: '<rect x="5" y="3" width="14" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M7.5 18c.8-2.2 2.5-3.2 4.5-3.2s3.7 1 4.5 3.2"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>'
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
    ".ptool{position:relative}" +
    ".ptool .plk{position:absolute;top:12px;right:12px;color:var(--muted);display:grid;place-items:center}" +
    ".ptool .pico{display:grid;place-items:center;width:46px;height:46px;border-radius:14px;margin-bottom:10px;color:#fff;background:linear-gradient(135deg,#7055E8,#397BFF)}" +
    ".premcard{display:flex;align-items:center;gap:14px;width:100%;text-align:left;padding:14px;border-radius:var(--radius);border:1px solid var(--border);background:var(--card);color:var(--text);cursor:pointer;font-family:inherit;margin-bottom:14px}" +
    ".premcard .pci{width:46px;height:46px;border-radius:14px;background:var(--grad);color:#fff;display:grid;place-items:center;flex-shrink:0}" +
    ".premcard .pct{flex:1;min-width:0}" +
    ".premcard .pct b{display:block;font-size:16px}" +
    ".premcard .pct span{display:block;font-size:12px;color:var(--muted)}" +
    ".premcard .pcc{color:var(--muted);display:grid;place-items:center}" +
    ".premcard .ppro{background:#29D9E8;color:#10111B;font-size:11px;font-weight:700;padding:3px 9px;border-radius:12px;flex-shrink:0}" +
    "#premWrap{background:#10111B;border:1px solid #7055E8;border-radius:16px;padding:12px}" +
    "#premWrap .premcard{background:#1A1B2E;border:1px solid #7055E8;color:#F7F7FC;margin-bottom:12px}" +
    "#premWrap .premcard .pct span{color:#C7B8FF}" +
    "#premWrap .premcard .pcc{color:#29D9E8}" +
    "#premWrap .psearch{position:relative;margin-bottom:10px}" +
    "#premWrap .psearch .psi{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#29D9E8;display:grid;place-items:center;pointer-events:none}" +
    "#premWrap .psearch input{display:block;width:100%;box-sizing:border-box;height:46px;padding:0 14px 0 42px;border-radius:12px;border:1px solid #29D9E8;background:#1A1B2E;color:#F7F7FC;font-size:16px;font-family:inherit;outline:none}" +
    "#premWrap .psearch input::placeholder{color:#C7B8FF}" +
    "#premWrap .pchips{display:flex;gap:8px;overflow-x:auto;padding:2px 0 12px;-webkit-overflow-scrolling:touch;scrollbar-width:none}" +
    "#premWrap .pchips::-webkit-scrollbar{display:none}" +
    "#premWrap .pchip{flex:none;min-height:40px;padding:0 16px;border-radius:20px;border:1px solid #7055E8;background:#1A1B2E;color:#C7B8FF;font-size:14px;font-family:inherit;cursor:pointer}" +
    "#premWrap .pchip.on{background:#29D9E8;border-color:#29D9E8;color:#10111B;font-weight:700}" +
    "#premWrap .psecttl{margin:6px 2px 8px;font-size:14px;font-weight:600;color:#C7B8FF}" +
    "#premWrap .pempty{margin:14px 2px;text-align:center;font-size:14px;color:#C7B8FF}" +
    "#premWrap .tool{background:#1A1B2E;border:1px solid #7055E8;color:#F7F7FC}" +
    "#premWrap .tool b{color:#F7F7FC}" +
    "#premWrap .tool small{color:#29D9E8}" +
    "#premWrap .tool small.soon{color:#C7B8FF}" +
    "#premWrap .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;align-items:stretch}" +
    "#premWrap .ptool{display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-start;text-align:left;min-height:118px;width:100%;margin:0;box-sizing:border-box}" +
    "#premWrap .ptool b{display:block;flex:1 1 auto}" +
    "#premWrap .ptool small{display:block;flex:none;margin-top:2px}" +
    "#premWrap .grid>.ptool:last-child:nth-child(odd){grid-column:1/-1;display:grid;grid-template-columns:46px 1fr;column-gap:12px;align-items:center;min-height:78px}" +
    "#premWrap .grid>.ptool:last-child:nth-child(odd) .pico{grid-row:1/3;margin:0}" +
    "#premWrap .grid>.ptool:last-child:nth-child(odd) b{grid-column:2;align-self:end;flex:none}" +
    "#premWrap .grid>.ptool:last-child:nth-child(odd) small{grid-column:2;align-self:start}" +
    "#premWrap .grid>.ptool:last-child:nth-child(odd) .plk{top:50%;transform:translateY(-50%)}" +
    "#premWrap .ptool .plk{color:#C7B8FF}" +
    "#premWrap .ptool .plk.on{color:#29D9E8}";
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

  var cat = "All";
  var query = "";
  var listBox = null;

  function toolCard(id) {
    var IC = window.ToxicIcons;
    var ready = !!(window.ToxicStudio && window.ToxicStudio.has(id));
    var c = mk("button", "tool ptool");
    c.type = "button";
    var ib = mk("span", "pico");
    ib.innerHTML = ICONS[id] ? icon(id, 24) : (IC ? IC.svg(id, 24) : "");
    c.append(ib);
    var mark = mk("span", ready ? "plk on" : "plk");
    mark.innerHTML = ready ? icon("crown", 16) : (IC ? IC.svg("lock", 16) : "");
    c.append(mark);
    c.append(mk("b", "", NAMES[id]), mk("small", ready ? "" : "soon", ready ? "Kholo" : "Jald aayega"));
    c.onclick = function () {
      if (ready && (TEST_OPEN || (window.ToxicPremium && window.ToxicPremium.isPremium()))) window.ToxicStudio.open(id, "tools");
      else openPage();
    };
    return c;
  }

  function renderList() {
    if (!listBox) return;
    listBox.textContent = "";
    var qv = query.trim().toLowerCase();
    var shown = 0;
    CATS.forEach(function (c) {
      if (cat !== "All" && cat !== c[0]) return;
      var items = c[1].filter(function (id) { return !qv || NAMES[id].toLowerCase().indexOf(qv) !== -1; });
      if (!items.length) return;
      shown += items.length;
      listBox.append(mk("div", "psecttl", c[0]));
      var grid = mk("div", "grid");
      items.forEach(function (id) { grid.append(toolCard(id)); });
      listBox.append(grid);
    });
    if (!shown) listBox.append(mk("p", "pempty", "Kuch nahi mila. Doosra naam likho."));
  }

  function addToolsCard() {
    var body = document.querySelector("#screen-tools .body");
    if (!body || document.getElementById("premWrap")) return;
    var wrap = mk("div");
    wrap.id = "premWrap";

    var b = mk("button", "premcard");
    b.id = "premCardBtn";
    b.type = "button";
    var i = mk("span", "pci"); i.innerHTML = icon("crown", 24);
    var t = mk("span", "pct");
    t.append(mk("b", "", "TOXIC AI Premium"), mk("span", "", "Plan aur Premium tools dekho"));
    var pro = mk("span", "ppro", "PRO");
    var c = mk("span", "pcc"); c.innerHTML = icon("chev", 18);
    b.append(i, t, pro, c);
    b.onclick = openPage;

    var sw = mk("div", "psearch");
    var si = mk("span", "psi"); si.innerHTML = icon("search", 20);
    var inp = document.createElement("input");
    inp.type = "search";
    inp.placeholder = "Premium tools search karo";
    inp.setAttribute("aria-label", "Premium tools search karo");
    inp.oninput = function () { query = inp.value; renderList(); };
    sw.append(si, inp);

    var chips = mk("div", "pchips");
    var chipEls = [];
    ["All"].concat(CATS.map(function (x) { return x[0]; })).forEach(function (name) {
      var ch = mk("button", "pchip" + (name === cat ? " on" : ""), name);
      ch.type = "button";
      ch.onclick = function () {
        cat = name;
        chipEls.forEach(function (e) { e.classList.toggle("on", e === ch); });
        renderList();
      };
      chipEls.push(ch);
      chips.append(ch);
    });

    listBox = mk("div");
    wrap.append(b, sw, chips, listBox);
    body.insertBefore(wrap, body.firstChild);
    renderList();
  }

  document.body.appendChild(page);
  addToolsCard();
  window.addEventListener("toxic-auth", maybeFirstTime);
  window.ToxicPremium = { isPremium: function () { return false; }, open: openPage };
  maybeFirstTime();
})();
