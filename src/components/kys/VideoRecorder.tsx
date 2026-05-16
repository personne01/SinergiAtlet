import { useState, useRef, useCallback, useEffect } from 'react';
import { Square, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

interface VideoRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  onRetake: () => void;
  recordedBlob: Blob | null;
  duration?: number;
}

export default function VideoRecorder({ onRecordingComplete, onRetake, recordedBlob, duration = 15 }: VideoRecorderProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recording, setRecording] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStream(null);
  }, []);

  const startCamera = useCallback(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } })
      .then((s) => { streamRef.current = s; setStream(s); if (videoRef.current) videoRef.current.srcObject = s; setError(''); })
      .catch(() => setError('Kamera tidak dapat diakses. Izinkan akses kamera atau gunakan perangkat lain.'));
  }, []);

  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const startRecording = () => {
    if (!stream) return;
    let count = 3;
    setCountdown(count);
    const ci = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(ci);
        setCountdown(0);
        beginRecording();
      } else {
        setCountdown(count);
      }
    }, 1000);
  };

  const beginRecording = () => {
    if (!stream) return;
    chunksRef.current = [];
    const mr = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm' });
    mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      onRecordingComplete(blob);
      setElapsed(0);
    };
    mr.start(100);
    mediaRecorderRef.current = mr;
    setRecording(true);

    const start = Date.now();
    timerRef.current = setInterval(() => {
      const e = Math.floor((Date.now() - start) / 1000);
      setElapsed(e);
      if (e >= duration) stopRecording();
    }, 200);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    clearInterval(timerRef.current);
    setRecording(false);
    stopCamera();
  };

  const previewUrl = recordedBlob ? URL.createObjectURL(recordedBlob) : null;

  return (
    <div className="bg-black rounded-xl sm:rounded-2xl overflow-hidden border border-white/10">
      {error ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mb-3" />
          <p className="text-[10px] sm:text-xs text-red-400 font-bold mb-3">{error}</p>
          <button onClick={startCamera} className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-[9px] font-bold text-white uppercase tracking-wider hover:bg-white/20 transition-colors">
            Coba Lagi
          </button>
        </div>
      ) : recordedBlob && previewUrl ? (
        <div>
          <video src={previewUrl} controls className="w-full aspect-[4/3] object-cover bg-black" />
          <div className="flex gap-2 p-3">
            <button onClick={() => { onRetake(); startCamera(); }} className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[8px] sm:text-[9px] font-bold text-white/60 hover:text-white uppercase tracking-wider transition-colors">
              <Trash2 className="w-3 h-3" /> Rekam Ulang
            </button>
            <div className="flex items-center gap-1.5 ml-auto text-[8px] sm:text-[9px] text-[#D1FF00] font-bold">
              <CheckCircle className="w-3 h-3" /> Video tersimpan
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          <video ref={videoRef} autoPlay playsInline muted className="w-full aspect-[4/3] object-cover bg-black" />
          {countdown > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <span className="text-5xl sm:text-7xl font-black text-[#D1FF00] animate-pulse">{countdown}</span>
            </div>
          )}
          {recording && (
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-500/80 px-2.5 py-1 rounded-full">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-[8px] sm:text-[9px] font-bold text-white">{elapsed}s / {duration}s</span>
            </div>
          )}
          <div className="p-3">
            {!recording ? (
              <button onClick={startRecording} disabled={!stream} className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-[0.1em] text-[9px] sm:text-[10px] rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <Square className="w-3.5 h-3.5 fill-current" /> Mulai Rekam ({duration}s)
              </button>
            ) : (
              <button onClick={stopRecording} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-[0.1em] text-[9px] sm:text-[10px] rounded-lg flex items-center justify-center gap-2 transition-colors">
                <Square className="w-3.5 h-3.5 fill-current" /> Hentikan Rekaman
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
