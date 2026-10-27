import { useApp } from '../context/AppContext';
import { TrendingUp, Activity } from 'lucide-react';

const MSP_TICKER_DATA = [
  { crop: 'Paddy (Grade A)', cropTa: 'நெல் (கிரேடு A)', rate: '₹2,320', unit: '/qtl', change: '+2.4%', up: true },
  { crop: 'Paddy (Common)', cropTa: 'நெல் (பொது)', rate: '₹2,300', unit: '/qtl', change: '+2.1%', up: true },
  { crop: 'Cotton (MCU-5)', cropTa: 'பருத்தி (MCU-5)', rate: '₹7,121', unit: '/qtl', change: '+3.5%', up: true },
  { crop: 'Maize (Hybrid)', cropTa: 'மக்காச்சோளம்', rate: '₹2,225', unit: '/qtl', change: '+1.8%', up: true },
  { crop: 'Groundnut (Pod)', cropTa: 'நிலக்கடலை', rate: '₹6,783', unit: '/qtl', change: '+4.2%', up: true },
  { crop: 'Sugarcane (FRP)', cropTa: 'கரும்பு', rate: '₹340', unit: '/qtl', change: '+0.9%', up: true },
  { crop: 'Blackgram (Urad)', cropTa: 'உளுந்து', rate: '₹7,400', unit: '/qtl', change: '+1.5%', up: true },
  { crop: 'Greengram (Moong)', cropTa: 'பாசிப்பயறு', rate: '₹8,682', unit: '/qtl', change: '+2.0%', up: true },
];

export default function LiveMspTicker() {
  const { state } = useApp();
  const isTamil = state.language === 'Tamil';

  // Double the list for infinite seamless marquee loop
  const displayItems = [...MSP_TICKER_DATA, ...MSP_TICKER_DATA];

  return (
    <div className="w-full bg-field-950 text-white border-b border-field-800 overflow-hidden py-2 px-4 shadow-xs relative z-30 select-none flex items-center">
      {/* Live Badge */}
      <div className="shrink-0 flex items-center gap-1.5 bg-field-800 text-field-100 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider mr-3 border border-field-600/40">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="w-2 h-2 rounded-full bg-emerald-400 absolute" />
        <span className="ml-1.5">{isTamil ? 'அரசு நேரலை MSP' : 'Govt Live MSP'}</span>
      </div>

      {/* Marquee Track */}
      <div className="flex-1 overflow-hidden relative">
        <div className="flex items-center gap-8 whitespace-nowrap animate-marquee hover:[animation-play-state:paused]">
          {displayItems.map((item, idx) => (
            <div key={idx} className="inline-flex items-center gap-2 text-xs font-medium">
              <span className="text-field-200 font-bold">
                {isTamil ? item.cropTa : item.crop}
              </span>
              <span className="font-mono font-black text-white bg-white/10 px-1.5 py-0.5 rounded">
                {item.rate}
                <span className="text-[10px] font-normal text-field-300">{item.unit}</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-400 inline-flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                {item.change}
              </span>
              <span className="text-field-700">·</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
