import React from 'react';
import CircuitSimulator from './CircuitSimulator';
import PendulumSimulator from './PendulumSimulator';
import ChemistrySimulator from './ChemistrySimulator';
import GenericSimulator from './GenericSimulator';
import './Simulator.css';

const Simulator = ({ 
  type, 
  state, 
  experimentData,
  showExperimentReport,
  setShowExperimentReport,
  socket,
  roomId
}) => {
  // Render the appropriate simulator based on type
  const renderSimulator = () => {
    if (!type) {
      return (
        <div className="simulator-placeholder">
          <div className="placeholder-content">
            <h2>No simulator selected</h2>
            <p>Waiting for experiment to be initialized...</p>
          </div>
        </div>
      );
    }
    
    switch (type.toLowerCase()) {
      case 'circuit':
      case 'electronics':
        return (
          <CircuitSimulator 
            state={state} 
            experimentData={experimentData}
            showReport={showExperimentReport}
            setShowReport={setShowExperimentReport}
            socket={socket}
            roomId={roomId}
          />
        );
      case 'pendulum':
      case 'physics':
        return (
          <PendulumSimulator 
            state={state} 
            experimentData={experimentData}
            showReport={showExperimentReport}
            setShowReport={setShowExperimentReport}
            socket={socket}
            roomId={roomId}
          />
        );
      case 'chemistry':
      case 'titration':
        return (
          <ChemistrySimulator 
            state={state} 
            experimentData={experimentData}
            showReport={showExperimentReport}
            setShowReport={setShowExperimentReport}
            socket={socket}
            roomId={roomId}
          />
        );
      default:
        return (
          <GenericSimulator 
            type={type}
            state={state} 
            experimentData={experimentData}
            showReport={showExperimentReport}
            setShowReport={setShowExperimentReport}
            socket={socket}
            roomId={roomId}
          />
        );
    }
  };
  
  return (
    <div className="simulator-container">
      {renderSimulator()}
    </div>
  );
};

export default Simulator;
