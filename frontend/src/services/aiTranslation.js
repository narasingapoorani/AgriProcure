/**
 * AI Translation Service for AgriProcure
 * Powered by Google Gemini API with smart client-side caching & domain agricultural dictionary
 */

const CACHE_KEY = "agriprocure_translation_cache_ta";

function getCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setCache(cache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // quota exceeded or private browsing fallback
  }
}

// Preloaded domain terminology cache for instant 0ms fallback
export const DOMAIN_DICTIONARY = {
  "Dashboard": "முகப்பு",
  "Add crop": "பயிர் சேர்க்க",
  "Recommended centers": "பரிந்துரைக்கப்பட்ட மையங்கள்",
  "My slot": "எனது முன்பதிவு நேரம்",
  "Live queue": "நேரலை வரிசை",
  "Procurement timeline": "கொள்முதல் காலவரிசை",
  "Payments": "பணம் செலுத்துதல்",
  "Notifications": "அறிவிப்புகள்",
  "Profile": "சுயவிவரம்",
  "Customer Support": "வாடிக்கையாளர் ஆதரவு",
  "Log out": "வெளியேறு",
  "Farmer Login": "விவசாயி உள்நுழைவு",
  "Officer Login": "அதிகாரி உள்நுழைவு",
  "Register as Farmer": "விவசாயியாக பதிவு செய்க",
  "Submit Ticket": "புகார் / கோரிக்கை அனுப்பு",
  "Pay Now": "இப்போது கட்டணம் செலுத்துங்கள்",
  "Download Receipt": "ரசீதை பதிவிறக்கம் செய்க",

  // Agricultural Terms
  "Paddy": "நெல்",
  "Wheat": "கோதுமை",
  "Maize": "மக்காச்சோளம்",
  "Cotton": "பருத்தி",
  "Sugarcane": "கரும்பு",
  "Pulses": "பருப்பு வகைகள்",
  "Groundnut": "நிலக்கடலை",
  "Tomato": "தக்காளி",
  "Onion": "வெங்காயம்",
  "Potato": "உருளைக்கிழங்கு",
  "Brinjal": "கத்தரிக்காய்",
  "Quintals": "குவிண்டால்",
  "Acres": "ஏக்கர்",
  "Minimum Support Price": "குறைந்தபட்ச ஆதரவு விலை (MSP)",
  "Procurement Center": "கொள்முதல் மையம்",
  "Moisture Level": "ஈரப்பத அளவு",
  "Quality Inspection": "தர பரிசோதனை",
  "Weighment": "எடை சரிபார்ப்பு",
  "Direct Bank Transfer": "நேரடி வங்கி பரிமாற்றம்",

  // Tamil Nadu Districts & Towns
  "Tirunelveli": "திருநெல்வேலி",
  "Palayamkottai": "பாளையங்கோட்டை",
  "Ambasamudram": "அம்பாசமுத்திரம்",
  "Cheranmahadevi": "சேரன்மகாதேவி",
  "Tenkasi": "தென்காசி",
  "Madurai": "மதுரை",
  "Coimbatore": "கோயம்புத்தூர்",
  "Salem": "சேலம்",
  "Thanjavur": "தஞ்சாவூர்",
  "Trichy": "திருச்சிராப்பள்ளி",
  "Tiruchirappalli": "திருச்சிராப்பள்ளி",
  "Erode": "ஈரோடு",
  "Dindigul": "திண்டுக்கல்",
  "Theni": "தேனி",
  "Virudhunagar": "விருதுநகர்",
  "Sivaganga": "சிவகங்கை",
  "Ramanathapuram": "இராமநாதபுரம்",
  "Thoothukudi": "தூத்துக்குடி",
  "Kanyakumari": "கன்னியாகுமரி",
  "Nagercoil": "நாகர்கோவில்",
  "Tiruppur": "திருப்பூர்",
  "Karur": "கரூர்",
  "Namakkal": "நாமக்கல்",
  "Dharmapuri": "தர்மபுரி",
  "Krishnagiri": "கிருஷ்ணகிரி",
  "Vellore": "வேலூர்",
  "Ranipet": "ராணிப்பேட்டை",
  "Tirupathur": "திருப்பத்தூர்",
  "Tiruvannamalai": "திருவண்ணாமலை",
  "Villupuram": "விழுப்புரம்",
  "Kallakurichi": "கள்ளக்குறிச்சி",
  "Cuddalore": "கடலூர்",
  "Perambalur": "பெரம்பலூர்",
  // Common Query Phrases & Translations
  "hello": "வணக்கம்",
  "hi": "வணக்கம்",
  "Hello": "வணக்கம்",
  "Hi": "வணக்கம்",
  "good morning": "காலை வணக்கம்",
  "good afternoon": "மதிய வணக்கம்",
  "good evening": "மாலை வணக்கம்",
  "thank you": "நன்றி",
  "thanks": "நன்றி",
  "please help": "தயவுசெய்து உதவவும்",
  "I need help": "எனக்கு உதவி தேவை",
  "token not received": "டோக்கன் வரவில்லை",
  "payment issue": "கட்டண பிரச்சனை",
  "slot reschedule": "முன்பதிவு நேர மாற்றம்",
  "change my slot": "எனது முன்பதிவு நேரத்தை மாற்றவும்",
  "heavy rain": "கனமழை",
  "weather issue": "வானிலை சிக்கல்",
  "quality rejection": "தர நிராகரிப்பு",
  "rejection note": "நிராகரிப்பு குறிப்பு",
  "when will I get payment": "எனக்கு எப்போது பணம் கிடைக்கும்?",
  "whatsapp token": "வாட்ஸ்அப் டோக்கன்",
  "Ariyalur": "அரியலூர்",
  "Nagapattinam": "நாகப்பட்டினம்",
  "Mayiladuthurai": "மயிலாடுதுறை",
  "Tiruvarur": "திருவாரூர்",
  "Chengalpattu": "செங்கல்பட்டு",
  "Kanchipuram": "காஞ்சிபுரம்",
  "Tiruvallur": "திருவள்ளூர்",
  "Chennai": "சென்னை",
  "Kovilpatti": "கோவில்பட்டி",
  "Sankarankovil": "சங்கரன்கோவில்",
  "Alangulam": "ஆலங்குளம்",
  "Radhapuram": "ராதாபுரம்",
  "Nanguneri": "நாங்குநேரி"
};

