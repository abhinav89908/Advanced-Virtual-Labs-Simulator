import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Experiment data (same as in ExperimentRoom.tsx)
const experimentsList = [
  {
    id: 'titration',
    title: 'Acid-Base Titration',
    description: 'In this lab, you will learn to perform a titration to determine the concentration of an unknown acid or base solution.',
    image: '/images/experiments/titration.png',
  },
  {
    id: 'spectrophotometry',
    title: 'Spectrophotometry',
    description: 'This lab teaches you to use a spectrophotometer to determine the concentration of colored compounds in solution.',
    image: '/images/experiments/spectrophotometry.png',
  },
  {
    id: 'dna-extraction',
    title: 'DNA Extraction',
    description: 'Extract DNA from plant cells and visualize the results using simple laboratory equipment.',
    image: '/placeholder.svg',
  },
  {
    id: 'pendulum',
    title: 'Simple Pendulum',
    description: 'Investigate the relationship between pendulum length and period to calculate gravitational acceleration.',
    image: '/placeholder.svg',
  },
  {
    id: 'microbiology',
    title: 'Bacterial Culture',
    description: 'Learn aseptic techniques to culture and identify bacterial colonies.',
    image: '/placeholder.svg',
  },
  {
    id: 'circuits',
    title: 'Electric Circuits',
    description: 'Build and analyze series and parallel circuits to understand Ohm\'s law.',
    image: '/placeholder.svg',
  }
];

const Home = () => {
  return (
    <MainLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Available Experiments</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {experimentsList.map((experiment) => (
            <Card key={experiment.id} className="overflow-hidden">
              <div className="aspect-video bg-muted relative">
                <img 
                  src={experiment.image} 
                  alt={experiment.title}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>
              <CardHeader>
                <CardTitle>{experiment.title}</CardTitle>
                <CardDescription className="line-clamp-2">{experiment.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link to={`/experiment/${experiment.id}`}>
                    Start Experiment
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Home;
