import DIRECTIONS from "./directions.js";

class Game {

	
	constructor(width, height, amount, containerId) {
	  this.width = width;
	  this.height = height;
	  this.amount = amount;
	  this.containerId = containerId; // Agrega el ID del contenedor
	  this.initCanvas();
	  this.start();
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
	  this.loadBackgroundImage('img/fondo.avif', (backgroundImage) => {
		this.backgroundImage = backgroundImage;
		this.gameInterval = setInterval(this.step.bind(this), 100);
	  });
	}
  
	initSnake() {
		this.snake = [];
		// Asegurarse de que la serpiente se inicialice en la primera columna y en la fila central
		this.snake.push({ x: 0, y: Math.floor(this.amount / 2) });
	}
  
	drawSquare(x, y, color) {
		this.context.fillStyle = color;
		const gridSizeX = this.width / this.amount;
		const gridSizeY = this.height / this.amount;
		this.context.fillRect(x * gridSizeX, y * gridSizeY, gridSizeX, gridSizeY);
	}
	
	
  
	clear() {
	  if (this.backgroundImage) {
		this.context.drawImage(this.backgroundImage, 0, 0, this.width, this.height);
	  } else {
		this.context.fillStyle = COLORS.BACKGROUND;
		this.context.fillRect(0, 0, this.width, this.height);
	  }
	}
  
	drawSnake() {
	  this.snake.forEach(({ x, y }, index) => {
		if (index === 0) {
		  this.drawSquare(x, y, "red");
		} else {
		  this.drawSquare(x, y, "blue");
		}
	  });
	}
  
	loadBackgroundImage(src, callback) {
	  const backgroundImage = new Image();
	  backgroundImage.onload = () => callback(backgroundImage);
	  backgroundImage.src = src;
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
			const imageSize = this.width / this.amount;
			this.context.drawImage(
				this.foodImage,
				this.food.x * imageSize,
				this.food.y * imageSize,
				imageSize,
				imageSize
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
        showPopup(this.score);
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
        // Primero, carga la imagen de fondo
        this.loadBackgroundImage('img/fondo.avif', (backgroundImage) => {
            this.backgroundImage = backgroundImage;

            // Después, carga la imagen de la comida
            this.loadImage('img/manzana.png', (image) => {
                this.foodImage = image;
                this.clear();
                this.drawSnake();
                this.drawFood();
            });
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