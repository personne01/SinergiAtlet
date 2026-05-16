import type { Request, Response } from 'express';
import * as jobsService from '../services/jobsService';

export async function getAll(_req: Request, res: Response) {
  try {
    const jobs = await jobsService.getAllJobs();
    res.json({ data: jobs });
  } catch (err) {
    console.error('Error fetching jobs:', err);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const job = await jobsService.getJobById(id);

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    res.json({ data: job });
  } catch (err) {
    console.error('Error fetching job:', err);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
}
