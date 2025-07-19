
// Clase PopUps
class Popups {
    constructor(game) {
        this.game = game;
        this.scoresVisible = false;
        this.menuListeners();
    }

    menuListeners() {
        const menuButtons = document.getElementById("menu-buttons");

        menuButtons.addEventListener("click", (e) => {
            const classList = e.target.classList;

            if (classList.contains("btn-jugar")) this.startGame();
            else if (classList.contains("btn-puntuaciones")) this.showScores();
            else if (classList.contains("btn-volver")) this.updateMenu("end", this.game?.score ?? 0);
        });
    }

    openStartModal() {
        this.updateMenu("start");
        this.game.stop();
    }

    startGame() {
        const startModalContainer = document.getElementById("menu-principal");
        startModalContainer.style.display = "none";

        document.getElementById("puntuacion").innerText = 0;

        this.game.restart();
    }

    showPopup(score) {
        this.updateMenu("end", score);
    }

    saveScore(score) {
        const bestScore = Number(localStorage.getItem('bestScore')) || 0;

        if (score > bestScore) {
            localStorage.setItem('bestScore', score);
        }
    }

    showScores() {
        this.updateMenu("scores");
    }

    updateMenu(type, score = 0) {
        const title = document.getElementById('menu-title');
        const description = document.getElementById('menu-description');
        const buttonsContainer = document.getElementById('menu-buttons');

        if (!title || !description || !buttonsContainer) return;

        switch (type) {
            case "start":
                title.innerText = "¡Bienvenido!";
                description.innerText = "Usa las flechas para mover la serpiente.";
                buttonsContainer.innerHTML = `
                    <button class="btn-jugar"><i class="fas fa-play"></i> Jugar</button>
                <button class="btn-puntuaciones"><i class="fas fa-trophy"></i> Puntuaciones</button>
                `;

                break;
            case "end":
                title.innerText = "Fin del Juego";
                description.innerText = "Puntuación: " + score;
                buttonsContainer.innerHTML = `
                    <button class="btn-jugar"><i class="fas fa-redo"></i> Reintentar</button>
                    <button class="btn-puntuaciones"><i class="fas fa-trophy"></i> Puntuaciones</button>
                `;
                break;

            case "scores":
                const bestScore = Number(localStorage.getItem("bestScore")) || 0;

                console.log(bestScore);
                title.innerText = "Puntuaciones";
                description.innerHTML = `
                    <i class="fas fa-trophy icono-trofeo"></i>
                    <span class="texto-label">Más Alta:</span>
                    <span class="texto-score">${bestScore}</span>
                `;
                buttonsContainer.innerHTML = `
                    <button class="btn-volver"><i class="fas fa-arrow-left"></i> Volver</button>
                `;
                break;

            case "options":
                title.innerText = "Opciones";
        }

        const menu = document.getElementById("menu-principal");

        if (menu) menu.style.display = "flex";

    }
}

export default Popups; // Exportar la clase Popups