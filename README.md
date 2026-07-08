# HOMY AI Sales CRM V1.0

Modern Web CRM for HOMY sponge factory sales teams. Built with Next.js 15 App Router, TypeScript, Tailwind CSS, shadcn/ui-style components, React Hook Form, Zod, TanStack Table, Supabase Auth, PostgreSQL, and Supabase Storage.

## Features

- Email/password login, password reset, avatar/profile fields, and role-based access.
- Roles: `Admin`, `Boss`, `Manager`, `Sales`, `Finance`, `Production`, `Warehouse`, `Logistics`, and `Customer Service`.
- Sales users only see their own customers through app logic and Supabase RLS.
- Dashboard cards, sales funnel, reminders, and recent activity feed.
- Customer table with search, sorting, pagination, create/edit/delete, detail pages, contacts, follow-up timeline, quotations, and attachments.
- Drag-and-drop Kanban pipeline: 新询盘, 已联系, 已报价, 样品中, 谈判中, 已成交.
- Quotation creation with item rows, automatic totals, copy action, and PDF export route.
- Product management with category/spec/density/size/price/stock/image/PDF fields.
- Chinese/Indonesian sales template library with 15 starter scripts, search, category filter, copy, and favorite.
- File center for PDF/image/video uploads through Supabase Storage.
- Reminder system and analytics charts.
- Company settings page.
- Dark mode and i18n route structure for `zh`, `en`, and `id`.
- V2 AI extension placeholder in `lib/ai.ts`.

## Project Structure

```text
app/                    Next.js App Router pages and API routes
components/             App shell, CRM modules, and shadcn/ui components
config/                 Navigation, CRM constants, stages, roles
data/                   Server queries and typed product-surface data
hooks/                  Shared client hooks
lib/                    Auth, Supabase, permissions, validation, utilities
supabase/schema.sql     PostgreSQL schema, RLS, triggers, storage policies
supabase/seed.sql       Example HOMY seed data
supabase/script_templates.sql
                        Expanded bilingual sales script templates
types/                  CRM and database TypeScript types
```

## Local Development

1. Install dependencies:

```bash
pnpm install
```

2. Create env file:

```bash
cp .env.example .env.local
```

3. Fill in Supabase values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SECRET_KEY=your-secret-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_LOCALE=zh
NEXT_PUBLIC_AI_FEATURES_ENABLED=false
```

4. Run the app:

```bash
pnpm dev
```

Open `http://localhost:3000/zh/dashboard`.

Supabase env values are required for production use. Without Supabase configuration, authentication and write operations fail explicitly instead of falling back to preview data.

Before sign-in, verify production configuration:

```bash
pnpm env:check
```

## Supabase Setup

1. Create a Supabase project.
2. Open SQL Editor and run `supabase/schema.sql`.
3. Run `supabase/seed.sql` for sample HOMY data.
4. Run `supabase/script_templates.sql` to install the expanded sales template pack.
5. In Authentication settings, enable email/password auth.
6. Create the first Admin user with the service role key:

```bash
pnpm admin:create admin@homyfoam.co.id Homy@2026CRM! "HOMY Admin"
```

7. Alternatively, create your first user from Supabase Auth UI or the app login flow.
8. Promote your owner account to Admin if you created it manually:

```sql
update public.users
set role_id = (select id from public.roles where code = 'admin')
where email = 'your-email@example.com';
```

9. Assign existing seed customers to a sales user if desired:

```sql
update public.customers
set owner_id = (select id from public.users where email = 'sales@example.com')
where owner_id is null;
```

## Permission Model

- `Admin`: full data access and settings management.
- `Boss`: executive access for dashboards, settings, and company-wide data.
- `Manager`: all customer, sales, product, quote, script, file, reminder, and analytics access.
- `Sales`: only customers they own and records connected to those customers.
- `Finance`, `Production`, `Warehouse`, `Logistics`, and `Customer Service`: reserved RBAC roles for the V2 factory workflow modules.

Permissions are enforced in two layers:

- App layer: `lib/permissions.ts` and server-side query filters.
- Database layer: Row Level Security policies in `supabase/schema.sql`.

## Deployment To Vercel

1. Push this project to GitHub.
2. Import the repository in Vercel.
3. Add the same env variables from `.env.example`.
4. Set `NEXT_PUBLIC_APP_URL` to your production domain.
5. Deploy.

The app is designed for Vercel serverless API routes. Quotation PDF export is generated from `app/api/quotations/[id]/pdf/route.ts`.

## V2 AI Extension Notes

The app now includes V2 product surfaces for Customer 360, AI Customer Analysis, Sales Pipeline, Inquiry Management, Order Lifecycle, Production, After Sales, Boss Dashboard, World Map, Workflow Builder, AI Sales Assistant, Knowledge Base, and PWA manifest support.

## OpenRouter AI Setup

The AI Sales Assistant supports OpenRouter through its OpenAI-compatible chat completions API.

```env
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=sk-or-v1-your-key
OPENROUTER_MODEL=openai/gpt-4o-mini
OPENROUTER_SITE_URL=https://your-domain.com
OPENROUTER_APP_NAME=HOMY AI Sales CRM
NEXT_PUBLIC_AI_FEATURES_ENABLED=true
```

If `AI_PROVIDER` is not `openrouter` or `OPENROUTER_API_KEY` is empty, the assistant uses the built-in rules engine fallback.

The backend migration target is documented in [docs/v2-ai-first-architecture.md](docs/v2-ai-first-architecture.md), including NestJS, Prisma, PostgreSQL, Redis, BullMQ, MinIO, RBAC, Swagger, Docker Compose, and Nginx guidance.

V2 UI still keeps AI logic behind reserved extension points:

- `lib/ai.ts`
- `config/crm.ts`
- `data/ai-crm.ts`

Planned integrations can be added behind these hooks: AI script generation, AI customer analysis, WhatsApp API, and intelligent quote recommendations.
