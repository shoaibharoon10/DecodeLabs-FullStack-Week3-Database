/**
 * main.js — Muhammad Shoaib Portfolio
 * DecodeLabs Industrial Training | Batch 2026 | Project 4 (Unified Systems)
 *
 * Philosophy: Progressive Enhancement.
 * Every feature degrades gracefully — the page is fully usable if this
 * file fails to load. No framework dependencies. Pure vanilla JS.
 *
 * Sections:
 *   1. Lucide Icon Hydration
 *   2. Colour Theme Toggle  (Light ↔ Grounded Dark)
 *   3. Mobile Navigation Toggle
 *   4. Dynamic Footer Year
 *   5. Project Fetch & Dynamic Render
 *   6. Contact Form — Blood-Brain Barrier Feedback Loop
 *   7. Server Status Indicator — "The Pulse"
 */

'use strict';


/* ==========================================================================
   1. LUCIDE ICON HYDRATION
   Replaces every <i data-lucide="icon-name"> with the corresponding SVG.
   Called first so icons are present before any other JS reads the DOM.

   Guard check: lucide may be undefined if the CDN call failed (offline,
   ad-blocker, etc.). The guard ensures no uncaught TypeError.
   ========================================================================== */

if (typeof lucide !== 'undefined') {
  lucide.createIcons();
}


/* ==========================================================================
   2. COLOUR THEME TOGGLE — Light (default) ↔ Grounded Dark
   ──────────────────────────────────────────────────────────────────────────
   Architecture:
   · [data-theme="dark"] on <html> activates the dark CSS token block.
   · Light mode = attribute absent (no [data-theme] at all — cleaner than
     setting data-theme="light" which has no matching CSS rule).
   · The inline <script> in <head> applies the saved theme synchronously
     before first paint, preventing FOUC for returning dark-mode users.
     This JS block only syncs the button label on load and wires the click.
   ========================================================================== */

const themeToggle = document.getElementById('themeToggle');
const html        = document.documentElement;

/**
 * Updates the toggle button's aria-label to always describe the NEXT action,
 * not the current state. "Switch to dark mode" means "currently light; click
 * to go dark." This follows WCAG SC 4.1.2 (Name, Role, Value).
 *
 * @param {boolean} isDark — true when dark mode is currently active.
 */
const syncThemeLabel = (isDark) => {
  if (!themeToggle) return;
  themeToggle.setAttribute(
    'aria-label',
    isDark ? 'Switch to light mode' : 'Switch to dark mode'
  );
};

// Sync button label with whatever theme the inline script already applied.
syncThemeLabel(html.getAttribute('data-theme') === 'dark');

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isDark   = html.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';

    // Apply theme: set attribute for dark, remove it entirely for light.
    if (newTheme === 'dark') {
      html.setAttribute('data-theme', 'dark');
    } else {
      html.removeAttribute('data-theme');
    }

    // Persist preference across sessions.
    try {
      localStorage.setItem('theme', newTheme);
    } catch (e) { /* noop — private browsing may block localStorage */ }

    syncThemeLabel(newTheme === 'dark');
  });
}


/* ==========================================================================
   3. MOBILE NAVIGATION TOGGLE
   ──────────────────────────────────────────────────────────────────────────
   Toggles .is-open on the <ul> and syncs both aria-expanded and aria-label
   on the <button> across three dismissal paths:
     a) clicking the toggle button
     b) clicking outside the menu
     c) pressing Escape
   All three paths must update state identically to keep AT in sync.
   ========================================================================== */

const navToggle = document.getElementById('navToggle');
const navMenu   = document.getElementById('navMenu');

