import React, { useState } from 'react';
import { Review, ReviewCategoryRatings } from '../../types';
import {
  Star,
  X,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Building2,
  Truck,
  ShieldCheck,
  Award,
} from 'lucide-react';

interface MutualReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  authorRole: 'company' | 'driver';
  authorName: string;
  authorAvatar?: string;
  targetRole: 'company' | 'driver';
  targetId: string;
  targetName: string;
  freightId?: string;
  freightTitle?: string;
}

const DRIVER_TAG_OPTIONS = [
  'Pontualidade 100%',
  'Cuidado Exemplar com a Carga',
  'Comunicação Rápida & Clara',
  'Assinaturas & Fotos Nítidas',
  'Veículo Limpo e Organizado',
  'Aderência Perfeita ao Roteiro',
  'Cordialidade na Entrega',
  'Super Ágil',
];

const COMPANY_TAG_OPTIONS = [
  'Doca de Carga Rápida',
  'Pagamento Instantâneo via PIX',
  'Pacotes Bipados e Separados',
  'Endereços Precisos e Validados',
  'Fácil Estacionamento para Carga',
  'Equipe Respeitosa e Prestativa',
  'Frete com Preço Justo',
  'Instruções Claras de Entrega',
];

const RATING_LABELS: Record<number, string> = {
  1: 'Insatisfatório (1/5)',
  2: 'Regular (2/5)',
  3: 'Bom (3/5)',
  4: 'Muito Bom (4/5)',
  5: 'Excelente (5/5) ★★★★★',
};

