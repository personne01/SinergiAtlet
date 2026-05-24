import { useState, useCallback, useRef } from 'react';
import type { NormalizedLandmarkList } from '@mediapipe/tasks-vision';
import { getMediaPipeEngine } from '../lib/mediapipe';

export interface ValidationState {
  isBodyVisible: boolean;
  isCentered: boolean;
  isStable: boolean;
  lightingQuality: number;
  overallReady: boolean;
}

export function validateFrame(landmarks: any[], poseConfidence: number): ValidationState {
  // Landmarks should have visibility (we estimate > 0.65 for key parts: shoulders, hips, knees, ankles)
  const keyNodes = [11, 12, 23, 24, 25, 26, 27, 28];
  
  let visibleCount = 0;
  for (const idx of keyNodes) {
    if (landmarks[idx] && landmarks[idx].visibility > 0.5) {
      visibleCount++;
    }
  }
  const isBodyVisible = visibleCount >= 6; // allow slight occlusion

  // Center check using hips (idx 23, 24)
  let isCentered = false;
  if (landmarks[23] && landmarks[24]) {
    const cx = (landmarks[23].x + landmarks[24].x) / 2;
    isCentered = cx > 0.35 && cx < 0.65;
  }

  const isStable = poseConfidence > 0.6; // somewhat stable
  
  return {
    isBodyVisible,
    isCentered,
    isStable,
    lightingQuality: 1.0, // placeholder
    overallReady: isBodyVisible && isCentered && isStable,
  };
}

export function useCameraValidation() {
  const [validation, setValidation] = useState<ValidationState>({
    isBodyVisible: false,
    isCentered: false,
    isStable: false,
    lightingQuality: 1.0,
    overallReady: false,
  });

  const initValidator = useCallback(async () => {
     const engine = getMediaPipeEngine();
     if (!engine.isLoaded && !engine.isLoading) {
         await engine.load();
     }
  }, []);

  const validateLiveFrame = useCallback(async (canvas: HTMLCanvasElement, timestamp: number) => {
    const engine = getMediaPipeEngine();
    if (!engine.isLoaded) return;
    
    const landmarks = await engine.validateLiveFrame(canvas, timestamp);
    if (landmarks && landmarks.length > 0) {
         const confidence = landmarks.reduce((acc: number, l: any) => acc + (l.visibility || 0), 0) / landmarks.length;
         setValidation(validateFrame(landmarks, confidence));
    } else {
         setValidation({
            isBodyVisible: false,
            isCentered: false,
            isStable: false,
            lightingQuality: 1.0,
            overallReady: false,
         });
    }
  }, []);

  const stopValidator = useCallback(() => {
     // We don't necessarily want to dispose the entire MediaPipe engine since it's shared
     // but we can if we want to save memory. For now, leave it alive for subsequent recordings.
  }, []);

  return { validation, initValidator, validateLiveFrame, stopValidator };
}
