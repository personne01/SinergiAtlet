import { Link } from 'react-router-dom';
import { Trophy, Bell, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="lg:hidden h-14 sm:h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between border-b border-white/10 bg-[#0a0a0a] sticky top-0 z-40">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#D1FF00] rounded-sm flex items-center justify-center">
          <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black transform -rotate-12" />
        </div>
        <span className="text-base sm:text-lg lg:text-xl font-bold tracking-tighter uppercase text-white">
          Sinergi<span className="text-[#D1FF00]">Atlet</span>
        </span>
      </div>
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/20 bg-white/5 flex items-center justify-center relative">
          <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/60" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#D1FF00] rounded-full" />
        </div>
        {user ? (
          <>
            <div className="hidden sm:flex items-center gap-2 text-[10px] text-white/60 font-mono">
              {user.fullName && <span className="truncate max-w-[100px]">{user.fullName}</span>}
            </div>
            <button onClick={logout} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/20 bg-white/5 flex items-center justify-center overflow-hidden hover:bg-white/10 transition-colors">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <LogOut className="w-3 h-3 text-white/40" />
              )}
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-[#D1FF00]/10 border border-[#D1FF00]/20 rounded-lg text-[8px] sm:text-[9px] font-bold text-[#D1FF00] uppercase tracking-wider hover:bg-[#D1FF00]/20 transition-all"
          >
            <LogIn className="w-3 h-3" /> Masuk
          </Link>
        )}
      </div>
    </nav>
  );
}
