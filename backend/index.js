import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const allowedOrigins = [
  "http://localhost:5173",
  "https://advanced-virtual-lab-simulator.netlify.app",
];

// Set proper MIME types for JavaScript modules
app.use((req, res, next) => {
  if (req.path.endsWith('.js')) {
    res.type('application/javascript');
  }
  next();
});

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Origin not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
  },
});

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Serve static files if needed (add this if you're serving frontend files from backend)
// Adjust the path as necessary for your project structure
app.use(express.static(path.join(process.cwd(), 'public')));

app.get("/", (req, res) => {
  res.send("Virtual Lab Backend Running...");
});

// Store active rooms and their users
const rooms = {};

// Socket.io connection handler
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Check if room exists and get password if it does
  socket.on("check-room", ({ roomId }) => {
    const roomExists = rooms[roomId] !== undefined;
    const needsPassword = roomExists;
    socket.emit("room-status", { 
      exists: roomExists, 
      needsPassword: needsPassword 
    });
  });

  // Handle room joining
  socket.on("join-room", ({ roomId, username, password }) => {
    // Leave previous rooms
    Object.keys(socket.rooms).forEach(room => {
      if (room !== socket.id) socket.leave(room);
    });
    
    // Check if room exists
    if (!rooms[roomId]) {
      // Create new room with provided password
      rooms[roomId] = { 
        users: [],
        content: "",
        password: password || Math.random().toString(36).slice(2, 8) // Generate random password if none provided
      };
      
      socket.emit("room-created", { password: rooms[roomId].password });
    } else {
      // Verify password for existing room
      if (rooms[roomId].password !== password) {
        socket.emit("authentication-failed");
        return;
      }
    }

    // Join the new room
    socket.join(roomId);
    
    // Add user to room
    const user = { id: socket.id, username };
    rooms[roomId].users.push(user);
    
    // Notify everyone in the room about the new user
    io.to(roomId).emit("user-joined", { 
      user,
      users: rooms[roomId].users,
      content: rooms[roomId].content
    });
    
    console.log(`${username} joined room: ${roomId}`);
  });

  // Handle content changes
  socket.on("content-change", ({ roomId, content }) => {
    if (rooms[roomId]) {
      rooms[roomId].content = content;
      // Broadcast to everyone except sender
      socket.to(roomId).emit("content-updated", { content });
    }
  });

  // Handle user leaving room explicitly
  socket.on("leave-room", ({ roomId }) => {
    handleUserLeaving(socket, roomId);
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Remove user from all rooms they were in
    Object.keys(rooms).forEach(roomId => {
      handleUserLeaving(socket, roomId);
    });
  });
});

// Helper function to handle user leaving a room
function handleUserLeaving(socket, roomId) {
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
      
      // Clean up empty rooms
      if (room.users.length === 0) {
        delete rooms[roomId];
        console.log(`Room ${roomId} deleted (empty)`);
      }
      
      console.log(`${removedUser.username} left room: ${roomId}`);
    }
  }
}

httpServer.listen(5000, () => console.log("Server running on port 5000"));
