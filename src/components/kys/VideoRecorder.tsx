import { useState, useRef, useCallback, useEffect } from 'react';
import { Square, Trash2, CheckCircle, AlertCircle, Camera, Upload, Film } from 'lucide-react';
import { useCameraValidation } from '../../hooks/useCameraValidation';
import { CameraGuideOverlay } from './ValidationOverlay';
import { CountdownTimer } from './CountdownTimer';

interface VideoRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  onRetake: () => void;
  recordedBlob: Blob | null;
  duration?: number;
}

export default function VideoRecorder({ onRecordingComplete, onRetake, recordedBlob, duration = 15 }: VideoRecorderProps) {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recording, setRecording] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  const { validation, initValidator, validateLiveFrame, stopValidator } = useCameraValidation();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animationFrameRef = useRef<number>();

  const processValidationFrame = useCallback(async function loop() {
    if (!videoRef.current || !canvasRef.current || videoRef.current.readyState !== 4) {
      animationFrameRef.current = requestAnimationFrame(loop);
      return;
    }
    
    const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true });
    if (ctx) {
       canvasRef.current.width = videoRef.current.videoWidth;
       canvasRef.current.height = videoRef.current.videoHeight;
       ctx.drawImage(videoRef.current, 0, 0);
       await validateLiveFrame(canvasRef.current, performance.now());
    }
    animationFrameRef.current = requestAnimationFrame(loop);
  }, [validateLiveFrame]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    stopValidator();
    Promise.resolve().then(() => {
      setStream(null);
    });
  }, [stopValidator]);

  const startCamera = useCallback(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } })
      .then(async (s) => { 
        streamRef.current = s; 
        setStream(s); 
        if (videoRef.current) videoRef.current.srcObject = s; 
        setError(''); 
        await initValidator();
        animationFrameRef.current = requestAnimationFrame(processValidationFrame);
      })
      .catch(() => setError('Kamera tidak dapat diakses. Izinkan akses kamera atau unggah file video Anda.'));
  }, [initValidator, processValidationFrame]);

  useEffect(() => {
    if (activeTab === 'camera' && !recordedBlob) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [activeTab, recordedBlob, startCamera, stopCamera]);

  const startRecording = () => {
    if (!stream) return;
    let count = 3;
    setCountdown(count);
    // Optional: play an initial beep here
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError('');
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        onRecordingComplete(file);
      } else {
        setError('Format file tidak didukung. Harap masukkan file video (MP4, WebM, MOV, dll).');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('video/')) {
        onRecordingComplete(file);
      } else {
        setError('Format file tidak didukung. Harap masukkan file video (MP4, WebM, MOV, dll).');
      }
    }
  };

  const previewUrl = recordedBlob ? URL.createObjectURL(recordedBlob) : null;

  return (
    <div className="bg-[#0f0f0f] rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 flex flex-col h-full">
      {/* If video is loaded or recorded, show preview mode */}
      {recordedBlob && previewUrl ? (
        <div className="flex flex-col h-full bg-black">
          <div className="aspect-[4/3] relative bg-[#090909]">
            <video src={previewUrl} controls className="w-full h-full object-cover" />
          </div>
          <div className="flex justify-between items-center p-3 border-t border-white/5 bg-[#0f0f0f]">
            <button
              onClick={() => {
                onRetake();
                if (activeTab === 'camera') startCamera();
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[8px] sm:text-[9px] font-bold text-white/80 active:scale-95 transition-all uppercase tracking-wider"
            >
              <Trash2 className="w-3.5 h-3.5" /> Bersihkan & Ganti
            </button>
            <div className="flex items-center gap-1.5 text-[#D1FF00] font-black text-[8px] sm:text-[9px] uppercase tracking-wider bg-[#D1FF00]/10 border border-[#D1FF00]/20 px-2.5 py-1.5 rounded-lg">
              <CheckCircle className="w-3.5 h-3.5" /> Video Siap Dianalisis
            </div>
          </div>
        </div>
      ) : (
        /* Selection / active mode stage */
        <div className="flex flex-col flex-1 min-h-[280px]">
          {/* Tabs switch bar */}
          <div className="flex border-b border-white/5 bg-[#0a0a0a]">
            <button
              type="button"
              onClick={() => {
                setActiveTab('camera');
                setError('');
              }}
              className={`flex-1 py-3 text-[8px] sm:text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                activeTab === 'camera'
                  ? 'text-[#D1FF00] bg-white/[0.02] border-b-2 border-[#D1FF00]'
                  : 'text-white/40 hover:text-white/80'
              }`}
            >
              <Camera className="w-3.5 h-3.5" /> Kamera Aktif
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('upload');
                stopCamera();
                setError('');
              }}
              className={`flex-1 py-3 text-[8px] sm:text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                activeTab === 'upload'
                  ? 'text-[#D1FF00] bg-white/[0.02] border-b-2 border-[#D1FF00]'
                  : 'text-white/40 hover:text-white/80'
              }`}
            >
              <Upload className="w-3.5 h-3.5" /> Unggah Video
            </button>
          </div>

          <div className="p-3 sm:p-4 flex-1 flex flex-col justify-center">
            {error && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-red-400 mb-3 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-[9px] sm:text-[10px] font-bold leading-normal m-0">{error}</p>
                </div>
              </div>
            )}

            {activeTab === 'camera' ? (
              <div className="relative">
                <div className="aspect-[4/3] rounded-lg overflow-hidden bg-black border border-white/5 relative">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {!recording && countdown === 0 && <CameraGuideOverlay validation={validation} isActive={true} />}
                  
                  {countdown > 0 && <CountdownTimer count={countdown} />}

                  {recording && (
                    <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-500 bg-opacity-90 px-3 py-1.5 rounded-full border border-red-400/30 z-20 shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      <span className="text-[8px] sm:text-[9px] font-black text-white uppercase tracking-wider">REKAM: {elapsed}s / {duration}s</span>
                    </div>
                  )}
                  {recording && (
                     <div className="absolute inset-0 border-4 border-red-500/30 rounded-lg pointer-events-none" />
                  )}
                </div>

                <div className="mt-4">
                  {!recording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      disabled={!stream || !validation.overallReady}
                      className="w-full py-3 sm:py-4 bg-[#D1FF00] hover:bg-[#bce600] active:scale-95 disabled:hover:bg-white/10 disabled:bg-white/5 disabled:text-white/30 text-black font-black uppercase tracking-[0.12em] text-[10px] sm:text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(209,255,0,0.3)] disabled:shadow-none"
                    >
                      <Camera className="w-4 h-4 fill-current" /> {!validation.overallReady ? "Sesuaikan Posisi ke Area Terang" : `Tahan & Rekam Latihan (${duration}s)`}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="w-full py-3 sm:py-4 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black uppercase tracking-[0.12em] text-[10px] sm:text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                    >
                      <Square className="w-4 h-4 fill-current" /> Akhiri & Simpan Rekaman
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Drag & Drop uploaded video interface */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`aspect-[4/3] rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center p-4 cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#D1FF00] bg-[#D1FF00]/5 scale-[0.99]'
                    : 'border-white/10 hover:border-white/20 bg-white/[0.01] hover:bg-white/[0.02]'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="video/*"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3 text-white/60">
                  <Film className={`w-6 h-6 ${isDragging ? 'text-[#D1FF00] animate-bounce' : ''}`} />
                </div>
                
                <h5 className="text-[10px] sm:text-xs font-black text-white uppercase tracking-widest mb-1">
                  {isDragging ? 'Lepas Video Di Sini' : 'Tarik atau Pilih Video'}
                </h5>
                <p className="text-[8px] text-white/40 max-w-[200px] leading-relaxed mb-4">
                  Seret video latihan Anda ke sini, atau klik untuk memilih file dari galeri. (MP4, WebM, MOV)
                </p>

                <div className="px-3.5 py-1.5 bg-[#D1FF00] text-black text-[8px] font-black uppercase tracking-wider rounded-lg shadow-md">
                  Pilih File Video
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


