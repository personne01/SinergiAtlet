import { useState, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { Camera, Brain, RotateCcw, CheckCircle, Activity } from 'lucide-react';
import type { SkillCheckItemDef, VideoAnalysisConfig, PoseMetrics } from '../../types';
import { getMediaPipeEngine } from '../../lib/mediapipe';
import { extractPoseMetrics, metricsToScores } from '../../lib/scoring';
import { getDrillConfigById } from '../../lib/scoring/configs/drills';
import { AssessmentEngine } from '../../lib/scoring/engine';
import VideoRecorder from './VideoRecorder';
import DrillSelector from './DrillSelector';
import AIAnalysisAnimation from './AIAnalysisAnimation';
import MetricDisplay from './MetricDisplay';
import BiomechanicalExamplePlayer from './BiomechanicalExamplePlayer';
import SkeletonReplay from './visualizers/SkeletonReplay';
import MotionPathChart from './visualizers/MotionPathChart';

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
    drillDetails?: any;
    frames?: any[]; // Keep the raw frames to replay!
  } | null>(null);
  const engineRef = useRef(getMediaPipeEngine());

  const selectedItemDef = selectedItem ? items.find((i) => i.id === selectedItem) : undefined;

  const selectedConfig = selectedItemDef
    ? getConfig(selectedItemDef)
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

      const { frames, confidence } = await engine.analyzeVideo(recordedBlob, 15);

      setFrameInfo({ current: frames.length, total: frames.length });

      // Run advanced drill processing
      const drillConfig = getDrillConfigById(selectedItem);
      const drillProcessing = AssessmentEngine.processDrill(frames, drillConfig);
      
      const metrics = extractPoseMetrics(frames, selectedConfig);
      const legacyScore = metricsToScores(metrics, selectedConfig);

      let rawValue = 0;
      switch (selectedConfig.primaryMetric) {
        case 'speed': rawValue = metrics.maxSpeedMps ?? metrics.avgSpeedMps ?? drillProcessing.details['SPEED']?.rawValue ?? 0; break;
        case 'path_length': rawValue = metrics.pathLengthPx ?? 0; break;
        case 'direction_changes': rawValue = metrics.directionChanges ?? 0; break;
        case 'angle_deviation': rawValue = metrics.movementSmoothness ?? 0; break;
        case 'height': rawValue = metrics.maxJumpHeightPx ?? 0; break;
        case 'count': rawValue = metrics.directionChanges ?? 0; break;
      }

      // We use the new engine score combined with legacy config for continuity.
      const finalScore = drillProcessing.score > 0 ? drillProcessing.score : legacyScore;

      setResult({ itemId: selectedItem, rawValue, score: finalScore, confidence, metrics, drillDetails: drillProcessing.details, frames });
      setPhase('result');
      onComplete(selectedItem, rawValue, finalScore, confidence);
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

  return (
    <div className="space-y-4">
      {((phase === 'select' || phase === 'record') && selectedConfig) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleRetake}
              className="text-[8px] sm:text-[9px] font-bold text-white/40 hover:text-white uppercase tracking-widest flex items-center gap-1 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5 transition-all text-white/60 active:scale-95"
            >
              ← Pilih Drill Lain
            </button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#D1FF00]" />
              <p className="text-[10px] sm:text-xs font-bold text-white m-0">{selectedItemDef?.label}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Left Column: Biomechanical Guide Video (3/5 width) */}
            <div className="lg:col-span-3">
              <BiomechanicalExamplePlayer
                drillType={selectedConfig.drillType}
                label={selectedItemDef?.label || ''}
              />
            </div>

            {/* Right Column: Player Recorder (2/5 width) */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between bg-white/[0.03] border border-white/5 py-2 px-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#D1FF00] animate-pulse" />
                  <span className="text-[8px] sm:text-[9px] font-bold text-white uppercase tracking-wider">Perekam Kamera Anda</span>
                </div>
                <span className="text-[7px] sm:text-[8px] font-mono text-white/40">Durasi: {selectedConfig.duration}s</span>
              </div>

              <VideoRecorder
                onRecordingComplete={handleRecordingComplete}
                onRetake={handleRetake}
                recordedBlob={recordedBlob}
                duration={selectedConfig.duration}
              />

              {phase === 'record' && (
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
              )}
            </div>
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

      {phase === 'result' && result && selectedConfig && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex justify-between items-end border-b border-white/5 pb-3">
            <div>
              <div className="flex items-center gap-2 text-[#D1FF00] mb-1">
                <CheckCircle className="w-4 h-4" />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.1em]">Laporan AI Biomekanikan & Kinetika</span>
              </div>
              <p className="text-[8px] sm:text-[9px] text-white/50 uppercase tracking-widest font-bold m-0">Menampilkan {result.frames?.length || 0} frame dianalisis</p>
            </div>
            <button
               onClick={handleRetake}
               className="py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[8px] sm:text-[9px] font-bold text-white/60 hover:text-white uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
             >
               <RotateCcw className="w-3.5 h-3.5" /> Ulang Asesmen
             </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Column: Replay & Charts */}
            <div className="space-y-4">
              <SkeletonReplay frames={result.frames || []} recordedBlob={recordedBlob} />
              <MotionPathChart frames={result.frames || []} />
            </div>

            {/* Right Column: Metrics & Breakdowns */}
            <div className="space-y-4">
              <MetricDisplay
                label={selectedItemDef?.label || ''}
                unit={selectedItemDef?.unit || ''}
                rawValue={result.rawValue.toFixed(1)}
                score={result.score}
                higherIsBetter={selectedConfig.higherIsBetter}
                confidence={result.confidence}
              />

              <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-white/40 mb-4 border-b border-white/5 pb-2">
                     <Activity className="w-3.5 h-3.5 text-[#D1FF00]" />
                     <span className="text-[9px] font-bold uppercase tracking-widest text-[#D1FF00]">Breakdown Komponen Asesmen</span>
                  </div>
                  
                  {result.drillDetails && Object.keys(result.drillDetails).length > 0 ? (
                      <div className="space-y-3">
                         {Object.entries(result.drillDetails).map(([key, data]: any) => (
                            <div key={key}>
                                <div className="flex justify-between text-[8px] sm:text-[9px] mb-1.5">
                                  <span className="text-white/60 font-bold uppercase tracking-wider">{key.replace(/_/g, ' ')} <span className="text-white/30 lowercase ml-1">(Bobot: {data.weight * 100}%)</span></span>
                                  <span className="text-[#D1FF00] font-mono font-bold">{(data.subScore || 0).toFixed(1)} / 100</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-[#D1FF00]/50 to-[#D1FF00]" style={{ width: `${Math.min(100, Math.max(0, data.subScore))}%` }} />
                                </div>
                            </div>
                         ))}
                      </div>
                  ) : (
                      <div className="text-center py-4 text-[9px] text-white/30 uppercase tracking-widest border border-dashed border-white/10 rounded-lg">
                        Tidak ada detail drill spesifik
                      </div>
                  )}

                  {/* Recommendation paragraph */}
                  <div className="mt-5 border-t border-white/5 pt-3">
                    <p className="text-[7px] text-white/40 uppercase font-mono tracking-wider font-bold mb-1">Rekomendasi AI Pelatih:</p>
                    <p className="text-[8px] text-white/70 leading-normal bg-black/20 p-2.5 rounded border border-white/5 font-mono">
                      {result.score >= 90
                        ? "Gerakan anda merepresentasikan efisiensi kinetik yang sangat tinggi. Postur dan stabilitas pusat massa (CG) terjaga dengan sempurna."
                        : result.score >= 70
                        ? "Eksekusi gerak sudah optimal. Berfokuslah pada efisiensi perubahan arah (velocity spikes) dan pertahankan keseimbangan torsi tubuh (Symmetry)."
                        : "Analisis sistem mengindikasikan adanya ruang untuk perbaikan drastis pada stabilitas. Kurangi over-striding, dan tingkatkan kelincahan langkah."
                      }
                    </p>
                  </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
