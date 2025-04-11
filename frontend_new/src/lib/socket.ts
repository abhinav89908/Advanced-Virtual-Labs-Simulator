import { io } from "socket.io-client";

let socket = null;

export const initSocket = (token = null, username = null) => {
  if (socket) return socket;
  
  const authData = token 
    ? { token } 
    : { anonymous: true, username: username || "Anonymous" };
  
  socket = io("http://localhost:5000", {
    auth: authData,
    autoConnect: false,
  });
  
  socket.on("connect", () => {
    console.log("Socket connected");
  });
  
  socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err.message);
  });
  
  socket.on("error", (err) => {
    console.error("Socket error:", err.message);
  });
  
  socket.connect();
  
  return socket;
};

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
    socket = null;
  }
};

// Experiment room functions
export const checkRoomExists = (experimentId, roomId) => {
  return new Promise((resolve) => {
    if (!socket || !socket.connected) {
      socket = initSocket();
    }
    
    socket.emit("check-room-exists", { experimentId, roomId }, (response) => {
      resolve(response);
    });
  });
};

export const joinExperimentRoom = (experimentId, roomId, username, password) => {
  return new Promise((resolve) => {
    if (!socket || !socket.connected) {
      socket = initSocket(null, username);
    }
    
    socket.emit("join-experiment-room", { 
      experimentId, 
      roomId, 
      username, 
      password 
    }, (response) => {
      resolve(response);
    });
  });
};

export const leaveExperimentRoom = (experimentId, roomId) => {
  if (!socket || !socket.connected) return;
  
  socket.emit("leave-experiment-room", { experimentId, roomId });
};

export const updateEditorContent = (experimentId, roomId, content) => {
  if (!socket || !socket.connected) return;
  
  socket.emit("editor-content-change", { experimentId, roomId, content });
};

export const updateCursorPosition = (experimentId, roomId, position) => {
  if (!socket || !socket.connected) return;
  
  socket.emit("cursor-position-update", { experimentId, roomId, position });
};

// Event listeners for experiment room
export const onParticipantJoined = (callback) => {
  if (!socket) return;
  
  socket.on("participant-joined", callback);
  return () => socket.off("participant-joined", callback);
};

export const onParticipantLeft = (callback) => {
  if (!socket) return;
  
  socket.on("participant-left", callback);
  return () => socket.off("participant-left", callback);
};

export const onEditorContentUpdate = (callback) => {
  if (!socket) return;
  
  socket.on("editor-content-update", callback);
  return () => socket.off("editor-content-update", callback);
};

export const onCursorPositionChanged = (callback) => {
  if (!socket) return;
  
  socket.on("cursor-position-changed", callback);
  return () => socket.off("cursor-position-changed", callback);
};

// Original project functions
export const joinProject = (projectId) => {
  if (!socket || !socket.connected) return;
  
  socket.emit("join-project", { projectId });
};

export const leaveProject = (projectId) => {
  if (!socket || !socket.connected) return;
  
  socket.emit("leave-project", { projectId });
};

export const emitCodeChange = (projectId, fileName, content, cursorPosition) => {
  if (!socket || !socket.connected) return;
  
  socket.emit("code-change", {
    projectId,
    fileName,
    content,
    cursorPosition,
  });
};

export const emitCursorMove = (projectId, fileName, cursorPosition) => {
  if (!socket || !socket.connected) return;
  
  socket.emit("cursor-move", {
    projectId,
    fileName,
    cursorPosition,
  });
};

export const onCodeUpdate = (callback) => {
  if (!socket) return;
  
  socket.on("code-update", callback);
  return () => socket.off("code-update", callback);
};

export const onCursorUpdate = (callback) => {
  if (!socket) return;
  
  socket.on("cursor-update", callback);
  return () => socket.off("cursor-update", callback);
};

export const onUserJoined = (callback) => {
  if (!socket) return;
  
  socket.on("user-joined", callback);
  return () => socket.off("user-joined", callback);
};

export const onUserLeft = (callback) => {
  if (!socket) return;
  
  socket.on("user-left", callback);
  return () => socket.off("user-left", callback);
};

export const onActiveUsers = (callback) => {
  if (!socket) return;
  
  socket.on("active-users", callback);
  return () => socket.off("active-users", callback);
};
