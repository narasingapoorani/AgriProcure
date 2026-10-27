import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';

import FarmerLogin from './pages/farmer/FarmerLogin';
import FarmerRegister from './pages/farmer/FarmerRegister';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import FarmerHome from './pages/farmer/FarmerHome';
import AddCrop from './pages/farmer/AddCrop';
import RecommendedCenters from './pages/farmer/RecommendedCenters';
import SlotConfirmation from './pages/farmer/SlotConfirmation';
import LiveQueue from './pages/farmer/LiveQueue';
import ProcurementTimeline from './pages/farmer/ProcurementTimeline';
import FarmerPayments from './pages/farmer/FarmerPayments';
import FarmerNotifications from './pages/farmer/FarmerNotifications';
import FarmerProfile from './pages/farmer/FarmerProfile';
import CustomerSupport from './pages/farmer/CustomerSupport';

import OfficerLogin from './pages/officer/OfficerLogin';
import OfficerRegister from './pages/officer/OfficerRegister';
import OfficerDashboard from './pages/officer/OfficerDashboard';
import OfficerHome from './pages/officer/OfficerHome';
import CenterManagement from './pages/officer/CenterManagement';
import DemandForecast from './pages/officer/DemandForecast';
import OverloadRisk from './pages/officer/OverloadRisk';
import FarmerAllocation from './pages/officer/FarmerAllocation';
import DigitalTwin from './pages/officer/DigitalTwin';
import OfficerPayments from './pages/officer/OfficerPayments';
import OfficerNotifications from './pages/officer/OfficerNotifications';
import OfficerProfile from './pages/officer/OfficerProfile';
import ReceivedQueries from './pages/officer/ReceivedQueries';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/farmer-login" element={<FarmerLogin />} />
      <Route path="/farmer-register" element={<FarmerRegister />} />
      <Route path="/farmer-dashboard" element={<FarmerDashboard />}>
        <Route index element={<FarmerHome />} />
        <Route path="add-crop" element={<AddCrop />} />
        <Route path="recommended-centers" element={<RecommendedCenters />} />
        <Route path="slot" element={<SlotConfirmation />} />
        <Route path="live-queue" element={<LiveQueue />} />
        <Route path="timeline" element={<ProcurementTimeline />} />
        <Route path="payments" element={<FarmerPayments />} />
        <Route path="notifications" element={<FarmerNotifications />} />
        <Route path="profile" element={<FarmerProfile />} />
        <Route path="support" element={<CustomerSupport />} />
      </Route>

      <Route path="/officer-login" element={<OfficerLogin />} />
      <Route path="/officer-register" element={<OfficerRegister />} />
      <Route path="/officer-dashboard" element={<OfficerDashboard />}>
        <Route index element={<OfficerHome />} />
        <Route path="centers" element={<CenterManagement />} />
        <Route path="demand-forecast" element={<DemandForecast />} />
        <Route path="overload-risk" element={<OverloadRisk />} />
        <Route path="farmer-allocation" element={<FarmerAllocation />} />
        <Route path="digital-twin" element={<DigitalTwin />} />
        <Route path="payments" element={<OfficerPayments />} />
        <Route path="queries" element={<ReceivedQueries />} />
        <Route path="notifications" element={<OfficerNotifications />} />
        <Route path="profile" element={<OfficerProfile />} />
      </Route>

      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}
