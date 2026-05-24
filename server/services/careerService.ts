/* eslint-disable @typescript-eslint/no-explicit-any */
import pool from '../config/database';
import type { CareerProgress } from '../types';

const MOCK_CAREERS: any[] = [
  { athlete_id: 'b0000000-0000-0000-0000-000000000007', current_level: 2, total_exp: 1450, milestones_reached: ['d0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002'], updated_at: new Date().toISOString() },
  { athlete_id: 'b0000000-0000-0000-0000-000000000008', current_level: 3, total_exp: 3200, milestones_reached: ['d0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000003'], updated_at: new Date().toISOString() },
];

export async function getCareerProgress(athleteId: string): Promise<CareerProgress> {
  try {
    const res = await pool.query(
      'SELECT id, athlete_id, current_level, total_exp, milestones_reached, updated_at FROM career_progress WHERE athlete_id = $1 ORDER BY updated_at DESC LIMIT 1',
      [athleteId]
    );

    if (res.rows.length === 0) {
      return { current_level: 1, total_exp: 0, milestones_reached: [] };
    }

    const row = res.rows[0];
    return {
      athlete_id: row.athlete_id,
      current_level: row.current_level,
      total_exp: Number(row.total_exp),
      milestones_reached: row.milestones_reached || [],
    };
  } catch (err: any) {
    console.warn('[careerService] PostgreSQL query failed, loading mock career progress:', err.message);

    const mock = MOCK_CAREERS.find(c => c.athlete_id === athleteId);
    if (!mock) {
      return { current_level: 1, total_exp: 0, milestones_reached: [] };
    }

    return {
      athlete_id: mock.athlete_id,
      current_level: mock.current_level,
      total_exp: mock.total_exp,
      milestones_reached: mock.milestones_reached,
    };
  }
}
