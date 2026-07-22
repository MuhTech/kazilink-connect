import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppNav } from "@/components/AppNav";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useT } from "@/lib/i18n";
import { Building2, MapPin, Clock } from "lucide-react";

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  type: z.string().optional(),
  remote: z.boolean().optional(),
});

export const Route = createFileRoute("/jobs")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Browse jobs — KaziLink Tanzania" },
      { name: "description", content: "Search current job openings across Tanzania. Filter by category, employment type, and location." },
      { property: "og:title", content: "Browse jobs — KaziLink Tanzania" },
      { property: "og:description", content: "Find jobs from verified employers across Tanzania." },
    ],
  }),
  component: JobsPage,
});

function JobsPage() {
  const search = Route.useSearch();
  const nav = Route.useNavigate();
  const { t } = useT();
  const [q, setQ] = useState(search.q ?? "");

  const catsQ = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await supabase.from("job_categories").select("*").eq("active", true).order("sort_order")).data ?? [],
  });

  const jobsQ = useQuery({
    queryKey: ["jobs", search],
    queryFn: async () => {
      let query = supabase
        .from("jobs")
        .select("id, slug, title, location, employment_type, experience_level, is_remote, published_at, salary_min, salary_max, currency, companies(name, verification_status), job_categories(slug, name_en, name_sw)")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(50);
      if (search.q) query = query.ilike("title", `%${search.q}%`);
      if (search.type) query = query.eq("employment_type", search.type as never);
      if (search.remote) query = query.eq("is_remote", true);
      if (search.category) {
        const cat = catsQ.data?.find((c) => c.slug === search.category);
        if (cat) query = query.eq("category_id", cat.id);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !catsQ.isLoading,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    void nav({ search: (prev) => ({ ...prev, q: q || undefined }) });
  };

  const jobs = jobsQ.data ?? [];
  const empty = useMemo(() => !jobsQ.isLoading && jobs.length === 0, [jobsQ.isLoading, jobs]);

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">{t.jobs.title}</h1>

        <form onSubmit={submit} className="mt-6 grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.jobs.search} />
          <Select
            value={search.category ?? "__all__"}
            onValueChange={(v) => nav({ search: (p) => ({ ...p, category: v === "__all__" ? undefined : v }) })}
          >
            <SelectTrigger className="w-[180px]"><SelectValue placeholder={t.jobs.filterCategory} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">{t.jobs.allCategories}</SelectItem>
              {catsQ.data?.map((c) => <SelectItem key={c.id} value={c.slug}>{c.name_en}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select
            value={search.type ?? "__all__"}
            onValueChange={(v) => nav({ search: (p) => ({ ...p, type: v === "__all__" ? undefined : v }) })}
          >
            <SelectTrigger className="w-[180px]"><SelectValue placeholder={t.jobs.filterType} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">{t.jobs.allTypes}</SelectItem>
              {["full_time","part_time","contract","internship","temporary","freelance"].map((v) => (
                <SelectItem key={v} value={v}>{v.replace("_"," ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <label className="flex items-center gap-2 rounded-md border px-3 text-sm">
            <Checkbox
              checked={!!search.remote}
              onCheckedChange={(c) => nav({ search: (p) => ({ ...p, remote: c ? true : undefined }) })}
            />
            {t.jobs.filterRemote}
          </label>
        </form>

        <div className="mt-8 grid gap-4">
          {jobsQ.isLoading && <div className="text-sm text-muted-foreground">{t.empty.loading}</div>}
          {jobsQ.isError && <div className="text-sm text-destructive">{t.empty.error}</div>}
          {empty && <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">{t.jobs.empty}</div>}
          {jobs.map((j) => (
            <Link
              key={j.id}
              to="/jobs/$slug"
              params={{ slug: j.slug }}
              className="rounded-lg border bg-card p-5 transition hover:border-primary hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{j.title}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Building2 className="h-3 w-3" />{j.companies?.name}</span>
                    {j.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{j.location}</span>}
                    <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{j.employment_type.replace("_"," ")}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {j.is_remote && <Badge variant="secondary">Remote</Badge>}
                  {j.job_categories && <Badge variant="outline">{j.job_categories.name_en}</Badge>}
                </div>
              </div>
              {(j.salary_min || j.salary_max) && (
                <div className="mt-2 text-sm text-muted-foreground">
                  {t.jobs.salary}: {j.currency} {Number(j.salary_min ?? 0).toLocaleString()}
                  {j.salary_max ? ` – ${Number(j.salary_max).toLocaleString()}` : ""}
                </div>
              )}
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}