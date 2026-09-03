import React from 'react';
import { DriverProfile } from '../../types';
import { Award, Trophy, Zap, ShieldCheck, Star, ChevronRight, Fuel, Clock, CheckCircle } from 'lucide-react';

interface EfficiencyRankViewProps {
  driver: DriverProfile;
}

export const EfficiencyRankView: React.FC<EfficiencyRankViewProps> = ({ driver }) => {
  const leaderboard = [
    { rank: 1, name: driver.name, score: 98, tier: 'Diamante', deliveries: 1420, fuelSaved: '146.5 L', isCurrent: true },
    { rank: 2, name: 'Marcos Vinicius Santos', score: 96, tier: 'Diamante', deliveries: 1280, fuelSaved: '132.0 L', isCurrent: false },
    { rank: 3, name: 'Renata Albuquerque Silva', score: 94, tier: 'Ouro', deliveries: 1110, fuelSaved: '118.4 L', isCurrent: false },
    { rank: 4, name: 'Lucas Gabriel Moreira', score: 91, tier: 'Ouro', deliveries: 890, fuelSaved: '94.2 L', isCurrent: false },
    { rank: 5, name: 'Anderson Coutinho Dias', score: 88, tier: 'Prata', deliveries: 640, fuelSaved: '72.0 L', isCurrent: false },
  ];

  return (
    <div id="efficiency-rank-view" className="space-y-5 animate-in fade-in duration-300">
      {/* Top Driver Score Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={driver.avatar}
                alt={driver.name}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-xs"
              />
              <span className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-bold uppercase shadow-xs">
                TOP 1
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{driver.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-600" /> Nível {driver.efficiencyTier}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 font-medium">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-current" /> {driver.rating} • {driver.totalDeliveries} entregas concluídas
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center sm:text-right">
            <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">Score de Eficiência</span>
            <div className="flex items-baseline justify-center sm:justify-end gap-1 mt-0.5">
              <span className="text-3xl font-bold text-emerald-700">{driver.efficiencyScore}</span>
              <span className="text-xs text-slate-400 font-bold">/100 pts</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-bold block mt-0.5">
              ★ Prioridade Máxima em Fretes VIP
            </span>
          </div>
        </div>

        {/* 4 Efficiency Pillars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <span className="text-[11px] text-slate-500 flex items-center gap-1.5 font-bold">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              Pontualidade
            </span>
            <span className="text-base font-bold text-slate-900 block mt-1">98.4%</span>
            <span className="text-[10px] text-emerald-700 font-bold">Excelente</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <span className="text-[11px] text-slate-500 flex items-center gap-1.5 font-bold">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              Adesão à Rota TSP
            </span>
            <span className="text-base font-bold text-slate-900 block mt-1">99.1%</span>
            <span className="text-[10px] text-emerald-700 font-bold">Zero desvios</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <span className="text-[11px] text-slate-500 flex items-center gap-1.5 font-bold">
              <Fuel className="w-3.5 h-3.5 text-emerald-600" />
              Combustível Poupado
            </span>
            <span className="text-base font-bold text-emerald-700 block mt-1">{driver.fuelSavedLiters} L</span>
            <span className="text-[10px] text-slate-500 font-medium">~ R$ 862 economizados</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <span className="text-[11px] text-slate-500 flex items-center gap-1.5 font-bold">
              <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
              Taxa de Sucesso
            </span>
            <span className="text-base font-bold text-slate-900 block mt-1">100%</span>
            <span className="text-[10px] text-blue-700 font-bold">Sem perdas</span>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-600" />
              Ranking Geral de Entregadores da Região
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Motoristas no topo recebem ofertas de fretes de alto valor 15 minutos antes.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {leaderboard.map((item) => (
            <div
              key={item.rank}
              className={`flex items-center justify-between p-3.5 rounded-xl border text-xs transition-colors ${
                item.isCurrent
                  ? 'bg-amber-50/80 border-amber-200 text-slate-900 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    item.rank === 1
                      ? 'bg-amber-500 text-white'
                      : item.rank === 2
                      ? 'bg-slate-300 text-slate-800'
                      : item.rank === 3
                      ? 'bg-amber-700 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {item.rank}
                </span>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{item.name}</span>
                    {item.isCurrent && (
                      <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.2 rounded">
                        Você
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {item.deliveries} entregas • {item.fuelSaved} economizados
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="font-bold text-emerald-700 block">{item.score} pts</span>
                  <span className="text-[10px] text-slate-500 font-medium">{item.tier}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
