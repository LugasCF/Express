import React, { useState } from 'react';
import { DeliveryPackage, DriverProfile, OptimizedRoute } from '../../types';
import { InteractiveMap } from '../common/InteractiveMap';
import { Zap, Fuel, Clock, Navigation, ExternalLink, ArrowRight, CheckCircle2, Shuffle, Sparkles, MapPin, Play } from 'lucide-react';
import { generateGoogleMapsUrl, formatCurrency } from '../../utils/geo';

interface RouteOptimizerViewProps {
  optimizedRoute: OptimizedRoute;
  driver: DriverProfile;
  onStartRoute: () => void;
  onSelectPackage: (pkg: DeliveryPackage) => void;
  onReshuffleOrOptimize: () => void;
}

export const RouteOptimizerView: React.FC<RouteOptimizerViewProps> = ({
  optimizedRoute,
  driver,
  onStartRoute,
  onSelectPackage,
  onReshuffleOrOptimize,
}) => {
  const [selectedStop, setSelectedStop] = useState<DeliveryPackage | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'sequence'>('map');

  const {
    depotOrigin,
    stops,
    originalDistanceKm,
    optimizedDistanceKm,
    distanceSavedKm,
    percentSaved,
    originalDurationMin,
    optimizedDurationMin,
    estimatedFuelCost,
    totalFreightGross,
    platformFeeAmount,
    netDriverEarnings,
  } = optimizedRoute;

  const googleMapsUrl = generateGoogleMapsUrl(depotOrigin.coordinates, stops);

  return (
    <div id="route-optimizer-view" className="space-y-5 animate-in fade-in duration-300">
      {/* Top AI Route Optimization Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-5 md:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Algoritmo TSP (Otimizador de Rotas Inteligente)
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900">
              Sequência Ideal para {stops.length} Pacotes
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-xl font-medium">
              A ordem de entrega foi reordenada para eliminar cruzamento de rotas e voltas desnecessárias, gerando economia máxima de combustível.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <a
              id="btn-open-google-maps-full"
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              Abrir no Google Maps
            </a>
            <button
              id="btn-start-route-delivery"
              onClick={onStartRoute}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm shadow-indigo-200 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              Iniciar Rota no App
            </button>
          </div>
        </div>

        {/* Real Fuel Savings Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5 text-emerald-600" />
              Economia Estimada
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-lg md:text-xl font-bold text-emerald-700">-{percentSaved}%</span>
              <span className="text-xs text-slate-500 font-medium">({distanceSavedKm} km)</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              Tempo Total
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-lg md:text-xl font-bold text-slate-900">
                {Math.floor(optimizedDurationMin / 60)}h {optimizedDurationMin % 60}m
              </span>
              <span className="text-xs text-slate-400 line-through">
                {Math.floor(originalDurationMin / 60)}h {originalDurationMin % 60}m
              </span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-blue-600" />
              Distância Otimizada
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-lg md:text-xl font-bold text-slate-900">{optimizedDistanceKm} km</span>
              <span className="text-xs text-slate-400 line-through">{originalDistanceKm} km</span>
            </div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3">
            <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              Lucro Líquido Real
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg md:text-xl font-bold text-emerald-700">
                {formatCurrency(netDriverEarnings)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Map View vs. Sequence Turn list */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex bg-white border border-slate-200 rounded-xl p-1 gap-1 shadow-xs">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'map' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Visualização no Mapa
          </button>
          <button
            onClick={() => setActiveTab('sequence')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'sequence' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lista Ordenada de Paradas ({stops.length})
          </button>
        </div>

        <button
          onClick={onReshuffleOrOptimize}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs transition-colors"
        >
          <Shuffle className="w-3.5 h-3.5 text-indigo-600" />
          Recalcular Algoritmo
        </button>
      </div>

      {/* Map View */}
      {activeTab === 'map' && (
        <div className="space-y-4">
          <InteractiveMap
            origin={depotOrigin}
            stops={stops}
            activeStopIndex={0}
            onSelectStop={(pkg) => {
              setSelectedStop(pkg);
              onSelectPackage(pkg);
            }}
          />

          {/* Quick stop ribbon */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1">
            <div className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
              <span>🏠 Origem</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {stops.map((stop, idx) => (
              <React.Fragment key={stop.id}>
                <button
                  onClick={() => setSelectedStop(stop)}
                  className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                    selectedStop?.id === stop.id
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-300 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                    #{stop.sequenceOrder || idx + 1}
                  </span>
                  <span className="truncate max-w-[100px]">{stop.neighborhood}</span>
                </button>
                {idx < stops.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Sequence List View */}
      {activeTab === 'sequence' && (
        <div className="space-y-3">
          {/* Origin Depot Card */}
          <div className="bg-white border border-amber-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 font-bold">
                🏠
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">Ponto de Partida (Depot)</span>
                <h4 className="text-sm font-bold text-slate-900">{depotOrigin.name}</h4>
                <p className="text-xs text-slate-500 font-medium">{depotOrigin.address}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">0.0 km</span>
          </div>

          {/* Stops List */}
          <div className="space-y-2.5">
            {stops.map((stop, index) => (
              <div
                key={stop.id}
                onClick={() => onSelectPackage(stop)}
                className="bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-indigo-300 rounded-xl p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group shadow-xs"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    #{stop.sequenceOrder || index + 1}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {stop.recipientName}
                      </h4>
                      <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200 font-medium">
                        {stop.trackingCode}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      {stop.address}, {stop.neighborhood} - {stop.city}
                    </p>

                    {stop.specialInstructions && (
                      <p className="text-[11px] text-amber-700 mt-1 italic">
                        Nota: {stop.specialInstructions}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-700 block">
                      + R$ {stop.freightFee.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">{stop.weightKg} kg • {stop.volumeCategory}</span>
                  </div>
                  <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold group-hover:bg-indigo-600 group-hover:text-white transition-colors border border-slate-200">
                    Ver Detalhes →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
