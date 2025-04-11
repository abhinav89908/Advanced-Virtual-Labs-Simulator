
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Beaker, Users, MessageSquare, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border">
        <div className="container py-4 flex items-center justify-between">
          <Link to="/">
            <div className="flex items-center space-x-2">
              <Beaker className="h-6 w-6 text-lab-blue" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-lab-blue to-lab-purple bg-clip-text text-transparent">
                Virtual Lab Collaborative Room
              </h1>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-1">
            <Link to="/">
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <Home size={16} />
                <span>Home</span>
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <Beaker size={16} />
              <span>Labs</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <Users size={16} />
              <span>Collaborators</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <MessageSquare size={16} />
              <span>Chat</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <Settings size={16} />
              <span>Settings</span>
            </Button>
          </nav>
        </div>
      </header>
      
      <main className="flex-1">
        {children}
      </main>
      
      <footer className="border-t border-border">
        <div className="container py-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Beaker className="h-6 w-6 text-lab-blue" />
                <h3 className="text-xl font-bold">Virtual Lab</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                An advanced virtual laboratory simulation platform for collaborative learning and experimentation.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link></li>
                <li><Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Available Experiments</Link></li>
                <li><Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Documentation</Link></li>
                <li><Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Support</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Connect With Us</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Subscribe to our newsletter for updates on new experiments and features.
              </p>
              <div className="flex space-x-2">
                <Button variant="outline" size="icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </Button>
                <Button variant="outline" size="icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                </Button>
                <Button variant="outline" size="icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
