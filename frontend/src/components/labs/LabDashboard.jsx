import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Beaker, BookOpen, Clock, ChevronRight, Tag } from 'lucide-react';
import labsData from '../../virtual_db/labs.json';
import ResponsiveHeader from '../shared-components/Header';
import Footer from '../shared-components/Footer';

export default function LabDashboard() {
  const [labs, setLabs] = useState([]);
  const [filteredLabs, setFilteredLabs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        setIsLoading(true);
        
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setLabs(labsData);
        setFilteredLabs(labsData);
        
        const uniqueCategories = ['All', ...new Set(labsData.map(lab => lab.category))];
        setCategories(uniqueCategories);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching labs:', error);
        setIsLoading(false);
      }
    };

    fetchLabs();
  }, []);

  useEffect(() => {
    let result = labs;
    
    // Filter by category if not "All"
    if (selectedCategory !== 'All') {
      result = result.filter(lab => lab.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(lab => 
        lab.name.toLowerCase().includes(query) || 
        lab.description.toLowerCase().includes(query) ||
        lab.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    setFilteredLabs(result);
  }, [searchQuery, selectedCategory, labs]);

  const handleLabSelect = (labId) => {
    navigate(`/experiment?lab=${labId}`);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleAssistantToggle = (isOpen) => {
    console.log("Assistant is now:", isOpen ? "open" : "closed");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ResponsiveHeader 
        isConnected={isConnected} 
        isConnecting={false}
        onAssistantToggle={handleAssistantToggle}
      />
      
      <main className="flex-grow container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Virtual Laboratory</h1>
          <p className="text-gray-600">
            Explore interactive experiments across various scientific disciplines
          </p>
        </div>
        
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search for labs by name, description or tags..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <span className="text-gray-700">Filter:</span>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedCategory === category
                        ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                    onClick={() => handleCategorySelect(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Lab Cards */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredLabs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="flex justify-center mb-4">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Labs Found</h2>
            <p className="text-gray-600">
              We couldn't find any labs matching your search criteria. Please try a different search term or filter.
            </p>
            <button
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLabs.map((lab) => (
              <div 
                key={lab._id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden flex flex-col"
              >
                <div 
                  className="h-40 bg-gray-200 bg-cover bg-center"
                  style={{
                    backgroundImage: lab.thumbnail 
                      ? `url(${lab.thumbnail})` 
                      : "url('/images/labs/default.jpg')"
                  }}
                >
                  <div className="w-full h-full bg-gradient-to-t from-gray-900/50 to-transparent p-4 flex flex-col justify-end">
                    <span className="bg-indigo-600 text-white text-xs font-semibold px-2.5 py-0.5 rounded inline-block w-fit">
                      {lab.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-5 flex-grow">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
                    <Beaker className="h-5 w-5 mr-2 text-indigo-500" />
                    {lab.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {lab.description}
                  </p>
                  
                  <div className="flex items-center text-gray-500 text-sm mb-4">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{lab.estimated_time}</span>
                    <span className="mx-2">•</span>
                    <BookOpen className="h-4 w-4 mr-1" />
                    <span>{lab.difficulty}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {lab.tags.slice(0, 3).map((tag, index) => (
                      <span 
                        key={index} 
                        className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md flex items-center"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                    {lab.tags.length > 3 && (
                      <span className="text-xs text-gray-500 flex items-center">
                        +{lab.tags.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="p-4 border-t border-gray-100">
                  <button
                    onClick={() => handleLabSelect(lab._id)}
                    className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors flex items-center justify-center"
                  >
                    Launch Lab
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
