import DIRECTIONS from "./directions.js";

const DIFICULTADES = {
	fácil: 160,
	normal: 100,
	difícil: 70
}

class Game {


	constructor(width, height, amount, containerId) {
		// Dimensiones y configuración inicial
		this.width = width;
		this.height = height;
		this.amount = amount;
		this.containerId = containerId;

		// Estado del Juego
		this.speed = DIFICULTADES.normal;
		this.isPlaying = false;
		this.isGameOver = false;
		this.paused = false;

		// Configuración Visual
		this.noWalls = false;
		this.showGrid = true;
		this.snakeColor = {
			fill: "#10b981",
			stroke: "#059669"
		};

		// Funcion extra (Lo uso desde snake.js)
		this.onGameOver = null;

		this.initCanvas();
		this.initSounds();

	}

	/* Getters */
	get cellSizeX() {
		return this.width / this.amount;
	}

	get cellSizeY() {
		return this.height / this.amount;
	}

	/* Configuración */
	setDifficulty(dificultad) {
		this.dificultad = dificultad;

		this.speed = DIFICULTADES[dificultad] || DIFICULTADES.normal;

		// Reinicia solo si el juego ya está en curso
		if (this.isPlaying && !this.paused) {
			clearInterval(this.gameInterval);
			this.gameInterval = setInterval(this.step.bind(this), this.speed);
		}
	}

	setNoWalls(estado) {
		this.noWalls = estado;
	}

	setSnakeColor(fill, stroke) {
		this.snakeColor.fill = fill;
		this.snakeColor.stroke = stroke;
	}

	/* Inicialización */
	initCanvas() {
		this.canvas = document.createElement("canvas");
		this.canvas.id = "snakeCanvas";
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		document.getElementById(this.containerId).appendChild(this.canvas);
		this.context = this.canvas.getContext("2d");
	}

	initSounds() {
		this.sonidos = {
			movimiento: new Audio('sonidos/mover.mp3'),
			comer: new Audio('sonidos/comer.mp3'),
			perder: new Audio('sonidos/fin-juego.mp3')
		};

		this.sonidos.movimiento.volume = 0.4;
	}

	loadAssets() {
		this.loadImage('img/manzana.png', (image) => {
			this.foodImage = image;
			this.clear();
			this.drawSnake();
			this.drawFood();
		});
	}

	loadImage(src, callback) {
		const image = new Image();
		image.onload = () => callback(image);
		image.src = src;
	}

	setupEventListeners() {
		document.addEventListener("keydown", this.input.bind(this));
	}


	/* Funciones Visuales */
	drawGrid() {

		const { cellSizeX, cellSizeY } = this;
		const ctx = this.context;

		// Fondo Base
		ctx.fillStyle = "#0f172a";
		ctx.fillRect(0, 0, this.width, this.height);

		if (this.showGrid) {
			ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
			ctx.lineWidth = 1;

			// Dibuja lineas verticales
			for (let x = 0; x <= this.width; x += cellSizeX) {
				ctx.beginPath();
				ctx.moveTo(x, 0);
				ctx.lineTo(x, this.height);
				ctx.stroke();
			}

			// Dibuja lineas horizontales
			for (let y = 0; y <= this.height; y += cellSizeY) {
				ctx.beginPath();
				ctx.moveTo(0, y);
				ctx.lineTo(this.width, y);
				ctx.stroke();
			}
		}
	}

	drawSquare(x, y, color) {

		const { cellSizeX, cellSizeY } = this;
		this.context.fillStyle = color;
		this.context.fillRect(x * cellSizeX, y * cellSizeY, cellSizeX, cellSizeY);
	}

	drawSnake() {

		const { cellSizeX, cellSizeY } = this;

		this.snake.forEach(({ x, y }, index) => {
			const fill = this.snakeColor.fill || "#10b981";
			const stroke = this.snakeColor.stroke || "#10b981";

			this.context.fillStyle = fill;
			this.context.fillRect(x * cellSizeX, y * cellSizeY, cellSizeX, cellSizeY);

			// Dibuja borde solo en las partes del cuerpo, no en la cabeza
			if (index !== 0) {
				this.context.strokeStyle = stroke;
				this.context.lineWidth = 2;
				this.context.strokeRect(x * cellSizeX + 1, y * cellSizeY + 1, cellSizeX - 2, cellSizeY - 2);
			}

		});
	}

	drawFood() {

		const { cellSizeX, cellSizeY } = this;

		if (this.foodImage) {
			const imageWidth = cellSizeX * 1;
			const imageHeight = cellSizeY * 1;

			// Centrar la imagen de la comida
			const drawX = this.food.x * cellSizeX + (cellSizeX - imageWidth) / 2;
			const drawY = this.food.y * cellSizeY + (cellSizeY - imageHeight) / 2;

			this.context.drawImage(
				this.foodImage,
				drawX,
				drawY,
				imageWidth,
				imageHeight
			);
		} else {
			this.drawSquare(this.food.x, this.food.y, "#ec1337ff");
		}
	}

	clear() {
		this.drawGrid();
	}


	/***  LOGICA DEL JUEGO ***/
	initSnake() {
		this.snake = [];
		// Inicia en la primera columna y fila central
		this.snake.push({ x: 0, y: Math.floor(this.amount / 2) });
	}

