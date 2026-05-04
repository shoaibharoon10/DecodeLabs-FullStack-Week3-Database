'use strict';

/**
 * ============================================================
 * ANATOMY: Blood-Brain Barrier — validateContact Middleware
 * ============================================================
 * Acts as the gatekeeper before any write touches the Temporal
 * Lobe. Runs three sequential defence layers:
 *
 *   Layer 1 — Presence  (syntactic): all required fields exist
 *   Layer 2 — Format    (syntactic): email matches RFC 5321 pattern
 *   Layer 3 — Semantics (semantic):  values are within meaningful bounds
 *
 * All violations are collected before responding so the client
 * receives every error in a single round-trip (no waterfall UX).
 *
 * On success: values are trimmed/normalised in req.body before
 * next() is called — the route handler always receives clean data.
 * ============================================================
 */

// RFC 5321-inspired email pattern: local@domain.tld
// Deliberately pragmatic — rejects obvious malformed values without
// false-positives on valid international or subdomain addresses.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Semantic length bounds — min prevents noise; max prevents payload abuse
const BOUNDS = {
  name:    { min: 2,   max: 100  },
  message: { min: 10,  max: 2000 },
};

/**
 * validateContact
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function validateContact(req, res, next) {
  // Destructure safely — req.body may be empty if Content-Type was wrong
  const { name, email, message } = req.body ?? {};
  const errors = [];

  // Pre-trim once so each layer works on clean strings
  const nameVal    = typeof name    === 'string' ? name.trim()    : '';
  const emailVal   = typeof email   === 'string' ? email.trim()   : '';
  const messageVal = typeof message === 'string' ? message.trim() : '';

  // ── LAYER 1: Presence (syntactic) ──────────────────────────────────────────
  if (!nameVal)    errors.push('name is required');
  if (!emailVal)   errors.push('email is required');
  if (!messageVal) errors.push('message is required');

  // ── LAYER 2: Format (syntactic) ────────────────────────────────────────────
  // Only checked when a value was supplied (avoids duplicate "required" + "format" error)
  if (emailVal && !EMAIL_RE.test(emailVal)) {
    errors.push('email format is invalid');
  }

  // ── LAYER 3: Bounds (semantic) ─────────────────────────────────────────────
  if (nameVal) {
    if (nameVal.length < BOUNDS.name.min)
      errors.push(`name must be at least ${BOUNDS.name.min} characters`);
    if (nameVal.length > BOUNDS.name.max)
      errors.push(`name must not exceed ${BOUNDS.name.max} characters`);
  }
  if (messageVal) {
    if (messageVal.length < BOUNDS.message.min)
      errors.push(`message must be at least ${BOUNDS.message.min} characters`);
    if (messageVal.length > BOUNDS.message.max)
      errors.push(`message must not exceed ${BOUNDS.message.max} characters`);
  }

  // ── VERDICT ────────────────────────────────────────────────────────────────
  if (errors.length > 0) {
    return res.status(400).json({
      status:  'error',
      error:   'Validation failed',
      details: errors,
    });
  }

  // Normalise: write clean values back so the route handler never repeats trim logic
  req.body.name    = nameVal;
  req.body.email   = emailVal.toLowerCase();  // canonical form for dedup/search
  req.body.message = messageVal;

  next();
}

module.exports = validateContact;
