import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import DashboardLayout from '../../components/DashboardLayout';
import { farmerNavItems } from '../../data/navItems';

// Which nav items are unlocked at each flow step (inclusive — all steps up to this one show)
// step 0 = no crop; 1 = crop; 2 = center; 3 = slot; 4 = paid
const NAV_UNLOCK_AT_STEP = {
  '/farmer-dashboard': 0,           // Dashboard — always visible
  '/farmer-dashboard/add-crop': 0,  // Add crop — always visible
  '/farmer-dashboard/recommended-centers': 1, // Unlocks after crop
  '/farmer-dashboard/slot': 2,      // Unlocks after center
  '/farmer-dashboard/payments': 3,  // Unlocks after slot
  '/farmer-dashboard/live-queue': 3,         // Unlocks after slot
  '/farmer-dashboard/timeline': 4,           // Unlocks after payment
  '/farmer-dashboard/support': 0,            // Always visible
  '/farmer-dashboard/notifications': 0,      // Always visible
  '/farmer-dashboard/profile': 0,            // Always visible
};

function getFlowStep(state) {
  if (!state.selectedCrop) return 0;
  if (!state.selectedCenter) return 1;
  if (!state.slot) return 2;
  if (!state.feePaid) return 3;
  return 4;
}

export default function FarmerDashboard() {
  const { state, logoutFarmer } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const isTamil = state.language === 'Tamil';

  if (!state.farmerUser) return <Navigate to="/farmer-login" replace />;

  const step = getFlowStep(state);

  // Filter nav items — only show items whose required step <= current step
  const visibleNavItems = farmerNavItems.filter((item) => {
    const requiredStep = NAV_UNLOCK_AT_STEP[item.to];
    // If no rule found, always show
    if (requiredStep === undefined) return true;
    return step >= requiredStep;
  });

  const handleLogout = () => {
    logoutFarmer();
    navigate('/');
  };

  const active = visibleNavItems.find((item) =>
    item.to === '/farmer-dashboard' ? location.pathname === item.to : location.pathname.startsWith(item.to)
  );
  const title = active
    ? (isTamil ? (active.labelTa || active.label) : active.label)
    : (isTamil ? 'விவசாயி முகப்பு' : 'Farmer dashboard');

  const rawFarmerName = state.farmerUser?.full_name || state.farmerUser?.name || '';
  const isDefaultDemo = (state.farmerUser?.id === 1 || state.farmerUser?.username === 'farmer1') && (!rawFarmerName || /^\+?\d[\d\s-]{7,15}$/.test(rawFarmerName.trim()) || rawFarmerName === 'farmer1');
  const resolvedFarmerName = isDefaultDemo
    ? (isTamil ? 'ரமேஷ் கிசான் பாட்டீல்' : 'Ramesh Kisan Patil')
    : (rawFarmerName || (isTamil ? 'விவசாயி' : 'Farmer'));

  return (
    <DashboardLayout title={title} userLabel={resolvedFarmerName} items={visibleNavItems} onLogout={handleLogout}>
      <Outlet />
    </DashboardLayout>
  );
}
