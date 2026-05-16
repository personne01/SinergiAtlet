import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Users, Eye, LogOut,
  Briefcase, FileText, TrendingUp, Clock,
} from 'lucide-react';

const STATS = [
  { label: 'Lowongan Aktif', value: '4', icon: Briefcase, change: '+2 minggu ini' },
  { label: 'Total Pelamar', value: '28', icon: Users, change: '+12 dari bulan lalu' },
  { label: 'Direview', value: '9', icon: Eye, change: '3 hari rata-rata' },
  { label: 'KYS Match', value: '73%', icon: TrendingUp, change: '+5% akurasi' },
];

const RECENT_JOBS = [
  { title: 'Penyerang Utama (U-19)', applicants: 12, status: 'Aktif', daysLeft: 14 },
  { title: 'Gelandang Bertahan', applicants: 8, status: 'Aktif', daysLeft: 21 },
  { title: 'Asisten Pelatih Fisik', applicants: 5, status: 'Review', daysLeft: 7 },
  { title: 'Program Beasiswa', applicants: 3, status: 'Ditutup', daysLeft: 0 },
];

export default function ClubDashboardPage() {
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-light italic">
            Dashboard <span className="font-bold not-italic text-[#D1FF00]">Klub</span>
          </h2>
          <p className="text-white/40 text-[8px] sm:text-[9px] lg:text-xs uppercase tracking-widest mt-1">
            Persija Academy — Manajemen Talenta
          </p>
        </div>
        <button
          onClick={() => navigate('/market')}
          className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold text-white/30 hover:text-white/60 transition-colors uppercase tracking-wider"
        >
          <LogOut className="w-3.5 h-3.5" /> Keluar
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="bg-[#111111] border border-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4"
          >
            <stat.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D1FF00] mb-2" />
            <p className="text-lg sm:text-xl lg:text-2xl font-black text-white">{stat.value}</p>
            <p className="text-[8px] sm:text-[9px] text-white/30 font-bold uppercase tracking-tight mt-1">
              {stat.label}
            </p>
            <p className="text-[7px] sm:text-[8px] text-[#D1FF00]/60 font-mono mt-0.5">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#111111] border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-[#D1FF00]" /> Lowongan Terbaru
          </h3>
          <button
            onClick={() => navigate('/club/post')}
            className="flex items-center gap-1 text-[8px] sm:text-[9px] font-bold text-[#D1FF00] uppercase tracking-wider"
          >
            + Posting Baru
          </button>
        </div>

        <div className="space-y-2 sm:space-y-3">
          {RECENT_JOBS.map((job) => (
            <div
              key={job.title}
              className="flex items-center justify-between p-3 sm:p-4 bg-white/5 rounded-xl sm:rounded-2xl border border-white/5"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[11px] sm:text-xs lg:text-sm font-bold text-white truncate">
                  {job.title}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[8px] sm:text-[9px] text-white/30 font-mono flex items-center gap-1">
                    <Users className="w-2.5 h-2.5" />
                    {job.applicants} pelamar
                  </span>
                  {job.daysLeft > 0 && (
                    <span className="text-[8px] sm:text-[9px] text-white/20 font-mono flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {job.daysLeft} hari lagi
                    </span>
                  )}
                </div>
              </div>
              <span
                className={`text-[8px] sm:text-[9px] font-bold uppercase px-2 py-1 rounded shrink-0 ml-2 ${
                  job.status === 'Aktif'
                    ? 'bg-[#D1FF00]/10 text-[#D1FF00]'
                    : job.status === 'Review'
                    ? 'bg-yellow-400/10 text-yellow-400'
                    : 'bg-white/5 text-white/20'
                }`}
              >
                {job.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => navigate('/club/post')}
        className="w-full py-4 bg-[#D1FF00] text-black font-black uppercase tracking-[0.15em] text-[9px] sm:text-[10px] lg:text-xs rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(209,255,0,0.2)] hover:shadow-[0_0_30px_rgba(209,255,0,0.3)] transition-all"
      >
        <Plus className="w-4 h-4" /> Posting Lowongan Baru
      </button>
    </motion.div>
  );
}
