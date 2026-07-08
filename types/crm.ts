export type Locale = "en" | "zh" | "id";

export type UserRole =
  | "admin"
  | "boss"
  | "manager"
  | "sales"
  | "finance"
  | "production"
  | "warehouse"
  | "logistics"
  | "customer_service";

export type CustomerStage =
  | "new_inquiry"
  | "contacted"
  | "quoted"
  | "sampling"
  | "negotiation"
  | "won";

export type CustomerGrade = "A" | "B" | "C";

export type CompanyType = "manufacturer" | "trader" | "brand" | "retailer" | "other";

export type CommunicationMethod = "whatsapp" | "phone" | "email" | "meeting";

export type QuotationStatus = "draft" | "sent" | "accepted" | "rejected" | "expired";

export type ReminderType = "followup" | "quotation" | "sample" | "expiry";

export type AttachmentKind = "pdf" | "image" | "video" | "other";

export type ActivityType =
  | "customer_created"
  | "customer_updated"
  | "followup_created"
  | "quotation_created"
  | "stage_changed"
  | "attachment_uploaded"
  | "task_created"
  | "reminder_sent"
  | "email_sent"
  | "sales_assigned"
  | "manager_escalated"
  | "workflow_run";

export type CustomerSummary = {
  id: string;
  company_name: string;
  contact_name: string | null;
  country: string | null;
  industry: string | null;
  company_type: CompanyType | null;
  whatsapp: string | null;
  email: string | null;
  source: string | null;
  grade: CustomerGrade;
  stage: CustomerStage;
  last_contacted_at: string | null;
  owner_id: string | null;
  created_at: string;
};

export type Contact = {
  id: string;
  customer_id: string;
  name: string;
  title: string | null;
  email: string | null;
  whatsapp: string | null;
  phone: string | null;
  is_primary: boolean;
};

export type Followup = {
  id: string;
  customer_id: string;
  method: CommunicationMethod;
  followed_at: string;
  content: string;
  next_step: string | null;
  created_by: string | null;
};

export type Quotation = {
  id: string;
  quotation_no: string;
  customer_id: string;
  status: QuotationStatus;
  currency: string;
  total_amount: number;
  notes: string | null;
  valid_until: string | null;
  created_at: string;
};

export type QuotationItem = {
  id: string;
  quotation_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  amount: number;
  notes: string | null;
};

export type Product = {
  id: string;
  name: string;
  category_id: string | null;
  category_name?: string | null;
  specification: string | null;
  density: string | null;
  size: string | null;
  price: number;
  stock: number | null;
  image_url: string | null;
  pdf_url: string | null;
};

export type Script = {
  id: string;
  title: string;
  category_id: string | null;
  category_name?: string | null;
  content_zh: string;
  content_id: string;
  tags: string[];
  is_favorite?: boolean;
};

export type Attachment = {
  id: string;
  customer_id: string | null;
  product_id: string | null;
  file_name: string;
  file_type: AttachmentKind;
  file_url: string;
  size_bytes: number | null;
  created_at: string;
};

export type Reminder = {
  id: string;
  customer_id: string | null;
  title: string;
  type: ReminderType;
  due_at: string;
  is_done: boolean;
};

export type Activity = {
  id: string;
  type: ActivityType;
  title: string;
  description: string | null;
  created_at: string;
};

export type DashboardStats = {
  totalCustomers: number;
  newCustomersToday: number;
  pendingFollowups: number;
  quotationsToday: number;
  wonCustomers: number;
  revenueAmount: number;
};

export type StageCount = {
  stage: CustomerStage;
  count: number;
  amount?: number;
};

export type CompanySettings = {
  id: string;
  logo_url: string | null;
  company_name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
};

export type AppUser = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: UserRole;
};
