-- Lock THE LAW public access to bounded security-definer RPCs.
-- Apply only after the RPC-based frontend is serving successfully.
-- Service-role access and the three bounded public RPCs remain available.

revoke all on table public.rr_law_records from anon,authenticated;
revoke all on table public.rr_legal_sources from anon,authenticated;
revoke all on table public.rr_citations from anon,authenticated;
revoke all on table public.rr_law_versions from anon,authenticated;
revoke all on table public.rr_source_law_records from anon,authenticated;
revoke all on table public.rr_law_version_sources from anon,authenticated;
revoke all on table public.rr_review_queue_items from anon,authenticated;
revoke all on table public.rr_verification_evidence from anon,authenticated;

grant all on table public.rr_law_records to service_role;
grant all on table public.rr_legal_sources to service_role;
grant all on table public.rr_citations to service_role;
grant all on table public.rr_law_versions to service_role;
grant all on table public.rr_source_law_records to service_role;
grant all on table public.rr_law_version_sources to service_role;
grant all on table public.rr_review_queue_items to service_role;
grant all on table public.rr_verification_evidence to service_role;

revoke all on function public.rr_get_public_law_catalog(text,text,integer,integer) from public;
revoke all on function public.rr_get_public_official_sources(integer) from public;
revoke all on function public.rr_get_public_catalog_health() from public;
grant execute on function public.rr_get_public_law_catalog(text,text,integer,integer) to anon,authenticated,service_role;
grant execute on function public.rr_get_public_official_sources(integer) to anon,authenticated,service_role;
grant execute on function public.rr_get_public_catalog_health() to anon,authenticated,service_role;
