class SportRules {
  constructor(config = {}) {
    this.config = {
      setsToWin: 2,
      pointsPerSet: 21,
      winBy: 2,
      hasTieBreak: false,
      ...config
    };
  }

  get name() { throw new Error('Debe implementarse'); }
  get icon() { return '🎾'; }

  initialState(playerA = 'Jugador 1', playerB = 'Jugador 2') {
    return {
      sport: this.name,
      players: [playerA, playerB],
      sets: [],
      currentSet: 0,
      points: [0, 0],
      games: [0, 0],
      sets_won: [0, 0],
      server: 0,
      tieBreak: false,
      tieBreakPoints: [0, 0],
      finished: false,
      winner: null,
      startedAt: Date.now(),
      history: []   // ← ahora guarda solo el estado SIN history
    };
  }

  addPoint(state, idx) {
    // Guardar snapshot SIN el propio historial (evita crecimiento exponencial)
    const snapshot = { ...state, history: [] };

    const next = JSON.parse(JSON.stringify(state));
    next.history.push(snapshot);

    // Límite razonable: últimos 100 puntos
    if (next.history.length > 100) next.history.shift();

    this._applyPoint(next, idx);
    return next;
  }

  undo(state) {
    if (!state.history || state.history.length === 0) return state;
    const prev = state.history.pop();
    // Restaurar manteniendo el historial restante
    return { ...prev, history: state.history };
  }

  _applyPoint() { throw new Error('Debe implementarse'); }
  displayScore(state) { return state.points.join(' - '); }
}