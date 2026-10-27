import { CheckCircle2, AlertTriangle, AlertCircle, Info, Bell, Clock, Smartphone, MessageSquare, X } from 'lucide-react';

const TYPE_CONFIG = {
  success: {
    icon: CheckCircle2,
    iconColor: 'text-ok-700',
    iconBg: 'bg-ok-100 border-ok-200',
    border: 'hover:border-ok-300',
    dot: 'bg-ok-600',
  },
  sms: {
    icon: Smartphone,
    iconColor: 'text-field-700',
    iconBg: 'bg-field-100 border-field-200',
    border: 'hover:border-field-300',
    dot: 'bg-field-600',
  },
  whatsapp: {
    icon: MessageSquare,
    iconColor: 'text-green-700',
    iconBg: 'bg-green-100 border-green-200',
    border: 'hover:border-green-300',
    dot: 'bg-green-600',
  },
  system: {
    icon: Bell,
    iconColor: 'text-field-700',
    iconBg: 'bg-field-100 border-field-200',
    border: 'hover:border-field-300',
    dot: 'bg-field-600',
  },
  shift_alert: {
    icon: AlertTriangle,
    iconColor: 'text-harvest-700',
    iconBg: 'bg-harvest-100 border-harvest-200',
    border: 'hover:border-harvest-300',
    dot: 'bg-harvest-600',
  },
  info: {
    icon: Info,
    iconColor: 'text-field-700',
    iconBg: 'bg-field-100 border-field-200',
    border: 'hover:border-field-300',
    dot: 'bg-field-600',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-warn-700',
    iconBg: 'bg-warn-100 border-warn-200',
    border: 'hover:border-warn-300',
    dot: 'bg-warn-600',
  },
  danger: {
    icon: AlertCircle,
    iconColor: 'text-danger-700',
    iconBg: 'bg-danger-100 border-danger-200',
    border: 'hover:border-danger-300',
    dot: 'bg-danger-600',
  },
};

export default function NotificationCard(props) {
  // Support either direct props or nested notification object
  const data = props.notification || props;
  const title = data.title || data.titleTa || '';
  const message = data.message || data.messageTa || '';
  const time = data.time || data.created_at || '';
  const type = data.type || data.notification_type || 'info';
  const onDismiss = props.onDismiss;

  // Suppress empty/unwanted bars completely
  if (!title && !message) {
    return null;
  }

  const config = TYPE_CONFIG[type] || TYPE_CONFIG.info;
  const Icon = config.icon;

  return (
    <div className={`relative group flex items-start gap-4 rounded-2xl border border-husk-200 bg-husk-100 p-5 shadow-sm hover-lift ${config.border} transition-all`}>
      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${config.iconBg}`}>
        <Icon className={`w-5 h-5 ${config.iconColor}`} />
      </div>
      <div className="flex-1 min-w-0 pr-6">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="font-display text-base font-bold text-field-900 leading-tight">
            {title}
          </p>
          {time && (
            <span className="flex items-center gap-1 text-xs text-soil-500 font-semibold shrink-0">
              <Clock className="w-3 h-3 text-soil-400" />
              {time}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-soil-600 leading-relaxed">
          {message}
        </p>
      </div>

      {onDismiss && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          title="Dismiss notification"
          className="absolute top-4 right-4 p-1 rounded-lg text-soil-400 hover:text-danger-600 hover:bg-husk-200/60 transition-colors opacity-70 group-hover:opacity-100"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
