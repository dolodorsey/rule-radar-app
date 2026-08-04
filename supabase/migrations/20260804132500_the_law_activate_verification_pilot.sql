-- Activate the THE LAW federal verification pilot sequentially.
-- This migration is idempotent and repairs same-statement snapshot ordering
-- from the source-seeding migration without changing any non-rr_* object.

do $block$
declare
  r record;
  v_version_id uuid;
  v_review_days integer;
  v_confidence numeric;
  v_citation_text text;
  v_currency_text text;
begin
  for r in
    select
      l.id as law_record_id,
      l.law_title,
      l.short_summary,
      l.long_summary,
      l.effective_date,
      s.id as source_id,
      s.source_url,
      s.summary as quote_excerpt,
      s.authority_level,
      s.retrieval_metadata
    from public.rr_law_records l
    join public.rr_legal_sources s
      on s.retrieval_metadata->>'record_title'=l.law_title
    where s.retrieval_metadata->>'editorial_status'='machine_checked_pending_human_review'
      and s.verification_status='verified'
      and s.source_status='approved'
  loop
    v_citation_text:=nullif(r.retrieval_metadata->>'citation_text','');
    v_currency_text:=nullif(r.retrieval_metadata->>'source_currency_text','');
    v_review_days:=case when r.source_url like 'https://uscode.house.gov/%' then 90 else 30 end;
    v_confidence:=case when r.authority_level='primary_official' then 0.98 else 0.95 end;

    insert into public.rr_source_law_records(source_id,law_record_id)
    values(r.source_id,r.law_record_id)
    on conflict(source_id,law_record_id) do nothing;

    if not exists(
      select 1 from public.rr_citations c
      where c.law_record_id=r.law_record_id
        and c.official_reference_url=r.source_url
    ) then
      insert into public.rr_citations(
        law_record_id,citation_text,citation_type,official_reference_url,
        verification_status,last_verified_at,quote_excerpt
      ) values(
        r.law_record_id,coalesce(v_citation_text,r.law_title),'official',r.source_url,
        'verified',now(),r.quote_excerpt
      );
    else
      update public.rr_citations
      set citation_text=coalesce(v_citation_text,r.law_title),
          citation_type='official',
          verification_status='verified',
          last_verified_at=now(),
          quote_excerpt=r.quote_excerpt
      where law_record_id=r.law_record_id
        and official_reference_url=r.source_url;
    end if;

    select v.id into v_version_id
    from public.rr_law_versions v
    where v.law_record_id=r.law_record_id and v.status='current'
    order by v.version_number desc,v.created_at desc
    limit 1;

    if v_version_id is null then
      insert into public.rr_law_versions(
        law_record_id,version_number,version_label,effective_date,status,
        full_text_reference_url,summary_snapshot,detailed_snapshot,change_reason,published_at
      ) values(
        r.law_record_id,
        coalesce((select max(v.version_number)+1 from public.rr_law_versions v where v.law_record_id=r.law_record_id),1),
        'Machine-checked source snapshot — 2026-08-04',
        r.effective_date,'current',r.source_url,r.short_summary,r.long_summary,
        'Exact official citation and issuing-government source matched; human or attorney review remains pending.',
        now()
      ) returning id into v_version_id;
    end if;

    insert into public.rr_law_version_sources(law_version_id,source_id)
    values(v_version_id,r.source_id)
    on conflict(law_version_id,source_id) do nothing;

    insert into public.rr_verification_evidence(
      law_record_id,source_id,check_method,check_status,title_match,citation_match,
      jurisdiction_match,source_currency_text,checked_at,evidence
    ) values(
      r.law_record_id,r.source_id,'exact_title_and_citation_match','passed',true,true,true,
      v_currency_text,now(),
      jsonb_build_object(
        'official_reference_url',r.source_url,
        'citation_text',coalesce(v_citation_text,r.law_title),
        'quote_excerpt',r.quote_excerpt,
        'automated_scope','source identity, citation identity, jurisdiction, and current-page reachability',
        'not_claimed','human legal interpretation or attorney review'
      )
    )
    on conflict(law_record_id,source_id,check_method) do update set
      check_status='passed',title_match=true,citation_match=true,jurisdiction_match=true,
      source_currency_text=excluded.source_currency_text,checked_at=excluded.checked_at,
      evidence=excluded.evidence;

    update public.rr_law_records
    set verification_status='machine_checked',
        publication_status='in_review',
        current_version_id=v_version_id,
        source_confidence=v_confidence,
        last_verified_at=now(),
        next_review_at=now()+make_interval(days=>v_review_days),
        risk_level='high_stakes',
        updated_at=now()
    where id=r.law_record_id;

    if not exists(
      select 1 from public.rr_review_queue_items q
      where q.item_type='law_record' and q.item_id=r.law_record_id
        and q.queue_status in ('pending','changes_requested','escalated')
    ) then
      insert into public.rr_review_queue_items(
        item_type,item_id,queue_status,priority,review_reason,due_at
      ) values(
        'law_record',r.law_record_id,'pending','high',
        'Machine source check passed. Confirm current text, summary accuracy, exceptions, amendments, and legal interpretation before human_reviewed or attorney_reviewed status.',
        now()+interval '7 days'
      );
    end if;
  end loop;
end
$block$;
