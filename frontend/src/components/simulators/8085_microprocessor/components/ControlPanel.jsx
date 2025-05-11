import React from 'react';

/**
 * ControlPanel component with execution control buttons
 */
const ControlPanel = ({ onRun, onStep, onReset, isHalted, isRunning }) => {
    return (
        <div className="control-panel">
            <h3>Controls</h3>
            <div className="control-buttons">
                <button 
                    onClick={onRun} 
                    className="btn btn-primary"
                    disabled={isHalted || isRunning}
                >
                    Run
                </button>
                <button 
                    onClick={onStep} 
                    className="btn btn-secondary"
                    disabled={isHalted || isRunning}
                >
                    Step
                </button>
                <button 
                    onClick={onReset} 
                    className="btn btn-danger"
                >
                    Reset
                </button>
            </div>
            <div className="execution-status">
                {isHalted && <span className="status halted">CPU Halted</span>}
                {isRunning && <span className="status running">Running...</span>}
                {!isHalted && !isRunning && <span className="status ready">Ready</span>}
            </div>
        </div>
    );
};

export default ControlPanel;
