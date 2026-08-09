'use client'

import { LAW_APPROVED_SUPABASE_URL } from '../config/law-public-backend'

const CURRENT_LAW_MOTION = `${LAW_APPROVED_SUPABASE_URL}/storage/v1/object/public/brand-graphics/kollective/animations/THE_LAW_ANI.mp4`

export default function CurrentLawMotion() {
  return (
    <section className="law-current-motion" aria-label="THE LAW legal intelligence">
      <video className="law-current-motion__video" src={CURRENT_LAW_MOTION} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />
      <div className="law-current-motion__shade" />
      <div className="law-current-motion__copy">
        <span>SOURCE-AWARE LEGAL INTELLIGENCE</span>
        <strong>Know what changed. See where it came from.</strong>
        <p>Official sources, verification states, and plain-language research stay visible together.</p>
      </div>
    </section>
  )
}
