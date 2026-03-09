-- ============================================================
-- RULE RADAR — COMPLETE DATABASE SCHEMA
-- 34 tables across 11 domains
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- DOMAIN 1: USERS + ORGANIZATIONS
-- ============================================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_type TEXT NOT NULL CHECK (role_type IN ('public_user','pro_user','researcher','editor','moderator','admin')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role_type)
);

CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_name TEXT NOT NULL,
  organization_type TEXT NOT NULL CHECK (organization_type IN ('law_firm','compliance_team','newsroom','civic_org','internal_platform')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_role TEXT NOT NULL CHECK (member_role IN ('owner','admin','analyst','researcher','editor','viewer')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- ============================================================
-- DOMAIN 2: JURISDICTIONS
-- ============================================================

CREATE TABLE public.jurisdictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jurisdiction_type TEXT NOT NULL CHECK (jurisdiction_type IN ('city','county','state','federal')),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  state_code TEXT,
  county_name TEXT,
  city_name TEXT,
  parent_jurisdiction_id UUID REFERENCES public.jurisdictions(id),
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_jurisdictions_type ON public.jurisdictions(jurisdiction_type);
CREATE INDEX idx_jurisdictions_parent ON public.jurisdictions(parent_jurisdiction_id);
CREATE INDEX idx_jurisdictions_slug ON public.jurisdictions(slug);

CREATE TABLE public.agencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jurisdiction_id UUID NOT NULL REFERENCES public.jurisdictions(id) ON DELETE CASCADE,
  agency_name TEXT NOT NULL,
  agency_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_agencies_jurisdiction ON public.agencies(jurisdiction_id);

-- ============================================================
-- DOMAIN 3: TOPICS
-- ============================================================

CREATE TABLE public.topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_topic_id UUID REFERENCES public.topics(id),
  topic_name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_summary TEXT,
  long_summary TEXT,
  icon TEXT,
  active_flag BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_topics_slug ON public.topics(slug);
CREATE INDEX idx_topics_active ON public.topics(active_flag);

CREATE TABLE public.topic_jurisdiction_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  jurisdiction_id UUID NOT NULL REFERENCES public.jurisdictions(id) ON DELETE CASCADE,
  summary_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(topic_id, jurisdiction_id)
);

CREATE TABLE public.topic_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL
);

-- ============================================================
-- DOMAIN 4: LAW RECORDS
-- ============================================================

CREATE TABLE public.law_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  law_title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  jurisdiction_id UUID NOT NULL REFERENCES public.jurisdictions(id),
  agency_id UUID REFERENCES public.agencies(id),
  law_type TEXT NOT NULL CHECK (law_type IN ('statute','ordinance','regulation','rule','guidance','executive_order','code_section')),
  short_summary TEXT,
  long_summary TEXT,
  affected_parties_text TEXT,
  effective_date DATE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','in_review','published','repealed','archived','disputed')),
  current_version_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_law_records_jurisdiction ON public.law_records(jurisdiction_id);
CREATE INDEX idx_law_records_status ON public.law_records(status);
CREATE INDEX idx_law_records_slug ON public.law_records(slug);
CREATE INDEX idx_law_records_type ON public.law_records(law_type);
CREATE INDEX idx_law_records_effective ON public.law_records(effective_date);

CREATE TABLE public.citations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  law_record_id UUID NOT NULL REFERENCES public.law_records(id) ON DELETE CASCADE,
  citation_text TEXT NOT NULL,
  citation_type TEXT,
  official_reference_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_citations_law ON public.citations(law_record_id);
CREATE INDEX idx_citations_text ON public.citations(citation_text);

CREATE TABLE public.law_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  law_record_id UUID NOT NULL REFERENCES public.law_records(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  UNIQUE(law_record_id, topic_id)
);

CREATE TABLE public.law_related_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  law_record_id UUID NOT NULL REFERENCES public.law_records(id) ON DELETE CASCADE,
  related_law_record_id UUID NOT NULL REFERENCES public.law_records(id) ON DELETE CASCADE,
  relation_type TEXT
);

