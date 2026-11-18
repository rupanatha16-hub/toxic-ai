"use strict";

/* Cloudflare Worker ka URL yahan bharenge (agle phase ke baad). Abhi khali rehne do. */
const API_URL = "https://toxic-ai-api.ahrs36567.workers.dev";

const RULE = " User jis bhasha mein likhe (Hindi, English ya Hinglish) usi mein jawab do. Jawab saaf, sahi aur seedha do. Agar kuch pata na ho to ye bolo, andaza mat lagao. Tumhara naam TOXIC AI hai. Apne ko kabhi ChatGPT, OpenAI ya kisi aur model ka naam mat batao.";

const MODES = [
  {id:"general",name:"🤖 General Assistant",system:"Tum TOXIC AI ho, ek helpful general assistant."},
  {id:"teacher",name:"🎓 Teacher",system:"Tum ek dhairyawan teacher ho. Step-by-step simple tareeke se samjhao aur example do."},
  {id:"coder",name:"💻 Coder",system:"Tum ek expert programmer ho. Kaam karne wala saaf code do aur chhota explanation do."},
  {id:"writer",name:"✍️ Writer",system:"Tum ek creative professional writer ho. Achhi, natural likhai likho."},
  {id:"friend",name:"😊 Friend",system:"Tum ek friendly dost ho. Garmjoshi se, casual aur supportive andaaz mein baat karo."},
  {id:"research",name:"🔎 Research Assistant",system:"Tum ek research assistant ho. Organized jawab do aur saaf batao ki kya pakka hai aur kya nahi. Source ke bina koi link ya reference mat banao."},
  {id:"reasoning",name:"🧠 Reasoning Assistant",system:"Tum ek logical reasoning assistant ho. Pehle step-by-step sochkar tark dikhao, phir final jawab do."},
  {id:"translator",name:"🌐 Translator",system:"Tum ek translator ho. Sirf translation do, jab tak user aur kuch na maange. Matlab aur tone same rakho."}
];

const TOOLS = [
  {id:"math",ico:"➗",name:"Math Solver",desc:"Step-by-step hal",mode:"teacher",sys:"Math sawal ko step-by-step hal karo aur aakhir mein final answer likho."},
  {id:"notes",ico:"📝",name:"Notes Generator",desc:"Chhote exam notes",mode:"teacher",sys:"Diye gaye topic ke short, point-wise exam notes banao."},
  {id:"quiz",ico:"❓",name:"Quiz Generator",desc:"MCQ quiz banao",mode:"teacher",sys:"Topic par 5 MCQ sawal banao, 4 options ke saath, aur aakhir mein answers do."},
  {id:"exam",ico:"📚",name:"Exam Preparation",desc:"Padhai ka plan",mode:"teacher",sys:"Exam ke liye practical study plan aur important points batao."},
  {id:"code",ico:"⌨️",name:"Code Generator",desc:"Code likhwao",mode:"coder",sys:"User ki zaroorat ke hisaab se poora kaam karne wala code likho."},
  {id:"bug",ico:"🐞",name:"Bug Fixer",desc:"Galti dhundo",mode:"coder",sys:"User ka code padho, bug dhundo, theek kiya hua code do aur batao kya badla."},
  {id:"explain",ico:"💡",name:"Code Explainer",desc:"Code samjho",mode:"coder",sys:"Diye gaye code ko line-by-line asaan bhasha mein samjhao."},
  {id:"sql",ico:"🗄️",name:"SQL Assistant",desc:"SQL queries",mode:"coder",sys:"SQL query likho ya samjhao aur batao kaise kaam karti hai."},
  {id:"email",ico:"✉️",name:"Email Writer",desc:"Professional email",mode:"writer",sys:"Zaroorat ke hisaab se subject ke saath ek achhi email likho."},
  {id:"essay",ico:"📄",name:"Essay Writer",desc:"Nibandh likho",mode:"writer",sys:"Topic par structured essay likho: introduction, body aur conclusion ke saath."},
  {id:"story",ico:"📖",name:"Story Writer",desc:"Kahani likho",mode:"writer",sys:"Diye gaye idea par ek dilchasp kahani likho."},
  {id:"poem",ico:"🪶",name:"Poetry Writer",desc:"Kavita / shayari",mode:"writer",sys:"Topic par original kavita ya shayari likho."},
  {id:"social",ico:"📱",name:"Social Media Writer",desc:"Post aur caption",mode:"writer",sys:"Social media ke liye catchy post, caption aur hashtags likho."},
  {id:"youtube",ico:"🎬",name:"YouTube Script",desc:"Video script",mode:"writer",sys:"YouTube video ki script likho: hook, main content aur outro ke saath."},
  {id:"resume",ico:"📋",name:"Resume Builder",desc:"Resume banao",mode:"writer",sys:"User ki details se professional resume banao. Jo detail na di ho use khud mat banao, pehle pooch lo."},
  {id:"translate",ico:"🌐",name:"Translator",desc:"Anuvad karo",mode:"translator",sys:"User ka text unki batayi bhasha mein translate karo. Bhasha na batayi ho to Hindi aur English ke beech translate karo."}
];
const QUICK = ["math","code","email","translate"];

