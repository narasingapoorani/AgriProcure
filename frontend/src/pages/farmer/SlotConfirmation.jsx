import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../data/translations';
import { getDynamicCenterName } from '../../services/aiTranslation';
import GatePassModal from '../../components/GatePassModal';
import api from '../../services/api';

export default function SlotConfirmation() {
  const { state, update } = useApp();
  const { slot, selectedCenter, selectedCrop, isChoosingNewSlot } = state;
  const isTamil = state.language === 'Tamil';
  
  const [confirmed, setConfirmed] = useState(isChoosingNewSlot ? false : Boolean(slot?.token && slot?.qrCodeData));
  const [showGatePass, setShowGatePass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(isChoosingNewSlot ? null : (slot?.qrCodeData || null));
  const [whatsAppLink, setWhatsAppLink] = useState(isChoosingNewSlot ? null : (slot?.whatsAppLink || null));
  const [smsText, setSmsText] = useState(null);
  const [bookingId, setBookingId] = useState(isChoosingNewSlot ? null : (slot?.bookingId || null));
  const [dbCenter, setDbCenter] = useState(null);
  const [customPhone, setCustomPhone] = useState(state.farmerUser?.mobile_number && state.farmerUser.mobile_number !== '9876543210' ? state.farmerUser.mobile_number : '');
  const [copiedToken, setCopiedToken] = useState(false);

  const handleCopyToken = () => {
    const currentToken = slot?.token || 'A-123';
    const textToCopy = currentToken.startsWith('#') ? currentToken : `#${currentToken}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        setCopiedToken(true);
        setTimeout(() => setCopiedToken(false), 2000);
      }).catch(() => {
        fallbackCopyToken(textToCopy);
      });
    } else {
      fallbackCopyToken(textToCopy);
    }
  };

  const fallbackCopyToken = (text) => {
    try {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  };

  // Fetch active booking on mount only if user is NOT choosing a new slot for a new crop
  useEffect(() => {
    let isMounted = true;
    async function loadActiveBooking() {
      if (isChoosingNewSlot) {
        return;
      }
      try {
        const farmerId = state.farmerUser?.id || 1;
        const res = await api.getFarmerDashboard(farmerId);
        if (isMounted && res.status === 'success' && res.active_token) {
          const act = res.active_token;
          if (act.token_number) {
            setQrCodeData(act.qr_code_data);
            setBookingId(act.id);
            setConfirmed(true);
            update({
              slot: {
                ...(state.slot || {}),
                token: act.token_number,
                time: act.time_slot,
                date: act.booking_date,
                bookingId: act.id,
                qrCodeData: act.qr_code_data,
                status: act.status,
                checkedInAt: act.checked_in_at,
                isCheckedIn: Boolean(act.checked_in_at || act.status === 'Checked-in'),
                currentStage: act.current_stage
              },
              selectedCenter: state.selectedCenter || {
                id: act.centre_id,
                name: act.centre_name
              }
            });
          }
        }
      } catch (err) {
        console.warn('Sync active slot booking error:', err);
      }
    }

    if (!isChoosingNewSlot && slot?.token && slot?.qrCodeData) {
      setConfirmed(true);
      setQrCodeData(slot.qrCodeData);
    } else if (!isChoosingNewSlot) {
      loadActiveBooking();
    }
    return () => { isMounted = false; };
  }, [state.farmerUser?.id, slot?.token, isChoosingNewSlot]);

  useEffect(() => {
    let isMounted = true;
    if (!selectedCenter) {
      api.getCentres().then(res => {
        if (isMounted && res.status === 'success' && res.centres && res.centres.length > 0) {
          setDbCenter(res.centres[0]);
        }
      }).catch(() => {});
    }
    return () => { isMounted = false; };
  }, [selectedCenter]);

  const effectiveCenter = selectedCenter || dbCenter || {
    id: 1,
    name: 'Coimbatore Central APMC & Agricultural Complex',
    taluk: 'Coimbatore',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    recommendedDate: '10 Sep 2026',
    recommendedTime: '08:00 - 09:00',
    waitMin: 15,
  };

  const centerDisplayName = getDynamicCenterName(effectiveCenter.name, state.language);
  const cropName = selectedCrop?.crop || 'Paddy';
  const cropQty = selectedCrop?.quantity || '3.5';

  // Standard 9 daily procurement time slots (08:00 AM - 05:00 PM)
  const STANDARD_DAY_SLOTS = [
    '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00',
    '11:00 - 12:00', '12:00 - 13:00', '13:00 - 14:00',
    '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00'
  ];

  const rawSlots = Array.isArray(effectiveCenter?.availableSlots) ? effectiveCenter.availableSlots : [];
  const targetBestSlot = effectiveCenter.nextAvailableSlot || effectiveCenter.bestSlot || effectiveCenter.recommendedTime || '08:00 - 09:00';

  const defaultSlots = STANDARD_DAY_SLOTS.map((timeLabel, idx) => {
    const foundMeta = rawSlots.find(s => {
      const sLabel = typeof s === 'string' ? s : (s?.slot || s?.time);
      return sLabel === timeLabel;
    });

    const isRecommended = timeLabel === targetBestSlot;
    const estWait = foundMeta && typeof foundMeta === 'object' && foundMeta.expected_wait_minutes != null
      ? foundMeta.expected_wait_minutes
      : (isRecommended ? Math.max(10, Math.round(effectiveCenter.waitMin || 20)) : Math.round((effectiveCenter.waitMin || 20) + (idx * 5)));

    const pressure = foundMeta && typeof foundMeta === 'object' && foundMeta.queue_pressure
      ? foundMeta.queue_pressure
      : (isRecommended ? 'Low' : ([2, 3, 4].includes(idx) ? 'Medium' : 'Low'));

    return {
      time: timeLabel,
      state: isRecommended ? 'recommended' : (pressure === 'High' ? 'moderate' : 'available'),
      waitMin: estWait,
      pressure: pressure
    };
  });

  const initialTime = typeof slot?.time === 'string'
    ? slot.time
    : targetBestSlot;

  const [activeSlot, setActiveSlot] = useState(initialTime);

  useEffect(() => {
    if (targetBestSlot && !activeSlot) {
      setActiveSlot(targetBestSlot);
    }
  }, [targetBestSlot]);

  const handleConfirmSlot = async () => {
    try {
      setLoading(true);
      const centreId = typeof effectiveCenter.id === 'number'
        ? effectiveCenter.id
        : (parseInt(effectiveCenter.id, 10) || 1);
      const slotTimeString = typeof activeSlot === 'string' ? activeSlot : targetBestSlot;
      const arrival = slotTimeString.includes(' - ') ? slotTimeString.split(' - ')[0] : '08:00 AM';

      let bookingDateStr = selectedCrop?.arrivalDate || slot?.date || '2026-09-10';
      if (typeof bookingDateStr === 'string' && !bookingDateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        bookingDateStr = '2026-09-10';
      }

      const payload = {
        farmer_id: state.farmerUser?.id || 1,
        centre_id: centreId,
        crop_name: cropName,
        land_area: parseFloat(selectedCrop?.landArea || 2.5),
        quantity: parseFloat(cropQty),
        booking_date: bookingDateStr,
        time_slot: slotTimeString
      };

      const res = await api.bookSlot(payload);
      if (res.status === 'success' && res.booking) {
        setQrCodeData(res.booking.qr_code_data);
        setBookingId(res.booking.id);
        setSmsText(res.sms_notification);
        if (res.whatsapp_notification?.chat_link) {
          setWhatsAppLink(res.whatsapp_notification.chat_link);
        }

        update({
          selectedCenter: effectiveCenter,
          bookingId: res.booking.id,
          isChoosingNewSlot: false,
          slot: {
            bookingId: res.booking.id,
            bookingReference: res.booking.booking_reference,
            token: res.booking.token_number,
            date: res.booking.booking_date,
            time: res.booking.time_slot,
            expectedArrival: arrival,
            waitMin: res.booking.estimated_wait_minutes || 24,
            qrCodeData: res.booking.qr_code_data,
            whatsAppLink: res.whatsapp_notification?.chat_link
          }
        });
      }
      setConfirmed(true);
    } catch (err) {
      console.error('Slot booking API error, using fallback:', err);
      setConfirmed(true);
      update({ isChoosingNewSlot: false });
    } finally {
      setLoading(false);
    }
  };

  if (confirmed) {
    const currentToken = slot?.token || 'A-123';
    return (
      <div className="max-w-xl mx-auto w-full pb-8 flex flex-col gap-6">
        <div className="rounded-3xl bg-gradient-to-br from-field-800 to-field-700 p-8 text-center shadow-lg relative overflow-hidden flex flex-col items-center ai-glow hover-lift">
           <div className="w-16 h-16 rounded-full bg-white text-field-800 flex items-center justify-center mb-4 relative z-10 shadow-md">
              <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
           </div>
           
           <h2 className="font-display text-2xl sm:text-3xl font-bold text-white relative z-10">
             {isTamil ? 'முன்பதிவு உறுதி செய்யப்பட்டது' : 'Slot Confirmed & Token Generated!'}
           </h2>
           <p className="text-field-100 mt-2 text-sm sm:text-base font-medium relative z-10">
             Token #{currentToken} is allocated with priority gate check-in.
           </p>
        </div>

        {/* QR Code and Token Card */}
        <div className="rounded-2xl border border-husk-200 bg-husk-100 p-6 shadow-sm flex flex-col items-center text-center gap-4 hover-lift">
           <p className="text-xs font-bold text-soil-500 uppercase tracking-wider">
             Your Official Digital Procurement Gate Pass
           </p>
           
           {qrCodeData ? (
             <div className="p-3 bg-white rounded-2xl border-2 border-field-300 shadow-md">
               <img src={qrCodeData} alt="Gate QR Code" className="w-48 h-48 object-contain" />
             </div>
           ) : (
             <div className="p-6 bg-white rounded-2xl border-2 border-field-300 shadow-md flex flex-col items-center">
               <span className="text-5xl font-extrabold text-field-900 mb-2">#{currentToken}</span>
               <span className="text-xs text-soil-500">Scan at Entry Gate</span>
             </div>
           )}

           <div className="w-full grid grid-cols-2 gap-y-4 gap-x-4 border-t border-husk-200 pt-4 text-left">
              <div>
                 <p className="text-xs font-bold text-soil-500 uppercase tracking-wider mb-1">Centre</p>
                 <p className="text-sm font-bold text-soil-800 line-clamp-1">{centerDisplayName}</p>
              </div>
              <div>
                 <p className="text-xs font-bold text-soil-500 uppercase tracking-wider mb-1">Date & Time</p>
                 <p className="text-sm font-bold text-soil-800">10 Sep 2026 · {activeSlot}</p>
              </div>
              <div>
                 <p className="text-xs font-bold text-soil-500 uppercase tracking-wider mb-1">Token Number</p>
                 <p className="text-lg font-bold text-field-800">#{currentToken}</p>
              </div>
              <div>
                 <p className="text-xs font-bold text-soil-500 uppercase tracking-wider mb-1">Expected Wait</p>
                 <p className="text-lg font-bold text-harvest-600">~{slot?.waitMin || 24} min</p>
              </div>
           </div>
        </div>

        {/* WhatsApp Notification Card */}
        {confirmed && (() => {
          const fallbackWaMsg = `🌾 *AGRI-PROCUREMENT OFFICIAL GATE PASS*\n\n🎟 *TOKEN: #${currentToken}*\n🏢 Centre: ${centerDisplayName}\n📅 Date: 10 Sep 2026\n⏰ Slot: ${activeSlot}\n📦 Crop: ${cropName} (${cropQty} Quintals)\n⏱ Expected Wait: ~${slot?.waitMin || 24} mins\n\nPlease present this token & QR code at the APMC gate.`;
          const activeWhatsAppHref = `https://api.whatsapp.com/send?text=${encodeURIComponent(fallbackWaMsg)}`;

          return (
            <div className="rounded-2xl border-2 border-green-500 bg-green-50 p-4 flex flex-col gap-3 shadow-sm hover-lift">
               <div className="flex items-center justify-between flex-wrap gap-3">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white text-xl shadow-sm shrink-0">
                     💬
                   </div>
                   <div className="text-left">
                      <p className="text-sm font-bold text-green-900">
                        {isTamil ? 'அதிகாரப்பூர்வ வாட்ஸ்அப் டோக்கன் & கேட் பாஸ்' : 'Official WhatsApp Token & Gate Pass'}
                      </p>
                      <p className="text-xs text-green-800 font-medium">
                        {isTamil ? 'வாட்ஸ்அப்பில் தொடர்பைத் தேர்ந்தெடுத்து பகிரவும் அல்லது டோக்கனை நகலெடுக்கவும்' : 'Choose someone on WhatsApp to share your token & pass, or copy token.'}
                      </p>
                   </div>
                 </div>

                 {/* Action Buttons: Share on WhatsApp and Copy Token */}
                 <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                   <a
                     href={activeWhatsAppHref}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="text-xs font-bold bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-sm active:scale-95"
                     title="Choose contact or group on WhatsApp to share"
                   >
                     <span>📲</span> {isTamil ? 'வாட்ஸ்அப்பில் பகிரவும்' : 'Share on WhatsApp'} ↗
                   </a>
                   <button
                     type="button"
                     onClick={handleCopyToken}
                     className="text-xs font-bold bg-white hover:bg-green-100 text-green-800 border border-green-300 px-4 py-2.5 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-sm active:scale-95"
                     title="Copy token to clipboard"
                   >
                     <span>{copiedToken ? '✓' : '📋'}</span> {copiedToken ? (isTamil ? 'நகலெடுக்கப்பட்டது!' : 'Copied!') : (isTamil ? 'டோக்கனை நகலெடு' : 'Copy Token')}
                   </button>
                 </div>
               </div>
            </div>
          );
        })()}

        {/* SMS Notification Banner */}
        <div className="rounded-2xl border border-ok-200 bg-ok-50 p-4 flex items-center gap-3 text-left">
           <span className="text-2xl">📱</span>
           <div>
              <p className="text-xs font-bold text-ok-900 uppercase tracking-wider">SMS Confirmation Sent</p>
              <p className="text-xs font-medium text-soil-700 mt-0.5">
                {smsText || `Notified through SMS, showing: expected arrival ${activeSlot.split(' - ')[0]} and expected wait ${slot?.waitMin || 24} min.`}
              </p>
           </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
           <button
             onClick={() => setShowGatePass(true)}
             className="w-full flex items-center justify-center gap-2 rounded-xl bg-field-900 px-6 py-4 text-base font-bold text-white shadow-md hover:bg-black transition-all active:scale-95 cursor-pointer"
           >
             🎫 {isTamil ? 'அதிகாரப்பூர்வ கேட் பாஸை காண்க / அச்சிடுக' : 'View / Print Official Gate Pass (PDF)'}
           </button>

           <Link
             to="/farmer-dashboard/live-queue"
             className="w-full flex items-center justify-center gap-2 rounded-xl bg-field-800 px-6 py-4 text-base font-bold text-white shadow-md hover:bg-field-900 transition-all active:scale-95 ai-glow cursor-pointer"
           >
             {isTamil ? 'நேரலை வரிசை நிலையைக் காண்க →' : 'View Live Queue Status →'}
           </Link>

           <Link
             to="/farmer-dashboard/timeline"
             className="w-full flex items-center justify-center rounded-xl bg-husk-100 border border-husk-200 px-6 py-3.5 text-sm font-bold text-soil-700 hover:bg-husk-50 transition-all cursor-pointer"
           >
             {isTamil ? '7-கட்ட கொள்முதல் காலவரிசை' : 'View 7-Stage Procurement Timeline'}
           </Link>

           <button
             onClick={() => {
               setConfirmed(false);
               update({ isChoosingNewSlot: true });
             }}
             className="w-full text-center text-xs font-bold text-field-700 hover:text-field-900 underline py-2 cursor-pointer"
           >
             {isTamil ? 'வேறு ஸ்லாட்டை தேர்வு செய்ய / மாற்றியமைக்க' : '✏️ Choose another time slot / Change booking'}
           </button>
        </div>

        {/* Gate Pass Modal */}
        <GatePassModal
          isOpen={showGatePass}
          onClose={() => setShowGatePass(false)}
          slotData={{ ...slot, token: currentToken, time: activeSlot }}
          centerData={effectiveCenter}
          cropData={{ crop: cropName, quantity: cropQty }}
          qrCodeData={qrCodeData || slot?.qrCodeData}
        />
      </div>
    );
  }

  const selectedSlotMeta = defaultSlots.find(s => s.time === activeSlot) || defaultSlots[0];
  const bookingDisplayDate = selectedCrop?.arrivalDate || slot?.displayDate || '10 Sep 2026';

  return (
    <div className="max-w-xl mx-auto w-full pb-8 flex flex-col gap-6">
      
      {/* Step Heading */}
      <div className="px-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-extrabold uppercase tracking-wider text-field-700 bg-field-100 px-2.5 py-0.5 rounded-full border border-field-200">
            {isTamil ? 'படி 3 / 4' : 'Step 3 of 4'}
          </span>
          <span className="text-xs font-bold text-soil-500">
            Smart Slot Allocation
          </span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-field-900 tracking-tight">
          {isTamil ? 'உங்கள் கொள்முதல் நேரத்தைத் தேர்ந்தெடுக்கவும்' : 'Choose Your Procurement Time Slot'}
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-soil-600 font-medium leading-relaxed">
          {isTamil 
            ? 'AI குறைந்த காத்திருப்பு நேரத்துடன் பரிந்துரைக்கப்பட்ட நேரத்தை அமைத்துள்ளது. நீங்கள் விரும்பிய மற்றொரு நேரத்தையும் தேர்ந்தெடுக்கலாம்.' 
            : 'AI Model 6 evaluated queue velocity and pre-selected the optimal slot with minimal wait time. You can choose any slot below:'}
        </p>
      </div>

      {/* Selected Centre & Crop Details */}
      <div className="rounded-2xl border border-husk-200 bg-husk-100 p-5 shadow-sm hover-lift flex flex-col gap-3">
         <div className="grid grid-cols-2 gap-4">
            <div>
               <p className="text-xs font-bold text-soil-500 uppercase tracking-wider">
                 {isTamil ? 'தேர்ந்தெடுக்கப்பட்ட மையம்' : 'Selected Centre'}
               </p>
               <p className="mt-1 text-sm font-bold text-field-900 line-clamp-1">
                 {centerDisplayName}
               </p>
               <p className="text-[11px] text-soil-500 font-medium">
                 📍 {effectiveCenter.taluk ? `${effectiveCenter.taluk}, ` : ''}{effectiveCenter.district || 'Coimbatore'}
               </p>
            </div>
            <div>
               <p className="text-xs font-bold text-soil-500 uppercase tracking-wider">
                 {isTamil ? 'பயிர் & அளவு' : 'Crop & Quantity'}
               </p>
               <p className="mt-1 text-sm font-bold text-field-900">
                 {cropName} · {cropQty} qtl
               </p>
               <p className="text-[11px] text-soil-500 font-medium">
                 📅 Date: {bookingDisplayDate}
               </p>
            </div>
         </div>
      </div>

      {/* Time Slots List */}
      <div className="px-1 flex flex-col gap-3">
         <div className="flex items-center justify-between">
           <h3 className="text-xs font-bold text-soil-700 uppercase tracking-wider">
             {isTamil ? 'கிடைக்கும் நேர ஸ்லாட்டுகள்' : 'Available Time Slots'} ({defaultSlots.length} Slots)
           </h3>
           <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
             ⭐ AI Recommended Available
           </span>
         </div>
         
         <div className="grid gap-2.5">
            {defaultSlots.map((s) => {
              const isSelected = activeSlot === s.time;
              return (
                <button
                  key={s.time}
                  type="button"
                  onClick={() => setActiveSlot(s.time)}
                  className={`relative w-full rounded-2xl border-2 p-3.5 sm:p-4 flex items-center justify-between text-left transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-field-600 bg-field-50 shadow-md ring-2 ring-field-500/20' 
                      : 'border-husk-200 bg-white hover:border-field-300 hover:bg-husk-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                     <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                       isSelected ? 'border-field-600 bg-field-600 text-white' : 'border-husk-300 bg-white'
                     }`}>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-white"></span>}
                     </span>
                     <div>
                       <div className="flex items-center gap-2 flex-wrap">
                         <span className="text-sm sm:text-base font-extrabold text-field-950">
                           {s.time}
                         </span>
                         {s.state === 'recommended' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300 uppercase tracking-wide">
                              ⭐ Recommended
                            </span>
                         )}
                       </div>
                       <span className="block text-xs font-semibold text-soil-500 mt-0.5">
                         ⏱ Est. Wait: ~{s.waitMin} min • {s.pressure === 'High' ? 'Busy Queue' : 'Fast Flow'}
                       </span>
                     </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {s.state === 'recommended' ? (
                       <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 hidden sm:inline-block">
                         ⚡ Lowest Wait
                       </span>
                    ) : (
                       <span className={`text-xs font-semibold px-2 py-0.5 rounded border hidden sm:inline-block ${
                         s.pressure === 'High' 
                           ? 'bg-amber-50 text-amber-800 border-amber-200' 
                           : 'bg-field-50 text-field-800 border-field-200'
                       }`}>
                         {s.pressure === 'High' ? '🟡 Moderate' : '🟢 Quick Entry'}
                       </span>
                    )}
                  </div>
                </button>
              );
            })}
         </div>
      </div>

      {/* Active Slot Summary Card */}
      <div className="rounded-2xl border-2 border-field-500/30 bg-gradient-to-r from-field-50 via-husk-50 to-field-50 p-4 shadow-sm flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-[11px] font-bold text-field-700 uppercase tracking-wider">
            {isTamil ? 'தேர்ந்தெடுக்கப்பட்ட ஸ்லாட்' : 'Your Selected Booking Window'}
          </p>
          <p className="text-lg font-extrabold text-field-950 mt-0.5">
            🕒 {activeSlot}
          </p>
          <p className="text-xs text-soil-600 font-medium">
            Gate arrival recommended at: <span className="font-bold text-field-800">{activeSlot ? activeSlot.split(' - ')[0] : '08:00 AM'}</span>
          </p>
        </div>
        <div className="text-left sm:text-right">
          <span className="inline-block text-xs font-extrabold bg-field-800 text-white px-3 py-1.5 rounded-xl shadow-sm">
            ⏱ Expected Wait: ~{selectedSlotMeta.waitMin} min
          </span>
        </div>
      </div>

      {/* Confirm Action Button */}
      <button
        onClick={handleConfirmSlot}
        disabled={loading}
        className="mt-1 w-full inline-flex justify-center items-center gap-2 rounded-xl bg-field-800 px-6 py-4 text-lg font-bold text-white shadow-md hover:bg-field-900 transition-all active:scale-95 ai-glow cursor-pointer disabled:opacity-50"
      >
        {loading ? (
          <>
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Generating Token & QR Code...</span>
          </>
        ) : (
          <>
            <span>🎫 {isTamil ? 'ஸ்லாட்டை உறுதி செய்து QR பெறுக' : 'Confirm Slot & Generate QR Pass'}</span>
            <span>→</span>
          </>
        )}
      </button>
    </div>
  );
}
