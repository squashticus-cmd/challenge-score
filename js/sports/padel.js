class PadelRules extends SportRules {
  get name() { return 'Pádel'; }
  get icon() { return 'assets/images/shield-padel.png'; }

  constructor() {
    super({ setsToWin: 2, hasTieBreak: true });
  }

  initialState(playerA = 'Jugador 1', playerB = 'Jugador 2') {
    const state = super.initialState(playerA, playerB);
    state.sets = [];
    state.games = [0, 0];
    return state;
  }

  _applyPoint(state, idx) {
    if (state.finished) return;
    const other = 1 - idx;

    if (state.tieBreak) {
      state.tieBreakPoints[idx]++;
      if (state.tieBreakPoints[idx] >= 7 &&
          state.tieBreakPoints[idx] - state.tieBreakPoints[other] >= 2) {
        this._winGame(state, idx, true);
      }
      return;
    }

    state.points[idx]++;
    const a = state.points[0];
    const b = state.points[1];

    if (a >= 4 && a - b >= 2) return this._winGame(state, 0, false);
    if (b >= 4 && b - a >= 2) return this._winGame(state, 1, false);

    if (a >= 3 && b >= 3) {
      if (a === b) state.points = [3, 3];
      else state.points = a > b ? [4, 3] : [3, 4];
    }
  }

  _winGame(state, idx, wasTieBreak) {
    const other = 1 - idx;

    if (wasTieBreak) {
      state.games[idx] = 7;
      state.games[other] = 6;
    } else {
      state.games[idx]++;
    }

    state.points = [0, 0];
    state.tieBreak = false;
    state.tieBreakPoints = [0, 0];

    const g = state.games;
    const setWon =
      (g[idx] >= 6 && g[idx] - g[other] >= 2) ||
      (g[idx] === 7 && g[other] === 6);

    if (setWon) {
      state.sets.push({ a: g[0], b: g[1] });
      state.sets_won = [0, 0];
      state.sets.forEach(s => {
        if (s.a > s.b) state.sets_won[0]++;
        else if (s.b > s.a) state.sets_won[1]++;
      });
      state.games = [0, 0];
      state.currentSet = state.sets.length;

      if (state.sets_won[idx] >= this.config.setsToWin) {
        state.finished = true;
        state.winner = idx;
        return;
      }
    } else if (g[0] === 6 && g[1] === 6) {
      state.tieBreak = true;
    }

    state.server = other;
  }

  getContext(state) {
    if (state.finished) return { label: 'Finalizado', matchBall: false };
    if (state.tieBreak) return { label: 'TIE-BREAK', matchBall: false };
    const g = state.games;
    const target = 6;
    const inMatchBall =
      (state.sets_won[0] === this.config.setsToWin - 1 && g[0] >= target - 1) ||
      (state.sets_won[1] === this.config.setsToWin - 1 && g[1] >= target - 1);
    if (inMatchBall) return { label: 'MATCH BALL', matchBall: true };
    return { label: `SET ${state.currentSet + 1}`, matchBall: false };
  }
}