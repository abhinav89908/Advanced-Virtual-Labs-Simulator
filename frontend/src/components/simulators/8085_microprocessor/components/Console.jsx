import React, { useEffect, useRef } from 'react';

/**
 * Console component to display execution logs and messages
 */
const Console = ({ logs }) => {
    const consoleEndRef = useRef(null);
    
    // Auto-scroll to the bottom when new logs are added
    useEffect(() => {
        if (consoleEndRef.current) {
            consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    return (
        <div className="console-view">
            <h3>Console</h3>
            <div className="console-container">
                {logs.length === 0 ? (
                    <div className="console-empty">Console output will appear here</div>
                ) : (
                    <div className="console-output">
                        {logs.map((log, index) => (
                            <div key={index} className="console-line">
                                <span className="console-prompt">{'>'}</span>
                                <span className={`console-message ${log.type || 'info'}`}>
                                    {log.message}
                                </span>
                            </div>
                        ))}
                        <div ref={consoleEndRef} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Console;
