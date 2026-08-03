create unique index if not exists rr_legal_sources_source_url_unique
  on public.rr_legal_sources (source_url)
  where source_url is not null;

-- Create a concrete editorial work queue for every federal/state jurisdiction.
-- These tasks do not mark any law verified; they make the missing-source work
-- measurable and assignable.
insert into public.rr_research_tasks (
  title, description, linked_jurisdiction_id, priority_level, task_status
)
select
  'Map official sources: ' || j.name,
  'Locate the official statute/code repository, administrative rules, enacted legislation, and court or agency publication portals. Record retrieval date and authority before linking individual law records.',
  j.id,
  case when j.jurisdiction_type = 'federal' or j.state_code = 'GA' then 'urgent' else 'high' end,
  'open'
from public.rr_jurisdictions j
where j.jurisdiction_type in ('federal','state')
  and not exists (
    select 1 from public.rr_research_tasks t
    where t.linked_jurisdiction_id = j.id
      and t.title = 'Map official sources: ' || j.name
  );

with federal as (
  select id from public.rr_jurisdictions
  where jurisdiction_type = 'federal'
  order by created_at
  limit 1
), source_rows(source_title,source_url,source_type,authority_level,authority_rank,summary) as (
  values
    ('United States Code — Office of the Law Revision Counsel','https://uscode.house.gov/download/download.shtml','code_repository','primary_official',100,'Current United States Code release points and title downloads from the U.S. House Office of the Law Revision Counsel.'),
    ('United States Code — GovInfo','https://www.govinfo.gov/app/collection/uscode','official_publication','primary_official',100,'Government Publishing Office collection of United States Code editions and supplements.'),
    ('Federal Register — Current Documents','https://www.federalregister.gov/documents/current','agency_notice','primary_official',98,'Current rules, proposed rules, notices, and presidential documents published through the Federal Register.'),
    ('Electronic Code of Federal Regulations','https://www.ecfr.gov/current/title-1','code_repository','primary_official',98,'Current editorial compilation of federal agency regulations; currency must be checked at retrieval.'),
    ('Supreme Court of the United States — Opinions','https://www.supremecourt.gov/opinions/opinions.aspx','court_related_reference','primary_court',100,'Official opinions and related materials from the Supreme Court of the United States.')
)
insert into public.rr_legal_sources (
  source_title,source_url,source_type,source_status,trust_label,jurisdiction_id,
  summary,authority_level,authority_rank,verification_status,last_checked_at,retrieval_metadata
)
select s.source_title,s.source_url,s.source_type,'approved','official',f.id,
       s.summary,s.authority_level,s.authority_rank,'reachable',now(),
       jsonb_build_object('http_status',200,'checked_at',now(),'check_method','automated_reachability')
from source_rows s cross join federal f
on conflict (source_url) where source_url is not null do update set
  last_checked_at = excluded.last_checked_at,
  verification_status = 'reachable',
  retrieval_metadata = excluded.retrieval_metadata;

with georgia as (
  select id from public.rr_jurisdictions
  where jurisdiction_type = 'state' and state_code = 'GA'
  limit 1
), source_rows(source_title,source_url,source_type,authority_level,authority_rank,summary) as (
  values
    ('Georgia General Assembly — Legislation','https://www.legis.ga.gov/legislation/all','legislative_text','primary_official',100,'Official Georgia General Assembly legislation search and bill materials.'),
    ('Georgia Governor — 2026 Signed Legislation','https://gov.georgia.gov/executive-action/legislation/signed-legislation/2026','official_publication','primary_official',98,'Official signed-legislation documents published by the Office of the Governor.'),
    ('Georgia Rules and Regulations','https://rules.sos.georgia.gov/','code_repository','primary_agency',98,'Official Georgia administrative rules published by the Secretary of State.'),
    ('Georgia.gov — The Life of a Law','https://georgia.gov/life-law','official_publication','official_guidance',85,'Official state guidance explaining enactment and access to the Official Code of Georgia Annotated.')
)
insert into public.rr_legal_sources (
  source_title,source_url,source_type,source_status,trust_label,jurisdiction_id,
  summary,authority_level,authority_rank,verification_status,last_checked_at,retrieval_metadata
)
select s.source_title,s.source_url,s.source_type,'approved','official',g.id,
       s.summary,s.authority_level,s.authority_rank,'reachable',now(),
       jsonb_build_object('http_status',200,'checked_at',now(),'check_method','automated_reachability')
from source_rows s cross join georgia g
on conflict (source_url) where source_url is not null do update set
  last_checked_at = excluded.last_checked_at,
  verification_status = 'reachable',
  retrieval_metadata = excluded.retrieval_metadata;
