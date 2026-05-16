/* eslint-disable @typescript-eslint/no-explicit-any */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import type { User, Role } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRY = '7d';
const SALT_ROUNDS = 10;

function signToken(user: User): string {
  return jwt.sign({ userId: user.id, role: user.role, status: user.status }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export async function registerUser(
  email: string,
  password: string,
  fullName: string,
  role: Role = 'talent',
): Promise<{ user: User; token: string }> {
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    throw new Error('Email sudah terdaftar');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const status = role === 'talent' ? 'active' : 'pending';

  const { rows } = await pool.query<User>(
    `INSERT INTO users (email, password_hash, full_name, role, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, full_name, role, status, avatar_url, created_at`,
    [email, passwordHash, fullName, role, status],
  );

  const user = rows[0];
  const token = signToken(user);
  return { user, token };
}

export async function loginUser(
  email: string,
  password: string,
): Promise<{ user: User; token: string }> {
  const { rows } = await pool.query<User>(
    'SELECT id, email, password_hash, full_name, role, status, avatar_url, created_at FROM users WHERE email = $1',
    [email],
  );

  if (rows.length === 0) {
    throw new Error('Email atau password salah');
  }

  const user = rows[0];

  if (user.status === 'suspended') {
    throw new Error('Akun Anda telah dinonaktifkan');
  }

  if (user.status === 'pending') {
    throw new Error('Akun Anda masih menunggu persetujuan admin');
  }

  const valid = await bcrypt.compare(password, (user as any).password_hash);
  if (!valid) {
    throw new Error('Email atau password salah');
  }

  const token = signToken(user);
  const { password_hash: _ph, ...safeUser } = user as any;

  return { user: safeUser as User, token };
}

export async function getPendingUsers(): Promise<User[]> {
  const { rows } = await pool.query<User>(
    "SELECT id, email, full_name, role, status, created_at FROM users WHERE status = 'pending' ORDER BY created_at ASC",
  );
  return rows;
}

export async function approveUser(adminId: string, targetUserId: string): Promise<User> {
  const { rows } = await pool.query<User>(
    `UPDATE users SET status = 'active', approved_by = $1, approved_at = NOW()
     WHERE id = $2 AND status = 'pending'
     RETURNING id, email, full_name, role, status, avatar_url, created_at`,
    [adminId, targetUserId],
  );

  if (rows.length === 0) {
    throw new Error('User tidak ditemukan atau sudah aktif');
  }

  return rows[0];
}

export async function rejectUser(adminId: string, targetUserId: string): Promise<void> {
  const { rowCount } = await pool.query(
    `UPDATE users SET status = 'suspended', approved_by = $1, approved_at = NOW()
     WHERE id = $2 AND status = 'pending'`,
    [adminId, targetUserId],
  );

  if (rowCount === 0) {
    throw new Error('User tidak ditemukan atau sudah diproses');
  }
}
