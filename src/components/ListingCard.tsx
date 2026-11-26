import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, EyeOff, Share2, MapPin, Building2, ArrowUpRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useT } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { salaryLabel, eligibilityLabels, type Listing } from "@/lib/discovery";
import { toast } from "sonner";

export function ListingCard({ job }: { job: Listing }) {
  const { user } = useAuth();
  const { lang } = useT();
  const sw = lang === "sw";
  const nav = useNavigate();
  const qc = useQueryClient();
  const actions = useQuery({
    queryKey: ["job-actions", user?.id], enabled: !!user,
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from("user_job_actions").select("listing_id, action").eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
  });
  const has = (action: string) => actions.data?.some(a => a.listing_id === job.listing_id && a.action === action) ?? false;
  const mutate = useMutation({
    mutationFn: async (action: "save" | "hide") => {
      if (!user) { await nav({ to: "/auth" }); return; }
      const result = has(action)
        ? await supabase.from("user_job_actions").delete().eq("user_id", user.id).eq("listing_id", job.listing_id).eq("action", action)
        : await supabase.from("user_job_actions").insert({ user_id: user.id, listing_id: job.listing_id, action });
      if (result.error) throw result.error;
    },
    onSuccess: async () => { await qc.invalidateQueries({ queryKey: ["job-actions"] }); await qc.invalidateQueries({ queryKey: ["discovery"] }); },
    onError: () => toast.error(sw ? "Imeshindikana kuhifadhi" : "Could not update this job"),
  });
  const external = job.kind === "external";
  const pay = salaryLabel(job);
  const detailSlug = external ? `external-${job.slug}` : job.slug;
  const date = (v: string) => v ? v.slice(0, 10) : "";
  return (
    <article className="min-w-0 rounded-lg border bg-card p-5 transition-colors hover:border-primary/50">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-secondary text-primary"><Building2 className="h-5 w-5" /></div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground"><span>{external ? `${sw ? "Kutoka" : "From"} ${job.source_name}` : "KaziLink employer"}</span>{Date.now() - Date.parse(job.discovered_at) < 3 * 86400000 && <Badge variant="secondary">{sw ? "Mpya" : "New"}</Badge>}</div>
          <Link to="/jobs/$slug" params={{ slug: detailSlug }} className="mt-1 block break-words text-lg font-semibold text-foreground hover:text-primary">{job.title}</Link>
          <div className="mt-1 text-sm text-muted-foreground">{job.company}</div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
        {job.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>}
        <span>{job.workplace}</span>{job.employment_type && <span>{job.employment_type.replaceAll("_", " ")}</span>}{job.experience && <span>{job.experience}</span>}
      </div>
      <div className="mt-2 text-xs text-muted-foreground">{eligibilityLabels[job.eligibility] ?? job.eligibility}</div>
      {pay && <p className="mt-3 text-sm font-medium text-primary">{pay}</p>}
      <div className="mt-3 flex flex-wrap gap-1">{job.tags?.slice(0, 5).map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}</div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
        <div className="text-xs text-muted-foreground">{job.published_at && <div>{sw ? "Imechapishwa" : "Posted"} {date(job.published_at)}</div>}<div>{sw ? "Imepatikana" : "Discovered"} {date(job.discovered_at)}</div>{job.deadline && <div>{sw ? "Mwisho" : "Deadline"} {job.deadline}</div>}</div>
        <div className="flex shrink-0 gap-1">
          <Button size="icon" variant={has("save") ? "secondary" : "ghost"} title={has("save") ? "Unsave job" : "Save job"} aria-label={has("save") ? "Unsave job" : "Save job"} disabled={mutate.isPending} onClick={() => mutate.mutate("save")}><Bookmark className="h-4 w-4" /></Button>
          <Button size="icon" variant="ghost" title={has("hide") ? "Restore job" : "Hide job"} aria-label={has("hide") ? "Restore job" : "Hide job"} disabled={mutate.isPending} onClick={() => mutate.mutate("hide")}>{has("hide") ? <RotateCcw className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</Button>
          <Button size="icon" variant="ghost" title="Share job" aria-label="Share job" onClick={async () => { try { await navigator.clipboard.writeText(`${window.location.origin}/jobs/${detailSlug}`); toast.success(sw ? "Kiungo kimenakiliwa" : "Job link copied"); } catch { toast.error("Could not copy link"); } }}><Share2 className="h-4 w-4" /></Button>
          <Button size="sm" variant="outline" asChild>{external ? <a href={job.apply_url} target="_blank" rel="noopener noreferrer">{sw ? "Omba" : "Apply"}<ArrowUpRight className="ml-1 h-3 w-3" /></a> : <Link to="/jobs/$slug" params={{ slug: job.slug }}>{sw ? "Omba" : "Apply"}</Link>}</Button>
        </div>
      </div>
    </article>
  );
}