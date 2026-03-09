-- ============================================================
-- RULE RADAR — SEED DATA
-- Real jurisdictions, topics, and sample law records
-- ============================================================

-- FEDERAL
INSERT INTO public.jurisdictions (id, jurisdiction_type, name, slug, state_code) VALUES
  ('00000000-0000-0000-0000-000000000001', 'federal', 'United States Federal', 'us-federal', NULL);

-- STATES (top 10 by population + GA)
INSERT INTO public.jurisdictions (id, jurisdiction_type, name, slug, state_code, parent_jurisdiction_id) VALUES
  ('10000000-0000-0000-0000-000000000001', 'state', 'Georgia', 'georgia', 'GA', '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000002', 'state', 'California', 'california', 'CA', '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000003', 'state', 'Texas', 'texas', 'TX', '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000004', 'state', 'New York', 'new-york', 'NY', '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000005', 'state', 'Florida', 'florida', 'FL', '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000006', 'state', 'Illinois', 'illinois', 'IL', '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000007', 'state', 'Pennsylvania', 'pennsylvania', 'PA', '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000008', 'state', 'Ohio', 'ohio', 'OH', '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000009', 'state', 'Michigan', 'michigan', 'MI', '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000010', 'state', 'North Carolina', 'north-carolina', 'NC', '00000000-0000-0000-0000-000000000001');

-- COUNTIES (GA)
INSERT INTO public.jurisdictions (id, jurisdiction_type, name, slug, state_code, county_name, parent_jurisdiction_id) VALUES
  ('20000000-0000-0000-0000-000000000001', 'county', 'Fulton County', 'fulton-county-ga', 'GA', 'Fulton', '10000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000002', 'county', 'DeKalb County', 'dekalb-county-ga', 'GA', 'DeKalb', '10000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000003', 'county', 'Cobb County', 'cobb-county-ga', 'GA', 'Cobb', '10000000-0000-0000-0000-000000000001');

-- CITIES (GA)
INSERT INTO public.jurisdictions (id, jurisdiction_type, name, slug, state_code, city_name, parent_jurisdiction_id) VALUES
  ('30000000-0000-0000-0000-000000000001', 'city', 'Atlanta', 'atlanta-ga', 'GA', 'Atlanta', '20000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0000-000000000002', 'city', 'Decatur', 'decatur-ga', 'GA', 'Decatur', '20000000-0000-0000-0000-000000000002'),
  ('30000000-0000-0000-0000-000000000003', 'city', 'Marietta', 'marietta-ga', 'GA', 'Marietta', '20000000-0000-0000-0000-000000000003');

