"use strict";
/* TOXIC AI - Premium tools C: PDF Master, Document Scanner, Image Compressor, QR Designer Pro.
   Sab kuch phone ke browser mein banta hai. Koi secret nahi, koi file bahar nahi jati.
   PDF Master ko alag file "pdf-lib.min.js" chahiye (isi folder mein). */
(function () {
  var S = window.ToxicStudio, L = window.ToxicLib;
  if (!S || !L) return;
  var h = S.h;

  /* ---------- chhote helper ---------- */
  function pick(accept, multi, cb, capture) {
    var i = document.createElement("input"); i.type = "file"; i.accept = accept;
    if (multi) i.multiple = true;
    if (capture) i.setAttribute("capture", capture);
    i.onchange = function () { var f = Array.prototype.slice.call(i.files || []); if (f.length) cb(f); };
    i.click();
  }
  function baseName(n) { return String(n || "file").replace(/\.[^.]*$/, "").replace(/[^\w\-]+/g, "_").slice(0, 30) || "file"; }
  function sliderField(label, min, max, val, fmt, fn) {
    var wrap = h("div", ""), i = S.inp("range", val), t = h("div", "st-prov", "");
    i.min = min; i.max = max; i.step = 1; i.value = val; i.style.width = "100%";
    function show() { t.textContent = fmt(+i.value); }
    i.oninput = function () { show(); fn(+i.value); };
    show(); wrap.append(i, t);
    return { node: S.field(label, wrap), input: i, show: show };
  }
  function selectField(label, opts, val, fn) {
    var s = h("select", "select");
    opts.forEach(function (o) { var op = h("option", "", o[1]); op.value = o[0]; s.append(op); });
    s.value = val; s.onchange = function () { fn(s.value); };
    return { node: S.field(label, s), input: s };
  }
  function copyCanvas(c) { var t = L.canvas(c.width, c.height); t.getContext("2d").drawImage(c, 0, 0); return t; }
  function rotateCanvas(c, deg) {
    var q = ((deg % 360) + 360) % 360, sw = q === 90 || q === 270, t = L.canvas(sw ? c.height : c.width, sw ? c.width : c.height), x = t.getContext("2d");
    x.translate(t.width / 2, t.height / 2); x.rotate(q * Math.PI / 180); x.drawImage(c, -c.width / 2, -c.height / 2);
    return t;
  }

  /* ================= IMAGE COMPRESSOR ================= */
  S.register({ id: "compress", name: "Image Compressor", run: function (root) {
    var st = { q: 70, side: "1600" }, file = null, src = null, out = null, url = null;
    var info = h("div", "pv-note", "Photo chuno, phir quality aur size chuno. Photo JPG banegi (transparent hissa safed ho jata hai).");
    var prev = h("div", "pv-sheet");
    var pickBtn = S.btn("Photo chuno", "btn-primary btn-block", function () {
      pick("image/*", false, function (fs) {
        file = fs[0]; info.textContent = "Photo khul rahi hai...";
        L.fileToCanvas(file, 4000).then(function (c) { src = c; run(); }, function (e) { info.textContent = e.message || "Photo nahi khuli"; });
      });
    });
    var qs = sliderField("Quality (kam = file chhoti)", 20, 95, st.q, function (v) { return v + "%"; }, function (v) { st.q = v; again(); });
    var sd = selectField("Photo ki lambai-chaudai (px)", [["0", "Jaisi hai waisi"], ["2000", "2000 px"], ["1600", "1600 px (WhatsApp jaisi)"], ["1200", "1200 px"], ["800", "800 px (bahut chhoti)"]], st.side, function (v) { st.side = v; again(); });
    function run() {
      if (!src) return;
      var s = st.side === "0" ? 1 : Math.min(1, +st.side / Math.max(src.width, src.height));
      var c = L.canvas(Math.max(1, Math.round(src.width * s)), Math.max(1, Math.round(src.height * s))), x = c.getContext("2d");
      x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); x.drawImage(src, 0, 0, c.width, c.height);
      L.toBlob(c, "image/jpeg", st.q / 100).then(function (b) {
        out = b;
        var msg = "Pehle: " + S.fmtSize(file.size) + "  ->  Ab: " + S.fmtSize(b.size) + " (" + c.width + " x " + c.height + " px).";
        if (b.size < file.size) msg += " " + Math.round((1 - b.size / file.size) * 100) + "% chhoti ho gayi.";
        else msg += " Ye photo pehle se hi chhoti thi, isliye fayda nahi hua. Quality ya size aur kam karo.";
        info.textContent = msg;
        if (url) URL.revokeObjectURL(url);
        url = URL.createObjectURL(b);
        var im = h("img", ""); im.src = url; im.alt = "Chhoti photo"; im.style.maxWidth = "100%"; im.style.borderRadius = "10px";
        prev.textContent = ""; prev.append(im);
      }, function (e) { info.textContent = e.message || "Photo nahi ban payi"; });
    }
    var again = L.debounce(run, 300);
    root.append(pickBtn, info, qs.node, sd.node, prev);
    root.append(S.row(
      S.btn("Download (JPG)", "btn-primary", function () { if (!out) { S.say("Pehle photo chuno"); return; } S.saveBlob(out, baseName(file.name) + "-small.jpg"); S.say("Photo save hui"); }),
      S.btn("Share karo", "", function () { if (!out) { S.say("Pehle photo chuno"); return; } S.shareFile(out, baseName(file.name) + "-small.jpg", "Chhoti photo"); })));
    root.append(h("div", "pv-note", "Photo sirf aapke phone mein badalti hai, kahin upload nahi hoti. Bahut badi photo 4000 px par ruk jati hai."));
  } });

  /* ================= DOCUMENT SCANNER ================= */
  function applyFilter(c, mode) {
    if (mode === "orig") return;
    var x = c.getContext("2d"), w = c.width, hh = c.height, im = x.getImageData(0, 0, w, hh), d = im.data, n = w * hh, i, g = new Uint8ClampedArray(n);
    for (i = 0; i < n; i++) g[i] = (d[i * 4] * 0.299 + d[i * 4 + 1] * 0.587 + d[i * 4 + 2] * 0.114) | 0;
    if (mode === "gray") {
      for (i = 0; i < n; i++) { d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = g[i]; }
    } else {
      var W1 = w + 1, I = new Uint32Array(W1 * (hh + 1)), xx, yy, rs;
      for (yy = 0; yy < hh; yy++) { rs = 0; for (xx = 0; xx < w; xx++) { rs += g[yy * w + xx]; I[(yy + 1) * W1 + xx + 1] = I[yy * W1 + xx + 1] + rs; } }
      var rad = Math.max(8, Math.round(Math.max(w, hh) / 24));
      for (yy = 0; yy < hh; yy++) {
        var y0 = Math.max(0, yy - rad), y1 = Math.min(hh, yy + rad + 1);
        for (xx = 0; xx < w; xx++) {
          var x0 = Math.max(0, xx - rad), x1 = Math.min(w, xx + rad + 1), p = yy * w + xx, o = p * 4;
          var m = (I[y1 * W1 + x1] - I[y0 * W1 + x1] - I[y1 * W1 + x0] + I[y0 * W1 + x0]) / ((x1 - x0) * (y1 - y0)), r = g[p] / (m + 1), v;
          if (mode === "bw") { v = r >= 0.86 ? 255 : 0; d[o] = d[o + 1] = d[o + 2] = v; }
          else if (mode === "clean") { v = r >= 0.92 ? 255 : Math.round(255 * Math.pow(r / 0.92, 3)); d[o] = d[o + 1] = d[o + 2] = v; }
          else { var f = Math.min(2.5, 250 / (m + 1)); d[o] = Math.min(255, d[o] * f); d[o + 1] = Math.min(255, d[o + 1] * f); d[o + 2] = Math.min(255, d[o + 2] * f); }
        }
      }
    }
    x.putImageData(im, 0, 0);
  }
  /* kinare ka ANDAZA: kagaz aksar peeche se halka hota hai */
  function guessEdges(c) {
    var s = Math.min(1, 300 / Math.max(c.width, c.height)), w = Math.max(8, Math.round(c.width * s)), hh = Math.max(8, Math.round(c.height * s));
    var t = L.canvas(w, hh), x = t.getContext("2d"); x.drawImage(c, 0, 0, w, hh);
    var d = x.getImageData(0, 0, w, hh).data, n = w * hh, g = new Uint8Array(n), hist = new Array(256).fill(0), i;
    for (i = 0; i < n; i++) { g[i] = (d[i * 4] * 0.299 + d[i * 4 + 1] * 0.587 + d[i * 4 + 2] * 0.114) | 0; hist[g[i]]++; }
    var sum = 0, sumB = 0, wB = 0, best = 0, th = 128;
    for (i = 0; i < 256; i++) sum += i * hist[i];
    for (i = 0; i < 256; i++) { wB += hist[i]; if (!wB) continue; var wF = n - wB; if (!wF) break; sumB += i * hist[i]; var mB = sumB / wB, mF = (sum - sumB) / wF, bv = wB * wF * (mB - mF) * (mB - mF); if (bv > best) { best = bv; th = i; } }
    var top = -1, bot = -1, lef = -1, rig = -1, yy, xx, cnt;
    for (yy = 0; yy < hh; yy++) { cnt = 0; for (xx = 0; xx < w; xx++) if (g[yy * w + xx] > th) cnt++; if (cnt / w > 0.35) { if (top < 0) top = yy; bot = yy; } }
    for (xx = 0; xx < w; xx++) { cnt = 0; for (yy = 0; yy < hh; yy++) if (g[yy * w + xx] > th) cnt++; if (cnt / hh > 0.35) { if (lef < 0) lef = xx; rig = xx; } }
    if (top < 0 || lef < 0 || (bot - top) < hh * 0.3 || (rig - lef) < w * 0.3) return null;
    var pc = function (v, tot) { return Math.max(0, Math.min(45, Math.round(v * 100 / tot))); };
    return { t: Math.max(0, pc(top, hh) - 1), b: Math.max(0, pc(hh - 1 - bot, hh) - 1), l: Math.max(0, pc(lef, w) - 1), r: Math.max(0, pc(w - 1 - rig, w) - 1) };
  }
  S.register({ id: "scanner", name: "Document Scanner", run: function (root) {
    var st = { filter: "clean", t: 0, b: 0, l: 0, r: 0 }, base = null, result = null, pages = [];
    var info = h("div", "pv-note", "Kagaz ki photo khicho ya gallery se chuno. Roshni achhi rakho aur kagaz seedha rakho.");
    var prev = h("div", "pv-sheet"), cnt = h("div", "st-prov", "");
    var sl = {};
    function render() {
      if (!base) return;
      var w = base.width, hh = base.height, sx = Math.round(w * st.l / 100), sy = Math.round(hh * st.t / 100);
      var cw = Math.max(20, w - sx - Math.round(w * st.r / 100)), ch = Math.max(20, hh - sy - Math.round(hh * st.b / 100));
      var c = L.canvas(cw, ch); c.getContext("2d").drawImage(base, sx, sy, cw, ch, 0, 0, cw, ch);
      try { applyFilter(c, st.filter); } catch (e) { S.say("Filter nahi laga"); }
      result = c; c.className = "pv-prev"; prev.textContent = ""; prev.append(c);
    }
    var again = L.debounce(render, 300);
    function load(fs) {
      info.textContent = "Photo khul rahi hai...";
      L.fileToCanvas(fs[0], 1800).then(function (c) { base = c; st.t = st.b = st.l = st.r = 0; syncSliders(); info.textContent = "Photo aa gayi. Neeche filter aur kinare theek karo."; render(); }, function (e) { info.textContent = e.message || "Photo nahi khuli"; });
    }
    root.append(S.row(S.btn("Camera se khicho", "btn-primary", function () { pick("image/*", false, load, "environment"); }), S.btn("Gallery se chuno", "", function () { pick("image/*", false, load); })), info);
    var fl = selectField("Filter", [["clean", "Saaf kagaz (safed peeche)"], ["bw", "Kaala-safed"], ["color", "Rangeen saaf"], ["gray", "Grey"], ["orig", "Jaisi hai waisi"]], st.filter, function (v) { st.filter = v; again(); });
    root.append(fl.node);
    root.append(S.row(
      S.btn("Ghumao", "", function () { if (!base) { S.say("Pehle photo chuno"); return; } base = rotateCanvas(base, 90); st.t = st.b = st.l = st.r = 0; syncSliders(); render(); }),
      S.btn("Kinare (andaza)", "", function () {
        if (!base) { S.say("Pehle photo chuno"); return; }
        var g = guessEdges(base);
        if (!g) { S.say("Kinare pakad mein nahi aaye, neeche patti se haath se kaato"); return; }
        st.t = g.t; st.b = g.b; st.l = g.l; st.r = g.r; syncSliders(); render(); S.say("Ye sirf andaza hai, patti se theek kar lo");
      })));
    [["t", "Upar se kaato"], ["b", "Neeche se kaato"], ["l", "Bayen se kaato"], ["r", "Dayen se kaato"]].forEach(function (k) {
      sl[k[0]] = sliderField(k[1], 0, 45, 0, function (v) { return v + "%"; }, function (v) { st[k[0]] = v; again(); });
      root.append(sl[k[0]].node);
    });
    function syncSliders() { ["t", "b", "l", "r"].forEach(function (k) { sl[k].input.value = st[k]; sl[k].show(); }); }
    root.append(h("div", "pv-sec", "Scan"), prev);
    function upd() { cnt.textContent = pages.length ? pages.length + " page jod chuke hain. PDF mein sab aayenge." : "Abhi koi page nahi joda. PDF mein ye ek page jaayega."; }
    root.append(S.row(
      S.btn("Ye page jodo", "btn-primary", function () { if (!result) { S.say("Pehle photo chuno"); return; } if (pages.length >= 30) { S.say("30 page se zyada nahi"); return; } pages.push(copyCanvas(result)); upd(); S.say("Page " + pages.length + " jud gaya. Ab agla page chuno"); }),
      S.btn("Saari page hatao", "", function () { pages = []; upd(); })), cnt);
    upd();
    L.exportBar(root, function () { if (pages.length) return pages; if (!result) throw new Error("Pehle photo chuno"); return [result]; }, "scan-" + L.todayISO(), "Scan ki hui file");
    root.append(h("div", "pv-note", "Ye seedhi photo ko saaf karta hai. Tedhi photo ko seedha nahi karta (kinare ka pata sirf andaza hai). PDF photo jaisi banti hai, text copy nahi hota."));
  } });

  /* ================= PDF MASTER ================= */
  function loadPdfLib() {
    return new Promise(function (res, rej) {
      if (window.PDFLib) { res(window.PDFLib); return; }
      var s = document.createElement("script"); s.src = "pdf-lib.min.js";
      s.onload = function () { if (window.PDFLib) res(window.PDFLib); else rej(new Error("pdf-lib theek se nahi khuli")); };
      s.onerror = function () { rej(new Error("pdf-lib.min.js file nahi mili. Ye file GitHub par chadhani hogi.")); };
      document.head.appendChild(s);
    });
  }
  function parseRange(txt, n) {
    var out = [], seen = {}, parts = String(txt || "").replace(/\s+/g, "").split(",").filter(Boolean);
    if (!parts.length) throw new Error("Page number likho, jaise 1-3,5");
    parts.forEach(function (p) {
      var m = /^(\d+)(?:-(\d+))?$/.exec(p);
      if (!m) throw new Error("\"" + p + "\" samajh nahi aaya. Aise likho: 1-3,5,8");
      var a = +m[1], b = m[2] ? +m[2] : a, step = a <= b ? 1 : -1, k;
      if (a < 1 || b < 1 || a > n || b > n) throw new Error("PDF mein sirf " + n + " page hain");
      for (k = a; k !== b + step; k += step) if (!seen[k]) { seen[k] = 1; out.push(k - 1); }
    });
    return out;
  }
  function pdfErr(e) {
    var m = String((e && e.message) || e || "");
    if (/encrypt/i.test(m + (e && e.name))) return "Ye PDF password wali hai. Ye tool ise nahi khol sakta.";
    if (/pdf-lib/.test(m)) return m;
    return "Ye PDF khul nahi payi (kharab ya bahut badi ho sakti hai).";
  }
  S.register({ id: "pdfmaster", name: "PDF Master", run: function (root) {
    var mode = "merge", files = [], one = null, body = h("div", ""), res = h("div", ""), busy = false;
    var MAX = 60 * 1024 * 1024;
    function readFile(f) { if (f.size > MAX) return Promise.reject(new Error("\"" + f.name + "\" bahut badi hai (60 MB se zyada)")); return f.arrayBuffer(); }
    function showResult(bytes, name) {
      var b = new Blob([bytes], { type: "application/pdf" });
      res.textContent = "";
      res.append(h("div", "pv-note", "Taiyaar: " + name + " (" + S.fmtSize(b.size) + ")"),
        S.row(S.btn("PDF download", "btn-primary", function () { S.saveBlob(b, name); S.say("PDF save hui"); }), S.btn("Share karo", "", function () { S.shareFile(b, name, name); })));
    }
    function work(btn, label, fn) {
      if (busy) return; busy = true; var old = btn.textContent; btn.disabled = true; btn.textContent = label; res.textContent = "";
      loadPdfLib().then(function (lib) { return fn(lib); }).then(function (r) { showResult(r.bytes, r.name); }, function (e) { S.say(pdfErr(e)); res.textContent = ""; res.append(h("div", "pv-note", pdfErr(e))); })
        .then(function () { busy = false; btn.disabled = false; btn.textContent = old; });
    }
    function filePicker(multi, onDone) {
      return S.btn(multi ? "PDF files chuno" : "PDF chuno", "btn-block", function () {
        pick("application/pdf,.pdf", multi, function (fs) {
          Promise.all(fs.map(function (f) { return readFile(f).then(function (buf) { return { name: f.name, size: f.size, buf: buf }; }); })).then(function (list) { onDone(list); }, function (e) { S.say(e.message); });
        });
      });
    }
    function loadOne(list, then) {
      var f = list[0];
      loadPdfLib().then(function (lib) { return lib.PDFDocument.load(f.buf); }).then(function (doc) { f.pages = doc.getPageCount(); one = f; res.textContent = ""; then(); }, function (e) { one = null; S.say(pdfErr(e)); then(); });
    }
    function draw() {
      body.textContent = "";
      if (mode === "merge") {
        var lst = h("div", "");
        var rl = function () {
          lst.textContent = "";
          if (!files.length) { lst.append(h("div", "st-prov", "Abhi koi PDF nahi chuni (kam se kam 2 chahiye)")); return; }
          files.forEach(function (f, ix) {
            var r = h("div", "pv-item");
            r.append(h("div", "", (ix + 1) + ". " + f.name + " (" + S.fmtSize(f.size) + ")"),
              S.row(S.btn("Upar", "", function () { if (ix > 0) { files.splice(ix - 1, 0, files.splice(ix, 1)[0]); rl(); } }),
                S.btn("Neeche", "", function () { if (ix < files.length - 1) { files.splice(ix + 1, 0, files.splice(ix, 1)[0]); rl(); } }),
                S.btn("Hatao", "", function () { files.splice(ix, 1); rl(); })));
            lst.append(r);
          });
        };
        body.append(filePicker(true, function (list) { files = files.concat(list).slice(0, 20); rl(); }), lst);
        rl();
        var mb = S.btn("Jodkar PDF banao", "btn-primary btn-block", function () {
          if (files.length < 2) { S.say("Kam se kam 2 PDF chuno"); return; }
          work(mb, "Jod raha hoon...", function (lib) {
            var P = lib.PDFDocument, chain = P.create(), outDoc;
            return chain.then(function (o) {
              outDoc = o; var p = Promise.resolve();
              files.forEach(function (f) { p = p.then(function () { return P.load(f.buf); }).then(function (src) { return outDoc.copyPages(src, src.getPageIndices()); }).then(function (pgs) { pgs.forEach(function (x) { outDoc.addPage(x); }); }); });
              return p;
            }).then(function () { return outDoc.save(); }).then(function (bytes) { return { bytes: bytes, name: "joda-hua-" + L.todayISO() + ".pdf" }; });
          });
        });
        body.append(mb);
      } else {
        var info = h("div", "st-prov", one ? one.name + " - " + one.pages + " page" : "Abhi koi PDF nahi chuni");
        var pr = S.inp("text", ""); pr.placeholder = mode === "extract" ? "Jaise: 1-3,5,8" : "Khali = sab page. Ya: 2,4-6";
        var an = null;
        body.append(filePicker(false, function (list) { loadOne(list, draw); }), info);
        if (mode === "extract") {
          body.append(S.field("Kaun se page nikalne hain", pr), h("div", "pv-note", "Jitne page likhoge utne naye PDF mein aayenge. Pura baantna ho to alag-alag hisse (jaise 1-5 phir 6-10) do baar nikalo."));
          var eb = S.btn("Ye page nikalo", "btn-primary btn-block", function () {
            if (!one) { S.say("Pehle PDF chuno"); return; }
            var idx; try { idx = parseRange(pr.value, one.pages); } catch (e) { S.say(e.message); return; }
            work(eb, "Nikal raha hoon...", function (lib) {
              var P = lib.PDFDocument, o;
              return P.load(one.buf).then(function (src) { return P.create().then(function (d) { o = d; return o.copyPages(src, idx); }); })
                .then(function (pgs) { pgs.forEach(function (x) { o.addPage(x); }); return o.save(); })
                .then(function (bytes) { return { bytes: bytes, name: baseName(one.name) + "-pages.pdf" }; });
            });
          });
          body.append(eb);
        } else {
          an = selectField("Kitna ghumana hai", [["90", "Seedhe haath (90)"], ["180", "Ulta (180)"], ["270", "Ulte haath (90)"]], "90", function () {});
          body.append(an.node, S.field("Kaun se page (khali = sab)", pr));
          var rb = S.btn("Ghumakar PDF banao", "btn-primary btn-block", function () {
            if (!one) { S.say("Pehle PDF chuno"); return; }
            var idx; try { idx = String(pr.value).trim() ? parseRange(pr.value, one.pages) : null; } catch (e) { S.say(e.message); return; }
            work(rb, "Ghuma raha hoon...", function (lib) {
              return lib.PDFDocument.load(one.buf).then(function (doc) {
                var pgs = doc.getPages(), ang = +an.input.value;
                (idx || pgs.map(function (_, k) { return k; })).forEach(function (k) { pgs[k].setRotation(lib.degrees((pgs[k].getRotation().angle + ang) % 360)); });
                return doc.save();
              }).then(function (bytes) { return { bytes: bytes, name: baseName(one.name) + "-ghuma.pdf" }; });
            });
          });
          body.append(rb);
        }
      }
    }
    var ms = selectField("Kya karna hai", [["merge", "PDF jodo (merge)"], ["extract", "Page nikalo / baanto"], ["rotate", "PDF ghumao (rotate)"]], mode, function (v) { mode = v; one = null; res.textContent = ""; draw(); });
    root.append(ms.node, body, res);
    root.append(h("div", "pv-note", "Sach: ye tool PDF ke andar ka text jaisa tha waisa hi rakhta hai. Asli PDF compress (size ghatana) free mein yahan nahi hota. Sab kaam aapke phone mein hota hai, file kahin upload nahi hoti."));
    draw();
  } });

  /* ================= QR DESIGNER PRO ================= */
  function lum(hex) {
    var m = /^#?([0-9a-f]{6})$/i.exec(hex || ""); if (!m) return 0.5;
    var v = [0, 2, 4].map(function (i) { var c = parseInt(m[1].substr(i, 2), 16) / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); });
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
  }
  function contrast(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function wifiEsc(s) { return String(s || "").replace(/([\\;,:"])/g, "\\$1"); }
  function qrText(st) {
    var k = st.kind, t = String(st.text || "").trim(), ph = String(st.phone || "").replace(/[^\d+]/g, "");
    if (k === "text") return t;
    if (k === "url") return t && !/^[a-z][a-z0-9+.\-]*:/i.test(t) ? "https://" + t : t;
    if (k === "phone") return ph ? "tel:" + ph : "";
    if (k === "whatsapp") {
      var d = ph.replace(/\D/g, ""); if (d.length === 10) d = "91" + d; if (!d) return "";
      return "https://wa.me/" + d + (String(st.msg || "").trim() ? "?text=" + encodeURIComponent(st.msg.trim()) : "");
    }
    if (k === "upi") {
      var u = String(st.upi || "").trim(); if (!/^[\w.\-]+@[\w.\-]+$/.test(u)) return "";
      var am = L.num(st.am);
      return "upi://pay?pa=" + encodeURIComponent(u) + (st.pn ? "&pn=" + encodeURIComponent(st.pn) : "") + (am > 0 ? "&am=" + am.toFixed(2) : "") + "&cu=INR";
    }
    if (k === "wifi") {
      if (!String(st.ssid || "").trim()) return "";
      var nop = st.sec === "nopass";
      return "WIFI:T:" + (nop ? "nopass" : "WPA") + ";S:" + wifiEsc(st.ssid) + ";" + (nop ? "" : "P:" + wifiEsc(st.wp) + ";") + ";";
    }
    return t;
  }
  S.register({ id: "qrpro", name: "QR Designer Pro", run: function (root) {
    var st = { kind: "url", text: "", phone: "", msg: "", upi: "", pn: "", am: "", ssid: "", wp: "", sec: "wpa", style: "round", eye: "round", fg: "#10111B", grad: "no", fg2: "#7055E8", bg: "#FFFFFF", cap: "", logo: null };
    var save = L.persist("toxic.pv.qrpro", st, ["style", "eye", "fg", "grad", "fg2", "bg", "cap"]);
    var spec = [
      { t: "sec", l: "QR mein kya rakhna hai" },
      { k: "kind", l: "Kisliye", t: "select", opts: [["url", "Website / Link"], ["text", "Likhawat"], ["whatsapp", "WhatsApp number"], ["upi", "UPI bhugtan"], ["wifi", "WiFi"], ["phone", "Phone number"]] },
      { k: "text", l: "Link ya likhawat", t: "textarea", rows: 3, max: 600, ph: "Jaise: rupanatha16-hub.github.io" },
      { k: "phone", l: "Phone number", max: 18, ph: "10 ank, jaise 9876543210" },
      { k: "msg", l: "Pehle se likha message (zaroori nahi)", max: 200 },
      { k: "upi", l: "UPI ID", max: 60, ph: "naam@bank" }, { k: "pn", l: "Naam (zaroori nahi)", max: 40 }, { k: "am", l: "Rakam Rs (zaroori nahi)", t: "number" },
      { k: "ssid", l: "WiFi ka naam", max: 40 }, { k: "wp", l: "WiFi ka password", max: 60 },
      { k: "sec", l: "WiFi surakshit hai?", t: "select", opts: [["wpa", "Haan, password hai"], ["nopass", "Nahi, khula hai"]] },
      { t: "sec", l: "Design" },
      { k: "style", l: "Dot ka roop", t: "select", opts: [["square", "Chaukor"], ["round", "Gol kone"], ["dot", "Gol bindu"]] },
      { k: "eye", l: "Teen bade kone", t: "select", opts: [["round", "Gol"], ["square", "Chaukor"]] },
      { k: "fg", l: "QR ka rang", t: "color" },
      { k: "grad", l: "Do rang ka mel (gradient)", t: "select", opts: [["no", "Nahi"], ["yes", "Haan"]] },
      { k: "fg2", l: "Doosra rang", t: "color" },
      { k: "bg", l: "Peeche ka rang", t: "color" },
      { k: "logo", l: "Beech mein logo (zaroori nahi)", t: "image", max: 400, hint: "Logo nahi hai" },
      { k: "cap", l: "Neeche likhawat (zaroori nahi)", max: 30, ph: "Jaise: Scan karo" }
    ];
    var info = h("div", "pv-note", ""), prev = h("div", "pv-sheet"), cv = null;
    var refs = L.form(root, spec, st, function (k) { if (k !== "logo") save(); if (k === "kind" || k === "grad") vis(); again(); });
    var SHOW = { url: ["text"], text: ["text"], whatsapp: ["phone", "msg"], upi: ["upi", "pn", "am"], wifi: ["ssid", "wp", "sec"], phone: ["phone"] };
    function vis() {
      ["text", "phone", "msg", "upi", "pn", "am", "ssid", "wp", "sec"].forEach(function (k) { var n = refs[k] && refs[k].node; if (n && n.parentElement && n.parentElement !== root) n.parentElement.style.display = SHOW[st.kind].indexOf(k) >= 0 ? "" : "none"; });
      var g = refs.fg2 && refs.fg2.node; if (g && g.parentElement && g.parentElement !== root) g.parentElement.style.display = st.grad === "yes" ? "" : "none";
    }
    function render() {
      var txt = qrText(st), P = 60, Q = 880, capH = String(st.cap || "").trim() ? 130 : 0;
      if (!txt) { cv = null; prev.textContent = ""; info.textContent = "Upar jaankari bharo, QR yahin banega."; return; }
      var c = L.canvas(1000, 1000 + capH), x = c.getContext("2d");
      x.fillStyle = st.bg; x.fillRect(0, 0, c.width, c.height);
      var hasLogo = !!st.logo, o = { ecc: hasLogo ? "H" : "M", quiet: 0, fg: st.fg, bg: st.bg, style: st.style, eye: st.eye };
      if (st.grad === "yes") o.grad = [st.fg, st.fg2];
      try { L.qrDraw(x, P, P, Q, txt, o); } catch (e) { cv = null; prev.textContent = ""; info.textContent = e.message || "QR nahi ban paya"; return; }
      if (hasLogo) {
        var ls = Q * 0.2, lx = P + (Q - ls) / 2, ly = P + (Q - ls) / 2;
        x.fillStyle = st.bg; L.rrect(x, lx - 14, ly - 14, ls + 28, ls + 28, 24); x.fill();
        L.drawContain(x, st.logo, lx, ly, ls, ls);
      }
      if (capH) {
        x.fillStyle = st.fg; L.rrect(x, P, 1000 - 20, Q, 90, 24); x.fill();
        x.fillStyle = contrast("#ffffff", st.fg) >= contrast("#000000", st.fg) ? "#ffffff" : "#000000"; x.font = "700 48px " + L.FONT; x.textAlign = "center"; x.textBaseline = "middle";
        x.fillText(String(st.cap).trim(), 500, 1000 - 20 + 45, Q - 40);
      }
      cv = c; c.className = "pv-prev"; prev.textContent = ""; prev.append(c);
      var w = [];
      if (contrast(st.fg, st.bg) < 3 || (st.grad === "yes" && contrast(st.fg2, st.bg) < 3)) w.push("Rang peeche se bahut milte hain, QR scan na ho sakta hai.");
      if (lum(st.fg) > lum(st.bg)) w.push("QR ka rang peeche se halka hai; kuch phone ise scan nahi karte. Kaala/gehra rang sabse safe hai.");
      w.push("Chhapne ya baantne se pehle apne phone se scan karke jaancho.");
      info.textContent = w.join(" ");
    }
    var again = L.debounce(render, 300);
    root.append(h("div", "pv-sec", "QR"), prev, info);
    L.imageBar(root, function () { if (!cv) { S.say("Pehle jaankari bharo"); return null; } return cv; }, "qr-" + L.todayISO(), "Mera QR");
    vis(); render();
  } });
})();
