import type { Request, Response } from 'express';
import * as kysService from '../services/kysService';

export function getSports(_req: Request, res: Response) {
  res.json({ data: kysService.getSports() });
}

export async function getAssessments(req: Request, res: Response) {
  try {
    const { athleteId } = req.params;
    const sportId = typeof req.query.sportId === 'string' ? req.query.sportId : undefined;
    const data = await kysService.getAssessments(athleteId, sportId);
    res.json({ data });
  } catch (err) {
    console.error('Error fetching sport assessments:', err);
    res.status(500).json({ error: 'Failed to fetch assessments' });
  }
}

export async function upsertAssessment(req: Request, res: Response) {
  try {
    const { athleteId } = req.params;
    const { sportId, levelId, compositeScore, dimensionScores } = req.body;

    if (!sportId || !levelId) {
      res.status(400).json({ error: 'sportId and levelId are required' });
      return;
    }

    const data = await kysService.upsertAssessment(athleteId, sportId, levelId, compositeScore, dimensionScores);
    res.status(201).json({ data });
  } catch (err) {
    console.error('Error creating sport assessment:', err);
    res.status(500).json({ error: 'Failed to create assessment' });
  }
}

export async function getKYSRecords(req: Request, res: Response) {
  try {
    const { athleteId } = req.params;
    const data = await kysService.getKYSRecords(athleteId);
    res.json({ data });
  } catch (err) {
    console.error('Error fetching KYS records:', err);
    res.status(500).json({ error: 'Failed to fetch KYS records' });
  }
}

export async function getKYSScores(req: Request, res: Response) {
  try {
    const { athleteId } = req.params;
    const data = await kysService.getKYSScores(athleteId);
    res.json({ data });
  } catch (err) {
    console.error('Error fetching KYS scores:', err);
    res.status(500).json({ error: 'Failed to fetch KYS scores' });
  }
}
