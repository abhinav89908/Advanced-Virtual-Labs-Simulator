import express from 'express';
import { protect, teacher } from '../middleware/authMiddleware.js';
import { find, findById, saveData, updateById, deleteById } from '../utils/fileStorage.js';

const router = express.Router();

// Create a new lab
router.post('/', protect, teacher, async (req, res) => {
  try {
    const { name, description, course, deadline } = req.body;
    
    const lab = {
      name,
      description,
      course,
      instructor: req.user._id,
      deadline: deadline || null,
      students: [],
      projects: [],
      status: 'active'
    };

    const createdLab = await saveData('labs', lab);
    res.status(201).json(createdLab);
  } catch (error) {
    console.error('Create lab error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all labs for teachers
router.get('/', protect, teacher, async (req, res) => {
  try {
    const labs = await find('labs');
    res.json(labs);
  } catch (error) {
    console.error('Get labs error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get labs for current user
router.get('/my', protect, async (req, res) => {
  try {
    const allLabs = await find('labs');
    
    const instructorLabs = allLabs.filter(lab => lab.instructor === req.user._id);
    const studentLabs = allLabs.filter(lab => lab.students.includes(req.user._id));
    
    res.json({
      instructorLabs,
      studentLabs
    });
  } catch (error) {
    console.error('Get my labs error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get lab by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const lab = await findById('labs', req.params.id);
    
    if (lab) {
      res.json(lab);
    } else {
      res.status(404).json({ message: 'Lab not found' });
    }
  } catch (error) {
    console.error('Get lab by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update lab
router.put('/:id', protect, teacher, async (req, res) => {
  try {
    const { name, description, course, deadline, status } = req.body;
    
    const lab = await findById('labs', req.params.id);
    
    if (!lab) {
      return res.status(404).json({ message: 'Lab not found' });
    }
    
    // Check if the user is the instructor
    if (lab.instructor !== req.user._id) {
      return res.status(401).json({ message: 'Not authorized to update this lab' });
    }
    
    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (course) updateData.course = course;
    if (deadline) updateData.deadline = deadline;
    if (status) updateData.status = status;
    
    const updatedLab = await updateById('labs', req.params.id, updateData);
    res.json(updatedLab);
  } catch (error) {
    console.error('Update lab error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete lab
router.delete('/:id', protect, teacher, async (req, res) => {
  try {
    const lab = await findById('labs', req.params.id);
    
    if (!lab) {
      return res.status(404).json({ message: 'Lab not found' });
    }
    
    // Check if the user is the instructor
    if (lab.instructor !== req.user._id) {
      return res.status(401).json({ message: 'Not authorized to delete this lab' });
    }
    
    await deleteById('labs', req.params.id);
    res.json({ message: 'Lab removed' });
  } catch (error) {
    console.error('Delete lab error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add student to lab
router.post('/:id/students', protect, teacher, async (req, res) => {
  try {
    const { studentId } = req.body;
    const lab = await findById('labs', req.params.id);
    
    if (!lab) {
      return res.status(404).json({ message: 'Lab not found' });
    }
    
    // Check if the user is the instructor
    if (lab.instructor !== req.user._id) {
      return res.status(401).json({ message: 'Not authorized to update this lab' });
    }
    
    // Check if student already exists
    if (lab.students.includes(studentId)) {
      return res.status(400).json({ message: 'Student already added to this lab' });
    }
    
    lab.students.push(studentId);
    const updatedLab = await updateById('labs', req.params.id, {
      students: lab.students
    });
    
    res.json(updatedLab);
  } catch (error) {
    console.error('Add student error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
