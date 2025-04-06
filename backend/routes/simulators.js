import { Router } from "express";

const router = Router();

// Get all simulators
router.get("/", (req, res) => {
  console.log("API endpoint /api/simulators was accessed");
  
  // Return list of available simulators with better details
  const simulators = [
    { 
      id: "pendulum", 
      name: "Simple Pendulum", 
      description: "Simulate a simple pendulum experiment to verify the relationship between pendulum length and period. Measure periods and compare with theoretical values.",
      thumbnail: "/images/pendulum.png",
      difficulty: "Beginner",
      estimatedTime: "15-20 minutes"
    },
    { 
      id: "circuit", 
      name: "Circuit Builder", 
      description: "Build and analyze electric circuits. Test Ohm's law and measure voltage, current, and resistance in different circuit configurations.",
      thumbnail: "/images/circuit.png",
      difficulty: "Intermediate",
      estimatedTime: "20-30 minutes"
    },
    // You can add more simulators here
  ];
  
  // Add CORS headers explicitly for this response
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  
  res.json(simulators);
});

// Get specific simulator
router.get("/:id", (req, res) => {
  const simulatorId = req.params.id;
  
  // This could be fetched from a database in a production app
  const simulatorDetails = {
    pendulum: {
      id: "pendulum",
      name: "Simple Pendulum",
      description: "Simulate a simple pendulum experiment to verify the relationship between pendulum length and period.",
      longDescription: "Learn about the physics of oscillatory motion using a simple pendulum. This simulator allows you to adjust pendulum length and gravity to observe how they affect the period of oscillation. Take measurements to verify that the period (T) is related to length (L) by the formula T = 2π√(L/g).",
      learningObjectives: [
        "Understand the relationship between pendulum length and period",
        "Verify the formula T = 2π√(L/g)",
        "Measure pendulum period accurately",
        "Analyze experimental error by comparing measured values with theoretical predictions"
      ],
      difficulty: "Beginner",
      estimatedTime: "15-20 minutes",
      thumbnail: "https://via.placeholder.com/300x200?text=Pendulum"
    },
    circuit: {
      id: "circuit",
      name: "Circuit Builder",
      description: "Build and analyze electric circuits to understand Ohm's law and circuit principles.",
      longDescription: "Explore the fundamentals of electric circuits by building various configurations with batteries, resistors, and capacitors. Measure voltage drops across components and current flow to verify Ohm's law (V = IR) and understand the principles of series and parallel circuits.",
      learningObjectives: [
        "Build simple series and parallel circuits",
        "Measure voltage, current, and resistance",
        "Verify Ohm's law experimentally",
        "Understand how components affect circuit behavior"
      ],
      difficulty: "Intermediate",
      estimatedTime: "20-30 minutes",
      thumbnail: "https://via.placeholder.com/300x200?text=Circuit"
    }
  };
  
  // Return details for the requested simulator
  if (simulatorDetails[simulatorId]) {
    res.json(simulatorDetails[simulatorId]);
  } else {
    res.status(404).json({ error: "Simulator not found" });
  }
});

export default router;
