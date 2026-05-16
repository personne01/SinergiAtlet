import { NavLink, Link, useLocation } from 'react-router-dom';
import { Briefcase, TrendingUp, Zap, Trophy, User, Settings, LogOut, LogIn, Shield, Users, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';

const TALENT_NAV = [
  { path: '/market', label: 'Marketplace', icon: Briefcase },
  { path: '/career', label: 'Career Path', icon: TrendingUp },
  { path: '/kys', label: 'KYS Center', icon: Zap },
];

const CLUB_NAV = [
  { path: '/club/dashboard', label: 'Dashboard Klub', icon: Shield },
  { path: '/club/post', label: 'Posting Lowongan', icon: FileText },
];

const ADMIN_NAV = [
  { path: '/admin/users', label: 'Manage Users', icon: Users },
  { path: '/market', label: 'Marketplace', icon: Briefcase },
  { path: '/kys', label: 'KYS Center', icon: Zap },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const role = user?.role || 'talent';

  const navItems = role === 'admin' ? ADMIN_NAV
    : role === 'klub' || role === 'pencari_bakat' ? CLUB_NAV
    : TALENT_NAV;

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-full w-56 bg-[#0a0a0a] border-r border-white/10 flex-col z-50">
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#D1FF00] rounded-sm flex items-center justify-center">
            <Trophy className="w-4 h-4 text-black transform -rotate-12" />
          </div>
          <span className="text-base font-bold tracking-tighter uppercase text-white">
            Sinergi<span className="text-[#D1FF00]">Atlet</span>
          </span>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = pathname === path;
          return (
            <NavLink
              key={path}
              to={path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all',
                isActive
                  ? 'bg-[#D1FF00]/10 text-[#D1FF00] border border-[#D1FF00]/20'
                  : 'text-white/40 hover:text-white/60 hover:bg-white/5 border border-transparent'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="uppercase tracking-tighter">{label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#D1FF00]" />
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/5 space-y-1">
        {user ? (
          <>
            <NavLink
              to="/profile"
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all',
                pathname === '/profile' ? 'bg-[#D1FF00]/10 text-[#D1FF00]' : 'text-white/30 hover:text-white/50 hover:bg-white/5'
              )}
            >
              <User className="w-4 h-4" />
              <span className="uppercase tracking-tighter">Profile</span>
            </NavLink>

            <NavLink
              to="/settings"
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all',
                pathname === '/settings' ? 'bg-[#D1FF00]/10 text-[#D1FF00]' : 'text-white/30 hover:text-white/50 hover:bg-white/5'
              )}
            >
              <Settings className="w-4 h-4" />
              <span className="uppercase tracking-tighter">Settings</span>
            </NavLink>

            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-red-400/50 hover:text-red-400 hover:bg-red-400/5 w-full transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="uppercase tracking-tighter">Logout</span>
            </button>

            <div className="px-4 pt-3 mt-2 border-t border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-white/10 overflow-hidden flex items-center justify-center">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-white/40" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-white truncate">{user.fullName || 'User'}</p>
                  <p className="text-[8px] text-white/30 uppercase font-mono">{user.role}</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-[#D1FF00]/50 hover:text-[#D1FF00] hover:bg-[#D1FF00]/5 w-full transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span className="uppercase tracking-tighter">Login</span>
          </Link>
        )}
      </div>
    </aside>
  );
}
