# =============================================================================
# ANATOMY: Dockerfile — Portfolio REST API
# =============================================================================
#
# Base image : node:18-slim  (Debian Bookworm slim)
#              Chosen over node:18-alpine for better glibc compatibility
#              with native Node modules. "slim" strips non-essential OS
#              packages, keeping the attack surface minimal.
#
# Target host: Hugging Face Spaces (Docker SDK)
#              HF's reverse proxy routes all public traffic to port 7860.
#              The app reads process.env.PORT, so ENV PORT=7860 is the
#              only change needed vs. the local default of 3001.
#
# Security   : Runs as the built-in 'node' user (uid 1000) — never root.
#              Even if the process is compromised, an attacker cannot
#              write to system paths or escalate privileges.
#
# Build layers (in cache-optimised order):
#   1. OS base
#   2. Dependencies  (rebuilt only when package.json changes)
#   3. Source files  (rebuilt on every code change)
# =============================================================================

FROM node:18-slim

# ── Labels ────────────────────────────────────────────────────────────────────

LABEL maintainer="Muhammad Shoaib <shoaibharoon10@gmail.com>"
LABEL description="Portfolio REST API — DecodeLabs Industrial Training Batch 2026"
LABEL version="2.0.0"

# ── Environment variables ─────────────────────────────────────────────────────
#
# NODE_ENV=production
#   · Tells Express to disable dev-only error details in responses
#   · npm's --omit=dev flag already excludes devDependencies at install time,
#     but NODE_ENV ensures runtime libraries also use production code paths
#
# PORT=7860
#   · Hugging Face Spaces expects the application to listen on 7860
#   · server.js reads: const PORT = process.env.PORT || 3001
#     so this single ENV line re-targets the port without touching source code

ENV NODE_ENV=production \
    PORT=7860

# ── Working directory ─────────────────────────────────────────────────────────
#
# /app is a conventional, predictable path.
# WORKDIR creates the directory if it does not already exist.

WORKDIR /app

# ── Layer 1: Install production dependencies ──────────────────────────────────
#
# Copying ONLY package.json before the source files exploits Docker's layer
# cache: if package.json has not changed, Docker reuses the cached
# node_modules layer on subsequent builds — even if source files changed.
# This turns a 30-second npm install into a sub-second cache hit.
#
# --omit=dev  : excludes devDependencies (none defined here, but future-safe)
# npm cache clean --force : removes the npm cache from the image layer,
#   reducing the final image size by ~50–100 MB

COPY package.json ./

RUN npm install --omit=dev \
    && npm cache clean --force

# ── Layer 2: Copy application source files ────────────────────────────────────
#
# --chown=node:node transfers file ownership to the 'node' user at copy time.
# This is a single-layer operation — more efficient than a separate
# RUN chown -R node:node /app which would create an extra image layer.
#
# WHY ownership matters here:
#   POST /api/contact calls fs.writeFileSync on data.json at runtime.
#   If data.json is owned by root, the non-root 'node' process cannot write
#   to it — every contact submission would throw EACCES and return 500.
#   --chown ensures the node user owns the file before USER node is applied.
#
# NOTE: data.json writes are ephemeral on Hugging Face Spaces.
#   The container filesystem is reset on every Space rebuild or restart.
#   Submitted contacts are not permanently stored in this deployment.
#   For persistent storage, replace data.json with an external DB (e.g.
#   Supabase, MongoDB Atlas) and update routes/contact.js accordingly.

COPY --chown=node:node server.js   ./
COPY --chown=node:node data.json   ./
COPY --chown=node:node routes/     ./routes/
COPY --chown=node:node middleware/  ./middleware/

# ── Anatomical Defence: drop root privileges ──────────────────────────────────
#
# node:18-slim ships with a pre-created 'node' user (uid 1000, gid 1000).
# Switching to it before CMD means the Node.js process never runs as root.
# The Linux kernel enforces this — even if the app is exploited, an attacker
# cannot install packages, modify /etc/passwd, or bind privileged ports (<1024).
#
# This directive MUST come after all COPY/RUN steps that require root access
# (such as npm install writing to /app/node_modules owned by root).

USER node

# ── Expose port ───────────────────────────────────────────────────────────────
#
# EXPOSE is documentation — it does not publish the port.
# The HF Spaces runtime reads this to know which port to proxy to.

EXPOSE 7860

# ── Health check ──────────────────────────────────────────────────────────────
#
# Probes GET /api/projects and exits 0 (healthy) on HTTP 200, 1 (unhealthy)
# on any other status or connection error.
#
# Using Node.js' built-in http module instead of curl/wget because
# node:18-slim does not include those utilities — no extra package needed.
#
# Hugging Face and container orchestrators use this probe to:
#   · Delay traffic routing until the app is truly ready (start-period)
#   · Restart the container if it becomes unhealthy (retries)

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD node -e "\
    require('http') \
      .get('http://localhost:' + process.env.PORT + '/api/projects', (r) => { \
        process.exit(r.statusCode === 200 ? 0 : 1); \
      }) \
      .on('error', () => process.exit(1)); \
  "

# ── Start command ─────────────────────────────────────────────────────────────
#
# Exec form (JSON array) is preferred over shell form ("node server.js"):
#
#   Shell form:  /bin/sh -c "node server.js"
#     · node is a CHILD of /bin/sh — not PID 1
#     · Docker stop sends SIGTERM to sh, which may not forward it to node
#     · Results in a 10-second SIGKILL timeout on every graceful shutdown
#
#   Exec form:   node server.js (direct, no shell wrapper)
#     · node IS PID 1 — receives SIGTERM directly from the container runtime
#     · Allows Express to close existing connections before exiting
#     · HF Spaces can restart the container cleanly without a forced kill

CMD ["node", "server.js"]
