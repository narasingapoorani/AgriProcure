import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../data/translations';
import RiskBadge from '../../components/RiskBadge';
import { getDynamicCenterName } from '../../services/aiTranslation';
import api from '../../services/api';

export default function CenterManagement() {
  const navigate = useNavigate();
  const { state, update } = useApp();
  const t = getTranslation(state.language);
  const cm = t.centerManagement;

  const mapCentres = (raw) => (raw || []).map((c) => ({
    id: c.id,
    name: c.name,
    capacity: c.total_capacity || 200,
    expectedFarmers: (c.processed_today || 80) + (c.current_queue || 15) + 30,
    currentQueue: c.current_queue || 0,
    counters: c.active_counters || 4,
    status: c.overload_risk === 'HIGH' ? 'High Risk' : c.overload_risk === 'MODERATE' ? 'Moderate' : 'Optimal',
    latitude: c.latitude,
    longitude: c.longitude
  }));

  const [centers, setCenters] = useState(() => mapCentres(api.getCachedCentres()));
  const [loading, setLoading] = useState(() => !api.getCachedCentres());

  useEffect(() => {
    async function fetchCentres() {
      try {
        if (!centers.length) setLoading(true);
        const res = await api.getCentres();
        if (res.status === 'success' && res.centres && res.centres.length > 0) {
          setCenters(mapCentres(res.centres));
        }
      } catch (err) {
        console.warn('Centres API load note:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCentres();
  }, []);

  const selectCenter = (center) => {
    update({ officerSelectedCenter: center });
    navigate('/officer-dashboard/demand-forecast');
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-field-900">{cm.title}</h2>
          <p className="mt-1 text-sm text-soil-600/80">{cm.subtitle}</p>
        </div>
        {loading && <span className="text-xs text-soil-500 animate-pulse">Syncing centres...</span>}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {centers.map((center) => (
          <div key={center.id} className="rounded-2xl border border-husk-200 bg-husk-100 p-5 shadow-sm hover-lift">
            <div className="flex items-start justify-between">
              <h3 className="font-display text-lg font-semibold text-field-900">
                {getDynamicCenterName(center.name, state.language)}
              </h3>
              <RiskBadge label={center.status} tone={center.status === 'High Risk' ? 'danger' : center.status === 'Moderate' ? 'warning' : 'success'} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-soil-600/70">{cm.capacity}</dt>
              <dd className="text-right font-medium text-field-900">{center.capacity}</dd>
              <dt className="text-soil-600/70">{cm.expectedFarmers}</dt>
              <dd className="text-right font-medium text-field-900">{center.expectedFarmers}</dd>
              <dt className="text-soil-600/70">{cm.currentQueue}</dt>
              <dd className="text-right font-medium text-field-900">{center.currentQueue}</dd>
              <dt className="text-soil-600/70">{cm.counters}</dt>
              <dd className="text-right font-medium text-field-900">{center.counters}</dd>
            </dl>
            <button
              onClick={() => selectCenter(center)}
              className="mt-4 w-full rounded-xl bg-field-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-field-900 transition active:scale-95"
            >
              {cm.viewForecastBtn}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
