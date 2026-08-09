-- THE LAW trust-contract hardening + first current source-backed Georgia record.
-- Public "verified" catalog must only return records that have both a completed
-- verification state and an exact verified official-source citation.
-- The broader research backlog remains available through a separate, explicitly
-- named bounded RPC and direct table access remains revoked.

begin;

-- 1) Add/refresh the exact official Georgia General Assembly source for HB 1009 / Act 395.
with ga as (
  select id from public.rr_jurisdictions where slug = 'georgia' limit 1
)
insert into public.rr_legal_sources (
  source_title,
  source_url,
  source_type,
  source_date,
  source_status,
  trust_label,
  jurisdiction_id,
  summary,
  authority_level,
  authority_rank,
  verification_status,
  last_checked_at,
  retrieval_metadata
)
select
  'Georgia HB 1009 / Act 395 — Georgia General Assembly',
  'https://www.legis.ga.gov/legislation/72304',
  'official_legislation',
  date '2026-05-05',
  'approved',
  'official',
  ga.id,
  'Official Georgia General Assembly legislation page for HB 1009 (2025–2026 Regular Session), signed as Act 395.',
  'primary_official',
  100,
  'verified',
  now(),
  jsonb_build_object(
    'checked_from', 'official_legislature_page',
    'signed_date', '2026-05-05',
    'act_number', '395',
    'effective_date', '2026-12-31'
  )
from ga
on conflict (source_url) where source_url is not null do update set
  source_title = excluded.source_title,
  source_type = excluded.source_type,
  source_date = excluded.source_date,
  source_status = excluded.source_status,
  trust_label = excluded.trust_label,
  jurisdiction_id = excluded.jurisdiction_id,
  summary = excluded.summary,
  authority_level = excluded.authority_level,
  authority_rank = excluded.authority_rank,
  verification_status = excluded.verification_status,
  last_checked_at = excluded.last_checked_at,
  retrieval_metadata = excluded.retrieval_metadata,
  updated_at = now();

-- 2) Add/refresh the public research record. This is machine source-checked,
-- not human- or attorney-reviewed.
with ga as (
  select id from public.rr_jurisdictions where slug = 'georgia' limit 1
)
insert into public.rr_law_records (
  law_title,
  slug,
  jurisdiction_id,
  law_type,
  short_summary,
  long_summary,
  affected_parties_text,
  effective_date,
  status,
  publication_status,
  verification_status,
  last_verified_at,
  next_review_at,
  risk_level,
  source_confidence,
  published_at
)
select
  'Georgia HB 1009 / Act 395 — Student Personal Electronic Device Policies',
  'ga-hb-1009-act-395-student-electronic-device-policies',
  ga.id,
  'statute',
  'Requires Georgia public-school systems to adopt policies and procedures governing student personal electronic device use for grades 9–12.',
  'Georgia HB 1009, signed as Act 395 on May 5, 2026, requires local school systems and public schools to establish and implement policies and procedures addressing student use of personal electronic devices in grades 9–12, including permitted-use circumstances and implementation requirements. The official legislation page lists an effective date of December 31, 2026.',
  'Georgia local boards of education, public schools, students in grades 9–12, parents and guardians.',
  date '2026-12-31',
  'published',
  'in_review',
  'machine_checked',
  now(),
  now() + interval '30 days',
  'standard',
  0.99,
  now()
from ga
on conflict (slug) do update set
  law_title = excluded.law_title,
  jurisdiction_id = excluded.jurisdiction_id,
  law_type = excluded.law_type,
  short_summary = excluded.short_summary,
  long_summary = excluded.long_summary,
  affected_parties_text = excluded.affected_parties_text,
  effective_date = excluded.effective_date,
  status = excluded.status,
  publication_status = excluded.publication_status,
  verification_status = excluded.verification_status,
  last_verified_at = excluded.last_verified_at,
  next_review_at = excluded.next_review_at,
  risk_level = excluded.risk_level,
  source_confidence = excluded.source_confidence,
  published_at = coalesce(public.rr_law_records.published_at, excluded.published_at),
  updated_at = now();

