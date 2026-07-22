import { createFileRoute, Link } from "@tanstack/react-router";
import { AppNav } from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Building2, MapPin, Search } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KaziLink Tanzania — Find jobs & hire across Tanzania" },
      { name: "description", content: "The bilingual employment platform for Tanzania. Search jobs, apply in minutes, or post openings to reach qualified candidates." },
      { property: "og:title", content: "KaziLink Tanzania" },
      { property: "og:description", content: "Connecting Skills with Opportunities Across Tanzania." },
    ],
  }),
  component: Home,
});

function Home() {
  const { t } = useT();
  const categoriesQ = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("job_categories").select("*").eq("active", true).order("sort_order");
      if (error) throw error;
      return data;
    },
  });
  const jobsQ = useQuery({
    queryKey: ["jobs-featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("id, slug, title, location, employment_type, published_at, companies(name)")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main>
        <section className="border-b bg-gradient-to-br from-primary/5 via-background to-accent/10">
          <div className="mx-auto max-w-7xl px-4 py-20 lg:py-28">
            <div className="max-w-3xl">
              <span className="inline-block rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">{t.home.stats}</span>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                {t.tagline}
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
                KaziLink — {t.brand}. Ajira. Fursa. Ukuaji.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/jobs"><Search className="mr-2 h-4 w-4" />{t.home.heroCta}</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/auth" search={{ mode: "signup" }}>{t.home.employerCta}<ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">{t.home.featured}</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {categoriesQ.data?.slice(0, 8).map((c) => (
              <Link key={c.id} to="/jobs" search={{ category: c.slug }} className="group rounded-lg border bg-card p-5 transition hover:border-primary hover:shadow-sm">
                <div className="text-sm font-medium text-foreground">{c.name_en}</div>
                <div className="text-xs text-muted-foreground">{c.name_sw}</div>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-t bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-16">
            <div className="flex items-end justify-between">
              <h2 className="text-2xl font-semibold tracking-tight">Latest jobs</h2>
              <Link to="/jobs" className="text-sm text-primary hover:underline">View all →</Link>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {jobsQ.data?.map((j) => (
                <Link key={j.id} to="/jobs/$slug" params={{ slug: j.slug }} className="rounded-lg border bg-card p-5 hover:border-primary hover:shadow-sm">
                  <div className="text-base font-semibold text-foreground">{j.title}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Building2 className="h-3 w-3" />{j.companies?.name}</span>
                    {j.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{j.location}</span>}
                  </div>
                </Link>
              ))}
              {jobsQ.data && jobsQ.data.length === 0 && (
                <div className="col-span-full rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">{t.empty.none}</div>
              )}
            </div>
          </div>
        </section>

        <footer className="border-t bg-background">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 py-8 text-xs text-muted-foreground sm:flex-row sm:justify-between">
            <span>© {new Date().getFullYear()} {t.brand}</span>
            <span>Bilingual · Secure · Made for Tanzania 🇹🇿</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
