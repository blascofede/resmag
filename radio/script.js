// script.js

// Obtener el canvas y su contexto 2D
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Elementos del DOM para mostrar información
const levelDisplay = document.getElementById('level-display');
const bounceDisplay = document.getElementById('bounce-display');
const requiredBouncesDisplay = document.getElementById('required-bounces-display');
const gameStatusMessage = document.getElementById('game-status-message');
const restartButton = document.getElementById('restart-button');
const nextLevelButton = document.getElementById('next-level-button');

// Elementos de la nueva pantalla de fin de juego
const endGameScreen = document.getElementById('endGameScreen');
const endGameMessage = endGameScreen.querySelector('.end-game-message');
const prizeMessage = endGameScreen.querySelector('.prize-message');
const barDateInput = document.getElementById('bar-date');
const restartGameButton = document.getElementById('restart-game-button');


// --- Variables del Juego ---
let ball = {
    x: 0,
    y: 0,
    radius: 20, // Radio de la bola (átomo)
    vx: 0,
    vy: 0,
    speed: 8, // Velocidad constante de la bola
    image: new Image()
};

let exit = {
    x: 0,
    y: 0,
    radius: 25, // Radio de la salida (reducido a 25)
    unlocked: false,
};

let walls = []; // Array para almacenar los segmentos de pared
let stopZones = []; // Array para almacenar las zonas de detención

let currentLevel = 0; // Nivel actual (índice del array levelsData)
let bounceCount = 0; // Contador de rebotes
let requiredBounces = 0; // Rebotes requeridos para el nivel actual

let isDragging = false; // Indica si el jugador está arrastrando para lanzar
let dragStartPos = { x: 0, y: 0 }; // Posición inicial del arrastre
let dragCurrentPos = { x: 0, y: 0 }; // Posición actual del arrastre

let gameStarted = false; // True cuando la bola ha sido lanzada
let gameOver = false; // True si el nivel ha terminado (ganado o perdido)
let levelWon = false; // True si el nivel ha sido ganado

// Cargar imágenes
ball.image.src = 'assets/atomo.png'; // Ruta correcta a la imagen del átomo
ball.image.onerror = () => {
    console.error("Error al cargar la imagen 'atomo.png'. Usando color de fallback.");
    // Fallback: dibujar un círculo si la imagen no carga
    ball.drawFallback = true;
};

const stopZoneImage = new Image();
stopZoneImage.src = 'assets/campo.png'; // Ruta correcta a la imagen de la zona de detención
stopZoneImage.onerror = () => {
    console.error("Error al cargar la imagen 'campo.png'. Usando color de fallback.");
    // Fallback: dibujar un círculo si la imagen no carga
    stopZoneImage.drawFallback = true;
};

const titleImage = new Image();
titleImage.src = 'assets/titulo.png'; // Ruta correcta a la imagen del título
titleImage.onerror = () => {
    console.error("Error al cargar la imagen 'titulo.png'. Asegúrate de que la ruta sea correcta.");
    // Si la imagen del título no carga, se podría mostrar un texto de fallback en el HTML
    document.getElementById('game-title').alt = "RES-MAG"; // Alt text actualizado
    document.getElementById('game-title').style.display = 'none'; // Ocultar la imagen rota
    // Podrías añadir un elemento h1 de fallback si lo deseas aquí
};


