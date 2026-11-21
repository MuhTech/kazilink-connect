import { CONNECTORS } from "./sources";

export interface SyncResult { source: string; status: string; fetched: number; inserted: number; updated: number; skipped_duplicates: number; expired: number; error?: string }

/** Runs every enabled connector independently. Caller must be verified before calling. */
export async function runSync(onlySource?: string): Promise<SyncResult[]> {
  const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
  const { data: sources } = await db.from("job_sources").select("id, enabled");
  const results: SyncResult[] = [];

  for (const c of CONNECTORS) {
    const src = sources?.find((s) => s.id === c.id);
    if (!src || !src.enabled || (onlySource && onlySource !== c.id)) continue;
    const startedAt = new Date().toISOString();
    const r: SyncResult = { source: c.id, status: "success", fetched: 0, inserted: 0, updated: 0, skipped_duplicates: 0, expired: 0 };
    try {
      const jobs = await c.fetchJobs();
      r.fetched = jobs.length;
      const now = new Date().toISOString();

      const { data: existing } = await db.from("external_jobs").select("external_id").eq("source_id", c.id);
      const existingIds = new Set((existing ?? []).map((e) => e.external_id));
      const { data: others } = await db.from("external_jobs").select("dedupe_key").neq("source_id", c.id).eq("is_expired", false);
      const otherKeys = new Set((others ?? []).map((o) => o.dedupe_key));

      const seen = new Set<string>();
      const rows = jobs.filter((j) => {
        if (seen.has(j.external_id)) return false;
        seen.add(j.external_id);
        if (!existingIds.has(j.external_id) && otherKeys.has(j.dedupe_key)) { r.skipped_duplicates++; return false; }
        return true;
      }).map((j) => ({ ...j, source_id: c.id, last_checked_at: now, is_expired: false }));

      for (const row of rows) existingIds.has(row.external_id) ? r.updated++ : r.inserted++;
      for (let i = 0; i < rows.length; i += 100) {
        const { error } = await db.from("external_jobs").upsert(rows.slice(i, i + 100), { onConflict: "source_id,external_id" });
        if (error) throw new Error(error.message);
      }

      // Removed from the feed or older than 60 days → expired.
      const cutoff = new Date(Date.now() - 60 * 864e5).toISOString();
      const { data: gone } = await db.from("external_jobs").update({ is_expired: true })
        .eq("source_id", c.id).eq("is_expired", false).or(`last_checked_at.lt.${now},published_at.lt.${cutoff}`).select("id");
      r.expired = gone?.length ?? 0;
    } catch (e) {
      r.status = "error";
      r.error = e instanceof Error ? e.message.slice(0, 500) : String(e);
    }
    const { count } = await db.from("external_jobs").select("id", { count: "exact", head: true }).eq("source_id", c.id).eq("is_expired", false);
    await db.from("job_sync_logs").insert({ source_id: c.id, started_at: startedAt, finished_at: new Date().toISOString(), status: r.status, fetched: r.fetched, inserted: r.inserted, updated: r.updated, skipped_duplicates: r.skipped_duplicates, expired: r.expired, error: r.error ?? null });
    await db.from("job_sources").update({
      last_run_at: new Date().toISOString(), last_status: r.status, last_error: r.error ?? null, active_jobs: count ?? 0,
      ...(r.status === "success" ? { last_success_at: new Date().toISOString() } : {}),
    }).eq("id", c.id);
    results.push(r);
  }
  return results;
}
