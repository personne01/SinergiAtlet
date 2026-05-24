import type { LandmarkFrame, LandmarkPoint } from '../../types';

/**
 * Simple Moving Average (SMA) smoothing for 3D landmark sequences.
 * 
 * @param frames Raw landmark frames
 * @param windowSize Number of frames to average (e.g., 3 or 5)
 * @returns Smoothed frames
 */
export function smoothFramesSMA(frames: LandmarkFrame[], windowSize: number = 3): LandmarkFrame[] {
  if (frames.length < windowSize) return frames;

  const smoothedFrames: LandmarkFrame[] = [];
  const halfWindow = Math.floor(windowSize / 2);

  for (let i = 0; i < frames.length; i++) {
    const start = Math.max(0, i - halfWindow);
    const end = Math.min(frames.length - 1, i + halfWindow);
    const count = end - start + 1;

    const currentFrame = frames[i];
    const smoothedLandmarks = currentFrame.landmarks.map((_, landmarkIndex) => {
      let sumX = 0, sumY = 0, sumZ = 0, sumVis = 0;

      for (let j = start; j <= end; j++) {
        const pt = frames[j].landmarks[landmarkIndex];
        sumX += pt.x;
        sumY += pt.y;
        sumZ += pt.z;
        sumVis += pt.visibility || 0;
      }

      return {
        x: sumX / count,
        y: sumY / count,
        z: sumZ / count,
        visibility: sumVis / count
      };
    });

    smoothedFrames.push({
      timestamp: currentFrame.timestamp,
      landmarks: smoothedLandmarks
    });
  }

  return smoothedFrames;
}

/**
 * Low-Pass Filter (Exponential Moving Average)
 * Good for real-time streaming where we don't have future frames.
 */
export function applyLowPassFilter(
  previousSmoothed: LandmarkPoint[],
  currentRaw: LandmarkPoint[],
  alpha: number = 0.5 // 0 to 1. Higher = trust raw more (less smoothing)
): LandmarkPoint[] {
  if (!previousSmoothed || previousSmoothed.length === 0) return currentRaw;

  return currentRaw.map((curr, i) => {
    const prev = previousSmoothed[i];
    return {
      x: prev.x + alpha * (curr.x - prev.x),
      y: prev.y + alpha * (curr.y - prev.y),
      z: prev.z + alpha * (curr.z - prev.z),
      visibility: curr.visibility
    };
  });
}
