import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function JurisdictionDetailPage({ params }: { params: { slug: string } }) {
  const { data: jurisdiction } = await supabase
    .from('rr_jurisdictions')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!jurisdiction) notFound()

  const { data: agencies } = await supabase
    .from('rr_agencies')
    .select('*')
    .eq('jurisdiction_id', jurisdiction.id)

  const { data: laws } = await supabase
    .from('rr_law_records')
    .select(`*, citations:rr_citations(id, citation_text)`)
    .eq('jurisdiction_id', jurisdiction.id)
    .eq('status', 'published')
    .order('updated_at', { ascending: false })
    .limit(20)

  const { data: updates } = await supabase
    .from('rr_legal_updates')
    .select('*')
    .eq('linked_jurisdiction_id', jurisdiction.id)
    .eq('update_status', 'published')
    .order('published_at', { ascending: false })
    .limit(5)

  const { data: children } = await supabase
    .from('rr_jurisdictions')
    .select('*')
    .eq('parent_jurisdiction_id', jurisdiction.id)
    .order('name')

  const jType = jurisdiction.jurisdiction_type
  const jColor = jType === 'federal' ? '#818CF8' : jType === 'state' ? '#60A5FA' : jType === 'county' ? '#34D399' : '#FBBF24'

  return (
    <div style={{ paddingTop: 100, maxWidth: 1000, margin: '0 auto', padding: '100px 32px 80px' }}>
      <div style={{ marginBottom: 48 }}>
        <span style={{
          display: 'inline-block', padding: '4px 14px', borderRadius: 999,
          fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)',
          letterSpacing: '0.08em', textTransform: 'uppercase',
          background: `${jColor}15`, color: jColor, marginBottom: 16,
        }}>{jType}</span>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 52px)',
          fontWeight: 400, letterSpacing: '-0.01em', marginBottom: 12,
        }}>{jurisdiction.name}</h1>
        {jurisdiction.summary && (
          <p style={{ fontSize: 16, color: 'var(--rr-text-secondary)', lineHeight: 1.7, maxWidth: 600 }}>
            {jurisdiction.summary}
          </p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 48 }}>
        <div style={{ background: 'var(--rr-bg-card)', border: '1px solid var(--rr-border)', borderRadius: 8, padding: 20 }}>
          <div style={{ fontSize: 28, fontFamily: 'var(--font-display)', fontWeight: 600, color: jColor }}>{laws?.length || 0}</div>
          <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--rr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Laws</div>
        </div>
        <div style={{ background: 'var(--rr-bg-card)', border: '1px solid var(--rr-border)', borderRadius: 8, padding: 20 }}>
          <div style={{ fontSize: 28, fontFamily: 'var(--font-display)', fontWeight: 600, color: jColor }}>{agencies?.length || 0}</div>
          <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--rr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Agencies</div>
        </div>
        <div style={{ background: 'var(--rr-bg-card)', border: '1px solid var(--rr-border)', borderRadius: 8, padding: 20 }}>
          <div style={{ fontSize: 28, fontFamily: 'var(--font-display)', fontWeight: 600, color: jColor }}>{updates?.length || 0}</div>
          <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--rr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Updates</div>
        </div>
        <div style={{ background: 'var(--rr-bg-card)', border: '1px solid var(--rr-border)', borderRadius: 8, padding: 20 }}>
          <div style={{ fontSize: 28, fontFamily: 'var(--font-display)', fontWeight: 600, color: jColor }}>{children?.length || 0}</div>
          <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--rr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sub-jurisdictions</div>
        </div>
      </div>

      {/* CHILD JURISDICTIONS */}
      {children && children.length > 0 && (
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--rr-text-muted)', marginBottom: 16 }}>
            Sub-Jurisdictions
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {children.map((c: any) => (
              <Link key={c.id} href={`/jurisdiction/${c.slug}`} style={{
                padding: '8px 16px', borderRadius: 8,
                background: 'var(--rr-bg-card)', border: '1px solid var(--rr-border)',
                fontSize: 14, color: 'var(--rr-text)', textDecoration: 'none',
                transition: 'border-color 200ms',
              }}>{c.name}</Link>
            ))}
          </div>
        </div>
      )}

      {/* AGENCIES */}
      {agencies && agencies.length > 0 && (
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--rr-text-muted)', marginBottom: 16 }}>
            Agencies & Bodies
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {agencies.map((a: any) => (
              <div key={a.id} style={{
                background: 'var(--rr-bg-card)', border: '1px solid var(--rr-border)',
                borderRadius: 8, padding: '12px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontWeight: 500 }}>{a.agency_name}</span>
                {a.agency_type && <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--rr-text-muted)', textTransform: 'uppercase' }}>{a.agency_type}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LAWS */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--rr-text-muted)', marginBottom: 16 }}>
          Laws in {jurisdiction.name}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {laws?.map((law: any) => (
            <Link key={law.id} href={`/law/${law.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'var(--rr-bg-card)', border: '1px solid var(--rr-border)',
                borderRadius: 8, padding: '16px 20px', transition: 'border-color 200ms',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 10, fontFamily: 'var(--font-mono)', background: 'var(--rr-bg-elevated)', color: 'var(--rr-text-muted)', textTransform: 'uppercase' }}>{law.law_type}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--rr-text)', marginBottom: 4 }}>{law.law_title}</div>
                {law.citations?.[0] && <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--rr-accent)' }}>{law.citations[0].citation_text}</div>}
                <p style={{ fontSize: 13, color: 'var(--rr-text-secondary)', marginTop: 4 }}>{law.short_summary}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
