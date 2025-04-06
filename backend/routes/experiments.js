import { Router } from "express";

const router = Router();

// Get experiment data by ID
router.get("/:id", (req, res) => {
  // This would retrieve saved experiment data from a database
  // For now, we'll return dummy data
  res.json({
    id: req.params.id,
    timestamp: new Date().toISOString(),
    data: {
      measurements: [/* data would be here */],
      participants: [/* user data would be here */],
    }
  });
});

export default router;
