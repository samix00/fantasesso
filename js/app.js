/**
 * Fantasesso - Core Application Logic
 */

// Key di salvataggio in LocalStorage
const STORAGE_KEY = 'fantasesso_data_v1';

// Configurazione Firebase fornita dall'utente
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCePbP8jr1Mz2fajRTW0jJ33PF2i050kbI",
  authDomain: "fantase-add4c.firebaseapp.com",
  projectId: "fantase-add4c",
  storageBucket: "fantase-add4c.firebasestorage.app",
  messagingSenderId: "441250760398",
  appId: "1:441250760398:web:68c5ced212b208e96b329f"
};

let db = null;
let isApplyingCloudSnapshot = false;

// Stato globale dell'applicazione
let state = {
  leagueName: "Lega Fantasesso 2026 🔥",
  players: [],
  events: [],
  customRules: []
};

// Avatar predefiniti simpatici tra cui scegliere
const DEFAULT_AVATARS = ["🦁", "🦊", "🦄", "👑", "🚀", "💣", "🍒", "🎭", "🍕", "🍸", "🕶️", "🌶️", "😈", "😇", "🧛", "🥷"];

// Dati iniziali di esempio (se prima visita)
const INITIAL_SAMPLE_DATA = {
  leagueName: "Lega Fantasesso 2026 🔥",
  players: [
    { id: "p1", name: "Marco", nickname: "Il Don Giovanni", avatar: "🦁", createdAt: Date.now() - 86400000 * 4 },
    { id: "p2", name: "Giulia", nickname: "Cuori Infranti", avatar: "👑", createdAt: Date.now() - 86400000 * 4 },
    { id: "p3", name: "Andrea", nickname: "Mister Camporella", avatar: "🕶️", createdAt: Date.now() - 86400000 * 3 },
    { id: "p4", name: "Sofia", nickname: "Calamita da Club", avatar: "🍸", createdAt: Date.now() - 86400000 * 3 },
    { id: "p5", name: "Luca", nickname: "Re del Cringe", avatar: "🤡", createdAt: Date.now() - 86400000 * 2 }
  ],
  events: [
    {
      id: "ev1",
      playerId: "p2",
      ruleId: "spicy_first_date",
      ruleName: "Goal al primo appuntamento",
      points: 50,
      type: "bonus",
      note: "Uscita a cena con il tipo di Tinder andata alla perfezione!",
      timestamp: Date.now() - 86400000 * 2
    },
    {
      id: "ev2",
      playerId: "p3",
      ruleId: "loc_outdoor",
      ruleName: "Natura selvaggia",
      points: 60,
      type: "bonus",
      note: "Bagno di mezzanotte in spiaggia con finale pirotecnico.",
      timestamp: Date.now() - 86400000 * 1.5
    },
    {
      id: "ev3",
      playerId: "p1",
      ruleId: "flirt_club_kiss",
      ruleName: "Limone in pista",
      points: 20,
      type: "bonus",
      note: "Preso per mano durante il ritornello di Gigi D'Ag.",
      timestamp: Date.now() - 86400000 * 1
    },
    {
      id: "ev4",
      playerId: "p5",
      ruleId: "malus_wrong_name",
      ruleName: "Gaffe letale: Nome dell'ex",
      points: -50,
      type: "malus",
      note: "L'ha chiamata Martina invece di Beatrice. Gelo siderale.",
      timestamp: Date.now() - 86400000 * 0.8
    },
    {
      id: "ev5",
      playerId: "p4",
      ruleId: "flirt_foreign",
      ruleName: "Fascino internazionale",
      points: 35,
      type: "bonus",
      note: "Conosciuto surfista australiano all'ostello.",
      timestamp: Date.now() - 86400000 * 0.4
    }
  ],
  customRules: []
};

// ==========================================
// INIZIALIZZAZIONE E PERSISTENZA
// ==========================================
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = {
        leagueName: parsed.leagueName || "Lega Fantasesso 2026 🔥",
        players: parsed.players || [],
        events: parsed.events || [],
        rules: Array.isArray(parsed.rules) && parsed.rules.length > 0 
          ? parsed.rules 
          : (Array.isArray(parsed.customRules) && parsed.customRules.length > 0 
              ? [...JSON.parse(JSON.stringify(DEFAULT_RULES)), ...parsed.customRules] 
              : JSON.parse(JSON.stringify(DEFAULT_RULES)))
      };
    } else {
      // Primo avvio: carica dati di prova
      state = JSON.parse(JSON.stringify(INITIAL_SAMPLE_DATA));
      state.rules = JSON.parse(JSON.stringify(DEFAULT_RULES));
      saveState();
    }
  } catch (err) {
    console.error("Errore nel caricamento dei dati:", err);
    state = JSON.parse(JSON.stringify(INITIAL_SAMPLE_DATA));
    state.rules = JSON.parse(JSON.stringify(DEFAULT_RULES));
  }
}

