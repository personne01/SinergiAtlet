import { motion } from 'motion/react';
import { MapPin, Star, ArrowRight, Lock, CheckCircle } from 'lucide-react';
import type { Job } from '../../types';
import { cn } from '../../utils/cn';

interface JobCardProps {
  job: Job;
  variant?: 'default' | 'featured';
  kysVerified?: boolean;
  kysMetRequirement?: boolean;
  matchPercent?: number;
  onApply?: (job: Job) => void;
  onClick?: () => void;
}

export default function JobCard({ job, variant = 'default', kysVerified = false, kysMetRequirement = false, matchPercent, onApply, onClick }: JobCardProps) {
  const canApply = !job.isKYSRequired || (kysVerified && kysMetRequirement);
  const needsKYSUnlock = job.isKYSRequired && (!kysVerified || !kysMetRequirement);

  const matchColor = matchPercent !== undefined
    ? matchPercent >= 80
      ? { text: 'text-[#D1FF00]', bg: 'bg-[#D1FF00]/10 border-[#D1FF00]/30' }
      : matchPercent >= 60
      ? { text: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' }
      : { text: 'text-red-400', bg: 'bg-red-400/10 border-red-400/30' }
    : null;

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'cursor-pointer',
        'bg-[#111111] border border-white/5 group hover:border-[#D1FF00]/30 transition-all',
        variant === 'featured'
          ? 'rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6'
          : 'rounded-xl sm:rounded-2xl p-4 sm:p-5'
      )}
    >
      <div className="flex justify-between items-start mb-2 sm:mb-3">
        <div className="min-w-0 flex-1">
          <h4 className={cn(
            'text-white font-bold mb-1',
            variant === 'featured' ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
          )}>
            {job.title}
          </h4>
          <p className="text-[#D1FF00] text-[9px] sm:text-[10px] lg:text-xs font-mono uppercase tracking-widest truncate">
            {job.organization}
          </p>
        </div>
        <span className="bg-white/5 border border-white/10 text-[8px] sm:text-[9px] px-1.5 sm:px-2 py-1 rounded uppercase text-white/60 shrink-0 ml-2">
          {job.type}
        </span>
      </div>

      <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
        <div className="flex items-center gap-1.5 sm:gap-2 text-white/40 text-[9px] sm:text-[10px] lg:text-xs">
          <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
          <span className="truncate">{job.location}</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 text-white/60 text-[9px] sm:text-[10px] lg:text-xs">
          <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#D1FF00] shrink-0" />
          Kriteria:{' '}
          <span className="text-[#D1FF00] truncate">{job.criteria}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-white/5">
        <div className="flex items-center gap-1 sm:gap-1.5">
          {matchPercent !== undefined ? (
            <div className={cn('flex items-center gap-1 px-2 py-0.5 rounded border text-[7px] sm:text-[8px] font-bold uppercase italic', matchColor?.bg, matchColor?.text)}>
              {matchPercent}% Match
            </div>
          ) : job.isKYSRequired ? (
            needsKYSUnlock ? (
              <div className="flex items-center gap-1 sm:gap-1.5">
                <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-500" />
                <span className="text-[7px] sm:text-[8px] font-bold text-yellow-500 uppercase italic">KYS Locked</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-1.5">
                <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D1FF00]" />
                <span className="text-[7px] sm:text-[8px] font-bold text-[#D1FF00] uppercase italic">KYS Verified</span>
              </div>
            )
          ) : (
            <div className="text-[7px] sm:text-[8px] text-white/20 uppercase font-bold">Terbuka</div>
          )}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onApply?.(job); }}
          className={cn(
            'flex items-center gap-1 text-[9px] sm:text-[10px] font-black uppercase transition-colors',
            canApply
              ? 'text-white hover:text-[#D1FF00]'
              : 'text-white/20 cursor-not-allowed'
          )}
          disabled={!canApply}
          title={needsKYSUnlock ? 'Selesaikan KYS Verification untuk melamar' : undefined}
        >
          {needsKYSUnlock ? 'KYS Dulu' : 'Lamar'}
          <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
        </button>
      </div>
    </motion.div>
  );
}
