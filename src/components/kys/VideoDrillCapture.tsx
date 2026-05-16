import { useState, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { Camera, Brain, RotateCcw, CheckCircle } from 'lucide-react';
import type { SkillCheckItemDef, VideoAnalysisConfig, PoseMetrics } from '../../types';
import { getMediaPipeEngine } from '../../lib/mediapipe';
import { extractPoseMetrics, metricsToScores } from '../../lib/scoring';
import VideoRecorder from './VideoRecorder';
import DrillSelector from './DrillSelector';
import AIAnalysisAnimation from './AIAnalysisAnimation';
import MetricDisplay from './MetricDisplay';

interface VideoDrillCaptureProps {
  items: SkillCheckItemDef[];
  getConfig: (item: SkillCheckItemDef) => VideoAnalysisConfig | null;
  mediapipeReady: boolean;
  onComplete: (itemId: string, rawValue: number, score: number, confidence: number) => void;
}

export default function VideoDrillCapture({
  items,
  getConfig,
  mediapipeReady,
  onComplete,
}: VideoDrillCaptureProps) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [phase, setPhase] = useState<'select' | 'record' | 'analyze' | 'result'>('select');
  const [_analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [frameInfo, setFrameInfo] = useState({ current: 0, total: 0 });
  const [result, setResult] = useState<{
    itemId: string;
    rawValue: number;
    score: number;
    confidence: number;
    metrics: PoseMetrics;
  } | null>(null);
  const engineRef = useRef(getMediaPipeEngine());

  const selectedConfig = selectedItem
    ? getConfig(items.find((i) => i.id === selectedItem)!)
    : null;

  const handleRecordingComplete = useCallback((blob: Blob) => {
    setRecordedBlob(blob);
    setPhase('record');
  }, []);

  const handleRetake = useCallback(() => {
    setRecordedBlob(null);
    setPhase('select');
    setResult(null);
  }, []);

  const handleStartAnalysis = useCallback(async () => {
    if (!recordedBlob || !selectedConfig || !selectedItem) return;

    setAnalyzing(true);
    setPhase('analyze');
    setProgress(0);
    setStatusText('Memuat video...');
    setFrameInfo({ current: 0, total: 0 });

    const engine = engineRef.current;

    try {
      engine.setProgressCallback((p, t) => {
        setProgress(p);
        setStatusText(t);
      });

      const { frames, confidence } = await engine.analyzeVideo(recordedBlob, 1);

      setFrameInfo({ current: frames.length, total: frames.length });

      const metrics = extractPoseMetrics(frames, selectedConfig);
      const score = metricsToScores(metrics, selectedConfig);

      let rawValue = 0;
      switch (selectedConfig.primaryMetric) {
        case 'speed': rawValue = metrics.maxSpeedMps ?? metrics.avgSpeedMps ?? 0; break;
        case 'path_length': rawValue = metrics.pathLengthPx ?? 0; break;
        case 'direction_changes': rawValue = metrics.directionChanges ?? 0; break;
        case 'angle_deviation': rawValue = metrics.movementSmoothness ?? 0; break;
        case 'height': rawValue = metrics.maxJumpHeightPx ?? 0; break;
        case 'count': rawValue = metrics.directionChanges ?? 0; break;
      }

      setResult({ itemId: selectedItem, rawValue, score, confidence, metrics });
      setPhase('result');
      onComplete(selectedItem, rawValue, score, confidence);
    } catch (err) {
      setStatusText(err instanceof Error ? err.message : 'Analisis gagal');
      setProgress(0);
    } finally {
      setAnalyzing(false);
    }
  }, [recordedBlob, selectedConfig, selectedItem, onComplete]);

  if (!selectedItem) {
    return (
      <DrillSelector
        items={items}
        selected={null}
        onSelect={(id) => { setSelectedItem(id); setPhase('select'); }}
        getConfig={getConfig}
      />
    );
  }

  const selectedItemDef = items.find((i) => i.id === selectedItem);

  return (
    <div className="space-y-4">
      {phase === 'select' && selectedConfig && (
        <VideoRecorder
          onRecordingComplete={handleRecordingComplete}
          onRetake={handleRetake}
          recordedBlob={recordedBlob}
          duration={selectedConfig.duration}
        />
      )}

      {(phase === 'record' || phase === 'analyze' || phase === 'result') && selectedConfig && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#D1FF00]" />
              <p className="text-[10px] sm:text-xs font-bold text-white">{selectedItemDef?.label}</p>
            </div>
            <span className="text-[8px] sm:text-[9px] text-white/30 font-mono">{selectedConfig.duration}s</span>
          </div>

          {phase === 'record' && (
            <div className="text-center">
              <VideoRecorder
                onRecordingComplete={handleRecordingComplete}
                onRetake={handleRetake}
                recordedBlob={recordedBlob}
                duration={selectedConfig.duration}
              />
              <div className="mt-3 flex gap-3">
                <button
                  onClick={handleRetake}
                  className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-[9px] font-bold text-white/60 hover:text-white uppercase tracking-wider transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3 h-3" /> Rekam Ulang
                </button>
                <button
                  onClick={handleStartAnalysis}
                  disabled={!mediapipeReady}
                  className="flex-1 py-2.5 bg-[#D1FF00] text-black font-black uppercase tracking-[0.12em] text-[9px] sm:text-[10px] rounded-lg flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(209,255,0,0.2)] hover:shadow-[0_0_25px_rgba(209,255,0,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Brain className="w-3.5 h-3.5" /> Analisis dengan AI
                </button>
              </div>
            </div>
          )}

          {phase === 'analyze' && (
            <AIAnalysisAnimation
              progress={progress}
              status={statusText}
              frameCount={frameInfo.current}
              totalFrames={frameInfo.total}
            />
          )}

          {phase === 'result' && result && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <div className="flex items-center gap-2 text-[#D1FF00] mb-2">
                <CheckCircle className="w-4 h-4" />
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">Analisis Selesai</span>
              </div>

              <MetricDisplay
                label={selectedItemDef?.label || ''}
                unit={selectedItemDef?.unit || ''}
                rawValue={result.rawValue.toFixed(2)}
                score={result.score}
                higherIsBetter={selectedConfig.higherIsBetter}
                confidence={result.confidence}
              />

              <button
                onClick={handleRetake}
                className="w-full py-2.5 bg-white/5 border border-white/10 rounded-lg text-[9px] font-bold text-white/60 hover:text-white uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" /> Ulang dengan Video Baru
              </button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
