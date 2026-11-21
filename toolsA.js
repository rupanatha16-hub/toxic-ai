"use strict";
/* TOXIC AI - Premium tools A: Invoice Maker, Quotation Maker, Visiting Card Maker, Resume Pro.
   Sab kuch phone ke browser mein banta hai. Koi secret nahi, koi data bahar nahi jata
   (sirf Resume ka "AI se summary" button likhi hui jaankari AI ko bhejta hai). */
(function () {
  var S = window.ToxicStudio, L = window.ToxicLib;
  if (!S || !L) return;
  var h = S.h;
  var BRANDS = [["#7055E8", "Jamuni"], ["#397BFF", "Neela"], ["#0F9D58", "Hara"], ["#E8590C", "Narangi"], ["#C2185B", "Gulabi"], ["#263238", "Kaala"]];
  function pad3(n) { return String(n).padStart(3, "0"); }

  /* ================= INVOICE / QUOTATION ================= */
  function calc(st) {
    var sub = 0;
    (st.items || []).forEach(function (it) { sub += L.num(it.q) * L.num(it.r); });
    var dp = Math.min(100, Math.max(0, L.num(st.disc))), disc = sub * dp / 100, taxable = sub - disc;
    var gp = L.num(st.gst), gst = taxable * gp / 100, raw = taxable + gst, total = Math.round(raw);
    return { sub: sub, dp: dp, disc: disc, gp: gp, gst: gst, raw: raw, total: total, ro: total - raw };
  }
  function buildDoc(st, quote) {
    var br = st.brand || "#7055E8", c = calc(st);
    var d = new L.Doc({ M: 70 }), W = d.W, M = d.M, ctx = d.x;
    ctx.fillStyle = br; ctx.fillRect(0, 0, W, 210);
    var tx = M;
    if (st.logo) {
      ctx.fillStyle = "#fff"; L.rrect(ctx, M, 35, 140, 140, 20); ctx.fill();
      L.drawContain(ctx, st.logo, M + 10, 45, 120, 120); tx = M + 170;
    }
    var y = 36;
    y += d.text(st.bizName || "Aapki dukaan ka naam", { x: tx, y: y, w: W - tx - M - 330, size: 42, weight: 700, color: "#fff" }) + 4;
    var det = [];
    if (st.bizAddr) det.push(st.bizAddr);
    if (st.bizPhone) det.push("Phone: " + st.bizPhone);
    if (st.gstin) det.push("GSTIN: " + st.gstin);
    if (det.length) d.text(det.join("\n"), { x: tx, y: y, w: W - tx - M - 330, size: 22, color: "rgba(255,255,255,.92)", lh: 30 });
    d.text(quote ? "QUOTATION" : "INVOICE", { x: W - M - 320, y: 38, w: 320, size: 44, weight: 700, color: "#fff", align: "right" });
    d.text((quote ? "Quotation no: " : "Invoice no: ") + (st.no || "-"), { x: W - M - 320, y: 104, w: 320, size: 24, color: "#fff", align: "right" });
    d.text("Date: " + L.dmy(st.date), { x: W - M - 320, y: 140, w: 320, size: 24, color: "#fff", align: "right" });
    if (quote && st.valid) d.text("Valid till: " + L.dmy(st.valid), { x: W - M - 320, y: 176, w: 320, size: 22, color: "#fff", align: "right" });
    y = 245;
    d.text(quote ? "PRESENTED TO" : "BILL TO", { x: M, y: y, w: 600, size: 20, weight: 700, color: "#888" }); y += 32;
    y += d.text(st.cName || "Graahak ka naam", { x: M, y: y, w: 700, size: 30, weight: 700, color: "#111" });
    var cd = []; if (st.cPhone) cd.push("Phone: " + st.cPhone); if (st.cAddr) cd.push(st.cAddr);
    if (cd.length) y += d.text(cd.join("\n"), { x: M, y: y, w: 700, size: 23, color: "#444", lh: 32 });
    d.y = y + 30;

    var rows = [], n = 0;
    (st.items || []).forEach(function (it) {
      if (!String(it.d).trim() && !L.num(it.r)) return;
      n++; rows.push([n, it.d || "-", String(L.num(it.q) || 0), "₹" + L.inr(L.num(it.r)), "₹" + L.inr(L.num(it.q) * L.num(it.r))]);
    });
    if (!rows.length) rows.push(["-", "-", "-", "-", "-"]);
    d.table([{ w: 60, title: "#" }, { w: 560, title: "Vivaran" }, { w: 110, title: "Maatra", align: "right" }, { w: 170, title: "Bhav", align: "right" }, { w: 200, title: "Rakam", align: "right" }],
      rows, { head: L.hexA(br, 0.14), headColor: "#222", size: 24 });
    d.gap(26);

    var tr = [["Jod (Subtotal)", "₹" + L.inr(c.sub)]];
    if (c.dp > 0) tr.push(["Chhoot (" + c.dp + "%)", "- ₹" + L.inr(c.disc)]);
    if (c.gp > 0) tr.push(["GST (" + c.gp + "%)", "₹" + L.inr(c.gst)]);
    if (Math.abs(c.ro) >= 0.005) tr.push(["Round off", (c.ro < 0 ? "- " : "") + "₹" + L.inr(Math.abs(c.ro))]);
    d.ensure(tr.length * 42 + 330);
    var xr = W - M - 500;
    tr.forEach(function (r) {
      d.text(r[0], { x: xr, y: d.y, w: 250, size: 24, color: "#555" });
      d.text(r[1], { x: xr + 250, y: d.y, w: 250, size: 24, align: "right", color: "#111" });
      d.y += 42;
    });
    d.x.fillStyle = br; d.x.fillRect(xr, d.y, 500, 72);
    d.text("Kul (Total)", { x: xr + 16, y: d.y + 18, w: 240, size: 30, weight: 700, color: "#fff" });
    d.text("₹" + L.inr(c.total), { x: xr + 234, y: d.y + 18, w: 250, size: 32, weight: 700, color: "#fff", align: "right" });
    d.y += 100;
    d.text(L.inrWords(c.total), { size: 22, italic: true, color: "#444" });
    d.gap(24);

    var upiOk = !quote && /^[\w.\-]+@[\w.\-]+$/.test(String(st.upi || "").trim());
    var top = d.y, leftEnd = top;
    var note = String(st.notes || "").trim();
    d.ensure(upiOk ? 330 : 120);
    top = d.y;
    if (note) {
      d.text(quote ? "Shartein" : "Notes / Shartein", { x: M, y: top, w: 640, size: 20, weight: 700, color: "#888" });
      leftEnd = top + 30 + d.text(note, { x: M, y: top + 30, w: 640, size: 22, color: "#333", lh: 31 });
    }
    var qEnd = top;
    if (upiOk) {
      var url = "upi://pay?pa=" + encodeURIComponent(st.upi.trim()) + "&pn=" + encodeURIComponent(st.bizName || "Dukaan") + "&am=" + c.total.toFixed(2) + "&cu=INR&tn=" + encodeURIComponent("Invoice " + (st.no || ""));
      try {
        L.qrDraw(d.x, W - M - 240, top, 240, url, { ecc: "M", quiet: 1 });
        d.text("UPI se bhugtan karo", { x: W - M - 260, y: top + 246, w: 260, size: 20, color: "#444", align: "center" });
        d.text(st.upi.trim(), { x: W - M - 260, y: top + 272, w: 260, size: 19, color: "#666", align: "center" });
        qEnd = top + 305;
      } catch (e) {}
    }
    d.y = Math.max(leftEnd, qEnd) + 30;
    d.ensure(190);
    d.text("For " + (st.bizName || ""), { x: W - M - 420, w: 420, size: 22, weight: 700, align: "right", color: "#222" });
    d.gap(70);
    d.hr("#999", 2, W - M - 320, W - M);
    d.text("Authorised signature", { x: W - M - 320, w: 320, size: 20, align: "right", color: "#666" });
    if (st.brandNote !== "no") d.text("TOXIC AI se banaya gaya", { x: 0, y: d.H - 50, w: d.W, size: 18, align: "center", color: "#aaa" });
    return d;
  }
  function docTool(kind) {
    var quote = kind === "quote";
    return function (root) {
      var cntKey = "toxic.pv.cnt." + kind;
      var st = { brand: "#7055E8", bizName: "", bizAddr: "", bizPhone: "", gstin: "", upi: "", logo: null,
        no: "", date: L.todayISO(), valid: "", cName: "", cPhone: "", cAddr: "", items: [{ d: "", q: 1, r: "" }], disc: "", gst: "0",
        notes: quote ? "Ye bhav 15 din tak maanya hain." : "Dhanyavaad! Dobara zaroor aayein.", brandNote: "yes" };
      var save = L.persist("toxic.pv." + kind, st, ["brand", "bizName", "bizAddr", "bizPhone", "gstin", "upi", "notes", "brandNote"]);
      var cnt = S.store.get(cntKey, 1);
      st.no = (quote ? "QT-" : "INV-") + pad3(cnt);
      var spec = [
        { t: "sec", l: "Aapki jaankari (ek baar bharo, yaad rahegi)" },
        { k: "bizName", l: "Dukaan / kaam ka naam", ph: "Jaise: Sharma General Store", max: 60 },
        { k: "bizAddr", l: "Pata", t: "textarea", rows: 2, ph: "Dukaan ka pata, shehar", max: 160 },
        { k: "bizPhone", l: "Phone", ph: "98XXXXXXXX", max: 30 },
        { k: "gstin", l: "GSTIN (agar hai)", ph: "Khaali chhod sakte ho", max: 20 }
      ];
      if (!quote) spec.push({ k: "upi", l: "UPI ID (bill par QR aayega)", ph: "naam@upi", max: 60 });
      spec.push({ k: "logo", l: "Logo (zaroori nahi)", t: "image", max: 400, hint: "Logo nahi hai" },
        { k: "brand", l: "Bill ka rang", t: "select", opts: BRANDS },
        { t: "sec", l: quote ? "Quotation ki jaankari" : "Bill ki jaankari" },
        { k: "no", l: quote ? "Quotation number" : "Invoice number", max: 24 },
        { k: "date", l: "Tareekh", t: "date" });
      if (quote) spec.push({ k: "valid", l: "Kab tak maanya", t: "date" });
      spec.push({ t: "sec", l: quote ? "Kiske liye" : "Graahak" },
        { k: "cName", l: "Naam", max: 60 }, { k: "cPhone", l: "Phone", max: 30 }, { k: "cAddr", l: "Pata", t: "textarea", rows: 2, max: 160 },
        { t: "sec", l: "Saaman / seva" },
        { k: "items", l: "Line jodo", t: "items" },
        { t: "sec", l: "Hisaab" },
        { k: "disc", l: "Chhoot (%)", t: "number", ph: "0" },
        { k: "gst", l: "GST", t: "select", opts: [["0", "GST nahi"], ["5", "5%"], ["12", "12%"], ["18", "18%"], ["28", "28%"]] },
        { k: "notes", l: quote ? "Shartein" : "Notes / Shartein", t: "textarea", rows: 3, max: 400 },
        { k: "brandNote", l: "Neeche \"TOXIC AI se banaya gaya\" likha rahe?", t: "select", opts: [["yes", "Haan"], ["no", "Nahi"]] });

      var prev = h("div", "pv-sheet"), doc = null;
      function render() {
        doc = buildDoc(st, quote);
        prev.textContent = "";
        doc.pages.forEach(function (cv) { cv.className = "pv-prev"; prev.append(cv); });
      }
      var again = L.debounce(render, 350);
      var refs;
      function change(k) { if (k !== "items" && k !== "logo") save(); if (k === "logo") L.saveImg("toxic.pv.logo", st.logo); again(); }
      refs = L.form(root, spec, st, change);
      L.loadImgSaved("toxic.pv.logo").then(function (c) { if (c && !st.logo) { st.logo = c; refs.logo.refresh(); again(); } });
      root.append(h("div", "pv-sec", "Preview"), prev);
      L.exportBar(root, function () {
        if (!String(st.bizName).trim()) throw new Error("Pehle apni dukaan ka naam likho");
        var any = st.items.some(function (it) { return String(it.d).trim(); });
        if (!any) throw new Error("Kam se kam ek saaman likho");
        render(); return doc.pages;
      }, (quote ? "quotation-" : "invoice-") + String(st.no || "1").replace(/[^\w\-]/g, ""), (quote ? "Quotation " : "Invoice ") + st.no + " - " + st.bizName, function () {
        cnt++; S.store.set(cntKey, cnt); st.no = (quote ? "QT-" : "INV-") + pad3(cnt); refs.no.refresh(); render();
      });
      root.append(h("div", "pv-note", "PDF phone mein photo ke roop mein banti hai (text copy nahi hota), par print aur WhatsApp ke liye theek hai. Jaankari sirf aapke phone mein rehti hai."));
      render();
    };
  }
  S.register({ id: "invoice", name: "Invoice Maker", run: docTool("invoice") });
  S.register({ id: "quote", name: "Quotation Maker", run: docTool("quote") });

  /* ================= VISITING CARD ================= */
  var CW = 1050, CH = 600;
  function initials(s) { var w = String(s || "").trim().split(/\s+/).filter(Boolean); return ((w[0] || "T")[0] + ((w[1] || "")[0] || "")).toUpperCase(); }
  function lines(st) {
    var a = []; if (st.phone) a.push(st.phone + (st.phone2 ? "  |  " + st.phone2 : "")); if (st.email) a.push(st.email); if (st.web) a.push(st.web); if (st.addr) a.push(st.addr);
    return a;
  }
  function drawFront(st) {
    var c = L.canvas(CW, CH), x = c.getContext("2d"), c1 = st.c1 || "#7055E8", c2 = st.c2 || "#397BFF", F = L.FONT, sty = st.style;
    function t(s, X, Y, size, w, col, al, maxW) { x.font = w + " " + size + "px " + F; x.fillStyle = col; x.textAlign = al || "left"; x.textBaseline = "alphabetic"; x.fillText(s, X, Y, maxW); x.textAlign = "left"; }
    function wrapDraw(s, X, Y, size, w, col, maxW, lh) { x.font = w + " " + size + "px " + F; x.fillStyle = col; x.textAlign = "left"; var ls = L.wrapText(x, s, maxW); ls.forEach(function (l, i) { x.fillText(l, X, Y + i * lh); }); return ls.length * lh; }
    var dets = lines(st);
    if (sty === "dark") {
      var g = x.createLinearGradient(0, 0, CW, CH); g.addColorStop(0, c1); g.addColorStop(1, c2); x.fillStyle = g; x.fillRect(0, 0, CW, CH);
      x.fillStyle = "rgba(255,255,255,.08)"; x.beginPath(); x.arc(CW - 80, 60, 230, 0, 7); x.fill();
      var lx = 70; if (st.logo) { L.drawContain(x, st.logo, 70, 60, 110, 110); }
      t(st.name || "Aapka Naam", 70, 270, 64, 700, "#fff", "left", CW - 140); t(st.title || "", 70, 320, 32, 400, "rgba(255,255,255,.85)", "left", CW - 140);
      t(st.biz || "", 70, 370, 30, 700, "#fff", "left", CW - 140);
      var yy = 440; dets.forEach(function (l) { yy += wrapDraw(l, 70, yy, 26, 400, "#fff", CW - 140, 36); });
    } else if (sty === "band") {
      x.fillStyle = "#fff"; x.fillRect(0, 0, CW, CH); x.fillStyle = c1; x.fillRect(0, 0, 300, CH);
      if (st.logo) { x.fillStyle = "#fff"; x.beginPath(); x.arc(150, 190, 90, 0, 7); x.fill(); x.save(); x.beginPath(); x.arc(150, 190, 80, 0, 7); x.clip(); L.drawCover(x, st.logo, 70, 110, 160, 160); x.restore(); }
      else { x.fillStyle = "rgba(255,255,255,.2)"; x.beginPath(); x.arc(150, 190, 90, 0, 7); x.fill(); t(initials(st.name), 150, 215, 70, 700, "#fff", "center"); }
      wrapDraw(st.biz || "", 30, 360, 28, 700, "#fff", 240, 36);
      t(st.name || "Aapka Naam", 350, 150, 54, 700, "#111", "left", CW - 390); t(st.title || "", 350, 200, 30, 400, c1, "left", CW - 390);
      x.fillStyle = c2; x.fillRect(350, 230, 90, 6);
      var y2 = 300; dets.forEach(function (l) { y2 += wrapDraw(l, 350, y2, 26, 400, "#333", CW - 390, 36) + 6; });
    } else if (sty === "center") {
      x.fillStyle = "#fff"; x.fillRect(0, 0, CW, CH); x.strokeStyle = c1; x.lineWidth = 8; x.strokeRect(24, 24, CW - 48, CH - 48);
      if (st.logo) L.drawContain(x, st.logo, CW / 2 - 50, 60, 100, 100);
      t(st.name || "Aapka Naam", CW / 2, 230, 58, 700, "#111", "center", CW - 160); t(st.title || "", CW / 2, 280, 30, 400, c1, "center", CW - 160);
      x.fillStyle = c2; x.fillRect(CW / 2 - 50, 305, 100, 5);
      var y3 = 360; if (st.biz) { t(st.biz, CW / 2, y3, 28, 700, "#222", "center", CW - 160); y3 += 14; }
      dets.forEach(function (l) { y3 += 38; t(l, CW / 2, y3, 25, 400, "#444", "center", CW - 160); });
    } else if (sty === "top") {
      x.fillStyle = "#fff"; x.fillRect(0, 0, CW, CH); x.fillStyle = c1; x.fillRect(0, 0, CW, 210);
      t(st.name || "Aapka Naam", 60, 105, 60, 700, "#fff", "left", st.logo ? CW - 260 : CW - 120); t(st.title || "", 60, 160, 30, 400, "rgba(255,255,255,.9)", "left", CW - 260);
      if (st.logo) { x.fillStyle = "#fff"; L.rrect(x, CW - 190, 40, 130, 130, 18); x.fill(); L.drawContain(x, st.logo, CW - 182, 48, 114, 114); }
      x.fillStyle = c2; x.fillRect(0, 210, CW, 10);
      t(st.biz || "", 60, 290, 32, 700, "#111", "left", CW - 120);
      var y4 = 340; dets.forEach(function (l) { y4 += wrapDraw(l, 60, y4, 26, 400, "#333", CW - 120, 36) + 6; });
    } else {
      x.fillStyle = "#fff"; x.fillRect(0, 0, CW, CH); x.fillStyle = c1; x.fillRect(0, 0, 22, CH);
      if (st.logo) L.drawContain(x, st.logo, 70, 50, 110, 110);
      t(st.name || "Aapka Naam", 70, 250, 62, 700, "#111", "left", CW - 140); t(st.title || "", 70, 300, 32, 400, c1, "left", CW - 140);
      t(st.biz || "", 70, 350, 30, 700, "#222", "left", CW - 140);
      var y5 = 410; dets.forEach(function (l) { y5 += wrapDraw(l, 70, y5, 26, 400, "#444", CW - 140, 36); });
    }
    return c;
  }
  function vcardText(st) {
    var a = ["BEGIN:VCARD", "VERSION:3.0", "FN:" + (st.name || ""), "ORG:" + (st.biz || ""), "TITLE:" + (st.title || "")];
    if (st.phone) a.push("TEL;TYPE=CELL:" + st.phone); if (st.phone2) a.push("TEL:" + st.phone2); if (st.email) a.push("EMAIL:" + st.email);
    if (st.web) a.push("URL:" + st.web); if (st.addr) a.push("ADR:;;" + st.addr.replace(/\n/g, " ") + ";;;;"); a.push("END:VCARD");
    return a.join("\n");
  }
  function drawBack(st) {
    var c = L.canvas(CW, CH), x = c.getContext("2d"), c1 = st.c1 || "#7055E8", c2 = st.c2 || "#397BFF";
    var g = x.createLinearGradient(0, 0, CW, CH); g.addColorStop(0, c1); g.addColorStop(1, c2); x.fillStyle = g; x.fillRect(0, 0, CW, CH);
    x.textAlign = "center"; x.fillStyle = "#fff"; x.textBaseline = "alphabetic";
    var cx = st.qr === "yes" ? 330 : CW / 2;
    if (st.logo) L.drawContain(x, st.logo, cx - 60, 110, 120, 120);
    x.font = "700 52px " + L.FONT; x.fillText(st.biz || st.name || "", cx, 300, st.qr === "yes" ? 560 : 900);
    if (st.tag) { x.font = "400 28px " + L.FONT; x.fillText(st.tag, cx, 350, st.qr === "yes" ? 560 : 900); }
    if (st.qr === "yes") {
      try { x.fillStyle = "#fff"; L.rrect(x, 650, 120, 330, 330, 24); x.fill(); L.qrDraw(x, 665, 135, 300, vcardText(st), { ecc: "M", quiet: 1 }); x.fillStyle = "#fff"; x.font = "400 22px " + L.FONT; x.fillText("Scan karke contact save karo", 815, 495); } catch (e) {}
    }
    x.textAlign = "left"; return c;
  }
  S.register({ id: "vcard", name: "Visiting Card Maker", run: function (root) {
    var st = { name: "", title: "", biz: "", phone: "", phone2: "", email: "", web: "", addr: "", tag: "", logo: null, style: "dark", c1: "#7055E8", c2: "#397BFF", qr: "yes" };
    var save = L.persist("toxic.pv.vcard", st, ["name", "title", "biz", "phone", "phone2", "email", "web", "addr", "tag", "style", "c1", "c2", "qr"]);
    var spec = [
      { t: "sec", l: "Card ki jaankari" },
      { k: "name", l: "Aapka naam", max: 40 }, { k: "title", l: "Pad / kaam", ph: "Jaise: Owner, Photographer", max: 50 }, { k: "biz", l: "Dukaan / company", max: 50 },
      { k: "phone", l: "Phone", max: 20 }, { k: "phone2", l: "Doosra phone (zaroori nahi)", max: 20 }, { k: "email", l: "Email", max: 60 }, { k: "web", l: "Website", max: 60 },
      { k: "addr", l: "Pata", t: "textarea", rows: 2, max: 120 }, { k: "tag", l: "Peeche likhne wali line", ph: "Jaise: Quality hi pehchan", max: 60 },
      { k: "logo", l: "Logo (zaroori nahi)", t: "image", max: 400, hint: "Logo nahi hai" },
      { t: "sec", l: "Design" },
      { k: "style", l: "Style", t: "select", opts: [["dark", "Gradient (gehra)"], ["band", "Side patti"], ["center", "Beech mein"], ["top", "Upar patti"], ["clean", "Saaf safed"]] },
      { k: "c1", l: "Pehla rang", t: "color" }, { k: "c2", l: "Doosra rang", t: "color" },
      { k: "qr", l: "Peeche QR (scan karke contact save)", t: "select", opts: [["yes", "Haan"], ["no", "Nahi"]] }
    ];
    var pf = h("canvas", "pv-prev"), pb = h("canvas", "pv-prev"), front, back;
    function render() {
      front = drawFront(st); back = drawBack(st);
      [[pf, front], [pb, back]].forEach(function (p) { p[0].width = CW; p[0].height = CH; p[0].getContext("2d").drawImage(p[1], 0, 0); });
    }
    var again = L.debounce(render, 250), refs;
    refs = L.form(root, spec, st, function (k) { if (k !== "logo") save(); else L.saveImg("toxic.pv.logo", st.logo); again(); });
    L.loadImgSaved("toxic.pv.logo").then(function (c) { if (c && !st.logo) { st.logo = c; refs.logo.refresh(); again(); } });
    root.append(h("div", "pv-sec", "Aage ka hissa"), pf, h("div", "pv-sec", "Peeche ka hissa"), pb);
    function sheetPages() {
      if (!String(st.name).trim()) throw new Error("Pehle apna naam likho");
      render();
      var cw = 525, chh = 300, gx = Math.round((1240 - 2 * cw) / 3), gy = Math.round((1754 - 5 * chh) / 6), pages = [];
      [front, back].forEach(function (img, side) {
        var pg = L.canvas(1240, 1754), x = pg.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, 1240, 1754);
        for (var r = 0; r < 5; r++) for (var cI = 0; cI < 2; cI++) {
          var X = gx + cI * (cw + gx), Y = gy + r * (chh + gy);
          x.drawImage(img, X, Y, cw, chh); x.strokeStyle = "#bbb"; x.lineWidth = 1; x.strokeRect(X, Y, cw, chh);
        }
        pages.push(pg);
      });
      return pages;
    }
    var name = "visiting-card";
    root.append(S.row(
      S.btn("Aage (PNG)", "btn-primary", function () { if (!String(st.name).trim()) { S.say("Pehle apna naam likho"); return; } render(); L.toBlob(front).then(function (b) { S.saveBlob(b, name + "-front.png"); S.say("Photo save hui"); }); }),
      S.btn("Peeche (PNG)", "", function () { render(); L.toBlob(back).then(function (b) { S.saveBlob(b, name + "-back.png"); S.say("Photo save hui"); }); })));
    root.append(S.row(
      S.btn("Print PDF (A4, 10 card)", "", function () { try { S.saveBlob(L.pdfFrom(sheetPages()), name + "-print.pdf"); S.say("PDF ban gayi"); } catch (e) { S.say(e.message); } }),
      S.btn("Share karo", "", function () { try { L.toBlob(front).then(function (b) { S.shareFile(b, name + ".png", (st.nam
