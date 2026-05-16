# Dokumen Arsitektur Teknis & Alur Kerja: SinergiAtlet (v2.0)

## 1. Arsitektur Sistem
SinergiAtlet adalah platform **Sports Talent Ecosystem** yang mengintegrasikan Marketplace SDM dengan validasi kemampuan berbasis AI.

- **Frontend:** Mobile-first React (Vite) dengan Tailwind CSS. Menggunakan sistem navigasi hybrid (Bottom HUD mobile + Sidebar desktop).
- **Backend:** Node.js (Express/Serverless) dengan PostgreSQL sebagai source of truth untuk profil karir, lowongan (jobs), dan riwayat validasi.
- **AI Core (KYS):** MediaPipe (On-Device) tetap menjadi engine utama untuk memproses skeletal tracking saat atlet melakukan tantangan karir.

## 2. Business Logic: Marketplace & Career Path

### A. Marketplace SDM — Filter & KYS Gateway

- **Lowongan Terverifikasi:** Klub atau akademi dapat mengunggah kebutuhan atlet dengan filter spesifik berdasarkan skor KYS.
- **KYS Required System:** Lowongan tertentu memiliki badge "KYS Verified Only" yang memaksa atlet melakukan validasi AI sebelum melamar.
- **KYS Score Matching:** Setiap lowongan dengan KYS Required memiliki threshold skor (e.g. `Speed > 80`, `Stamina > 90`, `Avg > 82`).
  - Jika skor KYS atlet >= threshold → tombol "Lamar" aktif.
  - Jika skor KYS atlet < threshold → tombol menjadi "KYS Dulu" (disabled) dengan tooltip informasi.
- **Search & Filter:** Pencarian berdasarkan nama/org/lokasi + filter berdasarkan tipe lowongan (Beasiswa, Kontrak, Try-out) dan status KYS.
- **Bento Grid:** Layout adaptif (1 kolom mobile, 2 tablet, 3 desktop XL) dengan featured job span 2 kolom.

### B. Career Path Algorithm — Leveling & Milestone

- **5-Level Roadmap:** Grassroots (L1) → Verified Prospect (L2) → Regional Contender (L3) → Professional Debut (L4) → Elite National (L5).
- **EXP System:** Setiap aksi menghasilkan EXP:
  - Registrasi & lengkapi profil → 500 EXP
  - KYS Speed/Stamina/Agility test → 300 EXP masing-masing
  - Melamar pekerjaan → 100 EXP
  - Challenge selesai → 200 EXP
- **Level Thresholds:**
  - L1: 0 EXP (auto)
  - L2: 1,000 EXP
  - L3: 3,000 EXP
  - L4: 7,000 EXP
  - L5: 15,000 EXP
- **Milestone Tracking:** Setiap level memiliki milestone checklist (e.g. "KYS Speed Test", "3 Lamar Kerja Dikirim").
  - Progress per level ditampilkan dalam persentase.
  - Milestone selesai → icon check hijau.
  - Milestone belum → icon circle abu-abu.
- **Digital Badge:** Sertifikasi otomatis diberikan saat atlet mencapai milestone tertentu.

### C. KYS Validation Center — Badge & Certification Gateway

KYS berfungsi sebagai **"Gateway to Elite Career"** dengan sistem badge multi-tier:

1. **Skill Badges:**
   - Foundation Badge — profil lengkap
   - Speed Validated — KYS Speed ≥ 70
   - Stamina Elite — KYS Stamina ≥ 85
   - Agility Challenger — KYS Agility ≥ 85
   - Verified Athlete — semua 3 tes KYS selesai
   - Regional Star — level Regional Contender
   - Elite Athlete — rata-rata KYS ≥ 90

2. **Marketplace Certifications:**
   - Speed License → akses lowongan speed
   - Stamina Certification → akses lowongan endurance
   - Agility Badge → akses lowongan agility
   - All-Rounder Elite → akses semua lowongan KYS

3. **Gateway Flow:**
   1. Atlet melihat lowongan di Marketplace dengan badge "KYS Locked"
   2. Atlet masuk ke Validation Center untuk AI scan
   3. Skor KYS meng-update Skill Card dan unlock badge
   4. Badge yang ter-unlock membuka akses ke lowongan terkait
   5. Tombol "Lamar" aktif pada lowongan yang memenuhi syarat

