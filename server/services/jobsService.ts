/* eslint-disable @typescript-eslint/no-explicit-any */
import pool from '../config/database';
import type { Job, Organization } from '../types';

const MOCK_ORGS: Organization[] = [
  { id: 'a0000000-0000-0000-0000-000000000001', name: 'Persija Academy', slug: 'persija-academy', type: 'club', location: 'Jakarta', verified: true, description: 'Akademi resmi klub sepak bola Persija Jakarta.' },
  { id: 'a0000000-0000-0000-0000-000000000002', name: 'PB Djarum', slug: 'pb-djarum', type: 'club', location: 'Kudus', verified: true, description: 'Klub pembinaan bulutangkis legendaris di Indonesia.' },
  { id: 'a0000000-0000-0000-0000-000000000003', name: 'Bali United Youth', slug: 'bali-united-youth', type: 'club', location: 'Gianyar', verified: true },
  { id: 'a0000000-0000-0000-0000-000000000004', name: 'Elite Sport Center', slug: 'elite-sport-center', type: 'training_center', location: 'Bandung', verified: true },
  { id: 'a0000000-0000-0000-0000-000000000005', name: 'KONI Pusat', slug: 'koni-pusat', type: 'training_center', location: 'Jakarta', verified: true },
  { id: 'a0000000-0000-0000-0000-000000000006', name: 'SSB Tunas Muda', slug: 'ssb-tunas-muda', type: 'club', location: 'Surabaya', verified: true },
  { id: 'a0000000-0000-0000-0000-000000000007', name: 'PSM Makassar U-20', slug: 'psm-makassar-u20', type: 'club', location: 'Makassar', verified: true },
  { id: 'a0000000-0000-0000-0000-000000000008', name: 'PB TI', slug: 'pb-ti', type: 'training_center', location: 'Jakarta', verified: true },
];

