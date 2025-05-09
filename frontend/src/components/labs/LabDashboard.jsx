import { useState, useEffect} from 'react';
import { Search, Filter, Plus, Beaker, Zap, Monitor, Book, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';
import ResponsiveHeader from '../shared-components/Header';
import { useNavigate } from 'react-router-dom';

export default function LabDashboard() {
  const [isConnected, setIsConnected] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedMode, setSelectedMode] = useState('practice');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState(false); // Toggle to true for admin view
  const [showAddExperimentModal, setShowAddExperimentModal] = useState(false);
  const [filteredExperiments, setFilteredExperiments] = useState([]);
  const navigate = useNavigate(); 

  // Sample experiment data
  const experiments = [
    {
      id: 1,
      title: "Acid-Base Titration",
      subject: "chemistry",
      semester: "1",
      description: "Determine the concentration of an acid or base by precisely neutralizing it with a standard solution of known concentration.",
      difficulty: "medium",
      duration: "45 min",
      status: "completed"
    },
    {
      id: 2,
      title: "Simple Pendulum",
      subject: "physics",
      semester: "1",
      description: "Study the relationship between pendulum length and period of oscillation to calculate the acceleration due to gravity.",
      difficulty: "easy",
      duration: "30 min",
      status: "available"
    },
    {
      id: 3,
      title: "Resistor Color Coding",
      subject: "electronics",
      semester: "2",
      description: "Learn to identify resistor values using the color band coding system and verify using a multimeter.",
      difficulty: "easy",
      duration: "20 min",
      status: "available"
    },
    {
      id: 4,
      title: "Ohm's Law Verification",
      subject: "electronics",
      semester: "2",
      description: "Verify Ohm's Law by measuring current through a resistor at various voltage levels.",
      difficulty: "medium",
      duration: "40 min",
      status: "available"
    },
    {
      id: 5,
      title: "Spectrophotometric Analysis",
      subject: "chemistry",
      semester: "3",
      description: "Determine the concentration of a solution by measuring its light absorbance properties.",
      difficulty: "hard",
      duration: "60 min",
      status: "available"
    },
    {
      id: 6,
      title: "Young's Double Slit Experiment",
      subject: "physics",
      semester: "2",
      description: "Demonstrate the wave nature of light through interference patterns created by two closely spaced slits.",
      difficulty: "hard",
      duration: "50 min",
      status: "available"
    },
    {
      id: 7,
      title: "Digital Logic Gates",
      subject: "electronics",
      semester: "3",
      description: "Explore the behavior of basic logic gates and verify their truth tables.",
      difficulty: "medium",
      duration: "45 min",
      status: "in_progress"
    },
    {
      id: 8,
      title: "Chromatography",
      subject: "chemistry",
      semester: "2",
      description: "Separate and analyze components of a mixture using various chromatographic techniques.",
      difficulty: "medium",
      duration: "40 min",
      status: "available"
    }
  ];

  useEffect(() => {
    // Filter experiments based on selected filters and search query
    let filtered = [...experiments];
    
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(exp => exp.subject === selectedSubject);
    }
    
    if (selectedSemester !== 'all') {
      filtered = filtered.filter(exp => exp.semester === selectedSemester);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(exp => 
        exp.title.toLowerCase().includes(query) || 
        exp.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredExperiments(filtered);
  }, [selectedSubject, selectedSemester, searchQuery]);

  const handleAssistantToggle = (isOpen) => {
    console.log("Assistant is now:", isOpen ? "open" : "closed");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" /> Completed
        </span>;
      case 'in_progress':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Zap className="w-3 h-3 mr-1" /> In Progress
        </span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Available
        </span>;
    }
  };

  const getSubjectIcon = (subject) => {
    switch (subject) {
      case 'chemistry':
        return <Beaker className="w-8 h-8 text-purple-500" />;
      case 'physics':
        return <Zap className="w-8 h-8 text-blue-500" />;
      case 'electronics':
        return <Monitor className="w-8 h-8 text-emerald-500" />;
      default:
        return <Book className="w-8 h-8 text-gray-500" />;
    }
  };

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return <span className="text-green-600 text-sm font-medium">Easy</span>;
      case 'medium':
        return <span className="text-amber-600 text-sm font-medium">Medium</span>;
      case 'hard':
        return <span className="text-red-600 text-sm font-medium">Hard</span>;
      default:
        return <span className="text-gray-600 text-sm font-medium">Unknown</span>;
    }
  };

  const startExperiment = (experimentId, mode) => {
    console.log(`Starting experiment ${experimentId} in ${mode} mode`);
    // Navigate to the experiment page with the selected mode
    navigate('/experiment');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ResponsiveHeader 
        isConnected={isConnected}
        isConnecting={isConnecting}
        onAssistantToggle={handleAssistantToggle}
      />
      
      {/* Dashboard Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Laboratory Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Select an experiment to begin your virtual lab experience
              </p>
            </div>
            {isAdmin && (
              <button 
                onClick={() => setShowAddExperimentModal(true)}
                className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" /> Add Experiment
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="bg-white border-t border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Subject Filter */}
              <div className="flex items-center space-x-2">
                <label htmlFor="subject" className="text-sm font-medium text-gray-700">Subject:</label>
                <select
                  id="subject"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="form-select rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                  <option value="all">All Subjects</option>
                  <option value="chemistry">Chemistry</option>
                  <option value="physics">Physics</option>
                  <option value="electronics">Electronics</option>
                </select>
              </div>
              
              {/* Semester Filter */}
              <div className="flex items-center space-x-2">
                <label htmlFor="semester" className="text-sm font-medium text-gray-700">Semester:</label>
                <select
                  id="semester"
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="form-select rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                  <option value="all">All Semesters</option>
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                  <option value="3">Semester 3</option>
                  <option value="4">Semester 4</option>
                </select>
              </div>
              
              {/* Mode Selection */}
              <div className="flex items-center space-x-2">
                <label htmlFor="mode" className="text-sm font-medium text-gray-700">Mode:</label>
                <select
                  id="mode"
                  value={selectedMode}
                  onChange={(e) => setSelectedMode(e.target.value)}
                  className="form-select rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                  <option value="practice">Practice Mode</option>
                  <option value="test">Test Mode</option>
                </select>
              </div>
            </div>
            
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search experiments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Experiments Grid */}
      <div className="container mx-auto px-4 py-8">
        {filteredExperiments.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
              <AlertTriangle className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No experiments found</h3>
            <p className="mt-2 text-sm text-gray-500">
              Try adjusting your filters or search query to find experiments.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExperiments.map((experiment) => (
              <div 
                key={experiment.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-200"
              >
                <div className="p-4 flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getSubjectIcon(experiment.subject)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {experiment.title}
                      </h3>
                      {getStatusBadge(experiment.status)}
                    </div>
                    <p className="text-gray-600 text-sm mt-1">
                      {experiment.description}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center text-gray-500 text-sm">
                            <Calendar className="h-4 w-4 mr-1" />
                            {experiment.duration}
                          </span>
                          <span className="flex items-center">
                            {getDifficultyBadge(experiment.difficulty)}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          {experiment.subject.charAt(0).toUpperCase() + experiment.subject.slice(1)} • Semester {experiment.semester}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-t border-gray-200">
                  <div className="text-gray-500 text-sm">
                    {selectedMode === 'practice' 
                      ? "Practice - No time limit" 
                      : "Test - Timed assessment"}
                  </div>
                  <button
                    onClick={() => startExperiment(experiment.id, selectedMode)}
                    className={`px-4 py-1 text-white rounded-md text-sm font-medium ${
                      selectedMode === 'practice' ? 'bg-[#75aede] hover:bg-blue-600' : 'bg-orange-500 hover:bg-orange-600'
                    } transition-colors`}
                  >
                    {selectedMode === 'practice' ? 'Start Practice' : 'Begin Test'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Add Experiment Modal - Only shown for admin users */}
      {isAdmin && showAddExperimentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add New Experiment</h3>
                <button 
                  onClick={() => setShowAddExperimentModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Form fields would go here */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="exp-title" className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    id="exp-title"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter experiment title"
                  />
                </div>
                
                <div>
                  <label htmlFor="exp-subject" className="block text-sm font-medium text-gray-700">Subject</label>
                  <select
                    id="exp-subject"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Select subject</option>
                    <option value="chemistry">Chemistry</option>
                    <option value="physics">Physics</option>
                    <option value="electronics">Electronics</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="exp-semester" className="block text-sm font-medium text-gray-700">Semester</label>
                  <select
                    id="exp-semester"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Select semester</option>
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                    <option value="3">Semester 3</option>
                    <option value="4">Semester 4</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="exp-description" className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    id="exp-description"
                    rows="3"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Brief description of the experiment"
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="exp-difficulty" className="block text-sm font-medium text-gray-700">Difficulty</label>
                    <select
                      id="exp-difficulty"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="">Select difficulty</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="exp-duration" className="block text-sm font-medium text-gray-700">Duration</label>
                    <input
                      type="text"
                      id="exp-duration"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="e.g. 45 min"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddExperimentModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Save Experiment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}