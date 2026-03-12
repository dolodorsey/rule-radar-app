import type { Metadata } from 'next'
import './globals.css'
import Navigation from '@/components/Navigation'

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
