/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Response } from 'express';
import type { AuthenticatedRequest } from '../types';
import * as authService from '../services/authService';

function handleError(err: any, res: Response) {
  if (err?.code === 'ECONNREFUSED' || err?.message?.includes('does not exist')) {
    return res.status(503).json({ error: 'Database tidak tersedia. Jalankan npm run migrate terlebih dahulu.' });
  }
  if (err?.code === '42P01') {
    return res.status(503).json({ error: 'Tabel belum dibuat. Jalankan npm run migrate.' });
  }
  return res.status(500).json({ error: err?.message || 'Internal server error' });
}

export async function register(req: AuthenticatedRequest, res: Response) {
  try {
    const { email, password, fullName, role } = req.body;

    if (!email || !password || !fullName) {
      res.status(400).json({ error: 'Email, password, and fullName are required' });
      return;
    }

    const result = await authService.registerUser(email, password, fullName, role || 'talent');
    res.status(201).json({ data: result });
  } catch (err: any) {
    console.error('Error registering user:', err);
    const status = err.message === 'Email sudah terdaftar' ? 409 : 500;
    res.status(status).json({ error: err.message || 'Failed to register' });
  }
}

export async function login(req: AuthenticatedRequest, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const result = await authService.loginUser(email, password);
    res.json({ data: result });
  } catch (err: any) {
    console.error('Error logging in:', err);
    if (err.message.includes('salah') || err.message.includes('persetujuan') || err.message.includes('dinonaktifkan')) {
      return res.status(401).json({ error: err.message });
    }
    handleError(err, res);
  }
}

export async function getPendingUsers(_req: AuthenticatedRequest, res: Response) {
  try {
    const users = await authService.getPendingUsers();
    res.json({ data: users });
  } catch (err: any) {
    console.error('Error fetching pending users:', err);
    handleError(err, res);
  }
}

export async function approveUser(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId } = req.params;
    const adminId = req.user!.userId;
    const user = await authService.approveUser(adminId, userId);
    res.json({ data: user });
  } catch (err: any) {
    console.error('Error approving user:', err);
    res.status(400).json({ error: err.message || 'Failed to approve user' });
  }
}

export async function rejectUser(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId } = req.params;
    const adminId = req.user!.userId;
    await authService.rejectUser(adminId, userId);
    res.json({ success: true });
  } catch (err: any) {
    console.error('Error rejecting user:', err);
    res.status(400).json({ error: err.message || 'Failed to reject user' });
  }
}
