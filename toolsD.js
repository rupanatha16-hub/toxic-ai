"use strict";
/* TOXIC AI - Premium tools D: Social Media Planner, Hindi Typing Pro, Password Manager Tools,
   Mini Website Maker, Text Formatter Pro, Smart Notes Pro.
   Sab kuch phone ke browser mein hota hai. Koi secret nahi. Sirf "AI" wale button likhi hui baatein AI ko bhejte hain. */
(function () {
  var S = window.ToxicStudio, L = window.ToxicLib;
  if (!S || !L) return;
  var h = S.h;

  function sec(t) { return h("div", "pv-sec", t); }
  function note(t) { return h("div", "pv-note", t); }
  function area(rows, ph, big) { var t = h("textarea", "input" + (big ? " pv-big" : "")); t.rows = rows; if (ph) t.placeholder = ph; return t; }
  function sel(opts, val, fn) { var s = h("select", "select"); opts.forEach(function (o) { var p = h("option", "", o[1]); p.value = o[0]; s.append(p); }); s.value = val; s.onchange = function () { fn(s.value); }; return s; }
  function copy(t) { if (!String(t || "").trim()) { S.say("Abhi kuch likha nahi hai"); return; } S.copyText(t); S.say("Copy ho gaya"); }
  function shareText(t) {
    if (!String(t || "").trim()) { S.say("Abhi kuch likha nahi hai"); return; }
    if (navigator.share) navigator.share({ text: t }).catch(function () {}); else copy(t);
  }
  function saveTxt(t, name) { if (!String(t || "").trim()) { S.say("Abhi kuch likha nahi hai"); return; } S.saveBlob(new Blob([t], { type: "text/plain;charset=utf-8" }), name); S.say("File save hui"); }
  function textBar(root, get, name) {
    root.append(S.row(S.btn("Copy", "btn-primary", function () { copy(get()); }), S.btn("Share", "", function () { shareText(get()); }), S.btn("Download", "", function () { saveTxt(get(), name); })));
  }
  function pickFile(accept, cb) { var i = document.createElement("input"); i.type = "file"; i.accept = accept; i.onchange = function () { if (i.files && i.files[0]) cb(i.files[0]); }; i.click(); }
  function readText(f) { return new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res(String(r.result)); }; r.onerror = function () { rej(new Error("File padh nahi payi")); }; r.readAsText(f); }); }

  /* ================= SOCIAL MEDIA PLANNER ================= */
  S.register({ id: "planner", name: "Social Media Planner", run: function (root) {
    var st = { biz: "", plat: "Instagram", days: "7", lang: "Hinglish (Roman Hindi)", goal: "" };
    var save = L.persist("toxic.pv.planner", st, ["biz", "plat", "days", "lang", "goal"]);
    L.form(root, [
      { t: "sec", l: "Aapka kaam" },
      { k: "biz", l: "Kya bechte/karte ho, kahan", t: "textarea", rows: 3, max: 400, ph: "Jaise: Kekri mein mobile repair ki dukaan" },
      { k: "goal", l: "Maqsad (zaroori nahi)", max: 120, ph: "Jaise: naye graahak, Diwali offer" },
      { t: "sec", l: "Plan kaisa chahiye" },
      { k: "plat", l: "Kahan post karni hai", t: "select", opts: [["Instagram", "Instagram"], ["Facebook", "Facebook"], ["WhatsApp Status", "WhatsApp Status"], ["YouTube Shorts", "YouTube Shorts"]] },
      { k: "days", l: "Kitne din ka", t: "select", opts: [["3", "3 din"], ["7", "7 din"], ["14", "14 din"]] },
      { k: "lang", l: "Bhasha", t: "select", opts: [["Hinglish (Roman Hindi)", "Hinglish (Roman)"], ["Hindi (Devanagari)", "Hindi (देवनागरी)"], ["English", "English"]] }
    ], st, save);
    var out = area(14, "Plan yahan aayega. Aap ise badal bhi sakte ho.", true), btn;
    btn = S.btn("AI se plan banao", "btn-primary btn-block", function () {
      if (!st.biz.trim()) { S.say("Pehle apna kaam likho"); return; }
      btn.disabled = true; btn.textContent = "Soch raha hoon...";
      var sys = "Tum social media sahayak ho. Diye gaye vyapar ke liye " + st.days + " din ka " + st.plat + " content plan banao. Har din ke liye ek line mein: 'Din N: post ka vichaar | Caption: ... | Hashtags: ...'. Seedhe saaf text mein likho, koi markdown (*, #) nahi. Jo jaankari nahi di (daam, offer, pata) usme jhooth ya apni taraf se baat mat gadho. Bhasha: " + st.lang + ".";
      L.ai(sys, "Vyapar: " + st.biz + (st.goal ? "\nMaqsad: " + st.goal : "")).then(function (t) { out.value = t.replace(/\*\*|__|`|^#+\s*/gm, "").trim(); }, function (e) { S.say(e.message || "AI se jawab nahi mila"); })
        .then(function () { btn.disabled = false; btn.textContent = "AI se plan banao"; });
    });
    root.append(btn, sec("Aapka plan"), out);
    textBar(root, function () { return out.value; }, "social-plan.txt");
    root.append(note("Ye AI ke sujhav hain. Post karne se pehle khud padhkar theek kar lo. Aapki likhi baatein AI ko jaati hain."));
  } });

  /* ================= HINDI TYPING PRO ================= */
  var VOW = { aa: ["आ", "ा"], ai: ["ऐ", "ै"], au: ["औ", "ौ"], ee: ["ई", "ी"], ii: ["ई", "ी"], oo: ["ऊ", "ू"], uu: ["ऊ", "ू"], a: ["अ", ""], i: ["इ", "ि"], u: ["उ", "ु"], e: ["ए", "े"], o: ["ओ", "ो"] };
  var CON = { cch: "च्छ", chh: "छ", ksh: "क्ष", kh: "ख", gh: "घ", ch: "च", jh: "झ", Th: "ठ", Dh: "ढ", th: "थ", dh: "ध", ph: "फ", bh: "भ", sh: "श", Sh: "ष", gy: "ज्ञ", k: "क", g: "ग", c: "क", j: "ज", T: "ट", D: "ड", N: "ण", t: "त", d: "द", n: "न", p: "प", f: "फ", b: "ब", m: "म", y: "य", r: "र", l: "ल", v: "व", w: "व", s: "स", h: "ह", q: "क", x: "क्स", z: "ज़" };
  var DICT = { hai: "है", hain: "हैं", main: "मैं", mein: "में", nahi: "नहीं", nahin: "नहीं", kya: "क्या", mera: "मेरा", meri: "मेरी", mere: "मेरे", aap: "आप", hum: "हम", tum: "तुम", kaise: "कैसे", kaun: "कौन", kyun: "क्यों", kyon: "क्यों", yahan: "यहाँ", wahan: "वहाँ", kahan: "कहाँ", jahan: "जहाँ", ki: "की", ka: "का", ke: "के", ko: "को", se: "से", par: "पर", bhi: "भी", ye: "ये", yeh: "यह", wo: "वो", woh: "वह", aur: "और", ek: "एक", do: "दो", teen: "तीन", ji: "जी", haan: "हाँ", to: "तो", toh: "तो", bahut: "बहुत", accha: "अच्छा", achha: "अच्छा", theek: "ठीक", thik: "ठीक", paisa: "पैसा", namaste: "नमस्ते", dhanyavad: "धन्यवाद", shukriya: "शुक्रिया", naam: "नाम" };
  function xw(w, pro) {
    var lw = w.toLowerCase();
    if (!pro && DICT[lw]) return DICT[lw];
    var s = pro ? w.replace(/[A-Z]/g, function (c) { return "TDNMHS".indexOf(c) >= 0 ? c : c.toLowerCase(); }) : lw;
    var out = "", i = 0, pc = false, ch, v, len, tok;
    while (i < s.length) {
      ch = s[i];
      if (pro && (ch === "M" || ch === "H")) { out += ch === "M" ? "ं" : "ः"; pc = false; i++; continue; }
      if ("aeiou".indexOf(ch) >= 0) {
        v = i + 1 < s.length ? VOW[s.substr(i, 2)] : null; len = 2; if (!v) { v = VOW[ch]; len = 1; }
        if (len === 1 && ch === "a") { out += pc ? (i === s.length - 1 ? "ा" : "") : "अ"; } else out += pc ? v[1] : v[0];
        pc = false; i += len; continue;
      }
      if (CON[s.substr(i, 3)]) { tok = CON[s.substr(i, 3)]; len = 3; } else if (CON[s.substr(i, 2)]) { tok = CON[s.substr(i, 2)]; len = 2; } else if (CON[ch]) { tok = CON[ch]; len = 1; } else { out += ch; pc = false; i++; continue; }
      out += (pc ? "्" : "") + tok; pc = true; i += len;
    }
    return out;
  }
  function xlit(text, pro, digits, danda) {
    var r = String(text).replace(/[A-Za-z]+/g, function (w) { return xw(w, pro); }).replace(/~/g, "ँ");
    if (danda) r = r.replace(/\.(?=\s|$)/g, "।");
    if (digits) r = r.replace(/[0-9]/g, function (d) { return String.fromCharCode(0x966 + (+d)); });
    return r;
  }
  S.register({ id: "hinditype", name: "Hindi Typing Pro", run: function (root) {
    var st = { pro: "no", dg: "no", dn: "yes" };
    var inp = area(5, "Yahan English akshar mein likho: mera naam roopnaath hai", true), out = area(5, "Hindi yahan banegi. Aap ise badal bhi sakte ho.", true), ai;
    inp.style.minHeight = out.style.minHeight = "110px";
    function conv() { out.value = xlit(inp.value, st.pro === "yes", st.dg === "yes", st.dn === "yes"); }
    var again = L.debounce(conv, 150);
    inp.oninput = again;
    root.append(sec("Roman mein likho"), inp, sec("Hindi"), out);
    root.append(S.field("Capital akshar (T D N Th Dh Sh, M = ं, H = ः)", sel([["no", "Sab chhote maano (aasaan)"], ["yes", "Ustaad: T D N Th Dh Sh alag"]], st.pro, function (v) { st.pro = v; conv(); })));
    root.append(S.field("Ank (1 2 3) Hindi mein badlo?", sel([["no", "Nahi"], ["yes", "Haan (१ २ ३)"]], st.dg, function (v) { st.dg = v; conv(); })));
    root.append(S.field("Full stop (.) ko । banao?", sel([["yes", "Haan"], ["no", "Nahi"]], st.dn, function (v) { st.dn = v; conv(); })));
    ai = S.btn("AI se sudharo", "btn-block", function () {
      if (!out.value.trim()) { S.say("Pehle kuch likho"); return; }
      ai.disabled = true; ai.textContent = "Sudhaar raha hoon...";
      L.ai("Ye Hindi text hai jo English akshar se banaya gaya hai. Sirf spelling, matra aur shabd sahi karo. Matlab ya vakya mat badlo, kuch jodo mat. Sirf sudhara hua text do, koi samjhaish nahi.", out.value).then(function (t) { out.value = t.trim(); }, function (e) { S.say(e.message || "AI se jawab nahi mila"); })
        .then(function () { ai.disabled = false; ai.textContent = "AI se sudharo"; });
    });
    root.append(ai);
    textBar(root, function () { return out.value; }, "hindi-text.txt");
    root.append(note("Lambi awaaz ke liye aa, ee, oo likho (raam, deepak, doodh). Shabd ke aakhir ka 'a' lambi 'aa' maana jata hai (mera = मेरा). Naam jaise रूपनाथ ke liye roopanaath likho. Link aur email bhi badal jaate hain, unhe baad mein theek kar lo. Ye niyam se banta hai, kuch shabd galat aa sakte hain; AI wala button sudhaar deta hai."));
  } });

  /* ================= PASSWORD MANAGER TOOLS ================= */
  var SETS = { lower: "abcdefghijkmnopqrstuvwxyz", upper: "ABCDEFGHJKLMNPQRSTUVWXYZ", digit: "23456789", sym: "!@#$%&*?-_+=" };
  function rnd(n) { var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do { crypto.getRandomValues(a); } while (a[0] >= lim); return a[0] % n; }
  function genPw(len, keys) {
    var pool = "", out = [], i;
    keys.forEach(function (k) { pool += SETS[k]; out.push(SETS[k][rnd(SETS[k].length)]); });
    while (out.length < len) out.push(pool[rnd(pool.length)]);
    for (i = out.length - 1; i > 0; i--) { var j = rnd(i + 1), t = out[i]; out[i] = out[j]; out[j] = t; }
    return out.join("");
  }
  var COMMON = ["password", "123456", "12345678", "qwerty", "admin", "iloveyou", "abc123", "111111", "welcome", "india", "letmein", "pass@123", "password123", "9876543210"];
  function strength(p) {
    if (!p) return null;
    var low = p.toLowerCase();
    if (COMMON.some(function (c) { return low.indexOf(c) >= 0; })) return { bits: 10, label: "Bahut kamzor", tip: "Ye aam password hai, turant badlo." };
    var pool = (/[a-z]/.test(p) ? 26 : 0) + (/[A-Z]/.test(p) ? 26 : 0) + (/\d/.test(p) ? 10 : 0) + (/[^A-Za-z0-9]/.test(p) ? 30 : 0);
    var uniq = {}; p.split("").forEach(function (c) { uniq[c] = 1; });
    var bits = Math.round(Math.min(p.length, Object.keys(uniq).length * 2) * Math.log(Math.max(pool, 2)) / Math.log(2));
    var tip = p.length < 12 ? "Kam se kam 12 akshar rakho." : (pool < 60 ? "Bade-chhote akshar, ank aur chinh milao." : "");
    return { bits: bits, label: bits < 40 ? "Kamzor" : bits < 60 ? "Theek-thaak" : bits < 80 ? "Achha" : "Bahut achha", tip: tip };
  }
  var VK = "toxic.pv.vault";
  function b64(buf) { var b = new Uint8Array(buf), s = "", i; for (i = 0; i < b.length; i++) s += String.fromCharCode(b[i]); return btoa(s); }
  function unb64(s) { var b = atob(s), u = new Uint8Array(b.length), i; for (i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  function derive(pw, salt) {
    return crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveKey"]).then(function (k) {
      return crypto.subtle.deriveKey({ name: "PBKDF2", salt: salt, iterations: 250000, hash: "SHA-256" }, k, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
    });
  }
  function readVault() { try { var r = JSON.parse(localStorage.getItem(VK) || "null"); return r && r.salt && r.iv && r.d ? r : null; } catch (e) { return null; } }
  S.register({ id: "password", name: "Password Manager Tools", run: function (root) {
    var body = h("div", ""), mode = "gen";
    root.append(S.field("Kya karna hai", sel([["gen", "Naya password banao"], ["check", "Password ki taakat jaancho"], ["vault", "Vault (password sambhalo)"]], mode, function (v) { mode = v; lockNow(); draw(); })), body);
    var key = null, items = [], rec = null, timer = null;
    function lockNow() { key = null; items = []; clearTimeout(timer); }
    function touch() { clearTimeout(timer); timer = setTimeout(function () { lockNow(); if (mode === "vault") { draw(); S.say("Vault apne aap lock ho gaya"); } }, 180000); }
    function meter(box, r) { box.textContent = r ? r.label + " (andaza " + r.bits + " bit). " + (r.tip || "") : ""; }
    function copySecret(t) { S.copyText(t); S.say("Copy ho gaya. 30 second baad clipboard saaf hoga"); setTimeout(function () { try { navigator.clipboard.writeText(""); } catch (e) {} }, 30000); }
    function drawGen() {
      var st = { len: 16, lower: true, upper: true, digit: true, sym: true }, show = h("div", "pv-big"), m = h("div", "st-prov", "");
      show.style.cssText = "word-break:break-all;font-family:monospace;padding:10px;border:1px solid var(--border);border-radius:10px;min-height:48px";
      function mk() { var ks = ["lower", "upper", "digit", "sym"].filter(function (k) { return st[k]; }); if (!ks.length) { S.say("Kam se kam ek cheez chuno"); return; } show.textContent = genPw(st.len, ks); meter(m, strength(show.textContent)); }
      var rg = S.inp("range", 16); rg.min = 8; rg.max = 32; rg.style.width = "100%"; var lt = h("div", "st-prov", "Lambai: 16");
      rg.oninput = function () { st.len = +rg.value; lt.textContent = "Lambai: " + st.len; mk(); };
      var lw = h("div", ""); lw.append(rg, lt);
      body.append(show, m, S.field("Password ki lambai", lw));
      [["lower", "chhote akshar (abc)"], ["upper", "bade akshar (ABC)"], ["digit", "ank (234)"], ["sym", "chinh (!@#)"]].forEach(function (o) {
        body.append(S.field(o[1], sel([["y", "Haan"], ["n", "Nahi"]], "y", function (v) { st[o[0]] = v === "y"; mk(); })));
      });
      body.append(S.row(S.btn("Naya banao", "btn-primary", mk), S.btn("Copy", "", function () { if (show.textContent) copySecret(show.textContent); })));
      body.append(note("Ye password aapke phone mein hi banta hai, kahin nahi jata. Dikhne mein milte akshar (l, I, O, 0, 1) nahi aate."));
      mk();
    }
    function drawCheck() {
      var i = S.inp("password", ""), m = h("div", "pv-sec", ""), t = h("div", "pv-note", "");
      i.placeholder = "Password yahan likho"; i.autocomplete = "off";
      i.oninput = function () { var r = strength(i.value); m.textContent = r ? r.label : ""; t.textContent = r ? "Andaza " + r.bits + " bit. " + (r.tip || "") : ""; };
      body.append(S.field("Password", i), S.btn("Dikhao / Chhupao", "btn-block", function () { i.type = i.type === "password" ? "text" : "password"; }), m, t,
        note("Ye jaanch phone mein hi hoti hai. Ye sirf andaza hai: naam, janmdin ya aam shabd se bana password isse kamzor ho sakta hai. Kabhi apna asli password kisi ko mat bhejo."));
    }
    function persist() {
      var iv = crypto.getRandomValues(new Uint8Array(12));
      return crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, new TextEncoder().encode(JSON.stringify(items))).then(function (ct) {
        rec.iv = b64(iv); rec.d = b64(ct); try { localStorage.setItem(VK, JSON.stringify(rec)); } catch (e) { throw new Error("Phone mein jagah nahi bachi"); }
      });
    }
    function drawVault() {
      body.textContent = "";
      if (!window.crypto || !crypto.subtle) { body.append(note("Is browser mein surakshit (encryption) sahulat nahi hai, isliye vault nahi chalega.")); return; }
      rec = readVault();
      if (!rec) {
        var p1 = S.inp("password", ""), p2 = S.inp("password", ""), cb;
        p1.placeholder = "Master password (kam se kam 8 akshar)"; p2.placeholder = "Master password dobara"; p1.autocomplete = p2.autocomplete = "off";
        cb = S.btn("Vault banao", "btn-primary btn-block", function () {
          if (p1.value.length < 8) { S.say("Kam se kam 8 akshar"); return; } if (p1.value !== p2.value) { S.say("Dono password alag hain"); return; }
          cb.disabled = true; cb.textContent = "Bana raha hoon...";
          var salt = crypto.getRandomValues(new Uint8Array(16));
          derive(p1.value, salt).then(function (k) { key = k; items = []; rec = { v: 1, salt: b64(salt), iv: "", d: "" }; return persist(); }).then(function () { touch(); drawVault(); }, function (e) { S.say(e.message || "Vault nahi bana"); cb.disabled = false; cb.textContent = "Vault banao"; });
        });
        body.append(note("Vault mein aap sites ke password rakh sakte ho. Sab kuch master password se tala-band (AES) hokar sirf is phone ke browser mein rehta hai."),
          S.field("Master password", p1), S.field("Dobara likho", p2), cb,
          note("Sach: master password bhool gaye to data wapas nahi aayega. Browser ka data saaf karne ya app hatane par vault mit jata hai. Isliye Backup file rakho. Ye Google/bade password manager jaisa nahi hai; sirf ek phone ke liye chhota sahara hai."));
        body.append(S.btn("Backup se wapas laao", "btn-block", restoreFn));
        return;
      }
      if (!key) {
        var pw = S.inp("password", ""), ub; pw.placeholder = "Master password"; pw.autocomplete = "off";
        ub = S.btn("Kholo", "btn-primary btn-block", function () {
          if (!pw.value) { S.say("Master password likho"); return; }
          ub.disabled = true; ub.textContent = "Khol raha hoon...";
          derive(pw.value, unb64(rec.salt)).then(function (k) {
            return crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(rec.iv) }, k, unb64(rec.d)).then(function (buf) { key = k; items = JSON.parse(new TextDecoder().decode(buf)); touch(); drawVault(); });
          }).catch(function () { S.say("Master password galat hai"); ub.disabled = false; ub.textContent = "Kholo"; });
        });
        body.append(S.field("Vault locked hai", pw), ub, S.btn("Backup se wapas laao", "btn-block", restoreFn),
          S.btn("Vault mita do", "btn-block", function () { if (confirm("Vault aur uske saare password hamesha ke liye mit jaayenge. Pakka?")) { try { localStorage.removeItem(VK); } catch (e) {} drawVault(); } }));
        return;
      }
      /* khula hua vault */
      var si = S.inp("text", ""), ui = S.inp("text", ""), pi = S.inp("text", ""), q = S.inp("text", "");
      si.placeholder = "Site / app ka naam"; ui.placeholder = "Username / email"; pi.placeholder = "Password"; q.placeholder = "Khojo..."; [si, ui, pi, q].forEach(function (e) { e.autocomplete = "off"; });
      var list = h("div", "");
      function rl() {
        list.textContent = ""; var f = q.value.trim().toLowerCase(), n = 0;
        items.forEach(function (it, ix) {
          if (f && (it.s + " " + it.u).toLowerCase().indexOf(f) < 0) return; n++;
          var r = h("div", "pv-item"), shown = false, pv = h("div", "st-prov", "Password chhupa hai");
          r.append(h("div", "", it.s), h("div", "st-prov", it.u || "-"), pv, S.row(
            S.btn("Dikhao", "", function () { touch(); shown = !shown; pv.textContent = shown ? it.p : "Password chhupa hai"; }),
            S.btn("Copy", "", function () { touch(); copySecret(it.p); }),
            S.btn("Hatao", "", function () { if (confirm("\"" + it.s + "\" hatana hai?")) { items.splice(ix, 1); persist().then(rl, function (e) { S.say(e.message); }); } })));
          list.append(r);
        });
        if (!n) list.append(note(items.length ? "Kuch nahi mila" : "Abhi koi password nahi rakha"));
      }
      q.oninput = rl;
      body.append(note("Vault khula hai (3 minute baad apne aap lock hoga)."), sec("Naya password jodo"), si, ui, pi,
        S.row(S.btn("Naya banao", "", function () { pi.value = genPw(16, ["lower", "upper", "digit", "sym"]); }), S.btn("Rakho", "btn-primary", function () {
          if (!si.value.trim() || !pi.value) { S.say("Site ka naam aur password likho"); return; }
          items.push({ s: si.value.trim().slice(0, 60), u: ui.value.trim().slice(0, 80), p: pi.value.slice(0, 200) });
          persist().then(function () { si.value = ui.value = pi.value = ""; touch(); rl(); S.say("Rakh liya"); }, function (e) { items.pop(); S.say(e.message); });
        })), sec("Mere password"), q, list);
      body.append(S.row(S.btn("Lock karo", "btn-primary", function () { lockNow(); drawVault(); }),
        S.btn("Backup file", "", function () { S.saveBlob(new Blob([JSON.stringify(rec)], { type: "application/json" }), "vault-backup-" + L.todayISO() + ".json"); S.say("Backup file save hui (tala-band hai)"); })));
      rl();
    }
    function restoreFn() {
      pickFile("application/json,.json", function (f) {
        readText(f).then(function (t) {
          var r = JSON.parse(t); if (!r || !r.salt || !r.iv || !r.d) throw new Error("Ye vault ki backup file nahi hai");
          if (readVault() && !confirm("Abhi ka vault hat jayega aur backup wala aayega. Pakka?")) return;
          localStorage.setItem(VK, JSON.stringify({ v: 1, salt: r.salt, iv: r.iv, d: r.d })); lockNow(); drawVault(); S.say("Backup lag gayi. Ab master password se kholo");
        }).catch(function (e) { S.say(e.message || "Backup nahi lagi"); });
      });
    }
    function draw() { body.textContent = ""; if (mode === "gen") drawGen(); else if (mode === "check") drawCheck(); else drawVault(); }
    draw();
  } });

  /* ================= MINI WEBSITE MAKER ================= */
  function esc(s) { return String(s || "").replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]; }); }
  function waNum(s) { var d = String(s || "").replace(/\D/g, ""); if (d.length === 10) d = "91" + d; return d; }
  function buildSite(st) {
    var c = /^#[0-9a-f]{6}$/i.test(st.color) ? st.color : "#7055E8", name = esc(st.biz || "Meri Dukaan"), phone = String(st.phone || "").replace(/[^\d+]/g, ""), wa = waNum(st.wa || st.phone);
    var sv = String(st.services || "").split("\n").map(function (x) { return x.trim(); }).filter(Boolean).slice(0, 12);
    var logo = st.logo ? "<img class=\"lg\" alt=\"\" src=\"" + st.logo.toDataURL("image/png") + "\">" : "";
    var btns = (phone ? "<a class=\"b\" href=\"tel:" + esc(phone) + "\">Call karo</a>" : "") + (wa ? "<a class=\"b w\" href=\"https://wa.me/" + wa + "\">WhatsApp</a>" : "");
    return "<!doctype html>\n<html lang=\"hi\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>" + name + "</title>\n<style>\n:root{--c:" + c + ";--bg:#fff;--t:#1c1c28;--card:#f4f4fa;--m:#666}\n@media(prefers-color-scheme:dark){:root{--bg:#10111B;--t:#f2f2fa;--card:#1b1c2a;--m:#aaa}}\n*{box-sizing:border-box}body{margin:0;font-family:system-ui,\"Noto Sans Devanagari\",sans-serif;background:var(--bg);color:var(--t);line-height:1.6}\n.hero{background:var(--c);color:#fff;padding:40px 20px;text-align:center}.lg{width:84px;height:84px;object-fit:contain;background:#fff;border-radius:18px;padding:6px}\nh1{margin:10px 0 4px;font-size:28px}.hero p{margin:0 auto 18px;max-width:480px;opacity:.95}\n.b{display:inline-block;margin:4px;padding:12px 22px;border-radius:999px;background:#fff;color:#111;text-decoration:none;font-weight:700}.b.w{background:#25D366;color:#fff}\nmain{max-width:720px;margin:0 auto;padding:20px}h2{color:var(--c);margin:26px 0 8px}\n.g{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}.s{background:var(--card);border-radius:14px;padding:14px;font-weight:600}\n.i{background:var(--card);border-radius:14px;padding:14px;white-space:pre-line}footer{text-align:center;color:var(--m);padding:24px;font-size:13px}\n</style></head><body>\n<div class=\"hero\">" + logo + "<h1>" + name + "</h1>" + (st.tag ? "<p>" + esc(st.tag) + "</p>" : "") + btns + "</div>\n<main>" +
      (st.about ? "<h2>Hamare baare mein</h2><p style=\"white-space:pre-line\">" + esc(st.about) + "</p>" : "") +
      (sv.length ? "<h2>Hamari seva</h2><div class=\"g\">" + sv.map(function (x) { return "<div class=\"s\">" + esc(x) + "</div>"; }).join("") + "</div>" : "") +
      ((st.addr || st.hours || st.email || phone) ? "<h2>Sampark</h2><div class=\"i\">" + (st.addr ? esc(st.addr) + "\n" : "") + (st.hours ? "Samay: " + esc(st.hours) + "\n" : "") + (phone ? "Phone: " + esc(phone) + "\n" : "") + (st.email ? "Email: " + esc(st.email) : "") + "</div>" : "") +
      "</main>\n<footer>&copy; " + new Date().getFullYear() + " " + name + "</footer>\n</body></html>\n";
  }
  S.register({ id: "website", name: "Mini Website Maker", run: function (root) {
    var st = { biz: "", tag: "", about: "", services: "", phone: "", wa: "", email: "", addr: "", hours: "", color: "#7055E8", logo: null };
    var save = L.persist("toxic.pv.site", st, ["biz", "tag", "about", "services", "phone", "wa", "email", "addr", "hours", "color"]);
    var fr = h("iframe", ""), html = "";
    fr.setAttribute("sandbox", ""); fr.title = "Website namuna"; fr.style.cssText = "width:100%;height:440px;border:1px solid var(--border);border-radius:12px;background:#fff";
    function render() { html = buildSite(st); fr.srcdoc = html; }
    var again = L.debounce(render, 400);
    L.form(root, [
      { t: "sec", l: "Aapka kaam" },
      { k: "biz", l: "Dukaan / kaam ka naam", max: 60 }, { k: "tag", l: "Ek line mein parichay", max: 100, ph: "Jaise: Kekri ka bharosemand e-Mitra kendra" },
      { k: "about", l: "Hamare baare mein", t: "textarea", rows: 4, max: 500 },
      { k: "services", l: "Seva (ek line mein ek)", t: "textarea", rows: 5, max: 600, ph: "Aadhaar update\nPAN card\nOnline form" },
      { t: "sec", l: "Sampark" },
      { k: "phone", l: "Phone", max: 18 }, { k: "wa", l: "WhatsApp number (khali = phone wala)", max: 18 }, { k: "email", l: "Email", max: 60 },
      { k: "addr", l: "Pata", t: "textarea", rows: 2, max: 160 }, { k: "hours", l: "Samay", max: 60, ph: "Subah 9 se shaam 7" },
      { t: "sec", l: "Design" },
      { k: "color", l: "Mukhya rang", t: "color" },
      { k: "logo", l: "Logo (zaroori nahi)", t: "image", max: 300, hint: "Logo nahi hai" }
    ], st, function (k) { if (k !== "logo") save(); again(); });
    root.append(sec("Namuna (live)"), fr);
    function need() { if (!st.biz.trim()) { S.say("Pehle dukaan ka naam likho"); return false; } render(); return true; }
    root.append(S.row(
      S.btn("index.html download", "btn-primary", function () { if (need()) { S.saveBlob(new Blob([html], { type: "text/html" }), "index.html"); S.say("File save hui"); } }),
      S.btn("Share", "", function () { if (need()) S.shareFile(new Blob([html], { type: "text/html" }), "index.html", st.biz); }),
      S.btn("Code copy", "", function () { if (need()) copy(html); })));
    root.append(note("Ye ek page ki website file banata hai (phone par achhi dikhti hai, andhere mode mein bhi). Isse online dalne ke liye hosting chahiye (GitHub Pages jaise muft tareeke hote hain); ye tool use khud online nahi daalta. Apni file ke baad jaankari sirf aapke phone mein rehti hai."));
    render();
  } });

  /* ================= TEXT FORMATTER PRO ================= */
  var ACTS = [
    ["Extra space hatao", function (t) { return t.replace(/[ \t]+/g, " ").replace(/ *\n */g, "\n").trim(); }],
    ["Khali line hatao", function (t) { return t.split("\n").filter(function (l) { return l.trim(); }).join("\n"); }],
    ["BADE AKSHAR", function (t) { return t.toUpperCase(); }],
    ["chhote akshar", function (t) { return t.toLowerCase(); }],
    ["Har Shabd Bada", function (t) { return t.toLowerCase().replace(/(^|[\s(])([a-z])/g, function (m, a, b) { return a + b.toUpperCase(); }); }],
    ["Line number lagao", function (t) { var n = 0; return t.split("\n").map(function (l) { return l.trim() ? (++n) + ". " + l : l; }).join("\n"); }],
    ["Bullet lagao", function (t) { return t.split("\n").map(function (l) { return l.trim() ? "\u2022 " + l : l; }).join("\n"); }],
    ["Line A-Z sort", function (t) { return t.split("\n").sort(function (a, b) { return a.localeCompare(b); }).join("\n"); }],
    ["Ek jaisi line hatao", function (t) { var s = {}; return t.split("\n").filter(function (l) { var k = l.trim(); if (!k) return true; if (s[k]) return false; s[k] = 1; return true; }).join("\n"); }],
    ["Lines ulta karo", function (t) { return t.split("\n").reverse().join("\n"); }],
    ["Ek line mein karo", function (t) { return t.replace(/\s*\n\s*/g, " ").trim(); }],
    ["WhatsApp bold (*...*)", function (t) { return t.split("\n").map(function (l) { return l.trim() ? "*" + l.trim() + "*" : l; }).join("\n"); }],
    ["Ank: 123 -> १२३", function (t) { return t.replace(/[0-9]/g, function (d) { return String.fromCharCode(0x966 + (+d)); }); }],
    ["Ank: १२३ -> 123", function (t) { return t.replace(/[\u0966-\u096F]/g, function (d) { return String(d.charCodeAt(0) - 0x966); }); }]
  ];
  S.register({ id: "textfmt", name: "Text Formatter Pro", run: function (root) {
    var ta = area(9, "Yahan text likho ya paste karo", true), cnt = h("div", "st-prov", ""), prev = null;
    function upd() { var t = ta.value, w = t.trim() ? t.trim().split(/\s+/).length : 0; cnt.textContent = w + " shabd, " + t.length + " akshar, " + (t ? t.split("\n").length : 0) + " line"; }
    ta.oninput = upd;
    root.append(ta, cnt);
    var grid = h("div", ""); grid.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0";
    ACTS.forEach(function (a) { grid.append(S.btn(a[0], "", function () { if (!ta.value.trim()) { S.say("Pehle text likho"); return; } prev = ta.value; ta.value = a[1](ta.value); upd(); })); });
    root.append(grid, S.btn("Wapas (undo)", "btn-block", function () { if (prev == null) { S.say("Wapas karne ko kuch nahi"); return; } var c = ta.value; ta.value = prev; prev = c; upd(); }));
    var f = S.inp("text", ""), r = S.inp("text", ""); f.placeholder = "Ye dhundho"; r.placeholder = "Isse badlo";
    root.append(sec("Dhundho aur badlo"), f, r, S.btn("Sab jagah badlo", "btn-block", function () {
      if (!f.value) { S.say("Dhundhne wala shabd likho"); return; }
      var n = ta.value.split(f.value).length - 1; if (!n) { S.say("Ye shabd nahi mila"); return; }
      prev = ta.value; ta.value = ta.value.split(f.value).join(r.value); upd(); S.say(n + " jagah badla");
    }));
    textBar(root, function () { return ta.value; }, "text-" + L.todayISO() + ".txt");
    upd();
  } });

  /* ================= SMART NOTES PRO ================= */
  var NK = "toxic.pv.notes";
  function loadNotes() { try { var a = JSON.parse(localStorage.getItem(NK) || "[]"); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
  S.register({ id: "notespro", name: "Smart Notes Pro", run: function (root) {
    var notes = loadNotes(), box = h("div", ""), cur = null;
    function store() { try { localStorage.setItem(NK, JSON.stringify(notes)); return true; } catch (e) { S.say("Phone mein jagah nahi bachi, note save nahi hua"); return false; } }
    function fmt(ts) { var d = new Date(ts); return d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear(); }
    function list() {
      cur = null; box.textContent = "";
      var q = S.inp("text", ""), ls = h("div", ""); q.placeholder = "Note khojo (naam, likhawat ya tag)";
      function rl() {
        ls.textContent = ""; var f = q.value.trim().toLowerCase();
        var arr = notes.filter(function (n) { return !f || (n.t + " " + n.b + " " + n.g).toLowerCase().indexOf(f) >= 0; }).sort(function (a, b) { return (b.p ? 1 : 0) - (a.p ? 1 : 0) || b.ts - a.ts; });
        arr.forEach(function (n) {
          var c = h("div", "pv-item"); c.style.cursor = "pointer";
          c.append(h("div", "", (n.p ? "[Upar] " : "") + (n.t || "Bina naam")), h("div", "st-prov", (n.b || "").split("\n")[0].slice(0, 80)), h("div", "pv-note", (n.g ? "Tag: " + n.g + "  |  " : "") + fmt(n.ts)));
          c.onclick = function () { edit(n); }; ls.append(c);
        });
        if (!arr.length) ls.append(note(notes.length ? "Kuch nahi mila" : "Abhi koi note nahi. Neeche se naya banao."));
      }
      q.oninput = rl;
      box.append(S.btn("+ Naya note", "btn-primary btn-block", function () { var n = { id: Date.now(), t: "", b: "", g: "", p: false, ts: Date.now() }; notes.push(n); edit(n); }), q, ls);
      box.append(S.row(S.btn("Sab notes download", "", function () { saveTxt(notes.map(function (n) { return (n.t || "Bina naam") + (n.g ? " [" + n.g + "]" : "") + "\n" + n.b; }).join("\n\n----------\n\n"), "notes-" + L.todayISO() + ".txt"); }),
        S.btn("Backup (JSON)", "", function () { S.saveBlob(new Blob([JSON.stringify(notes)], { type: "application/json" }), "notes-backup-" + L.todayISO() + ".json"); S.say("Backup save hui"); }),
        S.btn("Backup se wapas", "", function () {
          pickFile("application/json,.json", function (f) {
            readText(f).then(function (t) {
              var a = JSON.parse(t); if (!Array.isArray(a)) throw new Error("Ye notes ki backup nahi hai");
              var have = {}; notes.forEach(function (n) { have[n.id] = 1; }); var add = 0;
              a.forEach(function (n) { if (n && typeof n.id === "number" && !have[n.id]) { notes.push({ id: n.id, t: String(n.t || ""), b: String(n.b || ""), g: String(n.g || ""), p: !!n.p, ts: +n.ts || Date.now() }); add++; } });
              store(); list(); S.say(add + " note wapas aaye");
            }).catch(function (e) { S.say(e.message || "Backup nahi lagi"); });
          });
        })));
      box.append(note("Notes sirf aapke phone ke browser mein rehte hain. Browser ka data saaf karne ya app hatane par mit jaate hain, isliye kabhi-kabhi Backup rakho."));
      rl();
    }
    function edit(n) {
      cur = n; box.textContent = "";
      var t = S.inp("text", n.t), g = S.inp("text", n.g), b = area(10, "Yahan likho...", true), sm = h("div", "pv-note", ""), ps, ai;
      t.placeholder = "Note ka naam"; g.placeholder = "Tag (jaise: kaam, ghar)"; b.value = n.b; t.maxLength = 80; g.maxLength = 30;
      var save = L.debounce(function () { n.t = t.value; n.g = g.value; n.b = b.value; n.ts = Date.now(); store(); }, 400);
      t.oninput = g.oninput = b.oninput = save;
      function flush() { n.t = t.value; n.g = g.value; n.b = b.value; n.ts = Date.now(); store(); }
      ps = S.btn(n.p ? "Upar se hatao" : "Upar rakho", "", function () { n.p = !n.p; ps.textContent = n.p ? "Upar se hatao" : "Upar rakho"; flush(); });
      ai = S.btn("AI se saaransh", "", function () {
        if (!b.value.trim()) { S.say("Pehle note likho"); return; }
        ai.disabled = true; ai.textContent = "Soch raha hoon...";
        L.ai("Is note ka 2-4 chhote bindu mein saaransh likho. Sirf wahi likho jo note mein hai, kuch jodo mat. Note ki bhasha mein likho. Koi heading nahi.", b.value).then(function (r) { sm.textContent = r.replace(/\*\*|__|`/g, "").trim(); }, function (e) { S.say(e.message || "AI se jawab nahi mila"); })
          .then(function () { ai.disabled = false; ai.textContent = "AI se saaransh"; });
      });
      box.append(S.btn("< Sab notes", "btn-block", function () { flush(); if (!n.t.trim() && !n.b.trim()) notes = notes.filter(function (x) { return x !== n; }); store(); list(); }), S.field("Naam", t), S.field("Tag", g), S.field("Note", b), S.row(ps, ai), sm);
      textBar(box, function () { return (t.value ? t.value + "\n\n" : "") + b.value; }, "note-" + L.todayISO() + ".txt");
      box.append(S.btn("Ye note hatao", "btn-block", function () { if (confirm("Ye note hamesha ke liye hat jayega. Pakka?")) { notes = notes.filter(function (x) { return x !== n; }); store(); list(); } }));
    }
    root.append(box); list();
  } });
})();
