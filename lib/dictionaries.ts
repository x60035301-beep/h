import type { CustomerStage, Locale, QuotationStatus, ReminderType } from "@/types/crm";

type PageCopy = {
  title: string;
  description: string;
};

export type AppDictionary = {
  languageNames: Record<Locale, string>;
  nav: Record<string, string>;
  roles: Record<string, string>;
  topbar: {
    searchPlaceholder: string;
    notifications: string;
    changeLanguage: string;
    toggleTheme: string;
    openNavigation: string;
  };
  userMenu: {
    fallbackName: string;
    avatarAlt: string;
    profile: string;
    signOut: string;
  };
  auth: {
    eyebrow: string;
    headline: string;
    description: string;
    aiNote: string;
    signInTitle: string;
    signInDescription: string;
    email: string;
    password: string;
    forgotPassword: string;
    signIn: string;
    missingEnvTitle: string;
    missingEnvDescription: string;
    loginFailed: string;
    resetTitle: string;
    resetDescription: string;
    sendResetLink: string;
    resetMissingEnv: string;
    resetFailed: string;
    resetSuccessTitle: string;
    resetSuccessDescription: string;
    updateTitle: string;
    updateDescription: string;
    newPassword: string;
    updatePassword: string;
    updateFailed: string;
    updateSuccess: string;
  };
  pages: Record<string, PageCopy>;
  dashboard: {
    metrics: {
      totalCustomers: PageCopy;
      newCustomersToday: PageCopy;
      pendingFollowups: PageCopy;
      quotationsToday: PageCopy;
      wonCustomers: PageCopy;
      revenueAmount: PageCopy;
    };
    salesFunnel: string;
    todayReminders: string;
    recentActivities: string;
  };
  customerStages: Record<CustomerStage, string>;
  reminderTypes: Record<ReminderType, string>;
  quotationStatuses: Record<QuotationStatus, string>;
  customerTable: {
    create: string;
    createTitle: string;
    createDescription: string;
    searchPlaceholder: string;
    headers: {
      companyName: string;
      contactName: string;
      country: string;
      industry: string;
      companyType: string;
      whatsapp: string;
      email: string;
      source: string;
      grade: string;
      stage: string;
      lastContactedAt: string;
    };
    actions: string;
    viewDetail: string;
    delete: string;
    empty: string;
    pageOf: string;
    previous: string;
    next: string;
    deleteFailed: string;
    deleteSuccess: string;
  };
  customerDetail: {
    back: string;
    lastContact: string;
    edit: string;
    editTitle: string;
    editDescription: string;
    basicInfo: string;
    stage: string;
    grade: string;
    companyType: string;
    source: string;
    notes: string;
    contacts: string;
    primary: string;
    followups: string;
    quotationRecords: string;
    attachments: string;
    addFollowup: string;
    customerAttachments: string;
  };
  kanban: {
    noContact: string;
    lastContact: string;
    updateFailed: string;
    updateSuccess: string;
  };
  quotations: {
    historyTitle: string;
    create: string;
    createTitle: string;
    createDescription: string;
    quotationNo: string;
    customer: string;
    status: string;
    amount: string;
    validUntil: string;
    createdAt: string;
    copy: string;
    downloadPdf: string;
    copyFailed: string;
    copySuccess: string;
  };
  reminders: {
    create: string;
    createTitle: string;
    createDescription: string;
    updateFailed: string;
    markDoneSuccess: string;
    createFailed: string;
    createSuccess: string;
    title: string;
    customer: string;
    type: string;
    dueAt: string;
    save: string;
  };
  scriptLibrary: {
    searchPlaceholder: string;
    allCategories: string;
    totalTemplates: string;
    favoriteTemplates: string;
    categoryCount: string;
    copied: string;
    favoriteAria: string;
    chinese: string;
    indonesian: string;
    copy: string;
    empty: string;
  };
};

