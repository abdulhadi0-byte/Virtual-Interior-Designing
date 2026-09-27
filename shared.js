// ---- Shared storage helpers (localStorage, no backend) ----

const DESIGNS_KEY = "vid_designs";
const PROFILE_KEY = "vid_profile";
const API_KEY_STORAGE = "vid_gemini_api_key";

function getDesigns() {
  try {
    return JSON.parse(localStorage.getItem(DESIGNS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveDesign(design) {
  const designs = getDesigns();
  designs.unshift({ id: Date.now().toString(), created_at: new Date().toISOString(), ...design });
  // Keep storage bounded — localStorage has a ~5-10MB limit per origin
  localStorage.setItem(DESIGNS_KEY, JSON.stringify(designs.slice(0, 30)));
}

function deleteDesign(id) {
  const designs = getDesigns().filter((d) => d.id !== id);
  localStorage.setItem(DESIGNS_KEY, JSON.stringify(designs));
}

function getProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || "null") || {
      fullName: "Guest",
      email: "",
      phone: "",
      avatar: null,
    };
  } catch {
    return { fullName: "Guest", email: "", phone: "", avatar: null };
  }
}

function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

function getApiKey() {
  return localStorage.getItem(API_KEY_STORAGE) || "";
}

function setApiKey(key) {
  localStorage.setItem(API_KEY_STORAGE, key.trim());
}

// ---- Sidebar ----

const ICONS = {
  dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>',
  upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 16V4M12 4l-4 4M12 4l4 4" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 16v3a2 2 0 002 2h12a2 2 0 002-2v-3" stroke-linecap="round"/></svg>',
  designs: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="14" rx="2"/><path d="M3 13l4-4 3 3 5-5 6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  saved: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3h12a1 1 0 011 1v17l-7-4-7 4V4a1 1 0 011-1z" stroke-linejoin="round"/></svg>',
  profile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" stroke-linecap="round"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1-1.6 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.9V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke-linecap="round"/><path d="M16 17l5-5-5-5M21 12H9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  logo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 10.5L12 3l9 7.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 9.5V20a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V9.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

const NAV_ITEMS = [
  { href: "dashboard.html", label: "Dashboard", icon: "dashboard" },
  { href: "upload.html", label: "Upload Room", icon: "upload" },
  { href: "saved.html", label: "Saved Designs", icon: "saved" },
  { href: "profile.html", label: "Profile", icon: "profile" },
  { href: "settings.html", label: "Settings", icon: "settings" },
];

function renderSidebar(activeHref) {
  const el = document.getElementById("sidebar");
  if (!el) return;

  const links = NAV_ITEMS.map(
    (item) => `
    <a href="${item.href}" class="sidebar-link ${item.href === activeHref ? "active" : ""}">
      ${ICONS[item.icon]} ${item.label}
    </a>`
  ).join("");

  el.innerHTML = `
    <a href="dashboard.html" class="sidebar-logo">
      <span class="mark">${ICONS.logo}</span>
      <span class="text">Virtual Interior<br/>Designing</span>
    </a>
    <nav class="sidebar-nav">${links}</nav>
    <button class="sidebar-logout" id="logoutBtn">${ICONS.logout} Reset Local Data</button>
  `;

  document.getElementById("logoutBtn").addEventListener("click", () => {
    if (confirm("This clears all locally saved designs and profile info from this browser. Continue?")) {
      localStorage.removeItem(DESIGNS_KEY);
      localStorage.removeItem(PROFILE_KEY);
      window.location.href = "index.html";
    }
  });
}

// ---- API key modal (shown once, key stored only in this browser) ----

function ensureApiKey(onReady) {
  const existing = getApiKey();
  if (existing) {
    onReady(existing);
    return;
  }

  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `
    <div class="modal-box">
      <h3>Add your Gemini API key</h3>
      <p>
        This site calls Google's Gemini API directly from your browser to analyze rooms.
        Get a free key at <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com/apikey</a>.
        Your key is stored only in this browser's local storage — it is never sent anywhere except Google's API, and never committed to this site's code.
      </p>
      <div class="field">
        <label>Gemini API Key</label>
        <input type="password" id="apiKeyInput" placeholder="AIza..." />
      </div>
      <button class="btn btn-primary" id="apiKeySave">Save & Continue</button>
    </div>
  `;
  document.body.appendChild(backdrop);

  document.getElementById("apiKeySave").addEventListener("click", () => {
    const val = document.getElementById("apiKeyInput").value.trim();
    if (!val) return;
    setApiKey(val);
    document.body.removeChild(backdrop);
    onReady(val);
  });
}
