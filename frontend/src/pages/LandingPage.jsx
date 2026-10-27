import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../data/translations';
import ThemeToggle from '../components/ThemeToggle';
import { 
  Leaf, 
  LineChart, 
  MapPin, 
  Clock, 
  CalendarCheck, 
  ShieldAlert, 
  Bot 
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { state, update } = useApp();
  const isTamil = state.language === 'Tamil';

  // Hardcoded text to perfectly match the user's explicit SaaS spec (can be moved to translations.js later)
  const text = isTamil ? {
    home: "முகப்பு", about: "பற்றி", features: "அம்சங்கள்", how: "செயல்முறை",
    farmerLogin: "விவசாயி உள்நுழைவு", registerFarmer: "விவசாயியாக பதிவு செய்க", officerLogin: "அதிகாரி உள்நுழைவு",
    title: "ஸ்மார்ட் விவசாய கொள்முதல்",
    subtitle: "சரியான நேரத்தில் சரியான கொள்முதல் மையத்துடன் விவசாயிகளை இணைக்கிறது.",
    desc: "AI அடிப்படையிலான தேவை முன்னறிவிப்பு, மைய பரிந்துரை மற்றும் வரிசை மேலாண்மை தளம்.",
    featuresHeading: "தளத்தின் அம்சங்கள்",
    featuresSubheading: "திறன், வெளிப்படைத்தன்மை மற்றும் நேரலை நுண்ணறிவுக்காக உருவாக்கப்பட்டது.",
    howHeading: "செயல்முறை விளக்கம்",
    howSubheading: "அறுவடை முதல் வங்கி வரவு வரையிலான எளிய வழிமுறை.",
    imFarmer: "நான் ஒரு விவசாயி", imOfficer: "நான் ஒரு அதிகாரி"
  } : {
    home: "Home", about: "About", features: "Features", how: "How It Works",
    farmerLogin: "Farmer Login", registerFarmer: "Register as Farmer", officerLogin: "Officer Login",
    title: "Smart Agricultural Procurement",
    subtitle: "Connecting farmers with the right procurement centre at the right time.",
    desc: "AI-powered demand forecasting, centre recommendation and queue management platform.",
    featuresHeading: "Platform Features",
    featuresSubheading: "Built for scale, efficiency, and real-time intelligence.",
    howHeading: "How It Works",
    howSubheading: "A seamless journey from harvest to payment.",
    imFarmer: "I'm a Farmer", imOfficer: "I'm an Officer"
  };

  const features = [
    { icon: LineChart, title: "Demand Forecasting", titleTa: "தேவை முன்கணிப்பு", desc: "Predict upcoming procurement demand.", descTa: "எதிர்கால கொள்முதல் தேவையை துல்லியமாக கணிக்கும்." },
    { icon: MapPin, title: "Smart Centre Matching", titleTa: "மையப் பொருத்தம்", desc: "Find the most suitable procurement centre.", descTa: "பொருத்தமான அருகில் உள்ள கொள்முதல் மையத்தை கண்டறியும்." },
    { icon: Clock, title: "ETA Prediction", titleTa: "நேர கணிப்பு", desc: "Know your expected waiting time.", descTa: "உங்கள் காத்திருப்பு நேரத்தை முன்கூட்டியே அறியலாம்." },
    { icon: CalendarCheck, title: "Smart Slot Allocation", titleTa: "ஸ்லாட் ஒதுக்கீடு", desc: "Get the best available procurement slot.", descTa: "சிறந்த முன்பதிவு நேரத்தை எளிதாக தேர்வு செய்யலாம்." },
    { icon: ShieldAlert, title: "Overload Prevention", titleTa: "நெரிசல் தடுப்பு", desc: "Detect centre congestion before it happens.", descTa: "மைய நெரிசலை முன்கூட்டியே கண்டறிந்து தவிர்க்கும்." },
    { icon: Bot, title: "AI Decision Support", titleTa: "AI முடிவு ஆதரவு", desc: "Help officers make faster decisions.", descTa: "அதிகாரிகள் விரைவாக முடிவெடுக்க AI உதவி செய்கிறது." },
  ];

  const steps = isTamil ? [
    "பதிவு செய்க", "பயிர் விவரம்", "AI மையம் தேர்வு", "நேரம் முன்பதிவு", "நேரலை கண்காணிப்பு", "MSP வங்கி வரவு"
  ] : [
    "Register", "Declare Crop", "AI Finds Centre", "Book Slot", "Track Procurement", "Receive Payment"
  ];

  return (
    <div className="min-h-screen bg-husk-50 text-soil-800 font-body flex flex-col">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 bg-husk-100/90 backdrop-blur-md border-b border-husk-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-field-100 border border-field-200 shadow-sm">
            <Leaf className="w-6 h-6 text-field-700" />
          </div>
          <span className="font-display text-2xl font-bold tracking-tight text-field-900">
            {isTamil ? 'அக்ரிப்ரோக்யூர்' : 'AgriProcure'}
          </span>
        </div>

        <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-soil-700">
          <a href="#home" className="hover:text-field-800 transition-colors">{text.home}</a>
          <a href="#about" className="hover:text-field-800 transition-colors">{text.about}</a>
          <a href="#features" className="hover:text-field-800 transition-colors">{text.features}</a>
          <a href="#how-it-works" className="hover:text-field-800 transition-colors">{text.how}</a>
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex bg-husk-100 p-1 rounded-lg border border-husk-200" role="group">
            <button onClick={() => update({ language: 'English' })} className={`rounded px-3 py-1 text-xs font-bold transition-all ${!isTamil ? 'bg-husk-100 text-field-900 shadow-sm' : 'text-soil-600 hover:text-soil-800'}`}>EN</button>
            <button onClick={() => update({ language: 'Tamil' })} className={`rounded px-3 py-1 text-xs font-bold transition-all ${isTamil ? 'bg-husk-100 text-field-900 shadow-sm' : 'text-soil-600 hover:text-soil-800'}`}>தமிழ்</button>
          </div>
          
          <ThemeToggle className="hidden sm:flex" />

          <div className="hidden md:flex gap-3">
             <button onClick={() => navigate('/farmer-login')} className="text-sm font-bold text-field-800 hover:text-field-900 px-2">{text.farmerLogin}</button>
             <button onClick={() => navigate('/officer-login')} className="rounded-md bg-field-800 px-4 py-2 text-sm font-bold text-husk-50 shadow-sm hover:bg-field-900 transition-colors">{text.officerLogin}</button>
          </div>
        </div>
      </header>

      <main className="flex-1">
         {/* HERO SECTION */}
         <section id="home" className="relative px-6 py-20 md:py-32 lg:px-12 max-w-7xl mx-auto flex flex-col items-center text-center">
            <h1 className="font-display text-5xl md:text-7xl font-extrabold leading-tight tracking-tighter text-field-900 max-w-4xl">
              {text.title}
            </h1>
            <p className="mt-6 text-xl md:text-2xl font-medium text-soil-700 max-w-3xl">
              {text.subtitle}
            </p>
            <p className="mt-4 text-lg text-soil-600 max-w-2xl">
              {text.desc}
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center">
               <button onClick={() => navigate('/farmer-login')} className="w-full sm:w-auto justify-center rounded-xl bg-field-800 px-8 py-4 text-lg font-bold text-husk-50 shadow-lg hover:bg-field-900 hover:shadow-xl transition-all active:scale-95">
                 {text.farmerLogin}
               </button>
               <button onClick={() => navigate('/farmer-register')} className="w-full sm:w-auto justify-center rounded-xl bg-husk-100 border-2 border-field-200 px-8 py-4 text-lg font-bold text-soil-800 shadow-sm hover:border-field-400 hover:bg-husk-50 transition-all active:scale-95">
                 {text.registerFarmer}
               </button>
            </div>
            <div className="mt-6">
               <button onClick={() => navigate('/officer-login')} className="text-sm font-bold text-soil-500 hover:text-field-800 underline transition-colors">
                 {text.officerLogin}
               </button>
            </div>
         </section>

         {/* FEATURES SECTION */}
         <section id="features" className="bg-husk-100 border-y border-husk-200 py-20 px-6 lg:px-12">
            <div className="max-w-7xl mx-auto">
               <div className="text-center mb-16">
                  <h2 className="font-display text-3xl md:text-4xl font-bold text-field-900">{text.featuresHeading}</h2>
                  <p className="mt-4 text-lg text-soil-600">{text.featuresSubheading}</p>
               </div>

               <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {features.map((f, idx) => {
                    const Icon = f.icon;
                    return (
                      <div key={idx} className="rounded-2xl border border-husk-200 bg-husk-50 p-8 hover:shadow-md transition-shadow hover-lift group">
                        <div className="w-12 h-12 rounded-xl bg-field-100 text-field-800 flex items-center justify-center mb-5 group-hover:bg-field-800 group-hover:text-white transition-colors">
                          <Icon className="w-6 h-6" />
                        </div>
                        <h3 className="font-display text-xl font-bold text-soil-800 mb-2">
                          {isTamil ? f.titleTa : f.title}
                        </h3>
                        <p className="text-soil-600 font-medium leading-relaxed text-sm">
                          {isTamil ? f.descTa : f.desc}
                        </p>
                      </div>
                    );
                  })}
               </div>
            </div>
         </section>

         {/* HOW IT WORKS SECTION */}
         <section id="how-it-works" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto">
            <div className="text-center mb-16">
               <h2 className="font-display text-3xl md:text-4xl font-bold text-field-900">{text.howHeading}</h2>
               <p className="mt-4 text-lg text-soil-600">{text.howSubheading}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
               {steps.map((step, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center relative">
                     <div className="w-16 h-16 rounded-full bg-field-100 text-field-800 flex items-center justify-center font-display text-2xl font-bold mb-4 border-4 border-white shadow-sm relative z-10">
                        {idx + 1}
                     </div>
                     <p className="font-bold text-soil-800">{step}</p>
                     
                     {/* Connector line for desktop */}
                     {idx < steps.length - 1 && (
                        <div className="hidden lg:block absolute top-8 left-[60%] right-[-40%] h-0.5 bg-husk-200 z-0"></div>
                     )}
                  </div>
               ))}
            </div>
         </section>
      </main>
    </div>
  );
}
