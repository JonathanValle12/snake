// Importaciónes para construir todo el SNAKE
import Game from "./game.js";
import Popups from "./popups.js";

const game = new Game(400, 450, 20, "snake-container");
const popups = new Popups(); // Crear una instancia de la clase Popups

window.game = game; // Hacer el juego globalmente accesible

window.startGame = popups.startGame.bind(popups);
window.openNameModal = popups.openNameModal.bind(popups); // Usar bind para mantener el contexto
window.closeNameModal = popups.closeNameModal.bind(popups);
window.showPopup = popups.showPopup.bind(popups);
window.restartGame = popups.restartGame.bind(popups);
window.saveScore = popups.saveScore.bind(popups);
window.openStartModal = popups.openStartModal.bind(popups);
window.showScores = popups.showScores.bind(popups);
window.removeScore = popups.removeScore.bind(popups);
window.toggleScores = popups.toggleScores.bind(popups);

// Llama a openStartModal al cargar la página
window.onload = popups.openStartModal.bind(popups);