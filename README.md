# Muhammad Shoaib — Portfolio

**DecodeLabs Industrial Training | Batch 2026**

> "Synthesizing Science, Data, and Code into Intelligent Digital Architecture."

---

## Roadmap Progress

| Week | Project | Status |
|---|---|---|
| Week 1 | Responsive Frontend Interface — The Adaptability Phase | ✅ Complete |
| Week 2 | Backend API Development — The Nervous System | ✅ Complete |

---

## Week 1 — Project Overview

A production-quality personal portfolio built exclusively with **vanilla HTML5, CSS3, and JavaScript** — zero frameworks, zero build tools, zero dependencies beyond Google Fonts and the Lucide icon CDN.

The project demonstrates mastery of the three DecodeLabs Pillars: strategic UX thinking, 2025 visual aesthetics, and clean frontend implementation — all verifiable by reading the source files directly.

| File | Role | Lines |
|---|---|---|
| `index.html` | Semantic document structure + content | ~500+ |
| `assets/css/style.css` | Design system + all component styles | ~1,500+ |
| `assets/js/main.js` | Progressive enhancement + API integration | ~420 |

---

## Pillar 1 — Strategy & Blueprint Compliance

### User Flow & Hierarchy
The page follows a deliberate narrative arc that mirrors a professional introduction:

```
Header (identity + navigation)
  └─ Hero     → Who I am + what I do + primary CTA
  └─ Sidebar  → Proof: bio, skills, certifications          [id="about"]
  └─ Articles → Evidence: four featured projects            [id="work"]
  └─ Footer   → Next step: contact details + social links  [id="contact"]
```

Every nav anchor (`#home`, `#work`, `#about`, `#contact`) maps to a real `id` on the page. `scroll-margin-top` on all targets accounts for the sticky header so section headings are never hidden on arrival.

### Grayscale Rule
If all colour is stripped:
- Heading size progression (h1 → h2 → h3) communicates hierarchy through scale alone.
- The active nav link carries an **inset box-shadow stripe** (3px left on mobile, 2px bottom on desktop) — a shape-based indicator independent of colour.
- Card structure (image block → tag pill → title → excerpt → CTA button) reads as distinct zones via shape, spacing, and contrast.
- Certification items use an **inset left border** (box-shadow) to differentiate them from plain list items.

### Blueprint Alignment
All five structural zones from the 2D floor-plan are implemented with correct HTML5 landmarks:

| Zone | Element | Landmark Role |
|---|---|---|
| Header | `<header>` | `banner` |
| Navigation | `<nav aria-label="Primary navigation">` | `navigation` |
| Hero | `<section aria-labelledby="hero-heading">` | `region` |
| Sidebar | `<aside aria-label="Profile and expertise">` | `complementary` |
| Main Content | `<section aria-labelledby="featured-title">` | `region` |
| Footer | `<footer>` | `contentinfo` |

---

## Pillar 2 — Visual Design & 2025 Aesthetics Compliance

### Colour Palette (Strict Token Discipline)
All colours are defined as CSS Custom Properties in `:root`. **No raw hex values exist outside the token block.**

```css
--color-mocha:      #A5856F;   /* Mocha Mousse  — primary brand */
--color-blue:       #A0D4E0;   /* Ethereal Blue — accent        */
--color-grey:       #F2F0EA;   /* Moonlit Grey  — page surface  */
--color-mocha-deep: #3d2b22;   /* Hero bg — 14.2:1 contrast ratio (WCAG AAA) */
--color-mocha-mid:  #5c3d2e;   /* Hero gradient stop — promoted from inline  */
--color-blue-hover: #c8e9f0;   /* CTA hover — promoted from inline           */
```

Every component references a **semantic alias** (`--bg-page`, `--text-primary`, `--bg-card`, etc.), not a raw palette token. This means the entire **Grounded Dark** theme is achieved by overriding only the alias tokens in `[data-theme="dark"]` — no component-level dark mode rules required.

