import { ArrowLeft, ArrowUpRight, ShieldCheck, Smartphone } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Get THE LAW",
  description: "Use THE LAW on mobile and track verified native release availability.",
};

export default function DownloadPage() {
  return <main className="download-page">
    <div className="download-art" aria-hidden="true" />
    <div className="download-shade" />
    <section className="download-card">
      <Link className="back-home" href="/"><ArrowLeft size={15} /> THE LAW</Link>
      <span className="download-mark">XII</span>
      <p className="section-label">LEGAL INTELLIGENCE, WHEREVER YOU ARE</p>
      <h1>Take the catalog<br />with you.</h1>
      <p className="download-copy">Search source-aware legal records across federal, state, county, and city jurisdictions.</p>
      <Link className="official-button" href="/">Open THE LAW <ArrowUpRight size={18} /></Link>
      <div className="platform-note"><Smartphone size={18} /><span><strong>Native releases in preparation</strong><small>Verified App Store, TestFlight, and Android links will appear only after signed builds are genuinely available.</small></span></div>
      <div className="platform-note"><ShieldCheck size={18} /><span><strong>Prefer the web?</strong><small>The full catalog works in your mobile browser without an installation.</small></span></div>
      <p className="download-disclaimer">Legal information only—not legal advice. Confirm current requirements with an official source or licensed attorney.</p>
    </section>
  </main>;
}
