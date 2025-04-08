import { useState, useEffect } from 'react';
import { Menu, X, Users, Home, BookOpen, Beaker, Settings, ChevronDown, MessageCircle, Bot } from 'lucide-react';
import Assistant from './virtualLabAssistant';

export default function ResponsiveHeader({ isConnecting, isConnected, onAssistantToggle }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  
  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleAssistant = () => {
    setIsAssistantOpen(!isAssistantOpen);
    if (onAssistantToggle) {
      onAssistantToggle(!isAssistantOpen);
    }
  };
  
  const getStatusClass = () => {
    if (isConnecting) return "bg-yellow-400";
    return isConnected ? "bg-green-500" : "bg-red-500";
  };
  
  const getStatusText = () => {
    if (isConnecting) return "Connecting...";
    return isConnected ? "Connected" : "Disconnected";
  };

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white/80 backdrop-blur-sm'}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-2">
            <Beaker className="h-8 w-8 text-indigo-600" />
            <h1 className="text-xl font-bold text-gray-800">Virtual Lab Collaborative Room</h1>
          </div>
          
          {/* Connection Status (visible on all screens) */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
              <span className={`h-2 w-2 rounded-full mr-2 ${getStatusClass()}`}></span>
              <span className="text-gray-700">{getStatusText()}</span>
            </div>
            
            {/* Virtual Lab Assistant Button */}
            <button 
              onClick={toggleAssistant} 
              className={`p-2 rounded-full transition-colors ${isAssistantOpen ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'}`}
              aria-label="Toggle Virtual Lab Assistant"
              title="Virtual Lab Assistant"
            >
              <Bot className="h-5 w-5" />
            </button>
            <div className={`w-full h-150 absolute top-18 left-0 rounded-lg p-4 transition-all duration-300 ${isAssistantOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
             {isAssistantOpen && <Assistant/>}
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-gray-700 hover:text-indigo-600 flex items-center">
              <Home className="h-4 w-4 mr-1" /> Home
            </a>
            <a href="#" className="text-gray-700 hover:text-indigo-600 flex items-center">
              <BookOpen className="h-4 w-4 mr-1" /> Labs
            </a>
            
            {/* Dropdown menu */}
            <div className="relative">
              <button 
                onClick={toggleDropdown}
                className="text-gray-700 hover:text-indigo-600 flex items-center"
              >
                <Users className="h-4 w-4 mr-1" /> Collaborators
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50">Active Users</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50">Invite Members</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50">Permissions</a>
                </div>
              )}
            </div>
            
            <a href="#" className="text-gray-700 hover:text-indigo-600 flex items-center">
              <MessageCircle className="h-4 w-4 mr-1" /> Chat
            </a>
            <a href="#" className="text-gray-700 hover:text-indigo-600 flex items-center">
              <Settings className="h-4 w-4 mr-1" /> Settings
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-500 hover:text-indigo-600 focus:outline-none" 
            onClick={toggleMenu}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
        
        {/* Mobile Navigation Menu */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${isMenuOpen ? 'max-h-96 py-3' : 'max-h-0'}`}>
          <div className="flex flex-col space-y-3 pb-3">
            <a href="#" className="text-gray-700 hover:text-indigo-600 py-2 flex items-center">
              <Home className="h-5 w-5 mr-2" /> Home
            </a>
            <a href="#" className="text-gray-700 hover:text-indigo-600 py-2 flex items-center">
              <BookOpen className="h-5 w-5 mr-2" /> Labs
            </a>
            <a href="#" className="text-gray-700 hover:text-indigo-600 py-2 flex items-center">
              <Users className="h-5 w-5 mr-2" /> Collaborators
            </a>
            <a href="#" className="text-gray-700 hover:text-indigo-600 py-2 flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" /> Chat
            </a>
            <a href="#" className="text-gray-700 hover:text-indigo-600 py-2 flex items-center">
              <Settings className="h-5 w-5 mr-2" /> Settings
            </a>
            <a href="#" className="text-gray-700 hover:text-indigo-600 py-2 flex items-center">
              <Bot className="h-5 w-5 mr-2" /> Virtual Lab Assistant
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}