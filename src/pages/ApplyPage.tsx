import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowLeft, Send, User, Phone, Mail, FileText, CheckCircle, ShieldAlert, Cpu, 
  Lock, Sparkles, Trophy, Calendar, FileUp, Award, ExternalLink, AlertCircle, RefreshCw
} from 'lucide-react';
import { JOBS, SPORT_ASSESSMENTS } from '../data/mock';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import type { Job, SportAssessment } from '../types';

interface RawJobResponse {
  id: string;
  title: string;
  type: string;
  organization?: string | { id: string; name: string };
  location?: string;
  criteria?: string;
  criteriaType?: Job['criteriaType'];
  criteria_type?: Job['criteriaType'];
  criteriaValue?: number;
  criteria_value?: number;
  salary?: string;
  salary_range?: string;
  isKYSRequired?: boolean;
  is_kys_required?: boolean;
  featured?: boolean;
  sportId?: string;
  sport_id?: string;
  skillRequirements?: Job['skillRequirements'];
  skill_requirements?: Job['skillRequirements'];
}

function normalizeJob(raw: RawJobResponse): Job {
  return {
    id: raw.id,
    title: raw.title,
    type: raw.type,
    organization: typeof raw.organization === 'object' && raw.organization
      ? raw.organization.name
      : (raw.organization as string) || '',
    location: raw.location || '',
    criteria: raw.criteria || '',
    criteriaType: raw.criteriaType || raw.criteria_type || 'kys_speed',
    criteriaValue: raw.criteriaValue !== undefined ? raw.criteriaValue : raw.criteria_value,
    salary: raw.salary || raw.salary_range,
    isKYSRequired: raw.isKYSRequired ?? raw.is_kys_required ?? false,
    featured: raw.featured,
    sportId: raw.sportId || raw.sport_id,
    skillRequirements: raw.skillRequirements || raw.skill_requirements,
  };
}

interface RawAssessmentResponse {
  id: string;
  sport_id?: string;
  sportId?: string;
  status?: 'not_started' | 'in_progress' | 'completed';
  composite_score?: number | string;
  compositeScore?: number;
  dimension_scores?: any[];
  dimensionScores?: any[];
  completed_at?: string;
  completedAt?: string;
  valid_until?: string;
  validUntil?: string;
}

