import React, { useState, useRef, useEffect } from 'react';
import { DeliveryPackage, ProofOfDelivery } from '../../types';
import { PenTool, Camera, CheckCircle2, RotateCcw, X, Upload, FileText, User, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProofOfDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageItem: DeliveryPackage | null;
  onConfirmDelivery: (packageId: string, proof: ProofOfDelivery) => void;
}

export const ProofOfDeliveryModal: React.FC<ProofOfDeliveryModalProps> = ({
  isOpen,
  onClose,
  packageItem,
  onConfirmDelivery,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [recipientDoc, setRecipientDoc] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const photoCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (packageItem) {
      setRecipientName(packageItem.recipientName || '');
      setRecipientDoc('');
      setDeliveryNotes('');
      setPhotoDataUrl(null);
      setHasSignature(false);
      clearSignature();
    }
  }, [packageItem, isOpen]);

  // Clean camera stream on close
  useEffect(() => {
    if (!isOpen || !isCameraActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    }
  }, [isOpen, isCameraActive]);

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Camera snapshot error:', err);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && photoCanvasRef.current) {
      const video = videoRef.current;
      const canvas = photoCanvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setPhotoDataUrl(dataUrl);
      }
      setIsCameraActive(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoDataUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Canvas Drawing Handlers
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const coords = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#06b6d4'; // Cyan ink
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHasSignature(false);
  };

  const handleConfirm = () => {
    if (!packageItem) return;

    let signatureDataUrl: string | undefined = undefined;
    if (canvasRef.current && hasSignature) {
      signatureDataUrl = canvasRef.current.toDataURL('image/png');
    }

    const proof: ProofOfDelivery = {
      recipientName: recipientName || packageItem.recipientName,
      recipientDocument: recipientDoc || '000.000.000-00',
      signatureDataUrl,
      photoDataUrl: photoDataUrl || undefined,
      deliveredAt: new Date().toISOString(),
      deliveryNotes: deliveryNotes || 'Entrega realizada com sucesso.',
      gpsCoordinates: packageItem.coordinates,
    };

    // Confetti effect!
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#06b6d4', '#3b82f6'],
      });
    } catch {
      // ignore if restricted
    }

    onConfirmDelivery(packageItem.id, proof);
    onClose();
  };

  if (!isOpen || !packageItem) return null;

  return (
    <div
      id="proof-of-delivery-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Comprovante de Entrega</h3>
              <p className="text-xs text-slate-500 font-medium">Assinatura digital & Foto do recebimento</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5">
          {/* Target Package Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-700">
                Parada #{packageItem.sequenceOrder || 1} • {packageItem.trackingCode}
              </span>
              <h4 className="text-xs font-bold text-slate-900 mt-0.5">{packageItem.address}</h4>
              <p className="text-[11px] text-slate-500 font-medium">
                {packageItem.neighborhood}, {packageItem.city}
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              R$ {packageItem.freightFee.toFixed(2)}
            </span>
          </div>

          {/* Recipient Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                Quem recebeu o pacote?
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Nome do recebedor"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 shadow-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                RG ou CPF (Opcional)
              </label>
              <input
                type="text"
                value={recipientDoc}
                onChange={(e) => setRecipientDoc(e.target.value)}
                placeholder="Documento de identificação"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 font-mono shadow-xs"
              />
            </div>
          </div>

          {/* Digital Signature Canvas */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-indigo-600" />
                Assinatura na Tela (Touch / Mouse)
              </label>
              {hasSignature && (
                <button
                  type="button"
                  onClick={clearSignature}
                  className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Limpar
                </button>
              )}
            </div>

            <div className="relative w-full h-32 bg-slate-50 border border-dashed border-slate-300 rounded-xl overflow-hidden touch-none flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={460}
                height={128}
                className="w-full h-full cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              {!hasSignature && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 text-xs">
                  <PenTool className="w-5 h-5 mb-1 opacity-40 text-slate-400" />
                  <span>Assine com o dedo ou mouse aqui</span>
                </div>
              )}
            </div>
          </div>

          {/* Photo Proof Section */}
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-indigo-600" />
              Foto do Pacote Entregue / Comprovante
            </label>

            {isCameraActive ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-indigo-500 flex items-center justify-center">
                <video ref={videoRef} className="w-full h-full object-cover" />
                <canvas ref={photoCanvasRef} className="hidden" />
                <div className="absolute bottom-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
                  >
                    Capturar Foto
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCameraActive(false)}
                    className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : photoDataUrl ? (
              <div className="relative w-full h-32 rounded-xl overflow-hidden border border-emerald-300 bg-slate-50 flex items-center justify-center group shadow-xs">
                <img src={photoDataUrl} alt="Comprovante de entrega" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPhotoDataUrl(null)}
                    className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold"
                  >
                    Remover Foto
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                  ✓ Foto Anexada
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={startCamera}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Camera className="w-4 h-4 text-indigo-600" />
                  Tirar Foto com Câmera
                </button>

                <label className="flex-1 py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs">
                  <Upload className="w-4 h-4 text-indigo-600" />
                  Galeria / Arquivo
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              </div>
            )}
          </div>

          {/* Delivery Note */}
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              Observação da Entrega (Opcional)
            </label>
            <input
              type="text"
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="Ex: Entregue para o porteiro Sr. Carlos"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 shadow-xs"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">
            {hasSignature || photoDataUrl ? '✓ Comprovação preenchida' : 'Assinatura ou foto recomendada'}
          </span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirmar Entrega
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