const zhPages: Record<string, PageCopy> = {
  dashboard: { title: "仪表盘", description: "查看 HOMY 销售漏斗、提醒、报价和成交情况。" },
  customers: { title: "客户管理", description: "管理客户资料、联系人、阶段、跟进和附件。" },
  kanban: { title: "客户 Kanban", description: "拖拽客户阶段并自动保存到数据库。" },
  quotations: { title: "报价管理", description: "创建、复制、查询并导出正式报价单。" },
  products: { title: "产品管理", description: "维护产品分类、规格、密度、尺寸、价格和文件。" },
  scripts: { title: "销售话术库", description: "检索、复制和收藏中文 / 印尼语销售话术模板。" },
  files: { title: "文件中心", description: "统一管理客户、产品和报价附件。" },
  reminders: { title: "提醒系统", description: "管理客户跟进、报价、样品和到期提醒。" },
  analytics: { title: "数据统计", description: "分析客户来源、国家分布、增长趋势和销售阶段。" },
  settings: { title: "系统设置", description: "维护公司 Logo、名称、电话、邮箱和地址。" }
};

const enPages: Record<string, PageCopy> = {
  dashboard: { title: "Dashboard", description: "View HOMY pipeline, reminders, quotations, and deal visibility." },
  customers: { title: "Customers", description: "Manage customer profiles, contacts, stages, follow-ups, and attachments." },
  kanban: { title: "Customer Kanban", description: "Drag customer stages and save changes to the database." },
  quotations: { title: "Quotations", description: "Create, copy, search, and export formal quotations." },
  products: { title: "Products", description: "Manage product categories, specs, density, size, prices, and files." },
  scripts: { title: "Sales Scripts", description: "Search, copy, and favorite Chinese / Indonesian sales scripts." },
  files: { title: "File Center", description: "Manage customer, product, and quotation attachments." },
  reminders: { title: "Reminders", description: "Manage customer follow-up, quotation, sample, and due-date reminders." },
  analytics: { title: "Analytics", description: "Analyze sources, countries, growth trends, and sales stages." },
  settings: { title: "Settings", description: "Maintain company logo, name, phone, email, and address." }
};

const idPages: Record<string, PageCopy> = {
  dashboard: { title: "Dashboard", description: "Lihat pipeline HOMY, reminder, quotation, dan deal." },
  customers: { title: "Pelanggan", description: "Kelola profil pelanggan, kontak, tahap, follow-up, dan lampiran." },
  kanban: { title: "Kanban Pelanggan", description: "Drag tahap pelanggan dan simpan ke database." },
  quotations: { title: "Penawaran", description: "Buat, salin, cari, dan ekspor quotation resmi." },
  products: { title: "Produk", description: "Kelola kategori, spesifikasi, density, ukuran, harga, dan file produk." },
  scripts: { title: "Skrip Sales", description: "Cari, salin, dan favoritkan skrip sales Mandarin / Indonesia." },
  files: { title: "Pusat File", description: "Kelola lampiran pelanggan, produk, dan quotation." },
  reminders: { title: "Reminder", description: "Kelola reminder follow-up, quotation, sample, dan jatuh tempo." },
  analytics: { title: "Analitik", description: "Analisis sumber pelanggan, negara, tren pertumbuhan, dan tahap sales." },
  settings: { title: "Pengaturan", description: "Kelola logo perusahaan, nama, telepon, email, dan alamat." }
};

