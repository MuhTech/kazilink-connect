# KaziLink Tanzania – multi-source job discovery upgrade

Upgrade the existing app in stages (from your brief). Everything already built (sign-in, roles, companies, employer job posting, applications, admin panel, English/Kiswahili) stays. No fake jobs, no invented salaries or eligibility.

## Stage 1 – Core job discovery (this round)
- **Public job board**: visitors can browse and search without signing in (today jobs are only visible after sign-in).
- **One combined job list** of KaziLink employer jobs + imported external jobs, clearly labelled ("KaziLink employer" vs "From Remote OK / Jobicy").
- **Job cards**: title, company + logo, location, remote/hybrid/on-site, type, salary + pay unit (only when the source gives it), experience, skills, posted date, discovered date, deadline, source, "New" badge.
- **Search & filters** that run against real data: keyword (title, company, skills, description), opportunity type, experience, location/region (Dar es Salaam, Arusha, Dodoma, Mwanza, Mbeya, Zanzibar…), remote eligibility (Tanzania / Africa / Worldwide / restricted / not specified), pay unit, salary range + currency, date posted, internal vs external. Sorting, pagination, accurate counts.
- **Job details page**: full description, source attribution, "Apply now" opens the original link for external jobs; internal jobs keep the in-app application.
- **Save / hide / share** jobs (saved and hidden persist per user).
- **Homepage refresh**: new tagline "Find Opportunities. Build Your Future.", live search, latest real jobs, category tiles, remote jobs strip.

## Stage 2 – External sources (this round)
- Connectors for **Remote OK** and **Jobicy** (both offer free public feeds that allow reuse with a link back to the source).
- Each connector runs on its own: fetch, check, normalise, de-duplicate (source + external id, plus title/company match), update existing, mark expired/removed, log results.
- Automatic sync every few hours plus a "Sync now" button for admins.
- Admin "Sources" screen: on/off per source, last successful sync, status, errors, counts – only real numbers.
- Later candidates: We Work Remotely (terms need checking), Adzuna (needs a free API key; no Tanzania coverage, but covers South Africa and remote).

## Later rounds
- Stage 3: preferences, saved searches, email job alerts (needs an email setup), country and profession pages.
- Stage 4: report-a-scam flow, moderation queue, employer verification upgrades, platform directory.
- Stage 5: security/database review, mobile + search testing, SEO pages.

## Technical details
- New tables: `job_sources`, `external_jobs` (source_id, external_id unique, apply_url, company, logo, location, eligibility, salary_min/max, currency, pay_unit, tags, published_at, imported_at, last_checked_at, is_expired), `job_sync_logs`, `hidden_jobs`, `saved_external_jobs`. RLS: public read of active jobs/sources; writes only via server sync; admin-only logs.
- Add anon read policy for published `jobs`, `job_categories`, verified `companies` (public fields only) so the board works signed-out.
- Unified search via a SQL view/RPC combining internal + external rows with full-text search, filters, sort, paging.
- Sync = server route under `/api/public/sync` protected by a secret header, called by pg_cron; connectors in `src/lib/connectors/*`, each isolated with try/catch, timeouts and backoff.
- Unit tests for normalisation and de-duplication rules.

Assumption: Stages 1–2 now, the rest in follow-up rounds.
