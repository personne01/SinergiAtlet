<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# SinergiAtlet

**Sports Talent Ecosystem** — Marketplace SDM dengan validasi kemampuan berbasis AI dan on-device MediaPipe pose analysis.

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | React 19 + Vite 6 + TypeScript + Tailwind CSS 4 |
| **Routing** | React Router 7 |
| **Animation** | Motion (Framer Motion) |
| **Icons** | Lucide React |
| **Backend** | Express 4 + TypeScript (tsx) |
| **Database** | Firebase Firestore (NoSQL) |
| **AI/ML** | MediaPipe Pose Landmarker (on-device, browser-based) |
| **Auth** | Firebase Auth (optional logic) / Custom JWT + Firestore |
| **Testing** | Vitest + React Testing Library + jsdom |
| **Linting** | ESLint 9 (flat config) + Prettier |
| **Deployment** | Firebase Hosting (FE) + Cloud Run (BE) + Firestore (DB) |

---

## Prerequisites

- **Node.js** >= 18

---

## Setup

```bash
# 1. Install dependencies
npm install
```

Sistem database sekarang menggunakan **Firebase Firestore**. 
Pastikan file `firebase-applet-config.json` sudah ada di root folder (di-generate via Firebase provisioning).

Isi `.env`:
```
GEMINI_API_KEY="your-gemini-api-key"
JWT_SECRET="your-jwt-secret-change-in-production"
```

```bash
# 2. Test Firebase Connection
npm run migrate

# 3. Seed initial data to Firestore
npm run seed
```

---

## Database Structure (Firestore Collections)

### Entity Relationship

```
organizations                    users
│                                │
└── profiles (org_id) ────────── profiles (user_id)
                                     │
                ┌────────────────────┼────────────────────┐
                │                    │                    │
         career_progress      sport_assessments      kys_vault
         (athlete_id)          (athlete_id)           (athlete_id)

jobs (org_id) → organizations
```

### Collections

| Collection | Key Fields | Purpose |
|-------|-------------|---------|
| `organizations` | id, name, slug, type, location, verified | Klub, akademi, training center |
| `users` | id, email, password_hash, role, status, full_name, approved_by | Semua user (4 role) |
| `profiles` | id, user_id, org_id, sport_type, position, phone, bio | Data tambahan per user |
| `jobs` | id, title, org_id, type, location, description, min_kys_requirements, sport_id | Lowongan pekerjaan |
| `sport_assessments` | athlete_id, sport_id, composite_score, dimension_scores | Hasil KYS assessment |
| `career_progress` | id, athlete_id, current_level, total_exp, milestones_reached | Progres karir talent |
| `kys_vault` | id, athlete_id, verified_score, score_type, audit_hash | Riwayat score KYS |

---

## User Roles

| Role | Display Name | Redirect After Login | Auto-approved? |
|------|-------------|---------------------|----------------|
| `admin` | Admin | `/admin/users` | — |
| `klub` | Klub | `/club/dashboard` | ❌ (pending → approve admin) |
| `pencari_bakat` | Pencari Bakat | `/club/dashboard` | ❌ (pending → approve admin) |
| `talent` | Talent / Atlet | `/market` | ✅ langsung aktif |

### Status Account

- `active` — dapat login
- `pending` — menunggu persetujuan admin
- `suspended` — dinonaktifkan

---

## Auth System

- **Register** → POST `/api/auth/register` → bcrypt hash → JWT (7d expiry)
- **Login** → POST `/api/auth/login` → verify password → return `{ user, token }`
- **Token** → localStorage (`auth_token`), dikirim via `Authorization: Bearer`
- **401** → API client otomatis clear token + redirect ke `/login`
- **Route protection** — `ProtectedRoute` component dengan `requiredRole`

### Admin Approval Flow

1. User daftar sebagai `klub` / `pencari_bakat` → status `pending`
2. Admin login → `/admin/users` → lihat daftar pending
3. Admin klik **Approve** → status jadi `active`
4. User bisa login

---

## Seed Data

```bash
npm run seed
```

### Akun Login

| Email | Password | Role | Status |
|-------|----------|------|--------|
| `admin@sinergi.test` | `admin123` | Admin | ✅ Aktif |
| `superadmin@sinergi.test` | `admin123` | Admin | ✅ Aktif |
| `persija@club.test` | `club123` | Klub | ✅ Aktif |
| `djarum@club.test` | `club123` | Klub | ✅ Aktif |
| `scout1@sinergi.test` | `scout123` | Pencari Bakat | ✅ Aktif |
| `scout2@sinergi.test` | `scout123` | Pencari Bakat | ✅ Aktif |
| `budi@atlet.test` | `atlet123` | Talent | ✅ Aktif |
| `sinta@atlet.test` | `atlet123` | Talent | ✅ Aktif |
| `pending@club.test` | `club123` | Klub | ⏳ Pending |

