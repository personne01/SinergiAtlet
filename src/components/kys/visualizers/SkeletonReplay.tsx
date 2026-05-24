import { useEffect, useRef, useState } from 'react';
import type { LandmarkFrame } from '../../../types';

interface SkeletonReplayProps {
  frames: LandmarkFrame[];
  recordedBlob: Blob | null;
}

export default function SkeletonReplay({ frames, recordedBlob }: SkeletonReplayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playButtonRef = useRef<HTMLButtonElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!videoRef.current || !recordedBlob) return;
    videoRef.current.src = URL.createObjectURL(recordedBlob);
  }, [recordedBlob]);

  useEffect(() => {
    let animationFrame: number;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const renderLoop = () => {
      if (!video || !canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Find nearest frame based on video.currentTime
      const currentTimeMs = video.currentTime * 1000;
      const currentFrame = frames.find(f => Math.abs(f.timestamp - currentTimeMs) < 100);

      if (currentFrame) {
         ctx.lineWidth = 3;
         ctx.strokeStyle = '#D1FF00';
         ctx.fillStyle = '#D1FF00';

         // Connections
         const CONNECTIONS = [
           [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], // Upper auto
           [11, 23], [12, 24], [23, 24], // Torso
           [23, 25], [25, 27], [27, 29], [29, 31], // Left leg
           [24, 26], [26, 28], [28, 30], [30, 32], // Right leg
         ];

         for (const [start, end] of CONNECTIONS) {
            const p1 = currentFrame.landmarks[start];
            const p2 = currentFrame.landmarks[end];
            if (p1 && p2 && p1.visibility > 0.5 && p2.visibility > 0.5) {
               ctx.beginPath();
               ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
               ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
               ctx.stroke();
            }
         }

         for (const lm of currentFrame.landmarks) {
             if (lm.visibility > 0.5) {
                 ctx.beginPath();
                 ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 4, 0, 2 * Math.PI);
                 ctx.fill();
             }
         }
      }

      animationFrame = requestAnimationFrame(renderLoop);
    };

    if (isPlaying) {
      renderLoop();
    } else {
      cancelAnimationFrame(animationFrame!);
    }

    return () => cancelAnimationFrame(animationFrame);
  }, [frames, isPlaying]);

  const togglePlay = () => {
    if (videoRef.current) {
       if (videoRef.current.paused) {
         videoRef.current.play();
         setIsPlaying(true);
       } else {
         videoRef.current.pause();
         setIsPlaying(false);
       }
    }
  };

  return (
    <div className="relative rounded-xl overflow-hidden bg-black border border-white/10 group cursor-pointer aspect-[4/3]" onClick={togglePlay}>
       <video 
         ref={videoRef} 
         playsInline 
         loop
         className="w-full h-full object-cover" 
         onPlay={() => setIsPlaying(true)}
         onPause={() => setIsPlaying(false)}
       />
       <canvas 
         ref={canvasRef} 
         className="absolute inset-0 w-full h-full object-cover pointer-events-none"
       />
       {!isPlaying && (
         <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-[#D1FF00] text-black flex items-center justify-center pl-1 shadow-[0_0_20px_rgba(209,255,0,0.3)]">
               <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            </div>
         </div>
       )}
    </div>
  );
}
