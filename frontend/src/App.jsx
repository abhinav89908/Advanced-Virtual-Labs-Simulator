import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './components/hooks/userContext';

// Pages
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import RegistrationPage from './components/RegistrationPage';
import LabDashboard from './components/labs/LabDashboard';
import ExperimentPage from './components/labs/ExperimentPage';
import Room from './components/Room';
import AdminPortal from './components/admin/AdminPortal';
import GroupPage from './components/group/GroupPage';
import GroupManagement from './components/group/GroupManagement';
import GroupForm from './components/group/GroupForm';
import GroupDetail from './components/group/GroupDetail';
import UserProfile from './components/user/UserProfile'; // Import the new UserProfile component

// Simulators
import SimulatorTitration from './components/simulators/titration/SimulatorTitration';
import SimulatorOptics from './components/simulators/ray_optics/SimulatorOptics';
import Simulator8085 from './components/simulators/8085_microprocessor/Simulator8085';
import SimulatorOhmsLaw from './components/simulators/ohms_law/SimulatorOhmsLaw';
import SimulatorOS from './components/simulators/operating_system/SimulatorOS';
import SimulatorCN from './components/simulators/computer_networks/SimulatorCN';
import UserExperimentsDashboard from './components/experiments/MyExperiment';
import StudentsManagement from './components/admin/StudentManagement';
import GroupManagementAdmin from './components/admin/GroupManagement';
import ExperimentsAdmin from './components/admin/ExperimentManagement';

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/labs" element={<LabDashboard />} />
          <Route path="/experiment" element={<ExperimentPage />} />
          <Route path="/chat" element={<Room />} />
          <Route path="/groups" element={<GroupPage />} />
          <Route path="/groups/:groupId" element={<GroupDetail />} />
          <Route path="/createGroup" element={<GroupForm />} />
          <Route path="/my-experiments" element={<UserExperimentsDashboard />} />
          <Route path="/profile" element={<UserProfile />} /> {/* Add new route for user profile */}
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminPortal />} />
          <Route path="/admin/students" element={<StudentsManagement/>} />
          <Route path="/admin/groups" element={<GroupManagementAdmin />} />
          <Route path="/admin/groups/create" element={<GroupForm />} /> {/* Add route for admin to create group */}
          <Route path="/admin/groups/edit/:groupId" element={<GroupForm />} /> {/* Add route for admin to edit group */}
          <Route path="/admin/experiments" element={<ExperimentsAdmin/>} />
          
          {/* Simulator Routes */}
          <Route path="/simulator/titration" element={<SimulatorTitration />} />
          <Route path="/simulator/optics" element={<SimulatorOptics />} />
          <Route path="/simulator/8085" element={<Simulator8085 />} />
          <Route path="/simulator/ohms-law" element={<SimulatorOhmsLaw />} />
          <Route path="/simulator/process-scheduler" element={<SimulatorOS />} />
          <Route path='/simulator/network-sim' element={<SimulatorCN />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;