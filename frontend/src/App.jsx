import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './components/hooks/userContext';

// Pages
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import RegistrationPage from './components/RegistrationPage';
import LabDashboard from './components/labs/LabDashboard';
import ExperimentPage from './components/labs/ExperimentPage';
import Room from './components/Room';
import GroupPage from './components/group/GroupPage';
import GroupManagement from './components/group/GroupManagement';
import GroupForm from './components/group/GroupForm';
import GroupDetail from './components/group/GroupDetail';
import UserProfile from './components/user/UserProfile';

// Simulators
import SimulatorTitration from './components/simulators/titration/SimulatorTitration';
import SimulatorOptics from './components/simulators/ray_optics/SimulatorOptics';
import Simulator8085 from './components/simulators/8085_microprocessor/Simulator8085';
import SimulatorOhmsLaw from './components/simulators/ohms_law/SimulatorOhmsLaw';
import SimulatorOS from './components/simulators/operating_system/SimulatorOS';
import SimulatorCN from './components/simulators/computer_networks/SimulatorCN';
import UserExperimentsDashboard from './components/experiments/MyExperiment';

// Admin Components
import AdminPortal from './components/admin/AdminPortal';
import AdminDashboard from './components/admin/AdminDashboard';
import StudentManagement from './components/admin/StudentManagement';
import GroupManagementAdmin from './components/admin/GroupManagement';
import ResultsManagement from './components/admin/ResultsManagement';
import TestManagement from './components/admin/TestManagement';

// Test Components
import TestList from './components/tests/TestList';
import TakeTest from './components/tests/TakeTest';
import TestResult from './components/tests/TestResult';

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/labs" element={<LabDashboard />} />
  
          <Route path="/chat" element={<Room />} />
          <Route path="/groups" element={<GroupPage />} />
          <Route path="/groups/:groupId" element={<GroupDetail />} />
          <Route path="/createGroup" element={<GroupForm />} />
          <Route path="/my-experiments" element={<UserExperimentsDashboard />} />
          <Route path="/profile" element={<UserProfile />} />
          
          {/* Test Routes */}
          <Route path="/tests" element={<TestList />} />
          <Route path="/tests/take/:testId" element={<TakeTest />} />
          <Route path="/tests/result/:resultId" element={<TestResult />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminPortal />}>
            <Route index element={<AdminDashboard />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="groups" element={<GroupManagementAdmin />} />
            <Route path="tests" element={<TestManagement />} />
            <Route path="results" element={<ResultsManagement />} />
          </Route>
          
          <Route path="/admin/groups/create" element={<GroupForm />} />
          <Route path="/admin/groups/edit/:groupId" element={<GroupForm />} />
          
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