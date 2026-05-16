import type { Request, Response } from 'express';
import * as careerService from '../services/careerService';

export async function getProgress(req: Request, res: Response) {
  try {
    const { athleteId } = req.params;
    const data = await careerService.getCareerProgress(athleteId);
    res.json({ data });
  } catch (err) {
    console.error('Error fetching career progress:', err);
    res.status(500).json({ error: 'Failed to fetch career progress' });
  }
}
