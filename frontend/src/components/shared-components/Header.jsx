import { useState, useEffect } from 'react';
import { Menu, X, Users, Home, BookOpen, Beaker, Settings, ChevronDown, MessageCircle, Bot } from 'lucide-react';
import Assistant from './VirtualLabAssistant';

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

  // Close dropdown when clicking outside
  useEffect(() => {
    if (isDropdownOpen) {
      const handleClickOutside = (e) => {
        if (!e.target.closest('.dropdown-container')) {
          setIsDropdownOpen(false);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isDropdownOpen]);

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
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Beaker className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
            <h1 className="text-base sm:text-xl font-bold text-gray-800 truncate">
              <span className="hidden xs:inline">Virtual Lab</span> Collaborative Room
            </h1>
          </div>
          
          {/* Connection Status (visible on all screens) */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            <div className="hidden xs:flex items-center bg-gray-100 rounded-full px-2 sm:px-3 py-1 text-xs sm:text-sm">
              <span className={`h-2 w-2 rounded-full mr-2 ${getStatusClass()}`}></span>
              <span className="text-gray-700">{getStatusText()}</span>
            </div>
            
            {/* Only show dot on smallest screens */}
            <div className="flex xs:hidden items-center">
              <span className={`h-3 w-3 rounded-full border border-gray-300 ${getStatusClass()}`}></span>
            </div>
            
            {/* Virtual Lab Assistant Button */}
            <button 
              onClick={toggleAssistant} 
              className={`p-1 sm:p-2 rounded-full transition-colors ${isAssistantOpen ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'}`}
              aria-label="Toggle Virtual Lab Assistant"
              title="Virtual Lab Assistant"
            >
              <Bot className="h-5 w-5" />
            </button>
            <div className={`fixed inset-0 sm:absolute sm:inset-auto sm:top-16 sm:right-0 sm:w-[90vw] sm:max-w-md sm:h-[80vh] bg-white sm:m-2 rounded-lg shadow-2xl transition-opacity duration-300 z-50 ${isAssistantOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
             {isAssistantOpen && (
              <div className="h-full">
                <button 
                  onClick={toggleAssistant}
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 z-10 bg-white/80 rounded-full p-1"
                >
                  <X className="h-5 w-5" />
                </button>
                <Assistant />
              </div>
             )}
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
            <div className="relative dropdown-container">
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