function saveState(skipCloud = false) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Errore nel salvataggio dei dati in locale:", err);
  }

  // Sincronizzazione automatica su Firebase Firestore in tempo reale
  if (!skipCloud && !isApplyingCloudSnapshot && db) {
    db.collection("leagues").doc("main").set(state).catch(err => {
      console.warn("Avviso sincronizzazione Firestore:", err);
    });
  }
}

// Inizializzazione Firebase e listener real-time
function initFirebase() {
  const badgeDot = document.getElementById('cloud-status-dot');
  const badgeText = document.getElementById('cloud-status-text');

  function updateBadge(status, text) {
    if (!badgeDot || !badgeText) return;
    if (status === 'connected') {
      badgeDot.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse';
      badgeText.className = 'text-emerald-400';
      badgeText.textContent = text || 'Live Cloud';
    } else if (status === 'warning') {
      badgeDot.className = 'w-2 h-2 rounded-full bg-amber-400';
      badgeText.className = 'text-amber-300';
      badgeText.textContent = text || 'In attesa Firestore';
    } else {
      badgeDot.className = 'w-2 h-2 rounded-full bg-slate-400';
      badgeText.className = 'text-slate-400';
      badgeText.textContent = text || 'Offline';
    }
  }

  if (typeof firebase === 'undefined') {
    updateBadge('offline', 'Solo Locale');
    return;
  }

  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }
    db = firebase.firestore();

    const leagueDoc = db.collection("leagues").doc("main");

    // Listener in tempo reale: quando chiunque modifica qualcosa, tutti ricevono l'aggiornamento
    leagueDoc.onSnapshot((docSnapshot) => {
      if (docSnapshot.exists) {
        const cloudData = docSnapshot.data();
        if (cloudData) {
          isApplyingCloudSnapshot = true;
          state.leagueName = cloudData.leagueName || state.leagueName;
          state.players = Array.isArray(cloudData.players) ? cloudData.players : state.players;
          state.events = Array.isArray(cloudData.events) ? cloudData.events : state.events;
          state.rules = Array.isArray(cloudData.rules) ? cloudData.rules : state.rules;

          saveState(true); // salva solo in locale per cache, senza loop di rimbalzo su cloud
          isApplyingCloudSnapshot = false;

          // Aggiorna l'interfaccia
          renderLeaderboard();
          renderRules();
          setupAssignForm();
          renderFeed();

          updateBadge('connected', 'Cloud Live 🟢');
        }
      } else {
        // Prima volta in assoluto sul cloud: carica i dati locali come stato iniziale del gruppo
        leagueDoc.set(state).then(() => {
          updateBadge('connected', 'Cloud Live 🟢');
        }).catch(err => {
          console.warn("Firestore set error:", err);
          updateBadge('warning', 'Crea Database Firestore');
        });
      }
    }, (error) => {
      console.warn("Firestore snapshot error:", error);
      updateBadge('warning', 'Regole Firestore da abilitare');
    });

  } catch (err) {
    console.error("Errore inizializzazione Firebase:", err);
    updateBadge('offline', 'Errore Firebase');
  }
}

// Restituisce l'elenco delle regole attive (comprese modifiche o aggiunte)
function getAllRules() {
  if (!state.rules || !Array.isArray(state.rules) || state.rules.length === 0) {
    state.rules = JSON.parse(JSON.stringify(DEFAULT_RULES));
  }
  return state.rules;
}

// ==========================================
// CALCOLI CLASSIFICA
// ==========================================
function getLeaderboard() {
  const allRules = getAllRules();
  const ruleMap = new Map(allRules.map(r => [r.id, r]));

  return state.players.map(player => {
    const playerEvents = state.events.filter(e => e.playerId === player.id);
    let totalScore = 0;
    let bonusCount = 0;
    let malusCount = 0;

    playerEvents.forEach(ev => {
      totalScore += ev.points;
      if (ev.points > 0) bonusCount++;
      else if (ev.points < 0) malusCount++;
    });

    return {
      ...player,
      totalScore,
      bonusCount,
      malusCount,
      eventCount: playerEvents.length,
      events: playerEvents.sort((a, b) => b.timestamp - a.timestamp)
    };
  }).sort((a, b) => b.totalScore - a.totalScore);
}

// ==========================================
// RENDER INTERFACCIA
// ==========================================

// Navigazione a schede (Tabs)
function initTabs() {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.target;
      switchTab(target);
    });
  });
}

function switchTab(targetId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.nav-tab').forEach(el => el.classList.remove('active'));

  const activeContent = document.getElementById(targetId);
  if (activeContent) {
    activeContent.classList.remove('hidden');
  }

  const activeTab = document.querySelector(`.nav-tab[data-target="${targetId}"]`);
  if (activeTab) {
    activeTab.classList.add('active');
  }

  // Ricarica la vista specifica per aggiornare i dati
  if (targetId === 'tab-leaderboard') renderLeaderboard();
  if (targetId === 'tab-rules') renderRules();
  if (targetId === 'tab-assign') setupAssignForm();
  if (targetId === 'tab-feed') renderFeed();
}

