# GitHub Copilot Custom Instructions for Origins

This repository is a full‑stack Next.js app with:
- Next.js App Router (React + TypeScript)
- Tailwind CSS & PostCSS
- Supabase for auth, database, storage
- GitHub OAuth for login & session management
- Model Context Protocol (MCP) endpoints for AI features

When generating code:
- Follow existing component patterns in `src/components` (Button, Card, Dialog, etc.).
- Use React functional components, 2xl rounded corners, and Tailwind utility classes.
- Enforce strict TS types and adhere to linting rules in `eslint.config.mjs`.
- For DB calls, use the Supabase client in `src/lib/supabase.ts` and respect the schema (`campaigns`, `posts`, `characters`, `usage_meter`).
- Create API routes under `app/api` with Next.js App Router conventions; handle auth via GitHub OAuth or Supabase.
- Ensure code passes formatting (ESLint & Prettier).
- Write Vitest unit tests; mock Supabase/MCP clients.
- Keep suggestions concise and self‑contained.

**Domain context:**  
Unleash the full potential of AI with our cutting-edge development platform! Create, experiment, and launch AI-powered applications in record time with our supercharged tech stack built for innovation.


