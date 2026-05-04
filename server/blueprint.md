# Portfolio API — Blueprint

> "If it isn't documented, it doesn't exist."

**Version:** 2.0.0  
**Local Base URL:** `http://localhost:7860`  
**Production Base URL:** `https://shabichem-decodelabs-portfolio-api.hf.space`  
**Data Store:** `data.json` (Temporal Lobe — flat-file persistence)  
**Auth:** None (public portfolio API)

---

## Architecture Overview

```
Client (Browser)
     │
     │  HTTP/JSON
     ▼
┌─────────────────────────────────────────────┐
│  server.js  —  Entry Point                  │
│  ┌─────────────────────────────────────────┐│
│  │  Middleware Layer                        ││
│  │  • express.json()   — body parsing       ││
│  │  • CORS handler     — cross-origin       ││
│  │  • Request logger   — trace every call   ││
│  └─────────────────────────────────────────┘│
│  ┌──────────────────┐ ┌────────────────────┐│
│  │  /api/projects   │ │  /api/contact      ││
│  │  routes/         │ │  routes/           ││
│  │  projects.js     │ │  contact.js        ││
│  └──────────────────┘ └──────┬─────────────┘│
│                               │              │
│                    ┌──────────▼──────────┐   │
│                    │  Blood-Brain Barrier│   │
│                    │  middleware/        │   │
│                    │  validateContact.js │   │
│                    └─────────────────────┘   │
│  ┌─────────────────────────────────────────┐│
│  │  data.json  —  Temporal Lobe             ││
│  │  { projects: [...], contacts: [...] }    ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

---

## Endpoints

---

### `GET /api/projects`

Retrieves all portfolio projects from the Temporal Lobe.

**HTTP Semantics:** Safe + Idempotent — read-only, no side effects.

**Request**

```
GET /api/projects
Accept: application/json
```

No request body. No query parameters.

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
      "excerpt": "Pixel-perfect UI/UX focused dynamic store built with Next.js App Router...",
      "image": "https://picsum.photos/seed/storefrontshop/600/340",
      "imageAlt": "A modern e-commerce storefront with product grid...",
      "url": null
    }
  ]
}
```

| Field    | Type            | Description                          |
|----------|-----------------|--------------------------------------|
| `status` | `string`        | Always `"ok"` on success             |
| `count`  | `number`        | Total number of projects returned    |
| `data`   | `Array<Project>`| Ordered array of project objects     |

**Project Object**

| Field      | Type           | Description                            |
|------------|----------------|----------------------------------------|
| `id`       | `number`       | Unique identifier                      |
| `title`    | `string`       | Project display name                   |
| `tag`      | `string`       | Primary technology label               |
| `excerpt`  | `string`       | Short description (1–2 sentences)      |
| `image`    | `string`       | Absolute image URL                     |
| `imageAlt` | `string`       | Accessible alt text for the image      |
| `url`      | `string\|null` | Live project URL, or `null` if pending |

**Response — 500 Internal Server Error**

```json
{
  "status": "error",
  "error": "Could not retrieve projects"
}
```

Cause: `data.json` is unreadable or contains malformed JSON.

---

### `POST /api/contact`

Submits a contact message. Appends a validated entry to the Temporal Lobe.

**HTTP Semantics:** Unsafe + Non-idempotent — two identical requests create two distinct records.

**Gatekeeper:** All requests pass through the Blood-Brain Barrier (`validateContact` middleware) before the handler runs. The handler only executes on clean, normalised data.

**Request**

```
POST /api/contact
Content-Type: application/json
```

**Request Body**

```json
{
  "name":    "Ahmad Raza",
  "email":   "ahmad@example.com",
  "message": "I'd love to discuss a potential collaboration on an AI project."
}
```

| Field     | Type     | Required | Constraints                    |
|-----------|----------|----------|--------------------------------|
| `name`    | `string` | Yes      | 2–100 characters, non-empty    |
| `email`   | `string` | Yes      | Valid format: `local@domain.tld` |
| `message` | `string` | Yes      | 10–2000 characters, non-empty  |

**Response — 201 Created**

```json
{
  "status": "created",
  "message": "Message received. Thank you for reaching out.",
  "id": 1714200000000
}
```

| Field     | Type     | Description                              |
|-----------|----------|------------------------------------------|
| `status`  | `string` | Always `"created"` on success            |
| `message` | `string` | Human-readable confirmation              |
| `id`      | `number` | Unique ID of the created record (ms timestamp) |

**Response — 400 Bad Request**

Returned by the Blood-Brain Barrier when validation fails. All violations are returned in a single response.

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

| Field     | Type            | Description                          |
|-----------|-----------------|--------------------------------------|
| `status`  | `string`        | Always `"error"` on failure          |
| `error`   | `string`        | High-level error label               |
| `details` | `Array<string>` | One entry per validation violation   |

**Response — 500 Internal Server Error**

```json
{
  "status": "error",
  "error": "Could not save your message. Please try again."
}
```