// --- RENDER CLASSIFICA & PODIO ---
function renderLeaderboard() {
  const container = document.getElementById('leaderboard-list');
  const podiumContainer = document.getElementById('podium-section');
  const emptyState = document.getElementById('empty-players-msg');
  const rankedPlayers = getLeaderboard();

  // Aggiorna titolo lega
  const leagueTitleEl = document.getElementById('league-display-title');
  if (leagueTitleEl) {
    leagueTitleEl.textContent = state.leagueName;
  }

  if (rankedPlayers.length === 0) {
    podiumContainer.innerHTML = '';
    container.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');

  // Render Podio (primi 3 posti se disponibili)
  if (rankedPlayers.length >= 2) {
    podiumContainer.classList.remove('hidden');
    const first = rankedPlayers[0];
    const second = rankedPlayers[1];
    const third = rankedPlayers.length > 2 ? rankedPlayers[2] : null;

    podiumContainer.innerHTML = `
      <div class="grid grid-cols-3 gap-3 md:gap-6 items-end max-w-2xl mx-auto mb-8 pt-4">
        <!-- 2° Posto -->
        <div class="glass-panel podium-2 rounded-2xl p-4 text-center transition-card cursor-pointer" onclick="openPlayerModal('${second.id}')">
          <div class="text-3xl mb-1">${second.avatar || '🥈'}</div>
          <div class="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-400 text-slate-900 mb-2">2° Posto</div>
          <h4 class="font-bold text-slate-200 truncate text-sm md:text-base">${escapeHtml(second.name)}</h4>
          <p class="text-xs text-slate-400 truncate">${escapeHtml(second.nickname || '')}</p>
          <div class="mt-2 text-xl md:text-2xl font-black text-slate-200">${second.totalScore > 0 ? '+' : ''}${second.totalScore} pt</div>
        </div>

        <!-- 1° Posto -->
        <div class="glass-panel podium-1 rounded-2xl p-5 text-center transition-card cursor-pointer -mt-4 shadow-xl ring-2 ring-yellow-400/50" onclick="openPlayerModal('${first.id}')">
          <div class="text-4xl mb-1">${first.avatar || '👑'}</div>
          <div class="inline-block px-3 py-1 rounded-full text-xs font-black bg-yellow-400 text-yellow-950 mb-2">🏆 1° Posto</div>
          <h3 class="font-extrabold text-yellow-300 truncate text-base md:text-lg">${escapeHtml(first.name)}</h3>
          <p class="text-xs text-yellow-200/80 truncate">${escapeHtml(first.nickname || '')}</p>
          <div class="mt-2 text-2xl md:text-3xl font-black text-yellow-400 glow-text">${first.totalScore > 0 ? '+' : ''}${first.totalScore} pt</div>
        </div>

        <!-- 3° Posto -->
        ${third ? `
        <div class="glass-panel podium-3 rounded-2xl p-4 text-center transition-card cursor-pointer" onclick="openPlayerModal('${third.id}')">
          <div class="text-3xl mb-1">${third.avatar || '🥉'}</div>
          <div class="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-600 text-amber-950 mb-2">3° Posto</div>
          <h4 class="font-bold text-amber-300 truncate text-sm md:text-base">${escapeHtml(third.name)}</h4>
          <p class="text-xs text-amber-300/70 truncate">${escapeHtml(third.nickname || '')}</p>
          <div class="mt-2 text-xl md:text-2xl font-black text-amber-400">${third.totalScore > 0 ? '+' : ''}${third.totalScore} pt</div>
        </div>
        ` : `<div></div>`}
      </div>
    `;
  } else {
    podiumContainer.innerHTML = '';
    podiumContainer.classList.add('hidden');
  }

  // Render lista completa giocatori
  container.innerHTML = rankedPlayers.map((player, index) => {
    const scoreColor = player.totalScore > 0 ? 'text-emerald-400' : player.totalScore < 0 ? 'text-rose-400' : 'text-slate-300';
    const rankBadge = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;

    return `
      <div class="glass-panel glass-panel-hover rounded-xl p-4 flex items-center justify-between transition-card cursor-pointer" onclick="openPlayerModal('${player.id}')">
        <div class="flex items-center space-x-3.5 min-w-0">
          <span class="font-black text-base md:text-lg w-7 text-slate-400 text-center">${rankBadge}</span>
          <span class="text-2xl md:text-3xl p-2 rounded-xl bg-slate-800/80 border border-slate-700/60">${player.avatar}</span>
          <div class="min-w-0">
            <h4 class="font-bold text-white text-base md:text-lg truncate flex items-center gap-2">
              ${escapeHtml(player.name)}
              ${player.nickname ? `<span class="text-xs font-normal text-rose-300/80 bg-rose-500/10 px-2 py-0.5 rounded-full hidden sm:inline-block">${escapeHtml(player.nickname)}</span>` : ''}
            </h4>
            <div class="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span class="text-emerald-400">🔥 ${player.bonusCount} bonus</span>
              <span>•</span>
              <span class="text-rose-400">🤡 ${player.malusCount} malus</span>
              <span>•</span>
              <span>${player.eventCount} eventi</span>
            </div>
          </div>
        </div>

        <div class="text-right pl-3 flex-shrink-0">
          <span class="text-xl md:text-2xl font-black ${scoreColor}">${player.totalScore > 0 ? '+' : ''}${player.totalScore}</span>
          <span class="text-xs text-slate-400 block font-semibold uppercase">Punti</span>
        </div>
      </div>
    `;
  }).join('');
}

// --- RENDER REGOLAMENTO ---
let activeCategoryFilter = 'all';
let currentSearchTerm = '';
let currentTypeFilter = 'all'; // all, bonus, malus

function renderRules() {
  const container = document.getElementById('rules-list-container');
  const countBadge = document.getElementById('rules-count-badge');
  const allRules = getAllRules();

  // Filtro
  const filtered = allRules.filter(rule => {
    // Categoria
    if (activeCategoryFilter !== 'all') {
      if (activeCategoryFilter === 'custom' && !rule.id.startsWith('custom_')) return false;
      if (activeCategoryFilter !== 'custom' && rule.category !== activeCategoryFilter) return false;
    }
    // Tipo (bonus/malus)
    if (currentTypeFilter === 'bonus' && rule.points <= 0) return false;
    if (currentTypeFilter === 'malus' && rule.points >= 0) return false;

    // Ricerca testuale
    if (currentSearchTerm) {
      const term = currentSearchTerm.toLowerCase();
      const matchName = rule.name.toLowerCase().includes(term);
      const matchDesc = rule.description.toLowerCase().includes(term);
      return matchName || matchDesc;
    }
    return true;
  });

  countBadge.textContent = `${filtered.length} di ${allRules.length} regole`;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center text-slate-400 glass-panel rounded-2xl">
        <p class="text-4xl mb-2">🔍</p>
        <p class="text-base font-medium">Nessuna regola trovata con questi filtri.</p>
        <button class="mt-3 text-xs text-rose-400 hover:underline" onclick="resetRuleFilters()">Reimposta tutti i filtri</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(rule => {
    const isBonus = rule.points > 0;
    const badgeColor = isBonus 
      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
      : 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    const categoryInfo = CATEGORIES[rule.category] || { label: rule.category, icon: '📌' };

    return `
      <div class="glass-panel glass-panel-hover rounded-xl p-4 flex flex-col justify-between transition-card">
        <div>
          <div class="flex items-start justify-between gap-2 mb-2">
            <span class="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              <span>${categoryInfo.icon}</span>
              <span>${categoryInfo.label}</span>
            </span>
            <span class="px-2.5 py-1 rounded-full text-xs font-black border ${badgeColor}">
              ${isBonus ? '+' : ''}${rule.points} pt
            </span>
          </div>

          <h4 class="font-bold text-white text-base mb-1.5">${escapeHtml(rule.name)}</h4>
          <p class="text-xs text-slate-300 leading-relaxed">${escapeHtml(rule.description)}</p>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between gap-2">
          <button 
            onclick="openEditRuleModal('${rule.id}')" 
            class="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-1">
            <span>✏️ Modifica</span>
          </button>
          <button 
            onclick="prefillAssign('${rule.id}')" 
            class="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 transition-colors flex items-center gap-1">
            <span>⚡ Assegna</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function initRuleCategoryFilters() {
  const container = document.getElementById('category-filter-buttons');
  if (!container) return;

  container.innerHTML = Object.entries(CATEGORIES).map(([key, cat]) => `
    <button 
      class="cat-btn px-3.5 py-1.5 rounded-full text-xs font-bold border border-slate-700 bg-slate-850 text-slate-300 hover:border-rose-400/50 transition-all ${key === activeCategoryFilter ? 'active' : ''}"
      onclick="setCategoryFilter('${key}')">
      ${cat.icon} ${cat.label}
    </button>
  `).join('');
}

function setCategoryFilter(categoryKey) {
  activeCategoryFilter = categoryKey;
  initRuleCategoryFilters();
  renderRules();
}

function resetRuleFilters() {
  activeCategoryFilter = 'all';
  currentSearchTerm = '';
  currentTypeFilter = 'all';
  const searchInput = document.getElementById('rules-search-input');
  if (searchInput) searchInput.value = '';
  const typeFilter = document.getElementById('rules-type-filter');
  if (typeFilter) typeFilter.value = 'all';
  initRuleCategoryFilters();
  renderRules();
}

// --- SETUP FORM ASSEGNA PUNTI ---
function setupAssignForm() {
  const playerSelect = document.getElementById('assign-player-select');
  const ruleSelect = document.getElementById('assign-rule-select');
  const allRules = getAllRules();

  // Popola selezione giocatori
  if (playerSelect) {
    playerSelect.innerHTML = `
      <option value="">-- Seleziona il Giocatore --</option>
      ${state.players.map(p => `
        <option value="${p.id}">${p.avatar} ${escapeHtml(p.name)} (${escapeHtml(p.nickname || 'Nessun titolo')})</option>
      `).join('')}
    `;
  }

  // Popola selezione regole
  if (ruleSelect) {
    const bonuses = allRules.filter(r => r.points > 0);
    const maluses = allRules.filter(r => r.points < 0);

    ruleSelect.innerHTML = `
      <option value="">-- Seleziona la Regola / Evento --</option>
      <optgroup label="✨ BONUS">
        ${bonuses.map(r => `<option value="${r.id}">[+${r.points} pt] ${escapeHtml(r.name)}</option>`).join('')}
      </optgroup>
      <optgroup label="🤡 MALUS">
        ${maluses.map(r => `<option value="${r.id}">[${r.points} pt] ${escapeHtml(r.name)}</option>`).join('')}
      </optgroup>
      <optgroup label="⚙️ ALTRO">
        <option value="custom_manual">➕ Punto Personalizzato Estemporaneo...</option>
      </optgroup>
    `;
  }
}

function prefillAssign(ruleId) {
  switchTab('tab-assign');
  setTimeout(() => {
    const ruleSelect = document.getElementById('assign-rule-select');
    if (ruleSelect) {
      ruleSelect.value = ruleId;
      ruleSelect.dispatchEvent(new Event('change'));
    }
  }, 50);
}

// --- RENDER FEED & CRONOLOGIA ---
function renderFeed() {
  const container = document.getElementById('feed-list');
  const emptyState = document.getElementById('empty-feed-msg');
  const allRules = getAllRules();
  const ruleMap = new Map(allRules.map(r => [r.id, r]));
  const playerMap = new Map(state.players.map(p => [p.id, p]));

  const sortedEvents = [...state.events].sort((a, b) => b.timestamp - a.timestamp);

  if (sortedEvents.length === 0) {
    container.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');

  container.innerHTML = sortedEvents.map(ev => {
    const player = playerMap.get(ev.playerId) || { name: 'Giocatore rimosso', avatar: '👤' };
    const isBonus = ev.points > 0;
    const badgeColor = isBonus ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    const dateFormatted = new Date(ev.timestamp).toLocaleString('it-IT', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <div class="glass-panel glass-panel-hover rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-card">
        <div class="flex items-start gap-3.5 min-w-0">
          <span class="text-3xl p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 flex-shrink-0">${player.avatar}</span>
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-bold text-white text-base">${escapeHtml(player.name)}</span>
              <span class="px-2 py-0.5 rounded-full text-xs font-black border ${badgeColor}">
                ${isBonus ? '+' : ''}${ev.points} pt
              </span>
            </div>
            <h5 class="text-sm font-semibold text-rose-300 mt-0.5">${escapeHtml(ev.ruleName)}</h5>
            ${ev.note ? `<p class="text-xs text-slate-300 mt-1 italic">“${escapeHtml(ev.note)}”</p>` : ''}
            <span class="text-[11px] text-slate-400 block mt-1">${dateFormatted}</span>
          </div>
        </div>

        <button 
          onclick="deleteEvent('${ev.id}')" 
          title="Elimina questo evento"
          class="self-end sm:self-center text-xs text-slate-400 hover:text-rose-400 p-2 rounded-lg hover:bg-rose-500/10 transition-colors">
          🗑️ Elimina
        </button>
      </div>
    `;
  }).join('');
}

// ==========================================
// AZIONI UTENTE (EVENTI, GIOCATORI, REGOLE)
// ==========================================

// Assegna punto da form
function handleAssignSubmit(e) {
  e.preventDefault();
  const playerSelect = document.getElementById('assign-player-select');
  const ruleSelect = document.getElementById('assign-rule-select');
  const noteInput = document.getElementById('assign-note-input');
  const customManualFields = document.getElementById('custom-manual-fields');
  const manualTitle = document.getElementById('manual-point-title');
  const manualScore = document.getElementById('manual-point-score');

  const playerId = playerSelect.value;
  const ruleId = ruleSelect.value;
  const note = noteInput.value.trim();

  if (!playerId) {
    showToast("Seleziona prima un giocatore!", "warning");
    return;
  }
  if (!ruleId) {
    showToast("Seleziona un bonus o malus!", "warning");
    return;
  }

  let points = 0;
  let ruleName = "";
  let ruleType = "bonus";

  if (ruleId === 'custom_manual') {
    ruleName = manualTitle.value.trim() || "Punto personalizzato";
    points = parseInt(manualScore.value, 10);
    if (isNaN(points) || points === 0) {
      showToast("Specifica un punteggio valido (diverso da zero)!", "warning");
      return;
    }
    ruleType = points > 0 ? "bonus" : "malus";
  } else {
    const allRules = getAllRules();
    const ruleObj = allRules.find(r => r.id === ruleId);
    if (!ruleObj) {
      showToast("Regola non valida!", "error");
      return;
    }
    points = ruleObj.points;
    ruleName = ruleObj.name;
    ruleType = ruleObj.points > 0 ? "bonus" : "malus";
  }

  const newEvent = {
    id: 'ev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    playerId,
    ruleId: ruleId === 'custom_manual' ? 'manual_' + Date.now() : ruleId,
    ruleName,
    points,
    type: ruleType,
    note,
    timestamp: Date.now()
  };

  state.events.push(newEvent);
  saveState();

  // Effetto confetti se bonus
  if (points > 0 && typeof confetti === 'function') {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });
  }

  showToast(`Assegnati ${points > 0 ? '+' : ''}${points} pt a ${getPlayerName(playerId)}! 🔥`, "success");

  // Reset parziale form
  ruleSelect.value = "";
  noteInput.value = "";
  if (customManualFields) customManualFields.classList.add('hidden');

  // Aggiorna viste
  renderLeaderboard();
  renderFeed();
}

