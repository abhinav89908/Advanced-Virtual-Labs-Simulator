import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/authRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import experimentRoutes from './routes/experimentRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/experiments', experimentRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Student Registration API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});