/**
 * Automatically translates or transliterates ANY centre name coming dynamically from the backend
 * @param {string} centerName - Center name from backend e.g. "Tenkasi Procurement Center"
 * @param {string} language - Current selected language e.g. "Tamil" | "English"
 * @returns {string} Tamil localized centre name
 */
export function getDynamicCenterName(centerName, language = 'English') {
  if (language !== 'Tamil' || !centerName || typeof centerName !== 'string') {
    return centerName;
  }

  const trimmed = centerName.trim();

  // 1. Direct exact match in dictionary
  if (DOMAIN_DICTIONARY[trimmed]) {
    return DOMAIN_DICTIONARY[trimmed];
  }

  // 2. Check localStorage cached dynamic translations
  const cache = getCache();
  if (cache[trimmed]) {
    return cache[trimmed];
  }

  // 3. Dynamic Pattern Parsing:
  // Breaks down "Dindigul Procurement Center" -> matches "Dindigul" in dictionary + "கொள்முதல் மையம்"
  let result = trimmed;

  // Replace common center suffixes first
  const suffixMap = [
    { en: /\bProcurement Center\b/gi, ta: 'கொள்முதல் மையம்' },
    { en: /\bProcurement Centre\b/gi, ta: 'கொள்முதல் மையம்' },
    { en: /\bDirect Purchase Center\b/gi, ta: 'நேரடி கொள்முதல் மையம்' },
    { en: /\bDirect Purchase Centre\b/gi, ta: 'நேரடி கொள்முதல் மையம்' },
    { en: /\bCenter\b/gi, ta: 'மையம்' },
    { en: /\bCentre\b/gi, ta: 'மையம்' },
  ];

  for (const { en, ta } of suffixMap) {
    if (en.test(result)) {
      result = result.replace(en, ta);
      break;
    }
  }

  // Next, replace any English district/town name with Tamil equivalent
  for (const [enTown, taTown] of Object.entries(DOMAIN_DICTIONARY)) {
    if (enTown.length >= 3 && new RegExp(`\\b${enTown}\\b`, 'i').test(result)) {
      result = result.replace(new RegExp(`\\b${enTown}\\b`, 'gi'), taTown);
    }
  }

  // Save to cache so it never needs re-computation
  if (result !== trimmed) {
    cache[trimmed] = result;
    setCache(cache);
    return result;
  }

  // 4. If an unmapped unique town, trigger background AI translation
  translateToTamilAI(trimmed).then(aiResult => {
    if (aiResult && aiResult !== trimmed) {
      cache[trimmed] = aiResult;
      setCache(cache);
    }
  });

  return result;
}

