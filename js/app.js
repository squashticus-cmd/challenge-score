const SPORTS = {
  tennis:     new TennisRules(),
  squash:     new SquashRules(),
  padel:      new PadelRules(),
  badminton:  new BadmintonRules(),
  pickleball: new PickleballRules(),
  raquetbol:  new RaquetbolRules(),
  fronton:    new FrontonRules(),
  tenisMesa:  new TenisMesaRules()
};

const ChallengeScore = {
  version: '0.2.0',
  author: 'Squashner',
  currentSport: null,
  currentMatch: null,

  init() {
    this.renderSportGrid();
    this.bindEvents();
    this.registerSW();

    const saved = Storage.getCurrent();
    if (saved && !saved.finished) {
      const sp = SPORTS[saved.sport.toLowerCase()] || SPORTS.tennis;
      this.showMatch(saved, sp);
    }
  },

  registerSW() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  },

renderSportGrid() {
  const grid = document.getElementById('sport-grid');
  const disponibles = Object.entries(SPORTS).filter(([, v]) => v);
  grid.innerHTML = disponibles.map(([key, sport]) => `
    <button class="sport-card" data-sport="${key}">
      <img class="sport-icon" src="${sport.icon}" alt="${sport.name}" loading="lazy">
      <span class="sport-name">${sport.name}</span>
    </button>
  `).join('');
},

  bindEvents() {
    document.getElementById('sport-grid').addEventListener('click', e => {
      const card = e.target.closest('.sport-card');
      if (!card) return;
      this.pendingSport = SPORTS[card.dataset.sport];
      UI.showNewMatchModal(this.pendingSport);
    });

    document.getElementById('form-new-match').addEventListener('submit', e => {
      e.preventDefault();
      const p1 = document.getElementById('input-player1').value.trim() || 'Jugador 1';
      const p2 = document.getElementById('input-player2').value.trim() || 'Jugador 2';
      const bestOf = parseInt(document.getElementById('select-sets').value, 10);
      const setsToWin = Math.ceil(bestOf / 2);

      UI.hideNewMatchModal();
      this.startNewMatch(this.pendingSport, p1, p2, setsToWin);
    });

    document.getElementById('btn-cancel-new').onclick = () => UI.hideNewMatchModal();

    document.getElementById('btn-back').onclick = () => {
      Storage.saveCurrent(this.currentMatch);
      UI.showView('view-home');
    };

    document.getElementById('btn-history').onclick = () => {
      UI.showView('view-history');
      UI.renderHistory(Storage.getMatches());
    };

    document.getElementById('btn-back-history').onclick = () => UI.showView('view-home');

    document.getElementById('btn-clear-history').onclick = () => {
      if (confirm('¿Borrar todo el historial?')) {
        Storage.clearMatches();
        UI.renderHistory([]);
      }
    };

    document.getElementById('btn-menu').onclick = () => {
      if (confirm('¿Abandonar el partido actual? No se guardará.')) {
        Storage.saveCurrent(null);
        this.currentMatch = null;
        UI.showView('view-home');
      }
    };

    document.getElementById('btn-close-end').onclick = () => UI.hideEndModal();

    document.getElementById('btn-share-whatsapp').onclick = () => Share.whatsapp(this.currentMatch);
    document.getElementById('btn-share-native').onclick = () => Share.native(this.currentMatch);
    document.getElementById('btn-print').onclick = () => Share.print(this.currentMatch);
  },

  startNewMatch(sport, p1, p2, setsToWin) {
    this.currentSport = sport;
    sport.config.setsToWin = setsToWin;
    this.currentMatch = sport.initialState(p1, p2);
    Storage.saveCurrent(this.currentMatch);
    this.showMatch(this.currentMatch, sport);
  },

  showMatch(match, sport) {
    this.currentSport = sport;
    this.currentMatch = match;
    UI.showView('view-match');
    UI.renderScoreboard(match, sport);
    UI.renderControls(match, sport);
  },

  addPoint(idx) {
    this.currentMatch = this.currentSport.addPoint(this.currentMatch, idx);
    Storage.saveCurrent(this.currentMatch);

    if (this.currentMatch.finished) {
      Storage.saveMatch({ ...this.currentMatch, finishedAt: Date.now() });
      Storage.saveCurrent(null);
      UI.renderScoreboard(this.currentMatch, this.currentSport);
      UI.renderControls(this.currentMatch, this.currentSport);
      setTimeout(() => UI.showEndModal(this.currentMatch), 300);
      return;
    }

    UI.renderScoreboard(this.currentMatch, this.currentSport);
    UI.renderControls(this.currentMatch, this.currentSport);
  },

  undo() {
    this.currentMatch = this.currentSport.undo(this.currentMatch);
    Storage.saveCurrent(this.currentMatch);
    UI.hideEndModal();
    UI.renderScoreboard(this.currentMatch, this.currentSport);
    UI.renderControls(this.currentMatch, this.currentSport);
  }
};

document.addEventListener('DOMContentLoaded', () => ChallengeScore.init());