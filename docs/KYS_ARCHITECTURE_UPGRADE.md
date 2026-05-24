# SinergiAtlet KYS Architecture Upgrade Plan

This document outlines the incremental, production-grade architectural upgrade for the KYS (Knowing Your Skill) AI athlete assessment system. It builds upon the existing React 19, Vite, Express, Firestore, and MediaPipe stack.

## 1. Video Validation System

### Architecture
To ensure high-qualify assessment, validation must occur **temporally** across a small sliding window (e.g., 30 frames) before allowing recording.

**Validation Flow:**
1. Request Camera Access
2. Stream to `<video>` (hidden/overlayed) and feed to `requestAnimationFrame` loop.
3. MediaPipe continuously processes frames at target FPS.
4. `ValidationEngine` checks:
   - Full body visibility (`visibility` score of all 33 landmarks > 0.65).
   - Athlete centering (Hip landmarks near 0.5 X-axis).
   - Lighting/Blur (Calculated via WebGL or lightweight Canvas pixel variance).
5. State transitions from `CALIBRATING` -> `READY`.

### Component Structure
```text
src/
  components/kys/
    CameraValidator.tsx     # Handles stream, UI feedback
    ValidationOverlay.tsx   # Visual status indicators
  hooks/
    useCameraValidation.ts  # Logic for temporal frame checks
```

### TypeScript Sample
```typescript
interface ValidationState {
  isBodyVisible: boolean;
  isCentered: boolean;
  isStable: boolean;
  lightingQuality: number;
  overallReady: boolean;
}

export function validateFrame(landmarks: NormalizedLandmarkList, poseConfidence: number): ValidationState {
  const isBodyVisible = landmarks.every(lm => lm.visibility > 0.65);
  // Center check using left and right hips (landmarks 23, 24)
  const cx = (landmarks[23].x + landmarks[24].x) / 2;
  const isCentered = cx > 0.4 && cx < 0.6;
  
  return {
    isBodyVisible,
    isCentered,
    isStable: poseConfidence > 0.8,
    lightingQuality: 1.0, // Canvas luma variance
    overallReady: isBodyVisible && isCentered && poseConfidence > 0.8
  };
}
```

## 2. Camera Guide Overlay

### Architecture
A responsive SVG/Canvas overlay mapped over the video feed outlining the "safe recording zone."

### Design
- **Body Framing Guide**: An elliptical or dashed-box structure mapping the ideal head-to-toe region.
- **Directional Feedback**: Chevron animations pointing left/right/back if the athlete is out of bounds.

```tsx
// src/components/kys/CameraGuideOverlay.tsx
import { motion } from "motion/react";

export function CameraGuideOverlay({ validation }: { validation: ValidationState }) {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
      <motion.div 
        animate={{ borderColor: validation.overallReady ? "#D1FF00" : "#ef4444" }}
        className="w-[80vw] h-[90vh] border-4 border-dashed rounded-[3rem] transition-colors"
      />
      {!validation.isBodyVisible && (
        <div className="absolute top-10 bg-red-500 text-white px-4 py-2 rounded-full font-bold">
          Step back to fit full body
        </div>
      )}
    </div>
  );
}
```

## 3. MediaPipe Processing Upgrade

### Optimizing 1 FPS to 30 FPS
Currently, running at 1 FPS causes massive data loss. To run at 15-30 FPS in-browser without blocking the main thread:

1. **Web Worker Offloading**: Move the MediaPipe `PoseLandmarker.detectForVideo()` and all array computations to a dedicated Web Worker.
2. **OffscreenCanvas**: Pass the camera stream to the Web Worker via `ImageBitmap` or `OffscreenCanvas`.
3. **Temporal Smoothing**: Apply a One Euro Filter or Simple Moving Average (SMA) across contiguous frames to eliminate tracking jitter.

