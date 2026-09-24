const Storage = {
  KEY_MATCHES: 'challengescore.matches',
  KEY_CURRENT: 'challengescore.currentMatch',

  _safeSet(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (err) {
      console.warn('localStorage lleno, limpiando historial antiguo...', err);
      // Emergencia: liberar espacio
      try {
        localStorage.removeItem(this.KEY_MATCHES);
        localStorage.setItem(key, value);
        return true;
      } catch (err2) {
        console.error('No se pudo guardar ni tras limpiar:', err2);
        return false;
      }
    }
  },

  saveMatch(match) {
    const all = this.getMatches();
    all.unshift(match);
    this._safeSet(this.KEY_MATCHES, JSON.stringify(all.slice(0, 50)));
  },

  getMatches() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY_MATCHES) || '[]');
    } catch { return []; }
  },

  clearMatches() {
    localStorage.removeItem(this.KEY_MATCHES);
  },

  saveCurrent(match) {
    if (match === null) {
      localStorage.removeItem(this.KEY_CURRENT);
      return;
    }
    // Guardar sin historial para ahorrar espacio
    const light = { ...match, history: [] };
    this._safeSet(this.KEY_CURRENT, JSON.stringify(light));
  },

  getCurrent() {
    try {
      const raw = localStorage.getItem(this.KEY_CURRENT);
      if (!raw) return null;
      const match = JSON.parse(raw);
      // Garantizar que history existe
      if (!Array.isArray(match.history)) match.history = [];
      return match;
    } catch { return null; }
  },

  // Utilidad de diagnóstico
  usage() {
    let total = 0;
    for (const k in localStorage) {
      if (localStorage.hasOwnProperty(k)) {
        total += (localStorage[k].length + k.length) * 2; // bytes aprox (UTF-16)
      }
    }
    return {
      bytes: total,
      kb: (total / 1024).toFixed(2),
      mb: (total / 1024 / 1024).toFixed(2),
      percent: ((total / (5 * 1024 * 1024)) * 100).toFixed(1) + '%'
    };
  }
};