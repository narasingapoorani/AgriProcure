import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../data/translations';
import { ForecastAreaChart } from '../../components/ForecastChart';
import RiskBadge from '../../components/RiskBadge';
import { getDynamicCenterName } from '../../services/aiTranslation';
import api from '../../services/api';

const RANGES = ['Tomorrow', 'This Week', 'Next Week'];
const RANGE_TAMIL = {
  Tomorrow: 'நாளை',
  'This Week': 'இந்த வாரம்',
  'Next Week': 'அடுத்த வாரம்',
};

export default function DemandForecast() {
  const { state, update } = useApp();
  const t = getTranslation(state.language);
  const df = t.demandForecast || {};
  const isTamil = state.language === 'Tamil';

  const [centres, setCentres] = useState(() => api.getCachedCentres() || []);
  const [selectedCenterId, setSelectedCenterId] = useState(() => {
    if (state.officerSelectedCenter?.id) return state.officerSelectedCenter.id;
    const cached = api.getCachedCentres();
    return cached?.[0]?.id || 11;
  });

  const [range, setRange] = useState('Tomorrow');
  const [apiForecast, setApiForecast] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load all centres if not already cached
  useEffect(() => {
    let isMounted = true;
    async function fetchCentres() {
      try {
        const res = await api.getCentres();
        if (isMounted && res.status === 'success' && res.centres && res.centres.length > 0) {
          setCentres(res.centres);
          if (!selectedCenterId) {
            setSelectedCenterId(res.centres[0].id);
          }
        }
      } catch (err) {
        console.warn('Centres fetch error in DemandForecast:', err);
      }
    }
    if (!centres.length) {
      fetchCentres();
    }
    return () => { isMounted = false; };
  }, [centres.length, selectedCenterId]);

  const activeCenter = centres.find(c => c.id === selectedCenterId) || state.officerSelectedCenter || centres[0] || {
    id: 11,
    name: 'Coimbatore Central APMC & Agricultural Complex',
    total_capacity: 5000,
    capacity: 5000,
    daily_processing_capacity: 420
  };

  const handleCenterChange = (newId) => {
    const cid = Number(newId);
    setSelectedCenterId(cid);
    const chosen = centres.find(c => c.id === cid);
    if (chosen) {
      update({ officerSelectedCenter: chosen });
    }
  };

  // Fetch ML Demand Forecast for active center
  useEffect(() => {
    let isMounted = true;
    if (!activeCenter?.id) return;

    async function fetchForecast() {
      try {
        setLoading(true);
        const res = await api.getDemandForecast(activeCenter.id);
        if (isMounted && res.status === 'success') {
          setApiForecast(res);
        }
      } catch (err) {
        console.warn('Demand forecast API load note:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchForecast();
    return () => { isMounted = false; };
  }, [activeCenter.id]);

  const dailyCap = activeCenter.daily_processing_capacity || activeCenter.capacity || 420;
  const weeklyCap = dailyCap * 7;
  const f = apiForecast?.forecast;

  let predictedFarmers = 120;
  let expectedQuantityTons = 264;
  let utilizationPct = 25;
  let chartData = [];

  if (f) {
    if (range === 'Tomorrow') {
      const tomArrival = f.this_week?.[0]?.predicted_arrivals || f.this_week_avg_daily || 104;
      predictedFarmers = Math.round(tomArrival);
      expectedQuantityTons = Math.round(predictedFarmers * 2.2);
      utilizationPct = Math.min(130, Math.round((predictedFarmers / Math.max(1, dailyCap)) * 100));
      chartData = [
        { time: '08:00', hour: '08:00', farmers: Math.round(predictedFarmers * 0.15), arrivals: Math.round(predictedFarmers * 0.15) },
        { time: '10:00', hour: '10:00', farmers: Math.round(predictedFarmers * 0.35), arrivals: Math.round(predictedFarmers * 0.35) },
        { time: '12:00', hour: '12:00', farmers: Math.round(predictedFarmers * 0.65), arrivals: Math.round(predictedFarmers * 0.65) },
        { time: '14:00', hour: '14:00', farmers: Math.round(predictedFarmers * 0.85), arrivals: Math.round(predictedFarmers * 0.85) },
        { time: '16:00', hour: '16:00', farmers: Math.round(predictedFarmers * 0.95), arrivals: Math.round(predictedFarmers * 0.95) },
        { time: '18:00', hour: '18:00', farmers: predictedFarmers, arrivals: predictedFarmers }
      ];
    } else if (range === 'This Week') {
      predictedFarmers = Math.round(f.this_week_total || (dailyCap * 5));
      expectedQuantityTons = Math.round(predictedFarmers * 2.2);
      utilizationPct = Math.round(apiForecast.capacity_comparison?.this_week_utilization_percent || ((predictedFarmers / Math.max(1, weeklyCap)) * 100));
      chartData = (f.this_week || []).map(dp => ({
        time: dp.day_name ? dp.day_name.substring(0, 3) : (dp.date || 'Day'),
        hour: dp.day_name ? dp.day_name.substring(0, 3) : (dp.date || 'Day'),
        farmers: Math.round(dp.predicted_arrivals),
        arrivals: Math.round(dp.predicted_arrivals)
      }));
    } else {
      predictedFarmers = Math.round(f.next_week_total || (dailyCap * 5.2));
      expectedQuantityTons = Math.round(predictedFarmers * 2.2);
      utilizationPct = Math.round(apiForecast.capacity_comparison?.next_week_utilization_percent || ((predictedFarmers / Math.max(1, weeklyCap)) * 100));
      chartData = (f.next_week || []).map(dp => ({
        time: dp.day_name ? dp.day_name.substring(0, 3) : (dp.date || 'Day'),
        hour: dp.day_name ? dp.day_name.substring(0, 3) : (dp.date || 'Day'),
        farmers: Math.round(dp.predicted_arrivals),
        arrivals: Math.round(dp.predicted_arrivals)
      }));
    }
  }

  const risk = apiForecast?.overload_risk || (utilizationPct > 95 ? 'HIGH' : utilizationPct > 75 ? 'MEDIUM' : 'LOW');
  const overloaded = risk === 'HIGH' || risk === 'High' || utilizationPct >= 100;

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-10">
      {/* Header & Center Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-husk-200 pb-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-field-900 tracking-tight">
            {df.title || (isTamil ? 'AI தேவை முன்கணிப்பு' : 'AI Demand Forecast (Model #2)')}
          </h2>
          <p className="mt-1 text-sm text-soil-600 font-medium">
            {isTamil ? 'அடுத்த 14 நாட்களுக்கான உழவர்கள் வருகை முன்கணிப்பு' : 'Machine Learning arrival demand forecasting for 14 operational days'}
          </p>
        </div>

        {/* Center Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-soil-700 uppercase tracking-wider">{isTamil ? 'மையம்' : 'Centre'}:</label>
          <select
            value={activeCenter.id}
            onChange={(e) => handleCenterChange(e.target.value)}
            className="rounded-xl border border-husk-300 bg-husk-50 px-3 py-2 text-sm font-semibold text-field-900 outline-none focus:border-field-600 shadow-xs"
          >
            {centres.map(c => (
              <option key={c.id} value={c.id}>
                {getDynamicCenterName(c.name, state.language)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Range Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex w-fit overflow-hidden rounded-xl border border-husk-200 shadow-xs">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-2 text-sm font-bold transition-colors ${r === range ? 'bg-field-800 text-white' : 'bg-husk-100 text-soil-700 hover:bg-husk-200'}`}
            >
              {isTamil ? (RANGE_TAMIL[r] || r) : r}
            </button>
          ))}
        </div>

        {apiForecast && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-field-100 text-field-900 border border-field-200 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-field-600 animate-ping" />
            AI Demand Model Active (Joblib)
          </span>
        )}
      </div>

      {/* Forecast Area Chart and Summary Cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-husk-200 bg-husk-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display text-lg font-bold text-field-900">{df.predictedArrivals || 'Predicted Arrivals (Farmers)'}</h3>
            {loading && <span className="text-xs text-soil-500 animate-pulse font-semibold">Updating from AI Model...</span>}
          </div>
          <p className="text-xs text-soil-500 mb-4 font-medium">
            {range === 'Tomorrow' ? (isTamil ? 'நாளை கணிக்கப்பட்ட மணிநேர வருகை' : 'Hourly arrival curve for tomorrow') : (isTamil ? 'தினசரி வருகை போக்கு' : 'Daily arrival projections')}
          </p>
          <div className="mt-2">
            <ForecastAreaChart data={chartData} dataKey="farmers" xKey="time" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-husk-200 bg-husk-100 p-5 shadow-sm">
            <h4 className="font-display text-base font-bold text-field-900 mb-3 pb-2 border-b border-husk-200">
              {isTamil ? 'முன்கணிப்பு சுருக்கம்' : 'Forecast Operational Summary'}
            </h4>
            <dl className="flex flex-col gap-3 text-sm">
              <Row label={df.predictedFarmers || 'Predicted Farmers'} value={predictedFarmers} />
              <Row label={df.expectedCropQty || 'Expected Harvest Quantity'} value={`${expectedQuantityTons} ${isTamil ? 'டன்' : 'tons'}`} />
              <Row label={df.centerCapacity || 'Daily Capacity'} value={`${dailyCap} ${isTamil ? 'விவசாயிகள்' : 'farmers/day'}`} />
              <Row label={df.expectedUtilization || 'Predicted Utilization'} value={`${utilizationPct}%`} />
              <div className="flex items-center justify-between pt-1">
                <dt className="text-soil-600 font-semibold">{df.overloadRisk || 'Overload Risk'}</dt>
                <dd><RiskBadge label={risk} tone={overloaded ? 'danger' : 'success'} /></dd>
              </div>
            </dl>
          </div>

          {overloaded && (
            <Link
              to="/officer-dashboard/overload-risk"
              className="rounded-xl bg-danger-600 px-4 py-3.5 text-center text-sm font-bold text-white hover:bg-danger-700 transition shadow-sm flex items-center justify-center gap-2"
            >
              <span>⚠️</span>
              <span>{df.viewRiskDetailsBtn || 'View Overload Risk & Rebalance'}</span>
            </Link>
          )}

          {apiForecast?.decision_recommendation && (
            <div className="rounded-2xl border border-field-200 bg-field-50/60 p-4 shadow-xs">
              <p className="text-xs font-bold text-field-800 uppercase tracking-wider mb-1">
                {isTamil ? 'AI பரிந்துரை' : 'AI Prescribed Recommendation'}
              </p>
              <p className="text-xs font-semibold text-soil-800">
                {apiForecast.decision_recommendation.reason}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-soil-600 font-medium">{label}</dt>
      <dd className="font-bold text-field-900">{value}</dd>
    </div>
  );
}
