export type Eligibility = "tanzania" | "africa" | "worldwide" | "restricted" | "unspecified";

export interface NormalizedJob {
  external_id: string;
  dedupe_key: string;
  title: string;
  company: string | null;
  logo_url: string | null;
  description: string | null;
  location: string | null;
  workplace: "remote" | "hybrid" | "onsite";
  eligibility: Eligibility;
  employment_type: string | null;
  experience: string | null;
  salary_min: number | null;
  salary_max: number | null;
  currency: string | null;
  pay_unit: string | null;
  tags: string[];
  source_url: string | null;
  apply_url: string;
  published_at: string | null;
}

const AFRICA = ["africa", "emea", "kenya", "uganda", "rwanda", "nigeria", "south africa", "ghana", "egypt", "ethiopia", "morocco"];

/** Derive eligibility only from what the source says; never guess. */
export function eligibilityFrom(location: string | null | undefined): Eligibility {
  const l = (location ?? "").trim().toLowerCase();
  if (!l) return "unspecified";
  if (l.includes("tanzania")) return "tanzania";
  if (/(worldwide|anywhere|global|^remote$)/.test(l)) return "worldwide";
  if (AFRICA.some((a) => l.includes(a))) return "africa";
  return "restricted";
}

export function dedupeKey(title: string, company: string | null | undefined): string {
  const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, " ").trim();
  return `${norm(title)}|${norm(company ?? "")}`;
}

export function htmlToText(html: string | null | undefined): string | null {
  if (!html) return null;
  const text = html
    .replace(/<\s*(br|\/p|\/li|\/h\d|\/div)\s*\/?>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&#8217;/g, "’")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return text.slice(0, 20000) || null;
}

/** Positive numbers only; 0 / missing means "not listed". */
export function salary(v: unknown): number | null {
  const n = typeof v === "string" ? Number(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
}

const TYPE_MAP: Record<string, string> = {
  "full-time": "full_time", "full time": "full_time", "part-time": "part_time", "part time": "part_time",
  contract: "contract", internship: "internship", temporary: "temporary", freelance: "freelance",
};
export function employmentType(v: string | null | undefined): string | null {
  if (!v) return null;
  return TYPE_MAP[v.toLowerCase().trim()] ?? null;
}

const LEVEL_MAP: Record<string, string> = {
  entry: "entry", junior: "junior", midweight: "mid", mid: "mid", "mid-level": "mid", senior: "senior", lead: "lead",
  manager: "lead", executive: "executive",
};
export function experienceLevel(v: string | null | undefined): string | null {
  if (!v) return null;
  const k = v.toLowerCase().trim();
  if (k === "any") return null;
  return LEVEL_MAP[k] ?? null;
}

export function payUnit(v: string | null | undefined): string | null {
  if (!v) return null;
  const k = v.toLowerCase();
  if (k.startsWith("hour")) return "hourly";
  if (k.startsWith("day") || k === "daily") return "daily";
  if (k.startsWith("month")) return "monthly";
  if (k.startsWith("year") || k.startsWith("annual")) return "yearly";
  return null;
}

export function safeUrl(u: unknown): string | null {
  if (typeof u !== "string") return null;
  try { const x = new URL(u); return x.protocol === "https:" || x.protocol === "http:" ? x.toString() : null; } catch { return null; }
}