function deleteEvent(eventId) {
  if (!confirm("Sei sicuro di voler eliminare questo evento dallo storico?")) return;
  state.events = state.events.filter(e => e.id !== eventId);
  saveState();
  renderLeaderboard();
  renderFeed();
  showToast("Evento rimosso con successo", "info");
}

function getPlayerName(playerId) {
  const p = state.players.find(x => x.id === playerId);
  return p ? p.name : "Giocatore";
}

// Aggiungi Giocatore
function handleAddPlayerSubmit(e) {
  e.preventDefault();
  const nameInput = document.getElementById('new-player-name');
  const nicknameInput = document.getElementById('new-player-nickname');
  const avatarInput = document.getElementById('new-player-avatar');

  const name = nameInput.value.trim();
  const nickname = nicknameInput.value.trim();
  const avatar = avatarInput.value.trim() || DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];

  if (!name) {
    showToast("Inserisci il nome del partecipante!", "warning");
    return;
  }

  const newPlayer = {
    id: 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    name,
    nickname,
    avatar,
    createdAt: Date.now()
  };

  state.players.push(newPlayer);
  saveState();

  // Reset e chiusura modal
  nameInput.value = '';
  nicknameInput.value = '';
  closeModal('modal-add-player');
  renderLeaderboard();
  setupAssignForm();
  showToast(`${name} aggiunto alla lega! 🚀`, "success");
}

