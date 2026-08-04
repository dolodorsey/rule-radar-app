"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowUpRight, BookOpen, CheckCircle2, Database, MapPin, Search, ShieldCheck, X } from "lucide-react";
import { supabase } from "../lib/supabase";

type Citation = {
  citation_text: string;
  official_reference_url: string | null;
  verification_status: string | null;
  last_verified_at: string | null;
};

type Law = {
  id: string;
  law_title: string;
  slug: string;
  law_type: string;
  short_summary: string | null;
  long_summary: string | null;
  affected_parties_text: string | null;
  effective_date: string | null;
  verification_status: string | null;
  publication_status: string | null;
  source_confidence: number | null;
  last_verified_at: string | null;
  next_review_at: string | null;
  jurisdiction: { name: string; jurisdiction_type: string } | null;
  citations: Citation[];
};

type CatalogResponse = {
  records: Law[];
  total: number;
  limit: number;
  offset: number;
};

type LegalSource = {
  id: string;
  source_title: string;
  source_url: string;
  source_type: string;
  authority_level: string;
  verification_status: string;
  summary: string | null;
  jurisdiction: { name: string; jurisdiction_type: string } | null;
};

type CatalogHealth = {
  total_records: number;
  official_sources: number;
  priority_jurisdictions: number;
  machine_checked_records: number;
  human_reviewed_records: number;
  attorney_reviewed_records: number;
  unverified_records: number;
  records_with_verified_citations: number;
  generated_at: string;
};

const jurisdictionTypes = ["Federal", "State"];

function verificationLabel(status: string | null, confidence: number | null) {
  if (status === "attorney_reviewed") return "Attorney reviewed";
  if (status === "human_reviewed") return "Human reviewed";
  if (status === "machine_checked") return "Machine source check";
  if (status === "stale") return "Source review expired";
  if (status === "disputed") return "Record disputed";
  if (confidence !== null && confidence >= 0.9) return "Official source linked";
  return "Source review required";
}

