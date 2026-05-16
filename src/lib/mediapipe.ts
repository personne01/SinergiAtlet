import type { LandmarkFrame } from '../types';

interface MediaPipeLoader {
  PoseLandmarker: typeof import('@mediapipe/tasks-vision').PoseLandmarker;
  FilesetResolver: typeof import('@mediapipe/tasks-vision').FilesetResolver;
}

type ProgressCallback = (progress: number, status: string) => void;

const WASM_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm';
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task';

export class MediaPipeEngine {
  private poseLandmarker: import('@mediapipe/tasks-vision').PoseLandmarker | null = null;
  private loading = false;
  private loaded = false;
  private onProgress: ProgressCallback = () => {};

  setProgressCallback(cb: ProgressCallback) {
    this.onProgress = cb;
  }

  async load() {
    if (this.loaded) return;
    if (this.loading) return;
    this.loading = true;

    this.onProgress(5, 'Mengunduh runtime MediaPipe...');
    const MP = await this.getMediaPipe();

    this.onProgress(30, 'Menginisialisasi pose detector...');
    const vision = await MP.FilesetResolver.forVisionTasks(WASM_CDN);

    this.onProgress(50, 'Memuat model pose landmarker (~8MB)...');
    this.poseLandmarker = await MP.PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: MODEL_URL,
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    this.loaded = true;
    this.loading = false;
    this.onProgress(100, 'Siap!');
  }

  get isLoaded() {
    return this.loaded;
  }

  get isLoading() {
    return this.loading;
  }

  async analyzeVideo(
    videoBlob: Blob,
    frameIntervalSec = 1,
  ): Promise<{ frames: LandmarkFrame[]; confidence: number }> {
    if (!this.poseLandmarker) throw new Error('MediaPipe not loaded');

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
    const maxFrames = Math.min(Math.ceil(duration / frameIntervalSec), 60);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not available');

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    canvas.width = width;
    canvas.height = height;

    for (let i = 0; i < maxFrames; i++) {
      const time = i * frameIntervalSec;
      video.currentTime = time;
      await new Promise<void>((resolve) => {
        const onSeeked = () => {
          video.removeEventListener('seeked', onSeeked);
          resolve();
        };
        video.addEventListener('seeked', onSeeked);
        setTimeout(resolve, 2000);
      });

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(video, 0, 0, width, height);

      const timestamp = i * 1000;
      const result = this.poseLandmarker!.detectForVideo(canvas, timestamp);

      if (result.landmarks && result.landmarks.length > 0) {
        const personLandmarks = result.landmarks[0].map((lm: { x: number; y: number; z: number; visibility?: number }) => ({
          x: lm.x,
          y: lm.y,
          z: lm.z,
          visibility: lm.visibility ?? 1,
        }));
        frames.push({ timestamp, landmarks: personLandmarks });
      }

      this.onProgress(
        Math.round(50 + (i / maxFrames) * 45),
        `Menganalisis frame ${i + 1}/${maxFrames}...`,
      );
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

  private async getMediaPipe(): Promise<MediaPipeLoader> {
    const MP = await import('@mediapipe/tasks-vision');
    return {
      PoseLandmarker: MP.PoseLandmarker,
      FilesetResolver: MP.FilesetResolver,
    };
  }

  dispose() {
    if (this.poseLandmarker) {
      this.poseLandmarker.close();
      this.poseLandmarker = null;
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
