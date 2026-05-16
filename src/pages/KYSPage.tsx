import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { ScanLine, TrendingUp, Camera, BarChart3, ShieldCheck, Award, Zap, Heart, Target, Trophy, Star, Cpu, AlertCircle, RotateCcw } from 'lucide-react';
import { SPORTS } from '../data/sports';
import { SPORT_ASSESSMENTS, BADGES_DATA, CERTIFICATIONS, JOBS } from '../data/mock';
import type { SportAssessment } from '../types';
import { useMediaPipe } from '../hooks/useMediaPipe';
import SportSelector from '../components/kys/SportSelector';
import AssessmentFlow from '../components/kys/AssessmentFlow';
import SkillRadar from '../components/kys/SkillRadar';
import MatchIndicator from '../components/kys/MatchIndicator';

const ICON_MAP: Record<string, typeof Zap> = {
  zap: Zap, heart: Heart, target: Target, trophy: Trophy,
  star: Star, shield: ShieldCheck, award: Award,
};

function BadgeCard({ badge }: { badge: typeof BADGES_DATA[0] }) {
  const Icon = ICON_MAP[badge.icon] || Award;
  return (
    <div className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all ${
      badge.earned ? 'border-[#D1FF00]/20 bg-[#D1FF00]/5' : 'border-white/5 bg-white/[0.02] opacity-50'
    }`}>
      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${
        badge.earned ? 'bg-[#D1FF00]/20 text-[#D1FF00]' : 'bg-white/5 text-white/20'
      }`}>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 mb-0.5">
          <p className={`text-[10px] sm:text-xs font-bold truncate ${badge.earned ? 'text-white' : 'text-white/30'}`}>{badge.name}</p>
          {badge.earned && <ShieldCheck className="w-3 h-3 text-[#D1FF00] shrink-0" />}
        </div>
        <p className={`text-[7px] sm:text-[8px] truncate ${badge.earned ? 'text-white/40' : 'text-white/20'}`}>
          {badge.earned ? `Earned ${badge.earnedDate}` : badge.requirement}
        </p>
      </div>
    </div>
  );
}

