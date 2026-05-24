# SinergiAtlet KYS - Athlete UX Recording Upgrade

This document outlines the UX architecture, component hierarchy, and animation strategy for an athlete-friendly AI sports assessment recording experience.

## 1. Core Principles
- **Mobile-First**: Athletes record themselves primarily using mobile phones on tripods or propped against objects.
- **High-Visibility (Outdoor-Ready)**: Strong contrast, large typography, and glowing overlays (#D1FF00) to ensure readability in bright sunlight.
- **Progressive Disclosure**: Guide the athlete step-by-step (Setup -> Calibrate -> Record -> Analyze). Do not overwhelm them with all instructions at once.

## 2. Component Hierarchy

```text
src/components/kys/
├── KYSFlowContainer.tsx          # Main state machine (Phase: Setup -> Calibrate -> Record -> Uploading -> Analyzing -> Result)
├── setup/
│   ├── PermissionsPrompt.tsx     # Camera microphone access
│   ├── DeviceCheck.tsx           # Environment check (Lighting, orientation)
│   └── InstructionCard.tsx       # Specific drill movement instructions
├── capture/
│   ├── LiveVideoOverlay.tsx      # Video container
│   ├── ValidationOverlay.tsx     # Framer Motion guided box (Red -> Yellow -> Green)
│   ├── PoseSkeleton.tsx          # Real-time body tracking points mapping
│   ├── CountdownTimer.tsx        # Massive 3-2-1 animation
│   └── AudioCues.tsx             # Beeps for "Start" and "Stop"
├── analysis/
│   ├── AnalysisLoadingState.tsx  # "Extracting biomechanics...", "Calculating velocity..."
│   └── ProgressRing.tsx          # Circular progress for worker status
└── visualizers/
    ├── ResultDashboard.tsx       # Main result wrapper
    ├── SkeletonReplay.tsx        # Post-analysis replay with overlay
    ├── MotionPathChart.tsx       # Kinematics chart (Recharts)
    └── FeedbackCard.tsx          # AI Coaching insights
```

## 3. State Management Architecture

A robust finite state machine ensures the athlete cannot record before the camera is ready or body is positioned correctly.

```typescript
// src/types/kys-ux.ts
export type KYSPhase = 
  | 'PERMISSIONS'   // Requesting camera
  | 'INSTRUCTION'   // Showing drill steps
  | 'CALIBRATION'   // Validating body in frame
  | 'COUNTDOWN'     // 3..2..1
  | 'RECORDING'     // Capturing video
  | 'ANALYZING'     // Processing Web Worker
  | 'RESULT'        // Displaying charts

export interface KYSUxState {
  phase: KYSPhase;
  validation: {
    isCentered: boolean;
    isDistanceOptimal: boolean;
    isLightingGood: boolean;
    ready: boolean;
  };
  recordingStats: {
    duration: number;
    fps: number;
  };
}
```

## 4. UI / Tailwind Structure

The UI utilizes a dark, tech-forward aesthetic with neon green/yellow accents (`#D1FF00`) to signal readiness.

- **Background & Containers**: Pitch black (`bg-black`) or subtle dark gray (`bg-[#0a0a0a]`) with `border-white/10`.
- **Primary Actions**: Full-width glowing buttons. `bg-[#D1FF00] text-black font-black uppercase tracking-widest`
- **Validation Signals**:
  - 🔴 `border-red-500 text-red-500`: Out of frame, unstable.
  - 🟡 `border-yellow-500 text-yellow-500`: Adjusting position.
  - 🟢 `border-[#D1FF00] text-[#D1FF00]`: Ready to record.

## 5. Framer Motion Animation Strategy

1. **Calibration Box (`ValidationOverlay`)**:
   - *State: Invalid*: Pulses slowly. `animate={{ scale: [1, 1.05, 1], opacity: 0.5 }}`
   - *State: Ready*: Snaps to precise bounding box, turns neon, triggers haptic feedback. `animate={{ scale: 1, borderColor: '#D1FF00' }} transition={{ type: 'spring', stiffness: 300 }}`
2. **Countdown (`CountdownTimer`)**:
   - Massive numbers that scale down into nothing. `initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}`
3. **Analyzing State**:
   - Staggered text reveal: "Extracting landmarks...", "Building motion path...", "Calculating score...".

## 6. Real-Time Guidance & Retry Flow

If the analysis determines the video was unusable (e.g., `< 60%` body visibility):
- Intercept the transition to `RESULT`.
- Show `RetryGuidanceCard`: "We lost track of your legs during the movement. Please step 1 meter further back."
- Provide a one-tap `Retake` button that drops the athlete directly back into `CALIBRATION`.

## 7. Reusable Component Examples

### The Calibration Guide
```tsx
import { motion } from 'motion/react';

export function FramingGuide({ isReady }: { isReady: boolean }) {
  return (
    <motion.div
      animate={{
        borderColor: isReady ? '#D1FF00' : '#ef4444',
        boxShadow: isReady ? '0 0 40px rgba(209,255,0,0.3)' : 'none',
      }}
      className="absolute inset-x-8 top-12 bottom-24 border-4 border-dashed rounded-[3rem] transition-colors flex items-center justify-center p-4 bg-black/20"
    >
      <div className="absolute top-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full font-bold uppercase tracking-widest text-[10px]">
        {isReady ? 'Tahan Posisi...' : 'Posisikan Seluruh Tubuh di Dalam Garis'}
      </div>
    </motion.div>
  );
}
```

### Analysis Loading Overlay
```tsx
export function AIAnalyzerLoading() {
  return (
    <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-8 text-center space-y-6">
      <div className="w-16 h-16 border-4 border-white/10 border-t-[#D1FF00] rounded-full animate-spin" />
      <div>
        <h3 className="text-[#D1FF00] font-bold tracking-widest uppercase mb-2">Memproses Kinetika</h3>
        <p className="text-white/40 text-sm">Mengekstrak 33 titik sendi dengan MediaPipe AI...</p>
      </div>
    </div>
  );
}
```
