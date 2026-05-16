import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Send, User, Phone, Mail, FileText, CheckCircle } from 'lucide-react';
import { JOBS } from '../data/mock';

export default function ApplyPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const job = JOBS.find((j) => j.id === jobId);

  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  if (!job) {
    return (
      <div className="text-center py-16">
        <p className="text-white/20 text-sm font-bold">Lowongan tidak ditemukan</p>
        <button
          onClick={() => navigate('/market')}
          className="mt-4 text-[#D1FF00] text-xs font-bold uppercase tracking-wider"
        >
          Kembali
        </button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSubmitted(true);
    }, 1500);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12 sm:py-16 max-w-sm mx-auto"
      >
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#D1FF00]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#D1FF00]/20">
          <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-[#D1FF00]" />
        </div>
        <h2 className="text-lg sm:text-xl font-black text-white mb-2">Lamaran Terkirim!</h2>
        <p className="text-[10px] sm:text-xs text-white/40 leading-relaxed mb-6">
          Lamaran Anda untuk <span className="text-white font-bold">{job.title}</span> di{' '}
          <span className="text-[#D1FF00]">{job.organization}</span> telah terkirim.
          Tim rekrutmen akan mereview dan menghubungi Anda.
        </p>
        <button
          onClick={() => navigate('/market')}
          className="py-3 px-6 bg-[#D1FF00] text-black font-black uppercase tracking-[0.15em] text-[9px] sm:text-[10px] rounded-xl sm:rounded-2xl"
        >
          Kembali ke Marketplace
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <button
        onClick={() => navigate('/market')}
        className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold text-white/30 hover:text-white/60 transition-colors mb-4 sm:mb-6 uppercase tracking-wider"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Kembali
      </button>

      <div className="bg-[#111111] border border-[#D1FF00]/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-white">{job.title}</h2>
            <p className="text-[#D1FF00] text-[10px] sm:text-xs font-mono uppercase tracking-widest mt-0.5">
              {job.organization}
            </p>
          </div>
          <span className="bg-white/5 border border-white/10 text-[8px] sm:text-[9px] px-2 py-1 rounded uppercase text-white/60 shrink-0">
            {job.type}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-3 text-[8px] sm:text-[9px] text-white/30 font-mono">
          <span>{job.location}</span>
          <span className="text-white/10">|</span>
          <span className="text-[#D1FF00]">{job.criteria}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        <div>
          <label className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-white/40 mb-2 flex items-center gap-1.5">
            <User className="w-3 h-3" /> Nama Lengkap
          </label>
          <input
            type="text"
            placeholder="Nama sesuai KTP"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="w-full bg-white/5 border border-white/10 py-3 sm:py-3.5 px-4 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs focus:outline-none focus:border-[#D1FF00]/30 transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <div>
            <label className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-white/40 mb-2 flex items-center gap-1.5">
              <Mail className="w-3 h-3" /> Email
            </label>
            <input
              type="email"
              placeholder="email@domain.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="w-full bg-white/5 border border-white/10 py-3 sm:py-3.5 px-4 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs focus:outline-none focus:border-[#D1FF00]/30 transition-colors"
            />
          </div>
          <div>
            <label className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-white/40 mb-2 flex items-center gap-1.5">
              <Phone className="w-3 h-3" /> No. Telepon
            </label>
            <input
              type="tel"
              placeholder="08xxxxxxxxxx"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
              className="w-full bg-white/5 border border-white/10 py-3 sm:py-3.5 px-4 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs focus:outline-none focus:border-[#D1FF00]/30 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-white/40 mb-2 flex items-center gap-1.5">
            <FileText className="w-3 h-3" /> Surat Lamaran
          </label>
          <textarea
            placeholder="Ceritakan mengapa Anda cocok untuk posisi ini..."
            rows={4}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full bg-white/5 border border-white/10 py-3 sm:py-3.5 px-4 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs focus:outline-none focus:border-[#D1FF00]/30 transition-colors resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={sending}
          className="w-full py-3 sm:py-4 bg-[#D1FF00] text-black font-black uppercase tracking-[0.15em] text-[9px] sm:text-[10px] lg:text-xs rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(209,255,0,0.2)] hover:shadow-[0_0_30px_rgba(209,255,0,0.3)] transition-all disabled:opacity-50"
        >
          {sending ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Mengirim...
            </span>
          ) : (
            <>
              Kirim Lamaran <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
