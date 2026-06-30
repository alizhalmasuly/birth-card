'use strict';

/* =========================================================
   ГЛОБАЛЬНОЕ СОСТОЯНИЕ
   ========================================================= */
const TOTAL_PAGES = 10;
let currentPage = 1;
let isAnimating = false;

const pages = document.querySelectorAll('.page');
const cardWrapper = document.getElementById('cardWrapper');

/* =========================================================
   ПРЕЛОАДЕР
   ========================================================= */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('is-hidden');
      animateHeroWords();
    }, 900);
  });
  // Подстраховка, если событие load уже прошло
  if (document.readyState === 'complete') {
    setTimeout(() => {
      preloader.classList.add('is-hidden');
      animateHeroWords();
    }, 900);
  }
}

/* =========================================================
   КАСТОМНЫЙ КУРСОР
   ========================================================= */
function initCustomCursor() {
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;
  if (window.matchMedia('(hover: none)').matches) return;

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateRing);
  }
  animateRing();

  const hoverTargets = 'a, button, .gallery-frame, .trait-card, .polaroid, input, .music-toggle';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverTargets)) ring.classList.add('is-hover');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverTargets)) ring.classList.remove('is-hover');
  });
}

/* =========================================================
   ИНДИКАТОР ПРОГРЕССА
   ========================================================= */
function initProgressDots() {
  const container = document.getElementById('progressDots');
  container.innerHTML = '';
  for (let i = 1; i <= TOTAL_PAGES; i++) {
    const dot = document.createElement('span');
    dot.className = 'dot';
    dot.dataset.page = i;
    container.appendChild(dot);
  }
  updateProgressDots();
}

function updateProgressDots() {
  const dots = document.querySelectorAll('.progress-dots .dot');
  dots.forEach((dot) => {
    const pageNum = Number(dot.dataset.page);
    dot.classList.toggle('is-active', pageNum === currentPage);
    dot.classList.toggle('is-done', pageNum < currentPage);
  });
}

/* =========================================================
   НАВИГАЦИЯ МЕЖДУ СТРАНИЦАМИ
   ========================================================= */
function goToPage(pageNumber) {
  if (isAnimating || pageNumber === currentPage || pageNumber < 1 || pageNumber > TOTAL_PAGES) return;
  isAnimating = true;

  const current = document.querySelector(`.page[data-page="${currentPage}"]`);
  const next = document.querySelector(`.page[data-page="${pageNumber}"]`);

  current.classList.add('is-leaving');
  current.classList.remove('is-active');

  setTimeout(() => {
    current.classList.remove('is-leaving');
    next.classList.add('is-active');
    currentPage = pageNumber;
    updateProgressDots();
    handlePageEnter(pageNumber);
    isAnimating = false;
  }, 420);
}

function handlePageEnter(pageNumber) {
  document.body.classList.toggle('is-dark-page', pageNumber === 10);

  if (pageNumber === 4) startTypewriter();
  if (pageNumber === 10) startFinaleShow();
  if (pageNumber === 7) animateStatCounters();
  if (pageNumber === 1) {
    resetHeroWords();
    setTimeout(animateHeroWords, 80);
  }
}

function initNavigation() {
  document.getElementById('startJourney').addEventListener('click', () => goToPage(2));
  document.getElementById('watchAgain').addEventListener('click', () => {
    goToPage(1);
    stopFinaleShow();
  });

  document.querySelectorAll('.nav-next').forEach((btn) => {
    btn.addEventListener('click', () => goToPage(currentPage + 1));
  });
  document.querySelectorAll('.nav-prev').forEach((btn) => {
    btn.addEventListener('click', () => goToPage(currentPage - 1));
  });

  // Навигация клавиатурой
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') goToPage(currentPage + 1);
    if (e.key === 'ArrowLeft') goToPage(currentPage - 1);
  });

  // Свайпы на мобильных
  let touchStartX = 0;
  cardWrapper.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  cardWrapper.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) < 60) return;
    if (diff < 0) goToPage(currentPage + 1);
    else goToPage(currentPage - 1);
  }, { passive: true });
}

/* =========================================================
   СТРАНИЦА 1 — АНИМАЦИЯ СЛОВ ЗАГОЛОВКА
   ========================================================= */
function animateHeroWords() {
  const words = document.querySelectorAll('.reveal-word');
  words.forEach((word, i) => {
    word.style.animationDelay = `${0.15 + i * 0.09}s`;
  });
  const items = document.querySelectorAll('.page--hero .reveal-item');
  items.forEach((item, i) => {
    item.style.animationDelay = `${0.7 + i * 0.18}s`;
  });
}
function resetHeroWords() {
  const words = document.querySelectorAll('.reveal-word, .page--hero .reveal-item');
  words.forEach((el) => {
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
  });
}