const $ = (s) => document.querySelector(s);
const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
};
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
};
const modeById = (id) => MODES.find((m) => m.id === id) || MODES[0];
const toolById = (id) => TOOLS.find((t) => t.id === id) || null;

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toast.t);
  toast.t = setTimeout(() => { t.hidden = true; }, 2200);
}

/* ---------- Chat history (IndexedDB) ---------- */
let db = null;
function dbOpen() {
  return new Promise((res, rej) => {
    const r = indexedDB.open("toxic-ai", 1);
    r.onupgradeneeded = () => { r.result.createObjectStore("chats", { keyPath: "id" }); };
    r.onsuccess = () => { db = r.result; res(); };
    r.onerror = () => rej(r.error);
  });
}
function tx(mode, fn) {
  return new Promise((res, rej) => {
    const t = db.transaction("chats", mode);
    const r = fn(t.objectStore("chats"));
    t.oncomplete = () => res(r && r.result);
    t.onerror = () => rej(t.error);
    t.onabort = () => rej(t.error);
  });
}
const guard = (f, d) => (...a) => (db ? f(...a) : Promise.resolve(d));
const dbAll = guard(() => tx("readonly", (s) => s.getAll()).then((a) => (a || []).sort((x, y) => y.updated - x.updated)), []);
const dbGet = guard((id) => tx("readonly", (s) => s.get(id)), null);
const dbPut = guard((c) => tx("readwrite", (s) => s.put(c)), null);
const dbDel = guard((id) => tx("readwrite", (s) => s.delete(id)), null);
const dbClear = guard(() => tx("readwrite", (s) => s.clear()), null);

/* ---------- State ---------- */
let current = null;
let generating = false;
let ctrl = null;
let lastMain = "home";

/* ---------- Navigation ---------- */
function show(name) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.toggle("active", s.id === "screen-" + name));
  document.querySelectorAll(".nav-btn").forEach((b) => b.classList.toggle("active", b.dataset.go === name));
  $("#bottomNav").style.display = name === "chat" ? "none" : "";
  if (name !== "chat") lastMain = name;
  if (name === "home") renderRecent();
  if (name === "chats") renderChats();
}

