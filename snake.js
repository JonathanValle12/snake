const COLORS = {
	BACKGROUND: "#282c34", // Fondo gris oscuro
	SNAKE: "#61dafb", // Azul claro
	FOOD: "#ff6347", // Rojo coral
	EYE: "#000", // Ojos negros
	TONGUE: "#e74c3c", // Lengua roja
  };
  
  const DIRECTIONS = {
	LEFT: "left",
	RIGHT: "right",
	UP: "up",
	DOWN: "down",
  };
  
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
		  if (this.direction !== DIRECTIONS.RIGHT) {
			this.direction = DIRECTIONS.LEFT;
		  }
		  break;
		case 38:
		  if (this.direction !== DIRECTIONS.DOWN) {
			this.direction = DIRECTIONS.UP;
		  }
		  break;
		case 39:
		  if (this.direction !== DIRECTIONS.LEFT) {
			this.direction = DIRECTIONS.RIGHT;
		  }
		  break;
		case 40:
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

let game = new Game(650, 650, 20, "snake-container");

function openNameModal() {
    const nameModalContainer = document.getElementById("name-modal-container");
    nameModalContainer.style.display = "flex";
}

function closeNameModal() {
    const nameModalContainer = document.getElementById("name-modal-container");
    nameModalContainer.style.display = "none";
}

function showPopup(score) {
    const popupContainer = document.getElementById("popup-container");
    const finalScore = document.getElementById("final-score");
    finalScore.innerText = score;
    popupContainer.style.display = "flex";

	if (game.score >= 5) {
		// Habilita el botón de "Registrar Puntuación"
		const registerButton = document.getElementById("register-button");
		registerButton.disabled = false;
	}
}

function restartGame() {
    const popupContainer = document.getElementById("popup-container");
    popupContainer.style.display = "none";
    
    // Inicia el juego
    game.restart();

	// Habilita el botón de "Registrar Puntuación"
	const registerButton = document.getElementById("register-button");
	registerButton.disabled = true;
    // Actualiza el contenido del elemento span con la puntuación reiniciada
    document.getElementById("puntuacion").innerText = game.score;
}

function saveScore() {

	openNameModal();
    const userNameInput = document.getElementById("username");
    const userName = userNameInput.value.trim();

    if (userName !== "") {
        const currentScores = JSON.parse(localStorage.getItem("snakeScores")) || [];
        
        // Verifica si ya existe una puntuación para el mismo usuario
        const existingScoreIndex = currentScores.findIndex(score => score.userName === userName);

        if (existingScoreIndex !== -1) {
            const existingScore = currentScores[existingScoreIndex];
            
            // Si la puntuación actual es mayor que la existente, actualiza la puntuación
            if (game.score > existingScore.score) {
                existingScore.score = game.score;
                alert(`Puntuación actualizada para ${userName}!`);
            } else {
                alert(`Ya existe una puntuación para ${userName} con una puntuación igual o mayor.`);
            }
        } else {
            // Agrega la nueva puntuación solo si no existe una puntuación para el mismo usuario
            currentScores.push({ userName, score: game.score });
            alert(`Puntuación guardada para ${userName}!`);
        }

        // Ordena y limita el arreglo de puntuaciones
        currentScores.sort((a, b) => b.score - a.score);
        const maxScoresToKeep = 5;
        const trimmedScores = currentScores.slice(0, maxScoresToKeep);

		localStorage.setItem("snakeScores", JSON.stringify(trimmedScores));
		console.log("Nuevas puntuaciones guardadas:", trimmedScores);

        
        closeNameModal(); // Cierra el modal después de guardar la puntuación
    } else {
        alert("Por favor, introduce tu nombre de usuario.");
    }
}
function openStartModal() {
    const startModalContainer = document.getElementById("start-modal-container");
    startModalContainer.style.display = "flex";
    // Detener el juego al abrir el modal
    game.stop();
}

function startGame() {
    const startModalContainer = document.getElementById("start-modal-container");
    startModalContainer.style.display = "none";
    
    // Iniciar el juego cuando se hace clic en "Comenzar"
    game.restart();
}

let scoresVisible = false; // Nuevo estado para rastrear si los puntajes están visibles

function showScores() {
    const scoresContainer = document.getElementById("scores-container");
    scoresContainer.innerHTML = ""; // Limpia el contenido anterior

    const scores = JSON.parse(localStorage.getItem("snakeScores")) || [];

    let scoresHTML = "<div class='score-card'>";
    scoresHTML += "<h2>Puntuaciones</h2>";
    scoresHTML += "<button class='close-button' onclick='toggleScores()'>X</button>";
    
    if (scores.length > 0) {
        scoresHTML += "<ul>";
        scores.forEach((score, index) => {
            scoresHTML += `<li>${score.userName}: ${score.score} <span class='remove-score' onclick='removeScore(${index})'>❌</span></li>`;
        });
        scoresHTML += "</ul>";
    } else {
        scoresHTML += "<p>No hay puntuaciones registradas.</p>";
    }
    scoresHTML += "</div>";

    // Añade el contenido al contenedor
    scoresContainer.innerHTML = scoresHTML;

    scoresContainer.classList.add('visible'); // Agrega la clase 'visible'
    scoresVisible = true; // Actualiza el estado
}
function removeScore(index) {
    const currentScores = JSON.parse(localStorage.getItem("snakeScores")) || [];

    // Elimina la puntuación en el índice dado
    currentScores.splice(index, 1);

    // Actualiza el almacenamiento local con las puntuaciones actualizadas
    localStorage.setItem("snakeScores", JSON.stringify(currentScores));

    // Vuelve a mostrar las puntuaciones
    showScores();
}
function toggleScores() {
    let scoresContainer = document.getElementById('scores-container');
    scoresContainer.classList.toggle('visible'); // Usa toggle para alternar la clase
    scoresVisible = !scoresVisible; // Invierte el estado
}

// Llama a openStartModal al cargar la página
window.onload = openStartModal;