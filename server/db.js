'use strict';

/**
 * ============================================================
 * THE BRIDGE — db.js
 * ============================================================
 * Initialises a pg connection pool that targets the Neon
 * Postgres instance specified in DATABASE_URL.
 *
 * SSL note: Neon requires TLS. { rejectUnauthorized: false }
 * trusts Neon's certificate without a local CA bundle — safe
 * for a managed cloud endpoint; never use on untrusted hosts.
 *
 * The pool is a singleton module: Node caches the first
 * require() call, so every route file shares the same pool
 * rather than opening a new connection per request.
 * ============================================================
 */

const { Pool } = require('pg');
const path     = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  console.error('[pg pool] Unexpected client error:', err.message);
});

module.exports = pool;
