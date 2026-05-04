-- ============================================================
-- THE BLUEPRINT — init-db.sql
-- ============================================================
-- Run once against your Neon database to create the schema
-- and seed the initial project records.
--
-- Idempotent: all statements use IF NOT EXISTS / ON CONFLICT
-- so re-running this file is always safe.
--
-- How to run (from server/ directory):
--   psql $DATABASE_URL -f init-db.sql
-- ============================================================


-- ── PILLAR 1A: projects table ─────────────────────────────────────────────────
--
-- Stores portfolio project cards. The API aliases image_url → image,
-- project_url → url, and image_alt → "imageAlt" to match the frontend
-- field contract expected by main.js buildCardHTML().

CREATE TABLE IF NOT EXISTS projects (
  id          SERIAL      PRIMARY KEY,
  title       TEXT        NOT NULL,
  tag         TEXT        NOT NULL,
  excerpt     TEXT,
  image_url   TEXT        NOT NULL,
  image_alt   TEXT,
  project_url TEXT
);


-- ── PILLAR 1B: contacts table ─────────────────────────────────────────────────
--
-- Stores validated contact form submissions.
-- CHECK on message enforces the same 10-char minimum as the
-- Blood-Brain Barrier (validateContact.js) at the database layer too —
-- defence in depth.

CREATE TABLE IF NOT EXISTS contacts (
  id         SERIAL      PRIMARY KEY,
  name       TEXT        NOT NULL,
  email      TEXT        NOT NULL,
  message    TEXT        NOT NULL CHECK (LENGTH(message) > 10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ── SEED: initial project records ─────────────────────────────────────────────
--
-- Migrated from data.json. ON CONFLICT (id) DO NOTHING makes this
-- idempotent — safe to re-run without duplicating rows.

INSERT INTO projects (id, title, tag, excerpt, image_url, image_alt, project_url) VALUES
(
  1,
  'E-Commerce Full-Stack Store',
  'Next.js',
  'Pixel-perfect UI/UX focused dynamic store built with Next.js App Router, featuring server components and optimised data fetching.',
  'assets/images/projects/ecommerce-store.jpg',
  'A modern e-commerce storefront with product grid, clean typography, and a warm neutral colour palette',
  'https://hackathontemplate9.vercel.app/'
),
(
  2,
  'Physical AI Interactive Textbook',
  'Agentic AI',
  'AI-powered interactive book with a RAG-chatbot (Gemini) and real-time Urdu translation support for multilingual learners.',
  'assets/images/projects/ai-textbook.jpg',
  'An AI-powered interactive digital textbook with a bilingual chat panel',
  'https://humanoid-robotics-course-book.vercel.app/'
),
(
  3,
  'TaskFlow AI Chatbot',
  'Full Stack PWA',
  'Full-stack PWA task manager with natural-language commands, Recharts analytics dashboard, and offline-first architecture.',
  'assets/images/projects/taskflow-chatbot.jpg',
  'A full-stack task management dashboard with analytics charts and an AI command bar',
  'https://todo-ai-chatbot-phase3.vercel.app/signup'
),
(
  4,
  'ATS Resume Builder',
  'TypeScript',
  'High-performance TypeScript-based generator for professional resume architecture, optimised for applicant tracking systems.',
  'assets/images/projects/ats-resume-builder.jpg',
  'A professional resume builder with template selection and live ATS-score preview',
  'https://resume-builder-sage-tau.vercel.app/'
)
ON CONFLICT (id) DO NOTHING;

-- Reset the sequence so the next INSERT auto-increments from 5 onward
SELECT setval('projects_id_seq', COALESCE((SELECT MAX(id) FROM projects), 1));