// Aggiungi Regola Personalizzata
function handleAddCustomRuleSubmit(e) {
  e.preventDefault();
  const nameInput = document.getElementById('custom-rule-name');
  const pointsInput = document.getElementById('custom-rule-points');
  const categorySelect = document.getElementById('custom-rule-category');
  const descInput = document.getElementById('custom-rule-desc');

  const name = nameInput.value.trim();
  const points = parseInt(pointsInput.value, 10);
  const category = categorySelect.value;
  const description = descInput.value.trim();

  if (!name || isNaN(points) || points === 0) {
    showToast("Nome e punteggio valido sono obbligatori!", "warning");
    return;
  }

  const newRule = {
    id: 'custom_' + Date.now(),
    name,
    points,
    category: category || 'custom',
    description: description || 'Regola creata dalla lega.',
    type: points > 0 ? 'bonus' : 'malus'
  };

  getAllRules();
  state.rules.push(newRule);
  saveState();

  // Reset
  nameInput.value = '';
  pointsInput.value = '';
  descInput.value = '';
  closeModal('modal-add-rule');
  renderRules();
  setupAssignForm();
  showToast(`Nuova regola "${name}" salvata! ✨`, "success");
}

// Modifica Regola Esistente
function openEditRuleModal(ruleId) {
  const rules = getAllRules();
  const rule = rules.find(r => r.id === ruleId);
  if (!rule) return;

  document.getElementById('edit-rule-id').value = rule.id;
  document.getElementById('edit-rule-name').value = rule.name;
  document.getElementById('edit-rule-points').value = rule.points;
  document.getElementById('edit-rule-category').value = rule.category;
  document.getElementById('edit-rule-desc').value = rule.description || '';

  openModal('modal-edit-rule');
}

