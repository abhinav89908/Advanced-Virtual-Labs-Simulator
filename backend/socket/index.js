import { Server } from "socket.io";
import { registerSocketHandlers } from "./handlers.js";
import config from "../config/index.js";

const setupSocketIO = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || config.allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Origin not allowed by CORS"));
        }
      },
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    registerSocketHandlers(io, socket);
  });

  return io;
};

export default setupSocketIO;
