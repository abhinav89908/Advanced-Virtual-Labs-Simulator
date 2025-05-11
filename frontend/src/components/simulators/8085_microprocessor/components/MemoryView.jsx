import React, { useState } from 'react';

/**
 * MemoryView component to display and interact with the memory
 */
const MemoryView = ({ memory, getMemory }) => {
    const [startAddress, setStartAddress] = useState('2100');
    const [memoryData, setMemoryData] = useState({});
    const [error, setError] = useState('');

    // Format a byte value to hexadecimal with padding
    const formatByte = (value) => {
        if (typeof value === 'string') return value;
        return value.toString(16).padStart(2, '0').toUpperCase();
    };

    // Convert and validate hexadecimal input
    const handleAddressChange = (e) => {
        const input = e.target.value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
        setStartAddress(input);
        setError('');
    };

    // View memory at the specified address
    const handleViewMemory = () => {
        try {
            const address = parseInt(startAddress, 16);
            if (isNaN(address) || address < 0 || address > 0xFFFF) {
                setError('Invalid address. Must be between 0000H and FFFFH');
                return;
            }
            
            const memoryRange = getMemory(address, 64);
            setMemoryData(memoryRange);
            setError('');
        } catch (e) {
            setError(`Error: ${e.message}`);
        }
    };

    return (
        <div className="memory-view">
            <h3>Memory View</h3>
            <div className="memory-controls">
                <div className="address-input">
                    <label htmlFor="memory-address">Address:</label>
                    <input
                        id="memory-address"
                        type="text"
                        value={startAddress}
                        onChange={handleAddressChange}
                        maxLength={4}
                        placeholder="0000"
                    />
                    <span className="address-suffix">H</span>
                </div>
                <button onClick={handleViewMemory} className="btn btn-secondary">
                    View Memory
                </button>
            </div>
            
            {error && <div className="memory-error">{error}</div>}
            
            <div className="memory-container">
                <table className="memory-table">
                    <thead>
                        <tr>
                            <th></th>
                            {[...Array(16).keys()].map(i => (
                                <th key={i}>{i.toString(16).toUpperCase()}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(memoryData).length > 0 && 
                            [...Array(4).keys()].map(row => {
                                const baseAddress = parseInt(startAddress, 16) + (row * 16);
                                const rowPrefix = baseAddress.toString(16).padStart(4, '0').toUpperCase();
                                
                                return (
                                    <tr key={rowPrefix}>
                                        <td className="address-cell">{rowPrefix}0</td>
                                        {[...Array(16).keys()].map(col => {
                                            const address = (baseAddress + col).toString(16).padStart(4, '0').toUpperCase();
                                            return (
                                                <td key={col} className={`memory-cell ${memoryData[address] ? 'has-value' : ''}`}>
                                                    {memoryData[address] ? formatByte(memoryData[address]) : '00'}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })
                        }
                        {Object.keys(memoryData).length === 0 && (
                            <tr>
                                <td colSpan="17" className="memory-empty">
                                    Enter an address and click "View Memory"
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MemoryView;
