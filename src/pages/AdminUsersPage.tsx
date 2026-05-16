/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Users, Check, X, AlertCircle, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import type { User } from '../types';

export default function AdminUsersPage() {
  const { user, logout } = useAuth();
  const [pending, setPending] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    api.get<User[]>('/auth/admin/pending')
      .then(setPending)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (userId: string) => {
    setActionLoading(userId);
    try {
      await api.post(`/auth/admin/approve/${userId}`, {});
      setPending((prev) => prev.filter((u) => u.id !== userId));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: string) => {
    setActionLoading(userId);
    try {
      await api.post(`/auth/admin/reject/${userId}`, {});
      setPending((prev) => prev.filter((u) => u.id !== userId));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0a0a0a] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#D1FF00] rounded-sm flex items-center justify-center">
            <Trophy className="w-4 h-4 text-black transform -rotate-12" />
          </div>
          <span className="text-base font-bold tracking-tighter uppercase">
            Sinergi<span className="text-[#D1FF00]">Atlet</span> Admin
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px] text-white/40 font-mono">{user?.fullName}</span>
          <button onClick={logout} className="flex items-center gap-1.5 text-[9px] text-red-400/50 hover:text-red-400 font-bold uppercase tracking-wider transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-5 h-5 text-[#D1FF00]" />
          <h1 className="text-sm font-black uppercase tracking-wider">Pending Approvals</h1>
          {pending.length > 0 && (
            <span className="bg-[#D1FF00]/10 text-[#D1FF00] text-[8px] font-bold px-2 py-0.5 rounded-full border border-[#D1FF00]/20">
              {pending.length} menunggu
            </span>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-400/5 border border-red-400/20 rounded-lg p-3 mb-4">
            <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <p className="text-[9px] text-red-400">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-[#D1FF00] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : pending.length === 0 ? (
          <div className="text-center py-12">
            <Check className="w-8 h-8 text-[#D1FF00]/50 mx-auto mb-3" />
            <p className="text-[10px] text-white/30 font-mono">Tidak ada user yang menunggu persetujuan</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((u) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#111111] border border-white/10 rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{u.fullName || 'Unknown'}</p>
                  <p className="text-[8px] text-white/30 font-mono">{u.email}</p>
                  <span className="inline-block mt-1 text-[7px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 text-white/40">
                    {u.role}
                  </span>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleApprove(u.id)}
                    disabled={actionLoading === u.id}
                    className="flex items-center gap-1 px-3 py-2 bg-[#D1FF00]/10 border border-[#D1FF00]/20 text-[#D1FF00] text-[8px] font-bold uppercase tracking-wider rounded-lg hover:bg-[#D1FF00]/20 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === u.id ? (
                      <div className="w-3 h-3 border-2 border-[#D1FF00] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Check className="w-3 h-3" />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(u.id)}
                    disabled={actionLoading === u.id}
                    className="flex items-center gap-1 px-3 py-2 bg-red-400/5 border border-red-400/20 text-red-400 text-[8px] font-bold uppercase tracking-wider rounded-lg hover:bg-red-400/10 transition-colors disabled:opacity-50"
                  >
                    <X className="w-3 h-3" /> Tolak
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
