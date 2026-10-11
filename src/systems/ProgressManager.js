export class ProgressManager {
  constructor() { this.data = { bestScore: 0, unlockedStage: 1 }; try { const saved = JSON.parse(localStorage.getItem('lavenzo-progress')); if (saved && Number.isFinite(saved.bestScore)) this.data.bestScore = saved.bestScore; } catch { /* Storage is optional. */ } }
  save(developerMode) { if (developerMode) return; try { localStorage.setItem('lavenzo-progress', JSON.stringify(this.data)); } catch { /* Storage is optional. */ } }
}