export default function TheLaw() {
  const [laws, setLaws] = useState<Law[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [jurisdiction, setJurisdiction] = useState("Federal");
  const [selected, setSelected] = useState<Law | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [officialSources, setOfficialSources] = useState<LegalSource[]>([]);
  const [health, setHealth] = useState<CatalogHealth | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadControlPlane() {
      const [sourcesResult, healthResult] = await Promise.all([
        supabase.rpc("rr_get_public_official_sources", { p_limit: 12 }),
        supabase.rpc("rr_get_public_catalog_health"),
      ]);

      if (cancelled) return;
      if (!sourcesResult.error) {
        setOfficialSources((sourcesResult.data as LegalSource[] | null) ?? []);
      }
      if (!healthResult.error) {
        setHealth((healthResult.data as CatalogHealth | null) ?? null);
      }
    }

    void loadControlPlane();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      const { data, error: requestError } = await supabase.rpc("rr_get_public_law_catalog", {
        p_query: query.trim() || null,
        p_jurisdiction_type: jurisdiction.toLowerCase(),
        p_limit: 80,
        p_offset: 0,
      });

      if (cancelled) return;
      if (requestError) {
        setError("The legal catalog could not be loaded. Please try again shortly.");
        setLaws([]);
        setTotal(0);
      } else {
        const result = (data as CatalogResponse | null) ?? { records: [], total: 0, limit: 80, offset: 0 };
        setLaws(result.records ?? []);
        setTotal(result.total ?? 0);
      }
      setLoading(false);
    }

    const timer = window.setTimeout(() => { void load(); }, query ? 250 : 0);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [query, jurisdiction]);

  const visible = useMemo(() => laws.filter((law) => law.jurisdiction), [laws]);
  const source = selected?.citations.find((citation) => citation.official_reference_url);
  const totalRecords = health?.total_records ?? total;
  const priorityJurisdictions = health?.priority_jurisdictions ?? 52;
  const machineChecked = health?.machine_checked_records ?? 0;

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="THE LAW home">
          <span className="brand-mark">XII</span>
          <span><strong>THE LAW</strong><small>Legal intelligence</small></span>
        </a>
        <a className="download-link" href="/download/">Get the app <ArrowUpRight size={15} /></a>
      </header>

      <section className="hero" id="top">
        <div className="hero-image" aria-hidden="true" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <span className="eyebrow"><ShieldCheck size={15} /> Source-aware legal research</span>
          <h1>Know the law.<br /><em>Track the change.</em></h1>
          <p>Research federal and state legal records first—then go directly to an official government source when an exact citation has been connected.</p>
          <div className="hero-stats">
            <span><strong>{totalRecords.toLocaleString()}</strong> state + federal records</span>
            <span><strong>{priorityJurisdictions}</strong> priority jurisdictions</span>
            <span><strong>{machineChecked}</strong> machine-checked records</span>
          </div>
        </div>
      </section>

      <section className="search-shell" aria-label="Search legal records">
        <div className="search-box">
          <Search size={21} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a law, topic, obligation, or affected party" aria-label="Search laws" />
          {query && <button className="icon-button" onClick={() => setQuery("")} aria-label="Clear search"><X size={18} /></button>}
        </div>
        <div className="filters" aria-label="Jurisdiction filters">
          {jurisdictionTypes.map((type) => <button key={type} className={jurisdiction === type ? "active" : ""} onClick={() => setJurisdiction(type)}>{type}</button>)}
        </div>
        <p className="priority-note"><ShieldCheck size={15} /> State and federal are the active source priority. A machine source check confirms source identity and citation matching—not legal advice or attorney review.</p>
      </section>

      <section className="catalog">
        <div className="catalog-heading">
          <div>
            <span className="section-label">LEGAL CATALOG</span>
            <h2>{query ? `Results for “${query}”` : `${jurisdiction} records`}</h2>
          </div>
          <span className="result-count">{loading ? "Searching…" : `${total.toLocaleString()} records`}</span>
        </div>

        {error && <div className="state-card error"><ShieldCheck size={24} /><strong>Catalog unavailable</strong><p>{error}</p></div>}
        {loading && <div className="loading-grid" aria-label="Loading records">{[1,2,3,4,5,6].map((item) => <div className="skeleton" key={item} />)}</div>}
        {!loading && !error && visible.length === 0 && <div className="state-card"><Search size={24} /><strong>No matching records</strong><p>Try a broader phrase or another jurisdiction level.</p></div>}

        {!loading && !error && <div className="law-grid">
          {visible.map((law) => {
            const citation = law.citations[0];
            return <button className="law-card" key={law.id} onClick={() => setSelected(law)}>
              <div className="card-top">
                <span className="jurisdiction"><MapPin size={13} />{law.jurisdiction?.name}</span>
                <span className="law-type">{law.law_type}</span>
              </div>
              <h3>{law.law_title}</h3>
              {citation && <code>{citation.citation_text}</code>}
              <p>{law.short_summary || "Open this record for the current summary and source information."}</p>
              <div className="card-foot">
                <span className="verified"><CheckCircle2 size={14} />{verificationLabel(law.verification_status, law.source_confidence)}</span>
                <ArrowUpRight size={17} />
              </div>
            </button>;
          })}
        </div>}
      </section>

      <section className="source-library" aria-labelledby="source-library-title">
        <div className="catalog-heading">
          <div><span className="section-label">OFFICIAL SOURCE LIBRARY</span><h2 id="source-library-title">Start with the issuing government.</h2></div>
          <span className="result-count">{health?.official_sources ?? officialSources.length} official sources</span>
        </div>
        <p className="source-library-note">Portal reachability and exact-record verification are tracked separately. Records marked machine checked have an exact citation and source evidence packet but still require human editorial review.</p>
        <div className="source-grid">
          {officialSources.map((item) => <a className="source-card" key={item.id} href={item.source_url} target="_blank" rel="noreferrer">
            <div><span className="jurisdiction"><ShieldCheck size={13}/>{item.jurisdiction?.name || "Official source"}</span><ArrowUpRight size={17}/></div>
            <h3>{item.source_title}</h3><p>{item.summary}</p>
            <small>{item.source_type.replaceAll("_", " ")} · {item.verification_status.replaceAll("_", " ")}</small>
          </a>)}
        </div>
      </section>

      <section className="trust-band">
        <div><Database size={25} /><span><strong>Bounded public API</strong><small>Public catalog access is capped and separated from private editorial evidence.</small></span></div>
        <div><BookOpen size={25} /><span><strong>Source-first</strong><small>Exact citations and issuing-government references are shown when connected.</small></span></div>
        <div><ShieldCheck size={25} /><span><strong>Honest status</strong><small>Machine, human, and attorney review are never presented as the same thing.</small></span></div>
      </section>

      <footer>
        <strong>THE LAW</strong>
        <p>Legal information for research and educational purposes only. THE LAW does not provide legal advice or create an attorney-client relationship. Confirm current requirements with an official source or licensed attorney.</p>
        <small>A Kollective Hospitality Group property</small>
      </footer>

      {selected && <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelected(null)}>
        <article className="detail-panel" role="dialog" aria-modal="true" aria-labelledby="law-title" onMouseDown={(event) => event.stopPropagation()}>
          <button className="close-button" onClick={() => setSelected(null)} aria-label="Close details"><X size={20} /></button>
          <button className="back-button" onClick={() => setSelected(null)}><ArrowLeft size={16} /> Back to results</button>
          <div className="detail-meta"><span>{selected.jurisdiction?.name}</span><span>{selected.law_type}</span><span>{verificationLabel(selected.verification_status, selected.source_confidence)}</span></div>
          <h2 id="law-title">{selected.law_title}</h2>
          {selected.citations[0] && <code className="detail-citation">{selected.citations[0].citation_text}</code>}
          <section><h3>Plain-language summary</h3><p>{selected.long_summary || selected.short_summary || "A detailed summary has not been published for this record."}</p></section>
          <div className="detail-grid">
            <section><h3>Effective date</h3><p>{selected.effective_date ? new Date(`${selected.effective_date}T12:00:00`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "Not recorded"}</p></section>
            <section><h3>Review state</h3><p>{verificationLabel(selected.verification_status, selected.source_confidence)}</p></section>
          </div>
          <section><h3>Affected parties</h3><p>{selected.affected_parties_text || "Not specified in the published record."}</p></section>
          {selected.last_verified_at && <section><h3>Source checked</h3><p>{new Date(selected.last_verified_at).toLocaleString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p></section>}
          {source?.official_reference_url ? <a className="official-button" href={source.official_reference_url} target="_blank" rel="noreferrer">Open exact official source <ArrowUpRight size={17} /></a> : <div className="source-unavailable">No exact official source link is published for this record yet.</div>}
        </article>
      </div>}
    </main>
  );
}
