import React, { useState } from 'react';
import { DollarSign, Layers, Building2, Truck, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/geo';

export const PricingSimulator: React.FC = () => {
  const [activeModel, setActiveModel] = useState<'marketplace' | 'saas'>('marketplace');
  
  // Marketplace params
  const [freightVolumeMonthly, setFreightVolumeMonthly] = useState(500); // 500 entregas/mês
  const [avgTicketPrice, setAvgTicketPrice] = useState(25.0); // R$ 25 por entrega
  const [commissionRate, setCommissionRate] = useState(10); // 10%

  // SaaS params
  const [fleetVehicleCount, setFleetVehicleCount] = useState(8); // 8 veículos
  const [saasPricePerVehicle, setSaasPricePerVehicle] = useState(49.0); // R$ 49 / veículo / mês

  // Marketplace calculations
  const totalMarketplaceGrossVolume = freightVolumeMonthly * avgTicketPrice;
  const platformRevenueMarketplace = totalMarketplaceGrossVolume * (commissionRate / 100);
  const driverPayoutTotal = totalMarketplaceGrossVolume - platformRevenueMarketplace;

  // SaaS calculations
  const totalSaasMonthlyRevenue = fleetVehicleCount * saasPricePerVehicle;
  const estimatedFuelSavedPerVehicleMonthly = 280.0; // R$ 280 economizados por veículo com TSP
  const totalFleetFuelSaved = fleetVehicleCount * estimatedFuelSavedPerVehicleMonthly;
  const netSaaSClientSavings = totalFleetFuelSaved - totalSaasMonthlyRevenue;

  return (
    <div id="pricing-simulator-card" className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider">
            Modelo de Negócio & Monetização
          </span>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Simulador de Comissões e Planos SaaS
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Compare o modelo de taxa por intermediação vs. assinatura fixa para frotas próprias.
          </p>
        </div>

        {/* Model switcher */}
        <div className="flex bg-slate-100 border border-slate-200 rounded-xl p-1 gap-1">
          <button
            onClick={() => setActiveModel('marketplace')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeModel === 'marketplace'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Marketplace (Comissão {commissionRate}%)
          </button>
          <button
            onClick={() => setActiveModel('saas')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeModel === 'saas'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            SaaS Frota Própria (R$ 49/mês)
          </button>
        </div>
      </div>

      {/* Marketplace Tab */}
      {activeModel === 'marketplace' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <label className="text-xs font-bold text-slate-600 block mb-1">Entregas Mensais</label>
              <input
                type="number"
                value={freightVolumeMonthly}
                onChange={(e) => setFreightVolumeMonthly(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-600 font-mono shadow-xs"
              />
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <label className="text-xs font-bold text-slate-600 block mb-1">Ticket Médio por Frete (R$)</label>
              <input
                type="number"
                value={avgTicketPrice}
                onChange={(e) => setAvgTicketPrice(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-600 font-mono shadow-xs"
              />
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <label className="text-xs font-bold text-slate-600 block mb-1">Taxa de Intermediação (%)</label>
              <select
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-600 font-mono shadow-xs"
              >
                <option value={5}>5% (Competitivo)</option>
                <option value={8}>8% (Padrão Pequenas Cargas)</option>
                <option value={10}>10% (Recomendado Mercado)</option>
                <option value={15}>15% (Fretes Expressos / Urgentes)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <span className="text-xs text-slate-500 font-bold block">Volume Bruto Movimentado</span>
              <span className="text-xl font-bold text-slate-900 mt-1 block">
                {formatCurrency(totalMarketplaceGrossVolume)}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 block font-medium">Total pago pelas empresas</span>
            </div>

            <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4">
              <span className="text-xs text-indigo-800 font-bold block">Receita da Plataforma ({commissionRate}%)</span>
              <span className="text-xl font-bold text-indigo-700 mt-1 block">
                {formatCurrency(platformRevenueMarketplace)}
              </span>
              <span className="text-[11px] text-indigo-600/90 mt-0.5 block font-medium">Margem líquida do app</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <span className="text-xs text-slate-500 font-bold block">Repasse aos Motoristas</span>
              <span className="text-xl font-bold text-emerald-700 mt-1 block">
                {formatCurrency(driverPayoutTotal)}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 block font-medium">100% repassado via PIX semanal</span>
            </div>
          </div>
        </div>
      )}

      {/* SaaS Tab */}
      {activeModel === 'saas' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <label className="text-xs font-bold text-slate-600 block mb-1">Quantidade de Veículos na Frota</label>
              <input
                type="number"
                value={fleetVehicleCount}
                onChange={(e) => setFleetVehicleCount(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-600 font-mono shadow-xs"
              />
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <label className="text-xs font-bold text-slate-600 block mb-1">Mensalidade por Veículo (R$)</label>
              <input
                type="number"
                value={saasPricePerVehicle}
                onChange={(e) => setSaasPricePerVehicle(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-600 font-mono shadow-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <span className="text-xs text-slate-500 font-bold block">Mensalidade SaaS da Empresa</span>
              <span className="text-xl font-bold text-slate-900 mt-1 block">
                {formatCurrency(totalSaasMonthlyRevenue)} / mês
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 block font-medium">{fleetVehicleCount} licenças de motorista</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <span className="text-xs text-amber-700 font-bold block">Economia em Combustível da Frota</span>
              <span className="text-xl font-bold text-amber-700 mt-1 block">
                ~ {formatCurrency(totalFleetFuelSaved)} / mês
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 block font-medium">Com redução de 30% nas rotas</span>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4">
              <span className="text-xs text-emerald-800 font-bold block">ROI Líquido para o Cliente</span>
              <span className="text-xl font-bold text-emerald-700 mt-1 block">
                + {formatCurrency(netSaaSClientSavings)} / mês
              </span>
              <span className="text-[11px] text-emerald-700/90 mt-0.5 block font-medium">O software se paga em 4 dias!</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
