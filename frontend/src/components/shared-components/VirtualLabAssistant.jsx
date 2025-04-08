import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, BookOpen, HelpCircle, ClipboardCheck, Bot } from 'lucide-react';

export default function VirtualLabAssistant() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { 
      type: 'bot', 
      content: 'Hello! I\'m your Virtual Lab Assistant. I can help you with experiments, explain procedures, or quiz you on concepts. How can I help you today?' 
    }
  ]);
  const [activeTab, setActiveTab] = useState('chat');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulated knowledge base
  const knowledgeBase = {
    'titration': {
      procedure: [
        'Clean your burette with distilled water and rinse with the titrant.',
        'Fill the burette with the titrant and remove any air bubbles.',
        'Pipette a precise volume of the analyte into a clean conical flask.',
        'Add 2-3 drops of indicator to the analyte.',
        'Slowly add titrant while swirling the flask until the endpoint is reached.',
        'Record the final volume and calculate concentration using the formula: C₁V₁ = C₂V₂'
      ],
      faqs: [
        { 
          question: 'What is an indicator?', 
          answer: 'An indicator is a substance that changes color at the endpoint of a titration, signaling when the reaction is complete.' 
        },
        { 
          question: 'What is the endpoint?', 
          answer: 'The endpoint is the point at which the indicator changes color, signaling the completion of the reaction.' 
        },
        { 
          question: 'Why do we swirl the flask?', 
          answer: 'Swirling ensures proper mixing of the titrant and analyte, leading to a more accurate result.' 
        }
      ],
      quiz: [
        {
          question: 'What formula is used to calculate concentration in titration?',
          options: ['C₁V₁ = C₂V₂', 'PV = nRT', 'E = mc²', 'F = ma'],
          answer: 'C₁V₁ = C₂V₂'
        },
        {
          question: 'Which of these is NOT a common indicator in acid-base titrations?',
          options: ['Phenolphthalein', 'Methyl orange', 'Copper sulfate', 'Bromothymol blue'],
          answer: 'Copper sulfate'
        },
        {
          question: 'The color change that signals the reaction is complete is called:',
          options: ['Transition point', 'Endpoint', 'Equilibrium', 'Termination'],
          answer: 'Endpoint'
        }
      ]
    },
    'spectrophotometry': {
      procedure: [
        'Turn on the spectrophotometer and allow it to warm up for 15-20 minutes.',
        'Prepare blank and sample solutions according to your experiment protocol.',
        'Calibrate the instrument with the blank solution.',
        'Measure the absorbance of your samples at the appropriate wavelength.',
        'Create a calibration curve using standards of known concentration.',
        'Calculate the concentration of unknown samples using the Beer-Lambert Law: A = ɛcl'
      ],
      faqs: [
        { 
          question: 'What is Beer-Lambert Law?', 
          answer: 'The Beer-Lambert Law states that absorbance is directly proportional to concentration and path length: A = ɛcl, where ɛ is the molar absorptivity, c is concentration, and l is path length.' 
        },
        { 
          question: 'Why do we need a blank?', 
          answer: 'A blank solution contains everything except the analyte and is used to zero the instrument, accounting for background absorption.' 
        },
        { 
          question: 'How do I choose wavelength?', 
          answer: 'Select the wavelength at which your analyte has maximum absorbance for best sensitivity, typically determined by running a wavelength scan.' 
        }
      ],
      quiz: [
        {
          question: 'The Beer-Lambert Law is represented by which equation?',
          options: ['A = ɛcl', 'PV = nRT', 'E = hν', 'F = kx'],
          answer: 'A = ɛcl'
        },
        {
          question: 'What does a spectrophotometer measure?',
          options: ['Light absorption', 'Electrical conductivity', 'pH levels', 'Magnetic fields'],
          answer: 'Light absorption'
        },
        {
          question: 'What is the purpose of creating a calibration curve?',
          options: [
            'To determine unknown concentrations',
            'To adjust the spectrophotometer',
            'To test the cuvette',
            'To measure wavelength'
          ],
          answer: 'To determine unknown concentrations'
        }
      ]
    }
  };

  const experiments = Object.keys(knowledgeBase);

  const handleSend = () => {
    if (input.trim() === '') return;
    
    // Add user message
    setMessages([...messages, { type: 'user', content: input }]);
    processUserInput(input);
    setInput('');
  };

  const processUserInput = (text) => {
    setIsThinking(true);
    
    // Simulate processing delay
    setTimeout(() => {
      const lowerText = text.toLowerCase();
      
      // Check if asking about a specific experiment
      const matchedExperiment = experiments.find(exp => lowerText.includes(exp));
      
      if (lowerText.includes('quiz') || lowerText.includes('test')) {
        if (matchedExperiment) {
          startQuiz(matchedExperiment);
        } else {
          setMessages(prev => [...prev, { 
            type: 'bot', 
            content: 'I can quiz you on various experiments. Which one would you like to be tested on? Available experiments: ' + experiments.join(', ')
          }]);
        }
      } else if (lowerText.includes('procedure') || lowerText.includes('steps') || lowerText.includes('how to')) {
        if (matchedExperiment) {
          showProcedure(matchedExperiment);
        } else {
          setMessages(prev => [...prev, { 
            type: 'bot', 
            content: 'I can explain procedures for various experiments. Which one would you like to learn about? Available experiments: ' + experiments.join(', ')
          }]);
        }
      } else if (matchedExperiment) {
        // General info about the experiment
        setMessages(prev => [...prev, { 
          type: 'bot', 
          content: `I can help you with ${matchedExperiment}. Would you like to know the procedure, have me answer common questions, or take a quiz on this topic?`
        }]);
      } else if (lowerText.includes('hello') || lowerText.includes('hi ') || lowerText === 'hi') {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          content: 'Hello! How can I assist you with your lab work today? I can explain procedures, answer questions about experiments, or quiz you on your knowledge.'
        }]);
      } else if (lowerText.includes('help') || lowerText.includes('can you do')) {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          content: `I can help with the following experiments: ${experiments.join(', ')}. For each experiment, I can explain the procedure, answer frequently asked questions, or give you a quiz to test your knowledge.`
        }]);
      } else {
        // General response for unrecognized queries
        setMessages(prev => [...prev, { 
          type: 'bot', 
          content: `I'm not sure I understand what you're asking about. I can help with these experiments: ${experiments.join(', ')}. Would you like me to explain a procedure, answer questions, or give you a quiz?`
        }]);
      }
      
      setIsThinking(false);
    }, 1000);
  };

  const showProcedure = (experiment) => {
    const procedure = knowledgeBase[experiment].procedure;
    setMessages(prev => [...prev, { 
      type: 'bot', 
      content: `### ${experiment.charAt(0).toUpperCase() + experiment.slice(1)} Procedure\n\n${procedure.map((step, i) => `${i+1}. ${step}`).join('\n')}`
    }]);
  };

  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizComplete, setQuizComplete] = useState(false);

  const startQuiz = (experiment) => {
    setCurrentQuiz({
      experiment: experiment,
      questions: knowledgeBase[experiment].quiz,
      currentQuestion: 0
    });
    setQuizAnswers([]);
    setQuizComplete(false);
    
    setMessages(prev => [...prev, { 
      type: 'bot', 
      content: `Let's start a quiz on ${experiment}. I'll ask you ${knowledgeBase[experiment].quiz.length} questions.`
    }]);
    
    // Show first question
    const question = knowledgeBase[experiment].quiz[0];
    setMessages(prev => [...prev, { 
      type: 'quiz', 
      question: question.question,
      options: question.options,
      questionIndex: 0
    }]);
  };

  const handleOptionSelect = (questionIndex, selectedOption) => {
    if (!currentQuiz) return;
    
    const question = currentQuiz.questions[questionIndex];
    const isCorrect = selectedOption === question.answer;
    
    setQuizAnswers(prev => [...prev, { 
      question: question.question,
      selectedOption,
      correct: isCorrect
    }]);
    
    setMessages(prev => [...prev, {
      type: 'bot',
      content: isCorrect ? 
        `Correct! ${question.answer} is the right answer.` : 
        `That's not quite right. The correct answer is: ${question.answer}`
    }]);
    
    // Check if more questions exist
    if (questionIndex < currentQuiz.questions.length - 1) {
      const nextQuestion = currentQuiz.questions[questionIndex + 1];
      setMessages(prev => [...prev, { 
        type: 'quiz', 
        question: nextQuestion.question,
        options: nextQuestion.options,
        questionIndex: questionIndex + 1
      }]);
    } else {
      // Quiz complete
      completeQuiz();
    }
  };

  const completeQuiz = () => {
    setQuizComplete(true);
    const correctAnswers = quizAnswers.filter(a => a.correct).length;
    const totalQuestions = currentQuiz.questions.length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    
    setMessages(prev => [...prev, { 
      type: 'bot', 
      content: `Quiz complete! You scored ${correctAnswers}/${totalQuestions} (${percentage}%).`
    }]);
    
    setCurrentQuiz(null);
  };
  
  const switchTab = (tab) => {
    setActiveTab(tab);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-blue-900 text-white p-4 flex items-center shadow-md">
        <Bot className="h-6 w-6 mr-3 text-blue-200" />
        <h1 className="font-bold text-xl">Virtual Lab Assistant</h1>
      </div>
      
      {/* Tabs */}
      <div className="flex bg-blue-800 text-white font-medium">
        <button 
          className={`flex-1 py-3 px-4 flex items-center justify-center transition-colors ${activeTab === 'chat' ? 'bg-blue-700 border-b-2 border-blue-300' : 'hover:bg-blue-700'}`} 
          onClick={() => switchTab('chat')}
        >
          <MessageCircle size={18} className="mr-2 text-blue-200" /> Chat
        </button>
        <button 
          className={`flex-1 py-3 px-4 flex items-center justify-center transition-colors ${activeTab === 'procedures' ? 'bg-blue-700 border-b-2 border-blue-300' : 'hover:bg-blue-700'}`} 
          onClick={() => switchTab('procedures')}
        >
          <BookOpen size={18} className="mr-2 text-blue-200" /> Procedures
        </button>
        <button 
          className={`flex-1 py-3 px-4 flex items-center justify-center transition-colors ${activeTab === 'help' ? 'bg-blue-700 border-b-2 border-blue-300' : 'hover:bg-blue-700'}`} 
          onClick={() => switchTab('help')}
        >
          <HelpCircle size={18} className="mr-2 text-blue-200" /> Help
        </button>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {activeTab === 'chat' && (
          <>
            {messages.map((message, index) => (
              <div key={index}>
                {message.type === 'user' && (
                  <div className="flex justify-end mb-4">
                    <div className="bg-blue-600 text-white rounded-2xl py-3 px-4 max-w-xs shadow-sm">
                      {message.content}
                    </div>
                  </div>
                )}
                {message.type === 'bot' && (
                  <div className="flex mb-4">
                    <div className="relative">
                      <div className="absolute -left-2 -top-2 w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center shadow">
                        <Bot size={16} className="text-white" />
                      </div>
                      <div className="bg-white border border-gray-200 rounded-2xl py-3 px-5 pl-8 max-w-xs shadow-sm ml-4">
                        <div className="whitespace-pre-line text-gray-800">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {message.type === 'quiz' && (
                  <div className="flex mb-5">
                    <div className="relative">
                      <div className="absolute -left-2 -top-2 w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center shadow">
                        <ClipboardCheck size={16} className="text-white" />
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg py-4 px-5 pl-8 max-w-sm shadow-sm ml-4 w-full">
                        <div className="font-medium text-gray-800 mb-3">{message.question}</div>
                        <div className="space-y-2">
                          {message.options.map((option, i) => (
                            <button 
                              key={i}
                              className="w-full text-left py-3 px-4 bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-lg transition-colors flex items-center"
                              onClick={() => handleOptionSelect(message.questionIndex, option)}
                            >
                              <div className="w-6 h-6 rounded-full border-2 border-blue-800 flex items-center justify-center mr-3">
                                <span className="text-sm font-medium text-blue-800">{String.fromCharCode(65 + i)}</span>
                              </div>
                              <span className="text-gray-700">{option}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isThinking && (
              <div className="flex mb-4">
                <div className="relative">
                  <div className="absolute -left-2 -top-2 w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center shadow">
                    <Bot size={16} className="text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl py-3 px-4 pl-8 shadow-sm ml-4">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
        
        {activeTab === 'procedures' && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">Available Experiment Procedures</h2>
            {experiments.map((exp, index) => (
              <div key={index} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <h3 className="font-medium text-blue-800 mb-2 text-lg">{exp.charAt(0).toUpperCase() + exp.slice(1)}</h3>
                <p className="text-gray-600 mb-4">
                  {knowledgeBase[exp].procedure[0]}...
                </p>
                <button 
                  className="text-sm bg-blue-50 text-blue-800 py-2 px-4 rounded-md hover:bg-blue-100 transition-colors border border-blue-200 font-medium flex items-center"
                  onClick={() => {
                    switchTab('chat');
                    showProcedure(exp);
                  }}
                >
                  <BookOpen size={16} className="mr-2" />
                  View Full Procedure
                </button>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'help' && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">How to Use the Virtual Lab Assistant</h2>
            
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start">
                <MessageCircle className="text-blue-700 mr-3 mt-1" size={20} />
                <div>
                  <h3 className="font-medium text-blue-800 mb-2">Asking About Experiments</h3>
                  <p className="text-gray-700">
                    You can ask about any experiment by name. For example, "Tell me about titration" or "What is spectrophotometry?"
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start">
                <BookOpen className="text-blue-700 mr-3 mt-1" size={20} />
                <div>
                  <h3 className="font-medium text-blue-800 mb-2">Learning Procedures</h3>
                  <p className="text-gray-700">
                    Ask for specific steps by saying "Show me the titration procedure" or "How do I perform spectrophotometry?"
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start">
                <ClipboardCheck className="text-blue-700 mr-3 mt-1" size={20} />
                <div>
                  <h3 className="font-medium text-blue-800 mb-2">Taking Quizzes</h3>
                  <p className="text-gray-700">
                    Test your knowledge by saying "Quiz me on titration" or "I want to take a spectrophotometry test"
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start">
                <HelpCircle className="text-blue-700 mr-3 mt-1" size={20} />
                <div>
                  <h3 className="font-medium text-blue-800 mb-2">Available Experiments</h3>
                  <ul className="space-y-2 text-gray-700">
                    {experiments.map((exp, i) => (
                      <li key={i} className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-blue-400 mr-2"></div>
                        {exp.charAt(0).toUpperCase() + exp.slice(1)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Input area */}
      {activeTab === 'chat' && (
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex relative">
            <input
              className="flex-1 border border-gray-300 rounded-full py-3 px-5 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Ask about an experiment..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className="absolute right-1 top-1 bottom-1 bg-blue-900 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-blue-800 transition-colors"
              onClick={handleSend}
              disabled={!input.trim()}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}