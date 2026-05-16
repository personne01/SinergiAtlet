import { ShieldCheck } from 'lucide-react';
import type { DimensionScore } from '../../types';

interface MatchIndicatorProps {
  matchPercent: number;
  dimensionScores?: DimensionScore[];
  requirementName?: string;
}

export default function MatchIndicator({ matchPercent, dimensionScores, requirementName }: MatchIndicatorProps) {
  const color =
    matchPercent >= 80
      ? { bg: 'bg-[#D1FF00]/10 border-[#D1FF00]/30 text-[#D1FF00]', fill: 'bg-[#D1FF00]' }
      : matchPercent >= 60
      ? { bg: 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400', fill: 'bg-yellow-400' }
      : { bg: 'bg-red-400/10 border-red-400/30 text-red-400', fill: 'bg-red-400' };

  return (
    <div>
      <div className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl border ${color.bg}`}>
        <div className="relative w-12 h-12 sm:w-14 sm:h-14">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/10" />
            <circle
              cx="18" cy="18" r="15.5" fill="none"
              stroke="currentColor" strokeWidth="2"
              strokeDasharray={`${matchPercent * 0.973} 100`}
              strokeLinecap="round"
              className={color.fill.replace('bg-', 'text-')}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[11px] sm:text-sm font-black text-white">
            {matchPercent}%
          </span>
        </div>
        <div>
          <p className="text-[10px] sm:text-xs font-bold text-white">Match dengan Kebutuhan Klub</p>
          <p className="text-[7px] sm:text-[8px] text-white/40 mt-0.5">
            {requirementName || 'Berdasarkan KYS assessment terakhir'}
          </p>
        </div>
        <ShieldCheck className="w-5 h-5 ml-auto shrink-0 opacity-60" />
      </div>

      {dimensionScores && dimensionScores.length > 0 && (
        <div className="mt-2 space-y-1.5">
          {dimensionScores.map((ds) => (
            <div key={ds.dimensionId} className="flex items-center gap-2 px-3 py-2">
              <p className="text-[8px] sm:text-[9px] text-white/40 font-bold uppercase min-w-[6rem]">{ds.dimensionName}</p>
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#D1FF00] rounded-full transition-all"
                  style={{ width: `${ds.score}%` }}
                />
              </div>
              <p className="text-[9px] sm:text-[10px] font-mono text-white/60 min-w-[2rem] text-right">{ds.score}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
