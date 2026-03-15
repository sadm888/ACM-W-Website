// Mark body so CSS reveal styles activate (fallback: elements stay visible if JS fails)
document.body.classList.add('js-ready');

// Set footer year
const _fy = document.getElementById('footer-year');
if (_fy) _fy.textContent = new Date().getFullYear();

// ── 1. Scroll Reveal ──────────────────────────────────
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal').forEach(el => {
  // Reveal immediately if already in viewport
  const rect = el.getBoundingClientRect();
  if (rect.top < window.innerHeight) {
    el.classList.add('revealed');
  } else {
    revealObserver.observe(el);
  }
});

// ── 2. TextType on hero subtitle ──────────────────────
function initTextType(el, {
  texts,
  typingSpeed      = 50,
  initialDelay     = 0,
  pauseDuration    = 2000,
  deletingSpeed    = 30,
  loop             = true,
  showCursor       = true,
  hideCursorWhileTyping = false,
  cursorCharacter  = '|',
  cursorBlinkDuration  = 500,
  variableSpeed    = null,
} = {}) {
  const textArray = Array.isArray(texts) ? texts : [texts];

  el.classList.add('text-type');
  const contentSpan = document.createElement('span');
  contentSpan.className = 'text-type__content';
  el.innerHTML = '';
  el.appendChild(contentSpan);

  let cursorSpan = null;
  if (showCursor) {
    cursorSpan = document.createElement('span');
    cursorSpan.className = 'text-type__cursor';
    cursorSpan.textContent = cursorCharacter;
    el.appendChild(cursorSpan);

    let cursorVisible = true;
    setInterval(() => {
      cursorVisible = !cursorVisible;
      cursorSpan.style.opacity = cursorVisible ? '1' : '0';
    }, cursorBlinkDuration);
  }

  let currentTextIndex = 0;
  let currentCharIndex = 0;
  let isDeleting       = false;
  let displayed        = '';

  function getSpeed() {
    if (variableSpeed) return Math.random() * (variableSpeed.max - variableSpeed.min) + variableSpeed.min;
    return isDeleting ? deletingSpeed : typingSpeed;
  }

  function updateCursorVisibility() {
    if (!cursorSpan || !hideCursorWhileTyping) return;
    const typing = currentCharIndex < textArray[currentTextIndex].length || isDeleting;
    cursorSpan.classList.toggle('text-type__cursor--hidden', typing);
  }

  function tick() {
    const currentText = textArray[currentTextIndex];

    if (isDeleting) {
      if (displayed === '') {
        isDeleting = false;
        if (!loop && currentTextIndex === textArray.length - 1) return;
        currentTextIndex = (currentTextIndex + 1) % textArray.length;
        currentCharIndex = 0;
        setTimeout(tick, pauseDuration);
        return;
      }
      displayed = displayed.slice(0, -1);
      contentSpan.textContent = displayed;
      updateCursorVisibility();
      setTimeout(tick, deletingSpeed);
    } else {
      if (currentCharIndex < currentText.length) {
        displayed += currentText[currentCharIndex];
        contentSpan.textContent = displayed;
        currentCharIndex++;
        updateCursorVisibility();
        setTimeout(tick, getSpeed());
      } else {
        if (!loop && currentTextIndex === textArray.length - 1) return;
        setTimeout(() => { isDeleting = true; tick(); }, pauseDuration);
      }
    }
  }

  setTimeout(tick, initialDelay);
}

const subtitleEl = document.getElementById('heroSubtitle');
if (subtitleEl) {
  initTextType(subtitleEl, {
    texts: [
      'Association For Computing Machinery - Women',
      'Empowering Women in Technology',
      'Inspiring. Building. Leading.'
    ],
    typingSpeed:   65,
    deletingSpeed: 35,
    initialDelay:  800,
    pauseDuration: 2200,
    loop:          true,
    showCursor:    true,
    cursorCharacter: '|',
    cursorBlinkDuration: 500,
    hideCursorWhileTyping: false,
  });
}

// ── 3. Hero section reference ─────────────────────────
const heroSection = document.querySelector('.hero-section');