if (navToggle && navMenu) {

  // a) Toggle button click
  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open');

    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute(
      'aria-label',
      isOpen ? 'Close navigation menu' : 'Open navigation menu'
    );
  });

  // b) Outside-click dismissal
  document.addEventListener('click', (e) => {
    const clickedOutside =
      !navToggle.contains(e.target) && !navMenu.contains(e.target);

    if (clickedOutside && navMenu.classList.contains('is-open')) {
      navMenu.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open navigation menu');
    }
  });

  // c) Escape key dismissal — returns focus to the trigger (WCAG 2.1.1)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
      navMenu.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open navigation menu');
      navToggle.focus();
    }
  });

}


/* ==========================================================================
   4. DYNAMIC FOOTER YEAR
   Writes the current year into #currentYear so the copyright notice never
   goes stale. A server-side template is not available in a static project,
   so one line of JS is the right tool for this job.
   ========================================================================== */

const yearEl = document.getElementById('currentYear');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}


/* ==========================================================================
   5. PROJECT FETCH & DYNAMIC RENDER
   ──────────────────────────────────────────────────────────────────────────
   Fetches /api/projects and replaces the skeleton placeholder cards with
   real content. Three possible outcomes:

     a) Success (2xx)  — renders <article> cards, re-hydrates Lucide icons
     b) API Error      — non-ok HTTP status; shows inline error in the grid
     c) Network Void   — fetch() throws (offline, CORS, DNS failure)

   XSS defence: all DOM writes use the pure DOM Insertion Process
   (createElement + textContent + setAttribute + appendChild).
   No innerHTML, no template-literal string injection, no escapeHtml façade.

   I-P-O Unidirectional Data Flow:
     Input   → fetchProjects() called on page load
     Process → fetch() → !res.ok guard → .json() → data extraction
     Output  → renderProjects(data) or renderGridError(message)
     Shield  → finally{} always decommissions the skeleton UI
   ========================================================================== */

const API_BASE    = 'https://shabichem-decodelabs-portfolio-api.hf.space';
const projectGrid = document.getElementById('projectGrid');

/**
 * Validates a URL's protocol to block javascript: and data: injection.
 * Returns the original URL for http/https, empty string otherwise.
 * Used exclusively for anchor href — where javascript: executes on click.
 *
 * @param {string} rawUrl
 * @returns {string}
 */
function sanitizeUrl(rawUrl) {
  try {
    const { protocol } = new URL(rawUrl);
    return (protocol === 'https:' || protocol === 'http:') ? rawUrl : '';
  } catch {
    return '';
  }
}

/**
 * Builds one <article> card element using the pure DOM Insertion Process.
 *
 * Every API value is written via textContent or setAttribute — the browser
 * never parses them as HTML, eliminating the innerHTML XSS surface entirely.
 * No escapeHtml needed: textContent and setAttribute are intrinsically safe.
 *
 * @param {{ id, title, tag, excerpt, image, imageAlt, url }} project
 * @param {number} index — first card gets fetchpriority="high" for LCP
 * @returns {HTMLElement}
 */
