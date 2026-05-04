'use strict';

/**
 * ============================================================
 * ANATOMY: POST /api/contact
 * ============================================================
 * HTTP Semantics: Unsafe + Non-idempotent (RFC 7231 §4.2)
 *   — Unsafe:          modifies server state (writes to data.json)
 *   — Non-idempotent:  two identical POSTs create two distinct records
 *
 * The Blood-Brain Barrier (validateContact middleware) runs first.
 * By the time this handler executes, req.body is guaranteed clean:
 *   • name    — trimmed, 2–100 chars
 *   • email   — trimmed, lowercased, valid format
 *   • message — trimmed, 10–2000 chars
 *
 * Persistence: read-mutate-write against data.json (Temporal Lobe).
 * Atomic enough for a JSON file store; a real DB would use a transaction.
 * ============================================================
 */

const express         = require('express');
const path            = require('path');
const fs              = require('fs');
const validateContact = require('../middleware/validateContact');

const router    = express.Router();
const DATA_PATH = path.resolve(__dirname, '../data.json');

/**
 * POST /api/contact
 * Appends a validated contact submission to the Temporal Lobe.
 *
 * 201 Created  — submission persisted; returns { status, message, id }
 * 400 Bad Req  — validation failed (Blood-Brain Barrier, not this handler)
 * 500 Internal — data.json read/write failed
 */
router.post('/', validateContact, (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Build the submission record
    const entry = {
      id:         Date.now(),               // Monotonic timestamp — lightweight unique key
      name,
      email,
      message,
      receivedAt: new Date().toISOString(), // ISO-8601 for unambiguous sorting/querying
    };

    // Read → mutate → write (Temporal Lobe append)
    const store = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    store.contacts.push(entry);
    fs.writeFileSync(DATA_PATH, JSON.stringify(store, null, 2), 'utf8');

    // 201 Created — a new resource has been minted in the Temporal Lobe
    res.status(201).json({
      status:  'created',
      message: 'Message received. Thank you for reaching out.',
      id:      entry.id,
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
