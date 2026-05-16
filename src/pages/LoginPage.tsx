/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Trophy, LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (isAuthenticated && user) {
    const target = user.role === 'admin' ? '/admin/users'
      : user.role === 'klub' || user.role === 'pencari_bakat' ? '/club/dashboard'
      : '/market';
    navigate(target, { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // AuthContext will update user, redirect happens above
    } catch (err: any) {
      setError(err.message || 'Login gagal. Periksa email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#D1FF00] rounded-xl flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-6 h-6 text-black transform -rotate-12" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-tight">
            Sinergi<span className="text-[#D1FF00]">Atlet</span>
          </h1>
          <p className="text-[10px] text-white/40 font-mono mt-1">Masuk ke akun Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-400/5 border border-red-400/20 rounded-lg p-3">
              <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <p className="text-[9px] text-red-400">{error}</p>
            </div>
          )}

          <div>
            <label className="text-[9px] font-bold text-white/60 uppercase tracking-wider mb-1.5 block">Email</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-[#D1FF00]/30 transition-colors"
            />
          </div>

          <div>
            <label className="text-[9px] font-bold text-white/60 uppercase tracking-wider mb-1.5 block">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-[#D1FF00]/30 transition-colors pr-8"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/50">
                {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full py-3 bg-[#D1FF00] text-black font-black uppercase tracking-[0.15em] text-[9px] rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(209,255,0,0.2)] hover:shadow-[0_0_30px_rgba(209,255,0,0.3)] transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <><LogIn className="w-3.5 h-3.5" /> Masuk</>
            )}
          </button>
        </form>

        <p className="text-center mt-4 text-[9px] text-white/30">
          Belum punya akun?{' '}
          <Link to="/register" className="text-[#D1FF00] font-bold hover:underline">Daftar</Link>
        </p>

        <div className="mt-6 p-3 bg-white/5 border border-white/10 rounded-lg text-center">
          <p className="text-[7px] text-white/20 font-mono">Demo: gunakan email dan password apapun untuk login</p>
        </div>
      </motion.div>
    </div>
  );
}
