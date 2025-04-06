import { Router } from "express";
import simulatorRoutes from "./simulators.js";
import experimentRoutes from "./experiments.js";

const router = Router();

// Root API route
router.get("/", (req, res) => {
  res.send("Virtual Lab Backend Running...");
});

// Register routes
router.use("/simulators", simulatorRoutes);
router.use("/experiments", experimentRoutes);

export default router;
