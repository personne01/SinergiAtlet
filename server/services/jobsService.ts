import pool from '../config/database';
import type { Job } from '../types';

export async function getAllJobs() {
  const { rows } = await pool.query<Job>(`
    SELECT j.*, row_to_json(o.*) as organization
    FROM jobs j
    JOIN organizations o ON o.id = j.org_id
    WHERE j.status = 'open'
    ORDER BY j.created_at DESC
  `);
  return rows;
}

export async function getJobById(id: string) {
  const { rows } = await pool.query<Job>(`
    SELECT j.*, row_to_json(o.*) as organization
    FROM jobs j
    JOIN organizations o ON o.id = j.org_id
    WHERE j.id = $1
  `, [id]);
  return rows[0] || null;
}
