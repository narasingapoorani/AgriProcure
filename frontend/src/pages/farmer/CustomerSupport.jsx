import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translateToTamilAI, translateTamilToEnglishAI } from '../../services/aiTranslation';

const faqs = [
  {
    q: 'How do I add my crop details?',
    qTa: 'என் பயிர் விவரங்களை எப்படி சேர்ப்பது?',
    a: 'Go to "Add Crop" from the sidebar, fill in your crop type, land area, and expected quantity. Our AI will automatically find the best procurement centres for you.',
    aTa: 'பக்கப்பட்டியில் "பயிர் சேர்க்க" என்பதை கிளிக் செய்து, பயிர் வகை, நில அளவு மற்றும் எதிர்பார்க்கும் அளவை நிரப்பவும். AI தானாக சிறந்த மையங்களைக் கண்டறியும்.',
  },
  {
    q: 'When will my WhatsApp token arrive?',
    qTa: 'என் WhatsApp டோக்கன் எப்போது வரும்?',
    a: 'After you complete the ₹50 slot verification payment, your token is instantly generated and sent to your registered WhatsApp number.',
    aTa: '₹50 கட்டணம் செலுத்திய உடனே, உங்கள் டோக்கன் தானாக உருவாக்கப்பட்டு, பதிவு செய்த WhatsApp எண்ணிற்கு அனுப்பப்படும்.',
  },
  {
    q: 'How do I check my queue position?',
    qTa: 'என் வரிசை நிலையை எப்படி பார்ப்பது?',
    a: 'After your slot is confirmed and payment done, go to "Live Queue" in the sidebar to see your real-time position and estimated wait time.',
    aTa: 'முன்பதிவு உறுதி மற்றும் கட்டணம் முடிந்த பிறகு, பக்கப்பட்டியில் "நேரலை வரிசை" என்பதை கிளிக் செய்யுங்கள்.',
  },
  {
    q: 'When will I receive my MSP payment?',
    qTa: 'என் MSP தொகை எப்போது கிடைக்கும்?',
    a: 'After weighment and quality inspection at the centre, your MSP payment is directly transferred to your registered bank account within 48 hours via RazorpayX.',
    aTa: 'மையத்தில் எடை மற்றும் தர பரிசோதனை முடிந்த 48 மணி நேரத்தில், MSP தொகை நேரடியாக உங்கள் வங்கிக் கணக்கிற்கு RazorpayX மூலம் வரவு வைக்கப்படும்.',
  },
  {
    q: 'What if I need to change my slot time?',
    qTa: 'முன்பதிவு நேரத்தை மாற்ற வேண்டுமா?',
    a: 'Contact our support team at 1800-123-4567 at least 24 hours before your scheduled slot.',
    aTa: 'உங்கள் முன்பதிவு நேரத்திற்கு குறைந்தது 24 மணி நேரம் முன்பு 1800-123-4567 என்ற எண்ணில் தொடர்பு கொள்ளுங்கள்.',
  },
  {
    q: 'My crop was rejected at quality inspection. What do I do?',
    qTa: 'தரப் பரிசோதனையில் என் பயிர் நிராகரிக்கப்பட்டது. என்ன செய்வது?',
    a: 'A rejection note will be issued. You may re-apply after addressing the quality issues. Contact support for details on the rejection reason.',
    aTa: 'நிராகரிப்பு குறிப்பு வழங்கப்படும். தர சிக்கல்களை சரிசெய்த பிறகு மீண்டும் விண்ணப்பிக்கலாம்.',
  },
];

