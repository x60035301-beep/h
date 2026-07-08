import type {
  ActivityType,
  AttachmentKind,
  CommunicationMethod,
  CompanyType,
  CustomerGrade,
  CustomerStage,
  QuotationStatus,
  ReminderType,
  UserRole
} from "@/types/crm";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Enums: {
      app_role: UserRole;
      customer_stage: CustomerStage;
      customer_grade: CustomerGrade;
      company_type: CompanyType;
      communication_method: CommunicationMethod;
      quotation_status: QuotationStatus;
      attachment_kind: AttachmentKind;
      reminder_type: ReminderType;
      activity_type: ActivityType;
    };
    Tables: {
      roles: {
        Row: {
          id: string;
          code: UserRole;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          code: UserRole;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["roles"]["Insert"]>;
      };
      users: {
        Row: {
          id: string;
          role_id: string;
          full_name: string | null;
          avatar_url: string | null;
          email: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id: string;
          role_id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          email?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      customers: {
        Row: {
          id: string;
          owner_id: string | null;
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
          notes: string | null;
          last_contacted_at: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["customers"]["Row"]> & {
          company_name: string;
        };
        Update: Partial<Database["public"]["Tables"]["customers"]["Insert"]>;
      };
      contacts: {
        Row: {
          id: string;
          customer_id: string;
          name: string;
          title: string | null;
          email: string | null;
          whatsapp: string | null;
          phone: string | null;
          is_primary: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["contacts"]["Row"]> & {
          customer_id: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["contacts"]["Insert"]>;
      };
      followups: {
        Row: {
          id: string;
          customer_id: string;
          created_by: string | null;
          method: CommunicationMethod;
          followed_at: string;
          content: string;
          next_step: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["followups"]["Row"]> & {
          customer_id: string;
          method: CommunicationMethod;
          content: string;
        };
        Update: Partial<Database["public"]["Tables"]["followups"]["Insert"]>;
      };
      products: {
        Row: {
          id: string;
          category_id: string | null;
          name: string;
          specification: string | null;
          density: string | null;
          size: string | null;
          price: number;
          stock: number | null;
          image_url: string | null;
          pdf_url: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["products"]["Row"]> & {
          name: string;
          price?: number;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      };
      product_categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["product_categories"]["Row"]> & {
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_categories"]["Insert"]>;
      };
      quotations: {
        Row: {
          id: string;
          quotation_no: string;
          customer_id: string;
          created_by: string | null;
          status: QuotationStatus;
          currency: string;
          total_amount: number;
          notes: string | null;
          valid_until: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["quotations"]["Row"]> & {
          quotation_no: string;
          customer_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["quotations"]["Insert"]>;
      };
      quotation_items: {
        Row: {
          id: string;
          quotation_id: string;
          product_id: string | null;
          product_name: string;
          quantity: number;
          unit_price: number;
          amount: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["quotation_items"]["Row"]> & {
          quotation_id: string;
          product_name: string;
          quantity: number;
          unit_price: number;
        };
        Update: Partial<Database["public"]["Tables"]["quotation_items"]["Insert"]>;
      };
      scripts: {
        Row: {
          id: string;
          category_id: string | null;
          title: string;
          content_zh: string;
          content_id: string;
          tags: string[];
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["scripts"]["Row"]> & {
          title: string;
          content_zh: string;
          content_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["scripts"]["Insert"]>;
      };
      script_categories: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["script_categories"]["Row"]> & {
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["script_categories"]["Insert"]>;
      };
      attachments: {
        Row: {
          id: string;
          customer_id: string | null;
          product_id: string | null;
          uploaded_by: string | null;
          file_name: string;
          file_type: AttachmentKind;
          file_url: string;
          storage_path: string | null;
          size_bytes: number | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["attachments"]["Row"]> & {
          file_name: string;
          file_type: AttachmentKind;
          file_url: string;
        };
        Update: Partial<Database["public"]["Tables"]["attachments"]["Insert"]>;
      };
      reminders: {
        Row: {
          id: string;
          customer_id: string | null;
          assigned_to: string | null;
          title: string;
          type: ReminderType;
          due_at: string;
          is_done: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["reminders"]["Row"]> & {
          title: string;
          type: ReminderType;
          due_at: string;
        };
        Update: Partial<Database["public"]["Tables"]["reminders"]["Insert"]>;
      };
      activities: {
        Row: {
          id: string;
          actor_id: string | null;
          customer_id: string | null;
          type: ActivityType;
          title: string;
          description: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["activities"]["Row"]> & {
          type: ActivityType;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["activities"]["Insert"]>;
      };
      settings: {
        Row: {
          id: string;
          logo_url: string | null;
          company_name: string;
          phone: string | null;
          email: string | null;
          address: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["settings"]["Row"]> & {
          company_name: string;
        };
        Update: Partial<Database["public"]["Tables"]["settings"]["Insert"]>;
      };
    };
  };
};

export type TableName = keyof Database["public"]["Tables"];
export type Tables<T extends TableName> = Database["public"]["Tables"][T]["Row"];
export type Inserts<T extends TableName> = Database["public"]["Tables"][T]["Insert"];
export type Updates<T extends TableName> = Database["public"]["Tables"][T]["Update"];
