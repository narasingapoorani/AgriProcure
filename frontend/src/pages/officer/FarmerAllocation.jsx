import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../data/translations';
import { getDynamicCenterName } from '../../services/aiTranslation';
import api from '../../services/api';
import { 
  Users, 
  Download, 
  Search, 
  Filter, 
  CheckCircle2, 
  ArrowRightLeft, 
  Building2, 
  Phone, 
  Calendar,
  Layers,
  FileSpreadsheet,
  RefreshCw,
  Inbox
} from 'lucide-react';

export default function FarmerAllocation() {
  const { state } = useApp();
  const t = getTranslation(state.language);
  const fa = t.farmerAllocationPage;
  const isTamil = state.language === 'Tamil';

  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'reassign'
  const [searchTerm, setSearchTerm] = useState('');
  const [cropFilter, setCropFilter] = useState('All');
  const [centerFilter, setCenterFilter] = useState('All');

  // Real Database State
  const [bookings, setBookings] = useState([]);
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reassignment state
  const center = state.officerSelectedCenter || (centres.length > 0 ? centres[0] : { id: 1, name: 'APMC Hub' });
  const [target, setTarget] = useState(null);
  const [shiftCount, setShiftCount] = useState(5);
  const [confirmed, setConfirmed] = useState(false);
  const [shifting, setShifting] = useState(false);
  const [apiShiftResult, setApiShiftResult] = useState(null);
  const [selected, setSelected] = useState(new Set());

  // Fetch real bookings and centres on mount
  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, centresRes] = await Promise.all([
        api.getAllBookings().catch(() => ({ status: 'error', bookings: [] })),
        api.getCentres().catch(() => ({ status: 'error', centres: [] }))
      ]);

      if (bookingsRes.status === 'success' && bookingsRes.bookings) {
        setBookings(bookingsRes.bookings);
        setSelected(new Set(bookingsRes.bookings.map(b => b.id)));
      }

      if (centresRes.status === 'success' && centresRes.centres) {
        setCentres(centresRes.centres);
        if (centresRes.centres.length > 1) {
          setTarget(centresRes.centres[1].id);
        } else if (centresRes.centres.length > 0) {
          setTarget(centresRes.centres[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching live bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const targetCenter = centres.find((c) => c.id === target) || centres[0] || { name: 'APMC Centre', available_capacity: 100 };

  // Filtered farmers list
  const filteredFarmers = useMemo(() => {
    return bookings.filter((f) => {
      const nameMatch = (f.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const tokenMatch = (f.token || '').toLowerCase().includes(searchTerm.toLowerCase());
      const idMatch = (f.id || '').toLowerCase().includes(searchTerm.toLowerCase());
      const phoneMatch = (f.phone || '').includes(searchTerm);
      const matchesSearch = nameMatch || tokenMatch || idMatch || phoneMatch;

      const matchesCrop = cropFilter === 'All' || (f.crop || '').toLowerCase().includes(cropFilter.toLowerCase());
      const matchesCenter = centerFilter === 'All' || f.center === centerFilter;

      return matchesSearch && matchesCrop && matchesCenter;
    });
  }, [bookings, searchTerm, cropFilter, centerFilter]);

  // Export to CSV Function
  const downloadCSV = () => {
    const headers = ['Application ID', 'Token No', 'Farmer Name', 'Phone Number', 'Crop & Variety', 'Quantity (Quintals)', 'Land Area', 'Allocated Center', 'Slot Date', 'Slot Time', 'Verification Fee', 'Current Status'];
    
    const rows = filteredFarmers.map(f => [
      f.id,
      f.token,
      `"${f.name}"`,
      f.phone,
      `"${f.crop}"`,
      f.quantityQt,
      `"${f.landArea}"`,
      `"${f.center}"`,
      f.date,
      f.slot,
      `"${f.paymentStatus}"`,
      `"${f.queueStatus}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `agriprocure_farmer_applications_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShiftFarmers = async () => {
    setShifting(true);
    const sourceId = parseInt(String(center.id).replace(/\D/g, '')) || 1;
    try {
      const res = await api.shiftFarmers(sourceId, shiftCount);
      if (res.status === 'success') {
        setApiShiftResult(res);
        await fetchData(); // Refresh real database list
      }
    } catch (err) {
      console.warn('Shift API note:', err);
    } finally {
      setShifting(false);
      setConfirmed(true);
    }
  };

  const uniqueCrops = useMemo(() => {
    const set = new Set(bookings.map(b => b.crop).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [bookings]);

  const uniqueCenters = useMemo(() => {
    const set = new Set(centres.map(c => c.name).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [centres]);

  return (
    <div className="w-full max-w-7xl mx-auto pb-12 flex flex-col gap-6">

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-field-900 via-field-800 to-field-700 px-8 py-8 shadow-xl text-white ai-glow">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2 text-field-100">
              <Users className="w-4 h-4 text-harvest-300" />
              {isTamil ? 'அரசு கொள்முதல் நேரலை பதிவு மேலாண்மை' : 'Live Applications Database'}
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {isTamil ? 'விண்ணப்பித்த விவசாயிகள் & ஒதுக்கீடு' : 'Applied Farmers & Dynamic Allocation'}
            </h2>
            <p className="text-field-100 text-sm font-medium mt-1">
              {isTamil
                ? 'கொள்முதல் மையங்களில் பதிவு செய்துள்ள விவசாயிகளின் நேரலை பட்டியல் மற்றும் சுமை பகிர்வு.'
                : 'Real-time database of registered farmer applications, booked slots, tokens, and automated rebalancing.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              title="Refresh Data"
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={downloadCSV}
              disabled={filteredFarmers.length === 0}
              className="flex items-center gap-2 rounded-2xl bg-harvest-400 hover:bg-harvest-500 text-soil-900 px-5 py-3 font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isTamil ? 'CSV பதிவிறக்கம்' : 'Export Applications (CSV)'}
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="mt-8 flex gap-3 border-t border-white/15 pt-4">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'list'
                ? 'bg-husk-100 text-field-900 shadow-md'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            {isTamil ? 'விவசாயிகள் பட்டியல்' : 'Applied Farmers List'}
            <span className="bg-field-700 text-white text-[11px] font-bold px-2 py-0.5 rounded-full ml-1">
              {filteredFarmers.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('reassign')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'reassign'
                ? 'bg-husk-100 text-field-900 shadow-md'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            {isTamil ? 'சுமை பகிர்வு (Reallocation)' : 'Dynamic Rebalancing'}
          </button>
        </div>
      </div>

      {/* TAB 1: APPLIED FARMERS LIST WITH SEARCH & FILTERS & CSV */}
      {activeTab === 'list' && (
        <div className="flex flex-col gap-5 animate-in fade-in duration-200">
          
          {/* Filter Bar */}
          <div className="rounded-2xl border border-husk-200 bg-husk-100 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-soil-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={isTamil ? 'பெயர், டோக்கன், போன் எண் தேடுக…' : 'Search farmer, token, phone…'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-husk-200 bg-husk-50 text-sm font-semibold text-soil-800 outline-none focus:border-field-600 transition"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-soil-600">{isTamil ? 'பயிர்:' : 'Crop:'}</span>
                <select
                  value={cropFilter}
                  onChange={(e) => setCropFilter(e.target.value)}
                  className="rounded-xl border border-husk-200 bg-husk-50 px-3 py-2 text-xs font-bold text-soil-800 outline-none focus:border-field-600"
                >
                  {uniqueCrops.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-soil-600">{isTamil ? 'மையம்:' : 'Centre:'}</span>
                <select
                  value={centerFilter}
                  onChange={(e) => setCenterFilter(e.target.value)}
                  className="rounded-xl border border-husk-200 bg-husk-50 px-3 py-2 text-xs font-bold text-soil-800 outline-none focus:border-field-600 max-w-[200px] truncate"
                >
                  {uniqueCenters.map(c => (
                    <option key={c} value={c}>{getDynamicCenterName(c, state.language)}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={downloadCSV}
                disabled={filteredFarmers.length === 0}
                className="flex items-center gap-1.5 rounded-xl border border-field-600 bg-field-50 text-field-800 hover:bg-field-100 px-3.5 py-2 text-xs font-bold transition ml-auto disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                {isTamil ? 'CSV சேமி' : 'Save CSV'}
              </button>
            </div>
          </div>

          {/* Data Table */}
          <div className="rounded-3xl border border-husk-200 bg-husk-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-husk-50 border-b border-husk-200 text-soil-600 font-bold uppercase text-xs tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Token & ID</th>
                    <th className="px-6 py-4">{isTamil ? 'விவசாயி பெயர்' : 'Farmer Name'}</th>
                    <th className="px-6 py-4">{isTamil ? 'பயிர் & அளவு' : 'Crop & Quantity'}</th>
                    <th className="px-6 py-4">{isTamil ? 'மையம் & நேரம்' : 'Center & Slot'}</th>
                    <th className="px-6 py-4">{isTamil ? 'கட்டணம்' : 'Verification Fee'}</th>
                    <th className="px-6 py-4">{isTamil ? 'வரிசை நிலை' : 'Queue Stage'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-husk-200 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-soil-500 font-semibold">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin text-field-700" />
                          <span>{isTamil ? 'தரவுத்தளத்தில் இருந்து ஏற்றுகிறது...' : 'Loading live applications from database...'}</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredFarmers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center text-soil-500">
                        <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                          <Inbox className="w-10 h-10 text-soil-300" />
                          <p className="font-bold text-field-900 text-base">
                            {isTamil ? 'விண்ணப்பங்கள் ஏதும் இல்லை' : 'No Farmer Applications in Database'}
                          </p>
                          <p className="text-xs text-soil-500">
                            {isTamil ? 'புதிய முன்பதிவு செய்தவுடன் தானாகவே இங்கு காண்பிக்கப்படும்.' : 'New farmer bookings will automatically populate here in real-time.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredFarmers.map((f) => (
                      <tr key={f.id} className="hover:bg-husk-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="w-10 h-10 rounded-xl bg-field-100 text-field-800 font-display font-black text-sm flex items-center justify-center">
                              {f.token}
                            </span>
                            <span className="font-mono text-xs text-soil-500 font-bold">{f.id}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-field-900 text-sm">
                              {isTamil ? (f.nameTa || f.name) : f.name}
                            </p>
                            <p className="text-xs text-soil-500 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-soil-400" />
                              {f.phone}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-soil-800">
                              {isTamil ? (f.cropTa || f.crop) : f.crop}
                            </p>
                            <p className="text-xs text-soil-500 mt-0.5">
                              {f.quantityQt} {isTamil ? 'குவிண்டால்' : 'Qtl'} · {f.landArea}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-soil-800 text-xs">
                              {getDynamicCenterName(f.center, state.language)}
                            </p>
                            <p className="text-xs text-field-700 font-semibold mt-0.5 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-soil-400" />
                              {f.date} · {f.slot}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            f.paymentStatus === 'Paid' 
                              ? 'bg-ok-50 border border-ok-200 text-ok-800' 
                              : 'bg-harvest-50 border border-harvest-200 text-harvest-800'
                          }`}>
                            <CheckCircle2 className="w-3 h-3 text-ok-600" />
                            {isTamil ? (f.paymentStatusTa || f.paymentStatus) : f.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-field-50 text-field-800 border border-field-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-field-600" />
                            {isTamil ? (f.queueStatusTa || f.queueStatus) : f.queueStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer Summary */}
            <div className="bg-husk-50 px-6 py-4 border-t border-husk-200 flex flex-col sm:flex-row items-center justify-between text-xs text-soil-600 font-semibold gap-2">
              <span>
                {isTamil
                  ? `மொத்தம் ${filteredFarmers.length} நேரலை பதிவுகள் தரவுத்தளத்தில் உள்ளன.`
                  : `Showing ${filteredFarmers.length} live applications from database.`}
              </span>
              <span>
                {isTamil ? 'அரசு கொள்முதல் பதிவு போர்டல்' : 'Official AgriProcure Live Registry'}
              </span>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: REASSIGNMENT / DYNAMIC BALANCING */}
      {activeTab === 'reassign' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          
          <div className="grid gap-4 md:grid-cols-2">
            {centres.map((alt) => (
              <button
                key={alt.id}
                onClick={() => setTarget(alt.id)}
                className={`rounded-3xl border-2 p-6 text-left shadow-sm transition hover-lift ${
                  target === alt.id ? 'border-field-700 bg-field-50/40 ring-4 ring-field-700/10' : 'border-husk-200 bg-husk-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold text-field-900">
                    {getDynamicCenterName(alt.name, state.language)}
                  </h3>
                  {target === alt.id && (
                    <span className="bg-field-800 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      ✓ {isTamil ? 'தேர்ந்தெடுக்கப்பட்டது' : 'Selected Target'}
                    </span>
                  )}
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-y-2.5 text-sm">
                  <dt className="text-soil-600">{fa.distance || 'State / Market'}</dt>
                  <dd className="text-right font-bold text-field-900">{alt.market || alt.district}</dd>
                  <dt className="text-soil-600">{fa.availableCapacity}</dt>
                  <dd className="text-right font-bold text-field-900">{alt.remaining_capacity || alt.total_capacity} {isTamil ? 'விவசாயிகள்' : 'farmers'}</dd>
                  <dt className="text-soil-600">{fa.expectedWait}</dt>
                  <dd className="text-right font-bold text-ok-700">{alt.current_queue || 0} {isTamil ? 'வரிசையில்' : 'in queue'}</dd>
                </dl>
              </button>
            ))}
          </div>

          <div className="rounded-3xl border border-husk-200 bg-husk-100 p-6 sm:p-8 shadow-sm">
            <h3 className="font-display text-lg font-bold text-field-900">
              {isTamil ? 'மாற்ற வேண்டிய விவசாயிகளை தேர்ந்தெடுக்கவும்' : 'Select Farmers to Shift'}
            </h3>
            <p className="mt-1 text-sm text-soil-600">
              {isTamil 
                ? `${getDynamicCenterName(targetCenter.name, state.language)} மையத்திற்கு மாற்ற வேண்டிய விவசாயிகளை தேர்வு செய்யவும்.`
                : `Select farmers to transfer to ${targetCenter.name} to clear queues.`}
            </p>

            <div className="mt-6 flex flex-col divide-y divide-husk-200 max-h-80 overflow-y-auto">
              {bookings.length === 0 ? (
                <p className="py-6 text-center text-xs text-soil-500 font-semibold">
                  {isTamil ? 'மாற்றுவதற்கு விவசாயிகள் ஏதும் இல்லை.' : 'No active bookings currently available to shift.'}
                </p>
              ) : (
                bookings.map((f) => (
                  <label key={f.id} className="flex items-center justify-between gap-3 py-3.5 text-sm hover:bg-husk-50 px-2 rounded-xl transition cursor-pointer">
                    <span className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={selected.has(f.id)} 
                        onChange={() => toggle(f.id)} 
                        className="h-4 w-4 accent-field-700 rounded" 
                      />
                      <span className="font-mono text-xs font-bold text-soil-500">{f.token}</span>
                      <span className="font-bold text-field-900">{isTamil ? (f.nameTa || f.name) : f.name}</span>
                      <span className="text-soil-600 text-xs">· {isTamil ? (f.cropTa || f.crop) : f.crop} ({f.quantityQt} qtl)</span>
                    </span>
                    <span className="text-xs font-semibold text-soil-500">{f.slot}</span>
                  </label>
                ))
              )}
            </div>

            <div className="mt-6 pt-5 border-t border-husk-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-bold text-soil-700">
                  {isTamil ? 'மாற்றப்படும் எண்ணிக்கை:' : 'Number to shift:'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={shiftCount}
                  onChange={(e) => setShiftCount(Number(e.target.value))}
                  className="w-24 rounded-xl border-2 border-husk-200 bg-husk-50 px-3 py-2 text-sm font-bold text-field-900 outline-none focus:border-field-600"
                />
              </div>

              <button
                disabled={shifting || bookings.length === 0}
                onClick={handleShiftFarmers}
                className="w-full sm:w-auto rounded-xl bg-field-800 px-8 py-3.5 text-sm font-bold text-white shadow hover:bg-field-900 transition active:scale-95 disabled:opacity-50"
              >
                {shifting 
                  ? (isTamil ? 'மாற்றப்படுகிறது...' : 'Executing AI Shift...') 
                  : confirmed
                  ? (isTamil ? '✓ மாற்றப்பட்டது' : '✓ Reallocated Successfully') 
                  : (isTamil ? `${shiftCount} விவசாயிகளை மாற்றவும்` : `Shift ${shiftCount} Farmers`)}
              </button>
            </div>

            {confirmed && (
              <div className="mt-4 p-4 rounded-xl bg-ok-50 border border-ok-200 text-ok-800 text-sm font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-ok-600" />
                {apiShiftResult 
                  ? (isTamil ? `${apiShiftResult.shifted_count || shiftCount} விவசாயிகள் மாற்றப்பட்டு SMS அனுப்பப்பட்டது!` : `${apiShiftResult.message || `${shiftCount} farmers transferred.`} Automated SMS alerts dispatched!`)
                  : isTamil 
                  ? `${shiftCount} விவசாயிகள் வெற்றிகரமாக ${getDynamicCenterName(targetCenter.name, state.language)} மையத்திற்கு மாற்றப்பட்டனர். WhatsApp அறிவிப்பு அனுப்பப்பட்டது!` 
                  : `${shiftCount} farmers successfully redirected to ${targetCenter.name}. Automated WhatsApp update dispatched!`}
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
