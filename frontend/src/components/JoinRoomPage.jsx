import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './JoinRoomPage.css';

const JoinRoomPage = ({ simulators, simulatorId, onJoinRoom, onCancel }) => {
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [roomId, setRoomId] = useState('');
  const [password, setPassword] = useState('');
  const [action, setAction] = useState('create'); // 'create' or 'join'
  const [simulator, setSimulator] = useState(null);

  // Find selected simulator by ID
  useEffect(() => {
    if (simulatorId && simulators) {
      const selected = simulators.find(sim => sim.id === simulatorId);
      if (selected) {
        setSimulator(selected);
      }
    }
  }, [simulatorId, simulators]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Generate a room ID for 'create' option
    const finalRoomId = action === 'create' ? uuidv4().substring(0, 8) : roomId;
    
    // Store username in localStorage for persistence
    localStorage.setItem('username', username);
    
    // Navigate to the room with necessary data
    onJoinRoom(finalRoomId, {
      username,
      simulator,
      password,
      isCreator: action === 'create',
    });
  };

  if (!simulator) {
    return (
      <div className="join-room-container">
        <div className="join-room-card">
          <h2>Loading simulator information...</h2>
          <button onClick={onCancel} className="cancel-button">Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="join-room-container">
      <div className="join-room-card">
        <h2>{simulator.name}</h2>
        <p className="simulator-description">{simulator.description}</p>
        
        <div className="action-toggle">
          <button 
            className={`toggle-button ${action === 'create' ? 'active' : ''}`}
            onClick={() => setAction('create')}
          >
            Create Room
          </button>
          <button 
            className={`toggle-button ${action === 'join' ? 'active' : ''}`}
            onClick={() => setAction('join')}
          >
            Join Room
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="join-form">
          <div className="form-group">
            <label htmlFor="username">Your Name</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your name"
            />
          </div>
          
          {action === 'join' && (
            <div className="form-group">
              <label htmlFor="roomId">Room ID</label>
              <input
                type="text"
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                required
                placeholder="Enter room ID"
              />
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="password">Room Password (Optional)</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password (optional)"
            />
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="submit-button">
              {action === 'create' ? 'Create Room' : 'Join Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinRoomPage;
