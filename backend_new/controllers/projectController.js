import Project from '../models/Project.js';
import Lab from '../models/Lab.js';

// Create a new project
export const createProject = async (req, res) => {
  try {
    const { name, description, labId, isPublic } = req.body;
    
    // Verify lab exists and user has access
    const lab = await Lab.findById(labId);
    if (!lab) {
      return res.status(404).json({ message: 'Lab not found' });
    }
    
    // Check if user is instructor or student in this lab
    const isInstructor = lab.instructor.toString() === req.user._id.toString();
    const isStudent = lab.students.includes(req.user._id);
    
    if (!isInstructor && !isStudent) {
      return res.status(401).json({ message: 'Not authorized to create projects in this lab' });
    }
    
    const project = new Project({
      name,
      description,
      lab: labId,
      owner: req.user._id,
      isPublic: isPublic || false,
      files: [{ 
        name: 'main.js', 
        content: '// Your code here', 
        language: 'javascript',
        lastModifiedBy: req.user._id
      }]
    });

    const createdProject = await project.save();
    
    // Add project to lab's projects array
    lab.projects.push(createdProject._id);
    await lab.save();
    
    res.status(201).json(createdProject);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all projects for a lab
export const getLabProjects = async (req, res) => {
  try {
    const { labId } = req.params;
    
    // Verify lab exists and user has access
    const lab = await Lab.findById(labId);
    if (!lab) {
      return res.status(404).json({ message: 'Lab not found' });
    }
    
    // Check if user is instructor or student in this lab
    const isInstructor = lab.instructor.toString() === req.user._id.toString();
    const isStudent = lab.students.includes(req.user._id);
    
    if (!isInstructor && !isStudent) {
      return res.status(401).json({ message: 'Not authorized to view projects in this lab' });
    }
    
    const projects = await Project.find({ lab: labId })
      .populate('owner', 'username email')
      .populate('collaborators.user', 'username email')
      .sort({ createdAt: -1 });
    
    res.json(projects);
  } catch (error) {
    console.error('Get lab projects error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get project by ID
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'username email')
      .populate('collaborators.user', 'username email')
      .populate('lab', 'name instructor');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if project is public
    if (project.isPublic) {
      return res.json(project);
    }
    
    // Check if user is owner, collaborator, or lab instructor
    const isOwner = project.owner._id.toString() === req.user._id.toString();
    const isCollaborator = project.collaborators.some(
      c => c.user._id.toString() === req.user._id.toString()
    );
    const isLabInstructor = project.lab.instructor.toString() === req.user._id.toString();
    
    if (isOwner || isCollaborator || isLabInstructor) {
      res.json(project);
    } else {
      res.status(401).json({ message: 'Not authorized to view this project' });
    }
  } catch (error) {
    console.error('Get project by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update project
export const updateProject = async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;
    
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is owner or lab instructor
    const lab = await Lab.findById(project.lab);
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isLabInstructor = lab && lab.instructor.toString() === req.user._id.toString();
    
    if (!isOwner && !isLabInstructor) {
      return res.status(401).json({ message: 'Not authorized to update this project' });
    }
    
    project.name = name || project.name;
    project.description = description || project.description;
    if (isPublic !== undefined) project.isPublic = isPublic;
    
    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add or update file in project
export const updateProjectFile = async (req, res) => {
  try {
    const { fileName, content, language } = req.body;
    
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is owner or collaborator
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isCollaborator = project.collaborators.some(
      c => c.user.toString() === req.user._id.toString() && c.role === 'editor'
    );
    
    if (!isOwner && !isCollaborator) {
      return res.status(401).json({ message: 'Not authorized to edit files in this project' });
    }
    
    // Find if file already exists
    const fileIndex = project.files.findIndex(file => file.name === fileName);
    
    if (fileIndex !== -1) {
      // Update existing file
      project.files[fileIndex].content = content;
      project.files[fileIndex].language = language || project.files[fileIndex].language;
      project.files[fileIndex].lastModifiedBy = req.user._id;
      project.files[fileIndex].lastModifiedAt = Date.now();
    } else {
      // Add new file
      project.files.push({
        name: fileName,
        content,
        language: language || 'javascript',
        lastModifiedBy: req.user._id,
        lastModifiedAt: Date.now()
      });
    }
    
    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (error) {
    console.error('Update project file error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add collaborator to project
export const addCollaborator = async (req, res) => {
  try {
    const { userId, role } = req.body;
    
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is owner
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Only the owner can add collaborators' });
    }
    
    // Check if collaborator already exists
    const existingCollaboratorIndex = project.collaborators.findIndex(
      c => c.user.toString() === userId
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
    
    const updatedProject = await project.save();
    
    // Populate the collaborator details before sending response
    await updatedProject.populate('collaborators.user', 'username email');
    
    res.json(updatedProject);
  } catch (error) {
    console.error('Add collaborator error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
