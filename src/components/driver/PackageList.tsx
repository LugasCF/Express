import React, { useState } from 'react';
import { DeliveryPackage, DriverProfile } from '../../types';
import { QRScannerModal } from './QRScannerModal';
import {
  Package,
  QrCode,
  Sparkles,
  Trash2,
  MapPin,
  Scale,
  DollarSign,
  Plus,
  ArrowRight,
  Truck,
  Layers,
} from 'lucide-react';
import { formatCurrency } from '../../utils/geo';
import { SAMPLE_PACKAGES_SP } from '../../utils/sampleData';

interface PackageListProps {
  packages: DeliveryPackage[];
  driver: DriverProfile;
  onAddPackage: (pkg: DeliveryPackage) => void;
  onAddBatch: (pkgs: DeliveryPackage[]) => void;
  onRemovePackage: (id: string) => void;
  onClearPackages: () => void;
  onOptimizeRoute: () => void;
}

export const PackageList: React.FC<PackageListProps> = ({
  packages,
  driver,
  onAddPackage,
  onAddBatch,
  onRemovePackage,
  onClearPackages,
  onOptimizeRoute,
}) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const totalWeight = packages.reduce((sum, p) => sum + p.weightKg, 0);
  const totalGrossValue = packages.reduce((sum, p) => sum + p.freightFee, 0);
  const platformFee = totalGrossValue * 0.10;
  const estimatedDriverPayout = totalGrossValue - platformFee;

  return (
    <div id="package-list-view" className="space-y-5 animate-in fade-in duration-300">
      {/* Action Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <Package className="w-6 h-6 text-indigo-600" />
              Pacotes Escaneados ({packages.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Escaneie os QR Codes das etiquetas ou carregue um lote para calcular a rota ótima.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              id="btn-open-qr-scanner"
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm shadow-indigo-200 transition-all"
            >
              <QrCode className="w-4 h-4" />
              Escanear com Câmera
            </button>

            {packages.length > 0 && (
              <button
                onClick={onClearPackages}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 text-slate-600 text-xs font-semibold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Quick Batch Presets (if empty) */}
        {packages.length === 0 && (
          <div className="pt-3 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-600 mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Ou teste com um lote demonstrativo pré-configurado:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => onAddBatch(SAMPLE_PACKAGES_SP.slice(0, 5))}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-left transition-all group"
              >
                <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 block">
                  Lote Expresso (5 Pacotes)
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Zona Oeste / Pinheiros</span>
                <span className="text-[11px] font-bold text-emerald-700 mt-2 block">~ R$ 89,00 bruto</span>
              </button>

              <button
                onClick={() => onAddBatch(SAMPLE_PACKAGES_SP.slice(0, 10))}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-left transition-all group"
              >
                <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 block">
                  Lote Médio (10 Pacotes)
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Centro & Região Paulista</span>
                <span className="text-[11px] font-bold text-emerald-700 mt-2 block">~ R$ 185,00 bruto</span>
              </button>

              <button
                onClick={() => onAddBatch(SAMPLE_PACKAGES_SP.slice(0, 20))}
                className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 hover:border-indigo-400 text-left transition-all group shadow-xs"
              >
                <span className="text-xs font-bold text-indigo-900 group-hover:text-indigo-700 block flex items-center justify-between">
                  Lote Completo (20 Pacotes)
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded">TSP Demo</span>
                </span>
                <span className="text-[11px] text-indigo-600/80 block mt-0.5">São Paulo - Todas as Regiões</span>
                <span className="text-[11px] font-bold text-emerald-700 mt-2 block">~ R$ 368,00 bruto</span>
              </button>
            </div>
          </div>
        )}

        {/* Financial and Weight Summary Metrics */}
        {packages.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                Qtd. Pacotes
              </span>
              <span className="text-lg font-bold text-slate-900 block mt-1">{packages.length} un</span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-blue-600" />
                Peso Total
              </span>
              <span className="text-lg font-bold text-slate-900 block mt-1">{totalWeight.toFixed(1)} kg</span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                Valor Bruto
              </span>
              <span className="text-lg font-bold text-slate-900 block mt-1">{formatCurrency(totalGrossValue)}</span>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3">
              <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                Repasse Estimado
              </span>
              <span className="text-lg font-bold text-emerald-700 block mt-1">
                {formatCurrency(estimatedDriverPayout)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Scanned Package List Cards */}
      {packages.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Ordem de Escaneamento ({packages.length} paradas)
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              O algoritmo do Caixeiro Viajante reorganizará esta lista
            </span>
          </div>

          <div className="space-y-2">
            {packages.map((pkg, idx) => (
              <div
                key={pkg.id}
                className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center justify-between gap-3 hover:border-indigo-300 transition-colors shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200">
                    {idx + 1}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{pkg.recipientName}</h4>
                      <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-medium shrink-0 border border-slate-200">
                        {pkg.trackingCode}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5 flex items-center gap-1 font-medium">
                      <MapPin className="w-3 h-3 text-indigo-500 shrink-0" />
                      {pkg.address} - {pkg.neighborhood} ({pkg.city})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-bold text-emerald-700 block">+ {formatCurrency(pkg.freightFee)}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{pkg.weightKg} kg</span>
                  </div>

                  <button
                    onClick={() => onRemovePackage(pkg.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Remover pacote"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Big Route Optimize CTA */}
          <div className="pt-2">
            <button
              id="btn-trigger-tsp-optimization"
              onClick={onOptimizeRoute}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
            >
              <Sparkles className="w-5 h-5" />
              Otimizar Sequência de Rota (Economizar até 30% Combustível)
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : null}

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onPackageScanned={(pkg) => {
          onAddPackage(pkg);
        }}
        onBatchScanned={(batch) => {
          onAddBatch(batch);
        }}
        alreadyScannedIds={packages.map((p) => p.id)}
      />
    </div>
  );
};