```typescript
// src/workers/mediapipe.worker.ts
// Receives ImageBitmap, runs tracking, applies filter, posts smoothed joints.
self.onmessage = async (e) => {
  const { imageBitmap, timestamp } = e.data;
  const result = poseLandmarker.detectForVideo(imageBitmap, timestamp);
  const smoothed = applyOneEuroFilter(result.landmarks);
  self.postMessage({ landmarks: smoothed, timestamp });
  imageBitmap.close(); // GC optimization
};
```

## 4. Temporal Motion Analysis

### Mathematical Engine
Moving beyond static poses requires cross-frame kinematics.

**Calculations:**
- **Velocity ($v$)**: $\Delta \text{position} / \Delta \text{time}$ (calculate distance using Euclidean distance in 3D landmark space).
- **Acceleration ($a$)**: $\Delta v / \Delta \text{time}$ (identifies explosive power).
- **Joint Angles**: $\cos^{-1} \left( \frac{\mathbf{u} \cdot \mathbf{v}}{|\mathbf{u}| |\mathbf{v}|} \right)$ for knees, elbows, hips.

**Implementation Structure**:
```text
src/
  lib/
    motion/
      kinematics.ts (Velocity, Acceleration)
      biomechanics.ts (Angles, Symmetry, Balance based on Center of Mass)
      filters.ts (OneEuro, SMA)
```

## 5. Scoring Engine Refactor

### Dynamic Drill Configuration
Instead of generic constraints, we define sport-specific schemas (e.g., Football, Badminton, Taekwondo).

```typescript
// src/lib/scoring/configs/football.ts
export const FOOTBALL_AGILITY_DRILL: DrillConfig = {
  id: 'fb_agility_t_test',
  mechanics: [
    { type: 'SPEED', weight: 0.4, thresholdVelocity: 2.5 }, // m/s normalized
    { type: 'CG_STABILITY', weight: 0.3, maxDeviationX: 0.15 }, 
    { type: 'SYMMETRY', weight: 0.3, varianceThreshold: 0.05 }
  ],
  durationMs: 15000,
};

// src/lib/scoring/configs/badminton.ts
export const BADMINTON_FOOTWORK_DRILL: DrillConfig = {
  id: 'bt_speed_6point',
  mechanics: [
    { type: 'SPEED', weight: 0.5, thresholdVelocity: 3.0 },
    { type: 'REACTION_TIME', weight: 0.3, maxDelayMs: 250 },
    { type: 'KNEE_FLEXION', weight: 0.2, minAngle: 90, maxAngle: 120 }
  ],
  durationMs: 20000,
};

// src/lib/scoring/configs/taekwondo.ts
export const TAEKWONDO_KICK_DRILL: DrillConfig = {
  id: 'tk_power_roundhouse',
  mechanics: [
    { type: 'EXPLOSIVENESS', weight: 0.5, peakAcceleration: 15.0 }, // m/s^2
    { type: 'HIP_ROTATION', weight: 0.3, minRotationAngle: 75 },
    { type: 'BALANCE', weight: 0.2, maxDeviationX: 0.10 }
  ],
  durationMs: 10000,
};
```
The configurable `AssessmentEngine` dynamically instantiates these formulas based on the selected drill, calculating a weighted composite score iteratively across the frame sequence.

## 6. KYS Flow Redesign

### Target UX Flow (React Router)
`Select Sport -> Select Skill -> Setup -> Calibrate -> Record -> Process -> Result`

1. `/kys/setup` — Camera permissions, device check.
2. `/kys/calibrate` — Athlete stands in frame. `ValidationEngine` turns green. "Hold for 3 seconds..."
3. `/kys/record` — Countdown (3..2..1). Records 15-30s. Visual timer. Worker is analyzing in real-time.
4. `/kys/processing` — AI analysis (calculating kinetics, generating insights).
5. `/kys/result/:id` — Feedback dashboard (Score, Motion Path, Insights).

## 7. Firestore Schema Improvement

