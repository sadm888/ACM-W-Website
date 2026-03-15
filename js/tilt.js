/* tilt.js — shared card tilt utility used by index.js and members.js */

function applyTilt(card, clientX, clientY) {
  const rect  = card.getBoundingClientRect();
  const cx    = rect.left + rect.width  / 2;
  const cy    = rect.top  + rect.height / 2;
  const dx    = (clientX - cx) / (rect.width  / 2);
  const dy    = (clientY - cy) / (rect.height / 2);
  const tiltX = -dy * 14;
  const tiltY =  dx * 14;
  card.style.transform  = `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.05)`;
  card.style.boxShadow  = `${-tiltY * 1.5}px ${tiltX * 1.5}px 32px rgba(0,0,0,0.25)`;
}

function resetTilt(card) {
  card.style.transform = '';
  card.style.boxShadow = '';
}
