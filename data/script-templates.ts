import type { Script } from "@/types/crm";

export const scriptCategoryFixtures = [
  { id: "cc111111-1111-4111-8111-111111111111", name: "首次开发" },
  { id: "cc222222-2222-4222-8222-222222222222", name: "报价跟进" },
  { id: "cc333333-3333-4333-8333-333333333333", name: "催单" },
  { id: "cc444444-4444-4444-8444-444444444444", name: "客户维护" },
  { id: "cc555555-5555-4555-8555-555555555555", name: "价格异议" }
] as const;

export const salesScriptTemplates: Script[] = [
  {
    id: "bb111111-1111-4111-8111-111111111111",
    title: "首次开发 - 工厂介绍",
    category_id: "cc111111-1111-4111-8111-111111111111",
    category_name: "首次开发",
    content_zh:
      "您好，我们是印尼 HOMY 海绵工厂，主要生产沙发、床垫、包装和工业用途海绵。请问您目前采购哪一类海绵？我可以先发规格和价格范围给您参考。",
    content_id:
      "Halo, kami HOMY, pabrik spons di Indonesia. Kami memproduksi spons untuk sofa, kasur, kemasan, dan industri. Boleh tahu jenis spons apa yang sedang Anda cari?",
    tags: ["首次联系", "工厂介绍", "WhatsApp"],
    is_favorite: true
  },
  {
    id: "bb111112-1111-4111-8111-111111111112",
    title: "首次开发 - 询问采购需求",
    category_id: "cc111111-1111-4111-8111-111111111111",
    category_name: "首次开发",
    content_zh:
      "您好，看到贵司有家具/床垫相关业务。想了解一下您常用的海绵密度、尺寸和月采购量大概是多少？我们可以按您的规格提供样品和批量报价。",
    content_id:
      "Halo, saya melihat perusahaan Anda bergerak di furniture/kasur. Boleh tahu densitas spons, ukuran, dan estimasi pembelian bulanan yang biasa digunakan? Kami bisa siapkan sampel dan harga grosir sesuai spesifikasi.",
    tags: ["需求挖掘", "家具", "床垫"],
    is_favorite: false
  },
  {
    id: "bb111113-1111-4111-8111-111111111113",
    title: "首次开发 - 展会后跟进",
    category_id: "cc111111-1111-4111-8111-111111111111",
    category_name: "首次开发",
    content_zh:
      "您好，很高兴在展会上认识您。根据您提到的沙发坐垫需求，我们整理了 25D、30D、35D 三个密度方案，方便的话我发给您对比一下。",
    content_id:
      "Halo, senang bertemu Anda di pameran. Berdasarkan kebutuhan cushion sofa yang Anda sebutkan, kami sudah siapkan opsi densitas 25D, 30D, dan 35D. Jika berkenan, saya kirimkan untuk dibandingkan.",
    tags: ["展会", "方案", "沙发"],
    is_favorite: false
  },
  {
    id: "bb222221-2222-4222-8222-222222222221",
    title: "报价跟进 - 确认是否查看",
    category_id: "cc222222-2222-4222-8222-222222222222",
    category_name: "报价跟进",
    content_zh:
      "您好，昨天发您的报价和产品参数是否方便看过？如果规格方向合适，我们建议先安排样品，确认手感和密度后再进入批量订单。",
    content_id:
      "Halo, apakah penawaran dan spesifikasi yang kami kirim kemarin sudah sempat dicek? Jika arahnya cocok, kami sarankan mulai dari sampel untuk konfirmasi feel dan densitas.",
    tags: ["报价", "样品", "跟进"],
    is_favorite: true
  },
  {
    id: "bb222222-2222-4222-8222-222222222222",
    title: "报价跟进 - 补充装柜信息",
    category_id: "cc222222-2222-4222-8222-222222222222",
    category_name: "报价跟进",
    content_zh:
      "补充说明一下，这个报价可以按 20GP/40HQ 装柜优化。如果您确认目标数量，我们可以重新核算装柜方案和更准确的到港成本。",
    content_id:
      "Sebagai tambahan, penawaran ini bisa dioptimalkan untuk loading 20GP/40HQ. Jika jumlah target sudah jelas, kami bisa hitung ulang rencana loading dan estimasi biaya sampai tujuan dengan lebih akurat.",
    tags: ["装柜", "外贸", "成本"],
    is_favorite: false
  },
  {
    id: "bb222223-2222-4222-8222-222222222223",
    title: "报价跟进 - 推荐替代规格",
    category_id: "cc222222-2222-4222-8222-222222222222",
    category_name: "报价跟进",
    content_zh:
      "如果当前规格预算偏高，我们也可以提供接近手感的替代密度方案，在保证使用效果的前提下降低单价。需要我帮您做一版对比报价吗？",
    content_id:
      "Jika spesifikasi saat ini di atas budget, kami bisa tawarkan opsi densitas alternatif dengan feel yang mendekati namun harga lebih efisien. Apakah perlu saya buatkan perbandingan harga?",
    tags: ["替代方案", "降本", "报价"],
    is_favorite: false
  },
  {
    id: "bb333331-3333-4333-8333-333333333331",
    title: "催单 - 样品反馈后推进",
    category_id: "cc333333-3333-4333-8333-333333333333",
    category_name: "催单",
    content_zh:
      "您好，想跟进一下样品测试结果。若手感和回弹符合要求，我们可以先锁定当前原料价格，并为您预留生产排期。",
    content_id:
      "Halo, saya ingin follow up hasil test sampel. Jika feel dan rebound sudah sesuai, kami bisa bantu lock harga bahan saat ini dan reservasi jadwal produksi untuk Anda.",
    tags: ["样品", "排期", "催单"],
    is_favorite: true
  },
  {
    id: "bb333332-3333-4333-8333-333333333332",
    title: "催单 - 报价有效期提醒",
    category_id: "cc333333-3333-4333-8333-333333333333",
    category_name: "催单",
    content_zh:
      "提醒您一下，本次报价有效期到本周五。由于原料价格近期波动，如果您计划近期下单，建议先确认数量，我们可以优先安排。",
    content_id:
      "Saya ingin mengingatkan bahwa penawaran ini berlaku sampai Jumat minggu ini. Karena harga bahan baku sedang bergerak, jika Anda berencana order dalam waktu dekat, sebaiknya jumlah dikonfirmasi dulu agar bisa kami prioritaskan.",
    tags: ["有效期", "原料波动", "订单"],
    is_favorite: false
  },
  {
    id: "bb333333-3333-4333-8333-333333333333",
    title: "催单 - 生产档期紧张",
    category_id: "cc333333-3333-4333-8333-333333333333",
    category_name: "催单",
    content_zh:
      "目前工厂下周生产档期已经比较满。如果您这批货有交期要求，建议我们今天先确认 PI 和订金，以免影响出货时间。",
    content_id:
      "Saat ini jadwal produksi minggu depan cukup penuh. Jika shipment ini punya target waktu, sebaiknya PI dan deposit dikonfirmasi hari ini agar jadwal pengiriman tidak terganggu.",
    tags: ["交期", "PI", "订金"],
    is_favorite: false
  },
  {
    id: "bb444441-4444-4444-8444-444444444441",
    title: "客户维护 - 到货后关怀",
    category_id: "cc444444-4444-4444-8444-444444444444",
    category_name: "客户维护",
    content_zh:
      "您好，看到这批货已经到港/到仓了。请问包装、数量和产品状态都正常吗？如果生产使用中有任何反馈，我们会第一时间协助处理。",
    content_id:
      "Halo, saya melihat barang sudah tiba di pelabuhan/gudang. Apakah packing, jumlah, dan kondisi produk semuanya baik? Jika ada feedback saat produksi, kami siap bantu segera.",
    tags: ["售后", "到货", "维护"],
    is_favorite: true
  },
  {
    id: "bb444442-4444-4444-8444-444444444442",
    title: "客户维护 - 复购提醒",
    category_id: "cc444444-4444-4444-8444-444444444444",
    category_name: "客户维护",
    content_zh:
      "您好，上次采购的海绵预计已经使用一段时间了。请问库存还充足吗？如果需要补货，我们可以按上次规格快速更新报价和交期。",
    content_id:
      "Halo, stok spons dari pembelian sebelumnya mungkin sudah mulai digunakan. Apakah stok masih cukup? Jika perlu repeat order, kami bisa update harga dan lead time berdasarkan spesifikasi terakhir.",
    tags: ["复购", "库存", "老客户"],
    is_favorite: false
  },
  {
    id: "bb444443-4444-4444-8444-444444444443",
    title: "客户维护 - 新品推荐",
    category_id: "cc444444-4444-4444-8444-444444444444",
    category_name: "客户维护",
    content_zh:
      "我们近期有一款更适合沙发坐垫的高回弹海绵，回弹稳定、压缩变形更低。若您方便，我可以寄一小块样品给您测试。",
    content_id:
      "Kami baru memiliki opsi HR foam yang cocok untuk cushion sofa, rebound stabil dan compression set lebih rendah. Jika Anda berkenan, saya bisa kirim potongan sampel kecil untuk diuji.",
    tags: ["新品", "高回弹", "样品"],
    is_favorite: false
  },
  {
    id: "bb555551-5555-4555-8555-555555555551",
    title: "价格异议 - 强调稳定供货",
    category_id: "cc555555-5555-4555-8555-555555555555",
    category_name: "价格异议",
    content_zh:
      "理解您在比较价格。我们的报价包含稳定密度、准时交付和售后支持，适合长期批量采购。若您有目标价，我可以帮您调整规格或数量来匹配预算。",
    content_id:
      "Saya paham Anda sedang membandingkan harga. Harga kami mencakup densitas stabil, pengiriman tepat waktu, dan dukungan purna jual. Jika ada target harga, kami bisa sesuaikan spesifikasi atau kuantitas.",
    tags: ["价格", "谈判", "长期合作"],
    is_favorite: false
  },
  {
    id: "bb555552-5555-4555-8555-555555555552",
    title: "价格异议 - 解释密度差异",
    category_id: "cc555555-5555-4555-8555-555555555555",
    category_name: "价格异议",
    content_zh:
      "同样叫 30D，不同工厂的实际密度、回弹和耐久性会有差异。我们可以提供切样对比，您能更直观看到支撑力和使用寿命的区别。",
    content_id:
      "Walaupun sama-sama disebut 30D, densitas aktual, rebound, dan durability tiap pabrik bisa berbeda. Kami bisa kirim sampel potongan untuk perbandingan agar perbedaan support dan umur pakai lebih jelas.",
    tags: ["密度", "品质", "对比"],
    is_favorite: false
  },
  {
    id: "bb555553-5555-4555-8555-555555555553",
    title: "价格异议 - 阶梯报价",
    category_id: "cc555555-5555-4555-8555-555555555555",
    category_name: "价格异议",
    content_zh:
      "如果您能确认更高数量，我们可以按阶梯价重新核算。比如样品单、小柜和整柜价格会不同，我可以给您做三档报价对比。",
    content_id:
      "Jika kuantitas bisa ditingkatkan, kami bisa hitung ulang dengan harga bertingkat. Harga untuk sampel, LCL, dan full container berbeda; saya bisa buatkan tiga opsi untuk dibandingkan.",
    tags: ["阶梯价", "整柜", "预算"],
    is_favorite: false
  }
];
