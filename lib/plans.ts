export type PlanId = "free" | "plus" | "scale";

export interface Plan {
  id: PlanId;
  name: string;
  price: string;
  blurb: string;
  traces: number; // per month
  aiCalls: number; // per month (judge, playground, insights)
  retentionDays: number;
  examplesPerDataset: number;
  features: string[];
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Developer",
    price: "$0",
    blurb: "For teams validating their first production agent.",
    traces: 5_000,
    aiCalls: 100,
    retentionDays: 14,
    examplesPerDataset: 50,
    features: [
      "5,000 traces / month",
      "14-day trace retention",
      "100 AI-assisted runs / month",
      "Datasets up to 50 examples",
      "Prompt versioning & playground",
    ],
  },
  plus: {
    id: "plus",
    name: "Team",
    price: "$47",
    blurb: "For operations and product teams running agents in production.",
    traces: 50_000,
    aiCalls: 2_000,
    retentionDays: 60,
    examplesPerDataset: 500,
    features: [
      "50,000 traces / month",
      "60-day trace retention",
      "2,000 AI-assisted runs / month",
      "Datasets up to 500 examples",
      "All evaluators incl. LLM judge",
    ],
  },
  scale: {
    id: "scale",
    name: "Scale",
    price: "$97",
    blurb: "For enterprises running agents at high volume.",
    traces: 500_000,
    aiCalls: 20_000,
    retentionDays: 180,
    examplesPerDataset: 5_000,
    features: [
      "500,000 traces / month",
      "180-day trace retention",
      "20,000 AI-assisted runs / month",
      "Datasets up to 5,000 examples",
      "Priority support",
    ],
  },
};

export function planFor(id: string | null | undefined, status?: string | null): Plan {
  // Paid limits apply only while the subscription is verified active.
  if (id && id !== "free" && status === "active" && id in PLANS) return PLANS[id as PlanId];
  return PLANS.free;
}

export const paymentLinks: Record<"plus" | "scale", string> = {
  plus: process.env.NEXT_PUBLIC_PAYMENT_LINK_PLUS ?? "",
  scale: process.env.NEXT_PUBLIC_PAYMENT_LINK_SCALE ?? "",
};

/** Append the org id so the provider echoes it back in the webhook (Stripe: client_reference_id). */
export function checkoutUrl(plan: "plus" | "scale", orgId?: string): string | null {
  const base = paymentLinks[plan];
  if (!base) return null;
  if (!orgId) return base;
  const u = new URL(base);
  u.searchParams.set("client_reference_id", orgId);
  return u.toString();
}
