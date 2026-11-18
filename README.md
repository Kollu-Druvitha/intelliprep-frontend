# IntelliPrep Frontend

The web application for IntelliPrep, an AI-powered interview preparation platform. It provides a dashboard for preparation activity and LeetCode statistics, plus dedicated tools for resume analysis, code review, mock interviews, and personalized learning roadmaps.

## Features

- Dashboard with solved-problem totals, difficulty breakdowns, and LeetCode profile statistics
- Resume and job-description matching with a match score and missing keywords
- AI mentor that reviews code for complexity, issues, and suggested improvements
- DSA, HR, and system-design mock interviews with answer-by-answer feedback
- Personalized study roadmap based on interview preparation data
- JWT-based login and bearer-token API authentication

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Fraunces, IBM Plex Sans, and IBM Plex Mono via `next/font`

## Prerequisites

- Node.js 20 or later
- npm
- The IntelliPrep backend running at `http://localhost:5000`

The backend and AI service are available from the parent IntelliPrep workspace.

## Local Setup

1. Install the frontend dependencies:

   ```bash
   npm install
   ```

2. Start the backend and AI service:

   ```bash
   # From the IntelliPrep workspace root
   docker compose up --build
   ```

   This exposes the backend at `http://localhost:5000` and the AI service at `http://localhost:8000`.

3. Start the frontend development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

The backend URL is currently configured as `http://localhost:5000` in `src/lib/api.ts` and is also used directly by the login and resume upload pages.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create an optimized production build |
| `npm run start` | Start the production build locally |
| `npm run lint` | Run ESLint |

## Application Routes

| Route | Description |
| --- | --- |
| `/login` | User authentication |
| `/dashboard` | Preparation summary, LeetCode statistics, and feature navigation |
| `/resume` | PDF resume analysis against a job description |
| `/mentor` | AI code review |
| `/mock-interview` | Interactive mock interviews |
| `/roadmap` | Personalized preparation roadmap |

Unauthenticated dashboard access redirects to `/login`. Access and refresh tokens are stored in browser `localStorage`.

## Project Structure

```text
src/
  app/
    dashboard/       Dashboard and LeetCode integration
    login/           Login page
    mentor/          Code review tool
    mock-interview/  Mock interview flow
    resume/          Resume PDF analyzer
    roadmap/         Personalized roadmap
    layout.tsx       Root layout and fonts
    globals.css      Tailwind theme and global styles
  components/
    Shell.tsx        Shared application navigation shell
  lib/
    api.ts           Backend URL and authenticated fetch helper
```

## Backend Integration

The frontend communicates with the IntelliPrep Express backend on port `5000`. Authenticated requests use the access token returned by login:

```http
Authorization: Bearer <accessToken>
```

For deployment outside the local environment, update the backend URL usage in `src/lib/api.ts`, `src/app/login/page.tsx`, and `src/app/resume/page.tsx`, or replace these values with an environment-variable-backed API configuration.
