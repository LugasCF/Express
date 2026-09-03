import React, { useState, useRef, useEffect } from 'react';
import { AppNotification, NotificationCategory } from '../../types';
import {
  Bell,
  CheckCircle2,
  Truck,
  Star,
  DollarSign,
  MapPin,
  Sliders,
  Check,
  Trash2,
  Sparkles,
  ChevronRight,
  Send,
  Zap,
} from 'lucide-react';

interface NotificationCenterProps {
  currentRole: 'driver' | 'company';
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onSelectNotification: (notification: AppNotification) => void;
  onOpenPreferences: () => void;
  onSimulateNotification: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  currentRole,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onSelectNotification,
  onOpenPreferences,
  onSimulateNotification,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | NotificationCategory>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter notifications relevant to current role (or both)
  const roleNotifications = notifications.filter(
    (n) => n.recipientRole === currentRole || n.recipientRole === 'both'
  );

  const unreadCount = roleNotifications.filter((n) => !n.read).length;

  const filteredNotifications = roleNotifications.filter((n) => {
    if (selectedFilter === 'unread') return !n.read;
    if (selectedFilter === 'all') return true;
    return n.category === selectedFilter;
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'delivery':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'freight':
        return <Truck className="w-4 h-4 text-indigo-600" />;
      case 'review':
        return <Star className="w-4 h-4 text-amber-500 fill-amber-500" />;
      case 'finance':
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      case 'route':
        return <MapPin className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      {/* Bell Button */}
      <button
        id="btn-notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
        aria-label="Notificações"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white shadow-xs animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          id="notification-dropdown-panel"
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50/70">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">Notificações Push</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold">
                  {unreadCount} não lidas
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={onOpenPreferences}
                title="Configurar Alertas"
                className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllAsRead}
                  title="Marcar todas como lidas"
                  className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors text-[10px] font-bold flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Categories Chips */}
          <div className="px-3 py-2 border-b border-slate-100 flex gap-1 overflow-x-auto bg-white">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors ${
                selectedFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setSelectedFilter('unread')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors ${
                selectedFilter === 'unread'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Não Lidas
            </button>
            <button
              onClick={() => setSelectedFilter('delivery')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors ${
                selectedFilter === 'delivery'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Entregas
            </button>
            <button
              onClick={() => setSelectedFilter('freight')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors ${
                selectedFilter === 'freight'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Fretes
            </button>
            <button
              onClick={() => setSelectedFilter('review')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors ${
                selectedFilter === 'review'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Avaliações
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-bold text-slate-700">Tudo limpo!</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Nenhuma notificação nesta categoria.</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    onMarkAsRead(notif.id);
                    onSelectNotification(notif);
                    setIsOpen(false);
                  }}
                  className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer hover:bg-slate-50 ${
                    !notif.read ? 'bg-indigo-50/40' : 'bg-white'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 shrink-0 mt-0.5">
                    {getCategoryIcon(notif.category)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4
                        className={`text-xs truncate ${
                          !notif.read ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'
                        }`}
                      >
                        {notif.title}
                      </h4>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium line-clamp-2 mt-0.5">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium block mt-1">
                      {new Date(notif.timestamp).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Quick Simulation Trigger */}
          <div className="p-2.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
            <button
              onClick={onSimulateNotification}
              className="text-[11px] font-bold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              Simular Push em Tempo Real
            </button>

            {roleNotifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-[11px] font-bold text-slate-500 hover:text-rose-600 p-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Limpar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
