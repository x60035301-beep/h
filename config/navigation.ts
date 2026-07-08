import {
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  Boxes,
  BrainCircuit,
  ClipboardList,
  Crown,
  Factory,
  FileText,
  GitBranch,
  Globe2,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  MessageSquareText,
  Network,
  PanelTop,
  Settings,
  TableProperties,
  Users
} from "lucide-react";

import type { Locale } from "@/types/crm";

type NavigationLabel = Record<Locale, string>;

export const navigationItems = [
  { href: "/dashboard", key: "dashboard", icon: LayoutDashboard, label: { zh: "仪表盘", en: "Dashboard", id: "Dasbor" } },
  { href: "/boss", key: "boss", icon: Crown, label: { zh: "老板驾驶舱", en: "Boss Dashboard", id: "Dasbor Owner" } },
  { href: "/ai-analysis", key: "aiAnalysis", icon: BrainCircuit, label: { zh: "AI 分析", en: "AI Analysis", id: "Analisis AI" } },
  { href: "/customers", key: "customers", icon: Users, label: { zh: "客户管理", en: "Customers", id: "Pelanggan" } },
  { href: "/pipeline", key: "pipeline", icon: GitBranch, label: { zh: "销售 Pipeline", en: "Sales Pipeline", id: "Pipeline Sales" } },
  { href: "/kanban", key: "kanban", icon: PanelTop, label: { zh: "Kanban 客户", en: "Kanban", id: "Kanban Pelanggan" } },
  { href: "/inquiries", key: "inquiries", icon: Inbox, label: { zh: "询盘管理", en: "Inquiries", id: "Inquiry" } },
  { href: "/quotations", key: "quotations", icon: FileText, label: { zh: "报价管理", en: "Quotations", id: "Penawaran" } },
  { href: "/orders", key: "orders", icon: ClipboardList, label: { zh: "订单管理", en: "Orders", id: "Order" } },
  { href: "/production", key: "production", icon: Factory, label: { zh: "生产管理", en: "Production", id: "Produksi" } },
  { href: "/after-sales", key: "afterSales", icon: LifeBuoy, label: { zh: "售后管理", en: "After Sales", id: "After Sales" } },
  { href: "/products", key: "products", icon: Boxes, label: { zh: "产品管理", en: "Products", id: "Produk" } },
  { href: "/scripts", key: "scripts", icon: MessageSquareText, label: { zh: "销售话术", en: "Sales Scripts", id: "Skrip Penjualan" } },
  { href: "/knowledge-base", key: "knowledgeBase", icon: BookOpen, label: { zh: "知识库", en: "Knowledge Base", id: "Knowledge Base" } },
  { href: "/files", key: "files", icon: TableProperties, label: { zh: "文件中心", en: "Files", id: "Pusat File" } },
  { href: "/workflows", key: "workflows", icon: Network, label: { zh: "自动化 Workflow", en: "Workflows", id: "Workflow" } },
  { href: "/ai-chat", key: "aiChat", icon: Bot, label: { zh: "AI 助手", en: "AI Assistant", id: "Asisten AI" } },
  { href: "/world-map", key: "worldMap", icon: Globe2, label: { zh: "世界地图", en: "World Map", id: "Peta Dunia" } },
  { href: "/reminders", key: "reminders", icon: Bell, label: { zh: "提醒系统", en: "Reminders", id: "Pengingat" } },
  { href: "/analytics", key: "analytics", icon: BarChart3, label: { zh: "数据统计", en: "Analytics", id: "Analitik" } },
  { href: "/settings", key: "settings", icon: Settings, label: { zh: "系统设置", en: "Settings", id: "Pengaturan" } }
] as const;

export type NavigationKey = (typeof navigationItems)[number]["key"];
export type NavigationItem = (typeof navigationItems)[number] & { label: NavigationLabel };

export function getNavigationLabel(item: NavigationItem, locale: Locale, dictionaryLabel?: string) {
  return dictionaryLabel ?? item.label[locale] ?? item.label.en;
}
