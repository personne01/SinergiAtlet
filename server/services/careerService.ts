import pool from '../config/database';
import type { CareerProgress } from '../types';

export async function getCareerProgress(athleteId: string) {
  const { rows } = await pool.query<CareerProgress>(
    'SELECT * FROM career_progress WHERE athlete_id = $1 ORDER BY updated_at DESC LIMIT 1',
    [athleteId],
  );
  return rows[0] || { current_level: 1, total_exp: 0, milestones_reached: [] };
}
