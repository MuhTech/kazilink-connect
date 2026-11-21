DROP POLICY IF EXISTS "Settings: read" ON public.app_settings;
CREATE POLICY "Settings: admin read" ON public.app_settings FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "logos: read authenticated" ON storage.objects;
CREATE POLICY "logos: read managers" ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'company-logos' AND (
    public.is_admin(auth.uid())
    OR ((storage.foldername(name))[1] ~* '^[0-9a-f-]{36}$'
        AND public.can_manage_company(auth.uid(), ((storage.foldername(name))[1])::uuid))
  )
);