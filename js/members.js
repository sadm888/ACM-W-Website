function MemberCard(member) {
  return `
    <div class="team-card">
      <img src="${member.photo}" alt="${member.name}">
      <div class="team-card-overlay">
        <div class="team-card-name">${member.name}</div>
        <div class="team-card-role">${member.role}</div>
        <div class="team-card-socials">
          ${member.linkedin ? `<a href="${member.linkedin}" target="_blank" rel="noopener" title="${member.name} LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a>` : ''}
          ${member.instagram ? `<a href="${member.instagram}" target="_blank" rel="noopener" title="${member.name} Instagram"><i class="fa-brands fa-instagram"></i></a>` : ''}
        </div>
      </div>
    </div>
  `;
}

// applyTilt / resetTilt live in tilt.js (loaded before this script)

function initCardInteractivity() {
  document.querySelectorAll('.team-card').forEach(card => {
    // Mouse tilt
    card.addEventListener('mousemove', e => applyTilt(card, e.clientX, e.clientY));
    card.addEventListener('mouseleave', () => resetTilt(card));

    // Touch tilt
    card.addEventListener('touchstart', e => {
      e.preventDefault();
      const touch = e.touches[0];
      applyTilt(card, touch.clientX, touch.clientY);
    }, { passive: false });
    card.addEventListener('touchmove', e => {
      e.preventDefault();
      const touch = e.touches[0];
      applyTilt(card, touch.clientX, touch.clientY);
    }, { passive: false });
    card.addEventListener('touchend', () => resetTilt(card));
    card.addEventListener('touchcancel', () => resetTilt(card));
  });
}

const _isLocal  = location.hostname === "localhost" || location.hostname === "127.0.0.1";
const _stored   = _isLocal ? localStorage.getItem("acmw_members") : null;
const _storedVer = _isLocal ? localStorage.getItem("acmw_members_ver") : null;

if (_stored && _storedVer === "v2") {
  const members = JSON.parse(_stored);
  document.getElementById("app").innerHTML = members.map(MemberCard).join("");
  initCardInteractivity();
} else {
  fetch("members.json")
    .then(res => res.json())
    .then(members => {
      document.getElementById("app").innerHTML = members.map(MemberCard).join("");
      initCardInteractivity();
    })
    .catch(() => {
      document.getElementById("app").innerHTML = '<p style="text-align:center;color:#aaa;">Could not load members.</p>';
    });
}
