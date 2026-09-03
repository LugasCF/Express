import React, { useState } from 'react';
import { DeliveryPackage, DriverProfile, FreightDemand, OptimizedRoute } from '../../types';
import { InteractiveMap } from '../common/InteractiveMap';
import { LabelGeneratorModal } from './LabelGeneratorModal';
import { PricingSimulator } from './PricingSimulator';
import {
  Building2,
  Plus,
  QrCode,
  Truck,
  Users,
  CheckCircle2,
  FileCheck,
  MapPin,
  DollarSign,
  Package,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { formatCurrency } from '../../utils/geo';
import { SAMPLE_PACKAGES_SP, DEPOT_ORIGIN } from '../../utils/sampleData';

interface CompanyDashboardProps {
  freights: FreightDemand[];
  drivers: DriverProfile[];
  currentRoute: OptimizedRoute | null;
  onDispatchFreightToDriver: (freightId: string) => void;
  onCreateFreight: (newFreight: FreightDemand) => void;
}

export const CompanyDashboard: React.FC<CompanyDashboardProps> = ({
  freights,
  drivers,
  currentRoute,
  onDispatchFreightToDriver,
  onCreateFreight,
}) => {
  const [activeTab, setActiveTab] = useState<'freights' | 'live_fleet' | 'proofs' | 'pricing' | 'documents'>('freights');
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [selectedPackageForLabels, setSelectedPackageForLabels] = useState<DeliveryPackage[]>(SAMPLE_PACKAGES_SP);
  const [selectedProofPackage, setSelectedProofPackage] = useState<DeliveryPackage | null>(null);

  // New Freight Demand Form Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newOrigin, setNewOrigin] = useState('Av. Paulista, 1000 - Bela Vista, São Paulo - SP');
  const [newPayout, setNewPayout] = useState(195.0);
  const [newVehicle, setNewVehicle] = useState<'moto' | 'car' | 'van' | 'truck'>('moto');

  // Filter packages that have delivery proofs
  const deliveredPackagesWithProof = (currentRoute?.stops || SAMPLE_PACKAGES_SP).filter(
    (p) => p.deliveryStatus === 'delivered' && p.proof
  );

  const handleCreateNewFreightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newFreight: FreightDemand = {
      id: `frt-${Date.now()}`,
      companyName: 'Minha Empresa Logística LTDA',
      title: newTitle || 'Novo Lote de Entregas E-commerce',
      originAddress: newOrigin,
      originCoordinates: { lat: -23.5614, lng: -46.6558 },
      totalPackages: 10,
      totalWeightKg: 22.4,
      totalDistanceEstKm: 28.5,
      totalPayout: Number(newPayout) || 180,
      suggestedVehicle: newVehicle,
      status: 'available',
      createdAt: new Date().toISOString(),
      packages: SAMPLE_PACKAGES_SP.slice(0, 10),
    };

    onCreateFreight(newFreight);
    setIsCreateModalOpen(false);
    setNewTitle('');
  };

  return (
    <div id="company-dashboard-view" className="space-y-5 animate-in fade-in duration-300">
      {/* Top Company Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider">
                Centro de Distribuição & Hub Logístico
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900">Painel da Empresa & Embarcador</h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Cadastre demandas, gere etiquetas QR Code e monitore motoristas em tempo real.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => {
                setSelectedPackageForLabels(currentRoute?.stops || SAMPLE_PACKAGES_SP);
                setIsLabelModalOpen(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-xs"
            >
              <QrCode className="w-4 h-4 text-indigo-600" />
              Imprimir Etiquetas com QR Code
            </button>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Nova Demanda de Frete
            </button>
          </div>
        </div>

        {/* Global Dispatch Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <span className="text-[11px] text-slate-500 font-bold block">Demandas Ativas</span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">{freights.length} lotes</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <span className="text-[11px] text-slate-500 font-bold block">Motoristas Homologados</span>
            <span className="text-xl font-bold text-emerald-700 mt-1 block">{drivers.length} online</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <span className="text-[11px] text-slate-500 font-bold block">Economia de Frota</span>
            <span className="text-xl font-bold text-indigo-700 mt-1 block">34% menos km</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <span className="text-[11px] text-slate-500 font-bold block">Comprovações Digitais</span>
            <span className="text-xl font-bold text-amber-700 mt-1 block">100% auditável</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex bg-slate-100 border border-slate-200 rounded-xl p-1 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('freights')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
            activeTab === 'freights' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Marketplace de Fretes ({freights.length})
        </button>
        <button
          onClick={() => setActiveTab('live_fleet')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
            activeTab === 'live_fleet' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Rastreio de Frota em Tempo Real
        </button>
        <button
          onClick={() => setActiveTab('proofs')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
            activeTab === 'proofs' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Galeria de Comprovantes & Assinaturas
        </button>
        <button
          onClick={() => setActiveTab('pricing')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
            activeTab === 'pricing' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Modelos de Monetização & SaaS
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
            activeTab === 'documents' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Auditoria de Documentos (CNH/CRLV)
        </button>
      </div>

      {/* Freights Tab */}
      {activeTab === 'freights' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Lotes de Cargas e Entregas Cadastradas</h3>
            <span className="text-xs text-slate-500 font-medium">Despache para os motoristas mais eficientes</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {freights.map((frt) => (
              <div
                key={frt.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-xs space-y-4 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                      {frt.companyName}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-0.5 leading-tight">{frt.title}</h4>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                    {formatCurrency(frt.totalPayout)}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5 text-xs text-slate-700">
                  <p className="flex items-center gap-1.5 text-slate-900 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Origem: {frt.originAddress}</span>
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200 font-medium">
                    <span>{frt.totalPackages} Paradas • {frt.totalWeightKg} kg</span>
                    <span>Veículo: <strong className="text-slate-800 capitalize font-bold">{frt.suggestedVehicle}</strong></span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    onClick={() => {
                      setSelectedPackageForLabels(frt.packages);
                      setIsLabelModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-xs"
                  >
                    <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                    Etiquetas ({frt.packages.length})
                  </button>

                  <button
                    onClick={() => onDispatchFreightToDriver(frt.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    Despachar para Motorista
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Fleet Tracking Tab */}
      {activeTab === 'live_fleet' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              Mapa da Frota & Entregas Ativas
            </h3>
            <span className="text-xs text-slate-500 font-medium">Posicionamento GPS em tempo real</span>
          </div>

          <InteractiveMap
            origin={DEPOT_ORIGIN}
            stops={currentRoute?.stops || SAMPLE_PACKAGES_SP}
            currentDriverLocation={{ lat: -23.55052, lng: -46.633308 }}
            className="h-[420px]"
          />

          {/* Active Drivers List */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Motoristas Conectados ({drivers.length})
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {drivers.map((drv) => (
                <div
                  key={drv.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img src={drv.avatar} alt={drv.name} className="w-10 h-10 rounded-xl object-cover border border-slate-200" />
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">{drv.name}</h5>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {drv.vehicle.model} ({drv.vehicle.plate})
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      ● Em Trânsito
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1 font-medium">Score: {drv.efficiencyScore} pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Proofs Gallery Tab */}
      {activeTab === 'proofs' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Auditoria de Entregas & Comprovantes Digitais
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Veja as assinaturas coletadas na tela e fotos de entrega capturadas pelos entregadores.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            {/* Show completed or sample completed deliveries */}
            {SAMPLE_PACKAGES_SP.slice(0, 3).map((pkg, idx) => (
              <div
                key={pkg.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-indigo-700 font-bold">{pkg.trackingCode}</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      Entregue
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mt-1">{pkg.recipientName}</h4>
                  <p className="text-[11px] text-slate-500 font-medium">{pkg.address}, {pkg.neighborhood}</p>
                </div>

                {/* Digital Signature visual preview */}
                <div className="bg-white border border-slate-200 rounded-xl p-2.5 text-center shadow-xs">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block mb-1">
                    Assinatura Digital Coletada
                  </span>
                  <div className="h-14 flex items-center justify-center font-serif italic text-indigo-700 text-lg">
                    ✍️ {pkg.recipientName.split(' ')[0]} Assinado
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-200 pt-2 font-medium">
                  <span>Auditado com GPS</span>
                  <span>Hoje, 14:32</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pricing Simulator Tab */}
      {activeTab === 'pricing' && <PricingSimulator />}

      {/* Document Audits Tab */}
      {activeTab === 'documents' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Verificação de Segurança e Conformidade de Documentos
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Conforme a seção 6 do plano, garantimos que todos os motoristas possuam CNH e documento do veículo (CRLV) validados antes de assumirem cargas.
          </p>

          <div className="space-y-3 pt-2">
            {drivers.map((drv) => (
              <div
                key={drv.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <img src={drv.avatar} alt={drv.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{drv.name}</h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {drv.vehicle.model} • Placa {drv.vehicle.plate} • {drv.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5" /> CNH Validada
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> CRLV 2026 Regular
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Label Generator Modal */}
      <LabelGeneratorModal
        isOpen={isLabelModalOpen}
        onClose={() => setIsLabelModalOpen(false)}
        packages={selectedPackageForLabels}
      />

      {/* Create Freight Demand Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Criar Nova Demanda de Frete</h3>

            <form onSubmit={handleCreateNewFreightSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Título do Lote</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Entregas E-commerce Moda - Centro"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Endereço de Coleta (Origem)</label>
                <input
                  type="text"
                  required
                  value={newOrigin}
                  onChange={(e) => setNewOrigin(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Valor do Frete (R$)</label>
                  <input
                    type="number"
                    step="5"
                    required
                    value={newPayout}
                    onChange={(e) => setNewPayout(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Veículo Sugerido</label>
                  <select
                    value={newVehicle}
                    onChange={(e) => setNewVehicle(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  >
                    <option value="moto">Moto</option>
                    <option value="car">Carro</option>
                    <option value="van">Fiorino / Van</option>
                    <option value="truck">Caminhão VUC</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
                >
                  Publicar Frete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
