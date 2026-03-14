// Mobile nav toggle
document.getElementById("navToggle").addEventListener("click", function () {
  document.getElementById("navMenu").classList.toggle("open");
});

// Highlight active nav link on scroll
var sections = ["about", "activities", "team", "faq", "contact"];
window.addEventListener("scroll", function () {
  var scrollY = window.scrollY + 80;
  sections.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) {
      var link = document.querySelector('.nav-menu .nav-link[href="#' + id + '"]');
      if (link) {
        if (scrollY >= el.offsetTop && scrollY < el.offsetTop + el.offsetHeight) {
          document.querySelectorAll(".nav-menu .nav-link").forEach(function (l) { l.classList.remove("active"); });
          link.classList.add("active");
        }
      }
    }
  });
});