-- AGENCIES
INSERT INTO public.agencies (id, jurisdiction_id, agency_name, agency_type) VALUES
  ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Department of Labor', 'federal_agency'),
  ('a0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Environmental Protection Agency', 'federal_agency'),
  ('a0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Federal Trade Commission', 'federal_agency'),
  ('a0000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'Georgia Department of Revenue', 'state_agency'),
  ('a0000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 'Georgia Department of Community Health', 'state_agency'),
  ('a0000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000001', 'Atlanta Department of City Planning', 'city_department');

-- TOPICS
INSERT INTO public.topics (id, topic_name, slug, short_summary, icon) VALUES
  ('t0000000-0000-0000-0000-000000000001', 'Labor & Employment', 'labor-employment', 'Wage laws, worker protections, hiring rules, workplace safety, and employer obligations.', 'briefcase'),
  ('t0000000-0000-0000-0000-000000000002', 'Zoning & Land Use', 'zoning-land-use', 'Property zoning designations, land use permits, development restrictions, and variances.', 'map-pin'),
  ('t0000000-0000-0000-0000-000000000003', 'Taxes & Revenue', 'taxes-revenue', 'Income tax, sales tax, property tax, business tax obligations, and revenue collection.', 'receipt'),
  ('t0000000-0000-0000-0000-000000000004', 'Business Licensing', 'business-licensing', 'Business formation, licensing requirements, permits, and operational compliance.', 'file-badge'),
  ('t0000000-0000-0000-0000-000000000005', 'Health & Safety', 'health-safety', 'Public health regulations, workplace safety, food safety, and environmental health.', 'shield'),
  ('t0000000-0000-0000-0000-000000000006', 'Food & Beverage Service', 'food-beverage-service', 'Restaurant permits, alcohol licensing, food handling, and hospitality regulations.', 'utensils'),
  ('t0000000-0000-0000-0000-000000000007', 'Real Estate & Housing', 'real-estate-housing', 'Property transactions, landlord-tenant law, fair housing, and development rules.', 'home'),
  ('t0000000-0000-0000-0000-000000000008', 'Privacy & Data', 'privacy-data', 'Consumer data protection, privacy policies, breach notification, and digital rights.', 'lock'),
  ('t0000000-0000-0000-0000-000000000009', 'Construction & Building', 'construction-building', 'Building codes, construction permits, contractor licensing, and inspection requirements.', 'hard-hat'),
  ('t0000000-0000-0000-0000-000000000010', 'Nonprofit & Compliance', 'nonprofit-compliance', 'Tax-exempt status, nonprofit governance, filing requirements, and fundraising rules.', 'heart'),
  ('t0000000-0000-0000-0000-000000000011', 'Cannabis & Alcohol', 'cannabis-alcohol', 'Cannabis legalization, alcohol licensing, distribution rules, and consumption regulations.', 'wine'),
  ('t0000000-0000-0000-0000-000000000012', 'Consumer Protection', 'consumer-protection', 'Fraud prevention, product safety, warranty rights, and deceptive practices.', 'shield-check'),
  ('t0000000-0000-0000-0000-000000000013', 'Transportation', 'transportation', 'Vehicle regulations, public transit, commercial driving, and ride-share rules.', 'car'),
  ('t0000000-0000-0000-0000-000000000014', 'Environmental', 'environmental', 'Emissions standards, waste disposal, water quality, and environmental impact.', 'leaf');

-- SAMPLE LAW RECORDS
INSERT INTO public.law_records (id, law_title, slug, jurisdiction_id, agency_id, law_type, short_summary, long_summary, affected_parties_text, effective_date, status) VALUES
  ('l0000000-0000-0000-0000-000000000001', 'Fair Labor Standards Act', 'fair-labor-standards-act', '00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'statute', 'Federal minimum wage, overtime pay, recordkeeping, and youth employment standards affecting employees in the private sector and in Federal, State, and local governments.', 'The Fair Labor Standards Act (FLSA) establishes minimum wage, overtime pay, recordkeeping, and youth employment standards affecting employees in the private sector and in Federal, State, and local governments. Covered nonexempt workers are entitled to a minimum wage of not less than $7.25 per hour effective July 24, 2009. Overtime pay at a rate not less than one and one-half times the regular rate of pay is required after 40 hours of work in a workweek.', 'Private sector employees, federal/state/local government workers, employers with annual sales of $500,000+', '2009-07-24', 'published'),
  ('l0000000-0000-0000-0000-000000000002', 'Georgia Minimum Wage Law', 'georgia-minimum-wage-law', '10000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'statute', 'Georgia state minimum wage rate and employer obligations for covered employees not subject to FLSA.', 'Georgia minimum wage is $5.15 per hour. However, most Georgia employers are subject to the federal Fair Labor Standards Act, which requires a higher minimum wage of $7.25. When both apply, the higher wage prevails. The state law applies primarily to employers not covered by the FLSA.', 'Georgia employers not covered by FLSA, employees of small businesses', '2001-01-01', 'published'),
  ('l0000000-0000-0000-0000-000000000003', 'Atlanta Short-Term Rental Ordinance', 'atlanta-short-term-rental-ordinance', '30000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000006', 'ordinance', 'Regulates short-term vacation rentals within City of Atlanta limits, requiring registration and compliance with zoning rules.', 'The City of Atlanta requires all short-term rental properties (less than 30 consecutive days) to obtain a Short-Term Rental License. Properties must comply with zoning requirements, maintain liability insurance, and meet safety standards including smoke detectors and fire extinguishers. Violations may result in fines and license revocation.', 'Property owners, Airbnb hosts, vacation rental operators in Atlanta', '2021-01-01', 'published'),
  ('l0000000-0000-0000-0000-000000000004', 'California Consumer Privacy Act (CCPA)', 'california-consumer-privacy-act', '10000000-0000-0000-0000-000000000002', NULL, 'statute', 'Gives California consumers rights over personal information collected by businesses, including the right to know, delete, and opt-out.', 'The CCPA grants California residents the right to know what personal information businesses collect, the right to delete that information, the right to opt-out of the sale of their personal information, and the right to non-discrimination for exercising CCPA rights. Applies to for-profit businesses that meet certain thresholds.', 'California residents, businesses with annual revenue over $25M or handling data of 100K+ consumers', '2020-01-01', 'published'),
  ('l0000000-0000-0000-0000-000000000005', 'Georgia Alcohol & Beverage Code - Local Option', 'georgia-alcohol-local-option', '10000000-0000-0000-0000-000000000001', NULL, 'statute', 'Allows counties and municipalities to hold referendums on the sale of alcoholic beverages within their jurisdictions.', 'Georgia operates under a local option system where individual counties and municipalities can hold referendums to allow or prohibit the sale of alcoholic beverages. This includes separate votes for beer, wine, and distilled spirits, as well as Sunday sales. Local jurisdictions set their own hours of sale and licensing requirements within the framework of state law.', 'Restaurant and bar owners, alcohol retailers, county and city governments in Georgia', '1938-01-01', 'published');

-- CITATIONS
INSERT INTO public.citations (id, law_record_id, citation_text, citation_type, official_reference_url) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'l0000000-0000-0000-0000-000000000001', '29 U.S.C. §§ 201-219', 'federal_statute', 'https://www.law.cornell.edu/uscode/text/29/chapter-8'),
  ('c0000000-0000-0000-0000-000000000002', 'l0000000-0000-0000-0000-000000000002', 'O.C.G.A. § 34-4-3', 'state_statute', 'https://law.justia.com/codes/georgia/title-34/chapter-4/'),
  ('c0000000-0000-0000-0000-000000000003', 'l0000000-0000-0000-0000-000000000003', 'Atlanta City Code § 20-1001 et seq.', 'municipal_code', NULL),
  ('c0000000-0000-0000-0000-000000000004', 'l0000000-0000-0000-0000-000000000004', 'Cal. Civ. Code §§ 1798.100-1798.199', 'state_statute', 'https://leginfo.legislature.ca.gov/faces/codes_displayText.xhtml?division=3.&part=4.&lawCode=CIV&title=1.81.5'),
  ('c0000000-0000-0000-0000-000000000005', 'l0000000-0000-0000-0000-000000000005', 'O.C.G.A. § 3-1-1 et seq.', 'state_statute', 'https://law.justia.com/codes/georgia/title-3/');

-- LAW-TOPIC LINKS
INSERT INTO public.law_topics (law_record_id, topic_id) VALUES
  ('l0000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000001'),
  ('l0000000-0000-0000-0000-000000000002', 't0000000-0000-0000-0000-000000000001'),
  ('l0000000-0000-0000-0000-000000000003', 't0000000-0000-0000-0000-000000000002'),
  ('l0000000-0000-0000-0000-000000000003', 't0000000-0000-0000-0000-000000000007'),
  ('l0000000-0000-0000-0000-000000000004', 't0000000-0000-0000-0000-000000000008'),
  ('l0000000-0000-0000-0000-000000000004', 't0000000-0000-0000-0000-000000000012'),
  ('l0000000-0000-0000-0000-000000000005', 't0000000-0000-0000-0000-000000000006'),
  ('l0000000-0000-0000-0000-000000000005', 't0000000-0000-0000-0000-000000000011');

-- SAMPLE LEGAL UPDATES
INSERT INTO public.legal_updates (id, update_type, title, slug, short_summary, body, linked_law_record_id, linked_jurisdiction_id, update_status, published_at) VALUES
  ('u0000000-0000-0000-0000-000000000001', 'amendment', 'Federal Minimum Wage Increase Proposal 2026', 'federal-minimum-wage-increase-2026', 'Proposed increase to federal minimum wage from $7.25 to $15.00 per hour under new legislation.', 'A new bill has been introduced to raise the federal minimum wage to $15.00 per hour over a three-year phase-in period. The current rate of $7.25 has been in effect since 2009.', 'l0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'published', now() - interval '2 days'),
  ('u0000000-0000-0000-0000-000000000002', 'new_law', 'Atlanta Expands Short-Term Rental Enforcement', 'atlanta-str-enforcement-2026', 'City of Atlanta adds penalty tiers and mandatory inspections for short-term rental violations.', 'The Atlanta City Council approved amendments to the Short-Term Rental Ordinance adding graduated penalty tiers, mandatory annual safety inspections, and a public complaint portal.', 'l0000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'published', now() - interval '5 days'),
  ('u0000000-0000-0000-0000-000000000003', 'editorial_summary', 'CCPA Enforcement Actions Surge in Q1 2026', 'ccpa-enforcement-q1-2026', 'California Attorney General ramps up CCPA enforcement with record number of actions in first quarter.', 'The California AG office has issued enforcement actions against 47 companies in Q1 2026, a significant increase from previous quarters, signaling a more aggressive stance on consumer data protection.', 'l0000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'published', now() - interval '1 day');
