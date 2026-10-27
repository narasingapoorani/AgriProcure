import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../data/translations';
import AuthShell from '../../components/AuthShell';
import api from '../../services/api';

export default function OfficerLogin() {
  const navigate = useNavigate();
  const { state, update } = useApp();
  const t = getTranslation(state.language);
  const isTamil = state.language === 'Tamil';
  const [form, setForm] = useState({ officerId: '', password: '' });
  const [error, setError] = useState('');
  const [accountNotFound, setAccountNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanId = form.officerId.trim();
    if (!cleanId || !form.password) {
      setError(
        isTamil
          ? 'அலுவலர் ஐடி அல்லது பயனர்பெயர் மற்றும் கடவுச்சொல்லை உள்ளிடவும்.'
          : 'Enter your Officer ID / username and password.'
      );
      setAccountNotFound(false);
      return;
    }
    setLoading(true);
    setError('');
    setAccountNotFound(false);

    try {
      const res = await api.login(cleanId, form.password);
      if (res.token) {
        localStorage.setItem('agri_ai_token', res.token);
      }
      update({ 
        officerUser: { 
          name: res.user?.full_name || cleanId,
          officerId: res.user?.officer_id || cleanId,
          id: res.user?.id || 1,
          ...res.user
        } 
      });
      navigate('/officer-dashboard');
    } catch (err) {
      console.warn('Officer login failed:', err);
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
    <AuthShell title={t.officerLoginTitle} subtitle={t.officerLoginSubtitle}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium text-soil-800">
            {isTamil ? 'அலுவலர் ஐடி அல்லது பயனர்பெயர்' : 'Officer ID or username'}
          </label>
          <input
            value={form.officerId}
            onChange={(e) => {
              setForm({ ...form, officerId: e.target.value });
              if (error) { setError(''); setAccountNotFound(false); }
            }}
            className="mt-1 w-full rounded-md border border-husk-200 bg-husk-50 text-soil-800 px-3 py-2.5 text-sm outline-none focus:border-field-600 transition-colors"
            placeholder="e.g. officer1 or OFC-2201"
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
            placeholder="e.g. officer123"
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
                      {isTamil ? 'புதிய அலுவலர் கணக்கு தொடங்க:' : "Don't have an officer account yet?"}
                    </span>
                    <Link
                      to="/officer-register"
                      className="inline-flex items-center justify-center gap-1.5 font-bold text-xs bg-field-800 text-white hover:bg-field-900 px-3.5 py-1.5 rounded-lg shadow transition-colors"
                    >
                      <span>📝</span>
                      <span>{isTamil ? 'அலுவலராக பதிவு செய்க' : 'Register as Officer'} →</span>
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
        <Link to="/officer-register" className="font-semibold text-field-700 hover:text-field-900 underline">
          {t.newHereOfficer}
        </Link>
      </p>
    </AuthShell>
  );
}
