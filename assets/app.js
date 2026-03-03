/* ============================================
   LIFE DASHBOARD - APPLICATION CORE
   ============================================ */

// ========== DATA STRUCTURES ==========

const DEFAULT_ACTIVITIES = [
  { id: 'work', name: 'Work', placeholder: 'actual work', frequency: 'daily', category: 'activities' },
  { id: 'physical_training', name: 'Physical Training', placeholder: 'calisthenics / gym', frequency: 'daily', category: 'activities' },
  { id: 'reading', name: 'Reading', placeholder: 'book name', frequency: 'daily', category: 'activities' },
  { id: 'hobby', name: 'Hobby', placeholder: 'name', frequency: 'daily', category: 'activities' },
  { id: 'philosophy', name: 'Philosophy', placeholder: 'Stoicism', frequency: 'daily', category: 'activities' },
  { id: 'scientia_momentum', name: 'Scientia Momentum / College', placeholder: 'one / other / both', frequency: 'daily', category: 'activities' },
  { id: 'language_immersion', name: 'Language Immersion', placeholder: 'language name', frequency: 'daily', category: 'activities' },
  { id: 'anki', name: 'Anki', placeholder: 'done', frequency: 'daily', category: 'activities' },
  { id: 'language_class', name: 'Language Class', placeholder: 'language name', frequency: 'daily', category: 'activities' },
  { id: 'mining_sentences', name: 'Mineração de Sentenças', placeholder: 'amount', frequency: 'daily', category: 'activities' },
  { id: 'social', name: 'Social', placeholder: 'what kind of contact?', frequency: 'daily', category: 'activities' },
];

const DEFAULT_STUDIES = [
  { id: 'college', name: 'College', placeholder: 'content', frequency: 'daily', category: 'studies', group: 'mandatory' },
  { id: 'course', name: 'Course (Degree)', placeholder: 'platform + content', frequency: 'daily', category: 'studies', group: 'mandatory' },
  { id: 'linguistics', name: 'Linguistics', placeholder: 'language name', frequency: 'daily', category: 'studies', group: 'mandatory' },
  { id: 'reading_writing', name: 'Reading or Writing', placeholder: 'writing / reading / both + details', frequency: 'daily', category: 'studies', group: 'mandatory' },
  { id: 'philosophy_study', name: 'Philosophy', placeholder: 'philosophy + topic', frequency: 'weekly', category: 'studies', group: 'mandatory' },
  { id: 'coding', name: 'Coding / Programming', placeholder: 'content / topic', frequency: 'biweekly', category: 'studies', group: 'mandatory' },
  { id: 'interchange', name: 'Interchange / Scholarship', placeholder: 'content', frequency: 'monthly', category: 'studies', group: 'mandatory' },
  { id: 'exterior_job', name: 'Exterior Job / Emigration', placeholder: 'content', frequency: 'monthly', category: 'studies', group: 'mandatory' },
  { id: 'hardware', name: 'Hardware / Robotics / Mechanics', placeholder: 'content + topic', frequency: 'optional', category: 'studies', group: 'optional' },
  { id: 'mathematics', name: 'Mathematics / Physics / Astronomy', placeholder: 'content + topic', frequency: 'optional', category: 'studies', group: 'optional' },
  { id: 'investment', name: 'Investment / Finances', placeholder: 'content + topic', frequency: 'optional', category: 'studies', group: 'optional' },
  { id: 'other_study', name: 'Other (History, Geography, Bio...)', placeholder: 'content + topic', frequency: 'optional', category: 'studies', group: 'optional' },
];

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily', days: 1 },
  { value: 'weekly', label: 'Weekly (at least once)', days: 7 },
  { value: 'biweekly', label: 'Every 2 Weeks', days: 14 },
  { value: 'triweekly', label: 'Every 3 Weeks', days: 21 },
  { value: 'monthly', label: 'Every 4 Weeks', days: 28 },
  { value: 'optional', label: 'Optional', days: null },
];

const FREQUENCY_META = {
  daily: { label: 'Daily', tagClass: 'tag-daily', color: '#4ecdc4', days: 1 },
  weekly: { label: 'Weekly', tagClass: 'tag-weekly', color: '#6c9fff', days: 7 },
  biweekly: { label: 'Biweekly', tagClass: 'tag-biweekly', color: '#a78bfa', days: 14 },
  triweekly: { label: '3 Weeks', tagClass: 'tag-biweekly', color: '#c084fc', days: 21 },
  monthly: { label: 'Monthly', tagClass: 'tag-monthly', color: '#fb923c', days: 28 },
  optional: { label: 'Optional', tagClass: 'tag-optional', color: '#555d75', days: null },
};

// ========== STATE MANAGEMENT ==========

const AppState = {
  currentPage: 'today',
  currentDate: new Date().toISOString().split('T')[0],
  history: {},         // { "2026-03-01": { activities: {...}, studies: {...} } }
  config: {
    activities: [],
    studies: [],
  },
  comparisonMode: 'week',
  comparisonDateA: null,
  comparisonDateB: null,
};

// ========== STORAGE KEYS ==========
const STORAGE_KEY_HISTORY = 'lifedash_history';
const STORAGE_KEY_CONFIG = 'lifedash_config';
const AUTO_JSON_PATH = 'life_dashboard_data.json';

// ========== UTILITY FUNCTIONS ==========

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateShort(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

function daysBetween(a, b) {
  const da = new Date(a + 'T12:00:00');
  const db = new Date(b + 'T12:00:00');
  return Math.floor((db - da) / 86400000);
}

function getWeekRange(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const day = d.getDay();
  const mon = new Date(d);
  mon.setDate(d.getDate() - ((day + 6) % 7));
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  return { start: mon.toISOString().split('T')[0], end: sun.toISOString().split('T')[0] };
}

function getMonthRange(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
}

function getYearRange(dateStr) {
  const y = new Date(dateStr + 'T12:00:00').getFullYear();
  return { start: `${y}-01-01`, end: `${y}-12-31` };
}

function getDatesInRange(start, end) {
  const dates = [];
  let cur = start;
  while (cur <= end) {
    dates.push(cur);
    cur = addDays(cur, 1);
  }
  return dates;
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// ========== DATA PERSISTENCE ==========

function saveToLocalStorage() {
  try {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(AppState.history));
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(AppState.config));
  } catch (e) {
    console.warn('localStorage save failed:', e);
  }
}

function loadFromLocalStorage() {
  try {
    const hist = localStorage.getItem(STORAGE_KEY_HISTORY);
    const conf = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (hist) AppState.history = JSON.parse(hist);
    if (conf) AppState.config = JSON.parse(conf);
    return !!(hist || conf);
  } catch (e) {
    console.warn('localStorage load failed:', e);
    return false;
  }
}

