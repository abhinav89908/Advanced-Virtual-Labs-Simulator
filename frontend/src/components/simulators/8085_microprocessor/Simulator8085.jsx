import React, { useState, useEffect } from 'react';
import Editor from './components/Editor';
import RegisterView from './components/RegisterView';
import FlagsView from './components/FlagsView';
import MemoryView from './components/MemoryView';
import Console from './components/Console';
import CPU from './logic/CPU';
import Assembler from './logic/Assembler';
import './simulator8085.css';

const Simulator = () => {
    // Initialize CPU and Assembler
    const [cpu] = useState(new CPU());
    const [assembler] = useState(new Assembler());
    
    // State for parsed program
    const [program, setProgram] = useState([]);
    const [currentInstruction, setCurrentInstruction] = useState(null);
    
    // CPU state
    const [cpuState, setCpuState] = useState({
        registers: cpu.registers,
        flags: cpu.flags,
        halted: false,
        running: false
    });
    
    // Memory update trigger for real-time memory view updates
    const [memoryUpdateTrigger, setMemoryUpdateTrigger] = useState(0);
    
    // Console logs
    const [logs, setLogs] = useState([]);
    
    // Section visibility state
    const [openSection, setOpenSection] = useState('');
    
    // Add a log message to the console
    const addLog = (message, type = 'info') => {
        setLogs(prev => [...prev, { message, type, timestamp: Date.now() }]);
    };
    
    // Handle code loading
    const handleLoadCode = (code) => {
        try {
            // Parse the code
            const parsedProgram = assembler.parseCode(code);
            
            // Reset CPU
            cpu.reset();
            
            // Check for errors
            const errors = parsedProgram.filter(instruction => instruction.error);
            if (errors.length > 0) {
                addLog(`Parsing errors found:`, 'error');
                errors.forEach(error => {
                    addLog(`Line ${error.lineNumber}: ${error.errorMessage}`, 'error');
                });
                return;
            }
            
            setProgram(parsedProgram);
            setCurrentInstruction(parsedProgram.length > 0 ? 0 : null);
              // Update CPU state
            setCpuState({
                registers: { ...cpu.registers },
                flags: { ...cpu.flags },
                halted: false,
                running: false
            });
            
            // Trigger memory view update
            setMemoryUpdateTrigger(prev => prev + 1);
            
            addLog(`Code loaded: ${parsedProgram.length} instructions ready for execution`, 'success');
        } catch (error) {
            addLog(`Failed to load code: ${error.message}`, 'error');
        }
    };
    
    // Execute a single instruction
    const executeStep = () => {
        if (currentInstruction === null || currentInstruction >= program.length || cpu.halted) {
            return;
        }
        
        try {
            // Get the current instruction
            const instruction = program[currentInstruction];
            
            // Execute it
            const result = cpu.executeInstruction(instruction);
            
            // Log the result
            if (result.executed) {
                addLog(`Executed: ${instruction.raw}`, 'info');
            } else {
                addLog(result.message, 'error');
            }
            
            // Update the current instruction
            if (instruction.mnemonic === 'JMP') {
                // For JMP, find the instruction at the jump address
                const jumpAddress = parseInt(instruction.operands[0], 16);
                const nextInstructionIndex = program.findIndex(inst => inst.address === jumpAddress);
                setCurrentInstruction(nextInstructionIndex !== -1 ? nextInstructionIndex : null);
            } else if (!cpu.halted) {
                // For other instructions, move to the next one
                setCurrentInstruction(prev => prev + 1);
            }
              // Update CPU state
            setCpuState({
                registers: { ...cpu.registers },
                flags: { ...cpu.flags },
                halted: cpu.halted,
                running: cpu.running
            });
            
            // Trigger memory view update
            setMemoryUpdateTrigger(prev => prev + 1);
            
            // If we reached the end of the program
            if (currentInstruction + 1 >= program.length && !cpu.halted) {
                addLog('Program execution completed', 'success');
                cpu.halted = true;
            }
        } catch (error) {
            addLog(`Execution error: ${error.message}`, 'error');
            cpu.halted = true;
            setCpuState(prev => ({ ...prev, halted: true }));
        }
    };
      // Run the entire program
    const runProgram = () => {
        if (program.length === 0 || currentInstruction === null || cpu.halted) {
            return;
        }
        
        setCpuState(prev => ({ ...prev, running: true }));
        
        // Use setTimeout to allow UI to update before execution
        setTimeout(() => {
            try {
                // Create a local copy of program instructions for execution
                const programLength = program.length;
                let currentInstrIndex = currentInstruction;
                let isHalted = cpu.halted;

                // Execute until halted or end of program
                while (currentInstrIndex !== null && currentInstrIndex < programLength && !isHalted) {
                    // Get the current instruction
                    const instruction = program[currentInstrIndex];
                    
                    // Execute it
                    const result = cpu.executeInstruction(instruction);
                    
                    // Log the result
                    if (result.executed) {
                        addLog(`Executed: ${instruction.raw}`, 'info');
                    } else {
                        addLog(result.message, 'error');
                    }
                    
                    // Handle JMP instruction or move to next instruction
                    if (instruction.mnemonic === 'JMP') {
                        const jumpAddress = parseInt(instruction.operands[0], 16);
                        const nextInstructionIndex = program.findIndex(inst => inst.address === jumpAddress);
                        currentInstrIndex = nextInstructionIndex !== -1 ? nextInstructionIndex : null;
                    } else if (!cpu.halted) {
                        // For other instructions, move to the next one
                        currentInstrIndex++;
                    }
                    
                    // Update halt status
                    isHalted = cpu.halted;
                    
                    // If we reached the end of the program
                    if (currentInstrIndex >= programLength && !isHalted) {
                        cpu.halted = true;
                        isHalted = true;
                    }
                }
                  // Update the current instruction state after completing execution
                setCurrentInstruction(currentInstrIndex);
                
                // Trigger memory view update after all instructions have been executed
                setMemoryUpdateTrigger(prev => prev + 1);
                
                addLog('Program execution completed', 'success');
            } catch (error) {
                addLog(`Runtime error: ${error.message}`, 'error');
            } finally {
                setCpuState(prev => ({ ...prev, running: false }));
            }
        }, 100);
    };    // Reset the simulator
    const resetSimulator = () => {
        cpu.reset();
        setCurrentInstruction(program.length > 0 ? 0 : null);
        setCpuState({
            registers: { ...cpu.registers },
            flags: { ...cpu.flags },
            halted: false,
            running: false
        });
        // Trigger memory view update to show zeroed memory
        setMemoryUpdateTrigger(prev => prev + 1);
        addLog('Simulator reset - memory cleared to zeros', 'info');
    };
    
    // Get memory range from CPU
    const getMemory = (start, length) => {
        return cpu.getMemory(start, length);
    };
    
    // Update the CPU state whenever it changes
    useEffect(() => {
        setCpuState({
            registers: { ...cpu.registers },
            flags: { ...cpu.flags },
            halted: cpu.halted,
            running: cpu.running
        });
    }, [cpu.registers, cpu.flags, cpu.halted, cpu.running]);      
    
    
    return (
        <div className="simulator-page">
            <div className="simulator">
                <div className="simulator-header">
                    <h2>8085 Microprocessor Simulator</h2>
                    <p className="simulator-subtitle">Interactive Educational Emulator</p>
                </div>
                <div className="simulator-container">
                    {/* Left Panel with Collapsible Sections */}
                    <div className="simulator-left-panel">
                        <div className={`collapsible-section ${openSection === 'registers' ? 'open' : ''}`}>
                            <div 
                                className="collapsible-header"
                                onClick={() => setOpenSection(openSection === 'registers' ? '' : 'registers')}
                            >
                                Registers
                            </div>
                            <div className={`collapsible-content ${openSection === 'registers' ? 'open' : ''}`}>
                                <RegisterView registers={cpuState.registers} />
                            </div>
                        </div>

                        <div className="collapsible-section">
                            <div 
                                className="collapsible-header"
                                onClick={() => setOpenSection(openSection === 'flags' ? '' : 'flags')}
                            >
                                Flags
                            </div>
                            <div className={`collapsible-content ${openSection === 'flags' ? 'open' : ''}`}>
                                <FlagsView flags={cpuState.flags} />
                            </div>
                        </div>

                        <div className="collapsible-section">
                            <div 
                                className="collapsible-header"
                                onClick={() => setOpenSection(openSection === 'memory' ? '' : 'memory')}
                            >
                                Memory View
                            </div>
                            <div className={`collapsible-content ${openSection === 'memory' ? 'open' : ''}`}>
                                <MemoryView getMemory={getMemory} memoryUpdateTrigger={memoryUpdateTrigger} />
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="main-content-area">
                        <Editor onLoad={handleLoadCode} />
                        <Console 
                            logs={logs}
                            onRun={runProgram}
                            onStep={executeStep}
                            onReset={resetSimulator}
                            isHalted={cpuState.halted}
                            isRunning={cpuState.running}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Simulator;