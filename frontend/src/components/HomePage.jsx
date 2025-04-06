import React from 'react';
import './HomePage.css';

const HomePage = ({ simulators, loading, onSelectSimulator }) => {
  const handleSimulatorSelect = (simulator) => {
    onSelectSimulator(simulator.id);
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="home-header">
          <h1>Virtual Lab Simulators</h1>
          <p>Loading experiments...</p>
        </div>
        <div className="simulators-loading">
          <div className="spinner"></div>
          <p>Loading available simulators...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Virtual Lab Simulators</h1>
        <p>Select an experiment to begin your collaborative session</p>
      </div>

      <div className="simulators-grid">
        {simulators.map((simulator) => (
          <div
            key={simulator.id}
            className="simulator-card"
            onClick={() => handleSimulatorSelect(simulator)}
          >
            <div className="simulator-card-image">
              <img
                src={simulator.thumbnail || `/images/default-simulator.png`}
                alt={simulator.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `/images/default-simulator.png`;
                }}
              />
            </div>
            <div className="simulator-card-content">
              <h2>{simulator.name}</h2>
              <p>{simulator.description}</p>
              <button className="start-button">Start Experiment</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
