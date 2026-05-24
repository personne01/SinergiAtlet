import type { LandmarkFrame, DrillConfig } from '../../types';
import { computeVelocityAndAcceleration } from '../motion/kinematics';
import { evaluateSymmetry, evaluateStability } from '../motion/biomechanics';
import { smoothFramesSMA } from '../motion/smoothing';

// The AssessmentEngine implements the customizable drill logic
// Returns the score out of 100
export class AssessmentEngine {
  
  static processDrill(rawFrames: LandmarkFrame[], config: DrillConfig): { score: number, details: any } {
    if (rawFrames.length === 0) return { score: 0, details: {} };
    
    // 1. Temporal Smoothing to remove jitter
    const frames = smoothFramesSMA(rawFrames, 3);
    
    const details: any = {};

    
    // First, pre-compute physics
    const motion = computeVelocityAndAcceleration(frames);
    const symmetryVariance = evaluateSymmetry(frames);
    const instability = evaluateStability(frames);

    const scoresForMechanics = config.mechanics.map((mechanic) => {
      let subScore;
      let rawValue = 0;
      
      switch (mechanic.type) {
        case 'SPEED':
          rawValue = motion.maxV;
          subScore = Math.min(100, (rawValue / (mechanic.thresholdVelocity || 2.5)) * 100);
          break;
        case 'EXPLOSIVENESS':
        case 'ACCELERATION':
          rawValue = motion.peakA;
          subScore = Math.min(100, (rawValue / (mechanic.peakAcceleration || 10.0)) * 100);
          break;
        case 'CG_STABILITY':
        case 'BALANCE':
          rawValue = instability;
          // Inverted: lower derivation means higher score
          subScore = Math.max(0, 100 - (rawValue / (mechanic.maxDeviationX || 0.15)) * 100);
          break;
        case 'SYMMETRY':
          rawValue = symmetryVariance;
          subScore = Math.max(0, 100 - (rawValue / (mechanic.varianceThreshold || 10)) * 100);
          break;
        case 'KNEE_FLEXION':
        case 'HIP_ROTATION':
        case 'REACTION_TIME':
          // Placeholder scores for these since we need specific joint targeting
          rawValue = 80; // Placeholder
          subScore = 80;
          break;
        default:
          subScore = 50;
      }
      
      details[mechanic.type] = { rawValue, subScore, weight: mechanic.weight };
      return subScore * mechanic.weight;
    });

    const totalScore = scoresForMechanics.reduce((sum, score) => sum + score, 0);

    return {
       score: Math.round(totalScore),
       details
    };
  }
}
