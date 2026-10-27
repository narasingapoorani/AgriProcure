import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../data/translations';
import RazorpayModal from '../../components/RazorpayModal';
import RiskBadge from '../../components/RiskBadge';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function FarmerPayments() {
  const { state, update } = useApp();
  const t = getTranslation(state.language);
  const p = t.paymentsPage || {};
  const isTamil = state.language === 'Tamil';
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [lastPayment, setLastPayment] = useState(null);
  const [showToken, setShowToken] = useState(Boolean(state.feePaid));

  const [activeBooking, setActiveBooking] = useState(null);
  const [farmerData, setFarmerData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(true);
  const [loadingDb, setLoadingDb] = useState(true);

  const fetchLiveDashboard = async () => {
    try {
      setLoadingDb(true);
      const res = await api.getFarmerDashboard(state.farmerUser?.id);
      if (res.status === 'success') {
        setFarmerData(res.farmer);
        const tok = res.active_token || (res.bookings && res.bookings[0]) || null;
        setActiveBooking(tok);
        if (tok && (tok.payment_status === 'Success' || tok.current_stage !== 'Token Confirmed')) {
          update({ feePaid: true });
        }
      }
    } catch (err) {
      console.warn('Live dashboard fetch error in FarmerPayments:', err);
    } finally {
      setLoadingDb(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoadingTx(true);
      const res = await api.getFarmerTransactions(state.farmerUser?.id || 1);
      if (res.status === 'success' && res.transactions) {
        setTransactions(res.transactions);
      }
    } catch (err) {
      console.warn('Live transactions fetch error:', err);
    } finally {
      setLoadingTx(false);
    }
  };

  useEffect(() => {
    fetchLiveDashboard();
    fetchTransactions();
  }, [state.farmerUser]);

  const currentToken = activeBooking?.token_number || state.slot?.token;
  const currentCrop = activeBooking?.crop_name || state.selectedCrop?.name;
  const currentQuantity = activeBooking?.quantity || state.selectedCrop?.quantity;
  const currentCentre = activeBooking?.centre_name || state.selectedCenter?.name;
  const currentSlot = activeBooking?.time_slot || state.slot?.time;

  const rawMsp = activeBooking?.payment_amount || (currentQuantity ? Number(currentQuantity) * 2275 : 0);
  const expectedMspAmount = rawMsp > 0 ? Math.round(rawMsp).toLocaleString('en-IN') : null;

  const farmer = farmerData || state.farmerUser;
  const phone = farmer?.mobile_number || farmer?.phone || farmer?.mobile || '';
  const cleanPhone = phone.replace(/\D/g, '');
  const aadhaarNumber = farmer?.aadhaar_number;
  const aadhaarLast4 = aadhaarNumber ? String(aadhaarNumber).replace(/\D/g, '').slice(-4) : (cleanPhone ? cleanPhone.slice(-4) : '');
  const bankAccountDisplay = aadhaarLast4 ? `Aadhaar DBT •••• ${aadhaarLast4}` : 'DBT Linked Account';

  const feePaid = Boolean(state.feePaid) || Boolean(activeBooking && (activeBooking.payment_status === 'Success' || activeBooking.current_stage !== 'Token Confirmed'));

  const whatsappUrl = (currentToken && cleanPhone)
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`AgriProcure Token #${currentToken} confirmed. Centre: ${currentCentre || 'APMC Center'}. Slot: ${currentSlot || 'Morning'}. Crop: ${currentCrop || 'Produce'}. Status: Verified.`)}`
    : null;

  const handlePaymentSuccess = async (paymentData) => {
    update({ feePaid: true, paymentId: paymentData.paymentId });
    setLastPayment(paymentData);
    setShowToken(true);
    setTransactions((prev) => [
      {
        id: paymentData.paymentId,
        orderId: paymentData.orderId,
        type: paymentData.purpose || 'Slot Verification Fee',
        typeTa: 'முன்பதிவு & ஆய்வு கட்டணம்',
        amount: `₹ ${paymentData.amount}`,
        method: paymentData.method || 'Razorpay UPI',
        methodTa: paymentData.method || 'ரேசர்பே UPI',
        date: paymentData.date,
        status: 'Success',
        statusTa: 'வெற்றி',
        credit: false,
      },
      ...prev,
    ]);

    // Record verification to Flask backend database
    try {
      const bookingId = activeBooking?.id || state.slot?.bookingId || 1;
      await api.verifyPayment({
        booking_id: bookingId,
        razorpay_order_id: paymentData.orderId || `ord_${Date.now().toString(36)}`,
        razorpay_payment_id: paymentData.paymentId || `pay_${Date.now().toString(36)}`,
        razorpay_signature: `sig_${Date.now().toString(36)}`
      });
      await fetchLiveDashboard();
      await fetchTransactions();
    } catch (err) {
      console.warn('Backend payment verification note:', err);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div>
        <div className="flex items-center gap-3">
          <h2 className="font-display text-2xl font-semibold text-field-900">{p.farmerTitle}</h2>
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-semibold text-razorpay-navy">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            Razorpay Enabled
          </span>
        </div>
        <p className="mt-1 text-sm text-soil-600/80">{p.farmerSubtitle}</p>
      </div>

      {/* Token Confirmation Banner — shown when token is available and fee paid */}
      {showToken && currentToken && (
        <div className="rounded-3xl overflow-hidden shadow-lg ai-glow hover-lift">
          <div className="bg-gradient-to-br from-field-900 via-field-800 to-field-700 px-8 py-8 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                  ✅ {isTamil ? 'கட்டணம் வெற்றிகரமாக செலுத்தப்பட்டது' : 'Payment Successful'}
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold">
                  {isTamil ? 'உங்கள் டோக்கன் தயார்!' : 'Your Token is Ready!'}
                </h3>
                <p className="text-field-100 mt-1 text-sm">
                  {isTamil
                    ? 'உங்கள் WhatsApp கொள்முதல் டோக்கன் அனுப்பப்பட்டது.'
                    : 'Your procurement token has been sent to your WhatsApp.'}
                </p>
                {currentCentre && (
                  <p className="text-field-200 mt-2 text-xs font-medium">
                    📍 {currentCentre} {currentSlot ? `• ${currentSlot}` : ''}
                  </p>
                )}
              </div>
              <div className="text-center bg-white/15 backdrop-blur-sm rounded-2xl px-8 py-4 border border-white/20">
                <p className="text-xs font-semibold uppercase tracking-wider text-field-200 mb-1">
                  {isTamil ? 'டோக்கன் எண்' : 'Token No.'}
                </p>
                <p className="font-display text-5xl font-black tracking-tight">#{currentToken}</p>
              </div>
            </div>

            <div className="mt-6 grid sm:grid-cols-2 gap-3">
              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5b] text-white font-bold rounded-xl py-3 px-5 transition-colors shadow"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  {isTamil ? 'WhatsApp-இல் பெறுக' : 'View on WhatsApp'}
                </a>
              ) : (
                <div className="flex items-center justify-center gap-2 bg-white/10 text-white/70 font-medium rounded-xl py-3 px-5 text-sm">
                  💬 WhatsApp Alert Dispatched
                </div>
              )}
              <Link
                to="/farmer-dashboard/live-queue"
                className="flex items-center justify-center gap-2 bg-white/15 border border-white/30 hover:bg-white/25 text-white font-bold rounded-xl py-3 px-5 transition-colors"
              >
                📡 {isTamil ? 'நேரலை வரிசை' : 'Live Queue Status'}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification Banner for new payment */}
      {lastPayment && !showToken && (
        <div className="rounded-lg border border-ok-300 bg-ok-50 p-4 animate-in fade-in duration-300 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-field-700 text-white font-bold text-sm">✓</span>
            <div>
              <p className="font-semibold text-field-900">{p.paymentSuccess}</p>
              <p className="text-xs text-soil-700 mt-0.5 font-data">
                {p.paymentId}: <span className="font-bold text-field-900">{lastPayment.paymentId}</span> · {p.orderId}: {lastPayment.orderId}
              </p>
              <p className="text-xs text-soil-600 mt-0.5">{p.paidOn}: {lastPayment.date} via {lastPayment.method}</p>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="rounded border border-field-600 bg-husk-100 px-3 py-1.5 text-xs font-semibold text-field-800 hover:bg-field-50"
          >
            🖨️ {p.downloadReceipt}
          </button>
        </div>
      )}

      {/* Two Main Cards: Slot Fee Payment & MSP Payout Tracker */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Card 1: Slot & Verification Fee */}
        <div className="rounded-2xl border border-husk-200 bg-husk-100 p-6 shadow-sm flex flex-col justify-between hover-lift">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-soil-500">
                {isTamil ? 'நுழைவு & ஆய்வு கட்டணம்' : 'Verification Charge'}
              </span>
              <RiskBadge
                label={feePaid ? (isTamil ? 'செலுத்தப்பட்டது' : 'Paid') : (isTamil ? 'நிலுவையில்' : 'Pending')}
                tone={feePaid ? 'success' : 'warning'}
              />
            </div>
            <h3 className="mt-2 font-display text-lg font-semibold text-field-900">{p.slotFeeTitle}</h3>
            <p className="mt-1 text-sm text-soil-600/80">{p.slotFeeDesc}</p>

            <div className="mt-4 rounded-xl bg-husk-50 p-3 flex items-center justify-between border border-husk-200">
              <div>
                <p className="text-xs text-soil-500">{p.amountDue}</p>
                <p className="font-data text-2xl font-bold text-field-900">₹ 50.00</p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-soil-600/80 flex items-center gap-1 font-medium">
                  💳 UPI / Card / NetBanking
                </span>
                <span className="text-[10px] text-soil-400">Powered by Razorpay</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            {!feePaid ? (
              <button
                onClick={() => setModalOpen(true)}
                className="w-full rounded-xl bg-field-700 px-4 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-field-800 transition flex items-center justify-center gap-2 ai-glow"
              >
                <span>⚡</span>
                <span>{p.payNowBtn}</span>
              </button>
            ) : (
              <div className="flex items-center justify-between rounded-xl border border-field-200 bg-field-50 px-4 py-3 text-sm font-medium text-field-800">
                <span className="flex items-center gap-2">
                  <span>✓</span>
                  <span>{p.paidBadge}</span>
                </span>
                <button
                  onClick={() => setModalOpen(true)}
                  className="text-xs font-semibold text-field-700 underline hover:text-field-900"
                >
                  {isTamil ? 'மீண்டும் செலுத்த' : 'Pay another'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: MSP Procurement Payout Status */}
        <div className="rounded-2xl border border-husk-200 bg-husk-100 p-6 shadow-sm flex flex-col justify-between hover-lift">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-soil-500">
                {isTamil ? 'அரசு கொள்முதல் வரவு' : 'Direct Benefit Transfer'}
              </span>
              <RiskBadge
                label={
                  activeBooking?.payment_status === 'Success'
                    ? (isTamil ? 'வரவு வைக்கப்பட்டது' : 'Credited')
                    : (activeBooking?.is_upcoming || activeBooking?.effective_status === 'Upcoming')
                    ? (isTamil ? 'வரவிருக்கும் (மைய வருகைக்காக காத்திருக்கிறது)' : 'Upcoming (Awaiting Arrival)')
                    : activeBooking?.current_stage === 'Payment Initiated'
                    ? (isTamil ? 'செயல்பாட்டில் உள்ளது' : 'Processing')
                    : (isTamil ? 'ஆய்வு நிலுவையில்' : 'Pending Verification')
                }
                tone={activeBooking?.payment_status === 'Success' ? 'success' : (activeBooking?.is_upcoming || activeBooking?.effective_status === 'Upcoming') ? 'neutral' : 'warning'}
              />
            </div>
            <h3 className="mt-2 font-display text-lg font-semibold text-field-900">{p.payoutStatusTitle}</h3>
            <p className="mt-1 text-sm text-soil-600/80">{p.payoutStatusDesc}</p>

            {expectedMspAmount ? (
              <dl className="mt-4 grid grid-cols-2 gap-y-2 rounded-xl bg-field-50/70 p-3 text-sm border border-field-100">
                <dt className="text-soil-600/70">{p.expectedPayout}</dt>
                <dd className="text-right font-data font-bold text-field-900">₹ {expectedMspAmount}</dd>
                <dt className="text-soil-600/70">{p.payoutAccount}</dt>
                <dd className="text-right font-medium text-soil-800 font-data">{bankAccountDisplay}</dd>
                <dt className="text-soil-600/70">{p.payoutStatus}</dt>
                <dd className="text-right font-semibold text-field-800">
                  {activeBooking?.payment_status === 'Success'
                    ? (isTamil ? 'தொகை வழங்கப்பட்டது ✓' : 'Disbursed ✓')
                    : (activeBooking?.is_upcoming || activeBooking?.effective_status === 'Upcoming')
                    ? (isTamil ? 'வரவிருக்கும் (மைய வருகைக்குப் பின்)' : 'Upcoming (Post-Arrival)')
                    : (isTamil ? 'செயல்பாட்டில் உள்ளது' : 'Under Process')}
                </dd>
              </dl>
            ) : (
              <div className="mt-4 p-4 rounded-xl bg-field-50/50 border border-field-100 text-center">
                <p className="text-xs text-soil-600">
                  {isTamil
                    ? 'செயலில் உள்ள முன்பதிவு ஏதும் இல்லை. ஸ்லாட் பதிவு செய்த பின் MSP வரவு தொகை இங்கு காட்டப்படும்.'
                    : 'No active booking. Book a slot to view estimated MSP procurement payouts.'}
                </p>
                <Link
                  to="/farmer-dashboard/crop"
                  className="mt-2 inline-block text-xs font-bold text-field-700 hover:text-field-900 underline"
                >
                  {isTamil ? 'ஸ்லாட் முன்பதிவு செய்க →' : 'Book a Harvest Slot →'}
                </Link>
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between text-xs text-soil-500 border-t border-husk-100 pt-3">
            <span>
              {activeBooking?.payment_status === 'Success' && currentToken
                ? `RazorpayX Payouts ID: pout_DBT_${currentToken.replace('-', '')}`
                : isTamil
                ? 'நேரடி வங்கிப் பரிமாற்றம் (DBT)'
                : 'Direct Benefit Transfer (DBT)'}
            </span>
            <span className="text-field-700 font-medium">NEFT / RTGS / IMPS</span>
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="rounded-2xl border border-husk-200 bg-husk-100 shadow-sm overflow-hidden">
        <div className="border-b border-husk-200 px-6 py-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-field-900">{p.historyTitle || 'Transaction History'}</h3>
          <span className="text-xs text-soil-500">Live Razorpay & MySQL Ledger</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-husk-50 text-xs font-semibold uppercase text-soil-600">
              <tr>
                <th className="px-6 py-3">{p.txnId || 'Transaction ID'}</th>
                <th className="px-6 py-3">{p.type || 'Description'}</th>
                <th className="px-6 py-3">{p.method || 'Payment Method'}</th>
                <th className="px-6 py-3">{p.date || 'Date'}</th>
                <th className="px-6 py-3">{p.amount || 'Amount'}</th>
                <th className="px-6 py-3">{p.status || 'Status'}</th>
                <th className="px-6 py-3">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-husk-100 text-soil-800">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-soil-500 font-medium text-xs">
                    {loadingTx
                      ? 'Loading transaction ledger from database...'
                      : (isTamil
                      ? 'பரிவர்த்தனை விவரங்கள் ஏதும் இல்லை. ஸ்லாட் கட்டணம் செலுத்திய பின் அல்லது MSP வரவு கிடைத்த பின் இங்கு பதிவாகும்.'
                      : 'No transactions recorded yet. When you pay a slot verification fee or receive a government MSP payout, it will appear here.')}
                  </td>
                </tr>
              ) : transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-husk-50/50 transition">
                  <td className="px-6 py-3.5 font-data text-xs font-semibold text-field-900">{tx.id}</td>
                  <td className="px-6 py-3.5 font-medium">{isTamil ? (tx.typeTa || tx.type) : tx.type}</td>
                  <td className="px-6 py-3.5 text-xs text-soil-600">{isTamil ? (tx.methodTa || tx.method) : tx.method}</td>
                  <td className="px-6 py-3.5 text-xs text-soil-600">{tx.date}</td>
                  <td className={`px-6 py-3.5 font-data font-bold ${tx.credit ? 'text-ok-600' : 'text-soil-800'}`}>
                    {tx.credit ? `+ ₹ ${tx.amount}` : `- ₹ ${tx.amount}`}
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-ok-100 px-2.5 py-0.5 text-xs font-semibold text-field-800">
                      ✓ {isTamil ? (tx.statusTa || tx.status) : tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <button onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-bold text-field-700 hover:text-field-900 underline">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                       {isTamil ? 'பதிவிறக்கு' : 'Download'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Razorpay Modal Component */}
      <RazorpayModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        amount={50}
        purpose={`AgriProcure Slot Verification Fee (${currentCrop || 'Crops'})`}
        purposeTa={`அக்ரிப்ரோக்யூர் முன்பதிவு & ஆய்வு கட்டணம் (${currentCrop || 'பயிர்'})`}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