// ── 4. Floating particles ─────────────────────────────
const canvas = document.getElementById('hero-canvas');
if (canvas && heroSection) {
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width  = heroSection.offsetWidth  || window.innerWidth;
    canvas.height = heroSection.offsetHeight || window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });

  const particles = Array.from({ length: 38 }, () => ({
    x:  Math.random() * canvas.width,
    y:  Math.random() * canvas.height,
    r:  Math.random() * 2 + 0.6,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    a:  Math.random() * 0.35 + 0.1,
  }));

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(74,174,228,${p.a})`;
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width)  p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
    });
    requestAnimationFrame(drawParticles);
  }
  drawParticles();
}

// ── 5. Animated overlay — handled by CSS overlayShift keyframe

// ── 5b. Shuffle heading (Meet Our Club Officers) ──────
function initShuffle(el, stagger = 0.04) {
  const text = el.textContent.trim();
  el.innerHTML = '';
  el.classList.add('shuffle-heading');
  [...text].forEach((char, i) => {
    if (char === ' ') {
      const sp = document.createElement('span');
      sp.className = 'char-space';
      el.appendChild(sp);
      return;
    }
    const wrap = document.createElement('span');
    wrap.className = 'char-wrap';
    const inner = document.createElement('span');
    inner.className = 'char-inner';
    inner.style.transitionDelay = `${i * stagger}s`;
    inner.textContent = char;
    wrap.appendChild(inner);
    el.appendChild(wrap);
  });
  new IntersectionObserver(([entry], obs) => {
    if (entry.isIntersecting) {
      el.classList.add('shuffle-revealed');
      obs.disconnect();
    }
  }, { threshold: 0.2 }).observe(el);
}

const teamHeading = document.querySelector('.section-heading-cyan');
if (teamHeading) initShuffle(teamHeading, 0.035);

// ── 6. Active nav highlight on scroll ─────────────────
const navSections = document.querySelectorAll('section[id], footer[id]');
const navLinks = document.querySelectorAll('.nav-link');

const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const match = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (match) match.classList.add('active');
    }
  });
}, { threshold: 0.4 });

navSections.forEach(s => navObserver.observe(s));

// ── 7. Scroll progress bar ────────────────────────────
const progressBar = document.createElement('div');
progressBar.className = 'scroll-progress';
document.body.prepend(progressBar);
window.addEventListener('scroll', () => {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = (window.scrollY / total * 100) + '%';
}, { passive: true });

// ── 10. Hero click ripple ─────────────────────────────
if (heroSection) {
  heroSection.addEventListener('click', e => {
    const r = heroSection.getBoundingClientRect();
    const ripple = Object.assign(document.createElement('span'), { className: 'hero-ripple' });
    ripple.style.left = (e.clientX - r.left) + 'px';
    ripple.style.top  = (e.clientY - r.top)  + 'px';
    heroSection.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
}

// ── 11. Magnetic button ───────────────────────────────
const magnetBtn = document.querySelector('.btn-discover');
if (magnetBtn) {
  document.addEventListener('mousemove', e => {
    const r    = magnetBtn.getBoundingClientRect();
    const btnX = r.left + r.width  / 2;
    const btnY = r.top  + r.height / 2;
    const dx   = e.clientX - btnX;
    const dy   = e.clientY - btnY;
    const dist = Math.hypot(dx, dy);
    if (dist < 110) {
      const pull = (1 - dist / 110) * 0.38;
      magnetBtn.style.transform = `translate(${dx * pull}px, ${dy * pull}px)`;
    } else {
      magnetBtn.style.transform = '';
    }
  }, { passive: true });
}

// ── 12. Parallax text layers ──────────────────────────
const heroContent = heroSection ? heroSection.querySelector('.hero-content') : null;
if (heroContent) {
  window.addEventListener('scroll', () => {
    const offset = window.pageYOffset;
    if (offset < window.innerHeight) {
      heroContent.style.transform = `translateY(${offset * 0.18}px)`;
    }
  }, { passive: true });
}

// ── 13. Easter egg: type "acmw" ───────────────────────
function launchConfetti() {
  const colors = ['#4AAEE4', '#ffffff', '#a8d8f0', '#ffb3c6', '#b3f5e6'];
  for (let i = 0; i < 72; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.cssText = `
      left:${Math.random() * 100}vw;
      background:${colors[i % colors.length]};
      width:${Math.random() * 8 + 4}px;
      height:${Math.random() * 8 + 4}px;
      border-radius:${Math.random() > 0.5 ? '50%' : '3px'};
      animation-duration:${(Math.random() * 2 + 1.5).toFixed(2)}s;
      animation-delay:${(Math.random() * 0.8).toFixed(2)}s;
    `;
    document.body.appendChild(p);
    p.addEventListener('animationend', () => p.remove());
  }
}
let eggBuffer = '';
document.addEventListener('keydown', e => {
  eggBuffer = (eggBuffer + e.key.toLowerCase()).slice(-4);
  if (eggBuffer === 'acmw') { launchConfetti(); eggBuffer = ''; }
});

// ── Involve card tilt — uses applyTilt/resetTilt from tilt.js ─
function resetInvolveTilt(card) {
  card.classList.remove('tilting');
  card.style.transition = 'transform 0.4s ease, box-shadow 0.4s ease';
  resetTilt(card);
  setTimeout(() => { card.style.transition = ''; }, 400);
}

document.querySelectorAll('.involve-card').forEach(card => {
  card.addEventListener('mouseenter',  () => { card.classList.add('tilting'); card.style.transition = 'none'; });
  card.addEventListener('mousemove',   e  => applyTilt(card, e.clientX, e.clientY));
  card.addEventListener('mouseleave',  ()  => resetInvolveTilt(card));
  card.addEventListener('touchstart',  e  => {
    e.preventDefault();
    card.classList.add('tilting');
    card.style.transition = 'none';
    applyTilt(card, e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: false });
  card.addEventListener('touchmove',   e  => { e.preventDefault(); applyTilt(card, e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
  card.addEventListener('touchend',    () => resetInvolveTilt(card));
  card.addEventListener('touchcancel', () => resetInvolveTilt(card));
});
