// ===== State =====
let schedule = [];
let currentIndex = 0;
let myDances = [];

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
const myDancesModal = document.getElementById('myDancesModal');
const scheduleModal = document.getElementById('scheduleModal');
const jumpToModal = document.getElementById('jumpToModal');
const jumpToInput = document.getElementById('jumpToInput');
const jumpResults = document.getElementById('jumpResults');
const danceChips = document.getElementById('danceChips');
const scheduleList = document.getElementById('scheduleList');


// ===== Initialize =====
async function init() {
  await loadSchedule();
  loadMyDances();
  setupFirebaseSync();
  renderCurrentDance();
  renderCountdowns();
  renderDanceChips();
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
      return { entry, index };
    })
    .filter(d => d.index > currentIndex)
    .sort((a, b) => a.index - b.index);

  if (upcomingMyDances.length === 0) {
    countdownCards.innerHTML = '';
    emptyState.style.display = myDances.length === 0 ? 'block' : 'none';
    if (myDances.length > 0) {
      countdownCards.innerHTML = `
        <div class="empty-state">
          <p>All your dances are done! 🎉</p>
        </div>
      `;
    }
    return;
  }

  emptyState.style.display = 'none';
  countdownCards.innerHTML = upcomingMyDances.map((d, i) => {
    const dance = schedule[d.index];
    const dancesUntil = d.index - currentIndex;
    const isNext = i === 0;

    return `
      <div class="countdown-card">
        <div class="countdown-badge ${isNext ? 'next' : ''}">${dancesUntil}</div>
        <div class="countdown-info">
          <div class="countdown-label">${dancesUntil === 1 ? 'NEXT UP!' : `${dancesUntil} dances until`}</div>
          <div class="countdown-entry">${dance.entry}</div>
          <div class="countdown-title">${dance.title}</div>
        </div>
      </div>
    `;
  }).join('');
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

    let classes = 'schedule-item';
    if (isCurrent) classes += ' current';
    if (isPast) classes += ' past';
    if (isMyDance) classes += ' my-dance';

    return `
      <div class="${classes}">
        <div class="schedule-time">${dance.time}</div>
        <div class="schedule-entry">${dance.entry}</div>
        <div class="schedule-details">
          <div class="schedule-title">${dance.title}</div>
          <div class="schedule-studio">${dance.studio}</div>
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

  // My Dances Modal
  document.getElementById('myDancesBtn').addEventListener('click', () => {
    renderDanceChips();
    myDancesModal.classList.add('open');
  });

  document.getElementById('closeMyDances').addEventListener('click', () => {
    myDancesModal.classList.remove('open');
  });

  document.getElementById('saveMyDances').addEventListener('click', () => {
    saveMyDances();
    myDancesModal.classList.remove('open');
    renderCountdowns();
  });

  // Dance Chip Selection
  danceChips.addEventListener('click', (e) => {
    if (e.target.classList.contains('dance-chip')) {
      const entry = e.target.dataset.entry;
      if (myDances.includes(entry)) {
        myDances = myDances.filter(d => d !== entry);
        e.target.classList.remove('selected');
      } else {
        myDances.push(entry);
        e.target.classList.add('selected');
      }
    }
  });

  // Schedule Modal
  document.getElementById('scheduleBtn').addEventListener('click', () => {
    renderSchedule();
    scheduleModal.classList.add('open');
  });

  document.getElementById('closeSchedule').addEventListener('click', () => {
    scheduleModal.classList.remove('open');
  });

  // Close modals on backdrop click
  [myDancesModal, scheduleModal, jumpToModal].forEach(modal => {
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
