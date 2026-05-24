import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { JOBS } from '../data/mock';
import type { Job } from '../types';

interface ApiJob {
  id: string;
  title: string;
  type: string;
  organization?: { name: string } | string;
  location?: string;
  isKYSRequired?: boolean;
  is_kys_required?: boolean;
  featured?: boolean;
  sportId?: string;
  sport_id?: string;
  skillRequirements?: Job['skillRequirements'];
  skill_requirements?: Job['skillRequirements'];
  criteria?: string;
  criteriaType?: Job['criteriaType'];
  criteria_type?: Job['criteriaType'];
  criteriaValue?: number;
  criteria_value?: number;
  salary?: string;
  salary_range?: string;
}

function normalizeJob(raw: ApiJob): Job {
  return {
    id: raw.id,
    title: raw.title,
    type: raw.type,
    organization: typeof raw.organization === 'object' && raw.organization
      ? (raw.organization as { name: string }).name
      : (raw.organization as string) || '',
    location: raw.location || '',
    criteria: raw.criteria || '',
    criteriaType: raw.criteriaType || raw.criteria_type || 'kys_speed',
    criteriaValue: raw.criteriaValue !== undefined ? raw.criteriaValue : raw.criteria_value,
    salary: raw.salary || raw.salary_range,
    isKYSRequired: raw.isKYSRequired ?? raw.is_kys_required ?? false,
    featured: raw.featured,
    sportId: raw.sportId || raw.sport_id,
    skillRequirements: raw.skillRequirements || raw.skill_requirements,
  };
}

export function useJobs(): Job[] {
  const [jobs, setJobs] = useState<Job[]>(JOBS);

  useEffect(() => {
    api.get<ApiJob[]>('/jobs')
      .then((data) => {
        if (data && data.length > 0) {
          setJobs(data.map(normalizeJob));
        }
      })
      .catch(() => {
        setJobs(JOBS);
      });
  }, []);

  return jobs;
}
