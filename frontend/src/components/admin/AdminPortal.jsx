import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { UserContext } from '../hooks/userContext';
import { 
  Users, 
  LayoutDashboard, 
  Beaker, 
  UserCog, 
  FileText, 
  BarChart, 
  Microscope, 
  GroupIcon,
  Search,
  PlusCircle
} from 'lucide-react';
import ResponsiveHeader from '../shared-components/Header';
import Footer from '../shared-components/Footer';

const AdminPortal = ({ children }) => {
  const { user, isAdmin } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Check if user has admin privileges
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'admin') {
      navigate('/unauthorized');
    }
  }, [user, navigate]);

  // Get current active route for sidebar highlighting
  const isActivePath = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <ResponsiveHeader />
      
      <div className="flex flex-grow pt-16">
        {/* Admin Sidebar */}
        <div className="bg-gray-900 text-white w-64 flex-shrink-0 hidden md:block">
          <div className="p-5 border-b border-gray-800">
            <h2 className="text-xl font-bold flex items-center">
              <UserCog className="mr-2 h-6 w-6" />
              Admin Portal
            </h2>
            <p className="text-gray-400 text-sm mt-1">Manage your virtual labs</p>
          </div>
          
          <nav className="p-4">
            <div className="mb-6">
              <h3 className="text-xs uppercase text-gray-500 font-semibold mb-2 tracking-wider">Management</h3>
              <ul className="space-y-1">
                <li>
                  <Link
                    to="/admin/dashboard"
                    className={`flex items-center px-4 py-2.5 text-sm rounded-lg ${
                      isActivePath('/admin/dashboard') 
                        ? 'bg-indigo-700 text-white' 
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <LayoutDashboard className="h-4 w-4 mr-3" />
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/students"
                    className={`flex items-center px-4 py-2.5 text-sm rounded-lg ${
                      isActivePath('/admin/students') 
                        ? 'bg-indigo-700 text-white' 
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <Users className="h-4 w-4 mr-3" />
                    Students
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/groups"
                    className={`flex items-center px-4 py-2.5 text-sm rounded-lg ${
                      isActivePath('/admin/groups') 
                        ? 'bg-indigo-700 text-white' 
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <GroupIcon className="h-4 w-4 mr-3" />
                    Groups
                  </Link>
                </li>
              </ul>
            </div>
            
            <div className="mb-6">
              <h3 className="text-xs uppercase text-gray-500 font-semibold mb-2 tracking-wider">Content</h3>
              <ul className="space-y-1">
                <li>
                  <Link
                    to="/admin/labs"
                    className={`flex items-center px-4 py-2.5 text-sm rounded-lg ${
                      isActivePath('/admin/labs') 
                        ? 'bg-indigo-700 text-white' 
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <Beaker className="h-4 w-4 mr-3" />
                    Labs
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/experiments"
                    className={`flex items-center px-4 py-2.5 text-sm rounded-lg ${
                      isActivePath('/admin/experiments') 
                        ? 'bg-indigo-700 text-white' 
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <Microscope className="h-4 w-4 mr-3" />
                    Experiments
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xs uppercase text-gray-500 font-semibold mb-2 tracking-wider">Reports</h3>
              <ul className="space-y-1">
                <li>
                  <Link
                    to="/admin/results"
                    className={`flex items-center px-4 py-2.5 text-sm rounded-lg ${
                      isActivePath('/admin/results') 
                        ? 'bg-indigo-700 text-white' 
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <FileText className="h-4 w-4 mr-3" />
                    Results
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/analytics"
                    className={`flex items-center px-4 py-2.5 text-sm rounded-lg ${
                      isActivePath('/admin/analytics') 
                        ? 'bg-indigo-700 text-white' 
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <BarChart className="h-4 w-4 mr-3" />
                    Analytics
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>
        
        {/* Mobile Sidebar Toggle Button */}
        <div className="md:hidden bg-gray-900 text-white fixed bottom-5 right-5 z-50">
          <button className="p-3 bg-indigo-600 rounded-full shadow-lg">
            <LayoutDashboard className="h-6 w-6" />
          </button>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminPortal;