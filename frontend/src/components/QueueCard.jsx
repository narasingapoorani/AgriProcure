import { useApp } from '../context/AppContext';

const STAGE_TAMIL = {
  'Entry Gate': 'நுழைவு வாயில்',
  Weighment: 'எடை போடுதல்',
  'Quality Inspection': 'தரப் பரிசோதனை',
  'Billing & Payment': 'பில் & பணம் வழங்கல்',
};

export default function QueueCard({ token, position, ahead, waitMin, stage }) {
  const { state } = useApp();
  const isTamil = state.language === 'Tamil';

  const localizedStage = isTamil ? (STAGE_TAMIL[stage] || stage) : stage;

  return (
    <div className="rounded-md border border-husk-200 bg-husk-100 p-6 shadow-sm">
      <div className="flex items-center gap-2 text-field-700">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-field-700 text-xs text-white">✓</span>
        <span className="font-medium">{isTamil ? 'வருகை பதிவு செய்யப்பட்டது' : 'Checked in'}</span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-4">
        <div>
          <p className="text-sm text-soil-600/70">{isTamil ? 'டோக்கன் எண்' : 'Token number'}</p>
          <p className="font-data mt-1 text-xl font-semibold text-field-900">{token}</p>
        </div>
        <div>
          <p className="text-sm text-soil-600/70">{isTamil ? 'வரிசை நிலை' : 'Queue position'}</p>
          <p className="font-data mt-1 text-xl font-semibold text-field-900">{position}</p>
        </div>
        <div>
          <p className="text-sm text-soil-600/70">{isTamil ? 'முன்னால் உள்ளவர்கள்' : 'Farmers ahead'}</p>
          <p className="font-data mt-1 text-xl font-semibold text-field-900">{ahead}</p>
        </div>
        <div>
          <p className="text-sm text-soil-600/70">{isTamil ? 'மதிப்பிடப்பட்ட காத்திருப்பு' : 'Estimated wait'}</p>
          <p className="font-data mt-1 text-xl font-semibold text-field-900">{waitMin} {isTamil ? 'நிமிடம்' : 'min'}</p>
        </div>
      </div>

      <div className="mt-5 rounded-md bg-field-50 px-4 py-3">
        <p className="text-sm text-field-800">
          {isTamil ? 'தற்போதைய நிலை' : 'Current stage'}: <span className="font-semibold">{localizedStage}</span>
        </p>
      </div>
    </div>
  );
}
