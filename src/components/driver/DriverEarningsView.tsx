import React, { useState } from 'react';
import { DriverProfile, OptimizedRoute } from '../../types';
import { DollarSign, Fuel, TrendingUp, Calendar, ArrowDownRight, Shield, Award, Clock, Download, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../../utils/geo';

interface DriverEarningsViewProps {
  driver: DriverProfile;
  currentRoute?: OptimizedRoute | null;
  historyRoutes?: OptimizedRoute[];
}

export const DriverEarningsView: React.FC<DriverEarningsViewProps> = ({
  driver,
  currentRoute,
  historyRoutes = [],
}) => {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');

  // Realistic sample calculations based on driver profile
  const baseGrossToday = (currentRoute?.totalFreightGross || 368.0);
  const baseFuelToday = (currentRoute?.estimatedFuelCost || 12.40);
  const basePlatformFeeToday = (currentRoute?.platformFeeAmount || 36.80);
  const baseNetToday = (currentRoute?.netDriverEarnings || 318.80);

  const multiplier = period === 'today' ? 1 : period === 'week' ? 5.5 : 22;

  const grossTotal = baseGrossToday * multiplier;
  const fuelTotal = baseFuelToday * multiplier;
  const feeTotal = basePlatformFeeToday * multiplier;
  const netTotal = baseNetToday * multiplier;

  const totalKm = (currentRoute?.optimizedDistanceKm || 34.8) * multiplier;
  const totalDeliveriesCount = (currentRoute?.stops.length || 20) * multiplier;

  return (
    <div id="driver-earnings-view" className="space-y-5 animate-in fade-in duration-300">
      {/* Top Header & Period Selector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
              Painel Financeiro & Lucro Real
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-emerald-600" />
              Ganhos Líquidos Transparentes
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Aqui você vê seu lucro limpo descontando taxa da plataforma e gasto real de combustível.
            </p>
          </div>

          {/* Period Toggle */}
          <div className="flex bg-slate-100 border border-slate-200 rounded-xl p-1 gap-1">
            <button
              onClick={() => setPeriod('today')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                period === 'today' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hoje
            </button>
            <button
              onClick={() => setPeriod('week')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                period === 'week' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Esta Semana
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                period === 'month' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Este Mês
            </button>
          </div>
        </div>

        {/* Big Net Profit Card */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
              Lucro Real (Direto no Bolso)
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl sm:text-4xl font-bold text-slate-900">
                {formatCurrency(netTotal)}
              </span>
              <span className="text-xs text-emerald-700 font-bold bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-200">
                +32% com otimização TSP
              </span>
            </div>
            <span className="text-[11px] text-slate-600 mt-1 block font-medium">
              Veículo: {driver.vehicle.model} ({driver.vehicle.avgConsumptionKmPerL} km/L de {driver.vehicle.fuelType})
            </span>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-emerald-200 pt-3 sm:pt-0">
            <span className="text-xs text-slate-600 font-medium">Ganhos por Hora Estimado</span>
            <span className="text-lg font-bold text-indigo-700">
              {formatCurrency(netTotal / (multiplier * 4.5))} / hora
            </span>
          </div>
        </div>

        {/* Financial Breakdown Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Gross */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <span className="text-xs font-semibold text-slate-500 block">Total Bruto dos Fretes</span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">{formatCurrency(grossTotal)}</span>
            <span className="text-[11px] text-slate-500 mt-1 block font-medium">{totalDeliveriesCount} entregas realizadas</span>
          </div>

          {/* Platform Fee */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Taxa RotaExpress (10%)</span>
              <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded font-bold">Intermediação</span>
            </div>
            <span className="text-xl font-bold text-slate-700 mt-1 block">-{formatCurrency(feeTotal)}</span>
            <span className="text-[11px] text-slate-500 mt-1 block font-medium">Suporte, seguro e tecnologia</span>
          </div>

          {/* Fuel cost */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Combustível Gasto</span>
              <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-bold">Economia TSP</span>
            </div>
            <span className="text-xl font-bold text-amber-700 mt-1 block">-{formatCurrency(fuelTotal)}</span>
            <span className="text-[11px] text-slate-500 mt-1 block font-medium">
              {(totalKm / driver.vehicle.avgConsumptionKmPerL).toFixed(1)} Litros ({totalKm.toFixed(1)} km)
            </span>
          </div>
        </div>
      </div>

      {/* Fuel Calculator & Strategy Tip */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Fuel className="w-4 h-4 text-amber-600" />
          Como o Otimizador protege seu lucro?
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-rose-700 block">Sem RotaExpress (Ordem Aleatória):</span>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Rotas comuns com 20 paradas geram em média <strong>48.2 km</strong> de deslocamento com voltas e desvios desnecessários.
            </p>
            <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-200">
              <span className="text-slate-500 font-medium">Gasto Combustível:</span>
              <strong className="text-rose-700 font-bold">R$ 18,70</strong>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
            <span className="text-xs font-bold text-emerald-800 block">Com RotaExpress (TSP Otimizado):</span>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              A sequência é organizada matematicamente reduzindo a distância para <strong>31.6 km</strong> (34% menos rodagem).
            </p>
            <div className="pt-2 flex items-center justify-between text-xs border-t border-emerald-200">
              <span className="text-slate-600 font-medium">Gasto Combustível:</span>
              <strong className="text-emerald-700 font-bold">R$ 12,25 (Economia de R$ 6,45 por lote)</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