const MOCK_JOBS: any[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    title: 'Penyerang Utama (U-19)',
    org_id: 'a0000000-0000-0000-0000-000000000001',
    type: 'Beasiswa Penuh',
    location: 'Jakarta',
    description: 'Mencari penyerang utama untuk tim U-19 Persija Academy dengan kemampuan finishing dan kecepatan tinggi.',
    min_kys_requirements: { agility: 85 },
    salary_range: 'Full Scholarship',
    status: 'open',
    sport_id: 'sepak_bola',
    level_id: 'sb_u19',
    is_kys_required: true,
    featured: true,
    criteria: 'KYS Agility > 85',
    criteria_type: 'kys_agility',
    criteria_value: 85,
    skill_requirements: [
      { dimensionId: 'sb_agility', dimensionName: 'Kelincahan', minScore: 85, checklist: [
        { itemId: 'sb_agility_ttest', label: 'T-Test', minValue: 10.0, weight: 1.0 },
        { itemId: 'sb_agility_zigzag', label: 'Zig-Zag Run', minValue: 14.0, weight: 0.8 },
      ]},
      { dimensionId: 'sb_technique', dimensionName: 'Teknik', minScore: 75, checklist: [
        { itemId: 'sb_tech_passing', label: 'Passing Accuracy', minValue: 70, weight: 0.7 },
      ]},
    ],
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    title: 'Asisten Pelatih Fisik',
    org_id: 'a0000000-0000-0000-0000-000000000004',
    type: 'Kontrak',
    location: 'Bandung',
    description: 'Membantu pelatih kepala dalam merancang dan mengevaluasi status kondisi fisik pemain sepak bola.',
    min_kys_requirements: {},
    salary_range: 'IDR 5M - 8M / month',
    status: 'open',
    sport_id: null,
    level_id: null,
    is_kys_required: false,
    featured: false,
    criteria: 'Sertifikat AFC/PSSI',
    criteria_type: 'sertifikat',
    criteria_value: null,
    skill_requirements: [],
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    title: 'Gelandang Bertahan',
    org_id: 'a0000000-0000-0000-0000-000000000003',
    type: 'Try-out',
    location: 'Gianyar',
    description: 'Mencari gelandang bertahan untuk tim U-17 Bali United Youth dengan stamina dan visi bermain yang baik.',
    min_kys_requirements: { stamina: 90 },
    salary_range: 'Negotiable',
    status: 'open',
    sport_id: 'sepak_bola',
    level_id: 'sb_u17',
    is_kys_required: true,
    featured: false,
    criteria: 'KYS Stamina > 90',
    criteria_type: 'kys_stamina',
    criteria_value: 90,
    skill_requirements: [
      { dimensionId: 'sb_stamina', dimensionName: 'Daya Tahan', minScore: 90, checklist: [
        { itemId: 'sb_stamina_yoyo', label: 'Yo-Yo Test IR1', minValue: 16, weight: 1.0 },
        { itemId: 'sb_stamina_vo2max', label: 'Estimasi VO2Max', minValue: 50, weight: 0.6 },
      ]},
      { dimensionId: 'sb_speed', dimensionName: 'Kecepatan', minScore: 75, checklist: [
        { itemId: 'sb_speed_sprint40', label: 'Sprint 40 meter', minValue: 5.5, weight: 0.8 },
      ]},
    ],
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
  {
    id: 'c0000000-0000-0000-0000-000000000004',
    title: 'Program Beasiswa Atlet Muda',
    org_id: 'a0000000-0000-0000-0000-000000000005',
    type: 'Beasiswa',
    location: 'Jakarta',
    description: 'Program pembinaan atlet berprestasi untuk dipersiapkan menuju kejuaraan pekan olahraga nasional maupun tingkat regional.',
    min_kys_requirements: {},
    salary_range: 'Scholarship Grant',
    status: 'open',
    sport_id: null,
    level_id: null,
    is_kys_required: false,
    featured: true,
    criteria: 'Usia 15-18 tahun',
    criteria_type: 'usia',
    criteria_value: null,
    skill_requirements: [],
    created_at: new Date(Date.now() - 3600000 * 96).toISOString(),
  },
  {
    id: 'c0000000-0000-0000-0000-000000000005',
    title: 'Pelatih Teknik (Soccer)',
    org_id: 'a0000000-0000-0000-0000-000000000006',
    type: 'Kontrak',
    location: 'Surabaya',
    description: 'Mengajar teknik dasar, kontrol bola, taktis menyerang, dan transisi bertahan untuk kelompok umur U-12 s/d U-15.',
    min_kys_requirements: {},
    salary_range: 'Competitive',
    status: 'open',
    sport_id: null,
    level_id: null,
    is_kys_required: false,
    featured: false,
    criteria: 'Lisensi C PSSI',
    criteria_type: 'sertifikat',
    criteria_value: null,
    skill_requirements: [],
    created_at: new Date(Date.now() - 3600000 * 120).toISOString(),
  },
  {
    id: 'c0000000-0000-0000-0000-000000000006',
    title: 'Sport Scientist',
    org_id: 'a0000000-0000-0000-0000-000000000004',
    type: 'Full-time',
    location: 'Bandung',
    description: 'Analisis biomekanika gerak atlet, optimasi respon pemulihan pasca lari kencang, analisis data performa.',
    min_kys_requirements: { speed: 75 },
    salary_range: 'IDR 8M - 12M / month',
    status: 'open',
    sport_id: null,
    level_id: null,
    is_kys_required: true,
    featured: false,
    criteria: 'KYS Speed > 75',
    criteria_type: 'kys_speed',
    criteria_value: 75,
    skill_requirements: [],
    created_at: new Date(Date.now() - 3600000 * 150).toISOString(),
  },
  {
    id: 'c0000000-0000-0000-0000-000000000007',
    title: 'Atlet Junior Bulutangkis',
    org_id: 'a0000000-0000-0000-0000-000000000002',
    type: 'Beasiswa Penuh',
    location: 'Kudus',
    description: 'Program pembinaan atlet junior bulutangkis PB Djarum. Terbuka untuk atlet U-17 dengan potensi tinggi.',
    min_kys_requirements: { speed: 80 },
    salary_range: 'Full Scholarship + Living Allowance',
    status: 'open',
    sport_id: 'bulutangkis',
    level_id: 'bt_u17',
    is_kys_required: true,
    featured: true,
    criteria: 'KYS Speed > 80',
    criteria_type: 'kys_speed',
    criteria_value: 80,
    skill_requirements: [
      { dimensionId: 'bt_speed', dimensionName: 'Kecepatan', minScore: 80, checklist: [
        { itemId: 'bt_speed_6point', label: '6-Point Footwork', minValue: 19.0, weight: 1.0 },
        { itemId: 'bt_speed_reaction', label: 'Reaction Time', minValue: 250, weight: 0.7 },
      ]},
      { dimensionId: 'bt_technique', dimensionName: 'Teknik', minScore: 72, checklist: [
        { itemId: 'bt_tech_clear', label: 'Clear Accuracy', minValue: 70, weight: 0.8 },
      ]},
    ],
    created_at: new Date(Date.now() - 3600000 * 180).toISOString(),
  },
  {
    id: 'c0000000-0000-0000-0000-000000000008',
    title: 'Gelandang Serang',
    org_id: 'a0000000-0000-0000-0000-000000000007',
    type: 'Try-out',
    location: 'Makassar',
    description: 'Mencari gelandang serang lincah berdaya jelajah tinggi berkreativitas umpan matang di zona sepertiga lapangan lawan.',
    min_kys_requirements: { average: 82 },
    salary_range: 'Negotiable',
    status: 'open',
    sport_id: 'sepak_bola',
    level_id: 'sb_u20',
    is_kys_required: true,
    featured: false,
    criteria: 'KYS Avg > 82',
    criteria_type: 'kys_avg',
    criteria_value: 82,
    skill_requirements: [
      { dimensionId: 'sb_technique', dimensionName: 'Teknik', minScore: 80, checklist: [
        { itemId: 'sb_tech_passing', label: 'Passing Accuracy', minValue: 75, weight: 1.0 },
        { itemId: 'sb_tech_dribbling', label: 'Dribbling Control', minValue: 75, weight: 0.8 },
      ]},
      { dimensionId: 'sb_speed', dimensionName: 'Kecepatan', minScore: 78, checklist: [
        { itemId: 'sb_speed_sprint40', label: 'Sprint 40 meter', minValue: 5.2, weight: 0.7 },
      ]},
      { dimensionId: 'sb_agility', dimensionName: 'Kelincahan', minScore: 75, checklist: [
        { itemId: 'sb_agility_ttest', label: 'T-Test', minValue: 10.5, weight: 0.6 },
      ]},
    ],
    created_at: new Date(Date.now() - 3600000 * 210).toISOString(),
  },
  {
    id: 'c0000000-0000-0000-0000-000000000009',
    title: 'Atlet Taekwondo Junior',
    org_id: 'a0000000-0000-0000-0000-000000000008',
    type: 'Beasiswa Penuh',
    location: 'Jakarta',
    description: 'Fasilitas akomodasi penuh, perlengkapan latihan, serta kontribusi sertifikasi sabuk untuk atlet muda taekwondo berpotensi.',
    min_kys_requirements: {},
    salary_range: 'Full Scholarship',
    status: 'open',
    sport_id: 'taekwondo',
    level_id: 'tk_u15',
    is_kys_required: false,
    featured: false,
    criteria: 'Usia 12-15 tahun',
    criteria_type: 'usia',
    criteria_value: null,
    skill_requirements: [],
    created_at: new Date(Date.now() - 3600000 * 240).toISOString(),
  },
];

