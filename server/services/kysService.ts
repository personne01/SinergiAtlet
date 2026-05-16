import pool from '../config/database';
import type { KYSRecord } from '../types';

const SPORTS_DATA = [
  { id: 'sepak_bola', name: 'Sepak Bola' },
  { id: 'bulutangkis', name: 'Bulutangkis' },
  { id: 'taekwondo', name: 'Taekwondo' },
];

export function getSports() {
  return SPORTS_DATA;
}

export async function getAssessments(athleteId: string, sportId?: string) {
  let query = 'SELECT * FROM sport_assessments WHERE athlete_id = $1';
  const params: unknown[] = [athleteId];

  if (sportId) {
    query += ' AND sport_id = $2';
    params.push(sportId);
  }

  query += ' ORDER BY created_at DESC';
  const { rows } = await pool.query(query, params);
  return rows;
}

export async function upsertAssessment(
  athleteId: string,
  sportId: string,
  levelId: string,
  compositeScore: number,
  dimensionScores: unknown[],
) {
  const { rows } = await pool.query(
    `INSERT INTO sport_assessments (athlete_id, sport_id, level_id, composite_score, dimension_scores, status, completed_at, valid_until)
     VALUES ($1, $2, $3, $4, $5::jsonb, 'completed', NOW(), NOW() + INTERVAL '6 months')
     ON CONFLICT (athlete_id, sport_id, level_id)
     DO UPDATE SET composite_score = $4, dimension_scores = $5::jsonb, status = 'completed', completed_at = NOW(), valid_until = NOW() + INTERVAL '6 months'
     RETURNING *`,
    [athleteId, sportId, levelId, compositeScore, JSON.stringify(dimensionScores)],
  );
  return rows[0];
}

export async function getKYSRecords(athleteId: string) {
  const { rows } = await pool.query<KYSRecord>(
    'SELECT * FROM kys_vault WHERE athlete_id = $1 ORDER BY created_at DESC',
    [athleteId],
  );
  return rows;
}

export async function getKYSScores(athleteId: string) {
  const { rows } = await pool.query<{ score_type: string; verified_score: number }>(
    `SELECT DISTINCT ON (score_type) score_type, verified_score
     FROM kys_vault
     WHERE athlete_id = $1
     ORDER BY score_type, created_at DESC`,
    [athleteId],
  );

  const scores: Record<string, number> = {};
  for (const row of rows) {
    scores[row.score_type] = row.verified_score;
  }
  return scores;
}
