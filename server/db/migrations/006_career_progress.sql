CREATE TABLE career_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  current_level INTEGER NOT NULL DEFAULT 1,
  total_exp BIGINT NOT NULL DEFAULT 0,
  milestones_reached UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_career_progress_athlete ON career_progress(athlete_id);
