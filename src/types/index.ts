export interface Job {
  id: string;
  title: string;
  type: string;
  organization: string;
  location: string;
  criteria: string;
  criteriaType: 'kys_speed' | 'kys_stamina' | 'kys_agility' | 'kys_avg' | 'sertifikat' | 'usia' | 'pendidikan';
  criteriaValue?: number;
  salary?: string;
  isKYSRequired: boolean;
  featured?: boolean;
  sportId?: string;
  levelId?: string;
  skillRequirements?: JobSkillRequirement[];
}

export interface JobFilter {
  types: string[];
  kysOnly: boolean | null;
  location: string;
  sportId?: string;
  levelId?: string;
}

export interface CareerLevel {
  id: string;
  level: number;
  title: string;
  status: 'completed' | 'current' | 'locked';
  description: string;
  badge?: string;
  expRequired: number;
  milestones: MilestoneDef[];
}

export interface MilestoneDef {
  id: string;
  label: string;
  completed: boolean;
  icon?: string;
}

export interface KYSScore {
  speed: number;
  stamina: number;
  agility: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  type: 'kys_speed' | 'kys_stamina' | 'kys_agility' | 'foundation' | 'verified' | 'regional' | 'elite';
  earned: boolean;
  earnedDate?: string;
  icon: string;
  requirement: string;
}

export interface Certification {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockDate?: string;
  requiredScore: number;
}

export interface SportDef {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  levels: SportLevel[];
}

export interface SportLevel {
  id: string;
  label: string;
  description: string;
  minAge?: number;
  maxAge?: number;
  dimensions: SkillDimensionDef[];
}

export interface SkillDimensionDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  items: SkillCheckItemDef[];
}

export interface SkillCheckItemDef {
  id: string;
  label: string;
  description?: string;
  unit: string;
  higherIsBetter: boolean;
  assessmentType: 'ai_scan' | 'manual_input';
  referenceValue?: number;
  minRecommended?: number;
  maxRecommended?: number;
}

export interface JobSkillRequirement {
  dimensionId: string;
  dimensionName: string;
  minScore: number;
  checklist: JobChecklistRequirement[];
}

export interface JobChecklistRequirement {
  itemId: string;
  label: string;
  minValue: number;
  weight: number;
}

export interface SportAssessment {
  id: string;
  sportId: string;
  levelId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  dimensionScores: DimensionScore[];
  compositeScore: number;
  completedAt?: string;
  validUntil?: string;
}

export interface DimensionScore {
  dimensionId: string;
  dimensionName: string;
  score: number;
  items: ChecklistResult[];
}

export interface ChecklistResult {
  itemId: string;
  value: number;
  score: number;
  assessedAt?: string;
}

/* ── Auth Types ── */

export type Role = 'admin' | 'klub' | 'pencari_bakat' | 'talent';
export type UserStatus = 'active' | 'pending' | 'suspended';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  status: UserStatus;
  avatarUrl?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
}

/* ── MediaPipe / Video Analysis Types ── */

export interface LandmarkPoint {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface LandmarkFrame {
  timestamp: number;
  landmarks: LandmarkPoint[];
}

export interface PoseMetrics {
  avgSpeedMps?: number;
  maxSpeedMps?: number;
  pathLengthPx?: number;
  directionChanges?: number;
  maxJumpHeightPx?: number;
  jointAngles?: Record<string, number>;
  movementSmoothness?: number;
  reactionTimeMs?: number;
  detectedFrames?: number;
  confidence?: number;
}

export interface VideoAnalysisConfig {
  drillType: 'sprint' | 'agility' | 'technique' | 'power' | 'endurance';
  duration: number;
  trackedLandmarks: number[];
  primaryMetric: 'speed' | 'path_length' | 'direction_changes' | 'angle_deviation' | 'height' | 'count';
  higherIsBetter: boolean;
  referenceValue: number;
  minRecommended: number;
  maxRecommended: number;
  referenceAngles?: Record<string, number>;
  expectedMovement?: 'sagittal' | 'frontal' | 'transverse' | 'multi';
}