/* ---------- Theme ---------- */
function applyTheme(t) {
  document.documentElement.setAttribute("data-theme", t);
  store.set("toxic.theme", t);
  const tg = $("#themeToggle");
  tg.classList.toggle("on", t === "light");
  tg.setAttribute("aria-checked", String(t === "light"));
  document.querySelector('meta[name="theme-color"]').setAttribute("content", t === "light" ? "#F7F7FC" : "#10111B");
}
function toggleTheme() {
  applyTheme(document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light");
}

/* ---------- Tools ---------- */
function renderTools(box, list) {
  box.textContent = "";
  list.forEach((t) => {
    const b = el("button", "tool");
    b.append(el("span", "ico", t.ico), el("b", "", t.name), el("small", "", t.desc));
    b.onclick = () => newChat(t.mode, t);
    box.append(b);
  });
}

/* ---------- Chat list ---------- */
function chatRow(c) {
  const row = el("div", "list-item");
  row.append(el("span", "", modeById(c.mode).name.split(" ")[0]));
  const meta = el("div", "meta");
  meta.append(el("div", "title", c.title), el("div", "sub", new Date(c.updated).toLocaleDateString("hi-IN")));
  row.append(meta);
  const ren = el("button", "icon-btn", "✏️");
  ren.setAttribute("aria-label", "Naam badlo");
  ren.style.cssText = "width:38px;height:38px;font-size:16px";
  ren.onclick = async (e) => {
    e.stopPropagation();
    const n = prompt("Chat ka naya naam", c.title);
    if (n && n.trim()) {
      c.title = n.trim().slice(0, 60);
      await dbPut(c);
      renderChats();
      renderRecent();
    }
  };
  const del = el("button", "icon-btn", "🗑️");
  del.setAttribute("aria-label", "Delete karo");
  del.style.cssText = "width:38px;height:38px;font-size:16px";
  del.onclick = async (e) => {
    e.stopPropagation();
    if (confirm("Ye chat delete kar dein?")) {
      await dbDel(c.id);
      renderChats();
      renderRecent();
      toast("Chat delete ho gayi");
    }
  };
  row.append(ren, del);
  row.onclick = () => openChat(c.id);
  return row;
}
async function renderRecent() {
  const box = $("#recentList");
  const all = await dbAll();
  box.textContent = "";
  if (!all.length) { box.append(el("div", "empty", "Abhi koi chat nahi. New Chat se shuru karo.")); return; }
  all.slice(0, 3).forEach((c) => box.append(chatRow(c)));
}
async function renderChats() {
  const box = $("#chatList");
  const q = $("#chatSearch").value.trim().toLowerCase();
  let all = await dbAll();
  if (q) {
    all = all.filter((c) => c.title.toLowerCase().includes(q) || c.messages.some((m) => m.content.toLowerCase().includes(q)));
  }
  box.textContent = "";
  if (!all.length) { box.append(el("div", "empty", q ? "Koi chat nahi mili." : "Abhi koi chat nahi.")); return; }
  all.forEach((c) => box.append(chatRow(c)));
}

/* ---------- Chat screen ---------- */
function newChat(modeId, tool) {
  current = {
    id: "c" + Date.now() + Math.random().toString(36).slice(2, 7),
    title: tool ? tool.name : "New Chat",
    mode: modeId,
    toolId: tool ? tool.id : null,
    messages: [],
    updated: Date.now()
  };
  renderChat();
  show("chat");
}
async function openChat(id) {
  const c = await dbGet(id);
  if (!c) { toast("Chat nahi mili"); return; }
  current = c;
  renderChat();
  show("chat");
}
function renderChat(notice) {
  $("#chatTitle").textContent = current.title;
  const box = $("#chatBox");
  box.textContent = "";
  if (!current.messages.length) {
    const t = toolById(current.toolId);
    box.append(el("div", "empty", t ? t.ico + " " + t.name + " — " + t.desc + ". Apna sawal ya text likho." : "Sawal likho aur TOXIC AI se baat shuru karo."));
  }
  const lastIdx = current.messages.length - 1;
  current.messages.forEach((m, i) => {
    const wrap = el("div", "msg " + (m.role === "user" ? "user" : "ai"));
    wrap.append(el("div", "bubble", m.content));
    if (m.role === "assistant") {
      if (m.provider) {
        const pv = el("div", "", "Provider: " + m.provider);
        pv.style.cssText = "font-size:12px;opacity:.7;margin:4px 6px";
        wrap.append(pv);
      }
      const acts = el("div", "msg-actions");
      const cp = el("button", "", "📋 Copy");
      cp.onclick = () => {
        navigator.clipboard.writeText(m.content).then(() => toast("Copy ho gaya"), () => toast("Copy nahi ho paya"));
      };
      acts.append(cp);
      if (canSpeak) {
        const sp = el("button", "", "🔊 Sunao");
        sp.onclick = () => speakText(m.content, sp);
        acts.append(sp);
      }
      if (navigator.share) {
        const sh = el("button", "", "📤 Share");
        sh.onclick = () => { navigator.share({ text: m.content }).catch(() => {}); };
        acts.append(sh);
      }
      if (i === lastIdx) {
        const rg = el("button", "", "🔄 Regenerate");
        rg.onclick = regenerate;
        acts.append(rg);
      }
      wrap.append(acts);
    }
    box.append(wrap);
  });
  if (notice) box.append(el("div", "empty", notice));
  box.scrollTop = box.scrollHeight;
}
function setGenerating(v) {
  generating = v;
  const b = $("#sendBtn");
  b.textContent = v ? "⏹" : "➤";
  b.setAttribute("aria-label", v ? "Rokho" : "Bhejo");
}
function autosize() {
  const ta = $("#msgInput");
  ta.style.height = "auto";
  ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
}
async function save() {
  current.updated = Date.now();
  try { await dbPut(current); } catch (e) { toast("Chat save nahi ho payi"); }
}
function buildSystem() {
  const t = toolById(current.toolId);
  let s = modeById(current.mode).system + (t ? " " + t.sys : "") + RULE;
  const instr = store.get("toxic.instr", "").trim();
  if (instr) s += " User ke custom instructions: " + instr;
  return s;
}
async function send() {
  if (generating) { if (ctrl) ctrl.abort(); return; }
  const input = $("#msgInput");
  const text = input.value.trim();
  if (!text) return;
  if (text.length > 4000) { toast("Message bahut lamba hai (max 4000 akshar)"); return; }
  input.value = "";
  autosize();
  current.messages.push({ role: "user", content: text, ts: Date.now() });
  if (current.messages.length === 1) {
    const t = toolById(current.toolId);
    current.title = (t ? t.name + " · " : "") + text.slice(0, 40);
  }
  await save();
  renderChat();
  await callAI();
}
async function regenerate() {
  if (generating) return;
  const last = current.messages[current.messages.length - 1];
  if (last && last.role === "assistant") current.messages.pop();
  await save();
  renderChat();
  await callAI();
}
async function callAI() {
  if (!API_URL) {
    renderChat("AI abhi jura nahi hai. Backend (Cloudflare Worker) agle phase mein jodenge, tab jawab milega. Aapka message save ho gaya hai.");
    return;
  }
  setGenerating(true);
  const box = $("#chatBox");
  const wrap = el("div", "msg ai");
  const bub = el("div", "bubble");
  bub.style.padding = "0";
  const dots = el("div", "typing");
  dots.append(el("span"), el("span"), el("span"));
  bub.append(dots);
  wrap.append(bub);
  box.append(wrap);
  box.scrollTop = box.scrollHeight;

  ctrl = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; ctrl.abort(); }, 45000);
  let notice = "";
  try {
    const resp = await fetch(API_URL.replace(/\/$/, "") + "/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: ctrl.signal,
      body: JSON.stringify({
        system: buildSystem(),
        messages: current.messages.slice(-20).map((m) => ({ role: m.role, content: m.content }))
      })
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok || !data.reply) throw new Error(data.error || "Server error " + resp.status);
    current.messages.push({ role: "assistant", content: String(data.reply), ts: Date.now(), provider: data.provider || "" });
    await save();
  } catch (e) {
    if (timedOut) notice = "Time out ho gaya. Dobara koshish karo.";
    else if (e && e.name === "AbortError") notice = "Jawab rok diya gaya.";
    else if (e instanceof TypeError) notice = "Server se connect nahi ho paya. Internet check karo.";
    else notice = "Jawab nahi mila: " + (e.message || e);
  } finally {
    clearTimeout(timer);
    ctrl = null;
    setGenerating(false);
    renderChat(notice);
  }
}

