import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function TopicDetailPage({ params }: { params: { slug: string } }) {
  const { data: topic } = await supabase
    .from('rr_topics')
    .select('*')
    .eq('slug', params.slug)
    .eq('active_flag', true)
    .single()

  if (!topic) notFound()

  const { data: lawTopics } = await supabase
    .from('rr_law_topics')
    .select(`
      law:rr_law_records(
        id, law_title, slug, law_type, short_summary, effective_date, status,
        jurisdiction:rr_jurisdictions(id, name, slug, jurisdiction_type),
        citations:rr_citations(id, citation_text)
      )
    `)
    .eq('topic_id', topic.id)

  const laws = lawTopics?.map((lt: any) => lt.law).filter((l: any) => l?.status === 'published') || []

  return (
    <div style={{ paddingTop: 100, maxWidth: 1000, margin: '0 auto', padding: '100px 32px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, fontSize: 13, color: 'var(--rr-text-muted)' }}>
        <Link href="/search" style={{ color: 'var(--rr-text-muted)', textDecoration: 'none' }}>Topics</Link>
        <span>›</span>
        <span style={{ color: 'var(--rr-text-secondary)' }}>{topic.topic_name}</span>
      </div>

      <div style={{ marginBottom: 48 }}>
        {topic.icon && <div style={{ fontSize: 40, marginBottom: 16 }}>{topic.icon}</div>}
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 52px)',
          fontWeight: 400, letterSpacing: '-0.01em', marginBottom: 16,
        }}>{topic.topic_name}</h1>
        {topic.short_summary && (
          <p style={{ fontSize: 17, color: 'var(--rr-text-secondary)', lineHeight: 1.7, maxWidth: 600 }}>
            {topic.short_summary}
          </p>
        )}
      </div>

      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
        letterSpacing: '0.1em', textTransform: 'uppercase',
        color: 'var(--rr-text-muted)', marginBottom: 16,
      }}>Laws by Jurisdiction · {laws.length} records</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {laws.map((law: any) => {
          const jType = law.jurisdiction?.jurisdiction_type
          const jColor = jType === 'federal' ? '#818CF8' : jType === 'state' ? '#60A5FA' : jType === 'county' ? '#34D399' : '#FBBF24'
          const jBg = jType === 'federal' ? 'rgba(129,140,248,0.12)' : jType === 'state' ? 'rgba(96,165,250,0.12)' : jType === 'county' ? 'rgba(52,211,153,0.12)' : 'rgba(251,191,36,0.12)'
          return (
            <Link key={law.id} href={`/law/${law.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'var(--rr-bg-card)', border: '1px solid var(--rr-border)',
                borderRadius: 12, padding: '24px', transition: 'border-color 200ms',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  {law.jurisdiction && (
                    <span style={{
                      padding: '3px 10px', borderRadius: 999, fontSize: 10, fontWeight: 600,
                      fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase',
                      background: jBg, color: jColor,
                    }}>{jType} · {law.jurisdiction.name}</span>
                  )}
                  <span style={{
                    padding: '3px 8px', borderRadius: 999, fontSize: 10,
                    fontFamily: 'var(--font-mono)', background: 'var(--rr-bg-elevated)',
                    color: 'var(--rr-text-muted)', textTransform: 'uppercase',
                  }}>{law.law_type}</span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--rr-text)', marginBottom: 4 }}>
                  {law.law_title}
                </h3>
                {law.citations?.[0] && (
                  <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--rr-accent)', marginBottom: 6 }}>
                    {law.citations[0].citation_text}
                  </div>
                )}
                <p style={{ fontSize: 14, color: 'var(--rr-text-secondary)', lineHeight: 1.6 }}>{law.short_summary}</p>
              </div>
            </Link>
          )
        })}
      </div>

      <div style={{ marginTop: 48, display: 'flex', gap: 12 }}>
        <Link href={`/compare?topic=${topic.slug}`} style={{
          padding: '10px 24px', borderRadius: 6,
          background: 'var(--rr-accent)', color: '#fff',
          fontSize: 13, fontWeight: 700, letterSpacing: '0.04em',
          textTransform: 'uppercase', textDecoration: 'none',
        }}>Compare by Jurisdiction</Link>
      </div>
    </div>
  )
}
