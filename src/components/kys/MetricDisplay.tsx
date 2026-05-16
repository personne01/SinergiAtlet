import { motion } from 'motion/react';
import { ShieldCheck, ArrowUp, ArrowDown, Activity } from 'lucide-react';

interface MetricDisplayProps {
  label: string;
  unit: string;
  rawValue: string;
  score: number;
  higherIsBetter: boolean;
  confidence?: number;
}

export default function MetricDisplay({ label, unit, rawValue, score, higherIsBetter, confidence = 100 }: MetricDisplayProps) {
  const color = score >= 80 ? 'text-[#D1FF00]' : score >= 60 ? 'text-yellow-400' : 'text-red-400';
  const barColor = score >= 80 ? 'bg-[#D1FF00]' : score >= 60 ? 'bg-yellow-400' : 'bg-red-400';
  const lowConfidence = confidence < 60;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/5"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color.replace('text', 'bg')}/10`}>
            {higherIsBetter
              ? <ArrowUp className={`w-3.5 h-3.5 ${color}`} />
              : <ArrowDown className={`w-3.5 h-3.5 ${color}`} />
            }
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-white">{label}</p>
            <p className="text-[7px] sm:text-[8px] text-white/30 font-mono">{unit}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-base sm:text-lg font-mono font-black ${color}`}>{rawValue}</p>
          <div className="flex items-center gap-1 justify-end">
            <ShieldCheck className={`w-2.5 h-2.5 ${lowConfidence ? 'text-yellow-400' : 'text-[#D1FF00]/60'}`} />
            <span className={`text-[7px] font-mono ${lowConfidence ? 'text-yellow-400' : 'text-white/30'}`}>
              {confidence}%
            </span>
          </div>
        </div>
      </div>

      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full ${barColor} rounded-full`}
        />
      </div>

      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-1">
          {lowConfidence && (
            <span className="text-[7px] text-yellow-400/60 font-bold uppercase">Low Confidence</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Activity className="w-2.5 h-2.5 text-white/20" />
          <span className={`text-[10px] sm:text-xs font-mono font-black ${color}`}>{score}</span>
        </div>
      </div>
    </motion.div>
  );
}
