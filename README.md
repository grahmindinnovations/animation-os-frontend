# Animation OS Frontend

SaaS web application for the Animation Operating System.

## Stack

React, Vite, TypeScript, Tailwind CSS, React Router, TanStack Query, Zustand, Axios, shadcn-style UI components.

## Local development (single machine)

```bash
cp .env.example .env
npm install
npm run dev
```

App: http://localhost:5173

Ensure the backend API is running at `http://localhost:8000`.

## Structure

```
src/
  app/           # router, providers
  components/    # shared UI, layout, common
  features/      # auth, dashboard, projects, settings
  layouts/       # auth and dashboard shells
  lib/           # api client, utils
  stores/        # zustand state
  types/         # shared TypeScript types
```

Sprint 1: authentication UI, project management, dashboard. AI features planned for later sprints.
