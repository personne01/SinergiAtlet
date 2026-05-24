import { useState, useMemo, useCallback } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, Send, X } from 'lucide-react';
import type { SkillDimensionDef, SkillCheckItemDef, VideoAnalysisConfig, SportAssessment, DimensionScore } from '../../types';
import VideoDrillCapture from './VideoDrillCapture';
import { normalizeScore, computeDimensionScore } from '../../lib/scoring';

interface AssessmentFlowProps {
  dimensions: SkillDimensionDef[];
  sportId: string;
  mediapipeReady: boolean;
  onComplete: (assessment: SportAssessment) => void;
  onClose: () => void;
}

function buildDrillConfig(item: SkillCheckItemDef): VideoAnalysisConfig {
  const itemKey = item.id.toLowerCase();
  
  const getDrillType = (): 'sprint' | 'agility' | 'technique' | 'power' | 'endurance' => {
    if (itemKey.includes('speed') || itemKey.includes('sprint') || itemKey.includes('accel')) return 'sprint';
    if (itemKey.includes('agility') || itemKey.includes('ttest') || itemKey.includes('zigzag') || itemKey.includes('shadow') || itemKey.includes('cod') || itemKey.includes('combo') || itemKey.includes('evasion') || itemKey.includes('reaction')) return 'agility';
    if (itemKey.includes('stamina') || itemKey.includes('endurance') || itemKey.includes('yoyo') || itemKey.includes('vo2max') || itemKey.includes('multi')) return 'endurance';
    if (itemKey.includes('power') || itemKey.includes('jump') || itemKey.includes('kicking') || itemKey.includes('smash') || itemKey.includes('height') || itemKey.includes('power')) return 'power';
    if (itemKey.includes('technique') || itemKey.includes('passing') || itemKey.includes('dribbling') || itemKey.includes('clear') || itemKey.includes('dropshot') || itemKey.includes('poomsae') || itemKey.includes('sparring') || itemKey.includes('serve')) return 'technique';
    return 'technique';
  };

  const drillType = getDrillType();

  return {
    drillType,
    duration: item.id.includes('endurance') ? 30 : 15,
    trackedLandmarks: [11, 12, 23, 24, 25, 26, 27, 28],
    primaryMetric: drillType === 'sprint' ? 'speed'
      : drillType === 'agility' ? 'path_length'
      : drillType === 'technique' ? 'angle_deviation'
      : drillType === 'power' ? 'height'
      : 'count',
    higherIsBetter: item.higherIsBetter,
    referenceValue: item.referenceValue ?? 70,
    minRecommended: item.minRecommended ?? 0,
    maxRecommended: item.maxRecommended ?? 100,
  };
}

