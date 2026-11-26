import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { discoverySchema, discoveryOptions, type DiscoveryFilters } from "@/lib/discovery";
import { useAuth } from "@/lib/auth-context";
import { useT } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/jobs")({
  validateSearch: discoverySchema,
  head: () => ({ meta: [
    { title: "Browse jobs — KaziLink Tanzania" },
    { name: "description", content: "Search Tanzania employer jobs and international remote opportunities with source, eligibility, salary, and experience filters." },
    { property: "og:title", content: "Browse jobs — KaziLink Tanzania" },
    { property: "og:description", content: "Discover real local and remote opportunities on KaziLink Tanzania." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: JobsPage,
});
function JobsPage() {
  const filters = Route.useSearch();
  const nav = Route.useNavigate();
  const { user } = useAuth();
  const { t, lang } = useT();
  const sw = lang === "sw";
  const [q, setQ] = useState(filters.q ?? "");
  const jobs = useQuery(discoveryOptions(filters, user?.id));
  const cats = useQuery({ queryKey: ["categories"], queryFn: async () => {
    const { data, error } = await supabase.from("job_categories").select("slug, name_en, name_sw").eq("active", true).order("sort_order");
    if (error) throw error; return data;
  } });
  const change = (key: keyof DiscoveryFilters, value: string | number | undefined) => {
    void nav({ search: (p: DiscoveryFilters) => ({ ...p, [key]: value, page: 1 }) });
  };
  const filter = (key: keyof DiscoveryFilters, label: string, options: [string, string][]) => (
    <div className="min-w-0 space-y-1.5" key={key}>
      <Label>{label}</Label><Select value={String(filters[key] ?? "all")} onValueChange={v => change(key, v === "all" ? undefined : key === "days" ? Number(v) : v)}>
        <SelectTrigger aria-label={label} className="w-full"><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value="all">{sw ? "Zote" : "All"}</SelectItem>{options.map(([v, name]) => <SelectItem key={v} value={v}>{name}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
  const page = filters.page ?? 1;
  const total = jobs.data?.total ?? 0;
  const periodSelected = !!filters.currency && !!filters.pay && filters.pay !== "not_listed";
  return <div className="min-h-screen bg-background"><AppNav /><main className="mx-auto max-w-7xl px-4 py-10">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm text-primary">KaziLink Tanzania</p><h1 className="mt-1 text-3xl font-semibold">{t.jobs.title}</h1></div>
      {user && <div className="flex gap-1">{([['all', sw ? 'Zote' : 'All jobs'], ['saved', sw ? 'Zilizohifadhiwa' : 'Saved'], ['hidden', sw ? 'Zilizofichwa' : 'Hidden']] as const).map(([v,label]) => <Button key={v} size="sm" variant={(filters.view ?? 'all') === v ? 'secondary' : 'ghost'} onClick={() => change('view', v)}>{label}</Button>)}</div>}
    </div>
    <form className="mt-6 flex gap-2" onSubmit={e => { e.preventDefault(); change('q', q || undefined); }}>
      <Input aria-label={t.jobs.search} value={q} onChange={e => setQ(e.target.value)} placeholder={t.jobs.search} className="min-w-0 flex-1" /><Button type="submit"><Search className="mr-2 h-4 w-4" />{sw ? "Tafuta" : "Search"}</Button>
    </form>
    <div className="mt-8 grid items-start gap-8 lg:grid-cols-[240px_1fr]">
      <aside className="grid grid-cols-2 gap-4 lg:grid-cols-1">
        {filter('category', t.jobs.filterCategory, (cats.data ?? []).map(c => [c.slug, sw ? c.name_sw : c.name_en]))}
        {filter('type', t.jobs.filterType, ['full_time','part_time','freelance','contract','internship','temporary'].map(v => [v,v.replaceAll('_',' ')]))}
        {filter('experience', sw ? 'Uzoefu' : 'Experience', ['entry','junior','mid','senior','lead','executive'].map(v => [v,v]))}
        <div className="space-y-1.5"><Label htmlFor="region">{t.jobs.location}</Label><Input id="region" placeholder="Dar es Salaam, Tanzania…" value={filters.region ?? ''} onChange={e => change('region',e.target.value || undefined)} /></div>
        {filter('workplace', sw ? 'Mahali pa kazi' : 'Workplace', [['remote','Remote'],['onsite','On-site'],['hybrid','Hybrid']])}
        {filter('eligibility', sw ? 'Ustahiki wa nchi' : 'Country eligibility', [['tanzania','Tanzania accepted'],['africa','Africa / region'],['worldwide','Worldwide'],['restricted','Country restricted'],['unspecified','Not specified']])}
        {filter('kind', sw ? 'Chanzo' : 'Source', [['internal','KaziLink employer'],['external','External opportunities']])}
        {filter('days', sw ? 'Imechapishwa' : 'Date posted', [['1','Last 24 hours'],['3','Last 3 days'],['7','Last 7 days'],['30','Last 30 days']])}
        {filter('currency', sw ? 'Sarafu' : 'Currency', [['TZS','TZS'],['USD','USD'],['EUR','EUR'],['GBP','GBP'],['CAD','CAD'],['AUD','AUD']])}
        {filter('pay', sw ? 'Kipindi cha malipo' : 'Payment period', [['hourly','Hourly'],['daily','Daily'],['monthly','Monthly'],['yearly','Yearly'],['per_task','Per task'],['not_listed','Pay not listed']])}
        <div className="space-y-1.5"><Label htmlFor="min-salary">{sw ? 'Malipo ya chini' : 'Minimum pay'}</Label><Input id="min-salary" type="number" min="0" value={filters.min ?? ''} onChange={e => change('min',e.target.value ? Number(e.target.value) : undefined)} /></div>
        <div className="space-y-1.5"><Label htmlFor="max-salary">{sw ? 'Malipo ya juu' : 'Maximum pay'}</Label><Input id="max-salary" type="number" min="0" value={filters.max ?? ''} onChange={e => change('max',e.target.value ? Number(e.target.value) : undefined)} /></div>
        <Button variant="outline" onClick={() => { setQ(''); void nav({ search: {} }); }}>{sw ? 'Ondoa vichujio' : 'Clear filters'}</Button>
      </aside>
      <section className="min-w-0">
        <div className="mb-4 flex items-center justify-between gap-4"><p aria-live="polite" className="text-sm text-muted-foreground">{jobs.isFetching ? t.empty.loading : `${total} ${sw ? 'fursa' : 'opportunities'}`}</p>
          <Select value={filters.sort ?? 'newest'} onValueChange={v => change('sort',v)}><SelectTrigger aria-label="Sort jobs" className="w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="newest">{sw ? 'Mpya kwanza' : 'Newest first'}</SelectItem><SelectItem value="salary" disabled={!periodSelected}>{sw ? 'Malipo ya juu' : 'Highest pay'}</SelectItem></SelectContent></Select>
        </div>
        {jobs.isError && <div className="border-l-2 border-destructive p-4 text-sm text-destructive">{t.empty.error}<Button variant="ghost" size="sm" onClick={() => jobs.refetch()}>Retry</Button></div>}
        {!jobs.isLoading && !jobs.isError && !total && <p className="border-y py-12 text-center text-sm text-muted-foreground">{t.jobs.empty}</p>}
        <div className="grid gap-4 xl:grid-cols-2">{jobs.data?.jobs.map(job => <ListingCard key={job.listing_id} job={job} />)}</div>
        {total > 20 && <nav aria-label="Job results pages" className="mt-6 flex items-center justify-center gap-4"><Button variant="outline" size="icon" aria-label="Previous page" disabled={page <= 1} onClick={() => void nav({ search: p => ({ ...p, page: page-1 }) })}><ChevronLeft className="h-4 w-4" /></Button><span className="text-sm">{page} / {Math.ceil(total/20)}</span><Button variant="outline" size="icon" aria-label="Next page" disabled={page*20 >= total} onClick={() => void nav({ search: p => ({ ...p, page: page+1 }) })}><ChevronRight className="h-4 w-4" /></Button></nav>}
      </section>
    </div>
  </main></div>;
}
