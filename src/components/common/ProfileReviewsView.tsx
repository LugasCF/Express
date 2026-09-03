import React, { useState } from 'react';
import { CompanyProfile, DriverProfile, Review } from '../../types';
import {
  Star,
  ShieldCheck,
  Award,
  ThumbsUp,
  MessageSquare,
  Building2,
  Truck,
  Plus,
  Clock,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  FileCheck,
  Fuel,
  Sparkles,
} from 'lucide-react';
import { MutualReviewModal } from './MutualReviewModal';

interface ProfileReviewsViewProps {
  currentRole: 'driver' | 'company';
  driver: DriverProfile;
  companies: CompanyProfile[];
  reviews: Review[];
  onAddReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
}

export const ProfileReviewsView: React.FC<ProfileReviewsViewProps> = ({
  currentRole,
  driver,
  companies,
  reviews,
  onAddReview,
}) => {
  // Selected profile to inspect: 'driver' or specific company id
  const [selectedProfileType, setSelectedProfileType] = useState<'driver' | 'company'>(
    currentRole === 'driver' ? 'driver' : 'company'
  );
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(companies[0]?.id || 'comp-01');
  const [filterRating, setFilterRating] = useState<'all' | '5' | 'with_comments'>('all');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId) || companies[0];

  // Filter reviews for target
  const driverReviews = reviews.filter((r) => r.targetRole === 'driver' && r.targetId === driver.id);
  const companyReviews = reviews.filter(
    (r) => r.targetRole === 'company' && (r.targetId === selectedCompany?.id || r.targetName === selectedCompany?.name)
  );

  const activeReviews = selectedProfileType === 'driver' ? driverReviews : companyReviews;

  const filteredReviews = activeReviews.filter((r) => {
    if (filterRating === '5') return r.rating >= 4.9;
    if (filterRating === 'with_comments') return !!r.comment;
    return true;
  });

  // Calculate dynamic rating averages
  const totalReviewsCount = activeReviews.length;
  const averageRating =
    totalReviewsCount > 0
      ? (activeReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviewsCount).toFixed(2)
      : selectedProfileType === 'driver'
      ? driver.rating.toFixed(2)
      : selectedCompany.rating.toFixed(2);

  const recommendPercent =
    totalReviewsCount > 0
      ? Math.round((activeReviews.filter((r) => r.wouldRecommend).length / totalReviewsCount) * 100)
      : 99;

  // Star breakdown calculation
  const starCounts = {
    5: activeReviews.filter((r) => r.rating >= 4.5).length,
    4: activeReviews.filter((r) => r.rating >= 3.5 && r.rating < 4.5).length,
    3: activeReviews.filter((r) => r.rating >= 2.5 && r.rating < 3.5).length,
    2: activeReviews.filter((r) => r.rating >= 1.5 && r.rating < 2.5).length,
    1: activeReviews.filter((r) => r.rating < 1.5).length,
  };

  // Pillars averages
  const avgPunctuality =
    totalReviewsCount > 0
      ? (activeReviews.reduce((sum, r) => sum + (r.categoryRatings?.punctuality || 5), 0) / totalReviewsCount).toFixed(1)
      : '5.0';

  const avgCommunication =
    totalReviewsCount > 0
      ? (activeReviews.reduce((sum, r) => sum + (r.categoryRatings?.communication || 5), 0) / totalReviewsCount).toFixed(1)
      : '4.9';

  const avgCare =
    totalReviewsCount > 0
      ? (activeReviews.reduce((sum, r) => sum + (r.categoryRatings?.careAndCondition || 5), 0) / totalReviewsCount).toFixed(1)
      : '5.0';

  const avgSpeed =
    totalReviewsCount > 0
      ? (activeReviews.reduce((sum, r) => sum + (r.categoryRatings?.speedOrEase || 5), 0) / totalReviewsCount).toFixed(1)
      : '4.9';

  return (
    <div id="profile-reviews-view" className="space-y-5 animate-in fade-in duration-300">
      {/* Profile Target Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            id="tab-view-driver-profile"
            onClick={() => setSelectedProfileType('driver')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              selectedProfileType === 'driver'
                ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-slate-50'
            }`}
          >
            <Truck className="w-4 h-4" />
            Perfil & Reputação do Motorista
          </button>

          <button
            id="tab-view-company-profile"
            onClick={() => setSelectedProfileType('company')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              selectedProfileType === 'company'
                ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-slate-50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Perfil & Reputação de Empresas / Hubs
          </button>
        </div>

        {/* Company Dropdown when Company Tab is Active */}
        {selectedProfileType === 'company' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Empresa:</span>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* CTA to Evaluate Partner */}
        <button
          onClick={() => setIsReviewModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          {currentRole === 'company' ? 'Avaliar Motorista' : 'Avaliar Empresa'}
        </button>
      </div>

      {/* Main Profile Hero Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Profile Identity */}
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <img
                src={selectedProfileType === 'driver' ? driver.avatar : selectedCompany.avatar}
                alt="Avatar"
                className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-sm"
              />
              <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold uppercase shadow-xs flex items-center gap-0.5">
                <ShieldCheck className="w-3 h-3" /> Verificado
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">
                  {selectedProfileType === 'driver' ? driver.name : selectedCompany.name}
                </h2>
                {selectedProfileType === 'driver' ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-600" /> Nível {driver.efficiencyTier}
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
                    CNPJ {selectedCompany.cnpj}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 font-medium">
                {selectedProfileType === 'driver'
                  ? `${driver.vehicle.model} (${driver.vehicle.plate}) • ${driver.totalDeliveries} entregas concluídas`
                  : `${selectedCompany.address} • Membro desde ${selectedCompany.activeSince}`}
              </p>

              {/* Verified Credentials Pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedProfileType === 'driver' ? (
                  <>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <FileCheck className="w-3 h-3" /> CNH com EAR Validada
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> CRLV 2026 Regular
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Score {driver.efficiencyScore} pts
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Pagador Pontual via PIX
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> {selectedCompany.totalFreightsDispatched} Fretes Despachados
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Rating Big Badge */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-5 shrink-0 shadow-xs">
            <div className="text-center">
              <span className="text-3xl font-bold text-slate-900 block leading-none">{averageRating}</span>
              <div className="flex items-center justify-center gap-1 mt-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="text-[11px] text-slate-500 font-medium block mt-1">
                {totalReviewsCount} avaliações
              </span>
            </div>

            <div className="h-12 w-px bg-slate-200" />

            <div>
              <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold">
                <ThumbsUp className="w-4 h-4" />
                <span>{recommendPercent}% recomendam</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5 max-w-[140px]">
                Baseado em parcerias reais concluídas no app
              </p>
            </div>
          </div>
        </div>

        {/* Rating Breakdown & Pillar Radar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-slate-100">
          {/* Star Histogram */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Distribuição das Notas
            </h4>

            {[5, 4, 3, 2, 1].map((stars) => {
              const count = starCounts[stars as keyof typeof starCounts] || 0;
              const percent = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : stars === 5 ? 90 : 0;

              return (
                <div key={stars} className="flex items-center gap-3 text-xs">
                  <span className="w-12 font-bold text-slate-700 flex items-center gap-1">
                    {stars} <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  </span>
                  <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-slate-500 font-medium text-[11px]">{percent}%</span>
                </div>
              );
            })}
          </div>

          {/* Performance Pillars */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Métricas de Desempenho na Malha
            </h4>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Pontualidade</span>
                <span className="text-lg font-bold text-slate-900">{avgPunctuality} ★</span>
                <span className="text-[10px] text-emerald-700 font-medium block">Dentro da janela</span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Comunicação</span>
                <span className="text-lg font-bold text-slate-900">{avgCommunication} ★</span>
                <span className="text-[10px] text-emerald-700 font-medium block">Respostas imediatas</span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">
                  {selectedProfileType === 'driver' ? 'Cuidado com Carga' : 'Separação na Doca'}
                </span>
                <span className="text-lg font-bold text-slate-900">{avgCare} ★</span>
                <span className="text-[10px] text-emerald-700 font-medium block">Zero avarias</span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">
                  {selectedProfileType === 'driver' ? 'Aderência ao Roteiro' : 'Pagamento PIX'}
                </span>
                <span className="text-lg font-bold text-slate-900">{avgSpeed} ★</span>
                <span className="text-[10px] text-emerald-700 font-medium block">Rápido & confiável</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              Avaliações e Depoimentos Recebidos ({filteredReviews.length})
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Feedback transparente para qualificação de novos fretes
            </p>
          </div>

          {/* Filter pills */}
          <div className="flex bg-slate-100 border border-slate-200 rounded-xl p-1 gap-1">
            <button
              onClick={() => setFilterRating('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filterRating === 'all'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilterRating('5')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filterRating === '5'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              5 Estrelas ★
            </button>
            <button
              onClick={() => setFilterRating('with_comments')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filterRating === 'with_comments'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Com Comentários
            </button>
          </div>
        </div>

        {/* Reviews Cards List */}
        <div className="space-y-4 pt-1">
          {filteredReviews.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 border border-slate-200 rounded-xl">
              <MessageSquare className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-bold text-slate-700">Nenhuma avaliação encontrada com os filtros atuais</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Seja o primeiro a avaliar este parceiro!</p>
            </div>
          ) : (
            filteredReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-indigo-700 text-sm shrink-0">
                      {rev.authorRole === 'company' ? (
                        <Building2 className="w-5 h-5" />
                      ) : (
                        <Truck className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{rev.authorName}</h4>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {rev.authorRole === 'company' ? 'Empresa Embarcadora' : 'Motorista Parceiro'} •{' '}
                        {new Date(rev.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= Math.round(rev.rating) ? 'fill-current' : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-slate-800">{rev.rating.toFixed(1)}</span>
                  </div>
                </div>

                {/* Freight Title if linked */}
                {rev.freightTitle && (
                  <div className="text-[11px] text-indigo-700 font-semibold bg-indigo-50/70 border border-indigo-100 px-2.5 py-1 rounded-lg inline-block">
                    Frete: {rev.freightTitle}
                  </div>
                )}

                {/* Comment */}
                {rev.comment && (
                  <p className="text-xs text-slate-700 leading-relaxed font-normal bg-white p-3 rounded-lg border border-slate-200/80">
                    "{rev.comment}"
                  </p>
                )}

                {/* Tags and Recommendation */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200">
                  <div className="flex flex-wrap gap-1.5">
                    {rev.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 shadow-xs"
                      >
                        ✓ {tag}
                      </span>
                    ))}
                  </div>

                  {rev.wouldRecommend && (
                    <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      <ThumbsUp className="w-3 h-3" /> Recomendado
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Mutual Review Modal */}
      <MutualReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmitReview={onAddReview}
        authorRole={currentRole}
        authorName={currentRole === 'driver' ? driver.name : selectedCompany.name}
        authorAvatar={currentRole === 'driver' ? driver.avatar : selectedCompany.avatar}
        targetRole={currentRole === 'driver' ? 'company' : 'driver'}
        targetId={currentRole === 'driver' ? selectedCompany.id : driver.id}
        targetName={currentRole === 'driver' ? selectedCompany.name : driver.name}
        freightTitle={currentRole === 'driver' ? 'Lote de Entregas E-commerce SP' : undefined}
      />
    </div>
  );
};
