import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { AppNav } from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Clock, CalendarClock } from "lucide-react";
import { useT } from "@/lib/i18n";
import { toast } from "sonner";

export const Route = createFileRoute("/jobs/$slug")({
  head: () => ({
    meta: [
      { title: "Job details — KaziLink Tanzania" },
      { name: "description", content: "Job opening on KaziLink Tanzania." },
    ],
  }),
  component: JobDetail,
  errorComponent: () => <div className="p-10 text-center">Failed to load job.</div>,
  notFoundComponent: () => <div className="p-10 text-center">Job not found.</div>,
});

function JobDetail() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();
  const { t } = useT();
  const [cover, setCover] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const jobQ = useQuery({
    queryKey: ["job", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*, companies(id, name, description, logo_path, verification_status, website), job_categories(name_en, name_sw), job_skills(skill)")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const applicationQ = useQuery({
    queryKey: ["application", slug, user?.id],
    enabled: !!user && !!jobQ.data?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("applications")
        .select("id, status")
        .eq("job_id", jobQ.data!.id)
        .eq("applicant_id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const apply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { void nav({ to: "/auth" }); return; }
    if (!jobQ.data) return;
    setSubmitting(true);
    try {
      let resume_path: string | null = null;
      if (file) {
        if (file.size > 5 * 1024 * 1024) { toast.error("Resume must be under 5 MB"); return; }
        const path = `${user.id}/${Date.now()}-${file.name.replace(/[^\w.-]/g,"_")}`;
        const { error: upErr } = await supabase.storage.from("resumes").upload(path, file, { upsert: false });
        if (upErr) { toast.error(upErr.message); return; }
        resume_path = path;
      }
      const { error } = await supabase.from("applications").insert({
        job_id: jobQ.data.id,
        applicant_id: user.id,
        cover_letter: cover || null,
        resume_path,
      });
      if (error) { toast.error(error.message); return; }
      toast.success("Application submitted");
      setCover(""); setFile(null);
      await qc.invalidateQueries({ queryKey: ["application", slug, user.id] });
    } finally { setSubmitting(false); }
  };

  if (jobQ.isLoading) return <><AppNav /><div className="p-10">{t.empty.loading}</div></>;
  const job = jobQ.data;
  if (!job) return <><AppNav /><div className="p-10">{t.empty.none}</div></>;

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto grid max-w-5xl gap-8 px-4 py-10 lg:grid-cols-[1fr_320px]">
        <article>
          <Link to="/jobs" className="text-sm text-muted-foreground hover:text-foreground">← {t.jobs.title}</Link>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">{job.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Building2 className="h-4 w-4" />{job.companies?.name}</span>
            {job.location && <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{job.location}</span>}
            <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" />{job.employment_type.replace("_"," ")}</span>
            {job.application_deadline && (
              <span className="inline-flex items-center gap-1"><CalendarClock className="h-4 w-4" />{t.jobs.deadline}: {job.application_deadline}</span>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-1">
            {job.is_remote && <Badge variant="secondary">Remote</Badge>}
            <Badge variant="outline">{job.experience_level}</Badge>
            {job.job_categories && <Badge variant="outline">{job.job_categories.name_en}</Badge>}
            {job.job_skills?.map((s) => <Badge key={s.skill} variant="secondary">{s.skill}</Badge>)}
          </div>

          <Section title="Description">{job.description}</Section>
          {job.responsibilities && <Section title="Responsibilities">{job.responsibilities}</Section>}
          {job.requirements && <Section title="Requirements">{job.requirements}</Section>}
        </article>

        <aside className="space-y-6">
          <div className="rounded-lg border bg-card p-5">
            <h2 className="text-sm font-semibold">{t.application.submit}</h2>
            {applicationQ.data ? (
              <p className="mt-3 text-sm text-muted-foreground">{t.application.already}</p>
            ) : (
              <form onSubmit={apply} className="mt-3 space-y-3">
                <Textarea
                  value={cover}
                  onChange={(e) => setCover(e.target.value)}
                  placeholder={t.application.cover}
                  rows={5}
                  maxLength={4000}
                />
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium"
                />
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? t.empty.loading : t.jobs.apply}
                </Button>
              </form>
            )}
          </div>

          {job.companies && (
            <div className="rounded-lg border bg-card p-5">
              <h3 className="text-sm font-semibold">{job.companies.name}</h3>
              {job.companies.description && <p className="mt-2 text-sm text-muted-foreground line-clamp-6">{job.companies.description}</p>}
              {job.companies.website && <a className="mt-2 block text-xs text-primary hover:underline" href={job.companies.website} target="_blank" rel="noreferrer">{job.companies.website}</a>}
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}