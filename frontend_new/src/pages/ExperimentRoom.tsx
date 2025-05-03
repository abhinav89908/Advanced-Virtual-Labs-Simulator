import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Lock, Users, Loader2 } from 'lucide-react';
import MainLayout from '@/components/MainLayout';
import { checkRoomExists } from '@/lib/socket';

// Add this type definition at the top of the file, below the imports
interface RoomExistsResponse {
  exists: boolean;
}

// Mock experiment details
const experimentDetails = {
  'titration': {
    title: 'Acid-Base Titration',
    description: 'In this lab, you will learn to perform a titration to determine the concentration of an unknown acid or base solution.',
    image: 'public/lovable-uploads/801f2726-d483-492c-89e0-30242037bc63.png',
    steps: [
      'Prepare the burette with a standard solution',
      'Add indicator to the unknown solution',
      'Slowly add the standard solution until the endpoint is reached',
      'Calculate the concentration of the unknown solution'
    ]
  },
  'spectrophotometry': {
    title: 'Spectrophotometry',
    description: 'This lab teaches you to use a spectrophotometer to determine the concentration of colored compounds in solution.',
    image: 'public/lovable-uploads/153f5b10-4478-4bce-ad82-cd0407bf05b4.png',
    steps: [
      'Prepare standard solutions of known concentration',
      'Measure absorbance of standards at appropriate wavelength',
      'Create a calibration curve',
      'Measure absorbance of unknown sample',
      'Calculate concentration using Beer-Lambert Law'
    ]
  },
  'dna-extraction': {
    title: 'DNA Extraction',
    description: 'Extract DNA from plant cells and visualize the results using simple laboratory equipment.',
    image: '/placeholder.svg',
    steps: [
      'Prepare plant tissue sample',
      'Break down cell walls and membranes',
      'Separate DNA from cellular components',
      'Precipitate DNA using cold alcohol',
      'Observe and collect the DNA'
    ]
  },
  'pendulum': {
    title: 'Simple Pendulum',
    description: 'Investigate the relationship between pendulum length and period to calculate gravitational acceleration.',
    image: '/placeholder.svg',
    steps: [
      'Set up pendulum with adjustable length',
      'Measure time for multiple oscillations',
      'Calculate period for different pendulum lengths',
      'Plot relationship between length and period squared',
      'Calculate gravitational acceleration from slope'
    ]
  },
  'microbiology': {
    title: 'Bacterial Culture',
    description: 'Learn aseptic techniques to culture and identify bacterial colonies.',
    image: '/placeholder.svg',
    steps: [
      'Prepare sterile culture media',
      'Collect and dilute bacterial samples',
      'Plate samples using streak technique',
      'Incubate plates under appropriate conditions',
      'Observe and identify bacterial colonies'
    ]
  },
  'circuits': {
    title: 'Electric Circuits',
    description: 'Build and analyze series and parallel circuits to understand Ohm\'s law.',
    image: '/placeholder.svg',
    steps: [
      'Construct series circuit with resistors',
      'Measure current and voltage across components',
      'Construct parallel circuit with same components',
      'Compare measurements between circuit types',
      'Calculate unknown resistances using Ohm\'s law'
    ]
  }
};

const ExperimentRoom = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [password, setPassword] = useState('');
  const [roomExists, setRoomExists] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const experiment = id && experimentDetails[id as keyof typeof experimentDetails];
  
  // Check if room exists when roomId changes
  useEffect(() => {
    const checkRoom = async () => {
      if (!roomId.trim()) {
        setRoomExists(false);
        return;
      }
      
      setIsChecking(true);
      try {
        const result = await checkRoomExists(id, roomId) as RoomExistsResponse;
        setRoomExists(result.exists);
      } catch (error) {
        console.error('Error checking room:', error);
      } finally {
        setIsChecking(false);
      }
    };
    
    // Add debounce to avoid too many requests
    const timeoutId = setTimeout(checkRoom, 500);
    return () => clearTimeout(timeoutId);
  }, [roomId, id]);
  
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
  
  const handleJoinRoom = () => {
    if (!name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name to join the room",
        variant: "destructive"
      });
      return;
    }
    
    if (!roomId.trim()) {
      toast({
        title: "Room ID Required",
        description: "Please enter a room ID to join or create a room",
        variant: "destructive"
      });
      return;
    }
    
    // If room exists, password is required
    if (roomExists && !password.trim()) {
      toast({
        title: "Password Required",
        description: "This room already exists. Please enter the room password.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Navigate to the experiment room
    navigate(`/room/${id}/${roomId}?name=${encodeURIComponent(name)}&password=${encodeURIComponent(password)}`);
  };
  
  return (
    <MainLayout>
      <div className="container py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h1 className="text-3xl font-bold mb-2">{experiment.title}</h1>
            <p className="text-muted-foreground mb-6">{experiment.description}</p>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Procedure Overview</h2>
              <ol className="space-y-2 list-decimal list-inside">
                {experiment.steps.map((step, index) => (
                  <li key={index} className="text-sm">{step}</li>
                ))}
              </ol>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">Before You Begin</h2>
              <p className="text-sm text-muted-foreground">
                This is a collaborative experiment. You can join an existing room to work with others,
                or create a new room and invite collaborators. All actions performed in the lab will be
                synchronized for everyone in the room.
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Join a Collaborative Room</CardTitle>
                <CardDescription>Connect with others in a shared virtual workspace</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="roomId">Room ID</Label>
                  <div className="relative">
                    <Input
                      id="roomId"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      placeholder="Enter a unique room identifier"
                      disabled={isSubmitting}
                    />
                    {isChecking && (
                      <div className="absolute right-2 top-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    {roomExists ? (
                      <>
                        <Users className="h-3 w-3" />
                        Room exists - you'll be joining others
                      </>
                    ) : (
                      <>
                        Enter a unique ID to create a new room or join an existing one
                      </>
                    )}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="password" className="flex items-center gap-1">
                      Room Password {roomExists && <span className="text-rose-500">*</span>}
                      {roomExists && <Lock className="h-3 w-3 text-muted-foreground" />}
                    </Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={roomExists ? "Enter room password" : "Create a password (optional)"}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    {roomExists 
                      ? "Password required to join this room" 
                      : "Leave blank to generate a random password"}
                  </p>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={handleJoinRoom}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : roomExists ? "Join Room" : "Create Room"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ExperimentRoom;
