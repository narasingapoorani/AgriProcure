import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../data/translations';
import { getDynamicCenterName } from '../../services/aiTranslation';
import GatePassModal from '../../components/GatePassModal';
import api from '../../services/api';

const CENTER_TAMIL = {
  'Tirunelveli Procurement Center': 'திருநெல்வேலி கொள்முதல் மையம்',
  'Palayamkottai Procurement Center': 'பாளையங்கோட்டை கொள்முதல் மையம்',
  'Ambasamudram Procurement Center': 'அம்பாசமுத்திரம் கொள்முதல் மையம்',
  'Cheranmahadevi Center': 'சேரன்மகாதேவி மையம்',
};

const CROP_TAMIL = {
  Paddy: 'நெல்',
  'Paddy (Rice)': 'நெல் (Paddy Rice)',
  Wheat: 'கோதுமை',
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
  Brinjal: 'கத்தரிக்காய்',
};

// Step definitions
function getFlowStep(state) {
  if (!state.selectedCrop) return 0;         // No crop yet
  if (!state.selectedCenter) return 1;       // Crop added, find centers
  if (!state.slot) return 2;                 // Center selected, book slot
  if (!state.feePaid) return 3;             // Slot booked, pay
  return 4;                                  // All done — token ready
}

export default function FarmerHome() {
  const { state, update } = useApp();
  const t = getTranslation(state.language);
  const fh = t.farmerHome;
  const isTamil = state.language === 'Tamil';
  const [showGatePass, setShowGatePass] = useState(false);

  // Synchronize live farmer booking from database
  useEffect(() => {
    let isMounted = true;
    async function syncDashboard() {
      try {
        const farmerId = state.farmerUser?.id;
        const res = await api.getFarmerDashboard(farmerId);
        if (isMounted && res.status === 'success') {
          if (res.active_token) {
            if (farmerId && res.farmer?.id && res.farmer.id !== farmerId) return;
            const act = res.active_token;
            if (farmerId && act.farmer_id && act.farmer_id !== farmerId) {
              update({
                selectedCrop: null,
                selectedCenter: null,
                recommendedCenter: null,
                slot: null,
                feePaid: false,
              });
              return;
            }
            const isPaid = act.payment_status === 'Success' || act.payment_status === 'Completed' || act.status === 'Completed';
            const isCheckedIn = Boolean(act.checked_in_at || act.status === 'Checked-in');
            update({
              selectedCrop: {
                crop: act.crop_name,
                quantity: act.quantity,
                landArea: act.land_area,
                arrivalDate: act.booking_date,
              },
              selectedCenter: {
                id: act.centre_id,
                name: act.centre_name,
              },
              slot: {
                token: act.token_number,
                time: act.time_slot,
                date: act.booking_date,
                bookingId: act.id,
                bookingFarmerId: act.farmer_id,
                qrCodeData: act.qr_code_data,
                status: act.status,
                checkedInAt: act.checked_in_at,
                isCheckedIn: isCheckedIn,
                currentStage: act.current_stage,
                waitMin: act.estimated_wait_minutes,
              },
              feePaid: isPaid,
            });
          } else {
            // This authenticated farmer has no active booking in the DB.
            // Ensure no leftover slot or center from another browser session remains.
            if (state.slot || state.selectedCenter || state.feePaid) {
              update({
                selectedCrop: null,
                selectedCenter: null,
                recommendedCenter: null,
                slot: null,
                feePaid: false,
              });
            }
          }
        }
      } catch (err) {
        console.warn('Live farmer dashboard sync note:', err);
      }
    }
    syncDashboard();
    return () => { isMounted = false; };
  }, [state.farmerUser?.id]);

  const step = getFlowStep(state);

  const cropName = isTamil
    ? (CROP_TAMIL[state.selectedCrop?.crop] || state.selectedCrop?.crop || '')
    : (state.selectedCrop?.crop || '');

  const centerName = getDynamicCenterName(state.selectedCenter?.name || '', state.language);

  const tokenNumber = state.slot?.token || 'T-101';

  // Step labels for progress bar
  const steps = [
    { en: 'Add Crop', ta: 'பயிர் சேர்க்க' },
    { en: 'Find Center', ta: 'மையம் தேர்வு' },
    { en: 'Book Slot', ta: 'முன்பதிவு' },
    { en: 'Payment', ta: 'கட்டணம்' },
    { en: 'Token Ready', ta: 'டோக்கன் தயார்' },
  ];

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-3xl mx-auto w-full pb-8">

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-field-900 via-field-800 to-field-700 px-8 py-10 shadow-xl text-white ai-glow">
        <div className="absolute top-0 right-0 opacity-10">
          <svg className="w-60 h-60 -mr-10 -mt-10" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 8C8 10 5.9 16.17 3.82 19.4L5.71 21l1-1.3A4.49 4.49 0 008 20c4-4 8-3 12-5 1.5-.67 3-2 2-4s-2.5-3-5-3z"/>
          </svg>
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 text-field-100">
            🌾 {isTamil ? 'அரசு நேரடி கொள்முதல் தளம்' : 'Govt Direct Procurement Platform'}
          </div>
          {(() => {
            const raw = state.farmerUser?.full_name || state.farmerUser?.name || '';
            const isDefaultDemo = (state.farmerUser?.id === 1 || state.farmerUser?.username === 'farmer1') && (!raw || /^\+?\d[\d\s-]{7,15}$/.test(raw.trim()) || raw === 'farmer1');
            const displayName = isDefaultDemo
              ? (isTamil ? 'ரமேஷ் கிசான் பாட்டீல்' : 'Ramesh Kisan Patil')
              : (raw || (isTamil ? 'விவசாயி' : 'Farmer'));
            return (
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
                {fh.welcome}, {displayName}!
              </h2>
            );
          })()}
          <p className="text-field-100 font-medium text-base sm:text-lg max-w-lg">{fh.subtitle}</p>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="rounded-2xl border border-husk-200 bg-husk-100 px-6 py-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-soil-500 mb-4">
          {isTamil ? 'உங்கள் முன்னேற்றம்' : 'Your Progress'} — {isTamil ? steps[step].ta : steps[step].en}
        </p>
        <div className="flex items-center gap-1">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  i < step
                    ? 'bg-field-800 border-field-800 text-white'
                    : i === step
                    ? 'bg-husk-100 border-field-700 text-field-900 shadow-md ring-2 ring-field-300'
                    : 'bg-husk-50 border-husk-300 text-soil-400'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <p className={`mt-1 text-[10px] font-semibold text-center leading-tight ${
                  i <= step ? 'text-field-800' : 'text-soil-400'
                }`}>
                  {isTamil ? s.ta : s.en}
                </p>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-0.5 flex-1 mx-1 rounded-full transition-all ${i < step ? 'bg-field-700' : 'bg-husk-300'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Step 0: No crop ── */}
      {step === 0 && (
        <div className="rounded-3xl border-2 border-dashed border-field-400 bg-husk-100 p-8 sm:p-12 text-center flex flex-col items-center shadow-sm hover-lift">
          <div className="h-20 w-20 bg-field-100 text-field-800 rounded-full flex items-center justify-center mb-5 shadow-inner text-4xl">
            🌱
          </div>
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-field-900">
            {isTamil ? 'உங்கள் பயிரை சேர்க்கவும்!' : 'Add Your Crop to Begin!'}
          </h3>
          <p className="mt-2.5 text-base text-soil-600 max-w-md">
            {isTamil
              ? 'கொள்முதல் மையங்களை பரிந்துரைக்க, உங்கள் பயிர் விவரங்களை பதிவு செய்யுங்கள்.'
              : 'Register your crop details and we will recommend the best procurement centers near you.'}
          </p>
          <Link
            to="/farmer-dashboard/add-crop"
            className="mt-8 inline-flex justify-center items-center gap-2 rounded-2xl bg-field-800 px-10 py-4 text-lg font-bold text-white shadow-md hover:bg-field-900 hover:shadow-lg transition-all active:scale-95 ai-glow"
          >
            🌾 {isTamil ? 'பயிர் சேர்க்க' : 'Add Crop'}
          </Link>
        </div>
      )}

      {/* ── Step 1: Crop added, no center ── */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-field-200 bg-field-50/50 p-5 flex items-center gap-4">
            <div className="h-12 w-12 bg-field-100 rounded-full flex items-center justify-center text-2xl shrink-0">🌾</div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-soil-500">{isTamil ? 'சேர்க்கப்பட்ட பயிர்' : 'Crop Added'}</p>
              <p className="font-display text-xl font-bold text-field-900">{cropName}</p>
              <p className="text-sm text-soil-600">
                {state.selectedCrop?.quantity} {isTamil ? 'குவிண்டால்' : 'Quintals'} • 📍 {state.selectedCrop?.area || state.selectedCrop?.district || state.farmerUser?.district || 'Your Area'}
              </p>
            </div>
            <span className="ml-auto bg-ok-100 text-field-800 text-xs font-bold px-3 py-1 rounded-full">✓ {isTamil ? 'சேர்க்கப்பட்டது' : 'Added'}</span>
          </div>

          <div className="rounded-3xl border-2 border-dashed border-harvest-400 bg-harvest-50/40 p-8 text-center flex flex-col items-center hover-lift">
            <div className="text-4xl mb-4">🗺️</div>
            <h3 className="font-display text-2xl font-bold text-soil-900">
              {isTamil ? 'பரிந்துரைக்கப்பட்ட மையங்களை காணுங்கள்' : 'Find Recommended Centers'}
            </h3>
            <p className="mt-2 text-base text-soil-600 max-w-md">
              {isTamil
                ? 'உங்கள் பயிருக்கு பொருத்தமான அருகில் உள்ள கொள்முதல் மையங்களை AI பரிந்துரைக்கிறது.'
                : 'AI recommends the best nearby procurement centers based on your crop and quantity.'}
            </p>
            <Link
              to="/farmer-dashboard/recommended-centers"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-harvest-600 px-10 py-4 text-lg font-bold text-white shadow-md hover:bg-harvest-700 transition-all active:scale-95"
            >
              🏛️ {isTamil ? 'மையங்களை காண்க' : 'View Recommended Centers'}
            </Link>
          </div>
        </div>
      )}

      {/* ── Step 2: Center selected, no slot ── */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-field-200 bg-field-50/50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-soil-500">🌾 {isTamil ? 'பயிர்' : 'Crop'}</p>
              <p className="font-display text-lg font-bold text-field-900 mt-1">{cropName}</p>
            </div>
            <div className="rounded-2xl border border-field-200 bg-field-50/50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-soil-500">🏛️ {isTamil ? 'மையம்' : 'Center'}</p>
              <p className="font-display text-lg font-bold text-field-900 mt-1">{centerName}</p>
            </div>
          </div>

          <div className="rounded-3xl border-2 border-dashed border-blue-400 bg-blue-50/30 p-8 text-center flex flex-col items-center hover-lift">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="font-display text-2xl font-bold text-soil-900">
              {isTamil ? 'உங்கள் முன்பதிவு நேரத்தை தேர்வு செய்யுங்கள்' : 'Book Your Procurement Slot'}
            </h3>
            <p className="mt-2 text-base text-soil-600 max-w-md">
              {isTamil
                ? 'கொள்முதல் மையத்தில் உங்கள் வரிசை எண்ணை பதிவு செய்யுங்கள்.'
                : 'Reserve your queue number at the procurement center to avoid long waits.'}
            </p>
            <Link
              to="/farmer-dashboard/slot"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-10 py-4 text-lg font-bold text-white shadow-md hover:bg-blue-700 transition-all active:scale-95"
            >
              🎫 {isTamil ? 'முன்பதிவு செய்க' : 'Book Slot Now'}
            </Link>
          </div>
        </div>
      )}

      {/* ── Step 3: Slot booked, no payment ── */}
      {step === 3 && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-field-200 bg-field-50/50 p-4 text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-soil-500">🌾 {isTamil ? 'பயிர்' : 'Crop'}</p>
              <p className="font-bold text-field-900 mt-1 text-sm">{cropName}</p>
            </div>
            <div className="rounded-2xl border border-field-200 bg-field-50/50 p-4 text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-soil-500">🏛️ {isTamil ? 'மையம்' : 'Center'}</p>
              <p className="font-bold text-field-900 mt-1 text-sm truncate">{centerName}</p>
            </div>
            <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-soil-500">🎫 {isTamil ? 'நேரம்' : 'Slot'}</p>
              <p className="font-bold text-field-900 mt-1 text-sm">{state.slot?.time || '10:30 AM'}</p>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-lg hover-lift">
            <div className="bg-gradient-to-r from-field-900 to-field-700 p-6 text-white">
              <div className="inline-flex items-center gap-2 bg-harvest-400/30 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                ⚡ {isTamil ? 'கட்டணம் நிலுவையில் உள்ளது' : 'Payment Required'}
              </div>
              <h3 className="font-display text-2xl font-bold">
                {isTamil ? 'சரிபார்ப்பு கட்டணம் செலுத்துங்கள்' : 'Complete Your Verification Payment'}
              </h3>
              <p className="text-field-100 mt-1 text-sm">
                {isTamil
                  ? 'டோக்கன் உருவாக்க ₹50 சரிபார்ப்பு கட்டணம் செலுத்துங்கள். இது WhatsApp-இல் அனுப்பப்படும்.'
                  : 'Pay ₹50 verification fee to generate your procurement token. It will be sent to your WhatsApp.'}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-field-200 text-xs">{isTamil ? 'செலுத்த வேண்டிய தொகை' : 'Amount Due'}</p>
                  <p className="font-display text-4xl font-black">₹ 50</p>
                </div>
                <Link
                  to="/farmer-dashboard/payments"
                  className="inline-flex items-center gap-2 bg-harvest-400 hover:bg-harvest-500 text-soil-900 font-bold rounded-2xl px-8 py-4 text-lg transition-all active:scale-95 shadow-lg"
                >
                  💳 {isTamil ? 'இப்போது கட்டணம் செலுத்துங்கள்' : 'Pay Now'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 4: All done — Token ready ── */}
      {step === 4 && (
        <div className="flex flex-col gap-4">
          {/* Token Hero Card */}
          <div className="rounded-3xl overflow-hidden shadow-xl ai-glow hover-lift">
            <div className="bg-gradient-to-br from-field-900 via-field-800 to-field-700 px-8 py-8 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 bg-ok-400/30 border border-ok-300/30 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                    ✅ {isTamil ? 'கொள்முதல் தயார்!' : 'Procurement Ready!'}
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl font-extrabold">
                    {isTamil ? 'உங்கள் டோக்கன் தயார்!' : 'Your Token is Ready!'}
                  </h3>
                  <p className="text-field-100 mt-1 text-sm max-w-xs">
                    {isTamil
                      ? 'கொள்முதல் மையத்திற்கு 15 நிமிடம் முன்பாக வரவும்.'
                      : 'Please arrive at the center 15 minutes before your slot time.'}
                  </p>
                </div>
                <div className="text-center bg-white/15 backdrop-blur-sm rounded-2xl px-8 py-5 border border-white/20 shrink-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-field-200 mb-1">
                    {isTamil ? 'டோக்கன் எண்' : 'Token No.'}
                  </p>
                  <p className="font-display text-5xl font-black tracking-tight">#{tokenNumber}</p>
                </div>
              </div>

              {/* Slot time info row */}
              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-field-200 font-semibold">{isTamil ? 'நேரம்' : 'Slot Time'}</p>
                  <p className="font-bold text-sm mt-1">{state.slot?.time || '10:30 AM'}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-field-200 font-semibold">{isTamil ? 'தேதி' : 'Date'}</p>
                  <p className="font-bold text-sm mt-1">{state.slot?.date || 'Today'}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-field-200 font-semibold">{isTamil ? 'காத்திரு நேரம்' : 'Est. Wait'}</p>
                  <p className="font-bold text-sm mt-1">{state.slot?.waitMin || 25} {isTamil ? 'நிமி' : 'min'}</p>
                </div>
              </div>

              <div className="mt-4 grid sm:grid-cols-2 gap-3">
                <a
                  href={`https://wa.me/?text=AgriProcure+Token+%23${tokenNumber}+Slot+${state.slot?.time || ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5b] text-white font-bold rounded-xl py-3 px-5 transition-colors shadow"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  {isTamil ? 'WhatsApp டோக்கன்' : 'WhatsApp Token'}
                </a>
                <Link
                  to="/farmer-dashboard/live-queue"
                  className="flex items-center justify-center gap-2 bg-white/15 border border-white/30 hover:bg-white/25 text-white font-bold rounded-xl py-3 px-5 transition-colors"
                >
                  📡 {isTamil ? 'நேரலை வரிசை' : 'Live Queue'}
                </Link>
              </div>
            </div>
          </div>

          {/* Official Gate Check-In QR Pass Card (Persistent until checked-in at procurement centre) */}
          {!state.slot?.isCheckedIn ? (
            <div className="rounded-3xl border-2 border-field-500 bg-white p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6 hover-lift text-left">
              <div className="flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 mb-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>{isTamil ? 'மைய நுழைவு சரிபார்ப்பு நிலுவையில் உள்ளது' : 'Awaiting Gate Arrival Check-In'}</span>
                </div>
                <h4 className="font-display text-xl font-extrabold text-field-900">
                  {isTamil ? 'அதிகாரப்பூர்வ நுழைவு QR பாஸ்' : 'Official Entry Check-In QR Pass'}
                </h4>
                <p className="text-xs text-soil-600 mt-1 max-w-sm leading-relaxed">
                  {isTamil
                    ? 'கொள்முதல் மையத்தின் நுழைவு வாயிலில் இந்த QR குறியீட்டை காண்பித்து செக்-இன் செய்யவும். நீங்கள் மையத்திற்குச் சென்று செக்-இன் செய்யும் வரை இந்த QR கோடு செயலில் இருக்கும்.'
                    : 'Present this QR code at the procurement centre security gate. This QR pass remains active and accessible here until you physically arrive and check in.'}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => setShowGatePass(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-field-800 hover:bg-field-900 text-white text-xs font-bold shadow transition active:scale-95 cursor-pointer"
                  >
                    <span>🎫</span>
                    <span>{isTamil ? 'முழு நுழைவு பாஸை காண்க' : 'View Full Gate Pass'}</span>
                  </button>
                  <Link
                    to="/farmer-dashboard/live-queue"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-husk-100 hover:bg-husk-200 text-field-800 text-xs font-bold border border-husk-300 transition cursor-pointer"
                  >
                    <span>📡</span>
                    <span>{isTamil ? 'நேரலை வரிசை' : 'Live Queue'}</span>
                  </Link>
                </div>
              </div>

              <div className="flex flex-col items-center bg-husk-50 p-3.5 rounded-2xl border-2 border-field-300 shadow-inner shrink-0">
                <div className="w-36 h-36 bg-white rounded-xl border border-gray-200 p-2 flex items-center justify-center shadow-sm">
                  {state.slot?.qrCodeData ? (
                    <img src={state.slot.qrCodeData} alt="Gate QR Code" className="w-full h-full object-contain" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-2">
                      <span className="text-4xl">📱</span>
                      <span className="text-xs font-bold text-field-800 mt-1">#{tokenNumber}</span>
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-mono font-bold text-soil-600 uppercase tracking-wider mt-2">
                  {isTamil ? 'நுழைவு வாயிலில் ஸ்கேன் செய்க' : 'Scan at Center Gate'}
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50/80 p-4 flex items-center justify-between gap-3 text-emerald-900">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div className="text-left">
                  <p className="text-sm font-bold">{isTamil ? 'மைய நுழைவு சரிபார்க்கப்பட்டது' : 'Gate Check-In Verified'}</p>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    {isTamil ? 'உங்கள் டோக்கன் மையத்தில் சரிபார்க்கப்பட்டது. தரம் ஆய்வு தொடங்கப்படுகிறது.' : 'Your QR check-in is complete at the centre. Proceeding to quality inspection.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGatePass(true)}
                className="text-xs font-bold underline text-emerald-800 hover:text-emerald-950 shrink-0 cursor-pointer"
              >
                {isTamil ? 'பாஸை காண்க' : 'View Pass'}
              </button>
            </div>
          )}

          {/* Crop + Center info strip */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-husk-200 bg-husk-100 p-5 hover-lift">
              <p className="text-xs font-bold uppercase tracking-wider text-soil-500">{isTamil ? 'பயிர்' : 'Your Crop'}</p>
              <p className="mt-1.5 font-display text-xl font-bold text-field-900">{cropName}</p>
              <p className="text-sm text-soil-600 mt-0.5">{state.selectedCrop?.quantity} {isTamil ? 'குவிண்டால்' : 'Quintals'}</p>
            </div>
            <div className="rounded-2xl border border-husk-200 bg-husk-100 p-5 hover-lift">
              <p className="text-xs font-bold uppercase tracking-wider text-soil-500">{isTamil ? 'மையம்' : 'Your Center'}</p>
              <p className="mt-1.5 font-display text-xl font-bold text-field-900">{centerName}</p>
              <p className="text-sm text-soil-600 mt-0.5">{state.slot?.date}</p>
            </div>
          </div>
        </div>
      )}

      {/* Printable / Downloadable Official Gate Pass Modal */}
      <GatePassModal
        isOpen={showGatePass}
        onClose={() => setShowGatePass(false)}
        slotData={state.slot}
        centerData={state.selectedCenter}
        cropData={state.selectedCrop}
        qrCodeData={state.slot?.qrCodeData}
      />
    </div>
  );
}
