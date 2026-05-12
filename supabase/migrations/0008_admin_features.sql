-- Admin features: page visibility, pipeline editor, admin management, 2FA
-- Migration 0008

-- ============================================================================
-- Page visibility settings
-- Uses existing cms_settings table with structured JSON
-- ============================================================================

INSERT INTO cms_settings (key, value)
VALUES (
  'page_visibility',
  '{
    "lookbook": { "navbar": true, "homepage": true },
    "journal": { "navbar": true, "homepage": true }
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- Pipeline questions table for editable questionnaire
-- ============================================================================

CREATE TABLE IF NOT EXISTS cms_pipelines (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  pipeline_type pipeline_type NOT NULL UNIQUE,
  version int NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT false,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES admins(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS cms_pipelines_type_idx ON cms_pipelines(pipeline_type);

-- Add update trigger for updated_at
DROP TRIGGER IF EXISTS trg_cms_pipelines_updated_at ON cms_pipelines;
CREATE TRIGGER trg_cms_pipelines_updated_at
BEFORE UPDATE ON cms_pipelines
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS policies for cms_pipelines
ALTER TABLE cms_pipelines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS service_role_all_cms_pipelines ON cms_pipelines;
CREATE POLICY service_role_all_cms_pipelines ON cms_pipelines FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS admins_full_cms_pipelines ON cms_pipelines;
CREATE POLICY admins_full_cms_pipelines ON cms_pipelines FOR ALL
  USING (EXISTS (SELECT 1 FROM admins a WHERE a.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins a WHERE a.id = auth.uid()));

-- Seed default pipeline configurations (empty questions - to be edited in admin)
INSERT INTO cms_pipelines (pipeline_type, version, is_active, questions)
VALUES
  ('design_idea', 1, false, '[]'::jsonb),
  ('design_scratch', 1, false, '[]'::jsonb),
  ('manufacture_existing', 1, false, '[]'::jsonb)
ON CONFLICT (pipeline_type) DO NOTHING;

-- ============================================================================
-- Admin enhancements: super admin, 2FA, temp password
-- ============================================================================

-- Add super admin flag
ALTER TABLE admins ADD COLUMN IF NOT EXISTS is_super_admin boolean NOT NULL DEFAULT false;

-- Add 2FA fields
ALTER TABLE admins ADD COLUMN IF NOT EXISTS totp_secret text;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS totp_enabled boolean NOT NULL DEFAULT false;

-- Add temp password flag for first-login flow
ALTER TABLE admins ADD COLUMN IF NOT EXISTS temp_password boolean NOT NULL DEFAULT false;

-- Track who created the admin account
ALTER TABLE admins ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES admins(id) ON DELETE SET NULL;

-- Add display name for admin accounts
ALTER TABLE admins ADD COLUMN IF NOT EXISTS display_name text;

-- Create index on super admin for quick lookups
CREATE INDEX IF NOT EXISTS admins_super_admin_idx ON admins(is_super_admin) WHERE is_super_admin = true;

-- ============================================================================
-- Admin dashboard widget preferences
-- ============================================================================

INSERT INTO cms_settings (key, value)
VALUES (
  'dashboard_widgets',
  '{
    "available": [
      { "id": "quick_stats", "label": "Quick Stats", "default": true },
      { "id": "funnel_mini", "label": "Intake Funnel", "default": true },
      { "id": "recent_projects", "label": "Recent Projects", "default": true },
      { "id": "pipeline_distribution", "label": "Pipeline Distribution", "default": false }
    ]
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- Admin preferences table for per-user settings (theme, widget layout, etc.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_preferences (
  admin_id uuid PRIMARY KEY REFERENCES admins(id) ON DELETE CASCADE,
  theme text NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  dashboard_layout jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_admin_preferences_updated_at ON admin_preferences;
CREATE TRIGGER trg_admin_preferences_updated_at
BEFORE UPDATE ON admin_preferences
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE admin_preferences ENABLE ROW LEVEL SECURITY;

-- Admins can only read/write their own preferences
DROP POLICY IF EXISTS admins_own_preferences ON admin_preferences;
CREATE POLICY admins_own_preferences ON admin_preferences FOR ALL
  USING (admin_id = auth.uid())
  WITH CHECK (admin_id = auth.uid());

DROP POLICY IF EXISTS service_role_all_admin_preferences ON admin_preferences;
CREATE POLICY service_role_all_admin_preferences ON admin_preferences FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
