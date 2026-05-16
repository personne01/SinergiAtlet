import { useState, useEffect, useRef, useCallback } from 'react';
import { getMediaPipeEngine } from '../lib/mediapipe';

interface MediaPipeState {
  ready: boolean;
  loading: boolean;
  error: string | null;
  progress: number;
  progressText: string;
}

export function useMediaPipe() {
  const [state, setState] = useState<MediaPipeState>({
    ready: false,
    loading: false,
    error: null,
    progress: 0,
    progressText: '',
  });
  const initialized = useRef(false);

  const load = useCallback(async () => {
    if (initialized.current) return;
    initialized.current = true;

    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const engine = getMediaPipeEngine();
      engine.setProgressCallback((progress, text) => {
        setState((s) => ({ ...s, progress, progressText: text }));
      });
      await engine.load();
      setState((s) => ({ ...s, ready: true, loading: false, progress: 100 }));
    } catch (err) {
      initialized.current = false;
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : 'Gagal memuat AI engine',
      }));
    }
  }, []);

  const retry = useCallback(() => {
    initialized.current = false;
    setState({ ready: false, loading: false, error: null, progress: 0, progressText: '' });
    load();
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, retry };
}
