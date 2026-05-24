import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { User, Save, CheckCircle } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const email = user?.email || '';
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      const updatedUser = { ...user, fullName, email, avatarUrl };
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mb-1">
          Profile Saya
        </h1>
        <p className="text-xs sm:text-sm text-white/40">
          Kelola informasi akun dan biodata atlet Anda di SinergiAtlet.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl"
      >
        <form onSubmit={handleSave} className="space-y-5">
          <div className="flex flex-col sm:flex-row items-center gap-4 pb-5 border-b border-white/5">
            <div className="w-16 h-16 rounded-full bg-[#111] border border-white/10 flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-white/30" />
              )}
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-xs font-bold uppercase text-[#D1FF00] tracking-wider mb-0.5">Role Sistem</h3>
              <p className="text-sm font-bold uppercase tracking-tight font-mono text-white/80">{user?.role || 'TALENT'}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1.5">
                Nama Lengkap
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#D1FF00] font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white/40 font-mono focus:outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1.5">
                Avatar URL (Opsional)
              </label>
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#D1FF00] font-medium"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            {saved ? (
              <span className="flex items-center gap-1.5 text-[#D1FF00] text-[10px] uppercase font-bold tracking-wider">
                <CheckCircle className="w-3.5 h-3.5" /> Berhasil disimpan!
              </span>
            ) : (
              <span />
            )}

            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#D1FF00] text-black font-bold text-[10px] uppercase tracking-wider rounded-xl hover:bg-[#b0d600] transition-colors"
            >
              <Save className="w-3.5 h-3.5" /> Simpan Perubahan
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
