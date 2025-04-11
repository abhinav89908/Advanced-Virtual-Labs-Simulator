
import { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { SocketProvider } from '@/context/SocketContext';
import { RoomProvider } from '@/context/RoomContext';
import { LabAssistantProvider } from '@/context/LabAssistantContext';
import RoomSelector from '@/components/RoomSelector';
import Workspace from '@/components/Workspace';
import MainLayout from '@/components/MainLayout';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const [isConfigured, setIsConfigured] = useState(false);
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get URL parameters
  const queryParams = new URLSearchParams(location.search);
  const userName = queryParams.get('name');
  const roomId = queryParams.get('roomId');
  const password = queryParams.get('password');
  const experimentId = params.experimentId;
  
  // Auto-join room if URL parameters are present
  useEffect(() => {
    if (userName && roomId && !isConfigured) {
      // In a real implementation, you'd connect to the room here
      setIsConfigured(true);
      
      toast({
        title: "Room Joined",
        description: `Welcome to the ${experimentId} experiment, ${userName}!`,
      });
    }
  }, [userName, roomId, experimentId, isConfigured, toast]);

  return (
    <SocketProvider>
      <RoomProvider>
        <LabAssistantProvider>
          <MainLayout>
            <div className="container py-6">
              {!isConfigured ? (
                <RoomSelector 
                  onRoomJoined={() => setIsConfigured(true)} 
                  experimentId={experimentId}
                  initialName={userName || ''}
                  initialRoomId={roomId || ''}
                  initialPassword={password || ''}
                />
              ) : (
                <Workspace 
                  onExit={() => {
                    setIsConfigured(false);
                    navigate(`/experiment/${experimentId}`);
                  }} 
                />
              )}
            </div>
          </MainLayout>
        </LabAssistantProvider>
      </RoomProvider>
    </SocketProvider>
  );
};

export default Index;