	newTile() {

		const { x, y } = this.snake[0];

		const movement = {
			[DIRECTIONS.LEFT]: { x: -1, y: 0 },
			[DIRECTIONS.RIGHT]: { x: 1, y: 0 },
			[DIRECTIONS.UP]: { x: 0, y: -1 },
			[DIRECTIONS.DOWN]: { x: 0, y: 1 },
		};

		const move = movement[this.direction];
		return { x: x + move.x, y: y + move.y };
	}

	collides(x, y) {
		// Comprueba si la nueva cabeza colisiona con algunas partes del cuerpo
		return this.snake.some((segment) => segment.x === x && segment.y === y);
	}

	isFoodOutsideBounds(x, y) {

		const { cellSizeX, cellSizeY } = this;

		// Verifica si la comida está fuera de los límites del juego
		return x < 0 || x >= this.amount || y < 0 || y >= this.amount ||
			x * cellSizeX >= this.width || y * cellSizeY >= this.height;
	}

	addFood() {
		let foodX, foodY;
		do {
			// Asegurarse de que la comida no aparezca en las mismas coordenadas que la serpiente
			foodX = Math.floor(Math.random() * this.amount);
			foodY = Math.floor(Math.random() * this.amount);
		} while (this.collides(foodX, foodY) || this.isFoodOutsideBounds(foodX, foodY));

		this.food = { x: foodX, y: foodY };
	}

	moveToOppositeSide(newHead) {
		// Rebota tipo Pac-Man si atraviea bordes
		if (newHead.x < 0) newHead.x = this.amount - 1;
		if (newHead.x >= this.amount) newHead.x = 0;
		if (newHead.y < 0) newHead.y = this.amount - 1;
		if (newHead.y >= this.amount) newHead.y = 0;
	}

	isOutsideGameArea(newHead) {
		return (newHead.x < 0 || newHead.x >= this.amount || newHead.y < 0 || newHead.y >= this.amount);
	}

	step() {

		let newHead = this.newTile();

		if (this.noWalls) {
			this.moveToOppositeSide(newHead);
		} else if (this.isOutsideGameArea(newHead)) {
			this.handleGameOver();
		}

		if (this.collides(newHead.x, newHead.y)) {
			this.handleGameOver();
		}

		this.snake.unshift(newHead);

		if (this.food && this.food.x === newHead.x && this.food.y === newHead.y) {
			this.playSound("comer");
			this.addFood();
			this.score++;
			document.getElementById("puntuacion").innerText = this.score;

		} else {
			this.snake.pop();
		}

		this.clear();
		this.drawSnake();
		this.drawFood();
	}

	/*** CONTROL DEL JUEGO ***/
	start() {
		this.stop();
		this.paused = false;
		this.isGameOver = false;

		this.speed = DIFICULTADES[this.dificultad] || DIFICULTADES.normal;

		this.initSnake();
		this.direction = DIRECTIONS.RIGHT;
		this.score = 0;
		this.addFood();
		this.setupEventListeners();
		this.loadAssets();

		this.startWithDelay();
	}

	stop(pauseOnly = false) {
		clearInterval(this.gameInterval);

		this.paused = true;

		if (!pauseOnly) {

			this.isPlaying = false;
		}
	}

	resume() {
		if (this.isPlaying && this.paused) {
			this.paused = false;
			this.isPlaying = false;

			this.startWithDelay();
		}
	}

	playSound(nombre, onEnded) {
		const sound = this.sonidos?.[nombre];

		if (sound) {
			const instancia = sound.cloneNode();
			instancia.volume = sound.muted ? 0 : 1;
			instancia.currentTime = 0;

			if (typeof onEnded === "function") {
				instancia.onended = onEnded;
			}

			instancia.play();
		}
	}

	handleGameOver() {
		clearInterval(this.gameInterval);
		this.isGameOver = true;
		this.isPlaying = false;
		this.paused = false;

		if (this.sonidos?.perder) {
			this.playSound("perder", () => {
				if (this.onGameOver) this.onGameOver();
			});
		} else if (this.onGameOver) this.onGameOver();

	}

	input(e) {

		if (!this.isPlaying || this.paused || this.isGameOver) return;

		let nuevaDireccion = this.direction;

		switch (e.key.toLowerCase()) {
			case 'arrowleft':
			case 'a':
				if (this.direction !== DIRECTIONS.RIGHT) {
					this.direction = DIRECTIONS.LEFT;
				}
				break;
			case 'arrowup':
			case 'w':
				if (this.direction !== DIRECTIONS.DOWN) {
					this.direction = DIRECTIONS.UP;
				}
				break;
			case 'arrowright':
			case 'd':
				if (this.direction !== DIRECTIONS.LEFT) {
					this.direction = DIRECTIONS.RIGHT;
				}
				break;
			case 'arrowdown':
			case 's':
				if (this.direction !== DIRECTIONS.UP) {
					this.direction = DIRECTIONS.DOWN;
				}
				break;
		}

		if (nuevaDireccion != this.direction && this.sonidos?.movimiento) {
			this.playSound("movimiento");
		}
	}

	startWithDelay() {
		setTimeout(() => {
			this.isPlaying = true;
			this.gameInterval = setInterval(this.step.bind(this), this.speed);
		}, 3000);
	}
}

export default Game;