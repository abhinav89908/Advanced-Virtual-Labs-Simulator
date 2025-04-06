import React, { useState, useEffect, useRef } from 'react';
import { sendSimulatorAction } from '../../../socket';

// This is a simplified circuit simulator for demonstration
// A real implementation would use a canvas-based circuit editor or a library like circuitjs

const CircuitSimulator = ({ roomId, initialState = {} }) => {
  const [components, setComponents] = useState(initialState.components || []);
  const [connections, setConnections] = useState(initialState.connections || []);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [measurements, setMeasurements] = useState(initialState.measurements || []);
  const [running, setRunning] = useState(initialState.running || false);
  const canvasRef = useRef(null);

  // Initialize the simulator with some default components if empty
  useEffect(() => {
    if (components.length === 0) {
      const defaultComponents = [
        { id: '1', type: 'battery', value: 9, x: 100, y: 100 },
        { id: '2', type: 'resistor', value: 100, x: 300, y: 100 },
      ];
      
      setComponents(defaultComponents);
      sendSimulatorAction(roomId, 'set-components', { components: defaultComponents });
    }
  }, []);

  // Draw the circuit
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw connections
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    connections.forEach(conn => {
      const from = components.find(c => c.id === conn.from);
      const to = components.find(c => c.id === conn.to);
      if (from && to) {
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      }
    });
    
    // Draw components
    components.forEach(component => {
      ctx.fillStyle = component.id === selectedComponent?.id ? '#5bc0de' : '#333';
      ctx.beginPath();
      
      // Draw different shapes based on component type
      switch(component.type) {
        case 'battery':
          ctx.fillRect(component.x - 15, component.y - 30, 30, 60);
          ctx.fillStyle = '#fff';
          ctx.font = '16px Arial';
          ctx.fillText(`${component.value}V`, component.x - 10, component.y + 5);
          break;
        case 'resistor':
          ctx.rect(component.x - 40, component.y - 15, 80, 30);
          ctx.fillStyle = '#fff';
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#333';
          ctx.font = '12px Arial';
          ctx.fillText(`${component.value}Ω`, component.x - 15, component.y + 5);
          break;
        case 'capacitor':
          ctx.rect(component.x - 5, component.y - 25, 10, 50);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.font = '12px Arial';
          ctx.fillText(`${component.value}μF`, component.x + 10, component.y);
          break;
        default:
          ctx.arc(component.x, component.y, 20, 0, Math.PI * 2);
          ctx.fill();
      }
    });
    
  }, [components, connections, selectedComponent]);

  // Handle adding a new component
  const addComponent = (type) => {
    const newId = Date.now().toString();
    const newComponent = {
      id: newId,
      type,
      value: type === 'battery' ? 9 : type === 'resistor' ? 100 : 10,
      x: 200 + Math.random() * 100,
      y: 200 + Math.random() * 100
    };
    
    const updatedComponents = [...components, newComponent];
    setComponents(updatedComponents);
    setSelectedComponent(newComponent);
    
    sendSimulatorAction(roomId, 'add-component', { component: newComponent });
  };

  // Handle component selection
  const handleCanvasClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if we clicked on a component
    const clicked = components.find(comp => {
      const dx = comp.x - x;
      const dy = comp.y - y;
      return Math.sqrt(dx*dx + dy*dy) < 25; // 25px radius for clicking
    });
    
    setSelectedComponent(clicked || null);
  };

  // Handle component movement
  const handleMouseMove = (e) => {
    if (!selectedComponent) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Update component position
    const updatedComponents = components.map(comp => 
      comp.id === selectedComponent.id ? { ...comp, x, y } : comp
    );
    
    setComponents(updatedComponents);
    setSelectedComponent({ ...selectedComponent, x, y });
    
    sendSimulatorAction(roomId, 'move-component', { 
      componentId: selectedComponent.id, 
      x, y 
    });
  };

  // Handle component value change
  const handleComponentValueChange = (e) => {
    if (!selectedComponent) return;
    
    const value = parseFloat(e.target.value);
    
    // Update component value
    const updatedComponents = components.map(comp => 
      comp.id === selectedComponent.id ? { ...comp, value } : comp
    );
    
    setComponents(updatedComponents);
    setSelectedComponent({ ...selectedComponent, value });
    
    sendSimulatorAction(roomId, 'update-component-value', { 
      componentId: selectedComponent.id, 
      value 
    });
  };

  // Connect components
  const connectComponents = () => {
    if (!selectedComponent) return;
    
    // In a real implementation, you'd have a proper UI for selecting two components to connect
    // For simplicity, this just connects to the first other component
    const otherComponent = components.find(c => c.id !== selectedComponent.id);
    if (!otherComponent) return;
    
    const newConnection = {
      id: Date.now().toString(),
      from: selectedComponent.id,
      to: otherComponent.id
    };
    
    const updatedConnections = [...connections, newConnection];
    setConnections(updatedConnections);
    
    sendSimulatorAction(roomId, 'connect-components', { connection: newConnection });
  };

  // Simulate the circuit
  const runSimulation = () => {
    setRunning(true);
    
    // In a real implementation, this would execute actual circuit simulation
    // For demonstration, we'll just generate some sample measurements
    
    // Find battery voltage
    const battery = components.find(c => c.type === 'battery');
    const voltage = battery ? battery.value : 0;
    
    // Find total resistance (simplified series circuit)
    const resistors = components.filter(c => c.type === 'resistor');
    const totalResistance = resistors.reduce((sum, r) => sum + r.value, 0) || 1;
    
    // Calculate current (V = IR, so I = V/R)
    const current = voltage / totalResistance;
    
    // Generate measurements for each component
    const newMeasurements = components.map(component => {
      switch(component.type) {
        case 'battery':
          return { 
            componentId: component.id, 
            type: 'voltage', 
            value: component.value, 
            unit: 'V' 
          };
        case 'resistor':
          return { 
            componentId: component.id, 
            type: 'voltage_drop', 
            value: (current * component.value).toFixed(2), 
            unit: 'V' 
          };
        default:
          return null;
      }
    }).filter(Boolean);
    
    // Add overall circuit measurements
    newMeasurements.push({
      type: 'current',
      value: current.toFixed(3),
      unit: 'A'
    });
    
    setMeasurements(newMeasurements);
    
    sendSimulatorAction(roomId, 'simulation-results', { 
      measurements: newMeasurements 
    });
    
    // Auto-stop after a short delay in this demo
    setTimeout(() => setRunning(false), 2000);
  };

  return (
    <div className="circuit-simulator">
      <div className="simulator-header">
        <h3>Circuit Builder Simulator</h3>
        <p className="simulator-description">
          Build and analyze electric circuits by adding components and connecting them
        </p>
      </div>
      
      <div className="toolbar">
        <div className="component-toolbar">
          <button 
            onClick={() => addComponent('battery')}
            className="component-button battery-button"
          >
            <span className="component-icon">🔋</span>
            <span>Add Battery</span>
          </button>
          
          <button 
            onClick={() => addComponent('resistor')}
            className="component-button resistor-button"
          >
            <span className="component-icon">⚡</span>
            <span>Add Resistor</span>
          </button>
          
          <button 
            onClick={() => addComponent('capacitor')}
            className="component-button capacitor-button"
          >
            <span className="component-icon">⚡</span>
            <span>Add Capacitor</span>
          </button>
          
          <button 
            onClick={connectComponents} 
            disabled={!selectedComponent}
            className="component-button connect-button"
          >
            <span className="component-icon">🔗</span>
            <span>Connect Components</span>
          </button>
        </div>
        
        <div className="simulation-controls">
          <button 
            onClick={runSimulation} 
            disabled={running || components.length < 2}
            className="simulation-button"
          >
            {running ? '⏳ Simulating...' : '▶️ Run Simulation'}
          </button>
        </div>
      </div>
      
      <div className="simulator-content">
        <div className="canvas-container">
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            className="circuit-canvas"
          />
          <div className="canvas-instructions">
            <p>Click on a component to select it. Click and drag to move it.</p>
          </div>
        </div>
        
        <div className="simulator-sidebar">
          {selectedComponent && (
            <div className="component-properties">
              <h4>Selected Component</h4>
              <div className="property-type">
                <span className="property-label">Type:</span>
                <span className="property-value">{selectedComponent.type}</span>
              </div>
              
              <div className="property-value-control">
                <label>
                  <span className="property-label">Value:</span>
                  <div className="value-input-container">
                    <input 
                      type="number" 
                      value={selectedComponent.value}
                      onChange={handleComponentValueChange}
                      min={0}
                      step={selectedComponent.type === 'resistor' ? 10 : 0.1}
                      className="value-input"
                    />
                    <span className="unit">
                      {selectedComponent.type === 'battery' ? 'V' : 
                       selectedComponent.type === 'resistor' ? 'Ω' : 'μF'}
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}
          
          <div className="measurements-panel">
            <h4>Measurements</h4>
            {measurements.length > 0 ? (
              <div className="table-responsive">
                <table className="measurements-table">
                  <thead>
                    <tr>
                      <th>Measurement</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {measurements.map((m, i) => (
                      <tr key={i}>
                        <td>
                          {m.type === 'voltage' ? 'Battery Voltage' : 
                           m.type === 'voltage_drop' ? 'Voltage Drop' : 
                           m.type === 'current' ? 'Circuit Current' : m.type}
                        </td>
                        <td>{m.value} {m.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-measurements">
                <p>Run the simulation to see measurements</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircuitSimulator;
