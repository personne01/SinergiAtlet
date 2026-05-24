import type { Job, CareerLevel, KYSScore, Badge, Certification, SportAssessment } from '../types';

export const JOBS: Job[] = [
  {
    id: 'j1',
    title: 'Penyerang Utama (U-19)',
    organization: 'Persija Academy',
    type: 'Beasiswa Penuh',
    location: 'Jakarta',
    criteria: 'KYS Agility > 85',
    criteriaType: 'kys_agility',
    criteriaValue: 85,
    isKYSRequired: true,
    featured: true,
    sportId: 'sepak_bola',
    skillRequirements: [
      { dimensionId: 'sb_agility', dimensionName: 'Kelincahan', minScore: 85, checklist: [
        { itemId: 'sb_agility_ttest', label: 'T-Test', minValue: 10.0, weight: 1.0 },
        { itemId: 'sb_agility_zigzag', label: 'Zig-Zag Run', minValue: 14.0, weight: 0.8 },
      ]},
      { dimensionId: 'sb_technique', dimensionName: 'Teknik', minScore: 75, checklist: [
        { itemId: 'sb_tech_passing', label: 'Passing Accuracy', minValue: 70, weight: 0.7 },
      ]},
    ],
  },
  {
    id: 'j2',
    title: 'Asisten Pelatih Fisik',
    organization: 'Elite Sport Center',
    type: 'Kontrak',
    location: 'Bandung',
    criteria: 'Sertifikat AFC/PSSI',
    criteriaType: 'sertifikat',
    isKYSRequired: false,
  },
  {
    id: 'j3',
    title: 'Gelandang Bertahan',
    organization: 'Bali United Youth',
    type: 'Try-out',
    location: 'Gianyar',
    criteria: 'KYS Stamina > 90',
    criteriaType: 'kys_stamina',
    criteriaValue: 90,
    isKYSRequired: true,
    sportId: 'sepak_bola',
    skillRequirements: [
      { dimensionId: 'sb_stamina', dimensionName: 'Daya Tahan', minScore: 90, checklist: [
        { itemId: 'sb_stamina_yoyo', label: 'Yo-Yo Test IR1', minValue: 16, weight: 1.0 },
        { itemId: 'sb_stamina_vo2max', label: 'Estimasi VO2Max', minValue: 50, weight: 0.6 },
      ]},
      { dimensionId: 'sb_speed', dimensionName: 'Kecepatan', minScore: 75, checklist: [
        { itemId: 'sb_speed_sprint40', label: 'Sprint 40 meter', minValue: 5.5, weight: 0.8 },
      ]},
    ],
  },
  {
    id: 'j4',
    title: 'Program Beasiswa Atlet Muda',
    organization: 'KONI Pusat',
    type: 'Beasiswa',
    location: 'Jakarta',
    criteria: 'Usia 15-18 tahun',
    criteriaType: 'usia',
    isKYSRequired: false,
    featured: true,
  },
  {
    id: 'j5',
    title: 'Pelatih Teknik (Soccer)',
    organization: 'SSB Tunas Muda',
    type: 'Kontrak',
    location: 'Surabaya',
    criteria: 'Lisensi C PSSI',
    criteriaType: 'sertifikat',
    isKYSRequired: false,
  },
  {
    id: 'j6',
    title: 'Sport Scientist',
    organization: 'Elite Sport Center',
    type: 'Full-time',
    location: 'Bandung',
    criteria: 'KYS Speed > 75',
    criteriaType: 'kys_speed',
    criteriaValue: 75,
    isKYSRequired: true,
  },
  {
    id: 'j7',
    title: 'Atlet Junior Bulutangkis',
    organization: 'PB Djarum',
    type: 'Beasiswa Penuh',
    location: 'Kudus',
    criteria: 'KYS Speed > 80',
    criteriaType: 'kys_speed',
    criteriaValue: 80,
    isKYSRequired: true,
    sportId: 'bulutangkis',
    skillRequirements: [
      { dimensionId: 'bt_speed', dimensionName: 'Kecepatan', minScore: 80, checklist: [
        { itemId: 'bt_speed_6point', label: '6-Point Footwork', minValue: 19.0, weight: 1.0 },
        { itemId: 'bt_speed_reaction', label: 'Reaction Time', minValue: 250, weight: 0.7 },
      ]},
      { dimensionId: 'bt_technique', dimensionName: 'Teknik', minScore: 72, checklist: [
        { itemId: 'bt_tech_clear', label: 'Clear Accuracy', minValue: 70, weight: 0.8 },
      ]},
    ],
  },
  {
    id: 'j8',
    title: 'Gelandang Serang',
    organization: 'PSM Makassar U-20',
    type: 'Try-out',
    location: 'Makassar',
    criteria: 'KYS Avg > 82',
    criteriaType: 'kys_avg',
    criteriaValue: 82,
    isKYSRequired: true,
    sportId: 'sepak_bola',
    skillRequirements: [
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
  },
  {
    id: 'j9',
    title: 'Atlet Taekwondo Junior',
    organization: 'PB TI',
    type: 'Beasiswa Penuh',
    location: 'Jakarta',
    criteria: 'Usia 12-15 tahun',
    criteriaType: 'usia',
    isKYSRequired: false,
  },
];

export const SPORT_IDS = ['sepak_bola', 'bulutangkis', 'taekwondo'] as const;

export const JOB_TYPES = ['Beasiswa Penuh', 'Kontrak', 'Try-out', 'Beasiswa', 'Full-time'] as const;

export const CAREER_PATH: CareerLevel[] = [
  {
    id: 'c1',
    level: 1,
    title: 'Grassroots Talent',
    status: 'completed',
    description: 'Memasuki akademi lokal dan membangun data fisik dasar.',
    badge: 'Foundation',
    expRequired: 0,
    milestones: [
      { id: 'm1', label: 'Registrasi Akun', completed: true },
      { id: 'm2', label: 'Data Fisik Lengkap', completed: true },
      { id: 'm3', label: '1 Latihan Tercatat', completed: true },
    ],
  },
  {
    id: 'c2',
    level: 2,
    title: 'Verified Prospect',
    status: 'completed',
    description: 'Melakukan KYS pertama dan divalidasi oleh AI system.',
    badge: 'Verified',
    expRequired: 1000,
    milestones: [
      { id: 'm4', label: 'KYS Speed Test', completed: true },
      { id: 'm5', label: 'KYS Stamina Test', completed: true },
      { id: 'm6', label: 'KYS Agility Test', completed: true },
      { id: 'm7', label: 'Profil 80% Lengkap', completed: true },
    ],
  },
  {
    id: 'c3',
    level: 3,
    title: 'Regional Contender',
    status: 'current',
    description: 'Mengikuti seleksi tingkat regional dan masuk papan peringkat.',
    badge: 'Regional',
    expRequired: 3000,
    milestones: [
      { id: 'm8', label: 'Top 10 Regional', completed: true },
      { id: 'm9', label: '3 Lamar Kerja Dikirim', completed: false },
      { id: 'm10', label: 'Skor KYS Rata-rata > 80', completed: true },
      { id: 'm11', label: 'Sertifikat 1 Dicapai', completed: false },
    ],
  },
  {
    id: 'c4',
    level: 4,
    title: 'Professional Debut',
    status: 'locked',
    description: 'Mendapat kontrak pertama melalui Marketplace SDM.',
    expRequired: 7000,
    milestones: [
      { id: 'm12', label: 'Kontrak Pertama', completed: false },
      { id: 'm13', label: '100 EXP dari Challenge', completed: false },
      { id: 'm14', label: '5 KYS Tervalidasi', completed: false },
      { id: 'm15', label: 'Badge Elite Didapat', completed: false },
    ],
  },
  {
    id: 'c5',
    level: 5,
    title: 'Elite National',
    status: 'locked',
    description: 'Mencapai skor KYS rata-rata di atas 95 dan terpanggil ke pelatnas.',
    expRequired: 15000,
    milestones: [
      { id: 'm16', label: 'Skor KYS Rata-rata > 90', completed: false },
      { id: 'm17', label: 'Peringkat 1 Regional', completed: false },
      { id: 'm18', label: '20+ Lamaran Terkirim', completed: false },
      { id: 'm19', label: 'Dipanggil Pelatnas', completed: false },
    ],
  },
];

export const KYS_SCORES: KYSScore = {
  speed: 84,
  stamina: 92,
  agility: 78,
};

export const CAREER_EXP = {
  current: 1450,
  next: 3000,
  level: 'Verified Prospect',
  overallProgress: 32,
};

export const KYS_ACCESS: Record<string, boolean> = {
  j1: false,  // Agility > 85  → user has 78
  j3: true,   // Stamina > 90  → user has 92
  j6: true,   // Speed > 75    → user has 84
  j7: true,   // Speed > 80    → user has 84
  j8: false,  // Avg > 82      → avg is 84.7
};

export const BADGES_DATA: Badge[] = [
  {
    id: 'b1',
    name: 'Foundation',
    description: 'Data fisik dasar atlet terverifikasi',
    type: 'foundation',
    earned: true,
    earnedDate: '01 Sep 2023',
    icon: 'award',
    requirement: 'Lengkapi profil & daftar di akademi',
  },
  {
    id: 'b2',
    name: 'Speed Validated',
    description: 'Kecepatan sprint tervalidasi AI',
    type: 'kys_speed',
    earned: true,
    earnedDate: '15 Sep 2023',
    icon: 'zap',
    requirement: 'KYS Speed score ≥ 70',
  },
  {
    id: 'b3',
    name: 'Stamina Elite',
    description: 'Daya tahan fisik level elite',
    type: 'kys_stamina',
    earned: true,
    earnedDate: '01 Okt 2023',
    icon: 'heart',
    requirement: 'KYS Stamina score ≥ 85',
  },
  {
    id: 'b4',
    name: 'Agility Challenger',
    description: 'Kelincahan atlet teruji',
    type: 'kys_agility',
    earned: false,
    icon: 'target',
    requirement: 'KYS Agility score ≥ 85 (current: 78)',
  },
  {
    id: 'b5',
    name: 'Verified Athlete',
    description: 'Status verified setelah 3 KYS test',
    type: 'verified',
    earned: true,
    earnedDate: '01 Nov 2023',
    icon: 'shield',
    requirement: 'Selesaikan semua 3 tes KYS',
  },
  {
    id: 'b6',
    name: 'Regional Star',
    description: 'Masuk top 10 peringkat regional',
    type: 'regional',
    earned: false,
    icon: 'star',
    requirement: 'Capai level Regional Contender',
  },
  {
    id: 'b7',
    name: 'Elite Athlete',
    description: 'Skor KYS rata-rata di atas 90',
    type: 'elite',
    earned: false,
    icon: 'trophy',
    requirement: 'KYS Average score ≥ 90 (current: 84.7)',
  },
];

export const CERTIFICATIONS: Certification[] = [
  {
    id: 'cert1',
    name: 'Speed License',
    description: 'Akses ke lowongan dengan syarat kecepatan minimal',
    unlocked: true,
    unlockDate: '15 Sep 2023',
    requiredScore: 70,
  },
  {
    id: 'cert2',
    name: 'Stamina Certification',
    description: 'Akses ke lowongan endurance & daya tahan',
    unlocked: true,
    unlockDate: '01 Okt 2023',
    requiredScore: 85,
  },
  {
    id: 'cert3',
    name: 'Agility Badge',
    description: 'Akses ke lowongan dengan syarat kelincahan',
    unlocked: false,
    requiredScore: 85,
  },
  {
    id: 'cert4',
    name: 'All-Rounder Elite',
    description: 'Akses ke semua lowongan KYS Verified',
    unlocked: false,
    requiredScore: 90,
  },
];

export const BADGES = [
  { label: 'Top 5% Agility Nasional', date: '12 Okt 2023', score: '8.4s', type: 'agility' },
  { label: 'Stamina Endurance Elite', date: '01 Nov 2023', score: '92.4', type: 'stamina' },
  { label: 'Speed Demon', date: '15 Nov 2023', score: '84.0', type: 'speed' },
];

export const SPORT_ASSESSMENTS: SportAssessment[] = [
  {
    id: 'sa1',
    sportId: 'sepak_bola',
    status: 'completed',
    compositeScore: 82,
    completedAt: '10 Mei 2026',
    validUntil: '10 Nov 2026',
    dimensionScores: [
      {
        dimensionId: 'sb_speed',
        dimensionName: 'Kecepatan',
        score: 82,
        items: [
          { itemId: 'sb_speed_sprint40', value: 5.3, score: 82 },
          { itemId: 'sb_speed_accel10', value: 1.85, score: 78 },
        ],
      },
      {
        dimensionId: 'sb_stamina',
        dimensionName: 'Daya Tahan',
        score: 90,
        items: [
          { itemId: 'sb_stamina_yoyo', value: 17, score: 90 },
          { itemId: 'sb_stamina_vo2max', value: 52, score: 88 },
        ],
      },
      {
        dimensionId: 'sb_agility',
        dimensionName: 'Kelincahan',
        score: 72,
        items: [
          { itemId: 'sb_agility_ttest', value: 10.8, score: 72 },
          { itemId: 'sb_agility_zigzag', value: 15.2, score: 70 },
        ],
      },
      {
        dimensionId: 'sb_technique',
        dimensionName: 'Teknik',
        score: 85,
        items: [
          { itemId: 'sb_tech_passing', value: 78, score: 82 },
          { itemId: 'sb_tech_dribbling', value: 78, score: 85 },
        ],
      },
    ],
  },
  {
    id: 'sa2',
    sportId: 'bulutangkis',
    status: 'completed',
    compositeScore: 78,
    completedAt: '12 Mei 2026',
    validUntil: '12 Nov 2026',
    dimensionScores: [
      {
        dimensionId: 'bt_speed',
        dimensionName: 'Kecepatan',
        score: 78,
        items: [
          { itemId: 'bt_speed_6point', value: 19.0, score: 78 },
          { itemId: 'bt_speed_reaction', value: 255, score: 75 },
        ],
      },
      {
        dimensionId: 'bt_stamina',
        dimensionName: 'Daya Tahan',
        score: 84,
        items: [
          { itemId: 'bt_stamina_multi', value: 12, score: 84 },
          { itemId: 'bt_stamina_recovery', value: 26, score: 82 },
        ],
      },
      {
        dimensionId: 'bt_agility',
        dimensionName: 'Kelincahan',
        score: 70,
        items: [
          { itemId: 'bt_agility_shadow', value: 46, score: 70 },
          { itemId: 'bt_agility_cod', value: 3.7, score: 72 },
        ],
      },
      {
        dimensionId: 'bt_technique',
        dimensionName: 'Teknik',
        score: 80,
        items: [
          { itemId: 'bt_tech_clear', value: 78, score: 80 },
          { itemId: 'bt_tech_dropshot', value: 72, score: 78 },
        ],
      },
    ],
  },
  {
    id: 'sa3',
    sportId: 'taekwondo',
    status: 'not_started',
    compositeScore: 0,
    dimensionScores: [],
  },
];
