import React from 'react';
import { AppNotification } from '../../types';
import {
  Bell,
  CheckCircle2,
  Truck,
  Star,
  DollarSign,
  MapPin,
  X,
  Sparkles,
} from 'lucide-react';

interface NotificationToastsProps {
  toasts: AppNotification[];
  onDismiss: (id: string) => void;
  onSelectNotification: (notification: AppNotification) => void;
}

export const NotificationToasts: React.FC<NotificationToastsProps> = ({
  toasts,
  onDismiss,
  onSelectNotification,
}) => {
  if (toasts.length === 0) return null;

  const getNotificationIcon = (category: string) => {
    switch (category) {
      case 'delivery':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'freight':
        return <Truck className="w-5 h-5 text-indigo-600" />;
      case 'review':
        return <Star className="w-5 h-5 text-amber-500 fill-amber-500" />;
      case 'finance':
        return <DollarSign className="w-5 h-5 text-emerald-600" />;
      case 'route':
        return <MapPin className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-indigo-600" />;
    }
  };

  return (
    <div
      id="notification-toasts-container"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-white/95 backdrop-blur-md border-2 border-indigo-500/20 rounded-2xl p-4 shadow-xl flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-300 hover:border-indigo-400 transition-all"
        >
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 shrink-0">
            {getNotificationIcon(toast.category)}
          </div>

          <div
            className="flex-1 cursor-pointer"
            onClick={() => {
              onSelectNotification(toast);
              onDismiss(toast.id);
            }}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                Notificação Push
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Agora</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 leading-tight mt-0.5">{toast.title}</h4>
            <p className="text-[11px] text-slate-600 font-medium line-clamp-2 mt-1 leading-snug">
              {toast.message}
            </p>
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
