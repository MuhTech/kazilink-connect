import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ArrowRight, BriefcaseBusiness } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { discoveryOptions } from "@/lib/discovery";
import { useAuth } from "@/lib/auth-context";
import { useT } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
export const Route = createFileRoute("/")({ head: () => ({ meta: [
  { title: "KaziLink Tanzania — Find Opportunities. Build Your Future." },
  { name: "description", content: "Discover Tanzania employer jobs, international remote opportunities, freelance roles and internships in one place." },
  { property: "og:title", content: "KaziLink Tanzania — Find Opportunities. Build Your Future." },
  { property: "og:description", content: "Explore real local jobs and remote opportunities with transparent sources and country eligibility." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
] }), component: Home });
function Home() {
  const { t, lang } = useT(); const sw = lang === 'sw'; const { user } = useAuth();
  const nav = useNavigate(); const [q,setQ] = useState('');
  const latest = useQuery(discoveryOptions({}, user?.id, 6));
  const remote = useQuery(discoveryOptions({ workplace: 'remote' }, user?.id, 3));
  const cats = useQuery({ queryKey: ['categories'], queryFn: async () => {
    const { data,error } = await supabase.from('job_categories').select('slug, name_en, name_sw').eq('active',true).order('sort_order'); if(error) throw error; return data;
  } });
  return <div className="min-h-screen bg-background"><AppNav /><main>
    <section className="border-b bg-secondary/40"><div className="mx-auto max-w-7xl px-4 py-12 lg:py-16">
      <p className="text-sm font-medium text-primary">{sw ? 'Ajira · Fursa · Ukuaji' : 'Local careers · Global opportunities'}</p>
      <h1 className="mt-3 text-4xl font-bold sm:text-5xl">KaziLink Tanzania</h1>
      <h2 className="mt-4 text-xl font-medium sm:text-2xl">{sw ? 'Pata Fursa. Jenga Mustakabali Wako.' : 'Find Opportunities. Build Your Future.'}</h2>
      <p className="mt-4 max-w-2xl text-muted-foreground">{sw ? 'Gundua ajira, kazi za mbali, miradi ya kujitegemea na nafasi za mafunzo kutoka sehemu moja.' : 'Discover jobs, remote opportunities, freelance projects and internships from one place.'}</p>
      <form className="mt-7 flex max-w-2xl gap-2" onSubmit={e => { e.preventDefault(); void nav({ to:'/jobs',search:{ q:q || undefined } }); }}><Input className="min-w-0 bg-background" aria-label={t.jobs.search} placeholder={t.jobs.search} value={q} onChange={e => setQ(e.target.value)} /><Button type="submit"><Search className="mr-2 h-4 w-4" />{sw ? 'Tafuta' : 'Search'}</Button></form>
      <Button asChild variant="link" className="mt-3 px-0"><Link to="/auth" search={{ mode:'signup' }}>{t.home.employerCta}<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
    </div></section>
    <section className="mx-auto max-w-7xl px-4 py-10"><div className="flex items-center justify-between gap-3"><h2 className="text-2xl font-semibold">{sw ? 'Fursa za karibuni' : 'Latest opportunities'}</h2><Button asChild variant="ghost" size="sm"><Link to="/jobs">{sw ? 'Zote' : 'View all'}<ArrowRight className="ml-2 h-4 w-4" /></Link></Button></div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{latest.data?.jobs.map(job => <ListingCard key={job.listing_id} job={job} />)}</div>
      {latest.isLoading && <p className="py-8 text-muted-foreground">{t.empty.loading}</p>}{latest.isError && <p className="py-8 text-destructive">{t.empty.error}</p>}{latest.data?.total === 0 && <p className="py-8 text-muted-foreground">{t.jobs.empty}</p>}
    </section>
    <section className="border-y bg-muted/30"><div className="mx-auto max-w-7xl px-4 py-10"><h2 className="text-2xl font-semibold">{t.home.featured}</h2><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{cats.data?.slice(0,8).map(c => <Link key={c.slug} to="/jobs" search={{ category:c.slug }} className="flex items-center gap-3 rounded-lg border bg-card p-4 hover:border-primary"><BriefcaseBusiness className="h-5 w-5 shrink-0 text-primary" /><span className="text-sm font-medium">{sw ? c.name_sw : c.name_en}</span></Link>)}</div></div></section>
    <section className="mx-auto max-w-7xl px-4 py-10"><div className="flex items-center justify-between"><h2 className="text-2xl font-semibold">{sw ? 'Kazi za mbali' : 'Remote opportunities'}</h2><Button asChild variant="ghost" size="sm"><Link to="/jobs" search={{ workplace:'remote' }}>{sw ? 'Zote' : 'View all'}<ArrowRight className="ml-2 h-4 w-4" /></Link></Button></div><div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{remote.data?.jobs.map(job => <ListingCard key={job.listing_id} job={job} />)}</div>{remote.data?.total === 0 && <p className="py-8 text-muted-foreground">{t.jobs.empty}</p>}</section>
    <footer className="border-t"><div className="mx-auto flex max-w-7xl justify-between px-4 py-7 text-xs text-muted-foreground"><span>© {new Date().getFullYear()} {t.brand}</span><span>English · Kiswahili</span></div></footer>
  </main></div>;
}
