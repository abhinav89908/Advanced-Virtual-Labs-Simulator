import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import LabDashboard from './components/labs/LabDashboard';
import ExperimentPage from './components/labs/ExperimentPage';
import Room from './components/Room'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/labs" element={<LabDashboard />} />
        <Route path="/experiment" element={<ExperimentPage/>} />
        <Route path="/chat" element={<Room />} /> 
      </Routes>
    </Router>
  );
}

export default App;