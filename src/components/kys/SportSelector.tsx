import type { SportDef } from '../../types';
import { Trophy, Target, ShieldCheck } from 'lucide-react';

const SPORT_ICONS: Record<string, typeof Trophy> = {
  trophy: Trophy,
  target: Target,
  shield: ShieldCheck,
};

interface SportSelectorProps {
  sports: SportDef[];
  selected: string;
  onSelect: (id: string) => void;
  getSportStatus: (id: string) => 'completed' | 'in_progress' | 'not_started';
  getSportScore: (id: string) => number;
}

export default function SportSelector({
  sports,
  selected,
  onSelect,
  getSportStatus,
  getSportScore,
}: SportSelectorProps) {
  return (
    <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-none">
      {sports.map((sport) => {
        const Icon = SPORT_ICONS[sport.icon] || Trophy;
        const status = getSportStatus(sport.id);
        const score = getSportScore(sport.id);
        const isActive = selected === sport.id;

        return (
          <button
            key={sport.id}
            onClick={() => onSelect(sport.id)}
            className={`flex-shrink-0 flex items-center gap-2.5 px-4 py-3 rounded-xl sm:rounded-2xl border transition-all ${
              isActive
                ? 'bg-[#D1FF00]/10 border-[#D1FF00]/30 text-white'
                : 'bg-[#111111] border-white/5 text-white/50 hover:text-white/70 hover:border-white/20'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isActive ? 'bg-[#D1FF00]/20 text-[#D1FF00]' : 'bg-white/5 text-white/30'
              }`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-[10px] sm:text-xs font-bold whitespace-nowrap">{sport.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {status === 'completed' ? (
                  <span className="text-[7px] sm:text-[8px] text-[#D1FF00] font-bold uppercase">
                    {score}% {/* Qualified */}
                  </span>
                ) : status === 'in_progress' ? (
                  <span className="text-[7px] sm:text-[8px] text-yellow-400 font-bold uppercase">
                    In Progress
                  </span>
                ) : (
                  <span className="text-[7px] sm:text-[8px] text-white/20 font-bold uppercase">
                    Not Started
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
