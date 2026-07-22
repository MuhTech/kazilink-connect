import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useT } from "@/lib/i18n";
import { AppNav } from "@/components/AppNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — KaziLink Tanzania" },
      { name: "description", content: "Your KaziLink dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user, roles, isAdmin } = useAuth();
  const { t } = useT();
  const isEmployer = roles.includes("employer") || roles.includes("recruiter") || isAdmin;

  const appsQ = useQuery({
    queryKey: ["dash-apps", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("applications").select("id, status").eq("applicant_id", user!.id)).data ?? [],
  });
  const compQ = useQuery({
    queryKey: ["dash-companies", user?.id],
    enabled: !!user && isEmployer,
    queryFn: async () => (await supabase.from("companies").select("id, name, verification_status").eq("owner_id", user!.id)).data ?? [],
  });

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">{t.nav.dashboard}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Karibu, {user?.email}</p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Card className="p-5">
            <div className="text-xs text-muted-foreground">{t.nav.applications}</div>
            <div className="mt-2 text-3xl font-semibold">{appsQ.data?.length ?? 0}</div>
            <Button asChild variant="link" className="mt-2 px-0"><Link to="/applications">View →</Link></Button>
          </Card>
          {isEmployer && (
            <Card className="p-5">
              <div className="text-xs text-muted-foreground">{t.company.list}</div>
              <div className="mt-2 text-3xl font-semibold">{compQ.data?.length ?? 0}</div>
              <Button asChild variant="link" className="mt-2 px-0"><Link to="/employer/companies">Manage →</Link></Button>
            </Card>
          )}
          <Card className="p-5">
            <div className="text-xs text-muted-foreground">{t.nav.profile}</div>
            <Button asChild variant="link" className="mt-2 px-0"><Link to="/profile">{t.profile.title} →</Link></Button>
          </Card>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <Card className="p-5">
            <h2 className="text-sm font-semibold">{t.nav.jobs}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t.jobs.title}</p>
            <Button asChild className="mt-3"><Link to="/jobs">{t.home.heroCta}</Link></Button>
          </Card>
          {isEmployer && (
            <Card className="p-5">
              <h2 className="text-sm font-semibold">{t.employer.newJob}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t.jobForm.create}</p>
              <Button asChild className="mt-3"><Link to="/employer/jobs">{t.employer.jobs}</Link></Button>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}