function withV2Pages(pages: Record<string, PageCopy>, locale: Locale): Record<string, PageCopy> {
  const extras: Record<Locale, Record<string, PageCopy>> = {
    zh: {
      pipeline: { title: "销售 Pipeline", description: "查看客户从 Lead 到 Repeat Order 的销售阶段。" },
      inquiries: { title: "询盘管理", description: "管理客户询盘、附件和推荐报价。" },
      orders: { title: "订单生命周期", description: "跟踪从报价到生产、发货、收款和售后的订单闭环。" },
      production: { title: "生产管理", description: "跟踪发泡、熟化、切割、包装和发货进度。" },
      afterSales: { title: "售后管理", description: "处理投诉、质量问题、退货、赔偿和满意度。" },
      aiAnalysis: { title: "AI 客户分析", description: "查看客户评分、成交概率、流失风险和销售建议。" },
      aiChat: { title: "AI Sales Assistant", description: "生成报价邮件、WhatsApp 回复和销售策略。" },
      knowledgeBase: { title: "企业知识库", description: "沉淀产品、报价、物流、售后和 FAQ 知识。" },
      workflows: { title: "自动化 Workflow", description: "编排客户创建、销售分配、提醒和升级流程。" },
      worldMap: { title: "世界地图", description: "按国家查看客户数量、订单和销售额。" },
      boss: { title: "老板驾驶舱", description: "查看销售额、利润、现金流、订单和风险预警。" }
    },
    en: {
      pipeline: { title: "Sales Pipeline", description: "Track customers from Lead to Repeat Order." },
      inquiries: { title: "Inquiries", description: "Manage inquiries, attachments, and recommended quotations." },
      orders: { title: "Order Lifecycle", description: "Track orders from quotation to production, shipment, payment, and after-sales." },
      production: { title: "Production", description: "Track foaming, curing, cutting, packaging, and shipping progress." },
      afterSales: { title: "After Sales", description: "Handle complaints, quality issues, returns, compensation, and satisfaction." },
      aiAnalysis: { title: "AI Customer Analysis", description: "View score, win probability, churn risk, and sales strategy." },
      aiChat: { title: "AI Sales Assistant", description: "Generate quotation emails, WhatsApp replies, and sales strategy." },
      knowledgeBase: { title: "Knowledge Base", description: "Collect product, quotation, logistics, after-sales, and FAQ knowledge." },
      workflows: { title: "Automation Workflow", description: "Orchestrate customer creation, assignment, reminders, and escalation." },
      worldMap: { title: "World Map", description: "View customers, orders, and sales by country." },
      boss: { title: "Boss Dashboard", description: "View sales, profit, cash flow, orders, and risk alerts." }
    },
    id: {
      pipeline: { title: "Sales Pipeline", description: "Pantau pelanggan dari Lead sampai Repeat Order." },
      inquiries: { title: "Inquiry", description: "Kelola inquiry, lampiran, dan rekomendasi quotation." },
      orders: { title: "Siklus Order", description: "Pantau order dari quotation ke produksi, shipment, payment, dan after-sales." },
      production: { title: "Produksi", description: "Pantau foaming, curing, cutting, packaging, dan shipping." },
      afterSales: { title: "After Sales", description: "Tangani komplain, masalah kualitas, retur, kompensasi, dan kepuasan." },
      aiAnalysis: { title: "Analisis AI Customer", description: "Lihat score, peluang deal, risiko churn, dan strategi sales." },
      aiChat: { title: "AI Sales Assistant", description: "Buat email quotation, balasan WhatsApp, dan strategi sales." },
      knowledgeBase: { title: "Knowledge Base", description: "Simpan pengetahuan produk, quotation, logistik, after-sales, dan FAQ." },
      workflows: { title: "Automation Workflow", description: "Atur customer creation, assignment, reminder, dan escalation." },
      worldMap: { title: "Peta Dunia", description: "Lihat customer, order, dan sales berdasarkan negara." },
      boss: { title: "Dashboard Boss", description: "Lihat sales, profit, cash flow, order, dan risk alert." }
    }
  };
  return { ...pages, ...extras[locale] };
}

