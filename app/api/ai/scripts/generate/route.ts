import { NextResponse } from "next/server";
import { z } from "zod";

import { buildHomySystemPrompt, generateAiJson, isAiEnabled } from "@/lib/ai/openrouter";

const schema = z.object({
  locale: z.enum(["zh", "en", "id"]).default("zh"),
  category: z.string().min(1),
  count: z.number().int().min(1).max(8).default(6)
});

type GeneratedScript = {
  title: string;
  content_zh: string;
  content_id: string;
  tags: string[];
};

const fallbackTemplates: Record<"first" | "quotation" | "order" | "care" | "price", GeneratedScript[]> = {
  first: [
    {
      title: "首次开发 - 工厂能力介绍",
      content_zh:
        "您好，我们是印尼 HOMY 海绵工厂，长期生产家具海绵、床垫海绵、包装海绵和定制切割海绵。想了解一下贵司目前主要采购哪类海绵、常用密度和月采购量？我可以先根据规格整理一份样品和批量报价给您参考。",
      content_id:
        "Halo, kami HOMY, pabrik spons/foam di Indonesia. Kami memproduksi foam untuk furniture, kasur, packaging, dan cutting custom. Boleh tahu jenis foam, densitas, dan estimasi pembelian bulanan yang biasa Anda gunakan? Saya bisa siapkan opsi sampel dan harga grosir sesuai spesifikasi.",
      tags: ["首次联系", "工厂介绍", "需求挖掘"]
    },
    {
      title: "首次开发 - 询问采购需求",
      content_zh:
        "您好，看到贵司业务和家具/床垫相关。想确认一下，您目前采购海绵时更关注密度、回弹、尺寸、交期还是价格？如果方便，您可以发一张产品图片或常用规格，我会帮您匹配适合的 HOMY 海绵方案。",
      content_id:
        "Halo, saya melihat perusahaan Anda bergerak di bidang furniture/kasur. Saat membeli foam, prioritas Anda lebih ke densitas, rebound, ukuran, lead time, atau harga? Jika memungkinkan, kirim foto produk atau spesifikasi yang biasa dipakai, nanti saya bantu cocokkan solusi foam HOMY.",
      tags: ["需求挖掘", "家具", "床垫"]
    },
    {
      title: "首次开发 - 本地供应优势",
      content_zh:
        "您好，我们在印尼本地生产海绵，适合需要稳定供货、快速打样和长期合作的客户。若贵司正在比较供应商，我可以先提供常用密度、尺寸和装柜方案，帮助您评估成本和交期。",
      content_id:
        "Halo, kami produksi foam secara lokal di Indonesia, cocok untuk pelanggan yang membutuhkan supply stabil, sampel cepat, dan kerja sama jangka panjang. Jika Anda sedang membandingkan supplier, saya bisa kirim opsi densitas, ukuran, dan loading plan untuk membantu evaluasi biaya dan lead time.",
      tags: ["本地供应", "长期合作", "打样"]
    },
    {
      title: "首次开发 - 展会后跟进",
      content_zh:
        "您好，很高兴在展会/线上渠道认识您。我们主要提供家具、床垫、包装和工业用途海绵。为了给您推荐更准确的产品，请问您目前常用的密度、尺寸、数量和目标应用是什么？",
      content_id:
        "Halo, senang bisa terhubung dengan Anda melalui pameran/online channel. Kami menyediakan foam untuk furniture, kasur, packaging, dan industri. Agar rekomendasi lebih tepat, boleh tahu densitas, ukuran, jumlah, dan aplikasi produk yang Anda butuhkan?",
      tags: ["展会", "需求确认", "产品推荐"]
    },
    {
      title: "首次开发 - 要求样品信息",
      content_zh:
        "您好，如果您需要先测试质量，我们可以按常用规格准备样品。请告知目标密度、硬度、尺寸和用途，我会确认样品可做范围、预计完成时间和后续批量报价。",
      content_id:
        "Halo, jika Anda ingin mengecek kualitas terlebih dahulu, kami bisa siapkan sampel sesuai spesifikasi umum. Mohon informasikan densitas, hardness, ukuran, dan aplikasi, nanti saya cek range sampel, estimasi waktu, dan harga bulk setelahnya.",
      tags: ["样品", "质量确认", "规格"]
    },
    {
      title: "首次开发 - 批量报价前置问题",
      content_zh:
        "您好，为了避免报价偏差，我想先确认三个信息：海绵用途、目标密度/尺寸、预计每月或每批数量。确认后我会按 EXW/FOB 或您指定贸易方式整理报价。",
      content_id:
        "Halo, agar penawaran tidak meleset, saya ingin konfirmasi tiga hal terlebih dahulu: aplikasi foam, target densitas/ukuran, dan estimasi jumlah per bulan atau per order. Setelah itu saya bisa susun harga EXW/FOB atau term lain yang Anda minta.",
      tags: ["报价准备", "采购量", "贸易方式"]
    }
  ],
  quotation: [
    {
      title: "报价跟进 - 确认客户是否查看",
      content_zh:
        "您好，昨天发给您的海绵报价是否方便查看了？如果密度、尺寸或数量需要调整，我可以马上重新核算。也可以根据您的目标价格，给您提供更合适的替代规格。",
      content_id:
        "Halo, apakah penawaran foam yang saya kirim kemarin sudah sempat Anda cek? Jika densitas, ukuran, atau jumlah perlu disesuaikan, saya bisa hitung ulang segera. Jika ada target harga, saya juga bisa rekomendasikan spesifikasi alternatif yang lebih sesuai.",
      tags: ["报价", "跟进", "替代方案"]
    },
    {
      title: "报价跟进 - 补充装柜信息",
      content_zh:
        "您好，我补充一下装柜信息：如果按当前规格下单，我们可以进一步优化包装和装柜数量，帮助您降低单位运输成本。您方便确认目标柜型是 20GP、40HQ 还是散货吗？",
      content_id:
        "Halo, saya tambahkan informasi loading: untuk spesifikasi saat ini, kami bisa optimalkan packing dan jumlah muat agar biaya logistik per unit lebih efisien. Boleh konfirmasi target container Anda 20GP, 40HQ, atau LCL?",
      tags: ["装柜", "物流", "降本"]
    },
    {
      title: "报价跟进 - 推荐替代规格",
      content_zh:
        "您好，如果您觉得当前价格略高，我们可以从密度、厚度、包装方式和数量阶梯四个方向优化。质量要求不变的前提下，我建议先对比两个替代规格，再决定最终方案。",
      content_id:
        "Halo, jika harga saat ini masih terasa tinggi, kita bisa optimalkan dari densitas, thickness, packing, dan quantity tier. Dengan standar kualitas tetap dijaga, saya sarankan kita bandingkan dua opsi spesifikasi alternatif sebelum final.",
      tags: ["替代规格", "成本优化", "谈判"]
    },
    {
      title: "报价跟进 - 有效期提醒",
      content_zh:
        "您好，提醒一下当前报价有效期到本周五。由于原料价格会波动，如果您计划近期采购，建议先确认数量和交期，我们可以为您锁定当前价格。",
      content_id:
        "Halo, saya ingin mengingatkan bahwa penawaran saat ini berlaku sampai Jumat ini. Karena harga bahan baku bisa berubah, jika Anda berencana order dalam waktu dekat, sebaiknya kita konfirmasi jumlah dan lead time agar harga saat ini bisa dikunci.",
      tags: ["有效期", "原料波动", "锁价"]
    },
    {
      title: "报价跟进 - 等客户反馈",
      content_zh:
        "您好，请问报价内部评估进展如何？如果采购、财务或技术团队有任何问题，我可以补充产品参数、装柜计算、样品方案或付款条款说明。",
      content_id:
        "Halo, bagaimana progress evaluasi internal untuk penawaran ini? Jika tim purchasing, finance, atau technical memiliki pertanyaan, saya bisa lengkapi parameter produk, loading calculation, opsi sampel, atau penjelasan payment term.",
      tags: ["内部评估", "报价支持", "采购"]
    },
    {
      title: "报价跟进 - 促成下一步",
      content_zh:
        "您好，为了推进下一步，我建议先确认样品或小批量订单。这样贵司可以验证手感、密度和尺寸稳定性，确认后我们再安排正式批量生产报价。",
      content_id:
        "Halo, untuk langkah berikutnya, saya sarankan konfirmasi sampel atau trial order kecil terlebih dahulu. Dengan begitu Anda bisa cek feel, densitas, dan stabilitas ukuran sebelum kita lanjut ke penawaran produksi bulk.",
      tags: ["下一步", "样品", "小批量"]
    }
  ],
  order: [
    {
      title: "催单 - 样品反馈后推进",
      content_zh:
        "您好，样品测试是否已经有结果？如果手感、密度和尺寸都符合要求，我们可以先安排订单排产，避免后面交期被其他订单占满。",
      content_id:
        "Halo, apakah hasil testing sampel sudah ada? Jika feel, densitas, dan ukuran sudah sesuai, kita bisa mulai atur jadwal produksi agar lead time tidak terdorong oleh antrean order lain.",
      tags: ["样品反馈", "排产", "催单"]
    },
    {
      title: "催单 - 生产档期紧张",
      content_zh:
        "您好，这周生产排期比较满。如果贵司计划本月出货，建议尽快确认订单和订金，我们才能提前预留发泡、切割和包装产能。",
      content_id:
        "Halo, jadwal produksi minggu ini cukup padat. Jika Anda menargetkan shipment bulan ini, sebaiknya order dan deposit dikonfirmasi lebih cepat agar kami bisa reserve kapasitas foaming, cutting, dan packaging.",
      tags: ["生产排期", "订金", "交期"]
    },
    {
      title: "催单 - 报价有效期将到",
      content_zh:
        "您好，当前报价即将到期。若您认可规格和价格，请先确认 PI，我们可以按当前条件保留价格并安排后续生产计划。",
      content_id:
        "Halo, penawaran saat ini akan segera berakhir. Jika spesifikasi dan harga sudah sesuai, mohon konfirmasi PI terlebih dahulu agar kami bisa pertahankan kondisi harga saat ini dan atur rencana produksi.",
      tags: ["报价有效期", "PI", "锁价"]
    },
    {
      title: "催单 - 库存原料提醒",
      content_zh:
        "您好，目前该密度原料库存可以支持近期生产。如果晚些确认，可能需要重新排队采购原料。您方便今天确认数量和交期吗？",
      content_id:
        "Halo, saat ini stok bahan untuk densitas tersebut masih tersedia untuk produksi dekat ini. Jika konfirmasi tertunda, kemungkinan perlu antre pembelian bahan lagi. Apakah hari ini bisa konfirmasi quantity dan lead time?",
      tags: ["原料库存", "数量确认", "交期"]
    },
    {
      title: "催单 - 付款节点提醒",
      content_zh:
        "您好，订单信息已经基本确认。请问订金预计什么时候可以安排？收到付款后我们会立即锁定生产计划并同步预计完成时间。",
      content_id:
        "Halo, detail order sudah hampir final. Kira-kira deposit bisa dijadwalkan kapan? Setelah pembayaran diterima, kami akan langsung lock jadwal produksi dan update estimasi selesai.",
      tags: ["付款", "订金", "生产计划"]
    },
    {
      title: "催单 - 批量优惠提醒",
      content_zh:
        "您好，如果本次数量可以提升到整柜或接近整柜，我们能进一步优化单价和装柜成本。您要不要我按两个数量档位重新给您对比？",
      content_id:
        "Halo, jika jumlah order bisa dinaikkan ke full container atau mendekati full container, kami bisa optimalkan harga unit dan biaya loading. Apakah Anda ingin saya bandingkan dua quantity tier?",
      tags: ["整柜", "阶梯价", "成本优化"]
    }
  ],
  care: [
    {
      title: "客户维护 - 到货后关怀",
      content_zh:
        "您好，货物是否已经顺利到仓？海绵外观、尺寸和包装状态是否正常？如果有任何需要确认的地方，您可以直接发图片或视频给我，我会协助快速处理。",
      content_id:
        "Halo, apakah barang sudah tiba di gudang dengan baik? Bagaimana kondisi tampilan foam, ukuran, dan packing? Jika ada hal yang perlu dicek, silakan kirim foto atau video, saya akan bantu follow up dengan cepat.",
      tags: ["到货", "售后", "客户维护"]
    },
    {
      title: "客户维护 - 复购提醒",
      content_zh:
        "您好，按照上次采购周期，您可能很快需要补货。我可以先帮您确认当前原料价格、生产排期和装柜计划，避免临近缺货时交期紧张。",
      content_id:
        "Halo, berdasarkan siklus pembelian sebelumnya, kemungkinan Anda akan membutuhkan restock dalam waktu dekat. Saya bisa bantu cek harga bahan terbaru, jadwal produksi, dan loading plan agar tidak terlambat saat stok menipis.",
      tags: ["复购", "补货", "采购周期"]
    },
    {
      title: "客户维护 - 新品推荐",
      content_zh:
        "您好，我们近期有几款适合家具和床垫客户的新规格海绵，重点是回弹稳定、切割尺寸更准、包装更适合出口。您需要我整理一份推荐清单吗？",
      content_id:
        "Halo, kami punya beberapa spesifikasi foam baru yang cocok untuk pelanggan furniture dan kasur, dengan rebound stabil, cutting lebih presisi, dan packing yang lebih cocok untuk ekspor. Apakah Anda ingin saya kirim daftar rekomendasinya?",
      tags: ["新品", "产品推荐", "家具"]
    },
    {
      title: "客户维护 - 月度回访",
      content_zh:
        "您好，想做一个简单回访：上批海绵在生产使用过程中是否稳定？如果有密度、硬度、尺寸或包装方面的改进建议，我们可以在下批订单中提前优化。",
      content_id:
        "Halo, saya ingin follow up singkat: apakah foam batch sebelumnya stabil saat digunakan di produksi? Jika ada masukan terkait densitas, hardness, ukuran, atau packing, kami bisa optimalkan di order berikutnya.",
      tags: ["回访", "质量", "优化"]
    },
    {
      title: "客户维护 - 年度合作建议",
      content_zh:
        "您好，如果贵司今年采购量比较稳定，我们可以讨论年度供货计划，包括固定规格、价格周期、样品标准和交期安排。这样双方都更容易控制成本和库存。",
      content_id:
        "Halo, jika volume pembelian Anda tahun ini cukup stabil, kita bisa diskusikan supply plan tahunan, termasuk spesifikasi tetap, periode harga, standar sampel, dan jadwal lead time. Ini akan membantu kedua pihak mengontrol biaya dan stok.",
      tags: ["年度协议", "长期合作", "库存"]
    },
    {
      title: "客户维护 - 节日前备货",
      content_zh:
        "您好，节日前生产和物流通常会更紧张。如果您有预计订单，我建议提前确认规格和数量，我们可以先帮您安排生产窗口。",
      content_id:
        "Halo, menjelang periode libur biasanya produksi dan logistik lebih padat. Jika Anda memiliki rencana order, sebaiknya spesifikasi dan quantity dikonfirmasi lebih awal agar kami bisa reserve slot produksi.",
      tags: ["节前备货", "物流", "排产"]
    }
  ],
  price: [
    {
      title: "价格异议 - 解释价值差异",
      content_zh:
        "理解您对价格的关注。我们的报价不仅包含海绵本身，也包含密度稳定性、切割尺寸控制、包装保护和长期供货稳定性。如果只比较单价，可能会忽略后续损耗和交付风险。",
      content_id:
        "Saya paham Anda mempertimbangkan harga. Penawaran kami tidak hanya mencakup foam, tetapi juga stabilitas densitas, kontrol ukuran cutting, perlindungan packing, dan supply yang konsisten. Jika hanya membandingkan harga unit, risiko loss dan delivery bisa terlewat.",
      tags: ["价格", "品质", "稳定供货"]
    },
    {
      title: "价格异议 - 密度差异说明",
      content_zh:
        "同样尺寸的海绵，密度不同会直接影响成本、手感和耐用性。若您有目标价格，我可以帮您对比两个密度方案，让您清楚看到价格和性能的差别。",
      content_id:
        "Untuk ukuran foam yang sama, perbedaan densitas akan memengaruhi biaya, feel, dan durability. Jika ada target harga, saya bisa bandingkan dua opsi densitas agar Anda bisa melihat perbedaan harga dan performa dengan jelas.",
      tags: ["密度", "成本", "对比"]
    },
    {
      title: "价格异议 - 阶梯报价",
      content_zh:
        "如果当前单价超出预算，我们可以按数量阶梯重新计算。通常数量越接近整柜，单位生产和物流成本越低，我可以给您做 3 个数量档位对比。",
      content_id:
        "Jika harga unit saat ini di atas budget, kita bisa hitung ulang berdasarkan quantity tier. Biasanya semakin dekat ke full container, biaya produksi dan logistik per unit lebih rendah. Saya bisa buatkan perbandingan 3 tier quantity.",
      tags: ["阶梯价", "整柜", "预算"]
    },
    {
      title: "价格异议 - 降本替代方案",
      content_zh:
        "如果必须控制预算，我建议先从厚度、包装方式和装柜效率优化，而不是直接降低关键密度。这样可以控制成本，同时尽量保持产品性能。",
      content_id:
        "Jika budget harus dikontrol, saya sarankan optimasi dari thickness, metode packing, dan efisiensi loading terlebih dahulu, bukan langsung menurunkan densitas utama. Dengan begitu biaya bisa turun tanpa terlalu mengorbankan performa produk.",
      tags: ["降本", "替代方案", "性能"]
    },
    {
      title: "价格异议 - 长期合作价格",
      content_zh:
        "如果贵司能提供月度或季度采购计划，我们可以评估更稳定的合作价格。对我们来说，稳定排产可以降低成本，也能给您更好的价格支持。",
      content_id:
        "Jika Anda bisa memberikan rencana pembelian bulanan atau kuartalan, kami bisa evaluasi harga kerja sama yang lebih stabil. Untuk kami, jadwal produksi yang stabil membantu menekan biaya dan memberi dukungan harga yang lebih baik untuk Anda.",
      tags: ["长期合作", "月度计划", "价格支持"]
    },
    {
      title: "价格异议 - 竞品对比",
      content_zh:
        "如果您手上有其他供应商报价，方便的话可以隐去敏感信息后发我参考。我会从密度、尺寸、包装、交期和付款条款帮您做客观对比。",
      content_id:
        "Jika Anda memiliki penawaran dari supplier lain, Anda bisa kirim dengan informasi sensitif disembunyikan. Saya akan bantu bandingkan secara objektif dari densitas, ukuran, packing, lead time, dan payment term.",
      tags: ["竞品", "对比", "谈判"]
    }
  ]
};

