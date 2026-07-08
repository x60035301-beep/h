-- HOMY AI Sales CRM V1.0 sample data.
-- Safe to run after schema.sql. Customers are inserted without owner_id so Admin/Manager can assign them after users are created.

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
  address = excluded.address;

insert into public.product_categories (id, name, description)
values
  ('aa111111-1111-4111-8111-111111111111', 'Sofa Foam', 'Foam products for sofas and cushions'),
  ('aa222222-2222-4222-8222-222222222222', 'Mattress Foam', 'Foam sheets for mattresses and bedding'),
  ('aa333333-3333-4333-8333-333333333333', 'Industrial Foam', 'Packaging, acoustic, and industrial foam')
on conflict (id) do update set name = excluded.name, description = excluded.description;

insert into public.products (id, category_id, name, specification, density, size, price, stock)
values
  ('99111111-1111-4111-8111-111111111111', 'aa111111-1111-4111-8111-111111111111', '30D High Resilience Foam', 'HR foam, medium firm', '30D', '200 x 100 x 10 cm', 21.70, 1200),
  ('99222222-2222-4222-8222-222222222222', 'aa222222-2222-4222-8222-222222222222', 'Memory Foam Sheet', 'Slow rebound mattress layer', '45D', '200 x 160 x 5 cm', 39.00, 320),
  ('99333333-3333-4333-8333-333333333333', 'aa333333-3333-4333-8333-333333333333', 'Acoustic Sponge Panel', 'Wave profile acoustic sponge', '25D', '50 x 50 x 5 cm', 3.80, null)
on conflict (id) do update set
  category_id = excluded.category_id,
  name = excluded.name,
  specification = excluded.specification,
  density = excluded.density,
  size = excluded.size,
  price = excluded.price,
  stock = excluded.stock;

insert into public.customers (id, company_name, contact_name, country, industry, company_type, whatsapp, email, source, grade, stage, notes, last_contacted_at, created_at)
values
  ('11111111-1111-4111-8111-111111111111', 'PT Comfort Living Indonesia', 'Budi Santoso', 'Indonesia', 'Furniture', 'manufacturer', '+62 812 8800 1020', 'budi@comfortliving.id', 'WhatsApp', 'A', 'quoted', 'Needs 30D HR foam for sofa cushions.', '2026-07-04 08:30:00+00', '2026-06-24 08:20:00+00'),
  ('22222222-2222-4222-8222-222222222222', 'SleepWell Trading Co.', 'Maria Tan', 'Singapore', 'Mattress Importer', 'trader', '+65 9000 2211', 'maria@sleepwell.sg', 'Alibaba', 'B', 'sampling', 'Sample order for memory foam.', '2026-07-03 11:10:00+00', '2026-06-26 06:30:00+00'),
  ('33333333-3333-4333-8333-333333333333', 'Hanoi Sofa Works', 'Nguyen Anh', 'Vietnam', 'Sofa Factory', 'manufacturer', '+84 91 330 8822', 'anh@hanoisofa.vn', 'Exhibition', 'A', 'negotiation', 'Negotiating annual supply contract.', '2026-07-02 09:15:00+00', '2026-06-18 03:10:00+00'),
  ('44444444-4444-4444-8444-444444444444', 'Jakarta Cushion Studio', 'Siti Rahma', 'Indonesia', 'Custom Cushion', 'retailer', '+62 877 0011 9922', 'siti@jcs.id', 'Website', 'C', 'contacted', 'Small batch custom cushions.', '2026-07-01 10:00:00+00', '2026-07-01 05:00:00+00'),
  ('55555555-5555-4555-8555-555555555555', 'Bali Resort Supply', 'Agus Wijaya', 'Indonesia', 'Hospitality', 'brand', '+62 811 5500 7788', 'agus@baliresortsupply.co.id', 'Referral', 'A', 'won', 'Closed resort cushion replacement order.', '2026-07-04 03:20:00+00', '2026-06-08 02:00:00+00')
on conflict (id) do update set
  company_name = excluded.company_name,
  contact_name = excluded.contact_name,
  country = excluded.country,
  industry = excluded.industry,
  company_type = excluded.company_type,
  whatsapp = excluded.whatsapp,
  email = excluded.email,
  source = excluded.source,
  grade = excluded.grade,
  stage = excluded.stage,
  notes = excluded.notes,
  last_contacted_at = excluded.last_contacted_at;

insert into public.contacts (customer_id, name, title, email, whatsapp, is_primary)
select id, contact_name, 'Purchasing Manager', email, whatsapp, true
from public.customers
where id in (
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333',
  '44444444-4444-4444-8444-444444444444',
  '55555555-5555-4555-8555-555555555555'
)
on conflict do nothing;

insert into public.followups (id, customer_id, method, followed_at, content, next_step)
values
  ('66111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', 'whatsapp', '2026-07-04 08:30:00+00', '客户确认需要 30D 高回弹海绵，用于沙发坐垫，要求 7 天内出样。', '发送正式报价单和样品寄送方案。'),
  ('66222222-2222-4222-8222-222222222222', '11111111-1111-4111-8111-111111111111', 'email', '2026-07-02 09:45:00+00', '已发送产品参数 PDF，客户询问 MOQ 和装柜数量。', '补充 20GP/40HQ 装柜建议。')
on conflict (id) do update set content = excluded.content, next_step = excluded.next_step;

