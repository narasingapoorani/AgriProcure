import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import DashboardLayout from '../../components/DashboardLayout';
import { officerNavItems } from '../../data/navItems';

export default function OfficerDashboard() {
  const { state, logoutOfficer } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const isTamil = state.language === 'Tamil';

  if (!state.officerUser) return <Navigate to="/officer-login" replace />;

  const handleLogout = () => {
    logoutOfficer();
    navigate('/');
  };

  const active = officerNavItems.find((item) =>
    item.to === '/officer-dashboard' ? location.pathname === item.to : location.pathname.startsWith(item.to)
  );
  const title = active
    ? (isTamil ? (active.labelTa || active.label) : active.label)
    : (isTamil ? 'அலுவலர் முகப்பு' : 'Officer dashboard');

  const rawOfficerName = state.officerUser?.full_name || state.officerUser?.name || '';
  const isDefaultDemo = (state.officerUser?.id === 2 || state.officerUser?.username === 'officer1') && (!rawOfficerName || /^\+?\d[\d\s-]{7,15}$/.test(rawOfficerName.trim()) || rawOfficerName === 'officer1');
  const resolvedOfficerName = isDefaultDemo
    ? (isTamil ? 'டாக்டர் அரவிந்த் சர்மா' : 'Dr. Arvind Sharma')
    : (rawOfficerName || (isTamil ? 'அதிகாரி' : 'Officer'));

  return (
    <DashboardLayout title={title} userLabel={resolvedOfficerName} items={officerNavItems} onLogout={handleLogout}>
      <Outlet />
    </DashboardLayout>
  );
}
