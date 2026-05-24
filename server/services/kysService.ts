/* eslint-disable @typescript-eslint/no-explicit-any */
import pool from '../config/database';
import type { KYSRecord } from '../types';

const SPORTS_DATA = [
  { id: 'sepak_bola', name: 'Sepak Bola' },
  { id: 'bulutangkis', name: 'Bulutangkis' },
  { id: 'taekwondo', name: 'Taekwondo' },
];

const MOCK_ASSESSMENTS: any[] = [
  {
    athlete_id: 'b0000000-0000-0000-0000-000000000007',
    sport_id: 'sepak_bola',
    level_id: 'sb_u19',
    composite_score: 82,
    dimension_scores: [
      { dimensionId: 'sb_speed', dimensionName: 'Kecepatan', score: 82,
        items: [{ itemId: 'sb_speed_sprint40', value: 5.3, score: 82 }, { itemId: 'sb_speed_accel10', value: 1.85, score: 78 }] },
      { dimensionId: 'sb_stamina', dimensionName: 'Daya Tahan', score: 90,
        items: [{ itemId: 'sb_stamina_yoyo', value: 17, score: 90 }, { itemId: 'sb_stamina_vo2max', value: 52, score: 88 }] },
      { dimensionId: 'sb_agility', dimensionName: 'Kelincahan', score: 72,
        items: [{ itemId: 'sb_agility_ttest', value: 10.8, score: 72 }, { itemId: 'sb_agility_zigzag', value: 15.2, score: 70 }] },
      { dimensionId: 'sb_technique', dimensionName: 'Teknik', score: 85,
        items: [{ itemId: 'sb_tech_passing', value: 78, score: 82 }, { itemId: 'sb_tech_dribbling', value: 78, score: 85 }] },
    ],
    status: 'completed',
    completed_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    valid_until: new Date(Date.now() + 3600000 * 24 * 180).toISOString(),
  },
  {
    athlete_id: 'b0000000-0000-0000-0000-000000000007',
    sport_id: 'bulutangkis',
    level_id: 'bt_u17',
    composite_score: 78,
    dimension_scores: [
      { dimensionId: 'bt_speed', dimensionName: 'Kecepatan', score: 78,
        items: [{ itemId: 'bt_speed_6point', value: 19.0, score: 78 }, { itemId: 'bt_speed_reaction', value: 255, score: 75 }] },
      { dimensionId: 'bt_stamina', dimensionName: 'Daya Tahan', score: 84,
        items: [{ itemId: 'bt_stamina_multi', value: 12, score: 84 }, { itemId: 'bt_stamina_recovery', value: 26, score: 82 }] },
      { dimensionId: 'bt_agility', dimensionName: 'Kelincahan', score: 70,
        items: [{ itemId: 'bt_agility_shadow', value: 46, score: 70 }, { itemId: 'bt_agility_cod', value: 3.7, score: 72 }] },
      { dimensionId: 'bt_technique', dimensionName: 'Teknik', score: 80,
        items: [{ itemId: 'bt_tech_clear', value: 78, score: 80 }, { itemId: 'bt_tech_dropshot', value: 72, score: 78 }] },
    ],
    status: 'completed',
    completed_at: new Date(Date.now() - 3600000 * 96).toISOString(),
    valid_until: new Date(Date.now() + 3600000 * 24 * 180).toISOString(),
  },
  {
    athlete_id: 'b0000000-0000-0000-0000-000000000008',
    sport_id: 'bulutangkis',
    level_id: 'bt_u17',
    composite_score: 85,
    dimension_scores: [
      { dimensionId: 'bt_speed', dimensionName: 'Kecepatan', score: 85,
        items: [{ itemId: 'bt_speed_6point', value: 18.2, score: 85 }, { itemId: 'bt_speed_reaction', value: 240, score: 82 }] },
      { dimensionId: 'bt_stamina', dimensionName: 'Daya Tahan', score: 82,
        items: [{ itemId: 'bt_stamina_multi', value: 13, score: 82 }, { itemId: 'bt_stamina_recovery', value: 24, score: 84 }] },
      { dimensionId: 'bt_agility', dimensionName: 'Kelincahan', score: 86,
        items: [{ itemId: 'bt_agility_shadow', value: 42, score: 86 }, { itemId: 'bt_agility_cod', value: 3.4, score: 84 }] },
      { dimensionId: 'bt_technique', dimensionName: 'Teknik', score: 87,
        items: [{ itemId: 'bt_tech_clear', value: 82, score: 87 }, { itemId: 'bt_tech_dropshot', value: 78, score: 85 }] },
    ],
    status: 'completed',
    completed_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    valid_until: new Date(Date.now() + 3600000 * 24 * 180).toISOString(),
  },
];

