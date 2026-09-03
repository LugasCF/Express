import React, { useState } from 'react';
import { DeliveryPackage, DriverProfile, OptimizedRoute, ProofOfDelivery } from '../../types';
import { InteractiveMap } from '../common/InteractiveMap';
import { ProofOfDeliveryModal } from './ProofOfDeliveryModal';
import {
  Navigation,
  Phone,
  MessageCircle,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  RotateCcw,
  Trophy,
  ArrowRight,
} from 'lucide-react';
import { generateWazeUrl, formatCurrency } from '../../utils/geo';

interface ActiveDeliveryNavProps {
  optimizedRoute: OptimizedRoute;
  driver: DriverProfile;
  onUpdateDeliveryProof: (packageId: string, proof: ProofOfDelivery) => void;
  onFinishRoute: () => void;
  onCancelRoute: () => void;
}

export const ActiveDeliveryNav: React.FC<ActiveDeliveryNavProps> = ({
  optimizedRoute,
  driver,
  onUpdateDeliveryProof,
  onFinishRoute,
  onCancelRoute,
}) => {
  const [activeProofModalPackage, setActiveProofModalPackage] = useState<DeliveryPackage | null>(null);

  const stops = optimizedRoute.stops;
  const completedStops = stops.filter((s) => s.deliveryStatus === 'delivered');
  const pendingStops = stops.filter((s) => s.deliveryStatus !== 'delivered');
  
  const currentStop = pendingStops[0] || null;
  const isRouteFinished = stops.length > 0 && pendingStops.length === 0;

  const currentStopIndex = currentStop
    ? stops.findIndex((s) => s.id === currentStop.id)
    : stops.length;

  const progressPercent = stops.length > 0 ? Math.round((completedStops.length / stops.length) * 100) : 0;

  const handleOpenWaze = (pkg: DeliveryPackage) => {
    window.open(generateWazeUrl(pkg.coordinates), '_blank');
  };

  const handleOpenGoogleMapsSingle = (pkg: DeliveryPackage) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${pkg.coordinates.lat},${pkg.coordinates.lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const handleOpenWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const text = encodeURIComponent(
      `Olá ${name}, sou o motorista do RotaExpress. Estou a caminho com a sua encomenda!`
    );
    window.open(`https://wa.me/55${cleanPhone}?text=${text}`, '_blank');
  };

  return (
    <div id="active-delivery-nav-view" className="space-y-4 animate-in fade-in duration-300">
      {/* Route Header Progress Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-xs">
        <div className="flex items-center justify-between gap-4 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Rota em Andamento
            </span>
          </div>

          <span className="text-xs font-bold text-indigo-600">
            {completedStops.length} de {stops.length} Entregas ({progressPercent}%)
          </span>
        </div>

        {/* Progress bar line */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* When All Deliveries are Completed */}
      {isRouteFinished ? (
        <div className="bg-white border-2 border-emerald-500/40 rounded-2xl p-8 text-center shadow-sm space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
            <Trophy className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900">Parabéns! Rota 100% Concluída!</h2>
            <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto font-medium">
              Todos os {stops.length} pacotes foram entregues com comprovação e assinatura digital registradas.
            </p>
          </div>

          {/* Earnings summary */}
          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto bg-slate-50 border border-slate-200 rounded-xl p-4 text-left shadow-xs">
            <div>
              <span className="text-[10px] text-slate-500 block font-bold">Valor Bruto</span>
              <span className="text-sm font-bold text-slate-900">{formatCurrency(optimizedRoute.totalFreightGross)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block font-bold">Combustível</span>
              <span className="text-sm font-bold text-amber-700">-{formatCurrency(optimizedRoute.estimatedFuelCost)}</span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-700 block font-bold">Lucro Real</span>
              <span className="text-sm font-bold text-emerald-700">
                {formatCurrency(optimizedRoute.netDriverEarnings)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onFinishRoute}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Finalizar e Liberar Próximo Frete
            </button>
          </div>
        </div>
      ) : currentStop ? (
        /* Active Target Stop Card */
        <div className="space-y-4">
          <div className="bg-white border-2 border-indigo-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
            {/* Header info */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  #{currentStop.sequenceOrder || currentStopIndex + 1}
                </span>
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                    Próxima Parada
                  </span>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">{currentStop.recipientName}</h3>
                </div>
              </div>

              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                + {formatCurrency(currentStop.freightFee)}
              </span>
            </div>

            {/* Address */}
            <div className="mt-3.5 bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
              <p className="text-xs text-slate-800 font-semibold flex items-start gap-2">
                <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  {currentStop.address}, {currentStop.neighborhood} - {currentStop.city} / {currentStop.state}
                </span>
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pl-6 font-medium">
                <span>CEP: {currentStop.zipCode}</span>
                <span>Rastreio: <strong className="text-slate-700 font-mono">{currentStop.trackingCode}</strong></span>
              </div>
            </div>

            {/* Special delivery instructions */}
            {currentStop.specialInstructions && (
              <div className="mt-2.5 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>{currentStop.specialInstructions}</span>
              </div>
            )}

            {/* Recipient Quick Contact Action */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                onClick={() => handleOpenWhatsApp(currentStop.recipientPhone, currentStop.recipientName)}
                className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp do Cliente
              </button>
              <a
                href={`tel:${currentStop.recipientPhone}`}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-4 h-4" />
                Ligar ({currentStop.recipientPhone})
              </a>
            </div>

            {/* Navigation and Proof Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4 pt-4 border-t border-slate-100">
              <button
                onClick={() => handleOpenGoogleMapsSingle(currentStop)}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Google Maps GPS
              </button>

              <button
                onClick={() => handleOpenWaze(currentStop)}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Navigation className="w-4 h-4 text-indigo-600" />
                Navegar no Waze
              </button>

              <button
                id="btn-collect-proof-signature"
                onClick={() => setActiveProofModalPackage(currentStop)}
                className="py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirmar Entrega
              </button>
            </div>
          </div>

          {/* Interactive Map Tracking */}
          <InteractiveMap
            origin={optimizedRoute.depotOrigin}
            stops={stops}
            activeStopIndex={currentStopIndex}
            className="h-[280px] md:h-[340px]"
          />

          {/* Remaining Upcoming Stops Queue */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Próximas Paradas na Sequência ({pendingStops.length})
            </h4>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {stops.map((stop, idx) => {
                const isDelivered = stop.deliveryStatus === 'delivered';
                const isCurrent = stop.id === currentStop?.id;

                return (
                  <div
                    key={stop.id}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-colors ${
                      isCurrent
                        ? 'bg-indigo-50/70 border-indigo-200 text-slate-900'
                        : isDelivered
                        ? 'bg-emerald-50/50 border-emerald-100 text-slate-500'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                          isDelivered
                            ? 'bg-emerald-600 text-white'
                            : isCurrent
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {isDelivered ? '✓' : `#${stop.sequenceOrder || idx + 1}`}
                      </span>
                      <div>
                        <span className="font-bold text-slate-900 block">{stop.recipientName}</span>
                        <span className="text-[10px] text-slate-500 font-medium">{stop.address}, {stop.neighborhood}</span>
                      </div>
                    </div>

                    <div>
                      {isDelivered ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-200">
                          Entregue
                        </span>
                      ) : (
                        <button
                          onClick={() => setActiveProofModalPackage(stop)}
                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200"
                        >
                          Entregar →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {/* Proof of Delivery Modal Trigger */}
      {activeProofModalPackage && (
        <ProofOfDeliveryModal
          isOpen={!!activeProofModalPackage}
          packageItem={activeProofModalPackage}
          onClose={() => setActiveProofModalPackage(null)}
          onConfirmDelivery={(pkgId, proof) => {
            onUpdateDeliveryProof(pkgId, proof);
            setActiveProofModalPackage(null);
          }}
        />
      )}
    </div>
  );
};
