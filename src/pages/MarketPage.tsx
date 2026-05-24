import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, Filter, Grid3X3, LayoutList, X, Plus } from 'lucide-react';
import JobCard from '../components/jobs/JobCard';
import JobFilters from '../components/jobs/JobFilters';
import { useJobs } from '../hooks/useJobs';
import { useSportAssessments, useJobMatches } from '../hooks/useKYSScore';
import { KYS_ACCESS, SPORT_IDS } from '../data/mock';
import { useAuth } from '../contexts/AuthContext';
import type { JobFilter } from '../types';

const SPORT_LABELS: Record<string, string> = {
  sepak_bola: 'Sepak Bola',
  bulutangkis: 'Bulutangkis',
  taekwondo: 'Taekwondo',
};

export default function MarketPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const jobs = useJobs();
  const assessments = useSportAssessments();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<JobFilter>({
    types: [],
    kysOnly: null,
    location: '',
    sportId: '',
  });

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (search) {
        const q = search.toLowerCase();
        const matchesSearch =
          job.title.toLowerCase().includes(q) ||
          job.organization.toLowerCase().includes(q) ||
          job.location.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      if (filter.types.length > 0 && !filter.types.includes(job.type)) {
        return false;
      }

      if (filter.kysOnly === true && !job.isKYSRequired) return false;
      if (filter.kysOnly === false && job.isKYSRequired) return false;

      if (filter.location) {
        const loc = filter.location.toLowerCase();
        if (!job.location.toLowerCase().includes(loc)) return false;
      }

      if (filter.sportId && job.sportId !== filter.sportId) return false;

      return true;
    });
  }, [jobs, search, filter]);

  const kysAccess = KYS_ACCESS;

  const jobMatches = useJobMatches(jobs, assessments);
  const matchForJob = (jobId: string) => jobMatches.get(jobId) ?? undefined;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-light italic">
            Marketplace <span className="font-bold not-italic text-[#D1FF00]">SDM</span>
          </h2>
          <p className="text-white/40 text-[8px] sm:text-[9px] lg:text-xs uppercase tracking-widest mt-1">
            Sinergi Karir Olahraga Indonesia
          </p>
        </div>
        <div className="flex items-center gap-2">
          {user?.role !== 'talent' && (
            <button
              onClick={() => navigate('/club-login')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-[#D1FF00]/10 border border-[#D1FF00]/20 rounded-lg text-[8px] sm:text-[9px] font-bold text-[#D1FF00] uppercase tracking-wider hover:bg-[#D1FF00]/20 transition-all"
            >
              <Plus className="w-3 h-3" /> Posting
            </button>
          )}
          <select
            value={filter.sportId || ''}
            onChange={(e) => setFilter({ ...filter, sportId: e.target.value })}
            className="bg-white/5 border border-white/10 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg focus:outline-none focus:border-[#D1FF00]/30 transition-colors appearance-none"
          >
            <option value="">Semua Olahraga</option>
            {SPORT_IDS.map((id) => <option key={id} value={id}>{SPORT_LABELS[id] || id}</option>)}
          </select>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 sm:p-2 rounded-lg border transition-all ${
              viewMode === 'list'
                ? 'bg-white/10 border-white/20 text-white'
                : 'bg-transparent border-transparent text-white/30 hover:text-white/50'
            }`}
          >
            <LayoutList className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 sm:p-2 rounded-lg border transition-all ${
              viewMode === 'grid'
                ? 'bg-white/10 border-white/20 text-white'
                : 'bg-transparent border-transparent text-white/30 hover:text-white/50'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-1.5 sm:p-2 rounded-lg border transition-all ml-1 ${
              showFilters || filter.types.length > 0 || filter.kysOnly !== null
                ? 'bg-[#D1FF00]/10 border-[#D1FF00]/30 text-[#D1FF00]'
                : 'bg-white/5 border-white/10 text-white/40 hover:text-white/60'
            }`}
          >
            {showFilters ? (
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            ) : (
              <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </button>
        </div>
      </div>

      <div className="relative mb-4 sm:mb-6">
        <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-white/20 w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <input
          type="text"
          placeholder="Cari klub, beasiswa, atau akademi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/5 py-3 sm:py-4 pl-10 sm:pl-12 pr-3 sm:pr-4 rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] lg:text-sm focus:outline-none focus:border-[#D1FF00]/30 transition-colors"
        />
      </div>

      {showFilters && (
        <JobFilters
          filter={filter}
          onChange={setFilter}
          onClose={() => setShowFilters(false)}
          totalJobs={filteredJobs.length}
        />
      )}

      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
          {filteredJobs.length} Peluang Tersedia
        </h3>
        <div className="h-0.5 bg-white/5 flex-1 mx-2 sm:mx-4" />
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className={job.featured ? 'sm:col-span-2 xl:col-span-2' : ''}
            >
              <JobCard
                job={job}
                variant={job.featured ? 'featured' : 'default'}
                kysVerified={true}
                kysMetRequirement={kysAccess[job.id] ?? !job.isKYSRequired}
                matchPercent={job.skillRequirements ? matchForJob(job.id) : undefined}
                onApply={() => navigate(`/apply/${job.id}`)}
                onClick={() => navigate(`/apply/${job.id}`)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              kysVerified={true}
              kysMetRequirement={kysAccess[job.id] ?? !job.isKYSRequired}
              matchPercent={job.skillRequirements ? matchForJob(job.id) : undefined}
              onApply={() => navigate(`/apply/${job.id}`)}
              onClick={() => navigate(`/apply/${job.id}`)}
            />
          ))}
        </div>
      )}

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/20 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            Tidak ada lowongan ditemukan
          </p>
          <p className="text-white/10 text-[8px] sm:text-[9px] mt-1">
            Coba ubah filter atau kata kunci pencarian
          </p>
        </div>
      )}

      {user?.role !== 'talent' && (
        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-white/5 text-center">
          <p className="text-[8px] sm:text-[9px] text-white/20 font-mono mb-3 uppercase tracking-wider">
            Punya lowongan untuk atlet?
          </p>
          <button
            onClick={() => navigate('/club-login')}
            className="inline-flex items-center gap-2 px-4 sm:px-6 py-3 bg-[#D1FF00]/5 border border-[#D1FF00]/20 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-bold text-[#D1FF00] uppercase tracking-wider hover:bg-[#D1FF00]/10 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Posting Loker untuk Klub Anda
          </button>
        </div>
      )}
    </motion.div>
  );
}
