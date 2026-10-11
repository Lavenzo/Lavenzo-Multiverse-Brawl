# Contributor handover

Read README.md and DEVELOPMENT_STATUS.md before editing. Current scope is Milestone 1. Do not begin Milestone 2 without user approval. Keep all continuity information in local files.

- Preserve ES modules, Vite, Canvas, and a backend-free architecture. Extend working modules rather than rewrite them.
- InputManager is the only keyboard listener owner for game controls. Keep arrows for movement, A punch, S kick, D special, W strong, Space jump, Enter confirm, Escape pause, P developer tools. No WASD movement or function-key shortcuts.
- Keep simulation in entities/engine and drawing in Renderer/UI. Character attributes belong in data definitions. Future combat must distinguish lane position, jump height, bodies and hitboxes.
- Attack presses are edge-triggered and cooldown-controlled. Clear input on transitions and focus loss.
- Developer actions must use validated Game methods, never mutate through UI or test-only shortcuts. Restrict developer shortcuts to Developer Mode. Reset cheats/API when returning to normal mode; never save developer progress.
- Unsupported stages must remain visibly unavailable. Never represent previews or placeholder configurations as finished stages.
- Use data-testid for menu controls and guarded gameTestAPI for browser automation. Keep optional assets/storage failures nonfatal.
- Run npm run build and npm test after functional changes. Add meaningful behavioral checks when expanding simulation. Update DEVELOPMENT_STATUS.md with results, known limits and next steps.
- Do not push without user approval. Do not add external character assets or audio without authorization.
