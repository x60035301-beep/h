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
      aiReserved: "AI 接口已连接，等待真实数据分析",
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
        description: "Lead 到 Repeat Order 的完整销售漏斗，支持后续接入真实阶段数据。"
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
        description: "为压价处理、报价邮件、WhatsApp 回复和多语言销售沟通提供 AI 助手入口。"
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
      timeline: "时间线",
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
      sampleReply: "请输入真实客户问题后生成回复。"
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
      aiReserved: "AI is connected and waiting for real data",
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
        description: "A full Lead to Repeat Order funnel ready for real stage data."
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
        description: "AI assistant for price negotiation, quotation email, WhatsApp replies, and multilingual sales."
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
      sampleReply: "Enter a real customer question to generate a reply."
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
      aiReserved: "AI sudah terhubung dan menunggu data nyata",
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
        description: "Funnel lengkap dari Lead sampai Repeat Order, siap memakai data tahap nyata."
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
      sampleReply: "Masukkan pertanyaan customer nyata untuk membuat balasan."
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

export type BossMetric = {
  key: string;
  label: LocalizedText;
  value: string;
  trend: string;
};

export type AiScoreCard = {
  customer: string;
  score: number;
  probability: number;
  churnRisk: number;
  value: string;
  nextTime: string;
  strategy: LocalizedText;
};

export type PipelineStage = {
  key: string;
  label: LocalizedText;
  count: number;
  amount: number;
  conversion: number;
  dwell: number;
  color: string;
};

export type InquiryRecord = {
  id: string;
  customer: string;
  product: string;
  budget: string;
  purchaseTime: string;
  competitor: string;
  files: Array<"image" | "video" | "PDF" | "CAD">;
  aiKind: LocalizedText;
  aiSpec: string;
  aiQuote: string;
};

export type OrderRecord = {
  id: string;
  customer: string;
  quotation: string;
  amount: number;
  status: LocalizedText;
  progress: number;
  steps: string[];
};

export type ProductionOrder = {
  order: string;
  customer: string;
  owner: string;
  progress: number;
  stages: Array<{ name: string; progress: number }>;
};

export type AfterSalesCase = {
  id: string;
  customer: string;
  issue: LocalizedText;
  type: LocalizedText;
  satisfaction: number;
  status: LocalizedText;
  solution: LocalizedText;
};

export type AfterSalesMediaItem = {
  id: string;
  type: "image" | "video";
  title: LocalizedText;
  category: LocalizedText;
  url: string;
  thumbnail?: string;
  capturedAt: string;
  uploader: string;
  note: LocalizedText;
  duration?: string;
};

export type WorldMapCountry = {
  code: string;
  name: string;
  customers: number;
  orders: number;
  sales: number;
  rate: number;
  x: number;
  y: number;
};

export type KnowledgeItem = {
  category: LocalizedText;
  title: string;
  updated: string;
  tags: string[];
};

export type Customer360Profile = {
  city: string;
  address: string;
  website: string;
  tiktok: string;
  facebook: string;
  linkedin: string;
  instagram: string;
  companySize: string;
  annualPurchase: string;
  employees: number | string;
  mainProducts: string;
  factoryArea: string;
  certifications: string;
  paymentMethod: string;
  creditRating: string;
  ltv: string;
  profitMargin: string;
  purchaseCycle: string;
  repeatOrders: number | string;
  lastDeal: string;
  aiScore: number;
  winProbability: number;
  churnRisk: number;
  aiSummary: LocalizedText;
  aiReport: LocalizedText[];
};

export const bossMetrics: BossMetric[] = [];
export const aiScoreCards: AiScoreCard[] = [];
export const pipelineStages: PipelineStage[] = [];
export const inquiryRecords: InquiryRecord[] = [];
export const orderRecords: OrderRecord[] = [];
export const productionOrders: ProductionOrder[] = [];
export const afterSalesCases: AfterSalesCase[] = [];
export const afterSalesMedia: Record<string, AfterSalesMediaItem[]> = {};
export const worldMapCountries: WorldMapCountry[] = [];
export const knowledgeItems: KnowledgeItem[] = [];

export const emptyCustomer360Profile: Customer360Profile = {
  city: "-",
  address: "-",
  website: "-",
  tiktok: "-",
  facebook: "-",
  linkedin: "-",
  instagram: "-",
  companySize: "-",
  annualPurchase: "-",
  employees: "-",
  mainProducts: "-",
  factoryArea: "-",
  certifications: "-",
  paymentMethod: "-",
  creditRating: "-",
  ltv: "-",
  profitMargin: "-",
  purchaseCycle: "-",
  repeatOrders: "-",
  lastDeal: "-",
  aiScore: 0,
  winProbability: 0,
  churnRisk: 0,
  aiSummary: {
    zh: "暂无 AI 分析。请先添加真实客户、询盘、报价和跟进记录。",
    en: "No AI analysis yet. Add real customers, inquiries, quotations, and follow-ups first.",
    id: "Belum ada analisis AI. Tambahkan pelanggan, inquiry, quotation, dan follow-up nyata terlebih dahulu."
  },
  aiReport: []
};

export const customer360Profiles: Record<string, Customer360Profile> = {
  default: emptyCustomer360Profile
};

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