function normalizeAssessment(raw: RawAssessmentResponse): SportAssessment {
  return {
    id: raw.id,
    sportId: raw.sport_id || raw.sportId || '',
    status: raw.status || 'not_started',
    compositeScore: Number(raw.composite_score ?? raw.compositeScore ?? 0),
    dimensionScores: raw.dimension_scores || raw.dimensionScores || [],
    completedAt: raw.completed_at
      ? new Date(raw.completed_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      : raw.completedAt,
    validUntil: raw.valid_until
      ? new Date(raw.valid_until).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      : raw.validUntil,
  };
}

export default function ApplyPage() {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState<Job | null>(() => JOBS.find((j) => j.id === jobId) || null);
  const [loading, setLoading] = useState(!job);
  const [error, setError] = useState<string | null>(null);

  const [assessments, setAssessments] = useState<SportAssessment[]>([]);
  const [checkingKys, setCheckingKys] = useState(!!user?.id);

  const [form, setForm] = useState({
    name: user?.fullName || '',
    email: user?.email || '',
    phone: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const [certificationName, setCertificationName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [ageValue, setAgeValue] = useState('');
  const [customCriteriaResponses, setCustomCriteriaResponses] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user?.id) {
      return;
    }
    api.get<RawAssessmentResponse[]>(`/kys/assessments/${user.id}`)
      .then((data) => {
        if (data && data.length > 0) {
          setAssessments(data.map(normalizeAssessment));
        } else {
          setAssessments(SPORT_ASSESSMENTS);
        }
        setCheckingKys(false);
      })
      .catch(() => {
        setAssessments(SPORT_ASSESSMENTS);
        setCheckingKys(false);
      });
  }, [user]);

  const checkKysStatus = useMemo(() => {
    if (!job) return { isConforming: true, reason: '' };
    if (!job.isKYSRequired) return { isConforming: true, reason: '' };
    if (user?.role !== 'talent') return { isConforming: true, reason: '' }; // only athletes are restricted
    if (!job.sportId) return { isConforming: true, reason: '' };

    const userAssessment = assessments.find(
      (a) => a.sportId === job.sportId && a.status === 'completed'
    );

    const sportMap: Record<string, string> = {
      sepak_bola: 'Sepak Bola',
      bulutangkis: 'Bulutangkis',
      taekwondo: 'Taekwondo'
    };
    const sportName = sportMap[job.sportId] || job.sportId;

    if (!userAssessment) {
      return {
        isConforming: false,
        reason: `Anda belum menyelesaikan/memiliki hasil validasi KYS untuk cabang olahraga ${sportName}.`
      };
    }

    if (job.skillRequirements && job.skillRequirements.length > 0) {
      for (const req of job.skillRequirements) {
        const ds = userAssessment.dimensionScores?.find((d) => d.dimensionId === req.dimensionId);
        if (!ds) {
          return {
            isConforming: false,
            reason: `Hasil KYS Anda belum memiliki nilai dimensi ${req.dimensionName} yang diperlukan.`
          };
        }
        if (ds.score < req.minScore) {
          return {
            isConforming: false,
            reason: `Hasil KYS Anda untuk dimensi ${req.dimensionName} (${ds.score}) belum memenuhi nilai minimum yang dipersyaratkan (${req.minScore}).`
          };
        }
      }
    }

    if (job.criteriaType && job.criteriaValue !== undefined) {
      const scoreType = job.criteriaType;
      const requiredVal = job.criteriaValue;

      if (scoreType === 'kys_speed') {
        const speedScore = userAssessment.dimensionScores?.find(d => d.dimensionId.includes('speed') || d.dimensionId.includes('kecepatan'))?.score ?? userAssessment.compositeScore;
        if (speedScore < requiredVal) {
          return {
            isConforming: false,
            reason: `Nilai Kecepatan KYS Anda (${speedScore}) belum memenuhi nilai minimum yang dipersyaratkan (${requiredVal}).`
          };
        }
      } else if (scoreType === 'kys_agility') {
        const agilityScore = userAssessment.dimensionScores?.find(d => d.dimensionId.includes('agility') || d.dimensionId.includes('kelincahan'))?.score ?? userAssessment.compositeScore;
        if (agilityScore < requiredVal) {
          return {
            isConforming: false,
            reason: `Nilai Kelincahan KYS Anda (${agilityScore}) belum memenuhi nilai minimum yang dipersyaratkan (${requiredVal}).`
          };
        }
      } else if (scoreType === 'kys_stamina') {
        const staminaScore = userAssessment.dimensionScores?.find(d => d.dimensionId.includes('stamina') || d.dimensionId.includes('daya_tahan'))?.score ?? userAssessment.compositeScore;
        if (staminaScore < requiredVal) {
          return {
            isConforming: false,
            reason: `Nilai Daya Tahan KYS Anda (${staminaScore}) belum memenuhi nilai minimum yang dipersyaratkan (${requiredVal}).`
          };
        }
      } else {
        if (userAssessment.compositeScore < requiredVal) {
          return {
            isConforming: false,
            reason: `Skor gabungan (Composite Score) KYS Anda (${userAssessment.compositeScore}) belum memenuhi kriteria minimal (${requiredVal}).`
          };
        }
      }
    }

    return { isConforming: true, reason: '' };
  }, [job, assessments, user]);

  useEffect(() => {
    if (!jobId) return;

    let active = true;

    api.get<RawJobResponse>(`/jobs/${jobId}`)
      .then((data) => {
        if (active && data) {
          setJob(normalizeJob(data));
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          // If we don't have a fallback mock job, show error
          const hasMock = JOBS.some((j) => j.id === jobId);
          if (!hasMock) {
            console.error('Error fetching job details:', err);
            setError('Lowongan tidak ditemukan');
          }
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [jobId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSubmitted(true);
    }, 1500);
  };

  // Find user's completed KYS assessment for this sport & level
  const userAssessment = useMemo(() => {
    return assessments.find(
      (a) => a.sportId === job?.sportId && a.status === 'completed'
    );
  }, [assessments, job]);

  // Helper to scroll to non-KYS criteria questionnaire form
  const handleScrollToNonKysForm = () => {
    const element = document.getElementById('non-kys-criteria-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Temporary high-contrast visual blink to guide the athlete
      element.classList.add('ring-2', 'ring-[#D1FF00]', 'ring-offset-4', 'ring-offset-black');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-[#D1FF00]', 'ring-offset-4', 'ring-offset-black');
      }, 1500);
    }
  };

  const sportMap: Record<string, string> = {
    sepak_bola: 'Sepak Bola',
    bulutangkis: 'Bulutangkis',
    taekwondo: 'Taekwondo'
  };

  const getSportName = (sportId?: string) => {
    if (!sportId) return '';
    return sportMap[sportId] || sportId.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  if (loading || checkingKys) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-8 h-8 border-2 border-[#D1FF00] border-t-transparent rounded-full animate-spin" />
        <p className="text-white/40 text-xs font-mono uppercase tracking-wider">Memuat data perekrutan & KYS...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="text-center py-16">
        <p className="text-white/20 text-sm font-bold">{error || 'Lowongan tidak ditemukan'}</p>
        <button
          onClick={() => navigate('/market')}
          className="mt-4 text-[#D1FF00] text-xs font-bold uppercase tracking-wider"
        >
          Kembali
        </button>
      </div>
    );
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12 sm:py-16 max-w-sm mx-auto"
      >
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#D1FF00]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#D1FF00]/20">
          <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-[#D1FF00]" />
        </div>
        <h2 className="text-lg sm:text-xl font-black text-white mb-2">Lamaran Terkirim!</h2>
        <p className="text-[10px] sm:text-xs text-white/40 leading-relaxed mb-6">
          Lamaran Anda untuk <span className="text-white font-bold">{job.title}</span> di{' '}
          <span className="text-[#D1FF00]">{job.organization}</span> telah terkirim.
          Tim rekrutmen akan mereview dan menghubungi Anda.
        </p>
        <button
          onClick={() => navigate('/market')}
          className="py-3 px-6 bg-[#D1FF00] text-black font-black uppercase tracking-[0.15em] text-[9px] sm:text-[10px] rounded-xl sm:rounded-2xl"
        >
          Kembali ke Marketplace
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {/* Back Navigation Row */}
      <button
        onClick={() => navigate('/market')}
        className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold text-white/30 hover:text-white/60 transition-colors mb-4 sm:mb-6 uppercase tracking-wider"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Lowongan
      </button>

      {/* Hero Job Details Card */}
      <div className="bg-[#111111] border border-white/5 rounded-2xl sm:rounded-3xl p-5 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white tracking-tight">{job.title}</h2>
            <p className="text-[#D1FF00] text-[10px] sm:text-xs font-mono uppercase tracking-widest mt-1">
              {job.organization}
            </p>
          </div>
          <span className="bg-[#D1FF00]/10 border border-[#D1FF00]/25 text-[8px] sm:text-[9px] font-bold px-2.5 py-1 rounded-full uppercase text-[#D1FF00] shrink-0 self-start sm:self-center">
            {job.type}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[9px] sm:text-[10px] text-white/40 font-mono">
          <span className="flex items-center gap-1">📍 {job.location}</span>
          <span className="text-white/10">|</span>
          <span className="flex items-center gap-1">🏆 Kriteria Utama: <span className="text-white font-bold">{job.criteria}</span></span>
        </div>
      </div>

      {/* Requirement & Compliance Dashboard */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-4 h-4 text-[#D1FF00]" />
          <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-white/60">
            Verifikasi Kriteria Penerimaan Atlet
          </h3>
          <div className="h-[1px] bg-white/5 flex-1" />
        </div>

        {/* KYS Overview Card */}
        {job.isKYSRequired && user?.role === 'talent' && (
          <div className={`mb-5 border rounded-2xl p-5 ${checkKysStatus.isConforming ? 'bg-[#D1FF00]/5 border-[#D1FF00]/20' : 'bg-red-500/5 border-red-500/20'}`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${checkKysStatus.isConforming ? 'bg-[#D1FF00]/20' : 'bg-red-500/20'}`}>
                  {checkKysStatus.isConforming ? (
                    <CheckCircle className="w-5 h-5 text-[#D1FF00]" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-0.5">Status Kelayakan KYS</h4>
                  <p className="text-[10px] text-white/60">
                    {checkKysStatus.isConforming ? 'Kriteria Terpenuhi' : 'Kriteria Belum Terpenuhi'}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="text-right">
                  <p className="text-[8px] sm:text-[9px] font-mono text-white/40 uppercase mb-0.5">Syarat Minimum</p>
                  <p className="text-xs sm:text-sm font-bold text-white">{job.criteria || (job.isKYSRequired ? 'KYS Minimum Diperlukan' : 'Evaluasi Umum')}</p>
                </div>
                <div className="w-[1px] bg-white/10" />
                <div className="text-right">
                  <p className="text-[8px] sm:text-[9px] font-mono text-white/40 uppercase mb-0.5">Skor KYS Anda</p>
                  <p className={`text-xs sm:text-sm font-bold ${checkKysStatus.isConforming ? 'text-[#D1FF00]' : 'text-red-400'}`}>
                    {userAssessment ? (userAssessment.compositeScore || 'N/A') : 'Belum Tes'}
                  </p>
                </div>
              </div>
            </div>

            {!checkKysStatus.isConforming && (
              <div className="pt-4 border-t border-red-500/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-[10px] text-white/60 leading-relaxed max-w-xl">
                  {checkKysStatus.reason || 'Skor KYS Anda saat ini belum memenuhi batas minimal untuk melamar posisi ini. Kami menyarankan Anda untuk melakukan pengujian KYS ulang guna memperbaiki skor.'}
                </p>
                <button
                  type="button"
                  onClick={() => navigate(`/kys?sportId=${job.sportId}&start=true`)}
                  className="py-2.5 px-5 shrink-0 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Lakukan Tes Ulang
                </button>
              </div>
            )}
          </div>
        )}

        {/* KYS Skill Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {job.isKYSRequired && (job.skillRequirements && job.skillRequirements.length > 0 ? job.skillRequirements : (job.criteriaValue ? [{
            dimensionId: job.criteriaType || 'kys_avg',
            dimensionName: job.criteriaType === 'kys_speed' ? 'Kecepatan' : job.criteriaType === 'kys_stamina' ? 'Daya Tahan' : job.criteriaType === 'kys_agility' ? 'Kelincahan' : 'Skor Rata-rata',
            minScore: job.criteriaValue,
            checklist: []
          }] : [])).map((req) => {
            const dimScoreObj = userAssessment?.dimensionScores?.find(
              (ds) => ds.dimensionId === req.dimensionId || ds.dimensionName.toLowerCase() === req.dimensionName.toLowerCase()
            );
            const athleteScore = dimScoreObj ? Number(dimScoreObj.score) : (
                req.dimensionId === 'kys_avg' || req.dimensionId === 'kys_speed' || req.dimensionId === 'kys_stamina' || req.dimensionId === 'kys_agility' 
                ? (userAssessment?.compositeScore ?? null) 
                : null
            );
            const meetsThreshold = athleteScore !== null && athleteScore >= req.minScore;

            return (
              <motion.div
                key={req.dimensionId}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate(`/kys?sportId=${job.sportId}&start=true`)}
                className={`group cursor-pointer rounded-xl sm:rounded-2xl border p-4 sm:p-5 transition-all text-left flex flex-col justify-between ${
                  meetsThreshold
                    ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40'
                    : athleteScore !== null
                    ? 'bg-yellow-400/5 border-yellow-400/20 hover:border-yellow-400/40'
                    : 'bg-[#111111] border-white/5 hover:border-[#D1FF00]/30'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="text-[7px] sm:text-[8px] font-mono text-white/30 uppercase tracking-widest mb-0.5">
                        KYS SKILL REQUIREMENT
                      </p>
                      <h4 className="text-xs sm:text-sm font-bold text-white uppercase group-hover:text-[#D1FF00] transition-colors truncate">
                        {req.dimensionName}
                      </h4>
                    </div>
                    {meetsThreshold ? (
                      <span className="bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded text-[7px] sm:text-[8px] text-emerald-400 font-black uppercase">
                        ✓ OK
                      </span>
                    ) : athleteScore !== null ? (
                      <span className="bg-yellow-400/10 border border-yellow-400/25 px-2 py-0.5 rounded text-[7px] sm:text-[8px] text-yellow-500 font-black uppercase">
                        ⚠️ LIMIT
                      </span>
                    ) : (
                      <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[7px] sm:text-[8px] text-white/40 font-black uppercase">
                        🔒 BELUM TES
                      </span>
                    )}
                  </div>

                  <p className="text-[8px] sm:text-[9px] text-white/40 leading-relaxed mb-3">
                    Cabang Olahraga: <span className="text-white font-semibold">{getSportName(job.sportId)}</span>
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-[7px] sm:text-[8px] font-mono text-white/30 uppercase">Skor Target &amp; Aktual</p>
                    <p className="text-[10px] sm:text-xs font-bold text-white">
                      Target: {req.minScore} <span className="text-white/20 mx-1">|</span>{' '}
                      <span className={meetsThreshold ? 'text-emerald-400' : 'text-[#D1FF00]'}>
                        Skor Anda: {athleteScore !== null ? athleteScore : '—'}
                      </span>
                    </p>
                  </div>
                  <span className="text-[8px] font-mono text-[#D1FF00] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    {meetsThreshold ? 'Lihat/Tes Ulang' : 'Lakukan Tes'} <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
              </motion.div>
            );
          })}

          {/* Non-KYS Administration / Supplemental Criteria Card */}
          {(!job.isKYSRequired || job.criteriaType === 'sertifikat' || job.criteriaType === 'usia') && (
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleScrollToNonKysForm}
              className={`group cursor-pointer rounded-xl sm:rounded-2xl border p-4 sm:p-5 transition-all text-left flex flex-col justify-between ${
                (job.criteriaType === 'sertifikat' && certificationName) || (job.criteriaType === 'usia' && birthDate)
                  ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40'
                  : 'bg-[#111111] border-[#D1FF00]/10 hover:border-[#D1FF00]/30'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="text-[7px] sm:text-[8px] font-mono text-[#D1FF00] uppercase tracking-widest mb-0.5">
                      ADMINISTRATIVE REQUIREMENT
                    </p>
                    <h4 className="text-xs sm:text-sm font-bold text-white uppercase truncate">
                      {job.criteriaType === 'sertifikat' ? 'Lisensi/Sertifikasi' : job.criteriaType === 'usia' ? 'Kepatuhan Kategori Usia' : 'Kriteria Dokumen'}
                    </h4>
                  </div>
                  {((job.criteriaType === 'sertifikat' && certificationName) || (job.criteriaType === 'usia' && birthDate)) ? (
                    <span className="bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded text-[7px] sm:text-[8px] text-emerald-400 font-black uppercase">
                      ✓ FORM FILLED
                    </span>
                  ) : (
                    <span className="bg-white/5 border border-[#D1FF00]/20 px-2 py-0.5 rounded text-[7px] sm:text-[8px] text-[#D1FF00] font-black uppercase">
                      📝 ISI DI FORM
                    </span>
                  )}
                </div>

                <p className="text-[8px] sm:text-[9px] text-white/40 leading-relaxed mb-3">
                  Kriteria: <span className="text-[#D1FF00] font-bold">{job.criteria}</span>. Silakan isi form di bawah untuk melengkapi dokumen pembuktian.
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[7px] sm:text-[8px] font-mono text-white/30 uppercase">Status: Perlu Pengisian Manual</span>
                <span className="text-[8px] font-mono text-[#D1FF00] flex items-center gap-1">
                  Scroll ke Form <ArrowLeft className="w-2.5 h-2.5 rotate-270" />
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Formulir Lamaran / Alert Section */}
      <div className="border-t border-white/5 pt-6">
        {!checkKysStatus.isConforming ? (
          <div className="flex flex-col items-center justify-center py-10 bg-[#111111] border border-white/5 rounded-2xl text-center px-4">
            <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-yellow-500" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white mb-2">Kriteria Belum Terpenuhi</h3>
            <p className="text-[10px] sm:text-xs text-white/50 max-w-sm mb-6 leading-relaxed">
              Skor KYS Anda saat ini belum memenuhi batas minimal untuk melamar posisi ini. Kami menyarankan Anda untuk melakukan pengujian KYS ulang guna memperbaiki skor.
            </p>
            <button
              onClick={() => navigate(`/kys?sportId=${job.sportId}&start=true`)}
              className="py-3 px-6 bg-[#D1FF00] text-black font-black uppercase tracking-[0.1em] text-[10px] rounded-xl flex items-center gap-2 hover:scale-[1.02] transition-transform"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Lakukan KYS Ulang
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-4 h-4 text-[#D1FF00]" />
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Formulir Pendaftaran Atlet</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* General Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-white/40 mb-2 flex items-center gap-1.5">
                <User className="w-3 h-3 text-[#D1FF00]" /> Nama Lengkap
              </label>
              <input
                type="text"
                placeholder="Nama sesuai KTP"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full bg-[#111111] border border-white/10 py-3 px-4 rounded-xl text-[11px] sm:text-xs text-white focus:outline-none focus:border-[#D1FF00]/40 transition-colors"
              />
            </div>
            
            <div>
              <label className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-white/40 mb-2 flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-[#D1FF00]" /> Email Aktif
              </label>
              <input
                type="email"
                placeholder="email@domain.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full bg-[#111111] border border-white/10 py-3 px-4 rounded-xl text-[11px] sm:text-xs text-white focus:outline-none focus:border-[#D1FF00]/40 transition-colors"
              />
            </div>

            <div>
              <label className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-white/40 mb-2 flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-[#D1FF00]" /> No. WhatsApp Aktif
              </label>
              <input
                type="tel"
                placeholder="08xxxxxxxxxx"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
                className="w-full bg-[#111111] border border-white/10 py-3 px-4 rounded-xl text-[11px] sm:text-xs text-white focus:outline-none focus:border-[#D1FF00]/40 transition-colors"
              />
            </div>
          </div>

          {/* Custom Non-KYS questionnaire fields to complete criteria */}
          {job.criteriaType && !job.isKYSRequired && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              id="non-kys-criteria-form"
              className="p-4 sm:p-5 bg-[#D1FF00]/5 border border-[#D1FF00]/20 rounded-2xl space-y-4 transition-all"
            >
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#D1FF00]" />
                <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  Lengkapi Kriteria Khusus: {job.criteria}
                </h3>
              </div>

              {job.criteriaType === 'sertifikat' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1.5 block">
                      Nama Sertifikat / Nomor Registrasi Lisensi Keahlian
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Lisensi Pelatih C PSSI / AFC"
                      value={certificationName}
                      onChange={(e) => setCertificationName(e.target.value)}
                      required
                      className="w-full bg-white/5 border border-white/10 py-2.5 px-3 rounded-xl text-[10px] sm:text-xs text-white focus:outline-none focus:border-[#D1FF00]/30"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1.5 block">
                      Unggah File Bukti Sertifikat
                    </label>
                    <div className="border border-dashed border-white/10 hover:border-[#D1FF00]/30 rounded-xl p-4 text-center cursor-pointer bg-white/[0.02]">
                      <FileUp className="w-5 h-5 text-white/30 mx-auto mb-1.5" />
                      <p className="text-[8px] sm:text-[10px] font-bold text-white/60">
                        {certificationName ? `Sertifikat ${certificationName} terpilih` : 'Klik atau seret file sertifikat Anda ke sini'}
                      </p>
                      <p className="text-[7px] sm:text-[8px] text-white/20 mt-0.5">Mendukung PDF, JPG atau PNG Maks. 5MB</p>
                    </div>
                  </div>
                </div>
              )}

              {job.criteriaType === 'usia' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1.5 block">
                      Tanggal Lahir Pemohon
                    </label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => {
                        setBirthDate(e.target.value);
                        if (e.target.value) {
                          const yr = new Date(e.target.value).getFullYear();
                          const currentYr = new Date().getFullYear();
                          setAgeValue(String(currentYr - yr));
                        }
                      }}
                      required
                      className="w-full bg-white/5 border border-white/10 py-2.5 px-3 rounded-xl text-[10px] sm:text-xs text-white focus:outline-none focus:border-[#D1FF00]/30"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1.5 block">
                      Usia Terhitung Sekarang (Tahun)
                    </label>
                    <input
                      type="number"
                      placeholder="Usia Anda"
                      value={ageValue}
                      onChange={(e) => setAgeValue(e.target.value)}
                      required
                      className="w-full bg-white/5 border border-white/10 py-2.5 px-3 rounded-xl text-[10px] sm:text-xs text-white focus:outline-none focus:border-[#D1FF00]/30"
                    />
                  </div>
                </div>
              )}

              {!['sertifikat', 'usia'].includes(job.criteriaType || '') && (
                <div>
                  <label className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1.5 block">
                    Keterangan Penunjang Evaluasi Pendaftaran
                  </label>
                  <textarea
                    placeholder={`Uraikan secara ringkas bagaimana Anda memenuhi kriteria "${job.criteria}" ini...`}
                    rows={3}
                    value={customCriteriaResponses[job.criteriaType || 'general'] || ''}
                    onChange={(e) => setCustomCriteriaResponses({
                      ...customCriteriaResponses,
                      [job.criteriaType || 'general']: e.target.value
                    })}
                    required
                    className="w-full bg-white/5 border border-white/10 py-2.5 px-3 rounded-xl text-[10px] sm:text-xs text-white focus:outline-none focus:border-[#D1FF00]/30 resize-none"
                  />
                </div>
              )}
            </motion.div>
          )}

          {/* Letter / Cover Message */}
          <div>
            <label className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-white/40 mb-2 flex items-center gap-1.5">
              <FileText className="w-3 h-3 text-[#D1FF00]" /> Surat Penutup / Catatan Tambahan (Opsional)
            </label>
            <textarea
              placeholder="Ceritakan pengalaman klub Anda, prestasi terkini, atau alasan kuat Anda berminat mengikuti jalur beasiswa ini..."
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full bg-[#111111] border border-white/10 py-3 sm:py-3.5 px-4 rounded-xl text-[11px] sm:text-xs text-white focus:outline-none focus:border-[#D1FF00]/40 transition-colors resize-none"
            />
          </div>

          {/* Status Alert and Submit Button Row */}
          <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <p className="text-[8px] sm:text-[9px]" >
                Semua persyaratan validasi KYS &amp; kriteria berhasil terpenuhi dan diselesaikan!
              </p>
            </div>

            <button
              type="submit"
              disabled={sending}
              className="py-3.5 px-8 font-black uppercase tracking-[0.15em] text-[9.5px] sm:text-[10px] rounded-xl flex items-center justify-center gap-2 transition-all shrink-0 bg-[#D1FF00] text-black shadow-[0_0_20px_rgba(209,255,0,0.2)] hover:shadow-[0_0_30px_rgba(209,255,0,0.3)] hover:scale-[1.02]"
            >
              {sending ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Mengirim Lamaran...
                </span>
              ) : (
                <>
                  Daftar &amp; Kirim Lamaran <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
        </>
        )}
      </div>
    </motion.div>
  );
}