function exportToJSON() {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    config: AppState.config,
    history: AppState.history,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `life_dashboard_${todayStr()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Data exported successfully', 'success');
}

function importFromJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.history) {
          AppState.history = { ...AppState.history, ...data.history };
        }
        if (data.config) {
          AppState.config = data.config;
          applyConfig();
        }
        saveToLocalStorage();
        resolve(data);
        showToast('Data imported successfully', 'success');
      } catch (err) {
        reject(err);
        showToast('Import failed: Invalid JSON', 'error');
      }
    };
    reader.onerror = () => reject(new Error('File read error'));
    reader.readAsText(file);
  });
}

// ========== CONFIG MANAGEMENT ==========

function initConfig() {
  if (!AppState.config.activities || AppState.config.activities.length === 0) {
    AppState.config.activities = deepClone(DEFAULT_ACTIVITIES);
  }
  if (!AppState.config.studies || AppState.config.studies.length === 0) {
    AppState.config.studies = deepClone(DEFAULT_STUDIES);
  }
  // Merge any new items from defaults that might not exist in saved config
  DEFAULT_ACTIVITIES.forEach(da => {
    if (!AppState.config.activities.find(a => a.id === da.id)) {
      AppState.config.activities.push(deepClone(da));
    }
  });
  DEFAULT_STUDIES.forEach(ds => {
    if (!AppState.config.studies.find(s => s.id === ds.id)) {
      AppState.config.studies.push(deepClone(ds));
    }
  });
}

function applyConfig() {
  initConfig();
}

function getAllItems(category) {
  if (category === 'activities') return AppState.config.activities;
  if (category === 'studies') return AppState.config.studies;
  return [...AppState.config.activities, ...AppState.config.studies];
}

function getItemById(id) {
  return getAllItems('all').find(i => i.id === id);
}

// ========== DAY RECORD MANAGEMENT ==========

function ensureDayRecord(dateStr) {
  if (!AppState.history[dateStr]) {
    AppState.history[dateStr] = { activities: {}, studies: {} };
  }
  return AppState.history[dateStr];
}

function getDayRecord(dateStr) {
  return AppState.history[dateStr] || { activities: {}, studies: {} };
}

function setItemStatus(dateStr, category, itemId, done, detail) {
  const record = ensureDayRecord(dateStr);
  const cat = category === 'activities' ? 'activities' : 'studies';
  if (!record[cat]) record[cat] = {};
  record[cat][itemId] = { done: !!done, detail: detail || '' };
  saveToLocalStorage();
}

function getItemStatus(dateStr, category, itemId) {
  const record = getDayRecord(dateStr);
  const cat = category === 'activities' ? 'activities' : 'studies';
  return record[cat]?.[itemId] || { done: false, detail: '' };
}

// ========== STATISTICS CALCULATIONS ==========

function calcDayCompletion(dateStr, category) {
  const items = getAllItems(category);
  const record = getDayRecord(dateStr);
  const cat = category === 'activities' ? 'activities' : 'studies';
  
  // For studies daily: college OR course is required (not both)
  let requiredCount = 0;
  let doneCount = 0;

  items.forEach(item => {
    if (item.frequency === 'optional') return;
    if (item.frequency !== 'daily') return;
    
    // Special rule: college and course — only one required
    if (category === 'studies' && (item.id === 'college' || item.id === 'course')) {
      return; // handle separately
    }
    
    requiredCount++;
    if (record[cat]?.[item.id]?.done) doneCount++;
  });

  // Handle college/course special case
  if (category === 'studies') {
    requiredCount++; // one of them is required
    const collegeDone = record[cat]?.college?.done;
    const courseDone = record[cat]?.course?.done;
    if (collegeDone || courseDone) doneCount++;
  }

  return requiredCount === 0 ? 100 : Math.round((doneCount / requiredCount) * 100);
}

function calcRangeCompletion(start, end, category) {
  const dates = getDatesInRange(start, end);
  if (dates.length === 0) return 0;
  const items = getAllItems(category);
  
  let totalRequired = 0;
  let totalDone = 0;

  // Daily items
  const dailyItems = items.filter(i => i.frequency === 'daily');
  
  dates.forEach(date => {
    const record = getDayRecord(date);
    const cat = category === 'activities' ? 'activities' : 'studies';
    
    dailyItems.forEach(item => {
      if (category === 'studies' && (item.id === 'college' || item.id === 'course')) return;
      totalRequired++;
      if (record[cat]?.[item.id]?.done) totalDone++;
    });

    if (category === 'studies') {
      totalRequired++;
      if (record[cat]?.college?.done || record[cat]?.course?.done) totalDone++;
    }
  });

  // Weekly/biweekly/monthly items — check if done at least once in period
  const periodicItems = items.filter(i => ['weekly', 'biweekly', 'triweekly', 'monthly'].includes(i.frequency));
  const periodDays = daysBetween(start, end) + 1;

  periodicItems.forEach(item => {
    const freqDays = FREQUENCY_META[item.frequency]?.days;
    if (!freqDays) return;
    
    const expectedOccurrences = Math.max(1, Math.floor(periodDays / freqDays));
    let occurrences = 0;
    const cat = category === 'activities' ? 'activities' : 'studies';

    dates.forEach(date => {
      if (getDayRecord(date)[cat]?.[item.id]?.done) occurrences++;
    });

    totalRequired += expectedOccurrences;
    totalDone += Math.min(occurrences, expectedOccurrences);
  });

  return totalRequired === 0 ? 100 : Math.round((totalDone / totalRequired) * 100);
}

function calcStreak(category) {
  let streak = 0;
  let date = todayStr();
  
  while (true) {
    const completion = calcDayCompletion(date, category);
    if (completion >= 80) {
      streak++;
      date = addDays(date, -1);
    } else {
      break;
    }
    if (streak > 365) break;
  }
  return streak;
}

function calcItemLastDone(itemId, category) {
  const cat = category === 'activities' ? 'activities' : 'studies';
  const dates = Object.keys(AppState.history).sort().reverse();
  
  for (const date of dates) {
    if (AppState.history[date][cat]?.[itemId]?.done) {
      return date;
    }
  }
  return null;
}

function calcItemDaysSinceLastDone(itemId, category) {
  const lastDone = calcItemLastDone(itemId, category);
  if (!lastDone) return Infinity;
  return daysBetween(lastDone, todayStr());
}

// ========== AI ANALYSIS ENGINE ==========

function generateInsights() {
  const insights = [];
  const today = todayStr();
  const allItems = [...AppState.config.activities, ...AppState.config.studies];

  allItems.forEach(item => {
    if (item.frequency === 'optional') return;
    
    const cat = item.category;
    const daysSince = calcItemDaysSinceLastDone(item.id, cat);
    const freqMeta = FREQUENCY_META[item.frequency];
    
    if (!freqMeta || !freqMeta.days) return;

    const threshold = freqMeta.days;
    const overdue = daysSince - threshold;

    if (daysSince === Infinity && item.frequency === 'daily') {
      insights.push({
        type: 'critical',
        icon: '🔴',
        text: `<strong>${item.name}</strong> has never been completed. This is a <strong>${freqMeta.label.toLowerCase()}</strong> activity — start today!`,
        priority: 100,
        itemId: item.id,
        category: cat,
      });
    } else if (overdue > threshold) {
      insights.push({
        type: 'critical',
        icon: '🔴',
        text: `<strong>${item.name}</strong> is severely overdue — last done <strong>${daysSince} days ago</strong> (expected every ${threshold} days). Immediate attention needed.`,
        priority: 90 + overdue,
        itemId: item.id,
        category: cat,
      });
    } else if (overdue > 0) {
      insights.push({
        type: 'warning',
        icon: '⚠️',
        text: `<strong>${item.name}</strong> is overdue by <strong>${overdue} day${overdue > 1 ? 's' : ''}</strong>. Last completed ${daysSince} days ago.`,
        priority: 50 + overdue,
        itemId: item.id,
        category: cat,
      });
    } else if (daysSince === threshold - 1 && item.frequency !== 'daily') {
      insights.push({
        type: 'info',
        icon: 'ℹ️',
        text: `<strong>${item.name}</strong> is due <strong>tomorrow</strong>. Plan ahead!`,
        priority: 30,
        itemId: item.id,
        category: cat,
      });
    } else if (daysSince === threshold && item.frequency !== 'daily') {
      insights.push({
        type: 'warning',
        icon: '⏰',
        text: `<strong>${item.name}</strong> is due <strong>today</strong>!`,
        priority: 70,
        itemId: item.id,
        category: cat,
      });
    }
  });

  // Check today's daily completion
  const actCompletion = calcDayCompletion(today, 'activities');
  const studCompletion = calcDayCompletion(today, 'studies');
  
  if (actCompletion === 100 && studCompletion === 100) {
    insights.push({
      type: 'success',
      icon: '🎉',
      text: `All daily tasks completed! Great discipline today.`,
      priority: 5,
    });
  }

  // Streak info
  const actStreak = calcStreak('activities');
  const studStreak = calcStreak('studies');
  if (actStreak >= 3) {
    insights.push({
      type: 'success',
      icon: '🔥',
      text: `Activities streak: <strong>${actStreak} days</strong> in a row with 80%+ completion!`,
      priority: 10,
    });
  }
  if (studStreak >= 3) {
    insights.push({
      type: 'success',
      icon: '📚',
      text: `Studies streak: <strong>${studStreak} days</strong> in a row with 80%+ completion!`,
      priority: 10,
    });
  }

  // College/Course reminder
  const todayRecord = getDayRecord(today);
  const collegeDone = todayRecord.studies?.college?.done;
  const courseDone = todayRecord.studies?.course?.done;
  if (!collegeDone && !courseDone) {
    insights.push({
      type: 'info',
      icon: '📋',
      text: `Remember: <strong>College</strong> or <strong>Course</strong> — at least one must be completed today.`,
      priority: 60,
    });
  }

  // Observation quality insights
  let totalDoneItems = 0;
  let totalWithDetails = 0;
  const recentDates = [];
  let rd = today;
  for (let i = 0; i < 7; i++) { recentDates.push(rd); rd = addDays(rd, -1); }
  
  recentDates.forEach(date => {
    const rec = getDayRecord(date);
    ['activities', 'studies'].forEach(cat => {
      if (!rec[cat]) return;
      Object.values(rec[cat]).forEach(data => {
        if (data.done) {
          totalDoneItems++;
          if (data.detail && data.detail.trim()) totalWithDetails++;
        }
      });
    });
  });

  if (totalDoneItems > 0 && totalWithDetails < totalDoneItems * 0.2) {
    insights.push({
      type: 'info',
      icon: '📝',
      text: `Only <strong>${Math.round(totalWithDetails/totalDoneItems*100)}%</strong> of recent completions have observations. Adding notes helps track what you actually did — visit the <strong>Observations</strong> page for analysis.`,
      priority: 25,
    });
  } else if (totalDoneItems > 5 && totalWithDetails >= totalDoneItems * 0.7) {
    insights.push({
      type: 'success',
      icon: '📝',
      text: `Excellent documentation! <strong>${Math.round(totalWithDetails/totalDoneItems*100)}%</strong> of recent completions have detailed observations.`,
      priority: 8,
    });
  }

  insights.sort((a, b) => b.priority - a.priority);
  return insights;
}

// ========== TOAST SYSTEM ==========

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✓', error: '✗', warning: '⚠', info: 'ℹ' };
  toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span><span>${message}</span>`;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ========== CHART HELPERS ==========

let chartInstances = {};

function destroyChart(id) {
  if (chartInstances[id]) {
    chartInstances[id].destroy();
    delete chartInstances[id];
  }
}

function createChart(canvasId, config) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;
  chartInstances[canvasId] = new Chart(ctx.getContext('2d'), config);
  return chartInstances[canvasId];
}

// ========== RENDER ENGINE ==========

function renderPage(pageId) {
  AppState.currentPage = pageId;
  
  document.querySelectorAll('.page-section').forEach(p => p.classList.remove('active'));
  const section = document.getElementById(`page-${pageId}`);
  if (section) section.classList.add('active');
  
  document.querySelectorAll('.nav-item[data-page]').forEach(n => {
    n.classList.toggle('active', n.dataset.page === pageId);
  });

  document.getElementById('page-title').textContent = getPageTitle(pageId);

  switch (pageId) {
    case 'today': renderTodayPage(); break;
    case 'activities-dash': renderActivitiesDashboard(); break;
    case 'studies-dash': renderStudiesDashboard(); break;
    case 'comparison': renderComparisonPage(); break;
    case 'history': renderHistoryPage(); break;
    case 'observations': renderObservationsPage(); break;
    case 'insights': renderInsightsPage(); break;
    case 'settings': renderSettingsPage(); break;
    case 'data': renderDataPage(); break;
  }
}

function getPageTitle(pageId) {
  const titles = {
    'today': 'Daily Tracker',
    'activities-dash': 'Activities Dashboard',
    'studies-dash': 'Studies Dashboard',
    'comparison': 'Comparison View',
    'history': 'History',
    'observations': 'Observations',
    'insights': 'AI Insights',
    'settings': 'Configuration',
    'data': 'Data Management',
  };
  return titles[pageId] || 'Dashboard';
}

// ========== TODAY PAGE ==========

