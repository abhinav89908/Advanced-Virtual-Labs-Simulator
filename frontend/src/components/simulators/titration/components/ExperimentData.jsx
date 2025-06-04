import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../../hooks/userContext';
import { 
  saveExperimentNotes, 
  getExperimentNotes, 
  saveExperimentResults, 
  getExperimentResults 
} from '../../../../services/experimentService';

const ExperimentData = ({ 
  selectedAcid,
  selectedBase,
  concentration,
  volume,
  reactionComplete,
  measurements,
  onLoadSavedExperiment,
  experimentId = 'titration-experiment'
}) => {
  const { user } = useContext(UserContext);
  const [notes, setNotes] = useState('');
  const [noteId, setNoteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedResults, setSavedResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  // Load notes when component mounts
  useEffect(() => {
    if (user) {
      loadNotes();
      loadExperimentResults();
    }
  }, [user]);

  const showStatus = (message, isError = false) => {
    setStatusMessage(message);
    setTimeout(() => setStatusMessage(''), 3000);
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
      showStatus('You need to be logged in to save notes', true);
      return;
    }
    
    try {
      setSaving(true);
      const response = await saveExperimentNotes(user.id, experimentId, notes, noteId);
      if (response.success) {
        setNoteId(response.noteId);
        showStatus('Notes saved successfully');
      }
    } catch (error) {
      showStatus('Failed to save notes', true);
      console.error('Error saving notes:', error);
    } finally {
      setSaving(false);
    }
  };

  const loadExperimentResults = async () => {
    if (!user) {
      showStatus('You need to be logged in to load experiment results', true);
      return;
    }
    
    try {
      setLoading(true);
      const response = await getExperimentResults(user.id, experimentId);
      if (response.success) {
        setSavedResults(response.results || []);
      }
    } catch (error) {
      showStatus('Failed to load experiment results', true);
      console.error('Error loading experiment results:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCurrentExperiment = async () => {
    if (!user) {
      showStatus('You need to be logged in to save experiment data', true);
      return;
    }
    
    try {
      setSaving(true);
      
      // Prepare input data
      const inputData = {
        selectedAcid,
        selectedBase,
        concentration
      };
      
      // Prepare output data
      const outputData = {
        volume,
        reactionComplete,
        measurements
      };
      
      const response = await saveExperimentResults(user.id, experimentId, inputData, outputData);
      
      if (response.success) {
        showStatus('Experiment data saved successfully');
        loadExperimentResults();
      }
    } catch (error) {
      showStatus('Failed to save experiment data', true);
      console.error('Error saving experiment data:', error);
    } finally {
      setSaving(false);
    }
  };

  const loadSelectedResult = () => {
    if (!selectedResult) {
      showStatus('No experiment result selected to load', true);
      return;
    }
    
    try {
      const result = savedResults.find(r => r.id === selectedResult);
      if (result) {
        onLoadSavedExperiment(result);
        showStatus('Experiment loaded successfully');
      }
    } catch (error) {
      showStatus('Failed to load experiment result', true);
      console.error('Error loading experiment result:', error);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-xl p-6 border border-[rgba(94,234,212,0.1)]">
      <h2 className="text-[#5EEAD4] text-xl font-semibold mb-6">Experiment Data & Notes</h2>
      
      {statusMessage && (
        <div className="mb-4 p-3 bg-[rgba(94,234,212,0.1)] text-[#5EEAD4] rounded-md border border-[rgba(94,234,212,0.2)]">
          {statusMessage}
        </div>
      )}  
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-[rgba(15,23,42,0.4)] to-[rgba(15,23,42,0.2)] p-4 rounded-lg border border-[rgba(94,234,212,0.1)]">
          <h3 className="text-[#5EEAD4] font-medium mb-3">Lab Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Take notes about your titration experiment, observations, and conclusions..."
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
        
        <div className="bg-gradient-to-br from-[rgba(15,23,42,0.4)] to-[rgba(15,23,42,0.2)] p-4 rounded-lg border border-[rgba(94,234,212,0.1)]">
          <h3 className="text-[#5EEAD4] font-medium mb-3">Experiment Data</h3>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-[rgba(15,23,42,0.3)] p-3 rounded-lg border border-[rgba(94,234,212,0.1)]">
              <span className="text-[#94a3b8] text-sm">Acid</span>
              <span className="text-[#5EEAD4] text-lg font-medium block">{selectedAcid}</span>
            </div>
            <div className="bg-[rgba(15,23,42,0.3)] p-3 rounded-lg border border-[rgba(94,234,212,0.1)]">
              <span className="text-[#94a3b8] text-sm">Base</span>
              <span className="text-[#5EEAD4] text-lg font-medium block">{selectedBase}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={saveCurrentExperiment}
              disabled={saving || !user}
              className="w-full px-4 py-2 bg-[rgba(94,234,212,0.1)] text-[#5EEAD4] rounded-md
              hover:bg-[rgba(94,234,212,0.2)] border border-[rgba(94,234,212,0.2)] hover:border-[#5EEAD4]
              disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {saving ? 'Saving...' : 'Save Current Experiment'}
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
                      {new Date(result.createdAt).toLocaleString()} - {result.input.selectedAcid} & {result.input.selectedBase}
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
                  Load Selected Experiment
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
