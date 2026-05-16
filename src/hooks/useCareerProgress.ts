import { CAREER_EXP, CAREER_PATH } from '../data/mock';

export function useCareerProgress() {
  const currentLevel = CAREER_PATH.find((s) => s.status === 'current')?.level ?? 2;
  const totalLevels = CAREER_PATH.length;
  const overallProgress = Math.round((currentLevel / totalLevels) * 100);

  return {
    current: CAREER_EXP.current,
    next: CAREER_EXP.next,
    level: CAREER_EXP.level,
    overallProgress,
  };
}
