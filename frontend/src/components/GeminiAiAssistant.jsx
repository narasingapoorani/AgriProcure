import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Send, 
  Sparkles, 
  RotateCcw
} from 'lucide-react';

const QUICK_PROMPTS = [
  { en: "Which crop is best for this season?", ta: "இந்த பருவத்திற்கு எந்த பயிர் சிறந்தது?" },
  { en: "What is today's MSP for Paddy?", ta: "இன்றைய நெல் MSP விலை என்ன?" },
  { en: "How to get slot token on WhatsApp?", ta: "WhatsApp-இல் டோக்கன் பெறுவது எப்படி?" },
  { en: "What moisture level is allowed?", ta: "அனுமதிக்கப்பட்ட ஈரப்பதம் எவ்வளவு?" },
  { en: "Which center has the shortest queue?", ta: "எந்த மையத்தில் குறைந்த காத்திருப்பு உள்ளது?" }
];

// Conversational engine that answers naturally like a real AI
function generateSmartAIResponse(rawQuery, isTamil) {
  const q = rawQuery.toLowerCase().trim();

  // 1. Chitchat / Greetings / Well-being
  if (q.includes('how are you') || q.includes('how r u') || q.includes('how are u') || q.includes('எப்படி இருக்கிறீர்கள்') || q.includes('நலமா')) {
    return isTamil
      ? "நான் மிகவும் நலமாக உள்ளேன்! விவசாயிகளுக்கு உதவும் பணியில் இருப்பதில் மகிழ்ச்சி. உங்களுக்கு பயிர் தேர்வுகள், கொள்முதல் மையங்கள் அல்லது டோக்கன் பதிவு பற்றி என்ன தகவல் வேண்டும்?"
      : "I'm doing great, thank you! Always happy to assist farmers with harvest planning, procurement centers, and market prices. How can I help you with your farming today?";
  }

  if (q === 'hi' || q === 'hello' || q === 'hey' || q === 'வணக்கம்' || q === 'ஹலோ' || q === 'vanakkam') {
    return isTamil
      ? "வணக்கம்! நான் உங்கள் அக்ரி AI உதவியாளர். இன்றைய MSP விலை, பரிந்துரைக்கப்பட்ட பயிர்கள், மைய வரிசை நிலவரம் அல்லது வாட்ஸ்அப் டோக்கன் குறித்து நீங்கள் எதை வேண்டுமானாலும் கேட்கலாம்."
      : "Hello! Welcome to AgriProcure AI Assistant. You can ask me about seasonal crop suitability, live MSP rates, moisture regulations, or booking your queue slot.";
  }

  if (q.includes('thank') || q.includes('thanks') || q.includes('நன்றி') || q.includes('ok thank')) {
    return isTamil
      ? "மகிழ்ச்சி! வேறு ஏதேனும் சந்தேகம் இருந்தால் தயங்காமல் கேளுங்கள். உங்கள் விவசாயம் சிறக்க வாழ்த்துகள்! 🌾"
      : "You're very welcome! If you need any more advice on slots, transport, or pricing, just ask. Wishing you a bountiful harvest! 🌾";
  }

  if (q.includes('who are you') || q.includes('what can you do') || q.includes('யார் நீ') || q.includes('உன் பெயர்')) {
    return isTamil
      ? "நான் தமிழ்நாடு அரசின் 'அக்ரிப்ரோக்யூர்' தளத்தின் அதிகாரப்பூர்வ AI வழிகாட்டி. விவசாயிகளுக்கு பயிர் ஆலோசனை, கொள்முதல் விலை (MSP), தானிய ஈரப்பத விதிகள், மைய நெரிசல் மற்றும் வாட்ஸ்அப் டோக்கன் முன்பதிவு ஆகியவற்றில் உதவ வடிவமைக்கப்பட்டுள்ளேன்."
      : "I am the official Agri AI Assistant for the AgriProcure platform. I help farmers optimize their crop sales, check daily government MSP rates, verify moisture standards, and avoid center queue delays.";
  }

  // 2. Weather / Climate / Rainy / Storm queries (including typo "ehther", "wether")
  if (q.includes('weather') || q.includes('wether') || q.includes('ehther') || q.includes('weater') || q.includes('rain') || q.includes('climate') || q.includes('வானிலை') || q.includes('மழை') || q.includes('வெயில்')) {
    if (q.includes('which') || q.includes('good') || q.includes('சிறந்தது') || q.includes('ஏற்றது')) {
      return isTamil
        ? "☀️ **தானிய அறுவடை மற்றும் கொள்முதலுக்கு ஏற்ற வானிலை:**\n\n• **கொள்முதலுக்கு சிறந்தது**: 28°C - 34°C கொண்ட உலர்ந்த வெயில் வானிலையே சிறந்தது. இது தானிய ஈரப்பதத்தை 17%க்குள் வைத்திருக்க உதவும்.\n• **மழை காலத்தில்**: மழை அல்லது பனி இருக்கும் போது அறுவடை செய்தால் ஈரப்பதம் 19%க்கு மேல் சென்று மையத்தில் நிராகரிக்கப்படலாம்.\n• **இன்றைய முன்னறிவிப்பு**: அடுத்த 48 மணி நேரத்திற்கு தென் மாவட்டங்களில் தெளிவான வெயில் நிலவும். உங்கள் தானியங்களை கொண்டு வர இதுவே உகந்த நேரம்!"
        : "☀️ **Optimal Weather for Harvest & Procurement:**\n\n• **Best Procurement Condition**: Clear, dry sunny weather (28°C - 34°C). This ensures grains easily meet the government moisture limit (under 17.0%).\n• **Risk Weather**: Rainy or humid weather spikes moisture to 19%+, which causes wait time deductions at testing counters.\n• **Current 48-Hour Outlook**: South Tamil Nadu is mostly clear to partly sunny with minimal rain risk. It is an ideal window to bring your harvest to the center!";
    }
    return isTamil
      ? "🌦️ **அக்ரி வானிலை அறிக்கை (அடுத்த 48 மணி நேரம்):**\n\n• தென் மாவட்டங்களில் பொதுவாக வறண்ட மற்றும் வெயில் வானிலை நிலவும்.\n• மழை வாய்ப்பு: 10% மட்டுமே (புதன்கிழமை மாலை லேசான தூறல் இருக்கலாம்).\n• பாதுகாப்பு குறிப்பு: களம் மற்றும் மையத்திற்கு தானியங்களை கொண்டு வரும்போது தார்பாய்களை கையில் வைத்திருங்கள்."
      : "🌦️ **Agri Weather Advisory (Next 48 Hours):**\n\n• Weather is largely clear and sunny across southern districts, perfect for sun-drying harvested grains.\n• Rain probability: Low (10-15%).\n• Tip: Always keep tarpaulins handy when transporting crops to open-yard procurement centers.";
  }

  // 3. Summer / Seasonal Crop recommendation (including "summer", "sumer")
  if (q.includes('summer') || q.includes('sumer') || q.includes('கோடை') || q.includes('வெயில் காலம்')) {
    return isTamil
      ? "☀️ **கோடைப் பருவத்திற்கு (Summer Season) ஏற்ற சிறந்த பயிர்கள்:**\n\n1. **மக்காச்சோளம் (Maize)**: கோடை வெப்பத்தை தாங்கி வளரும், குறைந்த நீர் போதுமானது, 90-100 நாட்களில் அறுவடை. MSP: ₹2,225/குவிண்டால்.\n2. **நிலக்கடலை (Groundnut)**: கோடை பாசன நிலக்கடலை அதிக எண்ணெய் சத்துடன் அதிக விலை தரும். அரசு MSP: ₹6,783/குவிண்டால்.\n3. **பருத்தி (Summer Cotton)**: வறட்சியை தாங்கும், நல்ல பணப்பயிர். அரசு MSP: ₹7,121/குவிண்டால்.\n4. **உளுந்து / பாசிப்பயறு (Summer Pulses)**: வெறும் 65-70 நாட்களில் குறைந்த செலவில் நல்ல லாபம்.\n\n💡 *ஆலோசனை:* கோடையில் நீர் பற்றாக்குறை இருந்தால் நெல்லுக்கு பதிலாக **மக்காச்சோளம் அல்லது நிலக்கடலை** பயிரிடுவது அதிக லாபம் தரும்!"
      : "☀️ **Top Recommended Crops for Summer Season in Tamil Nadu:**\n\n1. **Maize (Corn)**: Highly drought-tolerant, consumes 40% less water than paddy, matures in 90-105 days. Government MSP: ₹2,225/qtl.\n2. **Groundnut (Summer Irrigated)**: Excellent pod filling in warm climate, high oil content. Government MSP: ₹6,783/qtl.\n3. **Cotton (Summer MCU-5)**: Loves warm sunshine, strong commercial demand at MSP: ₹7,121/qtl.\n4. **Short-Duration Pulses (Blackgram / Greengram)**: 65-70 days cycle, enriches soil nitrogen.\n\n💡 *Tip:* For hot summer months with limited borewell water, **Maize or Groundnut** delivers superior profit compared to thirsty crops.";
  }

  // 4. Crop selection general ("which crop", "best crop", "crop is good")
  if (q.includes('crop') || q.includes('பயிர்')) {
    if (q.includes('which') || q.includes('good') || q.includes('best') || q.includes('சிறந்தது') || q.includes('எந்த')) {
      return isTamil
        ? "🌾 **தமிழ்நாட்டில் அதிக லாபம் தரும் பரிந்துரைக்கப்பட்ட பயிர்கள்:**\n\n1. **நெல் (CR 1009 / பொன்னி)**: அரசு நேரடி கொள்முதல், MSP ₹2,320/குவிண்டால், 48 மணி நேரத்தில் வங்கி கணக்கில் DBT பணம்.\n2. **பருத்தி (MCU-5)**: அதிக வருமானம், MSP ₹7,121/குவிண்டால்.\n3. **மக்காச்சோளம்**: குறைந்த நீர் பயன்பாடு, விரைவான வளர்ச்சி, MSP ₹2,225/குவிண்டால்.\n4. **நிலக்கடலை**: குறைந்த செலவு, அதிக சந்தை மதிப்பு, MSP ₹6,783/குவிண்டால்.\n\nஉங்களுக்கு குறிப்பிட்ட மண் வகை (களிமண் / செம்மண்) அல்லது நீர் அளவு இருந்தால் சொல்லுங்கள், இன்னும் துல்லியமாக வழிகாட்டுகிறேன்!"
        : "🌾 **Top High-Yield Crops for Government Procurement:**\n\n1. **Paddy (Grade A / Ponni)**: Guaranteed government buying at ₹2,320/qtl with direct bank transfer.\n2. **Cotton (MCU-5)**: Highest margin cash crop, MSP at ₹7,121/qtl.\n3. **Maize**: Low water requirements, reliable 90-day cycle, MSP at ₹2,225/qtl.\n4. **Groundnut**: High oil percentage, steady government procurement at ₹6,783/qtl.\n\nLet me know your soil type (clay / sandy / red loam) or water availability for an exact match!";
    }
  }

  // 5. MSP / Price / Rates
  if (q.includes('msp') || q.includes('price') || q.includes('rate') || q.includes('cost') || q.includes('விலை') || q.includes('விகிதம்')) {
    return isTamil
      ? "💰 **அரசு குறைந்தபட்ச ஆதரவு கொள்முதல் விலை (MSP 2026-27):**\n\n• **நெல் (கிரேடு A)**: ₹2,320 / குவிண்டால்\n• **நெல் (சாதாரண ரகம்)**: ₹2,300 / குவிண்டால்\n• **பருத்தி (நீண்ட இழை)**: ₹7,121 / குவிண்டால்\n• **மக்காச்சோளம்**: ₹2,225 / குவிண்டால்\n• **நிலக்கடலை**: ₹6,783 / குவிண்டால்\n• **கரும்பு (FRP)**: ₹340 / குவிண்டால்\n\nஎடை சரிபார்ப்புக்குப் பின் எந்த இடைத்தரகரும் இன்றி முழுத் தொகையும் உங்கள் வங்கிக் கணக்கில் நேரடியாக வரவு வைக்கப்படும்."
      : "💰 **Official Government MSP Rates (2026-27):**\n\n• **Paddy (Grade A)**: ₹2,320 / quintal\n• **Paddy (Common)**: ₹2,300 / quintal\n• **Cotton (Long Staple)**: ₹7,121 / quintal\n• **Maize**: ₹2,225 / quintal\n• **Groundnut**: ₹6,783 / quintal\n• **Sugarcane (FRP)**: ₹340 / quintal\n\nDirect Bank Transfer (DBT) is credited directly to your Aadhaar-seeded bank account within 24-48 hours of quality inspection.";
  }

  // 6. Moisture & Quality standards
  if (q.includes('moisture') || q.includes('water') || q.includes('dry') || q.includes('quality') || q.includes('ஈரப்பதம்') || q.includes('தரம்') || q.includes('உலர்த்து')) {
    return isTamil
      ? "💧 **அரசு கொள்முதல் ஈரப்பத விதிமுறைகள்:**\n\n• **அதிகபட்ச அனுமதி**: 17.0% ஈரப்பதம் வரை முழு MSP விலை கிடைக்கும்.\n• **17.1% முதல் 19.0% வரை**: குறைந்தபட்ச கழிவுத் தொகையுடன் அனுமதிக்கப்படும்.\n• **19.0%க்கு மேல்**: ஈரப்பதம் அதிகமாக இருப்பதால் உலர்த்தி மீண்டும் கொண்டு வர வேண்டும்.\n\n💡 *குறிப்பு:* கொண்டு வருவதற்கு முன் 1 நாள் வெயிலில் சீராக உலர்த்தி கொண்டு வந்தால் சென்சாரில் உடனடி 'Pass' பெறலாம்!"
      : "💧 **Procurement Moisture Standards & Rules:**\n\n• **Ideal Moisture**: Under 17.0% moisture guarantees full 100% MSP payout.\n• **17.1% - 19.0%**: Permitted with a minor moisture dockage deduction.\n• **Above 19.0%**: Requires sun-drying before counter weighment.\n\n💡 *Tip:* Sun-dry your harvested crop on clean tarpaulin for 1 full sunny day prior to loading your truck to pass digital moisture meters with ease.";
  }

  // 7. Token / WhatsApp / Gate Pass
  if (q.includes('token') || q.includes('whatsapp') || q.includes('pass') || q.includes('sms') || q.includes('டோக்கன்') || q.includes('வாட்ஸ்அப்')) {
    return isTamil
      ? "📱 **வாட்ஸ்அப் டோக்கன் பெறும் எளிய வழிகள்:**\n\n1. முகப்பில் 'பயிர் சேர்க்க (Add Crop)' சென்று விவரங்களை பதிவு செய்யுங்கள்.\n2. பரிந்துரைக்கப்பட்ட மையத்தை தேர்வு செய்து உங்கள் நேரத்தை கிளிக் செய்யுங்கள்.\n3. ₹50 சரிபார்ப்புக் கட்டணம் செலுத்திய உடனே உங்கள் வாட்ஸ்அப் எண்ணிற்கு அதிகாரப்பூர்வ QR டோக்கன் வந்து சேரும்!\n4. மைய நுழைவாயிலில் இந்த செய்தியைக் காண்பித்து நேரடி கவுண்டருக்கு செல்லலாம்."
      : "📱 **How to Receive Your WhatsApp Slot Token:**\n\n1. Go to **Add Crop** in your dashboard and enter harvest quantity.\n2. Choose your preferred procurement center and pick an arrival time slot.\n3. Pay the ₹50 verification fee.\n4. AgriProcure instantly dispatches your **Official QR Gate Token** directly to your registered WhatsApp number!\n5. Flash the message at the center gate for express entry.";
  }

  // 8. Queue / Centers / Wait time
  if (q.includes('queue') || q.includes('center') || q.includes('centre') || q.includes('wait') || q.includes('traffic') || q.includes('வரிசை') || q.includes('மையம்') || q.includes('காத்திருப்பு')) {
    return isTamil
      ? "🏛️ **தற்போதைய கொள்முதல் மைய நேரலை நிலவரம்:**\n\n• **அம்பாசமுத்திரம் மையம்**: 🟢 மிகக் குறைந்த நெரிசல் (9 விவசாயிகள் வரிசையில், 14 நிமிடம் காத்திருப்பு, 3 கவுண்டர்கள் இயங்குகின்றன).\n• **திருநெல்வேலி மையம்**: 🟢 உகந்த நிலை (18 விவசாயிகள், 22 நிமிடம் காத்திருப்பு, 5 கவுண்டர்கள்).\n• **பாளையங்கோட்டை மையம்**: 🟡 மிதமான நெரிசல் (31 விவசாயிகள், 38 நிமிடம் காத்திருப்பு).\n\n💡 *பரிந்துரை:* விரைவாக வண்டியை காலி செய்ய அம்பாசமுத்திரம் அல்லது திருநெல்வேலியில் காலை 9 - 11 AM நேரத்தை தேர்வு செய்யவும்."
      : "🏛️ **Live Center Queue & Wait Time Intelligence:**\n\n• **Ambasamudram Center**: 🟢 FASTEST (9 farmers in queue, 14 mins avg wait, 3 active counters).\n• **Tirunelveli Procurement Center**: 🟢 NORMAL (18 farmers in queue, 22 mins avg wait, 5 active counters).\n• **Palayamkottai Center**: 🟡 MODERATE (31 farmers in queue, 38 mins avg wait, 4 counters).\n\n💡 *AI Advice:* Booking a morning slot between 09:00 AM - 11:00 AM avoids midday truck queues.";
  }

  // 9. Conversational general fallback that answers intelligently
  return isTamil
    ? `உங்கள் கேள்விக்கு "${rawQuery}" அக்ரி AI ஆலோசனை: விவசாய அறுவடை மற்றும் கொள்முதலை பொறுத்தவரை, தற்போதைய பருவத்திற்கு நெல் மற்றும் மக்காச்சோளம் நல்ல அரசு ஆதரவு விலையை (MSP) தருகின்றன. கொள்முதல் மையத்திற்கு கொண்டு வரும் போது தானிய ஈரப்பதம் 17%க்குள் இருப்பதை உறுதி செய்யுங்கள். முன்பதிவு மற்றும் டோக்கன் விவரங்களுக்கு முகப்பில் உள்ள வழிகாட்டியை பயன்படுத்தலாம்!`
    : `Regarding your query "${rawQuery}": For smooth farm harvest operations, optimal seasonal returns are currently seen in Paddy (MSP ₹2,320/qtl) and Maize (MSP ₹2,225/qtl). When bringing crops to the procurement center, ensure moisture is kept below 17% for instant quality approval. You can book arrival slots directly from your dashboard!`;
}