export default function KYSPage() {
  const mp = useMediaPipe();
  const [selectedSport, setSelectedSport] = useState(SPORTS[0].id);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [showFlow, setShowFlow] = useState(false);
  const [assessments, setAssessments] = useState<SportAssessment[]>(SPORT_ASSESSMENTS);

  const sport = SPORTS.find((s) => s.id === selectedSport);

  const sportAssessments = useMemo(
    () => assessments.filter((a) => a.sportId === selectedSport),
    [assessments, selectedSport],
  );

  const activeLevel = useMemo(() => {
    if (selectedLevel) return selectedLevel;
    const found = sportAssessments.find((a) => a.status === 'completed');
    if (found) return found.levelId;
    const incomplete = sportAssessments.find((a) => a.status === 'not_started');
    if (incomplete) return incomplete.levelId;
    return sport?.levels[0]?.id || '';
  }, [selectedLevel, sportAssessments, sport]);

  const currentAssessment = useMemo(
    () => sportAssessments.find((a) => a.levelId === activeLevel),
    [sportAssessments, activeLevel],
  );

  const sportLevel = useMemo(
    () => (sport ? sport.levels.find((l) => l.id === activeLevel) : undefined),
    [sport, activeLevel],
  );

  const getSportStatus = (id: string) => {
    const sas = assessments.filter((a) => a.sportId === id);
    if (sas.some((a) => a.status === 'completed')) return 'completed' as const;
    if (sas.some((a) => a.status === 'in_progress')) return 'in_progress' as const;
    return 'not_started' as const;
  };

  const getSportScore = (id: string) => {
    const sas = assessments.filter((a) => a.sportId === id && a.status === 'completed');
    if (sas.length === 0) return 0;
    return Math.round(sas.reduce((sum, a) => sum + a.compositeScore, 0) / sas.length);
  };

  const relevantJobs = useMemo(() => {
    if (!selectedSport) return [];
    return JOBS.filter((j) => j.sportId === selectedSport && j.isKYSRequired).slice(0, 3);
  }, [selectedSport]);

  const matchForJob = (jobId: string) => {
    if (!currentAssessment || currentAssessment.status !== 'completed') return 0;
    const job = JOBS.find((j) => j.id === jobId);
    if (!job?.skillRequirements || job.skillRequirements.length === 0) return 0;
    let totalWeight = 0;
    let weightedScore = 0;
    for (const req of job.skillRequirements) {
      const ds = currentAssessment.dimensionScores.find((d) => d.dimensionId === req.dimensionId);
      if (!ds) continue;
      const reqWeight = req.checklist.reduce((w, c) => w + c.weight, 0) || 1;
      totalWeight += reqWeight;
      const dimMatch = ds.score >= req.minScore ? 100 : (ds.score / req.minScore) * 100;
      weightedScore += dimMatch * reqWeight;
    }
    return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
  };

  const handleComplete = (assessment: SportAssessment) => {
    setAssessments((prev) => {
      const filtered = prev.filter((a) => !(a.sportId === assessment.sportId && a.levelId === assessment.levelId));
      return [...filtered, assessment];
    });
    setShowFlow(false);
  };

  const activeDimScores = currentAssessment?.dimensionScores || [];
  const radarLabels = activeDimScores.map((d) => d.dimensionName);
  const radarScores = activeDimScores.map((d) => d.score);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-light italic">
          Validation <span className="font-bold not-italic text-[#D1FF00]">Center</span>
        </h2>
        <p className="text-white/40 text-[8px] sm:text-[9px] lg:text-xs uppercase tracking-widest mt-1">
          Skill assessment berbasis level & olahraga — unlock peluang karirmu
        </p>
      </div>

      <SportSelector
        sports={SPORTS}
        selected={selectedSport}
        onSelect={(id) => { setSelectedSport(id); setSelectedLevel(''); setShowFlow(false); }}
        getSportStatus={getSportStatus}
        getSportScore={getSportScore}
      />

      {/* MediaPipe model loading */}
      {mp.loading && (
        <div className="mt-3 bg-[#111111] border border-[#D1FF00]/20 rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-3.5 h-3.5 text-[#D1FF00] animate-pulse" />
            <span className="text-[8px] sm:text-[9px] font-bold text-[#D1FF00] uppercase tracking-wider">Memuat AI Engine</span>
            <span className="ml-auto text-[8px] font-mono text-white/30">{mp.progress}%</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div className="h-full bg-[#D1FF00] rounded-full" style={{ width: `${mp.progress}%` }} transition={{ duration: 0.3 }} />
          </div>
          <p className="text-[7px] sm:text-[8px] text-white/30 font-mono mt-1">{mp.progressText}</p>
        </div>
      )}
      {mp.error && (
        <div className="mt-3 bg-red-400/5 border border-red-400/20 rounded-xl p-3 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-[8px] sm:text-[9px] text-red-400 flex-1">{mp.error}</p>
          <button onClick={mp.retry} className="flex items-center gap-1 text-[8px] font-bold text-red-400 uppercase tracking-wider hover:text-red-300">
            <RotateCcw className="w-3 h-3" /> Ulang
          </button>
        </div>
      )}

      <div className="mt-4 sm:mt-6">
        {showFlow && sportLevel ? (
          <AssessmentFlow
            dimensions={sportLevel.dimensions}
            sportId={selectedSport}
            levelId={activeLevel}
            mediapipeReady={mp.ready}
            onComplete={handleComplete}
            onClose={() => setShowFlow(false)}
          />
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Level selector + assessment CTA */}
            {sport && sport.levels.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {sport.levels.map((lvl) => {
                  const lvlAssessment = sportAssessments.find((a) => a.levelId === lvl.id);
                  const isActive = activeLevel === lvl.id;
                  return (
                    <button
                      key={lvl.id}
                      onClick={() => setSelectedLevel(lvl.id)}
                      className={`px-3 py-2 rounded-lg border text-[8px] sm:text-[9px] font-bold uppercase tracking-wider transition-all ${
                        isActive
                          ? 'bg-[#D1FF00]/10 border-[#D1FF00]/30 text-[#D1FF00]'
                          : 'bg-white/5 border-white/10 text-white/40 hover:text-white/60'
                      }`}
                    >
                      {lvl.label}
                      {lvlAssessment?.status === 'completed' && <span className="ml-1 text-[#D1FF00]">✓</span>}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Per-level dashboard */}
            {currentAssessment?.status === 'completed' ? (
              <div className="bg-gradient-to-br from-[#111111] to-[#0d0d0d] border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-40 h-40 sm:w-56 sm:h-56 bg-[#D1FF00]/5 blur-3xl rounded-full" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#D1FF00]/10 flex items-center justify-center border border-[#D1FF00]/20">
                        <ScanLine className="w-4 h-4 sm:w-5 sm:h-5 text-[#D1FF00]" />
                      </div>
                      <div>
                        <h3 className="text-[10px] sm:text-xs lg:text-sm font-bold uppercase tracking-widest italic leading-tight">
                          {sport?.name} — <span className="text-[#D1FF00]">{sportLevel?.label}</span>
                        </h3>
                        <p className="text-[7px] sm:text-[8px] text-white/20 font-mono">
                          Completed {currentAssessment.completedAt} · Valid until {currentAssessment.validUntil}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[7px] sm:text-[8px] text-white/30 uppercase font-mono">Composite</p>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-mono text-[#D1FF00] font-black italic">
                        {currentAssessment.compositeScore}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8 mb-6">
                    <SkillRadar
                      labels={radarLabels}
                      playerScores={radarScores}
                      size={200}
                    />
                    <div className="flex-1 w-full space-y-3">
                      {activeDimScores.map((ds) => {
                        const dimDef = sportLevel?.dimensions.find((d) => d.id === ds.dimensionId);
                        const DimIcon = dimDef ? ICON_MAP[dimDef.icon] || ShieldCheck : ShieldCheck;
                        return (
                          <div key={ds.dimensionId} className="bg-white/5 p-3 rounded-xl border border-white/5">
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <DimIcon className="w-3 h-3 text-[#D1FF00]" />
                                <span className="text-[9px] sm:text-[10px] font-bold text-white uppercase">{ds.dimensionName}</span>
                              </div>
                              <span className="text-sm sm:text-base font-mono font-black text-[#D1FF00]">{ds.score}</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-[#D1FF00] rounded-full" style={{ width: `${ds.score}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Match with relevant jobs */}
                  {relevantJobs.length > 0 && (
                    <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                      <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.15em] text-white/40">
                        Match dengan Lowongan Terkait
                      </p>
                      {relevantJobs.map((job) => {
                        const match = matchForJob(job.id);
                        return (
                          <MatchIndicator
                            key={job.id}
                            matchPercent={match}
                            requirementName={job.title}
                            dimensionScores={currentAssessment.dimensionScores}
                          />
                        );
                      })}
                    </div>
                  )}

                  <button
                    onClick={() => setShowFlow(true)}
                    className="w-full py-3 sm:py-4 bg-[#D1FF00] text-black font-black uppercase tracking-[0.15em] text-[9px] sm:text-[10px] rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(209,255,0,0.2)] hover:shadow-[0_0_30px_rgba(209,255,0,0.3)] transition-all"
                  >
                    <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Ulangi Assessment
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#111111] border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                  <ScanLine className="w-6 h-6 text-white/20" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white mb-1">
                  {sportLevel ? `Assessment ${sport.name} — ${sportLevel.label}` : 'Pilih Level'}
                </h3>
                <p className="text-[9px] sm:text-[10px] text-white/40 max-w-xs mx-auto mb-6">
                  Pilih level di atas, lalu lakukan assessment untuk mengukur skill-mu dan cocokkan dengan kebutuhan klub.
                </p>
                {sportLevel && (
                  <button
                    onClick={() => setShowFlow(true)}
                    className="py-3 px-6 bg-[#D1FF00] text-black font-black uppercase tracking-[0.15em] text-[9px] sm:text-[10px] rounded-xl sm:rounded-2xl shadow-[0_0_20px_rgba(209,255,0,0.2)] hover:shadow-[0_0_30px_rgba(209,255,0,0.3)] transition-all"
                  >
                    <BarChart3 className="w-3.5 h-3.5 inline mr-2" /> Mulai Assessment
                  </button>
                )}
              </div>
            )}

            {/* Stats row — always visible */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-[#0a0a0a] border border-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                <div className="flex items-center gap-2 text-white/40 mb-2">
                  <ScanLine className="w-3.5 h-3.5 text-[#D1FF00]" />
                  <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest">Level Assessed</span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-white">
                  {sportAssessments.filter((a) => a.status === 'completed').length}/{sport?.levels.length || 0}
                </p>
                <p className="text-[8px] sm:text-[9px] text-white/30 font-mono">{sport?.name || '-'}</p>
              </div>
              <div className="bg-[#0a0a0a] border border-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                <div className="flex items-center gap-2 text-white/40 mb-2">
                  <TrendingUp className="w-3.5 h-3.5 text-[#D1FF00]" />
                  <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest">Best Score</span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-white">
                  {Math.max(...sportAssessments.filter((a) => a.status === 'completed').map((a) => a.compositeScore), 0)}
                </p>
                <p className="text-[8px] sm:text-[9px] text-white/30 font-mono">
                  {getSportScore(selectedSport) > 0 ? `${getSportScore(selectedSport)} avg` : '—'}
                </p>
              </div>
              <div className="bg-[#0a0a0a] border border-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                <div className="flex items-center gap-2 text-white/40 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D1FF00]" />
                  <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest">Job Matches</span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-white">{relevantJobs.length}</p>
                <p className="text-[8px] sm:text-[9px] text-white/30 font-mono">tersedia untuk {sport?.name || '-'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Badges & Certifications — always visible below */}
      {!showFlow && (
        <>
          <div className="mt-6 sm:mt-8 bg-[#0a0a0a] border border-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h4 className="text-[9px] sm:text-[10px] lg:text-xs font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D1FF00]" /> Badge & Sertifikasi
              </h4>
              <span className="text-[7px] sm:text-[8px] font-mono text-white/30">
                {BADGES_DATA.filter((b) => b.earned).length}/{BADGES_DATA.length} earned
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {BADGES_DATA.map((badge) => <BadgeCard key={badge.id} badge={badge} />)}
            </div>
          </div>

          <div className="mt-4 sm:mt-6 bg-[#0a0a0a] border border-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h4 className="text-[9px] sm:text-[10px] lg:text-xs font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D1FF00]" /> Gateway Marketplace
              </h4>
              <span className="text-[7px] sm:text-[8px] font-mono text-[#D1FF00]">
                {CERTIFICATIONS.filter((c) => c.unlocked).length}/{CERTIFICATIONS.length} unlocked
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {CERTIFICATIONS.map((cert) => (
                <div key={cert.id} className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all ${
                  cert.unlocked ? 'border-[#D1FF00]/20 bg-[#D1FF00]/5' : 'border-white/5 bg-white/[0.02] opacity-50'
                }`}>
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    cert.unlocked ? 'bg-[#D1FF00]/20 text-[#D1FF00]' : 'bg-white/5 text-white/20'
                  }`}>
                    <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-[10px] sm:text-xs font-bold truncate ${cert.unlocked ? 'text-white' : 'text-white/30'}`}>{cert.name}</p>
                    <p className={`text-[7px] sm:text-[8px] truncate ${cert.unlocked ? 'text-white/40' : 'text-white/20'}`}>
                      {cert.unlocked ? `Unlocked ${cert.unlockDate}` : `Req. score ${cert.requiredScore}`}
                    </p>
                  </div>
                  {cert.unlocked && <span className="text-[7px] sm:text-[8px] font-bold text-[#D1FF00] uppercase shrink-0">Active</span>}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
