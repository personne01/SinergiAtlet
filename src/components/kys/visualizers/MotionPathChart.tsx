import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { LandmarkFrame } from '../../../types';
import { computeVelocityAndAcceleration } from '../../../lib/motion/kinematics';

interface MotionPathChartProps {
  frames: LandmarkFrame[];
  width?: string;
  height?: number;
}

export default function MotionPathChart({ frames, width = "100%", height = 150 }: MotionPathChartProps) {
  const chartData = useMemo(() => {
    if (!frames.length) return [];
    const motion = computeVelocityAndAcceleration(frames);
    return frames.map((f, i) => ({
      time: (f.timestamp / 1000).toFixed(1), // seconds
      velocity: motion.velocity[i] || 0,
      acceleration: motion.acceleration[i] || 0,
    }));
  }, [frames]);

  if (chartData.length === 0) return null;

  return (
    <div className="w-full bg-black/40 border border-white/5 rounded-xl p-3">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/50">Analisis Kinematika</h4>
        <div className="flex gap-2">
           <span className="text-[8px] text-[#D1FF00] flex items-center gap-1"><div className="w-1.5 h-1.5 bg-[#D1FF00] rounded-full"/> Kecepatan (m/s)</span>
           <span className="text-[8px] text-white/40 flex items-center gap-1"><div className="w-1.5 h-1.5 bg-white/40 rounded-full"/> Akselerasi (m/s²)</span>
        </div>
      </div>
      <div style={{ width, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D1FF00" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#D1FF00" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide />
            <YAxis hide />
            <Tooltip
               contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '10px' }}
               itemStyle={{ color: '#D1FF00', fontWeight: 'bold' }}
               labelStyle={{ display: 'none' }}
            />
            <Area type="monotone" dataKey="acceleration" stroke="rgba(255,255,255,0.2)" fill="transparent" strokeWidth={1} />
            <Area type="monotone" dataKey="velocity" stroke="#D1FF00" fillOpacity={1} fill="url(#colorVelocity)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
