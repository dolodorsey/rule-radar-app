import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default async function ComparePage() {
  const { data: jurisdictions } = await supabase
    .from('rr_jurisdictions')
    .select('*')
    .order('jurisdiction_type')
    .order('name')

  const { data: topics } = await supabase
    .from('rr_topics')
    .select('*')
    .eq('active_flag', true)
    .order('topic_name')

  const grouped = jurisdictions?.reduce((acc: any, j: any) => {
    if (!acc[j.jurisdiction_type]) acc[j.jurisdiction_type] = []
    acc[j.jurisdiction_type].push(j)
    return acc
  }, {}) || {}

  const typeOrder = ['federal', 'state', 'county', 'city']
  const typeColors: Record<string, string> = {
    federal: '#818CF8', state: '#60A5FA', county: '#34D399', city: '#FBBF24',
  }

  return (
    <div style={{ paddingTop: 100, maxWidth: 1000, margin: '0 auto', padding: '100px 32px 80px' }}>
      <div style={{ marginBottom: 48 }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: 'var(--rr-accent)', marginBottom: 12,
        }}>Compare Tool</div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 52px)',
          fontWeight: 400, letterSpacing: '-0.01em',
        }}>
          Compare laws <span style={{ fontStyle: 'italic', fontWeight: 600 }}>across jurisdictions</span>
        </h1>
        <p style={{ color: 'var(--rr-text-secondary)', fontSize: 16, marginTop: 12, maxWidth: 520 }}>
          See how the same legal issue is handled at city, county, state, and federal levels. Side by side.
        </p>
      </div>

      {/* COMPARE MODES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 64 }}>
        {[
          { title: 'Jurisdiction vs Jurisdiction', desc: 'Compare how two jurisdictions handle the same topic.', icon: '⚖️' },
          { title: 'Law vs Law', desc: 'Place two specific laws side by side for direct comparison.', icon: '📋' },
          { title: 'Version vs Version', desc: 'See what changed between the old and new version of a law.', icon: '🔄' },
          { title: 'Multi-Level', desc: 'City vs county vs state vs federal treatment of one issue.', icon: '🏛️' },
        ].map((mode, i) => (
          <div key={i} style={{
            background: 'var(--rr-bg-card)', border: '1px solid var(--rr-border)',
            borderRadius: 12, padding: 24, cursor: 'pointer',
            transition: 'border-color 200ms',
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>{mode.icon}</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, marginBottom: 6 }}>{mode.title}</h3>
            <p style={{ fontSize: 13, color: 'var(--rr-text-secondary)' }}>{mode.desc}</p>
          </div>
        ))}
      </div>

      {/* JURISDICTION BROWSER */}
      <div style={{ marginBottom: 48 }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--rr-text-muted)', marginBottom: 20,
        }}>Select Jurisdictions to Compare</div>
        
        {typeOrder.map(type => (
          grouped[type] && (
            <div key={type} style={{ marginBottom: 24 }}>
              <div style={{
                fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)',
                color: typeColors[type], textTransform: 'uppercase', letterSpacing: '0.06em',
                marginBottom: 10,
              }}>{type}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {grouped[type].map((j: any) => (
                  <Link key={j.id} href={`/jurisdiction/${j.slug}`} style={{
                    padding: '6px 14px', borderRadius: 6,
                    background: 'var(--rr-bg-card)', border: '1px solid var(--rr-border)',
                    fontSize: 13, color: 'var(--rr-text-secondary)', textDecoration: 'none',
                    transition: 'all 200ms',
                  }}>{j.name}</Link>
                ))}
              </div>
            </div>
          )
        ))}
      </div>

      {/* TOPIC BROWSER */}
      <div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--rr-text-muted)', marginBottom: 20,
        }}>Or Compare by Topic</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {topics?.map((t: any) => (
            <Link key={t.id} href={`/topic/${t.slug}`} style={{
              padding: '8px 16px', borderRadius: 8,
              background: 'var(--rr-bg-card)', border: '1px solid var(--rr-border)',
              fontSize: 14, color: 'var(--rr-text)', textDecoration: 'none',
            }}>
              {t.icon && <span style={{ marginRight: 6 }}>{t.icon}</span>}
              {t.topic_name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
