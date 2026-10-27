import { useApp } from '../context/AppContext';
import { getTranslation } from '../data/translations';

const STYLES = {
  success: 'bg-ok-100 text-field-800 border-field-500',
  info: 'bg-blue-50 text-sky-info border-sky-info',
  warning: 'bg-warn-100 text-warn-600 border-warn-600',
  danger: 'bg-danger-100 text-danger-600 border-danger-600',
  neutral: 'bg-husk-100 text-soil-800 border-husk-200',
};

const RISK_TO_TONE = {
  low: 'success',
  normal: 'success',
  open: 'success',
  'slot confirmed': 'success',
  medium: 'warning',
  watch: 'warning',
  high: 'danger',
  'high risk': 'danger',
  overload: 'danger',
  'no active slot': 'neutral',
};

export default function RiskBadge({ label, tone }) {
  const { state } = useApp();
  const t = getTranslation(state?.language);

  const resolvedTone = tone || RISK_TO_TONE[String(label).toLowerCase()] || 'neutral';
  const displayLabel = t.risks?.[label] || label;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${STYLES[resolvedTone]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {displayLabel}
    </span>
  );
}
