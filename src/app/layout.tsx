import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Rule Radar — Legal Intelligence Platform',
  description: 'Search, understand, compare, and track laws across city, county, state, and federal jurisdictions.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="grain" />
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}

function Navigation() {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(10, 14, 26, 0.85)',
      backdropFilter: 'blur(16px) saturate(180%)',
      borderBottom: '1px solid var(--rr-border)',
    }}>
      <div style={{
        maxWidth: 1400, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 32px',
      }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 6,
            background: 'linear-gradient(135deg, var(--rr-accent), #A0522D)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: '#fff',
          }}>R</div>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600,
            color: 'var(--rr-text)', letterSpacing: '-0.01em',
          }}>Rule Radar</span>
        </a>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {[
            { href: '/search', label: 'Search' },
            { href: '/updates', label: 'Updates' },
            { href: '/compare', label: 'Compare' },
          ].map(link => (
            <a key={link.href} href={link.href} style={{
              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
              color: 'var(--rr-text-secondary)', letterSpacing: '0.04em',
              textTransform: 'uppercase', textDecoration: 'none',
              transition: 'color 150ms',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--rr-text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--rr-text-secondary)')}
            >{link.label}</a>
          ))}
          <a href="/search" style={{
            padding: '8px 20px', borderRadius: 4,
            background: 'var(--rr-accent)', color: '#fff',
            fontSize: 12, fontWeight: 700, letterSpacing: '0.06em',
            textTransform: 'uppercase', textDecoration: 'none',
            transition: 'all 150ms',
          }}>Search Laws</a>
        </div>
      </div>
    </nav>
  )
}

function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--rr-border)',
      padding: '48px 32px',
      maxWidth: 1400, margin: '0 auto',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 32 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, marginBottom: 8 }}>Rule Radar</div>
          <p style={{ color: 'var(--rr-text-muted)', fontSize: 13, maxWidth: 320 }}>
            Jurisdiction-based legal intelligence. Search, compare, and track laws across every level of government.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 64 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--rr-text-muted)', marginBottom: 12, fontFamily: 'var(--font-mono)' }}>Platform</div>
            {['Search', 'Topics', 'Jurisdictions', 'Updates', 'Compare'].map(l => (
              <a key={l} href={`/${l.toLowerCase()}`} style={{ display: 'block', color: 'var(--rr-text-secondary)', fontSize: 14, marginBottom: 8, textDecoration: 'none' }}>{l}</a>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--rr-text-muted)', marginBottom: 12, fontFamily: 'var(--font-mono)' }}>Product</div>
            {['Pro Workspace', 'Team Tools', 'API', 'Pricing'].map(l => (
              <span key={l} style={{ display: 'block', color: 'var(--rr-text-muted)', fontSize: 14, marginBottom: 8 }}>{l}</span>
            ))}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--rr-border)', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--rr-text-muted)', fontFamily: 'var(--font-mono)' }}>
        <span>&copy; 2026 Rule Radar. All rights reserved.</span>
        <span>A Kollective Hospitality Group Product</span>
      </div>
    </footer>
  )
}
