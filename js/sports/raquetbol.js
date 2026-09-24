class RaquetbolRules extends SportRules {
  get name() { return 'Raquetbol'; }
  get icon() { return 'assets/images/shield-raquetbol.png'; }

  constructor() {
    super({ setsToWin: 2, pointsPerSet: 15, winBy: 2 });
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
    const winBy = this.config.winBy;
    const other = 1 - idx;

    const setWon = state.points[idx] >= target && state.points[idx] - state.points[other] >= winBy;
    if (setWon) return this._winSet(state, idx);

    state.server = idx;
  }

  _winSet(state, idx) {
    state.sets.push({ a: state.points[0], b: state.points[1] });
    state.sets_won[idx]++;
    state.points = [0, 0];
    state.currentSet = state.sets.length;

    if (state.sets_won[idx] >= this.config.setsToWin) {
      state.finished = true;
      state.winner = idx;
      return;
    }
    state.server = idx;
  }

  getContext(state) {
    if (state.finished) return { label: 'Finalizado', matchBall: false };
    const a = state.points[0], b = state.points[1];
    const target = this.config.pointsPerSet;
    const winBy = this.config.winBy;

    const inMatchBall =
      (state.sets_won[0] === this.config.setsToWin - 1 && a >= target - 1) ||
      (state.sets_won[1] === this.config.setsToWin - 1 && b >= target - 1);

    const inGameBall =
      (a >= target - 1 && a - b >= winBy - 1) ||
      (b >= target - 1 && b - a >= winBy - 1);

    if (inMatchBall) return { label: 'MATCH POINT', matchBall: true };
    if (inGameBall) return { label: 'GAME POINT', matchBall: false };
    if (a >= 14 && b >= 14) return { label: 'DEUCE · win by 2', matchBall: false };
    return { label: `SET ${state.currentSet + 1} · a 15`, matchBall: false };
  }
}