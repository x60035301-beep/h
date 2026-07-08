import type { Locale } from "@/types/crm";

export type LocalizedText = Record<Locale, string>;

export function text(value: LocalizedText, locale: Locale) {
  return value[locale] ?? value.en;
}

export const aiCrmCopy = {
  zh: {
    common: {
      customer: "客户",
      amount: "金额",
      status: "状态",
      owner: "负责人",
      stage: "阶段",
      progress: "进度",
      probability: "成交概率",
      risk: "风险",
      score: "评分",
      value: "客户价值",
      nextAction: "下一步",
      aiReserved: "AI 接口已预留，当前使用规则引擎分析",
      linkedCustomer: "关联客户",
      documents: "文档",
      count: "数量",
      days: "天"
    },
    pages: {
      boss: {
        title: "老板驾驶舱",
        description: "从销售额、利润、现金流、生产效率和 AI 风险预警查看经营全局。"
      },
      aiAnalysis: {
        title: "AI 客户分析",
        description: "汇总客户评分、成交概率、流失风险、价值判断和推荐销售策略。"
      },
      pipeline: {
        title: "销售 Pipeline",
        description: "Lead 到 Repeat Order 的完整销售漏斗，支持拖拽式阶段管理的产品骨架。"
      },
      inquiries: {
        title: "询盘管理",
        description: "集中管理图片、视频、PDF、CAD 附件、预算、竞品和 AI 产品推荐。"
      },
      orders: {
        title: "订单生命周期",
        description: "统一查看 Quotation、PI、Contract、Production、Shipment、Invoice、Payment 和 After Sales。"
      },
      production: {
        title: "生产管理",
        description: "跟踪 Foaming、Curing、Cutting、CNC、Packaging、Shipping 的生产进度。"
      },
      afterSales: {
        title: "售后管理",
        description: "管理投诉、质量问题、退货、赔偿、解决方案和客户满意度。"
      },
      worldMap: {
        title: "世界地图",
        description: "按国家查看客户数、订单数、销售额和成交率。"
      },
      workflows: {
        title: "自动化 Workflow",
        description: "可视化编排客户创建、销售分配、任务提醒、经理升级和 AI 原因分析。"
      },
      aiChat: {
        title: "AI Sales Assistant",
        description: "为压价处理、报价邮件、WhatsApp 回复和多语言销售沟通预留 AI 助手入口。"
      },
      knowledgeBase: {
        title: "企业知识库",
        description: "沉淀产品知识、报价模板、销售话术、物流、售后和 FAQ，供后续 RAG 引用。"
      }
    },
    customer360: {
      title: "Customer 360",
      overview: "客户画像",
      contacts: "多联系人",
      inquiry: "询盘",
      quotations: "报价",
      orders: "订单",
      samples: "样品",
      production: "生产",
      finance: "财务",
      attachments: "附件",
      timeline: "时间轴",
      aiAnalysis: "AI 分析",
      businessInfo: "企业信息",
      valueInfo: "客户价值",
      socialInfo: "社交渠道",
      annualPurchase: "年采购金额",
      employees: "员工数量",
      mainProducts: "主营产品",
      factoryArea: "工厂面积",
      certifications: "企业认证",
      paymentMethod: "付款方式",
      creditRating: "信用等级",
      ltv: "客户生命周期价值",
      profitMargin: "利润率",
      purchaseCycle: "采购周期",
      repeatOrders: "回购次数",
      lastDeal: "最近成交",
      strategy: "推荐销售策略",
      report: "客户分析报告"
    },
    aiChat: {
      promptLabel: "快速提示",
      inputPlaceholder: "输入销售问题，例如：客户一直压价怎么办？",
      send: "生成回复",
      sampleReply: "建议先确认客户目标价格背后的原因，再用密度稳定、交期、售后和长期供货能力解释价值，并提供两个可选规格方案。"
    },
    knowledge: {
      searchPlaceholder: "搜索产品、报价、物流、售后或 FAQ",
      articles: "知识条目",
      aiReady: "可被 AI 引用"
    }
  },
  en: {
    common: {
      customer: "Customer",
      amount: "Amount",
      status: "Status",
      owner: "Owner",
      stage: "Stage",
      progress: "Progress",
      probability: "Win probability",
      risk: "Risk",
      score: "Score",
      value: "Customer value",
      nextAction: "Next action",
      aiReserved: "AI endpoints are reserved. Current insights use a rule engine.",
      linkedCustomer: "Linked customer",
      documents: "Documents",
      count: "Count",
      days: "days"
    },
    pages: {
      boss: {
        title: "Boss Dashboard",
        description: "Executive visibility across sales, profit, cash flow, production efficiency, and AI risk alerts."
      },
      aiAnalysis: {
        title: "AI Customer Analysis",
        description: "Customer score, win probability, churn risk, value analysis, and recommended sales strategy."
      },
      pipeline: {
        title: "Sales Pipeline",
        description: "A full Lead to Repeat Order funnel with a drag-and-drop-ready stage model."
      },
      inquiries: {
        title: "Inquiry Management",
        description: "Manage image, video, PDF, CAD files, budget, competitors, and AI product recommendations."
      },
      orders: {
        title: "Order Lifecycle",
        description: "Unify Quotation, PI, Contract, Production, Shipment, Invoice, Payment, and After Sales."
      },
      production: {
        title: "Production Management",
        description: "Track Foaming, Curing, Cutting, CNC, Packaging, and Shipping progress."
      },
      afterSales: {
        title: "After Sales",
        description: "Manage complaints, quality issues, returns, compensation, solutions, and satisfaction."
      },
      worldMap: {
        title: "World Map",
        description: "Click a country to view customers, orders, sales, and conversion rate."
      },
      workflows: {
        title: "Workflow Builder",
        description: "Visually compose assignment, task, reminder, escalation, and AI analysis flows."
      },
      aiChat: {
        title: "AI Sales Assistant",
        description: "Reserved AI assistant for price negotiation, quotation email, WhatsApp replies, and multilingual sales."
      },
      knowledgeBase: {
        title: "Knowledge Base",
        description: "Store product knowledge, quotation templates, sales scripts, logistics, after sales, and FAQ for future RAG."
      }
    },
    customer360: {
      title: "Customer 360",
      overview: "Overview",
      contacts: "Contacts",
      inquiry: "Inquiry",
      quotations: "Quotations",
      orders: "Orders",
      samples: "Samples",
      production: "Production",
      finance: "Finance",
      attachments: "Attachments",
      timeline: "Timeline",
      aiAnalysis: "AI Analysis",
      businessInfo: "Business information",
      valueInfo: "Customer value",
      socialInfo: "Social channels",
      annualPurchase: "Annual purchase",
      employees: "Employees",
      mainProducts: "Main products",
      factoryArea: "Factory area",
      certifications: "Certifications",
      paymentMethod: "Payment method",
      creditRating: "Credit rating",
      ltv: "Lifetime value",
      profitMargin: "Profit margin",
      purchaseCycle: "Purchase cycle",
      repeatOrders: "Repeat orders",
      lastDeal: "Last deal",
      strategy: "Recommended strategy",
      report: "Customer analysis report"
    },
    aiChat: {
      promptLabel: "Quick prompt",
      inputPlaceholder: "Ask a sales question, for example: how do I handle price pressure?",
      send: "Generate reply",
      sampleReply: "First confirm why the customer is pushing price, then explain value through stable density, lead time, after-sales support, and long-term supply. Offer two specification options."
    },
    knowledge: {
      searchPlaceholder: "Search product, quote, logistics, after sales, or FAQ",
      articles: "Knowledge articles",
      aiReady: "AI reference ready"
    }
  },
  id: {
    common: {
      customer: "Pelanggan",
      amount: "Nilai",
      status: "Status",
      owner: "Penanggung jawab",
      stage: "Tahap",
      progress: "Progres",
      probability: "Peluang deal",
      risk: "Risiko",
      score: "Skor",
      value: "Nilai pelanggan",
      nextAction: "Langkah berikutnya",
      aiReserved: "Endpoint AI sudah disiapkan. Insight saat ini memakai rule engine.",
      linkedCustomer: "Pelanggan terkait",
      documents: "Dokumen",
      count: "Jumlah",
      days: "hari"
    },
    pages: {
      boss: {
        title: "Dasbor Owner",
        description: "Pantau sales, profit, cash flow, efisiensi produksi, dan peringatan risiko AI."
      },
      aiAnalysis: {
        title: "Analisis Pelanggan AI",
        description: "Skor pelanggan, peluang deal, risiko churn, nilai pelanggan, dan strategi sales rekomendasi."
      },
      pipeline: {
        title: "Pipeline Sales",
        description: "Funnel lengkap dari Lead sampai Repeat Order dengan model tahap siap drag-and-drop."
      },
      inquiries: {
        title: "Manajemen Inquiry",
        description: "Kelola gambar, video, PDF, CAD, budget, kompetitor, dan rekomendasi produk AI."
      },
      orders: {
        title: "Siklus Order",
        description: "Satukan Quotation, PI, Contract, Production, Shipment, Invoice, Payment, dan After Sales."
      },
      production: {
        title: "Manajemen Produksi",
        description: "Lacak progres Foaming, Curing, Cutting, CNC, Packaging, dan Shipping."
      },
      afterSales: {
        title: "After Sales",
        description: "Kelola komplain, masalah kualitas, retur, kompensasi, solusi, dan kepuasan pelanggan."
      },
      worldMap: {
        title: "Peta Dunia",
        description: "Klik negara untuk melihat pelanggan, order, penjualan, dan conversion rate."
      },
      workflows: {
        title: "Workflow Builder",
        description: "Susun assignment, task, reminder, eskalasi, dan analisis AI secara visual."
      },
      aiChat: {
        title: "AI Sales Assistant",
        description: "Asisten AI untuk negosiasi harga, email penawaran, balasan WhatsApp, dan sales multibahasa."
      },
      knowledgeBase: {
        title: "Knowledge Base",
        description: "Simpan pengetahuan produk, template penawaran, skrip sales, logistik, after sales, dan FAQ untuk RAG."
      }
    },
    customer360: {
      title: "Customer 360",
      overview: "Overview",
      contacts: "Kontak",
      inquiry: "Inquiry",
      quotations: "Penawaran",
      orders: "Order",
      samples: "Sampel",
      production: "Produksi",
      finance: "Finance",
      attachments: "Lampiran",
      timeline: "Timeline",
      aiAnalysis: "Analisis AI",
      businessInfo: "Informasi bisnis",
      valueInfo: "Nilai pelanggan",
      socialInfo: "Kanal sosial",
      annualPurchase: "Pembelian tahunan",
      employees: "Karyawan",
      mainProducts: "Produk utama",
      factoryArea: "Luas pabrik",
      certifications: "Sertifikasi",
      paymentMethod: "Metode pembayaran",
      creditRating: "Rating kredit",
      ltv: "Lifetime value",
      profitMargin: "Margin profit",
      purchaseCycle: "Siklus pembelian",
      repeatOrders: "Repeat order",
      lastDeal: "Deal terakhir",
      strategy: "Strategi rekomendasi",
      report: "Laporan analisis pelanggan"
    },
    aiChat: {
      promptLabel: "Prompt cepat",
      inputPlaceholder: "Tulis pertanyaan sales, contoh: bagaimana menangani pelanggan yang terus menekan harga?",
      send: "Buat balasan",
      sampleReply: "Pastikan dulu alasan pelanggan menekan harga, lalu jelaskan nilai dari density stabil, lead time, after-sales, dan suplai jangka panjang. Berikan dua opsi spesifikasi."
    },
    knowledge: {
      searchPlaceholder: "Cari produk, penawaran, logistik, after sales, atau FAQ",
      articles: "Artikel knowledge",
      aiReady: "Siap direferensikan AI"
    }
  }
} satisfies Record<Locale, {
  common: Record<string, string>;
  pages: Record<string, { title: string; description: string }>;
  customer360: Record<string, string>;
  aiChat: Record<string, string>;
  knowledge: Record<string, string>;
}>;

