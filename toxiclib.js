"use strict";
/* TOXIC AI - Premium tools ka saanjha saaman (QR, document banane ka engine, form, share, PDF).
   Koi secret nahi. Ye file akeli kuch nahi dikhati; toolsA/B/C/D.js isse kaam lete hain. */
(function () {
  var S = window.ToxicStudio;
  if (!S) return;
  var h = S.h;
  var FONT = '"Noto Sans","Noto Sans Devanagari","Mukta",Roboto,"Segoe UI",Arial,sans-serif';

  /* ---------- chhote helper ---------- */
  function todayISO() { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function dmy(iso) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || ""); return m ? m[3] + "/" + m[2] + "/" + m[1] : (iso || ""); }
  function num(v) { var n = parseFloat(v); return isFinite(n) ? n : 0; }
  function inr(n) { return Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  var ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  var TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  function two(n) { return n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? " " + ONES[n % 10] : ""); }
  function three(n) { var s = ""; if (n >= 100) { s = ONES[Math.floor(n / 100)] + " Hundred"; n %= 100; if (n) s += " "; } return s + (n ? two(n) : ""); }
  function inrWords(n) {
    n = Math.round(Math.abs(n));
    if (n === 0) return "Rupees Zero Only";
    var parts = [], cr = Math.floor(n / 10000000); n %= 10000000;
    var lk = Math.floor(n / 100000); n %= 100000;
    var th = Math.floor(n / 1000); n %= 1000;
    if (cr) parts.push(three(cr) + " Crore");
    if (lk) parts.push(two(lk) + " Lakh");
    if (th) parts.push(two(th) + " Thousand");
    if (n) parts.push(three(n));
    return "Rupees " + parts.join(" ") + " Only";
  }
  function canvas(w, hh) { var c = document.createElement("canvas"); c.width = w; c.height = hh; return c; }
  function toBlob(c, type, q) {
    return new Promise(function (res, rej) { c.toBlob(function (b) { if (b) res(b); else rej(new Error("Photo nahi ban payi")); }, type || "image/png", q); });
  }
  /* Photo file se chhota canvas (memory bachane ke liye) */
  function fileToCanvas(file, maxSide) {
    return S.loadImg(file).then(function (im) {
      var s = Math.min(1, (maxSide || 1600) / Math.max(im.naturalWidth, im.naturalHeight));
      var c = canvas(Math.max(1, Math.round(im.naturalWidth * s)), Math.max(1, Math.round(im.naturalHeight * s)));
      c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
      return c;
    });
  }
  function drawCover(ctx, img, x, y, w, hh) {
    var iw = img.width || img.naturalWidth, ih = img.height || img.naturalHeight;
    var s = Math.max(w / iw, hh / ih), dw = iw * s, dh = ih * s;
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, hh); ctx.clip();
    ctx.drawImage(img, x + (w - dw) / 2, y + (hh - dh) / 2, dw, dh); ctx.restore();
  }
  function drawContain(ctx, img, x, y, w, hh) {
    var iw = img.width || img.naturalWidth, ih = img.height || img.naturalHeight;
    var s = Math.min(w / iw, hh / ih), dw = iw * s, dh = ih * s;
    ctx.drawImage(img, x + (w - dw) / 2, y + (hh - dh) / 2, dw, dh);
  }
  function rrect(ctx, x, y, w, hh, r) {
    r = Math.min(r, w / 2, hh / 2);
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + hh, r); ctx.arcTo(x + w, y + hh, x, y + hh, r);
    ctx.arcTo(x, y + hh, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function hexA(hex, a) {
    var n = parseInt(String(hex).replace("#", ""), 16);
    return "rgba(" + (n >> 16 & 255) + "," + (n >> 8 & 255) + "," + (n & 255) + "," + a + ")";
  }
  function wrapText(ctx, text, maxW) {
    var out = [];
    String(text == null ? "" : text).split("\n").forEach(function (para) {
      if (!para) { out.push(""); return; }
      var words = para.split(" "), line = "";
      words.forEach(function (w) {
        var t = line ? line + " " + w : w;
        if (ctx.measureText(t).width <= maxW) { line = t; return; }
        if (line) { out.push(line); line = ""; }
        if (ctx.measureText(w).width <= maxW) { line = w; return; }
        var part = "";
        for (var i = 0; i < w.length; i++) {
          if (ctx.measureText(part + w[i]).width > maxW && part) { out.push(part); part = ""; }
          part += w[i];
        }
        line = part;
      });
      out.push(line);
    });
    return out;
  }

  /* ---------- QR code banane wala (apna; bahar ki library nahi) ---------- */
  var ECC_PB = [null,
    [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
    [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30]];
  var ECC_NB = [null,
    [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
    [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
    [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
    [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81]];
  var ECL = { L: 1, M: 0, Q: 3, H: 2 }, ECI = { L: 1, M: 2, Q: 3, H: 4 };
  function rawModules(v) {
    var r = (16 * v + 128) * v + 64;
    if (v >= 2) { var na = Math.floor(v / 7) + 2; r -= (25 * na - 10) * na - 55; if (v >= 7) r -= 36; }
    return r;
  }
  function dataCw(v, e) { return Math.floor(rawModules(v) / 8) - ECC_PB[ECI[e]][v] * ECC_NB[ECI[e]][v]; }
  function gfMul(x, y) { var z = 0; for (var i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11D); z ^= ((y >>> i) & 1) * x; } return z; }
  function rsDiv(deg) {
    var r = []; for (var i = 0; i < deg - 1; i++) r.push(0); r.push(1);
    var root = 1;
    for (i = 0; i < deg; i++) {
      for (var j = 0; j < deg; j++) { r[j] = gfMul(r[j], root); if (j + 1 < deg) r[j] ^= r[j + 1]; }
      root = gfMul(root, 2);
    }
    return r;
  }
  function rsRem(data, div) {
    var r = div.map(function () { return 0; });
    data.forEach(function (b) {
      var f = b ^ r.shift(); r.push(0);
      div.forEach(function (c, i) { r[i] ^= gfMul(c, f); });
    });
    return r;
  }
  function utf8(str) { return Array.prototype.slice.call(new TextEncoder().encode(str)); }
  function qrEncode(text, ecc) {
    var bytes = utf8(String(text)), e = ecc || "M", ver, cap;
    for (ver = 1; ver <= 20; ver++) {
      var ccb = ver <= 9 ? 8 : 16;
      if (bytes.length < (1 << ccb) && 4 + ccb + bytes.length * 8 <= dataCw(ver, e) * 8) break;
    }
    if (ver > 20) throw new Error("Text bahut lamba hai (QR mein lagbhag 700 akshar tak)");
    var bits = [];
    function put(val, len) { for (var i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1); }
    put(4, 4); put(bytes.length, ver <= 9 ? 8 : 16); bytes.forEach(function (b) { put(b, 8); });
    cap = dataCw(ver, e) * 8;
    put(0, Math.min(4, cap - bits.length));
    while (bits.length % 8) bits.push(0);
    for (var pad = 0xEC; bits.length < cap; pad ^= 0xEC ^ 0x11) put(pad, 8);
    var data = []; for (var i = 0; i < bits.length; i += 8) { var b = 0; for (var k = 0; k < 8; k++) b = (b << 1) | bits[i + k]; data.push(b); }
    /* ECC + interleave */
    var nb = ECC_NB[ECI[e]][ver], eccLen = ECC_PB[ECI[e]][ver], raw = Math.floor(rawModules(ver) / 8);
    var nShort = nb - raw % nb, shortLen = Math.floor(raw / nb), blocks = [], div = rsDiv(eccLen), pos = 0;
    for (i = 0; i < nb; i++) {
      var dat = data.slice(pos, pos + shortLen - eccLen + (i < nShort ? 0 : 1)); pos += dat.length;
      var ec = rsRem(dat, div);
      if (i < nShort) dat.push(0);
      blocks.push(dat.concat(ec));
    }
    var all = [];
    for (i = 0; i < blocks[0].length; i++) blocks.forEach(function (bl, j) { if (i !== shortLen - eccLen || j >= nShort) all.push(bl[i]); });
    /* matrix */
    var size = ver * 4 + 17, mod = [], fn = [];
    for (i = 0; i < size; i++) { mod.push(new Array(size).fill(false)); fn.push(new Array(size).fill(false)); }
    function setF(x, y, d) { mod[y][x] = d; fn[y][x] = true; }
    for (i = 0; i < size; i++) { setF(6, i, i % 2 === 0); setF(i, 6, i % 2 === 0); }
    function finder(cx, cy) {
      for (var dy = -4; dy <= 4; dy++) for (var dx = -4; dx <= 4; dx++) {
        var d = Math.max(Math.abs(dx), Math.abs(dy)), xx = cx + dx, yy = cy + dy;
        if (xx >= 0 && xx < size && yy >= 0 && yy < size) setF(xx, yy, d !== 2 && d !== 4);
      }
    }
    finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
    var ap = [];
    if (ver > 1) {
      var na = Math.floor(ver / 7) + 2, step = ver === 32 ? 26 : Math.ceil((ver * 4 + 4) / (na * 2 - 2)) * 2;
      ap = [6]; for (var p = size - 7; ap.length < na; p -= step) ap.splice(1, 0, p);
    }
    ap.forEach(function (cy, a) {
      ap.forEach(function (cx, b) {
        if ((a === 0 && b === 0) || (a === 0 && b === ap.length - 1) || (a === ap.length - 1 && b === 0)) return;
        for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++) setF(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      });
    });
    function fmtBits(mask) {
      var d = (ECL[e] << 3) | mask, r = d;
      for (var i2 = 0; i2 < 10; i2++) r = (r << 1) ^ ((r >>> 9) * 0x537);
      var bt = ((d << 10) | r) ^ 0x5412;
      function g(n) { return ((bt >>> n) & 1) !== 0; }
      for (i2 = 0; i2 <= 5; i2++) setF(8, i2, g(i2));
      setF(8, 7, g(6)); setF(8, 8, g(7)); setF(7, 8, g(8));
      for (i2 = 9; i2 < 15; i2++) setF(14 - i2, 8, g(i2));
      for (i2 = 0; i2 < 8; i2++) setF(size - 1 - i2, 8, g(i2));
      for (i2 = 8; i2 < 15; i2++) setF(8, size - 15 + i2, g(i2));
      setF(8, size - 8, true);
    }
    fmtBits(0);
    if (ver >= 7) {
      var rr = ver; for (i = 0; i < 12; i++) rr = (rr << 1) ^ ((rr >>> 11) * 0x1F25);
      var vb = (ver << 12) | rr;
      for (i = 0; i < 18; i++) { var col = ((vb >>> i) & 1) !== 0, a2 = size - 11 + i % 3, b2 = Math.floor(i / 3); setF(a2, b2, col); setF(b2, a2, col); }
    }
    var bi = 0;
    for (var right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (var vert = 0; vert < size; vert++) for (var j2 = 0; j2 < 2; j2++) {
        var x = right - j2, up = ((right + 1) & 2) === 0, y = up ? size - 1 - vert : vert;
        if (!fn[y][x] && bi < all.length * 8) { mod[y][x] = ((all[bi >>> 3] >>> (7 - (bi & 7))) & 1) !== 0; bi++; }
      }
    }
    function applyMask(m) {
      for (var y2 = 0; y2 < size; y2++) for (var x2 = 0; x2 < size; x2++) {
        var inv;
        switch (m) {
          case 0: inv = (x2 + y2) % 2 === 0; break;
          case 1: inv = y2 % 2 === 0; break;
          case 2: inv = x2 % 3 === 0; break;
          case 3: inv = (x2 + y2) % 3 === 0; break;
          case 4: inv = (Math.floor(x2 / 3) + Math.floor(y2 / 2)) % 2 === 0; break;
          case 5: inv = x2 * y2 % 2 + x2 * y2 % 3 === 0; break;
          case 6: inv = (x2 * y2 % 2 + x2 * y2 % 3) % 2 === 0; break;
          default: inv = ((x2 + y2) % 2 + x2 * y2 % 3) % 2 === 0;
        }
        if (!fn[y2][x2] && inv) mod[y2][x2] = !mod[y2][x2];
      }
    }
    function penalty() {
      var res = 0, dark = 0, x2, y2, run, c;
      for (var pass = 0; pass < 2; pass++) {
        for (y2 = 0; y2 < size; y2++) {
          run = 0; var hist = [];
          for (x2 = 0; x2 < size; x2++) {
            c = pass ? mod[x2][y2] : mod[y2][x2];
            hist.push(c ? 1 : 0);
            if (x2 > 0 && c === (pass ? mod[x2 - 1][y2] : mod[y2][x2 - 1])) { run++; if (run === 5) res += 3; else if (run > 5) res++; } else run = 1;
          }
          var s = hist.join("");
          var re = /10111010000|00001011101/g, m2;
          while ((m2 = re.exec(s))) { res += 40; re.lastIndex = m2.index + 1; }
        }
      }
      for (y2 = 0; y2 < size; y2++) for (x2 = 0; x2 < size; x2++) {
        c = mod[y2][x2]; if (c) dark++;
        if (x2 < size - 1 && y2 < size - 1 && c === mod[y2][x2 + 1] && c === mod[y2 + 1][x2] && c === mod[y2 + 1][x2 + 1]) res += 3;
      }
      var tot = size * size;
      res += Math.floor(Math.abs(dark * 20 - tot * 10) / tot) * 10;
      return res;
    }
    var best = 0, bestP = Infinity;
    for (var m = 0; m < 8; m++) {
      applyMask(m); fmtBits(m);
      var pn = penalty(); if (pn < bestP) { bestP = pn; best = m; }
      applyMask(m);
    }
    applyMask(best); fmtBits(best);
    return { size: size, version: ver, get: function (x3, y3) { return mod[y3][x3]; }, isFn: function (x3, y3) { return fn[y3][x3]; } };
  }
  /* QR ko canvas par banana. o: {fg, bg, style: square|round|dot, eye: square|round, quiet, grad:[c1,c2]} */
  function qrDraw(ctx, x0, y0, px, text, o) {
    o = o || {};
    var q = qrEncode(text, o.ecc || "M"), quiet = o.quiet == null ? 2 : o.quiet, n = q.size + quiet * 2, u = px / n;
    var fg = o.fg || "#000000", bg = o.bg || "#ffffff";
    if (bg !== "transparent") { ctx.fillStyle = bg; ctx.fillRect(x0, y0, px, px); }
    var fill = fg;
    if (o.grad) { var g = ctx.createLinearGradient(x0, y0, x0 + px, y0 + px); g.addColorStop(0, o.grad[0]); g.addColorStop(1, o.grad[1]); fill = g; }
    ctx.fillStyle = fill;
    function inEye(x, y) { return (x < 7 && y < 7) || (x >= q.size - 7 && y < 7) || (x < 7 && y >= q.size - 7); }
    for (var y = 0; y < q.size; y++) for (var x = 0; x < q.size; x++) {
      if (!q.get(x, y)) continue;
      if (o.eye && o.eye !== "square" && inEye(x, y)) continue;
      var X = x0 + (x + quiet) * u, Y = y0 + (y + quiet) * u;
      if (o.style === "dot") { ctx.beginPath(); ctx.arc(X + u / 2, Y + u / 2, u * 0.42, 0, Math.PI * 2); ctx.fill(); }
      else if (o.style === "round") { rrect(ctx, X + u * 0.04, Y + u * 0.04, u * 0.92, u * 0.92, u * 0.3); ctx.fill(); }
      else ctx.fillRect(X - 0.2, Y - 0.2, u + 0.4, u + 0.4);
    }
    if (o.eye && o.eye !== "square") {
      [[0, 0], [q.size - 7, 0], [0, q.size - 7]].forEach(function (p) {
        var X = x0 + (p[0] + quiet) * u, Y = y0 + (p[1] + quiet) * u;
        ctx.fillStyle = fill; rrect(ctx, X, Y, 7 * u, 7 * u, u * 2.2); ctx.fill();
        if (bg !== "transparent") ctx.fillStyle = bg; else { ctx.globalCompositeOperation = "destination-out"; }
        rrect(ctx, X + u, Y + u, 5 * u, 5 * u, u * 1.6); ctx.fill();
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = fill; rrect(ctx, X + 2 * u, Y + 2 * u, 3 * u, 3 * u, u * 1.1); ctx.fill();
      });
    }
    return q;
  }

  /* ---------- document banane ka engine (A4 ke pann, canvas par) ---------- */
  function Doc(o) {
    o = o || {};
    this.W = o.W || 1240; this.H = o.H || 1754; this.M = o.M == null ? 80 : o.M;
    this.pages = []; this.onPage = o.onPage || null; this.page();
  }
  Doc.prototype.page = function () {
    var c = canvas(this.W, this.H), x = c.getContext("2d");
    x.fillStyle = "#ffffff"; x.fillRect(0, 0, this.W, this.H);
    this.c = c; this.x = x; this.y = this.M; this.pages.push(c);
    if (this.onPage) this.onPage(this, this.pages.length - 1);
  };
  Doc.prototype.font = function (size, weight, italic) { this.x.font = (italic ? "italic " : "") + (weight || 400) + " " + size + "px " + FONT; };
  Doc.prototype.ensure = function (hh) { if (this.y + hh > this.H - this.M) this.page(); };
  /* text likho. o: {x,w,size,weight,color,align,lh,italic,keep(y na badhao), y} */
  Doc.prototype.text = function (str, o) {
    o = o || {};
    var size = o.size || 26, lh = o.lh || Math.round(size * 1.4), x = o.x == null ? this.M : o.x, w = o.w || (this.W - this.M - x);
    this.font(size, o.weight, o.italic); this.x.fillStyle = o.color || "#222222"; this.x.textBaseline = "top";
    var lines = wrapText(this.x, str, w), y0 = o.y == null ? this.y : o.y;
    if (o.y == null) this.ensure(lines.length * lh);
    var y = o.y == null ? this.y : o.y;
    this.font(size, o.weight, o.italic); this.x.fillStyle = o.color || "#222222"; this.x.textBaseline = "top";
    var al = o.align || "left";
    for (var i = 0; i < lines.length; i++) {
      var tx = al === "right" ? x + w : al === "center" ? x + w / 2 : x;
      this.x.textAlign = al; this.x.fillText(lines[i], tx, y + i * lh);
    }
    this.x.textAlign = "left";
    var total = lines.length * lh;
    if (o.y == null && !o.keep) this.y += total;
    return total;
  };
  Doc.prototype.measure = function (str, o) {
    o = o || {}; var size = o.size || 26, lh = o.lh || Math.round(size * 1.4), x = o.x == null ? this.M : o.x, w = o.w || (this.W - this.M - x);
    this.font(size, o.weight, o.italic); return wrapText(this.x, str, w).length * lh;
  };
  Doc.prototype.hr = function (color, th, x1, x2) {
    this.x.fillStyle = color || "#dddddd"; this.x.fillRect(x1 == null ? this.M : x1, this.y, (x2 == null ? this.W - this.M : x2) - (x1 == null ? this.M : x1), th || 2);
    this.y += (th || 2);
  };
  Doc.prototype.gap = function (n) { this.y += n; };
  /* table: cols [{w,align,title}] rows [[...]] */
  Doc.prototype.table = function (cols, rows, o) {
    o = o || {}; var self = this, x0 = this.M, size = o.size || 24, pad = 12, head = o.head || "#eeeeee", hc = o.headColor || "#222222";
    function rowH(cells, weight) {
      var mx = 0;
      cells.forEach(function (c, i) { mx = Math.max(mx, self.measure(String(c), { size: size, weight: weight, x: 0, w: cols[i].w - pad * 2 })); });
      return mx + pad * 2;
    }
    function drawRow(cells, y, weight, color) {
      var x = x0;
      cells.forEach(function (c, i) {
        self.text(String(c), { x: x + pad, y: y + pad, w: cols[i].w - pad * 2, size: size, weight: weight, color: color || "#222", align: cols[i].align || "left" });
        x += cols[i].w;
      });
    }
    var hh = rowH(cols.map(function (c) { return c.title; }), 700);
    this.ensure(hh + 80);
    this.x.fillStyle = head; this.x.fillRect(x0, this.y, cols.reduce(function (s, c) { return s + c.w; }, 0), hh);
    drawRow(cols.map(function (c) { return c.title; }), this.y, 700, hc); this.y += hh;
    rows.forEach(function (r) {
      var rh = rowH(r, 400);
      if (self.y + rh > self.H - self.M) {
        self.page();
        self.x.fillStyle = head; self.x.fillRect(x0, self.y, cols.reduce(function (s, c) { return s + c.w; }, 0), hh);
        drawRow(cols.map(function (c) { return c.title; }), self.y, 700, hc); self.y += hh;
      }
      drawRow(r, self.y, 400);
      self.y += rh;
      self.x.fillStyle = "#e3e3e8"; self.x.fillRect(x0, self.y - 1, cols.reduce(function (s, c) { return s + c.w; }, 0), 2);
    });
  };

  /* ---------- PDF, PNG, share ---------- */
  function pdfFrom(canvases, q) {
    var pages = canvases.map(function (c) {
      var t = canvas(c.width, c.height), cx = t.getContext("2d"); cx.fillStyle = "#fff"; cx.fillRect(0, 0, t.width, t.height); cx.drawImage(c, 0, 0);
      var b64 = t.toDataURL("image/jpeg", q || 0.9).split(",")[1], bin = atob(b64), u = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
      return { w: 595, h: Math.round(595 * c.height / c.width), pw: c.width, ph: c.height, jpeg: u };
    });
    return S.buildPdf(pages);
  }
  /* Neeche ke teen button: PDF / Share / Photo. getCanvases() canvas ki list deta hai */
  function exportBar(root, getCanvases, name, shareText, onDone) {
    var wrap = h("div", "st-row");
    function guard(fn) {
      return function () {
        var cs; try { cs = getCanvases(); } catch (e) { S.say(e.message || "Pehle jaankari bharo"); return; }
        if (!cs || !cs.length) { S.say("Pehle jaankari bharo"); return; }
        try { Promise.resolve(fn(cs)).then(function () { if (onDone) onDone(); }, function (e) { S.say(e.message || "Nahi ho paya"); }); } catch (e2) { S.say(e2.message || "Nahi ho paya"); }
      };
    }
    var bPdf = S.btn("PDF download", "btn-primary", guard(function (cs) { S.saveBlob(pdfFrom(cs), name + ".pdf"); S.say("PDF ban gayi"); }));
    var bShare = S.btn("Share karo", "", guard(function (cs) { S.shareFile(pdfFrom(cs), name + ".pdf", shareText || name); }));
    var bPng = S.btn("Photo (PNG)", "", guard(function (cs) { return toBlob(cs[0], "image/png").then(function (b) { S.saveBlob(b, name + ".png"); S.say("Photo save hui"); }); }));
    wrap.append(bPdf, bShare, bPng);
    root.append(wrap);
    return wrap;
  }
  /* Photo-wale tools ke liye: PNG download + share */
  function imageBar(root, getCanvas, name, shareText) {
    var wrap = h("div", "st-row");
    function guard(fn) { return function () { var c = getCanvas(); if (!c) { S.say("Pehle photo/jaankari daalo"); return; } fn(c).catch(function (e) { S.say(e.message || "Nahi ho paya"); }); }; }
    wrap.append(
      S.btn("Download (PNG)", "btn-primary", guard(function (c) { return toBlob(c, "image/png").then(function (b) { S.saveBlob(b, name + ".png"); S.say("Photo save hui"); }); })),
      S.btn("Share karo", "", guard(function (c) { return toBlob(c, "image/png").then(function (b) { S.shareFile(b, name + ".png", shareText || name); }); })),
      S.btn("JPG", "", guard(function (c) { var t = canvas(c.width, c.height), x = t.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, t.width, t.height); x.drawImage(c, 0, 0); return toBlob(t, "image/jpeg", 0.92).then(function (b) { S.saveBlob(b, name + ".jpg"); S.say("Photo save hui (" + S.fmtSize(b.size) + ")"); }); }))
    );
    root.append(wrap);
    return wrap;
  }

  /* ---------- form banane ka sanchaa ---------- */
  function debounce(fn, ms) { var t = null; return function () { var a = arguments; clearTimeout(t); t = setTimeout(function () { fn.apply(null, a); }, ms); }; }
  function imageField(f, st, onChange) {
    var box = h("div", "pv-imgf"), prev = h("img", "pv-thumb"); prev.hidden = true; prev.alt = "";
    var lab = h("div", "st-prov", "");
    function show() { if (st[f.k]) { prev.src = st[f.k].toDataURL("image/png"); prev.hidden = false; lab.textContent = ""; } else { prev.hidden = true; lab.textContent = f.hint || "Koi photo nahi"; } }
    var pick = S.btn(f.btnText || "Photo chuno", "", function () {
      S.pickImage(function (files) {
        fileToCanvas(files[0], f.max || 600).then(function (c) { st[f.k] = c; show(); onChange(f.k); }, function (e) { S.say(e.message); });
      });
    });
    var rm = S.btn("Hatao", "", function () { st[f.k] = null; show(); onChange(f.k); });
    box.append(prev, S.row(pick, rm), lab);
    show();
    return { node: box, refresh: show };
  }
  function itemsField(f, st, onChange) {
    var box = h("div", "pv-items");
    if (!Array.isArray(st[f.k]) || !st[f.k].length) st[f.k] = f.def ? JSON.parse(JSON.stringify(f.def)) : [{ d: "", q: 1, r: "" }];
    function draw() {
      box.textContent = "";
      st[f.k].forEach(function (it, ix) {
        var r = h("div", "pv-item");
        var d = S.inp("text", it.d); d.placeholder = f.dph || "Saaman / seva ka naam"; d.maxLength = 120;
        var q = S.inp("number", it.q); q.inputMode = "decimal"; q.placeholder = "Maatra";
        var p = S.inp("number", it.r); p.inputMode = "decimal"; p.placeholder = "Bhav (Rs)";
        d.oninput = function () { it.d = d.value; onChange(f.k); };
        q.oninput = function () { it.q = q.value; onChange(f.k); };
        p.oninput = function () { it.r = p.value; onChange(f.k); };
        var x = S.btn("Hatao", "", function () { if (st[f.k].length > 1) st[f.k].splice(ix, 1); else st[f.k][0] = { d: "", q: 1, r: "" }; draw(); onChange(f.k); });
        x.className = "btn pv-x";
        r.append(d, S.row(q, p, x));
        box.append(r);
      });
      box.append(S.btn("+ Aur line jodo", "btn-block", function () { st[f.k].push({ d: "", q: 1, r: "" }); draw(); }));
    }
    draw();
    return { node: box, refresh: draw };
  }
  /* spec: [{k,l,t:text|textarea|number|date|select|color|image|items|sec,...}] */
  function form(root, spec, st, onChange) {
    var refs = {};
    spec.forEach(function (f) {
      if (f.t === "sec") { root.append(h("div", "pv-sec", f.l)); return; }
      if (st[f.k] === undefined) st[f.k] = f.def != null ? f.def : "";
      var node;
      if (f.t === "image") { var r1 = imageField(f, st, onChange); refs[f.k] = r1; root.append(S.field(f.l, r1.node)); return; }
      if (f.t === "items") { var r2 = itemsField(f, st, onChange); refs[f.k] = r2; root.append(S.field(f.l, r2.node)); return; }
      if (f.t === "textarea") { node = h("textarea", "input"); node.rows = f.rows || 3; if (f.max) node.maxLength = f.max; }
      else if (f.t === "select") {
        node = h("select", "select");
        f.opts.forEach(function (o) { var op = h("option", "", o[1]); op.value = o[0]; node.append(op); });
      } else if (f.t === "color") { node = S.inp("color", st[f.k] || "#7055E8"); node.style.height = "44px"; node.style.padding = "4px"; }
      else {
        node = S.inp(f.t || "text", ""); if (f.t === "number") node.inputMode = "decimal"; if (f.max) node.maxLength = f.max;
      }
      if (f.ph) node.placeholder = f.ph;
      node.value = st[f.k];
      var ev = (f.t === "select" || f.t === "date" || f.t === "color") ? "onchange" : "oninput";
      node[ev] = function () { st[f.k] = node.value; onChange(f.k); };
      if (f.t === "color") node.oninput = node[ev];
      refs[f.k] = { node: node, refresh: function () { node.value = st[f.k]; } };
      root.append(S.field(f.l, node));
    });
    return refs;
  }
  function persist(key, st, keys) {
    var saved = S.store.get(key, {}); keys.forEach(function (k) { if (saved[k] !== undefined) st[k] = saved[k]; });
    return function () { var o = {}; keys.forEach(function (k) { if (typeof st[k] === "string" || typeof st[k] === "number") o[k] = st[k]; }); S.store.set(key, o); };
  }
  /* Logo/photo ko chhota karke yaad rakhna (localStorage) */
  function saveImg(key, c) { try { if (!c) localStorage.removeItem(key); else localStorage.setItem(key, c.toDataURL("image/png")); } catch (e) {} }
  function loadImgSaved(key) {
    return new Promise(function (res) {
      var u = null; try { u = localStorage.getItem(key); } catch (e) {}
      if (!u) { res(null); return; }
      var im = new Image(); im.onload = function () { var c = canvas(im.naturalWidth, im.naturalHeight); c.getContext("2d").drawImage(im, 0, 0); res(c); }; im.onerror = function () { res(null); }; im.src = u;
    });
  }
  /* AI (Worker /chat) se kaam: system + text -> reply */
  function ai(system, text) {
    if (!S.API) return Promise.reject(new Error("AI abhi jura nahi hai"));
    var ctrl = new AbortController(), timer = setTimeout(function () { ctrl.abort(); }, 45000);
    return fetch(S.API + "/chat", {
      method: "POST", headers: { "Content-Type": "application/json" }, signal: ctrl.signal,
      body: JSON.stringify({ system: (S.RULE || "") + " " + system, messages: [{ role: "user", content: text }] })
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) { if (!r.ok || !d.reply) throw new Error(d.error || "Server error " + r.status); return String(d.reply); });
    }).catch(function (e) {
      if (e && e.name === "AbortError") throw new Error("Time out ho gaya. Dobara koshish karo.");
      if (e instanceof TypeError) throw new Error("Server se connect nahi ho paya. Internet check karo.");
      throw e;
    }).then(function (v) { clearTimeout(timer); return v; }, function (e) { clearTimeout(timer); throw e; });
  }

  /* CSS (naye classes) */
  var st = document.createElement("style");
  st.textContent = [
    ".pv-prev{display:block;width:100%;height:auto;border:1px solid var(--border);border-radius:10px;background:#fff;margin:6px 0}",
    ".pv-sec{font-weight:700;font-size:15px;margin:10px 0 0;color:var(--text)}",
    ".pv-thumb{display:block;max-width:120px;max-height:120px;border-radius:10px;border:1px solid var(--border);margin-bottom:6px;background:#fff}",
    ".pv-item{display:flex;flex-direction:column;gap:8px;padding:10px;border:1px solid var(--border);border-radius:12px;margin-bottom:8px;background:var(--card)}",
    ".pv-x{flex:0 0 auto!important;padding:8px 12px}",
    ".pv-note{font-size:12px;color:var(--muted);line-height:1.5}",
    ".pv-chips{display:flex;gap:8px;flex-wrap:wrap}",
    ".pv-chip{border:1px solid var(--border);background:var(--card);color:var(--text);padding:8px 12px;border-radius:999px;font-size:14px;font-family:inherit;cursor:pointer}",
    ".pv-chip.on{background:var(--grad);color:#fff;border:0}",
    ".pv-frame{width:100%;height:420px;border:1px solid var(--border);border-radius:10px;background:#fff}",
    ".pv-sheet{display:flex;flex-direction:column;gap:6px}",
    ".pv-big{width:100%;min-height:120px;font-size:20px;line-height:1.6}"
  ].join("\n");
  document.head.appendChild(st);

  window.ToxicLib = {
    FONT: FONT, todayISO: todayISO, dmy: dmy, num: num, inr: inr, inrWords: inrWords, canvas: canvas, toBlob: toBlob, fileToCanvas: fileToCanvas,
    drawCover: drawCover, drawContain: drawContain, rrect: rrect, hexA: hexA, wrapText: wrapText,
    qrEncode: qrEncode, qrDraw: qrDraw, Doc: Doc, pdfFrom: pdfFrom, exportBar: exportBar, imageBar: imageBar,
    form: form, persist: persist, saveImg: saveImg, loadImgSaved: loadImgSaved, debounce: debounce, ai: ai
  };
})();
