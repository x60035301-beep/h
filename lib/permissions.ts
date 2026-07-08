import type { CustomerSummary, UserRole } from "@/types/crm";

export type SessionProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
};

export function canManageAll(role: UserRole | undefined) {
  return role === "admin" || role === "boss" || role === "manager";
}

export function canManageSettings(role: UserRole | undefined) {
  return role === "admin" || role === "boss";
}

export function canAccessCustomer(profile: SessionProfile | null, customer: Pick<CustomerSummary, "owner_id">) {
  if (!profile) return false;
  if (canManageAll(profile.role)) return true;
  return customer.owner_id === profile.id;
}

export function canDelete(role: UserRole | undefined) {
  return role === "admin" || role === "boss" || role === "manager";
}