export function getAiCrmCopy(locale: Locale) {
  return aiCrmCopy[locale];
}

export const bossMetrics = [
  { key: "todaySales", label: { zh: "今日销售额", en: "Sales today", id: "Sales hari ini" }, value: "$42,800", trend: "+12.4%" },
  { key: "monthSales", label: { zh: "本月销售额", en: "Sales this month", id: "Sales bulan ini" }, value: "$386,400", trend: "+18.6%" },
  { key: "profit", label: { zh: "利润", en: "Profit", id: "Profit" }, value: "$91,200", trend: "+8.1%" },
  { key: "cashFlow", label: { zh: "现金流", en: "Cash flow", id: "Cash flow" }, value: "$214,900", trend: "+5.7%" },
  { key: "receivable", label: { zh: "应收账款", en: "Receivables", id: "Piutang" }, value: "$73,600", trend: "-4.2%" },
  { key: "completion", label: { zh: "订单完成率", en: "Order completion", id: "Order selesai" }, value: "86%", trend: "+3.5%" }
] as const;

export const aiScoreCards = [
  {
    customer: "PT Comfort Living Indonesia",
    score: 92,
    probability: 78,
    churnRisk: 12,
    value: "High",
    nextTime: "2026-07-05 10:00",
    strategy: {
      zh: "推进样品确认，强调 30D 高回弹稳定性和 40HQ 装柜效率。",
      en: "Push sample confirmation and emphasize 30D HR foam consistency plus 40HQ loading efficiency.",
      id: "Dorong konfirmasi sampel dan tekankan stabilitas spons HR 30D serta efisiensi muat 40HQ."
    }
  },
  {
    customer: "Hanoi Sofa Works",
    score: 84,
    probability: 65,
    churnRisk: 22,
    value: "Strategic",
    nextTime: "2026-07-06 15:30",
    strategy: {
      zh: "准备阶梯价方案，用密度和交期锁定年度框架订单。",
      en: "Prepare tiered pricing and anchor an annual framework order with density and lead-time guarantees.",
      id: "Siapkan harga bertingkat dan kunci order tahunan dengan jaminan density dan lead time."
    }
  },
  {
    customer: "SleepWell Trading Co.",
    score: 73,
    probability: 54,
    churnRisk: 31,
    value: "Growth",
    nextTime: "2026-07-07 11:00",
    strategy: {
      zh: "补充记忆棉样品视频和认证文件，降低首次采购顾虑。",
      en: "Send memory foam sample videos and certificates to reduce first-purchase concerns.",
      id: "Kirim video sampel memory foam dan sertifikat untuk mengurangi keraguan pembelian pertama."
    }
  }
] as const;