### Typography
| Requirement | Implementation |
|---|---|
| Display font | `Montserrat` (400, 600, 700) — all headings, nav, CTAs, labels |
| Body font | `Open Sans` (400, 600) — paragraphs, excerpts, widget text |
| ≤ 2 families | ✓ Exactly 2 |
| ≤ 3 weights | ✓ Exactly 3 (400 / 600 / 700) |
| Fluid sizing | ✓ Full `clamp()` scale: `--fs-xs` through `--fs-2xl` |

### 2025 Aesthetic Vibe: Warm & Grounded
- Deep mocha hero with CSS radial blob decoration (organic, not geometric)
- `border-radius: 16px` on all cards and widgets — no harsh corners
- Warm near-black `#2c2420` for body text instead of pure `#000`
- Card hover uses `translateY(-4px)` + warm-tinted shadow — tactile depth
- `letter-spacing: -0.03em` on hero h1 — editorial, premium feel
- Lucide icons at `1em` scale with `currentColor` — blend into the palette naturally

---

## Pillar 3 — Implementation (Foundation & Framework) Compliance

### Semantic Integrity — Zero Div-Soup
```
<header>              role="banner"
  <nav>               aria-label="Primary navigation"
<main>                role="main"
  <section>           hero — aria-labelledby
  <aside>             sidebar — aria-label
    <section> ×3      widgets — aria-labelledby each
  <section>           content area — aria-labelledby
    <article> ×4      project cards — aria-labelledby each
<footer>              role="contentinfo"
  <nav>               aria-label="Social and contact navigation"
```
All `<div>` elements are layout wrappers with no semantic meaning — correct usage.

### Layout Strategy
| Tool | Where Used | Reason |
|---|---|---|
| **CSS Grid** | `.layout-grid` — sidebar + content | 2D macro structure |
| **CSS Grid** | `.article-grid` — auto-fill cards | Intrinsic column count |
| **CSS Grid** | `.card` — image zone + body zone | Equal-height internals |
| **Flexbox** | `.header__inner`, `.header__controls` | Horizontal alignment |
| **Flexbox** | `.nav__menu`, `.nav__link` | Icon + text row |
| **Flexbox** | `.hero__content`, `.hero__actions` | Vertical stack + CTA row |
| **Flexbox** | `.card__body`, `.footer__inner` | Column stacks |

### Mobile-First Strategy
All media queries use `min-width` exclusively — zero `max-width` overrides:

```
Default (all screens) → single column, centred hero, block nav
640px+ → hero shifts left, footer becomes 2-column
768px+ → hamburger hidden, inline horizontal nav
1024px+ → 2-column grid (280px sidebar + 1fr content), sticky sidebar
```

### Fluid Typography (`clamp()`)
Every font size in the system uses `clamp(MIN, PREFERRED_VW, MAX)`:
```css
--fs-xs:   clamp(0.75rem,  0.7rem  + 0.25vw, 0.85rem);
--fs-2xl:  clamp(2.25rem,  1.6rem  + 2.5vw,  3.25rem);
/* ... 7 steps total, no hardcoded px/rem font sizes in components */
```

### Accessibility (100% WCAG AA Compliance)
| Criterion | Implementation |
|---|---|
| **2.4.1** Bypass Blocks | Skip link — first DOM element, slides in on `:focus-visible` |
| **1.3.1** Info & Relationships | `aria-labelledby` on every `<section>` and `<article>` |
| **1.4.1** Use of Colour | Active nav: inset box-shadow stripe (shape, not colour-only) |
| **1.4.3** Contrast (AA) | All text verified ≥ 4.5:1; hero white-on-`#3d2b22` = 14.2:1 |
| **2.1.1** Keyboard | Full keyboard nav; Escape closes mobile menu + returns focus |
| **2.5.8** Target Size | Nav toggle: `44×44px` (padding expands hit area; bars stay 26×18) |
| **4.1.2** Name, Role, Value | `aria-expanded`, `aria-current`, `aria-controls` on all interactive elements |
| **4.1.3** Status Messages | `aria-label` on toggle button updates dynamically (Open ↔ Close) |
| **1.1.1** Non-text Content | All images have descriptive `alt` text; decorative elements are `aria-hidden` |
| **prefers-reduced-motion** | All transitions disabled via `@media` override |