-- 3) Connect the record to the exact official source.
with law as (
  select id from public.rr_law_records
  where slug = 'ga-hb-1009-act-395-student-electronic-device-policies'
  limit 1
), source as (
  select id from public.rr_legal_sources
  where source_url = 'https://www.legis.ga.gov/legislation/72304'
  limit 1
)
insert into public.rr_source_law_records (source_id, law_record_id)
select source.id, law.id from source cross join law
on conflict (source_id, law_record_id) do nothing;

-- Keep exactly one canonical verified citation for this source/record pair.
delete from public.rr_citations c
using public.rr_law_records l
where c.law_record_id = l.id
  and l.slug = 'ga-hb-1009-act-395-student-electronic-device-policies'
  and c.official_reference_url = 'https://www.legis.ga.gov/legislation/72304';

with law as (
  select id from public.rr_law_records
  where slug = 'ga-hb-1009-act-395-student-electronic-device-policies'
  limit 1
)
insert into public.rr_citations (
  law_record_id,
  citation_text,
  citation_type,
  official_reference_url,
  verification_status,
  last_verified_at,
  quote_excerpt
)
select
  law.id,
  'Georgia HB 1009 (2025–2026 Regular Session), Act 395',
  'official_legislation',
  'https://www.legis.ga.gov/legislation/72304',
  'verified',
  now(),
  null
from law;

-- 4) Store a machine-verification evidence packet. This proves source/citation
-- matching only; it does not claim attorney review.
with law as (
  select id from public.rr_law_records
  where slug = 'ga-hb-1009-act-395-student-electronic-device-policies'
  limit 1
), source as (
  select id from public.rr_legal_sources
  where source_url = 'https://www.legis.ga.gov/legislation/72304'
  limit 1
)
insert into public.rr_verification_evidence (
  law_record_id,
  source_id,
  check_method,
  check_status,
  title_match,
  citation_match,
  jurisdiction_match,
  source_currency_text,
  checked_at,
  evidence
)
select
  law.id,
  source.id,
  'official_page_manual_source_check',
  'passed',
  true,
  true,
  true,
  'Official Georgia General Assembly page checked for the 2025–2026 Regular Session; page lists Governor signature 2026-05-05, Act 395, and effective date 2026-12-31.',
  now(),
  jsonb_build_object(
    'source_url', 'https://www.legis.ga.gov/legislation/72304',
    'session', '2025-2026 Regular Session',
    'bill', 'HB 1009',
    'act_number', '395',
    'signed_date', '2026-05-05',
    'effective_date', '2026-12-31',
    'review_level', 'machine_source_check_only'
  )
from law cross join source
on conflict (law_record_id, source_id, check_method) do update set
  check_status = excluded.check_status,
  title_match = excluded.title_match,
  citation_match = excluded.citation_match,
  jurisdiction_match = excluded.jurisdiction_match,
  source_currency_text = excluded.source_currency_text,
  checked_at = excluded.checked_at,
  evidence = excluded.evidence;

