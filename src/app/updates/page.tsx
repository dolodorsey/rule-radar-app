import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default async function UpdatesPage() {
  const { data: updates } = await supabase
    .from('rr_legal_updates')
    .select(`
      *,
      law_record:rr_law_records(id, law_title, slug),
      jurisdiction:rr_jurisdictions(id, name, slug, jurisdiction_type)
    `)
    .eq('update_status', 'published')
    .order('published_at', { ascending: false })
    .limit(50)

  const typeColors: Record<string, { bg: string; color: string }> = {
    amendment: { bg: 'rgba(96,165,250,0.12)', color: '#60A5FA' },
    new_law: { bg: 'rgba(52,211,153,0.12)', color: '#34D399' },
    repeal: { bg: 'rgba(248,113,113,0.12)', color: '#F87171' },
    editorial_summary: { bg: 'rgba(200,121,65,0.12)', color: '#C87941' },
    effective_date_change: { bg: 'rgba(251,191,36,0.12)', color: '#FBBF24' },
  }

  return (
    <div style={{ paddingTop: 100, maxWidth: 800, margin: '0 auto', padding: '100px 32px 80px' }}>
      <div style={{ marginBottom: 48 }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: 'var(--rr-accent)', marginBottom: 12,
        }}>Legal Updates</div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 52px)',
          fontWeight: 400, letterSpacing: '-0.01em',
        }}>
          What&apos;s <span style={{ fontStyle: 'italic', fontWeight: 600 }}>changing</span>
        </h1>
        <p style={{ color: 'var(--rr-text-secondary)', fontSize: 16, marginTop: 12, maxWidth: 500 }}>
          New laws, amendments, repeals, and effective date changes across all jurisdictions.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {updates?.map((u: any) => {
          const tc = typeColors[u.update_type] || typeColors.editorial_summary
          return (
            <div key={u.id} style={{
              background: 'var(--rr-bg-card)', border: '1px solid var(--rr-border)',
              borderRadius: 12, padding: '24px',
              borderLeft: `3px solid ${tc.color}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                <span style={{
                  padding: '3px 10px', borderRadius: 999, fontSize: 10, fontWeight: 600,
                  fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase',
                  background: tc.bg, color: tc.color,
                }}>{u.update_type.replace(/_/g, ' ')}</span>
                {u.jurisdiction && (
                  <Link href={`/jurisdiction/${u.jurisdiction.slug}`} style={{
                    padding: '3px 10px', borderRadius: 999, fontSize: 10, fontWeight: 600,
                    fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', textTransform: 'uppercase',
                    background: 'var(--rr-bg-elevated)', color: 'var(--rr-text-muted)',
                    textDecoration: 'none',
                  }}>{u.jurisdiction.name}</Link>
                )}
                {u.published_at && (
                  <span style={{ fontSize: 12, color: 'var(--rr-text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {new Date(u.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
              <h3 style={{
                fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600,
                color: 'var(--rr-text)', marginBottom: 8,
              }}>{u.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--rr-text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>
                {u.short_summary}
              </p>
              {u.law_record && (
                <Link href={`/law/${u.law_record.slug}`} style={{
                  fontSize: 13, color: 'var(--rr-accent)', fontFamily: 'var(--font-mono)',
                }}>
                  View Law: {u.law_record.law_title} →
                </Link>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
