import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default async function SearchPage({ searchParams }: { searchParams: { q?: string; jurisdiction?: string; topic?: string; type?: string } }) {
  const q = searchParams.q || ''
  
  let query = supabase
    .from('rr_law_records')
    .select(`
      *,
      jurisdiction:rr_jurisdictions(id, name, slug, jurisdiction_type),
      citations:rr_citations(id, citation_text)
    `)
    .eq('status', 'published')
    .order('updated_at', { ascending: false })
    .limit(50)

  if (q) {
    query = query.textSearch('fts', q.split(' ').join(' & '))
  }
  if (searchParams.jurisdiction) {
    query = query.eq('jurisdiction_id', searchParams.jurisdiction)
  }
  if (searchParams.type) {
    query = query.eq('law_type', searchParams.type)
  }

  const { data: laws } = await query

  const { data: topics } = await supabase
    .from('rr_topics')
    .select('*')
    .eq('active_flag', true)
    .order('topic_name')

  const { data: jurisdictions } = await supabase
    .from('rr_jurisdictions')
    .select('*')
    .order('jurisdiction_type')

  return (
    <div style={{ paddingTop: 100, maxWidth: 1200, margin: '0 auto', padding: '100px 32px 80px' }}>
      <div style={{ marginBottom: 48 }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: 'var(--rr-accent)', marginBottom: 12,
        }}>Law Search</div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 56px)',
          fontWeight: 400, letterSpacing: '-0.01em',
        }}>
          Find the <span style={{ fontStyle: 'italic', fontWeight: 600 }}>right law</span>
        </h1>
      </div>

      {/* SEARCH BAR */}
      <form action="/search" style={{ marginBottom: 32 }}>
        <div style={{
          display: 'flex', gap: 0,
          background: 'var(--rr-bg-elevated)',
          border: '1px solid var(--rr-border-hover)',
          borderRadius: 8, overflow: 'hidden',
        }}>
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by keyword, citation, or topic…"
            style={{
              flex: 1, padding: '16px 20px',
              background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--rr-text)', fontFamily: 'var(--font-body)', fontSize: 16,
            }}
          />
          <button type="submit" style={{
            padding: '16px 32px',
            background: 'var(--rr-accent)', color: '#fff',
            border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700,
            letterSpacing: '0.04em', textTransform: 'uppercase',
          }}>
            Search
          </button>
        </div>
      </form>

      {/* FILTERS */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
        {['statute', 'ordinance', 'regulation', 'rule', 'guidance', 'executive_order'].map(t => (
          <Link key={t} href={`/search?q=${q}&type=${t}`} style={{
            padding: '6px 14px', borderRadius: 999,
            fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 500,
            background: searchParams.type === t ? 'var(--rr-accent-muted)' : 'var(--rr-bg-card)',
            color: searchParams.type === t ? 'var(--rr-accent)' : 'var(--rr-text-secondary)',
            border: `1px solid ${searchParams.type === t ? 'rgba(200,121,65,0.3)' : 'var(--rr-border)'}`,
            textDecoration: 'none', letterSpacing: '0.03em', textTransform: 'uppercase',
          }}>{t.replace('_', ' ')}</Link>
        ))}
      </div>

      {/* RESULTS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {q && <div style={{ fontSize: 14, color: 'var(--rr-text-muted)', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>
          {laws?.length || 0} results for &ldquo;{q}&rdquo;
        </div>}
        
        {laws?.map((law: any) => (
          <Link key={law.id} href={`/law/${law.slug}`} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--rr-bg-card)',
              border: '1px solid var(--rr-border)',
              borderRadius: 12, padding: '24px',
              transition: 'all 200ms cubic-bezier(0.16,1,0.3,1)',
              cursor: 'pointer',
            }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    {law.jurisdiction && (
                      <span style={{
                        padding: '3px 10px', borderRadius: 999,
                        fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-mono)',
                        letterSpacing: '0.06em', textTransform: 'uppercase',
                        background: law.jurisdiction.jurisdiction_type === 'federal' ? 'rgba(129,140,248,0.12)' :
                                   law.jurisdiction.jurisdiction_type === 'state' ? 'rgba(96,165,250,0.12)' :
                                   law.jurisdiction.jurisdiction_type === 'county' ? 'rgba(52,211,153,0.12)' :
                                   'rgba(251,191,36,0.12)',
                        color: law.jurisdiction.jurisdiction_type === 'federal' ? '#818CF8' :
                               law.jurisdiction.jurisdiction_type === 'state' ? '#60A5FA' :
                               law.jurisdiction.jurisdiction_type === 'county' ? '#34D399' : '#FBBF24',
                      }}>{law.jurisdiction.jurisdiction_type} · {law.jurisdiction.name}</span>
                    )}
                    <span style={{
                      padding: '3px 8px', borderRadius: 999,
                      fontSize: 10, fontFamily: 'var(--font-mono)',
                      background: 'var(--rr-bg-elevated)',
                      color: 'var(--rr-text-muted)',
                      letterSpacing: '0.04em', textTransform: 'uppercase',
                    }}>{law.law_type}</span>
                  </div>
                  <h3 style={{
                    fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600,
                    color: 'var(--rr-text)', marginBottom: 6,
                  }}>{law.law_title}</h3>
                  {law.citations?.[0] && (
                    <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--rr-accent)', marginBottom: 8 }}>
                      {law.citations[0].citation_text}
                    </div>
                  )}
                  <p style={{ fontSize: 14, color: 'var(--rr-text-secondary)', lineHeight: 1.6 }}>
                    {law.short_summary}
                  </p>
                </div>
              </div>
              {law.effective_date && (
                <div style={{ marginTop: 12, fontSize: 12, color: 'var(--rr-text-muted)', fontFamily: 'var(--font-mono)' }}>
                  Effective: {new Date(law.effective_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
              )}
            </div>
          </Link>
        ))}

        {(!laws || laws.length === 0) && (
          <div style={{
            textAlign: 'center', padding: '80px 32px',
            color: 'var(--rr-text-muted)',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400, marginBottom: 12 }}>
              {q ? 'No laws found' : 'Search for laws'}
            </div>
            <p style={{ fontSize: 14 }}>
              {q ? 'Try different keywords or broaden your filters.' : 'Enter a keyword, citation, or topic to start searching.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
