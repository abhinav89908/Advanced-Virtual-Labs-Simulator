import React from 'react';
import Simulator from './simulators/Simulator';
import './RoomPage.css';

const RoomPage = ({
  roomId,
  roomPassword,
  users,
  simulatorType,
  simulatorState,
  experimentData,
  showExperimentReport,
  setShowExperimentReport,
  getUserInitials,
  handleLeaveRoom,
  socket
}) => {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => alert('Copied to clipboard!'))
      .catch(err => console.error('Failed to copy:', err));
  };
  
  return (
    <div className="room-page">
      <div className="room-sidebar">
        <div className="room-info">
          <h2>Room Information</h2>
          <div className="info-item">
            <span className="info-label">Room ID:</span>
            <span className="info-value">{roomId}</span>
            <button 
              onClick={() => copyToClipboard(roomId)} 
              className="copy-button"
            >
              Copy
            </button>
          </div>
          
          {roomPassword && (
            <div className="info-item">
              <span className="info-label">Password:</span>
              <span className="info-value">{roomPassword}</span>
              <button 
                onClick={() => copyToClipboard(roomPassword)} 
                className="copy-button"
              >
                Copy
              </button>
            </div>
          )}
        </div>
        
        <div className="room-users">
          <h2>Participants ({users.length})</h2>
          <ul className="users-list">
            {users.map(user => (
              <li key={user.id} className="user-item">
                <div className="user-avatar">
                  {getUserInitials(user.username)}
                </div>
                <span className="user-name">{user.username}</span>
                {user.isHost && <span className="host-badge">Host</span>}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="room-actions">
          <button onClick={handleLeaveRoom} className="leave-room-button">
            Leave Room
          </button>
        </div>
      </div>
      
      <div className="room-content">
        <Simulator 
          type={simulatorType} 
          state={simulatorState}
          experimentData={experimentData}
          showExperimentReport={showExperimentReport}
          setShowExperimentReport={setShowExperimentReport}
          socket={socket}
          roomId={roomId}
        />
      </div>
    </div>
  );
};

export default RoomPage;