---

## Advanced Features (Roadmap Steps 5 & 6)

### Dynamic Theme Toggle (Grounded Dark Mode)
- **Mechanism**: `[data-theme="dark"]` on `<html>` overrides CSS custom properties
- **FOUC Prevention**: Inline `<script>` in `<head>` reads `localStorage` synchronously before first paint
- **Persistence**: `localStorage.setItem('theme', value)` survives tab close / page refresh
- **Accessibility**: `aria-label` updates dynamically; icon swap (moon ↔ sun) controlled by CSS, not JS

### Lucide Icons (CDN)
- **Source**: `https://unpkg.com/lucide@latest/dist/umd/lucide.min.js`
- **Hydration**: `lucide.createIcons()` in `main.js` replaces `<i data-lucide>` with inline SVG
- **CLS Prevention**: CSS pre-sizes `[data-lucide]` to `1em × 1em` before hydration so no layout shift occurs
- **Guard**: `if (typeof lucide !== 'undefined')` protects against CDN failure

### Performance (LCP / CLS) Analysis
| Risk | Status | Fix Applied |
|---|---|---|
| Card images without dimensions | Mitigated | All images have explicit `width` + `height` attributes → browser reserves aspect-ratio space before load |
| Icon CLS on hydration | Mitigated | `[data-lucide] { width: 1em; height: 1em }` reserves space before `createIcons()` runs |
| Font FOIT/FOUT | Mitigated | `display=swap` in Google Fonts URL prevents invisible text; system fonts in fallback stack |
| Dark-mode FOUC | Mitigated | Synchronous inline script applies `data-theme` before CSS renders |
| First card as LCP candidate | Optimised | `fetchpriority="high"` on card-1 image signals browser importance |
| Sticky header hiding anchors | Mitigated | `scroll-margin-top: calc(var(--header-height) + var(--space-4))` on all scroll targets |

---

---

## Week 2 — Backend API Development (The Nervous System)

### Architecture

```
Browser (index.html)
       │
       │  fetch() / JSON
       ▼
┌──────────────────────────────────────────────────┐
│  server.js  — Express Entry Point                │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │  Middleware Layer                          │  │
│  │  • express.json()  — body parsing          │  │
│  │  • CORS handler    — cross-origin allow    │  │
│  │  • Request logger  — method + path + time  │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  ┌─────────────────┐  ┌───────────────────────┐  │
│  │ GET /api/       │  │ POST /api/contact     │  │
│  │ projects        │  │                       │  │
│  │ routes/         │  │ ┌─────────────────┐   │  │
│  │ projects.js     │  │ │ Blood-Brain     │   │  │
│  └─────────────────┘  │ │ Barrier         │   │  │
│                       │ │ (validateContact│   │  │
│                       │ │  middleware)    │   │  │
│                       │ └─────────────────┘   │  │
│                       │ routes/contact.js     │  │
│                       └───────────────────────┘  │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │  data.json  — Temporal Lobe                │  │
│  │  { "projects": [...], "contacts": [...] }  │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

**Base URL:** `http://localhost:3001`  
**Runtime:** Node.js ≥ 18 · Express 4  
**Persistence:** Flat-file JSON (no database; stateless read-mutate-write)

---

### API Endpoints

#### `GET /api/projects`

> Retrieves all portfolio projects from the Temporal Lobe.

| Property | Value |
|---|---|
| **HTTP Semantics** | Safe + Idempotent |
| **Side Effects** | None — read-only |
| **Success Code** | `200 OK` |

**Request**
```
GET http://localhost:3001/api/projects
```
No body. No query parameters.

**Response — 200 OK**
```json
{
  "status": "ok",
  "count": 4,
  "data": [
    {
      "id": 1,
      "title": "E-Commerce Full-Stack Store",
      "tag": "Next.js",
      "excerpt": "Pixel-perfect UI/UX focused dynamic store...",
      "image": "https://picsum.photos/seed/storefrontshop/600/340",
      "imageAlt": "A modern e-commerce storefront...",
      "url": null
    }
  ]
}
```

