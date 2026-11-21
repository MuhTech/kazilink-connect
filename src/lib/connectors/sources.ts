import {
  dedupeKey, eligibilityFrom, employmentType, experienceLevel, htmlToText, payUnit, safeUrl, salary,
  type NormalizedJob,
} from "./normalize";

const UA = "KaziLinkTanzania/1.0 (+https://swahili-talent-link.lovable.app)";

async function getJson(url: string): Promise<unknown> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20000);
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: ctrl.signal });
      if (res.status >= 400 && res.status < 500 && res.status !== 429) {
        throw Object.assign(new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`), { fatal: true });
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      lastErr = e;
      if ((e as { fatal?: boolean }).fatal) throw e;
      await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr;
}

export interface Connector { id: string; fetchJobs: () => Promise<NormalizedJob[]> }

type Obj = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

export function mapRemoteOk(raw: unknown): NormalizedJob[] {
  if (!Array.isArray(raw)) throw new Error("Unexpected Remote OK response");
  const out: NormalizedJob[] = [];
  for (const r of raw as Obj[]) {
    const id = str(r["id"]); const title = str(r["position"]);
    const url = safeUrl(r["url"]); const apply = safeUrl(r["apply_url"]) ?? url;
    if (!id || !title || !apply) continue;
    const company = str(r["company"]);
    const location = str(r["location"]);
    const min = salary(r["salary_min"]); const max = salary(r["salary_max"]);
    out.push({
      external_id: id, dedupe_key: dedupeKey(title, company), title, company,
      logo_url: safeUrl(r["company_logo"]),
      description: htmlToText(str(r["description"])),
      location, workplace: "remote", eligibility: eligibilityFrom(location),
      employment_type: null, experience: null,
      salary_min: min, salary_max: max,
      currency: min || max ? "USD" : null, pay_unit: min || max ? "yearly" : null,
      tags: Array.isArray(r["tags"]) ? (r["tags"] as unknown[]).filter((t): t is string => typeof t === "string").slice(0, 12) : [],
      source_url: url, apply_url: apply,
      published_at: str(r["date"]),
    });
  }
  return out;
}

export function mapJobicy(raw: unknown): NormalizedJob[] {
  const jobs = (raw as Obj | null)?.["jobs"];
  if (!Array.isArray(jobs)) throw new Error("Unexpected Jobicy response");
  const out: NormalizedJob[] = [];
  for (const r of jobs as Obj[]) {
    const id = r["id"] != null ? String(r["id"]) : null; const title = str(r["jobTitle"]);
    const url = safeUrl(r["url"]);
    if (!id || !title || !url) continue;
    const company = str(r["companyName"]);
    const location = str(r["jobGeo"]);
    const min = salary(r["salaryMin"] ?? r["annualSalaryMin"]);
    const max = salary(r["salaryMax"] ?? r["annualSalaryMax"]);
    const types = Array.isArray(r["jobType"]) ? (r["jobType"] as unknown[]) : [];
    const industries = Array.isArray(r["jobIndustry"]) ? (r["jobIndustry"] as unknown[]) : [];
    out.push({
      external_id: id, dedupe_key: dedupeKey(title, company), title, company,
      logo_url: safeUrl(r["companyLogo"]),
      description: htmlToText(str(r["jobDescription"]) ?? str(r["jobExcerpt"])),
      location, workplace: "remote", eligibility: eligibilityFrom(location),
      employment_type: employmentType(typeof types[0] === "string" ? types[0] : null),
      experience: experienceLevel(str(r["jobLevel"])),
      salary_min: min, salary_max: max,
      currency: min || max ? str(r["salaryCurrency"]) : null,
      pay_unit: min || max ? payUnit(str(r["salaryPeriod"]) ?? (r["annualSalaryMin"] ? "yearly" : null)) : null,
      tags: industries.filter((t): t is string => typeof t === "string").map((t) => t.replace(/&amp;/g, "&")).slice(0, 12),
      source_url: url, apply_url: url,
      published_at: str(r["pubDate"]),
    });
  }
  return out;
}

export const CONNECTORS: Connector[] = [
  { id: "remoteok", fetchJobs: async () => mapRemoteOk(await getJson("https://remoteok.com/api")) },
  { id: "jobicy", fetchJobs: async () => mapJobicy(await getJson("https://jobicy.com/api/v2/remote-jobs?count=100")) },
];
