
import React, { useState } from 'react';
import { useLabAssistant, Experiment } from '@/context/LabAssistantContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CheckCircle, HelpCircle, BookOpen, Beaker } from 'lucide-react';

const LabAssistant: React.FC = () => {
  const { 
    experiments, 
    currentExperiment, 
    setCurrentExperiment, 
    checkAnswer,
    quizProgress
  } = useLabAssistant();
  
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizResults, setQuizResults] = useState<boolean[]>([]);
  const [activeTab, setActiveTab] = useState<string>('experiments');

  const handleExperimentSelect = (experiment: Experiment) => {
    setCurrentExperiment(experiment);
    setSelectedAnswers([]);
    setQuizResults([]);
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleSubmitAnswer = (questionIndex: number) => {
    if (selectedAnswers[questionIndex] === undefined) return;
    
    const result = checkAnswer(questionIndex, selectedAnswers[questionIndex]);
    const newResults = [...quizResults];
    newResults[questionIndex] = result;
    setQuizResults(newResults);
  };

  const getExperimentProgress = (experimentId: string): number => {
    const progress = quizProgress[experimentId];
    if (!progress) return 0;
    
    const correctCount = progress.filter(Boolean).length;
    const totalQuestions = experiments.find(e => e.id === experimentId)?.quiz.length || 0;
    
    return totalQuestions ? Math.round((correctCount / totalQuestions) * 100) : 0;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Beaker className="h-5 w-5 text-lab-purple" />
            Virtual Lab Assistant
          </CardTitle>
          <CardDescription>
            Select an experiment to get guidance, procedures, and test your knowledge
          </CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Available Experiments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {experiments.map(experiment => (
                  <div
                    key={experiment.id}
                    onClick={() => handleExperimentSelect(experiment)}
                    className={`p-3 border rounded-md cursor-pointer transition-colors ${
                      currentExperiment?.id === experiment.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                    }`}
                  >
                    <div className="font-medium">{experiment.title}</div>
                    <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {experiment.description}
                    </div>
                    {getExperimentProgress(experiment.id) > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Progress: {getExperimentProgress(experiment.id)}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          {currentExperiment ? (
            <Card>
              <CardHeader>
                <CardTitle>{currentExperiment.title}</CardTitle>
                <CardDescription>{currentExperiment.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="experiments" className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>Procedure</span>
                    </TabsTrigger>
                    <TabsTrigger value="quiz" className="flex items-center gap-1">
                      <HelpCircle className="h-4 w-4" />
                      <span>Quiz</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="experiments">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-3">Experiment Procedure</h3>
                        <ol className="list-decimal pl-5 space-y-2">
                          {currentExperiment.procedure.map((step, index) => (
                            <li key={index} className="pl-1">
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="quiz">
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium">Knowledge Check</h3>
                      
                      {currentExperiment.quiz.map((quizItem, questionIndex) => (
                        <div key={questionIndex} className="p-4 border rounded-md">
                          <h4 className="font-medium mb-3">
                            Question {questionIndex + 1}: {quizItem.question}
                          </h4>
                          
                          <RadioGroup
                            value={selectedAnswers[questionIndex]?.toString()}
                            onValueChange={(value) => handleAnswerSelect(questionIndex, parseInt(value))}
                            className="space-y-2"
                            disabled={quizResults[questionIndex] !== undefined}
                          >
                            {quizItem.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-start space-x-2">
                                <RadioGroupItem value={optionIndex.toString()} id={`q${questionIndex}-a${optionIndex}`} />
                                <Label
                                  htmlFor={`q${questionIndex}-a${optionIndex}`}
                                  className="cursor-pointer"
                                >
                                  {option}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                          
                          {quizResults[questionIndex] === undefined ? (
                            <Button
                              onClick={() => handleSubmitAnswer(questionIndex)}
                              className="mt-3"
                              disabled={selectedAnswers[questionIndex] === undefined}
                              size="sm"
                            >
                              Submit Answer
                            </Button>
                          ) : (
                            <div className={`p-3 mt-3 rounded-md ${
                              quizResults[questionIndex] ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                              {quizResults[questionIndex] ? (
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-5 w-5" />
                                  <span>Correct answer!</span>
                                </div>
                              ) : (
                                <div>
                                  <p>Incorrect. The correct answer is: {quizItem.options[quizItem.correctAnswer]}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <Beaker className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Select an experiment from the list to see its details.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabAssistant;
