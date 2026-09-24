const UI = {
  showView(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  },

  /* ============ SCOREBOARD ============ */
  renderScoreboard(match, sport) {
    try {
      const sb = document.getElementById('scoreboard');

      const SPORTS_WITH_NUMBERS = ['Squash', 'Badminton', 'Pickleball', 'Raquetbol', 'Frontón', 'Tenis de Mesa'];
      const usesNumbers = SPORTS_WITH_NUMBERS.includes(match.sport);

      const sets = Array.isArray(match.sets) ? match.sets : [];
      const games = Array.isArray(match.games) ? match.games : [0, 0];
      const setsWon = Array.isArray(match.sets_won) ? match.sets_won : [0, 0];

      let displayScore;
      let contextLabel = '';

      if (usesNumbers) {
        displayScore = (idx) => {
          if (match.finished) return match.winner === idx ? '🏆' : '—';
          return match.points[idx] ?? 0;
        };
      } else {
  // Tenis y Pádel: 0/15/30/40/AD
  displayScore = (idx) => {
    if (match.finished) return match.winner === idx ? '🏆' : '—';
    if (match.tieBreak) return match.tieBreakPoints[idx] ?? 0;

    const a = match.points[0] ?? 0;
    const b = match.points[1] ?? 0;
    const labels = ['0', '15', '30', '40'];

    // Deuce: ambos en 3 o más
    if (a >= 3 && b >= 3) {
      // 40-40 exacto
      if (a === b) return '40';
      // Ventaja para el jugador 0
      if (a === b + 1) return idx === 0 ? 'AD' : '40';
      // Ventaja para el jugador 1
      if (b === a + 1) return idx === 1 ? 'AD' : '40';
      // Normalizar extremos raros
      return idx === 0 ? (a > b ? 'AD' : '40') : (b > a ? 'AD' : '40');
    }

    // Antes del deuce: devolver el valor del jugador según su idx
    const valor = idx === 0 ? a : b;
    return labels[Math.min(valor, 3)] ?? '0';
  };
}

      const ctx = sport.getContext ? sport.getContext(match) : null;
      if (ctx) contextLabel = ctx.label;

      sb.innerHTML = `
        <div class="player-side ${match.server === 0 && !match.finished ? 'serving' : ''}">
          <div class="player-name">${this._esc(match.players[0])}</div>
          <div class="player-score">${displayScore(0)}</div>
        </div>
        <div class="player-side ${match.server === 1 && !match.finished ? 'serving' : ''}">
          <div class="player-name">${this._esc(match.players[1])}</div>
          <div class="player-score">${displayScore(1)}</div>
        </div>
        <div class="sets-panel">
          <div class="sets-title ${this._isMatchBall(match, sport) ? 'match-ball' : ''}">
            ${contextLabel || (match.tieBreak ? 'TIE-BREAK' : `SET ${(match.currentSet ?? 0) + 1}`)}
          </div>
          <table class="sets-table">
            <thead>
              <tr>
                <th></th>
                ${sets.map((_, i) => `<th>S${i + 1}</th>`).join('')}
                <th class="col-games">${usesNumbers ? 'Puntos' : 'Juegos'}</th>
                <th class="col-sets">Sets</th>
              </tr>
            </thead>
            <tbody>
              ${[0, 1].map(i => `
                <tr>
                  <td class="player-cell">${this._esc(match.players[i])}</td>
                  ${sets.map(s => `<td>${i === 0 ? (s?.a ?? 0) : (s?.b ?? 0)}</td>`).join('')}
                  <td class="col-games">${usesNumbers ? (match.points[i] ?? 0) : (games[i] ?? 0)}</td>
                  <td class="col-sets">${setsWon[i] ?? 0}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      document.getElementById('match-sport-name').textContent =
        match.finished ? `${match.sport} · Finalizado` : match.sport;
    } catch (err) {
      console.error('Error renderScoreboard:', err, match);
      document.getElementById('scoreboard').innerHTML =
        `<p class="empty">Error al renderizar. Revisa la consola.</p>`;
    }
  },

  /* ============ CONTROLES ============ */
  renderControls(match, sport) {
    const c = document.getElementById('controls');
    if (match.finished) {
      c.innerHTML = `
        <button class="btn-primary full" id="btn-view-result">Ver resultado 🏆</button>
        <button class="btn-ghost full" id="btn-undo-final">↶ Deshacer último punto</button>
      `;
      document.getElementById('btn-view-result').onclick = () => UI.showEndModal(match);
      document.getElementById('btn-undo-final').onclick = () => ChallengeScore.undo();
      return;
    }
    c.innerHTML = `
      <button class="btn-point" data-idx="0">+ ${this._esc(match.players[0])}</button>
      <button class="btn-point" data-idx="1">+ ${this._esc(match.players[1])}</button>
      <button class="btn-ghost full" id="btn-undo">↶ Deshacer</button>
    `;
    c.querySelectorAll('[data-idx]').forEach(b => {
      b.onclick = () => ChallengeScore.addPoint(+b.dataset.idx);
    });
    document.getElementById('btn-undo').onclick = () => ChallengeScore.undo();
  },

  /* ============ MODAL NUEVO PARTIDO ============ */
  showNewMatchModal(sport) {
    document.getElementById('modal-sport-title').textContent = `Nuevo partido · ${sport.name}`;
    document.getElementById('input-player1').value = 'Jugador 1';
    document.getElementById('input-player2').value = 'Jugador 2';
    document.getElementById('select-sets').value = '3';
    document.getElementById('modal-new').classList.add('active');

    setTimeout(() => {
      const i = document.getElementById('input-player1');
      i.focus();
      i.select();
    }, 100);
  },

  hideNewMatchModal() {
    document.getElementById('modal-new').classList.remove('active');
  },

  /* ============ MODAL FIN DE PARTIDO ============ */
  showEndModal(match) {
    document.getElementById('modal-winner-name').textContent = match.players[match.winner];

    const scoreLines = match.sets
      .map((s, i) => `Set ${i + 1}: ${s.a} - ${s.b}`)
      .join(' · ');
    document.getElementById('modal-final-score').textContent = scoreLines;

    document.getElementById('modal-end').classList.add('active');
  },

  hideEndModal() {
    document.getElementById('modal-end').classList.remove('active');
  },

  /* ============ HISTORIAL ============ */
  renderHistory(matches) {
    const list = document.getElementById('history-list');
    if (!matches.length) {
      list.innerHTML = `<p class="empty">Sin partidos registrados</p>`;
      return;
    }
    list.innerHTML = matches.map(m => `
      <div class="history-item">
        <span class="history-sport">${m.sport}</span>
        <span class="history-players">${this._esc(m.players.join(' vs '))}</span>
        <span class="history-result">🏆 ${this._esc(m.players[m.winner])}</span>
        <span class="history-date">${new Date(m.finishedAt).toLocaleDateString()}</span>
      </div>
    `).join('');
  },

  /* ============ HELPERS ============ */
  _isMatchBall(match, sport) {
    if (!match || !sport || typeof sport.getContext !== 'function') return false;
    if (match.finished) return false;
    const ctx = sport.getContext(match);
    return !!(ctx && ctx.matchBall);
  },

  _esc(str) {
    return String(str).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }
};