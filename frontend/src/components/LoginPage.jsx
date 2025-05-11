import { useState, useContext } from 'react';
import { X, User, Lock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './hooks/userContext';

export default function StudentLogin({ onClose, onSwitchToRegister }) {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSuccess = (userData) => {
    // Store user data in context and localStorage
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('isLoggedIn', 'true');
    
    // Close the modal and redirect
    onClose();
    navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setLoginError('');

    try {
      const response = await fetch('http://localhost:3000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');

      // Extract user data from response
      const userData = {
        email: formData.email,
        name: data.name || formData.email.split('@')[0],
        id: data.id || 'user-id',
      };

      handleLoginSuccess(userData);
    } catch (error) {
      setLoginError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoginError('');
    // try {
    //   const provider = new GoogleAuthProvider();
    //   const idToken = await result.user.getIdToken();

    //   const response = await fetch('http://localhost:3000/api/users/auth/google', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ idToken })
    //   });

    //   const text = await response.text();
    //   let data;
    //   try {
    //     data = text ? JSON.parse(text) : {};
    //   } catch (e) {
    //     console.error('Failed to parse JSON:', text);
    //     throw new Error('Invalid response from server');
    //   }

    //   if (!response.ok) {
    //     throw new Error(data.message || 'Google login failed');
    //   }

    //   // Create user data object from Google info
    //   const userData = {
    //     id: uid,
    //     // Add any other user data from the response
    //   };

    //   handleLoginSuccess(userData);
    // } catch (error) {
    //   console.error('Google login error:', error);
    //   setLoginError(error.message || 'Google login failed');
    // }
    setLoginError('Google login is not implemented yet.');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Student Login</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close">
          <X className="h-6 w-6" />
        </button>
      </div>

      {loginError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{loginError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`pl-10 pr-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} w-full rounded-md`}
              placeholder="your@email.com"
            />
          </div>
          {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className={`pl-10 pr-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} w-full rounded-md`}
              placeholder="••••••••"
            />
          </div>
          {errors.password && <p className="text-red-600 text-sm">{errors.password}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 px-4 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 disabled:opacity-70"
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <button
        onClick={handleGoogleLogin}
        className="mt-4 w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
      >
        <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" className="h-5 w-5 mr-2" />
        Sign in with Google
      </button>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <button onClick={onSwitchToRegister} className="text-indigo-600 font-medium hover:underline">
            Register now
          </button>
        </p>
      </div>
    </div>
  );
}