export default function AssessmentFlow({
  dimensions,
  sportId,
  mediapipeReady,
  onComplete,
  onClose,
}: AssessmentFlowProps) {
  const [step, setStep] = useState(0);
  const [videoResults, setVideoResults] = useState<Record<string, { rawValue: number; score: number; confidence: number }>>({});
  const [manualValues, setManualValues] = useState<Record<string, number>>({});

  const allDimensions = useMemo(() => dimensions, [dimensions]);
  const currentDim = allDimensions[step];
  const isLastStep = step === allDimensions.length - 1;
  const isReviewStep = step === allDimensions.length;

  const handleVideoComplete = useCallback((itemId: string, rawValue: number, score: number, confidence: number) => {
    setVideoResults((prev) => ({ ...prev, [itemId]: { rawValue, score, confidence } }));
  }, []);

  const getConfig = useCallback((item: SkillCheckItemDef) => {
    if (!item || item.assessmentType !== 'ai_scan') return null;
    return buildDrillConfig(item);
  }, []);

  const resultScores = useMemo((): DimensionScore[] => {
    return allDimensions.map((dim) => {
      const items = dim.items.map((item) => {
        if (item.assessmentType === 'ai_scan') {
          const vr = videoResults[item.id];
          return {
            itemId: item.id,
            value: vr?.rawValue ?? 0,
            score: vr?.score ?? 0,
          };
        }
        const rawValue = manualValues[item.id] ?? 0;
        const score = item.id in manualValues
          ? normalizeScore(rawValue, item.higherIsBetter, item.minRecommended, item.maxRecommended)
          : 0;
        return { itemId: item.id, value: rawValue, score };
      });
      return {
        dimensionId: dim.id,
        dimensionName: dim.name,
        score: computeDimensionScore(items),
        items,
      };
    });
  }, [allDimensions, videoResults, manualValues]);

  const compositeScore = useMemo(() => {
    if (resultScores.length === 0) return 0;
    return Math.round(resultScores.reduce((s, d) => s + d.score, 0) / resultScores.length);
  }, [resultScores]);

  const handleSubmit = () => {
    const assessment: SportAssessment = {
      id: `sa_${Date.now()}`,
      sportId,
      levelId,
      status: 'completed',
      compositeScore,
      dimensionScores: resultScores,
      completedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    };
    onComplete(assessment);
  };

  const allItemsCompleted = (dim: SkillDimensionDef) => {
    const aiItems = dim.items.filter((i) => i.assessmentType === 'ai_scan');
    const manualItems = dim.items.filter((i) => i.assessmentType === 'manual_input');
    const aiDone = aiItems.length === 0 || aiItems.every((i) => videoResults[i.id] !== undefined);
    const manualDone = manualItems.length === 0 || manualItems.every((i) => manualValues[i.id] !== undefined && manualValues[i.id] > 0);
    return aiDone && manualDone;
  };

  if (currentDim && !isReviewStep) {
    const manualItems = currentDim.items.filter((i) => i.assessmentType === 'manual_input');

    return (
      <div className="bg-[#111111] border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            {allDimensions.map((dim, i) => (
              <div
                key={dim.id}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === step
                    ? 'bg-[#D1FF00] shadow-[0_0_6px_rgba(209,255,0,0.5)]'
                    : i < step
                    ? 'bg-[#D1FF00]/50'
                    : 'bg-white/10'
                }`}
              />
            ))}
          </div>
          <span className="text-[8px] sm:text-[9px] font-mono text-white/30">{step + 1} / {allDimensions.length}</span>
        </div>

        <h3 className="text-sm sm:text-base font-bold text-white mb-1">{currentDim.name}</h3>
        <p className="text-[8px] sm:text-[9px] text-white/40 mb-4 sm:mb-6">{currentDim.description}</p>

        <VideoDrillCapture
          key={currentDim.id}
          items={currentDim.items}
          getConfig={getConfig}
          mediapipeReady={mediapipeReady}
          onComplete={handleVideoComplete}
        />

        {manualItems.length > 0 && (
          <div className="mt-4 space-y-3 border-t border-white/5 pt-4">
            {manualItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <p className="text-[9px] sm:text-[10px] text-white font-bold min-w-[6rem]">{item.label}</p>
                <div className="relative flex-1">
                  <input
                    type="number" step="0.1"
                    placeholder="0"
                    value={manualValues[item.id] ?? ''}
                    onChange={(e) => setManualValues((p) => ({ ...p, [item.id]: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-white/5 border border-white/10 py-2 px-3 rounded-lg text-[10px] sm:text-xs focus:outline-none focus:border-[#D1FF00]/30 transition-colors"
                  />
                </div>
                <span className="text-[8px] text-white/30 font-mono min-w-[3rem]">{item.unit}</span>
                {item.referenceValue && (
                  <span className="text-[7px] text-white/20 font-mono">ref {item.referenceValue}</span>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => step > 0 ? setStep(step - 1) : onClose()}
            className="px-5 py-3 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-[0.1em] text-[9px] sm:text-[10px] rounded-xl sm:rounded-2xl hover:bg-white/10 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> {step > 0 ? 'Sebelumnya' : 'Batal'}
          </button>
          <button
            onClick={() => isLastStep ? setStep(allDimensions.length) : setStep(step + 1)}
            disabled={!allItemsCompleted(currentDim)}
            className="flex-1 py-3 bg-[#D1FF00] text-black font-black uppercase tracking-[0.15em] text-[9px] sm:text-[10px] rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(209,255,0,0.2)] hover:shadow-[0_0_30px_rgba(209,255,0,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLastStep ? 'Review' : 'Selanjutnya'} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#111111] border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Review Hasil</h3>
        <button onClick={onClose} className="text-white/20 hover:text-white/40">
          <X className="w-4 h-4" />
        </button>
      </div>

      {resultScores.map((ds) => (
        <div key={ds.dimensionId} className="mb-4 last:mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] sm:text-xs font-bold text-white">{ds.dimensionName}</p>
            <p className="text-sm sm:text-base font-mono font-black text-[#D1FF00]">{ds.score}</p>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-[#D1FF00] rounded-full" style={{ width: `${ds.score}%` }} />
          </div>
          <div className="space-y-1">
            {ds.items.map((item) => (
              <div key={item.itemId} className="flex items-center justify-between px-2 py-1 text-[8px] sm:text-[9px]">
                <span className="text-white/40">{item.itemId.split('_').pop()}</span>
                <span className="font-mono text-white/60">{item.value.toFixed(1)} → <span className="text-[#D1FF00]">{item.score}</span></span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="text-center mb-6">
        <p className="text-[7px] sm:text-[8px] text-white/30 uppercase tracking-wider font-bold">Composite Score</p>
        <p className="text-2xl sm:text-3xl lg:text-4xl font-mono font-black text-[#D1FF00]">{compositeScore}</p>
        {compositeScore >= 80
          ? <div className="flex items-center justify-center gap-1 mt-1 text-[#D1FF00] text-[9px] font-bold uppercase"><CheckCircle className="w-3.5 h-3.5" /> Qualified</div>
          : compositeScore >= 60
          ? <p className="text-yellow-400 text-[9px] font-bold uppercase mt-1">Needs Improvement</p>
          : <p className="text-red-400 text-[9px] font-bold uppercase mt-1">Below Standard</p>
        }
      </div>

      <div className="flex gap-3">
        <button onClick={() => setStep(allDimensions.length - 1)}
          className="flex-1 py-3 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-[0.1em] text-[9px] sm:text-[10px] rounded-xl sm:rounded-2xl hover:bg-white/10 transition-colors">Kembali</button>
        <button onClick={handleSubmit}
          className="flex-1 py-3 bg-[#D1FF00] text-black font-black uppercase tracking-[0.15em] text-[9px] sm:text-[10px] rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(209,255,0,0.2)] hover:shadow-[0_0_30px_rgba(209,255,0,0.3)] transition-all">
          <Send className="w-3.5 h-3.5" /> Submit Assessment
        </button>
      </div>
    </div>
  );
}
