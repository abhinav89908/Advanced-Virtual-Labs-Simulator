import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Users, ArrowLeft, Share2, Copy, Clock } from 'lucide-react';
import MainLayout from '@/components/MainLayout';

import {
  initSocket,
  joinExperimentRoom,
  leaveExperimentRoom,
  updateEditorContent,
  updateCursorPosition,
  onParticipantJoined,
  onParticipantLeft,
  onEditorContentUpdate,
  onCursorPositionChanged
} from '@/lib/socket';

// Import experiment details
import { experimentDetails } from '@/data/experiments';

// Monaco editor decorations for showing other users' cursors
const createCursorDecorations = (monaco, user, position) => {
  const contentBefore = `<div class="monaco-cursor-decoration" style="background-color: ${getColorFromString(user.username)};">
    <div class="cursor-label" style="background-color: ${getColorFromString(user.username)};">${user.username}</div>
  </div>`;
  
  return [
    {
      range: new monaco.Range(
        position.lineNumber,
        position.column,
        position.lineNumber,
        position.column + 1
      ),
      options: {
        beforeContentClassName: 'cursor-decoration',
        before: {
          content: contentBefore,
        },
      },
    }
  ];
};

// Helper function to generate color from string
const getColorFromString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return '#' + '00000'.substring(0, 6 - c.length) + c;
};