export const MutualReviewModal: React.FC<MutualReviewModalProps> = ({
  isOpen,
  onClose,
  onSubmitReview,
  authorRole,
  authorName,
  authorAvatar,
  targetRole,
  targetId,
  targetName,
  freightId,
  freightTitle,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [punctuality, setPunctuality] = useState<number>(5);
  const [communication, setCommunication] = useState<number>(5);
  const [careAndCondition, setCareAndCondition] = useState<number>(5);
  const [speedOrEase, setSpeedOrEase] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState<string>('');
  const [wouldRecommend, setWouldRecommend] = useState<boolean>(true);

  if (!isOpen) return null;

  const isEvaluatingDriver = targetRole === 'driver';
  const availableTags = isEvaluatingDriver ? DRIVER_TAG_OPTIONS : COMPANY_TAG_OPTIONS;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const categoryRatings: ReviewCategoryRatings = {
      punctuality,
      communication,
      careAndCondition,
      speedOrEase,
    };

    onSubmitReview({
      authorRole,
      authorName,
      authorAvatar,
      targetRole,
      targetId,
      targetName,
      freightId,
      freightTitle,
      rating,
      categoryRatings,
      tags: selectedTags.length > 0 ? selectedTags : ['Parceiro Confiável'],
      comment: comment.trim() || undefined,
      wouldRecommend,
    });

    onClose();
  };

  const activeStarCount = hoverRating ?? rating;

  return (
    <div
      id="mutual-review-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isEvaluatingDriver ? 'Avaliar Motorista Parceiro' : 'Avaliar Empresa / Hub'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Avaliação mútua para construir reputação e confiança na rede
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-5">
          {/* Target Profile Highlight Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-base">
                {isEvaluatingDriver ? <Truck className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-700 block">
                  {isEvaluatingDriver ? 'Motorista Avaliado' : 'Empresa Avaliada'}
                </span>
                <h4 className="text-xs font-bold text-slate-900">{targetName}</h4>
                {freightTitle && (
                  <p className="text-[11px] text-slate-500 font-medium truncate max-w-xs">{freightTitle}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verificado</span>
            </div>
          </div>

          {/* 1-5 Star Selector */}
          <div className="text-center bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Nota Geral da Parceria
            </label>

            <div className="flex items-center justify-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  onClick={() => setRating(star)}
                  className="p-1.5 focus:outline-none transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= activeStarCount
                        ? 'text-amber-500 fill-amber-500 drop-shadow-xs'
                        : 'text-slate-300 fill-slate-100'
                    }`}
                  />
                </button>
              ))}
            </div>

            <span className="text-xs font-bold text-slate-800 block">
              {RATING_LABELS[activeStarCount] || 'Selecione uma nota'}
            </span>
          </div>

          {/* Detailed Pillars Rating */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Critérios Específicos (1 a 5)
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Pontualidade */}
              <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Pontualidade</span>
                  <span className="text-[10px] text-slate-500 font-medium">Cumprimento dos horários</span>
                </div>
                <select
                  value={punctuality}
                  onChange={(e) => setPunctuality(Number(e.target.value))}
                  className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600"
                >
                  <option value={5}>5 ★★★★★</option>
                  <option value={4}>4 ★★★★</option>
                  <option value={3}>3 ★★★</option>
                  <option value={2}>2 ★★</option>
                  <option value={1}>1 ★</option>
                </select>
              </div>

              {/* Comunicação */}
              <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Comunicação</span>
                  <span className="text-[10px] text-slate-500 font-medium">Respostas e alinhamento</span>
                </div>
                <select
                  value={communication}
                  onChange={(e) => setCommunication(Number(e.target.value))}
                  className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600"
                >
                  <option value={5}>5 ★★★★★</option>
                  <option value={4}>4 ★★★★</option>
                  <option value={3}>3 ★★★</option>
                  <option value={2}>2 ★★</option>
                  <option value={1}>1 ★</option>
                </select>
              </div>

              {/* Cuidado com a carga / Agilidade no despacho */}
              <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    {isEvaluatingDriver ? 'Cuidado com a Carga' : 'Separação e Doca'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {isEvaluatingDriver ? 'Preservação do pacote' : 'Agilidade na expedição'}
                  </span>
                </div>
                <select
                  value={careAndCondition}
                  onChange={(e) => setCareAndCondition(Number(e.target.value))}
                  className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600"
                >
                  <option value={5}>5 ★★★★★</option>
                  <option value={4}>4 ★★★★</option>
                  <option value={3}>3 ★★★</option>
                  <option value={2}>2 ★★</option>
                  <option value={1}>1 ★</option>
                </select>
              </div>

              {/* Velocidade / Facilidade */}
              <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    {isEvaluatingDriver ? 'Aderência à Rota' : 'Pagamento e PIX'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {isEvaluatingDriver ? 'Otimização e GPS' : 'Pontualidade do repasse'}
                  </span>
                </div>
                <select
                  value={speedOrEase}
                  onChange={(e) => setSpeedOrEase(Number(e.target.value))}
                  className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600"
                >
                  <option value={5}>5 ★★★★★</option>
                  <option value={4}>4 ★★★★</option>
                  <option value={3}>3 ★★★</option>
                  <option value={2}>2 ★★</option>
                  <option value={1}>1 ★</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Tags Pills */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Destaques Rápidos (Selecione os que se aplicam)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Written Feedback */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Comentário / Relato da Experiência (Opcional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                isEvaluatingDriver
                  ? 'Ex: Motorista muito profissional, concluiu todas as paradas sem atraso e comprovou assinaturas com clareza.'
                  : 'Ex: Doca super rápida para carregar, pacotes com etiquetas QR Code perfeitas e pagamento via PIX liberado rapidamente.'
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 shadow-xs resize-none"
            />
          </div>

          {/* Recommendation Toggle */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Recomendaria este parceiro para novos negócios?
              </span>
              <p className="text-[11px] text-slate-500 font-medium">
                Ajuda outros embarcadores e motoristas a tomarem decisões seguras
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setWouldRecommend(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all border ${
                  wouldRecommend
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-500'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                Sim
              </button>

              <button
                type="button"
                onClick={() => setWouldRecommend(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all border ${
                  !wouldRecommend
                    ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-500'
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                Não
              </button>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">
            Avaliação pública vinculada ao histórico da plataforma
          </span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Publicar Avaliação
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
