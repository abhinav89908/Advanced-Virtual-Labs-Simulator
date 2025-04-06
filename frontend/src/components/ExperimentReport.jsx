import React, { useState } from 'react';
import { saveExperimentResults } from '../socket';

const ExperimentReport = ({ roomId, simulatorType, experimentData, onClose }) => {
  const [title, setTitle] = useState(`${simulatorType.charAt(0).toUpperCase() + simulatorType.slice(1)} Experiment Report`);
  const [conclusion, setConclusion] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [experimentId, setExperimentId] = useState(null);

  const handleSave = async () => {
    setSaving(true);
    try {
      const reportData = {
        title,
        simulatorType,
        data: experimentData,
        conclusion,
        date: new Date().toISOString()
      };
      
      const response = await saveExperimentResults(roomId, reportData);
      
      if (response.success) {
        setSaved(true);
        setExperimentId(response.experimentId);
      }
    } catch (error) {
      console.error("Error saving report:", error);
      alert("Failed to save the report. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const generateReportContent = () => {
    let content = '';
    
    switch (simulatorType) {
      case 'pendulum':
        content = renderPendulumReport();
        break;
      case 'circuit':
        content = renderCircuitReport();
        break;
      default:
        content = <p>No specific report format available for this experiment type.</p>;
    }
    
    return content;
  };
  
  const renderPendulumReport = () => {
    const measurements = experimentData.measurements || [];
    
    if (measurements.length === 0) {
      return <p>No measurements recorded in this experiment.</p>;
    }
    
    // Calculate theoretical period using T = 2π√(L/g)
    const calculateTheoreticalPeriod = (length, gravity) => {
      const lengthInMeters = length / 100; // convert cm to meters
      return 2 * Math.PI * Math.sqrt(lengthInMeters / gravity);
    };
    
    return (
      <>
        <div className="report-section">
          <h3>Measurements</h3>
          <table className="report-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Length (cm)</th>
                <th>Measured Period (s)</th>
                <th>Theoretical Period (s)</th>
                <th>Error (%)</th>
              </tr>
            </thead>
            <tbody>
              {measurements.map((m, i) => {
                const theoreticalPeriod = calculateTheoreticalPeriod(m.length, 9.81);
                const error = Math.abs((m.period - theoreticalPeriod) / theoreticalPeriod * 100);
                
                return (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{m.length}</td>
                    <td>{m.period.toFixed(3)}</td>
                    <td>{theoreticalPeriod.toFixed(3)}</td>
                    <td>{error.toFixed(2)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="report-section">
          <h3>Analysis</h3>
          <p>
            The relationship between pendulum length (L) and period (T) follows the equation:
            T = 2π√(L/g), where g is the acceleration due to gravity (9.81 m/s²).
          </p>
          <p>
            Average error in measurements: {
              (measurements.reduce((sum, m) => {
                const theoreticalPeriod = calculateTheoreticalPeriod(m.length, 9.81);
                const error = Math.abs((m.period - theoreticalPeriod) / theoreticalPeriod * 100);
                return sum + error;
              }, 0) / measurements.length).toFixed(2)
            }%
          </p>
        </div>
      </>
    );
  };
  
  const renderCircuitReport = () => {
    const measurements = experimentData.measurements || [];
    
    if (measurements.length === 0) {
      return <p>No measurements recorded in this experiment.</p>;
    }
    
    const currentMeasurement = measurements.find(m => m.type === 'current');
    const voltageMeasurements = measurements.filter(m => m.type === 'voltage' || m.type === 'voltage_drop');
    
    return (
      <>
        <div className="report-section">
          <h3>Circuit Measurements</h3>
          
          {currentMeasurement && (
            <div className="measurement-result">
              <strong>Total Current:</strong> {currentMeasurement.value} {currentMeasurement.unit}
            </div>
          )}
          
          <h4>Voltage Measurements:</h4>
          <table className="report-table">
            <thead>
              <tr>
                <th>Component</th>
                <th>Measurement</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {voltageMeasurements.map((m, i) => (
                <tr key={i}>
                  <td>{m.componentId ? `Component ${m.componentId}` : 'Circuit'}</td>
                  <td>{m.type === 'voltage' ? 'Source Voltage' : 'Voltage Drop'}</td>
                  <td>{m.value} {m.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="report-section">
          <h3>Analysis</h3>
          <p>
            According to Ohm's Law, V = IR, where V is voltage, I is current, and R is resistance.
          </p>
          <p>
            The measurements confirm that the total voltage is distributed across the components
            according to their resistance values.
          </p>
        </div>
      </>
    );
  };

  return (
    <div className="experiment-report">
      <div className="report-header">
        <div className="report-title-input">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Report Title"
            className="report-title-field"
          />
        </div>
        <div className="report-date">
          {new Date().toLocaleDateString()}
        </div>
      </div>
      
      <div className="report-content">
        {generateReportContent()}
        
        <div className="report-section">
          <h3>Conclusion</h3>
          <textarea
            value={conclusion}
            onChange={(e) => setConclusion(e.target.value)}
            placeholder="Enter your conclusions about the experiment..."
            rows={4}
            className="conclusion-textarea"
          />
        </div>
      </div>
      
      <div className="report-actions">
        {saved ? (
          <div className="report-success">
            <p>Report saved successfully! ID: {experimentId}</p>
            <button onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="save-report-btn"
            >
              {saving ? "Saving..." : "Save Report"}
            </button>
            <button 
              onClick={onClose}
              className="cancel-btn"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ExperimentReport;
