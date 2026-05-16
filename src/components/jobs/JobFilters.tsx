import { X, ShieldCheck, MapPin, Briefcase } from 'lucide-react';
import { cn } from '../../utils/cn';
import { JOB_TYPES } from '../../data/mock';
import type { JobFilter } from '../../types';

interface JobFiltersProps {
  filter: JobFilter;
  onChange: (f: JobFilter) => void;
  onClose: () => void;
  totalJobs: number;
}

export default function JobFilters({ filter, onChange, onClose, totalJobs }: JobFiltersProps) {
  const toggleType = (t: string) => {
    const types = filter.types.includes(t)
      ? filter.types.filter((x) => x !== t)
      : [...filter.types, t];
    onChange({ ...filter, types });
  };

  const setKYSFilter = (v: boolean | null) => {
    onChange({ ...filter, kysOnly: filter.kysOnly === v ? null : v });
  };

  const clearAll = () => {
    onChange({ types: [], kysOnly: null, location: '' });
  };

  const hasActive = filter.types.length > 0 || filter.kysOnly !== null;

  return (
    <div className="bg-[#111111] border border-white/10 rounded-2xl p-4 sm:p-5 mb-4 sm:mb-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
          Filter
        </h4>
        <div className="flex items-center gap-2">
          {hasActive && (
            <button
              onClick={clearAll}
              className="text-[8px] text-white/30 hover:text-white/60 uppercase font-bold tracking-wider"
            >
              Reset
            </button>
          )}
          <button onClick={onClose} className="text-white/30 hover:text-white/60">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-[8px] text-white/40 uppercase font-bold tracking-wider mb-2 flex items-center gap-1.5">
            <Briefcase className="w-3 h-3" /> Tipe Lowongan
          </p>
          <div className="flex flex-wrap gap-1.5">
            {JOB_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => toggleType(t)}
                className={cn(
                  'text-[8px] sm:text-[9px] px-2.5 py-1.5 rounded-lg border font-bold uppercase tracking-tight transition-all',
                  filter.types.includes(t)
                    ? 'bg-[#D1FF00]/10 border-[#D1FF00]/30 text-[#D1FF00]'
                    : 'bg-white/5 border-white/10 text-white/40 hover:text-white/60 hover:border-white/20'
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[8px] text-white/40 uppercase font-bold tracking-wider mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3" /> Verifikasi KYS
          </p>
          <div className="flex gap-1.5">
            {[
              { label: 'KYS Only', value: true as const },
              { label: 'Terbuka', value: false as const },
            ].map(({ label, value }) => (
              <button
                key={label}
                onClick={() => setKYSFilter(value)}
                className={cn(
                  'text-[8px] sm:text-[9px] px-2.5 py-1.5 rounded-lg border font-bold uppercase tracking-tight transition-all',
                  filter.kysOnly === value
                    ? 'bg-[#D1FF00]/10 border-[#D1FF00]/30 text-[#D1FF00]'
                    : 'bg-white/5 border-white/10 text-white/40 hover:text-white/60 hover:border-white/20'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[8px] text-white/40 uppercase font-bold tracking-wider mb-2 flex items-center gap-1.5">
            <MapPin className="w-3 h-3" /> Lokasi
          </p>
          <input
            type="text"
            placeholder="Cari lokasi..."
            value={filter.location}
            onChange={(e) => onChange({ ...filter, location: e.target.value })}
            className="w-full bg-white/5 border border-white/5 py-2 px-3 rounded-lg text-[10px] sm:text-[11px] focus:outline-none focus:border-[#D1FF00]/30 transition-colors"
          />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center">
        <span className="text-[8px] text-white/30 font-mono">{totalJobs} lowongan</span>
        <button
          onClick={onClose}
          className="text-[8px] sm:text-[9px] font-black text-[#D1FF00] uppercase tracking-wider"
        >
          Terapkan
        </button>
      </div>
    </div>
  );
}
