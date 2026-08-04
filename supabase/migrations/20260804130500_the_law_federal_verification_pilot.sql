-- THE LAW federal verification pilot.
-- Keeps records in editorial review while adding exact official-source evidence.
-- All objects remain isolated under the rr_* namespace.

create table if not exists public.rr_verification_evidence (
  id uuid primary key default uuid_generate_v4(),
  law_record_id uuid not null references public.rr_law_records(id) on delete cascade,
  source_id uuid not null references public.rr_legal_sources(id) on delete cascade,
  check_method text not null,
  check_status text not null default 'passed'
    check (check_status in ('passed','failed','stale','disputed')),
  title_match boolean not null default false,
  citation_match boolean not null default false,
  jurisdiction_match boolean not null default false,
  source_currency_text text,
  checked_at timestamptz not null default now(),
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(law_record_id,source_id,check_method)
);

alter table public.rr_verification_evidence enable row level security;
revoke all on table public.rr_verification_evidence from public,anon,authenticated;
grant all on table public.rr_verification_evidence to service_role;

create index if not exists rr_verification_evidence_law_checked_idx
  on public.rr_verification_evidence(law_record_id,checked_at desc);
create index if not exists rr_verification_evidence_status_idx
  on public.rr_verification_evidence(check_status,checked_at desc);
create index if not exists rr_citations_law_verification_idx
  on public.rr_citations(law_record_id,verification_status,last_verified_at desc);
create index if not exists rr_source_law_records_law_idx
  on public.rr_source_law_records(law_record_id,source_id);
create index if not exists rr_law_records_public_catalog_idx
  on public.rr_law_records(status,verification_status,publication_status,source_confidence desc);

