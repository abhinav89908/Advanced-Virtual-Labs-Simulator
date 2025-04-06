import React, { useState, useEffect } from 'react';
import socket, { joinRoom, leaveRoom, sendContentChange, checkRoom, initializeSimulator } from './socket';
import HomePage from './components/HomePage';
import JoinRoomPage from './components/JoinRoomPage';
import RoomPage from './components/RoomPage';
import ChatBox from './components/ChatBox';
import Header from './components/Header';
import './App.css';

// Main App component - manages global state and pages
function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [availableSimulators, setAvailableSimulators] = useState([]);
  const [loadingSimulators, setLoadingSimulators] = useState(true);
  
  // State for navigation
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedSimulatorId, setSelectedSimulatorId] = useState(null);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [roomData, setRoomData] = useState(null);

  // Socket connection setup
  useEffect(() => {
    setIsConnecting(true);
    setIsConnected(socket.connected);

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
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    if (socket.connected) {
      setIsConnected(true);
      setIsConnecting(false);
    }

    // Fetch simulators on app load
    fetchAvailableSimulators();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
    };
  }, []);

  // Fetch available simulators
  const fetchAvailableSimulators = async () => {
    setLoadingSimulators(true);
    try {
      const response = await fetch('http://localhost:5000/api/simulators');
      if (response.ok) {
        const data = await response.json();
        setAvailableSimulators(data);
      } else {
        throw new Error('Failed to fetch simulators');
      }
    } catch (error) {
      console.error('Error loading simulators:', error);
      setAvailableSimulators([]);
    } finally {
      setLoadingSimulators(false);
    }
  };

  // Navigation functions
  const navigateToJoin = (simulatorId) => {
    setSelectedSimulatorId(simulatorId);
    setCurrentPage('join');
  };

  const navigateToRoom = (roomId, userData) => {
    setActiveRoomId(roomId);
    setRoomData(userData);
    setCurrentPage('room');
  };

  const navigateToHome = () => {
    setCurrentPage('home');
    setSelectedSimulatorId(null);
    setActiveRoomId(null);
    setRoomData(null);
  };

  // Render the appropriate component based on currentPage state
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'join':
        return (
          <JoinRoomPage 
            simulators={availableSimulators} 
            simulatorId={selectedSimulatorId}
            onJoinRoom={navigateToRoom}
            onCancel={navigateToHome}
          />
        );
      case 'room':
        return (
          <RoomContainer 
            roomId={activeRoomId}
            userData={roomData}
            simulators={availableSimulators}
            onLeaveRoom={navigateToHome}
          />
        );
      case 'home':
      default:
        return (
          <HomePage 
            simulators={availableSimulators} 
            loading={loadingSimulators}
            onSelectSimulator={navigateToJoin}
          />
        );
    }
  };

  return (
    <div className="app-container">
      <Header 
        isConnected={isConnected} 
        isConnecting={isConnecting}
        navigateToHome={navigateToHome} 
      />
      
      <main>
        {renderCurrentPage()}
      </main>
    </div>
  );
}

// This container component manages room-specific state
function RoomContainer({ roomId, userData, simulators, onLeaveRoom }) {
  const [inRoom, setInRoom] = useState(false);
  const [users, setUsers] = useState([]);
  const [roomPassword, setRoomPassword] = useState('');
  const [selectedSimulator, setSelectedSimulator] = useState(null);
  const [simulatorState, setSimulatorState] = useState({});
  const [experimentData, setExperimentData] = useState({});
  const [showExperimentReport, setShowExperimentReport] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Join room on component mount using userData
  useEffect(() => {
    if (userData) {
      const { username, simulator, password } = userData;
      
      if (username && roomId) {
        // Automatically join the room using the password from userData
        joinRoom(roomId, username, password || '');
        localStorage.setItem('username', username);
      } else {
        // If missing data, go back to home
        onLeaveRoom();
      }
      
      if (simulator) {
        setSelectedSimulator(simulator);
      }
    } else {
      // If no userData, go back to home
      onLeaveRoom();
    }
  }, [userData, roomId, onLeaveRoom]);

  // Socket event handlers
  useEffect(() => {
    const onRoomCreated = ({ password }) => {
      setRoomPassword(password);
    };

    const onUserJoined = ({ user, users, simulator, simulatorState }) => {
      setUsers(users);
      if (user.id === socket.id) {
        setInRoom(true);
      }
      if (simulator) {
        setSelectedSimulator(simulator);
        setSimulatorState(simulatorState || {});
      }
    };

    const onUserLeft = ({ users }) => {
      setUsers(users);
    };

    const onContentUpdated = ({ content, username }) => {
      if (username && content) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: content, sender: username, time: new Date() },
        ]);
      }
    };

    const onSimulatorInitialized = ({ simulatorType, state }) => {
      setSelectedSimulator(simulatorType);
      setSimulatorState(state || {});
    };

    const onSimulatorUpdate = ({ action, data }) => {
      if (data && typeof data === 'object') {
        setSimulatorState((prev) => ({ ...prev, ...data }));

        if (action === 'record-measurement' || action === 'simulation-results') {
          setExperimentData((prev) => ({
            ...prev,
            measurements: data.measurements || data,
          }));
        }
      }
    };

    socket.on('room-created', onRoomCreated);
    socket.on('user-joined', onUserJoined);
    socket.on('user-left', onUserLeft);
    socket.on('content-updated', onContentUpdated);
    socket.on('simulator-initialized', onSimulatorInitialized);
    socket.on('simulator-update', onSimulatorUpdate);

    return () => {
      socket.off('room-created', onRoomCreated);
      socket.off('user-joined', onUserJoined);
      socket.off('user-left', onUserLeft);
      socket.off('content-updated', onContentUpdated);
      socket.off('simulator-initialized', onSimulatorInitialized);
      socket.off('simulator-update', onSimulatorUpdate);
    };
  }, []);

  const handleLeaveRoom = () => {
    leaveRoom(roomId);
    setInRoom(false);
    setUsers([]);
    setRoomPassword('');
    setSelectedSimulator(null);
    setSimulatorState({});
    setExperimentData({});
    setMessages([]);
    onLeaveRoom();
  };

  const handleContentChange = (e) => {
    setMessageInput(e.target.value);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim()) {
      sendContentChange(roomId, messageInput);
      setMessages((prevMessages) => [
        ...prevMessages,
        { 
          text: messageInput, 
          sender: localStorage.getItem('username') || 'Anonymous', 
          time: new Date(), 
          isOwnMessage: true 
        },
      ]);
      setMessageInput('');
    }
  };

  const getUserInitials = (name) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // If not in room yet, show loading
  if (!inRoom) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Joining experiment room...</p>
      </div>
    );
  }

  return (
    <>
      <RoomPage
        roomId={roomId}
        roomPassword={roomPassword}
        users={users}
        simulatorType={selectedSimulator}
        simulatorState={simulatorState}
        experimentData={experimentData}
        showExperimentReport={showExperimentReport}
        setShowExperimentReport={setShowExperimentReport}
        getUserInitials={getUserInitials}
        handleLeaveRoom={handleLeaveRoom}
        socket={socket}
      />
      
      <ChatBox
        messages={messages}
        messageInput={messageInput}
        handleContentChange={handleContentChange}
        sendMessage={sendMessage}
        isOpen={isChatOpen}
        toggleChat={() => setIsChatOpen(!isChatOpen)}
        currentUser={localStorage.getItem('username') || 'Anonymous'}
      />
    </>
  );
}

export default App;
