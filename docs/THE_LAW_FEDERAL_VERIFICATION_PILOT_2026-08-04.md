# THE LAW Federal Verification Pilot — 2026-08-04

## Scope

This release affects THE LAW only. Every database object is isolated under the `rr_*` namespace. It does not modify GOOD TIMES, S.O.S., ON CALL, LUXE ON DEMAND, THE VOTE, BLACK PAGES, Kollective, or Casper data.

## Production baseline

- 711 published catalog records
- 711 records originally unverified and in draft editorial status
- 17 original legal sources
- 5 original citations
- 65 jurisdictions, including 52 federal/state priority jurisdictions

## Delivered

- Private `rr_verification_evidence` table with RLS and service-role-only table access
- Seven exact federal source-evidence packets
- Verified citation, official source link, current version, and pending human-review task for each pilot record
- Bounded public RPCs for catalog search, official sources, and catalog health
- Maximum catalog page size of 100 and maximum official-source page size of 30
- Fail-closed frontend backend binding
- No client-side secret credential support
- Frontend uses RPCs instead of direct `rr_*` table reads
- CI quality gate for isolation, lint, type checking, production build, and critical dependency audit
- Staged direct-table grant removal to be applied after the RPC frontend is live

## Pilot records

1. 40 U.S.C. § 3101
2. 49 U.S.C. chapter 301
3. 49 U.S.C. chapter 331
4. 49 C.F.R. part 37
5. 27 C.F.R. part 4
6. 21 C.F.R. part 117
7. 2 C.F.R. part 200

## Verification semantics

`machine_checked` means:

- the catalog title was matched to a specific official government source;
- the citation identity was matched;
- the jurisdiction matched;
- the source page was reachable during the check;
- a current evidence packet was recorded.

It does **not** mean:

- an attorney reviewed the record;
- legal interpretation was validated;
- every amendment, exception, cross-reference, or enforcement nuance was resolved;
- the record is legal advice.

Each pilot record remains `in_review`, is marked `high_stakes`, and has a high-priority human-review task.

## Database QA

Expected production health after activation:

- total records: 711
- machine checked: 7
- unverified: 704
- records with verified citations: 7
- official sources: 16
- priority jurisdictions: 52

Each pilot record must have exactly:

- one or more verified citations;
- one official source link;
- one current version;
- one passed evidence packet;
- one pending human-review task.

Public API controls:

- requested limits above 100 are reduced to 100;
- negative offsets are reduced to zero;
- unsupported jurisdiction types fall back to federal;
- private evidence is unreadable by anonymous and authenticated roles;
- anonymous clients can execute only the bounded public RPCs.

## Rollback

The release is additive and reversible.

- Revert the frontend commit to restore the prior UI.
- Restore the previous table grants only if a legacy direct-table client must temporarily operate.
- Set pilot records back to `unverified` and `draft` only after deleting their review tasks, evidence, version-source links, source links, and citations in dependency-safe order.
- Do not delete original catalog records.
- Do not remove shared project infrastructure or any non-`rr_*` object.
