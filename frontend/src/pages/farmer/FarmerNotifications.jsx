import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../data/translations';
import NotificationCard from '../../components/NotificationCard';
import { Bell, CheckCheck, RefreshCw, Inbox, Trash2 } from 'lucide-react';
import api from '../../services/api';

export default function FarmerNotifications() {
  const { state } = useApp();
  const t = getTranslation(state.language);
  const isTamil = state.language === 'Tamil';
  const np = t.notificationsPage;
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.getFarmerNotifications(state.farmerUser?.id);
      if (res.status === 'success' && res.notifications) {
        // Filter out empty notifications to prevent unwanted blank bars
        const valid = res.notifications.filter(n => n && (n.title || n.message));
        setNotifications(valid);
      }
    } catch (err) {
      console.warn('Live notifications fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [state.farmerUser]);

  const handleDismiss = async (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await api.deleteFarmerNotification(id);
    } catch (err) {
      console.warn('Notification dismiss error:', err);
    }
  };

  const handleClearAll = async () => {
    setNotifications([]);
    try {
      await api.clearFarmerNotifications(state.farmerUser?.id);
    } catch (err) {
      console.warn('Clear notifications error:', err);
    }
  };

  const validNotifications = notifications.filter(n => n && (n.title || n.message));

  const filtered = validNotifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'success') return n.type === 'sms' || n.type === 'whatsapp' || n.type === 'success';
    return n.type === filter;
  });

  return (
    <div className="max-w-3xl mx-auto w-full pb-12 flex flex-col gap-6">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-field-900 via-field-800 to-field-700 px-8 py-8 shadow-xl text-white ai-glow">
        <div className="flex items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2 text-field-100">
              <Bell className="w-3.5 h-3.5 text-harvest-300" />
              {isTamil ? 'நேரலை அறிவிப்புகள்' : 'Live Alerts & Dispatch'}
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {isTamil ? 'அறிவிப்புகள்' : 'Notifications & WhatsApp Updates'}
            </h2>
            <p className="text-field-100 text-sm font-medium mt-1">
              {isTamil
                ? 'உங்கள் முன்பதிவு நேரம், டோக்கன் நிலை மற்றும் கட்டண வரவு தகவல்கள்.'
                : 'Real-time updates regarding your slot verification, token dispatch, and MSP payouts.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {validNotifications.length > 0 && (
              <button
                onClick={handleClearAll}
                title={isTamil ? 'அனைத்தையும் நீக்கு' : 'Clear All Alerts'}
                className="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition active:scale-95 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isTamil ? 'அனைத்தையும் நீக்கு' : 'Clear All'}</span>
              </button>
            )}
            <button 
              onClick={fetchNotifications}
              title="Refresh"
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-husk-200 pb-3 text-xs font-bold">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl transition ${filter === 'all' ? 'bg-field-800 text-white shadow-sm' : 'bg-husk-100 text-soil-700 hover:bg-husk-200'}`}
        >
          {isTamil ? 'அனைத்தும்' : 'All Alerts'} ({validNotifications.length})
        </button>
        <button
          onClick={() => setFilter('success')}
          className={`px-4 py-2 rounded-xl transition ${filter === 'success' ? 'bg-field-800 text-white shadow-sm' : 'bg-husk-100 text-soil-700 hover:bg-husk-200'}`}
        >
          {isTamil ? 'டோக்கன் & உறுதி' : 'Confirmed & Token'}
        </button>
      </div>

      {/* Notifications List */}
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="py-12 text-center text-xs font-semibold text-soil-500">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-field-700 mb-2" />
            {isTamil ? 'அறிவிப்புகளை ஏற்றுகிறது...' : 'Loading notifications from database...'}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-husk-300 bg-husk-100 p-12 text-center">
            <Inbox className="w-10 h-10 text-soil-400 mx-auto mb-2" />
            <p className="font-bold text-field-900 text-sm">{isTamil ? 'அறிவிப்புகள் ஏதும் இல்லை' : 'No Notifications Yet'}</p>
            <p className="text-xs text-soil-500 mt-1">{isTamil ? 'டோக்கன் உறுதி அல்லது கட்டண மாற்றங்கள் இங்கு பதிவாகும்.' : 'Token confirmations and payment updates will arrive here.'}</p>
          </div>
        ) : (
          filtered.map(n => (
            <NotificationCard
              key={n.id}
              {...n}
              notification={n}
              onDismiss={() => handleDismiss(n.id)}
            />
          ))
        )}
      </div>

    </div>
  );
}
