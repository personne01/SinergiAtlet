import type { Request } from 'express';

export type Role = 'admin' | 'klub' | 'pencari_bakat' | 'talent';
export type UserStatus = 'active' | 'pending' | 'suspended';

export interface User {
  id: string;
  email: string;
  role: Role;
  status: UserStatus;
  full_name: string;
  avatar_url?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  org_id?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  sport_type?: string;
  position?: string;
  bio?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  type: 'club' | 'academy' | 'training_center';
  logo_url?: string;
  location?: string;
  description?: string;
  verified: boolean;
}

export interface Job {
  id: string;
  title: string;
  org_id: string;
  organization?: Organization;
  type: string;
  location?: string;
  description?: string;
  min_kys_requirements: Record<string, number>;
  status: 'open' | 'closed' | 'expired';
  salary_range?: string;
  deadline?: string;
  created_at: string;
}

export interface CareerProgress {
  id: string;
  athlete_id: string;
  current_level: number;
  total_exp: number;
  milestones_reached: string[];
  updated_at: string;
}

export interface KYSRecord {
  id: string;
  athlete_id: string;
  verified_score: number;
  score_type: 'speed' | 'stamina' | 'agility';
  audit_hash: string;
  session_metadata: Record<string, unknown>;
  created_at: string;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: Role;
    status: UserStatus;
  };
}
