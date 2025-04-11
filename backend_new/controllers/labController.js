import Lab from '../models/Lab.js';

// Create a new lab
export const createLab = async (req, res) => {
  try {
    const { name, description, course, deadline } = req.body;
    
    const lab = new Lab({
      name,
      description,
      course,
      instructor: req.user._id,
      deadline: deadline || null
    });

    const createdLab = await lab.save();
    res.status(201).json(createdLab);
  } catch (error) {
    console.error('Create lab error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all labs
export const getLabs = async (req, res) => {
  try {
    const labs = await Lab.find({})
      .populate('instructor', 'username email')
      .sort({ createdAt: -1 });
    
    res.json(labs);
  } catch (error) {
    console.error('Get labs error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get labs by user (instructor or student)
export const getMyLabs = async (req, res) => {
  try {
    const instructorLabs = await Lab.find({ instructor: req.user._id })
      .populate('instructor', 'username email')
      .sort({ createdAt: -1 });
    
    const studentLabs = await Lab.find({ students: req.user._id })
      .populate('instructor', 'username email')
      .sort({ createdAt: -1 });
    
    res.json({
      instructorLabs,
      studentLabs
    });
  } catch (error) {
    console.error('Get my labs error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get lab by ID
export const getLabById = async (req, res) => {
  try {
    const lab = await Lab.findById(req.params.id)
      .populate('instructor', 'username email')
      .populate('students', 'username email');
    
    if (lab) {
      res.json(lab);
    } else {
      res.status(404).json({ message: 'Lab not found' });
    }
  } catch (error) {
    console.error('Get lab by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update lab
export const updateLab = async (req, res) => {
  try {
    const { name, description, course, deadline, status } = req.body;
    
    const lab = await Lab.findById(req.params.id);
    
    if (lab) {
      // Check if the user is the instructor
      if (lab.instructor.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized to update this lab' });
      }
      
      lab.name = name || lab.name;
      lab.description = description || lab.description;
      lab.course = course || lab.course;
      lab.deadline = deadline || lab.deadline;
      lab.status = status || lab.status;
      
      const updatedLab = await lab.save();
      res.json(updatedLab);
    } else {
      res.status(404).json({ message: 'Lab not found' });
    }
  } catch (error) {
    console.error('Update lab error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete lab
export const deleteLab = async (req, res) => {
  try {
    const lab = await Lab.findById(req.params.id);
    
    if (lab) {
      // Check if the user is the instructor
      if (lab.instructor.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized to delete this lab' });
      }
      
      await lab.deleteOne();
      res.json({ message: 'Lab removed' });
    } else {
      res.status(404).json({ message: 'Lab not found' });
    }
  } catch (error) {
    console.error('Delete lab error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add student to lab
export const addStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
    const lab = await Lab.findById(req.params.id);
    
    if (lab) {
      // Check if the user is the instructor
      if (lab.instructor.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized to update this lab' });
      }
      
      // Check if student already exists
      if (lab.students.includes(studentId)) {
        return res.status(400).json({ message: 'Student already added to this lab' });
      }
      
      lab.students.push(studentId);
      const updatedLab = await lab.save();
      res.json(updatedLab);
    } else {
      res.status(404).json({ message: 'Lab not found' });
    }
  } catch (error) {
    console.error('Add student error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
