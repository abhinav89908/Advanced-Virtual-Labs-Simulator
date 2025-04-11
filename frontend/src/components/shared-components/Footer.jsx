import { Beaker, Github, Mail, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6 sm:py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Column 1 */}
          <div>
            <div className="flex items-center space-x-2 mb-3 sm:mb-4">
              <Beaker className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-400" />
              <h2 className="text-base sm:text-lg font-bold">Virtual Lab</h2>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm">
              An advanced virtual laboratory simulation platform for collaborative learning and experimentation.
            </p>
          </div>
          
          {/* Column 2 */}
          <div className="mt-6 sm:mt-0">
            <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Quick Links</h3>
            <ul className="space-y-1 sm:space-y-2 text-gray-400 text-xs sm:text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Available Experiments</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>
          
          {/* Column 3 */}
          <div className="mt-6 md:mt-0">
            <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Connect With Us</h3>
            <div className="flex space-x-4 mb-3 sm:mb-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Mail className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm">
              Subscribe to our newsletter for updates on new experiments and features.
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-5 sm:mt-6 pt-4 sm:pt-6 text-xs sm:text-sm text-gray-400 flex flex-col sm:flex-row justify-between">
          <p>© {new Date().getFullYear()} Virtual Lab. All rights reserved.</p>
          <div className="flex space-x-4 mt-2 sm:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}