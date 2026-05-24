import bcrypt from 'bcryptjs';
import pool from '../config/database';

const SALT_ROUNDS = 10;
const HASH_CACHE: Record<string, string> = {};

async function hash(password: string): Promise<string> {
  if (!HASH_CACHE[password]) {
    HASH_CACHE[password] = await bcrypt.hash(password, SALT_ROUNDS);
  }
  return HASH_CACHE[password];
}

async function seed() {
  console.log('Seeding database to PostgreSQL...\n');
  const client = await pool.connect();

  try {
    // Begin transaction
    await client.query('BEGIN');

    // Clean existing tables (Cascading)
    console.log('Clearing existing tables data...');
    await client.query('TRUNCATE TABLE kys_vault, sport_assessments, career_progress, jobs, profiles, users, organizations CASCADE;');

    /* ── 1. Organizations ── */
    const orgs = [
      { id: 'a0000000-0000-0000-0000-000000000001', name: 'Persija Academy', slug: 'persija-academy', type: 'club', location: 'Jakarta', verified: true },
      { id: 'a0000000-0000-0000-0000-000000000002', name: 'PB Djarum', slug: 'pb-djarum', type: 'club', location: 'Kudus', verified: true },
      { id: 'a0000000-0000-0000-0000-000000000003', name: 'Bali United Youth', slug: 'bali-united-youth', type: 'club', location: 'Gianyar', verified: true },
      { id: 'a0000000-0000-0000-0000-000000000004', name: 'Elite Sport Center', slug: 'elite-sport-center', type: 'training_center', location: 'Bandung', verified: true },
      { id: 'a0000000-0000-0000-0000-000000000005', name: 'KONI Pusat', slug: 'koni-pusat', type: 'training_center', location: 'Jakarta', verified: true },
      { id: 'a0000000-0000-0000-0000-000000000006', name: 'SSB Tunas Muda', slug: 'ssb-tunas-muda', type: 'club', location: 'Surabaya', verified: true },
      { id: 'a0000000-0000-0000-0000-000000000007', name: 'PSM Makassar U-20', slug: 'psm-makassar-u20', type: 'club', location: 'Makassar', verified: true },
      { id: 'a0000000-0000-0000-0000-000000000008', name: 'PB TI', slug: 'pb-ti', type: 'training_center', location: 'Jakarta', verified: true },
    ];

    for (const o of orgs) {
      await client.query(
        `INSERT INTO organizations (id, name, slug, type, location, verified) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [o.id, o.name, o.slug, o.type, o.location, o.verified]
      );
    }
    console.log(`  ✓ ${orgs.length} organizations in PostgreSQL`);

    /* ── 2. Users ── */
    const users = [
      { id: 'b0000000-0000-0000-0000-000000000001', email: 'admin@sinergi.test', password: 'admin123', role: 'admin', status: 'active', fullName: 'Admin Sistem' },
      { id: 'b0000000-0000-0000-0000-000000000002', email: 'superadmin@sinergi.test', password: 'admin123', role: 'admin', status: 'active', fullName: 'Super Admin' },
      { id: 'b0000000-0000-0000-0000-000000000003', email: 'persija@club.test', password: 'club123', role: 'klub', status: 'active', fullName: 'Persija Academy HR' },
      { id: 'b0000000-0000-0000-0000-000000000004', email: 'djarum@club.test', password: 'club123', role: 'klub', status: 'active', fullName: 'PB Djarum Tim Scouting' },
      { id: 'b0000000-0000-0000-0000-000000000005', email: 'scout1@sinergi.test', password: 'scout123', role: 'pencari_bakat', status: 'active', fullName: 'Andi Pencari Bakat' },
      { id: 'b0000000-0000-0000-0000-000000000006', email: 'scout2@sinergi.test', password: 'scout123', role: 'pencari_bakat', status: 'active', fullName: 'Siti Pencari Bakat' },
      { id: 'b0000000-0000-0000-0000-000000000007', email: 'budi@atlet.test', password: 'atlet123', role: 'talent', status: 'active', fullName: 'Budi Santoso' },
      { id: 'b0000000-0000-0000-0000-000000000008', email: 'sinta@atlet.test', password: 'atlet123', role: 'talent', status: 'active', fullName: 'Sinta Wijaya' },
      { id: 'b0000000-0000-0000-0000-000000000009', email: 'pending@club.test', password: 'club123', role: 'klub', status: 'pending', fullName: 'Klub Menunggu' },
    ];

    for (const u of users) {
      const passwordHash = await hash(u.password);
      await client.query(
        `INSERT INTO users (id, email, password_hash, role, full_name, status) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [u.id, u.email, passwordHash, u.role, u.fullName, u.status]
      );
    }
    console.log(`  ✓ ${users.length} users in PostgreSQL`);

    /* ── 3. Profiles ── */
    const profiles = [
      { id: 'b0000000-0000-0000-0000-000000000001', userId: 'b0000000-0000-0000-0000-000000000001', orgId: null, sport: null, position: null },
      { id: 'b0000000-0000-0000-0000-000000000002', userId: 'b0000000-0000-0000-0000-000000000002', orgId: null, sport: null, position: null },
      { id: 'b0000000-0000-0000-0000-000000000003', userId: 'b0000000-0000-0000-0000-000000000003', orgId: 'a0000000-0000-0000-0000-000000000001', sport: 'sepak_bola', position: 'HRD' },
      { id: 'b0000000-0000-0000-0000-000000000004', userId: 'b0000000-0000-0000-0000-000000000004', orgId: 'a0000000-0000-0000-0000-000000000002', sport: 'bulutangkis', position: 'Tim Scouting' },
      { id: 'b0000000-0000-0000-0000-000000000005', userId: 'b0000000-0000-0000-0000-000000000005', orgId: 'a0000000-0000-0000-0000-000000000004', sport: null, position: 'Scout' },
      { id: 'b0000000-0000-0000-0000-000000000006', userId: 'b0000000-0000-0000-0000-000000000006', orgId: 'a0000000-0000-0000-0000-000000000002', sport: 'bulutangkis', position: 'Scout' },
      { id: 'b0000000-0000-0000-0000-000000000007', userId: 'b0000000-0000-0000-0000-000000000007', orgId: null, sport: 'sepak_bola', position: 'Penyerang' },
      { id: 'b0000000-0000-0000-0000-000000000008', userId: 'b0000000-0000-0000-0000-000000000008', orgId: null, sport: 'bulutangkis', position: 'Tunggal Putri' },
      { id: 'b0000000-0000-0000-0000-000000000009', userId: 'b0000000-0000-0000-0000-000000000009', orgId: null, sport: null, position: null },
    ];

    for (const p of profiles) {
      await client.query(
        `INSERT INTO profiles (id, user_id, org_id, sport_type, position) 
         VALUES ($1, $2, $3, $4, $5)`,
        [p.id, p.userId, p.orgId, p.sport, p.position]
      );
    }
    console.log(`  ✓ ${profiles.length} profiles in PostgreSQL`);

    /* ── 4. Jobs ── */
    const jobs = [
      {
        id: 'c0000000-0000-0000-0000-000000000001',
        title: 'Penyerang Utama (U-19)',
        org_id: 'a0000000-0000-0000-0000-000000000001',
        type: 'Beasiswa Penuh',
        location: 'Jakarta',
        description: 'Mencari penyerang utama untuk tim U-19 Persija Academy dengan kemampuan finishing dan kecepatan tinggi.',
        min_kys_requirements: JSON.stringify({ agility: 85 }),
        salary_range: 'Full Scholarship',
        status: 'open',
        sport_id: 'sepak_bola',
        level_id: 'sb_u19',
        is_kys_required: true,
        featured: true,
        criteria: 'KYS Agility > 85',
        criteria_type: 'kys_agility',
        criteria_value: 85,
        skill_requirements: JSON.stringify([
          { dimensionId: 'sb_agility', dimensionName: 'Kelincahan', minScore: 85, checklist: [
            { itemId: 'sb_agility_ttest', label: 'T-Test', minValue: 10.0, weight: 1.0 },
            { itemId: 'sb_agility_zigzag', label: 'Zig-Zag Run', minValue: 14.0, weight: 0.8 },
          ]},
          { dimensionId: 'sb_technique', dimensionName: 'Teknik', minScore: 75, checklist: [
            { itemId: 'sb_tech_passing', label: 'Passing Accuracy', minValue: 70, weight: 0.7 },
          ]},
        ]),
      },
      {
        id: 'c0000000-0000-0000-0000-000000000002',
        title: 'Asisten Pelatih Fisik',
        org_id: 'a0000000-0000-0000-0000-000000000004',
        type: 'Kontrak',
        location: 'Bandung',
        description: 'Membantu pelatih kepala dalam merancang dan mengevaluasi status kondisi fisik pemain sepak bola.',
        min_kys_requirements: JSON.stringify({}),
        salary_range: 'IDR 5M - 8M / month',
        status: 'open',
        sport_id: null,
        level_id: null,
        is_kys_required: false,
        featured: false,
        criteria: 'Sertifikat AFC/PSSI',
        criteria_type: 'sertifikat',
        criteria_value: null,
        skill_requirements: JSON.stringify([]),
      },
      {
        id: 'c0000000-0000-0000-0000-000000000003',
        title: 'Gelandang Bertahan',
        org_id: 'a0000000-0000-0000-0000-000000000003',
        type: 'Try-out',
        location: 'Gianyar',
        description: 'Mencari gelandang bertahan untuk tim U-17 Bali United Youth dengan stamina dan visi bermain yang baik.',
        min_kys_requirements: JSON.stringify({ stamina: 90 }),
        salary_range: 'Negotiable',
        status: 'open',
        sport_id: 'sepak_bola',
        level_id: 'sb_u17',
        is_kys_required: true,
        featured: false,
        criteria: 'KYS Stamina > 90',
        criteria_type: 'kys_stamina',
        criteria_value: 90,
        skill_requirements: JSON.stringify([
          { dimensionId: 'sb_stamina', dimensionName: 'Daya Tahan', minScore: 90, checklist: [
            { itemId: 'sb_stamina_yoyo', label: 'Yo-Yo Test IR1', minValue: 16, weight: 1.0 },
            { itemId: 'sb_stamina_vo2max', label: 'Estimasi VO2Max', minValue: 50, weight: 0.6 },
          ]},
          { dimensionId: 'sb_speed', dimensionName: 'Kecepatan', minScore: 75, checklist: [
            { itemId: 'sb_speed_sprint40', label: 'Sprint 40 meter', minValue: 5.5, weight: 0.8 },
          ]},
        ]),
      },
      {
        id: 'c0000000-0000-0000-0000-000000000004',
        title: 'Program Beasiswa Atlet Muda',
        org_id: 'a0000000-0000-0000-0000-000000000005',
        type: 'Beasiswa',
        location: 'Jakarta',
        description: 'Program pembinaan atlet berprestasi untuk dipersiapkan menuju kejuaraan pekan olahraga nasional maupun tingkat regional.',
        min_kys_requirements: JSON.stringify({}),
        salary_range: 'Scholarship Grant',
        status: 'open',
        sport_id: null,
        level_id: null,
        is_kys_required: false,
        featured: true,
        criteria: 'Usia 15-18 tahun',
        criteria_type: 'usia',
        criteria_value: null,
        skill_requirements: JSON.stringify([]),
      },
      {
        id: 'c0000000-0000-0000-0000-000000000005',
        title: 'Pelatih Teknik (Soccer)',
        org_id: 'a0000000-0000-0000-0000-000000000006',
        type: 'Kontrak',
        location: 'Surabaya',
        description: 'Mengajar teknik dasar, kontrol bola, taktis menyerang, dan transisi bertahan untuk kelompok umur U-12 s/d U-15.',
        min_kys_requirements: JSON.stringify({}),
        salary_range: 'Competitive',
        status: 'open',
        sport_id: null,
        level_id: null,
        is_kys_required: false,
        featured: false,
        criteria: 'Lisensi C PSSI',
        criteria_type: 'sertifikat',
        criteria_value: null,
        skill_requirements: JSON.stringify([]),
      },
      {
        id: 'c0000000-0000-0000-0000-000000000006',
        title: 'Sport Scientist',
        org_id: 'a0000000-0000-0000-0000-000000000004',
        type: 'Full-time',
        location: 'Bandung',
        description: 'Analisis biomekanika gerak atlet, optimasi respon pemulihan pasca lari kencang, analisis data performa.',
        min_kys_requirements: JSON.stringify({ speed: 75 }),
        salary_range: 'IDR 8M - 12M / month',
        status: 'open',
        sport_id: null,
        level_id: null,
        is_kys_required: true,
        featured: false,
        criteria: 'KYS Speed > 75',
        criteria_type: 'kys_speed',
        criteria_value: 75,
        skill_requirements: JSON.stringify([]),
      },
      {
        id: 'c0000000-0000-0000-0000-000000000007',
        title: 'Atlet Junior Bulutangkis',
        org_id: 'a0000000-0000-0000-0000-000000000002',
        type: 'Beasiswa Penuh',
        location: 'Kudus',
        description: 'Program pembinaan atlet junior bulutangkis PB Djarum. Terbuka untuk atlet U-17 dengan potensi tinggi.',
        min_kys_requirements: JSON.stringify({ speed: 80 }),
        salary_range: 'Full Scholarship + Living Allowance',
        status: 'open',
        sport_id: 'bulutangkis',
        level_id: 'bt_u17',
        is_kys_required: true,
        featured: true,
        criteria: 'KYS Speed > 80',
        criteria_type: 'kys_speed',
        criteria_value: 80,
        skill_requirements: JSON.stringify([
          { dimensionId: 'bt_speed', dimensionName: 'Kecepatan', minScore: 80, checklist: [
            { itemId: 'bt_speed_6point', label: '6-Point Footwork', minValue: 19.0, weight: 1.0 },
            { itemId: 'bt_speed_reaction', label: 'Reaction Time', minValue: 250, weight: 0.7 },
          ]},
          { dimensionId: 'bt_technique', dimensionName: 'Teknik', minScore: 72, checklist: [
            { itemId: 'bt_tech_clear', label: 'Clear Accuracy', minValue: 70, weight: 0.8 },
          ]},
        ]),
      },
      {
        id: 'c0000000-0000-0000-0000-000000000008',
        title: 'Gelandang Serang',
        org_id: 'a0000000-0000-0000-0000-000000000007',
        type: 'Try-out',
        location: 'Makassar',
        description: 'Mencari gelandang serang lincah berdaya jelajah tinggi berkreativitas umpan matang di zona sepertiga lapangan lawan.',
        min_kys_requirements: JSON.stringify({ average: 82 }),
        salary_range: 'Negotiable',
        status: 'open',
        sport_id: 'sepak_bola',
        level_id: 'sb_u20',
        is_kys_required: true,
        featured: false,
        criteria: 'KYS Avg > 82',
        criteria_type: 'kys_avg',
        criteria_value: 82,
        skill_requirements: JSON.stringify([
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
        ]),
      },
      {
        id: 'c0000000-0000-0000-0000-000000000009',
        title: 'Atlet Taekwondo Junior',
        org_id: 'a0000000-0000-0000-0000-000000000008',
        type: 'Beasiswa Penuh',
        location: 'Jakarta',
        description: 'Fasilitas akomodasi penuh, perlengkapan latihan, serta kontribusi sertifikasi sabuk untuk atlet muda taekwondo berpotensi.',
        min_kys_requirements: JSON.stringify({}),
        salary_range: 'Full Scholarship',
        status: 'open',
        sport_id: 'taekwondo',
        level_id: 'tk_u15',
        is_kys_required: false,
        featured: false,
        criteria: 'Usia 12-15 tahun',
        criteria_type: 'usia',
        criteria_value: null,
        skill_requirements: JSON.stringify([]),
      },
    ];

    for (const j of jobs) {
      await client.query(
        `INSERT INTO jobs (id, title, org_id, type, location, description, min_kys_requirements, salary_range, status, sport_id, level_id, is_kys_required, featured, criteria, criteria_type, criteria_value, skill_requirements) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
        [j.id, j.title, j.org_id, j.type, j.location, j.description, j.min_kys_requirements, j.salary_range, j.status, j.sport_id, j.level_id, j.is_kys_required, j.featured, j.criteria, j.criteria_type, j.criteria_value, j.skill_requirements]
      );
    }
    console.log(`  ✓ ${jobs.length} jobs in PostgreSQL`);

    /* ── 5. Sport Assessments ── */
    const budiProfileId = 'b0000000-0000-0000-0000-000000000007';
    const sintaProfileId = 'b0000000-0000-0000-0000-000000000008';

    const assessments = [
      {
        athleteId: budiProfileId, sportId: 'sepak_bola', levelId: 'sb_u19',
        score: 82,
        dimensions: JSON.stringify([
          { dimensionId: 'sb_speed', dimensionName: 'Kecepatan', score: 82,
            items: [{ itemId: 'sb_speed_sprint40', value: 5.3, score: 82 }, { itemId: 'sb_speed_accel10', value: 1.85, score: 78 }] },
          { dimensionId: 'sb_stamina', dimensionName: 'Daya Tahan', score: 90,
            items: [{ itemId: 'sb_stamina_yoyo', value: 17, score: 90 }, { itemId: 'sb_stamina_vo2max', value: 52, score: 88 }] },
          { dimensionId: 'sb_agility', dimensionName: 'Kelincahan', score: 72,
            items: [{ itemId: 'sb_agility_ttest', value: 10.8, score: 72 }, { itemId: 'sb_agility_zigzag', value: 15.2, score: 70 }] },
          { dimensionId: 'sb_technique', dimensionName: 'Teknik', score: 85,
            items: [{ itemId: 'sb_tech_passing', value: 78, score: 82 }, { itemId: 'sb_tech_dribbling', value: 78, score: 85 }] },
        ]),
      },
      {
        athleteId: budiProfileId, sportId: 'bulutangkis', levelId: 'bt_u17',
        score: 78,
        dimensions: JSON.stringify([
          { dimensionId: 'bt_speed', dimensionName: 'Kecepatan', score: 78,
            items: [{ itemId: 'bt_speed_6point', value: 19.0, score: 78 }, { itemId: 'bt_speed_reaction', value: 255, score: 75 }] },
          { dimensionId: 'bt_stamina', dimensionName: 'Daya Tahan', score: 84,
            items: [{ itemId: 'bt_stamina_multi', value: 12, score: 84 }, { itemId: 'bt_stamina_recovery', value: 26, score: 82 }] },
          { dimensionId: 'bt_agility', dimensionName: 'Kelincahan', score: 70,
            items: [{ itemId: 'bt_agility_shadow', value: 46, score: 70 }, { itemId: 'bt_agility_cod', value: 3.7, score: 72 }] },
          { dimensionId: 'bt_technique', dimensionName: 'Teknik', score: 80,
            items: [{ itemId: 'bt_tech_clear', value: 78, score: 80 }, { itemId: 'bt_tech_dropshot', value: 72, score: 78 }] },
        ]),
      },
      {
        athleteId: sintaProfileId, sportId: 'bulutangkis', levelId: 'bt_u17',
        score: 85,
        dimensions: JSON.stringify([
          { dimensionId: 'bt_speed', dimensionName: 'Kecepatan', score: 85,
            items: [{ itemId: 'bt_speed_6point', value: 18.2, score: 85 }, { itemId: 'bt_speed_reaction', value: 240, score: 82 }] },
          { dimensionId: 'bt_stamina', dimensionName: 'Daya Tahan', score: 82,
            items: [{ itemId: 'bt_stamina_multi', value: 13, score: 82 }, { itemId: 'bt_stamina_recovery', value: 24, score: 84 }] },
          { dimensionId: 'bt_agility', dimensionName: 'Kelincahan', score: 86,
            items: [{ itemId: 'bt_agility_shadow', value: 42, score: 86 }, { itemId: 'bt_agility_cod', value: 3.4, score: 84 }] },
          { dimensionId: 'bt_technique', dimensionName: 'Teknik', score: 87,
            items: [{ itemId: 'bt_tech_clear', value: 82, score: 87 }, { itemId: 'bt_tech_dropshot', value: 78, score: 85 }] },
        ]),
      },
    ];

    for (const a of assessments) {
      await client.query(
        `INSERT INTO sport_assessments (id, athlete_id, sport_id, level_id, composite_score, dimension_scores, status, completed_at, valid_until) 
         VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, 'completed', NOW(), NOW() + INTERVAL '6 months')`,
        [a.athleteId, a.sportId, a.levelId, a.score, a.dimensions]
      );
    }
    console.log(`  ✓ ${assessments.length} sport assessments in PostgreSQL`);

    /* ── 6. Career Progress ── */
    const careers = [
      { athleteId: budiProfileId, level: 2, exp: 1450, milestones: ['d0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002'] },
      { athleteId: sintaProfileId, level: 3, exp: 3200, milestones: ['d0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000003'] },
    ];

    for (const c of careers) {
      await client.query(
        `INSERT INTO career_progress (id, athlete_id, current_level, total_exp, milestones_reached) 
         VALUES (uuid_generate_v4(), $1, $2, $3, $4)`,
        [c.athleteId, c.level, c.exp, c.milestones]
      );
    }
    console.log(`  ✓ ${careers.length} career progress records in PostgreSQL`);

    /* ── 7. KYS Vault ── */
    const vaultRecords = [
      { id: 'a0000000-0000-0000-0000-0000000000a1', athleteId: budiProfileId, score: 84.0, type: 'speed', hash: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2' },
      { id: 'a0000000-0000-0000-0000-0000000000a2', athleteId: budiProfileId, score: 92.0, type: 'stamina', hash: 'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2' },
      { id: 'a0000000-0000-0000-0000-0000000000a3', athleteId: budiProfileId, score: 78.0, type: 'agility', hash: 'c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2' },
      { id: 'a0000000-0000-0000-0000-0000000000a4', athleteId: sintaProfileId, score: 88.0, type: 'speed', hash: 'd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2' },
      { id: 'a0000000-0000-0000-0000-0000000000a5', athleteId: sintaProfileId, score: 85.0, type: 'stamina', hash: 'e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2' },
      { id: 'a0000000-0000-0000-0000-0000000000a6', athleteId: sintaProfileId, score: 82.0, type: 'agility', hash: 'f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2' },
    ];

    for (const v of vaultRecords) {
      await client.query(
        `INSERT INTO kys_vault (id, athlete_id, verified_score, score_type, audit_hash, session_metadata) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [v.id, v.athleteId, v.score, v.type, v.hash, JSON.stringify({})]
      );
    }
    console.log(`  ✓ ${vaultRecords.length} kys vault records in PostgreSQL`);

    await client.query('COMMIT');
    console.log('\n✅ PostgreSQL Seed COMPLETE!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ PostgreSQL Seeding Failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error('Unhandled seeder execution error:', err);
  process.exit(1);
});