-- ============================================================
-- DOMAIN 5: LEGAL SOURCES
-- ============================================================

CREATE TABLE public.legal_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_title TEXT NOT NULL,
  source_url TEXT,
  source_file_url TEXT,
  source_type TEXT NOT NULL CHECK (source_type IN ('official_publication','code_repository','agency_notice','legislative_text','court_related_reference','news_report','editorial_analysis','policy_memo')),
  source_date DATE,
  source_status TEXT NOT NULL DEFAULT 'draft' CHECK (source_status IN ('draft','pending_review','approved','rejected','disputed')),
  trust_label TEXT DEFAULT 'under_review' CHECK (trust_label IN ('official','secondary','interpreted','under_review','disputed')),
  jurisdiction_id UUID REFERENCES public.jurisdictions(id),
  agency_id UUID REFERENCES public.agencies(id),
  created_by_user_id UUID REFERENCES auth.users(id),
  reviewed_by_user_id UUID REFERENCES auth.users(id),
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sources_status ON public.legal_sources(source_status);
CREATE INDEX idx_sources_trust ON public.legal_sources(trust_label);

CREATE TABLE public.source_law_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID NOT NULL REFERENCES public.legal_sources(id) ON DELETE CASCADE,
  law_record_id UUID NOT NULL REFERENCES public.law_records(id) ON DELETE CASCADE,
  UNIQUE(source_id, law_record_id)
);

CREATE TABLE public.source_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID NOT NULL REFERENCES public.legal_sources(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  UNIQUE(source_id, topic_id)
);

CREATE TABLE public.source_citations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID NOT NULL REFERENCES public.legal_sources(id) ON DELETE CASCADE,
  citation_id UUID NOT NULL REFERENCES public.citations(id) ON DELETE CASCADE,
  UNIQUE(source_id, citation_id)
);

-- ============================================================
-- DOMAIN 6: VERSIONS + REVISIONS
-- ============================================================

CREATE TABLE public.law_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  law_record_id UUID NOT NULL REFERENCES public.law_records(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  version_label TEXT,
  effective_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('historical','current','pending')),
  full_text_reference_url TEXT,
  summary_snapshot TEXT,
  detailed_snapshot TEXT,
  change_reason TEXT,
  created_by_user_id UUID REFERENCES auth.users(id),
  reviewed_by_user_id UUID REFERENCES auth.users(id),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_versions_law ON public.law_versions(law_record_id);
CREATE INDEX idx_versions_status ON public.law_versions(status);

-- Now add FK from law_records.current_version_id → law_versions.id
ALTER TABLE public.law_records
  ADD CONSTRAINT fk_current_version
  FOREIGN KEY (current_version_id) REFERENCES public.law_versions(id);

CREATE TABLE public.law_version_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  law_version_id UUID NOT NULL REFERENCES public.law_versions(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES public.legal_sources(id) ON DELETE CASCADE,
  UNIQUE(law_version_id, source_id)
);

CREATE TABLE public.version_diffs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  old_version_id UUID NOT NULL REFERENCES public.law_versions(id) ON DELETE CASCADE,
  new_version_id UUID NOT NULL REFERENCES public.law_versions(id) ON DELETE CASCADE,
  diff_summary TEXT,
  diff_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- DOMAIN 7: LEGAL UPDATES
-- ============================================================

CREATE TABLE public.legal_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  update_type TEXT NOT NULL CHECK (update_type IN ('new_law','amendment','repeal','effective_date_change','editorial_summary')),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_summary TEXT,
  body TEXT,
  linked_law_record_id UUID REFERENCES public.law_records(id),
  linked_citation_id UUID REFERENCES public.citations(id),
  linked_topic_id UUID REFERENCES public.topics(id),
  linked_jurisdiction_id UUID REFERENCES public.jurisdictions(id),
  linked_source_id UUID REFERENCES public.legal_sources(id),
  update_status TEXT NOT NULL DEFAULT 'draft' CHECK (update_status IN ('draft','in_review','published','archived')),
  created_by_user_id UUID REFERENCES auth.users(id),
  reviewed_by_user_id UUID REFERENCES auth.users(id),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_updates_status ON public.legal_updates(update_status);
