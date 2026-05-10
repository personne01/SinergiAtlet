# Dokumen Arsitektur Teknis & Alur Kerja: SinergiAtlet (v2.0)

## 1. Arsitektur Sistem
SinergiAtlet adalah platform **Sports Talent Ecosystem** yang mengintegrasikan Marketplace SDM dengan validasi kemampuan berbasis AI.

- **Frontend:** Mobile-first React (Vite) dengan Tailwind CSS. Menggunakan sistem navigasi HUD (Heads-Up Display) untuk aksesibilitas cepat di layar sentuh.
- **Backend:** Node.js (Serverless) dengan PostgreSQL sebagai source of truth untuk profil karir, lowongan (jobs), dan riwayat validasi.
- **AI Core (KYS):** MediaPipe (On-Device) tetap menjadi engine utama untuk memproses skeletal tracking saat atlet melakukan tantangan karir.

## 2. Business Logic: Marketplace & Career Path
Pilar utama aplikasi beralih dari sekadar alat ukur menjadi platform karir end-to-end:

### A. Marketplace SDM
- **Lowongan Terverifikasi:** Klub atau akademi dapat mengunggah kebutuhan atlet dengan filter spesifik berdasarkan skor KYS (misal: "Hanya menerima pelamar dengan Speed > 85").
- **Smart Matching:** Algoritma mencocokkan profil atlet dengan lowongan yang sesuai berdasarkan perkembangan karir mereka.

### B. Career Path Algorithm
- **Roadmap Leveling:** Atlet dikategorikan ke dalam tingkatan (Grassroots -> Verified -> Pro -> Elite).
- **Gamifikasi:** Setiap aksi (validasi KYS, melamar kerja, menyelesaikan training) menghasilkan **Experience Points (EXP)** untuk naik level.
- **Digital Badge:** Sertifikasi otomatis diberikan saat atlet mencapai milestone tertentu (misal: "Foundation Badge" setelah verifikasi data fisik).

## 3. Database Schema (Updated)

### Tabel: `Jobs`
- `id` (UUID)
- `title` (String: Posisi yang ditawarkan)
- `org_id` (FK to Organizations)
- `min_kys_requirements` (JSONB: { 'speed': 80, 'stamina': 75 })
- `status` (ENUM: 'open', 'closed', 'expired')

### Tabel: `Career_Progress`
- `id` (UUID)
- `athlete_id` (FK to Profiles)
- `current_level` (Integer)
- `total_exp` (BigInt)
- `milestones_reached` (Array: UUIDs of career steps)

### Tabel: `KYS_Vault`
- `id` (UUID)
- `verified_score` (Float)
- `audit_hash` (String: Hash unik untuk verifikasi integritas data hasil AI)

## 4. Mekanisme KYS (Supporting Feature)
KYS kini berfungsi sebagai **"Gateway to Elite Career"**:
1. Atlet melihat lowongan di Marketplace yang membutuhkan verifikasi ("KYS Required").
2. Atlet masuk ke **Validation Center** untuk melakukan tes via kamera HP.
3. Skor KYS otomatis meng-update "Skill Card" di profil dan membuka kunci (unlock) tombol "Apply" pada lowongam tertentu.

## 5. Security & Anti-Cheat
- **On-Device Audit:** Metadata sensor (gyro/accel) dikirim bersamaan dengan vektor skeletal untuk memastikan video diambil secara langsung.
- **System Signing:** Hasil KYS ditandatangani secara digital oleh server agar tidak bisa dimodifikasi oleh client-side hacking.