// --- Datos de los Niveles ---
// Define la configuración de cada nivel: paredes, posición inicial de la bola, salida, zonas de detención y rebotes requeridos.
// Las coordenadas son relativas al tamaño del canvas, se escalarán al dibujar.
const levelsData = [
    // Nivel 1: 1 rebote
    {
        walls: [
            { x1: 0.1, y1: 0.1, x2: 0.9, y2: 0.1 }, // Arriba
            { x1: 0.9, y1: 0.1, x2: 0.9, y2: 0.9 }, // Derecha
            { x1: 0.9, y1: 0.9, x2: 0.1, y2: 0.9 }, // Abajo
            { x1: 0.1, y1: 0.9, x2: 0.1, y2: 0.1 }  // Izquierda
        ],
        ballStart: { x: 0.2, y: 0.5 },
        exitPos: { x: 0.8, y: 0.5 },
        stopZones: [{ x: 0.5, y: 0.2 }],
        requiredBounces: 1
    },
    // Nivel 2: 2 rebotes
    {
        walls: [
            { x1: 0.1, y1: 0.1, x2: 0.9, y2: 0.1 },
            { x1: 0.9, y1: 0.1, x2: 0.9, y2: 0.9 },
            { x1: 0.9, y1: 0.9, x2: 0.1, y2: 0.9 },
            { x1: 0.1, y1: 0.9, x2: 0.1, y2: 0.1 },
            { x1: 0.5, y1: 0.1, x2: 0.5, y2: 0.7 } // Pared central vertical
        ],
        ballStart: { x: 0.2, y: 0.2 },
        exitPos: { x: 0.8, y: 0.8 },
        stopZones: [{ x: 0.3, y: 0.7 }, { x: 0.7, y: 0.3 }],
        requiredBounces: 2
    },
    // Nivel 3: 3 rebotes
    {
        walls: [
            { x1: 0.1, y1: 0.1, x2: 0.9, y2: 0.1 },
            { x1: 0.9, y1: 0.1, x2: 0.9, y2: 0.9 },
            { x1: 0.9, y1: 0.9, x2: 0.1, y2: 0.9 },
            { x1: 0.1, y1: 0.9, x2: 0.1, y2: 0.1 },
            { x1: 0.3, y1: 0.3, x2: 0.7, y2: 0.3 }, // Pared horizontal
            { x1: 0.3, y1: 0.7, x2: 0.7, y2: 0.7 }  // Otra pared horizontal
        ],
        ballStart: { x: 0.2, y: 0.5 },
        exitPos: { x: 0.8, y: 0.5 },
        stopZones: [{ x: 0.5, y: 0.5 }],
        requiredBounces: 3
    },
    // Nivel 4: 4 rebotes
    {
        walls: [
            { x1: 0.1, y1: 0.1, x2: 0.9, y2: 0.1 },
            { x1: 0.9, y1: 0.1, x2: 0.9, y2: 0.9 },
            { x1: 0.9, y1: 0.9, x2: 0.1, y2: 0.9 },
            { x1: 0.1, y1: 0.9, x2: 0.1, y2: 0.1 },
            { x1: 0.3, y1: 0.1, x2: 0.3, y2: 0.5 },
            { x1: 0.7, y1: 0.5, x2: 0.7, y2: 0.9 }
        ],
        ballStart: { x: 0.2, y: 0.2 },
        exitPos: { x: 0.8, y: 0.8 },
        stopZones: [{ x: 0.4, y: 0.7 }, { x: 0.6, y: 0.3 }],
        requiredBounces: 4
    },
    // Nivel 5: 5 rebotes (REDESIGNADO para ser más fácil y jugable)
    {
        walls: [
            { x1: 0.1, y1: 0.1, x2: 0.9, y2: 0.1 }, // Borde superior
            { x1: 0.9, y1: 0.1, x2: 0.9, y2: 0.9 }, // Borde derecho
            { x1: 0.9, y1: 0.9, x2: 0.1, y2: 0.9 }, // Borde inferior
            { x1: 0.1, y1: 0.9, x2: 0.1, y2: 0.1 }, // Borde izquierdo

            // Paredes internas con un camino más simple y directo
            { x1: 0.3, y1: 0.3, x2: 0.7, y2: 0.3 }, // Pared horizontal superior
            { x1: 0.3, y1: 0.7, x2: 0.7, y2: 0.7 }, // Pared horizontal inferior
            { x1: 0.5, y1: 0.1, x2: 0.5, y2: 0.3 }, // Pared vertical superior central
            { x1: 0.5, y1: 0.7, x2: 0.5, y2: 0.9 }  // Pared vertical inferior central
        ],
        ballStart: { x: 0.2, y: 0.2 }, // Posición inicial en la esquina superior izquierda
        exitPos: { x: 0.8, y: 0.8 },   // Salida en la esquina inferior derecha
        stopZones: [{ x: 0.5, y: 0.5 }], // Zona de detención central
        requiredBounces: 5
    }
    // No hay más niveles después del nivel 5
];

