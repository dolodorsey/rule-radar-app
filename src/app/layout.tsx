import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Rule Radar — Legal Intelligence Platform',
  description: 'Search, understand, compare, and track laws across city, county, state, and federal jurisdictions. Real citations from official sources.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
