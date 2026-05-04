'use strict';

/**
 * ============================================================
 * ANATOMY: Portfolio API — Entry Point (server.js)
 * ============================================================
 * This file wires three distinct concerns in order:
 *
 *   1. Middleware layer   — JSON parsing, CORS, request logger
 *   2. Route mounting     — /api/projects, /api/contact
 *   3. Error handling     — 404 catch-all, 500 global handler
 *   4. Listener           — binds to PORT env-var or 7860
 *
 * Statelessness: no session, no in-memory state. Every request
 * carries all the information the server needs to respond.
 * ============================================================
 */

const express        = require('express');
const projectsRouter = require('./routes/projects');
const contactRouter  = require('./routes/contact');

const app  = express();
const PORT = process.env.PORT || 7860;


// ─── 1. MIDDLEWARE ─────────────────────────────────────────────────────────────

// Parse incoming JSON bodies — populates req.body for POST handlers
app.use(express.json());

// CORS — explicit allowlist: production GitHub Pages origin + localhost for dev.
// Requests from any other origin receive no ACAO header and are blocked by the browser.
const ALLOWED_ORIGINS = new Set([
  'https://shoaibharoon10.github.io',  // GitHub Pages (production frontend)
  'http://localhost:3000',              // local dev — common static-server ports
  'http://localhost:5500',
  'http://127.0.0.1:5500',
]);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin',  origin);
    res.setHeader('Vary', 'Origin');              // tells CDNs the response varies by origin
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight short-circuit: OPTIONS requires no further processing
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Lightweight request logger — gives a trace of every inbound call
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}]  ${req.method.padEnd(6)}  ${req.path}`);
  next();
});


// ─── 2. ROUTES ─────────────────────────────────────────────────────────────────

// All routes are namespaced under /api to cleanly separate API
// surface from any future static-file serving on this process.
app.use('/api/projects', projectsRouter);
app.use('/api/contact',  contactRouter);


// ─── 3. ERROR HANDLING ─────────────────────────────────────────────────────────

// 404 — no route matched; always return JSON (never Express's default HTML)
app.use((_req, res) => {
  res.status(404).json({ status: 'error', error: 'Route not found' });
});

// 500 — last-resort handler for errors propagated via next(err).
// Four-parameter signature is required — Express uses arity to detect error handlers.
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[Unhandled Error]', err.message);
  res.status(500).json({ status: 'error', error: 'Internal server error' });
});


// ─── 4. LISTENER ───────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\nPortfolio API  →  http://localhost:${PORT}`);
  console.log('─────────────────────────────────────');
  console.log(`  GET   http://localhost:${PORT}/api/projects`);
  console.log(`  POST  http://localhost:${PORT}/api/contact`);
  console.log('─────────────────────────────────────\n');
});
