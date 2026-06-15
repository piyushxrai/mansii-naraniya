const screens = {
  welcome: document.getElementById("welcomeScreen"),
  cake: document.getElementById("cakeScreen"),
  fireworks: document.getElementById("fireworksScreen"),
  garden: document.getElementById("gardenScreen"),
  final: document.getElementById("finalScreen")
};

const startBtn = document.getElementById("startBtn");
const cakeContinueBtn = document.getElementById("cakeContinueBtn");
const fireworksContinueBtn = document.getElementById("fireworksContinueBtn");
const gardenContinueBtn = document.getElementById("gardenContinueBtn");

const candles = [...document.querySelectorAll(".candle")];
const petals = document.getElementById("petals");
const birthdayText = document.getElementById("birthdayText");
const gardenMessage = document.getElementById("gardenMessage");
const finalMessage = document.getElementById("finalMessage");
const finalPetals = document.getElementById("finalPetals");

const gardenQuote = `If flowers could choose a queen, the tulips would step aside for you.
They may have beautiful colors, but none carry the grace you do.`;

const endingText = `If life ever lets me gift you something, I would place my eyes in your hands.
Not flowers that fade, not even words,
But the sight itself.
Look at yourself through them and you will understand
how flawless you really are👀

Lots of Love... Thank You🫶`;

function activateScreen(target) {
  Object.values(screens).forEach(screen => screen.classList.remove("active"));
  target.classList.add("active");

  if (target === screens.fireworks) startFireworksScene();
  if (target === screens.garden) startGardenScene();
  if (target === screens.final) startFinalScene();
}

startBtn.addEventListener("click", () => activateScreen(screens.cake));
cakeContinueBtn.addEventListener("click", () => activateScreen(screens.fireworks));
fireworksContinueBtn.addEventListener("click", () => activateScreen(screens.garden));
gardenContinueBtn.addEventListener("click", () => activateScreen(screens.final));

let blown = 0;
let lastIndex = -1;

function tryBlowCandle(x, y) {
  let best = null;
  let bestDistance = Infinity;

  candles.forEach((candle, index) => {
    if (candle.classList.contains("out")) return;
    const rect = candle.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top - 8;
    const distance = Math.hypot(x - cx, y - cy);

    if (distance < bestDistance) {
      bestDistance = distance;
      best = { candle, index };
    }
  });

  if (best && bestDistance < 65 && best.index !== lastIndex) {
    lastIndex = best.index;
    setTimeout(() => {
      best.candle.classList.add("out");
      blown++;

      if (blown === candles.length) {
        burstPetals();
        setTimeout(() => {
          cakeContinueBtn.classList.remove("hidden");
        }, 850);
      }
    }, 150);
  }
}

function handleFlameRub(event) {
  const point = event.touches ? event.touches[0] : event;
  tryBlowCandle(point.clientX, point.clientY);
}

screens.cake.addEventListener("mousemove", handleFlameRub);
screens.cake.addEventListener("touchmove", handleFlameRub, { passive: true });

function burstPetals() {
  const colors = ["#ff94bf", "#ff79a8", "#ffc2d7", "#c5a2ff"];
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;

  for (let i = 0; i < 28; i++) {
    const petal = document.createElement("span");
    petal.className = "petal";
    petal.style.left = `${cx}px`;
    petal.style.top = `${cy}px`;
    petal.style.background = colors[Math.floor(Math.random() * colors.length)];
    petal.style.setProperty("--x", `${(Math.random() - 0.5) * 380}px`);
    petal.style.setProperty("--y", `${-160 - Math.random() * 240}px`);
    petal.style.setProperty("--r", `${Math.random() * 540 - 270}deg`);
    petals.appendChild(petal);
    setTimeout(() => petal.remove(), 2800);
  }
}

function typeWriter(el, text, speed = 40, done) {
  el.textContent = "";
  let i = 0;

  function type() {
    if (i < text.length) {
      el.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    } else if (done) {
      done();
    }
  }

  type();
}

/* Fireworks */
const canvas = document.getElementById("fireworksCanvas");
const ctx = canvas.getContext("2d");
let particles = [];
let shells = [];
let loopStarted = false;
let fireworksScenePlayed = false;

function resizeCanvas() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

class Shell {
  constructor(x, y, tx, ty, hue, type = "normal") {
    this.x = x;
    this.y = y;
    this.sx = x;
    this.sy = y;
    this.tx = tx;
    this.ty = ty;
    this.hue = hue;
    this.type = type;
    this.angle = Math.atan2(ty - y, tx - x);
    this.speed = 8 + Math.random() * 3;
    this.distance = Math.hypot(tx - x, ty - y);
    this.travelled = 0;
    this.trail = [];
  }

