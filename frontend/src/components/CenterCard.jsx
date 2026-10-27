import { useApp } from '../context/AppContext';

export default function CenterCard({ center, highlight, onViewDetails, onSelect, ctaLabel }) {
  const { state } = useApp();
  const isTamil = state.language === 'Tamil';

  const defaultCta = isTamil ? 'மையத்தைத் தேர்ந்தெடு' : 'Select center';
  const effectiveCta = ctaLabel || defaultCta;

  return (
    <div
      className={`flex h-full flex-col rounded-md border bg-husk-100 p-5 shadow-sm transition ${
        highlight ? 'border-harvest-500 ring-2 ring-harvest-500/40' : 'border-husk-200'
      }`}
    >
      {highlight && (
        <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-harvest-100 px-3 py-1 text-xs font-semibold text-harvest-600">
          {isTamil ? 'AI பரிந்துரைத்தது' : 'AI recommended'}
        </span>
      )}
      <h3 className="font-display text-lg font-semibold text-field-900">{center.name}</h3>
      <p className="mt-1 text-sm text-soil-600/80">
        {isTamil ? 'தூரம்' : 'Distance'}: {center.distanceKm} km
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
        <dt className="text-soil-600/70">{isTamil ? 'தற்போதைய வரிசை' : 'Current queue'}</dt>
        <dd className="text-right font-medium text-field-900">
          {center.queue} {isTamil ? 'விவசாயிகள்' : 'farmers'}
        </dd>
        <dt className="text-soil-600/70">{isTamil ? 'கிடைக்கும் கொள்ளளவு' : 'Available capacity'}</dt>
        <dd className="text-right font-medium text-field-900">{center.availableCapacityPct}%</dd>
        <dt className="text-soil-600/70">{isTamil ? 'மதிப்பிடப்பட்ட காத்திருப்பு' : 'Estimated wait'}</dt>
        <dd className="text-right font-medium text-field-900">
          {center.waitMin} {isTamil ? 'நிமிடம்' : 'min'}
        </dd>
        <dt className="text-soil-600/70">{isTamil ? 'பரிந்துரைக்கப்பட்ட நேரம்' : 'Recommended slot'}</dt>
        <dd className="text-right font-medium text-field-900">
          {center.recommendedDate}, {center.recommendedTime}
        </dd>
      </dl>

      <div className="mt-4 flex items-center justify-between rounded-md bg-field-50 px-3 py-2">
        <span className="text-sm text-field-800">
          {isTamil ? 'AI பொருத்தம்' : 'AI recommendation score'}
        </span>
        <span className="font-data text-base font-semibold text-field-800">{center.aiScore}%</span>
      </div>

      <div className="mt-5 flex gap-2">
        <button
          onClick={() => onViewDetails?.(center)}
          className="flex-1 rounded-md border border-field-700 px-3 py-2.5 text-sm font-semibold text-field-800 transition hover:bg-field-50"
        >
          {isTamil ? 'விவரங்கள்' : 'View details'}
        </button>
        <button
          onClick={() => onSelect?.(center)}
          className="flex-1 rounded-md bg-field-800 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-field-900"
        >
          {effectiveCta}
        </button>
      </div>
    </div>
  );
}
