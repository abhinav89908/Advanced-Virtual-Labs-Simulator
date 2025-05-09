import { useState } from 'react';
import { X, User, Mail, Lock, AlertCircle, CheckCircle, Loader } from 'lucide-react';

export default function StudentRegistration({ onClose, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    agreeToTerms: false
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState(null); // null, 'success', 'error'
  const [statusMessage, setStatusMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.studentId.trim()) {
      newErrors.studentId = 'Student ID is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }
    
    setIsSubmitting(true);
    setRegistrationStatus(null);
    setStatusMessage('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Here you would normally make a fetch/axios call to your registration API
      console.log('Registration data:', formData);
      
      // Simulate successful registration
      setRegistrationStatus('success');
      setStatusMessage('Registration successful! You can now log in.');
      
      // Automatically switch to login after 2 seconds
      setTimeout(() => {
        onSwitchToLogin();
      }, 2000);
      
    } catch (error) {
      setRegistrationStatus('error');
      setStatusMessage('Registration failed. Please try again later.');
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Student Registration</h2>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      
      {registrationStatus && (
        <div className={`mb-4 p-3 ${registrationStatus === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'} border rounded-md flex items-start`}>
          {registrationStatus === 'success' ? (
            <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          )}
          <span>{statusMessage}</span>
        </div>
      )}
      
      <div className="space-y-4">
        {/* Name fields (first and last) */}
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
          <div className="flex-1">
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="firstName">
              First Name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              className={`block w-full px-3 py-2 border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
              placeholder="John"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>
          
          <div className="flex-1">
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="lastName">
              Last Name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              className={`block w-full px-3 py-2 border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
              placeholder="Doe"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>
        </div>
        
        {/* Email field */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`block w-full pl-10 pr-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
              placeholder="your.email@example.com"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>
        
        {/* Student ID field */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="studentId">
            Student ID
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="studentId"
              name="studentId"
              type="text"
              value={formData.studentId}
              onChange={handleChange}
              className={`block w-full pl-10 pr-3 py-2 border ${errors.studentId ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
              placeholder="e.g., S12345678"
            />
          </div>
          {errors.studentId && (
            <p className="mt-1 text-sm text-red-600">{errors.studentId}</p>
          )}
        </div>
        
        {/* Password field */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className={`block w-full pl-10 pr-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
              placeholder="••••••••"
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">Password must be at least 8 characters</p>
        </div>
        
        {/* Confirm Password field */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`block w-full pl-10 pr-3 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
              placeholder="••••••••"
            />
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>
        
        {/* Terms and Conditions */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="agreeToTerms"
              name="agreeToTerms"
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              className={`h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded ${errors.agreeToTerms ? 'border-red-500' : ''}`}
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="agreeToTerms" className="font-medium text-gray-700">
              I agree to the <a href="#" className="text-indigo-600 hover:text-indigo-500">Terms and Conditions</a> and <a href="#" className="text-indigo-600 hover:text-indigo-500">Privacy Policy</a>
            </label>
            {errors.agreeToTerms && (
              <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms}</p>
            )}
          </div>
        </div>
        
        {/* Registration Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70"
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
              Registering...
            </span>
          ) : 'Register'}
        </button>
        
        {/* Login link */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign in instead
            </button>
          </p>
        </div>
      </div>
    </div>
  )};