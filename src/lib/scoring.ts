import type { LandmarkFrame, PoseMetrics, VideoAnalysisConfig } from '../types';
import { computeSpeedMps, countDirectionChanges, computeJointAngles, computeJumpHeight } from './pose';

export function normalizeScore(
  value: number,
  higherIsBetter: boolean,
  minRecommended?: number,
  maxRecommended?: number,
): number {
  if (!minRecommended && !maxRecommended) return Math.min(Math.max(value, 0), 100);
  const min = minRecommended ?? 0;
  const max = maxRecommended ?? (higherIsBetter ? 100 : 0);
  if (max === min) return 50;
  if (higherIsBetter) {
    if (value >= max) return 100;
    if (value <= min) return 0;
    return Math.round(((value - min) / (max - min)) * 100);
  } else {
    if (value <= min) return 100;
    if (value >= max) return 0;
    return Math.round(((max - value) / (max - min)) * 100);
  }
}

export function computeDimensionScore(items: { score: number }[]): number {
  if (items.length === 0) return 0;
  return Math.round(items.reduce((sum, i) => sum + i.score, 0) / items.length);
}

export function extractPoseMetrics(
  frames: LandmarkFrame[],
  config: VideoAnalysisConfig,
): PoseMetrics {
  if (frames.length === 0) return {};

  const metrics: PoseMetrics = {
    detectedFrames: frames.length,
    confidence: frames.reduce((s, f) => {
      const avg = f.landmarks.reduce((v, lm) => v + lm.visibility, 0) / f.landmarks.length;
      return s + avg;
    }, 0) / frames.length * 100,
  };

  switch (config.drillType) {
    case 'sprint': {
      const speed = computeSpeedMps(frames);
      metrics.avgSpeedMps = Math.round(speed.avg * 100) / 100;
      metrics.maxSpeedMps = Math.round(speed.max * 100) / 100;
      break;
    }
    case 'agility': {
      const pathDist = frames.length > 1
        ? frames.slice(1).reduce((sum, frame, i) => {
            const prev = frames[i].landmarks;
            const curr = frame.landmarks;
            if (!prev[23] || !prev[24] || !curr[23] || !curr[24]) return sum;
            const dx = ((curr[23].x + curr[24].x) / 2) - ((prev[23].x + prev[24].x) / 2);
            const dy = ((curr[23].y + curr[24].y) / 2) - ((prev[23].y + prev[24].y) / 2);
            return sum + Math.sqrt(dx * dx + dy * dy);
          }, 0)
        : 0;
      metrics.pathLengthPx = Math.round(pathDist * 100) / 100;
      metrics.directionChanges = countDirectionChanges(frames, 30);
      break;
    }
    case 'technique': {
      if (config.referenceAngles && frames.length > 0) {
        const midFrame = frames[Math.floor(frames.length / 2)];
        const joints: [string, string, string][] = Object.keys(config.referenceAngles).map((k) => {
          const parts = k.split('_');
          return [parts[0], parts[1], parts[2]] as [string, string, string];
        });
        const measured = computeJointAngles(
          midFrame.landmarks,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          joints as any,
        );
        metrics.jointAngles = measured;
        metrics.movementSmoothness = 100;
      }
      break;
    }
    case 'power': {
      metrics.maxJumpHeightPx = Math.round(computeJumpHeight(frames) * 100) / 100;
      break;
    }
  }

  return metrics;
}

export function metricsToScores(
  metrics: PoseMetrics,
  config: VideoAnalysisConfig,
): number {
  let rawValue = 0;
  switch (config.primaryMetric) {
    case 'speed':
      rawValue = metrics.maxSpeedMps ?? metrics.avgSpeedMps ?? 0;
      break;
    case 'path_length':
      rawValue = metrics.pathLengthPx ?? 0;
      break;
    case 'direction_changes':
      rawValue = metrics.directionChanges ?? 0;
      break;
    case 'angle_deviation': {
      if (!metrics.jointAngles || !config.referenceAngles) return 0;
      let totalDeviation = 0;
      let count = 0;
      for (const [key, refAngle] of Object.entries(config.referenceAngles)) {
        const measured = metrics.jointAngles[key];
        if (measured !== undefined) {
          totalDeviation += Math.abs(measured - refAngle);
          count++;
        }
      }
      rawValue = count > 0 ? totalDeviation / count : 0;
      break;
    }
    case 'height':
      rawValue = metrics.maxJumpHeightPx ?? 0;
      break;
    case 'count':
      rawValue = metrics.directionChanges ?? 0;
      break;
  }

  if (config.primaryMetric === 'angle_deviation') {
    return normalizeScore(rawValue, false, config.minRecommended, config.maxRecommended);
  }
  return normalizeScore(rawValue, config.higherIsBetter, config.minRecommended, config.maxRecommended);
}
