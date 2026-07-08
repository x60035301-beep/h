-- HOMY AI Sales CRM clean initialization.
-- Run after schema.sql. This file does not create demo customers, products,
-- quotations, reminders, attachments, or activities.

insert into public.settings (id, company_name, phone, email, address)
values (
  '00000000-0000-4000-8000-000000000999',
  'HOMY Sponge Factory',
  '+62 31 555 9010',
  'sales@homyfoam.co.id',
  'Surabaya Industrial Area, East Java, Indonesia'
)
on conflict (id) do update set
  company_name = excluded.company_name,
  phone = excluded.phone,
  email = excluded.email,
  address = excluded.address,
  updated_at = now(),
  deleted_at = null;

-- Keep only neutral script categories so the sales team can add real scripts.
insert into public.script_categories (id, name)
values
  ('cc111111-1111-4111-8111-111111111111', '首次开发'),
  ('cc222222-2222-4222-8222-222222222222', '报价跟进'),
  ('cc333333-3333-4333-8333-333333333333', '催单'),
  ('cc444444-4444-4444-8444-444444444444', '客户维护'),
  ('cc555555-5555-4555-8555-555555555555', '价格异议')
on conflict (id) do update set
  name = excluded.name,
  updated_at = now(),
  deleted_at = null;

-- Clean known demo records from the earlier seed file if they exist.
update public.activities
set deleted_at = coalesce(deleted_at, now()), updated_at = now()
where id in (
  'ff111111-1111-4111-8111-111111111111',
  'ff222222-2222-4222-8222-222222222222',
  'ff333333-3333-4333-8333-333333333333'
);

update public.reminders
set deleted_at = coalesce(deleted_at, now()), updated_at = now()
where id in (
  'ee111111-1111-4111-8111-111111111111',
  'ee222222-2222-4222-8222-222222222222'
);

update public.attachments
set deleted_at = coalesce(deleted_at, now()), updated_at = now()
where id = 'dd111111-1111-4111-8111-111111111111';

update public.quotation_items
set deleted_at = coalesce(deleted_at, now()), updated_at = now()
where id in (
  '88111111-1111-4111-8111-111111111111',
  '88222222-2222-4222-8222-222222222222'
);

update public.quotations
set deleted_at = coalesce(deleted_at, now()), updated_at = now()
where id in (
  '77111111-1111-4111-8111-111111111111',
  '77222222-2222-4222-8222-222222222222'
);

update public.followups
set deleted_at = coalesce(deleted_at, now()), updated_at = now()
where id in (
  '66111111-1111-4111-8111-111111111111',
  '66222222-2222-4222-8222-222222222222'
);

update public.contacts
set deleted_at = coalesce(deleted_at, now()), updated_at = now()
where customer_id in (
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333',
  '44444444-4444-4444-8444-444444444444',
  '55555555-5555-4555-8555-555555555555'
);

update public.customers
set deleted_at = coalesce(deleted_at, now()), updated_at = now()
where id in (
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333',
  '44444444-4444-4444-8444-444444444444',
  '55555555-5555-4555-8555-555555555555'
);

update public.products
set deleted_at = coalesce(deleted_at, now()), updated_at = now()
where id in (
  '99111111-1111-4111-8111-111111111111',
  '99222222-2222-4222-8222-222222222222',
  '99333333-3333-4333-8333-333333333333'
);

update public.product_categories
set deleted_at = coalesce(deleted_at, now()), updated_at = now()
where id in (
  'aa111111-1111-4111-8111-111111111111',
  'aa222222-2222-4222-8222-222222222222',
  'aa333333-3333-4333-8333-333333333333'
);

update public.scripts
set deleted_at = coalesce(deleted_at, now()), updated_at = now()
where id in (
  'bb111111-1111-4111-8111-111111111111',
  'bb222222-2222-4222-8222-222222222222',
  'bb333333-3333-4333-8333-333333333333'
);