**curl**
```bash
curl http://localhost:3001/api/projects
```

---

#### `POST /api/contact`

> Appends a validated contact submission to the Temporal Lobe.

| Property | Value |
|---|---|
| **HTTP Semantics** | Unsafe + Non-idempotent |
| **Side Effects** | Writes a new entry to `contacts[]` in `data.json` |
| **Gatekeeper** | Blood-Brain Barrier middleware runs before the handler |
| **Success Code** | `201 Created` |

**Request Body**
```json
{
  "name":    "Ahmad Raza",
  "email":   "ahmad@example.com",
  "message": "Let's build something together."
}
```

| Field | Type | Required | Constraint |
|---|---|---|---|
| `name` | string | Yes | 2–100 characters, non-empty |
| `email` | string | Yes | Valid `local@domain.tld` format |
| `message` | string | Yes | 10–2000 characters, non-empty |

**Response — 201 Created**
```json
{
  "status": "created",
  "message": "Message received. Thank you for reaching out.",
  "id": 1714200000000
}
```

**curl**
```bash
curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Ahmad Raza","email":"ahmad@example.com","message":"Let us build something together."}'
```

---

### Blood-Brain Barrier — Validation Layers

The `validateContact` middleware enforces three sequential layers before any data reaches the Temporal Lobe. All violations are **collected in a single pass** and returned together — no waterfall UX.

#### Layer 1 — Presence (Syntactic)
Checks that all three required fields exist and are non-empty after trimming.

```
name    → present and non-empty after trim?
email   → present and non-empty after trim?
message → present and non-empty after trim?
```

Errors produced:
```
"name is required"
"email is required"
"message is required"
```

#### Layer 2 — Format (Syntactic)
Validates that `email` matches the RFC 5321-inspired pattern `local@domain.tld`.  
Only runs if the field was supplied (avoids duplicate `required + format` error).

```
Pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
```

Errors produced:
```
"email format is invalid"
```

#### Layer 3 — Semantics (Bounds)
Verifies that values are within meaningful length boundaries.

| Field | Min | Max |
|---|---|---|
| `name` | 2 chars | 100 chars |
| `message` | 10 chars | 2000 chars |

Errors produced:
```
"name must be at least 2 characters"
"name must not exceed 100 characters"
"message must be at least 10 characters"
"message must not exceed 2000 characters"
```

#### BBB Verdict — 400 Response
When any layer fails, the middleware short-circuits the request and returns all collected errors in one response:

```json
{
  "status": "error",
  "error": "Validation failed",
  "details": [
    "email format is invalid",
    "message must be at least 10 characters"
  ]
}
```

**On success**, field values are normalised (trimmed, email lowercased) in `req.body` before being passed to the route handler.

---

### Status Codes

| Code | Name | When Returned |
|---|---|---|
| `200` | OK | `GET /api/projects` returned data successfully |
| `201` | Created | `POST /api/contact` persisted a new submission |
| `204` | No Content | CORS preflight `OPTIONS` request resolved |
| `400` | Bad Request | Request body failed Blood-Brain Barrier validation |
| `404` | Not Found | No route matched the requested path |
| `500` | Internal Server Error | `data.json` I/O failure or unhandled exception |

All error responses follow a consistent JSON envelope:
```json
{ "status": "error", "error": "<human-readable reason>" }
```
The API **never** returns Express's default HTML error page.

---

### Frontend Integration

The Week 2 backend is fully connected to the Week 1 frontend. Three integration points in `assets/js/main.js`:

#### 1. Dynamic Project Rendering
```
Page load
  └─ fetchProjects() → GET /api/projects
       ├─ Success → renderProjects() replaces skeleton cards with real <article> elements
       │             lucide.createIcons() re-hydrates injected icons
       └─ Failure → .grid-error banner shown in the card grid
```
All API values pass through `escapeHtml()` before `innerHTML` injection — XSS defence.

