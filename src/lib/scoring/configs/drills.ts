import type { DrillConfig } from '../../../types';

export const FOOTBALL_AGILITY_DRILL: DrillConfig = {
  id: 'fb_agility_t_test',
  mechanics: [
    { type: 'SPEED', weight: 0.4, thresholdVelocity: 2.5 }, // m/s normalized
    { type: 'CG_STABILITY', weight: 0.3, maxDeviationX: 0.15 }, 
    { type: 'SYMMETRY', weight: 0.3, varianceThreshold: 0.05 }
  ],
  durationMs: 15000,
};

export const BADMINTON_FOOTWORK_DRILL: DrillConfig = {
  id: 'bt_speed_6point',
  mechanics: [
    { type: 'SPEED', weight: 0.5, thresholdVelocity: 3.0 },
    { type: 'REACTION_TIME', weight: 0.3, maxDelayMs: 250 },
    { type: 'KNEE_FLEXION', weight: 0.2, minAngle: 90, maxAngle: 120 }
  ],
  durationMs: 20000,
};

export const TAEKWONDO_KICK_DRILL: DrillConfig = {
  id: 'tk_power_roundhouse',
  mechanics: [
    { type: 'EXPLOSIVENESS', weight: 0.5, peakAcceleration: 15.0 }, // m/s^2
    { type: 'HIP_ROTATION', weight: 0.3, minRotationAngle: 75 },
    { type: 'BALANCE', weight: 0.2, maxDeviationX: 0.10 }
  ],
  durationMs: 10000,
};

// Generic mapping getter based on drill ID
export function getDrillConfigById(id: string): DrillConfig {
  if (id.includes('agility') || id.includes('t_test')) return FOOTBALL_AGILITY_DRILL;
  if (id.includes('badminton') || id.includes('footwork')) return BADMINTON_FOOTWORK_DRILL;
  if (id.includes('taekwondo') || id.includes('kick')) return TAEKWONDO_KICK_DRILL;
  
  // Default generic drill
  return {
    id: id,
    mechanics: [
      { type: 'SPEED', weight: 0.5, thresholdVelocity: 2.0 },
      { type: 'SYMMETRY', weight: 0.5, varianceThreshold: 0.1 }
    ],
    durationMs: 15000
  };
}