function renderTodayPage() {
  const container = document.getElementById('page-today');
  const date = AppState.currentDate;
  
  const actCompletion = calcDayCompletion(date, 'activities');
  const studCompletion = calcDayCompletion(date, 'studies');
  const totalItems = [...AppState.config.activities, ...AppState.config.studies].filter(i => i.frequency !== 'optional').length;
  const record = getDayRecord(date);
  let totalDone = 0;
  ['activities', 'studies'].forEach(cat => {
    Object.values(record[cat] || {}).forEach(v => { if (v.done) totalDone++; });
  });

  const insights = generateInsights().slice(0, 3);
  const insightsHtml = insights.length > 0
    ? insights.map(i => `<div class="ai-insight ${i.type}"><span class="ai-insight-icon">${i.icon}</span><div class="ai-insight-text">${i.text}</div></div>`).join('')
    : '<div class="ai-insight success"><span class="ai-insight-icon">✨</span><div class="ai-insight-text">Everything looks great! Keep going.</div></div>';

  container.innerHTML = `
    <div class="date-nav">
      <button class="date-nav-btn" onclick="navigateDate(-1)">◀</button>
      <span class="date-nav-current">${formatDate(date)}</span>
      <button class="date-nav-btn" onclick="navigateDate(1)">▶</button>
      <input type="date" class="date-input" value="${date}" onchange="jumpToDate(this.value)">
      <button class="btn btn-sm" onclick="jumpToDate(todayStr())">Today</button>
    </div>

    <div class="stats-grid">
      <div class="stat-card" style="--stat-color: var(--accent-primary)">
        <div class="stat-label">Activities</div>
        <div class="stat-value">${actCompletion}%</div>
        <div class="stat-sub">Daily completion</div>
      </div>
      <div class="stat-card" style="--stat-color: var(--accent-blue)">
        <div class="stat-label">Studies</div>
        <div class="stat-value">${studCompletion}%</div>
        <div class="stat-sub">Daily completion</div>
      </div>
      <div class="stat-card" style="--stat-color: var(--accent-green)">
        <div class="stat-label">Tasks Done</div>
        <div class="stat-value">${totalDone}</div>
        <div class="stat-sub">out of tracked items</div>
      </div>
      <div class="stat-card" style="--stat-color: var(--accent-orange)">
        <div class="stat-label">Act. Streak</div>
        <div class="stat-value">${calcStreak('activities')}d</div>
        <div class="stat-sub">consecutive 80%+ days</div>
      </div>
    </div>

    <div class="ai-panel" style="margin-bottom: 24px;">
      <div class="ai-header">
        <span class="ai-badge">Analysis</span>
        <span class="ai-title">Smart Reminders</span>
      </div>
      ${insightsHtml}
    </div>

    <div class="dashboard-grid">
      <div class="card">
        <div class="card-header">
          <div class="card-title"><span class="icon">⚡</span> Activities</div>
          <span style="font-size:0.78rem;color:var(--text-muted)">${actCompletion}% done</span>
        </div>
        <div class="activity-list scroll-inner" id="activities-checklist">
          ${renderChecklist(AppState.config.activities, date, 'activities')}
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <div class="card-title"><span class="icon">📚</span> Studies</div>
          <span style="font-size:0.78rem;color:var(--text-muted)">${studCompletion}% done</span>
        </div>
        <div class="activity-list scroll-inner" id="studies-checklist">
          ${renderStudiesChecklist(date)}
        </div>
      </div>
    </div>

    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px;">
      <button class="btn" onclick="exportToJSON()">⬇ Export JSON</button>
    </div>
  `;
}

function renderChecklist(items, date, category) {
  return items.map(item => {
    const status = getItemStatus(date, category, item.id);
    const freqMeta = FREQUENCY_META[item.frequency];
    return `
      <div class="activity-item ${status.done ? 'completed' : ''}" data-id="${item.id}" data-category="${category}">
        <div class="check-box" onclick="toggleItem('${date}','${category}','${item.id}')">✓</div>
        <div class="activity-info">
          <span class="activity-name">${item.name}</span>
          <span class="activity-tag ${freqMeta.tagClass}">${freqMeta.label}</span>
        </div>
        <input type="text" class="activity-detail-input" placeholder="${item.placeholder}"
          value="${escapeHtml(status.detail)}"
          onchange="updateDetail('${date}','${category}','${item.id}', this.value)"
          onclick="event.stopPropagation()">
      </div>
    `;
  }).join('');
}

function renderStudiesChecklist(date) {
  const studies = AppState.config.studies;
  const groups = {
    'Daily (Mandatory)': studies.filter(s => s.frequency === 'daily'),
    'Weekly': studies.filter(s => s.frequency === 'weekly'),
    'Biweekly': studies.filter(s => s.frequency === 'biweekly'),
    'Every 3 Weeks': studies.filter(s => s.frequency === 'triweekly'),
    'Monthly': studies.filter(s => s.frequency === 'monthly'),
    'Optional': studies.filter(s => s.frequency === 'optional'),
  };

  let html = '';
  for (const [groupName, groupItems] of Object.entries(groups)) {
    if (groupItems.length === 0) continue;
    html += `<div class="activity-category-header"><h3>${groupName}</h3></div>`;
    
    groupItems.forEach(item => {
      const status = getItemStatus(date, 'studies', item.id);
      const freqMeta = FREQUENCY_META[item.frequency];
      let note = '';
      if (item.id === 'college' || item.id === 'course') {
        note = '<span style="font-size:0.7rem;color:var(--text-muted);margin-left:4px">(at least one required)</span>';
      }
      html += `
        <div class="activity-item ${status.done ? 'completed' : ''}" data-id="${item.id}" data-category="studies">
          <div class="check-box" onclick="toggleItem('${date}','studies','${item.id}')">✓</div>
          <div class="activity-info">
            <span class="activity-name">${item.name}${note}</span>
            <span class="activity-tag ${freqMeta.tagClass}">${freqMeta.label}</span>
          </div>
          <input type="text" class="activity-detail-input" placeholder="${item.placeholder}"
            value="${escapeHtml(status.detail)}"
            onchange="updateDetail('${date}','studies','${item.id}', this.value)"
            onclick="event.stopPropagation()">
        </div>
      `;
    });
  }
  return html;
}

function toggleItem(date, category, itemId) {
  const current = getItemStatus(date, category, itemId);
  const newDone = !current.done;
  setItemStatus(date, category, itemId, newDone, current.detail);

  // Targeted DOM update instead of full re-render
  const itemEl = document.querySelector(`.activity-item[data-id="${itemId}"][data-category="${category}"]`);
  if (itemEl) {
    itemEl.classList.toggle('completed', newDone);
  }

  // Update completion stats in header
  const actCompletion = calcDayCompletion(date, 'activities');
  const studCompletion = calcDayCompletion(date, 'studies');
  const record = getDayRecord(date);
  let totalDone = 0;
  ['activities', 'studies'].forEach(cat => {
    Object.values(record[cat] || {}).forEach(v => { if (v.done) totalDone++; });
  });

  // Update stat cards
  const statValues = document.querySelectorAll('.stat-card .stat-value');
  if (statValues.length >= 3 && AppState.currentPage === 'today') {
    statValues[0].textContent = `${actCompletion}%`;
    statValues[1].textContent = `${studCompletion}%`;
    statValues[2].textContent = `${totalDone}`;
    statValues[3].textContent = `${calcStreak('activities')}d`;
    // Update card header percentages
    const actHeader = document.querySelector('#activities-checklist')?.closest('.card')?.querySelector('.card-header span:last-child');
    const studHeader = document.querySelector('#studies-checklist')?.closest('.card')?.querySelector('.card-header span:last-child');
    if (actHeader) actHeader.textContent = `${actCompletion}% done`;
    if (studHeader) studHeader.textContent = `${studCompletion}% done`;
  }
}

function updateDetail(date, category, itemId, value) {
  const current = getItemStatus(date, category, itemId);
  setItemStatus(date, category, itemId, current.done, value);
}

function navigateDate(delta) {
  AppState.currentDate = addDays(AppState.currentDate, delta);
  document.getElementById('current-date-display').textContent = formatDate(AppState.currentDate);
  renderPage(AppState.currentPage);
}