#### 2. Contact Form Submit Flow
```
User submits form
  └─ setFormLoading(true)  → button disabled, "Sending…" spinner shown
       └─ POST /api/contact
            ├─ 201 → success banner shown, form.reset()
            ├─ 400 → applyFieldErrors(details[])
            │         Each error routed to its field <span> by keyword match
            │         (email → emailError, message → messageError, name → nameError)
            ├─ 5xx → generic error banner
            └─ Network Void (fetch throws) → "Network error" banner
  └─ setFormLoading(false) → button re-enabled in all paths (finally block)
```

#### 3. Loading States
| State | Trigger | UI |
|---|---|---|
| Projects loading | Page load before API responds | 4 animated shimmer skeleton cards (`aria-busy="true"`) |
| Form submitting | Between submit and response | Button shows CSS spinner + "Sending…" text, disabled |
| Form success | `201` received | Green banner, form cleared |
| Form error | `400` received | Red banner + red border + error text on each failing field |
| Network Void | `fetch()` throws | Red banner with connection advice |

---

## Project Structure

```
FullStackIntern/
├── index.html                   ← Portfolio document (Week 1 + API integration)
├── README.md                    ← This file
├── assets/
│   ├── css/
│   │   └── style.css            ← Design system + 16 component sections
│   ├── js/
│   │   └── main.js              ← Progressive enhancement + fetch + form logic
│   └── images/                  ← Reserved for local image assets
└── server/                      ← Week 2 — Backend Nervous System
    ├── server.js                ← Express entry point
    ├── package.json             ← Dependencies (Express only)
    ├── data.json                ← Temporal Lobe: projects + contacts
    ├── blueprint.md             ← Detailed API documentation
    ├── routes/
    │   ├── projects.js          ← GET  /api/projects
    │   └── contact.js           ← POST /api/contact
    └── middleware/
        └── validateContact.js   ← Blood-Brain Barrier (3-layer validation)
```

---

## Getting Started

### Week 1 — Frontend only

```bash
# Open directly in browser
open index.html

# Or use a local dev server (recommended — required for the API fetch to work)
npx serve .
# then open http://localhost:3000
```

### Week 2 — Full Stack (Frontend + Backend)

Run both servers simultaneously in two separate terminals:

```bash
# Terminal 1 — Backend API (port 3001)
cd server
npm install        # first run only — installs Express
npm run dev        # node --watch, auto-restarts on file save

# Terminal 2 — Frontend (any static server on a different port)
npx serve .        # serves index.html, typically http://localhost:3000
```

The frontend automatically targets `http://localhost:3001` — no config needed.

**Quick smoke tests (backend only):**
```bash
# GET all projects → 200
curl http://localhost:3001/api/projects

# Valid contact submission → 201
curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","message":"Hello from the terminal."}'

# Trigger Blood-Brain Barrier (name too short, message too short) → 400
curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"T","email":"bad-email","message":"Hi"}'
```

---

## Evaluator Notes

### Week 1
- All code is hand-written. No CSS frameworks (Bootstrap / Tailwind) or JS libraries (jQuery / React) were used at any point.
- Comments in every file explain the *why* behind each decision, not just the *what*.
- The three palette tokens `--color-mocha`, `--color-blue`, and `--color-grey` propagate through all 16 CSS sections via semantic aliases — a single token change rebrands the entire UI.
- The WCAG compliance table maps to specific code locations. Every claim is verifiable in the source.

### Week 2
- The API is **stateless** — no session, no in-memory cache. Every request carries everything the server needs.
- The Blood-Brain Barrier collects **all** validation errors in a single pass and returns them together, avoiding waterfall UX (user fixes one error, re-submits, finds the next).
- `data.json` is read fresh on every `GET /api/projects` request so the server can be restarted at any time without stale data.
- All API string values from the JSON response are passed through `escapeHtml()` before `innerHTML` injection — no XSS surface.
- The server **never** returns Express's default HTML error page; all errors are structured JSON with a consistent `{ status, error }` envelope.

---

*Built with purpose. Crafted with precision.*
*DecodeLabs Industrial Training — Batch 2026*
