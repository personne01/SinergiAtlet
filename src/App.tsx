/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  User, 
  Search, 
  Activity, 
  Camera, 
  ChevronRight, 
  BarChart3, 
  MapPin, 
  ShieldCheck, 
  Zap,
  Briefcase,
  TrendingUp,
  Award,
  Bell,
  Star,
  Filter,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface Job {
  id: string;
  title: string;
  type: string;
  organization: string;
  location: string;
  criteria: string;
  salary?: string;
  isKYSRequired: boolean;
}

interface CareerStep {
  id: string;
  title: string;
  status: 'completed' | 'current' | 'locked';
  description: string;
  badge?: string;
}

// --- Mock Data ---
const JOBS: Job[] = [
  {
    id: 'j1',
    title: 'Penyerang Utama (U-19)',
    organization: 'Persija Academy',
    type: 'Beasiswa Penuh',
    location: 'Jakarta',
    criteria: 'KYS Agility > 85',
    isKYSRequired: true
  },
  {
    id: 'j2',
    title: 'Asisten Pelatih Fisik',
    organization: 'Elite Sport Center',
    type: 'Kontrak',
    location: 'Bandung',
    criteria: 'Sertifikat AFC/PSSI',
    isKYSRequired: false
  },
  {
    id: 'j3',
    title: 'Gelandang Bertahan',
    organization: 'Bali United Youth',
    type: 'Try-out',
    location: 'Gianyar',
    criteria: 'KYS Stamina > 90',
    isKYSRequired: true
  }
];

const CAREER_PATH: CareerStep[] = [
  { id: 'c1', title: 'Grassroots Talent', status: 'completed', description: 'Memasuki akademi lokal dan membangun data fisik dasar.', badge: 'Foundation' },
  { id: 'c2', title: 'Verified Prospect', status: 'current', description: 'Melakukan KYS pertama dan divalidasi oleh AI system.', badge: 'Verified' },
  { id: 'c3', title: 'Professional Debut', status: 'locked', description: 'Mendapat kontrak pertama melalui Marketplace SDM.' },
  { id: 'c4', title: 'Elite National', status: 'locked', description: 'Mencapai skor KYS rata-rata di atas 95.' }
];

// --- Modular Components ---

