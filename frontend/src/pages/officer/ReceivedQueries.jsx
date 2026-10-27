import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../data/translations';
import { getDynamicCenterName } from '../../services/aiTranslation';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Send, 
  CheckCircle2, 
  Clock, 
  Languages, 
  User, 
  Phone, 
  Building2, 
  AlertCircle 
} from 'lucide-react';

export default function ReceivedQueries() {
  const { state } = useApp();
  const isTamil = state.language === 'Tamil';

  const [queries, setQueries] = useState(() => {
    try {
      const stored = localStorage.getItem('agri_support_tickets');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const selectedQuery = queries.find(q => q.id === selectedId) || (queries.length > 0 ? queries[0] : null);

  const filteredQueries = queries.filter(q => {
    const matchesSearch = 
      q.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.originalText.includes(searchTerm) ||
      q.englishTranslation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'All' || q.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSending(true);
    setTimeout(() => {
      setQueries(prev => prev.map(q => {
        if (q.id === selectedQuery.id) {
          return {
            ...q,
            status: 'Replied',
            statusTa: 'பதிலளிக்கப்பட்டது',
            reply: replyText.trim()
          };
        }
        return q;
      }));
      setReplyText('');
      setSending(false);
    }, 600);
  };

  return (
    <div className="w-full max-w-7xl mx-auto pb-12 flex flex-col gap-6">

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-field-900 via-field-800 to-field-700 px-8 py-8 shadow-xl text-white ai-glow">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2 text-field-100">
              <MessageSquare className="w-4 h-4 text-harvest-300" />
              {isTamil ? 'விவசாயிகள் உதவி & கோரிக்கை மையம்' : 'Farmer Inquiries & Grievances'}
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {isTamil ? 'பெறப்பட்ட புகார்கள் & கேள்விகள்' : 'Received Farmer Queries'}
            </h2>
            <p className="text-field-100 text-sm font-medium mt-1">
              {isTamil
                ? 'விவசாயிகள் அனுப்பிய கேள்விகள், AI இருமொழி மொழிபெயர்ப்பு மற்றும் நேரடி WhatsApp தீர்வுகள்.'
                : 'Manage incoming farmer support tickets with instant bilingual AI translation.'}
            </p>
          </div>

          <div className="bg-white/10 rounded-2xl px-5 py-3 border border-white/15 backdrop-blur-sm text-right">
            <span className="text-xs uppercase tracking-wider text-field-200 font-semibold block">
              {isTamil ? 'நிலுவையில் உள்ளவை' : 'Pending Queries'}
            </span>
            <span className="font-display text-2xl font-black tracking-tight text-white">
              {queries.filter(q => q.status === 'Pending').length} / {queries.length}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: QUERY INBOX LIST */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Search & Filter */}
          <div className="rounded-2xl border border-husk-200 bg-husk-100 p-3.5 shadow-sm flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-soil-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={isTamil ? 'தேடுக…' : 'Search query, farmer…'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-husk-200 bg-husk-50 text-xs font-semibold text-soil-800 outline-none focus:border-field-600"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border border-husk-200 bg-husk-50 px-3 py-2 text-xs font-bold text-soil-800 outline-none focus:border-field-600"
            >
              <option value="All">{isTamil ? 'அனைத்தும்' : 'All Status'}</option>
              <option value="Pending">{isTamil ? 'நிலுவையில்' : 'Pending'}</option>
              <option value="Replied">{isTamil ? 'பதிலளிக்கப்பட்டது' : 'Replied'}</option>
            </select>
          </div>

          {/* List items */}
          <div className="flex flex-col gap-2.5 max-h-[550px] overflow-y-auto">
            {filteredQueries.map((q) => {
              const isSelected = q.id === selectedQuery.id;
              return (
                <button
                  key={q.id}
                  onClick={() => setSelectedId(q.id)}
                  className={`rounded-2xl border p-4 text-left transition-all hover-lift ${
                    isSelected
                      ? 'border-field-700 bg-field-50/40 ring-2 ring-field-700/20 shadow-sm'
                      : 'border-husk-200 bg-husk-100 hover:border-husk-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-soil-500">{q.id}</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                      q.status === 'Pending'
                        ? 'bg-warn-100/50 border-warn-200 text-warn-700'
                        : 'bg-ok-100/50 border-ok-200 text-ok-800'
                    }`}>
                      {isTamil ? q.statusTa : q.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-field-900 text-sm">
                    {isTamil ? q.farmerNameTa : q.farmerName}
                  </h4>
                  
                  <p className="text-xs text-soil-600 mt-1 line-clamp-2">
                    {q.englishTranslation}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-husk-100 flex items-center justify-between text-[11px] text-soil-400 font-medium">
                    <span>{isTamil ? q.issueTypeTa : q.issueType}</span>
                    <span>{q.date.split(',')[0]}</span>
                  </div>
                </button>
              );
            })}
          </div>

        </div>

        {/* RIGHT COLUMN: QUERY DETAIL & AI BILINGUAL TRANSLATION & REPLY */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-husk-200 bg-husk-100 p-6 sm:p-7 shadow-sm flex flex-col gap-5">
            
            {/* Ticket Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-husk-200">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-xs bg-field-100 text-field-800 px-2.5 py-0.5 rounded-lg">
                    {selectedQuery.id}
                  </span>
                  <span className="text-xs font-bold text-soil-500">
                    {isTamil ? selectedQuery.issueTypeTa : selectedQuery.issueType}
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-field-900">
                  {isTamil ? selectedQuery.farmerNameTa : selectedQuery.farmerName}
                </h3>
              </div>

              <div className="flex sm:flex-col items-start sm:items-end gap-1 text-xs text-soil-600">
                <span className="flex items-center gap-1 font-semibold">
                  <Phone className="w-3.5 h-3.5 text-field-700" />
                  {selectedQuery.phone}
                </span>
                <span className="text-soil-400">{selectedQuery.date}</span>
              </div>
            </div>

            {/* Original Farmer Message (Tamil) */}
            <div className="rounded-2xl border border-harvest-200 bg-harvest-50/40 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-harvest-800 flex items-center gap-1.5 uppercase tracking-wider">
                  🌾 {isTamil ? 'விவசாயியின் அசல் உரை' : 'Farmer Original Message (Tamil)'}
                </span>
                <span className="text-[11px] font-semibold text-soil-500">
                  {getDynamicCenterName(selectedQuery.center, state.language)}
                </span>
              </div>
              <p className="text-soil-900 font-medium text-sm sm:text-base leading-relaxed">
                "{selectedQuery.originalText}"
              </p>
            </div>

            {/* AI Auto-Translation to English for Officer */}
            <div className="rounded-2xl border border-field-300 bg-field-50/50 p-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-field-800 mb-2 uppercase tracking-wider">
                <Languages className="w-3.5 h-3.5 text-field-700" />
                🤖 {isTamil ? 'அலுவலருக்கான AI ஆங்கில மொழிபெயர்ப்பு' : 'AI Translation for Officer'}
              </div>
              <p className="text-field-900 font-semibold text-sm sm:text-base leading-relaxed">
                "{selectedQuery.englishTranslation}"
              </p>
            </div>

            {/* Existing Reply if already answered */}
            {selectedQuery.reply && (
              <div className="rounded-2xl border border-ok-200 bg-ok-50/50 p-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-ok-800 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-ok-600" />
                  {isTamil ? 'அலுவலர் வழங்கிய பதில் (WhatsApp-இல் அனுப்பப்பட்டது)' : 'Officer Response (Dispatched via WhatsApp)'}
                </div>
                <p className="text-soil-800 text-sm font-medium mt-1">
                  {selectedQuery.reply}
                </p>
              </div>
            )}

            {/* Reply Composer */}
            <form onSubmit={handleSendReply} className="flex flex-col gap-3 pt-2">
              <label className="text-xs font-bold text-soil-600 uppercase tracking-wider">
                {isTamil ? 'விவசாயிக்கு பதில் அனுப்பவும் (WhatsApp வழியாக அனுப்பப்படும்)' : 'Reply & Dispatch Resolution via WhatsApp'}
              </label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={isTamil ? 'உங்கள் பதிலை இங்கே தட்டச்சு செய்யவும்…' : 'Type resolution message to the farmer…'}
                rows={3}
                className="w-full rounded-2xl border-2 border-husk-200 bg-husk-50 p-3.5 text-sm font-medium text-soil-800 outline-none focus:border-field-600 transition resize-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-soil-500 flex items-center gap-1">
                  📲 {isTamil ? 'பதில் உடனடியாக விவசாயியின் WhatsApp-க்கு அனுப்பப்படும்.' : 'Reply sends instant WhatsApp alert to farmer.'}
                </span>
                <button
                  type="submit"
                  disabled={sending || !replyText.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-field-800 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-field-900 transition disabled:opacity-50 active:scale-95"
                >
                  {sending ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  {isTamil ? 'பதில் அனுப்பு' : 'Send Resolution'}
                </button>
              </div>
            </form>

          </div>
        </div>

      </div>

    </div>
  );
}
