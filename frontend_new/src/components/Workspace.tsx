
import React, { useState } from 'react';
import { useRoom } from '@/context/RoomContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Users } from 'lucide-react';
import Editor from '@/components/Editor';
import UsersPanel from '@/components/UsersPanel';
import LabAssistant from '@/components/LabAssistant';

interface WorkspaceProps {
  onExit: () => void;
}

const Workspace: React.FC<WorkspaceProps> = ({ onExit }) => {
  const { currentRoom, leaveRoom, users } = useRoom();
  const [showUsers, setShowUsers] = useState(false);

  const handleLeave = () => {
    leaveRoom();
    onExit();
  };

  if (!currentRoom) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">{currentRoom.name}</h2>
          <p className="text-sm text-muted-foreground">
            {users.length} participant{users.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowUsers(!showUsers)}
            className="flex items-center gap-1"
          >
            <Users size={16} />
            <span className="hidden sm:inline">Participants</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleLeave}
            className="flex items-center gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Leave</span>
          </Button>
        </div>
      </div>
      
      <div className="lab-workspace flex gap-4">
        <div className={`flex-1 transition-all ${showUsers ? 'md:mr-64' : ''}`}>
          <Tabs defaultValue="editor" className="h-full flex flex-col">
            <TabsList className="self-start mb-4">
              <TabsTrigger value="editor">Workspace</TabsTrigger>
              <TabsTrigger value="assistant">Lab Assistant</TabsTrigger>
            </TabsList>
            
            <TabsContent value="editor" className="flex-1 h-full">
              <Editor />
            </TabsContent>
            
            <TabsContent value="assistant" className="flex-1 overflow-auto">
              <LabAssistant />
            </TabsContent>
          </Tabs>
        </div>
        
        <UsersPanel isOpen={showUsers} onClose={() => setShowUsers(false)} />
      </div>
    </div>
  );
};

export default Workspace;
