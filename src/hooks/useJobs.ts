import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { JOBS } from '../data/mock';
import type { Job } from '../types';

interface ApiJob {
  id: string;
  title: string;
  type: string;
  organization?: { name: string };
  location?: string;
  isKYSRequired?: boolean;
  featured?: boolean;
  sportId?: string;
  levelId?: string;
  skillRequirements?: Job['skillRequirements'];
  criteria?: string;
  criteriaType?: Job['criteriaType'];
  criteriaValue?: number;
  salary?: string;
}

function normalizeJob(raw: ApiJob): Job {
  return {
    id: raw.id,
    title: raw.title,
    type: raw.type,
    organization: typeof raw.organization === 'object' && raw.organization
      ? raw.organization.name
      : (raw.organization as unknown as string) || '',
    location: raw.location || '',
    criteria: raw.criteria || '',
    criteriaType: raw.criteriaType || 'kys_speed',
    criteriaValue: raw.criteriaValue,
    salary: raw.salary,
    isKYSRequired: raw.isKYSRequired ?? false,
    featured: raw.featured,
    sportId: raw.sportId,
    levelId: raw.levelId,
    skillRequirements: raw.skillRequirements,
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