## 3. User Interface — Hybrid Navigation

| Device | Navigation | Layout |
|--------|-----------|--------|
| Mobile (< 1024px) | Bottom HUD (3 tabs) | Full-width, compact typography |
| Desktop (≥ 1024px) | Fixed sidebar (220px) | Content shifted right, max-w-5xl |

## 4. Database Schema

### Tabel: `organizations`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID PK | |
| name | VARCHAR(255) | Nama klub/akademi |
| slug | VARCHAR(255) UNIQUE | |
| type | VARCHAR(50) | club / academy / training_center |
| logo_url | TEXT | |
| location | VARCHAR(255) | |
| verified | BOOLEAN | Status verifikasi organisasi |

### Tabel: `users`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID PK | |
| email | VARCHAR(255) UNIQUE | |
| password_hash | VARCHAR(255) | |
| role | VARCHAR(20) | athlete / org_admin / admin |
| full_name | VARCHAR(255) | |

### Tabel: `profiles`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID PK | |
| user_id | UUID FK → users | |
| org_id | UUID FK → organizations | |
| sport_type | VARCHAR(100) | Cabang olahraga |
| position | VARCHAR(100) | Posisi atlet |

### Tabel: `jobs`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID PK | |
| title | VARCHAR(255) | Posisi yang ditawarkan |
| org_id | UUID FK → organizations | |
| type | VARCHAR(50) | Beasiswa / Kontrak / Try-out |
| min_kys_requirements | JSONB | `{ "speed": 80, "stamina": 75 }` |
| status | VARCHAR(20) | open / closed / expired |
| salary_range | VARCHAR(100) | |
| deadline | TIMESTAMPTZ | |

### Tabel: `career_progress`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID PK | |
| athlete_id | UUID FK → profiles | |
| current_level | INTEGER | Level saat ini (1-5) |
| total_exp | BIGINT | Akumulasi EXP |
| milestones_reached | UUID[] | ID milestone yang dicapai |

### Tabel: `kys_vault`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID PK | |
| athlete_id | UUID FK → profiles | |
| verified_score | DECIMAL(5,2) | Skor tervalidasi |
| score_type | VARCHAR(50) | speed / stamina / agility |
| audit_hash | VARCHAR(64) | Hash verifikasi integritas |
| session_metadata | JSONB | Data sensor (gyro/accel) |

## 5. Security & Anti-Cheat

- **On-Device Audit:** Metadata sensor (gyro/accel) dikirim bersamaan dengan vektor skeletal untuk memastikan video diambil secara langsung.
- **System Signing:** Hasil KYS ditandatangani secara digital oleh server agar tidak bisa dimodifikasi oleh client-side hacking.
- **Score Threshold:** Setiap lowongan KYS memiliki threshold yang dicek server-side sebelum mengaktifkan tombol "Lamar".

## 6. File Structure (Frontend)

```
src/
├── components/
│   ├── layout/         # Navbar, Sidebar, BottomNav, SystemFooter
│   ├── jobs/           # JobCard, JobFilters
│   ├── career/         # CareerStepper (milestone + leveling)
│   └── kys/            # KYSWidget (scores + badge + gateway)
├── pages/              # MarketPage, CareerPage, KYSPage
├── hooks/              # useJobs, useCareerProgress, useKYSScore, useBadges
├── data/mock.ts        # Mock data (jobs, career path, badges, certifications)
├── types/index.ts      # TypeScript interfaces
├── lib/api.ts          # API client (fetch with fallback to mock)
├── App.tsx             # Router + hybrid layout
└── main.tsx            # Entry point
```

## 7. Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 19, Vite 6, Tailwind CSS 4, React Router 7, Motion |
| Backend | Node.js, Express, TypeScript, tsx |
| Database | PostgreSQL 15+, pg (node-postgres) |
| AI | MediaPipe (on-device skeletal tracking) |
| Deployment | Firebase Hosting, Cloud Run, Cloud SQL |
