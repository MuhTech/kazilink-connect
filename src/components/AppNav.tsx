import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useT } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Briefcase } from "lucide-react";

export function AppNav() {
  const { user, isAdmin, hasRole, loading } = useAuth();
  const { t } = useT();
  const isEmployer = hasRole("employer") || hasRole("recruiter") || isAdmin;

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold text-foreground">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Briefcase className="h-4 w-4" aria-hidden />
          </span>
          <span className="hidden sm:inline">{t.brand}</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link to="/jobs" className="rounded-md px-3 py-2 text-muted-foreground hover:text-foreground [&.active]:text-foreground [&.active]:font-medium">
            {t.nav.jobs}
          </Link>
          {user && (
            <Link to="/dashboard" className="rounded-md px-3 py-2 text-muted-foreground hover:text-foreground [&.active]:text-foreground [&.active]:font-medium">
              {t.nav.dashboard}
            </Link>
          )}
          {user && isEmployer && (
            <Link to="/employer/jobs" className="rounded-md px-3 py-2 text-muted-foreground hover:text-foreground [&.active]:text-foreground [&.active]:font-medium">
              {t.nav.employer}
            </Link>
          )}
          {user && isAdmin && (
            <Link to="/admin" className="rounded-md px-3 py-2 text-muted-foreground hover:text-foreground [&.active]:text-foreground [&.active]:font-medium">
              {t.nav.admin}
            </Link>
          )}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <LanguageSwitcher />
          {!loading && !user && (
            <>
              <Button asChild variant="ghost" size="sm"><Link to="/auth">{t.nav.signin}</Link></Button>
              <Button asChild size="sm"><Link to="/auth" search={{ mode: "signup" }}>{t.nav.signup}</Link></Button>
            </>
          )}
          {user && (
            <>
              <Button asChild variant="ghost" size="sm"><Link to="/profile">{t.nav.profile}</Link></Button>
              <Button variant="outline" size="sm" onClick={signOut}>{t.nav.signout}</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}