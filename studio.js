/* TOXIC AI - Studio (naye tools). Ye file app.js ko chhedti nahi; apni alag screen jodti hai. */
(function () {
  "use strict";

  var API = (typeof API_URL !== "undefined" ? String(API_URL) : "").replace(/\/$/, "");
  var RULE_T = typeof RULE !== "undefined" ? RULE : "";

  /* ---------- chhote helper ---------- */
  function q(s, r) { return (r || document).querySelector(s); }
  function h(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  function say(m) { if (typeof toast === "function") toast(m); else alert(m); }
  function copyText(t) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(function () { say("Copy ho gaya"); }, function () { say("Copy nahi ho paya"); });
    } else say("Is browser mein copy nahi ho sakta");
  }
  function saveBlob(blob, name) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }
  function fmtSize(n) {
    if (n < 1024) return n + " B";
    if (n < 1048576) return (n / 1024).toFixed(1) + " KB";
    return (n / 1048576).toFixed(2) + " MB";
  }

  /* ---------- icons (line SVG, ek jaisa size/rang/stroke) ---------- */
  var IC = {
    menu: '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>',
    back: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    grid: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
    studio: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 3v4"/><path d="M21 5h-4"/>',
    settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
    book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    image: '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
    calc: '<rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><path d="M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01M16 14h.01M16 18h.01"/>',
    file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    video: '<path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2"/>',
    copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    speaker: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    tool: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    mic: '<rect width="6" height="12" x="9" y="2" rx="3"/><path d="M5 10v1a7 7 0 0 0 14 0v-1"/><line x1="12" x2="12" y1="19" y2="22"/>',
    cal: '<rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>',
    palette: '<circle cx="13.5" cy="6.5" r="1"/><circle cx="17.5" cy="10.5" r="1"/><circle cx="8.5" cy="7.5" r="1"/><circle cx="6.5" cy="12.5" r="1"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    list: '<line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/>',
    sw: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M9 2h6"/>'
  };
  function icon(name, size, fill) {
    var s = size || 22;
    var sp = h("span", "st-ico");
    sp.innerHTML = '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="' + (fill ? "currentColor" : "none") + '" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (IC[name] || IC.tool) + "</svg>";
    return sp;
  }

  /* ---------- AI tools (sab /chat Worker se chalte hain) ---------- */
  var AI = [];
  function A(id, cat, ic, name, desc, sys, ph) { AI.push({ id: id, cat: cat, ic: ic, name: name, desc: desc, ai: true, sys: sys, ph: ph || "Yahan likho..." }); }

  A("w_email", "writer", "pen", "Email Writer", "Professional email", "Zaroorat ke hisaab se subject ke saath ek achhi email likho.", "Kisko, kis baare mein email likhni hai?");
  A("w_essay", "writer", "pen", "Essay Writer", "Nibandh", "Topic par structured essay likho: introduction, body aur conclusion ke saath.", "Essay ka topic likho");
  A("w_story", "writer", "pen", "Story Writer", "Kahani", "Diye gaye idea par ek dilchasp kahani likho.", "Kahani ka idea likho");
  A("w_poem", "writer", "pen", "Poetry Writer", "Kavita", "Diye gaye topic par ek achhi kavita likho.", "Kavita ka topic likho");
  A("w_shayari", "writer", "pen", "Shayari Writer", "Shayari", "Diye gaye mood ya topic par dil ko chhoone wali shayari likho.", "Kis baare mein shayari chahiye?");
  A("w_blog", "writer", "pen", "Blog Writer", "Blog post", "Topic par SEO-friendly blog post likho: title, intro, headings aur conclusion ke saath.", "Blog ka topic likho");
  A("w_article", "writer", "pen", "Article Writer", "Article", "Topic par jaankari bhara article likho.", "Article ka topic likho");
  A("w_social", "writer", "pen", "Social Media Post", "Post likho", "Diye gaye topic par social media post likho, kuch hashtags ke saath.", "Post kis baare mein hai?");
  A("w_insta", "writer", "pen", "Instagram Caption", "Caption", "Diye gaye photo/topic ke liye 5 alag-alag Instagram captions likho.", "Photo ya topic ke baare mein likho");
  A("w_yts", "writer", "pen", "YouTube Script Writer", "Video script", "Diye gaye topic par YouTube video ki script likho: hook, main hissa aur outro ke saath.", "Video ka topic likho");
  A("w_resume", "writer", "pen", "Resume Builder", "Resume", "Diye gaye vivaran se ek saaf professional resume likho. Jo jaankari na ho use apne se mat banao, [yahan bharo] likho.", "Naam, padhai, kaam ka anubhav, skills likho");
  A("w_cover", "writer", "pen", "Cover Letter Writer", "Cover letter", "Diye gaye vivaran se cover letter likho. Jo jaankari na ho use apne se mat banao.", "Job ka naam aur apna anubhav likho");
  A("w_prod", "writer", "pen", "Product Description", "Product ka vivaran", "Product ka aakarshak description likho: khaasiyat aur fayde ke saath.", "Product ka naam aur khaasiyat likho");
  A("w_grammar", "writer", "pen", "Grammar Checker", "Galtiyan theek karo", "Diya gaya text padho, galtiyan theek karke saaf version do aur batao kya badla.", "Jo text check karna hai wo likho");
  A("w_sum", "writer", "pen", "Text Summarizer", "Chhota saar", "Diye gaye text ka chhota aur saaf saar do.", "Lamba text yahan chipkao");
  A("w_rewrite", "writer", "pen", "Text Rewriter", "Dobara likho", "Diye gaye text ko behtar shabdon mein dobara likho, matlab wahi rakho.", "Jo text dobara likhwana hai wo likho");
  A("w_ideas", "writer", "pen", "Content Ideas", "Naye idea", "Diye gaye topic par 10 naye content ideas do.", "Topic ya niche likho");
  A("w_msg", "writer", "pen", "Professional Message", "Message likho", "Zaroorat ke hisaab se ek vinamra aur professional message likho.", "Kisko, kya kehna hai?");

  A("c_gen", "code", "code", "Code Generator", "Code likhwao", "User ki zaroorat ke hisaab se poora kaam karne wala code likho aur chhota explanation do.", "Kya banana hai?");
  A("c_bug", "code", "code", "Bug Fixer", "Galti dhundo", "User ka code padho, bug dhundo, theek kiya hua code do aur batao kya badla.", "Apna code yahan chipkao");
  A("c_exp", "code", "code", "Code Explainer", "Code samjho", "Diye gaye code ko line-by-line asaan bhasha mein samjhao.", "Code yahan chipkao");
  A("c_sql", "code", "code", "SQL Assistant", "SQL queries", "SQL query likho ya samjhao aur batao kaise kaam karti hai.", "Table aur kaam ka vivaran likho");
  A("c_html", "code", "code", "HTML Generator", "HTML page", "Diye gaye vivaran ke hisaab se saaf, sahi HTML code likho.", "Kaisa page chahiye?");
  A("c_css", "code", "code", "CSS Generator", "CSS styling", "Diye gaye vivaran ke hisaab se saaf CSS code likho.", "Kaisi styling chahiye?");
  A("c_js", "code", "code", "JavaScript Assistant", "JavaScript madad", "JavaScript mein code likho ya samjhao.", "JavaScript mein kya karwana hai?");
  A("c_py", "code", "code", "Python Assistant", "Python madad", "Python mein code likho ya samjhao.", "Python mein kya karwana hai?");
  A("c_kt", "code", "code", "Kotlin Assistant", "Kotlin madad", "Kotlin mein code likho ya samjhao.", "Kotlin mein kya karwana hai?");
  A("c_rx", "code", "code", "Regex Helper", "Regex banao", "Zaroorat ke hisaab se regex likho aur example ke saath samjhao.", "Kya match karna hai?");
  A("c_conv", "code", "code", "Code Converter", "Ek bhasha se doosri", "Diya gaya code user ki bataayi bhasha mein badlo. Pehli line mein bhasha batao.", "Code chipkao aur likho kis bhasha mein chahiye");
  A("c_err", "code", "code", "Error Explainer", "Error samjho", "Diya gaya error message asaan bhasha mein samjhao aur theek karne ke tareeke batao.", "Error message yahan chipkao");

  A("s_math", "study", "book", "Math Solver", "Step-by-step hal", "Math sawal ko step-by-step hal karo aur aakhir mein final answer likho.", "Sawal likho");
  A("s_quiz", "study", "book", "Quiz Generator", "Quiz banao", "Topic par 5 sawalon ka quiz banao aur aakhir mein answers do.", "Quiz ka topic likho");
  A("s_mcq", "study", "book", "MCQ Generator", "MCQ sawal", "Topic par 10 MCQ sawal banao, 4 options ke saath, aakhir mein answers do.", "Topic likho");
  A("s_exam", "study", "book", "Exam Preparation", "Padhai ki taiyari", "Exam ke liye practical study tips aur important points batao.", "Kaunsa exam aur subject?");
  A("s_plan", "study", "book", "Study Planner", "Padhai ka plan", "Diye gaye samay aur subjects ke hisaab se din-wise study plan banao.", "Exam ki tareekh, subjects aur roz ke ghante likho");
  A("s_notes", "study", "book", "Notes Generator", "Chhote notes", "Diye gaye topic ke short, point-wise exam notes banao.", "Topic likho");
  A("s_qa", "study", "book", "Question-Answer Generator", "Sawal-jawab", "Diye gaye text se important sawal aur unke jawab banao.", "Text chipkao");
  A("s_trans", "study", "book", "Translator", "Anuvad", "Sirf translation do. Agar user ne bhasha na batayi ho to Hindi se English, English se Hindi karo.", "Text likho (aur kis bhasha mein chahiye)");
  A("s_vocab", "study", "book", "Vocabulary Helper", "Shabd-kosh", "Diye gaye shabd ka matlab, example aur milte-julte shabd batao.", "Shabd likho");
  A("s_gram", "study", "book", "Grammar Assistant", "Grammar samjho", "Grammar ka niyam asaan bhasha mein example ke saath samjhao.", "Grammar ka topic ya sawal likho");
  A("s_flash", "study", "book", "Flashcards", "Yaad karne ke card", "Topic par 10 flashcards banao: Sawal / Jawab format mein.", "Topic likho");
  A("s_topic", "study", "book", "Topic Explainer", "Topic samjho", "Topic ko bilkul asaan bhasha mein example ke saath samjhao.", "Kaunsa topic samjhna hai?");
  A("s_hw", "study", "book", "Homework Helper", "Homework madad", "Homework ka sawal step-by-step samjhao, sirf answer mat do.", "Homework ka sawal likho");

  A("v_script", "video", "video", "Video Script Writer", "Video ki script", "Diye gaye topic par short video ki script likho: scene-wise.", "Video ka topic likho");
  A("v_title", "video", "video", "YouTube Title Generator", "Title idea", "Diye gaye video ke liye 10 aakarshak YouTube titles do.", "Video kis baare mein hai?");
  A("v_desc", "video", "video", "YouTube Description", "Description", "Diye gaye video ke liye YouTube description aur kuch hashtags likho.", "Video kis baare mein hai?");
  A("v_cap", "video", "video", "Video Caption Writer", "Caption likho", "Diye gaye video ke liye chhote, achhe captions likho.", "Video kis baare mein hai?");

  /* ---------- AI tool ki screen ---------- */
  function aiUI(t, root) {
    var ta = h("textarea", "input");
    ta.rows = 6; ta.maxLength = 4000; ta.placeholder = t.ph;
    ta.style.resize = "vertical";
    var lang = h("select", "select");
    [["", "Bhasha: jo main likhun wahi"], ["Hindi (Devanagari)", "Hindi (देवनागरी)"], ["English", "English"], ["Hinglish", "Hinglish"]].forEach(function (o) {
      var op = h("option", "", o[1]); op.value = o[0]; lang.append(op);
    });
    var go = h("button", "btn btn-primary btn-block", "Generate");
    var res = h("div", "card st-res"); res.hidden = true;
    var prov = h("div", "st-prov");
    var bar = h("div", "st-bar");
    var bCopy = h("button", "btn", "Copy");
    var bSpeak = h("button", "btn", "Suno");
    var bAgain = h("button", "btn", "Dobara");
    bar.append(bCopy, bSpeak, bAgain);
    var out = h("div", "st-out");
    res.append(out, prov, bar);
    var last = "";
    var ctrl = null;

    function run() {
      var text = ta.value.trim();
      if (!text) { say("Pehle kuch likho"); return; }
      if (!API) { say("AI abhi jura nahi hai"); return; }
      go.disabled = true; go.textContent = "Soch raha hoon...";
      res.hidden = false; out.textContent = ""; prov.textContent = "";
      var dots = h("div", "typing"); dots.append(h("span"), h("span"), h("span")); out.append(dots);
      ctrl = new AbortController();
      var timedOut = false;
      var timer = setTimeout(function () { timedOut = true; ctrl.abort(); }, 45000);
      var sys = RULE_T + " " + t.sys + (lang.value ? " Jawab " + lang.value + " mein do." : "");
      fetch(API + "/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: ctrl.signal,
        body: JSON.stringify({ system: sys, messages: [{ role: "user", content: text }] })
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (d) {
          if (!r.ok || !d.reply) throw new Error(d.error || "Server error " + r.status);
          return d;
        });
      }).then(function (d) {
        last = String(d.reply);
        out.textContent = "";
        if (typeof renderMd === "function") out.append(renderMd(last)); else { out.style.whiteSpace = "pre-wrap"; out.textContent = last; }
        prov.textContent = d.provider ? "Provider: " + d.provider : "";
      }).catch(function (e) {
        last = "";
        var m = timedOut ? "Time out ho gaya. Dobara koshish karo." : (e instanceof TypeError ? "Server se connect nahi ho paya. Internet check karo." : "Jawab nahi mila: " + (e.message || e));
        out.textContent = m;
      }).then(function () {
        clearTimeout(timer);
        go.disabled = false; go.textContent = "Generate";
      });
    }
    go.onclick = run;
    bAgain.onclick = run;
    bCopy.onclick = function () { if (last) copyText(last); else say("Abhi kuch copy karne ko nahi hai"); };
    bSpeak.onclick = function () {
      if (!("speechSynthesis" in window)) { say("Is browser mein awaaz nahi hai"); return; }
      if (speechSynthesis.speaking) { speechSynthesis.cancel(); return; }
      if (!last) { say("Pehle jawab banwao"); return; }
      var u = new SpeechSynthesisUtterance(last.replace(/[*#`_>-]/g, " ").slice(0, 3000));
      u.lang = /[\u0900-\u097F]/.test(last) ? "hi-IN" : "en-IN";
      speechSynthesis.speak(u);
    };
    root.append(ta, lang, go, res);
  }

  /* ---------- browser ke tools (bina API ke) ---------- */
  var B = [];
  function D(id, cat, ic, name, desc, run) { B.push({ id: id, cat: cat, ic: ic, name: name, desc: desc, run: run }); }
  function field(label, node) { var w = h("label", "st-field"); w.append(h("span", "st-lab", label), node); return w; }
  function inp(type, val) { var i = h("input", "input"); i.type = type; if (val != null) i.value = val; return i; }
  function btn(text, cls, fn) { var b = h("button", "btn " + (cls || ""), text); b.type = "button"; b.onclick = fn; return b; }
  function row() { var r = h("div", "st-row"); for (var k = 0; k < arguments.length; k++) r.append(arguments[k]); return r; }

  /* Calculator (eval nahi, apna safe parser) */
  function evalExpr(src, deg) {
    var s = src.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/\s+/g, "").toLowerCase();
    var i = 0;
    function pk() { return s.charAt(i); }
    function add() { var v = mul(); while (pk() === "+" || pk() === "-") { var o = s.charAt(i++); var r = mul(); v = o === "+" ? v + r : v - r; } return v; }
    function mul() { var v = unary(); while (pk() === "*" || pk() === "/" || pk() === "%") { var o = s.charAt(i++); var r = unary(); v = o === "*" ? v * r : o === "/" ? v / r : v % r; } return v; }
    function unary() { if (pk() === "-") { i++; return -unary(); } if (pk() === "+") { i++; return unary(); } return pw(); }
    function pw() { var b = primary(); if (pk() === "^") { i++; return Math.pow(b, unary()); } return b; }
    function primary() {
      if (pk() === "(") { i++; var v = add(); if (pk() !== ")") throw new Error("bracket"); i++; return v; }
      var m = /^(\d+\.?\d*|\.\d+)/.exec(s.slice(i));
      if (m) { i += m[0].length; return parseFloat(m[0]); }
      m = /^[a-zπ]+/.exec(s.slice(i));
      if (!m) throw new Error("galat");
      var name = m[0]; i += name.length;
      if (name === "pi" || name === "π") return Math.PI;
      if (name === "e") return Math.E;
      if (pk() !== "(") throw new Error("galat");
      i++; var a = add(); if (pk() !== ")") throw new Error("bracket"); i++;
      var rad = deg ? a * Math.PI / 180 : a;
      switch (name) {
        case "sin": return Math.sin(rad);
  
