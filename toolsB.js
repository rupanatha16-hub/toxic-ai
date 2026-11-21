"use strict";
/* TOXIC AI - Premium tools B: Logo Maker, Poster Maker, Invitation Maker, Photo Collage Maker, Watermark Studio.
   Sab kuch phone ke browser mein banta hai. Photo kahin upload nahi hoti. Koi secret nahi. */
(function () {
  var S = window.ToxicStudio, L = window.ToxicLib;
  if (!S || !L) return;
  var h = S.h, F = L.FONT;

  /* ---------- saanjhe chhote kaam ---------- */
  function font(size, w, fam) { return (w || 400) + " " + Math.round(size) + "px " + (fam || F); }
  function fit(ctx, text, mk, maxW, maxH, size, min, k) {
    k = k || 1.25;
    for (; size >= min; size -= 2) { ctx.font = mk(size); var ls = L.wrapText(ctx, text, maxW); if (ls.length * size * k <= maxH) return { size: size, ls: ls, lh: size * k, font: mk(size) }; }
    ctx.font = mk(min); var l2 = L.wrapText(ctx, text, maxW); return { size: min, ls: l2, lh: min * k, font: mk(min) };
  }
  function lines(ctx, r, x, y, al, col) {
    ctx.font = r.font; ctx.fillStyle = col; ctx.textAlign = al; ctx.textBaseline = "top";
    r.ls.forEach(function (l, i) { ctx.fillText(l, x, y + i * r.lh); });
    ctx.textAlign = "left"; return r.ls.length * r.lh;
  }
  function previewTool(root, st, spec, draw, save, name, share) {
    var cv = h("canvas", "pv-prev"); cv.width = 400; cv.height = 400;
    function go() { try { draw(cv, st); } catch (e) { S.say(e.message || "Banane mein dikkat aayi"); } }
    var again = L.debounce(go, 220);
    var refs = L.form(root, spec, st, function (k) { if (save && st[k] !== null && typeof st[k] !== "object") save(); again(); });
    root.append(h("div", "pv-sec", "Preview"), cv);
    L.imageBar(root, function () { go(); return cv; }, name, share);
    go();
    return { cv: cv, refs: refs, redraw: go };
  }
  function pathIcon(ctx, d, x, y, size, col, lw) {
    ctx.save(); ctx.translate(x, y); ctx.scale(size / 24, size / 24);
    ctx.strokeStyle = col; ctx.lineWidth = lw || 1.8; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.stroke(new Path2D(d)); ctx.restore();
  }
  var ICONS = {
    star: ["Taara", "M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z"],
    heart: ["Dil", "M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"],
    bolt: ["Bijli", "M13 2L4 14h7l-1 8 9-12h-7z"],
    leaf: ["Patta", "M20 4C10 4 5 9 5 16c0 1.5.4 2.8 1 4 1.2.6 2.5 1 4 1 7 0 10-5 10-17zM5 20l8-8"],
    crown: ["Taaj", "M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"],
    shop: ["Dukaan", "M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0A2.7 2.7 0 0 0 20 9"],
    camera: ["Camera", "M4 8h3l2-3h6l2 3h3v12H4zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
    book: ["Kitaab", "M12 6v14M3 5h6a3 3 0 0 1 3 3 3 3 0 0 1 3-3h6v13h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3H3z"],
    code: ["Code", "M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"],
    food: ["Khana", "M7 3v8a2 2 0 0 0 4 0V3M9 3v18M17 3c-2 2-3 5-3 8h3v10"],
    home: ["Ghar", "M3 11l9-8 9 8M5 10v10h14V10"],
    gem: ["Heera", "M6 3h12l4 6-10 12L2 9zM2 9h20M9 3l-3 6 6 12 6-12-3-6"]
  };
  var ICON_OPTS = [["none", "Koi nahi (sirf naam ke akshar)"]].concat(Object.keys(ICONS).map(function (k) { return [k, ICONS[k][0]]; }));

  /* ================= LOGO MAKER ================= */
  function drawLogo(cv, st) {
    var W = 1000, H = 1000; cv.width = W; cv.height = H; var x = cv.getContext("2d");
    x.clearRect(0, 0, W, H);
    if (st.bg === "white") { x.fillStyle = "#fff"; x.fillRect(0, 0, W, H); }
    else if (st.bg === "dark") { x.fillStyle = "#10111B"; x.fillRect(0, 0, W, H); }
    else if (st.bg === "color") { x.fillStyle = st.c1; x.fillRect(0, 0, W, H); }
    var onColor = st.bg === "color" || st.bg === "dark";
    var txtCol = onColor ? "#fff" : (st.tc || "#111111");
    var fam = st.fam === "serif" ? 'Georgia,"Noto Serif","Noto Serif Devanagari",serif' : st.fam === "round" ? '"Trebuchet MS","Noto Sans","Noto Sans Devanagari",sans-serif' : F;
    var name = String(st.name || "Aapka Naam").trim(), tag = String(st.tag || "").trim();
    var side = st.layout === "side", showMark = st.shape !== "mnone" || st.icon !== "none" || st.logo;
    var mark = side ? 300 : 360, cx = W / 2, my;
    function drawMark(mx, my2, size) {
      x.save();
      var g = x.createLinearGradient(mx, my2, mx + size, my2 + size); g.addColorStop(0, st.c1); g.addColorStop(1, st.c2);
      if (st.shape === "circle") { x.fillStyle = g; x.beginPath(); x.arc(mx + size / 2, my2 + size / 2, size / 2, 0, 7); x.fill(); }
      else if (st.shape === "round") { x.fillStyle = g; L.rrect(x, mx, my2, size, size, size * 0.24); x.fill(); }
      else if (st.shape === "shield") {
        x.fillStyle = g; x.beginPath(); x.moveTo(mx + size * 0.1, my2 + size * 0.08); x.lineTo(mx + size * 0.9, my2 + size * 0.08); x.lineTo(mx + size * 0.9, my2 + size * 0.55);
        x.quadraticCurveTo(mx + size * 0.9, my2 + size * 0.85, mx + size / 2, my2 + size * 0.98); x.quadraticCurveTo(mx + size * 0.1, my2 + size * 0.85, mx + size * 0.1, my2 + size * 0.55); x.closePath(); x.fill();
      }
      var inner = st.shape === "mnone" ? st.c1 : "#ffffff";
      if (st.logo) { x.save(); if (st.shape === "circle") { x.beginPath(); x.arc(mx + size / 2, my2 + size / 2, size * 0.42, 0, 7); x.clip(); } L.drawContain(x, st.logo, mx + size * 0.1, my2 + size * 0.1, size * 0.8, size * 0.8); x.restore(); }
      else if (st.icon !== "none" && ICONS[st.icon]) pathIcon(x, ICONS[st.icon][1], mx + size * 0.22, my2 + size * 0.22, size * 0.56, inner, 1.7);
      else { x.fillStyle = inner; x.font = font(size * 0.42, 800, fam); x.textAlign = "center"; x.textBaseline = "middle"; var ini = name.split(/\s+/).slice(0, 2).map(function (w) { return w[0] || ""; }).join("").toUpperCase(); x.fillText(ini, mx + size / 2, my2 + size / 2 + size * 0.02); x.textAlign = "left"; }
      x.restore();
    }
    if (side) {
      var tw = W - 80 - (showMark ? mark + 50 : 0), r = fit(x, name, function (s) { return font(s, st.wt === "light" ? 300 : 800, fam); }, tw, 300, 130, 40, 1.15);
      var tr = tag ? fit(x, tag, function (s) { return font(s, 400, fam); }, tw, 120, 48, 22, 1.25) : null;
      var tot = r.ls.length * r.lh + (tr ? tr.ls.length * tr.lh + 16 : 0), top = (H - tot) / 2, tx = showMark ? 40 + mark + 50 : 40;
      if (showMark) drawMark(40, (H - mark) / 2, mark);
      var hh = lines(x, r, tx, top, "left", txtCol);
      if (tr) lines(x, tr, tx, top + hh + 16, "left", onColor ? "rgba(255,255,255,.8)" : "#666");
    } else {
      var r2 = fit(x, name, function (s) { return font(s, st.wt === "light" ? 300 : 800, fam); }, W - 120, 260, 120, 40, 1.15);
      var tr2 = tag ? fit(x, tag, function (s) { return font(s, 400, fam); }, W - 160, 100, 46, 22, 1.25) : null;
      var tot2 = (showMark ? mark + 50 : 0) + r2.ls.length * r2.lh + (tr2 ? tr2.ls.length * tr2.lh + 14 : 0), y = (H - tot2) / 2;
      if (showMark) { drawMark(cx - mark / 2, y, mark); y += mark + 50; }
      y += lines(x, r2, cx, y, "center", txtCol) + 14;
      if (tr2) lines(x, tr2, cx, y, "center", onColor ? "rgba(255,255,255,.8)" : "#666");
    }
    my = 0;
  }
  S.register({ id: "logo", name: "Logo Maker", run: function (root) {
    var st = { name: "", tag: "", icon: "star", shape: "circle", layout: "stack", fam: "sans", wt: "bold", c1: "#7055E8", c2: "#397BFF", tc: "#111111", bg: "white", logo: null };
    var save = L.persist("toxic.pv.logo.set", st, ["name", "tag", "icon", "shape", "layout", "fam", "wt", "c1", "c2", "tc", "bg"]);
    var spec = [
      { t: "sec", l: "Logo ki jaankari" },
      { k: "name", l: "Naam", ph: "Jaise: Sharma Sweets", max: 40 }, { k: "tag", l: "Chhoti line (zaroori nahi)", ph: "Jaise: Swaad ka bharosa", max: 50 },
      { t: "sec", l: "Design" },
      { k: "icon", l: "Nishaan", t: "select", opts: ICON_OPTS },
      { k: "shape", l: "Nishaan ka aakaar", t: "select", opts: [["circle", "Gola"], ["round", "Gol kone wala dibba"], ["shield", "Shield"], ["mnone", "Bina dibbe ke"]] },
      { k: "layout", l: "Jamawat", t: "select", opts: [["stack", "Nishaan upar, naam neeche"], ["side", "Nishaan left, naam right"]] },
      { k: "fam", l: "Akshar ka style", t: "select", opts: [["sans", "Saaf (Sans)"], ["serif", "Shahi (Serif)"], ["round", "Mulayam"]] },
      { k: "wt", l: "Mota ya patla", t: "select", opts: [["bold", "Mota"], ["light", "Patla"]] },
      { k: "c1", l: "Pehla rang", t: "color" }, { k: "c2", l: "Doosra rang", t: "color" }, { k: "tc", l: "Naam ka rang", t: "color" },
      { k: "bg", l: "Piche ka rang", t: "select", opts: [["white", "Safed"], ["clear", "Bina rang (transparent, sirf PNG)"], ["dark", "Gehra"], ["color", "Pehle rang jaisa"]] },
      { k: "logo", l: "Apni photo/logo lagao (zaroori nahi)", t: "image", max: 600, hint: "Nishaan ki jagah ye lagegi" }
    ];
    var pt = previewTool(root, st, spec, drawLogo, save, "logo", st.name || "Mera logo");
    root.append(h("div", "pv-note", "Ye logo aapke naam, rang aur nishaan se banta hai (koi aur ka logo copy nahi hota). \"Bina rang\" chunne par PNG button se transparent logo milega; JPG mein piche safed aayega."));
  } });

  /* ================= POSTER MAKER ================= */
  var PSIZES = { sq: [1080, 1080, "Instagram post (1:1)"], st: [1080, 1920, "Story / WhatsApp status"], a4: [1240, 1754, "A4 (print)"], fb: [1200, 630, "Facebook / banner"] };
  function drawPoster(cv, st) {
    var sz = PSIZES[st.size] || PSIZES.sq, W = sz[0], H = sz[1]; cv.width = W; cv.height = H; var x = cv.getContext("2d");
    var c1 = st.c1, c2 = st.c2, sty = st.style, light = sty === "clean";
    if (st.photo && sty !== "clean") {
      L.drawCover(x, st.photo, 0, 0, W, H);
      var ov = x.createLinearGradient(0, 0, 0, H); ov.addColorStop(0, "rgba(0,0,0,.35)"); ov.addColorStop(1, "rgba(0,0,0,.78)"); x.fillStyle = ov; x.fillRect(0, 0, W, H);
    } else if (sty === "sale") {
      x.fillStyle = c1; x.fillRect(0, 0, W, H);
      for (var i = 0; i < 28; i++) { var a0 = i * Math.PI / 14, a1 = a0 + Math.PI / 28; x.fillStyle = "rgba(255,255,255,.08)"; x.beginPath(); x.moveTo(W / 2, H * 0.4); x.arc(W / 2, H * 0.4, Math.max(W, H), a0, a1); x.closePath(); x.fill(); }
    } else if (sty === "dark") {
      x.fillStyle = "#0e0f1d"; x.fillRect(0, 0, W, H);
      [[0.1, 0.1, c1], [0.95, 0.75, c2]].forEach(function (g) { var gr = x.createRadialGradient(W * g[0], H * g[1], 0, W * g[0], H * g[1], Math.max(W, H) * 0.6); gr.addColorStop(0, L.hexA(g[2], 0.65)); gr.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = gr; x.fillRect(0, 0, W, H); });
    } else if (sty === "clean") {
      x.fillStyle = "#ffffff"; x.fillRect(0, 0, W, H); x.fillStyle = c1; x.fillRect(0, 0, W, H * 0.06); x.fillRect(0, H - H * 0.015, W, H * 0.015);
      x.fillStyle = L.hexA(c2, 0.12); x.beginPath(); x.arc(W * 0.95, H * 0.12, W * 0.28, 0, 7); x.fill();
    } else if (sty === "warm") {
      var gw = x.createLinearGradient(0, 0, 0, H); gw.addColorStop(0, c1); gw.addColorStop(1, c2); x.fillStyle = gw; x.fillRect(0, 0, W, H);
      x.fillStyle = "rgba(255,255,255,.12)"; for (var yy = 30; yy < H; yy += 60) for (var xx = (yy / 60 % 2) * 30 + 20; xx < W; xx += 60) { x.beginPath(); x.arc(xx, yy, 6, 0, 7); x.fill(); }
    } else {
      var g2 = x.createLinearGradient(0, 0, W, H); g2.addColorStop(0, c1); g2.addColorStop(1, c2); x.fillStyle = g2; x.fillRect(0, 0, W, H);
      x.fillStyle = "rgba(255,255,255,.1)"; x.beginPath(); x.arc(W * 0.9, H * 0.1, W * 0.35, 0, 7); x.fill(); x.beginPath(); x.arc(W * 0.05, H * 0.9, W * 0.28, 0, 7); x.fill();
    }
    var m = W * 0.08, tcol = light ? "#14141f" : "#ffffff", al = st.align === "left" ? "left" : "center", tx = al === "left" ? m : W / 2;
    var fh = (st.foot || "").trim() ? Math.round(Math.min(H * 0.1, W * 0.1)) : 0;
    var y = m * (light ? 1.6 : 1);
    if (st.logo) { var lh = W * 0.13, lw = lh * (st.logo.width / st.logo.height); lw = Math.min(lw, W * 0.4); lh = lw * (st.logo.height / st.logo.width); x.drawImage(st.logo, al === "left" ? m : (W - lw) / 2, y, lw, lh); y += lh + W * 0.03; }
    var avail = H - fh - m - y, boxW = W - 2 * m;
    var hd = fit(x, String(st.head || "Yahan bada heading").trim(), function (s) { return font(s, 800); }, boxW, avail * 0.42, W * 0.13, 36, 1.15);
    y += lines(x, hd, tx, y, al, light ? c1 : tcol) + W * 0.02;
    if (String(st.sub || "").trim()) { var sb = fit(x, st.sub.trim(), function (s) { return font(s, 500); }, boxW, avail * 0.15, W * 0.05, 22, 1.3); y += lines(x, sb, tx, y, al, light ? "#444" : "rgba(255,255,255,.92)") + W * 0.035; }
    var det = String(st.det || "").split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
    if (det.length) {
      var rem = H - fh - m - y, fs = Math.min(W * 0.044, rem / (det.length * 1.9));
      fs = Math.max(fs, 18); var rowH = fs * 1.8, ch = rowH * det.length + fs * 0.8, cw = boxW;
      if (y + ch > H - fh - m * 0.4) { rowH = Math.max(24, (H - fh - m * 0.4 - y) / det.length); ch = rowH * det.length; fs = Math.min(fs, rowH * 0.6); }
      x.fillStyle = light ? L.hexA(c1, 0.08) : "rgba(255,255,255,.16)"; L.rrect(x, m, y, cw, ch, 28); x.fill();
      det.forEach(function (d, i) {
        var yy2 = y + fs * 0.4 + i * rowH + rowH / 2;
        x.fillStyle = light ? c1 : c2 === c1 ? "#fff" : "#ffffff"; x.beginPath(); x.arc(m + fs * 0.9, yy2, fs * 0.22, 0, 7); x.fill();
        x.font = font(fs, 600); x.fillStyle = tcol; x.textAlign = "left"; x.textBaseline = "middle"; x.fillText(d, m + fs * 1.7, yy2, cw - fs * 2.4);
      });
      y += ch;
    }
    if (fh) {
      x.fillStyle = light ? c1 : "rgba(0,0,0,.4)"; x.fillRect(0, H - fh, W, fh);
      var fr = fit(x, st.foot.trim(), function (s) { return font(s, 700); }, W - 2 * m, fh * 0.8, W * 0.04, 16, 1.15);
      lines(x, fr, W / 2, H - fh + (fh - fr.ls.length * fr.lh) / 2, "center", "#fff");
    }
    x.textBaseline = "alphabetic";
  }
  S.register({ id: "poster", name: "Poster Maker", run: function (root) {
    var st = { size: "sq", style: "grad", head: "", sub: "", det: "", foot: "", align: "center", c1: "#7055E8", c2: "#397BFF", photo: null, logo: null };
    var save = L.persist("toxic.pv.poster", st, ["size", "style", "head", "sub", "det", "foot", "align", "c1", "c2"]);
    var spec = [
      { t: "sec", l: "Poster ka likha hua" },
      { k: "head", l: "Bada heading", ph: "Jaise: DIWALI SALE", max: 60, t: "textarea", rows: 2 },
      { k: "sub", l: "Heading ke neeche ki line", ph: "Jaise: Sabhi saaman par 30% tak chhoot", max: 100 },
      { k: "det", l: "Khaas baatein (har line alag)", t: "textarea", rows: 4, ph: "Mithai 20% off\nGift box muft\nHome delivery", max: 300 },
      { k: "foot", l: "Sabse neeche (phone / pata)", ph: "Call: 98XXXXXXXX | Kekri, Ajmer", max: 90 },
      { t: "sec", l: "Design" },
      { k: "size", l: "Size", t: "select", opts: Object.keys(PSIZES).map(function (k) { return [k, PSIZES[k][2]]; }) },
      { k: "style", l: "Style", t: "select", opts: [["grad", "Gradient"], ["sale", "Sale (kirnein)"], ["dark", "Gehra chamakdaar"], ["clean", "Saaf safed"], ["warm", "Garam rang"]] },
      { k: "align", l: "Likhavat", t: "select", opts: [["center", "Beech mein"], ["left", "Left"]] },
      { k: "c1", l: "Pehla rang", t: "color" }, { k: "c2", l: "Doosra rang", t: "color" },
      { k: "photo", l: "Piche ki photo (zaroori nahi)", t: "image", max: 1600, hint: "Photo lagane par style ke upar kaala parda aata hai" },
      { k: "logo", l: "Apna logo (zaroori nahi)", t: "image", max: 500, hint: "Logo nahi hai" }
    ];
    previewTool(root, st, spec, drawPoster, save, "poster", st.head || "Poster");
    root.append(h("div", "pv-note", "Photo ya logo sirf aapke phone mein rehta hai. Apni nahi, doosron ki photo/logo bina ijazat poster par mat lagao."));
  } });

  /* ================= INVITATION MAKER ================= */
  var THEMES = {
    wedding: { n: "Shaadi", bg: "#fff8e7", c: "#7b1e2b", acc: "#c9a227", top: "॥ श्री गणेशाय नमः ॥", head: "शुभ विवाह", msg: "आपको सपरिवार सादर आमंत्रित करते हैं", names: "राहुल  &  प्रिया" },
    birthday: { n: "Janamdin", bg: "#eef6ff", c: "#1f4fa3", acc: "#ff6fa5", top: "", head: "जन्मदिन की पार्टी", msg: "आप सादर आमंत्रित हैं", names: "आरव" },
    pooja: { n: "Pooja / Path", bg: "#fff4e0", c: "#c2410c", acc: "#e8a317", top: "॥ जय श्री राम ॥", head: "श्री सत्यनारायण कथा", msg: "आप सपरिवार आमंत्रित हैं, प्रसाद ग्रहण करें", names: "" },
    griha: { n: "Griha pravesh", bg: "#f1f8e9", c: "#1b5e20", acc: "#c9a227", top: "॥ श्री गणेशाय नमः ॥", head: "गृह प्रवेश", msg: "हमारे नए घर में आपका स्वागत है", names: "शर्मा परिवार" },
    party: { n: "Party", bg: "#1b1038", c: "#ffffff", acc: "#ff4fd8", top: "", head: "पार्टी टाइम!", msg: "आप सादर आमंत्रित हैं", names: "" }
  };
  function drawInvite(cv, st) {
    var T = THEMES[st.occ] || THEMES.wedding, W = 1080, H = 1500; cv.width = W; cv.height = H; var x = cv.getContext("2d");
    x.fillStyle = T.bg; x.fillRect(0, 0, W, H);
    x.strokeStyle = T.acc; x.lineWidth = 6; x.strokeRect(36, 36, W - 72, H - 72); x.lineWidth = 2; x.strokeRect(58, 58, W - 116, H - 116);
    [[58, 58, 1, 1], [W - 58, 58, -1, 1], [58, H - 58, 1, -1], [W - 58, H - 58, -1, -1]].forEach(function (c) {
      x.fillStyle = T.bg; x.fillRect(c[0] - (c[2] > 0 ? 0 : 60), c[1] - (c[3] > 0 ? 0 : 60), 60, 60);
      x.strokeStyle = T.acc; x.lineWidth = 3; x.beginPath(); x.arc(c[0] + c[2] * 8, c[1] + c[3] * 8, 44, c[2] > 0 ? (c[3] > 0 ? 0 : -Math.PI / 2) : (c[3] > 0 ? Math.PI / 2 : Math.PI), c[2] > 0 ? (c[3] > 0 ? Math.PI / 2 : 0) : (c[3] > 0 ? Math.PI : Math.PI * 1.5)); x.stroke();
    });
    var m = 130, bw = W - 2 * m;
    function divider(yy, x) {
      x.strokeStyle = T.acc; x.lineWidth = 3; x.beginPath(); x.moveTo(W / 2 - 220, yy); x.lineTo(W / 2 - 30, yy); x.moveTo(W / 2 + 30, yy); x.lineTo(W / 2 + 220, yy); x.stroke();
      x.fillStyle = T.acc; x.beginPath(); x.moveTo(W / 2, yy - 14); x.lineTo(W / 2 + 14, yy); x.lineTo(W / 2, yy + 14); x.lineTo(W / 2 - 14, yy); x.closePath(); x.fill();
    }
    function flow(x) {
    var y = 120;
    if (String(st.top || "").trim()) { var t = fit(x, st.top.trim(), function (s) { return font(s, 600); }, bw, 90, 40, 22, 1.3); y += lines(x, t, W / 2, y, "center", T.acc) + 20; }
    var hd = fit(x, String(st.head || "").trim() || T.head, function (s) { return font(s, 800); }, bw, 230, 104, 40, 1.2);
    y += lines(x, hd, W / 2, y, "center", T.c) + 16; divider(y + 14, x); y += 54;
    if (String(st.names || "").trim()) { var nm = fit(x, st.names.trim(), function (s) { return font(s, 700); }, bw, 220, 84, 34, 1.25); y += lines(x, nm, W / 2, y, "center", T.acc === "#ff4fd8" ? "#ff9bec" : T.c) + 18; }
    if (String(st.msg || "").trim()) { var ms = fit(x, st.msg.trim(), function (s) { return font(s, 500); }, bw, 170, 40, 22, 1.4); y += lines(x, ms, W / 2, y, "center", T.c === "#ffffff" ? "#eee" : "#444") + 30; }
    var info = []; if (st.date) info.push(["तिथि", L.dmy(st.date)]); if (st.time) info.push(["समय", st.time]); if (st.venue) info.push(["स्थान", st.venue]);
    if (info.length) {
      var yy = y, cardTop = y;
      var rows = info.map(function (r) { x.font = font(36, 600); var vls = L.wrapText(x, r[1], bw - 220); return { l: r[0], v: vls }; });
      var tot = rows.reduce(function (s, r) { return s + Math.max(1, r.v.length) * 50 + 22; }, 0) + 20;
      x.fillStyle = T.c === "#ffffff" ? "rgba(255,255,255,.08)" : L.hexA(T.acc, 0.12); L.rrect(x, m - 10, cardTop, bw + 20, tot, 26); x.fill();
      yy = cardTop + 28;
      rows.forEach(function (r) {
        x.font = font(32, 700); x.fillStyle = T.acc === "#ff4fd8" ? "#ff9bec" : T.acc; x.textAlign = "left"; x.textBaseline = "top"; x.fillText(r.l, m + 20, yy + 4);
        x.font = font(36, 600); x.fillStyle = T.c === "#ffffff" ? "#fff" : "#222"; r.v.forEach(function (l, i) { x.fillText(l, m + 200, yy + i * 50); });
        yy += Math.max(1, r.v.length) * 50 + 22;
      });
      y = cardTop + tot + 30;
    }
    if (String(st.host || "").trim()) { var ho = fit(x, st.host.trim(), function (s) { return font(s, 600); }, bw, 170, 38, 22, 1.35); y += lines(x, ho, W / 2, y, "center", T.c === "#ffffff" ? "#fff" : T.c) + 14; }
    return y;
    }
    var scratch = L.canvas(W, H), endY = flow(scratch.getContext("2d")), off = Math.max(0, Math.min(150, (H - 260 - endY) / 2));
    x.save(); x.translate(0, off); flow(x); x.restore();
    if (String(st.rsvp || "").trim()) { divider(H - 190, x); var rs = fit(x, st.rsvp.trim(), function (s) { return font(s, 600); }, bw, 90, 34, 20, 1.3); lines(x, rs, W / 2, H - 160, "center", T.c === "#ffffff" ? "#ddd" : "#555"); }
    x.textBaseline = "alphabetic";
  }
  S.register({ id: "invite", name: "Invitation Maker", run: function (root) {
    var st = { occ: "wedding", top: THEMES.wedding.top, head: THEMES.wedding.head, names: THEMES.wedding.names, msg: THEMES.wedding.msg, date: "", time: "", venue: "", host: "", rsvp: "" };
    var save = L.persist("toxic.pv.invite", st, ["occ", "top", "head", "names", "msg", "time", "venue", "host", "rsvp"]);
    var spec = [
      { t: "sec", l: "Kis mauke ka card?" },
      { k: "occ", l: "Mauka", t: "select", opts: Object.keys(THEMES).map(function (k) { return [k, THEMES[k].n]; }) },
      { t: "sec", l: "Card ka likha hua (badal sakte ho)" },
      { k: "top", l: "Sabse upar ki line", max: 60 }, { k: "head", l: "Bada heading", max: 60 }, { k: "names", l: "Naam", max: 60 }, { k: "msg", l: "Nimantran ki line", t: "textarea", rows: 2, max: 140 },
      { k: "date", l: "Tareekh", t: "date" }, { k: "time", l: "Samay", ph: "Jaise: shaam 7 baje", max: 40 }, { k: "venue", l: "Jagah", t: "textarea", rows: 2, max: 140 },
      { k: "host", l: "Nimantran dene wale", t: "textarea", rows: 2, ph: "Jaise: Darshanabhilashi: Sharma parivar", max: 140 },
      { k: "rsvp", l: "Sampark", ph: "Jaise: Phone: 98XXXXXXXX", max: 80 }
    ];
    var pt = previewTool(root, st, spec, drawInvite, save, "invitation", st.head || "Nimantran");
    var sel = pt.refs.occ.node, prev = sel.onchange;
    sel.onchange = function () {
      var T = THEMES[sel.value]; st.occ = sel.value; st.top = T.top; st.head = T.head; st.names = T.names; st.msg = T.msg;
      ["top", "head", "names", "msg"].forEach(function (k) { pt.refs[k].refresh(); }); save(); pt.redraw();
    };
    root.append(h("div", "pv-note", "Mauka badalne par upar ke likhe hue shabd us mauke ke hisaab se bhar jaate hain; aap unhe badal sakte ho. Hindi aur English dono likh sakte ho."));
  } });

  /* ================= PHOTO COLLAGE ================= */
  var LAYOUTS = {
    2: [["Do upar-neeche", [[0, 0, 1, .5], [0, .5, 1, .5]]], ["Do side-by-side", [[0, 0, .5, 1], [.5, 0, .5, 1]]]],
    3: [["Ek bada + do", [[0, 0, .6, 1], [.6, 0, .4, .5], [.6, .5, .4, .5]]], ["Upar bada + do neeche", [[0, 0, 1, .55], [0, .55, .5, .45], [.5, .55, .5, .45]]], ["Teen patti", [[0, 0, 1, 1 / 3], [0, 1 / 3, 1, 1 / 3], [0, 2 / 3, 1, 1 / 3]]]],
    4: [["2 x 2", [[0, 0, .5, .5], [.5, 0, .5, .5], [0, .5, .5, .5], [.5, .5, .5, .5]]], ["Ek bada + teen", [[0, 0, 1, .6], [0, .6, 1 / 3, .4], [1 / 3, .6, 1 / 3, .4], [2 / 3, .6, 1 / 3, .4]]]],
    5: [["Do upar + teen neeche", [[0, 0, .5, .5], [.5, 0, .5, .5], [0, .5, 1 / 3, .5], [1 / 3, .5, 1 / 3, .5], [2 / 3, .5, 1 / 3, .5]]], ["Ek bada + chaar", [[0, 0, .5, 1], [.5, 0, .25, .5], [.75, 0, .25, .5], [.5, .5, .25, .5], [.75, .5, .25, .5]]]],
    6: [["3 x 2", [[0, 0, 1 / 3, .5], [1 / 3, 0, 1 / 3, .5], [2 / 3, 0, 1 / 3, .5], [0, .5, 1 / 3, .5], [1 / 3, .5, 1 / 3, .5], [2 / 3, .5, 1 / 3, .5]]], ["2 x 3", [[0, 0, .5, 1 / 3], [.5, 0, .5, 1 / 3], [0, 1 / 3, .5, 1 / 3], [.5, 1 / 3, .5, 1 / 3], [0, 2 / 3, .5, 1 / 3], [.5, 2 / 3, .5, 1 / 3]]]]
  };
  var CSIZES = { sq: [1080, 1080, "Square (1:1)"], p45: [1080, 1350, "Post (4:5)"], st: [1080, 1920, "Story (9:16)"], l: [1600, 1000, "Chauda (16:10)"] };
  S.register({ id: "collage", name: "Photo Collage Maker", run: function (root) {
    var st = { size: "sq", gap: 12, rad: 18, bg: "#ffffff", lay: 0 }, imgs = [];
    var cv = h("canvas", "pv-prev"), info = h("div", "st-prov", "Photos chuno (2 se 6 tak)"), layBox = h("div", "pv-chips");
    cv.width = 400; cv.height = 400;
    function draw() {
      var sz = CSIZES[st.size], W = sz[0], H = sz[1]; cv.width = W; cv.height = H; var x = cv.getContext("2d");
      x.fillStyle = st.bg; x.fillRect(0, 0, W, H);
      var n = imgs.length; if (n < 2) { x.fillStyle = "#999"; x.font = font(W * 0.04, 500); x.textAlign = "center"; x.fillText("Pehle 2 ya zyada photo chuno", W / 2, H / 2); return; }
      var opts = LAYOUTS[n], lay = opts[Math.min(st.lay, opts.length - 1)][1], g = +st.gap, p = g;
      lay.forEach(function (c, i) {
        var cx = p + c[0] * (W - 2 * p) + (c[0] > 0 ? g / 2 : 0), cy = p + c[1] * (H - 2 * p) + (c[1] > 0 ? g / 2 : 0);
        var cw = c[2] * (W - 2 * p) - (c[0] > 0 ? g / 2 : 0) - (c[0] + c[2] < 0.999 ? g / 2 : 0), ch = c[3] * (H - 2 * p) - (c[1] > 0 ? g / 2 : 0) - (c[1] + c[3] < 0.999 ? g / 2 : 0);
        x.save(); L.rrect(x, cx, cy, cw, ch, +st.rad); x.clip(); L.drawCover(x, imgs[i], cx, cy, cw, ch); x.restore();
      });
    }
    function drawLayChips() {
      layBox.textContent = ""; var n = imgs.length; if (n < 2) return;
      LAYOUTS[n].forEach(function (o, i) { var b = h("button", "pv-chip" + (i === st.lay ? " on" : ""), o[0]); b.type = "button"; b.onclick = function () { st.lay = i; drawLayChips(); draw(); }; layBox.append(b); });
    }
    root.append(S.btn("Photos chuno (2 se 6)", "btn-primary btn-block", function () {
      S.pickImage(function (files) {
        info.textContent = "Photos khul rahi hain...";
        Promise.all(files.slice(0, 6).map(function (f) { return L.fileToCanvas(f, 1400); })).then(function (arr) {
          imgs = arr; st.lay = 0; info.textContent = arr.length + " photo chuni gayi" + (files.length > 6 ? " (pehli 6 li gayi)" : "") + (arr.length < 2 ? ". Kam se kam 2 chuno." : ""); drawLayChips(); draw();
        }, function (e) { S.say(e.message); });
      }, { multiple: true });
    }), info, layBox);
    var spec = [
      { k: "size", l: "Size", t: "select", opts: Object.keys(CSIZES).map(function (k) { return [k, CSIZES[k][2]]; }) },
      { k: "gap", l: "Photo ke beech ki jagah", t: "select", opts: [["0", "Koi nahi"], ["6", "Chhoti"], ["12", "Normal"], ["24", "Badi"]], def: "12" },
      { k: "rad", l: "Kone", t: "select", opts: [["0", "Seedhe"], ["18", "Halke gol"], ["40", "Bahut gol"]], def: "18" },
      { k: "bg", l: "Piche ka rang", t: "color" }
    ];
    L.form(root, spec, st, function () { draw(); });
    root.append(h("div", "pv-sec", "Preview"), cv);
    L.imageBar(root, function () { if (imgs.length < 2) { S.say("Pehle 2 ya zyada photo chuno"); return null; } draw(); return cv; }, "collage", "Mera collage");
    draw();
  } });

  /* ================= WATERMARK STUDIO ================= */
  S.register({ id: "watermark", name: "Watermark Studio", run: function (root) {
    var st = { mode: "text", text: "", pos: "br", size: 6, op: 55, rot: 0, col: "#ffffff", shadow: "yes", tile: "no", logo: null }, base = null;
    var cv = h("canvas", "pv-prev"), info = h("div", "st-prov", "Pehle photo chuno"); cv.width = 400; cv.height = 300;
    function draw() {
      if (!base) { cv.width = 400; cv.height = 240; var z = cv.getContext("2d"); z.fillStyle = "#eee"; z.fillRect(0, 0, 400, 240); z.fillStyle = "#888"; z.font = "18px sans-serif"; z.textAlign = "center"; z.fillText("Photo chuno", 200, 125); return; }
      var W = base.width, H = base.height; cv.width = W; cv.height = H; var x = cv.getContext("2d"); x.drawImage(base, 0, 0);
      var unit = Math.min(W, H) * (st.size / 100), a = st.op / 100;
      var item = null, iw = 0, ih = 0;
      if (st.mode === "logo" && st.logo) { iw = unit * 3.2; ih = iw * st.logo.height / st.logo.width; item = function (c) { c.drawImage(st.logo, -iw / 2, -ih / 2, iw, ih); }; }
      else if (st.mode === "text" && String(st.text).trim()) { x.font = font(unit, 800); iw = x.measureText(st.text).width; ih = unit; item = function (c) { c.font = font(unit, 800); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(st.text, 0, 0); }; }
      if (!item) return;
      function put(px, py, rot) {
        x.save(); x.globalAlpha = a; x.translate(px, py); x.rotate(rot * Math.PI / 180); x.fillStyle = st.col;
        if (st.shadow === "yes") { x.shadowColor = "rgba(0,0,0,.55)"; x.shadowBlur = unit * 0.15; x.shadowOffsetY = unit * 0.04; }
        item(x); x.restore();
      }
      if (st.tile === "yes") {
        var sx = iw * 1.5, sy = ih * 3.2;
        for (var yy = -H; yy < H * 2; yy += sy) for (var xx = -W; xx < W * 2; xx += sx) {
          var ox = ((yy / sy) % 2 ? sx / 2 : 0); var rx = xx + ox, ry = yy; x.save(); x.translate(W / 2, H / 2); x.rotate(-30 * Math.PI / 180); x.translate(-W / 2, -H / 2);
          x.globalAlpha = a; x.translate(rx, ry); x.fillStyle = st.col; if (st.shadow === "yes") { x.shadowColor = "rgba(0,0,0,.45)"; x.shadowBlur = unit * 0.12; } item(x); x.restore();
        }
      } else {
        var mg = Math.max(iw, ih) * 0.12 + Math.min(W, H) * 0.02, px = W / 2, py = H / 2;
        if (st.pos.indexOf("l") > -1) px = mg + iw / 2; if (st.pos.indexOf("r") > -1) px = W - mg - iw / 2;
        if (st.pos.indexOf("t") > -1) py = mg + ih / 2; if (st.pos.indexOf("b") > -1) py = H - mg - ih / 2;
        put(px, py, +st.rot);
      }
    }
    root.append(S.btn("Photo chuno", "btn-primary btn-block", function () {
      S.pickImage(function (f) { L.fileToCanvas(f[0], 2400).then(function (c) { base = c; info.textContent = c.width + " x " + c.height + " px"; draw(); }, function (e) { S.say(e.message); }); });
    }), info);
    var spec = [
      { t: "sec", l: "Watermark" },
      { k: "mode", l: "Kya lagana hai", t: "select", opts: [["text", "Naam / text"], ["logo", "Logo (photo)"]] },
      { k: "text", l: "Text", ph: "Jaise: © Sharma Photo Studio", max: 40 },
      { k: "logo", l: "Logo", t: "image", max: 800, hint: "Logo chuno (PNG transparent behtar)" },
      { k: "pos", l: "Kahan", t: "select", opts: [["tl", "Upar left"], ["t", "Upar beech"], ["tr", "Upar right"], ["l", "Beech left"], ["c", "Bilkul beech"], ["r", "Beech right"], ["bl", "Neeche left"], ["b", "Neeche beech"], ["br", "Neeche right"]], def: "br" },
      { k: "tile", l: "Poori photo par dohrao", t: "select", opts: [["no", "Nahi"], ["yes", "Haan (tirchha pattern)"]] },
      { k: "size", l: "Size (1 se 20)", t: "number", def: 6 }, { k: "op", l: "Dhundhlapan (10 se 100)", t: "number", def: 55 }, { k: "rot", l: "Ghumao (digri)", t: "number", def: 0 },
      { k: "col", l: "Rang", t: "color" }, { k: "shadow", l: "Parchhai", t: "select", opts: [["yes", "Haan"], ["no", "Nahi"]] }
    ];
    L.form(root, spec, st, function () { st.size = Math.min(20, Math.max(1, +st.size || 6)); st.op = Math.min(100, Math.max(10, +st.op || 55)); draw(); });
    root.append(h("div", "pv-sec", "Preview"), cv);
    L.imageBar(root, function () { if (!base) { S.say("Pehle photo chuno"); return null; } draw(); return cv; }, "watermark-photo", "Photo");
    root.append(h("div", "pv-note", "Photo aapke phone ke bahar kahin nahi jaati. Ek baar mein ek photo; doosri ke liye \"Photo chuno\" phir dabao. Watermark photo ki chori rokne mein madad karta hai, par poori suraksha nahi deta."));
    draw();
  } });
})();