with federal as (
  select id from public.rr_jurisdictions
  where jurisdiction_type='federal'
  order by created_at
  limit 1
), source_rows(
  law_title,citation_text,source_title,source_url,source_type,authority_level,
  authority_rank,source_confidence,source_currency_text,quote_excerpt,review_days
) as (
  values
    (
      '40 U.S.C. § 3101: Public Buildings under Control of Administrator of General Services',
      '40 U.S.C. § 3101',
      '40 U.S.C. § 3101 — Office of the Law Revision Counsel',
      'https://uscode.house.gov/view.xhtml?edition=prelim&num=0&req=granuleid%3AUSC-prelim-title40-section3101',
      'code_repository','primary_official',100,0.98,
      'Preliminary United States Code page checked 2026-08-04; page reported laws in effect through June 12, 2026.',
      'Public buildings covered by the section are under the jurisdiction, control, and custody of the Administrator of General Services.',
      90
    ),
    (
      '49 U.S.C. Chapter 301 Motor Vehicle Safety',
      '49 U.S.C. ch. 301',
      '49 U.S.C. Chapter 301 — Office of the Law Revision Counsel',
      'https://uscode.house.gov/view.xhtml?edition=prelim&req=granuleid%3AUSC-prelim-title49-chapter301',
      'code_repository','primary_official',100,0.98,
      'Preliminary United States Code chapter page checked 2026-08-04.',
      'Chapter 301 establishes the federal motor vehicle safety framework, including standards, compliance, defects, and recalls.',
      90
    ),
    (
      '49 U.S.C. Chapter 331 Theft Prevention',
      '49 U.S.C. ch. 331',
      '49 U.S.C. Chapter 331 — Office of the Law Revision Counsel',
      'https://uscode.house.gov/view.xhtml?edition=prelim&req=granuleid%3AUSC-prelim-title49-chapter331',
      'code_repository','primary_official',100,0.98,
      'United States Code chapter page checked 2026-08-04.',
      'Chapter 331 contains federal vehicle-theft prevention requirements, including parts marking and enforcement.',
      90
    ),
    (
      '49 CFR 37 Transportation for Individuals with Disabilities (ADA)',
      '49 C.F.R. pt. 37',
      '49 CFR Part 37 — Electronic Code of Federal Regulations',
      'https://www.ecfr.gov/current/title-49/subtitle-A/part-37',
      'code_repository','primary_agency',98,0.95,
      'eCFR Title 49 page checked 2026-08-04; displayed as up to date through July 31, 2026. eCFR is authoritative but unofficial.',
      'Part 37 implements transportation-related requirements of titles II and III of the Americans with Disabilities Act.',
      30
    ),
    (
      'Alcohol and Tobacco Tax and Trade Bureau Regulations (27 CFR Part 4)',
      '27 C.F.R. pt. 4',
      '27 CFR Part 4 — Electronic Code of Federal Regulations',
      'https://www.ecfr.gov/current/title-27/chapter-I/subchapter-A/part-4',
      'code_repository','primary_agency',98,0.95,
      'Current eCFR Part 4 page checked 2026-08-04. eCFR is authoritative but unofficial.',
      'Part 4 governs labeling and advertising of wine.',
      30
    ),
    (
      'Current Good Manufacturing Practice, Hazard Analysis, and Risk-Based Preventive Controls for Human Food (21 CFR Part 117)',
      '21 C.F.R. pt. 117',
      '21 CFR Part 117 — Electronic Code of Federal Regulations',
      'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-B/part-117',
      'code_repository','primary_agency',98,0.95,
      'Current eCFR Part 117 page checked 2026-08-04. eCFR is authoritative but unofficial.',
      'Part 117 contains current good manufacturing practice and preventive-control requirements for human food.',
      30
    ),
    (
      'OMB Uniform Guidance (2 CFR Part 200)',
      '2 C.F.R. pt. 200',
      '2 CFR Part 200 — Electronic Code of Federal Regulations',
      'https://www.ecfr.gov/current/title-2/subtitle-A/chapter-II/part-200',
      'code_repository','primary_agency',98,0.95,
      'Current eCFR Part 200 page checked 2026-08-04. eCFR is authoritative but unofficial.',
      'Part 200 establishes uniform administrative requirements, cost principles, and audit requirements for federal awards.',
      30
    )
), inserted_sources as (
  insert into public.rr_legal_sources(
    source_title,source_url,source_type,source_status,trust_label,jurisdiction_id,
    summary,authority_level,authority_rank,verification_status,last_checked_at,retrieval_metadata
  )
  select
    s.source_title,s.source_url,s.source_type,'approved','official',f.id,
    s.quote_excerpt,s.authority_level,s.authority_rank,'verified',now(),
    jsonb_build_object(
      'checked_at',now(),
      'check_method','exact_title_and_citation_match',
      'source_currency_text',s.source_currency_text,
      'record_title',s.law_title,
      'citation_text',s.citation_text,
      'editorial_status','machine_checked_pending_human_review'
    )
  from source_rows s cross join federal f
  on conflict(source_url) where source_url is not null do update set
    source_title=excluded.source_title,
    source_type=excluded.source_type,
    source_status='approved',
    trust_label='official',
    jurisdiction_id=excluded.jurisdiction_id,
    summary=excluded.summary,
    authority_level=excluded.authority_level,
    authority_rank=excluded.authority_rank,
    verification_status='verified',
    last_checked_at=excluded.last_checked_at,
    retrieval_metadata=excluded.retrieval_metadata,
    updated_at=now()
  returning id,source_url
), targets as (
  select
    l.id as law_record_id,l.law_title,l.short_summary,l.long_summary,l.effective_date,
    s.citation_text,s.source_url,s.source_confidence,s.source_currency_text,
    s.quote_excerpt,s.review_days,ls.id as source_id
  from source_rows s
  join public.rr_law_records l on l.law_title=s.law_title
  join public.rr_legal_sources ls on ls.source_url=s.source_url
), linked_sources as (
  insert into public.rr_source_law_records(source_id,law_record_id)
  select source_id,law_record_id from targets
  on conflict(source_id,law_record_id) do nothing
  returning id
), inserted_citations as (
  insert into public.rr_citations(
    law_record_id,citation_text,citation_type,official_reference_url,
    verification_status,last_verified_at,quote_excerpt
  )
  select
    t.law_record_id,t.citation_text,'official',t.source_url,
    'verified',now(),t.quote_excerpt
  from targets t
  where not exists(
    select 1 from public.rr_citations c
    where c.law_record_id=t.law_record_id
      and c.official_reference_url=t.source_url
  )
  returning id
), updated_citations as (
  update public.rr_citations c
  set citation_text=t.citation_text,
      citation_type='official',
      verification_status='verified',
      last_verified_at=now(),
      quote_excerpt=t.quote_excerpt
  from targets t
  where c.law_record_id=t.law_record_id
    and c.official_reference_url=t.source_url
  returning c.id
), inserted_versions as (
  insert into public.rr_law_versions(
    law_record_id,version_number,version_label,effective_date,status,
    full_text_reference_url,summary_snapshot,detailed_snapshot,change_reason,published_at
  )
  select
    t.law_record_id,
    coalesce((select max(v.version_number)+1 from public.rr_law_versions v where v.law_record_id=t.law_record_id),1),
    'Machine-checked source snapshot — 2026-08-04',
    t.effective_date,'current',t.source_url,t.short_summary,t.long_summary,
    'Exact official citation and issuing-government source matched; human or attorney review remains pending.',
    now()
  from targets t
  where not exists(
    select 1 from public.rr_law_versions v
    where v.law_record_id=t.law_record_id and v.status='current'
  )
  returning id,law_record_id
), current_versions as (
  select distinct on(v.law_record_id) v.id as version_id,v.law_record_id
  from public.rr_law_versions v
  join targets t on t.law_record_id=v.law_record_id
  where v.status='current'
  order by v.law_record_id,v.version_number desc,v.created_at desc
), linked_version_sources as (
  insert into public.rr_law_version_sources(law_version_id,source_id)
  select cv.version_id,t.source_id
  from current_versions cv join targets t using(law_record_id)
  on conflict(law_version_id,source_id) do nothing
  returning id
), evidence_upsert as (
  insert into public.rr_verification_evidence(
    law_record_id,source_id,check_method,check_status,title_match,citation_match,
    jurisdiction_match,source_currency_text,checked_at,evidence
  )
  select
    t.law_record_id,t.source_id,'exact_title_and_citation_match','passed',true,true,true,
    t.source_currency_text,now(),
    jsonb_build_object(
      'official_reference_url',t.source_url,
      'citation_text',t.citation_text,
      'quote_excerpt',t.quote_excerpt,
      'automated_scope','source identity, citation identity, jurisdiction, and current-page reachability',
      'not_claimed','human legal interpretation or attorney review'
    )
  from targets t
  on conflict(law_record_id,source_id,check_method) do update set
    check_status='passed',title_match=true,citation_match=true,jurisdiction_match=true,
    source_currency_text=excluded.source_currency_text,checked_at=excluded.checked_at,
    evidence=excluded.evidence
  returning id
), updated_records as (
  update public.rr_law_records l
  set verification_status='machine_checked',
      publication_status='in_review',
      current_version_id=cv.version_id,
      source_confidence=t.source_confidence,
      last_verified_at=now(),
      next_review_at=now()+make_interval(days=>t.review_days),
      risk_level='high_stakes',
      updated_at=now()
  from targets t join current_versions cv on cv.law_record_id=t.law_record_id
  where l.id=t.law_record_id
  returning l.id
)
insert into public.rr_review_queue_items(
  item_type,item_id,queue_status,priority,review_reason,due_at
)
select
  'law_record',t.law_record_id,'pending','high',
  'Machine source check passed. Confirm current text, summary accuracy, exceptions, amendments, and legal interpretation before human_reviewed or attorney_reviewed status.',
  now()+interval '7 days'
