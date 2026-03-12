import Link from 'next/link'

export const dynamic = 'force-dynamic'

const TOPICS = [
  { name: 'Labor & Employment', slug: 'labor-employment', icon: '⚖️' },
  { name: 'Zoning & Land Use', slug: 'zoning-land-use', icon: '🏗️' },
  { name: 'Taxes & Revenue', slug: 'taxes-revenue', icon: '💰' },
  { name: 'Business Licensing', slug: 'business-licensing', icon: '📋' },
  { name: 'Health & Safety', slug: 'health-safety', icon: '🛡️' },
  { name: 'Privacy & Data', slug: 'privacy-data', icon: '🔒' },
  { name: 'Real Estate & Housing', slug: 'real-estate-housing', icon: '🏠' },
  { name: 'Food & Beverage', slug: 'food-beverage-service', icon: '🍽️' },
]

const JURISDICTIONS = [
  { name: 'Federal', type: 'federal', count: '50K+' },
  { name: 'State', type: 'state', count: '500K+' },
  { name: 'County', type: 'county', count: '1.2M+' },
  { name: 'City', type: 'city', count: '3.5M+' },
]

export default function LandingPage() {
  return (
    <div style={{ paddingTop: 64 }}>
      {/* HERO */}
      <section style={{
        minHeight: '90vh',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        textAlign: 'center',
        padding: '120px 32px 80px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background gradient orb */}
        <div style={{
          position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
          width: 800, height: 600,
          background: 'radial-gradient(ellipse at center, rgba(200,121,65,0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
        
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: 'var(--rr-accent)', marginBottom: 24,
          opacity: 0, animation: 'fadeInUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s forwards',
        }}>
          Legal Intelligence Platform
        </div>
        
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 300,
          fontSize: 'clamp(48px, 8vw, 100px)', lineHeight: 0.95,
          letterSpacing: '-0.02em', maxWidth: 900,
          opacity: 0, animation: 'fadeInUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s forwards',
        }}>
          Every Law.<br />
          <span style={{ fontWeight: 600, fontStyle: 'italic', color: 'var(--rr-accent)' }}>Every Jurisdiction.</span><br />
          One Search.
        </h1>
        
        <p style={{
          marginTop: 32, maxWidth: 560,
          color: 'var(--rr-text-secondary)', fontSize: 'clamp(16px, 1.5vw, 19px)',
          lineHeight: 1.7,
          opacity: 0, animation: 'fadeInUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.35s forwards',
        }}>
          Search, understand, compare, and track laws across city, county, state, and federal levels. Plain language. Citation-backed. Always current.
        </p>
        
        {/* SEARCH BAR */}
        <div style={{
          marginTop: 48, width: '100%', maxWidth: 640,
          opacity: 0, animation: 'fadeInUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.5s forwards',
        }}>
          <form action="/search" style={{
            display: 'flex', gap: 0,
            background: 'var(--rr-bg-elevated)',
            border: '1px solid var(--rr-border-hover)',
            borderRadius: 8, overflow: 'hidden',
          }}>
            <input
              name="q"
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
              transition: 'background 150ms',
            }}>
              Search
            </button>
          </form>
        </div>

        {/* JURISDICTION PILLS */}
        <div style={{
          marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center',
          opacity: 0, animation: 'fadeInUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.6s forwards',
        }}>
          {JURISDICTIONS.map(j => (
            <span key={j.type} style={{
              padding: '6px 14px', borderRadius: 999,
              fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-mono)',
              letterSpacing: '0.04em', textTransform: 'uppercase',
              background: j.type === 'federal' ? 'rgba(129,140,248,0.12)' :
                         j.type === 'state' ? 'rgba(96,165,250,0.12)' :
                         j.type === 'county' ? 'rgba(52,211,153,0.12)' :
                         'rgba(251,191,36,0.12)',
              color: j.type === 'federal' ? '#818CF8' :
                     j.type === 'state' ? '#60A5FA' :
                     j.type === 'county' ? '#34D399' : '#FBBF24',
            }}>
              {j.name} · {j.count} laws
            </span>
          ))}
        </div>
      </section>

      {/* TOPICS GRID */}
      <section style={{ padding: '80px 32px 100px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'var(--rr-accent)', marginBottom: 16,
          }}>Browse by Topic</div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 52px)',
            fontWeight: 400, letterSpacing: '-0.01em',
          }}>
            Find the <span style={{ fontStyle: 'italic', fontWeight: 600 }}>right law</span> for your situation
          </h2>
        </div>
        
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 16,
        }}>
          {TOPICS.map(topic => (
            <Link key={topic.slug} href={`/topic/${topic.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'var(--rr-bg-card)',
                border: '1px solid var(--rr-border)',
                borderRadius: 12, padding: '24px',
                transition: 'all 250ms cubic-bezier(0.16,1,0.3,1)',
                cursor: 'pointer',
              }}
              >
                <div style={{ fontSize: 28, marginBottom: 12 }}>{topic.icon}</div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600,
                  color: 'var(--rr-text)', marginBottom: 4,
                }}>{topic.name}</div>
                <div style={{ fontSize: 13, color: 'var(--rr-text-muted)' }}>
                  Explore laws →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* VALUE PROPOSITION */}
      <section style={{
        padding: '100px 32px',
        background: 'linear-gradient(180deg, transparent, rgba(200,121,65,0.03), transparent)',
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 48px)',
              fontWeight: 400, letterSpacing: '-0.01em',
            }}>
              Built for <span style={{ fontStyle: 'italic', fontWeight: 600 }}>clarity</span>, not complexity
            </h2>
          </div>
          
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 48,
          }}>
            {[
              { title: 'Plain Language Summaries', desc: 'Every law explained in clear, accessible language. Read the summary first, dig into the legal text when you need to.' },
              { title: 'Citation-Backed Trust', desc: 'Every summary links to its official source. Know exactly where the information comes from and when it was last verified.' },
              { title: 'Compare Across Jurisdictions', desc: 'See how the same issue is handled at city, county, state, and federal levels. Side-by-side, clear differences.' },
              { title: 'Track What Changes', desc: 'Follow specific laws, topics, or jurisdictions. Get notified when something is amended, repealed, or takes effect.' },
              { title: 'Version History', desc: 'See how laws have evolved over time. Compare old and new versions to understand exactly what changed.' },
              { title: 'Pro Monitoring Tools', desc: 'Build watchlists, save searches, collaborate with teams. Everything compliance and legal teams need.' },
            ].map((item, i) => (
              <div key={i}>
                <div style={{
                  width: 40, height: 2, background: 'var(--rr-accent)',
                  marginBottom: 20, borderRadius: 1,
                }} />
                <h3 style={{
                  fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600,
                  marginBottom: 10,
                }}>{item.title}</h3>
                <p style={{ color: 'var(--rr-text-secondary)', fontSize: 14, lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '100px 32px', textAlign: 'center',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 56px)',
          fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 24,
        }}>
          Start searching <span style={{ fontStyle: 'italic', fontWeight: 600, color: 'var(--rr-accent)' }}>now</span>
        </h2>
        <p style={{ color: 'var(--rr-text-secondary)', fontSize: 17, marginBottom: 40, maxWidth: 480, margin: '0 auto 40px' }}>
          Free access to the public legal intelligence platform. Pro tools available for teams.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <Link href="/search" style={{
            padding: '14px 36px', borderRadius: 6,
            background: 'var(--rr-accent)', color: '#fff',
            fontSize: 14, fontWeight: 700, letterSpacing: '0.04em',
            textTransform: 'uppercase', textDecoration: 'none',
          }}>Search Laws</Link>
          <Link href="/updates" style={{
            padding: '14px 36px', borderRadius: 6,
            border: '1px solid var(--rr-border-hover)', color: 'var(--rr-text)',
            fontSize: 14, fontWeight: 700, letterSpacing: '0.04em',
            textTransform: 'uppercase', textDecoration: 'none',
          }}>View Updates</Link>
        </div>
      </section>
    </div>
  )
}