export const pipelineStages = [
  { key: "lead", label: { zh: "Lead", en: "Lead", id: "Lead" }, count: 34, amount: 82000, conversion: 100, dwell: 1.8, color: "bg-sky-500" },
  { key: "contacted", label: { zh: "Contacted", en: "Contacted", id: "Dihubungi" }, count: 29, amount: 76000, conversion: 85, dwell: 2.6, color: "bg-blue-500" },
  { key: "inquiry", label: { zh: "Inquiry", en: "Inquiry", id: "Inquiry" }, count: 25, amount: 96000, conversion: 73, dwell: 3.1, color: "bg-cyan-500" },
  { key: "quotation", label: { zh: "Quotation", en: "Quotation", id: "Penawaran" }, count: 21, amount: 128000, conversion: 61, dwell: 2.2, color: "bg-violet-500" },
  { key: "sample", label: { zh: "Sample", en: "Sample", id: "Sampel" }, count: 17, amount: 88000, conversion: 49, dwell: 5.4, color: "bg-amber-500" },
  { key: "negotiation", label: { zh: "Negotiation", en: "Negotiation", id: "Negosiasi" }, count: 13, amount: 113000, conversion: 38, dwell: 4.8, color: "bg-orange-500" },
  { key: "payment", label: { zh: "Payment", en: "Payment", id: "Payment" }, count: 9, amount: 64200, conversion: 26, dwell: 1.9, color: "bg-emerald-500" },
  { key: "production", label: { zh: "Production", en: "Production", id: "Produksi" }, count: 7, amount: 58400, conversion: 21, dwell: 6.3, color: "bg-lime-500" },
  { key: "shipment", label: { zh: "Shipment", en: "Shipment", id: "Shipment" }, count: 5, amount: 42100, conversion: 15, dwell: 3.7, color: "bg-teal-500" },
  { key: "completed", label: { zh: "Completed", en: "Completed", id: "Selesai" }, count: 21, amount: 286400, conversion: 14, dwell: 0.8, color: "bg-green-600" },
  { key: "repeat", label: { zh: "Repeat Order", en: "Repeat Order", id: "Repeat Order" }, count: 8, amount: 116500, conversion: 6, dwell: 12.5, color: "bg-indigo-500" }
] as const;