insert into public.quotations (id, quotation_no, customer_id, status, currency, total_amount, notes, valid_until, created_at)
values
  ('77111111-1111-4111-8111-111111111111', 'HOMY-20260704-A18K2', '11111111-1111-4111-8111-111111111111', 'sent', 'USD', 12850.00, 'FOB Surabaya, valid for 14 days.', '2026-07-18', '2026-07-04 09:00:00+00'),
  ('77222222-2222-4222-8222-222222222222', 'HOMY-20260703-SMPL1', '22222222-2222-4222-8222-222222222222', 'draft', 'USD', 620.00, 'Sample order quotation.', '2026-07-17', '2026-07-03 10:30:00+00')
on conflict (id) do update set
  quotation_no = excluded.quotation_no,
  status = excluded.status,
  total_amount = excluded.total_amount,
  notes = excluded.notes,
  valid_until = excluded.valid_until;

insert into public.quotation_items (id, quotation_id, product_id, product_name, quantity, unit_price, amount, notes)
values
  ('88111111-1111-4111-8111-111111111111', '77111111-1111-4111-8111-111111111111', '99111111-1111-4111-8111-111111111111', '30D High Resilience Foam', 500, 21.70, 10850.00, '200 x 100 x 10 cm'),
  ('88222222-2222-4222-8222-222222222222', '77111111-1111-4111-8111-111111111111', '99222222-2222-4222-8222-222222222222', 'Memory Foam Sheet', 100, 20.00, 2000.00, 'Trial quantity')
on conflict (id) do update set quantity = excluded.quantity, unit_price = excluded.unit_price, amount = excluded.amount;

insert into public.script_categories (id, name)
values
  ('cc111111-1111-4111-8111-111111111111', '首次开发'),
  ('cc222222-2222-4222-8222-222222222222', '报价跟进'),
  ('cc333333-3333-4333-8333-333333333333', '催单'),
  ('cc444444-4444-4444-8444-444444444444', '客户维护'),
  ('cc555555-5555-4555-8555-555555555555', '价格异议')
on conflict (id) do update set name = excluded.name;

insert into public.scripts (id, category_id, title, content_zh, content_id, tags)
values
  ('bb111111-1111-4111-8111-111111111111', 'cc111111-1111-4111-8111-111111111111', '首次开发 - 海绵工厂介绍', '您好，我们是印尼 HOMY 海绵工厂，主要生产沙发、床垫、包装和工业用途海绵。请问您目前采购哪一类海绵？我可以先发规格和价格范围给您参考。', 'Halo, kami HOMY, pabrik spons di Indonesia. Kami memproduksi spons untuk sofa, kasur, kemasan, dan industri. Boleh tahu jenis spons apa yang sedang Anda cari?', array['首次联系','工厂介绍','WhatsApp']),
  ('bb222222-2222-4222-8222-222222222222', 'cc555555-5555-4555-8555-555555555555', '价格异议 - 强调稳定供货', '理解您在比较价格。我们的报价包含稳定密度、准时交付和售后支持，适合长期批量采购。若您有目标价，我可以帮您调整规格或数量来匹配预算。', 'Saya paham Anda sedang membandingkan harga. Harga kami mencakup densitas stabil, pengiriman tepat waktu, dan dukungan purna jual. Jika ada target harga, kami bisa sesuaikan spesifikasi atau kuantitas.', array['价格','谈判']),
  ('bb333333-3333-4333-8333-333333333333', 'cc222222-2222-4222-8222-222222222222', '报价跟进 - 样品推进', '您好，昨天发您的报价和参数是否方便看过？如果规格方向合适，我们建议先安排样品，确认手感和密度后再进入批量订单。', 'Halo, apakah penawaran dan spesifikasi yang kami kirim kemarin sudah sempat dicek? Jika arahnya cocok, kami sarankan mulai dari sampel untuk konfirmasi feel dan densitas.', array['报价','样品'])
on conflict (id) do update set
  title = excluded.title,
  content_zh = excluded.content_zh,
  content_id = excluded.content_id,
  tags = excluded.tags;

insert into public.attachments (id, customer_id, file_name, file_type, file_url, size_bytes)
values
  ('dd111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', '30D-foam-spec.pdf', 'pdf', 'https://example.com/30d-foam-spec.pdf', 420000)
on conflict (id) do update set file_name = excluded.file_name, file_url = excluded.file_url;

insert into public.reminders (id, customer_id, title, type, due_at, is_done)
values
  ('ee111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', '跟进 Comfort Living 报价反馈', 'quotation', '2026-07-04 16:00:00+00', false),
  ('ee222222-2222-4222-8222-222222222222', '22222222-2222-4222-8222-222222222222', '确认样品寄送地址', 'sample', '2026-07-05 10:00:00+00', false)
on conflict (id) do update set title = excluded.title, due_at = excluded.due_at, is_done = excluded.is_done;

insert into public.activities (id, customer_id, type, title, description, created_at)
values
  ('ff111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', 'quotation_created', '新建报价', 'HOMY-20260704-A18K2 已发送给 PT Comfort Living Indonesia', '2026-07-04 09:00:00+00'),
  ('ff222222-2222-4222-8222-222222222222', '11111111-1111-4111-8111-111111111111', 'followup_created', '新增跟进记录', 'Budi 确认 30D 高回弹海绵需求', '2026-07-04 08:30:00+00'),
  ('ff333333-3333-4333-8333-333333333333', '33333333-3333-4333-8333-333333333333', 'stage_changed', '客户阶段更新', 'Hanoi Sofa Works 进入谈判中', '2026-07-03 15:40:00+00')
on conflict (id) do update set title = excluded.title, description = excluded.description;
