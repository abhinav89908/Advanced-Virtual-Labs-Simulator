import jwt from 'jsonwebtoken';
import { findById, saveData, updateById } from '../utils/fileStorage.js';
import { v4 as uuidv4 } from 'uuid';

export const setupSocketHandlers = (io) => {
  const connectedUsers = new Map();
  const activeProjects = new Map();
  // Store active experiment rooms with their properties
  const experimentRooms = new Map();

  // Middleware for authentication
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      // For experiment rooms, allow anonymous access
      if (socket.handshake.auth.anonymous === true) {
        socket.user = {
          _id: socket.id,
          username: socket.handshake.auth.username || 'Anonymous User',
          isAnonymous: true
        };
        return next();
      }
      return next(new Error('Authentication error'));
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await findById('users', decoded.id);
      
      if (!user) {
        return next(new Error('User not found'));
      }
      
      // Remove password from user object
      const { password, ...userWithoutPassword } = user;
      socket.user = userWithoutPassword;
      next();
    } catch (error) {
      return next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.username} (${socket.id})`);
    if (!socket.user.isAnonymous) {
      connectedUsers.set(socket.user._id, socket.id);
    }
    
    // Check if experiment room exists
    socket.on('check-room-exists', (data, callback) => {
      const { experimentId, roomId } = data;
      const roomKey = `${experimentId}:${roomId}`;
      const roomExists = experimentRooms.has(roomKey);
      
      callback({
        exists: roomExists,
        requirePassword: roomExists
      });
    });
    
    // Create or join experiment room
    socket.on('join-experiment-room', (data, callback) => {
      try {
        const { experimentId, roomId, username, password } = data;
        const roomKey = `${experimentId}:${roomId}`;
        
        // If room doesn't exist, create it
        if (!experimentRooms.has(roomKey)) {
          const roomPassword = password || generateRandomPassword();
          experimentRooms.set(roomKey, {
            createdAt: new Date(),
            password: roomPassword,
            participants: new Map(),
            experimentId,
            roomId,
            editorContent: '// Start your collaborative code here\n'
          });
          console.log(`New room created: ${roomKey} with password: ${roomPassword}`);
        }
        
        const room = experimentRooms.get(roomKey);
        
        // Validate password for existing room
        if (room.password !== password) {
          return callback({
            success: false,
            message: 'Incorrect password'
          });
        }
        
        // Add user to room participants
        const participantId = socket.user.isAnonymous ? socket.id : socket.user._id;
        const participant = {
          id: participantId,
          username: socket.user.isAnonymous ? username : socket.user.username,
          joinedAt: new Date(),
          isAnonymous: socket.user.isAnonymous
        };
        
        room.participants.set(participantId, participant);
        
        // Join the socket room
        socket.join(roomKey);
        
        // Notify other users in the room
        socket.to(roomKey).emit('participant-joined', participant);
        
        // Send room data to the joining user
        callback({
          success: true,
          room: {
            experimentId,
            roomId,
            editorContent: room.editorContent,
            participants: Array.from(room.participants.values())
          }
        });
        
        console.log(`${participant.username} joined room ${roomKey}`);
      } catch (error) {
        console.error('Join experiment room error:', error);
        callback({
          success: false,
          message: 'Server error'
        });
      }
    });
    
    // Leave experiment room
    socket.on('leave-experiment-room', (data) => {
      const { experimentId, roomId } = data;
      const roomKey = `${experimentId}:${roomId}`;
      
      if (experimentRooms.has(roomKey)) {
        const room = experimentRooms.get(roomKey);
        const participantId = socket.user.isAnonymous ? socket.id : socket.user._id;
        
        // Remove from participants
        if (room.participants.has(participantId)) {
          const participant = room.participants.get(participantId);
          room.participants.delete(participantId);
          
          // Notify others
          socket.to(roomKey).emit('participant-left', {
            id: participantId,
            username: participant.username
          });
          
          console.log(`${participant.username} left room ${roomKey}`);
          
          // If room is empty, remove it after some time
          if (room.participants.size === 0) {
            setTimeout(() => {
              if (experimentRooms.has(roomKey) && 
                  experimentRooms.get(roomKey).participants.size === 0) {
                experimentRooms.delete(roomKey);
                console.log(`Empty room removed: ${roomKey}`);
              }
            }, 30000); // 30 seconds delay
          }
        }
      }
      
      // Leave the socket room
      socket.leave(roomKey);
    });
    
    // Editor content update
    socket.on('editor-content-change', (data) => {
      const { experimentId, roomId, content } = data;
      const roomKey = `${experimentId}:${roomId}`;
      
      if (experimentRooms.has(roomKey)) {
        const room = experimentRooms.get(roomKey);
        room.editorContent = content;
        
        // Broadcast to all other users in the room
        socket.to(roomKey).emit('editor-content-update', {
          content,
          userId: socket.user.isAnonymous ? socket.id : socket.user._id,
          username: socket.user.isAnonymous ? 
            (experimentRooms.get(roomKey).participants.get(socket.id)?.username || 'Anonymous') : 
            socket.user.username
        });
      }
    });
    
    // Cursor position update
    socket.on('cursor-position-update', (data) => {
      const { experimentId, roomId, position } = data;
      const roomKey = `${experimentId}:${roomId}`;
      
      // Broadcast cursor position to others in the room
      socket.to(roomKey).emit('cursor-position-changed', {
        position,
        userId: socket.user.isAnonymous ? socket.id : socket.user._id,
        username: socket.user.isAnonymous ? 
          (experimentRooms.get(roomKey).participants.get(socket.id)?.username || 'Anonymous') : 
          socket.user.username
      });
    });
    
    // Join project room
    socket.on('join-project', async ({ projectId }) => {
      try {
        const project = await findById('projects', projectId);
        
        if (!project) {
          socket.emit('error', { message: 'Project not found' });
          return;
        }
        
        // Check if user has access to project
        const isOwner = project.owner === socket.user._id;
        const isCollaborator = project.collaborators.some(
          c => c.user === socket.user._id
        );
        
        if (!project.isPublic && !isOwner && !isCollaborator) {
          socket.emit('error', { message: 'Not authorized to access this project' });
          return;
        }
        
        const roomName = `project:${projectId}`;
        socket.join(roomName);
        
        // Track active users in project
        if (!activeProjects.has(projectId)) {
          activeProjects.set(projectId, new Set());
        }
        activeProjects.get(projectId).add(socket.user._id);
        
        // Notify all users in the room about the new user
        io.to(roomName).emit('user-joined', {
          userId: socket.user._id,
          username: socket.user.username
        });
        
        // Send list of active users to the new user
        const activeUsers = Array.from(activeProjects.get(projectId)).map(userId => {
          return {
            userId,
            username: userId === socket.user._id ? socket.user.username : 'Other User'
          };
        });
        socket.emit('active-users', activeUsers);
        
        console.log(`${socket.user.username} joined project ${projectId}`);
      } catch (error) {
        console.error('Join project error:', error);
        socket.emit('error', { message: 'Server error' });
      }
    });
    
    // Leave project room
    socket.on('leave-project', ({ projectId }) => {
      const roomName = `project:${projectId}`;
      socket.leave(roomName);
      
      if (activeProjects.has(projectId)) {
        activeProjects.get(projectId).delete(socket.user._id);
        if (activeProjects.get(projectId).size === 0) {
          activeProjects.delete(projectId);
        }
      }
      
      // Notify other users
      io.to(roomName).emit('user-left', {
        userId: socket.user._id,
        username: socket.user.username
      });
      
      console.log(`${socket.user.username} left project ${projectId}`);
    });
    
    // File change events
    socket.on('code-change', async ({ projectId, fileName, content, cursorPosition }) => {
      const roomName = `project:${projectId}`;
      
      // Broadcast to all other clients in the room
      socket.to(roomName).emit('code-update', {
        userId: socket.user._id,
        username: socket.user.username,
        fileName,
        content,
        cursorPosition,
        timestamp: new Date()
      });
    });
    
    // Cursor position updates
    socket.on('cursor-move', ({ projectId, fileName, cursorPosition }) => {
      const roomName = `project:${projectId}`;
      
      // Broadcast cursor position to all other clients
      socket.to(roomName).emit('cursor-update', {
        userId: socket.user._id,
        username: socket.user.username,
        fileName,
        cursorPosition
      });
    });
    
    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.username}`);
      
      if (!socket.user.isAnonymous) {
        connectedUsers.delete(socket.user._id);
      }
      
      // Check if user is in any experiment rooms
      experimentRooms.forEach((room, roomKey) => {
        const participantId = socket.user.isAnonymous ? socket.id : socket.user._id;
        
        if (room.participants.has(participantId)) {
          const participant = room.participants.get(participantId);
          room.participants.delete(participantId);
          
          // Notify others
          io.to(roomKey).emit('participant-left', {
            id: participantId,
            username: participant.username
          });
          
          console.log(`${participant.username} left room ${roomKey} (disconnected)`);
          
          // If room is empty, remove it after some time
          if (room.participants.size === 0) {
            setTimeout(() => {
              if (experimentRooms.has(roomKey) && 
                  experimentRooms.get(roomKey).participants.size === 0) {
                experimentRooms.delete(roomKey);
                console.log(`Empty room removed: ${roomKey}`);
              }
            }, 30000); // 30 seconds delay
          }
        }
      });
      
      // Remove user from active projects
      activeProjects.forEach((users, projectId) => {
        if (users.has(socket.user._id)) {
          users.delete(socket.user._id);
          
          if (users.size === 0) {
            activeProjects.delete(projectId);
          }
          
          // Notify users in the project room
          const roomName = `project:${projectId}`;
          io.to(roomName).emit('user-left', {
            userId: socket.user._id,
            username: socket.user.username
          });
        }
      });
    });
  });
};

// Helper function to generate random password
function generateRandomPassword() {
  // Generate a random 6-character alphanumeric password
  return Math.random().toString(36).substring(2, 8);
}