function jumpToDate(dateStr) {
  if (!dateStr) return;
  AppState.currentDate = dateStr;
  document.getElementById('current-date-display').textContent = formatDate(AppState.currentDate);
  renderPage(AppState.currentPage);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ========== ACTIVITIES DASHBOARD ==========

function renderActivitiesDashboard() {
  const container = document.getElementById('page-activities-dash');
  const week = getWeekRange(AppState.currentDate);
  const month = getMonthRange(AppState.currentDate);
  
  const weekComp = calcRangeCompletion(week.start, week.end, 'activities');
  const monthComp = calcRangeCompletion(month.start, month.end, 'activities');
  const streak = calcStreak('activities');

  // Per-item progress for the week
  const items = AppState.config.activities;
  const weekDates = getDatesInRange(week.start, week.end);

  let itemProgressHtml = items.map(item => {
    let doneCount = 0;
    weekDates.forEach(d => {
      if (getDayRecord(d).activities?.[item.id]?.done) doneCount++;
    });
    const expected = item.frequency === 'daily' ? weekDates.length : (FREQUENCY_META[item.frequency]?.days ? 1 : 0);
    const pct = expected === 0 ? 0 : Math.min(100, Math.round((doneCount / expected) * 100));
    const color = pct >= 80 ? 'var(--accent-green)' : pct >= 50 ? 'var(--accent-warning)' : 'var(--accent-secondary)';
    return `
      <div class="progress-bar-container">
        <div class="progress-label">
          <span class="progress-label-name">${item.name}</span>
          <span class="progress-label-value">${doneCount}/${expected > 0 ? expected : '—'} (${pct}%)</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width:${pct}%;--bar-color:${color}"></div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="date-nav">
      <button class="date-nav-btn" onclick="navigateDate(-7)">◀</button>
      <span class="date-nav-current">Week of ${formatDateShort(week.start)} — ${formatDateShort(week.end)}</span>
      <button class="date-nav-btn" onclick="navigateDate(7)">▶</button>
    </div>

    <div class="stats-grid">
      <div class="stat-card" style="--stat-color: var(--accent-primary)">
        <div class="stat-label">Week Completion</div>
        <div class="stat-value">${weekComp}%</div>
      </div>
      <div class="stat-card" style="--stat-color: var(--accent-blue)">
        <div class="stat-label">Month Completion</div>
        <div class="stat-value">${monthComp}%</div>
      </div>
      <div class="stat-card" style="--stat-color: var(--accent-orange)">
        <div class="stat-label">Current Streak</div>
        <div class="stat-value">${streak}d</div>
      </div>
      <div class="stat-card" style="--stat-color: var(--accent-green)">
        <div class="stat-label">Today</div>
        <div class="stat-value">${calcDayCompletion(todayStr(), 'activities')}%</div>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="card">
        <div class="card-header">
          <div class="card-title"><span class="icon">📊</span> Weekly Trend</div>
        </div>
        <div class="chart-container"><canvas id="chart-activities-week"></canvas></div>
      </div>
      <div class="card">
        <div class="card-header">
          <div class="card-title"><span class="icon">📈</span> Item Progress (This Week)</div>
        </div>
        <div class="scroll-inner">${itemProgressHtml}</div>
      </div>
      <div class="card full-width">
        <div class="card-header">
          <div class="card-title"><span class="icon">🗓️</span> Monthly Overview</div>
        </div>
        <div class="chart-container"><canvas id="chart-activities-month"></canvas></div>
      </div>
      <div class="card">
        <div class="card-header">
          <div class="card-title"><span class="icon">🟩</span> 90-Day Heatmap</div>
        </div>
        <div id="heatmap-activities"></div>
      </div>
      <div class="card">
        <div class="card-header">
          <div class="card-title"><span class="icon">🍩</span> Completion Distribution</div>
        </div>
        <div class="chart-container"><canvas id="chart-activities-doughnut"></canvas></div>
      </div>
    </div>
  `;

  // Render charts
  setTimeout(() => {
    renderWeeklyChart('chart-activities-week', 'activities');
    renderMonthlyChart('chart-activities-month', 'activities');
    renderHeatmapForDashboard('heatmap-activities', 'activities');
    renderDoughnutChart('chart-activities-doughnut', 'activities');
  }, 50);
}

// ========== STUDIES DASHBOARD ==========

function renderStudiesDashboard() {
  const container = document.getElementById('page-studies-dash');
  const week = getWeekRange(AppState.currentDate);
  const month = getMonthRange(AppState.currentDate);
  
  const weekComp = calcRangeCompletion(week.start, week.end, 'studies');
  const monthComp = calcRangeCompletion(month.start, month.end, 'studies');
  const streak = calcStreak('studies');

  const items = AppState.config.studies;
  const weekDates = getDatesInRange(week.start, week.end);

  let itemProgressHtml = items.map(item => {
    let doneCount = 0;
    weekDates.forEach(d => {
      if (getDayRecord(d).studies?.[item.id]?.done) doneCount++;
    });
    const freqDays = FREQUENCY_META[item.frequency]?.days;
    let expected;
    if (item.frequency === 'daily') expected = weekDates.length;
    else if (freqDays && freqDays <= 7) expected = 1;
    else if (freqDays) expected = Math.max(0, Math.round(7 / freqDays));
    else expected = 0;
    
    const pct = expected === 0 ? (doneCount > 0 ? 100 : 0) : Math.min(100, Math.round((doneCount / Math.max(1, expected)) * 100));
    const color = pct >= 80 ? 'var(--accent-green)' : pct >= 50 ? 'var(--accent-warning)' : item.frequency === 'optional' ? 'var(--text-muted)' : 'var(--accent-secondary)';
    const freqMeta = FREQUENCY_META[item.frequency];
    return `
      <div class="progress-bar-container">
        <div class="progress-label">
          <span class="progress-label-name">${item.name} <span class="activity-tag ${freqMeta.tagClass}" style="font-size:0.6rem">${freqMeta.label}</span></span>
          <span class="progress-label-value">${doneCount}x this week</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width:${pct}%;--bar-color:${color}"></div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="date-nav">
      <button class="date-nav-btn" onclick="navigateDate(-7)">◀</button>
      <span class="date-nav-current">Week of ${formatDateShort(week.start)} — ${formatDateShort(week.end)}</span>
      <button class="date-nav-btn" onclick="navigateDate(7)">▶</button>
    </div>

    <div class="stats-grid">
      <div class="stat-card" style="--stat-color: var(--accent-blue)">
        <div class="stat-label">Week Completion</div>
        <div class="stat-value">${weekComp}%</div>
      </div>
      <div class="stat-card" style="--stat-color: var(--accent-purple)">
        <div class="stat-label">Month Completion</div>
        <div class="stat-value">${monthComp}%</div>
      </div>
      <div class="stat-card" style="--stat-color: var(--accent-orange)">
        <div class="stat-label">Current Streak</div>
        <div class="stat-value">${streak}d</div>
      </div>
      <div class="stat-card" style="--stat-color: var(--accent-green)">
        <div class="stat-label">Today</div>
        <div class="stat-value">${calcDayCompletion(todayStr(), 'studies')}%</div>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="card">
        <div class="card-header">
          <div class="card-title"><span class="icon">📊</span> Weekly Trend</div>
        </div>
        <div class="chart-container"><canvas id="chart-studies-week"></canvas></div>
      </div>
      <div class="card">
        <div class="card-header">
          <div class="card-title"><span class="icon">📈</span> Subject Progress (This Week)</div>
        </div>
        <div class="scroll-inner">${itemProgressHtml}</div>
      </div>
      <div class="card full-width">
        <div class="card-header">
          <div class="card-title"><span class="icon">🗓️</span> Monthly Overview</div>
        </div>
        <div class="chart-container"><canvas id="chart-studies-month"></canvas></div>
      </div>
      <div class="card">
        <div class="card-header">
          <div class="card-title"><span class="icon">🟩</span> 90-Day Heatmap</div>
        </div>
        <div id="heatmap-studies"></div>
      </div>
      <div class="card">
        <div class="card-header">
          <div class="card-title"><span class="icon">🍩</span> Subject Distribution</div>
        </div>
        <div class="chart-container"><canvas id="chart-studies-doughnut"></canvas></div>
      </div>
    </div>
  `;

  setTimeout(() => {
    renderWeeklyChart('chart-studies-week', 'studies');
    renderMonthlyChart('chart-studies-month', 'studies');
    renderHeatmapForDashboard('heatmap-studies', 'studies');
    renderDoughnutChart('chart-studies-doughnut', 'studies');
  }, 50);
}

// ========== CHART RENDERERS ==========

function renderWeeklyChart(canvasId, category) {
  const week = getWeekRange(AppState.currentDate);
  const dates = getDatesInRange(week.start, week.end);
  const labels = dates.map(d => {
    const dt = new Date(d + 'T12:00:00');
    return dt.toLocaleDateString('en-US', { weekday: 'short' });
  });
  const data = dates.map(d => calcDayCompletion(d, category));
  const color = category === 'activities' ? '#4ecdc4' : '#6c9fff';

  createChart(canvasId, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Completion %',
        data,
        backgroundColor: data.map(v => v >= 80 ? `${color}99` : v >= 50 ? '#ffd93d66' : '#ff6b6b66'),
        borderColor: data.map(v => v >= 80 ? color : v >= 50 ? '#ffd93d' : '#ff6b6b'),
        borderWidth: 1,
        borderRadius: 4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, max: 100, ticks: { color: '#8b92a8', font: { family: 'JetBrains Mono', size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
        x: { ticks: { color: '#8b92a8', font: { family: 'JetBrains Mono', size: 10 } }, grid: { display: false } }
      },
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: '#1a1e28', titleFont: { family: 'Outfit' }, bodyFont: { family: 'JetBrains Mono', size: 12 } }
      }
    }
  });
}

function renderMonthlyChart(canvasId, category) {
  const month = getMonthRange(AppState.currentDate);
  const dates = getDatesInRange(month.start, month.end);
  const labels = dates.map(d => new Date(d + 'T12:00:00').getDate().toString());
  const data = dates.map(d => calcDayCompletion(d, category));
  const color = category === 'activities' ? '#4ecdc4' : '#6c9fff';

  createChart(canvasId, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Daily Completion %',
        data,
        borderColor: color,
        backgroundColor: `${color}15`,
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        pointBackgroundColor: color,
        pointBorderWidth: 0,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, max: 100, ticks: { color: '#8b92a8', font: { family: 'JetBrains Mono', size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
        x: { ticks: { color: '#8b92a8', font: { family: 'JetBrains Mono', size: 10 }, maxTicksLimit: 15 }, grid: { display: false } }
      },
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: '#1a1e28', titleFont: { family: 'Outfit' }, bodyFont: { family: 'JetBrains Mono', size: 12 } }
      }
    }
  });
}

// ========== COMPARISON PAGE ==========