CREATE INDEX idx_updates_type ON public.legal_updates(update_type);
CREATE INDEX idx_updates_published ON public.legal_updates(published_at DESC);

CREATE TABLE public.update_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  update_id UUID NOT NULL REFERENCES public.legal_updates(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES public.legal_sources(id) ON DELETE CASCADE,
  UNIQUE(update_id, source_id)
);

-- ============================================================
-- DOMAIN 8: FOLLOWING + SAVED + SEARCH
-- ============================================================

CREATE TABLE public.user_law_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  law_record_id UUID NOT NULL REFERENCES public.law_records(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, law_record_id)
);

CREATE TABLE public.user_topic_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, topic_id)
);

CREATE TABLE public.user_jurisdiction_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  jurisdiction_id UUID NOT NULL REFERENCES public.jurisdictions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, jurisdiction_id)
);

CREATE TABLE public.saved_compares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  compare_config_json JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.saved_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  search_config_json JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.user_alert_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  delivery_channels_json JSONB DEFAULT '{"email": true, "push": false}',
  frequency_setting TEXT DEFAULT 'daily' CHECK (frequency_setting IN ('realtime','daily','weekly','monthly','off')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- ============================================================
-- DOMAIN 9: PRO / ORGANIZATION WORKSPACE
-- ============================================================

CREATE TABLE public.watchlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id),
  watchlist_name TEXT NOT NULL,
  config_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.watchlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  watchlist_id UUID NOT NULL REFERENCES public.watchlists(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('law_record','topic','jurisdiction','citation','search')),
  item_id UUID,
  config_json JSONB
);

CREATE TABLE public.team_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  linked_item_type TEXT NOT NULL,
  linked_item_id UUID NOT NULL,
  note_text TEXT NOT NULL,
  author_user_id UUID NOT NULL REFERENCES auth.users(id),
  assignee_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id),
  export_type TEXT NOT NULL CHECK (export_type IN ('summary','compare','watchlist_report','update_digest')),
  input_config_json JSONB,
  output_content TEXT,
  created_by_user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- DOMAIN 10: EDITORIAL / REVIEW WORKFLOW
-- ============================================================

