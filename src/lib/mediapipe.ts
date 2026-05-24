import type { LandmarkFrame } from '../types';
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';

type ProgressCallback = (progress: number, status: string) => void;

const WASM_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm';
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task';

export class MediaPipeEngine {
  private landmarker: PoseLandmarker | null = null;
  private loading = false;
  private loaded = false;
  private onProgress: ProgressCallback = () => {};

  setProgressCallback(cb: ProgressCallback) {
    this.onProgress = cb;
  }

  async load() {
    if (this.loaded) return Promise.resolve(true);
    if (this.loading) {
      // wait until loaded
      return new Promise((resolve) => {
        const interval = setInterval(() => {
          if (this.loaded) {
            clearInterval(interval);
            resolve(true);
          }
        }, 100);
      });
    }
    this.loading = true;

    try {
      this.onProgress(30, 'Menginisialisasi pose detector...');
      const vision = await FilesetResolver.forVisionTasks(WASM_CDN);
      this.onProgress(50, 'Memuat model pose landmarker (~8MB)...');
      
      this.landmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MODEL_URL,
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      this.onProgress(100, 'Siap!');
      this.loaded = true;
      this.loading = false;
      return true;
    } catch (err) {
      this.loading = false;
      console.error("Failed to load MediaPipe:", err);
      throw err;
    }
  }

  get isLoaded() {
    return this.loaded;
  }

  get isLoading() {
    return this.loading;
  }

  async analyzeVideo(
    videoBlob: Blob,
    targetFps = 15,
  ): Promise<{ frames: LandmarkFrame[]; confidence: number }> {
    if (!this.landmarker) throw new Error('MediaPipe landmarker not loaded');

    const url = URL.createObjectURL(videoBlob);
    const video = document.createElement('video');
    video.src = url;
    video.muted = true;
    video.playsInline = true;

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error('Failed to load video'));
      setTimeout(() => reject(new Error('Video load timeout')), 30000);
    });

    const duration = video.duration;
    const frames: LandmarkFrame[] = [];
    const frameIntervalSec = 1 / targetFps;
    const maxFrames = Math.min(Math.ceil(duration / frameIntervalSec), 30 * 30); // max 30 seconds at 30 fps

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Canvas not available');

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    canvas.width = width;
    canvas.height = height;

    for (let i = 0; i < maxFrames; i++) {
      const time = i * frameIntervalSec;
      if (time > duration) break;

      video.currentTime = time;
      await new Promise<void>((resolve) => {
        const onSeeked = () => {
          video.removeEventListener('seeked', onSeeked);
          resolve();
        };
        video.addEventListener('seeked', onSeeked);
        setTimeout(resolve, 2000); // timeout fallback
      });

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(video, 0, 0, width, height);

      const timestamp = i * (1000 / targetFps);
      
      const result = this.landmarker.detectForVideo(canvas, timestamp);
      
      if (result.landmarks && result.landmarks.length > 0) {
        const frameLandmarks = result.landmarks[0].map((lm) => ({
          x: lm.x,
          y: lm.y,
          z: lm.z,
          visibility: lm.visibility ?? 1,
        }));
        frames.push({ timestamp, landmarks: frameLandmarks });
      }

      this.onProgress(
        Math.round(50 + (i / maxFrames) * 45),
        `Menganalisis frame ${i + 1}/${maxFrames}...`,
      );

      // Yield to main thread briefly to prevent UI freeze and allow progress bar update
      if (i % 3 === 0) {
        await new Promise(r => setTimeout(r, 0));
      }
    }

    URL.revokeObjectURL(url);
    video.remove();
    canvas.remove();

    const avgConfidence = frames.length > 0
      ? frames.reduce((s, f) => s + f.landmarks.reduce((v, lm) => v + lm.visibility, 0) / f.landmarks.length, 0) / frames.length
      : 0;

    this.onProgress(100, 'Analisis selesai!');

    return { frames, confidence: Math.round(avgConfidence * 100) };
  }

  async validateLiveFrame(canvas: HTMLCanvasElement, timestamp: number) {
    if (!this.landmarker) return null;
    try {
      const result = this.landmarker.detectForVideo(canvas, timestamp);
      if (result.landmarks && result.landmarks.length > 0) {
        return result.landmarks[0].map(lm => ({
          x: lm.x,
          y: lm.y,
          z: lm.z,
          visibility: lm.visibility ?? 1,
        }));
      }
    } catch (e) {
        console.error("Live validation error:", e);
    }
    return null;
  }

  dispose() {
    if (this.landmarker) {
      this.landmarker.close();
      this.landmarker = null;
    }
    this.loaded = false;
    this.loading = false;
  }
}

let instance: MediaPipeEngine | null = null;

export function getMediaPipeEngine(): MediaPipeEngine {
  if (!instance) {
    instance = new MediaPipeEngine();
  }
  return instance;
}

export function disposeMediaPipeEngine() {
  instance?.dispose();
  instance = null;
}
