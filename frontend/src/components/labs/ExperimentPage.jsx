import { useState, useEffect } from 'react';
import { Mic, BookOpen, Lightbulb, MonitorPlay, MessageSquare, Save, Send } from 'lucide-react';

// This would come from your backend or context in a real application
const sampleLabData = {
  id: "exp-123",
  title: "Pendulum Motion Experiment",
  labManual: "# Pendulum Motion Experiment\n\n## Objective\nTo study the simple pendulum motion and verify the relationship between period and length.\n\n## Theory\nA simple pendulum consists of a small bob suspended by a light string. When displaced and released, it oscillates about its equilibrium position.\n\n## Procedure\n1. Measure the length of the pendulum\n2. Displace the pendulum by a small angle\n3. Release and measure the time for 20 oscillations\n4. Calculate the period of oscillation\n5. Repeat with different lengths\n\n## Observations\nRecord your measurements in the table provided in the Results section.",
  tips: "- Ensure small oscillations (less than 15°) for the small-angle approximation to be valid\n- Use a stopwatch with good precision\n- Start timing when the pendulum passes through the equilibrium position\n- Avoid parallax error when measuring lengths",
  simulationUrl: "https://example.com/pendulum-simulation"
};

const ExperimentPage = () => {
  const [activeTab, setActiveTab] = useState('manual');
  const [messages, setMessages] = useState([
    { user: 'System', text: 'Welcome to the lab chat! Connect with others working on this experiment.', timestamp: new Date() }
  ]);
  const [userMessage, setUserMessage] = useState('');
  const [connectedUsers, setConnectedUsers] = useState(['John', 'Maria']);
  const [results, setResults] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [assistantMessage, setAssistantMessage] = useState('Hello! I am your lab assistant. Ask me anything about this experiment.');

  // This would be replaced with actual socket.io implementation
  const simulateNewMessage = () => {
    const randomUser = connectedUsers[Math.floor(Math.random() * connectedUsers.length)];
    if (Math.random() > 0.7) {
      const newMessage = {
        user: randomUser,
        text: `I'm working on step ${Math.floor(Math.random() * 5) + 1} now.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
    }
  };

  useEffect(() => {
    const interval = setInterval(simulateNewMessage, 15000);
    return () => clearInterval(interval);
  }, [connectedUsers]);

  const handleSendMessage = () => {
    if (userMessage.trim() === '') return;
    
    const newMessage = {
      user: 'You',
      text: userMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setUserMessage('');
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      // Simulate a response from the assistant after "listening"
      setTimeout(() => {
        setAssistantMessage("The pendulum's period T is related to its length L by the formula T = 2π√(L/g), where g is the acceleration due to gravity. Make sure to measure the length from the pivot point to the center of the bob.");
        setIsListening(false);
      }, 3000);
    }
  };

  const saveResults = () => {
    alert("Results saved! (In a real app, this would save to database)");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-700 text-white p-4">
        <h1 className="text-xl font-bold">{sampleLabData.title}</h1>
      </header>
      
      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left side - Lab content */}
        <div className="flex flex-col w-3/4 p-4 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b">
            <button 
              className={`flex items-center px-4 py-2 ${activeTab === 'manual' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`} 
              onClick={() => setActiveTab('manual')}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Lab Manual
            </button>
            <button 
              className={`flex items-center px-4 py-2 ${activeTab === 'tips' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`} 
              onClick={() => setActiveTab('tips')}
            >
              <Lightbulb className="mr-2 h-4 w-4" />
              Tips
            </button>
            <button 
              className={`flex items-center px-4 py-2 ${activeTab === 'simulation' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`} 
              onClick={() => setActiveTab('simulation')}
            >
              <MonitorPlay className="mr-2 h-4 w-4" />
              Simulation
            </button>
            <button 
              className={`flex items-center px-4 py-2 ${activeTab === 'assistant' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`} 
              onClick={() => setActiveTab('assistant')}
            >
              <Mic className="mr-2 h-4 w-4" />
              Lab Assistant
            </button>
          </div>
          
          {/* Tab content */}
          <div className="flex-1 overflow-auto p-4">
            {activeTab === 'manual' && (
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: sampleLabData.labManual.replace(/\n/g, '<br/>') }} />
              </div>
            )}
            
            {activeTab === 'tips' && (
              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold mb-4">Tips & Tricks</h2>
                <ul className="list-disc pl-5">
                  {sampleLabData.tips.split('\n').map((tip, index) => (
                    <li key={index} className="mb-2">{tip.replace('- ', '')}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {activeTab === 'simulation' && (
              <div className="h-full flex flex-col items-center justify-center">
                <div className="bg-gray-200 w-full h-64 md:h-96 flex items-center justify-center border border-gray-300 rounded">
                  <p className="text-gray-600">Simulation would load here from: {sampleLabData.simulationUrl}</p>
                </div>
                <p className="mt-4 text-gray-700">Use the simulation controls to adjust parameters and observe the results</p>
              </div>
            )}
            
            {activeTab === 'assistant' && (
              <div className="flex flex-col h-full">
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="text-gray-800">{assistantMessage}</p>
                </div>
                <div className="flex-1"></div>
                <div className="flex items-center">
                  <button 
                    className={`flex items-center justify-center p-3 rounded-full ${isListening ? 'bg-red-500' : 'bg-blue-500'} text-white mr-4`}
                    onClick={toggleListening}
                  >
                    <Mic className="h-5 w-5" />
                  </button>
                  <p className="text-gray-600">{isListening ? 'Listening... Speak your question' : 'Click the microphone to ask a question'}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Results section */}
          <div className="bg-white p-4 border rounded-md mt-4">
            <h3 className="text-lg font-medium mb-2">Results</h3>
            <textarea 
              className="w-full h-32 p-2 border rounded" 
              placeholder="Record your experiment results here..." 
              value={results} 
              onChange={(e) => setResults(e.target.value)}
            ></textarea>
            <button 
              className="mt-2 bg-green-600 text-white px-4 py-2 rounded flex items-center"
              onClick={saveResults}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Results
            </button>
          </div>
        </div>
        
        {/* Right side - Chat */}
        <div className="w-1/4 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-3 bg-gray-100 border-b">
            <h3 className="font-medium flex items-center">
              <MessageSquare className="mr-2 h-4 w-4" />
              Live Chat ({connectedUsers.length + 1} users)
            </h3>
          </div>
          
          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-3">
            {messages.map((msg, index) => (
              <div key={index} className="mb-3">
                <div className="flex items-center">
                  <span className="font-medium text-sm">{msg.user}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-gray-800 text-sm">{msg.text}</p>
              </div>
            ))}
          </div>
          
          {/* Chat input */}
          <div className="p-3 border-t">
            <div className="flex">
              <input
                type="text"
                className="flex-1 border rounded-l-md px-3 py-2"
                placeholder="Type your message..."
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button 
                className="bg-blue-600 text-white rounded-r-md px-3 py-2"
                onClick={handleSendMessage}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperimentPage;