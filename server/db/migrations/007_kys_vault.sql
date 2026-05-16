CREATE TABLE kys_vault (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  verified_score DECIMAL(5,2) NOT NULL,
  score_type VARCHAR(50) NOT NULL,
  audit_hash VARCHAR(64) NOT NULL,
  session_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kys_vault_athlete ON kys_vault(athlete_id);
CREATE INDEX idx_kys_vault_type ON kys_vault(score_type);
