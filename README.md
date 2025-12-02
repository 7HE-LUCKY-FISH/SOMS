# SOMS

Sports Database — a fullstack project with a Next.js (TypeScript) frontend and a MySQL backend.

## Overview

This repository contains a fullstack web application for managing sports-related data. The frontend is built with Next.js + TypeScript and the backend is implemented in Python with MySQL as the database.

Frontend
- Next.js (next v16)
- React (v19)
- TypeScript
- Tailwind CSS (+ postcss)

Backend
- Python (language used for server code)
- MySQL (database)

## Folder structure 

- client/
  - The Next.js frontend application (TypeScript).
  - Contains pages/app components, styles, UI, and client-side logic.
  - package.json with scripts:
    - `dev` — run development server
    - `build` — build for production
    - `start` — run built app
    - `lint` — run ESLint
  - All UI dependencies and Tailwind configuration live here.

- server/
  - The backend API and database-related code (implemented in Python).
  - Expected contents: API routes/endpoints, models, database schema/migrations, and configuration (environment vars).
  - Look for requirements.txt, pyproject.toml, or similar files in this folder to see exactly which Python packages are used.