function handleEditRuleSubmit(e) {
  e.preventDefault();
  const ruleId = document.getElementById('edit-rule-id').value;
  const name = document.getElementById('edit-rule-name').value.trim();
  const points = parseInt(document.getElementById('edit-rule-points').value, 10);
  const category = document.getElementById('edit-rule-category').value;
  const description = document.getElementById('edit-rule-desc').value.trim();

  if (!name || isNaN(points) || points === 0) {
    showToast("Nome e punteggio valido sono obbligatori!", "warning");
    return;
  }

  const rules = getAllRules();
  const idx = rules.findIndex(r => r.id === ruleId);
  if (idx !== -1) {
    rules[idx] = {
      ...rules[idx],
      name,
      points,
      category,
      description,
      type: points > 0 ? 'bonus' : 'malus'
    };
    saveState();
    closeModal('modal-edit-rule');
    renderRules();
    setupAssignForm();
    showToast(`Regola "${name}" aggiornata! ✨`, "success");
  }
}

function deleteCurrentRule() {
  const ruleId = document.getElementById('edit-rule-id').value;
  const rules = getAllRules();
  const rule = rules.find(r => r.id === ruleId);
  if (!rule) return;

  if (!confirm(`Sei sicuro di voler eliminare la regola "${rule.name}"?`)) return;

  state.rules = rules.filter(r => r.id !== ruleId);
  saveState();
  closeModal('modal-edit-rule');
  renderRules();
  setupAssignForm();
  showToast(`Regola "${rule.name}" eliminata!`, "info");
}

