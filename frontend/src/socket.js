import { io } from "socket.io-client";

const socket = io("http://localhost:5000/", {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000
});

export const checkRoom = (roomId) => {
  return new Promise((resolve) => {
    socket.emit("check-room", { roomId });
    socket.once("room-status", (status) => {
      resolve(status);
    });
  });
};

export const joinRoom = (roomId, username, password = "") => {
  socket.emit("join-room", { roomId, username, password });
};

export const leaveRoom = (roomId) => {
  socket.emit("leave-room", { roomId });
};

export const sendContentChange = (roomId, content) => {
  socket.emit("content-change", { roomId, content, username: localStorage.getItem('username') || 'Anonymous' });
};

// New function to share mouse position
export const shareMousePosition = (roomId, x, y, isClicking = false) => {
  socket.emit("mouse-move", { 
    roomId, 
    x, 
    y, 
    isClicking,
    username: localStorage.getItem('username') || 'Anonymous'
  });
};

// New functions for simulator actions
// Make sure simulatorType is a string
export const initializeSimulator = (roomId, simulatorType, initialState = {}) => {
  // Ensure we are passing a string for the simulator type
  const simulatorId = typeof simulatorType === 'object' ? simulatorType.id : simulatorType;
  
  if (!simulatorId) {
    console.error("Invalid simulator type provided", simulatorType);
    return;
  }
  
  socket.emit("init-simulator", { 
    roomId, 
    simulatorType: simulatorId, 
    initialState 
  });
};

export const sendSimulatorAction = (roomId, action, data) => {
  socket.emit("simulator-action", { roomId, action, data });
};

export const saveExperimentResults = (roomId, results) => {
  return new Promise((resolve) => {
    socket.emit("save-results", { roomId, results });
    socket.once("results-saved", (response) => {
      resolve(response);
    });
  });
};

export const getExperimentData = (experimentId) => {
  return new Promise((resolve) => {
    socket.emit("get-experiment-data", { experimentId });
    socket.once("experiment-data", (data) => {
      resolve(data);
    });
  });
};

export default socket;
