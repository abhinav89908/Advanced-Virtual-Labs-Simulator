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

app.use(cors());
app.use(express.json());


app.use(express.static(path.join(process.cwd(), 'public')));

app.get("/", (req, res) => {
  res.send("Virtual Lab Backend Running...");
});


const rooms = {};

// Socket.io connection handler
io.on("connection", (socket) => {
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
        password: password || Math.random().toString(36).slice(2, 8)
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
      content: rooms[roomId].content
    });
    
    console.log(`${username} joined room: ${roomId}`);
  });

  socket.on("content-change", ({ roomId, content }) => {
    if (rooms[roomId]) {
      rooms[roomId].content = content;
      socket.to(roomId).emit("content-updated", { content });
    }
  });

  socket.on("leave-room", ({ roomId }) => {
    handleUserLeaving(socket, roomId);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    Object.keys(rooms).forEach(roomId => {
      handleUserLeaving(socket, roomId);
    });
  });
});

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
      
      if (room.users.length === 0) {
        delete rooms[roomId];
        console.log(`Room ${roomId} deleted (empty)`);
      }
      
      console.log(`${removedUser.username} left room: ${roomId}`);
    }
  }
}

httpServer.listen(5000, () => console.log("Server running on port 5000"));
