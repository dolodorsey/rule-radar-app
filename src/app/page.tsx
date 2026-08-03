"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowUpRight, BookOpen, CheckCircle2, Database, MapPin, Search, ShieldCheck, X } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

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
  source_confidence: number | null;
  jurisdiction: { name: string; jurisdiction_type: string } | null;
  citations: { citation_text: string; official_reference_url: string | null; verification_status: string | null }[];
};

type LegalSource = {
  id: string;
  source_title: string;
  source_url: string;
  source_type: string;
  authority_level: string;
  summary: string | null;
  jurisdiction: { name: string; jurisdiction_type: string } | null;
};

const projectUrl = "https://dzlmtvodpyhetvektfuo.supabase.co";
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabase = publishableKey ? createClient(projectUrl, publishableKey) : null;

const jurisdictionTypes = ["Federal", "State"];

function confidenceLabel(value: number | null) {
  if (value === null) return "Review status recorded";
  if (value >= 0.9) return "High source confidence";
  if (value >= 0.7) return "Moderate source confidence";
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

  useEffect(() => {
    let cancelled = false;
    async function loadSources() {
      if (!supabase) return;
      const { data } = await supabase
        .from("rr_legal_sources")
        .select("id,source_title,source_url,source_type,authority_level,summary,jurisdiction:rr_jurisdictions!rr_legal_sources_jurisdiction_id_fkey(name,jurisdiction_type)")
        .eq("source_status", "approved")
        .eq("trust_label", "official")
        .eq("verification_status", "reachable")
        .order("authority_rank", { ascending: false })
        .limit(12);
      if (!cancelled) setOfficialSources((data as unknown as LegalSource[]) ?? []);
    }
    loadSources();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!supabase) {
        setError("The live legal catalog is not configured for this release.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      let request = supabase
        .from("rr_law_records")
        .select("id,law_title,slug,law_type,short_summary,long_summary,affected_parties_text,effective_date,verification_status,source_confidence,jurisdiction:rr_jurisdictions!rr_law_records_jurisdiction_id_fkey(name,jurisdiction_type),citations:rr_citations(citation_text,official_reference_url,verification_status)", { count: "exact" })
        .eq("status", "published")
        .order("source_confidence", { ascending: false, nullsFirst: false })
        .order("law_title", { ascending: true })
        .limit(80);

      if (query.trim()) {
        const safe = query.trim().replace(/[,%()]/g, " ");
        request = request.or(`law_title.ilike.%${safe}%,short_summary.ilike.%${safe}%,affected_parties_text.ilike.%${safe}%`);
      }
      request = request.eq("rr_jurisdictions.jurisdiction_type", jurisdiction.toLowerCase());

      const { data, count, error: requestError } = await request;
      if (cancelled) return;
      if (requestError) {
        setError("The legal catalog could not be loaded. Please try again shortly.");
        setLaws([]);
      } else {
        setLaws((data as unknown as Law[]) ?? []);
        setTotal(count ?? 0);
      }
      setLoading(false);
    }

    const timer = window.setTimeout(load, query ? 250 : 0);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [query, jurisdiction]);

  const visible = useMemo(() => laws.filter((law) => law.jurisdiction), [laws]);
  const source = selected?.citations.find((citation) => citation.official_reference_url);

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
          <p>Research federal and state legal records first—then go directly to an official government source when one has been reviewed and linked.</p>
          <div className="hero-stats">
            <span><strong>708</strong> state + federal records</span>
            <span><strong>52</strong> priority jurisdictions</span>
            <span><strong>{officialSources.length || 9}</strong> official portals online</span>
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
        <p className="priority-note"><ShieldCheck size={15} /> State and federal are the active source priority. County and city coverage will follow after this verification pass.</p>
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
                <span className="verified"><CheckCircle2 size={14} />{confidenceLabel(law.source_confidence)}</span>
                <ArrowUpRight size={17} />
              </div>
            </button>;
          })}
        </div>}
      </section>

      <section className="source-library" aria-labelledby="source-library-title">
        <div className="catalog-heading">
          <div><span className="section-label">OFFICIAL SOURCE LIBRARY</span><h2 id="source-library-title">Start with the issuing government.</h2></div>
          <span className="result-count">Federal + Georgia pilot</span>
        </div>
        <p className="source-library-note">These portals passed an automated reachability check. Individual law records remain unverified until an editor connects the exact citation and confirms currency.</p>
        <div className="source-grid">
          {officialSources.map((item) => <a className="source-card" key={item.id} href={item.source_url} target="_blank" rel="noreferrer">
            <div><span className="jurisdiction"><ShieldCheck size={13}/>{item.jurisdiction?.name || "Official source"}</span><ArrowUpRight size={17}/></div>
            <h3>{item.source_title}</h3><p>{item.summary}</p>
            <small>{item.source_type.replaceAll("_", " ")} · {item.authority_level.replaceAll("_", " ")}</small>
          </a>)}
        </div>
      </section>

      <section className="trust-band">
        <div><Database size={25} /><span><strong>Live catalog</strong><small>Records are loaded from THE LAW’s protected database.</small></span></div>
        <div><BookOpen size={25} /><span><strong>Source-first</strong><small>Official references are shown when available.</small></span></div>
        <div><ShieldCheck size={25} /><span><strong>Honest status</strong><small>Verification and confidence are not implied when absent.</small></span></div>
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
          <div className="detail-meta"><span>{selected.jurisdiction?.name}</span><span>{selected.law_type}</span><span>{selected.verification_status || "Review tracked"}</span></div>
          <h2 id="law-title">{selected.law_title}</h2>
          {selected.citations[0] && <code className="detail-citation">{selected.citations[0].citation_text}</code>}
          <section><h3>Plain-language summary</h3><p>{selected.long_summary || selected.short_summary || "A detailed summary has not been published for this record."}</p></section>
          <div className="detail-grid">
            <section><h3>Effective date</h3><p>{selected.effective_date ? new Date(`${selected.effective_date}T12:00:00`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "Not recorded"}</p></section>
            <section><h3>Source confidence</h3><p>{confidenceLabel(selected.source_confidence)}</p></section>
          </div>
          <section><h3>Affected parties</h3><p>{selected.affected_parties_text || "Not specified in the published record."}</p></section>
          {source?.official_reference_url ? <a className="official-button" href={source.official_reference_url} target="_blank" rel="noreferrer">Open official source <ArrowUpRight size={17} /></a> : <div className="source-unavailable">No official source link is published for this record yet.</div>}
        </article>
      </div>}
    </main>
  );
}
