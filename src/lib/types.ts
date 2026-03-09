// Rule Radar — Core Data Types

export type JurisdictionType = 'city' | 'county' | 'state' | 'federal'
export type LawType = 'statute' | 'ordinance' | 'regulation' | 'rule' | 'guidance' | 'executive_order' | 'code_section'
export type LawStatus = 'draft' | 'in_review' | 'published' | 'repealed' | 'archived' | 'disputed'
export type UpdateType = 'new_law' | 'amendment' | 'repeal' | 'effective_date_change' | 'editorial_summary'
export type UpdateStatus = 'draft' | 'in_review' | 'published' | 'archived'
export type TrustLabel = 'official' | 'secondary' | 'interpreted' | 'under_review' | 'disputed'

export interface Jurisdiction {
  id: string
  jurisdiction_type: JurisdictionType
  name: string
  slug: string
  state_code: string | null
  county_name: string | null
  city_name: string | null
  parent_jurisdiction_id: string | null
  summary: string | null
  created_at: string
  parent?: Jurisdiction
  children?: Jurisdiction[]
}

export interface Agency {
  id: string
  jurisdiction_id: string
  agency_name: string
  agency_type: string | null
  created_at: string
}

export interface Topic {
  id: string
  parent_topic_id: string | null
  topic_name: string
  slug: string
  short_summary: string | null
  long_summary: string | null
  icon: string | null
  active_flag: boolean
  created_at: string
  updated_at: string
}

export interface LawRecord {
  id: string
  law_title: string
  slug: string
  jurisdiction_id: string
  agency_id: string | null
  law_type: LawType
  short_summary: string | null
  long_summary: string | null
  affected_parties_text: string | null
  effective_date: string | null
  status: LawStatus
  current_version_id: string | null
  created_at: string
  updated_at: string
  // Joined fields
  jurisdiction?: Jurisdiction
  agency?: Agency
  citations?: Citation[]
  topics?: Topic[]
}

export interface Citation {
  id: string
  law_record_id: string
  citation_text: string
  citation_type: string | null
  official_reference_url: string | null
  created_at: string
}

export interface LegalUpdate {
  id: string
  update_type: UpdateType
  title: string
  slug: string
  short_summary: string | null
  body: string | null
  linked_law_record_id: string | null
  linked_citation_id: string | null
  linked_topic_id: string | null
  linked_jurisdiction_id: string | null
  linked_source_id: string | null
  update_status: UpdateStatus
  published_at: string | null
  created_at: string
  updated_at: string
  // Joined
  law_record?: LawRecord
  jurisdiction?: Jurisdiction
  topic?: Topic
}

export interface LegalSource {
  id: string
  source_title: string
  source_url: string | null
  source_type: string
  source_date: string | null
  source_status: string
  trust_label: TrustLabel
  jurisdiction_id: string | null
  summary: string | null
}

export interface LawVersion {
  id: string
  law_record_id: string
  version_number: number
  version_label: string | null
  effective_date: string | null
  status: 'historical' | 'current' | 'pending'
  summary_snapshot: string | null
  detailed_snapshot: string | null
  change_reason: string | null
  published_at: string | null
  created_at: string
}