Cause: `data.json` read or write failed (disk permissions, corrupted file).

---

## Blood-Brain Barrier — Validation Rules

The `validateContact` middleware enforces three ordered layers:

| Layer | Type      | Rule                                              |
|-------|-----------|---------------------------------------------------|
| 1     | Presence  | `name`, `email`, `message` must all be present and non-empty after trimming |
| 2     | Format    | `email` must match `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` |
| 3     | Semantics | `name`: 2–100 chars · `message`: 10–2000 chars   |

On success, `req.body` values are normalised before the route handler runs:
- All fields — trimmed of leading/trailing whitespace
- `email` — lowercased for canonical form

---

## Status Code Reference

| Code | Meaning              | When Used                                            |
|------|----------------------|------------------------------------------------------|
| 200  | OK                   | `GET /api/projects` returned data successfully       |
| 201  | Created              | `POST /api/contact` persisted a new submission       |
| 204  | No Content           | CORS preflight `OPTIONS` request resolved            |
| 400  | Bad Request          | Request body failed Blood-Brain Barrier validation   |
| 404  | Not Found            | No route matched the requested path                  |
| 500  | Internal Server Error| Unhandled exception or data.json I/O failure         |

---

## Data Store — Temporal Lobe (`data.json`)

```
server/
└── data.json
    ├── projects[]   — read by GET /api/projects (never mutated by API)
    └── contacts[]   — appended by POST /api/contact
```

**Contact Record Schema**

```json
{
  "id":         1714200000000,
  "name":       "Ahmad Raza",
  "email":      "ahmad@example.com",
  "message":    "I'd love to discuss a potential collaboration.",
  "receivedAt": "2026-04-27T10:30:00.000Z"
}
```

| Field        | Type     | Description                     |
|--------------|----------|---------------------------------|
| `id`         | `number` | `Date.now()` at submission time |
| `name`       | `string` | Trimmed sender name             |
| `email`      | `string` | Trimmed, lowercased email       |
| `message`    | `string` | Trimmed message body            |
| `receivedAt` | `string` | ISO-8601 UTC timestamp          |

---

## Getting Started

```bash
# 1. Navigate to the server directory
cd server

# 2. Install the single runtime dependency (Express)
npm install

# 3a. Production start
npm start

# 3b. Development (auto-restarts on file change — Node 18+)
npm run dev
```

The API will be available at `http://localhost:3001`.

**Test with curl:**

```bash
# Retrieve all projects
curl http://localhost:3001/api/projects

# Submit a valid contact message
curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Ahmad Raza","email":"ahmad@example.com","message":"Hello, let us build something together."}'

# Trigger the Blood-Brain Barrier (missing email, short message)
curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"A","message":"Hi"}'
```

---

## Docker Deployment — Hugging Face Spaces

The API ships as a Docker image to [Hugging Face Spaces](https://huggingface.co/spaces) (Docker SDK).

### Production URL

```
https://<username>-portfolio-api.hf.space
```

Update `API_BASE` in `assets/js/main.js` once the Space is live:

```javascript
// assets/js/main.js — Section 5
const API_BASE = 'https://shabichem-decodelabs-portfolio-api.hf.space';
```

### Build & Run Locally

```bash
# Build the image
docker build -t portfolio-api ./server

# Run locally on port 7860
docker run -p 7860:7860 portfolio-api

# Verify health
curl http://localhost:7860/api/projects
```

### Dockerfile Summary

| Concern         | Detail                                                  |
|-----------------|---------------------------------------------------------|
| Base image      | `node:18-slim` — minimal Debian, good glibc compat      |
| Port            | `7860` — HF Spaces reverse proxy requirement            |
| Security        | Runs as non-root `node` user (uid 1000)                 |
| Layer caching   | `package.json` copied first; `npm install` cached until deps change |
| Write perms     | `--chown=node:node` on all `COPY` — required for `data.json` writes |
| Health check    | `GET /api/projects` via built-in Node `http` module (no curl/wget) |
| Shutdown        | Exec-form `CMD` — Node is PID 1, receives SIGTERM directly |

### Ephemeral Storage Note

`data.json` writes are **not persistent** on Hugging Face Spaces — the container filesystem resets on every rebuild/restart. For durable contact submissions, replace `fs.writeFileSync` in `routes/contact.js` with an external database (Supabase, MongoDB Atlas, etc.).

---

## Project Structure

```
server/
├── server.js                   — Entry point: middleware, routes, error handling
├── package.json                — Dependencies and npm scripts
├── data.json                   — Temporal Lobe: projects + contacts
├── blueprint.md                — This document
├── Dockerfile                  — Production image for Hugging Face Spaces
├── .dockerignore               — Excludes node_modules, .git, *.md from build context
├── routes/
│   ├── projects.js             — GET  /api/projects
│   └── contact.js              — POST /api/contact
└── middleware/
    └── validateContact.js      — Blood-Brain Barrier (3-layer validation)
```
