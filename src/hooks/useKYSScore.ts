import { useState, useMemo } from 'react';
import { SPORT_ASSESSMENTS, KYS_SCORES, JOBS } from '../data/mock';
import type { KYSScore, SportAssessment } from '../types';

export function useKYSScore(): KYSScore {
  const [scores] = useState<KYSScore>(KYS_SCORES);
  return scores;
}

export function useSportAssessments(): SportAssessment[] {
  const [assessments] = useState<SportAssessment[]>(SPORT_ASSESSMENTS);

  return assessments;
}

export function computeMatchForJob(jobId: string, assessments: SportAssessment[]): number {
  const job = JOBS.find((j) => j.id === jobId);
  if (!job?.skillRequirements || job.skillRequirements.length === 0 || !job.sportId) return 0;

  const assessment = assessments.find((a) => a.sportId === job.sportId);
  if (!assessment || assessment.status !== 'completed') return 0;

  let totalWeight = 0;
  let weightedScore = 0;
  for (const req of job.skillRequirements) {
    const ds = assessment.dimensionScores.find((d) => d.dimensionId === req.dimensionId);
    if (!ds) continue;
    const reqWeight = req.checklist.reduce((w, c) => w + c.weight, 0) || 1;
    totalWeight += reqWeight;
    const dimMatch = ds.score >= req.minScore ? 100 : (ds.score / req.minScore) * 100;
    weightedScore += dimMatch * reqWeight;
  }
  return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
}

export function useJobMatches(jobs: { id: string; sportId?: string; skillRequirements?: unknown }[], assessments: SportAssessment[]): Map<string, number> {
  return useMemo(() => {
    const map = new Map<string, number>();
    for (const job of jobs) {
      if (job.skillRequirements && job.sportId) {
        map.set(job.id, computeMatchForJob(job.id, assessments));
      }
    }
    return map;
  }, [jobs, assessments]);
}
