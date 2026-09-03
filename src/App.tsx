import React, { useState, useEffect, useCallback } from 'react';
import {
  DriverProfile,
  DeliveryPackage,
  OptimizedRoute,
  FreightDemand,
  ProofOfDelivery,
  Review,
  CompanyProfile,
  AppNotification,
  NotificationPreferences,
} from './types';
import {
  DEFAULT_DRIVER,
  DEFAULT_COMPANY,
  SAMPLE_COMPANIES,
  DEPOT_ORIGIN,
  SAMPLE_PACKAGES_SP,
  SAMPLE_FREIGHT_DEMANDS,
  SAMPLE_REVIEWS,
  SAMPLE_NOTIFICATIONS,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from './utils/sampleData';
import { optimizeDeliveryRoute } from './utils/geo';
import { playNotificationSound, triggerBrowserNotification } from './utils/notificationAudio';
import { PackageList } from './components/driver/PackageList';
import { RouteOptimizerView } from './components/driver/RouteOptimizerView';
import { ActiveDeliveryNav } from './components/driver/ActiveDeliveryNav';
import { DriverEarningsView } from './components/driver/DriverEarningsView';
import { EfficiencyRankView } from './components/driver/EfficiencyRankView';
import { VehicleCheckInModal } from './components/driver/VehicleCheckInModal';
import { CompanyDashboard } from './components/company/CompanyDashboard';
import { ProfileReviewsView } from './components/common/ProfileReviewsView';
import { MutualReviewModal } from './components/common/MutualReviewModal';
import { NotificationCenter } from './components/common/NotificationCenter';
import { NotificationToasts } from './components/common/NotificationToasts';
import { NotificationPreferencesModal } from './components/common/NotificationPreferencesModal';

import {
  Navigation,
  QrCode,
  Package,
  Sparkles,
  TrendingUp,
  Award,
  Building2,
  Truck,
  Fuel,
  CheckCircle2,
  DollarSign,
  User,
  ShieldCheck,
  Star,
  MessageSquare,
} from 'lucide-react';

export default function App() {
  // App Role: Driver vs Company
  const [role, setRole] = useState<'driver' | 'company'>('driver');

  // Driver tabs: 'packages' | 'optimize' | 'navigate' | 'earnings' | 'ranking' | 'reviews'
  const [driverTab, setDriverTab] = useState<
    'packages' | 'optimize' | 'navigate' | 'earnings' | 'ranking' | 'reviews'
  >('packages');

  // Company tabs: 'dashboard' | 'reviews'
  const [companyTab, setCompanyTab] = useState<'dashboard' | 'reviews'>('dashboard');

  // Core State
  const [driver, setDriver] = useState<DriverProfile>(DEFAULT_DRIVER);
  const [companies, setCompanies] = useState<CompanyProfile[]>(SAMPLE_COMPANIES);
  const [packages, setPackages] = useState<DeliveryPackage[]>(SAMPLE_PACKAGES_SP.slice(0, 10));
  const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRoute | null>(null);
  const [freights, setFreights] = useState<FreightDemand[]>(SAMPLE_FREIGHT_DEMANDS);
  const [reviews, setReviews] = useState<Review[]>(SAMPLE_REVIEWS);
  const [notifications, setNotifications] = useState<AppNotification[]>(SAMPLE_NOTIFICATIONS);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(
    DEFAULT_NOTIFICATION_PREFERENCES
  );
  const [toasts, setToasts] = useState<AppNotification[]>([]);

  // Modals
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isNotificationPrefsOpen, setIsNotificationPrefsOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewModalConfig, setReviewModalConfig] = useState<{
    targetRole: 'company' | 'driver';
    targetId: string;
    targetName: string;
    freightId?: string;
    freightTitle?: string;
  } | null>(null);

  // Helper to dispatch real-time push notifications
  const pushNotification = useCallback(
    (newNotif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
      const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const fullNotif: AppNotification = {
        ...newNotif,
        id,
        timestamp: new Date().toISOString(),
        read: false,
      };

      setNotifications((prev) => [fullNotif, ...prev]);

      // Sound chime
      if (notificationPreferences.soundEnabled) {
        if (newNotif.category === 'finance') {
          playNotificationSound('cash');
        } else if (newNotif.category === 'delivery') {
          playNotificationSound('success');
        } else if (newNotif.category === 'freight') {
          playNotificationSound('alert');
        } else {
          playNotificationSound('message');
        }
      }

      // Native browser notification if enabled
      if (notificationPreferences.browserPushEnabled) {
        triggerBrowserNotification(newNotif.title, newNotif.message);
      }

      // Add to floating toasts (auto-dismiss in 5s)
      setToasts((prev) => [fullNotif, ...prev.slice(0, 2)]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    },
    [notificationPreferences]
  );

  // Automatically calculate TSP route whenever packages change or on startup
  useEffect(() => {
    if (packages.length > 0) {
      const route = optimizeDeliveryRoute(DEPOT_ORIGIN, packages, driver.vehicle);
      setOptimizedRoute(route);
    } else {
      setOptimizedRoute(null);
    }
  }, [packages, driver.vehicle]);

  // Handler for adding a new scanned package
  const handleAddPackage = (newPkg: DeliveryPackage) => {
    if (packages.some((p) => p.id === newPkg.id)) {
      return;
    }
    const updated = [...packages, newPkg];
    setPackages(updated);
  };

  // Handler for batch scan (e.g. 5, 10, 20 packages)
  const handleAddBatch = (batch: DeliveryPackage[]) => {
    const existingIds = new Set(packages.map((p) => p.id));
    const newItems = batch.filter((p) => !existingIds.has(p.id));
    setPackages([...packages, ...newItems]);
  };

  // Handler for removing a package
  const handleRemovePackage = (pkgId: string) => {
    setPackages(packages.filter((p) => p.id !== pkgId));
  };

  // Clear all packages
  const handleClearPackages = () => {
    setPackages([]);
  };

  // Trigger TSP Route Optimization
  const handleOptimizeRoute = () => {
    if (packages.length === 0) return;
    const route = optimizeDeliveryRoute(DEPOT_ORIGIN, packages, driver.vehicle);
    setOptimizedRoute(route);
    setDriverTab('optimize');
  };

  // Start delivery execution
  const handleStartRoute = () => {
    setDriverTab('navigate');

    // Notify company that driver started the route
    if (notificationPreferences.routeUpdates) {
      pushNotification({
        recipientRole: 'company',
        category: 'route',
        type: 'route_started',
        title: 'Motorista Iniciou a Rota',
        message: `${driver.name} iniciou o trajeto com ${packages.length} entregas otimizadas pelo TSP.`,
        metadata: {
          driverName: driver.name,
        },
      });
    }
  };

  // Record Proof of Delivery
  const handleConfirmProof = (pkgId: string, proof: ProofOfDelivery) => {
    const targetPkg = packages.find((p) => p.id === pkgId);
    const updated = packages.map((p) => {
      if (p.id === pkgId) {
        return {
          ...p,
          deliveryStatus: 'delivered' as const,
          proof,
        };
      }
      return p;
    });

    setPackages(updated);

    // Update driver stats
    setDriver((prev) => ({
      ...prev,
      totalDeliveries: prev.totalDeliveries + 1,
      efficiencyScore: Math.min(100, prev.efficiencyScore + 1),
    }));

    // Real-time Push Notification to Company
    if (notificationPreferences.deliveryConfirmations) {
      pushNotification({
        recipientRole: 'company',
        category: 'delivery',
        type: 'delivery_completed',
        title: `Entrega #${targetPkg?.sequenceOrder || ''} Concluída`,
        message: `${driver.name} entregou com sucesso o pacote ${targetPkg?.trackingCode || ''} para ${
          targetPkg?.recipientName || 'o cliente'
        }!`,
        metadata: {
          packageId: pkgId,
          trackingCode: targetPkg?.trackingCode,
          driverName: driver.name,
        },
      });
    }
  };

  // Finish completed route
  const handleFinishRoute = () => {
    // Notify about route completion
    pushNotification({
      recipientRole: 'both',
      category: 'route',
      type: 'route_finished',
      title: 'Rota 100% Finalizada com Sucesso! 🎉',
      message: `Todas as entregas foram concluídas com comprovantes digitais. Pagamento de frete liberado.`,
    });

    // Prompt mutual review between driver and company
    setReviewModalConfig({
      targetRole: 'company',
      targetId: DEFAULT_COMPANY.id,
      targetName: DEFAULT_COMPANY.name,
      freightTitle: 'Lote de Entregas E-commerce SP',
    });
    setIsReviewModalOpen(true);

    // Prepare next batch
    setPackages(SAMPLE_PACKAGES_SP.slice(10, 20));
    setDriverTab('packages');
  };

  // Company dispatch freight
  const handleDispatchFreightToDriver = (freightId: string) => {
    const targetFreight = freights.find((f) => f.id === freightId);
    if (targetFreight) {
      setPackages(targetFreight.packages);
      setFreights(
        freights.map((f) => (f.id === freightId ? { ...f, status: 'in_progress' } : f))
      );
      setRole('driver');
      setDriverTab('packages');

      // Push notification to Driver
      if (notificationPreferences.newDemands) {
        pushNotification({
          recipientRole: 'driver',
          category: 'freight',
          type: 'freight_accepted',
          title: 'Frete Atribuído com Sucesso',
          message: `Você aceitou o lote "${targetFreight.title}" (${targetFreight.totalPackages} paradas, R$ ${targetFreight.totalPayout.toFixed(2)}).`,
          metadata: {
            freightId: targetFreight.id,
            payout: targetFreight.totalPayout,
          },
        });
      }
    }
  };

  const handleCreateFreight = (newFreight: FreightDemand) => {
    setFreights([newFreight, ...freights]);

    // Push notification to Drivers in the area
    if (notificationPreferences.newDemands) {
      pushNotification({
        recipientRole: 'driver',
        category: 'freight',
        type: 'new_demand',
        title: 'Nova Demanda de Frete Publicada!',
        message: `${newFreight.companyName} publicou ${newFreight.totalPackages} entregas (R$ ${newFreight.totalPayout.toFixed(
          2
        )}) a 2.1 km de você.`,
        metadata: {
          freightId: newFreight.id,
          companyName: newFreight.companyName,
          payout: newFreight.totalPayout,
        },
      });
    }
  };

  // Add a new Mutual Review
  const handleAddReview = (newReviewData: Omit<Review, 'id' | 'createdAt'>) => {
    const newReview: Review = {
      ...newReviewData,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setReviews([newReview, ...reviews]);

    // Push notification to the recipient
    if (notificationPreferences.reviewsAndRatings) {
      pushNotification({
        recipientRole: newReview.targetRole,
        category: 'review',
        type: 'review_received',
        title: `Nova Avaliação ${newReview.rating.toFixed(1)} Estrelas! ⭐`,
        message: `${newReview.authorName} avaliou você: "${newReview.tags.slice(0, 2).join(', ')}"`,
        metadata: {
          rating: newReview.rating,
        },
      });
    }

    // Update target rating score in state
    if (newReview.targetRole === 'driver') {
      setDriver((prev) => ({
        ...prev,
        rating: parseFloat(((prev.rating * 10 + newReview.rating) / 11).toFixed(2)),
      }));
    } else {
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === newReview.targetId || c.name === newReview.targetName
            ? {
                ...c,
                rating: parseFloat(((c.rating * 10 + newReview.rating) / 11).toFixed(2)),
                totalReviews: c.totalReviews + 1,
              }
            : c
        )
      );
    }
  };

  // Quick simulation trigger for testing notifications
  const handleSimulateNotification = () => {
    const simulatedEvents: Array<Omit<AppNotification, 'id' | 'timestamp' | 'read'>> = [
      {
        recipientRole: 'company',
        category: 'delivery',
        type: 'delivery_completed',
        title: 'Entrega Realizada em Pinheiros',
        message: 'Carlos Silva coletou a assinatura digital e foto do pacote ROTA-BR83921-SP.',
      },
      {
        recipientRole: 'driver',
        category: 'freight',
        type: 'new_demand',
        title: 'Novo Frete Expresso Disponível',
        message: 'Mercado Express publicou 12 paradas (R$ 210,00) a 1.8 km da sua posição.',
      },
      {
        recipientRole: 'both',
        category: 'review',
        type: 'review_received',
        title: 'Nova Avaliação 5.0 Estrelas ⭐',
        message: 'Você recebeu um elogio: "Pontualidade 100% e cuidado exemplar com a carga".',
      },
      {
        recipientRole: 'driver',
        category: 'finance',
        type: 'payment_confirmed',
        title: 'PIX Recebido: R$ 368,00',
        message: 'O valor do lote finalizado acabou de ser creditado na sua conta.',
      },
    ];

    const randomEvent = simulatedEvents[Math.floor(Math.random() * simulatedEvents.length)];
    pushNotification(randomEvent);
  };

  // Handle clicking on a notification
  const handleSelectNotification = (notif: AppNotification) => {
    if (notif.category === 'review') {
      if (role === 'driver') {
        setDriverTab('reviews');
      } else {
        setCompanyTab('reviews');
      }
    } else if (notif.category === 'freight') {
      if (role === 'driver') {
        setDriverTab('packages');
      }
    } else if (notif.category === 'delivery' || notif.category === 'route') {
      if (role === 'driver') {
        setDriverTab('navigate');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-800 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 text-white shrink-0">
              <Navigation className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-slate-900">
                  Rota<span className="text-indigo-600">Express</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
                  TSP Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
                Otimização de Rotas, Reputação & Gestão de Entregas
              </p>
            </div>
          </div>

          {/* Role Switcher Pill */}
          <div className="flex bg-slate-100 border border-slate-200 rounded-xl p-1 gap-1">
            <button
              id="role-driver-btn"
              onClick={() => setRole('driver')}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                role === 'driver'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Perfil</span> Motorista
            </button>

            <button
              id="role-company-btn"
              onClick={() => setRole('company')}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                role === 'company'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Perfil</span> Empresa / Hub
            </button>
          </div>

          {/* Right Header: Notification Bell, Profile & Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Real-time Push Notification Center */}
            <NotificationCenter
              currentRole={role}
              notifications={notifications}
              onMarkAsRead={(id) =>
                setNotifications((prev) =>
                  prev.map((n) => (n.id === id ? { ...n, read: true } : n))
                )
              }
              onMarkAllAsRead={() =>
                setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
              }
              onClearAll={() =>
                setNotifications((prev) => prev.filter((n) => n.recipientRole !== role && n.recipientRole !== 'both'))
              }
              onSelectNotification={handleSelectNotification}
              onOpenPreferences={() => setIsNotificationPrefsOpen(true)}
              onSimulateNotification={handleSimulateNotification}
            />

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold uppercase tracking-wider">Online • GPS Ativo</span>
            </div>

            {role === 'driver' && (
              <button
                id="btn-vehicle-checkin-header"
                onClick={() => setIsCheckInModalOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors shadow-xs"
              >
                <Fuel className="w-3.5 h-3.5 text-indigo-600" />
                <span>{driver.vehicle.model}</span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/70 px-1.5 py-0.5 rounded">
                  {driver.vehicle.avgConsumptionKmPerL} km/L
                </span>
              </button>
            )}

            <div className="flex items-center gap-2.5 pl-1 sm:pl-2 sm:border-l sm:border-slate-200">
              <div className="hidden lg:block text-right">
                <p className="text-[11px] text-slate-500 font-medium">
                  {role === 'driver' ? 'Motorista Parceiro' : 'Empresa / Hub'}
                </p>
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {role === 'driver' ? driver.name : DEFAULT_COMPANY.name}
                </p>
              </div>
              <div className="w-9 h-9 bg-slate-200 rounded-full border-2 border-white shadow-sm overflow-hidden shrink-0">
                <img
                  src={role === 'driver' ? driver.avatar : DEFAULT_COMPANY.avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Driver Sub-Navigation Ribbon (When in Driver Mode) */}
      {role === 'driver' && (
        <nav className="bg-white border-b border-slate-200 sticky top-16 z-30 overflow-x-auto scrollbar-none shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2 py-2">
            <div className="flex items-center gap-1.5">
              <button
                id="tab-packages-btn"
                onClick={() => setDriverTab('packages')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  driverTab === 'packages'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Package className="w-4 h-4" />
                Pacotes ({packages.length})
              </button>

              <button
                id="tab-optimize-btn"
                onClick={() => setDriverTab('optimize')}
                disabled={packages.length === 0}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap disabled:opacity-40 ${
                  driverTab === 'optimize'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Otimizar Rota (TSP)
              </button>

              <button
                id="tab-navigate-btn"
                onClick={() => setDriverTab('navigate')}
                disabled={packages.length === 0}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap disabled:opacity-40 ${
                  driverTab === 'navigate'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Navigation className="w-4 h-4" />
                Navegação Ativa
              </button>

              <button
                id="tab-earnings-btn"
                onClick={() => setDriverTab('earnings')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  driverTab === 'earnings'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                Lucro Real
              </button>

              <button
                id="tab-ranking-btn"
                onClick={() => setDriverTab('ranking')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  driverTab === 'ranking'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Award className="w-4 h-4" />
                Ranking Eficiência
              </button>

              <button
                id="tab-driver-reviews-btn"
                onClick={() => setDriverTab('reviews')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  driverTab === 'reviews'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                Avaliações & Reputação ({reviews.filter((r) => r.targetRole === 'driver').length})
              </button>
            </div>

            {/* Check-in CTA on mobile */}
            <button
              onClick={() => setIsCheckInModalOpen(true)}
              className="md:hidden p-2 rounded-xl bg-slate-100 text-indigo-600 border border-slate-200"
              title="Check-in do Veículo"
            >
              <Fuel className="w-4 h-4" />
            </button>
          </div>
        </nav>
      )}

      {/* Company Sub-Navigation Ribbon (When in Company Mode) */}
      {role === 'company' && (
        <nav className="bg-white border-b border-slate-200 sticky top-16 z-30 overflow-x-auto scrollbar-none shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2 py-2">
            <div className="flex items-center gap-1.5">
              <button
                id="tab-company-dashboard-btn"
                onClick={() => setCompanyTab('dashboard')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  companyTab === 'dashboard'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Gestão & Despacho de Fretes
              </button>

              <button
                id="tab-company-reviews-btn"
                onClick={() => setCompanyTab('reviews')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  companyTab === 'reviews'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                Avaliações Mútuas & Perfis ({reviews.length})
              </button>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {role === 'driver' ? (
          <>
            {driverTab === 'packages' && (
              <PackageList
                packages={packages}
                driver={driver}
                onAddPackage={handleAddPackage}
                onAddBatch={handleAddBatch}
                onRemovePackage={handleRemovePackage}
                onClearPackages={handleClearPackages}
                onOptimizeRoute={handleOptimizeRoute}
              />
            )}

            {driverTab === 'optimize' && optimizedRoute && (
              <RouteOptimizerView
                optimizedRoute={optimizedRoute}
                driver={driver}
                onStartRoute={handleStartRoute}
                onSelectPackage={() => {}}
                onReshuffleOrOptimize={() => {
                  const refreshed = optimizeDeliveryRoute(DEPOT_ORIGIN, packages, driver.vehicle);
                  setOptimizedRoute(refreshed);
                }}
              />
            )}

            {driverTab === 'navigate' && optimizedRoute && (
              <ActiveDeliveryNav
                optimizedRoute={optimizedRoute}
                driver={driver}
                onUpdateDeliveryProof={handleConfirmProof}
                onFinishRoute={handleFinishRoute}
                onCancelRoute={() => setDriverTab('packages')}
              />
            )}

            {driverTab === 'earnings' && (
              <DriverEarningsView driver={driver} currentRoute={optimizedRoute} />
            )}

            {driverTab === 'ranking' && <EfficiencyRankView driver={driver} />}

            {driverTab === 'reviews' && (
              <ProfileReviewsView
                currentRole="driver"
                driver={driver}
                companies={companies}
                reviews={reviews}
                onAddReview={handleAddReview}
              />
            )}
          </>
        ) : (
          /* Company / Shipper Hub Mode */
          <>
            {companyTab === 'dashboard' && (
              <CompanyDashboard
                freights={freights}
                drivers={[driver]}
                currentRoute={optimizedRoute}
                onDispatchFreightToDriver={handleDispatchFreightToDriver}
                onCreateFreight={handleCreateFreight}
              />
            )}

            {companyTab === 'reviews' && (
              <ProfileReviewsView
                currentRole="company"
                driver={driver}
                companies={companies}
                reviews={reviews}
                onAddReview={handleAddReview}
              />
            )}
          </>
        )}
      </main>

      {/* Floating Real-time Push Notification Toasts */}
      <NotificationToasts
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
        onSelectNotification={handleSelectNotification}
      />

      {/* Footer info bar */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            RotaExpress Logística Inteligente • Roteirização TSP, Notificações Push & Avaliações Mútuas
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Rede 100% Auditada & Verificada
            </span>
          </div>
        </div>
      </footer>

      {/* Vehicle Check-in Modal */}
      <VehicleCheckInModal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        driver={driver}
        onUpdateDriver={(updated) => setDriver((prev) => ({ ...prev, ...updated }))}
      />

      {/* Notification Preferences Modal */}
      <NotificationPreferencesModal
        isOpen={isNotificationPrefsOpen}
        onClose={() => setIsNotificationPrefsOpen(false)}
        preferences={notificationPreferences}
        onUpdatePreferences={(updated) =>
          setNotificationPreferences((prev) => ({ ...prev, ...updated }))
        }
      />

      {/* Dynamic Mutual Review Modal */}
      {reviewModalConfig && (
        <MutualReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setReviewModalConfig(null);
          }}
          onSubmitReview={handleAddReview}
          authorRole={role}
          authorName={role === 'driver' ? driver.name : DEFAULT_COMPANY.name}
          authorAvatar={role === 'driver' ? driver.avatar : DEFAULT_COMPANY.avatar}
          targetRole={reviewModalConfig.targetRole}
          targetId={reviewModalConfig.targetId}
          targetName={reviewModalConfig.targetName}
          freightId={reviewModalConfig.freightId}
          freightTitle={reviewModalConfig.freightTitle}
        />
      )}
    </div>
  );
}
