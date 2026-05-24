import { motion, AnimatePresence } from 'motion/react';
import type { ValidationState } from '../../hooks/useCameraValidation';
import { User } from 'lucide-react';

interface CameraGuideOverlayProps {
  validation: ValidationState;
  isActive: boolean;
}

export function CameraGuideOverlay({ validation, isActive }: CameraGuideOverlayProps) {
  if (!isActive) return null;

  return (
    <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center overflow-hidden">
      {/* Dashed Border Overlay */}
      <motion.div
        animate={{ 
            borderColor: validation.overallReady ? "#D1FF00" : "#ef4444",
            boxShadow: validation.overallReady ? "0 0 40px rgba(209,255,0,0.3), inset 0 0 20px rgba(209,255,0,0.2)" : "none",
            scale: validation.overallReady ? 1 : [1, 1.05, 1]
        }}
        transition={{ scale: { repeat: validation.overallReady ? 0 : Infinity, duration: 2 } }}
        className="absolute inset-x-6 top-16 bottom-24 border-[3px] border-dashed rounded-[3rem] transition-colors duration-300 flex items-center justify-center bg-black/10"
      >
          <AnimatePresence>
             {!validation.overallReady && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}>
                    <User className="w-16 h-16 sm:w-24 sm:h-24 text-white/40 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </motion.div>
             )}
          </AnimatePresence>
      </motion.div>

      {/* Instructional Badge */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col gap-2 items-center w-full px-4">
        <AnimatePresence mode="wait">
          {!validation.isBodyVisible ? (
             <motion.div 
               key="not-visible"
               initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
               className="bg-red-500/90 backdrop-blur text-white px-4 py-2 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.5)] whitespace-nowrap text-center"
             >
               Mundur, paskan seluruh tubuh
             </motion.div>
          ) : !validation.isCentered ? (
             <motion.div 
               key="not-centered"
               initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
               className="bg-yellow-500/90 backdrop-blur text-black px-4 py-2 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-[0_0_15px_rgba(234,179,8,0.5)] whitespace-nowrap text-center"
             >
               Geser ke tengah area rekam
             </motion.div>
          ) : validation.overallReady ? (
             <motion.div 
               key="ready"
               initial={{ opacity: 0, y: -10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10 }}
               className="bg-[#D1FF00] text-black px-4 py-2 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(209,255,0,0.6)] whitespace-nowrap text-center"
             >
                Posisi Sempurna - Tahan...
             </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
