/* eslint-disable @typescript-eslint/no-explicit-any */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import type { User, Role } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRY = '7d';
const SALT_ROUNDS = 10;

// In-Memory fallback database for development sandbox
const MOCK_USERS: any[] = [
  { id: 'b0000000-0000-0000-0000-000000000001', email: 'admin@sinergi.test', password_hash: '$2a$10$Wq/lKcoH1W5zXzB59pS5Wuo6q9B6W8/yZ8QepG2O.t1x8s2gD5N8.', role: 'admin', status: 'active', full_name: 'Admin Sistem', created_at: new Date().toISOString() },
  { id: 'b0000000-0000-0000-0000-000000000002', email: 'superadmin@sinergi.test', password_hash: '$2a$10$Wq/lKcoH1W5zXzB59pS5Wuo6q9B6W8/yZ8QepG2O.t1x8s2gD5N8.', role: 'admin', status: 'active', full_name: 'Super Admin', created_at: new Date().toISOString() },
  { id: 'b0000000-0000-0000-0000-000000000003', email: 'persija@club.test', password_hash: '$2a$10$Wq/lKcoH1W5zXzB59pS5Wuo6q9B6W8/yZ8QepG2O.t1x8s2gD5N8.', role: 'klub', status: 'active', full_name: 'Persija Academy HR', created_at: new Date().toISOString() },
  { id: 'b0000000-0000-0000-0000-000000000004', email: 'djarum@club.test', password_hash: '$2a$10$Wq/lKcoH1W5zXzB59pS5Wuo6q9B6W8/yZ8QepG2O.t1x8s2gD5N8.', role: 'klub', status: 'active', full_name: 'PB Djarum Tim Scouting', created_at: new Date().toISOString() },
  { id: 'b0000000-0000-0000-0000-000000000005', email: 'scout1@sinergi.test', password_hash: '$2a$10$Wq/lKcoH1W5zXzB59pS5Wuo6q9B6W8/yZ8QepG2O.t1x8s2gD5N8.', role: 'pencari_bakat', status: 'active', full_name: 'Andi Pencari Bakat', created_at: new Date().toISOString() },
  { id: 'b0000000-0000-0000-0000-000000000006', email: 'scout2@sinergi.test', password_hash: '$2a$10$Wq/lKcoH1W5zXzB59pS5Wuo6q9B6W8/yZ8QepG2O.t1x8s2gD5N8.', role: 'pencari_bakat', status: 'active', full_name: 'Siti Pencari Bakat', created_at: new Date().toISOString() },
  { id: 'b0000000-0000-0000-0000-000000000007', email: 'budi@atlet.test', password_hash: '$2a$10$Wq/lKcoH1W5zXzB59pS5Wuo6q9B6W8/yZ8QepG2O.t1x8s2gD5N8.', role: 'talent', status: 'active', full_name: 'Budi Santoso', created_at: new Date().toISOString() },
  { id: 'b0000000-0000-0000-0000-000000000008', email: 'sinta@atlet.test', password_hash: '$2a$10$Wq/lKcoH1W5zXzB59pS5Wuo6q9B6W8/yZ8QepG2O.t1x8s2gD5N8.', role: 'talent', status: 'active', full_name: 'Sinta Wijaya', created_at: new Date().toISOString() },
  { id: 'b0000000-0000-0000-0000-000000000009', email: 'pending@club.test', password_hash: '$2a$10$Wq/lKcoH1W5zXzB59pS5Wuo6q9B6W8/yZ8QepG2O.t1x8s2gD5N8.', role: 'klub', status: 'pending', full_name: 'Klub Menunggu', created_at: new Date().toISOString() },
];

