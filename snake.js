import Game from './game.js';
import Popups from './popups.js';

const game = new Game(400, 400, 20, 'snake-container');
const popups = new Popups(game);

game.onGameOver = () => {
    popups.saveScore(game.score);
  popups.showPopup(game.score);
};

window.addEventListener('DOMContentLoaded', () => {

  popups.openStartModal(); // Mostrar pantalla inicial
});