export const inquiryRecords = [
  {
    id: "INQ-20260704-001",
    customer: "PT Comfort Living Indonesia",
    product: "30D High Resilience Foam",
    budget: "$18,000",
    purchaseTime: "2026 Q3",
    competitor: "Local Surabaya supplier",
    files: ["image", "video", "PDF"],
    aiKind: { zh: "高回弹沙发海绵", en: "High resilience sofa foam", id: "Spons sofa high resilience" },
    aiSpec: "30D / 200 x 100 x 10 cm",
    aiQuote: "$21.70 / sheet"
  },
  {
    id: "INQ-20260704-002",
    customer: "SleepWell Trading Co.",
    product: "Memory Foam Sheet",
    budget: "$9,500",
    purchaseTime: "2026-08",
    competitor: "Malaysia importer",
    files: ["CAD", "PDF"],
    aiKind: { zh: "慢回弹床垫海绵", en: "Slow rebound mattress foam", id: "Spons kasur slow rebound" },
    aiSpec: "45D / 200 x 160 x 5 cm",
    aiQuote: "$39.00 / sheet"
  }
] as const;

export const orderRecords = [
  {
    id: "ORD-20260704-A18K2",
    customer: "PT Comfort Living Indonesia",
    quotation: "HOMY-20260704-A18K2",
    amount: 12850,
    status: { zh: "生产中", en: "In production", id: "Produksi" },
    progress: 58,
    steps: ["Quotation", "PI", "Contract", "Production", "Packing", "Shipment", "Invoice", "Payment", "After Sales"]
  },
  {
    id: "ORD-20260701-HANOI",
    customer: "Hanoi Sofa Works",
    quotation: "HOMY-20260701-HN88",
    amount: 24300,
    status: { zh: "待收款", en: "Payment pending", id: "Menunggu payment" },
    progress: 36,
    steps: ["Quotation", "PI", "Contract", "Production", "Packing", "Shipment", "Invoice", "Payment", "After Sales"]
  }
] as const;