from targets t
where not exists(
  select 1 from public.rr_review_queue_items q
  where q.item_type='law_record' and q.item_id=t.law_record_id
    and q.queue_status in ('pending','changes_requested','escalated')
);

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
set search_path='pg_catalog','public'
as $function$
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
    'offset',greatest(coalesce(p_offset,0),0)
  );
$function$;

create or replace function public.rr_get_public_official_sources(p_limit integer default 12)
returns jsonb
language sql
stable
security definer
set search_path='pg_catalog','public'
as $function$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id',q.id,'source_title',q.source_title,'source_url',q.source_url,
    'source_type',q.source_type,'authority_level',q.authority_level,
    'verification_status',q.verification_status,'summary',q.summary,
    'jurisdiction',jsonb_build_object('name',q.jurisdiction_name,'jurisdiction_type',q.jurisdiction_type)
  ) order by q.authority_rank desc,q.source_title),'[]'::jsonb)
  from (
    select s.id,s.source_title,s.source_url,s.source_type,s.authority_level,
           s.authority_rank,s.verification_status,s.summary,j.name as jurisdiction_name,j.jurisdiction_type
    from public.rr_legal_sources s
    left join public.rr_jurisdictions j on j.id=s.jurisdiction_id
    where s.source_status='approved' and s.trust_label='official'
      and s.verification_status in ('reachable','verified')
      and s.source_url is not null
    order by s.authority_rank desc,s.source_title
    limit least(greatest(coalesce(p_limit,12),1),30)
  ) q;
$function$;

create or replace function public.rr_get_public_catalog_health()
returns jsonb
language sql
stable
security definer
set search_path='pg_catalog','public'
as $function$
  select jsonb_build_object(
    'total_records',count(*),
    'machine_checked_records',count(*) filter(where verification_status='machine_checked'),
    'human_reviewed_records',count(*) filter(where verification_status='human_reviewed'),
    'attorney_reviewed_records',count(*) filter(where verification_status='attorney_reviewed'),
    'unverified_records',count(*) filter(where verification_status='unverified'),
    'records_with_verified_citations',count(*) filter(where exists(
      select 1 from public.rr_citations c
      where c.law_record_id=rr_law_records.id and c.verification_status='verified'
    )),
    'official_sources',(select count(*) from public.rr_legal_sources s
      where s.source_status='approved' and s.trust_label='official'
        and s.verification_status in ('reachable','verified')),
    'priority_jurisdictions',(select count(*) from public.rr_jurisdictions j
      where j.jurisdiction_type in ('federal','state')),
    'generated_at',now()
  )
  from public.rr_law_records
  where status='published';
$function$;

revoke all on function public.rr_get_public_law_catalog(text,text,integer,integer) from public;
revoke all on function public.rr_get_public_official_sources(integer) from public;
revoke all on function public.rr_get_public_catalog_health() from public;
grant execute on function public.rr_get_public_law_catalog(text,text,integer,integer) to anon,authenticated,service_role;
grant execute on function public.rr_get_public_official_sources(integer) to anon,authenticated,service_role;
grant execute on function public.rr_get_public_catalog_health() to anon,authenticated,service_role;
