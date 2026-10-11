export class ProgressManager {
  constructor() {
    this.data = { bestScore: 0, unlockedStage: 1, clearedStages: [] };
    try {
      const saved = JSON.parse(localStorage.getItem('lavenzo-progress'));
      if (saved && Number.isFinite(saved.bestScore)) this.data.bestScore = saved.bestScore;
      if (Array.isArray(saved?.clearedStages)) this.data.clearedStages = saved.clearedStages.filter(n => Number.isInteger(n) && n >= 1 && n <= 8);
    } catch { /* Storage is optional. */ }
  }
  save(developerMode) { if (developerMode) return; try { localStorage.setItem('lavenzo-progress', JSON.stringify(this.data)); } catch { /* Storage is optional. */ } }
}