export const productionOrders = [
  {
    order: "ORD-20260704-A18K2",
    customer: "PT Comfort Living Indonesia",
    owner: "Rizky",
    progress: 58,
    stages: [
      { name: "Foaming", progress: 100 },
      { name: "Curing", progress: 100 },
      { name: "Cutting", progress: 80 },
      { name: "Punching", progress: 35 },
      { name: "CNC Cutting", progress: 0 },
      { name: "Packaging", progress: 0 },
      { name: "Shipping", progress: 0 }
    ]
  },
  {
    order: "ORD-20260701-HANOI",
    customer: "Hanoi Sofa Works",
    owner: "Dewi",
    progress: 24,
    stages: [
      { name: "Foaming", progress: 100 },
      { name: "Curing", progress: 70 },
      { name: "Cutting", progress: 0 },
      { name: "Punching", progress: 0 },
      { name: "CNC Cutting", progress: 0 },
      { name: "Packaging", progress: 0 },
      { name: "Shipping", progress: 0 }
    ]
  }
] as const;

export const afterSalesCases = [
  {
    id: "AS-20260702-001",
    customer: "Bali Resort Supply",
    issue: { zh: "包装破损", en: "Damaged packaging", id: "Kemasan rusak" },
    type: { zh: "质量问题", en: "Quality issue", id: "Masalah kualitas" },
    satisfaction: 88,
    status: { zh: "处理中", en: "In progress", id: "Diproses" },
    solution: { zh: "补发外箱并更新包装标准照片。", en: "Resend cartons and update packaging standard photos.", id: "Kirim ulang karton dan update foto standar packaging." }
  },
  {
    id: "AS-20260628-002",
    customer: "Jakarta Cushion Studio",
    issue: { zh: "密度手感偏软", en: "Density feels softer", id: "Density terasa lebih soft" },
    type: { zh: "投诉", en: "Complaint", id: "Komplain" },
    satisfaction: 74,
    status: { zh: "待确认", en: "Pending confirmation", id: "Menunggu konfirmasi" },
    solution: { zh: "安排复检视频和替代规格建议。", en: "Prepare inspection video and alternative specification suggestion.", id: "Siapkan video inspeksi dan opsi spesifikasi alternatif." }
  }
] as const;

