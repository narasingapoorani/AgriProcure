import { useMemo, useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../data/translations';
import RiskBadge from '../../components/RiskBadge';
import { getDynamicCenterName } from '../../services/aiTranslation';
import api from '../../services/api';
import { 
  Cpu, 
  Minus, 
  Plus, 
  Play, 
  RotateCcw, 
  CloudRain, 
  Users, 
  Layers, 
  ArrowRight, 
  Lightbulb, 
  CheckCircle2, 
  ShieldAlert 
} from 'lucide-react';

function computeRisk(utilizationPct) {
  if (utilizationPct >= 110) return 'High';
  if (utilizationPct >= 90) return 'Medium';
  return 'Low';
}

function runLocalModel({ farmers, counters, capacity, rainFactor }) {
  const effectiveCounters = Math.max(counters, 1);
  const rainPenalty = rainFactor || 1;
  const avgWaitMin = Math.round(((farmers / effectiveCounters) * 0.26) * rainPenalty);
  const utilizationPct = Math.round((farmers / capacity) * 100);
  return {
    farmers,
    counters: effectiveCounters,
    avgWaitMin,
    utilizationPct,
    risk: computeRisk(utilizationPct),
  };
}

export default function DigitalTwin() {
  const { state } = useApp();
  const isTamil = state.language === 'Tamil';

  const mapCentres = (raw) => (raw || []).map(c => ({
    id: c.id,
    name: c.name,
    counters: c.active_counters || 4,
    expectedFarmers: (c.processed_today || 80) + (c.current_queue || 15),
    capacity: c.total_capacity || 200,
    status: c.overload_risk || 'Optimal'
  }));

  const [centres, setCentres] = useState(() => mapCentres(api.getCachedCentres()));
  const [centerId, setCenterId] = useState(() => {
    const cached = api.getCachedCentres();
    return cached?.[0]?.id || 1;
  });
  const defaultCenter = { id: 1, name: 'APMC Central Hub', counters: 4, expectedFarmers: 120, capacity: 200 };
  const center = centres.find((c) => c.id === centerId) || (centres.length > 0 ? centres[0] : defaultCenter);

  // Interactive Numeric Counters & Conditions
  const [activeCounters, setActiveCounters] = useState(center.counters || 4);
  const [simulatedFarmers, setSimulatedFarmers] = useState(center.expectedFarmers || 120);
  const [weatherCondition, setWeatherCondition] = useState('clear'); // 'clear' | 'moderate_rain' | 'heavy_rain'

  const [result, setResult] = useState(null);
  const [shifted, setShifted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shiftMsg, setShiftMsg] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function fetchCentres() {
      try {
        const res = await api.getCentres();
        if (isMounted && res.status === 'success' && res.centres && res.centres.length > 0) {
          const mapped = mapCentres(res.centres);
          setCentres(mapped);
          if (!centres.length) {
            setCenterId(mapped[0].id);
            setActiveCounters(mapped[0].counters);
            setSimulatedFarmers(mapped[0].expectedFarmers);
          }
        }
      } catch (err) {
        console.warn('Digital twin fetch error:', err);
      }
    }
    fetchCentres();
    return () => { isMounted = false; };
  }, []);

  // Sync state when center changes
  const handleCenterChange = (newId) => {
    setCenterId(newId);
    const newCenter = centres.find((c) => c.id === newId) || (centres.length > 0 ? centres[0] : defaultCenter);
    setActiveCounters(newCenter.counters);
    setSimulatedFarmers(newCenter.expectedFarmers);
    setResult(null);
    setShifted(false);
    setShiftMsg('');
  };

  const before = useMemo(
    () => runLocalModel({ 
      farmers: center.expectedFarmers, 
      counters: center.counters, 
      capacity: center.capacity, 
      rainFactor: 1 
    }),
    [center]
  );

  const getRainMultiplier = () => {
    if (weatherCondition === 'heavy_rain') return 1.35;
    if (weatherCondition === 'moderate_rain') return 1.15;
    return 1.0;
  };

  const runSimulation = async () => {
    setLoading(true);
    const numericCentreId = parseInt(String(center.id).replace(/\D/g, '')) || 1;
    const diffCounters = activeCounters - center.counters;

    const payload = {
      add_counter: diffCounters > 0 ? diffCounters : 0,
      remove_counter: diffCounters < 0 ? Math.abs(diffCounters) : 0,
      heavy_rain: weatherCondition === 'heavy_rain',
      extra_farmers: Math.max(0, simulatedFarmers - center.expectedFarmers)
    };

    try {
      const res = await api.simulateDigitalTwin(numericCentreId, payload);
      if (res.status === 'success' && res.simulation) {
        const s = res.simulation.simulated_scenario;
        setResult({
          farmers: simulatedFarmers,
          counters: s.active_counters,
          avgWaitMin: s.estimated_wait_minutes,
          utilizationPct: Math.round(s.capacity_utilization_percent),
          risk: s.overload_risk,
          recommendation: res.simulation.recommendation
        });
        setShifted(false);
        setShiftMsg('');
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Digital Twin API simulation error, using local sandbox fallback:', err);
    }

    // Fallback to local sandbox calculations
    const after = runLocalModel({
      farmers: simulatedFarmers,
      counters: activeCounters,
      capacity: center.capacity,
      rainFactor: getRainMultiplier(),
    });
    setResult(after);
    setShifted(false);
    setShiftMsg('');
    setLoading(false);
  };

  const handleApplyMitigation = async () => {
    const numericCentreId = parseInt(String(center.id).replace(/\D/g, '')) || 1;
    const countToShift = suggestedShift || 25;
    try {
      const res = await api.shiftFarmers(numericCentreId, countToShift);
      if (res.status === 'success') {
        setShiftMsg(res.message || `Successfully shifted ${res.shifted_count || countToShift} farmers.`);
      }
    } catch (err) {
      console.warn('Shift farmers API call note:', err);
    }
    setShifted(true);
  };

  const resetToBaseline = () => {
    setActiveCounters(center.counters);
    setSimulatedFarmers(center.expectedFarmers);
    setWeatherCondition('clear');
    setResult(null);
    setShifted(false);
    setShiftMsg('');
  };

  const overloadedAfter = result && (result.risk === 'Medium' || result.risk === 'High' || result.risk === 'HIGH' || result.risk === 'MODERATE');
  const suggestedShift = result ? Math.max(result.farmers - center.capacity, 0) : 0;

  return (
    <div className="w-full max-w-7xl mx-auto pb-10 flex flex-col gap-6">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-field-900 via-field-800 to-field-700 px-8 py-8 shadow-xl text-white ai-glow">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2 text-field-100">
              <Cpu className="w-4 h-4 text-harvest-300" />
              {isTamil ? 'AI உருவகப்படுத்துதல் ஆய்வகம்' : 'AI Simulation Sandbox (Digital Twin)'}
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {isTamil ? 'டிஜிட்டல் ட்வின் (Digital Twin)' : 'Digital Twin Simulation'}
            </h2>
            <p className="text-field-100 text-sm font-medium mt-1">
              {isTamil
                ? 'கவுண்டர்கள் மற்றும் வானிலை மாற்றங்களை உருவகப்படுத்தி நெரிசலை முன்கூட்டியே கணிக்கவும்.'
                : 'Simulate counter variations, weather impacts, and farmer surges in real-time.'}
            </p>
          </div>

          <div className="bg-white/10 rounded-2xl px-5 py-3 border border-white/15 backdrop-blur-sm text-right">
            <span className="text-xs uppercase tracking-wider text-field-200 font-semibold block">
              {isTamil ? 'அடிப்படை கொள்ளளவு' : 'Base Capacity'}
            </span>
            <span className="font-display text-2xl font-black tracking-tight text-white">
              {center.capacity} {isTamil ? 'விவசாயிகள்' : 'Farmers'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT PANEL: INTERACTIVE COUNTERS & CONTROLS */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          
          <div className="rounded-3xl border border-husk-200 bg-husk-100 p-6 shadow-sm flex flex-col gap-6">
            
            {/* Center Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-soil-600 uppercase tracking-wider">
                {isTamil ? 'கொள்முதல் மையம்' : 'Procurement Centre'}
              </label>
              <select
                value={centerId}
                onChange={(e) => handleCenterChange(e.target.value)}
                className="w-full rounded-xl border-2 border-husk-200 bg-husk-50 px-4 py-3 text-base font-bold text-field-900 outline-none focus:border-field-600 transition-all"
              >
                {(centres.length > 0 ? centres : [defaultCenter]).map((c) => (
                  <option key={c.id} value={c.id}>
                    {getDynamicCenterName(c.name, state.language)}
                  </option>
                ))}
              </select>
            </div>

            {/* Counter Control 1: Active Operational Counters */}
            <div className="rounded-2xl border border-husk-200 bg-husk-50 p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-field-900 text-sm">
                    <Layers className="w-4 h-4 text-field-700" />
                    {isTamil ? 'செயலில் உள்ள கவுண்டர்கள்' : 'Active Counters'}
                  </div>
                  <p className="text-xs text-soil-500 mt-0.5">
                    {isTamil ? `அடிப்படை: ${center.counters} கவுண்டர்கள்` : `Baseline: ${center.counters} counters`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveCounters(c => Math.max(c - 1, 1))}
                    className="w-9 h-9 rounded-xl bg-husk-100 border border-husk-200 hover:bg-husk-200 text-soil-800 flex items-center justify-center font-bold shadow-sm active:scale-95 transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-display text-2xl font-black text-field-900 w-8 text-center">
                    {activeCounters}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveCounters(c => Math.min(c + 1, 12))}
                    className="w-9 h-9 rounded-xl bg-husk-100 border border-husk-200 hover:bg-husk-200 text-soil-800 flex items-center justify-center font-bold shadow-sm active:scale-95 transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Counter Control 2: Expected Farmers / Surge */}
            <div className="rounded-2xl border border-husk-200 bg-husk-50 p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-field-900 text-sm">
                    <Users className="w-4 h-4 text-field-700" />
                    {isTamil ? 'எதிர்பார்க்கப்படும் விவசாயிகள்' : 'Farmer Inflow Volume'}
                  </div>
                  <p className="text-xs text-soil-500 mt-0.5">
                    {isTamil ? `அடிப்படை: ${center.expectedFarmers} விவசாயிகள்` : `Baseline: ${center.expectedFarmers} farmers`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSimulatedFarmers(f => Math.max(f - 25, 25))}
                    className="w-9 h-9 rounded-xl bg-husk-100 border border-husk-200 hover:bg-husk-200 text-soil-800 flex items-center justify-center font-bold shadow-sm active:scale-95 transition"
                  >
                    -25
                  </button>
                  <span className="font-display text-xl font-black text-field-900 w-12 text-center">
                    {simulatedFarmers}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSimulatedFarmers(f => Math.min(f + 25, 1000))}
                    className="w-9 h-9 rounded-xl bg-husk-100 border border-husk-200 hover:bg-husk-200 text-soil-800 flex items-center justify-center font-bold shadow-sm active:scale-95 transition"
                  >
                    +25
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="50"
                max="800"
                step="10"
                value={simulatedFarmers}
                onChange={(e) => setSimulatedFarmers(Number(e.target.value))}
                className="w-full h-2 bg-husk-200 rounded-lg appearance-none cursor-pointer accent-field-700 mt-1"
              />
            </div>

            {/* Condition 3: Weather & Precipitation Impact */}
            <div className="rounded-2xl border border-husk-200 bg-husk-50 p-4 flex flex-col gap-2.5">
              <div className="flex items-center gap-1.5 font-bold text-field-900 text-sm mb-1">
                <CloudRain className="w-4 h-4 text-sky-600" />
                {isTamil ? 'வானிலை & மழை தாக்கம்' : 'Weather Impact Condition'}
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setWeatherCondition('clear')}
                  className={`py-2 px-2 rounded-xl border transition-all ${
                    weatherCondition === 'clear'
                      ? 'bg-field-800 text-white border-field-800 shadow-sm'
                      : 'bg-husk-100 text-soil-800 border-husk-200 hover:bg-husk-200'
                  }`}
                >
                  ☀️ {isTamil ? 'இயல்பு (0%)' : 'Clear (0%)'}
                </button>
                <button
                  type="button"
                  onClick={() => setWeatherCondition('moderate_rain')}
                  className={`py-2 px-2 rounded-xl border transition-all ${
                    weatherCondition === 'moderate_rain'
                      ? 'bg-field-800 text-white border-field-800 shadow-sm'
                      : 'bg-husk-100 text-soil-800 border-husk-200 hover:bg-husk-200'
                  }`}
                >
                  🌧️ {isTamil ? 'மிதமான (+15%)' : 'Rain (+15%)'}
                </button>
                <button
                  type="button"
                  onClick={() => setWeatherCondition('heavy_rain')}
                  className={`py-2 px-2 rounded-xl border transition-all ${
                    weatherCondition === 'heavy_rain'
                      ? 'bg-danger-700 text-white border-danger-700 shadow-sm'
                      : 'bg-husk-100 text-soil-800 border-husk-200 hover:bg-husk-200'
                  }`}
                >
                  ⛈️ {isTamil ? 'கடும் (+35%)' : 'Heavy (+35%)'}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={runSimulation}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-field-800 px-5 py-4 text-base font-bold text-white shadow-md hover:bg-field-900 transition-all active:scale-95 ai-glow disabled:opacity-60"
              >
                <Play className="w-4 h-4 fill-current" />
                {loading ? (isTamil ? 'கணிக்கப்படுகிறது...' : 'Simulating...') : (isTamil ? 'உருவகப்படுத்து' : 'Run Simulation')}
              </button>
              <button
                onClick={resetToBaseline}
                title={isTamil ? 'மீட்டமை' : 'Reset to Baseline'}
                className="rounded-2xl border border-husk-200 bg-husk-100 px-4 text-soil-800 hover:bg-husk-200 transition-all shadow-sm"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>

        {/* RIGHT PANEL: SIMULATION RESULTS */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {!result ? (
            <div className="h-full min-h-[360px] flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-husk-300 bg-husk-100 p-8 text-center text-soil-500">
              <div className="w-16 h-16 rounded-2xl bg-field-50 text-field-700 flex items-center justify-center mb-4">
                <Cpu className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-field-900">
                {isTamil ? 'உருவகப்படுத்துதலுக்காக காத்திருக்கிறது' : 'Awaiting Simulation Run'}
              </h3>
              <p className="text-sm text-soil-600 mt-1 max-w-sm">
                {isTamil
                  ? 'இடதுபுறத்தில் கவுண்டர்கள் மற்றும் விவசாயிகளின் எண்ணிக்கையை மாற்றி "Run Simulation" பொத்தானை அழுத்தவும்.'
                  : 'Adjust operational counters or farmer volume on the left and click "Run Simulation" to model real-time impact.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6 animate-in fade-in duration-200">
              
              {/* Comparison Result Card */}
              <div className="rounded-3xl border-2 border-field-600 bg-husk-100 p-6 sm:p-7 shadow-md">
                <div className="flex items-center justify-between pb-4 border-b border-husk-200 mb-6">
                  <h3 className="font-display text-lg font-bold text-field-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-field-600 animate-ping" />
                    {isTamil ? 'உருவகப்படுத்தப்பட்ட முடிவு' : 'Simulation Model Output'}
                  </h3>
                  <span className="text-xs font-mono font-bold text-soil-500">
                    {center.id} · {getDynamicCenterName(center.name, state.language)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  
                  {/* Farmers */}
                  <div className="flex flex-col p-4 rounded-2xl bg-husk-50 border border-husk-200">
                    <p className="text-xs font-bold text-soil-500 uppercase tracking-wider mb-2">
                      {isTamil ? 'விவசாயிகள் சுமை' : 'Queue Volume'}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-soil-500">{before.farmers}</span>
                      <ArrowRight className="w-4 h-4 text-soil-400 shrink-0" />
                      <span className={`text-2xl font-black ${result.farmers > before.farmers ? 'text-danger-600' : 'text-field-800'}`}>
                        {result.farmers}
                      </span>
                    </div>
                    <span className="text-[11px] text-soil-400 mt-1">
                      {result.farmers > before.farmers ? `+${result.farmers - before.farmers} surge` : 'baseline/reduced'}
                    </span>
                  </div>

                  {/* Wait Time */}
                  <div className="flex flex-col p-4 rounded-2xl bg-husk-50 border border-husk-200">
                    <p className="text-xs font-bold text-soil-500 uppercase tracking-wider mb-2">
                      {isTamil ? 'சராசரி காத்திருப்பு' : 'Avg. Wait Time'}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-soil-500">{before.avgWaitMin}m</span>
                      <ArrowRight className="w-4 h-4 text-soil-400 shrink-0" />
                      <span className={`text-2xl font-black ${result.avgWaitMin > before.avgWaitMin ? 'text-danger-600' : 'text-field-800'}`}>
                        {result.avgWaitMin} {isTamil ? 'நிமி' : 'min'}
                      </span>
                    </div>
                    <span className="text-[11px] text-soil-400 mt-1">
                      {activeCounters} {isTamil ? 'கவுண்டர்கள்' : 'active counters'}
                    </span>
                  </div>

                  {/* Risk Level */}
                  <div className="flex flex-col p-4 rounded-2xl bg-husk-50 border border-husk-200">
                    <p className="text-xs font-bold text-soil-500 uppercase tracking-wider mb-2">
                      {isTamil ? 'கொள்ளளவு நிலை' : 'Capacity Status'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <RiskBadge label={before.risk} tone={before.risk === 'High' ? 'danger' : before.risk === 'Medium' ? 'warning' : 'success'} />
                      <ArrowRight className="w-3.5 h-3.5 text-soil-400 shrink-0" />
                      <RiskBadge label={result.risk} tone={result.risk === 'High' || result.risk === 'HIGH' ? 'danger' : (result.risk === 'Medium' || result.risk === 'MODERATE') ? 'warning' : 'success'} />
                    </div>
                    <span className="text-[11px] text-soil-500 font-bold mt-2">
                      {result.utilizationPct}% {isTamil ? 'பயன்பாடு' : 'utilization'}
                    </span>
                  </div>

                </div>
              </div>

              {/* AI Recommendation Banner */}
              <div className="rounded-3xl border border-harvest-300 bg-harvest-50/70 p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-harvest-100 text-harvest-800 flex items-center justify-center shrink-0">
                    <Lightbulb className="w-6 h-6 text-harvest-700" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-display text-base font-bold text-field-900 mb-1">
                      {isTamil ? 'AI தணிப்பு பரிந்துரை (Mitigation Plan)' : 'AI Autonomous Mitigation Plan'}
                    </h4>
                    <p className="text-sm text-soil-800 leading-relaxed">
                      {result.recommendation?.message || (overloadedAfter
                        ? isTamil
                          ? `நெரிசலைத் தவிர்க்க +1 கூடுதல் கவுண்டரைத் திறக்கவும் அல்லது தோராயமாக ${suggestedShift || 25} விவசாயிகளை அருகிலுள்ள சேரன்மகாதேவி மையத்திற்கு திருப்பி விடவும்.`
                          : `Predicted risk elevated. Open +1 counter immediately or auto-divert approximately ${suggestedShift || 25} farmers to Cheranmahadevi Center to preserve 20-min wait times.`
                        : isTamil
                          ? 'தற்போதைய செயல்பாட்டு அளவுகோல்கள் உகந்த வரம்பிற்குள் உள்ளன. கூடுதல் தலையீடு தேவையில்லை.'
                          : 'Operational parameters remain well within acceptable capacity limits. No bottleneck predicted.')}
                    </p>

                    {overloadedAfter && !shifted && (
                      <button
                        onClick={handleApplyMitigation}
                        className="mt-4 rounded-xl bg-harvest-600 px-6 py-3 text-sm font-bold text-white hover:bg-harvest-700 transition shadow-sm active:scale-95"
                      >
                        {isTamil ? 'பரிந்துரையை செயல்படுத்தவும்' : 'Apply AI Reallocation Plan'}
                      </button>
                    )}

                    {shifted && (
                      <div className="mt-4 p-3.5 bg-ok-100/60 border border-ok-200 rounded-xl text-sm font-bold text-field-900 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-ok-700" />
                        {shiftMsg || (isTamil
                          ? 'வெற்றிகரமாக செயல்படுத்தப்பட்டது: சுமை சமப்படுத்தப்பட்டது & விவசாயிகளுக்கு SMS அனுப்பப்பட்டது!'
                          : 'Mitigation Applied: Farmers redirected & queue re-balanced! SMS dispatched.')}
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