-- 5) Trusted catalog: source-backed records only.
create or replace function public.rr_get_public_law_catalog(
  p_query text default null,
  p_jurisdiction_type text default 'federal',
  p_limit integer default 80,
  p_offset integer default 0
)
returns jsonb
language sql
stable
security definer
set search_path to 'pg_catalog','public'
as $$
  with filtered as (
    select
      l.id,l.law_title,l.slug,l.law_type,l.short_summary,l.long_summary,
      l.affected_parties_text,l.effective_date,l.verification_status,
      l.publication_status,l.source_confidence,l.last_verified_at,l.next_review_at,
      j.name as jurisdiction_name,j.jurisdiction_type,
      coalesce((
        select jsonb_agg(jsonb_build_object(
          'citation_text',c.citation_text,
          'official_reference_url',c.official_reference_url,
          'verification_status',c.verification_status,
          'last_verified_at',c.last_verified_at
        ) order by (c.verification_status='verified') desc,c.created_at)
        from public.rr_citations c where c.law_record_id=l.id
      ),'[]'::jsonb) as citations
    from public.rr_law_records l
    join public.rr_jurisdictions j on j.id=l.jurisdiction_id
    where l.status='published'
      and l.verification_status in ('machine_checked','human_reviewed','attorney_reviewed')
      and exists (
        select 1 from public.rr_citations verified_citation
        where verified_citation.law_record_id=l.id
          and verified_citation.verification_status='verified'
          and nullif(trim(coalesce(verified_citation.official_reference_url,'')),'') is not null
      )
      and j.jurisdiction_type=case when lower(coalesce(p_jurisdiction_type,'')) in ('federal','state')
        then lower(p_jurisdiction_type) else 'federal' end
      and (
        nullif(trim(coalesce(p_query,'')),'') is null
        or l.law_title ilike '%'||trim(p_query)||'%'
        or coalesce(l.short_summary,'') ilike '%'||trim(p_query)||'%'
        or coalesce(l.affected_parties_text,'') ilike '%'||trim(p_query)||'%'
      )
  ), paged as (
    select * from filtered
    order by
      case verification_status
        when 'attorney_reviewed' then 4
        when 'human_reviewed' then 3
        when 'machine_checked' then 2
        else 1
      end desc,
      source_confidence desc nulls last,
      law_title
    limit least(greatest(coalesce(p_limit,80),1),100)
    offset greatest(coalesce(p_offset,0),0)
  )
  select jsonb_build_object(
    'records',coalesce((select jsonb_agg(jsonb_build_object(
      'id',p.id,'law_title',p.law_title,'slug',p.slug,'law_type',p.law_type,
      'short_summary',p.short_summary,'long_summary',p.long_summary,
      'affected_parties_text',p.affected_parties_text,'effective_date',p.effective_date,
      'verification_status',p.verification_status,'publication_status',p.publication_status,
      'source_confidence',p.source_confidence,'last_verified_at',p.last_verified_at,
      'next_review_at',p.next_review_at,
      'jurisdiction',jsonb_build_object('name',p.jurisdiction_name,'jurisdiction_type',p.jurisdiction_type),
      'citations',p.citations
    )) from paged p),'[]'::jsonb),
    'total',(select count(*) from filtered),
    'limit',least(greatest(coalesce(p_limit,80),1),100),
    'offset',greatest(coalesce(p_offset,0),0),
    'trust_mode','source_backed'
  );
$$;

