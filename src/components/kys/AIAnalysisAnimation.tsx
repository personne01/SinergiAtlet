import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Cpu } from 'lucide-react';

interface AIAnalysisAnimationProps {
  progress: number;
  status: string;
  frameCount: number;
  totalFrames: number;
}

export default function AIAnalysisAnimation({ progress, status, frameCount, totalFrames }: AIAnalysisAnimationProps) {
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setDotCount((c) => (c + 1) % 4), 400);
    return () => clearInterval(interval);
  }, []);

  const dots = '.'.repeat(dotCount);

  return (
    <div className="bg-[#111111] border border-[#D1FF00]/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 sm:w-16 sm:h-16 bg-[#D1FF00]/10 rounded-2xl border border-[#D1FF00]/20 flex items-center justify-center mx-auto mb-4"
      >
        <Cpu className="w-6 h-6 sm:w-8 sm:h-8 text-[#D1FF00]" />
      </motion.div>

      <h3 className="text-sm sm:text-base font-bold text-white mb-1">AI Menganalisis Gerakan{dots}</h3>
      <p className="text-[9px] sm:text-[10px] text-white/40 mb-4">{status}</p>

      <div className="max-w-xs mx-auto space-y-3">
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#D1FF00] rounded-full"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="flex justify-between text-[8px] sm:text-[9px] font-mono text-white/30">
          <span>Frame {frameCount}/{totalFrames}</span>
          <span>{progress}%</span>
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-1">
        {Array.from({ length: Math.min(frameCount, 8) }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.6 }}
            transition={{ delay: i * 0.15 }}
            className="w-2 h-2 rounded-full bg-[#D1FF00]"
          />
        ))}
      </div>
    </div>
  );
}