function buildCardElement(project, index) {
  const { id, title, tag, excerpt, image, imageAlt, url } = project;
  const isPriority = index === 0;

  // <article class="card" aria-labelledby="card-{id}-title">
  const article = document.createElement('article');
  article.className = 'card';
  article.setAttribute('aria-labelledby', `card-${id}-title`);

  // ── Image wrapper ─────────────────────────────────────────────────────────
  const imageWrap = document.createElement('div');
  imageWrap.className = 'card__image-wrap';

  const img = document.createElement('img');
  img.src       = String(image ?? '');   // img.src is a URL, not HTML — safe
  img.alt       = String(imageAlt ?? '');
  img.className = 'card__image';
  img.loading   = isPriority ? 'eager' : 'lazy';
  img.width     = 600;
  img.height    = 340;
  if (isPriority) img.setAttribute('fetchpriority', 'high');

  imageWrap.appendChild(img);

  // ── Card body ─────────────────────────────────────────────────────────────
  const body = document.createElement('div');
  body.className = 'card__body';

  const tagEl = document.createElement('span');
  tagEl.className   = 'card__tag';
  tagEl.textContent = String(tag ?? '');

  const titleEl = document.createElement('h3');
  titleEl.className   = 'card__title';
  titleEl.id          = `card-${id}-title`;
  titleEl.textContent = String(title ?? '');

  const excerptEl = document.createElement('p');
  excerptEl.className   = 'card__excerpt';
  excerptEl.textContent = String(excerpt ?? '');

  // CTA — anchor if url passes sanitization, disabled span otherwise
  const safeHref = url ? sanitizeUrl(url) : '';
  let ctaEl;

  if (safeHref) {
    ctaEl = document.createElement('a');
    ctaEl.href      = safeHref;
    ctaEl.className = 'card__cta';
    ctaEl.setAttribute('aria-label', `View the ${String(title ?? '')} project live`);
    ctaEl.target    = '_blank';
    ctaEl.rel       = 'noopener noreferrer';

    ctaEl.appendChild(document.createTextNode('View Project'));

    const ctaIcon = document.createElement('i');
    ctaIcon.setAttribute('data-lucide', 'arrow-right');
    ctaIcon.setAttribute('aria-hidden', 'true');
    ctaEl.appendChild(ctaIcon);
  } else {
    ctaEl = document.createElement('span');
    ctaEl.className = 'card__cta card__cta--disabled';
    ctaEl.setAttribute('aria-label', `${String(title ?? '')} — coming soon`);
    ctaEl.textContent = 'Coming Soon';
  }

  body.appendChild(tagEl);
  body.appendChild(titleEl);
  body.appendChild(excerptEl);
  body.appendChild(ctaEl);

  article.appendChild(imageWrap);
  article.appendChild(body);

  return article;
}

/**
 * Renders an actionable error state into the project grid using DOM insertion.
 * Pure output function — aria-busy is managed by the fetchProjects finally{}.
 *
 * @param {string} message — human-readable, actionable error copy
 */
function renderGridError(message) {
  if (!projectGrid) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'grid-error';
  wrapper.setAttribute('role', 'alert');

  const p = document.createElement('p');
  p.textContent = message;
  wrapper.appendChild(p);

  projectGrid.replaceChildren(wrapper);
}

/**
 * Replaces skeleton placeholders with real project cards.
 * Pure output function — does not touch aria-busy or any loading state.
 * Uses a DocumentFragment for a single, efficient DOM reflow.
 *
 * @param {Array} projects
 */
function renderProjects(projects) {
  if (!projectGrid) return;

  if (!projects || projects.length === 0) {
    const p = document.createElement('p');
    p.className   = 'grid-empty';
    p.textContent = 'No projects available yet.';
    projectGrid.replaceChildren(p);
    return;
  }

  const fragment = document.createDocumentFragment();
  projects.forEach((project, index) => {
    fragment.appendChild(buildCardElement(project, index));
  });
  projectGrid.replaceChildren(fragment);

  // Re-hydrate icons injected via DOM — the initial createIcons() call
  // ran before these cards existed in the DOM.
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

/**
 * Entry point: fetches /api/projects and drives renderProjects or the
 * error state following strict I-P-O Unidirectional Data Flow.
 *
 * The Shield (finally{}): skeleton UI is always decommissioned — success,
 * API error, or Network Void — because aria-busy management lives here,
 * not scattered across renderProjects and the catch block.
 */
async function fetchProjects() {
  if (!projectGrid) return;

  try {
    // ── PROCESS: Async Fetch ───────────────────────────────────────────────
    const res = await fetch(`${API_BASE}/api/projects`);

    // Senior guard: check !res.ok BEFORE parsing JSON.
    // A non-ok response body may not be JSON (e.g. 502 Nginx HTML page).
    // Throw a descriptive HTTP error so the catch gets a meaningful message.
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }

    const { data } = await res.json();

    // ── OUTPUT: DOM Manipulation ───────────────────────────────────────────
    renderProjects(data);

  } catch (err) {
    // Network Void or thrown HTTP error — both surface an actionable message.
    console.error('[fetchProjects]', err.message);
    renderGridError('Could not load projects — check your connection or try refreshing.');

  } finally {
    // ── THE SHIELD ─────────────────────────────────────────────────────────
    // Runs unconditionally: success, API error, or Network Void.
    // Single owner of skeleton decommission — never duplicated across branches.
    if (projectGrid) {
      projectGrid.setAttribute('aria-busy', 'false');
    }
  }
}