CREATE TABLE public.research_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  assigned_to_user_id UUID REFERENCES auth.users(id),
  linked_law_record_id UUID REFERENCES public.law_records(id),
  linked_topic_id UUID REFERENCES public.topics(id),
  linked_jurisdiction_id UUID REFERENCES public.jurisdictions(id),
  priority_level TEXT DEFAULT 'medium' CHECK (priority_level IN ('low','medium','high','urgent')),
  task_status TEXT NOT NULL DEFAULT 'open' CHECK (task_status IN ('open','in_progress','in_review','closed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.review_queue_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_type TEXT NOT NULL CHECK (item_type IN ('source','law_record','law_version','legal_update','topic')),
  item_id UUID NOT NULL,
  queue_status TEXT NOT NULL DEFAULT 'pending' CHECK (queue_status IN ('pending','approved','rejected','changes_requested','escalated')),
  assigned_to_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.editor_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_type TEXT NOT NULL,
  item_id UUID NOT NULL,
  author_user_id UUID NOT NULL REFERENCES auth.users(id),
  note_text TEXT NOT NULL,
  visibility_scope TEXT DEFAULT 'internal' CHECK (visibility_scope IN ('internal','reviewer_only')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- DOMAIN 11: TRUST + MODERATION
-- ============================================================

CREATE TABLE public.content_disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dispute_type TEXT NOT NULL CHECK (dispute_type IN ('summary_accuracy','citation_conflict','jurisdiction_misclassification','source_quality')),
  item_type TEXT NOT NULL,
  item_id UUID NOT NULL,
  reported_by_user_id UUID REFERENCES auth.users(id),
  description TEXT NOT NULL,
  dispute_status TEXT NOT NULL DEFAULT 'open' CHECK (dispute_status IN ('open','under_review','resolved','rejected')),
  resolution_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE public.moderation_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_user_id UUID NOT NULL REFERENCES auth.users(id),
  item_type TEXT NOT NULL,
  item_id UUID NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('approved','rejected','hidden','restored','clarified','escalated')),
  action_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_user_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_actor ON public.audit_logs(actor_user_id);
CREATE INDEX idx_audit_resource ON public.audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_created ON public.audit_logs(created_at DESC);

CREATE TABLE public.system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value_json JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jurisdictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.law_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.law_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_law_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_topic_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_jurisdiction_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_compares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_alert_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_notes ENABLE ROW LEVEL SECURITY;

-- Public read access for published content
CREATE POLICY "Public read jurisdictions" ON public.jurisdictions FOR SELECT USING (true);
CREATE POLICY "Public read agencies" ON public.agencies FOR SELECT USING (true);
CREATE POLICY "Public read topics" ON public.topics FOR SELECT USING (active_flag = true);
CREATE POLICY "Public read published laws" ON public.law_records FOR SELECT USING (status = 'published');
CREATE POLICY "Public read citations" ON public.citations FOR SELECT USING (true);
CREATE POLICY "Public read published updates" ON public.legal_updates FOR SELECT USING (update_status = 'published');
CREATE POLICY "Public read approved sources" ON public.legal_sources FOR SELECT USING (source_status = 'approved');
CREATE POLICY "Public read current versions" ON public.law_versions FOR SELECT USING (status IN ('current','historical'));

-- Authenticated user policies
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users manage own follows (law)" ON public.user_law_follows FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own follows (topic)" ON public.user_topic_follows FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own follows (jurisdiction)" ON public.user_jurisdiction_follows FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own saved compares" ON public.saved_compares FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own saved searches" ON public.saved_searches FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own alert prefs" ON public.user_alert_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own watchlists" ON public.watchlists FOR ALL USING (auth.uid() = owner_user_id);

-- Org member read access
CREATE POLICY "Org members read org" ON public.organizations FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = id AND user_id = auth.uid()));
CREATE POLICY "Org members read membership" ON public.organization_members FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.organization_members om WHERE om.organization_id = organization_id AND om.user_id = auth.uid()));
CREATE POLICY "Org members read notes" ON public.team_notes FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = team_notes.organization_id AND user_id = auth.uid()));

-- ============================================================
-- FULL-TEXT SEARCH
-- ============================================================

ALTER TABLE public.law_records ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(law_title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(short_summary, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(long_summary, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(affected_parties_text, '')), 'D')
  ) STORED;

CREATE INDEX idx_law_records_fts ON public.law_records USING gin(fts);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_organizations_updated BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_topics_updated BEFORE UPDATE ON public.topics FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_law_records_updated BEFORE UPDATE ON public.law_records FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_legal_sources_updated BEFORE UPDATE ON public.legal_sources FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_legal_updates_updated BEFORE UPDATE ON public.legal_updates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_topic_jurisdiction_notes_updated BEFORE UPDATE ON public.topic_jurisdiction_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_saved_compares_updated BEFORE UPDATE ON public.saved_compares FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_saved_searches_updated BEFORE UPDATE ON public.saved_searches FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_alert_prefs_updated BEFORE UPDATE ON public.user_alert_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_watchlists_updated BEFORE UPDATE ON public.watchlists FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_team_notes_updated BEFORE UPDATE ON public.team_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_research_tasks_updated BEFORE UPDATE ON public.research_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_review_queue_updated BEFORE UPDATE ON public.review_queue_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
