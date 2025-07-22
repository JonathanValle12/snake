class Popups {
    constructor(game) {
        this.game = game;
        this.scoresVisible = false;
        this.currentMenu = "start";
        this._previousMenu = "start";

        this.menuListeners();
    }

    // Inicializacion de eventos principales
    menuListeners() {
        const menuButtons = document.getElementById("menu-buttons");

        menuButtons.addEventListener("click", (e) => {
            const classList = e.target.classList;

            if (classList.contains("btn-jugar")) this.startGame();
            else if (classList.contains("btn-puntuaciones")) this.showScores();
            else if (classList.contains("btn-volver")) this.updateMenu(this._previousMenu, this.game?.score);
        });
    }

    openStartModal() {
        this.updateMenu("start");
        this.game.stop();
    }

    startGame() {
        const mainMenu = document.getElementById("menu-principal");
        mainMenu.style.display = "none";

        document.getElementById("puntuacion").innerText = 0;

        this.startCountdown();
        this.game.start();
    }

    showPopup(score) {
        setTimeout(() => {
            if (this._previousMenu !== "options") {
                this.updateMenu("end", score);
            }
        }, 100);
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

    // Gestión de los menús
    updateMenu(type, score = 0) {
        if (type !== "options" && type !== "playing") {
            this.currentMenu = type;
        }

        const title = document.getElementById('menu-title');
        const description = document.getElementById('menu-description');
        const buttonsContainer = document.getElementById('menu-buttons');
        const optionsMenu = document.getElementById('menu-opciones');
        const menuContent = document.querySelector('.contenido-menu');
        const menu = document.getElementById('menu-principal');

        if (!title || !description || !buttonsContainer) return;

        // Mostrar por defecto
        const show = [title, description, buttonsContainer, menuContent];
        const hide = [optionsMenu];

        show.forEach(el => el.style.display = "");
        hide.forEach(el => el.style.display = "none");

        switch (type) {
            case "start":
                title.innerText = "¡Bienvenido!";
                description.innerText = "Usa las flechas para mover la serpiente.";
                buttonsContainer.innerHTML = `
                    <button class="btn-jugar btn-color-tema"><i class="fas fa-play"></i> Jugar</button>
                    <button class="btn-puntuaciones"><i class="fas fa-trophy"></i> Puntuaciones</button>
                `;
                break;

            case "end":
                this._previousMenu = "end"

                title.innerText = "Fin del Juego";
                description.innerText = "Puntuación: " + score;
                buttonsContainer.innerHTML = `
                    <button class="btn-jugar btn-color-tema"><i class="fas fa-redo"></i> Reintentar</button>
                    <button class="btn-puntuaciones"><i class="fas fa-trophy"></i> Puntuaciones</button>
                `;
                break;

            case "scores":
                if (this.currentMenu !== "scores") {
                    this._previousMenu = this.currentMenu;
                }

                this.currentMenu = "scores";

                const bestScore = Number(localStorage.getItem("bestScore")) || 0;
                title.innerText = "Puntuaciones";
                description.innerHTML = `
                    <i class="fas fa-trophy icono-trofeo"></i>
                    <span class="texto-label">Más Alta:</span>
                    <span class="texto-score">${bestScore}</span>
                `;
                buttonsContainer.innerHTML = `
                    <button class="btn-volver btn-color-tema"><i class="fas fa-arrow-left"></i> Volver</button>
                `;
                break;

            case "options":

                if (this.game.isPlaying && !this.game.isGameOver) {
                    this.game.stop(true);
                }

                if (this.currentMenu !== "options") {
                    this._previousMenu = this.game.isPlaying ? "playing" : this.currentMenu;
                }

                this.currentMenu = "options";

                show.forEach(el => el.style.display = "none");
                optionsMenu.style.display = "flex";

                this.setupOpcionesListeners();

                break;

            case "playing":
                this.currentMenu = "playing";

                if (menu) menu.style.display = "none";

                this.startCountdown();
                this.game.resume();

                break;

        }

        if (type !== "playing" && menu) {
            menu.style.display = "flex";
        }
    }

    // Configuración de eventos del menú de opciones
    setupOpcionesListeners() {

        // Botón de volver
        const backBtn = document.querySelector('.btn-volver-opciones');
        if (backBtn && !backBtn.dataset.listener) {
            backBtn.addEventListener('click', () => {
                const target = (this._previousMenu === "playing" && !this.game.isGameOver) ? "playing" : this._previousMenu;
                this.updateMenu(target, this.game.score);
            });

            backBtn.dataset.listener = "true";
        }

        // Botones de dificultad
        const difficultyButtons = document.querySelectorAll('.btn-dificultad');
        difficultyButtons.forEach((button) => {
            const difficulty = button.dataset.dificultad;
            button.classList.toggle('selected', difficulty === this.game.dificultad);

            if (!button.dataset.listener) {
                button.addEventListener("click", () => {
                    this.game.setDifficulty(difficulty);
                    difficultyButtons.forEach(btn => btn.classList.remove('selected'));
                    button.classList.add('selected');
                });

                button.dataset.listener = "true";
            }
        });

        // Modo Sin Paredes
        const noWallsCheckbox = document.getElementById('modo-sin-paredes');
        if (noWallsCheckbox) {
            noWallsCheckbox.addEventListener('change', (e) => {
                this.game.setNoWalls(e.target.checked);
            })
        }

        // Colores
        const colorButtons = document.querySelectorAll('.color-option');
        colorButtons.forEach((btn) => {

            if (!btn.dataset.listener) {
                btn.addEventListener('click', () => {
                    colorButtons.forEach(b => {
                        b.classList.remove('selected');
                        b.style.border = '2px solid transparent';
                        b.style.boxShadow = 'none';
                    });

                    btn.classList.add('selected');

                    const color = btn.dataset.color;
                    const stroke = btn.dataset.stroke;

                    btn.style.border = `3px solid ${stroke || '#000'}`;
                    btn.style.boxShadow = `0 0 0 4px #0f172a`;

                    document.documentElement.style.setProperty('--color-serpiente', color);
                    document.documentElement.style.setProperty('--color-serpiente-hover', stroke);

                    this.game.setSnakeColor(color, stroke);

                });
                btn.dataset.listener = "true";
            }
        });

        // Cuadricula
        const gridCheckbox = document.getElementById('visibilidad-cuadricula');
        if (gridCheckbox) {
            gridCheckbox.addEventListener('change', (e) => {
                this.game.showGrid = e.target.checked;
            })
        }
    }

    // Cuenta atras para comenzar a Jugar
    startCountdown() {
        const countDown = document.getElementById('countdown');
        let count = 3;

        countDown.classList.remove('hidden');
        countDown.innerText = count;

        const interval = setInterval(() => {
            count--;

            if (count > 0) {
                countDown.innerText = count;
            } else {
                clearInterval(interval);
                countDown.classList.add('hidden');

            }
        }, 1000);
    }
}

export default Popups;
