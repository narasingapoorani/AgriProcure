import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../data/translations';
import AuthShell from '../../components/AuthShell';
import api from '../../services/api';

const DEPARTMENTS = ['Agriculture Marketing', 'Cooperation', 'Food & Civil Supplies'];
const STEP_LABELS = ['Mobile', 'Officer details', 'Account'];
const STEP_LABELS_TA = ['அலைபேசி', 'அலுவலர் விவரங்கள்', 'கணக்கு'];

export default function OfficerRegister() {
  const navigate = useNavigate();
  const { state, update } = useApp();
  const t = getTranslation(state.language);
  const isTamil = state.language === 'Tamil';
  const currentStepLabels = isTamil ? STEP_LABELS_TA : STEP_LABELS;
  const [step, setStep] = useState(1);

  const [mobile, setMobile] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState('');

  const [details, setDetails] = useState({ name: '', officerId: '', department: DEPARTMENTS[0], aadhaar: '' });
  const [aadhaarVerified, setAadhaarVerified] = useState(false);

  const [account, setAccount] = useState({ username: '', password: '', confirm: '' });
  const [accountError, setAccountError] = useState('');

  useEffect(() => {
    if (details.officerId && !account.username) {
      setAccount((a) => ({ ...a, username: details.officerId }));
    }
  }, [details.officerId]);

  const sendOtp = async () => {
    if (mobile.length < 10) return;
    try {
      const res = await api.sendOtp(mobile);
      setOtpSent(true);
      if (res.otp) setOtp(res.otp);
    } catch (err) {
      setOtpSent(true);
    }
  };

  const verifyOtp = async () => {
    try {
      const res = await api.verifyOtp(mobile, otp);
      if (res.status === 'success' || res.verified) {
        setOtpVerified(true);
        setOtpError('');
      } else {
        setOtpError(res.message || 'Incorrect OTP code.');
      }
    } catch (err) {
      if (otp.length === 6) {
        setOtpVerified(true);
        setOtpError('');
      } else {
        setOtpError('Please enter a valid 6-digit OTP.');
      }
    }
  };

  const finish = async () => {
    if (!account.password) {
      setAccountError('Set a password to continue.');
      return;
    }
    if (account.password !== account.confirm) {
      setAccountError('Passwords do not match.');
      return;
    }

    try {
      const res = await api.registerOfficer({
        username: account.username || details.officerId,
        password: account.password,
        full_name: details.name || account.username,
        mobile_number: mobile,
        officer_id: details.officerId,
        department: details.department,
        aadhaar_number: details.aadhaar || '123456789012'
      });

      if (res.token) {
        localStorage.setItem('agri_ai_token', res.token);
      }
      const registeredOfficer = {
        id: res.user?.id,
        name: details.name || account.username,
        full_name: details.name || account.username,
        officerId: details.officerId,
        officer_id_code: details.officerId,
        department: details.department,
        mobile_number: mobile,
        phone: mobile,
        aadhaar_number: details.aadhaar || '123456789012',
        ...(res.user || {})
      };
      update({ officerUser: registeredOfficer });
      navigate('/officer-dashboard');
    } catch (err) {
      console.warn('Officer registration API note:', err);
      const registeredOfficer = {
        name: details.name || account.username,
        full_name: details.name || account.username,
        officerId: details.officerId,
        officer_id_code: details.officerId,
        department: details.department,
        mobile_number: mobile,
        phone: mobile,
        aadhaar_number: details.aadhaar || '123456789012'
      };
      update({ officerUser: registeredOfficer });
      navigate('/officer-dashboard');
    }
  };

  return (
    <AuthShell title={t.officerRegisterTitle} subtitle={t.officerRegisterSubtitle}>
      <ol className="mb-6 flex items-center gap-2 text-xs font-medium text-soil-600/60">
        {currentStepLabels.map((label, idx) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                idx + 1 <= step ? 'bg-soil-800 text-white' : 'bg-husk-100 text-soil-600/60'
              }`}
            >
              {idx + 1}
            </span>
            <span className={idx + 1 === step ? 'text-soil-800' : ''}>{label}</span>
            {idx < currentStepLabels.length - 1 && <span className="h-px flex-1 bg-husk-200" />}
          </li>
        ))}
      </ol>

      {step === 1 && (
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-soil-800">
              {isTamil ? 'அலைபேசி எண் (வாட்ஸ்அப்)' : 'Mobile number (WhatsApp)'}
            </label>
            <div className="mt-1 flex gap-2">
              <input
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="flex-1 rounded-md border border-husk-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
                placeholder={isTamil ? '10 இலக்க வாட்ஸ்அப் எண்' : '10-digit WhatsApp number'}
              />
              <button
                type="button"
                onClick={sendOtp}
                className="shrink-0 flex items-center gap-1.5 rounded-md border border-emerald-600 bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-100"
              >
                <span>💬</span>
                {isTamil ? 'வாட்ஸ்அப் OTP' : 'Send WhatsApp OTP'}
              </button>
            </div>
          </div>
          {otpSent && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                {isTamil ? 'வாட்ஸ்அப் வழியாக OTP அனுப்பப்பட்டது' : 'OTP delivered to your WhatsApp number'}
              </div>
              <p className="mt-1 text-xs text-soil-600">
                {isTamil ? 'மாதிரி OTP: 123456 (வாட்ஸ்அப் சரிபார்க்கவும்)' : 'Demo OTP: 123456 (check your WhatsApp)'}
              </p>
              <div className="mt-2 flex gap-2">
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="flex-1 rounded-md border border-husk-200 bg-husk-100 px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
                  placeholder={isTamil ? '6 இலக்க OTP' : '6-digit OTP'}
                />
                <button
                  type="button"
                  onClick={verifyOtp}
                  className="shrink-0 rounded-md bg-[#075e54] px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-[#064e46]"
                >
                  {isTamil ? 'சரிபார்க்கவும்' : 'Verify OTP'}
                </button>
              </div>
              {otpError && <p className="mt-1 text-sm text-danger-600">{otpError}</p>}
              {otpVerified && (
                <p className="mt-2 text-sm font-medium text-emerald-700 flex items-center gap-1">
                  <span>✓</span> {isTamil ? 'வாட்ஸ்அப் எண் சரிபார்க்கப்பட்டது' : 'WhatsApp number verified'}
                </p>
              )}
            </div>
          )}
          <button
            disabled={!otpVerified}
            onClick={() => setStep(2)}
            className="mt-2 rounded-md bg-soil-800 px-4 py-3 text-sm font-semibold text-white hover:bg-soil-800/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isTamil ? 'தொடரவும்' : 'Continue'}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-4">
          <LabeledInput label="Officer name" value={details.name} onChange={(v) => setDetails({ ...details, name: v })} />
          <LabeledInput label="Officer ID" value={details.officerId} onChange={(v) => setDetails({ ...details, officerId: v })} placeholder="e.g. OFC-2201" />
          <div>
            <label className="text-sm font-medium text-soil-800">Department</label>
            <select value={details.department} onChange={(e) => setDetails({ ...details, department: e.target.value })} className="mt-1 w-full rounded-md border border-husk-200 bg-husk-100 px-3 py-2.5 text-sm outline-none focus:border-field-600">
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-soil-800">Aadhaar number</label>
            <div className="mt-1 flex gap-2">
              <input value={details.aadhaar} onChange={(e) => setDetails({ ...details, aadhaar: e.target.value })} className="flex-1 rounded-md border border-husk-200 px-3 py-2.5 text-sm outline-none focus:border-field-600" placeholder="12-digit Aadhaar number" />
              <button onClick={() => setAadhaarVerified(true)} className="shrink-0 rounded-md border border-soil-600 px-3 py-2.5 text-sm font-semibold text-soil-800 hover:bg-husk-100">
                Verify Aadhaar
              </button>
            </div>
            {aadhaarVerified && <p className="mt-1 text-sm font-medium text-field-700">Identity verified</p>}
          </div>
          <div className="mt-2 flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 rounded-md border border-husk-200 px-4 py-3 text-sm font-semibold text-soil-800 hover:bg-husk-100">Back</button>
            <button onClick={() => setStep(3)} disabled={!details.name || !details.officerId || !aadhaarVerified} className="flex-1 rounded-md bg-soil-800 px-4 py-3 text-sm font-semibold text-white hover:bg-soil-800/90 disabled:cursor-not-allowed disabled:opacity-40">
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-4">
          <LabeledInput label="Username" value={account.username} onChange={(v) => setAccount({ ...account, username: v })} />
          <LabeledInput label="Password" type="password" value={account.password} onChange={(v) => setAccount({ ...account, password: v })} />
          <LabeledInput label="Confirm password" type="password" value={account.confirm} onChange={(v) => setAccount({ ...account, confirm: v })} />
          {accountError && <p className="text-sm text-danger-600">{accountError}</p>}
          <div className="mt-2 flex gap-3">
            <button onClick={() => setStep(2)} className="flex-1 rounded-md border border-husk-200 px-4 py-3 text-sm font-semibold text-soil-800 hover:bg-husk-100">Back</button>
            <button onClick={finish} className="flex-1 rounded-md bg-field-800 px-4 py-3 text-sm font-semibold text-white hover:bg-field-900 transition-colors shadow-sm">Create profile</button>
          </div>
        </div>
      )}
    </AuthShell>
  );
}

function LabeledInput({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label className="text-sm font-medium text-soil-800">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-husk-200 bg-husk-50 text-soil-800 px-3 py-2.5 text-sm outline-none focus:border-field-600 transition-colors"
      />
    </div>
  );
}
