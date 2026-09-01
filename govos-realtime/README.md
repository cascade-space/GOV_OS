# govos-realtime — NestJS Realtime Service

**GovOS Multi-Tenant Civic Governance Platform**
*Prajna Labs × Cascade Technologies Solutions*

---

## Overview

The Realtime Service is the real-time nervous system of GovOS. It manages WebSocket connections for the Web OS shell, consumes Redis events from the Core API, and delivers multi-channel notifications (SMS, Email, WhatsApp, Push, In-App).

**Tech Stack:** TypeScript · NestJS 10 · Socket.IO 4 · Redis · PostgreSQL · MSG91 · SendGrid · Twilio · FCM

---

## Module Structure

```
src/modules/
├── auth/          ← JWT validation, WS guard
├── gateway/       ← Socket.IO gateway, room management
├── notifications/ ← Multi-channel delivery
│   └── channels/  ← SMS, Email, WhatsApp, Push providers
└── health/        ← Health check endpoint
```

## Quick Start

```bash
cp .env.example .env
# Edit .env with local credentials

npm install
npm run start:dev
# Service at http://localhost:3001
```

## Testing

```bash
npm run test        # Unit tests (Jest)
npm run test:cov    # Coverage
npm run test:e2e    # E2E tests
```

## WebSocket Events

Connect to: `ws://localhost:3001/events`

After connection, emit `join:tenant`, `join:user`, `join:ward` to subscribe to relevant event streams.

---

## AntiGravity IDE
- Active Agent: **RealtimeEngineer**
- Rules file: `.rules` (in this directory)
- Read `.rules` before any code generation task
