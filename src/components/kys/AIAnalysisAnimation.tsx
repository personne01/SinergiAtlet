import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu } from 'lucide-react';

interface AIAnalysisAnimationProps {
  progress: number;
  status: string;
  frameCount: number;
  totalFrames: number;
}

const KINETIC_PHASES = [
  "Mengekstrak 33 titik sendi (MediaPipe AI)...",
  "Membangun lintasan motion path...",
  "Menghitung percepatan dan kecepatan (kinematika)...",
  "Membandingkan efisiensi sudut sendi dengan model pro...",
  "Menghasilkan rekomendasi pelatihan..."
];

export default function AIAnalysisAnimation({ progress, status, frameCount, totalFrames }: AIAnalysisAnimationProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhaseIndex(prev => (prev + 1) % KINETIC_PHASES.length);
    }, 2500); // cycle phases every 2.5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-8 text-center space-y-6 z-50">
      <div className="relative flex items-center justify-center">
        {/* Glowing spin ring */}
        <div className="absolute w-24 h-24 border-4 border-white/5 rounded-full" />
        <div className="absolute w-24 h-24 border-4 border-transparent border-t-[#D1FF00] border-r-[#D1FF00]/50 rounded-full animate-spin shadow-[0_0_15px_rgba(209,255,0,0.4)]" />
        {/* Core icon */}
        <motion.div animate={{ scale: [0.9, 1.1, 0.9] }} transition={{ duration: 2, repeat: Infinity }}>
           <Cpu className="w-8 h-8 text-[#D1FF00]" />
        </motion.div>
      </div>

      <div className="max-w-xs w-full space-y-5">
        <div>
          <h3 className="text-[#D1FF00] font-black tracking-widest uppercase mb-2 text-sm">Memproses Kinetika</h3>
          <div className="h-4 relative overflow-hidden">
             <AnimatePresence mode="wait">
               <motion.p
                  key={phaseIndex}
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -15, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-white/40 text-[10px] md:text-xs absolute inset-0"
               >
                 {KINETIC_PHASES[phaseIndex]}
               </motion.p>
             </AnimatePresence>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-mono font-bold tracking-widest">
            <span className="text-[#D1FF00]">{Math.round(progress)}%</span>
            <span className="text-white/30">FRAME {frameCount}/{totalFrames}</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#D1FF00]/50 to-[#D1FF00]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear", duration: 0.2 }}
            />
          </div>
        </div>
        
        {/* Custom generic status (for internal worker messages if needed) */}
        {status && !status.includes('Siap') && (
            <p className="text-[8px] text-white/20 font-mono italic">{status}</p>
        )}
      </div>
    </div>
  );
}
