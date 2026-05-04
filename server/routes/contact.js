'use strict';

/**
 * ============================================================
 * ANATOMY: POST /api/contact
 * ============================================================
 * HTTP Semantics: Unsafe + Non-idempotent (RFC 7231 §4.2)
 *   — Unsafe:          modifies server state (writes to DB)
 *   — Non-idempotent:  two identical POSTs create two distinct rows
 *
 * The Blood-Brain Barrier (validateContact middleware) runs first.
 * By the time this handler executes, req.body is guaranteed clean:
 *   • name    — trimmed, 2–100 chars
 *   • email   — trimmed, lowercased, valid format
 *   • message — trimmed, 10–2000 chars
 *
 * Security: parameterized query ($1, $2, $3) neutralises SQL injection —
 * pg never interpolates user input into the query string.
 * ============================================================
 */

const express         = require('express');
const validateContact = require('../middleware/validateContact');
const pool            = require('../db');

const router = express.Router();

/**
 * POST /api/contact
 * Inserts a validated contact submission into the contacts table.
 *
 * 201 Created  — row inserted; returns { status, message, id }
 * 400 Bad Req  — validation failed (Blood-Brain Barrier, not this handler)
 * 500 Internal — database write failed
 */
router.post('/', validateContact, async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Parameterized INSERT — $1/$2/$3 placeholders prevent SQL injection.
    // RETURNING id gives us the SERIAL-generated PK without a second round-trip.
    const { rows } = await pool.query(
      'INSERT INTO contacts (name, email, message) VALUES ($1, $2, $3) RETURNING id',
      [name, email, message]
    );

    res.status(201).json({
      status:  'created',
      message: 'Message received. Thank you for reaching out.',
      id:      rows[0].id,
    });
  } catch (err) {
    console.error('[POST /api/contact]', err.message);
    res.status(500).json({
      status: 'error',
      error:  'Could not save your message. Please try again.',
    });
  }
});

module.exports = router;
