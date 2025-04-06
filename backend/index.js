import express from "express";
import cors from "cors";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import config from "./config/index.js";
import apiRoutes from "./routes/index.js";
import setupSocketIO from "./socket/index.js";
import { handleJsContentType } from "./utils/middleware.js";

// Set up __dirname equivalent for ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize express app and HTTP server
const app = express();
const httpServer = createServer(app);

// Set up middleware
app.use(handleJsContentType);
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Socket.IO
setupSocketIO(httpServer);

// API routes
app.use("/api", apiRoutes);
app.use("/", (req, res) => {
  res.send("Virtual Lab Backend Running...");
});

// Start server
const PORT = config.port;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
