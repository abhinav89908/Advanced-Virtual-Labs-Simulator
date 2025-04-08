import React, { useState, useEffect } from 'react';
import socket, { joinRoom, leaveRoom, sendContentChange, checkRoom } from './socket';
import ResponsiveHeader from './components/shared-components/Header';
import Footer from './components/shared-components/Footer';
import { UserCircle } from 'lucide-react';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
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
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    if (socket.connected) {
      setIsConnected(true);
      setIsConnecting(false);
    }

    socket.on('room-created', ({ password }) => {
      setRoomPassword(password);
    });

    socket.on('authentication-failed', () => {
      setAuthError(true);
      setTimeout(() => setAuthError(false), 3000);
    });

    socket.on('user-joined', ({ user, users, content }) => {
      setUsers(users);
      if (content && !inRoom) {
        setContent(content);
      }
      if (user.id === socket.id) {
        setInRoom(true);
      }
    });

    socket.on('user-left', ({ users }) => {
      setUsers(users);
    });

    socket.on('content-updated', ({ content }) => {
      setContent(content);
    });

    const timeoutId = setTimeout(() => {
      setIsConnecting(false);
    }, 3000);

    return () => {
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

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (roomId && username) {
      joinRoom(roomId, username, password);
      setAuthError(false);
    }
  };

  const handleLeaveRoom = () => {
    leaveRoom(roomId);
    setInRoom(false);
    setContent('');
    setUsers([]);
    setPassword('');
    setRoomPassword('');
    setNeedsPassword(false);
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    sendContentChange(roomId, newContent);
  };

  const getUserInitials = (name) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <ResponsiveHeader isConnected={isConnected} isConnecting={isConnecting} />
      
      <main className="flex-grow pt-16">
        {!inRoom ? (
         <div className="flex items-center justify-center h-full max-h-[calc(100vh-14rem)]">
          {/* Lab Assistant Image */}
            <div className="absolute left-0 -translate-x-1/2 transform translate-y-6 md:translate-y-0 md:top-1/4 md:translate-x-2 md:bottom-12 lg:translate-x-6 z-10 pointer-events-none">
              <img 
                src="/images/lab-assistant.png" 
                alt="Lab Assistant" 
                className="w-40 md:w-96 animate-bounce-slow"
                style={{
                  animation: "floating 3s ease-in-out infinite"
                }}
              />
              <style jsx>{`
                @keyframes floating {
                  0% { transform: translateY(0px); }
                  50% { transform: translateY(-10px); }
                  100% { transform: translateY(0px); }
                }
              `}</style>
            </div> 
          <div className="flex items-center justify-center px-4 py-12 relative">

            <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden relative z-0">
              <div className="bg-[#1e2939] px-6 py-4 text-white">
                <h2 className="text-xl font-bold">Join a Collaborative Room</h2>
                <p className="text-indigo-100 text-sm mt-1">Connect with others in a shared virtual workspace</p>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleJoinRoom} className="space-y-4">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="username"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-1">
                      Room ID
                    </label>
                    <input
                      type="text"
                      id="roomId"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={roomId}
                      onChange={handleRoomIdChange}
                      placeholder="Enter a unique room identifier"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {needsPassword 
                        ? "This room exists and requires a password to join" 
                        : "Enter a unique ID to create a new room or join an existing one"}
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      {needsPassword 
                        ? "Room Password" 
                        : "Create Room Password (optional)"}
                    </label>
                    <input
                      type="password"
                      id="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={needsPassword 
                        ? "Enter the room password" 
                        : "Create a password for your room (optional)"}
                      required={needsPassword}
                    />
                    {authError && (
                      <p className="mt-1 text-xs text-red-600">
                        Incorrect password. Please try again.
                      </p>
                    )}
                  </div>
                  
                  <button 
                    type="submit" 
                    className="w-full bg-[#1e2939] text-white font-medium py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    {needsPassword ? "Join Room" : "Create/Join Room"}
                  </button>
                </form>
              </div>
            </div>
          </div>
          <div className="absolute left-2/3 -translate-x-1/2 transform translate-y-6 md:translate-y-0 md:top-1/4 md:translate-x-2 md:bottom-12 lg:translate-x-6 z-10 pointer-events-none">
              <img 
                src="/images/lab-assistant-2.png" 
                alt="Lab Assistant" 
                className="w-40 md:w-96 animate-bounce-slow"
                style={{
                  animation: "floating 3s ease-in-out infinite"
                }}
              />
              <style jsx>{`
                @keyframes floating {
                  0% { transform: translateY(0px); }
                  50% { transform: translateY(-10px); }
                  100% { transform: translateY(0px); }
                }
              `}</style>
            </div> 
         </div>
        ) : (
          <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row gap-6 h-full max-h-[calc(100vh-14rem)]">
            {/* Sidebar */}
            <div className="w-full md:w-64 bg-white rounded-lg shadow-md flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-lg text-gray-800">
                  Room: <span className="text-indigo-600 font-mono">{roomId}</span>
                </h2>
                
                {roomPassword && (
                  <div className="mt-3 py-2 px-3 bg-gray-100 rounded-md">
                    <div className="text-xs text-gray-500 font-medium">
                      Room Password
                    </div>
                    <div className="font-mono text-sm mt-1 bg-white px-2 py-1 rounded border border-gray-200">
                      {roomPassword}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Share this password with others to join this room
                    </p>
                  </div>
                )}
              </div>
              
              <div className="p-4 border-b border-gray-200 flex-grow overflow-y-auto">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-gray-700">Participants</h3>
                  <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-1 rounded-full">
                    {users.length}
                  </span>
                </div>
                
                <ul className="space-y-2">
                  {users.map((user) => (
                    <li key={user.id} className="flex items-center gap-3 py-2 px-3 hover:bg-gray-50 rounded-md">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center text-sm font-medium">
                        {getUserInitials(user.username)}
                      </div>
                      <div className="flex-grow">
                        <div className="text-sm font-medium text-gray-700">
                          {user.username}
                          {user.id === socket.id && (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                              you
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="p-4">
                <button 
                  onClick={handleLeaveRoom} 
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors font-medium flex items-center justify-center"
                >
                  Leave Room
                </button>
              </div>
            </div>
            
            {/* Editor */}
            <div className="flex-grow flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center">
                <h3 className="font-medium text-gray-700">Collaborative Editor</h3>
              </div>
              
              <div className="flex-grow p-4 h-full">
                <textarea
                  className="w-full h-full min-h-[300px] p-4 border border-gray-300 rounded-md shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  value={content}
                  onChange={handleContentChange}
                  placeholder="Start typing here. Changes will be visible to everyone in the room in real-time."
                ></textarea>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

export default App;