import { distance3D } from './kinematics';

export function computeJointAngle3D(a: any, b: any, c: any): number {
  if (!a || !b || !c) return 0;
  const v1 = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  const v2 = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };
  
  const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  const mag1 = Math.sqrt(v1.x*v1.x + v1.y*v1.y + v1.z*v1.z);
  const mag2 = Math.sqrt(v2.x*v2.x + v2.y*v2.y + v2.z*v2.z);
  
  if (mag1 === 0 || mag2 === 0) return 0;
  
  return Math.acos(Math.min(1, Math.max(-1, dot / (mag1 * mag2)))) * (180 / Math.PI);
}

export function evaluateSymmetry(frames: any[]): number {
  if (frames.length === 0) return 0;
  
  let totalVariance = 0;
  for (const f of frames) {
    const leftElbow = computeJointAngle3D(f.landmarks[11], f.landmarks[13], f.landmarks[15]);
    const rightElbow = computeJointAngle3D(f.landmarks[12], f.landmarks[14], f.landmarks[16]);
    
    const leftKnee = computeJointAngle3D(f.landmarks[23], f.landmarks[25], f.landmarks[27]);
    const rightKnee = computeJointAngle3D(f.landmarks[24], f.landmarks[26], f.landmarks[28]);
    
    totalVariance += Math.abs(leftElbow - rightElbow) + Math.abs(leftKnee - rightKnee);
  }
  
  // Return average angular variance across both sides
  return totalVariance / frames.length;
}

export function evaluateStability(frames: any[]): number {
  if (frames.length === 0) return 0;
  
  // Center of Gravity deviation along X axis relative to feet spacing
  let deviationSum = 0;
  for (const f of frames) {
      if (!f.landmarks[23] || !f.landmarks[27] || !f.landmarks[28]) continue;
      
      const cx = (f.landmarks[23].x + f.landmarks[24].x) / 2; // Mid pelvis
      const feetMidX = (f.landmarks[27].x + f.landmarks[28].x) / 2; // Mid ankles
      
      deviationSum += Math.abs(cx - feetMidX);
  }
  
  return deviationSum / frames.length;
}