const MOCK_KYS_VAULT: KYSRecord[] = [
  { athlete_id: 'b0000000-0000-0000-0000-000000000007', verified_score: 84.0, score_type: 'speed', audit_hash: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2', created_at: new Date(Date.now() - 3600000 * 4).toISOString() },
  { athlete_id: 'b0000000-0000-0000-0000-000000000007', verified_score: 92.0, score_type: 'stamina', audit_hash: 'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2', created_at: new Date(Date.now() - 3600000 * 3).toISOString() },
  { athlete_id: 'b0000000-0000-0000-0000-000000000007', verified_score: 78.0, score_type: 'agility', audit_hash: 'c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2', created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
  { athlete_id: 'b0000000-0000-0000-0000-000000000008', verified_score: 88.0, score_type: 'speed', audit_hash: 'd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2', created_at: new Date(Date.now() - 3600000 * 6).toISOString() },
  { athlete_id: 'b0000000-0000-0000-0000-000000000008', verified_score: 85.0, score_type: 'stamina', audit_hash: 'e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2', created_at: new Date(Date.now() - 3600000 * 5).toISOString() },
  { athlete_id: 'b0000000-0000-0000-0000-000000000008', verified_score: 82.0, score_type: 'agility', audit_hash: 'f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2', created_at: new Date(Date.now() - 3600000 * 1).toISOString() },
];

export function getSports() {
  return SPORTS_DATA;
}

export async function getAssessments(athleteId: string, sportId?: string) {
  try {
    let queryStr = 'SELECT * FROM sport_assessments WHERE athlete_id = $1';
    const params: any[] = [athleteId];

    if (sportId) {
      queryStr += ' AND sport_id = $2';
      params.push(sportId);
    }
    queryStr += ' ORDER BY completed_at DESC';

    const res = await pool.query(queryStr, params);
    return res.rows.map(row => ({
      ...row,
      composite_score: Number(row.composite_score),
      dimension_scores: typeof row.dimension_scores === 'string'
        ? JSON.parse(row.dimension_scores)
        : row.dimension_scores,
    }));
  } catch (err: any) {
    console.warn('[kysService] PostgreSQL getAssessments failed, calling instemory store:', err.message);

    const filtered = MOCK_ASSESSMENTS.filter(a => {
      const matchAthlete = a.athlete_id === athleteId;
      const matchSport = sportId ? a.sport_id === sportId : true;
      return matchAthlete && matchSport;
    });

    return filtered.sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
  }
}

export async function upsertAssessment(
  athleteId: string,
  sportId: string,
  compositeScore: number,
  dimensionScores: unknown[],
) {
  const levelId = sportId === 'bulutangkis' ? 'bt_u17' : (sportId === 'taekwondo' ? 'tk_u15' : 'sb_u19');

  try {
    const res = await pool.query(
      `INSERT INTO sport_assessments (id, athlete_id, sport_id, level_id, composite_score, dimension_scores, status, completed_at, valid_until)
       VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, 'completed', NOW(), NOW() + INTERVAL '6 months')
       ON CONFLICT (athlete_id, sport_id, level_id) 
       DO UPDATE SET 
         composite_score = EXCLUDED.composite_score,
         dimension_scores = EXCLUDED.dimension_scores,
         completed_at = EXCLUDED.completed_at,
         valid_until = EXCLUDED.valid_until
       RETURNING *`,
      [athleteId, sportId, levelId, compositeScore, JSON.stringify(dimensionScores)]
    );

    const row = res.rows[0];
    return {
      ...row,
      composite_score: Number(row.composite_score),
      dimension_scores: typeof row.dimension_scores === 'string'
        ? JSON.parse(row.dimension_scores)
        : row.dimension_scores,
    };
  } catch (err: any) {
    console.warn('[kysService] PostgreSQL upsertAssessment failed, logging to mock db:', err.message);

    const existingIdx = MOCK_ASSESSMENTS.findIndex(
      a => a.athlete_id === athleteId && a.sport_id === sportId && a.level_id === levelId
    );

    const now = new Date();
    const validUntil = new Date();
    validUntil.setMonth(now.getMonth() + 6);

    const data = {
      athlete_id: athleteId,
      sport_id: sportId,
      level_id: levelId,
      composite_score: compositeScore,
      dimension_scores: dimensionScores,
      status: 'completed',
      completed_at: now.toISOString(),
      valid_until: validUntil.toISOString(),
    };

    if (existingIdx !== -1) {
      MOCK_ASSESSMENTS[existingIdx] = data;
    } else {
      MOCK_ASSESSMENTS.push(data);
    }

    return data;
  }
}

export async function getKYSRecords(athleteId: string) {
  try {
    const res = await pool.query(
      'SELECT * FROM kys_vault WHERE athlete_id = $1 ORDER BY created_at DESC',
      [athleteId]
    );
    return res.rows.map(row => ({
      athlete_id: row.athlete_id,
      verified_score: Number(row.verified_score),
      score_type: row.score_type,
      audit_hash: row.audit_hash,
      created_at: row.created_at,
    }));
  } catch (err: any) {
    console.warn('[kysService] PostgreSQL getKYSRecords failed, falling back to mock:', err.message);
    return MOCK_KYS_VAULT.filter(r => r.athlete_id === athleteId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
}

export async function getKYSScores(athleteId: string) {
  const records = await getKYSRecords(athleteId);
  const scores: Record<string, number> = {};

  for (const row of records) {
    if (scores[row.score_type] === undefined) {
      scores[row.score_type] = row.verified_score;
    }
  }
  return scores;
}
