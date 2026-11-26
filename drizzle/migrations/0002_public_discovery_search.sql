CREATE OR REPLACE FUNCTION public.discover_jobs(_filters jsonb DEFAULT '{}'::jsonb) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
WITH filtered AS (
 SELECT b.* FROM public.listings_base() b
 WHERE (coalesce(_filters->>'q','') = '' OR b.search @@ websearch_to_tsquery('simple', _filters->>'q') OR b.title ILIKE '%'||(_filters->>'q')||'%' OR b.company ILIKE '%'||(_filters->>'q')||'%' OR EXISTS(SELECT 1 FROM unnest(b.tags) t WHERE t ILIKE '%'||(_filters->>'q')||'%'))
 AND (coalesce(_filters->>'category','')='' OR b.category_slug = _filters->>'category')
 AND (coalesce(_filters->>'kind','')='' OR b.kind = _filters->>'kind')
 AND (coalesce(_filters->>'type','')='' OR b.employment_type = _filters->>'type')
 AND (coalesce(_filters->>'experience','')='' OR b.experience = _filters->>'experience')
 AND (coalesce(_filters->>'region','')='' OR b.region ILIKE '%'||(_filters->>'region')||'%' OR b.location ILIKE '%'||(_filters->>'region')||'%')
 AND (coalesce(_filters->>'workplace','')='' OR b.workplace = _filters->>'workplace')
 AND (coalesce((_filters->>'remote')::boolean,false)=false OR b.workplace='remote')
 AND (coalesce(_filters->>'eligibility','')='' OR b.eligibility = _filters->>'eligibility')
 AND (coalesce(_filters->>'currency','')='' OR b.currency = _filters->>'currency')
 AND (coalesce(_filters->>'pay','')='' OR b.pay_unit = _filters->>'pay' OR (_filters->>'pay'='not_listed' AND b.salary_min IS NULL AND b.salary_max IS NULL))
 AND (coalesce(_filters->>'min','')='' OR coalesce(b.salary_max,b.salary_min) >= (_filters->>'min')::numeric)
 AND (coalesce(_filters->>'max','')='' OR coalesce(b.salary_min,b.salary_max) <= (_filters->>'max')::numeric)
 AND (coalesce(_filters->>'days','')='' OR coalesce(b.published_at,b.discovered_at)>=now()-make_interval(days=>(_filters->>'days')::integer))
 AND (CASE WHEN _filters->>'view'='hidden' THEN EXISTS(SELECT 1 FROM user_job_actions a WHERE a.user_id=auth.uid() AND a.listing_id=b.listing_id AND a.action='hide') ELSE NOT EXISTS(SELECT 1 FROM user_job_actions a WHERE a.user_id=auth.uid() AND a.listing_id=b.listing_id AND a.action='hide') END)
 AND (coalesce(_filters->>'view','')!='saved' OR EXISTS(SELECT 1 FROM user_job_actions a WHERE a.user_id=auth.uid() AND a.listing_id=b.listing_id AND a.action='save'))
), paged AS (
 SELECT to_jsonb(f)-'search'-'description' AS job FROM filtered f
 ORDER BY CASE WHEN _filters->>'sort'='salary' AND coalesce(_filters->>'currency','')!='' AND coalesce(_filters->>'pay','') IN ('hourly','daily','monthly','yearly','per_task') THEN coalesce(f.salary_max,f.salary_min) END DESC NULLS LAST,
 coalesce(f.published_at,f.discovered_at) DESC NULLS LAST, f.listing_id
 LIMIT least(greatest(coalesce((_filters->>'limit')::integer,20),1),50)
 OFFSET (greatest(coalesce((_filters->>'page')::integer,1),1)-1)*least(greatest(coalesce((_filters->>'limit')::integer,20),1),50)
)
SELECT jsonb_build_object('jobs',coalesce((SELECT jsonb_agg(job) FROM paged),'[]'::jsonb),'total',(SELECT count(*) FROM filtered)); $$;
REVOKE EXECUTE ON FUNCTION public.discover_jobs(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.discover_jobs(jsonb) TO anon, authenticated;
CREATE OR REPLACE FUNCTION public.public_job_detail(_slug text) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
SELECT jsonb_build_object('id',j.id,'slug',j.slug,'title',j.title,'description',j.description,'requirements',j.requirements,'responsibilities',j.responsibilities,'location',j.location,'employment_type',j.employment_type,'experience_level',j.experience_level,'is_remote',j.is_remote,'application_deadline',j.application_deadline,'published_at',j.published_at,'salary_min',j.salary_min,'salary_max',j.salary_max,'currency',j.currency,'companies',jsonb_build_object('name',c.name,'description',c.description,'website',c.website),'job_skills',coalesce((SELECT jsonb_agg(jsonb_build_object('skill',s.skill)) FROM job_skills s WHERE s.job_id=j.id),'[]'::jsonb))
FROM jobs j JOIN companies c ON c.id=j.company_id WHERE j.slug=_slug AND j.status='published' AND (j.application_deadline IS NULL OR j.application_deadline>=current_date); $$;
REVOKE EXECUTE ON FUNCTION public.public_job_detail(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.public_job_detail(text) TO anon, authenticated;
GRANT SELECT ON public.job_categories TO anon;
CREATE POLICY "Active categories for visitors" ON public.job_categories FOR SELECT TO anon USING(active=true);