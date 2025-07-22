import Game from './game.js';
import Popups from './popups.js';

const initialDifficulty = "normal";
let soundEnabled = true;

const game = new Game(400, 400, 20, 'snake-container');
const popups = new Popups(game);

game.setDifficulty(initialDifficulty);

// Se ejecuta cuando el jugador pierde
game.onGameOver = () => {

  popups.saveScore(game.score);
  popups.showPopup(game.score);
};

// Utilidad para evitar repetir codigo al agregar listeners
const addClickListener = (selector, callback) => {
  const btn = document.querySelector(selector);
  if (btn) btn.addEventListener('click', callback);
}

const toggleSound = () => {

  soundEnabled = !soundEnabled;

  for (const sonido of Object.values(game.sonidos)) {
    sonido.muted = !soundEnabled;
  }

  const icon = document.querySelector('.toggle-sonido i');
  if (!icon) return;

  icon.classList.toggle('fa-volume-mute', !soundEnabled);
  icon.classList.toggle('fa-volume-up', soundEnabled);
  
}

window.addEventListener('DOMContentLoaded', () => {
  popups.openStartModal();

  addClickListener('.btn-opciones', () => popups.updateMenu('options'));
  addClickListener('.toggle-sonido', toggleSound);

});