# THE LAW release evidence

## Product scope

- Canonical application: `rule-radar-app`
- Brand presented publicly: THE LAW
- `law-search` remains a separate visual prototype and was not merged.

## Data integrity

- Live source: Supabase project `dzlmtvodpyhetvektfuo`
- Catalog: 711 law records across 65 jurisdictions
- All current records retain their database verification status (`unverified` at this checkpoint).
- The UI never represents an unverified record as verified.
- Official source buttons only appear when a citation has a published official URL.
- Nine federal and Georgia government portals passed an automated reachability check and are labeled `reachable`, not law-record verified.
- A source-mapping task now exists for all 52 state/federal priority jurisdictions; federal and Georgia are urgent, with the remaining states queued high.

## Interface

- Uses the approved assets from `WEBSITE GRAPHICS/LAW GRAPHICS`.
- Responsive black-marble and gold design for desktop and mobile.
- Live search, jurisdiction filters, record details, source status, and legal disclaimer.
- Added an official-source library that clearly separates portal availability from editorial verification of individual laws.
- Generic or nonexistent Android/TestFlight links were removed.

## Verification

- Next.js production build: passed
- ESLint: passed
- TypeScript: passed
- Live public catalog request: HTTP 200
- Desktop browser: live search, result count, detail panel, missing-source handling passed
- Browser console: no warnings or errors
- Mobile viewport: no horizontal overflow or framework error overlay

## Known release gates

- Native iOS and Android downloads remain unavailable until genuine signed artifacts exist.
- The catalog needs editorial verification and source-link expansion; its status is shown honestly in the product.
- Current priority scope is state and federal: 708 records across 52 jurisdictions. Only 4 records currently have official-source URLs and none are marked verified, so the interface now exposes that limitation and defers county/city expansion.
- Current Next.js transitive PostCSS/Sharp advisories remain upstream in the installed stable framework release; no user-supplied CSS or image processing endpoint is exposed by this static application.
