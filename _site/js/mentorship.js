// mentorship.js — scroll stack (sticky-based, no translateY)
(function () {
  const STICKY_TOP     = 120;   // px from viewport top where each card pins
  const STACK_OFFSET   = 30;    // px extra top per card so they visually stack
  const BASE_SCALE     = 0.88;
  const ITEM_SCALE     = 0.03;  // each deeper card shrinks slightly less
  const SCALE_DISTANCE = 160;   // px of scroll over which the scale animates

  function calcProgress(val, start, end) {
    if (val <= start) return 0;
    if (val >= end)   return 1;
    return (val - start) / (end - start);
  }

  function init() {
    const cards = Array.from(document.querySelectorAll('.scroll-stack-card'));
    if (!cards.length) return;

    // Apply sticky positioning — browser handles all the pinning
    cards.forEach((card, i) => {
      card.style.position  = 'sticky';
      card.style.top       = (STICKY_TOP + i * STACK_OFFSET) + 'px';
      card.style.zIndex    = i + 1;          // later cards sit on top
      if (i < cards.length - 1) {
        card.style.marginBottom = '80px';
      }
    });

    // Cache each card's natural page offset (no transforms active yet)
    let cardTops = [];

    function cachePositions() {
      cardTops = cards.map(c => c.getBoundingClientRect().top + window.scrollY);
    }

    function update() {
      const scrollTop = window.scrollY;

      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) {
          // Last card never scales down
          card.style.transform = '';
          return;
        }

        // Scale this card as the next card scrolls into its sticky position
        const nextPinsAt = cardTops[i + 1] - (STICKY_TOP + (i + 1) * STACK_OFFSET);
        const scaleStart = nextPinsAt - SCALE_DISTANCE;
        const scaleEnd   = nextPinsAt;

        const progress    = calcProgress(scrollTop, scaleStart, scaleEnd);
        const targetScale = BASE_SCALE + i * ITEM_SCALE;
        const scale       = 1 - progress * (1 - targetScale);

        card.style.transform = `scale(${scale.toFixed(4)})`;
      });
    }

    requestAnimationFrame(() => {
      cachePositions();
      update();

      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => { update(); ticking = false; });
          ticking = true;
        }
      }, { passive: true });

      window.addEventListener('resize', () => { cachePositions(); update(); });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
