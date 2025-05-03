
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from './SocketContext';
import { useToast } from '@/components/ui/use-toast';

export interface User {
  id: string;
  name: string;
  avatar: string;
  isActive: boolean;
}

export interface Room {
  id: string;
  name: string;
  users: User[];
  hasPassword: boolean;
  content: string;
}

interface RoomContextType {
  currentRoom: Room | null;
  availableRooms: Room[];
  users: User[];
  joinRoom: (roomId: string, password?: string) => void;
  createRoom: (name: string, password?: string) => void;
  leaveRoom: () => void;
  updateContent: (content: string) => void;
  content: string;
  isJoining: boolean;
  isCreating: boolean;
}

const RoomContext = createContext<RoomContextType>({
  currentRoom: null,
  availableRooms: [],
  users: [],
  joinRoom: () => {},
  createRoom: () => {},
  leaveRoom: () => {},
  updateContent: () => {},
  content: '',
  isJoining: false,
  isCreating: false,
});

export const useRoom = () => useContext(RoomContext);

const mockUsers: User[] = [
  { id: '1', name: 'Alex Kim', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', isActive: true },
  { id: '2', name: 'Jamie Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jamie', isActive: true },
  { id: '3', name: 'Taylor Singh', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor', isActive: false },
];

const mockRooms: Room[] = [
  { id: '1', name: 'Titration Lab', users: mockUsers.slice(0, 2), hasPassword: false, content: '# Titration Lab\n\nThis is a collaborative workspace for the titration experiment.' },
  { id: '2', name: 'Spectrophotometry', users: mockUsers.slice(1), hasPassword: true, content: '# Spectrophotometry\n\nThis is a collaborative workspace for the spectrophotometry experiment.' },
];

export const RoomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { socket, connected } = useSocket();
  const { toast } = useToast();
  
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [availableRooms, setAvailableRooms] = useState<Room[]>(mockRooms);
  const [users, setUsers] = useState<User[]>([]);
  const [content, setContent] = useState<string>('');
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!socket || !connected) return;

    // Listen for room updates
    socket.on('room:list', (rooms: Room[]) => {
      setAvailableRooms(rooms);
    });

    socket.on('room:joined', (room: Room) => {
      setCurrentRoom(room);
      setUsers(room.users);
      setContent(room.content);
      setIsJoining(false);
      toast({
        title: "Room Joined",
        description: `You have joined ${room.name}`,
      });
    });

    socket.on('room:created', (room: Room) => {
      setCurrentRoom(room);
      setUsers(room.users);
      setContent(room.content);
      setIsCreating(false);
      toast({
        title: "Room Created",
        description: `${room.name} has been created`,
      });
    });

    socket.on('room:left', () => {
      setCurrentRoom(null);
      setUsers([]);
      setContent('');
      toast({
        title: "Room Left",
        description: "You have left the room",
      });
    });

    socket.on('room:user_joined', (user: User) => {
      setUsers(prev => [...prev, user]);
      toast({
        title: "User Joined",
        description: `${user.name} has joined the room`,
      });
    });

    socket.on('room:user_left', (userId: string) => {
      setUsers(prev => prev.filter(user => user.id !== userId));
      toast({
        title: "User Left",
        description: "A user has left the room",
      });
    });

    socket.on('room:content_updated', (newContent: string) => {
      setContent(newContent);
    });

    socket.on('error', (error: string) => {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      setIsJoining(false);
      setIsCreating(false);
    });

    // Initial room list request
    socket.emit('room:list');

    return () => {
      socket.off('room:list');
      socket.off('room:joined');
      socket.off('room:created');
      socket.off('room:left');
      socket.off('room:user_joined');
      socket.off('room:user_left');
      socket.off('room:content_updated');
      socket.off('error');
    };
  }, [socket, connected, toast]);

  // For the mock server, we'll simulate socket behavior
  const joinRoom = (roomId: string, password?: string) => {
    setIsJoining(true);
    // In a real app, this would be handled by the socket
    setTimeout(() => {
      const room = mockRooms.find(r => r.id === roomId);
      if (!room) {
        toast({
          title: "Error",
          description: "Room not found",
          variant: "destructive",
        });
        setIsJoining(false);
        return;
      }
      
      if (room.hasPassword && password !== '1234') { // Mock password check
        toast({
          title: "Error",
          description: "Incorrect password",
          variant: "destructive",
        });
        setIsJoining(false);
        return;
      }
      
      const currentUser = { 
        id: 'current-user', 
        name: 'You', 
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You', 
        isActive: true 
      };
      
      const updatedRoom = {
        ...room,
        users: [...room.users, currentUser]
      };
      
      setCurrentRoom(updatedRoom);
      setUsers(updatedRoom.users);
      setContent(updatedRoom.content);
      setIsJoining(false);
      
      toast({
        title: "Room Joined",
        description: `You have joined ${updatedRoom.name}`,
      });
    }, 1000);
  };

  const createRoom = (name: string, password?: string) => {
    setIsCreating(true);
    // In a real app, this would be handled by the socket
    setTimeout(() => {
      const currentUser = { 
        id: 'current-user', 
        name: 'You', 
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You', 
        isActive: true 
      };
      
      const newRoom: Room = {
        id: `new-${Date.now()}`,
        name,
        users: [currentUser],
        hasPassword: !!password,
        content: `# ${name}\n\nWelcome to your new lab workspace! Start collaborating with your team.`
      };
      
      setCurrentRoom(newRoom);
      setUsers(newRoom.users);
      setContent(newRoom.content);
      setAvailableRooms(prev => [...prev, newRoom]);
      setIsCreating(false);
      
      toast({
        title: "Room Created",
        description: `${newRoom.name} has been created`,
      });
    }, 1000);
  };

  const leaveRoom = () => {
    if (!currentRoom) return;
    
    // In a real app, this would be handled by the socket
    setCurrentRoom(null);
    setUsers([]);
    setContent('');
    
    toast({
      title: "Room Left",
      description: "You have left the room",
    });
  };

  const updateContent = (newContent: string) => {
    setContent(newContent);
    
    // In a real app, this would be emitted to the socket
    // socket?.emit('room:update_content', newContent);
  };

  return (
    <RoomContext.Provider
      value={{
        currentRoom,
        availableRooms,
        users,
        joinRoom,
        createRoom,
        leaveRoom,
        updateContent,
        content,
        isJoining,
        isCreating,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};