-- 6) Bounded research index: preserves the broader backlog, but under an RPC
-- whose name and response explicitly identify the material as research-only.
create or replace function public.rr_get_public_research_catalog(
  p_query text default null,
  p_jurisdiction_type text default 'federal',
  p_limit integer default 80,
  p_offset integer default 0
)
returns jsonb
language sql
stable
security definer
set search_path to 'pg_catalog','public'
as $$
  with filtered as (
    select
      l.id,l.law_title,l.slug,l.law_type,l.short_summary,l.long_summary,
      l.affected_parties_text,l.effective_date,l.verification_status,
      l.publication_status,l.source_confidence,l.last_verified_at,l.next_review_at,
      j.name as jurisdiction_name,j.jurisdiction_type,
      coalesce((
        select jsonb_agg(jsonb_build_object(
          'citation_text',c.citation_text,
          'official_reference_url',c.official_reference_url,
          'verification_status',c.verification_status,
          'last_verified_at',c.last_verified_at
        ) order by (c.verification_status='verified') desc,c.created_at)
        from public.rr_citations c where c.law_record_id=l.id
      ),'[]'::jsonb) as citations
    from public.rr_law_records l
    join public.rr_jurisdictions j on j.id=l.jurisdiction_id
    where l.status='published'
      and j.jurisdiction_type=case when lower(coalesce(p_jurisdiction_type,'')) in ('federal','state')
        then lower(p_jurisdiction_type) else 'federal' end
      and (
        nullif(trim(coalesce(p_query,'')),'') is null
        or l.law_title ilike '%'||trim(p_query)||'%'
        or coalesce(l.short_summary,'') ilike '%'||trim(p_query)||'%'
        or coalesce(l.affected_parties_text,'') ilike '%'||trim(p_query)||'%'
      )
  ), paged as (
    select * from filtered
    order by
      case verification_status
        when 'attorney_reviewed' then 4
        when 'human_reviewed' then 3
        when 'machine_checked' then 2
        else 1
      end desc,
      source_confidence desc nulls last,
      law_title
    limit least(greatest(coalesce(p_limit,80),1),100)
    offset greatest(coalesce(p_offset,0),0)
  )
  select jsonb_build_object(
    'records',coalesce((select jsonb_agg(jsonb_build_object(
      'id',p.id,'law_title',p.law_title,'slug',p.slug,'law_type',p.law_type,
      'short_summary',p.short_summary,'long_summary',p.long_summary,
      'affected_parties_text',p.affected_parties_text,'effective_date',p.effective_date,
      'verification_status',p.verification_status,'publication_status',p.publication_status,
      'source_confidence',p.source_confidence,'last_verified_at',p.last_verified_at,
      'next_review_at',p.next_review_at,
      'jurisdiction',jsonb_build_object('name',p.jurisdiction_name,'jurisdiction_type',p.jurisdiction_type),
      'citations',p.citations
    )) from paged p),'[]'::jsonb),
    'total',(select count(*) from filtered),
    'limit',least(greatest(coalesce(p_limit,80),1),100),
    'offset',greatest(coalesce(p_offset,0),0),
    'trust_mode','research_only'
  );
$$;

-- 7) Health numbers now distinguish trusted public records from the backlog.
create or replace function public.rr_get_public_catalog_health()
returns jsonb
language sql
stable
security definer
set search_path to 'pg_catalog','public'
as $$
  with all_records as (
    select l.* from public.rr_law_records l where l.status='published'
  ), trusted as (
    select l.* from all_records l
    where l.verification_status in ('machine_checked','human_reviewed','attorney_reviewed')
      and exists (
        select 1 from public.rr_citations c
        where c.law_record_id=l.id
          and c.verification_status='verified'
          and nullif(trim(coalesce(c.official_reference_url,'')),'') is not null
      )
  )
  select jsonb_build_object(
    'total_records',(select count(*) from trusted),
    'research_index_records',(select count(*) from all_records),
    'machine_checked_records',(select count(*) from trusted where verification_status='machine_checked'),
    'human_reviewed_records',(select count(*) from trusted where verification_status='human_reviewed'),
    'attorney_reviewed_records',(select count(*) from trusted where verification_status='attorney_reviewed'),
    'unverified_records',(select count(*) from all_records where verification_status='unverified'),
    'records_with_verified_citations',(select count(*) from trusted),
    'official_sources',(select count(*) from public.rr_legal_sources s
      where s.source_status='approved' and s.trust_label='official'
        and s.verification_status in ('reachable','verified')),
    'priority_jurisdictions',(select count(distinct j.id)
      from trusted t join public.rr_jurisdictions j on j.id=t.jurisdiction_id
      where j.jurisdiction_type in ('federal','state')),
    'generated_at',now()
  );
$$;

-- Preserve bounded RPC-only public access.
revoke all on function public.rr_get_public_research_catalog(text,text,integer,integer) from public;
grant execute on function public.rr_get_public_research_catalog(text,text,integer,integer) to anon,authenticated,service_role;

revoke all on function public.rr_get_public_law_catalog(text,text,integer,integer) from public;
revoke all on function public.rr_get_public_catalog_health() from public;
grant execute on function public.rr_get_public_law_catalog(text,text,integer,integer) to anon,authenticated,service_role;
grant execute on function public.rr_get_public_catalog_health() to anon,authenticated,service_role;

commit;