function mapRowToJob(row: any): Job {
  return {
    id: row.id,
    title: row.title,
    org_id: row.org_id,
    type: row.type,
    location: row.location,
    description: row.description,
    min_kys_requirements: typeof row.min_kys_requirements === 'string'
      ? JSON.parse(row.min_kys_requirements)
      : row.min_kys_requirements,
    salary_range: row.salary_range,
    status: row.status,
    sport_id: row.sport_id,
    level_id: row.level_id,
    is_kys_required: row.is_kys_required,
    featured: row.featured,
    criteria: row.criteria,
    criteria_type: row.criteria_type,
    criteria_value: row.criteria_value,
    skill_requirements: typeof row.skill_requirements === 'string'
      ? JSON.parse(row.skill_requirements)
      : row.skill_requirements,
    created_at: row.created_at,
    organization: row.org_name ? {
      id: row.org_id,
      name: row.org_name,
      slug: row.org_slug,
      logo_url: row.org_logo || undefined,
      location: row.org_location || undefined,
      type: row.org_type,
      verified: row.org_verified,
      description: row.org_desc || undefined,
    } : undefined,
  };
}

export async function getAllJobs(): Promise<Job[]> {
  try {
    const res = await pool.query(`
      SELECT j.*, 
             o.name as org_name, o.slug as org_slug, o.logo_url as org_logo, o.location as org_location, 
             o.type as org_type, o.verified as org_verified, o.description as org_desc
      FROM jobs j
      LEFT JOIN organizations o ON j.org_id = o.id
      WHERE j.status = 'open'
      ORDER BY j.created_at DESC
    `);
    return res.rows.map(mapRowToJob);
  } catch (err: any) {
    console.warn('[jobsService] PostgreSQL connection failed, loading mock jobs:', err.message);

    // Filter, map & join in-memory
    const activeJobs = MOCK_JOBS.filter(j => j.status === 'open');
    const enriched = activeJobs.map(j => {
      const org = MOCK_ORGS.find(o => o.id === j.org_id);
      return {
        ...j,
        organization: org,
      } as Job;
    });
    // Sort desc by created_at
    return enriched.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
}

export async function getJobById(id: string): Promise<Job | null> {
  try {
    const res = await pool.query(`
      SELECT j.*, 
             o.name as org_name, o.slug as org_slug, o.logo_url as org_logo, o.location as org_location, 
             o.type as org_type, o.verified as org_verified, o.description as org_desc
      FROM jobs j
      LEFT JOIN organizations o ON j.org_id = o.id
      WHERE j.id = $1
    `, [id]);

    if (res.rows.length === 0) return null;
    return mapRowToJob(res.rows[0]);
  } catch (err: any) {
    console.warn('[jobsService] PostgreSQL job detail failure, using mock detail:', err.message);

    const mockJob = MOCK_JOBS.find(j => j.id === id);
    if (!mockJob) return null;

    const org = MOCK_ORGS.find(o => o.id === mockJob.org_id);
    return {
      ...mockJob,
      organization: org,
    } as Job;
  }
}
