import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useT } from "@/lib/i18n";
import { AppNav } from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { profileSchema } from "@/lib/schemas";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [{ title: "Profile — KaziLink Tanzania" }, { name: "robots", content: "noindex" }],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const { t, setLang } = useT();
  const qc = useQueryClient();
  const [form, setForm] = useState({ full_name: "", phone: "", bio: "", location: "", headline: "", preferred_language: "en" as "en" | "sw" });
  const [saving, setSaving] = useState(false);

  const profileQ = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (profileQ.data) {
      setForm({
        full_name: profileQ.data.full_name ?? "",
        phone: profileQ.data.phone ?? "",
        bio: profileQ.data.bio ?? "",
        location: profileQ.data.location ?? "",
        headline: profileQ.data.headline ?? "",
        preferred_language: (profileQ.data.preferred_language as "en" | "sw") ?? "en",
      });
    }
  }, [profileQ.data]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = profileSchema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").update(parsed.data).eq("id", user!.id);
      if (error) { toast.error(error.message); return; }
      setLang(parsed.data.preferred_language);
      toast.success(t.profile.saved);
      await qc.invalidateQueries({ queryKey: ["profile", user?.id] });
    } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">{t.profile.title}</h1>

        <form onSubmit={save} className="mt-8 space-y-4">
          <Field label={t.profile.fullName}><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required maxLength={120} /></Field>
          <Field label={t.profile.headline}><Input value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} maxLength={160} /></Field>
          <Field label={t.profile.phone}><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={32} /></Field>
          <Field label={t.profile.location}><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} maxLength={120} /></Field>
          <Field label={t.profile.bio}><Textarea rows={5} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} maxLength={1000} /></Field>
          <Field label={t.profile.language}>
            <Select value={form.preferred_language} onValueChange={(v) => setForm({ ...form, preferred_language: v as "en" | "sw" })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="sw">Kiswahili</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Button type="submit" disabled={saving}>{saving ? t.empty.loading : t.profile.save}</Button>
        </form>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}