function getFallbackTemplates(category: string, count: number) {
  const normalized = category.toLowerCase();
  const key =
    /首次|first|awal|kontak/.test(normalized)
      ? "first"
      : /报价|quotation|penawaran/.test(normalized)
        ? "quotation"
        : /催单|order push|dorong/.test(normalized)
          ? "order"
          : /维护|customer care|maintenance|pelanggan/.test(normalized)
            ? "care"
            : /价格|price|harga|keberatan/.test(normalized)
              ? "price"
              : "first";

  return fallbackTemplates[key].slice(0, count);
}

export async function POST(request: Request) {
  try {
    const payload = schema.parse(await request.json());
    const fallback = getFallbackTemplates(payload.category, payload.count);

    if (!isAiEnabled()) {
      return NextResponse.json({ data: { scripts: fallback, mode: "rules-engine-v1" } });
    }

    const result = await generateAiJson<GeneratedScript[]>({
      messages: [
        {
          role: "system",
          content: buildHomySystemPrompt(
            payload.locale,
            "Generate sales script templates for HOMY. Each template must be customer-ready, practical, and specific to foam export sales."
          )
        },
        {
          role: "user",
          content: [
            `Category: ${payload.category}`,
            `Generate ${payload.count} different templates.`,
            "Return JSON array only. Each item shape:",
            '{ "title": string, "content_zh": string, "content_id": string, "tags": string[] }',
            "content_zh must be Chinese. content_id must be Bahasa Indonesia. tags should be short Chinese tags."
          ].join("\n")
        }
      ],
      fallback,
      maxTokens: 2600
    }).catch(() => ({ data: fallback, model: "rules-engine-v1" }));

    const scripts = Array.isArray(result.data) ? result.data.slice(0, payload.count) : fallback;
    const mode = result.model === "rules-engine-v1" ? "rules-engine-v1" : `openrouter:${result.model}`;

    return NextResponse.json({ data: { scripts, mode } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI script generation failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
