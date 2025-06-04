import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../../hooks/userContext';
import { 
  saveExperimentNotes, 
  getExperimentNotes, 
  saveExperimentResults, 
  getExperimentResults 
} from '../../../../services/experimentService';

const ExperimentData = ({ 
  voltage,
  resistance,
  current,
  power,
  components,
  connections,
  circuitComplete,
  measurements,
  onLoadSavedExperiment,
  experimentId = 'ohms-law-circuit'
}) => {
  const { user } = useContext(UserContext);
  const [notes, setNotes] = useState('');
  const [noteId, setNoteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedResults, setSavedResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });

  // Load notes when component mounts
  useEffect(() => {
    if (user) {
      loadNotes();
      loadExperimentResults();
    }
  }, [user]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  const loadNotes = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await getExperimentNotes(user.id, experimentId);
      if (response.success && response.notes) {
        setNotes(response.notes.notes || '');
        setNoteId(response.notes.id);
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveNotes = async () => {
    if (!user) {
      showNotification('You need to be logged in to save notes', 'error');
      return;
    }
    
    try {
      setSaving(true);
      const response = await saveExperimentNotes(user.id, experimentId, notes, noteId);
      if (response.success) {
        setNoteId(response.noteId);
        showNotification('Notes saved successfully');
      }
    } catch (error) {
      showNotification('Failed to save notes', 'error');
      console.error('Error saving notes:', error);
    } finally {
      setSaving(false);
    }
  };

  const loadExperimentResults = async () => {
    if (!user) {
      showNotification('You need to be logged in to load experiment results', 'error');
      return;
    }
    
    try {
      setLoading(true);
      const response = await getExperimentResults(user.id, experimentId);
      if (response.success) {
        setSavedResults(response.results || []);
      }
    } catch (error) {
      showNotification('Failed to load experiment results', 'error');
      console.error('Error loading experiment results:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCurrentExperiment = async () => {
    if (!user) {
      showNotification('You need to be logged in to save experiment data', 'error');
      return;
    }
    
    try {
      setSaving(true);
      
      // Prepare input data
      const inputData = {
        voltage,
        resistance,
        components,
        connections
      };
      
      // Prepare output data
      const outputData = {
        current,
        power,
        circuitComplete,
        measurements
      };
      
      const response = await saveExperimentResults(user.id, experimentId, inputData, outputData);
      
      if (response.success) {
        showNotification('Experiment data saved successfully');
        loadExperimentResults();
      }
    } catch (error) {
      showNotification('Failed to save experiment data', 'error');
      console.error('Error saving experiment data:', error);
    } finally {
      setSaving(false);
    }
  };

  const loadSelectedResult = () => {
    if (!selectedResult) {
      showNotification('No experiment result selected to load', 'error');
      return;
    }
    
    try {
      const result = savedResults.find(r => r.id === selectedResult);
      if (result) {
        onLoadSavedExperiment(result);
        showNotification('Experiment loaded successfully');
      }
    } catch (error) {
      showNotification('Failed to load experiment result', 'error');
      console.error('Error loading experiment result:', error);
    }
  };

  return (
    <div className="bg-[#1e293b] rounded-xl p-6 border border-[rgba(94,234,212,0.1)]">
      <h2 className="text-[#5EEAD4] text-xl font-semibold mb-6">Experiment Data & Notes</h2>
      
      {notification.message && (
        <div className={`notification ${notification.type} mb-4 p-3 rounded-md bg-[rgba(94,234,212,0.1)] text-[#5EEAD4] border border-[rgba(94,234,212,0.2)]`}>
          {notification.message}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[rgba(15,23,42,0.4)] p-4 rounded-lg border border-[rgba(94,234,212,0.1)]">
          <h3 className="text-[#5EEAD4] font-medium mb-3">Lab Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Take notes about your observations and conclusions from the Ohm's Law experiment..."
            disabled={loading || !user}
            className="w-full h-40 p-3 bg-[rgba(15,23,42,0.3)] border border-[rgba(94,234,212,0.2)] rounded-md 
            text-[#f1f5f9] placeholder-[#94a3b8] focus:border-[#5EEAD4] focus:ring-[rgba(94,234,212,0.2)]"
          ></textarea>
          <button 
            onClick={saveNotes}
            disabled={saving || loading || !user}
            className="mt-3 px-4 py-2 bg-[rgba(94,234,212,0.1)] text-[#5EEAD4] rounded-md
            hover:bg-[rgba(94,234,212,0.2)] border border-[rgba(94,234,212,0.2)] hover:border-[#5EEAD4]
            disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            {saving ? 'Saving...' : 'Save Notes'}
          </button>
        </div>
        
        <div className="bg-[rgba(15,23,42,0.4)] p-4 rounded-lg border border-[rgba(94,234,212,0.1)]">
          <h3 className="text-[#5EEAD4] font-medium mb-3">Saved Experiments</h3>
          <div className="space-y-3">
            <button
              onClick={saveCurrentExperiment}
              disabled={saving || !user}
              className="w-full px-4 py-2 bg-[rgba(94,234,212,0.1)] text-[#5EEAD4] rounded-md
              hover:bg-[rgba(94,234,212,0.2)] border border-[rgba(94,234,212,0.2)] hover:border-[#5EEAD4]
              disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {saving ? 'Saving...' : 'Save Current Circuit'}
            </button>
            
            <button
              onClick={loadExperimentResults}
              disabled={loading || !user}
              className="w-full px-4 py-2 bg-[rgba(94,234,212,0.1)] text-[#5EEAD4] rounded-md
              hover:bg-[rgba(94,234,212,0.2)] border border-[rgba(94,234,212,0.2)] hover:border-[#5EEAD4]
              disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? 'Loading...' : 'Load Saved Circuits'}
            </button>
            
            {savedResults.length > 0 && (
              <div className="space-y-3">
                <select
                  value={selectedResult || ''}
                  onChange={(e) => setSelectedResult(e.target.value)}
                  className="w-full px-3 py-2 bg-[rgba(15,23,42,0.3)] border border-[rgba(94,234,212,0.2)] 
                  rounded-md text-[#f1f5f9] focus:border-[#5EEAD4] focus:ring-[rgba(94,234,212,0.2)]"
                >
                  <option value="">-- Select a saved experiment --</option>
                  {savedResults.map(result => (
                    <option key={result.id} value={result.id}>
                      {new Date(result.createdAt).toLocaleString()} - {result.input.voltage}V, {result.input.resistance}Ω
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={loadSelectedResult}
                  disabled={!selectedResult}
                  className="w-full px-4 py-2 bg-[rgba(94,234,212,0.1)] text-[#5EEAD4] rounded-md
                  hover:bg-[rgba(94,234,212,0.2)] border border-[rgba(94,234,212,0.2)] hover:border-[#5EEAD4]
                  disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  Load Selected Circuit
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {!user && (
        <div className="mt-4 p-3 bg-[rgba(94,234,212,0.1)] border border-[rgba(94,234,212,0.2)] 
        rounded-md text-sm text-[#5EEAD4]">
          Please login to save and load experiment data.
        </div>
      )}
    </div>
  );
};

export default ExperimentData;
