'use client'

export default function Navigation() {
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
