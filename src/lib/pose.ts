const POSE_LANDMARKS = {
  nose: 0,
  leftEyeInner: 1, leftEye: 2, leftEyeOuter: 3,
  rightEyeInner: 4, rightEye: 5, rightEyeOuter: 6,
  leftEar: 7, rightEar: 8,
  mouthLeft: 9, mouthRight: 10,
  leftShoulder: 11, rightShoulder: 12,
  leftElbow: 13, rightElbow: 14,
  leftWrist: 15, rightWrist: 16,
  leftPinky: 17, rightPinky: 18,
  leftIndex: 19, rightIndex: 20,
  leftThumb: 21, rightThumb: 22,
  leftHip: 23, rightHip: 24,
  leftKnee: 25, rightKnee: 26,
  leftAnkle: 27, rightAnkle: 28,
  leftHeel: 29, rightHeel: 30,
  leftFoot: 31, rightFoot: 32,
} as const;

export type PoseLandmarkName = keyof typeof POSE_LANDMARKS;

export function getPoseIndex(name: PoseLandmarkName): number {
  return POSE_LANDMARKS[name];
}

export function hipCenter(landmarks: { x: number; y: number }[]) {
  if (!landmarks[23] || !landmarks[24]) return null;
  return {
    x: (landmarks[23].x + landmarks[24].x) / 2,
    y: (landmarks[23].y + landmarks[24].y) / 2,
  };
}

export function shoulderCenter(landmarks: { x: number; y: number }[]) {
  if (!landmarks[11] || !landmarks[12]) return null;
  return {
    x: (landmarks[11].x + landmarks[12].x) / 2,
    y: (landmarks[11].y + landmarks[12].y) / 2,
  };
}

export function angleBetween(
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number },
): number {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const mag = Math.sqrt(ab.x * ab.x + ab.y * ab.y) * Math.sqrt(cb.x * cb.x + cb.y * cb.y);
  if (mag === 0) return 0;
  return Math.acos(Math.min(1, Math.max(-1, dot / mag))) * (180 / Math.PI);
}

export function distance2D(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function computeSpeedMps(
  frames: { timestamp: number; landmarks: { x: number; y: number }[] }[],
): { avg: number; max: number } {
  if (frames.length < 2) return { avg: 0, max: 0 };
  let totalDistPx = 0;
  let maxSpeedPx = 0;
  let prev = hipCenter(frames[0].landmarks);
  for (let i = 1; i < frames.length; i++) {
    const curr = hipCenter(frames[i].landmarks);
    if (!prev || !curr) { prev = curr; continue; }
    const dist = distance2D(prev, curr);
    const dt = (frames[i].timestamp - frames[i - 1].timestamp) / 1000;
    const speed = dt > 0 ? dist / dt : 0;
    totalDistPx += dist;
    if (speed > maxSpeedPx) maxSpeedPx = speed;
    prev = curr;
  }
  return {
    avg: totalDistPx / (frames.length - 1),
    max: maxSpeedPx,
  };
}

export function countDirectionChanges(
  frames: { landmarks: { x: number; y: number }[] }[],
  angleThreshold = 30,
): number {
  if (frames.length < 3) return 0;
  const prev = frames[0].landmarks;
  const cur = frames[1].landmarks;
  let hipPrev = hipCenter(prev);
  let hipCur = hipCenter(cur);
  if (!hipPrev || !hipCur) return 0;
  let prevVector = { x: hipCur.x - hipPrev.x, y: hipCur.y - hipPrev.y };
  let changes = 0;
  for (let i = 2; i < frames.length; i++) {
    hipPrev = hipCur;
    hipCur = hipCenter(frames[i].landmarks);
    if (!hipPrev || !hipCur) continue;
    const currVector = { x: hipCur.x - hipPrev.x, y: hipCur.y - hipPrev.y };
    const dot = prevVector.x * currVector.x + prevVector.y * currVector.y;
    const mag = Math.sqrt(prevVector.x ** 2 + prevVector.y ** 2) * Math.sqrt(currVector.x ** 2 + currVector.y ** 2);
    if (mag > 0) {
      const angle = Math.acos(Math.min(1, Math.max(-1, dot / mag))) * (180 / Math.PI);
      if (angle > angleThreshold) changes++;
    }
    prevVector = currVector;
  }
  return changes;
}

export function computeJointAngles(
  landmarks: { x: number; y: number }[],
  joints: [PoseLandmarkName, PoseLandmarkName, PoseLandmarkName][],
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [a, b, c] of joints) {
    const pA = landmarks[getPoseIndex(a)];
    const pB = landmarks[getPoseIndex(b)];
    const pC = landmarks[getPoseIndex(c)];
    if (!pA || !pB || !pC) continue;
    result[`${a}_${b}_${c}`] = angleBetween(pA, pB, pC);
  }
  return result;
}

export function computeJumpHeight(
  frames: { landmarks: { x: number; y: number }[] }[],
): number {
  let minY = Infinity;
  let maxY = -Infinity;
  for (const frame of frames) {
    const hc = hipCenter(frame.landmarks);
    if (hc) {
      if (hc.y < minY) minY = hc.y;
      if (hc.y > maxY) maxY = hc.y;
    }
  }
  return maxY - minY;
}
