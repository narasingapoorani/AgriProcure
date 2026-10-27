import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../data/translations';
import api from '../../services/api';

export default function ProcurementTimeline() {
  const { state, update } = useApp();
  const isTamil = state.language === 'Tamil';
  const tokenNumber = state.slot?.token || 'L-357';

  const [timelineData, setTimelineData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchTimeline() {
      try {
        setLoading(true);
        let targetToken = state.slot?.token;
        if (!targetToken && state.farmerUser?.id) {
          try {
            const dashRes = await api.getFarmerDashboard(state.farmerUser.id);
            if (dashRes?.active_token?.token_number) {
              targetToken = dashRes.active_token.token_number;
            }
          } catch {}
        }
        targetToken = targetToken || 'L-357';
        const res = await api.getTimeline(targetToken);
        if (isMounted && res.status === 'success') {
          setTimelineData(res);
          if (res.crop_name) {
            update({
              selectedCrop: {
                ...(state.selectedCrop || {}),
                crop: res.crop_name,
                quantity: res.quantity,
                landArea: res.land_area,
              },
              selectedCenter: {
                id: res.centre_id,
                name: res.centre_name,
              },
              slot: {
                ...(state.slot || {}),
                token: res.token_number,
                bookingId: res.booking_id,
                time: res.time_slot,
                date: res.booking_date,
              }
            });
          }
        }
      } catch (err) {
        console.warn('API timeline fetch failed, using fallback:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchTimeline();
    return () => { isMounted = false; };
  }, [state.slot?.token, state.farmerUser?.id]);

  const defaultStages = [
    { order_index: 0, stage_name: 'Token Confirmed', status: 'completed', completed_at: 'Registered' },
    { order_index: 1, stage_name: 'Arrived', status: 'pending' },
    { order_index: 2, stage_name: 'Quality Inspection', status: 'pending' },
    { order_index: 3, stage_name: 'Weighing', status: 'pending' },
    { order_index: 4, stage_name: 'Crop Accepted', status: 'pending' },
    { order_index: 5, stage_name: 'Payment Generated', status: 'pending' },
    { order_index: 6, stage_name: 'Payment Initiated', status: 'pending' }
  ];

  const stages = timelineData?.timeline || defaultStages;
  const currentStage = timelineData?.current_stage || (timelineData?.is_upcoming ? 'Token Confirmed' : 'Token Confirmed');
  const isUpcoming = timelineData?.is_upcoming ?? (timelineData?.effective_status === 'Upcoming');

  const displayAmount = timelineData?.payment_amount 
    ? `₹${Number(timelineData.payment_amount).toLocaleString('en-IN')}` 
    : (state.selectedCrop?.quantity ? `₹${(Number(state.selectedCrop.quantity) * 2183).toLocaleString('en-IN')} (Est.)` : '₹ 0.00');

  return (
    <div className="max-w-xl mx-auto w-full pb-8 flex flex-col gap-6">
      {/* Header */}
      <div className="px-2">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-field-900 tracking-tight">
          {isTamil ? 'கொள்முதல் காலவரிசை' : 'Procurement Timeline (7 Stages)'}
        </h2>
        <p className="text-sm font-medium text-soil-600 mt-1">
          Tracking Token <span className="font-bold text-field-800">#{timelineData?.token_number || tokenNumber}</span>
          {isUpcoming && (
            <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
              {isTamil ? 'வரவிருக்கும்' : 'Upcoming'}
            </span>
          )}
        </p>
      </div>

      {/* Upcoming Notice Banner */}
      {isUpcoming && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-4 text-blue-900 flex items-start gap-3">
          <span className="text-xl">🗓️</span>
          <div>
            <h4 className="text-sm font-bold">
              {isTamil ? 'வரவிருக்கும் முன்பதிவு (மைய வருகை நிலுவையில் உள்ளது)' : 'Upcoming Booking (Awaiting Centre Arrival)'}
            </h4>
            <p className="text-xs text-blue-700 mt-0.5">
              {isTamil
                ? `உங்கள் ஸ்லாட் ${timelineData?.booking_date || ''} அன்று திட்டமிடப்பட்டுள்ளது. நீங்கள் கொள்முதல் மையத்திற்கு வந்த பிறகு அடுத்தடுத்த நிலைகள் (ஆய்வு, எடையிடுதல்) தொடங்கும்.`
                : `Your slot is scheduled for ${timelineData?.booking_date || 'the booked date'}. Subsequent stages (Arrived, Inspection, Weighing, Payment) will activate once you physically arrive and check in at the centre.`}
            </p>
          </div>
        </div>
      )}

      {/* Procurement Details Card */}
      <div className="rounded-3xl border border-husk-200 bg-husk-100 p-6 shadow-sm hover-lift">
         <div className="flex justify-between items-start mb-4 pb-4 border-b border-husk-200">
            <div>
               <h3 className="font-display text-2xl font-bold text-field-900">
                 {timelineData?.crop_name || state.selectedCrop?.crop || 'Paddy (Rice)'}
               </h3>
               <p className="text-soil-600 font-semibold mt-1">
                 {timelineData?.quantity || state.selectedCrop?.quantity || '27.0'} quintals
                 {(timelineData?.land_area || state.selectedCrop?.landArea) && (
                   <span className="text-xs text-soil-500 ml-2">
                     ({timelineData?.land_area || state.selectedCrop?.landArea} acres)
                   </span>
                 )}
               </p>
            </div>
            <div className="text-right">
               <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                 isUpcoming 
                   ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                   : 'bg-field-100 text-field-800 border border-field-300'
               }`}>
                 {isUpcoming ? (isTamil ? 'மைய வருகைக்காக காத்திருக்கிறது' : 'Awaiting Arrival') : currentStage}
               </span>
               <p className="text-xs font-semibold text-soil-500 mt-1">Token #{timelineData?.token_number || tokenNumber}</p>
            </div>
         </div>
         
         <div className="flex items-center justify-between text-soil-800 font-medium text-sm">
            <span>🏢 {timelineData?.centre_name || state.selectedCenter?.name || 'Coimbatore Central APMC & Agricultural Complex'}</span>
            <span className="font-bold text-harvest-600">{displayAmount}</span>
         </div>
      </div>

      {/* Official 7-Stage Timeline */}
      <div className="rounded-3xl border border-husk-200 bg-husk-100 p-6 sm:p-7 shadow-sm hover-lift">
         <div className="flex flex-col gap-6 relative">
            <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-husk-200"></div>

            {stages.map((st) => {
              const isComp = st.status === 'completed';
              const isInProg = st.status === 'in_progress';

              return (
                <div key={st.order_index} className={`flex gap-4 relative z-10 ${!isComp && !isInProg ? 'opacity-40' : ''}`}>
                   <div className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-sm font-bold shadow ring-4 ring-white mt-0.5 ${
                     isComp ? 'bg-field-600 text-white' : (isInProg ? 'bg-harvest-500 text-white animate-pulse' : 'bg-husk-200 text-transparent')
                   }`}>
                     {isComp ? '✓' : (isInProg ? '●' : '○')}
                   </div>
                   <div className="flex-1 flex justify-between items-start">
                      <div>
                        <p className={`text-base font-bold ${isInProg ? 'text-field-900' : 'text-soil-800'}`}>
                          {st.stage_name}
                        </p>
                        {st.remarks && (
                          <p className="text-xs text-soil-500 mt-0.5">{st.remarks}</p>
                        )}
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        isComp ? 'bg-ok-100 text-ok-800' : (isInProg ? 'bg-harvest-100 text-harvest-800' : 'text-soil-400')
                      }`}>
                        {isComp ? 'Completed' : (isInProg ? 'In Progress' : 'Pending')}
                      </span>
                   </div>
                </div>
              );
            })}
         </div>
      </div>
    </div>
  );
}
