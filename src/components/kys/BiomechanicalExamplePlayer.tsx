import { useState, useEffect, useRef } from 'react';
import { Play, Pause, ShieldCheck, Activity, Sparkles, Flame } from 'lucide-react';

interface BiomechanicalExamplePlayerProps {
  drillType: 'sprint' | 'agility' | 'technique' | 'power' | 'endurance';
  label: string;
}

export default function BiomechanicalExamplePlayer({ drillType, label }: BiomechanicalExamplePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [time, setTime] = useState(0);
  const animationRef = useRef<number | null>(null);

  // Smooth animation frame loop for drawing coordinates
  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    let lastTime = performance.now();
    const update = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      setTime((t) => (t + delta) % (drillType === 'power' ? 3.0 : 2.0)); // Loop times
      animationRef.current = requestAnimationFrame(update);
    };

    animationRef.current = requestAnimationFrame(update);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, drillType]);

  // Guidelines based on drill type
  const getGuidelines = () => {
    switch (drillType) {
      case 'sprint':
        return [
          'Jaga sudut kecondongan badan ideal sebesar 45°-50° saat akselerasi.',
          'Rentangkan paha sebesar 90° dari posisi pinggul untuk daya dorong optimal.',
          'Pendaratan kaki bertumpu pada bola kaki (forefoot strike) untuk meminimalkan waktu hambatan.',
          'Lengan berayun konstan membentuk sudut sikut 90° seirama dengan kaki.',
        ];
      case 'agility':
        return [
          'Tekuk lutut Anda hingga membentuk center of gravity yang sangat rendah (120°-130°).',
          'Lakukan langkah geser samping (lateral slide) yang lebar tanpa menyilangkan kaki.',
          'Sentuh garis batas secepat mungkin dengan memusatkan bobot tubuh pada kaki tumpuan luar.',
          'Segera dorong kembali searah dengan tujuan baru menggunakan kekuatan eksplosif lutut.',
        ];
      case 'endurance':
        return [
          'Batasi ketinggian lompatan vertikal tubuh untuk menghemat energi kardio.',
          'Bernapas secara konstan (perbandingan rasionya: 2 langkah hirup, 2 langkah hembus).',
          'Pendaratan telapak kaki merata (midfoot strike) untuk mendistribusikan beban secara seimbang.',
          'Lengan berayun santai di dekat pinggul tanpa menyentuh bagian tengah badan.',
        ];
      case 'power':
        return [
          'Mulailah dengan posisi deep squat tegak (sudut paha dan lutut mendekati 90°).',
          'Tarik lengan ke belakang sekuatnya, lalu ayunkan cepat ke atas untuk menambah gaya angkat.',
          'Saat lepas landas (launch phase), luruskan sepenuhnya sendi pergelangan, lutut & pinggul Anda (tri-ekstensi).',
          'Mendaratlah dengan kedua kaki sejajar, tekuk lutut untuk menerima tekanan berat tubuh.',
        ];
      case 'technique':
        return [
          'Pastikan koordinasi rantai kinetik secara berurutan dimulai dari kaki tumpu hingga pergelangan.',
          'Jaga tubuh atas (torso) tetap tegak stabil sebagai stabilizer gerakan rotasi.',
          'Pastikan titik kuncian sudut sikut atau lutut (ekstensi sendi) berada dalam jangkauan lurus.',
          'Lakukan gerakan follow-through yang halus dan terarah tanpa membuang posisimu.',
        ];
    }
  };

  // Compute animated joint coordinates based on trigonometric formulas for different motion patterns
  const getJoints = () => {
    const angle = time * (2 * Math.PI) * 0.7; // Speed scale
    let headX = 100;
    let chestY = 85;
    let hipY = 120;
    const hipX = 100;
    let headY = 55;

    let joints: Record<string, { x: number; y: number }>;

    if (drillType === 'sprint' || drillType === 'endurance') {
      const scale = drillType === 'sprint' ? 1 : 0.6; // Running speed vs Jogging pace
      // Forward lean
      const chestX = 110;
      headX = 118;
      headY = 50;

      // Bobbing up and down
      const bob = Math.sin(angle * 2) * 3;
      chestY += bob;
      hipY += bob;

      // Arms swing
      const swing1 = Math.sin(angle) * 20 * scale;
      const swing2 = -Math.sin(angle) * 20 * scale;

      joints = {
        head: { x: headX, y: headY },
        neck: { x: chestX, y: chestY - 15 },
        shoulder: { x: chestX, y: chestY },
        hip: { x: hipX, y: hipY },
        elbowMin: { x: chestX - 10 + swing1 * 0.4, y: chestY + 15 + swing1 * 0.2 },
        handMin: { x: chestX - 15 + swing1 * 0.7, y: chestY + 30 - Math.abs(swing1) * 0.2 },
        elbowMaj: { x: chestX + 15 + swing2 * 0.4, y: chestY + 15 + swing2 * 0.2 },
        handMaj: { x: chestX + 22 + swing2 * 0.7, y: chestY + 30 - Math.abs(swing2) * 0.2 },
        // Leg 1 running cycle
        knee1: { x: hipX + Math.sin(angle) * 16 * scale, y: hipY + 18 + Math.cos(angle) * 6 * scale },
        ankle1: { x: hipX + Math.sin(angle + 0.5) * 15 * scale, y: hipY + 38 + Math.cos(angle + 0.3) * 10 * scale },
        // Leg 2 running cycle (out of phase)
        knee2: { x: hipX - Math.sin(angle) * 16 * scale, y: hipY + 18 - Math.cos(angle) * 6 * scale },
        ankle2: { x: hipX - Math.sin(angle + 0.5) * 15 * scale, y: hipY + 38 - Math.cos(angle + 0.3) * 10 * scale },
      };
    } else if (drillType === 'agility') {
      // Lateral slide back and forth
      const sidePos = Math.sin(time * Math.PI) * 25;
      const localX = 100 + sidePos;
      const bob = Math.abs(Math.sin(time * Math.PI * 2)) * 4;

      headY = 65 + bob;
      chestY = 90 + bob;
      hipY = 125 + bob;

      // Squatting arms
      joints = {
        head: { x: localX, y: headY },
        neck: { x: localX, y: chestY - 12 },
        shoulder: { x: localX, y: chestY },
        hip: { x: localX, y: hipY },
        elbowMin: { x: localX - 15, y: chestY + 12 },
        handMin: { x: localX - 25, y: chestY + 4 },
        elbowMaj: { x: localX + 15, y: chestY + 12 },
        handMaj: { x: localX + 25, y: chestY + 4 },
        knee1: { x: localX - 18, y: hipY + 14 },
        ankle1: { x: localX - 22, y: hipY + 30 },
        knee2: { x: localX + 18, y: hipY + 14 },
        ankle2: { x: localX + 22, y: hipY + 30 },
      };
    } else if (drillType === 'power') {
      // Jumps in 3-second cycle: squat (0-1.2s), launch (1.2-1.8s), land & recover (1.8-3s)
      const t = time;
      let heightOffset = 0;
      let squatDepth: number;

      if (t < 1.0) {
        // Squat down
        squatDepth = (t / 1.0) * 18;
      } else if (t >= 1.0 && t < 1.6) {
        // Air time
        const airT = (t - 1.0) / 0.6; // 0 to 1
        heightOffset = Math.sin(airT * Math.PI) * 35;
        squatDepth = 18 * (1 - airT); // straight legs
      } else {
        // Land & Recovery
        const recT = (t - 1.6) / 1.4; // 0 to 1
        if (recT < 0.3) {
          squatDepth = 15 * (1 - recT / 0.3); // absorbing impact
        } else {
          squatDepth = 0;
        }
      }

      const activeY = heightOffset;
      const lHeadY = headY - activeY + squatDepth * 0.4;
      const lChestY = chestY - activeY + squatDepth * 0.6;
      const lHipY = hipY - activeY + squatDepth;

      // Arms swing up and down
      const armSwing = t < 1.0 ? 15 : t < 1.6 ? -25 : 10;

      joints = {
        head: { x: headX, y: lHeadY },
        neck: { x: headX, y: lChestY - 12 },
        shoulder: { x: headX, y: lChestY },
        hip: { x: headX, y: lHipY },
        elbowMin: { x: headX - 15, y: lChestY + armSwing },
        handMin: { x: headX - 25, y: lChestY + armSwing * 1.5 },
        elbowMaj: { x: headX + 15, y: lChestY + armSwing },
        handMaj: { x: headX + 25, y: lChestY + armSwing * 1.5 },
        knee1: { x: headX - 12, y: lHipY + 15 + squatDepth * 0.2 },
        ankle1: { x: headX - 12, y: hipY + 38 }, // foot stays relative to ground during standard squat
        knee2: { x: headX + 12, y: lHipY + 15 + squatDepth * 0.2 },
        ankle2: { x: headX + 12, y: hipY + 38 },
      };

      // In air, lift ankles
      if (t >= 1.0 && t < 1.6) {
        joints.ankle1.y = lHipY + 33;
        joints.ankle2.y = lHipY + 33;
      }
    } else {
      // Technique loop: dynamic lunging/kicking/swinging motion
      const lT = time % 2.0;
      let extension: number;
      if (lT < 1.0) {
        extension = lT; // winding up to full extension
      } else {
        extension = 2.0 - lT; // return
      }

      joints = {
        head: { x: headX - 5, y: headY },
        neck: { x: headX - 5, y: chestY - 12 },
        shoulder: { x: headX - 5, y: chestY },
        hip: { x: headX - 8, y: hipY },
        elbowMin: { x: headX - 20, y: chestY + 5 },
        handMin: { x: headX - 30, y: chestY + 12 },
        elbowMaj: { x: headX + 15 + extension * 8, y: chestY - 5 - extension * 10 },
        handMaj: { x: headX + 25 + extension * 22, y: chestY - 15 - extension * 18 },
        knee1: { x: headX - 15, y: hipY + 15 },
        ankle1: { x: headX - 18, y: hipY + 36 },
        knee2: { x: headX + 10 + extension * 15, y: hipY + 8 - extension * 6 },
        ankle2: { x: headX + 20 + extension * 25, y: hipY + 25 - extension * 12 },
      };
    }

    return joints;
  };

  const joints = getJoints();

  return (
    <div className="bg-[#151515] hover:bg-[#1a1a1a] transition-colors border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col md:grid md:grid-cols-5 h-full">
      {/* Simulation Screen */}
      <div className="md:col-span-3 aspect-[4/3] relative bg-[#090909] flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/5 overflow-hidden">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:16px_16px]" />
        
        {/* Biomechanical Calibration Outlines */}
        <div className="absolute inset-x-4 top-4 flex items-center justify-between text-white/40 pointer-events-none">
          <div className="flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-[#D1FF00] animate-pulse" />
            <span className="text-[8px] font-mono tracking-wider">AI_REF_MODEL_V4.2 [LIVE]</span>
          </div>
          <span className="text-[8px] font-mono bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-white/50">
            {drillType.toUpperCase()}
          </span>
        </div>

        {/* Dynamic Skeleton Simulator */}
        <svg viewBox="50 30 100 120" className="w-56 h-56 select-none relative z-10 filter drop-shadow-[0_0_10px_rgba(209,255,0,0.4)]">
          {/* Skeleton bones connection pathways */}
          {joints.head && (
            <>
              {/* Head Circle */}
              <circle cx={joints.head.x} cy={joints.head.y} r="8" fill="none" stroke="#D1FF00" strokeWidth="2" />
              
              {/* Spine & Torso */}
              <line x1={joints.head.x} y1={joints.head.y + 8} x2={joints.neck.x} y2={joints.neck.y} stroke="#D1FF00" strokeWidth="2" />
              <line x1={joints.neck.x} y1={joints.neck.y} x2={joints.shoulder.x} y2={joints.shoulder.y} stroke="#D1FF00" strokeWidth="2" />
              <line x1={joints.shoulder.x} y1={joints.shoulder.y} x2={joints.hip.x} y2={joints.hip.y} stroke="#D1FF00" strokeWidth="2" />

              {/* Arms */}
              <line x1={joints.shoulder.x} y1={joints.shoulder.y} x2={joints.elbowMin.x} y2={joints.elbowMin.y} stroke="#D1FF00" strokeWidth="1.8" strokeDasharray="1,1" />
              <line x1={joints.elbowMin.x} y1={joints.elbowMin.y} x2={joints.handMin.x} y2={joints.handMin.y} stroke="#D1FF00" strokeWidth="1.8" />
              
              <line x1={joints.shoulder.x} y1={joints.shoulder.y} x2={joints.elbowMaj.x} y2={joints.elbowMaj.y} stroke="#D1FF00" strokeWidth="1.8" strokeDasharray="1,1" />
              <line x1={joints.elbowMaj.x} y1={joints.elbowMaj.y} x2={joints.handMaj.x} y2={joints.handMaj.y} stroke="#D1FF00" strokeWidth="1.8" />

              {/* Legs */}
              <line x1={joints.hip.x} y1={joints.hip.y} x2={joints.knee1.x} y2={joints.knee1.y} stroke="#D1FF00" strokeWidth="2.2" />
              <line x1={joints.knee1.x} y1={joints.knee1.y} x2={joints.ankle1.x} y2={joints.ankle1.y} stroke="#D1FF00" strokeWidth="2.2" />

              <line x1={joints.hip.x} y1={joints.hip.y} x2={joints.knee2.x} y2={joints.knee2.y} stroke="#D1FF00" strokeWidth="2.2" />
              <line x1={joints.knee2.x} y1={joints.knee2.y} x2={joints.ankle2.x} y2={joints.ankle2.y} stroke="#D1FF00" strokeWidth="2.2" />

              {/* Joint markers glowing nodes */}
              <circle cx={joints.head.x} cy={joints.head.y} r="2.5" fill="#black" stroke="#D1FF00" strokeWidth="1.5" />
              <circle cx={joints.shoulder.x} cy={joints.shoulder.y} r="2" fill="#black" stroke="#D1FF00" strokeWidth="1.5" />
              <circle cx={joints.hip.x} cy={joints.hip.y} r="2" fill="#black" stroke="#D1FF00" strokeWidth="1.5" />
              <circle cx={joints.elbowMin.x} cy={joints.elbowMin.y} r="2" fill="#black" stroke="#D1FF00" strokeWidth="1.5" />
              <circle cx={joints.elbowMaj.x} cy={joints.elbowMaj.y} r="2" fill="#black" stroke="#D1FF00" strokeWidth="1.5" />
              <circle cx={joints.handMin.x} cy={joints.handMin.y} r="1.5" fill="#D1FF00" />
              <circle cx={joints.handMaj.x} cy={joints.handMaj.y} r="1.5" fill="#D1FF00" />
              <circle cx={joints.knee1.x} cy={joints.knee1.y} r="2.5" fill="#black" stroke="#D1FF00" strokeWidth="1.5" />
              <circle cx={joints.knee2.x} cy={joints.knee2.y} r="2.5" fill="#black" stroke="#D1FF00" strokeWidth="1.5" />
              <circle cx={joints.ankle1.x} cy={joints.ankle1.y} r="2" fill="#black" stroke="#D1FF00" strokeWidth="1.5" />
              <circle cx={joints.ankle2.x} cy={joints.ankle2.y} r="2" fill="#black" stroke="#D1FF00" strokeWidth="1.5" />
            </>
          )}
        </svg>

        {/* Video Player Timeline Overlay */}
        <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 bg-[#000000bd] border border-white/5 px-2.5 py-1.5 rounded-lg">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-5 h-5 rounded flex items-center justify-center bg-white/5 hover:bg-[#D1FF00]/10 hover:text-[#D1FF00] border border-white/10 active:scale-95 transition-all text-white/80"
          >
            {isPlaying ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
          </button>
          
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden relative">
            <div
              className="absolute left-0 top-0 h-full bg-[#D1FF00]"
              style={{ width: `${(time / (drillType === 'power' ? 3.0 : 2.0)) * 100}%` }}
            />
          </div>

          <span className="text-[7px] font-mono text-white/50 shrink-0">
            00:0{Math.floor(time)} : 00:0{drillType === 'power' ? 3 : 2}
          </span>
        </div>
      </div>

      {/* Guide details column */}
      <div className="md:col-span-2 p-3.5 sm:p-4 flex flex-col justify-get">
        <div className="flex items-center gap-1.5 text-[#D1FF00] mb-2">
          <Sparkles className="w-4 h-4 shrink-0" />
          <h4 className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider">Video Contoh Gerakan</h4>
        </div>
        
        <p className="text-[10px] sm:text-xs text-white/80 font-bold mb-1 leading-tight">{label}</p>
        <p className="text-[8px] text-white/40 mb-3.5 leading-relaxed">
          Tirulah contoh model biomekanik di atas seakurat mungkin saat kamera dalam posisi merekam.
        </p>

        <div className="border-t border-white/5 pt-3 flex-1">
          <div className="flex items-center gap-1 text-white/60 mb-2">
            <Flame className="w-3 h-3 text-[#D1FF00]" />
            <span className="text-[8px] font-bold uppercase tracking-widest">Fokus Analisis AI:</span>
          </div>
          
          <ul className="space-y-1.5">
            {getGuidelines().map((tip, idx) => (
              <li key={idx} className="flex gap-1.5 items-start">
                <ShieldCheck className="w-3 h-3 text-[#D1FF00] shrink-0 mt-0.5" />
                <span className="text-[8px] text-white/60 leading-normal">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
