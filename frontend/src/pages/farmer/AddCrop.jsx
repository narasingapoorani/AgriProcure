import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../data/translations';
import api from '../../services/api';

const CROP_TAMIL = {
  Paddy: 'நெல் (Paddy)',
  'Paddy (Rice)': 'நெல் (Paddy Rice)',
  Wheat: 'கோதுமை (Wheat)',
  Maize: 'மக்காச்சோளம் (Maize)',
  Cotton: 'பருத்தி (Cotton)',
  Sugarcane: 'கரும்பு (Sugarcane)',
  Pulses: 'பருப்பு வகைகள் (Pulses)',
  'Gram (Chana)': 'சுண்டல் (Gram / Chana)',
  Mustard: 'கடுகு (Mustard)',
  Soybean: 'சோயாபீன் (Soybean)',
  Groundnut: 'நிலக்கடலை (Groundnut)',
  Tomato: 'தக்காளி (Tomato)',
  Onion: 'வெங்காயம் (Onion)',
  Potato: 'உருளைக்கிழங்கு (Potato)',
  Brinjal: 'கத்தரிக்காய் (Brinjal)',
};

const DISTRICTS = [
  'Coimbatore', 'Tiruppur', 'Erode', 'Salem', 'Namakkal',
  'Krishnagiri', 'Dharmapuri', 'Thanjavur', 'Tiruchirappalli',
  'Madurai', 'Dindigul', 'Tirunelveli', 'Thoothukudi', 'Other'
];

const DISTRICT_STATE_MAP = {
  'Coimbatore': 'Tamil Nadu',
  'Tiruppur': 'Tamil Nadu',
  'Erode': 'Tamil Nadu',
  'Salem': 'Tamil Nadu',
  'Namakkal': 'Tamil Nadu',
  'Krishnagiri': 'Tamil Nadu',
  'Dharmapuri': 'Tamil Nadu',
  'Thanjavur': 'Tamil Nadu',
  'Tiruchirappalli': 'Tamil Nadu',
  'Madurai': 'Tamil Nadu',
  'Dindigul': 'Tamil Nadu',
  'Tirunelveli': 'Tamil Nadu',
  'Thoothukudi': 'Tamil Nadu',
  'Pune': 'Maharashtra',
};

