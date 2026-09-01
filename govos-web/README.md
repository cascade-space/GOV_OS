# govos-web — React 18 TypeScript Web OS Frontend

**GovOS Multi-Tenant Civic Governance Platform**
*Prajna Labs × Cascade Technologies Solutions*

---

## Overview

The Web OS frontend is a browser-based operating system for civic governance. It renders as a persistent OS shell with 11 feature modules, real-time WebSocket integration, interactive GIS maps, and a global AI governance assistant.

**Tech Stack:** React 18 · TypeScript · Vite 5 · Zustand · TanStack Query · Tailwind CSS · shadcn/ui · Framer Motion · react-leaflet · Recharts · Socket.IO

---

## Directory Structure

```
src/
├── router/         ← All route definitions
├── shell/          ← OS Shell (AppShell, Sidebar, TopBar, CommandPalette, NotificationTray)
├── features/       ← 11 feature modules
│   ├── auth/
│   ├── dashboard/
│   ├── complaints/
│   ├── citizens/
│   ├── assets/
│   ├── projects/
│   ├── documents/
│   ├── officers/
│   ├── analytics/
│   ├── notifications/
│   └── admin/
├── store/          ← Zustand store slices
├── lib/            ← api.ts, socket.ts, query-client.ts
├── components/     ← Shared UI components
└── types/          ← Global TypeScript types
```

## Quick Start

```bash
cp .env.example .env.local
# Edit .env.local:
# VITE_API_URL=http://localhost/api
# VITE_WS_URL=http://localhost

npm install
npm run dev
# Frontend at http://localhost:5173
```

## Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run type-check   # TypeScript type check
npm run lint         # ESLint
npm run test         # Vitest unit tests
npm run test:coverage # Coverage report
```

## Feature Module Template

Every feature follows this exact structure:
```
src/features/{name}/
├── components/       ← UI components (List, Detail, Form, Skeleton)
├── hooks/            ← useQuery, useMutation, useRealtime
├── api/              ← Axios API functions
├── types.ts          ← TypeScript + Zod schemas
└── index.tsx         ← Module entry point
```

---

## AntiGravity IDE
- Active Agent: **WebOSFrontend**
- Rules file: `.rules` (in this directory)
- Read `.rules` before any code generation task
