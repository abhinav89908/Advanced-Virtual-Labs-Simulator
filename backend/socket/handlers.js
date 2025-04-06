// Store rooms and experiment results
const rooms = {};
const experimentResults = {};

// Handle user leaving a room
const handleUserLeaving = (io, socket, roomId) => {
  if (rooms[roomId]) {
    const room = rooms[roomId];
    const userIndex = room.users.findIndex(user => user.id === socket.id);
    
    if (userIndex !== -1) {
      const [removedUser] = room.users.splice(userIndex, 1);
      socket.leave(roomId);
      
      io.to(roomId).emit("user-left", { 
        userId: socket.id,
        username: removedUser.username,
        users: room.users 
      });
      
      if (room.users.length === 0) {
        delete rooms[roomId];
        console.log(`Room ${roomId} deleted (empty)`);
      }
      
      console.log(`${removedUser.username} left room: ${roomId}`);
    }
  }
};

// Register socket handlers
const registerSocketHandlers = (io, socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("check-room", ({ roomId }) => {
    const roomExists = rooms[roomId] !== undefined;
    const needsPassword = roomExists;
    socket.emit("room-status", { 
      exists: roomExists, 
      needsPassword: needsPassword 
    });
  });

  socket.on("join-room", ({ roomId, username, password }) => {
    // Leave previous rooms
    Object.keys(socket.rooms).forEach(room => {
      if (room !== socket.id) socket.leave(room);
    });
    
    if (!rooms[roomId]) {
      rooms[roomId] = { 
        users: [],
        content: "",
        password: password || Math.random().toString(36).slice(2, 8),
        simulator: null,
        simulatorState: {},
      };
      
      socket.emit("room-created", { password: rooms[roomId].password });
    } else {
      if (rooms[roomId].password !== password) {
        socket.emit("authentication-failed");
        return;
      }
    }

    socket.join(roomId);
    
    const user = { id: socket.id, username };
    rooms[roomId].users.push(user);
    
    io.to(roomId).emit("user-joined", { 
      user,
      users: rooms[roomId].users,
      content: rooms[roomId].content,
      simulator: rooms[roomId].simulator,
      simulatorState: rooms[roomId].simulatorState
    });
    
    console.log(`${username} joined room: ${roomId}`);
  });

  socket.on("content-change", ({ roomId, content, username }) => {
    if (rooms[roomId]) {
      rooms[roomId].content = content;
      socket.to(roomId).emit("content-updated", { 
        content,
        username: username || 'Anonymous'
      });
    }
  });

  socket.on("init-simulator", ({ roomId, simulatorType, initialState }) => {
    if (rooms[roomId]) {
      rooms[roomId].simulator = simulatorType;
      rooms[roomId].simulatorState = initialState || {};
      
      io.to(roomId).emit("simulator-initialized", {
        simulatorType,
        state: rooms[roomId].simulatorState
      });
      
      console.log(`Simulator ${simulatorType} initialized in room ${roomId}`);
    }
  });

  socket.on("simulator-action", ({ roomId, action, data }) => {
    if (rooms[roomId]) {
      // Here we could have simulator-specific logic to update the state
      // For now, we'll just broadcast the action to all users in the room
      io.to(roomId).emit("simulator-update", { action, data });
      
      // Update stored state (simplified - in a real scenario this would depend on the action)
      if (data && typeof data === 'object') {
        rooms[roomId].simulatorState = {
          ...rooms[roomId].simulatorState,
          ...data
        };
      }
    }
  });
  
  socket.on("mouse-move", ({ roomId, x, y, isClicking, username }) => {
    if (rooms[roomId]) {
      // Broadcast to all other users in the room
      socket.to(roomId).emit("user-mouse-move", { 
        userId: socket.id, 
        username, 
        x, 
        y, 
        isClicking 
      });
    }
  });

  socket.on("save-results", ({ roomId, results }) => {
    if (rooms[roomId]) {
      const experimentId = `exp_${Date.now()}`;
      experimentResults[experimentId] = {
        roomId,
        timestamp: new Date().toISOString(),
        users: rooms[roomId].users.map(u => u.username),
        simulator: rooms[roomId].simulator,
        results
      };
      
      socket.emit("results-saved", { 
        success: true, 
        experimentId,
        message: "Experiment results saved successfully"
      });
      
      console.log(`Results saved for room ${roomId} with ID ${experimentId}`);
    }
  });

  socket.on("get-experiment-data", ({ experimentId }) => {
    socket.emit("experiment-data", experimentResults[experimentId] || { error: "Not found" });
  });

  socket.on("leave-room", ({ roomId }) => {
    handleUserLeaving(io, socket, roomId);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    Object.keys(rooms).forEach(roomId => {
      handleUserLeaving(io, socket, roomId);
    });
  });
};

export { registerSocketHandlers };
