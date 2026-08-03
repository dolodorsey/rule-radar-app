import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'THE LAW — Legal Intelligence',
  description: 'Search source-aware legal records across federal, state, county, and city jurisdictions.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