const Navbar = () => (
  <nav className="h-16 px-6 flex items-center justify-between border-b border-white/10 bg-[#0a0a0a] sticky top-0 z-50">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-[#D1FF00] rounded-sm flex items-center justify-center">
        <Trophy className="w-4 h-4 text-black transform -rotate-12" />
      </div>
      <span className="text-lg font-bold tracking-tighter uppercase text-white">
        Sinergi<span className="text-[#D1FF00]">Atlet</span>
      </span>
    </div>
    <div className="flex items-center gap-4">
      <div className="w-8 h-8 rounded-full border border-white/20 bg-white/5 flex items-center justify-center relative">
        <Bell className="w-4 h-4 text-white/60" />
        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#D1FF00] rounded-full"></span>
      </div>
      <div className="w-8 h-8 rounded-full border border-white/20 bg-white/5 flex items-center justify-center overflow-hidden">
        <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop" alt="Profile" />
      </div>
    </div>
  </nav>
);

const JobCard = ({ job }: { job: Job }) => (
  <motion.div 
    whileTap={{ scale: 0.98 }}
    className="bg-[#111111] border border-white/5 rounded-2xl p-5 mb-4 group hover:border-[#D1FF00]/30 transition-all cursor-pointer"
  >
    <div className="flex justify-between items-start mb-3">
      <div>
        <h4 className="text-white font-bold text-sm mb-1">{job.title}</h4>
        <p className="text-[#D1FF00] text-[10px] font-mono uppercase tracking-widest">{job.organization}</p>
      </div>
      <span className="bg-white/5 border border-white/10 text-[9px] px-2 py-1 rounded uppercase text-white/60">
        {job.type}
      </span>
    </div>
    
    <div className="space-y-2 mb-4">
      <div className="flex items-center gap-2 text-white/40 text-[10px]">
        <MapPin className="w-3 h-3" />
        {job.location}
      </div>
      <div className="flex items-center gap-2 text-white/60 text-[10px]">
        <Star className="w-3 h-3 text-[#D1FF00]" />
        Kriteria: <span className="text-[#D1FF00]">{job.criteria}</span>
      </div>
    </div>

    <div className="flex items-center justify-between pt-3 border-t border-white/5">
      {job.isKYSRequired ? (
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#D1FF00]" />
          <span className="text-[9px] font-bold text-white uppercase italic">KYS Verified Only</span>
        </div>
      ) : <div className="text-[9px] text-white/20 uppercase font-bold">Terbuka Umum</div>}
      
      <button className="flex items-center gap-1 text-[10px] font-black text-white hover:text-[#D1FF00] transition-colors uppercase">
        Lamar Sekarang <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  </motion.div>
);

const CareerStepper = () => (
  <div className="space-y-6 relative px-2">
    <div className="absolute left-6 top-2 bottom-2 w-px bg-white/10"></div>
    {CAREER_PATH.map((step, i) => (
      <div key={step.id} className="flex gap-6 relative">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-2 ${
          step.status === 'completed' ? 'bg-[#D1FF00] border-[#D1FF00] text-black' : 
          step.status === 'current' ? 'bg-black border-[#D1FF00] text-[#D1FF00]' : 
          'bg-[#0a0a0a] border-white/10 text-white/20'
        }`}>
          {step.status === 'completed' ? <ShieldCheck className="w-4 h-4" /> : <span className="text-xs font-bold">{i+1}</span>}
        </div>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h4 className={`text-sm font-bold ${step.status === 'locked' ? 'text-white/20' : 'text-white'}`}>
              {step.title}
            </h4>
            {step.badge && (
              <span className="bg-[#D1FF00]/10 text-[#D1FF00] text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">
                {step.badge}
              </span>
            )}
          </div>
          <p className={`text-[10px] leading-relaxed ${step.status === 'locked' ? 'text-white/10' : 'text-white/40'}`}>
            {step.description}
          </p>
          {step.status === 'current' && (
            <button className="mt-3 text-[10px] font-bold text-[#D1FF00] flex items-center gap-1 border border-[#D1FF00]/30 px-3 py-1 rounded-lg">
              Selesaikan Challenge <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    ))}
  </div>
);

const KYSWidget = () => (
  <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 relative overflow-hidden group mb-8">
    <div className="absolute top-0 right-0 w-32 h-32 bg-[#D1FF00]/10 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
    <div className="relative z-10">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#D1FF00]/10 flex items-center justify-center">
          <Activity className="w-4 h-4 text-[#D1FF00]" />
        </div>
        <h3 className="text-sm font-bold uppercase tracking-widest italic">Knowing Your Skill <span className="text-[#D1FF00]">(KYS)</span></h3>
      </div>
      <p className="text-[10px] text-white/50 leading-relaxed mb-6">Gunakan AI Scanner untuk memvalidasi fisik Anda. Skor KYS akan muncul secara otomatis di Portofolio Digital dan membuka peluang Karir Elite.</p>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
          <span className="text-[8px] text-white/30 uppercase block mb-1">Speed</span>
          <span className="text-lg font-mono text-white italic">84</span>
        </div>
        <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
          <span className="text-[8px] text-white/30 uppercase block mb-1">Stamina</span>
          <span className="text-lg font-mono text-[#D1FF00] italic">92</span>
        </div>
        <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
          <span className="text-[8px] text-white/30 uppercase block mb-1">Agility</span>
          <span className="text-lg font-mono text-white italic">78</span>
        </div>
      </div>

      <button className="w-full py-4 bg-[#D1FF00] text-black font-black uppercase tracking-[0.15em] text-[10px] rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(209,255,0,0.2)]">
        <Camera className="w-4 h-4" /> Mulai AI Scanner
      </button>
    </div>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('market');

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans max-w-md mx-auto shadow-2xl relative border-x border-white/10 overflow-x-hidden pb-40">
      <Navbar />

      <main className="p-6">
        {activeTab === 'market' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-light italic">Marketplace <span className="font-bold not-italic text-[#D1FF00]">SDM</span></h2>
                <p className="text-white/40 text-[9px] uppercase tracking-widest mt-1">Sinergi Karir Olahraga Indonesia</p>
              </div>
              <button className="p-2 bg-white/5 border border-white/10 rounded-xl">
                <Filter className="w-4 h-4 text-white/40" />
              </button>
            </div>

            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Cari klub, beasiswa, atau akademi..."
                className="w-full bg-white/5 border border-white/5 py-4 pl-12 pr-4 rounded-2xl text-[11px] focus:outline-none focus:border-[#D1FF00]/30 transition-colors"
              />
            </div>

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Peluang Karir Terbaru</h3>
              <div className="h-0.5 bg-white/5 flex-1 mx-4"></div>
            </div>

            <div className="space-y-1">
              {JOBS.map(job => <JobCard key={job.id} job={job} />)}
            </div>
            
            <button className="w-full py-4 mt-4 border border-white/5 rounded-2xl text-[10px] uppercase font-bold text-white/20 hover:text-white transition-colors">
              Lihat Peluang Lainnya
            </button>
          </motion.div>
        )}

        {activeTab === 'career' && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="mb-8">
              <h2 className="text-2xl font-light italic">Career <span className="font-bold not-italic text-[#D1FF00]">Path</span></h2>
              <p className="text-white/40 text-[9px] uppercase tracking-widest mt-1">Peta Jalan Menuju Atlet Professional</p>
            </div>
            
            <div className="bg-[#111111] border border-[#D1FF00]/20 rounded-3xl p-6 mb-8 relative overflow-hidden">
               <div className="flex items-center justify-between gap-4 mb-6">
                 <div>
                   <p className="text-[9px] uppercase tracking-widest text-[#D1FF00] font-bold mb-1">Rank Saat Ini</p>
                   <h3 className="text-xl font-black italic">VERIFIED PROSPECT</h3>
                 </div>
                 <div className="w-14 h-14 rounded-2xl bg-[#D1FF00] flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-black" />
                 </div>
               </div>
               <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-2">
                 <div className="h-full bg-[#D1FF00] w-[45%]"></div>
               </div>
               <div className="flex justify-between items-center text-[9px] font-mono text-white/40">
                  <span>EXP: 1,450 / 3,000</span>
                  <span>NEXT: PRO DEBUT</span>
               </div>
            </div>

            <CareerStepper />
          </motion.div>
        )}

        {activeTab === 'kys' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
             <div className="mb-8">
                <h2 className="text-2xl font-light italic">Validation <span className="font-bold not-italic text-[#D1FF00]">Center</span></h2>
                <p className="text-white/40 text-[9px] uppercase tracking-widest mt-1">Audit Fisik Berbasis AI Real-time</p>
              </div>

              <KYSWidget />

              <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#D1FF00]" /> Pencapaian Skill
                </h4>
                <div className="space-y-4">
                  {[
                    { label: 'Top 5% Agility Nasional', date: '12 Okt 2023', score: '8.4s' },
                    { label: 'Stamina Endurance Elite', date: '01 Nov 2023', score: '92.4' }
                  ].map((badge, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div>
                        <p className="text-xs font-bold text-white mb-1">{badge.label}</p>
                        <p className="text-[9px] text-white/40 uppercase font-mono">{badge.date}</p>
                      </div>
                      <span className="text-sm font-mono text-[#D1FF00] italic">{badge.score}</span>
                    </div>
                  ))}
                </div>
              </div>
          </motion.div>
        )}
      </main>

      {/* Bottom HUD Navigation */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-6 pb-8 z-50">
        <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-3 flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
           <button 
            onClick={() => setActiveTab('market')}
            className={`flex flex-col items-center gap-1.5 px-5 py-3 rounded-2xl transition-all ${activeTab === 'market' ? 'bg-[#D1FF00] text-black scale-105' : 'text-white/40 hover:text-white/60'}`}
          >
            <Briefcase className="w-5 h-5" />
            <span className="text-[8px] font-black uppercase tracking-tighter">Market</span>
          </button>

          <button 
            onClick={() => setActiveTab('career')}
            className={`flex flex-col items-center gap-1.5 px-5 py-3 rounded-2xl transition-all ${activeTab === 'career' ? 'bg-[#D1FF00] text-black scale-105' : 'text-white/40 hover:text-white/60'}`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-[8px] font-black uppercase tracking-tighter">Career</span>
          </button>

          <button 
            onClick={() => setActiveTab('kys')}
            className={`flex flex-col items-center gap-1.5 px-5 py-3 rounded-2xl transition-all ${activeTab === 'kys' ? 'bg-[#D1FF00] text-black scale-105' : 'text-white/40 hover:text-white/60'}`}
          >
            <Zap className="w-5 h-5" />
            <span className="text-[8px] font-black uppercase tracking-tighter">KYS</span>
          </button>
        </div>
      </div>
      
      {/* System Status Relay Footer */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-6 bg-[#0a0a0a] flex items-center justify-between px-6 z-40">
        <span className="text-[7px] font-mono text-white/20 uppercase">Core: 4.1.2_Stable</span>
        <span className="text-[7px] font-mono text-[#D1FF00]/30 uppercase">Market active: 1,240 Nodes</span>
      </div>
    </div>
  );
}