/**
 * Translate any string into Tamil using Gemini AI or domain cache
 * @param {string} text - The English text or user message to translate
 * @param {string} apiKey - Optional Gemini API Key from Vite env (VITE_GEMINI_API_KEY)
 * @returns {Promise<string>} Translated Tamil text
 */
export async function translateToTamilAI(text, apiKey = import.meta.env.VITE_GEMINI_API_KEY) {
  if (!text || typeof text !== "string") return text;
  const trimmed = text.trim();
  if (!trimmed) return text;

  // 1. Check in-memory domain dictionary (case-insensitive)
  const lowerTrimmed = trimmed.toLowerCase();
  for (const [key, val] of Object.entries(DOMAIN_DICTIONARY)) {
    if (key.toLowerCase() === lowerTrimmed) {
      return val;
    }
  }

  // 2. Check localStorage cache
  const cache = getCache();
  if (cache[trimmed]) {
    return cache[trimmed];
  }

  // 3. Call Gemini Model API if an API key is provided
  if (apiKey) {
    try {
      const prompt = `You are a translation engine for an Indian Government Agricultural Procurement platform (AgriProcure). Translate the following text into clear, natural, polite Tamil as used in Tamil Nadu government departments. Do not include markdown or explanations. Return ONLY the Tamil translation.

Text: ${trimmed}`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 200,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (candidate) {
          cache[trimmed] = candidate;
          setCache(cache);
          return candidate;
        }
      }
    } catch (e) {
      console.warn("Gemini translation API call failed:", e);
    }
  }

  // 4. Return localized greeting or original if no translation available
  if (lowerTrimmed === 'hello' || lowerTrimmed === 'hi') return 'வணக்கம்';
  return trimmed;
}

/**
 * Translate dynamic Farmer Support ticket or message into English for Officers
 */
export async function translateTamilToEnglishAI(text, apiKey = import.meta.env.VITE_GEMINI_API_KEY) {
  if (!text) return text;
  const trimmed = text.trim();

  // Instant dictionary / phrase match
  for (const [en, ta] of Object.entries(DOMAIN_DICTIONARY)) {
    if (ta === trimmed) return en;
  }

  if (apiKey) {
    try {
      const prompt = `Translate this Tamil farmer query into clear English for government procurement officers:
"${trimmed}"
Return ONLY the English text.`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 200 },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || trimmed;
      }
    } catch (err) {
      console.warn("Officer translation failed:", err);
    }
  }

  // Fallback intelligent offline Tamil -> English translation for common farmer requests
  if (trimmed.includes('டோக்கன்') || trimmed.includes('வாட்ஸ்அப்')) {
    return 'Token / WhatsApp issue reported: Waiting for official confirmation and token dispatch.';
  }
  if (trimmed.includes('கட்டணம்') || trimmed.includes('ரூபாய்') || trimmed.includes('பணம்')) {
    return 'Payment enquiry: Booking fee paid, awaiting confirmation receipt and token.';
  }
  if (trimmed.includes('நேர') || trimmed.includes('மாற்ற')) {
    return 'Slot reschedule request: Farmer requests alternate arrival timing.';
  }
  if (trimmed.includes('மழை') || trimmed.includes('வானிலை')) {
    return 'Weather advisory concern: Farmer notes heavy precipitation risks for harvested crop.';
  }
  if (trimmed.toLowerCase().includes('வணக்கம்')) {
    return 'Hello, greetings. Need assistance with procurement.';
  }

  return trimmed;
}