export const afterSalesMedia = {
  "AS-20260702-001": [
    {
      id: "media-as-001-img-1",
      type: "image",
      title: { zh: "外箱边角破损", en: "Carton corner damage", id: "Kerusakan sudut karton" },
      category: { zh: "包装照片", en: "Packaging photo", id: "Foto packaging" },
      url: "/after-sales-media/carton-damage.svg",
      capturedAt: "2026-07-03 10:12",
      uploader: "Nadia CS",
      note: {
        zh: "客户反馈到货后外箱边角压伤，产品本体未明显破损。",
        en: "Customer reported crushed carton corner after delivery; foam product is not visibly damaged.",
        id: "Customer melaporkan sudut karton penyok setelah sampai; produk foam tidak terlihat rusak."
      }
    },
    {
      id: "media-as-001-img-2",
      type: "image",
      title: { zh: "包装标签复核", en: "Packing label check", id: "Pengecekan label packing" },
      category: { zh: "质检图片", en: "QC image", id: "Gambar QC" },
      url: "/after-sales-media/packing-label.svg",
      capturedAt: "2026-07-03 11:05",
      uploader: "Warehouse",
      note: {
        zh: "复核箱唛、客户名称、规格和数量，确认与订单一致。",
        en: "Checked carton mark, customer name, specification, and quantity against the order.",
        id: "Cek carton mark, nama customer, spesifikasi, dan quantity sesuai order."
      }
    },
    {
      id: "media-as-001-img-3",
      type: "image",
      title: { zh: "补发外箱方案", en: "Replacement carton plan", id: "Rencana penggantian karton" },
      category: { zh: "解决方案", en: "Solution", id: "Solusi" },
      url: "/after-sales-media/replacement-carton.svg",
      capturedAt: "2026-07-04 09:30",
      uploader: "Nadia CS",
      note: {
        zh: "已准备补发外箱，并同步新的包装标准照片给客户确认。",
        en: "Replacement cartons are prepared and updated packing standard photos are shared for confirmation.",
        id: "Karton pengganti disiapkan dan foto standar packing baru dikirim untuk konfirmasi."
      }
    },
    {
      id: "media-as-001-video-1",
      type: "video",
      title: { zh: "包装复检视频", en: "Packing re-inspection video", id: "Video inspeksi ulang packing" },
      category: { zh: "复检视频", en: "Recheck video", id: "Video recheck" },
      url: "/after-sales-media/packing-recheck-video.svg",
      thumbnail: "/after-sales-media/packing-recheck-video.svg",
      capturedAt: "2026-07-04 10:00",
      uploader: "QC Team",
      duration: "00:42",
      note: {
        zh: "展示新包装加固位置、封箱方式和出货前复检过程。",
        en: "Shows reinforced packing areas, carton sealing method, and pre-shipment re-inspection.",
        id: "Menampilkan area packing yang diperkuat, cara sealing karton, dan inspeksi ulang sebelum kirim."
      }
    }
  ],
  "AS-20260628-002": [
    {
      id: "media-as-002-img-1",
      type: "image",
      title: { zh: "密度测试读数", en: "Density test reading", id: "Hasil test density" },
      category: { zh: "质检图片", en: "QC image", id: "Gambar QC" },
      url: "/after-sales-media/density-test.svg",
      capturedAt: "2026-06-29 14:20",
      uploader: "QC Team",
      note: {
        zh: "复检样块密度读数，确认是否与客户反馈手感偏软相关。",
        en: "Rechecked sample density reading to compare with customer feedback about softer hand feel.",
        id: "Cek ulang density sample untuk bandingkan dengan feedback customer terasa lebih soft."
      }
    },
    {
      id: "media-as-002-video-1",
      type: "video",
      title: { zh: "回弹测试视频", en: "Rebound test video", id: "Video test rebound" },
      category: { zh: "测试视频", en: "Test video", id: "Video test" },
      url: "/after-sales-media/rebound-test-video.svg",
      thumbnail: "/after-sales-media/rebound-test-video.svg",
      capturedAt: "2026-06-29 15:10",
      uploader: "QC Team",
      duration: "01:08",
      note: {
        zh: "展示按压回弹过程，用于判断慢回弹效果和客户感受差异。",
        en: "Shows compression and rebound behavior to evaluate slow rebound performance and customer perception.",
        id: "Menampilkan proses tekan dan rebound untuk evaluasi performa slow rebound dan persepsi customer."
      }
    }
  ]
} as const;

