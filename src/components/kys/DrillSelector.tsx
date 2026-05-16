import { Camera, Timer, Zap, Target, Heart, ShieldCheck } from 'lucide-react';
import type { SkillCheckItemDef, VideoAnalysisConfig } from '../../types';

interface DrillSelectorProps {
  items: SkillCheckItemDef[];
  selected: string | null;
  onSelect: (itemId: string) => void;
  getConfig: (item: SkillCheckItemDef) => VideoAnalysisConfig | null;
}

const DRILL_ICONS: Record<string, typeof Camera> = {
  sprint: Zap, agility: Target, technique: ShieldCheck,
  power: Zap, endurance: Heart,
};

export default function DrillSelector({ items, selected, onSelect, getConfig }: DrillSelectorProps) {
  const videoItems = items.filter((item) => item.assessmentType === 'ai_scan');
  const manualItems = items.filter((item) => item.assessmentType === 'manual_input');

  return (
    <div className="space-y-3 sm:space-y-4">
      <div>
        <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 mb-2 flex items-center gap-1.5">
          <Camera className="w-3 h-3" /> Video Drill
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {videoItems.map((item) => {
            const config = getConfig(item);
            const Icon = DRILL_ICONS[config?.drillType || 'sprint'] || Camera;
            const isActive = selected === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`text-left flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-[#D1FF00]/10 border-[#D1FF00]/30'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isActive ? 'bg-[#D1FF00]/20 text-[#D1FF00]' : 'bg-white/5 text-white/30'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-[10px] sm:text-xs font-bold truncate ${isActive ? 'text-[#D1FF00]' : 'text-white'}`}>
                    {item.label}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Timer className="w-2.5 h-2.5 text-white/20" />
                    <span className="text-[7px] sm:text-[8px] text-white/30">{config?.duration || 15}s</span>
                    <span className="text-[7px] sm:text-[8px] text-white/20">{item.unit}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {manualItems.length > 0 && (
        <div>
          <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.15em] text-white/20 mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3" /> Data Manual
          </p>
          <div className="space-y-2">
            {manualItems.map((item) => (
              <div key={item.id} className="bg-white/5 rounded-xl border border-white/10 p-3 flex items-center gap-3">
                <p className="text-[10px] sm:text-xs font-bold text-white/60 min-w-[6rem]">{item.label}</p>
                <div className="relative flex-1">
                  <input
                    type="number" step="0.1" placeholder="0"
                    className="w-full bg-white/5 border border-white/10 py-2 px-3 rounded-lg text-[10px] sm:text-xs focus:outline-none focus:border-[#D1FF00]/30 transition-colors"
                  />
                </div>
                <span className="text-[8px] sm:text-[9px] text-white/30 font-mono min-w-[3rem]">{item.unit}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
