import { useState } from 'react';
import { ArrowRight, Beaker, BookOpen, CheckCircle, Users, MessageCircle, Bot, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ResponsiveHeader from './shared-components/Header';
import StudentLogin from './LoginPage';
import StudentRegistration from './RegistrationPage';

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const navigate = useNavigate();
  
  const toggleLoginModal = () => {
    setShowLogin(!showLogin);
    if (showRegistration) setShowRegistration(false);
  };
  
  const toggleRegistrationModal = () => {
    setShowRegistration(!showRegistration);
    if (showLogin) setShowLogin(false);
  };

  const navigateToSimulator = () => {
    navigate('/simulator/8085');
  };

  const handleAssistantToggle = (isOpen) => {
    console.log("Assistant is now:", isOpen ? "open" : "closed");
  };

  const features = [
    {
      icon: <Beaker className="h-10 w-10 text-indigo-500" />,
      title: "Interactive Experiments",
      description: "Perform virtual experiments with real-time simulations and accurate scientific models."
    },
    {
      icon: <Users className="h-10 w-10 text-indigo-500" />,
      title: "Collaborative Learning",
      description: "Work together with classmates in real-time, sharing observations and results."
    },
    {
      icon: <BookOpen className="h-10 w-10 text-indigo-500" />,
      title: "Comprehensive Resources",
      description: "Access lab manuals, tutorials, and reference materials directly in the platform."
    },
    {
      icon: <MessageCircle className="h-10 w-10 text-indigo-500" />,
      title: "Instant Communication",
      description: "Chat with teammates and instructors for immediate feedback and guidance."
    },
    {
      icon: <Bot className="h-10 w-10 text-indigo-500" />,
      title: "Virtual Lab Assistant",
      description: "Get AI-powered help with experiments, procedures, and scientific concepts."
    },
    {
      icon: <CheckCircle className="h-10 w-10 text-indigo-500" />,
      title: "Progress Tracking",
      description: "Monitor your lab work progress and receive personalized feedback."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <ResponsiveHeader 
        isConnected={isConnected} 
        isConnecting={isConnecting}
        onAssistantToggle={handleAssistantToggle}
      />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                Experience Science<br />
                <span className="text-[#75aede]">Virtually Anywhere</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Access state-of-the-art laboratory experiments from your device. 
                Learn, collaborate, and discover without limitations.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
                <button 
                  onClick={toggleLoginModal}
                  className="px-6 py-3 bg-[#75aede] text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
                >
                  Student Login <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <button 
                  onClick={toggleRegistrationModal}
                  className="px-6 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-center"
                >
                  Register Now
                </button>
              </div>
              <div className="flex items-center">
                <button 
                  onClick={navigateToSimulator}
                  className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                >
                  <Cpu className="mr-2 h-5 w-5" />
                  Try the 8085 Simulator
                </button>
                <span className="ml-3 text-sm text-gray-500">No login required</span>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="relative">
                <div className="absolute -left-4 -top-4 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute -right-4 -bottom-4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute left-20 bottom-8 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                <div className="relative">
                  <img 
                    src="/images/experiment.png"
                    alt="Virtual lab demonstration" 
                    className="rounded-lg shadow-xl object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Why Choose Virtual Labs?</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our platform provides all the tools you need to conduct experiments, 
              collaborate with peers, and enhance your scientific learning journey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-6 bg-gray-50 rounded-xl hover:shadow-md transition-shadow">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 bg-gradient-to-b from-indigo-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">How Virtual Labs Work</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Getting started is simple. Register, browse available labs, and begin experimenting in minutes.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0 md:space-x-4">
            <div className="w-full md:w-1/3 text-center px-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-800 text-xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2">Create an Account</h3>
              <p className="text-gray-600">Register with your student credentials to access the full platform.</p>
            </div>
            <div className="w-full md:w-1/3 text-center px-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-800 text-xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2">Choose Your Lab</h3>
              <p className="text-gray-600">Browse our catalog of experiments across various scientific disciplines.</p>
            </div>
            <div className="w-full md:w-1/3 text-center px-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-800 text-xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2">Start Experimenting</h3>
              <p className="text-gray-600">Conduct experiments individually or collaborate with classmates in real-time.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-[#75aede] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Learning Experience?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of students already using Virtual Labs to enhance their scientific education.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button 
              onClick={toggleRegistrationModal}
              className="px-8 py-3 bg-white text-indigo-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Register Now
            </button>
            <button 
              onClick={toggleLoginModal}
              className="px-8 py-3 border-2 border-white text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Student Login
            </button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center space-x-2 mb-4">
                <Beaker className="h-8 w-8 text-indigo-400" />
                <h3 className="text-xl font-bold text-white">Virtual Labs</h3>
              </div>
              <p className="max-w-xs">
                Transforming science education through accessible, interactive virtual experiments.
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div>
                <h4 className="text-white font-semibold mb-4">Navigation</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Labs</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Resources</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Tutorials</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Contact</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Feedback</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Partnership</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-12 pt-8 text-center">
            <p>&copy; {new Date().getFullYear()} Virtual Labs. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <StudentLogin onClose={toggleLoginModal} onSwitchToRegister={toggleRegistrationModal} />
          </div>
        </div>
      )}
      
      {/* Registration Modal */}
      {showRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <StudentRegistration onClose={toggleRegistrationModal} onSwitchToLogin={toggleLoginModal} />
          </div>
        </div>
      )}
    </div>
  );
}