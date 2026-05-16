CREATE TABLE sport_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sport_id VARCHAR(50) NOT NULL,
  level_id VARCHAR(50) NOT NULL,
  composite_score DECIMAL(5,2) DEFAULT 0,
  dimension_scores JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(20) NOT NULL DEFAULT 'not_started',
  completed_at TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sport_assessments_athlete ON sport_assessments(athlete_id);
CREATE INDEX idx_sport_assessments_sport ON sport_assessments(sport_id);
CREATE UNIQUE INDEX idx_sport_assessments_unique ON sport_assessments(athlete_id, sport_id, level_id);
