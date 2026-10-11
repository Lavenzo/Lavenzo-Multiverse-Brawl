import './styles/main.css';
import { UI } from './ui/UI.js';
import { Game } from './engine/Game.js';
const ui = new UI();
const game = new Game(ui);
ui.bind(game);
game.syncAPI();
game.loop.start();
window.addEventListener('blur', () => { if (game.state === 'playing') { game.state = 'paused'; ui.closeDeveloper(); ui.screen(game); } });
