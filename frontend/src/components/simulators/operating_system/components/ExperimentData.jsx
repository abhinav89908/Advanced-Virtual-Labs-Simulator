import React, { useState, useEffect, useContext } from 'react';
import { 
  saveExperimentNotes, 
  getExperimentNotes, 
  saveExperimentResults, 
  getExperimentResults 
} from '../../../../services/experimentService';
import { UserContext } from '../../../hooks/userContext';
import { Save, FileText, Download, Upload } from 'lucide-react';

const ExperimentData = ({ 
  processes,
  algorithm,
  timeQuantum,
  executionHistory,
  completedProcesses,
  currentTime,
  onLoadSavedExperiment,
  experimentId = 'operating-system-scheduler' 
}) => {
  const { user } = useContext(UserContext);
  const [notes, setNotes] = useState('');
  const [noteId, setNoteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedResults, setSavedResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);

  // Load notes when component mounts
  useEffect(() => {
    if (user) {
      loadNotes();
      loadExperimentResults();
    }
  }, [user]);

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
      alert('You need to be logged in to save notes');
      return;
    }
    
    try {
      setSaving(true);
      const response = await saveExperimentNotes(user.id, experimentId, notes, noteId);
      if (response.success) {
        setNoteId(response.noteId);
        alert('Notes saved successfully');
      }
    } catch (error) {
      alert('Failed to save notes');
      console.error('Error saving notes:', error);
    } finally {
      setSaving(false);
    }
  };

  const loadExperimentResults = async () => {
    if (!user) {
      alert('You need to be logged in to load experiment results');
      return;
    }
    
    try {
      setLoading(true);
      const response = await getExperimentResults(user.id, experimentId);
      if (response.success) {
        setSavedResults(response.results || []);
      }
    } catch (error) {
      alert('Failed to load experiment results');
      console.error('Error loading experiment results:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCurrentExperiment = async () => {
    if (!user) {
      alert('You need to be logged in to save experiment data');
      return;
    }
    
    if (processes.length === 0) {
      alert('No processes to save');
      return;
    }
    
    try {
      setSaving(true);
      
      // Prepare input data
      const inputData = {
        processes: processes.map(process => ({
          id: process.id,
          name: process.name,
          arrivalTime: process.arrivalTime,
          burstTime: process.burstTime,
          priority: process.priority,
          color: process.color
        })),
        algorithm,
        timeQuantum,
      };
      
      // Prepare output data
      const outputData = {
        executionHistory,
        completedProcesses,
        currentTime,
        metrics: {
          avgWaitingTime: calculateAverageWaitingTime(),
          avgTurnaroundTime: calculateAverageTurnaroundTime()
        }
      };
      
      const response = await saveExperimentResults(user.id, experimentId, inputData, outputData);
      
      if (response.success) {
        alert('Experiment data saved successfully');
        loadExperimentResults();
      }
    } catch (error) {
      alert('Failed to save experiment data');
      console.error('Error saving experiment data:', error);
    } finally {
      setSaving(false);
    }
  };

  const loadSelectedResult = () => {
    if (!selectedResult) {
      alert('No experiment result selected to load');
      return;
    }
    
    try {
      const result = savedResults.find(r => r.id === selectedResult);
      if (result) {
        onLoadSavedExperiment(result);
      }
    } catch (error) {
      alert('Failed to load experiment result');
      console.error('Error loading experiment result:', error);
    }
  };

  // Helper function for metrics calculation
  const calculateAverageWaitingTime = () => {
    if (completedProcesses.length === 0) return 0;
    const sum = completedProcesses.reduce((acc, p) => acc + p.waitingTime, 0);
    return (sum / completedProcesses.length).toFixed(2);
  };
  
  const calculateAverageTurnaroundTime = () => {
    if (completedProcesses.length === 0) return 0;
    const sum = completedProcesses.reduce((acc, p) => acc + p.turnaroundTime, 0);
    return (sum / completedProcesses.length).toFixed(2);
  };

  return (
    <div className="bg-[#1e293b] rounded-xl shadow-sm p-6 mb-6 border border-[rgba(94,234,212,0.1)]">
      <h3 className="text-[#5EEAD4] text-lg font-semibold mb-4">Experiment Data & Notes</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notes Section */}
        <div>
          <div className="flex items-center mb-2"> 
            <FileText className="h-4 w-4 text-[#94a3b8] mr-2" />
            <h4 className="text-[#f1f5f9] font-medium">Lab Notes</h4>
          </div>
          <textarea
            className="w-full h-40 p-3 bg-[rgba(15,23,42,0.3)] border border-[rgba(94,234,212,0.2)] rounded-md text-[#f1f5f9] focus:border-[#5EEAD4] focus:ring-[rgba(94,234,212,0.2)] placeholder-[#94a3b8]"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Take notes about the scheduling algorithms, their performance, and your observations..."
            disabled={loading || !user}
          ></textarea>
          <div className="mt-2 flex justify-end">
            <button
              onClick={saveNotes}
              disabled={saving || loading || !user}
              className="px-4 py-2 bg-[rgba(94,234,212,0.1)] text-[#5EEAD4] rounded-md hover:bg-[rgba(94,234,212,0.2)] border border-[rgba(94,234,212,0.2)] hover:border-[#5EEAD4] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </div>

        {/* Saved Results Section */}
        <div>
          <div className="flex items-center mb-2">
            <Download className="h-4 w-4 text-[#94a3b8] mr-2" />
            <h4 className="text-[#f1f5f9] font-medium">Saved Experiments</h4>
          </div>
          <div className="space-y-3">
            <button
              onClick={saveCurrentExperiment}
              disabled={saving || !user || processes.length === 0}
              className="w-full px-4 py-2 bg-[rgba(94,234,212,0.1)] text-[#5EEAD4] rounded-md hover:bg-[rgba(94,234,212,0.2)] border border-[rgba(94,234,212,0.2)] hover:border-[#5EEAD4] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Current Experiment'}
            </button>

            <button
              onClick={loadExperimentResults}
              disabled={loading || !user}
              className="w-full px-4 py-2 bg-[rgba(94,234,212,0.1)] text-[#5EEAD4] rounded-md hover:bg-[rgba(94,234,212,0.2)] border border-[rgba(94,234,212,0.2)] hover:border-[#5EEAD4] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Upload className="h-4 w-4 mr-2" />
              {loading ? 'Loading...' : 'Load Saved Experiments'}
            </button>

            {savedResults.length > 0 && (
              <div className="space-y-2">
                <select
                  className="block w-full px-3 py-2 bg-[rgba(15,23,42,0.3)] border border-[rgba(94,234,212,0.2)] rounded-md text-[#f1f5f9] focus:border-[#5EEAD4] focus:ring-[rgba(94,234,212,0.2)]"
                  value={selectedResult || ''}
                  onChange={(e) => setSelectedResult(e.target.value)}
                >
                  <option value="">-- Select a saved experiment --</option>
                  {savedResults.map(result => (
                    <option key={result.id} value={result.id}>
                      {new Date(result.createdAt).toLocaleString()} - {result.input.algorithm.toUpperCase()}
                    </option>
                  ))}
                </select>

                <button
                  onClick={loadSelectedResult}
                  disabled={!selectedResult}
                  className="w-full px-4 py-2 bg-[rgba(94,234,212,0.1)] text-[#5EEAD4] rounded-md hover:bg-[rgba(94,234,212,0.2)] border border-[rgba(94,234,212,0.2)] hover:border-[#5EEAD4] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Load Selected Experiment
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {!user && (
        <div className="mt-4 p-3 bg-[rgba(94,234,212,0.1)] border border-[rgba(94,234,212,0.2)] rounded-md text-sm text-[#5EEAD4]">
          Please login to save and load experiment data.
        </div>
      )}
    </div>
  );
};

export default ExperimentData;
