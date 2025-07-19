import DIRECTIONS from "./directions.js";

class Game {


	constructor(width, height, amount, containerId) {
		this.width = width;
		this.height = height;
		this.amount = amount;
		this.containerId = containerId; // Agrega el ID del contenedor
		this.initCanvas();
		this.start();

		this.onGameOver = null;
	}

	initCanvas() {
		this.canvas = document.createElement("canvas");
		this.canvas.id = "snakeCanvas";
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		document.getElementById(this.containerId).appendChild(this.canvas);
		this.context = this.canvas.getContext("2d");
	}

	loadImage(src, callback) {
		const image = new Image();
		image.onload = () => callback(image);
		image.src = src;
	}

	start() {
		this.initSnake();
		this.direction = DIRECTIONS.RIGHT;
		this.score = 0;
		this.addFood();
		this.setupEventListeners();
		this.loadAssets();

		this.gameInterval = setInterval(this.step.bind(this), 100);
	}
	initSnake() {
		this.snake = [];
		// Asegurarse de que la serpiente se inicialice en la primera columna y en la fila central
		this.snake.push({ x: 0, y: Math.floor(this.amount / 2) });
	}

	drawGrid() {
		const ctx = this.context;
		const gridSizeX = this.width / this.amount;
		const gridSizeY = this.height / this.amount;

		// Fondo Base
		ctx.fillStyle = "#0f172a";
		ctx.fillRect(0, 0, this.width, this.height);

		// Lineas de cuadricula suaves
		ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
		ctx.lineWidth = 1;

		for (let x = 0; x <= this.width; x += gridSizeX) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, this.height);
			ctx.stroke();
		}

		for (let y = 0; y <= this.height; y += gridSizeY) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(this.width, y);
			ctx.stroke();
		}
	}
	drawSquare(x, y, color) {
		this.context.fillStyle = color;
		const gridSizeX = this.width / this.amount;
		const gridSizeY = this.height / this.amount;
		this.context.fillRect(x * gridSizeX, y * gridSizeY, gridSizeX, gridSizeY);
	}

	clear() {
		this.drawGrid();
	}

	drawSnake() {

		const sizeX = this.width / this.amount;
		const sizeY = this.height / this.amount;

		this.snake.forEach(({ x, y }, index) => {
			if (index === 0) {
				this.drawSquare(x, y, "#10b981");
				this.context.fillRect(x * sizeX, y * sizeY, sizeX, sizeY);
			} else {
				this.context.fillStyle = "#10b981";
				this.context.fillRect(x * sizeX, y * sizeY, sizeX, sizeY);

				this.context.strokeStyle = "#059669";
				this.context.lineWidth = 2;
				this.context.strokeRect(x * sizeX + 1, y * sizeY + 1, sizeX - 2, sizeY - 2);
			}
		});
	}

	drawHead(x, y) {
		if (this.headImage) {
			const imageSize = this.width / this.amount;
			this.context.drawImage(this.headImage, x * imageSize, y * imageSize, imageSize, imageSize);
		} else {
			this.drawSquare(x, y, "red");
		}
	}

	drawSnakeSegment(x, y) {
		const sizeX = this.width / this.amount;
		const sizeY = this.height / this.amount;
		const borderWidth = 2;

		this.context.fillStyle = "#61dafb";
		this.context.fillRect(x * sizeX, y * sizeY, sizeX, sizeY);

		this.context.strokeStyle = COLORS.SNAKE;
		this.context.lineWidth = borderWidth;
		this.context.strokeRect(x * sizeX + borderWidth / 2, y * sizeY + borderWidth / 2, sizeX - borderWidth, sizeY - borderWidth);
	}

	drawFood() {
		if (this.foodImage) {
			const cellWidth = this.width / this.amount;
			const cellHeight = this.height / this.amount;

			const imageWidth = cellWidth * 1;
			const imageHeight = cellHeight * 1;

			const drawX = this.food.x * cellWidth + (cellWidth - imageWidth) / 2;
			const drawY = this.food.y * cellHeight + (cellHeight - imageHeight) / 2;

			this.context.drawImage(
				this.foodImage,
				drawX,
				drawY,
				imageWidth,
				imageHeight
			);
		} else {
			this.drawSquare(this.food.x, this.food.y, COLORS.FOOD);
		}
	}

	collides(x, y) {
		return this.snake.some((segment) => segment.x === x && segment.y === y);
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

	isFoodOutsideBounds(x, y) {
		const sizeX = this.width / this.amount;
		const sizeY = this.height / this.amount;

		// Verifica si la comida está fuera de los límites del juego
		return x < 0 || x >= this.amount || y < 0 || y >= this.amount ||
			x * sizeX >= this.width || y * sizeY >= this.height;
	}

	newTile() {
		let headX = this.snake[0].x;
		let headY = this.snake[0].y;

		switch (this.direction) {
			case DIRECTIONS.LEFT:
				headX = (headX - 1);
				break;
			case DIRECTIONS.RIGHT:
				headX = (headX + 1);
				break;
			case DIRECTIONS.UP:
				headY = (headY - 1);
				break;
			case DIRECTIONS.DOWN:
				headY = (headY + 1);
				break;
		}

		return { x: headX, y: headY };
	}

	step() {
		let newHead = this.newTile();

		// Verifica si la cabeza de la serpiente está fuera de los límites
		if (
			newHead.x < 0 ||
			newHead.x >= this.amount ||
			newHead.y < 0 ||
			newHead.y >= this.amount ||
			this.collides(newHead.x, newHead.y)
		) {
			clearInterval(this.gameInterval);
			if (this.onGameOver) this.onGameOver();
			return;
		}

		this.snake.unshift(newHead);

		if (this.food && this.food.x === newHead.x && this.food.y === newHead.y) {
			this.addFood();
			this.score++; // Incrementa la puntuación
			// Actualiza el contenido del elemento span con la puntuación actualizada
			document.getElementById("puntuacion").innerText = this.score;

		} else {
			this.snake.pop();
		}

		this.clear();
		this.drawSnake();
		this.drawFood();

	}

	setupEventListeners() {
		document.addEventListener("keydown", this.input.bind(this));
	}

	input(e) {
		switch (e.keyCode) {
			case 37:
			case 65: // Tecla A
				if (this.direction !== DIRECTIONS.RIGHT) {
					this.direction = DIRECTIONS.LEFT;
				}
				break;
			case 38:
			case 87: // Tecla W
				if (this.direction !== DIRECTIONS.DOWN) {
					this.direction = DIRECTIONS.UP;
				}
				break;
			case 39:
			case 68: // Tecla D
				if (this.direction !== DIRECTIONS.LEFT) {
					this.direction = DIRECTIONS.RIGHT;
				}
				break;
			case 40:
			case 83: // Tecla S
				if (this.direction !== DIRECTIONS.UP) {
					this.direction = DIRECTIONS.DOWN;
				}
				break;
		}
	}

	loadAssets() {
		this.loadImage('img/manzana.png', (image) => {
			this.foodImage = image;
			this.clear();
			this.drawSnake();
			this.drawFood();
		});
	}

	// Nueva función para detener el juego
	stop() {
		clearInterval(this.gameInterval);
	}

	// Nueva función para reiniciar el juego
	restart() {
		this.stop();
		this.initSnake();
		this.direction = DIRECTIONS.RIGHT;
		this.score = 0;
		this.addFood();
		this.clear();
		this.drawSnake();
		this.drawFood();
		this.gameInterval = setInterval(this.step.bind(this), 100);
	}
}

export default Game;