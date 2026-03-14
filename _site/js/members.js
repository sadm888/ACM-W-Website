function MemberCard(member) {
  return `
    <div class="team-card">
      <img src="${member.photo}" alt="${member.name}">
      <div class="team-card-overlay">
        <div class="team-card-name">${member.name}</div>
        <div class="team-card-role">${member.role}</div>
        <div class="team-card-socials">
          <a href="${member.linkedin}" target="_blank" rel="noopener" title="${member.name} LinkedIn">
            <i class="fa-brands fa-linkedin-in"></i>
          </a>
          <a href="${member.instagram}" target="_blank" rel="noopener" title="${member.name} Instagram">
            <i class="fa-brands fa-instagram"></i>
          </a>
        </div>
      </div>
    </div>
  `;
}

function applyTilt(card, clientX, clientY) {
  const rect = card.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = (clientX - cx) / (rect.width / 2);
  const dy = (clientY - cy) / (rect.height / 2);
  const tiltX = -dy * 14;
  const tiltY = dx * 14;
  card.style.transform = `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.05)`;
  card.style.boxShadow = `${-tiltY * 1.5}px ${tiltX * 1.5}px 32px rgba(0,0,0,0.28)`;
}

function resetTilt(card) {
  card.style.transform = '';
  card.style.boxShadow = '';
}

function initCardInteractivity() {
  document.querySelectorAll('.team-card').forEach(card => {
    // Mouse tilt
    card.addEventListener('mousemove', e => applyTilt(card, e.clientX, e.clientY));
    card.addEventListener('mouseleave', () => resetTilt(card));

    // Touch tilt
    card.addEventListener('touchmove', e => {
      e.preventDefault();
      const touch = e.touches[0];
      applyTilt(card, touch.clientX, touch.clientY);
    }, { passive: false });
    card.addEventListener('touchend', () => resetTilt(card));
    card.addEventListener('touchcancel', () => resetTilt(card));
  });
}

fetch("members.json")
  .then(res => res.json())
  .then(members => {
    document.getElementById("app").innerHTML = members.map(MemberCard).join("");
    initCardInteractivity();
  });
