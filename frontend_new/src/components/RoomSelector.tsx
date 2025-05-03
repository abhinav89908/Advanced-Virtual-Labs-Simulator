
import React, { useState, useEffect } from 'react';
import { useRoom } from '@/context/RoomContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Users } from 'lucide-react';

interface RoomSelectorProps {
  onRoomJoined: () => void;
  experimentId?: string;
  initialName?: string;
  initialRoomId?: string;
  initialPassword?: string;
}

const RoomSelector: React.FC<RoomSelectorProps> = ({ 
  onRoomJoined, 
  experimentId,
  initialName = '',
  initialRoomId = '',
  initialPassword = ''
}) => {
  const { availableRooms, joinRoom, createRoom, isJoining, isCreating } = useRoom();
  const [selectedRoomId, setSelectedRoomId] = useState<string>(initialRoomId);
  const [password, setPassword] = useState<string>(initialPassword);
  const [newRoomName, setNewRoomName] = useState<string>(initialRoomId || '');
  const [newRoomPassword, setNewRoomPassword] = useState<string>(initialPassword);
  const [userName, setUserName] = useState<string>(initialName);
  
  // If all initial values are provided, try to auto-join
  useEffect(() => {
    if (initialName && initialRoomId && !isJoining && !isCreating) {
      const roomExists = availableRooms.some(room => room.id === initialRoomId);
      
      if (roomExists) {
        joinRoom(initialRoomId, initialPassword);
        onRoomJoined();
      } else if (initialRoomId) {
        createRoom(initialRoomId, initialPassword);
        onRoomJoined();
      }
    }
  }, [initialName, initialRoomId, initialPassword, availableRooms, joinRoom, createRoom, isJoining, isCreating, onRoomJoined]);

  const handleJoinRoom = () => {
    if (!userName) return;
    joinRoom(selectedRoomId, password);
    onRoomJoined();
  };

  const handleCreateRoom = () => {
    if (!userName || !newRoomName.trim()) return;
    createRoom(newRoomName, newRoomPassword);
    onRoomJoined();
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-240px)]">
      <Card className="w-full max-w-lg shadow-lg animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {experimentId ? `Join ${experimentId.charAt(0).toUpperCase() + experimentId.slice(1)} Experiment` : 'Virtual Lab Simulator'}
          </CardTitle>
          <CardDescription>Join or create a virtual lab room</CardDescription>
        </CardHeader>
        
        <Tabs defaultValue={initialRoomId && !availableRooms.some(room => room.id === initialRoomId) ? 'create' : 'join'} className="px-6">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="join">Join Room</TabsTrigger>
            <TabsTrigger value="create">Create Room</TabsTrigger>
          </TabsList>
          
          <TabsContent value="join">
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userName">Your Name</Label>
                <Input
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="room">Select a room</Label>
                <div className="grid gap-3">
                  {availableRooms.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground border rounded-md">
                      No rooms available. Create a new one!
                    </div>
                  ) : (
                    availableRooms.map((room) => (
                      <div
                        key={room.id}
                        onClick={() => setSelectedRoomId(room.id)}
                        className={`p-3 border rounded-md cursor-pointer flex justify-between items-center hover:border-primary transition-colors ${
                          selectedRoomId === room.id ? 'border-primary bg-primary/5' : ''
                        }`}
                      >
                        <div>
                          <p className="font-medium">{room.name}</p>
                          <div className="flex items-center text-sm text-muted-foreground gap-1 mt-1">
                            <Users size={14} />
                            <span>{room.users.length} participants</span>
                          </div>
                        </div>
                        {room.hasPassword && <Lock size={16} className="text-muted-foreground" />}
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              {selectedRoomId && availableRooms.find(room => room.id === selectedRoomId)?.hasPassword && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter room password"
                  />
                </div>
              )}
            </CardContent>
            
            <CardFooter>
              <Button 
                className="w-full"
                onClick={handleJoinRoom}
                disabled={!selectedRoomId || !userName || isJoining}
              >
                {isJoining ? 'Joining...' : 'Join Room'}
              </Button>
            </CardFooter>
          </TabsContent>
          
          <TabsContent value="create">
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="creatorName">Your Name</Label>
                <Input
                  id="creatorName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="roomName">Room Name</Label>
                <Input
                  id="roomName"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Enter room name"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="roomPassword">Password (Optional)</Label>
                </div>
                <Input
                  id="roomPassword"
                  type="password"
                  value={newRoomPassword}
                  onChange={(e) => setNewRoomPassword(e.target.value)}
                  placeholder="Create a password"
                />
                <p className="text-sm text-muted-foreground">
                  Leave blank for a public room.
                </p>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                className="w-full"
                onClick={handleCreateRoom}
                disabled={!newRoomName.trim() || !userName || isCreating}
              >
                {isCreating ? 'Creating...' : 'Create Room'}
              </Button>
            </CardFooter>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default RoomSelector;