export default function CustomerSupport() {
  const { state } = useApp();
  const isTamil = state.language === 'Tamil';
  const [openFaq, setOpenFaq] = useState(null);
  const [ticketForm, setTicketForm] = useState({ issue: '', desc: '', submitted: false });
  const [aiTranslating, setAiTranslating] = useState(false);
  const [aiTranslationResult, setAiTranslationResult] = useState('');

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    if (!ticketForm.issue || !ticketForm.desc) return;

    setAiTranslating(true);
    try {
      if (isTamil) {
        const enText = await translateTamilToEnglishAI(ticketForm.desc);
        setAiTranslationResult(enText);
      } else {
        const taText = await translateToTamilAI(ticketForm.desc);
        setAiTranslationResult(taText);
      }
    } catch {
      // fallback handled gracefully
    } finally {
      setAiTranslating(false);
      setTicketForm(f => ({ ...f, submitted: true }));

      try {
        const existing = JSON.parse(localStorage.getItem('agri_support_tickets') || '[]');
        const newTicket = {
          id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
          farmerName: state.farmerUser?.name || 'Farmer',
          farmerNameTa: state.farmerUser?.name || 'விவசாயி',
          phone: state.farmerUser?.phone || state.farmerUser?.mobile || '+91 98765 43210',
          center: state.selectedCenter?.name || 'APMC Procurement Hub',
          date: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          issueType: ticketForm.issue,
          issueTypeTa: ticketForm.issue,
          originalText: ticketForm.desc,
          englishTranslation: isTamil ? (aiTranslationResult || ticketForm.desc) : ticketForm.desc,
          status: 'Pending',
          statusTa: 'நிலுவையில்',
          priority: 'High',
          reply: ''
        };
        localStorage.setItem('agri_support_tickets', JSON.stringify([newTicket, ...existing]));
      } catch (err) {}
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full pb-12 flex flex-col gap-8">

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-field-900 via-field-800 to-field-700 px-8 py-10 shadow-xl text-white ai-glow">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 text-field-100">
            🎧 {isTamil ? 'அரசு ஆதரவு மையம்' : 'Government Support Centre'}
          </div>
          <h2 className="font-display text-3xl font-extrabold tracking-tight mb-2">
            {isTamil ? 'வாடிக்கையாளர் ஆதரவு' : 'Customer Support'}
          </h2>
          <p className="text-field-100 font-medium text-base max-w-lg">
            {isTamil
              ? 'உங்களுக்கு உதவ நாங்கள் இங்கே இருக்கிறோம். ஏதேனும் சந்தேகங்கள் இருந்தால் தொடர்பு கொள்ளவும்.'
              : 'We are here to help you with any questions about your crop procurement.'}
          </p>
        </div>
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a
          href="tel:18001234567"
          className="rounded-2xl border border-husk-200 bg-husk-100 p-5 flex flex-col items-center gap-3 shadow-sm hover-lift hover:border-field-400 transition-all text-center group"
        >
          <div className="w-12 h-12 rounded-full bg-field-100 text-field-800 flex items-center justify-center group-hover:bg-field-800 group-hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-field-900 text-sm">
              {isTamil ? 'தொலைபேசி ஆதரவு' : 'Phone Support'}
            </p>
            <p className="font-data text-lg font-bold text-field-700 mt-0.5">1800-123-4567</p>
            <p className="text-xs text-soil-500 mt-1">
              {isTamil ? 'இலவச அழைப்பு · காலை 8 - இரவு 8' : 'Toll Free · 8AM to 8PM'}
            </p>
          </div>
        </a>

        <a
          href="https://wa.me/918012345678"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-2xl border border-husk-200 bg-husk-100 p-5 flex flex-col items-center gap-3 shadow-sm hover-lift hover:border-[#25D366] transition-all text-center group"
        >
          <div className="w-12 h-12 rounded-full bg-[#dcfce7] flex items-center justify-center group-hover:bg-[#25D366] transition-colors">
            <svg className="w-6 h-6 text-[#15803d] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
          <div>
            <p className="font-bold text-field-900 text-sm">WhatsApp Support</p>
            <p className="font-data text-lg font-bold text-[#15803d] mt-0.5">+91 80123 45678</p>
            <p className="text-xs text-soil-500 mt-1">
              {isTamil ? 'உடனடி பதில் கிடைக்கும்' : 'Instant reply available'}
            </p>
          </div>
        </a>

        <div className="rounded-2xl border border-husk-200 bg-husk-100 p-5 flex flex-col items-center gap-3 shadow-sm hover-lift text-center">
          <div className="w-12 h-12 rounded-full bg-sky-50 flex items-center justify-center">
            <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-field-900 text-sm">
              {isTamil ? 'மின்னஞ்சல்' : 'Email Support'}
            </p>
            <p className="text-sm font-bold text-sky-700 mt-0.5">support@agriprocure.gov.in</p>
            <p className="text-xs text-soil-500 mt-1">
              {isTamil ? '24 மணி நேரத்தில் பதில்' : 'Reply within 24 hours'}
            </p>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="rounded-3xl border border-husk-200 bg-husk-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-husk-200 flex items-center gap-2">
          <span className="text-xl">❓</span>
          <h3 className="font-display text-lg font-bold text-field-900">
            {isTamil ? 'அடிக்கடி கேட்கப்படும் கேள்விகள்' : 'Frequently Asked Questions'}
          </h3>
        </div>
        <div className="divide-y divide-husk-200">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-husk-50 transition-colors group"
              >
                <span className="font-semibold text-soil-800 text-sm pr-4 group-hover:text-field-900">
                  {isTamil ? faq.qTa : faq.q}
                </span>
                <span className={`text-field-700 text-lg shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}>
                  ▾
                </span>
              </button>
              {openFaq === i && (
                <div className="px-6 pb-5 text-sm text-soil-700 leading-relaxed bg-field-50/50 border-t border-husk-100">
                  <p className="pt-3">{isTamil ? faq.aTa : faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Raise a Ticket with AI Auto-Translation */}
      <div className="rounded-3xl border border-husk-200 bg-husk-100 shadow-sm p-6 sm:p-8">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎫</span>
            <h3 className="font-display text-lg font-bold text-field-900">
              {isTamil ? 'புகார் / கோரிக்கை பதிவு' : 'Raise a Support Ticket'}
            </h3>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-field-50 border border-field-200 text-xs font-semibold text-field-800">
            <span className="h-1.5 w-1.5 rounded-full bg-field-600 animate-pulse" />
            🤖 {isTamil ? 'AI தானியங்கி மொழிபெயர்ப்பு' : 'AI Auto-Translation Enabled'}
          </span>
        </div>

        {ticketForm.submitted ? (
          <div className="rounded-2xl bg-field-50 border border-field-200 p-6 text-center flex flex-col items-center gap-3">
            <div className="w-14 h-14 bg-field-100 text-field-800 rounded-full flex items-center justify-center text-2xl font-bold">✓</div>
            <p className="font-bold text-field-900 text-lg">
              {isTamil ? 'புகார் வெற்றிகரமாக பதிவு செய்யப்பட்டது!' : 'Ticket Raised Successfully!'}
            </p>
            <p className="text-sm text-soil-600 max-w-md">
              {isTamil
                ? 'உங்கள் புகார் எண்: #TKT-2891. அதிகாரிகள் மதிப்பாய்வு செய்து 24 மணி நேரத்தில் WhatsApp வழியாக தொடர்பு கொள்வார்கள்.'
                : 'Ticket ID: #TKT-2891. Officers will review and contact you within 24 hours via WhatsApp.'}
            </p>
            <button
              onClick={() => { setTicketForm({ issue: '', desc: '', submitted: false }); setAiTranslationResult(''); }}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-field-800 px-6 py-3 text-sm font-bold text-white hover:bg-field-900 transition-all shadow-sm"
            >
              {isTamil ? 'மேலும் ஒரு புகார் பதிவு செய்க' : 'Raise another ticket'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleTicketSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-bold text-soil-700 mb-1.5 block">
                {isTamil ? 'சிக்கல் வகை' : 'Issue Type'}
              </label>
              <select
                value={ticketForm.issue}
                onChange={e => setTicketForm(f => ({ ...f, issue: e.target.value }))}
                className="w-full rounded-xl border-2 border-husk-200 bg-husk-50 px-4 py-3 text-base text-soil-800 font-semibold outline-none focus:border-field-600 transition-all"
                required
              >
                <option value="">{isTamil ? 'வகையைத் தேர்ந்தெடுக்கவும்…' : 'Select issue type…'}</option>
                <option value="payment">{isTamil ? 'கட்டண சிக்கல்' : 'Payment Issue'}</option>
                <option value="token">{isTamil ? 'டோக்கன் சிக்கல்' : 'Token / WhatsApp Issue'}</option>
                <option value="slot">{isTamil ? 'முன்பதிவு நேர மாற்றம்' : 'Slot Change Request'}</option>
                <option value="quality">{isTamil ? 'தர பரிசோதனை மறுப்பு' : 'Quality Inspection Rejection'}</option>
                <option value="msp">{isTamil ? 'MSP கொடுப்பனவு தாமதம்' : 'MSP Payout Delay'}</option>
                <option value="other">{isTamil ? 'மற்றவை' : 'Other'}</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-bold text-soil-700 mb-1.5 block">
                {isTamil ? 'விரிவான விளக்கம்' : 'Describe your issue'}
              </label>
              <textarea
                value={ticketForm.desc}
                onChange={e => setTicketForm(f => ({ ...f, desc: e.target.value }))}
                placeholder={isTamil ? 'உங்கள் சிக்கலை தமிழில் எழுதலாம். AI தானாக மொழிபெயர்க்கும்…' : 'Describe your issue. AI will translate automatically for officers…'}
                rows={4}
                className="w-full rounded-xl border-2 border-husk-200 bg-husk-50 px-4 py-3 text-base text-soil-800 outline-none focus:border-field-600 transition-all resize-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={aiTranslating}
              className="w-full rounded-xl bg-field-800 px-6 py-4 text-base font-bold text-white shadow-md hover:bg-field-900 transition-all active:scale-95 ai-glow flex items-center justify-center gap-2"
            >
              {aiTranslating ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {isTamil ? 'AI செயலாக்குகிறது…' : 'AI Processing…'}
                </>
              ) : (
                isTamil ? 'புகார் / கோரிக்கை அனுப்பு' : 'Submit Ticket'
              )}
            </button>
          </form>
        )}
      </div>

      {/* Operating Hours */}
      <div className="rounded-2xl border border-husk-200 bg-husk-100 p-5 shadow-sm">
        <h4 className="font-bold text-soil-800 mb-3 text-sm uppercase tracking-wider">
          {isTamil ? '⏰ ஆதரவு நேரம்' : '⏰ Support Hours'}
        </h4>
        <div className="grid sm:grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between text-soil-700">
            <span>{isTamil ? 'திங்கள் – வெள்ளி' : 'Monday – Friday'}</span>
            <span className="font-bold">8:00 AM – 8:00 PM</span>
          </div>
          <div className="flex justify-between text-soil-700">
            <span>{isTamil ? 'சனி – ஞாயிறு' : 'Saturday – Sunday'}</span>
            <span className="font-bold">9:00 AM – 5:00 PM</span>
          </div>
          <div className="flex justify-between text-soil-700 sm:col-span-2">
            <span>{isTamil ? 'WhatsApp ஆதரவு' : 'WhatsApp Support'}</span>
            <span className="font-bold text-field-700">{isTamil ? '24 மணி நேரமும்' : '24 × 7'}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
