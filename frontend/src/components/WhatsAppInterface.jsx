import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function WhatsAppInterface({
  token = 'A-214',
  slotNumber = 'SLT-2819',
  centerName = 'Ambasamudram Center',
  date = '10 Sep 2026',
  time = '10:30 AM',
  waitMin = 24,
  farmerName,
  mobile = '9876543210',
}) {
  const { state } = useApp();
  const isTamil = state.language === 'Tamil';
  const [expanded, setExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  const effectiveFarmer = farmerName || state.farmerUser?.name || (isTamil ? 'விவசாயி' : 'Farmer');

  const messageText = isTamil
    ? `🌾 *அக்ரிப்ரோக்யூர் கொள்முதல் உறுதிப்படுத்தல்*

வணக்கம் ${effectiveFarmer}, உங்கள் கொள்முதல் நேரம் வெற்றிகரமாக உறுதி செய்யப்பட்டுள்ளது!

📍 *கொள்முதல் மையம்:* ${centerName}
🎟️ *டோக்கன் எண்:* ${token} (${slotNumber})
📅 *தேதி:* ${date}
⏰ *வருகை நேரம்:* ${time}
⏱️ *மதிப்பிடப்பட்ட காத்திருப்பு:* ${waitMin} நிமிடங்கள்

நுழைவு வாயிலில் இந்த டோக்கன் எண்ணைக் காண்பிக்கவும்.`
    : `🌾 *AGRIPROCURE SLOT CONFIRMATION*

Vanakkam ${effectiveFarmer}, your harvest procurement slot is confirmed!

📍 *Center:* ${centerName}
🎟️ *Token Number:* ${token} (${slotNumber})
📅 *Date:* ${date}
⏰ *Slot Time:* ${time}
⏱️ *Est. Wait:* ${waitMin} minutes

Please display this token message at the entry gate counter.`;

  const waShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-emerald-200 bg-husk-100 shadow-md">
      {/* WhatsApp Official Top Banner */}
      <div className="flex items-center justify-between bg-[#075e54] px-4 py-3 text-white">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700 text-xl font-bold shadow-xs">
            🌾
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#075e54] bg-[#25d366]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm tracking-wide">AgriProcure Bot</span>
              <svg className="h-3.5 w-3.5 fill-emerald-300" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <span className="rounded bg-emerald-800/80 px-1.5 py-0.2 text-[9px] font-medium text-emerald-200 uppercase">
                Official
              </span>
            </div>
            <p className="text-[11px] text-emerald-100/80">
              {isTamil ? 'வாட்ஸ்அப் வணிக கணக்கு · ஆன்லைன்' : 'WhatsApp Business Account · Online'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-800/60 px-2.5 py-1 text-[11px] font-medium text-emerald-100 flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#25d366] animate-pulse" />
            {isTamil ? 'அனுப்பப்பட்டது' : 'Delivered'}
          </span>
          <button
            type="button"
            onClick={() => setExpanded((o) => !o)}
            className="rounded p-1 text-emerald-100 hover:bg-emerald-800/50"
            title="Toggle WhatsApp preview"
          >
            {expanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {expanded && (
        <>
          {/* Chat Background & Message Area */}
          <div
            className="p-4 relative"
            style={{
              backgroundColor: '#efeae2',
              backgroundImage:
                'radial-gradient(#d1c7b7 0.75px, transparent 0.75px), radial-gradient(#d1c7b7 0.75px, #efeae2 0.75px)',
              backgroundSize: '30px 30px',
              backgroundPosition: '0 0, 15px 15px',
            }}
          >
            {/* End to End Encryption Alert */}
            <div className="mb-3 mx-auto max-w-xs rounded-lg bg-[#ffeecd] px-3 py-1.5 text-center text-[11px] text-soil-700 shadow-xs">
              🔒 {isTamil ? 'செய்திகள் முனையிலிருந்து முனை வரை குறியாக்கம் செய்யப்பட்டுள்ளன.' : 'Messages are end-to-end encrypted. No one outside of this chat can read them.'}
            </div>

            {/* Delivered WhatsApp Bubble */}
            <div className="max-w-md rounded-2xl rounded-tl-none bg-[#d9fdd3] p-4 text-soil-800 shadow-sm border border-emerald-100">
              <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2 mb-2.5">
                <span className="text-xs font-bold text-[#075e54] flex items-center gap-1">
                  <span>🌾</span> AgriProcure Verified Slot
                </span>
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                  TOKEN: {token}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-soil-800">
                <p className="font-semibold text-sm text-[#075e54]">
                  {isTamil ? `வணக்கம் ${effectiveFarmer}!` : `Vanakkam ${effectiveFarmer}!`}
                </p>
                <p>
                  {isTamil
                    ? 'உங்கள் அறுவடை கொள்முதல் நேரம் வெற்றிகரமாக திட்டமிடப்பட்டுள்ளது.'
                    : 'Your crop procurement appointment has been successfully scheduled.'}
                </p>

                <div className="mt-2.5 space-y-1 rounded-lg bg-husk-100/70 p-2.5 text-xs border border-emerald-200/40">
                  <p><span className="font-medium text-soil-600">📍 {isTamil ? 'மையம்' : 'Center'}:</span> <strong>{centerName}</strong></p>
                  <p><span className="font-medium text-soil-600">🎟️ {isTamil ? 'முன்பதிவு எண்' : 'Slot'}:</span> <strong className="font-data">{slotNumber}</strong></p>
                  <p><span className="font-medium text-soil-600">📅 {isTamil ? 'தேதி' : 'Date'}:</span> <strong>{date}</strong></p>
                  <p><span className="font-medium text-soil-600">⏰ {isTamil ? 'வருகை நேரம்' : 'Time'}:</span> <strong>{time}</strong></p>
                  <p><span className="font-medium text-soil-600">⏱️ {isTamil ? 'காத்திருப்பு' : 'Est. Wait'}:</span> <strong>{waitMin} {isTamil ? 'நிமிடங்கள்' : 'minutes'}</strong></p>
                </div>

                <p className="pt-1 text-[11px] text-soil-600">
                  {isTamil ? 'நுழைவு வாயிலில் இந்த டோக்கன் செய்தியை அலுவலரிடம் காண்பிக்கவும்.' : 'Show this WhatsApp token at the center verification desk.'}
                </p>
              </div>

              {/* Timestamp & Read Receipt Double Blue Ticks */}
              <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-soil-500">
                <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="text-sky-500 font-bold">✓✓</span>
              </div>

              {/* Interactive WhatsApp Quick Action Buttons */}
              <div className="mt-3 space-y-1.5 border-t border-emerald-200/60 pt-2.5">
                <a
                  href={waShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25d366] px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#20ba59] transition"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"/>
                  </svg>
                  <span>{isTamil ? 'வாட்ஸ்அப் செயலியில் திறக்கவும்' : 'Open in WhatsApp App / Web'}</span>
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="rounded-lg border border-emerald-600/40 bg-husk-100/90 px-2.5 py-1.5 text-xs font-medium text-emerald-900 hover:bg-emerald-50"
                  >
                    {copied ? (isTamil ? '✓ நகலெடுக்கப்பட்டது' : '✓ Copied') : (isTamil ? '📋 செய்தியை நகலெடு' : '📋 Copy Message')}
                  </button>
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 rounded-lg border border-emerald-600/40 bg-husk-100/90 px-2.5 py-1.5 text-xs font-medium text-emerald-900 hover:bg-emerald-50"
                  >
                    <span>🗺️</span> {isTamil ? 'வழிகாட்டுதல்' : 'Directions'}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Bottom Simulated Input Footer */}
          <div className="flex items-center justify-between border-t border-husk-200 bg-husk-50 px-4 py-2 text-xs text-soil-600">
            <span className="flex items-center gap-1.5 text-emerald-800 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              {isTamil
                ? `வாட்ஸ்அப் அறிவிப்புகள் இயக்கப்பட்டுள்ளன (+91 ${mobile})`
                : `WhatsApp alerts active (+91 ${mobile})`}
            </span>
            <span className="text-[11px] text-soil-500">AgriProcure Automated Channel</span>
          </div>
        </>
      )}
    </div>
  );
}
