import { Link, useLocation } from 'react-router-dom';
import { Briefcase, TrendingUp, Zap } from 'lucide-react';
import { cn } from '../../utils/cn';

const NAV_ITEMS = [
  { path: '/market', label: 'Market', icon: Briefcase },
  { path: '/career', label: 'Career', icon: TrendingUp },
  { path: '/kys', label: 'KYS', icon: Zap },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto px-4 sm:px-6 pb-6 sm:pb-8 z-50">
      <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-[2rem] p-2 sm:p-3 flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const isActive = pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex flex-col items-center gap-1 sm:gap-1.5 px-3 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl transition-all',
                isActive
                  ? 'bg-[#D1FF00] text-black scale-105'
                  : 'text-white/40 hover:text-white/60'
              )}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-tighter">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
