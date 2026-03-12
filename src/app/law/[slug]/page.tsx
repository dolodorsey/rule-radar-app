import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function LawDetailPage({ params }: { params: { slug: string } }) {
  const { data: law } = await supabase
    .from('rr_law_records')
    .select(`
      *,
      jurisdiction:rr_jurisdictions(id, name, slug, jurisdiction_type, parent_jurisdiction_id),
      agency:rr_agencies(id, agency_name),
      citations:rr_citations(id, citation_text, citation_type, official_reference_url)
    `)
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

  if (!law) notFound()

  // Get topics for this law
  const { data: lawTopics } = await supabase
    .from('rr_law_topics')
    .select('topic:rr_topics(id, topic_name, slug, icon)')
    .eq('law_record_id', law.id)

  // Get updates for this law
  const { data: updates } = await supabase
    .from('rr_legal_updates')
    .select('*')
    .eq('linked_law_record_id', law.id)
    .eq('update_status', 'published')
    .order('published_at', { ascending: false })
    .limit(5)

  // Get related laws (same jurisdiction)
  const { data: related } = await supabase
    .from('rr_law_records')
    .select('id, law_title, slug, law_type, short_summary')
    .eq('jurisdiction_id', law.jurisdiction_id)
    .eq('status', 'published')
    .neq('id', law.id)
    .limit(3)

  const jType = law.jurisdiction?.jurisdiction_type
  const jColor = jType === 'federal' ? '#818CF8' : jType === 'state' ? '#60A5FA' : jType === 'county' ? '#34D399' : '#FBBF24'
  const jBg = jType === 'federal' ? 'rgba(129,140,248,0.12)' : jType === 'state' ? 'rgba(96,165,250,0.12)' : jType === 'county' ? 'rgba(52,211,153,0.12)' : 'rgba(251,191,36,0.12)'

  return (
    <div style={{ paddingTop: 100, maxWidth: 900, margin: '0 auto', padding: '100px 32px 80px' }}>
      {/* BREADCRUMB */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, fontSize: 13, color: 'var(--rr-text-muted)' }}>
        <Link href="/search" style={{ color: 'var(--rr-text-muted)', textDecoration: 'none' }}>Search</Link>
        <span>›</span>
        {law.jurisdiction && (
          <>
            <Link href={`/jurisdiction/${law.jurisdiction.slug}`} style={{ color: 'var(--rr-text-muted)', textDecoration: 'none' }}>{law.jurisdiction.name}</Link>
            <span>›</span>
          </>
        )}
        <span style={{ color: 'var(--rr-text-secondary)' }}>{law.law_title}</span>
      </div>

      {/* HEADER */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          {law.jurisdiction && (
            <span style={{
              padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600,
              fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase',
              background: jBg, color: jColor,
            }}>{jType} · {law.jurisdiction.name}</span>
          )}
          <span style={{
            padding: '4px 10px', borderRadius: 999, fontSize: 11,
            fontFamily: 'var(--font-mono)', background: 'var(--rr-bg-elevated)',
            color: 'var(--rr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>{law.law_type}</span>
          <span style={{
            padding: '4px 10px', borderRadius: 999, fontSize: 11,
            fontFamily: 'var(--font-mono)', background: 'rgba(74,222,128,0.1)',
            color: '#4ADE80', textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>{law.status}</span>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 48px)',
          fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.1,
          marginBottom: 16,
        }}>{law.law_title}</h1>

        {law.citations?.map((c: any) => (
          <div key={c.id} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: 6,
            background: 'var(--rr-accent-muted)',
            fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--rr-accent)',
            marginBottom: 8, marginRight: 8,
          }}>
            {c.citation_text}
            {c.official_reference_url && (
              <a href={c.official_reference_url} target="_blank" rel="noopener" style={{
                fontSize: 11, color: 'var(--rr-text-muted)', textDecoration: 'underline',
              }}>source ↗</a>
            )}
          </div>
        ))}

        {law.effective_date && (
          <div style={{ marginTop: 12, fontSize: 13, color: 'var(--rr-text-muted)', fontFamily: 'var(--font-mono)' }}>
            Effective: {new Date(law.effective_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        )}
      </div>

      {/* SUMMARY CARD */}
      <div style={{
        background: 'var(--rr-bg-card)', border: '1px solid var(--rr-border)',
        borderRadius: 12, padding: 32, marginBottom: 32,
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--rr-accent)', marginBottom: 16,
        }}>Plain Language Summary</div>
        <p style={{ fontSize: 17, lineHeight: 1.8, color: 'var(--rr-text)' }}>
          {law.short_summary}
        </p>
      </div>

      {/* DETAILED EXPLANATION */}
      {law.long_summary && (
        <div style={{
          background: 'var(--rr-bg-card)', border: '1px solid var(--rr-border)',
          borderRadius: 12, padding: 32, marginBottom: 32,
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--rr-text-muted)', marginBottom: 16,
          }}>Detailed Explanation</div>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--rr-text-secondary)' }}>
            {law.long_summary}
          </p>
        </div>
      )}

      {/* WHO IT AFFECTS */}
      {law.affected_parties_text && (
        <div style={{
          background: 'var(--rr-bg-card)', border: '1px solid var(--rr-border)',
          borderRadius: 12, padding: 32, marginBottom: 32,
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--rr-text-muted)', marginBottom: 16,
          }}>Who It Affects</div>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--rr-text-secondary)' }}>
            {law.affected_parties_text}
          </p>
        </div>
      )}

      {/* TOPICS */}
      {lawTopics && lawTopics.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--rr-text-muted)', marginBottom: 12,
          }}>Topics</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {lawTopics.map((lt: any) => (
              <Link key={lt.topic.id} href={`/topic/${lt.topic.slug}`} style={{
                padding: '6px 14px', borderRadius: 999,
                background: 'var(--rr-bg-card)', border: '1px solid var(--rr-border)',
                fontSize: 13, color: 'var(--rr-text-secondary)', textDecoration: 'none',
              }}>
                {lt.topic.icon && <span style={{ marginRight: 4 }}>{lt.topic.icon}</span>}
                {lt.topic.topic_name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* UPDATES */}
      {updates && updates.length > 0 && (
        <div style={{ marginBottom: 48 }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--rr-text-muted)', marginBottom: 16,
          }}>Recent Updates</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {updates.map((u: any) => (
              <div key={u.id} style={{
                background: 'var(--rr-bg-card)', border: '1px solid var(--rr-border)',
                borderRadius: 8, padding: '16px 20px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 999, fontSize: 10,
                    fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
                    background: u.update_type === 'amendment' ? 'rgba(96,165,250,0.12)' :
                               u.update_type === 'new_law' ? 'rgba(52,211,153,0.12)' :
                               'rgba(200,121,65,0.12)',
                    color: u.update_type === 'amendment' ? '#60A5FA' :
                           u.update_type === 'new_law' ? '#34D399' : 'var(--rr-accent)',
                  }}>{u.update_type.replace('_', ' ')}</span>
                  {u.published_at && (
                    <span style={{ fontSize: 11, color: 'var(--rr-text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(u.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
                <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--rr-text)', marginBottom: 4 }}>{u.title}</div>
                <p style={{ fontSize: 13, color: 'var(--rr-text-secondary)' }}>{u.short_summary}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RELATED */}
      {related && related.length > 0 && (
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--rr-text-muted)', marginBottom: 16,
          }}>Related Laws</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {related.map((r: any) => (
              <Link key={r.id} href={`/law/${r.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'var(--rr-bg-card)', border: '1px solid var(--rr-border)',
                  borderRadius: 8, padding: '16px 20px', transition: 'border-color 200ms',
                }}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--rr-text)' }}>{r.law_title}</div>
                  <p style={{ fontSize: 13, color: 'var(--rr-text-secondary)', marginTop: 4 }}>{r.short_summary}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ACTIONS */}
      <div style={{
        marginTop: 48, paddingTop: 32, borderTop: '1px solid var(--rr-border)',
        display: 'flex', gap: 12,
      }}>
        <Link href={`/compare?law=${law.slug}`} style={{
          padding: '10px 24px', borderRadius: 6,
          background: 'var(--rr-accent)', color: '#fff',
          fontSize: 13, fontWeight: 700, letterSpacing: '0.04em',
          textTransform: 'uppercase', textDecoration: 'none',
        }}>Compare</Link>
        <Link href={`/jurisdiction/${law.jurisdiction?.slug}`} style={{
          padding: '10px 24px', borderRadius: 6,
          border: '1px solid var(--rr-border-hover)', color: 'var(--rr-text)',
          fontSize: 13, fontWeight: 700, letterSpacing: '0.04em',
          textTransform: 'uppercase', textDecoration: 'none',
        }}>View Jurisdiction</Link>
      </div>
    </div>
  )
}
