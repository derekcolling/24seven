// ===== State =====
let schedule = [];
let currentIndex = 0;
let myDances = [];
let watchList = [];

// ===== Icons (from better-icons) =====
const icons = {
  calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>`,
  sparkles: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>`,
  eye: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`,
  chevronLeft: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>`,
  chevronRight: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`,
  x: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
  plus: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`
};

// ===== DOM Elements =====
const currentNumber = document.getElementById('currentNumber');
const currentTitle = document.getElementById('currentTitle');
const currentStudio = document.getElementById('currentStudio');
const currentCategory = document.getElementById('currentCategory');
const currentDanceCard = document.getElementById('currentDanceCard');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const countdownCards = document.getElementById('countdownCards');
const emptyState = document.getElementById('emptyState');
const scheduleModal = document.getElementById('scheduleModal');
const jumpToModal = document.getElementById('jumpToModal');
const jumpToInput = document.getElementById('jumpToInput');
const jumpResults = document.getElementById('jumpResults');
const scheduleList = document.getElementById('scheduleList');


// ===== Initialize =====
async function init() {
  await loadSchedule();
  loadMyDances();
  loadWatchList();
  setupFirebaseSync();
  renderCurrentDance();
  renderCountdowns();
  setupEventListeners();
  registerServiceWorker();
}

// ===== Load Schedule from JSON =====
async function loadSchedule() {
  try {
    const response = await fetch('schedules/tulsa_saturday_2026.json');
    schedule = await response.json();
    // Filter out breaks and awards for navigation
    schedule = schedule.filter(d => d.entry.startsWith('#'));
  } catch (error) {
    console.error('Failed to load schedule:', error);
  }
}

// ===== Local Storage =====
function loadMyDances() {
  const saved = localStorage.getItem('myDances');
  myDances = saved ? JSON.parse(saved) : [];
}

function saveMyDances() {
  localStorage.setItem('myDances', JSON.stringify(myDances));
}

function loadWatchList() {
  const saved = localStorage.getItem('watchList');
  watchList = saved ? JSON.parse(saved) : [];
}

function saveWatchList() {
  localStorage.setItem('watchList', JSON.stringify(watchList));
}

function loadCurrentIndex() {
  const saved = localStorage.getItem('currentIndex');
  if (saved !== null) {
    currentIndex = parseInt(saved, 10);
    if (currentIndex >= schedule.length) currentIndex = 0;
  }
}

function saveCurrentIndex() {
  localStorage.setItem('currentIndex', currentIndex.toString());
  // Sync to Firebase for all users
  if (window.db) {
    window.db.ref('currentDance').set({
      index: currentIndex,
      updatedAt: Date.now()
    });
  }
}

// ===== Firebase Real-time Sync =====
function setupFirebaseSync() {
  if (!window.db) {
    console.warn('Firebase not available, using local storage only');
    return;
  }

  // Listen for changes from other users
  window.db.ref('currentDance').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data && typeof data.index === 'number') {
      // Only update if different from current
      if (data.index !== currentIndex && data.index >= 0 && data.index < schedule.length) {
        currentIndex = data.index;
        localStorage.setItem('currentIndex', currentIndex.toString());
        renderCurrentDance();
        renderCountdowns();
      }
    }
  });
}

// ===== Render Current Dance =====
function renderCurrentDance() {
  loadCurrentIndex();
  const dance = schedule[currentIndex];
  if (!dance) return;

  currentNumber.textContent = dance.entry;
  currentTitle.textContent = dance.title;
  currentStudio.textContent = dance.studio;
  currentCategory.textContent = dance.category;

  // Update button states
  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = currentIndex === schedule.length - 1;
}

