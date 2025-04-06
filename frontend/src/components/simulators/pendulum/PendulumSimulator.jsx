import React, { useState, useEffect, useRef } from 'react';
import { sendSimulatorAction, shareMousePosition } from '../../../socket';
import './PendulumSimulator.css';

const PendulumSimulator = ({ roomId, initialState = {} }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null); // Add this line to define containerRef
  const [cursorPositions, setCursorPositions] = useState({}); // Add state for cursor positions
  const isMouseDownRef = useRef(false);
  
  const [pendulumState, setPendulumState] = useState({
    length: initialState.length || 100, // pendulum length (pixels)
    angle: initialState.angle || Math.PI / 4, // initial angle
    angleVelocity: initialState.angleVelocity || 0,
    gravity: initialState.gravity || 9.81,
    damping: initialState.damping || 0.995, // damping factor
    isRunning: initialState.isRunning || false,
    measurements: initialState.measurements || []
  });
  
  const [time, setTime] = useState(0);
  const [measureStartTime, setMeasureStartTime] = useState(null);
  const animationRef = useRef(null);
  const lastUpdateTimestampRef = useRef(0);
  const pendulumLengthRef = useRef(pendulumState.length);
  const pendulumGravityRef = useRef(pendulumState.gravity);
  const externalUpdateRef = useRef(false);

  // Use refs to keep track of current pendulum state for animation
  const stateRef = useRef({
    angle: pendulumState.angle,
    angleVelocity: pendulumState.angleVelocity
  });

  // Effect to sync refs with state
  useEffect(() => {
    stateRef.current = {
      angle: pendulumState.angle,
      angleVelocity: pendulumState.angleVelocity
    };
    pendulumLengthRef.current = pendulumState.length;
    pendulumGravityRef.current = pendulumState.gravity;
  }, [pendulumState.angle, pendulumState.angleVelocity, pendulumState.length, pendulumState.gravity]);
  
  // Initialize canvas and handle window resizing
  useEffect(() => {
    renderPendulum();
    
    const handleResize = () => {
      renderPendulum();
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Effect to handle animation
  useEffect(() => {
    if (!pendulumState.isRunning) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }
    
    let lastTime = performance.now();
    const animateFrame = (timestamp) => {
      if (!pendulumState.isRunning) return;
      
      const deltaTime = Math.min((timestamp - lastTime) / 1000, 0.05); // time in seconds, capped at 50ms
      lastTime = timestamp;
      
      // Update physics
      updatePendulumPhysics(deltaTime);
      
      // Schedule next frame
      animationRef.current = requestAnimationFrame(animateFrame);
    };
    
    animationRef.current = requestAnimationFrame(animateFrame);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [pendulumState.isRunning]);
  
  // Effect to sync pendulum visual state on canvas
  useEffect(() => {
    renderPendulum();
  }, [pendulumState.angle, pendulumState.length]);

  // Update physics of pendulum
  const updatePendulumPhysics = (deltaTime) => {
    const now = performance.now();
    const sinceLastUpdate = now - lastUpdateTimestampRef.current;
    
    // Simple physics for the pendulum - use proper scale factors
    const g = pendulumGravityRef.current * 0.05; // Scale gravity to work better visually
    const L = pendulumLengthRef.current / 25; // Scale length for better physics
    const angleAccel = -g / L * Math.sin(stateRef.current.angle);
    
    // Update angular velocity and angle
    const newAngleVelocity = (stateRef.current.angleVelocity + angleAccel * deltaTime) * pendulumState.damping;
    const newAngle = stateRef.current.angle + newAngleVelocity * deltaTime;
    
    // Update local reference immediately for smooth animation
    stateRef.current.angleVelocity = newAngleVelocity;
    stateRef.current.angle = newAngle;
    
    // Render immediately for fluid motion
    renderPendulum();
    
    // Update time for measuring period
    setTime(prevTime => prevTime + deltaTime);
    
    // Only broadcast to other users at a controlled rate
    if (sinceLastUpdate > 50 && !externalUpdateRef.current) { // Every 50ms = 20fps
      lastUpdateTimestampRef.current = now;
      
      // Broadcast the state change to all users in the room
      sendSimulatorAction(roomId, 'update-pendulum', {
        angle: newAngle,
        angleVelocity: newAngleVelocity,
        timestamp: now
      });
      
      // Update React state occasionally (for UI consistency but not on every frame)
      setPendulumState(prev => ({
        ...prev,
        angle: newAngle,
        angleVelocity: newAngleVelocity
      }));
    }
  };
  
  // Render the pendulum to the canvas
  const renderPendulum = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Calculate pivot and bob positions
    const centerX = width / 2;
    const centerY = height / 4; // Pivot point at 1/4th from the top
    
    // Calculate current angle - use the ref for smooth animation
    const currentAngle = stateRef.current.angle;
    const currentLength = pendulumLengthRef.current;
    
    // Draw background elements
    drawBackground(ctx, width, height);
    
    // Draw pivot point
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#555';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Calculate pendulum bob position
    const bobX = centerX + Math.sin(currentAngle) * currentLength;
    const bobY = centerY + Math.cos(currentAngle) * currentLength;
    
    // Draw pendulum string
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(bobX, bobY);
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Draw pendulum bob
    const bobRadius = 20;
    const gradient = ctx.createRadialGradient(
      bobX, bobY, 0,
      bobX, bobY, bobRadius
    );
    gradient.addColorStop(0, '#ff6b6b');
    gradient.addColorStop(0.8, '#e74c3c');
    gradient.addColorStop(1, '#c0392b');
    
    ctx.beginPath();
    ctx.arc(bobX, bobY, bobRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Add shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.stroke();
    ctx.shadowColor = 'transparent';
    
    // Draw time if measuring
    if (measureStartTime !== null) {
      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = '#333';
      ctx.fillText(`Time: ${(time - measureStartTime).toFixed(2)}s`, 20, height - 20);
    }
    
    // Draw length indicator
    drawLengthIndicator(ctx, centerX, centerY, bobX, bobY, currentLength);
  };

  // Draw background with grid lines
  const drawBackground = (ctx, width, height) => {
    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    
    // Vertical grid lines
    for (let x = 0; x < width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Horizontal grid lines
    for (let y = 0; y < height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };
  
  // Draw length indicator
  const drawLengthIndicator = (ctx, pivotX, pivotY, bobX, bobY, length) => {
    const textY = pivotY + (bobY - pivotY) / 2;
    const textX = pivotX + (bobX - pivotX) / 2 + 10;
    
    ctx.font = '14px Arial';
    ctx.fillStyle = '#555';
    ctx.fillText(`${length} cm`, textX, textY);
  };
  
  // Handle start/stop simulation with improved synchronization
  const toggleSimulation = () => {
    const newIsRunning = !pendulumState.isRunning;
    
    // Update local state immediately for responsive UI
    setPendulumState(prev => ({
      ...prev,
      isRunning: newIsRunning
    }));
    
    // Broadcast action to room
    sendSimulatorAction(roomId, 'toggle-simulation', { isRunning: newIsRunning });
  };
  
  // Handle length change
  const handleLengthChange = (e) => {
    const newLength = parseInt(e.target.value, 10);
    
    // Update immediately for local rendering
    pendulumLengthRef.current = newLength;
    renderPendulum();
    
    setPendulumState(prev => {
      const updatedState = { ...prev, length: newLength };
      sendSimulatorAction(roomId, 'change-length', { length: newLength });
      return updatedState;
    });
  };
  
  // Handle gravity change
  const handleGravityChange = (e) => {
    const newGravity = parseFloat(e.target.value);
    
    // Update immediately for local calculations
    pendulumGravityRef.current = newGravity;
    
    setPendulumState(prev => {
      const updatedState = { ...prev, gravity: newGravity };
      sendSimulatorAction(roomId, 'change-gravity', { gravity: newGravity });
      return updatedState;
    });
  };
  
  // Start measuring period
  const startMeasurement = () => {
    setMeasureStartTime(time);
    sendSimulatorAction(roomId, 'start-measurement', { startTime: time });
  };
  
  // Stop measuring and record period
  const stopMeasurement = () => {
    if (measureStartTime === null) return;
    
    const period = time - measureStartTime;
    setPendulumState(prev => {
      const newMeasurements = [...prev.measurements, { 
        length: prev.length, 
        period, 
        timestamp: new Date().toISOString() 
      }];
      
      sendSimulatorAction(roomId, 'record-measurement', { 
        measurements: newMeasurements,
        currentMeasurement: { length: prev.length, period }
      });
      
      return { ...prev, measurements: newMeasurements };
    });
    
    setMeasureStartTime(null);
  };
  
  // Reset pendulum
  const resetPendulum = () => {
    const initialAngle = Math.PI / 4;
    
    // Update immediately for local rendering
    stateRef.current.angle = initialAngle;
    stateRef.current.angleVelocity = 0;
    renderPendulum();
    
    setPendulumState(prev => {
      const updatedState = {
        ...prev,
        angle: initialAngle,
        angleVelocity: 0,
        isRunning: false
      };
      
      sendSimulatorAction(roomId, 'reset-pendulum', {
        angle: initialAngle,
        angleVelocity: 0
      });
      
      return updatedState;
    });
    
    setTime(0);
    setMeasureStartTime(null);
  };

  // Effect to listen to socket updates - improved for perfect sync
  useEffect(() => {
    const handleUpdate = (e) => {
      if (!e.detail || !e.detail.action || !e.detail.data) return;
      
      const { action, data } = e.detail;
      
      // Flag that this is an external update to avoid echo
      externalUpdateRef.current = true;
      
      switch (action) {
        case 'update-pendulum':
          if (data.angle !== undefined && data.angleVelocity !== undefined) {
            // Update ref immediately for smooth animation
            stateRef.current.angle = data.angle;
            stateRef.current.angleVelocity = data.angleVelocity;
            
            // Render immediately 
            renderPendulum();
            
            // Update state (less frequently)
            setPendulumState(prev => ({
              ...prev,
              angle: data.angle,
              angleVelocity: data.angleVelocity
            }));
          }
          break;
          
        case 'change-length':
          if (data.length !== undefined) {
            pendulumLengthRef.current = data.length;
            setPendulumState(prev => ({
              ...prev,
              length: data.length
            }));
            renderPendulum();
          }
          break;
          
        case 'change-gravity':
          if (data.gravity !== undefined) {
            pendulumGravityRef.current = data.gravity;
            setPendulumState(prev => ({
              ...prev,
              gravity: data.gravity
            }));
          }
          break;
          
        case 'toggle-simulation':
          if (data.isRunning !== undefined) {
            setPendulumState(prev => ({
              ...prev,
              isRunning: data.isRunning
            }));
          }
          break;
          
        case 'reset-pendulum':
          if (data.angle !== undefined) {
            stateRef.current.angle = data.angle;
            stateRef.current.angleVelocity = 0;
            setPendulumState(prev => ({
              ...prev,
              angle: data.angle,
              angleVelocity: 0,
              isRunning: false
            }));
            setTime(0);
            setMeasureStartTime(null);
            renderPendulum();
          }
          break;
          
        case 'start-measurement':
          if (data.startTime !== undefined) {
            setMeasureStartTime(data.startTime);
          }
          break;
          
        case 'record-measurement':
          if (data.measurements) {
            setPendulumState(prev => ({
              ...prev,
              measurements: data.measurements
            }));
            setMeasureStartTime(null);
          }
          break;
      }
      
      // Reset the flag after a short delay
      setTimeout(() => {
        externalUpdateRef.current = false;
      }, 50);
    };
    
    // Add this event listener to the global scope for simulator updates
    window.addEventListener('simulator-update', handleUpdate);
    
    // Add event listener for mouse movement from other users
    const handleUserMouseMove = (data) => {
      setCursorPositions(prevPositions => ({
        ...prevPositions,
        [data.userId]: {
          x: data.x,
          y: data.y,
          username: data.username,
          isClicking: data.isClicking,
          lastUpdate: Date.now()
        }
      }));
    };
    
    window.addEventListener('user-mouse-move', (e) => {
      if (e.detail) handleUserMouseMove(e.detail);
    });

    return () => {
      window.removeEventListener('simulator-update', handleUpdate);
      window.removeEventListener('user-mouse-move', handleUserMouseMove);
    };
  }, []);
  
  // Handle mouse movement in the simulator container
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    
    // Get relative position within the container
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100; // percentage
    const y = ((e.clientY - rect.top) / rect.height) * 100; // percentage
    
    // Send to server
    shareMousePosition(roomId, x, y, isMouseDownRef.current);
  };
  
  const handleMouseDown = () => {
    isMouseDownRef.current = true;
  };
  
  const handleMouseUp = () => {
    isMouseDownRef.current = false;
  };
  
  // Clear cursors for users that haven't moved in a while
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setCursorPositions(prevPositions => {
        const newPositions = {...prevPositions};
        Object.keys(newPositions).forEach(userId => {
          if (newPositions[userId].lastUpdate && now - newPositions[userId].lastUpdate > 5000) {
            delete newPositions[userId];
          }
        });
        return newPositions;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Render other users' cursors
  const renderCursors = () => {
    return Object.entries(cursorPositions).map(([userId, data]) => (
      <div 
        key={userId}
        className={`user-cursor ${data.isClicking ? 'clicking' : ''}`}
        style={{
          left: `${data.x}%`,
          top: `${data.y}%`,
        }}
      >
        <div className="cursor-pointer"></div>
        <span className="cursor-username">{data.username}</span>
      </div>
    ));
  };

  return (
    <div className="pendulum-simulator">
      <div 
        className="simulator-canvas-container"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <canvas 
          ref={canvasRef} 
          width={600} 
          height={500}
          className="simulator-canvas"
        />
        {/* Render other users' cursors */}
        {renderCursors()}
      </div>
      
      <div className="simulator-controls">
        <h3 className="control-section-title">Pendulum Parameters</h3>
        
        <div className="control-group">
          <label>
            <span className="control-label">Length (cm):</span>
            <div className="slider-container">
              <input 
                type="range" 
                min={50} 
                max={200} 
                value={pendulumState.length} 
                onChange={handleLengthChange}
                disabled={pendulumState.isRunning}
                className="slider"
              />
              <span className="slider-value">{pendulumState.length}</span>
            </div>
          </label>
        </div>
        
        <div className="control-group">
          <label>
            <span className="control-label">Gravity (m/s²):</span>
            <div className="slider-container">
              <input 
                type="range" 
                min={1} 
                max={20} 
                step={0.1}
                value={pendulumState.gravity} 
                onChange={handleGravityChange}
                disabled={pendulumState.isRunning}
                className="slider"
              />
              <span className="slider-value">{pendulumState.gravity.toFixed(1)}</span>
            </div>
          </label>
        </div>
        
        <h3 className="control-section-title">Simulation Controls</h3>
        
        <div className="actions-group">
          <button 
            onClick={toggleSimulation}
            className={`action-button ${pendulumState.isRunning ? 'stop' : 'start'}`}
          >
            {pendulumState.isRunning ? "Stop" : "Start"} Simulation
          </button>
          
          <button 
            onClick={resetPendulum} 
            disabled={pendulumState.isRunning}
            className="action-button reset"
          >
            Reset
          </button>
          
          {!measureStartTime ? (
            <button 
              onClick={startMeasurement} 
              disabled={!pendulumState.isRunning}
              className="action-button measure"
            >
              Start Measuring Period
            </button>
          ) : (
            <button 
              onClick={stopMeasurement}
              className="action-button measure-stop"
            >
              Stop Measuring
            </button>
          )}
        </div>
      </div>
      
      <div className="measurements-section">
        <h3 className="section-title">Measurements</h3>
        {pendulumState.measurements.length > 0 ? (
          <div className="table-responsive">
            <table className="measurements-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Length (cm)</th>
                  <th>Period (s)</th>
                </tr>
              </thead>
              <tbody>
                {pendulumState.measurements.map((m, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{m.length}</td>
                    <td>{m.period.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-measurements">
            <p>No measurements recorded yet.</p>
            <p className="hint">Start the simulation and click "Start Measuring Period" to record data.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendulumSimulator;
