import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import { Camera, Flashlight, Upload, X, CheckCircle2, Package, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { DeliveryPackage } from '../../types';
import { SAMPLE_PACKAGES_SP } from '../../utils/sampleData';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPackageScanned: (pkg: DeliveryPackage) => void;
  onBatchScanned: (packages: DeliveryPackage[]) => void;
  alreadyScannedIds: string[];
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onPackageScanned,
  onBatchScanned,
  alreadyScannedIds,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [lastScannedResult, setLastScannedResult] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [scanTab, setScanTab] = useState<'camera' | 'batch' | 'manual'>('camera');
  const [isScanningActive, setIsScanningActive] = useState(true);
  const requestAnimRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Play auditory feedback on successful scan
  const playScanBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 beep
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {
      // Audio context might be restricted before user interaction
    }
  };

  // Start Camera
  useEffect(() => {
    if (!isOpen || scanTab !== 'camera') {
      stopCamera();
      return;
    }

    let isMounted = true;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          await videoRef.current.play();
        }
        setHasCameraPermission(true);
        startScanningLoop();
      } catch (err) {
        console.warn('Camera access error:', err);
        if (isMounted) setHasCameraPermission(false);
      }
    }

    startCamera();

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, [isOpen, scanTab]);

  const stopCamera = () => {
    if (requestAnimRef.current) {
      cancelAnimationFrame(requestAnimRef.current);
      requestAnimRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  // Continuous frame analysis for QR codes
  const startScanningLoop = () => {
    const scanFrame = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data && isScanningActive) {
            handleDecodedQRString(code.data);
          }
        }
      }
      requestAnimRef.current = requestAnimationFrame(scanFrame);
    };

    requestAnimRef.current = requestAnimationFrame(scanFrame);
  };

  const handleDecodedQRString = (rawString: string) => {
    setIsScanningActive(false);
    playScanBeep();
    setLastScannedResult(rawString);

    let parsedPackage: DeliveryPackage | null = null;

    try {
      // 1. Try parsing JSON payload
      const json = JSON.parse(rawString);
      if (json.trackingCode || json.id || json.address) {
        parsedPackage = {
          id: json.id || `pkg-scan-${Date.now()}`,
          trackingCode: json.trackingCode || `ROTA-QR-${Math.floor(10000 + Math.random() * 90000)}`,
          recipientName: json.recipientName || json.recipient || 'Destinatário QR',
          recipientPhone: json.recipientPhone || '(11) 99999-0000',
          address: json.address || 'Endereço Lido pelo QR Code',
          neighborhood: json.neighborhood || 'Centro',
          city: json.city || 'São Paulo',
          state: json.state || 'SP',
          zipCode: json.zipCode || '01000-000',
          coordinates: {
            lat: json.lat || (json.coordinates ? json.coordinates.lat : -23.5505 + (Math.random() - 0.5) * 0.08),
            lng: json.lng || (json.coordinates ? json.coordinates.lng : -46.6333 + (Math.random() - 0.5) * 0.08),
          },
          weightKg: json.weightKg || 1.5,
          volumeCategory: json.volumeCategory || 'Médio',
          freightFee: json.freightFee || 18.0,
          companyName: json.companyName || 'Logística Integrada',
          deliveryStatus: 'pending',
          scannedAt: new Date().toISOString(),
        };
      }
    } catch {
      // 2. If plain string, check sample database or create from text
      const matched = SAMPLE_PACKAGES_SP.find(
        (p) => p.trackingCode.toLowerCase() === rawString.trim().toLowerCase() || p.id === rawString.trim()
      );

      if (matched) {
        parsedPackage = { ...matched, scannedAt: new Date().toISOString() };
      } else {
        // Fallback create custom package
        parsedPackage = {
          id: `pkg-${Date.now()}`,
          trackingCode: `ROTA-STR-${Math.floor(10000 + Math.random() * 90000)}`,
          recipientName: 'Cliente ' + rawString.slice(0, 15),
          recipientPhone: '(11) 98765-0000',
          address: rawString,
          neighborhood: 'Bairro SP',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01400-000',
          coordinates: {
            lat: -23.5505 + (Math.random() - 0.5) * 0.06,
            lng: -46.6333 + (Math.random() - 0.5) * 0.06,
          },
          weightKg: 2.0,
          volumeCategory: 'Médio',
          freightFee: 18.5,
          companyName: 'Mercado Express',
          deliveryStatus: 'pending',
          scannedAt: new Date().toISOString(),
        };
      }
    }

    if (parsedPackage) {
      onPackageScanned(parsedPackage);
    }

    setTimeout(() => {
      setIsScanningActive(true);
      setLastScannedResult(null);
    }, 1500);
  };

  // Toggle Camera Flash/Torch
  const toggleTorch = async () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      const capabilities = track.getCapabilities?.() as { torch?: boolean };
      if (capabilities && capabilities.torch) {
        try {
          await track.applyConstraints({
            advanced: [{ torch: !torchOn } as unknown as MediaTrackConstraintSet],
          });
          setTorchOn(!torchOn);
        } catch (e) {
          console.warn('Torch constraint error:', e);
        }
      } else {
        setTorchOn(!torchOn);
      }
    }
  };

  // Upload image file for barcode/QR detection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) {
            handleDecodedQRString(code.data);
          } else {
            // Pick a sample package from SP as fallback simulation
            const nextUnscanned = SAMPLE_PACKAGES_SP.find((p) => !alreadyScannedIds.includes(p.id)) || SAMPLE_PACKAGES_SP[0];
            handleDecodedQRString(JSON.stringify(nextUnscanned));
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  const availableSamples = SAMPLE_PACKAGES_SP.filter((p) => !alreadyScannedIds.includes(p.id));

  return (
    <div
      id="qr-scanner-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Scanner de QR Code & Pacotes</h3>
              <p className="text-xs text-slate-500 font-medium">Leitura instantânea para otimização da rota</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-1.5 gap-1.5">
          <button
            onClick={() => setScanTab('camera')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              scanTab === 'camera'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Câmera Ao Vivo
          </button>
          <button
            onClick={() => setScanTab('batch')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              scanTab === 'batch'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Lote Rápido (Demo)
          </button>
          <button
            onClick={() => setScanTab('manual')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              scanTab === 'manual'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            Manual
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto">
          {scanTab === 'camera' && (
            <div className="flex flex-col items-center">
              {/* Viewfinder View */}
              <div className="relative w-full aspect-square max-w-[320px] rounded-2xl overflow-hidden bg-slate-900 border-2 border-indigo-500 shadow-inner flex items-center justify-center">
                <video ref={videoRef} className="w-full h-full object-cover" />
                <canvas ref={canvasRef} className="hidden" />

                {/* Laser Scanning Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Framing corners */}
                  <div className="absolute top-4 left-4 w-7 h-7 border-t-4 border-l-4 border-indigo-400 rounded-tl-lg" />
                  <div className="absolute top-4 right-4 w-7 h-7 border-t-4 border-r-4 border-indigo-400 rounded-tr-lg" />
                  <div className="absolute bottom-4 left-4 w-7 h-7 border-b-4 border-l-4 border-indigo-400 rounded-bl-lg" />
                  <div className="absolute bottom-4 right-4 w-7 h-7 border-b-4 border-r-4 border-indigo-400 rounded-br-lg" />

                  {/* Animated Red/Cyan Laser Line */}
                  <div className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_12px_#6366f1] animate-scan-laser" />
                </div>

                {/* Success Feedback Overlay */}
                {lastScannedResult && (
                  <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-emerald-400 p-4 text-center animate-in fade-in">
                    <CheckCircle2 className="w-12 h-12 mb-2 animate-bounce" />
                    <span className="text-sm font-bold text-white">QR Code Lido com Sucesso!</span>
                    <span className="text-xs text-emerald-300 mt-1 max-w-[200px] truncate">{lastScannedResult}</span>
                  </div>
                )}

                {hasCameraPermission === false && (
                  <div className="absolute inset-0 bg-slate-900/90 p-4 flex flex-col items-center justify-center text-center">
                    <AlertCircle className="w-10 h-10 text-amber-400 mb-2" />
                    <p className="text-xs text-slate-300 mb-3 font-medium">
                      Acesso à câmera não disponível ou bloqueado. Use o modo Lote ou envie uma foto.
                    </p>
                    <button
                      onClick={() => setScanTab('batch')}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs"
                    >
                      Usar Pacotes de Teste
                    </button>
                  </div>
                )}
              </div>

              {/* Torch and Upload Controls */}
              <div className="flex items-center justify-center gap-3 mt-4 w-full">
                <button
                  onClick={toggleTorch}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    torchOn
                      ? 'bg-amber-400 text-slate-950 border-amber-300'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Flashlight className="w-4 h-4" />
                  {torchOn ? 'Lanterna Ligada' : 'Luz Noturna'}
                </button>

                <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 cursor-pointer transition-all">
                  <Upload className="w-4 h-4" />
                  Foto da Etiqueta
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>

              {/* Quick test buttons */}
              <div className="mt-4 w-full pt-3 border-t border-slate-200">
                <span className="text-[11px] font-bold text-slate-600 mb-2 block">
                  Simular Leitura Instantânea de Pacote:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {SAMPLE_PACKAGES_SP.slice(0, 6).map((sample, idx) => (
                    <button
                      key={sample.id}
                      onClick={() => handleDecodedQRString(JSON.stringify(sample))}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-700 border border-slate-200 transition-colors font-medium"
                    >
                      📦 Pacote #{idx + 1} ({sample.neighborhood})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {scanTab === 'batch' && (
            <div className="space-y-4">
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4">
                <h4 className="text-sm font-bold text-indigo-900 mb-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Carregamento de Lote (Simulador TSP)
                </h4>
                <p className="text-xs text-indigo-700 font-medium">
                  Adicione lotes de 5, 10 ou 20 pacotes com endereços reais de São Paulo para ver o algoritmo do Caixeiro
                  Viajante reordenar a rota em milissegundos.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <button
                  onClick={() => {
                    onBatchScanned(SAMPLE_PACKAGES_SP.slice(0, 5));
                    onClose();
                  }}
                  className="p-3.5 rounded-xl bg-slate-50 hover:bg-indigo-600 hover:text-white border border-slate-200 text-center transition-all group shadow-xs"
                >
                  <span className="text-xl font-bold text-indigo-600 group-hover:text-white block">5</span>
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-white">Pacotes</span>
                  <span className="text-[10px] text-slate-500 group-hover:text-white/80 block mt-1 font-medium">Rota Rápida</span>
                </button>

                <button
                  onClick={() => {
                    onBatchScanned(SAMPLE_PACKAGES_SP.slice(0, 10));
                    onClose();
                  }}
                  className="p-3.5 rounded-xl bg-slate-50 hover:bg-indigo-600 hover:text-white border border-slate-200 text-center transition-all group shadow-xs"
                >
                  <span className="text-xl font-bold text-indigo-600 group-hover:text-white block">10</span>
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-white">Pacotes</span>
                  <span className="text-[10px] text-slate-500 group-hover:text-white/80 block mt-1 font-medium">Rota Média</span>
                </button>

                <button
                  onClick={() => {
                    onBatchScanned(SAMPLE_PACKAGES_SP.slice(0, 20));
                    onClose();
                  }}
                  className="p-3.5 rounded-xl bg-indigo-50/80 hover:bg-indigo-600 hover:text-white border border-indigo-200 text-center transition-all group shadow-xs"
                >
                  <span className="text-xl font-bold text-indigo-700 group-hover:text-white block">20</span>
                  <span className="text-xs font-bold text-slate-900 group-hover:text-white">Pacotes</span>
                  <span className="text-[10px] text-indigo-600 group-hover:text-white/80 block mt-1 font-medium">Lote Completo</span>
                </button>
              </div>

              {/* Package preview list */}
              <div className="mt-3">
                <span className="text-xs font-bold text-slate-700 mb-2 block">
                  Disponíveis para Escanear ({availableSamples.length}):
                </span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {SAMPLE_PACKAGES_SP.map((pkg, idx) => {
                    const isAdded = alreadyScannedIds.includes(pkg.id);
                    return (
                      <div
                        key={pkg.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors ${
                          isAdded
                            ? 'bg-slate-50 border-slate-200 text-slate-400'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'
                        }`}
                      >
                        <div className="truncate mr-2">
                          <span className="font-bold text-slate-900">#{idx + 1} {pkg.recipientName}</span>
                          <span className="block text-[10px] text-slate-500 font-medium truncate">{pkg.address} - {pkg.neighborhood}</span>
                        </div>
                        {isAdded ? (
                          <span className="text-[10px] text-emerald-700 font-bold px-2 py-0.5 rounded bg-emerald-50 border border-emerald-100">
                            Escaneado
                          </span>
                        ) : (
                          <button
                            onClick={() => onPackageScanned(pkg)}
                            className="shrink-0 px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold text-[11px] hover:bg-indigo-700"
                          >
                            + Adicionar
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {scanTab === 'manual' && (
            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                  Código de Rastreio ou Endereço do Pacote:
                </label>
                <textarea
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Ex: ROTA-BR83921-SP ou Rua Augusta, 1492, São Paulo"
                  className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 resize-none font-mono shadow-xs"
                />
              </div>

              <button
                disabled={!manualInput.trim()}
                onClick={() => {
                  handleDecodedQRString(manualInput);
                  setManualInput('');
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Confirmar Pacote Manual
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Pacotes Escaneados: <strong className="text-indigo-700">{alreadyScannedIds.length}</strong></span>
          <button onClick={onClose} className="hover:text-slate-900 font-bold">
            Concluir Leitura
          </button>
        </div>
      </div>
    </div>
  );
};