/* =========================================================
   СТРАНИЦА 4 — ЭФФЕКТ ПЕЧАТНОЙ МАШИНКИ
   ========================================================= */
const congratsMessage = `Аслан!

Пусть этот год принесёт тебе множество ярких событий, настоящих друзей, крепкого здоровья, исполнения самых смелых мечтаний и огромного количества счастливых моментов.

Пусть впереди будет ещё больше побед, путешествий, новых впечатлений и успехов.

С днём рождения!`;

let typewriterStarted = false;
let typewriterTimeout = null;

function startTypewriter() {
  const textEl = document.getElementById('typewriterText');
  if (typewriterStarted) return;
  typewriterStarted = true;

  textEl.textContent = '';
  let index = 0;

  function typeNextChar() {
    if (index < congratsMessage.length) {
      textEl.textContent += congratsMessage.charAt(index);
      index++;
      const char = congratsMessage.charAt(index - 1);
      const delay = char === '\n' ? 220 : 26 + Math.random() * 28;
      typewriterTimeout = setTimeout(typeNextChar, delay);
    }
  }
  typeNextChar();
}

/* =========================================================
   ФОНОВЫЕ ЧАСТИЦЫ (СТРАНИЦЫ 1-5)
   ========================================================= */
function initBackgroundParticles() {
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let width, height;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const PARTICLE_COUNT = window.innerWidth < 700 ? 26 : 50;
  const colors = ['rgba(201,162,75,0.5)', 'rgba(170,199,232,0.45)', 'rgba(28,42,68,0.18)'];

  function createParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2.2 + 0.6,
        speedX: (Math.random() - 0.5) * 0.18,
        speedY: (Math.random() - 0.5) * 0.18 - 0.05,
        color: colors[Math.floor(Math.random() * colors.length)],
        drift: Math.random() * Math.PI * 2,
      });
    }
  }
  createParticles();

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p) => {
      p.drift += 0.006;
      p.x += p.speedX + Math.sin(p.drift) * 0.06;
      p.y += p.speedY;

      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      if (p.y > height + 10) p.y = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    });
    requestAnimationFrame(animate);
  }
  animate();
}

/* =========================================================
   СТРАНИЦА 6 — ФИНАЛЬНОЕ ШОУ (КОНФЕТТИ, САЛЮТ, ЗВЁЗДЫ, ШАРЫ)
   ========================================================= */
let finaleAnimationId = null;
let finaleStarted = false;

