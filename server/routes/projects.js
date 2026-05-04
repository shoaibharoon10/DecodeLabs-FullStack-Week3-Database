'use strict';

/**
 * ============================================================
 * ANATOMY: GET /api/projects
 * ============================================================
 * HTTP Semantics: Safe + Idempotent (RFC 7231 §4.2)
 *   — Safe:       does not modify server state
 *   — Idempotent: identical requests always produce identical results
 *
 * The Temporal Lobe (data.json) is read fresh on every request
 * to stay stateless — no in-memory cache that could drift out
 * of sync if data.json is edited between calls.
 * ============================================================
 */

const express = require('express');
const path    = require('path');
const fs      = require('fs');

const router    = express.Router();
const DATA_PATH = path.resolve(__dirname, '../data.json');

/**
 * GET /api/projects
 * Returns the full projects array from the Temporal Lobe.
 *
 * 200 OK       — projects array returned
 * 500 Internal — data.json is unreadable or malformed
 */
router.get('/', (req, res) => {
  try {
    // fs.readFileSync is intentional here: this is a lightweight JSON file,
    // not a database. Synchronous read keeps the handler simple and avoids
    // callback/promise complexity for a file that never exceeds a few KB.
    const raw          = fs.readFileSync(DATA_PATH, 'utf8');
    const { projects } = JSON.parse(raw);

    res.status(200).json({
      status: 'ok',
      count:  projects.length,
      data:   projects,
    });
  } catch (err) {
    console.error('[GET /api/projects]', err.message);
    res.status(500).json({
      status: 'error',
      error:  'Could not retrieve projects',
    });
  }
});

module.exports = router;
