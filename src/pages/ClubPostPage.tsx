import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, Plus, X, Send, Trophy, LogOut } from 'lucide-react';
import { SPORTS } from '../data/sports';
import type { JobSkillRequirement, JobChecklistRequirement, SkillCheckItemDef } from '../types';
import MatchIndicator from '../components/kys/MatchIndicator';

type FormData = {
  title: string;
  organization: string;
  type: string;
  location: string;
  sportId: string;
  description: string;
};

const JOB_TYPES = ['Beasiswa Penuh', 'Kontrak', 'Try-out', 'Beasiswa', 'Full-time', 'Magang'];
const INITIAL_FORM: FormData = {
  title: '',
  organization: '',
  type: 'Kontrak',
  location: '',
  sportId: '',
  description: '',
};

export default function ClubPostPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);

  const [minScores, setMinScores] = useState<Record<string, number>>({});
  const [checklistReqs, setChecklistReqs] = useState<Record<string, Record<string, { minValue: number; weight: number }>>>({});
  const [customItems, setCustomItems] = useState<Record<string, SkillCheckItemDef[]>>({});

  const selectedSport = SPORTS.find((s) => s.id === form.sportId);

  const handleDimensionMinScore = (dimId: string, val: number) => {
    setMinScores((prev) => ({ ...prev, [dimId]: val }));
  };

  const handleChecklistMinValue = (dimId: string, itemId: string, val: number) => {
    setChecklistReqs((prev) => {
      const dim = prev[dimId] ?? {};
      const existing = dim[itemId] ?? { minValue: 0, weight: 1 };
      return { ...prev, [dimId]: { ...dim, [itemId]: { minValue: val, weight: existing.weight } } };
    });
  };

  const handleChecklistWeight = (dimId: string, itemId: string, weight: number) => {
    setChecklistReqs((prev) => {
      const dim = prev[dimId] ?? {};
      const existing = dim[itemId] ?? { minValue: 0, weight: 1 };
      return { ...prev, [dimId]: { ...dim, [itemId]: { minValue: existing.minValue, weight } } };
    });
  };

  let customIdCounter = 0;

  const addCustomItem = (dimId: string) => {
    const label = prompt('Nama item checklist:');
    if (!label) return;
    const unit = prompt('Satuan (e.g. detik, kg, %):') || 'rating';
    const higherIsBetter = confirm('Semakin besar nilai semakin baik? (OK=Ya, Cancel=Tidak)');
    customIdCounter++;
    const newItem: SkillCheckItemDef = {
      id: `custom_${dimId}_${customIdCounter}`,
      label,
      description: 'Item kustom dari klub',
      unit,
      higherIsBetter,
      assessmentType: 'manual_input',
      minRecommended: 0,
      maxRecommended: 100,
    };
    setCustomItems((prev) => ({
      ...prev,
      [dimId]: [...(prev[dimId] || []), newItem],
    }));
  };

  const skillRequirements = useMemo((): JobSkillRequirement[] => {
    if (!selectedSport) return [];
    return selectedSport.dimensions.map((dim) => {
      const reqChecklist: JobChecklistRequirement[] = [];
      for (const item of dim.items) {
        const cr = checklistReqs[dim.id]?.[item.id];
        if (cr && cr.minValue > 0) {
          reqChecklist.push({ itemId: item.id, label: item.label, minValue: cr.minValue, weight: cr.weight });
        }
      }
      for (const ci of customItems[dim.id] || []) {
        const cr = checklistReqs[dim.id]?.[ci.id];
        if (cr && cr.minValue > 0) {
          reqChecklist.push({ itemId: ci.id, label: ci.label, minValue: cr.minValue, weight: cr.weight });
        }
      }
      return {
        dimensionId: dim.id,
        dimensionName: dim.name,
        minScore: minScores[dim.id] || 70,
        checklist: reqChecklist,
      };
    }).filter((r) => r.checklist.length > 0);
  }, [selectedSport, minScores, checklistReqs, customItems]);

  const handlePost = () => {
    const posting = {
      ...form,
      skillRequirements,
      createdAt: new Date().toISOString(),
    };
    console.log('Job posting created:', posting);
    alert('Lowongan berhasil diposting! (Demo mode — lihat console untuk data)');
    navigate('/club/dashboard');
  };

  const canProceed = () => {
    if (step === 0) return form.title && form.organization && form.sportId;
    if (step === 1) return skillRequirements.length > 0;
    return true;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      <div className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/club/dashboard')}
            className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold text-white/30 hover:text-white/60 transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
          </button>
          <button
            onClick={() => navigate('/market')}
            className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold text-white/30 hover:text-white/60 transition-colors uppercase tracking-wider"
          >
            <LogOut className="w-3.5 h-3.5" /> Keluar
          </button>
        </div>

        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#D1FF00] rounded-xl flex items-center justify-center mx-auto mb-3">
            <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-black transform -rotate-12" />
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-light italic">
            Posting <span className="font-bold not-italic text-[#D1FF00]">Lowongan</span>
          </h1>
          <p className="text-white/40 text-[9px] sm:text-xs uppercase tracking-widest mt-2">
            Tentukan kriteria atlet yang kamu cari
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6 sm:mb-8">
          {[0, 1, 2, 3].map((s) => (
            <button
              key={s}
              onClick={() => { if (s <= step) setStep(s); }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[8px] sm:text-[9px] font-bold uppercase tracking-wider border transition-all ${
                s === step
                  ? 'bg-[#D1FF00]/10 border-[#D1FF00]/30 text-[#D1FF00]'
                  : s < step
                  ? 'bg-[#D1FF00]/5 border-[#D1FF00]/20 text-[#D1FF00]/60'
                  : 'bg-white/5 border-white/10 text-white/30'
              }`}
            >
              {s < step ? <Check className="w-2.5 h-2.5" /> : <span>{s + 1}</span>}
              <span className="hidden sm:inline">
                {['Info', 'Kriteria', 'Checklist', 'Review'][s]}
              </span>
            </button>
          ))}
        </div>

        {/* Step 0: Basic info */}
        {step === 0 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 sm:space-y-5">
            <div>
              <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2 block">Judul Lowongan</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Penyerang Utama U-19" className="w-full bg-white/5 border border-white/10 py-3 sm:py-3.5 px-4 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs focus:outline-none focus:border-[#D1FF00]/30 transition-colors" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2 block">Nama Klub</label>
                <input value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} placeholder="e.g. Persija Academy" className="w-full bg-white/5 border border-white/10 py-3 sm:py-3.5 px-4 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs focus:outline-none focus:border-[#D1FF00]/30 transition-colors" />
              </div>
              <div>
                <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2 block">Lokasi</label>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Jakarta" className="w-full bg-white/5 border border-white/10 py-3 sm:py-3.5 px-4 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs focus:outline-none focus:border-[#D1FF00]/30 transition-colors" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2 block">Olahraga</label>
                <select value={form.sportId} onChange={(e) => { setForm({ ...form, sportId: e.target.value }); setMinScores({}); setChecklistReqs({}); }}
                  className="w-full bg-white/5 border border-white/10 py-3 sm:py-3.5 px-4 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs focus:outline-none focus:border-[#D1FF00]/30 transition-colors appearance-none">
                  <option value="">Pilih olahraga...</option>
                  {SPORTS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2 block">Tipe</label>
              <div className="flex flex-wrap gap-2">
                {JOB_TYPES.map((t) => (
                  <button key={t} onClick={() => setForm({ ...form, type: t })}
                    className={`px-3 py-2 rounded-lg text-[8px] sm:text-[9px] font-bold uppercase tracking-wider border transition-all ${
                      form.type === t ? 'bg-[#D1FF00]/10 border-[#D1FF00]/30 text-[#D1FF00]' : 'bg-white/5 border-white/10 text-white/40 hover:text-white/60'
                    }`}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2 block">Deskripsi</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Deskripsi posisi, kualifikasi, benefit..."
                className="w-full bg-white/5 border border-white/10 py-3 sm:py-3.5 px-4 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs focus:outline-none focus:border-[#D1FF00]/30 transition-colors resize-none" />
            </div>
          </motion.div>
        )}

        {/* Step 1: Dimension thresholds */}
        {step === 1 && selectedLevel && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 sm:space-y-5">
            <p className="text-[9px] sm:text-[10px] text-white/40">
              Atur <span className="font-bold text-white">skor minimal</span> untuk setiap dimensi. Atlet harus mencapai threshold ini untuk bisa melamar.
            </p>
            {selectedLevel.dimensions.map((dim) => (
              <div key={dim.id} className="bg-white/5 rounded-xl sm:rounded-2xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] sm:text-xs font-bold text-white">{dim.name}</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0" max="100" step="5"
                      value={minScores[dim.id] ?? 70}
                      onChange={(e) => handleDimensionMinScore(dim.id, parseInt(e.target.value))}
                      className="w-24 sm:w-32 accent-[#D1FF00]"
                    />
                    <span className="text-sm sm:text-base font-mono font-black text-[#D1FF00] min-w-[2.5rem] text-right">
                      {minScores[dim.id] ?? 70}
                    </span>
                  </div>
                </div>
                <div className="text-[8px] sm:text-[9px] text-white/30">{dim.description}</div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Step 2: Checklist item thresholds */}
        {step === 2 && selectedLevel && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 sm:space-y-5">
            <p className="text-[9px] sm:text-[10px] text-white/40">
              Atur <span className="font-bold text-white">nilai minimal</span> per item checklist dan <span className="font-bold text-white">bobot</span> kepentingannya.
            </p>
            {selectedLevel.dimensions.map((dim) => {
              const dimScore = minScores[dim.id] ?? 70;
              if (dimScore <= 0) return null;
              const items = [...dim.items, ...(customItems[dim.id] || [])];
              return (
                <div key={dim.id} className="bg-white/5 rounded-xl sm:rounded-2xl p-4 border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] sm:text-xs font-bold text-[#D1FF00]">{dim.name}</p>
                    <button
                      onClick={() => addCustomItem(dim.id)}
                      className="flex items-center gap-1 text-[8px] sm:text-[9px] font-bold text-[#D1FF00]/60 hover:text-[#D1FF00] transition-colors uppercase tracking-wider"
                    >
                      <Plus className="w-3 h-3" /> Custom Item
                    </button>
                  </div>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 sm:gap-3">
                        <p className="text-[8px] sm:text-[9px] text-white/60 min-w-[8rem] sm:min-w-[10rem] truncate">{item.label}</p>
                        <input
                          type="number" step="0.1"
                          placeholder="Min"
                          value={checklistReqs[dim.id]?.[item.id]?.minValue ?? ''}
                          onChange={(e) => handleChecklistMinValue(dim.id, item.id, parseFloat(e.target.value) || 0)}
                          className="w-16 sm:w-20 bg-white/5 border border-white/10 py-1.5 px-2 rounded text-[9px] sm:text-[10px] focus:outline-none focus:border-[#D1FF00]/30"
                        />
                        <span className="text-[8px] text-white/20 font-mono">{item.unit}</span>
                        <input
                          type="number" min="0.1" max="2" step="0.1"
                          placeholder="Wt"
                          value={checklistReqs[dim.id]?.[item.id]?.weight ?? ''}
                          onChange={(e) => handleChecklistWeight(dim.id, item.id, parseFloat(e.target.value) || 1)}
                          className="w-12 sm:w-16 bg-white/5 border border-white/10 py-1.5 px-2 rounded text-[9px] sm:text-[10px] focus:outline-none focus:border-[#D1FF00]/30"
                        />
                        <span className="text-[7px] text-white/20 font-mono">bobot</span>
                        {item.id.startsWith('custom_') && (
                          <button onClick={() => setCustomItems((prev) => ({ ...prev, [dim.id]: prev[dim.id]?.filter((ci) => ci.id !== item.id) || [] }))}
                            className="text-red-400/50 hover:text-red-400">
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Step 3: Review */}
        {step === 3 && selectedLevel && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 sm:space-y-5">
            <div className="bg-[#111111] border border-white/10 rounded-2xl p-4 sm:p-6">
              <h3 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-white/60 mb-4">Ringkasan Lowongan</h3>
              <div className="space-y-2 text-[10px] sm:text-xs">
                <div className="flex justify-between"><span className="text-white/40">Judul</span><span className="font-bold text-white">{form.title}</span></div>
                <div className="flex justify-between"><span className="text-white/40">Klub</span><span className="font-bold text-[#D1FF00]">{form.organization}</span></div>
                <div className="flex justify-between"><span className="text-white/40">Olahraga</span><span>{selectedSport?.name} — {selectedLevel.label}</span></div>
                <div className="flex justify-between"><span className="text-white/40">Tipe</span><span className="uppercase text-white/60">{form.type}</span></div>
                <div className="flex justify-between"><span className="text-white/40">Lokasi</span><span>{form.location}</span></div>
              </div>
              <div className="h-px bg-white/5 my-4" />
              <h3 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-white/60 mb-3">
                Kriteria KYS ({skillRequirements.length} dimensi)
              </h3>
              <div className="space-y-2">
                {skillRequirements.map((req) => (
                  <div key={req.dimensionId} className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg">
                    <span className="text-[10px] font-bold text-white">{req.dimensionName}</span>
                    <span className="text-[10px] font-mono text-[#D1FF00]">Min {req.minScore}</span>
                  </div>
                ))}
              </div>
            </div>
            <MatchIndicator matchPercent={72} dimensionScores={skillRequirements.map((r) => ({
              dimensionId: r.dimensionId, dimensionName: r.dimensionName, score: r.minScore, items: [],
            }))} requirementName="Preview — estimasi match" />
          </motion.div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-6 sm:mt-8">
          {step > 0 ? (
            <button onClick={() => setStep(step - 1)}
              className="px-5 py-3 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-[0.1em] text-[9px] sm:text-[10px] rounded-xl sm:rounded-2xl hover:bg-white/10 transition-colors flex items-center gap-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Sebelumnya
            </button>
          ) : <div />}
          {step < 3 ? (
            <button onClick={() => { if (canProceed()) setStep(step + 1); }}
              className={`px-6 py-3 font-black uppercase tracking-[0.15em] text-[9px] sm:text-[10px] rounded-xl sm:rounded-2xl flex items-center gap-2 transition-all ${
                canProceed()
                  ? 'bg-[#D1FF00] text-black shadow-[0_0_20px_rgba(209,255,0,0.2)] hover:shadow-[0_0_30px_rgba(209,255,0,0.3)]'
                  : 'bg-white/5 text-white/20 cursor-not-allowed'
              }`} disabled={!canProceed()}>
              Selanjutnya <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button onClick={handlePost}
              className="px-6 py-3 bg-[#D1FF00] text-black font-black uppercase tracking-[0.15em] text-[9px] sm:text-[10px] rounded-xl sm:rounded-2xl flex items-center gap-2 shadow-[0_0_20px_rgba(209,255,0,0.2)] hover:shadow-[0_0_30px_rgba(209,255,0,0.3)] transition-all">
              <Send className="w-3.5 h-3.5" /> Posting Lowongan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
