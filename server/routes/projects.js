'use strict';

/**
 * ============================================================
 * ANATOMY: GET /api/projects
 * ============================================================
 * HTTP Semantics: Safe + Idempotent (RFC 7231 §4.2)
 *   — Safe:       does not modify server state
 *   — Idempotent: identical requests always produce identical results
 *
 * Data source: Neon PostgreSQL (projects table) via THE BRIDGE (db.js).
 * Replaces the former Temporal Lobe (data.json) read.
 *
 * Field aliasing: DB columns image_url / project_url / image_alt are
 * aliased to image / url / imageAlt to match the frontend contract
 * expected by main.js buildCardHTML().
 * ============================================================
 */

const express = require('express');
const pool    = require('../db');

const router = express.Router();

/**
 * GET /api/projects
 * Returns all portfolio projects ordered by id ascending.
 *
 * 200 OK       — projects array returned
 * 500 Internal — database query failed
 */
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         id,
         title,
         tag,
         excerpt,
         image_url   AS image,
         image_alt   AS "imageAlt",
         project_url AS url
       FROM projects
       ORDER BY id ASC`
    );

    res.status(200).json({
      status: 'ok',
      count:  rows.length,
      data:   rows,
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