const Room = () => {
  const { experimentId, roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const name = searchParams.get('name') || 'Anonymous';
  const password = searchParams.get('password') || '';
  
  const [participants, setParticipants] = useState([]);
  const [editorContent, setEditorContent] = useState('// Loading collaborative editor...');
  const [isJoining, setIsJoining] = useState(true);
  const [error, setError] = useState(null);
  const [cursors, setCursors] = useState({});
  
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef({});
  const isEditingRef = useRef(false);
  
  const experiment = experimentId && experimentDetails[experimentId];
  
  useEffect(() => {
    // Initialize socket and join room
    const socket = initSocket(null, name);
    
    const joinRoom = async () => {
      try {
        setIsJoining(true);
        const result = await joinExperimentRoom(experimentId, roomId, name, password);
        
        if (!result.success) {
          setError(result.message || 'Failed to join room');
          setIsJoining(false);
          return;
        }
        
        setParticipants(result.room.participants);
        setEditorContent(result.room.editorContent);
        setIsJoining(false);
        
        toast({
          title: "Room Joined",
          description: `You've joined the collaborative room for ${experiment?.title}`,
        });
      } catch (err) {
        console.error('Error joining room:', err);
        setError('Failed to connect to room. Please try again.');
        setIsJoining(false);
      }
    };
    
    joinRoom();
    
    // Set up event listeners
    const removeParticipantJoinedListener = onParticipantJoined((participant) => {
      setParticipants(prev => [...prev, participant]);
      
      toast({
        title: "New Participant",
        description: `${participant.username} has joined the room`,
      });
    });
    
    const removeParticipantLeftListener = onParticipantLeft((participant) => {
      setParticipants(prev => prev.filter(p => p.id !== participant.id));
      
      // Remove their cursor
      if (participant.id in cursors) {
        const newCursors = { ...cursors };
        delete newCursors[participant.id];
        setCursors(newCursors);
        
        // Remove decorations
        if (decorationsRef.current[participant.id]) {
          editorRef.current?.deltaDecorations(decorationsRef.current[participant.id], []);
          const newDecorations = { ...decorationsRef.current };
          delete newDecorations[participant.id];
          decorationsRef.current = newDecorations;
        }
      }
      
      toast({
        title: "Participant Left",
        description: `${participant.username} has left the room`,
        variant: "default",
      });
    });
    
    const removeContentUpdateListener = onEditorContentUpdate(({ content, userId, username }) => {
      if (!isEditingRef.current) {
        setEditorContent(content);
      }
    });
    
    const removeCursorUpdateListener = onCursorPositionChanged(({ position, userId, username }) => {
      setCursors(prev => ({
        ...prev,
        [userId]: { position, username, userId }
      }));
    });
    
    // Cleanup function
    return () => {
      leaveExperimentRoom(experimentId, roomId);
      removeParticipantJoinedListener && removeParticipantJoinedListener();
      removeParticipantLeftListener && removeParticipantLeftListener();
      removeContentUpdateListener && removeContentUpdateListener();
      removeCursorUpdateListener && removeCursorUpdateListener();
    };
  }, [experimentId, roomId, name, password, toast]);
  
  // Update cursor decorations whenever cursors state changes
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;
    
    Object.entries(cursors).forEach(([userId, cursor]) => {
      const newDecorations = createCursorDecorations(
        monacoRef.current,
        cursor,
        cursor.position
      );
      
      // Apply decorations
      const oldDecorations = decorationsRef.current[userId] || [];
      decorationsRef.current[userId] = editorRef.current.deltaDecorations(
        oldDecorations,
        newDecorations
      );
    });
  }, [cursors]);
  
  // Handle editor content changes
  const handleEditorChange = (value) => {
    isEditingRef.current = true;
    setEditorContent(value);
    updateEditorContent(experimentId, roomId, value);
    setTimeout(() => {
      isEditingRef.current = false;
    }, 100);
  };
  
  // Handle editor cursor position changes
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    
    // Add CSS for cursor decorations
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .monaco-cursor-decoration {
        position: absolute;
        width: 2px;
        height: 18px;
        pointer-events: none;
      }
      .cursor-label {
        position: absolute;
        top: -18px;
        left: 0;
        font-size: 10px;
        padding: 2px 4px;
        white-space: nowrap;
        color: white;
        border-radius: 3px;
      }
    `;
    document.head.appendChild(styleElement);
    
    // Listen for cursor position changes
    editor.onDidChangeCursorPosition(e => {
      updateCursorPosition(experimentId, roomId, e.position);
    });
  };
  
  const handleCopyRoomLink = () => {
    const url = `${window.location.origin}/room/${experimentId}/${roomId}`;
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Link Copied",
        description: "Room link copied to clipboard"
      });
    });
  };
  
  const handleCopyPassword = () => {
    navigator.clipboard.writeText(password).then(() => {
      toast({
        title: "Password Copied",
        description: "Room password copied to clipboard"
      });
    });
  };
  
  if (error) {
    return (
      <MainLayout>
        <div className="container py-16 text-center">
          <h2 className="text-2xl font-bold text-red-500">Error Joining Room</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate(`/experiment/${experimentId}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </div>
      </MainLayout>
    );
  }
  
  if (isJoining) {
    return (
      <MainLayout>
        <div className="container py-16 text-center">
          <h2 className="text-2xl font-bold">Joining Room...</h2>
          <p className="text-muted-foreground mb-6">Please wait while we connect you to the collaborative room.</p>
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  if (!experiment) {
    return (
      <MainLayout>
        <div className="container py-8 text-center">
          <h2 className="text-2xl font-bold">Experiment not found</h2>
          <p className="text-muted-foreground mb-4">The experiment you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')}>Return to Experiments</Button>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="container py-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Button variant="outline" onClick={() => navigate(`/experiment/${experimentId}`)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Exit Room
            </Button>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold">{experiment.title}</h1>
            <p className="text-sm text-muted-foreground">Room: {roomId}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyRoomLink}>
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopyPassword}>
              <Copy className="mr-2 h-4 w-4" /> Password
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card className="border rounded-lg shadow-sm">
              <CardContent className="p-0">
                <div className="h-[600px] w-full">
                  <Editor
                    height="600px"
                    defaultLanguage="javascript"
                    value={editorContent}
                    onChange={handleEditorChange}
                    onMount={handleEditorDidMount}
                    options={{
                      automaticLayout: true,
                      minimap: { enabled: false },
                      lineNumbers: 'on',
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="border rounded-lg shadow-sm">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    Participants
                  </h3>
                  <Badge variant="outline">{participants.length}</Badge>
                </div>
              </div>
              <ScrollArea className="h-[300px]">
                <div className="p-4">
                  <ul className="space-y-4">
                    {participants.map((participant) => (
                      <li key={participant.id} className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback style={{ backgroundColor: getColorFromString(participant.username) }}>
                            {participant.username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{participant.username}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Joined {new Date(participant.joinedAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollArea>
            </Card>
            
            <div className="mt-6">
              <Card className="border rounded-lg shadow-sm">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-medium">Experiment Details</h3>
                </div>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Procedure</h4>
                  <ol className="space-y-1 list-decimal list-inside text-sm">
                    {experiment.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Room;
