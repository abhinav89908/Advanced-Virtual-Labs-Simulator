import React, { useState, useEffect } from 'react';
import socket, { joinRoom, leaveRoom, sendContentChange, checkRoom } from './socket';
import './App.css';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true); // Add connecting state
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [password, setPassword] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const [inRoom, setInRoom] = useState(false);
  const [content, setContent] = useState('');
  const [users, setUsers] = useState([]);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [authError, setAuthError] = useState(false);
  
  // Connect to socket
  useEffect(() => {
    // Check initial connection status
    setIsConnecting(true);
    setIsConnected(socket.connected);

    // Event handlers for connection
    const onConnect = () => {
      setIsConnected(true);
      setIsConnecting(false);
      console.log('Socket connected');
    };

    const onDisconnect = () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    };

    const onConnectError = (err) => {
      console.log('Connection error:', err);
      setIsConnecting(false);
      setIsConnected(false);
    }

    // Register event handlers
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    // If socket is already connected, update state immediately
    if (socket.connected) {
      setIsConnected(true);
      setIsConnecting(false);
    }

    // Handle room creation with generated password
    socket.on('room-created', ({ password }) => {
      setRoomPassword(password);
    });

    // Handle authentication failure
    socket.on('authentication-failed', () => {
      setAuthError(true);
      setTimeout(() => setAuthError(false), 3000); // Clear error after 3 seconds
    });

    // Handle user joining
    socket.on('user-joined', ({ user, users, content }) => {
      setUsers(users);
      if (content && !inRoom) {
        setContent(content);
      }
      if (user.id === socket.id) {
        setInRoom(true);
      }
    });

    // Handle user leaving
    socket.on('user-left', ({ users }) => {
      setUsers(users);
    });

    // Handle content updates from other users
    socket.on('content-updated', ({ content }) => {
      setContent(content);
    });

    // Set a timeout to ensure we don't show "connecting" state indefinitely
    const timeoutId = setTimeout(() => {
      setIsConnecting(false);
    }, 3000);

    return () => {
      // Clean up event handlers
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('room-created');
      socket.off('authentication-failed');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('content-updated');
      clearTimeout(timeoutId);
    };
  }, [inRoom]);

  // Check if room exists when roomId changes
  const handleRoomIdChange = async (e) => {
    const newRoomId = e.target.value;
    setRoomId(newRoomId);
    
    if (newRoomId.trim()) {
      const status = await checkRoom(newRoomId);
      setNeedsPassword(status.exists);
    } else {
      setNeedsPassword(false);
    }
  };

  // Handle joining a room
  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (roomId && username) {
      joinRoom(roomId, username, password);
      setAuthError(false);
    }
  };

  // Handle leaving a room
  const handleLeaveRoom = () => {
    leaveRoom(roomId);
    setInRoom(false);
    setContent('');
    setUsers([]);
    setPassword('');
    setRoomPassword('');
    setNeedsPassword(false);
  };

  // Handle editor content changes
  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    sendContentChange(roomId, newContent);
  };

  // Get user initials for avatar
  const getUserInitials = (name) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="app-container">
      <header>
        <h1 className="app-title">Virtual Lab Collaborative Room</h1>
        <div className="connection-status">
          {isConnecting ? (
            <>
              <span className="status-indicator connecting"></span>
              <span className="connecting">Connecting...</span>
            </>
          ) : isConnected ? (
            <>
              <span className="status-indicator"></span>
              <span className="connected">Connected</span>
            </>
          ) : (
            <>
              <span className="status-indicator"></span>
              <span className="disconnected">Disconnected</span>
            </>
          )}
        </div>
      </header>

      {!inRoom ? (
        <div className="join-room-container">
          <div className="join-room-card">
            <div className="join-room-header">
              <h2>Join a Collaborative Room</h2>
              <p>Connect with others in a shared virtual workspace</p>
            </div>
            <div className="join-room-body">
              <form onSubmit={handleJoinRoom}>
                <div className="form-group">
                  <label htmlFor="username">Your Name</label>
                  <input
                    type="text"
                    id="username"
                    className="form-control"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="roomId">Room ID</label>
                  <input
                    type="text"
                    id="roomId"
                    className="form-control"
                    value={roomId}
                    onChange={handleRoomIdChange}
                    placeholder="Enter a unique room identifier"
                    required
                  />
                  <small className="form-help">
                    {needsPassword 
                      ? "This room exists and requires a password to join" 
                      : "Enter a unique ID to create a new room or join an existing one"}
                  </small>
                </div>
                <div className="form-group">
                  <label htmlFor="password">
                    {needsPassword 
                      ? "Room Password" 
                      : "Create Room Password (optional)"}
                  </label>
                  <input
                    type="password"
                    id="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={needsPassword 
                      ? "Enter the room password" 
                      : "Create a password for your room (optional)"}
                    required={needsPassword}
                  />
                  {authError && (
                    <div className="error-message">
                      Incorrect password. Please try again.
                    </div>
                  )}
                </div>
                <button type="submit" className="btn btn-primary btn-lg btn-block">
                  {needsPassword ? "Join Room" : "Create/Join Room"}
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="room-container">
          <div className="room-sidebar">
            <div className="room-header">
              <h2>Room: <span className="room-id">{roomId}</span></h2>
              
              {roomPassword && (
                <div className="room-password">
                  <div className="password-label">
                    <span>Room Password</span>
                  </div>
                  <div className="password-value">{roomPassword}</div>
                  <p className="password-info">Share this password with others to join this room</p>
                </div>
              )}
            </div>
            
            <div className="users-section">
              <div className="users-title">
                <h3>Participants</h3>
                <span className="users-count">{users.length}</span>
              </div>
              <ul className="users-list">
                {users.map((user) => (
                  <li key={user.id} className="user-item">
                    <div className="user-avatar">
                      {getUserInitials(user.username)}
                    </div>
                    <div className="user-name">
                      {user.username}
                      {user.id === socket.id && <span className="user-you">you</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="room-actions">
              <button 
                onClick={handleLeaveRoom} 
                className="btn btn-danger leave-button">
                Leave Room
              </button>
            </div>
          </div>
          
          <div className="editor-container">
            <div className="editor-header">
              <div className="editor-title">
                <h3>Collaborative Editor</h3>
              </div>
            </div>
            <div className="editor-body">
              <textarea
                className="collaborative-editor"
                value={content}
                onChange={handleContentChange}
                placeholder="Start typing here. Changes will be visible to everyone in the room in real-time."
              ></textarea>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
