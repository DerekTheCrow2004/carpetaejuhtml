// llamado a javascript desde index html
// const : Declaración de la constante
// canvas y ctx : constantes declaradas en js
//document : Objeto global que permite acceder al HTML
// get.ElementById : Método que busca el atributo html "gamecanvas"
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');


// Dibujar rectangulo o paddle
ctx.fillStyle = "blue";
ctx.fillRect(100, 550, 80, 20);

//Dibujar bola (objeto a atrapar)
ctx.beginPath();
ctx.arc(200, 50, 15, 0, Math.PI * 2);
ctx.fillStyle = "red";
ctx.fill();
ctx.closePath();
let y = 50; 
let animationId = null;
let running = false;
let lastTime = 0;
let spawnTimer = 0;
let spawnInterval = 1000; // ms entre objetos nuevos
let items = [];
let score = 0;
let lives = 3;
let difficultyIncreaseScore = 10; // sube dificultad cada X puntos
let paddleX = 160;
const paddleWidth = 80;
const paddleHeight = 20;
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" && paddleX > 0) {
    paddleX -= 20;
  }
  if (e.key === "ArrowRight" && paddleX < canvas.width - paddleWidth) {
    paddleX += 20;
  }
});

const paddle = {
    width: 120,
    height: 16,
    x: (canvas.width - 120) / 2,
    y: canvas.height - 30,
    speed: 420, // px/s
    vx: 0
  };

const keys = { left: false, right: false };

function rand(min, max) { return Math.random() * (max - min) + min; }

  function spawnItem() {
    const radius = rand(10, 18);
    const speed = rand(120, 230) + Math.min(score * 3, 300); // aumenta con score
    const color = `hsl(${Math.floor(rand(0,360))} 80% 50%)`;
    items.push({
      x: rand(radius, canvas.width - radius),
      y: -radius,
      r: radius,
      speed,
      color
    });
  }

  function resetGame() {
    items = [];
    score = 0;
    lives = 3;
    spawnInterval = 1000;
    updateHUD();
    running = false;
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  function updateHUD() {
    scoreEl.textContent = `Puntuación: ${score}`;
    livesEl.textContent = `Vidas: ${lives}`;
  }

  // --- Colisión círculo vs rectángulo (paddle) ---
  function circleRectCollision(circle, rect) {
    // Encuentra el punto más cercano en el rectángulo al centro del círculo
    const nearestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const nearestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
    const dx = circle.x - nearestX;
    const dy = circle.y - nearestY;
    return (dx*dx + dy*dy) <= (circle.r * circle.r);
  }

  // --- Lógica de actualización ---
  function update(delta) {
    const dt = delta / 1000;

    // Mover paddle según teclas
    if (keys.left) paddle.vx = -paddle.speed;
    else if (keys.right) paddle.vx = paddle.speed;
    else paddle.vx = 0;

    paddle.x += paddle.vx * dt;
    // límites
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;

    // Mover objetos
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      it.y += it.speed * dt;

      // Colisión con paddle -> atrapa
      if (circleRectCollision(it, { x: paddle.x, y: paddle.y, width: paddle.width, height: paddle.height })) {
        score += 1;
        items.splice(i,1);
        updateHUD();

        // ajustar dificultad
        if (score % difficultyIncreaseScore === 0) {
          spawnInterval = Math.max(300, spawnInterval - 100);
        }
        continue;
      }

      // Si pasa el fondo -> pierde vida
      if (it.y - it.r > canvas.height) {
        items.splice(i,1);
        lives -= 1;
        updateHUD();
        if (lives <= 0) {
          endGame();
          return;
        }
      }
    }
  }

  // Creaciòn de la funciòn para interactividad de la bola 
  function draw() {
    // limpiar
    ctx.clearRect(0,0,canvas.width, canvas.height);

    // fondo sutil (se puede omitir)
    const g = ctx.createLinearGradient(0,0,0,canvas.height);
    g.addColorStop(0, 'rgba(255,255,255,0.65)');
    g.addColorStop(1, 'rgba(200,230,255,0.3)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,canvas.width, canvas.height);

    // dibujar paddle
    ctx.fillStyle = '#0d47a1';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    // borde
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);

    // dibujar objetos
    items.forEach(it => {
      ctx.beginPath();
      ctx.fillStyle = it.color;
      ctx.arc(it.x, it.y, it.r, 0, Math.PI*2);
      ctx.fill();
      ctx.closePath();
      // pequeño brillo
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.arc(it.x - it.r*0.35, it.y - it.r*0.35, it.r*0.35, 0, Math.PI*2);
      ctx.fill();
      ctx.closePath();
    });

    // HUD flotante (opcional)
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.font = '14px Roboto, sans-serif';
    ctx.fillText(`Puntos: ${score}`, 10, 22);
    ctx.fillText(`Vidas: ${lives}`, canvas.width - 80, 22);

    // Si no corriendo y hay vidas (pantalla de inicio)
    if (!running && lives > 0 && score === 0) {
      ctx.fillStyle = 'rgba(13,71,161,0.9)';
      ctx.font = '20px Roboto, sans-serif';
      ctx.fillText('Pulsa INICIAR para jugar', canvas.width/2 - 110, canvas.height/2);
    }

    // Game Over overlay
    if (!running && lives <= 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0,0,canvas.width, canvas.height);
      ctx.fillStyle = '#fff';
      ctx.font = '28px Roboto, sans-serif';
      ctx.fillText('GAME OVER', canvas.width/2 - 80, canvas.height/2 - 10);
      ctx.font = '16px Roboto, sans-serif';
      ctx.fillText(`Puntuación final: ${score}`, canvas.width/2 - 85, canvas.height/2 + 20);
      ctx.fillText('Pulsa REINICIAR para jugar otra vez', canvas.width/2 - 135, canvas.height/2 + 50);
    }
  } 

  // --- Fin del juego ---
  function endGame() {
    running = false;
    cancelAnimationFrame(animationId);
    animationId = null;
    draw(); // dibujar overlay game over
  }

  // --- Bucle principal ---
  function loop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const delta = timestamp - lastTime;
    lastTime = timestamp;

    // manejar spawn
    spawnTimer += delta;
    if (spawnTimer > spawnInterval) {
      spawnItem();
      spawnTimer = 0;
    }

    update(delta);
    draw();

    if (running) animationId = requestAnimationFrame(loop);
  }

// --- Controles ---
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
  });

  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
  });

  // mover paddle con ratón
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    paddle.x = mx - paddle.width / 2;
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;
  });

  // controles táctiles (mobile)
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const tx = touch.clientX - rect.left;
    paddle.x = tx - paddle.width / 2;
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;
  }, { passive: false });

  // --- Botones UI ---
  startBtn.addEventListener('click', () => {
    if (!running) {
      running = true;
      lastTime = 0;
      spawnTimer = 0;
      animationId = requestAnimationFrame(loop);
    }
  });

  pauseBtn.addEventListener('click', () => {
    if (running) {
      running = false;
      cancelAnimationFrame(animationId);
      animationId = null;
      pauseBtn.textContent = 'Continuar';
    } else {
      if (lives > 0) {
        running = true;
        lastTime = 0;
        animationId = requestAnimationFrame(loop);
        pauseBtn.textContent = 'Pausar';
      }
    }
  });

  restartBtn.addEventListener('click', () => {
    resetGame();
    draw();
  });

  // iniciar HUD y dibujar pantalla inicial
  updateHUD();
  draw();



