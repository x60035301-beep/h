-- HOMY AI Sales CRM V1.0
-- Run this file in Supabase SQL Editor before importing seed.sql.

create extension if not exists "pgcrypto";

do $$
begin
  create type public.app_role as enum (
    'admin',
    'boss',
    'manager',
    'sales',
    'finance',
    'production',
    'warehouse',
    'logistics',
    'customer_service'
  );
exception when duplicate_object then null;
end $$;

alter type public.app_role add value if not exists 'boss';
alter type public.app_role add value if not exists 'finance';
alter type public.app_role add value if not exists 'production';
alter type public.app_role add value if not exists 'warehouse';
alter type public.app_role add value if not exists 'logistics';
alter type public.app_role add value if not exists 'customer_service';

do $$
begin
  create type public.customer_stage as enum ('new_inquiry', 'contacted', 'quoted', 'sampling', 'negotiation', 'won');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.customer_grade as enum ('A', 'B', 'C');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.company_type as enum ('manufacturer', 'trader', 'brand', 'retailer', 'other');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.communication_method as enum ('whatsapp', 'phone', 'email', 'meeting');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.quotation_status as enum ('draft', 'sent', 'accepted', 'rejected', 'expired');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.attachment_kind as enum ('pdf', 'image', 'video', 'other');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.reminder_type as enum ('followup', 'quotation', 'sample', 'expiry');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.activity_type as enum (
    'customer_created',
    'customer_updated',
    'followup_created',
    'quotation_created',
    'stage_changed',
    'attachment_uploaded',
    'task_created',
    'reminder_sent',
    'email_sent',
    'sales_assigned',
    'manager_escalated',
    'workflow_run'
  );
exception when duplicate_object then null;
end $$;

