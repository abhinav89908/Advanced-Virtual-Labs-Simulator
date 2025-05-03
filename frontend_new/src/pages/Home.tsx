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
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b dark:border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-indigo-950 z-0"></div>
        <div className="noise-pattern absolute inset-0 opacity-[0.15] z-[1]"></div>
        <div className="container relative z-10 py-24 px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text">
              Lab Sync Collaborate
            </h1>
            <p className="text-xl sm:text-2xl leading-relaxed mb-8 text-gray-700 dark:text-gray-300">
              Experience interactive virtual labs with real-time collaboration. 
              Perfect for students and educators to conduct scientific experiments remotely.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-500 hover:from-indigo-700 hover:to-purple-600 text-white">
                <Link to="/experiment/titration">Try Featured Lab</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2">
                <a href="#experiments">Browse All Labs</a>
              </Button>
            </div>
          </div>
          <div className="mt-12 relative max-w-5xl mx-auto">
            <div className="rounded-lg overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800">
              <img 
                src="/images/lab-main-home.png" 
                alt="Virtual Lab Environment" 
                className="w-full h-auto object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
            </div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl z-0"></div>
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl z-0"></div>
          </div>
        </div>
      </section>

      {/* Experiments Section */}
      <section id="experiments" className="py-16 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Available Experiments</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Choose from our range of virtual experiments across different scientific disciplines. 
              All labs support real-time collaboration.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {experimentsList.map((experiment) => (
              <Card key={experiment.id} className="overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-md hover:shadow-xl transition-shadow duration-300">
                <div className="aspect-video bg-muted relative">
                  <img 
                    src={experiment.image} 
                    alt={experiment.title}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl text-gray-800 dark:text-gray-100">{experiment.title}</CardTitle>
                  <CardDescription className="line-clamp-2 text-gray-600 dark:text-gray-400">{experiment.description}</CardDescription>
                </CardHeader>
                <CardFooter className="pt-2">
                  <Button asChild className="w-full bg-gradient-to-r from-indigo-600 to-purple-500 hover:from-indigo-700 hover:to-purple-600 text-white">
                    <Link to={`/experiment/${experiment.id}`}>
                      Start Experiment
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Home;
