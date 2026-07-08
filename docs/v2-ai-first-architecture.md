# HOMY AI Factory CRM V2 Architecture

## Scope

V2 upgrades HOMY AI Sales CRM from a sales CRM into an AI First CRM + ERP + BI platform. The current Next.js app keeps the usable dashboard, customer, quotation, file, reminder, script, and settings modules, then adds V2 product surfaces for:

- Customer 360
- AI Customer Analysis
- Sales Pipeline
- Inquiry Management
- Order Lifecycle
- Production Management
- After Sales
- Boss Dashboard
- World Map
- Workflow Builder
- AI Sales Assistant
- Knowledge Base
- PWA entry points

## Target Backend

Recommended backend stack:

- NestJS for modular REST APIs and Swagger documentation
- Prisma ORM for typed PostgreSQL access
- PostgreSQL for operational data and audit logs
- Redis + BullMQ for workflow, reminders, document generation, and AI jobs
- MinIO for S3-compatible storage of PDF, image, video, CAD, Excel, PI, invoice, and contract files
- JWT + Refresh Token authentication
- RBAC guards for menu, page, button, and data permissions

## Backend Modules

- `auth`: login, refresh token, password update, profile, avatar
- `rbac`: roles, permissions, menu/page/button/data policies
- `customers`: customer profile, contacts, lifecycle, ownership
- `inquiries`: inquiry files, budget, competitors, AI recommendation metadata
- `quotations`: cost model, versions, approval, PDF, Excel, PI, invoice generation
- `orders`: quotation to PI, contract, production, packing, shipment, invoice, payment, after sales
- `production`: foaming, curing, cutting, punching, CNC cutting, packaging, shipping
- `after-sales`: complaints, quality issues, returns, compensation, satisfaction
- `files`: storage, versioning, preview, full-text search metadata
- `workflows`: triggers, conditions, actions, schedules, escalation, AI analysis jobs
- `ai`: scoring, summaries, strategy suggestions, chat, RAG retrieval hooks
- `bi`: sales, profit, customer growth, country, product, salesperson, conversion, repeat rate
- `integrations`: website inquiry, WhatsApp, email, ERP, MES, finance, Google Sheets, webhooks

## API Contract Pattern

All APIs should return one standard response shape:

```ts
type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  requestId: string;
};
```

## AI Extension Points

V2 UI currently reserves these integration points without implementing AI logic:

- `ai.customer.score`
- `ai.customer.summary`
- `ai.customer.strategy`
- `ai.quote.costing`
- `ai.inquiry.vision`
- `ai.chat.reply`
- `ai.workflow.reason`
- `rag.knowledge.retrieve`

## Deployment

Recommended production deployment:

- Ubuntu Server
- Docker Compose
- Nginx reverse proxy
- Next.js frontend container
- NestJS API container
- PostgreSQL container or managed PostgreSQL
- Redis container
- MinIO container
- Background worker container for BullMQ jobs

## Migration Path

1. Keep the current Next.js app as the frontend.
2. Introduce NestJS APIs behind `/api/v2` or a separate API domain.
3. Replace the current typed V2 product-surface data in `data/ai-crm.ts` with TanStack Query hooks backed by production APIs.
4. Move file upload from Supabase Storage to MinIO signed URLs when the NestJS backend is introduced.
5. Add Prisma schema for V2 entities and generate typed DTOs.
6. Add RBAC guards before enabling menu/page/button permission editing.
7. Enable BullMQ workflow execution and document generation jobs.
8. Connect AI providers only after audit logs, permissions, and data boundaries are stable.