function resetDefaultRules() {
  if (!confirm("Vuoi ripristinare tutte le regole originali del Fantasesso? Le modifiche personalizzate alle regole verranno reimpostate.")) return;
  state.rules = JSON.parse(JSON.stringify(DEFAULT_RULES));
  saveState();
  renderRules();
  setupAssignForm();
  showToast("Regole predefinite ripristinate con successo! 📜", "success");
}

// Dettaglio Giocatore Modal
function openPlayerModal(playerId) {
  const player = state.players.find(p => p.id === playerId);
  if (!player) return;

  const playerEvents = state.events
    .filter(e => e.playerId === playerId)
    .sort((a, b) => b.timestamp - a.timestamp);

  const total = playerEvents.reduce((acc, curr) => acc + curr.points, 0);

  const modal = document.getElementById('modal-player-detail');
  const content = document.getElementById('modal-player-content');

  content.innerHTML = `
    <div class="text-center pb-4 border-b border-slate-700/60">
      <div class="text-5xl mb-2">${player.avatar}</div>
      <h3 class="text-2xl font-black text-white">${escapeHtml(player.name)}</h3>
      ${player.nickname ? `<p class="text-sm font-semibold text-rose-300">"${escapeHtml(player.nickname)}"</p>` : ''}
      <div class="mt-3 inline-block px-4 py-1.5 rounded-full bg-slate-800 text-lg font-black ${total >= 0 ? 'text-emerald-400' : 'text-rose-400'} border border-slate-700">
        Punteggio Totale: ${total > 0 ? '+' : ''}${total} pt
      </div>
    </div>

    <div class="mt-4">
      <h4 class="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Storico Punti (${playerEvents.length})</h4>
      <div class="space-y-2 max-h-60 overflow-y-auto pr-1">
        ${playerEvents.length === 0 ? `
          <p class="text-xs text-slate-400 py-4 text-center">Nessun punto registrato finora.</p>
        ` : playerEvents.map(ev => `
          <div class="glass-panel p-2.5 rounded-lg flex items-center justify-between text-xs">
            <div>
              <div class="font-bold text-slate-200">${escapeHtml(ev.ruleName)}</div>
              ${ev.note ? `<div class="italic text-slate-400 text-[11px]">“${escapeHtml(ev.note)}”</div>` : ''}
              <div class="text-[10px] text-slate-500">${new Date(ev.timestamp).toLocaleDateString('it-IT')}</div>
            </div>
            <span class="font-black text-sm ${ev.points > 0 ? 'text-emerald-400' : 'text-rose-400'}">
              ${ev.points > 0 ? '+' : ''}${ev.points}
            </span>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between">
      <button onclick="deletePlayer('${player.id}')" class="text-xs text-rose-400 hover:text-rose-300 hover:underline">
        🗑️ Elimina Giocatore
      </button>
      <button onclick="closeModal('modal-player-detail')" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors">
        Chiudi
      </button>
    </div>
  `;

  modal.classList.remove('hidden');
}

function deletePlayer(playerId) {
  if (!confirm("Sei sicuro di voler rimuovere questo partecipante e tutti i suoi punti?")) return;
  state.players = state.players.filter(p => p.id !== playerId);
  state.events = state.events.filter(e => e.playerId !== playerId);
  saveState();
  closeModal('modal-player-detail');
  renderLeaderboard();
  setupAssignForm();
  renderFeed();
  showToast("Partecipante eliminato", "info");
}

// ==========================================
// IMPORT / EXPORT & BACKUP
// ==========================================
function exportDataAsJSON() {
  const jsonStr = JSON.stringify(state, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fantasesso-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("File di backup scaricato! 📥", "success");
}

function copyDataToClipboard() {
  const jsonStr = JSON.stringify(state, null, 2);
  navigator.clipboard.writeText(jsonStr).then(() => {
    showToast("Dati copiati negli appunti! 📋 Incollali nella chat con i tuoi amici.", "success");
  }).catch(err => {
    showToast("Impossibile copiare negli appunti automaticamente", "error");
  });
}

function importDataFromJSON(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.players)) {
      throw new Error("Formato JSON non compatibile");
    }
    state = {
      leagueName: parsed.leagueName || "Lega Fantasesso 🔥",
      players: parsed.players || [],
      events: parsed.events || [],
      customRules: parsed.customRules || []
    };
    saveState();
    renderLeaderboard();
    renderRules();
    setupAssignForm();
    renderFeed();
    showToast("Dati importati con successo! 🎉", "success");
  } catch (err) {
    showToast("Errore: JSON non valido o corrotto", "error");
  }
}

function resetToDefaultSample() {
  if (!confirm("Vuoi reimpostare i dati iniziali di esempio? I dati correnti verranno sovrascritti.")) return;
  state = JSON.parse(JSON.stringify(INITIAL_SAMPLE_DATA));
  saveState();
  renderLeaderboard();
  renderRules();
  setupAssignForm();
  renderFeed();
  showToast("Dati di esempio ripristinati", "info");
}

function clearAllData() {
  if (!confirm("ATTENZIONE: Stai per cancellare tutti i giocatori, punti ed eventi registrati. Procedere?")) return;
  state = {
    leagueName: "La Mia Lega Fantasesso 🔥",
    players: [],
    events: [],
    customRules: []
  };
  saveState();
  renderLeaderboard();
  renderRules();
  setupAssignForm();
  renderFeed();
  showToast("Tutti i dati sono stati azzerati", "info");
}

// ==========================================
// UTILITY & UI HELPERS
// ==========================================
function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('hidden');
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('hidden');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bg = type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-rose-600' : type === 'warning' ? 'bg-amber-600' : 'bg-slate-800';
  
  toast.className = `${bg} text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs md:text-sm font-semibold transition-all transform duration-300 translate-y-3 opacity-0 border border-white/20`;
  toast.innerHTML = `<span>${message}</span>`;

  container.appendChild(toast);

  // Animazione entrata
  setTimeout(() => {
    toast.classList.remove('translate-y-3', 'opacity-0');
  }, 10);

  // Rimozione automatica dopo 3s
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ==========================================
// EVENT LISTENERS DOMContentLoaded
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  initTabs();
  initRuleCategoryFilters();

  // Render iniziale
  renderLeaderboard();
  renderRules();
  setupAssignForm();
  renderFeed();

  // Inizializza sincronizzazione cloud in tempo reale
  initFirebase();

  // Avatar picker helpers
  const avatarGrid = document.getElementById('avatar-picker-grid');
  if (avatarGrid) {
    avatarGrid.innerHTML = DEFAULT_AVATARS.map(av => `
      <button type="button" class="text-xl p-1.5 rounded-lg hover:bg-slate-700 focus:ring-2 focus:ring-rose-400 transition" onclick="document.getElementById('new-player-avatar').value='${av}'">
        ${av}
      </button>
    `).join('');
  }

  // Listener form assegna
  const formAssign = document.getElementById('form-assign-points');
  if (formAssign) formAssign.addEventListener('submit', handleAssignSubmit);

  // Listener toggle campi manuali in form assegna
  const ruleSelect = document.getElementById('assign-rule-select');
  const customManualFields = document.getElementById('custom-manual-fields');
  if (ruleSelect && customManualFields) {
    ruleSelect.addEventListener('change', () => {
      if (ruleSelect.value === 'custom_manual') {
        customManualFields.classList.remove('hidden');
      } else {
        customManualFields.classList.add('hidden');
      }
    });
  }

  // Listener form nuovo giocatore
  const formAddPlayer = document.getElementById('form-add-player');
  if (formAddPlayer) formAddPlayer.addEventListener('submit', handleAddPlayerSubmit);

  // Listener form nuova regola
  const formAddRule = document.getElementById('form-add-rule');
  if (formAddRule) formAddRule.addEventListener('submit', handleAddCustomRuleSubmit);

  // Listener form modifica regola
  const formEditRule = document.getElementById('form-edit-rule');
  if (formEditRule) formEditRule.addEventListener('submit', handleEditRuleSubmit);

  // Listener ricerca regole
  const rulesSearchInput = document.getElementById('rules-search-input');
  if (rulesSearchInput) {
    rulesSearchInput.addEventListener('input', (e) => {
      currentSearchTerm = e.target.value.trim();
      renderRules();
    });
  }

  // Listener filtro tipo regole (tutte/bonus/malus)
  const rulesTypeFilter = document.getElementById('rules-type-filter');
  if (rulesTypeFilter) {
    rulesTypeFilter.addEventListener('change', (e) => {
      currentTypeFilter = e.target.value;
      renderRules();
    });
  }

  // Listener aggiornamento nome lega
  const leagueNameInput = document.getElementById('settings-league-name');
  if (leagueNameInput) {
    leagueNameInput.value = state.leagueName;
    leagueNameInput.addEventListener('change', (e) => {
      state.leagueName = e.target.value.trim() || "Lega Fantasesso 🔥";
      saveState();
      renderLeaderboard();
      showToast("Nome lega aggiornato!", "success");
    });
  }

  // Listener import file JSON
  const importFileInput = document.getElementById('import-file-input');
  if (importFileInput) {
    importFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        importDataFromJSON(event.target.result);
      };
      reader.readAsText(file);
    });
  }

  // Listener import text area
  const btnImportText = document.getElementById('btn-import-text');
  const importTextArea = document.getElementById('import-text-area');
  if (btnImportText && importTextArea) {
    btnImportText.addEventListener('click', () => {
      const text = importTextArea.value.trim();
      if (!text) {
        showToast("Incolla prima il codice JSON da importare!", "warning");
        return;
      }
      importDataFromJSON(text);
      importTextArea.value = '';
    });
  }
});