export const dictionaries: Record<Locale, AppDictionary> = {
  zh: {
    languageNames: { en: "English", zh: "中文", id: "Bahasa Indonesia" },
    nav: {
      dashboard: "仪表盘",
      customers: "客户",
      kanban: "Kanban",
      quotations: "报价",
      products: "产品",
      scripts: "话术",
      files: "文件",
      reminders: "提醒",
      analytics: "统计",
      settings: "设置",
      pipeline: "Pipeline",
      inquiries: "询盘",
      orders: "订单",
      production: "生产",
      afterSales: "售后",
      aiAnalysis: "AI 分析",
      aiChat: "AI 助手",
      knowledgeBase: "知识库",
      workflows: "Workflow",
      worldMap: "世界地图",
      boss: "老板驾驶舱"
    },
    roles: {
      admin: "管理员",
      boss: "老板",
      manager: "经理",
      sales: "销售",
      finance: "财务",
      production: "生产",
      warehouse: "仓库",
      logistics: "物流",
      customer_service: "客服"
    },
    topbar: {
      searchPlaceholder: "搜索客户、报价、产品...",
      notifications: "通知",
      changeLanguage: "切换语言",
      toggleTheme: "切换深色模式",
      openNavigation: "打开导航"
    },
    userMenu: { fallbackName: "HOMY 用户", avatarAlt: "用户头像", profile: "个人资料", signOut: "退出登录" },
    auth: {
      eyebrow: "HOMY 海绵工厂",
      headline: "客户、报价和销售流程统一管理。",
      description: "为工厂销售、外贸业务员、销售经理和负责人打造的正式 CRM 工作台。",
      aiNote: "AI 扩展接口已预留，正式数据必须连接 Supabase。",
      signInTitle: "登录",
      signInDescription: "使用 HOMY 销售账号继续。",
      email: "邮箱",
      password: "密码",
      forgotPassword: "忘记密码？",
      signIn: "登录",
      missingEnvTitle: "生产配置缺失",
      missingEnvDescription: "正式使用前必须配置 Supabase 环境变量。",
      loginFailed: "登录失败",
      resetTitle: "重置密码",
      resetDescription: "我们会向你的邮箱发送安全重置链接。",
      sendResetLink: "发送重置链接",
      resetMissingEnv: "尚未配置 Supabase",
      resetFailed: "重置失败",
      resetSuccessTitle: "请查看邮箱",
      resetSuccessDescription: "密码重置链接已发送。",
      updateTitle: "修改密码",
      updateDescription: "为 HOMY CRM 账号设置新密码。",
      newPassword: "新密码",
      updatePassword: "修改密码",
      updateFailed: "更新失败",
      updateSuccess: "密码已更新"
    },
    pages: withV2Pages(zhPages, "zh"),
    dashboard: {
      metrics: {
        totalCustomers: { title: "客户总数", description: "全部有效客户" },
        newCustomersToday: { title: "今日新增客户", description: "今天新增询盘" },
        pendingFollowups: { title: "待跟进客户", description: "未完成提醒" },
        quotationsToday: { title: "今日报价", description: "今天创建的报价" },
        wonCustomers: { title: "已成交客户", description: "已成交客户数" },
        revenueAmount: { title: "成交金额", description: "已接受报价金额" }
      },
      salesFunnel: "销售漏斗",
      todayReminders: "今日提醒",
      recentActivities: "最近活动"
    },
    customerStages: {
      new_inquiry: "新询盘",
      contacted: "已联系",
      quoted: "已报价",
      sampling: "样品中",
      negotiation: "谈判中",
      won: "已成交"
    },
    reminderTypes: { followup: "跟进提醒", quotation: "报价提醒", sample: "样品提醒", expiry: "到期提醒" },
    quotationStatuses: { draft: "草稿", sent: "已发送", accepted: "已接受", rejected: "已拒绝", expired: "已过期" },
    customerTable: {
      create: "新增客户",
      createTitle: "新增客户",
      createDescription: "录入公司、联系人、来源、阶段和备注。",
      searchPlaceholder: "搜索客户...",
      headers: {
        companyName: "公司名称",
        contactName: "联系人",
        country: "国家",
        industry: "行业",
        companyType: "公司类型",
        whatsapp: "WhatsApp",
        email: "邮箱",
        source: "来源",
        grade: "等级",
        stage: "阶段",
        lastContactedAt: "最近联系"
      },
      actions: "操作",
      viewDetail: "查看详情",
      delete: "删除",
      empty: "暂无客户",
      pageOf: "第 {page} / {total} 页",
      previous: "上一页",
      next: "下一页",
      deleteFailed: "删除失败",
      deleteSuccess: "客户已删除"
    },
    customerDetail: {
      back: "返回客户",
      lastContact: "最近联系",
      edit: "编辑",
      editTitle: "编辑客户",
      editDescription: "更新客户基本信息和销售阶段。",
      basicInfo: "基本信息",
      stage: "阶段",
      grade: "客户等级",
      companyType: "公司类型",
      source: "来源",
      notes: "备注",
      contacts: "联系人",
      primary: "主要",
      followups: "跟进记录",
      quotationRecords: "报价记录",
      attachments: "附件",
      addFollowup: "添加跟进",
      customerAttachments: "客户附件"
    },
    kanban: { noContact: "无联系人", lastContact: "最近联系", updateFailed: "阶段更新失败", updateSuccess: "阶段已更新" },
    quotations: {
      historyTitle: "历史报价",
      create: "新建报价",
      createTitle: "创建报价",
      createDescription: "选择客户、产品、数量和单价，系统自动计算金额。",
      quotationNo: "报价单号",
      customer: "客户",
      status: "状态",
      amount: "金额",
      validUntil: "有效期",
      createdAt: "创建时间",
      copy: "复制报价",
      downloadPdf: "下载 PDF",
      copyFailed: "复制失败",
      copySuccess: "报价已复制"
    },
    reminders: {
      create: "新增提醒",
      createTitle: "新增提醒",
      createDescription: "创建客户跟进、报价、样品或到期提醒。",
      updateFailed: "更新失败",
      markDoneSuccess: "提醒已完成",
      createFailed: "创建失败",
      createSuccess: "提醒已创建",
      title: "标题",
      customer: "客户",
      type: "类型",
      dueAt: "到期时间",
      save: "保存提醒"
    },
    scriptLibrary: {
      searchPlaceholder: "搜索标题、标签、中文或印尼语内容...",
      allCategories: "全部模板",
      totalTemplates: "模板",
      favoriteTemplates: "收藏",
      categoryCount: "分类",
      copied: "话术已复制",
      favoriteAria: "收藏模板",
      chinese: "中文",
      indonesian: "印尼语",
      copy: "复制",
      empty: "没有匹配的话术"
    }
  },
  en: {
    languageNames: { en: "English", zh: "中文", id: "Bahasa Indonesia" },
    nav: {
      dashboard: "Dashboard",
      customers: "Customers",
      kanban: "Kanban",
      quotations: "Quotations",
      products: "Products",
      scripts: "Scripts",
      files: "Files",
      reminders: "Reminders",
      analytics: "Analytics",
      settings: "Settings",
      pipeline: "Pipeline",
      inquiries: "Inquiries",
      orders: "Orders",
      production: "Production",
      afterSales: "After Sales",
      aiAnalysis: "AI Analysis",
      aiChat: "AI Assistant",
      knowledgeBase: "Knowledge Base",
      workflows: "Workflow",
      worldMap: "World Map",
      boss: "Boss Dashboard"
    },
    roles: {
      admin: "Admin",
      boss: "Boss",
      manager: "Manager",
      sales: "Sales",
      finance: "Finance",
      production: "Production",
      warehouse: "Warehouse",
      logistics: "Logistics",
      customer_service: "Customer Service"
    },
    topbar: {
      searchPlaceholder: "Search customers, quotes, products...",
      notifications: "Notifications",
      changeLanguage: "Change language",
      toggleTheme: "Toggle dark mode",
      openNavigation: "Open navigation"
    },
    userMenu: { fallbackName: "HOMY User", avatarAlt: "user avatar", profile: "Profile", signOut: "Sign out" },
    auth: {
      eyebrow: "HOMY sponge factory",
      headline: "Customers, quotations, and sales workflows in one workspace.",
      description: "A production CRM for factory sales, export teams, managers, and owners.",
      aiNote: "AI extension hooks are reserved; production data requires Supabase.",
      signInTitle: "Sign in",
      signInDescription: "Use your HOMY sales account to continue.",
      email: "Email",
      password: "Password",
      forgotPassword: "Forgot?",
      signIn: "Sign in",
      missingEnvTitle: "Production config missing",
      missingEnvDescription: "Supabase env values are required before this CRM can be used.",
      loginFailed: "Login failed",
      resetTitle: "Reset password",
      resetDescription: "We will send a secure reset link to your email.",
      sendResetLink: "Send reset link",
      resetMissingEnv: "Supabase is not configured",
      resetFailed: "Reset failed",
      resetSuccessTitle: "Check your email",
      resetSuccessDescription: "The password reset link has been sent.",
      updateTitle: "Update password",
      updateDescription: "Choose a new password for your HOMY CRM account.",
      newPassword: "New password",
      updatePassword: "Update password",
      updateFailed: "Update failed",
      updateSuccess: "Password updated"
    },
    pages: withV2Pages(enPages, "en"),
    dashboard: {
      metrics: {
        totalCustomers: { title: "Total customers", description: "All active customers" },
        newCustomersToday: { title: "New today", description: "New inquiries today" },
        pendingFollowups: { title: "Pending follow-ups", description: "Open reminders" },
        quotationsToday: { title: "Quotes today", description: "Quotations created today" },
        wonCustomers: { title: "Won customers", description: "Closed customers" },
        revenueAmount: { title: "Revenue", description: "Accepted quotations" }
      },
      salesFunnel: "Sales funnel",
      todayReminders: "Today reminders",
      recentActivities: "Recent activities"
    },
    customerStages: {
      new_inquiry: "New inquiry",
      contacted: "Contacted",
      quoted: "Quoted",
      sampling: "Sampling",
      negotiation: "Negotiation",
      won: "Won"
    },
    reminderTypes: { followup: "Follow-up", quotation: "Quotation", sample: "Sample", expiry: "Expiry" },
    quotationStatuses: { draft: "Draft", sent: "Sent", accepted: "Accepted", rejected: "Rejected", expired: "Expired" },
    customerTable: {
      create: "New customer",
      createTitle: "Create customer",
      createDescription: "Add company, contact, source, stage, and notes.",
      searchPlaceholder: "Search customers...",
      headers: {
        companyName: "Company",
        contactName: "Contact",
        country: "Country",
        industry: "Industry",
        companyType: "Company type",
        whatsapp: "WhatsApp",
        email: "Email",
        source: "Source",
        grade: "Grade",
        stage: "Stage",
        lastContactedAt: "Last contact"
      },
      actions: "Actions",
      viewDetail: "View detail",
      delete: "Delete",
      empty: "No customers",
      pageOf: "Page {page} of {total}",
      previous: "Previous",
      next: "Next",
      deleteFailed: "Delete failed",
      deleteSuccess: "Customer deleted"
    },
    customerDetail: {
      back: "Back to customers",
      lastContact: "Last contact",
      edit: "Edit",
      editTitle: "Edit customer",
      editDescription: "Update customer information and sales stage.",
      basicInfo: "Basic information",
      stage: "Stage",
      grade: "Grade",
      companyType: "Company type",
      source: "Source",
      notes: "Notes",
      contacts: "Contacts",
      primary: "Primary",
      followups: "Follow-ups",
      quotationRecords: "Quotation records",
      attachments: "Attachments",
      addFollowup: "Add follow-up",
      customerAttachments: "Customer attachments"
    },
    kanban: { noContact: "No contact", lastContact: "Last contact", updateFailed: "Stage update failed", updateSuccess: "Stage updated" },
    quotations: {
      historyTitle: "Quotation history",
      create: "New quotation",
      createTitle: "Create quotation",
      createDescription: "Select customer, product, quantity, and unit price.",
      quotationNo: "Quotation No.",
      customer: "Customer",
      status: "Status",
      amount: "Amount",
      validUntil: "Valid until",
      createdAt: "Created at",
      copy: "Copy",
      downloadPdf: "Download PDF",
      copyFailed: "Copy failed",
      copySuccess: "Quotation copied"
    },
    reminders: {
      create: "New reminder",
      createTitle: "Create reminder",
      createDescription: "Create follow-up, quotation, sample, or expiry reminders.",
      updateFailed: "Update failed",
      markDoneSuccess: "Reminder completed",
      createFailed: "Create failed",
      createSuccess: "Reminder created",
      title: "Title",
      customer: "Customer",
      type: "Type",
      dueAt: "Due time",
      save: "Save reminder"
    },
    scriptLibrary: {
      searchPlaceholder: "Search title, tag, Chinese, or Indonesian content...",
      allCategories: "All templates",
      totalTemplates: "Templates",
      favoriteTemplates: "Favorites",
      categoryCount: "Categories",
      copied: "Script copied",
      favoriteAria: "Favorite template",
      chinese: "Chinese",
      indonesian: "Indonesian",
      copy: "Copy",
      empty: "No matching scripts"
    }
  },
  id: {
    languageNames: { en: "English", zh: "中文", id: "Bahasa Indonesia" },
    nav: {
      dashboard: "Dashboard",
      customers: "Pelanggan",
      kanban: "Kanban",
      quotations: "Penawaran",
      products: "Produk",
      scripts: "Skrip",
      files: "File",
      reminders: "Reminder",
      analytics: "Analitik",
      settings: "Pengaturan",
      pipeline: "Pipeline",
      inquiries: "Inquiry",
      orders: "Order",
      production: "Produksi",
      afterSales: "After Sales",
      aiAnalysis: "Analisis AI",
      aiChat: "AI Assistant",
      knowledgeBase: "Knowledge Base",
      workflows: "Workflow",
      worldMap: "Peta Dunia",
      boss: "Dashboard Boss"
    },
    roles: {
      admin: "Admin",
      boss: "Boss",
      manager: "Manajer",
      sales: "Sales",
      finance: "Finance",
      production: "Produksi",
      warehouse: "Gudang",
      logistics: "Logistik",
      customer_service: "Customer Service"
    },
    topbar: {
      searchPlaceholder: "Cari pelanggan, penawaran, produk...",
      notifications: "Notifikasi",
      changeLanguage: "Ganti bahasa",
      toggleTheme: "Ganti mode gelap",
      openNavigation: "Buka navigasi"
    },
    userMenu: { fallbackName: "Pengguna HOMY", avatarAlt: "avatar pengguna", profile: "Profil", signOut: "Keluar" },
    auth: {
      eyebrow: "Pabrik spons HOMY",
      headline: "Pelanggan, quotation, dan workflow sales dalam satu workspace.",
      description: "CRM produksi untuk sales pabrik, tim ekspor, manager, dan owner.",
      aiNote: "Hook AI disiapkan; data produksi wajib menggunakan Supabase.",
      signInTitle: "Masuk",
      signInDescription: "Gunakan akun sales HOMY untuk melanjutkan.",
      email: "Email",
      password: "Kata sandi",
      forgotPassword: "Lupa?",
      signIn: "Masuk",
      missingEnvTitle: "Konfigurasi produksi belum lengkap",
      missingEnvDescription: "Environment Supabase wajib diisi sebelum CRM digunakan.",
      loginFailed: "Login gagal",
      resetTitle: "Reset kata sandi",
      resetDescription: "Kami akan mengirim tautan reset aman ke email Anda.",
      sendResetLink: "Kirim tautan reset",
      resetMissingEnv: "Supabase belum dikonfigurasi",
      resetFailed: "Reset gagal",
      resetSuccessTitle: "Cek email Anda",
      resetSuccessDescription: "Tautan reset kata sandi sudah dikirim.",
      updateTitle: "Ubah kata sandi",
      updateDescription: "Pilih kata sandi baru untuk akun HOMY CRM Anda.",
      newPassword: "Kata sandi baru",
      updatePassword: "Ubah kata sandi",
      updateFailed: "Update gagal",
      updateSuccess: "Kata sandi diubah"
    },
    pages: withV2Pages(idPages, "id"),
    dashboard: {
      metrics: {
        totalCustomers: { title: "Total pelanggan", description: "Semua pelanggan aktif" },
        newCustomersToday: { title: "Baru hari ini", description: "Inquiry baru hari ini" },
        pendingFollowups: { title: "Follow-up pending", description: "Reminder open" },
        quotationsToday: { title: "Quote hari ini", description: "Quotation dibuat hari ini" },
        wonCustomers: { title: "Pelanggan won", description: "Pelanggan deal" },
        revenueAmount: { title: "Revenue", description: "Quotation diterima" }
      },
      salesFunnel: "Sales funnel",
      todayReminders: "Reminder hari ini",
      recentActivities: "Aktivitas terbaru"
    },
    customerStages: {
      new_inquiry: "Inquiry baru",
      contacted: "Dihubungi",
      quoted: "Sudah quote",
      sampling: "Sample",
      negotiation: "Negosiasi",
      won: "Deal"
    },
    reminderTypes: { followup: "Follow-up", quotation: "Quotation", sample: "Sample", expiry: "Expiry" },
    quotationStatuses: { draft: "Draft", sent: "Terkirim", accepted: "Diterima", rejected: "Ditolak", expired: "Expired" },
    customerTable: {
      create: "Pelanggan baru",
      createTitle: "Buat pelanggan",
      createDescription: "Tambah perusahaan, kontak, sumber, tahap, dan catatan.",
      searchPlaceholder: "Cari pelanggan...",
      headers: {
        companyName: "Perusahaan",
        contactName: "Kontak",
        country: "Negara",
        industry: "Industri",
        companyType: "Tipe perusahaan",
        whatsapp: "WhatsApp",
        email: "Email",
        source: "Sumber",
        grade: "Grade",
        stage: "Tahap",
        lastContactedAt: "Kontak terakhir"
      },
      actions: "Aksi",
      viewDetail: "Lihat detail",
      delete: "Hapus",
      empty: "Belum ada pelanggan",
      pageOf: "Halaman {page} dari {total}",
      previous: "Sebelumnya",
      next: "Berikutnya",
      deleteFailed: "Hapus gagal",
      deleteSuccess: "Pelanggan dihapus"
    },
    customerDetail: {
      back: "Kembali ke pelanggan",
      lastContact: "Kontak terakhir",
      edit: "Edit",
      editTitle: "Edit pelanggan",
      editDescription: "Update informasi pelanggan dan tahap sales.",
      basicInfo: "Informasi dasar",
      stage: "Tahap",
      grade: "Grade",
      companyType: "Tipe perusahaan",
      source: "Sumber",
      notes: "Catatan",
      contacts: "Kontak",
      primary: "Utama",
      followups: "Follow-up",
      quotationRecords: "Riwayat quotation",
      attachments: "Lampiran",
      addFollowup: "Tambah follow-up",
      customerAttachments: "Lampiran pelanggan"
    },
    kanban: { noContact: "Tidak ada kontak", lastContact: "Kontak terakhir", updateFailed: "Update tahap gagal", updateSuccess: "Tahap diupdate" },
    quotations: {
      historyTitle: "Riwayat quotation",
      create: "Quotation baru",
      createTitle: "Buat quotation",
      createDescription: "Pilih pelanggan, produk, quantity, dan unit price.",
      quotationNo: "No. quotation",
      customer: "Pelanggan",
      status: "Status",
      amount: "Amount",
      validUntil: "Valid sampai",
      createdAt: "Dibuat",
      copy: "Salin",
      downloadPdf: "Download PDF",
      copyFailed: "Salin gagal",
      copySuccess: "Quotation disalin"
    },
    reminders: {
      create: "Reminder baru",
      createTitle: "Buat reminder",
      createDescription: "Buat reminder follow-up, quotation, sample, atau expiry.",
      updateFailed: "Update gagal",
      markDoneSuccess: "Reminder selesai",
      createFailed: "Buat gagal",
      createSuccess: "Reminder dibuat",
      title: "Judul",
      customer: "Pelanggan",
      type: "Tipe",
      dueAt: "Due time",
      save: "Simpan reminder"
    },
    scriptLibrary: {
      searchPlaceholder: "Cari judul, tag, konten Mandarin, atau Indonesia...",
      allCategories: "Semua template",
      totalTemplates: "Template",
      favoriteTemplates: "Favorit",
      categoryCount: "Kategori",
      copied: "Skrip disalin",
      favoriteAria: "Favoritkan template",
      chinese: "Mandarin",
      indonesian: "Indonesia",
      copy: "Salin",
      empty: "Tidak ada skrip yang cocok"
    }
  }
};

export function getDictionary(locale: Locale) {
  return dictionaries[locale] ?? dictionaries.zh;
}

export function formatDictionaryString(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce((result, [key, value]) => result.replace(`{${key}}`, String(value)), template);
}
