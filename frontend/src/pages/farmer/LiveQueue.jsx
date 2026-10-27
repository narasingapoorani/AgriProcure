import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../data/translations';
import GatePassModal from '../../components/GatePassModal';
import api from '../../services/api';

export default function LiveQueue() {
  const { state, update } = useApp();
  const { slot, selectedCenter } = state;
  const isTamil = state.language === 'Tamil';

  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGatePass, setShowGatePass] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [activeToken, setActiveToken] = useState(slot?.token || null);

  // Sync token from database if not in state
  useEffect(() => {
    let isMounted = true;
    async function resolveToken() {
      if (slot?.token) {
        setActiveToken(slot.token);
        return;
      }
      try {
        const farmerId = state.farmerUser?.id || 1;
        const dash = await api.getFarmerDashboard(farmerId);
        if (isMounted && dash.status === 'success' && dash.active_token) {
          setActiveToken(dash.active_token.token_number);
          update({
            slot: {
              token: dash.active_token.token_number,
              time: dash.active_token.time_slot,
              date: dash.active_token.booking_date,
              bookingId: dash.active_token.id,
            },
            selectedCenter: {
              id: dash.active_token.centre_id,
              name: dash.active_token.centre_name,
            }
          });
        }
      } catch (err) {
        console.warn('Could not resolve active token:', err);
      }
    }
    resolveToken();
    return () => { isMounted = false; };
  }, [slot?.token, state.farmerUser?.id]);

  async function fetchQueueStatus() {
    if (!activeToken) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await api.getLiveStatus(activeToken);
      if (res.status === 'success') {
        setLiveData(res);
        if (res.qr_code_data) {
          update({
            slot: {
              ...(state.slot || {}),
              qrCodeData: res.qr_code_data,
              isCheckedIn: res.is_checked_in,
              status: res.is_checked_in ? 'Checked-in' : 'Booked',
              checkedInAt: res.checked_in_at,
              token: res.token_number || activeToken
            }
          });
        }
      }
    } catch (err) {
      console.warn('Live queue fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (activeToken) {
      fetchQueueStatus();
      const interval = setInterval(fetchQueueStatus, 15000); // Auto-refresh every 15s
      return () => clearInterval(interval);
    }
  }, [activeToken]);

  const handleGateCheckIn = async () => {
    if (!activeToken) return;
    try {
      setCheckInLoading(true);
      await api.checkIn(activeToken);
      await fetchQueueStatus();
    } catch (err) {
      console.error('Check-in error:', err);
    } finally {
      setCheckInLoading(false);
    }
  };

  if (!activeToken && !loading) {
    return (
      <div className="max-w-xl mx-auto w-full pb-8 flex flex-col items-center text-center p-10 rounded-3xl border border-husk-200 bg-husk-100 shadow-sm my-6">
        <div className="w-20 h-20 rounded-full bg-field-100 text-field-800 flex items-center justify-center text-4xl mb-4">
          🎫
        </div>
        <h2 className="font-display text-2xl font-bold text-field-900 mb-2">
          {isTamil ? 'செயலில் உள்ள வரிசை டோக்கன் இல்லை' : 'No Active Queue Token Found'}
        </h2>
        <p className="text-sm text-soil-600 mb-6 max-w-sm">
          {isTamil 
            ? 'நேரலை வரிசையை கண்காணிக்க, முதலில் உங்கள் பயிர் விவரங்களை பதிவு செய்து முன்பதிவு செய்யுங்கள்.' 
            : 'To track live queue positions and real-time waiting times, please add your crop details and book an APMC slot first.'}
        </p>
        <Link
          to="/farmer-dashboard/add-crop"
          className="rounded-2xl bg-field-800 px-8 py-3.5 text-base font-bold text-white shadow-md hover:bg-field-900 transition active:scale-95"
        >
          🌾 {isTamil ? 'பயிர் விவரங்களை சேர்க்க' : 'Add Crop & Book Slot'}
        </Link>
      </div>
    );
  }

  const queuePos = liveData?.queue_position !== undefined ? liveData.queue_position : 1;
  const farmersAhead = liveData?.farmers_ahead !== undefined ? liveData.farmers_ahead : 0;
  const waitMin = liveData?.estimated_wait_minutes !== undefined ? liveData.estimated_wait_minutes : 0;
  const currentStage = liveData?.current_stage || 'Token Confirmed';
  const isCheckedIn = liveData?.is_checked_in || false;
  const xai = liveData?.explainable_ai;

  return (
    <div className="max-w-xl mx-auto w-full pb-8 flex flex-col gap-6">
      {/* Header */}
      <div className="px-2 flex justify-between items-center">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-field-900 tracking-tight">
            {isTamil ? 'நேரலை வரிசை நிலை' : 'Live Procurement Queue'}
          </h2>
          <p className="mt-1 text-sm font-bold text-field-700">
            {liveData?.centre_name || selectedCenter?.name || 'APMC Procurement Center'}
          </p>
        </div>
        <button
          onClick={fetchQueueStatus}
          disabled={loading}
          className="text-xs font-bold bg-husk-100 hover:bg-husk-200 text-soil-700 px-3 py-2 rounded-xl border border-husk-300 transition-all cursor-pointer"
        >
          {loading ? '⟳ Refreshing...' : '⟳ Refresh'}
        </button>
      </div>

      {/* Main Token Display Card */}
      <div className="rounded-3xl border-2 border-field-500 bg-husk-100 shadow-xl p-8 flex flex-col items-center text-center relative overflow-hidden ai-glow hover-lift">
         <div className="absolute top-0 w-full h-2.5 bg-gradient-to-r from-field-700 via-field-500 to-field-700"></div>

         <div className="flex items-center gap-2 mb-2">
           <span className={`px-3 py-1 rounded-full text-xs font-bold ${
             isCheckedIn ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
           }`}>
             {isCheckedIn ? '✓ Checked-in at Gate' : '⏳ Awaiting Gate Arrival'}
           </span>
           <span className="text-xs font-bold text-soil-500 uppercase tracking-wider">
             Token Number
           </span>
         </div>

         <h1 className="font-display text-6xl sm:text-7xl font-extrabold text-field-900 tracking-tight mb-6">
           #{activeToken}
         </h1>

         <div className="w-full grid grid-cols-2 gap-4 border-t border-husk-200 pt-6">
            <div className="flex flex-col items-center">
               <p className="text-xs font-bold text-soil-500 uppercase tracking-wider mb-1">
                 Queue Position
               </p>
               <p className="text-3xl font-bold text-soil-800">#{queuePos}</p>
            </div>
            <div className="flex flex-col items-center border-l border-husk-200">
               <p className="text-xs font-bold text-soil-500 uppercase tracking-wider mb-1">
                 Farmers Ahead
               </p>
               <p className="text-3xl font-bold text-field-800">{farmersAhead}</p>
            </div>
         </div>

         <div className="mt-6 w-full rounded-2xl bg-harvest-50/90 p-4 border border-harvest-200 flex flex-col items-center">
            <p className="text-xs font-bold text-harvest-800 uppercase tracking-wider mb-1">
              Estimated Waiting Time (ETA Model)
            </p>
            <p className="text-4xl font-extrabold text-harvest-600">
              {waitMin} <span className="text-xl font-bold text-soil-700">min</span>
            </p>
            <p className="text-xs text-soil-600 mt-1 font-medium">
              Current Stage: <span className="font-bold text-field-800">{currentStage}</span>
            </p>
         </div>
      </div>

      {/* Official Check-In QR Gate Pass (Active until checked-in) */}
      {!isCheckedIn ? (
        <div className="rounded-3xl border-2 border-dashed border-field-500 bg-white p-6 shadow-md flex flex-col items-center text-center gap-4 hover-lift">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
            <span>{isTamil ? 'நுழைவு வாயிலில் இந்த QR குறியீட்டை ஸ்கேன் செய்யவும்' : 'Active Gate Pass — Scan at Centre Entry Gate'}</span>
          </div>

          <div className="p-3 bg-white rounded-2xl border-2 border-field-400 shadow-inner flex flex-col items-center">
            {(liveData?.qr_code_data || state.slot?.qrCodeData) ? (
              <img 
                src={liveData?.qr_code_data || state.slot?.qrCodeData} 
                alt="Official Gate QR Code" 
                className="w-48 h-48 object-contain" 
              />
            ) : (
              <div className="w-48 h-48 flex flex-col items-center justify-center bg-husk-50 rounded-xl">
                <span className="text-5xl">📱</span>
                <span className="text-sm font-bold text-soil-700 mt-2">#{activeToken}</span>
              </div>
            )}
            <span className="text-[10px] font-mono font-bold text-soil-500 uppercase tracking-widest mt-2">
              AGRI-PROCURE SECURE ENTRY TOKEN
            </span>
          </div>

          <p className="text-xs text-soil-600 max-w-sm">
            {isTamil
              ? 'கொள்முதல் மையத்தின் வாயிலில் பாதுகாப்பு அதிகாரியிடம் இந்த QR கோடை காண்பிக்கவும். செக்-இன் செய்யும் வரை இது இங்கேயே இருக்கும்.'
              : 'Keep this QR Code ready on your screen when arriving at the centre gate. This pass stays visible here until you physically check in.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
            <button
              onClick={handleGateCheckIn}
              disabled={checkInLoading}
              className="flex-1 py-3.5 px-4 rounded-xl bg-field-800 hover:bg-field-900 text-white text-sm font-bold transition-all shadow-md active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>📷</span>
              <span>{checkInLoading ? (isTamil ? 'சரிபார்க்கிறது...' : 'Scanning...') : (isTamil ? 'நுழைவு சரிபார்ப்பு (செக்-இன்)' : 'Simulate QR Gate Check-In')}</span>
            </button>
            <button
              onClick={() => setShowGatePass(true)}
              className="py-3 px-4 rounded-xl border border-husk-300 bg-husk-100 hover:bg-husk-200 text-soil-800 text-xs font-bold transition cursor-pointer"
            >
              🎫 {isTamil ? 'பாஸ் காண்க' : 'View Gate Pass'}
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 flex items-center justify-between text-emerald-900 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div className="text-left">
              <p className="text-sm font-bold">{isTamil ? 'நுழைவு வாயில் சரிபார்ப்பு நிறைவடைந்தது' : 'Gate Check-In Completed'}</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                {isTamil ? 'QR குறியீடு வெற்றிகரமாக ஸ்கேன் செய்யப்பட்டது. நீங்கள் வரிசையில் உள்ளீர்கள்.' : 'Your gate QR code was verified. You are currently in the active inspection line.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowGatePass(true)}
            className="text-xs font-bold underline text-emerald-800 hover:text-emerald-950 shrink-0 cursor-pointer"
          >
            {isTamil ? 'பாஸ் காண்க' : 'Gate Slip'}
          </button>
        </div>
      )}

      {/* EXPLAINABLE AI BREAKDOWN BOX (Directly from user handwritten notes) */}
      <div className="rounded-3xl border-2 border-indigo-200 bg-indigo-50/60 p-6 shadow-sm hover-lift text-left">
         <div className="flex items-center justify-between border-b border-indigo-200 pb-3 mb-4">
            <div className="flex items-center gap-2">
                <span className="text-2xl">💡</span>
                <h3 className="font-display text-lg font-bold text-indigo-950">
                  {xai?.question || `Why ${waitMin} minutes wait?`}
                </h3>
            </div>
            <span className="text-xs font-bold bg-indigo-200 text-indigo-900 px-2.5 py-1 rounded-full">
              AI Confidence: {xai?.ai_confidence || '91%'}
            </span>
         </div>

         <div className="flex flex-col gap-2.5">
           {xai?.reasons?.map((reason, idx) => (
             <div key={idx} className="flex items-center gap-2 text-sm font-semibold text-indigo-900">
               <span className="text-indigo-600">↳</span>
               <span>{reason}</span>
             </div>
           )) || (
             <>
               <div className="flex items-center gap-2 text-sm font-semibold text-indigo-900">
                 <span className="text-indigo-600">↳</span>
                 <span>{farmersAhead} farmers ahead</span>
               </div>
               <div className="flex items-center gap-2 text-sm font-semibold text-indigo-900">
                 <span className="text-indigo-600">↳</span>
                 <span>Avg inspection : 4 min</span>
               </div>
               <div className="flex items-center gap-2 text-sm font-semibold text-indigo-900">
                 <span className="text-indigo-600">↳</span>
                 <span>1 counter temporarily unavailable</span>
               </div>
               <div className="flex items-center gap-2 text-sm font-semibold text-indigo-900">
                 <span className="text-indigo-600">↳</span>
                 <span>Current arrival rate : 15 farmers/hr</span>
               </div>
               <div className="flex items-center gap-2 text-sm font-semibold text-indigo-900">
                 <span className="text-indigo-600">↳</span>
                 <span>AI confidence : 91%</span>
               </div>
             </>
           )}
         </div>
      </div>

      {/* Navigation Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/farmer-dashboard/timeline"
          className="py-3.5 px-4 rounded-xl border border-husk-300 bg-husk-100 text-center text-sm font-bold text-soil-800 hover:bg-husk-200 transition-all cursor-pointer"
        >
          View 7-Stage Timeline →
        </Link>
        <Link
          to="/farmer-dashboard/payments"
          className="py-3.5 px-4 rounded-xl bg-field-800 text-white text-center text-sm font-bold hover:bg-field-900 transition-all cursor-pointer"
        >
          Proceed to Payment 💳
        </Link>
      </div>

      {/* Official Gate Pass Modal */}
      <GatePassModal
        isOpen={showGatePass}
        onClose={() => setShowGatePass(false)}
        slotData={{
          token: activeToken,
          time: liveData?.time_slot || state.slot?.time,
          date: liveData?.booking_date || state.slot?.date
        }}
        centerData={selectedCenter || { name: liveData?.centre_name }}
        cropData={{
          crop: liveData?.crop_name || state.selectedCrop?.crop,
          quantity: liveData?.quantity || state.selectedCrop?.quantity
        }}
        qrCodeData={liveData?.qr_code_data || state.slot?.qrCodeData}
      />
    </div>
  );
}
