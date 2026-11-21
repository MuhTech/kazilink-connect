CREATE TABLE public.job_sources (
  id text PRIMARY KEY,
  name text NOT NULL,
  website text NOT NULL,
  terms_url text,
  enabled boolean NOT NULL DEFAULT true,
  last_run_at timestamptz,
  last_success_at timestamptz,
  last_status text NOT NULL DEFAULT 'never_run',
  last_error text,
  active_jobs integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.job_sources TO anon, authenticated;
GRANT UPDATE ON public.job_sources TO authenticated;
GRANT ALL ON public.job_sources TO service_role;
ALTER TABLE public.job_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sources: public read" ON public.job_sources FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Sources: admin update" ON public.job_sources FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

INSERT INTO public.job_sources (id, name, website, terms_url) VALUES
 ('remoteok', 'Remote OK', 'https://remoteok.com', 'https://remoteok.com/api'),
 ('jobicy', 'Jobicy', 'https://jobicy.com', 'https://jobicy.com/jobs-rss-feed');

CREATE TABLE public.external_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id text NOT NULL REFERENCES public.job_sources(id),
  external_id text NOT NULL,
  dedupe_key text NOT NULL,
  title text NOT NULL,
  company text,
  logo_url text,
  description text,
  location text,
  workplace text NOT NULL DEFAULT 'remote',
  eligibility text NOT NULL DEFAULT 'unspecified',
  employment_type text,
  experience text,
  salary_min numeric,
  salary_max numeric,
  currency text,
  pay_unit text,
  tags text[] NOT NULL DEFAULT '{}',
  source_url text,
  apply_url text NOT NULL,
  published_at timestamptz,
  imported_at timestamptz NOT NULL DEFAULT now(),
  last_checked_at timestamptz NOT NULL DEFAULT now(),
  is_expired boolean NOT NULL DEFAULT false,
  search tsvector GENERATED ALWAYS AS (
    to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(company,'') || ' ' || coalesce(description,'') || ' ' || coalesce(location,''))
  ) STORED,
  UNIQUE (source_id, external_id)
);
CREATE INDEX external_jobs_search_idx ON public.external_jobs USING gin(search);
CREATE INDEX external_jobs_pub_idx ON public.external_jobs (published_at DESC) WHERE NOT is_expired;
CREATE INDEX external_jobs_dedupe_idx ON public.external_jobs (dedupe_key);
GRANT SELECT ON public.external_jobs TO anon, authenticated;
GRANT ALL ON public.external_jobs TO service_role;
ALTER TABLE public.external_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "External: public read" ON public.external_jobs FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.job_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id text NOT NULL REFERENCES public.job_sources(id),
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  status text NOT NULL,
  fetched integer NOT NULL DEFAULT 0,
  inserted integer NOT NULL DEFAULT 0,
  updated integer NOT NULL DEFAULT 0,
  skipped_duplicates integer NOT NULL DEFAULT 0,
  expired integer NOT NULL DEFAULT 0,
  error text
);
GRANT SELECT ON public.job_sync_logs TO authenticated;
GRANT ALL ON public.job_sync_logs TO service_role;
ALTER TABLE public.job_sync_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "SyncLogs: admin read" ON public.job_sync_logs FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