export const worldMapCountries = [
  { code: "ID", name: "Indonesia", customers: 68, orders: 31, sales: 186400, rate: 32, x: 58, y: 60 },
  { code: "VN", name: "Vietnam", customers: 23, orders: 9, sales: 64200, rate: 26, x: 52, y: 48 },
  { code: "SG", name: "Singapore", customers: 15, orders: 7, sales: 42100, rate: 29, x: 55, y: 57 },
  { code: "MY", name: "Malaysia", customers: 18, orders: 6, sales: 35800, rate: 21, x: 53, y: 56 },
  { code: "TH", name: "Thailand", customers: 12, orders: 4, sales: 22400, rate: 18, x: 50, y: 50 }
] as const;

export const workflowSteps = [
  { id: "trigger", label: { zh: "客户创建", en: "Customer created", id: "Pelanggan dibuat" }, type: "Trigger" },
  { id: "assign", label: { zh: "自动分配销售", en: "Auto assign sales", id: "Assign sales otomatis" }, type: "Action" },
  { id: "task", label: { zh: "创建跟进任务", en: "Create follow-up task", id: "Buat task follow-up" }, type: "Action" },
  { id: "email", label: { zh: "发送欢迎邮件", en: "Send welcome email", id: "Kirim email welcome" }, type: "Message" },
  { id: "wait3", label: { zh: "3天未联系", en: "No contact after 3 days", id: "3 hari belum kontak" }, type: "Condition" },
  { id: "remind", label: { zh: "提醒销售", en: "Remind sales", id: "Ingatkan sales" }, type: "Reminder" },
  { id: "wait7", label: { zh: "7天未报价", en: "No quote after 7 days", id: "7 hari belum quote" }, type: "Condition" },
  { id: "manager", label: { zh: "提醒经理", en: "Escalate to manager", id: "Eskalasi ke manager" }, type: "Escalation" },
  { id: "ai", label: { zh: "30天未成交 AI 分析原因", en: "AI analyzes no deal after 30 days", id: "AI analisis alasan belum deal 30 hari" }, type: "AI" }
] as const;

