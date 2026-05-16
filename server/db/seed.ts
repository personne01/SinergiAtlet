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
  console.log('Seeding database...\n');

  /* ── Organizations ── */
  const orgs = [
    { id: 'a0000000-0000-0000-0000-000000000001', name: 'Persija Academy', slug: 'persija-academy', type: 'club', location: 'Jakarta', verified: true },
    { id: 'a0000000-0000-0000-0000-000000000002', name: 'PB Djarum', slug: 'pb-djarum', type: 'club', location: 'Kudus', verified: true },
    { id: 'a0000000-0000-0000-0000-000000000003', name: 'Bali United Youth', slug: 'bali-united-youth', type: 'club', location: 'Gianyar', verified: true },
    { id: 'a0000000-0000-0000-0000-000000000004', name: 'Elite Sport Center', slug: 'elite-sport-center', type: 'training_center', location: 'Bandung', verified: true },
  ];

  for (const o of orgs) {
    await pool.query(
      `INSERT INTO organizations (id, name, slug, type, location, verified)
       VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
      [o.id, o.name, o.slug, o.type, o.location, o.verified],
    );
  }
  console.log(`  ✓ ${orgs.length} organizations`);

  /* ── Users ── */
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
    await pool.query(
      `INSERT INTO users (id, email, password_hash, role, status, full_name)
       VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
      [u.id, u.email, passwordHash, u.role, u.status, u.fullName],
    );
  }
  console.log(`  ✓ ${users.length} users`);

  /* ── Profiles ── */
  const profiles = [
    // Admin & klub & pencari_bakat dengan org
    { userId: 'b0000000-0000-0000-0000-000000000001', orgId: null, sport: null, position: null },
    { userId: 'b0000000-0000-0000-0000-000000000002', orgId: null, sport: null, position: null },
    { userId: 'b0000000-0000-0000-0000-000000000003', orgId: 'a0000000-0000-0000-0000-000000000001', sport: 'sepak_bola', position: 'HRD' },
    { userId: 'b0000000-0000-0000-0000-000000000004', orgId: 'a0000000-0000-0000-0000-000000000002', sport: 'bulutangkis', position: 'Tim Scouting' },
    { userId: 'b0000000-0000-0000-0000-000000000005', orgId: 'a0000000-0000-0000-0000-000000000004', sport: null, position: 'Scout' },
    { userId: 'b0000000-0000-0000-0000-000000000006', orgId: 'a0000000-0000-0000-0000-000000000002', sport: 'bulutangkis', position: 'Scout' },
    // Talent tanpa org
    { userId: 'b0000000-0000-0000-0000-000000000007', orgId: null, sport: 'sepak_bola', position: 'Penyerang' },
    { userId: 'b0000000-0000-0000-0000-000000000008', orgId: null, sport: 'bulutangkis', position: 'Tunggal Putri' },
    { userId: 'b0000000-0000-0000-0000-000000000009', orgId: null, sport: null, position: null },
  ];

  for (const p of profiles) {
    await pool.query(
      `INSERT INTO profiles (id, user_id, org_id, sport_type, position)
       VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING`,
      [p.userId, p.userId, p.orgId, p.sport, p.position],
    );
  }
  console.log(`  ✓ ${profiles.length} profiles`);

  /* ── Jobs ── */
  const jobs = [
    {
      id: 'c0000000-0000-0000-0000-000000000001',
      title: 'Penyerang Utama U-19',
      orgId: 'a0000000-0000-0000-0000-000000000001',
      type: 'Beasiswa Penuh',
      location: 'Jakarta',
      description: 'Mencari penyerang utama untuk tim U-19 Persija Academy dengan kemampuan finishing dan kecepatan tinggi.',
      minKys: JSON.stringify({ agility: 85 }),
      salaryRange: 'Full Scholarship',
      status: 'open',
    },
    {
      id: 'c0000000-0000-0000-0000-000000000002',
      title: 'Gelandang Bertahan',
      orgId: 'a0000000-0000-0000-0000-000000000003',
      type: 'Try-out',
      location: 'Gianyar',
      description: 'Mencari gelandang bertahan untuk tim U-17 Bali United Youth dengan stamina dan visi bermain yang baik.',
      minKys: JSON.stringify({ stamina: 90 }),
      salaryRange: 'Negotiable',
      status: 'open',
    },
    {
      id: 'c0000000-0000-0000-0000-000000000003',
      title: 'Atlet Junior Bulutangkis',
      orgId: 'a0000000-0000-0000-0000-000000000002',
      type: 'Beasiswa Penuh',
      location: 'Kudus',
      description: 'Program pembinaan atlet junior bulutangkis PB Djarum. Terbuka untuk atlet U-17 dengan potensi tinggi.',
      minKys: JSON.stringify({ speed: 80 }),
      salaryRange: 'Full Scholarship + Living Allowance',
      status: 'open',
    },
  ];

  for (const j of jobs) {
    await pool.query(
      `INSERT INTO jobs (id, title, org_id, type, location, description, min_kys_requirements, salary_range, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9) ON CONFLICT (id) DO NOTHING`,
      [j.id, j.title, j.orgId, j.type, j.location, j.description, j.minKys, j.salaryRange, j.status],
    );
  }
  console.log(`  ✓ ${jobs.length} jobs`);

  /* ── Sport Assessments ── */
  // Need profile IDs (same as user IDs for talent)
  const budiProfileId = 'b0000000-0000-0000-0000-000000000007';
  const sintaProfileId = 'b0000000-0000-0000-0000-000000000008';

  const assessments = [
    {
      athleteId: budiProfileId, sportId: 'sepak_bola', levelId: 'sb_u19',
      score: 82,
      dimensions: [
        { dimensionId: 'sb_speed', dimensionName: 'Kecepatan', score: 82,
          items: [{ itemId: 'sb_speed_sprint40', value: 5.3, score: 82 }, { itemId: 'sb_speed_accel10', value: 1.85, score: 78 }] },
        { dimensionId: 'sb_stamina', dimensionName: 'Daya Tahan', score: 90,
          items: [{ itemId: 'sb_stamina_yoyo', value: 17, score: 90 }, { itemId: 'sb_stamina_vo2max', value: 52, score: 88 }] },
        { dimensionId: 'sb_agility', dimensionName: 'Kelincahan', score: 72,
          items: [{ itemId: 'sb_agility_ttest', value: 10.8, score: 72 }, { itemId: 'sb_agility_zigzag', value: 15.2, score: 70 }] },
        { dimensionId: 'sb_technique', dimensionName: 'Teknik', score: 85,
          items: [{ itemId: 'sb_tech_passing', value: 78, score: 82 }, { itemId: 'sb_tech_dribbling', value: 78, score: 85 }] },
      ],
    },
    {
      athleteId: budiProfileId, sportId: 'bulutangkis', levelId: 'bt_u17',
      score: 78,
      dimensions: [
        { dimensionId: 'bt_speed', dimensionName: 'Kecepatan', score: 78,
          items: [{ itemId: 'bt_speed_6point', value: 19.0, score: 78 }, { itemId: 'bt_speed_reaction', value: 255, score: 75 }] },
        { dimensionId: 'bt_stamina', dimensionName: 'Daya Tahan', score: 84,
          items: [{ itemId: 'bt_stamina_multi', value: 12, score: 84 }, { itemId: 'bt_stamina_recovery', value: 26, score: 82 }] },
        { dimensionId: 'bt_agility', dimensionName: 'Kelincahan', score: 70,
          items: [{ itemId: 'bt_agility_shadow', value: 46, score: 70 }, { itemId: 'bt_agility_cod', value: 3.7, score: 72 }] },
        { dimensionId: 'bt_technique', dimensionName: 'Teknik', score: 80,
          items: [{ itemId: 'bt_tech_clear', value: 78, score: 80 }, { itemId: 'bt_tech_dropshot', value: 72, score: 78 }] },
      ],
    },
    {
      athleteId: sintaProfileId, sportId: 'bulutangkis', levelId: 'bt_u17',
      score: 85,
      dimensions: [
        { dimensionId: 'bt_speed', dimensionName: 'Kecepatan', score: 85,
          items: [{ itemId: 'bt_speed_6point', value: 18.2, score: 85 }, { itemId: 'bt_speed_reaction', value: 240, score: 82 }] },
        { dimensionId: 'bt_stamina', dimensionName: 'Daya Tahan', score: 82,
          items: [{ itemId: 'bt_stamina_multi', value: 13, score: 82 }, { itemId: 'bt_stamina_recovery', value: 24, score: 84 }] },
        { dimensionId: 'bt_agility', dimensionName: 'Kelincahan', score: 86,
          items: [{ itemId: 'bt_agility_shadow', value: 42, score: 86 }, { itemId: 'bt_agility_cod', value: 3.4, score: 84 }] },
        { dimensionId: 'bt_technique', dimensionName: 'Teknik', score: 87,
          items: [{ itemId: 'bt_tech_clear', value: 82, score: 87 }, { itemId: 'bt_tech_dropshot', value: 78, score: 85 }] },
      ],
    },
  ];

  for (const a of assessments) {
    await pool.query(
      `INSERT INTO sport_assessments (athlete_id, sport_id, level_id, composite_score, dimension_scores, status, completed_at, valid_until)
       VALUES ($1, $2, $3, $4, $5::jsonb, 'completed', NOW(), NOW() + INTERVAL '6 months')
       ON CONFLICT (athlete_id, sport_id, level_id) DO UPDATE SET composite_score = $4, dimension_scores = $5::jsonb, completed_at = NOW(), valid_until = NOW() + INTERVAL '6 months'`,
      [a.athleteId, a.sportId, a.levelId, a.score, JSON.stringify(a.dimensions)],
    );
  }
  console.log(`  ✓ ${assessments.length} sport assessments`);

  /* ── Career Progress ── */
  const careers = [
    { athleteId: budiProfileId, level: 2, exp: 1450, milestones: '{d0000000-0000-0000-0000-000000000001, d0000000-0000-0000-0000-000000000002}' },
    { athleteId: sintaProfileId, level: 3, exp: 3200, milestones: '{d0000000-0000-0000-0000-000000000001, d0000000-0000-0000-0000-000000000002, d0000000-0000-0000-0000-000000000003}' },
  ];

  for (const c of careers) {
    await pool.query(
      `INSERT INTO career_progress (athlete_id, current_level, total_exp, milestones_reached)
       VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
      [c.athleteId, c.level, c.exp, c.milestones],
    );
  }
  console.log(`  ✓ ${careers.length} career progress`);

  /* ── KYS Vault ── */
  const vaultRecords = [
    { athleteId: budiProfileId, score: 84.0, type: 'speed', hash: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2' },
    { athleteId: budiProfileId, score: 92.0, type: 'stamina', hash: 'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2' },
    { athleteId: budiProfileId, score: 78.0, type: 'agility', hash: 'c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2' },
    { athleteId: sintaProfileId, score: 88.0, type: 'speed', hash: 'd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2' },
    { athleteId: sintaProfileId, score: 85.0, type: 'stamina', hash: 'e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2' },
    { athleteId: sintaProfileId, score: 82.0, type: 'agility', hash: 'f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2' },
  ];

  for (const v of vaultRecords) {
    await pool.query(
      `INSERT INTO kys_vault (athlete_id, verified_score, score_type, audit_hash)
       VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
      [v.athleteId, v.score, v.type, v.hash],
    );
  }
  console.log(`  ✓ ${vaultRecords.length} kys vault records`);

  console.log('\n✅ Seed complete!');
  console.log('\nAkun untuk login:');
  console.log('  admin@sinergi.test / admin123     → Admin');
  console.log('  persija@club.test / club123       → Klub');
  console.log('  scout1@sinergi.test / scout123    → Pencari Bakat');
  console.log('  budi@atlet.test / atlet123        → Talent / Atlet');
  console.log('  pending@club.test / club123       → Klub (pending, belum bisa login)');

  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
