# ACM-W NITK Website — Developer Guide

This file is read automatically by Claude Code (AI assistant) at the start of every session.
It documents the architecture, workflows, and gotchas for this project.

---

## Architecture Overview

This is a **Jekyll static site** with a BrowserSync dev server.

```
Root (project dir)          _site/ (served copy — must mirror root)
├── css/                    ├── css/
├── js/                     ├── js/
├── html/                   ├── html/
├── images/                 ├── images/
├── partials/               ├── partials/
├── admin.html              ├── admin.html
├── index.html              ├── index.html
├── blog.html (redirect)    ├── blog.html  ← actual blog page
├── members.json            ├── members.json
├── opp.json                └── opp.json
└── _posts/ (Jekyll)
```

**CRITICAL RULE: Every file change must be applied to BOTH the source AND `_site/`.**
This is the #1 source of bugs. If you fix `css/events.css` but forget `_site/css/events.css`, the site will still show the old version.

### How pages are served (BrowserSync)

BrowserSync runs with: `npm start`
It serves from the **project root** at `http://localhost:3000`.

| URL | File served |
|-----|-------------|
| `/` or `/index.html` | `index.html` (source) |
| `/_site/blog.html` | `_site/blog.html` |
| `/_site/admin.html` | `_site/admin.html` |
| `/_site/html/events.html` | `_site/html/events.html` |

Pages in `_site/` load CSS/JS via **absolute paths** like `/css/blog.css`.
Since BrowserSync serves from root, `/css/blog.css` → `<root>/css/blog.css` (the source).
So CSS/JS changes to source are immediately live — only HTML structure in `_site/` needs manual syncing.

### Sync command

After changing any HTML file, run:
```bash
npm run sync
```
This copies css/, js/, html/, images/, partials/, admin.html, blog.html, members.json, opp.json to `_site/`.

---

## Content Data Files

| Content | File | How updated |
|---------|------|-------------|
| Team members | `members.json` | Admin panel → Export JSON → replace file |
| Events | `events.json` | Admin panel (Events tab) |
| Discover opportunities | `opp.json` | Edit directly or add admin export |
| Blog posts | `_posts/*.md` | Add new markdown file, run Jekyll build |

### How members work (important!)

1. On first local load: `members.js` fetches `members.json` → saves to `localStorage("acmw_members")`
2. Admin panel edits → saved to localStorage only (NOT disk)
3. `index.html` on localhost reads localStorage first → shows admin edits immediately
4. **To make permanent:** Admin panel → click **Export JSON** → download → replace `members.json` on disk → `npm run sync` → commit to git

---

## Path Handling

Pages under `/_site/` detect their URL prefix with `getSitePrefix()` in `js/header.js`:
- URL contains `/_site/` → prefix = `"/_site"`
- URL at root → prefix = `""`

All internal links and asset paths are rewritten with this prefix at runtime.

**Logo race condition fix:** The navbar logo uses `data-src` instead of `src` in `partials/site-navbar.html`.
`header.js` resolves `data-src` → `src` AFTER path rewriting, preventing the browser from fetching the wrong URL.

---

## Key Pages & Files

| Page | Source HTML | Notes |
|------|-------------|-------|
| Home | `index.html` + `_site/index.html` | Members loaded from localStorage/members.json via `js/members.js` |
| Blog listing | `_site/blog.html` | Antigravity animation via `js/blog.js` + Three.js CDN |
| Blog post (WTM) | `_site/2019/03/21/wtm.html` | Photo hero via `data-hero-bg` attribute |
| Blog post (CODESS) | `_site/2017/02/21/codess.html` | Same pattern |
| Events | `html/events.html` + `_site/html/events.html` | |
| Mentorship | `html/mentorship.html` + `_site/html/mentorship.html` | Scroll-stack card animation |
| Discover | `html/discover.html` + `_site/html/discover.html` | Reads `opp.json` |
| Admin | `admin.html` + `_site/admin.html` | Manages members + events via localStorage |

---

## Known Gotchas

1. **`position: fixed` inside CSS `transform`-ed ancestors breaks** — fixed elements position relative to the transformed ancestor, not the viewport. Never add `transform` to `.blocks` (discover cards) because the popup is `position: fixed` inside them.

2. **`_site/` CSS is separate from source CSS** — BrowserSync watches source CSS (`css/*.css`) but `_site/css/` is a separate copy. Source CSS is what gets loaded by all pages (absolute paths from root). Keep them identical.

3. **`_site/admin.html` exists** — admin.html is NOT only at root. `_site/admin.html` is what users navigate to. Always update both.

4. **Three.js CDN dependency** — The blog page antigravity animation requires internet access to load Three.js from `cdn.jsdelivr.net`. If Three.js fails to load, the animation silently does nothing (check browser console for errors).

5. **Jekyll builds are separate** — Running `jekyll build` regenerates `_site/` from Jekyll templates, which would OVERWRITE our manual changes to `_site/*.html`. The current setup bypasses Jekyll and manually maintains `_site/`. Do not run `jekyll build` without reviewing what it would overwrite.

---

## CSS Variables (defined in `css/colour.css`)

```css
--color-primary:      #4AAEE4   (ACM-W blue)
--color-primary-dark: #2e97d4
--color-white:        #ffffff
--color-text:         #1a1a2e
--color-text-muted:   #6b7280
--color-text-light:   #9ca3af
--color-border:       #e5e7eb
--color-bg-light:     #f8fafc
--font-base:          'Raleway', sans-serif
--radius-sm / --radius-md / --radius-lg / --radius-pill
--shadow-sm / --shadow-md / --shadow-lg
--transition-fast
```

---

## Yearly Update Checklist

At the start of each academic year:

- [ ] Update members via Admin panel → Export JSON → replace `members.json`
- [ ] Update events via Admin panel (Events tab)
- [ ] Update `opp.json` with new opportunities
- [ ] Add new blog posts to `_posts/` folder
- [ ] Update contact info / social links in `index.html` (search for email/phone)
- [ ] Run `npm run sync` after any HTML changes
- [ ] Commit and push to git