/* ---------- Voice (browser ki apni suvidha) ---------- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const canSpeak = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
let rec = null, listening = false, speakingEl = null;

function cleanForSpeech(t) {
  return String(t).replace(/[\\\[\]()*_`#>]/g, " ").replace(/\s+/g, " ").trim();
}
function stopSpeaking() {
  if (canSpeak) speechSynthesis.cancel();
  if (speakingEl) { speakingEl.textContent = "🔊 Sunao"; speakingEl = null; }
}
function speakText(text, btn) {
  if (!canSpeak) return;
  if (speakingEl === btn) { stopSpeaking(); return; }
  stopSpeaking();
  const u = new SpeechSynthesisUtterance(cleanForSpeech(text).slice(0, 3000));
  const hasDev = /[\u0900-\u097F]/.test(text);
  u.lang = hasDev ? "hi-IN" : "en-IN";
  const v = speechSynthesis.getVoices().find((x) => x.lang && x.lang.toLowerCase().startsWith(u.lang.slice(0, 2).toLowerCase()));
  if (v) u.voice = v;
  u.onend = u.onerror = () => { if (speakingEl === btn) { btn.textContent = "🔊 Sunao"; speakingEl = null; } };
  speakingEl = btn;
  btn.textContent = "⏹ Roko";
  speechSynthesis.speak(u);
}
function setupMic() {
  if (!SR) return;
  const send = $("#sendBtn");
  const mic = el("button", send.className, "🎤");
  mic.type = "button";
  mic.setAttribute("aria-label", "Bol kar likho");
  mic.style.marginRight = "6px";
  send.parentNode.insertBefore(mic, send);
  const input = $("#msgInput");
  let base = "";
  mic.onclick = () => {
    if (listening && rec) { rec.stop(); return; }
    rec = new SR();
    rec.lang = "hi-IN";
    rec.interimResults = true;
    rec.continuous = false;
    base = input.value ? input.value.trim() + " " : "";
    rec.onstart = () => { listening = true; mic.textContent = "⏹"; toast("Boliye, main sun raha hoon"); };
    rec.onresult = (e) => {
      let t = "";
      for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
      input.value = (base + t).slice(0, 4000);
      autosize();
    };
    rec.onerror = (e) => {
      const m = { "not-allowed": "Mic ki permission nahi mili", "service-not-allowed": "Mic ki permission nahi mili", "no-speech": "Kuch sunai nahi diya", "network": "Internet check karo" };
      toast(m[e.error] || "Mic mein dikkat: " + e.error);
    };
    rec.onend = () => { listening = false; mic.textContent = "🎤"; };
    try { rec.start(); } catch (err) { toast("Mic shuru nahi ho paya"); }
  };
}

/* ---------- Init ---------- */
async function init() {
  applyTheme(store.get("toxic.theme", "dark"));

  const sel = $("#modeSelect");
  MODES.forEach((m) => { const o = el("option", "", m.name); o.value = m.id; sel.append(o); });
  sel.value = store.get("toxic.mode", "general");
  if (!sel.value) sel.value = "general";
  sel.onchange = () => store.set("toxic.mode", sel.value);

  renderTools($("#quickTools"), TOOLS.filter((t) => QUICK.includes(t.id)));
  renderTools($("#toolsGrid"), TOOLS);

  document.querySelectorAll(".nav-btn").forEach((b) => { b.onclick = () => show(b.dataset.go); });
  $("#newChatBtn").onclick = () => newChat(sel.value, null);
  $("#backBtn").onclick = () => { stopSpeaking(); show(lastMain); };
  $("#themeBtn").onclick = toggleTheme;
  $("#themeToggle").onclick = toggleTheme;
  $("#themeToggle").onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleTheme(); } };
  $("#sendBtn").onclick = send;
  setupMic();
  $("#msgInput").oninput = autosize;
  $("#chatSearch").oninput = renderChats;

  $("#customInstr").value = store.get("toxic.instr", "");
  $("#saveInstr").onclick = () => {
    store.set("toxic.instr", $("#customInstr").value.trim().slice(0, 500));
    toast("Save ho gaya");
  };
  $("#clearAll").onclick = async () => {
    if (confirm("Saari chats hamesha ke liye delete ho jayengi. Pakka?")) {
      await dbClear();
      renderRecent();
      renderChats();
      toast("Saari chats delete ho gayi");
    }
  };

  try { await dbOpen(); } catch (e) { toast("Is browser mein chat history save nahi ho sakti"); }
  renderRecent();

  setTimeout(() => $("#splash").classList.add("hide"), 900);

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  }
}
document.addEventListener("DOMContentLoaded", init);
