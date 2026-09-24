class FrontonRules extends SportRules {
  get name() { return 'Frontón'; }
  get icon() { return 'assets/images/shield-fronton.png'; }

  constructor() {
    super({ setsToWin: 1, pointsPerSet: 22, winBy: 1 });
  }

  initialState(playerA = 'Jugador 1', playerB = 'Jugador 2') {
    const state = super.initialState(playerA, playerB);
    state.sets = [];
    state.points = [0, 0];
    state.sets_won = [0, 0];
    return state;
  }

  _applyPoint(state, idx) {
    if (state.finished) return;
    state.points[idx]++;

    const target = this.config.pointsPerSet;
    const other = 1 - idx;

    // Frontón: primero en llegar a 22 (no hay win by)
    if (state.points[idx] >= target) {
      this._winMatch(state, idx);
      return;
    }

    state.server = idx;
  }

  _winMatch(state, idx) {
    state.sets.push({ a: state.points[0], b: state.points[1] });
    state.sets_won[idx]++;
    state.currentSet = state.sets.length;

    if (state.sets_won[idx] >= this.config.setsToWin) {
      state.finished = true;
      state.winner = idx;
    }
  }

  getContext(state) {
    if (state.finished) return { label: 'Finalizado', matchBall: false };
    const target = this.config.pointsPerSet;
    const a = state.points[0], b = state.points[1];

    const inMatchBall = a >= target - 1 || b >= target - 1;
    if (inMatchBall) return { label: 'PUNTO DE PARTIDO', matchBall: true };
    return { label: `A ${target} PUNTOS`, matchBall: false };
  }
}