export const knowledgeItems = [
  {
    category: { zh: "产品知识", en: "Product knowledge", id: "Knowledge produk" },
    title: "30D High Resilience Foam",
    updated: "2026-07-02",
    tags: ["density", "sofa", "HR foam"]
  },
  {
    category: { zh: "报价模板", en: "Quotation template", id: "Template penawaran" },
    title: "FOB Surabaya quotation email",
    updated: "2026-07-01",
    tags: ["FOB", "email", "export"]
  },
  {
    category: { zh: "物流知识", en: "Logistics", id: "Logistik" },
    title: "40HQ loading plan for foam sheets",
    updated: "2026-06-29",
    tags: ["40HQ", "packing", "shipment"]
  },
  {
    category: { zh: "售后知识", en: "After sales", id: "After sales" },
    title: "Packaging damage response SOP",
    updated: "2026-06-27",
    tags: ["SOP", "complaint", "photo"]
  }
] as const;

export const customer360Profiles = {
  default: {
    city: "Surabaya",
    address: "Jl. Industri Foam No. 8",
    website: "https://comfortliving.id",
    tiktok: "@comfortliving",
    facebook: "Comfort Living Indonesia",
    linkedin: "comfort-living-indonesia",
    instagram: "@comfortliving.id",
    companySize: "200-500",
    annualPurchase: "$180,000",
    employees: 320,
    mainProducts: "Sofa, mattress, cushion",
    factoryArea: "18,000 m2",
    certifications: "ISO 9001, SGS",
    paymentMethod: "T/T 30% deposit, 70% before shipment",
    creditRating: "A",
    ltv: "$620,000",
    profitMargin: "23%",
    purchaseCycle: "45 days",
    repeatOrders: 6,
    lastDeal: "$28,600 / 2026-06-18",
    aiScore: 92,
    winProbability: 78,
    churnRisk: 12,
    aiSummary: {
      zh: "客户采购周期稳定，关注密度一致性和交期。建议以样品确认、装柜效率和年度框架价推进。",
      en: "The customer has a stable purchase cycle and cares about density consistency and lead time. Move forward with sample confirmation, loading efficiency, and annual framework pricing.",
      id: "Pelanggan memiliki siklus pembelian stabil dan fokus pada konsistensi density serta lead time. Dorong dengan konfirmasi sampel, efisiensi muat, dan harga tahunan."
    },
    aiReport: [
      {
        zh: "客户价值高，适合绑定年度供货协议。",
        en: "High-value account suitable for an annual supply agreement.",
        id: "Akun bernilai tinggi, cocok untuk kontrak suplai tahunan."
      },
      {
        zh: "报价应展示最低售价、建议售价和利润边界。",
        en: "Quotation should show floor price, suggested price, and margin boundary.",
        id: "Penawaran perlu menampilkan harga minimum, harga rekomendasi, dan batas margin."
      },
      {
        zh: "下一次跟进建议在样品寄出后 24 小时内完成。",
        en: "Next follow-up should happen within 24 hours after sample dispatch.",
        id: "Follow-up berikutnya sebaiknya dilakukan dalam 24 jam setelah sampel dikirim."
      }
    ]
  }
} as const;