// ===== Render Countdown Cards =====
function renderCountdowns() {
  // Find my dances that are after the current dance
  const upcomingMyDances = myDances
    .map(entry => {
      const index = schedule.findIndex(d => d.entry === entry);
      return { entry, index, type: 'myDancer' };
    })
    .filter(d => d.index > currentIndex)
    .sort((a, b) => a.index - b.index);

  // Find watched dances that are after the current dance
  const upcomingWatchDances = watchList
    .map(entry => {
      const index = schedule.findIndex(d => d.entry === entry);
      return { entry, index, type: 'watch' };
    })
    .filter(d => d.index > currentIndex)
    .sort((a, b) => a.index - b.index);

  const hasNoDances = upcomingMyDances.length === 0 && upcomingWatchDances.length === 0;
  const hasNoSavedDances = myDances.length === 0 && watchList.length === 0;

  if (hasNoDances) {
    countdownCards.innerHTML = '';
    emptyState.style.display = hasNoSavedDances ? 'block' : 'none';
    if (!hasNoSavedDances) {
      countdownCards.innerHTML = `
        <div class="empty-state">
          <p>All your dances are done! 🎉</p>
        </div>
      `;
    }
    return;
  }

  emptyState.style.display = 'none';

  let html = '';

  // My Dancer dances
  if (upcomingMyDances.length > 0) {
    html += '<div class="countdown-section"><div class="countdown-section-label">MY DANCER</div>';
    html += upcomingMyDances.map((d, i) => {
      const dance = schedule[d.index];
      const dancesUntil = d.index - currentIndex;
      const isNext = i === 0;

      return `
        <div class="countdown-card my-dancer">
          <div class="countdown-badge ${isNext ? 'next' : ''}">${dancesUntil}</div>
          <div class="countdown-info">
            <div class="countdown-label">${dancesUntil === 1 ? 'NEXT UP!' : `${dancesUntil} dances until`}</div>
            <div class="countdown-entry">${dance.entry}</div>
            <div class="countdown-title">${dance.title}</div>
          </div>
        </div>
      `;
    }).join('');
    html += '</div>';
  }

  // Watch list dances
  if (upcomingWatchDances.length > 0) {
    html += '<div class="countdown-section"><div class="countdown-section-label">WATCHING</div>';
    html += upcomingWatchDances.map((d, i) => {
      const dance = schedule[d.index];
      const dancesUntil = d.index - currentIndex;
      const isFirst = i === 0;

      return `
        <div class="countdown-card watching">
          <div class="countdown-badge watch ${isFirst ? 'next-watch' : ''}">${dancesUntil}</div>
          <div class="countdown-info">
            <div class="countdown-label">${dancesUntil === 1 ? 'COMING UP!' : `${dancesUntil} dances until`}</div>
            <div class="countdown-entry">${dance.entry}</div>
            <div class="countdown-title">${dance.title}</div>
          </div>
        </div>
      `;
    }).join('');
    html += '</div>';
  }

  countdownCards.innerHTML = html;
}


// ===== Render Dance Chips (My Dances Modal) =====
function renderDanceChips() {
  danceChips.innerHTML = schedule.map(dance => {
    const isSelected = myDances.includes(dance.entry);
    return `
      <button class="dance-chip ${isSelected ? 'selected' : ''}" data-entry="${dance.entry}">
        ${dance.entry}
      </button>
    `;
  }).join('');
}