function renderDoughnutChart(canvasId, category) {
  const month = getMonthRange(AppState.currentDate);
  const dates = getDatesInRange(month.start, month.end);
  const items = getAllItems(category);
  const cat = category === 'activities' ? 'activities' : 'studies';
  
  const itemDone = items.map(item => {
    let count = 0;
    dates.forEach(d => {
      if (getDayRecord(d)[cat]?.[item.id]?.done) count++;
    });
    return { name: item.name, count };
  }).filter(d => d.count > 0);

  if (itemDone.length === 0) return;

  const colors = [
    '#4ecdc4', '#6c9fff', '#a78bfa', '#fb923c', '#34d399',
    '#ff6b6b', '#ffd93d', '#c084fc', '#38bdf8', '#f472b6',
    '#4ade80', '#e879f9', '#facc15', '#22d3ee',
  ];

  createChart(canvasId, {
    type: 'doughnut',
    data: {
      labels: itemDone.map(d => d.name),
      datasets: [{
        data: itemDone.map(d => d.count),
        backgroundColor: itemDone.map((_, i) => colors[i % colors.length] + '88'),
        borderColor: itemDone.map((_, i) => colors[i % colors.length]),
        borderWidth: 1,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: {
          position: 'right',
          labels: { color: '#8b92a8', font: { family: 'Outfit', size: 10 }, boxWidth: 12, padding: 8 }
        },
        tooltip: { backgroundColor: '#1a1e28' }
      }
    }
  });
}

// ========== COMPARISON PAGE (cont.) ==========

function renderComparisonPage() {
  const container = document.getElementById('page-comparison');
  
  container.innerHTML = `
    <div class="card" style="margin-bottom:24px">
      <div class="card-header">
        <div class="card-title"><span class="icon">⚖️</span> Comparison Settings</div>
      </div>
      <div class="comparison-controls">
        <div class="tab-group">
          <button class="tab-btn ${AppState.comparisonMode === 'day' ? 'active' : ''}" onclick="setCompMode('day')">Day</button>
          <button class="tab-btn ${AppState.comparisonMode === 'week' ? 'active' : ''}" onclick="setCompMode('week')">Week</button>
          <button class="tab-btn ${AppState.comparisonMode === 'month' ? 'active' : ''}" onclick="setCompMode('month')">Month</button>
          <button class="tab-btn ${AppState.comparisonMode === 'year' ? 'active' : ''}" onclick="setCompMode('year')">Year</button>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <label class="form-label" style="margin:0">Period A:</label>
          <input type="date" class="date-input" id="comp-date-a" value="${AppState.comparisonDateA || AppState.currentDate}" onchange="updateCompDates()">
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <label class="form-label" style="margin:0">Period B:</label>
          <input type="date" class="date-input" id="comp-date-b" value="${AppState.comparisonDateB || addDays(AppState.currentDate, -7)}" onchange="updateCompDates()">
        </div>
      </div>
    </div>
    <div id="comparison-results"></div>
  `;

  updateCompDates();
}

function setCompMode(mode) {
  AppState.comparisonMode = mode;
  renderComparisonPage();
}

function updateCompDates() {
  const dateA = document.getElementById('comp-date-a')?.value || AppState.currentDate;
  const dateB = document.getElementById('comp-date-b')?.value || addDays(AppState.currentDate, -7);
  AppState.comparisonDateA = dateA;
  AppState.comparisonDateB = dateB;

  let rangeA, rangeB, labelA, labelB;
  
  switch (AppState.comparisonMode) {
    case 'day':
      rangeA = { start: dateA, end: dateA };
      rangeB = { start: dateB, end: dateB };
      labelA = formatDate(dateA);
      labelB = formatDate(dateB);
      break;
    case 'week':
      rangeA = getWeekRange(dateA);
      rangeB = getWeekRange(dateB);
      labelA = `Week of ${formatDateShort(rangeA.start)}`;
      labelB = `Week of ${formatDateShort(rangeB.start)}`;
      break;
    case 'month':
      rangeA = getMonthRange(dateA);
      rangeB = getMonthRange(dateB);
      labelA = new Date(dateA + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      labelB = new Date(dateB + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      break;
    case 'year':
      rangeA = getYearRange(dateA);
      rangeB = getYearRange(dateB);
      labelA = new Date(dateA + 'T12:00:00').getFullYear().toString();
      labelB = new Date(dateB + 'T12:00:00').getFullYear().toString();
      break;
  }

  const actA = calcRangeCompletion(rangeA.start, rangeA.end, 'activities');
  const actB = calcRangeCompletion(rangeB.start, rangeB.end, 'activities');
  const studA = calcRangeCompletion(rangeA.start, rangeA.end, 'studies');
  const studB = calcRangeCompletion(rangeB.start, rangeB.end, 'studies');

  const diffAct = actA - actB;
  const diffStud = studA - studB;

  const resultsDiv = document.getElementById('comparison-results');
  if (!resultsDiv) return;

  resultsDiv.innerHTML = `
    <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr)">
      <div class="stat-card" style="--stat-color: var(--accent-primary)">
        <div class="stat-label">Activities (A)</div>
        <div class="stat-value">${actA}%</div>
        <div class="stat-sub">${labelA}</div>
      </div>
      <div class="stat-card" style="--stat-color: var(--accent-blue)">
        <div class="stat-label">Activities (B)</div>
        <div class="stat-value">${actB}%</div>
        <div class="stat-sub">${labelB}</div>
      </div>
      <div class="stat-card" style="--stat-color: var(--accent-primary)">
        <div class="stat-label">Studies (A)</div>
        <div class="stat-value">${studA}%</div>
        <div class="stat-sub">${labelA}</div>
      </div>
      <div class="stat-card" style="--stat-color: var(--accent-blue)">
        <div class="stat-label">Studies (B)</div>
        <div class="stat-value">${studB}%</div>
        <div class="stat-sub">${labelB}</div>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="card">
        <div class="card-header">
          <div class="card-title"><span class="icon">⚡</span> Activities Delta</div>
          <span class="stat-sub ${diffAct >= 0 ? 'positive' : 'negative'}">${diffAct >= 0 ? '+' : ''}${diffAct}%</span>
        </div>
        <div class="chart-container"><canvas id="chart-comp-act"></canvas></div>
      </div>
      <div class="card">
        <div class="card-header">
          <div class="card-title"><span class="icon">📚</span> Studies Delta</div>
          <span class="stat-sub ${diffStud >= 0 ? 'positive' : 'negative'}">${diffStud >= 0 ? '+' : ''}${diffStud}%</span>
        </div>
        <div class="chart-container"><canvas id="chart-comp-stud"></canvas></div>
      </div>
    </div>
  `;

  setTimeout(() => {
    renderComparisonChart('chart-comp-act', 'activities', rangeA, rangeB, labelA, labelB);
    renderComparisonChart('chart-comp-stud', 'studies', rangeA, rangeB, labelA, labelB);
  }, 50);
}

function renderComparisonChart(canvasId, category, rangeA, rangeB, labelA, labelB) {
  const items = getAllItems(category);
  const labels = items.filter(i => i.frequency !== 'optional').map(i => i.name);
  
  const datesA = getDatesInRange(rangeA.start, rangeA.end);
  const datesB = getDatesInRange(rangeB.start, rangeB.end);
  const cat = category === 'activities' ? 'activities' : 'studies';

  const dataA = items.filter(i => i.frequency !== 'optional').map(item => {
    let done = 0;
    datesA.forEach(d => { if (getDayRecord(d)[cat]?.[item.id]?.done) done++; });
    return Math.round((done / Math.max(1, datesA.length)) * 100);
  });

  const dataB = items.filter(i => i.frequency !== 'optional').map(item => {
    let done = 0;
    datesB.forEach(d => { if (getDayRecord(d)[cat]?.[item.id]?.done) done++; });
    return Math.round((done / Math.max(1, datesB.length)) * 100);
  });

  const colorA = category === 'activities' ? '#4ecdc4' : '#6c9fff';
  const colorB = '#a78bfa';

  createChart(canvasId, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: labelA, data: dataA, backgroundColor: `${colorA}88`, borderColor: colorA, borderWidth: 1, borderRadius: 3 },
        { label: labelB, data: dataB, backgroundColor: `${colorB}88`, borderColor: colorB, borderWidth: 1, borderRadius: 3 },
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      scales: {
        x: { beginAtZero: true, max: 100, ticks: { color: '#8b92a8', font: { family: 'JetBrains Mono', size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
        y: { ticks: { color: '#8b92a8', font: { family: 'Outfit', size: 11 } }, grid: { display: false } }
      },
      plugins: {
        legend: { labels: { color: '#8b92a8', font: { family: 'Outfit', size: 11 } } },
        tooltip: { backgroundColor: '#1a1e28' }
      }
    }
  });
}

// ========== HISTORY PAGE ==========

function renderHistoryPage() {
  const container = document.getElementById('page-history');
  const dates = Object.keys(AppState.history).sort().reverse();
  
  if (dates.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-text">No history yet. Start tracking today!</div></div>`;
    return;
  }

  const allItems = [...AppState.config.activities, ...AppState.config.studies];

  let tableRows = dates.slice(0, 60).map(date => {
    const actComp = calcDayCompletion(date, 'activities');
    const studComp = calcDayCompletion(date, 'studies');
    const record = getDayRecord(date);
    let totalDone = 0;
    let totalTracked = 0;
    let obsCount = 0;
    allItems.forEach(item => {
      const cat = item.category === 'activities' ? 'activities' : 'studies';
      if (record[cat]?.[item.id]?.done) totalDone++;
      if (record[cat]?.[item.id]) totalTracked++;
      if (record[cat]?.[item.id]?.detail?.trim()) obsCount++;
    });
    
    return `<tr style="cursor:pointer" onclick="jumpToDate('${date}');renderPage('today')">
      <td style="font-family:'JetBrains Mono',monospace;font-size:0.8rem">${formatDate(date)}</td>
      <td><span class="status-dot ${actComp >= 80 ? 'done' : actComp > 0 ? 'missed' : 'na'}"></span> ${actComp}%</td>
      <td><span class="status-dot ${studComp >= 80 ? 'done' : studComp > 0 ? 'missed' : 'na'}"></span> ${studComp}%</td>
      <td>${totalDone}</td>
      <td>${obsCount > 0 ? `<span style="color:var(--accent-primary)">${obsCount} 📝</span>` : '<span style="color:var(--text-muted)">—</span>'}</td>
    </tr>`;
  }).join('');

  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="card-title"><span class="icon">📜</span> Completion History</div>
        <span style="font-size:0.78rem;color:var(--text-muted)">${dates.length} days tracked</span>
      </div>
      <div class="history-table-container">
        <table class="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Activities</th>
              <th>Studies</th>
              <th>Items Done</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
    </div>
  `;
}

// ========== INSIGHTS PAGE ==========

function renderInsightsPage() {
  const container = document.getElementById('page-insights');
  const insights = generateInsights();
  
  const insightsHtml = insights.length > 0
    ? insights.map(i => `<div class="ai-insight ${i.type}"><span class="ai-insight-icon">${i.icon}</span><div class="ai-insight-text">${i.text}</div></div>`).join('')
    : '<div class="ai-insight success"><span class="ai-insight-icon">✨</span><div class="ai-insight-text">Everything is on track! No issues detected.</div></div>';

  // Build "last done" table for mandatory items
  const mandatoryItems = [...AppState.config.activities, ...AppState.config.studies].filter(i => i.frequency !== 'optional');
  let overviewHtml = mandatoryItems.map(item => {
    const cat = item.category;
    const daysSince = calcItemDaysSinceLastDone(item.id, cat);
    const freq = FREQUENCY_META[item.frequency];
    const isOverdue = freq.days && daysSince > freq.days;
    const statusClass = daysSince === Infinity ? 'missed' : isOverdue ? 'missed' : 'done';
    const daysText = daysSince === Infinity ? 'Never' : daysSince === 0 ? 'Today' : `${daysSince}d ago`;
    return `
      <tr>
        <td>${item.name}</td>
        <td><span class="activity-tag ${freq.tagClass}" style="font-size:0.6rem">${freq.label}</span></td>
        <td><span class="status-dot ${statusClass}"></span> ${daysText}</td>
        <td>${isOverdue ? '⚠️ Overdue' : daysSince === Infinity ? '❌ Never done' : '✅ OK'}</td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div class="ai-panel" style="margin-bottom:24px">
      <div class="ai-header">
        <span class="ai-badge">AI Analysis</span>
        <span class="ai-title">Intelligent Activity Monitor</span>
      </div>
      <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:16px">
        This analysis checks all mandatory activities and studies for overdue items, streaks, and patterns. Only mandatory items trigger alerts.
      </p>
      ${insightsHtml}
    </div>

    <div class="dashboard-grid">
      <div class="card">
        <div class="card-header">
          <div class="card-title"><span class="icon">🟩</span> Activities Heatmap (90 days)</div>
        </div>
        <div id="insights-heatmap-act"></div>
      </div>
      <div class="card">
        <div class="card-header">
          <div class="card-title"><span class="icon">🟦</span> Studies Heatmap (90 days)</div>
        </div>
        <div id="insights-heatmap-stud"></div>
      </div>
      <div class="card full-width">
        <div class="card-header">
          <div class="card-title"><span class="icon">📊</span> Item Frequency (Last 30 Days)</div>
        </div>
        <div class="chart-container"><canvas id="chart-insights-freq"></canvas></div>
      </div>
    </div>

    <div class="card" style="margin-top:20px">
      <div class="card-header">
        <div class="card-title"><span class="icon">🔍</span> Mandatory Items Overview</div>
      </div>
      <div class="history-table-container">
        <table class="history-table">
          <thead><tr><th>Item</th><th>Frequency</th><th>Last Done</th><th>Status</th></tr></thead>
          <tbody>${overviewHtml}</tbody>
        </table>
      </div>
    </div>
  `;

  setTimeout(() => {
    renderHeatmapForDashboard('insights-heatmap-act', 'activities');
    renderHeatmapForDashboard('insights-heatmap-stud', 'studies');
    renderInsightsFreqChart();
  }, 50);
}

function renderInsightsFreqChart() {
  const allItems = [...AppState.config.activities, ...AppState.config.studies].filter(i => i.frequency !== 'optional');
  const today = todayStr();
  const startDate = addDays(today, -30);
  const dates = getDatesInRange(startDate, today);

  const itemCounts = allItems.map(item => {
    const cat = item.category === 'activities' ? 'activities' : 'studies';
    let count = 0;
    dates.forEach(d => {
      if (getDayRecord(d)[cat]?.[item.id]?.done) count++;
    });
    return { name: item.name, count, category: item.category };
  }).sort((a, b) => b.count - a.count);

  createChart('chart-insights-freq', {
    type: 'bar',
    data: {
      labels: itemCounts.map(i => i.name),
      datasets: [{
        label: 'Times completed (30d)',
        data: itemCounts.map(i => i.count),
        backgroundColor: itemCounts.map(i => i.category === 'activities' ? '#4ecdc466' : '#6c9fff66'),
        borderColor: itemCounts.map(i => i.category === 'activities' ? '#4ecdc4' : '#6c9fff'),
        borderWidth: 1,
        borderRadius: 4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, ticks: { color: '#8b92a8', stepSize: 1, font: { family: 'JetBrains Mono', size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
        x: { ticks: { color: '#8b92a8', font: { family: 'Outfit', size: 9 }, maxRotation: 45 }, grid: { display: false } }
      },
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: '#1a1e28' }
      }
    }
  });
}

// ========== OBSERVATIONS PAGE ==========

function collectAllObservations() {
  const observations = {}; // { itemId: [{ date, detail }] }
  const allItems = [...AppState.config.activities, ...AppState.config.studies];
  
  allItems.forEach(item => {
    observations[item.id] = [];
  });

  const dates = Object.keys(AppState.history).sort();
  dates.forEach(date => {
    const record = AppState.history[date];
    ['activities', 'studies'].forEach(cat => {
      if (!record[cat]) return;
      Object.entries(record[cat]).forEach(([itemId, data]) => {
        if (data.detail && data.detail.trim()) {
          if (!observations[itemId]) observations[itemId] = [];
          observations[itemId].push({ date, detail: data.detail.trim(), done: data.done });
        }
      });
    });
  });

  return observations;
}

function analyzeObservationPatterns(observations) {
  const analysis = [];
  const allItems = [...AppState.config.activities, ...AppState.config.studies];
  
  // 1. Word frequency analysis across all observations
  const globalWordFreq = {};
  const itemWordFreq = {};
  
  allItems.forEach(item => {
    const obs = observations[item.id] || [];
    itemWordFreq[item.id] = {};
    
    obs.forEach(o => {
      const words = o.detail.toLowerCase()
        .replace(/[^a-záàâãéèêíïóôõöúüç0-9\s]/gi, '')
        .split(/\s+/)
        .filter(w => w.length > 2);
      
      words.forEach(word => {
        globalWordFreq[word] = (globalWordFreq[word] || 0) + 1;
        itemWordFreq[item.id][word] = (itemWordFreq[item.id][word] || 0) + 1;
      });
    });
  });

  // 2. Most documented activities
  const docCounts = allItems
    .map(item => ({ item, count: (observations[item.id] || []).length }))
    .filter(x => x.count > 0)
    .sort((a, b) => b.count - a.count);

  if (docCounts.length > 0) {
    const top = docCounts[0];
    analysis.push({
      type: 'info',
      icon: '📝',
      text: `<strong>${top.item.name}</strong> is your most documented item with <strong>${top.count} observations</strong>. Good habit of tracking details!`,
      priority: 40,
    });
  }

  // 3. Items with NO observations but marked done many times
  allItems.forEach(item => {
    if (item.frequency === 'optional') return;
    const obs = (observations[item.id] || []).length;
    let doneCount = 0;
    Object.values(AppState.history).forEach(record => {
      const cat = item.category === 'activities' ? 'activities' : 'studies';
      if (record[cat]?.[item.id]?.done) doneCount++;
    });
    
    if (doneCount >= 5 && obs === 0) {
      analysis.push({
        type: 'warning',
        icon: '⚠️',
        text: `<strong>${item.name}</strong> has been completed <strong>${doneCount} times</strong> but has <strong>zero observations</strong>. Adding details helps you track progress and remember what you did.`,
        priority: 60,
      });
    } else if (doneCount >= 5 && obs < doneCount * 0.3) {
      analysis.push({
        type: 'info',
        icon: 'ℹ️',
        text: `<strong>${item.name}</strong> only has details in <strong>${Math.round(obs/doneCount*100)}%</strong> of completions (${obs}/${doneCount}). Consider adding more observations.`,
        priority: 30,
      });
    }
  });

  // 4. Recurring patterns in detail text
  allItems.forEach(item => {
    const obs = observations[item.id] || [];
    if (obs.length < 3) return;
    
    const wordFreqs = itemWordFreq[item.id] || {};
    const sorted = Object.entries(wordFreqs).sort((a, b) => b[1] - a[1]);
    const topWords = sorted.slice(0, 5).filter(([_, count]) => count >= 2);
    
    if (topWords.length >= 2) {
      const wordList = topWords.map(([w, c]) => `"${w}" (${c}x)`).join(', ');
      analysis.push({
        type: 'success',
        icon: '🔄',
        text: `<strong>${item.name}</strong> — recurring themes: ${wordList}. This reveals your focus areas.`,
        priority: 25,
      });
    }
  });

  // 5. Diversity analysis
  allItems.forEach(item => {
    const obs = observations[item.id] || [];
    if (obs.length < 5) return;
    
    const uniqueDetails = new Set(obs.map(o => o.detail.toLowerCase().trim()));
    const diversityRatio = uniqueDetails.size / obs.length;
    
    if (diversityRatio >= 0.8 && obs.length >= 5) {
      analysis.push({
        type: 'success',
        icon: '🌈',
        text: `<strong>${item.name}</strong> shows <strong>high diversity</strong> — ${uniqueDetails.size} unique entries out of ${obs.length}. You're exploring varied content!`,
        priority: 20,
      });
    } else if (diversityRatio < 0.3 && obs.length >= 5) {
      analysis.push({
        type: 'info',
        icon: '🔁',
        text: `<strong>${item.name}</strong> shows <strong>high repetition</strong> — only ${uniqueDetails.size} unique entries out of ${obs.length}. Consider diversifying your approach.`,
        priority: 35,
      });
    }
  });

  // 6. Recent activity analysis (last 7 days)
  const recentDates = [];
  let d = todayStr();
  for (let i = 0; i < 7; i++) {
    recentDates.push(d);
    d = addDays(d, -1);
  }
  
  let recentObsCount = 0;
  let recentDoneCount = 0;
  recentDates.forEach(date => {
    const record = getDayRecord(date);
    ['activities', 'studies'].forEach(cat => {
      if (!record[cat]) return;
      Object.values(record[cat]).forEach(data => {
        if (data.done) recentDoneCount++;
        if (data.detail && data.detail.trim()) recentObsCount++;
      });
    });
  });

  if (recentDoneCount > 0) {
    const obsRate = Math.round((recentObsCount / recentDoneCount) * 100);
    if (obsRate >= 70) {
      analysis.push({
        type: 'success',
        icon: '✨',
        text: `Great documentation this week! <strong>${obsRate}%</strong> of completed items have detailed observations (${recentObsCount}/${recentDoneCount}).`,
        priority: 15,
      });
    } else if (obsRate < 30) {
      analysis.push({
        type: 'warning',
        icon: '📋',
        text: `Only <strong>${obsRate}%</strong> of completed items this week have observations (${recentObsCount}/${recentDoneCount}). Try adding more details!`,
        priority: 55,
      });
    }
  }

  analysis.sort((a, b) => b.priority - a.priority);
  return { analysis, globalWordFreq, itemWordFreq, docCounts };
}

