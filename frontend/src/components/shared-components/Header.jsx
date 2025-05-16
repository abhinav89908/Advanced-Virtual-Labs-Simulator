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
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-gray-900/80 backdrop-blur-md shadow-lg shadow-black/20' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-2">
            <Beaker className="h-8 w-8 text-teal-400" />
            <h1 className="text-xl font-bold text-white">Virtual Labs</h1>
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-full px-3 py-1 text-sm">
              <span className={`h-2 w-2 rounded-full mr-2 ${getStatusClass()}`}></span>
              <span className="text-gray-300">{getStatusText()}</span>
            </div>
            
            {/* Virtual Lab Assistant Button */}
            <button 
              onClick={toggleAssistant} 
              className={`p-2 rounded-full transition-all duration-300 ${
                isAssistantOpen 
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' 
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-teal-400 border border-gray-700/50'
              }`}
            >
              <Bot className="h-5 w-5" />
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {[
              { href: "/", icon: <Home className="h-4 w-4 mr-1" />, label: "Home" },
              { href: "/labs", icon: <BookOpen className="h-4 w-4 mr-1" />, label: "Labs" },
              { href: "/chat", icon: <MessageCircle className="h-4 w-4 mr-1" />, label: "Chat" },
              { href: "#", icon: <Settings className="h-4 w-4 mr-1" />, label: "Settings" }
            ].map(({ href, icon, label }) => (
              <a 
                key={href} 
                href={href} 
                className="text-gray-400 hover:text-teal-400 flex items-center transition-colors duration-300"
              >
                {icon} {label}
              </a>
            ))}
            
            {/* Dropdown menu */}
            <div className="relative">
              <button 
                onClick={toggleDropdown}
                className="text-gray-400 hover:text-teal-400 flex items-center transition-colors duration-300"
              >
                <Users className="h-4 w-4 mr-1" /> Groups
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800/95 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-xl py-1 z-50">
                  {["Batch - 2025", "Batch - 2024", "Batch - 2023"].map((batch) => (
                    <a 
                      key={batch}
                      href="#" 
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-teal-500/10 hover:text-teal-400 transition-colors duration-300"
                    >
                      {batch}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-400 hover:text-teal-400 transition-colors duration-300" 
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        
        {/* Mobile Navigation Menu */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${
          isMenuOpen ? 'max-h-96 py-3' : 'max-h-0'
        }`}>
          <div className="flex flex-col space-y-3 pb-3">
            {/* Mobile menu items */}
            {[
              { href: "/", icon: <Home className="h-5 w-5 mr-2" />, label: "Home" },
              { href: "/labs", icon: <BookOpen className="h-5 w-5 mr-2" />, label: "Labs" },
              { href: "#", icon: <Users className="h-5 w-5 mr-2" />, label: "Collaborators" },
              { href: "/chat", icon: <MessageCircle className="h-5 w-5 mr-2" />, label: "Chat" },
              { href: "#", icon: <Settings className="h-5 w-5 mr-2" />, label: "Settings" },
              { href: "#", icon: <Bot className="h-5 w-5 mr-2" />, label: "Virtual Lab Assistant" }
            ].map(({ href, icon, label }) => (
              <a 
                key={href}
                href={href} 
                className="text-gray-400 hover:text-teal-400 py-2 flex items-center transition-colors duration-300"
              >
                {icon} {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}