### Improved Structure
```json
// sport_assessment_sessions
{
  "id": "doc_id",
  "athleteId": "user_id",
  "sportId": "bulutangkis", // e.g., sepak_bola, bulutangkis, taekwondo
  "drillId": "bt_speed_6point",
  "status": "completed",
  "recordingQuality": { "fps": 28, "lighting": 0.85, "visibility": 0.98 },
  "scores": {
    "composite": 85,
    "speed": 88,
    "stability": 82
  },
  "kinematicsId": "storage_or_doc_ref" // Massive JSON of timeline data saved to Cloud Storage, NOT Firestore doc
}
```
*Note: Storing 30FPS landmark data in Firestore will exceed document limits. We must store the raw timeseries array in Firebase Cloud Storage (JSON/Parquet file) and keep only aggregated metrics in Firestore.*

## 8. Recording Quality Score

### Formula
$Q_{\text{total}} = (W_{fps} \times Q_{fps}) + (W_{vis} \times Q_{vis}) + (W_{stable} \times Q_{stable})$

```typescript
function calculateRecordingQuality(stats: SessionStats): QualityScore {
  const fpsScore = Math.min(stats.avgFps / 24, 1.0); // 24 FPS is baseline 100%
  const visScore = stats.framesWithFullVisibility / stats.totalFrames;
  
  return {
    score: (fpsScore * 0.3) + (visScore * 0.7),
    isAcceptable: (fpsScore * 0.3) + (visScore * 0.7) > 0.75,
    message: visScore < 0.6 ? "Tubuh sering terpotong dari frame." : "Kualitas rekaman baik."
  };
}
```

## 9. Result Visualization

### Visual Components
Post-assessment UI should look like a professional HUD.

- **Skeleton Overlay Player**: Replays the video using `<canvas>` drawn over the video element, rendering the specific joints in red when they break acceptable mechanic angles.
- **Motion Path Chart**: Use Recharts to plot joint velocity over time.
- **Insights List**: Actionable feedback generated from biomechanical aberrations (e.g., "Knee valgus detected on directional change").

## 10. Performance Optimization

### Strategy for Low-End Devices
- **Resolution Downgrade**: Capture video in `640x480` for AI processing to reduce memory bandwidth; keep high-res for UI playback if needed.
- **Frame Skipping Strategy**: If Web Worker queue size exceeds 2 frames, skip a frame to prevent memory leaks and UI freezing.
- **Float32Arrays**: Use typed arrays for all kinematic calculations and worker messaging.

## 11. Codebase Refactor Plan

### Target Architecture
```text
src/
  components/
    kys/
      setup/         # Permissions, Hardware
      capture/       # Calibration, ValidationOverlay, MediaPipe Worker Interface
      visualizers/   # Post-analysis canvas drawing
  lib/
    ai/
      workers/       # pose.worker.ts
      filters/       # OneEuro.ts
    biomechanics/    # kinematics.ts, angles.ts
    scoring/
      configs/       # football.ts, badminton.ts
      engine.ts      # The main aggregator
```

### Phased Implementation Roadmap
1. **Phase 1: Stabilization & Web Workers**
   - Move MediaPipe detection into a Web Worker. Upgrade to 15-30 FPS capability without UI degradation.
2. **Phase 2: Validation & Calibration UX**
   - Build `/kys/calibrate`. Implement `ValidationOverlay` and the `validateFrame` logic.
3. **Phase 3: Biomechanical Math Engine**
   - Implement `kinematics.ts`. Calculate speed, accel, and angles on the tracked data.
4. **Phase 4: Drill-Specific Scoring & Storage**
   - Define drill scoring configurations for multiple sports (e.g., Football Agility, Badminton Footwork, Taekwondo Kicks). Store aggregate metrics in Firestore and timeseries in Storage.
5. **Phase 5: Advanced Visualizations**
   - Build the post-assessment HUD with skeleton replay and Recharts overlays.

---
*End of Blueprint. No existing UI or backend workflows need to be rewritten, only extended via abstraction.*
