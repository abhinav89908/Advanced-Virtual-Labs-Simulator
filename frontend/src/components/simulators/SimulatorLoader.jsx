import React, { lazy, Suspense, useState, useEffect } from 'react';
import { initializeSimulator } from '../../socket';
import socket from '../../socket';

// Lazy load simulator components
const PendulumSimulator = lazy(() => import('./pendulum/PendulumSimulator'));
// Fallback component in case import fails
const FallbackCircuitSimulator = () => (
  <div className="simulator-error-boundary">
    <h3>Circuit Simulator</h3>
    <p>The circuit simulator could not be loaded. Please try again later.</p>
    <p>This may happen if the component file is missing or has errors.</p>
  </div>
);

// Use error boundary for CircuitSimulator in case it fails to load
const CircuitSimulator = lazy(() => 
  import('./circuit/CircuitSimulator')
    .catch(() => ({ 
      default: FallbackCircuitSimulator 
    }))
);

const simulatorMap = {
  'pendulum': PendulumSimulator,
  'circuit': CircuitSimulator,
  // Add more simulators here as they are created
};

const SimulatorLoader = ({ roomId, simulatorType, initialState = {} }) => {
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    if (!simulatorType || isInitialized) return;
    
    try {
      // Initialize simulator in the room
      initializeSimulator(roomId, simulatorType, initialState);
      setIsInitialized(true);
      
      // Listen for simulator updates from socket and dispatch them as events
      const handleSimulatorUpdate = ({ action, data }) => {
        // Dispatch a custom event that simulator components can listen for
        window.dispatchEvent(
          new CustomEvent('simulator-update', { 
            detail: { action, data } 
          })
        );
      };
      
      socket.on('simulator-update', handleSimulatorUpdate);
      
      return () => {
        socket.off('simulator-update', handleSimulatorUpdate);
      };
    } catch (err) {
      console.error('Failed to initialize simulator:', err);
      setError('Failed to initialize the simulator. Please try refreshing the page.');
    }
  }, [roomId, simulatorType, isInitialized]);
  
  if (!simulatorType) {
    return <div className="simulator-message">Please select a simulator to begin.</div>;
  }
  
  if (error) {
    return (
      <div className="simulator-error">
        <p>{error}</p>
        <button onClick={() => setIsInitialized(false)}>
          Retry Initialization
        </button>
      </div>
    );
  }
  
  const SimulatorComponent = simulatorMap[simulatorType];
  
  if (!SimulatorComponent) {
    return <div className="simulator-error">Simulator not found: {simulatorType}</div>;
  }
  
  return (
    <Suspense fallback={<div className="simulator-loading">Loading simulator...</div>}>
      <SimulatorComponent 
        roomId={roomId} 
        initialState={initialState}
      />
    </Suspense>
  );
};

export default SimulatorLoader;
