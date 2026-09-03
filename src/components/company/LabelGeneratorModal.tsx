import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { DeliveryPackage } from '../../types';
import { QrCode, Printer, Download, X, Package, MapPin, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/geo';

interface LabelGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  packages: DeliveryPackage[];
}

export const LabelGeneratorModal: React.FC<LabelGeneratorModalProps> = ({
  isOpen,
  onClose,
  packages,
}) => {
  const [qrCodeUrls, setQrCodeUrls] = useState<Record<string, string>>({});
  const [selectedPackageId, setSelectedPackageId] = useState<string>(packages[0]?.id || '');
  const printAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || packages.length === 0) return;

    if (!selectedPackageId || !packages.some((p) => p.id === selectedPackageId)) {
      setSelectedPackageId(packages[0].id);
    }

    async function generateCodes() {
      const urls: Record<string, string> = {};
      for (const pkg of packages) {
        try {
          // Payload optimized for QR Code scanner
          const payload = JSON.stringify({
            id: pkg.id,
            trackingCode: pkg.trackingCode,
            recipient: pkg.recipientName,
            recipientPhone: pkg.recipientPhone,
            address: pkg.address,
            neighborhood: pkg.neighborhood,
            city: pkg.city,
            state: pkg.state,
            zipCode: pkg.zipCode,
            lat: pkg.coordinates.lat,
            lng: pkg.coordinates.lng,
            weightKg: pkg.weightKg,
            freightFee: pkg.freightFee,
            company: pkg.companyName,
          });

          const url = await QRCode.toDataURL(payload, {
            errorCorrectionLevel: 'M',
            margin: 2,
            width: 256,
            color: {
              dark: '#0f172a',
              light: '#ffffff',
            },
          });
          urls[pkg.id] = url;
        } catch (err) {
          console.error('QR generation error:', err);
        }
      }
      setQrCodeUrls(urls);
    }

    generateCodes();
  }, [isOpen, packages]);

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  const currentPackage = packages.find((p) => p.id === selectedPackageId) || packages[0];
  const qrImage = currentPackage ? qrCodeUrls[currentPackage.id] : null;

  return (
    <div
      id="label-generator-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Gerador de Etiquetas Inteligentes com QR Code</h3>
              <p className="text-xs text-slate-500 font-medium">Contém dados de GPS geocodificados para leitura sem erro</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5">
          {/* Package Selector Ribbon */}
          <div>
            <label className="text-xs font-bold text-slate-700 mb-2 block">
              Selecione o Pacote para Visualizar a Etiqueta ({packages.length} disponíveis):
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {packages.map((pkg, idx) => (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPackageId(pkg.id)}
                  className={`shrink-0 px-3 py-2 rounded-xl border text-xs font-semibold transition-all flex items-center gap-2 ${
                    selectedPackageId === pkg.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span>#{idx + 1}</span>
                  <span className="truncate max-w-[110px]">{pkg.recipientName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Printable Label Graphic Standard */}
          {currentPackage && (
            <div
              ref={printAreaRef}
              id="printable-delivery-label"
              className="bg-white text-slate-900 rounded-xl p-5 border border-slate-300 shadow-xs space-y-4 max-w-md mx-auto print:max-w-none print:border-black print:shadow-none"
            >
              {/* Label Top Bar */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                    RE
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-600 block">
                      TRANSPORTE EXPRESSO
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">ROTAEXPRESS LOGÍSTICA</h4>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-1 rounded border border-slate-300">
                  {currentPackage.volumeCategory.toUpperCase()} • {currentPackage.weightKg} KG
                </span>
              </div>

              {/* Main QR Code & Recipient Info Grid */}
              <div className="grid grid-cols-12 gap-3 items-center">
                {/* QR Code Canvas image */}
                <div className="col-span-5 flex flex-col items-center justify-center p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  {qrImage ? (
                    <img
                      src={qrImage}
                      alt={`QR Code ${currentPackage.trackingCode}`}
                      className="w-28 h-28 object-contain"
                    />
                  ) : (
                    <div className="w-28 h-28 bg-slate-200 animate-pulse rounded" />
                  )}
                  <span className="text-[9px] font-mono font-bold text-slate-600 mt-1">SCAN VIA APP</span>
                </div>

                {/* Recipient Details */}
                <div className="col-span-7 space-y-1.5 text-xs">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">DESTINATÁRIO</span>
                    <h5 className="font-bold text-slate-900 leading-tight">{currentPackage.recipientName}</h5>
                    <span className="text-[11px] text-slate-600 block font-medium">{currentPackage.recipientPhone}</span>
                  </div>

                  <div className="pt-1">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">ENDEREÇO DE ENTREGA</span>
                    <p className="font-semibold text-slate-800 text-[11px] leading-tight">
                      {currentPackage.address}
                    </p>
                    <p className="text-[11px] text-slate-600 font-medium">
                      {currentPackage.neighborhood} - {currentPackage.city}/{currentPackage.state}
                    </p>
                    <p className="font-mono text-[11px] font-bold text-slate-900 mt-0.5">
                      CEP: {currentPackage.zipCode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Coordinates Stamp & Barcode Footer */}
              <div className="pt-3 border-t-2 border-dashed border-slate-300 flex items-center justify-between text-[10px] text-slate-600">
                <div>
                  <span className="font-semibold block">GPS Embed:</span>
                  <span className="font-mono text-slate-800">
                    {currentPackage.coordinates.lat.toFixed(5)}, {currentPackage.coordinates.lng.toFixed(5)}
                  </span>
                </div>

                <div className="text-right">
                  <span className="font-semibold block">Código de Rastreamento:</span>
                  <span className="font-mono font-bold text-slate-900 text-xs">{currentPackage.trackingCode}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Formato padrão para impressoras térmicas (Zebra / Elgin)
          </span>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all"
            >
              <Printer className="w-4 h-4" />
              Imprimir Etiqueta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
