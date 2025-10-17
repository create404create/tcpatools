// ==========================
// CONFIG
// WARNING: Frontend-exposed API key — do not use in production.
// Replace API_KEY with your key (already provided).
const API_KEY = "cbee2905-8e42-4548-875a-392a28c0404e";
const TCPA_BASE = "https://tcpa.api.uspeoplesearch.net/tcpa/v1";

// ==========================
// DOM
const numInput = document.getElementById("numberInput");
const checkBtn = document.getElementById("checkBtn");
const resultPre = document.getElementById("result");
const loader = document.getElementById("loader");
const copyBtn = document.getElementById("copyBtn");
const shareBtn = document.getElementById("shareBtn");
const clearBtn = document.getElementById("clearBtn");
const recentList = document.getElementById("recentList");
const darkToggle = document.getElementById("darkToggle");

// Local recent searches
const RECENT_KEY = "tcpa_recent";
function loadRecent(){
  const raw = localStorage.getItem(RECENT_KEY);
  if(!raw) return [];
  try { return JSON.parse(raw) } catch(e){ return [] }
}
function saveRecent(arr){
  localStorage.setItem(RECENT_KEY, JSON.stringify(arr.slice(0,10)));
}
function renderRecent(){
  const arr = loadRecent();
  recentList.innerHTML = "";
  if(arr.length === 0){ recentList.textContent = "— none —"; return; }
  arr.forEach(num=>{
    const d = document.createElement("div");
    d.className = "recent-item";
    d.textContent = num;
    d.onclick = ()=> { numInput.value = num; doLookup(num); }
    recentList.appendChild(d);
  });
}
renderRecent();

// Helpers
function showLoading(on=true){
  loader.hidden = !on;
  if(on) resultPre.textContent = "Loading...";
}
function pretty(o){
  try { return JSON.stringify(o, null, 2); } catch(e){ return String(o); }
}
function normalizeNumber(n){
  // keep + and digits
  return n.replace(/[^\d+]/g, "");
}

// Lookup function
async function doLookup(number){
  const n = normalizeNumber(number || numInput.value.trim());
  if(!n){ alert("Please enter a phone number."); return; }

  showLoading(true);
  // Build correct URL using phone param
  const url = `${TCPA_BASE}?x=${encodeURIComponent(API_KEY)}&phone=${encodeURIComponent(n)}`;

  try {
    const resp = await fetch(url, {cache: "no-store"});
    // handle non-JSON gracefully
    const text = await resp.text();
    let data;
    try { data = JSON.parse(text); } catch(e) { data = { raw: text }; }

    showLoading(false);

    // if provider returns an 'invalid' reason, show helpful tip
    if (data && data.reason === "invalid") {
      resultPre.textContent = pretty(data) + "\n\nTip: make sure you used a US number (E.164 or national format).";
    } else {
      resultPre.textContent = pretty(data);
    }

    // save recent (unique & latest first)
    const r = loadRecent();
    const idx = r.indexOf(n);
    if(idx !== -1) r.splice(idx,1);
    r.unshift(n);
    saveRecent(r);
    renderRecent();

  } catch(err){
    showLoading(false);
    resultPre.textContent = "Network or Server error: " + err.message;
  }
}

// Buttons
checkBtn.addEventListener("click", ()=> doLookup());
numInput.addEventListener("keydown", (e)=> { if(e.key === "Enter") doLookup(); });

copyBtn.addEventListener("click", async ()=>{
  const text = resultPre.textContent;
  if(!text) return;
  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = "Copied!";
    setTimeout(()=> copyBtn.textContent = "Copy", 1200);
  } catch(e){
    alert("Copy failed: " + e.message);
  }
});

shareBtn.addEventListener("click", async ()=>{
  const text = resultPre.textContent;
  if(!text) return;
  if(navigator.share){
    try {
      await navigator.share({title: "TCPA Lookup Result", text});
    } catch(e){
      // user cancelled or share failed
      console.log("Share cancelled/failed", e);
    }
  } else {
    // fallback: copy and notify
    try {
      await navigator.clipboard.writeText(text);
      alert("Result copied to clipboard (share not supported).");
    } catch(e){
      alert("Share not supported and copy failed.");
    }
  }
});

clearBtn.addEventListener("click", ()=>{
  resultPre.textContent = "No data yet";
});

// Dark mode toggle (simple)
const root = document.documentElement;
darkToggle.addEventListener("click", ()=>{
  if(document.documentElement.classList.contains("light")){
    document.documentElement.classList.remove("light");
    darkToggle.textContent = "🌙";
  } else {
    document.documentElement.classList.add("light");
    darkToggle.textContent = "🌤";
  }
});

// Initialize placeholder example
numInput.value = "";
resultPre.textContent = "No data yet";