export default function GeminiAiAssistant() {
  const { state } = useApp();
  const isTamil = state.language === 'Tamil';
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: isTamil 
        ? "வணக்கம்! நான் உங்கள் Agri AI உதவியாளர். சிறந்த பயிர் தேர்வுகள், இன்றைய MSP விலை, அனுமதிக்கப்பட்ட ஈரப்பதம் அல்லது முன்பதிவு குறித்து ஏதேனும் கேள்விகள் கேட்கலாம்."
        : "Vanakkam! I am your Agri AI Assistant. Ask me about best crops for this season, today's MSP prices, moisture rules, or procurement slot tokens.",
      time: "Just now"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (open) {
      scrollToBottom();
    }
  }, [messages, open]);

  const handleSend = (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = {
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const replyText = generateSmartAIResponse(query, isTamil);

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 550);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      
      {/* Floating Circle Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          title="Agri AI Assistant"
          className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-field-800 via-field-700 to-emerald-600 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all ai-glow"
        >
          {/* Sparkle Glow Ring */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-harvest-400 via-field-500 to-emerald-400 opacity-60 blur-xs group-hover:opacity-100 transition" />
          
          <div className="relative flex items-center justify-center w-full h-full rounded-full bg-field-900 border-2 border-white/25">
            <Sparkles className="w-6 h-6 text-harvest-300 animate-pulse" />
          </div>

          {/* Online status indicator */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border border-white"></span>
          </span>

          {/* Hover Tooltip Tag */}
          <span className="absolute right-16 px-3 py-1.5 rounded-xl bg-field-950/90 text-white text-xs font-bold whitespace-nowrap shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity backdrop-blur-sm border border-field-700/50">
            🤖 Agri AI
          </span>
        </button>
      )}

      {/* Interactive Chat Window */}
      {open && (
        <div className="w-[90vw] sm:w-[380px] h-[520px] rounded-3xl border-2 border-field-600 bg-husk-100 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-field-900 via-field-800 to-field-700 px-4 py-3.5 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center backdrop-blur-xs">
                <Sparkles className="w-5 h-5 text-harvest-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-display font-bold text-sm text-white leading-tight">Agri AI Assistant</h4>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/20 text-field-100">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-field-200 font-medium">
                  {isTamil ? 'அரசு கொள்முதல் வழிகாட்டி' : 'Government Procurement Guide'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-xl hover:bg-white/15 text-field-100 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick FAQ Pills */}
          <div className="bg-husk-50 px-3 py-2 border-b border-husk-200 flex gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_PROMPTS.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSend(isTamil ? p.ta : p.en)}
                className="shrink-0 text-[11px] font-semibold bg-husk-100 hover:bg-field-50 text-soil-700 hover:text-field-900 border border-husk-200 rounded-lg px-2.5 py-1 transition-all shadow-2xs"
              >
                {isTamil ? p.ta : p.en}
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col max-w-[85%] ${
                  m.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                }`}
              >
                <div
                  className={`rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-medium leading-relaxed shadow-xs ${
                    m.sender === 'user'
                      ? 'bg-field-800 text-white rounded-br-xs'
                      : 'bg-husk-50 text-soil-800 border border-husk-200 rounded-bl-xs whitespace-pre-line'
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[10px] text-soil-400 mt-1 px-1">{m.time}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 bg-husk-50 border border-husk-200 rounded-2xl px-3 py-2 w-fit text-soil-500">
                <span className="w-1.5 h-1.5 rounded-full bg-field-600 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-field-600 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-field-600 animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-husk-100 border-t border-husk-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isTamil ? "AI-யிடம் தமிழில் கேளுங்கள்..." : "Ask Agri AI anything..."}
              className="flex-1 rounded-xl bg-husk-50 border border-husk-200 px-3.5 py-2.5 text-xs sm:text-sm text-soil-800 outline-none focus:border-field-600 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-10 h-10 rounded-xl bg-field-800 hover:bg-field-900 disabled:opacity-50 text-white flex items-center justify-center transition active:scale-95 shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}