alter type public.activity_type add value if not exists 'task_created';
alter type public.activity_type add value if not exists 'reminder_sent';
alter type public.activity_type add value if not exists 'email_sent';
alter type public.activity_type add value if not exists 'sales_assigned';
alter type public.activity_type add value if not exists 'manager_escalated';
alter type public.activity_type add value if not exists 'workflow_run';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  code public.app_role not null unique,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  role_id uuid not null references public.roles(id),
  full_name text,
  avatar_url text,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.users(id) on delete set null,
  company_name text not null,
  contact_name text,
  country text,
  industry text,
  company_type public.company_type,
  whatsapp text,
  email text,
  source text,
  grade public.customer_grade not null default 'B',
  stage public.customer_stage not null default 'new_inquiry',
  notes text,
  last_contacted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  name text not null,
  title text,
  email text,
  whatsapp text,
  phone text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.followups (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  created_by uuid references public.users(id) on delete set null,
  method public.communication_method not null,
  followed_at timestamptz not null default now(),
  content text not null,
  next_step text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.product_categories(id) on delete set null,
  name text not null,
  specification text,
  density text,
  size text,
  price numeric(14,2) not null default 0,
  stock integer,
  image_url text,
  pdf_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.quotations (
  id uuid primary key default gen_random_uuid(),
  quotation_no text not null unique,
  customer_id uuid not null references public.customers(id) on delete cascade,
  created_by uuid references public.users(id) on delete set null,
  status public.quotation_status not null default 'draft',
  currency text not null default 'USD',
  total_amount numeric(14,2) not null default 0,
  notes text,
  valid_until date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.quotation_items (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references public.quotations(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity numeric(14,2) not null check (quantity > 0),
  unit_price numeric(14,2) not null check (unit_price >= 0),
  amount numeric(14,2) not null check (amount >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.script_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.scripts (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.script_categories(id) on delete set null,
  title text not null,
  content_zh text not null,
  content_id text not null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  uploaded_by uuid references public.users(id) on delete set null,
  file_name text not null,
  file_type public.attachment_kind not null default 'other',
  file_url text not null,
  storage_path text,
  size_bytes bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete cascade,
  assigned_to uuid references public.users(id) on delete set null,
  title text not null,
  type public.reminder_type not null,
  due_at timestamptz not null,
  is_done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.users(id) on delete set null,
  customer_id uuid references public.customers(id) on delete cascade,
  type public.activity_type not null,
  title text not null,
  description text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  logo_url text,
  company_name text not null default 'HOMY Sponge Factory',
  phone text,
  email text,
  address text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create or replace function public.current_app_role()
returns public.app_role
language sql
security definer
set search_path = public
stable
as $$
  select r.code
  from public.users u
  join public.roles r on r.id = u.role_id
  where u.id = auth.uid()
    and u.deleted_at is null
  limit 1;
$$;

create or replace function public.is_admin_or_manager()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(public.current_app_role() in ('admin', 'boss', 'manager'), false);
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(public.current_app_role() = 'admin', false);
$$;

create or replace function public.can_access_customer(customer_uuid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.customers c
    where c.id = customer_uuid
      and c.deleted_at is null
      and (public.is_admin_or_manager() or c.owner_id = auth.uid())
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  default_role_id uuid;
begin
  select id into default_role_id from public.roles where code = 'sales' limit 1;

  insert into public.users (id, role_id, full_name, avatar_url, email)
  values (
    new.id,
    default_role_id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.raw_user_meta_data ->> 'avatar_url',
    new.email
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'roles','users','customers','contacts','followups','product_categories','products',
    'quotations','quotation_items','script_categories','scripts','attachments','reminders','activities','settings'
  ]
  loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', table_name, table_name);
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name, table_name);
  end loop;
end $$;

create index if not exists idx_customers_owner on public.customers(owner_id) where deleted_at is null;
create index if not exists idx_customers_stage on public.customers(stage) where deleted_at is null;
create index if not exists idx_followups_customer on public.followups(customer_id) where deleted_at is null;
create index if not exists idx_quotations_customer on public.quotations(customer_id) where deleted_at is null;
create index if not exists idx_reminders_due on public.reminders(due_at) where deleted_at is null and is_done = false;
create index if not exists idx_activities_created on public.activities(created_at desc) where deleted_at is null;

alter table public.roles enable row level security;
alter table public.users enable row level security;
alter table public.customers enable row level security;
alter table public.contacts enable row level security;
alter table public.followups enable row level security;
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.quotations enable row level security;
alter table public.quotation_items enable row level security;
alter table public.script_categories enable row level security;
alter table public.scripts enable row level security;
alter table public.attachments enable row level security;
alter table public.reminders enable row level security;
alter table public.activities enable row level security;
alter table public.settings enable row level security;

drop policy if exists "roles readable" on public.roles;
create policy "roles readable" on public.roles for select to authenticated using (deleted_at is null);

drop policy if exists "users readable by self or leaders" on public.users;
create policy "users readable by self or leaders" on public.users for select to authenticated
using (id = auth.uid() or public.is_admin_or_manager());

drop policy if exists "users update self" on public.users;
create policy "users update self" on public.users for update to authenticated
using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

drop policy if exists "customers select by role" on public.customers;
create policy "customers select by role" on public.customers for select to authenticated
using (deleted_at is null and (public.is_admin_or_manager() or owner_id = auth.uid()));

drop policy if exists "customers insert own" on public.customers;
create policy "customers insert own" on public.customers for insert to authenticated
with check (public.is_admin_or_manager() or owner_id = auth.uid());

drop policy if exists "customers update by role" on public.customers;
create policy "customers update by role" on public.customers for update to authenticated
using (public.is_admin_or_manager() or owner_id = auth.uid())
with check (public.is_admin_or_manager() or owner_id = auth.uid());

drop policy if exists "contacts customer access" on public.contacts;
create policy "contacts customer access" on public.contacts for all to authenticated
using (public.can_access_customer(customer_id))
with check (public.can_access_customer(customer_id));

drop policy if exists "followups customer access" on public.followups;
create policy "followups customer access" on public.followups for all to authenticated
using (public.can_access_customer(customer_id))
with check (public.can_access_customer(customer_id));

drop policy if exists "quotations customer access" on public.quotations;
create policy "quotations customer access" on public.quotations for all to authenticated
using (public.can_access_customer(customer_id))
with check (public.can_access_customer(customer_id));

drop policy if exists "quotation items via quotation" on public.quotation_items;
create policy "quotation items via quotation" on public.quotation_items for all to authenticated
using (
  exists (
    select 1 from public.quotations q
    where q.id = quotation_id and public.can_access_customer(q.customer_id)
  )
)
with check (
  exists (
    select 1 from public.quotations q
    where q.id = quotation_id and public.can_access_customer(q.customer_id)
  )
);

drop policy if exists "products readable" on public.products;
create policy "products readable" on public.products for select to authenticated using (deleted_at is null);
drop policy if exists "products write leaders" on public.products;
create policy "products write leaders" on public.products for all to authenticated
using (public.is_admin_or_manager()) with check (public.is_admin_or_manager());

drop policy if exists "product categories readable" on public.product_categories;
create policy "product categories readable" on public.product_categories for select to authenticated using (deleted_at is null);
drop policy if exists "product categories write leaders" on public.product_categories;
create policy "product categories write leaders" on public.product_categories for all to authenticated
using (public.is_admin_or_manager()) with check (public.is_admin_or_manager());

drop policy if exists "scripts readable" on public.scripts;
create policy "scripts readable" on public.scripts for select to authenticated using (deleted_at is null);
drop policy if exists "scripts write leaders" on public.scripts;
create policy "scripts write leaders" on public.scripts for all to authenticated
using (public.is_admin_or_manager()) with check (public.is_admin_or_manager());

drop policy if exists "script categories readable" on public.script_categories;
create policy "script categories readable" on public.script_categories for select to authenticated using (deleted_at is null);
drop policy if exists "script categories write leaders" on public.script_categories;
create policy "script categories write leaders" on public.script_categories for all to authenticated
using (public.is_admin_or_manager()) with check (public.is_admin_or_manager());

drop policy if exists "attachments access" on public.attachments;
create policy "attachments access" on public.attachments for all to authenticated
using (
  customer_id is null
  or public.can_access_customer(customer_id)
  or public.is_admin_or_manager()
)
with check (
  customer_id is null
  or public.can_access_customer(customer_id)
  or public.is_admin_or_manager()
);

drop policy if exists "reminders access" on public.reminders;
create policy "reminders access" on public.reminders for all to authenticated
using (public.is_admin_or_manager() or assigned_to = auth.uid() or (customer_id is not null and public.can_access_customer(customer_id)))
with check (public.is_admin_or_manager() or assigned_to = auth.uid() or (customer_id is not null and public.can_access_customer(customer_id)));

drop policy if exists "activities access" on public.activities;
create policy "activities access" on public.activities for all to authenticated
using (public.is_admin_or_manager() or customer_id is null or public.can_access_customer(customer_id))
with check (public.is_admin_or_manager() or customer_id is null or public.can_access_customer(customer_id));

drop policy if exists "settings readable" on public.settings;
create policy "settings readable" on public.settings for select to authenticated using (deleted_at is null);
drop policy if exists "settings admin write" on public.settings;
create policy "settings admin write" on public.settings for all to authenticated
using (public.current_app_role() in ('admin', 'boss')) with check (public.current_app_role() in ('admin', 'boss'));

insert into public.roles (code, name, description)
values
  ('admin', 'Admin', 'Full access to all data and system settings'),
  ('boss', 'Boss', 'Executive cockpit and all-company visibility'),
  ('manager', 'Manager', 'Team sales and reporting access'),
  ('sales', 'Sales', 'Access to owned customers and sales workflows'),
  ('finance', 'Finance', 'Invoices, payments, and receivable data'),
  ('production', 'Production', 'Production plans and work order progress'),
  ('warehouse', 'Warehouse', 'Inventory, packing, and outbound preparation'),
  ('logistics', 'Logistics', 'Shipment, documents, and delivery tracking'),
  ('customer_service', 'Customer Service', 'After sales cases and satisfaction follow-up')
on conflict (code) do update set name = excluded.name, description = excluded.description;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'attachments',
  'attachments',
  true,
  104857600,
  array['application/pdf','image/png','image/jpeg','image/webp','video/mp4','video/quicktime']
)
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "authenticated can read attachments bucket" on storage.objects;
create policy "authenticated can read attachments bucket" on storage.objects for select to authenticated
using (bucket_id = 'attachments');

drop policy if exists "authenticated can upload attachments bucket" on storage.objects;
create policy "authenticated can upload attachments bucket" on storage.objects for insert to authenticated
with check (bucket_id = 'attachments');

drop policy if exists "authenticated can update own attachments bucket" on storage.objects;
create policy "authenticated can update own attachments bucket" on storage.objects for update to authenticated
using (bucket_id = 'attachments' and owner = auth.uid());
