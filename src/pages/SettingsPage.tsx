import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Bell, Eye, Volume2, ShieldAlert } from 'lucide-react';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [sounds, setSounds] = useState(true);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mb-1">
          Pengaturan Sistem
        </h1>
        <p className="text-xs sm:text-sm text-white/40">
          Sesuaikan preferensi performa dan tampilan antarmuka Anda.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                <Bell className="w-4 h-4 text-white/60" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase text-white/80">Notifikasi Lowongan</h3>
                <p className="text-[10px] text-white/40">Kirim pemberitahuan lowongan baru dan status KYS</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications}
                onChange={() => setNotifications(!notifications)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#D1FF00]" />
            </label>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                <Eye className="w-4 h-4 text-[#D1FF00]" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase text-white/80">Kontras Tinggi</h3>
                <p className="text-[10px] text-white/40">Optimalkan warna kontras layar agar lebih nyaman dipandang</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={highContrast}
                onChange={() => setHighContrast(!highContrast)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#D1FF00]" />
            </label>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                <Volume2 className="w-4 h-4 text-white/60" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase text-white/80">Efek Suara AI</h3>
                <p className="text-[10px] text-white/40">Aktifkan efek audio saat analisis pose KYS selesai</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={sounds}
                onChange={() => setSounds(!sounds)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#D1FF00]" />
            </label>
          </div>
        </div>

        <div className="border-t border-white/5 pt-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex gap-3">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-red-400 uppercase tracking-wide">Privasi Data Data KYS</h4>
              <p className="text-[10px] text-red-400/80 mt-1">
                Data rekaman video Anda diproses langsung di browser Anda menggunakan model lokal MediaPipe AI dan tidak disimpan permanen di server luar kecuali jika Anda menggunakannya untuk proses lamaran klub.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
