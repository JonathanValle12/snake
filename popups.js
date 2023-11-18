// Clase PopUps
class Popups {
    constructor() {
        // Agregar scoresVisible como propiedad de la clase
        this.scoresVisible = false;
    }

    openNameModal() {
        const nameModalContainer = document.getElementById("name-modal-container");
        nameModalContainer.style.display = "flex";
    }
    
    closeNameModal() {
        const nameModalContainer = document.getElementById("name-modal-container");
        nameModalContainer.style.display = "none";
    }
    
    showPopup(score) {
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
    
    restartGame() {
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
    
    saveScore() {
    
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
    
            
            closeNameModal(); // Cierra el modal después de guardar la puntuación
        } else {
            alert("Por favor, introduce tu nombre de usuario.");
        }
    }
    startGame() {
        const startModalContainer = document.getElementById("start-modal-container");
        startModalContainer.style.display = "none";
        
        // Iniciar el juego cuando se hace clic en "Comenzar"
        game.restart();
    }
    openStartModal() {
        const startModalContainer = document.getElementById("start-modal-container");
        startModalContainer.style.display = "flex";
        // Detener el juego al abrir el modal
        game.stop();
    }
    
    showScores() {
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
        this.scoresVisible = true; // Actualiza el estado
    }
    
    removeScore(index) {
        const currentScores = JSON.parse(localStorage.getItem("snakeScores")) || [];
    
        // Elimina la puntuación en el índice dado
        currentScores.splice(index, 1);
    
        // Actualiza el almacenamiento local con las puntuaciones actualizadas
        localStorage.setItem("snakeScores", JSON.stringify(currentScores));
    
        // Vuelve a mostrar las puntuaciones
        showScores();
    }
    toggleScores() {
        let scoresContainer = document.getElementById('scores-container');
        scoresContainer.classList.toggle('visible'); // Usa toggle para alternar la clase
        this.scoresVisible = !this.scoresVisible; // Invierte el estado
    }
}

export default Popups; // Exportar la clase Popups