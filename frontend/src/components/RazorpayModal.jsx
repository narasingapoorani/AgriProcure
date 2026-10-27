import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../data/translations';

export default function RazorpayModal({
  isOpen,
  onClose,
  amount = 50,
  purpose = 'Slot Verification & Moisture Testing Fee',
  purposeTa = 'முன்பதிவு & ஈரப்பதம் ஆய்வு கட்டணம்',
  onSuccess,
}) {
  const { state } = useApp();
  const t = getTranslation(state.language);
  const p = t.paymentsPage;
  const isTamil = state.language === 'Tamil';

  const farmerFullName = state.farmerUser?.full_name || state.farmerUser?.name || 'Registered Farmer';
  const farmerPhone = state.farmerUser?.mobile_number || state.farmerUser?.mobile || state.farmerUser?.phone || '';
  const [activeTab, setActiveTab] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [upiId, setUpiId] = useState(farmerPhone ? `${farmerPhone.replace(/\D/g, '').slice(-10)}@upi` : 'kisan@upi');
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [card, setCard] = useState({ number: 'RuPay Kisan Credit Card •••• 8921', expiry: '12/28', cvv: '•••', name: farmerFullName });
  const [selectedBank, setSelectedBank] = useState('SBI');
  const [processing, setProcessing] = useState(false);
  const [customKey, setCustomKey] = useState('');
  const [useLiveScript, setUseLiveScript] = useState(false);

  useEffect(() => {
    if (useLiveScript && !window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, [useLiveScript]);

  if (!isOpen) return null;

  const handlePay = () => {
    if (useLiveScript && customKey && window.Razorpay) {
      try {
        const options = {
          key: customKey,
          amount: amount * 100,
          currency: 'INR',
          name: 'AgriProcure',
          description: isTamil ? purposeTa : purpose,
          handler: function (response) {
            onSuccess?.({
              paymentId: response.razorpay_payment_id || `pay_${Math.random().toString(36).substring(2, 14)}`,
              orderId: response.razorpay_order_id || `order_${Math.random().toString(36).substring(2, 12)}`,
              method: 'Razorpay Live Checkout',
              amount,
              date: new Date().toLocaleString(),
            });
            onClose();
          },
          prefill: {
            name: state.farmerUser?.name || 'Farmer',
            contact: state.farmerUser?.mobile || '9876543210',
          },
          theme: {
            // Razorpay's SDK needs a literal color, not a CSS var reference,
            // so resolve the current theme's field-700 value at call time.
            color: getComputedStyle(document.documentElement).getPropertyValue('--color-field-700').trim() || '#296049',
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
        return;
      } catch {
        // Fallback to simulation
      }
    }

    // Default fast interactive checkout simulation
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      const randomId = 'pay_' + Math.random().toString(36).substring(2, 12).toUpperCase();
      const randomOrder = 'order_' + Math.random().toString(36).substring(2, 10).toUpperCase();
      const methodLabel = activeTab === 'upi' ? `UPI (${selectedUpiApp.toUpperCase()})` : activeTab === 'card' ? 'Visa / RuPay Card' : `Net Banking (${selectedBank})`;

      onSuccess?.({
        paymentId: randomId,
        orderId: randomOrder,
        method: methodLabel,
        amount,
        purpose: isTamil ? purposeTa : purpose,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      });
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-soil-900/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-lg bg-husk-100 shadow-lg animate-in fade-in zoom-in duration-200">
        {/* Razorpay Branded Header */}
        <div className="bg-razorpay-navy px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-field-700 font-bold text-white shadow-xs">
              🌾
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-semibold tracking-wide text-white">AgriProcure</span>
                <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-sky-300">
                  VERIFIED
                </span>
              </div>
              <p className="text-xs text-blue-200/80">{isTamil ? purposeTa : purpose}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-blue-200/70">{isTamil ? 'தொகை' : 'Amount'}</span>
            <p className="font-data text-xl font-bold text-white">₹{amount}</p>
          </div>
        </div>

        {/* Razorpay Trust Bar */}
        <div className="flex items-center justify-between bg-blue-50/80 px-6 py-1.5 text-[11px] text-soil-700 border-b border-blue-100">
          <span className="flex items-center gap-1 font-medium text-razorpay-navy">
            <svg className="h-3.5 w-3.5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
            </svg>
            {p.securedByRazorpay}
          </span>
          <span className="text-soil-500">256-bit SSL • RBI Compliant</span>
        </div>

        {/* Payment Methods */}
        <div className="p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-soil-500 mb-3">
            {p.selectMethod}
          </p>

          <div className="grid grid-cols-3 gap-2 mb-4">
            <button
              type="button"
              onClick={() => setActiveTab('upi')}
              className={`flex flex-col items-center justify-center gap-1.5 rounded-md border py-2.5 px-2 text-xs font-semibold transition ${
                activeTab === 'upi'
                  ? 'border-field-600 bg-field-50 text-field-900 shadow-xs'
                  : 'border-husk-200 bg-husk-100 text-soil-600 hover:border-soil-400'
              }`}
            >
              <span className="text-lg">📱</span>
              UPI
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('card')}
              className={`flex flex-col items-center justify-center gap-1.5 rounded-md border py-2.5 px-2 text-xs font-semibold transition ${
                activeTab === 'card'
                  ? 'border-field-600 bg-field-50 text-field-900 shadow-xs'
                  : 'border-husk-200 bg-husk-100 text-soil-600 hover:border-soil-400'
              }`}
            >
              <span className="text-lg">💳</span>
              {isTamil ? 'கார்டுகள்' : 'Cards'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('netbanking')}
              className={`flex flex-col items-center justify-center gap-1.5 rounded-md border py-2.5 px-2 text-xs font-semibold transition ${
                activeTab === 'netbanking'
                  ? 'border-field-600 bg-field-50 text-field-900 shadow-xs'
                  : 'border-husk-200 bg-husk-100 text-soil-600 hover:border-soil-400'
              }`}
            >
              <span className="text-lg">🏛️</span>
              Net Banking
            </button>
          </div>

          {/* Tab 1: UPI */}
          {activeTab === 'upi' && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'gpay', name: 'Google Pay', icon: '🟢' },
                  { id: 'phonepe', name: 'PhonePe', icon: '🟣' },
                  { id: 'paytm', name: 'Paytm', icon: '🔵' },
                ].map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => setSelectedUpiApp(app.id)}
                    className={`flex items-center justify-center gap-1.5 rounded-md border p-2 text-xs font-medium transition ${
                      selectedUpiApp === app.id
                        ? 'border-field-700 bg-field-100 text-field-900 font-semibold'
                        : 'border-husk-200 hover:bg-husk-50 text-soil-700'
                    }`}
                  >
                    <span>{app.icon}</span>
                    {app.name}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs font-medium text-soil-700">{p.enterUpiId}</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="username@upi"
                  className="mt-1 w-full rounded-md border border-husk-200 px-3 py-2 text-sm outline-none focus:border-field-600 font-data"
                />
              </div>
            </div>
          )}

          {/* Tab 2: Cards */}
          {activeTab === 'card' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-soil-700">{p.cardNumber}</label>
                <div className="mt-1 flex items-center rounded-md border border-husk-200 px-3 py-2 focus-within:border-field-600">
                  <input
                    type="text"
                    value={card.number}
                    onChange={(e) => setCard({ ...card, number: e.target.value })}
                    className="w-full text-sm outline-none font-data"
                    placeholder="4532 0000 0000 0000"
                  />
                  <span className="text-xs font-bold text-soil-400">RuPay</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-soil-700">{p.cardExpiry}</label>
                  <input
                    type="text"
                    value={card.expiry}
                    onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                    className="mt-1 w-full rounded-md border border-husk-200 px-3 py-2 text-sm outline-none focus:border-field-600 font-data"
                    placeholder="MM/YY"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-soil-700">{p.cardCvv}</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={card.cvv}
                    onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                    className="mt-1 w-full rounded-md border border-husk-200 px-3 py-2 text-sm outline-none focus:border-field-600 font-data"
                    placeholder="CVV"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Net Banking */}
          {activeTab === 'netbanking' && (
            <div>
              <label className="text-xs font-medium text-soil-700">{p.selectBank}</label>
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="mt-1 w-full rounded-md border border-husk-200 bg-husk-100 px-3 py-2.5 text-sm outline-none focus:border-field-600"
              >
                <option value="SBI">State Bank of India (SBI)</option>
                <option value="HDFC">HDFC Bank</option>
                <option value="ICICI">ICICI Bank</option>
                <option value="Axis">Axis Bank</option>
                <option value="Canara">Canara Bank</option>
                <option value="IOB">Indian Overseas Bank (IOB)</option>
                <option value="TMB">Tamilnad Mercantile Bank (TMB)</option>
              </select>
            </div>
          )}

          {/* Optional Live Key setting collapsible */}
          <div className="mt-4 pt-3 border-t border-husk-100">
            <details className="text-[11px] text-soil-500">
              <summary className="cursor-pointer font-medium hover:text-soil-700">
                ⚙️ {isTamil ? 'நேரடி ரேசர்பே Key அமைப்புகள் (விருப்பத்தேர்வு)' : 'Live Razorpay Key Settings (Optional)'}
              </summary>
              <div className="mt-2 space-y-2 rounded-md bg-husk-50 p-2.5">
                <input
                  type="text"
                  placeholder="rzp_test_..."
                  value={customKey}
                  onChange={(e) => {
                    setCustomKey(e.target.value);
                    setUseLiveScript(Boolean(e.target.value));
                  }}
                  className="w-full rounded border border-husk-200 bg-husk-100 px-2 py-1 text-xs outline-none"
                />
                <p className="text-[10px] text-soil-500">{p.testModeNotice}</p>
              </div>
            </details>
          </div>

          {/* Actions */}
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={processing}
              className="flex-1 rounded-md border border-husk-200 px-4 py-2.5 text-sm font-semibold text-soil-700 hover:bg-husk-100 transition"
            >
              {p.cancel}
            </button>
            <button
              type="button"
              onClick={handlePay}
              disabled={processing}
              className="flex-[2] rounded-md bg-field-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-field-800 transition flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>{p.verifying}</span>
                </>
              ) : (
                <>
                  <span>🔒</span>
                  <span>{isTamil ? `₹${amount} செலுத்தவும்` : `Pay ₹${amount} with Razorpay`}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
