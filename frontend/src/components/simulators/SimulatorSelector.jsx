import React, { useState, useEffect } from 'react';

const SimulatorSelector = ({ onSelect }) => {
  const [simulators, setSimulators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSimulators = async () => {
      try {
        // Use the full URL including the port
        const response = await fetch('http://localhost:5000/api/simulators');
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        setSimulators(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching simulators:', err);
        setError('Failed to load available simulators. Please try again.');
        
        // Always provide fallback simulators to ensure the app remains functional
        setSimulators([
          { 
            id: "pendulum", 
            name: "Simple Pendulum", 
            description: "Simulate a simple pendulum and measure its period",
            thumbnail: "/images/pendulum.png"  // Path relative to public directory
          },
          { 
            id: "circuit", 
            name: "Circuit Builder", 
            description: "Build and analyze electric circuits",
            thumbnail: "/images/circuit.png"  // Path relative to public directory
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSimulators();
  }, []);

  if (loading) {
    return <div className="simulator-loading">Loading available simulators...</div>;
  }

  return (
    <div className="simulator-selector">
      <div className="selector-header">
        <h2>Choose a Virtual Lab Simulator</h2>
        <p className="selector-description">
          Select a simulator to begin your collaborative experiment
        </p>
      </div>
      
      {error && (
        <div className="simulator-error">
          <div className="error-icon">⚠️</div>
          <div className="error-content">
            <p>{error}</p>
            <p className="error-subtext">Using default simulators instead.</p>
          </div>
        </div>
      )}
      
      <div className="simulators-grid">
        {simulators.map(simulator => (
          <div 
            key={simulator.id} 
            className="simulator-card"
            onClick={() => onSelect(simulator.id)}
          >
            <div className="simulator-thumbnail">
              <img 
                src={simulator.thumbnail || 'https://via.placeholder.com/150?text=Simulator'}
                alt={simulator.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/150?text=Simulator';
                }}
              />
            </div>
            <div className="simulator-info">
              <h3>{simulator.name}</h3>
              <p>{simulator.description}</p>
              <div className="simulator-card-footer">
                <button className="select-simulator-button">
                  Select & Begin
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimulatorSelector;