// ===== Render Full Schedule =====
function renderSchedule() {
  scheduleList.innerHTML = schedule.map((dance, index) => {
    const isCurrent = index === currentIndex;
    const isPast = index < currentIndex;
    const isMyDance = myDances.includes(dance.entry);
    const isWatching = watchList.includes(dance.entry);

    let classes = 'schedule-item';
    if (isCurrent) classes += ' current';
    if (isPast) classes += ' past';
    if (isMyDance) classes += ' my-dance';
    if (isWatching) classes += ' watching';

    return `
      <div class="${classes}" data-entry="${dance.entry}">
        <div class="schedule-main">
          <div class="schedule-time">${dance.time}</div>
          <div class="schedule-entry">${dance.entry}</div>
          <div class="schedule-details">
            <div class="schedule-title">${dance.title}</div>
            <div class="schedule-studio">${dance.studio}</div>
          </div>
        </div>
        <div class="schedule-actions">
          <button class="schedule-action-btn my-dancer-btn ${isMyDance ? 'active' : ''}" data-entry="${dance.entry}" data-type="myDancer" title="My Dancer">
            ${icons.sparkles}
          </button>
          <button class="schedule-action-btn watch-btn ${isWatching ? 'active' : ''}" data-entry="${dance.entry}" data-type="watch" title="Watch">
            ${icons.eye}
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Scroll to current dance
  setTimeout(() => {
    const currentItem = scheduleList.querySelector('.current');
    if (currentItem) {
      currentItem.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, 100);
}


// ===== Event Listeners =====
function setupEventListeners() {
  // Navigation
  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      saveCurrentIndex();
      renderCurrentDance();
      renderCountdowns();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (currentIndex < schedule.length - 1) {
      currentIndex++;
      saveCurrentIndex();
      renderCurrentDance();
      renderCountdowns();
    }
  });

  // Jump To Modal - Open on card tap
  currentDanceCard.addEventListener('click', () => {
    jumpToInput.value = '';
    renderJumpResults('');
    jumpToModal.classList.add('open');
    setTimeout(() => jumpToInput.focus(), 100);
  });

  // Jump To Modal - Search input
  jumpToInput.addEventListener('input', (e) => {
    renderJumpResults(e.target.value);
  });

  // Jump To Modal - Select a dance
  jumpResults.addEventListener('click', (e) => {
    const item = e.target.closest('.jump-result-item');
    if (item) {
      const index = parseInt(item.dataset.index, 10);
      currentIndex = index;
      saveCurrentIndex();
      renderCurrentDance();
      renderCountdowns();
      jumpToModal.classList.remove('open');
    }
  });

  // Jump To Modal - Close
  document.getElementById('closeJumpTo').addEventListener('click', () => {
    jumpToModal.classList.remove('open');
  });

  // Schedule Modal
  document.getElementById('scheduleBtn').addEventListener('click', () => {
    renderSchedule();
    scheduleModal.classList.add('open');
  });

  document.getElementById('closeSchedule').addEventListener('click', () => {
    scheduleModal.classList.remove('open');
  });

  // Drag handle to close schedule modal
  document.getElementById('scheduleModalHandle').addEventListener('click', () => {
    scheduleModal.classList.remove('open');
  });

  // Drag handle to close jump to modal
  document.getElementById('jumpToModalHandle').addEventListener('click', () => {
    jumpToModal.classList.remove('open');
  });

  // Schedule Action Buttons (My Dancer / Watch)
  scheduleList.addEventListener('click', (e) => {
    const btn = e.target.closest('.schedule-action-btn');
    if (!btn) return;

    const entry = btn.dataset.entry;
    const type = btn.dataset.type;

    if (type === 'myDancer') {
      if (myDances.includes(entry)) {
        myDances = myDances.filter(d => d !== entry);
        btn.classList.remove('active');
      } else {
        myDances.push(entry);
        btn.classList.add('active');
      }
      saveMyDances();
      renderCountdowns();

      // Update my-dance class on the schedule item
      const item = btn.closest('.schedule-item');
      item.classList.toggle('my-dance', myDances.includes(entry));
    } else if (type === 'watch') {
      if (watchList.includes(entry)) {
        watchList = watchList.filter(d => d !== entry);
        btn.classList.remove('active');
      } else {
        watchList.push(entry);
        btn.classList.add('active');
      }
      saveWatchList();
      renderCountdowns();

      // Update watching class on the schedule item
      const item = btn.closest('.schedule-item');
      item.classList.toggle('watching', watchList.includes(entry));
    }
  });


  // Close modals on backdrop click
  [scheduleModal, jumpToModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
      }
    });
  });
}

// ===== Render Jump Results =====
function renderJumpResults(query) {
  const q = query.trim().replace('#', '');

  // If empty, show all dances
  let results = schedule;

  // If query provided, filter by entry number
  if (q) {
    results = schedule.filter(d => {
      const num = d.entry.replace('#', '');
      return num.includes(q) || d.title.toLowerCase().includes(q.toLowerCase());
    });
  }

  // Limit to 20 results for performance
  results = results.slice(0, 20);

  if (results.length === 0) {
    jumpResults.innerHTML = `
      <div class="empty-state">
        <p>No dances found for "${query}"</p>
      </div>
    `;
    return;
  }

  jumpResults.innerHTML = results.map(dance => {
    const index = schedule.findIndex(d => d.entry === dance.entry);
    return `
      <div class="jump-result-item" data-index="${index}">
        <div class="jump-result-entry">${dance.entry}</div>
        <div class="jump-result-details">
          <div class="jump-result-title">${dance.title}</div>
          <div class="jump-result-studio">${dance.studio}</div>
        </div>
      </div>
    `;
  }).join('');
}


// ===== Service Worker Registration =====
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log('Service Worker registered'))
      .catch(err => console.log('Service Worker registration failed:', err));
  }
}

// ===== Start App =====
init();