// --- Funciones de Inicialización y Carga de Nivel ---

/**
 * Ajusta el tamaño del canvas para que sea cuadrado y responsivo.
 */
function resizeCanvas() {
    const containerWidth = canvas.parentElement.clientWidth;
    // Establece el ancho y alto del canvas al mismo valor para que sea cuadrado
    // Limita el tamaño para que no sea demasiado grande en pantallas de escritorio
    const size = Math.min(containerWidth * 0.9, 500); // 90% del contenedor o 500px máx
    canvas.width = size;
    canvas.height = size;
    // Vuelve a cargar el nivel para que los elementos se dibujen en la nueva escala
    if (gameStarted || gameOver) {
        loadLevel(currentLevel);
        draw(); // Redibuja el canvas inmediatamente después del redimensionamiento
    } else {
        // Si el juego aún no ha empezado, solo redibuja el estado inicial
        loadLevel(currentLevel);
        draw();
    }
}

/**
 * Carga los datos de un nivel específico y reinicia el estado del juego.
 * @param {number} levelIndex - El índice del nivel a cargar (0-9).
 */
function loadLevel(levelIndex) {
    // Si se intenta cargar un nivel más allá del Nivel 5, termina el juego con victoria
    if (levelIndex >= 5) { // El juego termina después del Nivel 5 (índice 4)
        endGameWin();
        return;
    }

    currentLevel = levelIndex;
    const level = levelsData[currentLevel];

    // Reiniciar variables del juego
    bounceCount = 0;
    requiredBounces = level.requiredBounces;
    gameStarted = false;
    gameOver = false;
    levelWon = false;
    exit.unlocked = false;
    ball.vx = 0;
    ball.vy = 0;

    // Escalar posiciones y tamaños de los elementos del nivel
    const scale = canvas.width; // Usamos el ancho del canvas como escala base

    // Posición inicial de la bola
    ball.x = level.ballStart.x * scale;
    ball.y = level.ballStart.y * scale;

    // Posición de la salida
    exit.x = level.exitPos.x * scale;
    exit.y = level.exitPos.y * scale;

    // Paredes
    walls = level.walls.map(w => ({
        x1: w.x1 * scale,
        y1: w.y1 * scale,
        x2: w.x2 * scale,
        y2: w.y2 * scale
    }));

    // Zonas de detención (radio más pequeño)
    // Se ha ajustado el radio de la zona de detención para que sea más pequeña
    // Se añade la propiedad 'hit' para controlar si ya ha sido activada
    stopZones = level.stopZones.map(sz => ({
        x: sz.x * scale,
        y: sz.y * scale,
        radius: 10, // Radio de la zona de detención
        hit: false // Nueva propiedad para indicar si la zona ya ha sido activada
    }));

    // Actualizar la interfaz de usuario
    updateUI();
    gameStatusMessage.textContent = ""; // Limpiar mensajes de estado
    gameStatusMessage.classList.remove('error', 'success', 'info'); // Limpiar clases de estilo
    nextLevelButton.style.display = 'none'; // Ocultar botón de siguiente nivel
    restartButton.style.display = 'block'; // Mostrar botón de reiniciar

    // Ocultar la pantalla de fin de juego si estaba visible
    endGameScreen.style.display = 'none';
    canvas.style.display = 'block';
    document.querySelector('.game-info').style.display = 'flex';
    document.querySelector('.controls').style.display = 'flex';
}

/**
 * Actualiza los elementos de la interfaz de usuario.
 */
function updateUI() {
    levelDisplay.textContent = currentLevel + 1;
    bounceDisplay.textContent = bounceCount;
    requiredBouncesDisplay.textContent = requiredBounces;
}

// --- Funciones de Dibujo ---

/**
 * Dibuja la bola (átomo) en el canvas.
 */