function startFinaleShow() {
  if (finaleStarted) return;
  finaleStarted = true;

  const canvas = document.getElementById('finale-canvas');
  const ctx = canvas.getContext('2d');
  let width, height;

  function resize() {
    width = canvas.width = canvas.parentElement.offsetWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const confetti = [];
  const balloons = [];
  const stars = [];
  const fireworks = [];
  const goldDust = [];

  const confettiColors = ['#c9a24b', '#e7cd8b', '#ffffff', '#aac7e8'];
  const balloonColors = ['#c9a24b', '#aac7e8', '#ffffff', '#e7cd8b'];

  // --- Конфетти ---
  function spawnConfetti(count) {
    for (let i = 0; i < count; i++) {
      confetti.push({
        x: Math.random() * width,
        y: -20 - Math.random() * height * 0.5,
        w: 6 + Math.random() * 6,
        h: 9 + Math.random() * 7,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        speedY: 1.4 + Math.random() * 2.4,
        speedX: (Math.random() - 0.5) * 1.6,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 8,
      });
    }
  }

  // --- Воздушные шарики ---
  function spawnBalloons(count) {
    for (let i = 0; i < count; i++) {
      balloons.push({
        x: Math.random() * width,
        y: height + 60 + Math.random() * height * 0.6,
        r: 20 + Math.random() * 14,
        color: balloonColors[Math.floor(Math.random() * balloonColors.length)],
        speedY: 0.6 + Math.random() * 0.7,
        sway: Math.random() * Math.PI * 2,
      });
    }
  }

  // --- Мерцающие звёздочки ---
  function spawnStars(count) {
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.7,
        r: Math.random() * 1.6 + 0.6,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  // --- Золотая пыль ---
  function spawnGoldDust(count) {
    for (let i = 0; i < count; i++) {
      goldDust.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.4 + 0.3,
        speedY: -(0.2 + Math.random() * 0.4),
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  // --- Салют ---
  function launchFirework() {
    const x = width * (0.18 + Math.random() * 0.64);
    const y = height * (0.18 + Math.random() * 0.32);
    const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
    const particleCount = 36;
    const burst = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 1.4 + Math.random() * 2.2;
      burst.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color,
      });
    }
    fireworks.push(burst);
  }

  spawnConfetti(120);
  spawnBalloons(10);
  spawnStars(70);
  spawnGoldDust(50);

  let frame = 0;
  const fireworkInterval = setInterval(() => {
    if (!document.querySelector('.page--finale.is-active')) return;
    launchFirework();
  }, 1100);
  const confettiInterval = setInterval(() => {
    if (!document.querySelector('.page--finale.is-active')) return;
    spawnConfetti(24);
  }, 1800);

  function draw() {
    ctx.clearRect(0, 0, width, height);
    frame++;

    // Звёзды
    stars.forEach((s) => {
      const twinkle = 0.4 + Math.abs(Math.sin(frame * 0.02 + s.phase)) * 0.6;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(231,205,139,${twinkle})`;
      ctx.fill();
    });

    // Золотая пыль
    goldDust.forEach((g) => {
      g.y += g.speedY;
      g.phase += 0.02;
      g.x += Math.sin(g.phase) * 0.2;
      if (g.y < -10) g.y = height + 10;
      ctx.beginPath();
      ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(201,162,75,0.55)';
      ctx.fill();
    });

    // Шарики
    balloons.forEach((b) => {
      b.y -= b.speedY;
      b.sway += 0.02;
      const bx = b.x + Math.sin(b.sway) * 14;
      if (b.y < -80) { b.y = height + 60; b.x = Math.random() * width; }

      ctx.beginPath();
      ctx.ellipse(bx, b.y, b.r * 0.78, b.r, 0, 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.moveTo(bx, b.y + b.r);
      ctx.lineTo(bx, b.y + b.r + 28);
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Конфетти
    for (let i = confetti.length - 1; i >= 0; i--) {
      const c = confetti[i];
      c.y += c.speedY;
      c.x += c.speedX;
      c.rotation += c.rotationSpeed;
      if (c.y > height + 20) { confetti.splice(i, 1); continue; }
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate((c.rotation * Math.PI) / 180);
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
      ctx.restore();
    }

    // Салют
    for (let f = fireworks.length - 1; f >= 0; f--) {
      const burst = fireworks[f];
      let alive = false;
      burst.forEach((p) => {
        if (p.alpha <= 0) return;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.025;
        p.alpha -= 0.013;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(p.color, Math.max(p.alpha, 0));
        ctx.fill();
      });
      if (!alive) fireworks.splice(f, 1);
    }

    finaleAnimationId = requestAnimationFrame(draw);
  }
  draw();

  // Сохраняем интервалы для возможной остановки
  canvas._fireworkInterval = fireworkInterval;
  canvas._confettiInterval = confettiInterval;
}

function stopFinaleShow() {
  finaleStarted = false;
  const canvas = document.getElementById('finale-canvas');
  if (canvas) {
    clearInterval(canvas._fireworkInterval);
    clearInterval(canvas._confettiInterval);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  if (finaleAnimationId) cancelAnimationFrame(finaleAnimationId);
}

function hexToRgba(hex, alpha) {
  const bigint = parseInt(hex.replace('#', ''), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

/* =========================================================
   МУЗЫКА
   ========================================================= */
function initMusic() {
  const toggle = document.getElementById('musicToggle');
  const audio = document.getElementById('bgMusic');
  let isPlaying = false;

  toggle.addEventListener('click', () => {
    if (!isPlaying) {
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Файл музыки ещё не добавлен — просто переключаем визуальное состояние
      });
      isPlaying = true;
      toggle.classList.add('is-playing');
      toggle.setAttribute('aria-label', 'Выключить музыку');
    } else {
      audio.pause();
      isPlaying = false;
      toggle.classList.remove('is-playing');
      toggle.setAttribute('aria-label', 'Включить музыку');
    }
  });
}

/* =========================================================
   ИНИЦИАЛИЗАЦИЯ
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initCustomCursor();
  initProgressDots();
  initNavigation();
  initBackgroundParticles();
  initMusic();
});

/* =========================================================
   БОНУС 1: ИСКРЫ ПРИ КЛИКЕ ПО СТРАНИЦЕ
   Маленький золотой "взрыв" в месте клика — приятная мелочь,
   не влияющая на остальную логику открытки.
   ========================================================= */
function initClickSparks() {
  document.addEventListener('click', (e) => {
    const sparkCount = 6;
    for (let i = 0; i < sparkCount; i++) {
      const spark = document.createElement('span');
      spark.className = 'click-spark';
      const angle = (Math.PI * 2 * i) / sparkCount + Math.random() * 0.4;
      const distance = 26 + Math.random() * 22;
      spark.style.left = `${e.clientX}px`;
      spark.style.top = `${e.clientY}px`;
      spark.style.setProperty('--spark-x', `${Math.cos(angle) * distance}px`);
      spark.style.setProperty('--spark-y', `${Math.sin(angle) * distance}px`);
      document.body.appendChild(spark);
      setTimeout(() => spark.remove(), 750);
    }
  });
}

/* =========================================================
   БОНУС 2: СЕКРЕТНАЯ ПАСХАЛКА (КОНАМИ-КОД)
   ↑ ↑ ↓ ↓ ← → ← → — открывает тайное послание с собственным
   мини-салютом на отдельном canvas.
   ========================================================= */
function initEasterEgg() {
  const sequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];
  let progress = 0;

  const overlay = document.getElementById('secretOverlay');
  const closeBtn = document.getElementById('closeSecret');
  const hint = document.getElementById('easterHint');
  if (!overlay || !closeBtn) return;

  window.addEventListener('keydown', (e) => {
    // Не мешаем обычной навигации стрелками влево/вправо по страницам открытки
    if (e.key === sequence[progress]) {
      progress++;
    } else {
      progress = (e.key === sequence[0]) ? 1 : 0;
    }
    if (progress === sequence.length) {
      progress = 0;
      openSecretOverlay();
    }
  });

  closeBtn.addEventListener('click', closeSecretOverlay);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeSecretOverlay();
  });

  // Показываем ненавязчивую подсказку, когда пользователь долистал до финала
  const finalePage = document.querySelector('.page--finale');
  if (finalePage && hint) {
    const observer = new MutationObserver(() => {
      if (finalePage.classList.contains('is-active')) {
        setTimeout(() => hint.classList.add('is-shown'), 1800);
        setTimeout(() => hint.classList.remove('is-shown'), 7000);
      }
    });
    observer.observe(finalePage, { attributes: true, attributeFilter: ['class'] });
  }

  function openSecretOverlay() {
    overlay.classList.add('is-visible');
    runSecretFireworks();
    playChime();
  }
  function closeSecretOverlay() {
    overlay.classList.remove('is-visible');
  }
}

/* Маленький независимый салют для секретного послания */
let secretRunning = false;
function runSecretFireworks() {
  if (secretRunning) return;
  secretRunning = true;

  const canvas = document.getElementById('secret-canvas');
  const ctx = canvas.getContext('2d');
  const overlay = document.getElementById('secretOverlay');

  function resize() {
    canvas.width = overlay.offsetWidth;
    canvas.height = overlay.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const colors = ['#c9a24b', '#e7cd8b', '#ffffff', '#aac7e8'];
  const bursts = [];

  function burstAt(x, y) {
    const particles = [];
    const count = 30;
    const color = colors[Math.floor(Math.random() * colors.length)];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 1.2 + Math.random() * 2;
      particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, alpha: 1, color });
    }
    bursts.push(particles);
  }

  let launches = 0;
  const launchTimer = setInterval(() => {
    if (!document.getElementById('secretOverlay').classList.contains('is-visible')) {
      clearInterval(launchTimer);
      return;
    }
    burstAt(canvas.width * (0.25 + Math.random() * 0.5), canvas.height * (0.25 + Math.random() * 0.35));
    launches++;
    if (launches >= 5) clearInterval(launchTimer);
  }, 450);

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let b = bursts.length - 1; b >= 0; b--) {
      let alive = false;
      bursts[b].forEach((p) => {
        if (p.alpha <= 0) return;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02;
        p.alpha -= 0.012;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(p.color, Math.max(p.alpha, 0));
        ctx.fill();
      });
      if (!alive) bursts.splice(b, 1);
    }
    requestAnimationFrame(draw);
  }
  draw();
}

/* =========================================================
   ИНИЦИАЛИЗАЦИЯ БОНУСНЫХ ФУНКЦИЙ
   (дополняет основной DOMContentLoaded, ничего не заменяя)
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  initClickSparks();
  initEasterEgg();
  initCakePage();
  initWheelPage();
});

/* =========================================================
   СТРАНИЦА 5: ТОРТ — «ЗАДУЙ СВЕЧУ И ЗАГАДАЙ ЖЕЛАНИЕ»
   ========================================================= */
function initCakePage() {
  const scene = document.getElementById('cakeScene');
  const btn = document.getElementById('blowCandleBtn');
  if (!scene || !btn) return;

  btn.addEventListener('click', () => {
    if (scene.classList.contains('is-blown')) return;
    scene.classList.add('is-blown');
    btn.classList.add('is-used');
    btn.querySelector('span').textContent = 'Желание загадано';
  });
}

/* =========================================================
   СТРАНИЦА 6: КОЛЕСО ПРЕДСКАЗАНИЙ НА ГОД
   ========================================================= */
function initWheelPage() {
  const wheel = document.getElementById('wheel');
  const btn = document.getElementById('spinWheelBtn');
  const resultEl = document.getElementById('wheelResult');
  if (!wheel || !btn || !resultEl) return;

  const predictions = [
    'Новые крутые знакомства',
    'Яркое путешествие',
    'Большой успех в делах',
    'Приятный сюрприз',
    'Ещё более крепкая дружба',
    'Поток вдохновения',
    'Исполнение заветной мечты',
    'Финансовый рост',
  ];

  let rotation = 0;
  let isSpinning = false;

  btn.addEventListener('click', () => {
    if (isSpinning) return;
    isSpinning = true;
    btn.classList.add('is-disabled');
    wheel.classList.add('is-spinning');
    resultEl.classList.remove('is-shown');

    const targetIndex = Math.floor(Math.random() * predictions.length);
    const segmentCenter = targetIndex * 45 + 22.5;
    const desiredMod = (360 - segmentCenter + 360) % 360;
    const currentMod = ((rotation % 360) + 360) % 360;
    const delta = ((desiredMod - currentMod) + 360) % 360;
    const extraSpins = 5;

    rotation += extraSpins * 360 + delta;
    wheel.style.transform = `rotate(${rotation}deg)`;

    setTimeout(() => {
      isSpinning = false;
      btn.classList.remove('is-disabled');
      wheel.classList.remove('is-spinning');
      resultEl.textContent = `✨ Колесо говорит: «${predictions[targetIndex]}»`;
      resultEl.classList.add('is-shown');
    }, 4300);
  });
}

/* =========================================================
   БОНУС 3: АНИМИРОВАННЫЕ СЧЁТЧИКИ «19 ЛЕТ В ЦИФРАХ»
   Запускаются один раз при первом входе на страницу.
   ========================================================= */
let statsAnimated = false;
function animateStatCounters() {
  if (statsAnimated) return;
  statsAnimated = true;

  document.querySelectorAll('.stat-num').forEach((el) => {
    const target = Number(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = value.toLocaleString('ru-RU') + (suffix ? ' ' + suffix : '');
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

/* =========================================================
   БОНУС 4: «СОВЕТ ДНЯ» — случайная карточка-предсказание
   ========================================================= */
const adviceMessages = [
  'Сегодня хороший день, чтобы сделать первый шаг к тому, что давно откладывал.',
  'Позвони тому, кого давно не слышал — будет приятный разговор.',
  'Попробуй что-то новое на вкус, на слух или на ощупь.',
  'Скажи кому-то спасибо вслух, а не молча.',
  'Сделай то дело, которое откладывал три дня подряд.',
  'Сегодня можно ничего не успеть — и это нормально.',
  'Сходи туда, где давно не был.',
  'Запиши идею, пока не забыл — она ещё пригодится.',
  'Разреши себе один маленький импульсивный поступок.',
  'Сегодня кто-то скучает по тебе сильнее, чем ты думаешь.',
  'Сделай комплимент первому, кого встретишь.',
  '19 — отличный год, чтобы начать вести список «хочу попробовать».',
];
let lastAdviceIndex = -1;

function initAdviceCard() {
  const btn = document.getElementById('adviceBtn');
  const label = document.getElementById('adviceLabel');
  if (!btn || !label) return;

  btn.addEventListener('click', () => {
    let index;
    do {
      index = Math.floor(Math.random() * adviceMessages.length);
    } while (index === lastAdviceIndex && adviceMessages.length > 1);
    lastAdviceIndex = index;
    label.textContent = adviceMessages[index];
    btn.classList.add('is-drawn');
  });
}

/* =========================================================
   ТЁПЛЫЙ ЗВУКОВОЙ АККОРД (Web Audio, без файлов)
   Используется как приятный отклик в секретном послании.
   ========================================================= */
function playChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t0 = ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(0.16, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.6);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.65);
    });
  } catch (e) {
    /* Web Audio недоступен — просто пропускаем звук */
  }
}

/* =========================================================
   ИНИЦИАЛИЗАЦИЯ НОВЫХ БЛОКОВ
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  initAdviceCard();
});