function signToken(user: User): string {
  return jwt.sign({ userId: user.id, role: user.role, status: user.status }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export async function registerUser(
  email: string,
  password: string,
  fullName: string,
  role: Role = 'talent',
): Promise<{ user: User; token: string }> {
  const normEmail = email.toLowerCase();
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const status = role === 'talent' ? 'active' : 'pending';

  try {
    // Try SQL query
    const checkRes = await pool.query('SELECT id FROM users WHERE email = $1', [normEmail]);
    if (checkRes.rows.length > 0) {
      throw new Error('Email sudah terdaftar');
    }

    const insertRes = await pool.query(
      `INSERT INTO users (email, password_hash, role, full_name, status, created_at) 
       VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id, email, role, full_name, status, created_at`,
      [normEmail, passwordHash, role, fullName, status]
    );

    const newUser = insertRes.rows[0];

    // Create matching base profile row
    await pool.query(
      `INSERT INTO profiles (id, user_id, created_at) VALUES ($1, $1, NOW())`,
      [newUser.id]
    );

    const safeUser: User = {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      full_name: newUser.full_name,
      status: newUser.status,
      created_at: newUser.created_at,
    };
    const token = signToken(safeUser);
    return { user: safeUser, token };
  } catch (err: any) {
    if (err.message === 'Email sudah terdaftar') throw err;
    console.warn('[authService] PostgreSQL failure, falling back to in-memory store:', err.message);

    // Mock implementation
    const idx = MOCK_USERS.findIndex(u => u.email === normEmail);
    if (idx !== -1) {
      throw new Error('Email sudah terdaftar', { cause: err });
    }

    const mockId = 'b0000000-0000-0000-0000-' + Math.floor(Math.random() * 1000000).toString().padStart(12, '0');
    const newUser: any = {
      id: mockId,
      email: normEmail,
      password_hash: passwordHash,
      full_name: fullName,
      role,
      status,
      created_at: new Date().toISOString(),
    };
    MOCK_USERS.push(newUser);

    const { password_hash: _ph, ...safeUser } = newUser;
    const token = signToken(safeUser as User);
    return { user: safeUser as User, token };
  }
}

export async function loginUser(
  email: string,
  password: string,
): Promise<{ user: User; token: string }> {
  const normEmail = email.toLowerCase();

  try {
    const res = await pool.query('SELECT * FROM users WHERE email = $1', [normEmail]);
    if (res.rows.length === 0) {
      throw new Error('Email atau password salah');
    }

    const user = res.rows[0];

    if (user.status === 'suspended') {
      throw new Error('Akun Anda telah dinonaktifkan');
    }
    if (user.status === 'pending') {
      throw new Error('Akun Anda masih menunggu persetujuan admin');
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new Error('Email atau password salah');
    }

    const safeUser: User = {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
      avatar_url: user.avatar_url || undefined,
      status: user.status,
      created_at: user.created_at,
    };

    const token = signToken(safeUser);
    return { user: safeUser, token };
  } catch (err: any) {
    if (
      err.message === 'Email atau password salah' ||
      err.message === 'Akun Anda telah dinonaktifkan' ||
      err.message === 'Akun Anda masih menunggu persetujuan admin'
    ) {
      throw err;
    }
    console.warn('[authService] PostgreSQL failure, falling back to in-memory store log in:', err.message);

    // Mock login fallback
    const user = MOCK_USERS.find(u => u.email === normEmail);
    if (!user) {
      throw new Error('Email atau password salah', { cause: err });
    }

    if (user.status === 'suspended') {
      throw new Error('Akun Anda telah dinonaktifkan', { cause: err });
    }
    if (user.status === 'pending') {
      throw new Error('Akun Anda masih menunggu persetujuan admin', { cause: err });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new Error('Email atau password salah', { cause: err });
    }

    const { password_hash: _ph, ...safeUser } = user;
    const token = signToken(safeUser as User);
    return { user: safeUser as User, token };
  }
}

export async function getPendingUsers(): Promise<User[]> {
  try {
    const res = await pool.query("SELECT * FROM users WHERE status = 'pending' ORDER BY created_at ASC");
    return res.rows.map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
      avatar_url: user.avatar_url || undefined,
      status: user.status,
      created_at: user.created_at,
    }));
  } catch (err: any) {
    console.warn('[authService] PostgreSQL pending users fetch failure, falling back to in-memory store:', err.message);
    return MOCK_USERS.filter(u => u.status === 'pending').map(({ password_hash: _ph, ...u }) => u);
  }
}

export async function approveUser(adminId: string, targetUserId: string): Promise<User> {
  try {
    const res = await pool.query(
      `UPDATE users 
       SET status = 'active', approved_by = $1, approved_at = NOW(), updated_at = NOW() 
       WHERE id = $2 RETURNING id, email, role, full_name, avatar_url, status, created_at`,
      [adminId, targetUserId]
    );

    if (res.rows.length === 0) {
      throw new Error('User tidak ditemukan atau sudah aktif');
    }

    const user = res.rows[0];
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
      avatar_url: user.avatar_url || undefined,
      status: user.status,
      created_at: user.created_at,
    };
  } catch (err: any) {
    if (err.message === 'User tidak ditemukan atau sudah aktif') throw err;
    console.warn('[authService] PostgreSQL approve failure, falling back to in-memory store:', err.message);

    const user = MOCK_USERS.find(u => u.id === targetUserId);
    if (!user || user.status !== 'pending') {
      throw new Error('User tidak ditemukan atau sudah aktif', { cause: err });
    }

    user.status = 'active';
    user.approved_by = adminId;
    user.approved_at = new Date().toISOString();

    const { password_hash: _ph, ...safeUser } = user;
    return safeUser as User;
  }
}

export async function rejectUser(adminId: string, targetUserId: string): Promise<void> {
  try {
    const res = await pool.query(
      `UPDATE users 
       SET status = 'suspended', approved_by = $1, approved_at = NOW(), updated_at = NOW() 
       WHERE id = $2 RETURNING id`,
      [adminId, targetUserId]
    );

    if (res.rows.length === 0) {
      throw new Error('User tidak ditemukan atau sudah diproses');
    }
  } catch (err: any) {
    if (err.message === 'User tidak ditemukan atau sudah diproses') throw err;
    console.warn('[authService] PostgreSQL reject failure, falling back to in-memory store:', err.message);

    const user = MOCK_USERS.find(u => u.id === targetUserId);
    if (!user || user.status !== 'pending') {
      throw new Error('User tidak ditemukan atau sudah diproses', { cause: err });
    }

    user.status = 'suspended';
    user.approved_by = adminId;
    user.approved_at = new Date().toISOString();
  }
}
