import type {
  CommunicationMethod,
  CompanyType,
  CustomerGrade,
  CustomerStage,
  QuotationStatus,
  ReminderType,
  UserRole
} from "@/types/crm";

export const appName = "HOMY AI Sales CRM";
export const appVersion = "V2.0";

export const roles: Array<{ value: UserRole; label: string; description: string }> = [
  { value: "admin", label: "Admin", description: "Full data and system access" },
  { value: "boss", label: "Boss", description: "Executive cockpit and all-company visibility" },
  { value: "manager", label: "Manager", description: "Team sales and reporting access" },
  { value: "sales", label: "Sales", description: "Own customers and sales workflows" },
  { value: "finance", label: "Finance", description: "Invoices, payments, and receivable data" },
  { value: "production", label: "Production", description: "Production plans and work order progress" },
  { value: "warehouse", label: "Warehouse", description: "Inventory, packing, and outbound preparation" },
  { value: "logistics", label: "Logistics", description: "Shipment, documents, and delivery tracking" },
  { value: "customer_service", label: "Customer Service", description: "After sales cases and satisfaction follow-up" }
];

export const customerStages: Array<{ value: CustomerStage; label: string; color: string }> = [
  { value: "new_inquiry", label: "新询盘", color: "bg-sky-500" },
  { value: "contacted", label: "已联系", color: "bg-blue-500" },
  { value: "quoted", label: "已报价", color: "bg-violet-500" },
  { value: "sampling", label: "样品中", color: "bg-amber-500" },
  { value: "negotiation", label: "谈判中", color: "bg-orange-500" },
  { value: "won", label: "已成交", color: "bg-emerald-500" }
];

export const customerGrades: CustomerGrade[] = ["A", "B", "C"];

export const companyTypes: Array<{ value: CompanyType; label: string }> = [
  { value: "manufacturer", label: "Manufacturer" },
  { value: "trader", label: "Trader" },
  { value: "brand", label: "Brand" },
  { value: "retailer", label: "Retailer" },
  { value: "other", label: "Other" }
];

export const communicationMethods: Array<{ value: CommunicationMethod; label: string }> = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "phone", label: "电话" },
  { value: "email", label: "邮件" },
  { value: "meeting", label: "面谈" }
];

export const quotationStatuses: Array<{ value: QuotationStatus; label: string }> = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "expired", label: "Expired" }
];

export const reminderTypes: Array<{ value: ReminderType; label: string }> = [
  { value: "followup", label: "跟进提醒" },
  { value: "quotation", label: "报价提醒" },
  { value: "sample", label: "样品提醒" },
  { value: "expiry", label: "到期提醒" }
];

export const customerSources = ["Alibaba", "WhatsApp", "Website", "Referral", "Exhibition", "Instagram", "Manual"];

export const scriptCategoryNames = ["首次开发", "报价跟进", "催单", "客户维护", "价格异议"];

export const aiExtensionPoints = [
  "ai.script.generate",
  "ai.customer.analyze",
  "ai.quote.optimize",
  "integration.whatsapp.send"
] as const;
