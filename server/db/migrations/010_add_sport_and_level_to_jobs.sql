ALTER TABLE jobs ADD COLUMN sport_id VARCHAR(50);
ALTER TABLE jobs ADD COLUMN level_id VARCHAR(50);
ALTER TABLE jobs ADD COLUMN is_kys_required BOOLEAN DEFAULT FALSE;
ALTER TABLE jobs ADD COLUMN featured BOOLEAN DEFAULT FALSE;
ALTER TABLE jobs ADD COLUMN criteria VARCHAR(255);
ALTER TABLE jobs ADD COLUMN criteria_type VARCHAR(50) DEFAULT 'kys_speed';
ALTER TABLE jobs ADD COLUMN criteria_value INT;
ALTER TABLE jobs ADD COLUMN skill_requirements JSONB DEFAULT '[]'::jsonb;

-- Update existing jobs in PostgreSQL to have standard parameters from mock
UPDATE jobs 
SET 
  sport_id = 'sepak_bola', 
  level_id = 'sb_u19', 
  is_kys_required = TRUE,
  featured = TRUE,
  criteria = 'KYS Agility > 85',
  criteria_type = 'kys_agility',
  criteria_value = 85,
  skill_requirements = '[
    {"dimensionId": "sb_agility", "dimensionName": "Kelincahan", "minScore": 85, "checklist": [
      {"itemId": "sb_agility_ttest", "label": "T-Test", "minValue": 10.0, "weight": 1.0},
      {"itemId": "sb_agility_zigzag", "label": "Zig-Zag Run", "minValue": 14.0, "weight": 0.8}
    ]},
    {"dimensionId": "sb_technique", "dimensionName": "Teknik", "minScore": 75, "checklist": [
      {"itemId": "sb_tech_passing", "label": "Passing Accuracy", "minValue": 70, "weight": 0.7}
    ]}
  ]'::jsonb
WHERE id = 'c0000000-0000-0000-0000-000000000001';

UPDATE jobs 
SET 
  sport_id = 'sepak_bola', 
  level_id = 'sb_u17', 
  is_kys_required = TRUE,
  featured = FALSE,
  criteria = 'KYS Stamina > 90',
  criteria_type = 'kys_stamina',
  criteria_value = 90,
  skill_requirements = '[
    {"dimensionId": "sb_stamina", "dimensionName": "Daya Tahan", "minScore": 90, "checklist": [
      {"itemId": "sb_stamina_yoyo", "label": "Yo-Yo Test IR1", "minValue": 16, "weight": 1.0},
      {"itemId": "sb_stamina_vo2max", "label": "Estimasi VO2Max", "minValue": 50, "weight": 0.6}
    ]},
    {"dimensionId": "sb_speed", "dimensionName": "Kecepatan", "minScore": 75, "checklist": [
      {"itemId": "sb_speed_sprint40", "label": "Sprint 40 meter", "minValue": 5.5, "weight": 0.8}
    ]}
  ]'::jsonb
WHERE id = 'c0000000-0000-0000-0000-000000000002';

UPDATE jobs 
SET 
  sport_id = 'bulutangkis', 
  level_id = 'bt_u17', 
  is_kys_required = TRUE,
  featured = TRUE,
  criteria = 'KYS Speed > 80',
  criteria_type = 'kys_speed',
  criteria_value = 80,
  skill_requirements = '[
    {"dimensionId": "bt_speed", "dimensionName": "Kecepatan", "minScore": 80, "checklist": [
      {"itemId": "bt_speed_6point", "label": "6-Point Footwork", "minValue": 19.0, "weight": 1.0},
      {"itemId": "bt_speed_reaction", "label": "Reaction Time", "minValue": 250, "weight": 0.7}
    ]},
    {"dimensionId": "bt_technique", "dimensionName": "Teknik", "minScore": 72, "checklist": [
      {"itemId": "bt_tech_clear", "label": "Clear Accuracy", "minValue": 70, "weight": 0.8}
    ]}
  ]'::jsonb
WHERE id = 'c0000000-0000-0000-0000-000000000003';