  update(index) {
    this.trail.push([this.x, this.y]);
    if (this.trail.length > 8) this.trail.shift();

    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    this.travelled = Math.hypot(this.x - this.sx, this.y - this.sy);

    if (this.travelled >= this.distance) {
      explode(this.tx, this.ty, this.hue, this.type);
      shells.splice(index, 1);
    }
  }

  draw() {
    ctx.beginPath();
    const t = this.trail[0] || [this.x, this.y];
    ctx.moveTo(t[0], t[1]);
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle = `hsla(${this.hue}, 100%, 75%, 0.95)`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

class Particle {
  constructor(x, y, angle, speed, hue, decay, mode = "normal") {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = speed;
    this.hue = hue;
    this.decay = decay;
    this.alpha = 1;
    this.friction = 0.985;
    this.gravity = 0.045;
    this.mode = mode;
    this.trail = [];
  }

  update(index) {
    this.trail.push([this.x, this.y]);
    if (this.trail.length > 4) this.trail.shift();

    this.speed *= this.friction;
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed + this.gravity;
    this.alpha -= this.decay;

    if (this.alpha <= this.decay) {
      particles.splice(index, 1);
    }
  }

  draw() {
    ctx.beginPath();
    const t = this.trail[0] || [this.x, this.y];
    ctx.moveTo(t[0], t[1]);
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle = `hsla(${this.hue}, 100%, 70%, ${this.alpha})`;
    ctx.lineWidth = this.mode === "grand" ? 2.6 : 2;
    ctx.stroke();
  }
}

function explode(x, y, hue, type = "normal") {
  const total = type === "grand" ? 240 : type === "willow" ? 170 : 130;

  for (let i = 0; i < total; i++) {
    let angle = Math.random() * Math.PI * 2;
    let speed = type === "grand" ? 2 + Math.random() * 7 : 2 + Math.random() * 5.2;
    let decay = type === "willow" ? 0.006 + Math.random() * 0.004 : 0.009 + Math.random() * 0.01;

    particles.push(new Particle(x, y, angle, speed, hue, decay, type));
  }
}

function launchShell(type = "normal") {
  const x = canvas.width * (0.12 + Math.random() * 0.76);
  const y = canvas.height;
  const tx = canvas.width * (0.15 + Math.random() * 0.7);
  const ty = canvas.height * (0.12 + Math.random() * 0.42);
  const hue = 10 + Math.random() * 70;
  shells.push(new Shell(x, y, tx, ty, hue, type));
}

function animateFireworks() {
  requestAnimationFrame(animateFireworks);
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = "lighter";

  shells.forEach((shell, i) => {
    shell.draw();
    shell.update(i);
  });

  particles.forEach((particle, i) => {
    particle.draw();
    particle.update(i);
  });

  if (Math.random() < 0.2) launchShell("normal");
  if (Math.random() < 0.08) launchShell("willow");
}

function startFireworksScene() {
  if (!loopStarted) {
    loopStarted = true;
    animateFireworks();
  }

  if (fireworksScenePlayed) return;
  fireworksScenePlayed = true;

  const finale = [
    { time: 200, type: "grand", count: 3 },
    { time: 700, type: "grand", count: 4 },
    { time: 1200, type: "willow", count: 2 },
    { time: 1750, type: "grand", count: 5 },
    { time: 2400, type: "grand", count: 6 },
    { time: 3100, type: "willow", count: 3 },
    { time: 3600, type: "grand", count: 8 }
  ];

  finale.forEach(item => {
    setTimeout(() => {
      for (let i = 0; i < item.count; i++) {
        setTimeout(() => launchShell(item.type), i * 110);
      }
    }, item.time);
  });

  setTimeout(() => {
    typeWriter(birthdayText, "HAPPY BIRTHDAY MANSI ❤️", 90, () => {
      setTimeout(() => {
        fireworksContinueBtn.classList.remove("hidden");
      }, 1800);
    });
  }, 3300);
}

let gardenStarted = false;
function startGardenScene() {
  if (gardenStarted) return;
  gardenStarted = true;

  typeWriter(gardenMessage, gardenQuote, 34, () => {
    setTimeout(() => {
      gardenContinueBtn.classList.remove("hidden");
    }, 1800);
  });
}

let finalStarted = false;
function startFinalScene() {
  if (finalStarted) return;
  finalStarted = true;

  typeWriter(finalMessage, endingText, 34);
  startFallingPetals();
}

function startFallingPetals() {
  const colors = ["#ff94bf", "#ffc4d8", "#d8b1ff", "#ff78a8"];

  const interval = setInterval(() => {
    if (!screens.final.classList.contains("active")) {
      clearInterval(interval);
      return;
    }

    const petal = document.createElement("span");
    petal.className = "rain";
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.background = colors[Math.floor(Math.random() * colors.length)];
    petal.style.animationDuration = `${5 + Math.random() * 4}s`;
    finalPetals.appendChild(petal);

    setTimeout(() => petal.remove(), 10000);
  }, 260);
}