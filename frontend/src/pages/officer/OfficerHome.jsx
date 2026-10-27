import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../data/translations';
import { ForecastAreaChart, UtilizationBarChart } from '../../components/ForecastChart';
import RiskBadge from '../../components/RiskBadge';
import { getDynamicCenterName } from '../../services/aiTranslation';
import api from '../../services/api';
import { RefreshCw } from 'lucide-react';

export default function OfficerHome() {
  const { state } = useApp();
  const t = getTranslation(state.language);
  const oh = t.officerHome;
  const isTamil = state.language === 'Tamil';

  const [centres, setCentres] = useState(() => api.getCachedCentres() || []);
  const [bookings, setBookings] = useState(() => api.getCachedBookings() || []);
  const [loading, setLoading] = useState(() => !api.getCachedCentres());

  const fetchLiveDashboard = async (force = false) => {
    try {
      if (!centres.length) setLoading(true);
      const [cRes, bRes] = await Promise.all([
        api.getCentres(force).catch(() => ({ status: 'error', centres: [] })),
        api.getAllBookings(force).catch(() => ({ status: 'error', bookings: [] }))
      ]);

      if (cRes.status === 'success' && cRes.centres) {
        setCentres(cRes.centres);
      }
      if (bRes.status === 'success' && bRes.bookings) {
        setBookings(bRes.bookings);
      }
    } catch (err) {
      console.error('Error fetching live officer home data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveDashboard();
  }, []);

  // Compute live KPIs
  const totalFarmers = bookings.length;
  const totalCenters = centres.length;
  const activeSlots = bookings.filter(b => b.queueStatus !== 'Completed').length;
  const avgWait = centres.length > 0 
    ? Math.round(centres.reduce((sum, c) => sum + (c.current_queue || 0) * 2.5, 0) / centres.length) || 20
    : 0;
  const overloaded = centres.filter(c => c.overload_risk === 'HIGH').length;
  const availableCounters = centres.reduce((sum, c) => sum + (c.active_counters || 4), 0);

  // Dynamic charts
  const arrivalsData = useMemo(() => {
    const totalProcessed = centres.reduce((s, c) => s + (c.processed_today || 60), 0);
    return [
      { time: '08:00', farmers: Math.round(totalProcessed * 0.12) || 15 },
      { time: '10:00', farmers: Math.round(totalProcessed * 0.35) || 42 },
      { time: '12:00', farmers: Math.round(totalProcessed * 0.65) || 68 },
      { time: '14:00', farmers: Math.round(totalProcessed * 0.85) || 50 },
      { time: '16:00', farmers: Math.round(totalProcessed * 0.95) || 32 },
      { time: '18:00', farmers: totalProcessed || 18 },
    ];
  }, [centres]);

  const centerUtilization = useMemo(() => {
    return centres.map(c => ({
      name: c.name ? c.name.split(' ')[0] : 'Centre',
      utilization: Math.min(130, Math.round(((c.processed_today + c.current_queue) / Math.max(1, c.total_capacity)) * 100))
    }));
  }, [centres]);

  const highRiskCentre = centres.find(c => c.overload_risk === 'HIGH') || centres[0];

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-husk-200 pb-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-field-900 tracking-tight">{oh.title}</h2>
          <p className="mt-1 text-sm text-soil-600 font-medium">{oh.subtitle}</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          <button 
            onClick={() => fetchLiveDashboard(true)}
            title="Refresh Live Data"
            className="p-2 rounded-lg border border-husk-200 bg-husk-100 hover:bg-husk-200 text-soil-700 transition active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-ok-100/50 px-3 py-1.5 text-xs font-semibold text-field-800 border border-ok-100">
             <span className="w-2 h-2 rounded-full bg-field-600 animate-pulse"></span>
             LIVE DB STATUS: {centres.length} HUBS SYNCED
          </span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="rounded-2xl border border-husk-200 bg-husk-100 p-4 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-soil-600 uppercase tracking-wider">{oh.totalFarmers}</p>
          <p className="mt-2 text-2xl font-display font-bold text-field-900">{totalFarmers}</p>
        </div>
        <div className="rounded-2xl border border-husk-200 bg-husk-100 p-4 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-soil-600 uppercase tracking-wider">{oh.totalCenters}</p>
          <p className="mt-2 text-2xl font-display font-bold text-sky-info">{totalCenters}</p>
        </div>
        <div className="rounded-2xl border border-husk-200 bg-husk-100 p-4 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-soil-600 uppercase tracking-wider">{oh.activeSlots}</p>
          <p className="mt-2 text-2xl font-display font-bold text-harvest-600">{activeSlots}</p>
        </div>
        <div className="rounded-2xl border border-husk-200 bg-husk-100 p-4 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-soil-600 uppercase tracking-wider">{oh.avgWaitTime}</p>
          <p className="mt-2 text-2xl font-display font-bold text-field-900">{avgWait} <span className="text-sm text-soil-600">{isTamil ? 'நிமிடம்' : 'min'}</span></p>
        </div>
        <div className="rounded-2xl border-2 border-danger-600/20 bg-danger-100/10 p-4 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-danger-600 uppercase tracking-wider">{oh.overloadedCenters}</p>
          <p className="mt-2 text-2xl font-display font-bold text-danger-600">{overloaded}</p>
        </div>
        <div className="rounded-2xl border border-husk-200 bg-husk-100 p-4 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-soil-600 uppercase tracking-wider">{oh.availableCounters}</p>
          <p className="mt-2 text-2xl font-display font-bold text-field-900">{availableCounters}</p>
        </div>
      </div>

      {/* NEEDS ATTENTION & AI DECISION SUPPORT */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Real Dynamic System Notifications */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <h3 className="font-display text-lg font-bold text-field-900 tracking-tight">{isTamil ? 'கவனம் தேவை' : 'Live System Alerts'}</h3>
          <div className="rounded-2xl border border-husk-200 bg-husk-100 shadow-sm flex flex-col divide-y divide-husk-200 overflow-hidden">
            {centres.map((c, i) => (
              <div key={c.id || i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 hover:bg-husk-50 transition-colors">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">{c.overload_risk === 'HIGH' ? '🔴' : c.overload_risk === 'MODERATE' ? '🟡' : '🟢'}</span>
                  <div>
                    <p className="text-sm font-semibold text-soil-900">
                      {c.name} — {c.current_queue || 0} {isTamil ? 'விவசாயிகள் வரிசையில்' : 'farmers in live queue'}
                    </p>
                    <p className="text-xs text-soil-600 mt-0.5">
                      {c.district}, {c.state} · {c.active_counters} {isTamil ? 'செயலில் உள்ள கவுண்டர்கள்' : 'active counters'} · {c.remaining_capacity} {isTamil ? 'மீதமுள்ள கொள்ளளவு' : 'remaining capacity'}
                    </p>
                  </div>
                </div>
                <Link 
                  to="/officer-dashboard/digital-twin"
                  className="shrink-0 rounded-xl bg-husk-100 border border-field-600/40 text-field-800 hover:bg-field-800 hover:text-white px-3.5 py-1.5 text-xs font-bold shadow-sm transition-colors text-center"
                >
                  {isTamil ? 'உருவகப்படுத்து' : 'Simulate'}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* AI Decision Support */}
        <div className="flex flex-col gap-3">
          <h3 className="font-display text-lg font-bold text-field-900 tracking-tight flex items-center gap-2">
            <svg className="w-5 h-5 text-field-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            {isTamil ? 'AI முடிவு உதவி' : 'AI Decision Intelligence'}
          </h3>
          <div className="rounded-2xl border-2 border-field-600/50 bg-husk-100 shadow-md p-5 flex flex-col h-full ai-glow relative overflow-hidden">
             <p className="text-sm text-soil-800 font-medium mb-3 relative z-10">
               <strong className="text-field-800">{isTamil ? 'மைய நிலை:' : 'Live Status:'}</strong> {highRiskCentre ? highRiskCentre.name : 'All APMC Hubs'}
             </p>
             
             <div className="bg-husk-50 rounded-xl p-3 border border-husk-200 mb-3 relative z-10">
               <p className="text-xs text-soil-500 uppercase tracking-wider font-bold mb-1">{isTamil ? 'பரிந்துரைக்கப்பட்ட நடவடிக்கை' : 'Prescribed Action'}</p>
               <p className="text-sm font-bold text-field-900">
                 {overloaded > 0 
                   ? (isTamil ? 'நெரிசல் உள்ள மையத்தில் கூடுதல் கவுண்டரைத் திறக்கவும் அல்லது அருகிலுள்ள மையத்திற்கு விவசாயிகளை மாற்றவும்.' : 'Open +1 additional counter or trigger AI dynamic reallocation.') 
                   : (isTamil ? 'தற்போதைய செயல்பாட்டு திறன் உகந்ததாக உள்ளது. இயல்பான ஓட்டம் தொடர்கிறது.' : 'Operational flow is optimal. Proceed with standard intake schedule.')}
               </p>
             </div>

             <Link 
               to="/officer-dashboard/farmer-allocation" 
               className="mt-auto w-full bg-field-800 text-white text-center rounded-xl py-2.5 text-sm font-bold shadow-sm hover:bg-field-900 hover:shadow-md transition-all active:scale-95 z-10"
             >
               {isTamil ? 'சுமை பகிர்வுக்கு செல்ல' : 'Manage Allocation & Shift'}
             </Link>
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-husk-200 bg-husk-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
             <h3 className="font-display text-base font-bold text-field-900">{oh.farmerArrivalsToday}</h3>
             <span className="text-xs font-semibold text-soil-600 bg-husk-50 px-2 py-1 rounded">24H LIVE PROFILE</span>
          </div>
          <div className="h-64">
            <ForecastAreaChart data={arrivalsData} dataKey="farmers" xKey="time" />
          </div>
        </div>
        <div className="rounded-2xl border border-husk-200 bg-husk-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
             <h3 className="font-display text-base font-bold text-field-900">{oh.centerUtilization}</h3>
             <span className="text-xs font-semibold text-soil-600 bg-husk-50 px-2 py-1 rounded">LIVE CAPACITY</span>
          </div>
          <div className="h-64">
            <UtilizationBarChart data={centerUtilization} />
          </div>
        </div>
      </div>

      {/* Live Data Table */}
      <div className="rounded-2xl border border-husk-200 bg-husk-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-husk-200 bg-husk-50/50 flex justify-between items-center">
           <h3 className="font-display text-base font-bold text-field-900">Live Database APMC Centres</h3>
           <Link to="/officer-dashboard/centers" className="text-xs font-semibold text-field-800 hover:text-field-900 flex items-center gap-1">
             Manage Centres <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
           </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-husk-200 bg-husk-50/30 text-xs font-bold text-soil-600 uppercase tracking-wider">
                <th className="px-5 py-3">Centre Name</th>
                <th className="px-5 py-3">District & State</th>
                <th className="px-5 py-3 text-right">Current Queue</th>
                <th className="px-5 py-3 text-right">Active Counters</th>
                <th className="px-5 py-3">AI Overload Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-husk-200/60">
              {centres.map((c) => (
                <tr key={c.id} className="hover:bg-husk-50/50 transition-colors">
                  <td className="px-5 py-3 font-medium text-field-900">{getDynamicCenterName(c.name, state.language)}</td>
                  <td className="px-5 py-3 text-sm text-soil-600">{c.district}, {c.state}</td>
                  <td className="px-5 py-3 text-sm text-right font-data font-medium text-soil-800">{c.current_queue || 0}</td>
                  <td className="px-5 py-3 text-sm text-right font-data font-medium text-soil-800">{c.active_counters} / {c.total_capacity ? Math.round(c.total_capacity / 40) : 6}</td>
                  <td className="px-5 py-3">
                    <RiskBadge label={c.overload_risk || 'Optimal'} tone={c.overload_risk === 'HIGH' ? 'danger' : c.overload_risk === 'MODERATE' ? 'warning' : 'success'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
