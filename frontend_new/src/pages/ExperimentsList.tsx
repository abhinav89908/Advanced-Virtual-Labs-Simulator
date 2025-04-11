
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Beaker, Microscope, Dna, TestTube, Atom, Book } from 'lucide-react';
import MainLayout from '@/components/MainLayout';

// Mock experiments data
const experiments = [
  {
    id: 'titration',
    title: 'Acid-Base Titration',
    description: 'Learn about acid-base reactions and endpoint determination with pH indicators.',
    icon: <TestTube className="h-10 w-10 text-lab-blue" />,
    difficulty: 'Beginner',
    category: 'Chemistry'
  },
  {
    id: 'spectrophotometry',
    title: 'Spectrophotometry',
    description: 'Analyze chemical compounds by measuring light absorption at different wavelengths.',
    icon: <Microscope className="h-10 w-10 text-lab-purple" />,
    difficulty: 'Intermediate',
    category: 'Chemistry'
  },
  {
    id: 'dna-extraction',
    title: 'DNA Extraction',
    description: 'Extract DNA from plant cells and visualize the results.',
    icon: <Dna className="h-10 w-10 text-lab-purple" />,
    difficulty: 'Advanced',
    category: 'Biology'
  },
  {
    id: 'pendulum',
    title: 'Simple Pendulum',
    description: 'Study the periodic motion of a pendulum and calculate gravitational acceleration.',
    icon: <Atom className="h-10 w-10 text-lab-blue" />,
    difficulty: 'Beginner',
    category: 'Physics'
  },
  {
    id: 'microbiology',
    title: 'Bacterial Culture',
    description: 'Culture and identify bacterial colonies using agar plates and staining techniques.',
    icon: <Beaker className="h-10 w-10 text-lab-purple" />,
    difficulty: 'Advanced',
    category: 'Biology'
  },
  {
    id: 'circuits',
    title: 'Electric Circuits',
    description: 'Build and analyze series and parallel circuits to understand Ohm\'s law.',
    icon: <Atom className="h-10 w-10 text-lab-blue" />,
    difficulty: 'Intermediate',
    category: 'Physics'
  }
];

const ExperimentsList = () => {
  return (
    <MainLayout>
      <div className="container py-8">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-lab-blue to-lab-purple bg-clip-text text-transparent">
              Available Experiments
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Select an experiment to join or create a collaborative room. Work together with other students to complete lab procedures in a virtual environment.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {experiments.map((experiment) => (
              <Card key={experiment.id} className="transition-all hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    {experiment.icon}
                    <div className="flex items-center space-x-1">
                      <span className="text-xs bg-primary/10 text-primary py-1 px-2 rounded-full">{experiment.difficulty}</span>
                      <span className="text-xs bg-muted text-muted-foreground py-1 px-2 rounded-full">{experiment.category}</span>
                    </div>
                  </div>
                  <CardTitle className="mt-2">{experiment.title}</CardTitle>
                  <CardDescription>{experiment.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground space-x-2">
                    <Book size={16} />
                    <span>Comprehensive lab procedures and guidance</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link to={`/experiment/${experiment.id}`} className="w-full">
                    <Button className="w-full">Start Experiment</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ExperimentsList;
