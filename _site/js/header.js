function isLocalhost() {
  return location.hostname === "localhost" || location.hostname === "127.0.0.1";
}

function getSitePrefix() {
  const path = location.pathname.replace(/\\/g, "/");
  return path === "/_site" || path.startsWith("/_site/") ? "/_site" : "";
}

function withSitePrefix(path) {
  if (!path || !path.startsWith("/")) return path;

  const prefix = getSitePrefix();
  if (!prefix || path.startsWith(`${prefix}/`)) return path;

  return `${prefix}${path}`;
}

function rewritePrefixedPaths(navRoot) {
  navRoot.querySelectorAll("[href]").forEach(link => {
    const href = link.getAttribute("href");
    if (href && href.startsWith("/")) {
      link.setAttribute("href", withSitePrefix(href));
    }
  });

  navRoot.querySelectorAll("[src]").forEach(node => {
    const src = node.getAttribute("src");
    if (src && src.startsWith("/")) {
      node.setAttribute("src", withSitePrefix(src));
    }
  });

  // Resolve data-src → src AFTER path rewriting so the correct URL is fetched
  navRoot.querySelectorAll("[data-src]").forEach(node => {
    const src = node.getAttribute("data-src");
    node.removeAttribute("data-src");
    node.setAttribute("src", src && src.startsWith("/") ? withSitePrefix(src) : src);
  });
}

function normalizeHomeAnchors(navRoot) {
  const path = location.pathname.replace(/\\/g, "/");
  const prefix = getSitePrefix();
  const isHomePage =
    path === "/" ||
    path === prefix ||
    path === `${prefix}/` ||
    path.endsWith("/index.html");

  navRoot.querySelectorAll("[data-home-anchor]").forEach(link => {
    const anchor = link.getAttribute("data-home-anchor");
    link.setAttribute("href", isHomePage ? `#${anchor}` : withSitePrefix(`/index.html#${anchor}`));
  });

  const homeLink = navRoot.querySelector('[data-nav-key="home"]');
  if (homeLink && isHomePage) {
    homeLink.setAttribute("href", "#");
  }
}

function applyActiveState(navRoot, pageKey) {
  if (!pageKey) return;

  const activeTargets = [pageKey];
  if (pageKey === "events" || pageKey === "mentorship" || pageKey === "discover") {
    activeTargets.push("involved");
  }

  activeTargets.forEach(key => {
    navRoot.querySelectorAll(`[data-nav-key="${key}"]`).forEach(el => el.classList.add("active"));
  });
}

function appendAdminLink(navRoot) {
  if (!isLocalhost()) return;

  const navMenu = navRoot.querySelector("#navMenu");
  if (!navMenu || navMenu.querySelector("[data-nav-key='admin']")) return;

  const adminLi = document.createElement("li");
  adminLi.innerHTML = `<a href="${withSitePrefix("/admin.html")}" class="nav-link" data-nav-key="admin" style="color:#4AAEE4;"><i class="fa fa-gear"></i> Admin</a>`;
  navMenu.appendChild(adminLi);
}

function bindMobileToggle(navRoot) {
  const navToggle = navRoot.querySelector("#navToggle");
  const navMenu = navRoot.querySelector("#navMenu");

  if (!navToggle || !navMenu) return;

  navToggle.addEventListener("click", function () {
    navMenu.classList.toggle("open");
  });
}

async function loadSharedNavbar() {
  const mount = document.getElementById("siteNavMount");
  if (!mount) return;

  try {
    const response = await fetch(withSitePrefix("/partials/site-navbar.html"), { cache: "no-cache" });
    if (!response.ok) throw new Error(`Failed to load navbar: ${response.status}`);

    mount.innerHTML = await response.text();
    const navRoot = mount.firstElementChild;
    if (!navRoot) return;

    rewritePrefixedPaths(navRoot);
    normalizeHomeAnchors(navRoot);
    appendAdminLink(navRoot);
    applyActiveState(navRoot, mount.dataset.page || "");
    bindMobileToggle(navRoot);

    document.dispatchEvent(new CustomEvent("site-nav-ready", { detail: { navRoot } }));
  } catch (error) {
    console.error(error);
  }
}

loadSharedNavbar();
