class TennisRules extends SportRules {
  get name() { return 'Tenis'; }
  get icon() { return 'assets/images/shield-tennis.png'; }

  constructor() {
    super({ setsToWin: 2, hasTieBreak: true });
  }

  initialState(playerA = 'Jugador 1', playerB = 'Jugador 2') {
    const state = super.initialState(playerA, playerB);
    state.sets = [];          // [{a: 6, b: 4}, ...]  sets cerrados
    state.games = [0, 0];     // games del set en curso
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
    const p = state.points;
    if (p[idx] >= 4 && p[idx] - p[other] >= 2) this._winGame(state, idx, false);
  }

  _winGame(state, idx, wasTieBreak) {
    const other = 1 - idx;

    if (wasTieBreak) {
      // En tie-break el set se cierra con 7-6
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
      // Guardar set cerrado
      state.sets.push({ a: g[0], b: g[1] });

      // Contar sets ganados a partir del arreglo
      state.sets_won = [0, 0];
      for (const s of state.sets) {
        if (s.a > s.b) state.sets_won[0]++;
        else state.sets_won[1]++;
      }

      state.games = [0, 0];
      state.currentSet = state.sets.length;

      if (state.sets_won[idx] === this.config.setsToWin) {
        state.finished = true;
        state.winner = idx;
        return;
      }
    } else if (g[0] === 6 && g[1] === 6) {
      state.tieBreak = true;
    }

    state.server = other;
  }
}