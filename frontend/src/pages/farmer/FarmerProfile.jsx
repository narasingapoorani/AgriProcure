import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../data/translations';
import { 
  User, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Building2, 
  Calendar, 
  CreditCard, 
  Clock, 
  Sprout, 
  Download, 
  CheckCircle2, 
  FileText,
  TrendingUp
} from 'lucide-react';

import api from '../../services/api';

const CROP_TAMIL_MAP = {
  Wheat: 'கோதுமை',
  Paddy: 'நெல்',
  'Paddy (Rice)': 'நெல் (Paddy Rice)',
  Maize: 'மக்காச்சோளம்',
  Cotton: 'பருத்தி',
  Sugarcane: 'கரும்பு',
  Pulses: 'பருப்பு வகைகள்',
  'Gram (Chana)': 'சுண்டல்',
  Mustard: 'கடுகு',
  Soybean: 'சோயாபீன்',
  Groundnut: 'நிலக்கடலை',
  Tomato: 'தக்காளி',
  Onion: 'வெங்காயம்',
  Potato: 'உருளைக்கிழங்கு',
  Brinjal: 'கத்தரிக்காய்'
};

export default function FarmerProfile() {
  const { state } = useApp();
  const t = getTranslation(state.language);
  const isTamil = state.language === 'Tamil';
  const u = state.farmerUser || {};
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'history'
  const [history, setHistory] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [farmerData, setFarmerData] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoadingHistory(true);
        const [histRes, dashRes] = await Promise.allSettled([
          api.getFarmerHistory(state.farmerUser?.id),
          api.getFarmerDashboard(state.farmerUser?.id)
        ]);

        if (histRes.status === 'fulfilled' && histRes.value?.status === 'success') {
          setHistory(histRes.value.history || []);
          setUpcoming(histRes.value.upcoming || []);
        }
        if (dashRes.status === 'fulfilled' && dashRes.value?.status === 'success' && dashRes.value.farmer) {
          // Only adopt fetched farmer if it matches state.farmerUser id, or if state has no id yet
          if (!state.farmerUser?.id || dashRes.value.farmer.id === state.farmerUser.id) {
            setFarmerData(dashRes.value.farmer);
          }
        }
      } catch (err) {
        console.warn('Live farmer profile data error:', err);
      } finally {
        setLoadingHistory(false);
      }
    }
    fetchData();
  }, [state.farmerUser?.id]);

  // Combine authenticated state.farmerUser (highest priority for user-entered registration data)
  // with backend database farmerData
  const f = (farmerData && (!u.id || farmerData.id === u.id)) ? { ...farmerData, ...u } : u;
  const fp = f.farmer_profile || farmerData?.farmer_profile || u.farmer_profile || {};

  const rawFarmerName = u.full_name || u.name || f.full_name || f.name || '';
  const isDefaultDemoUser = (u.id === 1 || u.username === 'farmer1') && (!rawFarmerName || rawFarmerName === 'farmer1' || /^\+?\d[\d\s-]{7,15}$/.test(rawFarmerName.trim()));
  const farmerName = isDefaultDemoUser
    ? (isTamil ? 'ரமேஷ் கிசான் பாட்டீல்' : 'Ramesh Kisan Patil')
    : (rawFarmerName || (isTamil ? 'விவசாயி' : 'Farmer'));

  const farmerPhone = u.mobile_number || u.mobile || u.phone || f.mobile_number || f.phone || '9876543210';
  const farmerDistrict = u.district || fp.district || f.district || (isTamil ? 'கோயம்புத்தூர்' : 'Coimbatore');
  const farmerState = u.state || fp.state || f.state || (isTamil ? 'தமிழ்நாடு' : 'Tamil Nadu');
  const farmerAadhaar = u.aadhaar_number || u.aadhaar || f.aadhaar_number || f.aadhaar || '1234-5678-9012';
  const farmerLandArea = u.landArea || u.land_area || fp.land_area_acres || f.landArea || '4.5';
  const farmerLandLocation = u.landLocation || u.address || fp.address || f.landLocation || `${farmerDistrict}, ${farmerState}`;
  
  const rawCrop = u.cropDetails || u.primary_crop || fp.primary_crop || f.cropDetails || state.selectedCrop?.crop || 'Wheat';
  const farmerPrimaryCrop = (isTamil && CROP_TAMIL_MAP[rawCrop]) ? CROP_TAMIL_MAP[rawCrop] : rawCrop;

  const resolvedId = u.id || f.id;
  const farmerCode = `APMC-FMR-${resolvedId ? String(resolvedId).padStart(4, '0') : '0001'}`;

  // Calculate live total disbursed strictly from completed procurements
  const totalDisbursedAmount = history.reduce((sum, item) => {
    const rawVal = item.mspAmount != null ? Number(item.mspAmount) : (item.mspPaid ? Number(String(item.mspPaid).replace(/[^0-9.]/g, '')) : 0);
    return sum + (rawVal || 0);
  }, 0);

  return (
    <div className="max-w-4xl mx-auto w-full pb-12 flex flex-col gap-6">

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-field-900 via-field-800 to-field-700 px-8 py-8 shadow-xl text-white ai-glow">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center font-display text-2xl font-black text-white shadow-inner">
              {farmerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-0.5 rounded-full text-xs font-semibold text-field-100 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-ok-400" />
                {isTamil ? 'அரசு சரிபார்க்கப்பட்ட விவசாயி' : `Govt. Verified Farmer ID: ${farmerCode}`}
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {farmerName}
              </h2>
              <p className="text-field-100 text-sm font-medium flex items-center gap-2 mt-0.5">
                <MapPin className="w-4 h-4 text-field-200 shrink-0" />
                {farmerDistrict}, {farmerState}
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-2 bg-white/10 rounded-2xl p-4 border border-white/15">
            <span className="text-xs uppercase tracking-wider text-field-200 font-semibold">
              {isTamil ? 'மொத்த கொள்முதல் வரவு' : 'Total MSP Disbursed'}
            </span>
            <span className="font-display text-2xl font-black tracking-tight text-white">
              ₹ {totalDisbursedAmount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 flex gap-3 border-t border-white/15 pt-4">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'profile'
                ? 'bg-husk-100 text-field-900 shadow-md'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            {isTamil ? 'விவசாயி விவரங்கள்' : 'Farmer Details'}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'history'
                ? 'bg-husk-100 text-field-900 shadow-md'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            {isTamil ? 'கொள்முதல் பதிவுகள்' : 'Procurement Records'}
            <span className="bg-field-700 text-white text-[11px] font-bold px-2 py-0.5 rounded-full ml-1">
              {history.length + upcoming.length}
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: Profile & Land Details */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
          
          {/* Card: Personal & Contact Information */}
          <div className="rounded-3xl border border-husk-200 bg-husk-100 p-6 sm:p-7 shadow-sm hover-lift">
            <div className="flex items-center gap-3 pb-4 border-b border-husk-200 mb-5">
              <div className="w-10 h-10 rounded-xl bg-field-100 text-field-800 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-field-900">
                  {isTamil ? 'தனிப்பட்ட & தொடர்பு விவரங்கள்' : 'Personal & Contact Info'}
                </h3>
                <p className="text-xs text-soil-500 font-medium">
                  {isTamil ? 'ஆதார் & வங்கிக் கணக்கு சரிபார்க்கப்பட்டது' : 'Aadhaar & Bank Account Verified'}
                </p>
              </div>
            </div>

            <dl className="flex flex-col gap-4 text-sm">
              <div className="flex justify-between items-center py-1">
                <dt className="text-soil-600 font-medium">{isTamil ? 'முழு பெயர்' : 'Full Name'}</dt>
                <dd className="font-bold text-field-900">{farmerName}</dd>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-husk-100">
                <dt className="text-soil-600 font-medium">{isTamil ? 'அலைபேசி எண் (WhatsApp)' : 'Mobile (WhatsApp)'}</dt>
                <dd className="font-bold text-field-900 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-field-700" />
                  {farmerPhone}
                </dd>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-husk-100">
                <dt className="text-soil-600 font-medium">{isTamil ? 'ஆதார் எண்' : 'Aadhaar Card'}</dt>
                <dd className="font-bold text-field-900 font-data">{farmerAadhaar}</dd>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-husk-100">
                <dt className="text-soil-600 font-medium">{isTamil ? 'மாவட்ட நிர்வாகம்' : 'District'}</dt>
                <dd className="font-bold text-field-900">{farmerDistrict}</dd>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-husk-100">
                <dt className="text-soil-600 font-medium">{isTamil ? 'மாநிலம்' : 'State'}</dt>
                <dd className="font-bold text-field-900">{farmerState}</dd>
              </div>
            </dl>
          </div>

          {/* Card: Land & Crop Holdings */}
          <div className="rounded-3xl border border-husk-200 bg-husk-100 p-6 sm:p-7 shadow-sm hover-lift">
            <div className="flex items-center gap-3 pb-4 border-b border-husk-200 mb-5">
              <div className="w-10 h-10 rounded-xl bg-harvest-100 text-harvest-800 flex items-center justify-center">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-field-900">
                  {isTamil ? 'நிலம் & பயிர் உரிமம்' : 'Land & Farm Details'}
                </h3>
                <p className="text-xs text-soil-500 font-medium">
                  {isTamil ? 'வருவாய்த்துறை நில வரைபடம் சரிபார்க்கப்பட்டது' : 'Revenue Patta / Chitta Verified'}
                </p>
              </div>
            </div>

            <dl className="flex flex-col gap-4 text-sm">
              <div className="flex justify-between items-center py-1">
                <dt className="text-soil-600 font-medium">{isTamil ? 'நிலப்பரப்பு' : 'Land Area'}</dt>
                <dd className="font-bold text-field-900">{farmerLandArea} {isTamil ? 'ஏக்கர்' : 'Acres'}</dd>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-husk-100">
                <dt className="text-soil-600 font-medium">{isTamil ? 'சர்வே எண் & இடம்' : 'Survey No. & Location'}</dt>
                <dd className="font-bold text-field-900 text-right max-w-[260px] truncate" title={farmerLandLocation}>{farmerLandLocation}</dd>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-husk-100">
                <dt className="text-soil-600 font-medium">{isTamil ? 'முக்கிய பயிர்கள்' : 'Primary Crops'}</dt>
                <dd className="font-bold text-field-900">{farmerPrimaryCrop}</dd>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-husk-100">
                <dt className="text-soil-600 font-medium">{isTamil ? 'பாசன முறை' : 'Irrigation'}</dt>
                <dd className="font-bold text-field-900">{isTamil ? 'கிணறு & கால்வாய்' : 'Canal & Borewell'}</dd>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-husk-100">
                <dt className="text-soil-600 font-medium">{isTamil ? 'வங்கி கணக்கு நிலை' : 'Direct MSP Bank'}</dt>
                <dd className="font-bold text-field-800 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-ok-600" />
                  {isTamil ? 'இணைக்கப்பட்டுள்ளது' : 'Linked DBT Account'}
                </dd>
              </div>
            </dl>
          </div>

        </div>
      )}

      {/* TAB 2: Procurement Records (Upcoming & Completed) */}
      {activeTab === 'history' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          
          <div className="flex items-center justify-between px-2">
            <div>
              <h3 className="font-display text-xl font-bold text-field-900">
                {isTamil ? 'கொள்முதல் விவரங்கள் & MSP நிலவரம்' : 'Procurement Records & MSP Status'}
              </h3>
              <p className="text-sm text-soil-600">
                {isTamil ? 'வரவிருக்கும் முன்பதிவுகள் மற்றும் நிறைவடைந்த கொள்முதல் வரலாறு' : 'Track scheduled upcoming lots and completed government procurement history'}
              </p>
            </div>
            {history.length > 0 && (
              <button
                onClick={() => window.print()}
                className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-husk-300 bg-husk-100 px-4 py-2 text-xs font-bold text-soil-800 shadow-sm hover:bg-husk-50 transition"
              >
                <Download className="w-3.5 h-3.5 text-field-700" />
                {isTamil ? 'அனைத்தையும் அச்சிடுக' : 'Download All Statements'}
              </button>
            )}
          </div>

          {/* SECTION A: Upcoming Procurement Bookings */}
          {upcoming.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 px-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                <h4 className="font-display text-base font-bold text-field-900">
                  {isTamil ? 'வரவிருக்கும் முன்பதிவுகள் (மையத்திற்கு வருகை புரியவும்)' : 'Upcoming Scheduled Bookings (Awaiting Centre Arrival)'}
                </h4>
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-full">
                  {upcoming.length}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {upcoming.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-3xl border border-blue-200 bg-blue-50/40 p-6 shadow-sm hover-lift flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-200">
                        {item.token}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-display font-bold text-field-900 text-lg">
                            {isTamil ? item.cropTa : item.crop}
                          </h4>
                          <span className="rounded-full bg-blue-100 border border-blue-300 text-blue-900 px-2.5 py-0.5 text-xs font-bold flex items-center gap-1">
                            <span>🗓️</span>
                            {isTamil ? 'வரவிருக்கும்' : 'Upcoming'}
                          </span>
                          <span className="text-xs text-blue-800 font-semibold bg-white/70 px-2 py-0.5 rounded-md border border-blue-100">
                            {item.time_slot || '09:00 - 10:00'}
                          </span>
                        </div>
                        <p className="text-xs text-soil-600 mt-1 flex items-center gap-1.5 font-medium">
                          <span>📍 {isTamil ? item.centerTa : item.center}</span>
                          <span>•</span>
                          <span>🗓️ {isTamil ? item.dateTa : item.date}</span>
                        </p>
                        <p className="mt-2 text-xs text-soil-500 font-medium">
                          {isTamil 
                            ? 'விவசாயி மையத்திற்கு சென்று தானியங்களை ஒப்படைத்தவுடன், நிலை நிறைவடைந்தது என மாற்றப்படும்.'
                            : 'Status will update to Completed once the farmer arrives at the centre and finishes inspection & weighing.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 border-blue-100 pt-3 md:pt-0 gap-2 shrink-0">
                      <div className="text-left md:text-right">
                        <span className="text-[11px] text-soil-500 font-semibold block uppercase tracking-wider">
                          {isTamil ? 'மதிப்பிடப்பட்ட MSP வரவு' : 'Estimated MSP Value'}
                        </span>
                        <span className="font-display text-xl font-bold text-blue-950">
                          ₹ {item.mspPaid}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-blue-700 bg-blue-100/60 px-2.5 py-1 rounded-lg border border-blue-200">
                        {isTamil ? 'கட்டணம்: நிலுவையில்' : 'Payment: Pending Arrival'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION B: Past Completed Procurements */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 px-1">
              <span className="w-2.5 h-2.5 rounded-full bg-ok-600"></span>
              <h4 className="font-display text-base font-bold text-field-900">
                {isTamil ? 'நிறைவடைந்த கொள்முதல் வரலாறு' : 'Completed Procurement History'}
              </h4>
              <span className="bg-ok-100 text-ok-800 text-xs font-bold px-2 py-0.5 rounded-full">
                {history.length}
              </span>
            </div>

            {history.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-husk-300 bg-husk-100 p-8 text-center">
                <p className="font-bold text-field-900 text-sm">
                  {isTamil ? 'நிறைவடைந்த கொள்முதல் ஏதும் இல்லை' : 'No Completed Procurements Yet'}
                </p>
                <p className="text-xs text-soil-500 mt-1">
                  {isTamil 
                    ? 'முன்பதிவு செய்யப்பட்ட தானியங்கள் மையத்தில் சரிபார்க்கப்பட்டு வழங்கப்பட்டவுடன் இங்கு பட்டியலிடப்படும்.'
                    : 'Your scheduled bookings will move here as Completed once you arrive at the centre and final MSP payout is initiated.'}
                </p>
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl border border-husk-200 bg-husk-100 p-6 shadow-sm hover-lift flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-field-100 text-field-800 flex items-center justify-center font-bold text-sm shrink-0">
                      {item.token}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-bold text-field-900 text-lg">
                          {isTamil ? item.cropTa : item.crop}
                        </h4>
                        <span className="rounded-full bg-ok-100 text-field-800 px-2.5 py-0.5 text-xs font-semibold">
                          {isTamil ? item.statusTa : item.status}
                        </span>
                      </div>
                      <p className="text-xs text-soil-500 mt-0.5">
                        📍 {isTamil ? item.centerTa : item.center} • 🗓️ {isTamil ? item.dateTa : item.date}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-soil-600 font-medium">
                        <span>⚖️ {isTamil ? item.quantityTa : item.quantity}</span>
                        <span>•</span>
                        <span>🧪 {isTamil ? item.gradeTa : item.grade}</span>
                        <span>•</span>
                        <span>💧 {item.moisture}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 border-husk-100 pt-3 md:pt-0 gap-2">
                    <div className="text-left md:text-right">
                      <span className="text-[11px] text-soil-500 font-semibold block uppercase tracking-wider">
                        {isTamil ? 'வழங்கப்பட்ட MSP தொகை' : 'MSP Amount Credited'}
                      </span>
                      <span className="font-display text-xl font-bold text-field-900">
                        ₹ {item.mspPaid}
                      </span>
                    </div>
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-1 text-xs font-bold text-field-700 hover:text-field-900 underline"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      {isTamil ? 'ரசீது' : 'Official Receipt'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

    </div>
  );
}
