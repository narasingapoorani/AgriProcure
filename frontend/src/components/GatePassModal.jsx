import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { getDynamicCenterName } from '../services/aiTranslation';
import { 
  Printer, 
  Download, 
  X, 
  QrCode, 
  CheckCircle2, 
  ShieldCheck, 
  Building2, 
  Calendar, 
  Clock, 
  User, 
  FileText 
} from 'lucide-react';

export default function GatePassModal({ isOpen, onClose, slotData, centerData, cropData, qrCodeData }) {
  const { state } = useApp();
  const isTamil = state.language === 'Tamil';
  const passRef = useRef(null);

  if (!isOpen) return null;

  const centerName = getDynamicCenterName(centerData?.name || state.selectedCenter?.name || 'APMC Procurement Center', state.language);
  const token = slotData?.token || slotData?.token_number || state.slot?.token || 'A-108';
  const slotTime = slotData?.time || slotData?.time_slot || state.slot?.time || '10:30 AM';
  const slotDate = slotData?.date || slotData?.booking_date || state.slot?.date || '10 Sep 2026';
  
  const rawFarmer = state.farmerUser?.full_name || state.farmerUser?.name || '';
  const isPhone = !rawFarmer || /^\+?\d[\d\s-]{7,15}$/.test(rawFarmer.trim()) || rawFarmer === 'farmer1';
  const farmerName = isPhone ? (isTamil ? 'ரமேஷ் கிசான் பாட்டீல்' : 'Ramesh Kisan Patil') : rawFarmer;

  const crop = cropData?.crop || cropData?.crop_name || state.selectedCrop?.crop || 'Wheat';
  const quantity = cropData?.quantity || state.selectedCrop?.quantity || '4.0';
  const qrImage = qrCodeData || slotData?.qrCodeData || slotData?.qr_code_data || state.slot?.qrCodeData || state.slot?.qr_code_data;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-husk-100 border-2 border-field-600 shadow-2xl flex flex-col overflow-hidden max-h-[95vh]">
        
        {/* Modal Top Bar */}
        <div className="bg-field-900 text-white px-6 py-4 flex items-center justify-between border-b border-field-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-harvest-400" />
            <span className="font-display font-bold text-base">
              {isTamil ? 'அரசு அதிகாரப்பூர்வ நுழைவு பாஸ்' : 'Official Entry Gate Pass'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-white/10 text-field-200 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Pass Body */}
        <div ref={passRef} className="p-6 overflow-y-auto flex flex-col gap-5 print:p-0">
          
          {/* Government Emblem Header */}
          <div className="text-center border-b-2 border-dashed border-husk-300 pb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-field-100 text-field-800 font-bold mb-1 text-2xl shadow-inner">
              🌾
            </div>
            <h3 className="font-display text-lg font-black text-field-900 tracking-tight">
              {isTamil ? 'தமிழ்நாடு அரசு - விவசாய கொள்முதல் துறை' : 'GOVERNMENT OF TAMIL NADU - CIVIL SUPPLIES'}
            </h3>
            <p className="text-xs font-semibold text-soil-500 uppercase tracking-widest mt-0.5">
              AGRIPROCURE DIGITAL GATE TOKEN PASS
            </p>
          </div>

          {/* Token Hero Section */}
          <div className="bg-gradient-to-br from-field-900 via-field-800 to-field-700 text-white rounded-2xl p-5 flex items-center justify-between shadow-md">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-field-200 block mb-0.5">
                {isTamil ? 'அங்கீகரிக்கப்பட்ட டோக்கன் எண்' : 'Authorized Gate Token'}
              </span>
              <span className="font-display text-4xl font-black tracking-tight text-white">
                #{token}
              </span>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-300 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isTamil ? 'வரிசை முன்னுரிமை சரிபார்க்கப்பட்டது' : 'Priority Lane Verified'}</span>
              </div>
            </div>

            {/* Generated QR Matrix / Real QR Code */}
            <div className="bg-white p-2.5 rounded-xl shadow-inner flex flex-col items-center shrink-0">
              <div className="w-24 h-24 bg-white flex items-center justify-center border border-gray-200 rounded-lg overflow-hidden">
                {qrImage ? (
                  <img src={qrImage} alt="Official Gate QR Code" className="w-full h-full object-contain" />
                ) : (
                  <svg viewBox="0 0 100 100" className="w-full h-full text-gray-900 fill-current">
                    <rect x="0" y="0" width="30" height="30" />
                    <rect x="5" y="5" width="20" height="20" fill="white" />
                    <rect x="10" y="10" width="10" height="10" />
                    <rect x="70" y="0" width="30" height="30" />
                    <rect x="75" y="5" width="20" height="20" fill="white" />
                    <rect x="80" y="10" width="10" height="10" />
                    <rect x="0" y="70" width="30" height="30" />
                    <rect x="5" y="75" width="20" height="20" fill="white" />
                    <rect x="10" y="80" width="10" height="10" />
                    <rect x="40" y="10" width="10" height="20" />
                    <rect x="10" y="40" width="20" height="10" />
                    <rect x="45" y="45" width="15" height="15" />
                    <rect x="70" y="50" width="20" height="10" />
                    <rect x="50" y="75" width="20" height="15" />
                    <rect x="80" y="80" width="10" height="10" />
                  </svg>
                )}
              </div>
              <span className="text-[9px] font-mono font-bold text-gray-700 mt-1">SCAN AT GATE</span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-husk-50 rounded-xl p-3 border border-husk-200">
              <span className="text-[11px] font-bold text-soil-500 uppercase block mb-0.5">
                {isTamil ? 'விவசாயி பெயர்' : 'Farmer Name'}
              </span>
              <span className="font-bold text-soil-900">{farmerName}</span>
            </div>

            <div className="bg-husk-50 rounded-xl p-3 border border-husk-200">
              <span className="text-[11px] font-bold text-soil-500 uppercase block mb-0.5">
                {isTamil ? 'பயிர் & அளவு' : 'Crop & Quantity'}
              </span>
              <span className="font-bold text-soil-900">{crop} · {quantity} qtl</span>
            </div>

            <div className="bg-husk-50 rounded-xl p-3 border border-husk-200">
              <span className="text-[11px] font-bold text-soil-500 uppercase block mb-0.5">
                {isTamil ? 'கொள்முதல் மையம்' : 'Procurement Center'}
              </span>
              <span className="font-bold text-soil-900 text-xs sm:text-sm line-clamp-1">{centerName}</span>
            </div>

            <div className="bg-husk-50 rounded-xl p-3 border border-husk-200">
              <span className="text-[11px] font-bold text-soil-500 uppercase block mb-0.5">
                {isTamil ? 'வருகை நேரம் & தேதி' : 'Slot Date & Time'}
              </span>
              <span className="font-bold text-field-900">{slotDate}, {slotTime}</span>
            </div>
          </div>

          {/* Gate Verification Notice */}
          <div className="rounded-xl border border-harvest-200 bg-harvest-50/50 p-3 text-xs text-soil-800 flex items-start gap-2">
            <span className="text-base">⚠️</span>
            <p className="leading-tight">
              {isTamil
                ? 'மையத்தின் நுழைவு வாயிலில் பாதுகாப்பு அதிகாரியிடம் இந்த QR கோடை காண்பிக்கவும். ஈரப்பதம் 17%க்குள் இருக்க வேண்டும்.'
                : 'Display this printed slip or digital WhatsApp pass to security personnel at Gate 1. Maximum allowable grain moisture is 17%.'}
            </p>
          </div>

        </div>

        {/* Action Buttons Footer */}
        <div className="p-4 bg-husk-50 border-t border-husk-200 flex gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-field-800 hover:bg-field-900 text-white font-bold py-3.5 px-4 transition active:scale-95 shadow-md ai-glow"
          >
            <Printer className="w-4 h-4" />
            {isTamil ? 'பாஸை அச்சிடுக / சேமிக்க' : 'Print / Save PDF Gate Pass'}
          </button>
          <button
            onClick={onClose}
            className="rounded-xl border border-husk-300 bg-husk-100 hover:bg-husk-200 text-soil-700 font-bold px-5 transition"
          >
            {isTamil ? 'மூடுக' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
}