function renderObservationsPage() {
  const container = document.getElementById('page-observations');
  const observations = collectAllObservations();
  const allItems = [...AppState.config.activities, ...AppState.config.studies];
  const { analysis, globalWordFreq, docCounts } = analyzeObservationPatterns(observations);

  // Build filter options
  const itemsWithObs = allItems.filter(item => (observations[item.id] || []).length > 0);
  const filterOptionsHtml = `<option value="all">All Items</option>` +
    `<option value="activities">— All Activities —</option>` +
    AppState.config.activities.filter(i => (observations[i.id] || []).length > 0)
      .map(i => `<option value="${i.id}">&nbsp;&nbsp;${i.name} (${observations[i.id].length})</option>`).join('') +
    `<option value="studies">— All Studies —</option>` +
    AppState.config.studies.filter(i => (observations[i.id] || []).length > 0)
      .map(i => `<option value="${i.id}">&nbsp;&nbsp;${i.name} (${observations[i.id].length})</option>`).join('');

  // Build word cloud data (top 30 words)
  const sortedWords = Object.entries(globalWordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30);
  const maxFreq = sortedWords.length > 0 ? sortedWords[0][1] : 1;
  const wordCloudHtml = sortedWords.map(([word, freq]) => {
    const size = Math.max(0.7, Math.min(2.2, 0.7 + (freq / maxFreq) * 1.5));
    const opacity = Math.max(0.5, freq / maxFreq);
    const hue = Math.round(170 + (freq / maxFreq) * 60); // teal to blue gradient
    return `<span class="word-cloud-word" style="font-size:${size}rem;opacity:${opacity};color:hsl(${hue},65%,65%)" title="${word}: ${freq}x">${word}</span>`;
  }).join('');

  // AI analysis HTML
  const aiHtml = analysis.length > 0
    ? analysis.slice(0, 8).map(i => `<div class="ai-insight ${i.type}"><span class="ai-insight-icon">${i.icon}</span><div class="ai-insight-text">${i.text}</div></div>`).join('')
    : '<div class="ai-insight success"><span class="ai-insight-icon">✨</span><div class="ai-insight-text">Not enough data yet. Keep tracking with detailed observations!</div></div>';

  // Documentation rate by item (for radar/bar chart)
  const docRateData = allItems.filter(i => i.frequency !== 'optional').map(item => {
    let doneCount = 0;
    Object.values(AppState.history).forEach(record => {
      const cat = item.category === 'activities' ? 'activities' : 'studies';
      if (record[cat]?.[item.id]?.done) doneCount++;
    });
    const obsCount = (observations[item.id] || []).length;
    return {
      name: item.name,
      category: item.category,
      doneCount,
      obsCount,
      rate: doneCount > 0 ? Math.round((obsCount / doneCount) * 100) : 0,
    };
  }).filter(d => d.doneCount > 0);

  // Total observations count
  const totalObs = Object.values(observations).reduce((sum, arr) => sum + arr.length, 0);
  const totalDone = Object.values(AppState.history).reduce((sum, record) => {
    let c = 0;
    ['activities', 'studies'].forEach(cat => {
      Object.values(record[cat] || {}).forEach(v => { if (v.done) c++; });
    });
    return sum + c;
  }, 0);
  const globalRate = totalDone > 0 ? Math.round((totalObs / totalDone) * 100) : 0;

  container.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card" style="--stat-color: var(--accent-primary)">
        <div class="stat-label">Total Observations</div>
        <div class="stat-value">${totalObs}</div>
        <div class="stat-sub">across all items</div>
      </div>
      <div class="stat-card" style="--stat-color: var(--accent-blue)">
        <div class="stat-label">Documentation Rate</div>
        <div class="stat-value">${globalRate}%</div>
        <div class="stat-sub">completions with details</div>
      </div>
      <div class="stat-card" style="--stat-color: var(--accent-green)">
        <div class="stat-label">Items Documented</div>
        <div class="stat-value">${itemsWithObs.length}</div>
        <div class="stat-sub">out of ${allItems.length} total</div>
      </div>
      <div class="stat-card" style="--stat-color: var(--accent-purple)">
        <div class="stat-label">Top Documented</div>
        <div class="stat-value" style="font-size:1.2rem">${docCounts.length > 0 ? docCounts[0].item.name : '—'}</div>
        <div class="stat-sub">${docCounts.length > 0 ? docCounts[0].count + ' entries' : 'no data'}</div>
      </div>
    </div>

    <div class="ai-panel" style="margin-bottom:24px">
      <div class="ai-header">
        <span class="ai-badge">AI Analysis</span>
        <span class="ai-title">Observation Intelligence</span>
      </div>
      <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:16px">
        Patterns, trends, and recommendations based on your observation data and documentation habits.
      </p>
      ${aiHtml}
    </div>

    <div class="dashboard-grid">
      <div class="card">
        <div class="card-header">
          <div class="card-title"><span class="icon">☁️</span> Word Cloud</div>
          <span style="font-size:0.78rem;color:var(--text-muted)">${sortedWords.length} terms</span>
        </div>
        <div class="word-cloud-container">${wordCloudHtml || '<span style="color:var(--text-muted)">No observations yet</span>'}</div>
      </div>
      <div class="card">
        <div class="card-header">
          <div class="card-title"><span class="icon">📊</span> Documentation Rate</div>
        </div>
        <div class="chart-container"><canvas id="chart-obs-rate"></canvas></div>
      </div>
      <div class="card">
        <div class="card-header">
          <div class="card-title"><span class="icon">🕸️</span> Coverage Radar</div>
        </div>
        <div class="chart-container"><canvas id="chart-obs-radar"></canvas></div>
      </div>
      <div class="card">
        <div class="card-header">
          <div class="card-title"><span class="icon">📈</span> Observation Timeline</div>
        </div>
        <div class="chart-container"><canvas id="chart-obs-timeline"></canvas></div>
      </div>
    </div>

    <div class="card" style="margin-top:20px">
      <div class="card-header">
        <div class="card-title"><span class="icon">🔎</span> Observation Explorer</div>
        <div style="display:flex;gap:8px;align-items:center">
          <select class="form-select" id="obs-filter" onchange="filterObservations()" style="min-width:220px">
            ${filterOptionsHtml}
          </select>
          <input type="text" class="form-input" id="obs-search" placeholder="Search observations..." 
            oninput="filterObservations()" style="width:200px">
        </div>
      </div>
      <div class="scroll-inner" id="observations-list" style="max-height:600px">
        ${renderObservationsList(observations, allItems, 'all', '')}
      </div>
    </div>
  `;

  // Render charts
  setTimeout(() => {
    renderObsRateChart(docRateData);
    renderObsRadarChart(docRateData);
    renderObsTimelineChart(observations);
  }, 50);
}

function renderObservationsList(observations, allItems, filterValue, searchTerm) {
  let items = allItems;
  
  if (filterValue === 'activities') {
    items = AppState.config.activities;
  } else if (filterValue === 'studies') {
    items = AppState.config.studies;
  } else if (filterValue !== 'all') {
    items = allItems.filter(i => i.id === filterValue);
  }

  const search = searchTerm.toLowerCase().trim();
  let html = '';
  let totalShown = 0;

  items.forEach(item => {
    let obs = (observations[item.id] || []).slice().reverse(); // newest first
    
    if (search) {
      obs = obs.filter(o => o.detail.toLowerCase().includes(search) || o.date.includes(search));
    }

    if (obs.length === 0) return;
    totalShown += obs.length;

    const freqMeta = FREQUENCY_META[item.frequency];
    html += `
      <div class="obs-group">
        <div class="obs-group-header" onclick="this.parentElement.classList.toggle('collapsed')">
          <div class="obs-group-info">
            <span class="obs-group-name">${item.name}</span>
            <span class="activity-tag ${freqMeta.tagClass}" style="font-size:0.6rem">${freqMeta.label}</span>
            <span class="obs-group-count">${obs.length} observation${obs.length !== 1 ? 's' : ''}</span>
          </div>
          <span class="obs-group-chevron">▾</span>
        </div>
        <div class="obs-group-body">
          ${obs.slice(0, 50).map(o => `
            <div class="obs-entry" onclick="jumpToDate('${o.date}');renderPage('today')">
              <span class="obs-entry-date">${formatDate(o.date)}</span>
              <span class="obs-entry-detail">${escapeHtml(o.detail)}</span>
              <span class="obs-entry-status ${o.done ? 'done' : ''}">${o.done ? '✓' : '○'}</span>
            </div>
          `).join('')}
          ${obs.length > 50 ? `<div class="obs-entry" style="justify-content:center;color:var(--text-muted);font-style:italic">...and ${obs.length - 50} more</div>` : ''}
        </div>
      </div>
    `;
  });

  if (totalShown === 0) {
    html = '<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-text">No observations found. Add details when completing activities!</div></div>';
  }

  return html;
}

function filterObservations() {
  const filterValue = document.getElementById('obs-filter')?.value || 'all';
  const searchTerm = document.getElementById('obs-search')?.value || '';
  const observations = collectAllObservations();
  const allItems = [...AppState.config.activities, ...AppState.config.studies];
  const listEl = document.getElementById('observations-list');
  if (listEl) {
    listEl.innerHTML = renderObservationsList(observations, allItems, filterValue, searchTerm);
  }
}

function renderObsRateChart(docRateData) {
  if (docRateData.length === 0) return;
  const labels = docRateData.map(d => d.name);
  const data = docRateData.map(d => d.rate);
  const colors = docRateData.map(d => d.category === 'activities' ? '#4ecdc488' : '#6c9fff88');
  const borders = docRateData.map(d => d.category === 'activities' ? '#4ecdc4' : '#6c9fff');

  createChart('chart-obs-rate', {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Documentation Rate %',
        data,
        backgroundColor: colors,
        borderColor: borders,
        borderWidth: 1,
        borderRadius: 4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      scales: {
        x: { beginAtZero: true, max: 100, ticks: { color: '#8b92a8', font: { family: 'JetBrains Mono', size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
        y: { ticks: { color: '#8b92a8', font: { family: 'Outfit', size: 10 } }, grid: { display: false } }
      },
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: '#1a1e28' }
      }
    }
  });
}

function renderObsRadarChart(docRateData) {
  if (docRateData.length < 3) return;
  const top = docRateData.slice(0, 8);
  const labels = top.map(d => d.name);

  createChart('chart-obs-radar', {
    type: 'radar',
    data: {
      labels,
      datasets: [
        {
          label: 'Observations',
          data: top.map(d => d.obsCount),
          borderColor: '#4ecdc4',
          backgroundColor: 'rgba(78, 205, 196, 0.15)',
          pointBackgroundColor: '#4ecdc4',
          pointBorderWidth: 0,
          pointRadius: 4,
        },
        {
          label: 'Completions',
          data: top.map(d => d.doneCount),
          borderColor: '#a78bfa',
          backgroundColor: 'rgba(167, 139, 250, 0.1)',
          pointBackgroundColor: '#a78bfa',
          pointBorderWidth: 0,
          pointRadius: 4,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          ticks: { color: '#8b92a8', backdropColor: 'transparent', font: { size: 9 } },
          grid: { color: 'rgba(255,255,255,0.06)' },
          angleLines: { color: 'rgba(255,255,255,0.06)' },
          pointLabels: { color: '#8b92a8', font: { family: 'Outfit', size: 10 } }
        }
      },
      plugins: {
        legend: { labels: { color: '#8b92a8', font: { family: 'Outfit', size: 11 } } },
        tooltip: { backgroundColor: '#1a1e28' }
      }
    }
  });
}

function renderObsTimelineChart(observations) {
  // Group observations by week
  const allObs = [];
  Object.entries(observations).forEach(([itemId, obs]) => {
    obs.forEach(o => allObs.push(o));
  });
  
  if (allObs.length === 0) return;

  allObs.sort((a, b) => a.date.localeCompare(b.date));
  
  // Group by week
  const weekMap = {};
  allObs.forEach(o => {
    const week = getWeekRange(o.date);
    const key = week.start;
    weekMap[key] = (weekMap[key] || 0) + 1;
  });

  const weeks = Object.keys(weekMap).sort().slice(-12); // last 12 weeks
  const labels = weeks.map(w => formatDateShort(w));
  const data = weeks.map(w => weekMap[w] || 0);

  createChart('chart-obs-timeline', {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Observations per week',
        data,
        borderColor: '#4ecdc4',
        backgroundColor: 'rgba(78, 205, 196, 0.12)',
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: '#4ecdc4',
        pointBorderWidth: 0,
        pointHoverRadius: 8,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, ticks: { color: '#8b92a8', stepSize: 1, font: { family: 'JetBrains Mono', size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
        x: { ticks: { color: '#8b92a8', font: { family: 'JetBrains Mono', size: 10 } }, grid: { display: false } }
      },
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: '#1a1e28' }
      }
    }
  });
}

// ========== ENHANCED DASHBOARD CHARTS ==========

function renderHeatmapForDashboard(containerId, category) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const today = todayStr();
  const startDate = addDays(today, -90); // last ~3 months
  const dates = getDatesInRange(startDate, today);
  
  let html = '<div class="heatmap-grid">';
  dates.forEach(date => {
    const completion = calcDayCompletion(date, category);
    let level = 0;
    if (completion > 0) level = 1;
    if (completion >= 25) level = 2;
    if (completion >= 50) level = 3;
    if (completion >= 75) level = 4;
    if (completion >= 100) level = 5;
    html += `<div class="heatmap-cell level-${level}" title="${formatDate(date)}: ${completion}%"></div>`;
  });
  html += '</div>';
  html += `<div class="heatmap-legend">
    <span>Less</span>
    <div class="heatmap-cell level-1" style="width:12px;height:12px"></div>
    <div class="heatmap-cell level-2" style="width:12px;height:12px"></div>
    <div class="heatmap-cell level-3" style="width:12px;height:12px"></div>
    <div class="heatmap-cell level-4" style="width:12px;height:12px"></div>
    <div class="heatmap-cell level-5" style="width:12px;height:12px"></div>
    <span>More</span>
  </div>`;
  
  container.innerHTML = html;
}

// ========== SETTINGS PAGE ==========

function renderSettingsPage() {
  const container = document.getElementById('page-settings');
  
  const freqOptionsHtml = FREQUENCY_OPTIONS.map(f => `<option value="${f.value}">${f.label}</option>`).join('');

  let activitiesConfig = AppState.config.activities.map((item, idx) => `
    <div class="config-item">
      <div>
        <div class="config-item-name">${item.name}</div>
        <div class="config-item-desc">Placeholder: ${item.placeholder}</div>
      </div>
      <select class="form-select priority-select" onchange="updateItemFrequency('activities', ${idx}, this.value)">
        ${FREQUENCY_OPTIONS.map(f => `<option value="${f.value}" ${item.frequency === f.value ? 'selected' : ''}>${f.label}</option>`).join('')}
      </select>
    </div>
  `).join('');

  let studiesConfig = AppState.config.studies.map((item, idx) => `
    <div class="config-item">
      <div>
        <div class="config-item-name">${item.name}</div>
        <div class="config-item-desc">Placeholder: ${item.placeholder}</div>
      </div>
      <select class="form-select priority-select" onchange="updateItemFrequency('studies', ${idx}, this.value)">
        ${FREQUENCY_OPTIONS.map(f => `<option value="${f.value}" ${item.frequency === f.value ? 'selected' : ''}>${f.label}</option>`).join('')}
      </select>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="card" style="margin-bottom:24px">
      <div class="card-header">
        <div class="card-title"><span class="icon">⚙️</span> Priority Configuration</div>
      </div>
      <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:20px">
        Change the frequency/priority of any activity or study subject. For example, move Mathematics from Optional to Weekly when you're ready to make it mandatory.
      </p>
      
      <div class="config-section">
        <div class="config-section-title">⚡ Activities</div>
        ${activitiesConfig}
      </div>

      <div class="config-section">
        <div class="config-section-title">📚 Studies</div>
        ${studiesConfig}
      </div>
    </div>

    <div class="card" style="margin-bottom:24px">
      <div class="card-header">
        <div class="card-title"><span class="icon">➕</span> Add New Item</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr auto auto;gap:12px;align-items:end;">
        <div class="form-group" style="margin:0">
          <label class="form-label">Name</label>
          <input type="text" class="form-input" id="new-item-name" placeholder="Item name">
        </div>
        <div class="form-group" style="margin:0">
          <label class="form-label">Placeholder</label>
          <input type="text" class="form-input" id="new-item-placeholder" placeholder="Detail hint">
        </div>
        <div class="form-group" style="margin:0">
          <label class="form-label">Category</label>
          <select class="form-select" id="new-item-category">
            <option value="activities">Activities</option>
            <option value="studies">Studies</option>
          </select>
        </div>
        <div class="form-group" style="margin:0">
          <label class="form-label">Frequency</label>
          <select class="form-select" id="new-item-frequency">${freqOptionsHtml}</select>
        </div>
        <button class="btn btn-primary" onclick="addNewItem()" style="height:38px">Add</button>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title"><span class="icon">🔄</span> Reset</div>
      </div>
      <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:16px">
        Restore all configuration to defaults. This won't delete your history data.
      </p>
      <button class="btn btn-danger" onclick="resetConfig()">Reset to Defaults</button>
    </div>
  `;
}

function updateItemFrequency(category, index, newFrequency) {
  AppState.config[category][index].frequency = newFrequency;
  saveToLocalStorage();
  showToast(`Updated ${AppState.config[category][index].name} to ${FREQUENCY_META[newFrequency].label}`, 'success');
}

function addNewItem() {
  const name = document.getElementById('new-item-name').value.trim();
  const placeholder = document.getElementById('new-item-placeholder').value.trim() || 'details';
  const category = document.getElementById('new-item-category').value;
  const frequency = document.getElementById('new-item-frequency').value;

  if (!name) { showToast('Please enter a name', 'warning'); return; }

  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  if (getAllItems(category).find(i => i.id === id)) {
    showToast('An item with a similar name already exists', 'warning');
    return;
  }

  const newItem = {
    id,
    name,
    placeholder,
    frequency,
    category,
    group: frequency === 'optional' ? 'optional' : 'mandatory',
  };

  AppState.config[category].push(newItem);
  saveToLocalStorage();
  showToast(`Added "${name}" to ${category}`, 'success');
  renderSettingsPage();
}

function resetConfig() {
  if (confirm('Reset all configuration to defaults? Your history data will be preserved.')) {
    AppState.config.activities = deepClone(DEFAULT_ACTIVITIES);
    AppState.config.studies = deepClone(DEFAULT_STUDIES);
    saveToLocalStorage();
    showToast('Configuration reset to defaults', 'success');
    renderSettingsPage();
  }
}

// ========== DATA MANAGEMENT PAGE ==========

function renderDataPage() {
  const container = document.getElementById('page-data');
  const recordCount = Object.keys(AppState.history).length;
  const dataSize = new Blob([JSON.stringify(AppState.history)]).size;
  const sizeStr = dataSize > 1024 ? `${(dataSize / 1024).toFixed(1)} KB` : `${dataSize} B`;

  container.innerHTML = `
    <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr)">
      <div class="stat-card" style="--stat-color: var(--accent-primary)">
        <div class="stat-label">Days Tracked</div>
        <div class="stat-value">${recordCount}</div>
      </div>
      <div class="stat-card" style="--stat-color: var(--accent-blue)">
        <div class="stat-label">Data Size</div>
        <div class="stat-value">${sizeStr}</div>
      </div>
      <div class="stat-card" style="--stat-color: var(--accent-green)">
        <div class="stat-label">Storage</div>
        <div class="stat-value">Local</div>
        <div class="stat-sub">localStorage + JSON export</div>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="card">
        <div class="card-header">
          <div class="card-title"><span class="icon">⬇️</span> Export Data</div>
        </div>
        <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:16px">
          Download all your data as a JSON file. This includes history and configuration.
        </p>
        <button class="btn btn-primary" onclick="exportToJSON()">⬇ Export JSON</button>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title"><span class="icon">⬆️</span> Import Data</div>
        </div>
        <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:16px">
          Upload a previously exported JSON file. New data will be merged with existing records.
        </p>
        <div class="upload-zone" id="upload-zone" onclick="document.getElementById('file-input').click()">
          <div class="upload-zone-icon">📁</div>
          <div class="upload-zone-text">Click to select JSON file</div>
          <div class="upload-zone-hint">or drag and drop here</div>
        </div>
        <input type="file" id="file-input" accept=".json" style="display:none" onchange="handleFileUpload(event)">
      </div>

      <div class="card full-width">
        <div class="card-header">
          <div class="card-title"><span class="icon">⚠️</span> Danger Zone</div>
        </div>
        <div style="display:flex;gap:12px">
          <button class="btn btn-danger" onclick="clearAllHistory()">🗑 Clear All History</button>
          <button class="btn btn-danger" onclick="clearAllData()">💣 Factory Reset</button>
        </div>
      </div>
    </div>
  `;

  // Drag and drop
  const zone = document.getElementById('upload-zone');
  if (zone) {
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.style.borderColor = 'var(--accent-primary)'; });
    zone.addEventListener('dragleave', () => { zone.style.borderColor = ''; });
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.style.borderColor = '';
      if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
    });
  }
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) handleFile(file);
}

function handleFile(file) {
  if (!file.name.endsWith('.json')) {
    showToast('Please upload a JSON file', 'warning');
    return;
  }
  importFromJSON(file).then(() => {
    renderPage(AppState.currentPage);
  });
}

function clearAllHistory() {
  if (confirm('Delete ALL history data? This cannot be undone.')) {
    AppState.history = {};
    saveToLocalStorage();
    showToast('All history cleared', 'warning');
    renderPage('data');
  }
}

function clearAllData() {
  if (confirm('FACTORY RESET: Delete ALL data and configuration? This cannot be undone.')) {
    localStorage.removeItem(STORAGE_KEY_HISTORY);
    localStorage.removeItem(STORAGE_KEY_CONFIG);
    AppState.history = {};
    AppState.config = { activities: [], studies: [] };
    initConfig();
    saveToLocalStorage();
    showToast('Factory reset complete', 'warning');
    renderPage('today');
  }
}

// ========== AUTO-LOAD LOGIC ==========

async function tryAutoLoadJSON() {
  // Try loading from a file served alongside the HTML (for local server setups)
  try {
    const response = await fetch(AUTO_JSON_PATH);
    if (response.ok) {
      const data = await response.json();
      if (data.history) {
        // Merge: local data takes precedence for same dates
        const merged = { ...data.history, ...AppState.history };
        AppState.history = merged;
      }
      if (data.config && Object.keys(AppState.config.activities).length === 0) {
        AppState.config = data.config;
      }
      saveToLocalStorage();
      console.log('Auto-loaded data from JSON file');
      return true;
    }
  } catch (e) {
    console.log('No auto-load JSON found (this is normal for standalone use)');
  }
  return false;
}

// ========== MOBILE SIDEBAR TOGGLE ==========

function toggleSidebar() {
  document.querySelector('.sidebar').classList.toggle('open');
}

// ========== INITIALIZATION ==========

document.addEventListener('DOMContentLoaded', async () => {
  // Load from localStorage first
  loadFromLocalStorage();
  
  // Initialize config
  initConfig();
  
  // Try auto-loading external JSON
  await tryAutoLoadJSON();
  
  // Ensure config is applied
  applyConfig();
  
  // Save initial state
  saveToLocalStorage();
  
  // Update date display
  document.getElementById('current-date-display').textContent = formatDate(AppState.currentDate);
  
  // Set up navigation
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', () => {
      renderPage(item.dataset.page);
      // Close mobile sidebar
      document.querySelector('.sidebar').classList.remove('open');
    });
  });
  
  // Render initial page
  renderPage('today');
  
  console.log('Life Dashboard initialized');
});
