import React, { useState, useEffect } from 'react';
import { Search, X, Plus, Edit, Trash2, Eye, Settings } from 'lucide-react';
import axios from 'axios';

const ExperimentsManagement = () => {
  const [experiments, setExperiments] = useState([]);
  const [filteredExperiments, setFilteredExperiments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [labs, setLabs] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedExperiment, setSelectedExperiment] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    instructions: '',
    difficulty: 'Beginner',
    lab_id: '',
    module_url: '',
    render_type: 'iframe',
    status: 'active'
  });
  
  // Fetch experiments and labs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch experiments
        // Note: In a real application, you'd have a real API
        // Here we're using your imported data
        const experimentsResponse = await axios.get('http://localhost:3000/api/experiments');
        setExperiments(experimentsResponse.data);
        setFilteredExperiments(experimentsResponse.data);
        
        // Fetch labs for the dropdown
        const labsResponse = await axios.get('http://localhost:3000/api/labs');
        setLabs(labsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filter experiments based on search term
  useEffect(() => {
    const results = experiments.filter(experiment => 
      experiment.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      experiment.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredExperiments(results);
  }, [searchTerm, experiments]);
  
  // Handle search change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  // Open edit modal with experiment data
  const handleEdit = (experiment) => {
    setSelectedExperiment(experiment);
    setFormData({
      name: experiment.name || '',
      description: experiment.description || '',
      instructions: experiment.instructions || '',
      difficulty: experiment.difficulty || 'Beginner',
      lab_id: experiment.lab_id || '',
      module_url: experiment.module_url || '',
      render_type: experiment.render_type || 'iframe',
      status: experiment.status || 'active'
    });
    setShowAddModal(true);
  };
  
  // Open add modal with empty form
  const handleAdd = () => {
    setSelectedExperiment(null);
    setFormData({
      name: '',
      description: '',
      instructions: '',
      difficulty: 'Beginner',
      lab_id: '',
      module_url: '',
      render_type: 'iframe',
      status: 'active'
    });
    setShowAddModal(true);
  };
  
  // Submit the form (add or edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (selectedExperiment) {
        // Update existing experiment
        await axios.put(`http://localhost:3000/api/experiments/${selectedExperiment._id}`, formData);
      } else {
        // Create new experiment
        await axios.post('http://localhost:3000/api/experiments', formData);
      }
      
      // Refresh experiments list
      const response = await axios.get('http://localhost:3000/api/experiments');
      setExperiments(response.data);
      
      // Close modal
      setShowAddModal(false);
    } catch (error) {
      console.error('Error saving experiment:', error);
      alert('Failed to save experiment');
    }
  };
  
  // Delete experiment
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this experiment?')) {
      return;
    }
    
    try {
      await axios.delete(`http://localhost:3000/api/experiments/${id}`);
      
      // Refresh experiments list
      setExperiments(experiments.filter(exp => exp._id !== id));
    } catch (error) {
      console.error('Error deleting experiment:', error);
      alert('Failed to delete experiment');
    }
  };
  
  // Get lab name by ID
  const getLabName = (labId) => {
    const lab = labs.find(lab => lab._id === labId);
    return lab ? lab.name : 'Unknown Lab';
  };
  
  return (
    <div className="experiments-management">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Experiments Management</h1>
        <button
          onClick={handleAdd}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Experiment
        </button>
      </div>
      
      {/* Search bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search experiments..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-indigo-500 focus:border-indigo-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      
      {/* Experiments Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mb-2"></div>
            <p className="text-gray-500">Loading experiments...</p>
          </div>
        ) : filteredExperiments.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No experiments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lab
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExperiments.map((experiment) => (
                  <tr key={experiment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{experiment.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{experiment.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getLabName(experiment.lab_id)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        experiment.difficulty === 'Advanced' 
                          ? 'bg-red-100 text-red-800' 
                          : experiment.difficulty === 'Intermediate'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                      }`}>
                        {experiment.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        experiment.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {experiment.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => window.open(`/experiment?lab=${experiment.lab_id}&experiment=${experiment._id}`, '_blank')}
                          className="text-gray-600 hover:text-gray-900"
                          title="View Experiment"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEdit(experiment)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit Experiment"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(experiment._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Experiment"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Add/Edit Experiment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedExperiment ? 'Edit Experiment' : 'Add New Experiment'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lab</label>
                  <select
                    name="lab_id"
                    value={formData.lab_id}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Select Lab</option>
                    {labs.map(lab => (
                      <option key={lab._id} value={lab._id}>{lab.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                ></textarea>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleInputChange}
                  rows="5"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">Use line breaks to separate steps</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Module URL</label>
                  <input
                    type="text"
                    name="module_url"
                    value={formData.module_url}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">Path to the simulator or external URL</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Render Type</label>
                  <select
                    name="render_type"
                    value={formData.render_type}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="iframe">iframe</option>
                    <option value="component">React Component</option>
                    <option value="external">External Link</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  {selectedExperiment ? 'Save Changes' : 'Add Experiment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExperimentsManagement;