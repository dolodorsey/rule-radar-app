"use client";
import { useState, useEffect, useRef } from "react";

const P={bg:"#FAF8F5",card:"#fff",copper:"#B45309",copperLight:"#FEF3C7",navy:"#1E3A5F",navyLight:"#EFF6FF",text:"#1C1917",textMid:"#57534E",textLight:"#A8A29E",red:"#DC2626",redLight:"#FEF2F2",green:"#059669",greenLight:"#ECFDF5",shadow:"0 2px 16px rgba(30,58,95,0.06)",shadowLg:"0 8px 32px rgba(30,58,95,0.1)"};

/* Real law data with actual citations — sourced from Supabase rr_law_records */
const laws = [
  {id:"flsa",title:"Fair Labor Standards Act (FLSA)",jurisdiction:"Federal",type:"Statute",citation:"29 U.S.C. §§ 201–219",effective:"1938-06-25",summary:"Establishes minimum wage ($7.25/hr), overtime pay (1.5x over 40hrs/wk), recordkeeping, and youth employment standards.",parties:"Employers with $500K+ annual gross revenue",source:"https://uscode.house.gov/view.xhtml?path=/prelim@title29&edition=prelim",status:"Active",topic:"Labor & Employment"},
  {id:"ada",title:"Americans with Disabilities Act (ADA)",jurisdiction:"Federal",type:"Statute",citation:"42 U.S.C. §§ 12101–12213",effective:"1990-07-26",summary:"Prohibits disability discrimination in employment (Title I), government services (Title II), public accommodations (Title III), and telecom (Title IV). Employers with 15+ employees must provide reasonable accommodations.",parties:"Employers with 15+ employees, government, public accommodations",source:"https://uscode.house.gov/view.xhtml?path=/prelim@title42&edition=prelim",status:"Active",topic:"Labor & Employment"},
  {id:"fmla",title:"Family and Medical Leave Act (FMLA)",jurisdiction:"Federal",type:"Statute",citation:"29 U.S.C. §§ 2601–2654",effective:"1993-02-05",summary:"Up to 12 weeks unpaid, job-protected leave for birth/adoption, serious health condition, or family care. Employers with 50+ employees within 75 miles.",parties:"Employers with 50+ employees",source:"https://uscode.house.gov/view.xhtml?path=/prelim@title29&edition=prelim",status:"Active",topic:"Labor & Employment"},
  {id:"hipaa",title:"HIPAA Privacy Rule",jurisdiction:"Federal",type:"Statute",citation:"42 U.S.C. §§ 1320d–1320d-9",effective:"1996-08-21",summary:"National standards for PHI protection. Violations: $100–$50,000 per violation, max $1.5M/year per category.",parties:"Healthcare providers, health plans, clearinghouses",source:"https://uscode.house.gov/view.xhtml?path=/prelim@title42&edition=prelim",status:"Active",topic:"Health & Safety"},
  {id:"title-vii",title:"Title VII of the Civil Rights Act",jurisdiction:"Federal",type:"Statute",citation:"42 U.S.C. §§ 2000e–2000e-17",effective:"1964-07-02",summary:"Prohibits employment discrimination based on race, color, religion, sex, or national origin. Enforced by EEOC.",parties:"Employers with 15+ employees",source:"https://uscode.house.gov/view.xhtml?path=/prelim@title42&edition=prelim",status:"Active",topic:"Labor & Employment"},
  {id:"osha",title:"Occupational Safety and Health Act",jurisdiction:"Federal",type:"Statute",citation:"29 U.S.C. §§ 651–678",effective:"1970-12-29",summary:"Requires employers to provide workplaces free from recognized hazards. Penalties up to $156,259 per willful violation.",parties:"All private sector employers and employees",source:"https://www.osha.gov/laws-regs",status:"Active",topic:"Health & Safety"},
  {id:"ga-min-wage",title:"Georgia Minimum Wage Act",jurisdiction:"Georgia",type:"Statute",citation:"O.C.G.A. § 34-4-3",effective:"2001-01-01",summary:"Georgia minimum wage is $5.15/hr, but federal FLSA rate of $7.25 applies to most covered workers. Tipped employees: $2.13/hr if tips meet minimum.",parties:"All Georgia employers and employees",source:"https://law.justia.com/codes/georgia/",status:"Active",topic:"Labor & Employment"},
  {id:"ga-noncompete",title:"Georgia Restrictive Covenant Act",jurisdiction:"Georgia",type:"Statute",citation:"O.C.G.A. § 13-8-50 et seq.",effective:"2011-11-01",summary:"Non-competes enforceable up to 2 years if reasonable in time, geography, and scope. Courts may modify overly broad restrictions.",parties:"Employers, employees, contractors",source:"https://law.justia.com/codes/georgia/",status:"Active",topic:"Business Licensing"},
  {id:"ga-food",title:"Georgia Food Service Rules",jurisdiction:"Georgia",type:"Regulation",citation:"GA DPH Rules Ch. 511-6-1",effective:"2015-07-01",summary:"Requires valid permits, certified food safety managers, proper temperatures (cold ≤41°F, hot ≥135°F). Annual inspections, score 70+ to pass.",parties:"Restaurants, food trucks, catering, bars",source:"https://dph.georgia.gov/environmental-health/food-service",status:"Active",topic:"Food & Beverage"},
  {id:"ga-alcohol",title:"Georgia Alcohol Licensing",jurisdiction:"Georgia",type:"Statute",citation:"O.C.G.A. Title 3",effective:"2011-01-01",summary:"Local jurisdictions determine wet/dry status via election. On-premises licenses issued locally. Sunday sales per local option. Distance requirements from schools/churches.",parties:"Restaurants, bars, nightclubs, event venues",source:"https://law.justia.com/codes/georgia/",status:"Active",topic:"Food & Beverage"},
  {id:"tx-payday",title:"Texas Payday Law",jurisdiction:"Texas",type:"Statute",citation:"Tex. Labor Code Ch. 61",effective:"2001-09-01",summary:"Employers must designate paydays and pay all wages on schedule. Claims filed with Texas Workforce Commission. Federal $7.25/hr minimum applies.",parties:"All Texas employers and employees",source:"https://statutes.capitol.texas.gov/",status:"Active",topic:"Labor & Employment"},
  {id:"tx-tabc",title:"Texas TABC Mixed Beverage Rules",jurisdiction:"Texas",type:"Regulation",citation:"Tex. Alco. Bev. Code § 28.01",effective:"2019-09-01",summary:"MB permits required for liquor by the drink. Surety bond, sales records, local option compliance required. Late night permits (2AM+) need additional approval.",parties:"Bars, restaurants, nightclubs, event venues",source:"https://www.tabc.texas.gov/laws-rules/",status:"Active",topic:"Food & Beverage"},
  {id:"ca-ab5",title:"California AB 5 (Worker Classification)",jurisdiction:"California",type:"Statute",citation:"Cal. Labor Code § 2775",effective:"2020-01-01",summary:"ABC test: workers are employees unless (A) free from control, (B) outside usual business, (C) independently established trade. Penalties up to $25,000/violation.",parties:"All CA employers, gig companies, freelancers",source:"https://leginfo.legislature.ca.gov/",status:"Active",topic:"Labor & Employment"},
  {id:"ca-ccpa",title:"California CCPA/CPRA Privacy Rights",jurisdiction:"California",type:"Statute",citation:"Cal. Civ. Code § 1798.100",effective:"2023-01-01",summary:"Consumer rights to know, delete, opt-out of data sale. Applies to businesses with $25M+ revenue or 100K+ consumer data. Fines up to $7,500/intentional violation.",parties:"Businesses meeting thresholds, CA residents",source:"https://leginfo.legislature.ca.gov/",status:"Active",topic:"Privacy & Data"},
  {id:"ny-pfl",title:"New York Paid Family Leave",jurisdiction:"New York",type:"Statute",citation:"NY Workers' Comp. Law § 200",effective:"2018-01-01",summary:"Up to 12 weeks paid leave at 67% of average weekly wage. Covers bonding, family care, military exigency. Employee-funded via payroll deductions.",parties:"All NY private employers, employees with 26+ weeks",source:"https://paidfamilyleave.ny.gov/",status:"Active",topic:"Labor & Employment"},
  {id:"fl-min-wage",title:"Florida Minimum Wage Amendment",jurisdiction:"Florida",type:"Constitutional",citation:"Fla. Const. Art. X, § 24",effective:"2020-09-30",summary:"Progressive increases: $13/hr (2024), $14/hr (2025), $15/hr (2026). Annual CPI adjustments after 2026. Tipped employees: $1.00 less/hr.",parties:"All Florida employers and employees",source:"https://www.floridajobs.org/minimumwage",status:"Active",topic:"Labor & Employment"},
  {id:"atl-nightlife",title:"Atlanta Nightlife Establishment Ordinance",jurisdiction:"Atlanta, GA",type:"Ordinance",citation:"Atlanta City Code §§ 10-1, 30-1",effective:"2019-03-01",summary:"Operating hours max 2:30 AM (3:00 AM weekends w/ special permit). Noise: 60 dB residential, 75 dB commercial 10PM-7AM. Special event permits for outdoor sound.",parties:"Nightclubs, bars, event promoters in Atlanta",source:"https://library.municode.com/ga/atlanta/codes/code_of_ordinances",status:"Active",topic:"Business Licensing"},
  {id:"atl-str",title:"Atlanta Short-Term Rental Ordinance",jurisdiction:"Atlanta, GA",type:"Ordinance",citation:"Atlanta Code § 20-1300",effective:"2021-07-01",summary:"STR operators must register, obtain license, collect 8% hotel/motel tax. Owner-occupied or responsible party within 50 miles. Max 2 persons/bedroom. Fines $500/day.",parties:"Airbnb/VRBO hosts, property managers in Atlanta",source:"https://library.municode.com/ga/atlanta/codes/code_of_ordinances",status:"Active",topic:"Real Estate & Housing"},
];

const topics=["All","Labor & Employment","Food & Beverage","Health & Safety","Business Licensing","Privacy & Data","Real Estate & Housing"];
const jurisdictions=["All","Federal","Georgia","Texas","California","New York","Florida","Atlanta, GA"];

function Badge({text,color,bg}:{text:string,color:string,bg:string}){return<span style={{padding:"3px 10px",borderRadius:99,background:bg,color,fontSize:10,fontWeight:600,whiteSpace:"nowrap"}}>{text}</span>}

export default function RuleRadar(){
  const[topic,setTopic]=useState("All");
  const[juris,setJuris]=useState("All");
  const[search,setSearch]=useState("");
  const[selected,setSelected]=useState<typeof laws[0]|null>(null);

  const filtered=laws.filter(l=>{
    if(topic!=="All"&&l.topic!==topic)return false;
    if(juris!=="All"&&l.jurisdiction!==juris)return false;
    if(search&&!l.title.toLowerCase().includes(search.toLowerCase())&&!l.summary.toLowerCase().includes(search.toLowerCase()))return false;
    return true;
  });

  if(selected){
    const l=selected;
    return(
      <div style={{background:P.bg,minHeight:"100vh",fontFamily:"'DM Sans',sans-serif",color:P.text}}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Cormorant+Garamond:wght@400;500;600;700&display=swap" rel="stylesheet"/>
        <div style={{maxWidth:720,margin:"0 auto",padding:20}}>
          <button onClick={()=>setSelected(null)} style={{display:"flex",alignItems:"center",gap:8,background:"none",border:"none",cursor:"pointer",color:P.copper,fontWeight:600,fontSize:13,marginBottom:20}}>← Back to results</button>
          <div style={{background:"#fff",borderRadius:16,padding:28,boxShadow:P.shadowLg}}>
            <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
              <Badge text={l.jurisdiction} color={P.navy} bg={P.navyLight}/>
              <Badge text={l.type} color={P.copper} bg={P.copperLight}/>
              <Badge text={l.topic} color="#6B21A8" bg="#FAF5FF"/>
              <Badge text="Active" color={P.green} bg={P.greenLight}/>
            </div>
            <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:700,color:P.navy,marginBottom:8,lineHeight:1.3}}>{l.title}</h1>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:13,color:P.copper,fontWeight:600,marginBottom:20,letterSpacing:"0.02em"}}>{l.citation}</div>
            
            <div style={{background:P.bg,borderRadius:12,padding:20,marginBottom:20}}>
              <h3 style={{fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:P.textLight,marginBottom:8}}>Summary</h3>
              <p style={{fontSize:14,lineHeight:1.8,color:P.text}}>{l.summary}</p>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
              <div style={{background:P.bg,borderRadius:12,padding:16}}>
                <div style={{fontSize:11,fontWeight:600,color:P.textLight,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>Effective Date</div>
                <div style={{fontSize:14,fontWeight:600,color:P.text}}>{new Date(l.effective).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}</div>
              </div>
              <div style={{background:P.bg,borderRadius:12,padding:16}}>
                <div style={{fontSize:11,fontWeight:600,color:P.textLight,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>Jurisdiction</div>
                <div style={{fontSize:14,fontWeight:600,color:P.text}}>{l.jurisdiction}</div>
              </div>
            </div>

            <div style={{background:P.navyLight,borderRadius:12,padding:16,marginBottom:20,border:"1px solid rgba(30,58,95,0.1)"}}>
              <div style={{fontSize:11,fontWeight:600,color:P.navy,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>Affected Parties</div>
              <p style={{fontSize:13,color:P.navy,lineHeight:1.6}}>{l.parties}</p>
            </div>

            <a href={l.source} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:8,padding:"14px 20px",borderRadius:12,background:P.copper,color:"#fff",textDecoration:"none",fontWeight:700,fontSize:13,justifyContent:"center"}}>
              View Official Source ↗
            </a>
            <p style={{textAlign:"center",fontSize:10,color:P.textLight,marginTop:8}}>Links to official government code repositories and agency publications</p>
          </div>
        </div>
      </div>
    );
  }

  return(
    <div style={{background:P.bg,minHeight:"100vh",fontFamily:"'DM Sans',sans-serif",color:P.text}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Mono:wght@300;400&display=swap" rel="stylesheet"/>
      <div style={{maxWidth:900,margin:"0 auto",padding:"20px 20px 60px"}}>
        {/* HEADER */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:32}}>
          <div>
            <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:32,fontWeight:700,color:P.navy}}>Rule Radar</h1>
            <p style={{fontSize:12,color:P.textLight}}>Legal intelligence across {jurisdictions.length-1} jurisdictions · {laws.length} verified records</p>
          </div>
          <Badge text="KHG Legal Intelligence" color={P.copper} bg={P.copperLight}/>
        </div>

        {/* SEARCH */}
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search laws, regulations, citations..." style={{width:"100%",padding:"16px 20px",borderRadius:14,border:"1px solid #E7E5E4",fontSize:14,background:"#fff",boxShadow:P.shadow,outline:"none",marginBottom:20,boxSizing:"border-box"}}/>

        {/* FILTERS */}
        <div style={{marginBottom:8}}>
          <div style={{fontSize:11,fontWeight:600,color:P.textLight,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Topic</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
            {topics.map(t=><button key={t} onClick={()=>setTopic(t)} style={{padding:"7px 16px",borderRadius:99,border:topic===t?`2px solid ${P.copper}`:"2px solid #E7E5E4",background:topic===t?P.copperLight:"#fff",color:topic===t?P.copper:P.textMid,fontSize:12,fontWeight:topic===t?700:400,cursor:"pointer",transition:"all 0.2s"}}>{t}</button>)}
          </div>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:11,fontWeight:600,color:P.textLight,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Jurisdiction</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {jurisdictions.map(j=><button key={j} onClick={()=>setJuris(j)} style={{padding:"7px 16px",borderRadius:99,border:juris===j?`2px solid ${P.navy}`:"2px solid #E7E5E4",background:juris===j?P.navyLight:"#fff",color:juris===j?P.navy:P.textMid,fontSize:12,fontWeight:juris===j?700:400,cursor:"pointer",transition:"all 0.2s"}}>{j}</button>)}
          </div>
        </div>

        <div style={{fontSize:12,color:P.textLight,marginBottom:16}}>{filtered.length} result{filtered.length!==1?"s":""}</div>

        {/* RESULTS */}
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {filtered.map(l=>(
            <button key={l.id} onClick={()=>setSelected(l)} style={{background:"#fff",borderRadius:14,padding:"18px 20px",border:"none",boxShadow:P.shadow,cursor:"pointer",textAlign:"left",width:"100%",transition:"box-shadow 0.2s"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:700,fontSize:17,color:P.navy,lineHeight:1.3,marginBottom:4}}>{l.title}</div>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:P.copper,fontWeight:500}}>{l.citation}</div>
                </div>
                <div style={{display:"flex",gap:4,flexShrink:0,marginLeft:12}}>
                  <Badge text={l.jurisdiction} color={P.navy} bg={P.navyLight}/>
                  <Badge text={l.type} color={P.copper} bg={P.copperLight}/>
                </div>
              </div>
              <p style={{fontSize:12,color:P.textMid,lineHeight:1.6,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical" as any,overflow:"hidden"}}>{l.summary}</p>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:10}}>
                <span style={{fontSize:10,color:P.textLight}}>Effective: {l.effective}</span>
                <span style={{fontSize:11,color:P.copper,fontWeight:600}}>View details →</span>
              </div>
            </button>
          ))}
        </div>

        {filtered.length===0&&<div style={{textAlign:"center",padding:40}}><div style={{fontSize:40,marginBottom:12}}>⚖️</div><h3 style={{fontWeight:700}}>No laws match your filters</h3><p style={{color:P.textMid,fontSize:13}}>Try adjusting topic or jurisdiction</p></div>}

        {/* FOOTER */}
        <div style={{marginTop:40,padding:20,background:"#fff",borderRadius:16,boxShadow:P.shadow,textAlign:"center"}}>
          <p style={{fontSize:11,color:P.textLight,lineHeight:1.6}}>Rule Radar provides legal information for educational purposes only. This is not legal advice. Always consult a licensed attorney for specific legal matters. Data sourced from official government code repositories (U.S. Code, state legislature sites, Municode).</p>
          <p style={{fontSize:10,color:P.textLight,marginTop:8}}>A KHG Property · The Kollective Hospitality Group</p>
        </div>
      </div>
    </div>
  );
}
