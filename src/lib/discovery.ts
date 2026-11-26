import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export const discoverySchema = z.object({
  q: z.string().max(200).optional(), category: z.string().optional(), type: z.string().optional(),
  remote: z.boolean().optional(), kind: z.string().optional(), experience: z.string().optional(),
  region: z.string().max(100).optional(), workplace: z.string().optional(), eligibility: z.string().optional(),
  currency: z.string().max(10).optional(), pay: z.string().optional(),
  min: z.coerce.number().nonnegative().optional(), max: z.coerce.number().nonnegative().optional(),
  days: z.coerce.number().int().min(1).max(365).optional(),
  sort: z.enum(["newest", "salary"]).optional(), page: z.coerce.number().int().min(1).max(10000).optional(),
  view: z.enum(["all", "saved", "hidden"]).optional(),
});
export type DiscoveryFilters = z.infer<typeof discoverySchema>;
export type Listing = Database["public"]["Functions"]["search_listings"]["Returns"][number];
export function discoveryOptions(filters: DiscoveryFilters, userId?: string, limit = 20) {
  return queryOptions({
    queryKey: ["discovery", filters, userId ?? "public", limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("discover_jobs", { _filters: { ...filters, limit } });
      if (error) throw error;
      if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Invalid job search response");
      return { jobs: (data["jobs"] ?? []) as unknown as Listing[], total: Number(data["total"] ?? 0) };
    },
  });
}

export function salaryLabel(j: Pick<Listing, "salary_min" | "salary_max" | "currency" | "pay_unit">) {
  const amounts = [j.salary_min, j.salary_max].filter((n): n is number => n != null && n > 0);
  if (!amounts.length) return null;
  return `${j.currency ?? ""} ${[...new Set(amounts)].map(n => Number(n).toLocaleString()).join(" – ")}${j.pay_unit ? ` / ${j.pay_unit}` : ""}`.trim();
}
export const eligibilityLabels: Record<string, string> = {
  tanzania: "Tanzania accepted", africa: "Africa / regional eligibility", worldwide: "Worldwide",
  restricted: "Country restricted", unspecified: "Eligibility not specified",
};