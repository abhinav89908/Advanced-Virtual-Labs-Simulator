import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const rooms = {}; // ✅ Store active rooms and their data

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Virtual Lab Backend Running...");
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    if (!rooms[roomId]) rooms[roomId] = { users: [], code: "" };

    rooms[roomId].users.push(socket.id);
    socket.emit("codeUpdate", rooms[roomId].code);
    io.to(roomId).emit("roomUsers", rooms[roomId].users);
  });

  socket.on("codeChange", ({ roomId, newCode }) => {
    if (rooms[roomId]) {
      rooms[roomId].code = newCode;
      io.to(roomId).emit("codeUpdate", newCode); // ✅ Send update to all users
    }
  });

  socket.on("cursorMove", ({ roomId, userId, position }) => {
    socket.to(roomId).emit("cursorUpdate", { userId, position });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    // Remove user from all rooms
    for (const roomId in rooms) {
      rooms[roomId].users = rooms[roomId].users.filter((id) => id !== socket.id);
      io.to(roomId).emit("roomUsers", rooms[roomId].users);
      if (rooms[roomId].users.length === 0) delete rooms[roomId]; // Cleanup empty rooms
    }
  });
});

httpServer.listen(5000, () => console.log("Server running on port 5000"));