CREATE TABLE public.user_job_actions (
  user_id uuid NOT NULL,
  listing_id text NOT NULL,
  action text NOT NULL CHECK (action IN ('save','hide')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, listing_id, action)
);
GRANT SELECT, INSERT, DELETE ON public.user_job_actions TO authenticated;
GRANT ALL ON public.user_job_actions TO service_role;
ALTER TABLE public.user_job_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Actions: own read" ON public.user_job_actions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Actions: own insert" ON public.user_job_actions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Actions: own delete" ON public.user_job_actions FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Unified listings (safe fields only)
CREATE OR REPLACE FUNCTION public.listings_base()
RETURNS TABLE (
  listing_id text, kind text, slug text, title text, company text, logo_url text, location text,
  region text, workplace text, eligibility text, employment_type text, experience text,
  salary_min numeric, salary_max numeric, currency text, pay_unit text, tags text[],
  published_at timestamptz, discovered_at timestamptz, deadline date, source_name text,
  source_url text, apply_url text, description text, category_slug text, search tsvector
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT 'i:' || j.id::text, 'internal', j.slug, j.title, c.name, NULL::text, j.location, j.region,
    CASE WHEN j.is_remote THEN 'remote' ELSE 'onsite' END,
    CASE WHEN j.is_remote THEN 'unspecified' ELSE 'tanzania' END,
    j.employment_type::text, j.experience_level::text, j.salary_min, j.salary_max, j.currency, NULL::text,
    coalesce((SELECT array_agg(s.skill) FROM job_skills s WHERE s.job_id = j.id), '{}'),
    j.published_at, j.created_at, j.application_deadline, 'KaziLink', NULL::text, NULL::text,
    j.description, jc.slug,
    to_tsvector('simple', j.title || ' ' || coalesce(c.name,'') || ' ' || j.description || ' ' || coalesce(j.location,''))
  FROM jobs j JOIN companies c ON c.id = j.company_id
  LEFT JOIN job_categories jc ON jc.id = j.category_id
  WHERE j.status = 'published' AND (j.application_deadline IS NULL OR j.application_deadline >= current_date)
  UNION ALL
  SELECT 'e:' || e.id::text, 'external', e.id::text, e.title, e.company, e.logo_url, e.location, NULL,
    e.workplace, e.eligibility, e.employment_type, e.experience, e.salary_min, e.salary_max, e.currency, e.pay_unit,
    e.tags, e.published_at, e.imported_at, NULL::date, s.name, e.source_url, e.apply_url, e.description, NULL::text, e.search
  FROM external_jobs e JOIN job_sources s ON s.id = e.source_id
  WHERE NOT e.is_expired AND s.enabled
$$;

CREATE OR REPLACE FUNCTION public.search_listings(
  _q text DEFAULT NULL, _kind text DEFAULT NULL, _employment_type text DEFAULT NULL,
  _experience text DEFAULT NULL, _region text DEFAULT NULL, _workplace text DEFAULT NULL,
  _eligibility text DEFAULT NULL, _pay_unit text DEFAULT NULL, _min_salary numeric DEFAULT NULL,
  _currency text DEFAULT NULL, _days integer DEFAULT NULL, _category text DEFAULT NULL,
  _sort text DEFAULT 'newest', _limit integer DEFAULT 20, _offset integer DEFAULT 0
)
RETURNS TABLE (
  listing_id text, kind text, slug text, title text, company text, logo_url text, location text,
  region text, workplace text, eligibility text, employment_type text, experience text,
  salary_min numeric, salary_max numeric, currency text, pay_unit text, tags text[],
  published_at timestamptz, discovered_at timestamptz, deadline date, source_name text,
  apply_url text, total_count bigint
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT b.listing_id, b.kind, b.slug, b.title, b.company, b.logo_url, b.location, b.region, b.workplace,
    b.eligibility, b.employment_type, b.experience, b.salary_min, b.salary_max, b.currency, b.pay_unit,
    b.tags, b.published_at, b.discovered_at, b.deadline, b.source_name, b.apply_url,
    count(*) OVER ()
  FROM listings_base() b
  WHERE (_q IS NULL OR _q = '' OR b.search @@ websearch_to_tsquery('simple', _q)
         OR b.title ILIKE '%' || _q || '%' OR b.company ILIKE '%' || _q || '%'
         OR EXISTS (SELECT 1 FROM unnest(b.tags) t WHERE t ILIKE '%' || _q || '%'))
    AND (_kind IS NULL OR b.kind = _kind)
    AND (_employment_type IS NULL OR b.employment_type = _employment_type)
    AND (_experience IS NULL OR b.experience = _experience)
    AND (_region IS NULL OR b.region ILIKE _region OR b.location ILIKE '%' || _region || '%')
    AND (_workplace IS NULL OR b.workplace = _workplace)
    AND (_eligibility IS NULL OR b.eligibility = _eligibility)
    AND (_pay_unit IS NULL OR (_pay_unit = 'not_listed' AND b.salary_min IS NULL AND b.salary_max IS NULL) OR b.pay_unit = _pay_unit)
    AND (_min_salary IS NULL OR coalesce(b.salary_max, b.salary_min) >= _min_salary)
    AND (_currency IS NULL OR b.currency = _currency)
    AND (_days IS NULL OR coalesce(b.published_at, b.discovered_at) >= now() - make_interval(days => _days))
    AND (_category IS NULL OR b.category_slug = _category)
  ORDER BY
    CASE WHEN _sort = 'salary' THEN coalesce(b.salary_max, b.salary_min) END DESC NULLS LAST,
    coalesce(b.published_at, b.discovered_at) DESC NULLS LAST
  LIMIT least(greatest(_limit, 1), 50) OFFSET greatest(_offset, 0)
$$;

CREATE OR REPLACE FUNCTION public.get_external_listing(_id uuid)
RETURNS TABLE (
  id uuid, title text, company text, logo_url text, description text, location text, workplace text,
  eligibility text, employment_type text, experience text, salary_min numeric, salary_max numeric,
  currency text, pay_unit text, tags text[], source_name text, source_website text, source_url text,
  apply_url text, published_at timestamptz, imported_at timestamptz, last_checked_at timestamptz, is_expired boolean
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT e.id, e.title, e.company, e.logo_url, e.description, e.location, e.workplace, e.eligibility,
    e.employment_type, e.experience, e.salary_min, e.salary_max, e.currency, e.pay_unit, e.tags,
    s.name, s.website, e.source_url, e.apply_url, e.published_at, e.imported_at, e.last_checked_at, e.is_expired
  FROM external_jobs e JOIN job_sources s ON s.id = e.source_id WHERE e.id = _id
$$;

REVOKE EXECUTE ON FUNCTION public.listings_base() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.search_listings TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_external_listing TO anon, authenticated;