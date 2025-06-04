import React, { useState, useEffect, useContext } from 'react';
import { 
  saveExperimentNotes, 
  getExperimentNotes, 
  saveExperimentResults, 
  getExperimentResults 
} from '../../../../services/experimentService';
import { UserContext } from '../../../hooks/userContext';
import { Save } from 'lucide-react';

const ExperimentData = ({ 
  devices,
  connections,
  terminalOutput,
  simulationSettings,
  onLoadSavedExperiment,
  addLog,
  experimentId = 'computer-networks' 
}) => {
  const { user } = useContext(UserContext);
  const [notes, setNotes] = useState('');
  const [noteId, setNoteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedResults, setSavedResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Load notes when component mounts
  useEffect(() => {
    if (user) {
      loadNotes();
      loadExperimentResults(); // Also load saved experiments on mount
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
      addLog('You need to be logged in to save notes', 'error');
      return;
    }
    
    try {
      setSaving(true);
      const response = await saveExperimentNotes(user.id, experimentId, notes, noteId);
      if (response.success) {
        setNoteId(response.noteId);
        addLog('Notes saved successfully', 'system');
      }
    } catch (error) {
      addLog('Failed to save notes', 'error');
      console.error('Error saving notes:', error);
    } finally {
      setSaving(false);
    }
  };

  const loadExperimentResults = async () => {
    if (!user) {
      addLog('You need to be logged in to load experiment results', 'error');
      return;
    }
    
    try {
      setLoading(true);
      const response = await getExperimentResults(user.id, experimentId);
      if (response.success) {
        setSavedResults(response.results || []);
        if (response.results.length > 0) {
          addLog(`Loaded ${response.results.length} saved experiment results`, 'system');
        } else {
          addLog('No saved experiment results found', 'system');
        }
      }
    } catch (error) {
      addLog('Failed to load experiment results', 'error');
      console.error('Error loading experiment results:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCurrentExperiment = async () => {
    if (!user) {
      addLog('You need to be logged in to save experiment data', 'error');
      return;
    }
    
    if (devices.length === 0) {
      addLog('No network devices to save', 'error');
      return;
    }
    
    try {
      setSaving(true);
      
      // Prepare input data (network topology)
      const inputData = {
        devices: devices.map(device => ({
          id: device.id,
          name: device.name,
          type: device.type,
          x: device.x,
          y: device.y,
          ip: device.ip,
          mac: device.mac
        })),
        connections: connections.map(conn => ({
          from: conn.from,
          to: conn.to,
          latency: conn.latency,
          bandwidth: conn.bandwidth,
          packetLoss: conn.packetLoss
        }))
      };
      
      // Prepare output data (simulation settings and terminal output)
      const outputData = {
        simulationSettings,
        terminalOutput: terminalOutput.slice(-20) // Last 20 log entries
      };
      
      const response = await saveExperimentResults(user.id, experimentId, inputData, outputData);
      
      if (response.success) {
        addLog('Experiment data saved successfully', 'system');
        // Refresh the list of saved results
        loadExperimentResults();
      }
    } catch (error) {
      addLog('Failed to save experiment data', 'error');
      console.error('Error saving experiment data:', error);
    } finally {
      setSaving(false);
    }
  };

  const loadSelectedResult = () => {
    if (!selectedResult) {
      addLog('No experiment result selected to load', 'error');
      return;
    }
    
    try {
      // Find the selected result from saved results
      const result = savedResults.find(r => r.id === selectedResult);
      if (result) {
        addLog(`Loading experiment result from ${new Date(result.createdAt).toLocaleString()}`, 'system');
        
        // Call the parent component's function to load the saved experiment
        onLoadSavedExperiment(result);
        
        addLog(`Successfully loaded network with ${result.input.devices?.length || 0} devices and ${result.input.connections?.length || 0} connections`, 'system');
      }
    } catch (error) {
      addLog('Failed to load experiment result', 'error');
      console.error('Error loading experiment result:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      addLog(`Selected file: ${file.name}`, 'system');
    } else {
      setSelectedFile(null);
    }
  };

  const handleLoad = async () => {
    if (!selectedFile) return;
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target.result;
        addLog('Loaded file content', 'system');
        
        // Here you would typically parse the file content and load the experiment data
        // For example, if the file is in JSON format:
        try {
          const data = JSON.parse(content);
          addLog('Parsed JSON data from file', 'system');
          
          // You can now use this data to set up your experiment
          // For example:
          // setDevices(data.devices);
          // setConnections(data.connections);
          // setTerminalOutput(data.terminalOutput);
          // setSimulationSettings(data.simulationSettings);
          
          addLog('Experiment data loaded from file', 'system');
        } catch (jsonError) {
          addLog('Failed to parse JSON data from file', 'error');
          console.error('JSON parsing error:', jsonError);
        }
      };
      
      reader.readAsText(selectedFile);
    } catch (error) {
      addLog('Failed to load file', 'error');
      console.error('Error loading file:', error);
    }
  };

  return (
    <div className="bg-[rgba(30,41,59,0.98)] rounded-xl shadow-sm p-6 border border-[rgba(94,234,212,0.1)]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-[rgb(94,234,212)]">
          Experiment Data
        </h3>
        <button
          onClick={saveCurrentExperiment}
          disabled={saving || !user}
          className={`flex items-center space-x-2 px-4 py-2 bg-[rgba(94,234,212,0.1)] text-[rgb(94,234,212)] rounded-lg border border-[rgba(94,234,212,0.2)] hover:bg-[rgba(94,234,212,0.2)] transition-all duration-300 ${
            saving || !user
              ? 'cursor-not-allowed opacity-50'
              : ''
          }`}
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Saving...' : 'Save Experiment'}</span>
        </button>
      </div>

      <div className="space-y-6">
        {/* Network Configuration */}
        <div className="bg-[rgba(15,23,42,0.5)] rounded-lg p-4 border border-[rgba(94,234,212,0.1)]">
          <h4 className="font-medium text-[rgb(94,234,212)] mb-3">Network Configuration</h4>
          <div className="space-y-2 text-sm text-[#f1f5f9]">
            <pre className="bg-[rgba(15,23,42,0.3)] p-3 rounded overflow-x-auto">
              {JSON.stringify(devices, null, 2)}
            </pre>
          </div>
        </div>

        {/* Connection Data */}
        <div className="bg-[rgba(15,23,42,0.5)] rounded-lg p-4 border border-[rgba(94,234,212,0.1)]">
          <h4 className="font-medium text-[rgb(94,234,212)] mb-3">Connection Data</h4>
          <div className="space-y-2 text-sm text-[#f1f5f9]">
            <pre className="bg-[rgba(15,23,42,0.3)] p-3 rounded overflow-x-auto">
              {JSON.stringify(connections, null, 2)}
            </pre>
          </div>
        </div>

        {/* Terminal History */}
        <div className="bg-[rgba(15,23,42,0.5)] rounded-lg p-4 border border-[rgba(94,234,212,0.1)]">
          <h4 className="font-medium text-[rgb(94,234,212)] mb-3">Terminal History</h4>
          <div className="max-h-40 overflow-y-auto">
            {terminalOutput.map((line, i) => (
              <div 
                key={i}
                className={`text-sm mb-1 ${
                  line.type === 'command' 
                    ? 'text-[rgb(94,234,212)]' 
                    : line.type === 'error'
                      ? 'text-red-400'
                      : line.type === 'system'
                        ? 'text-[rgb(94,234,212)]'
                        : 'text-[#f1f5f9]'
                }`}
              >
                {line.content}
              </div>
            ))}
          </div>
        </div>

        {/* Load Experiment Section */}
        <div className="bg-[rgba(15,23,42,0.5)] rounded-lg p-4 border border-[rgba(94,234,212,0.1)]">
          <h4 className="font-medium text-[rgb(94,234,212)] mb-3">Load Experiment</h4>
          <div className="space-y-3">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".json"
              className="block w-full text-sm text-[#f1f5f9] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[rgba(94,234,212,0.1)] file:text-[rgb(94,234,212)] hover:file:bg-[rgba(94,234,212,0.2)] file:transition-all file:duration-300"
            />
            <button
              onClick={handleLoad}
              disabled={!selectedFile}
              className={`w-full py-2 px-4 rounded-lg transition-all duration-300 ${
                selectedFile
                  ? 'bg-[rgba(94,234,212,0.1)] text-[rgb(94,234,212)] hover:bg-[rgba(94,234,212,0.2)]'
                  : 'bg-[rgba(148,163,184,0.1)] text-[#94a3b8] cursor-not-allowed'
              }`}
            >
              Load Selected File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperimentData;
