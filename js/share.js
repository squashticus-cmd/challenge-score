const Share = {
  _formatText(match) {
    const lines = [
      `🏆 *CHALLENGE SCORE* 🏆`,
      `_${match.sport}_`,
      '',
      `🥇 *Ganador:* ${match.players[match.winner]}`,
      '',
      '📊 *Marcador:*',
      ...match.sets.map((s, i) =>
        `  Set ${i + 1}:  ${match.players[0]} ${s.a} - ${s.b} ${match.players[1]}`
      ),
      '',
      `📅 ${new Date(match.finishedAt || Date.now()).toLocaleString()}`,
      '',
      `_Generado con Challenge Score_`
    ];
    return lines.join('\n');
  },

  whatsapp(match) {
    const text = encodeURIComponent(this._formatText(match));
    const url = `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  },

  async native(match) {
    const text = this._formatText(match);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Challenge Score · ${match.sport}`,
          text: text
        });
      } catch (e) { /* usuario canceló */ }
    } else {
      // Fallback: copiar al portapapeles
      try {
        await navigator.clipboard.writeText(text);
        alert('Resultado copiado al portapapeles');
      } catch {
        prompt('Copia el resultado:', text);
      }
    }
  },

  print(match) {
    const area = document.getElementById('print-area');
    area.innerHTML = `
      <div class="print-header">
        <h1>Challenge Score</h1>
        <p>${match.sport}</p>
      </div>
      <div class="print-body">
        <h2>🏆 ${match.players[match.winner]}</h2>
        <table>
          <thead>
            <tr>
              <th>Jugador</th>
              ${match.sets.map((_, i) => `<th>Set ${i + 1}</th>`).join('')}
              <th>Sets</th>
            </tr>
          </thead>
          <tbody>
            ${[0, 1].map(i => `
              <tr>
                <td>${match.players[i]}</td>
                ${match.sets.map(s => `<td>${i === 0 ? s.a : s.b}</td>`).join('')}
                <td>${match.sets_won[i]}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <p class="print-date">${new Date(match.finishedAt || Date.now()).toLocaleString()}</p>
        <p class="print-footer">Generado con Challenge Score · por Squashner</p>
      </div>
    `;
    window.print();
  }
};