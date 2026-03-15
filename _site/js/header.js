// Mobile nav toggle
const _navToggle = document.getElementById("navToggle");
if (_navToggle) {
  _navToggle.addEventListener("click", function () {
    document.getElementById("navMenu").classList.toggle("open");
  });
}

// Nav highlight handled by IntersectionObserver in index.js
