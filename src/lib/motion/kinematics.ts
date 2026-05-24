import type { LandmarkFrame } from '../../types';

export function distance3D(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
}

// Convert normalized 3D space to approximate meters using average human height reference
// MediaPipe normalized coords: x, y are [0, 1], z is relative scale.
// Using shoulder to hip distance (~0.5m) to normalize
export function estimateScaleFactor(frame: LandmarkFrame): number {
  const leftShoulder = frame.landmarks[11];
  const leftHip = frame.landmarks[23];
  if (!leftShoulder || !leftHip) return 1.0;
  
  const dist = distance3D(leftShoulder, leftHip);
  // Assume torso length is ~0.5 meters
  return 0.5 / (dist || 1);
}

export function computeVelocityAndAcceleration(frames: LandmarkFrame[]) {
  if (frames.length < 2) return { velocity: [], acceleration: [], maxV: 0, peakA: 0 };
  
  let maxV = 0;
  let peakA = 0;
  const velocity: number[] = [0];
  const acceleration: number[] = [0, 0];

  const scale = estimateScaleFactor(frames[0]);

  for (let i = 1; i < frames.length; i++) {
    const prev = frames[i - 1];
    const curr = frames[i];
    
    // Hip center mass approximation
    const cHip = { 
      x: (curr.landmarks[23].x + curr.landmarks[24].x) / 2,
      y: (curr.landmarks[23].y + curr.landmarks[24].y) / 2,
      z: (curr.landmarks[23].z + curr.landmarks[24].z) / 2
    };
    const pHip = {
      x: (prev.landmarks[23].x + prev.landmarks[24].x) / 2,
      y: (prev.landmarks[23].y + prev.landmarks[24].y) / 2,
      z: (prev.landmarks[23].z + prev.landmarks[24].z) / 2
    };

    const distMeters = distance3D(pHip, cHip) * scale;
    const dtSeconds = (curr.timestamp - prev.timestamp) / 1000;
    
    const v = dtSeconds > 0 ? Math.abs(distMeters / dtSeconds) : 0;
    velocity.push(v);
    if (v > maxV) maxV = v;

    if (i > 1) {
      const a = dtSeconds > 0 ? Math.abs((v - velocity[i-1]) / dtSeconds) : 0;
      acceleration.push(a);
      if (a > peakA) peakA = a;
    }
  }

  return { velocity, acceleration, maxV, peakA };
}
