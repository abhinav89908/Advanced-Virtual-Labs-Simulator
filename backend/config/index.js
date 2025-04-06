import dotenv from "dotenv";
dotenv.config();

// Centralized configuration
export default {
  port: process.env.PORT || 5000,
  allowedOrigins: [
    "http://localhost:5173",
    "https://advanced-virtual-lab-simulator.netlify.app",
  ],
  isDevelopment: process.env.NODE_ENV !== "production"
};
