import { motion } from 'motion/react';
import { TrendingUp, Award, Target, BarChart3 } from 'lucide-react';
import CareerStepper from '../components/career/CareerStepper';
import { useCareerProgress } from '../hooks/useCareerProgress';
import { CAREER_PATH } from '../data/mock';

export default function CareerPage() {
  const { current, next, level, overallProgress } = useCareerProgress();
  const progressPct = Math.round((current / next) * 100);
  const totalLevels = CAREER_PATH.length;
  const currentLevel = CAREER_PATH.find((s) => s.status === 'current')?.level ?? 1;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-light italic">
          Career <span className="font-bold not-italic text-[#D1FF00]">Path</span>
        </h2>
        <p className="text-white/40 text-[8px] sm:text-[9px] lg:text-xs uppercase tracking-widest mt-1">
          Peta Jalan Menuju Atlet Professional
        </p>
      </div>

      <div className="bg-[#111111] border border-[#D1FF00]/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#D1FF00]/5 blur-3xl rounded-full" />

        <div className="relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
            <div>
              <p className="text-[8px] sm:text-[9px] uppercase tracking-widest text-[#D1FF00] font-bold mb-1">
                Rank Saat Ini
              </p>
              <div className="flex items-center gap-3">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-black italic">{level}</h3>
                <span className="bg-[#D1FF00]/10 text-[#D1FF00] text-[8px] sm:text-[9px] px-2 py-0.5 rounded font-mono font-black">
                  Level {currentLevel}/{totalLevels}
                </span>
              </div>
            </div>

            <div className="sm:text-right">
              <p className="text-[8px] sm:text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1">
                Overall Progress
              </p>
              <div className="flex items-center gap-2 sm:justify-end">
                <Target className="w-4 h-4 text-[#D1FF00]" />
                <span className="text-lg sm:text-xl font-mono font-black text-[#D1FF00]">
                  {overallProgress}%
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between text-[8px] sm:text-[9px] lg:text-xs font-mono text-white/40">
              <span className="flex items-center gap-1.5">
                <BarChart3 className="w-3 h-3 text-[#D1FF00]" />
                EXP: {current.toLocaleString()} / {next.toLocaleString()}
              </span>
              <span>NEXT: LEVEL {currentLevel + 1}</span>
            </div>
            <div className="h-2 sm:h-3 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#D1FF00] to-[#A0CC00] rounded-full"
                style={{ width: `${progressPct}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
            <div className="bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/5">
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D1FF00] mb-1" />
              <p className="text-white font-bold text-[10px] sm:text-xs">{currentLevel}</p>
              <p className="text-[7px] sm:text-[8px] text-white/30 uppercase font-mono">Level</p>
            </div>
            <div className="bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/5">
              <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D1FF00] mb-1" />
              <p className="text-white font-bold text-[10px] sm:text-xs">{totalLevels - currentLevel}</p>
              <p className="text-[7px] sm:text-[8px] text-white/30 uppercase font-mono">Sisa Level</p>
            </div>
            <div className="bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/5">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D1FF00] mb-1" />
              <p className="text-white font-bold text-[10px] sm:text-xs">{next - current}</p>
              <p className="text-[7px] sm:text-[8px] text-white/30 uppercase font-mono">EXP Lagi</p>
            </div>
          </div>
        </div>
      </div>

      <CareerStepper />
    </motion.div>
  );
}
