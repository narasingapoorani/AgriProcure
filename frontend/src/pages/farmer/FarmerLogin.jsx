import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../data/translations';
import AuthShell from '../../components/AuthShell';
import api from '../../services/api';

export default function FarmerLogin() {
  const navigate = useNavigate();
  const { state, update } = useApp();
  const t = getTranslation(state.language);
  const isTamil = state.language === 'Tamil';
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [accountNotFound, setAccountNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanUsername = form.username.trim();
    if (!cleanUsername || !form.password) {
      setError(
        isTamil
          ? 'பயனர்பெயர் அல்லது அலைபேசி எண் மற்றும் கடவுச்சொல்லை உள்ளிடவும்.'
          : 'Enter your username or mobile number and password.'
      );
      setAccountNotFound(false);
      return;
    }
    setLoading(true);
    setError('');
    setAccountNotFound(false);

    try {
      const res = await api.login(cleanUsername, form.password);
      if (res.token) {
        localStorage.setItem('agri_ai_token', res.token);
      }
      const u = res.user || {};
      const fp = u.farmer_profile || {};
      const rawName = u.full_name || u.name || cleanUsername;
      const isDefaultSeed = (u.id === 1 || u.username === 'farmer1');
      const resolvedName = isDefaultSeed && (!rawName || rawName === 'farmer1' || /^\+?\d[\d\s-]{7,15}$/.test(String(rawName).trim()))
        ? 'Ramesh Kisan Patil'
        : (rawName || 'Ramesh Kisan Patil');

      update({ 
        farmerUser: { 
          id: u.id,
          username: u.username,
          name: resolvedName,
          full_name: resolvedName,
          mobile_number: u.mobile_number || (/^\d+$/.test(cleanUsername) ? cleanUsername : '9876543210'),
          mobile: u.mobile_number || (/^\d+$/.test(cleanUsername) ? cleanUsername : '9876543210'),
          phone: u.mobile_number || (/^\d+$/.test(cleanUsername) ? cleanUsername : '9876543210'),
          aadhaar_number: u.aadhaar_number || '1234 5678 9012',
          aadhaar: u.aadhaar_number || '1234 5678 9012',
          district: fp.district || u.district || 'Coimbatore',
          state: fp.state || u.state || 'Tamil Nadu',
          landArea: fp.land_area_acres != null ? String(fp.land_area_acres) : (u.landArea || '4.5'),
          land_area_acres: fp.land_area_acres != null ? fp.land_area_acres : 4.5,
          landLocation: fp.address || u.landLocation || `${fp.district || u.district || 'Coimbatore'}, ${fp.state || u.state || 'Tamil Nadu'}`,
          address: fp.address || u.address || `${fp.district || u.district || 'Coimbatore'}, ${fp.state || u.state || 'Tamil Nadu'}`,
          cropDetails: fp.primary_crop || u.cropDetails || 'Cotton',
          primary_crop: fp.primary_crop || u.primary_crop || 'Cotton',
          latitude: fp.latitude,
          longitude: fp.longitude,
          ...u,
          farmer_profile: fp
        },
        selectedCrop: null,
        selectedCenter: null,
        recommendedCenter: null,
        slot: null,
        feePaid: false
      });
      navigate('/farmer-dashboard');
    } catch (err) {
      console.warn('Login failed:', err);
      // Strictly block login! Check whether account exists or password is invalid
      const msg = err.message || '';
      const isNotFound = err.errorCode === 'ACCOUNT_NOT_FOUND' || 
                         err.status === 404 || 
                         /doesn'?t exist|not exist|not found|register first/i.test(msg);

      if (isNotFound) {
        setAccountNotFound(true);
        setError(
          isTamil
            ? 'கணக்கு இல்லை. தயவுசெய்து முதலில் பதிவு செய்யவும்.'
            : "Account doesn't exist. Please register first."
        );
      } else if (err.errorCode === 'INVALID_PASSWORD' || /password/i.test(msg)) {
        setAccountNotFound(false);
        setError(
          isTamil
            ? 'தவறான கடவுச்சொல். தயவுசெய்து சரியான கடவுச்சொல்லை உள்ளிடவும்.'
            : 'Invalid password. Please check your credentials.'
        );
      } else {
        setAccountNotFound(false);
        setError(
          msg || (isTamil
            ? 'உள்நுழைவு தோல்வியடைந்தது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.'
            : 'Login failed. Please check your credentials and try again.')
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title={t.farmerLoginTitle} subtitle={t.farmerLoginSubtitle}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium text-soil-800">{t.usernameOrMobile}</label>
          <input
            value={form.username}
            onChange={(e) => {
              setForm({ ...form, username: e.target.value });
              if (error) { setError(''); setAccountNotFound(false); }
            }}
            className="mt-1 w-full rounded-md border border-husk-200 bg-husk-50 text-soil-800 px-3 py-2.5 text-sm outline-none focus:border-field-600 transition-colors"
            placeholder="e.g. farmer1 or 9876543210"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-soil-800">{t.password}</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => {
              setForm({ ...form, password: e.target.value });
              if (error) { setError(''); setAccountNotFound(false); }
            }}
            className="mt-1 w-full rounded-md border border-husk-200 bg-husk-50 text-soil-800 px-3 py-2.5 text-sm outline-none focus:border-field-600 transition-colors"
            placeholder="e.g. farmer123"
          />
        </div>

        {error && (
          <div className={`rounded-xl p-4 border text-sm transition-all animate-in fade-in duration-200 ${
            accountNotFound 
              ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-sm' 
              : 'bg-danger-50 border-danger-200 text-danger-700'
          }`}>
            <div className="flex items-start gap-2.5">
              <span className="text-lg shrink-0 mt-0.5">{accountNotFound ? '⚠️' : '❌'}</span>
              <div className="flex-1">
                <p className="font-bold text-sm leading-snug">{error}</p>
                {accountNotFound && (
                  <div className="mt-3 pt-2.5 border-t border-amber-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="text-xs text-amber-800 font-medium">
                      {isTamil ? 'புதிய கணக்கு தொடங்க:' : "Don't have an account yet?"}
                    </span>
                    <Link
                      to="/farmer-register"
                      className="inline-flex items-center justify-center gap-1.5 font-bold text-xs bg-field-800 text-white hover:bg-field-900 px-3.5 py-1.5 rounded-lg shadow transition-colors"
                    >
                      <span>📝</span>
                      <span>{isTamil ? 'விவசாயியாக பதிவு செய்க' : 'Register as Farmer'} →</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="mt-2 rounded-md bg-field-800 px-4 py-3 text-sm font-semibold text-white hover:bg-field-900 transition-colors shadow-sm disabled:opacity-60"
        >
          {loading ? (isTamil ? 'உள்நுழைகிறது...' : 'Logging in...') : t.loginBtn}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-soil-600/80">
        <Link to="/farmer-register" className="font-semibold text-field-700 hover:text-field-900 underline">
          {t.newHereFarmer}
        </Link>
      </p>
    </AuthShell>
  );
}
