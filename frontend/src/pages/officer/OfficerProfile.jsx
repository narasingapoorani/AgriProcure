import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../data/translations';
import { 
  User, 
  ShieldCheck, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  FileCheck2, 
  CheckCircle2, 
  TrendingUp, 
  Download,
  AlertTriangle,
  Award
} from 'lucide-react';

import api from '../../services/api';

export default function OfficerProfile() {
  const { state } = useApp();
  const t = getTranslation(state.language);
  const isTamil = state.language === 'Tamil';
  const u = state.officerUser || {};
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'history'
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    let isMounted = true;
    async function fetchCentres() {
      try {
        const res = await api.getCentres();
        if (isMounted && res.status === 'success' && res.centres) {
          setLogs(res.centres.map((c) => ({
            id: `APMC-${c.district ? c.district.toUpperCase().substring(0, 3) : 'TN'}-0${c.id}`,
            center: c.name,
            centerTa: c.name,
            date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            dateTa: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            farmersProcessed: c.processed_today || 85,
            totalWeight: `${((c.processed_today || 85) * 3.5).toFixed(1)} Quintals`,
            totalWeightTa: `${((c.processed_today || 85) * 3.5).toFixed(1)} குவிண்டால்`,
            totalDisbursed: `₹ ${Math.round((c.processed_today || 85) * 3.5 * 2275).toLocaleString('en-IN')}`,
            qualityPassRate: '98.5%',
            status: 'Approved & Active',
            statusTa: 'ஒப்புதல் அளிக்கப்பட்டு இயங்குகிறது'
          })));
        }
      } catch (err) {
        console.warn('Officer profile centres fetch error:', err);
      }
    }
    fetchCentres();
    return () => { isMounted = false; };
  }, []);

  const officerName = u.full_name || u.name || 'Dr. Arvind Sharma';
  const officerId = u.officer_id_code || u.officerId || u.officer_id || 'OFFICER-TN-001';
  const officerEmail = u.email || `${(u.username || 'arvind.sharma').toLowerCase()}@gov.in`;
  const officerPhone = u.mobile_number || u.phone || u.mobile || '+91 91234 56780';
  const department = u.department || 'Agriculture Marketing & APMC Bureau';
  const district = u.district || 'Coimbatore District';
  const assignedCenter = u.centerAssigned || 'Coimbatore Central APMC & Agricultural Complex';
  const designation = u.designation || 'District Procurement Officer (Grade I)';

  return (
    <div className="max-w-4xl mx-auto w-full pb-12 flex flex-col gap-6">

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-field-900 via-field-800 to-field-700 px-8 py-8 shadow-xl text-white ai-glow">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center font-display text-2xl font-black text-white shadow-inner">
              {officerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-0.5 rounded-full text-xs font-semibold text-field-100 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-ok-400" />
                {isTamil ? `அரசு அதிகாரி ஐடி: ${officerId}` : `Govt Officer ID: ${officerId}`}
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {officerName}
              </h2>
              <p className="text-field-100 text-sm font-medium flex items-center gap-2 mt-0.5">
                <Building2 className="w-4 h-4 text-field-200 shrink-0" />
                {designation} · {district}
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-2 bg-white/10 rounded-2xl p-4 border border-white/15">
            <span className="text-xs uppercase tracking-wider text-field-200 font-semibold">
              {isTamil ? 'நிர்வகித்த மொத்த கொள்முதல்' : 'Procurement Managed'}
            </span>
            <span className="font-display text-2xl font-black tracking-tight text-white">
              ₹ 2.75 Cr
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 flex gap-3 border-t border-white/15 pt-4">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'profile'
                ? 'bg-husk-100 text-field-900 shadow-md'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            {isTamil ? 'அலுவலர் விவரங்கள்' : 'Officer Details'}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'history'
                ? 'bg-husk-100 text-field-900 shadow-md'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            {isTamil ? 'கொள்முதல் மேலாண்மை வரலாறு' : 'Procurement Batches'}
            <span className="bg-field-700 text-white text-[11px] font-bold px-2 py-0.5 rounded-full ml-1">
              3
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: Profile & Jurisdiction Details */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
          
          {/* Card: Official Identity */}
          <div className="rounded-3xl border border-husk-200 bg-husk-100 p-6 sm:p-7 shadow-sm hover-lift">
            <div className="flex items-center gap-3 pb-4 border-b border-husk-200 mb-5">
              <div className="w-10 h-10 rounded-xl bg-field-100 text-field-800 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-field-900">
                  {isTamil ? 'அதிகாரப்பூர்வ அடையாளம்' : 'Official Identification'}
                </h3>
                <p className="text-xs text-soil-500 font-medium">
                  {isTamil ? 'வேளாண்மைத் துறை சான்றிதழ்' : 'Dept. of Agriculture Authorized'}
                </p>
              </div>
            </div>

            <dl className="flex flex-col gap-4 text-sm">
              <div className="flex justify-between items-center py-1">
                <dt className="text-soil-600 font-medium">{isTamil ? 'முழு பெயர்' : 'Full Name'}</dt>
                <dd className="font-bold text-field-900">{officerName}</dd>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-husk-100">
                <dt className="text-soil-600 font-medium">{isTamil ? 'அலுவலர் ஐடி' : 'Officer ID'}</dt>
                <dd className="font-bold text-field-900 font-data">{officerId}</dd>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-husk-100">
                <dt className="text-soil-600 font-medium">{isTamil ? 'மின்னஞ்சல் முகவரி' : 'Govt. Email'}</dt>
                <dd className="font-bold text-field-900 flex items-center gap-1.5 font-mono text-xs">
                  <Mail className="w-3.5 h-3.5 text-field-700" />
                  {officerEmail}
                </dd>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-husk-100">
                <dt className="text-soil-600 font-medium">{isTamil ? 'அலைபேசி எண்' : 'Official Phone'}</dt>
                <dd className="font-bold text-field-900 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-field-700" />
                  {officerPhone}
                </dd>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-husk-100">
                <dt className="text-soil-600 font-medium">{isTamil ? 'பதவி நிலை' : 'Designation'}</dt>
                <dd className="font-bold text-field-900 text-right">{designation}</dd>
              </div>
            </dl>
          </div>

          {/* Card: Center & Jurisdiction Details */}
          <div className="rounded-3xl border border-husk-200 bg-husk-100 p-6 sm:p-7 shadow-sm hover-lift">
            <div className="flex items-center gap-3 pb-4 border-b border-husk-200 mb-5">
              <div className="w-10 h-10 rounded-xl bg-harvest-100 text-harvest-800 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-field-900">
                  {isTamil ? 'மையம் & அதிகார வரம்பு' : 'Center & Jurisdiction'}
                </h3>
                <p className="text-xs text-soil-500 font-medium">
                  {isTamil ? 'ஒதுக்கப்பட்ட மண்டலம் மற்றும் பொறுப்புகள்' : 'Assigned Zone & Active Center'}
                </p>
              </div>
            </div>

            <dl className="flex flex-col gap-4 text-sm">
              <div className="flex justify-between items-center py-1">
                <dt className="text-soil-600 font-medium">{isTamil ? 'முதன்மை மையம்' : 'Assigned Center'}</dt>
                <dd className="font-bold text-field-900 text-right">{assignedCenter}</dd>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-husk-100">
                <dt className="text-soil-600 font-medium">{isTamil ? 'துறை' : 'Department'}</dt>
                <dd className="font-bold text-field-900 text-right max-w-[200px] truncate">{department}</dd>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-husk-100">
                <dt className="text-soil-600 font-medium">{isTamil ? 'மாவட்டம்' : 'District'}</dt>
                <dd className="font-bold text-field-900">{district}</dd>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-husk-100">
                <dt className="text-soil-600 font-medium">{isTamil ? 'கொள்ளளவு அதிகாரம்' : 'Capacity Authority'}</dt>
                <dd className="font-bold text-field-900">{isTamil ? '500 மெட்ரிக் டன் / நாள்' : '500 MT / Day'}</dd>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-husk-100">
                <dt className="text-soil-600 font-medium">{isTamil ? 'அமைப்பின் நிலை' : 'System Access'}</dt>
                <dd className="font-bold text-field-800 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-ok-600" />
                  {isTamil ? 'முழு நிர்வாகி (Admin)' : 'Full Admin (Authorized)'}
                </dd>
              </div>
            </dl>
          </div>

        </div>
      )}

      {/* TAB 2: Past Procurement Logs / History */}
      {activeTab === 'history' && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-200">
          
          <div className="flex items-center justify-between px-2">
            <div>
              <h3 className="font-display text-xl font-bold text-field-900">
                {isTamil ? 'முந்தைய கொள்முதல் தொகுதிகள் & தணிக்கை' : 'Procurement Batch Records & Audits'}
              </h3>
              <p className="text-sm text-soil-600">
                {isTamil ? 'அலுவலரால் சரிபார்க்கப்பட்டு முடிக்கப்பட்ட முந்தைய கொள்முதல் தொகுதிகள்' : 'Historical records of batches inspected, weighed and approved by this officer'}
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-husk-300 bg-husk-100 px-4 py-2 text-xs font-bold text-soil-800 shadow-sm hover:bg-husk-50 transition"
            >
              <Download className="w-3.5 h-3.5 text-field-700" />
              {isTamil ? 'அறிக்கையை பதிவிறக்குக' : 'Export Audit Report'}
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {logs.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-husk-300 bg-husk-100 p-12 text-center">
                <p className="font-bold text-field-900 text-base">{isTamil ? 'பதிவுகள் ஏதும் இல்லை' : 'No Procurement Batch Logs in Database'}</p>
                <p className="text-xs text-soil-500 mt-1">{isTamil ? 'மையங்களில் செயல்பாடுகள் தொடங்கப்பட்டவுடன் இங்கு பதிவாகும்.' : 'Center operational batches will be logged here.'}</p>
              </div>
            ) : logs.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl border border-husk-200 bg-husk-100 p-6 shadow-sm hover-lift flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-field-100 text-field-800 flex items-center justify-center font-bold text-sm shrink-0">
                    <FileCheck2 className="w-6 h-6 text-field-800" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-soil-500">{item.id}</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-ok-50 border border-ok-200 px-2.5 py-0.5 text-xs font-semibold text-ok-800">
                        <CheckCircle2 className="w-3 h-3 text-ok-600" />
                        {isTamil ? item.statusTa : item.status}
                      </span>
                    </div>
                    <h4 className="font-display text-lg font-bold text-field-900">
                      {isTamil ? item.centerTa : item.center}
                    </h4>
                    <p className="text-xs text-soil-600 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>📅 {isTamil ? item.dateTa : item.date}</span>
                      <span>👨‍🌾 {isTamil ? `${item.farmersProcessed} விவசாயிகள்` : `${item.farmersProcessed} Farmers`}</span>
                      <span>🌾 {isTamil ? item.totalWeightTa : item.totalWeight}</span>
                      <span>⭐ {isTamil ? `தர ஒப்புதல்: ${item.qualityPassRate}` : `Quality Pass: ${item.qualityPassRate}`}</span>
                    </p>
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-husk-200 gap-2 shrink-0">
                  <div className="text-left md:text-right">
                    <span className="text-[11px] uppercase tracking-wider text-soil-500 font-semibold block">
                      {isTamil ? 'வழங்கப்பட்ட MSP தொகை' : 'Disbursed MSP'}
                    </span>
                    <span className="font-display text-xl font-bold text-field-800">
                      {item.totalDisbursed}
                    </span>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-field-600 bg-husk-100 px-3 py-1.5 text-soil-800 text-xs font-bold text-field-800 hover:bg-field-50 shadow-xs transition"
                  >
                    <Download className="w-3.5 h-3.5 text-field-700" />
                    {isTamil ? 'தணிக்கை தாள்' : 'Audit Sheet'}
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
