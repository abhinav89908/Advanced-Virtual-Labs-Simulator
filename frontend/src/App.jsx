import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import LabDashboard from './components/labs/LabDashboard';
import ExperimentPage from './components/labs/ExperimentPage';
import { UserProvider } from './components/hooks/userContext';
import Room from './components/Room';
import Simulator8085 from './components/simulators/8085_microprocessor/Simulator8085';
import SimulatorOptics from './components/simulators/ray_optics/SimulatorOptics';

function App() {
  return (
    <UserProvider>
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/labs" element={<LabDashboard />} />
        <Route path="/experiment" element={<ExperimentPage/>} />
        <Route path="/chat" element={<Room />} />
        <Route path="/simulator/8085" element={<Simulator8085 />} />
        <Route path="/simulator/optics" element={<SimulatorOptics />} />
      </Routes>
    </Router>
    </UserProvider>
  );
}

export default App;