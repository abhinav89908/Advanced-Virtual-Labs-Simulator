import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { find, findById, saveData, updateById } from '../utils/fileStorage.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Create a new project
router.post('/', async (req, res) => {
  try {
    const { name, description, labId, isPublic } = req.body;
    
    // Verify lab exists
    const lab = await findById('labs', labId);
    if (!lab) {
      return res.status(404).json({ message: 'Lab not found' });
    }
    
    // Check if user is instructor or student in this lab
    const isInstructor = lab.instructor === req.user._id;
    const isStudent = lab.students.includes(req.user._id);
    
    if (!isInstructor && !isStudent) {
      return res.status(401).json({ message: 'Not authorized to create projects in this lab' });
    }
    
    const project = {
      name,
      description,
      lab: labId,
      owner: req.user._id,
      collaborators: [],
      isPublic: isPublic || false,
      files: [{ 
        name: 'main.js', 
        content: '// Your code here', 
        language: 'javascript',
        lastModifiedBy: req.user._id,
        lastModifiedAt: new Date()
      }]
    };

    const createdProject = await saveData('projects', project);
    
    // Update lab with project reference
    lab.projects.push(createdProject._id);
    await updateById('labs', labId, { projects: lab.projects });
    
    res.status(201).json(createdProject);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all projects for a lab
router.get('/lab/:labId', async (req, res) => {
  try {
    const { labId } = req.params;
    
    // Verify lab exists
    const lab = await findById('labs', labId);
    if (!lab) {
      return res.status(404).json({ message: 'Lab not found' });
    }
    
    // Check if user is instructor or student in this lab
    const isInstructor = lab.instructor === req.user._id;
    const isStudent = lab.students.includes(req.user._id);
    
    if (!isInstructor && !isStudent) {
      return res.status(401).json({ message: 'Not authorized to view projects in this lab' });
    }
    
    const allProjects = await find('projects');
    const labProjects = allProjects.filter(project => project.lab === labId);
    
    res.json(labProjects);
  } catch (error) {
    console.error('Get lab projects error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const project = await findById('projects', req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if project is public
    if (project.isPublic) {
      return res.json(project);
    }
    
    // Check if user is owner, collaborator, or lab instructor
    const lab = await findById('labs', project.lab);
    const isOwner = project.owner === req.user._id;
    const isCollaborator = project.collaborators.some(c => c.user === req.user._id);
    const isLabInstructor = lab && lab.instructor === req.user._id;
    
    if (isOwner || isCollaborator || isLabInstructor) {
      res.json(project);
    } else {
      res.status(401).json({ message: 'Not authorized to view this project' });
    }
  } catch (error) {
    console.error('Get project by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update project
router.put('/:id', async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;
    
    const project = await findById('projects', req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is owner or lab instructor
    const lab = await findById('labs', project.lab);
    const isOwner = project.owner === req.user._id;
    const isLabInstructor = lab && lab.instructor === req.user._id;
    
    if (!isOwner && !isLabInstructor) {
      return res.status(401).json({ message: 'Not authorized to update this project' });
    }
    
    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    
    const updatedProject = await updateById('projects', req.params.id, updateData);
    res.json(updatedProject);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add or update file in project
router.post('/:id/files', async (req, res) => {
  try {
    const { fileName, content, language } = req.body;
    
    const project = await findById('projects', req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is owner or editor collaborator
    const isOwner = project.owner === req.user._id;
    const isEditorCollaborator = project.collaborators.some(
      c => c.user === req.user._id && c.role === 'editor'
    );
    
    if (!isOwner && !isEditorCollaborator) {
      return res.status(401).json({ message: 'Not authorized to edit files in this project' });
    }
    
    // Find if file already exists
    const fileIndex = project.files.findIndex(file => file.name === fileName);
    
    if (fileIndex !== -1) {
      // Update existing file
      project.files[fileIndex].content = content;
      project.files[fileIndex].language = language || project.files[fileIndex].language;
      project.files[fileIndex].lastModifiedBy = req.user._id;
      project.files[fileIndex].lastModifiedAt = new Date();
    } else {
      // Add new file
      project.files.push({
        name: fileName,
        content,
        language: language || 'javascript',
        lastModifiedBy: req.user._id,
        lastModifiedAt: new Date()
      });
    }
    
    const updatedProject = await updateById('projects', req.params.id, {
      files: project.files
    });
    
    res.json(updatedProject);
  } catch (error) {
    console.error('Update project file error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add collaborator to project
router.post('/:id/collaborators', async (req, res) => {
  try {
    const { userId, role } = req.body;
    
    const project = await findById('projects', req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is owner
    if (project.owner !== req.user._id) {
      return res.status(401).json({ message: 'Only the owner can add collaborators' });
    }
    
    // Check if collaborator already exists
    const existingCollaboratorIndex = project.collaborators.findIndex(
      c => c.user === userId
    );
    
    if (existingCollaboratorIndex !== -1) {
      // Update role if collaborator already exists
      project.collaborators[existingCollaboratorIndex].role = role || 'editor';
    } else {
      // Add new collaborator
      project.collaborators.push({
        user: userId,
        role: role || 'editor'
      });
    }
    
    const updatedProject = await updateById('projects', req.params.id, {
      collaborators: project.collaborators
    });
    
    res.json(updatedProject);
  } catch (error) {
    console.error('Add collaborator error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
