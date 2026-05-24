import * as fs from 'fs';
import { SPORTS } from './src/data/sports';

const flattenedSports = SPORTS.map(sport => {
  // Use the senior level or highest level's dimensions as the standard
  const standardLevel = sport.levels[sport.levels.length - 1];
  return {
    id: sport.id,
    name: sport.name,
    icon: sport.icon,
    description: sport.description,
    color: sport.color,
    dimensions: standardLevel.dimensions
  };
});

let outputStr = `import type { SportDef, SkillDimensionDef } from '../types';

export const SPORTS: SportDef[] = ${JSON.stringify(flattenedSports, null, 2)};

export function getSport(id: string): SportDef | undefined {
  return SPORTS.find((s) => s.id === id);
}

export function getDimensionItems(sportId: string, dimensionId: string): SkillDimensionDef | undefined {
  const sport = getSport(sportId);
  if (!sport) return undefined;
  return sport.dimensions.find((d) => d.id === dimensionId);
}
`;

// Replace "assessmentType": "manual_input" with assessmentType: 'manual_input' as const etc if needed.
// Actually, TS allows json representation if typing matches! So JSON.stringify is valid TS.

fs.writeFileSync('src/data/sports.ts', outputStr);
console.log('Flattened sports.ts');
