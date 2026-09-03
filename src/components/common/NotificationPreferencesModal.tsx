import React from 'react';
import { NotificationPreferences } from '../../types';
import {
  Bell,
  Volume2,
  VolumeX,
  Radio,
  Sliders,
  CheckCircle2,
  X,
  Shield,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { requestPushNotificationPermission } from '../../utils/notificationAudio';

interface NotificationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: NotificationPreferences;
  onUpdatePreferences: (updated: Partial<NotificationPreferences>) => void;
}

export const NotificationPreferencesModal: React.FC<NotificationPreferencesModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onUpdatePreferences,
}) => {
  if (!isOpen) return null;

  const handleRequestBrowserPermission = async () => {
    const permission = await requestPushNotificationPermission();
    if (permission === 'granted') {
      onUpdatePreferences({ browserPushEnabled: true });
    } else {
      onUpdatePreferences({ browserPushEnabled: false });
    }
  };

  return (
    <div
      id="notification-preferences-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Preferências de Notificações</h3>
              <p className="text-xs text-slate-500 font-medium">
                Controle de relevância e volume de alertas em tempo real
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

        {/* Form Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5">
          {/* General Device & Sound Channels */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Canais & Alertas Sonoros</h4>

            {/* Sound Toggle */}
            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2.5">
                {preferences.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-indigo-600" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Sons de Alerta (Web Audio)</span>
                  <span className="text-[10px] text-slate-500 font-medium">Toques suaves ao receber eventos</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onUpdatePreferences({ soundEnabled: !preferences.soundEnabled })}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  preferences.soundEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    preferences.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Browser Push Permission Toggle */}
            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2.5">
                <Radio className="w-4 h-4 text-indigo-600" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Notificações Push do Navegador</span>
                  <span className="text-[10px] text-slate-500 font-medium">Alertas mesmo em segundo plano</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRequestBrowserPermission}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  preferences.browserPushEnabled
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {preferences.browserPushEnabled ? '✓ Ativado' : 'Permitir'}
              </button>
            </div>
          </div>

          {/* Relevance & Anti-Spam Controls */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3.5 shadow-xs">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Filtro de Relevância & Raio Geográfico
            </h4>

            {/* Radius Slider */}
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" /> Raio Máximo para Alertas de Frete
                </span>
                <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  {preferences.demandRadiusKm} km
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="40"
                step="1"
                value={preferences.demandRadiusKm}
                onChange={(e) => onUpdatePreferences({ demandRadiusKm: Number(e.target.value) })}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>3 km (Bairro)</span>
                <span>20 km (Regional)</span>
                <span>40 km (Toda Grande SP)</span>
              </div>
            </div>

            {/* Event Category Toggles */}
            <div className="space-y-2">
              {/* New demands */}
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Novas Demandas de Frete</span>
                  <span className="text-[10px] text-slate-500 font-medium">Lotes publicados no seu raio de atuação</span>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdatePreferences({ newDemands: !preferences.newDemands })}
                  className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                    preferences.newDemands ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      preferences.newDemands ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Route Updates */}
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Status da Rota & Despacho</span>
                  <span className="text-[10px] text-slate-500 font-medium">Aceite de frete, início e conclusão de rota</span>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdatePreferences({ routeUpdates: !preferences.routeUpdates })}
                  className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                    preferences.routeUpdates ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      preferences.routeUpdates ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Delivery Confirmations */}
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Comprovantes de Entrega em Tempo Real</span>
                  <span className="text-[10px] text-slate-500 font-medium">Avisos imediatos quando cada parada é entregue</span>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdatePreferences({ deliveryConfirmations: !preferences.deliveryConfirmations })}
                  className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                    preferences.deliveryConfirmations ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      preferences.deliveryConfirmations ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Reviews and Ratings */}
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Novas Avaliações & Elogios</span>
                  <span className="text-[10px] text-slate-500 font-medium">Feedback de motoristas e empresas</span>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdatePreferences({ reviewsAndRatings: !preferences.reviewsAndRatings })}
                  className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                    preferences.reviewsAndRatings ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      preferences.reviewsAndRatings ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Payments and PIX */}
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Repasses Financeiros e PIX</span>
                  <span className="text-[10px] text-slate-500 font-medium">Confirmação de recebimento e liberação de saldo</span>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdatePreferences({ paymentsAndPix: !preferences.paymentsAndPix })}
                  className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                    preferences.paymentsAndPix ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      preferences.paymentsAndPix ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            Salvar Preferências
          </button>
        </div>
      </div>
    </div>
  );
};
