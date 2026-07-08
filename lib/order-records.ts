import type { LocalizedText } from "@/data/ai-crm";
import type { CustomerSummary, Quotation } from "@/types/crm";

export type CrmOrderRecord = {
  id: string;
  customerId: string;
  customer: string;
  quotationId: string;
  quotation: string;
  amount: number;
  currency: string;
  status: LocalizedText;
  progress: number;
  steps: string[];
};

export const orderLifecycleSteps = ["Quotation", "PI", "Contract", "Production", "Packing", "Shipment", "Invoice", "Payment", "After Sales"];

const createdStatus: LocalizedText = {
  zh: "已创建",
  en: "Created",
  id: "Dibuat"
};

export function makeOrderId(quotationNo: string) {
  return quotationNo.startsWith("HOMY-") ? `ORD-${quotationNo.slice(5)}` : `ORD-${quotationNo}`;
}

export function buildOrderRecords(quotations: Quotation[], customers: CustomerSummary[]) {
  const customerMap = new Map(customers.map((customer) => [customer.id, customer]));

  return quotations
    .filter((quotation) => quotation.status === "accepted")
    .map((quotation) => {
      const customer = customerMap.get(quotation.customer_id);
      return {
        id: makeOrderId(quotation.quotation_no),
        customerId: quotation.customer_id,
        customer: customer?.company_name ?? quotation.customer_id,
        quotationId: quotation.id,
        quotation: quotation.quotation_no,
        amount: Number(quotation.total_amount ?? 0),
        currency: quotation.currency,
        status: createdStatus,
        progress: 12,
        steps: orderLifecycleSteps
      };
    });
}

export function findOrderRecord(orderId: string, quotations: Quotation[], customers: CustomerSummary[]) {
  return buildOrderRecords(quotations, customers).find((order) => order.id === orderId);
}