### Data yang di-seed

| Tabel | Jumlah | Detail |
|-------|--------|--------|
| `organizations` | 4 | Persija Academy, PB Djarum, Bali United Youth, Elite Sport Center |
| `users` | 9 | 2 admin, 2 klub, 2 pencari_bakat, 2 talent, 1 pending |
| `profiles` | 9 | Relasi user → organization |
| `jobs` | 3 | Penyerang U-19, Gelandang, Atlet Bulutangkis |
| `sport_assessments` | 3 | Budi (2 assessment), Sinta (1) |
| `career_progress` | 2 | Budi level 2, Sinta level 3 |
| `kys_vault` | 6 | 3 score type per talent (speed, stamina, agility) |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Frontend only (Vite, port 3000) |
| `npm run dev:server` | Backend only (Express, port 4000) |
| `npm run dev:all` | Frontend + Backend concurrently |
| `npm run build` | Build frontend for production |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint check (src/ + server/) |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check formatting |
| `npm run typecheck` | TypeScript type check |
| `npm run test` | Run tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run migrate` | Run database migrations |
| `npm run seed` | Seed dummy data |
| `npm run clean` | Remove dist/ |

---

## Architecture

```
sinergi-atlet/
├── src/                      # Frontend (React + Vite)
│   ├── components/
│   │   ├── auth/             # ProtectedRoute
│   │   ├── career/           # CareerStepper
│   │   ├── jobs/             # JobCard, JobFilters
│   │   ├── kys/              # KYS assessment components (8)
│   │   └── layout/           # Sidebar, Navbar, BottomNav, Footer
│   ├── contexts/             # AuthContext
│   ├── data/                 # Mock data, sports catalog
│   ├── hooks/                # useJobs, useKYSScore, useMediaPipe, dll
│   ├── lib/                  # api.ts, mediapipe.ts, pose.ts, scoring.ts
│   ├── pages/                # Market, Career, KYS, Club, Admin pages
│   ├── types/                # TypeScript interfaces
│   ├── utils/                # cn.ts (clsx wrapper)
│   ├── __tests__/            # Test setup & test files
│   └── styles/               # globals.css
│
├── server/                   # Backend (Express + TypeScript)
│   ├── config/               # firebase.ts (Firebase init)
│   ├── controllers/          # auth, jobs, kys, career controllers
│   ├── db/                   # migrate.ts + seed.ts
│   ├── middleware/            # auth (JWT), errorHandler, logger
│   ├── routes/               # auth, jobs, kys, career routes
│   ├── services/             # Business logic layer
│   ├── types/                # Server-side interfaces
│   ├── app.ts                # Express app
│   └── index.ts              # Server entry point
│
├── eslint.config.js          # ESLint flat config
├── .prettierrc               # Prettier config
├── tsconfig.json             # Frontend TypeScript config
├── tsconfig.server.json      # Backend TypeScript config
└── vite.config.ts            # Vite config
```

### Backend 3-Layer Pattern

```
Routes (routing only)
  → Controllers (parse request, format response)
    → Services (business logic, database queries)
```

---

## KYS — AI Assessment Flow

1. **Select Sport** → pilih cabang olahraga
2. **Select Drill** → pilih gerakan yang akan di-rekam
3. **Record Video** → countdown 3-2-1 → rekam 15-30 detik via webcam
4. **AI Analysis** → MediaPipe Pose Landmarker mengekstrak landmark tubuh di 1fps
5. **Metrics** → hitung speed, agility, technique, power dari landmark
6. **Score** → normalisasi 0-100 berdasarkan reference value per drill

> Semua processing di **on-device** (browser). Tidak ada video yang dikirim ke server.

---

## Routes

| Path | Access | Description |
|------|--------|-------------|
| `/login` | Public | Login page (semua role) |
| `/register` | Public | Register talent baru |
| `/market` | Public | Marketplace lowongan |
| `/career` | Talent, Admin | Career path & milestones |
| `/kys` | Talent, Admin | KYS assessment center |
| `/apply/:jobId` | Talent, Admin | Form apply lowongan |
| `/club/dashboard` | Klub, Pencari Bakat, Admin | Dashboard klub |
| `/club/post` | Klub, Pencari Bakat, Admin | Posting lowongan baru |
| `/admin/users` | Admin | Approve/reject pending users |
| `/profile` | Authenticated | Profile (placeholder) |
| `/settings` | Authenticated | Settings (placeholder) |

---

## Deployment

- **Frontend:** Firebase Hosting
- **Backend:** Google Cloud Run
- **Database:** Firebase Firestore
