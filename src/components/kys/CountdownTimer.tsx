import { motion, AnimatePresence } from 'motion/react';

interface CountdownTimerProps {
  count: number;
}

export function CountdownTimer({ count }: CountdownTimerProps) {
  if (count <= 0) return null;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.div
           key={count}
           initial={{ scale: 2.5, opacity: 0, filter: "blur(10px)" }}
           animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
           exit={{ scale: 0.5, opacity: 0, filter: "blur(10px)" }}
           transition={{ 
             type: "spring", 
             stiffness: 200, 
             damping: 20, 
             mass: 0.5,
             opacity: { duration: 0.2 },
             filter: { duration: 0.2 }
           }}
           className="relative flex items-center justify-center"
        >
          {/* Glowing pulse ring */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute w-40 h-40 rounded-full border-4 border-[#D1FF00]"
          />
          
          <span className="text-[10rem] md:text-[14rem] font-black text-[#D1FF00] drop-shadow-[0_0_30px_rgba(209,255,0,0.8)] leading-none select-none">
            {count}
          </span>
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-12 uppercase tracking-[0.3em] font-black text-white/50 text-[10px] md:text-xs">
         Persiapkan Diri Anda
      </div>
    </div>
  );
}