// Fire immediately — the script is at the bottom of <body> so the DOM is ready.
fetchProjects();


/* ==========================================================================
   6. CONTACT FORM — BLOOD-BRAIN BARRIER FEEDBACK LOOP
   ──────────────────────────────────────────────────────────────────────────
   Intercepts form submit, POSTs JSON to /api/contact, and maps every
   API response code to a precise UI state:

     201 Created     → success banner + form reset
     400 Bad Request → inline field-level errors (details[] from the BBB)
     5xx / Network   → generic error banner (Network Void)

   Loading state: disables the submit button and replaces its label with a
   CSS spinner while the request is in-flight. "Predictability reduces
   cognitive load."
   ========================================================================== */

const contactForm   = document.getElementById('contactForm');
const formStatus    = document.getElementById('formStatus');
const contactSubmit = document.getElementById('contactSubmit');

/**
 * Activates / deactivates the submit button's loading state.
 * @param {boolean} isLoading
 */
function setFormLoading(isLoading) {
  if (!contactSubmit) return;
  contactSubmit.disabled = isLoading;
  contactSubmit.classList.toggle('form-submit--loading', isLoading);
  contactSubmit.setAttribute('aria-busy', String(isLoading));
}

/**
 * Shows the top-of-form status banner and scrolls it into view.
 * @param {'success'|'error'} type
 * @param {string} message
 */
function showFormStatus(type, message) {
  if (!formStatus) return;
  formStatus.hidden    = false;
  formStatus.className = `form-status form-status--${type}`;
  formStatus.textContent = message;
  formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Clears all field errors and the status banner — called before each submit
 * so the user sees a clean slate on retry.
 */
function clearFieldErrors() {
  ['nameError', 'emailError', 'messageError'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
  if (contactForm) {
    contactForm.querySelectorAll('.form-input--error').forEach((el) => {
      el.classList.remove('form-input--error');
    });
  }
  if (formStatus) {
    formStatus.hidden    = true;
    formStatus.textContent = '';
  }
}

/**
 * Routes the Blood-Brain Barrier's details[] array to individual fields.
 *
 * Explicit if/else order: email → message → name.
 * Priority matters because a generic .includes() scan could produce
 * unexpected matches as the BBB adds new rule wording. This order
 * matches the most-specific checks first (email > message > name).
 *
 * Unmatched errors (e.g. a future server-side rule) are appended to
 * the status banner so they are never silently swallowed.
 *
 * @param {string[]} details
 */
function applyFieldErrors(details) {
  const unmatched = [];

  details.forEach((msg) => {
    const lc = msg.toLowerCase();
    let inputId = null;
    let errorId = null;

    if (lc.includes('email')) {
      inputId = 'contactEmail';
      errorId = 'emailError';
    } else if (lc.includes('message')) {
      inputId = 'contactMessage';
      errorId = 'messageError';
    } else if (lc.includes('name')) {
      inputId = 'contactName';
      errorId = 'nameError';
    } else {
      unmatched.push(msg);
      return;
    }

    const inputEl = document.getElementById(inputId);
    const errorEl = document.getElementById(errorId);

    if (inputEl) inputEl.classList.add('form-input--error');
    // Capitalise the first letter — the BBB returns lowercase sentences
    if (errorEl) errorEl.textContent = msg.charAt(0).toUpperCase() + msg.slice(1);
  });

  // Surface any unmatched errors that don't map to a field
  if (unmatched.length && formStatus) {
    const extra = unmatched.map((m) => m.charAt(0).toUpperCase() + m.slice(1)).join(' · ');
    formStatus.textContent += `  (${extra})`;
  }
}

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFieldErrors();
    setFormLoading(true);

    const body = {
      name:    document.getElementById('contactName').value,
      email:   document.getElementById('contactEmail').value,
      message: document.getElementById('contactMessage').value,
    };

    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });

      // Senior guard: check !res.ok BEFORE calling res.json().
      // A 5xx response may return an HTML error page — parsing it as JSON
      // throws a SyntaxError that masks the real HTTP status in the catch.
      // 400 is excluded: the BBB always returns structured JSON for validation
      // failures, and we need data.details to surface field-level errors.
      if (!res.ok && res.status !== 400) {
        throw new Error(`${res.status} ${res.statusText}`);
      }

      const data = await res.json();

      if (res.status === 201) {
        // ── Success path ───────────────────────────────────────────────────
        showFormStatus('success', data.message || "Message sent — I'll be in touch soon.");
        contactForm.reset();

      } else if (res.status === 400) {
        // ── Blood-Brain Barrier rejection — field-level detail ─────────────
        showFormStatus('error', 'Please fix the highlighted fields below.');
        applyFieldErrors(data.details || []);

      } else {
        // ── Unexpected 2xx/3xx — surface server message if available ────────
        showFormStatus('error', data.error || 'Something went wrong. Please try again.');
      }

    } catch (err) {
      // ── Network Void or thrown HTTP error ─────────────────────────────────
      console.error('[contactForm]', err.message);
      showFormStatus('error', 'Network error — please check your connection and try again.');

    } finally {
      setFormLoading(false);
    }
  });
}


