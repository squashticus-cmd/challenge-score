class SquashRules extends SportRules {
  get name() { return 'Squash'; }
  get icon() { return 'assets/images/shield-squash.png'; }

  constructor() {
    super({
      setsToWin: 3,          // mejor de 5
      pointsPerSet: 11,
      winBy: 2
    });
  }

  initialState(playerA = 'Jugador 1', playerB = 'Jugador 2') {
    const state = super.initialState(playerA, playerB);
    state.sets = [];
    state.points = [0, 0];
    state.sets_won = [0, 0];
    state.gameBall = false;   // indicador visual "bola de partido"
    return state;
  }

  _applyPoint(state, idx) {
    if (state.finished) return;

    // En squash PAR, cualquier jugador puede anotar
    state.points[idx]++;

    const a = state.points[0];
    const b = state.points[1];
    const target = this.config.pointsPerSet;
    const winBy = this.config.winBy;
    const other = 1 - idx;

    // ¿Ganó el set?
    const setWon =
      (state.points[idx] >= target && state.points[idx] - state.points[other] >= winBy);

    if (setWon) {
      this._winSet(state, idx);
      return;
    }

    // En squash, el saque cambia al jugador que ganó el punto
    // (en realidad cambia solo si el que NO saca gana, pero en PAR
    // el ganador del rally siempre saca a continuación)
    state.server = idx;
  }

  _winSet(state, idx) {
    const other = 1 - idx;

    // Guardar set
    state.sets.push({ a: state.points[0], b: state.points[1] });
    state.sets_won[idx]++;

    // Resetear puntos del set actual
    state.points = [0, 0];
    state.currentSet = state.sets.length;

    // ¿Fin del partido?
    if (state.sets_won[idx] >= this.config.setsToWin) {
      state.finished = true;
      state.winner = idx;
      return;
    }

    // El ganador del set saca primero en el siguiente
    state.server = idx;
  }

  /**
   * Información de contexto para mostrar en el marcador:
   * - ¿Estamos en "game ball"?
   * - ¿Cuántos puntos faltan?
   */
  getContext(state) {
    if (state.finished) return { label: 'Finalizado', matchBall: false };

    const target = this.config.pointsPerSet;
    const a = state.points[0];
    const b = state.points[1];
    const winBy = this.config.winBy;

    const inMatchBall =
      (state.sets_won[0] === this.config.setsToWin - 1 && a >= target - 1) ||
      (state.sets_won[1] === this.config.setsToWin - 1 && b >= target - 1);

    const inGameBall =
      (a >= target - 1 && a - b >= winBy - 1) ||
      (b >= target - 1 && b - a >= winBy - 1);

    if (inMatchBall) return { label: 'MATCH BALL', matchBall: true };
    if (inGameBall) return { label: 'GAME BALL', matchBall: false };
    if (a >= target - 1 && b >= target - 1) return { label: 'SET BALL', matchBall: false };
    return { label: `SET ${state.currentSet + 1} · a ${target}`, matchBall: false };
  }
}