export default function AddCrop() {
  const navigate = useNavigate();
  const { state, update } = useApp();
  const t = getTranslation(state.language);
  const ac = t.addCropPage || {};
  const isTamil = state.language === 'Tamil';

  const profileCrop = state.farmerUser?.farmer_profile?.primary_crop || state.farmerUser?.primary_crop || state.farmerUser?.cropDetails;
  const profileLandArea = state.farmerUser?.farmer_profile?.land_area_acres || state.farmerUser?.landArea || state.farmerUser?.land_area;
  const initialCrop = state.selectedCrop?.crop || profileCrop || 'Paddy';
  const initialLandArea = state.selectedCrop?.landArea || (profileLandArea ? String(profileLandArea) : '');
  const initialQty = state.selectedCrop?.quantity || (initialLandArea ? String(Math.round(parseFloat(initialLandArea) * 5)) : '');

  const [cropList, setCropList] = useState(['Paddy', 'Wheat', 'Cotton', 'Sugarcane', 'Maize', 'Groundnut', 'Soybean']);
  const [form, setForm] = useState({
    crop: initialCrop,
    landArea: initialLandArea,
    harvestDate: state.selectedCrop?.harvestDate || '',
    quantity: initialQty,
    arrivalDate: state.selectedCrop?.arrivalDate || '',
  });

  // Automatically prefill if farmerUser profile loads after initial render
  useEffect(() => {
    if (state.farmerUser && !state.selectedCrop) {
      const pCrop = state.farmerUser?.farmer_profile?.primary_crop || state.farmerUser?.primary_crop || state.farmerUser?.cropDetails;
      const pLand = state.farmerUser?.farmer_profile?.land_area_acres || state.farmerUser?.landArea || state.farmerUser?.land_area;
      if (pCrop || pLand) {
        setForm(f => ({
          ...f,
          crop: f.crop || pCrop || 'Paddy',
          landArea: f.landArea || (pLand ? String(pLand) : ''),
          quantity: f.quantity || (pLand ? String(Math.round(parseFloat(pLand) * 5)) : '')
        }));
      }
    }
  }, [state.farmerUser]);

  // Farmer Area & GPS Location state
  const profileDistrict = state.farmerUser?.farmer_profile?.district || state.farmerUser?.district;
  const initialDistrict = state.selectedCrop?.district || profileDistrict || 'Coimbatore';
  const [district, setDistrict] = useState(initialDistrict);
  const [customArea, setCustomArea] = useState('');
  const [coords, setCoords] = useState(
    state.selectedCrop?.latitude ? { latitude: state.selectedCrop.latitude, longitude: state.selectedCrop.longitude } :
    (initialDistrict === profileDistrict && state.farmerUser?.latitude ? { latitude: state.farmerUser.latitude, longitude: state.farmerUser.longitude } : null)
  );
  const [locating, setLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');

  const [loading, setLoading] = useState(false);

  // GPS Auto-Detection
  const detectGpsLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus(isTamil ? 'உலாவி GPS ஆதரிக்கவில்லை' : 'GPS not supported by your browser');
      return;
    }
    setLocating(true);
    setLocationStatus(isTamil ? 'GPS கண்டறியப்படுகிறது...' : 'Detecting your GPS location...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ latitude, longitude });
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=12&addressdetails=1`);
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const city = addr.city || addr.town || addr.county || addr.state_district || addr.district || '';
            if (city) {
              if (DISTRICTS.includes(city)) {
                setDistrict(city);
              } else {
                setDistrict('Other');
                setCustomArea(city);
              }
              setLocationStatus(`📍 ${city} (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`);
            } else {
              setLocationStatus(`📍 GPS: ${latitude.toFixed(3)}, ${longitude.toFixed(3)}`);
            }
          } else {
            setLocationStatus(`📍 GPS: ${latitude.toFixed(3)}, ${longitude.toFixed(3)}`);
          }
        } catch {
          setLocationStatus(`📍 GPS: ${latitude.toFixed(3)}, ${longitude.toFixed(3)}`);
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        setLocationStatus(isTamil ? 'GPS கிடைக்கவில்லை, மாவட்டத்தை தேர்ந்தெடுக்கவும்' : 'GPS unavailable, select your district manually');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    let isMounted = true;
    async function fetchCrops() {
      try {
        const res = await api.getCrops();
        if (isMounted && res.status === 'success' && res.crops && res.crops.length > 0) {
          const names = res.crops.map(c => typeof c === 'string' ? c : (c.name || 'Paddy'));
          setCropList(names);
          setForm(f => ({ ...f, crop: f.crop || names[0] }));
        }
      } catch (err) {
        console.warn('Could not fetch crops from API, using default list:', err);
      }
    }
    fetchCrops();
    return () => { isMounted = false; };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.landArea || !form.quantity) return;
    setLoading(true);

    const effectiveDistrict = district === 'Other' && customArea ? customArea : district;
    const effectiveState = DISTRICT_STATE_MAP[effectiveDistrict] || state.farmerUser?.state || 'Maharashtra';

    setTimeout(() => {
      update({
        selectedCrop: {
          ...form,
          district: effectiveDistrict,
          area: effectiveDistrict,
          state: effectiveState,
          latitude: coords?.latitude || null,
          longitude: coords?.longitude || null,
        },
        selectedCenter: null,
        recommendedCenter: null,
        slot: null,
        feePaid: false
      });
      navigate('/farmer-dashboard/recommended-centers');
    }, 1400);
  };

  return (
    <div className="max-w-xl mx-auto w-full pb-8 flex flex-col gap-6">
      <div className="px-2">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-field-900 tracking-tight">{ac.title || 'Add crop details'}</h2>
        <p className="mt-2 text-base text-soil-600 font-medium">{ac.subtitle || 'Tell us about your harvest so we can find the right procurement center.'}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-3xl border border-husk-200 bg-husk-100 p-6 sm:p-8 shadow-sm hover-lift">
        
        {/* Large Crop Select */}
        <div className="flex flex-col gap-2">
          <label className="text-base font-bold text-soil-800">{ac.selectCrop || 'Select crop'}</label>
          <div className="relative">
            <select
              value={form.crop}
              onChange={(e) => setForm({ ...form, crop: e.target.value })}
              className="w-full appearance-none rounded-xl border-2 border-husk-200 bg-husk-50 px-4 py-4 text-lg font-semibold text-field-900 outline-none focus:border-field-600 focus:bg-husk-100 transition-all"
            >
              {cropList.map((c) => {
                const name = typeof c === 'string' ? c : (c.name || 'Paddy');
                return (
                  <option key={name} value={name}>
                    {isTamil ? (CROP_TAMIL[name] || name) : name}
                  </option>
                );
              })}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-soil-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        {/* Large Number Inputs */}
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-base font-bold text-soil-800">{ac.landArea || 'Land area (acres)'}</label>
            <input
              type="number"
              step="0.1"
              value={form.landArea}
              onChange={(e) => setForm({ ...form, landArea: e.target.value })}
              className="w-full rounded-xl border-2 border-husk-200 bg-husk-50 px-4 py-4 text-lg font-semibold text-field-900 outline-none focus:border-field-600 focus:bg-husk-100 transition-all"
              placeholder="e.g. 3.5"
            />
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-base font-bold text-soil-800">{ac.expectedQty || 'Expected quantity (qtl)'}</label>
            <input
              type="number"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="w-full rounded-xl border-2 border-husk-200 bg-husk-50 px-4 py-4 text-lg font-semibold text-field-900 outline-none focus:border-field-600 focus:bg-husk-100 transition-all"
              placeholder="e.g. 120"
            />
          </div>
        </div>

        {/* Large Date Inputs */}
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-base font-bold text-soil-800">{ac.expectedHarvestDate || 'Expected harvest date'}</label>
            <input
              type="date"
              value={form.harvestDate}
              onChange={(e) => setForm({ ...form, harvestDate: e.target.value })}
              className="w-full rounded-xl border-2 border-husk-200 bg-husk-50 px-4 py-4 text-base font-semibold text-field-900 outline-none focus:border-field-600 focus:bg-husk-100 transition-all"
            />
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-base font-bold text-soil-800">{ac.preferredArrivalDate || 'Preferred arrival date'}</label>
            <input
              type="date"
              value={form.arrivalDate}
              onChange={(e) => setForm({ ...form, arrivalDate: e.target.value })}
              className="w-full rounded-xl border-2 border-husk-200 bg-husk-50 px-4 py-4 text-base font-semibold text-field-900 outline-none focus:border-field-600 focus:bg-husk-100 transition-all"
            />
          </div>
        </div>

        {/* Farmer Area & GPS Location Section */}
        <div className="rounded-2xl border-2 border-field-200 bg-field-50/50 p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-field-800">
                📍 {isTamil ? 'உங்கள் பகுதி / கொள்முதல் இருப்பிடம்' : 'Your Area / Location'}
              </span>
              <p className="text-xs text-soil-500 font-medium">
                {isTamil ? 'அருகிலுள்ள மையத்தை பரிந்துரைக்க உங்கள் பகுதியை தேர்ந்தெடுக்கவும்' : 'AI will find the APMC centres closest to this area'}
              </p>
            </div>
            
            {/* GPS Auto-Detect Button */}
            <button
              type="button"
              onClick={detectGpsLocation}
              disabled={locating}
              className="inline-flex items-center gap-2 rounded-xl bg-field-700 hover:bg-field-800 text-white px-3.5 py-2 text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              {locating ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {isTamil ? 'கண்டறியப்படுகிறது...' : 'Detecting GPS...'}
                </>
              ) : (
                <>
                  <span>📍</span>
                  {isTamil ? 'தற்போதைய GPS இருப்பிடம்' : 'Auto-Detect Current GPS'}
                </>
              )}
            </button>
          </div>

          {locationStatus && (
            <div className="rounded-xl bg-white/80 border border-field-200 px-3.5 py-2 text-xs font-semibold text-field-900 flex items-center gap-2">
              <span>{locationStatus}</span>
            </div>
          )}

          {/* District Selector & Custom Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-soil-700">{isTamil ? 'மாவட்டம்' : 'District / Region'}</label>
              <select
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value);
                  setCoords(null);
                  setLocationStatus(`📍 Selected: ${e.target.value}`);
                }}
                className="w-full rounded-xl border border-husk-200 bg-white px-3.5 py-3 text-sm font-semibold text-field-900 outline-none focus:border-field-600 transition-all"
              >
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {district === 'Other' ? (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-soil-700">{isTamil ? 'உங்கள் பகுதி/நகரம்' : 'City / Area Name'}</label>
                <input
                  type="text"
                  value={customArea}
                  onChange={(e) => {
                    setCustomArea(e.target.value);
                    setLocationStatus(`📍 ${e.target.value}`);
                  }}
                  placeholder="e.g. Pollachi, Sulur, Kinathukadavu"
                  className="w-full rounded-xl border border-husk-200 bg-white px-3.5 py-3 text-sm font-semibold text-field-900 outline-none focus:border-field-600 transition-all"
                />
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 justify-center">
                <span className="text-xs font-bold text-soil-500">{isTamil ? 'செயலில் உள்ள பகுதி' : 'Selected Area'}</span>
                <span className="text-sm font-bold text-field-800 bg-white px-3 py-2.5 rounded-xl border border-field-100">
                  📍 {district} {coords ? `(${coords.latitude.toFixed(2)}° N, ${coords.longitude.toFixed(2)}° E)` : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-xl bg-field-800 px-6 py-5 text-lg font-bold text-husk-50 shadow-md hover:bg-field-900 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-95 flex justify-center items-center gap-3"
        >
          {loading ? (
             <>
               <span className="h-6 w-6 animate-spin rounded-full border-4 border-husk-50 border-t-transparent" />
               {ac.finding || 'Finding centers…'}
             </>
          ) : (
             ac.findBtn || 'Find best procurement centers'
          )}
        </button>
      </form>

      {/* Friendly AI Loading Overlay/Alert */}
      {loading && (
        <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-field-200 bg-field-50 p-6 text-center animate-pulse">
          <div className="h-12 w-12 bg-field-100 text-field-800 rounded-full flex items-center justify-center">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
          </div>
          <p className="text-lg font-bold text-field-900">{ac.aiAnalyzing || 'AI is analyzing nearby procurement centers…'}</p>
        </div>
      )}
    </div>
  );
}