/* ==========================================================================
   7. SERVER STATUS INDICATOR — "The Pulse"
   ──────────────────────────────────────────────────────────────────────────
   Pings GET /api/projects on page load and updates the header badge:

     Online  → Ethereal Blue dot + pulse animation + "API: Online" label
     Offline → muted dot + no animation + "API: Offline" label

   AbortController gives fetch() a hard 5-second timeout — the browser's
   default is indefinite, which would leave the badge stuck on "Checking…"
   if the server is firewalled rather than actively refusing connections.

   Fire-and-forget: called concurrently with fetchProjects(). Neither
   call blocks the other — status check latency does not delay card render.
   ========================================================================== */

const apiStatusEl = document.getElementById('apiStatus');

/**
 * Applies an online/offline CSS modifier class and updates accessible text.
 * Always removes both state classes first so transitions are idempotent —
 * calling setStatus('online') twice is safe.
 *
 * @param {'online'|'offline'} state
 */
function setStatus(state) {
  if (!apiStatusEl) return;
  const label = apiStatusEl.querySelector('.api-status__label');

  apiStatusEl.classList.remove('api-status--online', 'api-status--offline');

  if (state === 'online') {
    apiStatusEl.classList.add('api-status--online');
    apiStatusEl.setAttribute('aria-label', 'API server status: online');
    if (label) label.textContent = 'API: Online';
  } else {
    apiStatusEl.classList.add('api-status--offline');
    apiStatusEl.setAttribute('aria-label', 'API server status: offline');
    if (label) label.textContent = 'API: Offline';
  }
}

/**
 * Probes the API and delegates result to setStatus().
 * Any non-2xx response or network failure → offline.
 */
async function checkServerStatus() {
  if (!apiStatusEl) return;

  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(`${API_BASE}/api/projects`, { signal: controller.signal });
    clearTimeout(timeoutId);
    setStatus(res.ok ? 'online' : 'offline');
  } catch {
    clearTimeout(timeoutId);
    setStatus('offline');
  }
}

// Fire concurrently with fetchProjects() — neither blocks the other.
checkServerStatus();
