import React, { useState, useEffect, useContext } from 'react';
import { Menu, X, Users, Home, BookOpen, Beaker, Settings, ChevronDown, MessageCircle, Bot, User, LogOut, UserCircle, Shield } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../hooks/userContext';

const Header = ({ isConnecting, isConnected, onAssistantToggle }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const { user, logout, isAdmin } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserDropdownOpen || isDropdownOpen) {
        setIsUserDropdownOpen(false);
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserDropdownOpen, isDropdownOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleUserDropdown = (e) => {
    e.stopPropagation();
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  // Updated toggleAssistant to ensure the callback is called
  const toggleAssistant = () => {
    const newState = !isAssistantOpen;
    setIsAssistantOpen(newState);
    
    // Call the onAssistantToggle callback with the new state
    if (onAssistantToggle) {
      onAssistantToggle(newState);
    }
  };

  const openGroup = (e) => {
    e.preventDefault();
    if (user) {
      navigate('/groups');
    } else {
      navigate('/login');
    }
  }

  const handleLogout = (e) => {
    console.log("Logout clicked, starting logout process");
    
    // Call the logout function from context
    logout();
    console.log("Logout function called");
    
    // Force a page refresh to clear any remaining state
    setTimeout(() => {
      console.log("Navigating to login page");
      navigate('/login');
      // Optional: refresh the page to ensure all state is cleared
      window.location.reload();
    }, 100);
  };
  
  const getStatusClass = () => {
    if (isConnecting) return "bg-yellow-400";
    return isConnected ? "bg-green-500" : "bg-red-500";
  };
  
  const getStatusText = () => {
    if (isConnecting) return "Connecting...";
    return isConnected ? "Connected" : "Disconnected";
  };

  // Get username from user object
  const getUsername = () => {
    if (!user) return "Guest";
    return user.firstName || user.email?.split('@')[0] || "User";
  };

  // Check if a route is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-gray-900/90 backdrop-blur-md shadow-lg shadow-black/20' 
        : 'bg-gray-900'
    }`}>
      <div className="container mx-auto px-4">
        {/* Mobile Welcome Message - Visible only on mobile at the top */}
        {user && (
          <div className="md:hidden py-2 text-center border-b border-gray-700/30">
            <div className="relative">
              <button 
                onClick={toggleUserDropdown}
                className="flex items-center justify-center text-teal-400"
              >
                <User className="h-4 w-4 mr-1.5" />
                <span className="font-medium">Welcome, {getUsername()}</span>
                <ChevronDown className={`h-3 w-3 ml-1.5 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isUserDropdownOpen && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-40 bg-gray-800/95 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-xl py-1 z-50">
                  <Link 
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-teal-500/10 hover:text-teal-400 transition-colors"
                  >
                    <UserCircle className="h-4 w-4 mr-2" /> Profile
                  </Link>
                  {isAdmin && (
                    <Link 
                      to="/admin"
                      className="flex items-center px-4 py-2 text-sm text-teal-400 hover:bg-teal-500/10 transition-colors"
                    >
                      <Shield className="h-4 w-4 mr-2" /> Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2">
              <Beaker className="h-8 w-8 text-teal-400" />
              <h1 className="text-xl font-bold text-white">Virtual Labs</h1>
            </Link>
          </div>
          
          {user && (
            <>
              {/* Connection Status and User Welcome - Desktop */}
              <div className="hidden md:flex items-center space-x-3">
                {/* Desktop Welcome Message with Dropdown */}
                <div className="relative">
                  <button 
                    onClick={toggleUserDropdown}
                    className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-full px-3 py-1.5 text-sm flex items-center hover:bg-gray-700/40 transition-colors"
                  >
                    <User className="h-4 w-4 text-teal-400 mr-1.5" />
                    <span className="text-white">Welcome, <span className="font-medium text-teal-400">{getUsername()}</span></span>
                    {isAdmin && (
                      <span className="ml-1.5 px-1.5 py-0.5 bg-teal-500/20 text-teal-300 text-xs rounded-full border border-teal-500/30">
                        Admin
                      </span>
                    )}
                    <ChevronDown className={`h-3 w-3 ml-1.5 text-gray-400 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800/95 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-xl py-1 z-50">
                      <Link 
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-teal-500/10 hover:text-teal-400 transition-colors"
                      >
                        <UserCircle className="h-4 w-4 mr-2" /> My Profile
                      </Link>
                      {isAdmin && (
                        <Link 
                          to="/admin"
                          className="flex items-center px-4 py-2 text-sm text-teal-400 hover:bg-teal-500/10 transition-colors"
                        >
                          <Shield className="h-4 w-4 mr-2" /> Admin Dashboard
                        </Link>
                      )}
                      <Link 
                        to="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-teal-500/10 hover:text-teal-400 transition-colors"
                      >
                        <Settings className="h-4 w-4 mr-2" /> Account Settings
                      </Link>
                      <div className="border-t border-gray-700/50 my-1"></div>
                      <button 
                        onClick={(e) => handleLogout(e)}
                        className="w-full text-left flex items-center px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-2" /> Logout
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-full px-3 py-1 text-sm">
                  <span className={`h-2 w-2 rounded-full mr-2 ${getStatusClass()}`}></span>
                  <span className="text-gray-300">{getStatusText()}</span>
                </div>
                
                {/* Virtual Lab Assistant Button - Updated with proper aria labels */}
                <button 
                  onClick={toggleAssistant}
                  aria-pressed={isAssistantOpen}
                  aria-label="Toggle Virtual Lab Assistant"
                  className={`p-2 rounded-full transition-all duration-300 ${
                    isAssistantOpen 
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' 
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-teal-400 border border-gray-700/50'
                  }`}
                >
                  <Bot className="h-5 w-5" />
                </button>
              </div>
              
              {/* Mobile Connection Status */}
              <div className="md:hidden flex items-center space-x-3">
                <div className="flex items-center bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-full px-3 py-1 text-sm">
                  <span className={`h-2 w-2 rounded-full mr-2 ${getStatusClass()}`}></span>
                  <span className="text-gray-300">{getStatusText()}</span>
                </div>
                
                {/* Virtual Lab Assistant Button - Mobile */}
                <button 
                  onClick={toggleAssistant}
                  aria-pressed={isAssistantOpen}
                  aria-label="Toggle Virtual Lab Assistant"
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
                <Link 
                  to="/" 
                  className={`${isActive('/') ? 'text-teal-400' : 'text-gray-400 hover:text-teal-400'} flex items-center transition-colors duration-300`}
                >
                  <Home className="h-4 w-4 mr-1" /> Home
                </Link>
                <Link 
                  to="/labs" 
                  className={`${isActive('/labs') ? 'text-teal-400' : 'text-gray-400 hover:text-teal-400'} flex items-center transition-colors duration-300`}
                >
                  <BookOpen className="h-4 w-4 mr-1" /> Labs
                </Link>
                <Link 
                  to="/chat" 
                  className={`${isActive('/chat') ? 'text-teal-400' : 'text-gray-400 hover:text-teal-400'} flex items-center transition-colors duration-300`}
                >
                  <MessageCircle className="h-4 w-4 mr-1" /> Chat
                </Link>
                
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className={`${isActive('/admin') ? 'text-teal-400' : 'text-teal-400 hover:text-teal-300'} flex items-center transition-colors duration-300`}
                  >
                    <Shield className="h-4 w-4 mr-1" /> Admin
                  </Link>
                )}
                
                <Link 
                  to="/settings" 
                  className={`${isActive('/settings') ? 'text-teal-400' : 'text-gray-400 hover:text-teal-400'} flex items-center transition-colors duration-300`}
                >
                  <Settings className="h-4 w-4 mr-1" /> Settings
                </Link>
                
                {/* Groups Dropdown */}
                <div className="relative">
                  <button 
                    onClick={openGroup}
                    className="text-gray-400 hover:text-teal-400 flex items-center transition-colors duration-300"
                  >
                    <Users className="h-4 w-4 mr-1" /> Groups
                  </button>
                </div>
              </nav>
            </>
          )}

          {!user && (
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/login" className="text-gray-300 hover:text-teal-400 transition-colors">
                Login
              </Link>
              <Link to="/register" className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-md transition-colors">
                Register
              </Link>
            </div>
          )}

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
            {user ? (
              <>
                {/* Mobile menu items for logged in users */}
                <Link 
                  to="/" 
                  className={`${isActive('/') ? 'text-teal-400' : 'text-gray-400'} py-2 flex items-center transition-colors duration-300`}
                >
                  <Home className="h-5 w-5 mr-2" /> Home
                </Link>
                <Link 
                  to="/labs" 
                  className={`${isActive('/labs') ? 'text-teal-400' : 'text-gray-400'} py-2 flex items-center transition-colors duration-300`}
                >
                  <BookOpen className="h-5 w-5 mr-2" /> Labs
                </Link>
                <a 
                  href="#" 
                  className="text-gray-400 hover:text-teal-400 py-2 flex items-center transition-colors duration-300"
                >
                  <Users className="h-5 w-5 mr-2" /> Collaborators
                </a>
                <Link 
                  to="/chat" 
                  className={`${isActive('/chat') ? 'text-teal-400' : 'text-gray-400'} py-2 flex items-center transition-colors duration-300`}
                >
                  <MessageCircle className="h-5 w-5 mr-2" /> Chat
                </Link>
                
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className={`${isActive('/admin') ? 'text-teal-300' : 'text-teal-400'} py-2 flex items-center transition-colors duration-300 font-medium`}
                  >
                    <Shield className="h-5 w-5 mr-2" /> Admin Dashboard
                  </Link>
                )}
                
                <Link 
                  to="/settings" 
                  className={`${isActive('/settings') ? 'text-teal-400' : 'text-gray-400'} py-2 flex items-center transition-colors duration-300`}
                >
                  <Settings className="h-5 w-5 mr-2" /> Settings
                </Link>
                <button
                  onClick={toggleAssistant}
                  className={`py-2 flex items-center transition-colors duration-300 ${
                    isAssistantOpen ? 'text-teal-400' : 'text-gray-400 hover:text-teal-400'
                  }`}
                >
                  <Bot className="h-5 w-5 mr-2" /> Virtual Lab Assistant
                </button>
                
                {/* Logout option in mobile menu */}
                <a 
                  href="#" 
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-300 py-2 flex items-center transition-colors duration-300 border-t border-gray-700/30 mt-2 pt-4"
                >
                  <LogOut className="h-5 w-5 mr-2" /> Logout
                </a>
              </>
            ) : (
              <>
                {/* Mobile menu items for guests */}
                <Link 
                  to="/" 
                  className="text-gray-400 hover:text-teal-400 py-2 flex items-center transition-colors duration-300"
                >
                  <Home className="h-5 w-5 mr-2" /> Home
                </Link>
                <Link 
                  to="/about" 
                  className="text-gray-400 hover:text-teal-400 py-2 flex items-center transition-colors duration-300"
                >
                  <BookOpen className="h-5 w-5 mr-2" /> About
                </Link>
                <div className="border-t border-gray-700/30 pt-3 mt-3 grid grid-cols-2 gap-3">
                  <Link 
                    to="/login" 
                    className="text-center py-2 border border-gray-700 rounded-md text-gray-300 hover:text-teal-400 hover:border-teal-400 transition-colors"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="text-center py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-md transition-colors"
                  >
                    Register
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;