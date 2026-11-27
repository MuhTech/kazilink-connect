import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Building2, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppNav } from "@/components/AppNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { salaryLabel, eligibilityLabels } from "@/lib/discovery";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function ExternalJobDetail({ id }: { id: string }) {
  const { t, lang } = useT();
  const sw = lang === "sw";
  const q = useQuery({
    queryKey: ["external-job", id],
    queryFn: async () => {
      if (!UUID.test(id)) return null;
      const { data, error } = await supabase.rpc("get_external_listing", { _id: id });
      if (error) throw error;
      return data?.[0] ?? null;
    },
  });
  if (q.isLoading) return <><AppNav /><div className="p-10">{t.empty.loading}</div></>;
  const job = q.data;
  if (!job) return <><AppNav /><div className="p-10 text-center">{sw ? "Kazi haikupatikana." : "Job not found."}</div></>;
  const pay = salaryLabel(job);
  const d = (v: string | null) => (v ? v.slice(0, 10) : "");
  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto grid max-w-5xl gap-8 px-4 py-10 lg:grid-cols-[1fr_320px]">
        <article className="min-w-0">
          <Link to="/jobs" className="text-sm text-muted-foreground hover:text-foreground">← {t.jobs.title}</Link>
          <h1 className="mt-3 break-words text-3xl font-bold tracking-tight text-foreground">{job.title}</h1>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {job.company && <span className="inline-flex items-center gap-1"><Building2 className="h-4 w-4" />{job.company}</span>}
            {job.location && <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{job.location}</span>}
            <span>{job.workplace}</span>
            {job.employment_type && <span>{job.employment_type.replaceAll("_", " ")}</span>}
          </div>
          <div className="mt-3 flex flex-wrap gap-1">{job.tags?.map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}</div>
          {job.is_expired && <p className="mt-4 rounded-md border border-destructive/40 p-3 text-sm text-destructive">{sw ? "Kazi hii huenda imefungwa." : "This job may no longer be open."}</p>}
          <section className="mt-8">
            <h2 className="text-lg font-semibold">{sw ? "Maelezo" : "Description"}</h2>
            <div className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed text-muted-foreground">{job.description || (sw ? "Hakuna maelezo kutoka chanzo." : "The source did not provide a description.")}</div>
          </section>
        </article>
        <aside className="space-y-4">
          <div className="rounded-lg border bg-card p-5 text-sm">
            <p className="text-muted-foreground">{sw ? "Kutoka" : "From"} <span className="font-medium text-foreground">{job.source_name}</span></p>
            <p className="mt-2 text-muted-foreground">{eligibilityLabels[job.eligibility] ?? job.eligibility}</p>
            {pay ? <p className="mt-2 font-medium text-primary">{pay}</p> : <p className="mt-2 text-muted-foreground">{sw ? "Mshahara haujatajwa" : "Salary not stated"}</p>}
            <div className="mt-3 space-y-1 text-xs text-muted-foreground">
              {job.published_at && <div>{sw ? "Imechapishwa" : "Posted"} {d(job.published_at)}</div>}
              <div>{sw ? "Imepatikana" : "Discovered"} {d(job.imported_at)}</div>
              <div>{sw ? "Imehakikiwa" : "Last checked"} {d(job.last_checked_at)}</div>
            </div>
            <Button className="mt-4 w-full" asChild>
              <a href={job.apply_url} target="_blank" rel="noopener noreferrer">{sw ? "Omba kwenye tovuti ya chanzo" : "Apply on source site"}<ArrowUpRight className="ml-1 h-4 w-4" /></a>
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">{sw ? "Maombi hufanyika kwenye tovuti ya mwajiri au chanzo, si KaziLink." : "You apply on the employer's or source's site, not on KaziLink."}</p>
          </div>
        </aside>
      </main>
    </div>
  );
}
