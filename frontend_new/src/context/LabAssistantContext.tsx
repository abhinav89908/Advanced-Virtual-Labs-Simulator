
import React, { createContext, useContext, useState } from 'react';

// Define experiment types and their data
export interface Experiment {
  id: string;
  title: string;
  description: string;
  procedure: string[];
  quiz: {
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
}

interface LabAssistantContextType {
  currentExperiment: Experiment | null;
  experiments: Experiment[];
  setCurrentExperiment: (experiment: Experiment | null) => void;
  checkAnswer: (questionIndex: number, answerIndex: number) => boolean;
  quizProgress: { [key: string]: boolean[] };
}

const LabAssistantContext = createContext<LabAssistantContextType>({
  currentExperiment: null,
  experiments: [],
  setCurrentExperiment: () => {},
  checkAnswer: () => false,
  quizProgress: {},
});

export const useLabAssistant = () => useContext(LabAssistantContext);

const EXPERIMENTS: Experiment[] = [
  {
    id: 'titration',
    title: 'Acid-Base Titration',
    description: 'Learn how to determine the concentration of an acid or base by precisely neutralizing it with a standard solution of base or acid.',
    procedure: [
      'Prepare your burette with the standard solution.',
      'Add a precise volume of the unknown solution to an Erlenmeyer flask.',
      'Add 2-3 drops of indicator to the flask.',
      'Slowly add the standard solution from the burette to the flask.',
      'Stop when the indicator changes color (endpoint).',
      'Record the volume used from the burette.',
      'Calculate the concentration using the equation: C₁V₁ = C₂V₂.',
    ],
    quiz: [
      {
        question: 'What does the endpoint in a titration indicate?',
        options: [
          'The point where all the acid has been used up',
          'The point where the indicator changes color',
          'The point where the acid and base have reacted in equivalent amounts',
          'The point where the pH is exactly 7'
        ],
        correctAnswer: 2
      },
      {
        question: 'Which equation is used to calculate the concentration in a titration?',
        options: [
          'C₁V₁ = C₂V₂',
          'PV = nRT',
          'E = mc²',
          'F = ma'
        ],
        correctAnswer: 0
      },
      {
        question: 'What is the purpose of the indicator in a titration?',
        options: [
          'To make the solution look pretty',
          'To increase the reaction rate',
          'To visually signal when the endpoint has been reached',
          'To prevent contamination'
        ],
        correctAnswer: 2
      }
    ]
  },
  {
    id: 'spectrophotometry',
    title: 'UV-Vis Spectrophotometry',
    description: 'Learn how to determine the concentration of compounds in solution by measuring how much light they absorb.',
    procedure: [
      'Prepare a series of standard solutions with known concentrations.',
      'Prepare your sample solution with unknown concentration.',
      'Measure the absorbance of each standard solution at the appropriate wavelength.',
      'Plot a calibration curve of absorbance vs. concentration.',
      'Measure the absorbance of your unknown sample.',
      'Use the calibration curve to determine the concentration of your unknown sample.'
    ],
    quiz: [
      {
        question: 'What does Beer\'s Law describe?',
        options: [
          'The relationship between temperature and pressure',
          'The relationship between absorbance and concentration',
          'The relationship between mass and energy',
          'The relationship between voltage and current'
        ],
        correctAnswer: 1
      },
      {
        question: 'Why is a calibration curve necessary in spectrophotometry?',
        options: [
          'To calibrate the wavelength of the instrument',
          'To account for instrument drift',
          'To relate absorbance measurements to concentration values',
          'To ensure the sample is pure'
        ],
        correctAnswer: 2
      },
      {
        question: 'What happens if the concentration of a sample is too high for spectrophotometry?',
        options: [
          'The absorbance will be negative',
          'The instrument will break',
          'The relationship between absorbance and concentration becomes non-linear',
          'Nothing, higher concentrations always give better results'
        ],
        correctAnswer: 2
      }
    ]
  }
];

export const LabAssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentExperiment, setCurrentExperiment] = useState<Experiment | null>(null);
  const [quizProgress, setQuizProgress] = useState<{ [key: string]: boolean[] }>({});

  const checkAnswer = (questionIndex: number, answerIndex: number): boolean => {
    if (!currentExperiment) return false;
    
    const isCorrect = currentExperiment.quiz[questionIndex].correctAnswer === answerIndex;
    
    if (isCorrect) {
      setQuizProgress(prev => {
        const experimentProgress = prev[currentExperiment.id] || 
          Array(currentExperiment.quiz.length).fill(false);
        
        experimentProgress[questionIndex] = true;
        
        return {
          ...prev,
          [currentExperiment.id]: experimentProgress
        };
      });
    }
    
    return isCorrect;
  };

  return (
    <LabAssistantContext.Provider
      value={{
        currentExperiment,
        experiments: EXPERIMENTS,
        setCurrentExperiment,
        checkAnswer,
        quizProgress,
      }}
    >
      {children}
    </LabAssistantContext.Provider>
  );
};
