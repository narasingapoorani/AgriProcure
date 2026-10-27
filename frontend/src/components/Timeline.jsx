import { useApp } from '../context/AppContext';

const TIMELINE_STAGES_TAMIL = {
  'Slot Confirmation': 'முன்பதிவு உறுதி',
  'Arrival at Center': 'மையத்திற்கு வருகை',
  'Token Verification': 'டோக்கன் சரிபார்ப்பு',
  'Quality Inspection': 'தரப் பரிசோதனை',
  Weighment: 'எடை போடுதல்',
  'Receipt Generated': 'ரசீது உருவாக்கப்பட்டது',
  'Payment Processing': 'பணம் செலுத்தும் செயல்முறை',
};

export default function Timeline({ stages, currentStage, orientation = 'vertical' }) {
  const { state } = useApp();
  const isTamil = state.language === 'Tamil';
  const currentIndex = stages.indexOf(currentStage);
  const isVertical = orientation === 'vertical';

  return (
    <div className={isVertical ? 'flex flex-col' : 'flex flex-wrap items-start gap-0'}>
      {stages.map((stage, idx) => {
        const done = idx < currentIndex;
        const active = idx === currentIndex;
        const stateClasses = done
          ? 'bg-field-700 border-field-700 text-white'
          : active
          ? 'bg-harvest-500 border-harvest-500 text-soil-800'
          : 'bg-husk-100 border-husk-200 text-soil-600/60';

        const displayStage = isTamil ? (TIMELINE_STAGES_TAMIL[stage] || stage) : stage;

        return (
          <div key={stage} className={isVertical ? 'flex gap-3' : 'flex min-w-[9rem] flex-col items-center text-center'}>
            <div className={isVertical ? 'flex flex-col items-center' : 'flex w-full items-center'}>
              {!isVertical && idx !== 0 && (
                <span className={`h-0.5 flex-1 ${done ? 'bg-field-700' : 'bg-husk-200'}`} />
              )}
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${stateClasses}`}
              >
                {done ? '✓' : idx + 1}
              </span>
              {isVertical && idx !== stages.length - 1 && (
                <span className={`w-0.5 flex-1 ${done ? 'bg-field-700' : 'bg-husk-200'}`} style={{ minHeight: '2rem' }} />
              )}
            </div>
            <p
              className={`${isVertical ? 'pb-8 pl-3 pt-1' : 'mt-2'} text-sm font-medium ${
                active ? 'text-soil-800' : done ? 'text-field-800' : 'text-soil-600/60'
              }`}
            >
              {displayStage}
            </p>
          </div>
        );
      })}
    </div>
  );
}