function drawBall() {
    if (ball.image.complete && !ball.drawFallback) {
        // Si la imagen se cargó correctamente, dibujarla
        ctx.drawImage(ball.image, ball.x - ball.radius, ball.y - ball.radius, ball.radius * 2, ball.radius * 2);
    } else {
        // Fallback: dibujar un círculo si la imagen no carga
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#f1c40f'; // Color de fallback para la bola
        ctx.fill();
        ctx.strokeStyle = '#d35400';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

/**
 * Dibuja todas las paredes en el canvas.
 */
function drawWalls() {
    ctx.strokeStyle = '#ecf0f1'; // Color de las paredes
    ctx.lineWidth = 5; // Grosor de las paredes
    ctx.lineCap = 'round'; // Extremos redondeados para las paredes

    walls.forEach(wall => {
        ctx.beginPath();
        ctx.moveTo(wall.x1, wall.y1);
        ctx.lineTo(wall.x2, wall.y2);
        ctx.stroke();
    });
}

/**
 * Dibuja la salida en el canvas.
 */
function drawExit() {
    // Se ha revertido al dibujo circular de la salida
    ctx.beginPath();
    ctx.arc(exit.x, exit.y, exit.radius, 0, Math.PI * 2);
    ctx.fillStyle = exit.unlocked ? '#2ecc71' : '#e74c3c'; // Verde si desbloqueado, rojo si bloqueado
    ctx.fill();
    ctx.strokeStyle = '#bdc3c7';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Dibujar un icono de "salida" o "flecha" en el centro de la salida
    ctx.fillStyle = '#ffffff';
    ctx.font = `${exit.radius * 0.8}px FontAwesome`; // Usar FontAwesome
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\uf054', exit.x, exit.y); // Unicode para un icono de flecha derecha (fa-arrow-right)
}

/**
 * Dibuja las zonas de detención en el canvas.
 */
function drawStopZones() {
    stopZones.forEach(sz => {
        // Si la zona ya ha sido activada, dibujarla con un color diferente o más tenue
        if (sz.hit) {
            ctx.globalAlpha = 0.4; // Hacerla semitransparente
        }

        if (stopZoneImage.complete && !stopZoneImage.drawFallback) {
            // Si la imagen se cargó correctamente, dibujarla
            // El tamaño de la imagen de la zona de detención iguala el tamaño de la bola
            const imageSize = ball.radius * 2; // Tamaño de la imagen igual al diámetro de la bola
            ctx.drawImage(stopZoneImage, sz.x - imageSize / 2, sz.y - imageSize / 2, imageSize, imageSize);
        } else {
            // Fallback: dibujar un círculo si la imagen no carga
            ctx.beginPath();
            ctx.arc(sz.x, sz.y, sz.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#3498db'; // Color de fallback para la zona de detención
            ctx.fill();
            ctx.strokeStyle = '#2980b9';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        ctx.globalAlpha = 1.0; // Restablecer la opacidad
    });
}

/**
 * Dibuja la línea de lanzamiento mientras se arrastra.
 */
function drawLaunchLine() {
    if (isDragging) {
        ctx.strokeStyle = '#f39c12'; // Color naranja para la línea de lanzamiento
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(ball.x, ball.y);
        // Dibujar la línea en la dirección opuesta al arrastre para simular "Angry Birds"
        const dx = dragStartPos.x - dragCurrentPos.x;
        const dy = dragStartPos.y - dragCurrentPos.y;
        const lineLength = Math.min(Math.sqrt(dx * dx + dy * dy), 100); // Limitar la longitud visual
        const angle = Math.atan2(dy, dx);
        ctx.lineTo(ball.x + Math.cos(angle) * lineLength, ball.y + Math.sin(angle) * lineLength);
        ctx.stroke();

        // Dibujar una flecha al final de la línea
        const headlen = 15; // longitud de la cabeza de la flecha
        ctx.beginPath();
        ctx.moveTo(ball.x + Math.cos(angle) * lineLength, ball.y + Math.sin(angle) * lineLength);
        ctx.lineTo(ball.x + Math.cos(angle - Math.PI / 7) * (lineLength - headlen), ball.y + Math.sin(angle - Math.PI / 7) * (lineLength - headlen));
        ctx.moveTo(ball.x + Math.cos(angle) * lineLength, ball.y + Math.sin(angle) * lineLength);
        ctx.lineTo(ball.x + Math.cos(angle + Math.PI / 7) * (lineLength - headlen), ball.y + Math.sin(angle + Math.PI / 7) * (lineLength - headlen));
        ctx.stroke();
    }
}

/**
 * Función principal de dibujo.
 */
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el canvas
    drawWalls();
    drawExit();
    drawStopZones();
    drawBall();
    drawLaunchLine(); // Dibujar la línea de lanzamiento si se está arrastrando
}

// --- Lógica del Juego ---

/**
 * Actualiza la posición de la bola y maneja las colisiones.
 */
function update() {
    if (gameOver || !gameStarted) return;

    // Mover la bola
    ball.x += ball.vx;
    ball.y += ball.vy;

    // 1. Manejar colisiones con los bordes del canvas (para asegurar que la bola nunca salga)
    // Se usa un pequeño "padding" para asegurar que la bola no se superponga con el borde
    let bouncedOnBoundary = false;
    const boundaryEpsilon = 1.0; // Un poco más de padding para mayor seguridad

    if (ball.x + ball.radius > canvas.width) {
        ball.x = canvas.width - ball.radius - boundaryEpsilon;
        ball.vx *= -1;
        bouncedOnBoundary = true;
    } else if (ball.x - ball.radius < 0) {
        ball.x = ball.radius + boundaryEpsilon;
        ball.vx *= -1;
        bouncedOnBoundary = true;
    }

    if (ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius - boundaryEpsilon;
        ball.vy *= -1;
        bouncedOnBoundary = true;
    } else if (ball.y - ball.radius < 0) {
        ball.y = ball.radius + boundaryEpsilon;
        ball.vy *= -1;
        bouncedOnBoundary = true;
    }
    
    // Si hubo un rebote en el borde del canvas, incrementar el contador y normalizar velocidad
    if (bouncedOnBoundary) {
        bounceCount++;
        updateUI();
        const currentSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
        if (currentSpeed > 0) {
            ball.vx = (ball.vx / currentSpeed) * ball.speed;
            ball.vy = (ball.vy / currentSpeed) * ball.speed;
        }
    }


    // 2. Colisión con paredes internas
    walls.forEach(wall => {
        // Calcular la distancia más cercana del centro de la bola a la línea del muro
        const lineVecX = wall.x2 - wall.x1;
        const lineVecY = wall.y2 - wall.y1;
        const ballToWallStartVecX = ball.x - wall.x1;
        const ballToWallStartVecY = ball.y - wall.y1;

        const dotProductProjection = (ballToWallStartVecX * lineVecX + ballToWallStartVecY * lineVecY);
        const lineLengthSq = (lineVecX * lineVecX + lineVecY * lineVecY);
        let t = 0;
        if (lineLengthSq !== 0) {
            t = dotProductProjection / lineLengthSq;
            t = Math.max(0, Math.min(1, t)); // Clamp t to the segment
        }

        const closestX = wall.x1 + t * lineVecX;
        const closestY = wall.y1 + t * lineVecY;

        const distFromClosestPointToBallSq = (ball.x - closestX) * (ball.x - closestX) + (ball.y - closestY) * (ball.y - closestY);

        if (distFromClosestPointToBallSq < ball.radius * ball.radius) {
            // Collision detected
            const distFromClosestPointToBall = Math.sqrt(distFromClosestPointToBallSq);

            // Calculate penetration depth
            const penetrationDepth = ball.radius - distFromClosestPointToBall;

            // Calculate collision normal (vector from closest point to ball center)
            const normalX = (ball.x - closestX) / distFromClosestPointToBall;
            const normalY = (ball.y - closestY) / distFromClosestPointToBall;

            // Reposition ball to prevent sticking (push out along the normal)
            // Add a small epsilon to ensure it's fully out
            ball.x += normalX * (penetrationDepth + 1.0); // Aumentado el buffer para mayor seguridad
            ball.y += normalY * (penetrationDepth + 1.0);

            // Calculate dot product of ball velocity and collision normal
            // This tells us if the ball is moving towards or away from the wall
            const velocityDotNormal = ball.vx * normalX + ball.vy * normalY;

            // Only reflect velocity and count bounce if ball is moving towards the wall
            if (velocityDotNormal < 0) {
                bounceCount++;
                updateUI();

                // Reflect velocity
                ball.vx -= 2 * velocityDotNormal * normalX;
                ball.vy -= 2 * velocityDotNormal * normalY;

                // Normalizar la velocidad para mantener la velocidad constante
                const currentSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
                if (currentSpeed > 0) {
                    ball.vx = (ball.vx / currentSpeed) * ball.speed;
                    ball.vy = (ball.vy / currentSpeed) * ball.speed;
                }
            }
        }
    });

    // Colisión con zonas de detención
    stopZones.forEach(sz => {
        const dist = Math.sqrt(Math.pow(ball.x - sz.x, 2) + Math.pow(ball.y - sz.y, 2));
        // Solo detener si la zona no ha sido activada previamente
        if (dist < ball.radius + sz.radius && !sz.hit) {
            // La bola ha chocado con una zona de detención
            gameStarted = false; // Detener el movimiento de la bola
            ball.vx = 0;
            ball.vy = 0;
            sz.hit = true; // Marcar la zona como activada
            gameStatusMessage.textContent = "La bola se ha detenido en una zona."; // Mensaje corregido
            gameStatusMessage.classList.remove('error', 'success');
            gameStatusMessage.classList.add('info');
            // No se fuerza el reinicio, el jugador puede lanzar de nuevo
            restartButton.style.display = 'block'; // El botón de reiniciar sigue siendo útil
            nextLevelButton.style.display = 'none';
        }
    });

    // Desbloquear la salida si los rebotes son correctos
    if (bounceCount === requiredBounces) {
        exit.unlocked = true;
    } else {
        exit.unlocked = false; // Asegurarse de que se bloquea si el conteo es incorrecto
    }

    // Colisión con la salida
    const distToExit = Math.sqrt(Math.pow(ball.x - exit.x, 2) + Math.pow(ball.y - exit.y, 2));
    if (distToExit < ball.radius + exit.radius) {
        if (exit.unlocked) {
            gameOver = true;
            levelWon = true;
            // Si es el último nivel, llamar a la función de fin de juego con victoria
            if (currentLevel === levelsData.length - 1) {
                endGameWin();
            } else {
                gameStatusMessage.textContent = "¡Victoria! Nivel completado.";
                gameStatusMessage.classList.remove('error', 'info');
                gameStatusMessage.classList.add('success');
                restartButton.style.display = 'none';
                nextLevelButton.style.display = 'block';
                ball.vx = 0;
                ball.vy = 0;
            }
        } else {
            // Llegó a la salida pero no está desbloqueada
            gameOver = true;
            levelWon = false;
            gameStatusMessage.textContent = `¡Derrota! Necesitas ${requiredBounces} rebotes para escapar.`;
            gameStatusMessage.classList.remove('success', 'info');
            gameStatusMessage.classList.add('error');
            restartButton.style.display = 'block';
            nextLevelButton.style.display = 'none';
            ball.vx = 0;
            ball.vy = 0;
        }
    }

    // Verificar condición de derrota por exceso de rebotes (esta lógica ya estaba, pero ahora el conteo es más preciso)
    if (bounceCount > requiredBounces && !gameOver) { // Añadido !gameOver para no sobrescribir victorias
        gameOver = true;
        levelWon = false;
        gameStatusMessage.textContent = `¡Derrota! Excediste los ${requiredBounces} rebotes.`;
        gameStatusMessage.classList.remove('success', 'info');
        gameStatusMessage.classList.add('error');
        restartButton.style.display = 'block';
        nextLevelButton.style.display = 'none';
        ball.vx = 0;
        ball.vy = 0;
    }
}

/**
 * Función para manejar el fin del juego con victoria.
 */
function endGameWin() {
    gameOver = true;
    gameStarted = false;
    levelWon = true;

    // Ocultar elementos del juego
    canvas.style.display = 'none';
    document.querySelector('.game-info').style.display = 'none';
    document.querySelector('.controls').style.display = 'none';
    gameStatusMessage.style.display = 'none'; // Ocultar el mensaje de estado normal

    // Mostrar la pantalla de fin de juego
    endGameScreen.style.display = 'flex';
    endGameMessage.textContent = "¡FELICITACIONES! ¡Has completado todos los niveles de RES-MAG!";
    prizeMessage.textContent = "¡Como premio por tu increíble habilidad, has ganado una salida a un bar con el creador del juego!";

    // Establecer la fecha mínima para el calendario (hoy)
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Meses son 0-indexados
    const day = String(today.getDate()).padStart(2, '0');
    barDateInput.min = `${year}-${month}-${day}`;

    // Reiniciar el juego si se hace clic en el botón "Volver a Jugar"
    restartGameButton.addEventListener('click', () => {
        currentLevel = 0; // Volver al primer nivel
        loadLevel(currentLevel);
        gameStatusMessage.style.display = 'block'; // Mostrar el mensaje de estado de nuevo
    });
}


/**
 * Bucle principal del juego.
 */
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop); // Solicitar el siguiente frame de animación
}

// --- Manejo de Eventos (Touch para lanzamiento) ---

/**
 * Convierte las coordenadas del evento táctil a coordenadas relativas al canvas.
 * @param {TouchEvent} event - El evento táctil.
 * @returns {{x: number, y: number}} - Coordenadas relativas al canvas.
 */
function getTouchPos(event) {
    const rect = canvas.getBoundingClientRect();
    const touch = event.touches[0];
    return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
    };
}

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Evitar el scroll y zoom del navegador
    if (gameOver || gameStarted) return; // No permitir lanzamiento si el juego ha terminado o la bola ya está en movimiento

    isDragging = true;
    dragStartPos = getTouchPos(e);
    dragCurrentPos = { ...dragStartPos }; // Inicializar dragCurrentPos
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!isDragging) return;

    dragCurrentPos = getTouchPos(e);
    draw(); // Redibujar para mostrar la línea de lanzamiento
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (!isDragging || gameStarted) {
        isDragging = false;
        return;
    }

    isDragging = false;

    // Calcular el vector de lanzamiento (Angry Birds style)
    // La dirección de la velocidad es opuesta a la dirección del arrastre
    const dx = dragStartPos.x - dragCurrentPos.x;
    const dy = dragStartPos.y - dragCurrentPos.y;

    const magnitude = Math.sqrt(dx * dx + dy * dy);
    // Limitar la fuerza de lanzamiento para evitar velocidades excesivas
    const maxLaunchForce = 150; // Ajusta este valor según sea necesario
    const clampedMagnitude = Math.min(magnitude, maxLaunchForce);

    // Calcular la velocidad inicial
    if (clampedMagnitude > 5) { // Solo lanzar si hay un arrastre significativo
        ball.vx = (dx / magnitude) * ball.speed * (clampedMagnitude / maxLaunchForce);
        ball.vy = (dy / magnitude) * ball.speed * (clampedMagnitude / maxLaunchForce);
        gameStarted = true;
        gameStatusMessage.textContent = ""; // Limpiar mensaje de estado al lanzar
        gameStatusMessage.classList.remove('error', 'success', 'info');
    } else {
        // Si el arrastre es muy pequeño, no lanzar y resetear
        gameStarted = false;
        ball.vx = 0;
        ball.vy = 0;
        draw(); // Redibujar para limpiar la línea de lanzamiento
    }
});

// --- Botones de Control ---
restartButton.addEventListener('click', () => {
    loadLevel(currentLevel); // Reiniciar el nivel actual
});

nextLevelButton.addEventListener('click', () => {
    loadLevel(currentLevel + 1); // Cargar el siguiente nivel
});

// --- Inicialización del Juego ---
window.onload = function() {
    resizeCanvas(); // Ajustar el tamaño del canvas al cargar
    loadLevel(0); // Cargar el primer nivel al iniciar
    gameLoop(); // Iniciar el bucle del juego
};

// Escuchar cambios de tamaño de la ventana para hacer el canvas responsivo
window.addEventListener('resize', resizeCanvas);

